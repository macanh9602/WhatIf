# Muse lab (muse.ai agent): EXPERIMENT, not in the production flow

Status: experimenting. Muse is not good enough yet to ship an episode. We work with it round by round, log what moved quality,
and only when the bar below is met do we freeze the "Draft pipeline" section into a tool + an EPISODE_KIT step.
Until then nothing here is a rule for build agents.

## Bar to graduate (all three on 2 episodes in a row)
1. >= 90 % of shots pass "the picture alone tells the line" on the first video round.
2. Hook (first 2 shots), twist and payoff shots pass by round 2 at the latest.
3. A round costs us under ~30 min of review + one fix message.

## Round log (one row per Muse delivery, newest last)
| date | ep | round | what we changed in how we asked | result (pass / shots) | story-critical fails | lesson |
|---|---|---|---|---|---|---|
| 2026-11-09 | ep14 | video v1 | clips from brief, 10 s generations cut to shots | style drift (wide = 3D, close = 2D) | - | -> keyframes first |
| 2026-11-09 | ep14 | keyframes | one keyframe per shot from our sNN.jpg, approve/repaint by id | 28/31 approved, 3 repainted | - | keyframe gate works |
| 2026-11-09 | ep14 | video v2 | i2v from approved keyframe only + "flat 2D figure" line | 20/31 | 02 hook, 22 twist, 28+29 payoff | beat times + MUST SEE needed (H1, H2) |
| 2026-11-09 | ep14 | video v3 | 5 shots redone with beat times + "face to camera" / "no edge figures" (the 6-shot addendum sent while Muse was busy was dropped) | 24/31 (02 10 16 28 pass) | 29: tunnel reads open, lead in bottom 330 px | per-shot rules work, but see user review |
| 2026-11-09 | ep14 | user review of v3 | - | prettier than our engine, story WORSE | whole film | shot-by-shot illustration does not make a story (H6-H8) |
| 2026-11-09 | ep14 | v4 round A keyframes | story spine, geo map first, VIEWER LEARNS / CAUSED BY, map prop, focus-by-story value rule | 21/31 approved first pass; story reads in stills | 13 (pink house link lost), 29 (portal not shown), 01 (lead tiny) | geo map + map prop worked at once (H6/H7 look right); landmark drawn inconsistently (crater vs portal); Muse's self-flag list was accurate this time |
| 2026-11-09 | ep14 | v4 keyframe repaint | 11 shots by id, each with the exact fix + "same portal as 03" landmark rule | 15/15 repaints pass (19 portal touch-up) | - | specific per-shot fixes land in one pass; value_qa 31/31 pass (.41-.90), grayscale shows faces lead |
| 2026-11-09 | ep14 | v4 final set check | assembled all 31 (repaints + kept) into one sheet | 8 kept shots still had the old tunnel (28 showed it OPEN between two blocked shots) | 28 | review the ASSEMBLED set after any repaint, never the repaints alone; a landmark change touches every shot that shows it |
| 2026-11-09 | ep14 | v4 round B video | all 31 animated from final keyframes | STOPPED after 01-13 (clips_v4/ on Muse) | - | user audit of the keyframes: recurring objects differ per shot (pink house, bridge, tank, peak/portal), 2 art styles mixed, physics wrong (hatch rings on the ground, 19), 28 starts already torn. My review missed all of it (single shots, thumbnails, only checked the asked fixes) |
| 2026-11-09 | ep14 | decision | switch to H10 | - | - | - |
| 2026-11-09 | ep14 | B stage 1: 31 painted stills | full brief ep14_B.md, keep layout + time-of-day colour, same-object rule, keep 1940/2014 | 29/31 approved first pass; layout, light and text held | 19 (different tank model), 22 (shutters) | painting over engine frames solves continuity; Muse self-corrected 30/31 after its own check |
| 2026-11-09 | ep14 | B stage 2: video 31 shots | animate from approved painted stills, beat times per shot | 27/31 first pass | 19 (spliced takes), 22 (twist read as a wand), 26 (glove hand), 28 (map crumpled) | stills gate made video mostly right first time |
| 2026-11-10 | ep14 | B redo 4 shots | exact fix per shot, 2 takes max | 19 22 28 pass; 26 failed twice (banker face pops in) | - | after 2 fails we build the shot ourselves: 26 = slow push on the approved still (ffmpeg zoompan) |
| 2026-11-10 | ep14 | FINAL | picture B3 + our captions/mix via scripts/muse_final.mjs (inputProps bg, capTop) | 31/31 shots read; one world; QA: 1080x1920, 74.5 s upload, -16.1 LUFS, no black/white/frozen | captions covered 1940 (24) and the map/tiny lead (27-29): moved on top with CAP_TOP | out/ep14_muse/final/ep14_muse_final_x1.1_upload.mp4 |
| 2026-11-10 | ep14 | external review (consolidated report) of FINAL | - | P0 ending: intact tunnel after 'It's in a million' read as a contradiction; P1: hook shot 02 drifted to gloved fingers + sleeved back (H0 broken), low-poly facets left from engine frames (02, 21), 28 bg an unfinished flat wall, 13 vs 23 reveal two different houses (bunker vs wooden), 19 bridge unreadable, 21 slide not shown | 02 19 21 23 28 | approved STILLS carried the engine facets; video drift (02 close-up) passed our review because nobody checked limbs against the cast sheet. Ending re-cut locally (03 train under 'nobody tried it') -> final2; B4 redo of 5 shots sent (seq 1213) |
| 2026-11-10 | ep14 | B4 (5 redos) + first independent critic run (.claude/agents/video-critic.md) on final2 | stills checked with figure crops; fix1 for 21/23/28 figures | critic: verdict FIX FIRST, 2 P0 + 10 P1 in final2; B4 fixes 02 (hook) 21 (slide) 23 (concrete) well, 19 rolls but clashes with the 3-arch bridge in 20; 28 still tears into two whole maps | map tear (both versions), 4 different pink houses, torso/jacket morph across shots, tunnel drawn 3 ways | Muse self-check and our director review both missed whole-film AI errors; an outside muted critic found 19. Continuity across shots is still the blocker; per-shot redos create new neighbour clashes |
| 2026-11-10 | ep14 | H11+H12 v1: 6 shots as 4 clips (A=08, B=13, C=19+20, D=22+23), simpler look, char/house/world/tank sheets + village plates (dawn/golden) as refs | refs built in 4 sheet rounds (Muse failed the map tear 3x -> we tear in post) | critic: A usable; B beat reads; C usable only trimmed to 4.2 s; D 0-2.9 s best twist read so far, reveal redo | B vs D two different bunkers; uninstructed push-ins gave off-model close-ups (ears, eye whites); C bridge drifted from its start frame + AI cut inside the clip; C/D flatter than A/B | sheets + plates hold the house and village; camera freedom causes the drift -> lock camera; one mechanism per object (house = plywood flats) stated in every brief. v2 sent |
| 2026-11-10 | ep14 | H13 test A (shot 08): Muse world with EMPTY hatch + our LeadCard composited (muse_composite.py) | 3 card rounds driven by the critic: r1 eyes shut (blink:true) + rigid; r2 acting but gaze left ("confused" face looks left) + peach tint; r3 gaze up-right at the window, curious -> nervous, 2 blinks, 3.5 px bob, no tint | critic r3: USABLE AS IS, better than the AI-drawn lead (clearer acting, on-model, stable seating) | P2 left: no warm rim, arms as dark slabs, card sharper than plate, plate fog | H13 works for a lead in a hatch: identity drift is gone by construction; acting is ours to direct. Next: B and C world-only |
| 2026-11-10 | ep14 | H13 B (13) + C (19+20) world-only + our card | tracker -> scipy connected components (solid black hole, binary opening vs ink lines, nearest to prediction); new --autolight (card x plate colour change on the turret: blast flash tints him) and --follow (card rotates with the hatch ellipse tilt) | critic: B fix-first small (hands dark on dark, cannon slit behind his head, house redrawn vs A), C fix-first (plate frozen 1.25 s then tank model pops, tank thrown back 250 px) | composite-side fixes done same night (gaze to the gun, flash tint, lean with the tank, no lag at the jolt); plate fixes sent to Muse as B/C v2 | for composites the plate LAYOUT must leave the lead's silhouette clear (gun/subject not behind the hatch) - put that in every world-only brief |
| 2026-11-09 | ep14 | H10 layout test (08 13 20 29) | Muse paints over clean engine frames, keeps every object and the camera | layout held 4/4 (same house in 08 and 13, same bridge); motion 3/4 pass | 13: lead turns his back, bunker reads as a wooden box, cannon small | H10 works for continuity. Muse drops the time-of-day colour (golden -> neutral day): say 'keep the sky colour and shadow length of our frame'. Next gate = 31 painted stills, then video |

