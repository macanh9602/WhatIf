// What If ep19 "What If You Dropped a Frozen Turkey in a Fryer". Times in raw voice seconds from public/eps/ep19/words.json; the 1.1x comes after the render.
// One set, `turkey` (sets.ts): your backyard x 0 (pot + burner at z 1.0, fence z -3.2, the Neighbor's house z -8 behind it), the same yard
// after the fire x 50, your street x 140 (house z -4, kerb z 2.85, engine z 6.4), the Neighbor's porch + kitchen window x 240.
// Every shot flies a CAM_PATH (set-local). Over-the-shoulder rows of the shot list are front 3/4 two-shots (cards have no back).
import type { SetId } from "../../sets";
import { F, Light, Move, ShotDef, Size, V3 } from "../../shot";
import type { Trans } from "../../story";

export const TOTAL = F(2379 / 30); // voice 77.8 s + 1.5 s silent tail: the last shot holds to the end
const SET: SetId = "turkey";
const S = (id: number, a: number, b: number, size: Size, light: Light, extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set: SET, cam: { cam: "wide" }, size, light, ...extra });
const LOW = { angle: "low" as const }, HIGH = { angle: "high" as const }, CAMC = { card: "cam" as const };
export const SHOTS: ShotDef[] = [
  S(1, 0, 2.5, "close", "day", LOW),            // push up from the frosted turkey to his face over it
  S(2, 2.5, 4.65, "wide", "day", HIGH),         // crane up and back: pot, fence, table, him at arm's length
  S(3, 4.65, 7.62, "close", "day"),             // push along the bird, he knocks: tok
  S(4, 7.62, 10.95, "mid", "day", LOW),         // from the pot rim: dial + sticker, him above
  S(5, 10.95, 13.35, "mid", "day"),             // through the fence boards, truck right to the Neighbor
  S(6, 13.35, 14.9, "close", "day"),            // "That bird is cold."
  S(7, 14.9, 15.92, "mid", "day"),              // "It's fine." two-shot over the fence
  S(8, 15.92, 18.85, "wide", "day", LOW),       // half orbit: the turkey sinks into the pot
  S(9, 18.85, 19.9, "close", "day", { ...HIGH, ...CAMC }), // the oil bubbles: high 3/4 over the pot, him behind it pulling his mitts back
  S(10, 19.9, 21.38, "close", "day", LOW),      // foam at the lip, slab level
  S(11, 21.38, 23.72, "mid", "day"),            // dolly back head on: the lip is full
  S(12, 23.72, 27.34, "wide", "day"),           // the Neighbor steps back, goes in, locks the door
  S(13, 27.34, 29.74, "close", "day", LOW),     // a drop falls from the lip toward the flame
  S(14, 29.74, 33.1, "close", "day", HIGH),     // crane down the pot side following the stream to the flame
  S(15, 33.1, 33.88, "mid", "day", CAMC),       // Whoomp: from behind his chair, the fireball leaves the pot
  S(16, 33.88, 37.28, "wide", "golden", LOW),      // street: crane back from him (chair up) to the fireball over the garage
  S(17, 37.28, 39.78, "mid", "day"),            // behind a lawn chair
  S(18, 39.78, 41.95, "close", "day", LOW),     // the chair is not
  S(19, 41.95, 44.12, "close", "day"),          // the frost flake melts on the mitt
  S(20, 44.12, 47.4, "close", "day"),           // pull back from the pot sticker
  S(21, 47.4, 51.0, "close", "day"),            // the x1,700
  S(22, 51.0, 54.35, "mid", "day", HIGH),          // replay: the oil pours over the rim on every side into the flame, he points
  S(23, 54.35, 57.82, "wide", "night", LOW),       // dusk, the engine
  S(24, 57.82, 62.66, "mid", "night"),             // the captain's clipboard
  S(25, 62.66, 64.48, "mid", "night"),             // the leaflet hand-off
  S(26, 64.48, 69.14, "close", "night"),           // page one
  S(27, 69.14, 70.86, "wide", "night", LOW),       // dinner at the Neighbor's
  S(28, 70.86, 73.84, "mid", "lamp"),              // through the kitchen window
  S(29, 73.84, 76.12, "mid", "night"),             // the turkey lands on the table
  S(30, 76.12, 2379 / 30, "wide", "night", HIGH),  // yours is still on the roof
];

