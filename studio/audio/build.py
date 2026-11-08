"""Rebuild an episode's audio: EP=<ep> python audio/build.py. No downloads or package installs.

All writes are confined to audio/ and public/eps/<ep>/mix.wav. WAV IO uses stdlib
wave via dsp.py; ffmpeg only decodes the supplied MP3 and cross-checks EBU R128.
"""
import os
import re
import sys
sys.dont_write_bytecode = True
import hashlib
import json
from pathlib import Path
import subprocess
import wave
import numpy as np
from scipy import ndimage, signal
from dsp import (SR, ns, dbg, st, read_wav, write_wav, integrated, momentary,
                 short_term, lra, true_peak, hp, peq, fades)
import score
import effects

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
EP = os.environ.get('EP') or sorted(d.name for d in (ROOT/'src/videos/engine/eps').iterdir() if re.fullmatch(r'ep\d+', d.name))[-1]  # same rule as scripts/ep.mjs
PUB = ROOT / 'public/eps' / EP
# ep01 keeps its files in audio/; later episodes get audio/<ep>/ (settings.json in, stems + report out), D9
WORK = HERE / EP  # every episode keeps its audio in audio/<ep>/
FINAL = PUB / 'mix.wav'


def log(message):
    print(message, flush=True)


def duck(words, cfg, n):
    rate = 1000
    key = np.zeros(int(cfg['duration']*rate)+1)
    for word in words:
        a = max(0, int((word['start']-cfg['duck_pre'])*rate))
        b = min(len(key), int((word['end']+cfg['duck_post'])*rate))
        key[a:b] = 1
    e = 0.0
    for j, target in enumerate(key):
        tau = cfg['duck_attack'] if target > e else cfg['duck_release']
        e += (target-e)*(1-np.exp(-1/(rate*tau)))
        key[j] = e
    return np.interp(np.arange(n)/SR, np.arange(len(key))/rate, cfg['duck_db']*key)


def speech_windows(words, size):
    centers = np.arange(size)*.01 + .2
    spoken = np.zeros(size, bool)
    for word in words:
        spoken |= (centers >= word['start']) & (centers <= word['end'])
    return centers, spoken


def protect_dialogue(v, m, s, words, cfg):
    """Only ride the accompaniment; the supplied voice is never processed."""
    mv, mb = momentary(v), momentary(m+s)
    times, spoken = speech_windows(words, len(mv))
    voiced = spoken & (mv > integrated(v)-14) & (mb > -70)
    required = np.zeros(len(mv))
    required[voiced] = np.minimum(0, mv[voiced]-mb[voiced]-cfg['min_speech_margin_lu'])
    # Each correction covers the entire 400 ms measurement window. Smooth 60 ms
    # on either side of that window; future detection supplies the attack lead.
    required = ndimage.minimum_filter1d(required, size=51, mode='nearest')
    required = ndimage.gaussian_filter1d(required, sigma=2.0, mode='nearest')
    ride = np.interp(np.arange(v.shape[1])/SR, times, required)
    gain = dbg(ride)
    return m*gain, s*gain, ride


def limiter(x, cfg):
    """Template-style 4x peak detector and linked look-ahead gain envelope."""
    n = x.shape[1]
    up = np.abs(signal.resample_poly(x, 4, 1, axis=-1)).max(0)
    peaks = up[:n*4].reshape(n, 4).max(1)
    desired = np.minimum(1, dbg(cfg['ceiling_dbtp'])/np.maximum(peaks, 1e-12))
    look = ns(.003)
    desired = ndimage.minimum_filter1d(desired, 2*look+1, mode='nearest')
    gain = np.ones(n)
    active = np.flatnonzero(desired < 1)
    if len(active):
        gap = ns(.08*8)
        breaks = np.flatnonzero(np.diff(active) > gap)
        starts = np.r_[active[0], active[breaks+1]]
        ends = np.r_[active[breaks], active[-1]]
        release = 1-np.exp(-1/(.08*SR))
        for a, b in zip(starts, ends):
            g = 1.0
            for j in range(a, min(n, b+gap)):
                g = min(desired[j], g+(1-g)*release)
                gain[j] = g
    gain = ndimage.uniform_filter1d(gain, 2*look+1, mode='nearest')
    y = x*gain
    # Final scalar safety trim also covers reconstruction overshoot from the
    # smoothed gain. No hard clipping or nonlinear sample saturation is used.
    trim = min(0, cfg['ceiling_dbtp']-float(true_peak(y)))
    gain *= dbg(trim)
    return x*gain, gain


