// What If ep20 "What If America Never Bought Alaska". Times in raw voice seconds from public/eps/ep20/words.json; the 1.1x comes after the render.
// One set, `alaska` (sets.ts): Sitka shore x 0 (water z > 4, dock z 3.5..14, fort z -10, flagpole x 3 z -6), the gold creek x 60,
// the oil tundra x 120, the map clearing + border x 180, the same border at night x 240. Every shot flies a CAM_PATH (set-local).
import type { SetId } from "../../sets";
import { F, Light, Move, ShotDef, Size, V3 } from "../../shot";
import type { Trans } from "../../story";

export const TOTAL = F(2245 / 30); // voice 73.3 s + 1.5 s silent tail: the last shot holds to the end
const SET: SetId = "alaska";
const S = (id: number, a: number, b: number, size: Size, light: Light, extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set: SET, cam: { cam: "wide" }, size, light, ...extra });
const LOW = { angle: "low" as const }, HIGH = { angle: "high" as const };
export const SHOTS: ShotDef[] = [
  S(1, 0, 2.62, "close", "day", LOW),       // push up and back from the cheque to his face, the harbour behind
  S(2, 2.62, 5.5, "wide", "day", HIGH),     // crane up and back from the water: dock, fort, flag
  S(3, 5.5, 7.91, "close", "day"),          // the figure on the cheque
  S(4, 7.91, 9.51, "mid", "day"),           // truck left past the news stand to the laughing crowd
  S(5, 9.51, 12.8, "mid", "day", LOW),      // dolly in: SEWARD'S ICEBOX + the ice crate
  S(6, 12.8, 15.19, "close", "day"),        // SEWARD'S FOLLY, pull back to him
  S(7, 15.19, 17.05, "close", "day"),       // he tears the cheque
  S(8, 17.05, 20.33, "wide", "day", HIGH),  // crane up behind him: scraps over the harbour, the ship turns away
  S(9, 20.33, 23.88, "mid", "day", LOW),    // fort gate: empty pockets, a cannon with no ball
  S(10, 23.88, 26.76, "wide", "day"),       // through the rail fence: red coats on the far ridge
  S(11, 26.76, 28.78, "mid", "day"),        // NO SALE
  S(12, 28.78, 30.56, "mid", "day", LOW),   // crane up the flagpole
  S(13, 30.56, 32.72, "wide", "day", HIGH), // the creek: orbit past the 1898 sign
  S(14, 32.72, 35.04, "mid", "day", LOW),   // three men pan for gold
  S(15, 35.04, 36.81, "close", "day"),      // the nugget + its little flag
  S(16, 36.81, 38.54, "mid", "day"),        // outside the claim fence
  S(17, 38.54, 40.82, "wide", "dawn", HIGH), // the derrick gusher, crane up and back
  S(18, 40.82, 42.15, "mid", "dawn", LOW),   // track along the pipeline
  S(19, 42.15, 44.15, "mid", "dawn"),        // the barrel board
  S(20, 44.15, 46.07, "mid", "dawn"),        // dolly back: the empty bucket
  S(21, 46.07, 47.36, "wide", "day", LOW),  // crane up the map board
  S(22, 47.36, 49.06, "close", "day"),      // Russia touches Canada
  S(23, 49.06, 52.58, "mid", "day", LOW),   // the border post goes up
  S(24, 52.58, 54.88, "wide", "night", HIGH), // night: tower, searchlight
  S(25, 54.88, 57.11, "mid", "night", LOW),   // tilt up to the planes
  S(26, 57.11, 60.52, "mid", "night"),        // dolly back under the CANADA pennant
  S(27, 60.52, 62.42, "close", "day"),      // Alaska = 2x Texas
  S(28, 62.42, 64.02, "mid", "day"),        // the measuring stick
  S(29, 64.02, 66.68, "mid", "day"),        // the No. 1 ribbon on Texas
  S(30, 66.68, 69.64, "mid", "dawn", LOW),  // crane up to the 49-star flag
  S(31, 69.64, 72.0, "close", "day"),       // he flips the placard
  S(32, 72.0, 2245 / 30, "wide", "dawn", HIGH), // the shore again: the US flag, the cheque
];

