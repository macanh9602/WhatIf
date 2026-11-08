// What If ep17 "What If Your Salary Floated Over Your Head". Times in raw voice seconds from public/eps/ep17/words.json; the 1.1x comes after the render.
// One set, `salary` (sets.ts): your street x 0 (your porch at x 0 z -3.4, the Neighbor's fence z -0.4 x 7.6-16.6, his roses inside),
// office plaza x 100 (desks z -3), café terrace x 200 (sun x -6..1, shade + bins x 4..8.5), park x 300 (bench z -0.9).
// Every shot flies a CAM_PATH (set-local). Over-the-shoulder rows of the shot list are front 3/4 two-shots (cards have no back).
import type { SetId } from "../../sets";
import { F, Light, Move, ShotDef, Size, V3 } from "../../shot";
import type { Trans } from "../../story";

export const TOTAL = F(2319 / 30); // voice 75.8 s + 1.5 s silent tail: the last shot holds to the end
const SET: SetId = "salary";
const S = (id: number, a: number, b: number, size: Size, light: Light, extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set: SET, cam: { cam: "wide" }, size, light, ...extra });
const LOW = { angle: "low" as const }, HIGH = { angle: "high" as const }, CAMC = { card: "cam" as const }, TOP = { cap: "top" as const };
export const SHOTS: ShotDef[] = [
  S(1, 0, 3.7, "close", "dawn", LOW),            // push up from his face to his tag
  S(2, 3.7, 4.78, "wide", "dawn", HIGH),         // crane up and back: a tag over every head
  S(3, 4.78, 6.35, "close", "day", LOW),         // orbit, he taps the tag
  S(4, 6.35, 10.05, "close", "day"),             // the bank app in his hand, rack up to the tag
  S(5, 10.05, 11.65, "mid", "day"),              // dolly back head on: walks off whistling
  S(6, 11.65, 15.3, "wide", "day", LOW),         // from the rose bed: the Neighbor under $96K
  S(7, 15.3, 17.4, "mid", "day"),                // both tags: his eyes go up to $41K
  S(8, 17.4, 19.35, "close", "day"),             // "Oh. That's nice."
  S(9, 19.35, 23.85, "wide", "day", HIGH),       // crane down the tower to the twin desks
  S(10, 23.85, 25.55, "mid", "day"),             // track past the pillar: the wave turns into a scratch
  S(11, 25.55, 28.7, "wide", "day", { ...HIGH, ...CAMC }), // the terrace sorts itself
  S(12, 28.7, 30.25, "mid", "day", LOW),      // big numbers in the sun
  S(13, 30.25, 31.85, "mid", "day"),          // small numbers by the bins
  S(14, 31.85, 34.52, "wide", "golden", LOW),    // park: the date walks up
  S(15, 34.52, 36.5, "mid", "golden"),           // her eyes go to his tag first
  S(16, 36.5, 39.88, "wide", "night", HIGH),     // crane up from the porch: a street of lanterns
  S(17, 39.88, 43.2, "close", "night"),          // the bank app still the same
  S(18, 43.2, 46.0, "mid", "night"),             // he picks up the paper
  S(19, 46.0, 52.1, "close", "night", TOP),      // 2001: ALL INCOMES ONLINE, crane up to the windows
  S(20, 52.1, 54.05, "close", "night", LOW),     // he looks up at his tag: it does not move
  S(21, 54.05, 59.0, "close", "night", TOP),     // the +29 % chart
  S(22, 59.0, 61.3, "mid", "night", LOW),        // dolly back: he marches to the fence
  S(23, 61.3, 64.3, "mid", "night"),             // "Seen by: You" under the Neighbor's tag
  S(24, 64.3, 66.42, "wide", "night", HIGH),     // heads snap down, windows go dark
  S(25, 66.42, 69.68, "close", "dawn", LOW),     // his tag has a second line
  S(26, 69.68, 71.5, "wide", "dawn", LOW),       // through the roses: the Neighbor looks anywhere but up
  S(27, 71.5, 72.38, "mid", "dawn"),             // he waves
  S(28, 72.38, 73.22, "mid", "dawn"),            // you wave
  S(29, 73.22, 2319 / 30, "wide", "day", HIGH),  // crane up and back: nobody looks up
];

