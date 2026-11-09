// What If ep11 acting: you wake up green and photosynthesize. Timed to the voice words, plus the shot fx (the energy HUD,
// sun, clock, solar panel, toast, tree tags, the skin on the court). scr() pins a card to the screen for one shot.
import { Pen, Outfit, FrontOpts, INK, POSES, fxExclaim, fxStars } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, q } from "../../act";
import { YOU } from "../people";
import { SHOTS } from "./story";
import words from "./words";

export const GREEN: Outfit = { ...YOU, skin: "#7ccb5a" };

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
const ease = (x: number) => { const k = clamp01(x); return k * k * (3 - 2 * k); };
const STARE: Pose = [{ ex: -24, ey: 0.3, hx: -16, hy: -0.2, front: true }, { ex: 24, ey: 0.3, hx: 16, hy: -0.2, front: true }]; // both hands up in front, palms in
const WIDE: Pose = [{ ex: -30, ey: -0.05, hx: -60, hy: -0.28, front: true }, { ex: 30, ey: -0.05, hx: 60, hy: -0.28, front: true }];
const MOUTH: Pose = [{ ex: -10, ey: 0.15, hx: 24, hy: -0.3, front: true }, undefined];
const CHEST: Pose = [{ ex: -14, ey: 0.3, hx: -8, hy: 0.3, front: true }, undefined];

// set-local marks
const YOUP: V3 = [0, 0, 0];            // park
const BY: V3 = [-0.3, 0, -0.6];        // kitchen, beside the island
const SUNNY: V3 = [0.6, 0, -1.6];      // kitchen, in the window light
const TREE: V3 = [-5, 0, -4];          // park
const NEAR: V3 = [12, 0, 7.1];         // park, behind the near baseline
const COURT = { z0: 5.885, z1: -17.885, w: 10.97 };

