# What If channel: how this project works

Skills: `D:/DucanBag/_Trick/_Short_Skill/skills` (video-pipeline = workflow, threejs-video = engine, cartoon-3d-short = look).
The studio started from `cartoon-3d-short/templates/studio` (2026-11-05). Nothing here comes from another channel except the
narrator voice clone, which the user chose to reuse. Channel rules: `bible/CHANNEL.md`. Reference study (private): `_ref/STUDY.md`.

## Layout
- `bible/episodes/<ep>/SCRIPT.md`: facts + own calcs; `eps/<ep>/script.txt`, `eps/<ep>/voice/`: TTS in/out.
- `bible/voices/narrator_ref.wav` (+ CREDITS.txt): the Chatterbox reference clip.
- `studio/src/videos/engine/`: engine (look switches in toon.ts `BEAN`/`INK`/`SKIN`, captions in Short.tsx).
- `studio/src/videos/engine/eps/people.ts`: the channel cast. `eps/<ep>/`: story.ts, cast.ts, inserts.tsx, words.ts.
- `studio/public/eps/<ep>/`: voice.mp3, words.json, mix.wav. `studio/audio/<ep>/settings.json`: music sections + SFX.

## Commands (from studio/, set REMOTION_TMP=D:/remotion-tmp)
- Voice: `HF_HOME=D:/hf-cache D:/tts-venv/chatterbox/Scripts/python D:/DucanBag/_Trick/_Short_Skill/skills/video-pipeline/scripts/tts_chatterbox.py ../eps/<ep>/script.txt ../eps/<ep>/voice ../bible/voices/narrator_ref.wav 1.0`, then copy to `public/eps/<ep>/`.
- Cast sheet: `COMP=CastSheet node scripts/stills.mjs out/cast_ 0 0.5`
- Stills: `COMP=Short EP=<ep> node scripts/stills.mjs out/<ep>/x_ <frames> 0.5 > log 2>&1` (never pipe into `head`)
- Mix: `EP=<ep> python audio/build.py` · Preview: `COMP=Short PREVIEW=1 CONCURRENCY=2 EP=<ep> node scripts/render.mjs <ep> all`
- QA: `python scripts/short_qa.py <upload.mp4> out/<ep>/qa`. Final 2K needs LOOK_SCORES.md + SELF_CHECK.md in bible/episodes/<ep>.