/** no lens blur: the tags, the phone and the paper carry the lines */
export const NO_LENS = [1, 3, 4, 7, 8, 12, 13, 15, 17, 18, 19, 20, 21, 22, 23, 25, 27, 28];
export const TRANS: Record<number, Trans> = {
  5: { kind: "whip", dur: 8 }, 9: { kind: "dipWhite", dur: 6 }, 11: { kind: "whip", dur: 8 }, 14: { kind: "dipBlack", dur: 6 },
  16: { kind: "dipBlack", dur: 6 }, 22: { kind: "whip", dur: 8 }, 25: { kind: "dipWhite", dur: 6 },
};
export const XFADE: Record<number, number> = {};
export const FLASH_AT = -99;
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
/** word beats (raw s) */
export const BEATS = { head: 2.56, salary: 5.52, fine: 10.96, neighbor: 12.14, looks7: 16.28, oh: 17.5, nice: 18.8, mug: 22.2, wave10: 24.0, hi: 24.88,
  sorts: 27.54, sit13: 30.9, flowers: 33.0, above: 33.7, face: 35.96, night: 36.84, same17: 41.98, paper18: 43.9, open18: 44.15, look20: 52.4,
  name23: 63.74, duck23: 63.95, cliff: 65.28, waves: 71.78, wave28: 72.5 };
export const KICKS: number[] = [];
export const MOVES: Record<number, Move[]> = {};
export const HOLD: Record<number, number> = Object.fromEntries(SHOTS.map((s) => [s.id, 0]));

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ez = (t: number, a: number, b: number) => { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k); };
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

export const O = 100, C = 200, K = 300;
/** the lead walks along the pavement (z 1.0) in 5 and 22, toward +x */
export const walk5 = (t: number) => lerp(1.0, 3.2, ez(t, 10.1, 11.65));
export const walk29 = (t: number) => lerp(2.4, 0.6, (t - 73.22) / (2319 / 30 - 73.22));
export const walk22 = (t: number) => lerp(4.6, 8.4, (t - 59.0) / 2.3);

