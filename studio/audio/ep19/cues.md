# ep19 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,806,400 frames = 79.300 s**.
- Supplied voice: **79.276 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.54 | 2.58 |
| voice | -16.01 | -1.90 | 2.60 |
| music | -41.91 | -21.42 | 8.08 |
| sfx | -39.80 | -12.09 | 21.55 |

Voice gain tổng: **-0.93 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.4 LUFS

  Loudness range:
    LRA:         2.6 LU
    Threshold: -36.4 LUFS
    LRA low:   -17.7 LUFS
    LRA high:  -15.1 LUFS

  True peak:
    Peak:       -1.6 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 0 s / out 0 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–11.00 | Backyard: cheerful holiday bounce | -23.0 |
| 11.00–19.00 | Neighbor: bounce thins | -26.0 |
| 19.00–27.40 | Oil rises: sparse pulse | -27.0 |
| 27.40–32.30 | Lock, spill: pad only | -32.0 |
| 33.30–37.20 | Whoomp ring-out | -31.0 |
| 37.20–41.90 | Fine behind a chair: deadpan warm | -28.0 |
| 41.90–44.20 | You see: near silence | -35.0 |
| 44.20–54.20 | Explain: glock | -27.0 |
| 54.20–69.00 | Dusk: engine, leaflet | -26.0 |
| 69.00–77.80 | Dinner at the neighbor's: dry warm tail | -25.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 7.75–8.65 | frost crackle on the coat of frost | -52.0 | +0.00 |
| 7.90–8.15 | frost flake | -48.0 | +0.30 |
| 8.15–8.40 | frost flake | -51.0 | -0.30 |
| 9.50–14.70 | gentle oil simmer | -54.0 | +0.00 |
| 16.95–17.85 | turkey sinks into oil | -44.0 | +0.00 |
| 17.90–19.00 | simmer | -50.0 | +0.00 |
| 19.00–21.00 | oil bubbles | -48.0 | +0.00 |
| 20.60–21.80 | foam hiss | -54.0 | +0.00 |
| 21.00–23.40 | bubbles busy | -45.0 | +0.00 |
| 21.90–24.40 | fizz rising | -50.0 | +0.00 |
| 23.80–26.80 | foams, climbs | -42.0 | +0.00 |
| 23.90–26.90 | fizz at the lip | -46.0 | +0.00 |
| 26.86–27.16 | door shuts | -37.0 | +0.40 |
| 26.98–27.10 | lock click | -34.0 | +0.40 |
| 29.90–32.70 | oil over the rim hisses to flame | -44.0 | +0.00 |
| 30.20–32.70 | oil runs down the side | -46.0 | +0.00 |
| 33.19–35.39 | WHOOMP low | -19.0 | +0.00 |
| 33.20–34.10 | WHOOMP body | -22.0 | +0.00 |
| 33.20–34.80 | flame roar | -32.0 | +0.00 |
| 33.22–33.57 | soft top of the blast | -28.0 | +0.00 |
| 34.00–36.20 | ember crackle | -46.0 | +0.00 |
| 34.30–34.60 | debris patter | -40.0 | -0.50 |
| 34.60–34.90 | debris patter | -43.0 | +0.50 |
| 34.95–35.25 | debris patter | -41.0 | -0.30 |
| 35.40–35.70 | debris patter | -45.0 | +0.40 |
| 35.90–36.20 | debris patter | -47.0 | -0.40 |
| 41.10–42.00 | lawn chair folds, clatter | -36.0 | +0.00 |
| 41.40–41.70 | chair rattle | -42.0 | +0.40 |
| 54.60–59.10 | fire engine rumble arrives | -43.0 | +0.00 |
| 56.20–60.00 | engine idling | -48.0 | -0.20 |
| 60.00–63.00 | engine rumble settles | -46.0 | +0.00 |
| 63.90–64.80 | leaflet handed over | -38.0 | +0.00 |
| 65.20–65.70 | page one | -41.0 | +0.20 |
| 68.90–69.40 | leaflet flipped | -42.0 | +0.00 |
| 69.50–75.90 | warm porch chatter | -50.0 | +0.00 |
| 70.90–71.50 | tray set down | -44.0 | +0.30 |
| 72.40–72.70 | cutlery | -44.0 | -0.40 |
| 73.95–74.25 | cutlery | -46.0 | +0.40 |
| 75.00–75.30 | plate clink | -47.0 | -0.20 |
| 78.00–78.55 | small metallic roof creak | -46.0 | +0.00 |
| 78.30–79.20 | roof ring-out | -49.0 | +0.20 |
| 78.35–79.05 | roof ring-out 2 | -54.0 | -0.20 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **19.48 LU**, median **25.28 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Backyard: cheerful holiday bounce | -15.9 | -39.0 | -52.0 | 8.0 / 18.2 |
| Neighbor: bounce thins | -15.3 | -41.3 | -52.4 | 20.5 / 22.9 |
| Oil rises: sparse pulse | -15.8 | -42.8 | -42.0 | 11.6 / 19.6 |
| Lock, spill: pad only | -15.7 | -47.7 | -43.4 | 21.0 / 24.0 |
| Whoomp ring-out | -15.1 | -45.9 | -34.4 | 8.0 / 14.4 |
| Fine behind a chair: deadpan warm | -17.1 | -45.1 | -37.5 | 14.0 / 18.3 |
| You see: near silence | -16.1 | -50.9 | -inf | 25.8 / 28.3 |
| Explain: glock | -16.1 | -43.1 | silence | 13.4 / 22.9 |
| Dusk: engine, leaflet | -16.2 | -42.2 | -43.4 | 8.2 / 19.3 |
| Dinner at the neighbor's: dry warm tail | -16.7 | -41.7 | -47.0 | 9.8 / 19.7 |
