// What If ep02 acting: "you" turns a weight dial on the wrist, timed to the voice words, plus the shot fx
// (the dial HUD with its setting, ticket, shopping bag, chair that explodes, speed lines).
import { Pen, Outfit, FrontOpts, INK, POSES, fxSweatBurst, fxExclaim, fxBurst, fxPuff, fxSpeed, fxStars } from "../../toon";
import { V3, clamp01, smooth } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, kf, q } from "../../act";
import { YOU, NEIGHBOR, CHANNEL_CAST } from "../people";
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
const WRIST: Pose = [undefined, { ex: 24, ey: 0.15, hx: -6, hy: -0.32, front: true }]; // left wrist raised in front of the chest: reading the dial
const BALANCE: Pose = [{ ex: -32, ey: -0.05, hx: -60, hy: -0.2, front: true }, { ex: 32, ey: -0.05, hx: 60, hy: -0.2, front: true }];
const TICKET: Pose = [{ ex: -22, ey: 0.05, hx: -34, hy: -0.4, front: true }, undefined]; // the ticket held up beside the face

const at = (id: number, x: number, z: number): V3 => L(id, [x, 0, z]);
const ACTS = (id: number): Act[] => {
  switch (id) {
    case 1: { const p0 = spot(1, "you"); return [{ i: 0, o: YOU, at: p0, mode: "stand", expr: [[0, "curious"], [word("float") - 0.2, "shock"], [5.3, "excited"]],
      reach: (t) => (t < word("float") ? WRIST : POSES.hands_up), lookY: (t) => (t < word("float") ? 0.4 : -0.3),
      path: (t) => [p0[0], 2.3 * smooth((t - 3.3) / 2.7), p0[2]], noShadow: true }]; }
    case 2: return [{ i: 0, o: YOU, at: spot(2, "you"), mode: "stand", expr: [[0, "curious"], [word("turn", 9) - 0.2, "scheming"]], reach: () => WRIST, lookY: () => 0.45, look: -0.3 }];
    case 3: { const p0 = at(3, 0.4, -0.5); return [{ i: 0, o: YOU, at: p0, mode: "stroll", phase: (t) => t * 1.1, expr: [[0, "excited"], [word("trampoline") - 0.2, "laugh"]], reach: () => POSES.hands_up,
      path: (t) => [p0[0], t < 11.6 ? 0 : 0.85 * Math.abs(Math.sin((Math.PI * (t - 11.6)) / 0.95)), p0[2]] }]; }
    case 4: { const a = at(4, 2.6, -3.0), b = L(4, [4.5, 5.8, -8.4]), t0 = word("jump") - 0.05, t1 = t0 + 1.5;
      return [
        { i: 0, o: YOU, at: a, mode: "stand", expr: [[0, "confident"], [t0, "excited"], [t1, "proud"]], reach: (t) => (t < t0 || t > t1 ? POSES.hands_on_hips : POSES.hands_up),
          path: (t) => { const k = clamp01((t - t0) / (t1 - t0)); return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k + 2.2 * Math.sin(Math.PI * k), a[2] + (b[2] - a[2]) * k]; }, noShadow: true },
        { i: 1, o: NEIGHBOR, at: at(4, 1.2, -2.2), mode: "stand", expr: [[0, "neutral"], [t0 + 0.3, "shock"]], face: 1, look: 1, lookY: (t) => (t < t0 + 0.3 ? 0 : -0.8), reach: (t) => (t < t0 + 0.3 ? undefined : POSES.cover_mouth) },
      ]; }
    case 5: return [{ i: 0, o: YOU, at: at(5, -2.1, 0.6), mode: "stroll", phase: (t) => t * 2.4, expr: [[0, "nervous"], [word("skid") - 0.2, "scared"]], reach: () => BALANCE, face: 1,
      tilt: (t) => 10 * Math.sin(t * 6.5), moveTo: [[22.2, [0, 0, 0]], [27.4, [2.2, 0, 0]]] }];
    case 7: { const x0 = -0.8, x1 = 5.6; return [{ i: 0, o: YOU, at: at(7, x0, 3.2), mode: "fall", expr: [[0, "scared"]], reach: () => BALANCE, noShadow: true,
      tilt: (t) => 35 * Math.sin(t * 5), path: (t) => { const k = clamp01((t - 33.2) / 3.7); return L(7, [x0 + (x1 - x0) * k, 0.5 + 0.6 * Math.abs(Math.sin(t * 3.2)), 3.2]); } }]; }
    case 9: return [{ i: 0, o: YOU, at: spot(9, "you"), mode: "stand", expr: [[0, "smug"], [word("worse") - 0.2, "worried"]], reach: () => WRIST, lookY: () => 0.45, look: -0.3 }];
    case 10: { const p0 = spot(10, "you"); return [
      { i: 0, o: YOU, at: p0, mode: "stand", expr: [[0, "pained"]], tilt: () => 12, reach: () => POSES.hands_on_hips },
      { i: 1, o: NEIGHBOR, at: [p0[0] + 0.05, 0.82, p0[2] - 0.3], mode: "sit", expr: [[0, "casual"], [word("back") - 0.2, "smile"]], reach: () => POSES.wave, noShadow: true },
    ]; }
    case 11: { const p0 = at(11, -0.6, -1.4), te = word("explode"); return [{ i: 0, o: YOU, at: p0, mode: "sit", seat: 0.45, expr: [[0, "confident"], [te - LEAD, "shock"], [te + 0.6, "dazed"]],
      path: (t) => [p0[0], t < te ? 0 : -0.42, p0[2]] }]; }
    case 14: return [{ i: 0, o: YOU, at: spot(14, "you"), mode: "stand", expr: [[0, "curious"], [word("tiny") - 0.2, "smile"]], reach: () => WRIST, lookY: () => 0.45, look: -0.3 }];
    case 16: return [{ i: 0, o: YOU, at: spot(16, "you"), mode: "stand", expr: [[0, "smug"]], reach: (t) => (t < word("plane") - 0.3 ? POSES.arms_crossed : TICKET) }];
    case 17: return [{ i: 0, o: YOU, at: spot(17, "you"), mode: "stand", expr: [[0, "curious"], [word("which") - 0.2, "sly"]], reach: (t) => (t < word("which") ? undefined : POSES.shrug) }];
    default: return [];
  }
};
export const acts = ACTS;

