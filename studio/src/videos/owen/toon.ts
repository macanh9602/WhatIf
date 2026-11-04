// Canvas character renderer: round white heads, black stick limbs, mitten hands, cel-shaded clothes.
// Legacy soldier and side-view APIs stay available; Owen front-view acting is shoulder-relative.
// Design space 600 x 1000 units (soles at y = 975); the canvas transform scales it.
import { Rig, distinctHands } from "./rig";
export const INK = "#090909";
export const SKIN = "#fbf9f5"; // stick-tee: everyone white-faced (user 2026-11-03); the cast reads by hair, glasses and clothes
const WHITE = "#ffffff";
const MOUTH = "#291418";
const TONGUE = "#b94743";
type C3 = [number, number, number];
const SH_SKIN: C3 = [0.97, 0.97, 0.97]; // measured shadow/lit ratio on skin heads
const SH_CLOTH: C3 = [0.64, 0.66, 0.74]; // torsos: lit side -> far side ~0.65
const SH_FELT: C3 = [0.62, 0.62, 0.7];

export type Build = "adult" | "stout" | "kid";
export type Outfit = {
  jacket: string; pants: string; boots: string; hat?: string | null; belt?: string | null; buttons?: string; rifle?: boolean;
  sash?: string; sword?: boolean; moustache?: string; skin?: string; head?: number; cap?: string; hair?: string; dress?: string;
  build?: Build;
  top?: "tee" | "hoodie" | "polo" | "button" | "jersey" | "cardigan" | "blouse" | "sweater" | "tank";
  bottom?: "shorts" | "cargo" | "jeans" | "joggers" | "skirt" | "scrubs" | "overalls" | "dress";
  pattern?: "stripes" | "plaid" | "dots" | "print" | "number";
  layer?: {kind: "cardigan" | "jacket"; color: string; long?: boolean};
  acc?: ("lanyard" | "backpack" | "headband" | "cap" | "socks_high" | "watch" | "pen_in_hair")[];
  shoe?: "hightop" | "sneaker" | "flat" | "clog" | "boot";
  longSleeves?: boolean;
  leggings?: string;
  swimwear?: "trunks" | "onepiece" | "rashguard";
  /** female character (swimwear choice, never shirtless) */
  fem?: boolean;
  socks?: string; laces?: string; graphic?: "dino" | "star"; pleated?: boolean; num?: string; // jersey number (pattern "number")

  /** Owen series: hair tuft, bun, curls, glasses frame colour, backpack colour, cast wrap 0..1 on the character's LEFT arm */
  tuft?: boolean; hoodie?: boolean;
  /** stick-tee: n thin hair strands off the crown instead of a hair cap (Owen: 3) */
  strands?: number;
  /** stick-tee hair mass (bigger than the head, own silhouette); replaces the old hair cap (use with hat: null) */
  style?: "spiky" | "smooth" | "ponytail" | "curls" | "balding"; bun?: boolean; curly?: boolean; glasses?: string; backpack?: string; cast?: number; print?: boolean; cardigan?: boolean;
  /** 0 fresh .. 1 a week old: greyer paper, more tape patches */
  castWear?: number;
};
type P2 = [number, number];

