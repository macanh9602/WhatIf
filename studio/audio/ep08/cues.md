# ep08 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,480,000 frames = 72.500 s**.
- Supplied voice: **71.622 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.64 | 2.66 |
| voice | -16.03 | -1.90 | 2.65 |
| music | -37.59 | -19.00 | 4.17 |
| sfx | -38.57 | -15.85 | 8.88 |

Voice gain tổng: **-1.90 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
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
    LRA low:   -17.6 LUFS
    LRA high:  -15.0 LUFS

  True peak:
    Peak:       -1.6 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 3 s / out 5 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–5.20 | Hook: breathing the bath | -21.0 |
| 5.20–11.40 | Gills, the beach | -21.0 |
| 11.40–24.15 | Heavy and thin | -22.0 |
| 24.15–29.85 | The reef is yours | -21.0 |
| 29.85–49.20 | Shiver, the radiator | -22.0 |
| 49.20–59.85 | Cold fish, the opah | -22.0 |
| 59.85–69.05 | Back to shore, the hot bath | -21.0 |
| 69.05–72.50 | The question | -20.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 0.05–4.95 | bath bubbles (hook) | -40.0 | +0.10 |
| 0.05–5.05 | pump hum (hook) | -46.0 | -0.30 |
| 5.15–5.65 | hook flash | -32.0 | +0.00 |
| 6.60–6.90 | gills! | -34.0 | +0.20 |
| 7.90–10.20 | wading in | -42.0 | +0.00 |
| 10.07–10.97 | dunk, first breath | -32.0 | +0.00 |
| 10.80–11.60 | first breath bubbles | -38.0 | +0.00 |
| 11.60–12.20 | it works | -40.0 | +0.00 |
| 13.25–13.55 | heavy | -34.0 | +0.00 |
| 14.10–14.60 | water cube drops | -36.0 | +0.20 |
| 14.95–15.30 | x800 slam | -30.0 | +0.10 |
| 18.35–18.65 | thirty | -34.0 | +0.00 |
| 21.00–23.60 | a bathtub through your chest | -42.0 | -0.20 |
| 23.30–24.30 | every few minutes | -42.0 | +0.30 |
| 24.30–25.50 | swim bubbles | -40.0 | +0.00 |
| 27.90–28.70 | the whole reef | -38.0 | +0.00 |
| 30.75–31.95 | shiver, teeth chatter | -42.0 | +0.00 |
| 32.40–32.70 | felt warm? | -38.0 | -0.20 |
| 36.00–36.30 | radiator | -34.0 | +0.00 |
| 38.75–39.05 | oxygen in | -38.0 | +0.20 |
| 40.10–40.60 | heat out | -36.0 | +0.20 |
| 43.50–43.85 | x25 | -30.0 | +0.00 |
| 46.90–47.70 | flows past your blood | -38.0 | +0.00 |
| 49.40–50.40 | reef bubbles | -42.0 | +0.00 |
| 51.75–52.55 | cold shiver | -44.0 | -0.20 |
| 54.30–54.60 | opah | -36.0 | +0.20 |
| 56.30–56.90 | warm heart | -38.0 | +0.20 |
| 57.95–58.25 | +5 C | -32.0 | +0.10 |
| 60.30–61.70 | wading out | -42.0 | +0.00 |
| 61.90–64.40 | hot tap running | -38.0 | -0.30 |
| 64.85–65.45 | air stone drops in | -36.0 | -0.10 |
| 65.20–72.40 | pump hum | -44.0 | -0.10 |
| 65.40–66.30 | pump bubbles | -38.0 | +0.00 |
| 67.20–67.80 | lie down | -38.0 | +0.00 |
| 68.00–69.00 | breathe the bath | -38.0 | +0.00 |
| 69.80–70.60 | the question | -36.0 | +0.00 |
| 70.50–72.00 | bubbles | -42.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **15.15 LU**, median **21.02 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook: breathing the bath | -16.8 | -39.5 | -40.9 | 10.8 / 15.3 |
| Gills, the beach | -14.9 | -36.3 | -37.7 | 8.0 / 14.6 |
| Heavy and thin | -16.2 | -38.7 | -37.5 | 8.0 / 14.3 |
| The reef is yours | -15.1 | -36.1 | -41.7 | 8.0 / 14.2 |
| Shiver, the radiator | -15.8 | -37.8 | -36.1 | 9.1 / 15.3 |
| Cold fish, the opah | -16.4 | -38.5 | -38.3 | 8.0 / 16.5 |
| Back to shore, the hot bath | -16.6 | -37.7 | -39.5 | 8.0 / 14.6 |
| The question | -17.1 | -49.7 | -39.9 | 17.7 / 19.3 |