// ---------------- fx drawings ----------------
const pop = (t: number, t0: number) => clamp01((t - t0) / 0.12) * (1 + 0.15 * Math.sin(clamp01((t - t0) / 0.3) * Math.PI));
/** the weight dial, 300 x 380: needle at `frac` (0 = nothing, 1 = maximum), the setting printed under it */
const dial = (p: Pen, frac: number, label: string) => {
  const g = p.g;
  p.ell(150, 150, 130, 130, "#f4f1ea", 9);
  for (let i = 0; i <= 10; i++) { const a = ((-225 + 270 * (i / 10)) * Math.PI) / 180; p.stroke([[150 + Math.cos(a) * 98, 150 + Math.sin(a) * 98], [150 + Math.cos(a) * 118, 150 + Math.sin(a) * 118]], i % 5 ? 4 : 8, INK); }
  const a = ((-225 + 270 * clamp01(frac)) * Math.PI) / 180;
  p.stroke([[150, 150], [150 + Math.cos(a) * 92, 150 + Math.sin(a) * 92]], 10, "#c63939");
  p.ell(150, 150, 16, 16, INK, 0);
  p.poly([[20, 290], [280, 290], [280, 370], [20, 370]], "#1f3a68", 7);
  g.save(); g.font = '900 64px "Arial Black", Arial'; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ffffff"; g.fillText(label, 150, 332); g.restore();
};
/** dial settings per shot: [frac, label] */
const DIAL: Record<number, (t: number) => [number, string]> = {
  1: (t) => (t < 3.3 ? [0.45, "100%"] : [0.01, "80 g"]),
  2: (t) => (t < word("turn", 9) ? [0.45, "100%"] : [0.38, "75%"]),
  3: () => [0.28, "50%"], 4: () => [0.12, "10%"], 5: () => [0.12, "10%"], 7: () => [0.05, "4 kg"],
  9: (t) => (t < word("up", 44) ? [0.05, "80 g"] : [0.6, "200%"]), 10: () => [0.6, "200%"], 11: () => [0.98, "1000%"],
  14: () => [0.448, "99.5%"], 17: (t) => [0.45 + 0.4 * Math.sin(t * 2.2), "?"],
};
/** a plane ticket, 420 x 220 */
const ticket = (p: Pen) => {
  p.poly([[10, 20], [410, 20], [410, 200], [10, 200]], "#f4f1ea", 7);
  p.poly([[300, 20], [410, 20], [410, 200], [300, 200]], "#2e86de", 7);
  const g = p.g; g.save(); g.font = '900 40px "Arial Black", Arial'; g.fillStyle = INK; g.fillText("BOARDING", 30, 75); g.font = '900 54px "Arial Black", Arial'; g.fillText("EQUATOR", 30, 150); g.restore();
  p.poly([[330, 95], [390, 110], [330, 125]], "#ffffff", 4);
};
/** an empty shopping bag tumbling, 260 x 300 */
const bag = (p: Pen) => {
  p.poly([[40, 90], [220, 80], [235, 285], [25, 290]], "#f4f1ea", 7);
  p.stroke([[80, 90], [95, 30], [165, 28], [180, 85]], 9, INK);
  p.stroke([[60, 150], [200, 140]], 5, "rgba(29,26,58,.35)");
};
/** a wooden chair seen from the front, 300 x 420 (seat at y 240) */
const chair = (p: Pen) => {
  p.poly([[50, 20], [250, 20], [250, 200], [50, 200]], "#b5763f", 7);
  for (const y of [70, 130]) p.stroke([[70, y], [230, y]], 5, "#7a4a2a");
  p.poly([[30, 210], [270, 210], [270, 250], [30, 250]], "#c98a50", 7);
  for (const x of [50, 250]) p.stroke([[x, 250], [x, 410]], 16, "#7a4a2a");
};
/** splinters flying out from the seat, 500 x 400 */
const splinters = (p: Pen, u: number) => {
  for (let k = 0; k < 10; k++) { const a = -Math.PI + (k / 9) * Math.PI, r = 30 + 260 * u, x = 250 + Math.cos(a) * r, y = 300 + Math.sin(a) * r * 0.7 + 240 * u * u, s = 30 - 10 * u;
    p.poly([[x - s, y - 6], [x + s, y - 2], [x + s * 0.8, y + 8], [x - s * 0.9, y + 6]], k % 2 ? "#b5763f" : "#7a4a2a", 4); }
};