### User review of ep14 v3 (2026-11-09), condensed
Picture is better than our engine; the story reads worse. P0: weak cause and effect, picture does not carry the line, the
lead's goal is unclear, objects/places without context, no sense of progression. P1: decorative shots instead of story
shots, action not readable, missing reaction -> consequence links, no visual hierarchy (too much detail competes), unclear
metaphors, no geography between locations, props without a role. P2: duration not matched to information, montage feel,
pacing flat across important and unimportant beats, high cognitive load on a first scroll-by viewing.
Root cause on our side: the brief asked for one picture per line, and each shot was generated alone from its keyframe.
Nothing told Muse the story spine, what the viewer must have learned by each shot, or how places connect.

## Hypotheses (what we think helps; mark confirmed / rejected with the round that proved it)
- H0 confirmed (ep14 keyframes + v2): keyframe first, then i2v from that keyframe only, plus the line "the figure stays a
  flat 2D drawing: stick arms, round black hands, no sleeves, no gloves, no ears, no nose" keeps the cast and style on-model.
- H1 testing (ep14 v3): a beat time inside the shot ("blows up ~1.5 s in") stops beats landing outside the window and
  stops the 2-4x speed-ups.
- H2 testing (ep14 v3): a MUST SEE object per shot (gun barrel in the rock, paint streak on the fingertip) makes reveals read.
- H3 testing (ep14 v3): "face toward camera the whole shot" / "no figure at the edges" stop back-of-head shots and edge slivers.
- H4 untested: ask Muse to keep its own `WHATIF_RULES.md` in its workspace (Muse has persistent files) and re-read it
  each round, so lessons build up on its side too and our briefs get shorter.