const rad = (d: number) => (d * Math.PI) / 180;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const mul = (c: string, m: C3) => {
  const n = parseInt(c.slice(1), 16);
  const ch = (v: number, k: number) => Math.min(255, Math.round(v * k)).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255, m[0])}${ch((n >> 8) & 255, m[1])}${ch(n & 255, m[2])}`;
};
export const shade = (c: string, k: number) => mul(c, [k, k, k]);
export const mix = (a: string, b: string, t: number) => {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t).toString(16).padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};
/** deterministic per-character random in [0, 1) */
const rnd = (seed: number, k: number) => { const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const rotPts = (pts: P2[], a: number, cx: number, cy: number): P2[] =>
  pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
const rotAbout = (q: P2, a: number, c: P2): P2 => rotPts([q], a, c[0], c[1])[0];
const lerp2 = (a: P2, b: P2, t: number): P2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** smooth curve from a through (near) k to b, as a polyline */
export const curve = (a: P2, k: P2, b: P2, n = 10): P2[] => {
  const c: P2 = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2], out: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = 1 - t;
    out.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]);
  }
  return out;
};

export const RIFLEMAN: Outfit = { jacket: "#357650", pants: "#3d4440", boots: INK, hat: "shako", belt: "#f1efe6", buttons: "#d9dde0", rifle: true };
export const OFFICER: Outfit = { ...RIFLEMAN, hat: "shako_tall", buttons: "#e8c45a", sash: "#c0353a", sword: true, moustache: "#4a3020", rifle: false, belt: null, build: "stout" };
export const KID: Outfit = { jacket: "#f08a2c", pants: "#3b5b9a", boots: "#f4f1ea", hat: "cap", cap: "#e2453c", build: "kid" };
export const PARENT: Outfit = { jacket: "#7b5ac9", pants: "#3b3f52", boots: "#5a3b2a", hat: "hair", hair: "#5a3b2a" };
export const SKINS = [SKIN, SKIN, SKIN, SKIN];

export const soldier = (v = 0, extra: Partial<Outfit> = {}): Outfit => {
  const o: Outfit = { ...RIFLEMAN, skin: SKINS[v % 4] };
  if (v % 4 === 1) o.moustache = "#4a3426";
  if (v % 4 === 3) o.moustache = "#2a201a";
  return { ...o, ...extra };
};

export const townsfolk = (v = 0): Outfit => {
  const coats = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#2f5f6a", "#7b5ac9"];
  const o: Outfit = { jacket: coats[v % 6], pants: "#3b3f52", boots: "#4a3426", skin: SKINS[v % 4] };
  return v % 2 ? { ...o, hat: "bonnet", dress: ["#d9a441", "#c25a7a", "#5a8fc2"][v % 3] } : { ...o, hat: "tophat" };
};

export class Pen {
  g: CanvasRenderingContext2D;
  ol = 12;
  /** [angle, cx, cy] rotation about (cx, cy), optional post-translation [.., dx, dy] */
  rot: number[] | null = null;
  constructor(g: CanvasRenderingContext2D) { this.g = g; }
  P(x: number, y: number): P2 {
    if (!this.rot) return [x, y];
    const r = this.rot, a = r[0], cx = r[1], cy = r[2], dx = r.length > 3 ? r[3] : 0, dy = r.length > 4 ? r[4] : 0, c = Math.cos(a), s = Math.sin(a);
    return [cx + (x - cx) * c - (y - cy) * s + dx, cy + (x - cx) * s + (y - cy) * c + dy];
  }
  path(pts: P2[], close: boolean) {
    const g = this.g;
    g.beginPath();
    pts.forEach((p, i) => { const [x, y] = this.P(p[0], p[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    if (close) g.closePath();
  }
  /** filled shape with an ink outline; fill=null draws the outline only */
  poly(pts: P2[], fill: string | null, ol?: number) {
    const g = this.g, w = ol ?? this.ol;
    this.path(pts, true);
    if (fill) { g.fillStyle = fill; g.fill(); }
    if (w) { g.lineWidth = w; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); }
  }
  ell(cx: number, cy: number, rx: number, ry: number, fill: string | null, ol?: number, a0 = 0, a1 = 360, rot = 0) {
    this.poly(ellPts(cx, cy, rx, ry, a0, a1, rot), fill, ol);
  }
  /** thick round-capped limb with an ink rim (effects, rope) */
  line(pts: P2[], fill: string, w: number, ink = true) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    if (ink) { this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * this.ol * 0.9; g.stroke(); }
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  stroke(pts: P2[], w: number, fill = INK) {
    const g = this.g;
    g.lineCap = "round"; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
  }
  arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, w: number, fill = INK) {
    const pts: P2[] = [];
    for (let i = 0; i <= 24; i++) pts.push([cx + rx * Math.cos(rad(a0 + ((a1 - a0) * i) / 24)), cy + ry * Math.sin(rad(a0 + ((a1 - a0) * i) / 24))]);
    this.stroke(pts, w, fill);
  }
  dot(cx: number, cy: number, r: number, fill = INK) {
    const [x, y] = this.P(cx, cy);
    this.g.beginPath(); this.g.arc(x, y, r, 0, Math.PI * 2); this.g.fillStyle = fill; this.g.fill();
  }
  /** draw with a closed shape as clip */
  clip(pts: P2[], fn: () => void) { const g = this.g; g.save(); this.path(pts, true); g.clip(); fn(); g.restore(); }
  /** flat fill + soft crescent on the side away from the light (light = canvas angle the light comes FROM).
   *  Radial ramp centred `shift` R toward the light: flat out to ~0.6 R on the far side, full shadow by ~0.8 R. */
  shadedFill(pts: P2[], base: string, shadow: string, light: number, R: number, shift = 0.45, r0 = 1.05, r1 = 1.25) {
    const g = this.g, n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const [gx, gy] = this.P(cx + Math.cos(light) * shift * R, cy + Math.sin(light) * shift * R);
    const gr = g.createRadialGradient(gx, gy, 0, gx, gy, r1 * R);
    gr.addColorStop(0, base); gr.addColorStop(Math.min(0.78, r0 / r1), base); gr.addColorStop(0.79, base); gr.addColorStop(0.8, shadow); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** broad gradient across a shape along the light: lit edge = base, far edge = shadow (torsos, coats) */
  gradFill(pts: P2[], base: string, shadow: string, light: number, flat = 0.22) {
    const g = this.g, dx = Math.cos(light), dy = Math.sin(light), n = pts.length;
    let cx = 0, cy = 0, lo = Infinity, hi = -Infinity;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; const d = x * dx + y * dy; lo = Math.min(lo, d); hi = Math.max(hi, d); }
    const dc = cx * dx + cy * dy;
    const [ax, ay] = this.P(cx + dx * (hi - dc), cy + dy * (hi - dc)), [bx, by] = this.P(cx + dx * (lo - dc), cy + dy * (lo - dc));
    const gr = g.createLinearGradient(ax, ay, bx, by);
    gr.addColorStop(0, base); gr.addColorStop(flat, base); gr.addColorStop(0.79, base); gr.addColorStop(0.8, shadow); gr.addColorStop(1, shadow);
    this.path(pts, true); g.fillStyle = gr; g.fill();
  }
  /** thick-thin ink ring: w(θ) = w0 (1 + k cos(θ − thick)), θ from the contour centroid (canvas angles) */
  inkRing(pts: P2[], w0: number, thick: number, k = 0.04, col = INK) { // stick-tee: near-uniform line (bean style used 0.45)
    const n = pts.length;
    let cx = 0, cy = 0;
    for (const [x, y] of pts) { cx += x / n; cy += y / n; }
    const out: P2[] = [], inn: P2[] = [];
    pts.forEach((q, i) => {
      const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
      let nx = b[1] - a[1], ny = a[0] - b[0]; // outward normal for clockwise-on-screen contours
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
      const h = 0.5 * w0 * (1 + k * Math.cos(Math.atan2(q[1] - cy, q[0] - cx) - thick));
      out.push([q[0] + nx * h, q[1] + ny * h]); inn.push([q[0] - nx * h, q[1] - ny * h]);
    });
    const g = this.g;
    const trace = (r: P2[]) => { r.forEach(([x0, y0], i) => { const [x, y] = this.P(x0, y0); if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.closePath(); };
    g.beginPath(); trace(out); trace(inn.reverse());
    g.fillStyle = col; g.fill("evenodd");
  }
  /** flat strap with a thin ink rim (cross belts, sash, rifle, handles) */
  band(pts: P2[], fill: string, w: number, rim: number, cap: CanvasLineCap = "butt") {
    const g = this.g; g.lineCap = cap; g.lineJoin = "round";
    this.path(pts, false); g.strokeStyle = INK; g.lineWidth = w + 2 * rim; g.stroke();
    this.path(pts, false); g.strokeStyle = fill; g.lineWidth = w; g.stroke();
    g.lineCap = "round";
  }
}

const ellPts = (cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = 360, rot = 0, n = 48): P2[] => {
  const r = rad(rot), pts: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = rad(a0 + ((a1 - a0) * i) / n), x = rx * Math.cos(a), y = ry * Math.sin(a);
    pts.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return pts;
};

const rrect = (x0: number, y0: number, x1: number, y1: number, r: number, n = 8): P2[] => {
  const pts: P2[] = [];
  for (const [cx, cy, a] of [[x1 - r, y0 + r, -90], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, 90], [x0 + r, y0 + r, 180]])
    for (let i = 0; i <= n; i++) pts.push([cx + r * Math.cos(rad(a + (90 * i) / n)), cy + r * Math.sin(rad(a + (90 * i) / n))]);
  return pts;
};

/** tapered stroke, thick end at a: brows, moustache halves */
const taper = (p: Pen, a: P2, b: P2, wa: number, wb: number, col = INK) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  p.poly([[a[0] + nx * wa / 2, a[1] + ny * wa / 2], [b[0] + nx * wb / 2, b[1] + ny * wb / 2],
    [b[0] - nx * wb / 2, b[1] - ny * wb / 2], [a[0] - nx * wa / 2, a[1] - ny * wa / 2]], col, 0);
  p.dot(a[0], a[1], wa / 2, col); p.dot(b[0], b[1], wb / 2, col);
};

// ---------------- contours ----------------
export type Blob = { a: number; b: number; nTop: number; nBot: number; egg: number; asym: number; rot: number; noise: number; seed: number };

/** superellipse "bean": separate crown / jaw exponents, egg taper (neg = narrower chin), one-side bulge, soft noise.
 *  Points run right -> down -> left -> up (clockwise on screen). */
export const blobPts = (cx: number, cy: number, B: Blob, n = 72): P2[] => {
  const ph = [rnd(B.seed, 11), rnd(B.seed, 12), rnd(B.seed, 13)].map((v) => v * Math.PI * 2);
  const pts: P2[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t), e = 2 / (s < 0 ? B.nTop : B.nBot);
    let X = Math.sign(c) * Math.abs(c) ** e;
    const Y = Math.sign(s) * Math.abs(s) ** e;
    X *= (1 + B.egg * Y) * (1 + B.asym * Math.sign(X));
    const r = 1 + B.noise * (Math.cos(2 * t + ph[0]) + 0.7 * Math.cos(3 * t + ph[1]) + 0.5 * Math.cos(4 * t + ph[2]));
    const x = B.a * X * r, y = B.b * Y * r;
    pts.push([cx + x * Math.cos(B.rot) - y * Math.sin(B.rot), cy + x * Math.sin(B.rot) + y * Math.cos(B.rot)]);
  }
  return pts;
};

/** measured head: H/W 0.94, slightly pointed crown (1.75), fuller jaw (2.3), chin taper -0.12, 8 % bulge to the facing side */
export const headBlob = (seed: number, a = 118, facing = 0): Blob => ({
  a, b: a * (0.94 + 0.08 * (rnd(seed, 1) - 0.5)),
  nTop: 1.75 + 0.3 * (rnd(seed, 2) - 0.5), nBot: 2.3 + 0.3 * (rnd(seed, 3) - 0.5),
  egg: -0.12 + 0.06 * (rnd(seed, 4) - 0.5),
  asym: (0.06 + 0.04 * rnd(seed, 5)) * (facing || (rnd(seed, 6) < 0.5 ? -1 : 1)),
  rot: rad(8 * (rnd(seed, 7) - 0.5)), noise: 0.008, seed,
});

/** thickest outline direction: away from the light, pulled toward the ground (64 deg measured for upper-left light) */
export const thickAngle = (light: number) => Math.atan2(-Math.sin(light) + 0.8, -Math.cos(light));
const DEF_LIGHT = rad(-120);

// ---------------- faces ----------------
export type Expr = "neutral" | "stern" | "grin" | "laugh" | "whistle" | "nervous" | "shock" | "relief" | "relief_open" | "dazed"
  | "pained" | "smile" | "smile_closed" | "lick"
  // stick-tee set (2026-11-03, after the user's expression study sheet): lids + asymmetric brows carry the range
  | "smug" | "sad" | "angry" | "worried" | "sly" | "cry" | "proud" | "bored" | "tired" | "irritated" | "rage" | "confused"
  | "embarrassed" | "scared" | "curious" | "confident" | "pouty" | "excited" | "silly" | "disgusted"
  | "sideeye" | "eyeroll" | "deadpan" | "bruh" | "cringe" | "sheepish" | "scheming" | "fake_smile" | "puppy" | "jawdrop" | "shook" | "sigh" | "mindblown" | "smirk_wink" | "nervous_laugh" | "proud_chin"
  // built from parts for the producer's acting notes (r4-sol E): not every beat fits a stock face
  | "concentrate" | "resolve" | "concede" | "casual" | "amused" | "pressed";
type EyeK = "happy" | "dash" | "squeeze" | "shock" | "shockHalf" | "spiral";
/** parametric open eye: pupil oval (scale ps) under an upper lid line that covers `cov` (0 = an arc above the pupil,
 *  1 = shut) and dips `ti` / `to` u at the inner / outer end (+ = down); lower lid `lo` 0..1 pushes up from below */
type EyeP = { cov: number; ti?: number; to?: number; ps?: number; lo?: number; px?: number; py?: number };
type Eye = EyeK | EyeP;
type MouthK = "dash" | "frown" | "smirk" | "smile" | "smileWide" | "grin" | "laugh" | "o" | "O" | "wave" | "teeth" | "lick"
  | "side" | "pout" | "rage" | "tongue";
type Extra = "sweat" | "tears" | "blush" | "bags";
const O = (cov: number, o: Omit<EyeP, "cov"> = {}): EyeP => ({ cov, ...o });
/** eyes [back, front], brows [inner, outer] offsets in u (+ = down), brow2 = the front brow when it differs, mouth, extras */
const FACE: Record<Expr, { eye: [Eye, Eye]; brow: [number, number]; brow2?: [number, number]; mouth: MouthK; fx?: Extra[] }> = {
  neutral: { eye: [O(0.45), O(0.45)], brow: [0, -1], mouth: "dash" }, // reference default: lidded half-disc
  concentrate: { eye: [O(0.5, { ti: 1.5 }), O(0.5, { ti: 1.5 })], brow: [3.5, 0], mouth: "pout" }, // knitted brows, lips pushed: working on something
  resolve: { eye: [O(0.5, { ti: 2 }), O(0.5, { ti: 2 })], brow: [3, -1], mouth: "side" }, // jaw set: a decision
  concede: { eye: [O(0.6, { to: 1 }), O(0.6, { to: 1 })], brow: [-1, -2], brow2: [-3, -4], mouth: "pout" }, // one brow up, lips pursed: fine, you win
  amused: { eye: [O(0.58), O(0.58)], brow: [0, -2], brow2: [-2, -3], mouth: "smirk" }, // lidded, a small one-sided smile: amused, not proud (r5 E37)
  pressed: { eye: [O(0.35, { ti: -1 }), O(0.35, { ti: -1 })], brow: [-3, 0], mouth: "pout", fx: ["sweat"] }, // lips pressed on a grin he must not show (r10 E67)
  casual: { eye: [O(0.55), O(0.55)], brow: [0, 0], brow2: [-4, -5], mouth: "side" }, // over-relaxed, one brow up: "just asking"
  stern: { eye: [O(0.45, { ti: 2 }), O(0.45, { ti: 2 })], brow: [4, -2], mouth: "frown" },
  grin: { eye: ["happy", "happy"], brow: [-3, -3], mouth: "grin" },
  laugh: { eye: ["squeeze", "squeeze"], brow: [-4, -4], mouth: "laugh" },
  whistle: { eye: ["dash", "dash"], brow: [-2, -4], mouth: "o" },
  nervous: { eye: [O(0, { ps: 0.8 }), O(0, { ps: 0.8 })], brow: [-4, 2], mouth: "wave", fx: ["sweat"] },
  shock: { eye: ["shock", "shock"], brow: [-7, -6], mouth: "O" },
  relief: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "smileWide" },
  relief_open: { eye: ["happy", "happy"], brow: [-2, 1], mouth: "grin" },
  dazed: { eye: ["spiral", "spiral"], brow: [-3, 2], mouth: "wave" },
  pained: { eye: ["squeeze", O(0.55, { ti: -2 })], brow: [-3, 2], mouth: "teeth", fx: ["sweat"] },
  smile: { eye: [O(0.1), O(0.1)], brow: [0, -1], mouth: "smirk" },
  smile_closed: { eye: ["happy", "happy"], brow: [0, -1], mouth: "smile" },
  lick: { eye: [O(0.1), O(0.1)], brow: [0, -1], mouth: "lick" },
  smug: { eye: [O(0.5), O(0.25)], brow: [2, 0], brow2: [-3, -6], mouth: "smirk" },
  sad: { eye: [O(0.35, { ti: -2, to: 2 }), O(0.35, { ti: -2, to: 2 })], brow: [-5, 3], mouth: "frown" },
  angry: { eye: [O(0.35, { ti: 3, to: -1 }), O(0.35, { ti: 3, to: -1 })], brow: [6, -3], mouth: "side" },
  worried: { eye: [O(0.1), O(0.1)], brow: [-5, 2], mouth: "wave", fx: ["sweat"] },
  sly: { eye: [O(0.5, { lo: 0.4 }), O(0.5, { lo: 0.4 })], brow: [3, -1], brow2: [-2, -5], mouth: "smileWide" },
  cry: { eye: ["squeeze", "squeeze"], brow: [-5, 3], mouth: "frown", fx: ["tears"] },
  proud: { eye: ["happy", "happy"], brow: [-3, -4], mouth: "smileWide" },
  bored: { eye: [O(0.55), O(0.55)], brow: [1, 1], mouth: "side" },
  tired: { eye: [O(0.62, { lo: 0.2 }), O(0.62, { lo: 0.2 })], brow: [-1, 2], mouth: "dash", fx: ["bags"] },
  irritated: { eye: [O(0.5, { ti: 1 }), O(0.5, { ti: 1 })], brow: [3, -1], mouth: "side", fx: ["blush"] },
  rage: { eye: [O(0.2, { ti: 3, ps: 0.7 }), O(0.2, { ti: 3, ps: 0.7 })], brow: [7, -4], mouth: "rage" },
  confused: { eye: [O(0.1), O(0.3)], brow: [-4, -2], brow2: [2, 0], mouth: "side" },
  embarrassed: { eye: [O(0.35), O(0.35)], brow: [-3, 1], mouth: "wave", fx: ["blush"] },
  scared: { eye: [O(0, { ps: 0.65, lo: 0.25 }), O(0, { ps: 0.65, lo: 0.25 })], brow: [-6, 1], mouth: "frown", fx: ["sweat"] },
  curious: { eye: [O(0, { ps: 1.1 }), O(0.05, { ps: 1.1 })], brow: [-3, -4], brow2: [0, -1], mouth: "o" },
  confident: { eye: [O(0.3), O(0.3)], brow: [1, -2], mouth: "smirk" },
  pouty: { eye: [O(0.4), O(0.4)], brow: [-1, 1], mouth: "pout" },
  excited: { eye: [O(0, { ps: 1.25 }), O(0, { ps: 1.25 })], brow: [-5, -5], mouth: "laugh" },
  silly: { eye: [O(0), O(0.5)], brow: [-3, -3], brow2: [0, 0], mouth: "tongue" },
  disgusted: { eye: [O(0.45, { lo: 0.35 }), O(0.45, { lo: 0.35 })], brow: [4, -1], mouth: "teeth" },
  sideeye: { eye: [O(0.45, {px: -5}), O(0.45, {px: -5})], brow: [1, 0], brow2: [-4, -5], mouth: "side", fx: [] },
  eyeroll: { eye: [O(0.1, {py: -5}), O(0.1, {py: -5})], brow: [0, 0], brow2: [0, 0], mouth: "side", fx: [] },
  deadpan: { eye: [O(0.52), O(0.52)], brow: [0, 0], brow2: [0, 0], mouth: "dash", fx: [] },
  bruh: { eye: [O(0.66), O(0.6)], brow: [1, 1], brow2: [-2, -2], mouth: "side", fx: [] },
  cringe: { eye: [O(0.15, {ps: .7}), O(0.35, {ps: .7})], brow: [-5, 3], brow2: [-3, 2], mouth: "teeth", fx: ["sweat"] },
  sheepish: { eye: [O(0.2, {px: 4}), O(0.3, {px: 4})], brow: [-4, 1], brow2: [-2, -4], mouth: "grin", fx: ["blush"] },
  scheming: { eye: [O(0.6, {ti: 2}), O(0.6, {ti: 2})], brow: [4, -2], brow2: [4, -2], mouth: "grin", fx: [] },
  fake_smile: { eye: [O(0.15), O(0.15)], brow: [-2, -1], brow2: [-4, 1], mouth: "teeth", fx: ["sweat"] },
  puppy: { eye: [O(0, {ps: 1.45}), O(0, {ps: 1.45})], brow: [-7, 3], brow2: [-7, 3], mouth: "frown", fx: [] },
  jawdrop: { eye: ["shock", "shock"], brow: [-8, -8], brow2: [-8, -8], mouth: "O", fx: [] },
  shook: { eye: [O(0, {ps: .35}), O(0, {ps: .35})], brow: [-8, -7], brow2: [-8, -7], mouth: "wave", fx: ["sweat"] },
  sigh: { eye: [O(0.75), O(0.75)], brow: [-1, 2], brow2: [-1, 2], mouth: "o", fx: [] },
  mindblown: { eye: ["shock", "shock"], brow: [-10, -9], brow2: [-10, -9], mouth: "O", fx: [] },
  smirk_wink: { eye: [O(0.35), "dash"], brow: [2, -2], brow2: [-4, -6], mouth: "smirk", fx: [] },
  nervous_laugh: { eye: [O(0.3, {ps: .7}), O(0.1, {ps: .7})], brow: [-5, 2], brow2: [-4, 1], mouth: "laugh", fx: ["sweat"] },
  proud_chin: { eye: [O(0.6), O(0.45)], brow: [1, -2], brow2: [-2, -5], mouth: "smirk", fx: [] },
};
export const EXPRESSION_NAMES = Object.keys(FACE) as Expr[];
/** Library-owned acting controls; callers select a beat and never manage its internals. */
const COMEDY_MOTION: Partial<Record<Expr, {span: number; lift: number; dart: number; up: number; lid: number; jaw?: number}>> = {
  sideeye: {span: 0.8, lift: 0, dart: -5, up: 0, lid: 0},
  eyeroll: {span: 1, lift: 0, dart: 0, up: -3, lid: 0},
  deadpan: {span: 0.7, lift: 0, dart: 0, up: 0, lid: 0.12},
  bruh: {span: 0.8, lift: 1, dart: 0, up: 0, lid: 0.18},
  cringe: {span: 1, lift: 1.8, dart: 0, up: 0, lid: 0},
  sheepish: {span: 1, lift: 0, dart: 4, up: 0, lid: 0.1},
  scheming: {span: 1, lift: -1, dart: 0, up: 0, lid: 0.15},
  fake_smile: {span: 1, lift: 0, dart: 3, up: 0, lid: 0},
  puppy: {span: 0.8, lift: 0, dart: 0, up: -2, lid: 0},
  jawdrop: {span: 1, lift: -4, dart: 0, up: 0, lid: 0, jaw: .45},
  shook: {span: 1, lift: 2.2, dart: 0, up: 0, lid: 0},
  sigh: {span: 1.2, lift: 3, dart: 0, up: 0, lid: 0.2},
  mindblown: {span: 1.2, lift: -6, dart: 0, up: 0, lid: 0, jaw: .3},
  smirk_wink: {span: 0.7, lift: -1, dart: 2, up: 0, lid: 0.1},
  nervous_laugh: {span: 1.3, lift: 2, dart: 3, up: 0, lid: 0},
  proud_chin: {span: 1, lift: -4, dart: 0, up: -1, lid: 0.1},
};
/** blink: lid 1 shuts every open eye, 0.5 half-closes it; closed shapes (happy, squeeze, spiral) stay */
const blinkEye = (e: Eye, lid: number): Eye =>
  typeof e === "string" ? (lid >= 1 && (e === "shock" || e === "shockHalf") ? "dash" : lid > 0 && e === "shock" ? "shockHalf" : e)
  : lid >= 1 ? "dash" : lid > 0 ? { ...e, cov: Math.max(e.cov, 0.6) } : e;
const lidOf = (b: boolean | number | undefined) => (b === true ? 1 : Number(b) || 0);

const eye = (p: Pen, kind: Eye, x: number, ey: number, u: number, side: number, look: number, skin: string, spin = 0, lookY = 0) => {
  const lx = x + look * 5 * u, lw = 2.6 * u; // 5u: 3u did not read at 540 px (r5 E)
  if (typeof kind !== "string") {
    const { cov, ti = 0, to = 0, ps = 1, lo = 0, px = 0, py = 0 } = kind;
    // reference face (cartoon-3d-short characters.md 1.4 / 2.5, user 2026-11-03 "tham khảo trực tiếp style biểu cảm"):
    // no white sclera on ordinary eyes. A dark vertical oval dot (~9 x 13u) that, as the lid lowers, widens into the
    // deadpan lidded half-disc (18u lid line over a dark half-disc); pupils still dart / roll (px, py)
    const wide = clamp((cov - 0.2) / 0.3, 0, 1), rx = (4.6 + 4.4 * wide) * ps * u, ry = (6.6 - 0.6 * wide) * ps * u;
    const cxE = lx + px * u, cyE = ey + (py + 4.5 * lookY) * u, top = cyE - ry + cov * 2 * ry, low = cyE + ry - lo * ry;
    const lid = curve([cxE - side * (rx + 2.5 * u), top + ti * u], [cxE, top - 0.8 * u], [cxE + side * (rx + 2.5 * u), top + to * u], 10);
    p.clip([...lid, [cxE + side * (rx + 3 * u), low], [cxE - side * (rx + 3 * u), low]], () => p.ell(cxE, cyE, rx, ry, INK, 0));
    if (cov > 0.08) p.stroke(lid, 2.6 * u);
    if (lo > 0) p.stroke(curve([cxE - side * rx, low + 0.6 * u], [cxE, low - 1.2 * u], [cxE + side * rx, low + 0.6 * u], 6), 1.8 * u);
    return;
  }
  switch (kind) {
    case "happy": p.arc(x, ey + 3 * u, 8 * u, 6 * u, 200, 340, lw); break;
    case "dash": p.stroke([[x - 7.5 * u, ey], [x + 7.5 * u, ey]], lw); break;
    case "squeeze": p.stroke([[x + 6 * u * side, ey - 5 * u], [x - 6 * u * side, ey], [x + 6 * u * side, ey + 5 * u]], lw); break;
    case "shock": case "shockHalf":
      p.ell(x, ey, 11 * u, 11 * u, WHITE, 2.4 * u); p.dot(lx - side * 1.5 * u, ey + (1.5 + 3 * lookY) * u, 3 * u);
      if (kind === "shockHalf") { p.ell(x, ey, 11 * u, 11 * u, skin, 0, 180, 360); p.stroke([[x - 11 * u, ey], [x + 11 * u, ey]], 2.4 * u); }
      break;
    default: {
      const s: P2[] = [];
      for (let t = 1; t < 15; t++) s.push([x + Math.cos(t * 0.9 + spin * side) * t * 0.55 * u, ey + Math.sin(t * 0.9 + spin * side) * t * 0.55 * u]);
      p.stroke(s, 2.4 * u);
    }
  }
};

/** open "D" mouth with a white teeth band (+ tongue) */
const dmouth = (p: Pen, mx: number, y: number, rx: number, ry: number, u: number, tongue = false) => {
  p.ell(mx, y, rx, ry, MOUTH, 0, 0, 180);
  p.clip([[mx - rx, y], [mx + rx, y], [mx + rx, y + 3 * u], [mx - rx, y + 3 * u]], () => p.ell(mx, y, rx, ry, WHITE, 0, 0, 180));
  if (tongue) p.ell(mx + 2 * u, y + 0.62 * ry, 0.4 * rx, 0.28 * ry, TONGUE, 0);
  p.ell(mx, y, rx, ry, null, 3 * u, 0, 180);
};

const mouth = (p: Pen, kind: MouthK, mx: number, my: number, u: number, k = 1) => {
  const mw = 2.8 * u;
  switch (kind) {
    case "dash": p.stroke([[mx - 5.5 * u * k, my], [mx + 5.5 * u * k, my - 0.8 * u]], mw); break;
    case "frown": p.arc(mx, my + 3 * u, 6.5 * u * k, 3.5 * u, 200, 340, mw); break;
    case "smirk": p.arc(mx + u, my - 3 * u, 7 * u * k, 4 * u, 10, 150, mw); break;
    case "smile": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); break;
    case "smileWide": p.arc(mx, my - 4 * u, 11 * u * k, 6 * u, 15, 165, mw); break;
    case "grin": dmouth(p, mx, my - u, 12 * u * k, 8 * u, u); break;
    case "laugh": dmouth(p, mx, my, 16 * u * k, 11 * u, u, true); break;
    case "o": p.ell(mx + 4 * u, my, 3.5 * u, 4 * u, MOUTH, 2.8 * u); break;
    case "O": p.ell(mx, my + 2 * u, 9 * u * k, 11 * u, MOUTH, 3.2 * u); p.ell(mx + u, my + 8 * u, 4.3 * u * k, 3 * u, TONGUE, 0); break;
    case "wave": { const s: P2[] = []; for (let i = 0; i <= 12; i++) s.push([mx - 9 * u * k + i * 1.5 * u * k, my + 1.5 * u * Math.sin(i * 1.3)]); p.stroke(s, 3 * u); break; }
    case "teeth":
      p.poly([[mx - 12 * u * k, my - 4 * u], [mx + 12 * u * k, my - 4 * u], [mx + 11 * u * k, my + 4 * u], [mx - 11 * u * k, my + 4 * u]], WHITE, 3 * u);
      for (const j of [-1, 0, 1]) p.stroke([[mx + j * 6 * u * k, my - 4 * u], [mx + j * 6 * u * k, my + 4 * u]], 1.5 * u);
      break;
    case "lick": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); p.ell(mx + 6 * u * k, my + 3 * u, 3.6 * u, 4.6 * u, TONGUE, 2.4 * u); break;
    case "side": p.stroke([[mx - 4 * u * k, my + 1.5 * u], [mx + 7 * u * k, my - 1.5 * u]], mw); break;
    case "pout": p.stroke(curve([mx - 4 * u * k, my + 2 * u], [mx, my - 2.5 * u], [mx + 4 * u * k, my + 2 * u], 6), mw); break;
    case "rage": p.poly(curve([mx - 12 * u * k, my - 3 * u], [mx, my - 9 * u], [mx + 12 * u * k, my - 3 * u], 8).concat(curve([mx + 10 * u * k, my + 3 * u], [mx, my + 16 * u], [mx - 10 * u * k, my + 3 * u], 8)), MOUTH, 2.6 * u); break;
    case "tongue": p.arc(mx, my - 3 * u, 8 * u * k, 4.5 * u, 20, 160, mw); p.ell(mx + 3 * u * k, my + 3.5 * u, 4.4 * u, 5 * u, TONGUE, 2.2 * u); break;
  }
};

/** expression animation: et = seconds since this expression began, from = the one before (cast.ts track) */
export type FaceAnim = { et: number; from?: Expr };
const lerpN = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth01 = (x: number) => { const k = clamp(x, 0, 1); return k * k * (3 - 2 * k); };
const mixEye = (a: Eye, b: Eye, k: number): Eye => typeof a === "string" || typeof b === "string" ? (k < 0.5 ? a : b)
  : { cov: lerpN(a.cov, b.cov, k), ti: lerpN(a.ti ?? 0, b.ti ?? 0, k), to: lerpN(a.to ?? 0, b.to ?? 0, k), ps: lerpN(a.ps ?? 1, b.ps ?? 1, k), lo: lerpN(a.lo ?? 0, b.lo ?? 0, k), px: lerpN(a.px ?? 0, b.px ?? 0, k), py: lerpN(a.py ?? 0, b.py ?? 0, k) };
const SWAP = 0.3; // s: lids / brows / pupils ease from the previous expression; the mouth swaps half-way, so the eyes lead (r4-sol E: faces think, not switch)
const LOOPS = new Set<Expr>(["rage", "angry", "laugh", "excited", "grin", "nervous", "worried", "scared", "dazed", "tired", "bored", "whistle", "cry", "pained"]);
const DECAYS = new Set<Expr>(["shock", "smug", "sly", "confused", "embarrassed", "irritated"]);
/** how long an expression keeps changing (s): callers clamp exprT to it, so a settled face reuses its cached card */
export const animSpan = (e: Expr) => (COMEDY_MOTION[e]?.span ?? (LOOPS.has(e) ? Infinity : DECAYS.has(e) ? 1 : SWAP + 0.05));

/** face v3 (stick-tee). u = 1 % of the head width W. Oval eyes under parametric lids, thin arched brows, one-line mouths,
 *  every expression with its own motion (anim.et) and an eased swap from the previous one (anim.from). */
const faceFront = (p: Pen, cx: number, cy: number, W: number, expr: Expr, facing: number, look: number, lid: number, brim: boolean,
  skin: string, moustache?: string, stout = false, glasses?: string, anim: FaceAnim = { et: 9 }, lookY = 0) => {
  const u = W / 100, F = FACE[expr], P0 = FACE[anim.from ?? expr], et = anim.et, k = anim.from ? smooth01(et / SWAP) : 1;
  const two = Math.PI * 2, decay = (r: number) => Math.exp(-et * r);
  // whole-face motion: shock jolt, rage shake
  const motion = COMEDY_MOTION[expr], progress = smooth01(et / (motion?.span ?? 1));
  const jy = (motion ? motion.lift * u * progress : 0) + (expr === "shock" ? -5 * u * decay(9) * Math.cos(et * 38) : 0);
  const jx = expr === "rage" ? 1.4 * u * Math.sin(et * 47) : 0;
  const fx = cx + 7 * u * facing + jx, cyy = cy + jy;
  const ex = 13 * u, ey = cyy + 1 * u; // reference: eye centres 0.26 W apart, on the head centre line
  const jitter = expr === "nervous" || expr === "worried" || expr === "scared" ? 0.12 * Math.sin(et * 23) + 0.08 * Math.sin(et * 37) : 0;
  const droop = expr === "tired" || expr === "bored" ? 0.12 * (0.5 + 0.5 * Math.sin(et * 1.6 - 1.5)) : 0;
  const bounce = expr === "laugh" || expr === "excited" || expr === "grin" ? Math.abs(Math.sin(et * 9)) : 0;
  for (const side of [-1, 1]) {
    const x = fx + side * ex, front = facing ? side === facing : side > 0, j = front ? 1 : 0;
    let e = mixEye(P0.eye[j], F.eye[j], k);
    if (typeof e !== "string" && droop) e = { ...e, cov: Math.min(0.9, e.cov + droop) };
    if (motion && typeof e !== "string") e = {...e, cov: Math.min(.82, e.cov + motion.lid * Math.sin(progress * Math.PI)),
      px: (e.px ?? 0) + motion.dart * Math.sin(progress * Math.PI), py: (e.py ?? 0) + motion.up * Math.sin(progress * Math.PI)};
    const kind = blinkEye(e, lid);
    eye(p, kind, x, ey - bounce * 1.2 * u, u, side, look + jitter, skin, expr === "dazed" ? et * 5 : 0, lookY);
    const bw = (Fx: typeof F) => (front && Fx.brow2 ? Fx.brow2 : Fx.brow);
    const [b0, b1] = [bw(P0), bw(F)];
    let dI = lerpN(b0[0], b1[0], k), dO = lerpN(b0[1], b1[1], k);
    if (expr === "angry" || expr === "rage") dI += 0.9 * Math.sin(et * 29); // brow twitch
    if ((expr === "smug" || expr === "sly" || expr === "confused") && front && F.brow2) { const pop = 2.5 * decay(5) * Math.sin(et * 14); dI -= pop; dO -= pop; }
    if (bounce) { dI -= 1.5 * bounce; dO -= 1.5 * bounce; }
    // reference brows: tapered (thick inner 5.4u -> 2.4u), high (~20u above the eyes); neutral faces keep the facing-side brow
    // 2u higher (skeptical, the reference's resting look)
    const by = ey - (brim ? 18 : 20) * u, skep = front && !F.brow2 && (expr === "neutral" || expr === "deadpan" || expr === "smile") ? -2 : 0;
    if (kind === "shock" || kind === "shockHalf") p.arc(x, by - 6 * u - 3 * u * decay(7), 9 * u, 3 * u, 200, 340, 3.2 * u);
    else taper(p, [x - side * 8 * u, by + (dI + skep) * u], [x + side * 9 * u, by + (dO + skep) * u], 5.4 * u, 2.4 * u);
  }
  const mx = cx + 8 * u * facing + jx, my = cyy + 20 * u + bounce * 1.5 * u; // reference mouth: y +0.19 W, toward the facing side
  const mk = k < 0.5 ? P0.mouth : F.mouth, squash = anim.from ? 1 - 0.35 * Math.sin(Math.PI * clamp(et / SWAP, 0, 1)) : 1;
  const wob = expr === "nervous_laugh" ? 1.6 * Math.sin(et * 25) * (1 - progress) : expr === "nervous" || expr === "scared" || expr === "worried" ? Math.sin(et * 17) : 0;
  p.g.save(); // mouth squash on the swap: scale y about the mouth line
  const [qx, qy] = p.P(mx, my); p.g.translate(qx, qy); p.g.scale(1, squash * (1 + (motion?.jaw ?? 0) * progress)); p.g.translate(-qx, -qy);
  mouth(p, mk, mx + wob * u, my, u, expr === "whistle" ? 1 + 0.15 * Math.sin(et * 8) : 1); // reference-size mouths: a short tilted dash at rest
  p.g.restore();
  if (moustache) for (const s of [-1, 1])
    taper(p, [mx + s * 1.5 * u, cyy + 12.5 * u], [mx + s * (stout ? 19 : 15) * u, cyy + (stout ? 10.5 : 15) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  const fxs = k < 0.5 ? P0.fx ?? [] : F.fx ?? []; // extras swap with the mouth, not before the face has changed
  if (fxs.includes("sweat")) { const f = (et * 0.8) % 1; p.ell(cx + 40 * u * (facing || 1), cyy - 18 * u + f * 14 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u); }
  for (const side of [-1, 1]) {
    const x = fx + side * ex;
    if (fxs.includes("tears")) for (const ph of [0, 0.5]) { const f = (et * 1.4 + ph + (side > 0 ? 0.25 : 0)) % 1; p.ell(x + side * 2 * u, ey + 10 * u + f * 22 * u, 2.6 * u * (1 - 0.3 * f), 4.4 * u * (1 - 0.3 * f), "#9fd4ff", 1.6 * u); }
    const bl = fxs.includes("blush") ? smooth01(et / 0.5) : 0;
    if (bl) for (const kk of [-1, 1]) p.stroke([[x + side * 3 * u + kk * 2.5 * u, ey + 10 * u + (1 - bl) * 2.5 * u], [x + side * 2 * u + kk * 2.5 * u, ey + 10 * u + 5 * u * bl]], 1.4 * u, "#d0566a");
    if (fxs.includes("bags")) p.stroke(curve([x - 6 * u, ey + 9 * u], [x, ey + 11.5 * u], [x + 6 * u, ey + 9 * u], 6), 2.6 * u, "rgba(80,70,110,.35)");
  }
  if (glasses) {
    p.stroke([[fx - ex + 10 * u, ey - u], [fx + ex - 10 * u, ey - u]], 2.2 * u, glasses);
    for (const side of [-1, 1]) p.arc(fx + side * ex, ey, 10.5 * u, 9.5 * u, 0, 360, 2.4 * u, glasses);
  }
  if (expr === "rage") p.stroke([[cx + 30*u, cyy - 25*u], [cx + 35*u, cyy - 25*u], [cx + 35*u, cyy - 31*u]], 2.6*u, "#bb3333");
  if (expr === "mindblown") for (const a of [-155,-110,-70,-25]) {
    const r = 39 + 6 * progress; p.stroke([[cx + Math.cos(rad(a))*r*u, cyy + Math.sin(rad(a))*r*u], [cx + Math.cos(rad(a))*(r+8)*u, cyy + Math.sin(rad(a))*(r+8)*u]], 2*u);
  }
  void two;
};

/** profile face (facing screen-right): one eye, brow, nose tick, mouth near the front edge; no skin bump nose, no ear */
const faceSide = (p: Pen, hx: number, hy: number, W: number, expr: Expr, lid: number, brim: boolean, skin: string, moustache?: string, stout = false) => {
  const u = W / 100, F = FACE[expr], ex = hx + 27 * u, ey = hy;
  const kind = blinkEye(F.eye[1], lid);
  eye(p, kind, ex, ey, u, 1, 0.6, skin);
  const by = ey - (brim ? 17 : 20) * u, [dI, dO] = F.brow;
  if (kind === "shock" || kind === "shockHalf") p.arc(ex, by - 6 * u, 9 * u, 3 * u, 200, 340, 4 * u);
  else taper(p, [ex + 8 * u, by + dI * u], [ex - 7 * u, by - u + dO * u], 5 * u, 2.5 * u);
  p.stroke([[hx + 44 * u, hy + 4 * u], [hx + 47.5 * u, hy + 9 * u], [hx + 43 * u, hy + 10 * u]], 3 * u);
  mouth(p, F.mouth, hx + 33 * u, hy + 21 * u, u, 0.62);
  if (moustache) taper(p, [hx + 41 * u, hy + 13.5 * u], [hx + 25 * u, hy + (stout ? 11.5 : 16) * u], stout ? 5.5 * u : 4.5 * u, 1.6 * u, moustache);
  if (expr === "nervous") p.ell(hx - 30 * u, hy - 24 * u, 3 * u, 5 * u, "#9fd4ff", 2 * u);
};

// ---------------- stick-tee hair ----------------
/** point on the round head at math angle a (0 = right, pi/2 = top), radius k x R */
const onHead = (cx: number, hc: number, R: number, a: number, k: number): P2 => [cx + R * k * Math.cos(a), hc - R * k * Math.sin(a)];
const hairMass = (p: Pen, o: Outfit, H: Blob, cx: number, hc: number, ow: number, facing: number, seed: number) => {
  const R = H.a, u = (2 * R) / 100, col = o.hair ?? INK, lean = facing || (rnd(seed, 30) < 0.5 ? -1 : 1);
  const d = 0.32, cutY = hc - R * 0.42; // temples a bit below the equator; fringe line across the upper forehead
  const fringe = (zig: number): P2[] => { // right temple -> left temple, dipping toward the lean side
    const pts: P2[] = [], A = onHead(cx, hc, R, -d * 0.6, 1.0), B = onHead(cx, hc, R, Math.PI + d * 0.6, 1.0);
    for (let i = 0; i <= 8; i++) {
      const t = i / 8, x = A[0] + (B[0] - A[0]) * t, y = cutY + (A[1] - cutY) * (2 * t - 1) ** 2 * 0.9 + lean * (t - 0.5) * 8 * u;
      pts.push([x, y + (zig && i % 2 ? zig * u : 0)]);
    }
    return pts;
  };
  const arcPts = (k: (a: number, i: number) => number, n: number): P2[] => {
    const pts: P2[] = [];
    for (let i = 0; i <= n; i++) { const a = -d + ((Math.PI + 2 * d) * i) / n; pts.push(onHead(cx, hc, R, a, k(a, i))); }
    return pts;
  };
  const strand = (a0: number, a1: number) => p.stroke(curve(onHead(cx, hc, R, a0, 0.95), onHead(cx, hc, R, (a0 + a1) / 2, 1.08), onHead(cx, hc, R, a1, 0.75), 8), 1.3 * u, mul(col, [0.6, 0.6, 0.6]));
  if (o.style === "balding") { // bald crown, two side tufts
    for (const s of [-1, 1]) {
      const [x, y] = onHead(cx, hc, R, s > 0 ? 0.25 : Math.PI - 0.25, 1.02);
      p.ell(x + s * 3 * u, y, 13 * u, 17 * u, col, ow * 0.85, 0, 360, s * 20);
    }
    return;
  }
  if (o.style === "curls") { // cloud of curls: all rims first, then the fills merge them so only the outer rim stays
    const C: [number, number, number][] = [];
    for (let i = 0; i < 11; i++) { const a = -d * 0.8 + ((Math.PI + 1.6 * d) * i) / 10, [x, y] = onHead(cx, hc, R, a, 1.06 + 0.06 * rnd(seed, 40 + i)); C.push([x, y, (15 + 5 * rnd(seed, 60 + i)) * u]); }
    for (let i = 0; i < 4; i++) { const [x, y] = onHead(cx, hc, R, Math.PI / 2 + (i - 1.5) * 0.45, 0.72); C.push([x, y, 18 * u]); }
    for (const [x, y, r] of C) p.ell(x, y, r, r, col, ow);
    for (const [x, y, r] of C) p.ell(x, y, r - ow / 2, r - ow / 2, col, 0);
    for (let i = 0; i < 7; i++) { const [x, y] = C[i + 2]; p.arc(x, y + 2 * u, 6 * u, 5 * u, 200, 340, 1.3 * u, mul(col, [0.6, 0.6, 0.6])); }
    return;
  }
  const spiky = o.style === "spiky";
  const outer = arcPts((a, i) => spiky ? (i % 2 ? 1.06 : 1.2 + 0.08 * rnd(seed, 50 + i)) : 1.07 + 0.03 * Math.sin(a * 3 + seed), spiky ? 14 : 30)
    .map(([x, y], i) => spiky && i % 2 === 0 ? [x + lean * 6 * u, y - 2 * u] as P2 : [x, y] as P2); // spike tips lean over
  const cap = [...outer, ...fringe(spiky ? 5 : 0).reverse()]; // outer ends at the left temple: fringe runs left -> right
  p.shadedFill(cap, col, mul(col, SH_FELT), DEF_LIGHT, R, 0.35);
  p.poly(cap, null, ow);
  // clipped to the cap: the strand bows to 1.08 R, past the hair outline, and read as stray sketch lines (user, ep01 shot 5)
  p.clip(cap, () => { strand(Math.PI / 2 + lean * 0.5, Math.PI / 2 - lean * 0.2); strand(Math.PI / 2 - lean * 0.6, Math.PI / 2 - lean * 1.1); });
};
const ponytail = (p: Pen, o: Outfit, H: Blob, cx: number, hc: number, ow: number, facing: number) => {
  const R = H.a, u = (2 * R) / 100, s = -(facing || 1), [x, y] = onHead(cx, hc, R, s > 0 ? 0.55 : Math.PI - 0.55, 1.0), col = o.hair ?? INK;
  const tail: P2[] = [[x, y - 8 * u], [x + s * 30 * u, y + 5 * u], [x + s * 36 * u, y + 40 * u], [x + s * 22 * u, y + 62 * u], [x + s * 16 * u, y + 30 * u], [x, y + 8 * u]];
  p.poly(curve(tail[0], tail[1], tail[2], 8).concat(curve(tail[2], tail[3], tail[4], 8), curve(tail[4], tail[5], tail[0], 8)), col, ow);
  p.ell(x + s * 6 * u, y, 5 * u, 7 * u, "#d9534f", 1.6 * u); // hair tie
};

// ---------------- hats ----------------
const BONNET = "#e9cf8f", BONNET_BRIM = "#d6b46a";
/** parts of a hat that sit behind the head (bonnet) */
const hatBehind = (p: Pen, o: Outfit, H: Blob, cx: number, hc: number, light: number, thick: number, ow: number, side: boolean) => {
  if (o.style === "ponytail") ponytail(p, o, H, cx, hc, ow, 0);
  if (o.bun && o.hair) { // loose bun on the crown, slightly back
    const u = H.a / 50, bx = cx - (side ? 30 : 8) * u, by = hc - H.b - 6 * u;
    p.ell(bx, by, 22 * u, 18 * u, o.hair, ow * 0.85);
    p.arc(bx, by, 11 * u, 8 * u, 200, 340, 1.4 * u);
  }
  if (o.hat !== "bonnet") return;
  const bb = blobPts(cx - (side ? 12 : 0) * (H.a / 50), hc - 0.07 * 2 * H.b, { ...H, a: H.a * 1.17, b: H.b * 1.13, asym: 0, egg: 0.04, seed: H.seed + 3 });
  p.shadedFill(bb, BONNET, mul(BONNET, SH_CLOTH), light, H.a * 1.17);
  p.inkRing(bb, ow * 0.85, thick);
};

const hatOn = (p: Pen, o: Outfit, hp: P2[], H: Blob, cx: number, hc: number, light: number, seed: number, facing: number, side: boolean) => {
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, crown = hc - H.b, ow = 0.85 * 5 * u;
  if (o.style) hairMass(p, o, H, cx, hc, ow, facing, seed);
  if (o.strands) for (let i = 0; i < o.strands; i++) { // fanned strands, rooted just inside the crown line, tips curling outward
    const k = o.strands > 1 ? i / (o.strands - 1) - 0.5 : 0, rx = cx + (side ? 6 * u : 0) + k * 16 * u;
    p.stroke(curve([rx, crown + 3 * u], [rx + k * 10 * u, crown - 14 * u + Math.abs(k) * 4 * u], [rx + k * 26 * u + 3 * u, crown - 22 * u + Math.abs(k) * 9 * u], 10), 2.6 * u, o.hair ?? INK);
  }
  const a = H.rot + rad(4 * (rnd(seed, 20) - 0.5)); // tilt with the head, +-2 deg extra
  const R = (pts: P2[]) => rotPts(pts, a, cx, hc);
  const sag = (yb: number, wb: number): P2[] => {
    const base: P2[] = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; base.push([cx + wb * (2 * t - 1), yb + 3 * u * (1 - (2 * t - 1) ** 2)]); }
    return base;
  };
  if (o.hat === "shako" || o.hat === "shako_tall") {
    const tall = o.hat === "shako_tall", yb = crown + 0.25 * HH, ht = (tall ? 0.66 : 0.56) * HH, wb = 46 * u, wt = 52 * u;
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, "#3a3d47", "#24262d", light, wt, 0.4);
    if (tall) p.clip(body, () => p.band(R([[cx - wt - 5 * u, yb - ht + 0.07 * HH], [cx + wt + 5 * u, yb - ht + 0.07 * HH]]), "#e8c45a", 0.06 * HH, 1.5 * u));
    p.poly(body, null, ow);
    const deg = (a * 180) / Math.PI;
    if (side) {
      p.poly(R([[cx + 36 * u, yb - 1 * u], [cx + 60 * u, yb + 8 * u], [cx + 34 * u, yb + 6 * u]]), "#16171b", 2.5 * u);
      const [tx, ty] = R([[cx + 24 * u, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u);
    } else {
      const [px, py] = R([[cx + 3 * u * facing, yb + 3 * u]])[0];
      p.ell(px, py, 34 * u, 0.045 * HH, "#16171b", 2.5 * u, 0, 180, deg); // peak
      const [bx, by] = R([[cx, yb - 0.45 * ht]])[0];
      p.ell(bx, by, 7 * u, 6 * u, tall ? "#e8c45a" : "#c9ccd2", 2 * u, 0, 360, deg); // badge plate
      p.arc(bx, by, 3.5 * u, 2.8 * u, 200, 500, 1.6 * u);
      const [tx, ty] = R([[cx, yb - ht - 6 * u]])[0];
      p.ell(tx, ty, 7 * u, 7 * u, "#2b7a4b", 2.5 * u); // green tuft
    }
  } else if (o.hat === "cap" || o.hat === "hair") {
    const cut = crown + (o.hat === "cap" ? 0.24 : 0.27) * HH; // stick-tee: brows sit at ~.35 of the head
    const keep = (x: number, y: number) => y < cut || (side && o.hat === "hair" && x < cx - 6 * u && y < hc + 0.42 * H.b);
    // start the arc at the first kept point after a dropped one, so the kept run is contiguous and the cut closes it
    const n = hp.length, startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
    const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y))
      .map(([x, y]) => [cx + (x - cx) * 1.03, hc + (y - hc) * 1.03] as P2);
    if (arc.length < 3) return;
    if (o.hat === "hair") { // scalloped lower edge
      const [x0, y0] = arc[arc.length - 1], [x1, y1] = arc[0];
      for (let i = 1; i < 6; i++) arc.push([x0 + ((x1 - x0) * i) / 6, y0 + ((y1 - y0) * i) / 6 + (i % 2 ? 4 * u : 0)]);
    }
    const col = o.hat === "cap" ? o.cap! : o.hair!;
    p.shadedFill(arc, col, mul(col, SH_FELT), light, H.a, 0.35);
    p.poly(arc, null, ow);
    if (o.hat === "hair") {
      const s = side ? -1 : facing || 1;
      p.stroke([[cx + s * 10 * u, cut - 30 * u], [cx + s * 2 * u, cut - 12 * u]], 1.2 * u);
      if (o.tuft) { // Owen's silhouette: one cowlick spike off the crown
        const tx = cx + (side ? 8 : 4) * u;
        p.poly(R([[tx - 8 * u, crown + 5 * u], [tx - 6 * u, crown - 10 * u], [tx + 4 * u, crown - 20 * u], [tx + 15 * u, crown - 19 * u], [tx + 8 * u, crown - 12 * u], [tx + 7 * u, crown + 5 * u]]), col, ow);
      }
      if (o.curly) for (let i = 0; i < 7; i++) { // curls along the hairline arc
        const [x, y] = arc[Math.floor(((i + 0.5) * arc.length) / 7.5)] ?? arc[0];
        p.ell(x, y - 2 * u, 9 * u, 8 * u, col, ow * 0.8);
      }
    }
    if (o.hat === "cap") {
      const deg = (a * 180) / Math.PI;
      if (side) p.poly(R([[cx + 40 * u, cut - 2 * u], [cx + 74 * u, cut + 4 * u], [cx + 40 * u, cut + 6 * u]]), shade(col, 0.8), ow);
      else {
        const s = facing || (rnd(seed, 21) < 0.5 ? -1 : 1), [px, py] = R([[cx + s * 4 * u, cut + 1.5 * u]])[0];
        p.ell(px, py, 32 * u, 0.06 * HH, shade(col, 0.8), ow, 0, 180, deg);
      }
    }
  } else if (o.hat === "tophat") {
    const yb = crown + 0.22 * HH, ht = 0.8 * HH, wb = 0.31 * W, wt = 0.33 * W, col = "#2e2a36";
    const body = R([...sag(yb, wb).reverse(), [cx - wt, yb - ht], [cx + wt, yb - ht]]);
    p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4);
    p.clip(body, () => p.band(R([[cx - wt - 4 * u, yb - 0.13 * HH], [cx + wt + 4 * u, yb - 0.13 * HH]]), shade(o.jacket, 0.9), 0.14 * HH, 0.8 * u));
    p.poly(body, null, ow);
    const [bx, by] = R([[cx, yb + 1 * u]])[0];
    p.ell(bx, by, 0.45 * W, 0.05 * HH, "#1d1b22", ow, 0, 360, (a * 180) / Math.PI);
  } else if (o.hat === "bonnet") {
    const [bx, by] = R([[cx + (side ? 6 * u : 0), crown + 0.16 * HH]])[0];
    p.arc(bx, by, 0.5 * W, 0.2 * HH, 200, 340, 7 * u, BONNET_BRIM);
    p.arc(bx, by, 0.5 * W + 3.5 * u, 0.2 * HH + 3.5 * u, 200, 340, 1.2 * u);
    const cy = hc + H.b * 0.98;
    p.stroke([[cx - 14 * u, cy - 4 * u], [cx, cy + 2 * u], [cx + 14 * u, cy - 4 * u]], 2 * u, BONNET_BRIM);
  }
};

// ---------------- bodies ----------------
export type Arms = [P2[], P2[]];
/** held prop; for the hammer the number is the strike 0 (raised) .. 1 (struck) */
export type Prop = null | "icecream" | "shako" | ["hammer", number] | "pencil" | "mug" | "tray" | "paper" | "notebook" | "backpack2" | "laces" | "book"
  | "tproll" | "tape" | "peel" | "dollar" | "dollar2" | "bones" | "phone" | "clipboard"
  | "icebags" | "foodbox" | "pitcher" | "cash" | "cash3"; // ep02 "Cold Front"
/** arm override, relative to that shoulder: elbow (ex, ey), hand (hx, hy); x in body units u (screen +x), y in head-heights; front = drawn over the torso */
export type Reach = { ex: number; ey: number; hx: number; hy: number; front?: boolean };

/** Shoulder-relative x in body units; y in AH = head-height * build.arm (legacy reach contract). */
export const POSES: Record<string, [Reach | undefined, Reach | undefined]> = {
  hands_on_hips: [{ex: -22, ey: 0.3, hx: 3, hy: 0.65, front: true}, {ex: 22, ey: 0.3, hx: -3, hy: 0.65, front: true}],
  arms_crossed: [{ex: -10, ey: 0.45, hx: 46, hy: 0.38, front: true}, {ex: 10, ey: 0.48, hx: -46, hy: 0.49, front: true}],
  facepalm: [{ex: -14, ey: 0.05, hx: 32, hy: -0.7, front: true}, undefined],
  shrug: [{ex: -22, ey: 0.15, hx: -34, hy: -0.13, front: true}, {ex: 22, ey: 0.15, hx: 34, hy: -0.13, front: true}],
  point_left: [{ex: -28, ey: -0.06, hx: -58, hy: -0.06, front: true}, undefined],
  point_right: [undefined, {ex: 28, ey: -0.06, hx: 58, hy: -0.06, front: true}],
  head_scratch: [undefined, {ex: 23, ey: -0.28, hx: -3, hy: -0.8, front: true}],
  fist_pump: [undefined, {ex: 25, ey: -0.12, hx: 18, hy: -0.64, front: true}],
  cover_mouth: [{ex: -12, ey: 0.1, hx: 31, hy: -0.36, front: true}, undefined],
  hands_up: [{ex: -24, ey: -0.22, hx: -24, hy: -0.7, front: true}, {ex: 24, ey: -0.22, hx: 24, hy: -0.7, front: true}],
  chin_think: [{ex: -8, ey: 0.3, hx: 30, hy: -0.28, front: true}, {ex: 8, ey: 0.55, hx: -32, hy: 0.55, front: true}],
  wave: [undefined, {ex: 26, ey: -0.2, hx: 30, hy: -0.63, front: true}],
  hold_out: [{ex: -20, ey: 0.3, hx: -40, hy: 0.2, front: true}, undefined],
  clap: [{ex: 4, ey: 0.25, hx: 31, hy: 0.2, front: true}, {ex: -4, ey: 0.25, hx: -31, hy: 0.2, front: true}],
};

// "stick-tee" style (user ref 2026-11-03): round head on a stick neck, loose tee, stick limbs as thin skin tubes, chunky
// sneakers. Same overall height per build as the bean style (cards and staging keep their sizes); arm = arm-length
// factor on the old head-height units, so cast.ts poses (Reach in head-heights) keep their meaning.
const BUILD: Record<Build, { a: number; ua: number; torso: number; legs: number; tw: number; neck: number; arm: number }> = {
  adult: { a: 92, ua: 118, torso: 1.4, legs: 1.81, tw: 1.05, neck: 0.14, arm: 1.27 },
  stout: { a: 96, ua: 118, torso: 1.4, legs: 1.66, tw: 1.25, neck: 0.12, arm: 1.22 },
  kid: { a: 88, ua: 112, torso: 1.05, legs: 1.29, tw: 1.0, neck: 0.14, arm: 1.24 },
};
const LIMB = 10, LIMB_OL = 0.8; // limb tube width / ink rim, in u (ref: ~7 % of the head width overall)

export type FrontOpts = {
  phase?: number; expr?: Expr; mode?: "march" | "stroll" | "stand" | "sit" | "fall" | "kneel"; look?: number; lookY?: number; blink?: boolean | number; lift?: number;
  prop?: Prop; tilt?: number; headTilt?: number; wave?: number;
  /** sit on a raised seat this many design units above the floor: the hips rise, the shins reach the floor (a card lifted
   *  onto a chair instead left its feet hanging at seat height, user ep01 s11) */
  seat?: number;
  /** face animation: seconds since `expr` began, and the expression before it (eased swap) */
  exprT?: number; exprFrom?: Expr;
  /** [right arm (screen left), left arm (screen right, the cast)]: undefined keeps the mode's arm */
  reach?: [Reach | undefined, Reach | undefined];
  /** canvas angle the key light comes FROM (painted crescent + thick outline side) */
  light?: number; facing?: -1 | 0 | 1; seed?: number;
};

/** chunky sneaker: a fat rounded shoe along heel a -> toe b, ink rim, sole line (w = old foot stroke width) */
const footStroke = (p: Pen, a: P2, b: P2, w: number, col: string) => {
  const S = 2.0 * w, r = 0.3 * w, d = 0.32 * S;
  const aa: P2 = [a[0],a[1] - w * 5/6], bb: P2 = [b[0],b[1] - w * 5/6];
  p.stroke([aa, bb], S + 2 * r, INK); p.stroke([aa, bb], S, col);
  if (col === INK) p.ell(bb[0], bb[1] - .12*w, .96*w, .72*w, INK, 0);
  if (col !== INK) p.stroke([[a[0], a[1] + d], [b[0], b[1] + d]], 0.18 * w, INK);
};

export const bodyFront = (p: Pen, o: Outfit, opts: FrontOpts) => {
  const { phase = 0, expr = "neutral", mode = "march", look = 0, lookY = 0, blink = false, lift = 60, prop = null, tilt = 0, headTilt = 0, wave, reach,
    light = DEF_LIGHT, facing = 0, seed = 1, exprT = 9, exprFrom, seat = 0 } = opts;
  const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H: Blob = { ...headBlob(seed, Bd.a, facing), nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.004 }; H.b = 0.98 * H.a;
  // u = body unit of the old bean head (prop and limb sizes unchanged); the round head is smaller than that
  const W = 2 * H.a, HH = 2 * H.b, u = (2 * Bd.ua) / 100, AH = HH * Bd.arm;
  const tall = (1 + Bd.torso + Bd.legs) * HH, sole = 975;
  // body bob 5 % (march) / 3 % (stroll) of the height, lowest at contact (phase 0 and 0.5)
  const bob = mode === "march" ? 0.025 * tall * Math.cos(2 * two * phase) : mode === "stroll" ? 0.015 * tall * Math.cos(2 * two * phase) : 0;
  const torsoBot = mode === "sit" ? sole - 0.2 * HH - seat : mode === "kneel" ? sole - 0.55 * HH : sole - Bd.legs * HH + bob;
  const chin = torsoBot - Bd.torso * HH, hc = chin - Bd.neck * HH - H.b, crown = hc - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 3.7 * u;
  const legCol = mix(o.pants, INK, 0.55), armCol = mix(o.jacket, INK, 0.5), footCol = o.swimwear ? INK : o.boots;
  const legW = LIMB * u, footW = 7.5 * u;
  const tube = (c: P2[], w: number, col: string) => { p.stroke(c, w + 2 * LIMB_OL * u, INK); p.stroke(c, w, col); };
  const part = (c: P2[], f: number) => c.slice(0, Math.max(2, Math.round(f * (c.length - 1)) + 1));
  const shorts = o.swimwear === "trunks" || (o.bottom ? ["shorts", "cargo"].includes(o.bottom) : o.build === "kid");
  const skirted = ["skirt", "overalls", "dress"].includes(o.bottom ?? "");
  const cloth = (pts: P2[], color: string, width = 3*u) => { p.gradFill(pts,color,mul(color,SH_CLOTH),light); p.poly(pts,null,width); };
  const shoe = (pen: Pen, a: P2, b: P2, w: number, col: string) => {
    if(o.swimwear) { p.stroke([a,b],w,INK); return; }
    if(o.shoe === "hightop" || o.shoe === "boot") cloth([[a[0]-5*u,a[1]-15*u],[a[0]+6*u,a[1]-15*u],[a[0]+8*u,a[1]],[a[0]-6*u,a[1]]],col,2*u);
    footStroke(pen,a,b,o.shoe === "flat" ? w*.65 : w,col);
    if(o.shoe === "sneaker" || o.shoe === "hightop") for(const t of [.25,.5,.75]) { const q=lerp2(a,b,t);p.stroke([[q[0]-2*u,q[1]-4*u],[q[0]+2*u,q[1]]],1.2*u,o.laces ?? INK); }
  };
  const handsAt: [number, number][] = []; let legs = 0; // rig record for the limb gate (rig.ts)
  /** skin stick leg; shorts (kids) / trousers (adults) as a wider tube along the same curve, so every pose wears them */
  const leg = (c: P2[]) => {
    legs++;
    tube(c, legW, o.leggings ?? INK);
    if(o.socks && !o.swimwear) { const sock=c.slice(o.acc?.includes("socks_high") ? 5 : 8);p.stroke(sock,7*u,o.socks);if(o.acc?.includes("socks_high")) for(const q of sock.slice(0,2))p.stroke([[q[0]-3*u,q[1]],[q[0]+3*u,q[1]]],1.5*u,o.jacket); }
    if (!o.dress && !skirted && (!o.swimwear || o.swimwear !== "onepiece")) {
      const seg=part(c,shorts ? .49 : .94), a=seg[0], b=seg[seg.length-1];
      if(shorts) {
        const d=Math.hypot(b[0]-a[0],b[1]-a[1])||1,nx=-(b[1]-a[1])/d,ny=(b[0]-a[0])/d;
        cloth([[a[0]+nx*8*u,a[1]+ny*8*u],[b[0]+nx*10*u,b[1]+ny*10*u],[b[0]-nx*10*u,b[1]-ny*10*u],[a[0]-nx*8*u,a[1]-ny*8*u]],o.pants);
        p.stroke([[b[0]+nx*8*u,b[1]+ny*8*u],[b[0]-nx*8*u,b[1]-ny*8*u]],2*u,shade(o.pants,.65));
        if(o.top === "jersey")for(const q of seg.slice(1,-1))for(const side of [-1,1])p.dot(q[0]+side*5*u,q[1],.7*u,shade(o.pants,1.4));
        if(o.bottom === "cargo") {const q=seg[Math.floor(seg.length*.65)];cloth(rrect(q[0]-9*u,q[1]-4*u,q[0]+9*u,q[1]+9*u,2*u),o.pants,1.3*u);p.stroke([[q[0]-8*u,q[1]],[q[0]+8*u,q[1]]],1*u,INK);}
      } else if(!o.swimwear) { tube(seg,(o.bottom === "joggers" ? 15 : 18)*u,o.pants);p.stroke(seg.map(([x,y]):P2=>[x+4*u,y]),4*u,shade(o.pants,.73));p.stroke(seg,1*u,shade(o.pants,.6)); p.stroke([seg[seg.length-2],b],(o.bottom === "joggers" ? 7 : 11)*u,shade(o.pants,.8)); }
    }
  };
  const hand =(x: number, y: number) => { handsAt.push([x, y]); p.ell(x, y, 7.3 * u, 8.2 * u, INK, 0); p.ell(x + 5.2 * u, y - 3.7 * u, 4.2 * u, 4.8 * u, INK, 0); };
  // ---- legs + feet (not rotated) ----
  p.rot = null;
  if (mode === "sit") {
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 15 * u, hipY], k: P2 = [300 + side * 36 * u, hipY + 0.2 * HH], f: P2 = [300 + side * 44 * u, sole - 8 * u];
      leg(curve(h, k, f));
      shoe(p, [f[0] - side * 2 * u, f[1]], [f[0] + side * 12 * u, f[1] - 5 * u], footW, footCol);
    }
  } else if (mode === "kneel") {
    const f = facing || 1;
    leg(curve([300 + f * 12 * u, hipY], [300 + f * 34 * u, sole - 0.3 * HH], [300 + f * 30 * u, sole - 5 * u]));
    shoe(p, [300 + f * 27 * u, sole - 4 * u], [300 + f * 41 * u, sole - 3 * u], footW, footCol);
    leg(curve([300 - f * 12 * u, hipY], [300 - f * 6 * u, sole - 7 * u], [300 - f * 40 * u, sole - 7 * u]));
    shoe(p, [300 - f * 40 * u, sole - 7 * u], [300 - f * 52 * u, sole - 12 * u], footW, footCol);
  } else if (mode === "fall") {
    const legs: [P2, P2, P2][] = [
      [[300 - 15 * u, hipY], [300 - 46 * u, hipY + 0.5 * HH], [300 - 70 * u, hipY + 0.72 * HH]],
      [[300 + 15 * u, hipY], [300 + 50 * u, hipY + 0.45 * HH], [300 + 76 * u, hipY + 0.22 * HH]],
    ];
    legs.forEach(([h, k, f], i) => {
      leg(curve(h, k, f));
      shoe(p, f, [f[0] + (i ? 14 : -14) * u, f[1] + (i ? -6 : 4) * u], footW, footCol);
    });
  } else if (o.dress) {
    for (const side of [-1, 1]) {
      const fx = 300 + side * 12 * u, fy = sole - 4 * u;
      leg([[fx, sole - 0.4 * HH], [fx + side * u, fy]]);
      shoe(p, [fx - side * 3 * u, fy], [fx + side * 12 * u, fy + u], footW, footCol);
    }
  } else {
    const L = mode === "march" ? lift * 1.25 : mode === "stroll" ? lift * 0.55 : 0;
    for (const [side, ph] of [[-1, 0], [1, 0.5]] as const) {
      const up = Math.max(0, Math.sin(two * (phase + ph))) * L;
      const hx = 300 + side * 15 * u, fx = 300 + side * 22 * u, fy = sole - 4 * u - up;
      const k: P2 = [(hx + fx) / 2 + side * (1.5 * u + up * 0.16), (hipY + fy) / 2 - up * 0.08];
      leg(curve([hx, hipY], k, [fx, fy]));
      shoe(p, [fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u], footW, footCol);
    }
  }
  // ---- upper body: rotates about the hips (tilt + a small weight-shift sway on every step) ----
  const sway = mode === "march" ? 1.6 * Math.sin(two * phase) : mode === "stroll" ? 1.0 * Math.sin(two * phase) : 0;
  const A = tilt + sway;
  p.rot = A ? [rad(A), 300, hipY] : null;
  const dress = !!o.dress && mode !== "sit" && mode !== "fall";
  const hem = torsoBot + 0.06 * HH;
  const T: Blob = { a: ((Bd.tw / 2) * W) / 1.06, b: 0.5 * (hem - (chin - 0.04 * HH)), nTop: 3.2, nBot: 3.8, egg: o.build === "stout" ? 0.12 : 0.08,
    asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 3 * u * facing, tcy = hem - T.b;
  let tp: P2[] = [[tcx - .67*T.a, chin], [tcx + .67*T.a, chin], [tcx + T.a, chin + .23*HH],
    [tcx + .88*T.a, hem], [tcx - .88*T.a, hem], [tcx - T.a, chin + .23*HH]];
  if(o.top === "hoodie") tp = [[tcx-.85*T.a,chin],[tcx+.85*T.a,chin],[tcx+1.18*T.a,chin+.23*HH],[tcx+1.05*T.a,hem+.13*HH],[tcx-1.05*T.a,hem+.13*HH],[tcx-1.18*T.a,chin+.23*HH]];
  if(o.top === "jersey" || o.top === "tank") tp = [[tcx-.5*T.a,chin],[tcx+.5*T.a,chin],[tcx+.78*T.a,hem],[tcx-.78*T.a,hem]];
  // shoulder on the garment's own edge: sleeveless tops narrow to .5 T.a at the armhole and bare-chest trunks are one stick,
  // so the tee shoulder (.85 T.a) left those arms hanging in the air beside the body (user, 2026-11-03)
  const shK = o.swimwear === "trunks" ? 0.04 : o.top === "jersey" || o.top === "tank" || o.swimwear === "onepiece" ? 0.42 : 0.85;
  const sh = (side: number): P2 => [tcx + side * shK * T.a, chin + 0.12 * HH];
  const hang = (side: number, fwd: number): [P2, P2, P2] => {
    const S = sh(side), ex = tcx + side * (1.12 * T.a + 4 * u);
    const hx = ex + side * 3 * u - side * 6 * u * Math.max(0, fwd) + side * 4 * u * Math.max(0, -fwd);
    return [S, [ex, S[1] + 0.48 * AH], [hx, chin + 1.04 * AH - Math.abs(fwd) * 9 * u]];
  };
  const sw = mode === "march" || mode === "stroll" ? Math.sin(two * phase) : 0;
  // rifle at the order: butt by the right hip, held by the hanging right hand, muzzle past the crown
  const R0: P2 = [300 + 47 * u, torsoBot + 0.12 * AH], R1: P2 = [300 + 64 * u, crown - 0.32 * AH];
  const rifle = !!o.rifle && (mode === "march" || mode === "stand" || mode === "stroll");
  type Arm = { pts: [P2, P2, P2]; front: boolean; side?: number };
  const arms: Arm[] = [];
  const book: P2 = [tcx, chin + 0.42 * AH];
  if (prop === "book") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.08 * T.a + 6 * u), sh(side)[1] + 0.32 * AH], [book[0] + side * 25 * u, book[1] + 6 * u]], front: true, side });
  else if (mode === "kneel") {
    const f = facing || 1, H0 = rotAbout([300 + f * 105 * u, sole - 0.06 * AH], -rad(A), [300, hipY]);
    for (const side of [-1, 1]) {
      const S = sh(side), Hd: P2 = [H0[0] + side * 7 * u, H0[1]];
      arms.push({ pts: [S, [(S[0] + Hd[0]) / 2 - f * 8 * u, (S[1] + Hd[1]) / 2 + 6 * u], Hd], front: side === f, side });
    }
  } else if (mode === "sit") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.1 * T.a + 6 * u), sh(side)[1] + 0.4 * AH], [tcx + side * (1.2 * T.a + 10 * u), torsoBot + 0.04 * AH]], front: false, side });
  else if (mode === "fall") for (const side of [-1, 1]) arms.push({ pts: [sh(side), [tcx + side * (1.15 * T.a + 12 * u), sh(side)[1] - 0.25 * AH], [tcx + side * (1.3 * T.a + 24 * u), sh(side)[1] - 0.68 * AH]], front: false });
  else {
    arms.push({ pts: prop === "shako" ? hang(-1, 0) : hang(-1, -sw), front: false, side: -1 });
    if (rifle) {
      const G = lerp2(R0, R1, 0.1);
      arms.push({ pts: [sh(1), [tcx + 1.12 * T.a + 5 * u, sh(1)[1] + 0.45 * AH], G], front: false });
    } else if (wave !== undefined) {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.1 * T.a + 10 * u + 3 * u * wave, S[1] - 0.22 * AH], [tcx + 1.18 * T.a + 16 * u + 12 * u * wave, S[1] - 0.6 * AH]], front: false, side: 1 });
    } else if (prop === "icecream") {
      const S = sh(1);
      arms.push({ pts: [S, [tcx + 1.05 * T.a + 4 * u, S[1] + 0.45 * AH], [tcx + 0.5 * T.a, S[1] + 0.4 * AH]], front: true });
    } else if (Array.isArray(prop)) {
      const S = sh(1), k = clamp(prop[1], 0, 1);
      const E = lerp2([tcx + 1.1 * T.a + 10 * u, S[1] - 0.15 * AH], [tcx + 1.2 * T.a + 10 * u, S[1] + 0.3 * AH], k);
      const Hd = lerp2([tcx + 1.15 * T.a + 14 * u, S[1] - 0.55 * AH], [tcx + 1.45 * T.a + 22 * u, S[1] + 0.35 * AH], k);
      arms.push({ pts: [S, E, Hd], front: true });
    } else arms.push({ pts: hang(1, sw), front: false, side: 1 });
  }
  if (reach) {
    const keep = (side: number) => arms.find((a) => a.side === side) ?? { pts: hang(side, 0), front: false, side };
    arms.splice(0, arms.length, ...[-1, 1].map((side, i): Arm => {
      const r = reach[i], S = sh(side);
      return r ? { pts: [S, [S[0] + r.ex * u, S[1] + r.ey * AH], [S[0] + r.hx * u, S[1] + r.hy * AH]], front: !!r.front, side } : keep(side);
    }));
  }
  const drawArm = (a: Arm) => {
    const c = curve(a.pts[0], a.pts[1], a.pts[2], 20);
    // no sleeves at all (user, 2026-11-03, after the reference): a bare black stick from the garment's edge reads in every
    // pose; sleeves bent badly at the elbow and limited the motion
    tube(c, LIMB * u, INK);
    hand(a.pts[2][0], a.pts[2][1]);
    if(o.acc?.includes("watch"))p.ell(a.pts[2][0],a.pts[2][1]-8*u,5*u,4*u,"#a9b5bb",1*u);
    if (o.cast && a.side === 1) {
      // Distal half of the SAME arm curve; fractional sampling keeps wrapping continuous.
      const growth = clamp(o.cast, 0, 1), wear = clamp(o.castWear ?? 0, 0, 1);
      const sample = (t: number): P2 => {
        const f = clamp(t, 0, 1) * (c.length - 1), i = Math.min(c.length - 2, Math.floor(f));
        return lerp2(c[i], c[i + 1], f - i);
      };
      const start = 0.94 - 0.40 * growth, end = 0.96;
      const seg = Array.from({length: 17}, (_, i) => sample(start + (end - start) * i / 16));
      const width = LIMB * 2.2 * u, rim = 2 * u;
      const paper = mix("#f7f3ea", "#bbbcb5", wear);
      p.stroke(seg, width + rim * 2, INK); p.stroke(seg, width, paper);
      // Cross-sections follow the curve normal; two quiet paper seams, never a spiral pattern.
      const cross = (f: number, half: number, bend = 0): P2[] => {
        const t = start + (end - start) * f, q = sample(t);
        const v = sample(t + 0.015), v0 = sample(t - 0.015);
        const dx = v[0] - v0[0], dy = v[1] - v0[1], d = Math.hypot(dx, dy) || 1;
        return [[q[0] - dy / d * half, q[1] + dx / d * half],
          [q[0] + dx / d * bend, q[1] + dy / d * bend],
          [q[0] + dy / d * half, q[1] - dx / d * half]];
      };
      for (const f of [0.33, 0.72]) p.stroke(cross(f, width * 0.43, 1.5 * u), 0.9 * u, mix(paper, INK, 0.24));
      // Wide brown packing tape across the sleeve, with large off-white gaps.
      for (const f of [0.15, 0.84]) {
        p.stroke(cross(f, width * 0.47, u), 5.2 * u, "#815329");
        p.stroke(cross(f, width * 0.43, u), 3.6 * u, "#b58148");
      }
      if (wear > 0) {
        const q = seg[0], next = seg[1], d = Math.hypot(next[0]-q[0], next[1]-q[1]) || 1;
        const sign = next[1] >= q[1] ? -1 : 1;
        const nx = -sign*(next[1]-q[1])/d, ny = sign*(next[0]-q[0])/d;
        const tag = (x: number, y: number): P2 => [q[0]+nx*x*u, q[1]+ny*x*u+y*u];
        const g = p.g; g.save(); g.globalAlpha *= wear;
        p.poly([tag(6,0),tag(13,4),tag(16,16),tag(12,13),tag(10,18),tag(8,12),tag(7,4)],paper,1.1*u);
        for (const f of [0.43, 0.60]) p.stroke(cross(f, width * 0.30, 2*u), 4*u, "#986b3b");
        g.restore();
      }
      hand(a.pts[2][0], a.pts[2][1]);
    }
  };
  // behind the body: rifle, sword, arms
  if (rifle) {
    p.band([R0, R1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(R0, R1, 0.6), R1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  if (o.sword && mode !== "sit") {
    const s0: P2 = [tcx - 0.75 * T.a, torsoBot - 0.2 * HH];
    p.band([s0, [s0[0] - Math.sin(rad(25)) * 0.8 * HH, s0[1] + Math.cos(rad(25)) * 0.8 * HH]], "#c9ccd2", 3 * u, 1.2 * u, "round");
  }
  if (o.backpack && mode !== "fall") {
    const bp = blobPts(tcx, tcy - 0.05 * HH, { ...T, a: T.a * 1.18, b: T.b * 0.95, seed: seed + 11 });
    p.gradFill(bp, o.backpack, mul(o.backpack, SH_CLOTH), light); p.inkRing(bp, ow * 0.9, thick);
  }
  if(o.top === "hoodie") cloth(ellPts(tcx,chin+.03*HH,T.a*.95,HH*.19),shade(o.jacket,.8));
  for (const a of arms) if (!a.front) drawArm(a);
  // torso / dress: shaded fill -> clothing clipped to it -> thick-thin ink ring
  if(o.swimwear === "trunks") { /* bare black stick torso, swimsuit begins at hips */
    tube([[tcx,chin],[tcx,torsoBot]],LIMB*u,INK);
    // one seat piece over the stick's end and both leg caps: curved waist, hips, an inverted-V crotch. A flat rectangle
    // band with the leg tubes' round caps poking above it read as plumbing (user, 2026-11-03). The leg tubes stay the legs.
    const y0 = hipY - 9 * u, yc = torsoBot + 0.13 * HH; // waist above the hip joints: the leg tubes' caps sit under it
    const seat: P2[] = [...curve([tcx - 25 * u, y0 + 1.5 * u], [tcx, y0 - 2.5 * u], [tcx + 25 * u, y0 + 1.5 * u], 8),
      [tcx + 27 * u, yc + 3 * u], [tcx + 9 * u, yc + 6 * u], [tcx, yc - 1 * u], [tcx - 9 * u, yc + 6 * u], [tcx - 27 * u, yc + 3 * u]];
    cloth(seat, o.pants);
    p.stroke(curve([tcx - 24 * u, y0 + 6 * u], [tcx, y0 + 2 * u], [tcx + 24 * u, y0 + 6 * u], 8), 2.2 * u, shade(o.pants, 0.7)); // waistband
    for (const s of [-1, 1]) p.stroke([[tcx + s * 1.5 * u, y0 + 5 * u], [tcx + s * 4 * u, y0 + 13 * u]], 1.3 * u, "#f4f1ea"); // drawstring
  } else if (dress) {
    const D: Blob = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0.03 * facing, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(300, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, o.dress!, mul(o.dress!, SH_CLOTH), light);
    if (o.print) p.clip(dp, () => { for (let row = 0; row < 12; row++) for (let col = 0; col < 6; col++) {
      const x = 300 + (col - 2.5) * 18 * u + (row % 2) * 8 * u, y = chin + row * 18 * u;
      for (const a of [0, 90, 180, 270]) p.ell(x + Math.cos(rad(a)) * 2.5 * u, y + Math.sin(rad(a)) * 2.5 * u, 1.5 * u, 2.5 * u, shade(o.dress!, 1.15), 0, 0, 360, a);
    }});
    p.stroke([[300 + .23*W, chin + .5*HH],[300 + .3*W, sole - .46*HH]], 1.2*u, shade(o.dress!, .65));
    p.inkRing(dp, ow, thick);
    const Sw: Blob = { a: 0.37 * W, b: 0.3 * HH, nTop: 2.2, nBot: 2.4, egg: 0.1, asym: 0, rot: 0, noise: 0.006, seed: seed + 8 };
    const sp = blobPts(300, chin + 0.12 * HH, Sw);
    p.gradFill(sp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.inkRing(sp, ow * 0.9, thick);
  } else {
    p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
    p.clip(tp, () => {
      if (o.belt) {
        for (const s of [-1, 1]) p.band([[tcx - s * 0.75 * T.a, chin - 0.05 * HH], [tcx + s * 0.8 * T.a, torsoBot - 0.1 * HH]], o.belt!, 5.5 * u, 1.8 * u);
        const xc = tcx + 0.025 * T.a, yc = chin - 0.05 * HH + (torsoBot - 0.1 * HH - (chin - 0.05 * HH)) * (0.75 / 1.55);
        p.poly([[xc - 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc - 3.5 * u], [xc + 3.5 * u, yc + 3.5 * u], [xc - 3.5 * u, yc + 3.5 * u]], "#d9dde0", 1.5 * u);
      }
      if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
      if (o.hoodie || o.top === "hoodie") { // kangaroo pocket + drawstrings instead of buttons
        const py = torsoBot - 0.42 * HH;
        p.poly([[tcx - 0.5 * T.a, py], [tcx + 0.5 * T.a, py], [tcx + 0.62 * T.a, torsoBot - 0.08 * HH], [tcx - 0.62 * T.a, torsoBot - 0.08 * HH]], shade(o.jacket, 0.88), 1.6 * u);
        for (const s of [-1, 1]) p.stroke([[tcx + s * 7 * u, chin + 0.04 * HH], [tcx + s * 8 * u, chin + 0.3 * HH]], 1.8 * u, "#f4f1ea");
      }
      for (let i = 0; i < (o.hoodie || !o.buttons ? 0 : 4); i++) { // stick-tee: plain tees, buttons only when an outfit names them
        const y = chin + 0.12 * HH + i * 0.2 * HH;
        if (o.sash && Math.abs(y - (torsoBot - 0.32 * HH)) < 0.08 * HH) continue;
        p.dot(tcx + 2 * u * facing, y, 2.2 * u + 0.8 * u, INK); p.dot(tcx + 2 * u * facing, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7));
      }
    });
    if (o.sash) { const s = facing || 1; p.poly([[tcx + s * 0.55 * T.a, torsoBot - 0.3 * HH], [tcx + s * 0.75 * T.a, torsoBot + 0.05 * HH], [tcx + s * 0.45 * T.a, torsoBot + 0.02 * HH]], o.sash, 1.6 * u); }
    p.stroke([[tcx - 0.75 * T.a, hem - 6 * u], [tcx + 0.75 * T.a, hem - 6 * u]], 1.3 * u, shade(o.jacket, 0.65));
    p.arc(tcx, chin - 0.02 * HH, 10 * u, 6 * u, 0, 180, 2 * u);
    for (const side of [-1, 1]) p.stroke([[tcx + side * 0.76 * T.a, chin + 0.35 * HH], [tcx + side * 0.64 * T.a, chin + 0.49 * HH]], 1.2 * u, shade(o.jacket, 0.55));
    if (o.cardigan) {
      p.poly([[tcx - 11 * u, chin], [tcx + 11 * u, chin], [tcx + 9 * u, hem - 8 * u], [tcx - 9 * u, hem - 8 * u]], WHITE, 1.5 * u);
      p.stroke([[tcx, chin + 10 * u], [tcx, hem - 8 * u]], 1.2 * u, shade(o.jacket, 0.5));
    }
    p.inkRing(tp, ow, thick);
  }
  // Garment details belong to the renderer; callers choose only the outfit.
  if(o.pattern) p.clip(tp,()=>{
    if(o.pattern === "stripes" || o.pattern === "plaid") {
      for(let y=chin+14*u;y<hem;y+=14*u)p.stroke([[tcx-T.a,y],[tcx+T.a,y]],o.pattern === "plaid" ? 4*u : 3*u,shade(o.jacket,1.35));
      if(o.pattern === "plaid")for(let x=tcx-T.a;x<tcx+T.a;x+=15*u)p.stroke([[x,chin],[x,hem]],3*u,shade(o.jacket,.65));
    } else if(o.pattern === "dots" || o.pattern === "print") for(let y=chin+12*u;y<hem;y+=15*u)for(let x=tcx-T.a+7*u;x<tcx+T.a;x+=15*u)p.ell(x,y,2*u,3*u,shade(o.jacket,.65),0);
    else if(o.pattern === "number") { const g=p.g;g.save(); const q=p.P(tcx,chin+.64*HH);g.fillStyle=WHITE;g.font=`bold ${30*u}px Arial`;g.textAlign="center";g.fillText(o.num ?? "7",...q);g.restore(); }
  });
  if(o.top === "polo" || o.top === "button" || o.top === "blouse") {
    for(const side of [-1,1])cloth([[tcx,chin+7*u],[tcx+side*15*u,chin],[tcx+side*13*u,chin+18*u]],shade(o.jacket,1.12),1.5*u);
    p.stroke([[tcx,chin+8*u],[tcx, o.top === "button" ? hem-5*u : chin+28*u]],1*u,INK);
    for(let y=chin+20*u;y<(o.top === "button" ? hem : chin+35*u);y+=13*u)p.dot(tcx,y,1.6*u,INK);
  }
  if(o.graphic) {const x=tcx,y=chin+.55*HH; if(o.graphic === "dino") {cloth([[x-16*u,y+9*u],[x-23*u,y-4*u],[x-7*u,y],[x+4*u,y-17*u],[x+17*u,y-17*u],[x+19*u,y-6*u],[x+9*u,y-4*u],[x+8*u,y+12*u]],"#b9d875",1.5*u);p.dot(x+13*u,y-13*u,1.3*u); }else p.ell(x,y,14*u,14*u,"#f4d361",2*u); }
  if(skirted || o.swimwear === "onepiece") {
    const end=skirted ? hem+(o.bottom === "dress" ? .55 : .48)*HH : hem+.16*HH;
    const color=o.bottom === "dress" ? o.jacket : o.pants;
    const skirt:P2[]=[[tcx-.85*T.a,torsoBot-.12*HH],[tcx+.85*T.a,torsoBot-.12*HH],[tcx+(o.swimwear ? .72 : 1.25)*T.a,end],[tcx-(o.swimwear ? .72 : 1.25)*T.a,end]];
    if(o.swimwear === "onepiece") {
      // leotard cut: hips -> leg openings rising to the sides -> a narrow crotch (the old shape read as a diaper)
      cloth([[tcx-.85*T.a,torsoBot-.12*HH],[tcx+.85*T.a,torsoBot-.12*HH],[tcx+.8*T.a,torsoBot-.02*HH],[tcx+.18*T.a,end],[tcx-.18*T.a,end],[tcx-.8*T.a,torsoBot-.02*HH]],color);
    } else cloth(skirt,color);if(!o.swimwear) p.stroke([[tcx-T.a,end-4*u],[tcx+T.a,end-4*u]],1*u,shade(color,.6));
    for(const side of o.swimwear ? [] : o.pleated ? [-.8,-.4,0,.4,.8] : [-.6,.6])p.stroke([[tcx+side*T.a,torsoBot],[tcx+side*1.3*T.a,end-6*u]],1*u,shade(color,.65));
    if(o.bottom === "overalls") { cloth(rrect(tcx-23*u,chin+.26*HH,tcx+23*u,hem,3*u),color,2*u);for(const side of [-1,1]){p.band([[tcx+side*25*u,chin],[tcx+side*18*u,chin+.45*HH]],color,7*u,1*u);p.dot(tcx+side*18*u,chin+.4*HH,2*u,"#edc45c");}cloth(rrect(tcx-13*u,chin+.51*HH,tcx+13*u,chin+.76*HH,2*u),shade(color,.9),1*u); }
  }
  if(o.layer)for(const side of [-1,1]) {
    const end=hem+(o.layer.long ? .42 : .1)*HH,color=o.layer.color;
    cloth([[tcx+side*12*u,chin],[tcx+side*.7*T.a,chin],[tcx+side*T.a,chin+.23*HH],[tcx+side*1.05*T.a,end],[tcx+side*12*u,end],[tcx+side*8*u,chin+.3*HH]],color);
    p.stroke([[tcx+side*18*u,end-21*u],[tcx+side*.85*T.a,end-21*u]],1.2*u,shade(color,.6));
  }
  if(o.backpack)for(const side of [-1,1])p.band([[tcx+side*.68*T.a,chin+.05*HH],[tcx+side*.7*T.a,hem-.08*HH]],o.backpack,4*u,1*u);
  if(o.bottom === "scrubs") {for(const side of [-1,1])p.stroke([[tcx,hem],[tcx+side*9*u,hem+8*u]],1.2*u,WHITE);}
  if(o.acc?.includes("lanyard")) {p.band([[tcx-13*u,chin],[tcx,chin+.55*HH],[tcx+13*u,chin]],"#3b617a",3*u,1*u);cloth(rrect(tcx-8*u,chin+.5*HH,tcx+8*u,chin+.73*HH,2*u),WHITE,1*u);p.ell(tcx,chin+.59*HH,3*u,3*u,"#7895a9",0);}
  // in front of the body: hands holding props
  for (const a of arms) if (a.front) {
    drawArm(a);
    const [hx, hy] = a.pts[2];
    if (prop === "icecream") {
      p.poly([[hx - 8 * u, hy - 12 * u], [hx + 8 * u, hy - 12 * u], [hx, hy + 7 * u]], "#e0a35a", 1.8 * u);
      p.ell(hx, hy - 19 * u, 11 * u, 10 * u, "#f7c6d9", 2.2 * u);
      hand(hx, hy);
    } else if (Array.isArray(prop)) {
      const ang = rad(-70 + 105 * clamp(prop[1], 0, 1));
      const Rh = (pts: P2[]) => rotPts(pts, ang, hx, hy);
      p.band(Rh([[hx, hy + 12 * u], [hx, hy - 44 * u]]), "#8a5a34", 5 * u, 1.5 * u, "round");
      p.poly(Rh([[hx - 12 * u, hy - 58 * u], [hx + 20 * u, hy - 58 * u], [hx + 20 * u, hy - 42 * u], [hx - 12 * u, hy - 42 * u]]), "#7d848c", 2.2 * u);
      hand(hx, hy);
    }
  }
  const heldProps = () => { // Owen-series hand props (right hand = arms[0], screen left in front view)
    const R0 = arms[0]?.pts[2];
    if (prop === "pencil" && R0) {
      const [x, y] = R0;
      p.band([[x - 4 * u, y + 10 * u], [x + 6 * u, y - 26 * u]], "#f2c230", 3.4 * u, 1.3 * u, "round");
      p.poly([[x + 4 * u, y - 25 * u], [x + 8 * u, y - 25 * u], [x + 7 * u, y - 33 * u]], "#e9c9a0", 1.2 * u); hand(x, y);
    }
    if (prop === "mug" && R0) {
      const [x, y] = R0;
      const mugX = x + 15 * u; // handle lands at the hand; the mitten grips it, not the cup face
      p.poly([[mugX - 9 * u, y - 14 * u], [mugX + 9 * u, y - 14 * u], [mugX + 8 * u, y + 8 * u], [mugX - 8 * u, y + 8 * u]], "#2f8f9d", 2 * u); // teal: the old cream mug vanished against the white face and hand (user, ep01)
      p.arc(mugX - 11 * u, y - 3 * u, 5 * u, 6 * u, 90, 270, 2.2 * u); hand(x, y);
    }
    if (prop === "notebook" && R0) {
      const [x, y] = R0;
      p.poly([[x - 14 * u, y - 16 * u], [x + 12 * u, y - 18 * u], [x + 14 * u, y + 14 * u], [x - 12 * u, y + 16 * u]], "#c23b33", 2 * u); hand(x, y);
    }
    if (prop === "paper") {
      const y0 = chin + 0.35 * HH;
      p.poly([[tcx - 24 * u, y0], [tcx + 22 * u, y0 - 3 * u], [tcx + 25 * u, y0 + 40 * u], [tcx - 21 * u, y0 + 43 * u]], "#fbfaf5", 2 * u);
      // the math test Mrs. Patel hands over
      const g = p.g;
      g.save(); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${9 * u}px "Arial Black", Arial, sans-serif`;
      g.fillStyle = "#2b2f3a"; g.fillText("MATH TEST", tcx + 1 * u, y0 + 9 * u); g.restore();
      for (let i = 0; i < 4; i++) p.stroke([[tcx - 15 * u, y0 + (19 + 6 * i) * u], [tcx + 16 * u, y0 + (18 + 6 * i) * u]], 1.3 * u, "#9aa0ac");
    }
    if (prop === "tray") {
      const y0 = torsoBot - 0.12 * HH;
      p.poly([[tcx - 46 * u, y0], [tcx + 46 * u, y0], [tcx + 40 * u, y0 + 12 * u], [tcx - 40 * u, y0 + 12 * u]], "#7aa7c7", 2.2 * u);
      p.ell(tcx - 20 * u, y0 - 6 * u, 13 * u, 7 * u, "#f1e2b8", 1.8 * u); p.ell(tcx + 18 * u, y0 - 8 * u, 9 * u, 9 * u, "#d9423a", 1.8 * u);
      for (const s of [-1, 1]) hand(tcx + s * 44 * u, y0 + 5 * u);
    }
    if (prop === "backpack2") { // OWEN's pack (his orange) worn on the chest, straps over the shoulders: "carrying it for him"
      const y0 = chin + 0.1 * HH, c = "#d9542f";
      for (const s of [-1, 1]) p.band([[tcx + s * 0.62 * T.a, chin + 0.02 * HH], [tcx + s * 26 * u, y0 + 6 * u]], shade(c, 0.8), 4 * u, 1.4 * u);
      p.poly([[tcx - 30 * u, y0], [tcx + 30 * u, y0], [tcx + 33 * u, y0 + 60 * u], [tcx - 33 * u, y0 + 60 * u]], c, 2.6 * u);
      p.poly([[tcx - 30 * u, y0], [tcx + 30 * u, y0], [tcx + 26 * u, y0 + 16 * u], [tcx - 26 * u, y0 + 16 * u]], shade(c, 0.85), 2 * u);
      p.poly([[tcx - 18 * u, y0 + 30 * u], [tcx + 18 * u, y0 + 30 * u], [tcx + 18 * u, y0 + 52 * u], [tcx - 18 * u, y0 + 52 * u]], shade(c, 0.88), 1.8 * u);
    }
    if (prop === "laces") { // white laces looped between the two kneeling hands (the contact point of "tying his shoes")
      const a = arms[0].pts[2], b = arms[1].pts[2], m: P2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      for (const s of [-1, 1]) {
        p.arc(m[0] + s * 10 * u, m[1] - 12 * u, 9 * u, 11 * u, 0, 360, 4.4 * u); p.arc(m[0] + s * 10 * u, m[1] - 12 * u, 9 * u, 11 * u, 0, 360, 2.6 * u, "#f7f5ef");
        p.stroke([[m[0], m[1]], [m[0] + s * 12 * u, m[1] + 16 * u]], 4.4 * u, INK); p.stroke([[m[0], m[1]], [m[0] + s * 12 * u, m[1] + 16 * u]], 2.6 * u, "#f7f5ef");
      }
      hand(a[0], a[1]); hand(b[0], b[1]);
    }
    if (prop === "tproll" && R0) { // a toilet-paper roll on its side, a long sheet looping down then up onto the cast arm
      const [x, y] = R0, L1 = arms[1]?.pts[2] ?? [x + 40 * u, y];
      const sheet = curve([x + 4 * u, y + 8 * u], [(x + L1[0]) / 2, Math.max(y, L1[1]) + 22 * u], L1, 24);
      p.stroke(sheet, 13 * u, INK); p.stroke(sheet, 10 * u, "#fbf8f0");
      for (let i = 3; i < sheet.length - 2; i += 4) p.dot(sheet[i][0], sheet[i][1], 0.9 * u, "#b9b2a2"); // perforations
      p.poly([[x - 16 * u, y - 36 * u], [x + 16 * u, y - 36 * u], [x + 16 * u, y - 6 * u], [x - 16 * u, y - 6 * u]], "#fbf8f0", 2.2 * u);
      p.ell(x + 16 * u, y - 21 * u, 6 * u, 15 * u, "#f2ede1", 2.2 * u); p.ell(x + 16 * u, y - 21 * u, 2.6 * u, 6 * u, "#b48f5c", 1.4 * u);
      hand(x, y);
    }
    if (prop === "peel" && R0) { // one continuous paper strip pulled off the cast: from the cast hand, sagging, into the pulling hand (r4-sol C21)
      const [x, y] = R0, L1 = arms[1]?.pts[2] ?? [x + 40 * u, y];
      const strip = curve(L1, [(x + L1[0]) / 2, Math.max(y, L1[1]) + 30 * u], [x, y], 24);
      p.stroke(strip, 15 * u, INK); p.stroke(strip, 11 * u, "#fbf8f0");
      hand(x, y);
    }
    if (prop === "tape" && R0) { // brown packing tape: a fat roll and a straight strip pulled across to the arm
      const [x, y] = R0, L1 = arms[1]?.pts[2] ?? [x + 40 * u, y];
      const cx = x + 12 * u, cy = y - 14 * u; // roll centre: the hand holds its lower-left rim
      p.stroke([[cx + 14 * u, cy + 6 * u], L1], 12 * u, INK); p.stroke([[cx + 14 * u, cy + 6 * u], L1], 9 * u, "#a8702f");
      p.ell(cx, cy, 19 * u, 19 * u, "#a8702f", 2.4 * u); p.ell(cx, cy, 11 * u, 11 * u, "#d9c49a", 1.6 * u); p.ell(cx, cy, 7 * u, 7 * u, "#5b4a36", 1.2 * u);
      p.arc(cx, cy, 15 * u, 15 * u, 200, 300, 2 * u, "#d6a564");
      hand(x, y);
    }
    if ((prop === "dollar" || prop === "dollar2") && R0) { // green "$1" bill(s) pinched in the right hand, held out
      const [x, y] = R0;
      for (const k of prop === "dollar2" ? [1, 0] : [0]) {
        const dx = -k * 8 * u, dy = -k * 10 * u, cx = x - 20 * u + dx, cy = y - 4 * u + dy;
        p.poly([[cx - 22 * u, cy - 12 * u], [cx + 22 * u, cy - 14 * u], [cx + 23 * u, cy + 10 * u], [cx - 21 * u, cy + 12 * u]], "#9fd08a", 2 * u);
        const g = p.g; g.save(); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${15 * u}px "Arial Black", Arial, sans-serif`;
        g.fillStyle = "#2f6b2a"; g.fillText("$1", cx, cy); g.restore();
      }
      hand(x, y);
    }
    if ((prop === "icebags" || prop === "foodbox") && arms[1]) { // carried in both arms at the chest (ep02)
      const a = arms[0].pts[2], b = arms[1].pts[2], m: P2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (prop === "icebags") for (const s of [-1, 1]) {
        const cx = m[0] + s * 24 * u, cy = m[1] - 16 * u + s * 4 * u;
        p.poly([[cx - 6 * u, cy - 26 * u], [cx + 6 * u, cy - 26 * u], [cx + 20 * u, cy + 20 * u], [cx - 20 * u, cy + 20 * u]], "#e4f4fc", 2.2 * u);
        p.stroke([[cx - 7 * u, cy - 30 * u], [cx, cy - 25 * u], [cx + 7 * u, cy - 30 * u]], 2.2 * u); // knotted top
        foodIcon(p, "cube", cx, cy + 4 * u, 11 * u); // pictures, not words (user)
      } else {
        p.poly([[m[0] - 30 * u, m[1] - 34 * u], [m[0] + 30 * u, m[1] - 34 * u], [m[0] + 30 * u, m[1] + 8 * u], [m[0] - 30 * u, m[1] + 8 * u]], "#4f7fc4", 2.4 * u);
        p.poly([[m[0] - 22 * u, m[1] - 26 * u], [m[0] + 22 * u, m[1] - 26 * u], [m[0] + 22 * u, m[1] - 6 * u], [m[0] - 22 * u, m[1] - 6 * u]], "#f4e3c1", 1.4 * u);
        foodIcon(p, "cone", m[0], m[1] - 16 * u, 8 * u); // an ice-cream carton (picture, not words)
      }
      hand(a[0], a[1]); hand(b[0], b[1]);
    }
    if (prop === "pitcher" && R0) { // lemonade pitcher, tipped to pour
      const [x, y] = R0;
      p.poly([[x + 2 * u, y - 30 * u], [x + 30 * u, y - 30 * u], [x + 28 * u, y + 10 * u], [x + 4 * u, y + 10 * u]], "#f4e46a", 2.2 * u);
      p.poly([[x + 5 * u, y - 18 * u], [x + 27 * u, y - 18 * u], [x + 26 * u, y + 7 * u], [x + 6 * u, y + 7 * u]], "#f2d43a", 0);
      p.poly([[x + 30 * u, y - 30 * u], [x + 38 * u, y - 34 * u], [x + 30 * u, y - 24 * u]], "#f4e46a", 1.6 * u);
      p.arc(x + 2 * u, y - 12 * u, 7 * u, 10 * u, 90, 270, 2.4 * u); hand(x, y);
    }
    if ((prop === "cash" || prop === "cash3") && R0) { // a fanned stack of bills (cash) / exactly three $1 bills (cash3)
      const [x, y] = R0, n = prop === "cash" ? 6 : 3;
      for (let k = n - 1; k >= 0; k--) {
        const a = rad(prop === "cash" ? -30 + k * 12 : -55 + k * 38), cx = x, cy = y - 6 * u;
        const pts: P2[] = [[-4, -10], [42, -10], [42, 10], [-4, 10]].map(([px, py]) => [cx + (px * Math.cos(a) - py * Math.sin(a)) * u, cy + (px * Math.sin(a) + py * Math.cos(a)) * u]);
        p.poly(pts, "#9fd08a", 1.8 * u);
        if (k === 0 || prop === "cash3") { const g = p.g; g.save(); g.translate((pts[0][0] + pts[2][0]) / 2, (pts[0][1] + pts[2][1]) / 2); g.rotate(a); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${11 * u}px "Arial Black", Arial, sans-serif`; g.fillStyle = "#2f6b2a"; g.fillText("$1", 0, 0); g.restore(); }
      }
      hand(x, y);
    }
    if (prop === "clipboard" && R0) {
      const [x, y] = R0;
      p.poly([[x - 4 * u, y - 44 * u], [x + 30 * u, y - 46 * u], [x + 32 * u, y + 2 * u], [x - 2 * u, y + 4 * u]], "#9a6a3c", 2 * u);
      p.poly([[x + 1 * u, y - 38 * u], [x + 27 * u, y - 39 * u], [x + 28 * u, y - 2 * u], [x + 2 * u, y - 1 * u]], "#fbfaf5", 1.2 * u);
      for (let i = 0; i < 4; i++) p.stroke([[x + 5 * u, y - (32 - 7 * i) * u], [x + 23 * u, y - (33 - 7 * i) * u]], 1.1 * u, "#9aa0ac");
      hand(x, y);
    }
    if (prop === "bones" && R0) { // closed book, a white bone on the cover
      const [x, y] = R0;
      p.poly([[x - 18 * u, y - 26 * u], [x + 16 * u, y - 28 * u], [x + 18 * u, y + 14 * u], [x - 16 * u, y + 16 * u]], "#3f6fb5", 2 * u);
      p.stroke([[x - 9 * u, y - 14 * u], [x + 9 * u, y - 2 * u]], 4 * u, "#f7f3ea");
      for (const [bx, by] of [[x - 9 * u, y - 14 * u], [x + 9 * u, y - 2 * u]]) { p.dot(bx - 2 * u, by, 3.2 * u, "#f7f3ea"); p.dot(bx + 2 * u, by + 2 * u, 3.2 * u, "#f7f3ea"); }
      hand(x, y);
    }
    if (prop === "phone" && R0) {
      const [x, y] = R0;
      p.poly([[x - 9 * u, y - 30 * u], [x + 9 * u, y - 30 * u], [x + 9 * u, y + 2 * u], [x - 9 * u, y + 2 * u]], "#2b2f3a", 2 * u);
      p.poly([[x - 6.5 * u, y - 27 * u], [x + 6.5 * u, y - 27 * u], [x + 6.5 * u, y - 1 * u], [x - 6.5 * u, y - 1 * u]], "#9fd3f0", 0);
      hand(x, y);
    }
    if (prop === "book") { // open book held at the chest, nose in it
      const [x, y] = book;
      for (const s of [-1, 1]) {
        p.poly([[x, y - 2 * u], [x + s * 27 * u, y - 6 * u], [x + s * 27 * u, y + 22 * u], [x, y + 25 * u]], "#3f6fb5", 2 * u);
        p.poly([[x, y - 0.5 * u], [x + s * 23 * u, y - 3.5 * u], [x + s * 23 * u, y + 19 * u], [x, y + 22 * u]], "#f7f3e6", 1.2 * u);
        for (let i = 0; i < 3; i++) p.stroke([[x + s * 5 * u, y + (5 + 5 * i) * u], [x + s * 18 * u, y + (4 + 5 * i) * u]], 1.1 * u, "#9aa0ac");
      }
      for (const a of arms) hand(a.pts[2][0], a.pts[2][1]);
    }
  };
  heldProps();
  if (prop === "shako") { // carried by the left hand
    const [hx, hy] = arms[0].pts[2];
    p.poly([[hx - 14 * u, hy + 3 * u], [hx + 14 * u, hy + 3 * u], [hx + 16 * u, hy + 30 * u], [hx - 16 * u, hy + 30 * u]], "#3a3d47", 2.2 * u);
    p.ell(hx, hy + 31 * u, 3.5 * u, 3.5 * u, "#2b7a4b", 1.5 * u);
    hand(hx, hy);
  }
  // stick neck: from the neckline up only. It started 0.08 HH inside the torso and, drawn last, ran over the hoodie and
  // the toilet roll held at the chest (user, 2026-11-03)
  tube([[300, chin - 0.01 * HH], [300, hc + 0.6 * H.b]], .7 * LIMB * u, INK);
  p.arc(300, chin + 0.02 * HH, 9 * u, 4 * u, 10, 170, 1.6 * u); // tee collar
  // ---- head: rotates with the body, plus its own tilt about the chin ----
  const Ah = A + headTilt, [cpx, cpy] = rotAbout([300, chin], rad(A), [300, hipY]);
  p.rot = Ah ? [rad(Ah), 300, chin, cpx - 300, cpy - chin] : null;
  hatBehind(p, o, H, 300, hc, light, thick, ow, false);
  const hp = blobPts(300, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  hatOn(p, o, hp, H, 300, hc, light, seed, facing, false);
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
  faceFront(p, 300, hc, W, expr, facing, look, lid, brim, skin, o.moustache, o.build === "stout", o.glasses, { et: exprT, from: exprFrom }, lookY);
  if(o.acc?.includes("headband"))p.band([[300-H.a*.9,hc-H.b*.47],[300+H.a*.9,hc-H.b*.47]],o.jacket,7*u,1*u);
  if(o.acc?.includes("cap")) {cloth([[300-H.a,hc-H.b*.55],[300-H.a*.8,hc-H.b*.95],[300+H.a*.7,hc-H.b*.95],[300+H.a,hc-H.b*.55]],"#365c74",2*u);cloth([[300-H.a,hc-H.b*.6],[300-H.a*1.35,hc-H.b*.45],[300-H.a*.8,hc-H.b*.45]],"#365c74",2*u);}
  // pen pushed INTO the hair: it crosses the head outline (it floated off the head before; rig gate fb0095)
  if(o.acc?.includes("pen_in_hair"))p.band([[300+H.a*.4,crown-.08*HH],[300+H.a*.8,crown+.22*HH]],"#a9d4e2",3*u,1*u);
  // Head-contact gestures must occlude the face. Restore BODY space before drawing the owned arm.
  p.rot = A ? [rad(A), 300, hipY] : null;
  for (const a of arms) if (a.front && a.pts[2][1] < chin - .08 * HH) drawArm(a);
  // the prop goes with its hand: a sip drew the arm over the face but left the mug under the head (user, ep01 shot 5)
  if (arms[0]?.front && arms[0].pts[2][1] < chin - .08 * HH) heldProps();
  p.rot = null;
  (p.g.canvas as HTMLCanvasElement & { rig?: Rig }).rig = { arms: arms.length, legs, hands: distinctHands(handsAt, 12 * u) };
};

