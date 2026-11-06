// What If ep10 acting: one day under cartoon rules. YOU stays YOU (people.ts); the "cartoon day" is told by episode fx:
// a thick ink ring behind YOU's card (thins at midnight), saucer eyes on springs, a hand card counting four fingers,
// spinning-leg blur, the anvil, YOU flattened / peeled / popped back (bodyFront drawn into fx canvases), the 11:59 clock.
import { Pen, Outfit, FrontOpts, INK, SKIN, POSES, bodyFront, fxBurst, fxContact, fxExclaim, fxPuff, fxShock, fxSpeed, fxStars, fxSweatBurst } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, q, fkey, kf } from "../../act";
import { YOU, CHANNEL_CAST } from "../people";
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

const SU = 0.00216; // metres per design unit (engine cast.ts)
/** world camera position of a shot (story CamSpec "local" + the engine's x1.15 room factor) */
const camPos = (id: number): V3 => {
  const c = SHOTS[id - 1].cam as { local: V3; lookAt: V3 }, o = set(id).origin;
  return [0, 1, 2].map((i) => o[i] + c.lookAt[i] + (c.local[i] - c.lookAt[i]) * 1.15) as V3;
};
/** horizontal unit vector from p toward the shot camera (cards face it like the actor billboards do) */
const toCam = (id: number, p: V3): V3 => { const c = camPos(id), dx = c[0] - p[0], dz = c[2] - p[2], n = Math.hypot(dx, dz) || 1; return [dx / n, 0, dz / n]; };
const nudge = (id: number, p: V3, d: number): V3 => { const n = toCam(id, p); return [p[0] + n[0] * d, p[1], p[2] + n[2] * d]; };

type Pose = FrontOpts["reach"];
const AIR: V3 = [0, 0, 5.5]; // rooftops: thin air past the lip
const ROOF: V3 = [0, 0, 0];
const RUN0: V3 = [0, 0, 1.0];
const OPEN_UP: Pose = [undefined, { ex: 30, ey: -0.1, hx: 58, hy: -0.55, front: true }]; // screen-right hand held up and out, clear of the head
const SPREAD: Pose = [{ ex: -34, ey: 0.05, hx: -66, hy: -0.1 }, { ex: 34, ey: 0.05, hx: 66, hy: -0.1 }];
const PANCAKE: V3 = [0.3, 0.035, 2.4]; // street: the near (feet) edge of the flattened card
const SKY: V3 = [-1.4, 3.6, 3.4]; // street, night: where you stand on air (feet)
const AWNING: V3 = [2.0, 3.04, -2.05]; // left end of the DINER sign, so the name stays readable
const bob = (t: number): V3 => [0, q(0.035 * Math.sin(t * 2.2), 60), 0];

// ---------------- beats ----------------
const B = {
  look1: word("look"), down1: word("down"), holds: word("holds"),
  wake: word("wake"), thick: word("thick"), saucers: word("saucers"), four: word("four"),
  run: word("run", 19), spin: word("spin", 21), shoot: word("shoot", 22),
  hang: word("hang", 25), y1980: word("1980"), nothing: word("nothing", 30), notices: word("notices", 31),
  real: word("real", 33), dropped: word("dropped", 34), storey: word("storey", 35),
  look7: word("look", 37), down7: word("down", 37.8), fall: word("fall", 38),
  anvil: word("anvil", 39), lands: word("lands", 40), flattens: word("flattens", 41), pancake: word("pancake", 42),
  peel: word("peel", 43), shake: word("shake", 45), pop: word("pop", 46), full: word("full", 47),
  standing: word("standing", 66), eyes: word("eyes", 69), shut: word("shut", 69),
  midnight: word("midnight", 71), fifth: word("fifth", 72), grows: word("grows", 73), gravity: word("gravity", 74),
};
/** the anvil: dropping from 40.15 s, lands on "lands" */
const ANVIL0 = B.lands - 0.3;
const TIP = B.flattens - 0.15; // the anvil hops off the pancake
const PEEL = [B.peel - 0.05, B.peel + 1.1] as const;
const POP = B.pop - 0.05;
const DROP14 = B.gravity - 0.05;
const ARR = 24.1; // shot 5: you stop dead on thin air
const LAND15 = 75.85; // you land on the awning (shot 15 opens on the fall)

