// What If ep20 acting + fx. Lead: the channel default (one curl, red varsity jacket, white tee, jeans). Held props are drawn inside the card
// between the arms and the hands (toon.ts episode Prop), so they move with the hands: the big cheque (both hands, torn into two halves, one per
// hand), the two-sided placard (flips), the gold pan, the empty bucket, the pointer stick, the ribbon, the Officer's stamp + paper and pocket linings.
// Flags, signs, the map, the barrel board, the ship, planes and the searchlight are fx cards. No brands.
import { Pen, Outfit, FrontOpts, INK, POSES, SKINS } from "../../toon";
import type { Prop } from "../../toon";
import { V3 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, q } from "../../act";
import { YOU, NEIGHBOR, TEEN, GRANDMA, RUNNER } from "../people";
import { SHOTS, BEATS, B0, C0, D0, E0, MAP, ez } from "./story";
import words from "./words";

const SO = SETS.alaska.origin;
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
const FUR = "#5e4c42";
const OFFICER: Outfit = { jacket: "#2f4a3a", pants: "#23262e", boots: "#1e1a1a", hat: null, build: "stout", top: "button", bottom: "jeans",
  layer: { kind: "jacket", color: "#2f4a3a", long: true }, shoe: "boot", moustache: "#3a2a20", skin: SKINS[0], belt: "#1e1a1a", buttons: "#e8c45a" };
const REDCOAT: Outfit = { jacket: "#b8302b", pants: "#2c3550", boots: "#1e1a1a", hat: "shako", build: "adult", top: "button", bottom: "jeans", shoe: "boot", skin: SKINS[1], belt: "#f4f1ea", buttons: "#e8c45a" };
const WORKER: Outfit = { ...RUNNER, jacket: "#5a6a7a", top: "sweater", pattern: undefined, num: undefined, bottom: "jeans", pants: "#2c3550", hat: "cap", cap: "#3b5b9a", shoe: "boot", boots: "#3a2f2a", acc: [] };
const WORKER2: Outfit = { ...NEIGHBOR, hat: "cap", cap: "#c63939", style: undefined };
export const CAST: [string, Outfit, Partial<FrontOpts>][] = [["You", YOU, { expr: "grin" }], ["Officer", OFFICER, { expr: "stern" }], ["Redcoat", REDCOAT, { expr: "stern" }],
  ["Worker", WORKER, { expr: "concentrate" }], ["Worker 2", WORKER2, { expr: "concentrate" }], ["Neighbor", NEIGHBOR, { expr: "smug" }], ["Grandma", GRANDMA, { expr: "laugh" }], ["Teen", TEEN, { expr: "laugh" }], ["Runner", RUNNER, { expr: "smile" }]];
const sec = (id: number) => [SHOTS[id - 1].a / 30, SHOTS[id - 1].b / 30];
const you = (at: V3, expr: Act["expr"], more: Partial<Act> = {}): Act => ({ i: 0, o: YOU, at: L(at), mode: "stand", expr, ...more });
const who = (i: number, o: Outfit, at: V3, expr: Act["expr"], more: Partial<Act> = {}): Act => ({ i, o, at: L(at), mode: "stand", expr, ...more });

// ---------------- hand poses ----------------
type R = FrontOpts["reach"];
/** both hands out to the sides of a flat held thing: up 0 = belly .. 2 = chin high; sp = outward reach */
const HOLD = (up = 1, sp = 30, wob = 0): R => { const hy = 0.72 - 0.22 * up, ey = 0.2 + 0.55 * hy;
  return [{ ex: -sp - 10, ey, hx: -sp - wob, hy, front: true }, { ex: sp + 10, ey, hx: sp + wob, hy, front: true }]; };
const DOWN: R = [{ ex: -22, ey: 0.7, hx: -6, hy: 1.15, front: true }, { ex: 22, ey: 0.7, hx: 6, hy: 1.15, front: true }];
const HIPS: R = POSES.hands_on_hips;
const SALUTE = (k = 1): R => [{ ex: -22, ey: 0.7, hx: -6, hy: 1.15, front: true }, { ex: 28, ey: lerp(0.6, -0.3, k), hx: lerp(8, -10, k), hy: lerp(1.1, -0.85, k), front: true }];
/** the stick hand (screen-left, index 0) raised toward the upper left; k 0 = down .. 1 = up */
const POINT_L = (k = 1, hy = -0.45): R => [{ ex: -30, ey: lerp(0.6, -0.05, k), hx: lerp(-8, -34, k), hy: lerp(1.1, hy, k), front: true }, { ex: 22, ey: 0.7, hx: 6, hy: 1.15, front: true }];

// ---------------- drawing helpers ----------------
const FONT = `"Segoe UI Black", "Arial Black", Arial, sans-serif`;
const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, col: string, weight = 900, align: CanvasTextAlign = "center", maxW?: number) => {
  g.save(); g.textAlign = align; g.textBaseline = "middle"; g.font = `${weight} ${px}px ${FONT}`; g.fillStyle = col;
  if (maxW) { const w = g.measureText(s).width; if (w > maxW) { g.translate(x, y); g.scale(maxW / w, 1); g.fillText(s, 0, 0); g.restore(); return; } }
  g.fillText(s, x, y); g.restore();
};
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string, lw = 0) => {
  g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); if (stroke) { g.lineWidth = lw; g.strokeStyle = stroke; g.stroke(); }
};
const ell = (g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string, lw = 0, rot = 0) => {
  g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, two); g.fillStyle = fill; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.stroke(); }
};
const poly = (g: CanvasRenderingContext2D, pts: number[][], fill: string | null, lw = 0, col = INK) => {
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = col; g.lineJoin = "round"; g.stroke(); }
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
const mid2 = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

// ---------------- the cheque (600 x 270): ONE design. The hands grip the side edges at mid height ----------------
const chequeDraw = (g: CanvasRenderingContext2D) => {
  rr(g, 0, 0, 600, 270, 10, "#f6efd6", INK, 9); rr(g, 16, 16, 568, 238, 6, "rgba(0,0,0,0)", "#3f7a5a", 6);
  text(g, "PAY TO RUSSIA", 300, 52, 34, "#3f7a5a");
  text(g, "$7,200,000", 300, 140, 112, "#1d1a3a", 900, "center", 556);
  g.fillStyle = "#3f7a5a"; g.fillRect(40, 196, 520, 5);
  text(g, "SITKA  1867", 300, 228, 30, "#3f7a5a");
};
const CHEQUE: Prop = { k: "cheque20", draw: (p, h, u) => { const a = h[0], b = h[1]; if (!a || !b) return;
  const w = Math.hypot(b[0] - a[0], b[1] - a[1]) + 16 * u;
  local(p, mid2(a, b), Math.max(-0.25, Math.min(0.25, Math.atan2(b[1] - a[1], b[0] - a[0]))), w / 600, (g) => { g.translate(-300, -150); chequeDraw(g); }); } }; // hands grip the side edges (user: dots covered the text)
/** cheque grip width: the hands sit on the cheque's side edges */
const CQ = 72;
/** the torn halves: the left half in the screen-left hand, the right half in the other, each gripped at its outer edge; a jagged tear at x 300 */
const tearEdge = (g: CanvasRenderingContext2D, left: boolean) => { g.beginPath(); if (left) { g.moveTo(-10, -10); for (let y = -10, i = 0; y <= 280; y += 22, i++) g.lineTo(300 + (i % 2 ? 14 : -10), y); g.lineTo(-10, 280); }
  else { g.moveTo(610, -10); for (let y = -10, i = 0; y <= 280; y += 22, i++) g.lineTo(300 + (i % 2 ? 14 : -10), y); g.lineTo(610, 280); } g.closePath(); };
const HALVES = (w0: number): Prop => ({ k: `halves20|${q(w0, 4)}`, draw: (p, h, u) => { const s = (215 * u) / 600;
  h.forEach((c, i) => { if (!c) return; const left = i === 0; local(p, c, (left ? -1 : 1) * (0.15 + 0.25 * w0), s, (g) => { g.translate(left ? -24 : -576, -150);
    g.save(); tearEdge(g, left); g.clip(); chequeDraw(g); g.restore(); g.save(); tearEdge(g, left); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); g.restore(); }); }); } });