export type SideOpts = {
  phase?: number; expr?: Expr; mode?: "march" | "stand" | "swing" | "push"; blink?: boolean | number; stomp?: number; pose?: number;
  /** step length as a multiple of 0.8 m (370 units): matches 1.6 m/s at 2 steps/s; scale by the view's foreshortening */
  stride?: number; light?: number; seed?: number;
  /** push mode: where the hands land at pose 1, in final canvas units (e.g. the swing kid's back) */
  hand?: [number, number];
};

/** two-bone leg, knee bending forward (+x) */
const ik = (hip: P2, ank: P2, l1: number, l2: number): P2 => {
  const dx = ank[0] - hip[0], dy = ank[1] - hip[1], d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.01);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = Math.atan2(dy, dx) - A;
  return [hip[0] + l1 * Math.cos(k), hip[1] + l1 * Math.sin(k)];
};

/** hip height of the seated kid in `swing` mode (design units); swingKid seats the torso bottom on the plank */
const SWING_HIP = 733;

/** side view facing screen-right; march footfalls land at phase 0 (near foot) and 0.5 (far foot), like the front view.
 *  The stance foot is planted: it slides back at exactly the walking speed while the hip rises and falls over it. */
export const bodySide = (p: Pen, o: Outfit, opts: SideOpts) => {
  const { phase = 0, expr = "neutral", mode = "march", blink = false, stomp = 1, pose = 0, stride = 1, light = DEF_LIGHT, seed = 1 } = opts;
  const Bd = BUILD[o.build ?? "adult"], skin = o.skin ?? SKIN, two = Math.PI * 2, lid = lidOf(blink);
  const H: Blob = { ...headBlob(seed, Bd.a, 1), asym: 0.12, rot: rad(3 + 3 * (rnd(seed, 7) - 0.5)) };
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, sole = 975, ankY = sole - 4 * u;
  const thick = thickAngle(light), ow = 5 * u;
  const legLen = (Bd.legs + 0.12) * HH - 4 * u, l1 = legLen / 2, l2 = legLen / 2;
  const nearCol = mix(o.pants, INK, 0.55), farCol = mix(o.pants, INK, 0.75), footCol = o.swimwear ? INK : o.boots;
  type LegS = { ank: P2; pitch: number; near: boolean };
  const legs: LegS[] = [];
  let hipY = ankY - legLen * 0.995, lean = 0, nearFwd = 0;
  if (mode === "march") {
    const S = 370 * stride, liftH = Math.max(22, 40 + 70 * (stomp - 1));
    const st = (ph: number) => {
      const c = (((phase + ph) % 1) + 1) % 1;
      if (c < 0.5) { const s = c / 0.5; return { x: S / 2 - S * s, h: 0, stance: true, s }; }
      const s = (c - 0.5) / 0.5; // swing: cycloid in world space, so the foot leaves and lands at zero ground speed
      return { x: -S / 2 + S * s - (S / Math.PI) * Math.sin(2 * Math.PI * s), h: liftH * Math.sin(Math.PI * s), stance: false, s };
    };
    const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL;
    const Leff = legLen * (1 - 0.035 * Math.sin(Math.PI * stance.s));
    hipY = ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x));
    for (const [L, near] of [[fL, false], [nL, true]] as const)
      legs.push({ ank: [300 + L.x, ankY - L.h], pitch: L.stance ? 0 : rad(35 * Math.sin(Math.PI * L.s) * (1 - 1.6 * L.s)), near });
    lean = 4 + 3 * Math.cos(2 * two * phase); // 7 deg at contact, 1 deg at passing
    nearFwd = nL.x / (S / 2);
  } else if (mode === "push") {
    hipY = ankY - 0.87 * legLen;
    legs.push({ ank: [300 - 0.5 * legLen, ankY], pitch: rad(-8), near: false }, { ank: [300 + 0.32 * legLen, ankY], pitch: 0, near: true });
    lean = 14 * pose;
  } else if (mode === "swing") {
    hipY = SWING_HIP;
    const a = rad(60 * pose);
    for (const [dx, near] of [[-6, false], [0, true]] as const) {
      const knee: P2 = [300 + l1 * 0.98 + dx * u, hipY + 6 * u];
      legs.push({ ank: [knee[0] + l2 * Math.sin(a), knee[1] + l2 * Math.cos(a)], pitch: -a * 0.5, near });
    }
  } else {
    legs.push({ ank: [300 - 4 * u, ankY], pitch: 0, near: false }, { ank: [300 + 4 * u, ankY], pitch: 0, near: true });
  }
  const torsoBot = hipY + 0.12 * HH, chin = torsoBot - Bd.torso * HH, hc = chin - H.b, crown = hc - H.b, hip: P2 = [300, hipY];
  p.rot = null;
  for (const L of legs) {
    const knee = mode === "swing" ? ([300 + l1 * 0.98 + (L.near ? 0 : -6 * u), hipY + 6 * u] as P2) : ik(hip, L.ank, l1, l2);
    const hp0: P2 = [300 + (L.near ? 0 : -5 * u), hipY];
    p.stroke([hp0, knee, L.ank], 5.8 * u, L.near ? nearCol : farCol);
    const c = Math.cos(L.pitch), s = Math.sin(L.pitch);
    footStroke(p, [L.ank[0] - 3 * u * c, L.ank[1] - 3 * u * s], [L.ank[0] + 13 * u * c, L.ank[1] + 13 * u * s + 0.5 * u],
      7.5 * u, L.near ? footCol : footCol === INK ? INK : shade(footCol, 0.82));
  }
  // ---- upper body leans about the hip ----
  p.rot = lean ? [rad(lean), 300, hipY] : null;
  const T: Blob = { a: (o.build === "stout" ? 0.36 : 0.31) * W, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.5, egg: 0.1, asym: 0.06,
    rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 2 * u, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const armCol = mix(o.jacket, INK, 0.5), farArm = mix(o.jacket, INK, 0.68);
  const S: P2 = [tcx + 0.05 * T.a, chin + 0.14 * HH], aLen = 0.95 * HH;
  const swingArm = (ang: number): [P2, P2, P2] => {
    const e: P2 = [S[0] + Math.sin(ang) * aLen * 0.5, S[1] + Math.cos(ang) * aLen * 0.5], a2 = ang + rad(16) * Math.sign(ang || 1);
    return [S, e, [e[0] + Math.sin(a2) * aLen * 0.5, e[1] + Math.cos(a2) * aLen * 0.5]];
  };
  const rifle = !!o.rifle && (mode === "march" || mode === "stand");
  const B0: P2 = [tcx + 0.72 * T.a, chin + 0.58 * HH], B1: P2 = [tcx - 0.95 * T.a - 22 * u, crown - 0.4 * HH];
  let near: [P2, P2, P2], far: [P2, P2, P2] | null;
  if (mode === "swing") { near = [S, [S[0] + 12 * u, S[1] - 0.16 * HH], [300 + 6 * u, chin - 0.3 * HH]]; far = [S, [S[0] + 8 * u, S[1] - 0.18 * HH], [300 + 2 * u, chin - 0.36 * HH]]; }
  else if (mode === "push") {
    const reach = 0.55 * HH + 0.45 * HH * pose;
    let hN: P2 = [S[0] + reach, S[1] + 0.06 * HH];
    if (opts.hand) {
      // target is in final canvas units; the arm is drawn inside the lean rotation, so undo it
      const th = -rad(lean), dx = opts.hand[0] - 300, dy = opts.hand[1] - hipY;
      const tg: P2 = [300 + dx * Math.cos(th) - dy * Math.sin(th), hipY + dx * Math.sin(th) + dy * Math.cos(th)];
      hN = [hN[0] + (tg[0] - hN[0]) * pose, hN[1] + (tg[1] - hN[1]) * pose];
    }
    near = [S, [(S[0] + hN[0]) / 2, (S[1] + hN[1]) / 2 + 0.06 * HH], hN];
    far = [S, [(S[0] + hN[0]) / 2 - 4 * u, (S[1] + hN[1]) / 2 - 0.02 * HH], [hN[0] - 6 * u, hN[1] - 0.08 * HH]];
  } else if (rifle) { near = [S, [S[0] - 4 * u, S[1] + 0.42 * HH], B0]; far = mode === "march" ? swingArm(rad(30) * nearFwd) : swingArm(0); }
  else { near = swingArm(rad(-30) * nearFwd); far = mode === "march" ? swingArm(rad(30) * nearFwd) : null; }
  if (far) { p.stroke(curve(far[0], far[1], far[2]), 5.2 * u, farArm); p.dot(far[2][0], far[2][1], 5.5 * u); }
  p.gradFill(tp, o.jacket, mul(o.jacket, SH_CLOTH), light);
  p.clip(tp, () => {
    if (o.belt) p.band([[tcx - 0.65 * T.a, chin - 0.05 * HH], [tcx + 0.75 * T.a, torsoBot - 0.1 * HH]], o.belt!, 5.5 * u, 1.8 * u);
    if (o.sash) p.band([[tcx - 1.3 * T.a, torsoBot - 0.32 * HH], [tcx + 1.3 * T.a, torsoBot - 0.32 * HH]], o.sash, 0.13 * HH, 1.8 * u);
    if (!o.dress) for (let i = 0; i < 3; i++) { const y = chin + 0.16 * HH + i * 0.24 * HH; p.dot(tcx + 0.8 * T.a, y, 3 * u, INK); p.dot(tcx + 0.8 * T.a, y, 2.2 * u, o.buttons ?? shade(o.jacket, 0.7)); }
  });
  p.inkRing(tp, ow, thick);
  if (rifle) {
    p.band([B0, B1], "#7a4b2a", 5 * u, 1.5 * u, "round");
    p.band([lerp2(B0, B1, 0.6), B1], "#8d949c", 2.4 * u, 1.2 * u, "round");
  }
  p.stroke(curve(near[0], near[1], near[2]), 5.2 * u, armCol); p.dot(near[2][0], near[2][1], 5.5 * u);
  // ---- head ----
  const hx = 300 + 4 * u;
  hatBehind(p, o, H, hx, hc, light, thick, ow, true);
  const hp = blobPts(hx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  hatOn(p, o, hp, H, hx, hc, light, seed, 1, true);
  const brim = !!o.hat && o.hat !== "hair" && o.hat !== "bonnet" && o.hat !== "cap";
  faceSide(p, hx, hc, W, expr, lid, brim, skin, o.moustache, o.build === "stout");
  p.rot = null;
};

/** rope + seat + seated kid on a 700 x 2300 canvas; the pivot is design (350, 20); kid drawn at 0.92 scale */
export const swingKid = (p: Pen, o: Outfit, kick: number, expr: Expr, light = DEF_LIGHT, blink: number = 0) => {
  const rope = 1830, k = 1.1, HH = 2 * headBlob(5, BUILD[o.build ?? "adult"].a, 1).b;
  // two ropes from the pivot to the ends of a wide plank, the kid framed between them: a single rope behind the kid
  // ended at the cap and read as a hanging. Far rope behind the kid, near rope drawn over (clear of the face).
  const seat = rope + 18, x0 = 150, x1 = 550;
  p.line([[350, 20], [x0 + 16, seat + 4]], "#a07a4c", 10);
  p.poly(rrect(x0, seat, x1, seat + 36, 10), "#b5653f", 9);
  const g = p.g;
  g.save();
  g.translate(350 - 300 * k, rope + 18 - (SWING_HIP + 0.12 * HH) * k);
  g.scale(k, k);
  bodySide(new Pen(g), o, { expr, mode: "swing", pose: kick, light, seed: 5, blink });
  g.restore();
  p.line([[350, 20], [x1 - 16, seat + 4]], "#a07a4c", 10);
};

// ---------------- effects ----------------

/** small food / ice pictograms for labels (user: pictures, not words): centre (cx, cy), size s (half-width) */
export const foodIcon = (p: Pen, kind: "cone" | "pizza" | "peas" | "pop" | "fries" | "waffle" | "cube", cx: number, cy: number, s: number) => {
  const w = Math.max(1.5, s * 0.12);
  if (kind === "cone") { p.poly([[cx - s * 0.5, cy - s * 0.1], [cx + s * 0.5, cy - s * 0.1], [cx, cy + s]], "#e0a35a", w); p.ell(cx, cy - s * 0.35, s * 0.55, s * 0.5, "#f7a6c4", w); p.ell(cx - s * 0.15, cy - s * 0.5, s * 0.15, s * 0.12, "#fde3ee", 0); }
  else if (kind === "pizza") { p.poly([[cx - s * 0.8, cy - s * 0.7], [cx + s * 0.8, cy - s * 0.7], [cx, cy + s * 0.9]], "#f6c94a", w); p.poly([[cx - s * 0.85, cy - s * 0.85], [cx + s * 0.85, cy - s * 0.85], [cx + s * 0.8, cy - s * 0.6], [cx - s * 0.8, cy - s * 0.6]], "#c98a4a", w); for (const [dx, dy] of [[-0.3, -0.35], [0.3, -0.3], [0, 0.15]]) p.ell(cx + dx * s, cy + dy * s, s * 0.17, s * 0.17, "#d9342b", 0); }
  else if (kind === "peas") { p.ell(cx, cy, s * 0.95, s * 0.45, "#5aa86a", w); for (let i = -1; i <= 1; i++) p.ell(cx + i * s * 0.5, cy, s * 0.24, s * 0.24, "#9ad06f", w * 0.6); }
  else if (kind === "pop") { p.stroke([[cx, cy + s * 0.3], [cx, cy + s]], s * 0.2, "#c98a4a"); p.poly([[cx - s * 0.45, cy - s * 0.9], [cx + s * 0.45, cy - s * 0.9], [cx + s * 0.45, cy + s * 0.35], [cx - s * 0.45, cy + s * 0.35]], "#e0738f", w); }
  else if (kind === "fries") { for (let i = -2; i <= 2; i++) p.poly([[cx + i * s * 0.18 - s * 0.07, cy - s * 0.9 + Math.abs(i) * s * 0.1], [cx + i * s * 0.18 + s * 0.07, cy - s * 0.9 + Math.abs(i) * s * 0.1], [cx + i * s * 0.18 + s * 0.07, cy], [cx + i * s * 0.18 - s * 0.07, cy]], "#f6c94a", w * 0.6); p.poly([[cx - s * 0.6, cy - s * 0.2], [cx + s * 0.6, cy - s * 0.2], [cx + s * 0.45, cy + s], [cx - s * 0.45, cy + s]], "#d9342b", w); }
  else if (kind === "waffle") { p.poly([[cx - s * 0.8, cy - s * 0.8], [cx + s * 0.8, cy - s * 0.8], [cx + s * 0.8, cy + s * 0.8], [cx - s * 0.8, cy + s * 0.8]], "#d9a35a", w); for (const k of [-0.27, 0.27]) { p.stroke([[cx + k * s, cy - s * 0.8], [cx + k * s, cy + s * 0.8]], w * 0.8, "#a8702f"); p.stroke([[cx - s * 0.8, cy + k * s], [cx + s * 0.8, cy + k * s]], w * 0.8, "#a8702f"); } }
  else { p.poly([[cx - s * 0.75, cy - s * 0.75], [cx + s * 0.75, cy - s * 0.75], [cx + s * 0.75, cy + s * 0.75], [cx - s * 0.75, cy + s * 0.75]], "#bfe6fb", w); p.poly([[cx - s * 0.5, cy - s * 0.55], [cx - s * 0.1, cy - s * 0.55], [cx - s * 0.5, cy - s * 0.15]], "#ffffff", 0); }
};
export const fxNote = (p: Pen, kind: number, col = "#1f2a44") => {
  p.ell(70, 200, 46, 34, col, 8, 0, 360, -20);
  p.stroke([[110, 190], [110, 40]], 14);
  if (kind === 0) p.poly([[110, 40], [170, 70], [170, 110], [110, 82]], col, 8);
  else {
    p.ell(150, 170, 40, 30, col, 8, 0, 360, -20);
    p.stroke([[186, 160], [186, 20]], 14);
    p.poly([[110, 40], [186, 20], [186, 50], [110, 70]], col, 8);
  }
};

/** spark / impact star on a 500 x 500 canvas; t in 0..1 */
export const fxBurst = (p: Pen, t: number, col = "#fff3b0", rays = 10, r0 = 40, r1 = 230) => {
  const c = 250, e = 1 - (1 - t) ** 3;
  for (let i = 0; i < rays; i++) {
    const a = rad((i * 360) / rays + 7 * (i % 2)), ra = r0 + (r1 - r0) * e * (0.75 + 0.25 * (i % 2));
    p.poly([[c + r0 * 0.5 * Math.cos(a + 0.18), c + r0 * 0.5 * Math.sin(a + 0.18)], [c + ra * Math.cos(a), c + ra * Math.sin(a)],
      [c + r0 * 0.5 * Math.cos(a - 0.18), c + r0 * 0.5 * Math.sin(a - 0.18)]], col, Math.max(3, 8 * (1 - t)));
  }
  if (t < 0.5) p.ell(c, c, r0 * (1.4 - t), r0 * (1.4 - t), WHITE, 8);
};

/** water splash crown on an 800 x 800 canvas; t in 0..1 */
export const fxSplash = (p: Pen, t: number) => {
  const c = 400, size = 800, rise = Math.sin(Math.min(1, t * 1.3) * Math.PI);
  const blue = "#bfe8ff", deep = "#6cc0f0";
  if (rise > 0.02) {
    const pts: P2[] = [];
    for (let i = 0; i < 19; i++) {
      const h = (i % 2 ? 260 : 130) * rise * (0.7 + 0.3 * Math.sin(i * 1.7));
      pts.push([c - 330 + (660 * i) / 18, size - 120 - h]);
    }
    p.poly([...pts, [c + 330, size - 90], [c - 330, size - 90]], blue, 10);
    p.ell(c, size - 100, 360, 46, deep, 10);
  }
  for (let i = 0; i < 8; i++) {
    const a = rad(200 + i * 18), d = 120 + 380 * t, y = size - 160 + d * Math.sin(a) + 520 * t * t, r = 26 * (1 - t) + 6;
    if (t > 0.08 && y < size - 40) p.ell(c + d * Math.cos(a), y, r, r * 1.25, blue, 7);
  }
};

/** dust puff on a 300 x 300 canvas; t in 0..1 */
export const fxPuff = (p: Pen, t: number) => {
  for (let i = 0; i < 5; i++) {
    const a = rad(160 + i * 55), d = 40 + 70 * t, r = (34 + 20 * (i % 2)) * (1 - 0.6 * t);
    p.ell(150 + d * Math.cos(a), 180 + d * 0.45 * Math.sin(a), r, r * 0.8, `rgba(238,225,205,${(1 - t).toFixed(3)})`, 0);
  }
};

/** circling stars on a 420 x 210 canvas */
export const fxStars = (p: Pen, t: number) => {
  for (let i = 0; i < 4; i++) {
    const a = t * Math.PI * 2 + (i * Math.PI) / 2, x = 210 + 150 * Math.cos(a), y = 110 + 40 * Math.sin(a), pts: P2[] = [];
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 14 : 34, b = rad(k * 36 - 90); pts.push([x + r * Math.cos(b), y + r * Math.sin(b)]); }
    p.poly(pts, "#ffd84a", 6);
  }
};

