// What If ep08 acting: you grow gills, wade into the sea, swim the reef, get cold, and end up breathing the bath.
// Timed to the voice words, plus the shot fx (gills, bubbles, fish, the opah, thermometers, frost, steam, the pump).
// Lying in the tub and swimming are the YOU card drawn into an fx card (bodyFront + gills), laid flat or turned.
import { Pen, Outfit, FrontOpts, INK, POSES, bodyFront, fxBurst, fxExclaim, fxSplash, fxRing, fxCreak } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, Track, LEAD, q, fkey, exprAt, exprAnim, lidAt } from "../../act";
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
const SU = 0.00216; // metres per design unit (engine cast.ts SU; not imported: that module imports this one)
const lerp = (a: number, b: number, k: number) => a + (b - a) * clamp01(k);
const sm = (k: number) => { const u = clamp01(k); return u * u * (3 - 2 * u); };
/** hand to the side of the neck, where the gills are (left arm, screen right) */
const NECK: Pose = [undefined, { ex: 24, ey: 0.32, hx: 4, hy: -0.12, front: true }];
const HUG = POSES.arms_crossed;
const SWIM_A: Pose = [{ ex: -26, ey: -0.45, hx: -34, hy: -1.05, front: true }, { ex: 26, ey: 0.3, hx: 22, hy: 0.85, front: false }];
const SWIM_B: Pose = [{ ex: -26, ey: 0.3, hx: -22, hy: 0.85, front: false }, { ex: 26, ey: -0.45, hx: 34, hy: -1.05, front: true }];
const TREAD: Pose = [{ ex: -30, ey: 0.2, hx: -50, hy: 0.05, front: false }, { ex: 30, ey: 0.2, hx: 50, hy: 0.05, front: false }];

// ---- places (set-local) ----
const TUB: V3 = [-0.9, 0, -2.3];
const BED_Y = 0.788, BODY_Y = 0.8, WATER_Y = 0.815, LIE_SC = 0.72; // flat cards sit just over the rim (0.78), the water card over the body
const HEAD_UNDER = -0.36; // head centre x (local) when lying under the water; head is at +x, feet toward the tap
const PUMP_IN: V3 = [-0.42, 0.8, -2.5]; // where the dropped air stone bubbles
const BEACH_START: V3 = [0.0, 0, -3.2];
const ME_TAP: V3 = [-2.05, 0, -1.55]; // left of the tub's tap end

/** beach depth: the card sinks into the sea past the shoreline (z -6) */
const shiverTilt = (t: number, s: number) => (t > s ? 2.5 * Math.sin(t * 47) : 2 * Math.sin(t * 1.5));
const wadeY = (z: number) => -Math.min(0.9, Math.max(0, (-z - 5.9) * 0.55));