// ---------------- the placard (440 x 300 board, two sides): flip 0..1 turns it about its vertical axis ----------------
const placardFace = (g: CanvasRenderingContext2D, top: string, bot: string, bg: string, fg: string) => {
  rr(g, 0, 0, 440, 300, 14, bg, INK, 10); text(g, top, 220, 92, 76, fg, 900, "center", 370); text(g, bot, 220, 196, 92, fg, 900, "center", 320); // the hands sit on the side edges at y 170: keep the letters inside
};
const SIDES: Record<string, [string, string, string, string]> = { icebox: ["SEWARD'S", "ICEBOX", "#f4f1ea", "#2f5a8a"], folly: ["SEWARD'S", "FOLLY", "#f4f1ea", "#c63939"], russia: ["RUSSIA'S", "FOLLY", "#ffd23a", "#1d1a3a"] };
const placardDraw = (g: CanvasRenderingContext2D, front: string, back: string, flip: number) => {
  const c = Math.cos(Math.PI * flip), side = c >= 0 ? front : back, [a, b, bg, fg] = SIDES[side];
  g.save(); g.translate(220, 0); g.scale(Math.max(0.04, Math.abs(c)), 1); g.translate(-220, 0); placardFace(g, a, b, bg, fg); g.restore();
};
const PLACARD = (front: string, back = front, flip = 0, lift = 150): Prop => ({ k: `plac20|${front}|${back}|${q(flip, 16)}|${lift}`, draw: (p, h, u) => { const a = h[0], b = h[1]; if (!a || !b) return;
  const span = Math.hypot(b[0] - a[0], b[1] - a[1]), w = Math.max(span + 20 * u, 200 * u);
  local(p, mid2(a, b), 0, w / 440, (g) => { g.translate(-220, -lift); placardDraw(g, front, back, flip); }); } });

// ---------------- the gold pan (300 x 170) with gravel, the nugget, the little flag on a pin ----------------
const ruFlag = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, lw = 4) => { for (const [i, c] of ["#f4f1ea", "#2f5aa8", "#c63939"].entries()) { g.fillStyle = c; g.fillRect(x, y + (i * h) / 3, w, h / 3 + 0.5); } g.lineWidth = lw; g.strokeStyle = INK; g.strokeRect(x, y, w, h); };
const panDraw = (g: CanvasRenderingContext2D, nug: number, flag: boolean) => {
  ell(g, 150, 95, 146, 62, "#5a5f6a", 8); ell(g, 150, 100, 118, 46, "#7a808c", 4); ell(g, 150, 108, 92, 32, "#8a7a62");
  for (let i = 0; i < 26; i++) ell(g, 80 + 140 * sr(i + 3), 96 + 26 * sr(i + 40), 4 + 4 * sr(i + 9), 3 + 3 * sr(i + 9), sr(i + 70) < 0.5 ? "#6a5a48" : "#a8967a");
  if (nug > 0) { const s = nug; g.save(); g.translate(150, 102); g.scale(s, s);
    poly(g, [[-34, 4], [-22, -22], [4, -30], [30, -16], [36, 8], [14, 24], [-18, 22]], "#f2c230", 6); poly(g, [[-18, -8], [-4, -20], [14, -14], [4, -2]], "#fff1a0");
    g.restore(); }
  if (flag) { g.lineCap = "round"; g.beginPath(); g.moveTo(176, 104); g.lineTo(176, 10); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); g.lineWidth = 3; g.strokeStyle = "#e8e4da"; g.stroke(); ruFlag(g, 178, 10, 70, 46, 4); }
};
/** both hands on the rim (kneeling panners, the Teen's close-up) */
const PAN2 = (nug = 1, flag = false): Prop => ({ k: `pan2|${nug}|${flag}`, draw: (p, h, u) => { const a = h[0], b = h[1]; if (!a || !b) return; const span = Math.hypot(b[0] - a[0], b[1] - a[1]), w = Math.max(span + 16 * u, 150 * u);
  local(p, mid2(a, b), 0, w / 300, (g) => { g.translate(-150, -95); panDraw(g, nug, flag); }); } });
/** one hand at the rim, hanging at the hip (he walks in with it) */
const PAN1: Prop = { k: "pan1", draw: (p, h, u) => { const c = h[0]; if (!c) return; local(p, c, -1.2, (120 * u) / 300, (g) => { g.translate(-10, -95); panDraw(g, 0, false); }); } };

// ---------------- the empty bucket (220 x 230), both hands on the rim, held out ----------------
const bucketDraw = (g: CanvasRenderingContext2D) => {
  g.lineCap = "round"; g.beginPath(); g.arc(110, 60, 92, Math.PI, 0); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); g.lineWidth = 4; g.strokeStyle = "#c9ccd4"; g.stroke();
  poly(g, [[14, 60], [206, 60], [180, 220], [40, 220]], "#9aa3ad", 8); ell(g, 110, 60, 96, 26, "#c9ccd4", 7); ell(g, 110, 62, 80, 18, "#2b2f3a");
  g.fillStyle = "rgba(255,255,255,0.35)"; g.fillRect(44, 90, 16, 110);
};
const BUCKET: Prop = { k: "bucket20", draw: (p, h, u) => { const a = h[0], b = h[1]; if (!a || !b) return; const span = Math.hypot(b[0] - a[0], b[1] - a[1]), w = Math.max(span + 10 * u, 120 * u);
  local(p, mid2(a, b), 0, w / 220, (g) => { g.translate(-110, -60); bucketDraw(g); }); } };

// ---------------- the pointer stick: from hand h[i] along ang (canvas radians, -PI/2 = up), len in u ----------------
const stickDraw = (g: CanvasRenderingContext2D, len: number) => { g.lineCap = "round"; g.beginPath(); g.moveTo(-14, 0); g.lineTo(len, 0); g.lineWidth = 15; g.strokeStyle = INK; g.stroke(); g.lineWidth = 8; g.strokeStyle = "#c9935a"; g.stroke();
  g.beginPath(); g.moveTo(len - 30, 0); g.lineTo(len, 0); g.lineWidth = 8; g.strokeStyle = "#f4f1ea"; g.stroke(); };
const STICK = (ang: number, len: number, hand = 0): Prop => ({ k: `stick20|${q(ang, 40)}|${Math.round(len)}|${hand}`, draw: (p, h, u) => { const c = h[hand]; if (!c) return; local(p, c, ang, u, (g) => stickDraw(g, len)); } });
/** a ruler stick across the body, gripped in both hands (shot 28) */
const RULER: Prop = { k: "ruler20", draw: (p, h, u) => { const a = h[0], b = h[1]; if (!a || !b) return; const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  local(p, a, ang, u, (g) => { g.translate(-260, 0); stickDraw(g, 260 + Math.hypot(b[0] - a[0], b[1] - a[1]) / u + 30); g.fillStyle = INK; for (let i = 0; i < 14; i++) g.fillRect(20 + i * 24, -6, 3, 6); }); } };

// ---------------- the ribbon rosette "No. 1" (160 x 220) ----------------
const ribbonDraw = (g: CanvasRenderingContext2D) => {
  poly(g, [[56, 100], [30, 214], [62, 196], [80, 218], [86, 110]], "#2f5aa8", 6); poly(g, [[104, 100], [130, 214], [98, 196], [80, 218], [74, 110]], "#2f5aa8", 6);
  for (let i = 0; i < 16; i++) { const a = (i / 16) * two; ell(g, 80 + Math.cos(a) * 54, 80 + Math.sin(a) * 54, 22, 22, "#3b6ac9", 5); }
  ell(g, 80, 80, 56, 56, "#ffd23a", 6); text(g, "No.1", 80, 82, 40, "#1d1a3a");
};
const RIBBON: Prop = { k: "ribbon20", draw: (p, h, u) => { const c = h[0]; if (!c) return; local(p, c, 0, (60 * u) / 160, (g) => { g.translate(-80, -60); ribbonDraw(g); }); } };

// ---------------- the Officer: stamp in the right hand (screen left), the paper in the left, NO SALE once stamped ----------------
const paperDraw = (g: CanvasRenderingContext2D, stamped: boolean) => {
  rr(g, 0, 0, 300, 380, 6, "#f6efd6", INK, 8); text(g, "SALE OF", 150, 50, 40, "#3a4256"); text(g, "ALASKA", 150, 98, 52, "#3a4256");
  g.fillStyle = "#c9c2ad"; for (let i = 0; i < 4; i++) g.fillRect(40, 140 + i * 26, 220, 6);
  if (stamped) { g.save(); g.translate(150, 280); g.rotate(-0.16); rr(g, -132, -58, 264, 116, 10, "rgba(0,0,0,0)", "#c63939", 10); text(g, "NO SALE", 0, 2, 66, "#c63939"); g.restore(); }
};
const stampDraw = (g: CanvasRenderingContext2D) => { ell(g, 60, 26, 26, 24, "#7a4b36", 6); rr(g, 50, 40, 20, 46, 6, "#9a6a46", INK, 5); rr(g, 14, 84, 92, 26, 6, "#3a2a22", INK, 6); rr(g, 18, 108, 84, 12, 3, "#c63939", INK, 4); };
const STAMP = (stamped: boolean): Prop => ({ k: `stamp20|${stamped}`, draw: (p, h, u) => { const a = h[0], b = h[1];
  if (b) local(p, b, -0.08, (95 * u) / 300, (g) => { g.translate(-40, -160); paperDraw(g, stamped); });
  if (a) local(p, a, 0, (45 * u) / 120, (g) => { g.translate(-60, -60); stampDraw(g); }); } });