/** three jittering strain ticks on a 300 x 300 canvas */
export const fxCreak = (p: Pen, t: number) => {
  const j = 6 * Math.sin(t * 40);
  for (const a of [-30, 0, 30]) {
    const b = rad(a - 90);
    p.stroke([[150 + 70 * Math.cos(b) + j, 230 + 70 * Math.sin(b)], [150 + 100 * Math.cos(b) + 10 + j, 230 + 100 * Math.sin(b)],
      [150 + 130 * Math.cos(b) + j, 230 + 130 * Math.sin(b)]], 10);
  }
};

/** flat water ring (drawn top-down) on a 600 x 600 canvas; t in 0..1 */
export const fxRing = (p: Pen, t: number) => {
  // thin light water rings (white crest, pale blue trailing rings), thinning as they spread
  const g = p.g;
  for (let k = 0; k < 3; k++) {
    const u = t - k * 0.22;
    if (u <= 0 || u >= 1) continue;
    g.beginPath(); g.ellipse(300, 300, 60 + 230 * u, 60 + 230 * u, 0, 0, Math.PI * 2);
    g.strokeStyle = k === 0 ? "#f6fcff" : "#cfe8fa"; g.lineWidth = 9 * (1 - u) + 3; g.stroke();
  }
};

/** text-free sign on a 700 x 520 canvas: "no marching in step on the bridge". A bridge (deck + arch + piers), four
 *  identical pairs of marching legs in the same stride (in step), a bold red X over all of it. */
