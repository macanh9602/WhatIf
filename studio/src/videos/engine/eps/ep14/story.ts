// What If ep14 "What If You Invaded Switzerland?". Times in raw voice seconds from public/eps/ep14/words.json; the 1.1x comes after the render.
// Every shot flies a CAM_PATH (set-local). The vertical frame is about .48 x the distance wide at fov 46: keep subjects in it.
// Tanks, hinged walls, bridge sections, boulders are real meshes (sets.ts RIG), posed per frame from MOVER_AT.
import { RIG } from "../../sets";
import type { SetId } from "../../sets";
import { F, M, Light, Move, ShotDef, Size, V3 } from "../../shot";
import type { Trans } from "../../story";

export const TOTAL = F(2458 / 30); // voice + 1.5 s tail
const SET: SetId = "alps";
const S = (id: number, a: number, b: number, size: Size, light: Light, extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set: SET, cam: { cam: "wide" }, size, light, ...extra });
const LOW = { angle: "low" as const }, HIGH = { angle: "high" as const };
export const SHOTS: ShotDef[] = [
  S(1, 0, 2.9, "wide", "day", HIGH),         // crane down from a peak to the column
  S(2, 2.9, 6.6, "wide", "day", LOW),        // low fast push at the blast
  S(3, 6.6, 9.8, "wide", "day", HIGH),       // fly along with the train into the portal
  S(4, 9.8, 11.75, "mid", "dawn", HIGH),     // down onto the map
  S(5, 11.75, 13.75, "wide", "dawn", LOW),   // tread passes the lens, the barrier goes
  S(6, 13.75, 15.45, "mid", "dawn", LOW),    // dolly back head on
  S(7, 15.45, 16.35, "close", "dawn", LOW),  // the cow
  S(8, 16.35, 20.2, "wide", "dawn"),         // push into the one window
  S(9, 20.2, 24.5, "mid", "day", LOW),       // arc round 3 hatches
  S(10, 24.5, 26.6, "wide", "golden", HIGH), // crane rising behind the column
  S(11, 26.6, 27.6, "mid", "golden"),        // side track, village one
  S(12, 27.6, 28.75, "mid", "golden"),       // same framing, village two
  S(13, 28.75, 32.8, "wide", "golden", LOW),  // orbit: the walls hinge down, the barrel slides out
  S(14, 32.8, 34.05, "mid", "golden"),       // push: barn doors
  S(15, 34.05, 35.1, "mid", "golden", LOW),  // the boulder splits
  S(16, 35.1, 36.85, "close", "golden", LOW),// same framing as 7
  S(17, 36.85, 38.2, "mid", "golden"),       // turret whips round
  S(18, 38.2, 39.6, "wide", "golden", HIGH), // high rear 3/4, tracking: reversing in a line
  S(19, 39.6, 42.1, "mid", "golden", LOW),   // low on the deck, dolly back head on
  S(20, 42.1, 44.2, "wide", "golden", HIGH), // 3 blasts, the deck falls
  S(21, 44.2, 48.3, "wide", "golden", { ...LOW, haze: [5, 170] }),  // crane up: the slope comes down
  S(22, 48.3, 51.2, "close", "golden"),      // the window, the smear
  S(23, 51.2, 53.0, "wide", "golden"),       // dolly back: shell + gun
  S(24, 53.0, 60.4, "wide", "night", { ...HIGH, haze: [30, 640] }),  // the year on the door, then up and over the country
  S(25, 60.4, 63.15, "mid", "golden", LOW),  // banker + farmer on crates
  S(26, 63.15, 66.95, "close", "golden"),    // the plunger
  S(27, 66.95, 69.2, "wide", "golden", LOW), // limping to the rubble
  S(28, 69.2, 72.45, "close", "golden"),     // the map tears on "a million" (round 3: was cut at 71.3, the tear landed on "piece")
  S(29, 72.45, 73.2, "wide", "golden", HIGH), // fast crane up and back
  S(30, 73.2, 79.15, "mid", "day"),          // side track on the bridge
  S(31, 79.15, 2458 / 30, "wide", "day", HIGH),   // the flight of 3 again
];

