# ep21 "What If Every Word Cost Money": script v1 (2026-11-08)
Text: eps/ep21/script.txt (180 words, hook 9 words). Voice: Chatterbox (narrator_ref.wav), eps/ep21/voice/voice.mp3 = 73.75 s speech (hard cut at 73.80 s) + 2.5 s silent tail = 76.30 s = 2289 frames (speech 67.0 s, whole file 69.4 s at 1.1x).
Status: approved in advance by the user (BACKLOG row 21). Pure fiction, no facts to source. Not a twist-format story (no "You see," reveal): a comedy with a gag ending, so check_script.py is not meant for it.
Lead: the channel's "you" (one curl, red varsity jacket, white tee, jeans), no costume change. The red jacket is the payoff prop of the last shot.
Cast needed: Baker (Neighbor, add an apron if cheap), Runner (the man who bumps you), Grandma (waves from a window), and ONE new person: Mia (young woman, warm cardigan; people.ts is a shared file, so one owner adds her). No other new cast.

## Premise
You get off the bus in Talkton, a town where every word costs ten cents and "I love you" costs three dollars. Your guide is a rented talking box hung on your chest, and the box has its own meter: $18.00 of words. Every word the narrator says takes ten cents off it, so the counter on screen IS the narration. You walk to Mia's house with exactly three dollars for one sentence. The narrator cannot stop talking (the market, the bridge, "why am I describing a bridge? that is money"), the meter falls, you pay your $3 at Mia's door, and the narrator reaches zero in the middle of Mia's answer: "She says, I love". Silence. The box dies and spits out a paper strip with the unpaid words: "...YOUR JACKET." (She loves the jacket.) The story's last words land on screen, not in the voice.
Why it works: the hook's price is paid off in the porch scene; the counter gives the viewer a clock they can read without help; the cut is built (the narrator announces "ten words left" and then spends exactly ten); the last gag turns "I love you" into "I love your jacket".

## The money counter (the spine; the picture agent must follow it exactly)
- Prop: the GUIDE BOX, a yellow box with a speaker grille, hung on the lead's chest by a neck strap, big red 7-segment display, a small paper-strip slot under it, a tag "RENTED GUIDE". It must be readable in every medium shot (make it big, chest-sized).
- Rule: start 18.00. Every word (not caption: every spoken word) takes 0.10 off the display at the word's START. After word k the display reads 18.00 - 0.10 k. File: eps/ep21/meter.json (word, start, end, balance for all 180 words). Drive the display from it, do not retype numbers.
- Landmarks, all sharp NO_LENS close-ups: word 90 "empty" at 36.85 s reads $9.00 (the narrator says "half empty"); word 170 "left" at 68.91 s reads $1.00, with a small plate "= 10 WORDS" under the display; word 180 "love" at 73.33 s reads $0.00; the next word is unpayable, so at 73.80 s the voice dies.
- The cut: the voice is cut hard (30 ms fade) at the end of "love". Music also stops at 73.80 (no tail). At 73.82 SFX: crack + power-down, the display flickers and dies, then at 74.4 a paper strip prints "...YOUR JACKET." (see shot 33). The unpaid words are never spoken.
- Hook frame: the display shows 18.00 and starts to fall in the first second; the first word is already charged.