export const fxSign = (p: Pen) => {
  const g = p.g, RED = "#d42f2f";
  p.poly(rrect(14, 14, 686, 506, 40), "#f6ecd2", 0);
  p.poly(rrect(14, 14, 686, 506, 40), null, 14);
  // bridge: deck, stone arch underneath, two piers
  p.poly(rrect(70, 352, 630, 384, 8), "#8a5a3a", 9);
  g.beginPath(); g.moveTo(112, 470); g.quadraticCurveTo(350, 300, 588, 470);
  g.strokeStyle = INK; g.lineWidth = 16; g.lineCap = "round"; g.stroke();
  for (const x of [88, 612]) p.poly(rrect(x - 16, 384, x + 16, 470, 4), "#8a5a3a", 9);
  // four identical soldiers' legs mid-stride: same leg forward on every one = in step
  for (const x of [150, 278, 406, 534]) {
    p.poly(rrect(x - 30, 150, x + 30, 214, 14), "#357650", 9);                  // coat hem
    p.stroke([[x - 8, 210], [x + 34, 262], [x + 46, 338]], 15, INK);           // front leg
    p.stroke([[x + 6, 210], [x - 12, 274], [x - 36, 336]], 15, INK);           // back leg
    p.poly(rrect(x + 30, 330, x + 74, 350, 9), INK, 0);                          // boots point forward
    p.poly(rrect(x - 52, 328, x - 8, 348, 9), INK, 0);
  }
  // big red X
  for (const [a, b] of [[[96, 70], [604, 452]], [[604, 70], [96, 452]]] as [[number, number], [number, number]][]) {
    p.stroke([a, b], 58, "#ffffff");
    p.stroke([a, b], 42, RED);
  }
};

