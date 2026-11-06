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
- Boil ("nhiễu") gate: `EP=<ep> node scripts/temporal_qa.mjs [shotIds]` (2K render.mjs runs it and refuses on > 1.5 k/Mpx;
  `_boil.png` maps in out/temporal/<ep>). Ink = 16 jittered masks, shadow fit frozen per shot (synced from the skill template 2026-11-06).

## Parallel work (multi agent / multi session)
Use them: an episode has many independent pieces, and one session doing all of them in order wastes the evening.
- CPU / text work runs in parallel: fact research per episode, inserts.tsx (2D cards) per insert, cast.ts, music/SFX
  settings, reviewer rounds (each reviewer = its own fresh agent, Read only, no director context). Two episodes can be
  scripted and staged side by side, one agent per episode.
- GPU work stays SEQUENTIAL (one 8 GB card): TTS (Chatterbox), stills, temporal_qa, renders. Never run two at once;
  queue them, and let agents prepare the next job while one renders. Wrap every GPU command in `sh scripts/gpu.sh <cmd>`
  (from studio/): an atomic mkdir lock, so parallel agents wait their turn instead of fighting over the card.
- Blender (MCP) is one live instance: one agent at a time builds props/sets there, exports GLB to studio/public/props.
- Shared files (sets.ts, people.ts, toon.ts, render scripts) have ONE owner per round; other agents send changes back as a
  note instead of editing, or work in a git worktree. Each agent writes only inside its own `eps/<ep>/` folder.
- Brief each agent with the files to read (SCRIPT.md, this file, the skill section), the exact output path and a done check;
  the director still opens every still and sheet itself before approving.