const ACTS = (id: number): Act[] => {
  switch (id) {
    case 2: { const g = word("gills") - LEAD; return [
      { i: 0, o: YOU, at: L(2, [0, 0, 0]), mode: "stand", expr: [[0, "tired"], [g, "shock"], [g + 0.7, "curious"]], lookY: (t) => (t > g + 0.7 ? 0.25 : 0),
        reach: (t) => (t < word("waking") - 0.1 ? undefined : t < g - 0.15 ? POSES.hands_up : NECK), head: (t) => (t > g ? -6 : 0) },
    ]; }
    case 3: { const s0 = 7.25, s1 = 9.5, dunk = word("breath", 10) - 0.25;
      return [{ i: 0, o: YOU, at: L(3, BEACH_START), mode: "stroll", noShadow: true, phase: (t) => (t < s1 ? t * 1.5 : 0),
        expr: [[0, "curious"], [word("wade") - LEAD, "resolve"], [dunk - 0.4, "nervous"]],
        reach: (t) => (t > s1 ? TREAD : undefined),
        path: (t) => { const z = lerp(BEACH_START[2], -7.4, (t - s0) / (s1 - s0)), d = sm((t - dunk) / 0.3);
          const y = wadeY(z) - 1.3 * d; return y < -2.0 ? null : L(3, [0, y, z]); } }]; }
    case 4: { const w = word("works") - LEAD, h = word("heavy") - LEAD; return [
      { i: 0, o: YOU, at: L(4, [0, 1.2, 0]), mode: "fall", noShadow: true, expr: [[0, "curious"], [w, "smile"], [h, "pained"]], reach: () => TREAD,
        drift: (t) => [0, 0.05 * Math.sin(t * 2.1) - 0.18 * sm((t - h) / 0.3), 0] },
    ]; }
    case 8: { const s = word("shiver") - LEAD; return [
      { i: 0, o: YOU, at: L(8, [0, 1.2, 0]), mode: "fall", noShadow: true, expr: [[0, "worried"], [s, "scared"]], reach: () => HUG, lookY: () => 0.1,
        drift: (t) => [t > s ? 0.012 * Math.sin(t * 55) : 0, 0.04 * Math.sin(t * 2), 0], tilt: (t) => shiverTilt(t, s) },
    ]; }
    case 11: return [
      { i: 0, o: YOU, at: L(11, [-0.6, 2.1, -2.0]), mode: "fall", noShadow: true, expr: [[0, "worried"], [word("cold", 51) - LEAD, "scared"]], reach: () => HUG, look: 0.5,
        drift: (t) => [0.01 * Math.sin(t * 50), 0.04 * Math.sin(t * 2), 0], tilt: (t) => 2 * Math.sin(t * 43) },
    ];
    case 12: return [
      { i: 0, o: YOU, at: L(12, [-0.55, 1.4, -1.9]), mode: "fall", noShadow: true, look: 0.6,
        expr: [[0, "curious"], [word("warm", 55) - LEAD, "jawdrop"], [word("five", 57) - LEAD, "confused"]], reach: (t) => (t > word("warm", 55) - 0.1 ? POSES.point_right : HUG),
        drift: (t) => [0.008 * Math.sin(t * 50), 0.04 * Math.sin(t * 2), 0] },
    ];
    case 13: { const s0 = 59.9, s1 = 61.5; return [
      { i: 0, o: YOU, at: L(13, [0, 0, -7.0]), mode: "stroll", noShadow: true, phase: (t) => t * 1.5, expr: [[0, "tired"]], reach: () => HUG,
        tilt: (t) => 1.5 * Math.sin(t * 45),
        path: (t) => { const z = lerp(-7.0, -4.4, (t - s0) / (s1 - s0)); return L(13, [0, wadeY(z), z]); } },
    ]; }
    case 14: { const hot = word("hot", 62) - LEAD, drop = word("drop", 64) - 0.1; return [
      { i: 0, o: YOU, at: L(14, ME_TAP), mode: "stand", look: 0.5, expr: [[0, "concentrate"], [hot, "pained"], [drop - 0.5, "concentrate"]],
        reach: () => POSES.point_right },
    ]; }
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
const tagCard = (p: Pen, s: string, col = "#ffd23f", bg = "#16325c", px = 56) => { panel(p, 10, 10, 490, 150, bg, 8); text(p, s, 250, 80, px, col, bg); };

/** three gill slits each side of the jaw, in YOU's 600 x 1000 design coordinates (head seed 1); open 0..1 flutters them */
const gills = (p: Pen, open: number) => {
  for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
    const x = 300 + side * (46 + 11 * k), y0 = 384 + 2 * k, y1 = 414 - 3 * k, b = side * 7, n = 8, pts: [number, number][] = [];
    for (let i = 0; i <= n; i++) { const u = i / n; pts.push([x + b * Math.sin(Math.PI * u), y0 + (y1 - y0) * u]); }
    p.stroke(pts, 3.5 + 2 * open, "#a3263f");
  }
};
const gillOpen = (t: number) => q(0.5 + 0.5 * Math.sin(t * 7.5), 4);

/** the YOU card drawn into an fx card (lying flat, swimming): same drawing as the actor card, with gills */
type YouPose = { expr: Track; reach?: Pose; mode?: FrontOpts["mode"]; phase?: number; look?: number; lookY?: number; wave?: number };
const youFx = (out: Stage, t: number, pose: YouPose, at: V3, sc: number, extra: { flat?: boolean; rot?: number } = {}, res = 1.5) => {
  const fo: FrontOpts = { mode: pose.mode ?? "stand", expr: exprAt(pose.expr, t), ...exprAnim(pose.expr, t), blink: lidAt(t, 0, pose.expr.slice(1).map(([s]) => s)),
    reach: pose.reach, wave: pose.wave, look: pose.look ?? 0, lookY: pose.lookY ?? 0, phase: pose.phase ?? 0, seed: 1 };
  const g = gillOpen(t);
  out.fx.push({ key: `you|${res}|${fkey(fo)}|${g}`, cw: 600 * res, ch: 1000 * res, x: at[0], y: at[1], z: at[2], w: 600 * SU * sc, h: 1000 * SU * sc, ...extra,
    draw: (p) => { p.g.save(); p.g.scale(res, res); bodyFront(p, YOU, fo); p.rot = null; gills(p, g); p.g.restore(); } });
};
/** gill overlay on the standing actor card: feet at `feet`, a little toward the camera */
const gillCard = (out: Stage, t: number, feet: V3, dz = 0.05, tilt = 0) => {
  const g = gillOpen(t), a = (tilt * Math.PI) / 180;
  out.fx.push({ key: `gill|${g}`, cw: 300, ch: 100, x: feet[0] + 0.54 * Math.sin(a), y: feet[1] + (975 - 380) * SU, z: feet[2] + dz, w: 300 * SU, h: 100 * SU, rot: -a,
    draw: (p) => { p.g.save(); p.g.translate(-150, -330); gills(p, g); p.g.restore(); } });
};

const bubble = (p: Pen) => { p.ell(32, 32, 24, 24, "rgba(225,250,255,0.35)", 0); p.arc(32, 32, 24, 24, 0, 360, 5, "#eafcff"); p.dot(24, 23, 5, "#ffffff"); };
/** a column of bubbles rising from `base` to `top` (world y), n at a time */
const bubbles = (out: Stage, t: number, key: string, base: V3, top: number, n = 5, size = 0.07, spread = 0.06, speed = 0.55) => {
  const rise = top - base[1];
  for (let i = 0; i < n; i++) {
    const k = ((t * speed + i / n) % 1 + 1) % 1, s = size * (0.6 + 0.4 * ((i * 7) % 5) / 4) * (1 - 0.3 * k);
    out.fx.push({ key: `bub|${key}`, cw: 64, ch: 64, draw: bubble, soft: true, x: base[0] + spread * Math.sin(t * 3 + i * 2.1), y: base[1] + rise * k, z: base[2] + spread * Math.cos(t * 2.3 + i), w: s, h: s });
  }
};
/** a puff of breath bubbles out of a mouth at t0 */
const breath = (out: Stage, t: number, t0: number, mouth: V3, rise = 0.9) => {
  for (let i = 0; i < 7; i++) {
    const k = (t - t0 - i * 0.07) / 1.1; if (k < 0 || k > 1) continue;
    const s = 0.05 + 0.03 * (i % 3);
    out.fx.push({ key: "bub|b", cw: 64, ch: 64, draw: bubble, soft: true, x: mouth[0] + 0.12 * Math.sin(i * 2.4 + k * 4), y: mouth[1] + rise * k, z: mouth[2] + 0.05, w: s, h: s });
  }
};
/** a flat reef fish facing right on a 600 x 320 canvas; wag -1..1 swings the tail */
const fish = (p: Pen, body: string, belly: string, fin: string, wag: number, stripes = true) => {
  const tw = 40 * wag;
  p.poly([[140, 160], [40, 80 + tw], [70, 160], [40, 240 + tw]], fin, 8);
  p.poly([[250, 82], [330, 30], [380, 78]], fin, 7);
  p.ell(310, 160, 200, 100, body, 9);
  p.clip([[110, 165], [510, 165], [510, 270], [110, 270]], () => p.ell(310, 160, 200, 100, belly, 0));
  p.ell(310, 160, 200, 100, null, 9);
  if (stripes) for (const x of [250, 330]) p.stroke([[x, 72], [x - 14, 160], [x, 250]], 16, "rgba(255,255,255,.75)");
  p.poly([[300, 190], [350, 215], [300, 225]], fin, 6);
  p.ell(440, 140, 30, 30, "#ffffff", 6); p.dot(448, 140, 14, INK);
  p.arc(495, 175, 14, 10, 20, 160, 6);
};
/** the opah: a round red-and-silver disc with white spots, crimson fins, a gold eye; facing right on 700 x 620 */
const opah = (p: Pen, wag: number, heart: number) => {
  const RED = "#d8324a", SIL = "#e9b9c4";
  p.poly([[120, 310], [20, 200 + 30 * wag], [60, 310], [20, 420 + 30 * wag]], RED, 9);
  p.poly([[300, 120], [380, 20], [470, 60], [420, 130]], RED, 8);
  p.ell(350, 310, 250, 215, "#f07a5a", 10);
  p.clip([[80, 330], [620, 330], [620, 560], [80, 560]], () => p.ell(350, 330, 250, 200, SIL, 0));
  p.ell(350, 310, 250, 215, null, 10);
  for (const [x, y, r] of [[260, 220, 14], [330, 180, 11], [410, 230, 13], [300, 300, 12], [380, 290, 10], [220, 300, 10], [450, 340, 11], [340, 380, 12], [260, 400, 10]] as const) p.ell(x, y, r, r, "#fff7f0", 0);
  p.poly([[360, 330], [470, 380], [380, 400]], RED, 7);
  p.ell(520, 250, 46, 46, "#ffd23f", 8); p.dot(530, 250, 22, INK);
  p.arc(588, 320, 18, 12, 20, 160, 7);
  if (heart > 0) { // a glowing warm heart behind the gills
    const s = 0.8 + 0.25 * heart;
    p.ell(470, 360, 70 * s, 62 * s, `rgba(255,214,90,${(0.45 * heart).toFixed(2)})`, 0);
    heartShape(p, 470, 360, 40 * s, "#ff2d4a");
  }
};
const heartShape = (p: Pen, cx: number, cy: number, r: number, col: string) => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2, x = 16 * Math.sin(a) ** 3, y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); pts.push([cx + (x * r) / 16, cy + (y * r) / 16]); }
  p.poly(pts, col, 6);
};
/** thermometer on 160 x 560: fill 0..1, colour; optional label under the bulb */
const thermo = (p: Pen, k: number, col: string, label = "") => {
  panel(p, 52, 24, 108, 420, "#f4f1ea", 8);
  p.ell(80, 455, 50, 50, col, 8);
  p.poly([[64, 440], [64, 410 - 370 * k], [96, 410 - 370 * k], [96, 440]], col, 0);
  for (let i = 0; i < 6; i++) p.stroke([[100, 380 - i * 60], [116, 380 - i * 60]], 5, INK);
  if (label) text(p, label, 80, 535, 38, "#ffffff");
};
/** body heat HUD, 480 x 180: k 1 (full) .. 0.2 (low), a falling bar with no numbers */
const tempHud = (p: Pen, k: number) => {
  const col = k > 0.6 ? "#ff8a3d" : k > 0.35 ? "#9fd8ff" : "#4aa8ff";
  panel(p, 10, 20, 470, 170, "rgba(22,50,92,.92)");
  p.ell(70, 125, 26, 26, col, 6); panel(p, 58, 40, 82, 112, "#f4f1ea", 5); p.poly([[62, 108], [62, 108 - 62 * k - 6], [78, 108 - 62 * k - 6], [78, 108]], col, 0);
  text(p, "BODY HEAT", 285, 62, 44, "#ffffff");
  panel(p, 120, 95, 450, 148, "#2b2f3a", 5); panel(p, 125, 100, 125 + 320 * k, 143, col, 0);
};
/** frost on the brows: an icy band with icicles, 420 x 140 */
const frost = (p: Pen) => {
  const top: [number, number][] = [], bot: [number, number][] = [];
  for (let i = 0; i <= 14; i++) { const x = 20 + i * 27.1; top.push([x, 40 + 10 * Math.sin(i * 2.7)]); bot.push([x, 70 + (i % 2 ? 40 + 14 * Math.sin(i) : 8)]); }
  p.poly([...top, ...bot.reverse()], "#e6f7ff", 6);
  for (const [x, y] of [[80, 55], [180, 50], [300, 58]] as const) { p.stroke([[x - 12, y], [x + 12, y]], 4, "#8fd3ff"); p.stroke([[x, y - 12], [x, y + 12]], 4, "#8fd3ff"); }
};
const snowflake = (p: Pen) => { for (let k = 0; k < 3; k++) { const a = (k * Math.PI) / 3; p.line([[60 - 48 * Math.cos(a), 60 - 48 * Math.sin(a)], [60 + 48 * Math.cos(a), 60 + 48 * Math.sin(a)]], "#dff3ff", 9); } };
const steam = (p: Pen, ph: number) => {
  const pts: [number, number][] = []; for (let i = 0; i <= 12; i++) { const y = 380 - i * 30; pts.push([100 + 38 * Math.sin(i * 0.7 + ph * 6.28), y]); }
  p.stroke(pts, 30, "rgba(255,255,255,0.55)"); p.stroke(pts, 12, "rgba(255,255,255,0.8)");
};
/** the tub's inner outline on the 600 x 260 water cards (a superellipse: the rounded tub has no square corners) */
const TUB_IN: [number, number][] = Array.from({ length: 64 }, (_, i) => { const a = (i / 64) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
  return [300 + 292 * Math.sign(c) * Math.abs(c) ** 0.45, 130 + 122 * Math.sign(s) * Math.abs(s) ** 0.45]; });
