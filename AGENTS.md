# What If channel: how this project works

Skills: `D:/DucanBag/_Trick/_Short_Skill/skills` (video-pipeline = workflow, threejs-video = engine, cartoon-3d-short = look).
Channel rules: `bible/CHANNEL.md`. Reference study (private, never publish): `_ref/STUDY.md`.

## Layout
- `bible/episodes/<ep>/SCRIPT.md`: facts + own calcs, script, chain, beat → picture (verb per shot).
- `eps/<ep>/script.txt`, `eps/<ep>/voice/`: TTS input / output.
- `studio/`: Remotion project, copied from the Owen studio (2026-11-04). The engine folder is still named
  `src/videos/owen/` because 19 scripts/files use that path; it is this channel's own copy now.
  - Episode code: `src/videos/owen/eps/<ep>/` (`story.ts` shots + `noGreenAt`, `cast.ts` acting + fx, `inserts.tsx`
    full-screen 2D blueprint cards, `words.ts`). Composition `WhatIfShort`.
  - Added to the engine: `nogreen.ts` (post effect, last in the chain; an episode exports `noGreenAt(f)` — return
    `{amt: 0, wipe: -1}` for episodes without it), `ShotDef.insert`, sets `yard`, `forest`, `snow`.
  - Audio: `audio/score.py` (styles per section), `audio/<ep>/settings.json` (sections + SFX cues), `EP=<ep> python audio/build.py`.

## Commands (from studio/)
- Voice: `cd D:/DucanBag/_Trick/_YTB && HF_HOME=D:/hf-cache D:/tts-venv/chatterbox/Scripts/python pipeline/tts_chatterbox.py <script.txt> <out_dir> bible/voices/theo_ref.wav 1.0`
  then copy `voice.mp3` + `words.json` to `studio/public/owen/<ep>/`.
- Stills: `REMOTION_TMP=D:/remotion-tmp COMP=WhatIfShort node scripts/stills.mjs out/<ep>/x_ <frames> 0.5`
- Preview render: `REMOTION_TMP=D:/remotion-tmp COMP=WhatIfShort PREVIEW=1 CONCURRENCY=3 node scripts/render.mjs <ep> all`
- Final 2K needs `bible/episodes/<ep>-*/LOOK_SCORES.md` + `SELF_CHECK.md` (render.mjs gates).