/** no lens blur: the near lead of 21, the night map of 24 (all of it must be sharp) */
export const NO_LENS = [1, 2, 21, 24]; // 1-2: the crane's look point misses the lead, so the hook went soft
export const TRANS: Record<number, Trans> = {
  2: { kind: "whip", dur: 10 },
  4: { kind: "dipBlack", dur: 10 },
  9: { kind: "iris", dur: 10, cx: 0.5, cy: 0.5 },
  14: { kind: "whip", dur: 8 }, 15: { kind: "whip", dur: 8 }, 16: { kind: "whip", dur: 8 },
  21: { kind: "dipWhite", dur: 8 },
  24: { kind: "dipBlack", dur: 12 },
  29: { kind: "zoom", dur: 12, cx: 0.5, cy: 0.5 },
};
export const XFADE: Record<number, number> = {};
export const FLASH_AT = -99;
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
// the words the action lands on
export const BEATS = { blast2: 4.82, crush: 12.9, hinge: 30.03, slide: 31.41, fire: 32.29, barn: 33.25, rock: 34.43, b1: 42.47, b2: 42.81, b3: 43.43, slide21: 45.59, smear: 49.65, plunge: 65.45, tear: 72.0 };
export const KICKS = [F(BEATS.blast2), F(BEATS.fire), F(BEATS.barn), F(BEATS.rock), F(BEATS.b1), F(BEATS.b2), F(BEATS.b3), F(46.09)];
export const MOVES: Record<number, Move[]> = { 20: [M("roll", BEATS.b3, 8, 2)] };
export const HOLD: Record<number, number> = Object.fromEntries(SHOTS.map((s) => [s.id, 0]));

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const ez = (t: number, a: number, b: number) => { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k); };
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
export const RZ = 220, DECK = 14;

/** the lead tank: x, y, z, heading (rad, +pi/2 = nose +x) and turret turn per shot; null = none in this shot */
export type Tk = { x: number; y: number; z: number; ry: number; tur: number };
const E = Math.PI / 2;
const rollX = (x0: number, v: number, t0: number) => (t: number) => x0 + v * (t - t0);
const R1 = rollX(-186, 6, 0), R5 = rollX(-316, 7, 11.75), R6 = rollX(-289, 3.5, 13.75), R10 = rollX(-128, 5, 24.5), R11 = rollX(-128, 4, 26.6), R12 = rollX(-87, 4, 27.6), R18 = rollX(50, -6, 38.2), R19 = rollX(222, 5, 39.6);
export const leadTank = (id: number, t: number): Tk | null => {
  const at = (x: number, y = 0, z = 0, tur = 0): Tk => ({ x, y, z, ry: E, tur });
  switch (id) {
    case 1: return at(R1(t));
    case 2: return { ...at(212, DECK), tur: 0 };
    case 3: return at(62, 0, 232);
    case 4: return at(-372, 0, -5);
    case 5: return at(R5(t));
    case 6: return at(R6(t));
    case 7: return at(-280 + 3.5 * (t - 15.45));
    case 8: return at(-47, 0, 2);
    case 9: return at(-72, 0, 0);
    case 10: return at(R10(t));
    case 11: return at(R11(t));
    case 12: return at(R12(t));
    case 13: return at(-34.5, 0, -1);
    case 17: return { ...at(-34, 0, 3), tur: lerp(0, -2.6, ez(t, 37.1, 37.7)) };
    case 18: return at(R18(t));
    case 19: return at(R19(t), DECK);
    case 20: { const f = fallDeck(t, BEATS.b3); return at(248, DECK + f.dy); }
    case 21: return null;
    default: return null;
  }
};
/** the tanks following the lead: world x, z offsets per shot */
const followers = (id: number): [number, number][] => {
  if (id === 1 || id === 10) return [[-13, 0], [-26, 0], [-39, 0], [-52, 0]];
  if (id === 5 || id === 6) return [[-22, 0], [-40, 0]];
  if (id === 9) return [[-1.5, -4.6], [-1.5, 4.6]];
  if (id === 18) return [[12, 0], [24, 0], [36, 0], [48, 0]];
  if (id === 2) return [[-16, 0]];
  return [];
};

