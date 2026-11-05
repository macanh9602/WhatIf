# ep05 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,912,000 frames = 81.500 s**.
- Supplied voice: **80.586 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.59 | 2.99 |
| voice | -16.01 | -1.97 | 3.00 |
| music | -37.61 | -17.08 | 3.30 |
| sfx | -34.26 | -11.27 | 14.00 |

Voice gain tổng: **-1.98 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.4 LUFS

  Loudness range:
    LRA:         3.0 LU
    Threshold: -36.4 LUFS
    LRA low:   -17.9 LUFS
    LRA high:  -14.9 LUFS

  True peak:
    Peak:       -1.6 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 3 s / out 5 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–7.40 | Hook: everyone grinds | -21.0 |
| 7.40–21.80 | Countdown + inside your head | -21.0 |
| 21.80–44.30 | Explain: sound, force, Earth | -22.0 |
| 44.30–59.00 | The real damage: enamel | -22.0 |
| 59.00–77.60 | Night shift | -21.0 |
| 77.60–81.50 | The question | -20.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 2.00–3.60 | everyone grinds | -36.0 | +0.00 |
| 4.30–6.90 | the loudest: you | -32.0 | -0.10 |
| 7.35–7.85 | hook flash | -32.0 | +0.00 |
| 7.61–7.73 | three | -32.0 | -0.20 |
| 8.33–8.45 | two | -32.0 | -0.20 |
| 9.21–9.33 | one | -32.0 | -0.20 |
| 10.20–11.70 | grind | -30.0 | +0.00 |
| 11.00–14.60 | gravel in a blender | -32.0 | +0.00 |
| 20.80–21.20 | the tiny squeak | -38.0 | +0.30 |
| 29.95–30.25 | hard bite | -30.0 | +0.00 |
| 32.40–32.75 | seventy kilos | -32.0 | -0.20 |
| 36.20–36.50 | pyramids pop | -34.0 | +0.00 |
| 40.40–40.52 | jaw pushes | -34.0 | +0.20 |
| 42.70–42.82 | skull pushes back | -34.0 | +0.20 |
| 51.30–53.30 | grinding wears it down | -36.0 | +0.00 |
| 54.80–55.40 | never grows back | -36.0 | +0.00 |
| 57.60–58.20 | already happening | -34.0 | +0.00 |
| 61.80–64.20 | grinding in their sleep | -38.0 | +0.00 |
| 69.30–71.10 | sanding away | -38.0 | +0.00 |
| 76.80–77.10 | night shift badge | -34.0 | +0.20 |
| 79.50–80.30 | the question | -36.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **15.11 LU**, median **21.37 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook: everyone grinds | -14.8 | -36.7 | -34.7 | 8.0 / 12.9 |
| Countdown + inside your head | -16.5 | -37.6 | -31.9 | 8.0 / 13.7 |
| Explain: sound, force, Earth | -16.1 | -38.3 | -32.7 | 8.0 / 15.4 |
| The real damage: enamel | -15.5 | -37.5 | -37.0 | 13.2 / 18.0 |
| Night shift | -16.4 | -37.4 | -38.3 | 8.5 / 16.7 |
| The question | -16.6 | -45.2 | -38.5 | 14.1 / 18.5 |
