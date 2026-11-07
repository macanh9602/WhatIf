// What If ep12 "What If You Fell Between Dreams and Reality?" (2026-11-07). Times in seconds from public/eps/ep12/words.json
// (Chatterbox, raw voice time; the 1.1x speed-up is applied after the render, as in ep11). bible/episodes/ep12/SCRIPT.md has
// the facts + the beat table. insert = 2D card. Sky shots: { fall } = top-down sky-fall rig, the rest are side views of
// you pinned in the air (cast.ts AIR), cards turned to the lens (card "cam").
import type { SetId } from "../../sets";
import { F, M, CamSpec, Light, Move, ShotDef, Size } from "../../shot";
import type { Trans } from "../../story";

export const TOTAL = F(71.6); // voice ends 70.4 s + a hold on the question

const S = (id: number, a: number, b: number, set: SetId, cam: CamSpec, size: Size, light: Light = "day", extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set, cam, size, light, ...extra });
const I = (id: number, a: number, b: number, insert: string): ShotDef => S(id, a, b, "bedroom", { cam: "wide" }, "wide", "lamp", { insert });
const TOP = { angle: "top" as const }, AIRC = { card: "cam" as const };

export const SHOTS: ShotDef[] = [
  S(1, 0, 2.55, "town", { fall: [-48, 0, 48], h: [380, 335], rush: 70 }, "wide", "day", TOP),                          // hook: falling over the town, the alarm clock tumbling beside you
  S(2, 2.55, 4.62, "town", { local: [2.0, 203.6, 34.6], lookAt: [0, 200.9, 30], fov: 46 }, "mid", "day", { angle: "high", ...AIRC }), // "never land": the town far below you
  S(3, 4.62, 6.75, "bedroom", { local: [1.3, 2.5, -2.2], lookAt: [-0.6, 0.25, -2.2], fov: 50 }, "mid", "lamp", { angle: "high", card: { flat: 0 } }), // you roll off the bed toward the lens onto the floor (high side view: the bed stays behind you)
  S(4, 6.75, 9.57, "town", { fall: [0, 0, 0], h: [445, 425], rush: 40 }, "wide", "day", TOP), // the floor opens: you wake above your town
  S(5, 9.57, 12.55, "town", { local: [1.5, 149.0, 3.4], lookAt: [0, 150.9, 0], fov: 46 }, "mid", "day", { angle: "low", ...AIRC }), // 200 km/h: low angle, speed lines
  S(6, 12.55, 15.17, "town", { fall: [96, 0, 9], h: [21, 16], rush: 90 }, "wide", "day", TOP),                         // the roofs rush up, the jerk
  S(7, 15.17, 18.45, "bedroom", { local: [-0.35, 1.3, 1.0], lookAt: [-1.1, 0.95, -2.0], fov: 44 }, "mid", "lamp"),     // jolt upright, heart pounding
  S(8, 18.45, 20.52, "bedroom", { local: [-2.75, 0.55, 0.6], lookAt: [-1.85, 0.75, -2.1], fov: 46 }, "mid", "lamp", { angle: "low" }), // sliding off the edge again
  S(9, 20.52, 22.9, "desert", { local: [1.9, 82.3, 5.2], lookAt: [0, 80.9, 0], fov: 48 }, "mid", "golden", { angle: "high", ...AIRC }),                   // above a desert
  S(10, 22.9, 23.94, "sea", { local: [2.6, 62.6, 7.2], lookAt: [0, 61.4, 0], fov: 50 }, "mid", "day", { angle: "high", ...AIRC }), // then the sea
  S(11, 23.94, 25.02, "mountains", { local: [1.2, 150.5, 5.2], lookAt: [0, 151.3, 0], fov: 50 }, "mid", "dawn", { angle: "low", ...AIRC }), // then the mountains
  S(12, 25.02, 27.35, "mountains", { local: [0.5, 151.7, 2.4], lookAt: [0, 151.5, 0], fov: 44 }, "close", "dawn", AIRC),   // every fall feels real: spinning
  S(13, 27.35, 30.0, "bedroom", { local: [-1.1, 3.0, -2.3], lookAt: [-1.1, 0.55, -2.35], fov: 50 }, "mid", "lamp", { ...TOP, card: { flat: 0 } }), // drifting off in bed
  I(14, 30.0, 33.28, "relax"),                                                                                          // muscles go slack, the brain: FALLING?
  S(15, 33.28, 35.4, "town", { local: [42.3, 16.1, 35.6], lookAt: [40, 14.6, 30], fov: 50 }, "mid", "day", { angle: "high", ...AIRC }), // the twitch catches you
  I(16, 35.4, 37.95, "seven"),                                                                                          // 7 of 10 sleepers jerk
  S(17, 37.95, 41.33, "mountains", { local: [1.4, 153.0, 4.6], lookAt: [0, 149.4, -0.6], fov: 50 }, "wide", "dawn", { angle: "high", ...AIRC }), // a bedroom door below you (straight down this set reads as blocky patches)
  S(18, 41.33, 43.35, "sea", { local: [7, 66, 18], lookAt: [3, 61.5, 0], fov: 50 }, "wide", "day", { angle: "high", ...AIRC }), // slam: the sea
  S(19, 43.35, 46.2, "sea", { fall: [10, 0, -24], h: [150, 122], rush: 40 }, "wide", "day", TOP),                       // the lucid-dream trick
  S(20, 46.2, 49.07, "sea", { local: [0.35, 101.3, 2.1], lookAt: [0, 101.15, 0], fov: 44 }, "close", "day", AIRC),       // raise the wrist, read the watch
  S(21, 49.07, 51.65, "sea", { local: [0.35, 101.3, 2.1], lookAt: [0, 101.15, 0], fov: 44 }, "close", "day", AIRC),      // the watch face: 3:07, then 9:40
  S(22, 51.65, 55.24, "sea", { local: [1.3, 101.5, 3.3], lookAt: [0, 101.0, 0], fov: 46 }, "mid", "day", AIRC),          // squint: numbers never stay put
  S(23, 55.24, 58.4, "field", { local: [-2.0, 61.9, 5.0], lookAt: [0, 60.9, 0], fov: 48 }, "mid", "golden", { angle: "high", ...AIRC }),                     // you know: arms open, no flinch
  S(24, 58.4, 61.02, "field", { local: [14, 31, 22], lookAt: [0, 28, 0], fov: 46 }, "wide", "golden", { angle: "high", ...AIRC }), // let the fall happen
  // 25 -> 26 match cut: lying on the back on the same diagonal (yaw 0.45), the lens 3.0 m above and 1.35 m toward the feet
  S(25, 61.02, 63.04, "field", { local: [19.67, 3.21, 0.68], lookAt: [19.67, 0.21, -0.67], fov: 50 }, "mid", "golden", { angle: "high", card: { flat: 0.45 } }), // land softly in the grass
  S(26, 63.04, 65.08, "bedroom", { local: [0.27, 3.01, 0.18], lookAt: [0.27, 0.01, -1.17], fov: 50 }, "mid", "lamp", { angle: "high", card: { flat: 0.45 } }), // match cut: the bedroom floor
  S(27, 65.08, 68.23, "bedroom", { local: [0.25, 0.95, 2.2], lookAt: [0.6, 0.6, -0.9], fov: 46 }, "mid", "lamp"),      // the clock: 3:07, twice
  S(28, 68.23, 71.6, "bedroom", { local: [0.5, 0.9, 1.5], lookAt: [0.6, 0.72, -0.9], fov: 44 }, "mid", "lamp"),        // are you sure you're awake?
];