/** the tall fur papakha, drawn OVER the head: its lower edge sits just above the brows and hides the whole crown (the Officer has no hair).
 * shortcut: stout BEAN build constants (crown = chest - 315 card px, head half width 118); breaks if the Officer changes build */
const papakhaDraw = (g: CanvasRenderingContext2D) => {
  const pts: number[][] = [];
  for (let i = 0; i <= 10; i++) pts.push([-128 + 256 * (i / 10), 64 + (i % 2 ? 9 : 0)]); // tufted lower edge, left to right
  for (let i = 0; i <= 7; i++) pts.push([132 + (i % 2 ? 8 : 0), 64 - i * 22]); // right side, up
  for (let i = 0; i <= 20; i++) { const a = Math.PI * (i / 20), b = i % 2 ? 9 : 0; pts.push([Math.cos(a) * (132 + b), -90 - Math.sin(a) * (50 + b)]); } // tufted top
  for (let i = 7; i >= 0; i--) pts.push([-132 - (i % 2 ? 8 : 0), 64 - i * 22]);
  poly(g, pts, FUR, 10);
  g.strokeStyle = "rgba(25,18,14,0.55)"; g.lineWidth = 7; g.lineCap = "round";
  for (let i = 0; i < 14; i++) { const x = -112 + (i % 7) * 37 + (i > 6 ? 18 : 0), y = -110 + (i > 6 ? 70 : 0) + 10 * (i % 2); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y + 10, x + 4, y + 24); g.stroke(); }
};
type ObjProp = Extract<Prop, { k: string }>;
/** any Officer prop + the fur hat. The prop layer is drawn before the head, so the hat is queued on the card canvas and drawn when
 * bodyFront finishes (its last statement assigns canvas.rig).
 * shortcut: hooks toon.ts' final `canvas.rig =` write; move to a proper toon.ts papakha hat when toon.ts is free to edit */
const OFF = (inner?: ObjProp): ObjProp => ({ k: `off20|${inner?.k ?? ""}`, draw: (p, h, u, c) => {
  const r = p.rot, cv = p.g.canvas as unknown as Record<string, unknown>;
  Object.defineProperty(cv, "rig", { configurable: true, set(v: unknown) {
    delete cv.rig; cv.rig = v; const r0 = p.rot; p.rot = r; local(p, [300, c[1] - 315], 0, 1, papakhaDraw); p.rot = r0; } });
  inner?.draw(p, h, u, c); }, over: inner?.over });
/** shot 9 "Russia is broke": lift the kiss-lock purse, turn it upside down, three shakes on "broke", three coppers drop and bounce once, then nothing */
const P9 = { lift: [20.35, 20.7], flip: [20.6, 20.95], shake: 20.99, per: 0.17, drops: [21.03, 21.2, 21.37], sad: 21.65 };
const shake9 = (t: number) => { const d = t - P9.shake; return d < 0 || d > 3 * P9.per ? 0 : 0.14 * Math.sin((d / P9.per) * two); };
const purseDraw = (g: CanvasRenderingContext2D, open: number) => { // hand at the origin, the frame on top (local -y)
  g.beginPath(); g.moveTo(-32, -58); g.bezierCurveTo(-52, -40, -50, -4, -22, 4); g.quadraticCurveTo(0, 10, 22, 4); g.bezierCurveTo(50, -4, 52, -40, 32, -58); g.closePath();
  g.fillStyle = "#9a5a3c"; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
  g.strokeStyle = "rgba(255,230,200,0.35)"; g.lineWidth = 5; g.beginPath(); g.moveTo(-30, -44); g.quadraticCurveTo(-38, -24, -24, -8); g.stroke(); // sheen
  const sp = 16 * open; // the frame halves spring apart, the mouth gapes
  if (open > 0) ell(g, 0, -60, 30, 4 + 9 * open, "#1d140f", 4);
  g.lineCap = "round";
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(-34, -58 + s * sp * 0.2); g.quadraticCurveTo(0, -70 + s * sp, 34, -58 + s * sp * 0.2);
    g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); g.lineWidth = 5; g.strokeStyle = "#e8c45a"; g.stroke(); if (!open) break; }
  ell(g, -6, -70 - 0.6 * sp, 5.5, 5.5, "#e8c45a", 3); ell(g, 6, -70 + 0.6 * sp, 5.5, 5.5, "#e8c45a", 3); // the two kiss-lock balls, one on each frame half
};
const coin = (g: CanvasRenderingContext2D, x: number, y: number, r: number, spin: number) => { const w = Math.max(0.25, Math.abs(Math.cos(spin)));
  ell(g, x, y, r * w, r, "#c8733a", 2.5); ell(g, x - r * 0.25 * w, y - r * 0.25, r * 0.35 * w, r * 0.35, "#f0b07a"); };
const PURSE = (t: number): ObjProp => ({ k: `purse20|${Math.round(t * 30)}`, draw: () => undefined, over: (p, h, u) => { const c = h[1]; if (!c) return;
  const flip = ez(t, P9.flip[0], P9.flip[1]), open = ez(t, P9.flip[1] - 0.1, P9.shake), AH = 94 * u;
  local(p, c, flip * Math.PI + 0.25 * shake9(t), u * 1.1, (g) => { purseDraw(g, open); ell(g, 0, 0, 7.3, 8.2, INK); ell(g, -5.2, -3.7, 4.2, 4.8, INK); }); // the fist on top
  local(p, [0, 0], 0, 1, (g) => P9.drops.forEach((t0, i) => { const d = t - t0; if (d < 0) return; // each copper: out of the mouth, falls, one bounce, rests
    const r = 6.5 * u, x0 = c[0] + (i - 1) * 6 * u, y0 = c[1] + (shake9(t0) - shake9(t)) * AH + 72 * u * 1.1, floor = 975 - r * 0.45, G = 4300, vx = [-55, 30, 80][i];
    const t1 = Math.sqrt((2 * (floor - y0)) / G), vb = 0.3 * G * t1, t2 = (2 * vb) / G;
    const x = x0 + vx * Math.min(d, t1 + t2); let y: number; const rest = d > t1 + t2;
    if (d < t1) y = y0 + 0.5 * G * d * d; else if (!rest) { const e = d - t1; y = floor - vb * e + 0.5 * G * e * e; } else y = floor;
    if (rest) ell(g, x, y, r, r * 0.4, "#c8733a", 2.5); else coin(g, x, y, r, d * 14 + i);
    }));
} });
/** the stamped sale paper gripped at its inner edge by the Officer's outer hand (shot 11) */
const PAPER: ObjProp = { k: "paper20", draw: (p, h, u) => { const a = h[0]; if (a) local(p, a, -0.06, (80 * u) / 300, (g) => { g.translate(-282, -190); paperDraw(g, true); }); } };
/** handshake reach (body units): the two hands meet between the two cards */
const HS = 44;
/** pockets turned out: a white lining hanging under each hand */
const POCKETS: Prop = { k: "pockets20", draw: () => undefined, over: (p, h, u) => { h.forEach((c, i) => { if (!c) return; local(p, c, (i ? -1 : 1) * 0.15, u, (g) => {
  poly(g, [[-14, -4], [14, -4], [16, 18], [6, 34], [-8, 32], [-16, 16]], "#f4f1ea", 4); g.strokeStyle = "rgba(29,26,58,0.35)"; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-4, 4); g.lineTo(-2, 26); g.stroke(); }); }); } };

