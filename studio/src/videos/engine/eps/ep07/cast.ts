// What If ep07 acting: you shrink to 1 cm with a wrist dial. Timed to the voice words, plus the shot fx (the dial, the
// clock, the thermometer, the falling drop, the sound meter, the cat's head and paw, the sandwich).
import { Pen, Outfit, FrontOpts, INK, POSES, fxBurst, fxExclaim, fxPuff, fxSplash, fxCreak } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, q, pop } from "../../act";
import { YOU } from "../people";
import { SHOTS } from "./story";
import words from "./words";

const set = (id: number) => SETS[SHOTS[id - 1].set];
const L = (id: number, [x, y, z]: V3): V3 => { const o = set(id).origin; return [o[0] + x, o[1] + y, o[2] + z]; };
/** start of the first spoken `text` at or after `from` seconds */
const word = (text: string, from = 0) => {
  const hit = words.find((w) => w.start >= from - 0.01 && w.text.replace(/[^A-Za-z0-9']/g, "").toLowerCase() === text.toLowerCase());
  if (!hit) throw new Error(`Missing cast beat word: ${text} after ${from}`);
  return hit.start;
};
export const wearAt = (_t: number) => 0;

type Pose = FrontOpts["reach"];
const ease = (x: number) => { const k = clamp01(x); return k * k * (3 - 2 * k); };
/** the dial readout: 170 cm -> 1 cm on a log scale (k 0..1) */
const cmAt = (k: number) => Math.max(1, Math.round(Math.exp(Math.log(170) * (1 - clamp01(k)))));
const MOUTH: Pose = [{ ex: -10, ey: 0.15, hx: 24, hy: -0.3, front: true }, { ex: 10, ey: 0.15, hx: -24, hy: -0.3, front: true }]; // both hands bring the sandwich up
const PUSH: Pose = [{ ex: -26, ey: -0.25, hx: -30, hy: -0.75, front: true }, { ex: 26, ey: -0.25, hx: 30, hy: -0.75, front: true }]; // shoving the drop up

// set-local marks
const EDGE: V3 = [-0.8, 0, 3.45];      // counter: on the cliff edge (front face at z 3.85)
const MID: V3 = [0, 0, 0];             // counter: open tiles, the mug tower behind
const CRUMB: V3 = [-0.8, 0, -0.1];     // counter: beside the crumb boulder
const DRIP: V3 = [3.2, 0, -1.9];       // counter: in the puddle under the tap
const LAND: V3 = [0.6, 0, 0.8];        // floor
const CATSIDE: V3 = [1.0, 0, 0.8];     // floor, the cat shot
const KIT: V3 = [0.3, 0, -0.9];        // kitchen

/** a size change as a run of short acts (Act.scale is fixed per act): scale s(t) over [t0, t1], held outside */
const grow = (id: number, at: V3, t0: number, t1: number, s0: number, s1: number, base: Partial<Act> & Pick<Act, "expr">, steps = 36): Act[] => {
  const ta = SHOTS[id - 1].a / 30 - 0.1, tb = SHOTS[id - 1].b / 30 + 0.1;
  return Array.from({ length: steps + 2 }, (_, n) => {
    const lo = n === 0 ? ta : t0 + ((t1 - t0) * (n - 1)) / steps, hi = n === steps + 1 ? tb : t0 + ((t1 - t0) * n) / steps;
    const k = n === 0 ? 0 : n === steps + 1 ? 1 : (n - 0.5) / steps, s = s0 * Math.pow(s1 / s0, ease(k));
    return { i: 0, o: YOU, at: L(id, at), mode: "stand" as const, ...base, scale: s, path: (t: number) => (t >= lo && t < hi ? L(id, at) : null) };
  });
};

const ACTS = (id: number): Act[] => {
  switch (id) {
    case 1: return [{ i: 0, o: YOU, at: L(1, EDGE), mode: "stand", expr: [[0, "curious"], [word("fall") - LEAD, "worried"]],
      lookY: (t) => (t > 1.6 ? 1 : 0.3), head: (t) => (t > 1.6 ? 6 : 0), look: 0.3, reach: () => POSES.hold_out }];
    case 2: { const t0 = word("turn"), t1 = word("tall") - 0.15;
      return grow(2, MID, t0, t1, 2.2, 1, { expr: [[0, "curious"], [t0 - LEAD, "excited"]], reach: () => POSES.hold_out, look: -0.3 }); }
    case 3: { const off = word("off") + 0.25;
      return [
        { i: 0, o: YOU, at: L(3, [0.0, 0, 2.5]), mode: "stroll", phase: (t) => t * 1.7, expr: [[0, "confident"]], face: 1,
          path: (t) => (t < off ? L(3, [-0.2 + 0.75 * clamp01((t - 10.6) / (off - 10.6)), 0, 2.5 + 1.2 * clamp01((t - 10.6) / (off - 10.6))]) : null) },
        { i: 0, o: YOU, at: L(3, [0.55, 0, 4.2]), mode: "fall", expr: [[0, "whistle"]], noShadow: true,
          path: (t) => (t >= off ? L(3, [0.55 + 0.25 * (t - off), -1.1 * (t - off) ** 1.6, 3.7 + Math.min(0.7, 2 * (t - off))]) : null) },
      ]; }
    case 4: { const land = word("land", 14.5);
      return [
        { i: 0, o: YOU, at: L(4, LAND), mode: "fall", expr: [[0, "whistle"]], noShadow: true,
          path: (t) => { if (t >= land) return null; const u = (land - t) / (land - 13.0); return L(4, [LAND[0] + 0.45 * Math.sin(t * 3.1), 4.6 * u, LAND[2]]); } },
        { i: 0, o: YOU, at: L(4, LAND), mode: "stand", expr: [[0, "relief"], [word("without") - LEAD, "proud"]],
          reach: (t) => (t > word("without") - 0.2 ? POSES.hands_up : undefined), path: (t) => (t >= land ? L(4, LAND) : null) },
      ]; }
    case 9: return [{ i: 0, o: YOU, at: L(9, CRUMB), mode: "stand", expr: [[0, "tired"], [word("cold") - LEAD, "scared"]],
      reach: () => POSES.arms_crossed, tilt: (t) => 1.6 * Math.sin(t * 47), head: (t) => 2 * Math.sin(t * 31) }];
    case 10: return [{ i: 0, o: YOU, at: L(10, DRIP), mode: "stand", expr: [[0, "curious"], [word("drips") - LEAD, "shock"]], lookY: () => -1 }];
    case 11: return [{ i: 0, o: YOU, at: L(11, DRIP), mode: "stand", expr: [[0, "pained"], ...pop("pained", word("can't", 48.5) - 0.1, "cringe", 0.7)],
      reach: () => PUSH, tilt: (t) => 3 * Math.sin(t * 9), head: (t) => 3 * Math.sin(t * 7) }];
    case 12: return [{ i: 0, o: YOU, at: L(12, LAND), mode: "stand", expr: [[0, "shock"], [word("grownups", 54) - LEAD, "confused"]],
      reach: (t) => (t < word("grownups", 54) - 0.2 ? POSES.hands_up : POSES.shrug), lookY: () => -0.4 }];
    case 13: return [{ i: 0, o: YOU, at: L(13, CATSIDE), mode: "stand", expr: [[0, "scared"], [word("interested") - LEAD, "shook"]],
      look: (t) => (t > word("cat", 56.5) ? 0.8 : 0), reach: (t) => (t > word("interested") - 0.2 ? POSES.cover_mouth : undefined), tilt: (t) => (t > word("interested") ? 1.2 * Math.sin(t * 40) : 0) }];
    case 14: { const t0 = word("spin") + 0.2, t1 = word("full") - 0.3;
      return grow(14, LAND, t0, t1, 1, 3.4, { expr: [[0, "excited"]], reach: () => POSES.hold_out }); }
    case 15: { const bite = word("lunch", 64.5) - 0.25;
      return [{ i: 0, o: YOU, at: L(15, KIT), mode: "stand", expr: [[0, "excited"], [bite, "laugh"]], reach: (t) => (t > bite ? MOUTH : POSES.clap) }]; }
    case 16: return [{ i: 0, o: YOU, at: L(16, KIT), mode: "stand", expr: [[0, "sly"], [word("dare") - LEAD, "smirk_wink"]], reach: () => POSES.hold_out, look: -0.5 }];
    default: return [];
  }
};
export const acts = ACTS;

// ---------------- fx drawings ----------------
const popIn = (t: number, t0: number) => clamp01((t - t0) / 0.12) * (1 + 0.15 * Math.sin(clamp01((t - t0) / 0.3) * Math.PI));
const text = (p: Pen, s: string, x: number, y: number, px: number, col: string, stroke = INK) => {
  const g = p.g; g.save(); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${px}px "Arial Black", Arial, sans-serif`;
  g.lineJoin = "round"; g.lineWidth = px * 0.16; g.strokeStyle = stroke; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); g.restore();
};
const panel = (p: Pen, x0: number, y0: number, x1: number, y1: number, fill: string, ol = 8) => {
  const r = 26; p.poly([[x0 + r, y0], [x1 - r, y0], [x1, y0 + r], [x1, y1 - r], [x1 - r, y1], [x0 + r, y1], [x0, y1 - r], [x0, y0 + r]], fill, ol);
};
const rad = (d: number) => (d * Math.PI) / 180;
/** the wrist dial, 420 x 460: strap, steel bezel, ticks, a red pointer (log scale) and the readout */
const dial = (p: Pen, cm: number | "?", spin = 0) => {
  panel(p, 150, 6, 270, 454, "#2b2f3a", 7);
  p.ell(210, 210, 160, 160, "#c9d3df", 8); p.ell(210, 210, 132, 132, "#16325c", 6);
  for (let i = 0; i <= 12; i++) { const a = rad(140 + (260 * i) / 12); p.stroke([[210 + 108 * Math.cos(a), 210 + 108 * Math.sin(a)], [210 + 124 * Math.cos(a), 210 + 124 * Math.sin(a)]], i % 3 ? 5 : 10, "#dfe9f7"); }
  const k = cm === "?" ? 0.5 + 0.4 * Math.sin(spin) : Math.log(cm) / Math.log(170), a = rad(140 + 260 * k);
  p.line([[210, 210], [210 + 96 * Math.cos(a), 210 + 96 * Math.sin(a)]], "#ff5a4f", 12);
  p.ell(210, 210, 20, 20, "#ffd23f", 6);
  panel(p, 70, 300, 350, 400, "#0b1a33", 6);
  text(p, cm === "?" ? "? CM" : `${cm} CM`, 210, 352, 58, cm === 1 ? "#2ee86a" : "#ffd23f", "#0b1a33");
};
/** a wall clock face, 300 x 300; h = hours on a 12 h face (12 = straight up) */
const clock = (p: Pen, h: number, lunch: boolean) => {
  p.ell(150, 150, 138, 138, "#f4f1ea", 9);
  for (let i = 0; i < 12; i++) { const a = rad(i * 30 - 90); p.stroke([[150 + 108 * Math.cos(a), 150 + 108 * Math.sin(a)], [150 + 126 * Math.cos(a), 150 + 126 * Math.sin(a)]], i % 3 ? 5 : 11, INK); }
  const ah = rad(h * 30 - 90), am = rad((h % 1) * 360 - 90);
  p.stroke([[150, 150], [150 + 62 * Math.cos(ah), 150 + 62 * Math.sin(ah)]], 15, INK);
  p.stroke([[150, 150], [150 + 100 * Math.cos(am), 150 + 100 * Math.sin(am)]], 9, "#ff3b30");
  p.dot(150, 150, 12, INK);
  if (lunch) { p.stroke([[118, 52], [118, 96]], 7, "#c63939"); for (const dx of [-8, 0, 8]) p.stroke([[118 + dx, 40], [118 + dx, 56]], 4, "#c63939"); p.stroke([[182, 40], [182, 96]], 8, "#c63939"); }
};
/** thermometer, 220 x 560; k 0..1 = warm .. frozen */
const thermo = (p: Pen, k: number) => {
  const fill = k > 0.6 ? "#ff5a4f" : k > 0.3 ? "#ffd23f" : "#5ce1ff";
  panel(p, 60, 20, 160, 450, "#f4f1ea", 8); p.ell(110, 470, 70, 70, "#f4f1ea", 8);
  p.ell(110, 470, 50, 50, fill, 0); p.poly([[92, 450], [128, 450], [128, 440 - 380 * k], [92, 440 - 380 * k]], fill, 0);
  for (let i = 0; i < 6; i++) p.stroke([[132, 80 + i * 64], [150, 80 + i * 64]], 5, INK);
  if (k < 0.3) for (const [x, y] of [[30, 120], [190, 220], [36, 330]] as const) for (let i = 0; i < 3; i++) { const a = rad(i * 60); p.stroke([[x - 22 * Math.cos(a), y - 22 * Math.sin(a)], [x + 22 * Math.cos(a), y + 22 * Math.sin(a)]], 6, "#dff6ff"); }
};
/** a water drop (teardrop), 400 x 520 */
const drop = (p: Pen) => {
  p.poly([[200, 20], [330, 270], [350, 340], ...Array.from({ length: 25 }, (_, i) => { const a = rad(i * 7.5); return [200 + 150 * Math.cos(a), 340 + 150 * Math.sin(a)] as [number, number]; }), [50, 340], [70, 270]], "#7fd0f0", 9);
  p.ell(145, 320, 26, 50, "#e8fbff", 0, 0, 360, 20); p.ell(170, 230, 12, 20, "#e8fbff", 0);
};
/** the drop wrapped round you, 700 x 680, drawn see-through (soft card); w = wobble -1..1 */
const blob = (p: Pen, w: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 64; i++) { const a = (i / 64) * Math.PI * 2, r = 1 + 0.04 * Math.sin(a * 3 + w * 3) + 0.03 * w * Math.cos(a * 2); pts.push([350 + 300 * r * Math.cos(a), 360 + 300 * r * Math.sin(a) * (a > Math.PI ? 1.02 : 0.95)]); }
  p.poly(pts, "rgba(110,200,240,0.42)", 10);
  p.arc(350, 360, 250, 250, 200, 250, 16, "rgba(255,255,255,0.85)"); p.ell(250, 190, 26, 18, "rgba(255,255,255,0.9)", 0);
  p.arc(350, 370, 270, 260, 20, 70, 10, "rgba(40,120,170,0.55)");
};
/** a leaf, 260 x 260; a = sway angle in degrees */
const leaf = (p: Pen, a: number) => {
  p.rot = [rad(a), 130, 130];
  p.poly([[130, 20], [200, 80], [210, 150], [130, 240], [50, 150], [60, 80]], "#7cc35a", 7);
  p.stroke([[130, 30], [130, 235]], 6, "#3f7a35");
  p.rot = null;
};
/** the pitch meter, 360 x 760: a bar that jumps past the HUMAN EARS line; k 0..1 */
const meter = (p: Pen, k: number) => {
  panel(p, 10, 10, 350, 750, "#16325c", 8);
  text(p, "PITCH", 180, 62, 50, "#ffffff", "#16325c");
  panel(p, 120, 110, 240, 700, "#2b2f3a", 6);
  const top = 695 - 580 * k, line = 330;
  if (k > 0.01) panel(p, 126, Math.min(top, 680), 234, 694, top < line ? "#ff5a4f" : "#2ee86a", 0);
  p.stroke([[30, line], [330, line]], 12, "#ffd23f");
  text(p, "HUMAN", 180, line - 52, 44, "#ffd23f", "#16325c"); text(p, "EARS", 180, line + 46, 44, "#ffd23f", "#16325c");
  if (top < line) { p.stroke([[262, 140], [322, 200]], 14, "#ff5a4f"); p.stroke([[322, 140], [262, 200]], 14, "#ff5a4f"); }
};
/** speech bubble with a tiny squeaky "help!", 460 x 300 */
const help = (p: Pen) => {
  p.poly([[60, 40], [420, 40], [440, 60], [440, 200], [420, 220], [140, 220], [70, 285], [96, 220], [60, 220], [40, 200], [40, 60]], "#ffffff", 8);
  text(p, "help!", 240, 130, 72, "#16325c", "#ffffff");
};
/** high-pitch sound rings, 300 x 300, u 0..1 */
const squeak = (p: Pen, u: number) => { for (let k = 0; k < 3; k++) { const r = 40 + 110 * ((u + k / 3) % 1); p.arc(40, 150, r, r, -40, 40, 9, "#ffffff"); } };
/** a giant ginger cat's head and shoulders, 1200 x 1200, cropped by the frame edge in the shot; open 0..1, px = pupil shift, slit = pupil width */
const catHead = (p: Pen, open: number, px: number, slit: number) => {
  const FUR = "#e8a23c", DARK = "#c0702a", CREAM = "#f8e6c4";
  p.ell(600, 1290, 640, 470, FUR, 12); // shoulders, cut by the card's bottom on the floor
  for (const x of [230, 970]) { const d = x < 600 ? -1 : 1;
    p.poly([[x - 170, 330], [x + d * 90, 20], [x + 170, 280]], FUR, 12);
    p.poly([[x - 90, 300], [x + d * 80, 100], [x + 90, 270]], "#f4a8b4", 0); }
  p.ell(600, 540, 530, 420, FUR, 12);
  for (const x of [510, 600, 690]) p.stroke([[x, 130], [x + (x - 600) * 0.25, 290]], 30, DARK); // forehead stripes
  for (const [x0, y0, x1, y1] of [[85, 520, 210, 540], [100, 640, 225, 630], [1115, 520, 990, 540], [1100, 640, 975, 630]]) p.stroke([[x0, y0], [x1, y1]], 30, DARK);
  p.ell(600, 740, 240, 170, CREAM, 0); // muzzle
  p.poly([[555, 650], [645, 650], [600, 705]], "#ef7f96", 8);
  p.stroke([[600, 705], [600, 770]], 10, INK);
  p.arc(540, 770, 60, 50, 10, 170, 10, INK); p.arc(660, 770, 60, 50, 10, 170, 10, INK);
  for (const d of [-1, 1]) for (const [y0, y1] of [[720, 680], [760, 770], [800, 860]]) p.stroke([[600 + d * 210, y0], [600 + d * 520, y1]], 7, INK); // whiskers
  for (const cx of [340, 860]) {
    const cy = 480, h = 125 * open;
    if (open < 0.06) { p.arc(cx, cy - 20, 150, 40, 15, 165, 14, INK); continue; }
    p.ell(cx, cy, 165, h, "#c8e04a", 12);
    p.clip(Array.from({ length: 48 }, (_, i) => { const a = (i / 48) * Math.PI * 2; return [cx + 165 * Math.cos(a), cy + h * Math.sin(a)] as [number, number]; }), () => {
      p.ell(cx + px * 80, cy, slit * 0.65, 135, INK, 0);
      p.ell(cx - 20 + px * 80 - slit * 0.2, cy - 45, 15, 20, "#ffffff", 0);
    });
  }
};
/** the paw, 1700 x 460: ginger, pink toe beans, claws out */
const paw = (p: Pen) => {
  p.poly([[1700, 120], [260, 90], [120, 140], [60, 240], [110, 360], [260, 400], [1700, 390]], "#e8a23c", 10); // the arm runs past the frame edge
  for (const [x, y] of [[110, 170], [80, 250], [120, 330]] as const) p.stroke([[x, y], [x - 50, y - 6]], 10, "#ffffff");
  for (const [x, y] of [[180, 160], [150, 245], [190, 325]] as const) p.ell(x, y, 30, 36, "#f7a6c4", 6);
  p.ell(290, 245, 60, 80, "#f7a6c4", 6);
  for (const y of [180, 300]) p.stroke([[420, y], [560, y + 10]], 14, "#b86a2a");
};
/** a sandwich bigger than your head, 560 x 420 */
const sandwich = (p: Pen) => {
  p.poly([[40, 250], [520, 250], [540, 300], [500, 360], [60, 360], [20, 300]], "#e6b56a", 8);
  p.poly([[30, 215], [530, 215], [545, 250], [15, 250]], "#7cc35a", 7);
  p.poly([[50, 190], [510, 190], [520, 220], [40, 220]], "#ff5a4f", 7);
  p.poly([[30, 160], [530, 160], [500, 200], [60, 200]], "#ffd23f", 7);
  p.poly([[40, 160], [80, 60], [280, 30], [480, 60], [520, 160]], "#e6b56a", 8);
  for (const [x, y] of [[180, 100], [280, 80], [380, 110]] as const) p.ell(x, y, 8, 5, "#f6e3b4", 0);
};

export const fx = (id: number, t: number, out: Stage) => {
  const burst = (key: string, t0: number, dur: number, draw: (p: Pen, u: number) => void, cw: number, ch: number, x: number, y: number, z: number, w: number, h: number) => {
    const u = q(clamp01((t - t0) / dur), 15);
    if (t >= t0 && u < 1) out.fx.push({ key: `${key}|${u}`, cw, ch, draw: (p) => draw(p, u), x, y, z, w, h });
  };
  /** a card that pops in at t0 and stays until t1 */
  const hold = (key: string, t0: number, t1: number, draw: (p: Pen) => void, cw: number, ch: number, x: number, y: number, z: number, w: number, h: number, soft = false) => {
    if (t < t0 || t > t1) return; const k = q(popIn(t, t0), 10);
    out.fx.push({ key: `${key}|${k}`, cw, ch, draw, x, y, z, w: w * k, h: h * k, soft });
  };
  const dialAt = (s: V3, cm: number | "?", w = 0.42, spin = 0) =>
    out.fx.push({ key: `dial|${cm}|${q(spin, 8)}`, cw: 420, ch: 460, draw: (p) => dial(p, cm, spin), x: s[0], y: s[1], z: s[2], w, h: w * 460 / 420 });
  const b = SHOTS[id - 1].b / 30;
  if (id === 1) { const s = L(1, EDGE);
    dialAt([s[0] - 0.8, 1.15, s[2] + 0.2], 1, 0.75);
    hold("clock1", 0.2, b, (p) => clock(p, 11.85, true), 300, 300, s[0] + 0.75, 2.25, s[2] + 0.1, 0.75, 0.75); }
  if (id === 2) { const s = L(2, MID), t0 = word("turn"), t1 = word("tall") - 0.15, cm = cmAt((t - t0) / (t1 - t0));
    const sc = 2.2 * Math.pow(1 / 2.2, ease(clamp01((t - t0) / (t1 - t0)))), hx = s[0] - 0.8 * sc, hy = 1.15 * sc; // on the outstretched wrist, shrinking with you
    dialAt([hx, hy, s[2] + 0.2], cm, 0.45 + 0.3 * sc);
    burst("b2", t1, 0.6, (p, u) => fxBurst(p, u, "#2ee86a"), 512, 512, hx, hy, s[2] + 0.15, 1.4, 1.4); }
  if (id === 4) { const land = word("land", 14.5), s = L(4, LAND), u = clamp01((land + 0.4 - t) / (land + 0.4 - 13.0));
    if (t < land + 0.6) out.fx.push({ key: `leaf|${q(Math.sin(t * 2.4), 6)}`, cw: 260, ch: 260, draw: (p) => leaf(p, 40 * Math.sin(t * 2.4)), x: s[0] + 1.7 - 0.5 * Math.sin(t * 2.4), y: 0.2 + 4.8 * u, z: s[2] + 0.3, w: 0.6, h: 0.6 });
    burst("puff4", land - 0.05, 0.6, (p, v) => fxPuff(p, v), 300, 300, s[0], 0.25, s[2] + 0.2, 1.4, 1.4); }
  if (id === 9) { const s = L(9, CRUMB), t0 = 41.0, t1 = word("eating") + 0.4, h = 12 + 4 * ease((t - t0) / (t1 - t0)), k = 0.75 - 0.68 * ease((t - 41.2) / (word("wins") - 41.2));
    out.fx.push({ key: `clock9|${q(h, 30)}`, cw: 300, ch: 300, draw: (p) => clock(p, h, false), x: s[0] + 0.15, y: 2.2, z: s[2] + 0.1, w: 0.5, h: 0.5 });
    out.fx.push({ key: `thermo|${q(k, 30)}`, cw: 220, ch: 560, draw: (p) => thermo(p, k), x: s[0] - 0.95, y: 1.6, z: s[2] + 0.15, w: 0.32, h: 0.82 });
    burst("shiv", 41.4, 2.2, (p, u) => fxCreak(p, u * 6 % 1), 300, 300, s[0] + 0.5, 1.5, s[2] + 0.1, 0.4, 0.4); }
  if (id === 10) { const s = L(10, DRIP), r = word("drips") - 0.1, hit = 46.6, u = clamp01((t - r) / (hit - r)), grow = clamp01((t - 43.6) / (r - 43.6));
    const y = t < r ? 35.6 - 0.4 * grow : 35.6 - 0.4 - (35.2 - 1.0) * u * u;
    out.fx.push({ key: `drop|${t < r ? q(grow, 10) : 1}`, cw: 400, ch: 520, draw: drop, x: s[0], y, z: s[2] + 0.2, w: 1.9 * (0.6 + 0.4 * (t < r ? grow : 1)), h: 2.45 * (0.6 + 0.4 * (t < r ? grow : 1)) }); }
  if (id === 11) { const s = L(11, DRIP), w = q(Math.sin(t * 6), 8);
    burst("spl", 46.6, 0.7, (p, u) => fxSplash(p, u), 800, 800, s[0], 0.9, s[2] + 0.5, 3.0, 3.0);
    out.fx.push({ key: `wrap|${w}`, cw: 700, ch: 680, draw: (p) => blob(p, w), x: s[0], y: 1.0, z: s[2] + 0.35, w: 2.3, h: 2.25, soft: true }); }
  if (id === 12) { const s = L(12, LAND), t0 = word("push", 52.5), t1 = word("high", 53.5), k = 0.15 + 0.8 * ease((t - t0) / (t1 + 0.2 - t0)) + (t > t1 ? 0.02 * Math.sin(t * 30) : 0);
    hold("help", word("shout", 50) - LEAD, b, help, 460, 300, s[0] + 0.62, 2.1, s[2] + 0.15, 0.7, 0.46);
    burst("sq1", word("shout", 50), 1.2, squeak, 300, 300, s[0] + 0.3, 1.55, s[2] + 0.1, 0.45, 0.45);
    burst("sq2", word("high", 53.5) - 0.1, 1.2, squeak, 300, 300, s[0] + 0.3, 1.55, s[2] + 0.1, 0.45, 0.45);
    out.fx.push({ key: `meter|${q(k, 40)}`, cw: 360, ch: 760, draw: (p) => meter(p, k), x: s[0] - 0.95, y: 1.2, z: s[2] + 0.15, w: 0.62, h: 1.31 }); }
  if (id === 13) { const s = L(13, CATSIDE), o = ease((t - word("cat", 56.5) + 0.15) / 0.35), i = word("interested"), look = ease((t - i + 0.4) / 0.4);
    const px = q(-0.55 * look, 10), slit = q(70 - 45 * look, 2), op = q(o, 10);
    const inn = ease((t - word("cat", 56.5) + 0.7) / 0.6); // the head slides in from the right, past the frame edge, and fills the set
    out.fx.push({ key: `cat|${op}|${px}|${slit}`, cw: 1200, ch: 1200, draw: (p) => catHead(p, op, px, slit), x: s[0] + 4.9 + 6 * (1 - inn), y: 4.2, z: s[2] - 2.6, w: 8.4, h: 8.4 });
    const pu = ease((t - i + 0.6) / 0.8);
    if (pu > 0) out.fx.push({ key: "paw", cw: 1700, ch: 460, draw: paw, x: s[0] + 9.36 - 4.9 * pu, y: 0.7, z: s[2] - 0.6, w: 6.31, h: 1.7 });
    burst("ex13", i - LEAD, 0.8, (p, u) => fxExclaim(p, u), 200, 260, s[0] - 0.45, 2.05, s[2] + 0.1, 0.24, 0.31); }
  if (id === 14) { const s = L(14, LAND), t0 = word("spin") + 0.2, t1 = word("full") - 0.3;
    dialAt([s[0] - 0.95, 1.3, s[2] + 0.6], cmAt(1 - (t - t0) / (t1 - t0)), 0.8); }
  if (id === 15) { const s = L(15, KIT), bite = word("lunch", 64.5) - 0.25, up = ease((t - bite) / 0.25);
    out.fx.push({ key: "sandwich", cw: 560, ch: 420, draw: sandwich, x: s[0] - 0.02, y: 0.95 + 0.18 * up, z: s[2] + 0.25, w: 0.62, h: 0.47 });
    dialAt([s[0] - 0.62, 1.05, s[2] + 0.2], 170, 0.3);
    burst("bite", bite + 0.2, 0.6, (p, u) => fxBurst(p, u, "#ffd23f", 8, 30, 160), 500, 500, s[0] + 0.3, 1.75, s[2] + 0.3, 0.5, 0.5); }
  if (id === 16) { const s = L(16, KIT);
    dialAt([s[0] - 0.52, 1.25, s[2] + 0.25], "?", 0.36, t * 2.2); }
};

export const CAST: [string, Outfit, Partial<FrontOpts>][] = [["You", YOU, { expr: "smile" }]];
