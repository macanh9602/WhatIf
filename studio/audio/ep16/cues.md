# ep16 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,684,800 frames = 76.767 s**.
- Supplied voice: **76.736 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.33 | 2.52 |
| voice | -16.01 | -1.33 | 2.55 |
| music | -39.53 | -22.45 | 6.63 |
| sfx | -38.37 | -14.81 | 16.25 |

Voice gain tổng: **-0.06 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.4 LUFS

  Loudness range:
    LRA:         2.5 LU
    Threshold: -36.4 LUFS
    LRA low:   -17.5 LUFS
    LRA high:  -15.0 LUFS

  True peak:
    Peak:       -1.3 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 0 s / out 0 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–22.40 | Hook + town: light bounce | -25.0 |
| 22.40–28.90 | Skip tip, bench: bounce quickens | -23.0 |
| 28.90–38.00 | Bench, bus stop: frantic starts | -23.0 |
| 38.00–44.20 | Steps, elevator: climbs | -20.0 |
| 44.20–46.90 | Bedtime zero | -22.0 |
| 46.90–50.10 | Bed strike: peak | -18.0 |
| 50.10–52.60 | You see: bare note | -31.0 |
| 52.60–62.57 | Explain tipped wage | -28.0 |
| 62.57–75.24 | Cart job: warm ironic tail | -24.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 0.75–1.25 | POS chime note 1 | -40.0 | +0.00 |
| 0.89–1.59 | POS chime note 2 | -42.0 | +0.00 |
| 4.90–6.50 | overnight screens wave | -46.0 | +0.00 |
| 6.30–6.80 | POS chime note 1 | -40.0 | +0.00 |
| 6.44–7.14 | POS chime note 2 | -42.0 | +0.00 |
| 6.75–7.25 | POS chime note 1 | -44.0 | +0.00 |
| 6.89–7.59 | POS chime note 2 | -46.0 | +0.00 |
| 7.20–7.70 | POS chime note 1 | -44.0 | +0.00 |
| 7.34–8.04 | POS chime note 2 | -46.0 | +0.00 |
| 10.00–10.50 | POS chime note 1 | -40.0 | +0.00 |
| 10.14–10.84 | POS chime note 2 | -42.0 | +0.00 |
| 14.40–14.90 | POS chime note 1 | -40.0 | +0.00 |
| 14.54–15.24 | POS chime note 2 | -42.0 | +0.00 |
| 22.00–22.50 | POS chime note 1 | -40.0 | +0.00 |
| 22.14–22.84 | POS chime note 2 | -42.0 | +0.00 |
| 24.00–24.50 | no-tip low buzz | -44.0 | +0.00 |
| 24.60–24.72 | lock clunk | -34.0 | +0.00 |
| 24.65–24.95 | lock thud | -32.0 | +0.00 |
| 26.30–26.80 | POS chime note 1 | -40.0 | +0.00 |
| 26.44–27.14 | POS chime note 2 | -42.0 | +0.00 |
| 27.40–27.90 | bench tip | -40.0 | +0.00 |
| 28.30–28.60 | grass thud | -31.0 | +0.00 |
| 29.90–30.40 | POS chime note 1 | -40.0 | +0.00 |
| 30.04–30.74 | POS chime note 2 | -42.0 | +0.00 |
| 31.60–32.20 | roof rail rattle | -44.0 | +0.00 |
| 31.70–32.70 | roof slides away | -40.0 | +0.00 |
| 33.00–33.50 | POS chime note 1 | -40.0 | +0.00 |
| 33.14–33.84 | POS chime note 2 | -42.0 | +0.00 |
| 38.90–39.40 | POS chime note 1 | -40.0 | +0.00 |
| 39.04–39.74 | POS chime note 2 | -42.0 | +0.00 |
| 39.60–40.10 | steps fold | -40.0 | +0.00 |
| 39.90–40.40 | steps fold 2 | -40.0 | +0.00 |
| 40.20–40.50 | ramp flat | -35.0 | +0.00 |
| 41.30–41.80 | POS chime note 1 | -40.0 | +0.00 |
| 41.44–42.14 | POS chime note 2 | -42.0 | +0.00 |
| 41.90–42.20 | elevator stall | -32.0 | +0.00 |
| 41.95–42.85 | elevator jolt | -38.0 | +0.00 |
| 42.30–44.50 | elevator muzak hum | -46.0 | +0.00 |
| 44.00–44.50 | POS chime note 1 | -40.0 | +0.00 |
| 44.14–44.84 | POS chime note 2 | -42.0 | +0.00 |
| 46.10–46.70 | card decline buzz | -36.0 | +0.00 |
| 46.15–46.65 | decline buzz 2 | -36.0 | +0.10 |
| 47.60–48.20 | bed spring | -40.0 | +0.00 |
| 48.30–48.60 | bed into wall | -32.0 | +0.00 |
| 49.90–50.02 | picket sign tap | -36.0 | +0.00 |
| 65.67–66.67 | coffee steam hiss | -48.0 | +0.00 |
| 74.67–75.22 | final POS chime 1 | -39.0 | +0.00 |
| 74.79–75.23 | final POS chime 2 | -41.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **16.99 LU**, median **24.01 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook + town: light bounce | -16.1 | -41.1 | -41.4 | 9.6 / 20.1 |
| Skip tip, bench: bounce quickens | -15.7 | -38.7 | -35.1 | 8.4 / 14.3 |
| Bench, bus stop: frantic starts | -16.2 | -39.2 | -41.8 | 12.1 / 17.0 |
| Steps, elevator: climbs | -15.8 | -36.2 | -38.9 | 8.0 / 15.1 |
| Bedtime zero | -16.2 | -38.2 | -37.0 | 13.0 / 16.7 |
| Bed strike: peak | -16.6 | -34.6 | -34.7 | 8.0 / 12.7 |
| You see: bare note | -15.4 | -46.4 | silence | 23.6 / 28.1 |
| Explain tipped wage | -15.0 | -43.0 | silence | 10.2 / 22.9 |
| Cart job: warm ironic tail | -16.7 | -40.7 | -43.1 | 18.5 / 21.4 |
