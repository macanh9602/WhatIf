// What If ep18 "What If a Tornado Picked You Up". Times in raw voice seconds from public/eps/ep18/words.json; the 1.1x comes after the render.
// One set, `tornado` (sets.ts, set-local metres): the mobile home x -7..7 z -2..2 (floor top y 0.65, front +z; living room x 1..7, couch on the
// back wall, the lamp on the side table at x 5.45), the yard fence z -25, the landing field round (10, -397) = 398 m (1,307 ft) from the home,
// wire fence z -430, gravel road z -436, the Neighbor's porch x 44 z -443, storm clouds over z -110..-200, the doctor's room x 200.
// Walls, roof, doors, sash, couch, lamp, room and the dawn debris are RIG groups posed here (MOVER_AT). Every shot flies a CAM_PATH.
import type { SetId } from "../../sets";
import { RIG } from "../../sets";
import { F, Light, Move, ShotDef, Size, V3 } from "../../shot";
import type { Trans } from "../../story";

export const TOTAL = F(2357 / 30); // voice 77.1 s + 1.5 s silent tail: the last shot holds to the end
const END = 2357 / 30;
const SET: SetId = "tornado";
const S = (id: number, a: number, b: number, size: Size, light: Light, extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set: SET, cam: { cam: "wide" }, size, light, ...extra });
const LOW = { angle: "low" as const }, HIGH = { angle: "high" as const }, TOP = { angle: "top" as const }, CAMC = { card: "cam" as const }, CAPT = { cap: "top" as const };
export const SHOTS: ShotDef[] = [
  S(1, 0, 5.1, "wide", "night", { ...LOW, ...CAMC, haze: [60, 900] }),           // the walls peel off, you rise out of the room
  S(2, 5.1, 9.3, "mid", "lamp"),                                          // on the couch, both hands on the rattling window
  S(3, 9.3, 13.15, "close", "lamp", LOW),                                 // her lamp: big, heavy, ugly
  S(4, 13.15, 16.6, "wide", "night", { ...HIGH, haze: [80, 1100] }),      // the funnel crosses the fields toward one lit home
  S(5, 16.6, 18.5, "mid", "lamp", LOW),                                   // the floor shakes like jelly
  S(6, 18.5, 23.5, "mid", "lamp"),                                        // whip pans: front door, back door, window, the lamp
  S(7, 23.5, 24.95, "close", "lamp"),                                     // the shade comes at you, the bulb pops
  S(8, 24.95, 29.3, "wide", "night", { ...HIGH, ...CAMC, haze: [40, 700] }), // lifted over the yard, the fence, the fields, into the cloud
  S(9, 29.3, 32.05, "wide", "night", { ...CAMC, haze: [4, 70] }),       // inside the cloud: no walls, no floor, no ground
  S(10, 32.05, 35.45, "mid", "night", { ...TOP, card: { flat: 0 }, haze: [20, 300] }), // you wake on your back in the wet grass
  S(11, 35.45, 37.15, "wide", "night", { ...LOW, haze: [20, 260] }),      // sit up: no home anywhere
  S(12, 37.15, 41.35, "wide", "night", { haze: [25, 300] }),              // the fence, the gravel road, the porch light
  S(13, 41.35, 43.1, "mid", "night", { haze: [25, 300] }),                // "You came from where?"
  S(14, 43.1, 45.5, "close", "night", { haze: [25, 300] }),               // the Neighbor looks past you into the dark
  S(15, 45.5, 48.6, "wide", "dawn", { ...HIGH, haze: [80, 1400] }),       // the weather man walks it with the GPS
  S(16, 48.6, 50.85, "close", "dawn", { ...CAPT, haze: [80, 1400] }),     // 1,307 FT on the screen, then the flag
  S(17, 50.85, 53.9, "mid", "dawn", { ...CAPT, haze: [80, 1400] }),       // the survey form: CARRIED 1,307 FT, SURVIVED
  S(18, 53.9, 56.65, "wide", "dawn", { ...HIGH, haze: [80, 1400] }),      // the bare floor in the debris field
  S(19, 56.65, 60.75, "mid", "dawn", { ...LOW, haze: [80, 1400] }),       // glass, boards, metal
  S(20, 60.75, 64.7, "mid", "day"),                                       // the doctor: lifted, not dragged
  S(21, 64.7, 66.95, "close", "day", { ...HIGH, ...CAPT }),               // a cut head and scratched feet
  S(22, 66.95, 70.2, "mid", "lamp"),                                      // match to 06, slowed: the lamp flies at you
  S(23, 70.2, 71.6, "close", "lamp", { ...LOW, ...CAPT }),                                // it was the lamp
  S(24, 71.6, 75.15, "wide", "dawn", { ...HIGH, haze: [80, 1400] }),      // crane up and back off the bare floor
  S(25, 75.15, END, "mid", "dawn", { ...LOW, haze: [80, 1400] }),         // you set the lamp upright and step back
];

