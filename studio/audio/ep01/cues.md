# Owen Ep01 v3 — The Broken Arm: audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/owen/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **7,785,600 frames = 162.200 s**.
- Supplied voice: **160.821 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.58 | 2.35 |
| voice | -16.01 | -1.73 | 2.36 |
| music | -37.51 | -18.82 | 4.02 |
| sfx | -34.88 | -10.50 | 16.66 |

Voice gain tổng: **-1.73 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.4 LUFS

  Loudness range:
    LRA:         2.4 LU
    Threshold: -36.4 LUFS
    LRA low:   -17.6 LUFS
    LRA high:  -15.2 LUFS

  True peak:
    Peak:       -1.6 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 3 s / out 5 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–6.20 | Hook: green drains | -21.0 |
| 6.20–41.60 | Morning montage | -21.0 |
| 41.60–82.00 | Eyes, colours, night | -22.0 |
| 82.00–87.00 | Turn: the part that hurts | -25.0 |
| 87.00–123.60 | Cooling, ice, snowball | -21.0 |
| 123.60–133.00 | Frozen pink planet | -24.0 |
| 133.00–151.60 | You see: the leaf | -22.0 |
| 151.60–162.20 | Green returns | -20.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 1.40–2.60 | green drains from the horizon | -34.0 | +0.00 |
| 6.15–6.65 | hook flash | -32.0 | +0.00 |
| 7.55–8.15 | curtains swish open | -32.0 | -0.20 |
| 18.30–22.90 | push mower rolling | -40.0 | +0.30 |
| 32.99–33.11 | light switches to amber | -32.0 | +0.40 |
| 34.01–34.13 | amber off, green slot dark | -32.0 | +0.40 |
| 35.06–35.46 | shrug | -36.0 | +0.00 |
| 38.00–39.40 | dimmer knob turning | -40.0 | +0.00 |
| 56.24–56.54 | sunglasses slap on | -34.0 | +0.00 |
| 61.39–61.69 | ring | -34.0 | +0.20 |
| 80.35–80.60 | bonk on the lamppost | -28.0 | -0.20 |
| 80.45–80.95 | dizzy | -34.0 | -0.20 |
| 122.29–122.89 | Snowball Earth reveal | -32.0 | +0.00 |
| 132.23–132.48 | bud pops | -34.0 | +0.30 |
| 152.00–152.80 | green comes back | -32.0 | +0.00 |
| 159.89–160.69 | the gift | -36.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **17.18 LU**, median **22.62 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook: green drains | -16.8 | -38.1 | -36.8 | 13.0 / 17.5 |
| Morning montage | -15.8 | -36.8 | -35.9 | 8.0 / 16.7 |
| Eyes, colours, night | -15.8 | -38.0 | -31.3 | 8.0 / 17.2 |
| Turn: the part that hurts | -16.4 | -41.4 | silence | 20.8 / 23.4 |
| Cooling, ice, snowball | -16.0 | -37.1 | -39.8 | 8.0 / 16.8 |
| Frozen pink planet | -16.4 | -40.4 | -34.0 | 12.5 / 18.5 |
| You see: the leaf | -16.1 | -38.1 | silence | 8.4 / 18.8 |
| Green returns | -16.7 | -36.6 | -36.7 | 8.0 / 16.8 |
