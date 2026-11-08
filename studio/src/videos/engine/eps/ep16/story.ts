// What If ep16 "What If You Had to Tip for Everything". Times in raw voice seconds from public/eps/ep16/words.json; the 1.1x comes after the render.
// One set, `tips` (sets.ts): shop street x 0 (fronts z -3), apartment steps x -80, cart plaza x 80, park x 160, bus stop x 240,
// elevator x 400 z 0 + bedroom z 4-8.6 (lamp pool between). Every shot flies a CAM_PATH (set-local). The door, the cart screen,
// the bench, the bus-stop roof, the five steps, the wall bed and the cab are RIG groups posed per frame from MOVER_AT.
// SCRIPT shot 17 (0.6 s at the foot of the ramp) is folded into 16; shots 18-30 of the script are ids 17-29 here.
// Round 2: old 24-25 (screens work, cab) cut with their sentences; old 26-29 are 24-27, times shifted by -6.43 s.
import { RIG } from "../../sets";
import type { SetId } from "../../sets";
import { F, M, Light, Move, ShotDef, Size, V3 } from "../../shot";
import type { Trans } from "../../story";

export const TOTAL = F(2303 / 30); // round 2: "And the screens work. In thirteen million taxi rides..." cut (6.43 s); voice padded with 1.5 s of tail (director): the last shot holds to the end
const SET: SetId = "tips";
const S = (id: number, a: number, b: number, size: Size, light: Light, extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set: SET, cam: { cam: "wide" }, size, light, ...extra });
const LOW = { angle: "low" as const }, HIGH = { angle: "high" as const }, CAMC = { card: "cam" as const };
export const SHOTS: ShotDef[] = [
  S(1, 0, 2.14, "close", "day"),                         // push past him onto the door screen
  S(2, 2.14, 4.85, "wide", "day", { ...LOW, ...CAMC }),  // dolly back: tiny before the shop front
  S(3, 4.85, 9.2, "wide", "day", HIGH),                  // crane up the street: screens wake in a wave
  S(4, 9.2, 10.95, "mid", "day"),                        // track with him to the cart, screen near
  S(5, 10.95, 13.6, "close", "day"),                     // arc: taps 20 %, takes the cup
  S(6, 13.6, 16.1, "close", "day", LOW),                 // tilt down from the screen to the sign
  S(7, 16.1, 19.9, "close", "day"),                      // the sign, dead on
  S(8, 19.9, 22.3, "mid", "day", LOW),                   // he laughs, owner smiles
  S(9, 22.3, 25.5, "close", "day"),                      // No tip: the door locks
  S(10, 25.5, 26.8, "wide", "day", HIGH),                // crane down onto the bench
  S(11, 26.8, 28.8, "mid", "day", LOW),                  // the bench tips him into the grass
  S(12, 28.8, 31.15, "wide", "golden", LOW),             // bus stop, the screen pole near
  S(13, 31.15, 32.85, "wide", "golden", HIGH), // from high above: the roof slides away
  S(14, 32.85, 34.95, "mid", "golden"),                  // the Neighbor shakes his head
  S(15, 34.95, 37.9, "close", "golden"),                 // he presses twenty, the roof comes back
  S(16, 37.9, 40.85, "wide", "golden", LOW),             // the steps fold flat
  S(17, 40.85, 44.2, "mid", "lamp", LOW),                // the elevator stops between floors
  S(18, 44.2, 46.8, "close", "lamp"),                    // DECLINED $0.00
  S(19, 46.8, 49.0, "wide", "lamp", LOW),                // the bed folds into the wall
  S(20, 49.0, 50.2, "mid", "lamp"),                      // ON STRIKE
  S(21, 50.2, 52.5, "close", "dawn"),                    // back on the sign, it peels
  S(22, 52.5, 59.1, "wide", "dawn", HIGH),               // the pay stub, crane up over the plaza
  S(23, 59.1, 62.57, "mid", "dawn"),                     // the owner turns the screen to him
  S(24, 62.57, 66.57, "wide", "day", HIGH),              // crane down: he takes the job
  S(25, 66.57, 69.07, "close", "day"),                   // his first pay stub
  S(26, 69.07, 71.67, "mid", "day"),                     // the Teen stares at the buttons (over her shoulder, both read)
  S(27, 71.67, 2303 / 30, "close", "day"),               // "Just press twenty."
];

