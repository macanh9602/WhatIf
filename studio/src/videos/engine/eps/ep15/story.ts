// What If ep15 "What If You Sank Your Own Submarine?". Times in raw voice seconds from public/eps/ep15/words.json; the 1.1x comes after the render.
// One set, `pacific` (sets.ts): open sea round x 0, land x < -330 (jungle yard x -500, dock z 60, domed hall x -450 z -250),
// the sub's cabin x 500 + jail z 4 (lamp / window pool between them), the sea floor x 700. Every shot flies a CAM_PATH (set-local).
// Sub, cutter, fast boats, plane, bales, flood water are RIG meshes posed per frame from MOVER_AT.
import { RIG } from "../../sets";
import type { SetId } from "../../sets";
import { F, M, Light, Move, ShotDef, Size, V3 } from "../../shot";
import type { Trans } from "../../story";

export const TOTAL = F(2495 / 30); // voice + 1.5 s tail
const SET: SetId = "pacific";
const S = (id: number, a: number, b: number, size: Size, light: Light, extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set: SET, cam: { cam: "wide" }, size, light, ...extra });
const LOW = { angle: "low" as const }, HIGH = { angle: "high" as const }, CAMC = { card: "cam" as const };
export const SHOTS: ShotDef[] = [
  S(1, 0, 3.0, "wide", "dawn", { ...HIGH, card: { flat: 0.35 } }), // crane up off him afloat, the hull slides under beside him
  S(2, 3.0, 5.75, "close", "dawn", { ...LOW, ...CAMC }),  // hauled out by the jacket
  S(3, 5.75, 9.25, "wide", "day", HIGH),               // crane down through the palms onto the slip
  S(4, 9.25, 11.7, "mid", "day"),                      // truck along the hull: the patch
  S(5, 11.7, 16.1, "wide", "dawn", LOW),                // skim to the pipe, dolly back and rise
  S(6, 16.1, 20.2, "mid", "lamp", LOW),                   // crawl along the cabin
  S(7, 20.2, 22.45, "close", "lamp"),                     // the gauge falls off
  S(8, 22.45, 26.3, "close", "lamp"),                     // four jackets in the plastic
  S(9, 26.3, 30.5, "mid", "lamp", LOW),                   // the engineer laughs
  S(10, 30.5, 32.4, "wide", "night", HIGH),               // high 3/4: the plane over the wake
  S(11, 32.4, 33.85, "wide", "night", LOW),               // dolly back from the bow, searchlight
  S(12, 33.85, 38.4, "mid", "night"),                     // orbit from the sub's side to the boat's side
  S(13, 38.4, 41.0, "mid", "night", LOW),                 // from the sub's back: the man lands
  S(14, 41.0, 42.9, "close", "lamp", LOW),                // up at the hatch, bangs
  S(15, 42.9, 44.45, "close", "lamp"),                    // the valve
  S(16, 44.45, 47.2, "mid", "lamp"),                      // the water rises, the lamp goes
  S(17, 47.2, 52.4, "wide", "dawn", { ...HIGH, card: { flat: 0.4 } }), // crane out: the circle of boats, four orange dots
  S(18, 52.4, 55.85, "wide", "sea", { ...HIGH, haze: [8, 150] }),       // follow the hull down
  S(19, 55.85, 56.9, "close", "day", LOW),                // the empty bag
  S(20, 56.9, 59.05, "close", "day"),                     // scale, then clipboard
  S(21, 59.05, 61.9, "mid", "day"),                       // arc: the blanket
  S(22, 61.9, 63.15, "wide", "day", HIGH),             // crane up: walking free down the pier
  S(23, 63.15, 65.45, "close", "day"),                 // the jacket on the crate
  S(24, 65.45, 68.05, "mid", "day", LOW),                 // another blanket, the stack
  S(25, 68.05, 72.85, "wide", "day", LOW),                // 2008 on the page, crane up to the dome
  S(26, 72.85, 77.1, "close", "dawn", { ...LOW, ...CAMC }), // same framing as 2: cuffs
  S(27, 77.1, 78.95, "mid", "day"),                       // same arc as 21
  S(28, 78.95, 2495 / 30, "close", "window"),                  // the jumpsuit
];

