// What If ep09 acting: the extrovert at the party, then "you" as a red barrel sponge in the lagoon. Timed to the voice
// words. The lead sponge is a lit Place card drawn here (spongeDraw); its marks: the one curly hair on the back rim, the
// varsity red, knobbly edges, uneven pores, the open top (osculum), dot eyes with a blank face. Same drawing in every
// lagoon shot; only lid / party / assembly / squash change.
import { Pen, Outfit, FrontOpts, INK, POSES, curve, fxBurst, fxContact } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, lidAt, q } from "../../act";
import { YOU, NEIGHBOR, GRANDMA, RUNNER, CHANNEL_CAST } from "../people";
import { SHOTS } from "./story";
import words from "./words";

type P2 = [number, number];
const set = (id: number) => SETS[SHOTS[id - 1].set];
const L = (id: number, [x, y, z]: V3): V3 => { const o = set(id).origin; return [o[0] + x, o[1] + y, o[2] + z]; };
/** start of the first spoken `text` at or after `from` seconds */
const word = (text: string, from = 0) => {
  const hit = words.find((w) => w.start >= from - 0.01 && w.text.replace(/[^A-Za-z0-9']/g, "").toLowerCase() === text.toLowerCase());
  if (!hit) throw new Error(`Missing cast beat word: ${text} after ${from}`);
  return hit.start;
};
export const wearAt = (_t: number) => 0;

// ---------------- the party (shots 2, 13) ----------------
const SEAT = 0.58; // sofa cushion top (sets.ts party: cushions 0.49-0.63)
const TELL = [POSES.hands_up, POSES.shrug, POSES.point_right, POSES.wave]; // mid-story gestures
const laughRock = (k: number) => (t: number) => 4 * Math.sin(t * 9 + k);

const ACTS = (id: number): Act[] => {
  switch (id) {
    case 2: return [
      { i: 0, o: YOU, at: L(2, [0.05, 0, -1.45]), mode: "stand", expr: [[0, "excited"], [word("loudest") - LEAD, "laugh"]],
        reach: (t) => TELL[Math.floor((t - 5.6) / 0.55) % TELL.length], tilt: (t) => 3 * Math.sin(t * 5) },
      { i: 1, o: NEIGHBOR, at: L(2, [-1.2, 0, -2.1]), mode: "sit", seat: SEAT, expr: [[0, "laugh"]], tilt: laughRock(0), look: 0.5, reach: () => POSES.clap },
      { i: 2, o: GRANDMA, at: L(2, [-0.55, 0, -2.1]), mode: "sit", seat: SEAT, expr: [[0, "grin"], [word("party", 7.5) - LEAD, "laugh"]], tilt: laughRock(2), look: 0.4 },
      { i: 4, o: RUNNER, at: L(2, [0.5, 0, -2.1]), mode: "sit", seat: SEAT, expr: [[0, "laugh"]], tilt: laughRock(4), look: -0.4, reach: () => POSES.clap },
    ];
    case 13: return [
      { i: 0, o: YOU, at: L(13, [-0.4, 0, -2.3]), mode: "sit", seat: SEAT, expr: [[0, "sad"], [word("lonely") - LEAD, "sigh"]],
        head: (t) => 4 + 4 * clamp01((t - 72.3) / 1.2), lookY: () => 0.3 },
    ];
    default: return [];
  }
};
export const acts = ACTS;

// ---------------- the lead sponge (design canvas 600 x 1000, base at y 975 like a body card; 1000 u = 2.16 m) ----------------
const RED = "#d23f3f", RED_SH = "#94283a", RIM = "#ea6a5e", WALL = "#8e2433", HOLE = "#3a0a16", PORE = "#6d1626";
const RIM_Y = 470, RX = 185, RY = 48, BASE = 957, CURL_ROOT: P2 = [300, RIM_Y - RY + 2];
const hw = (y: number) => 150 + 60 * Math.sin(((975 - y) / (975 - RIM_Y)) * Math.PI * 0.8); // half width: a barrel that flares to the rim
const arcPts = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 24): P2[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
/** knobbly edge: a living sponge has no straight line anywhere; fades out at the rim so the wall meets it */
const wob = (y: number, s: number) => clamp01((y - RIM_Y) / 50) * (11 * Math.sin(y * 0.041 + s) + 7 * Math.sin(y * 0.097 + 2 * s) + 3.5 * Math.sin(y * 0.21 + s));
/** the lumpy rim: every term is zero at 0 / 180 degrees, so the wall joins it cleanly */
const rimPts = (a0: number, a1: number, n = 48): P2[] => Array.from({ length: n + 1 }, (_, i) => { const d = a0 + ((a1 - a0) * i) / n, a = (d * Math.PI) / 180, k = 1 + 0.04 * Math.sin(6 * a) + 0.022 * Math.sin(14 * a);
  return [300 + RX * k * Math.cos(a), RIM_Y + RY * k * Math.sin(a)]; });
const hash = (i: number) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const BODY: P2[] = (() => {
  const left: P2[] = [], right: P2[] = [];
  for (let y = BASE; y >= RIM_Y; y -= 7) left.push([300 - hw(y) - wob(y, 1), y]);
  for (let y = RIM_Y; y <= BASE; y += 7) right.push([300 + hw(y) + wob(y, 2.4), y]);
  return [...left, ...rimPts(180, 0), ...right, ...arcPts(300, BASE, hw(BASE) + 4, 18, 0, 180)];
})();
const FACE = { y: 662, dx: 46 };
const HOLES: [number, number, number, number][] = [[192, 795, 27, 21], [410, 772, 25, 20]]; // tunnel openings on the wall
const PORES: [number, number, number, number][] = (() => {
  const out: [number, number, number, number][] = [];
  for (let r = 0, y = 592; y < 945; r++, y += 44) for (let th = -1.3 + (r % 2) * 0.13; th < 1.31; th += 0.26) {
    const j = hash(r * 31 + Math.round(th * 100)), x = 300 + hw(y) * Math.sin(th + (j - 0.5) * 0.16), yy = y + (j - 0.5) * 26;
    if (Math.abs(x - 300) < 92 && yy > 615 && yy < 745) continue; // the face
    if (HOLES.some(([hx, hy, rx, ry]) => Math.hypot((x - hx) / (rx + 22), (yy - hy) / (ry + 18)) < 1)) continue;
    out.push([x, yy, Math.cos(th), 6 + 11 * hash(r * 13 + Math.round(th * 57))]);
  }
  return out;
})();
const SPECKS: [number, number, number][] = Array.from({ length: 260 }, (_, i) => { const y = 530 + hash(i + 300) * 430; return [300 + (hash(i + 700) * 2 - 1) * hw(y), y, i % 3]; });
/** cell targets inside the body (the regroup) and their scatter positions */
const CELLS: [P2, P2][] = Array.from({ length: 64 }, (_, i) => {
  const y = 520 + hash(i) * 420, x = 300 + (hash(i + 99) * 2 - 1) * hw(y) * 0.88;
  return [[300 + (hash(i + 7) * 2 - 1) * 280, 330 + hash(i + 51) * 620], [x, y]];
});

/** a small shrimp, head at (0, 0) facing up-left; claw = a snapping shrimp's big claw (open when snap) */
const shrimp = (p: Pen, x: number, y: number, s: number, ang: number, claw = false, snap = false) => {
  const g = p.g; g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  p.stroke(curve([-8, -6], [-26, -40], [-12, -78], 8), 3, INK); p.stroke(curve([4, -8], [-2, -46], [18, -80], 8), 3, INK); // antennae
  for (const [lx, ly] of [[-12, 22], [-8, 36], [-2, 50]] as const) p.stroke([[lx + 12, ly], [lx - 8, ly + 12]], 3.5, INK); // walking legs
  for (const [sx, sy, r] of [[12, 64, 9], [16, 48, 12], [14, 30, 14]] as const) p.ell(sx, sy, r, r * 0.9, "#ff7f5c", 4);
  p.poly([[12, 68], [-8, 90], [12, 84], [30, 92]], "#ff7f5c", 4); // tail fan
  p.poly([[-10, -4], [-34, -10], [-12, 10]], "#ff7f5c", 4); // the rostrum spike
  p.ell(4, 6, 19, 15, "#ff9a7a", 4);
  p.ell(-6, -8, 7, 7, "#ffffff", 3); p.dot(-7, -8, 4);
  if (claw) { const o = snap ? 0.55 : 0.1; p.ell(-24, 18, 15, 10, "#ff5a4f", 4, 0, 360, -20); p.poly([[-34, 12], [-50, 4 - 20 * o], [-40, 18]], "#ff5a4f", 4); }
  g.restore();
};
const crab = (p: Pen, x: number, y: number, s: number, k: number) => {
  const g = p.g; g.save(); g.translate(x, y); g.scale(s, s);
  for (const d of [-1, 1]) { p.stroke([[d * 22, -6], [d * 40, -26 - 6 * k]], 6, INK); p.ell(d * 44, -36 - 6 * k, 15, 12, "#f0b93a", 4); p.poly([[d * 44, -38 - 6 * k], [d * 62, -56 - 6 * k], [d * 38, -54 - 6 * k]], "#f0b93a", 3);
    for (const j of [0, 1, 2]) p.stroke([[d * 24, 4 + j * 5], [d * 46, 12 + j * 9]], 4, INK); }
  p.ell(0, 0, 30, 18, "#f0b93a", 5); p.stroke([[-8, -16], [-9, -28]], 4); p.stroke([[8, -16], [9, -28]], 4); p.dot(-9, -30, 4.5); p.dot(9, -30, 4.5);
  g.restore();
};
type SpongeOpts = { lid: number; k: number; curl: number; party: 0 | 1 | 2; beat: number; squash: number };
const BULBS = ["#ffd23f", "#ff5ab4", "#5ce1ff", "#7dff6a"];
const spongeDraw = (p: Pen, o: SpongeOpts) => {
  const g = p.g;
  if (o.k < 1) { // torn apart: single cells crawling back toward their places in the barrel
    const e = o.k * o.k * (3 - 2 * o.k);
    CELLS.forEach(([a, b], i) => {
      const w = (1 - e) * 10 * Math.sin(o.beat * 1.7 + i), x = a[0] + (b[0] - a[0]) * e + w, y = a[1] + (b[1] - a[1]) * e;
      p.ell(x, y, 22, 17, RED, 4, 0, 360, (i * 37) % 180); p.dot(x + 4, y - 2, 5.5, "#7a1c2a");
    });
    return;
  }
  g.save(); g.translate(300, 975); g.scale(1 + 0.07 * o.squash, 1 - 0.09 * o.squash); g.translate(-300, -975);
  // rim top + the hole (inner back wall lit, the throat dark)
  p.poly(rimPts(0, 360, 72), RIM, 7);
  const inner = arcPts(300, RIM_Y, 150, 36, 0, 360, 40);
  p.poly(inner, WALL, 5);
  p.clip(inner, () => p.ell(300, RIM_Y + 22, 142, 28, HOLE, 0));
  if (o.party) { // the party inside: shrimp dancing in the open top
    const xs = o.party === 2 ? [-118, -62, 62, 118] : [-105, 100]; // the curl keeps the middle
    xs.forEach((dx, i) => { const b = Math.abs(Math.sin((o.beat / 8) * Math.PI * 2 + i * 1.3));
      shrimp(p, 300 + dx, RIM_Y - 34 - 26 * b, 1.15, (i % 2 ? 0.28 : -0.28) * (b - 0.5) + (dx > 0 ? 0.25 : -0.15), i === 2, o.party === 2 && (o.beat + i) % 4 === 0); });
  }
  p.poly([...rimPts(180, 0), ...arcPts(300, RIM_Y, 150, 36, 0, 180)], RIM, 5); // front lip over the dancers
  // the wall
  p.shadedFill(BODY, RED, RED_SH, -2.2, 230);
  p.clip(BODY, () => {
    for (const [x, y, k] of SPECKS) p.dot(x, y, 2.5 + k, k === 1 ? "#a82c3c" : "#ee7468");
    for (const [x, y, c, r] of PORES) { p.ell(x, y, r * (0.35 + 0.65 * c), r, PORE, 0); p.arc(x, y + 1, r * (0.35 + 0.65 * c), r, 25, 155, 3, "#f08a7a"); }
    for (const [x, y, rx, ry] of HOLES) { p.ell(x, y, rx, ry, HOLE, 5); p.arc(x, y + 2, rx, ry, 20, 160, 4, "#f08a7a"); }
  });
  p.poly(BODY, null, 9);
  // face: dot eyes, a flat mouth (a sponge first: nothing to feel with)
  for (const s of [-1, 1]) { const x = 300 + s * FACE.dx;
    if (o.lid >= 1) p.stroke([[x - 15, FACE.y], [x + 15, FACE.y]], 7);
    else if (o.lid > 0) { p.ell(x, FACE.y + 4, 15, 9, INK, 0); }
    else { p.ell(x, FACE.y, 14, 16, INK, 0); p.dot(x - 4, FACE.y - 6, 4.5, "#ffffff"); } }
  p.stroke([[286, FACE.y + 58], [314, FACE.y + 58]], 6);
  if (o.party) { // string lights round the wall + guests peeking out of the tunnels
    const wire: P2[] = Array.from({ length: 15 }, (_, i): P2 => { const x = 128 + i * 25; return [x, 852 + 40 * Math.sin((Math.PI * (x - 128)) / 350)]; });
    p.stroke(wire, 4, INK);
    wire.forEach(([x, y], i) => { if (i % 2) return; const c = BULBS[(i / 2) % 4], on = (i / 2 + o.beat) % 2 === 0;
      if (on) p.ell(x, y + 12, 21, 21, c + "88", 0); p.ell(x, y + 12, 9, 12, on ? c : "#8a8aa0", 3); });
    shrimp(p, HOLES[0][0] - 6, HOLES[0][1] - 8, 0.8, -0.9 + 0.15 * Math.sin(o.beat), true, o.party === 2 && o.beat % 4 === 1);
    if (o.party === 2) crab(p, HOLES[1][0] + 4, HOLES[1][1] - 4, 0.7, o.beat % 2);
  }
  g.restore();
  if (o.curl > 0) { // the lead's one curly hair, off the back rim
    const [cx, cy] = CURL_ROOT, k = 2.3 * o.curl;
    const stem = curve([cx - 2 * k, cy + 3 * k], [cx - 6 * k, cy - 22 * k], [cx + 2 * k, cy - 38 * k], 12);
    const tip = curve([cx + 2 * k, cy - 38 * k], [cx + 9 * k, cy - 46 * k], [cx + 16 * k, cy - 45 * k], 8);
    p.stroke([...stem, ...tip.slice(1)], 9, INK);
    p.stroke(Array.from({ length: 19 }, (_, i): P2 => { const a = Math.PI + (i / 18) * Math.PI * 1.85; return [cx + 5 * k + 7 * k * Math.cos(a), cy - 12 * k + 7.5 * k * Math.sin(a)]; }), 9, INK);
  }
};

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
/** a reef fish facing right, 300 x 180; flap -1..1 */
const fish = (p: Pen, col: string, flap: number, stripe = "#1d1a3a") => {
  p.poly([[70, 90], [12, 40 + 14 * flap], [26, 90], [12, 140 + 14 * flap]], col, 7);
  p.ell(160, 90, 105, 58, col, 7);
  p.clip([[60, 30], [260, 30], [260, 150], [60, 150]], () => p.ell(125, 90, 14, 56, stripe, 0));
  p.poly([[150, 36], [190, 6], [205, 40]], col, 6);
  p.ell(222, 76, 15, 15, "#ffffff", 5); p.dot(226, 76, 7);
  p.stroke([[252, 104], [262, 100]], 5);
};
/** icon disc, 300 x 300: a mouth / legs / brain, crossed out */
const icon = (p: Pen, kind: "mouth" | "legs" | "brain", crossed: number) => {
  p.ell(150, 150, 130, 130, "#ffffff", 9);
  if (kind === "mouth") { p.ell(150, 150, 82, 42, "#e25b6a", 8); p.stroke([[78, 150], [222, 150]], 7); p.ell(150, 132, 40, 10, "#f39aa6", 0); }
  if (kind === "legs") for (const d of [-1, 1]) { p.stroke([[150 + d * 26, 60], [150 + d * 30, 200]], 22, "#3b5b9a"); p.ell(150 + d * 44, 214, 34, 18, "#f4f1ea", 6); }
  if (kind === "brain") { for (const [x, y, r] of [[105, 140, 48], [150, 112, 52], [195, 140, 48], [150, 175, 58]] as const) p.ell(x, y, r, r * 0.85, "#f7a6b8", 7);
    for (const [x, y, r] of [[105, 140, 42], [150, 112, 46], [195, 140, 42], [150, 175, 52]] as const) p.ell(x, y, r, r * 0.85, "#f7a6b8", 0);
    p.stroke(curve([110, 125], [130, 150], [118, 175], 8), 6); p.stroke(curve([175, 110], [160, 140], [185, 168], 8), 6); p.stroke([[150, 92], [150, 205]], 6); }
  if (crossed > 0) { const e = clamp01(crossed), a: P2 = [50, 50], b: P2 = [250, 250], c: P2 = [250, 50], d: P2 = [50, 250];
    p.stroke([a, [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e]], 30, "#ff3b30");
    if (e > 0.5) { const f = (e - 0.5) * 2; p.stroke([c, [c[0] + (d[0] - c[0]) * f, c[1] + (d[1] - c[1]) * f]], 30, "#ff3b30"); } }
};
/** water arrow pointing right, 300 x 120 */
const arrow = (p: Pen) => p.poly([[10, 42], [190, 42], [190, 12], [290, 60], [190, 108], [190, 78], [10, 78]], "#5ce1ff", 8);
/** coloured light beams fanning up from the bottom centre, 600 x 600 (soft card) */
const beams = (p: Pen, beat: number) => {
  const g = p.g;
  for (const i of [0, 1, 3, 4]) { // no middle beam: the curl stands there
    const a = -Math.PI / 2 + (i - 2) * 0.32 + 0.1 * Math.sin(beat * 0.8 + i), c = BULBS[(i + beat) % 4];
    g.save(); g.globalAlpha = 0.38; g.fillStyle = c; g.beginPath(); g.moveTo(300, 600);
    g.lineTo(300 + 620 * Math.cos(a - 0.09), 600 + 620 * Math.sin(a - 0.09)); g.lineTo(300 + 620 * Math.cos(a + 0.09), 600 + 620 * Math.sin(a + 0.09)); g.closePath(); g.fill(); g.restore();
  }
  for (let i = 0; i < 9; i++) { const x = 60 + hash(i + beat * 9) * 480, y = 60 + hash(i * 3 + beat) * 380; p.ell(x, y, 9, 9, BULBS[i % 4], 0); }
};
/** pale mucus cloud, 500 x 400 */
const slime = (p: Pen, k: number) => {
  for (const [x, y, r] of [[250, 250, 120], [160, 230, 85], [340, 225, 90], [210, 150, 80], [300, 140, 85], [250, 90, 60]] as const) p.ell(x, y, r * k, r * k * 0.85, "#e2f2c8", 6);
  for (const [x, y, r] of [[250, 250, 112], [160, 230, 78], [340, 225, 83], [210, 150, 73], [300, 140, 78], [250, 90, 54]] as const) p.ell(x, y, r * k, r * k * 0.85, "#e2f2c8", 0);
  for (let i = 0; i < 9; i++) p.ell(250 + (hash(i) - 0.5) * 300 * k, 190 + (hash(i + 5) - 0.5) * 220 * k, 9 * k, 7 * k, "#a8cf86", 0);
};
const clockFace = (p: Pen, u: number) => { p.ell(100, 100, 86, 86, "#ffffff", 8); const a = u * Math.PI * 2;
  p.stroke([[100, 100], [100 + 60 * Math.sin(a), 100 - 60 * Math.cos(a)]], 10); p.stroke([[100, 100], [100 + 40 * Math.sin(a / 12 + 1), 100 - 40 * Math.cos(a / 12 + 1)]], 12); p.dot(100, 100, 10); };
/** a shrimp snap, 500 x 500: bright fat star + white core + the word; u in 0..1 */
const snapStar = (p: Pen, u: number) => {
  const k = (1 - (1 - clamp01(u / 0.3)) ** 2) * (u < 0.75 ? 1 : (1 - u) / 0.25 * 0.5 + 0.5);
  const star = (ro: number, ri: number): P2[] => Array.from({ length: 16 }, (_, i) => { const r = (i % 2 ? ri : ro) * k, a = (i / 16) * Math.PI * 2 + 0.2; return [250 + r * Math.cos(a), 250 + r * Math.sin(a)]; });
  p.poly(star(240, 120), "#ffe14a", 8); p.poly(star(150, 80), "#ffffff", 0);
  text(p, "SNAP!", 250, 254, 92 * k, "#ff3b30", "#ffffff");
};
const heart = (p: Pen) => { const pts: P2[] = []; for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2; pts.push([100 + 80 * Math.pow(Math.sin(a), 3), 95 - 5 * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))]); } p.poly(pts, "#ff5a7a", 8); };
const bubble = (p: Pen) => { p.ell(50, 50, 40, 40, "rgba(230,255,255,.55)", 5); p.ell(36, 36, 10, 8, "#ffffff", 0); };
/** a speech bubble with loud lines, 420 x 300 */
const shout = (p: Pen, n: number) => { p.ell(210, 130, 190, 110, "#ffffff", 8); p.poly([[120, 220], [80, 290], [175, 232]], "#ffffff", 0); p.stroke([[118, 226], [80, 290], [172, 236]], 8);
  text(p, n % 2 ? "AND THEN—" : "SO I SAID", 210, 130, 46, "#16325c", "#ffffff"); };