/** no lens blur: the lamp, the window, the doors, the GPS, the form, the flag, the debris, the penlight carry the lines */
export const NO_LENS = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 20, 21, 22, 23, 25]; // 8: the flown look point missed the lead, soft for 2 s
export const TRANS: Record<number, Trans> = {
  2: { kind: "dipBlack", dur: 6 }, 4: { kind: "whip", dur: 8 }, 10: { kind: "dipBlack", dur: 6 }, 12: { kind: "whip", dur: 8 },
  15: { kind: "dipWhite", dur: 6 }, 20: { kind: "dipWhite", dur: 6 }, 24: { kind: "dipWhite", dur: 6 },
};
export const XFADE: Record<number, number> = {};
export const FLASH_AT = -99;
export const CAPTION_STOPS: string[] = [];
/** a storm has no white fair-weather clouds: all night and interior shots */
export const NO_SKY_CLOUDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 20, 21, 22, 23];
export const REFRAME: Record<number, number> = {};
export const KICKS: number[] = [F(19.1), F(20.4), F(21.4)]; // the three bangs: front door, back door, the window
export const MOVES: Record<number, Move[]> = {};
export const HOLD: Record<number, number> = Object.fromEntries(SHOTS.map((s) => [s.id, 0]));

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ez = (t: number, a: number, b: number) => { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k); };
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// ---------------- marks (set-local) ----------------
export const FL = 0.65;                         // the home's floor top
export const COUCH: V3 = [4.45, 1.19, -1.45];   // standing on the couch cushions
export const LAMP_AT: V3 = [5.45, 1.26, -1.6];  // the lamp's foot on the side table
export const LAND: V3 = [10, 0.13, -396];       // lying in the field (feet; head toward -z)
export const DOC = 200;
/** 01: you rise out of the room (feet), limp */
export const rise1 = (t: number): V3 => [lerp(4.45, 4.2, ez(t, 0, 5.1)), FL + 0.12 + 5.4 * Math.pow(ez(t, 0.6, 5.1), 1.25), lerp(-0.7, -1.6, ez(t, 0, 5.1))];
/** 08: carried from the home over the yard, the fence, the fields, up into the cloud (feet of the card) */
export const fly8 = (t: number): V3 => { const u = Math.min(1, Math.max(0, (t - 24.95) / (29.3 - 24.95))), e = Math.pow(u, 2.8) * 0.97 + 0.03 * u; // slow over the room and the yard, then away
  return [lerp(4.2, 1.5, e), lerp(7.5, 61, e), lerp(-0.5, -142, e)]; };
export const C9: V3 = [0, 64, -162];
/** 12: over the fence at x 14 (37.15-38.6), then the run down the road toward +x */
export const run12 = (t: number): V3 => t < 38.6
  ? [14, 0.13 + 0.95 * Math.sin(Math.PI * ez(t, 37.3, 38.5)), lerp(-427.4, -432.6, ez(t, 37.3, 38.5))]
  : [lerp(14, 38, (t - 38.6) / (41.35 - 38.6)), 0.13, lerp(-432.6, -436.2, ez(t, 38.6, 39.3))];