/** no lens blur: the payoff and fact props (pipe 5, jackets 8, valve 15, the dots 17, the hull 18, bag 19-20, jacket 23, page 25, cuffs 26, jumpsuit 28) */
export const NO_LENS = [5, 8, 15, 17, 18, 19, 20, 23, 25, 26, 28];
export const TRANS: Record<number, Trans> = {
  2: { kind: "whip", dur: 8 }, 3: { kind: "dipBlack", dur: 10 },
  6: { kind: "zoom", dur: 12, cx: 0.5, cy: 0.55 },
  10: { kind: "dipBlack", dur: 10 }, 12: { kind: "whip", dur: 8 }, 16: { kind: "dipBlack", dur: 8 },
  22: { kind: "whip", dur: 8 }, 25: { kind: "zoom", dur: 12, cx: 0.5, cy: 0.5 }, 26: { kind: "dipWhite", dur: 10 },
};
export const XFADE: Record<number, number> = {};
export const FLASH_AT = -99;
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const BEATS = { save: 4.76, slam: 37.84, land: 39.5, bang1: 41.36, bang2: 41.85, bang3: 42.34, valve: 43.7, sea: 44.88, cuff: 75.97, gauge: 21.84, patch: 10.6, close20: 58.05 };
export const KICKS = [F(BEATS.slam), F(BEATS.land), F(BEATS.bang1), F(BEATS.bang2), F(BEATS.bang3), F(BEATS.cuff)];
export const MOVES: Record<number, Move[]> = { 9: [M("roll", 28.3, 20, 3)] };
export const HOLD: Record<number, number> = Object.fromEntries(SHOTS.map((s) => [s.id, 0]));

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ez = (t: number, a: number, b: number) => { const k = Math.min(1, Math.max(0, (t - a) / (b - a))); return k * k * (3 - 2 * k); };
const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const E = Math.PI / 2;
/** sub hull y when afloat: deck (1.35 up the hull) 0.25 under the mean water, only the cockpit and the pipe show */
export const SUB_Y = -1.35, DECK_Y = 4.6, KZ = -200, C = 500;

/** the sub: x, y, z, heading (+pi/2 = nose +x), pitch (+ = nose down), hatch (0 shut, 1 open); null = not in this shot */
export type Pose = { x: number; y: number; z: number; ry: number; rx: number; hatch: number };
export const subX = (id: number, t: number) => id === 5 ? -6 + 1.5 * (t - 11.7) : id === 10 ? 1.5 * (t - 30.5) : id === 12 ? 20 + 2 * (t - 33.85) : id === 13 ? 29 + 2 * (t - 38.4) : 0;
export const subAt = (id: number, t: number): Pose | null => {
  const at = (x: number, y = SUB_Y, rx = 0, hatch = 0, z = 0): Pose => ({ x, y, z, ry: E, rx, hatch });
  switch (id) {
    case 1: { const k = ez(t, 1.4, 3.0); return at(3.5, lerp(-0.55, -4.6, k), lerp(0.08, 0.3, k), 1, -3.5); } // afloat beside him for the first half
    case 3: case 4: return at(-500, 0.75, 0, 1); // on the log slip
    case 5: case 10: case 13: return at(subX(id, t), SUB_Y, 0, id === 5 ? 1 : 0);
    case 12: return at(subX(12, t), SUB_Y, 0, 1 - ez(t, BEATS.slam - 0.25, BEATS.slam));
    case 18: { const k = ez(t, 52.4, 55.85); return at(700, lerp(36, 12, k), lerp(0.35, 0.55, k), 0); }
    default: return null;
  }
};
/** the cutter: x, z, heading; the deck shots park it at (0, -200) nose +x */
const cutterAt = (id: number, t: number): [number, number, number] | null =>
  id === 11 ? [70 - 5 * (t - 32.4), 0, -E] : id === 12 || id === 13 ? [subX(id, t) + 46, -38, -2.2] : id === 17 ? [-8, -42, 0.25] : [19, 20, 21, 24, 27].includes(id) ? [0, KZ, E] : null;
export const cutterX = (t: number) => 70 - 5 * (t - 32.4);
const boatAt = (id: number, t: number): [number, number, number] | null =>
  id === 2 || id === 26 ? [2.4, 30, 0] : id === 12 || id === 13 ? [subX(id, t), 5, E] : id === 17 ? [13, 8, -2.4] : null;

