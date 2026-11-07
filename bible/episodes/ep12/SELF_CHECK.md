# ep12 self-check (2026-11-07, preview build, fix round)
Contact sheets: studio/out/ep12/contact_ep12.jpg + contact_ep12_gray.jpg (one frame per shot, cut from the preview; the per-phrase selfcheck sheets predate this round). Times = raw voice seconds (1.1x applied after the render).
Format: `<id> CLEAN|FIX - verb / what the still shows`, then the value line (director rule 2026-11-07, judged in grayscale first; sky-fall and mid-air shots exempt from near-dark, only a real near object carries it).

1 CLEAN - falls / belly-down over the town, limbs flailing, alarm clock tumbling; no balloon, no white opening frames, 3D clouds at the frame edges, ground hazed
  value: sky shot, exempt from near-dark (rule 2026-11-07: nothing is near in the sky; depth = hazy ground + cloud layers)
2 CLEAN - falls, "never land" / you over the town from 200 m, shook
  value: sky shot, exempt from near-dark (rule 2026-11-07: nothing is near in the sky; depth = hazy ground + cloud layers)
3 CLEAN - rolls off the bed / high side view: lying across the frame on the bed, rolls toward the lens, drops to the floor; bed stays behind you
  value: interior, n/a
4 CLEAN - wakes in the sky / zoom-through the floor into the sky-fall rig at 445 m, tired -> shock at "sky", plane + clock, 3D clouds
  value: sky shot, exempt from near-dark (rule 2026-11-07: nothing is near in the sky; depth = hazy ground + cloud layers)
5 CLEAN - falls at 200 km/h / low angle, speed lines, dial "200 KM/H" clear of the head, panic flail on "two hundred"
  value: sky shot, exempt from near-dark (rule 2026-11-07: nothing is near in the sky; depth = hazy ground + cloud layers)
6 CLEAN - roofs below, jerks / house block from 24 -> 15 m: orange roofs fill the lower frame, shock burst on "jerks", dipWhite cut
  value: near-dark/mid/far-light OK (roof edges near, garden far); sky-fall haze off below 60 m
7 CLEAN - jolts upright, heart pounding / sitting up in bed, hand on chest, red heart beating from "heart"
  value: interior, n/a
8 CLEAN - slides off the edge again / slide_off beside the bed, low angle
  value: interior, n/a
9 CLEAN - wakes above a desert / side view at 80 m, mesa + low sun, jawdrop at "desert"
  value: sky shot, exempt from near-dark (rule 2026-11-07: nothing is near in the sky; depth = hazy ground + cloud layers)
10 CLEAN - the sea / lighthouse, sea, a near gull silhouette
  value: near-dark/mid/far-light OK (gull is a real near object)
11 CLEAN - the mountains / dawn peaks, you shocked
  value: sky shot, exempt from near-dark (rule 2026-11-07: nothing is near in the sky; depth = hazy ground + cloud layers)
12 CLEAN - every fall feels real, spins / close, camera roll 14 deg, card roll, scared -> shook
  value: sky shot, exempt from near-dark (rule 2026-11-07: nothing is near in the sky; depth = hazy ground + cloud layers)
13 CLEAN - drifts off / top-down asleep in bed: head fully on the pillow, blanket over the body, Z z, tired -> smile_closed
  value: interior, n/a
14 CLEAN - insert: springs go slack, brain rings FALLING? (said-not-shown: "muscles", "brain", "falling" OK)
15 CLEAN - the twitch catches you / falling past the flats; shock face lands on "twitch" with the jerk (f1022, word f1022), 0.58 s pop back to tired
  value: sky shot, exempt from near-dark (rule 2026-11-07: nothing is near in the sky; depth = hazy ground + cloud layers)
16 CLEAN - insert: 10 sleepers, 7 jerk, "7 IN 10" (said-not-shown OK)
17 CLEAN - the door between worlds slams / high side view over the dawn slope: the door hangs below you, leaf slams on "slams" (top-down ground read as blocky patches)
  value: sky shot, exempt from near-dark (rule 2026-11-07: nothing is near in the sky; depth = hazy ground + cloud layers)
18 CLEAN - slams every time / dipWhite into the sea, whole card tumbling, gull
  value: near-dark/mid/far-light OK (gull is a real near object)
19 CLEAN - the lucid-dream trick / top-down over the sea, chin_think, bubble "READ TWICE", limbs calming, 3D clouds
  value: sky shot, exempt from near-dark (rule 2026-11-07: nothing is near in the sky; depth = hazy ground + cloud layers)
20 CLEAN - raises the wrist, reads the watch / watch_read from "read", watch on the wrist; iris closes on the watch
  value: near-dark/mid/far-light OK (gull, navy strap)
21 CLEAN - 3:07 -> blink -> 9:40 / the watch face fills the frame, in focus (said-not-shown OK)
  value: near-dark/mid/far-light OK
22 CLEAN - squints, numbers won't stay put / digits 3 0 7 9 4 0 drifting round you, squint -> sly at "numbers"
  value: sky shot, exempt from near-dark (rule 2026-11-07: nothing is near in the sky; depth = hazy ground + cloud layers)
23 CLEAN - doesn't flinch, arms open / golden field from 60 m, smile -> relief, limbs slow to a starfish on "flinch"
  value: sky shot, exempt from near-dark (rule 2026-11-07: nothing is near in the sky; depth = hazy ground + cloud layers)
24 CLEAN - lets the fall happen / wide: windmill, balloon from the side, low sun, you still in a relaxed starfish
  value: near-dark/mid/far-light OK (windmill + long shadows near)
25 CLEAN - lands softly / match cut A: on your back in the meadow on the diagonal, hands behind the head, ankles crossed, puff on landing
  value: near-dark/mid/far-light OK (card ink over mid grass; ground shot, no sky exemption needed)
26 CLEAN - wakes on the bedroom floor / match cut B: same pose, diagonal and framing on the carpet, dazed at "floor"
  value: interior, n/a
27 CLEAN - checks the clock twice / 3:07 on the nightstand LED + 3:07 big in the foreground; looks away and back, jawdrop on "twice" (said-not-shown OK)
  value: interior, n/a
28 CLEAN - the question / sitting on the floor, squint -> sly at "awake", to the lens
  value: interior, n/a

said-not-shown OK (200 km/h dial, 7 IN 10, 3:07 / 9:40 watch, 3:07 clock twice, desert / sea / mountains / field each on screen).
Gates (preview build, full episode): staging_qa PASSED (haze rule waived for `fall` cams; side views use shot.haze; flat cards now judged with a 5 mm occlusion slack and lowest-support gap; 2D inserts no longer counted; fall_belly shots out of the foreground mix, 38 %).
expr_qa PASS. temporal_qa PASS after shot 6 went 21 -> 16 m (2.36 -> 0.79 k/Mpx); worst 0.79; shots 10, 11, 12, 24 have no 16-frame window, not measured.
Rig: 54 fall_belly samples across phases, 2 arms / 2 legs every time; hair curl island 0.2-0.3 % stays under the 0.4 % limit. Rerun all gates once before the 2K final.
