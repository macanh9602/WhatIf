# ep04 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,888,000 frames = 81.000 s**.
- Supplied voice: **79.971 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.30 | 2.31 |
| voice | -16.00 | -1.69 | 2.33 |
| music | -37.80 | -21.36 | 3.20 |
| sfx | -36.49 | -12.99 | 8.28 |

Voice gain tổng: **-1.70 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.5 LUFS

  Loudness range:
    LRA:         2.3 LU
    Threshold: -36.5 LUFS
    LRA low:   -17.6 LUFS
    LRA high:  -15.3 LUFS

  True peak:
    Peak:       -1.3 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 3 s / out 5 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–5.65 | Hook: the back face | -21.0 |
| 5.65–21.93 | Seeing all around, the queue | -21.0 |
| 21.93–32.69 | Sleeping | -22.0 |
| 32.69–42.50 | The brain, nature tried | -22.0 |
| 42.50–51.89 | Rabbits: prey | -22.0 |
| 51.89–65.14 | Hunters: depth | -22.0 |
| 65.14–71.38 | Not safer: prey | -22.0 |
| 71.38–76.39 | Ancestors chased | -21.0 |
| 76.39–81.00 | The question | -20.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 0.30–3.70 | neighbour tiptoes | -40.0 | +0.30 |
| 4.15–4.55 | neighbour startled | -32.0 | +0.30 |
| 5.60–6.10 | hook flash | -32.0 | +0.00 |
| 6.40–7.30 | front cone sweeps | -38.0 | +0.00 |
| 10.00–10.30 | blind spot | -36.0 | +0.00 |
| 11.30–12.50 | second cone sweeps | -36.0 | +0.00 |
| 14.40–15.00 | the whole circle | -36.0 | +0.00 |
| 19.50–19.75 | the stare | -34.0 | +0.00 |
| 24.20–24.45 | lies on the back | -32.0 | +0.00 |
| 25.40–25.80 | squash | -38.0 | +0.00 |
| 27.50–27.75 | rolls onto the front | -32.0 | +0.00 |
| 28.40–28.80 | squash | -38.0 | +0.00 |
| 31.10–31.60 | rolls onto the side | -38.0 | +0.00 |
| 37.30–37.42 | two pictures pop | -32.0 | +0.00 |
| 38.70–39.30 | dizzy stars | -34.0 | +0.00 |
| 43.70–44.60 | rabbit cones | -38.0 | +0.00 |
| 57.20–58.00 | hunter cones | -38.0 | +0.00 |
| 60.00–60.50 | overlap | -37.0 | +0.00 |
| 63.80–64.10 | target | -34.0 | +0.00 |
| 69.60–71.20 | hawk overhead | -34.0 | -0.20 |
| 70.40–70.80 | prey | -32.0 | +0.00 |
| 75.40–75.70 | fist pump | -32.0 | +0.00 |
| 78.00–78.35 | the wink | -36.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **16.36 LU**, median **22.14 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook: the back face | -15.4 | -36.7 | -39.4 | 14.3 / 17.1 |
| Seeing all around, the queue | -16.1 | -37.1 | -37.2 | 8.0 / 15.5 |
| Sleeping | -15.9 | -37.9 | -35.9 | 10.7 / 17.4 |
| The brain, nature tried | -16.8 | -38.8 | -33.2 | 8.0 / 14.2 |
| Rabbits: prey | -15.6 | -37.6 | -40.4 | 8.0 / 18.3 |
| Hunters: depth | -16.2 | -38.2 | -37.5 | 13.6 / 17.1 |
| Not safer: prey | -16.6 | -38.7 | -34.8 | 8.0 / 16.0 |
| Ancestors chased | -15.8 | -36.8 | -32.0 | 12.7 / 15.7 |
| The question | -15.1 | -41.2 | -37.0 | 18.0 / 22.1 |