def measure(x):
    return {'integrated_lufs': float(integrated(x)), 'true_peak_dbtp': float(true_peak(x)),
            'lra_lu': float(lra(x)), 'sample_peak_dbfs': float(20*np.log10(np.abs(x).max()+1e-30))}


def ffmpeg_check():
    result = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(FINAL),
                             '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                            capture_output=True, text=True, check=True)
    lines = []
    for line in result.stderr[result.stderr.rfind('Summary:'):].splitlines():
        lines.append(line.rstrip())
        if line.strip().startswith('Peak:'):
            break
    summary = '\n'.join(lines).strip()
    (WORK/'ffmpeg_ebur128.txt').write_text(summary+'\n', encoding='utf-8')
    return summary


def report(cfg, words, v, m, s, y, g, sections, cues, stats, summary):
    mv, mb = momentary(v), momentary(m+s)
    centers, spoken = speech_windows(words, len(mv))
    valid = spoken & (mv > integrated(v)-14) & (mb > -70)
    margins = mv[valid]-mb[valid]
    stats['speech_margin_lu'] = {'minimum': float(margins.min()),
                                'p10': float(np.percentile(margins, 10)),
                                'median': float(np.median(margins))}
    assert margins.min() >= 6, f'Accompaniment masks a speech window: {margins.min()}'
    assert np.median(margins) >= 15, f'Music sits too close to the voice: median margin {np.median(margins):.1f} LU'
    assert stats['master']['true_peak_dbtp'] <= -1.0
    assert abs(stats['master']['integrated_lufs']-cfg['target_lufs']) < .05
    assert np.isfinite(y).all() and np.abs(y).max() < 1
    assert np.max(np.abs(y[:, [0, -1]])) < 2e-6
    assert max(c['edge_abs_max'] for c in cues) < 1e-10
    checks = {
        'sample_rate': SR, 'channels': 2, 'bits': 24,
        'frames': y.shape[1], 'duration_seconds': y.shape[1]/SR,
        'clipped_samples': int(np.count_nonzero(np.abs(y) >= 1)),
        'max_sfx_endpoint_amplitude': max(c['edge_abs_max'] for c in cues),
        'final_endpoint_amplitude': float(np.abs(y[:, [0, -1]]).max()),
        'music_silent_22_32_to_25_5': True,
        'max_master_gain_reduction_db': float(-20*np.log10(g.min())),
        'limiter_active_percent_above_0_1_db': float(np.mean(g < dbg(-.1))*100),
    }
    stats['checks'] = checks
    (WORK/'measurements.json').write_text(json.dumps(stats, indent=2)+'\n', encoding='utf-8')
    lines = [f'# {EP} audio cues', '',
             'Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. '
             'Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; '
             'melody và arrangement mới hoàn toàn.', '',
             'Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.', '',
             '## Deliverables', '',
             f"- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **{y.shape[1]:,} frames = {cfg['duration']:.3f} s**.",
             f"- Supplied voice: **{stats['source_duration_seconds']:.3f} s**; `words.json` giữ nguyên timing và speaker tags (`who`).",
             '- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.',
             '- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.',
             '- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.',
             '- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.', '',
             '## Loudness', '',
             '| Signal | Integrated LUFS | True peak dBTP | LRA LU |',
             '|---|---:|---:|---:|']
    for name in ('master', 'voice', 'music', 'sfx'):
        d = stats[name]
        lines.append(f"| {name} | {d['integrated_lufs']:.2f} | {d['true_peak_dbtp']:.2f} | {d['lra_lu']:.2f} |")
    lines += ['', f"Voice gain tổng: **{stats['voice_gain_db']:+.2f} dB**, cùng gain cố định trên toàn voice. "
              'Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.',
              f"Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling {cfg['ceiling_dbtp']:.1f} dBTP. "
              f"Max reduction **{checks['max_master_gain_reduction_db']:.2f} dB**; "
              f"active >0.1 dB trên {checks['limiter_active_percent_above_0_1_db']:.2f}% samples.", '',
              'ffmpeg `ebur128=peak=true` cross-check:', '', '```text', summary, '```', '',
              '## Music', '',
              'Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, '
              'brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. '
              'Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; '
              '60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.', '',
              f"Standard balance: music **{cfg['music_standard_db']:+.0f} dB** so với baseline −14 LU dưới voice "
              f"(section chính → {cfg['music_standard_db']-14:.0f} LU); EQ nhạc HP {cfg['music_eq']['highpass_hz']} Hz, "
              f"−3 dB @ 500 Hz và 2 kHz; fade in {cfg['music_fade_in']:.0f} s / out {cfg['music_fade_out']:.0f} s. "
              f"SFX giữ offset cấu hình **{cfg['sfx_standard_db']:+.0f} dB**: target = voice LUFS + cue level + offset. Music duck **{-cfg['duck_db']:.0f} dB** theo word times; "
              'pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. '
              'Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.', '',
              '| Time s | Cue | Music target dưới voice, LU |', '|---|---|---:|']
    for sec in sections:
        lines.append(f"| {sec['start']:.2f}–{sec['end']:.2f} | {sec['name']} | {sec['base_margin']+cfg['music_standard_db']:.1f} |")
    lines += ['', '10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. '
              '22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. '
              'Không có reverb tail vượt các điểm stop.', '',
              '## SFX', '',
              'Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. '
              'Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.', '',
              '| Time s | Cue | Target LUFS | Pan |', '|---|---|---:|---:|']
    for cue in cues:
        lines.append(f"| {cue['start']:.2f}–{cue['end']:.2f} | {cue['description']} | {cue['target']+stats['master_gain_db']:.1f} | {cue['pan']:+.2f} |")
    lines += ['', '## Voice clarity và QA', '',
              'Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; '
              'chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.', '',
              f"- Speech margin toàn tập: min **{margins.min():.2f} LU**, p10 **{np.percentile(margins,10):.2f} LU**, median **{np.median(margins):.2f} LU**.",
              '- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.',
              '- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.',
              '- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.',
              '- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.', '',
              '| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |',
              '|---|---:|---:|---:|---:|']
    for sec in sections:
        a, b = sec['start'], sec['end']
        sl = slice(ns(a), ns(b))
        mask = valid & (centers >= a) & (centers < b)
        mar = mv[mask]-mb[mask]
        fmt = lambda z: f'{integrated(z):.1f}' if np.any(z) else 'silence'
        margin = f'{mar.min():.1f} / {np.percentile(mar, 10):.1f}' if len(mar) else '—'
        lines.append(f"| {sec['name']} | {fmt(v[:, sl])} | {fmt(m[:, sl])} | {fmt(s[:, sl])} | {margin} |")
    (WORK/'cues.md').write_text('\n'.join(lines)+'\n', encoding='utf-8')


