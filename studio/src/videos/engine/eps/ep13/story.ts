// What If ep13 "What If the Train Came After You?" (round 2, user notes 2026-11-07: film camera work, a train that really rolls, a
// bigger blast). Times in raw voice seconds from public/eps/ep13/words.json; the 1.1x comes after the render. SCRIPT.md has the sources.
// Every shot flies a CAM_PATH (set-local): crane, dolly, orbit, pan. Focus = the look point: keep it on the subject.
import type { SetId } from "../../sets";
import { F, M, Light, Move, ShotDef, Size, V3 } from "../../shot";
import type { Trans } from "../../story";

export const TOTAL = F(78.8); // the voice ends 79.24 s; almost no tail, the last line runs into the first on replay

const SET: SetId = "west";
const S = (id: number, a: number, b: number, size: Size, light: Light, extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set: SET, cam: { cam: "wide" }, size, light, ...extra });
const LOW = { angle: "low" as const }, HIGH = { angle: "high" as const }, TOP = { angle: "top" as const };
// marks: rails at z -4; yard x -120, wreck x 0, second train stops with its car at x -32, night train car at x 60, depot x 130; badlands z -150
export const SHOTS: ShotDef[] = [
  S(1, 0, 3.0, "wide", "dawn", LOW),        // orbit: rear quarter round to the front of the gallop
  S(2, 3.0, 4.7, "wide", "day", HIGH),      // crane down: the train + posse right behind you
  S(3, 4.7, 6.3, "wide", "day", LOW),       // dolly back, head on: everything charges the lens
  S(4, 6.3, 10.1, "wide", "golden", HIGH),  // crane up from the rail: it runs to the horizon
  S(5, 10.1, 12.0, "wide", "golden"),       // crane down + arc: the old baggage car
  S(6, 12.0, 14.5, "mid", "golden"),        // push: ramp + hay
  S(7, 14.5, 17.4, "mid", "golden"),        // arc round the gang
  S(8, 17.4, 19.4, "mid", "night"),         // slide along the rails: lantern, a far headlamp
  S(9, 19.4, 21.5, "wide", "night", LOW),   // low push: the engine brakes at you
  S(10, 21.5, 24.7, "mid", "night"),        // the plunger, the spark along the wire
  S(11, 24.7, 26.9, "wide", "night", LOW),  // pull + tilt up after the roof
  S(12, 26.9, 28.4, "wide", "night", LOW),  // the safe pops, money
  S(13, 28.4, 30.6, "wide", "dawn", TOP),   // from above: you ride off the rails, the wreck smokes
  S(14, 30.6, 33.9, "wide", "dawn", LOW),   // sweep past: fresh horses
  // 15-17: one framing, the sun climbs: a match across three hours
  S(15, 33.9, 35.5, "mid", "dawn"),
  S(16, 35.5, 36.6, "mid", "golden"),
  S(17, 36.6, 37.8, "mid", "day"),
  S(18, 37.8, 40.8, "wide", "day", LOW),    // crane + arc: you laugh on the ridge, the whole badlands
  S(19, 40.8, 44.5, "wide", "day"),         // pan off the wreck to the second train pulling in
  S(20, 44.5, 48.1, "close", "day", LOW),   // the ramp drops
  S(21, 48.1, 52.0, "wide", "day", LOW),    // pan with the horses off the ramp
  S(22, 52.0, 57.1, "wide", "day", HIGH),   // big crane up: never chasing you, delivering
  S(23, 57.1, 59.8, "wide", "day", LOW),    // slow dolly back, head on: your horses, spent
  S(24, 59.8, 62.3, "mid", "golden"),       // theirs, on hay
  S(25, 62.3, 66.4, "wide", "golden", LOW), // running shot: along the car to the wheels and the stack
  S(26, 66.4, 69.1, "wide", "dawn", TOP),   // from above: they never catch you
  S(27, 69.1, 71.4, "mid", "golden"),       // the wanted poster on the station wall
  S(28, 71.4, 74.4, "wide", "golden"),      // crane down to the platform
  S(29, 74.4, 76.7, "mid", "golden"),       // a ticket, on a train
  S(30, 76.7, 78.8, "mid", "golden"),       // on the hay, beside your horse
];

export const TRANS: Record<number, Trans> = {
  2: { kind: "whip", dur: 10 },
  5: { kind: "dipBlack", dur: 10 },
  6: { kind: "iris", dur: 8, cx: 0.5, cy: 0.42 },
  8: { kind: "dipBlack", dur: 12 },
  11: { kind: "dipWhite", dur: 6 },
  13: { kind: "zoom", dur: 12, cx: 0.5, cy: 0.55 },
  14: { kind: "whip", dur: 10 },
  19: { kind: "whip", dur: 10 },
  26: { kind: "whip", dur: 10 },
};
export const XFADE: Record<number, number> = {};
export const FLASH_AT = -99; // no white flash: shot 2 already opens on a whip
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const BEATS = { roof: 24.86, walls: 25.92, safe: 27.4 }; // the three blasts, on their words
export const KICKS = [F(24.86), F(25.92), F(27.4), F(46.0)]; // the blasts, the ramp hitting the ground
export const MOVES: Record<number, Move[]> = {
  11: [M("roll", 24.86, 8, 3), M("roll", 25.92, 8, -5)],
  12: [M("roll", 27.4, 8, 2)],
};
export const HOLD: Record<number, number> = Object.fromEntries(SHOTS.map((s) => [s.id, 0])); // the paths do all the moving: no creep on top

