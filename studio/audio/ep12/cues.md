# ep12 audio cues

Nhạc và SFX được tổng hợp bằng Python/numpy/scipy; không dùng sample, download hoặc melody có sẵn. Reuse DSP/instrument/SFX building blocks từ template `claude-animated-shorts/templates/audio/`; melody và arrangement mới hoàn toàn.

Rebuild: `python audio/build.py`. Không cần cài package. Tunable mix/cue nằm trong `audio/settings.json`.

## Deliverables

- `public/eps/<ep>/mix.wav`: 48 kHz, stereo, PCM 24-bit, **3,436,800 frames = 71.600 s**.
- Supplied voice: **70.360 s**; `words.json` giữ nguyên timing và speaker tags (`who`).
- `audio/voice.wav`: voice MP3 được decode/resample 48 kHz, không đổi timing.
- `audio/stem_voice.wav`, `stem_music.wav`, `stem_sfx.wav`: stems tại final gain, trước master limiter.
- `audio/music_raw.wav`, `sfx_raw.wav`: synthesis trước mix automation; `duck_envelope.csv`: duck/ride mỗi 10 ms.
- `audio/measurements.json`, `ffmpeg_ebur128.txt`: kết quả kiểm tra.

## Loudness

| Signal | Integrated LUFS | True peak dBTP | LRA LU |
|---|---:|---:|---:|
| master | -16.00 | -1.72 | 2.36 |
| voice | -16.03 | -2.02 | 2.40 |
| music | -37.57 | -20.58 | 3.69 |
| sfx | -37.36 | -13.38 | 9.55 |

Voice gain tổng: **-2.01 dB**, cùng gain cố định trên toàn voice. Voice stem không EQ, compression, time-stretch hoặc pitch shift; chỉ master bus có limiter chung.
Master limiter linked stereo, detector 4x, look-ahead 3 ms, release 80 ms, ceiling -1.2 dBTP. Max reduction **-0.00 dB**; active >0.1 dB trên 0.00% samples.

ffmpeg `ebur128=peak=true` cross-check:

```text
Summary:

  Integrated loudness:
    I:         -16.0 LUFS
    Threshold: -26.5 LUFS

  Loudness range:
    LRA:         2.4 LU
    Threshold: -36.5 LUFS
    LRA low:   -17.7 LUFS
    LRA high:  -15.3 LUFS

  True peak:
    Peak:       -1.7 dBFS
```

## Music

Original motif ở **D major, 112 BPM**, nhịp syncopated có khoảng nghỉ; pizzicato bass, plucked melody, brush taps, glock. Montage mượn D minor/Bb, giữ tempo nhưng bass và brush thưa theo half-time. Kitchen dùng pad + music box. 55.0 s chuyển sang D pedal / D–Eb plucks để tăng tension; 60.6 s brass D major giải tỏa cùng splash; 61.6 s button D2/D5, tail kết thúc trước 63 s.

Standard balance: music **-7 dB** so với baseline −14 LU dưới voice (section chính → -21 LU); EQ nhạc HP 180 Hz, −3 dB @ 500 Hz và 2 kHz; fade in 3 s / out 5 s. SFX giữ offset cấu hình **+6 dB**: target = voice LUFS + cue level + offset. Music duck **9 dB** theo word times; pre-roll 90 ms, post-hold 80 ms, attack 25 ms, release 180 ms. Accompaniment ride bổ sung chỉ giảm music/SFX khi voice nhỏ.

| Time s | Cue | Music target dưới voice, LU |
|---|---|---:|
| 0.00–4.62 | Hook: falling over the town | -21.0 |
| 4.62–6.75 | Roll off the bed | -23.0 |
| 6.75–15.17 | The town sky, the rooftops | -21.0 |
| 15.17–20.52 | Back in bed, rolling again | -23.0 |
| 20.52–27.35 | Desert, sea, mountains | -21.0 |
| 27.35–37.95 | Drift off: the muscles, the twitch | -22.0 |
| 37.95–43.35 | The door between worlds | -21.0 |
| 43.35–55.24 | The watch, twice | -22.0 |
| 55.24–63.04 | Let the fall happen, the field | -21.0 |
| 63.04–71.60 | The bedroom floor, the question | -20.0 |

10.50 s: toàn ensemble dừng, chỉ một D5 pad rất nhỏ đến 11.60. 22.20 s: stop + stinger 120 ms; score bằng 0 từ **22.32–25.50 s**. Không có reverb tail vượt các điểm stop.

## SFX

Target bên dưới là LUFS tại final gain, trước accompaniment protection/master limiter. Event = max momentary 400 ms; bed = integrated. Kids là formant-synthesized babble/cheers không có lời rõ.