// side views of the big outdoor sets: real air between you and the ground (street level tighter); the fall rig has its own haze
for (const s of SHOTS) if (!s.insert && s.set !== "bedroom" && !("fall" in s.cam)) s.haze = s.id === 15 ? [8, 220] : [12, 320];

// SCRIPT.md transitions: zoom-through the floor into the sky, a white dip on every jerk, whips round the loop, iris on the watch
export const TRANS: Record<number, Trans> = {
  4: { kind: "zoom", dur: 14, cx: 0.62, cy: 0.42 },
  7: { kind: "dipWhite", dur: 6 },
  9: { kind: "zoom", dur: 12, cx: 0.45, cy: 0.35 },
  10: { kind: "whip", dur: 10 }, 11: { kind: "whip", dur: 10 },
  13: { kind: "dipBlack", dur: 10 },
  18: { kind: "dipWhite", dur: 6 },
  21: { kind: "iris", dur: 8, cx: 0.62, cy: 0.5 }, // 8 f: a longer fully closed iris trips render.mjs blank-frame check
  23: { kind: "whip", dur: 10 },
};
export const XFADE: Record<number, number> = {};
export const FLASH_AT = F(4.62); // end of the hook
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const KICKS = [F(15.05), F(34.0), F(41.2)]; // the jerks: rooftops, the twitch, the slam
export const MOVES: Record<number, Move[]> = {
  1: [M("push", 2.0, 14, 0.06)],       // "never"
  5: [M("push", 10.4, 16, 0.08)],      // "two hundred"
  12: [M("roll", 25.0, 60, 14)],       // the spin
  20: [M("push", 47.5, 14, 0.12)],     // "watch"
  22: [M("push", 53.4, 16, 0.06)],     // "numbers"
  24: [M("crane", 58.4, 70, -0.08)],   // let it happen: drift down with you
  27: [M("push", 65.8, 14, 0.08)],     // "three-oh-seven"
  28: [M("push", 69.5, 16, 0.08)],     // "awake"
};
export const HOLD: Record<number, number> = {};

/** no green-removal in this episode */
export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });

export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [
  [3, 0, "floating", "the roll off the bed: mid-drop from the mattress to the floor for 0.25 s"],
  [25, 0, "floating", "the soft landing: 0.3 s drop into the grass"],
  [13, 0, "floating", "asleep in bed, top-down: the card lies 9 cm over the pillow (closer, ink.ts draws the pillow edge across the face); the gap is under the blanket and never seen from above"],
];
