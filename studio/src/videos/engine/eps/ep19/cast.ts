// What If ep19 acting + fx. Lead: the channel default (one curl, red varsity jacket, white tee, jeans) in yellow oven mitts. The star prop is ONE frozen
// turkey design (drawTurkey: frost-white body, pink skin showing through, two drumsticks) drawn inside the card between the arms and the hands (toon.ts
// episode Prop), so it moves with the hands; the mitts are drawn over the hands (Prop.over). Roast and charred use the same shape. No brands, no department name.
import { Pen, Outfit, FrontOpts, INK, POSES, SKINS } from "../../toon";
import type { Prop } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, q } from "../../act";
import { camAt } from "../../story";
import { YOU, NEIGHBOR, TEEN, GRANDMA, RUNNER } from "../people";
import { SHOTS, BEATS, S0, P0, ez } from "./story";
import words from "./words";

const SO = SETS.turkey.origin;
const L = ([x, y, z]: V3): V3 => [SO[0] + x, y, z];
const X = (x: number) => SO[0] + x;
export const word = (text: string, from = 0) => {
  const hit = words.find((w) => w.start >= from - 0.01 && w.text.replace(/[^A-Za-z0-9'-]/g, "").toLowerCase() === text.toLowerCase());
  if (!hit) throw new Error(`Missing cast beat word: ${text} after ${from}`);
  return hit.start;
};
export const wearAt = (_t: number) => 0;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const two = Math.PI * 2;
const sr = (i: number) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };

// ---------------- cast ----------------
const CAPTAIN: Outfit = { jacket: "#26385c", pants: "#1c2640", boots: "#1e1a1a", hat: "helmet", cap: "#f4f1ea", build: "stout", top: "button", bottom: "jeans", shoe: "boot",
  moustache: "#5a4030", skin: SKINS[3], acc: ["suspenders"], accCol: "#e8c45a" };
export const CAST: [string, Outfit, Partial<FrontOpts>][] = [["You", YOU, { expr: "grin" }], ["Neighbor", NEIGHBOR, { expr: "smug" }], ["Captain", CAPTAIN, { expr: "stern" }],
  ["Grandma", GRANDMA, { expr: "smile" }], ["Teen", TEEN, { expr: "bored" }], ["Runner", RUNNER, { expr: "smile" }]];
const sec = (id: number) => [SHOTS[id - 1].a / 30, SHOTS[id - 1].b / 30];
const you = (at: V3, expr: Act["expr"], more: Partial<Act> = {}): Act => ({ i: 0, o: YOU, at: L(at), mode: "stand", expr, ...more });
const who = (i: number, o: Outfit, at: V3, expr: Act["expr"], more: Partial<Act> = {}): Act => ({ i, o, at: L(at), mode: "stand", expr, ...more });

// ---------------- hand poses (hands drawn on top of the prop, front) ----------------
/** both mitts under the turkey's lower flanks (hands out to the sides, forearms rising to them): up 0 = belly .. 1 = chest high; sp = outward reach */
const HOLD = (up = 0, sp = 22, wob = 0, down = 0): FrontOpts["reach"] => { const hy = 0.72 - 0.22 * up + 0.25 * down, ey = 0.2 + 0.55 * hy;
  return [{ ex: -sp - 12, ey, hx: -sp - wob, hy, front: true }, { ex: sp + 12, ey, hx: sp + wob, hy, front: true }]; };
const MITTS_DOWN = (): FrontOpts["reach"] => [{ ex: -22, ey: 0.7, hx: -4, hy: 1.1, front: true }, { ex: 22, ey: 0.7, hx: 4, hy: 1.1, front: true }];
const MITTS_UP = (k = 1): FrontOpts["reach"] => [{ ex: -24, ey: 0.2 - 0.4 * k, hx: -18 - 8 * k, hy: 0.2 - 0.9 * k, front: true }, { ex: 24, ey: 0.2 - 0.4 * k, hx: 18 + 8 * k, hy: 0.2 - 0.9 * k, front: true }];
const HIPS: FrontOpts["reach"] = POSES.hands_on_hips;
const SHIELD = (k = 1): FrontOpts["reach"] => [{ ex: -26, ey: 0.45 - 0.35 * k, hx: 18, hy: 0.35 - 0.4 * k, front: true }, { ex: 26, ey: 0.45 - 0.35 * k, hx: -18, hy: 0.35 - 0.4 * k, front: true }];

// ---------------- drawing helpers ----------------
const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, col: string, weight = 900, font = `"Segoe UI Black", "Arial Black", Arial, sans-serif`, align: CanvasTextAlign = "center") => {
  g.save(); g.textAlign = align; g.textBaseline = "middle"; g.font = `${weight} ${px}px ${font}`; g.fillStyle = col; g.fillText(s, x, y); g.restore();
};
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string, lw = 0) => {
  g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); if (stroke) { g.lineWidth = lw; g.strokeStyle = stroke; g.stroke(); }
};
const ell = (g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string, lw = 0, rot = 0) => {
  g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, two); g.fillStyle = fill; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); }
};
/** local px about card point c (rotated, scaled), following the body tilt */
const local = (p: Pen, c: [number, number], ang: number, s: number, fn: (g: CanvasRenderingContext2D) => void) => {
  const g = p.g, [x, y] = p.P(c[0], c[1]), r = p.rot; g.save(); g.translate(x, y); g.rotate(ang + (r ? r[0] : 0)); g.scale(s, s); p.rot = null;
  try { fn(g); } finally { p.rot = r; g.restore(); }
};
const glow = (g: CanvasRenderingContext2D, size: number, stops: [number, string][]) => {
  const c = size / 2, r = g.createRadialGradient(c, c, 0, c, c, c); for (const [o, col] of stops) r.addColorStop(o, col); g.fillStyle = r; g.fillRect(0, 0, size, size);
};
const ellPx = (p: Pen, c: string) => glow(p.g, 128, [[0, c], [1, "rgba(255,240,200,0)"]]);