/** no lens blur on any shot: the cheque, the placards, the boards and the map carry the facts */
export const NO_LENS = SHOTS.map((s) => s.id);
export const TRANS: Record<number, Trans> = {
  8: { kind: "iris", dur: 10, cx: 0.5, cy: 0.42 }, 13: { kind: "whip", dur: 8 }, 17: { kind: "whip", dur: 8 }, 21: { kind: "whip", dur: 8 },
  23: { kind: "zoom", dur: 10, cx: 0.5, cy: 0.5 }, 24: { kind: "dipBlack", dur: 8 },
};
export const XFADE: Record<number, number> = {};
export const FLASH_AT = -99;
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
/** word beats (raw s) */
export const BEATS = { seven: 5.95, laugh: 8.49, folly: 14.46, tear: 15.79, broke: 20.99, keeps: 27.4, flag: 29.0, gold: 33.52, russian: 35.4, oil: 39.1,
  yours: 45.19, touches: 48.2, post: 50.08, planes: 55.08, texas: 63.1, again: 66.26, stars: 68.54, flip: 70.14 };
export const KICKS: number[] = [F(15.85)];
export const MOVES: Record<number, Move[]> = {};
export const HOLD: Record<number, number> = Object.fromEntries(SHOTS.map((s) => [s.id, 0]));

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ez = (t: number, a: number, b: number) => { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k); };
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/** location x origins (set-local) */
export const B0 = 60, C0 = 120, D0 = 180, E0 = 240;
/** the map card on the board at the clearing: centre, size (m) */
export const MAP = { x: D0, y: 2.75, z: -4.0, w: 6.0, h: 3.7 };

