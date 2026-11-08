# ep14 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,932,800 frames = 81.933 s**.
- Supplied voice: **81.923 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.20 | 2.26 |
| voice | -16.06 | -1.69 | 2.28 |
| music | -38.60 | -20.31 | 6.91 |
| sfx | -33.87 | 0.22 | 16.10 |

Voice gain tổng: **-0.92 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **1.01 dB**; active >0.1 dB trên 0.23% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.3 LUFS

  Loudness range:
    LRA:         2.3 LU
    Threshold: -36.4 LUFS
    LRA low:   -17.5 LUFS
    LRA high:  -15.2 LUFS

  True peak:
    Peak:       -1.3 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 0 s / out 0 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–11.80 | Hook: the column | -21.0 |
| 11.80–26.70 | Border, the march | -21.0 |
| 26.70–28.80 | One village, then two (smug) | -19.0 |
| 28.80–36.90 | The house opens fire: rumble | -24.0 |
| 36.90–48.10 | The retreat, tense | -22.0 |
| 48.10–53.00 | You see: nearly silent | -36.0 |
| 53.00–67.00 | Facts | -25.0 |
| 67.00–73.00 | One piece, soft rebuild | -24.0 |
| 73.00–80.43 | Calm ending | -25.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 0.10–0.22 | march drum | -36.1 | +0.00 |
| 0.10–5.70 | treads, column | -43.1 | +0.00 |
| 0.40–0.52 | march drum | -41.1 | +0.00 |
| 0.70–0.82 | march drum | -36.1 | +0.00 |
| 1.00–1.12 | march drum | -41.1 | +0.00 |
| 1.30–1.42 | march drum | -36.1 | +0.00 |
| 1.60–1.72 | march drum | -41.1 | +0.00 |
| 1.90–2.02 | march drum | -36.1 | +0.00 |
| 2.20–2.32 | march drum | -41.1 | +0.00 |
| 2.50–2.62 | march drum | -36.1 | +0.00 |
| 2.80–2.92 | march drum | -41.1 | +0.00 |
| 3.00–3.50 | whip | -40.1 | +0.00 |
| 3.10–3.22 | march drum | -36.1 | +0.00 |
| 3.40–3.52 | march drum | -41.1 | +0.00 |
| 3.70–3.82 | march drum | -36.1 | +0.00 |
| 4.00–4.12 | march drum | -41.1 | +0.00 |
| 4.30–4.42 | march drum | -36.1 | +0.00 |
| 4.60–4.72 | march drum | -41.1 | +0.00 |
| 4.90–5.02 | march drum | -36.1 | +0.00 |
| 5.20–5.32 | march drum | -41.1 | +0.00 |
| 5.50–5.62 | march drum | -36.1 | +0.00 |
| 5.80–5.92 | march drum | -41.1 | +0.00 |
| 6.10–6.22 | march drum | -36.1 | +0.00 |
| 6.40–6.52 | march drum | -41.1 | +0.00 |
| 6.70–6.82 | march drum | -36.1 | +0.00 |
| 7.00–7.12 | march drum | -41.1 | +0.00 |
| 7.00–9.60 | train chase | -44.1 | -0.30 |
| 7.30–7.42 | march drum | -36.1 | +0.00 |
| 7.60–7.72 | march drum | -41.1 | +0.00 |
| 7.90–8.02 | march drum | -36.1 | +0.00 |
| 8.20–8.32 | march drum | -41.1 | +0.00 |
| 8.50–8.62 | march drum | -36.1 | +0.00 |
| 8.80–8.92 | march drum | -41.1 | +0.00 |
| 9.10–9.22 | march drum | -36.1 | +0.00 |
| 9.20–9.80 | train whistle | -44.1 | -0.30 |
| 9.40–9.52 | march drum | -41.1 | +0.00 |
| 9.70–9.82 | march drum | -36.1 | +0.00 |
| 10.00–10.12 | march drum | -41.1 | +0.00 |
| 10.30–10.42 | march drum | -36.1 | +0.00 |
| 10.60–10.72 | march drum | -41.1 | +0.00 |
| 10.90–11.02 | march drum | -36.1 | +0.00 |
| 11.20–11.32 | march drum | -41.1 | +0.00 |
| 11.50–11.62 | march drum | -36.1 | +0.00 |
| 11.80–11.92 | march drum | -41.1 | +0.00 |
| 12.10–12.22 | march drum | -36.1 | +0.00 |
| 12.40–12.52 | march drum | -41.1 | +0.00 |
| 12.60–13.10 | barrier crunch | -26.1 | +0.00 |
| 12.62–13.32 | barrier splinters | -32.1 | +0.00 |
| 12.70–12.82 | march drum | -36.1 | +0.00 |
| 12.70–15.30 | treads, meadow | -41.1 | +0.00 |
| 13.00–13.12 | march drum | -41.1 | +0.00 |
| 13.30–13.42 | march drum | -36.1 | +0.00 |
| 13.60–13.72 | march drum | -41.1 | +0.00 |
| 13.90–14.02 | march drum | -36.1 | +0.00 |
| 14.20–14.32 | march drum | -41.1 | +0.00 |
| 14.50–14.62 | march drum | -36.1 | +0.00 |
| 14.80–14.92 | march drum | -41.1 | +0.00 |
| 15.10–15.22 | march drum | -36.1 | +0.00 |
| 15.40–15.52 | march drum | -41.1 | +0.00 |
| 15.70–15.82 | march drum | -36.1 | +0.00 |
| 15.95–16.55 | bell: just cows | -36.1 | +0.20 |
| 16.00–16.12 | march drum | -41.1 | +0.00 |
| 16.30–16.42 | march drum | -36.1 | +0.00 |
| 16.60–16.72 | march drum | -41.1 | +0.00 |
| 16.90–17.02 | march drum | -36.1 | +0.00 |
| 17.20–17.32 | march drum | -41.1 | +0.00 |
| 17.50–17.62 | march drum | -36.1 | +0.00 |
| 17.80–17.92 | march drum | -41.1 | +0.00 |
| 18.10–18.22 | march drum | -36.1 | +0.00 |
| 18.40–18.52 | march drum | -41.1 | +0.00 |
| 18.70–18.82 | march drum | -36.1 | +0.00 |
| 19.00–19.12 | march drum | -41.1 | +0.00 |
| 19.30–19.42 | march drum | -36.1 | +0.00 |
| 19.60–19.72 | march drum | -41.1 | +0.00 |
| 19.90–20.02 | march drum | -36.1 | +0.00 |
| 20.20–20.32 | march drum | -41.1 | +0.00 |
| 20.50–20.62 | march drum | -36.1 | +0.00 |
| 20.80–20.92 | march drum | -41.1 | +0.00 |
| 21.10–21.22 | march drum | -36.1 | +0.00 |
| 21.40–21.52 | march drum | -41.1 | +0.00 |
| 21.70–21.82 | march drum | -36.1 | +0.00 |
| 22.00–22.12 | march drum | -41.1 | +0.00 |
| 22.30–22.42 | march drum | -36.1 | +0.00 |
| 22.60–22.72 | march drum | -41.1 | +0.00 |
| 22.90–23.02 | march drum | -36.1 | +0.00 |
| 23.20–23.32 | march drum | -41.1 | +0.00 |
| 23.50–23.62 | march drum | -36.1 | +0.00 |
| 23.80–23.92 | march drum | -41.1 | +0.00 |
| 24.10–24.22 | march drum | -36.1 | +0.00 |
| 24.40–24.52 | march drum | -41.1 | +0.00 |
| 24.70–24.82 | march drum | -36.1 | +0.00 |
| 24.70–28.30 | treads, valley | -41.1 | +0.00 |
| 25.00–25.12 | march drum | -41.1 | +0.00 |
| 25.30–25.42 | march drum | -36.1 | +0.00 |
| 25.60–25.72 | march drum | -41.1 | +0.00 |
| 25.90–26.02 | march drum | -36.1 | +0.00 |
| 26.20–26.32 | march drum | -41.1 | +0.00 |
| 26.50–26.62 | march drum | -36.1 | +0.00 |
| 26.80–26.92 | march drum | -41.1 | +0.00 |
| 27.10–27.22 | march drum | -36.1 | +0.00 |
| 27.40–27.52 | march drum | -41.1 | +0.00 |
| 27.70–27.82 | march drum | -36.1 | +0.00 |
| 28.00–28.12 | march drum | -41.1 | +0.00 |
| 28.30–28.42 | march drum | -36.1 | +0.00 |
| 28.60–28.72 | march drum | -41.1 | +0.00 |
| 30.03–30.83 | shutter creak | -37.1 | -0.20 |
| 30.80–31.10 | hinge clank | -30.1 | +0.20 |
| 30.82–30.97 | hinge thud | -32.1 | +0.00 |
| 32.40–32.90 | house fires | -21.1 | +0.00 |
| 32.40–33.80 | house fires boom | -25.1 | +0.00 |
| 32.50–36.00 | low rumble | -34.1 | +0.00 |
| 33.30–33.80 | barn fires | -21.1 | +0.30 |
| 33.30–34.70 | barn fires boom | -25.1 | +0.30 |
| 34.50–35.00 | rock fires | -21.1 | -0.30 |
| 34.50–35.90 | rock fires boom | -25.1 | -0.30 |
| 36.55–37.15 | bell: the cow watches | -36.1 | +0.20 |
| 37.00–37.12 | retreat drum | -37.1 | +0.00 |
| 37.00–43.20 | treads, retreat | -39.1 | +0.00 |
| 37.45–37.57 | retreat drum | -42.1 | +0.00 |
| 37.90–38.02 | retreat drum | -37.1 | +0.00 |
| 38.35–38.47 | retreat drum | -42.1 | +0.00 |
| 38.80–38.92 | retreat drum | -37.1 | +0.00 |
| 39.25–39.37 | retreat drum | -42.1 | +0.00 |
| 39.70–39.82 | retreat drum | -37.1 | +0.00 |
| 39.70–41.40 | tank onto the bridge | -36.1 | +0.00 |
| 40.15–40.27 | retreat drum | -42.1 | +0.00 |
| 40.60–40.72 | retreat drum | -37.1 | +0.00 |
| 41.05–41.17 | retreat drum | -42.1 | +0.00 |
| 41.50–41.62 | retreat drum | -37.1 | +0.00 |
| 41.95–42.07 | retreat drum | -42.1 | +0.00 |
| 42.40–42.52 | retreat drum | -37.1 | +0.00 |
| 42.85–42.97 | retreat drum | -42.1 | +0.00 |
| 43.30–43.42 | retreat drum | -37.1 | +0.00 |
| 43.45–43.95 | bridge blast | -23.1 | +0.00 |
| 43.45–44.65 | bridge boom | -27.1 | +0.00 |
| 43.75–43.87 | retreat drum | -42.1 | +0.00 |
| 43.78–44.28 | bridge blast | -23.1 | +0.00 |
| 43.78–44.98 | bridge boom | -27.1 | +0.00 |
| 44.10–44.60 | bridge blast | -20.1 | +0.00 |
| 44.10–45.30 | bridge boom | -24.1 | +0.00 |
| 46.00–49.00 | rockslide grit | -35.1 | +0.00 |
| 46.10–48.50 | rockslide roar | -39.1 | +0.20 |
| 46.21–46.46 | rock tumble | -37.1 | +0.24 |
| 46.42–46.54 | rock tumble | -38.1 | +0.53 |
| 46.56–46.81 | rock tumble | -37.1 | -0.29 |
| 46.77–46.89 | rock tumble | -38.1 | +0.19 |
| 46.90–47.15 | rock tumble | -37.1 | +0.22 |
| 47.08–47.20 | rock tumble | -38.1 | +0.33 |
| 47.23–47.48 | rock tumble | -37.1 | -0.33 |
| 47.46–47.58 | rock tumble | -38.1 | -0.17 |
| 47.58–47.83 | rock tumble | -37.1 | +0.37 |
| 47.78–47.90 | rock tumble | -38.1 | -0.42 |
| 47.94–48.19 | rock tumble | -37.1 | +0.20 |
| 48.08–48.20 | rock tumble | -38.1 | +0.18 |
| 48.25–48.50 | rock tumble | -37.1 | -0.20 |
| 48.42–48.54 | rock tumble | -38.1 | -0.35 |
| 50.60–51.30 | paint scrape | -42.1 | +0.00 |
| 52.40–52.90 | paint scrape 2 | -46.1 | +0.00 |
| 65.50–65.70 | plunger click | -32.1 | +0.00 |
| 65.52–65.67 | plunger thud | -36.1 | +0.00 |
| 72.95–73.25 | pebble | -36.1 | +0.30 |
| 73.12–73.42 | pebble 2 | -42.1 | +0.30 |
| 78.95–79.45 | train horn | -44.1 | -0.40 |
| 79.20–80.20 | train pass | -40.1 | +0.30 |
| 79.20–80.30 | train air | -40.1 | +0.30 |
| 79.55–80.40 | last: cow bell | -36.1 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **14.04 LU**, median **20.46 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook: the column | -15.7 | -36.7 | -36.3 | 9.4 / 14.5 |
| Border, the march | -15.9 | -37.1 | -35.0 | 8.0 / 12.9 |
| One village, then two (smug) | -16.3 | -35.3 | -36.2 | 10.9 / 12.6 |
| The house opens fire: rumble | -15.4 | -40.9 | -28.7 | 8.0 / 9.4 |
| The retreat, tense | -16.3 | -39.1 | -33.0 | 8.0 / 11.7 |
| You see: nearly silent | -17.9 | -53.9 | -37.6 | 9.5 / 16.5 |
| Facts | -16.1 | -41.2 | -37.6 | 8.0 / 19.4 |
| One piece, soft rebuild | -16.5 | -40.5 | -36.2 | 14.8 / 18.9 |
| Calm ending | -15.9 | -40.9 | -37.6 | 12.0 / 18.4 |