const put = (n: string, x: number, y: number, z: number, ry = 0, rx = 0, rz = 0, vis = true, s = 1) => {
  const g = RIG.get(n); if (!g) return; g.visible = vis; g.position.set(x, y, z); g.rotation.set(rx, ry, rz); g.scale.setScalar(s); g.updateMatrixWorld(true);
};
const FAR = -9999;
const hsh = (i: number) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
/** floating bales of 1 and the sinking ones of 18: x, y, z, yaw */
export const baleAt = (id: number, i: number, t: number): [number, number, number, number] | null => {
  if (id === 1) { const a = i * 0.8 + 0.4, d = 3 + 2.5 * hsh(i); return [3 + Math.cos(a) * d * 1.3, 0.05 + 0.15 * Math.sin(t * 2.4 + i), -1.5 + Math.sin(a) * d * 0.6, i + 0.2 * Math.sin(t + i)]; }
  if (id === 18) { const s = subAt(18, t)!; return [700 - 6 + 12 * hsh(i), s.y + 3 - 4 * hsh(i + 9) - (t - 52.4) * (0.6 + hsh(i + 3)), -5 + 10 * hsh(i + 5), i + t * 0.2]; }
  return null;
};
const rig = (id: number, t: number) => {
  const s = subAt(id, t);
  if (s) { put("sub", s.x, s.y, s.z, s.ry, s.rx); put("sub_hatch", 0, 2.2, 4.2, 0, -1.6 * s.hatch); } else put("sub", FAR, FAR, 0, 0, 0, 0, false);
  const c = cutterAt(id, t);
  if (c) put("cutter", c[0], 0, c[1], c[2]); else put("cutter", FAR, FAR, 0, 0, 0, 0, false);
  const b = boatAt(id, t);
  if (b) put("fboat", b[0], 0.05, b[1], b[2]); else put("fboat", FAR, FAR, 0, 0, 0, 0, false);
  if (id === 17) put("fboat2", -12, 0.05, 10, 2.2); else put("fboat2", FAR, FAR, 0, 0, 0, 0, false);
  if (id === 10) put("plane", -70 + 80 * (t - 30.5), 50, 14, E, 0, 0, true, 1.5); else put("plane", FAR, FAR, 0, 0, 0, 0, false);
  for (let i = 0; i < 8; i++) { const p = baleAt(id, i, t); if (p) put(`bale${i}`, p[0], p[1], p[2], p[3]); else put(`bale${i}`, FAR, FAR, 0, 0, 0, 0, false); }
  const fl = id === 16 ? lerp(0.02, 1.25, ez(t, BEATS.sea, 47.2)) : -1;
  put("flood", 0, fl, 0, 0, 0, 0, id === 16);
};
/** read by world.ts each frame: no mover train in this set; the RIG is posed here */
export const MOVER_AT = (id: number, f: number): number | null => { if (RIG.size) rig(id, f / 30); return null; };

