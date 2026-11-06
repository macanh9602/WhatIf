// What If ep06 acting: you sell your sleep, a billionaire buys it. Timed to the voice words, plus the shot fx (the sleep
// HUD, the app, the thought bubbles, the booth sign, the day counter).
import { Pen, Outfit, FrontOpts, INK, POSES, fxBurst, fxExclaim } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, q } from "../../act";
import { YOU, NEIGHBOR, GRANDMA, TEEN, RUNNER, BILLIONAIRE, CHANNEL_CAST } from "../people";
import { SHOTS } from "./story";
import words from "./words";

const set = (id: number) => SETS[SHOTS[id - 1].set];
const spot = (id: number, name: string): V3 => set(id).spots[name] ?? set(id).origin;
const L = (id: number, [x, y, z]: V3): V3 => { const o = set(id).origin; return [o[0] + x, o[1] + y, o[2] + z]; };
/** start of the first spoken `text` at or after `from` seconds */
const word = (text: string, from = 0) => {
  const hit = words.find((w) => w.start >= from - 0.01 && w.text.replace(/[^A-Za-z0-9']/g, "").toLowerCase() === text.toLowerCase());
  if (!hit) throw new Error(`Missing cast beat word: ${text} after ${from}`);
  return hit.start;
};
export const wearAt = (_t: number) => 0;

type Pose = FrontOpts["reach"];
const SIDEWALK: V3 = [-1.0, 0, 0.6]; // yard: in front of the picket fence
const PHONE: Pose = [{ ex: -22, ey: 0.05, hx: -34, hy: -0.4, front: true }, undefined]; // phone held up beside the face
const MARK: V3 = [0.1, 0, -0.9]; // bedroom: clear of the bed, which stays in frame
const BUY = 5; // BILLIONAIRE's index in CHANNEL_CAST
const QUEUE: [number, Outfit, V3][] = [[1, NEIGHBOR, [-18.95, 0, 1.6]], [2, GRANDMA, [-17.6, 0, 2.2]], [4, RUNNER, [-18.1, 0, 2.9]], [0, YOU, [-17.15, 0, 3.5]]];

const ACTS = (id: number): Act[] => {
  switch (id) {
    case 1: { const s = word("billionaires") - 0.3; return [
      { i: 0, o: YOU, at: L(1, SIDEWALK), mode: "stand", expr: [[0, "curious"], [word("billionaires") - LEAD, "shock"]], reach: () => PHONE, look: (t) => (t > s ? 0.6 : 0) },
      { i: BUY, o: BILLIONAIRE, at: L(1, [1.3, 0, -0.5]), mode: "stroll", phase: (t) => t * 1.6, expr: [[0, "excited"]], face: -1, moveTo: [[s, [0, 0, 0]], [4.8, [-1.7, 0, 0]]] },
    ]; }
    case 2: return [{ i: 0, o: YOU, at: L(2, MARK), mode: "stand", expr: [[0, "curious"], [word("two", 9) - LEAD, "smile"]], reach: () => PHONE }];
    case 3: return [{ i: 0, o: YOU, at: spot(3, "you"), mode: "stand", expr: [[0, "grin"], [word("fine", 13) - 0.2, "proud"]],
      reach: (t) => (t > word("wake") - 0.2 ? POSES.hands_up : undefined) }];
    case 4: return [{ i: BUY, o: BILLIONAIRE, at: L(4, [0.4, 0, -0.9]), mode: "stand", expr: [[0, "curious"], [word("buys", 16) - LEAD, "excited"]],
      reach: (t) => (t > word("never", 18.5) - 0.2 ? POSES.hands_on_hips : POSES.hold_out), look: -0.4 }];
    case 6: return [{ i: 0, o: YOU, at: L(6, MARK), mode: "stand", expr: [[0, "tired"], [word("fine", 29) - 0.2, "fake_smile"]],
      head: () => 4, reach: (t) => (t > word("fine", 29) - 0.2 ? POSES.fist_pump : PHONE) }];
    case 9: return [{ i: 0, o: YOU, at: spot(9, "you"), mode: "stand", expr: [[0, "tired"], [word("sold", 52) - LEAD, "shook"]],
      reach: (t) => (t > word("sold", 52) - 0.2 ? POSES.cover_mouth : POSES.chin_think) }];
    case 10: return QUEUE.map(([i, o, at], n) => ({ i, o, at: L(10, at), mode: "stand" as const, face: -1, look: -0.5,
      expr: i === 0 ? [[0, "tired"], [word("hard", 58) - LEAD, "scared"]] : [[0, n % 2 ? "bored" : "tired"]],
      reach: i === 1 ? () => POSES.hold_out : undefined }));
    case 11: return [{ i: 3, o: TEEN, at: L(11, MARK), mode: "stand", expr: [[0, "tired"], [word("memory", 66) - 0.3, "dazed"]],
      tilt: (t) => 2 + 3 * clamp01((t - 59.5) / 4) * Math.sin(t * 1.7), head: (t) => 3 + 5 * clamp01((t - 62) / 4) * Math.sin(t * 1.1) }];
    case 14: { const s = word("how", 83) - 0.6; return [
      { i: 0, o: YOU, at: L(14, SIDEWALK), mode: "stand", expr: [[0, "sly"], [word("sell", 84) - 0.2, "smirk_wink"]], reach: () => PHONE },
      { i: BUY, o: BILLIONAIRE, at: L(14, [0.9, 0, -0.5]), mode: "stroll", phase: (t) => t * 1.6, expr: [[0, "excited"]], face: -1, moveTo: [[s, [0, 0, 0]], [TOTAL_S, [-1.4, 0, 0]]] },
    ]; }
    default: return [];
  }
};
const TOTAL_S = 85.7;
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
/** the sleep HUD over a head, 480 x 180: hours left tonight + money earned */
const hud = (p: Pen, hours: number, money: number, tag = "") => {
  panel(p, 10, 20, 470, 170, "rgba(22,50,92,.92)");
  p.ell(85, 95, 58, 58, "#ffd23f", 7); p.ell(103, 80, 46, 46, "#16325c", 0);
  text(p, `${hours} H SLEEP`, 210, 62, 34, "#ffffff"); if (money >= 0) text(p, `$${money}`, 400, 62, 34, "#2ee86a");
  panel(p, 165, 95, 445, 140, "#2b2f3a", 5);
  if (hours > 0) panel(p, 170, 100, 170 + 270 * hours / 8, 135, hours < 4 ? "#ff3b30" : "#5ce1ff", 0);
  if (tag) text(p, tag, 305, 118, 26, "#ffffff");
};
/** the app, 360 x 520 */
const app = (p: Pen, sold: boolean) => {
  panel(p, 10, 10, 350, 510, "#1d1a3a", 7); panel(p, 28, 40, 332, 480, sold ? "#ff5a4f" : "#5ce1ff", 0);
  text(p, "SELL", 180, 120, 62, "#ffffff"); text(p, "SLEEP", 180, 190, 62, "#ffffff");
  text(p, "$20 / H", 180, 290, 52, "#ffd23f"); panel(p, 70, 350, 290, 440, "#16325c", 6); text(p, sold ? "SOLD!" : "2 H", 180, 396, 48, "#ffffff");
};
const tagCard = (p: Pen, s: string, col = "#ffd23f", bg = "#16325c", px = 56) => { panel(p, 10, 10, 490, 150, bg, 8); text(p, s, 250, 80, px, col, bg); };
/** a thought bubble with trailing dots, 420 x 340; the content sits around (210, 130) */
const thought = (p: Pen, inner: (p: Pen) => void) => {
  for (const [x, y, r] of [[120, 130, 90], [210, 100, 95], [300, 130, 90], [210, 170, 110]] as const) p.ell(x, y, r, r * 0.85, "#ffffff", 7);
  for (const [x, y, r] of [[120, 130, 84], [210, 100, 89], [300, 130, 84], [210, 170, 104]] as const) p.ell(x, y, r, r * 0.85, "#ffffff", 0);
  p.ell(70, 285, 20, 16, "#ffffff", 6); p.ell(35, 322, 11, 9, "#ffffff", 5); inner(p);
};
/** a mop + SOLD, the crew you sold */
const mopSold = (p: Pen) => {
  p.stroke([[150, 40], [240, 170]], 12, "#7a4a2a"); p.poly([[210, 170], [280, 150], [300, 215], [225, 225]], "#5ce1ff", 6);
  const g = p.g; g.save(); g.translate(210, 150); g.rotate(-0.25); text(p, "SOLD", 0, 0, 62, "#ff3b30", "#ffffff"); g.restore();
};
const xOut = (p: Pen) => { p.stroke([[40, 40], [360, 360]], 42, "#ff3b30"); p.stroke([[360, 40], [40, 360]], 42, "#ff3b30"); };
const dayCard = (p: Pen, d: number) => { panel(p, 10, 10, 390, 190, "#f4f1ea", 8); text(p, "DAY", 200, 60, 44, "#16325c", "#f4f1ea"); text(p, String(d), 200, 130, 76, d >= 11 ? "#ff3b30" : "#16325c", "#f4f1ea"); };
const slider = (p: Pen, k: number) => { panel(p, 10, 10, 470, 170, "#16325c", 8); text(p, "SELL ? HOURS", 240, 60, 44, "#ffffff", "#16325c"); p.stroke([[50, 120], [430, 120]], 12, "#dfe9f7"); p.ell(50 + 380 * k, 120, 26, 26, "#ffd23f", 6); };
const FADE_LINES = ["WHAT WAS I SAYING", "WHAT WAS I...", "WHAT...", "..."];

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
  const hudAt = (s: V3, y: number, hours: number, money: number, tag = "") =>
    out.fx.push({ key: `hud|${hours}|${money}|${tag}`, cw: 480, ch: 180, draw: (p) => hud(p, hours, money, tag), x: s[0], y, z: s[2] + 0.1, w: 0.72, h: 0.27 });
  const tap = word("sell", 9) - LEAD;
  if (id === 1) { const s = L(1, SIDEWALK); hudAt(s, 2.0, 8, 0); }
  if (id === 2) { const s = L(2, MARK), sold = t > tap;
    hudAt(s, 2.0, sold ? 6 : 8, sold ? 40 : 0);
    hold(`app${sold}`, word("app") - LEAD, 10.5, (p) => app(p, sold), 360, 520, s[0] - 0.52, 1.28, s[2] + 0.25, 0.42, 0.6);
    burst("b2", tap, 0.6, (p, u) => fxBurst(p, u, "#ff5a4f"), 512, 512, s[0] - 0.52, 1.28, s[2] + 0.2, 0.7, 0.7); }
  if (id === 3) { const s = spot(3, "you"); hudAt(s, 2.0, 6, 40);
    hold("fine", word("feel", 13) - LEAD, 14.4, (p) => tagCard(p, "FEEL FINE", "#2ee86a"), 500, 160, s[0] + 0.24, 1.28, s[2] + 0.25, 0.42, 0.135); }
  if (id === 4) { const b = L(4, [-0.85, 0.75, -1.9]), s = L(4, [0.4, 0, -0.9]);
    hold("bought", word("buys", 16) - LEAD, 20.4, (p) => tagCard(p, "A NIGHT'S REST: PAID", "#ffd23f", "#16325c", 36), 500, 160, s[0] - 0.05, 2.0, s[2] + 0.1, 0.72, 0.23);
    hold("noBed", word("never", 18.5) - LEAD, 20.4, xOut, 400, 400, b[0], b[1], b[2], 0.75, 0.75); }
  if (id === 6) { const s = L(6, MARK); hudAt(s, 2.0, 6, 560, "");
    hold("day14", 26.9, 31.8, (p) => dayCard(p, 14), 400, 200, s[0] + 0.5, 1.6, s[2] + 0.2, 0.42, 0.21);
    hold("app6", 27.0, word("fine", 29) - 0.25, (p) => app(p, true), 360, 520, s[0] - 0.52, 1.28, s[2] + 0.25, 0.42, 0.6); }
  if (id === 9) { const s = spot(9, "you"), sold = word("sold", 52) - LEAD;
    hold("free", 50.5, sold, (p) => thought(p, (g) => text(g, "FREE TIME?", 210, 130, 50, "#16325c", "#ffffff")), 420, 340, s[0] + 0.22, 1.98, s[2] + 0.2, 0.5, 0.4);
    hold("mop", sold, 54.1, (p) => thought(p, mopSold), 420, 340, s[0] + 0.22, 1.98, s[2] + 0.2, 0.5, 0.4);
    burst("ex9", sold, 0.8, (p, u) => fxExclaim(p, u), 200, 260, s[0] - 0.4, 2.05, s[2] + 0.1, 0.2, 0.26); }
  if (id === 10) { const you = L(10, QUEUE[3][2]), s = L(10, [-18, 2.46, 0.31]), lim = word("hard", 58) - LEAD;
    out.fx.push({ key: "boothSign", cw: 600, ch: 140, draw: (p) => { panel(p, 4, 4, 596, 136, "#16325c", 0); text(p, "SELL SLEEP", 300, 70, 76, "#ffd23f", "#16325c"); }, x: s[0], y: s[1], z: s[2], w: 1.5, h: 0.35, face: [0, 0, 1] });
    const left = Math.max(0, Math.round(4 * (1 - clamp01((t - 55.2) / (lim - 55.2)))));
    out.fx.push({ key: `hud|${left}|q`, cw: 480, ch: 180, draw: (p) => hud(p, left, -1), x: you[0] + 0.0, y: 1.98, z: you[2] + 0.1, w: 0.48, h: 0.18 });
    hold("lim", lim, 59.4, (p) => tagCard(p, "HARD LIMIT", "#ffffff", "#c63939"), 500, 160, you[0] - 0.2, 1.1, you[2] + 0.2, 0.62, 0.2); }
  if (id === 11) { const s = L(11, MARK), t0 = word("1964"), te = word("eleven", 62), d = 1 + Math.round(10 * clamp01((t - t0) / (te - t0)));
    hold("yr", t0 - LEAD, 61.3, (p) => tagCard(p, "1964", "#ffd23f"), 500, 160, s[0] - 0.55, 1.95, s[2] + 0.1, 0.5, 0.16);
    out.fx.push({ key: `day|${d}`, cw: 400, ch: 200, draw: (p) => dayCard(p, d), x: s[0] + 0.5, y: 1.45, z: s[2] + 0.2, w: 0.42, h: 0.21 });
    const m = word("memory", 66) - 0.3, n = Math.min(3, Math.floor(clamp01((t - m) / 1.6) * 4));
    hold(`th${n}`, 64.6, 68.4, (p) => thought(p, (g) => text(g, FADE_LINES[n], 210, 130, n ? 44 : 30, "#16325c", "#ffffff")), 420, 340, s[0] + 0.33, 1.9, s[2] + 0.2, 0.55, 0.44); }
  if (id === 14) { const s = L(14, SIDEWALK), k = q(0.5 + 0.45 * Math.sin((t - 81.8) * 1.5), 30);
    hudAt(s, 1.98, 6, 40);
    hold(`sl${k}`, word("how", 83) - LEAD, 85.7, (p) => slider(p, k), 480, 180, s[0] - 0.05, 0.98, s[2] + 0.25, 0.62, 0.23); }
};

export const CAST: [string, Outfit, Partial<FrontOpts>][] = CHANNEL_CAST.map(([n, o]) => [n, o, { expr: "smile" }]);