/** soft cartoon cloud on a 600 x 300 canvas */
export const fxCloud = (p: Pen, seed: number) => {
  const blobs: [number, number, number][] = [[150, 190, 80], [250, 150, 105], [360, 160, 95], [450, 195, 70], [300, 210, 90]];
  for (const [x, y, r] of blobs) p.ell(x + ((seed * 37) % 20) - 10, y, r, r * 0.8, "#ffffff", 0);
  p.ell(300, 235, 230, 40, "#ffffff", 0);
};

/** cast shadow on a 128 x 256 canvas: dark soft contact pool at the feet (y 205) and a softer tail that runs up the
 *  canvas = away from the sun, fading with distance; multiply colour (sRGB-encoded linear ratio), white = no change */
export const fxShadow = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 256);
  g.save(); g.filter = "blur(9px)";
  const lg = g.createLinearGradient(0, 205, 0, 22);
  lg.addColorStop(0, mix(col, WHITE, 0.08)); lg.addColorStop(0.55, mix(col, WHITE, 0.3)); lg.addColorStop(1, mix(col, WHITE, 0.85));
  g.fillStyle = lg;
  g.beginPath(); g.moveTo(40, 205); g.bezierCurveTo(36, 120, 46, 50, 64, 30); g.bezierCurveTo(82, 50, 92, 120, 88, 205); g.closePath(); g.fill();
  g.fillStyle = col; g.beginPath(); g.ellipse(64, 205, 30, 17, 0, 0, Math.PI * 2); g.fill();
  g.restore();
};