## Beats
1 hook (price board) 2 bus, the arch "ANY WORD 10 CENTS" 3 "even mine" (the box ticks) 4 the box counter, Mia, three dollars 5 market: nobody wastes a word, pointing is free 6 the man who does not say sorry (5 dollars) 7 half empty ($9.00) 8 the bridge and the narrator describing too much 9 "I will be quiet now" (promise broken in 3 s: "Night falls") 10 neighbor wave is free, porch, knock, door 11 you pay $3 into the LOVE BOX, "Pling, paid in full" 12 "I have ten words left" 13 Mia smiles, opens her mouth, "I love" CUT 14 the strip: "...YOUR JACKET."
Spoken numbers, each on a prop: three dollars (shot 1, board "I LOVE YOU $3.00"), ten cents (shot 3, arch sign), five dollars (shot 13, board "SORRY $5.00"), ten words (shot 30, box plate). Never three number beats in a row (3, 10, 5, 10 with 6+ non-number beats between them). Shown, not spoken: $18.00 (box), three $1 bills (07), $9.00 (15), LOVE BOX $3.00 (27), $0.00 (32).
Hook answer: the hook (the price) is on a board with you in frame in the first 2 s. The story answers it only at 59-65 s (you pay $3 for the sentence); the gag at 73.8 s. "Imagine" is not used; the first line is the hook.
Plain-word check: rented guide, meter, bumps, sorry, bridge, porch, "pling". No idiom beyond "wastes a word" and "half empty" (the display shows $9.00 beside it).

## True / invented
True: nothing is claimed as fact. No real town charges for words; the video says so in the description.
Invented: everything: Talkton, the prices, the Guide Box, the Love Box, Mia, the strip.

## SHOTLIST
Locations, all outdoors (100 %, no inserts: the box, boards and strip are props in the world): (A) Talkton gate: bus stop, arch "TALKTON", Main Street, day, shots 1-7; (B) the market street: stalls, bakery, price lamp-post, day, shots 8-15; (C) the stone bridge over a creek, golden, shots 16-20; (D) Mia's street + porch, night, shots 21-33. 33 shots in 76.3 s (avg 2.3 s). 4 locations, new for the channel (no backyard, no Alaska): town kit (bus_stop, market_stall, shop_awning, street_lamp, house_a/b, mailbox, fence_section, fountain, bridge_deck, bridge_pier, tree_round, sign_post, bench) on a new set `talkton`.
Light: A day, B day (warm), C golden (long shadows over the creek), D night (dipBlack in; porch light and lamps are the warm pools; the box display glows red).
Held / worn / pinned props for the Prop check: Guide Box worn on a strap (it hangs from the neck, moves with the chest, never floats; its strap is visible), three $1 bills (07 held in the hand and tucked into the jacket pocket; 27 they flutter out of the pocket into the slot), loaf of bread held (09-10), pointing finger (09-10), Runner's hand over his own mouth (12), Grandma waving at the window (22-23), the paper strip (33: hangs from the box slot, large readable letters, 2.4 s on screen, the red jacket in the same frame). Pinned set props: arch "TALKTON / ANY WORD 10c / FREE: POINT, WAVE, NOD", board "I LOVE YOU $3.00" (hook), market lamp-post price list "SORRY $5.00", bakery stall "BREAD", LOVE BOX (a brass mailbox-style box on the porch post, "LOVE BOX $3.00", a lamp lights and a bell rings on "Pling"), porch door and light.

