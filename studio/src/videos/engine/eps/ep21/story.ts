// What If ep21 "What If Every Word Cost Money". Times in raw voice seconds from public/eps/ep21/words.json; the 1.1x comes after the render.
// One set, `talkton` (sets.ts): the gate x 0 (arch z -3, Main Street to -z), the market x 60, the stone bridge x 120 (deck top y 1.0),
// Mia's street at night x 180 (porch y 0.6, steps z -2.75..-3.8, door z -5.95). Every shot flies a CAM_PATH (set-local).
import { getInputProps } from "remotion";
import type { SetId } from "../../sets";
import { F, Light, Move, ShotDef, Size, V3 } from "../../shot";
import type { Trans } from "../../story";

export const TOTAL = F(2349 / 30); // voice 73.8 s + a 4.5 s silent tail (padded): the button (meter blinks out, the strip, his face drops) plays in it
const SET: SetId = "talkton";
const S = (id: number, a: number, b: number, size: Size, light: Light, extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set: SET, cam: { cam: "wide" }, size, light, ...extra });
const LOW = { angle: "low" as const }, HIGH = { angle: "high" as const };
export const SHOTS: ShotDef[] = [
  S(1, 0, 3.06, "mid", "day", LOW),        // push in: the PRICES board over his head, the box on his chest
  S(2, 3.06, 6.14, "wide", "day", HIGH),   // crane up and back: off the bus, the arch
  S(3, 6.14, 8.71, "close", "day", LOW),   // the arch board ANY WORD 10c
  S(4, 8.71, 10.41, "close", "day"),       // the box, tilt up to his face
  S(5, 10.41, 13.65, "mid", "day"),        // dolly back head on: he holds the box out
  S(6, 13.65, 16.34, "wide", "day"),       // track down Main Street past a lamp post
  S(7, 16.34, 19.65, "close", "day"),      // the three bills into the pocket
  S(8, 19.65, 22.9, "wide", "day", HIGH),  // the market, crane up and back
  S(9, 22.9, 26.01, "mid", "day"),         // the baker: BREAD, he points
  S(10, 26.01, 27.55, "close", "day"),     // POINTING: FREE
  S(11, 27.55, 29.26, "mid", "day", LOW),  // the bump
  S(12, 29.26, 31.11, "close", "day"),     // the Runner, hand over his mouth
  S(13, 31.11, 33.36, "mid", "day", LOW),  // SORRY $5.00
  S(14, 33.36, 35.55, "mid", "day", LOW),  // track along the stalls
  S(15, 35.55, 39.42, "close", "day"),     // $9.00, pull back
  S(16, 39.42, 41.75, "wide", "day", HIGH), // the bridge, crane up and back
  S(17, 41.75, 44.86, "mid", "day", LOW),   // arc over the parapet (day: golden turned the stone orange)
  S(18, 44.86, 47.1, "close", "day"),       // the box ticks fast
  S(19, 47.1, 48.73, "close", "day"),       // hand over the grille
  S(20, 48.73, 50.24, "mid", "day"),        // finger on the lips
  S(21, 50.24, 53.04, "mid", "night"),  // he walks Mia's street, the porch light ahead, a neighbour in a window
  S(22, 53.04, 55.77, "mid", "night", LOW),    // Grandma waves from the window
  S(23, 55.77, 57.48, "mid", "night", { cap: "top" }),         // WAVING: FREE
  S(24, 57.48, 59.1, "mid", "night", LOW),     // up the steps
  S(25, 59.1, 60.53, "close", "night"),        // the knock
  S(26, 60.53, 62.09, "mid", "night", { cap: "top" }),         // the door opens on Mia
  S(27, 62.09, 64.8, "mid", "night"),          // the bills fly into the LOVE BOX
  S(28, 64.8, 65.81, "close", "night"),        // Pling
  S(29, 65.81, 67.81, "close", "night"),       // PAID IN FULL, pull back
  S(30, 67.81, 69.67, "close", "night"),       // $1.00 = 10 WORDS
  S(31, 69.67, 72.23, "mid", "night", { cap: "top" }),         // over his shoulder to Mia
  S(32, 72.23, 73.8, "mid", "night", { cap: "top" }),          // $0.00 on "love"
  S(33, 73.8, 75.1, "mid", "night", { cap: "top" }),           // $0.00 blinks, dark, beep
  S(34, 75.1, 76.55, "close", "night"),                        // the strip prints big: ...YOUR JACKET.
  S(35, 76.55, 2349 / 30, "mid", "night"),                     // his face drops; Mia pats the red jacket
];