const ACTS = (id: number): Act[] => {
  switch (id) {
    case 1: return [{ i: 0, o: YOU, at: L(1, AIR), drift: bob, noShadow: true, mode: "stand", reach: () => POSES.hands_on_hips,
      expr: [[0, "smile"], [B.holds - LEAD, "smug"], [B.look1 - LEAD, "smug"], [B.down1 - LEAD, "shook"]],
      lookY: kf([[0, 0], [B.look1 - 0.05, 0.8]], 0.15), look: kf([[0, 0], [B.look1 - 0.05, 0.3]], 0.15) }];
    case 2: return [{ i: 0, o: YOU, at: L(2, ROOF), mode: "stand",
      expr: [[0, "tired"], [B.thick - LEAD, "curious"], [B.saucers - LEAD, "shock"], [B.four - 0.3, "curious"]],
      reach: (t) => (t < B.wake + 0.9 && t > B.wake - 0.3 ? POSES.hands_up : t > B.four - 0.35 ? OPEN_UP : undefined),
      lookY: kf([[0, 0], [B.thick - 0.1, 1.2], [B.saucers - 0.2, 0], [B.four - 0.2, -0.3]], 0.2),
      look: kf([[0, 0], [B.four - 0.2, 0.6]], 0.2) }];
    case 4: { const s = B.shoot - 0.04; return [{ i: 0, o: YOU, at: L(4, RUN0), noShadow: true, face: 1,
      mode: "march", phase: (t) => (t < B.run - 0.1 ? 0 : t * (t > B.spin - 0.4 ? 9 : 3)),
      tilt: (t) => (t < B.run - 0.1 ? -5 : 9), moveTo: [[s, [0, 0, 0]], [s + 0.32, [0, 0, 6.6]]],
      expr: [[0, "scheming"], [B.run - LEAD, "resolve"], [B.spin - LEAD, "excited"]] }]; }
    case 5: return [{ i: 0, o: YOU, at: L(5, AIR), drift: bob, noShadow: true, mode: "march", phase: (t) => (t < ARR ? t * 9 : 0), face: (t) => (t < ARR ? 1 : 0),
      moveTo: [[23.75, [0, 0, -4.6]], [ARR, [0, 0, 0]]], reach: (t) => (t < ARR ? undefined : POSES.arms_crossed),
      expr: [[0, "excited"], [ARR, "confident"], [B.y1980 - LEAD, "smug"], [B.nothing - LEAD, "amused"]],
      look: kf([[0, 0], [B.y1980, -0.6], [B.nothing - 0.3, 0.8]], 0.3) }];
    case 6: return [{ i: 0, o: YOU, at: L(6, AIR), drift: bob, noShadow: true, mode: "stand", reach: () => POSES.arms_crossed,
      expr: [[0, "confident"], [B.storey - LEAD, "smug"]] }];
    case 7: { const f0 = B.fall - 0.1; return [{ i: 0, o: YOU, at: L(7, AIR), noShadow: true,
      path: (t) => { const a = L(7, AIR), u = Math.max(0, t - f0); return [a[0], a[1] + (u ? -7 * u * u : bob(t)[1]), a[2]]; },
      mode: "stand", reach: (t) => (t > f0 ? POSES.hands_up : POSES.arms_crossed),
      expr: [[0, "confident"], [B.look7 - LEAD, "curious"], [B.down7 - LEAD, "shook"], [f0, "scared"]],
      lookY: kf([[0, 0], [B.look7 - 0.05, 0.8], [f0, -0.8]], 0.12) }]; }
    case 8: { const t0 = 39.65, land = 39.9; return [{ i: 0, o: YOU, at: L(8, [0.3, 0, 1.6]), noShadow: true,
      path: (t) => { if (t >= B.lands) return null; const a = L(8, [0.3, 0, 1.6]), u = clamp01((land - t) / (land - t0)); return [a[0], a[1] + 4.2 * u * u, a[2]]; },
      mode: "stand", reach: (t) => (t < land ? POSES.hands_up : undefined),
      expr: [[0, "scared"], [land, "dazed"], [B.anvil - LEAD, "shook"]], lookY: kf([[0, 0], [B.anvil - 0.05, -1.6]], 0.12) }]; }
    case 9: return [{ i: 0, o: YOU, at: L(9, [PANCAKE[0], 0, PANCAKE[2]]), path: (t) => (t < POP + 0.42 ? null : L(9, [PANCAKE[0], 0, PANCAKE[2]])), mode: "stand",
      expr: [[0, "proud"], [B.full - LEAD, "relief_open"]], reach: (t) => (t > B.full - 0.2 ? POSES.hands_up : POSES.hands_on_hips) }];
    case 15: return [{ i: 0, o: YOU, at: L(15, AWNING), noShadow: true,
      path: (t) => { const a = L(15, AWNING), u = clamp01((LAND15 - t) / 0.25); return [a[0], a[1] + 3.2 * u * u, a[2]]; },
      mode: "sit", reach: (t) => (t < LAND15 ? POSES.hands_up : t > LAND15 + 0.5 ? OPEN_UP : undefined),
      expr: [[0, "scared"], [LAND15, "dazed"]], tilt: (t) => 4 * Math.sin(t * 1.3), head: (t) => 5 * Math.sin(t * 1.1) }];
    default: return [];
  }
};
export const acts = ACTS;

