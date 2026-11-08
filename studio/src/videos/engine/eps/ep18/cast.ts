// What If ep18 acting. Lead: the channel's "you" (one curl, white tee, jeans), the jacket left on the couch arm, barefoot all night
// (the real man was not dressed for the storm); from the survey on, a white head bandage. Unconscious = expr "out" (eyes shut).
// The lamp is ONE 3D object (sets.ts lamp18, RIG "lamp", posed in story.ts lampAt). Held props (GPS, clipboard, penlight) are drawn
// inside the character card with the hands (toon.ts episode Prop), so they move with the arm. No brands or logos anywhere.
import { Pen, Outfit, FrontOpts, INK, POSES, SKINS } from "../../toon";
import type { Prop } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { camAt } from "../../story";
import { Act, Stage, LEAD, q } from "../../act";
import { YOU, NEIGHBOR } from "../people";
import { SHOTS, ez, FL, COUCH, LAND, C9, DOC, rise1, fly8, run12, walk15, walk19, lampAt } from "./story";
import words from "./words";

const SO = SETS.tornado.origin;
const L = ([x, y, z]: V3): V3 => [SO[0] + x, y, z];
export const word = (text: string, from = 0) => {
  const hit = words.find((w) => w.start >= from - 0.01 && w.text.replace(/[^A-Za-z0-9'-]/g, "").toLowerCase() === text.toLowerCase());
  if (!hit) throw new Error(`Missing cast beat word: ${text} after ${from}`);
  return hit.start;
};
export const wearAt = (_t: number) => 0;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const sec = (id: number) => [SHOTS[id - 1].a / 30, SHOTS[id - 1].b / 30];

// ---------------- cast ----------------
const { layer: _jacket, ...TEE } = YOU;
/** tee, jeans, bare feet (skin-coloured flat feet) */
const YOU18: Outfit = { ...TEE, boots: SKINS[0], shoe: "flat" };
/** after the doctor: a white head bandage (the headband in the tee colour) */
const YOU18B: Outfit = { ...YOU18, acc: ["headband"] };
const SURVEYOR: Outfit = { jacket: "#5b6b7a", pants: "#3a4456", boots: "#3a2f2a", hat: null, cap: "#2b3a4f", build: "stout", top: "button", bottom: "jeans", shoe: "boot",
  layer: { kind: "jacket", color: "#e0a62a" }, style: "smooth", hair: "#5a3e2a", skin: SKINS[1] };
const DOCTOR: Outfit = { fem: true, jacket: "#8fbfd0", pants: "#3a4a6a", boots: "#2b2f3d", hat: null, build: "adult", top: "button", bottom: "jeans", shoe: "flat",
  layer: { kind: "jacket", color: "#f4f6f6", long: true }, style: "ponytail", hair: "#3a2418", skin: SKINS[2], glasses: "#2b2f3d" };
export const CAST: [string, Outfit, Partial<FrontOpts>][] = [["You (night)", YOU18, { expr: "out" }], ["You (dawn)", YOU18B, { expr: "smile" }],
  ["Neighbor", NEIGHBOR, { expr: "confused" }], ["Surveyor", SURVEYOR, { expr: "smile" }], ["Doctor", DOCTOR, { expr: "smile" }]];

type Pose = FrontOpts["reach"];
const ease = (x: number) => { const k = clamp01(x); return k * k * (3 - 2 * k); };
/** a limp body in the air: a slow drift of the limbs round a wide starfish (ep12 life(), calm) */
const limp = (seed = 0): Partial<Act> => ({ phase: (t) => t * 0.6,
  flail: (t) => [q(-12 + 5 * Math.sin(t * 1.3 + seed), 1), q(-12 + 5 * Math.sin(t * 1.1 + 2 + seed), 1), q(24 + 5 * Math.sin(t * 0.9 + 1), 1), q(24 + 5 * Math.sin(t * 1.2 + 3), 1), q(-30 + 4 * Math.sin(t), 1)],
  roll: (t) => 5 * Math.sin(t * 0.8 + seed) });
const you = (at: V3, expr: Act["expr"], more: Partial<Act> = {}, o = YOU18): Act => ({ i: 0, o, at: L(at), mode: "stand", expr, ...more });
const who = (i: number, o: Outfit, at: V3, expr: Act["expr"], more: Partial<Act> = {}): Act => ({ i, o, at: L(at), mode: "stand", expr, ...more });
const WIDE: Pose = [{ ex: -30, ey: -0.05, hx: -58, hy: -0.2, front: true }, { ex: 30, ey: -0.05, hx: 58, hy: -0.2, front: true }];
const HANDS_IN: Pose = [{ ex: -16, ey: 0.4, hx: -6, hy: 0.62, front: false }, { ex: 16, ey: 0.4, hx: 6, hy: 0.62, front: false }];
/** both hands up on the window sash, screen left of him (02), shaking with it */
const SASH = (t: number): Pose => { const s = 0.03 * Math.sin(t * 12); return [{ ex: -28, ey: 0.05, hx: -56, hy: -0.12 + s, front: false }, { ex: -6, ey: 0.42, hx: -78, hy: 0.28 + s, front: true }]; };
/** the GPS up beside the face in the left hand (screen right) */
const GPS_UP = (k = 1): Pose => [undefined, { ex: 30, ey: 0.42, hx: 24 + 18 * k, hy: 0.62 - 0.25 * k, front: true }];
/** both hands on the clipboard's top corners, chest high */
const CLIP_R = (t: number): Pose => { const s = 0.02 * Math.sin(t * 2.1); return [{ ex: -30, ey: 0.3, hx: -6, hy: 0.14 + s, front: true }, { ex: 30, ey: 0.3, hx: 6, hy: 0.14 - s, front: true }]; };
const STEP = 0.2; // the neighbour's front step

const ACTS = (id: number): Act[] => {
  const [a, b] = sec(id);
  switch (id) {
    case 1: return [you([0, 0, 0], [[0, "out"]], { mode: "fall_belly", noShadow: true, path: (t) => L(rise1(t)), ...limp() })];
    case 2: return [you(COUCH, [[0, "concentrate"], [word("window") - LEAD, "pressed"]], { reach: SASH, look: -0.7, lookY: () => -0.35, noShadow: true })];
    case 3: return [you(COUCH, [[0, "concentrate"], [word("big") - LEAD, "eyeroll"], [word("ugly") - LEAD, "deadpan"]],
      { reach: (t) => (t < 10.2 ? SASH(t) : undefined), look: (t) => (t < 10.4 ? -0.5 : 0.7), lookY: (t) => (t < 10.4 ? -0.3 : 0.3), noShadow: true })];
    case 5: return [you(COUCH, [[0, "scared"]], { reach: () => WIDE, tilt: (t) => 7 * Math.sin(t * 13) * ez(t, 16.8, 17.1), noShadow: true,
      path: (t) => L([COUCH[0] + 0.02 * Math.sin(t * 13), COUCH[1] + 0.03 * (0.5 + 0.5 * Math.sin(t * 11)), COUCH[2]]) })];
    case 6: case 22: { const T = (t: number) => (id === 6 ? t : 23.05 + (t - 66.95) * 0.12); // 22: the end of 06, slowed down
      return [you(COUCH, id === 6 ? [[0, "scared"], [22.2, "shook"]] : [[0, "shook"]], { noShadow: true,
        look: (t) => { const u = T(t); return u < 19.6 ? 0.8 : u < 20.8 ? -0.8 : u < 21.9 ? 0.85 : 0.6; }, lookY: () => -0.1,
        head: (t) => 10 * ez(T(t), 22.3, 22.8), tilt: (t) => -8 * ez(T(t), 22.3, 22.8) + 3 * Math.sin(t * 15) * (id === 6 ? 1 : 0.2),
        path: (t) => L([COUCH[0] - 0.05 * ez(T(t), 22.3, 22.8), COUCH[1] - 0.12 * ez(T(t), 22.3, 22.8), COUCH[2]]),
        reach: (t) => (T(t) > 22.25 ? [undefined, { ex: 20, ey: -0.4, hx: 10, hy: -1.0, front: true }] : undefined) })]; }
    case 8: return [you([0, 0, 0], [[0, "out"]], { mode: "fall_belly", noShadow: true, path: (t) => L(fly8(t)), ...limp(1) })];
    case 9: return [you(C9, [[0, "out"]], { mode: "fall_belly", noShadow: true, drift: (t) => [0.08 * Math.sin(t * 0.9), 0.12 * Math.sin(t * 1.3), 0.06 * Math.sin(t * 1.1)], ...limp(2) })];
    case 10: return [you(LAND, [[0, "tired"], [word("alone") - LEAD, "worried"]], { mode: "lie_back", noShadow: true, look: (t) => (t > 34.3 ? 0.35 * Math.sin((t - 34.3) * 2) : 0) })];
    case 11: return [you([10, 0.13, -397.1], [[0, "worried"]], { mode: "sit", noShadow: true, look: (t) => 0.85 * Math.sin((t - a) * 2.6), head: (t) => 4 * Math.sin((t - a) * 2.6) })];
    case 12: return [ // over the wire: hands on the top wire, then the run (two acts, the mode swaps at the landing)
      you([0, 0, 0], [[0, "resolve"]], { path: (t) => (t < 38.6 ? L(run12(t)) : null), noShadow: true, tilt: (t) => 6 * Math.sin((t - 37.15) * 5),
        reach: () => [{ ex: -30, ey: 0.15, hx: -34, hy: 0.42, front: true }, { ex: 30, ey: 0.15, hx: 34, hy: 0.42, front: true }] }),
      { ...you([0, 0, 0], [[0, "resolve"], [word("knock") - LEAD, "worried"]], { path: (t) => (t >= 38.6 ? L(run12(t)) : null), noShadow: true, mode: "march", phase: (t) => t * 2.3, look: 0.5 }), i: 7 }];
    case 13: return [who(1, NEIGHBOR, [44.0, 0.4, -443.8], [[0, "confused"]], { look: 0.6 }),
      you([45.1, STEP, -442.45], [[0, "nervous"]], { look: -0.6, reach: (t) => (t > 41.6 ? POSES.point_right : undefined) })];
    case 14: return [who(1, NEIGHBOR, [44.0, 0.4, -443.8], [[0, "squint"]], { look: (t) => (t < 44.1 ? 0.55 : 0.85), lookY: () => -0.1, head: (t) => -5 * ez(t, 44.0, 44.5) })];
    case 15: return [who(1, SURVEYOR, [0, 0, 0], [[0, "concentrate"]], { mode: "stroll", phase: (t) => t * 1.1, path: (t) => L([11.6, 0, walk15(t)]), prop: GPS, reach: () => GPS_UP(0.8), look: 0.4 }),
      you([0, 0, 0], [[0, "deadpan"]], { mode: "stroll", phase: (t) => t * 1.1 + 0.3, path: (t) => L([10.4, 0, walk15(t) + 0.35]), reach: (t) => (t > 46.4 && t < 47.8 ? POSES.point_right : undefined), look: 0.5 }, YOU18B)];
    case 16: return [who(1, SURVEYOR, [11.0, 0, -395.5], [[0, "curious"], [word("seven") - LEAD, "neutral"]], { prop: GPS, reach: () => GPS_UP(), look: 0.5, lookY: () => 0.1 })
    ]; // the lead leaves this frame: at this size both faces and the screen do not fit uncropped
    case 17: return [who(1, SURVEYOR, [11.08, 0, -395.5], [[0, "smile"]], { prop: CLIP, reach: CLIP_R, look: -0.5, lookY: () => 0.3 }),
      you([10.42, 0, -395.25], [[0, "curious"], [word("lived") - LEAD, "sigh"]], { look: 0.55, lookY: (t) => (t < 52.6 ? 0.35 : 0), reach: (t) => (t > 52.7 ? POSES.head_scratch : undefined) }, YOU18B)];
    case 18: return [you([3.5, FL, -0.2], [[0, "deadpan"], [word("danger") - LEAD, "sad"]], { lookY: () => 0.45, look: (t) => 0.5 * Math.sin((t - a) * 1.2), noShadow: true }, YOU18B)];
    case 19: return [you([0, 0, 0], [[0, "sad"]], { mode: "stroll", phase: (t) => t * 1.0, path: (t) => L([walk19(t), 0, 5.2]), lookY: () => 0.55, look: 0.4 }, YOU18B)];
    case 20: { const up = word("lifted") - 0.15, no = word("instead") + 0.25;
      return [you([DOC + 0.2, 0.08, -0.5], [[0, "curious"], [word("dragging") - LEAD, "relief"]], { mode: "sit", seat: 0.56, noShadow: true, lookY: () => -0.35, look: -0.5 }, YOU18B),
        who(1, DOCTOR, [DOC - 0.5, 0.08, -0.32], [[0, "concentrate"], [up, "smile"]], { noShadow: true, prop: PENLIGHT, look: 0.5, lookY: () => 0.1,
          reach: (t) => { const k = ez(t, up, up + 0.45) * (1 - ez(t, no + 0.9, no + 1.2)), s = t > no && t < no + 0.9 ? 18 * Math.sin((t - no) * 14) : 0;
            return [k > 0.01 ? { ex: -24 - 8 * k, ey: 0.45 - 0.8 * k, hx: -12 - 34 * k + s, hy: 0.85 - 2.0 * k, front: true } : undefined,
              { ex: 24, ey: 0.05, hx: 46, hy: -0.35, front: true }]; } })]; }
    case 21: return [you([DOC + 0.25, 0.08, -0.5], [[0, "sheepish"], [word("scratched") - LEAD, "smile"]], { mode: "sit", seat: 0.56, noShadow: true,
      lookY: (t) => (t > word("scratched") - 0.1 ? 0.8 : 0), reach: (t) => (t > 65.15 && t < 65.95 ? POSES.head_scratch : undefined) }, YOU18B)];
    case 24: return [you([3.5, FL, -0.3], [[0, "deadpan"], [word("you", 74) - LEAD, "sigh"]], { reach: () => HANDS_IN, lookY: () => 0.2, noShadow: true }, YOU18B)];
    case 25: { const off = 75.95;
      return [you([0, 0, 0], [[0, "sideeye"]], { noShadow: true, path: (t) => L([lerp(3.52, 4.15, ez(t, off, off + 0.7)), FL, lerp(0.32, 0.55, ez(t, off, off + 0.7))]),
        look: -0.6, lookY: () => 0.25, mode: "stroll", phase: (t) => (t > off && t < off + 0.7 ? (t - off) * 1.6 : 0),
        reach: (t) => (t < off ? [{ ex: -30, ey: 0.42, hx: -60, hy: 0.62, front: true }, undefined] : undefined) }, YOU18B)]; }
    default: return [];
  }
};
export const acts = (id: number): Act[] => ACTS(id);

// ---------------- held props (drawn in the card between arms and hands) ----------------
const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, px: number, col: string, weight = 900, font = `"Segoe UI Black", "Arial Black", Arial, sans-serif`, align: CanvasTextAlign = "center") => {
  g.save(); g.textAlign = align; g.textBaseline = "middle"; g.font = `${weight} ${px}px ${font}`; g.fillStyle = col; g.fillText(s, x, y); g.restore();
};
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string, lw = 0) => {
  g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); if (stroke) { g.lineWidth = lw; g.strokeStyle = stroke; g.stroke(); }
};
/** local px about card point c (rotated, scaled), following the body tilt (ep16) */
const local = (p: Pen, c: [number, number], ang: number, s: number, fn: (g: CanvasRenderingContext2D) => void) => {
  const g = p.g, [x, y] = p.P(c[0], c[1]), r = p.rot; g.save(); g.translate(x, y); g.rotate(ang + (r ? r[0] : 0)); g.scale(s, s); p.rot = null;
  try { fn(g); } finally { p.rot = r; g.restore(); }
};
/** the handheld GPS, 300 x 560 px: rugged yellow body, stub antenna, a big LCD "1,307 FT" (plain device, no logo) */
const gpsFace = (g: CanvasRenderingContext2D) => {
  rr(g, 120, -40, 60, 70, 20, "#2b2f3a", INK, 8);
  rr(g, 0, 0, 300, 560, 46, "#e0a62a", INK, 10); rr(g, 22, 30, 256, 330, 20, "#2b2f3a");
  rr(g, 36, 44, 228, 302, 12, "#d8e6c8");
  text(g, "DIST", 150, 92, 40, "#3a4a3a", 800, "Arial, sans-serif");
  text(g, "1,307", 150, 196, 92, "#10140f");
  text(g, "FT", 150, 290, 70, "#10140f");
  for (const [x, y] of [[90, 430], [210, 430], [150, 500]] as number[][]) { g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.fillStyle = "#2b2f3a"; g.fill(); }
};
const GPS: Prop = { k: "gps18", draw: (p, h, u) => { const c = h[1]; if (!c) return; local(p, c, 0.05, 0.17 * u, (g) => { g.translate(-150, -500); gpsFace(g); }); } };
/** the survey clipboard, 800 x 1000 px, hanging from both hands at the top corners */
const clipFace = (g: CanvasRenderingContext2D) => {
  rr(g, 0, 0, 800, 1000, 30, "#9a6a3a", INK, 10); rr(g, 50, 70, 700, 890, 8, "#f4f1e6", INK, 6); rr(g, 290, -10, 220, 90, 18, "#8a8f98", INK, 8);
  text(g, "STORM SURVEY", 400, 160, 70, "#1d1a3a");
  g.fillStyle = "#9a9484"; g.fillRect(90, 210, 620, 6);
  text(g, "RATING:", 110, 290, 52, "#3a4256", 800, "Arial, sans-serif", "left"); text(g, "F2", 690, 290, 70, "#c62f2f", 900, undefined, "right");
  text(g, "CARRIED", 400, 420, 66, "#1d1a3a");
  text(g, "1,307 FT", 400, 530, 110, "#1d1a3a");
  rr(g, 120, 640, 560, 150, 20, "#e3f3e8", "#2f8a55", 8); text(g, "SURVIVED", 400, 716, 84, "#2f8a55");
  g.fillStyle = "#c9c2ad"; for (let i = 0; i < 2; i++) g.fillRect(110, 850 + i * 44, 580, 6);
};
const CLIP: Prop = { k: "clip18", draw: (p, h, u) => { const a = h[0], b = h[1]; if (!a || !b) return;
  const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], w = Math.abs(b[0] - a[0]) + 14 * u;
  local(p, mid, Math.atan2(b[1] - a[1], b[0] - a[0]), w / 800, (g) => { g.translate(-400, -60); clipFace(g); }); } };