const SPONGE_TAG = 9; // the sponge's blink seed (not a cast index)
const beatAt = (t: number) => Math.floor(t * 4) % 8; // the groove: 8 steps, 4 per second

export const fx = (id: number, t: number, out: Stage) => {
  const S = SHOTS[id - 1];
  if (S.insert) return;
  const burst = (key: string, t0: number, dur: number, draw: (p: Pen, u: number) => void, cw: number, ch: number, x: number, y: number, z: number, w: number, h: number) => {
    const u = q(clamp01((t - t0) / dur), 15);
    if (t >= t0 && u < 1) out.fx.push({ key: `${key}|${u}`, cw, ch, draw: (p) => draw(p, u), x, y, z, w, h });
  };
  /** a card that pops in at t0 and stays until t1 */
  const hold = (key: string, t0: number, t1: number, draw: (p: Pen) => void, cw: number, ch: number, x: number, y: number, z: number, w: number, h: number, soft = false) => {
    if (t < t0 || t > t1) return; const k = q(pop(t, t0), 10);
    out.fx.push({ key: `${key}|${k}`, cw, ch, draw, x, y, z, w: w * k, h: h * k, soft });
  };
  if (S.set === "party") {
    const y = L(id, [0, 0, 0]);
    if (id === 2) {
      const n = Math.floor((t - 5.6) / 1.4);
      hold(`shout${n % 2}`, 5.75, 9.6, (p) => shout(p, n), 420, 300, y[0] + 0.42, 2.12, y[2] - 1.35, 0.62, 0.44);
      for (const [k, x, t0] of [[0, -1.2, 6.4], [1, 0.5, 7.4], [2, -0.55, 8.3]] as const)
        if (t > t0 && t < t0 + 1.0) hold(`ha${k}`, t0, t0 + 1.0, (p) => text(p, "HA HA", 150, 60, 54, "#ffd23f"), 300, 120, y[0] + x, 1.74, y[2] - 2.0, 0.42, 0.17);
    }
    return;
  }
  // ---- lagoon: the lead sponge ----
  const s = L(id, [0, 0, 0]), at = (dx: number, wy: number, dz = 0.03): [number, number, number] => [s[0] + dx, wy, s[2] + dz];
  const party: 0 | 1 | 2 = id === 1 ? 1 : id === 12 || id === 14 ? 2 : 0, beat = party ? beatAt(t) : 0;
  let lid = lidAt(t, SPONGE_TAG, []), k = 1, curl = 1, squash = 0;
  if (id === 3) { const op = word("up", 9.8) - LEAD; lid = t < op ? 1 : t < op + 0.1 ? 0.5 : lidAt(t, SPONGE_TAG, [op + 0.9]); }
  if (id === 7) { const sn = word("sneeze") - 0.15; squash = q(clamp01((t - sn) / 0.12) * (1 - clamp01((t - sn - 0.15) / 0.2)), 8); }
  if (id === 11) { const f0 = word("find", 61) - 0.45, f1 = word("again", 62) + 0.15, pc = word("again", 62) + 0.35;
    k = q(clamp01((t - f0) / (f1 - f0)), 30); curl = t < pc ? 0 : q(clamp01((t - pc) / 0.15) * (1 + 0.3 * Math.sin(clamp01((t - pc) / 0.45) * Math.PI)), 12);
    if (k < 1) lid = 0; }
  const wiggle = id === 11 && k < 1 ? Math.floor(t * 6) : beat;
  const o: SpongeOpts = { lid, k, curl, party, beat: wiggle, squash };
  out.places.push({ key: `sponge|${fkeyS(o)}`, draw: (p) => spongeDraw(p, o), x: s[0], y: 0, z: s[2], size: [1440, 2400, 2.4] });
  out.fx.push({ key: "blob|contact|sponge", cw: 128, ch: 128, draw: (p) => fxContact(p, "#4a6c80"), x: s[0], y: 0.022, z: s[2] + 0.05, w: 1.0, h: 0.62, flat: true });
  if (party) {
    out.fx.push({ key: `beams|${beat}`, cw: 600, ch: 600, draw: (p) => beams(p, beat), x: s[0], y: 1.09 + 0.62, z: s[2] - 0.04, w: 1.5, h: 1.25, soft: true });
    for (let i = 0; i < 4; i++) { const ph = ((t * 0.45 + i / 4) % 1), bx = (hash(i + 3) - 0.5) * 0.6;
      out.fx.push({ key: "bubble", cw: 100, ch: 100, draw: bubble, x: s[0] + bx + 0.04 * Math.sin(t * 3 + i), y: 1.25 + ph * 1.1, z: s[2] + 0.1, w: 0.06 + 0.03 * (i % 2), h: 0.06 + 0.03 * (i % 2), soft: true }); }
  }
  if (id === 12) { // shrimp snapping inside you, and you feel none of it
    for (const [i, t0] of [66.9, 67.9, 68.7, 69.5, 70.6, 71.4].entries())
      burst(`snap${i}`, t0, 0.45, snapStar, 500, 500, s[0] + (i % 2 ? 0.3 : -0.32), i % 3 ? 1.22 : 0.45, s[2] + 0.12, 0.5, 0.5);
    hold("felt", word("feel", 70) - LEAD, 72.2, (p) => tagCard(p, "FELT: 0", "#ffffff", "#c63939", 64), 500, 160, s[0] - 0.42, 1.58, s[2] + 0.2, 0.44, 0.14);
  }
  if (id === 4) { // no mouth, no legs, no brain; a fish says hi, you can't wave
    const kinds: ["mouth" | "legs" | "brain", string, number][] = [["mouth", "mouth", -0.5], ["legs", "legs", 0], ["brain", "brain", 0.5]];
    for (const [kind, w, dx] of kinds) { const t0 = word(w, 12) - LEAD, x = q(clamp01((t - t0 - 0.25) / 0.3), 10);
      hold(`ic${kind}${x}`, t0, 18.4, (p) => icon(p, kind, x), 300, 300, s[0] + dx, 1.62, s[2] + 0.1, 0.36, 0.36); }
    const f0 = 15.9, u = clamp01((t - f0) / 2.4), fl = Math.round(Math.sin(t * 14) * 2) / 2;
    if (t > f0) out.fx.push({ key: `fishA|${fl}`, cw: 300, ch: 180, draw: (p) => fish(p, "#ffd23f", fl), x: s[0] + 1.3 - 2.6 * u, y: 1.28 + 0.05 * Math.sin(t * 3), z: s[2] + 0.25, w: -0.36, h: 0.22 });
  }
  if (id === 5) { // water pours in from every side, out of the top
    const ph = q((t * 1.2) % 1, 10), on = t > word("body", 18.6) - LEAD;
    if (on) for (const [dx, y, side] of [[-0.62, 0.35, 1], [-0.68, 0.72, 1], [0.62, 0.5, -1], [0.68, 0.88, -1], [-0.6, 1.0, 1]] as const)
      out.fx.push({ key: `arrow`, cw: 300, ch: 120, draw: arrow, x: s[0] + dx + side * 0.12 * ph, y, z: s[2] + 0.15, w: side * 0.36, h: 0.14 });
    if (on) out.fx.push({ key: "arrowUp", cw: 300, ch: 120, draw: arrow, x: s[0] + 0.24, y: 1.32 + 0.06 * ph, z: s[2], w: 0.3, h: 0.13, rot: Math.PI / 2 });
  }
  if (id === 7) { // eat what drifts in, sneeze the slime, fish line up to eat it
    const e0 = word("eat") - LEAD, sn = word("sneeze") - LEAD, f0 = word("fish", 34) - LEAD, et = word("eat", 35) - LEAD;
    for (let i = 0; i < 6; i++) { const u = ((t - e0) * 0.5 + i / 6) % 1; if (t < e0 || t > sn) break;
      const a = (i / 6) * Math.PI * 2; out.fx.push({ key: `speck${i % 3}`, cw: 60, ch: 60, draw: (p) => p.ell(30, 30, 20, 20, ["#7dff6a", "#ffd23f", "#ffffff"][i % 3], 5), x: s[0] + Math.cos(a) * 0.9 * (1 - u), y: 1.15 + 0.5 * Math.abs(Math.sin(a)) * (1 - u), z: s[2] + 0.1, w: 0.09, h: 0.09 }); }
    const grow = clamp01((t - sn) / 0.6), eaten = clamp01((t - et) / 0.5), ck = q(grow * (1 - eaten), 12);
    if (t > sn && ck > 0.02) out.fx.push({ key: `slime|${ck}`, cw: 500, ch: 400, draw: (p) => slime(p, 0.5 + 0.5 * ck), x: s[0] + 0.1 + 0.22 * grow, y: 1.28 + 0.24 * grow, z: s[2] + 0.12, w: 0.72, h: 0.58 });
    const ev = word("every", 32) - LEAD, hand = q(((t - ev) * 0.9) % 1, 12); // every few hours: a clock spins
    hold(`clock${hand}`, ev, sn + 0.3, (p) => clockFace(p, hand), 200, 200, s[0] - 0.62, 1.45, s[2] + 0.15, 0.3, 0.3);
    burst("puff", sn, 0.4, (p, u) => fxBurst(p, u, "#e2f2c8", 10, 30, 180), 500, 500, s[0], 1.2, s[2] + 0.1, 0.5, 0.5);
    for (let i = 0; i < 3; i++) { const t0 = f0 + i * 0.18, u = clamp01((t - t0) / 0.55), fl = Math.round(Math.sin(t * 16 + i) * 2) / 2;
      if (t < t0) continue; const tx = 0.05 + 0.24 * i, nib = t > et ? 0.03 * Math.sin(t * 20 + i) : 0;
      out.fx.push({ key: `fish${i}|${fl}`, cw: 300, ch: 180, draw: (p) => fish(p, ["#5ca8d8", "#ffd23f", "#b45fa0"][i], fl), x: s[0] + (-1.6 + (tx + 1.6) * u) + nib, y: 1.5 + 0.11 * (i - 1) + 0.03 * Math.sin(t * 4 + i), z: s[2] + 0.2, w: 0.38, h: 0.23 }); }
  }
  if (id === 11) { // the cells find each other: a pop, then love
    const done = word("again", 62) + 0.15;
    burst("merge", done - 0.05, 0.5, (p, u) => fxBurst(p, u, "#fff3b0"), 500, 500, s[0], 0.6, s[2] - 0.1, 2.2, 2.2); // behind the card: rays round the body, not across the face
    const h0 = word("extroverted") - LEAD;
    for (const [i, dx, y] of [[0, -0.45, 1.2], [1, 0.45, 1.3], [2, 0.25, 1.55]] as const)
      hold(`heart${i}`, h0 + i * 0.15, 66.1, heart, 200, 200, s[0] + dx, y + 0.05 * Math.sin(t * 3 + i), s[2] + 0.15, 0.2, 0.2);
  }
};
const fkeyS = (o: SpongeOpts) => `${o.lid}|${o.k}|${o.curl}|${o.party}|${o.beat}|${o.squash}`;

export const CAST: [string, Outfit, Partial<FrontOpts>][] = CHANNEL_CAST.map(([n, o]) => [n, o, { expr: "smile" }]);
