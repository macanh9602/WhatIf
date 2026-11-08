# ep21 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,758,400 frames = 78.300 s**.
- Supplied voice: **78.300 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.52 | 2.10 |
| voice | -15.94 | -1.55 | 2.01 |
| music | -42.01 | -22.28 | 7.04 |
| sfx | -31.01 | -12.30 | 22.45 |

Voice gain tổng: **-0.16 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.7 LUFS

  Loudness range:
    LRA:         2.1 LU
    Threshold: -36.8 LUFS
    LRA low:   -17.8 LUFS
    LRA high:  -15.7 LUFS

  True peak:
    Peak:       -1.5 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 0 s / out 0 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–19.65 | Talkton arrival: dry bounce | -24.0 |
| 19.65–39.40 | Market: thin bounce | -26.0 |
| 39.40–50.20 | Bridge, golden: warm | -27.0 |
| 50.20–67.80 | Night street: low pad | -30.0 |
| 67.80–73.80 | Ten words left: pulse, dead stop at the cut | -26.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 0.20–5.20 | town street, light wind | -49.9 | +0.00 |
| 4.40–5.60 | bus pulls away | -43.9 | +0.30 |
| 9.40–9.55 | guide box ticks | -37.9 | +0.20 |
| 13.00–13.15 | meter ticks | -37.9 | +0.20 |
| 20.00–26.00 | market murmur | -51.9 | +0.00 |
| 24.20–24.60 | bread bag | -45.9 | +0.00 |
| 28.90–29.30 | man bumps you | -35.9 | +0.00 |
| 31.90–32.20 | sorry price board | -41.9 | +0.00 |
| 36.90–37.05 | meter at half | -37.9 | +0.20 |
| 40.00–44.00 | creek under the bridge | -47.9 | +0.00 |
| 47.40–47.70 | coin drops in the meter | -43.9 | +0.20 |
| 50.40–54.40 | night air | -51.9 | +0.00 |
| 58.00–59.00 | porch steps | -43.9 | +0.00 |
| 59.30–59.50 | knock | -35.9 | +0.00 |
| 59.55–59.75 | knock | -35.9 | +0.00 |
| 60.70–61.20 | door opens | -47.9 | +0.00 |
| 62.90–63.20 | bills flutter into the slot | -41.9 | +0.30 |
| 64.80–65.70 | pling: paid | -39.9 | +0.00 |
| 68.70–73.70 | meter ticks fast | -47.9 | +0.00 |
| 74.65–75.05 | meter: out of credit | -23.9 | +0.00 |
| 74.68–75.58 | display powers down | -45.9 | +0.00 |
| 75.20–76.10 | the strip prints | -35.9 | +0.00 |
| 76.70–77.60 | Mia giggles, pats the jacket (synth, effects.py) | -20.9 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **10.30 LU**, p10 **22.40 LU**, median **27.44 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Talkton arrival: dry bounce | -15.9 | -39.9 | -44.8 | 11.4 / 20.8 |
| Market: thin bounce | -15.9 | -41.9 | -44.8 | 10.3 / 23.2 |
| Bridge, golden: warm | -16.2 | -43.2 | -47.6 | 16.5 / 23.9 |
| Night street: low pad | -15.8 | -45.8 | -43.4 | 14.7 / 25.5 |
| Ten words left: pulse, dead stop at the cut | -15.9 | -41.9 | -48.1 | 12.0 / 21.2 |