// ---------------- who runs where (pure functions of time, the camera follows them) ----------------
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ez = (t: number, a: number, b: number) => { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k); };
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
/** a gallop along +x: x at time t for the shots that have one */
export const RUN: Record<number, { x0: number; v: number; t0: number }> = {
  1: { x0: -60, v: 11, t0: 0 }, 2: { x0: -245, v: 12, t0: 3 }, 3: { x0: -222, v: 13, t0: 4.7 }, 13: { x0: 2, v: 9, t0: 28.4 }, 14: { x0: 10, v: 11, t0: 30.6 },
  15: { x0: -30, v: 9, t0: 33.9 }, 16: { x0: -30, v: 9, t0: 35.5 }, 17: { x0: -30, v: 9, t0: 36.6 }, 23: { x0: 33, v: 2.2, t0: 57.1 }, 26: { x0: -60, v: 12, t0: 66.4 },
};
export const runX = (id: number, t: number) => { const r = RUN[id]; return r.x0 + r.v * (t - r.t0); };

/** the rolling train (sets.ts "mover"): its car's x, set-local; a brake = constant deceleration into the stop */
const brake = (stop: number, tStop: number, a: number) => (t: number) => stop - (t < tStop ? 0.5 * a * (tStop - t) ** 2 : 0);
const NIGHT = brake(60, 21.1, 10), SECOND = brake(-32, 43.8, 6);
const carX = (id: number, t: number): number | null => {
  if (id === 2) return runX(2, t) - 20.7;
  if (id === 3) return runX(3, t) - 30;
  if (id === 8 || id === 9 || id === 10) return NIGHT(t);
  if (id === 19 || id === 20 || id === 21 || id === 22) return SECOND(t);
  if (id === 25) return -330 + 19 * (t - 62.3);
  return null;
};
/** read by world.ts: the mover's x this frame, null = hidden */
export const MOVER_AT = (id: number, f: number): number | null => carX(id, f / 30);

