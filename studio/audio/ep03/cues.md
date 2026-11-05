# ep03 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **4,656,000 frames = 97.000 s**.
- Supplied voice: **95.717 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.73 | 2.27 |
| voice | -16.00 | -1.78 | 2.29 |
| music | -37.56 | -16.84 | 4.26 |
| sfx | -35.19 | -10.81 | 8.20 |

Voice gain tổng: **-1.75 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.4 LUFS

  Loudness range:
    LRA:         2.3 LU
    Threshold: -36.4 LUFS
    LRA low:   -17.4 LUFS
    LRA high:  -15.1 LUFS

  True peak:
    Peak:       -1.7 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 3 s / out 5 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–6.50 | Hook: the richest teenagers | -21.0 |
| 6.50–28.50 | The menu, the deal, level-ups | -21.0 |
| 28.50–53.60 | The world does the math | -21.0 |
| 53.60–57.00 | Banks lend years | -23.0 |
| 57.00–71.20 | You see: discounting | -22.0 |
| 71.20–92.50 | Nature plays the game: dogs | -22.0 |
| 92.50–97.00 | The question | -20.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 4.87–5.27 | coins of years sparkle | -34.0 | +0.20 |
| 6.45–6.95 | hook flash | -32.0 | +0.00 |
| 8.78–9.18 | menu pops | -34.0 | +0.30 |
| 9.55–9.67 | +1 level highlight | -32.0 | +0.30 |
| 10.61–10.73 | -1 year highlight | -32.0 | +0.30 |
| 17.43–18.03 | last year peels off | -36.0 | +0.20 |
| 19.99–20.59 | level up 1 | -30.0 | +0.00 |
| 20.87–21.47 | level up 2 | -30.0 | +0.00 |
| 21.80–26.80 | running | -38.0 | +0.00 |
| 27.64–28.04 | ten years gone | -34.0 | +0.00 |
| 37.70–38.40 | superhero aura | -30.0 | +0.00 |
| 44.18–44.48 | hourglass | -36.0 | -0.20 |
| 51.04–51.74 | gold medal | -34.0 | +0.00 |
| 52.68–53.08 | retired at 41 | -34.0 | +0.20 |
| 56.18–56.38 | 12% stamp | -30.0 | +0.00 |
| 69.41–69.91 | credit card slides in | -34.0 | +0.30 |
| 79.47–79.97 | Great Dane appears | -36.0 | -0.20 |
| 84.18–84.48 | Chihuahua appears | -34.0 | +0.30 |
| 87.50–87.70 | study card | -30.0 | +0.00 |
| 95.20–95.32 | menu click | -32.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **16.60 LU**, median **22.51 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook: the richest teenagers | -16.3 | -37.9 | -34.0 | 13.5 / 16.7 |
| The menu, the deal, level-ups | -15.8 | -36.9 | -36.0 | 8.0 / 14.0 |
| The world does the math | -16.1 | -37.3 | -36.6 | 8.0 / 17.0 |
| Banks lend years | -15.4 | -38.4 | -31.0 | 9.9 / 14.8 |
| You see: discounting | -15.6 | -37.6 | -35.0 | 8.3 / 17.5 |
| Nature plays the game: dogs | -16.4 | -38.5 | -33.3 | 8.0 / 17.3 |
| The question | -15.5 | -44.8 | -32.0 | 13.1 / 17.3 |