// ---------------- the turkey (300 x 300 px box): ONE shape everywhere. A plump body (flat-ish bottom), two drumsticks up and out with
// white bone knobs. Held: the mitts grip the body's lower flanks at (48,215) and (252,215); the body's bottom is y 262. ----------------
type TStyle = "frozen" | "roast" | "char";
const PAL: Record<TStyle, { skin: string; shade: string; leg: string; bone: string }> = {
  frozen: { skin: "#f4dccd", shade: "#c99f95", leg: "#efcfc0", bone: "#fbf8f2" },
  roast: { skin: "#e09a45", shade: "#9a5220", leg: "#cf8436", bone: "#f6efe2" },
  char: { skin: "#5a463e", shade: "#1c1412", leg: "#40302a", bone: "#8a7a70" },
};
const bodyPath = (g: CanvasRenderingContext2D) => { g.beginPath(); g.moveTo(40, 222); g.bezierCurveTo(14, 150, 76, 96, 150, 96); g.bezierCurveTo(224, 96, 286, 150, 260, 222); g.bezierCurveTo(240, 266, 60, 266, 40, 222); g.closePath(); };
const drawTurkey = (g: CanvasRenderingContext2D, st: TStyle) => {
  const c = PAL[st], frozen = st === "frozen"; g.lineCap = "round"; g.lineJoin = "round";
  for (const sx of [-1, 1]) { // drumsticks: meat teardrop + bone + knob, behind the body
    const bx = 150 + sx * 50, by = 148, tx = 150 + sx * 112, ty = 40, ang = Math.atan2(ty - by, tx - bx), L = Math.hypot(tx - bx, ty - by);
    g.save(); g.translate(bx, by); g.rotate(ang);
    g.beginPath(); g.moveTo(0, -30); g.bezierCurveTo(L * 0.45, -36, L * 0.7, -14, L * 0.74, -8); g.lineTo(L * 0.74, 8); g.bezierCurveTo(L * 0.7, 14, L * 0.45, 36, 0, 30); g.closePath();
    g.fillStyle = c.leg; g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
    g.beginPath(); g.moveTo(L * 0.7, 0); g.lineTo(L * 0.96, 0); g.lineWidth = 22; g.strokeStyle = INK; g.stroke(); g.lineWidth = 11; g.strokeStyle = c.bone; g.stroke();
    for (const k of [-1, 1]) { g.beginPath(); g.arc(L, k * 10, 13, 0, two); g.fillStyle = c.bone; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
    g.beginPath(); g.moveTo(L * 0.94, -8); g.lineTo(L * 0.94, 8); g.lineWidth = 11; g.strokeStyle = c.bone; g.stroke();
    if (frozen) for (let i = 0; i < 9; i++) { g.fillStyle = "rgba(255,255,255,0.95)"; g.beginPath(); g.arc(L * (0.12 + 0.55 * sr(i + sx * 50 + 200)), (sr(i + sx * 50 + 260) - 0.5) * 40, 3 + 4 * sr(i + 90), 0, two); g.fill(); }
    g.restore();
  }
  const gr = g.createLinearGradient(80, 96, 210, 266); gr.addColorStop(0, frozen ? "#fdf4ee" : c.skin); gr.addColorStop(0.55, c.skin); gr.addColorStop(1, c.shade);
  bodyPath(g); g.fillStyle = gr; g.fill();
  g.save(); bodyPath(g); g.clip();
  g.lineWidth = 7; g.strokeStyle = frozen ? "rgba(150,110,104,0.45)" : "rgba(0,0,0,0.28)"; // wing tucks + breast line
  for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(150 + sx * 120, 160); g.quadraticCurveTo(150 + sx * 70, 200, 150 + sx * 104, 246); g.stroke(); }
  g.beginPath(); g.moveTo(150, 112); g.quadraticCurveTo(140, 180, 150, 250); g.stroke();
  if (frozen) { // frost crust: white patches with a cold blue edge, crystal speckles everywhere
    for (const [x, y, rx, ry, r] of [[98, 132, 62, 30, -0.4], [204, 128, 52, 26, 0.35], [150, 104, 70, 20, 0], [70, 200, 30, 40, 0.2], [236, 196, 28, 38, -0.2]]) {
      g.fillStyle = "rgba(170,205,240,0.55)"; g.beginPath(); g.ellipse(x, y + 4, rx + 6, ry + 5, r, 0, two); g.fill();
      g.fillStyle = "rgba(255,255,255,0.93)"; g.beginPath(); g.ellipse(x, y, rx, ry, r, 0, two); g.fill(); }
    for (let i = 0; i < 120; i++) { const x = 30 + 240 * sr(i + 400), y = 96 + 170 * sr(i + 800), r = 2 + 5 * sr(i + 1200);
      g.fillStyle = sr(i + 50) < 0.25 ? "rgba(150,195,240,0.9)" : "rgba(255,255,255,0.95)"; g.beginPath(); g.arc(x, y, r, 0, two); g.fill(); }
  } else if (st === "roast") { g.strokeStyle = "rgba(255,230,170,0.85)"; g.lineWidth = 10; g.beginPath(); g.moveTo(96, 136); g.quadraticCurveTo(126, 112, 168, 118); g.stroke();
  } else { for (let i = 0; i < 50; i++) { g.fillStyle = sr(i + 9) < 0.2 ? "#ff7a2a" : "rgba(20,14,12,0.7)"; g.beginPath(); g.arc(30 + 240 * sr(i + 400), 96 + 170 * sr(i + 800), 3 + 6 * sr(i + 70), 0, two); g.fill(); } }
  g.restore();
  bodyPath(g); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
  if (frozen) { // icicles along the bottom edge + two sparkle stars
    g.fillStyle = "#eef7ff"; g.strokeStyle = INK; g.lineWidth = 3.5;
    for (let i = 0; i < 9; i++) { const x = 66 + i * 21, y = 252 - 10 * Math.abs(i - 4) / 4, l = 12 + 14 * sr(i + 300); g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x, y + l); g.lineTo(x + 6, y); g.closePath(); g.fill(); g.stroke(); }
    for (const [x, y, r] of [[112, 128, 13], [208, 176, 10]]) { g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(x, y - r); g.lineTo(x + r * 0.25, y - r * 0.25); g.lineTo(x + r, y); g.lineTo(x + r * 0.25, y + r * 0.25); g.lineTo(x, y + r); g.lineTo(x - r * 0.25, y + r * 0.25); g.lineTo(x - r, y); g.lineTo(x - r * 0.25, y - r * 0.25); g.closePath(); g.fill(); }
  }
};
/** the turkey seen from above in the oil (shot 9): the same body + two drumstick knobs, frost */
const drawTurkeyTop = (g: CanvasRenderingContext2D) => {
  for (const sx of [-1, 1]) { g.save(); g.translate(150 + sx * 52, 112); g.rotate(sx * -0.5 - Math.PI / 2); ell(g, 34, 0, 40, 24, "#efcfc0", 7); g.lineCap = "round"; g.beginPath(); g.moveTo(66, 0); g.lineTo(90, 0); g.lineWidth = 20; g.strokeStyle = INK; g.stroke(); g.lineWidth = 10; g.strokeStyle = "#fbf8f2"; g.stroke();
    for (const k of [-1, 1]) ell(g, 96, k * 9, 12, 12, "#fbf8f2", 5); g.restore(); }
  ell(g, 150, 168, 112, 92, "#f4dccd", 8); ell(g, 128, 140, 62, 36, "rgba(255,255,255,0.93)", 0); ell(g, 190, 196, 40, 26, "rgba(255,255,255,0.9)", 0);
  for (let i = 0; i < 70; i++) { const a = sr(i) * two, d = Math.sqrt(sr(i + 400)); g.fillStyle = sr(i + 50) < 0.25 ? "rgba(150,195,240,0.9)" : "rgba(255,255,255,0.95)"; g.beginPath(); g.arc(150 + Math.cos(a) * d * 104, 168 + Math.sin(a) * d * 84, 3 + 5 * sr(i + 800), 0, two); g.fill(); }
};
/** held: both mitts on the body's lower flanks (two hands) or the body sitting on one mitt (one) */
const turkeyProp = (key: string, st: TStyle, one = false): Prop => ({ k: key, draw: (p, h, u) => {
  if (one) { const c = h[0]; if (!c) return; local(p, c, 0, 0.5 * u, (g) => { g.translate(-150, -250); drawTurkey(g, st); }); return; }
  const a = h[0], b = h[1]; if (!a || !b) return;
  const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], span = Math.hypot(b[0] - a[0], b[1] - a[1]), s = Math.max(0.42 * u, Math.min(0.62 * u, span / 204)),
    ang = Math.max(-0.3, Math.min(0.3, Math.atan2(b[1] - a[1], b[0] - a[0])));
  local(p, mid, ang, s, (g) => { g.translate(-150, -215); drawTurkey(g, st); }); }, over: mittsOver });

// ---------------- oven mitts (yellow, quilted, white cuff): drawn over the front-drawn hands AS the hands, aligned to the forearm
// (elbow -> hand), the cuff on the wrist, so they move with the arm and cover the ink hand completely ----------------
function mittsOver(p: Pen, h: ([number, number] | undefined)[], u: number, e?: ([number, number] | undefined)[]) {
  h.forEach((c, i) => { if (!c) return; const el = e?.[i]; let dx = 0, dy = 1;
    if (el) { const L = Math.hypot(c[0] - el[0], c[1] - el[1]); if (L > 1e-3) { dx = (c[0] - el[0]) / L; dy = (c[1] - el[1]) / L; } }
    let nx = -dy, ny = dx; if ((i === 0 ? 1 : -1) * nx < 0) { nx = -nx; ny = -ny; } // n points to the body's middle: the thumb side
    const at = (a: number, b: number): [number, number] => [c[0] + (dx * a + nx * b) * u, c[1] + (dy * a + ny * b) * u], rot = (Math.atan2(dy, dx) * 180) / Math.PI;
    const th = at(1, 9.5); p.ell(th[0], th[1], 9.5 * u, 5.5 * u, "#e5a526", 2.3 * u, 0, 360, rot - 35 * (nx * dy - ny * dx > 0 ? 1 : -1)); // thumb
    const m = at(5, 0); p.ell(m[0], m[1], 14.5 * u, 11.5 * u, "#f2bd3a", 2.5 * u, 0, 360, rot); // mitt body, long axis along the forearm
    p.stroke([at(-1, -4), at(14, -4)], 1.2 * u, "#b0791c"); p.stroke([at(-1, 3), at(13, 3)], 1.2 * u, "#b0791c"); // quilting
    p.poly([at(-12, -11.5), at(-3, -11.5), at(-3, 11.5), at(-12, 11.5)], "#f4f1ea", 2.2 * u); p.stroke([at(-7.5, -11), at(-7.5, 11)], 2.2 * u, "#c63939"); // cuff on the wrist
  });
}
/** mitts only (empty hands, and the base for every prop that has none) */
const BARE: Prop = { k: "mitts19", draw: () => undefined, over: mittsOver };
const withMitts = (k: string, draw: (p: Pen, h: [number, number][], u: number, chest: [number, number]) => void): Prop => ({ k, draw, over: mittsOver });

// ---------------- other held props ----------------
const TURKEY2 = turkeyProp("t2f", "frozen"), TURKEY1 = turkeyProp("t1f", "frozen", true), ROAST2 = turkeyProp("t2r", "roast");
/** a folding lawn chair (back + seat + splayed legs) seen from the front: webbing bands; fold 0..1 flattens it, burnt chars the webbing */
const drawChair = (g: CanvasRenderingContext2D, burnt: boolean, fold: number) => {
  const bh = 190 * (1 - 0.75 * fold), top = 20 + 110 * fold;
  g.lineCap = "round"; g.lineJoin = "round";
  for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(150 + sx * 110, top + bh); g.lineTo(150 + sx * 150 * (1 - 0.5 * fold) + sx * 20 * fold, 330); g.lineWidth = 22; g.strokeStyle = INK; g.stroke(); g.lineWidth = 12; g.strokeStyle = burnt ? "#3a2c26" : "#cfd4dc"; g.stroke(); }
  rr(g, 40, top, 220, bh, 16, burnt ? "#2a201c" : "#f4f1ea", INK, 9);
  for (let i = 0; i < 5; i++) { const y = top + 18 + i * ((bh - 36) / 4.4); rr(g, 54, y, 192, Math.max(6, (bh - 40) / 7), 6, burnt ? (i % 2 ? "#3a2a22" : "#1c1512") : i % 2 ? "#2f6fd6" : "#f4f1ea", INK, 4); }
  if (burnt) { g.fillStyle = "#14100e"; for (const [x, y, r] of [[96, top + 50, 22], [190, top + 96, 26], [140, top + 150, 18]]) ell(g, x, y, r, r * 0.8, "#14100e", 0); g.strokeStyle = "#ff7a2a"; g.lineWidth = 5; g.beginPath(); g.arc(96, top + 50, 24, 0.4, 2.4); g.stroke(); g.beginPath(); g.arc(190, top + 96, 28, 3.4, 5.2); g.stroke(); }
  rr(g, 20, top - 14, 260, 24, 12, burnt ? "#3a2c26" : "#cfd4dc", INK, 8);
};
const chairProp = (burnt: boolean, fold = 0): Prop => ({ k: `chair19|${burnt}|${q(fold, 8)}`, draw: (p, h, u) => { const a = h[0], b = h[1]; if (!a || !b) return;
  const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], span = Math.hypot(b[0] - a[0], b[1] - a[1]) + 24 * u, s = Math.max(0.42 * u, span / 270);
  local(p, mid, 0.3 * Math.atan2(b[1] - a[1], b[0] - a[0]), s, (g) => { g.translate(-150, -10); drawChair(g, burnt, fold); }); }, over: mittsOver });
