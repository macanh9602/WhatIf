// What If ep01 acting: "you" (the viewer, our everyman) and the neighbour, timed to the voice words, plus the shot fx
// (curtains, mower, traffic light, banana, parrot, lamp glow, bud, green light). The no-green look is a post effect
// (nogreen.ts): draw everything in its NORMAL colours, the effect turns green to black.
import { Pen, Outfit, FrontOpts, INK, POSES, fxStars, fxBurst, fxSweatBurst, fxExclaim } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, kf, q } from "../../act";
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

/** you: the viewer as an everyman, blue tee + joggers (blue survives the no-green world, so "you" stays readable) */
export const YOU: Outfit = { jacket: "#3f7fd0", pants: "#3b3f52", boots: "#f4f1ea", hat: null, build: "adult", top: "tee", bottom: "joggers", shoe: "sneaker", style: "spiky", hair: "#5a3b2a" };
const PARKA: Outfit = { ...YOU, layer: { kind: "jacket", color: "#d9542f", long: true }, longSleeves: true, acc: ["headband"] };
const NEIGHBOR: Outfit = { jacket: "#c63939", pants: "#405a7a", boots: "#394b50", hat: null, build: "stout", top: "button", pattern: "plaid", bottom: "jeans", shoe: "boot", style: "balding", hair: "#8a8a8a", moustache: "#6a6a6a", acc: ["cap"] };

type Pose = FrontOpts["reach"];
const PULL: Pose = [{ ex: -30, ey: -0.05, hx: -56, hy: -0.35, front: true }, { ex: 30, ey: -0.05, hx: 56, hy: -0.35, front: true }]; // both hands out, opening curtains
const PUSH: Pose = [{ ex: -6, ey: 0.4, hx: 26, hy: 0.25, front: true }, { ex: 24, ey: 0.2, hx: 50, hy: 0.25, front: true }]; // mower handle
const FEEL: Pose = [{ ex: -30, ey: 0.0, hx: -58, hy: -0.15, front: true }, { ex: 30, ey: 0.0, hx: 58, hy: -0.15, front: true }]; // arms out in the dark
const SHADE: Pose = [undefined, { ex: 22, ey: -0.1, hx: 4, hy: -0.62, front: true }]; // hand shading the eyes