// ---------------- flags, signs, the map ----------------
/** a waving flag (canvas 300 x 200): the cloth strips shift on a sine; ph 0..1 */
const wave = (g: CanvasRenderingContext2D, ph: number, paint: (g: CanvasRenderingContext2D) => void) => {
  const N = 60, w = 300 / N; for (let i = 0; i < N; i++) { const x = i * w, dy = 6 * Math.sin(two * ph + i * 0.07) * (i / N); g.save(); g.beginPath(); g.rect(x - 0.5, 10 + dy, w + 1.5, 180); g.clip(); g.translate(0, dy); paint(g); g.restore();
    g.fillStyle = `rgba(20,24,40,${(0.06 * (1 + Math.cos(two * ph + i * 0.07))).toFixed(3)})`; g.fillRect(x - 0.5, 10 + dy, w + 1.5, 180); } // 60 overlapping strips, soft shading: the 30-strip seams flickered (flicker_qa shot 30)
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); for (let i = 0; i <= N; i++) { const dy = 6 * Math.sin(two * ph + i * 0.07) * (i / N); i ? g.lineTo(i * w, 10 + dy) : g.moveTo(0, 10); } for (let i = N; i >= 0; i--) { const dy = 6 * Math.sin(two * ph + i * 0.07) * (i / N); g.lineTo(i * w, 190 + dy); } g.closePath(); g.stroke();
};
const RU = (g: CanvasRenderingContext2D) => { for (const [i, c] of ["#f4f1ea", "#2f5aa8", "#c63939"].entries()) { g.fillStyle = c; g.fillRect(0, 10 + i * 60, 300, 61); } };
const usFlag = (rows: number, cols: number) => (g: CanvasRenderingContext2D) => {
  for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? "#f4f1ea" : "#c63939"; g.fillRect(0, 10 + (i * 180) / 13, 300, 180 / 13 + 0.6); }
  const cw = 140, ch = (180 * 7) / 13; g.fillStyle = "#2f3f86"; g.fillRect(0, 10, cw, ch);
  g.fillStyle = "#ffffff"; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x = 11 + c * ((cw - 22) / (cols - 1)), y = 20 + r * ((ch - 20) / (rows - 1)); star(g, x, y, 5.2); }
};
const star = (g: CanvasRenderingContext2D, x: number, y: number, r: number) => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr2 = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } g.closePath(); g.fill(); };
type FxO = Stage["fx"][number];
const add = (out: Stage, f: FxO) => { out.fx.push(f); };
const flagAt = (out: Stage, kind: "ru" | "us" | "us49", t: number, x: number, y: number, z: number, w: number, speed = 1.1) => {
  const ph = q((t * speed * 0.35) % 1, 240), paint = kind === "ru" ? RU : kind === "us49" ? usFlag(7, 7) : usFlag(5, 6);
  add(out, { key: `flag|${kind}|${ph}`, cw: 300, ch: 200, draw: (p) => wave(p.g, ph, paint), x, y, z, w, h: (w * 2) / 3, face: [0, 0, 1] });
};
/** a sign board on two legs (canvas 400 x 300: board 400 x 200, legs below); lines = [text, px, colour] */
const signDraw = (lines: [string, number, string][], bg = "#f4f1ea") => (p: Pen) => { const g = p.g;
  for (const x of [80, 320]) rr(g, x - 9, 150, 18, 150, 4, "#4a3426", INK, 5);
  rr(g, 4, 4, 392, 192, 12, bg, INK, 8); const n = lines.length; lines.forEach(([s, px, col], i) => text(g, s, 200, 100 + (i - (n - 1) / 2) * (px * 1.05), px, col, 900, "center", 370)); };
const signAt = (out: Stage, key: string, lines: [string, number, string][], x: number, z: number, w: number, face: V3 = [0, 0, 1], y0 = 0) =>
  add(out, { key: `sign|${key}`, cw: 400, ch: 300, draw: signDraw(lines), x, y: y0 + (w * 0.75) / 2, z, w, h: w * 0.75, face });
const glowAt = (out: Stage, key: string, c: string, x: number, y: number, z: number, w: number, h = w, extra: Partial<FxO> = {}) => add(out, { key, cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, c), x, y, z, w, h, noFog: true, ...extra });

// the map (1200 x 740): simplified North America. alt = Russian Alaska touching Canada; real = Alaska + a Texas copy "2x TEXAS"
const AK = [[40, 150], [110, 95], [200, 80], [330, 70], [330, 300], [365, 320], [420, 370], [410, 388], [350, 342], [300, 322], [250, 332], [190, 322], [150, 347], [95, 362], [60, 332], [90, 302], [45, 272], [70, 232], [30, 200]];
const CA = [[330, 70], [440, 50], [520, 80], [600, 40], [700, 70], [780, 30], [880, 60], [960, 45], [1040, 100], [1100, 170], [1110, 240], [1070, 280], [1050, 330], [990, 360], [930, 345], [880, 385], [830, 350], [440, 350], [420, 370], [365, 320], [330, 300]];
const US = [[440, 350], [830, 350], [880, 385], [930, 345], [990, 360], [1010, 400], [985, 450], [960, 500], [930, 540], [950, 600], [935, 650], [905, 620], [880, 560], [820, 560], [760, 575], [720, 600], [700, 660], [660, 640], [620, 590], [580, 570], [520, 560], [470, 520], [430, 450], [420, 390]];
const TX = [[555, 470], [640, 470], [645, 515], [730, 525], [728, 592], [720, 600], [700, 660], [660, 640], [620, 590], [580, 570], [555, 545]];
const MX = [[520, 560], [580, 570], [620, 590], [660, 640], [700, 660], [720, 600], [760, 575], [800, 600], [790, 680], [750, 740], [560, 740], [500, 650], [470, 600], [470, 520]];
const SIB = [[0, 40], [34, 30], [62, 118], [28, 150], [0, 162]];
const BORDER = [[330, 70], [330, 300], [365, 320], [420, 370]];
export const mapXY = (cx: number, cy: number): [number, number] => [MAP.x + (cx / 1200 - 0.5) * MAP.w, MAP.y + (0.5 - cy / 740) * MAP.h];
const mapDraw = (mode: "alt" | "real", pulse: number, rib: boolean) => (p: Pen) => { const g = p.g;
  rr(g, 0, 0, 1200, 740, 0, "#a9d3ea"); g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 3; for (let x = 100; x < 1200; x += 100) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 740); g.stroke(); } for (let y = 100; y < 740; y += 100) { g.beginPath(); g.moveTo(0, y); g.lineTo(1200, y); g.stroke(); }
  const ru = "#d0453f", us = "#6d93cf";
  poly(g, SIB, mode === "alt" ? ru : "#cfc6b0", 5); poly(g, CA, "#efe6cc", 6); ell(g, 800, 190, 66, 78, "#a9d3ea", 5); poly(g, US, us, 6); poly(g, MX, "#d8c79a", 5);
  ell(g, 1160, 40, 70, 60, "#f4f1ea", 5);
  for (let i = 0; i < 6; i++) ell(g, 40 + i * 22, 392 + i * 3, 8, 5, mode === "alt" ? ru : us, 3);
  if (mode === "alt") { poly(g, AK, ru, 7); poly(g, TX, us, 5); }
  else { g.save(); g.shadowColor = "rgba(255,230,120,0.95)"; g.shadowBlur = 30 + 20 * pulse; poly(g, AK, us, 0); g.restore(); poly(g, AK, us, 8, "#ffd23a"); poly(g, AK, null, 4);
    poly(g, TX, "#f0a040", 5); // Texas at home
    g.save(); g.translate(-430, -45); poly(g, TX, "#f0a040", 6); text(g, "TEXAS", 642, 568, 30, "#1d1a3a"); g.restore(); }
  text(g, "CANADA", 690, 250, 70, "#5a4a30"); text(g, "USA", 690, 440, 76, "#ffffff");
  if (mode === "alt") { text(g, "RUSSIA", 185, 205, 60, "#ffffff");
    g.save(); g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); BORDER.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.lineWidth = 26 + 10 * pulse; g.strokeStyle = `rgba(255,214,60,${(0.55 + 0.4 * pulse).toFixed(2)})`; g.stroke(); g.lineWidth = 9; g.strokeStyle = "#1d1a3a"; g.setLineDash([22, 16]); g.stroke(); g.restore();
    if (rib) { g.save(); g.translate(560, 440); g.scale(0.9, 0.9); ribbonDraw(g); g.restore(); } }
  else { text(g, "ALASKA", 190, 200, 54, "#ffffff"); rr(g, 50, 640, 300, 84, 14, "#ffd23a", INK, 6); text(g, "2x TEXAS", 200, 683, 62, "#1d1a3a"); }
  g.lineWidth = 12; g.strokeStyle = "#5a4030"; g.strokeRect(6, 6, 1188, 728);
};

