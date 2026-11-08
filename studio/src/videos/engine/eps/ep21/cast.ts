// What If ep21 acting + props: who stands where in each shot (set-local metres via L), the Guide Box worn on the lead's chest
// (its red counter driven by public/eps/ep21/meter.json: -0.10 at each word's START), the boards, the LOVE BOX, the strip.
import { Pen, Outfit, FrontOpts, INK, POSES } from "../../toon";
import type { Prop } from "../../toon";
import { V3 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, q } from "../../act";
import { YOU, NEIGHBOR, GRANDMA, RUNNER, TEEN, MIA, BILLIONAIRE } from "../people";
import { SHOTS, BEATS, B0, C0, D0, G0, DECK, PORCH, ez } from "./story";
import words from "./words";
import meter from "../../../../../public/eps/ep21/meter.json";

const SO = SETS.talkton.origin;
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

// ---------------- the meter: words charged by t (k), the display in cents ----------------
const STARTS = (meter.words as { k: number; start: number }[]).map((w) => w.start);
/** words started by time t (0..180) */
export const charged = (t: number) => { let n = 0; for (const s of STARTS) if (s <= t + 1e-6) n++; return n; };
const cents = (t: number) => Math.max(0, Math.round(meter.start_balance * 100) - 10 * charged(t));
if (cents(36.86) !== 900 || cents(68.92) !== 100 || cents(73.34) !== 0 || cents(0) !== 1800) throw new Error("ep21 meter landmarks off"); // self-check
const BLINK = BEATS.blink, DIE = BEATS.dark, PRINT = BEATS.print;
/** the display: "on" digits, "dim" (dying flicker frame) or "off" */
const dispAt = (t: number): "on" | "dim" | "off" => t < BLINK ? "on" : t < DIE ? (Math.floor((t - BLINK) * 6) % 2 ? "off" : "on") : t < DIE + 0.07 ? "dim" : "off";

// ---------------- cast ----------------
const BAKER: Outfit = { ...NEIGHBOR, jacket: "#f4f1ea", pattern: undefined, acc: [], hat: "toque" };
/** background extras (user 2026-11-08): film extras, muted desaturated outfits (no red / yellow), never the focus */
const mute = (o: Outfit, jacket: string, pants: string, more: Partial<Outfit> = {}): Outfit => ({ ...o, jacket, pants, pattern: undefined, acc: [], ...more });
const E1 = mute(NEIGHBOR, "#8a9399", "#4f5866", { hair: "#6b6b6b", moustache: "#5a5a5a" });
const E2 = mute(GRANDMA, "#c9c2b5", "#6a6470", { layer: { kind: "cardigan", color: "#7f8a7a" }, glasses: undefined, hair: "#b9b4ac" });
const E3 = mute(TEEN, "#6f7f8f", "#3d4452");
const E4 = mute(RUNNER, "#9a8f7e", "#4a4f5a", { top: "tee", bottom: "jeans", num: undefined, shoe: "boot", boots: "#4a4038" });
const E5 = mute(BILLIONAIRE, "#d8d4cc", "#55505a", { layer: { kind: "jacket", color: "#5f6a73", long: true }, hair: "#4a4040", style: "smooth" });
const E6 = mute(MIA, "#bfb8c6", "#5d5866", { layer: { kind: "cardigan", color: "#8e8597" }, hair: "#3a3030", bob: false, style: "ponytail" });
const E7 = mute(TEEN, "#8d8a74", "#4a4a40", { style: "smooth", curly: false, hair: "#6b4a30" });
export const CAST: [string, Outfit, Partial<FrontOpts>][] = [["You", YOU, { expr: "grin" }], ["Mia", MIA, { expr: "smile" }], ["Baker", BAKER, { expr: "deadpan" }],
  ["Runner", RUNNER, { expr: "shock" }], ["Grandma", GRANDMA, { expr: "smile" }], ["Teen", TEEN, { expr: "deadpan" }]];
const sec = (id: number) => [SHOTS[id - 1].a / 30, SHOTS[id - 1].b / 30];
const who = (i: number, o: Outfit, at: V3, expr: Act["expr"], more: Partial<Act> = {}): Act => ({ i, o, at: L(at), mode: "stand", expr, ...more });

// ---------------- hand poses ----------------
type R = FrontOpts["reach"];
/** both hands out to the sides of a held thing: up 0 = belly .. 2 = chin high; sp = outward reach */
const HOLD = (up = 1, sp = 30, wob = 0): R => { const hy = 0.72 - 0.22 * up, ey = 0.2 + 0.55 * hy;
  return [{ ex: -sp - 10, ey, hx: -sp - wob, hy, front: true }, { ex: sp + 10, ey, hx: sp + wob, hy, front: true }]; };
const DOWN: R = [{ ex: -22, ey: 0.7, hx: -6, hy: 1.15, front: true }, { ex: 22, ey: 0.7, hx: 6, hy: 1.15, front: true }];
const SIDE = { ex: 22, ey: 0.7, hx: 6, hy: 1.15, front: true };
/** screen-left hand on the box face (k 0 = down .. 1 = on it) */
const ONBOX = (k: number, x = 22, y = 0.5): R => [{ ex: lerp(-22, -12, k), ey: lerp(0.7, 0.45, k), hx: lerp(-6, x, k), hy: lerp(1.15, y, k), front: true }, SIDE];
/** screen-left hand raised to the lips */
const SHH = (k: number): R => [{ ex: lerp(-22, -12, k), ey: lerp(0.7, 0.1, k), hx: lerp(-6, 30, k), hy: lerp(1.15, -0.5, k), front: true }, SIDE];
/** screen-left arm pointing out to the right of the screen (at the loaf) / waving high */
const POINT_R = (k = 1): R => [{ ex: -22, ey: 0.7, hx: -6, hy: 1.15, front: true }, { ex: lerp(22, 28, k), ey: lerp(0.7, -0.05, k), hx: lerp(6, 60, k), hy: lerp(1.15, 0.0, k), front: true }];
const WAVE = (t: number, k = 1): R => [{ ex: -22, ey: 0.7, hx: -6, hy: 1.15, front: true }, { ex: 26, ey: lerp(0.7, -0.2, k), hx: lerp(6, 30 + 10 * Math.sin(t * 11), k), hy: lerp(1.15, -0.65, k), front: true }];

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
const local = (p: Pen, c: [number, number], ang: number, s: number, fn: (g: CanvasRenderingContext2D) => void) => {
  const g = p.g, [x, y] = p.P(c[0], c[1]), r = p.rot; g.save(); g.translate(x, y); g.rotate(ang + (r ? r[0] : 0)); g.scale(s, s); p.rot = null;
  try { fn(g); } finally { p.rot = r; g.restore(); }
};
const glow = (g: CanvasRenderingContext2D, size: number, stops: [number, string][]) => {
  const c = size / 2, r = g.createRadialGradient(c, c, 0, c, c, c); for (const [o, col] of stops) r.addColorStop(o, col); g.fillStyle = r; g.fillRect(0, 0, size, size);
};
const ellPx = (p: Pen, c: string) => glow(p.g, 128, [[0, c], [1, "rgba(255,240,200,0)"]]);
const mid2 = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