const dish = (g: CanvasRenderingContext2D) => { ell(g, 100, 40, 96, 30, "#fbfaf6", 6); ell(g, 100, 38, 66, 19, "#efece4", 3); ell(g, 82, 33, 28, 12, "#b8742f", 4); ell(g, 124, 36, 18, 10, "#6a9a4a", 3); ell(g, 108, 28, 12, 7, "#c63939", 3); };
const PLATE: Prop = { k: "plate19", draw: (p, h, u) => { const c = h[1] ?? h[0]; if (!c) return; local(p, c, -0.05, 0.62 * u, (g) => { g.translate(-100, -52); dish(g); }); }, over: mittsOver };
const clip19 = (g: CanvasRenderingContext2D) => {
  rr(g, 0, 0, 340, 470, 20, "#8a6a44", INK, 10); rr(g, 120, -14, 100, 40, 14, "#b9bfc9", INK, 8); rr(g, 24, 36, 292, 410, 8, "#fbf8ee", INK, 5);
  text(g, "THANKSGIVING", 170, 92, 40, "#7a2a25"); text(g, "COOKING FIRES", 170, 138, 40, "#7a2a25");
  g.fillStyle = "#c9c2ad"; g.fillRect(50, 168, 240, 5);
  text(g, "1,446", 170, 262, 108, "#c63939"); text(g, "ONE DAY", 170, 354, 40, "#3a4256"); text(g, "2023", 170, 404, 40, "#3a4256");
};
const CLIP: Prop = { k: "clip19", draw: (p, h, u) => { const c = h[0] ?? h[1]; if (!c) return; local(p, c, -0.05, 0.27 * u, (g) => { g.translate(-170, -400); clip19(g); }); } }; // the Captain: bare hands
const leafCover = (g: CanvasRenderingContext2D) => {
  rr(g, 0, 0, 320, 440, 10, "#f4f1ea", INK, 9); g.fillStyle = "#c63939"; g.fillRect(9, 9, 302, 120);
  text(g, "TURKEY", 160, 52, 56, "#ffffff"); text(g, "FIRE SAFETY", 160, 104, 46, "#ffffff");
  ell(g, 160, 300, 74, 62, "#e9d3cd", 7); for (const sx of [-1, 1]) ell(g, 160 + sx * 56, 238, 14, 22, "#e9d3cd", 6, sx * 0.4);
  g.strokeStyle = "#2f6fd6"; g.lineWidth = 12; g.lineCap = "round"; for (let i = 0; i < 3; i++) { const a = (i * Math.PI) / 3; g.beginPath(); g.moveTo(160 + Math.cos(a) * 70, 300 + Math.sin(a) * 70); g.lineTo(160 - Math.cos(a) * 70, 300 - Math.sin(a) * 70); g.stroke(); }
  text(g, "READ ME", 160, 400, 34, "#3a4256");
};
const LEAF: Prop = { k: "leaf19", draw: (p, h, u) => { const c = h[0] ?? h[1]; if (!c) return; local(p, c, 0.1, 0.34 * u, (g) => { g.translate(-160, -14); leafCover(g); }); } }; // the Captain pinches its top edge
const LEAF_L: Prop = { k: "leafl19", draw: (p, h, u) => { const c = h[1] ?? h[0]; if (!c) return; local(p, c, -0.1, 0.34 * u, (g) => { g.translate(-160, -14); leafCover(g); }); }, over: mittsOver };
const page1 = (g: CanvasRenderingContext2D) => {
  g.fillStyle = "rgba(29,26,58,0.12)"; g.fillRect(396, 0, 8, 560);
  text(g, "PAGE 1", 400, 36, 30, "#7a2a25");
  ell(g, 200, 270, 78, 64, "#e9d3cd", 7); for (const sx of [-1, 1]) ell(g, 200 + sx * 60, 206, 15, 24, "#e9d3cd", 6, sx * 0.4);
  g.strokeStyle = "#2f6fd6"; g.lineWidth = 13; g.lineCap = "round"; for (let i = 0; i < 3; i++) { const a = (i * Math.PI) / 3; g.beginPath(); g.moveTo(200 + Math.cos(a) * 92, 270 + Math.sin(a) * 92); g.lineTo(200 - Math.cos(a) * 92, 270 - Math.sin(a) * 92); g.stroke(); }
  text(g, "THAW IT ALL", 200, 408, 40, "#1d1a3a"); text(g, "THE WAY", 200, 452, 40, "#1d1a3a");
  g.fillStyle = "#c9a98a"; g.fillRect(470, 250, 100, 100); g.fillStyle = "#8a4b32"; g.beginPath(); g.moveTo(458, 252); g.lineTo(520, 190); g.lineTo(582, 252); g.closePath(); g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
  rr(g, 508, 296, 24, 54, 4, "#2F6E73", INK, 5); ell(g, 670, 320, 20, 24, "#dde1e6", 6); g.fillStyle = "#e8702a"; g.beginPath(); g.moveTo(656, 300); g.lineTo(670, 262); g.lineTo(684, 300); g.fill();
  g.strokeStyle = "#c63939"; g.lineWidth = 9; g.beginPath(); g.moveTo(580, 286); g.lineTo(640, 286); g.stroke(); g.beginPath(); g.moveTo(626, 270); g.lineTo(644, 286); g.lineTo(626, 302); g.stroke();
  text(g, "FRY IT OUTSIDE,", 600, 408, 36, "#1d1a3a"); text(g, "FAR FROM THE HOUSE", 600, 452, 33, "#1d1a3a");
};
const OPEN_LEAF: Prop = { k: "leafopen19", draw: (p, h, u) => { const a = h[0], b = h[1]; if (!a || !b) return; const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], w = Math.max(Math.abs(b[0] - a[0]) + 24, 150 * u);
  local(p, mid, Math.atan2(b[1] - a[1], b[0] - a[0]), w / 800, (g) => { g.translate(-400, -60); g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, 800, 560); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(0, 0, 800, 560); page1(g); }); }, over: mittsOver };
const trayDraw = (g: CanvasRenderingContext2D) => { ell(g, 200, 130, 196, 50, "#cfd4dc", 7); ell(g, 200, 118, 168, 38, "#e2e6ec", 3); // tray
  g.save(); g.translate(110, -39); g.scale(0.6, 0.6); drawTurkey(g, "roast"); g.restore(); }; // the same turkey shape, roasted
const TRAY: Prop = { k: "tray19", draw: (p, h, u) => { const a = h[0], b = h[1]; if (!a || !b) return; const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], w = Math.max(Math.abs(b[0] - a[0]) + 40, 150 * u);
  local(p, mid, 0, w / 400, (g) => { g.translate(-200, -128); trayDraw(g); }); }, over: mittsOver };

// ---------------- fx draws ----------------
/** soft steam / smoke: overlapping radial blobs, no outline (round 2: hard-edged discs piled up like faces) */
const smokePuff = (p: Pen, v: number, dark = false) => { const g = p.g, a0 = (dark ? 0.62 : 0.5) * (1 - v * v), col = dark ? "64,56,60" : "250,250,248";
  for (let i = 0; i < 4; i++) { const a = i * 1.7 + 0.6, d = i ? 26 + 40 * v : 0, x = 150 + d * Math.cos(a), y = 160 + d * 0.6 * Math.sin(a), R = i ? 70 + 10 * v : 100;
    const r = g.createRadialGradient(x, y, 4, x, y, R); r.addColorStop(0, `rgba(${col},${a0.toFixed(3)})`); r.addColorStop(0.55, `rgba(${col},${(a0 * 0.55).toFixed(3)})`); r.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = r; g.beginPath(); g.arc(x, y, R, 0, two); g.fill(); } };
const billow = (p: Pen, u: number, seed: number) => {
  const mix = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  const hot = u < 0.45 ? mix([255, 244, 190], [255, 140, 40], u / 0.45) : mix([255, 140, 40], [46, 36, 44], (u - 0.45) / 0.55);
  const edge = u < 0.45 ? mix([255, 130, 30], [190, 60, 25], u / 0.45) : mix([190, 60, 25], [30, 24, 32], (u - 0.45) / 0.55), al = u < 0.7 ? 1 : 1 - (u - 0.7) / 0.3;
  const g = p.g; for (let i = 0; i < 6; i++) { const a = i * 1.05 + seed, d = i ? 92 : 0, x = 256 + d * Math.cos(a), y = 256 + d * Math.sin(a), R = i ? 110 + 22 * Math.sin(seed + i) : 150;
    const r = g.createRadialGradient(x, y, 4, x, y, R); r.addColorStop(0, `rgba(${hot},${al})`); r.addColorStop(0.68, `rgba(${edge},${al})`); r.addColorStop(1, `rgba(${edge},0)`); g.fillStyle = r; g.beginPath(); g.arc(x, y, R, 0, two); g.fill(); }
};
const sootDraw = (p: Pen, lit: number, seed: number) => {
  const g = p.g; for (let i = 0; i < 6; i++) { const a = i * 1.05 + seed, d = i ? 96 : 0, x = 256 + d * Math.cos(a), y = 256 + d * 0.8 * Math.sin(a), R = i ? 112 : 150;
    const r = g.createRadialGradient(x, y - 30, 8, x, y, R), under = y > 270 ? lit : 0; r.addColorStop(0, `rgba(${Math.round(70 + 170 * under)},${Math.round(58 + 62 * under)},${Math.round(66 - 20 * under)},.95)`); r.addColorStop(0.75, "rgba(38,30,40,.9)"); r.addColorStop(1, "rgba(38,30,40,0)"); g.fillStyle = r; g.beginPath(); g.arc(x, y, R, 0, two); g.fill(); }
};
const flameDraw = (hot: number, n: number) => (p: Pen) => { const g = p.g;
  const tongues = 7; for (let i = 0; i < tongues; i++) { const x = 40 + (i * 220) / (tongues - 1), hh = (70 + 70 * sr(i + n * 3) + 120 * hot) * (1 - Math.abs(i - 3) * 0.12);
    const gr = g.createLinearGradient(0, 256, 0, 256 - hh); gr.addColorStop(0, "#4aa8ff"); gr.addColorStop(0.25, hot > 0.5 ? "#fff6d0" : "#ffb23a"); gr.addColorStop(1, hot > 0.5 ? "#ffd86a" : "#ff5a1a");
    g.beginPath(); g.moveTo(x - 24, 256); g.quadraticCurveTo(x - 20, 256 - hh * 0.5, x + 6 * (n % 2 ? 1 : -1), 256 - hh); g.quadraticCurveTo(x + 22, 256 - hh * 0.5, x + 24, 256); g.closePath(); g.fillStyle = gr; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); } };
