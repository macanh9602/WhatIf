# ep15 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,992,000 frames = 83.167 s**.
- Supplied voice: **83.142 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.55 | 2.50 |
| voice | -15.99 | -1.55 | 2.50 |
| music | -36.23 | -14.39 | 12.63 |
| sfx | -40.32 | -15.23 | 10.80 |

Voice gain tổng: **-0.91 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.3 LUFS

  Loudness range:
    LRA:         2.5 LU
    Threshold: -36.4 LUFS
    LRA low:   -17.5 LUFS
    LRA high:  -15.0 LUFS

  True peak:
    Peak:       -1.6 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 0 s / out 0 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–16.20 | Hook + jungle + sea: low tension | -26.0 |
| 16.20–30.50 | Cabin: dark under the drone | -22.0 |
| 30.50–34.40 | Plane: pulse starts | -26.0 |
| 34.40–38.30 | Ship + fast boat: pulse climbs | -22.0 |
| 38.30–45.70 | Roof, hatch, valve, flood: pulse peak | -18.0 |
| 47.00–52.50 | You see: single bass note | -31.0 |
| 52.50–62.00 | Cargo, no case, blanket | -27.0 |
| 62.00–67.90 | They let you go: smug light turn | -21.0 |
| 68.10–81.67 | 2008: hard stop, heavy low end | -16.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 0.10–5.70 | sea wash | -47.0 | +0.00 |
| 5.80–11.80 | jungle insects | -52.0 | +0.30 |
| 6.30–8.90 | roller paint | -44.0 | -0.20 |
| 9.90–10.40 | duct tape patch | -44.0 | +0.20 |
| 12.00–16.00 | sea wash, low boat | -46.0 | +0.00 |
| 16.30–30.40 | cabin engine drone | -43.0 | +0.00 |
| 16.30–30.40 | cabin engine thud | -47.0 | +0.00 |
| 17.50–18.70 | empty jug slosh | -44.0 | -0.10 |
| 19.80–20.05 | cough | -47.0 | +0.00 |
| 20.05–20.30 | cough | -48.0 | +0.00 |
| 21.95–22.35 | gauge clink | -40.0 | +0.20 |
| 22.15–22.45 | gauge falls | -42.0 | +0.30 |
| 25.00–26.40 | plastic crinkle, pat the stack | -40.0 | +0.00 |
| 30.90–33.30 | plane pass | -43.0 | -0.40 |
| 30.90–45.90 | night sea | -49.0 | +0.00 |
| 33.10–34.80 | ship horn | -40.0 | +0.00 |
| 33.40–34.60 | searchlight hum | -44.0 | +0.30 |
| 34.30–38.20 | outboard engine | -45.0 | +0.50 |
| 36.70–37.30 | megaphone shout | -48.0 | +0.40 |
| 37.80–38.40 | megaphone shout | -48.0 | +0.50 |
| 40.30–40.60 | man lands on the roof | -31.0 | +0.00 |
| 40.30–41.20 | roof boom | -37.0 | +0.00 |
| 41.00–46.90 | cabin engine drone | -43.0 | +0.00 |
| 41.40–41.90 | hatch bang 1 | -37.0 | +0.00 |
| 41.45–41.65 | bang body | -36.0 | +0.00 |
| 41.90–42.40 | hatch bang 2 | -37.0 | +0.00 |
| 41.95–42.15 | bang body | -36.0 | +0.00 |
| 42.35–42.85 | hatch bang 3 | -36.0 | +0.00 |
| 42.40–42.60 | bang body | -35.0 | +0.00 |
| 43.70–44.15 | valve squeak | -45.0 | +0.00 |
| 44.60–47.00 | water rush | -39.0 | +0.00 |
| 45.30–46.50 | water pours in | -41.0 | +0.00 |
| 47.50–52.50 | sea wash, dawn | -46.0 | +0.00 |
| 54.50–59.30 | underwater muffle | -40.0 | +0.00 |
| 54.50–59.30 | underwater bubbles | -51.0 | +0.00 |
| 61.10–62.20 | blanket rustle | -42.0 | +0.00 |
| 66.00–67.00 | blanket rustle again | -44.0 | +0.00 |
| 68.20–71.40 | heavy hit on 2008 | -32.0 | +0.00 |
| 68.60–69.00 | stamped page | -39.0 | +0.00 |
| 70.00–70.30 | heavy low pulse | -33.0 | +0.00 |
| 72.00–72.30 | heavy low pulse | -32.0 | +0.00 |
| 74.20–74.50 | heavy low pulse | -33.0 | +0.00 |
| 76.45–76.57 | handcuff click | -37.0 | -0.20 |
| 76.62–76.74 | handcuff click | -38.0 | +0.20 |
| 77.30–77.60 | heavy low pulse | -32.0 | +0.00 |
| 77.80–78.80 | blanket rustle | -44.0 | +0.00 |
| 79.20–79.50 | heavy low pulse | -32.0 | +0.00 |
| 80.80–81.60 | jumpsuit plastic crinkle, rings out | -39.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **15.08 LU**, median **21.59 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook + jungle + sea: low tension | -16.1 | -42.1 | -46.5 | 11.2 / 19.1 |
| Cabin: dark under the drone | -16.2 | -38.3 | -41.2 | 8.0 / 17.4 |
| Plane: pulse starts | -16.5 | -42.5 | -43.5 | 18.2 / 20.4 |
| Ship + fast boat: pulse climbs | -17.2 | -39.2 | -43.6 | 9.8 / 17.1 |
| Roof, hatch, valve, flood: pulse peak | -15.9 | -34.0 | -35.6 | 8.0 / 12.5 |
| You see: single bass note | -15.7 | -46.7 | -46.1 | 15.1 / 25.0 |
| Cargo, no case, blanket | -16.1 | -43.1 | -40.3 | 16.4 / 19.6 |
| They let you go: smug light turn | -16.6 | -37.6 | -46.0 | 14.9 / 17.7 |
| 2008: hard stop, heavy low end | -15.3 | -31.6 | -35.2 | 8.0 / 12.1 |