// ---------------- the 7-segment counter ----------------
const SEG: Record<string, string> = { "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg" };
/** one digit, top-left (x, y), w x h, segment thickness s */
const digit = (g: CanvasRenderingContext2D, ch: string, x: number, y: number, w: number, h: number, s: number, on: string, off: string) => {
  const hh = h / 2, segs: Record<string, number[]> = { a: [x + s, y, w - 2 * s, s], b: [x + w - s, y + s * 0.6, s, hh - s * 0.9], c: [x + w - s, y + hh + s * 0.3, s, hh - s * 0.9],
    d: [x + s, y + h - s, w - 2 * s, s], e: [x, y + hh + s * 0.3, s, hh - s * 0.9], f: [x, y + s * 0.6, s, hh - s * 0.9], g: [x + s, y + hh - s / 2, w - 2 * s, s] };
  for (const [k, [sx, sy, sw, sh]] of Object.entries(segs)) { g.fillStyle = (SEG[ch] ?? "").includes(k) ? on : off; g.beginPath(); g.roundRect(sx, sy, sw, sh, s / 2); g.fill(); }
};
/** the Guide Box face, canvas 300 x 240 (+ the plate / the strip below, to y 470) */
const boxDraw = (g: CanvasRenderingContext2D, c: number, disp: "on" | "dim" | "off", plate: boolean, strip: number) => {
  // the strip first (it comes out of the slot, under the box)
  if (strip > 0) { const len = 236 * strip; g.save(); g.beginPath(); g.rect(-20, 228, 340, len + 20); g.clip();
    g.translate(0, len - 236); rr(g, 6, 228, 288, 244, 6, "#fbf8ee", INK, 7);
    text(g, "...YOUR", 150, 296, 84, "#1d1a3a", 900, "center", 272); text(g, "JACKET.", 150, 398, 92, "#c63939", 900, "center", 274); g.restore(); }
  if (plate) { rr(g, 46, 236, 208, 64, 10, "#f4f1ea", INK, 7); text(g, "= 10 WORDS", 150, 269, 38, "#c63939", 900, "center", 190); }
  rr(g, 0, 0, 300, 240, 24, "#f2c230", INK, 10);
  rr(g, 18, 16, 264, 112, 12, "#2a0e12", INK, 6);
  const on = disp === "on" ? "#ff3b2f" : disp === "dim" ? "#7a2a26" : "#3a1a1c", off = "#3d171b";
  if (disp !== "off") { const s = (c / 100).toFixed(2).padStart(5, " "); // " 9.00" / "18.00"
    text(g, "$", 44, 72, 76, on);
    const xs = [70, 118, 0, 178, 226]; for (let i = 0; i < 5; i++) { if (i === 2) { g.fillStyle = on; g.beginPath(); g.arc(166, 112, 6, 0, two); g.fill(); continue; } digit(g, s[i], xs[i], 30, 40, 84, 10, on, off); }
  }
  for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) ell(g, 36 + k * 26, 152 + r * 24, 8, 8, "#3a2f1a");
  rr(g, 150, 140, 132, 62, 8, "#f4f1ea", INK, 5); text(g, "RENTED", 216, 158, 28, "#1d1a3a", 900, "center", 120); text(g, "GUIDE", 216, 186, 28, "#c63939", 900, "center", 120);
  rr(g, 24, 214, 252, 12, 5, "#1d1a3a");
};
const BOXW = 84; // box width in u (1 % of the head width)
type Gear = { held?: boolean; buzz?: boolean; bills?: number; loaf?: boolean; strapOnly?: boolean };
/** the Guide Box on its neck strap (+ optional bills / loaf in the screen-left hand) at time t */
const GEAR = (t: number, o: Gear = {}): Prop => {
  const c = cents(t), disp = dispAt(t), plate = charged(t) >= 168 && t < DIE, strip = q(ez(t, PRINT, PRINT + 0.7), 30), bz = o.buzz ? q(Math.sin(t * 24), 4) : 0; // ~4 Hz shake: at t * 90 it flipped every frame and flicker_qa read it as flicker
  return { k: `gbox|${c}|${disp}|${plate}|${strip}|${o.held ? 1 : 0}|${bz}|${o.bills ?? 0}|${o.loaf ? 1 : 0}`, draw: (p, h, u, chest) => {
    const s = (BOXW * u) / 300, held = o.held && h[0] && h[1];
    const at: [number, number] = held ? [mid2(h[0], h[1])[0], mid2(h[0], h[1])[1] - 10 * u] : [chest[0] + bz * 1.2 * u, chest[1] + 4 * u];
    // the strap: two bands from the box's top corners up to the collar
    const g = p.g, [nx, ny] = p.P(chest[0], chest[1] - 40 * u), [bx, by] = p.P(at[0], at[1] - 120 * s);
    g.save(); g.lineCap = "round"; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(nx + sd * 14 * u, ny); g.lineTo(bx + sd * 32 * u, by + 6 * u); g.lineWidth = 6 * u; g.strokeStyle = INK; g.stroke(); g.lineWidth = 3.4 * u; g.strokeStyle = "#2f4a6a"; g.stroke(); } g.restore();
    local(p, at, 0, s, (gg) => { gg.translate(-150, -120); boxDraw(gg, c, disp, plate, strip); });
    if (o.bills && h[0]) local(p, h[0], -0.3, (64 * u) / 200, (gg) => { gg.translate(-100, -60); for (let i = 0; i < o.bills!; i++) { gg.save(); gg.rotate((i - 1) * 0.18); billDraw(gg); gg.restore(); } });
    if (o.loaf && h[0]) local(p, h[0], -0.2, (70 * u) / 200, (gg) => { gg.translate(-100, -50); loafDraw(gg); });
  } };
};
const billDraw = (g: CanvasRenderingContext2D) => { rr(g, 0, 20, 200, 90, 8, "#9fd18a", INK, 7); rr(g, 14, 32, 172, 66, 5, "#c9e8b4", "#3f7a4a", 4); ell(g, 100, 65, 26, 26, "#7fbf6a", 0); text(g, "1", 100, 66, 44, "#2d5a35"); text(g, "$1", 36, 50, 26, "#2d5a35"); };
const loafDraw = (g: CanvasRenderingContext2D) => { ell(g, 100, 50, 96, 44, "#c98a4a", 7); for (const x of [60, 100, 140]) { g.beginPath(); g.moveTo(x - 14, 30); g.lineTo(x + 10, 66); g.lineWidth = 7; g.strokeStyle = "#8a5a2a"; g.stroke(); } };
/** the baker's white bib apron (chest to knees, waist tie) + optional loaf between the hands */
const apron = (loaf: boolean): Prop => ({ k: `apron|${loaf ? 1 : 0}`, draw: (p, h, u, chest) => {
  local(p, chest, 0, u, (g) => { g.beginPath(); g.moveTo(-26, -34); g.lineTo(26, -34); g.lineTo(30, 4); g.lineTo(44, 10); g.lineTo(42, 118); g.lineTo(-42, 118); g.lineTo(-44, 10); g.lineTo(-30, 4); g.closePath();
    g.fillStyle = "#fbfaf4"; g.fill(); g.lineWidth = 4; g.strokeStyle = INK; g.stroke(); rr(g, -46, 8, 92, 8, 3, "#d9d4c4", INK, 3); rr(g, -14, 40, 28, 22, 4, "#ece7d8", INK, 3); });
  if (loaf && h[0] && h[1]) local(p, mid2(h[0], h[1]), 0, (90 * u) / 200, (g) => { g.translate(-100, -50); loafDraw(g); }); } });
