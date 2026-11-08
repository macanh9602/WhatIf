// What If ep15 acting. Lead: the one curl, dark grey sweater, no cap. The life-jacket orange (OR) is the only bright saturated
// colour on him, the same in every shot (jackets, the jumpsuit). Cargo = plain wrapped bales; no agency marks, no text but "2008".
import { Pen, Outfit, FrontOpts, INK, POSES, fxPuff } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { camAt } from "../../story";
import { Act, Stage, LEAD, q } from "../../act";
import { SHOTS, BEATS, subAt, subX, cutterX, SUB_Y, DECK_Y, C, ez } from "./story";
import words from "./words";

const O = SETS.pacific.origin;
const L = ([x, y, z]: V3): V3 => [O[0] + x, y, z];
const X = (x: number) => O[0] + x;
export const word = (text: string, from = 0) => {
  const hit = words.find((w) => w.start >= from - 0.01 && w.text.replace(/[^A-Za-z0-9'-]/g, "").toLowerCase() === text.toLowerCase());
  if (!hit) throw new Error(`Missing cast beat word: ${text} after ${from}`);
  return hit.start;
};
export const wearAt = (_t: number) => 0;

// ---------------- cast ----------------
export const OR = "#f07a1a";
const YOU: Outfit = { jacket: "#3d4047", pants: "#353a46", boots: "#2b2018", hat: null, sprout: true, build: "adult", top: "sweater", bottom: "jeans", shoe: "boot", skin: "#f6e7da", longSleeves: true };
const YOU_LJ: Outfit = { ...YOU, layer: { kind: "jacket", color: OR } };
const YOU_BL: Outfit = { ...YOU, layer: { kind: "blanket", color: "#8f939b" } }; // grey wool blanket draped over the shoulders
const YOU_JS: Outfit = { ...YOU, jacket: OR, pants: OR, top: "button", layer: { kind: "jumpsuit", color: OR } }; // worn, not held
const ENG: Outfit = { jacket: "#6a5a48", pants: "#3e3f36", boots: "#2b2018", hat: null, build: "stout", top: "tee", bottom: "cargo", moustache: "#3a2a20", shoe: "boot", skin: "#c99a70", hair: "#2a2020" };
const CREW: Outfit = { jacket: "#4a5244", pants: "#3e3f36", boots: "#2b2018", hat: null, build: "adult", top: "tee", bottom: "cargo", shoe: "boot", skin: "#b9875e", hair: "#2a2020" };
const CREW_LJ: Outfit = { ...CREW, layer: { kind: "jacket", color: OR } };
const ENG_LJ: Outfit = { ...ENG, layer: { kind: "jacket", color: OR } };
const OFF: Outfit = { jacket: "#2c3a5c", pants: "#2c3a5c", boots: "#17151c", hat: null, build: "adult", top: "button", bottom: "cargo", shoe: "boot", skin: "#e8c4a0", hair: "#3a2a20", longSleeves: true };
const OFF2: Outfit = { ...OFF, build: "stout", skin: "#8d5b3e", moustache: "#2a2020" };
const GUARD: Outfit = { jacket: "#7a8a9a", pants: "#3e4656", boots: "#17151c", hat: null, build: "stout", top: "button", bottom: "cargo", shoe: "boot", skin: "#d9a57f", hair: "#5a4a3a" };
export const CAST: [string, Outfit, Partial<FrontOpts>][] = [["You", YOU, { expr: "smile" }], ["You, jacket", YOU_LJ, { expr: "grin" }], ["Engineer", ENG, { expr: "laugh" }], ["Officer", OFF, { expr: "stern" }], ["Guard", GUARD, { expr: "deadpan" }]];

const sec = (id: number) => [SHOTS[id - 1].a / 30, SHOTS[id - 1].b / 30];
const ease = (x: number) => { const k = clamp01(x); return k * k * (3 - 2 * k); };
const you = (at: V3, expr: Act["expr"], more: Partial<Act> = {}): Act => ({ i: 0, o: YOU, at: L(at), mode: "stand", expr, ...more });
const WAVE_ARM = (t: number): FrontOpts["reach"] => [undefined, { ex: 26, ey: -0.2, hx: 30 + 14 * Math.sin(t * 13), hy: -0.63, front: true }];
/** both hands together in front at the waist (cuffed) */
const CUFFED = (): FrontOpts["reach"] => [{ ex: -8, ey: 0.42, hx: 25, hy: 0.68, front: true }, { ex: 8, ey: 0.42, hx: -25, hy: 0.68, front: true }];
const LEFT_OUT = (hy = 0): FrontOpts["reach"] => [{ ex: -26, ey: 0.05, hx: -44, hy, front: true }, undefined];
/** shot 27: the officer stands at his shoulder, one hand on it */
const OFF27: V3 = [-13.3, DECK_Y, -202.3];
const HAND_ON_SHOULDER = { ex: 30, ey: 0.05, hx: 62, hy: -0.02, front: true };
const ARM_X = 0.66 + 0.217, ARM_Y = 1.12 + 1.02; // rescue arm sprite centre: puts the glove on his left shoulder strap
const lift = (t: number, t0: number) => -0.95 + 0.7 * ease((t - t0) / 0.8);
const off = (i: number, o: Outfit, at: V3, expr: Act["expr"], more: Partial<Act> = {}): Act => ({ i, o, at: L(at), mode: "stand", expr, ...more });

const ACTS = (id: number): Act[] => {
  const [a] = sec(id);
  switch (id) {
    case 1: return [{ ...you([-0.6, 0.45, 2.6], [[0, "grin"]], { mode: "lie_back", reach: WAVE_ARM, noShadow: true }), o: YOU_LJ }];
    case 2: return [{ ...you([0.5, 0, 30], [[0, "smile"], [BEATS.save - LEAD, "grin"]], { noShadow: true, path: (t) => L([0.5, lift(t, 4.2), 30]), reach: () => POSES.shrug }), o: YOU_LJ }];
    case 3: return [you([-501, 0.3, 2.5], [[0, "proud"]], { look: -0.8, prop: "roller", reach: (t) => [{ ex: -24, ey: -0.1, hx: -40, hy: -0.4 + 0.25 * Math.sin(t * 5), front: true }, undefined] })];
    case 4: { const p = BEATS.patch; return [you([-501.2, 0.3, 2.6], [[0, "confident"], [p - LEAD, "smug"]], { look: -0.8, reach: (t) => LEFT_OUT(t < p ? -0.5 : -0.2) })]; }
    case 5: return [{ i: 0, o: YOU, at: [0, 0, 0], mode: "stand", noShadow: true, expr: [[0, "smile_closed"]], prop: "mug", path: (t) => L([subX(5, t) + 4.2, SUB_Y + 1.75, 0]) }]; // head and curl clear of the cockpit
    case 6: return [you([C + 0.3, 0, -0.4], [[0, "tired"], [word("fumes", 18) - LEAD, "disgusted"]], { prop: "jug", reach: (t) => [undefined, { ex: 24, ey: -0.1, hx: 30, hy: -0.55 + 0.08 * Math.sin(t * 22), front: true }] }),
      { i: 1, o: CREW, at: L([C + 2.3, 0, 0.2]), mode: "sit", seat: 0.3, expr: [[0, "tired"]], head: () => 14, noShadow: true },
      { i: 2, o: CREW, at: L([C + 3.1, 0, 0.1]), mode: "sit", seat: 0.3, expr: [[0, "tired"]], head: () => -12, noShadow: true }];
    case 7: return [you([C - 2.3, 0, -0.5], [[0, "deadpan"], [BEATS.gauge - LEAD, "bored"]], { look: -0.7, reach: () => LEFT_OUT(-0.35) })];
    case 8: return [you([C + 2.95, 0, -0.45], [[0, "proud"]], { look: -0.7, reach: (t) => LEFT_OUT(-0.05 + 0.06 * Math.abs(Math.sin(t * 6))) })];
    case 9: return [off(1, ENG, [C - 0.65, 0, -0.6], [[0, "smile"], [word("laughs", 27) - LEAD, "laugh"]], { tilt: (t) => (t > 27.2 ? 4 * Math.sin(t * 15) : 0), reach: () => POSES.hands_on_hips, look: 0.5 }),
      you([C + 0.35, 0, -0.35], [[0, "deadpan"]], { reach: (t) => (t > 28.6 ? POSES.shrug : undefined), look: -0.4 })];
    case 12: { const x = (t: number) => subX(12, t); return [off(3, OFF, [0, 0, 0], [[0, "angry"]], { noShadow: true, path: (t) => L([x(t) + 0.8, 0.55, 5.3]), reach: () => POSES.point_left, tilt: (t) => 3 * Math.sin(t * 9) }),
      off(4, OFF2, [0, 0, 0], [[0, "rage"]], { noShadow: true, prop: "megaphone", path: (t) => L([x(t) - 1.4, 0.55, 5.3]), reach: () => [{ ex: -14, ey: 0.05, hx: 28, hy: -0.5, front: true }, undefined] })]; }
    case 13: { const x = (t: number) => subX(13, t), t0 = 38.85, t1 = BEATS.land;
      return [off(3, OFF, [0, 0, 0], [[0, "angry"]], { noShadow: true, reach: () => POSES.hands_up, path: (t) => { const k = clamp01((t - t0) / (t1 - t0)); return L([x(t) + 0.5, (k < 1 ? 0.55 + (0.1 - 0.55) * k + 1.6 * Math.sin(Math.PI * k) : 0.1), 5.0 - 4.6 * k]); } })]; }
    case 14: return [you([C - 1.7, 0, -0.2], [[0, "worried"], [BEATS.bang1 - LEAD, "shock"], [BEATS.bang3 - LEAD, "scared"]], { lookY: () => -0.6, tilt: (t) => [BEATS.bang1, BEATS.bang2, BEATS.bang3].some((b) => t > b && t < b + 0.15) ? 5 : 0 })];
    case 15: return [you([C + 1.55, 0, -0.55], [[0, "deadpan"], [43.4, "sly"]], { look: -0.6, reach: (t) => LEFT_OUT(0.05 + 0.05 * Math.sin((t - 43.4) * 4)) })];
    case 16: { const sw = 45.6; return [you([C + 0.5, 0, -0.4], [[0, "nervous"]], { path: (t) => (t < sw ? L([C + 0.5, 0, -0.4]) : null), reach: () => POSES.hands_up }),
      { ...you([C + 0.5, 0, -0.4], [[sw, "smile"]], { path: (t) => (t >= sw ? L([C + 0.5, 0, -0.4]) : null), reach: () => POSES.hands_on_hips }), o: YOU_LJ, i: 5 }]; }
    case 17: return [{ ...you([0, 0.6, 0], [[0, "smile"]], { mode: "lie_back", reach: WAVE_ARM, noShadow: true }), o: YOU_LJ },
      { i: 1, o: CREW_LJ, at: L([2.8, 0.6, 2.2]), mode: "lie_back", expr: [[0, "tired"]], noShadow: true },
      { i: 2, o: ENG_LJ, at: L([-2.6, 0.6, 2.6]), mode: "lie_back", expr: [[0, "smile"]], noShadow: true },
      { i: 3, o: CREW_LJ, at: L([1.2, 0.6, -2.8]), mode: "lie_back", expr: [[0, "tired"]], noShadow: true }];
    case 19: return [{ ...you([-14.2, DECK_Y + 0.44, -202.6], [[0, "whistle"]], { mode: "sit", seat: 0.1, look: 0.4 }), o: YOU_BL }];
    case 20: return [{ ...you([-14.2, DECK_Y + 0.44, -202.6], [[0, "smile_closed"], [57.0, "smile"], [BEATS.close20 - LEAD, "smug"]], { mode: "sit", seat: 0.1, look: 0.4 }), o: YOU_BL },
      off(3, OFF, [-14.3, DECK_Y, -201.5], [[0, "stern"], [BEATS.close20, "bored"]], { prop: "clipboard", look: 0.3 })];
    case 21: case 24: case 27: {
      const o = id === 21 ? YOU_LJ : id === 24 ? YOU_LJ : YOU_BL;
      const ex: Act["expr"] = id === 21 ? [[0, "relief"], [61.2, "smile"]] : id === 24 ? [[0, "smile"]] : [[0, "sad"]];
      const tb = id === 21 ? 60.6 : 66.6; // the hand-over: the officer holds the folded blanket out, then the lead has it
      return [{ ...you([-12.6, DECK_Y, -201.8], ex, { reach: id === 27 ? CUFFED : () => LEFT_OUT(0.1), look: -0.5, prop: id === 27 ? "cuffs" : (t) => (t >= tb ? "blanket_fold" : null) }), o },
        off(3, id === 24 ? OFF2 : OFF, id === 27 ? OFF27 : [-13.9, DECK_Y, -202.5], id === 24 ? [[0, "tired"], [66.6, "sigh"]] : [[0, "stern"]],
          { reach: () => [undefined, id === 27 ? HAND_ON_SHOULDER : { ex: 26, ey: 0.1, hx: 40, hy: 0.0, front: true }], look: 0.5, prop: id === 27 ? null : (t) => (t < tb ? "blanket_fold" : null) })]; }
    case 22: return [{ ...you([-311, 1.2, 60], [[0, "smile"]], { mode: "stroll", phase: (t) => t * 1.2, path: (t) => L([-311 - 3.6 * (t - a), 1.2, 60]), reach: (t) => (t > 62.5 ? WAVE_ARM(t) : undefined), look: -0.8 }), o: YOU_BL }];
    case 23: return [{ ...you([-316.2, 1.2, 60.2], [[0, "smug"]], { mode: "stroll", phase: (t) => t * 1.1, path: (t) => L([-316.0 - 1.5 * (t - a), 1.2, 60.2]), look: -0.8, reach: (t) => (t > 63.8 && t < 64.6 ? LEFT_OUT(0.25) : undefined) }), o: YOU_BL }];
    case 26: return [{ ...you([0.5, 0, 30], [[0, "smile"], [BEATS.cuff - LEAD, "shook"]], { noShadow: true, path: (t) => L([0.5, lift(t, 73.2), 30]), reach: CUFFED, prop: (t) => (t < BEATS.cuff ? null : t < BEATS.cuff + 0.25 ? "cuffs_click" : "cuffs") }), o: YOU_LJ }];
    case 28: return [{ ...you([C, 0, 3.4], [[0, "deadpan"]], { look: 0, prop: "bag_empty", reach: () => [{ ex: -20, ey: 0.42, hx: -22, hy: 0.6, front: true }, undefined] }), o: YOU_JS },
      off(6, GUARD, [C + 1.35, 0, 3.7], [[0, "deadpan"]], { look: -0.7, reach: () => [{ ex: -26, ey: 0.1, hx: -40, hy: 0.05, front: true }, undefined] })];
    default: return [];
  }
};
export const acts = (id: number): Act[] => ACTS(id);

// ---------------- props ----------------
const seedR = (i: number) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const text = (p: Pen, s: string, x: number, y: number, px: number, col: string, stroke = INK) => {
  const g = p.g; g.save(); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${px}px "Arial Black", Arial, sans-serif`;
  g.lineJoin = "round"; g.lineWidth = px * 0.14; g.strokeStyle = stroke; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); g.restore();
};
const glow = (p: Pen, size: number, stops: [number, string][]) => { const g = p.g, c = size / 2, r = g.createRadialGradient(c, c, 0, c, c, c); for (const [o, col] of stops) r.addColorStop(o, col); g.fillStyle = r; g.fillRect(0, 0, size, size); };
/** a clear plastic bag over whatever is drawn: pale edge, two shine streaks */
const bag = (p: Pen, x0: number, y0: number, x1: number, y1: number) => {
  p.poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], "rgba(235,245,255,0.18)", 6);
  p.stroke([[x0 + 30, y0 + 30], [x0 + 90, y0 + 20]], 12, "rgba(255,255,255,0.85)"); p.stroke([[x1 - 70, y1 - 40], [x1 - 30, y1 - 70]], 10, "rgba(255,255,255,0.75)");
};
/** one folded life jacket: orange, a dark buckle strap, a collar */
const jacket = (p: Pen, x: number, y: number, w: number, h: number) => {
  p.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], OR, 7);
  p.stroke([[x + 10, y + h * 0.55], [x + w - 10, y + h * 0.55]], 12, "#2a2a30"); p.poly([[x + w / 2 - 14, y + h * 0.45], [x + w / 2 + 14, y + h * 0.45], [x + w / 2 + 14, y + h * 0.65], [x + w / 2 - 14, y + h * 0.65]], "#c9ccd4", 4);
  p.stroke([[x + 20, y + 14], [x + w - 20, y + 14]], 8, "#c45f12");
};
const jackets4 = (p: Pen) => { for (let i = 0; i < 4; i++) { const y = 300 - i * 86 + (i % 2) * 4, x = 40 + (i % 2) * 14; jacket(p, x, y, 420, 82); bag(p, x - 8, y - 6, x + 428, y + 88); } };
const jacket1 = (p: Pen) => { jacket(p, 30, 60, 300, 170); bag(p, 18, 48, 342, 242); };
const gauge = (p: Pen) => { p.ell(100, 100, 88, 88, "#d8d2c0", 9); p.stroke([[100, 100], [150, 60]], 9, "#b02a20"); p.stroke([[40, 60], [160, 150]], 5, INK); p.stroke([[60, 40], [90, 120]], 4, INK); };
const patch = (p: Pen) => { p.poly([[20, 30], [280, 14], [290, 200], [12, 210]], "#7d8f9e", 7); p.stroke([[0, 40], [300, 190]], 34, "#b8b49a"); p.stroke([[0, 190], [300, 30]], 34, "#b8b49a"); };
const valve = (p: Pen) => { p.ell(150, 150, 130, 130, null, 0); p.arc(150, 150, 120, 120, 0, 360, 22, "#b02a20"); for (let i = 0; i < 4; i++) { const a = (i * Math.PI) / 2; p.stroke([[150, 150], [150 + 118 * Math.cos(a), 150 + 118 * Math.sin(a)]], 16, "#8a1f18"); } p.ell(150, 150, 26, 26, "#3a3f4a", 6); };
const evBag = (p: Pen) => { p.poly([[20, 20], [280, 20], [280, 360], [20, 360]], "rgba(235,245,255,0.35)", 8); p.poly([[20, 20], [280, 20], [280, 70], [20, 70]], "#c9ccd4", 6); p.stroke([[40, 120], [260, 120]], 8, "#9aa3ad"); bag(p, 20, 20, 280, 360); };
const scale = (p: Pen) => { p.poly([[20, 120], [380, 120], [360, 230], [40, 230]], "#c9ccd4", 8); p.poly([[60, 60], [340, 60], [340, 120], [60, 120]], "#9aa3ad", 6); p.poly([[140, 150], [260, 150], [260, 205], [140, 205]], "#2c3a4a", 4); text(p, "0.00", 200, 178, 40, "#9fe3b0", "#2c3a4a"); };
const page2008 = (p: Pen) => { p.poly([[14, 14], [386, 14], [386, 506], [14, 506]], "#f4f0e2", 8); for (let i = 0; i < 9; i++) p.stroke([[50, 60 + i * 26], [350 - (i % 3) * 40, 60 + i * 26]], 7, "#b8b2a2"); text(p, "2008", 200, 330, 110, "#2a2a30", "#f4f0e2"); p.arc(270, 430, 62, 62, 0, 360, 12, "#b02a20"); p.stroke([[230, 430], [310, 430]], 12, "#b02a20"); };
const flag = (p: Pen) => { for (let i = 0; i < 7; i++) p.poly([[6, 6 + i * 34], [394, 6 + i * 34], [394, 40 + i * 34], [6, 40 + i * 34]], i % 2 ? "#f4f2ea" : "#b0283a", 0); p.poly([[6, 6], [170, 6], [170, 126], [6, 126]], "#2c3a6e", 0); for (let i = 0; i < 12; i++) p.ell(26 + (i % 4) * 40, 28 + Math.floor(i / 4) * 38, 7, 7, "#f4f2ea", 0); };
/** the rescuer's arm from off frame (top right): navy sleeve with a reflective cuff band, a grey glove whose fingers curl over
 *  the life jacket's shoulder strap (glove centre at canvas 105, 615) */
const RESCUE_ARM = (p: Pen) => {
  const g = p.g, NAVY = "#2c3a5c", GL = "#59616f", O = 720, Y = (pts: number[][]) => pts.map(([x, y]): [number, number] => [x, y + O]);
  const sleeve: number[][] = [[560, 120], [400, 330], [280, 470], [150, 560]]; // from the boat at screen right, clear of his head
  p.band(Y([[30, 585], [175, 700]]), "#2a2a30", 34, 6); // the jacket's shoulder strap under the grip
  g.lineCap = "round"; g.lineJoin = "round"; p.path(Y(sleeve), false); g.strokeStyle = INK; g.lineWidth = 132; g.stroke();
  p.path(Y(sleeve), false); g.strokeStyle = NAVY; g.lineWidth = 116; g.stroke();
  p.path(Y(sleeve.map(([x, y]) => [x + 30, y - 10])), false); g.strokeStyle = "#1f2a44"; g.lineWidth = 34; g.stroke(); // shadow side
  p.path(Y(sleeve.map(([x, y]) => [x - 26, y - 10])), false); g.strokeStyle = "#41527a"; g.lineWidth = 12; g.stroke(); // lit edge
  p.band(Y([[200, 440], [270, 560]]), "#e8e4d0", 30, 6); // reflective band
  p.band(Y([[150, 500], [205, 600]]), "#1f2a44", 26, 6); // cuff
  p.ell(110, 612 + O, 66, 54, GL, 9); p.arc(96, 596 + O, 44, 34, 200, 300, 9, "#6c7482"); // back of the glove + its sheen
  for (let i = 0; i < 4; i++) p.ell(52 + i * 30, 662 - i * 8 + O, 18, 22, GL, 7); // four fingers curled over the strap
  p.ell(168, 640 + O, 20, 30, GL, 7, 0, 360, -30); // thumb
};
/** cell bars seen from outside: four dark round bars, lit edge, the face sits between the middle two */
const BARS = (p: Pen) => { for (const x of [50, 180, 380, 510]) { p.g.fillStyle = "#14171e"; p.g.fillRect(x - 11, 0, 22, 1200); p.g.fillStyle = "#3a414e"; p.g.fillRect(x - 7, 0, 4, 1200); } };
const STREAK: V3 = [-501.35, 1.75, 1.74]; // on the hull face, behind his roller
/** wet paint: a lighter band of fresh navy, ragged ends, a gloss streak; k = how far the coat has got */
const paintStreak = (p: Pen, k: number) => { const top = 300 - 30 - 240 * (0.3 + 0.7 * k);
  p.g.fillStyle = "#56699a"; p.g.beginPath(); p.g.moveTo(40, 290); p.g.lineTo(160, 290); p.g.lineTo(165, top + 10); p.g.lineTo(130, top); p.g.lineTo(100, top + 14); p.g.lineTo(70, top); p.g.lineTo(36, top + 12); p.g.closePath(); p.g.fill();
  p.g.fillStyle = "rgba(220,235,255,0.55)"; p.g.fillRect(60, top + 20, 10, 260 - top); };
const dark = (out: Stage, id: number, t: number, a: number) => { // a full-frame dark card just before the lens: the lamp fizzing out / the deep
  if (a <= 0) return; const c = camAt(id, Math.round(t * 30)), f = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]], n = Math.hypot(f[0], f[1], f[2]), d = 0.5, h = 2 * d * Math.tan((c.fov * Math.PI) / 360) * 1.2, k = q(a, 12);
  out.fx.push({ key: `dark|${k}`, cw: 16, ch: 16, soft: true, draw: (p) => { p.g.fillStyle = `rgba(12,18,40,${k})`; p.g.fillRect(0, 0, 16, 16); }, x: c.pos[0] + (f[0] / n) * d, y: c.pos[1] + (f[1] / n) * d, z: c.pos[2] + (f[2] / n) * d, w: h, h, noFog: true });
};
const flash = (out: Stage, id: number, t: number, a: number, col = "255,246,220") => {
  if (a <= 0) return; const c = camAt(id, Math.round(t * 30)), f = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]], n = Math.hypot(f[0], f[1], f[2]), d = 0.6, h = 2 * d * Math.tan((c.fov * Math.PI) / 360) * 1.2, k = q(a, 12);
  out.fx.push({ key: `flash|${k}`, cw: 16, ch: 16, soft: true, draw: (p) => { p.g.fillStyle = `rgba(${col},${k})`; p.g.fillRect(0, 0, 16, 16); }, x: c.pos[0] + (f[0] / n) * d, y: c.pos[1] + (f[1] / n) * d, z: c.pos[2] + (f[2] / n) * d, w: h, h, noFog: true });
};

const SEA: Record<number, [string, string]> = { 1: ["#163e5e", "255,226,200"], 10: ["#0a1430", "232,238,255"], 12: ["#0a1430", "232,238,255"], 13: ["#0a1430", "232,238,255"], 17: ["#0e3150", "255,228,180"] };
const glint = (col: string) => (p: Pen) => { for (let i = 0; i < 170; i++) { const s = (seedR(i + 400) - 0.5) * (0.3 + seedR(i + 800)), w = 8 + 36 * seedR(i + 1200);
  p.g.fillStyle = `rgba(${col},${0.6 + 0.4 * seedR(i + 1600)})`; p.g.fillRect(64 + s * 110 - w / 2, seedR(i) * 512, w, 3 + 5 * seedR(i + 2000)); } };
const foam = (p: Pen) => { for (let i = 0; i < 60; i++) { const x = seedR(i) * 512, w = 20 + 60 * seedR(i + 99); p.g.fillStyle = `rgba(240,248,255,${0.5 + 0.5 * (x / 512)})`; p.g.fillRect(x - w / 2, 32 - (8 + 20 * x / 512) * (seedR(i + 7) - 0.5) * 2, w, 4 + 4 * seedR(i + 3)); } };
const shaft = (p: Pen) => { const g = p.g.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, "rgba(220,250,255,0.85)"); g.addColorStop(1, "rgba(200,240,255,0)"); p.g.fillStyle = g; p.g.fillRect(8, 0, 48, 256); };
export const fx = (id: number, t: number, out: Stage) => {
  const [a, b] = sec(id);
  if (id === 2 || id === 26) { const y = lift(t, id === 2 ? 4.2 : 73.2), g = clamp01((t - (id === 2 ? 4.0 : 73.0)) / 0.3);
    if (g > 0) out.fx.push({ key: "rescue_arm", cw: 480, ch: 1440, draw: RESCUE_ARM, x: X(ARM_X), y: y + ARM_Y + 0.3 * (1 - g), z: 30.25, w: 0.8, h: 2.4 }); }
  if (id === 3) { const k = clamp01((t - 7.2) / 2.0); // the fresh coat on the hull, growing behind the roller's strokes
    out.fx.push({ key: `paint|${q(k, 10)}`, cw: 200, ch: 300, draw: (p) => paintStreak(p, q(k, 10)), x: X(STREAK[0]), y: STREAK[1], z: STREAK[2], w: 0.5, h: 0.75, face: [0, 0, 1] }); }
  if (id === 4) { const k = ease((t - BEATS.patch) / 0.15); if (k > 0) out.fx.push({ key: "patch", cw: 300, ch: 220, draw: patch, x: X(-501.9), y: 1.5, z: 1.72, w: 0.8 * k, h: 0.6 * k, face: [0, 0, 1] }); }
  if (id === 5) { // the pipe's fumes: two pale puffs, slow
    const x = subX(5, t) - 5.5; for (let i = 0; i < 2; i++) { const v = (t * 0.35 + i / 2) % 1, u = q(v, 6); out.fx.push({ key: `puff|${u}`, cw: 300, ch: 300, soft: true, draw: (p) => fxPuff(p, u), x: X(x - 1.5 * v), y: 1.3 + 1.2 * v, z: 0, w: 0.6 + 1.4 * v, h: 0.6 + 1.4 * v }); } }
  if (id === 6) {
    for (let i = 0; i < 3; i++) { const v = (t * 0.25 + i / 3) % 1, u = q(v, 6); out.fx.push({ key: `fume|${u}`, cw: 300, ch: 300, soft: true, draw: (p) => fxPuff(p, u), x: X(C - 1.5 + 4 * v), y: 1.7 + 0.2 * v, z: -0.9, w: 0.8 + v, h: 0.6 + 0.6 * v }); } }
  if (id === 7) { const k = clamp01((t - BEATS.gauge) / 0.45); out.fx.push({ key: "gauge", cw: 200, ch: 200, draw: gauge, x: X(C - 3.0), y: 1.25 - 1.1 * k * k, z: -1.3 + 0.1 * k, w: 0.3, h: 0.3, rot: q(k * 2.2, 12), face: k > 0 ? undefined : [0, 0, 1] }); }
  if (id === 8) out.fx.push({ key: "jackets4", cw: 520, ch: 400, draw: jackets4, x: X(C + 2.0), y: 1.1, z: -1.0, w: 0.95, h: 0.73 });
  if (id === 9) out.fx.push({ key: "jackets4", cw: 520, ch: 400, draw: jackets4, x: X(C + 2.0), y: 1.1, z: -1.0, w: 0.95, h: 0.73 });
  if (id === 10) { const x = subX(10, t); for (let i = 0; i < 9; i++) { const d = 6 + i * 6; out.fx.push({ key: "wake", cw: 128, ch: 64, soft: true, draw: (p) => { p.g.fillStyle = "rgba(225,235,255,0.85)"; p.g.fillRect(0, 22, 128, 20); }, x: X(x - 9 - d), y: 0.9, z: 0, w: 6.5, h: 1.2 + i * 0.5, flat: true, rot: 0, noFog: true }); } }
  if (id === 11) { const cx = cutterX(t), s = 0.75 + 0.25 * Math.sin(t * 3), on = ease((t - 33.2) / 0.4);
    out.fx.push({ key: `search|${q(s, 8)}`, cw: 256, ch: 256, soft: true, draw: (p) => glow(p, 256, [[0, "rgba(255,255,240,1)"], [0.25, `rgba(240,245,255,${0.6 * s})`], [1, "rgba(200,220,255,0)"]]), x: X(cx - 5.4), y: 10.6, z: 0, w: 7, h: 7, noFog: true });
    flash(out, id, t, 0.75 * on, "235,240,255"); }
  if (id === 12) { const x = subX(12, t); 
    for (let i = 0; i < 4; i++) { const v = (t * 1.2 + i / 4) % 1, u = q(v, 6); out.fx.push({ key: `spray|${u}`, cw: 300, ch: 300, soft: true, draw: (p) => fxPuff(p, u), x: X(x + 3.5 - 4 * v), y: 0.4 + 0.8 * v, z: i % 2 ? 6.6 : 3.6, w: 1 + 1.5 * v, h: 0.8 + v }); } }
  if (id === 13) { const k = clamp01((t - BEATS.land + 0.1) / 0.7); if (k > 0 && k < 1) for (let i = 0; i < 5; i++) out.fx.push({ key: `spray|${q(k, 6)}`, cw: 300, ch: 300, soft: true, draw: (p) => fxPuff(p, q(k, 6)), x: X(subX(13, t) + 0.5 + (i - 2) * 0.45), y: 0.2 + 0.9 * k, z: 0.4 - 0.3 * (i % 2), w: 1.2 + 1.6 * k, h: 0.9 + 1.2 * k, noFog: true }); }
  if (id === 14) for (const bt of [BEATS.bang1, BEATS.bang2, BEATS.bang3]) { const k = (t - bt) / 0.9; if (k < 0 || k > 1) continue; for (let i = 0; i < 4; i++) out.fx.push({ key: "dust", cw: 64, ch: 64, draw: (p) => p.ell(32, 32, 26, 26, "#c9b89a", 0), x: X(C - 1.9 + (seedR(i + bt) - 0.5) * 0.6), y: 2.05 - 1.4 * k * k - 0.1 * i, z: (seedR(i * 3 + bt) - 0.5) * 0.5, w: 0.04, h: 0.04 }); }
  if (id === 15) { const k = ease((t - 43.45) / 0.8); out.fx.push({ key: "valve", cw: 300, ch: 300, draw: valve, x: X(C + 1.0), y: 0.6, z: -1.07, w: 0.42, h: 0.42, rot: q(k * Math.PI * 1.0, 24), face: [0, 0, 1] }); }
  if (id === 16) { for (let i = 0; i < 4; i++) { const k = (t - 45.4 - i * 0.1) / 1.2; if (k < 0 || k > 1) continue; out.fx.push({ key: "plastic", cw: 128, ch: 128, soft: true, draw: (p) => { p.poly([[10, 30], [118, 10], [110, 110], [20, 100]], "rgba(235,245,255,0.5)", 4); p.stroke([[30, 40], [80, 30]], 8, "rgba(255,255,255,0.9)"); }, x: X(C + 0.5 + (seedR(i) - 0.5) * 1.6 * k), y: 1.4 + 0.7 * k - k * k, z: -0.1, w: 0.3, h: 0.3, rot: q(k * 4 + i, 12) }); }
    dark(out, id, t, 0.85 * ease((t - 46.3) / 0.6) + (t > 46.0 && t < 46.3 ? 0.4 * (Math.sin(t * 60) > 0 ? 1 : 0) : 0)); }
  if ([6, 7, 9, 14, 16].includes(id)) { const off = id === 16 ? 1 - ease((t - 46.1) / 0.3) : 1; if (off > 0.02) out.fx.push({ key: `lamp|${q(off, 8)}`, cw: 256, ch: 256, soft: true, draw: (p) => glow(p, 256, [[0, `rgba(255,240,200,${off})`], [0.2, `rgba(255,200,120,${0.6 * off})`], [1, "rgba(255,180,90,0)"]]), x: X(C), y: 2.0, z: 1.0, w: 0.55, h: 0.55, noFog: true }); }
  if (id === 12 || id === 13) { const x = subX(id, t) + 46, l = 5.4, a2 = -2.2, s = 0.8 + 0.2 * Math.sin(t * 4); // the cutter's searchlight behind the chase
    out.fx.push({ key: `search|${q(s, 8)}`, cw: 256, ch: 256, soft: true, draw: (p) => glow(p, 256, [[0, "rgba(255,255,240,1)"], [0.25, `rgba(240,245,255,${0.6 * s})`], [1, "rgba(200,220,255,0)"]]), x: X(x + l * Math.sin(a2)), y: 10.6, z: -38 + l * Math.cos(a2), w: 9, h: 9, noFog: true }); }
  if (id === 17) for (const [x, z] of [[0, 0], [2.8, 2.2], [-2.6, 2.6], [1.2, -2.8]] as number[][]) out.fx.push({ key: "ring", cw: 128, ch: 128, soft: true, draw: (p) => p.arc(64, 64, 52, 52, 0, 360, 14, "rgba(240,250,255,0.9)"), x: X(x), y: 0.55, z, w: 2.6, h: 2.6, flat: true, rot: 0 });
  if (id === 18) dark(out, id, t, 0.55 * ease((t - 54.0) / 1.8));
  if (id === 19) out.fx.push({ key: "evbag", cw: 300, ch: 380, draw: evBag, x: X(-12.75), y: DECK_Y + 0.63, z: -201.3, w: 0.26, h: 0.33 }); // on the table, below him in frame
  if (id === 20) out.fx.push({ key: "evbag", cw: 300, ch: 380, draw: evBag, x: X(-12.7), y: DECK_Y + 0.66, z: -201.05, w: 0.3, h: 0.38 });
  if (id === 20) out.fx.push({ key: "scale", cw: 400, ch: 240, draw: scale, x: X(-12.85), y: DECK_Y + 0.6, z: -201.0, w: 0.4, h: 0.24 });
  if (id === 23) out.fx.push({ key: "jacket1", cw: 360, ch: 300, draw: jacket1, x: X(-318), y: 2.1, z: 61.75, w: 0.62, h: 0.52, face: [0.45, 0.6, 0.66] }); // lying back on the crate lid
  if (id === 25) { out.fx.push({ key: "page2008", cw: 400, ch: 520, draw: page2008, x: X(-450), y: 1.47, z: -208, w: 0.46, h: 0.6, flat: true, rot: 0 });
    out.fx.push({ key: "flag", cw: 400, ch: 250, draw: flag, x: X(-468.4), y: 11.0, z: -238, w: 3.2, h: 2.0, face: [0, 0, 1] }); }
  if (id === 28) out.fx.push({ key: "bars", cw: 560, ch: 1200, draw: BARS, x: X(C), y: 1.3, z: 4.4, w: 1.4, h: 3.0, face: [0, 0, 1] }); // the near dark: cell bars
  // round 2 values: night / dawn sea = deep water + a glint band toward the far water; foam behind the chase; lamp pool on the valve; shafts in the deep
  const sea = SEA[id];
  if (sea) { const c = camAt(id, Math.round((a + b) * 15)), // frozen at mid-shot: a glint that follows the lens boils
    dx = c.look[0] - c.pos[0], dz = c.look[2] - c.pos[2], n = Math.hypot(dx, dz) || 1, lo = c.pos[1] < 12, far = lo ? 75 : 0;
    out.fx.push({ key: `deep|${sea[0]}`, cw: 16, ch: 16, draw: (p) => { p.g.fillStyle = sea[0]; p.g.fillRect(0, 0, 16, 16); }, x: c.pos[0], y: 0.15, z: c.pos[2], w: 1400, h: 1400, flat: true, rot: 0 });
    out.fx.push({ key: `glint|${sea[1]}`, cw: 128, ch: 512, soft: true, draw: glint(sea[1]), x: c.look[0] + (dx / n) * far, y: 0.2, z: c.look[2] + (dz / n) * far, w: lo ? 10 : 18, h: lo ? 140 : 90, flat: true, rot: Math.atan2(-dx, -dz), noFog: true }); }
  if (id === 12 || id === 13) for (const z of [0, 5]) out.fx.push({ key: "foam", cw: 512, ch: 64, soft: true, draw: foam, x: X(subX(id, t) - 7.5), y: 0.25, z, w: 14, h: 2.6, flat: true, rot: 0, noFog: true });
  if (id === 17) for (const [x, z, r] of [[13, 8, -2.4], [-12, 10, 2.2], [-8, -42, 0.25]] as number[][]) out.fx.push({ key: "foam", cw: 512, ch: 64, soft: true, draw: foam, x: X(x - 6 * Math.sin(r + Math.PI / 2)), y: 0.25, z: z - 6 * Math.cos(r + Math.PI / 2), w: 12, h: 2.4, flat: true, rot: r, noFog: true });
  if (id === 15) { out.fx.push({ key: "pool", cw: 256, ch: 256, soft: true, draw: (p) => glow(p, 256, [[0, "rgba(255,236,190,1)"], [0.45, "rgba(255,200,130,0.75)"], [1, "rgba(255,170,90,0)"]]), x: X(C + 1.05), y: 0.75, z: -1.3, w: 1.6, h: 1.6, face: [0, 0, 1], noFog: true });
    out.fx.push({ key: "pipe", cw: 16, ch: 64, draw: (p) => { p.g.fillStyle = "#14171e"; p.g.fillRect(0, 0, 16, 64); }, x: X(C + 0.72), y: 0.8, z: -0.6, w: 0.11, h: 2.2, face: [0, 0, 1] }); }
  if (id === 18) { const s = subAt(18, t)!; for (let i = 0; i < 4; i++) out.fx.push({ key: "shaft", cw: 64, ch: 256, soft: true, draw: shaft, x: X(691 + i * 4), y: s.y + 6, z: 9 - i * 3, w: 1.4 + 0.5 * (i % 2), h: 26, rot: 0.28, noFog: true }); }
  void a; void b; void ez;
};