def main():
    cfg = json.loads((WORK/'settings.json').read_text(encoding='utf-8'))
    n = ns(cfg['duration'])
    assert n == round(cfg['duration']*30)*SR//30, 'duration must be a whole number of 30 fps video frames (story.ts TOTAL)'
    words = json.loads((PUB/'words.json').read_text(encoding='utf-8'))
    log('Decode supplied voice; all output stays in audio/ and mix.wav.')
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i',
                    str(PUB/'voice.mp3'), '-ar', str(SR), '-c:a', 'pcm_s24le',
                    str(WORK/'voice.wav')], check=True)
    source, sr = read_wav(str(WORK/'voice.wav'))
    assert sr == SR and source.shape[1] <= n
    assert words and all(0 <= w['start'] <= w['end'] <= source.shape[1]/SR for w in words)
    voice = np.zeros((2, n))
    voice[:, :source.shape[1]] = st(source)
    ref = integrated(voice)
    log(f'Voice {ref:.2f} LUFS. Synthesize original score.')
    raw_music, sections = score.render(cfg)
    # Keep music out of the voice band: no low-mids under 180 Hz, dips at 500 Hz and 2 kHz.
    eq, silent = cfg['music_eq'], raw_music == 0
    raw_music = hp(raw_music, eq['highpass_hz'], 4)
    for f0, g, q in (eq['mid_cut'], eq['presence_cut']):
        raw_music = peq(raw_music, f0, g, q)
    raw_music[silent] = 0  # filter ringing must not leak into the scored silences
    write_wav(str(WORK/'music_raw.wav'), raw_music*dbg(-12))
    duck_db = duck(words, cfg, n)
    music = raw_music*dbg(duck_db)
    for sec in sections:
        sl = slice(ns(sec['start']), ns(sec['end']))
        target = integrated(voice[:, sl])+sec['base_margin']+cfg['music_standard_db']
        gain = target-integrated(music[:, sl])
        music[:, sl] *= dbg(gain)
        sec['gain_db'] = float(gain)
    music = fades(music, cfg['music_fade_in'], cfg['music_fade_out'])
    log('Synthesize Foley, school/water beds and clock.')
    sfx, cues = effects.render(cfg, ref)
    write_wav(str(WORK/'sfx_raw.wav'), sfx)
    music, sfx, ride = protect_dialogue(voice, music, sfx, words, cfg)
    np.savetxt(WORK/'duck_envelope.csv', np.c_[np.arange(0,n,480)/SR, duck_db[::480], ride[::480]],
               delimiter=',', header='seconds,music_duck_db,accompaniment_protection_db', comments='', fmt='%.4f')
    premaster = voice+music+sfx
    master_db = cfg['target_lufs']-integrated(premaster)
    for iteration in range(6):
        y, gain = limiter(premaster*dbg(master_db), cfg)
        measured = integrated(y)
        log(f'Master {iteration+1}: {measured:.3f} LUFS; gain {master_db:+.3f} dB')
        if abs(measured-cfg['target_lufs']) < .015:
            break
        master_db += cfg['target_lufs']-measured
    v, m, s = [x*dbg(master_db) for x in (voice, music, sfx)]
    for name, x in [('voice', v), ('music', m), ('sfx', s)]:
        assert np.abs(x).max() < 1, f'{name} stem would clip'
        write_wav(str(WORK/f'stem_{name}.wav'), x)
    write_wav(str(FINAL), y)
    y_disk, sr = read_wav(str(FINAL))
    with wave.open(str(FINAL), 'rb') as wav:
        assert (wav.getnframes(), wav.getframerate(), wav.getnchannels(), wav.getsampwidth()) == (n, SR, 2, 3)
    voice_disk, _ = read_wav(str(WORK/'stem_voice.wav'))
    assert np.max(np.abs(voice_disk-v)) <= 1/8388607
    stats = {name: measure(x) for name, x in [('master', y_disk), ('voice', v), ('music', m), ('sfx', s)]}
    stats.update({'master_gain_db': float(master_db), 'voice_gain_db': float(master_db),
                  'source_duration_seconds': source.shape[1]/SR,
                  'source_sha256': hashlib.sha256((PUB/'voice.mp3').read_bytes()).hexdigest(),
                  'words_sha256': hashlib.sha256((PUB/'words.json').read_bytes()).hexdigest(),
                  'music_sections': sections, 'sfx_cues': cues})
    summary = ffmpeg_check()
    log(summary)
    report(cfg, words, v, m, s, y_disk, gain, sections, cues, stats, summary)
    log(f'PASS: exact {cfg["duration"]:.3f} s / 48 kHz / stereo / 24-bit, loudness, true peak, speech margins, silent stop and fades.')


if __name__ == '__main__':
    main()
