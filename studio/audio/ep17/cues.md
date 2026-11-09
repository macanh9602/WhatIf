# ep17 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,710,400 frames = 77.300 s**.
- Supplied voice: **77.292 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.27 | 2.33 |
| voice | -16.00 | -1.30 | 2.35 |
| music | -40.13 | -18.76 | 6.31 |
| sfx | -42.69 | -16.57 | 9.14 |

Voice gain tổng: **-0.65 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.5 LUFS

  Loudness range:
    LRA:         2.4 LU
    Threshold: -36.4 LUFS
    LRA low:   -17.6 LUFS
    LRA high:  -15.2 LUFS

  True peak:
    Peak:       -1.3 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 0 s / out 0 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–11.70 | Morning street: light bounce | -25.0 |
| 11.70–19.40 | Neighbour: bounce sours | -24.0 |
| 19.40–36.60 | Office, cafe, date: awkward pulse | -23.0 |
| 36.60–43.20 | Night: lowest point | -21.0 |
| 43.20–45.90 | You see: near silence | -33.0 |
| 45.90–59.00 | Explain Norway: cold | -28.0 |
| 59.00–69.50 | So Norway changed one rule: warm | -25.0 |
| 69.50–77.30 | Seen by, waves, friendly end | -24.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 1.40–1.90 | tag shimmer your street | -44.0 | +0.00 |
| 1.47–2.17 | tag shimmer your street | -47.0 | +0.00 |
| 2.30–2.80 | tag shimmer cascade | -44.0 | +0.00 |
| 2.37–3.07 | tag shimmer cascade | -47.0 | +0.00 |
| 4.10–4.60 | tag shimmer yours | -44.0 | +0.00 |
| 4.17–4.87 | tag shimmer yours | -47.0 | +0.00 |
| 7.00–7.12 | app tap | -36.0 | +0.00 |
| 13.00–15.60 | sprinkler on the roses | -44.0 | +0.00 |
| 14.60–15.10 | tag shimmer neighbor | -44.0 | +0.00 |
| 14.67–15.37 | tag shimmer neighbor | -47.0 | +0.00 |
| 20.30–20.60 | office door | -38.0 | +0.00 |
| 21.10–21.22 | keyboard | -40.0 | +0.00 |
| 21.28–21.40 | keyboard | -41.0 | +0.00 |
| 21.42–21.54 | keyboard | -40.0 | +0.00 |
| 21.70–21.82 | keyboard | -41.0 | +0.00 |
| 22.90–23.40 | tag shimmer twin | -44.0 | +0.00 |
| 22.97–23.67 | tag shimmer twin | -47.0 | +0.00 |
| 26.70–28.50 | cafe chatter | -46.0 | +0.00 |
| 28.60–29.20 | chair scrape | -40.0 | +0.00 |
| 29.00–29.50 | tag shimmer big | -44.0 | +0.00 |
| 29.07–29.77 | tag shimmer big | -47.0 | +0.00 |
| 30.00–31.30 | cafe chatter by the bins | -47.0 | +0.00 |
| 30.60–31.10 | tag shimmer small | -44.0 | +0.00 |
| 30.67–31.37 | tag shimmer small | -47.0 | +0.00 |
| 32.50–33.30 | park birds | -46.0 | +0.00 |
| 33.80–34.30 | tag shimmer date | -44.0 | +0.00 |
| 33.87–34.57 | tag shimmer date | -47.0 | +0.00 |
| 34.40–35.00 | park birds | -48.0 | +0.00 |
| 40.40–40.90 | bank app notification 1 | -40.0 | +0.00 |
| 40.55–41.25 | bank app notification 2 | -38.0 | +0.00 |
| 67.80–68.30 | tag shimmer line under | -44.0 | +0.00 |
| 67.87–68.57 | tag shimmer line under | -47.0 | +0.00 |
| 70.90–71.35 | seen by ping | -38.0 | +0.00 |
| 71.60–72.50 | he waves | -46.0 | +0.00 |
| 72.50–73.40 | you wave | -46.0 | +0.00 |
| 75.40–75.90 | warm end chime | -42.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **9.25 LU**, p10 **20.19 LU**, median **25.13 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Morning street: light bounce | -15.9 | -41.0 | -41.7 | 11.3 / 21.5 |
| Neighbour: bounce sours | -15.6 | -39.6 | -43.3 | 9.8 / 20.0 |
| Office, cafe, date: awkward pulse | -15.8 | -38.8 | -43.0 | 9.3 / 19.0 |
| Night: lowest point | -16.7 | -37.7 | -39.4 | 11.8 / 15.8 |
| You see: near silence | -16.4 | -49.4 | silence | 25.1 / 28.7 |
| Explain Norway: cold | -16.1 | -44.1 | silence | 15.7 / 24.4 |
| So Norway changed one rule: warm | -16.1 | -41.1 | -45.0 | 15.0 / 20.8 |
| Seen by, waves, friendly end | -15.7 | -39.7 | -43.6 | 16.1 / 22.1 |