// ---------------- other fx draws ----------------
const shipDraw = (p: Pen) => { const g = p.g;
  for (const [x, h] of [[120, 250], [240, 280], [350, 220]]) { g.fillStyle = INK; g.fillRect(x - 5, 300 - h, 10, h); for (let k = 0; k < 3; k++) { const w = 90 - k * 18, y = 300 - h + 20 + k * 70; poly(g, [[x - w / 2, y], [x + w / 2, y], [x + w / 2 + 8, y + 60], [x - w / 2 - 8, y + 60]], "#f4f1ea", 5); } }
  poly(g, [[20, 300], [470, 300], [430, 370], [60, 370]], "#3a2a22", 7); g.fillStyle = "#e8c45a"; g.fillRect(60, 318, 380, 8);
  g.save(); g.translate(470, 230); g.scale(0.25, 0.25); usFlag(5, 6)(g); g.restore(); };
const scrapDraw = (p: Pen) => { const g = p.g; poly(g, [[6, 10], [52, 4], [58, 40], [30, 58], [4, 46]], "#f6efd6", 5); g.fillStyle = "#3f7a5a"; g.fillRect(14, 22, 30, 6); };
/** the jet (canvas 128 x 1024): a black column, thin at the derrick, a splashing crown on top, glossy streaks */
const jetDraw = (ph: number) => (p: Pen) => { const g = p.g, pts: number[][] = [];
  for (let i = 0; i <= 24; i++) { const y = 1024 - i * 38, wd = 20 + 30 * (i / 24) ** 2 + 4 * Math.sin(ph * two + i * 0.9); pts.push([64 - wd, Math.max(130, y)]); }
  for (let i = 0; i < 9; i++) pts.push([30 + i * 9, 130 - 70 * Math.abs(Math.sin(i * 1.3 + ph * two)) - 20]); // the crown
  for (let i = 24; i >= 0; i--) { const y = 1024 - i * 38, wd = 20 + 30 * (i / 24) ** 2 + 4 * Math.sin(ph * two + i * 0.9 + 2); pts.push([64 + wd, Math.max(130, y)]); }
  poly(g, pts, "#141218", 6);
  g.strokeStyle = "rgba(170,180,200,0.55)"; g.lineCap = "round"; g.lineWidth = 5; for (const x of [52, 70]) { g.beginPath(); g.moveTo(x, 1000); g.quadraticCurveTo(x - 6 + 10 * ph, 600, x + 4, 160); g.stroke(); }
};
const dropDraw = (p: Pen) => { const g = p.g; poly(g, [[32, 4], [50, 34], [52, 46], [44, 58], [32, 62], [20, 58], [12, 46], [14, 34]], "#141218", 4); ell(g, 26, 44, 5, 7, "rgba(190,200,220,0.8)"); };
const poolDraw = (p: Pen) => { const g = p.g; ell(g, 128, 128, 120, 110, "#141218", 6); ell(g, 96, 96, 44, 12, "rgba(160,170,190,0.45)", 0, -0.4); ell(g, 160, 160, 26, 7, "rgba(160,170,190,0.35)", 0, -0.4); };
const oilDraw = (p: Pen) => { const g = p.g, r = g.createRadialGradient(64, 64, 4, 64, 64, 64); r.addColorStop(0, "rgba(40,34,40,0.98)"); r.addColorStop(0.7, "rgba(22,18,24,0.95)"); r.addColorStop(1, "rgba(22,18,24,0)"); g.fillStyle = r; g.fillRect(0, 0, 128, 128); };
const planeDraw = (lit: boolean) => (p: Pen) => { const g = p.g;
  poly(g, [[10, 60], [150, 50], [190, 60], [150, 70]], "#c9ccd4", 5); poly(g, [[80, 56], [120, 10], [140, 10], [118, 58]], "#b4b9c4", 5); poly(g, [[80, 64], [120, 110], [140, 110], [118, 62]], "#b4b9c4", 5);
  poly(g, [[14, 58], [30, 30], [42, 30], [36, 58]], "#b4b9c4", 5); ruFlag(g, 96, 52, 16, 12, 2); ell(g, 160, 58, 10, 5, "#9fc3e8", 2);
  if (lit) { ell(g, 128, 12, 7, 7, "#ff4a4a"); ell(g, 128, 108, 7, 7, "#4aff7a"); } };
const starsDraw = (p: Pen) => { const g = p.g; for (let i = 0; i < 260; i++) { const x = 1024 * sr(i + 11), y = 400 * sr(i + 511), r = 1 + 2.4 * sr(i + 77) ** 3, a = (1 - y / 460) * (0.5 + 0.5 * sr(i + 3));
  g.fillStyle = `rgba(255,250,230,${a.toFixed(2)})`; g.beginPath(); g.arc(x, y, r, 0, two); g.fill(); } };
const pennantDraw = (p: Pen) => { const g = p.g; poly(g, [[4, 10], [296, 70], [4, 130]], "#c63939", 6); poly(g, [[4, 40], [180, 70], [4, 100]], "#f4f1ea"); text(g, "CANADA", 100, 71, 34, "#c63939"); };
const barrelBoard = (p: Pen) => { const g = p.g; rr(g, 4, 4, 552, 232, 14, "#ffd23a", INK, 9); text(g, "18,000,000,000", 280, 88, 92, "#1d1a3a", 900, "center", 520); text(g, "BARRELS", 280, 180, 70, "#c63939"); };
const armDraw = (p: Pen) => { const g = p.g; rr(g, 3, 3, 794, 34, 12, "#f4f1ea", INK, 6); for (let x = 40; x < 790; x += 110) { g.fillStyle = "#c63939"; g.fillRect(x, 7, 55, 26); } };
const postDraw = (p: Pen) => { const g = p.g; rr(g, 3, 3, 34, 434, 8, "#f4f1ea", INK, 6); for (const [i, c] of ["#f4f1ea", "#2f5aa8", "#c63939"].entries()) for (let y = 10 + i * 46; y < 430; y += 138) { g.fillStyle = c; g.fillRect(7, y, 26, 46); } };