export const walk15 = (t: number) => lerp(-393.5, -390.0, (t - 45.5) / 3.1);
/** he reaches the pane on "glass" (59.07), then keeps pace with the words */
export const walk19 = (t: number) => (t < 59.07 ? lerp(-4.0, -2.3, (t - 56.65) / 2.42) : lerp(-2.3, 1.0, (t - 59.07) / 1.68));

// ---------------- camera paths, set-local ----------------
type Path = { p: V3; l: V3; fov: number };
const fly = (a: number, b: number, p0: V3, p1: V3, l0: V3, l1: V3, fov = 46) => (t: number): Path => { const k = ez(t, a, b); return { p: mix3(p0, p1, k), l: mix3(l0, l1, k), fov }; };
const shake = (t: number, k: number): V3 => [k * (0.035 * Math.sin(t * 13) + 0.02 * Math.sin(t * 17)), k * 0.03 * Math.sin(t * 15 + 1), k * 0.02 * Math.sin(t * 11 + 2)];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
// 06: the room as four bangs: front door, back door, the end window, then you and the lamp (shared by 22, the match)
const P6: V3 = [3.7, 1.75, 1.55];
const LOOK6: [number, V3][] = [[18.5, [6.0, 1.75, 2.0]], [19.75, [1.8, 1.7, -2.0]], [20.9, [7.0, 1.95, 0.4]], [21.95, [4.75, 2.3, -1.5]]];
const look6 = (t: number): V3 => { let l = LOOK6[0][1]; for (const [t0, v] of LOOK6.slice(1)) l = mix3(l, v, ez(t, t0, t0 + 0.28)); return l; };
const cam03 = fly(9.3, 13.15, [5.02, 1.35, 1.5], [5.0, 1.38, 1.2], [5.0, 2.25, -1.55], [5.0, 2.27, -1.55], 50);
export const CAM_PATH: Record<number, (t: number) => Path> = {
  1: (t) => { const k = ez(t, 0.3, 5.0), r = rise1(t); return { p: mix3([3.6, 0.5, 8.0], [3.9, 5.6, 5.4], k), l: [lerp(3.9, r[0], 0.6), lerp(2.2, r[1] + 1.1, k), lerp(-0.4, r[2], 0.5)], fov: 50 }; },
  2: fly(5.1, 9.3, [2.35, 1.95, 1.75], [2.55, 1.95, 1.35], [4.3, 2.15, -1.7], [4.35, 2.15, -1.7], 50),
  3: cam03,
  4: (t) => { const k = ez(t, 13.6, 15.9); return { p: mix3([12, 26, 30], [10, 22, 34], ez(t, 13.15, 16.6)), l: mix3([1.5, 0.5, 0], [-22, 34, -170], k), fov: 50 }; },
  5: (t) => { const b = fly(16.6, 18.5, [3.1, 0.95, 1.7], [3.2, 0.95, 1.45], [4.75, 1.95, -1.5], [4.75, 2.0, -1.5], 50)(t), k = 1 + 0.7 * ez(t, 16.8, 17.2);
    return { p: add(b.p, shake(t, k)), l: add(b.l, shake(t + 0.4, k)), fov: 50 }; },
  6: (t) => ({ p: add(P6, shake(t, t > 22 ? 0.5 : 0.8)), l: look6(t), fov: 50 }),
  7: fly(23.5, 24.6, [4.3, 2.68, -0.75], [4.35, 2.66, -0.85], [5.3, 2.05, -1.55], [5.05, 2.1, -1.45], 50),
  8: (t) => { const L = fly8(t), k = ez(t, 25.2, 26.8); return { p: add(L, [0.5, 3.2, 1.4]), l: add(L, mix3([-0.2, -1.0, -0.6], [-0.5, -1.4, -1.4], k)), fov: 52 }; }, // steep first: the roofless room right under him
  9: (t) => { const a = lerp(-0.4, 1.0, ez(t, 29.3, 32.05)); return { p: [C9[0] + 3.6 * Math.sin(a), C9[1] + 1.4, C9[2] + 3.6 * Math.cos(a)], l: [C9[0], C9[1] + 0.9, C9[2]], fov: 50 }; },
  10: fly(32.2, 35.3, [10, 2.1, -396.3], [10.4, 8.5, -391], [10, 0.06, -397.45], [10, 0.1, -396.8], 50),
  11: fly(35.45, 37.15, [12.8, 0.5, -401.6], [12.7, 0.55, -401.4], [10, 0.9, -397.1], [10, 0.92, -397.1], 48),
  12: (t) => { const r = run12(t), k = ez(t, 38.3, 39.0);
    return { p: mix3([17.0, 1.45, -422.5], [r[0] - 2.0, 1.4, -428.5], k), l: mix3([14, 1.2, -430], [r[0] + 1.5, 1.1, -436.4], k), fov: 50 }; },
  13: fly(41.35, 43.1, [44.85, 1.5, -438.9], [44.8, 1.5, -439.3], [44.65, 1.6, -443.4], [44.65, 1.6, -443.4], 46),
  14: fly(43.1, 45.5, [44.15, 1.65, -441.6], [44.08, 1.65, -442.05], [44.0, 1.68, -443.8], [44.0, 1.68, -443.8], 44),
  15: (t) => { const z = walk15(t); return fly(45.5, 48.6, [15.5, 4.2, -402], [17, 10.5, -405], [11, 1.0, z + 1.5], [10.5, 0.5, z + 9], 50)(t); },
  16: fly(48.6, 50.85, [11.14, 1.45, -393.2], [11.12, 1.45, -393.45], [11.12, 1.3, -395.5], [11.12, 1.3, -395.5], 40), // no tilt: the flag stands in frame, the caption stays off his face
  17: fly(50.85, 53.7, [10.8, 1.42, -392.65], [10.78, 1.5, -392.85], [10.75, 1.25, -395.4], [10.75, 1.28, -395.4], 44),
  18: fly(53.9, 56.6, [-12, 15, 16], [-7, 6.5, 10], [2, 0.5, -1], [3, 1.0, -0.5], 50),
  19: (t) => { const x = walk19(t); return { p: [x + 0.3, 1.0, 8.3], l: [x + 0.25, 0.62, 4.5], fov: 48 }; },
  20: fly(60.75, 64.7, [DOC + 0.75, 1.4, 3.5], [DOC + 0.65, 1.4, 3.2], [DOC - 0.15, 1.2, -0.6], [DOC - 0.15, 1.22, -0.6], 44),
  21: fly(64.7, 66.95, [DOC + 1.1, 1.95, 2.65], [DOC + 1.05, 1.93, 2.5], [DOC + 0.25, 1.05, -0.5], [DOC + 0.25, 1.03, -0.5], 44),
  22: (t) => ({ p: add(P6, shake(t, 0.1)), l: mix3([4.75, 2.3, -1.5], [4.75, 2.33, -1.5], ez(t, 66.95, 70.2)), fov: 50 }),
  23: fly(70.2, 71.6, [5.38, 1.6, 0.0], [5.42, 1.62, -0.15], [5.45, 1.9, -1.6], [5.45, 1.9, -1.6], 46),
  24: fly(71.6, 75.0, [5.4, 1.9, 4.6], [13, 15, 21], [3.6, 1.6, -0.3], [2.5, 0.5, -3], 50),
  25: (t) => (t < 77.25 ? fly(75.15, 77.25, [3.42, 1.1, 3.6], [3.42, 1.1, 3.4], [3.42, 1.1, 0.2], [3.42, 1.1, 0.2], 48)(t) : fly(77.25, 78.4, [3.42, 1.1, 3.4], [3.1, 1.15, 2.9], [3.42, 1.1, 0.2], [3.1, 1.35, 0.2], 48)(t)), // the push waits for the caption to clear
};