const fallDeck = (t: number, b: number) => { const d = Math.max(0, t - b); return { dy: -0.5 * 15 * d * d, a: d * 0.9 }; };
export const boulder = (i: number, t: number): { x: number; y: number; z: number; s: number; r: number } | null => {
  const h = Math.sin(i * 127.1 + 311.7) * 43758.5453, u = h - Math.floor(h), t0 = BEATS.slide21 - 0.7 + i * 0.13 + u * 0.25, d = (t - t0) / 1.9;
  if (d < 0) return null;
  const k = Math.min(1, d), x = 172 + ((i * 37) % 18) * 2.2, zEnd = -5 + (i % 6), s = 2 + u * 2.4;
  return { x: x + 2.5 * Math.sin(i) + (1 - k) * Math.min(40, 215 - x), y: DECK + s * 0.7 + Math.max(0, (-lerp(-62, zEnd, k) - 8) * 0.773) + (k < 1 ? 2.5 * Math.abs(Math.sin(k * 16 + i)) : 0), z: lerp(-62, zEnd, k), s, r: Math.min(d, 1) * 5 };
};

const put = (n: string, x: number, y: number, z: number, ry = 0, rx = 0, rz = 0, vis = true, s = 1) => {
  const g = RIG.get(n); if (!g) return; g.visible = vis; g.position.set(x, y, z); g.rotation.set(rx, ry, rz); g.scale.setScalar(s); g.updateMatrixWorld(true);
};
const FAR = -9999;
/** chalet walls: front + left fall (right stays: it holds the window of shots 8 and 22). theta 0 = shut */
export const hingeAt = (t: number, delay = 0) => { const k = Math.min(1, Math.max(0, (t - BEATS.hinge - delay) / 0.55)); return k * k * 1.57; };
const rig = (id: number, t: number) => {
  // 24: the night haze grows with the distance, so the land stays a dim navy at any height and the door (close) stays clear
  if (id === 24) { const c = CAM_PATH[24](t), D = Math.hypot(c.p[0] - c.l[0], c.p[1] - c.l[1], c.p[2] - c.l[2]); SHOTS[23].haze = [30, 30 + Math.max(1, D - 30) / Math.max(0.01, 0.72 * ez(D, 8, 100))]; }
  // parked state
  for (let i = 0; i < 5; i++) { put(`tank${i}`, FAR, FAR, 0, 0, 0, 0, false); put(`tur${i}`, 0, 1.75, 0); }
  const openAll = id >= 22 && id <= 23 || (id >= 14 && id <= 18), openT = id === 13 ? hingeAt(t) : openAll ? 1.57 : 0, openS = id === 13 ? hingeAt(t, 0.25) : openAll ? 1.57 : 0;
  put("ch_front", -40, 0, -10, 0, openT); put("ch_left", -44, 0, -13, -E, openS); put("ch_right", -36, 0, -13, E);
  const gun = id === 13 ? Math.min(1, Math.max(0, (t - BEATS.slide) / 0.5)) : openAll ? 1 : 0;
  put("ch_gun", -40, 1.6, lerp(-14.8, -11.4, gun));
  const door = id === 14 ? Math.min(1, Math.max(0, (t - 33.0) / 0.3)) : id === 15 || id === 16 ? 1 : 0;
  put("barn_l", -10.7, 0, -10, -1.8 * door); put("barn_r", -5.3, 0, -10, Math.PI + 1.8 * door);
  const rk = id === 15 ? Math.min(1, Math.max(0, (t - 34.21) / 0.22)) * 0.75 : id === 16 ? 0.75 : 0;
  put("rk_r", 22, 0, -11, 0, 0, -rk); put("rk_l", 22, 0, -11, Math.PI, 0, -rk);
  // bridge: intact, or going on three beats; gone in 21-29
  const gone = id > 20 && id < 30;
  for (let i = 0; i < 3; i++) put(`dk${i}`, 236.6 + i * 13.4, DECK, 0, 0, 0, 0, !gone);
  if (id === 2) { const f = fallDeck(t, BEATS.blast2); put("dk1", 250, DECK + f.dy, 0, 0, f.a * 0.5, f.a, DECK + f.dy > -12); }
  if (id === 20) for (const [i, b, s] of [[2, BEATS.b1, 1], [0, BEATS.b2, -1], [1, BEATS.b3, 1]] as number[][]) { const f = fallDeck(t, b); put(`dk${i}`, 236.6 + i * 13.4 + s * 2.5 * Math.max(0, t - b), DECK + f.dy, 0, 0, f.a * 0.35 * s, -s * f.a, DECK + f.dy > -12); }
  // boulders in 21 only; they stay on the road later only when seen, and no later shot sees it
  for (let i = 0; i < 18; i++) { const r = id === 21 ? boulder(i, t) : null; if (r) put(`bo${i}`, r.x, r.y, r.z, r.r, r.r * 0.6, 0, true, r.s); else put(`bo${i}`, FAR, FAR, 0, 0, 0, 0, false); }
  // the cow on the bridge in 30, the portal per shot
  put("cow_br", id === 30 ? 251.5 - 0.4 * (t - 73.2) : FAR, DECK, -2.2, -E, 0, 0, id === 30); // round 3: the cow walks the other way behind him, they cross mid-shot
  const broken = id >= 27 && id <= 29;
  put("portal", 120, 0, RZ, -E, 0, 0, !broken); put("rubble", 120, 0, RZ, -E, 0, 0, broken);
  // the barrier arm: down when the nose reaches it
  const dn = id === 5 ? ez(t, BEATS.crush - 0.1, BEATS.crush + 0.15) : id === 6 || id === 7 ? 1 : 0;
  put("bar_arm", -300, lerp(1.2, 0.12, dn), -4.5, -E, 0, lerp(0, 0.05, dn), true, 1.2);
  // the column
  const L = leadTank(id, t);
  if (L) {
    put("tank0", L.x, L.y, L.z, L.ry); put("tur0", 0, 1.75, 0, L.tur);
    followers(id).forEach(([dx, dz], i) => { put(`tank${i + 1}`, L.x + dx, L.y, L.z + dz, L.ry); put(`tur${i + 1}`, 0, 1.75, 0, id === 9 ? (i ? 0.3 : -0.3) : L.tur); });
  }
};

