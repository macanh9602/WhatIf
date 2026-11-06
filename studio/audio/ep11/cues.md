# ep11 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,144,000 frames = 65.500 s**.
- Supplied voice: **64.579 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.96 | 2.41 |
| voice | -16.03 | -1.99 | 2.41 |
| music | -37.63 | -17.03 | 3.82 |
| sfx | -37.63 | -12.79 | 8.19 |

Voice gain tổng: **-2.03 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
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
    LRA low:   -17.6 LUFS
    LRA high:  -15.2 LUFS

  True peak:
    Peak:       -2.0 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 3 s / out 5 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–4.30 | Hook: one bite of toast | -21.0 |
| 4.30–10.70 | Wake up green, step outside | -21.0 |
| 10.70–15.95 | The long stand in the sun | -21.0 |
| 15.95–27.50 | 1 percent, the leaf | -22.0 |
| 27.50–40.10 | Tree, brain, skin | -22.0 |
| 40.10–44.30 | The tennis court | -21.0 |
| 44.30–55.40 | The sea slug | -22.0 |
| 55.40–62.70 | Sunset and the one bite | -22.0 |
| 62.70–65.50 | The question | -20.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 3.60–3.90 | one bite | -34.0 | -0.20 |
| 4.25–4.75 | hook flash | -32.0 | +0.00 |
| 5.78–6.18 | green | -38.0 | +0.00 |
| 7.65–7.95 | sunlight | -36.0 | +0.20 |
| 8.75–9.25 | plate shoved | -38.0 | -0.20 |
| 8.95–9.25 | cancelled stamp | -36.0 | -0.20 |
| 9.55–10.35 | steps out | -40.0 | +0.00 |
| 10.20–10.70 | sun glare | -38.0 | +0.00 |
| 10.75–13.95 | the clock spins | -40.0 | +0.20 |
| 15.15–15.45 | panel glint | -34.0 | +0.20 |
| 16.70–16.82 | HUD opens | -32.0 | +0.00 |
| 18.90–19.50 | 1 percent | -36.0 | +0.00 |
| 22.05–22.55 | leaf | -38.0 | +0.00 |
| 25.30–25.60 | 2 percent | -34.0 | +0.20 |
| 25.80–26.20 | light bounces | -40.0 | +0.30 |
| 26.80–27.10 | food | -36.0 | -0.20 |
| 29.60–30.40 | you run | -40.0 | +0.00 |
| 29.95–30.25 | no legs tag | -38.0 | +0.00 |
| 30.87–31.17 | no brain tag | -36.0 | +0.00 |
| 32.50–33.30 | thousands of leaves | -40.0 | +0.00 |
| 34.95–35.45 | brain chews | -38.0 | -0.20 |
| 35.80–36.10 | a fifth | -34.0 | +0.20 |
| 37.90–38.80 | skin unfolds | -38.0 | +0.00 |
| 38.15–38.45 | 2 m2 | -34.0 | +0.20 |
| 42.00–44.00 | skin rolls out | -36.0 | +0.00 |
| 43.80–44.10 | court covered | -34.0 | +0.00 |
| 46.90–48.90 | under water | -46.0 | +0.00 |
| 47.40–47.70 | slug steals | -38.0 | +0.20 |
| 49.55–49.95 | eats | -40.0 | +0.20 |
| 50.75–51.95 | calendar flips | -40.0 | -0.20 |
| 51.65–51.95 | no meal | -36.0 | +0.20 |
| 53.35–53.65 | GROWTH: NO stamp | -30.0 | +0.00 |
| 56.30–57.50 | walks in | -42.0 | +0.00 |
| 58.05–58.45 | toast pops | -36.0 | -0.30 |
| 59.25–59.65 | the bite | -34.0 | +0.00 |
| 60.30–61.00 | HUD falls | -40.0 | +0.00 |
| 63.90–64.70 | the question | -36.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **16.36 LU**, median **21.47 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook: one bite of toast | -15.3 | -37.9 | -34.0 | 8.7 / 17.0 |
| Wake up green, step outside | -15.1 | -36.1 | -37.5 | 14.1 / 16.7 |
| The long stand in the sun | -15.4 | -36.4 | -39.0 | 10.3 / 16.9 |
| 1 percent, the leaf | -16.3 | -38.3 | -36.0 | 9.3 / 15.0 |
| Tree, brain, skin | -15.9 | -37.9 | -37.5 | 9.2 / 16.4 |
| The tennis court | -15.8 | -36.8 | -37.2 | 8.0 / 12.6 |
| The sea slug | -16.5 | -38.6 | -38.0 | 8.0 / 16.8 |
| Sunset and the one bite | -16.7 | -39.0 | -40.0 | 11.0 / 17.7 |
| The question | -15.7 | -51.6 | -38.4 | 19.4 / 21.1 |