| id | time (raw s) | line | set + light | camera (size, angle, MOVE + why) | lead's pose / verb | card | prop / near dark | in-transition |
|---|---|---|---|---|---|---|---|---|
| 01 | 0.10-3.06 | In this town, "I love you" costs three dollars. | A gate, day | mid to close, low, push in from the street sign to his face: board "I LOVE YOU $3.00" stands beside him, the box display (18.00, falling) on his chest | looks at the board, gulps, thumbs his chest box | cam | board sharp NO_LENS, bus-stop pole near dark | hard |
| 02 | 3.06-6.14 | You step off the bus in Talkton. | A gate, day | wide, high, crane up and back: the bus pulls away, arch "TALKTON", the street running to the far hill, he is small on the kerb | steps off, looks around | side | bus stop post + bin near dark | hard |
| 03 | 6.14-8.71 | Every word here costs ten cents. | A gate, day | close, low, push in on the arch board "ANY WORD 10c" (small line: "FREE: POINT, WAVE, NOD"), him under it | reads the board, one eyebrow up | cam | board sharp NO_LENS, arch leg near dark | hard |
| 04 | 8.71-10.41 | Even mine. | A gate, day | close on the Guide Box, tilt up to his face: the display ticks down | looks down at the box, flat face | cam | box sharp NO_LENS, strap near | hard |
| 05 | 10.41-13.65 | I am your rented guide. Watch my meter go down. | A gate, day | mid, front 3/4, dolly back head on: the box fills the lower frame, the display falls, tag "RENTED GUIDE" | holds the box up with both hands, shows it to us | cam | box sharp NO_LENS | hard |
| 06 | 13.65-16.34 | Mia lives at the end of Main Street. | A street, day | wide through a lamp post (foreground layer), tracking along the road, a small house with a lit door far ahead | walks, hands in pockets | side | lamp post near dark | hard |
| 07 | 16.34-19.65 | You carry exactly enough for one sentence. | A street, day | close on the hand: three $1 bills, he tucks them into the jacket pocket, pull back to mid | tucks the bills away, pats the pocket | cam | bills sharp NO_LENS | hard |
| 08 | 19.65-22.90 | At the market, nobody wastes a word. | B market, day | wide, high, crane up and back over the stalls: the crowd nods, points, mouths shut, a sign "10c A WORD" | walks in, looks about | side | stall + crate near dark | whip |
| 09 | 22.90-26.01 | The baker says, "Bread." You point. | B market, day | mid, over the shoulder through a stall awning (foreground layer), slow push: the Baker lifts a loaf, one word on his sign "BREAD" | points at the loaf | side | awning edge + loaf sharp | hard |
| 10 | 26.01-27.55 | Pointing is free. | B market, day | close on the pointing hand and the loaf, a small sign "POINTING: FREE" in frame | points, nods, takes the loaf | cam | sign sharp NO_LENS | hard |
| 11 | 27.55-29.26 | A man bumps into you. | B market, day | mid, low, quick truck right: the Runner bumps him, the loaf pops up | stumbles, loaf in the air | side | stall leg near dark | hard |
| 12 | 29.26-31.11 | He does not say sorry. | B market, day | close on the Runner, hand over his own mouth, eyes wide, backing away | glares (small, back of frame) | cam | Runner sharp | hard |
| 13 | 31.11-33.36 | Sorry costs five dollars. | B market, day | mid to close, push in on the lamp-post price list: board "SORRY $5.00" at the top, the Runner hurries past it | looks at the board, stunned | cam | board sharp NO_LENS | hard |
| 14 | 33.36-35.55 | You walk on. I keep talking. | B market, day | low tracking along the stalls ahead of him (move: track), the box display swings in the corner | walks, the box ticking on his chest | side | stall legs near dark | hard |
| 15 | 35.55-39.42 | My meter is half empty, and we have not met Mia. | B market, day | close on the box at "empty" ($9.00), pull back to mid as he gives it a worried look | squints at the display, taps it | cam | box sharp NO_LENS | hard |
| 16 | 39.42-41.75 | You cross the old stone bridge. | C bridge, golden | wide, high, crane up and back: the stone bridge, the creek, long shadows, him small on the span | walks across | side | bridge parapet + rocks near dark | zoom (from the display into the bridge) |
| 17 | 41.75-44.86 | It is long, and old, and pretty. | C bridge, golden | mid, low, slow arc round him through the parapet posts (foreground layer): arches, flowers, the water | walks, looks at the view | side | parapet near dark | hard |
| 18 | 44.86-47.10 | Why am I describing a bridge? | C bridge, golden | close on the box, tight push: the display drops fast, the grille buzzes | looks down at the box, then at us | cam | box sharp NO_LENS | hard |
| 19 | 47.10-48.73 | That is money. | C bridge, golden | close on the display and his hand: a coin-shaped sparkle falls off the box | puts a hand over the grille | cam | box sharp NO_LENS | hard |
| 20 | 48.73-50.24 | I will be quiet now. | C bridge, golden | mid, front 3/4, dolly in: finger to the lips, the sky goes dusk behind him | finger on lips, nods | cam | parapet near dark | hard |
| 21 | 50.24-53.04 | Night falls. Mia's porch light is on. | D porch street, night | wide, high, crane down into the street: lamp pools, Mia's house far, the porch light glows, the gate sign "MIA" | stands at the end of the street, small | side | lamp post + gate near dark | dipBlack |
| 22 | 53.04-55.77 | A neighbor waves from a window. | D porch street, night | mid, low, past a fence (foreground layer), slow truck left: Grandma waves from a lit window | looks up, waves back | side | fence near dark | hard |
| 23 | 55.77-57.48 | Waving is free. | D porch street, night | close, two-shot: his waving hand and Grandma's, sign in the window "WAVING: FREE" | waves, grins | cam | sign sharp NO_LENS | hard |
| 24 | 57.48-59.10 | You climb the steps. | D porch, night | low behind him (over the shoulder), tracking up the steps to the lit door | climbs, one step at a time | side | step + railing near dark | hard |
| 25 | 59.10-60.53 | You knock. | D porch, night | close on the fist and the door, the porch light flares | knocks twice | cam | door sharp | hard |
| 26 | 60.53-62.09 | She opens the door. | D porch, night | mid front, door swings open on Mia in the warm light | lifts his head, hopeful | cam | Mia sharp | iris |
| 27 | 62.09-64.80 | You say it, and your money jumps into the box. | D porch, night | mid, orbit half a turn round him: his mouth moves silently, three bills flutter from the pocket into the LOVE BOX on the post ("LOVE BOX $3.00") | says "I love you", head high | side | LOVE BOX sharp, post near dark | hard |
| 28 | 64.80-65.81 | Pling. | D porch, night | close on the LOVE BOX: a lamp lights green, a bell on top rings | blinks | cam | box sharp NO_LENS | hard |
| 29 | 65.81-67.81 | It is paid in full. | D porch, night | close on the LOVE BOX tag "PAID IN FULL", pull back to him beaming | relieved, shoulders drop | cam | tag sharp NO_LENS | hard |
| 30 | 67.81-69.67 | I have ten words left. | D porch, night | close on the Guide Box: display $1.00 and the plate "= 10 WORDS", tick | looks down, winces | cam | box sharp NO_LENS | hard |
| 31 | 69.67-72.23 | Mia smiles. She opens her mouth. | D porch, night | mid, over the shoulder (his jacket back in the foreground), slow push on Mia | holds still, hopeful | side | his shoulder near dark, Mia sharp | hard |
| 32 | 72.23-73.80 | She says, "I love | D porch, night | mid front: Mia's face in the back, the Guide Box large in the foreground lower frame, display falling to $0.00 on "love"; at 73.80 it dies | leans in, eyes wide | cam | box sharp, Mia sharp (no lens blur) | hard |
| 33 | 73.80-76.30 | (silence) "...YOUR JACKET." | D porch, night | close to mid, slow push: the box smokes, spits a paper strip "...YOUR JACKET." that hangs under his chin; Mia nods behind, he glances down at his red jacket | looks at the strip, then at the jacket, then at Mia | cam | strip sharp NO_LENS, red jacket in frame | hard |