const youAct = (at: V3, expr: Act["expr"], more: Partial<Act> = {}, gear: Gear = {}): Act => ({ i: 0, o: YOU, at: L(at), mode: "stand", expr, prop: (t) => GEAR(t, gear), ...more });

// ---------------- fx helpers ----------------
type FxO = Stage["fx"][number];
const add = (out: Stage, f: FxO) => { out.fx.push(f); };
/** a lettered board (canvas cw x ch, lines = [text, px, colour]) facing +z, centre (x, y, z), width w */
const board = (out: Stage, key: string, lines: [string, number, string][], x: number, y: number, z: number, w: number, cw = 400, ch = 260, bg = "#f4f1ea", face: V3 = [0, 0, 1]) =>
  add(out, { key: `bd|${key}`, cw, ch, draw: (p) => { const g = p.g; rr(g, 5, 5, cw - 10, ch - 10, 16, bg, INK, 9); const n = lines.length, tot = lines.reduce((a, l) => a + l[1] * 1.12, 0);
    let y0 = ch / 2 - tot / 2; for (const [s, px, col] of lines) { text(g, s, cw / 2, y0 + px * 0.56, px, col, 900, "center", cw - 44); y0 += px * 1.12; } void n; }, x, y, z, w, h: (w * ch) / cw, face });
/** a thin post from the ground up to y (behind a board) */
const post = (out: Stage, key: string, x: number, y: number, z: number, wd = 0.07) => add(out, { key: `post|${key}`, cw: 16, ch: 128, draw: (p) => { p.g.fillStyle = "#4a3426"; p.g.fillRect(0, 0, 16, 128); }, x, y: y / 2, z, w: wd, h: y, face: [0, 0, 1] });
const glowAt = (out: Stage, key: string, c: string, x: number, y: number, z: number, w: number, h = w, extra: Partial<FxO> = {}) => add(out, { key, cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, c), x, y, z, w, h, noFog: true, ...extra });
const PRICES: [string, number, string][] = [["WORDS 10¢", 54, "#1d1a3a"], ["SORRY $5", 54, "#1d1a3a"], ["I LOVE YOU $3", 58, "#c63939"]];
/** the LOVE BOX face (canvas 360 x 320): lamp grey -> green on Pling, PAID IN FULL after */
const loveDraw = (lit: boolean, paid: boolean) => (p: Pen) => { const g = p.g;
  rr(g, 5, 5, 350, 310, 18, "#d4ad52", INK, 9); rr(g, 70, 22, 220, 16, 6, "#1d1a3a"); // the slot
  text(g, "LOVE BOX", 180, 86, 58, "#7a1f2a", 900, "center", 320); text(g, "$3.00", 180, 168, 92, "#1d1a3a", 900, "center", 300);
  ell(g, 300, 260, 30, 30, lit ? "#5ff07a" : "#4a5a4a", 6);
  if (paid) { g.save(); g.translate(150, 258); g.rotate(-0.12); rr(g, -130, -34, 260, 68, 8, "#f4f1ea", "#c63939", 8); text(g, "PAID IN FULL", 0, 2, 40, "#c63939", 900, "center", 240); g.restore(); }
};
/** the open doorway: warm room light, the door leaf swinging in (k 0 shut .. 1 open) */
const doorDraw = (k: number) => (p: Pen) => { const g = p.g; g.fillStyle = "#ffd98a"; g.fillRect(0, 0, 200, 412);
  g.fillStyle = "rgba(255,240,200,0.8)"; g.beginPath(); g.ellipse(100, 160, 90, 150, 0, 0, two); g.fill();
  const a = k * 1.3, w = 196 * Math.cos(a), lift = 26 * Math.sin(a); // hinge on the left; the free edge swings in and grows in perspective
  g.beginPath(); g.moveTo(2, 2); g.lineTo(2 + Math.max(6, w), 2 - lift); g.lineTo(2 + Math.max(6, w), 410 + lift); g.lineTo(2, 410); g.closePath();
  g.fillStyle = k > 0.02 ? "#a83030" : "#c63939"; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
  if (k > 0.05) { g.fillStyle = "#e8c45a"; g.beginPath(); g.arc(2 + w - 18, 214, 8, 0, two); g.fill(); } g.lineWidth = 6; g.strokeStyle = INK; g.strokeRect(2, 2, 196, 408); };