/** no lens blur on any shot: the box, the boards, the LOVE BOX and the strip carry the story */
export const NO_LENS = SHOTS.map((s) => s.id);
export const TRANS: Record<number, Trans> = {
  8: { kind: "whip", dur: 8 }, 16: { kind: "zoom", dur: 10, cx: 0.5, cy: 0.55 }, 21: { kind: "dipBlack", dur: 10 }, 26: { kind: "iris", dur: 10, cx: 0.5, cy: 0.45 },
};
export const XFADE: Record<number, number> = {};
export const FLASH_AT = -99;
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
/** word beats (raw s) */
export const BEATS = { bread: 24.08, point: 25.22, bump: 27.93, empty: 36.85, money: 47.7, quiet: 49.16, waves: 54.07, knock: 59.4, opens: 60.73,
  jumps: 63.31, pling: 64.8, paid: 66.25, left: 68.91, smiles: 69.89, mouth: 71.61, love: 73.33, cut: 73.8, blink: 74.05, dark: 74.65, print: 75.2, drop: 76.85 };
export const KICKS = [F(74.65)]; // no type annotation: temporal_qa reads it with a regex. No shake on the bump (27.93): flicker_qa read its frame jerks as flicker
export const MOVES: Record<number, Move[]> = {};
export const HOLD: Record<number, number> = Object.fromEntries(SHOTS.map((s) => [s.id, 0]));

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ez = (t: number, a: number, b: number) => { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k); };
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/** location x origins (set-local) */
export const B0 = 60, C0 = 120, D0 = 180;
/** the bridge deck top, Grandma's window centre x, the porch floor */
export const DECK = 1.0, G0 = D0 - 9.5, PORCH = 0.6;

