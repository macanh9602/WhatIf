// What If ep01 acting: "you" (the viewer, our everyman) and the neighbour, timed to the voice words, plus the shot fx
// (curtains, mower, traffic light, banana, parrot, lamp glow, bud, green light). The no-green look is a post effect
// (nogreen.ts): draw everything in its NORMAL colours, the effect turns green to black.
import { Pen, Outfit, FrontOpts, INK, POSES, fxSweatBurst, fxExclaim } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, kf, q } from "../../act";
import { YOU, NEIGHBOR, CHANNEL_CAST } from "../people";
import { SHOTS } from "./story";
import words from "./words";

const set = (id: number) => SETS[SHOTS[id - 1].set];
const spot = (id: number, name: string): V3 => set(id).spots[name] ?? set(id).origin;
const L = (id: number, [x, y, z]: V3): V3 => { const o = set(id).origin; return [o[0] + x, o[1] + y, o[2] + z]; };
const word = (text: string, occurrence = 0) => {
  const hit = words.filter((w) => w.text.replace(/[^A-Za-z']/g, "").toLowerCase() === text.toLowerCase())[occurrence];
  if (!hit) throw new Error(`Missing cast beat word: ${text} #${occurrence}`);
  return hit.start;
};
export const wearAt = (_t: number) => 0;

const PARKA: Outfit = YOU; // the lead keeps one look everywhere: signature colours + the one curly hair (user 2026-11-05)

type Pose = FrontOpts["reach"];
const PULL: Pose = [{ ex: -30, ey: -0.05, hx: -56, hy: -0.35, front: true }, { ex: 30, ey: -0.05, hx: 56, hy: -0.35, front: true }]; // both hands out, opening curtains
const PUSH: Pose = [{ ex: -6, ey: 0.4, hx: 26, hy: 0.25, front: true }, { ex: 24, ey: 0.2, hx: 50, hy: 0.25, front: true }]; // mower handle
// (no FEEL / SHADE in the 1:30 cut)

const ACTS = (id: number): Act[] => {
  switch (id) {
    case 2: return [{ i: 0, o: YOU, at: L(2, [1.15, 0, -2.15]), mode: "stand", expr: [[0, "tired"], [word("pink") - 0.3, "shock"]], reach: (t) => (t < word("curtains") ? undefined : PULL),
      face: -1, look: -0.6, head: kf([[6.2, 0], [word("pink"), -6]], 0.2) }];
    case 4: return [
      { i: 0, o: YOU, at: spot(4, "you"), mode: "stand", expr: [[0, "confused"], [word("mowing") - 0.2, "deadpan"]], face: 1, look: 1, reach: () => POSES.head_scratch },
      { i: 1, o: NEIGHBOR, at: L(4, [1.6, 0, -3.0]), mode: "stroll", phase: (t) => t * 1.4, expr: [[0, "casual"]], reach: () => PUSH, face: 1, moveTo: [[18.1, [0, 0, 0]], [23.2, [2.6, 0, 0]]] },
    ];
    case 6: return [
      { i: 0, o: YOU, at: L(6, [6.6, 0, 0.4]), mode: "stand", expr: [[0, "curious"], [word("nothing", 0), "confused"], [word("nobody"), "bruh"]], face: 1, look: 1, lookY: () => -0.6,
        reach: (t) => (t < word("nobody") ? undefined : POSES.shrug) },
      { i: 1, o: NEIGHBOR, at: L(6, [7.4, 0, -0.2]), mode: "stand", expr: [[0, "neutral"], [word("nobody"), "confused"]], face: 1, look: 1, lookY: () => -0.6,
        reach: (t) => (t < word("nobody") + 0.3 ? undefined : POSES.shrug) },
    ];
    case 9: return [{ i: 0, o: YOU, at: spot(9, "you"), mode: "stand", expr: [[0, "sigh"], [word("hurts") - 0.2, "worried"]], head: kf([[51.0, 0], [word("hurts"), -5]], 0.3) }];
    case 13: return [{ i: 0, o: PARKA, at: L(13, [-0.2, 0, -0.6]), mode: "stand", expr: [[0, "sad"], [word("growing") - 0.25, "curious"]], face: 1, look: 1, lookY: () => 0.3,
      tilt: (t) => (t < word("growing") ? 2.5 * Math.sin(t * 22) : 0), head: kf([[71.8, 0], [word("growing"), 8]], 0.3) }];
    case 15: return [{ i: 0, o: YOU, at: spot(15, "you"), mode: "stand", expr: [[0, "jawdrop"], [93.4, "smile"]], lookY: () => -0.7,
      reach: (t) => (t < word("gave") ? undefined : POSES.hold_out) }];
    default: return [];
  }
};
export const acts = ACTS;

// ---------------- fx drawings ----------------
const pop = (t: number, t0: number) => clamp01((t - t0) / 0.12) * (1 + 0.15 * Math.sin(clamp01((t - t0) / 0.3) * Math.PI));
/** one curtain panel, wavy folds, 300 x 700 */
const curtain = (p: Pen) => {
  p.poly([[0, 0], [300, 0], [290, 700], [10, 700]], "#e0738f", 8);
  for (let k = 1; k < 5; k++) p.stroke([[k * 60, 20], [k * 60 + 8, 350], [k * 60 - 6, 680]], 6, "rgba(90,30,50,.45)");
  p.poly([[0, 0], [300, 0], [300, 40], [0, 40]], "#c25a7a", 6);
};
/** push mower seen from the side, 420 x 300 */
const mower = (p: Pen) => {
  p.poly([[60, 150], [360, 150], [380, 240], [40, 240]], "#d9342b", 8);
  p.poly([[120, 110], [300, 110], [320, 150], [100, 150]], "#3a3a3a", 6);
  for (const x of [80, 330]) { p.ell(x, 255, 38, 38, "#2b2b2b", 7); p.ell(x, 255, 14, 14, "#9aa3ad", 4); }
};
/** grass clippings flying (drawn green: the post effect makes them black), 300 x 300 */
const clippings = (p: Pen, u: number) => {
  for (let k = 0; k < 14; k++) { const a = k * 2.4, r = 40 + 200 * u * (0.5 + (k % 3) * 0.25), x = 150 + Math.cos(a) * r * 0.7, y = 220 - Math.abs(Math.sin(a)) * r + 120 * u * u;
    p.poly([[x, y], [x + 16, y - 6], [x + 20, y + 4], [x + 3, y + 9]], "#4f9a3a", 3); }
};
/** traffic light head, 220 x 600; state 0 red, 1 amber, 2 the green slot (dark: no green light exists) */
const trafficLight = (p: Pen, state: number) => {
  p.poly([[20, 20], [200, 20], [200, 580], [20, 580]], "#2f3e4f", 10);
  const lamp = (y: number, on: boolean, col: string) => { p.ell(110, y, 66, 66, on ? col : "#1d232b", 7); if (on) p.ell(88, y - 22, 16, 12, "rgba(255,255,255,.7)", 0); };
  lamp(120, state === 0, "#ff3b30"); lamp(300, state === 1, "#ffb020"); lamp(480, false, "#2ee86a");
};
const question = (p: Pen) => {
  p.ell(150, 150, 140, 140, "#ffffff", 10);
  const g = p.g; g.save(); g.font = '900 200px "Arial Black", Arial'; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = INK; g.fillText("?", 150, 160); g.restore();
};
/** a parrot on a branch, 400 x 500 (green parrot: black in the no-green world, which is the joke) */
const parrot = (p: Pen, blink: boolean) => {
  p.stroke([[0, 430], [400, 410]], 34, "#5a3b2a");
  p.poly([[170, 150], [260, 140], [300, 230], [290, 360], [240, 430], [180, 420], [150, 300]], "#2fae4a", 8);
  p.poly([[180, 410], [240, 430], [210, 495], [170, 490]], "#2fae4a", 6); // tail
  p.ell(225, 150, 70, 64, "#2fae4a", 8);
  p.poly([[285, 140], [330, 160], [292, 200]], "#f0b93a", 6); // beak
  if (blink) p.stroke([[220, 140], [250, 140]], 8, INK); else { p.ell(236, 138, 18, 18, "#ffffff", 5); p.ell(240, 138, 8, 8, INK, 0); }
};
/** a new bud on a branch tip, 300 x 300, opening (green leaf: black until the payoff) */
const bud = (p: Pen, u: number) => {
  p.stroke([[0, 280], [150, 170]], 22, "#5a3b2a");
  const s = 0.3 + 0.7 * u;
  for (const a of [-0.8, 0, 0.8]) { const x = 150 + Math.sin(a) * 70 * s, y = 170 - Math.cos(a) * 80 * s;
    p.poly([[150, 170], [x - 30 * s, y + 20 * s], [x, y - 20 * s], [x + 30 * s, y + 20 * s]], "#3f9a3a", 6); }
};
/** green light handed back: soft green motes drifting from the canopy, 600 x 600 */
const motes = (p: Pen, t: number) => {
  for (let k = 0; k < 18; k++) { const ph = (t * 0.25 + k * 0.137) % 1, x = 300 + Math.sin(k * 1.9 + t) * 220 * (1 - ph * 0.6), y = 40 + ph * 520;
    const g = p.g, r = g.createRadialGradient(x, y, 1, x, y, 26); r.addColorStop(0, "rgba(140,255,120,.95)"); r.addColorStop(1, "rgba(140,255,120,0)"); g.fillStyle = r; g.fillRect(x - 26, y - 26, 52, 52); }
};

export const fx = (id: number, t: number, out: Stage) => {
  const burst = (key: string, t0: number, dur: number, draw: (p: Pen, u: number) => void, cw: number, ch: number, x: number, y: number, z: number, w: number, h: number) => {
    const u = q(clamp01((t - t0) / dur), 15);
    if (t >= t0 && u < 1) out.fx.push({ key: `${key}|${u}`, cw, ch, draw: (p) => draw(p, u), x, y, z, w, h });
  };
  if (id === 2) { // curtains slide apart on "curtains" (home window: x 0.6, w 2.4, back wall z -3.5)
    const u = q(clamp01((t - word("curtains") + 0.1) / 0.7), 20), o = set(2).origin;
    for (const s of [-1, 1]) out.fx.push({ key: `curtain|${s}|${u}`, cw: 300, ch: 700, draw: curtain, x: o[0] + 0.6 + s * (0.6 + 0.6 * u), y: 1.65, z: -3.3, w: 1.2 - 0.45 * u, h: 1.5, face: [0, 0, 1] });
  }
  if (id === 4) {
    const s = L(4, [1.6 + 2.6 * clamp01((t - 18.1) / 5.1), 0, -3.0]);
    out.fx.push({ key: "mower", cw: 420, ch: 300, draw: mower, x: s[0] + 0.75, y: 0.3, z: s[2] + 0.05, w: 0.84, h: 0.6 });
    out.fx.push({ key: `clip|${q((t * 2) % 1, 10)}`, cw: 300, ch: 300, draw: (p) => clippings(p, (t * 2) % 1), x: s[0] + 1.25, y: 0.35, z: s[2] + 0.1, w: 0.6, h: 0.6 });
  }
  if (id === 6) { // red -> amber on "yellow" -> the green slot stays dark on "nothing"
    const state = t < word("yellow") - LEAD ? 0 : t < word("nothing", 0) - LEAD ? 1 : 2, o = set(6).origin;
    out.fx.push({ key: `tl|${state}`, cw: 220, ch: 600, draw: (p) => trafficLight(p, state), x: o[0] + 8.4, y: 3.3, z: 1.25, w: 0.42, h: 1.15 });
    if (t > word("nobody") - LEAD) { const k = q(pop(t, word("nobody") - LEAD), 10); out.fx.push({ key: `q|${k}`, cw: 300, ch: 300, draw: question, x: o[0] + 7.0, y: 2.4, z: 0.3, w: 0.4 * k, h: 0.4 * k }); }
  }
  if (id === 8) { const o = set(8).origin, blink = Math.floor(t * 2.3) % 5 === 0; out.fx.push({ key: `parrot|${blink}`, cw: 400, ch: 500, draw: (p) => parrot(p, blink), x: o[0] + 1.1, y: 1.6, z: 0.0, w: 0.5, h: 0.62 }); }
  if (id === 9) burst("sweat", word("hurts") - 0.1, 0.9, fxSweatBurst, 300, 300, spot(9, "you")[0] + 0.3, 1.85, spot(9, "you")[2], 0.3, 0.3);
  if (id === 13) { const s = spot(13, "bud"), u = q(clamp01((t - word("growing") + 0.3) / 0.6), 12);
    out.fx.push({ key: `bud|${u}`, cw: 300, ch: 300, draw: (p) => bud(p, u), x: s[0] - 0.1, y: 1.35, z: s[2] + 0.5, w: 0.5, h: 0.5 });
    burst("bud!", word("growing") - 0.1, 0.8, (p, u) => fxExclaim(p, u), 200, 260, s[0] - 0.45, 1.75, s[2] + 0.4, 0.22, 0.28); }
  if (id === 15) { const o = set(15).origin; out.fx.push({ key: `motes|${Math.round(t * 10) % 40}`, cw: 600, ch: 600, draw: (p) => motes(p, t), x: o[0] + 0.2, y: 2.3, z: -0.9, w: 2.4, h: 2.4, soft: true }); }
};
export const CAST: [string, Outfit, Partial<FrontOpts>][] = CHANNEL_CAST.map(([n, o]) => [n, o, { expr: "smile" }]);