/** the rolling train: its car's x; nose = car + 21; it enters the portal at 9.0 s in shot 3, on the same flight in 31 */
const V = 18, car3 = (t: number) => 99 + V * (t - 9.0);
/** 31 runs the last part of the flight of 3 (match cut) */
const u31 = (t: number) => 7.9 + (t - 79.15) * 1.0;
const carX = (id: number, t: number): number | null => id === 3 ? car3(t) : id === 31 ? car3(u31(t)) : null;
export const trainAt = (id: number, t: number) => carX(id, t);
/** read by world.ts each frame: the mover's x, null = hidden; the RIG is posed here too */
export const MOVER_AT = (id: number, f: number): number | null => { if (RIG.size) rig(id, f / 30); return carX(id, f / 30); };

// ---------------- camera paths, set-local ----------------
type Path = { p: V3; l: V3; fov: number };
const fly = (a: number, b: number, p0: V3, p1: V3, l0: V3, l1: V3, fov = 46) => (t: number): Path => { const k = ez(t, a, b); return { p: mix3(p0, p1, k), l: mix3(l0, l1, k), fov }; };
/** the flight of shot 3 at clock u */
const flight = (u: number): Path => { const c = car3(u), k = ez(u, 6.6, 9.4); return { p: [lerp(c - 40, 68, k), lerp(34, 20, k), lerp(292, 262, k)], l: [lerp(c, 112, k), lerp(2, 5, k), RZ], fov: 46 }; };
export const CAM_PATH: Record<number, (t: number) => Path> = {
  // hook (2026-11-08): opens close on you in the turret (ep13 lost 58 % to a wide first frame), then cranes up to show the column
  1: (t) => { const x = R1(t), k = 0.45 * ez(t, 1.1, 2.9); return { p: [lerp(x + 6, x - 70, k), lerp(4.4, 95, k), lerp(8, 120, k)], l: [x, lerp(3.2, 0, k), 0], fov: 46 }; },
  2: (t) => { const k = ez(t, 2.9, 5.2), q = ez(t, 4.95, 5.6); return { p: [lerp(197, 203, k) + 3 * q, lerp(15.6, 16.2, k), lerp(10, 8, k)], l: [lerp(212, 247, q), lerp(16.4, 19, q), 0], fov: 50 }; },
  3: (t) => flight(t),
  4: fly(9.8, 11.75, [-360, 3, 12.2], [-360, 2.5, 11], [-360, 1.2, 7.4], [-360, 1.15, 7.7], 44),
  5: (t) => { const k = ez(t, 12.3, 13.75); return { p: [-292, lerp(0.5, 0.9, k), 5.2], l: [lerp(-305, -302, k), lerp(1.2, 4.0, k), lerp(-1, 0, k)], fov: 54 }; },
  6: (t) => { const x = R6(t), k = ez(t, 13.75, 15.45); return { p: [x + lerp(10.5, 13, k), 2.8, 0.8], l: [x - 0.3, 3.1, 0], fov: 44 }; },
  7: () => ({ p: [-254.6, 0.7, 10], l: [-258, 0.85, 7.2], fov: 44 }),
  8: (t) => { const k = ez(t, 16.8, 19.8); return { p: [lerp(-16, -29.5, k), lerp(4, 2.7, k), lerp(16, -11.3, k)], l: [lerp(-37, -35.8, k), lerp(3.2, 2.45, k), lerp(-12, -13, k)], fov: 48 }; },
  9: (t) => { const a = lerp(-0.5, 0.45, ez(t, 20.2, 24.5)), R = 14; return { p: [-72 + R * Math.cos(a), 3.0, R * Math.sin(a)], l: [-72.5, 3.3, 0], fov: 50 }; },
  10: (t) => { const x = R10(t), k = ez(t, 24.5, 26.6); return { p: [x - 26, lerp(2.2, 13, k), lerp(14, 26, k)], l: [x - 6, lerp(3, 5.5, k), 0], fov: 48 }; },
  11: (t) => ({ p: [R11(t) + 0.5, 4.2, 17], l: [R11(t) - 0.2, 3.0, 0], fov: 42 }),
  12: (t) => ({ p: [R12(t) + 0.5, 4.2, 17], l: [R12(t) - 0.2, 3.0, 0], fov: 42 }),
  13: (t) => { const a = lerp(0.42, 0.02, ez(t, 28.75, 32.2)), R = 23; return { p: [-37 + R * Math.sin(a), 3.2, -8 + R * Math.cos(a)], l: [-36, 3.0, -7], fov: 46 }; },
  14: fly(32.8, 34.05, [-8, 1.8, 11], [-8, 1.6, 7], [-8, 2.1, -10], [-8, 1.7, -10], 50),
  15: fly(34.05, 35.1, [24, 0.8, 1], [23.2, 0.7, -2], [22, 1.6, -11], [22, 1.4, -11], 52),
  16: () => ({ p: [-12.6, 0.7, 10], l: [-16, 0.85, 7.2], fov: 44 }),
  17: () => ({ p: [-30.5, 3.5, 7.8], l: [-34.3, 3.3, 3], fov: 46 }),
  18: (t) => { const x = R18(t), k = ez(t, 38.2, 39.6); return { p: [x - 12, lerp(30, 36, k), 5], l: [x + 4, 0, 0], fov: 46 }; }, // up the frame = the column, off vertical (kit: roof rule)
  19: (t) => { const x = R19(t), k = ez(t, 39.6, 42.1); return { p: [x + lerp(10, 12.5, k), DECK + 1.0, 2.5], l: [x - 0.3, DECK + 2.9, 0], fov: 44 }; },
  20: fly(42.1, 44.2, [250, 22, 72], [250, 27, 78], [250, 13, 0], [250, 11, 0], 48),
  21: fly(44.2, 48.3, [160.5, 14.9, 12.5], [159, 15.2, 13.5], [178, 17.5, -6], [181.3, 19, -6.5], 50),
  22: fly(48.3, 51.2, [-29.8, 2.1, -11.8], [-31.3, 2.0, -12.3], [-35.75, 1.95, -12.9], [-35.75, 1.95, -12.9], 42),
  23: fly(51.2, 53, [-34, 2.5, 5], [-30, 3.2, 16], [-38, 2.6, -11], [-38, 2.8, -10], 46),
  24: (t) => { const a = ez(t, 54.6, 59.5), k = ez(t, 53, 54.8); const s = lerp(-130, 150, (t - 54.6) / 5.8 > 0 ? (t - 54.6) / 5.8 : 0); return { p: [lerp(-60, s, a), lerp(2.0, 460, a), lerp(lerp(-13, -15, k), 235, a)], l: [lerp(-60, s, a), lerp(2, 0, a), lerp(-22, 110, a)], fov: 50 }; },
  25: fly(60.4, 63.15, [37, 0.7, 248.2], [39, 0.8, 247], [39, 1.5, 240], [39, 1.5, 240], 46),
  26: fly(63.15, 66.95, [39.0, 1.15, 246.4], [38.8, 1.05, 245.6], [38.7, 0.7, 243.4], [38.7, 0.65, 243.4], 40),
  27: fly(66.95, 69.2, [86, 0.9, 231], [91, 1.1, 230], [102, 2.8, 221], [105, 2.8, 220], 50),
  28: fly(69.2, 72.45, [104, 1.8, 225], [104.8, 1.7, 224], [106.8, 1.45, 221], [106.8, 1.45, 221], 42),
  29: (t) => { const k = ez(t, 72.45, 73.2); return { p: [lerp(100, 82, k), lerp(1.6, 11, k), lerp(226, 241, k)], l: [lerp(108, 110, k), lerp(3, 4.5, k), lerp(220, 222, k)], fov: 46 }; },
  30: (t) => { const x = 246 + 1.6 * (t - 73.2); return { p: [x + 0.3, DECK + 1.55, 3.0], l: [x + 0.1, DECK + 0.85, -0.5], fov: 46 }; }, // round 3: side track on the deck, a little high: the far parapet, the gorge and the cow behind him, the crate reads
  31: (t) => flight(u31(t)),
};

export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });
export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
/** the golden preset is a straight backlight: lit from behind the lens instead, as in ep13 */
export const SUN_SHOT: Record<number, { az?: number; el?: number }> = Object.fromEntries(SHOTS.filter((s) => s.light === "golden").map((s) => [s.id, s.id === 18 ? { az: 150, el: 40 } : s.id === 21 ? { az: 95, el: 24 } : { az: 150, el: 28 }]));