// ---------------- camera paths, set-local ----------------
type Path = { p: V3; l: V3; fov: number };
const fly = (a: number, b: number, p0: V3, p1: V3, l0: V3, l1: V3, fov = 46) => (t: number): Path => { const k = ez(t, a, b); return { p: mix3(p0, p1, k), l: mix3(l0, l1, k), fov }; };
const orbit = (c: V3, r: number, h: number, a0: number, a1: number, t0: number, t1: number, fov = 46) => (t: number): Path => { const a = lerp(a0, a1, ez(t, t0, t1)); return { p: [c[0] + r * Math.sin(a), h, c[2] + r * Math.cos(a)], l: c, fov }; };
const sh = (id: number) => [SHOTS[id - 1].a / 30, SHOTS[id - 1].b / 30];
const f = (id: number, p0: V3, p1: V3, l0: V3, l1: V3, fov = 46) => { const [a, b] = sh(id); return fly(a, b, p0, p1, l0, l1, fov); };
const B = B0, C = C0, D = D0, G = G0;
const FLOWN: Record<number, (t: number) => Path> = {
  1: f(1, [0.45, 0.85, 6.0], [0.3, 1.0, 4.85], [0.3, 1.6, 1.4], [0.25, 1.55, 1.4], 50),
  2: (t) => { const k = ez(t, 3.6, 6.1); return { p: mix3([-1.3, 1.4, 9.6], [-2.2, 4.4, 21.5], k), l: mix3([-1.9, 1.2, 4.2], [-2.2, 2.3, -1], k), fov: lerp(50, 54, k) }; }, // off the bus door, crane back: whole bus, the arch
  3: f(3, [0.3, 0.55, 1.0], [0.25, 0.6, 0.4], [0, 2.4, -2.6], [0, 2.6, -2.8], 54),
  4: (t) => { const k = ez(t, 8.75, 9.7); return { p: mix3([0, 1.0, 3.3], [0, 1.25, 3.9], k), l: mix3([0, 0.95, 1.8], [0, 1.3, 1.8], k), fov: 50 }; }, // ends with the whole arch board clear above his head
  5: f(5, [0.55, 1.3, 0.4], [0.65, 1.3, 2.8], [0, 1.2, -2.6], [0, 1.0, -0.4], 48),
  6: f(6, [-4.7, 1.55, -10.4], [-4.7, 1.6, -12.4], [-4.6, 1.3, -24], [-4.6, 1.3, -26], 50),
  7: f(7, [-3.95, 1.15, -15.2], [-3.9, 1.3, -14.3], [-4.0, 1.15, -17], [-4.05, 1.2, -17], 50),
  8: f(8, [B - 4.2, 2.2, 6.5], [B - 2.5, 7.5, 12.5], [B - 5.5, 1.2, 0.5], [B - 3.8, 1.0, -1.5], 50),
  9: f(9, [B - 2.6, 1.45, 4.6], [B - 2.3, 1.45, 4.0], [B + 0.3, 1.45, -1.4], [B + 0.3, 1.45, -1.4], 48),
  10: f(10, [B - 0.15, 1.3, 3.7], [B - 0.15, 1.3, 3.4], [B - 0.15, 1.15, 0.9], [B - 0.15, 1.15, 0.9], 48),
  11: f(11, [B + 1.3, 0.6, 4.8], [B + 2.0, 0.65, 4.8], [B + 2.1, 1.2, 1.0], [B + 2.8, 1.25, 1.0], 48),
  12: f(12, [B + 0.1, 1.35, 5.2], [B + 0.1, 1.38, 4.8], [B + 0.1, 1.1, 0], [B + 0.1, 1.12, 0], 46),
  13: f(13, [B + 1.8, 1.0, 5.2], [B + 1.95, 1.35, 3.3], [B + 2.2, 1.9, 0.6], [B + 2.3, 2.0, 0.6], 50),
  14: f(14, [B + 6.2, 0.55, 3.2], [B + 8.3, 0.55, 3.2], [B + 3.4, 1.1, 0.9], [B + 5.8, 1.1, 0.9], 48),
  15: (t) => { const k = ez(t, 37.2, 39.2); return { p: mix3([B + 6.3, 1.1, 2.6], [B + 6.5, 1.3, 4.0], k), l: mix3([B + 6.3, 1.05, 1.0], [B + 6.3, 1.2, 1.0], k), fov: 48 }; },
  16: f(16, [C + 3.0, 3.3, 4.0], [C + 4.6, 5.4, 6.6], [C - 2.4, 1.2, 0], [C - 1.4, 1.1, 0], 50), // down the deck at 3/4: the lead stays big
  17: (t) => { const k = ez(t, 41.75, 44.86), a = lerp(-0.4, 0.4, k), cx = lerp(C - 0.5, C + 1.1, k); return { p: [cx + 4.2 * Math.sin(a), 2.3, 4.2 * Math.cos(a)], l: [cx, 1.95, 0], fov: 50 }; }, // orbit that travels with him
  18: f(18, [C + 1.2, 2.1, 1.75], [C + 1.2, 2.15, 1.45], [C + 1.2, 2.1, 0.1], [C + 1.2, 2.2, 0.1], 50),
  19: f(19, [C + 1.25, 2.25, 1.75], [C + 1.22, 2.25, 1.6], [C + 1.2, 2.15, 0.1], [C + 1.2, 2.15, 0.1], 50),
  20: f(20, [C + 2.4, 1.95, 3.7], [C + 1.9, 2.0, 2.7], [C + 1.2, 2.15, 0.1], [C + 1.2, 2.2, 0.1], 48),
  21: f(21, [D - 2.0, 1.35, 7.0], [D - 2.3, 1.45, 6.4], [D - 3.3, 1.5, -4.0], [D - 3.3, 1.55, -4.0], 52),
  22: f(22, [G + 3.9, 1.05, 2.6], [G + 3.6, 1.1, 2.7], [G + 1.0, 1.5, -6], [G + 0.9, 1.55, -6], 50),
  23: f(23, [G + 1.6, 1.55, 2.4], [G + 1.5, 1.55, 2.1], [G + 0.4, 1.5, -6], [G + 0.4, 1.5, -6], 50),
  24: f(24, [D + 0.6, 0.7, 0.8], [D + 0.5, 1.1, -0.8], [D, 1.6, -6], [D, 1.8, -6], 50),
  25: f(25, [D + 1.5, 1.85, -4.7], [D + 1.3, 1.85, -4.75], [D - 0.1, 1.75, -5.6], [D - 0.1, 1.75, -5.6], 50),
  26: f(26, [D - 0.15, 1.55, -0.3], [D - 0.1, 1.6, -0.7], [D + 0.15, 1.5, -5.0], [D + 0.15, 1.55, -5.0], 48),
  27: f(27, [D + 0.45, 1.85, 0.6], [D + 0.4, 1.87, 0.3], [D + 0.65, 1.6, -4.2], [D + 0.65, 1.6, -4.2], 70), // 27-29 through the gate gap: the pillars stay at the edge
  28: f(28, [D + 0.3, 1.75, 0.2], [D + 0.32, 1.76, 0.0], [D + 1.0, 1.6, -3.3], [D + 1.0, 1.6, -3.3], 50),
  29: f(29, [D + 0.4, 1.82, 0.3], [D + 0.45, 1.9, 1.0], [D + 0.65, 1.6, -4.0], [D + 0.65, 1.6, -4.0], 70),
  30: f(30, [D + 0.5, 1.6, -1.45], [D + 0.5, 1.62, -1.6], [D + 0.5, 1.5, -3.6], [D + 0.5, 1.52, -3.6], 50),
  31: f(31, [D + 0.45, 1.75, -0.6], [D + 0.45, 1.76, -0.8], [D, 1.7, -4.2], [D, 1.7, -4.2], 48),
  32: f(32, [D + 0.1, 1.6, -0.6], [D + 0.1, 1.6, -0.8], [D + 0.1, 1.55, -4.0], [D + 0.1, 1.55, -4.0], 50),
  33: f(33, [D + 0.1, 1.6, -0.6], [D + 0.2, 1.52, -1.1], [D + 0.1, 1.55, -4.0], [D + 0.2, 1.45, -4.0], 50),
  34: f(34, [D + 0.5, 1.2, -2.75], [D + 0.5, 1.18, -2.85], [D + 0.5, 1.15, -3.62], [D + 0.5, 1.15, -3.62], 50),
  35: f(35, [D + 0.1, 1.55, -0.5], [D + 0.1, 1.55, -0.9], [D + 0.1, 1.5, -4.0], [D + 0.1, 1.5, -4.0], 48),
};
/** temporal_qa only (inputProps { creep: true }): every flight slowed 20x from the gate's measuring window (shot start + 22 frames), so
 *  the gate measures set boil at the real camera positions instead of edges sweeping past under the move. flicker_qa covers real speed. */
const CREEP = !!(getInputProps() as { creep?: boolean }).creep;
export const CAM_PATH: Record<number, (t: number) => Path> = Object.fromEntries(Object.entries(FLOWN).map(([id, path]) => {
  const t0 = (SHOTS[+id - 1].a + 22) / 30; return [id, CREEP ? (t: number) => path(t0 + (t - t0) / 20) : path]; }));

export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });
export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
/** the golden preset is a straight backlight: lit from behind the lens instead (ep16) */
export const SUN_SHOT: Record<number, { az?: number; el?: number }> = { 2: { az: 150, el: 40 } }; // shot 2: sun from behind the lens so the bus side is lit yellow
