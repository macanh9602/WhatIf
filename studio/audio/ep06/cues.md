# ep06 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **4,113,600 frames = 85.700 s**.
- Supplied voice: **84.635 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.72 | 2.46 |
| voice | -16.02 | -1.87 | 2.50 |
| music | -37.40 | -16.59 | 4.53 |
| sfx | -34.15 | -11.64 | 8.13 |

Voice gain tổng: **-1.91 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.5 LUFS

  Loudness range:
    LRA:         2.5 LU
    Threshold: -36.4 LUFS
    LRA low:   -17.6 LUFS
    LRA high:  -15.1 LUFS

  True peak:
    Peak:       -1.7 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 3 s / out 5 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–4.80 | Hook: billionaires never sleep | -21.0 |
| 4.80–26.70 | The app, the billionaire | -21.0 |
| 26.70–38.40 | The trap | -22.0 |
| 38.40–54.20 | The cleaning crew | -22.0 |
| 54.20–68.50 | The limit, 1964 | -22.0 |
| 68.50–81.80 | Dolphins, already sold | -21.0 |
| 81.80–85.70 | The question | -20.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 4.75–5.25 | hook flash | -32.0 | +0.00 |
| 9.25–9.37 | tap sell | -32.0 | -0.20 |
| 9.30–9.60 | sold | -34.0 | -0.20 |
| 11.15–11.45 | paid | -34.0 | +0.20 |
| 18.95–19.25 | no bed | -32.0 | -0.30 |
| 22.40–22.70 | twenty-six years | -34.0 | +0.00 |
| 25.95–26.25 | PAID stamp | -30.0 | +0.10 |
| 31.25–31.60 | the trap | -30.0 | +0.00 |
| 36.10–36.60 | bars level | -36.0 | +0.00 |
| 37.20–37.80 | I'm fine | -38.0 | -0.20 |
| 41.70–42.20 | trash thrown | -36.0 | +0.20 |
| 47.40–48.20 | fluid | -34.0 | +0.00 |
| 52.55–52.85 | SOLD | -30.0 | +0.20 |
| 58.60–58.95 | hard limit | -30.0 | +0.00 |
| 62.80–63.40 | day eleven | -36.0 | +0.20 |
| 66.80–67.20 | memory goes | -38.0 | +0.20 |
| 70.40–70.90 | breath spout | -36.0 | +0.00 |
| 75.00–75.30 | one in three | -34.0 | +0.00 |
| 81.30–81.60 | PAID $0.00 | -30.0 | +0.00 |
| 83.20–84.00 | the question | -36.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **16.64 LU**, median **22.20 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook: billionaires never sleep | -15.5 | -37.9 | -47.5 | 16.8 / 21.0 |
| The app, the billionaire | -15.8 | -36.8 | -32.4 | 8.0 / 15.1 |
| The trap | -16.6 | -38.7 | -37.4 | 8.0 / 17.4 |
| The cleaning crew | -16.6 | -38.7 | -35.5 | 8.0 / 17.4 |
| The limit, 1964 | -15.4 | -37.5 | -34.7 | 8.0 / 16.9 |
| Dolphins, already sold | -16.1 | -37.1 | -32.7 | 8.0 / 14.7 |
| The question | -15.7 | -44.4 | -38.3 | 18.8 / 21.4 |