/** no lens blur on any shot: the lead, the turkey, the sticker, the clipboard and the leaflet carry the lines */
export const NO_LENS = SHOTS.map((s) => s.id);
export const TRANS: Record<number, Trans> = {
  13: { kind: "whip", dur: 8 }, 15: { kind: "iris", dur: 10, cx: 0.5, cy: 0.35 }, 19: { kind: "zoom", dur: 8, cx: 0.5, cy: 0.45 },
  23: { kind: "dipBlack", dur: 6 }, 27: { kind: "whip", dur: 8 },
};
export const XFADE: Record<number, number> = {};
export const FLASH_AT = -99;
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
/** word beats (raw s) */
export const BEATS = { whoomp: 33.19, lower: 16.35, bubbles: 19.27, foams: 20.39, climbs: 22.29, steps: 24.15, locks: 26.35, oilout: 29.95, rim: 30.55, flame: 32.55, chair: 38.98, water: 43.5, steam: 46.4, x1700: 48.72, leaflet: 63.84 };
export const KICKS: number[] = [F(33.19)];
export const MOVES: Record<number, Move[]> = {};
export const HOLD: Record<number, number> = Object.fromEntries(SHOTS.map((s) => [s.id, 0]));

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ez = (t: number, a: number, b: number) => { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k); };
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

export const S0 = 140, P0 = 240; // street and porch x origins (set-local)
export const POT: V3 = [0, 0, 1.0];