/** the doctor's penlight in the left hand (screen right), its beam toward you */
const PENLIGHT: Prop = { k: "pen18", draw: (p, h, u) => { const c = h[1]; if (!c) return; local(p, c, -0.35, 0.16 * u, (g) => {
  rr(g, -20, -30, 150, 44, 18, "#3a4256", INK, 8); rr(g, 120, -26, 30, 36, 8, "#c9ccd4", INK, 6);
  const r = g.createRadialGradient(165, -8, 0, 165, -8, 70); r.addColorStop(0, "rgba(255,250,220,0.95)"); r.addColorStop(1, "rgba(255,250,220,0)"); g.fillStyle = r; g.fillRect(95, -78, 140, 140); }); } };

// ---------------- fx ----------------
const xyz = ([x, y, z]: V3) => ({ x, y, z });
/** a card pinned to the screen of shot `id` at time t: centre (sx, sy) in 1080 x 1920 px, width wpx, d m from the lens (ep12) */
const scr = (id: number, t: number, sx: number, sy: number, wpx: number, d: number) => {
  const c = camAt(id, Math.round(t * 30)), f = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]], n = Math.hypot(f[0], f[1], f[2]);
  f[0] /= n; f[1] /= n; f[2] /= n;
  const rl = Math.hypot(f[2], f[0]), r = [-f[2] / rl, 0, f[0] / rl], u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const px = (2 * d * Math.tan((c.fov * Math.PI) / 360)) / 1920, ox = (sx - 540) * px, oy = (960 - sy) * px;
  return { x: c.pos[0] + f[0] * d + r[0] * ox + u[0] * oy, y: c.pos[1] + f[1] * d + r[1] * ox + u[1] * oy, z: c.pos[2] + f[2] * d + r[2] * ox + u[2] * oy, w: wpx * px };
};
const glow = (col: string) => (p: Pen) => { const g = p.g, r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, col); r.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = r; g.fillRect(0, 0, 128, 128); };
const hh = (k: number) => { const v = Math.sin(k * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
/** rain streaks, 540 x 960, 4 phases */
const rain = (ph: number, alpha = 0.34) => (p: Pen) => { const g = p.g; g.strokeStyle = `rgba(205,218,255,${alpha})`; g.lineCap = "round";
  for (let i = 0; i < 110; i++) { const x = hh(i) * 600 - 30, y = ((hh(i + 300) * 960 + ph * 240) % 1000) - 40, l = 34 + 40 * hh(i + 600); g.lineWidth = 1.6 + 1.4 * hh(i + 900);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x - 0.22 * l, y + l); g.stroke(); } };
/** a lightning bolt, 200 x 600, seeded */
const bolt = (s: number) => (p: Pen) => { const g = p.g, pts: [number, number][] = [[100 + 30 * (hh(s) - 0.5), 0]];
  for (let i = 1; i <= 9; i++) pts.push([pts[i - 1][0] + 60 * (hh(s + i) - 0.5), i * 66]);
  for (const [w, c] of [[16, "rgba(170,190,255,0.35)"], [6, "#f4f6ff"]] as [number, string][]) { g.strokeStyle = c; g.lineWidth = w; g.lineJoin = "round"; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); } };
