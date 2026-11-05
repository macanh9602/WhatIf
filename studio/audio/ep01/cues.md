# ep01 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **4,646,400 frames = 96.800 s**.
- Supplied voice: **95.435 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.48 | 2.50 |
| voice | -16.02 | -1.76 | 2.49 |
| music | -37.31 | -18.39 | 5.17 |
| sfx | -35.07 | -10.50 | 14.73 |

Voice gain tổng: **-1.71 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
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
    Peak:       -1.5 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 3 s / out 5 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–6.20 | Hook: green drains | -21.0 |
| 6.20–37.20 | Morning in a pink world | -21.0 |
| 37.20–51.00 | Eyes, parrot | -22.0 |
| 51.00–54.00 | Turn: the part that hurts | -25.0 |
| 54.00–71.80 | Cooling and snow | -21.0 |
| 71.80–75.90 | Black trees still growing | -24.0 |
| 75.90–91.40 | You see: the leaf | -22.0 |
| 91.40–96.80 | Green returns | -20.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 1.40–2.60 | green drains from the horizon | -34.0 | +0.00 |
| 6.15–6.65 | hook flash | -32.0 | +0.00 |
| 7.55–8.15 | curtains swish open | -32.0 | -0.20 |
| 18.30–22.90 | push mower rolling | -40.0 | +0.30 |
| 32.78–32.90 | amber | -32.0 | +0.40 |
| 33.74–33.86 | green slot dark | -32.0 | +0.40 |
| 34.81–35.21 | shrug | -36.0 | +0.00 |
| 49.16–49.46 | parrot blink | -34.0 | +0.20 |
| 53.22–53.47 | the part that hurts | -34.0 | +0.00 |
| 70.76–71.36 | the planet freezes | -32.0 | +0.00 |
| 74.96–75.21 | bud pops | -34.0 | +0.30 |
| 91.60–92.40 | green comes back | -32.0 | +0.00 |
| 94.53–95.33 | the gift | -36.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **17.37 LU**, median **22.24 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook: green drains | -16.8 | -38.1 | -36.8 | 13.0 / 17.5 |
| Morning in a pink world | -15.6 | -36.6 | -34.5 | 8.0 / 17.0 |
| Eyes, parrot | -16.8 | -38.8 | -34.1 | 10.8 / 17.4 |
| Turn: the part that hurts | -17.6 | -42.6 | -34.1 | 12.0 / 15.4 |
| Cooling and snow | -15.4 | -36.4 | -34.3 | 8.2 / 17.2 |
| Black trees still growing | -16.7 | -40.7 | -34.1 | 16.0 / 18.0 |
| You see: the leaf | -16.0 | -38.0 | silence | 9.4 / 18.6 |
| Green returns | -16.3 | -43.0 | -36.6 | 14.6 / 19.5 |