const waterBed = (p: Pen) => p.poly(TUB_IN, "#3fb6d6", 0);
const waterSheet = (p: Pen, ph: number) => {
  p.poly(TUB_IN, "rgba(70,190,225,0.3)", 0);
  for (const y of [34, 226]) { const o = 30 * Math.sin(ph * 6.28 + y); p.stroke([[70 + o, y], [200 + o, y + 6], [380 + o, y - 5], [530 + o, y + 3]], 5, "rgba(235,252,255,0.85)"); }
};
const stream = (p: Pen, ph: number) => {
  const pts: [number, number][] = []; for (let i = 0; i <= 10; i++) pts.push([30 + 4 * Math.sin(i * 1.3 + ph * 6.28), 10 + i * 38]);
  p.stroke(pts, 26, "#7fd6e6"); p.stroke(pts.map(([x, y]) => [x - 5, y]), 7, "#e8fbff");
};
/** the aquarium air pump's air stone on its clear tube, 220 x 200 */
const airStone = (p: Pen) => {
  p.stroke([[110, 10], [120, 60], [100, 110], [110, 140]], 10, "#cfe9f2"); p.stroke([[110, 10], [120, 60], [100, 110], [110, 140]], 3, INK);
  p.ell(110, 160, 48, 30, "#6a7487", 7); for (const [x, y] of [[92, 155], [118, 166], [128, 150]] as const) p.dot(x, y, 5, "#3e4656");
};
const lungsGills = (p: Pen) => {
  panel(p, 10, 10, 590, 290, "#16325c", 8);
  p.ell(95, 130, 52, 78, "#ff9fb0", 7); p.ell(185, 130, 52, 78, "#ff9fb0", 7); p.stroke([[140, 40], [140, 95]], 14, "#ff9fb0");
  text(p, "LUNGS", 140, 250, 40, "#ffffff");
  p.stroke([[255, 140], [345, 140]], 12, "#ffd23f"); p.poly([[335, 118], [365, 140], [335, 162]], "#ffd23f", 0); p.poly([[265, 118], [235, 140], [265, 162]], "#ffd23f", 0);
  for (let k = 0; k < 3; k++) p.stroke([[410 + k * 34, 70], [430 + k * 34, 130], [410 + k * 34, 190]], 14, "#a3263f");
  text(p, "GILLS", 460, 250, 40, "#ffffff");
};

