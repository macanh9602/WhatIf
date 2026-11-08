# ep18 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,771,200 frames = 78.567 s**.
- Supplied voice: **78.553 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.41 | 2.06 |
| voice | -16.01 | -1.71 | 2.14 |
| music | -45.50 | -26.54 | 8.87 |
| sfx | -35.71 | -13.06 | 23.85 |

Voice gain tổng: **-0.87 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.4 LUFS

  Loudness range:
    LRA:         2.1 LU
    Threshold: -36.3 LUFS
    LRA low:   -17.4 LUFS
    LRA high:  -15.3 LUFS

  True peak:
    Peak:       -1.4 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 0 s / out 0 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–13.30 | Living room: low unease | -29.0 |
| 13.30–24.60 | Roar builds: dark | -28.0 |
| 24.60–32.20 | Flight: near-silent float | -39.0 |
| 32.20–48.80 | Wake, rain, GPS walk: gentle pulse | -30.0 |
| 48.80–54.00 | Held note: 1307 feet | -29.0 |
| 54.00–58.00 | You see: near silence | -37.0 |
| 58.00–70.30 | Explain: low dark | -30.0 |
| 70.30–78.57 | Lamp: dry resolve | -27.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 0.00–13.00 | rain on tin roof | -50.0 | +0.00 |
| 0.30–4.30 | distant roar building | -48.0 | +0.00 |
| 4.50–8.50 | distant roar building | -47.0 | +0.00 |
| 8.00–8.30 | window rattles | -43.0 | +0.40 |
| 8.60–8.90 | window rattles | -41.0 | +0.40 |
| 9.00–9.30 | window rattles | -43.0 | +0.40 |
| 9.00–13.50 | distant roar building | -46.0 | +0.00 |
| 9.70–10.00 | window rattles | -45.0 | +0.40 |
| 13.00–24.50 | rain on tin roof | -49.0 | +0.00 |
| 13.30–16.50 | distant roar building | -43.0 | +0.00 |
| 14.80–17.80 | distant roar building | -40.0 | +0.00 |
| 15.00–17.50 | wind roar rising | -43.0 | -0.30 |
| 16.00–19.00 | distant roar building | -38.0 | +0.00 |
| 17.00–20.00 | distant roar building | -36.0 | +0.00 |
| 17.10–18.70 | floor rumble jelly | -42.0 | +0.00 |
| 18.50–21.50 | distant roar building | -35.0 | +0.00 |
| 18.75–19.45 | front door ripped off | -32.0 | -0.50 |
| 18.85–19.15 | front door slam | -36.0 | -0.40 |
| 19.50–23.00 | freight-train roar | -38.0 | +0.30 |
| 20.00–23.00 | distant roar building | -34.0 | +0.00 |
| 20.25–21.05 | back door ripped off | -32.0 | +0.50 |
| 20.35–20.65 | back door thud | -36.0 | +0.40 |
| 21.50–24.50 | distant roar building | -33.0 | +0.00 |
| 21.50–22.40 | window shatters | -34.0 | +0.30 |
| 21.60–21.90 | glass crack | -38.0 | +0.20 |
| 22.50–24.50 | freight-train roar | -36.0 | +0.00 |
| 22.80–25.00 | distant roar building | -32.0 | +0.00 |
| 22.85–23.15 | something hits your head | -30.0 | +0.00 |
| 23.00–24.40 | blackout drop | -37.0 | +0.00 |
| 24.90–28.90 | wind lifts you | -42.0 | -0.20 |
| 25.00–32.00 | far thunder in the air | -49.0 | +0.00 |
| 28.00–32.40 | wind in the air | -43.0 | +0.20 |
| 31.90–32.90 | soft grass landing | -44.0 | +0.00 |
| 32.00–49.00 | soft rain on the field | -49.0 | +0.00 |
| 32.00–32.30 | soft landing | -44.0 | +0.00 |
| 37.80–38.60 | fence creak | -44.0 | -0.30 |
| 38.40–38.90 | fence creak | -46.0 | -0.30 |
| 38.90–40.80 | gravel steps | -41.0 | +0.00 |
| 40.95–41.10 | door knock | -36.0 | +0.00 |
| 41.15–41.30 | door knock | -36.0 | +0.00 |
| 41.35–41.50 | door knock | -36.0 | +0.00 |
| 46.30–47.60 | walking the field | -45.0 | +0.00 |
| 47.60–47.72 | GPS beep | -36.0 | +0.00 |
| 47.90–48.02 | GPS tone | -57.0 | +0.00 |
| 48.00–50.60 | walking on the field | -48.0 | +0.00 |
| 48.10–48.22 | GPS beep | -36.0 | +0.00 |
| 49.00–57.00 | rain thinning at dawn | -53.0 | +0.00 |
| 49.60–49.72 | GPS tick | -40.0 | +0.00 |
| 50.60–50.72 | GPS tick | -40.0 | +0.00 |
| 51.60–51.72 | GPS tick | -40.0 | +0.00 |
| 70.00–78.20 | last rain | -56.0 | +0.00 |
| 70.90–71.20 | lamp base thunk | -31.0 | +0.00 |
| 71.00–71.35 | brass ring | -43.0 | +0.00 |
| 76.90–77.30 | lamp settles | -50.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **16.67 LU**, median **27.51 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Living room: low unease | -16.2 | -45.2 | -44.7 | 13.5 / 21.3 |
| Roar builds: dark | -16.5 | -44.8 | -31.0 | 8.0 / 10.4 |
| Flight: near-silent float | -15.6 | -54.6 | -44.0 | 17.0 / 25.1 |
| Wake, rain, GPS walk: gentle pulse | -15.9 | -45.9 | -42.8 | 12.2 / 19.1 |
| Held note: 1307 feet | -16.5 | -45.5 | -44.9 | 14.5 / 22.0 |
| You see: near silence | -15.1 | -52.1 | -53.9 | 24.8 / 30.8 |
| Explain: low dark | -16.1 | -46.1 | -59.7 | 17.7 / 26.1 |
| Lamp: dry resolve | -15.6 | -42.6 | -34.2 | 12.9 / 19.8 |