// ---------------- acts ----------------
const STEP = (z: number) => (z > -2.75 ? 0 : z > -3.1 ? 0.15 : z > -3.45 ? 0.3 : z > -3.8 ? 0.45 : PORCH);
const ON_STEP: V3 = [D0 + 0.5, 0.45, -3.62];
const ACTS = (id: number): Act[] => {
  const [a, b] = sec(id);
  switch (id) {
    // ---- A: the gate
    case 1: return [youAct([0, 0, 1.8], [[0, "curious"], [1.2 - LEAD, "shock"], [2.5 - LEAD, "nervous"]], { lookY: (t) => -0.6 * (1 - ez(t, 2.2, 2.6)), reach: (t) => ONBOX(ez(t, 2.2, 2.5), 18, 0.55) })];
    case 2: return [youAct([0, 0, 0], [[0, "curious"]], { mode: "stroll", phase: (t) => t * 1.3, path: (t) => { const k = ez(t, a + 0.2, b - 0.3);
      return L([lerp(-2.05, -0.8, k), 0.3 * (1 - ez(t, a + 0.3, a + 0.7)), lerp(4.15, 5.6, k)]); }, look: 0.4 })];
    case 3: return [youAct([0, 0, -1.6], [[0, "curious"], [7.9 - LEAD, "sideeye"]], { lookY: () => -0.8, head: () => 4 })];
    case 4: return [youAct([0, 0, 1.8], [[0, "deadpan"], [9.6 - LEAD, "bruh"]], { lookY: (t) => 0.7 * (1 - ez(t, 9.9, 10.2)) })];
    case 5: return [youAct([0, 0, 0], [[0, "proud"], [12.3 - LEAD, "grin"]], { mode: "stroll", phase: (t) => t * 1.1, path: (t) => L([0, 0, lerp(-3.4, -0.9, ez(t, a, b))]), reach: () => HOLD(1.25, 46) }, { held: true })];
    case 6: return [youAct([0, 0, 0], [[0, "smile"]], { mode: "stroll", phase: (t) => t * 1.3, path: (t) => L([-4.0, 0, lerp(-14.0, -16.4, ez(t, a, b))]), reach: () => POSES.hands_on_hips })];
    case 7: { const tuck = 18.3;
      return [youAct([-4.0, 0, -17], [[0, "scheming"], [18.7 - LEAD, "confident"]], { reach: (t) => { const k = ez(t, tuck - 0.4, tuck); const r = HOLD(0.8, 30)!;
        return [{ ...r[0]!, hx: lerp(-22, -30, k), hy: lerp(0.4, 0.95, k), ex: -30 }, SIDE]; }, lookY: () => 0.5, prop: (t) => GEAR(t, { bills: t < 18.55 ? 3 : 0 }) })]; }
    // ---- B: the market
    case 8: return [youAct([0, 0, 0], [[0, "curious"]], { mode: "stroll", phase: (t) => t * 1.3, path: (t) => L([lerp(B0 - 6.0, B0 - 3.6, ez(t, a, b)), 0, 1.0]), look: 0.5 })];
    case 9: return [youAct([B0 - 1.3, 0, 1.4], [[0, "curious"], [BEATS.point - LEAD, "confident"]], { reach: (t) => POINT_R(ez(t, BEATS.point - 0.2, BEATS.point + 0.1)), look: 0.5 }),
      who(1, BAKER, [B0 + 1.5, 0, -1.3], [[0, "deadpan"], [BEATS.bread - LEAD, "proud"]], { prop: apron(true), reach: (t) => HOLD(lerp(0.4, 1.6, ez(t, BEATS.bread - 0.4, BEATS.bread)), 34), look: -0.5 })];
    case 10: return [youAct([B0 - 0.35, 0, 1.4], [[0, "confident"], [26.9 - LEAD, "grin"]], { reach: (t) => (t < 26.85 ? POINT_R(1) : HOLD(0.8, 30)), head: (t) => 6 * Math.sin(Math.max(0, t - 26.4) * 9) * (t < 26.85 ? 1 : 0), prop: (t) => GEAR(t, { loaf: t >= 26.85 }) })];
    case 11: { const hit = BEATS.bump;
      return [youAct([B0 + 2.0, 0, 1.0], [[0, "smile"], [hit - LEAD, "shock"]], { reach: (t) => (t < hit ? HOLD(0.8, 30) : POSES.hands_up), tilt: (t) => -14 * ez(t, hit, hit + 0.12) * (1 - ez(t, hit + 0.5, hit + 1.0)) }),
        who(1, RUNNER, [0, 0, 0], [[0, "deadpan"], [hit - LEAD, "shock"]], { mode: "march", phase: (t) => t * 2.4, path: (t) => L([lerp(B0 + 6.5, B0 - 0.5, ez(t, a, b)), 0, 0.55]) })]
        .map((x, i) => (i ? x : { ...x, prop: (t: number) => GEAR(t, { loaf: t < hit }) })); }
    case 12: return [youAct([B0 + 0.6, 0, -1.2], [[0, "irritated"]], { reach: () => POSES.hands_on_hips, look: -0.4 }),
      who(1, RUNNER, [0, 0, 0], [[0, "shock"], [30.3 - LEAD, "nervous"]], { path: (t) => L([lerp(B0 - 0.2, B0 - 0.5, ez(t, a, b)), 0, lerp(1.2, 1.4, ez(t, a, b))]), reach: () => POSES.cover_mouth, look: 0.5 })];
    case 13: return [youAct([B0 + 2.3, 0, 1.4], [[0, "irritated"], [32.0 - LEAD, "jawdrop"]], { lookY: () => -0.7, look: 0.3 }),
      who(1, RUNNER, [0, 0, 0], [[0, "nervous"]], { mode: "march", phase: (t) => t * 2.4, path: (t) => L([lerp(B0 + 5.5, B0 - 2.5, ez(t, a + 0.3, b)), 0, 0.15]), reach: () => POSES.cover_mouth })];
    case 14: return [youAct([0, 0, 0], [[0, "deadpan"]], { mode: "stroll", phase: (t) => t * 1.3, path: (t) => L([lerp(B0 + 3.2, B0 + 5.9, ez(t, a, b)), 0, 0.9]), reach: () => DOWN, lookY: (t) => 0.5 * Math.max(0, Math.sin(t * 2)) })];
    case 15: { const e = BEATS.empty;
      return [youAct([B0 + 6.3, 0, 1.0], [[0, "deadpan"], [e - LEAD, "squint"], [38.2 - LEAD, "worried"]], { lookY: (t) => (t < 38.2 ? 0.7 : 0), reach: (t) => ONBOX(ez(t, 37.3, 37.5) * (1 - ez(t, 38.0, 38.3)) * (0.85 + 0.15 * Math.sin(t * 30)), 18, 0.55) })]; }
    // ---- C: the bridge (golden)
    case 16: return [youAct([0, 0, 0], [[0, "smile"]], { mode: "stroll", phase: (t) => t * 1.3, path: (t) => L([lerp(C0 - 3.2, C0 - 0.8, ez(t, a, b)), DECK, 0.1]) })];
    case 17: return [youAct([0, 0, 0], [[0, "smile"], [44.1 - LEAD, "excited"]], { mode: "stroll", phase: (t) => t * 1.1, path: (t) => L([lerp(C0 - 0.6, C0 + 1.2, ez(t, a, b)), DECK, 0.1]), look: (t) => -0.5 + Math.sin(t) * 0.3 })];
    case 18: return [youAct([C0 + 1.2, DECK, 0.1], [[0, "curious"], [45.5 - LEAD, "shock"], [46.3 - LEAD, "cringe"]], { lookY: (t) => (t < 46.2 ? 0.7 : 0) }, { buzz: true })];
    case 19: return [youAct([C0 + 1.2, DECK, 0.1], [[0, "cringe"], [BEATS.money - LEAD, "pained"]], { reach: (t) => ONBOX(ez(t, 47.2, 47.5), 14, 0.62), lookY: () => 0.5 })];
    case 20: return [youAct([C0 + 1.2, DECK, 0.1], [[0, "sheepish"], [49.4 - LEAD, "smile_closed"]], { reach: (t) => SHH(ez(t, 48.8, 49.15)), head: (t) => 5 * Math.sin(Math.max(0, t - 49.5) * 8) * (t < 50.0 ? 1 : 0) })];
    // ---- D: Mia's street (night)
    case 21: return [youAct([0, 0, 0], [[0, "nervous"], [52.0 - LEAD, "puppy"]], { mode: "stroll", phase: (t) => t * 1.1, path: (t) => L([lerp(D0 - 2.9, D0 - 2.4, ez(t, a, b)), 0, lerp(2.8, 3.4, ez(t, a, b))]), reach: () => DOWN, look: 0.5 }),
      who(1, GRANDMA, [G0, 0, -7.0], [[0, "smile"]], { reach: (t) => WAVE(t * 0.5, 1), look: 0.4 })];
    case 22: return [youAct([G0 + 3.0, 0, -0.4], [[0, "curious"], [BEATS.waves + 0.3 - LEAD, "grin"]], { reach: (t) => WAVE(t, ez(t, 54.5, 54.9)), look: -0.5, lookY: () => -0.3 }),
      who(1, GRANDMA, [G0, 0, -7.0], [[0, "smile"], [BEATS.waves - LEAD, "laugh"]], { reach: (t) => WAVE(t + 1, ez(t, a, a + 0.4)), look: 0.4 })];
    case 23: return [youAct([G0 + 1.25, 0, 0.2], [[0, "grin"]], { reach: (t) => WAVE(t), look: -0.4, lookY: () => -0.3 }),
      who(1, GRANDMA, [G0, 0, -7.0], [[0, "laugh"]], { reach: (t) => WAVE(t + 1), look: 0.4 })];
    case 24: return [youAct([0, 0, 0], [[0, "nervous"]], { mode: "stroll", phase: (t) => t * 1.2, path: (t) => { const z = lerp(-1.9, -4.3, ez(t, a, b)); return L([D0, STEP(z), z]); }, reach: () => DOWN })];
    case 25: { const k1 = BEATS.knock, kk = (t: number) => Math.max(ez(t, k1 - 0.1, k1) * (1 - ez(t, k1 + 0.05, k1 + 0.15)), ez(t, k1 + 0.3, k1 + 0.4) * (1 - ez(t, k1 + 0.45, k1 + 0.55)));
      return [youAct([D0 - 0.1, PORCH, -5.5], [[0, "nervous"]], { reach: (t) => [{ ex: -22, ey: 0.7, hx: -6, hy: 1.15, front: true }, { ex: 30, ey: -0.05, hx: 60 + 10 * kk(t), hy: -0.2, front: true }], look: 0.6 })]; }
    case 26: return [youAct(ON_STEP, [[0, "nervous"], [BEATS.opens + 0.2 - LEAD, "puppy"]], { lookY: () => -0.2, look: -0.4 }),
      who(1, MIA, [0, 0, 0], [[0, "curious"], [61.3 - LEAD, "smile"]], { look: 0.3, path: (t) => { const k = ez(t, BEATS.opens + 0.1, BEATS.opens + 0.6); return k <= 0 ? null : L([D0 - 0.3, PORCH, lerp(-5.86, -5.55, k)]); } })];
    case 27: { const say = 62.25;
      return [youAct(ON_STEP, [[0, "puppy"], [say, "relief_open"], [62.75, "smile"], [63.3 - LEAD, "proud"]], { look: -0.4 }),
        who(1, MIA, [D0 - 0.45, PORCH, -4.9], [[0, "smile"]], { look: 0.3 })]; }
    case 28: return [youAct(ON_STEP, [[0, "proud"], [BEATS.pling - LEAD, "shock"]], { look: 0.5 }), who(1, MIA, [D0 - 0.45, PORCH, -4.9], [[0, "smile"]], { look: 0.3 })];
    case 29: return [youAct(ON_STEP, [[0, "relief"], [66.5 - LEAD, "relief_open"]], { look: 0.2 }), who(1, MIA, [D0 - 0.45, PORCH, -4.9], [[0, "smile"]], { look: 0.3 })];
    case 30: return [youAct(ON_STEP, [[0, "relief"], [BEATS.left - LEAD, "cringe"]], { lookY: (t) => (t > 68.0 ? 0.7 : 0) })];
    case 31: return [youAct(ON_STEP, [[0, "puppy"]], { look: -0.5 }), who(1, MIA, [D0 - 0.3, PORCH, -4.15], [[0, "neutral"], [BEATS.smiles - LEAD, "smile"], [BEATS.mouth - LEAD, "relief_open"]], { look: 0.4 })];
    case 32: return [youAct(ON_STEP, [[0, "excited"], [73.2 - LEAD, "shock"]], { look: -0.4 }), who(1, MIA, [D0 - 0.3, PORCH, -4.15], [[0, "relief_open"], [72.5, "smile"], [73.2, "relief_open"]], { look: 0.4 })];
    // the button: 33 the meter blinks out (silence, then the beep), 34 the strip prints big, 35 his hope drops; she pats the jacket
    case 33: return [youAct(ON_STEP, [[0, "excited"], [BEATS.blink, "shock"], [BEATS.dark - LEAD, "nervous"]], { lookY: (t) => (t > 74.2 ? 0.7 : 0), look: -0.2 }),
      who(1, MIA, [D0 - 0.3, PORCH, -4.15], [[0, "relief_open"], [74.3, "smile"]], { look: 0.4 })];
    case 34: return [youAct(ON_STEP, [[0, "puppy"]], { lookY: () => 0.7 })];
    case 35: { const d = BEATS.drop, pat = (t: number) => ez(t, d + 0.15, d + 0.45);
      return [youAct(ON_STEP, [[0, "puppy"], [d - LEAD, "deadpan"]], { lookY: (t) => (t < d - 0.2 ? 0.6 : 0), look: (t) => (t < d ? 0 : -0.5) }),
        who(1, MIA, [D0 - 0.05, PORCH, -4.0], [[0, "smile"], [d + 0.1 - LEAD, "laugh"]], { look: 0.6, head: (t) => 4 * Math.sin(Math.max(0, t - d) * 6),
          reach: (t) => [{ ex: -22, ey: 0.7, hx: -6, hy: 1.15, front: true }, { ex: lerp(22, 34, pat(t)), ey: lerp(0.7, 0.45, pat(t)), hx: lerp(6, 72 + 6 * Math.sin(Math.max(0, t - d - 0.45) * 7), pat(t)), hy: lerp(1.15, 0.75, pat(t)), front: true }] })]; }
    default: return [];
  }
};
// ---------------- the town's extras: small, back, muted, slow; silent free things only ----------------
const nod = (r = 2.2, ph = 0) => (t: number) => 4 * Math.sin(t * r + ph);
const slowWave = (ph = 0): R => [{ ex: -22, ey: 0.7, hx: -6, hy: 1.15, front: true }, { ex: 26, ey: -0.2, hx: (t0 => 30 + 7 * Math.sin(t0))(ph), hy: -0.65, front: true }];
/** a hand-lettered card held up in both hands instead of talking */
const card = (s1: string, s2 = ""): Prop => ({ k: `xcard|${s1}|${s2}`, draw: (p, h, u) => { if (!h[0] || !h[1]) return; local(p, mid2(h[0], h[1]), 0, (46 * u) / 200, (g) => {
  g.translate(-100, -70); rr(g, 0, 0, 200, 130, 10, "#efe9da", INK, 8); text(g, s1, 100, s2 ? 44 : 66, 46, "#3a4256", 900, "center", 176); if (s2) text(g, s2, 100, 94, 40, "#3a4256", 900, "center", 176); }); } });