- H5 untested: one shot per generation beats 10 s multi-shot clips for timing control.
- H1 confirmed for timing (v3 02, 28), H3 confirmed (v3 10, 16). H2 not tested yet (addendum dropped).
- H6 untested (from the ep14 review): the brief opens with a story spine (goal -> obstacle -> escalation -> twist -> payoff),
  and every shot row adds "VIEWER LEARNS:" (one new fact) and "CAUSED BY:" (which earlier shot it answers). A shot with no
  new fact is cut or merged.
- H7 untested: one geography sheet (a top-down map of all locations: border, village, pink house, bridge, tunnel) made
  before the keyframes, and every keyframe placed on it; repeat one landmark between neighbouring shots.
- H8 untested: hierarchy rule per keyframe: one focal subject, background simplified and darker/lighter by one value step,
  no detail in the focal zone that is not part of the story.
- H9 untested (ep14 v4): our engine's art rules (cartoon-3d-short SKILL "Value and distance", "Mute test", prop contrast,
  no lemon/lavender faces) go into the brief. Measured on v3: value_qa passes 28/29 (range .56-.87), so Muse is not washed
  out; its problem is the opposite: full contrast and detail on every layer, no near/far value plan.
- Process lesson (corrected 2026-11-09): `muse-cli send --wait 0` can drop the message (seen twice); sending while Muse
  is busy works. Always send with `--wait 30` or more and check the message shows in `history`.