// ---------------- camera paths, set-local ----------------
type Path = { p: V3; l: V3; fov: number };
const fly = (a: number, b: number, p0: V3, p1: V3, l0: V3, l1: V3, fov = 46) => (t: number): Path => { const k = ez(t, a, b); return { p: mix3(p0, p1, k), l: mix3(l0, l1, k), fov }; };
const orbit = (c: V3, r: number, h: number, a0: number, a1: number, t0: number, t1: number, fov = 46) => (t: number): Path => { const a = lerp(a0, a1, ez(t, t0, t1)); return { p: [c[0] + r * Math.sin(a), h, c[2] + r * Math.cos(a)], l: c, fov }; };
const sh = (id: number) => [SHOTS[id - 1].a / 30, SHOTS[id - 1].b / 30];
const f = (id: number, p0: V3, p1: V3, l0: V3, l1: V3, fov = 46) => { const [a, b] = sh(id); return fly(a, b, p0, p1, l0, l1, fov); };
const B = B0, C = C0, D = D0, E = E0;
export const CAM_PATH: Record<number, (t: number) => Path> = {
  1: f(1, [0.2, 0.95, 0.3], [0.3, 1.2, -0.3], [0, 0.85, 2.6], [0, 1.1, 2.6], 50), // cheque + head above the captions
  2: f(2, [2.0, 2.4, 12.5], [4.5, 8.5, 19.5], [0, 1.2, 5.5], [0, 2.4, -3.0], 50),
  3: f(3, [0.05, 1.0, 5.6], [0.03, 0.98, 5.1], [0, 0.98, 2.6], [0, 0.98, 2.6], 44),
  4: f(4, [2.2, 1.35, 8.0], [4.0, 1.35, 7.6], [2.2, 1.1, 0.8], [4.0, 1.15, 0.8], 50),
  5: f(5, [-0.5, 0.8, 6.2], [-0.5, 0.9, 5.2], [-0.5, 1.0, 0.6], [-0.5, 1.05, 0.6], 50),
  6: f(6, [-0.6, 1.15, 2.4], [-0.1, 1.25, 6.4], [-0.6, 1.15, 0.5], [-0.1, 1.1, 0.8], 46), // ends with the FOLLY placard and him both in
  7: f(7, [0, 1.15, 4.6], [0, 1.15, 4.2], [0, 1.1, 2.6], [0, 1.12, 2.6], 50),
  8: f(8, [1.4, 2.2, 1.6], [2.6, 6.5, -3.0], [0, 1.2, 8.0], [0, 1.0, 34], 52),
  9: (t) => { // two-shot, fast push to the purse + his face for the shakes and the coppers, back out for the shrug
    const W: Path = { p: [-4.9, 0.85, -3.2], l: [-5.15, 1.0, -8.0], fov: 56 }, C: Path = { p: [-3.6, 1.05, -5.8], l: [-4.5, 0.9, -8.1], fov: 46 };
    const k = ez(t, 20.33, 20.8) * (1 - ez(t, 21.9, 22.7));
    return { p: mix3(W.p, C.p, k), l: mix3(W.l, C.l, k), fov: lerp(W.fov, C.fov, k) }; },
  10: f(10, [6.8, 1.0, 3.3], [7.3, 1.1, 2.6], [24, 2.6, -11], [24, 2.7, -11.5], 40),
  11: f(11, [0.45, 1.35, 6.4], [0.45, 1.35, 5.6], [0.45, 1.1, 1.5], [0.45, 1.15, 1.5], 46),
  12: f(12, [0.9, 0.7, -0.6], [0.6, 0.35, 0.6], [1.7, 1.3, -3.0], [2.4, 3.4, -5.2], 56), // low dolly back + tilt: he stays in the bottom, the flag on top
  13: orbit([B, 0.8, -0.6], 7.5, 4.6, -0.75, 0.45, 30.56, 32.72, 50),
  14: orbit([B, 0.75, -1.4], 3.5, 0.8, -0.35, 0.25, 32.72, 35.04, 50),
  15: f(15, [B + 0.3, 0.85, 0.55], [B + 0.3, 0.95, 0.2], [B + 0.35, 1.0, -1.4], [B + 0.35, 1.05, -1.4], 44),
  16: f(16, [B + 3.6, 1.05, 5.2], [B + 2.5, 1.05, 5.4], [B + 0.4, 1.0, 1.6], [B + 0.3, 1.0, 1.6], 46),
  17: f(17, [C - 1.0, 1.6, 4.5], [C + 2.0, 6.5, 11.0], [C - 4.0, 3.0, -5.0], [C - 5.0, 6.0, -8.0], 52),
  18: f(18, [C - 3.6, 0.45, 1.6], [C + 0.6, 0.5, 1.6], [C - 1.6, 1.2, -2.0], [C + 2.4, 1.25, -2.2], 50),
  19: f(19, [C + 2.7, 1.9, 4.6], [C + 2.7, 2.1, 3.9], [C + 2.75, 2.3, -1.0], [C + 2.75, 2.3, -1.0], 50),
  20: f(20, [C + 0.9, 1.3, 3.4], [C + 0.9, 1.45, 5.0], [C + 0.9, 1.1, 0.4], [C + 0.9, 1.15, 0.4], 46),
  21: f(21, [D + 0.9, 0.5, 4.6], [D + 0.7, 2.8, 7.0], [D + 0.6, 1.5, -3.0], [D + 0.3, 2.6, -4.0], 54),
  22: f(22, [D - 1.0, 2.0, 2.4], [D - 1.05, 2.05, 2.0], [D - 1.1, 2.45, -4.0], [D - 1.1, 2.5, -4.0], 46), // him whole on the box beside the border
  23: f(23, [D + 4.5, 0.8, 6.0], [D + 4.6, 1.1, 5.2], [D + 4.6, 1.3, -0.8], [D + 4.6, 1.3, -0.8], 54),
  24: f(24, [E + 3.4, 2.2, 6.5], [E + 4.8, 5.5, 10.5], [E + 1.4, 1.6, -1.0], [E + 0.2, 2.4, -3.0], 52),
  25: f(25, [E + 1.6, 0.35, 3.4], [E + 1.6, 0.45, 3.2], [E + 1.5, 0.7, 0.4], [E + 1.0, 7.0, -6.0], 54),
  26: f(26, [E - 1.8, 1.6, 5.4], [E - 1.7, 1.8, 7.0], [E - 2.4, 2.3, 1.6], [E - 2.4, 2.4, 1.6], 48),
  27: f(27, [D - 1.5, 1.7, 3.0], [D - 1.5, 1.75, 2.6], [D - 1.6, 2.2, -4.0], [D - 1.6, 2.2, -4.0], 46),
  28: f(28, [D - 1.1, 1.7, 3.5], [D - 1.1, 1.75, 3.1], [D - 1.1, 2.1, -4.0], [D - 1.1, 2.1, -4.0], 46),
  29: f(29, [D + 1.4, 1.7, 1.4], [D + 0.9, 1.75, 0.5], [D + 0.4, 1.6, -3.6], [D + 0.4, 1.6, -3.6], 46),
  30: fly(66.68, 68.4, [D - 4.3, 0.6, 1.4], [D - 4.4, 0.4, 4.0], [D - 5.0, 1.0, -1.6], [D - 4.87, 2.7, -1.35], 66), // his head above the captions // dolly back + tilt: he stays in, the flag comes in on top
  31: f(31, [0, 1.2, 4.7], [0, 1.2, 4.4], [0, 1.15, 2.6], [0, 1.15, 2.6], 48),
  32: f(32, [2.0, 2.4, 12.5], [4.5, 8.5, 19.5], [0, 1.2, 5.5], [0, 2.4, -3.0], 50),
};

export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });
export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
/** the golden preset is a straight backlight: lit from behind the lens instead (ep16) */
export const SUN_SHOT: Record<number, { az?: number; el?: number }> = Object.fromEntries(SHOTS.filter((s) => s.light === "golden").map((s) => [s.id, { az: 150, el: 30 }]));