const ACTS = (id: number): Act[] => {
  switch (id) {
    case 1: return [{ i: 0, o: GREEN, at: L(1, YOUP), mode: "stand", expr: [[0, "proud"], [word("bite") - LEAD, "deadpan"]], reach: () => POSES.hold_out, look: (t) => (t > word("bite") ? -0.5 : 0) }];
    case 2: { const g = word("green");
      return [{ i: 0, o: GREEN, at: L(2, BY), mode: "stand", expr: [[0, "tired"], [g - LEAD, "shock"]], reach: (t) => (t > word("wake") ? STARE : undefined), lookY: () => 0.7, head: (t) => (t > g ? 4 : 0) }]; }
    case 3: return [{ i: 0, o: GREEN, at: L(3, SUNNY), mode: "stand", expr: [[0, "curious"], [word("sunlight") - LEAD, "excited"]], look: 0.5, lookY: () => -0.5, reach: () => POSES.hands_up }];
    case 4: { const c = word("cancel");
      return [{ i: 0, o: GREEN, at: L(4, BY), mode: "stand", expr: [[0, "confident"]], look: -0.6, reach: (t) => (t < c ? CHEST : POSES.hold_out) }]; }
    case 5: { const a = 9.5, b = 10.35;
      return [
        { i: 0, o: GREEN, at: L(5, YOUP), mode: "stroll", phase: (t) => t * 1.7, expr: [[0, "excited"]], face: 1, path: (t) => (t < b ? L(5, [-2.2 + 2.2 * clamp01((t - a) / (b - a)), 0, 0]) : null) },
        { i: 0, o: GREEN, at: L(5, YOUP), mode: "stand", expr: [[0, "excited"]], reach: () => POSES.hands_up, path: (t) => (t >= b ? L(5, YOUP) : null) },
      ]; }
    case 6: return [{ i: 0, o: GREEN, at: L(6, YOUP), mode: "stand", expr: [[0, "proud"], [word("day", 12) - LEAD, "relief"]], reach: () => WIDE, lookY: () => -0.6 }];
    case 7: return [{ i: 0, o: GREEN, at: L(7, YOUP), mode: "stand", expr: [[0, "relief"], [word("solar") - LEAD, "proud_chin"]], reach: () => WIDE }];
    case 8: return [{ i: 0, o: GREEN, at: L(8, YOUP), mode: "stand", expr: [[0, "curious"], [word("one", 18.4) - LEAD, "jawdrop"], [word("burn") - LEAD, "deadpan"]], lookY: () => -1, look: 0.2, reach: (t) => (t < word("one", 18.4) - 0.1 ? POSES.chin_think : undefined) }];
    case 10: { const r = word("runs"), r1 = r + 0.95;
      return [
        { i: 0, o: GREEN, at: L(10, [-2.4, 0, -1.2]), mode: "stand", expr: [[0, "curious"], [word("thinks") - LEAD, "concentrate"], [word("thousands") - LEAD, "shook"]], lookY: () => -0.8, look: -0.6,
          reach: (t) => (t > word("thinks") - 0.2 ? POSES.chin_think : undefined), path: (t) => (t < r - 0.3 || t >= r1 ? L(10, [t < r ? -1.2 : -2.4, 0, -1.2]) : null) },
        { i: 0, o: GREEN, at: L(10, [-2.4, 0, -1.2]), mode: "stroll", phase: (t) => t * 3.2, expr: [[0, "pained"]], face: -1, path: (t) => (t >= r - 0.3 && t < r1 ? L(10, [-1.2 - 1.2 * clamp01((t - r + 0.3) / 1.25), 0, -1.2]) : null) },
      ]; }
    case 12: return [{ i: 0, o: GREEN, at: L(12, NEAR), mode: "stand", expr: [[0, "curious"], [word("court", 43.5) - LEAD, "jawdrop"]], reach: () => WIDE, lookY: () => -0.4 }];
    case 15: return [{ i: 0, o: GREEN, at: L(15, YOUP), mode: "stroll", phase: (t) => t * 1.5, expr: [[0, "tired"]], face: -1, path: (t) => L(15, [1.3 - 2.8 * clamp01((t - 55.4) / 2.35), 0, 0]) }];
    case 16: { const b = word("bite", 59);
      return [{ i: 0, o: GREEN, at: L(16, BY), mode: "stand", expr: [[0, "excited"], [b - LEAD, "laugh"]], look: (t) => (t < b - 0.5 ? -0.7 : 0), reach: (t) => (t > b - 0.35 ? MOUTH : POSES.hold_out) }]; }
    case 17: return [{ i: 0, o: GREEN, at: L(17, BY), mode: "stand", expr: [[0, "deadpan"], [word("earned") - LEAD, "sad"]], lookY: () => -0.9, reach: () => POSES.hold_out, tilt: (t) => 0.8 * Math.sin(t * 16) }];
    case 18: return [{ i: 0, o: GREEN, at: L(18, YOUP), mode: "stand", expr: [[0, "sly"], [word("green", 64) - LEAD, "smirk_wink"]], reach: (t) => (t > word("still", 63) ? POSES.shrug : undefined) }];
    default: return [];
  }
};
export const acts = ACTS;

// ---------------- the energy story: 1 % in the hook, 0 at breakfast, 1 % by "one percent", gone with the bite ----------------
const energy = (t: number) => {
  if (t < 4.3) return 1;
  if (t < 11) return 0;
  if (t < word("one", 18.4)) return 0.9 * ease((t - 11) / (word("one", 18.4) - 11));
  return 1 - ease((t - word("bite", 60)) / (word("everything") + 0.3 - word("bite", 60)));
};