// ---------------- acts ----------------
const ON_DOCK = 0.18, ON_BOX = 0.5;
const ACTS = (id: number): Act[] => {
  const [a, b] = sec(id);
  switch (id) {
    // ---- A: Sitka shore
    case 1: return [you([0, 0, 2.6], [[0, "proud"], [1.5 - LEAD, "smug"]], { prop: CHEQUE, reach: (t) => HOLD(0.2 + 0.15 * ez(t, 0.3, 1.6), CQ), lookY: () => -0.05 })];
    case 2: return [you([0, ON_DOCK, 5.5], [[0, "proud"]], { prop: CHEQUE, reach: () => HOLD(1.0, CQ) })];
    case 3: return [you([0, 0, 2.6], [[0, "smug"], [6.4 - LEAD, "grin"]], { prop: CHEQUE, reach: (t) => { const k = Math.max(ez(t, 6.0, 6.12) * (1 - ez(t, 6.14, 6.26)), ez(t, 6.45, 6.57) * (1 - ez(t, 6.59, 6.71))), r = HOLD(1.0, CQ)!; return [r[0], { ...r[1]!, hx: r[1]!.hx - 8 * k }]; }, lookY: () => 0.45 })];
    case 4: return [you([2.5, 0, 1.6], [[0, "confused"], [8.6 - LEAD, "embarrassed"]], { prop: CHEQUE, reach: () => HOLD(0.4, CQ), look: 0.6 }), ...crowd(true)];
    case 5: return [you([0.3, 0, 1.6], [[0, "confused"], [11.9 - LEAD, "disgusted"]], { prop: CHEQUE, reach: () => HOLD(0.2, CQ), look: -0.6, lookY: () => 0.35 }),
      who(1, NEIGHBOR, [-0.6, 0, 0.5], [[0, "smug"], [10.3 - LEAD, "laugh"]], { prop: PLACARD("icebox", "icebox", 0, 170), reach: () => HOLD(0.9, 34), look: 0.3 })];
    case 6: return [you([0.4, 0, 1.3], [[0, "disgusted"], [14.5 - LEAD, "sad"]], { prop: CHEQUE, reach: () => HOLD(0.0, CQ), look: -0.5, head: (t) => 6 * ez(t, 14.3, 14.9) }),
      who(1, NEIGHBOR, [-0.6, 0, 0.5], [[0, "laugh"]], { prop: (t) => PLACARD("icebox", "folly", ez(t, 12.8, 13.3), 170), reach: () => HOLD(0.9, 34), look: 0.3 }), ...crowd(false)];
    case 7: { const tt = BEATS.tear;
      return [you([0, 0, 2.6], [[0, "scheming"], [tt - LEAD, "grin"]], { prop: (t) => (t < tt + 0.05 ? CHEQUE : HALVES(ez(t, tt, tt + 0.5))), reach: (t) => { const k = ez(t, tt, tt + 0.35); return HOLD(1.0 + 0.3 * k, CQ + 30 * k, 1.5 * Math.sin(t * 30) * (1 - ez(t, tt - 0.6, tt))); } })]; }
    case 8: return [you([0, ON_DOCK, 6.0], [[0, "grin"], [19.0 - LEAD, "smug"]], { reach: () => HIPS })];
    case 9: return [you([-5.7, 0, -7.0], [[0, "neutral"], [21.2 - LEAD, "sideeye"]], { reach: (t) => (t > 21.1 ? POSES.shrug : HIPS), look: 0.4 }),
      who(1, OFFICER, [-4.7, 0, -8.1], [[0, "sheepish"], [21.0 - LEAD, "embarrassed"], [P9.sad - LEAD, "sad"]], { prop: (t) => OFF(PURSE(t)), look: -0.3, reach: (t) => {
        const k = ez(t, P9.lift[0], P9.lift[1]), sh = ez(t, P9.sad, P9.sad + 0.3), dn = sh * 0.2; // lift, shake, then the free hand shrugs
        return [{ ex: lerp(-26, -22, sh), ey: lerp(0.4, 0.15, sh), hx: lerp(-30, -36, sh), hy: lerp(0.7, -0.13, sh), front: true },
          { ex: 28, ey: lerp(0.5, 0.05, k), hx: lerp(14, 34, k), hy: lerp(0.9, -0.55, k) + shake9(t) + dn, front: true }]; } })];
    case 10: return [you([9.3, 0, 0.8], [[0, "worried"], [25.9 - LEAD, "scared"]], { reach: (t) => [undefined, { ex: 28, ey: lerp(0.5, -0.1, ez(t, 24.0, 24.4)), hx: lerp(4, 56, ez(t, 24.0, 24.4)), hy: lerp(1.0, -0.15, ez(t, 24.0, 24.4)), front: true }], look: 0.7 }),
      ...[0, 1, 2, 3, 4].map((i) => who(1 + i, REDCOAT, [26.4 + i * 1.5, 2.85 - 0.05 * Math.abs(i - 2) ** 2, -13.6], [[0, "stern"]], { look: -0.4 }))];
    case 11: { const st = BEATS.keeps;
      const k = (t: number) => ez(t, st - 0.6, st - 0.15), sh = (t: number) => 0.06 * Math.sin((t - st) * 22) * ez(t, st - 0.15, st) * (1 - ez(t, st + 0.9, st + 1.2));
      return [you([0.95, 0, 1.5], [[0, "worried"], [st + 0.1 - LEAD, "sad"]], { reach: (t) => [{ ex: -26, ey: lerp(0.7, 0.45, k(t)), hx: lerp(-6, -HS, k(t)), hy: lerp(1.15, 0.55, k(t)) + sh(t), front: true }, { ex: 22, ey: 0.7, hx: 6, hy: 1.15, front: true }], look: -0.5 }),
        who(1, OFFICER, [0.15, 0, 1.5], [[0, "stern"], [st + 0.2 - LEAD, "smug"]], { prop: OFF(PAPER), reach: (t) => [{ ex: -22, ey: 0.3, hx: -18, hy: 0.35, front: true }, { ex: 26, ey: lerp(0.7, 0.45, k(t)), hx: lerp(6, HS, k(t)), hy: lerp(1.15, 0.55, k(t)) + sh(t), front: true }] })]; }
    case 12: return [you([1.6, 0, -3.0], [[0, "sad"], [29.4 - LEAD, "sigh"]], { reach: () => DOWN, lookY: (t) => -0.8 * ez(t, 29.0, 29.6), look: 0.3 })];
    // ---- B: the gold creek
    case 13: return [you([0, 0, 0], [[0, "curious"]], { mode: "stroll", phase: (t) => t * 1.3, path: (t) => L([lerp(B0 - 3.0, B0 - 1.2, ez(t, a, b)), 0, -2.3]), prop: PAN1, reach: () => [{ ex: -22, ey: 0.65, hx: -14, hy: 1.1, front: true }, { ex: 22, ey: 0.7, hx: 6, hy: 1.15, front: true }], look: 0.4 }), ...panners(false)];
    case 14: return [you([B0 + 0.3, 0, -2.5], [[0, "curious"], [BEATS.gold - LEAD, "excited"]], { reach: () => HIPS, head: () => 6, lookY: () => 0.4 }), ...panners(true)];
    case 15: return [you([B0 + 0.75, 0, -2.4], [[0, "curious"], [BEATS.russian - LEAD, "shock"]], { reach: () => DOWN, lookY: () => 0.35 }),
      who(1, TEEN, [B0 + 0.12, 0, -1.15], [[0, "excited"]], { mode: "kneel", prop: PAN2(1.6, true), reach: () => HOLD(1.4, 30) })];
    case 16: return [you([B0 + 0.6, 0, 2.75], [[0, "deadpan"], [37.6 - LEAD, "sigh"]], { reach: () => [{ ex: -16, ey: 0.5, hx: 14, hy: 0.62, front: true }, { ex: 16, ey: 0.5, hx: -14, hy: 0.62, front: true }], look: -0.3 }), ...panners(true, true)];
    // ---- C: the oil tundra (golden)
    case 17: return [you([C0 - 3.4, 0, -0.9], [[0, "curious"], [BEATS.oil - LEAD, "jawdrop"]], { reach: (t) => (t > BEATS.oil ? POSES.hands_up : DOWN), lookY: () => -0.5, look: -0.3 })];
    case 18: return [you([0, 0, 0], [[0, "sad"]], { mode: "stroll", phase: (t) => t * 1.4, path: (t) => L([lerp(C0 - 1.8, C0 + 1.6, ez(t, a - 0.3, b + 0.3)), 0, -1.9]), reach: () => DOWN, look: 0.6 })];
    case 19: return [you([C0 + 1.9, 0, 0.3], [[0, "curious"], [42.75 - LEAD, "jawdrop"]], { reach: () => DOWN, lookY: () => -0.6, look: 0.5 })];
    case 20: return [you([C0 + 0.4, 0, 0.5], [[0, "puppy"], [BEATS.yours - LEAD, "sad"]], { prop: BUCKET, reach: () => HOLD(1.0, 26) }),
      who(1, OFFICER, [C0 + 1.6, 0, 0.1], [[0, "smug"]], { prop: OFF(), reach: (t) => [undefined, { ex: 26, ey: -0.2, hx: 30 + 10 * Math.sin(t * 10), hy: -0.63, front: true }], look: -0.6 })];
    // ---- D: the map clearing
    case 21: return [you([D0 - 0.6, ON_BOX, -3.3], [[0, "confident"]], { prop: STICK(-2.35, 330), reach: (t) => POINT_L(ez(t, a, a + 0.5)), look: -0.5, lookY: () => -0.3 })];
    case 22: return [you([D0 - 0.6, ON_BOX, -3.3], [[0, "concentrate"], [BEATS.touches - LEAD, "worried"]], { prop: (t) => STICK(-1.85 - 0.15 * ez(t, a, b), 470), reach: () => POINT_L(1, -0.5), look: -0.6, lookY: () => -0.4 })];
    case 23: { const k = (t: number) => ez(t, BEATS.post - 0.3, 51.2);
      return [you([D0 + 3.5, 0, 0.6], [[0, "worried"], [51.3 - LEAD, "sad"]], { reach: () => DOWN, look: 0.6 }),
        who(1, WORKER, [D0 + 4.2, 0, -0.55], [[0, "concentrate"]], { reach: (t) => [{ ex: -24, ey: lerp(-0.3, 0.3, k(t)), hx: lerp(-20, -44, k(t)), hy: lerp(-0.8, 0.0, k(t)), front: true }, { ex: 24, ey: lerp(-0.3, 0.3, k(t)), hx: lerp(-2, -30, k(t)), hy: lerp(-0.7, 0.05, k(t)), front: true }], look: -0.5 }),
        who(2, WORKER2, [D0 + 6.9, 0, -0.3], [[0, "concentrate"], [51.0 - LEAD, "proud"]], { reach: (t) => { const u = ez(t, a + 0.2, 50.6); return [{ ex: -26, ey: 0.1, hx: lerp(-50, -34, u), hy: lerp(0.2, -0.4, u), front: true }, { ex: 26, ey: 0.1, hx: lerp(-10, -14, u), hy: lerp(0.3, -0.2, u), front: true }]; }, look: -0.4 })]; }
    // ---- E: the border at night
    case 24: return [you([E0 + 1.5, 0, 0.6], [[0, "squint"], [53.8 - LEAD, "worried"]], { reach: () => SALUTE(1), look: -0.3 })];
    case 25: return [you([E0 + 1.5, 0, 0.5], [[0, "worried"], [BEATS.planes - LEAD, "scared"]], { reach: () => DOWN, lookY: (t) => -0.9 * ez(t, 55.0, 55.5), look: -0.2 })];
    case 26: return [you([E0 - 2.2, 0, 1.9], [[0, "scared"], [59.0 - LEAD, "nervous"]], { reach: () => [{ ex: -12, ey: 0.3, hx: 30, hy: -0.15, front: true }, { ex: 12, ey: 0.3, hx: -30, hy: -0.12, front: true }], lookY: () => -0.25 })];
    // ---- D again: the real map, then the alt one
    case 27: return [you([D0 - 1.05, 0, -3.5], [[0, "confident"], [61.4 - LEAD, "proud"]], { prop: STICK(-1.95, 520), reach: () => POINT_L(1, -0.45), look: -0.6, lookY: () => -0.2 })];
    case 28: return [you([D0 - 1.25, 0, -3.5], [[0, "concentrate"], [BEATS.texas - LEAD, "smug"]], { prop: RULER, reach: () => [{ ex: -30, ey: 0.3, hx: -46, hy: 0.15, front: true }, { ex: 26, ey: 0.35, hx: -6, hy: 0.2, front: true }], look: -0.6 })];
    case 29: { const pin = 65.3;
      return [you([D0 + 0.55, 0, -3.6], [[0, "confident"], [pin - LEAD, "grin"]], { prop: (t) => (t < pin ? RIBBON : null), reach: (t) => { const k = ez(t, a + 0.2, pin); return [{ ex: -30, ey: lerp(0.5, 0.1, k), hx: lerp(-10, -48, k), hy: lerp(0.9, 0.15, k), front: true }, { ex: 22, ey: 0.7, hx: 6, hy: 1.15, front: true }]; }, look: -0.5 })]; }
    case 30: return [you([D0 - 5.0, 0, -1.6], [[0, "proud"], [BEATS.stars - LEAD, "proud_chin"]], { reach: (t) => SALUTE(ez(t, 67.0, 67.5)), lookY: () => -0.6, look: -0.3 })];
    // ---- A again
    case 31: return [you([0, 0, 2.6], [[0, "smirk_wink"], [70.4 - LEAD, "smug"]], { prop: (t) => PLACARD("folly", "russia", ez(t, BEATS.flip - 0.25, BEATS.flip + 0.35), 170), reach: () => HOLD(0.9, 34) })];
    case 32: return [you([0, ON_DOCK, 5.5], [[0, "smug"]], { prop: CHEQUE, reach: (t) => HOLD(1.0 + 0.4 * ez(t, 72.2, 72.8), CQ) })];
    default: return [];
  }
};
/** the laughing crowd by the news stand (4, 6): Grandma with a paper, the Teen, the Runner */
const crowd = (laugh: boolean): Act[] => [
  who(2, GRANDMA, [4.2, 0, 0.9], [[0, laugh ? "smile" : "laugh"], ...(laugh ? [[BEATS.laugh - LEAD, "laugh"] as [number, "laugh"]] : [])], { prop: "paper", look: -0.4, head: (t) => (laugh ? 4 * Math.sin(t * 14) : 0) }),
  who(3, TEEN, [4.9, 0, 1.3], [[0, laugh ? "smile" : "laugh"], ...(laugh ? [[BEATS.laugh - LEAD, "laugh"] as [number, "laugh"]] : [])], { reach: () => POSES.cover_mouth, look: -0.5 }),
  who(4, RUNNER, [5.6, 0, 0.7], [[0, "laugh"]], { reach: (t) => [{ ex: -14, ey: 0.4, hx: 26, hy: 0.55, front: true }, undefined], look: -0.5, head: (t) => 5 * Math.sin(t * 12) })];
