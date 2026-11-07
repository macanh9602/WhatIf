# ep13 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,782,400 frames = 78.800 s**.
- Supplied voice: **78.700 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.68 | 2.40 |
| voice | -16.03 | -1.71 | 2.44 |
| music | -37.95 | -19.22 | 5.17 |
| sfx | -32.74 | -4.59 | 13.78 |

Voice gain tổng: **-1.75 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
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
    LRA low:   -17.5 LUFS
    LRA high:  -15.1 LUFS

  True peak:
    Peak:       -1.7 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 0 s / out 0 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–6.30 | Hook: the gallop | -21.0 |
| 6.30–10.10 | A train can't leave the rails | -22.0 |
| 10.10–17.40 | The odd car, the gang laughs | -23.0 |
| 17.40–24.70 | Night, the lantern | -22.0 |
| 24.70–28.40 | The blast | -20.0 |
| 28.40–37.80 | The ride, the count | -21.0 |
| 37.80–40.80 | You laugh on the ridge | -22.0 |
| 40.80–48.10 | The second train | -22.0 |
| 48.10–52.00 | Horses down the ramp | -20.0 |
| 52.00–62.30 | You see: delivering | -25.0 |
| 62.30–66.40 | The fastest engine | -22.0 |
| 66.40–69.10 | They never catch you | -21.0 |
| 69.10–78.80 | Leaving the West | -23.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 0.10–0.22 | hooves | -37.0 | +0.00 |
| 0.21–0.33 | hooves | -37.0 | +0.00 |
| 0.32–0.44 | hooves | -37.0 | +0.00 |
| 0.43–0.55 | hooves | -40.0 | +0.00 |
| 0.70–0.82 | hooves | -37.0 | +0.00 |
| 0.81–0.93 | hooves | -37.0 | +0.00 |
| 0.92–1.04 | hooves | -37.0 | +0.00 |
| 1.03–1.15 | hooves | -40.0 | +0.00 |
| 1.30–1.42 | hooves | -37.0 | +0.00 |
| 1.41–1.53 | hooves | -37.0 | +0.00 |
| 1.52–1.64 | hooves | -37.0 | +0.00 |
| 1.63–1.75 | hooves | -40.0 | +0.00 |
| 1.90–2.02 | hooves | -37.0 | +0.00 |
| 2.01–2.13 | hooves | -37.0 | +0.00 |
| 2.12–2.24 | hooves | -37.0 | +0.00 |
| 2.23–2.35 | hooves | -40.0 | +0.00 |
| 2.50–2.62 | hooves | -37.0 | +0.00 |
| 2.61–2.73 | hooves | -37.0 | +0.00 |
| 2.72–2.84 | hooves | -37.0 | +0.00 |
| 2.83–2.95 | hooves | -40.0 | +0.00 |
| 3.00–3.40 | whip | -34.0 | +0.00 |
| 3.00–6.30 | the train at speed | -34.0 | -0.20 |
| 3.10–3.22 | hooves | -37.0 | +0.00 |
| 3.21–3.33 | hooves | -37.0 | +0.00 |
| 3.32–3.44 | hooves | -37.0 | +0.00 |
| 3.40–4.30 | the train behind you | -37.0 | -0.20 |
| 3.43–3.55 | hooves | -40.0 | +0.00 |
| 3.70–3.82 | hooves | -37.0 | +0.00 |
| 3.81–3.93 | hooves | -37.0 | +0.00 |
| 3.92–4.04 | hooves | -37.0 | +0.00 |
| 4.03–4.15 | hooves | -40.0 | +0.00 |
| 4.30–4.42 | hooves | -37.0 | +0.00 |
| 4.41–4.53 | hooves | -37.0 | +0.00 |
| 4.52–4.64 | hooves | -37.0 | +0.00 |
| 4.63–4.75 | hooves | -40.0 | +0.00 |
| 4.90–5.02 | hooves | -37.0 | +0.00 |
| 5.01–5.13 | hooves | -37.0 | +0.00 |
| 5.12–5.24 | hooves | -37.0 | +0.00 |
| 5.23–5.35 | hooves | -40.0 | +0.00 |
| 5.50–5.62 | hooves | -37.0 | +0.00 |
| 5.61–5.73 | hooves | -37.0 | +0.00 |
| 5.72–5.84 | hooves | -37.0 | +0.00 |
| 5.83–5.95 | hooves | -40.0 | +0.00 |
| 6.10–6.22 | hooves | -37.0 | +0.00 |
| 12.10–12.90 | hay | -38.0 | +0.00 |
| 14.70–14.90 | gang | -40.0 | +0.00 |
| 17.40–18.60 | night wind | -44.0 | +0.00 |
| 17.80–21.10 | the night train comes in | -38.0 | +0.20 |
| 19.90–21.50 | air brakes | -34.0 | +0.30 |
| 20.30–21.20 | the train slows | -40.0 | +0.30 |
| 23.45–23.70 | plunger | -30.0 | +0.00 |
| 23.60–24.80 | the spark runs | -40.0 | +0.00 |
| 24.82–25.32 | blast | -26.0 | +0.00 |
| 24.86–25.86 | roof blast | -21.0 | +0.00 |
| 24.86–25.36 | dynamite crack, roof | -20.0 | +0.00 |
| 24.90–26.10 | roof low | -23.0 | -0.20 |
| 24.90–27.10 | fire roar | -30.0 | +0.00 |
| 25.20–25.50 | debris | -34.0 | -0.50 |
| 25.45–25.75 | debris | -36.0 | +0.50 |
| 25.70–26.00 | debris | -38.0 | -0.50 |
| 25.92–26.82 | walls blast | -22.0 | +0.20 |
| 25.92–26.42 | crack, walls | -21.0 | +0.20 |
| 25.95–27.35 | walls roar | -32.0 | +0.20 |
| 25.96–26.96 | walls low | -25.0 | -0.30 |
| 26.20–26.50 | debris | -34.0 | +0.50 |
| 26.45–26.75 | debris | -36.0 | -0.50 |
| 26.70–27.00 | debris | -38.0 | +0.50 |
| 27.00–27.30 | debris | -34.0 | -0.50 |
| 27.38–28.08 | safe blast | -23.0 | +0.00 |
| 27.40–28.00 | the safe door rings | -34.0 | +0.00 |
| 27.40–27.80 | crack, safe | -22.0 | +0.00 |
| 27.45–28.45 | money | -32.0 | +0.00 |
| 27.70–28.40 | money | -36.0 | +0.30 |
| 27.90–28.20 | debris | -36.0 | +0.50 |
| 28.10–28.40 | debris | -38.0 | -0.50 |
| 28.60–28.72 | hooves | -37.0 | +0.00 |
| 28.71–28.83 | hooves | -37.0 | +0.00 |
| 28.82–28.94 | hooves | -37.0 | +0.00 |
| 28.93–29.05 | hooves | -40.0 | +0.00 |
| 29.20–29.32 | hooves | -37.0 | +0.00 |
| 29.31–29.43 | hooves | -37.0 | +0.00 |
| 29.42–29.54 | hooves | -37.0 | +0.00 |
| 29.53–29.65 | hooves | -40.0 | +0.00 |
| 29.80–29.92 | hooves | -37.0 | +0.00 |
| 29.91–30.03 | hooves | -37.0 | +0.00 |
| 30.02–30.14 | hooves | -37.0 | +0.00 |
| 30.13–30.25 | hooves | -40.0 | +0.00 |
| 30.40–30.52 | hooves | -37.0 | +0.00 |
| 30.51–30.63 | hooves | -37.0 | +0.00 |
| 30.62–30.74 | hooves | -37.0 | +0.00 |
| 30.73–30.85 | hooves | -40.0 | +0.00 |
| 31.00–31.12 | hooves | -37.0 | +0.00 |
| 31.11–31.23 | hooves | -37.0 | +0.00 |
| 31.22–31.34 | hooves | -37.0 | +0.00 |
| 31.33–31.45 | hooves | -40.0 | +0.00 |
| 31.60–31.72 | hooves | -37.0 | +0.00 |
| 31.71–31.83 | hooves | -37.0 | +0.00 |
| 31.82–31.94 | hooves | -37.0 | +0.00 |
| 31.93–32.05 | hooves | -40.0 | +0.00 |
| 32.20–32.32 | hooves | -37.0 | +0.00 |
| 32.31–32.43 | hooves | -37.0 | +0.00 |
| 32.42–32.54 | hooves | -37.0 | +0.00 |
| 32.53–32.65 | hooves | -40.0 | +0.00 |
| 32.80–32.92 | hooves | -37.0 | +0.00 |
| 32.91–33.03 | hooves | -37.0 | +0.00 |
| 33.02–33.14 | hooves | -37.0 | +0.00 |
| 33.13–33.25 | hooves | -40.0 | +0.00 |
| 33.40–33.52 | hooves | -37.0 | +0.00 |
| 33.51–33.63 | hooves | -37.0 | +0.00 |
| 33.62–33.74 | hooves | -37.0 | +0.00 |
| 33.73–33.85 | hooves | -40.0 | +0.00 |
| 34.00–34.12 | hooves | -37.0 | +0.00 |
| 34.11–34.23 | hooves | -37.0 | +0.00 |
| 34.22–34.34 | hooves | -37.0 | +0.00 |
| 34.33–34.45 | hooves | -40.0 | +0.00 |
| 34.60–34.72 | hooves | -37.0 | +0.00 |
| 34.71–34.83 | hooves | -37.0 | +0.00 |
| 34.82–34.94 | hooves | -37.0 | +0.00 |
| 34.93–35.05 | hooves | -40.0 | +0.00 |
| 35.20–35.32 | hooves | -37.0 | +0.00 |
| 35.31–35.43 | hooves | -37.0 | +0.00 |
| 35.42–35.54 | hooves | -37.0 | +0.00 |
| 35.53–35.65 | hooves | -40.0 | +0.00 |
| 35.80–35.92 | hooves | -37.0 | +0.00 |
| 35.91–36.03 | hooves | -37.0 | +0.00 |
| 36.02–36.14 | hooves | -37.0 | +0.00 |
| 36.13–36.25 | hooves | -40.0 | +0.00 |
| 36.40–36.52 | hooves | -37.0 | +0.00 |
| 36.51–36.63 | hooves | -37.0 | +0.00 |
| 36.62–36.74 | hooves | -37.0 | +0.00 |
| 36.73–36.85 | hooves | -40.0 | +0.00 |
| 37.00–37.12 | hooves | -37.0 | +0.00 |
| 37.11–37.23 | hooves | -37.0 | +0.00 |
| 37.22–37.34 | hooves | -37.0 | +0.00 |
| 37.33–37.45 | hooves | -40.0 | +0.00 |
| 37.60–37.72 | hooves | -37.0 | +0.00 |
| 40.90–43.10 | steam, second train | -34.0 | -0.20 |
| 40.90–43.80 | second train rolls in | -34.0 | -0.20 |
| 41.00–41.90 | second train | -38.0 | -0.20 |
| 41.20–43.20 | train rolling in | -40.0 | -0.20 |
| 44.00–45.98 | riser into the ramp | -30.0 | +0.00 |
| 45.45–45.95 | the ramp falls | -36.0 | +0.00 |
| 45.98–46.48 | the ramp hits the ground | -26.0 | +0.00 |
| 45.98–47.78 | bass drop: the ramp hits the ground | -20.0 | +0.00 |
| 48.50–48.62 | posse hooves | -35.0 | +0.20 |
| 48.61–48.73 | posse hooves | -35.0 | +0.20 |
| 48.72–48.84 | posse hooves | -35.0 | +0.20 |
| 48.83–48.95 | posse hooves | -38.0 | +0.20 |
| 49.10–49.22 | posse hooves | -35.0 | +0.20 |
| 49.21–49.33 | posse hooves | -35.0 | +0.20 |
| 49.32–49.44 | posse hooves | -35.0 | +0.20 |
| 49.43–49.55 | posse hooves | -38.0 | +0.20 |
| 49.70–49.82 | posse hooves | -35.0 | +0.20 |
| 49.81–49.93 | posse hooves | -35.0 | +0.20 |
| 49.92–50.04 | posse hooves | -35.0 | +0.20 |
| 50.03–50.15 | posse hooves | -38.0 | +0.20 |
| 50.30–50.42 | posse hooves | -35.0 | +0.20 |
| 50.41–50.53 | posse hooves | -35.0 | +0.20 |
| 50.52–50.64 | posse hooves | -35.0 | +0.20 |
| 50.63–50.75 | posse hooves | -38.0 | +0.20 |
| 50.90–51.02 | posse hooves | -35.0 | +0.20 |
| 51.01–51.13 | posse hooves | -35.0 | +0.20 |
| 51.12–51.24 | posse hooves | -35.0 | +0.20 |
| 51.23–51.35 | posse hooves | -38.0 | +0.20 |
| 51.50–51.62 | posse hooves | -35.0 | +0.20 |
| 51.61–51.73 | posse hooves | -35.0 | +0.20 |
| 51.72–51.84 | posse hooves | -35.0 | +0.20 |
| 51.83–51.95 | posse hooves | -38.0 | +0.20 |
| 52.00–52.12 | posse far | -42.0 | +0.20 |
| 52.11–52.23 | posse far | -42.0 | +0.20 |
| 52.22–52.34 | posse far | -42.0 | +0.20 |
| 52.33–52.45 | posse far | -45.0 | +0.20 |
| 52.60–52.72 | posse far | -42.0 | +0.20 |
| 52.71–52.83 | posse far | -42.0 | +0.20 |
| 52.82–52.94 | posse far | -42.0 | +0.20 |
| 52.93–53.05 | posse far | -45.0 | +0.20 |
| 53.20–53.32 | posse far | -42.0 | +0.20 |
| 53.31–53.43 | posse far | -42.0 | +0.20 |
| 53.42–53.54 | posse far | -42.0 | +0.20 |
| 53.53–53.65 | posse far | -45.0 | +0.20 |
| 53.80–53.92 | posse far | -42.0 | +0.20 |
| 53.91–54.03 | posse far | -42.0 | +0.20 |
| 54.02–54.14 | posse far | -42.0 | +0.20 |
| 54.13–54.25 | posse far | -45.0 | +0.20 |
| 54.40–54.52 | posse far | -42.0 | +0.20 |
| 54.51–54.63 | posse far | -42.0 | +0.20 |
| 54.62–54.74 | posse far | -42.0 | +0.20 |
| 54.73–54.85 | posse far | -45.0 | +0.20 |
| 55.50–55.80 | delivering | -34.0 | +0.00 |
| 60.20–61.40 | the horse eats hay | -38.0 | +0.00 |
| 62.30–66.40 | fastest engine | -30.0 | +0.00 |
| 62.60–65.20 | engine steam | -36.0 | +0.00 |
| 66.50–66.62 | hooves | -38.0 | +0.00 |
| 66.61–66.73 | hooves | -38.0 | +0.00 |
| 66.72–66.84 | hooves | -38.0 | +0.00 |
| 66.83–66.95 | hooves | -41.0 | +0.00 |
| 67.10–67.22 | hooves | -38.0 | +0.00 |
| 67.21–67.33 | hooves | -38.0 | +0.00 |
| 67.32–67.44 | hooves | -38.0 | +0.00 |
| 67.43–67.55 | hooves | -41.0 | +0.00 |
| 67.70–67.82 | hooves | -38.0 | +0.00 |
| 67.81–67.93 | hooves | -38.0 | +0.00 |
| 67.92–68.04 | hooves | -38.0 | +0.00 |
| 68.03–68.15 | hooves | -41.0 | +0.00 |
| 68.30–68.42 | hooves | -38.0 | +0.00 |
| 68.41–68.53 | hooves | -38.0 | +0.00 |
| 68.52–68.64 | hooves | -38.0 | +0.00 |
| 68.63–68.75 | hooves | -41.0 | +0.00 |
| 68.90–69.02 | hooves | -38.0 | +0.00 |
| 71.50–78.75 | the train you leave on, runs through the loop | -42.0 | +0.00 |
| 71.80–72.80 | the depot | -40.0 | +0.20 |
| 74.70–75.00 | ticket | -38.0 | +0.00 |
| 75.90–76.50 | on a train | -36.0 | +0.00 |
| 77.20–77.80 | hay | -40.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **12.23 LU**, median **19.14 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook: the gallop | -16.1 | -37.4 | -31.8 | 8.0 / 11.0 |
| A train can't leave the rails | -16.5 | -38.5 | silence | 12.0 / 18.4 |
| The odd car, the gang laughs | -16.3 | -39.3 | -40.0 | 16.3 / 19.3 |
| Night, the lantern | -16.1 | -38.1 | -36.8 | 9.4 / 13.3 |
| The blast | -16.6 | -39.4 | -27.9 | 8.0 / 8.5 |
| The ride, the count | -15.4 | -36.5 | -33.5 | 8.0 / 13.0 |
| You laugh on the ridge | -15.4 | -37.4 | silence | 12.0 / 13.4 |
| The second train | -16.2 | -37.8 | -32.3 | 8.0 / 11.0 |
| Horses down the ramp | -14.6 | -35.4 | -31.9 | 8.0 / 12.9 |
| You see: delivering | -16.1 | -41.4 | -38.3 | 8.0 / 18.8 |
| The fastest engine | -16.5 | -39.2 | -31.2 | 8.0 / 9.8 |
| They never catch you | -16.8 | -38.5 | -35.2 | 8.0 / 11.7 |
| Leaving the West | -15.9 | -38.9 | -41.4 | 14.6 / 18.1 |