// ---------------- fx drawings ----------------
const popIn = (t: number, t0: number) => clamp01((t - t0) / 0.12) * (1 + 0.15 * Math.sin(clamp01((t - t0) / 0.3) * Math.PI));
const text = (p: Pen, s: string, x: number, y: number, px: number, col: string, stroke = INK) => {
  const g = p.g; g.save(); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${px}px "Arial Black", Arial, sans-serif`;
  g.lineJoin = "round"; g.lineWidth = px * 0.16; g.strokeStyle = stroke; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); g.restore();
};
const panel = (p: Pen, x0: number, y0: number, x1: number, y1: number, fill: string, ol = 8) => {
  const r = 26; p.poly([[x0 + r, y0], [x1 - r, y0], [x1, y0 + r], [x1, y1 - r], [x1 - r, y1], [x0 + r, y1], [x0, y1 - r], [x0, y0 + r]], fill, ol);
};
const rad = (d: number) => (d * Math.PI) / 180;
/** the energy HUD, 800 x 200 (or x 290 with a line under it): bolt, battery, percent; v 0..1 = the percent figure */
const hud = (p: Pen, v: number, sub?: string) => {
  const H = sub ? 290 : 200;
  panel(p, 6, 6, 794, H - 6, "#0b1a33", 8);
  p.poly([[72, 30], [36, 108], [66, 108], [50, 172], [104, 86], [72, 86], [92, 30]], "#ffd23f", 5);
  panel(p, 120, 44, 590, 156, "#f4f1ea", 7); p.poly([[592, 76], [616, 76], [616, 124], [592, 124]], "#f4f1ea", 7);
  panel(p, 132, 56, 578, 144, "#2b2f3a", 0);
  if (v > 0.02) p.poly([[136, 60], [136 + Math.max(7, 16 * v), 60], [136 + Math.max(7, 16 * v), 140], [136, 140]], "#ff5a4f", 0);
  text(p, "ENERGY", 356, 100, 42, "rgba(223,233,247,.55)", "#2b2f3a");
  text(p, `${Math.floor(v + 1e-6)}%`, 708, 100, 84, v < 1 ? "#dfe9f7" : "#ff5a4f", "#0b1a33");
  if (sub) text(p, sub, 400, 226, 56, "#ffd23f", "#0b1a33");
};
/** a slice-of-bread outline around (ox, oy), s = half width: a two-lobed crown over a square body */
const slice = (ox: number, oy: number, s: number): [number, number][] => {
  const pts: [number, number][] = [];
  for (const cx of [-0.48, 0.48]) for (let i = 0; i <= 12; i++) { const a = rad(180 + i * 15); pts.push([ox + cx * s + 0.52 * s * Math.cos(a), oy - 0.45 * s + 0.42 * s * Math.sin(a)]); }
  pts.push([ox + 0.82 * s, oy - 0.2 * s], [ox + 0.82 * s, oy + 0.8 * s], [ox + 0.72 * s, oy + 0.92 * s], [ox - 0.72 * s, oy + 0.92 * s], [ox - 0.82 * s, oy + 0.8 * s], [ox - 0.82 * s, oy - 0.2 * s]);
  return pts;
};
/** a slice of toast: crust, browned crumb, a butter pat */
const bread = (p: Pen, ox: number, oy: number, s: number) => {
  p.poly(slice(ox, oy, s), "#a9652a", 8);
  p.poly(slice(ox, oy + 0.02 * s, s * 0.85), "#e9b86a", 0);
  p.ell(ox, oy + 0.1 * s, 0.5 * s, 0.45 * s, "#d4933f", 0);
  p.rot = [rad(14), ox, oy]; p.poly([[ox - 0.28 * s, oy - 0.2 * s], [ox + 0.28 * s, oy - 0.2 * s], [ox + 0.28 * s, oy + 0.3 * s], [ox - 0.28 * s, oy + 0.3 * s]], "#ffe680", 5); p.rot = null;
};
/** a bite out of the top-right corner: scalloped tooth marks erased from what is drawn */
const biteOut = (p: Pen, ox: number, oy: number, s: number) => {
  const g = p.g, spots: [number, number, number][] = [[0.4, -0.75, 0.3], [0.72, -0.42, 0.3], [0.85, -0.05, 0.25], [0.05, -0.92, 0.25], [0.8, -0.85, 0.5]];
  for (const [x, y, r] of spots) p.ell(ox + x * s, oy + y * s, (r + 0.03) * s, (r + 0.03) * s, "#a9652a", 0);
  g.save(); g.globalCompositeOperation = "destination-out";
  for (const [x, y, r] of spots) { g.beginPath(); g.arc(ox + x * s, oy + y * s, r * s, 0, 7); g.fill(); }
  g.restore();
};
/** the toast, 400 x 400; "morsel" = the hook: all that one day earns, the rest only a ghost of the slice */
const toast = (p: Pen, kind: "whole" | "bitten" | "morsel", ox = 200, oy = 190, s = 180) => {
  if (kind === "morsel") { const g = p.g;
    g.save(); g.globalAlpha = 0.45; bread(p, ox, oy, s); g.restore();
    p.clip(Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2, r = 0.55 * s * (1 + 0.08 * Math.sin(a * 7)); return [ox + 0.6 * s + r * Math.cos(a), oy - 0.6 * s + r * Math.sin(a)] as [number, number]; }), () => {
      p.poly(slice(ox, oy, s), "#a9652a", 8); p.poly(slice(ox, oy + 0.02 * s, s * 0.85), "#e9b86a", 0); p.ell(ox + 0.4 * s, oy - 0.3 * s, 0.32 * s, 0.3 * s, "#d4933f", 0);
    });
    return; }
  bread(p, ox, oy, s);
  if (kind === "bitten") biteOut(p, ox, oy, s);
};
/** a white plate seen from above, 460 x 460, with something on it */
const plate = (p: Pen, kind: "morsel" | "breakfast", cancel = 0) => {
  p.ell(230, 230, 222, 222, "#f4f1ea", 8); p.ell(230, 230, 168, 168, "#ffffff", 4);
  if (kind === "morsel") toast(p, "morsel", 230, 240, 112);
  else { toast(p, "whole", 180, 230, 84);
    p.poly(Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2, r = 70 + 12 * Math.sin(a * 5); return [320 + r * Math.cos(a), 270 + r * Math.sin(a)] as [number, number]; }), "#ffffff", 5); p.ell(320, 268, 30, 30, "#ffb627", 4); } // fried egg
  if (cancel > 0) { p.rot = [rad(-14), 230, 230]; panel(p, 16, 176, 444, 284, "#ff5a4f", 8); p.rot = null; text(p, "CANCELLED", 230, 232, 58, "#ffffff", "#7a1a14"); }
};
/** the sun, 400 x 400, rays turned by a */
const sun = (p: Pen, a: number) => {
  for (let i = 0; i < 12; i++) { const r = rad(i * 30 + a); p.stroke([[200 + 130 * Math.cos(r), 200 + 130 * Math.sin(r)], [200 + (i % 2 ? 175 : 195) * Math.cos(r), 200 + (i % 2 ? 175 : 195) * Math.sin(r)]], 16, "#ffb627"); }
  p.ell(200, 200, 112, 112, "#ffd23f", 8);
};
/** a wall clock face, 300 x 300; h = hours on a 12 h face */
const clock = (p: Pen, h: number) => {
  p.ell(150, 150, 138, 138, "#f4f1ea", 9);
  for (let i = 0; i < 12; i++) { const a = rad(i * 30 - 90); p.stroke([[150 + 108 * Math.cos(a), 150 + 108 * Math.sin(a)], [150 + 126 * Math.cos(a), 150 + 126 * Math.sin(a)]], i % 3 ? 5 : 11, INK); }
  const ah = rad(h * 30 - 90), am = rad((h % 1) * 360 - 90);
  p.stroke([[150, 150], [150 + 62 * Math.cos(ah), 150 + 62 * Math.sin(ah)]], 15, INK);
  p.stroke([[150, 150], [150 + 100 * Math.cos(am), 150 + 100 * Math.sin(am)]], 9, "#ff3b30");
  p.dot(150, 150, 12, INK);
};
/** a solar panel on a post, 520 x 620 */
const solar = (p: Pen) => {
  p.poly([[240, 330], [280, 330], [280, 600], [240, 600]], "#8a93a3", 7); p.poly([[170, 590], [350, 590], [370, 616], [150, 616]], "#8a93a3", 7);
  p.poly([[70, 30], [450, 30], [510, 340], [10, 340]], "#16325c", 10);
  for (let i = 1; i < 4; i++) p.stroke([[70 + 95 * i, 30], [10 + 125 * i, 340]], 5, "#7fb0e8");
  for (let i = 1; i < 4; i++) { const k = i / 4; p.stroke([[70 - 60 * k, 30 + 310 * k], [450 + 60 * k, 30 + 310 * k]], 5, "#7fb0e8"); }
  p.poly([[120, 40], [190, 40], [110, 330], [40, 330]], "rgba(255,255,255,.22)", 0);
};
/** soft window light, 600 x 1000: a slanted shaft from the top right */
const beam = (p: Pen) => p.poly([[420, 0], [600, 0], [330, 1000], [20, 1000]], "rgba(255,228,130,.38)", 0);
/** thought bubble: sun -> toast, 520 x 360 */
const think = (p: Pen) => {
  p.ell(260, 150, 245, 140, "#ffffff", 8); p.ell(130, 310, 30, 22, "#ffffff", 6); p.ell(82, 340, 15, 12, "#ffffff", 5);
  p.ell(120, 150, 58, 58, "#ffd23f", 6);
  for (let i = 0; i < 8; i++) { const a = rad(i * 45); p.stroke([[120 + 68 * Math.cos(a), 150 + 68 * Math.sin(a)], [120 + 88 * Math.cos(a), 150 + 88 * Math.sin(a)]], 9, "#ffb627"); }
  p.stroke([[220, 150], [280, 150]], 14, INK); p.poly([[276, 124], [316, 150], [276, 176]], INK, 0);
  toast(p, "whole", 400, 150, 62);
};
/** a green leaf, 200 x 200; a = sway angle in degrees */
const leaf = (p: Pen, a: number, col = "#5fb04a") => {
  p.rot = [rad(a), 100, 100];
  p.poly([[100, 10], [160, 60], [172, 118], [100, 190], [28, 118], [40, 60]], col, 6);
  p.stroke([[100, 24], [100, 186]], 5, "#2f6b2c");
  p.rot = null;
};
/** a wooden tag, 620 x 300, on two strings */
const tag = (p: Pen, s: string) => {
  p.stroke([[140, 0], [140, 60]], 8, INK); p.stroke([[480, 0], [480, 60]], 8, INK);
  panel(p, 14, 56, 606, 286, "#e6b56a", 10);
  text(p, s, 310, 172, 88, "#ff5a4f", "#5a2a14");
};
/** the toaster, 440 x 360, side lever; up 0..1 = the slice rising */
const toaster = (p: Pen, up: number) => {
  if (up > 0) toast(p, "whole", 220, 110 - 40 * up, 70);
  panel(p, 40, 130, 400, 340, "#c9d3df", 9);
  p.poly([[100, 130], [340, 130], [340, 150], [100, 150]], "#2b2f3a", 0);
  p.poly([[70, 180], [120, 180], [90, 330], [64, 330]], "rgba(255,255,255,.5)", 0);
  p.poly([[400, 190 + 70 * (1 - up)], [438, 190 + 70 * (1 - up)], [438, 214 + 70 * (1 - up)], [400, 214 + 70 * (1 - up)]], INK, 0);
  p.ell(220, 270, 30, 30, "#ff5a4f", 6);
};
/** the skin sheet on the court, 440 x 952 canvas = the court from above; u 0..1 unrolled from the near baseline (canvas bottom) */
const sheet = (p: Pen, u: number) => {
  const W = 440, H = 952, y0 = H * (1 - u), G = "#7ccb5a", D = "#58a73f";
  if (u <= 0) return;
  p.poly([[6, y0], [W - 6, y0], [W - 6, H - 6], [6, H - 6]], G, 6);
  for (let y = H - 60; y > y0; y -= 90) p.stroke([[20, y], [W - 20, y - 26]], 5, D);
  for (let x = 70; x < W; x += 100) p.stroke([[x, H - 10], [x, y0 + 8]], 4, D);
  if (u > 0.5) { text(p, "YOUR", W / 2, H * 0.68 - 44, 72, "#ffffff"); text(p, "SKIN", W / 2, H * 0.68 + 44, 72, "#ffffff"); }
  if (u < 1) { p.poly([[2, y0 - 26], [W - 2, y0 - 26], [W - 2, y0 + 26], [2, y0 + 26]], D, 7); p.poly([[2, y0 - 16], [W - 2, y0 - 16], [W - 2, y0 - 6], [2, y0 - 6]], G, 0); }
};
const xyz = ([x, y, z]: V3) => ({ x, y, z });
/** sunset wash, 108 x 192, between the lead and the HUD. shortcut: the "golden" light turns the park ground navy, so these shots use "day" + this card; drop it once lights.ts handles the park */
const dusk = (p: Pen, half: boolean) => {
  const g = p.g, w = g.createLinearGradient(0, 0, 108, 0);
  w.addColorStop(0, half ? "rgba(255,150,70,.20)" : "rgba(255,130,60,.2)"); w.addColorStop(1, half ? "rgba(40,20,70,.44)" : "rgba(255,130,60,.2)");
  g.fillStyle = w; g.fillRect(0, 0, 108, 192);
};
/** flying crumbs, 300 x 300, u 0..1 */
const crumbs = (p: Pen, u: number) => { for (let i = 0; i < 7; i++) { const a = rad(100 + i * 22); p.ell(150 + 130 * u * Math.cos(a), 150 + 130 * u * Math.sin(a) + 90 * u * u, 13, 11, "#c98f45", 3); } };

export const fx = (id: number, t: number, out: Stage) => {
  const burst = (key: string, t0: number, dur: number, draw: (p: Pen, u: number) => void, cw: number, ch: number, at: V3, w: number, h: number) => {
    const u = q(clamp01((t - t0) / dur), 15);
    if (t >= t0 && u < 1) out.fx.push({ key: `${key}|${u}`, cw, ch, draw: (p) => draw(p, u), ...xyz(at), w, h });
  };
  const hold = (key: string, t0: number, t1: number, draw: (p: Pen) => void, cw: number, ch: number, at: V3, w: number, h: number) => {
    if (t < t0 || t > t1) return; const k = q(popIn(t, t0), 10);
    out.fx.push({ key: `${key}|${k}`, cw, ch, draw, ...xyz(at), w: w * k, h: h * k });
  };
  /** a card pinned to the screen for this shot's base camera: centre (sx, sy), width wpx in 1080 x 1920 px, depth d (default just before the look point) */
  const scr = (key: string, cw: number, ch: number, draw: (p: Pen) => void, sx: number, sy: number, wpx: number, d?: number, soft = false) => {
    const c = SHOTS[id - 1].cam as { local: V3; lookAt: V3; fov: number }, a = L(id, c.local), b = L(id, c.lookAt);
    const f = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], n = Math.hypot(f[0], f[1], f[2]); f[0] /= n; f[1] /= n; f[2] /= n;
    const rl = Math.hypot(f[2], f[0]), r = [-f[2] / rl, 0, f[0] / rl], u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
    const dd = d ?? n * 0.92, px = 2 * dd * Math.tan(rad(c.fov) / 2) / 1920, ox = (sx - 540) * px, oy = (960 - sy) * px;
    out.fx.push({ key, cw, ch, draw, x: a[0] + f[0] * dd + r[0] * ox + u[0] * oy, y: a[1] + f[1] * dd + r[1] * ox + u[1] * oy, z: a[2] + f[2] * dd + r[2] * ox + u[2] * oy, w: wpx * px, h: wpx * px * ch / cw, soft });
  };
  const v = q(energy(t), 40), sunAt = (sx: number, sy: number, w: number) => { const a = q(t * 12 % 30, 1); scr(`sun|${a}`, 400, 400, (p) => sun(p, a), sx, sy, w, 11); };
  if (id === 8) { const k = ease((t - word("energy") + 0.3) / 0.3), s = t > word("percent") ? "OF WHAT YOU BURN" : "";
    scr(`hud8|${v}|${s}`, 800, s ? 290 : 200, (p) => hud(p, v, s || undefined), 540, 240 + 10 * k, 760 + 200 * k);
  } else if (id === 17) scr(`hud17|${v}`, 800, 290, (p) => hud(p, v, "ALL YOU EARNED"), 540, 250, 900);
  else scr(`hud|${v}`, 800, 200, (p) => hud(p, v), 540, 215, 760, id === 12 ? 5 : undefined); // close to the lens on the court: the fog bleaches far cards

  if (id === 1) { const s = L(1, YOUP);
    sunAt(880, 470, 280);
    out.fx.push({ key: "plate1", cw: 460, ch: 460, draw: (p) => plate(p, "morsel"), x: s[0] - 0.68, y: 1.06, z: s[2] + 0.2, w: 0.74, h: 0.74 });
    // hook 2026-11-08: no "1 BITE" tag here, it gave the answer away in the first second
  }
  if (id === 2) { const s = L(2, BY), g = word("green"); burst("ex2", g - LEAD, 0.8, (p, u) => fxExclaim(p, u), 200, 260, [s[0] + 0.5, 1.75, s[2] + 0.1], 0.3, 0.39); }
  if (id === 3) { const w = word("makes");
    scr("beam3", 600, 1000, beam, 730, 900, 800, 4.6, true);
    if (t >= w) { const k = q(popIn(t, w), 10); scr(`think3|${k}`, 520, 360, think, 300, 480, 460 * k); }
    burst("st3", word("sunlight") - 0.1, 0.8, (p, u) => fxStars(p, u), 300, 300, L(3, [1.25, 1.35, -1.3]), 0.6, 0.6); }
  if (id === 4) { const c = word("cancel"), u = ease((t - c) / 0.5), s = L(4, BY), k = q(clamp01((t - word("breakfast")) / 0.1), 2);
    out.fx.push({ key: `plate4|${k}`, cw: 460, ch: 460, draw: (p) => plate(p, "breakfast", k), x: s[0] - 0.85 - 0.22 * u, y: 1.04, z: s[2] + 0.1, w: 0.62, h: 0.62, face: [0, 0.8, 1] }); }
  if (id === 5) sunAt(860, 470, 280);
  if (id === 6) { const u = clamp01((t - 10.7) / 3.4), h = q(7 + 10 * u, 24), s = L(6, YOUP);
    sunAt(120 + 840 * u, 800 - 400 * Math.sin(Math.PI * u), 240);
    out.fx.push({ key: `clock6|${h}`, cw: 300, ch: 300, draw: (p) => clock(p, h), x: s[0] + 1.02, y: 1.95, z: s[2] + 0.1, w: 0.95, h: 0.95 }); }
  if (id === 7) { const s = L(7, [1.35, 0, -0.5]);
    sunAt(190, 470, 220);
    out.fx.push({ key: "solar", cw: 520, ch: 620, draw: solar, x: s[0], y: 0.84, z: s[2], w: 1.41, h: 1.68 });
    burst("gl7", word("panel") - 0.1, 0.7, (p, u) => fxStars(p, u), 300, 300, [s[0] - 0.3, 1.45, s[2] + 0.1], 0.7, 0.7); }
  if (id === 10) { const r = word("runs"), th = word("thinks"), lv = word("thousands");
    for (let i = 0; i < 44; i++) { const a = i * 2.4, rr = 0.5 + 2.1 * Math.sqrt(i / 44), sw = q(Math.sin(t * 2.6 + i), 4) * 28 + (i % 3) * 30; // the canopy stirring
      const k = i < 14 ? 1 : ease((t - lv - (i - 14) * 0.02) / 0.2); if (k <= 0) continue;
      out.fx.push({ key: `leaf|${sw}`, cw: 200, ch: 200, draw: (p) => leaf(p, sw), ...xyz(L(10, [TREE[0] + rr * Math.cos(a), 4.5 + 0.8 * rr * Math.sin(a), TREE[2] + 1.8])), w: 0.5 * k, h: 0.5 * k }); }
    hold("t1", r - LEAD, 33.95, (p) => tag(p, "NO LEGS"), 620, 300, L(10, [-3.6, 2.75, -2.4]), 2.0, 0.97);
    hold("t2", th - LEAD, 33.95, (p) => tag(p, "NO BRAIN"), 620, 300, L(10, [-3.6, 1.7, -2.4]), 2.0, 0.97); }
  if (id === 12) { const u = q(ease((t - word("need")) / (word("court", 43.5) + 0.3 - word("need"))), 48), c = L(12, [12, 0.05, (COURT.z0 + COURT.z1) / 2]);
    out.fx.push({ key: `sheet|${u}`, cw: 440, ch: 952, draw: (p) => sheet(p, u), x: c[0], y: c[1], z: c[2], w: COURT.w, h: COURT.z0 - COURT.z1, flat: true }); }
  if (id === 15) { sunAt(830, 860, 300); scr("dusk15", 108, 192, (p) => dusk(p, false), 540, 960, 3200, 0.6, true); }
  if (id === 16) { const s = L(16, BY), t0 = word("toast", 57.8) + 0.15, up = q(ease((t - t0) / 0.2), 6), b = word("bite", 59), g = ease((t - t0 - 0.45) / 0.25), m = ease((t - b + 0.35) / 0.3);
    out.fx.push({ key: `toaster|${g > 0 ? 0 : up}`, cw: 440, ch: 360, draw: (p) => toaster(p, g > 0 ? 0 : up), x: s[0] - 1.05, y: 1.14, z: s[2] + 0.15, w: 0.56, h: 0.46 });
    if (g > 0) { const kind = t > b ? "bitten" : "whole"; out.fx.push({ key: `toast16|${kind}`, cw: 400, ch: 400, draw: (p) => toast(p, kind), x: s[0] - 0.55 + 0.33 * m, y: 1.1 + 0.1 * m, z: s[2] + 0.28, w: 0.36, h: 0.36 }); }
    burst("bt16", b, 0.6, crumbs, 300, 300, [s[0] - 0.3, 1.16, s[2] + 0.3], 0.5, 0.5); }
  if (id === 17) { const s = L(17, BY); out.fx.push({ key: "toast17", cw: 400, ch: 400, draw: (p) => toast(p, "bitten"), x: s[0] - 0.56, y: 1.06, z: s[2] + 0.25, w: 0.44, h: 0.44 }); }
  if (id === 18) { sunAt(170, 760, 220); scr("dusk18", 108, 192, (p) => dusk(p, true), 540, 960, 3200, 0.6, true); }
};

export const CAST: [string, Outfit, Partial<FrontOpts>][] = [["You (green)", GREEN, { expr: "smile" }]];