/** no lens blur: every shot whose screen, sign, stub or card carries the line */
export const NO_LENS = [1, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 25, 26, 27];
export const TRANS: Record<number, Trans> = {
  3: { kind: "whip", dur: 8 }, 10: { kind: "dipWhite", dur: 10 }, 12: { kind: "whip", dur: 8 }, 16: { kind: "dipBlack", dur: 10 },
  17: { kind: "zoom", dur: 12, cx: 0.5, cy: 0.5 }, 20: { kind: "dipBlack", dur: 8 }, 21: { kind: "dipWhite", dur: 10 },
  24: { kind: "dipBlack", dur: 10 },
};
export const XFADE: Record<number, number> = {};
export const FLASH_AT = -99;
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
/** word beats (raw s) */
export const BEATS = { tap5: 11.38, cup: 12.4, notip: 23.1, lock: 24.85, yank: 25.0, tips: 27.4, roof: 31.5, press15: 35.75, back15: 36.1,
  fold: 39.6, stop: 41.42, pay17: 43.6, bed: 47.45, peel: 51.5, turn: 59.6, tap27: 72.97, tap5b: 11.38 };
export const KICKS = [F(BEATS.lock), F(BEATS.stop)]; // round 2: no kick on the bench tip, it smeared the lead (11)
export const MOVES: Record<number, Move[]> = { 8: [M("roll", 20.3, 24, 3)] };
export const HOLD: Record<number, number> = Object.fromEntries(SHOTS.map((s) => [s.id, 0]));

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ez = (t: number, a: number, b: number) => { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k); };
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------------- the rig (set-local) ----------------
export const K = 80, PK = 160, BS = 240, A = -80, E = 400;
/** the cart's screen post: x, y, z, yaw (23: the owner turns it toward him) */
export const cartScreen = (id: number, t: number): [number, number, number, number] => [K + 0.75, 1.2, 0.42, id === 23 ? lerp(-0.9, 0.25, ez(t, BEATS.turn, BEATS.turn + 0.7)) : 0];
/** bench tip angle (rad, forward) */
export const benchTip = (id: number, t: number) => id === 11 ? 0.95 * ez(t, BEATS.tips, BEATS.tips + 0.45) : 0;
/** bus-stop roof offset along +x */
export const roofX = (id: number, t: number) => id === 13 ? 4.6 * ez(t, BEATS.roof, BEATS.roof + 0.7) : id === 14 ? 4.6 : id === 15 ? 4.6 * (1 - ez(t, BEATS.back15, BEATS.back15 + 0.8)) : 0;
/** steps fold 0..1 */
export const fold = (id: number, t: number) => id === 16 ? ez(t, BEATS.fold, BEATS.fold + 0.4) : 0;
export const stepZ = (i: number) => -1.95 - 0.29 * i;
export const rampY = (z: number) => Math.max(0, (-1.6 - z) * 0.625);
/** bed fold 0..1 (1 = up in the wall) */
export const bedUp = (id: number, t: number) => id === 19 ? ez(t, BEATS.bed, BEATS.bed + 0.8) : id === 20 ? 1 : 0;
/** the cab: parked (its shot was cut in round 2) */
export const cabX = (_id: number, _t: number) => -14;

