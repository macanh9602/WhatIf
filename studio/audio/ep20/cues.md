# ep20 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,592,000 frames = 74.833 s**.
- Supplied voice: **74.824 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.60 | 2.46 |
| voice | -16.00 | -1.64 | 2.47 |
| music | -42.16 | -22.99 | 6.59 |
| sfx | -43.77 | -17.63 | 14.43 |

Voice gain tổng: **-1.12 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.6 LUFS

  Loudness range:
    LRA:         2.5 LU
    Threshold: -36.6 LUFS
    LRA low:   -17.8 LUFS
    LRA high:  -15.3 LUFS

  True peak:
    Peak:       -1.6 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 0 s / out 0 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–15.00 | Sitka 1867: dry march-like bounce | -24.0 |
| 15.00–30.40 | Tear it up: pulse | -26.0 |
| 30.40–38.30 | Gold: bounce thins | -27.0 |
| 38.30–46.00 | Oil: sparse pulse | -28.0 |
| 46.00–52.40 | The new map: explain glock | -27.0 |
| 52.40–60.40 | Cold War: low pad | -31.0 |
| 60.40–69.40 | Texas, flag: warm | -27.0 |
| 69.40–74.83 | Folly turned: dry warm tail | -26.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 0.50–5.50 | harbour wind and water | -50.0 | +0.00 |
| 5.90–6.40 | cheque held up | -44.0 | +0.00 |
| 8.40–10.00 | newspaper crowd laughs, far | -56.0 | +0.00 |
| 14.90–15.20 | NO SALE stamp | -40.0 | +0.00 |
| 15.60–16.50 | cheque torn | -36.0 | +0.00 |
| 16.40–16.70 | scraps | -46.0 | +0.30 |
| 20.80–21.10 | cannon thud, far | -40.0 | +0.00 |
| 28.90–29.90 | flag snaps in the wind | -44.0 | +0.20 |
| 32.90–34.90 | creek | -46.0 | +0.00 |
| 33.80–34.10 | gold flake in the pan | -42.0 | +0.30 |
| 34.20–34.50 | gold flake | -44.0 | -0.30 |
| 37.40–37.55 | gate lock | -38.0 | +0.20 |
| 39.50–43.50 | wind over the tundra | -46.0 | +0.00 |
| 41.00–45.50 | pump and pipeline hum | -48.0 | +0.20 |
| 42.90–43.30 | barrel stack rolls | -38.0 | +0.00 |
| 47.10–47.45 | border post stamp | -40.0 | +0.00 |
| 50.00–50.40 | post goes up | -36.0 | +0.00 |
| 50.50–51.70 | snow | -46.0 | +0.00 |
| 54.90–57.90 | far planes | -46.0 | +0.00 |
| 67.30–68.20 | flag ring | -44.0 | +0.00 |
| 71.90–72.40 | button | -40.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **21.29 LU**, median **27.34 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Sitka 1867: dry march-like bounce | -16.0 | -40.1 | -49.8 | 8.0 / 20.0 |
| Tear it up: pulse | -16.1 | -42.1 | -38.9 | 14.4 / 20.7 |
| Gold: bounce thins | -15.6 | -42.6 | -42.2 | 18.5 / 22.7 |
| Oil: sparse pulse | -15.4 | -43.4 | -44.9 | 15.6 / 22.6 |
| The new map: explain glock | -16.2 | -43.2 | -41.2 | 10.8 / 20.0 |
| Cold War: low pad | -16.2 | -47.2 | -49.3 | 23.7 / 27.2 |
| Texas, flag: warm | -16.6 | -43.6 | -46.6 | 16.2 / 24.7 |
| Folly turned: dry warm tail | -15.1 | -41.1 | -40.0 | 14.7 / 23.3 |
