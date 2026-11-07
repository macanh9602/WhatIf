# Episode kit: all a build agent needs (read this + eps/ep12/story.ts and cast.ts; open skills only when stuck)

## Flow for one episode (token budget ~300k)
1. Director: SCRIPT.md + script.txt, then SHOTLIST (below). The user approves both at once. No render before that.
2. In parallel, one background job each: voice (GPU) and one Sonnet agent for inserts.tsx + audio settings.json.
3. One Opus agent builds story.ts + cast.ts from the approved shot list, then a preview.
4. The user watches the preview and sends ALL notes at once.
5. One FRESH agent (short brief, the notes as a list) does one fix round. Never resume an agent past ~150k tokens.
A new episode starts in a new chat session.

## SHOTLIST (in SCRIPT.md, one row per shot, written before any code)
| id | line | set + light | camera (size, angle, MOVE + why) | lead's pose / verb | card | prop / near dark | in-transition |
Check it before asking for approval: lying or sleeping = lie_back + card flat, never a standing card; the payoff prop is sharp;
each location has a wide; insert time <= 15 %; >= 60 % outdoors; action shots have a flown move; a chase is shown from at least 3 views; every subject named on the line fits the vertical frame.

## Files (write only here)
`engine/eps/<ep>/`: story.ts, cast.ts, inserts.tsx, words.ts (+ kit.tsx). `public/eps/<ep>/`, `audio/<ep>/settings.json`, `bible/episodes/<ep>/`.
Shared engine files: smallest fix only when blocked, list it in the report, ep01-11 must not change.

## story.ts
- `S(id, aSec, bSec, set, cam, size, light, extra)`; `I(id, a, b, "insertName")` = 2D card. Copy the S/I helpers from ep12.
- set: bedroom kitchen bathroom party home (rooms); town desert sea mountains field beach reef lagoon rooftops street park yard forest snow counter floor.
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
`public/props/outdoor/MANIFEST.md`: 46 GLBs. A new file must also be listed in PROP_FILES (sets.ts). CC-BY props seen on screen go in the description.
`public/backdrops/<biome>_<far|mid>.png` via set `backdrop:{biome}`. Fence and meadow flowers are too thin at range (they boil).

## Known traps (each cost a round on ep12)
- Fall-shot ground haze: use ~15 %. The current 30-40 % washes shots out; lower it FIRST (value_qa fails under .40).
- Near dark comes from a real object. Sky shots are exempt, never paint dark blobs.
- Lens blur on the payoff prop made the clock unreadable: keep it on the focus plane.
- Roofs from straight above read as flat blocks: use a slight angle so ridges and chimneys show.
- Keep heads clear of the frame edge in flat-card shots.
- Balloon from above reads as a striped ball: side views only.

## Traps from ep13
- One render at a time even for stills: a job started beside a render died with ERR_ABORTED (port 3000).
- A full render with many soft fx passes the 600 s tool limit: run it in the background.
- In a heredoc through Bash an apostrophe can break the outer quoting: write patch scripts with the Write tool.
- Before scheduling, read what is already booked: the channel takes 2 videos a day. The OAuth token can upload but not edit a video, so a schedule cannot be moved by API.

## Checks, cheapest first (studio/, GPU through `sh scripts/gpu.sh`, logs to a file)
1. One contact sheet per round (one frame per shot, changed shots only), grayscale first. `python scripts/value_qa.py <sheet> --grid CxR` (CPU, seconds).
2. staging_qa, temporal_qa with the changed ids only. expr_qa.
3. Preview needs no full run: `COMP=Short PREVIEW=1 CONCURRENCY=3 EP=<ep> node scripts/render.mjs <ep> all`.
4. Full gates once, before a final. SELF_CHECK.md: one line per shot.
Report under 200 words. No upload, no commit.