const xw = (i: number, o: Outfit, at: V3, expr: Act["expr"], more: Partial<Act> = {}): Act => ({ ...who(i, o, at, expr, more), scale: o.build === "kid" ? undefined : 0.94 });
const ARGUE = (ph: number) => (t: number) => (Math.floor(t * 0.7 + ph) % 2 ? POSES.shrug : POSES.hands_up);
const EXTRAS = (id: number): Act[] => {
  const T = (t: number) => t;
  if (id <= 7) return [ // the gate + Main Street: both pavements beyond the arch, a woman at the bus stop
    xw(10, E1, [3.9, 0, -7.5], [[0, "smile_closed"]], { head: nod(), look: 0.5 }), xw(11, E2, [4.6, 0, -7.9], [[0, "smile"]], { reach: () => HOLD(1.1, 26), prop: card("HELLO!"), look: -0.5 }),
    xw(12, E4, [3.7, 0, -11.5], [[0, "irritated"]], { reach: ARGUE(0), look: 0.5, head: nod(1.4) }), xw(13, E6, [4.5, 0, -11.8], [[0, "deadpan"]], { reach: ARGUE(1), look: -0.5 }),
    xw(14, E3, [-5.3, 0, -21.5], [[0, "grin"]], { reach: () => slowWave(0.5), look: 0.3 }), xw(15, E5, [-5.5, 0, -26], [[0, "smile_closed"]], { reach: () => POSES.fist_pump, look: 0.4 }),
    xw(16, E2, [4.2, 0, -19], [[0, "smile_closed"]], { reach: () => HOLD(1.1, 26), prop: card("NICE", "DAY"), look: -0.3 }), xw(17, E1, [4.0, 0, -25], [[0, "deadpan"]], { reach: () => POSES.point_left, look: -0.5 }),
    xw(18, E6, [3.7, 0, 1.6], [[0, "smile"]], { reach: (t) => slowWave(T(t) * 3), look: -0.6 })];
  if (id <= 15) return [ // the market: shoppers at the stalls, vendors behind the counters
    xw(10, E2, [B0 - 8.4, 0, -1.4], [[0, "curious"]], { reach: () => POSES.point_right, look: 0.4 }), xw(11, E1, [B0 - 8.0, 0, -3.35], [[0, "smile_closed"]], { head: nod(1.8), look: -0.3 }),
    xw(12, E6, [B0 - 4.7, 0, -1.5], [[0, "smile"]], { reach: () => HOLD(1.1, 26), prop: card("2", "PLEASE"), look: 0.3 }), xw(13, E5, [B0 - 4.0, 0, -3.35], [[0, "smile_closed"]], { reach: () => POSES.fist_pump, look: -0.4 }),
    xw(14, E3, [B0 + 4.3, 0, -1.4], [[0, "curious"]], { reach: () => POSES.point_left, look: 0.2 }), xw(15, E4, [B0 + 4.9, 0, -1.6], [[0, "smile_closed"]], { reach: () => SHH(1), look: -0.6 }),
    xw(16, E1, [B0 + 8.3, 0, -1.5], [[0, "irritated"]], { reach: ARGUE(0), look: -0.3 }), xw(17, E2, [B0 + 8.0, 0, -3.35], [[0, "deadpan"]], { reach: ARGUE(1), look: 0.3, head: nod(1.2) }),
    xw(18, E7, [B0 + 12.0, 0, -4.0], [[0, "grin"]], { reach: (t) => slowWave(t * 3), look: -0.4 })];
  if (id <= 20) return [ // the bridge: a couple at the far end, people on the banks
    xw(10, E6, [C0 + 3.4, DECK, -0.45], [[0, "smile"]], { reach: () => HOLD(1.1, 26), prop: card("LOVELY", "VIEW"), look: -0.4 }), xw(11, E4, [C0 + 4.0, DECK, -0.5], [[0, "smile_closed"]], { head: nod(1.6), look: -0.5 }),
    xw(12, E3, [C0 - 6.3, 0, -2.6], [[0, "grin"]], { reach: (t) => slowWave(t * 3), look: 0.4 }), xw(13, E1, [C0 + 6.9, 0, -3.8], [[0, "smile_closed"]], { reach: () => POSES.fist_pump, look: -0.4 }),
    xw(14, E2, [C0 - 5.6, 0, 3.3], [[0, "curious"]], { reach: () => POSES.point_right, look: 0.3 })];
  return [ // Mia's street: a couple under the far lamp, a man hushing a kid, a neighbour over his fence; Grandma's grandkid in the window
    xw(10, E4, [D0 - 12.4, 0, 0.3], [[0, "smile_closed"]], { reach: () => HOLD(1.1, 26), prop: card("GOOD", "NIGHT"), look: 0.4 }), xw(11, E2, [D0 - 13.0, 0, 0.1], [[0, "smile"]], { head: nod(1.5), look: 0.5 }),
    xw(12, E5, [D0 + 6.8, 0, 0.3], [[0, "smile_closed"]], { reach: () => SHH(1), look: 0.5 }), xw(13, E7, [D0 + 7.4, 0, 0.45], [[0, "sheepish"]], { look: -0.5 }),
    xw(14, E1, [D0 + 8.6, 0, -2.4], [[0, "smile_closed"]], { reach: () => POSES.fist_pump, look: -0.4 }),
    ...(id <= 23 ? [xw(15, E3, [G0 + 0.45, 0, -7.4], [[0, "grin"]], { reach: (t: number) => slowWave(t * 3), look: 0.2 })] : [])];
};
const NOX = new Set([4, 7, 10, 18, 19, 25, 30, 34]); // tight closes: no room for life behind
export const acts = (id: number): Act[] => [...ACTS(id), ...(NOX.has(id) ? [] : EXTRAS(id))];

