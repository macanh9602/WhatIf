# ep02 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **4,334,400 frames = 90.300 s**.
- Supplied voice: **88.881 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.62 | 2.50 |
| voice | -16.01 | -1.75 | 2.50 |
| music | -37.35 | -18.01 | 4.94 |
| sfx | -35.27 | -11.30 | 9.11 |

Voice gain tổng: **-1.77 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
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
    LRA low:   -17.6 LUFS
    LRA high:  -15.1 LUFS

  True peak:
    Peak:       -1.6 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 3 s / out 5 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–6.00 | Hook: floating away | -21.0 |
| 6.00–44.40 | Dial down: bouncy montage | -21.0 |
| 44.40–59.10 | Turning it up | -22.0 |
| 59.10–73.00 | You see: Earth's pull | -22.0 |
| 73.00–86.20 | Equator, plane ticket | -21.0 |
| 86.20–90.30 | The question | -20.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 4.45–5.35 | rising like a balloon | -34.0 | +0.00 |
| 5.95–6.45 | hook flash | -32.0 | +0.00 |
| 9.49–9.61 | dial click | -32.0 | +0.20 |
| 11.70–12.05 | trampoline bounce | -36.0 | -0.10 |
| 12.65–13.00 | trampoline bounce | -36.0 | -0.10 |
| 13.60–13.95 | trampoline bounce | -36.0 | -0.10 |
| 14.55–14.90 | trampoline bounce | -36.0 | -0.10 |
| 15.50–15.85 | trampoline bounce | -36.0 | -0.10 |
| 19.58–20.38 | big jump | -32.0 | +0.20 |
| 21.08–21.33 | lands on the roof | -32.0 | +0.20 |
| 25.96–26.96 | shoes squeak/skid | -38.0 | +0.00 |
| 29.88–31.48 | wind gust | -34.0 | -0.30 |
| 33.20–36.60 | blown down the street | -36.0 | +0.30 |
| 43.58–44.48 | rise | -36.0 | +0.00 |
| 44.94–45.06 | dial up | -32.0 | +0.20 |
| 55.44–55.74 | chair crash | -26.0 | +0.00 |
| 55.47–56.37 | splinters | -32.0 | +0.00 |
| 57.00–57.60 | elevator overload ding | -34.0 | +0.00 |
| 70.84–71.14 | tiny dial | -34.0 | +0.20 |
| 85.27–85.67 | ticket | -34.0 | -0.20 |
| 82.14–82.94 | the question | -36.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **15.95 LU**, median **21.98 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook: floating away | -15.4 | -37.1 | -36.4 | 8.0 / 16.3 |
| Dial down: bouncy montage | -15.8 | -36.9 | -36.4 | 8.0 / 15.3 |
| Turning it up | -16.5 | -38.6 | -32.5 | 8.0 / 16.2 |
| You see: Earth's pull | -15.6 | -37.9 | -34.1 | 8.0 / 17.3 |
| Equator, plane ticket | -16.4 | -37.5 | -37.3 | 8.0 / 16.9 |
| The question | -17.1 | -46.2 | silence | 20.2 / 27.2 |