| Time s | Cue | Target LUFS | Pan |
|---|---|---:|---:|
| 0.00–2.50 | wind of the fall | -38.0 | +0.00 |
| 1.00–2.50 | the alarm clock tumbling | -40.0 | +0.30 |
| 4.55–5.05 | hook flash | -32.0 | +0.00 |
| 5.30–6.00 | rolls off the bed | -38.0 | +0.00 |
| 6.15–6.45 | hits the floor | -34.0 | +0.00 |
| 6.60–7.50 | the floor opens | -34.0 | +0.00 |
| 7.30–9.50 | wind | -40.0 | +0.00 |
| 10.40–12.40 | 200 km/h | -38.0 | +0.00 |
| 10.50–10.80 | the dial | -36.0 | +0.30 |
| 12.60–15.10 | roofs rush up | -34.0 | +0.00 |
| 15.12–15.52 | the jerk | -30.0 | +0.00 |
| 15.17–15.47 | jolt in bed | -30.0 | +0.00 |
| 17.60–17.85 | heartbeat | -38.0 | +0.00 |
| 18.00–18.25 | heartbeat | -40.0 | +0.00 |
| 18.40–18.65 | heartbeat | -40.0 | +0.00 |
| 18.90–19.70 | slides off again | -38.0 | +0.00 |
| 20.45–21.05 | zoom into the floor | -34.0 | +0.00 |
| 21.00–22.80 | desert wind | -40.0 | +0.00 |
| 22.85–23.25 | whip to the sea | -36.0 | -0.40 |
| 23.90–24.30 | whip to the mountains | -36.0 | +0.40 |
| 25.10–27.10 | spinning | -38.0 | +0.00 |
| 27.35–29.85 | bedroom tick | -42.0 | +0.00 |
| 29.60–30.40 | springs go slack | -40.0 | +0.00 |
| 32.40–32.90 | FALLING? alarm | -36.0 | +0.00 |
| 34.00–34.30 | the twitch | -32.0 | +0.00 |
| 35.70–36.00 | seven sleepers jerk | -36.0 | +0.00 |
| 36.25–36.55 | 7 in 10 | -36.0 | +0.00 |
| 38.00–40.50 | falling to the door | -40.0 | +0.00 |
| 41.25–41.60 | the door slams | -28.0 | +0.00 |
| 41.30–41.70 | slam flash | -32.0 | +0.00 |
| 41.50–43.30 | the sea below | -46.0 | +0.00 |
| 44.50–44.80 | thought bubble | -36.0 | -0.20 |
| 47.10–47.22 | wrist up | -34.0 | +0.20 |
| 49.20–49.50 | 3:07 | -34.0 | +0.00 |
| 50.90–51.20 | 9:40 | -34.0 | +0.10 |
| 53.40–53.65 | digits | -38.0 | -0.30 |
| 53.80–54.05 | digits | -38.0 | +0.30 |
| 55.20–55.60 | whip to the field | -36.0 | +0.00 |
| 58.50–61.00 | gentle wind | -42.0 | +0.00 |
| 61.25–61.55 | soft landing | -38.0 | +0.00 |
| 61.30–61.90 | grass | -38.0 | +0.00 |
| 65.40–68.00 | bedside clock | -40.0 | +0.20 |
| 67.30–67.60 | 3:07 twice | -34.0 | +0.20 |
| 70.10–70.90 | the question | -36.0 | +0.00 |

## Voice clarity và QA

Đo margin voice − (music + SFX) bằng cửa sổ 400 ms, hop 10 ms, tâm nằm trong spoken word; chỉ loại voice thấp hơn integrated voice 14 LU hoặc bed dưới −70 LUFS.

- Speech margin toàn tập: min **8.00 LU**, p10 **15.83 LU**, median **21.01 LU**.
- Tất cả cue có fades; SFX endpoint bằng 0. Master bắt đầu/kết thúc bằng 0; không hard clipping.
- WAV được đọc lại để kiểm tra frame count, format, peak và loudness sau quantization.
- Voice stem được so với decoded source × gain: sai số tối đa ≤ 1 LSB 24-bit.
- QA này là kiểm tra bằng measurement, chưa có audition bằng tai hoặc review cùng picture.

| Section | Voice LUFS | Music LUFS | SFX LUFS | Speech min / p10 LU |
|---|---:|---:|---:|---:|
| Hook: falling over the town | -15.2 | -37.2 | -40.3 | 15.8 / 19.1 |
| Roll off the bed | -15.2 | -38.4 | -36.1 | 8.7 / 15.3 |
| The town sky, the rooftops | -16.1 | -37.2 | -39.3 | 8.0 / 15.4 |
| Back in bed, rolling again | -16.3 | -39.4 | -36.9 | 8.0 / 13.7 |
| Desert, sea, mountains | -15.5 | -36.5 | -39.2 | 13.6 / 17.1 |
| Drift off: the muscles, the twitch | -16.7 | -38.7 | -38.1 | 10.1 / 14.8 |
| The door between worlds | -16.1 | -37.3 | -36.5 | 8.0 / 15.1 |
| The watch, twice | -16.4 | -38.4 | -35.5 | 8.0 / 15.1 |
| Let the fall happen, the field | -16.1 | -37.1 | -39.8 | 15.4 / 18.3 |
| The bedroom floor, the question | -15.5 | -35.9 | -38.3 | 8.3 / 16.0 |
