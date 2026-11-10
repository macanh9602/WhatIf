# Episode kit: all a build agent needs (read this + eps/ep12/story.ts and cast.ts; open skills only when stuck)

## Flow for one episode (token budget: measured numbers at the end)
1. Director: SCRIPT.md + script.txt, then SHOTLIST (below). The user approves both at once. No render before that.
2. Script agent = Sonnet, effort medium (SCRIPT.md, script.txt, SHOTLIST). The director checks the shot list, then runs the voice
   (gpu.sh + Chatterbox) and the mix (audio settings.json + build.py) itself, no agent.
3. One Opus agent builds story.ts + cast.ts (+ inserts.tsx) from the approved shot list, then a preview.
4. The user watches the preview and sends ALL notes at once.
5. One FRESH agent (short brief, the notes as a list) does one fix round. Never resume an agent past ~150k tokens.
A new episode starts in a new chat session.

## SHOTLIST (in SCRIPT.md, one row per shot, written before any code)
| id | line | set + light | camera (size, angle, MOVE + why) | lead's pose / verb | card | prop / near dark | in-transition |
Check it before asking for approval: lying or sleeping = lie_back + card flat, never a standing card; the payoff prop is sharp;
each location has a wide; insert time <= 15 %; >= 60 % outdoors; action shots have a flown move; a chase is shown from at least 3 views; every subject named on the line fits the vertical frame.

## Episode standard (visual audit + ep12, 2026-11-07; moved here from AGENTS.md 2026-11-10)
- Story: 4-6 locations, >= 60 % of runtime outdoors, inserts <= 15 % (2 short ones); facts go on in-world props. Every shot the lead DOES the verb.
- Camera: per location 1 wide, 1 high/low angle, 1 foreground layer, 1 over-the-shoulder where it fits.
- Cinematic camera (user 2026-11-07): the 3D world is there to be used. Action shots fly a motivated move (crane reveal, orbit, tracking, dolly back head on, top-down), not a static side view with a creep. See EPISODE_KIT "Film camera".
- Light: each location its own preset (day/golden/night/dawn). Sets: `backdrop: {biome}` panoramas in public/backdrops (PNGs stay neutral; the engine grades each layer) and props from public/props/outdoor (MANIFEST.md).
- Transitions: `TRANS` in story.ts, 1-2 story-motivated iris/zoom per episode, 2-3 whip/dip/match, the rest hard cuts.
- Fall shots: 3D mesh clouds, ground haze ~15 % (30-40 % washed ep12 out), `fall_belly` flails, calm beats slow to a starfish.

## Files (write only here)
`engine/eps/<ep>/`: story.ts, cast.ts, inserts.tsx, words.ts (+ kit.tsx). `public/eps/<ep>/`, `audio/<ep>/settings.json`, `bible/episodes/<ep>/`.
Shared engine files: smallest fix only when blocked, list it in the report, ep01-11 must not change.

## story.ts
- `S(id, aSec, bSec, set, cam, size, light, extra)`; `I(id, a, b, "insertName")` = 2D card. Copy the S/I helpers from ep12.
- set: bedroom kitchen bathroom party home (rooms); town desert sea mountains field beach reef lagoon rooftops street park yard forest snow counter floor; episode sets west alps pacific tips salary tornado turkey alaska talkton (`SetId` in sets.ts is the list).
- light: day golden night dawn lamp window sea shallow. size: close mid wide.
- cam: `{cam:"wide"}` set hint (town also "air" 300 m, "low" 20 m) | `{local:[x,y,z], lookAt:[x,y,z], fov}` set-local | `{fall:[x,0,z], h:[from,to], rush}` sky-fall, looking down.
- extra: `angle:"high"|"low"|"top"`, `card:"cam"` (faces the lens; default in fall shots) or `card:{flat:yaw}` (lies on the ground).
- `TRANS` keyed by the INCOMING shot: `{kind:"iris"|"zoom"|"whip"|"dipWhite"|"dipBlack", dur, cx?, cy?}`. Match cut = same pose and framing, no entry.
- Also exported: TOTAL, XFADE, FLASH_AT, CAPTION_STOPS, REFRAME, KICKS (impact frames), MOVES (push pull truck crane arc roll), HOLD, noGreenAt, CONTACTS, WAIVE (with a reason).
- Times are raw voice seconds; the 1.1x comes after the render.

## Film camera, moving things (ep13, optional exports in story.ts)
- `CAM_PATH: { [id]: (t) => ({ p, l, fov }) }`: a flown camera, set-local (crane, dolly, orbit, pan, dolly back head on). Set `HOLD[id] = 0` so the creep does not add to it. The look point is the focus plane: keep it on the subject or the lead blurs.
- `MOVER_AT(id, f)`: x of the set's `mover` group (a train that really rolls), null hides it. `SUN_SHOT: { [id]: { az, el } }`: the golden preset is a straight backlight (az 6), boxcars need az ~125.
- Walk every camera path against the props: a lens inside a rock draws its ink lines across the frame (ep13 shot 1).
- A side-view card only works from the side. Head-on and top views need their own drawing (ep13 cast.ts horseFront, horseTop).

## cast.ts
- `word("text", fromSec)` times a beat. A reaction lands 0-3 frames before its word.
- Act: `{ i, o: YOU, at, mode, expr: [[t,"scared"]], phase: (t)=>t, reach, prop, seat }`.
- Modes: fall_belly (flails from `phase`; panic and calm beats as in ep12), jolt_bed (`seat`), slide_off, lie_back. Watch: `reach: () => POSES.watch_read, prop: "watch"`. Faces include scared, squint.
- Air shots: pin with `fallPos(id, t)` under a fall cam, or a set-local point + `card:"cam"` (ep12 AIR).
- A card lying on a bed sits at pillow height (ep12 ON_PILLOW) or the pillow covers the head.