/** lightning: strike times per shot (raw s), the sky point it lights (set-local), whether a bolt is seen */
const STRIKE: Record<number, { at: number[]; sky: V3; bolt?: V3; size?: number }> = {
  1: { at: [0.3, 2.9, 4.4], sky: [-30, 70, -95], bolt: [-48, 40, -110], size: 160 }, 2: { at: [6.4, 8.6], sky: [3.9, 2.4, -7] }, 3: { at: [11.6], sky: [3.9, 2.4, -7] },
  4: { at: [13.4, 15.5], sky: [-50, 110, -300], bolt: [-90, 60, -330], size: 260 }, 5: { at: [17.2], sky: [3.9, 2.4, -7] }, 6: { at: [21.4], sky: [10, 2.2, 0.4] },
  8: { at: [26.0, 28.3], sky: [2, 66, -150], size: 70 }, 9: { at: [29.8, 31.1], sky: [C9[0], C9[1] - 11, C9[2]], size: 60 },
  10: { at: [33.4], sky: [-60, 40, -520], size: 200 }, 11: { at: [36.2], sky: [-30, 30, -500], bolt: [-40, 22, -520], size: 180 }, 12: { at: [39.6], sky: [80, 50, -520], size: 200 }, 14: { at: [44.7], sky: [60, 20, -470], size: 160 },
};
const flash = (id: number, t: number) => Math.max(0, ...(STRIKE[id]?.at ?? []).map((s) => { const d = t - s; return d < 0 || d > 0.45 ? 0 : (d < 0.07 ? 1 : d < 0.12 ? 0.45 : d < 0.17 ? 0.9 : 0.9 * Math.exp(-(d - 0.17) * 9)); }));
const NIGHT_OUT = new Set([1, 4, 10, 11, 12, 13, 14]), INSIDE = new Set([2, 3, 5, 6, 7, 22, 23]);
/** a pane of glass in the grass, cracked, 400 x 300 */
const paneDraw = (p: Pen) => { const g = p.g; rr(g, 6, 6, 388, 288, 6, "rgba(170,205,225,0.92)", "#e8e2d4", 12);
  g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 4; for (const [x, y] of [[60, 20], [380, 70], [330, 280], [20, 230], [200, 10]]) { g.beginPath(); g.moveTo(170, 140); g.lineTo(x, y); g.stroke(); }
  g.lineWidth = 3; g.beginPath(); g.arc(170, 140, 55, 0, Math.PI * 2); g.stroke(); };
