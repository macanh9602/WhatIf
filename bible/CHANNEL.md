# What If: channel bible (draft v1, 2026-11-04)

## Series
Vertical 50-60 s shorts. Each episode answers one absurd "what if" with real physics, told as one causal chain.
- Script formula: video-pipeline `references/story.md` + the hypothetical format in `_ref/STUDY.md`
  (consequence-as-fact hook → "Imagine you…" → consequences you can see → "You see," mechanism → ironic payoff).
- Voice of the answer: literal, honest numbers, deadpan understatement. Every number is computed and sourced in SCRIPT.md.
- Length: ~1:05-1:15 after the 1.1x speed-up (user 2026-11-05, from ep04; ep01-03 were ~1:30). Publish 07:00 VN, at most 2 a day (upload.mjs warns above that).
- Ops: `node ops/upload.mjs` (schedule), evening report 21:00 (`ops/report.cmd` → bible/reports/<date>.md).
- Episode standard from ep12 on (user 2026-11-07): more outdoor and varied places, few infographics, real transitions; rules in EPISODE_KIT.md "Episode standard".
- Identity (user decisions 2026-11-05):
  - Look: the reference's construction (bean heads + bean torsos, 2.5D form shading, thin ink limbs, small detailed hair /
    accessories that never cover the brows), navy card ink, 3D ink world + 2D blueprint inserts for the "how it works" beat.
  - Lead "you": one curly hair on a pale bean head (follows motion) + red varsity jacket, white tee, blue jeans. Same look in
    every shot. Cast: eps/people.ts (Neighbor with suspenders, Grandma with bow tie, Teen, Runner).
  - Narrator: the "Theo" LibriVox clone (reused on purpose). Captions: Segoe UI Black, navy stroke, cyan current word.

## Skills (D:/_Module/skills)
video-pipeline (workflow) + threejs-video (engine) + style: cartoon-3d-short (studio from templates/studio).

## Continuity log
Ids and dates: `ops/uploaded.json` is the source (synced here 2026-11-10); a `resched` or `replace` changes it, not this table.
| ep | topic | status |
|---|---|---|
| 01 | What if green didn't exist | v2 rebuilt on the clean studio; 1.1x (1:28) published 2026-11-05 07:00 (rGsbDC-srRg) |
| 02 | What if you could change your weight like volume | v1; 1.1x (1:22) published 2026-11-05 07:00 (K8_9z4otNiI) |
| 03 | What if leveling up cost you years of your life | v1; 1.1x (1:28) published 2026-11-05 07:00 (U8LgA5o3et0) |
| 04 | What if humans had a second face on the back of their heads | v1; 1.1x (1:14) published 2026-11-05 07:00 (S_5RbYfQy64) |
| 05 | What if everyone on Earth ground their teeth at the same time | v1; 1.1x (1:14) published 2026-11-05 07:00 (5mWsXt0IXAc) |
| 06 | What if you could sell your sleep | v1; 1.1x (1:18) scheduled 2026-11-07 07:00 (sZyZj7lwwBs); new bedroom set + booth from Blender, new Billionaire |
| 07 | What if you could shrink yourself with a dial | v1; 1.1x (1:03) scheduled 2026-11-07 07:00 (sJ_8216KdSQ); new counter/floor/kitchen sets, redrawn cat |
| 08 | What if you could breathe underwater | v1; 1.1x (1:06) scheduled 2026-11-08 07:00 (SFDp4bVjJOk); new beach/reef/bathroom sets |
| 09 | What if you woke up as a sponge (extrovert premise) | v1; 1.1x (1:09) scheduled 2026-11-16 07:00 (7ppXxciUNcM); new party/lagoon sets; lead as a red sponge needs sign-off |
| 10 | What if you lived one day inside a cartoon | v1; 1.1x (1:14) scheduled 2026-11-17 07:00 (-evU9ACFrQA); generic tropes only; new rooftops/street sets |
| 11 | What if you could photosynthesize | v1; 1.1x (0:60) scheduled 2026-11-17 07:00 (62YTQU1p1Hs); new park set; green lead for this episode only |
| 12 | What if you fell between dreams and reality | v1; 1.1x (1:05) scheduled 2026-11-16 07:00 (vGaHtPu6Ug0); first build on outdoor kit, backdrops, TRANS, 3D sky-fall clouds; shipped from the 1080p preview with known defects (haze, shot 27 clock blur, shot 6 roofs) |
| 13 | What if the train came after you (first twist-format trial, 1899 Wyoming) | v1; 1.1x (1:12) scheduled 2026-11-08 07:00 (SUe1Lr0CjnU); new west set, drawn horses, rolling train, flown cameras (CAM_PATH); lead keeps only the curl, western outfit this episode (user 2026-11-07) |
| 14 | What If You Invaded Switzerland (twist format) | v1; 1.1x (1:14) re-uploaded 2026-11-08, scheduled 2026-11-11 07:00 (Z0CINnDCS48; old wIUlzSxMeNk kept private, no schedule); new alps set; olive jacket, this episode only |
| 15 | What If You Sank Your Own Submarine (twist format) | v1; 1.1x (1:15) re-uploaded 2026-11-08, scheduled 2026-11-15 07:00 (1Pc_LBjF4vQ; old 6VquJ5tJ_qE kept private, no schedule); new pacific set; grey sweater, this episode only |
| 16 | What If You Had to Tip for Everything (twist format) | v1; 1.1x (1:10) scheduled 2026-11-09 07:00 (5kSvQ15Q-A4); new tips set |
| 17 | What If Your Salary Floated Over Your Head (twist format) | v1; 1.1x (1:10) scheduled 2026-11-14 07:00 (F5S1RxyD7tg); new salary set; flicker_qa gate added |
| 18 | What If a Tornado Picked You Up (twist format, real survivor) | v1; 1.1x (1:11) scheduled 2026-11-12 07:00 (AsSxbUUprEo); new tornado set; not reviewed by the user before scheduling |
| 19 | What If You Dropped a Frozen Turkey in a Fryer | v1; scheduled 2026-11-24 07:00 (qXrTrXgq9I4), before Thanksgiving; new turkey set |
| 20 | What If America Never Bought Alaska | v1; scheduled 2026-11-10 07:00 (w3UqyD7CrQE); new alaska set |
| 21 | What If Every Word Cost Money | v1; scheduled 2026-11-13 07:00 (tnztZiELvpI); new talkton set |
| bts | I Fixed the Cat (8 s before/after test, not a story) | scheduled 2026-11-10 07:00 (9Lz2k5owq_8) |