## Episode exports from ep13 worth copying
`eps/ep13/cast.ts`: horse (side, front, top), rider pinned to the seat, breathing light (lightAt: size + 4 opacity steps, not redrawn lines), staged blast (fireball, sootCol, flashCard, ring, flung), hinged ramp (the card's normal must be square to the board: a wrong sign tilts it the other way and it reads as flipped).

## Assets
`public/props/outdoor/MANIFEST.md` lists them (71 GLBs in the folder on 2026-11-10, 52 in the manifest). A new file must also be listed in PROP_FILES (sets.ts). CC-BY props seen on screen go in the description.
`public/backdrops/<biome>_<far|mid>.png` via set `backdrop:{biome}`. Fence and meadow flowers are too thin at range (they boil).

## Known traps (each cost a round on ep12)
- Fall-shot ground haze: use ~15 %. The current 30-40 % washes shots out; lower it FIRST (value_qa fails under .40).
- Near dark comes from a real object. Sky shots are exempt, never paint dark blobs.
- Lens blur on the payoff prop made the clock unreadable: keep it on the focus plane.
- Roofs from straight above read as flat blocks: use a slight angle so ridges and chimneys show.
- Keep heads clear of the frame edge in flat-card shots.
- Balloon from above reads as a striped ball: side views only.

## Prop check (no gate covers this: value/temporal/staging/expr QA never look at hands)
ep15 shipped a roller floating off the hand, cuffs floating on the chest, a jumpsuit pasted over the body and a board for a blanket. Before any final: list every shot where the lead holds, wears or uses something, make start/mid/end stills of each, and open them at full size. Held = in the hand and moving with it; worn = drawn as part of the body; cloth reads as cloth. One frame per shot on a contact sheet is too small to catch it.

## Flicker check
`python scripts/flicker_qa.py <master.mp4>` (no GPU, every frame) must PASS before a final: it catches z-fighting, as on the ep17 doormat the user spotted, which temporal_qa missed because it samples 16 frames per shot, and stills and sheets can never show it. A temporal_qa fail is a different signal: open the `_boil.png` map in out/temporal/<ep> and name what lights up. Stripes along edges under a moving camera are aliasing (ep17 shots 9, 16, 24, 29); a filled patch is a bug. Never let two faces share a plane: any slab on a surface sits at least 1 cm clear of it.

## Trap from ep14-16
- Chatterbox ends the take right on the last word (ep15: 0.03 s), and mix + TOTAL follow the voice, so the video stops dead. Pad the voice with 1.5 s of silence (`ffmpeg -af apad=pad_dur=1.5`) before the mix, and let the last shot hold to it.

## Traps from ep13
- One render at a time even for stills: a job started beside a render died with ERR_ABORTED (port 3000).
- A full render with many soft fx passes the 600 s tool limit: run it in the background.
- In a heredoc through Bash an apostrophe can break the outer quoting: write patch scripts with the Write tool.
- Before scheduling, read what is already booked: the channel takes 2 videos a day. Move a schedule with `node ops/upload.mjs resched [--go]` (card publishAt -> YouTube), swap a file with `node ops/replace.mjs <ep>`.

## Checks, cheapest first (studio/, GPU through `sh scripts/gpu.sh`, logs to a file)
1. One contact sheet per round (one frame per shot, changed shots only), grayscale first. `python scripts/value_qa.py <sheet> --grid CxR` (CPU, seconds).
2. staging_qa, temporal_qa with the changed ids only. expr_qa.
3. Preview needs no full run: `COMP=Short PREVIEW=1 CONCURRENCY=2 EP=<ep> sh scripts/gpu.sh node scripts/render.mjs <ep> all`.
4. Full gates once, before a final. SELF_CHECK.md: one line per shot.
5. Upload copy only through `node scripts/ship_gate.mjs <ep> <preview_master.mp4>` (flicker_qa + expr_qa block it; no GPU).
Report under 200 words. No upload, no commit.

## Token budget (director, 2026-11-08)
Measured: Sonnet script+voice+mix 140-185k, Opus first picture build 330-450k, Opus fix round ~240k. Most of a build is images and big file reads, so:
- Review stills as ONE sheet per shot: `COMP=Short EP=<ep> sh scripts/gpu.sh node scripts/selfcheck.mjs out/<ep>/sc <ids>` then `python scripts/selfcheck_sheet.py out/<ep>/sc`. Never open loose stills one by one (ep19 left 347 jpgs). After a fix, re-sheet only the changed shot ids.
- Open the full contact sheet at most twice: after the first stills pass and before the final.
- Do not read ep13/ep19 cast.ts whole (43-59 kB): grep for the helper you need (fireball, held prop, CAM_PATH) and read that range.
- Wait for GPU jobs with one `until` loop in the background, not repeated foreground checks; kill your loops before you finish.
- Don't chase boil numbers on previews; the user judges the preview.
- Fix your own "still weak" list before you report (user 2026-11-08): a build or fix agent hands over a list of known defects only when a fix is truly out of reach, with the reason. Self-check every shot for: the lead whole in frame (no cut heads, no half bodies at the edge), no pole/prop crossing sign text, every held/key prop readable, no empty-looking street (towns get background people doing things).
- Before any hand-over to the user (user 2026-11-08, ep21): run flicker_qa AND temporal_qa on the WHOLE episode and fix every span (light pools on the ground, night lamps, fences/rails, thin posts). A contact sheet shows one frame per shot and cannot catch motion defects. The director checks the QA output files, not only the sheet.
