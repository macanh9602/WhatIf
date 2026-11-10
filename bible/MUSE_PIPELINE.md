# Muse pipeline v2: layers (runbook)

Written 2026-11-10 after ep14 H13 + the C v2 failure, for whoever runs the next Muse round. `bible/MUSE.md` stays the lab
notebook (round log, hypotheses, how to reach Muse); this file is the procedure. Change it when a round proves a step wrong,
and say which round. Status words: PROVEN (worked in a logged round), UNPROVEN (designed, not run).

## The rule
Muse draws the WORLD. We draw everything that must stay the same thing, and every motion whose timing matters.

| Layer | Owner | Status |
|---|---|---|
| Lead (any figure with a face) | us: `LeadCard` + `scripts/lead_card.mjs` | PROVEN (ep14 A, critic: usable as is) |
| Hero object that moves or recurs (tank) | us: a sprite cut from ONE approved Muse still, moved by keyframes | PROVEN (ep14 C 3/4, see worked example) |
| Same, as a real 3D render from the engine camera | us | UNPROVEN, see Open tests T2 |
| Set / background plate | Muse: a still, painted over our layout or cleaned from an approved still | PROVEN (H10 29/31; c_bridge.png) |
| World effect (blast, walls folding, smoke, dust) | Muse video: ONE action, 3-4 s, locked camera, from the approved plate | PROVEN (B v2, C 3/4 blast) |

Why (do not re-brief these, they are model limits; Muse confirmed 2026-11-10 and the rounds agree): the video model follows
the first frame, text steers action and mood only. It redraws moving objects mid-clip (C v2: three tank models in 5 s),
pushes the camera in at dramatic beats whatever the brief says, and lands beats when it likes. Reliable window 3-5 s.
No seed, no video/depth input, last frame is a weak hint. Our brief goes through a Muse subagent that rewrites it.

## Steps (per clip; a clip = one location, one world action)
1. **Split.** For each shot list: the plate, the ONE world action, our layers (lead, sprites) and their beats. Two world
   actions = two clips on the same plate (the plate does not move, so they cut together).
2. **Plate still.** Either Muse paints over our engine layout frame (`PNG=1 PROPS='{"captions":false}' COMP=Short EP=<ep>
   sh scripts/gpu.sh node scripts/stills.mjs out/<ep>/x_ <frame> 0.6667` = 720x1280), or Muse removes our-layer objects from an approved still.
   Check it against its source side by side + a difference map (ep14: `out/ep14/muse_h13_c3/bridge_check.jpg`).
   **The user approves the plate before any video.** Say "then STOP and wait" in the brief; Muse obeys that.
3. **Clip.** Brief from the template below. Budget: 1 generation + 2 retakes.
4. **Fetch.** `PYTHONIOENCODING=utf-8 muse-cli history --limit 20 --download studio/out/<ep>/<round>/` (always `send --wait 60`+).
5. **Gate (never skip, never trust the delivery note).** From studio/:
   `python scripts/muse_check.py <clip.mp4> out/<ep>/muse_check --box x0 y0 x1 y1`
   - numbers: frozen head/tail, camera lock (block shift vs frame 0, limit 4 px), where the biggest change landed;
   - then READ the crop sheet it writes: full-res crops every 0.25 s of each object that must keep one design.
   - read `prompt_<clip>.txt` (Muse saves the literal prompt since 2026-11-10): is every MUST of the brief in it?
   Calibration (ep14): sB_empty v1 FAIL frozen tail 0.83 s; sB_empty2 pass; sC_empty2 FAIL camera 20 px at 2.67 s.
6. **Our layers.**
   - Lead: `EP=<ep> PROPS='{"expr":[[0,"smug"],[1.9,"shock"]],"look":0.8}' sh scripts/gpu.sh node scripts/lead_card.mjs out/.../card.mov <frames>`
     (expressions: calm confused curious happy nervous neutral scared shock smug squint worried; never `blink:true`).
   - Sprite: cut from the approved still with a colour mask of the object + its ink, largest blob, fill holes, then view it
     on magenta at 2x (ep14: `out/ep14/muse_h13_c3/tank_A.png`, hatch hole box 109 62 178 91 in the sprite). A generic
     "with minus without" cutter was tried and dropped: Muse repaints the lines around the hole it fills, so they stick.
7. **Composite.** `scripts/muse_composite.py <plate.mp4> <card.mov> <out.mp4> --box <hole> --scale S --cut 560` plus
   - lead in an object Muse animates (PROVEN A, B): tracked hatch hole, add `--autolight --follow 1`;
   - our sprite on a vehicle-free plate: `--sprite tank.png --keys keys.json --smooth 1`, `--box` = hole in the sprite,
     keys = `[[t, x, y, deg, scale], ...]` (sprite bottom centre in frame px). The lead rides the sprite exactly.