const bubbleDraw = (p: Pen) => { const g = p.g; ell(g, 32, 32, 26, 26, "rgba(255,236,170,0.55)", 4); ell(g, 24, 24, 7, 6, "rgba(255,255,255,0.95)"); };
/** the foam crown over the oil (300 x 160): one lumpy cream cap, one ink outline round the whole union, no dots (they read as eyes) */
const foamDraw = (seed: number) => (p: Pen) => { const g = p.g, B: [number, number, number][] = [];
  for (let i = 0; i < 9; i++) B.push([40 + i * 27.5, 108 - 34 * Math.sin((i / 8) * Math.PI) - 10 * sr(seed + i), 30 + 10 * sr(seed + i + 20)]);
  B.push([150, 128, 110]);
  for (const [x, y, r] of B) { g.beginPath(); g.arc(x, y, r + 5, 0, two); g.fillStyle = INK; g.fill(); }
  for (const [x, y, r] of B) { g.beginPath(); g.arc(x, y, r, 0, two); g.fillStyle = "#fff3cf"; g.fill(); }
  g.fillStyle = "#f2dc9c"; g.fillRect(30, 132, 240, 30);
  g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 7; g.lineCap = "round"; for (const [x, y, r] of B.slice(1, 8)) { g.beginPath(); g.arc(x, y, r * 0.6, 3.6, 4.6); g.stroke(); } };
const oilDraw = (p: Pen) => { const g = p.g, r = g.createRadialGradient(100, 100, 6, 100, 100, 100); r.addColorStop(0, "#f2b53c"); r.addColorStop(0.7, "#c9801f"); r.addColorStop(1, "#7a4510"); g.fillStyle = r; g.beginPath(); g.arc(100, 100, 98, 0, two); g.fill();
  g.strokeStyle = "rgba(255,230,160,0.7)"; g.lineWidth = 6; g.beginPath(); g.arc(100, 100, 70, 3.6, 5.0); g.stroke(); g.beginPath(); g.arc(100, 100, 48, 0.2, 1.4); g.stroke(); };
const stickerDraw = (g: CanvasRenderingContext2D, big: boolean) => { // 320 x 250 sticker: WARNING, ice cube under oil -> arrow -> steam puff; the big 1,700x
  rr(g, 4, 4, 312, 242, 18, "#ffd23a", INK, 8); rr(g, 4, 4, 312, 56, 18, "#c63939"); g.fillStyle = "#c63939"; g.fillRect(4, 40, 312, 20); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(4, 4, 312, 242);
  text(g, "WARNING", 160, 34, 44, "#ffffff");
  if (!big) { rr(g, 22, 100, 70, 62, 8, "#bfe1f8", INK, 6); text(g, "ICE", 57, 131, 24, "#1d1a3a"); rr(g, 14, 142, 86, 44, 8, "#c9801f", INK, 6);
    g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(112, 140); g.lineTo(170, 140); g.stroke(); g.beginPath(); g.moveTo(158, 120); g.lineTo(184, 140); g.lineTo(158, 160); g.stroke();
    for (const [x, y, r] of [[236, 150, 36], [262, 120, 28], [214, 112, 26]]) ell(g, x, y, r, r * 0.9, "#ffffff", 6);
    text(g, "ICE + HOT OIL", 160, 214, 30, "#1d1a3a"); }
  else { rr(g, 18, 118, 40, 38, 5, "#bfe1f8", INK, 5); for (const [x, y, r] of [[240, 140, 56], [276, 96, 40], [196, 100, 36]]) ell(g, x, y, r, r * 0.9, "#ffffff", 6);
    text(g, "1,700x", 150, 128, 78, "#c63939"); g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(62, 152); g.lineTo(100, 152); g.stroke(); text(g, "STEAM NEEDS THE ROOM", 160, 218, 22, "#1d1a3a", 800, "Arial, sans-serif"); }
};
const dialDraw = (p: Pen) => { const g = p.g; ell(g, 100, 100, 94, 94, "#dde1e6", 8); ell(g, 100, 100, 76, 76, "#fbfaf6", 4);
  for (let i = 0; i < 9; i++) { const a = Math.PI * (0.8 + 1.4 * i / 8); g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(100 + Math.cos(a) * 62, 100 + Math.sin(a) * 62); g.lineTo(100 + Math.cos(a) * 74, 100 + Math.sin(a) * 74); g.stroke(); }
  g.strokeStyle = "#c63939"; g.lineWidth = 8; g.lineCap = "round"; g.beginPath(); g.moveTo(100, 100); g.lineTo(100 + Math.cos(Math.PI * 1.86) * 58, 100 + Math.sin(Math.PI * 1.86) * 58); g.stroke(); text(g, "350 F", 100, 142, 26, "#1d1a3a"); };