// ---------------- the moving set (sets.ts RIG) ----------------
type Pose = { vis?: boolean; at?: V3; r?: V3 };
const pose = (n: string, p: Pose = {}) => {
  const g = RIG.get(n); if (!g) return; const b = (g.userData.base ?? { at: [0, 0, 0], ry: 0 }) as { at: V3; ry: number };
  const at = p.at ?? b.at, r = p.r ?? [0, 0, 0];
  g.visible = p.vis !== false; g.position.set(...at); g.rotation.set(r[0], b.ry + r[1], r[2]); g.updateMatrixWorld(true);
};
const base = (n: string) => ((RIG.get(n)?.userData.base ?? { at: [0, 0, 0] }) as { at: V3 }).at;
const NIGHT_HOME = new Set([1, 2, 3, 4, 5, 6, 7, 22, 23]), DAWN_SITE = new Set([15, 18, 19, 24, 25]);
/** lamp state per shot: where its foot is, its tilt (rad, + = top toward -x, you), shade lit or off */
export const lampAt = (id: number, t: number): { at: V3; rz: number; rx: number; lit: boolean; vis: boolean } => {
  const L = LAMP_AT;
  if (id === 5) return { at: L, rz: 0.1 * Math.sin(t * 9) * ez(t, 16.8, 17.1), rx: 0.05 * Math.sin(t * 7), lit: true, vis: true };
  if (id === 6 || id === 22) { const k = id === 6 ? ez(t, 22.0, 23.5) * 0.4 : lerp(0.4, 0.52, ez(t, 66.95, 70.2)); // flung: lifts off the table, top first toward you
    return { at: [lerp(L[0], 4.95, k), L[1] + 0.55 * k, L[2]], rz: 1.1 * k, rx: 0, lit: true, vis: true }; }
  // 07: from your eyes the shade comes at the lens (its centre ends 0.3 m away); the lamp pops on "black"
  if (id === 7) { const k = ez(t, 23.5, 24.25); return { at: [5.41, lerp(1.4, 1.95, k), lerp(-1.55, -1.3, k)], rz: lerp(0.5, 0.9, k), rx: 0, lit: t < 24.26, vis: true }; }
  if (id === 8) return { at: [5.6, FL + 0.28, -0.9], rz: 1.5, rx: 0, lit: false, vis: true }; // the roofless room below you: the lamp on the floor, dark
  if (id === 23) { const u = t - 70.2; return { at: L, rz: 0.16 * Math.exp(-1.6 * u) * Math.sin(u * 5.5), rx: 0, lit: true, vis: true }; }
  if (id === 25) { const k = ez(t, 75.2, 75.9); return { at: [3.1, FL, 0.2], rz: lerp(0.35, 0, k), rx: 0, lit: false, vis: true }; }
  if (DAWN_SITE.has(id)) return { at: [3.6, FL + 0.28, 0.2], rz: 1.5, rx: 0, lit: false, vis: id !== 15 }; // lying on the bare floor
  return { at: L, rz: 0, rx: 0, lit: true, vis: NIGHT_HOME.has(id) };
};
/** 01: roof, front wall, end wall, back wall peel away in that order, flung up and back toward the funnel */
const peel = (n: string, t: number, t0: number, dir: V3, spin: V3) => { const b = base(n), k = ez(t, t0, t0 + 2.6), k2 = k * k;
  pose(n, { at: [b[0] + dir[0] * k2, b[1] + 0.4 * ez(t, t0 - 0.3, t0) + dir[1] * k2, b[2] + dir[2] * k2], r: [spin[0] * k, spin[1] * k, spin[2] * k] }); };
