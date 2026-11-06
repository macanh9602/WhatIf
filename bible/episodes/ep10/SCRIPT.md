# ep10 "What If You Lived One Day Inside a Cartoon?": script v1 (2026-11-06, target ~1:15 after 1.1x)
Text: eps/ep10/script.txt (226 words). Voice: Chatterbox (narrator_ref.wav). Status: waiting for human approval #1, no voice yet.
Topic from the user (2026-11-06): "một ngày trong một bộ phim Cartoon Network". Made GENERIC on purpose: no network name, no show,
no character, no look copied from any studio (trademark / copyright on a monetized channel; see the system's "no recreations" rule).
Tropes used (cliff hang, anvil, spinning legs, four fingers) are genre-wide conventions, not one show's property.
The cliff is a city rooftop, not a desert canyon, to stay clear of one well-known chase cartoon.

## Premise
For one day (midnight to midnight) you live under cartoon rules. At midnight real physics comes back.

## Facts / own calcs
- Four fingers: widely reported as a time/cost saving in hand-drawn animation (Mental Floss; AV Club). Secondary sources only,
  so the script calls it "a shortcut" and backs it with our own count, not with a quote.
- Own calc: a 7-minute short at 12 drawings a second ("on twos") = 7 x 60 x 12 = 5,040 -> "about five thousand drawings".
- O'Donnell's Laws of Cartoon Motion, Esquire, June 1980; law 1: "Any body suspended in space will remain in space until made
  aware of its situation." (Wikipedia, Cartoon physics; reprinted IEEE Institute 1994). Script: "in 1980 a magazine wrote ...".
- Free fall: d = 1/2 g t^2 = 4.9 m after 1 s; a storey ~3 m -> "a storey and a half".
- Squash and stretch: Thomas & Johnston, The Illusion of Life (1981), called it "by far the most important" principle; the
  shape changes, the volume stays the same. Script: "the first rule animators learn" (it is listed first of the twelve).

## Chain
cartoon day -> outline, saucer eyes, four fingers (because 5,000 drawings) -> run off a rooftop -> hang, because the 1980 law
-> real you would have dropped -> look down, fall, anvil, pancake -> pop back -> because squash and stretch keeps volume
-> real bodies don't bounce back -> 11:59 midair, eyes shut -> midnight, gravity ignores where you look -> question.

## Events (7) / spoken numbers (4)
Events: cartoon you, drawings, rooftop run, 1980 law, anvil, squash and stretch, midnight.
Numbers: four fingers, five thousand, 1980, 11:59. ("a storey and a half" is an image.)

## Sets (NEW, none reused from ep01-09; user 2026-11-06: "bối cảnh khác đi")
- `rooftops`: a row of city rooftops at morning: water tower, vents, a clothes line, a gap between buildings over a street.
- `street`: the street below: crossing, shop awnings, a manhole, where the anvil lands.
- Look idea (to test, not promised): during the cartoon day the ink gets thicker and the shading flatter; at midnight it eases
  back to the channel's normal look. Needs a per-shot ink width / flat-shade switch in ink.ts / toon.ts.

## Beat -> picture (verb)
| # | line | picture | verb | set |
|---|---|---|---|---|
| 1 | hook | you standing on air past a roof edge, smiling, then glancing down | stands, glances | rooftops |
| 2 | wake | close: you look at your hand, count four fingers, outline thick | counts | rooftops |
| 3 | drawings | insert: a flipbook riffles, counter climbs to 5,040, a fifth finger is erased | riffles, erases | insert |
| 4 | run | your legs spin in place in a blur, then you shoot off the roof | spins, runs | rooftops |
| 5 | hang | midair, arms crossed, a "LAW #1 · 1980" page flutters past | hangs, reads | rooftops |
| 6 | real | ghost of a real you 1.5 storeys lower, a dotted drop line | (ghost) falls | rooftops |
| 7 | anvil | you look down, drop; an anvil lands, you are a flat pancake on the street | falls, flattens | street |
| 8 | pop | you peel off the ground, shake, pop back | peels, pops | street |
| 9-10 | squash | insert: a ball squashes wide and stretches tall, a VOLUME gauge never moves | squashes | insert |
| 11 | real body | insert: a real figure next to the ball, "NO BOUNCE" | (none, deadpan) | insert |
| 12 | 11:59 | night, you midair over the street, eyes shut tight, a clock at 11:59 | hangs, squeezes eyes | street |
| 13 | midnight | clock hits 12, fifth finger pops back, outline thins, you drop out of frame | drops | street |
| 14 | question | morning, you on an awning, dazed, holding up five fingers | holds up | street |

Cast: YOU (people.ts). The cartoon-day YOU (thicker outline, saucer eyes, four fingers) is a look change for the lead -> cast
sheet to the user first. Props: anvil, flipbook, clock.

## Checklist
- [x] Hook 15 words, a paradox with a human subject
- [x] Chain written as A -> B -> C
- [x] <= 8 events, <= 5 numbers, one payoff (midnight answers "until you look down")
- [x] No sentence > 22 words
- [ ] Avg >= 10 words between pauses (after TTS)
- [ ] 226 words, the longest of the four (ep06: 223 = 1:18); TTS length not measured yet, may need a cut
- [x] Every beat has a verb
- [x] Muted read by the director on the beat table; no fresh reviewer session was run