const chairFx = (p: Pen) => { const g = p.g; g.lineCap = "round"; for (const [x0, y0, x1, y1] of [[60, 190, 30, 290], [160, 190, 190, 290], [60, 130, 90, 60], [110, 130, 110, 60]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineWidth = 20; g.strokeStyle = INK; g.stroke(); g.lineWidth = 10; g.strokeStyle = "#cfd4dc"; g.stroke(); }
  g.save(); g.translate(30, 30); g.rotate(-0.12); rr(g, 30, 20, 90, 130, 10, "#f4f1ea", INK, 8); for (let i = 0; i < 4; i++) rr(g, 38, 32 + i * 28, 74, 16, 5, i % 2 ? "#2f6fd6" : "#f4f1ea", INK, 4); g.restore(); rr(g, 40, 160, 150, 26, 10, "#2f6fd6", INK, 8); };
const brokenChair = (p: Pen, burnt: boolean) => { const g = p.g; g.save(); g.lineCap = "round"; for (const [x0, y0, x1, y1] of [[30, 70, 270, 62], [40, 110, 262, 100]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineWidth = 22; g.strokeStyle = INK; g.stroke(); g.lineWidth = 11; g.strokeStyle = burnt ? "#3a2c26" : "#cfd4dc"; g.stroke(); }
  rr(g, 54, 76, 190, 24, 8, "#241b18", INK, 6); g.fillStyle = "#ff7a2a"; for (const x of [90, 150, 200]) { g.beginPath(); g.arc(x, 88, 5, 0, two); g.fill(); } g.restore(); };
const doorDraw = (k: number) => (p: Pen) => { const g = p.g; g.fillStyle = "#1a1620"; g.fillRect(0, 0, 105, 210); const w = Math.max(6, 105 * k); g.fillStyle = "#c63939"; g.fillRect(0, 0, w, 210); g.strokeStyle = INK; g.lineWidth = 5; g.strokeRect(0, 0, w, 210); };
const peekDraw = (face: number, curtain: number) => (p: Pen) => { const g = p.g; g.fillStyle = "#3a2a22"; g.fillRect(0, 0, 200, 200); const r = g.createLinearGradient(0, 0, 0, 200); r.addColorStop(0, "#ffe2a0"); r.addColorStop(1, "#f2b860"); g.fillStyle = r; g.fillRect(8, 8, 184, 184);
  if (face > 0) { const y = 210 - 90 * face; ell(g, 100, y, 52, 56, "#b8845e", 6); for (const sx of [-1, 1]) { ell(g, 100 + sx * 19, y - 6, 12, 15, "#ffffff", 4); ell(g, 100 + sx * 19, y - 3, 4.5, 6, INK, 0); } g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.arc(100, y + 26, 11, 0, two); g.stroke(); }
  if (curtain > 0) { g.fillStyle = "#e8d8b0"; g.fillRect(8, 8, 184 * curtain, 184); g.strokeStyle = "#b8a070"; g.lineWidth = 5; for (let x = 24; x < 184 * curtain; x += 28) { g.beginPath(); g.moveTo(x, 8); g.lineTo(x, 192); g.stroke(); } g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(8, 8, 184, 184); } };

// ---------------- acts ----------------
const N0 = 3.0; // the Neighbor leans on the fence at x 2.6, z -3.9
const ACTS = (id: number): Act[] => {
  const [a, b] = sec(id);
  switch (id) {
    case 1: return [you([0.45, 0, 2.1], [[0, "concentrate"], [2.0 - LEAD, "confident"]], { prop: TURKEY2, reach: (t) => HOLD(ez(t, 0.1, 1.8), 22, 0.8 * Math.sin(t * 9)), lookY: () => 0.1 })];
    case 2: return [you([0, 0, 1.0], [[0, "nervous"], [3.4 - LEAD, "nervous_laugh"]], { prop: TURKEY2, reach: (t) => HOLD(0.35, 22, 1.6 * Math.sin(t * 8), 0.0), lookY: () => 0.2 })];
    case 3: return [you([0.45, 0, 2.1], [[0, "smug"], [5.05 - LEAD, "squint"], [5.9 - LEAD, "grin"]], { prop: TURKEY1,
      reach: (t) => { const k = Math.max(ez(t, 5.0, 5.12) * (1 - ez(t, 5.14, 5.26)), ez(t, 5.4, 5.52) * (1 - ez(t, 5.54, 5.66)));
        return [{ ex: -22, ey: 0.5 - 0.25 * (1 - ez(t, 4.7, 5.0)), hx: -4, hy: 0.45 - 0.3 * (1 - ez(t, 4.7, 5.0)), front: true }, { ex: 20, ey: 0.2, hx: -30 + 8 * k, hy: 0.0, front: true }]; }, lookY: () => 0.35 })];
    case 4: return [you([0, 0, 1.0], [[0, "confident"], [9.5 - LEAD, "grin"]], { prop: TURKEY2, reach: (t) => HOLD(0.35 + 0.65 * ez(t, 8.4, 9.4), 22, 0.8 * Math.sin(t * 9)) })];
    case 5: return [who(1, NEIGHBOR, [N0, 0, -3.9], [[0, "smug"]], { prop: "mug", reach: (t) => [{ ex: -18, ey: 0.5 - 0.18 * ez(t, 11.6, 12.0) * (1 - ez(t, 12.6, 13.0)), hx: 6 + 8 * ez(t, 11.6, 12.0) * (1 - ez(t, 12.6, 13.0)), hy: 0.52 - 0.5 * ez(t, 11.6, 12.0) * (1 - ez(t, 12.6, 13.0)), front: true }, undefined], look: -0.3 })];
    case 6: return [who(1, NEIGHBOR, [N0, 0, -3.9], [[0, "smug"], [13.4 - LEAD, "sideeye"]], { prop: "mug", reach: () => [{ ex: -18, ey: 0.5, hx: 6, hy: 0.52, front: true }, undefined], head: (t) => 7 * ez(t, 13.5, 13.9), look: 0.35 })];
    case 7: return [you([2.0, 0, -1.9], [[0, "confident"], [15.2 - LEAD, "grin"]], { prop: TURKEY1, reach: (t) => [{ ex: -22, ey: 0.6, hx: -6, hy: 0.95, front: true }, { ex: 24, ey: -0.05 - 0.1 * ez(t, 15.15, 15.45), hx: 22, hy: -0.55 - 0.1 * ez(t, 15.15, 15.45), front: true }], look: 0.5 }),
      who(1, NEIGHBOR, [N0, 0, -3.9], [[0, "sideeye"]], { prop: "mug", reach: () => [{ ex: -18, ey: 0.5, hx: 6, hy: 0.52, front: true }, undefined], look: -0.4 })];
    case 8: return [you([0, 0, 1.0], [[0, "grin"], [16.35 - LEAD, "concentrate"], [17.1 - LEAD, "lick"], [18.1 - LEAD, "smug"]], { prop: (t) => (t < 18.3 ? TURKEY2 : BARE), reach: (t) => (t < 18.3 ? HOLD(0.1, 22, 0.8 * Math.sin(t * 7), 0.95 * ez(t, 16.6, 18.1)) : MITTS_DOWN()), lookY: () => 0.45 })];
    case 9: return [you([0, 0, 0.15], [[0, "concentrate"], [19.3 - LEAD, "worried"]], { prop: BARE, reach: (t) => MITTS_UP(0.15 + 0.7 * ez(t, 18.95, 19.6)), lookY: () => 0.45 })];
    case 10: return [you([0, 0, 0], [[0, "worried"], [20.4 - LEAD, "nervous"]], { mode: "stroll", phase: (t) => -t * 1.2, path: (t) => L([0.35, 0, lerp(0.1, -0.45, ez(t, a, b))]), prop: BARE, reach: () => MITTS_UP(0.7), look: -0.2, lookY: () => 0.3 })];
    case 11: return [you([0, 0, 0], [[0, "scared"], [22.3 - LEAD, "shook"]], { mode: "stroll", phase: (t) => (t < 23.5 ? -t * 1.2 : 0), path: (t) => L([0.42, 0, lerp(1.8, 3.3, ez(t, a, 23.5))]), prop: BARE, reach: () => MITTS_UP(1), look: -0.3 })];
    case 12: { const d = (t: number) => ez(t, 25.1, 26.5);
      return [who(1, NEIGHBOR, [0, 0, 0], [[0, "smug"], [24.1 - LEAD, "shock"], [26.3 - LEAD, "sheepish"]], { mode: "stroll", phase: (t) => (t < 24.5 ? 0 : t * 1.4), path: (t) => (t > 26.55 ? null : L([lerp(N0, 3.5, d(t)), 0, t < 24.9 ? lerp(-3.9, -4.6, ez(t, 24.15, 24.9)) : lerp(-4.6, -7.4, d(t))])), prop: "mug", reach: () => [{ ex: -18, ey: 0.5, hx: 6, hy: 0.52, front: true }, undefined], look: 0.4 })]; }
    case 13: return [you([0, 0, 0], [[0, "worried"], [28.6 - LEAD, "shook"]], { mode: "stroll", phase: (t) => -t * 0.9, path: (t) => L([lerp(-0.85, -1.0, ez(t, a, b)), 0, lerp(1.6, 1.85, ez(t, a, b))]), prop: BARE, reach: () => MITTS_UP(0.8), look: 0.4, lookY: () => 0.2 })];
    case 14: return [you([-0.8, 0, 2.2], [[0, "shook"], [31.0 - LEAD, "scared"]], { prop: (t) => (t > 30.9 ? chairProp(false) : BARE), reach: (t) => (t > 30.9 ? SHIELD(ez(t, 31.0, 32.0)) : MITTS_UP(0.5)), look: 0.4 })];
    case 15: return [you([-1.0, 0, 1.9], [[0, "scared"], [33.25 - LEAD, "shock"]], { prop: chairProp(false), reach: () => SHIELD(1), look: 0.5, lookY: () => -0.2 })];
    case 16: return [you([S0 - 3.0, 0, 2.0], [[0, "shock"], [35.2 - LEAD, "scared"]], { prop: chairProp(false), reach: () => SHIELD(0.8), look: -0.2, lookY: () => -0.6 })];
    case 17: return [you([-0.9, 0, 2.0], [[0, "shock"], [37.9 - LEAD, "deadpan"]], { prop: chairProp(false), reach: () => SHIELD(1), lookY: () => 0.05 })];
    case 18: return [you([-0.9, 0, 2.0], [[0, "deadpan"], [40.7 - LEAD, "pained"]], { prop: (t) => chairProp(true, ez(t, 40.3, 41.3)), reach: (t) => SHIELD(1 - 0.9 * ez(t, 40.6, 41.6)), lookY: (t) => 0.7 * ez(t, 40.2, 40.7) })];
    case 19: return [you([0, 0, 2.0], [[0, "confused"], [42.75 - LEAD, "dazed"]], { prop: (t) => mittFlake(q(ez(t, 42.2, 43.5), 8)), reach: () => [{ ex: -22, ey: 0.45, hx: -4, hy: 0.55, front: true }, { ex: 22, ey: 0.4, hx: -22, hy: 0.38, front: true }], lookY: () => 0.4 })];
    case 20: return [you([0.5, 0, 1.7], [[0, "worried"], [45.3 - LEAD, "scared"]], { prop: BARE, reach: (t) => { const k = ez(t, 45.2, 45.6) * (1 - ez(t, 46.3, 46.7)); return [{ ex: -26, ey: 0.3 - 0.1 * k, hx: -40 - 14 * k, hy: 0.55 - 0.1 * k, front: true }, { ex: 22, ey: 0.7, hx: 4, hy: 1.0, front: true }]; }, look: -0.6, lookY: () => 0.2 })];
    case 21: return [you([0.5, 0, 1.7], [[0, "scared"], [48.9 - LEAD, "jawdrop"]], { prop: BARE, reach: () => [{ ex: -26, ey: 0.4, hx: -30, hy: 0.7, front: true }, { ex: 22, ey: 0.7, hx: 4, hy: 1.0, front: true }], look: -0.6, lookY: () => 0.1 })];
    case 22: return [you([-0.7, 0, 1.7], [[0, "pained"], [52.4 - LEAD, "deadpan"]], { prop: BARE, reach: (t) => [{ ex: -22, ey: 0.3, hx: 3, hy: 0.65, front: true }, { ex: 30, ey: 0.05 - 0.1 * ez(t, 51.3, 51.8), hx: 58, hy: 0.15 - 0.15 * ez(t, 51.3, 51.8), front: true }], look: 0.6, lookY: () => 0.3 })];
    case 23: return [you([S0 + 0.1, 0.16, 2.6], [[0, "sad"]], { mode: "sit", seat: 0.3, prop: BARE, reach: () => [{ ex: -22, ey: 0.75, hx: -6, hy: 1.35, front: true }, { ex: 22, ey: 0.75, hx: 6, hy: 1.35, front: true }], lookY: () => 0.2, look: 0.2 })];
    case 24: return [who(1, CAPTAIN, [S0 + 0.65, 0, 1.1], [[0, "stern"]], { prop: CLIP, reach: () => [{ ex: -24, ey: 0.45, hx: 2, hy: 0.45, front: true }, { ex: 24, ey: 0.45, hx: -10, hy: 0.4, front: true }], look: 0.0 }),
      you([S0 - 0.55, 0, 1.1], [[0, "embarrassed"], [60.5 - LEAD, "sad"]], { prop: BARE, reach: () => MITTS_DOWN(), lookY: (t) => 0.4 * ez(t, 59.5, 60.5), head: (t) => 6 * ez(t, 59.5, 60.5) })];
    case 25: { const give = 63.5, take = ez(a + 0, give, give + 0.4);
      return [who(1, CAPTAIN, [S0 + 0.55, 0, 1.1], [[0, "stern"]], { prop: (t) => (t < give + 0.2 ? LEAF : null), reach: (t) => [{ ex: -24, ey: 0.3, hx: -40 + 4 * ez(t, a, give), hy: 0.1 + 0.04 * ez(t, a, give), front: true }, undefined], look: -0.2 }),
        you([S0 - 0.55, 0, 1.1], [[0, "worried"], [give - LEAD, "pained"]], { prop: (t) => (t >= give + 0.2 ? LEAF_L : BARE), reach: (t) => [undefined, { ex: 24, ey: 0.5 - 0.35 * ez(t, a + 0.2, give), hx: 4 + 30 * ez(t, a + 0.2, give) - 0 * take, hy: 0.7 - 0.6 * ez(t, a + 0.2, give) + 0.3 * ez(t, give + 0.3, give + 0.9), front: true }], look: 0.4 })]; }
    case 26: return [you([S0 + 0.2, 0, 1.2], [[0, "worried"], [65.3 - LEAD, "squint"], [67.9 - LEAD, "deadpan"]], { prop: OPEN_LEAF, reach: () => [{ ex: -26, ey: 0.2, hx: -16, hy: -0.12, front: true }, { ex: 26, ey: 0.2, hx: 16, hy: -0.12, front: true }], lookY: (t) => 0.55 * (1 - ez(t, 66.2, 66.6)) + 0.1 })];
    case 27: return [you([0, 0, 0], [[0, "deadpan"]], { mode: "stroll", phase: (t) => t * 1.3, path: (t) => L([lerp(P0 - 3.1, P0 - 2.6, ez(t, a, b)), 0, lerp(1.0, -0.8, ez(t, a, b))]), prop: PLATE, reach: () => [undefined, { ex: 20, ey: 0.55, hx: -2, hy: 0.78, front: true }], look: 0.3 }),
      ...guests(0)];
    case 28: return [who(1, NEIGHBOR, [0, 0, 0], [[0, "smile"], [72.2 - LEAD, "proud"]], { mode: "stroll", phase: (t) => t * 1.2, path: (t) => L([lerp(P0 + 5.9, P0 + 7.5, ez(t, 71.2, 72.4)), 0, lerp(-9.6, -8.0, ez(t, 71.2, 72.6))]), prop: TRAY, reach: () => HOLD(0.1, 4), look: 0.1 })];
    case 29: { const land = 75.05;
      return [who(1, NEIGHBOR, [0, 0, 0], [[0, "proud"]], { mode: "stroll", phase: (t) => (t < land - 0.2 ? t * 1.2 : 0), path: (t) => L([lerp(P0 + 3.0, P0 - 0.3, ez(t, a, land - 0.2)), 0, -1.5]), prop: (t) => (t < land ? TRAY : BARE), reach: (t) => (t < land ? HOLD(0.1, 4) : [{ ex: -18, ey: 0.45, hx: -4, hy: 0.7, front: true }, { ex: 18, ey: 0.45, hx: 4, hy: 0.7, front: true }]) }),
        you([P0 - 3.0, 0, -1.5], [[0, "smile"], [75.3 - LEAD, "deadpan"]], { prop: PLATE, reach: (t) => [undefined, { ex: 20, ey: 0.55 - 0.35 * ez(t, 75.3, 75.8), hx: -2, hy: 0.78 - 0.9 * ez(t, 75.3, 75.8), front: true }], look: 0.3 }), ...guests(1, land)]; }
    case 30: return [you([S0 + 0.3, 0, -1.0], [[0, "deadpan"], [77.3 - LEAD, "sigh"]], { prop: PLATE, reach: () => [undefined, { ex: 20, ey: 0.55, hx: -2, hy: 0.78, front: true }], lookY: (t) => -0.85 * ez(t, 76.3, 76.9) })];
    default: return [];
  }
};
const guests = (clap: number, land = 0): Act[] => [
  who(1, GRANDMA, [P0 - 2.3, 0, -3.95], [[0, "smile"]], { mode: "sit", seat: 0.46, look: 0.1, ...(clap ? { reach: (t: number) => (t > land + 0.2 ? clapAt(t) : undefined) } : {}) }),
  who(2, TEEN, [P0 - 1.4, 0, -3.95], [[0, "bored"], ...(clap ? [[land + 0.2 - LEAD, "grin"] as [number, "grin"]] : [])], { mode: "sit", seat: 0.46, look: 0.1, ...(clap ? { reach: (t: number) => (t > land + 0.2 ? clapAt(t) : undefined) } : {}) }),
  who(3, RUNNER, [P0 - 0.5, 0, -3.95], [[0, "smile"]], { mode: "sit", seat: 0.46, look: -0.2, ...(clap ? { reach: (t: number) => (t > land + 0.2 ? clapAt(t) : undefined) } : {}) })];
const clapAt = (t: number): FrontOpts["reach"] => { const k = 0.5 + 0.5 * Math.sin(t * 17); return [{ ex: 6 - 4 * k, ey: 0.25, hx: 34 - 6 * k, hy: 0.2, front: true }, { ex: -6 + 4 * k, ey: 0.25, hx: -34 + 6 * k, hy: 0.2, front: true }]; };
export const acts = (id: number): Act[] => ACTS(id);

/** the mitt in shot 19: a frost flake on the palm that melts to a drop and rolls (drawn in the card with the hand). m 0..1 */
function mittFlake(m: number): Prop { return { k: `mittflake19|${m}`, draw: () => undefined, over: (p, h, u, e) => { mittsOver(p, h, u, e); const c = h[1]; if (!c) return; const g = p.g, [x, y] = c;
  if (m < 0.62) { const r = 15 * u * (1 - 0.8 * (m / 0.62)); g.save(); g.translate(x, y - 8 * u); g.strokeStyle = "#ffffff"; g.lineWidth = 3.2 * u; g.lineCap = "round";
    for (let i = 0; i < 3; i++) { const a = (i * Math.PI) / 3; g.beginPath(); g.moveTo(Math.cos(a) * r, Math.sin(a) * r); g.lineTo(-Math.cos(a) * r, -Math.sin(a) * r); g.stroke(); }
    g.strokeStyle = "#8fb6e0"; g.lineWidth = 1.2 * u; for (let i = 0; i < 3; i++) { const a = (i * Math.PI) / 3; g.beginPath(); g.moveTo(Math.cos(a) * r, Math.sin(a) * r); g.lineTo(-Math.cos(a) * r, -Math.sin(a) * r); g.stroke(); } g.restore();
  } else { const k = (m - 0.62) / 0.38, dy = -8 * u + 22 * u * k * k, dx = 3 * u * k; g.save(); g.beginPath(); g.ellipse(x + dx, y + dy, 4.4 * u, 5.6 * u, 0, 0, two); g.fillStyle = "#9fd0f5"; g.fill(); g.lineWidth = 1.6 * u; g.strokeStyle = INK; g.stroke();
    g.beginPath(); g.ellipse(x + dx - 1.4 * u, y + dy - 1.6 * u, 1.2 * u, 1.6 * u, 0, 0, two); g.fillStyle = "#ffffff"; g.fill(); g.restore(); } } }; }

// ---------------- fx ----------------
type FxO = Stage["fx"][number];
const add = (out: Stage, f: FxO) => { out.fx.push(f); };
/** the staged blast (ep13 look): lumps, soot, a flash card on the lens, a ground ring */
const fireball = (out: Stage, t: number, b: number, x0: number, y0: number, z0: number, big: number, seed: number, heat = 1) => { // heat < 1: lumps stay orange (no brown mid-shot)
  if (t < b) return;
  for (let i = 0; i < 11; i++) { const k = (t - b - i * 0.018) / (big > 1 ? 2.4 : 1.1 + 0.3 * sr(seed + i)); if (k < 0 || k >= 1) continue;
    const a = sr(seed + i + 40) * two, sp = (1.2 + 3.8 * sr(seed + i + 80)) * big, e = 1 - (1 - k) ** 3, u = q(k * heat, 16), s = i % 3;
    add(out, { key: `fb|${s}|${u}`, cw: 512, ch: 512, soft: true, draw: (p) => billow(p, u, s * 2.1), x: x0 + Math.cos(a) * sp * e, y: y0 + Math.abs(Math.sin(a)) * sp * e * 1.3 + 2.2 * big * k, z: z0 + i * 0.05, w: big * (3.0 + 5.2 * e), h: big * (3.0 + 5.2 * e) }); }
};
const sootCol = (out: Stage, t: number, t0: number, x0: number, z0: number, n: number, big: number) => {
  if (t < t0) return; const age = t - t0;
  for (let i = 0; i < n; i++) { const v = (age * 0.16 + i / n) % 1; if (age < (i / n) * 1.2) continue; const lit = q(Math.max(0, 1 - v * 3), 4), s = i % 3, w = big * (2.8 + 6 * v);
    add(out, { key: `soot|${s}|${lit}`, cw: 512, ch: 512, soft: true, draw: (p) => sootDraw(p, lit, s * 1.7), x: x0 + 1.6 * big * Math.sin(i * 2.4) * v, y: 1.6 + 14 * big * v, z: z0 - 0.3 - v * 0.5, w, h: w }); }
};
const flashCard = (out: Stage, id: number, t: number, b: number, dur = 0.34) => {
  const k = (t - b) / dur; if (k < 0 || k >= 1) return;
  const c = camAt(id, Math.round(t * 30)), f = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]], n = Math.hypot(f[0], f[1], f[2]), d = 1.2, h = 2 * d * Math.tan((c.fov * Math.PI) / 360) * 1.1, a = q(0.8 * (1 - k) ** 2, 12);
  add(out, { key: `flash|${a}`, cw: 64, ch: 64, soft: true, draw: (p) => { p.g.fillStyle = `rgba(255,190,110,${a})`; p.g.fillRect(0, 0, 64, 64); }, x: c.pos[0] + (f[0] / n) * d, y: c.pos[1] + (f[1] / n) * d, z: c.pos[2] + (f[2] / n) * d, w: h, h });
};
/** a black smoke ring round the top of the fireball (street, 16) */
const smokeRing = (out: Stage, t: number, b: number, x0: number, y0: number, z0: number) => {
  const k = (t - b) / 2.4; if (k < 0 || k >= 1) return; const u = q(k, 16), w = 5 + 8 * u;
  add(out, { key: `sring|${u}`, cw: 512, ch: 256, soft: true, draw: (p) => { const g = p.g; g.strokeStyle = `rgba(36,30,38,${(0.85 * (1 - u * u)).toFixed(3)})`; g.lineWidth = 36 - 18 * u; g.beginPath(); g.ellipse(256, 128, 220, 78, 0, 0, two); g.stroke(); }, x: x0, y: y0 + 7 * u * 1.4 + 4, z: z0 + 0.6, w, h: w * 0.5 });
};
const glowAt = (out: Stage, key: string, c: string, x: number, y: number, z: number, w: number, h = w, extra: Partial<FxO> = {}) => add(out, { key, cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, c), x, y, z, w, h, noFog: true, ...extra });
const steamAt = (out: Stage, t: number, x: number, z: number, n: number, size: number, t0: number) => {
  if (t < t0) return; for (let i = 0; i < n; i++) { const v = ((t - t0) * 0.5 + i / n) % 1, u = q(v, 10);
    add(out, { key: `steam|${u}`, cw: 300, ch: 300, soft: true, draw: (p) => smokePuff(p, u), x: x + 0.12 * Math.sin(i * 2.4 + v * 3), y: 0.95 + 1.1 * v * size, z: z - 0.45 - 0.03 * i, w: size * (0.5 + 0.9 * v), h: size * (0.5 + 0.9 * v) }); }
};
const NBW: V3 = [S0 - 16.1, 1.6, -4.5]; // the peek window
export const fx = (id: number, t: number, out: Stage) => {
  const T = (x: number) => X(x);
  // ---- backyard, before the fire (1..21)
  if (id <= 21) {
    const hot = t > BEATS.flame ? 1 : t > BEATS.oilout ? 0.4 : 0, n = Math.floor(t * 10) % 5, w = 0.5 + 0.35 * hot;
    if (t < BEATS.whoomp) add(out, { key: `flame|${q(hot, 4)}|${n}`, cw: 300, ch: 300, draw: flameDraw(hot, n), x: T(0), y: 0.19 + 0.1 * hot, z: 1.0, w, h: w });
    if (t < BEATS.whoomp) { add(out, { key: "oil", cw: 200, ch: 200, draw: oilDraw, x: T(0), y: 0.918, z: 1.0, w: 0.58, h: 0.58, flat: true });
      add(out, { key: "dial", cw: 200, ch: 200, draw: dialDraw, x: T(-0.34), y: 0.62, z: 1.28, w: 0.2, h: 0.2, face: [-0.7, 0, 0.7] });
      add(out, { key: "sticker", cw: 320, ch: 250, draw: (p) => stickerDraw(p.g, false), x: T(0.02), y: 0.6, z: 1.345, w: 0.3, h: 0.235, face: [0, 0, 1] }); }
    if (id !== 9 && t > BEATS.lower + 0.5 && t < BEATS.whoomp) steamAt(out, t, T(0), 1.0, t > 19 ? 7 : 4, t > BEATS.climbs ? 1.4 : t > 19 ? 1.1 : 0.8, BEATS.lower + 0.5);
    if (id >= 9 && t >= 18.4 && t < BEATS.whoomp) { const bob = 0.015 * Math.sin(t * 7) + (t > 21 ? 0.04 * ez(t, 21, 23) : 0);
      if (id === 9) add(out, { key: "tturkey", cw: 300, ch: 300, draw: (p) => drawTurkeyTop(p.g), x: T(0), y: 0.94, z: 1.0, w: 0.46, h: 0.46, flat: true });
      else if (id !== 20 && id !== 21 && id !== 12) add(out, { key: "tfz", cw: 300, ch: 300, draw: (p) => drawTurkey(p.g, "frozen"), x: T(0), y: 0.96 + bob, z: 0.98, w: 0.52, h: 0.52 }); }
    if (id >= 9 && t >= 18.9 && t < BEATS.whoomp) { const nb = Math.min(16, 4 + Math.floor(12 * ez(t, 18.9, 21.0)));
      for (let i = 0; i < nb; i++) { const ph = q((t * 2.6 + i * 0.37) % 1, 6), a = i * 2.4, d = 0.1 + 0.16 * sr(i + 3), r = 0.035 + 0.04 * sr(i + 9) * (0.5 + ph);
        if (ph > 0.88) continue; add(out, { key: "bub", cw: 64, ch: 64, soft: true, draw: bubbleDraw, x: T(Math.cos(a) * d), y: 0.935, z: 1.0 + Math.sin(a) * d, w: r * 2, h: r * 2, flat: true }); } }
    if (id >= 10 && t >= 19.97 && t < BEATS.whoomp) { const k = ez(t, 19.97, 22.9), over = ez(t, BEATS.climbs, 23.7), w = 0.6 + 0.1 * over, h = w * (0.2 + 0.25 * k + 0.12 * over);
      add(out, { key: "foam", cw: 300, ch: 160, draw: foamDraw(3), x: T(0), y: 0.905 + h * 0.35, z: 1.0, w, h: Math.max(0.04, h) }); }
    if (t > BEATS.oilout - 0.1 && t < BEATS.whoomp) { const k = ez(t, BEATS.oilout, 32.4), len = 0.55 * k;
      if (k > 0.01) { add(out, { key: "stream", cw: 40, ch: 200, draw: (p) => { const g = p.g; rr(g, 6, 0, 28, 200, 12, "#d9962a", INK, 4); rr(g, 12, 0, 8, 200, 4, "#ffd88a"); }, x: T(0.08), y: 0.9 - len / 2, z: 1.335, w: 0.075, h: len, face: [0, 0, 1] });
        if (k > 0.9) add(out, { key: "stream", cw: 40, ch: 200, draw: (p) => { const g = p.g; rr(g, 6, 0, 28, 200, 12, "#d9962a", INK, 4); rr(g, 12, 0, 8, 200, 4, "#ffd88a"); }, x: T(0.08), y: 0.3, z: 1.25, w: 0.045, h: 0.14, face: [0, 0, 1] }); } }
    if (id === 9) for (const sx of [-1, 1]) { const k = ez(t, 18.85, 19.7); add(out, { key: "mitttop", cw: 120, ch: 120, draw: (p) => { const g = p.g; ell(g, 60, 66, 34, 42, "#f2bd3a", 6); ell(g, 60 - 30 * -0, 20, 24, 14, "#f4f1ea", 5); }, x: T(sx * (0.5 + 0.25 * k)), y: 0.97, z: 1.0 + 0.45 + 0.3 * k, w: 0.2, h: 0.24, flat: true, rot: sx * 0.5 }); }
    if (id === 13) { for (const [i, t0] of [[0, 28.15], [1, 28.75]] as number[][]) { const d = t - t0; if (d < 0 || d > 0.42) continue;
      add(out, { key: "drop", cw: 64, ch: 96, draw: (p) => { const g = p.g; g.beginPath(); g.moveTo(32, 4); g.quadraticCurveTo(58, 52, 32, 88); g.quadraticCurveTo(6, 52, 32, 4); g.fillStyle = "#e8a22e"; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); ell(g, 24, 56, 5, 8, "#fff0b0"); },
        x: T(0.14 + 0.03 * i), y: 0.88 - 4.9 * d * d, z: 1.34, w: 0.07, h: 0.1 }); } }
    if (id === 3 || id === 1) for (let i = 0; i < 12; i++) { const v = ((t - a0(id)) * 0.7 + i / 12) % 1, u = q(v, 8); if (id === 1 && t > 1.6) break;
      add(out, { key: `flk|${u}`, cw: 40, ch: 40, soft: true, draw: (p) => { ell(p.g, 20, 20, 8, 8, `rgba(255,255,255,${(1 - u).toFixed(2)})`); }, x: T(0.4 + 0.5 * Math.sin(i * 2.1 + u * 3) + 0.3 * u), y: 1.25 - 0.9 * u + 0.05 * sr(i), z: 2.0 + 0.3 * Math.cos(i * 1.7), w: 0.04, h: 0.04 }); }
    if (id === 12 || (id >= 5 && id <= 7)) { /* the Neighbor's door */ }
    if (id === 12) { const k = ez(t, 26.5, 26.9), open = t < 26.5 ? 0 : 1; void open;
      if (t < 26.9) add(out, { key: `door|${q(k, 6)}`, cw: 105, ch: 210, draw: doorDraw(Math.max(0.12, k)), x: T(3.5), y: 1.05, z: -7.885, w: 1.05, h: 2.1, face: [0, 0, 1] });
      else add(out, { key: "lockglint", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, `rgba(255,236,170,${t < 27.15 ? 1 : 0.0})`), x: T(3.9), y: 1.0, z: -7.88, w: 0.35, h: 0.35, noFog: true }); }
  }
  // ---- the lawn chair standing in the yard until he grabs it
  if (id <= 14 && t < 30.9) add(out, { key: "chairfx", cw: 300, ch: 300, draw: chairFx, x: T(-1.55), y: 0.4, z: 1.5, w: 0.8, h: 0.8 });
  // ---- the fire: pot flame, flash, soot (14..21)
  if (id >= 14 && id <= 21) {
    if (id >= 15) { flashCard(out, id, t, 33.19); }
    if (t >= BEATS.whoomp) { fireball(out, t, 33.19, T(0), 1.0, 1.0, id === 15 ? 0.45 : 0.55, 5, id === 15 ? 0.6 : 1);
      if (id === 15) glowAt(out, "core15", "rgba(255,226,150,0.9)", T(0), 1.6, 1.2, 2.6);
      const bn = Math.floor(t * 9) % 5; add(out, { key: `pf|${bn}`, cw: 300, ch: 300, draw: flameDraw(0.3, bn), x: T(0), y: 1.18, z: 1.05, w: 1.1, h: 1.3 });
      sootCol(out, t, 33.4, T(0), 1.0, 8, 0.45); glowAt(out, "firewarm", "rgba(255,170,80,0.5)", T(0), 1.1, 1.3, 4.2); }
    if (id === 15 && t < 33.5) add(out, { key: "wh", cw: 300, ch: 300, draw: flameDraw(1, 2), x: T(0), y: 0.5, z: 1.1, w: 1.4, h: 1.4 });
    if (id >= 17 && id <= 18) for (let i = 0; i < 4; i++) { const v = ((t - 37.3) * 0.5 + i / 4) % 1; add(out, { key: "ember", cw: 48, ch: 48, soft: true, draw: (p) => { ell(p.g, 24, 24, 18, 18, "#ffd76a"); ell(p.g, 24, 24, 9, 9, "#fff6d0"); }, x: T(-0.9 + 0.6 * i - 0.4 * v), y: 1.3 + 1.6 * v, z: 2.4, w: 0.07, h: 0.07 }); }
    if (id === 18) for (let i = 0; i < 4; i++) { const v = ((t - 39.8) * 0.45 + i / 4) % 1, u = q(v, 10); add(out, { key: `csm|${u}`, cw: 300, ch: 300, soft: true, draw: (p) => smokePuff(p, u, true), x: T(-0.9 + 0.1 * i), y: 0.6 + 0.9 * v, z: 2.3, w: 0.3 + 0.4 * v, h: 0.3 + 0.4 * v }); }
    if (id === 19 && t > 42.1) { for (let i = 0; i < 3; i++) { const v = ((t - 42.0) * 0.5 + i / 3) % 1, u = q(v, 10); add(out, { key: `csm|${u}`, cw: 300, ch: 300, soft: true, draw: (p) => smokePuff(p, u, true), x: T(0.5 + 0.5 * i), y: 1.2 + 1.6 * v, z: 0.8, w: 0.9 + 1.2 * v, h: 0.9 + 1.2 * v }); } }
    if (id === 20 || id === 21) { const big = id === 21; add(out, { key: `stk${big}`, cw: 320, ch: 250, draw: (p) => stickerDraw(p.g, big), x: T(0.02), y: 0.6, z: 1.345, w: 0.3, h: 0.235, face: [0, 0, 1] });
      if (t > 20) steamAt(out, t, T(0), 1.0, big ? 9 : 4, big ? 2.4 : 1.3, 44.0); }
  }
  // ---- 16: the fireball at the garage, the Neighbor at his window
  if (id === 16) { const S = S0, b = 33.9;
    flashCard(out, id, t, b, 0.25);
    fireball(out, t, b, T(S - 8), 2.5, -13, 1.9, 11, 0.75); fireball(out, t, b + 1.1, T(S - 8), 3.5, -13.2, 1.7, 23, 0.7); sootCol(out, t, b + 0.8, T(S - 8), -13, 10, 1.1); smokeRing(out, t, b + 1.0, T(S - 8), 8.5, -13);
    glowAt(out, "gcore", "rgba(255,214,130,0.85)", T(S - 8), 5.5, -12.5, 9 * ez(t, b, b + 0.6), 11 * ez(t, b, b + 0.6));
    glowAt(out, "leadlit", "rgba(255,150,60,0.32)", T(S - 3.0), 1.1, 2.4, 2.6, 3.2); // the fire lights him
    glowAt(out, "gwarm", "rgba(255,150,70,0.45)", T(S - 8), 5, -12, 20);
    const fk = ez(t, 34.5, 35.4), ck = ez(t, 35.7, 36.4);
    add(out, { key: `peek|${q(fk * (1 - ck), 8)}|${q(ck, 8)}`, cw: 200, ch: 200, draw: peekDraw(fk * (1 - ck), ck), x: T(NBW[0]), y: NBW[1], z: NBW[2] + 0.14, w: 1.1, h: 1.05, face: [0, 0, 1] }); }
  // ---- 22: replay at the pot: the foam crown over the rim, oil pouring down every side into the burner, the flame flaring, steam
  if (id === 22) { const k = ez(t, 51.0, 52.2), n = Math.floor(t * 10) % 5, fl = ez(t, 52.0, 53.0);
    add(out, { key: "oil", cw: 200, ch: 200, draw: oilDraw, x: T(0), y: 0.918, z: 1.0, w: 0.58, h: 0.58, flat: true });
    add(out, { key: "foam", cw: 300, ch: 160, draw: foamDraw(3), x: T(0), y: 0.95, z: 1.0, w: 0.72, h: 0.22 });
    add(out, { key: "sticker", cw: 320, ch: 250, draw: (p) => stickerDraw(p.g, false), x: T(0.02), y: 0.6, z: 1.345, w: 0.3, h: 0.235, face: [0, 0, 1] });
    const sd = (p: Pen) => { const g = p.g; rr(g, 6, 0, 28, 200, 12, "#d9962a", INK, 4); rr(g, 12, 0, 8, 200, 4, "#ffd88a"); };
    for (const [dx, dl] of [[-0.2, 0], [0.09, 0.15], [0.24, 0.3]] as number[][]) { const kk = ez(t, 51.0 + dl, 52.0 + dl), len = 0.58 * kk; if (kk > 0.01) add(out, { key: "stream", cw: 40, ch: 200, draw: sd, x: T(dx), y: 0.9 - len / 2, z: 1.34 - 0.06 * Math.abs(dx) / 0.24, w: 0.07, h: len, face: [0, 0, 1] }); }
    for (const sx of [-1, 1]) { const len = 0.58 * k; if (k > 0.01) add(out, { key: "stream", cw: 40, ch: 200, draw: sd, x: T(sx * 0.33), y: 0.9 - len / 2, z: 1.0, w: 0.07, h: len }); }
    add(out, { key: `flame22|${q(fl, 4)}|${n}`, cw: 300, ch: 300, draw: flameDraw(fl, n), x: T(0), y: 0.19 + 0.25 * fl, z: 1.05, w: 0.55 + 0.5 * fl, h: 0.55 + 0.5 * fl });
    glowAt(out, "warm22", "rgba(255,170,80,0.45)", T(0), 0.5, 1.3, 1.2 + 1.2 * fl);
    steamAt(out, t, T(0), 1.0, 6, 1.3, 50.0); }
  // ---- the street at dusk: engine flashers + their washes, lamps, windows
  if (id >= 23 && id <= 26 || id === 30) {
    const red = Math.floor(t * 3.4) % 2 === 0, S = S0, c1 = "rgba(255,50,50,0.9)", c2 = "rgba(60,120,255,0.9)";
    if (id !== 30) { glowAt(out, red ? "fl-r" : "fl-b", red ? c1 : c2, T(S + 3.3), 3.0, 5.7, 2.4);
      glowAt(out, red ? "fl-b2" : "fl-r2", red ? c2 : c1, T(S + 3.3), 3.0, 7.1, 2.4);
      if (id === 23) { add(out, { key: red ? "rw" : "bw", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, red ? "rgba(255,50,50,0.7)" : "rgba(60,120,255,0.7)"), x: T(S + 0.5), y: 0.07, z: 3.8, w: 9, h: 3, flat: true, noFog: true });
        glowAt(out, red ? "wash-r" : "wash-b", red ? "rgba(255,50,50,0.5)" : "rgba(60,120,255,0.5)", T(S - 3), 3.5, 12.4, 14, 8, { face: [0, 0, -1] }); }
      else glowAt(out, red ? "wash-r" : "wash-b", red ? "rgba(255,50,50,0.55)" : "rgba(60,120,255,0.55)", T(S + 1.5), 2.5, -3.85, 12, 6, { face: [0, 0, 1] }); }
    for (const x of [-9, 9, 24]) { glowAt(out, "lampglow", "rgba(255,226,160,1)", T(S + x), 4.55, 2.4, 1.5); add(out, { key: "lamppool", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, "rgba(255,214,140,0.4)"), x: T(S + x), y: 0.075, z: 2.0, w: 6, h: 4.5, flat: true, noFog: true }); }
    glowAt(out, "lampglow", "rgba(255,226,160,1)", T(S - 6.35), 2.7, -3.0, 0.9); glowAt(out, "lampglow", "rgba(255,226,160,1)", T(S + 1.6), 2.45, -2.6, 0.8);
    add(out, { key: "lamppool", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, "rgba(255,214,140,0.45)"), x: T(S + 1.6), y: 0.43, z: -2.7, w: 3, h: 1.6, flat: true, noFog: true });
    for (const [x, y] of [[-1.4, 1.7], [4.2, 1.7]]) add(out, { key: "swin", cw: 200, ch: 200, draw: (p) => { const g = p.g, r = g.createLinearGradient(0, 0, 0, 200); r.addColorStop(0, "#ffe2a0"); r.addColorStop(1, "#f2b860"); g.fillStyle = r; g.fillRect(0, 0, 200, 200); g.fillStyle = "rgba(90,50,30,0.35)"; g.fillRect(96, 0, 8, 200); g.fillRect(0, 96, 200, 8); },
      x: T(S + x), y, z: -3.88, w: 1.3, h: 1.0, face: [0, 0, 1], noFog: true });
    if (id === 30 || id === 26) { // the scorch: a thin smoke thread from your yard behind the house
      for (let i = 0; i < 9; i++) { const v = ((t - 60) * 0.12 + i / 9) % 1, u = q(v, 10); add(out, { key: `thr|${u}`, cw: 300, ch: 300, soft: true, draw: (p) => smokePuff(p, u, true), x: T(S + 1.0 + 0.5 * Math.sin(v * 5)), y: 5.4 + 5.5 * v, z: -8.2, w: 0.5 + 0.6 * v, h: 0.5 + 0.6 * v }); } }
    if (id === 30) { add(out, { key: "rooft", cw: 600, ch: 600, draw: (p) => { p.g.scale(2, 2); drawTurkey(p.g, "char"); }, x: T(S + 0.9), y: 5.85, z: -7.85, w: 2.4, h: 2.4 });
      glowAt(out, "ember30", "rgba(255,120,40,0.55)", T(S + 0.9), 5.3, -7.95, 1.2); }
  }
  // ---- 27, 29: the Neighbor's porch at dusk
  if (id === 27 || id === 29 || id === 28) {
    const P = P0;
    if (id !== 28) { for (const [z, y0] of [[-1.2, 2.64], [-1.55, 2.56]] as number[][]) for (let i = 0; i <= 18; i += 1) glowAt(out, "bulbglow", "rgba(255,214,140,0.75)", T(P - 9 + i), y0 - 0.42 * Math.sin((i / 18) * Math.PI), z + 0.04, 0.55);
      add(out, { key: "tablepool", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, "rgba(255,206,130,0.5)"), x: T(P - 1.5), y: 0.07, z: -2.8, w: 10, h: 5, flat: true, noFog: true });
      add(out, { key: "tablepool2", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, "rgba(255,206,130,0.5)"), x: T(P - 1.5), y: 0.84, z: -3.0, w: 6.6, h: 1.6, flat: true, noFog: true });
      for (const [i, x] of [-4.1, -2.9, -1.7, -0.5, 0.7].entries()) add(out, { key: "plate", cw: 200, ch: 80, draw: (p) => { ell(p.g, 100, 40, 94, 34, "#fbfaf6", 6); ell(p.g, 100, 40, 62, 20, "#ece8de"); }, x: T(P + x), y: 0.84 + 0.002 * i, z: -3.0 + (i % 2 ? 0.2 : -0.2), w: 0.28, h: 0.11, flat: true });
      if (id === 29 && t > 75.0) add(out, { key: "roastfx", cw: 300, ch: 300, draw: (p) => drawTurkey(p.g, "roast"), x: T(P - 1.5), y: 1.1, z: -3.0, w: 0.9, h: 0.9 });
      if (id === 27) glowAt(out, "ge", "rgba(255,226,160,0.45)", T(P - 1.5), 1.6, -3.0, 9, 4); }
    if (id === 28) { glowAt(out, "pend", "rgba(255,226,160,0.9)", T(P + 7.5), 2.7, -8.5, 1.0); glowAt(out, "kwarm", "rgba(255,210,140,0.35)", T(P + 7.5), 1.6, -8.6, 7, 4);
      add(out, { key: "thawed", cw: 220, ch: 160, draw: (p) => { const g = p.g; rr(g, 6, 6, 208, 148, 6, "#fff6a8", INK, 6); text(g, "THAWED", 110, 60, 40, "#1d1a3a"); g.strokeStyle = "#2f8a55"; g.lineWidth = 12; g.lineCap = "round"; g.beginPath(); g.moveTo(66, 108); g.lineTo(96, 134); g.lineTo(156, 88); g.stroke(); },
        x: T(P + 9.7), y: 1.35, z: -10.3, w: 0.36, h: 0.26, face: [0, 0, 1] }); }
  }
};
const a0 = (id: number) => SHOTS[id - 1].a / 30;
