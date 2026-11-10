# What If channel: how this project works

Skills: `D:/_Module/skills` (video-pipeline = workflow, threejs-video = engine, cartoon-3d-short = look, twist-short-script = twist-story script format, trial from ep13).
The studio started from `cartoon-3d-short/templates/studio` (2026-11-05). Nothing here comes from another channel except the
narrator voice clone, which the user chose to reuse. Channel rules: `bible/CHANNEL.md`. Reference study (private): `_ref/STUDY.md` (missing since the folder move, 2026-11-10; the format it described is summarised in CHANNEL.md "Series").

**Muse (muse.ai) is an experiment: its lab notebook is `bible/MUSE.md`. Log every round there; not part of the build flow yet.**
**Running a Muse round? Follow `bible/MUSE_PIPELINE.md` (layers: Muse draws the world, we draw the lead and hero objects;
`scripts/muse_check.py` gates every clip Muse delivers).**

**Building an episode? Read `bible/EPISODE_KIT.md` first:** it has the flow, the shot list step (approved by the user before any render), the APIs and known traps.

## Layout
- `bible/episodes/<ep>/SCRIPT.md`: facts + own calcs; `eps/<ep>/script.txt`, `eps/<ep>/voice/`: TTS in/out.
- `bible/voices/narrator_ref.wav` (+ CREDITS.txt): the Chatterbox reference clip.
- `studio/src/videos/engine/`: engine (look switches in toon.ts `BEAN`/`INK`/`SKIN`, captions in Short.tsx).
- `studio/src/videos/engine/eps/people.ts`: the channel cast. `eps/<ep>/`: story.ts, cast.ts, inserts.tsx, words.ts.
- `studio/public/eps/<ep>/`: voice.mp3, words.json, mix.wav. `studio/audio/<ep>/settings.json`: music sections + SFX.

## Commands (from studio/, set REMOTION_TMP=D:/remotion-tmp)
Every render command goes through `sh scripts/gpu.sh` (one job at a time); the render scripts refuse to start without it.
- Voice: `HF_HOME=D:/hf-cache D:/tts-venv/chatterbox/Scripts/python D:/_Module/skills/video-pipeline/scripts/tts_chatterbox.py ../eps/<ep>/script.txt ../eps/<ep>/voice ../bible/voices/narrator_ref.wav 1.0`, then copy to `public/eps/<ep>/`.
- Cast sheet: `COMP=CastSheet sh scripts/gpu.sh node scripts/stills.mjs out/cast_ 0 0.5`
- Stills: `COMP=Short EP=<ep> sh scripts/gpu.sh node scripts/stills.mjs out/<ep>/x_ <frames> 0.5 > log 2>&1` (never pipe into `head`)
- Mix: `EP=<ep> python audio/build.py` · Preview: `COMP=Short PREVIEW=1 CONCURRENCY=2 EP=<ep> sh scripts/gpu.sh node scripts/render.mjs <ep> all`
- Episodes ship from the preview master through the ship gate below. A 2K render (render.mjs without PREVIEW) still runs expr_qa and temporal_qa first; its LOOK_SCORES / SELF_CHECK gates were removed 2026-11-10.
- Boil ("nhiễu") gate: `EP=<ep> sh scripts/gpu.sh node scripts/temporal_qa.mjs [shotIds]` (2K render.mjs runs it and refuses on > 1.5 k/Mpx;
  `_boil.png` maps in out/temporal/<ep>). Ink = 16 jittered masks, shadow fit frozen per shot (synced from the skill template 2026-11-06).

- Value gate: `python scripts/value_qa.py out/<ep>/contact_<ep>.jpg --grid 7x4` (p5..p95 luma >= .40; ep12's washed-out shots scored .21-.36). Manual step, not wired into render.mjs.
- Gates while iterating: pass only the changed shot ids (a full run is ~15 min): `sh scripts/gpu.sh node scripts/staging_qa.mjs out/<ep>/staging <ids>`, temporal_qa as above. Previews need no full run; one full run before the final.
- Independent critic (user 2026-11-10): before any upload and after every Muse/engine round, run a fresh Opus agent with
  `.claude/agents/video-critic.md` (muted viewing, AI-artifact hunt, no team notes). The director does not self-approve.
- Upload copy, only through the ship gate: `node scripts/ship_gate.mjs <ep> <preview_master.mp4>` (no GPU). It blocks on flicker_qa and expr_qa, writes the short_qa report to out/<ep>/qa, then makes `out/Short/<ep>_x1.1_upload.mp4` (1.1x, crf 20). Run temporal_qa on the whole episode and the critic before it.
- Publish: add a card to ops/cards.json, `node ops/upload.mjs` (dry run of every card), then `node ops/upload.mjs --go <ep>`. CC-BY props used on screen go in the description (public/props/outdoor/ATTRIBUTION_FOR_DESCRIPTION.txt).

## Episode standard
In `bible/EPISODE_KIT.md`, "Episode standard": locations, camera, light, transitions, fall shots. Read it before a shot list.

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