- H10 CONFIRMED for continuity (layout test 2026-11-09).
- H10 chosen 2026-11-09: continuity comes from OUR engine (one 3D world: same house, bridge, tank, peak, correct scale);
  Muse paints over our layout frames and animates. Independent text-to-image keyframes cannot hold one world.
- Review rule added: put every shot that shows the same object side by side (house, bridge, tank, peak), check scale and
  physics, art-style family, first-frame state, at >= 400 px wide. Never approve repaints without the assembled set.
- H9 revised after user review: depth must not set brightness. Focus follows the story, atmosphere (contrast/detail)
  follows distance, light follows location and mood. Sent to Muse as a v4 correction (seq 657).

- H11 testing (user 2026-11-10, after the B4 critic run): group shots by location + continuous action into one 5-8 s clip
  (we cut at voice times), one reference image per recurring object in every generation, first+last frame anchors if Muse
  supports them. Per-shot clips hold each shot but break neighbours (bridge 1 vs 3 arches, 4 pink houses).
- H12 testing (user 2026-11-10): lower detail across the whole film, correctness over detail: flat 2-tone shapes, no textures,
  simple background layers, few objects per frame. Less detail = less to morph. Test: p22 + p13 repaint + ref sheet (seq 1280).

- H11 add-on (user catch 2026-11-10): a location needs its own reference PLATE (empty set, same geometry, one version per
  time of day), not only character/object sheets. Without it B (golden) redrew the village of A (dawn): desert ground, no road,
  sun disk behind a front-lit house. Review: put shots of one location side by side and compare ground, road, neighbours,
  mountains, trees and light direction, not just the hero object.

- H13 testing (user 2026-11-10, after B/C showed face swaps and stick limbs turning into shaped bodies): Muse makes the
  WORLD with an empty hatch / no figure, our engine draws the lead and we composite. Tools: `LeadCard` composition +
  `scripts/lead_card.mjs` (transparent ProRes 4444, expr/look/headTilt/tilt keyframes, engine blinks + eased swaps) and
  `scripts/muse_composite.py` (tracks the dark hatch hole: narrow window + velocity + width gate + quadratic fit; tint, tint
  ramp, ride bob). Test A (shot 08): tracking +-1 px vs the turret, scale follows the tank; critic r1: lead stable and on-model
  but no acting (blink:true had shut the eyes) -> acted card r2. Fallback if H13 fails: option 2 = adopt Muse's own drawn
  lead as the model (user decision 2026-11-10).

## Muse failure catalogue (seen, with the episode)
- ep14: beats outside the shot window, then a 2-4x speed-up to fit; blast already in progress at frame 1.
- ep14: lead turns his back on crane/rise moves; figure slivers at frame edges.
- ep14: reveals not shown (burning rock instead of a gun, paint shine never smears); the bridge not shown in "the bridge is gone".
- ep14: payoff scale wrong (centred close figure with a white sticker halo instead of tiny in the collapse).
- ep14: set dressing against the story (tanks in the peaceful epilogue); text on props ("PLUNGER").
- ep14: Muse's own drift list missed the story-level fails; review ourselves every time.

## Channel (how to talk to Muse; stable)
- Mailbox repo: github.com/macanh9602/whatif-muse (`briefs/`, `refs/`, `textures/`). Muse usually delivers **in chat**.
- CLI: `muse-cli` (`uv tool install muse-cli`). Run history with `PYTHONIOENCODING=utf-8` (emoji reactions crash cp1252).
  `history --limit N` · `files --limit N` · `download <seq|sandbox://path> -o DIR` (saves into a folder named after the
  file) · `send --wait 30 "text"` · `watch` (`task.status running` = busy).