// ---------------- fx ----------------
export const fx = (id: number, t: number, out: Stage) => {
  const T = X;
  // ---- A: the gate (1-7)
  if (id <= 7) {
    add(out, { key: "talkton", cw: 600, ch: 130, draw: (p) => { const g = p.g; rr(g, 5, 5, 590, 120, 14, "#1d1a3a", "#e8c45a", 8); text(g, "TALKTON", 300, 68, 92, "#f2c230", 900, "center", 560); }, x: T(0), y: 5.0, z: -2.72, w: 4.2, h: 0.91, face: [0, 0, 1] });
    board(out, "arch", [["ANY WORD 10¢", 66, "#c63939"], ["FREE: POINT, WAVE, NOD", 34, "#1d1a3a"]], T(0), 3.7, -2.98, 2.4, 480, 200);
    // the PRICES board over his head (hook): legs + board
    if (id !== 4 && id !== 5) for (const dx of [-0.5, 0.5]) post(out, `pb${dx}`, T(0.4 + dx), 2.0, 1.18, 0.08);
    if (id !== 4 && id !== 5) board(out, "prices", [["TALKTON PRICES", 36, "#3a4256"], ...PRICES], T(0.4), 2.47, 1.2, 1.35, 440, 330, "#fff4cf");
    add(out, { key: "busSign", cw: 128, ch: 128, draw: (p) => { const g = p.g; ell(g, 64, 64, 58, 58, "#2f6fd6", 8); text(g, "BUS", 64, 66, 40, "#f4f1ea"); }, x: T(2.9), y: 2.75, z: 0.27, w: 0.5, h: 0.5, face: [0, 0, 1] });
  }
  // ---- B: the market (8-15)
  if (id >= 8 && id <= 15) {
    post(out, "aword", T(B0 - 6.4), 1.5, 0.18, 0.08); board(out, "aword", [["10¢ A WORD", 64, "#c63939"], ["POINTING IS FREE", 34, "#1d1a3a"]], T(B0 - 6.4), 1.85, 0.2, 1.3, 440, 200);
    if (id !== 11 && id !== 12 && id !== 14) board(out, "bread", [["BREAD", 80, "#7a4b36"], ["ONE WORD", 30, "#1d1a3a"]], T(B0 + 1.5), 2.35, -1.5, 0.95, 360, 190, "#fff4cf"); // 11 / 12 / 14 frame it half off the edge
    if (id === 10) post(out, "pfree", T(B0 + 0.3), 0.95, 0.28, 0.06); if (id === 10) board(out, "pfree", [["POINTING", 56, "#1d1a3a"], ["FREE", 76, "#3f8a4a"]], T(B0 + 0.3), 1.25, 0.3, 0.7, 360, 230);
    for (const dx of [-0.5, 0.5]) post(out, `pl${dx}`, T(B0 + 2.6 + dx), 1.9, 0.48, 0.07);
    board(out, "plist", [["PRICE LIST", 38, "#3a4256"], ["WORD 10¢", 52, "#1d1a3a"], ["SORRY $5.00", 64, "#c63939"], ["I LOVE YOU $3.00", 42, "#1d1a3a"]], T(B0 + 2.6), 2.35, 0.5, 1.15, 440, 360, "#fff4cf");
    if (id === 11) { const d = t - BEATS.bump; if (d > 0 && d < 1.3) add(out, { key: "loafFly", cw: 200, ch: 100, draw: (p) => loafDraw(p.g), x: T(B0 + 2.0 + 0.6 * d), y: 1.25 + 2.6 * d - 4.2 * d * d, z: 1.1, w: 0.36, h: 0.18, rot: d * 7 }); }
  }
  // ---- C: the bridge (16-20)
  if (id === 19) { const d = t - BEATS.money; if (d > 0 && d < 1.0) for (let i = 0; i < 3; i++) { const e = d - i * 0.12; if (e < 0) continue;
    add(out, { key: "coin", cw: 64, ch: 64, draw: (p) => { const g = p.g; ell(g, 32, 32, 26, 26, "#f2c230", 5); text(g, "¢", 32, 34, 30, "#7a4b36"); }, x: T(C0 + 1.1 + 0.08 * i), y: DECK + 1.0 - 1.6 * e * e, z: 0.25, w: 0.12, h: 0.12, rot: e * 9 }); } }
  // ---- D: Mia's street (21-33)
  if (id >= 21) {
    for (const x of [-5.6, 6.2]) { glowAt(out, `lampH${x}`, "rgba(255,226,160,0.95)", T(D0 + x), 4.55, 0.6, 1.4); add(out, { key: `lpool${x}`, cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, "rgba(255,222,160,0.55)"), x: T(D0 + x), y: 0.1, z: 0.8, w: 5, h: 4, flat: true, noFog: true }); }
    glowAt(out, "porchL", "rgba(255,220,150,0.95)", T(D0 - 0.95), 2.2, -5.75, id === 21 ? 2.4 : id === 25 && t > BEATS.knock ? 1.3 : 0.9);
    add(out, { key: "porchPool", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, "rgba(255,214,150,0.5)"), x: T(D0), y: 0.62, z: -4.8, w: 4, h: 2.2, flat: true, noFog: true });
    glowAt(out, "gmaRoom", "rgba(255,206,130,0.9)", T(G0), 1.7, -8.7, 3.2, 3.2);
    if (id <= 24) add(out, { key: "nbrWin", cw: 200, ch: 180, draw: (p) => { const g = p.g; rr(g, 4, 4, 192, 172, 6, "#f4f1ea", INK, 7); rr(g, 16, 16, 168, 148, 3, "#ffd98a");
      g.fillStyle = "rgba(255,244,210,0.8)"; g.beginPath(); g.ellipse(100, 70, 70, 50, 0, 0, two); g.fill();
      ell(g, 100, 172, 56, 46, "#6f7f8f", 5); ell(g, 100, 98, 30, 32, "#e3b48c", 5); ell(g, 100, 72, 31, 16, "#4a3a30", 0); ell(g, 90, 100, 3.5, 4.5, INK); ell(g, 110, 100, 3.5, 4.5, INK);
      g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.arc(100, 108, 9, 0.2, Math.PI - 0.2); g.stroke(); ell(g, 140, 86 + 6 * Math.sin(t * 3), 11, 13, "#e3b48c", 4);
      rr(g, 160, 14, 8, 152, 2, "#f4f1ea", INK, 3); }, x: T(D0 - 6.0), y: 2.5, z: -5.98, w: 0.9, h: 0.81, face: [0, 0, 1] });
    board(out, "miaGate", [["MIA", 70, "#1d1a3a"]], T(D0 - 1.1), 0.88, -1.365, 0.36, 200, 110); // on the left gate pillar (front z -1.38)
    if (id === 23 || id === 22) board(out, "wfree", [["WAVING", 46, "#1d1a3a"], ["FREE", 64, "#3f8a4a"]], T(G0 + 0.4), 1.24, -5.78, 0.62, 300, 190);
    const lit = t >= BEATS.pling, paid = t >= BEATS.paid - 0.1;
    add(out, { key: `love|${lit}|${paid}`, cw: 360, ch: 320, draw: loveDraw(lit, paid), x: T(D0 + 1.55), y: 1.83, z: -2.95, w: 0.56, h: 0.5, face: [0, 0, 1] });
    if (lit) glowAt(out, "loveLamp", "rgba(120,255,140,0.8)", T(D0 + 1.55 + 0.2), 1.66, -2.9, 0.22);
    if (id === 28) { const d = t - BEATS.pling; if (d > 0 && d < 0.8) glowAt(out, "bell", `rgba(255,240,170,${(0.8 * (1 - d / 0.8)).toFixed(2)})`, T(D0 + 1.55), 2.2, -3.1, 0.5); }
    if (id >= 26) { const k = id === 26 ? ez(t, BEATS.opens - 0.1, BEATS.opens + 0.5) : 1;
      add(out, { key: `door|${q(k, 30)}`, cw: 200, ch: 412, draw: doorDraw(k), x: T(D0), y: 1.63, z: -5.88, w: 0.98, h: 2.02, face: [0, 0, 1] }); }
    if (id === 27) for (let i = 0; i < 3; i++) { const k = ez(t, BEATS.jumps - 0.1 + i * 0.22, BEATS.jumps + 0.6 + i * 0.22); if (k <= 0 || k >= 1) continue;
      const p0: V3 = [ON_STEP[0] + 0.25, 1.2, ON_STEP[2] + 0.1], p1: V3 = [D0 + 1.55, 2.08, -3.2];
      add(out, { key: "billFly", cw: 200, ch: 130, draw: (p) => billDraw(p.g), x: T(lerp(p0[0], p1[0], k)), y: lerp(p0[1], p1[1], k) + 0.15 * Math.sin(Math.PI * k), z: lerp(p0[2], p1[2], k), w: 0.2, h: 0.13, rot: Math.sin(k * 9 + i) * 0.6 }); }
    if (id === 33) for (let i = 0; i < 5; i++) { const d = t - DIE - i * 0.25; if (d < 0) continue; const e = (d % 1.6) / 1.6;
      add(out, { key: "smoke", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, "rgba(90,90,100,0.75)"), x: T(D0 + 0.35 + 0.15 * Math.sin(i * 2 + e * 3)), y: 1.7 + 0.8 * e, z: -3.75, w: 0.2 + 0.4 * e, h: 0.2 + 0.4 * e, noFog: true }); }
    void sr;
  }
};