export const fx = (id: number, t: number, out: Stage) => {
  const burst = (key: string, t0: number, dur: number, draw: (p: Pen, u: number) => void, cw: number, ch: number, x: number, y: number, z: number, w: number, h: number, flat = false) => {
    const u = q(clamp01((t - t0) / dur), 15);
    if (t >= t0 && u < 1) out.fx.push({ key: `${key}|${u}`, cw, ch, draw: (p) => draw(p, u), x, y, z, w, h, flat });
  };
  /** a card that pops in at t0 and stays until t1 */
  const hold = (key: string, t0: number, t1: number, draw: (p: Pen) => void, cw: number, ch: number, x: number, y: number, z: number, w: number, h: number) => {
    if (t < t0 || t > t1) return; const k = q(pop(t, t0), 10);
    out.fx.push({ key: `${key}|${k}`, cw, ch, draw, x, y, z, w: w * k, h: h * k });
  };
  const ph = (f: number) => q((t * f) % 1, 12);
  /** the tub scene: you lying under (or with your head above) the water, steam, the bubbling stone */
  const tub = (sid: number, headX: number, pose: YouPose) => {
    const c = L(sid, [headX - (500 - 309) * SU * LIE_SC, BODY_Y, TUB[2]]);
    youFx(out, t, pose, c, LIE_SC, { flat: true, rot: -Math.PI / 2 }, 2);
    const w = L(sid, [TUB[0], WATER_Y, TUB[2]]);
    out.fx.push({ key: "waterBed", cw: 600, ch: 260, draw: waterBed, flat: true, x: w[0], y: BED_Y, z: w[2], w: 1.56, h: 0.64 });
    out.fx.push({ key: `water|${ph(0.25)}`, cw: 600, ch: 260, draw: (p) => waterSheet(p, ph(0.25)), soft: true, flat: true, x: w[0], y: w[1], z: w[2], w: 1.56, h: 0.64 });
    bubbles(out, t, "stone", L(sid, PUMP_IN), 1.2, 6, 0.06, 0.04, 0.7);
    for (const [i, dx, dz] of [[0, -0.55, 0.42], [1, -0.15, -0.42], [2, -0.75, -0.4]] as const) { const s = L(sid, [TUB[0] + dx, 1.0, TUB[2] + dz]), f = ph(0.3 + i * 0.07);
      out.fx.push({ key: `steam|${f}`, cw: 200, ch: 400, draw: (p) => steam(p, f), soft: true, x: s[0], y: s[1] + 0.15 * f, z: s[2], w: 0.16, h: 0.32 }); }
  };
  const mouthUnder = (sid: number, headX: number): V3 => L(sid, [headX - 0.05, BODY_Y + 0.02, TUB[2]]);
  if (id === 1) {
    const wv = word("live") - 0.1;
    tub(1, HEAD_UNDER, { expr: [[0, "smile"], [word("only") - LEAD, "grin"]], reach: t > wv ? POSES.wave : undefined, wave: t > wv ? q(Math.sin(t * 9), 6) : undefined });
    for (const t0 of [0.2, 1.6, 3.0, 4.4]) { breath(out, t, t0, mouthUnder(1, HEAD_UNDER), 0.6);
      burst("ring", t0 + 0.3, 0.9, (p, u) => fxRing(p, u), 600, 600, mouthUnder(1, HEAD_UNDER)[0], WATER_Y + 0.01, TUB[2], 0.5, 0.5, true); }
  }
  if (id === 2) { const s = L(2, [0, 0, 0]), g = word("gills") - LEAD; if (t > g - 0.25) gillCard(out, t, s, 0.06);
    burst("ex2", g, 0.8, (p, u) => fxExclaim(p, u), 200, 260, s[0] - 0.3, 1.62, s[2] + 0.1, 0.16, 0.21);
    hold("gtag", g, 7.05, (p) => tagCard(p, "GILLS!", "#ff9fb0"), 500, 160, s[0] + 0.12, 1.82, s[2] + 0.2, 0.3, 0.096); }
  if (id === 3) { const dunk = word("breath", 10) - 0.3, sp = L(3, [0, 0.05, -7.4]), wz = lerp(BEACH_START[2], -7.4, (t - 7.25) / 2.25);
    if (wz < -6.1 && t < dunk) { const u = q((t * 0.9) % 1, 15); out.fx.push({ key: `wade|${u}`, cw: 600, ch: 600, draw: (p) => fxRing(p, u), x: sp[0], y: 0.0, z: wz, w: 1.5, h: 1.5, flat: true }); }
    burst("spl3", dunk, 0.9, (p, u) => fxSplash(p, u), 800, 800, sp[0], 0.35, sp[2] + 0.1, 1.4, 1.4);
    burst("ring3", dunk + 0.2, 1.2, (p, u) => fxRing(p, u), 600, 600, sp[0], 0.0, sp[2], 2.2, 2.2, true);
    if (t > dunk + 0.5) bubbles(out, t, "3", [sp[0], -0.1, sp[2] + 0.2], 0.3, 6, 0.12, 0.25, 1.2);
    hold("wtag", word("water", 10.5) - LEAD, 11.4, (p) => tagCard(p, "BREATHING WATER", "#5ce1ff", "#16325c", 44), 500, 160, sp[0], 1.3, sp[2] + 0.4, 1.2, 0.38); }
  if (id === 4) { const s = L(4, [0, 1.2, 0]), h = word("heavy") - LEAD; gillCard(out, t, [s[0], s[1] + 0.05 * Math.sin(t * 2.1) - 0.18 * sm((t - h) / 0.3), s[2]]);
    breath(out, t, word("works") - 0.1, [s[0] - 0.05, s[1] + 1.3, s[2] + 0.1], 1.2);
    bubbles(out, t, "4", [s[0] + 0.9, 0.3, -0.8 + s[2]], 3.2, 5, 0.08, 0.1, 0.3);
    hold("heavy", h, 13.5, (p) => tagCard(p, "HEAVY", "#ffffff", "#c63939", 64), 500, 160, s[0] + 0.45, s[1] + 0.6, s[2] + 0.2, 0.5, 0.16); }
  if (id === 7) { // you swim left to right through the reef; fish schools pass the other way
    const k = (t - 24.15) / 5.7, x = lerp(-0.27, 0.5, k), yours = word("whole", 27) - LEAD, a = t > yours ? POSES.hands_up : Math.sin(t * 5) > 0 ? SWIM_A : SWIM_B;
    const at = L(7, [x, 2.0 + 0.1 * Math.sin(t * 2.4), 0.2]);
    youFx(out, t, { mode: "stroll", phase: q((t * 1.6) % 1, 12), expr: [[0, "grin"], [yours, "excited"]], reach: a }, at, 0.8, { rot: -Math.PI / 2 + 0.06 * Math.sin(t * 2.4) });
    breath(out, t, 25.0, [at[0] + 0.55, at[1] + 0.1, at[2] + 0.1], 1.4); breath(out, t, 27.6, [at[0] + 0.55, at[1] + 0.1, at[2] + 0.1], 1.4);
    const school: [string, string, string, number, number, number, number][] = [["#ffd23f", "#fff3b0", "#2a7fc0", 2.2, 3.1, -1.4, 0.5], ["#5ce1ff", "#e8fbff", "#16325c", 2.6, 1.5, -2.8, 0.45], ["#ff8a3d", "#ffe0c0", "#ffffff", 1.8, 3.5, 0.6, 0.38]];
    school.forEach(([b, bl, f, x0, y, z, sz], j) => { for (let n = 0; n < 4; n++) { const fxp = x0 - (t - 24.15) * (0.6 + 0.1 * j) - n * 0.5 + 0.2 * Math.sin(n * 3), wag = q(Math.sin(t * 9 + n), 4);
      const at2 = L(7, [fxp, y + 0.25 * Math.sin(n * 2.1) + 0.06 * Math.sin(t * 3 + n), z - 0.3 * n]);
      out.fx.push({ key: `fish|${j}|${wag}`, cw: 600, ch: 320, draw: (p) => { p.g.translate(600, 0); p.g.scale(-1, 1); fish(p, b, bl, f, wag); }, x: at2[0], y: at2[1], z: at2[2], w: sz, h: sz * 0.53 }); } });
    hold("reef", yours, 29.85, (p) => tagCard(p, "ALL YOURS", "#ffd23f"), 500, 160, L(7, [0, 0, 0])[0], at[1] + 0.85, at[2] + 0.2, 0.9, 0.29); }
  if (id === 8) { const s = L(8, [0, 1.2, 0]), sh = word("shiver") - LEAD, j = t > sh ? 0.012 * Math.sin(t * 55) : 0, by = s[1] + 0.04 * Math.sin(t * 2);
    gillCard(out, t, [s[0] + j, by, s[2]], 0.05, shiverTilt(t, sh));
    const temp = q(lerp(1, 0.2, (t - sh) / (word("in", 33.3) - sh)), 40);
    out.fx.push({ key: `temp|${temp}`, cw: 480, ch: 180, draw: (p) => tempHud(p, temp), x: s[0] + 0.45, y: by + 2.05, z: s[2] + 0.1, w: 0.55, h: 0.21 });
    if (t > sh) { const k = q(pop(t, sh), 10); out.fx.push({ key: `frost|${k}`, cw: 420, ch: 140, draw: frost, x: s[0] + j + 0.68 * Math.sin((shiverTilt(t, sh) * Math.PI) / 180), y: by + (975 - 292) * SU, z: s[2] + 0.08, w: 0.36 * k, h: 0.12 * k });
      for (const side of [-1, 1]) { const u = q((t * 3) % 1, 6); out.fx.push({ key: `creak|${u}`, cw: 300, ch: 300, draw: (p) => fxCreak(p, u), x: s[0] + side * 0.42, y: by + 1.45, z: s[2] + 0.05, w: 0.3, h: 0.3, rot: side * -1.2 }); } }
    hold("warm", word("warm", 32) - LEAD, 34.0, (p) => tagCard(p, "IT FELT WARM?", "#9fd8ff", "#16325c", 46), 500, 160, s[0] - 0.45, by + 0.45, s[2] + 0.2, 0.62, 0.2); }
  if (id === 11) { // a cold fish swims past with its own thermometer, the same as the sea's
    const k = (t - 49.2) / 4.55, at = L(11, [lerp(1.2, -0.25, k), 2.15 + 0.05 * Math.sin(t * 2), 0.6]), wag = q(Math.sin(t * 7), 4);
    out.fx.push({ key: `cfish|${wag}`, cw: 600, ch: 320, draw: (p) => { p.g.translate(600, 0); p.g.scale(-1, 1); fish(p, "#7fb3d6", "#e3f3ff", "#3a6f9f", wag, false); }, x: at[0], y: at[1], z: at[2], w: 1.0, h: 0.53 });
    const c = word("cold", 51) - LEAD, lvl = q(lerp(0.75, 0.3, (t - c + 0.6) / 0.6), 10);
    out.fx.push({ key: `th|f|${lvl}`, cw: 160, ch: 560, draw: (p) => thermo(p, lvl, "#4aa8ff", "FISH"), x: at[0] + 0.2, y: at[1] + 0.6, z: at[2] + 0.05, w: 0.18, h: 0.63 });
    const sea = L(11, [0.72, 2.9, 0.3]); hold("thSea", c, 53.75, (p) => thermo(p, 0.3, "#4aa8ff", "SEA"), 160, 560, sea[0], sea[1], sea[2], 0.18, 0.63);
    if (t > c) { const k2 = q(pop(t, c), 10); out.fx.push({ key: `sf|${k2}`, cw: 120, ch: 120, draw: snowflake, x: at[0] + 0.12, y: at[1] + 0.02, z: at[2] + 0.1, w: 0.18 * k2, h: 0.18 * k2 }); }
    hold("same", c + 0.3, 53.75, (p) => tagCard(p, "= THE WATER", "#9fd8ff", "#16325c", 52), 500, 160, L(11, [0.15, 0, 0])[0], 3.22, 0.3, 0.7, 0.23); }
  if (id === 12) { // the opah arrives, its warm heart glows, +5 C
    const k = sm((t - 53.75) / 1.0), at = L(12, [lerp(2.0, 0.32, k), 2.2 + 0.05 * Math.sin(t * 1.8), 0.4]), wag = q(Math.sin(t * 5), 4);
    const hw = word("warm", 55) - LEAD, heart = t > hw ? q(0.6 + 0.4 * Math.sin((t - hw) * 6), 6) : 0;
    out.fx.push({ key: `opah|${wag}|${heart}`, cw: 700, ch: 620, draw: (p) => { p.g.translate(700, 0); p.g.scale(-1, 1); opah(p, wag, heart); }, x: at[0], y: at[1], z: at[2], w: 1.0, h: 0.89 });
    const five = word("five", 57) - LEAD;
    hold("opahT", word("opah") - LEAD, five, (p) => tagCard(p, "OPAH", "#ffd23f"), 500, 160, at[0], at[1] + 0.68, at[2] + 0.1, 0.56, 0.18);
    burst("b12", five, 0.6, (p, u) => fxBurst(p, u, "#ffb347"), 512, 512, at[0], at[1] + 0.72, at[2] + 0.05, 1.0, 1.0);
    hold("plus5", five, 59.85, (p) => tagCard(p, "+5°C", "#ff8a3d", "#16325c", 84), 500, 160, at[0], at[1] + 0.72, at[2] + 0.15, 0.66, 0.21); }
  if (id === 13) { const k = (t - 59.9) / 1.6, z = lerp(-7.0, -4.4, k), s = L(13, [0, wadeY(z), z]);
    for (const side of [-1, 1]) { const u = q((t * 3) % 1, 6); out.fx.push({ key: `creak|${u}`, cw: 300, ch: 300, draw: (p) => fxCreak(p, u), x: s[0] + side * 0.45, y: s[1] + 1.45, z: s[2] + 0.05, w: 0.32, h: 0.32, rot: side * -1.2 }); }
    hold("shore", word("shore") - LEAD, 61.7, (p) => tagCard(p, "BACK TO SHORE", "#ffd23f", "#16325c", 46), 500, 160, s[0], 2.2, s[2] + 0.3, 1.0, 0.32); }
  if (id === 14) { // hot tap running, steam, then the air stone drops in and bubbles
    const sp = L(14, [-1.58, 0.86, -2.3]), fill = word("fill", 61) - 0.2, drop = word("drop", 64) - 0.1, me = L(14, ME_TAP);
    if (t > fill) out.fx.push({ key: `str|${ph(2)}`, cw: 60, ch: 400, draw: (p) => stream(p, ph(2)), x: sp[0], y: sp[1], z: sp[2], w: 0.08, h: 0.27 });
    for (let i = 0; i < 4; i++) { const s = L(14, [TUB[0] - 0.6 + i * 0.4, 1.05 + 0.1 * (i % 2), TUB[2] + 0.1]), f = ph(0.3 + i * 0.06), on = q(sm((t - fill - i * 0.3) / 0.8), 6);
      if (on > 0) out.fx.push({ key: `steam|${f}`, cw: 200, ch: 400, draw: (p) => steam(p, f), soft: true, x: s[0], y: s[1] + 0.2 * f, z: s[2], w: 0.3 * on, h: 0.6 * on }); }
    const hot = word("hot", 62) - LEAD, lvl = q(lerp(0.35, 0.92, (t - hot + 0.3) / 0.8), 10), th = L(14, [-0.72, 1.3, -2.0]);
    if (t > fill) out.fx.push({ key: `th|h|${lvl}`, cw: 160, ch: 560, draw: (p) => thermo(p, lvl, "#ff5a4f", "HOT"), x: th[0], y: th[1], z: th[2], w: 0.24, h: 0.84 });
    const hand: V3 = [me[0] + 0.46, 1.12, me[2] + 0.12], tgt = L(14, [-1.4, 0.76, -2.15]), f = sm((t - drop) / 0.45);
    if (t > drop - 0.55 && f < 1) out.fx.push({ key: "stone", cw: 220, ch: 200, draw: airStone, x: lerp(hand[0], tgt[0], f), y: lerp(hand[1], tgt[1], f) - 0.12, z: lerp(hand[2], tgt[2], f), w: 0.28, h: 0.25 });
    burst("spl14", drop + 0.42, 0.8, (p, u) => fxSplash(p, u), 800, 800, tgt[0], tgt[1] + 0.12, tgt[2] + 0.05, 0.6, 0.6);
    if (t > drop + 0.5) bubbles(out, t, "14", tgt, 1.15, 6, 0.06, 0.05, 0.8);
    hold("pump", word("aquarium") - LEAD, 66.3, (p) => tagCard(p, "AQUARIUM PUMP", "#5ce1ff", "#16325c", 46), 500, 160, L(14, [-1.2, 0, 0])[0], 1.75, tgt[2] + 0.3, 0.7, 0.22); }
  if (id === 15) { const lie = word("lie") - 0.2, head = lerp(-0.02, HEAD_UNDER, (t - lie) / 0.4), br = word("breathe", 67.5) - LEAD;
    tub(15, head, { expr: [[0, "smile"], [br, "relief"]] });
    burst("ring15", lie + 0.3, 1.0, (p, u) => fxRing(p, u), 600, 600, mouthUnder(15, HEAD_UNDER)[0], WATER_Y + 0.01, TUB[2], 0.9, 0.9, true);
    if (t > br - 0.1) { breath(out, t, br - 0.1, mouthUnder(15, HEAD_UNDER), 0.6); breath(out, t, br + 0.9, mouthUnder(15, HEAD_UNDER), 0.6); } }
  if (id === 16) { tub(16, HEAD_UNDER, { expr: [[0, "sly"], [word("trade") - LEAD, "smirk_wink"]] });
    for (const t0 of [69.3, 70.6, 71.8]) { const m = mouthUnder(16, HEAD_UNDER); breath(out, t, t0, [m[0], m[1], m[2] + 0.27], 0.3); }
    hold("lg", word("lungs") - LEAD - 0.4, 72.5, lungsGills, 600, 300, L(16, [0.12, 0, 0])[0], 0.98, L(16, [0, 0, -2.3])[2], 0.5, 0.25); }
};

export const CAST: [string, Outfit, Partial<FrontOpts>][] = [["You", YOU, { expr: "smile" }]];