const ACTS = (id: number): Act[] => {
  switch (id) {
    case 2: return [{ i: 0, o: YOU, at: L(2, [0.15, 0, -2.0]), mode: "stand", expr: [[0, "tired"], [word("pink") - 0.3, "shock"]], reach: (t) => (t < word("curtains") ? undefined : PULL),
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
    case 7: return [{ i: 0, o: YOU, at: spot(7, "you"), mode: "stand", expr: [[0, "tired"]], reach: () => SHADE, lookY: () => -0.6 }];
    case 8: return [{ i: 0, o: YOU, at: spot(8, "you"), mode: "stand", expr: [[0, "confused"], [word("imagination") - 0.2, "worried"]], head: kf([[41.4, 0], [42.4, 6]], 0.3) }];
    case 10: return [{ i: 0, o: YOU, at: spot(10, "you"), mode: "stand", expr: [[0, "deadpan"]], reach: (t) => (t < word("take") ? undefined : POSES.facepalm) }];
    case 11: return [{ i: 0, o: YOU, at: L(11, [0.35, 0, -1.25]), mode: "stand", expr: [[0, "confused"], [word("copper") - 0.2, "shock"], [word("black", 2), "jawdrop"]], lookY: () => 0.6, look: -0.4,
      reach: (t) => (t < word("ring") ? undefined : POSES.hold_out), prop: (t) => (t < word("ring") ? null : null) }];
    case 13: return [{ i: 0, o: YOU, at: L(13, [-1.6, 0, -0.4]), mode: "stand", expr: [[0, "worried"]], lookY: () => -0.8, look: 0.3 }];
    case 14: return [{ i: 0, o: YOU, at: L(14, [-5.5, 0, 0.6]), mode: "stroll", phase: (t) => t * 0.9, expr: [[0, "scared"], [80.4, "dazed"]], reach: () => FEEL, face: 1,
      moveTo: [[75.6, [0, 0, 0]], [80.4, [2.0, 0, 0]]], tilt: (t) => (t > 80.4 ? -6 : 0) }];
    case 15: return [{ i: 0, o: YOU, at: spot(15, "you"), mode: "stand", expr: [[0, "sigh"], [word("hurts") - 0.2, "worried"]], head: kf([[82.0, 0], [word("hurts"), -5]], 0.3) }];
    case 22: return [{ i: 0, o: PARKA, at: L(22, [0, 0, 0]), mode: "stand", expr: [[0, "tired"], [word("frozen") - 0.2, "sad"]], tilt: (t) => 2.5 * Math.sin(t * 22), reach: () => POSES.arms_crossed }];
    case 23: return [{ i: 0, o: PARKA, at: L(23, [-0.2, 0, -0.6]), mode: "stand", expr: [[0, "sad"], [word("growing") - 0.25, "curious"]], face: 1, look: 1, lookY: () => 0.3,
      head: kf([[129.3, 0], [word("growing"), 8]], 0.3) }];
    case 25: return [{ i: 0, o: YOU, at: spot(25, "you"), mode: "stand", expr: [[0, "jawdrop"], [154.0, "excited"]], lookY: () => -0.7 }];
    case 26: return [{ i: 0, o: YOU, at: L(26, [0, 0, -0.6]), mode: "stand", expr: [[0, "curious"], [word("gave") - 0.2, "smile"]], lookY: () => -0.4, look: 0.4,
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
/** the sun with a dimmer knob turned down, 500 x 500 */
const sunDimmer = (p: Pen, u: number) => {
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; p.stroke([[250 + Math.cos(a) * 170, 250 + Math.sin(a) * 170], [250 + Math.cos(a) * 230, 250 + Math.sin(a) * 230]], 22, "#ffd23f"); }
  p.ell(250, 250, 150, 150, "#ffd23f", 10);
  p.ell(250, 250, 70, 70, "#9aa3ad", 8);
  const a = -2.2 + 3.0 * (1 - u); p.stroke([[250, 250], [250 + Math.cos(a) * 60, 250 + Math.sin(a) * 60]], 16, INK);
  const g = p.g; g.save(); g.font = '900 44px "Arial Black", Arial'; g.fillStyle = INK; g.textAlign = "center"; g.fillText("MAX", 380, 110); g.fillText("MIN", 120, 110); g.restore();
};
const sunglasses = (p: Pen) => {
  p.poly([[10, 40], [190, 40], [180, 130], [30, 130]], "#14141a", 8);
  p.poly([[230, 40], [410, 40], [390, 130], [240, 130]], "#14141a", 8);
  p.stroke([[190, 60], [230, 60]], 14, "#14141a");
  p.stroke([[50, 60], [90, 90]], 10, "rgba(255,255,255,.5)"); p.stroke([[270, 60], [310, 90]], 10, "rgba(255,255,255,.5)");
};
/** a banana on a plate, 400 x 260 (yellow: the effect turns it orange) */
const banana = (p: Pen) => {
  p.ell(200, 210, 190, 40, "#f5efd9", 7);
  p.poly([[40, 120], [120, 175], [250, 180], [360, 110], [370, 90], [340, 105], [240, 140], [120, 135], [60, 100]], "#f2d43a", 8);
  p.stroke([[60, 100], [40, 120]], 14, "#5a3b2a");
};
/** a gold ring with a gem, 200 x 200 */
const ring = (p: Pen) => { p.ell(100, 120, 70, 60, null, 0); const g = p.g; g.save(); g.strokeStyle = INK; g.lineWidth = 34; g.beginPath(); g.ellipse(100, 120, 62, 54, 0, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = "#f0c419"; g.lineWidth = 22; g.stroke(); g.restore(); p.poly([[80, 50], [120, 50], [132, 70], [100, 92], [68, 70]], "#ffffff", 6); };
/** a parrot on a branch, 400 x 500 (green parrot: black in the no-green world, which is the joke) */
const parrot = (p: Pen, blink: boolean) => {
  p.stroke([[0, 430], [400, 410]], 34, "#5a3b2a");
  p.poly([[170, 150], [260, 140], [300, 230], [290, 360], [240, 430], [180, 420], [150, 300]], "#2fae4a", 8);
  p.poly([[180, 410], [240, 430], [210, 495], [170, 490]], "#2fae4a", 6); // tail
  p.ell(225, 150, 70, 64, "#2fae4a", 8);
  p.poly([[285, 140], [330, 160], [292, 200]], "#f0b93a", 6); // beak
  if (blink) p.stroke([[220, 140], [250, 140]], 8, INK); else { p.ell(236, 138, 18, 18, "#ffffff", 5); p.ell(240, 138, 8, 8, INK, 0); }
};
const glow = (p: Pen, k: number) => { const g = p.g, r = g.createRadialGradient(200, 200, 10, 200, 200, 200); r.addColorStop(0, `rgba(255,214,140,${0.9 * k})`); r.addColorStop(1, "rgba(255,214,140,0)"); g.fillStyle = r; g.fillRect(0, 0, 400, 400); };
const moon = (p: Pen, k: number) => { p.ell(150, 150, 120, 120, `rgba(240,238,225,${k})`, 8); p.ell(110, 120, 22, 18, `rgba(190,190,180,${k})`, 0); p.ell(180, 190, 30, 24, `rgba(190,190,180,${k})`, 0); };
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
  if (id === 2) { // curtains slide apart on "curtains"
    const u = q(clamp01((t - word("curtains") + 0.1) / 0.7), 20), o = set(2).origin;
    for (const s of [-1, 1]) out.fx.push({ key: `curtain|${s}|${u}`, cw: 300, ch: 700, draw: curtain, x: o[0] - 0.7 + s * (0.55 + 0.55 * u), y: 1.6, z: -3.2, w: 1.1 - 0.4 * u, h: 1.6, face: [0, 0, 1] });
  }
  if (id === 4) {
    const s = L(4, [1.6 + 2.6 * clamp01((t - 18.1) / 5.1), 0, -3.0]);
    out.fx.push({ key: "mower", cw: 420, ch: 300, draw: mower, x: s[0] + 0.75, y: 0.3, z: s[2] + 0.05, w: 0.84, h: 0.6 });
    out.fx.push({ key: `clip|${q((t * 2) % 1, 10)}`, cw: 300, ch: 300, draw: (p) => clippings(p, (t * 2) % 1), x: s[0] + 1.25, y: 0.35, z: s[2] + 0.1, w: 0.6, h: 0.6 });
  }
  if (id === 6) { // red -> amber on "yellow" -> the green slot stays dark on "nothing"
    const state = t < word("yellow") - LEAD ? 0 : t < word("nothing", 0) - LEAD ? 1 : 2, o = set(6).origin;
    out.fx.push({ key: `tl|${state}`, cw: 220, ch: 600, draw: (p) => trafficLight(p, state), x: o[0] + 8.4, y: 3.3, z: 1.25, w: 0.42, h: 1.15 });
    if (t > word("nobody") - LEAD) { const k = q(pop(t, word("nobody") - LEAD), 10); out.fx.push({ key: `q|${k}`, cw: 300, ch: 300, draw: question, x: o[0] + 7.0, y: 2.25, z: 0.3, w: 0.4 * k, h: 0.4 * k }); }
  }
  if (id === 7) { const u = q(clamp01((t - 38.0) / 2.6), 20), o = set(7).origin; out.fx.push({ key: `sun|${u}`, cw: 500, ch: 500, draw: (p) => sunDimmer(p, u), x: o[0] + 0.5, y: 8.5, z: -16, w: 5, h: 5, soft: true }); }
  if (id === 10 && t > word("sunglasses") - LEAD) { const s = spot(10, "you"), k = q(pop(t, word("sunglasses") - LEAD), 10);
    out.fx.push({ key: `shades|${k}`, cw: 420, ch: 160, draw: sunglasses, x: s[0], y: 1.52, z: s[2] + 0.12, w: 0.3 * k, h: 0.115 * k }); }
  if (id === 11) { const o = set(11).origin;
    if (t > word("banana") - LEAD) out.fx.push({ key: "banana", cw: 400, ch: 260, draw: banana, x: o[0] - 0.05, y: 1.08, z: 0.35, w: 0.4, h: 0.26 });
    if (t > word("ring") - LEAD) { const k = q(pop(t, word("ring") - LEAD), 10); out.fx.push({ key: `ring|${k}`, cw: 200, ch: 200, draw: ring, x: o[0] + 0.32, y: 1.06, z: 0.4, w: 0.13 * k, h: 0.13 * k }); }
    if (t > word("parrot") - LEAD) out.fx.push({ key: "parrot-win", cw: 400, ch: 500, draw: (p) => parrot(p, false), x: o[0] - 1.1, y: 1.55, z: -3.5, w: 0.5, h: 0.62, face: [0, 0, 1] });
  }
  if (id === 12) { const o = set(12).origin, blink = Math.floor(t * 2.3) % 5 === 0; out.fx.push({ key: `parrot|${blink}`, cw: 400, ch: 500, draw: (p) => parrot(p, blink), x: o[0] + 1.1, y: 1.6, z: 0.0, w: 0.5, h: 0.62 }); }
  if (id === 13 || id === 14) { const o = set(id).origin;
    out.fx.push({ key: "lampglow", cw: 400, ch: 400, draw: (p) => glow(p, 1), x: o[0] - 3.2, y: 3.45, z: 0.9, w: 2.4, h: 2.4, soft: true });
    if (id === 13) { const k = q(1 - 0.6 * clamp01((t - 70.5) / 4), 20); out.fx.push({ key: `moon|${k}`, cw: 300, ch: 300, draw: (p) => moon(p, k), x: o[0] + 3, y: 9, z: -18, w: 2.4, h: 2.4, soft: true }); }
  }
  if (id === 14) { burst("stars", 80.4, 1.4, (p, u) => fxStars(p, u), 400, 400, set(14).origin[0] - 3.4, 1.85, 0.7, 0.7, 0.7); burst("bonk", 80.4, 0.5, (p, u) => fxBurst(p, u), 512, 512, set(14).origin[0] - 3.3, 1.6, 0.7, 0.8, 0.8); }
  if (id === 15) burst("sweat", word("hurts") - 0.1, 0.9, fxSweatBurst, 300, 300, spot(15, "you")[0] + 0.25, 1.75, spot(15, "you")[2], 0.3, 0.3);
  if (id === 23) { const s = spot(23, "bud"), u = q(clamp01((t - word("growing") + 0.3) / 0.6), 12);
    out.fx.push({ key: `bud|${u}`, cw: 300, ch: 300, draw: (p) => bud(p, u), x: s[0] - 0.1, y: 1.35, z: s[2] + 0.5, w: 0.5, h: 0.5 });
    burst("bud!", word("growing") - 0.1, 0.8, (p, u) => fxExclaim(p, u), 200, 260, s[0] - 0.45, 1.7, s[2], 0.22, 0.28); }
  if (id === 25 || id === 26) { const o = set(id).origin; out.fx.push({ key: `motes|${Math.round(t * 10) % 40}`, cw: 600, ch: 600, draw: (p) => motes(p, t), x: o[0] + 0.2, y: 2.3, z: -0.9, w: 2.4, h: 2.4, soft: true }); }
};