Shot list check: no lying or sleeping; payoff props sharp NO_LENS (board 01/13, bills 07, box 04/05/15/18/19/30/32, LOVE BOX 27/28/29, strip 33); each location has a wide (02, 08, 16, 21), a high or low angle (01, 02, 06, 08, 11, 14, 16, 17, 21, 22, 24, 25) and a foreground layer (06, 09, 17, 22, 31); over-the-shoulder 09, 24, 31; every action shot flies a move (crane 02/08/16/21, orbit 17/27, track 06/14/22, dolly 05/20, push 01/03/18/31/33, truck 11); outdoors 33 of 33; inserts 0 %. Transitions (keyed by incoming shot): whip 08, zoom 16 (the box display opens into the bridge), dipBlack 21 (night falls), iris 26 (the door opens on Mia); the rest hard. There are no chase or sky shots.
Photosensitivity: only the box flicker at 73.82-74.0 (two or three frames, red display, no full-frame strobe).

## Build notes for the picture agent
- New set `talkton` (SetId + SETS + POOLS if needed + builder; sets.ts is shared, ONE owner): origins A x 0 (kerb, bus stop, arch "TALKTON", board, Main Street running into the screen), B x 60 (market street: 4-5 stalls with awnings, the bakery stall, lamp post with the price list, crates), C x 120 (stone bridge deck on piers across a creek, parapet, grass banks, flowers; reuse bridge_deck + bridge_pier + water plane), D x 180 (night street: lamps, fence, Grandma's house with a lit window, Mia's house with porch, three steps, door, the brass LOVE BOX on a post). Backdrop biome "town" exists.
- Light: day (A, B), golden (C, long shadows), night (D: lamps and porch light as warm pools; lamp props need lit-glow cards or point lights, no pure-black frame; ep value gate p5..p95 >= .40 is hard at night, keep the street pale blue-grey and the near objects the only darks).
- New cards in cast.ts: Guide Box (the key prop, worn on a neck strap: draw the strap on the body, the display from meter.json by frame; 7-segment red digits, yellow body, grille, strip slot, plate "= 10 WORDS" revealed after word 168), paper strip, bread loaf, three $1 bills, boards (canvas textures with big letters), Mia (new Outfit).
- Meter data: eps/ep21/meter.json; also feed the display in far shots (a tiny red glow only, the number must read only from close/medium shots).
- Audio: audio/ep21/settings.json written and built (mix.wav PASS, 76.300 s = 2289 frames; TOTAL = F(2289/30)). Music stops dead at 73.8 s; the last 2.5 s are SFX only (crack, power-down, tape print, stamp). Pad the last shot to the end; do NOT add a 1.5 s pad (it is already in voice.mp3: 2.5 s).
- The voice was made from the full sentence "She says, I love your jacket." and cut at the end of "love" so the intonation is mid-sentence, not a falling ending. Do not regenerate from script.txt alone (it ends on "love"): the generation source with the unspoken tail is only a scratch file; the cut files are eps/ep21/voice/voice.mp3 (padded) and voice_nopad.mp3.
- Captions: words.json ends at "love"; the strip text in shot 33 is the only text for the gag. Make sure caption logic does not invent "your jacket".
- Fixes if the Opus build runs long: merge 18+19, 22+23, 28+29.