/** the survey stake: a wooden peg with an orange flag "1,307 FT", 300 x 900 */
const stakeDraw = (p: Pen) => { const g = p.g; rr(g, 128, 120, 44, 780, 8, "#b08a5a", INK, 7);
  g.beginPath(); g.moveTo(172, 130); g.lineTo(292, 150); g.lineTo(292, 330); g.lineTo(172, 350); g.closePath(); g.fillStyle = "#f07a2a"; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
  g.save(); g.translate(232, 240); g.rotate(-Math.PI / 2); text(g, "1,307 FT", 0, 0, 44, "#ffffff"); g.restore(); };
const board = (col: string) => (p: Pen) => { rr(p.g, 4, 30, 392, 40, 6, col, INK, 6); };
const leafDraw = (p: Pen) => { const g = p.g; g.beginPath(); g.ellipse(50, 50, 44, 20, 0.4, 0, Math.PI * 2); g.fillStyle = "#4f7a3a"; g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); };
const meadow = (p: Pen) => { const g = p.g, gr = g.createRadialGradient(512, 512, 250, 512, 512, 512); gr.addColorStop(0, "#90aa8c"); gr.addColorStop(0.7, "#668a60"); gr.addColorStop(1, "rgba(106,138,70,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024); g.lineCap = "round";
  for (let i = 0; i < 260; i++) { const a = hh(i) * 6.283, r = 470 * Math.sqrt(hh(i + 5000)), x = 512 + r * Math.cos(a), y = 512 + r * Math.sin(a), l = 26 + 30 * hh(i + 9000), b = (hh(i + 7000) - 0.5) * 0.9;
    g.strokeStyle = i % 3 ? "#4e6e40" : "#6c8c58"; g.lineWidth = 9; g.globalAlpha = Math.min(1, (512 - r) / 80);
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l * 0.2 * Math.sin(b), y - l * 0.6, x + l * Math.sin(b), y - l); g.stroke(); }
  g.globalAlpha = 1; };
