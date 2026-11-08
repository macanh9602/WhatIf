// What If ep14 acting. The lead rides a real tank mesh: a card standing in the hatch, the turret roof hides his legs. Lead: the one curl,
// plain olive field jacket, no cap, no insignia. The invader has no flag or insignia; the Swiss flag is the only flag.
import { Pen, Outfit, FrontOpts, INK, POSES, fxPuff } from "../../toon";
import type { Prop } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { camAt } from "../../story";
import { Act, Stage, LEAD, q } from "../../act";
import { SHOTS, BEATS, leadTank, trainAt, boulder, RZ, DECK } from "./story";
import words from "./words";

const O = SETS.alps.origin;
const L = ([x, y, z]: V3): V3 => [O[0] + x, y, z];
export const word = (text: string, from = 0) => {
  const hit = words.find((w) => w.start >= from - 0.01 && w.text.replace(/[^A-Za-z0-9'-]/g, "").toLowerCase() === text.toLowerCase());
  if (!hit) throw new Error(`Missing cast beat word: ${text} after ${from}`);
  return hit.start;
};
export const wearAt = (_t: number) => 0;

// ---------------- cast ----------------
const YOU: Outfit = { jacket: "#6f7a45", pants: "#4a4a3a", boots: "#2b2018", hat: null, sprout: true, build: "adult", top: "button", bottom: "cargo", shoe: "boot", skin: "#f6e7da", longSleeves: true };
const YOU_OFF: Outfit = { ...YOU, jacket: "#c63939" }; // off duty, shot 31
const OFF1: Outfit = { jacket: "#5a5f4a", pants: "#3e3f36", boots: "#2b2018", hat: null, build: "stout", top: "button", bottom: "cargo", moustache: "#3a2a20", shoe: "boot", skin: "#e8c4a0", longSleeves: true };
const OFF2: Outfit = { jacket: "#6a6248", pants: "#3e3f36", boots: "#2b2018", hat: null, build: "adult", top: "button", bottom: "cargo", shoe: "boot", skin: "#c99a70", hair: "#2a2020", longSleeves: true };
const BANKER: Outfit = { jacket: "#2f3344", pants: "#2f3344", boots: "#17151c", hat: null, build: "adult", top: "button", bottom: "jeans", acc: ["bowtie"], accCol: "#a82e28", shoe: "flat", skin: "#e8c4a0", hair: "#7a7a80", longSleeves: true };
const FARMER: Outfit = { jacket: "#b8553c", pants: "#3e5a78", boots: "#2b2018", hat: null, build: "stout", top: "button", bottom: "overalls", moustache: "#5a4a3a", shoe: "boot", skin: "#d9a57f", hair: "#5a4a3a" };
const SOLDIER: Outfit = { jacket: "#5f6a58", pants: "#4a5048", boots: "#2b2018", hat: null, build: "adult", top: "button", bottom: "cargo", shoe: "boot", skin: "#e8c4a0", hair: "#3a2a20", longSleeves: true };
export const CAST: [string, Outfit, Partial<FrontOpts>][] = [["You", YOU, { expr: "smile" }], ["Officer", OFF1, { expr: "laugh" }], ["Banker", BANKER, { expr: "smile" }], ["Farmer", FARMER, { expr: "smile" }]];

const sec = (id: number) => [SHOTS[id - 1].a / 30, SHOTS[id - 1].b / 30];
const ease = (x: number) => { const k = clamp01(x); return k * k * (3 - 2 * k); };
/** in the hatch of the shot's lead tank (or an offset one): the card's feet sit below the rim, the roof hides the legs */
const HATCH_Y = 2.72 - 0.75;
const inHatch = (id: number, dx = 0, dz = 0) => (t: number): V3 | null => { const k = leadTank(id, t); return k ? L([k.x + dx - 0.3, k.y + HATCH_Y, k.z + dz]) : null; };
const you = (at: V3, expr: Act["expr"], more: Partial<Act> = {}): Act => ({ i: 0, o: YOU, at: L(at), mode: "stand", expr, ...more });
const hatch = (id: number, expr: Act["expr"], more: Partial<Act> = {}): Act => ({ i: 0, o: YOU, at: [0, 0, 0], path: inHatch(id), mode: "stand", noShadow: true, scale: 1.15, expr, ...more });
const YAWN: Act["reach"] = () => [{ ex: -12, ey: 0.1, hx: 28, hy: -0.32, front: true }, undefined];
const WAVE_ARM = (t: number): FrontOpts["reach"] => [undefined, { ex: 26, ey: -0.2, hx: 30 + 14 * Math.sin(t * 13), hy: -0.63, front: true }];

const ACTS = (id: number): Act[] => {
  const [a] = sec(id);
  switch (id) {
    case 1: return [hatch(id, [[0, "confident"]], { reach: () => POSES.point_right, look: 0.6 })];
    case 2: return [hatch(id, [[0, "smile"], [BEATS.blast2 - LEAD, "jawdrop"]], { look: (t) => (t < BEATS.blast2 ? -0.6 : 0.7), lookY: () => -0.1 })];
    case 3: return [hatch(id, [[0, "smile"]], { reach: () => POSES.point_right })];
    case 4: return [you([-360, 0, 6.8], [[0, "scheming"]], { reach: (t) => [undefined, { ex: 24, ey: 0.32, hx: -8 + 4 * Math.sin(t * 12), hy: 0.55, front: true }], lookY: () => 0.5 })];
    case 5: return [hatch(id, [[0, "confident"]], { reach: () => [undefined, { ex: 24, ey: -0.32, hx: 8, hy: -0.62, front: true }], look: 0.5 })];
    case 6: return [hatch(id, [[0, "squint"]], { reach: () => [{ ex: -18, ey: 0.08, hx: -9, hy: -0.46, front: true }, { ex: 18, ey: 0.08, hx: 9, hy: -0.46, front: true }] })];
    case 7: return [hatch(id, [[0, "bored"]])];
    case 8: return [hatch(id, [[0, "curious"], [word("window", 17) - LEAD, "squint"]], { look: 0.8, head: () => 9 })];
    case 9: {
      return [hatch(id, [[0, "smile"], [word("bankers", 22) - LEAD, "laugh"]], { reach: () => POSES.shrug, tilt: (t) => (t > word("bankers", 22) ? 3 * Math.sin(t * 15) : 0) }),
        { i: 1, o: OFF1, at: [0, 0, 0], path: inHatch(id, -1.5, -4.6), scale: 1.15, noShadow: true, mode: "stand", expr: [[0, "laugh"]], tilt: (t) => 3 * Math.sin(t * 14), reach: () => POSES.hands_on_hips, look: 0.5 },
        { i: 2, o: OFF2, at: [0, 0, 0], path: inHatch(id, -1.5, 4.6), scale: 1.15, noShadow: true, mode: "stand", expr: [[0, "laugh"]], tilt: (t) => 3 * Math.sin(t * 13 + 1), look: -0.5 }]; }
    case 10: return [hatch(id, [[0, "smug"]], { reach: () => POSES.hands_on_hips })];
    case 11: return [hatch(id, [[0, "tired"]], { reach: YAWN, look: 0.3 })];
    case 12: return [hatch(id, [[0, "sigh"]], { reach: () => POSES.cover_mouth, look: 0.3, head: () => -6 })];
    case 13: { const h = word("folds", 29); return [hatch(id, [[0, "tired"], [h - LEAD, "shock"], [word("cannon", 29) - LEAD, "scared"]], { look: -0.7, reach: (t) => (t > h ? POSES.hands_up : POSES.cover_mouth) })]; }
    case 17: return [hatch(id, [[0, "rage"]], { prop: RADIO, reach: (t) => [{ ex: -14, ey: 0.05, hx: 26, hy: -0.42, front: true }, { ex: 26, ey: -0.2, hx: 36 + 20 * Math.sin(t * 16), hy: -0.75, front: true }], tilt: (t) => 3 * Math.sin(t * 9) })];
    case 19: return [hatch(id, [[0, "relief"]], { head: () => -4 })];
    case 21: return [you([164.8, DECK, 8.3], [[0, "dazed"], [word("slope", 45) - LEAD, "scared"]], { look: -0.7, reach: () => POSES.hands_up })];
    case 22: return [you([-34.75, 0.35, -12.4], [[0, "squint"], [BEATS.smear - LEAD, "shook"]], { look: -0.9, reach: (t) => [undefined, { ex: 30, ey: -0.2, hx: 72, hy: -0.78 + 0.18 * ease((t - BEATS.smear) / 0.6), front: true }] })];
    case 23: return [you([-36, 0, -4], [[0, "shook"], [word("paint", 52) - LEAD, "jawdrop"]], { look: -0.5, mode: "stroll", phase: (t) => t * 0.9, path: (t) => L([-36, 0, -4 + 1.8 * (t - a)]) })];
    case 25: return [{ i: 2, o: BANKER, at: L([38.2, 0.92, 240.5]), mode: "sit", noShadow: true, expr: [[0, "smile"]], look: 0.5, prop: "mug", seat: 0.1 },
      { i: 3, o: FARMER, at: L([40, 0.92, 240.5]), mode: "sit", noShadow: true, expr: [[0, "deadpan"], [word("beat", 61) - LEAD, "smile"]], look: -0.5, prop: "foodbox", seat: 0.1 }];
    case 27: return [you([96, 0, 221], [[0, "sad"], [word("tunnel", 68) - LEAD, "shook"]], { mode: "stroll", phase: (t) => t * 0.8, path: (t) => L([98.5 + 1.1 * (t - a), 0.08 * Math.abs(Math.sin(t * 2.5)), 221]), look: 0.8, reach: () => [undefined, { ex: 24, ey: 0.2, hx: 30, hy: 0.25, front: true }] })];
    // round 3: he HOLDS the map by its side edges at the chest (it was a card pasted over him); on "million" it tears in his hands
    case 28: { const k = (t: number) => q(ease((t - BEATS.tear) / 0.35), 8);
      return [you([106.8, 0, 221], [[0, "sad"], [BEATS.tear - LEAD, "cry"]], { lookY: () => 0.35, prop: (t) => heldMap(k(t)), reach: (t) => MAP_HANDS(k(t)) })]; }
    case 29: return [you([106.8, 0, 221], [[0, "dazed"]], { look: 0.8, scale: 1.25, prop: () => heldMap(1), reach: () => MAP_HANDS(1.4) })];
    // round 3: the soldier carries the 2014 crate in both arms, walking (it was a sign floating in front of him)
    case 30: return [{ i: 4, o: SOLDIER, at: [0, 0, 0], mode: "stroll", phase: (t) => t * 1.4, noShadow: true, expr: [[0, "casual"]], look: 0.6, path: (t) => L([246 + 1.6 * (t - a), DECK + 0.1, 0.5]), prop: CRATE, reach: () => [{ ex: -16, ey: 0.32, hx: -10, hy: 0.42, front: true }, { ex: 16, ey: 0.32, hx: 10, hy: 0.42, front: true }] }];
    case 31: return [{ i: 0, o: YOU_OFF, at: [0, 0, 0], mode: "stand", noShadow: true, expr: [[0, "grin"]], reach: WAVE_ARM, card: undefined, path: (t) => { const c = trainAt(31, t); return c === null ? null : L([c, 1.4, RZ + 1.7]); }, scale: 2.2 } as Act];
    default: return [];
  }
};
export const acts = (id: number): Act[] => ACTS(id);

// ---------------- props ----------------
const two = Math.PI * 2;
const seedR = (i: number) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const text = (p: Pen, s: string, x: number, y: number, px: number, col: string, stroke = INK) => {
  const g = p.g; g.save(); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${px}px "Arial Black", Arial, sans-serif`;
  g.lineJoin = "round"; g.lineWidth = px * 0.14; g.strokeStyle = stroke; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); g.restore();
};
const glow = (p: Pen, size: number, stops: [number, string][]) => { const g = p.g, c = size / 2, r = g.createRadialGradient(c, c, 0, c, c, c); for (const [o, col] of stops) r.addColorStop(o, col); g.fillStyle = r; g.fillRect(0, 0, size, size); };
const warm = (a: number): [number, string][] => [[0, `rgba(255,236,170,${a})`], [0.18, `rgba(255,190,90,${a * 0.75})`], [0.45, `rgba(255,130,50,${a * 0.28})`], [1, "rgba(255,110,40,0)"]];
/** the sun's reflection, painted: a four-point star. Sized by the card, so it reads from the wide */
const star = (p: Pen, c: number, R: number, col: string) => { const pts: [number, number][] = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * two - Math.PI / 2, r = i % 4 === 0 ? R : i % 2 === 0 ? R * 0.3 : R * 0.2; pts.push([c + r * Math.cos(a), c + r * Math.sin(a)]); } p.poly(pts, col, 0); };
/** the window's painted shine: live glint in 8; in 22 the star with a wet smear dragged down from the finger. s = smear 0..1 */
const shine = (p: Pen, s: number, pulse: number) => {
  if (s <= 0) { glow(p, 512, [[0, `rgba(255,250,215,${0.85 * pulse})`], [0.3, `rgba(255,240,180,${0.35 * pulse})`], [1, "rgba(255,240,180,0)"]]); }
  star(p, 256, 200 * (s > 0 ? 0.9 : pulse), "#fff7d2");
  p.ell(256, 256, 34, 34, "#ffffff", 0);
  if (s > 0) { const h = 40 + 200 * s; p.stroke([[262, 262], [268, 262 + h * 0.5], [258, 262 + h]], 58, "#f1e6bb"); p.stroke([[262, 262], [268, 262 + h * 0.5], [258, 262 + h]], 34, "#fffbe4"); p.stroke([[244, 280], [240, 280 + h * 0.7]], 16, "#3f4e68"); }
};
const flagCH = (p: Pen) => { p.poly([[6, 6], [250, 6], [250, 250], [6, 250]], "#d52b1e", 6); p.poly([[106, 48], [150, 48], [150, 106], [208, 106], [208, 150], [150, 150], [150, 208], [106, 208], [106, 150], [48, 150], [48, 106], [106, 106]], "#ffffff", 0); };
/** the map: mountains, a route, the red tunnel mark */
const mapArt = (p: Pen, mark: number) => {
  p.poly([[10, 10], [590, 14], [586, 400], [14, 394]], "#efe6cb", 9);
  for (const [x, y, s] of [[120, 250, 90], [240, 200, 120], [380, 230, 100], [500, 270, 70]] as number[][]) p.poly([[x - s, y + s * 0.7], [x, y - s * 0.6], [x + s, y + s * 0.7]], "#a9b98c", 5);
  p.stroke([[40, 350], [160, 330], [260, 290], [300, 200]], 9, "#7a5a35");
  p.ell(300, 190, 36 + 8 * mark, 36 + 8 * mark, "rgba(0,0,0,0)", 9); p.stroke([[276, 166], [324, 214]], 16, "#c02a24"); p.stroke([[324, 166], [276, 214]], 16, "#c02a24");
};
const mapHalf = (p: Pen, side: number) => { const g = p.g; g.save(); g.beginPath(); if (side < 0) { g.moveTo(0, 0); g.lineTo(306, 0); g.lineTo(280, 90); g.lineTo(320, 180); g.lineTo(285, 300); g.lineTo(310, 420); g.lineTo(0, 420); } else { g.moveTo(600, 0); g.lineTo(306, 0); g.lineTo(280, 90); g.lineTo(320, 180); g.lineTo(285, 300); g.lineTo(310, 420); g.lineTo(600, 420); } g.closePath(); g.clip(); mapArt(p, 0); g.restore(); };
const binoc = (p: Pen) => { for (const x of [50, 150]) { p.ell(x, 50, 44, 44, "#2c2a30", 7); p.ell(x, 50, 24, 24, "#6f8aa0", 4); } p.stroke([[90, 50], [110, 50]], 16, INK); };
const radio = (p: Pen) => { p.poly([[30, 40], [130, 40], [130, 210], [30, 210]], "#3c4034", 8); p.ell(80, 90, 30, 30, "#20221e", 5); p.stroke([[110, 40], [122, 2]], 8, INK); };
/** a T-handle plunger on a wood box, the hand on the handle: drawn large, sharp on the focus plane */
const plunger = (p: Pen, down: number, hand = true) => {
  const y = 90 + 90 * down;
  p.stroke([[300, y], [300, 330]], 28, INK); p.stroke([[300, y], [300, 330]], 16, "#c9ccd4");
  p.poly([[110, 320], [490, 320], [510, 590], [90, 590]], "#9a7a4c", 10); p.stroke([[100, 450], [500, 450]], 14, "#6d5230");
  p.stroke([[110, y], [490, y]], 40, INK); p.stroke([[110, y], [490, y]], 26, "#6d5230");
  for (const x of [130, 470]) p.ell(x, 345, 20, 20, "#c9ccd4", 6);
  if (!hand) return; // 25: nobody's hand on it yet (it floated alone between the crates)
  // the banker's hand and cuff, from the upper right
  p.poly([[340, y - 42], [430, y - 42], [640, y - 260], [570, y - 310]], "#2f3344", 9);
  p.poly([[338, y - 50], [428, y - 50], [452, y - 86], [366, y - 92]], "#f4f2ea", 7);
  p.ell(362, y - 8, 64, 42, "#e8c4a0", 8);
  for (const x of [316, 348, 380, 412]) p.stroke([[x, y - 26], [x, y + 16]], 7, INK);
};
/** round 3: the radio in his right hand (screen left) at the mouth, the grip at the bottom of the box (it floated beside him) */
const RADIO: Prop = { k: "radio17", draw: (p, h, u) => { const c = h[0]; if (!c) return; local(p, c, -0.1, 0.2 * u, (g) => { g.translate(-140, -150); radio(p); }); } }; // gripped by its right side: the box sits by the cheek, the face clear
const wire = (p: Pen) => { p.g.fillStyle = "#14121e"; p.g.fillRect(4, 0, 8, 400); };
/** draw fn in local px about card point c (rotated by ang, scaled by s), following the body tilt (p.rot) */
const local = (p: Pen, c: [number, number], ang: number, s: number, fn: (g: CanvasRenderingContext2D) => void) => {
  const g = p.g, [x, y] = p.P(c[0], c[1]), r = p.rot; g.save(); g.translate(x, y); g.rotate(ang + (r ? r[0] : 0)); g.scale(s, s); p.rot = null;
  try { fn(g); } finally { p.rot = r; g.restore(); }
};
const span = (h: [number, number][]) => { const [a, b] = h; return { a, b, d: Math.hypot(b[0] - a[0], b[1] - a[1]), ang: Math.atan2(b[1] - a[1], b[0] - a[0]) }; };
/** the map's fold creases (local px of the 600 x 420 sheet) */
const creases = (p: Pen) => { const g = p.g; g.fillStyle = "rgba(90,70,40,0.10)"; g.fillRect(200, 0, 200, 420); for (const l of [[[200, 6], [200, 414]], [[400, 8], [400, 412]], [[8, 210], [592, 210]]] as [number, number][][]) p.stroke(l, 5, "rgba(90,70,40,0.35)"); };
/** the map held by its side edges: the hands sit at local (30, 120) and (570, 120); k > 0 = torn, the halves swing apart on the hands */
const heldMap = (k: number): Prop => ({ k: `map|${k}`, draw: (p, h) => { if (h.length < 2) return; const { a, b, d, ang } = span(h), s = d / 540;
  if (k <= 0) { local(p, a, ang, s, (g) => { g.translate(-30, -120); mapArt(p, 0); creases(p); }); return; }
  local(p, a, ang + 0.35 * k, s, (g) => { g.translate(-30 - 60 * k, -120); mapHalf(p, -1); creases(p); }); // the torn edges droop, the halves part
  local(p, b, ang - 0.35 * k, s, (g) => { g.translate(-570 + 60 * k, -120); mapHalf(p, 1); creases(p); }); } });
/** both hands on the side edges at the chest, the right one a little lower: the sheet tilts. k > 1 = let down after the tear (29) */
const MAP_HANDS = (k: number): FrontOpts["reach"] => { const lo = k > 1 ? 0.25 : 0; return [{ ex: -20, ey: 0.3 + lo, hx: -20, hy: 0.2 + lo, front: true }, { ex: 20, ey: 0.32 + lo, hx: 20, hy: 0.28 + lo, front: true }]; };
/** the 2014 crate carried in both arms: the hands grip its sides at local (30, 150) and (470, 150) */
const CRATE: Prop = { k: "crate2014", draw: (p, h) => { if (h.length < 2) return; const { a, d, ang } = span(h);
  local(p, a, ang, d / 440, (g) => { g.translate(-30, -150);
    p.poly([[30, 0], [470, 0], [440, -56], [60, -56]], "#c19a62", 8); p.poly([[30, 0], [470, 0], [470, 290], [30, 290]], "#9a7a4c", 9);
    for (const y of [72, 218]) p.stroke([[34, y], [466, y]], 6, "#6d5230");
    text(p, "2014", 250, 146, 150, "#1f1810", "#d8c39a"); void g; }); } };
const door1940 = (p: Pen) => { p.poly([[10, 10], [490, 10], [490, 690], [10, 690]], "#6d6c68", 10); for (const y of [180, 520]) p.stroke([[20, y], [480, y]], 10, INK); p.ell(440, 350, 18, 18, "#c9ccd4", 6); text(p, "1940", 250, 340, 120, "#e9e4d0", "#3a3a38"); };
/** a demolition point: a thick red stroke with a hard core, big enough not to boil from 200 m */
const point = (p: Pen) => glow(p, 256, [[0, "rgba(255,250,235,1)"], [0.5, "rgba(255,245,225,1)"], [0.55, "rgba(255,50,35,1)"], [0.88, "rgba(255,50,35,1)"], [0.93, "rgba(255,50,35,0)"], [1, "rgba(255,50,35,0)"]]);
const billow = (p: Pen, u: number, seed: number) => {
  const mix = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  const hot = u < 0.45 ? mix([255, 244, 190], [255, 140, 40], u / 0.45) : mix([255, 140, 40], [46, 36, 44], (u - 0.45) / 0.55);
  const edge = u < 0.45 ? mix([255, 130, 30], [190, 60, 25], u / 0.45) : mix([190, 60, 25], [30, 24, 32], (u - 0.45) / 0.55), al = u < 0.7 ? 1 : 1 - (u - 0.7) / 0.3;
  const g = p.g; for (let i = 0; i < 6; i++) { const a = i * 1.05 + seed, d = i ? 92 : 0, x = 256 + d * Math.cos(a), y = 256 + d * Math.sin(a), R = i ? 110 + 22 * Math.sin(seed + i) : 150;
    const r = g.createRadialGradient(x, y, 4, x, y, R); r.addColorStop(0, `rgba(${hot},${al})`); r.addColorStop(0.68, `rgba(${edge},${al})`); r.addColorStop(1, `rgba(${edge},0)`); g.fillStyle = r; g.beginPath(); g.arc(x, y, R, 0, two); g.fill(); }
};
const soot = (p: Pen, lit: number, seed: number) => {
  const g = p.g; for (let i = 0; i < 6; i++) { const a = i * 1.05 + seed, d = i ? 96 : 0, x = 256 + d * Math.cos(a), y = 256 + d * 0.8 * Math.sin(a), R = i ? 112 : 150;
    const r = g.createRadialGradient(x, y - 30, 8, x, y, R), under = y > 270 ? lit : 0; r.addColorStop(0, `rgba(${Math.round(70 + 170 * under)},${Math.round(58 + 62 * under)},${Math.round(66 - 20 * under)},.95)`); r.addColorStop(0.75, "rgba(38,30,40,.9)"); r.addColorStop(1, "rgba(38,30,40,0)"); g.fillStyle = r; g.beginPath(); g.arc(x, y, R, 0, two); g.fill(); }
};
const stoneBit = (p: Pen, c: string) => { p.poly([[10, 40], [70, 8], [130, 30], [118, 90], [40, 110]], c, 7); };
const plank = (p: Pen, c: string) => { p.poly([[10, 40], [290, 12], [292, 60], [14, 92]], c, 7); p.stroke([[60, 44], [240, 26]], 5, INK); };

const fireball = (out: Stage, t: number, b: number, x0: number, y0: number, z0: number, big: number, seed: number) => {
  if (t < b) return;
  for (let i = 0; i < 11; i++) { const k = (t - b - i * 0.018) / (0.95 + 0.25 * seedR(seed + i)); if (k < 0 || k >= 1) continue;
    const a = seedR(seed + i + 40) * two, sp = (1.5 + 5.5 * seedR(seed + i + 80)) * big, e = 1 - (1 - k) ** 3, u = q(k, 16), s = i % 3;
    out.fx.push({ key: `fb|${s}|${u}`, cw: 512, ch: 512, soft: true, draw: (p) => billow(p, u, s * 2.1), x: x0 + Math.cos(a) * sp * e, y: y0 + Math.abs(Math.sin(a)) * sp * e * 1.1 + 1.5 * big * k, z: z0 + i * 0.05, w: big * (3.2 + 6.5 * e), h: big * (3.2 + 6.5 * e) }); }
};
const sootCol = (out: Stage, t: number, t0: number, x0: number, y0: number, z0: number, n: number, big: number) => {
  if (t < t0) return;
  const age = t - t0;
  for (let i = 0; i < n; i++) { const v = (age * 0.16 + i / n) % 1; if (age < (i / n) * 1.2) continue;
    const lit = q(Math.max(0, 1 - v * 3), 4), s = i % 3, w = big * (3.4 + 8 * v);
    out.fx.push({ key: `soot|${s}|${lit}`, cw: 512, ch: 512, soft: true, draw: (p) => soot(p, lit, s * 1.7), x: x0 + 3.5 * big * Math.sin(i * 2.4) * v - 2.6 * v, y: y0 + 21 * big * v, z: z0 - 0.3 - v, w, h: w }); }
};
const flashCard = (out: Stage, id: number, t: number, b: number, dur = 0.42) => {
  const k = (t - b) / dur; if (k < 0 || k >= 1) return;
  const c = camAt(id, Math.round(t * 30)), f = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]], n = Math.hypot(f[0], f[1], f[2]), d = 1.2, h = 2 * d * Math.tan((c.fov * Math.PI) / 360) * 1.1, a = q(0.85 * (1 - k) ** 2, 12);
  out.fx.push({ key: `flash|${a}`, cw: 64, ch: 64, soft: true, draw: (p) => { p.g.fillStyle = `rgba(255,190,110,${a})`; p.g.fillRect(0, 0, 64, 64); }, x: c.pos[0] + (f[0] / n) * d, y: c.pos[1] + (f[1] / n) * d, z: c.pos[2] + (f[2] / n) * d, w: h, h });
};
const muzzle = (out: Stage, t: number, b: number, x: number, y: number, z: number, big = 1) => {
  const k = (t - b) / 0.28; if (k < 0 || k >= 1) return;
  const u = q(k, 8), R = big * (1.6 + 1.6 * u);
  out.fx.push({ key: "muzzle|core", cw: 256, ch: 256, draw: (p) => star(p, 128, 120, "#fff6d0"), x, y, z: z + 0.05, w: R * 1.3, h: R * 1.3, rot: q(k * 2, 8) });
  out.fx.push({ key: `muzzle|g|${u}`, cw: 256, ch: 256, soft: true, draw: (p) => glow(p, 256, warm(0.95 * (1 - u))), x, y, z, w: R * 3.4, h: R * 3.4 });
};
const flung = (t: number, b: number, vx: number, vy: number, vz: number, g = 9) => { const k = t - b; return k < 0 ? null : { dx: vx * k, dy: vy * k - 0.5 * g * k * k, dz: vz * k, k }; };
/** a set point of the bridge blast: fireball, soot, stones flung, flash */
const blast = (out: Stage, id: number, t: number, b: number, x: number, y: number, z: number, big: number, seed: number) => {
  fireball(out, t, b, x, y, z, big, seed); flashCard(out, id, t, b, 0.36); sootCol(out, t, b + 0.15, x, y, z - 1, 8, big * 0.8);
  for (let i = 0; i < 12; i++) { const f = flung(t, b, (seedR(i + seed) - 0.5) * 26, 6 + 12 * seedR(i + seed + 20), (seedR(i + seed + 40) - 0.2) * 9, 11); if (f && f.k < 2.2) { const c = i % 2 ? "#a9a297" : "#7f7a70"; out.fx.push({ key: `bit|${c}`, cw: 140, ch: 120, draw: (p) => stoneBit(p, c), x: x + f.dx, y: y + f.dy, z: z + f.dz + 1, w: 1 + 1.2 * seedR(i), h: 0.9 + seedR(i), rot: q(f.k * (3 + i % 4), 12) }); } }
};

export const fx = (id: number, t: number, out: Stage) => {
  const [a, b] = sec(id);
  const X = (x: number) => O[0] + x;
  const WIN: V3 = [X(-35.77), 2.45, -13];
  if (id === 2) { const B = BEATS.blast2; blast(out, id, t, B, X(250), DECK + 1, 0, 1.5, 3); }
  if (id === 3 || id === 31) { const c = trainAt(id, t)!; for (let i = 0; i < 6; i++) { const v = (t * 0.7 + i / 6) % 1, u = q(v, 8); out.fx.push({ key: `steam|${u}`, cw: 300, ch: 300, soft: true, draw: (p) => fxPuff(p, u), x: X(c + 18.1 - 18 * v), y: 5.6 + 5 * v, z: RZ, w: 3 + 6 * v, h: 3 + 6 * v }); } }
  if (id === 4) { const m = q(0.5 + 0.5 * Math.sin(t * 6), 4); out.fx.push({ key: `map|${m}`, cw: 600, ch: 420, draw: (p) => mapArt(p, m), x: X(-360), y: 0.93, z: 8, w: 1.42, h: 0.98, flat: true }); }
  if (id >= 5 && id <= 7) out.fx.push({ key: "flagCH", cw: 256, ch: 256, draw: flagCH, x: X(-267.2), y: 4.5, z: -7, w: 1.4, h: 1.4, face: [0, 0, 1] });
  if (id === 5) { const c = BEATS.crush; if (t > c - 0.1) for (let i = 0; i < 7; i++) { const f = flung(t, c, (seedR(i) - 0.3) * 8, 3 + 5 * seedR(i + 9), (seedR(i + 20) - 0.5) * 7); if (f && 1.2 + f.dy > 0) { const col = i % 2 ? "#c63939" : "#f7f4ec"; out.fx.push({ key: `arm|${col}`, cw: 300, ch: 100, draw: (p) => plank(p, col), x: X(-300) + f.dx, y: 1.2 + f.dy, z: f.dz, w: 1, h: 0.3, rot: q(f.k * 7, 12) }); } } }
  if (id === 6) { const k = leadTank(6, t)!; const up = ease((t - 15.0) / 0.3); out.fx.push({ key: "binoc", cw: 200, ch: 100, draw: binoc, x: X(k.x - 0.3 + 0.1), y: k.y + HATCH_Y + 1.44 - 0.35 * up, z: k.z, w: 0.56, h: 0.28 }); }
  if (id === 8) { const k = ease((t - word("window", 17) + 0.2) / 0.5), p0 = 0.72 + 0.28 * Math.sin(t * 5), pu = q(k * p0, 8);
    if (pu > 0) out.fx.push({ key: `shine|${pu}`, cw: 512, ch: 512, soft: true, draw: (p) => shine(p, 0, pu), x: WIN[0], y: WIN[1], z: WIN[2], w: 2.2, h: 2.2, face: [1, 0, 0] }); }
  if (id === 13) { const f = BEATS.fire; for (let i = 0; i < 6; i++) { const g = flung(t, BEATS.hinge + 0.5, (seedR(i) - 0.5) * 12, 2 + 3 * seedR(i + 8), 3 + 4 * seedR(i + 16), 9); if (g && g.k < 1.1) out.fx.push({ key: "flake", cw: 300, ch: 100, draw: (p) => plank(p, "#e79ab2"), x: X(-40) + g.dx, y: 1 + Math.max(0, g.dy), z: -9 + g.dz, w: 1.3, h: 0.45, rot: q(g.k * 5, 12) }); }
    muzzle(out, t, f, X(-40), 1.6, -6.8, 1.4); flashCard(out, id, t, f, 0.25); }
  if (id === 14) { muzzle(out, t, BEATS.barn, X(-8), 1.4, -9.8, 1.3); flashCard(out, id, t, BEATS.barn, 0.22); }
  if (id === 15) { muzzle(out, t, BEATS.rock, X(22), 1.0, -8.8, 1.1); flashCard(out, id, t, BEATS.rock, 0.22); }
  if (id === 16) { sootCol(out, t, a - 1.2, X(-40), 3, -13, 8, 0.6); for (const [bt, sd] of [[35.5, 40], [36.15, 53]] as number[][]) fireball(out, t, bt, X(-34), 2.5, -22, 0.55, sd); }
  if (id === 17) sootCol(out, t, a - 2, X(-40), 3, -13, 8, 0.6);
  if (id === 18) { const k = leadTank(18, t)!;
    for (let c = 0; c < 5; c++) { const x = k.x + c * 12 + 3; for (let i = 0; i < 2; i++) { const v = (t * 1.1 + i / 2 + c * 0.21) % 1, u = q(v, 6); out.fx.push({ key: `dust|${u}`, cw: 300, ch: 300, soft: true, draw: (p) => fxPuff(p, u), x: X(x + 5 * v), y: 1 + 1.5 * v, z: (i ? 1.4 : -1.4), w: 3 + 5 * v, h: 3 + 5 * v }); } } // pale dust: the shot's only light value
    out.fx.push({ key: "topHead", cw: 200, ch: 200, draw: (p) => { p.ell(100, 100, 74, 74, "#6f7a45", 10); p.ell(100, 100, 44, 44, "#f6e7da", 8); p.arc(104, 94, 11, 15, 150, 430, 7, INK); }, x: X(k.x - 0.3), y: 3.0, z: 0, w: 2.2, h: 2.2, flat: true }); }
  if (id === 19) { /* nothing but the tank + the rail */ }
  if (id === 20) { for (const [bb, x, big, sd] of [[BEATS.b1, 263.4, 1.45, 3], [BEATS.b2, 236.6, 1.45, 21], [BEATS.b3, 250, 1.8, 40]] as number[][]) blast(out, id, t, bb, X(x), DECK + 1, 0, big, sd);
    const kT = t - BEATS.b3; if (kT > 0) { /* the tank goes with the middle span: stones cover the drop */ } }
  if (id === 21) { for (let i = 0; i < 18; i++) { const r = boulder(i, t); if (!r) continue; const v = q((t * 2 + i * 0.3) % 1, 6); out.fx.push({ key: `dust|${v}`, cw: 300, ch: 300, soft: true, draw: (p) => fxPuff(p, v), x: X(r.x), y: r.y - 0.6, z: r.z + 1, w: 6 + 9 * v, h: 6 + 9 * v }); } }
  if (id === 22) { const s = q(clamp01((t - BEATS.smear) / 1.0), 12); out.fx.push({ key: `shine|s|${Math.max(0.05, s)}`, cw: 512, ch: 512, soft: true, draw: (p) => shine(p, Math.max(0.05, s), 1), x: WIN[0], y: WIN[1], z: WIN[2], w: 1.3, h: 1.3, face: [1, 0, 0] });
    if (s > 0) { const hy = 2.45 - 0.05 - 0.36 * s; out.fx.push({ key: "dab", cw: 64, ch: 64, draw: (p) => p.ell(32, 32, 26, 26, "#fffbe4", 5), x: WIN[0] + 0.2, y: hy, z: WIN[2], w: 0.09, h: 0.09 }); } }
  if (id === 23) { sootCol(out, t, a - 2, X(-40), 3, -13, 8, 0.6); for (let i = 0; i < 16; i++) { const v = ((t - a) * 0.4 + seedR(i)) % 1, c = i % 2 ? "#e79ab2" : "#c97a95"; out.fx.push({ key: `fl|${c}`, cw: 300, ch: 100, draw: (p) => plank(p, c), x: X(-44 + 12 * seedR(i + 30)), y: 3.9 - 3.8 * v, z: -9.5 + 2 * seedR(i + 60), w: 0.5, h: 0.17, rot: q(v * 6 + i, 12) }); } }
  if (id === 24) {
    out.fx.push({ key: "door1940", cw: 500, ch: 700, draw: door1940, x: X(-60), y: 1.78, z: -20.45, w: 2.5, h: 3.5, face: [0, 0, 1] });
    const camH = camAt(24, Math.round(t * 30)).pos[1], R = Math.min(24, 3 + camH * 0.05), lit = (w0: number, t0: number, x: number, y: number, z: number, i: number) => { const k = clamp01((t - w0 - t0) / 0.3); if (k > 0) out.fx.push({ key: "dp", cw: 256, ch: 256, soft: true, draw: point, x: X(x), y: y + 0.4, z, w: R * k, h: R * k, flat: true, rot: i, noFog: true }); };
    const stroke = (x0: number, y0: number, z0: number, x1: number, z1: number, tA: number, dur: number, i: number) => { const k = clamp01((t - tA) / dur); if (k <= 0) return; const kq = q(k, 30), xe = x0 + (x1 - x0) * kq, ze = z0 + (z1 - z0) * kq, len = Math.hypot(xe - x0, ze - z0); if (len < 0.5) return;
      out.fx.push({ key: "stroke", cw: 64, ch: 64, soft: true, draw: (p) => { const g = p.g, r = g.createLinearGradient(0, 0, 0, 64); r.addColorStop(0.2, "rgba(255,50,35,0)"); r.addColorStop(0.24, "rgba(255,50,35,1)"); r.addColorStop(0.76, "rgba(255,50,35,1)"); r.addColorStop(0.8, "rgba(255,50,35,0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }, x: X((x0 + xe) / 2), y: y0 + 0.3 + i * 0.01, z: (z0 + ze) / 2, w: len, h: Math.max(1, R * 0.55), flat: true, rot: Math.atan2(-(z1 - z0), x1 - x0), noFog: true }); };
    stroke(-340, 0, 0, 60, 0, word("three", 54) - 0.8, 1.9, 0); stroke(160, DECK, 0, 340, 0, word("bridges", 56), 0.6, 1); stroke(-190, 0, RZ, 112, RZ, word("tunnels", 56), 0.5, 2);
    stroke(-100, 0, 0, -60, RZ, word("roads", 56), 0.45, 3); stroke(60, 0, 0, 60, RZ, word("roads", 56), 0.45, 4); stroke(160, 0, 0, 90, RZ, word("roads", 56) + 0.05, 0.45, 5);
    let n = 0; const w0 = word("three", 54) - 1.0;
    for (let x = -340; x <= 60; x += 22) lit(w0, ((x + 340) / 400) * 1.8, x, 0, 0, n++);
    for (let x = 160; x <= 340; x += 26) lit(word("bridges", 56), ((x - 160) / 180) * 0.7, x, DECK, 0, n++);
    for (let x = -190; x <= 110; x += 24) lit(word("tunnels", 56), ((x + 190) / 300) * 0.5, x, 0, RZ, n++);
    for (const [x0, z0, x1, z1] of [[-100, 0, -60, 220], [60, 0, 60, 220], [160, 0, 90, 220]] as number[][]) for (let i = 0; i <= 8; i++) lit(word("roads", 56), i * 0.05, x0 + ((x1 - x0) * i) / 8, 0, z0 + ((z1 - z0) * i) / 8, n++);
    for (let i = 0; i < 90; i++) lit(word("points", 56), seedR(i + 70) * 2.2, -200 + 520 * seedR(i + 170), 0, -40 + 300 * seedR(i + 270), n++); // the rest of the 3,000: all over the country
  }
  if (id === 25) { out.fx.push({ key: "plunger|0|nh", cw: 600, ch: 600, draw: (p) => plunger(p, 0, false), x: X(38.7), y: 0.35, z: 243.4, w: 0.7, h: 0.7 }); out.fx.push({ key: "wire25", cw: 16, ch: 400, draw: wire, x: X(42.5), y: 0.12, z: 243.6, w: 0.05, h: 7.6, flat: true, rot: 1.5 }); }
  if (id === 26) { const d = q(ease((t - BEATS.plunge) / 0.16), 10); out.fx.push({ key: `plunger|${d}`, cw: 600, ch: 600, draw: (p) => plunger(p, d), x: X(38.7), y: 0.62, z: 243.4, w: 1.25, h: 1.25 }); }
  if (id === 29) { const k = clamp01((t - a) / 1.2), x = 111 - 3.6 * k; out.fx.push({ key: "pebble", cw: 100, ch: 100, draw: (p) => stoneBit(p, "#7f7a70"), x: X(x), y: 0.14 + 0.1 * Math.abs(Math.sin(k * 11)) * (1 - k), z: 221.2, w: 0.3, h: 0.3, rot: q(k * 10, 12) }); }
  if (id === 30) { out.fx.push({ key: "flagCH", cw: 256, ch: 256, draw: flagCH, x: X(226), y: DECK + 4.5, z: -5, w: 1.6, h: 1.6, face: [0, 0, 1] }); }
  void b;
};