const rig = (id: number, t: number) => {
  const home = NIGHT_HOME.has(id), dawn = DAWN_SITE.has(id);
  for (const n of ["wF", "wB", "wE", "wW", "part", "roof", "doorF", "doorB", "sash", "pane"]) pose(n, { vis: home });
  for (const n of ["room", "couch"]) pose(n, { vis: home || id === 8 }); // 08: the roofless room below you
  if (id === 1) { peel("roof", t, -1.6, [-4, 16, -22], [0.7, 0.3, 0.2]); peel("wF", t, -1.25, [-2, 13, -14], [-1.4, 0.4, 0.3]); // already going at frame 0: you are never behind it
    peel("wE", t, 0.9, [6, 11, -12], [0.5, 0.9, -1.2]);
    peel("wB", t, 1.8, [0, 9, -16], [1.1, 0.2, 0.1]); peel("doorF", t, 0.4, [1, 10, -10], [-2.0, 1.5, 0.6]); peel("pane", t, 0.9, [0, 6, -6], [0, 2, 0]); peel("sash", t, 1.8, [0, 7, -8], [1.5, 0, 0]); }
  if (id === 2 || id === 3) pose("sash", { at: add(base("sash"), [0, 0.05 + 0.02 * Math.sin(t * 12), 0]) });
  if (id === 5) { pose("couch", { at: add(base("couch"), [0.02 * Math.sin(t * 13), 0.03 * (0.5 + 0.5 * Math.sin(t * 11)), 0]) }); pose("sash", { at: add(base("sash"), [0, 0.03 * Math.sin(t * 13), 0]) }); }
  if (id === 6 || id === 22) { // front door off at 19.1, back door at 20.4, the end window bursts at 21.4 (no glass near you)
    const tt = id === 22 ? 23.5 : t, df = ez(tt, 19.05, 19.6), db = ez(tt, 20.35, 20.9);
    pose("doorF", { at: add(base("doorF"), [0.3 * df, 0.3 * df, 4 * df * df]), r: [0, -1.9 * df, 0.3 * df] });
    pose("doorB", { at: add(base("doorB"), [-0.2 * db, 0.25 * db, -4 * db * db]), r: [0, 1.9 * db, -0.3 * db] });
    pose("pane", { vis: tt < 21.38 });
    pose("sash", { at: add(base("sash"), [0, 0.03 * Math.sin(t * 13), 0]) }); }
  if (id === 7) pose("doorF", { vis: false }), pose("doorB", { vis: false }), pose("pane", { vis: false });
  if (id === 22) pose("pane", { vis: false });
  const lp = lampAt(id, t); pose("lamp", { vis: lp.vis, at: lp.at, r: [lp.rx, 0, lp.rz] });
  const g = RIG.get("lamp"); if (g) { const on = g.getObjectByName("shadeOn"), off = g.getObjectByName("shadeOff"), bulb = g.getObjectByName("bulb");
    if (on) on.visible = lp.lit; if (off) { off.visible = !lp.lit; off.rotation.z = dawn ? 0.2 : 0; } if (bulb) bulb.visible = lp.lit; }
  pose("debris", { vis: dawn, at: [0, 0, 0] });
  pose("clouds", { vis: id === 8 || id === 9, at: [0, 0, 0] });
  pose("dusk", { vis: NO_SKY_CLOUDS.includes(id) && id !== 20 && id !== 21, at: [0, 0, 0] });
  const fun: Record<number, V3> = { 1: [-1, 0, -58], 4: [lerp(-46, -36, ez(t, 13.15, 16.6)), 0, lerp(-250, -205, ez(t, 13.15, 16.6))] };
  pose("funnel", { vis: !!fun[id], at: fun[id] ?? [0, 0, 0], r: [0, t * 1.6, 0] });
};
/** read by world.ts each frame: no mover train in this set; the RIG is posed here */
export const MOVER_AT = (id: number, f: number): number | null => { if (RIG.size) rig(id, f / 30); return null; };

export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });
export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [
  [1, 0, "floating", "the hook: lifted out of the room by the wind, unconscious"],
  [8, 0, "floating", "carried through the night air"], [9, 0, "floating", "inside the storm cloud"],
  [12, 0, "floating", "over the wire fence: 1.2 s off the ground while climbing it"],
];
/** dawn lit from behind the lens, a little to the side; the doctor's room from the window side */
export const SUN_SHOT: Record<number, { az?: number; el?: number }> = { 15: { az: 140, el: 14 }, 16: { az: 150, el: 16 }, 17: { az: 150, el: 16 }, 18: { az: 130, el: 18 },
  19: { az: 140, el: 14 }, 20: { az: 135, el: 45 }, 21: { az: 135, el: 45 }, 24: { az: 130, el: 18 }, 25: { az: 145, el: 14 } };
