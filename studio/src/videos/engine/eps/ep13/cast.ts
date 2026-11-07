// What If ep13 acting, round 2. Riders: a bodyFront card seated behind a drawn horse (fx), with the near leg drawn on the horse so the
// lead sits ON the saddle. Horse views: side, front (head on) and top (flat, the rider is part of the drawing). The train is the
// moving mesh in sets.ts ("mover", story.ts MOVER_AT); the fx here add its wheels, steam and headlamp.
import { Pen, Outfit, FrontOpts, INK, POSES, fxPuff } from "../../toon";
type P2 = [number, number];
const ellPts = (cx: number, cy: number, rx: number, ry: number): P2[] => Array.from({ length: 48 }, (_, i) => [cx + rx * Math.cos((i / 48) * Math.PI * 2), cy + ry * Math.sin((i / 48) * Math.PI * 2)] as P2);
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { camAt } from "../../story";
import { Act, Stage, LEAD, q } from "../../act";
import { SHOTS, BEATS, MOVER_AT, runX } from "./story";
import words from "./words";

const O = SETS.west.origin;
const L = ([x, y, z]: V3): V3 => [O[0] + x, y, z];
export const word = (text: string, from = 0) => {
  const hit = words.find((w) => w.start >= from - 0.01 && w.text.replace(/[^A-Za-z0-9'-]/g, "").toLowerCase() === text.toLowerCase());
  if (!hit) throw new Error(`Missing cast beat word: ${text} after ${from}`);
  return hit.start;
};
export const wearAt = (_t: number) => 0;

// ---------------- cast (lead: only the curl is fixed, user 2026-11-07) ----------------
export const YOU_W: Outfit = { jacket: "#c63939", pants: "#3e4a66", boots: "#2b2018", hat: null, sprout: true, build: "adult", top: "button", bottom: "jeans",
  layer: { kind: "cardigan", color: "#8a5a34" }, shoe: "boot", skin: "#f6e7da" };
const GANG1: Outfit = { jacket: "#c9a26a", pants: "#4a3a30", boots: "#2b2018", hat: "cowboy", cap: "#6b4a30", build: "stout", top: "button", bottom: "jeans", moustache: "#3a2a20", shoe: "boot", skin: "#e8c4a0" };
const GANG2: Outfit = { jacket: "#5f7a6a", pants: "#3b3036", boots: "#2b2018", hat: "cowboy", cap: "#8a7350", build: "adult", top: "button", bottom: "jeans", shoe: "boot", skin: "#c99a70" };
const POSSE: Outfit = { jacket: "#2f3344", pants: "#3a3640", boots: "#17151c", hat: "cowboy", cap: "#23222c", build: "adult", top: "button", bottom: "jeans", moustache: "#2a2020", shoe: "boot", skin: "#e8c4a0" };
const POSSE2: Outfit = { ...POSSE, moustache: undefined, jacket: "#44394a", cap: "#37303a", skin: "#c99a70" };
export const CAST: [string, Outfit, Partial<FrontOpts>][] = [["You", YOU_W, { expr: "smile" }], ["Gang", GANG1, { expr: "laugh" }], ["Posse", POSSE, { expr: "stern" }]];

// ---------------- horse ----------------
const BAY = { coat: "#a9673a", dark: "#7a4526", mane: "#2a1c1c", sock: "#efe3cf" }, GREY = { coat: "#b9b3ad", dark: "#8d8780", mane: "#47414a", sock: "#ece6dd" }, BLACK = { coat: "#4a4150", dark: "#352e3b", mane: "#17141d", sock: "#857b86" }, TIRED = { coat: "#8f6444", dark: "#6a4832", mane: "#2a1c1c", sock: "#d3c5ae" };
type Coat = typeof BAY;
type HorseState = "gallop" | "stand" | "tired" | "eat";
const two = Math.PI * 2, ol9 = 9;
/** a limb segment wider at a than at b, with an ink rim */
const taper = (p: Pen, a: number[], b: number[], w0: number, w1: number, col: string, ol = 8) => {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d;
  p.poly([[a[0] + nx * w0, a[1] + ny * w0], [b[0] + nx * w1, b[1] + ny * w1], [b[0] - nx * w1, b[1] - ny * w1], [a[0] - nx * w0, a[1] - ny * w0]], col, ol);
  p.ell(b[0], b[1], w1 * 1.08, w1 * 1.08, col, 0);
};
/** toon.ts bean legs: the trouser colour sunk into the ink */
const legInk = (c: string) => { const f = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16), m = (i: number) => Math.round(f(c, i) * 0.45 + f(INK, i) * 0.55); return `rgb(${m(1)},${m(3)},${m(5)})`; };
/** a limb in one piece through its joints: pts = [x, y, half width]; ink silhouette, then the colour, no line across a joint */
const onePiece = (p: Pen, pts: number[][], col: string, ol = 8) => {
  const shape = (extra: number, c: string) => { for (let i = 0; i + 1 < pts.length; i++) { const [a, b] = [pts[i], pts[i + 1]]; taper(p, a, b, a[2] + extra, b[2] + extra, c, 0); } p.ell(pts[0][0], pts[0][1], pts[0][2] + extra, pts[0][2] + extra, c, 0); };
  shape(ol, INK); shape(0, col);
};
/** 900 x 700, faces +x, hooves at y 680. u = gallop phase 0..1; leg = rider's trouser + boot colours (the near leg is drawn here) */
const horse = (p: Pen, c: Coat, st: HorseState, u: number, flip: boolean, leg: [string, string] | null) => {
  const g = p.g; g.save();
  if (flip) { g.translate(900, 0); g.scale(-1, 1); }
  const run = st === "gallop", rock = run ? 0.06 * Math.sin(two * u) : st === "tired" ? 0.02 : 0;
  g.translate(430, 340); g.rotate(rock); g.translate(-430, -340);
  const ol = ol9;
  const limb = (hx: number, hy: number, ph: number, col: string, sock: string, hind: boolean) => {
    const a = run ? (hind ? 0.72 : 0.9) * Math.sin(two * (u + ph)) : st === "tired" ? 0.05 + ph * 0.3 : ph * 0.25;
    const fl = run ? 1.25 * Math.max(0, Math.cos(two * (u + ph))) : 0.04;
    const up = hind ? 135 : 150, lo = hind ? 175 : 160;
    const kx = hx + up * Math.sin(a), ky = hy + up * Math.cos(a), sh = hind ? a - 0.45 - fl : a - fl, fx0 = kx + lo * Math.sin(sh), fy0 = ky + lo * Math.cos(sh);
    onePiece(p, [[hx, hy, hind ? 50 : 40], [kx, ky, 21], [fx0, fy0, 14]], col);
    taper(p, [kx + (fx0 - kx) * 0.68, ky + (fy0 - ky) * 0.68], [fx0, fy0], 14, 14, sock, 0);
    p.poly([[fx0 - 22, fy0 - 2], [fx0 + 26, fy0 - 2], [fx0 + 32, fy0 + 24], [fx0 - 24, fy0 + 24]], INK, 0);
  };
  const tw = run ? 24 * Math.sin(two * u * 2) : 0, ty = run ? -30 : st === "stand" ? 60 : 90;
  p.stroke([[185, 275], [90, 280 + ty * 0.6 + tw], [45, 340 + ty + tw]], 58, INK); p.stroke([[185, 275], [90, 280 + ty * 0.6 + tw], [45, 340 + ty + tw]], 40, c.mane);
  limb(255, 345, 0.12, c.dark, c.dark, true); limb(540, 365, 0.62, c.dark, c.dark, false);
  const nb: [number, number] = st === "tired" ? [695, 265] : st === "eat" ? [710, 410] : run ? [690, 170] : [675, 135];
  const hd: [number, number] = st === "tired" ? [775, 365] : st === "eat" ? [775, 560] : run ? [800, 205] : [785, 195];
  for (const [x, y, rx, ry] of [[265, 310, 105 + ol, 100 + ol], [410, 310, 190 + ol, 92 + ol], [545, 310, 92 + ol, 100 + ol]] as number[][]) p.ell(x, y, rx, ry, INK, 0);
  p.stroke([[560, 280], nb], 118 + ol * 2, INK); p.stroke([nb, hd], 64 + ol * 2, INK); p.ell(hd[0], hd[1], 42 + ol, 36 + ol, INK, 0);
  for (const [x, y, rx, ry] of [[265, 310, 105, 100], [410, 310, 190, 92], [545, 310, 92, 100]] as number[][]) p.ell(x, y, rx, ry, c.coat, 0);
  p.stroke([[560, 280], nb], 118, c.coat); p.stroke([nb, hd], 64, c.coat); p.ell(hd[0], hd[1], 42, 36, c.coat, 0);
  p.ell(hd[0] + 8, hd[1] + 10, 28, 20, c.dark, 0);
  limb(255, 345, 0, c.coat, c.sock, true); limb(540, 365, 0.5, c.coat, c.sock, false);
  for (const [x, y, rx, ry] of [[265, 310, 105, 100], [410, 310, 190, 92], [545, 310, 92, 100]] as number[][]) p.ell(x, y, rx, ry, c.coat, 0);
  p.stroke([[290, 392], [410, 396], [530, 392]], 16, c.dark);
  const dx = hd[0] - nb[0], dy = hd[1] - nb[1], n = Math.hypot(dx, dy), ux = dx / n, uy = dy / n;
  const ear: [number, number] = [nb[0] + uy * 26 + ux * 6, nb[1] - ux * 26 + uy * 6];
  p.poly([[ear[0] - 16, ear[1] + 8], [ear[0] + 2, ear[1] - 46], [ear[0] + 22, ear[1] + 4]], c.coat, ol - 2);
  p.dot(nb[0] + ux * 40 + uy * 14, nb[1] + uy * 40 - ux * 14, 11, INK); p.dot(hd[0] + ux * 22 + uy * 2, hd[1] + uy * 22 - ux * 2, 6, INK);
  const m0: [number, number] = [525, 215], m1: [number, number] = [(525 + nb[0]) / 2 - 22, (215 + nb[1]) / 2 - 12];
  p.stroke([m0, m1, [nb[0] - 12, nb[1] - 30]], 46, INK); p.stroke([m0, m1, [nb[0] - 12, nb[1] - 30]], 30, c.mane);
  if (leg) {
    p.poly([[320, 225], [470, 225], [486, 335], [305, 335]], "#c63939", ol - 1); p.stroke([[318, 322], [470, 322]], 8, "#f2d98c");
    p.poly([[318, 232], [336, 186], [448, 206], [476, 172], [492, 232]], "#6a3c20", ol - 1);
    // the near leg: thigh down from the seat, knee forward, boot in the stirrup
    const b = run ? 6 * Math.sin(two * u) : 0;
    const lc = legInk(leg[0]);
    p.stroke([[392, 205], [436, 310 + b], [414, 420 + b]], 11, lc); p.stroke([[408, 424 + b], [448, 424 + b]], 13, INK);
  }
  p.stroke([[hd[0] + 4, hd[1] + 6], [nb[0] - 30, nb[1] + 60], [505, 240]], 5, INK);
  g.restore();
};
/** head on, same card size and hoof line. u = phase, the front legs alternate */
const horseFront = (p: Pen, c: Coat, st: HorseState, u: number, leg: [string, string] | null) => {
  const cx = 450, run = st === "gallop", drop = st === "tired" ? 90 : 0, sway = run ? 10 * Math.sin(two * u) : 0, ol = ol9;
  const fore = (x: number, ph: number, col: string, sock: string) => {
    const s = run ? Math.sin(two * (u + ph)) : st === "tired" ? 0.35 * Math.sin(two * (u + ph)) : 0, lift = Math.max(0, s), ky = 505 - 40 * lift, fy = 660 - 150 * lift;
    const fx0 = x + (x > cx ? -8 : 8) * lift;
    onePiece(p, [[x, 370, 44], [x, ky, 25], [fx0, fy, 18]], col);
    taper(p, [fx0, fy - 56], [fx0, fy], 17, 17, sock, 0); p.poly([[x - 26, fy - 2], [x + 26, fy - 2], [x + 30, fy + 22], [x - 30, fy + 22]], INK, 0);
  };
  fore(cx - 60, 0.3, c.dark, c.dark); fore(cx + 60, 0.8, c.dark, c.dark); // hind legs behind, in shade
  p.ell(cx, 330, 172 + ol, 152 + ol, INK, 0); p.ell(cx, 330, 172, 152, c.coat, 0);
  fore(cx - 72, 0, c.coat, c.sock); fore(cx + 72, 0.5, c.coat, c.sock);
  p.ell(cx, 330, 172, 152, c.coat, 0); // the legs grow out of the chest
  if (leg) { // blanket on the barrel, thighs from the rider's hips (behind the neck), knees on the shoulders, boots in close
    p.clip(ellPts(cx, 330, 172, 152), () => { for (const s of [-1, 1]) p.poly([[cx + s * 92, 170], [cx + s * 180, 170], [cx + s * 180, 345], [cx + s * 104, 345]], "#c63939", 7); });
    for (const s of [-1, 1]) { const th: P2[] = [[cx + s * 40, 205], [cx + s * 128, 255], [cx + s * 136, 400]]; p.stroke(th, 11, legInk(leg[0])); p.stroke([[cx + s * 124, 404], [cx + s * 150, 404]], 13, INK); }
  }
  // neck + long face
  const hx = cx + sway, hy = 305 + drop;
  p.stroke([[cx, 320], [hx, hy - 60]], 112 + ol * 2, INK); p.stroke([[cx, 320], [hx, hy - 60]], 112, c.coat);
  for (const s of [-1, 1]) p.poly([[hx + s * 34, hy - 118], [hx + s * 62, hy - 178], [hx + s * 72, hy - 100]], c.coat, ol - 2);
  p.poly([[hx - 58, hy - 110], [hx + 58, hy - 110], [hx + 44, hy + 70], [hx + 30, hy + 112], [hx - 30, hy + 112], [hx - 44, hy + 70]], c.coat, ol);
  p.poly([[hx - 16, hy - 92], [hx + 16, hy - 92], [hx + 12, hy + 58], [hx - 12, hy + 58]], c.sock, 0); // blaze
  p.ell(hx, hy + 84, 36, 32, c.dark, 0); p.dot(hx - 16, hy + 88, 7, INK); p.dot(hx + 16, hy + 88, 7, INK);
  for (const s of [-1, 1]) { p.ell(hx + s * 44, hy - 34, 14, 17, "#fbf6ea", 5); p.dot(hx + s * 42, hy - 32, 8, INK); }
  p.poly([[hx - 34, hy - 118], [hx + 30, hy - 120], [hx + 8, hy - 58], [hx - 14, hy - 66]], c.mane, 5); // forelock
};
/** from above, 500 x 900, head up. The rider is drawn here: hat or the curl */
const horseTop = (p: Pen, c: Coat, u: number, rider: { shirt: string; hat: string | null } | null) => {
  const lg = (x: number, y: number, ph: number, s: number) => { const k = 34 * Math.sin(two * (u + ph)); p.stroke([[x, y], [x + s * 42, y + k]], 42, INK); p.stroke([[x, y], [x + s * 42, y + k]], 28, c.dark); };
  lg(175, 300, 0.5, -1); lg(325, 300, 0.6, 1); lg(170, 660, 0, -1); lg(330, 660, 0.1, 1);
  const tw = 26 * Math.sin(two * u * 2);
  p.stroke([[250, 730], [250 + tw, 800], [250 - tw, 880]], 54, INK); p.stroke([[250, 730], [250 + tw, 800], [250 - tw, 880]], 38, c.mane);
  p.ell(250, 500, 98, 240, c.coat, ol9); p.stroke([[250, 300], [250, 130]], 96, INK); p.stroke([[250, 300], [250, 130]], 78, c.coat); p.ell(250, 90, 40, 70, c.coat, ol9);
  p.stroke([[250, 60], [250, 300]], 22, c.mane);
  for (const s of [-1, 1]) p.poly([[250 + s * 18, 36], [250 + s * 34, 0], [250 + s * 46, 40]], c.coat, 6);
  if (rider) {
    p.ell(250, 510, 92, 62, "#c63939", ol9);
    p.ell(250, 470, 84, 44, rider.shirt, ol9); for (const s of [-1, 1]) p.stroke([[250 + s * 74, 460], [250 + s * 34, 350]], 16, INK);
    if (rider.hat) { p.ell(250, 455, 84, 76, rider.hat, ol9); p.ell(250, 455, 42, 38, rider.hat, 6); }
    else { p.ell(250, 455, 54, 52, "#f6e7da", ol9); p.arc(254, 448, 13, 18, 150, 430, 7, INK); }
  }
};

const SADDLE_H = 1.52, HW = 3.0, HH = (HW * 700) / 900; // seat height above the ground; the card
const GRIP: Act["reach"] = () => [{ ex: 20, ey: 0.45, hx: 38, hy: 0.62, front: true }, { ex: 24, ey: 0.42, hx: 48, hy: 0.58, front: true }];
const GRIP_F: Act["reach"] = () => [{ ex: -22, ey: 0.42, hx: -8, hy: 0.7, front: true }, { ex: 22, ey: 0.42, hx: 8, hy: 0.7, front: true }];
type View = "side" | "front" | "top";
type Rider = { i: number; o: Outfit | null; c: Coat; pos: (t: number) => V3 | null; st?: HorseState; gait?: number; flip?: boolean; view?: View; expr?: Act["expr"]; look?: Act["look"]; lookY?: Act["lookY"]; reach?: Act["reach"]; head?: Act["head"]; scale?: number; ph?: number };
const bobOf = (r: Rider, t: number) => (r.st ?? "gallop") === "gallop" ? 0.13 * Math.abs(Math.sin(Math.PI * (t * (r.gait ?? 2.6) + (r.ph ?? 0)))) : 0;
/** the gallop frame both cards draw */
const frameOf = (r: Rider, t: number) => Math.floor(((t * (r.gait ?? 2.6) + (r.ph ?? 0)) % 1) * 12) / 12;
/** the seat in the side drawing: x 392 of 900, turned with the body's rock about (430, 340); metres at 300 px/m from the card centre */
const seatOf = (r: Rider, t: number) => { const k = r.scale ?? 1, run = (r.st ?? "gallop") === "gallop", rock = run ? 0.06 * Math.sin(two * frameOf(r, t)) : 0, sx = r.flip ? -1 : 1;
  const px = (392 - 430) + 135 * rock - 450 + 430, py = -38 * rock; return { dx: (sx * px * k) / 300, dy: (py * k) / 300, rock: sx * rock }; };
const rideAct = (r: Rider): Act | null => {
  if (!r.o || r.view === "top") return null;
  const front = r.view === "front", k = r.scale ?? 1;
  return { i: r.i, o: r.o, at: [0, 0, 0], mode: "sit", noShadow: true, expr: r.expr ?? [[0, "stern"]], look: r.look ?? (front ? 0 : r.flip ? -0.5 : 0.5), lookY: r.lookY, reach: r.reach ?? (front ? GRIP_F : GRIP), head: r.head, scale: k * 0.92,
    tilt: (t) => ((r.st ?? "gallop") === "gallop" && !front ? (r.flip ? -3 : 3) + (seatOf(r, t).rock * 180) / Math.PI : 0),
    path: (t) => { const p = r.pos(t); if (!p) return p; const s = front ? { dx: 0, dy: 0 } : seatOf(r, t); return [p[0] + s.dx, p[1] + SADDLE_H * k + bobOf(r, t) + s.dy, p[2]]; } };
};
const pushHorse = (out: Stage, r: Rider, t: number) => {
  const p = r.pos(t); if (!p) return;
  const st = r.st ?? "gallop", k = r.scale ?? 1, u = st === "gallop" || r.view === "front" ? frameOf(r, t) : 0, flip = !!r.flip, view = r.view ?? "side";
  const leg: [string, string] | null = r.o ? [r.o.pants, r.o.boots] : null, w = HW * k, h = HH * k;
  if (view === "top") { const rider = r.o ? { shirt: r.o.jacket, hat: r.o.hat ? (r.o.cap ?? "#23222c") : null } : null, s = 1.9 * k, uu = Math.floor(u * 4) / 4;
    for (let i = 1; i <= 5; i++) { const v = q(((t * 1.4 + i * 0.2) % 1), 6), d = 1.8 * s + 4.2 * v * s; out.fx.push({ key: `tdust|${v}`, cw: 300, ch: 300, soft: true, draw: (pen) => fxPuff(pen, v), x: p[0] - d, y: 0.1 + i * 0.002, z: p[2] + 0.3 * Math.sin(i * 2.4), w: 2.8 * s, h: 2.8 * s, flat: true }); }
    out.fx.push({ key: `htop|${r.c.coat}|${uu}|${rider?.hat ?? ""}|${rider?.shirt ?? ""}`, cw: 500, ch: 900, draw: (pen) => horseTop(pen, r.c, uu, rider), x: p[0], y: 0.3, z: p[2], w: 2.2 * s, h: 3.96 * s, flat: true, rot: -Math.PI / 2 }); return; }
  const key = `horse|${view}|${r.c.coat}|${st}|${u}|${flip}|${leg ? leg[0] : ""}`;
  out.fx.push({ key, cw: 900, ch: 700, draw: (pen) => (view === "front" ? horseFront(pen, r.c, st, u, leg) : horse(pen, r.c, st, u, flip, leg)), x: p[0], y: p[1] + h * 0.5 - 0.06 * k + bobOf(r, t), z: p[2] + (view === "front" ? 0 : 0.14), w, h });
  if (st === "gallop" && k > 0.5) { const v = (t * 3.1 + r.i * 0.37) % 1, uu = q(v, 8); out.fx.push({ key: `dust|${uu}`, cw: 300, ch: 300, soft: true, draw: (pen) => fxPuff(pen, uu), x: p[0] + (view === "front" ? -0.6 : flip ? 1.5 : -1.5), y: p[1] + 0.35, z: p[2] + 0.05, w: 1.5, h: 1.5 }); }
};
/** on the shot's RUN line, dx ahead of it, at set-local z */
const onRun = (id: number, dx: number, z: number, y = 0) => (t: number): V3 => [O[0] + runX(id, t) + dx, y, O[2] + z];

const sec = (id: number) => [SHOTS[id - 1].a / 30, SHOTS[id - 1].b / 30];
const ease = (x: number) => { const k = clamp01(x); return k * k * (3 - 2 * k); };
const RAIL_Z = -4, LAUGH: Act["expr"] = [[0, "laugh"]], RAMP_X = -32, YARD_X = -120;
const carAt = (id: number, t: number) => MOVER_AT(id, Math.round(t * 30));
/** a horse + rider off the second train: door -> down the ramp -> away to +x. t0 = leaves the door */
const offRamp = (t0: number, lane: number) => (t: number): V3 | null => {
  if (t < t0) return null;
  const d = t - t0, a = clamp01(d / 0.75), z = -2.2 + 3.1 * a, y = 1.15 * (1 - a), x = RAMP_X + 0.6 * a + 9 * Math.max(0, d - 0.75);
  return L([x, y, z + lane * clamp01((d - 0.75) * 1.2)]);
};
const ME8: V3 = [85, 0, -1.2], ME9: V3 = [85, 0, -1.0];

const RIDERS = (id: number): Rider[] => {
  const [a] = sec(id);
  switch (id) {
    case 1: return [{ i: 0, o: YOU_W, c: BAY, pos: onRun(id, 0, -150), expr: LAUGH }];
    case 2: return [
      { i: 0, o: YOU_W, c: BAY, pos: onRun(id, 3.3, 0.5), expr: [[0, "laugh"], [word("train", 3.5) - LEAD, "shock"]], look: (t) => (t < word("train", 3.5) ? 0.5 : -0.8) },
      { i: 1, o: POSSE, c: BLACK, pos: onRun(id, -0.4, -1.2), ph: 0.3, scale: 0.95 }, { i: 2, o: POSSE2, c: GREY, pos: onRun(id, -2.9, 1.2), ph: 0.6 }];
    case 3: return [ // straight at the lens, the engine behind
      { i: 0, o: YOU_W, c: BAY, view: "front", pos: onRun(id, 0, 0.4), expr: [[0, "shock"], [word("horses", 5) - LEAD, "scared"]] },
      { i: 1, o: POSSE, c: BLACK, view: "front", pos: onRun(id, -6, 2.6), ph: 0.4 }, { i: 2, o: POSSE2, c: GREY, view: "front", pos: onRun(id, -9, -1.6), ph: 0.7 }];
    case 4: return [{ i: 0, o: YOU_W, c: BAY, st: "stand", pos: () => L([-324, 0, 0.2]), expr: [[0, "smirk_wink"]], reach: () => [undefined, POSES.point_right[1]], look: 0.6 }];
    case 13: return [{ i: 0, o: YOU_W, c: BAY, view: "top", pos: (t) => L([runX(13, t), 0, 2 - 3.2 * (t - a)]) }];
    case 14: { const sw = word("fresh");
      return [{ i: 0, o: YOU_W, c: BLACK, pos: onRun(id, 0, -150), expr: [[0, "smile"], [sw - LEAD, "confident"]] }, { i: 1, o: null, c: GREY, st: "stand", pos: (t) => (t > sw - 0.5 ? L([runX(14, sw + 0.7), 0, -147.5]) : null) }]; }
    case 15: case 16: case 17: { const c = id === 15 ? BLACK : id === 16 ? GREY : BAY;
      return [{ i: 0, o: YOU_W, c, pos: onRun(id, 0, -150), expr: [[0, id === 17 ? "confident" : "smile"]] }]; }
    case 18: return [{ i: 0, o: YOU_W, c: BAY, st: "stand", pos: () => L([70, 4.1, -165]), expr: LAUGH, head: () => -5, lookY: () => -0.2, reach: () => POSES.fist_pump }];
    case 21: { const t0 = word("horses", 48);
      return [0, 1, 2].map((k) => ({ i: k + 1, o: k % 2 ? POSSE2 : POSSE, c: k === 1 ? GREY : BLACK, pos: offRamp(t0 + k * 0.85, 1.4 * k), ph: 0.3 * k })); }
    case 22: return [0, 1, 2, 3, 4].map((k) => ({ i: k + 1, o: k % 2 ? POSSE2 : POSSE, c: k % 3 ? BLACK : GREY, ph: 0.2 * k, pos: (t: number): V3 => L([-27 + 3.4 * (t - a) + 2.1 * k, 0, 1 + 3.2 * k + 0.5 * k * (t - a)]) }));
    case 23: return [{ i: 0, o: YOU_W, c: TIRED, view: "front", st: "tired", gait: 1.0, pos: onRun(id, 0, -168), expr: [[0, "tired"], [word("night", 58) - LEAD, "worried"]], head: () => 5 }];
    case 24: return [{ i: 1, o: null, c: GREY, st: "eat", pos: () => L([-0.6, 0.1, 298.6]) }];
    case 26: return [{ i: 0, o: YOU_W, c: BAY, view: "top", pos: onRun(id, 2.4, -150) },
      { i: 1, o: POSSE, c: BLACK, view: "top", pos: onRun(id, -2.6, -153.5), ph: 0.3 }, { i: 2, o: POSSE2, c: GREY, view: "top", pos: onRun(id, -4.2, -147), ph: 0.6 }, { i: 3, o: POSSE, c: BLACK, view: "top", pos: onRun(id, -6.2, -151), ph: 0.8 }];
    case 28: return [{ i: 1, o: null, c: BAY, st: "stand", pos: (t) => L([121.5 + 1.1 * clamp01((t - a) / 2.4), 0.6, 2.9]) }];
    case 30: return [{ i: 1, o: null, c: BAY, st: "stand", pos: () => L([-1.15, 0.1, 298.8]) }];
    default: return [];
  }
};

/** the arm holding the lantern out, swaying; hand = the point the lantern hangs from */
const swing = (t: number, f = 4.5) => 26 * Math.sin(t * f);
const LANTERN_ARM = (t: number, f?: number): FrontOpts["reach"] => [undefined, { ex: 30, ey: -0.1, hx: 46 + swing(t, f), hy: -0.8, front: true }];
/** the world rotates under a yawed card only a little in these shots: hand offset along world x is close enough */
const handOf = (at: V3, t: number, f?: number): V3 => [at[0] - 0.0, 1.47, at[2] - (0.177 + (46 + swing(t, f)) * 0.0051)];

const ACTS = (id: number): Act[] => {
  const [a] = sec(id), riders = RIDERS(id).map(rideAct).filter(Boolean) as Act[];
  const you = (at: V3, expr: Act["expr"], more: Partial<Act> = {}): Act => ({ i: 0, o: YOU_W, at: L(at), mode: "stand", expr, ...more });
  switch (id) {
    case 5: return [you([-125, 0, 1.5], [[0, "curious"], [word("car", 10.5) - LEAD, "squint"]], { mode: "stroll", phase: (t) => t * 1.3, path: (t) => L([-125 + 1.3 * (t - a), 0, 1.5]), look: 0.3 })];
    case 6: return [you([-117.9, 0, -0.1], [[0, "squint"], [word("hay", 13) - LEAD, "confused"]], { look: -0.8, lookY: () => 0.2, reach: () => POSES.hands_on_hips })];
    case 7: return [you([-120, 0, 1.3], [[0, "sheepish"]], { reach: () => POSES.shrug, look: 0.4 }),
      { i: 1, o: GANG1, at: L([-121.35, 0, 0.7]), mode: "stand", expr: LAUGH, tilt: (t) => 4 * Math.sin(t * 15), reach: () => POSES.hands_on_hips },
      { i: 2, o: GANG2, at: L([-118.7, 0, 0.7]), mode: "stand", expr: [[0, "grin"], [word("coal") - LEAD, "laugh"]], tilt: (t) => 3 * Math.sin(t * 13), reach: () => POSES.point_left, look: -0.6 }];
    case 8: return [you(ME8, [[0, "concentrate"], [word("lantern") - LEAD, "sly"]], { reach: (t) => LANTERN_ARM(t), look: 0.6 })];
    case 9: return [you(ME9, [[0, "sly"], [word("stops") - LEAD, "scheming"]], { look: 0.5, reach: (t) => LANTERN_ARM(t, 3), path: (t) => L([ME9[0] + 0.9 * ease((t - a) / 1.4), 0, ME9[2]]) })];
    case 10: { const pu = word("dynamite") - 0.2;
      return [you([56, 0, 0.6], [[0, "scheming"], [word("too") - LEAD, "excited"], [pu - LEAD, "shock"]], { mode: "kneel", reach: (t) => (t > pu ? POSES.hands_up : [{ ex: -14, ey: 0.3, hx: 30, hy: 0.25, front: true }, { ex: 14, ey: 0.3, hx: -30, hy: 0.25, front: true }]), look: -0.4 })]; }
    case 11: { const b = BEATS.roof; // blown backward on the first blast, then a stunned sit
      return [you([3.4, 0, 4.2], [[0, "scared"], [b - LEAD, "shock"], [word("walls") - LEAD, "jawdrop"]], { mode: "sit", noShadow: true, reach: () => POSES.hands_up, look: -0.3,
        tilt: (t) => -6 - 16 * ease((t - b) / 0.2), path: (t) => { const k = clamp01((t - b) / 0.45); return L([3.4 + 0.6 * k, t < b ? 0 : 2.8 * k * (1 - k), 4.2 + 1.6 * k]); } })]; }
    case 27: return [you([131.5, 0, 18.3], [[0, "worried"], [word("train", 70) - LEAD, "sad"]], { look: 0.8 })];
    case 28: return [you([120, 0.6, 3.0], [[0, "sigh"]], { mode: "stroll", phase: (t) => t * 1.1, path: (t) => L([120 + 1.1 * clamp01((t - a) / 2.4), 0.6, 3.0]), look: 0.5, noShadow: true })];
    case 29: return [you([125.2, 0, 1.6], [[0, "sigh"], [word("train", 75.5) - LEAD, "deadpan"]], { reach: () => [undefined, { ex: 16, ey: 0.3, hx: -10, hy: -0.2, front: true }], lookY: () => 0.4 })];
    case 30: return [{ i: 0, o: YOU_W, at: L([0.95, 0.2, 299.75]), mode: "sit", expr: [[0, "deadpan"], [word("time", 77.5) - LEAD, "sigh"]], look: -0.6, seat: 0.28 }];
    default: return riders;
  }
};
export const acts = (id: number): Act[] => ACTS(id);

// ---------------- props ----------------
const text = (p: Pen, s: string, x: number, y: number, px: number, col: string, stroke = INK) => {
  const g = p.g; g.save(); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${px}px "Arial Black", Arial, sans-serif`;
  g.lineJoin = "round"; g.lineWidth = px * 0.14; g.strokeStyle = stroke; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); g.restore();
};
/** soft round gradient: stops = [offset, css colour] */
const glow = (p: Pen, size: number, stops: [number, string][]) => {
  const g = p.g, c = size / 2, r = g.createRadialGradient(c, c, 0, c, c, c);
  for (const [o, col] of stops) r.addColorStop(o, col);
  g.fillStyle = r; g.fillRect(0, 0, size, size);
};
const warm = (a: number): [number, string][] => [[0, `rgba(255,236,170,${a})`], [0.18, `rgba(255,190,90,${a * 0.75})`], [0.45, `rgba(255,130,50,${a * 0.28})`], [1, "rgba(255,110,40,0)"]];
/** the ramp: 500 x 560, boards across with cleats, heavy side rails, the hinge at the bottom */
const ramp = (p: Pen) => {
  p.poly([[20, 12], [480, 12], [480, 548], [20, 548]], "#c79a5c", 10);
  for (let y = 50; y < 540; y += 38) p.stroke([[34, y], [466, y]], 4, "#94693c");
  for (let y = 90; y < 540; y += 114) { p.stroke([[34, y], [466, y]], 22, INK); p.stroke([[34, y], [466, y]], 13, "#7a5430"); }
  for (const x of [40, 460]) { p.stroke([[x, 18], [x, 542]], 44, INK); p.stroke([[x, 18], [x, 542]], 30, "#6d4a2a"); }
};
const doorway = (p: Pen) => {
  p.poly([[10, 10], [510, 10], [510, 470], [10, 470]], "#241d27", 8);
  for (let i = 0; i < 26; i++) { const x = 40 + ((i * 67) % 440), d = (i * 29) % 40; p.stroke([[x, 468], [x + 40 - d, 368 + d]], 9, i % 2 ? "#e6c463" : "#c79f3f"); }
};
const lantern = (p: Pen, fl: number) => {
  p.arc(150, 92, 36, 44, 180, 360, 8, INK); p.poly([[112, 100], [188, 100], [176, 210], [124, 210]], "#ffc84f", 7);
  const g = p.g, r = g.createRadialGradient(150, 165, 2, 150, 165, 46); r.addColorStop(0, "#fffbe0"); r.addColorStop(0.5, "#ffe58a"); r.addColorStop(1, "rgba(255,200,80,0)"); g.fillStyle = r; g.beginPath(); g.ellipse(150, 165 - fl * 4, 34, 44 + fl * 6, 0, 0, Math.PI * 2); g.fill();
  p.stroke([[106, 214], [194, 214]], 14, "#a82e28"); p.stroke([[150, 48], [150, 62]], 8, INK);
};
/** a warm breathing pool of light around a flame: halo + ground pool. Breath is a size + a few opacity steps, not a redrawn line */
const lightAt = (out: Stage, key: string, x: number, y: number, z: number, t: number, R: number, ground = true) => {
  const b = 0.82 + 0.13 * Math.sin(t * 2.6) + 0.05 * Math.sin(t * 11.3), lv = q(0.42 + 0.3 * (b - 0.7), 12);
  out.fx.push({ key: `${key}|h|${lv}`, cw: 512, ch: 512, soft: true, draw: (p) => glow(p, 512, warm(lv)), x, y, z: z + 0.02, w: 2 * R * b, h: 2 * R * b });
  if (ground) out.fx.push({ key: `${key}|g|${lv}`, cw: 512, ch: 512, soft: true, draw: (p) => glow(p, 512, warm(lv * 0.7)), x, y: 0.1, z, w: 2.6 * R * b, h: 2.6 * R * b, flat: true });
};
const plunger = (p: Pen, down: number) => {
  const y = 80 + 80 * down; p.stroke([[150, y], [150, 190]], 16, INK); p.stroke([[80, y], [220, y]], 22, INK); p.stroke([[80, y], [220, y]], 12, "#c9ccd4");
  p.poly([[62, 180], [238, 180], [238, 300], [62, 300]], "#a82e28", 8); text(p, "TNT", 150, 244, 54, "#fbf6ea");
};
const plank = (p: Pen, c: string) => { p.poly([[10, 40], [290, 12], [292, 60], [14, 92]], c, 7); p.stroke([[60, 44], [240, 26]], 5, INK); };
const panel = (p: Pen, c: string) => { p.poly([[12, 12], [388, 26], [376, 280], [24, 268]], c, 9); for (const x of [90, 170, 250, 320]) p.stroke([[x, 26], [x + 4, 264]], 6, INK); };
const bill = (p: Pen) => { p.poly([[8, 8], [232, 8], [232, 112], [8, 112]], "#c7dcab", 6); p.ell(120, 60, 30, 34, "#88a97a", 4); text(p, "$", 120, 60, 44, "#fbf6ea", "#3f6a55"); };
const safeDoor = (p: Pen) => { p.poly([[14, 14], [386, 14], [386, 386], [14, 386]], "#3b3f4e", 11); p.ell(200, 200, 96, 96, "#c9ccd4", 9); for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; p.stroke([[200, 200], [200 + 86 * Math.cos(a), 200 + 86 * Math.sin(a)]], 9, INK); } p.ell(200, 200, 24, 24, "#a82e28", 7); };
/** a fireball lump: white-hot, then orange, then soot. u 0..1 */
const billow = (p: Pen, u: number, seed: number) => {
  const mix = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
  const hot = u < 0.45 ? mix([255, 244, 190], [255, 140, 40], u / 0.45) : mix([255, 140, 40], [46, 36, 44], (u - 0.45) / 0.55);
  const edge = u < 0.45 ? mix([255, 130, 30], [190, 60, 25], u / 0.45) : mix([190, 60, 25], [30, 24, 32], (u - 0.45) / 0.55), al = u < 0.7 ? 1 : 1 - (u - 0.7) / 0.3;
  const g = p.g; for (let i = 0; i < 6; i++) { const a = i * 1.05 + seed, d = i ? 92 : 0, x = 256 + d * Math.cos(a), y = 256 + d * Math.sin(a), R = i ? 110 + 22 * Math.sin(seed + i) : 150;
    const r = g.createRadialGradient(x, y, 4, x, y, R); r.addColorStop(0, `rgba(${hot},${al})`); r.addColorStop(0.68, `rgba(${edge},${al})`); r.addColorStop(1, `rgba(${edge},0)`); g.fillStyle = r; g.beginPath(); g.arc(x, y, R, 0, two); g.fill(); }
};
/** thick soot with a fire-lit underside */
const soot = (p: Pen, lit: number, seed: number) => {
  const g = p.g; for (let i = 0; i < 6; i++) { const a = i * 1.05 + seed, d = i ? 96 : 0, x = 256 + d * Math.cos(a), y = 256 + d * 0.8 * Math.sin(a), R = i ? 112 : 150;
    const r = g.createRadialGradient(x, y - 30, 8, x, y, R), under = y > 270 ? lit : 0; r.addColorStop(0, `rgba(${Math.round(70 + 170 * under)},${Math.round(58 + 62 * under)},${Math.round(66 - 20 * under)},.95)`); r.addColorStop(0.75, "rgba(38,30,40,.9)"); r.addColorStop(1, "rgba(38,30,40,0)"); g.fillStyle = r; g.beginPath(); g.arc(x, y, R, 0, two); g.fill(); }
};
const wheelSpin = (p: Pen, u: number) => { p.ell(150, 150, 142, 142, "#a82e28", 10); p.ell(150, 150, 112, 112, "#7d1f1b", 5); for (let i = 0; i < 8; i++) { const a = u * two + (i * Math.PI) / 4; p.stroke([[150, 150], [150 + 110 * Math.cos(a), 150 + 110 * Math.sin(a)]], 13, "#c63939"); } p.ell(150, 150, 34, 34, "#2c2a36", 5); p.dot(150 + 62 * Math.cos(u * two), 150 + 62 * Math.sin(u * two), 15, "#c9ccd4"); };
const rod = (p: Pen) => { p.stroke([[20, 40], [980, 40]], 42, INK); p.stroke([[20, 40], [980, 40]], 26, "#c9ccd4"); };
const poster = (p: Pen) => {
  p.poly([[10, 10], [550, 10], [546, 750], [14, 746]], "#efdcae", 9);
  text(p, "WANTED", 280, 92, 92, "#7a2a25", "#efdcae");
  p.poly([[110, 160], [450, 160], [450, 540], [110, 540]], "#e5cf9c", 6); p.ell(280, 370, 108, 120, "#f6e7da", 8); p.dot(240, 350, 11); p.dot(320, 350, 11); p.stroke([[248, 420], [312, 420]], 8);
  p.arc(290, 228, 20, 28, 150, 420, 8, INK);
  text(p, "$10,000", 280, 620, 76, "#26321e", "#efdcae"); text(p, "ONE CURL", 280, 700, 42, "#7a2a25", "#efdcae");
};
const ticket = (p: Pen) => {
  p.poly([[14, 14], [706, 14], [706, 326], [14, 326]], "#f3e5bd", 9); p.stroke([[520, 24], [520, 316]], 6, "#b38f58");
  text(p, "ONE WAY", 268, 96, 84, "#7a2a25", "#f3e5bd"); text(p, "BY TRAIN", 268, 212, 76, "#1d2a55", "#f3e5bd"); text(p, "1899", 612, 170, 48, "#7a2a25", "#f3e5bd");
};
const steam = (p: Pen, t: number) => { for (let i = 0; i < 5; i++) { const a = i * 1.26 + 0.4, d = 30 + 60 * t, r = 44 + 12 * (i % 2); p.ell(150 + d * Math.cos(a), 150 + d * 0.8 * Math.sin(a), r, r * 0.85, `rgba(240,238,232,${(0.62 * (1 - t * t)).toFixed(3)})`, 0); } };

/** hinged ramp at door x: theta 0 = shut, 114 deg = on the ground. The normal is square to the board, so the near end stays low and reads as a slope */
const pushRamp = (out: Stage, x: number, th: number) => {
  const a = (th * Math.PI) / 180, R = 2.75, hy = 1.15, hz = -2.5, n: V3 = [0.001, Math.sin(a), Math.abs(Math.cos(a)) < 0.01 ? -0.01 : -Math.cos(a)];
  out.fx.push({ key: "doorway", cw: 520, ch: 480, draw: doorway, x: O[0] + x, y: 2.28, z: -2.43, w: 2.5, h: 2.3, face: [0, 0, 1] });
  out.fx.push({ key: "ramp", cw: 500, ch: 560, draw: ramp, x: O[0] + x, y: hy + (R / 2) * Math.cos(a), z: hz + (R / 2) * Math.sin(a) + 0.03, w: 2.5, h: R, face: n });
};
const smokeCol = (out: Stage, key: string, x: number, y: number, z: number, t: number, n = 6, s = 2.8, rise = 3.2, drift = 1.6) => {
  for (let i = 0; i < n; i++) { const v = (t * 0.55 + i / n) % 1, u = q(v, 10); out.fx.push({ key: `${key}|${u}`, cw: 300, ch: 300, soft: true, draw: (p) => steam(p, u), x: x - drift * v, y: y + rise * v * 2, z, w: s * (0.5 + v), h: s * (0.5 + v) }); }
};
/** the train's moving parts: stack steam, spinning wheels + the side rod. cx = the mover's car x, v = wheel turns a second */
const trainFx = (out: Stage, id: number, cx: number, t: number, v: number, drift: number, plume = 1) => {
  const X = O[0] + cx;
  smokeCol(out, `st${id}`, X + 18.1, 5.5, RAIL_Z, t, 7, 3.0 * plume, 3.4, drift);
  if (v <= 0) return;
  const u = q((t * v) % 1, 8);
  for (const dx of [13.2, 15.2, 17.2]) out.fx.push({ key: `wh|${u}`, cw: 300, ch: 300, draw: (p) => wheelSpin(p, u), x: X + dx, y: 0.82, z: RAIL_Z + 1.28, w: 1.68, h: 1.68, face: [0, 0, 1] });
  const a = u * two; out.fx.push({ key: "rod", cw: 1000, ch: 80, draw: rod, x: X + 15.2 + 0.47 * Math.cos(a), y: 0.82 + 0.47 * Math.sin(a), z: RAIL_Z + 1.36, w: 4.6, h: 0.34, face: [0, 0, 1] });
};

const seedR = (i: number) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
/** the blast at (x0, y0, z0): fireball lumps, then soot that keeps rising for the rest of the shot */
const fireball = (out: Stage, t: number, b: number, x0: number, y0: number, z0: number, big: number, seed: number, sideways = 0) => {
  if (t < b) return;
  for (let i = 0; i < 11; i++) { const k = (t - b - i * 0.018) / (0.95 + 0.25 * seedR(seed + i)); if (k < 0 || k >= 1) continue;
    const a = seedR(seed + i + 40) * two, sp = (1.5 + 5.5 * seedR(seed + i + 80)) * big, e = 1 - (1 - k) ** 3, u = q(k, 16), s = i % 3;
    out.fx.push({ key: `fb|${s}|${u}`, cw: 512, ch: 512, soft: true, draw: (p) => billow(p, u, s * 2.1), x: x0 + Math.cos(a) * sp * e * (1 + sideways), y: y0 + Math.abs(Math.sin(a)) * sp * e * 1.1 + 1.5 * big * k, z: z0 + i * 0.05, w: big * (3.2 + 6.5 * e), h: big * (3.2 + 6.5 * e) }); }
};
const sootCol = (out: Stage, t: number, t0: number, x0: number, z0: number, n: number, big: number) => {
  if (t < t0) return;
  const age = t - t0;
  for (let i = 0; i < n; i++) { const v = (age * 0.16 + i / n) % 1; if (age < (i / n) * 1.2) continue;
    const lit = q(Math.max(0, 1 - v * 3), 4), s = i % 3, w = big * (3.4 + 8 * v);
    out.fx.push({ key: `soot|${s}|${lit}`, cw: 512, ch: 512, soft: true, draw: (p) => soot(p, lit, s * 1.7), x: x0 + 3.5 * big * Math.sin(i * 2.4) * v - 2.6 * v, y: 2.2 + 21 * big * v, z: z0 - 0.3 - v, w, h: w }); }
};
const flashCard = (out: Stage, id: number, t: number, b: number, dur = 0.42) => {
  const k = (t - b) / dur; if (k < 0 || k >= 1) return;
  const c = camAt(id, Math.round(t * 30)), f = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]], n = Math.hypot(f[0], f[1], f[2]), d = 1.2, h = 2 * d * Math.tan((c.fov * Math.PI) / 360) * 1.1, a = q(0.85 * (1 - k) ** 2, 12);
  out.fx.push({ key: `flash|${a}`, cw: 64, ch: 64, soft: true, draw: (p) => { p.g.fillStyle = `rgba(255,190,110,${a})`; p.g.fillRect(0, 0, 64, 64); }, x: c.pos[0] + (f[0] / n) * d, y: c.pos[1] + (f[1] / n) * d, z: c.pos[2] + (f[2] / n) * d, w: h, h });
};
const ring = (out: Stage, t: number, b: number, x0: number, z0: number) => {
  const k = (t - b) / 0.6; if (k < 0 || k >= 1) return; const u = q(k, 12), R = 4 + 32 * (1 - (1 - k) ** 2);
  out.fx.push({ key: `ring|${u}`, cw: 512, ch: 512, soft: true, draw: (p) => glow(p, 512, [[0, "rgba(255,200,120,0)"], [0.72, "rgba(255,200,120,0)"], [0.88, `rgba(255,214,150,${(0.8 * (1 - u)).toFixed(3)})`], [1, "rgba(255,200,120,0)"]]), x: x0, y: 0.14, z: z0, w: 2 * R, h: 2 * R, flat: true });
};
/** arcs under gravity from a burst point */
const flung = (t: number, b: number, vx: number, vy: number, vz: number, g = 9) => { const k = t - b; return k < 0 ? null : { dx: vx * k, dy: vy * k - 0.5 * g * k * k, dz: vz * k, k }; };

export const fx = (id: number, t: number, out: Stage) => {
  for (const r of RIDERS(id)) pushHorse(out, r, t);
  const [a] = sec(id);
  const X = (x: number) => O[0] + x;
  const car = carAt(id, t);
  if (id === 2 && car !== null) trainFx(out, id, car, t, 3.2, 3.5);
  if (id === 3 && car !== null) { trainFx(out, id, car, t, 0, 1); lightAt(out, "lamp3", X(car + 20.6), 3.55, RAIL_Z, t, 2.4, false); }
  if (id === 5 || id === 6 || id === 7) pushRamp(out, YARD_X, 114);
  if (id === 8 || id === 9) {
    const me = id === 8 ? ME8 : [ME9[0] + 0.9 * ease((t - a) / 1.4), 0, ME9[2]] as V3, freq = id === 8 ? 4.5 : 3, h = handOf(L(me), t, freq), sw = q(0.14 * Math.sin(t * freq), 16), fl = q(Math.sin(t * 17) * 0.5 + 0.5, 3), y = h[1] - 0.23;
    lightAt(out, "lamp", h[0], y, h[2] + sw, t, 1.5);
    out.fx.push({ key: `lantern|${fl}`, cw: 300, ch: 300, draw: (p) => lantern(p, fl), x: h[0] + 0.04, y, z: h[2], w: 0.68, h: 0.68, rot: -sw * 1.2 });
    // the engine: the headlamp breathes too, its pool runs along the rails ahead
    if (car !== null) { const nose = X(car + 20.6); lightAt(out, "head", nose, 3.55, RAIL_Z, t * 0.7, id === 8 ? 5.5 : 4.2, id === 9); trainFx(out, id, car, t, t < 21.1 ? 1.6 : 0, 1.8, 0.9);
      const st = word("stops"); if (id === 9 && t > st - 0.6) { const u = q(clamp01((t - st + 0.6) / 1.2), 12); out.fx.push({ key: `sn|${u}`, cw: 300, ch: 300, soft: true, draw: (p) => steam(p, u), x: X(car + 17), y: 0.8, z: -2, w: 3.4, h: 3.4 }); } } }
  if (id === 10) { const pu = word("dynamite") - 0.2, d = q(ease((t - pu) / 0.16), 10);
    out.fx.push({ key: `plunger|${d}`, cw: 300, ch: 320, draw: (p) => plunger(p, d), x: X(57.0), y: 0.34, z: 1.0, w: 0.66, h: 0.7 });
    out.fx.push({ key: "wire", cw: 16, ch: 400, draw: (p) => { p.g.fillStyle = "#14121e"; p.g.fillRect(4, 0, 8, 400); }, x: X(57), y: 0.12, z: -0.65, w: 0.05, h: 3.2, flat: true });
    if (t > pu + 0.1) { const k = clamp01((t - pu - 0.1) / 0.95), z = 0.95 - 3.2 * k, b = q(0.7 + 0.3 * Math.sin(t * 40), 4); // the spark runs up the wire, the car glows when it arrives
      out.fx.push({ key: `spark|${b}`, cw: 256, ch: 256, soft: true, draw: (p) => glow(p, 256, warm(b)), x: X(57), y: 0.2, z, w: 0.9, h: 0.9 });
      if (k >= 1) flashCard(out, id, t, pu + 1.05, 0.14); } }
  if (id === 11) { const { roof, walls } = BEATS, C = [X(0.5), 2.6, -3.2] as const;
    flashCard(out, id, t, roof); flashCard(out, id, t, walls, 0.3);
    lightAt(out, "fire", C[0], 2.2, C[2] - 0.4, t, 7 + 3 * Math.max(0, 1 - (t - roof)), true);
    ring(out, t, roof, C[0], -1); ring(out, t, walls, C[0], -1);
    sootCol(out, t, roof + 0.25, C[0], C[2], 13, 1);
    fireball(out, t, roof, C[0], C[1], C[2], 1.1, 3); fireball(out, t, walls, C[0], 2.2, C[2] + 0.8, 0.85, 19, 0.9);
    // the roof goes: one long slab, spinning up, then planks; the walls go: panels, two straight at the lens
    const rf = flung(t, roof, 1.4, 13.5, 0.5, 6.5); if (rf && 3.5 + rf.dy > 0) out.fx.push({ key: "roof", cw: 400, ch: 300, draw: (p) => panel(p, "#6d3a30"), x: C[0] + rf.dx, y: 3.8 + rf.dy, z: C[2] + rf.dz, w: 10, h: 4, rot: q(rf.k * 1.6, 16) });
    for (let i = 0; i < 16; i++) { const f = flung(t, roof + i * 0.012, (seedR(i) - 0.5) * 22, 9 + 11 * seedR(i + 20), (seedR(i + 40) - 0.3) * 5); if (f && 3 + f.dy > 0.1) { const c = i % 2 ? "#a4452f" : "#3a2f2c"; out.fx.push({ key: `pl|${c}`, cw: 300, ch: 100, draw: (p) => plank(p, c), x: C[0] + f.dx, y: 3 + f.dy, z: C[2] + f.dz, w: 1.4 + 1.6 * seedR(i + 60), h: 0.5 + 0.5 * seedR(i + 60), rot: q(f.k * (3 + 5 * seedR(i + 80)), 12) }); } }
    for (const [i, vx, vz] of [[0, -9, 3], [1, 9.5, 2.5], [2, -3, 11], [3, 3.5, 14]] as number[][]) { const f = flung(t, walls, vx, 5, vz, 8); if (f && 2 + f.dy > 0.1 && C[2] + f.dz < 13) out.fx.push({ key: "wall", cw: 400, ch: 300, draw: (p) => panel(p, "#a4452f"), x: C[0] + f.dx, y: 2 + f.dy, z: C[2] + f.dz, w: 3.8, h: 2.7, rot: q(f.k * (i % 2 ? 4 : -4), 12) }); }
    for (let i = 0; i < 34; i++) { const b = i % 2 ? roof : walls, f = flung(t, b, (seedR(i + 100) - 0.5) * 30, 5 + 15 * seedR(i + 130), (seedR(i + 160) - 0.5) * 8, 7); if (f && f.k < 1.7 && 2.5 + f.dy > 0) out.fx.push({ key: "ember", cw: 48, ch: 48, draw: (p) => { p.ell(24, 24, 18, 18, "#ffd76a", 0); p.ell(24, 24, 9, 9, "#fff6d0", 0); }, x: C[0] + f.dx, y: 2.5 + f.dy, z: C[2] + f.dz + 1, w: 0.2, h: 0.2 }); } }
  if (id === 12) { const b = BEATS.safe, x0 = X(1.5);
    lightAt(out, "fire", x0, 2.2, -2.2, t, 5, false); sootCol(out, t, a - 1.5, x0, -3.5, 7, 0.5); flashCard(out, id, t, b, 0.3);
    fireball(out, t, b, x0, 1.6, -0.9, 0.42, 31);
    const dr = flung(t, b, 0.9, 2.2, 7, 5); if (dr && dr.dz < 3.2) out.fx.push({ key: "safedoor", cw: 400, ch: 400, draw: safeDoor, x: x0 + 0.4 + dr.dx, y: 1.8 + dr.dy, z: -0.1 + dr.dz, w: 1.15, h: 1.15, rot: q(dr.k * 6, 16) });
    for (let i = 0; i < 44; i++) { const f = flung(t, b + i * 0.012, (seedR(i + 200) - 0.5) * 7, 3.2 + 4.2 * seedR(i + 240), 0.6 + 2.2 * seedR(i + 280), 3.8); if (f) out.fx.push({ key: "bill", cw: 240, ch: 120, draw: bill, x: x0 + f.dx + 0.12 * Math.sin(f.k * 5 + i), y: Math.max(0.05, 1.7 + f.dy), z: -0.4 + f.dz, w: 0.52, h: 0.26, rot: q(f.k * (2 + (i % 5)) + i, 8) }); } }
  if (id === 13) { sootCol(out, t, a - 3.5, X(0.5), -3.5, 12, 1); lightAt(out, "fire", X(0.5), 2, -3.6, t, 5, false); }
  if (id === 19 && car !== null) { const st = 43.8; sootCol(out, t, a - 12, X(0), -3.5, 7, 0.55); trainFx(out, id, car, t, t < st ? clamp01((st - t) / 2.2) * 2.6 : 0, 2);
    pushRamp(out, car, 0); if (t > st - 1.4) { const u = q(clamp01((t - st + 1.4) / 2), 10); out.fx.push({ key: `sn|${u}`, cw: 300, ch: 300, soft: true, draw: (p) => steam(p, u), x: X(car + 17), y: 0.8, z: -1.9, w: 3.4, h: 3.4 }); } }
  if (id === 20 && car !== null) { const d0 = word("drops"), u = clamp01((t - d0 + 0.15) / 0.36), th = 114 * u * u; pushRamp(out, car, q(th, 2));
    if (u >= 1) { const k = q(clamp01((t - d0 - 0.2) / 0.7), 10); if (k < 1) out.fx.push({ key: `dust|${k}`, cw: 300, ch: 300, soft: true, draw: (p) => fxPuff(p, k), x: X(car), y: 0.5, z: 0.6, w: 5, h: 5 }); } }
  if ((id === 21 || id === 22) && car !== null) { pushRamp(out, car, 114); trainFx(out, id, car, t, 0, 1.6, 0.7); }
  if (id === 25 && car !== null) trainFx(out, id, car, t, 4.5, 8, 1.1);
  if (id === 27) out.fx.push({ key: "poster", cw: 560, ch: 760, draw: poster, x: X(133.1), y: 1.72, z: 20.38, w: 1.1, h: 1.5, face: [0, 0, -1] });
  if (id === 29) { const c = camAt(29, Math.round(t * 30)); out.fx.push({ key: "ticket", cw: 720, ch: 340, draw: ticket, x: c.look[0], y: 0.84, z: 1.75, w: 1.15, h: 0.54 }); }
};