- Login on Windows: `auth export --browser agent-browser` crashes (calls `agent-browser` without `.cmd`). Turn on
  chrome://inspect/#remote-debugging in the Chrome logged in to muse.ai, then `agent-browser --headed --auto-connect tab <id>`
  + `cookies get --json`, write the muse.ai cookies as `name=value; ...` to `~/.config/muse-cli/cookies.txt`.
- Send with `--wait 30`+, never `--wait 0` (it dropped the ep14 v3 addendum and the first v4 send). Check it landed with
  `muse-cli watch` (a `message.user` event): `history` can lag minutes behind while Muse is running.
- Muse sends at most 6 clips per message. Downloads go to `studio/out/<ep>_muse/`.

## Review (each round)
- `python scripts/muse_review.py <cut.mp4> <brief.md> out/<ep>_muse/review_vN [voice.mp3]` (from studio/): mid sheet,
  6 fps motion strips per shot (times from the brief table), cut with our voice under it.
- CROP the lead in every shot to >= 400 px tall (a whole-frame thumbnail hides it: ep14 B4 23 passed at thumbnail with a boxy 4-pocket torso) and put it next to the approved in-episode model figure (ep14: p22) and the cast sheet: bean torso, collar + buttons, no pockets/patches, stick limbs, black dot hands, legs a little longer than the torso. In briefs point to the model still, never describe ratios in words ("legs <= torso" gave stubby legs in B4 21). Check the stills for leftover engine facets / flat untextured walls too.
- Per shot: does a viewer understand the line from the picture alone? Then on model, beat inside the window, no stray
  figures, no text. Hook, twist and payoff hardest.
- Score the round (pass / shots), add the row to the round log, update the hypotheses. Then one fix message: shot id +
  time window + what vN does wrong + MUST SEE with its beat time.

## Route B recipe that shipped ep14 (2026-11-10): first candidate for the pipeline
1. Clean engine layout frames: `PNG=1 PROPS='{"captions":false}' stills.mjs` at shot start + 8 f, 0.6667 scale (720x1280).
2. Muse STAGE 1 paints all 31 stills over them (keep layout, keep time-of-day colour, same-object rule). Review the assembled set.
3. STAGE 2 video from approved stills only. Review with muse_review.py; redo by id, max 2; then build the shot ourselves from the still.
4. `CAP_TOP='[[a,b],..]' EP=<ep> node scripts/muse_final.mjs eps/<ep>/muse/<cut>.mp4 out/...` : captions + mix + x1.1 upload copy.
   Check every caption against the picture (numbers on props, payoff objects, tiny figures low in frame).
Rounds: test 4 shots -> stage 1 (1 round + 2 repaints) -> stage 2 (1 round + 4 redos). Still open: the bar needs a 2nd episode.

## Draft pipeline (freeze into a tool + EPISODE_KIT only after the bar is met)
1. refs: one mid frame per shot (`sNN.jpg`), voice.mp3, script.txt -> `whatif-muse/refs/<ep>/`.
2. Brief from the SHOTLIST: time window from words.json, beat time, MUST SEE from the "pose / verb" and "prop" columns.
   Row: `| clip | a-b | NN | line | LOCATION, LIGHT: MOVE. ACTION (beat ~x s in). MUST SEE: ... |`
   Global block: look + figure line, no text, caption band y 1290-1590 and bottom 330 px clear, no audio, deliver
   `<ep>_vN_picture.mp4` + trimmed `sNN.mp4` + one drift line per shot.
3. Keyframes -> review -> repaint by id.  4. Video -> muse_review.py -> one fix round.  5. Max 2 fix rounds; else our engine shot.
Automation candidates once stable: brief generator from SHOTLIST + words.json, auto-download + review on delivery.