## Cards (YouTube draft)
Title: What If Every Word Cost Money? 💸
Description: In this town, "I love you" costs three dollars, and the narrator's words come out of the same meter.

Just so you know: this story is made up. No real town charges for words, and no real guide box runs out of money mid-sentence. The prices, Talkton and Mia are all invented for the joke.

#whatif #funny #cartoon #story #shorts
Tags: what if, every word cost money, i love you, funny story, cartoon short, comedy, shorts
Publish: not scheduled (no upload by this agent; add the card to ops/cards.json after the user watches the preview).

## Checklist
- [x] script.txt (180 words, hook 9 words, no "Imagine")
- [x] Voice made, cut at "love", padded 2.5 s, copied to public/eps/ep21 (voice.mp3, words.json = 180 words matching the script), mix.wav built (PASS)
- [x] meter.json (balance for every word)
- [x] Facts: none needed (pure fiction), disclaimer in the card
- [ ] Picture build (Opus agent): story.ts, cast.ts (Mia, Guide Box), inserts.tsx (empty), words.ts, sets.ts `talkton`; stills, value_qa (night), Prop check (box on the strap, bills, loaf, strip), preview, 1.1x upload copy, short_qa
- [x] Fix round 1 (2026-11-08): voice padded to 78.3 s (4.5 s tail) for the button (shots 33-35). Ending SFX in audio/ep21/settings.json: "beep" (out of credit) and Mia's "giggle", both synthesized in studio/audio/effects.py (procedural, no clip, no voice clone, no licence needed).