/** the shade's world centre from the lamp pose (story.ts lampAt) */
const shadeAt = (id: number, t: number): V3 => { const l = lampAt(id, t); return L([l.at[0] - 0.86 * Math.sin(l.rz), l.at[1] + 0.86 * Math.cos(l.rz) * Math.cos(l.rx), l.at[2] + 0.86 * Math.sin(l.rx)]); };
/** the home's lit windows seen from outside (04): warm panes, your silhouette in the living-room one */
const winGlow = (who: boolean) => (p: Pen) => { const g = p.g, r = g.createLinearGradient(0, 0, 0, 200); r.addColorStop(0, "#ffd98a"); r.addColorStop(1, "#f2a050"); g.fillStyle = r; g.fillRect(0, 0, 300, 200);
  if (who) { g.fillStyle = "#2a2036"; g.beginPath(); g.arc(150, 70, 28, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(150, 200, 56, 90, 0, Math.PI, 0); g.fill(); g.fillRect(96, 30, 14, 90); g.fillRect(190, 30, 14, 90); } };

export const fx = (id: number, t: number, out: Stage) => {
  const [a] = sec(id), k = flash(id, t), st = STRIKE[id];
  // the storm light behind the funnel and on the far sky, always on: the sky's one real light between strikes
  const GLOW: Record<number, [V3, number]> = { 1: [[-1, 60, -130], 190], 4: [[-40, 70, -340], 360], 11: [[-135, 22, -240], 240], 12: [[30, 30, -570], 320] };
  if (GLOW[id]) out.fx.push({ key: "stormglow", cw: 128, ch: 128, soft: true, noFog: true, draw: glow("rgba(190,205,240,0.68)"), ...xyz(L(GLOW[id][0])), w: GLOW[id][1], h: GLOW[id][1] * 0.8 });
  // lightning: the sky glow, a bolt, and a faint wash over the frame
  if (st && k > 0.02) {
    const s = st.size ?? 9, kq = q(k, 8);
    out.fx.push({ key: `skyflash|${kq}`, cw: 128, ch: 128, soft: true, noFog: true, draw: glow(`rgba(200,214,255,${kq})`), ...xyz(L(st.sky)), w: s, h: s });
    if (st.bolt && k > 0.4) { const n = Math.floor(t * 3); out.fx.push({ key: `bolt|${id}|${n}`, cw: 200, ch: 600, noFog: true, draw: bolt(id * 7 + n), ...xyz(L(st.bolt)), w: (st.size ?? 100) * 0.12, h: (st.size ?? 100) * 0.36 }); }
    const c = scr(id, t, 540, 960, 1200, 0.9); out.fx.push({ key: `wash|${kq}`, cw: 64, ch: 64, soft: true, noFog: true, draw: (p) => { p.g.fillStyle = `rgba(190,205,255,${q(0.16 * kq, 20)})`; p.g.fillRect(0, 0, 64, 64); }, ...c, h: c.w * 1920 / 1080 });
  }
  // rain on the lens side of every night exterior, and on the back window inside
  if (NIGHT_OUT.has(id)) { const ph = q((t * 6) % 1, 4), c = scr(id, t, 540, 960, 1150, 1.4); out.fx.push({ key: `rain|${ph}`, cw: 540, ch: 960, soft: true, draw: rain(ph * 4), ...c, h: c.w * 1920 / 1080 }); }
  if (id === 2 || id === 3 || id === 5) { const ph = q((t * 6) % 1, 4); out.fx.push({ key: `winrain|${ph}`, cw: 540, ch: 960, soft: true, draw: rain(ph * 4, 0.6), ...xyz(L([3.85, 1.95, -2.15])), w: 1.25, h: 0.85, face: [0, 0, 1] }); }
  // the lamp: its warm halo while lit (the room's one light)
  const lp = lampAt(id, t);
  if ((INSIDE.has(id) || id === 1) && lp.vis && lp.lit) { const c = shadeAt(id, t); out.fx.push({ key: "lamphalo", cw: 128, ch: 128, soft: true, noFog: true, draw: glow("rgba(255,196,110,0.42)"), ...xyz(c), w: 1.5, h: 1.5 }); }
  if (id === 7 && t >= 24.26) { const c = scr(7, t, 540, 960, 1300, 0.12), e = q(Math.max(0, 1 - (t - 24.26) / 0.5), 10); // the bulb pops: the room goes black (deep navy, the filament's ember)
    out.fx.push({ key: `black|${e}`, cw: 270, ch: 480, noFog: true, draw: (p) => { const g = p.g; g.fillStyle = "#2c2850"; g.fillRect(0, 0, 270, 480);
      if (e > 0) { const r = g.createRadialGradient(150, 230, 0, 150, 230, 60); r.addColorStop(0, `rgba(255,150,60,${e})`); r.addColorStop(1, "rgba(255,150,60,0)"); g.fillStyle = r; g.fillRect(60, 140, 180, 180); } }, ...c, h: c.w * 1920 / 1080 }); }
  // 04: the lit windows, you in the living-room one
  if (id === 4) for (const [x, w, who] of [[3.55, 1.3, true], [-2.5, 1.0, false], [-5.2, 1.0, false]] as [number, number, boolean][])
    out.fx.push({ key: `win18|${who}`, cw: 300, ch: 200, noFog: true, draw: winGlow(who), ...xyz(L([x, FL + 1.32, 2.12])), w, h: 0.85, face: [0, 0, 1] });
  if (id === 4) out.fx.push({ key: "homeglow", cw: 128, ch: 128, soft: true, noFog: true, draw: glow("rgba(255,200,120,0.5)"), ...xyz(L([2, 1.2, 3.5])), w: 9, h: 5, flat: true });
  // the air: boards, a shingle, leaves tumbling round you, never near the head
  if (id === 8 || id === 9) { const c = id === 8 ? fly8(t) : C9;
    for (let i = 0; i < (id === 9 ? 7 : 4); i++) { const ang = i * 0.9 + (t - a) * (0.35 + 0.05 * i), r = 6 + 2.2 * i, leaf = i % 3 === 2;
      out.fx.push({ key: leaf ? "leaf18" : `board18|${i % 2}`, cw: leaf ? 100 : 400, ch: leaf ? 100 : 100, draw: leaf ? leafDraw : board(i % 2 ? "#b08a5a" : "#5a5058"),
        x: SO[0] + c[0] + r * Math.cos(ang), y: c[1] + (i % 2 ? 1.5 : -2.5) + 0.8 * Math.sin(t + i), z: c[2] + r * Math.sin(ang) - 2, w: leaf ? 0.4 : 1.6, h: leaf ? 0.4 : 0.4, rot: q((t * (1 + 0.3 * i) + i) % 6.283, 12) }); } }
  // 10: the wet meadow round you
  if (id === 10) out.fx.push({ key: "meadow18", cw: 1024, ch: 1024, draw: meadow, ...xyz(L([LAND[0], 0.055, LAND[2] - 0.9])), w: 7.5, h: 7.5, flat: true });
  // the porch: the bulb, its pool, the warm hall behind the Neighbor
  if (id === 12 || id === 13 || id === 14) {
    out.fx.push({ key: "porchbulb", cw: 128, ch: 128, soft: true, noFog: true, draw: glow("rgba(255,222,150,1)"), ...xyz(L([45.25, 2.62, -443.85])), w: id === 12 ? 2.2 : 0.7, h: id === 12 ? 2.2 : 0.7 });
    out.fx.push({ key: "porchpool", cw: 128, ch: 128, soft: true, noFog: true, draw: glow("rgba(255,214,140,0.5)"), ...xyz(L([44.6, 0.43, -443.3])), w: 4.0, h: 1.8, flat: true });
    out.fx.push({ key: "hall18", cw: 64, ch: 128, noFog: true, draw: (p) => { const g = p.g, r = g.createLinearGradient(0, 0, 0, 128); r.addColorStop(0, "#f6c27a"); r.addColorStop(1, "#c8803e"); g.fillStyle = r; g.fillRect(0, 0, 64, 128); },
      ...xyz(L([44, 1.5, -443.89])), w: 1.08, h: 2.16, face: [0, 0, 1] }); }
  // dawn: the survey stake + its tape back toward the home; the cracked pane in 19
  if (id >= 15 && id <= 17) { if (id !== 17) out.fx.push({ key: "stake18", cw: 300, ch: 900, draw: stakeDraw, ...xyz(L(id === 16 ? [10.96, 0.63, -394.95] : [10.72, 0.55, -396.2])), w: 0.37, h: 1.1 }); // 17: the form carries it
    out.fx.push({ key: "tape18", cw: 16, ch: 512, draw: (p) => { p.g.fillStyle = "#f2c230"; p.g.fillRect(0, 0, 16, 512); }, ...xyz(L([10.6, 0.055, -392.2])), w: 0.04, h: 6, flat: true, rot: 0.02 }); }
  if (id === 21) for (const dx of [-0.24, 0.24]) out.fx.push({ key: "scratch18", cw: 120, ch: 60, draw: (p) => { const g = p.g; g.strokeStyle = "#d85a5a"; g.lineWidth = 5; g.lineCap = "round"; for (const [x, y] of [[24, 16], [58, 12], [90, 22]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 16, y + 26); g.stroke(); } },
    ...xyz(L([DOC + 0.33 + dx, 0.17, -0.44])), w: 0.12, h: 0.06 });
  if (id === 19 || id === 18 || id === 24) out.fx.push({ key: "pane18", cw: 400, ch: 300, draw: paneDraw, ...xyz(L([-1.9, 0.33, 4.15])), w: 1.0, h: 0.75, face: [0, 0.75, 0.66] }); // leans on nothing visible: tipped toward the lens so it reads
};
