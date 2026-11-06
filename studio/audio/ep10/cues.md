# ep10 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,907,200 frames = 81.400 s**.
- Supplied voice: **80.563 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.63 | 2.74 |
| voice | -16.00 | -1.89 | 2.76 |
| music | -37.58 | -16.41 | 4.53 |
| sfx | -36.12 | -8.27 | 11.50 |

Voice gain tổng: **-1.89 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.4 LUFS

  Loudness range:
    LRA:         2.7 LU
    Threshold: -36.4 LUFS
    LRA low:   -17.8 LUFS
    LRA high:  -15.0 LUFS

  True peak:
    Peak:       -1.6 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 3 s / out 5 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–4.60 | Hook: thin air | -21.0 |
| 4.60–24.85 | Cartoon morning, the run | -21.0 |
| 24.85–37.45 | Hanging, the 1980 law | -22.0 |
| 37.45–48.60 | Anvil, pancake, pop | -21.0 |
| 48.60–64.95 | Squash and stretch | -22.0 |
| 64.95–75.60 | 11:59, midnight | -22.0 |
| 75.60–81.40 | The question | -20.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 3.90–4.25 | glance down gulp | -40.0 | +0.10 |
| 4.55–5.05 | hook flash | -32.0 | +0.00 |
| 6.65–7.50 | outline inks thick | -40.0 | +0.00 |
| 9.75–10.25 | saucer eyes | -30.0 | +0.00 |
| 11.00–11.20 | finger 1 | -38.0 | -0.20 |
| 11.29–11.49 | finger 2 | -38.0 | -0.20 |
| 11.58–11.78 | finger 3 | -37.0 | -0.20 |
| 11.86–12.11 | finger 4 | -35.0 | -0.20 |
| 13.55–14.25 | eraser | -38.0 | +0.20 |
| 15.30–18.30 | flipbook riffle | -40.0 | +0.00 |
| 18.55–18.85 | 5,040 | -32.0 | +0.00 |
| 19.90–20.20 | run start | -38.0 | +0.00 |
| 20.73–22.85 | leg-spin whirr + stomp | -34.0 | +0.00 |
| 22.98–23.38 | zip off the edge | -30.0 | +0.30 |
| 23.75–24.10 | you zip past the lip | -34.0 | +0.10 |
| 26.35–27.55 | page flutters past | -40.0 | -0.20 |
| 30.70–31.00 | the law | -38.0 | +0.20 |
| 34.50–35.50 | ghost drops | -42.0 | +0.00 |
| 35.88–36.00 | storey tag | -38.0 | +0.00 |
| 38.00–38.35 | look down gulp | -36.0 | +0.00 |
| 38.85–39.65 | fall whistle | -34.0 | +0.00 |
| 39.85–40.15 | land on the street | -30.0 | +0.00 |
| 40.05–40.45 | anvil whistle | -40.0 | +0.00 |
| 40.43–41.03 | anvil clang | -26.0 | +0.00 |
| 40.43–40.78 | anvil impact | -28.0 | +0.00 |
| 41.75–42.05 | anvil hops off | -34.0 | +0.30 |
| 44.00–45.10 | peel off the street | -36.0 | +0.00 |
| 45.88–46.38 | shake | -38.0 | +0.00 |
| 46.83–47.33 | pop back | -28.0 | +0.00 |
| 50.62–51.02 | squash | -36.0 | -0.20 |
| 51.45–51.75 | stretch | -40.0 | -0.20 |
| 52.42–52.72 | rule #1 | -36.0 | +0.00 |
| 54.80–55.40 | one condition | -40.0 | +0.20 |
| 56.40–56.65 | press flattens | -34.0 | +0.00 |
| 60.38–60.68 | SAME | -32.0 | +0.00 |
| 63.60–63.90 | real body lands | -30.0 | +0.20 |
| 64.10–64.40 | NO BOUNCE | -32.0 | +0.20 |
| 65.00–71.30 | 11:59 ticking | -44.0 | -0.20 |
| 71.38–72.38 | midnight | -32.0 | +0.00 |
| 72.70–73.05 | fifth finger | -34.0 | +0.30 |
| 74.50–75.50 | fall whistle | -34.0 | +0.00 |
| 75.83–76.13 | land on the awning | -32.0 | +0.00 |
| 75.86–76.26 | awning springs | -36.0 | +0.20 |
| 80.30–81.10 | the question | -40.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **14.93 LU**, median **21.40 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook: thin air | -15.1 | -37.4 | -42.3 | 8.0 / 14.5 |
| Cartoon morning, the run | -15.9 | -36.9 | -36.8 | 8.0 / 13.5 |
| Hanging, the 1980 law | -16.0 | -38.0 | -40.7 | 8.5 / 18.4 |
| Anvil, pancake, pop | -16.3 | -38.0 | -33.3 | 8.0 / 11.4 |
| Squash and stretch | -16.0 | -38.0 | -34.4 | 8.3 / 15.9 |
| 11:59, midnight | -15.8 | -37.8 | -39.3 | 9.9 / 16.0 |
| The question | -16.8 | -41.2 | -35.3 | 11.9 / 17.7 |