// ---------------- camera paths, set-local ----------------
type Path = { p: V3; l: V3; fov: number };
const fly = (a: number, b: number, p0: V3, p1: V3, l0: V3, l1: V3, fov = 46) => (t: number): Path => { const k = ez(t, a, b); return { p: mix3(p0, p1, k), l: mix3(l0, l1, k), fov }; };
const orbit = (c: V3, r: number, h: number, a0: number, a1: number, t0: number, t1: number, fov = 46) => (t: number): Path => { const a = lerp(a0, a1, ez(t, t0, t1)); return { p: [c[0] + r * Math.sin(a), h, c[2] + r * Math.cos(a)], l: c, fov }; };
const sh = (id: number) => [SHOTS[id - 1].a / 30, SHOTS[id - 1].b / 30];
const f = (id: number, p0: V3, p1: V3, l0: V3, l1: V3, fov = 46) => { const [a, b] = sh(id); return fly(a, b, p0, p1, l0, l1, fov); };
export const CAM_PATH: Record<number, (t: number) => Path> = {
  1: f(1, [0.4, 0.55, 4.6], [0.45, 0.9, 4.1], [0.5, 0.95, 2.1], [0.5, 1.25, 2.1], 54),
  2: f(2, [-2.2, 3.0, 6.6], [-0.6, 6.0, 9.8], [0, 1.0, 1.0], [0, 0.8, 0.3], 50),
  3: f(3, [0.15, 1.1, 4.2], [0.35, 1.15, 3.9], [0.45, 1.1, 2.1], [0.45, 1.1, 2.1], 52),
  4: f(4, [-0.3, 0.7, 2.6], [-0.15, 0.8, 2.4], [0, 1.4, 1.0], [0, 1.5, 1.0], 58),
  5: f(5, [1.65, 1.25, -1.6], [2.2, 1.25, -1.6], [2.55, 1.45, -3.9], [3.1, 1.5, -3.9], 46),
  6: f(6, [2.9, 1.55, -1.6], [2.95, 1.58, -2.2], [3.0, 1.6, -3.9], [3.0, 1.62, -3.9], 40),
  7: f(7, [2.0, 1.45, 0.6], [2.05, 1.47, 0.3], [2.2, 1.5, -2.9], [2.3, 1.5, -2.9], 46),
  8: orbit([0, 1.1, 1.0], 3.1, 0.9, -0.55, 0.5, 15.92, 18.85, 50),
  9: f(9, [0.35, 2.6, 3.1], [0.25, 2.35, 2.6], [0, 1.05, 0.7], [0, 1.1, 0.6], 54),
  10: f(10, [0.6, 0.3, 3.6], [0.45, 0.33, 3.2], [0.1, 1.0, 0.6], [0.1, 1.05, 0.6], 54),
  11: f(11, [0.2, 1.2, 4.3], [0.2, 1.3, 6.8], [0.1, 1.0, 1.4], [0.1, 1.0, 1.6], 46),
  12: f(12, [-1.9, 1.3, -1.0], [-0.5, 1.35, -0.8], [3.0, 1.6, -7.0], [3.4, 1.5, -7.2], 50),
  13: f(13, [0.55, 0.25, 4.7], [0.45, 0.27, 4.35], [-0.42, 0.72, 1.4], [-0.42, 0.72, 1.4], 52),
  14: f(14, [0.3, 1.25, 2.9], [-0.35, 0.85, 5.0], [0.0, 0.75, 1.3], [-0.5, 0.7, 1.7], 50),
  15: f(15, [-2.0, 0.6, 4.7], [-2.15, 0.65, 5.2], [-0.25, 1.35, 1.1], [-0.25, 1.5, 1.1], 56),
  16: f(16, [S0 - 4.4, 1.0, 5.4], [S0 - 5.2, 2.6, 15.5], [S0 - 3.2, 1.4, 2.0], [S0 - 6.0, 6.0, -8], 62), // x <= S0-4.2: clear of the engine box
  17: f(17, [0.5, 1.5, 4.5], [0.3, 1.5, 4.2], [-0.9, 1.45, 2.0], [-0.9, 1.5, 2.0], 44),
  18: f(18, [-0.9, 1.0, 4.8], [-0.9, 1.05, 4.4], [-0.9, 1.0, 2.0], [-0.9, 1.0, 2.0], 50),
  19: f(19, [0.0, 1.3, 4.6], [0.0, 1.3, 4.1], [0, 1.35, 2.0], [0, 1.3, 2.0], 46),
  20: f(20, [0.1, 0.75, 2.9], [0.2, 0.95, 4.2], [0.3, 0.8, 1.2], [0.35, 0.95, 1.2], 54),
  21: f(21, [0.2, 0.95, 4.2], [0.2, 0.85, 3.4], [0.35, 0.95, 1.2], [0.35, 0.9, 1.2], 54),
  22: f(22, [0.45, 1.9, 4.3], [0.3, 1.75, 3.8], [-0.45, 0.75, 1.3], [-0.45, 0.75, 1.3], 50),
  23: f(23, [S0 - 0.2, 0.55, 0.6], [S0 + 0.0, 0.7, -0.4], [S0 + 0.8, 1.4, 5.5], [S0 + 1.0, 1.5, 5.5], 62),
  24: f(24, [S0 + 0.1, 1.45, 5.0], [S0 + 0.1, 1.5, 4.6], [S0 + 0.1, 1.4, 1.1], [S0 + 0.1, 1.45, 1.1], 58),
  25: f(25, [S0 + 0.0, 1.4, 4.4], [S0 + 0.0, 1.4, 4.1], [S0 + 0.0, 1.4, 1.1], [S0 + 0.0, 1.4, 1.1], 56),
  26: f(26, [S0 + 0.2, 1.0, 4.2], [S0 + 0.2, 1.2, 4.4], [S0 + 0.2, 0.95, 1.2], [S0 + 0.2, 1.25, 0.2], 48),
  27: f(27, [P0 - 2.8, 1.0, 5.2], [P0 - 2.4, 1.1, 4.8], [P0 - 2.2, 1.7, -3.0], [P0 - 2.0, 1.7, -3.0], 56),
  28: f(28, [P0 + 7.4, 1.5, -3.0], [P0 + 7.5, 1.5, -3.6], [P0 + 7.5, 1.35, -9.0], [P0 + 7.5, 1.35, -9.0], 42),
  29: f(29, [P0 - 1.5, 1.6, 3.4], [P0 - 1.4, 2.6, 3.8], [P0 - 1.55, 1.0, -2.6], [P0 - 1.55, 0.95, -2.6], 62),
  30: f(30, [S0 + 0.5, 1.6, 2.6], [S0 + 0.8, 3.2, 4.6], [S0 + 0.4, 2.4, -4], [S0 + 0.8, 2.0, -6], 50),
};

export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });
export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
/** the golden preset is a straight backlight: lit from behind the lens instead (ep16) */
export const SUN_SHOT: Record<number, { az?: number; el?: number }> = Object.fromEntries(SHOTS.filter((s) => s.light === "golden").map((s) => [s.id, { az: 150, el: 38 }]));
