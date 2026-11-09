# ep09 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,643,200 frames = 75.900 s**.
- Supplied voice: **75.074 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.57 | 2.66 |
| voice | -16.01 | -1.64 | 2.67 |
| music | -37.25 | -18.24 | 4.59 |
| sfx | -39.67 | -12.72 | 10.07 |

Voice gain tổng: **-1.36 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.3 LUFS

  Loudness range:
    LRA:         2.7 LU
    Threshold: -36.3 LUFS
    LRA low:   -17.5 LUFS
    LRA high:  -14.8 LUFS

  True peak:
    Peak:       -1.6 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 3 s / out 5 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–5.60 | Hook: the reef's biggest party | -21.0 |
| 5.60–9.70 | The party, the loudest person | -20.0 |
| 9.70–18.40 | Wake up a sponge: nothing | -22.0 |
| 18.40–30.25 | Water through you, a pool a day | -22.0 |
| 30.25–43.60 | Eat, sneeze, the guests move in | -21.0 |
| 43.60–50.05 | A crowd of cells | -22.0 |
| 50.05–58.75 | 1907: squeezed through a cloth | -22.0 |
| 58.75–66.10 | Your cells find each other | -21.0 |
| 66.10–72.20 | The party you can't feel | -21.0 |
| 72.20–75.90 | The question | -20.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 0.00–5.50 | lagoon bed (hook) | -44.0 | +0.00 |
| 0.60–0.72 | shrimp snap | -36.0 | -0.30 |
| 1.60–1.72 | shrimp snap | -36.0 | +0.30 |
| 2.60–3.20 | bubbles | -42.0 | +0.10 |
| 3.60–3.72 | shrimp snap | -36.0 | -0.20 |
| 5.50–6.00 | hook flash | -32.0 | +0.00 |
| 5.60–9.60 | party chatter + laughs | -42.0 | +0.00 |
| 9.70–18.30 | lagoon bed | -46.0 | +0.00 |
| 10.00–10.30 | eyes open | -36.0 | +0.00 |
| 12.65–12.85 | X: mouth | -36.0 | -0.30 |
| 14.05–14.25 | X: legs | -36.0 | +0.00 |
| 15.60–15.80 | X: brain | -36.0 | +0.30 |
| 16.00–16.60 | fish swims past | -40.0 | +0.40 |
| 18.60–19.80 | water arrows, bubbles | -42.0 | +0.00 |
| 21.70–24.90 | water pours in | -44.0 | +0.00 |
| 26.90–28.10 | pool drains | -40.0 | -0.20 |
| 29.80–30.10 | one day | -36.0 | +0.30 |
| 30.60–31.80 | food drifts in | -42.0 | +0.00 |
| 32.30–33.30 | every few hours | -46.0 | -0.30 |
| 33.30–33.70 | SNEEZE puff | -34.0 | +0.00 |
| 33.40–34.30 | slime bubbles | -38.0 | +0.00 |
| 34.85–35.35 | fish dart in | -40.0 | -0.40 |
| 35.60–35.72 | nibble | -36.0 | +0.00 |
| 35.80–35.92 | nibble | -36.0 | +0.10 |
| 37.75–38.05 | shrimp moves in | -40.0 | -0.30 |
| 38.30–38.60 | crab moves in | -40.0 | +0.30 |
| 38.90–39.20 | worm moves in | -40.0 | +0.00 |
| 41.20–42.90 | guest counter climbs | -44.0 | +0.00 |
| 42.95–43.25 | 300 | -34.0 | +0.00 |
| 45.95–46.15 | 1 CREATURE? crossed | -36.0 | +0.00 |
| 46.90–47.70 | cells split | -42.0 | +0.00 |
| 50.30–50.55 | 1907 stamp | -32.0 | -0.30 |
| 52.10–53.60 | squeeze through cloth | -40.0 | +0.00 |
| 54.40–55.30 | cells drip | -40.0 | +0.00 |
| 55.90–57.10 | cells crawl | -44.0 | +0.00 |
| 57.60–57.90 | a new sponge | -34.0 | +0.00 |
| 61.40–62.60 | cells regroup | -38.0 | +0.00 |
| 62.75–63.10 | curl pops back | -34.0 | +0.00 |
| 63.60–64.20 | hearts | -40.0 | +0.00 |
| 66.10–72.10 | party inside you (far) | -46.0 | +0.00 |
| 66.90–67.02 | shrimp snap | -34.0 | -0.30 |
| 67.90–68.02 | shrimp snap | -34.0 | +0.30 |
| 68.70–68.82 | shrimp snap | -34.0 | -0.30 |
| 69.50–69.62 | shrimp snap | -34.0 | +0.30 |
| 70.25–70.55 | FELT: 0 | -34.0 | +0.00 |
| 70.60–70.72 | shrimp snap | -36.0 | -0.30 |
| 71.40–71.52 | shrimp snap | -36.0 | +0.30 |
| 72.20–73.95 | empty room | -48.0 | +0.00 |
| 73.95–74.95 | back to the bubbles | -42.0 | +0.00 |
| 74.40–75.20 | the question | -38.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **16.14 LU**, median **21.27 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook: the reef's biggest party | -15.0 | -37.5 | -39.8 | 9.8 / 16.5 |
| The party, the loudest person | -15.8 | -35.8 | -40.5 | 11.1 / 15.9 |
| Wake up a sponge: nothing | -15.9 | -38.0 | -41.1 | 8.0 / 17.0 |
| Water through you, a pool a day | -16.3 | -38.3 | -42.7 | 10.2 / 17.0 |
| Eat, sneeze, the guests move in | -15.8 | -36.9 | -39.4 | 8.0 / 16.1 |
| A crowd of cells | -16.3 | -38.8 | -39.8 | 8.0 / 15.6 |
| 1907: squeezed through a cloth | -15.2 | -37.2 | -39.3 | 8.0 / 15.3 |
| Your cells find each other | -16.5 | -37.5 | -38.7 | 10.6 / 17.3 |
| The party you can't feel | -16.9 | -38.3 | -36.4 | 8.0 / 15.2 |
| The question | -16.6 | -47.7 | -43.0 | 17.5 / 21.5 |