// ---------------- camera paths, set-local (story.ts baseCam) ----------------
type Path = { p: V3; l: V3; fov: number };
const fly = (a: number, b: number, p0: V3, p1: V3, l0: V3, l1: V3, fov = 46) => (t: number): Path => { const k = ez(t, a, b); return { p: mix3(p0, p1, k), l: mix3(l0, l1, k), fov }; };
export const CAM_PATH: Record<number, (t: number) => Path> = {
  1: (t) => { const x = runX(1, t), a = lerp(-0.62, 0.5, ez(t, 0, 3)); return { p: [x + 10 * Math.sin(a), 0.8 + 0.5 * ez(t, 0, 3), -150 + 10 * Math.cos(a)], l: [x, 1.9, -150], fov: 46 }; },
  2: (t) => { const x = runX(2, t), k = ez(t, 3, 4.7); return { p: [x - 1.5 * (1 - k), lerp(11, 2.6, k), lerp(25, 18, k)], l: [x, lerp(1, 2.3, k), 0], fov: 46 }; },
  3: (t) => { const x = runX(3, t), k = ez(t, 4.7, 6.3); return { p: [x + lerp(22, 6.5, k), 0.7 + 0.25 * k, 0.9 + 0.5 * Math.sin(t * 2)], l: [x - 2, 2.0, -0.5], fov: 46 }; },
  4: fly(6.3, 10.1, [-339, 0.5, 2.6], [-334, 4.6, 2.4], [-326, 1.2, 0.2], [-324, 1.6, 0.2], 50),
  5: fly(10.1, 12, [-129, 4, 11.5], [-123, 1.7, 11], [-120, 2.2, -4], [-120, 2, -4], 50),
  6: fly(12, 14.5, [-116.6, 1.6, 5.4], [-117.5, 1.3, 3.8], [-119, 1.3, -0.8], [-119, 1.25, -0.8]),
  7: fly(14.5, 17.4, [-123.2, 1.4, 8.4], [-117.6, 1.7, 8.6], [-120, 1.15, 0.8], [-120, 1.15, 0.8]),
  8: fly(17.4, 19.4, [93.8, 1.2, 1.2], [92.4, 1.7, -0.9], [84, 1.5, -1.5], [84, 1.5, -1.0]),
  9: fly(19.4, 21.5, [95, 0.45, 0.4], [91.2, 0.85, -0.8], [83, 2.2, -3], [83, 2, -3], 54),
  10: fly(21.5, 24.7, [54.6, 1.7, 6.6], [56.5, 0.95, 5.2], [56.3, 0.35, 0.4], [56.5, 0.25, 0.4]),
  11: (t) => { const k = ez(t, 24.86, 26.6); return { p: [1 + 1.2 * k, lerp(1.6, 1.0, k), lerp(14.5, 19, k)], l: [0.5, lerp(2.1, 6.4, k), -3], fov: 58 }; },
  12: fly(26.9, 28.4, [2.4, 1.3, 3.9], [1.9, 1.5, 2.9], [1.5, 1.8, -0.2], [1.5, 2.0, -0.2], 52),
  13: (t) => { const x = runX(13, t), k = ez(t, 28.4, 30.6); return { p: [lerp(-1, x - 2, k), lerp(36, 24, k), lerp(11, 2, k)], l: [lerp(1, x, k), 0, lerp(-1, 2 - 3.2 * (t - 28.4), k)], fov: 50 }; },
  14: (t) => { const x = runX(14, t), a = lerp(-0.85, 0.05, ez(t, 30.6, 33.9)); return { p: [x + 9.5 * Math.sin(a), lerp(2.2, 0.9, ez(t, 30.6, 33.9)), -150 + 9.5 * Math.cos(a)], l: [x, 1.9, -150], fov: 48 }; },
  15: (t) => ({ p: [runX(15, t), 1.6, -139.6], l: [runX(15, t), 1.6, -150], fov: 46 }),
  16: (t) => ({ p: [runX(16, t), 1.6, -139.6], l: [runX(16, t), 1.6, -150], fov: 46 }),
  17: (t) => ({ p: [runX(17, t), 1.6, -139.6], l: [runX(17, t), 1.6, -150], fov: 46 }),
  18: fly(37.8, 40.8, [79, 1.0, -150], [65, 8.5, -151], [70, 5.4, -165], [70, 5, -165]),
  19: (t) => { const k = ez(t, 40.9, 43.4); return { p: [-5, lerp(1.2, 2.2, k), 9.5], l: [lerp(-1, -17, k), lerp(2.2, 2.6, k), -4], fov: 50 }; },
  20: fly(44.5, 48.1, [-29.8, 0.6, 4.9], [-30.4, 0.75, 4.1], [-32, 1.8, -2.6], [-32, 1.8, -2.6], 48),
  21: (t) => { const k = ez(t, 48.6, 51.8); return { p: [lerp(-31, -26, k), 0.8, 8.2], l: [lerp(-31.5, -22, k), 1.35, -0.6], fov: 54 }; },
  22: fly(52, 57.1, [-13, 1.4, 16], [-24, 28, 30], [-18, 1.6, 0], [-15, 0, -1], 48),
  23: (t) => { const x = runX(23, t), k = ez(t, 57.1, 59.8); return { p: [x + lerp(15, 8.5, k), 1.0, -168], l: [x - 0.5, 1.8, -168], fov: 46 }; },
  24: fly(59.8, 62.3, [1.2, 1.6, 305], [0.6, 1.4, 303.4], [0.2, 1, 298.8], [0.3, 1, 298.8], 50),
  25: (t) => { const k = ez(t, 62.3, 66.4), c = carX(25, t)!, x = c + lerp(1, 18.5, k); return { p: [x - 1.2, lerp(0.7, 1.0, k), 5.4], l: [x, lerp(1.5, 3.4, k), -4], fov: 58 }; },
  26: (t) => { const x = runX(26, t), k = ez(t, 66.4, 69.1); return { p: [x - 1, lerp(38, 25, k), lerp(-139, -146, k)], l: [x, 0, -150], fov: 50 }; },
  27: fly(69.1, 71.4, [132.2, 1.6, 15], [132.9, 1.55, 13.4], [132.3, 1.3, 20.5], [132.4, 1.2, 20.5]),
  28: fly(71.4, 74.4, [119, 6, 19], [122, 2.5, 15.5], [124, 1.8, -2], [125, 1.2, -2], 50),
  29: fly(74.4, 76.7, [125.5, 1.75, 6.6], [125.3, 1.7, 5.3], [125.2, 1.05, 0.6], [125.2, 1.05, 0.6], 44),
  30: fly(76.7, 78.8, [-1.0, 1.75, 306.8], [0.0, 1.6, 305.6], [-0.2, 0.95, 298.9], [-0.1, 0.95, 298.9], 54),
};

export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });
export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];

/** the golden preset is a straight backlight (az 6): on boxcars it turned every facing wall and the foreground purple */
export const SUN_SHOT: Record<number, { az?: number; el?: number }> = Object.fromEntries(SHOTS.filter((s) => s.light === "golden").map((s) => [s.id, s.id === 24 || s.id === 30 ? { az: 160, el: 42 } : { az: 125, el: 16 }]));
