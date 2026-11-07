# What If channel: how this project works

Skills: `D:/DucanBag/_Trick/_Short_Skill/skills` (video-pipeline = workflow, threejs-video = engine, cartoon-3d-short = look, twist-short-script = twist-story script format, trial from ep13).
The studio started from `cartoon-3d-short/templates/studio` (2026-11-05). Nothing here comes from another channel except the
narrator voice clone, which the user chose to reuse. Channel rules: `bible/CHANNEL.md`. Reference study (private): `_ref/STUDY.md`.

**Building an episode? Read `bible/EPISODE_KIT.md` first:** it has the flow, the shot list step (approved by the user before any render), the APIs and known traps.

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

- Value gate: `python scripts/value_qa.py out/<ep>/contact_<ep>.jpg --grid 7x4` (p5..p95 luma >= .40; ep12's washed-out shots scored .21-.36). Manual step, not wired into render.mjs.
- Gates while iterating: pass only the changed shot ids to staging_qa / temporal_qa (a full run is ~15 min). Previews need no full run; one full run before the final.
- Upload copy: `ffmpeg -i <preview_master.mp4> -filter_complex "[0:v]setpts=PTS/1.1,fps=30[v];[0:a]atempo=1.1[a]" -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart out/Short/<ep>_x1.1_upload.mp4`
- Publish: add a card to ops/cards.json, `node ops/upload.mjs dry <ep>`, then `node ops/upload.mjs --go <ep>`. CC-BY props used on screen go in the description (public/props/outdoor/ATTRIBUTION_FOR_DESCRIPTION.txt).

## Episode standard (visual audit + ep12, 2026-11-07)
- Story: 4-6 locations, >= 60 % of runtime outdoors, inserts <= 15 % (2 short ones); facts go on in-world props. Every shot the lead DOES the verb.
- Camera: per location 1 wide, 1 high/low angle, 1 foreground layer, 1 over-the-shoulder where it fits.
- Cinematic camera (user 2026-11-07): the 3D world is there to be used. Action shots fly a motivated move (crane reveal, orbit, tracking, dolly back head on, top-down), not a static side view with a creep. See EPISODE_KIT "Film camera".
- Light: each location its own preset (day/golden/night/dawn). Sets: `backdrop: {biome}` panoramas in public/backdrops (PNGs stay neutral; the engine grades each layer) and props from public/props/outdoor (MANIFEST.md).
- Transitions: `TRANS` in story.ts, 1-2 story-motivated iris/zoom per episode, 2-3 whip/dip/match, the rest hard cuts.
- Value before colour: judge the grayscale sheet first. Near holds the darkest darks, from a REAL object, far is light. Sky-fall / mid-air shots are exempt: never paint fake dark blobs.
- Fall shots: 3D mesh clouds, ground haze ~15 % (30-40 % washed ep12 out), `fall_belly` flails, calm beats slow to a starfish.
- The payoff prop must be sharp and readable: no lens blur on it (ep12 shot 27 shipped a blurred clock).

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
