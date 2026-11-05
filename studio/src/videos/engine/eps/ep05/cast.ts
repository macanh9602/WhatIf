// What If ep05 acting: everyone grinds their teeth. You, the neighbour and the teen, timed to the voice words, plus the
// shot fx (KRRK bubbles, the phone countdown, the 70 kg weight, the flat seismograph, cancelling arrows, Zzz, the badge).
import { Pen, Outfit, FrontOpts, INK, POSES, fxBurst, fxShock, fxExclaim } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, kf, q } from "../../act";
import { YOU, NEIGHBOR, TEEN, CHANNEL_CAST } from "../people";
import { SHOTS } from "./story";
import words from "./words";

const set = (id: number) => SETS[SHOTS[id - 1].set];
const spot = (id: number, name: string): V3 => set(id).spots[name] ?? set(id).origin;
const L = (id: number, [x, y, z]: V3): V3 => { const o = set(id).origin; return [o[0] + x, o[1] + y, o[2] + z]; };
/** start of the first spoken `text` at or after `from` seconds */
const word = (text: string, from = 0) => {
  const hit = words.find((w) => w.start >= from - 0.01 && w.text.replace(/[^A-Za-z']/g, "").toLowerCase() === text.toLowerCase());
  if (!hit) throw new Error(`Missing cast beat word: ${text} after ${from}`);
  return hit.start;
};
export const wearAt = (_t: number) => 0;

type Pose = FrontOpts["reach"];
const SIDEWALK: V3 = [-1.0, 0, 0.6]; // yard: in front of the picket fence
const PHONE: Pose = [{ ex: -22, ey: 0.05, hx: -34, hy: -0.4, front: true }, undefined]; // phone held up beside the face
const JAW: Pose = [{ ex: -12, ey: 0.12, hx: 26, hy: -0.22, front: true }, undefined]; // hand on the sore jaw
/** grinding jitter: a small fast head shake while the teeth grind */
const grind = (t: number, t0: number, t1 = 1e9) => (t > t0 && t < t1 ? 2.2 * Math.sin(t * 46) : 0);

const ACTS = (id: number): Act[] => {
  switch (id) {
    case 1: { const g0 = word("ground") - 0.1, tl = word("loudest") - 0.2;
      return [
        { i: 0, o: YOU, at: L(1, SIDEWALK), mode: "stand", expr: [[0, "curious"], [g0, "pressed"], [tl, "pained"]], head: (t) => grind(t, g0) },
        { i: 1, o: NEIGHBOR, at: L(1, [-1.8, 0, 0.1]), mode: "stand", expr: [[0, "neutral"], [g0 + 0.15, "disgusted"]], head: (t) => grind(t + 0.3, g0 + 0.15), face: 1, look: 0.4 },
        { i: 3, o: TEEN, at: L(1, [-0.05, 0, 0.2]), mode: "stand", expr: [[0, "bored"], [g0 + 0.3, "pressed"]], head: (t) => grind(t + 0.6, g0 + 0.3), face: -1, look: -0.4 },
      ]; }
    case 2: return [{ i: 0, o: YOU, at: spot(2, "you"), mode: "stand", expr: [[0, "curious"], [word("two") - 0.2, "concentrate"], [word("grind") - LEAD, "pressed"]], reach: () => PHONE,
      head: (t) => grind(t, word("grind")) }];
    case 3: return [{ i: 0, o: YOU, at: spot(3, "you"), mode: "stand", expr: [[0, "pained"], [word("gravel") - 0.2, "cringe"], [word("skull") - 0.2, "pained"]], head: (t) => grind(t, 10.9) - 4,
      reach: (t) => (t > word("gravel") - 0.2 ? POSES.facepalm : undefined) }];
    case 5: return [
      { i: 0, o: YOU, at: L(5, [-1.45, 0, 0.6]), mode: "stand", expr: [[0, "pressed"]], head: (t) => grind(t, 18.5), face: 1, look: 0.5 },
      { i: 1, o: NEIGHBOR, at: L(5, [-0.4, 0, 0.45]), mode: "stand", expr: [[0, "curious"], [word("squeak") - 0.2, "confused"]], face: -1, look: -0.7,
        head: kf([[18.5, 0], [word("hears") - 0.2, -10]], 0.3), reach: () => POSES.head_scratch },
    ];
    case 7: return [{ i: 0, o: YOU, at: spot(7, "you"), mode: "stand", expr: [[0, "concentrate"], [word("bite") - LEAD, "pressed"], [word("seventy") - 0.2, "pained"]],
      head: (t) => grind(t, word("bite")), reach: (t) => (t > word("bite") - 0.2 ? POSES.fist_pump : undefined) }];
    case 9: return [{ i: 0, o: YOU, at: spot(9, "you"), mode: "stand", expr: [[0, "pressed"], [word("thing") - 0.2, "curious"], [word("back", 42) - 0.2, "amused"]],
      head: (t) => grind(t, 38.0, word("thing") - 0.2), look: 0.5 }];
    case 11: return [{ i: 0, o: YOU, at: L(11, SIDEWALK), mode: "stand", expr: [[0, "curious"], [word("strange") - 0.2, "confused"], [word("already") - LEAD, "jawdrop"]],
      reach: (t) => (t > word("already") - 0.2 ? POSES.hands_up : undefined) }];
    case 12: { const g0 = word("grinds") - 0.1; return [{ i: 0, o: YOU, at: L(12, [0.4, 0, -0.9]), mode: "sit", seat: 0.45, expr: [[0, "tired"], [g0, "pressed"]],
      head: (t) => 14 + grind(t, g0), reach: () => POSES.arms_crossed }]; }
    case 14: return [{ i: 0, o: YOU, at: spot(14, "you"), mode: "stand", expr: [[0, "pained"], [word("night", 75) - 0.2, "sheepish"]], reach: () => JAW, head: () => -5 }];
    case 15: return [{ i: 0, o: YOU, at: L(15, SIDEWALK), mode: "stand", expr: [[0, "sly"], [word("clench") - 0.2, "smirk_wink"]],
      reach: (t) => (t < word("clench") - 0.2 ? POSES.arms_crossed : POSES.point_right) }];
    default: return [];
  }
};
export const acts = ACTS;

// ---------------- fx drawings ----------------
const pop = (t: number, t0: number) => clamp01((t - t0) / 0.12) * (1 + 0.15 * Math.sin(clamp01((t - t0) / 0.3) * Math.PI));
const text = (p: Pen, s: string, x: number, y: number, px: number, col: string, stroke = INK) => {
  const g = p.g; g.save(); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${px}px "Arial Black", Arial, sans-serif`;
  g.lineJoin = "round"; g.lineWidth = px * 0.16; g.strokeStyle = stroke; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); g.restore();
};
const panel = (p: Pen, x0: number, y0: number, x1: number, y1: number, fill: string, ol = 8) => {
  const r = 26; p.poly([[x0 + r, y0], [x1 - r, y0], [x1, y0 + r], [x1, y1 - r], [x1 - r, y1], [x0 + r, y1], [x0, y1 - r], [x0, y0 + r]], fill, ol);
};
/** a jagged "KRRK" sound burst, 400 x 260 */
const krrk = (p: Pen, s: string, col = "#ffd23f") => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2, r = i % 2 ? 0.78 : 1; pts.push([200 + Math.cos(a) * 185 * r, 130 + Math.sin(a) * 115 * r]); }
  p.poly(pts, col, 7); text(p, s, 200, 132, 66, "#ffffff");
};
/** a small round speech bubble, 300 x 200 */
const bubble = (p: Pen, s: string, px = 54) => {
  p.ell(150, 90, 135, 75, "#ffffff", 7); p.poly([[90, 150], [60, 195], [130, 158]], "#ffffff", 7); p.ell(150, 90, 128, 68, "#ffffff", 0);
  text(p, s, 150, 92, px, "#16325c", "#ffffff");
};
/** the phone with the countdown, 240 x 420 */
const phone = (p: Pen, s: string) => {
  panel(p, 10, 10, 230, 410, "#1d1a3a", 7); panel(p, 26, 40, 214, 380, s === "GRIND!" ? "#ff5a4f" : "#5ce1ff", 0);
  text(p, s, 120, 215, s.length > 1 ? 44 : 150, "#ffffff");
};
/** a 70 kg kettlebell, 300 x 320 */
const weight = (p: Pen) => {
  p.stroke([[90, 120], [90, 60], [210, 60], [210, 120]], 26, INK);
  p.ell(150, 205, 120, 105, "#3b3f52", 8); text(p, "70 KG", 150, 210, 60, "#ffd23f");
};
/** a seismograph: EARTH, a flat line, 520 x 300 */
const seismo = (p: Pen, t: number) => {
  panel(p, 10, 10, 510, 290, "#f4f1ea", 8); text(p, "EARTH", 260, 55, 44, "#16325c", "#f4f1ea");
  p.stroke([[40, 180], [480, 180]], 3, "rgba(29,26,58,.25)");
  const pts: [number, number][] = []; for (let x = 40; x <= 440; x += 10) pts.push([x, 180 + Math.sin(x * 0.3 + t * 9) * 0.8]);
  p.stroke(pts, 7, "#c63939"); p.ell(445, 180, 12, 12, "#c63939", 4); text(p, "0.000", 260, 250, 40, "#2e86de", "#f4f1ea");
};
/** an arrow, 160 x 300, pointing up (dir 1) or down (dir -1) */
const arrow = (p: Pen, dir: number, col: string) => {
  const y0 = dir > 0 ? 280 : 20, y1 = dir > 0 ? 90 : 210;
  p.poly([[60, y0], [100, y0], [100, y1], [140, y1], [80, dir > 0 ? 15 : 285], [20, y1], [60, y1]], col, 7);
};
/** floating "Z", 160 x 160 */
const zed = (p: Pen) => text(p, "Z", 80, 80, 110, "#5ce1ff");
/** a wooden chair seen from the front, 300 x 420 (seat at y 240) */
const chair = (p: Pen) => {
  p.poly([[50, 20], [250, 20], [250, 200], [50, 200]], "#b5763f", 7);
  for (const y of [70, 130]) p.stroke([[70, y], [230, y]], 5, "#7a4a2a");
  p.poly([[30, 210], [270, 210], [270, 250], [30, 250]], "#c98a50", 7);
  for (const x of [50, 250]) p.stroke([[x, 250], [x, 410]], 16, "#7a4a2a");
};
const badge = (p: Pen) => { panel(p, 10, 10, 490, 170, "#16325c", 8); text(p, "NIGHT SHIFT", 250, 70, 56, "#ffd23f", "#16325c"); text(p, "GRINDER", 250, 132, 40, "#ffffff", "#16325c"); };

export const fx = (id: number, t: number, out: Stage) => {
  const burst = (key: string, t0: number, dur: number, draw: (p: Pen, u: number) => void, cw: number, ch: number, x: number, y: number, z: number, w: number, h: number) => {
    const u = q(clamp01((t - t0) / dur), 15);
    if (t >= t0 && u < 1) out.fx.push({ key: `${key}|${u}`, cw, ch, draw: (p) => draw(p, u), x, y, z, w, h });
  };
  /** a card that pops in at t0 and stays until t1 */
  const hold = (key: string, t0: number, t1: number, draw: (p: Pen) => void, cw: number, ch: number, x: number, y: number, z: number, w: number, h: number) => {
    if (t < t0 || t > t1) return; const k = q(pop(t, t0), 10);
    out.fx.push({ key: `${key}|${k}`, cw, ch, draw, x, y, z, w: w * k, h: h * k });
  };
  if (id === 1) { const s = L(1, SIDEWALK), n = L(1, [-1.8, 0, 0.1]), m = L(1, [-0.05, 0, 0.2]), tl = word("loudest") - LEAD;
    hold("sq1", word("ground") + 0.2, 7.3, (p) => bubble(p, "squeak", 46), 300, 200, n[0] + 0.3, 1.95, n[2] + 0.1, 0.3, 0.2);
    hold("sq2", word("teeth") + 0.1, 7.3, (p) => bubble(p, "squeak", 46), 300, 200, m[0] - 0.22, 1.9, m[2] + 0.1, 0.3, 0.2);
    hold("kr1", tl, 7.3, (p) => krrk(p, "KRRRK!"), 400, 260, s[0] + 0.05, 2.0, s[2] + 0.15, 0.62, 0.4); }
  if (id === 2) { const s = spot(2, "you"), n = t < word("two") - LEAD ? "3" : t < word("one", 8) - LEAD ? "2" : t < word("grind") - LEAD ? "1" : "GRIND!";
    out.fx.push({ key: `phone|${n}`, cw: 240, ch: 420, draw: (p) => phone(p, n), x: s[0] - 0.36, y: 1.5, z: s[2] + 0.25, w: 0.2, h: 0.35 });
    burst("g2", word("grind") - 0.05, 0.6, (p, u) => fxBurst(p, u, "#ff5a4f"), 512, 512, s[0] - 0.36, 1.5, s[2] + 0.2, 0.5, 0.5); }
  if (id === 3) { const s = spot(3, "you");
    hold("kr3a", 11.0, 13.2, (p) => krrk(p, "KRRK!"), 400, 260, s[0] + 0.34, 1.82, s[2] + 0.2, 0.36, 0.23);
    hold("kr3b", word("gravel") - LEAD, 14.7, (p) => krrk(p, "CRUNCH!", "#ff5a4f"), 400, 260, s[0] + 0.26, 1.92, s[2] + 0.22, 0.34, 0.22);
    burst("sh3", word("blender") - 0.1, 0.7, (p, u) => fxShock(p, u), 300, 300, s[0], 1.95, s[2] + 0.1, 0.4, 0.4); }
  if (id === 5) { const s = L(5, [-1.45, 0, 0.6]), n = L(5, [-0.4, 0, 0.45]);
    hold("sq5", word("tiny") - LEAD, 21.7, (p) => bubble(p, "squeak", 46), 300, 200, s[0] + 0.33, 1.55, s[2] + 0.1, 0.24, 0.16);
    burst("ex5", word("squeak") - 0.05, 0.8, (p, u) => fxExclaim(p, u), 200, 260, n[0] + 0.15, 2.05, n[2], 0.18, 0.24); }
  if (id === 7) { const s = spot(7, "you");
    hold("kg", word("seventy") - LEAD, 33.2, weight, 300, 320, s[0] - 0.36, 1.5, s[2] + 0.25, 0.3, 0.32);
    burst("b7", word("bite") - 0.05, 0.6, (p, u) => fxBurst(p, u), 512, 512, s[0] + 0.05, 1.45, s[2] + 0.1, 0.8, 0.8); }
  if (id === 9) { const s = spot(9, "you");
    out.fx.push({ key: `seis|${Math.round(t * 10) % 20}`, cw: 520, ch: 300, draw: (p) => seismo(p, t), x: s[0] + 0.7, y: 1.05, z: s[2] + 0.2, w: 0.62, h: 0.36 });
    hold("up", word("jaw", 39) - LEAD, 44.2, (p) => arrow(p, 1, "#5ce1ff"), 160, 300, s[0] - 0.17, 1.42, s[2] + 0.2, 0.09, 0.17);
    hold("dn", word("skull", 42.5) - LEAD, 44.2, (p) => arrow(p, -1, "#ff5a4f"), 160, 300, s[0] - 0.17, 1.98, s[2] + 0.2, 0.09, 0.17); }
  if (id === 11) { const s = L(11, SIDEWALK); burst("ex11", word("already") - 0.05, 0.9, (p, u) => fxExclaim(p, u), 200, 260, s[0] + 0.35, 2.0, s[2] + 0.1, 0.22, 0.29); }
  if (id === 12) { const s = L(12, [0.4, 0, -0.9]);
    out.fx.push({ key: "chair12", cw: 300, ch: 420, draw: chair, x: s[0], y: 0.46, z: s[2] - 0.12, w: 0.5, h: 0.92 });
    for (let i = 0; i < 3; i++) { const k = ((t * 0.5 + i / 3) % 1), sz = 0.1 + 0.08 * k;
      out.fx.push({ key: "z", cw: 160, ch: 160, draw: zed, x: s[0] + 0.25 + 0.25 * k, y: 1.6 + 0.6 * k, z: s[2] + 0.1, w: sz, h: sz }); }
    hold("kr12", word("grinds") - LEAD, 66.1, (p) => krrk(p, "KRRK"), 400, 260, s[0] - 0.4, 1.45, s[2] + 0.15, 0.36, 0.23); }
  if (id === 14) { const s = spot(14, "you");
    hold("badge", word("night", 75) - LEAD, 77.5, badge, 500, 180, s[0] + 0.2, 1.22, s[2] + 0.3, 0.34, 0.12); }
};

export const CAST: [string, Outfit, Partial<FrontOpts>][] = CHANNEL_CAST.map(([n, o]) => [n, o, { expr: "smile" }]);