/** tight contact shadow right under the feet on a 128 x 128 canvas: dark core, short fall-off (multiply colour) */
export const fxContact = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.32, 0.02], [0.5, 0.22], [0.66, 0.58], [0.82, 0.88], [1, 1]] as const) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};

/** floating wooden plank, side-on, on a 320 x 110 canvas */
export const fxPlank = (p: Pen) => {
  p.poly(rrect(14, 30, 306, 78, 10), "#a8744a", 9);
  p.line([[40, 46], [150, 44], [270, 50]], "#7d5234", 4);
  p.line([[60, 62], [200, 64], [284, 60]], "#7d5234", 4);
  p.dot(36, 54, 5, INK); p.dot(284, 54, 5, INK);
};

/** floating marching drum (no text) on a 260 x 240 canvas: white shell, red hoops, ink zig-zag cord */
export const fxDrum = (p: Pen) => {
  p.poly(rrect(40, 70, 220, 190, 16), "#f1ece0", 9);
  p.poly(rrect(32, 58, 228, 86, 12), "#c9373a", 8);
  p.poly(rrect(32, 176, 228, 204, 12), "#c9373a", 8);
  p.line([[52, 88], [82, 172], [112, 88], [142, 172], [172, 88], [202, 172]], INK, 6);
  p.ell(130, 58, 98, 18, "#f7f3ea", 8);
};