8. **Check the composite** with muse_check crops again (lead + sprite boxes), then the independent critic
   (`.claude/agents/video-critic.md`, fresh agent, no notes). The director does not self-approve.
9. **Log** the round in `bible/MUSE.md` (table row + any hypothesis change).

## Escalation (stop re-briefing)
The same failure class twice on one element = move that element one step toward us, do not write a third brief:
Muse video -> Muse still + our motion (sprite keys) -> our engine shot. A failure that is in the "Why" list above
goes there after ONE round.

## Brief template (paste, fill the CAPS)
```
STANDING RULES (every round): fact-check this brief against the reference images before generating and flag any
mismatch instead of guessing. Save the literal prompt sent to the video tool as prompt_<clip>.txt next to the clip.
Verify by comparing each named object across frames at 0.5 s steps, full resolution; report any design change,
camera move, or held frame. No frozen tails: regenerate instead.

OBJECTS (one line each, the exact words every time): PLATE NAME = WHAT IT SHOWS, COUNTS (e.g. "bridge: ONE arch").
NOT IN THE CLIP: no vehicle, no person, no text. (They are our layers.)

STEP 1 (image only): FROM <file>, DO <paint over layout | remove X>. Change nothing else. Deliver <name>.png 720x1280.
Then STOP and wait for approval.
STEP 2 (after approval): <N> s video from <name>.png. Camera fully locked. ONE action, starting at frame 0: <ACTION>.
MUST SEE: <object + where in frame>. MUST STAY: <what our layer will stand on / sit in>.
Max 3 takes. Report: take used, beat time found, anything that drifts.
```
Keep it this short: long briefs get rewritten by the subagent and constraints fall out (check prompt_<clip>.txt).

## Needs the user
Plate stills (step 2), a generation round beyond the budget, any change of look or of who owns a layer, anything uploaded.

## Worked example: ep14 C 3/4 (2026-11-10, rounds c34 r1-r3), PROVEN end to end
Files in `studio/out/ep14/muse_c34/` (out/ is not in git). Result: `C34_v2.mp4`, checks in `check/`.
1. Plate: "EDIT the approved B frame: keep the tank, its road, the camera and the light; replace the background with the
   bridge" -> `c34b_with.png`, then "same image, tank removed" -> `c34b_plate.png`. Editing an approved frame keeps the
   camera, the look and the tank drawing; the sprite is cut from the SAME still, so it sits in the plate's perspective.
2. Staging lesson (r1 was rejected, our brief's fault): the sprite cannot turn. Its road must run along the way its nose
   points, the road must BE the bridge deck, and the object must be big enough for the face (give sizes in px and
   positions in percent of the frame). "Bridge in the middle distance" gave a far bridge on a second road.
3. Sprite: `cut_tank34.py` (colour mask limited to where still and plate differ) -> `tank_34.png`, hole box 110 53 149 58.
4. Blast: one 4 s clip from the plate, blast-only (`r3/sC34_blast.mp4`, take 2 of 3). The short brief reached the video
   tool intact (`r3/prompt_sC34_blast.txt`). The left half of the deck stayed whole, the edge landed at 52 %.
5. Gate caught what the note denied: Muse wrote "camera is locked"; muse_check measured a 9 px blast shake (0.5-1.0 s) that
   returns to 0. We keep it and make our layers ride it: `build_c34.py` measures the shift on regions the blast never
   touches and adds it to the tank keys (sign self-checked). It also builds the plate: a ping-pong hold of the frames
   before the flash while the tank rolls in, then the clip, so the blast lands on the voice beat we choose (2.5 s).
6. Composite: `muse_composite.py plate_c34.mp4 card_c34.mov C34_v2.mp4 --sprite tank_34.png --keys keys_c34.json
   --box 110 53 149 58 --scale 0.16 --smooth 1 --shadow 0.35 --autolight`. Lead scale: head about as wide as the hatch lid.
   Keys carry a small track rumble while rolling (a gliding sprite reads as a sticker).
Known limits of this result: debris flies behind the tank, never in front; no dust from the tracks; wheels do not turn;
the lead's head is ~40 px in a 720 px frame (wide shot). Not yet seen by the independent critic.

## Open tests
- T2 engine 3D layer (only if a shot needs the object to TURN): the engine tank (`public/props/outdoor/tank_*.glb`) is a
  brown block, not the Muse tank; model the Muse tank in Blender, render it alone with alpha from the shot camera,
  composite as an image sequence (`--sprite` takes one PNG today).
- T5 promote the shake-follow and the hold+clip plate from `build_c34.py` into `muse_composite.py` once a second shot needs them.
- T6 run the critic on `C34_v2.mp4` next to the approved A and B composites (same tank, same lead scale, same look?).