/** the three panners kneeling on the north bank (13, 14, 16); gold = the nuggets show */
const panners = (gold: boolean, dig = false): Act[] => [
  who(1, TEEN, [B0 - 0.95, 0, -1.15], [[0, "concentrate"], ...(gold && !dig ? [[BEATS.gold - LEAD, "excited"] as [number, "excited"]] : [])], { mode: "kneel", prop: PAN2(gold ? 0.9 : 0), reach: (t) => HOLD(1.2, 26, dig ? 0 : 2 * Math.sin(t * 9)) }),
  who(2, RUNNER, [B0 + 0.05, 0, -1.2], [[0, "concentrate"], ...(gold && !dig ? [[BEATS.gold - LEAD, "excited"] as [number, "excited"]] : [])], { mode: "kneel", prop: PAN2(gold ? 1.3 : 0), reach: (t) => HOLD(1.3, 26, dig ? 0 : 2 * Math.sin(t * 8 + 1)) }),
  who(3, NEIGHBOR, [B0 + 1.05, 0, -1.15], [[0, "concentrate"], ...(gold && !dig ? [[BEATS.gold + 0.2 - LEAD, "laugh"] as [number, "laugh"]] : [])], { mode: "kneel", prop: PAN2(gold ? 0.8 : 0), reach: (t) => HOLD(1.2, 26, dig ? 0 : 2 * Math.sin(t * 10 + 2)) })];
export const acts = (id: number): Act[] => ACTS(id);