export const fx = (id: number, t: number, out: Stage) => {
  const burst = (key: string, t0: number, dur: number, draw: (p: Pen, u: number) => void, cw: number, ch: number, x: number, y: number, z: number, w: number, h: number) => {
    const u = q(clamp01((t - t0) / dur), 15);
    if (t >= t0 && u < 1) out.fx.push({ key: `${key}|${u}`, cw, ch, draw: (p) => draw(p, u), x, y, z, w, h });
  };
  // the dial HUD floats beside "you" in every shot that has one (follows the actor's path)
  const D = DIAL[id];
  if (D) {
    const a = acts(id)[0], pos = a.path ? a.path(t) ?? a.at : a.at, off = a.moveTo ? a.moveTo[1][1].map((v, i) => v * clamp01((t - a.moveTo![0][0]) / (a.moveTo![1][0] - a.moveTo![0][0]))) : [0, 0, 0];
    const [f, label] = D(t), close = SHOTS[id - 1].size === "close", s = close ? 0.24 : id === 4 || id === 7 ? 0.55 : 0.36;
    out.fx.push({ key: `dial|${q(f, 60)}|${label}`, cw: 300, ch: 380, draw: (p) => dial(p, f, label), x: pos[0] + off[0] + (close ? 0.36 : 0.55), y: pos[1] + off[1] + (close ? 1.25 : 1.85), z: pos[2] + off[2] + 0.15, w: s, h: s * 1.27 });
  }
  if (id === 3) burst("boing", word("trampoline") - 0.1, 0.8, (p, u) => fxExclaim(p, u), 200, 260, at(3, 0.75, -0.4)[0], 2.3, -0.4, 0.25, 0.32);
  if (id === 4) { const b = L(4, [4.5, 5.8, -8.4]); burst("land", word("jump") + 1.4, 0.7, (p, u) => fxPuff(p, u), 400, 300, b[0], b[1] + 0.2, b[2] + 0.3, 1.2, 0.9); }
  if (id === 5) { const k = clamp01((t - 22.2) / 5.2), s = at(5, -2.1 + 2.2 * k, 0.6);
    out.fx.push({ key: `skid|${Math.round(t * 10) % 8}`, cw: 400, ch: 300, draw: (p) => fxSpeed(p, (t * 2) % 1), x: s[0] - 0.55, y: 0.25, z: s[2] + 0.05, w: 0.8, h: 0.6 }); }
  if (id === 7) { const k = clamp01((t - 33.2) / 3.7), s = L(7, [-0.8 + 6.4 * k, 0, 3.2]);
    out.fx.push({ key: `bag|${Math.round(t * 6) % 12}`, cw: 260, ch: 300, draw: (p) => { p.g.translate(130, 150); p.g.rotate(t * 4); p.g.translate(-130, -150); bag(p); }, x: s[0] + 1.3, y: 1.5 + 0.4 * Math.sin(t * 4), z: s[2] + 0.3, w: 0.5, h: 0.58 });
    out.fx.push({ key: `wind|${Math.round(t * 10) % 8}`, cw: 400, ch: 300, draw: (p) => fxSpeed(p, (t * 2) % 1), x: s[0] - 1.0, y: 1.2, z: s[2] + 0.1, w: 1.6, h: 1.2 }); }
  if (id === 10) { const s = spot(10, "you"); burst("sweat", word("person") - 0.1, 0.9, fxSweatBurst, 300, 300, s[0] + 0.35, 1.75, s[2] + 0.1, 0.32, 0.32); }
  if (id === 11) { const s = at(11, -0.6, -1.4), te = word("explode");
    if (t < te) out.fx.push({ key: "chair", cw: 300, ch: 420, draw: chair, x: s[0], y: 0.46, z: s[2] - 0.12, w: 0.5, h: 0.92 });
    burst("splinters", te, 0.9, splinters, 500, 400, s[0], 0.5, s[2] + 0.2, 1.4, 1.1);
    burst("crash", te, 0.5, (p, u) => fxBurst(p, u), 512, 512, s[0], 0.5, s[2] + 0.15, 1.3, 1.3);
    burst("stars", te + 0.4, 1.2, (p, u) => fxStars(p, u), 400, 400, s[0], 1.3, s[2] + 0.1, 0.7, 0.7); }
  if (id === 16 && t > word("plane") - 0.3) { const s = spot(16, "you"), k = q(pop(t, word("plane") - 0.3), 10);
    out.fx.push({ key: `ticket|${k}`, cw: 420, ch: 220, draw: ticket, x: s[0] - 0.38, y: 1.55, z: s[2] + 0.2, w: 0.42 * k, h: 0.22 * k }); }
};

export const CAST: [string, Outfit, Partial<FrontOpts>][] = CHANNEL_CAST.map(([n, o]) => [n, o, { expr: "smile" }]);