// ---------------- camera paths, set-local ----------------
type Path = { p: V3; l: V3; fov: number };
const fly = (a: number, b: number, p0: V3, p1: V3, l0: V3, l1: V3, fov = 46) => (t: number): Path => { const k = ez(t, a, b); return { p: mix3(p0, p1, k), l: mix3(l0, l1, k), fov }; };
/** the deck: the cutter-frame point (lx, lz) in set-local x, z (cutter at x 0, z -200, nose +x) */
export const DK = (lx: number, lz: number): [number, number] => [lz, KZ - lx];
const arc = (a0: number, a1: number, t0: number, t1: number) => (t: number): Path => { const a = lerp(a0, a1, ez(t, t0, t1)), R = 4.6, cx = -13.2, cz = -202.1; return { p: [cx + R * Math.sin(a), DECK_Y + 1.5, cz + R * Math.cos(a)], l: [cx, DECK_Y + 1.1, cz], fov: 44 }; };
const haul = (t0: number, t1: number) => fly(t0, t1, [-2.6, 0.45, 33.6], [-2.0, 0.6, 32.6], [0.5, 1.0, 30], [0.5, 1.1, 30], 46);
export const CAM_PATH: Record<number, (t: number) => Path> = {
  1: fly(0, 3.0, [-1.4, 2.2, 5.6], [-3.2, 5.5, 8.8], [0.4, 0.2, 0.6], [1.0, -0.2, -0.6], 46),
  2: haul(3.0, 5.75),
  3: fly(5.75, 9.0, [-506, 22, 24], [-503, 3.0, 10], [-499, 4, 0], [-500, 1.6, 0.5], 46),
  4: fly(9.25, 11.7, [-504.6, 1.9, 5.6], [-503.2, 1.9, 5.4], [-501.4, 1.4, 1.9], [-500.9, 1.4, 1.9], 50),
  5: (t) => { const x = subX(5, t), k = ez(t, 11.9, 14.4); return { p: [x - lerp(9, 16, k), lerp(0.7, 9, k), lerp(1.6, 18, k)], l: [x - lerp(5.5, 0, k), lerp(1.3, 0.5, k), 0], fov: 46 }; },
  6: fly(16.1, 20.2, [C - 3.6, 0.85, 1.05], [C - 1.6, 0.85, 1.05], [C + 0.6, 1.05, -0.5], [C + 1.6, 1.0, -0.5], 50),
  7: fly(20.2, 22.45, [C - 3.8, 1.35, 0.3], [C - 3.1, 1.35, 0.3], [C - 3.2, 1.25, -1.3], [C - 2.9, 1.25, -1.3], 44),
  8: fly(22.45, 26.3, [C + 1.6, 1.5, 0.7], [C + 1.75, 1.35, 0.35], [C + 2.0, 0.95, -1.05], [C + 2.0, 0.95, -1.05], 40),
  9: fly(26.3, 30.5, [C - 0.25, 0.55, 1.2], [C, 0.6, 1.15], [C - 0.15, 1.25, -0.5], [C - 0.15, 1.25, -0.5], 64),
  10: (t) => { const x = subX(10, t); return { p: [x - 34, 95, 52], l: [x + 2, 0, 0], fov: 46 }; },
  11: (t) => { const bx = cutterX(t) - 20.5, k = ez(t, 32.4, 33.85); return { p: [bx - lerp(13, 17, k), 1.3, 3.5], l: [bx + 3, lerp(5, 7, k), 0], fov: 48 }; },
  12: (t) => { const x = subX(12, t), a = lerp(-1.35, 1.25, ez(t, 33.85, 38.2)), R = 13; return { p: [x + 2 + R * Math.cos(a), 3.2, 2.5 + R * Math.sin(a)], l: [x + 2, 0.8, 2.5], fov: 46 }; },
  13: (t) => { const x = subX(13, t), k = ez(t, 38.4, 41); return { p: [x - lerp(0.6, 0.1, k), 0.75, -lerp(5.2, 4.6, k)], l: [x + 0.9, 1.05, 2.2], fov: 46 }; }, // low, the sub's far side: he lands big
  14: fly(41.0, 42.9, [C - 0.6, 0.5, 1.0], [C - 0.75, 0.5, 0.85], [C - 1.85, 1.65, -0.15], [C - 1.85, 1.7, -0.15], 58),
  15: fly(42.9, 44.45, [C + 0.55, 1.05, 0.35], [C + 0.75, 0.95, -0.05], [C + 1.0, 0.6, -1.15], [C + 1.0, 0.6, -1.15], 42),
  16: (t) => { const k = ez(t, BEATS.sea, 47.2); return { p: [C - 2.4, lerp(0.75, 1.55, k), 1.05], l: [C + 0.5, lerp(1.0, 1.15, k), -0.4], fov: 50 }; },
  17: fly(47.2, 52.2, [3, 6, 8], [12, 40, 33], [0, 0.4, 0], [-1, 0, -6], 46),
  18: (t) => { const y = subAt(18, t)!.y; return { p: [686, y + 9, 15], l: [700, y - 1, 0], fov: 50 }; },
  19: fly(55.85, 56.9, [-11.6, 6.3, -200.3], [-11.75, 6.25, -200.45], [-13.6, 5.3, -202.2], [-13.6, 5.3, -202.2], 46), // high over the table: the bag below him
  20: (t) => { const k = ez(t, BEATS.close20 - 0.35, BEATS.close20 + 0.1), j = ez(t, 56.9, 57.4); return { p: mix3([-11.9 - 0.25 * j, 5.3, -200.6 - 0.1 * j], [-12.3, 5.6, -200.4], k), l: mix3([-13.0, 5.15, -201.3], [-14.3, 5.6, -201.5], k), fov: 46 }; },
  21: arc(0.55, 0.1, 59.05, 61.9),
  22: fly(61.9, 63.15, [-301, 5, 70], [-303, 12, 74], [-315, 1.4, 60], [-317, 1.2, 60], 46),
  23: fly(63.15, 65.45, [-316.5, 2.5, 63.6], [-317.1, 2.3, 63.0], [-318, 2.05, 61.5], [-318, 2.05, 61.5], 42),
  24: arc(0.5, 0.25, 65.45, 68.05),
  25: fly(68.05, 72.6, [-450, 2.0, -205.6], [-450, 15, -183], [-450, 1.4, -208], [-450, 9, -250], 46),
  26: haul(72.85, 77.1),
  27: arc(0.55, 0.2, 77.1, 78.95),
  28: fly(78.95, 82.4, [C + 0.1, 1.5, 6.1], [C + 0.05, 1.45, 5.35], [C, 1.25, 3.4], [C, 1.25, 3.4], 46),
};

export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });
export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
/** the golden preset is a straight backlight: lit from behind the lens instead, as in ep14 */
export const SUN_SHOT: Record<number, { az?: number; el?: number }> = Object.fromEntries(SHOTS.filter((s) => s.light === "golden").map((s) => [s.id, { az: 150, el: 28 }]));
