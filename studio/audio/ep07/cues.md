# ep07 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,336,000 frames = 69.500 s**.
- Supplied voice: **68.570 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.72 | 2.19 |
| voice | -16.02 | -1.75 | 2.21 |
| music | -37.70 | -18.51 | 4.00 |
| sfx | -36.70 | -9.27 | 11.84 |

Voice gain tổng: **-1.69 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.4 LUFS

  Loudness range:
    LRA:         2.2 LU
    Threshold: -36.3 LUFS
    LRA low:   -17.4 LUFS
    LRA high:  -15.2 LUFS

  True peak:
    Peak:       -1.7 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 3 s / out 5 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–5.20 | Hook: survive any fall, starve by lunch | -21.0 |
| 5.20–16.80 | The dial, the step off the counter | -21.0 |
| 16.80–29.15 | Square and cube | -22.0 |
| 29.15–43.60 | Heat, the shrew, the cold wins | -22.0 |
| 43.60–60.30 | The drip, the shout, the cat | -22.0 |
| 60.30–65.85 | Full size, a giant lunch | -21.0 |
| 65.85–69.50 | The question | -20.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 5.15–5.65 | hook flash | -32.0 | +0.00 |
| 7.75–7.87 | dial click | -30.0 | +0.20 |
| 7.80–9.90 | dial ratchet down | -36.0 | +0.20 |
| 9.95–10.25 | 1 cm | -34.0 | +0.20 |
| 10.70–11.60 | steps to the edge | -40.0 | +0.10 |
| 11.70–13.60 | drift down | -38.0 | +0.00 |
| 15.10–15.40 | land | -36.0 | +0.00 |
| 18.50–19.00 | cube shrinks | -38.0 | +0.00 |
| 20.95–21.25 | square | -34.0 | -0.20 |
| 22.95–23.25 | cube | -32.0 | +0.20 |
| 24.20–24.50 | five million | -34.0 | +0.00 |
| 26.70–27.60 | air catches you | -38.0 | +0.00 |
| 31.15–31.75 | heat out | -38.0 | +0.00 |
| 32.10–32.40 | x170 | -34.0 | +0.00 |
| 37.40–38.00 | shrew eats | -40.0 | +0.20 |
| 40.30–40.90 | every day | -38.0 | +0.00 |
| 41.40–42.40 | hours pass | -40.0 | -0.20 |
| 42.80–43.40 | the cold wins | -36.0 | +0.00 |
| 44.80–45.10 | drop lets go | -38.0 | +0.20 |
| 46.60–47.50 | drop hits | -32.0 | +0.00 |
| 47.30–49.90 | inside the drop | -46.0 | +0.00 |
| 50.30–50.90 | tiny shout | -40.0 | +0.10 |
| 53.95–54.85 | too high | -38.0 | +0.10 |
| 56.80–57.20 | cat eye opens | -40.0 | +0.30 |
| 59.40–60.10 | cat: mrrow | -38.0 | +0.40 |
| 59.60–59.90 | paw lands | -34.0 | +0.40 |
| 60.80–60.92 | dial click up | -30.0 | +0.20 |
| 60.85–62.15 | dial ratchet up | -36.0 | +0.20 |
| 61.40–62.20 | grow | -36.0 | +0.00 |
| 64.75–65.15 | bite | -38.0 | +0.00 |
| 66.40–67.20 | the question | -36.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **15.41 LU**, median **21.43 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook: survive any fall, starve by lunch | -15.0 | -36.8 | -47.6 | 14.0 / 19.9 |
| The dial, the step off the counter | -15.9 | -36.9 | -35.7 | 8.0 / 14.6 |
| Square and cube | -16.1 | -38.1 | -35.2 | 9.0 / 15.2 |
| Heat, the shrew, the cold wins | -16.5 | -38.5 | -39.2 | 8.0 / 15.0 |
| The drip, the shout, the cat | -16.0 | -38.0 | -39.6 | 8.4 / 15.7 |
| Full size, a giant lunch | -16.1 | -37.2 | -33.8 | 11.8 / 13.8 |
| The question | -15.3 | -46.7 | -38.8 | 20.0 / 21.0 |