const put = (n: string, x: number, y: number, z: number, ry = 0, rx = 0, rz = 0, vis = true) => {
  const g = RIG.get(n); if (!g) return; g.visible = vis; g.position.set(x, y, z); g.rotation.set(rx, ry, rz); g.updateMatrixWorld(true);
};
const rig = (id: number, t: number) => {
  const yank = id === 9 && t > BEATS.yank ? 0.025 * Math.sin((t - BEATS.yank) * 40) * Math.max(0, 1 - (t - BEATS.yank) / 0.5) : 0;
  put("door", 1.4, 0, -2.88, yank);
  put("cab", cabX(id, t), 0.04, 5.6, Math.PI / 2);
  for (let i = 0; i < 5; i++) { const k = fold(id, t), z = stepZ(i); put(`st${i}`, A, lerp(0.2 * (i + 1), rampY(z), k), z, 0, 0.559 * k); }
  const c = cartScreen(id, t); put("cscreen", c[0], c[1], c[2], c[3]);
  put("pbench", PK, 0.03, 0, 0, benchTip(id, t));
  put("bsroof", BS + roofX(id, t), 2.56, 0);
  put("wbed", E, 0, 4.15, 0, -1.5708 * bedUp(id, t));
};
/** read by world.ts each frame: no mover train in this set; the RIG is posed here */
export const MOVER_AT = (id: number, f: number): number | null => { if (RIG.size) rig(id, f / 30); return null; };