// ---------------- fx ----------------
export const fx = (id: number, t: number, out: Stage) => {
  const T = X;
  // ---- A: Sitka shore (1-12, 31, 32)
  if (id <= 12 || id >= 31) {
    flagAt(out, id === 32 ? "us" : "ru", t, T(3.8), 8.35, -6, 1.5, id === 12 && t > BEATS.flag ? 1.8 : 1.0);
    if (id === 1) signAt(out, "sitka", [["SITKA", 70, "#1d1a3a"], ["18 OCT 1867", 40, "#3a4256"], ["2 CENTS AN ACRE", 40, "#c63939"]], T(-0.75), 3.4, 1.0, [0, 0, -1]);
    if (id >= 4 && id <= 6) add(out, { key: "news", cw: 360, ch: 300, draw: (p) => { const g = p.g; rr(g, 4, 4, 352, 292, 8, "#f6efd6", INK, 8); text(g, "THE DAILY NEWS", 180, 40, 30, "#3a4256");
      g.fillStyle = "#3a4256"; g.fillRect(20, 64, 320, 5); text(g, "SEWARD'S", 180, 124, 64, "#1d1a3a", 900, "center", 320); text(g, "ICEBOX!", 180, 196, 70, "#c63939", 900, "center", 320); g.fillStyle = "#c9c2ad"; for (let i = 0; i < 3; i++) g.fillRect(30, 240 + i * 16, 300, 6); },
      x: T(3.4), y: 0.8, z: 0.16, w: 1.1, h: 0.92, face: [0, 0, 1] });
    if (id === 7) for (let i = 0; i < 8; i++) { const d = t - BEATS.tear - 0.05 - 0.04 * i; if (d < 0) continue; const s = i % 2 ? 1 : -1;
      add(out, { key: "scrap", cw: 64, ch: 64, draw: scrapDraw, x: T(s * (0.15 + 0.5 * d * (0.6 + sr(i)))), y: 1.25 + 1.2 * d * sr(i + 5) - 1.2 * d * d, z: 2.5 - 0.3 * d, w: 0.07, h: 0.07, rot: d * 8 * s + i }); }
    if (id === 8) { for (let i = 0; i < 14; i++) { const d = t - 17.05 + 0.6 + i * 0.15, s = sr(i) - 0.5;
        add(out, { key: "scrap", cw: 64, ch: 64, draw: scrapDraw, x: T(s * 3 + d * 0.8 * s), y: 1.6 + 1.5 * d * sr(i + 9) + 0.3 * Math.sin(d * 3 + i), z: 6.5 + 3.2 * d + 2 * sr(i + 4), w: 0.4, h: 0.4, rot: d * 4 + i }); }
      const k = ez(t, 17.3, 20.3); add(out, { key: "ship", cw: 512, ch: 400, draw: shipDraw, x: T(lerp(-4, 2, k)), y: 2.6, z: lerp(24, 46, k), w: lerp(8, 6.5, k), h: lerp(6.25, 5.1, k) }); }
    if (id === 32) add(out, { key: "plac32", cw: 440, ch: 300, draw: (p) => placardFace(p.g, "RUSSIA'S", "FOLLY", "#ffd23a", "#1d1a3a"), x: T(0.75), y: 0.42, z: 5.75, w: 0.62, h: 0.42, face: [0, 0.45, 1] });
    if (id === 10) signAt(out, "canada", [["CANADA", 96, "#c63939"]], T(24.6), -12.6, 2.6, [-0.4, 0, 1], 2.75);
    if (id === 10) add(out, { key: "ukflag", cw: 300, ch: 200, draw: (p) => wave(p.g, q((t * 1.1) % 1, 12), (g) => { g.fillStyle = "#c63939"; g.fillRect(0, 10, 300, 180); g.fillStyle = "#2f3f86"; g.fillRect(0, 10, 140, 90); g.strokeStyle = "#f4f1ea"; g.lineWidth = 14; g.beginPath(); g.moveTo(70, 10); g.lineTo(70, 100); g.moveTo(0, 55); g.lineTo(140, 55); g.stroke(); }),
      x: T(29.8), y: 5.2, z: -13.8, w: 1.5, h: 1.0, face: [-0.4, 0, 1] });
  }
  // ---- B: the creek
  if (id >= 13 && id <= 16) {
    add(out, { key: "s1898", cw: 400, ch: 220, draw: (p) => { const g = p.g; rr(g, 4, 4, 392, 212, 12, "#f6efd6", INK, 9); text(g, "1898", 200, 112, 150, "#1d1a3a"); }, x: T(B0 - 2.6), y: 2.0, z: 1.5, w: 1.1, h: 0.6, face: [-0.3, 0, 1] });
    add(out, { key: "claim", cw: 400, ch: 220, draw: (p) => { const g = p.g; rr(g, 4, 4, 392, 212, 10, "#f6efd6", INK, 9); ruFlag(g, 24, 40, 100, 66, 5); text(g, "CLAIM", 250, 76, 84, "#c63939", 900, "center", 250); text(g, "KEEP OUT", 200, 168, 56, "#1d1a3a"); },
      x: T(B0 - 1.9), y: 0.68, z: 2.55, w: 0.95, h: 0.52, face: [0, 0, 1] });
    if (id === 14) { const k = t - BEATS.gold; if (k > 0 && k < 0.5) glowAt(out, "glint", `rgba(255,236,150,${(0.9 * (1 - k / 0.5)).toFixed(2)})`, T(B0 + 0.05), 0.75, -0.9, 0.5 * (1 - k)); }
    if (id === 15) { const k = t - BEATS.russian; if (k > 0 && k < 0.18) glowAt(out, "glint", "rgba(255,240,170,0.8)", T(B0 + 0.12), 0.7, -0.95, 0.25); }
  }
  // ---- C: the oil tundra
  if (id >= 17 && id <= 20) {
    const dx = T(C0 - 6), dz = -9;
    add(out, { key: "bboard", cw: 560, ch: 240, draw: (p) => barrelBoard(p), x: T(C0 + 3), y: 3.98, z: -1.05, w: 2.3, h: 0.99, face: [0, 0, 1] });
    add(out, { key: "pool", cw: 256, ch: 256, draw: poolDraw, x: dx, y: 0.04, z: dz + 1, w: 7, h: 5, flat: true });
    if (id === 17 || id === 18) { const g0 = id === 17 ? Math.max(0, t - BEATS.oil + 0.3) : 2, k = Math.min(1, g0 * 1.6), H = 0.5 + 16.5 * k, ph = q((t * 1.5) % 1, 12);
      if (g0 > 0) { add(out, { key: `jet|${ph}`, cw: 128, ch: 1024, draw: jetDraw(ph), x: dx, y: H / 2, z: dz + 0.2, w: 3.0, h: H, noFog: true });
        for (let i = 0; i < 26; i++) { const v = (t * 0.55 + i / 26) % 1, top = H, sx = (sr(i) - 0.5) * 3.6, sz = (sr(i + 5) - 0.5) * 2, y = top + 1.2 * v - (top + 1.2) * v * v; // up off the crown, falling back to the snow
          if (k < 0.9 || y < 0) continue; add(out, { key: "drop", cw: 64, ch: 64, draw: dropDraw, x: dx + sx * v, y, z: dz + 0.5 + sz * v, w: 0.6, h: 0.75, noFog: true }); } } }
  }
  // ---- D: the map clearing (21-23, 27-30)
  if ((id >= 21 && id <= 23) || (id >= 27 && id <= 30)) {
    const real = id === 27 || id === 28, pulse = q(0.5 + 0.5 * Math.sin(t * 6), 6), rib = id === 29 && t >= 65.3 || id === 30;
    add(out, { key: `map|${real}|${pulse}|${rib}`, cw: 1200, ch: 740, draw: mapDraw(real ? "real" : "alt", pulse, rib), x: T(MAP.x), y: MAP.y, z: MAP.z, w: MAP.w, h: MAP.h, face: [0, 0, 1] });
    flagAt(out, "us49", t, T(D0 - 4.75), 8.1, -2.5, 2.4, 0.9);
    // the border arm (hinge on the post top, x +5) and the striped boundary post the second worker stands up (23)
    const up = id === 23 ? 1 - ez(t, BEATS.post - 0.3, 51.2) : id < 23 ? 1 : 0, a = (Math.PI / 2) * up * 0.95, hx = T(D0 + 5), hy = 1.05;
    add(out, { key: "arm", cw: 800, ch: 40, draw: armDraw, x: hx - 2 * Math.cos(a), y: hy + 2 * Math.sin(a), z: -0.82, w: 4, h: 0.2, face: [0, 0, 1], rot: -a });
    const tl = id === 23 ? 0.9 * (1 - ez(t, a0(23) + 0.2, 50.6)) : id < 23 ? 0.9 : 0, fx0 = T(D0 + 6.3);
    add(out, { key: "bpost", cw: 40, ch: 440, draw: postDraw, x: fx0 + 1.1 * Math.sin(tl), y: 1.1 * Math.cos(tl), z: -0.5, w: 0.2, h: 2.2, face: [0, 0, 1], rot: -tl });
  }
  // ---- E: the border at night (24-26)
  if (id >= 24 && id <= 26) {
    const E = E0; add(out, { key: "stars", cw: 1024, ch: 460, soft: true, draw: starsDraw, x: T(E), y: 150, z: -260, w: 560, h: 250, noFog: true, face: [0, 0, 1] });
    add(out, { key: "arm", cw: 800, ch: 40, draw: armDraw, x: T(E + 3), y: 1.05, z: -0.82, w: 4, h: 0.2, face: [0, 0, 1] });
    signAt(out, "cold", [["COLD WAR", 72, "#1d1a3a"], ["1950", 64, "#c63939"]], T(E + 2.7), 1.5, 1.3);
    add(out, { key: "pennant", cw: 300, ch: 140, draw: pennantDraw, x: T(E - 2.25), y: 3.85, z: 1.6, w: 1.5, h: 0.7, face: [0, 0, 1] });
    glowAt(out, "hutwin", "rgba(255,214,140,0.8)", T(E + 9), 1.4, -2.2, 1.2);
    // searchlight: lamp glow on the tower + a beam card to a pool sweeping the snow
    const sw = Math.sin(t * 0.9), px = T(E + 1 + 4 * sw), pz = 1.0 + 1.0 * Math.cos(t * 0.9), lx = T(E - 6.4), ly = 6.6, lz = -4.6;
    glowAt(out, "slamp", "rgba(255,250,220,1)", lx, ly, lz + 0.3, 1.4);
    add(out, { key: "spool", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, "rgba(255,250,225,0.75)"), x: px, y: 0.05, z: pz, w: 4.5, h: 3, flat: true, noFog: true });
    if (id >= 25) for (let i = 0; i < 3; i++) { const k = (t - 54.9) / 6, x = T(E - 22 + 36 * k + i * 3.2), y = 16 + (i === 1 ? 1.8 : 0) - i * 0.3, lit = Math.floor(t * 2.5 + i) % 2 === 0;
      add(out, { key: `plane|${lit}`, cw: 200, ch: 120, draw: planeDraw(lit), x, y, z: -22 - i * 2, w: 7, h: 4.2, noFog: true }); }
  }
};
const a0 = (id: number) => SHOTS[id - 1].a / 30;