/** soft ground contact blob on a 128 x 128 canvas, multiply colour (sRGB-encoded linear ratio) in the centre */
export const fxBlob = (p: Pen, col: string) => {
  const g = p.g;
  g.fillStyle = WHITE; g.fillRect(0, 0, 128, 128);
  // soft contact shadow: flat core, then a long smooth (roughly gaussian) fall-off to white = no change
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [r, k] of [[0, 0], [0.5, 0.04], [0.64, 0.18], [0.76, 0.42], [0.87, 0.72], [0.95, 0.92], [1, 1]] as const) gr.addColorStop(r, mix(col, WHITE, k));
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
};

/** White jagged exclamation pop, 200 x 260. t=0..1; overshoots at .18, settles at .3. */
export const fxExclaim = (p: Pen, t: number): void => {
  const u = clamp(t, 0, 1), scale = u < .18 ? 1.25 * (1 - (1-u/.18)**3) : u < .3 ? 1 + .25*(1-(u-.18)/.12)**2 : 1;
  const g=p.g; g.save(); g.translate(100,130); g.scale(scale,scale); g.translate(-100,-130);
  p.poly([[100,35],[119,52],[143,40],[148,67],[172,74],[159,98],[174,119],[153,139],[161,164],[136,168],[125,196],[104,182],[77,211],[70,180],[43,184],[47,157],[25,141],[43,120],[27,96],[50,84],[47,57],[77,61]],WHITE,7);
  p.poly([[87,77],[115,77],[110,135],[93,135]],INK,0); p.dot(102,157,10);
  g.restore();
};

/** Seven flickering radial surprise strokes, 400 x 400; central point (200,200). */
export const fxShock = (p: Pen, t: number): void => {
  const u=clamp(t,0,1), g=p.g; g.save();
  for(let i=0;i<7;i++) {
    const a=rad(-110+i*360/7), flicker=(Math.floor(u*18)+i)%3;
    const inner=105+flicker*7, outer=160+flicker*7;
    g.globalAlpha = flicker===0 ? .55 : 1;
    p.stroke([[200+inner*Math.cos(a),200+inner*Math.sin(a)],[200+outer*Math.cos(a),200+outer*Math.sin(a)]],8);
  }
  g.restore();
};

/** Six left-trailing speed lines, 500 x 300. Mirror the canvas horizontally for opposite travel. */
export const fxSpeed = (p: Pen, t: number): void => {
  const u=clamp(t,0,1),g=p.g;g.save();
  for(let i=0;i<6;i++) {
    const y=42+i*42, head=460-(i%3)*23, tail=30+(i%3)*49+12*Math.sin(u*Math.PI*2+i);
    // Transform the gradient endpoints through Pen, matching its optional rotation/translation.
    const a=p.P(tail,y),b=p.P(head,y),gr=g.createLinearGradient(...a,...b);
    gr.addColorStop(0,"rgba(9,9,9,0)");gr.addColorStop(.6,INK);gr.addColorStop(1,INK);
    p.path([[tail,y],[head+8*Math.sin(u*Math.PI*2+i),y]],false);
    g.strokeStyle=gr;g.lineWidth=i%2 ? 6 : 9;g.lineCap="round";g.stroke();
  }
  g.restore();
};

/** Three sweat drops travelling outward in a fan, 300 x 300; origin (65,240). */
export const fxSweatBurst = (p: Pen, t: number): void => {
  const u=clamp(t,0,1),g=p.g; g.save();
  for(let i=0;i<3;i++) {
    const a=rad(-85+i*30),d=35+145*u,x=65+d*Math.cos(a),y=240+d*Math.sin(a)+25*u*u;
    const dx=Math.cos(a),dy=Math.sin(a),nx=-dy,ny=dx;
    // Point faces the source; the round heavy end leads the motion.
    const point:P2=[x-dx*21,y-dy*21];
    const edge:P2[]=[point];
    for(let k=0;k<=20;k++) {const b=-Math.PI/2+k*Math.PI/20;edge.push([x+dx*Math.cos(b)*13+nx*Math.sin(b)*11,y+dy*Math.cos(b)*13+ny*Math.sin(b)*11]);}
    p.poly(edge,"#bfe8ff",5);
  }
  g.restore();
};