// ---------------- camera paths, set-local ----------------
type Path = { p: V3; l: V3; fov: number };
const fly = (a: number, b: number, p0: V3, p1: V3, l0: V3, l1: V3, fov = 46) => (t: number): Path => { const k = ez(t, a, b); return { p: mix3(p0, p1, k), l: mix3(l0, l1, k), fov }; };
const orbit = (c: V3, r: number, h: number, a0: number, a1: number, t0: number, t1: number, fov = 46) => (t: number): Path => { const a = lerp(a0, a1, ez(t, t0, t1)); return { p: [c[0] + r * Math.sin(a), h, c[2] + r * Math.cos(a)], l: c, fov }; };
const crane02 = (a: number, b: number) => fly(a, b, [2.2, 2.6, 8.4], [4.2, 8.0, 11.2], [2.6, 1.3, -1.0], [3.2, 0.6, -0.8], 50);
export const CAM_PATH: Record<number, (t: number) => Path> = {
  1: fly(0.2, 3.5, [0.35, 1.5, -1.25], [0.3, 1.6, -1.45], [0, 1.72, -3.35], [0, 2.05, -3.35], 54),
  2: crane02(3.7, 4.9),
  3: orbit([0.6, 1.6, 1.0], 2.3, 1.45, -0.4, 0.3, 4.78, 6.35, 54),
  4: fly(6.35, 9.9, [1.2, 1.55, 3.0], [1.05, 1.6, 3.1], [0.84, 1.48, 1.0], [0.76, 1.62, 1.0], 46),
  5: (t) => { const x = walk5(t); return { p: [x + 3.0 + 0.4 * ez(t, 10.05, 11.65), 1.35, 1.6], l: [x, 1.3, 1.0], fov: 46 }; },
  6: fly(11.65, 15.3, [16.0, 1.05, -3.1], [15.8, 1.05, -3.2], [12.2, 1.4, -0.4], [12.4, 1.4, -0.5], 52),
  7: fly(15.3, 17.4, [12.05, 1.55, 3.7], [12.1, 1.55, 3.35], [12.25, 1.75, -0.4], [12.3, 1.75, -0.4], 48),
  8: fly(17.4, 19.35, [12.15, 1.55, 1.15], [12.35, 1.58, 0.65], [12.8, 1.62, -1.25], [12.8, 1.64, -1.25], 46),
  // round 2: the crane starts over the office floor (it opened on the bare tower wall), lands on the twin desks
  9: fly(19.35, 22.2, [O + 3.2, 7.5, 7.5], [O + 1.7, 1.9, 2.4], [O, 0.6, -5.0], [O, 1.15, -3.4], 50),
  // round 2: a front 3/4 mid from his side (the pillar track was a near-empty frame): him big, the twin behind at right
  10: fly(23.85, 25.55, [O - 4.3, 1.35, -1.1], [O - 3.95, 1.35, -1.32], [O, 1.35, -3.75], [O - 0.05, 1.35, -3.75], 48),
  11: fly(25.55, 28.7, [C + 1.4, 5.6, 7.8], [C + 1.0, 5.0, 7.0], [C + 0.3, 0.8, -1.4], [C + 0.3, 0.8, -1.4], 52),
  12: fly(28.7, 30.25, [C - 5.9, 0.95, 3.3], [C - 3.0, 0.95, 3.3], [C - 5.6, 1.35, -1.6], [C - 3.0, 1.35, -1.6], 50),
  13: fly(30.25, 31.85, [C + 2.4, 1.05, 2.1], [C + 3.5, 1.05, 1.5], [C + 4.8, 1.05, -2.4], [C + 5.6, 1.05, -2.6], 50),
  14: fly(31.85, 34.52, [K + 1.2, 0.55, 6.4], [K + 1.0, 0.57, 6.1], [K - 0.6, 1.2, -0.4], [K - 0.1, 1.25, -0.4], 52),
  15: fly(34.52, 36.5, [K + 0.5, 1.7, 4.6], [K + 0.55, 1.7, 4.2], [K + 0.4, 1.7, 0.2], [K + 0.4, 1.7, 0.2], 46),
  16: fly(36.5, 39.7, [1.2, 1.0, -0.5], [3.6, 7.5, 9.0], [0, 1.0, -2.6], [2.0, 1.2, -2.0], 50),
  17: fly(39.88, 43.2, [0.85, 1.15, -0.85], [0.72, 1.13, -1.2], [0.2, 1.05, -2.55], [0.2, 1.03, -2.55], 46),
  18: fly(43.2, 46.0, [1.3, 1.25, 0.6], [1.0, 1.22, 0.0], [0.1, 1.1, -2.55], [0.1, 1.15, -2.55], 46),
  19: (t) => t < 49.0 ? fly(46.0, 49.0, [3.1, 1.3, -0.65], [3.1, 1.3, -0.5], [3.0, 1.32, 1.4], [3.0, 1.32, 1.4], 46)(t)
    : fly(49.0, 51.9, [3.1, 1.3, -0.5], [3.35, 2.3, -2.6], [3.0, 1.32, 1.4], [3.2, 2.45, 12], 46)(t), // round 2: rises behind him, his whole head under the laptop windows
  20: fly(52.1, 54.05, [3.3, 1.05, -0.6], [3.28, 1.07, -0.45], [3.0, 1.62, 1.4], [3.0, 1.64, 1.4], 50),
  21: fly(54.05, 59.0, [3.1, 1.32, -0.62], [3.08, 1.31, -0.45], [3.0, 1.28, 1.4], [3.0, 1.28, 1.4], 44), // round 2: face upper third, the chart lower middle
  22: (t) => { const x = walk22(t); return { p: [x + 2.8, 0.95, 1.35], l: [x, 1.35, 1.0], fov: 48 }; },
  23: (t) => t < 63.55 ? fly(61.3, 63.55, [11.85, 1.5, 4.2], [11.9, 1.52, 3.95], [11.75, 1.8, -0.4], [11.75, 1.8, -0.4], 48)(t)
    : fly(63.55, 64.15, [11.9, 1.52, 3.95], [12.3, 1.75, 2.1], [11.75, 1.8, -0.4], [12.45, 1.95, -1.3], 48)(t), // push onto "Seen by: You"
  // round 2: from the road, back to the homes: he stands lit on the pavement, the Neighbor ducks inside, the windows go dark behind them
  24: fly(64.3, 66.3, [11.0, 1.45, 5.0], [11.2, 2.3, 6.6], [11.0, 1.7, -1.5], [11.1, 2.3, -3.0], 54),
  25: fly(66.62, 69.5, [0.35, 1.5, -1.25], [0.3, 1.6, -1.45], [0, 1.72, -3.35], [0, 2.05, -3.35], 54),
  26: fly(69.68, 71.5, [16.0, 1.05, -3.1], [15.85, 1.05, -3.2], [12.2, 1.4, -0.4], [12.35, 1.4, -0.5], 52),
  // round 2: one mid two-shot over both waves (27 and 28 share the move, the cut is a wave swap), then 29 pulls up from him to the street
  27: fly(71.5, 73.22, [11.98, 1.42, 4.1], [11.98, 1.42, 3.75], [12.1, 1.6, -0.5], [12.1, 1.6, -0.5], 48),
  28: fly(71.5, 73.22, [11.98, 1.42, 4.1], [11.98, 1.42, 3.75], [12.1, 1.6, -0.5], [12.1, 1.6, -0.5], 48),
  29: (t) => { const k = ez(t, 73.4, 76.9), x = walk29(t); return { p: mix3([x + 0.9, 1.45, 4.4], [4.2, 8.0, 11.2], k), l: mix3([x, 1.5, 1.2], [3.2, 0.6, -0.8], k), fov: 50 }; },
};

export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });
export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
/** the golden preset is a straight backlight: lit from behind the lens instead (ep16) */
export const SUN_SHOT: Record<number, { az?: number; el?: number }> = Object.fromEntries(SHOTS.filter((s) => s.light === "golden").map((s) => [s.id, { az: 150, el: s.id === 11 ? 55 : 38 }]));