// ---------------- camera paths, set-local ----------------
type Path = { p: V3; l: V3; fov: number };
const fly = (a: number, b: number, p0: V3, p1: V3, l0: V3, l1: V3, fov = 46) => (t: number): Path => { const k = ez(t, a, b); return { p: mix3(p0, p1, k), l: mix3(l0, l1, k), fov }; };
const orbit = (c: V3, r: number, h: number, a0: number, a1: number, t0: number, t1: number, fov = 46) => (t: number): Path => { const a = lerp(a0, a1, ez(t, t0, t1)); return { p: [c[0] + r * Math.sin(a), h, c[2] + r * Math.cos(a)], l: c, fov }; };
export const CAM_PATH: Record<number, (t: number) => Path> = {
  1: fly(0, 2.0, [2.6, 1.55, 0.7], [2.0, 1.45, -0.6], [1.45, 1.35, -2.6], [1.5, 1.33, -2.75], 54),
  2: fly(2.14, 4.8, [1.6, 0.55, 0.6], [0.6, 0.5, 8.5], [1.0, 1.5, -2.6], [0.5, 2.6, -3], 48),
  3: fly(4.85, 9.0, [-2.0, 1.6, 5.5], [-2.5, 5.0, 9.5], [-6.5, 1.0, 2.6], [-9, 0.9, 2.2], 46),
  4: (t) => { const k = ez(t, 9.2, 10.9); return { p: [lerp(82.2, 82.0, k), 1.35, lerp(2.9, 2.5, k)], l: [lerp(78.7, 79.9, k), 1.25, lerp(1.6, 0.9, k)], fov: 50 }; },
  5: orbit([K + 0.1, 1.3, 0.6], 2.6, 1.45, 0.55, 0.2, 10.95, 13.6, 46),
  6: fly(13.6, 15.6, [K + 0.95, 1.05, 1.95], [K + 0.85, 0.85, 1.75], [K + 0.75, 1.32, 0.45], [K + 0.75, 0.8, 0.47], 46),
  7: fly(16.1, 19.9, [K + 0.75, 0.8, 1.42], [K + 0.75, 0.8, 1.22], [K + 0.75, 0.8, 0.47], [K + 0.75, 0.8, 0.47], 40),
  8: fly(19.9, 22.3, [K - 1.0, 0.55, 3.6], [K - 1.3, 0.6, 3.5], [K - 0.2, 1.45, 0.6], [K - 0.6, 1.45, 0.6], 50),
  9: fly(22.3, 25.5, [2.1, 1.45, -0.4], [2.0, 1.42, -0.65], [1.5, 1.33, -2.75], [1.5, 1.33, -2.75], 54),
  10: fly(25.5, 26.8, [PK + 3.2, 6.5, 7.5], [PK + 1.5, 2.1, 3.9], [PK, 0.4, -0.3], [PK + 0.1, 0.65, -0.2], 46),
  11: fly(26.8, 28.8, [PK + 2.5, 0.75, 2.7], [PK + 2.3, 0.75, 2.5], [PK - 0.1, 0.55, 0.3], [PK - 0.1, 0.5, 0.5], 50),
  12: fly(28.8, 31.1, [BS + 5.0, 1.0, 6.2], [BS + 5.3, 1.1, 6.6], [BS + 0.3, 1.4, 0.1], [BS + 0.2, 1.4, 0.1], 50), // round 2: back across the road, the whole shelter reads
  13: fly(31.15, 32.85, [BS + 0.9, 3.3, 4.6], [BS + 1.0, 3.5, 4.9], [BS + 0.5, 1.1, 0.1], [BS + 0.5, 1.1, 0.1], 50), // high front: he fills a third, the roof leaves frame right
  14: fly(32.85, 34.95, [BS + 2.7, 1.5, 4.4], [BS + 2.6, 1.5, 4.2], [BS + 0.6, 1.35, 0.3], [BS + 0.6, 1.35, 0.3], 46),
  15: fly(34.95, 37.6, [BS + 1.0, 1.45, 3.9], [BS + 1.0, 1.42, 3.6], [BS + 1.0, 1.3, 0.6], [BS + 1.0, 1.3, 0.6], 58),
  16: fly(37.9, 40.8, [A + 0.9, 1.0, 3.6], [A + 1.1, 1.1, 4.3], [A, 1.0, -2.2], [A, 0.95, -2.2], 46), // round 2: head on, the stoop reads as steps
  17: (t) => { const up = 0.25 * ez(t, 40.85, BEATS.stop), drop = t > BEATS.stop ? -0.05 * Math.exp(-(t - BEATS.stop) * 6) : 0; return { p: [E + 0.15, 0.95 + up + drop, 2.25], l: [E + 0.25, 1.25 + up + drop, -0.3], fov: 54 }; },
  18: fly(44.2, 46.8, [E + 0.75, 1.2, 6.8], [E + 0.8, 1.15, 6.5], [E + 0.95, 0.95, 4.2], [E + 0.95, 0.95, 4.2], 50),
  19: fly(46.8, 49.0, [E + 1.9, 0.75, 9.3], [E + 0.9, 0.8, 9.6], [E, 1.0, 5.2], [E, 1.1, 5.0], 50),
  20: fly(49.0, 50.2, [E + 0.5, 1.05, 8.4], [E + 0.4, 1.0, 7.9], [E + 0.1, 0.85, 5.0], [E + 0.1, 0.85, 5.0], 46),
  21: fly(50.2, 52.4, [K + 0.75, 0.8, 1.2], [K + 0.8, 0.85, 1.55], [K + 0.75, 0.8, 0.47], [K + 0.75, 0.8, 0.47], 40),
  22: fly(53.4, 58.8, [K - 0.3, 1.8, 1.25], [K + 5, 8.5, 12], [K - 0.25, 1.1, 0.25], [K, 0.8, -1], 46),
  23: fly(59.1, 62.4, [K + 0.6, 1.45, 3.3], [K + 0.55, 1.42, 3.0], [K + 0.25, 1.3, 0.3], [K + 0.25, 1.3, 0.3], 50),
  24: fly(62.57, 66.37, [K + 5, 7, 9], [K + 1.6, 1.75, 3.9], [K, 0.8, 0], [K - 0.3, 1.1, 0.1], 46),
  25: fly(66.57, 69.07, [K + 0.3, 1.45, 1.35], [K + 0.3, 1.42, 1.1], [K + 0.3, 1.38, -0.6], [K + 0.3, 1.38, -0.6], 46), // round 3: framed on the held stub too
  26: fly(69.07, 71.67, [K - 0.05, 1.4, 3.6], [K - 0.05, 1.38, 3.3], [K + 0.2, 1.25, 0.0], [K + 0.2, 1.25, 0.0], 50), // round 2: the Teen near left, the lead centre, the screen right
  27: fly(71.67, 76.37, [K + 0.9, 1.4, 3.0], [K + 0.8, 1.38, 2.6], [K + 0.35, 1.3, 0.3], [K + 0.35, 1.3, 0.3], 50),
};

export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });
export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
/** the golden preset is a straight backlight: lit from behind the lens instead, high enough that the roof shades him (12, 14) */
export const SUN_SHOT: Record<number, { az?: number; el?: number }> = Object.fromEntries(SHOTS.filter((s) => s.light === "golden").map((s) => [s.id, { az: 150, el: s.id === 13 ? 70 : 40 }]));