// ---------------- drawings ----------------
const SKY_INK = "#1d1a3a", PAPER = "#f4f1ea", Y = "#ffd23f", RED = "#ff5a4f", NAVY = "#16325c";
const pop = (t: number, t0: number) => clamp01((t - t0) / 0.12) * (1 + 0.15 * Math.sin(clamp01((t - t0) / 0.3) * Math.PI));
const text = (p: Pen, s: string, x: number, y: number, px: number, col: string, stroke = INK) => {
  const g = p.g; g.save(); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${px}px "Arial Black", Arial, sans-serif`;
  g.lineJoin = "round"; g.lineWidth = px * 0.16; g.strokeStyle = stroke; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); g.restore();
};
const panel = (p: Pen, x0: number, y0: number, x1: number, y1: number, fill: string, ol = 8) => {
  const r = 26; p.poly([[x0 + r, y0], [x1 - r, y0], [x1, y0 + r], [x1, y1 - r], [x1 - r, y1], [x0 + r, y1], [x0, y1 - r], [x0, y0 + r]], fill, ol);
};

/** YOU drawn into an fx canvas: the 600 x 1000 design box with its sole point at (cx, cy) px, scaled s * (sx, sy); a thick ink
 *  ring of `ring` design units round the silhouette (the cartoon outline); body = false draws the ring alone (it sits behind
 *  the real actor card); tint darkens the body for night; alpha < 1 for the ghost */
const you = (p: Pen, fo: FrontOpts, o: { cx: number; cy: number; s: number; sx?: number; sy?: number; ring?: number; body?: boolean; tint?: string; alpha?: number; ghost?: boolean }) => {
  const g = p.g, W = g.canvas.width, H = g.canvas.height, sx = o.s * (o.sx ?? 1), sy = o.s * (o.sy ?? 1);
  const off = document.createElement("canvas"); off.width = W; off.height = H;
  const og = off.getContext("2d")!; og.setTransform(sx, 0, 0, sy, o.cx - 300 * sx, o.cy - 975 * sy);
  bodyFront(new Pen(og), YOU, fo);
  og.setTransform(1, 0, 0, 1, 0, 0);
  if (o.tint) { og.globalCompositeOperation = "source-atop"; og.fillStyle = o.tint; og.fillRect(0, 0, W, H); og.globalCompositeOperation = "source-over"; }
  if (o.ghost) { og.globalCompositeOperation = "source-atop"; og.fillStyle = "rgba(170,215,255,.55)"; og.fillRect(0, 0, W, H); og.globalCompositeOperation = "source-over"; }
  const r = (o.ring ?? 0) * o.s;
  if (r > 0.5) {
    const rc = document.createElement("canvas"); rc.width = W; rc.height = H; const rg = rc.getContext("2d")!;
    for (let k = 0; k < 16; k++) rg.drawImage(off, r * Math.cos((k * Math.PI) / 8), r * Math.sin((k * Math.PI) / 8));
    rg.globalCompositeOperation = "source-in"; rg.fillStyle = SKY_INK; rg.fillRect(0, 0, W, H);
    g.drawImage(rc, 0, 0);
  }
  if (o.body !== false) { g.save(); g.globalAlpha = o.alpha ?? 1; g.drawImage(off, 0, 0); g.restore(); }
};
/** silhouette-relevant FrontOpts of an act at t (mirrors engine cast.ts stage(); face details do not change the outline) */
const shapeOf = (a: Act, t: number): FrontOpts => ({
  mode: a.mode ?? "stand", phase: a.phase ? ((a.phase(t) % 1) + 1) % 1 : 0, tilt: a.tilt?.(t) ?? 0, reach: a.reach?.(t), headTilt: a.head?.(t) ?? 0,
  facing: (typeof a.face === "function" ? a.face(t) : a.face ?? 0) as -1 | 0 | 1, seed: (a.i % 7) + 1, ...(a.moveTo ? { lift: 110 } : {}),
});
/** where an act stands at t (mirrors stage()) */
const posOf = (a: Act, t: number): V3 | null => {
  const at = a.path ? a.path(t) : a.at; if (!at) return null;
  let off: V3 = a.off ?? [0, 0, 0];
  if (a.moveTo) { const [[t0, p0], [t1, p1]] = a.moveTo, k = clamp01((t - t0) / (t1 - t0)); off = [p0[0] + (p1[0] - p0[0]) * k, p0[1] + (p1[1] - p0[1]) * k, p0[2] + (p1[2] - p0[2]) * k]; }
  if (a.drift) { const d = a.drift(t); off = [off[0] + d[0], off[1] + d[1], off[2] + d[2]]; }
  return [at[0] + off[0], at[1] + off[1], at[2] + off[2]];
};
const RING = 11; // design units of extra outline in the cartoon day (the engine's own outline is ~8.7)

/** a cartoon hand, palm to camera, on a 600 x 600 canvas: thumb + up to 4 fingers; `up` fingers raised (counting), `fifth`
 *  0..1 = the pinky growing back, `nums` writes the count over each raised finger */
const hand = (p: Pen, up: number, fifth: number, nums: boolean) => {
  const FING: [number, number, number][] = [[-150, 50, -52], [-62, -40, -10], [8, -58, 0], [80, -40, 10], [140, 0, 22]]; // thumb, index, middle, ring, pinky: base x, base y, angle
  const LEN = [150, 210, 230, 205, 160];
  const cx = 300, cy = 380;
  const finger = (k: number, raised: number) => {
    const [bx, by, ang] = FING[k], a = ((ang - 90) * Math.PI) / 180, l = 40 + (LEN[k] - 40) * raised, w = k === 0 ? 66 : 58;
    const x0 = cx + bx, y0 = cy + by, x1 = x0 + Math.cos(a) * l, y1 = y0 + Math.sin(a) * l;
    p.g.lineCap = "round"; p.stroke([[x0, y0], [x1, y1]], w + 22, INK); p.stroke([[x0, y0], [x1, y1]], w, SKIN);
    if (raised > 0.6) p.stroke([[x1 - Math.cos(a) * 50 - 14, y1 - Math.sin(a) * 50], [x1 - Math.cos(a) * 50 + 14, y1 - Math.sin(a) * 50]], 5, "#d9c9c2");
    return [x1, y1] as const;
  };
  const tips: (readonly [number, number])[] = [];
  for (let k = 0; k < 4; k++) tips.push(finger(k, clamp01(up - k)));
  if (fifth > 0) tips.push(finger(4, fifth));
  p.ell(cx, cy + 70, 175, 150, SKIN, 11);
  p.ell(cx + 20, cy + 120, 95, 55, "#efe4dc", 0); // palm crease shade
  p.stroke([[cx - 70, cy + 95], [cx + 30, cy + 140]], 6, "#d9c9c2");
  if (nums) for (let k = 0; k < 5; k++) { const ok = k < 4 ? up - k > 0.7 : fifth > 0.7; if (ok) text(p, String(k + 1), tips[k][0], tips[k][1] - 62, 72, k === 4 ? Y : "#ffffff"); }
};
/** saucer eyes popping out on springs, 600 x 360; u 0..1 since the pop */
const saucers = (p: Pen, u: number) => {
  const out = Math.min(1, u * 5), wob = Math.sin(u * 26) * Math.exp(-u * 3.5);
  for (const s of [-1, 1]) {
    const bx = 300 + s * 52, by = 250, ex = 300 + s * (140 + 18 * wob), ey = 160 - 70 * out - 20 * wob, r = 70 + 40 * out;
    const coil: [number, number][] = []; for (let k = 0; k <= 24; k++) { const v = k / 24; coil.push([bx + (ex - bx) * v + 14 * Math.sin(v * Math.PI * 8), by + (ey - by) * v]); }
    p.stroke(coil, 7, INK);
    p.ell(ex, ey, r, r * 0.92, "#ffffff", 10); p.ell(ex - s * 8, ey + 10, r * 0.36, r * 0.4, INK, 0); p.ell(ex - s * 20, ey - 8, r * 0.1, r * 0.1, "#ffffff", 0);
  }
};
/** spinning legs: a blurred wheel of leg strokes, 400 x 300 */
const spinLegs = (p: Pen, ph: number) => {
  const g = p.g; g.save(); g.globalAlpha = 0.5; p.ell(200, 160, 150, 120, "#e8eef8", 0); g.globalAlpha = 1;
  for (let k = 0; k < 8; k++) { const a = ph * Math.PI * 2 + (k * Math.PI) / 4; g.globalAlpha = k % 2 ? 0.45 : 0.9;
    p.stroke([[200, 110], [200 + 120 * Math.cos(a), 160 + 100 * Math.sin(a)]], 13, INK); }
  g.globalAlpha = 0.8; for (const r of [70, 110, 140]) p.arc(200, 160, r, r * 0.8, ph * 360, ph * 360 + 110, 6, "#7f8aa6");
  g.restore();
};
/** the anvil, 400 x 300, base on the bottom edge */
const anvil = (p: Pen) => {
  const M = "#4a5163", T = "#6c7488";
  p.poly([[120, 290], [280, 290], [250, 230], [150, 230]], M, 9);
  p.poly([[160, 232], [240, 232], [232, 150], [168, 150]], M, 9);
  p.poly([[20, 70], [300, 70], [380, 82], [330, 120], [300, 150], [100, 150], [70, 112], [20, 100]], T, 9);
  p.stroke([[40, 84], [292, 84]], 8, "#9aa3b8"); p.stroke([[300, 86], [360, 88]], 6, "#9aa3b8");
};
/** the LAW #1 page, 500 x 640; `law` reveals the line itself */
const lawPage = (p: Pen, law: boolean) => {
  p.poly([[20, 20], [440, 20], [480, 60], [480, 620], [20, 620]], PAPER, 9); p.poly([[440, 20], [440, 60], [480, 60]], "#d9d2c3", 6);
  text(p, "LAW #1 · 1980", 250, 92, 50, "#c63939", PAPER);
  text(p, "CARTOON MOTION", 250, 160, 36, NAVY, PAPER); p.stroke([[60, 200], [440, 200]], 6, NAVY);
  if (law) { text(p, "NOTHING", 250, 290, 70, NAVY, PAPER); text(p, "FALLS UNTIL", 250, 385, 56, NAVY, PAPER); text(p, "IT NOTICES", 250, 480, 62, "#c63939", PAPER); }
  else for (let k = 0; k < 6; k++) p.stroke([[70, 270 + k * 52], [k % 3 === 2 ? 300 : 430, 270 + k * 52]], 10, "#b9c2cf");
};
/** the dotted drop line + storey ruler beside the ghost, 240 x 1400 (top = your feet, bottom = 4.9 m down) */
const dropLine = (p: Pen, u: number) => {
  const g = p.g, y1 = 40 + 1320 * u;
  g.save(); g.setLineDash([34, 26]); g.lineCap = "round"; g.strokeStyle = "#ffffff"; g.lineWidth = 22; g.beginPath(); g.moveTo(80, 40); g.lineTo(80, y1); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 12; g.stroke(); g.restore();
  if (u > 0.95) p.poly([[40, 1300], [120, 1300], [80, 1370]], Y, 8);
  for (const [y, s] of [[40, "0"], [40 + 1320 * 3 / 4.9, "1"], [40 + 1320 * 4.5 / 4.9, "1½"]] as [number, string][]) if (y <= y1 + 4) { p.stroke([[50, y], [150, y]], 12, INK); text(p, s, 196, y, 52, "#ffffff"); }
};
/** street clock on a 400 x 520 canvas: 11:59 (+ the second hand) or 12:00, digital read-out below */
const clock = (p: Pen, mid: boolean, sec: number) => {
  p.ell(200, 200, 180, 180, "#2f3e4f", 10); p.ell(200, 200, 150, 150, "#fff8e2", 8);
  for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; p.stroke([[200 + 125 * Math.sin(a), 200 - 125 * Math.cos(a)], [200 + 140 * Math.sin(a), 200 - 140 * Math.cos(a)]], k % 3 ? 6 : 12, INK); }
  const hand2 = (a: number, l: number, w: number, c = INK) => p.stroke([[200, 200], [200 + l * Math.sin(a), 200 - l * Math.cos(a)]], w, c);
  const mins = mid ? 0 : 59;
  hand2(((mid ? 12 : 11 + 59 / 60) / 12) * Math.PI * 2, 80, 16); hand2((mins / 60) * Math.PI * 2, 120, 11);
  if (!mid) hand2((sec / 60) * Math.PI * 2, 128, 4, "#c63939");
  p.dot(200, 200, 14);
  panel(p, 70, 400, 330, 505, mid ? "#c63939" : NAVY, 8); text(p, mid ? "12:00" : "11:59", 200, 455, 66, mid ? "#ffffff" : Y, mid ? "#c63939" : NAVY);
};
/** a white tag, 500 x 150 */
const tag = (p: Pen, s: string, col = NAVY, bg = "#ffffff", px = 56) => { panel(p, 10, 10, 490, 140, bg, 8); text(p, s, 250, 76, px, col, bg); };

export const fx = (id: number, t: number, out: Stage) => {
  const burst = (key: string, t0: number, dur: number, draw: (p: Pen, u: number) => void, cw: number, ch: number, x: number, y: number, z: number, w: number, h: number, soft = false) => {
    const u = q(clamp01((t - t0) / dur), 15);
    if (t >= t0 && u < 1) out.fx.push({ key: `${key}|${u}`, cw, ch, draw: (p) => draw(p, u), x, y, z, w, h, soft });
  };
  const hold = (key: string, t0: number, t1: number, draw: (p: Pen) => void, cw: number, ch: number, x: number, y: number, z: number, w: number, h: number) => {
    if (t < t0 || t > t1) return; const k = q(pop(t, t0), 10);
    out.fx.push({ key: `${key}|${k}`, cw, ch, draw, x, y, z, w: w * k, h: h * k });
  };
  const contact = (x: number, y: number, z: number, s = 1) =>
    out.fx.push({ key: "blob|contact|d", cw: 128, ch: 128, draw: (p) => fxContact(p, "#4a4c72"), x, y: y + 0.022, z, w: 0.48 * s, h: 0.36 * s, flat: true });
  /** the thick cartoon outline behind every acting YOU card of this shot (k = 0..1 thickness) */
  const outline = (k: number) => {
    if (k <= 0) return;
    for (const a of ACTS(id)) {
      const pos = posOf(a, t); if (!pos) continue;
      const fo = shapeOf(a, t), n = toCam(id, pos), r = q(RING * k, 4), b = nudge(id, pos, -0.03);
      out.fx.push({ key: `ring|${r}|${fkey(fo)}`, cw: 900, ch: 1500, draw: (p) => you(p, fo, { cx: 450, cy: 975 * 1.5, s: 1.5, ring: r, body: false }),
        x: b[0], y: b[1] + 475 * SU, z: b[2], w: 600 * SU, h: 1000 * SU, face: n });
    }
  };
  /** YOU as an fx card (pancake, peel, ghost, night): canvas 900 x 1100 design (sole at 450, 1080), bottom edge at `foot` */
  const youCard = (key: string, fo: FrontOpts, foot: V3, extra: { sx?: number; sy?: number; ring?: number; tint?: string; ghost?: boolean; alpha?: number; flat?: boolean; face?: V3; rot?: number; up?: V3 }) => {
    const w = 900 * SU, h = 1100 * SU, up = extra.up ?? [0, 1, 0];
    const c: V3 = [foot[0] + up[0] * (h / 2 - 20 * SU), foot[1] + up[1] * (h / 2 - 20 * SU), foot[2] + up[2] * (h / 2 - 20 * SU)];
    out.fx.push({ key: `you|${key}|${fkey(fo)}|${fkey(extra)}`, cw: 900, ch: 1100, soft: !!extra.ghost,
      draw: (p) => you(p, fo, { cx: 450, cy: 1080, s: 1, sx: extra.sx, sy: extra.sy, ring: extra.ring, tint: extra.tint, ghost: extra.ghost, alpha: extra.alpha }),
      x: c[0], y: c[1], z: c[2], w, h, flat: extra.flat, face: extra.face ?? (extra.flat ? undefined : toCam(id, foot)), rot: extra.rot });
  };
  const handCard = (key: string, up: number, fifth: number, x: number, y: number, z: number, w: number) =>
    out.fx.push({ key: `hand|${key}|${q(up, 10)}|${q(fifth, 10)}`, cw: 600, ch: 600, draw: (p) => hand(p, q(up, 10), q(fifth, 10), true), x, y, z, w, h: w });

  if (id === 1) { const a = L(1, AIR); outline(1);
    burst("sw1", B.down1 - 0.05, 0.6, fxSweatBurst, 300, 300, a[0] + 0.3, 1.75, a[2] + 0.1, 0.36, 0.36); }
  if (id === 2) { const a = L(2, ROOF), f = nudge(2, a, 0.25);
    outline(q(clamp01((t - B.thick + 0.05) / 0.9), 4));
    if (t > B.saucers - 0.08 && t < B.four - 0.45) { const u = q(clamp01((t - B.saucers + 0.08) / 1.4), 30);
      out.fx.push({ key: `saucer|${u}`, cw: 600, ch: 360, draw: (p) => saucers(p, u), x: f[0], y: 1.52, z: f[2], w: 0.78, h: 0.47 }); }
    burst("bo2", B.saucers - 0.08, 0.5, fxShock, 400, 400, f[0], 1.5, f[2] - 0.05, 1.0, 1.0);
    if (t > B.four - 0.4) { const up = 4 * clamp01((t - B.four + 0.25) / 1.15);
      handCard("2", up, 0, a[0] + 0.5, 1.62, a[2] + 0.12, 0.46); } }
  if (id === 4) { const a = L(4, RUN0), sh = B.shoot - 0.04, act = ACTS(4)[0], p = posOf(act, t)!;
    outline(1);
    if (p[2] < a[2] + 2.2) contact(p[0], 0, p[2]);
    if (t > B.spin - 0.3 && t < sh + 0.05) { const ph = q((t * 4.5) % 1, 12), f = nudge(4, a, 0.06);
      out.fx.push({ key: `spin|${ph}`, cw: 400, ch: 300, draw: (pn) => spinLegs(pn, ph), x: f[0], y: 0.36, z: f[2], w: 0.95, h: 0.72, soft: true });
      burst("sp4", Math.floor((t - B.spin) / 0.4) * 0.4 + B.spin, 0.4, fxSpeed, 500, 300, a[0], 0.9, a[2] - 0.7, 1.0, 0.6); }
    burst("pf4", sh, 0.7, fxPuff, 300, 300, a[0], 0.3, a[2], 1.3, 1.3);
    if (t > sh && t < sh + 0.35) burst("zip4", sh, 0.35, fxSpeed, 500, 300, p[0], 0.9, p[2] - 0.9, 1.6, 0.8); }
  if (id === 5) { const a = L(5, AIR); outline(1);
    const t0 = B.y1980 - 0.3, u = clamp01((t - t0) / 2.4), e = 1 - (1 - u) ** 2;
    if (t > t0) { const law = t > B.nothing - LEAD, x = a[0] - 1.9 + 2.62 * e, y = 2.9 - 1.5 * e ** 3 + 0.08 * Math.sin(t * 2.4), rot = q(0.5 * (1 - e) * Math.sin(t * 7) + 0.06 * Math.sin(t * 1.7), 40);
      out.fx.push({ key: `law|${law}`, cw: 500, ch: 640, draw: (p) => lawPage(p, law), x, y, z: a[2] + 0.35, w: 0.62, h: 0.8, rot }); } }
  if (id === 6) { const a = L(6, AIR); outline(1);
    const d0 = B.dropped - 0.1, u = clamp01((t - d0) / 1.0), dy = -4.9 * u * u;
    if (t > B.real - 0.1) youCard("ghost", { mode: u > 0 && u < 1 ? "fall" : "stand", expr: "scared", reach: POSES.hands_up, seed: 1 }, [a[0] + 0.15, dy, a[2] - 0.2], { ghost: true, alpha: 0.6 });
    if (t > d0) out.fx.push({ key: `drop|${q(u, 20)}`, cw: 240, ch: 1400, draw: (p) => dropLine(p, q(u, 20)), x: a[0] - 0.75, y: -2.45 - 0.04, z: a[2] + 0.1, w: 0.55, h: 5.2 });
    hold("st6", B.storey - LEAD, 37.4, (p) => tag(p, "1½ STOREYS", "#c63939"), 500, 150, a[0] - 1.6, -2.4, a[2] + 0.2, 1.5, 0.45); }
  if (id === 7) { const a = L(7, AIR); outline(1);
    burst("ex7", B.down7 - 0.08, 0.8, fxExclaim, 200, 260, a[0] - 0.55, 1.8, a[2] + 0.1, 0.32, 0.42); }
  if (id === 8) { const s = L(8, [0.3, 0, 1.6]), land = 39.9;
    if (t < B.lands) { outline(1); if (t > land) contact(s[0], 0, s[2]); }
    burst("pf8", land, 0.6, fxPuff, 300, 300, s[0], 0.25, s[2] + 0.1, 1.2, 1.2);
    // the anvil: shadow grows, it drops, lands on you, hops off on "flattens"
    const fallU = clamp01((t - ANVIL0) / 0.3), tipU = clamp01((t - TIP) / 0.32);
    const ax = s[0] + 1.05 * tipU, ay = t < B.lands ? 6.2 * (1 - fallU * fallU) : 0.55 * Math.sin(Math.PI * tipU), az = s[2] + 0.15;
    if (t > B.anvil - 0.2) { const k = q(0.35 + 0.65 * clamp01((t - B.anvil + 0.2) / (B.lands - B.anvil + 0.2)), 12); contact(ax, 0, az, 2.4 * k); }
    if (t > ANVIL0) out.fx.push({ key: "anvil", cw: 400, ch: 300, draw: anvil, x: ax, y: ay + 0.5, z: az + 0.05, w: 1.35, h: 1.0, rot: q(-0.35 * Math.sin(Math.PI * tipU), 30) });
    if (t > ANVIL0 - 0.05 && t < B.lands) burst("sp8", ANVIL0 - 0.05, 0.35, (p, u) => { p.g.translate(300, 0); p.g.rotate(Math.PI / 2); fxSpeed(p, u); }, 300, 500, ax, ay + 1.5, az, 0.6, 1.0);
    if (t >= B.lands) { youCard("cake8", { mode: "stand", expr: "dazed", exprT: q(t - B.lands, 15), reach: SPREAD, seed: 1 }, L(8, PANCAKE), { sx: 1.55, sy: 0.42, ring: RING, flat: true, up: [0, 0, -1] });
      burst("pf8b", B.lands, 0.8, (p, u) => { p.g.scale(1.6, 1); fxPuff(p, u); }, 480, 300, s[0], 0.3, s[2] + 0.5, 2.6, 1.3);
      burst("bang8", B.lands, 0.4, (p, u) => fxBurst(p, u, "#fff3b0"), 500, 500, s[0], 0.7, s[2] + 0.3, 1.6, 1.6, true);
      if (t > TIP + 0.3) out.fx.push({ key: `stars8|${q((t * 0.9) % 1, 24)}`, cw: 420, ch: 210, draw: (p) => fxStars(p, q((t * 0.9) % 1, 24)), x: s[0], y: 0.35, z: s[2] - 0.1, w: 0.9, h: 0.45 }); }
  }
  if (id === 9) { const f = L(9, PANCAKE);
    if (t >= POP + 0.42) outline(1);
    { const an = L(9, [1.35, 0, 1.75]); out.fx.push({ key: "anvil", cw: 400, ch: 300, draw: anvil, x: an[0], y: 0.5, z: an[2], w: 1.35, h: 1.0 }); }
    const fo: FrontOpts = { mode: "stand", expr: t < PEEL[1] ? "dazed" : t < B.shake ? "concentrate" : "nervous_laugh", exprT: q(t - 43.75, 15), reach: t < PEEL[0] ? SPREAD : POSES.hands_up, seed: 1 };
    if (t < PEEL[0]) youCard("cake9", fo, f, { sx: 1.55, sy: 0.42, ring: RING, flat: true, up: [0, 0, -1] });
    else if (t < POP + 0.42) {
      const pe = q(clamp01((t - PEEL[0]) / (PEEL[1] - PEEL[0])), 24), a = (Math.PI / 2) * (1 - (pe * pe * (3 - 2 * pe))) - 0.0001;
      const shake = t > B.shake - 0.05 && t < B.shake + 0.55 ? q(Math.sin((t - B.shake) * 55), 6) : 0;
      const pu = clamp01((t - POP) / 0.4), over = pu < 0.6 ? pu / 0.6 * 1.18 : 1.18 - 0.18 * (pu - 0.6) / 0.4;
      const sy = q(pu > 0 ? 0.42 + (over - 0.42) * Math.min(1, pu / 0.6) : 0.42, 30), sx = q(pu > 0 ? 1.55 + (2 - over - 1.55) * Math.min(1, pu / 0.6) : 1.55, 30);
      const n: V3 = [0, Math.sin(a), Math.cos(a)], up: V3 = [0, Math.cos(a), -Math.sin(a)];
      youCard("peel9", fo, [f[0] + 0.07 * shake, f[1], f[2]], { sx, sy, ring: RING, face: n, up, rot: 0.06 * shake });
      if (pe > 0 && pe < 1) contact(f[0], 0, f[2] - 0.3, 2.2);
    }
    burst("pop9", POP, 0.45, (p, u) => fxBurst(p, u, "#fff3b0"), 500, 500, f[0], 0.75, f[2] + 0.05, 1.7, 1.7, true);
    if (t > PEEL[0] && t < PEEL[0] + 1.0) burst("pf9", PEEL[0], 0.9, fxPuff, 300, 300, f[0], 0.1, f[2] + 0.15, 1.0, 1.0); }
  if (id === 13 || id === 14) { const s = L(id, SKY);
    // you on thin air at night, drawn here (eyes shut needs blink, the engine track cannot hold it)
    const shut = id === 14 || t > B.eyes - LEAD, drop = id === 14 ? Math.max(0, t - DROP14) : 0, ring = id === 14 ? q(RING * (1 - clamp01((t - B.grows + 0.1) / 0.7)), 3) : RING;
    const expr = drop > 0 ? "scared" : shut ? "pained" : t > B.standing - LEAD ? "nervous" : "worried";
    const fo: FrontOpts = { mode: drop > 0.05 ? "fall" : "stand", expr, blink: shut && drop < 0.08 ? 1 : 0, exprT: q(t - 64.95, 15), seed: 1,
      reach: id === 14 && t > B.fifth - 0.35 && drop === 0 ? OPEN_UP : drop > 0 ? POSES.hands_up : POSES.arms_crossed };
    const foot: V3 = [s[0], s[1] + (drop ? -6 * drop * drop : bob(t)[1]), s[2]];
    youCard("sky", fo, foot, { ring, tint: "rgba(28,30,90,.28)" });
    if (shut && drop === 0) { const u = q((t % 0.8) / 0.8, 12); out.fx.push({ key: `sweat|${u}`, cw: 300, ch: 300, draw: (p) => fxSweatBurst(p, u), x: s[0] + 0.35, y: foot[1] + 1.8, z: s[2] + 0.1, w: 0.42, h: 0.42 }); }
    const lamp = L(id, [-3, 0, 2.6]), mid = id === 14 && t > B.midnight - LEAD;
    out.fx.push({ key: `clock|${mid}|${mid ? 0 : Math.floor(t - 64.95 + 52) % 60}`, cw: 400, ch: 520, draw: (p) => clock(p, mid, Math.floor(t - 64.95 + 52) % 60), x: lamp[0] + 0.05, y: 3.75, z: lamp[2] + 0.3, w: 0.8, h: 1.04 });
    if (id === 14) {
      burst("mid14", B.midnight - LEAD, 0.5, (p, u) => fxBurst(p, u, "#fff3b0"), 500, 500, lamp[0], 3.6, lamp[2] + 0.2, 1.6, 1.6, true);
      if (t > B.fifth - 0.35 && drop === 0) handCard("14", 4, clamp01((t - B.fifth + 0.05) / 0.25), s[0] + 0.72, foot[1] + 1.72, s[2] + 0.3, 0.8);
      burst("pop14", B.fifth - 0.05, 0.4, (p, u) => fxBurst(p, u, "#fff3b0", 8, 30, 150), 500, 500, s[0] + 1.0, foot[1] + 1.95, s[2] + 0.25, 0.6, 0.6, true);
      burst("ex14", DROP14, 0.6, fxExclaim, 200, 260, s[0] - 0.45, 5.0, s[2] + 0.1, 0.3, 0.4);
    } }
  if (id === 15) { const s = L(15, AWNING);
    burst("pf15", LAND15, 0.6, fxPuff, 300, 300, s[0], s[1] + 0.2, s[2] + 0.2, 1.2, 1.2);
    if (t < LAND15 + 0.4) return;
    out.fx.push({ key: `stars15|${q((t * 0.8) % 1, 24)}`, cw: 420, ch: 210, draw: (p) => fxStars(p, q((t * 0.8) % 1, 24)), x: s[0], y: s[1] + 1.32, z: s[2] + 0.1, w: 0.75, h: 0.38 });
    handCard("15", 4, 1, s[0] + 0.62, s[1] + 1.12, s[2] + 0.35, 0.56);
    hold("five15", 77.9, 81.4, (p) => tag(p, "5 FINGERS", NAVY, Y), 500, 150, s[0] + 0.85, s[1] + 0.32, s[2] + 0.4, 0.75, 0.225); }
};

export const CAST: [string, Outfit, Partial<FrontOpts>][] = CHANNEL_CAST.map(([n, o]) => [n, o, { expr: "smile" }]);
