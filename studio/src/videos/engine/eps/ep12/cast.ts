// What If ep12 acting: you fall between bed and sky. Timed to the voice words, plus the shot fx (the tumbling alarm clock,
// speed lines + the 200 km/h dial, the pounding heart, zZ, the door in the sky, the watch, the floating digits, the
// bedside clock). Sky shots: fall() pins you under the sky-fall lens, AIR shots hang you at a set-local point.
import { Pen, Outfit, FrontOpts, INK, POSES, fxShock, fxSpeed, fxPuff } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { fallPos, camAt } from "../../story";
import { Act, Stage, LEAD, q } from "../../act";
import { YOU } from "../people";
import { SHOTS } from "./story";
import words from "./words";

const set = (id: number) => SETS[SHOTS[id - 1].set];
const L = (id: number, [x, y, z]: V3): V3 => { const o = set(id).origin; return [o[0] + x, o[1] + y, o[2] + z]; };
/** start of the first spoken `text` at or after `from` seconds */
export const word = (text: string, from = 0) => {
  const hit = words.find((w) => w.start >= from - 0.01 && w.text.replace(/[^A-Za-z0-9'-]/g, "").toLowerCase() === text.toLowerCase());
  if (!hit) throw new Error(`Missing cast beat word: ${text} after ${from}`);
  return hit.start;
};
export const wearAt = (_t: number) => 0;

type Pose = FrontOpts["reach"];
const ease = (x: number) => { const k = clamp01(x); return k * k * (3 - 2 * k); };
const WIDE: Pose = [{ ex: -30, ey: -0.05, hx: -60, hy: -0.28, front: true }, { ex: 30, ey: -0.05, hx: 60, hy: -0.28, front: true }];
const sec = (id: number) => [SHOTS[id - 1].a / 30, SHOTS[id - 1].b / 30];

// set-local marks
const MATTRESS = 0.45;                  // bedroom: mattress top
const BED_FEET: V3 = [-1.1, MATTRESS, -1.45]; // lying on the bed, head to the pillow (-z)
const ON_BED: V3 = [-1.1, MATTRESS, -2.1];    // sitting up in bed
const BY_BED: V3 = [-1.85, 0, -2.1];   // the floor left of the bed
const FLOOR: V3 = [0.6, 0.01, -0.5];   // lying on the bedroom floor (feet)
const LAND: V3 = [20, 0.21, 0];        // lying in the field (feet), on the grass patches (top 0.19)
const ON_PILLOW = 0.49;                // lying in bed: card level with the pillow top, so the head rests ON it (s13: under it before)
/** asleep: arms down by the sides under the blanket */
const SLEEP_ARMS: Pose = [{ ex: -26, ey: 0.4, hx: -22, hy: 0.85 }, { ex: 26, ey: 0.4, hx: 22, hy: 0.85 }];
const SIT: V3 = [0.6, 0, -0.9];        // sitting on the floor

const shake = (t: number, t0: number, dur = 0.35) => (t > t0 && t < t0 + dur ? 9 * Math.sin((t - t0) * 70) * (1 - (t - t0) / dur) : 0);
/** 0 -> 1 -> 0 around a beat: up in 0.15 s from t0 - 0.1, holds `hold` s, down in 0.5 s */
const bump = (t: number, t0: number, hold = 0.6) => ease((t - t0 + 0.1) / 0.15) * (1 - ease((t - t0 - hold) / 0.5));
type Life = { panic?: number[]; calm?: number; still?: boolean };
/** a living fall (fix #11, all from time t so the 1.1x speed-up stays smooth): each limb on its own sine (0.62-1.07 s, own
 *  phase, +-20 deg; elbows / knees follow through), the whole card rolls +-8 deg over 1.5 s, the hair + hem flutter.
 *  panic = beat times: twice the swing, faster + a shudder. calm = from that time the limbs open wide and slow to a
 *  still starfish (still = already there). */
const life = (l: Life = {}): Partial<Act> => {
  const pan = (t: number) => Math.max(0, ...(l.panic ?? []).map((b) => bump(t, b)));
  const calm = (t: number) => (l.still ? 1 : l.calm !== undefined ? ease((t - l.calm) / 1.4) : 0);
  // integrated clock: a beat speeds the swing up (x1.6) without a jump in phase
  const ph = (t: number) => t + (l.panic ?? []).reduce((s, b) => s + 0.6 * 0.75 * (ease((t - b + 0.1) / 0.3) + ease((t - b - 0.6) / 0.5)), 0);
  const P = [0.73, 0.91, 1.07, 0.62], PH = [0, 1.9, 3.7, 5.1], two = Math.PI * 2;
  return {
    phase: (t) => t * 1.5, // hair + jacket hem: 6 Hz flutter (toon.ts reads phase x 4)
    flail: (t) => { const c = calm(t), k = (1 + pan(t)) * (1 - c), u = ph(t);
      const a = P.map((p, i) => q(k * 20 * Math.sin((two * u) / p + PH[i]), 1));
      return [a[0] - 12 * c, a[1] - 12 * c, a[2] + 24 * c, a[3] + 24 * c, q(k * 14 * Math.sin((two * u) / 0.73 - 1.2), 1) - 30 * c]; },
    roll: (t) => (1 - 0.6 * calm(t)) * 8 * Math.sin((two * t) / 3) + (l.panic ?? []).reduce((s, b) => s + 0.8 * shake(t, b, 0.4), 0),
  };
};
/** pinned under the sky-fall lens, bobbing toward / away from the lens a little (air resistance) */
const fall = (id: number, expr: Act["expr"], more: Partial<Act> = {}, l?: Life): Act =>
  ({ i: 0, o: YOU, at: [0, 0, 0], mode: "fall_belly", expr, noShadow: true, ...life(l),
    path: (t) => { const p = fallPos(id, t, 4 + 0.18 * Math.sin(t * 2.7)); return [p[0] + 0.12 * Math.sin(t * 2.1), p[1], p[2] + 0.1 * Math.sin(t * 1.7)]; }, ...more });
/** hanging in the air at a set-local point (side views), bobbing in the wind */
const air = (id: number, at: V3, expr: Act["expr"], more: Partial<Act> = {}, l?: Life): Act =>
  ({ i: 0, o: YOU, at: L(id, at), mode: "fall_belly", expr, noShadow: true, ...life(l), drift: (t) => [0.05 * Math.sin(t * 2.3), 0.06 * Math.sin(t * 3.1), 0.08 * Math.sin(t * 2.7)], ...more });
/** hands behind the head, lying on the back (a standing card never does this) */
const PILLOW_HANDS: Pose = [{ ex: -44, ey: -0.42, hx: -14, hy: -0.78 }, { ex: 44, ey: -0.42, hx: 14, hy: -0.78 }];

const ACTS = (id: number): Act[] => {
  switch (id) {
    case 1: return [fall(1, [[0, "shock"]], {}, { panic: [word("never")] })];
    case 2: return [air(2, [0, 200, 30], [[0, "shook"]], { lookY: () => 0.6 })];
    case 3: { const r = word("rolling"), drop = r + 0.85;
      return [{ i: 0, o: YOU, at: L(3, BED_FEET), mode: "lie_back", expr: [[0, "tired"], [drop - 0.1, "shock"]], noShadow: true, reach: (t) => (t < drop - 0.1 ? SLEEP_ARMS : POSES.hands_up),
        path: (t) => L(3, [-1.1 + 0.85 * ease((t - r) / 0.95), ON_PILLOW + (0.01 - ON_PILLOW) * ease((t - drop) / 0.25), -1.45 + 0.6 * ease((t - drop) / 0.3)]) }]; }
    case 4: return [fall(4, [[0, "tired"], [word("sky") - LEAD, "shock"]], {}, { panic: [word("sky")] })];
    case 5: return [air(5, [0, 150, 0], [[0, "scared"], [word("hundred") - LEAD, "shook"]], { lookY: () => 0.3 }, { panic: [word("two")] })];
    case 6: { const j = word("jerks");
      return [fall(6, [[0, "scared"], [word("body") - LEAD, "shock"]], { tilt: (t) => shake(t, j - 0.3), reach: (t) => (t > j - 0.3 ? POSES.hands_up : undefined) }, { panic: [word("rooftops"), j - 0.3] })]; }
    case 7: return [{ i: 0, o: YOU, at: L(7, ON_BED), mode: "jolt_bed", expr: [[0, "scared"], [word("heart") - LEAD, "shook"]], tilt: (t) => shake(t, 15.17, 0.4), look: -0.2 }];
    case 8: { const a = 18.45;
      return [{ i: 0, o: YOU, at: L(8, BY_BED), mode: "slide_off", expr: [[0, "nervous"], [word("again", 19.6) - LEAD, "shook"]], lookY: () => 0.5, look: -0.4,
        path: (t) => L(8, [BY_BED[0] + 0.12 - 0.25 * ease((t - a) / 1.6), 0, BY_BED[2]]) }]; }
    case 9: return [air(9, [0, 80, 0], [[0, "confused"], [word("desert") - LEAD, "jawdrop"]], { lookY: () => 0.4 })];
    case 10: return [air(10, [0, 60.6, 0], [[0, "shock"]], {}, { panic: [22.9] })];
    case 11: return [air(11, [0, 150.5, 0], [[0, "jawdrop"]], { lookY: () => -0.3 }, { panic: [23.94] })];
    case 12: return [air(12, [0, 149.95, 0], [[0, "scared"], [word("real") - LEAD, "shook"]], {}, { panic: [word("real")] })];
    // 13: 9 cm over the pillow: within 8 cm the pillow's ink edge ran across the eyes (ink.ts card test)
    case 13: return [{ i: 0, o: YOU, at: L(13, [BED_FEET[0], ON_PILLOW + 0.09, BED_FEET[2]]), mode: "lie_back", expr: [[0, "tired"], [word("off", 28.5) - LEAD, "smile_closed"]], noShadow: true, reach: () => SLEEP_ARMS }];
    case 15: { const tw = word("twitch"); // the 0.3 s face swap starts 6 f early so the mouth flips 1-2 f before the word: a 0.58 s shock pop, back to tired
      return [air(15, [40, 13.7, 30], [[0, "tired"], [tw - 0.13, "shock"], [tw + 0.45, "tired"]], { tilt: (t) => shake(t, tw), reach: (t) => (t > tw - LEAD ? POSES.hands_up : undefined) }, { panic: [tw] })]; }
    case 17: return [air(17, [0, 149.8, 0], [[0, "curious"], [word("slams") - LEAD - 0.4, "shock"]], { lookY: () => 0.4 }, { panic: [word("slams") - 0.4] })];
    case 18: return [air(18, [3, 60.5, 0], [[0, "dazed"]], { roll: (t) => 40 * (t - 41.33) }, { panic: [41.33] })];
    case 19: return [fall(19, [[0, "concentrate"], [word("lucid") - LEAD, "scheming"]], { reach: () => POSES.chin_think }, { calm: 42.6 })];
    case 20: { const r = word("read", 46.5);
      return [air(20, [0, 99.8, 0], [[0, "concentrate"], [word("watch", 47) - LEAD, "curious"]], { prop: "watch", reach: (t) => (t > r - 0.1 ? POSES.watch_read : undefined), look: (t) => (t > r ? 0.6 : 0), lookY: (t) => (t > r ? 0.5 : 0) })]; }
    case 21: return [air(21, [0, 99.8, 0], [[0, "squint"], [word("nine-forty") - LEAD, "confused"]], { prop: "watch", reach: () => POSES.watch_read, look: 0.6, lookY: () => 0.5 })];
    case 22: return [air(22, [0, 99.7, 0], [[0, "squint"], [word("numbers", 53) - LEAD, "sly"]], { prop: "watch", reach: () => POSES.watch_read, look: (t) => (t > word("numbers", 53) ? 0 : 0.6), lookY: (t) => (t > word("numbers", 53) ? 0 : 0.5) })];
    case 23: return [air(23, [0, 60, 0], [[0, "smile"], [word("flinch") - LEAD, "relief"]], { reach: (t) => (t > word("flinch") - 0.2 ? WIDE : undefined) }, { calm: word("flinch") - 0.3 })];
    case 24: return [air(24, [0, 27.1, 0], [[0, "relief"]], { reach: () => WIDE, path: (t) => L(24, [0, 27.1 - 0.9 * clamp01((t - 58.4) / 2.6), 0]) }, { still: true })];
    case 25: { const l = 61.02; // match cut A: on the back in the grass, hands behind the head, ankles crossed, body on the diagonal
      return [{ i: 0, o: YOU, at: L(25, LAND), mode: "lie_back", expr: [[0, "relief"], [word("field") - LEAD, "smile_closed"]], noShadow: true, reach: () => PILLOW_HANDS,
        path: (t) => L(25, [LAND[0], LAND[1] + 1.1 * (1 - ease((t - l) / 0.3)), LAND[2]]) }]; }
    case 26: return [{ i: 0, o: YOU, at: L(26, FLOOR), mode: "lie_back", expr: [[0, "smile_closed"], [word("floor") - LEAD, "dazed"]], noShadow: true, reach: () => PILLOW_HANDS }]; // match cut B: same pose + framing
    case 27: { const tw = word("twice", 67);
      return [{ i: 0, o: YOU, at: L(27, SIT), mode: "jolt_bed", expr: [[0, "confused"], [tw - LEAD, "jawdrop"]], lookY: () => 0.35,
        look: (t) => (t > tw - 0.75 && t < tw - 0.15 ? 0.6 : -0.65), head: (t) => (t > tw - 0.75 && t < tw - 0.15 ? -6 : 4) }]; }
    case 28: return [{ i: 0, o: YOU, at: L(28, SIT), mode: "jolt_bed", expr: [[0, "squint"], [word("awake") - LEAD, "sly"]], head: () => 5 }];
    default: return [];
  }
};
export const acts = ACTS;

// ---------------- fx drawings ----------------
const rad = (d: number) => (d * Math.PI) / 180;
const text = (p: Pen, s: string, x: number, y: number, px: number, col: string, stroke = INK) => {
  const g = p.g; g.save(); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${px}px "Arial Black", Arial, sans-serif`;
  g.lineJoin = "round"; g.lineWidth = px * 0.16; g.strokeStyle = stroke; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); g.restore();
};
const rrect = (p: Pen, x0: number, y0: number, x1: number, y1: number, r: number, fill: string, ol = 8) =>
  p.poly([[x0 + r, y0], [x1 - r, y0], [x1, y0 + r], [x1, y1 - r], [x1 - r, y1], [x0 + r, y1], [x0, y1 - r], [x0, y0 + r]], fill, ol);
/** a red twin-bell alarm clock, 300 x 320, hands at 3:07 */
const alarm = (p: Pen) => {
  for (const s of [-1, 1]) { p.stroke([[150 + s * 70, 300], [150 + s * 95, 316]], 12, INK); p.ell(150 + s * 82, 62, 40, 30, "#ffd23f", 7, 180, 360, s * 30); }
  p.stroke([[150, 30], [150, 48]], 10, INK); p.ell(150, 24, 14, 10, "#ffd23f", 5);
  p.ell(150, 180, 122, 122, "#e0463c", 9); p.ell(150, 180, 96, 96, "#fbf6ea", 6);
  for (let i = 0; i < 12; i++) { const a = rad(i * 30 - 90); p.stroke([[150 + 78 * Math.cos(a), 180 + 78 * Math.sin(a)], [150 + 88 * Math.cos(a), 180 + 88 * Math.sin(a)]], i % 3 ? 4 : 8, INK); }
  const ah = rad((3 + 7 / 60) * 30 - 90), am = rad(7 * 6 - 90);
  p.stroke([[150, 180], [150 + 48 * Math.cos(ah), 180 + 48 * Math.sin(ah)]], 12, INK);
  p.stroke([[150, 180], [150 + 74 * Math.cos(am), 180 + 74 * Math.sin(am)]], 7, INK);
  p.dot(150, 180, 9, "#e0463c");
};
/** a bedside digital clock, 600 x 300, red LED digits; blank = the colon blink */
const digital = (p: Pen, s: string) => {
  p.poly([[40, 270], [560, 270], [530, 296], [70, 296]], "#2b2f3a", 6);
  rrect(p, 20, 20, 580, 272, 40, "#3a3f52", 9); rrect(p, 56, 56, 544, 236, 22, "#0d0f17", 5);
  text(p, s, 300, 150, 150, "#ff4a3d", "#0d0f17");
};
/** speed dial, 420 x 320: needle in the red, 200 KM/H */
const speedo = (p: Pen, wob: number) => {
  rrect(p, 10, 10, 410, 310, 40, "#fbf6ea", 9);
  p.ell(210, 210, 160, 160, "#2b2f3a", 7, 180, 360); p.ell(210, 210, 140, 140, "#fbf6ea", 0, 180, 360);
  p.ell(210, 210, 140, 140, "#ff5a4f", 0, 300, 360); p.ell(210, 210, 112, 112, "#fbf6ea", 0, 290, 370);
  for (let i = 0; i <= 8; i++) { const a = rad(180 + i * 22.5); p.stroke([[210 + 118 * Math.cos(a), 210 + 118 * Math.sin(a)], [210 + 138 * Math.cos(a), 210 + 138 * Math.sin(a)]], 6, INK); }
  const a = rad(338 + wob); p.stroke([[210, 210], [210 + 128 * Math.cos(a), 210 + 128 * Math.sin(a)]], 10, "#c63939"); p.dot(210, 210, 14, INK);
  text(p, "200", 210, 186, 64, "#ff5a4f"); text(p, "KM/H", 210, 270, 44, "#2b2f3a", "#fbf6ea");
};
/** a cartoon heart, 200 x 200, k = beat swell */
const heart = (p: Pen, k: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2, x = 16 * Math.sin(a) ** 3, y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); pts.push([100 + x * 5 * k, 96 + y * 5 * k]); }
  p.poly(pts, "#ff4a5c", 7); p.ell(72, 70, 14, 9, "rgba(255,255,255,.7)", 0, 0, 360, -30);
};
/** sleepy Z z z, 240 x 240 */
const zz = (p: Pen, u: number) => { [[70, 190, 70], [140, 120, 54], [195, 60, 40]].forEach(([x, y, s], i) => text(p, "Z", x + 6 * Math.sin(u * 6 + i), y - 8 * u, s, "#dfe9f7", "#1d2a55")); };
/** the door between worlds seen from above: a door frame floating in the sky, warm bedroom light (and the bed) through it;
 *  shut 0..1 swings the leaf closed. 420 x 720 */
const door = (p: Pen, shut: number) => {
  rrect(p, 10, 10, 410, 710, 10, "#8a5a3a", 10);
  p.poly([[50, 50], [370, 50], [370, 670], [50, 670]], "#ffd98a", 6);
  p.poly([[80, 70], [340, 70], [340, 330], [80, 330]], "#3f6c8c", 5); p.poly([[100, 80], [320, 80], [320, 150], [100, 150]], "#f3e7ce", 4); // the bed + pillow
  p.poly([[60, 470], [360, 470], [360, 660], [60, 660]], "#7a4a8c", 0); // rug
  if (shut <= 0) p.poly([[50, 50], [50 - 34, 64], [50 - 34, 656], [50, 670]], "#c98a54", 6);
  else p.poly([[50, 50], [50 + 320 * shut, 50 + 20 * (1 - shut)], [50 + 320 * shut, 670 - 20 * (1 - shut)], [50, 670]], "#c98a54", 7);
  if (shut > 0.95) p.ell(330, 360, 16, 16, "#ffd23f", 5);
};
/** thought bubble with a watch and "x2", 520 x 380 */
const think = (p: Pen) => {
  p.ell(260, 150, 245, 140, "#ffffff", 8); p.ell(120, 316, 30, 22, "#ffffff", 6); p.ell(70, 350, 15, 12, "#ffffff", 5);
  p.poly([[130, 40], [190, 40], [190, 260], [130, 260]], "#3b3f52", 6);
  p.ell(160, 150, 70, 70, "#dfe9f7", 8); p.ell(160, 150, 54, 54, "#0d0f17", 4); text(p, "?:??", 160, 152, 34, "#5ce1ff", "#0d0f17");
  text(p, "READ", 360, 110, 64, "#1d2a55", "#ffffff"); text(p, "TWICE", 360, 190, 64, "#ff5a4f", "#ffffff");
};
/** the watch face, close: 800 x 900, strap top to bottom, a digital face; s = "" for the blink */
const watch = (p: Pen, s: string) => {
  p.poly([[250, 0], [550, 0], [560, 900], [240, 900]], "#3b3f52", 8);
  for (let y = 60; y < 900; y += 110) p.stroke([[262, y], [538, y]], 5, "#2b2f3a");
  p.ell(400, 450, 330, 330, "#a9b5bb", 10); p.ell(400, 450, 290, 290, "#dfe9f7", 6); rrect(p, 150, 330, 650, 570, 50, "#0d0f17", 6);
  if (s) text(p, s, 400, 455, 190, "#5ce1ff", "#0d0f17");
  p.ell(260, 250, 60, 26, "rgba(255,255,255,.55)", 0, 0, 360, -35);
};
/** a duvet seen from above, 400 x 520: folded white hem at the top (the chest), blue cover, quilting lines */
const blanket = (p: Pen) => {
  rrect(p, 8, 8, 392, 512, 40, "#3f6c8c", 8);
  for (const y of [190, 300, 410]) p.stroke([[40, y], [360, y + 6]], 4, "#335a76");
  rrect(p, 8, 8, 392, 92, 30, "#f3e7ce", 7);
};
/** the meadow under the landing, seen from above, 1024 x 1024: grass blades in two greens + daisies, soft round edge into
 *  the field (the bare patch read as a flat ochre floor, so the lying pose read as standing) */
const meadow = (p: Pen) => {
  const g = p.g, R = (i: number) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  const gr = g.createRadialGradient(512, 512, 300, 512, 512, 512); gr.addColorStop(0, "#8fae4c"); gr.addColorStop(1, "rgba(143,174,76,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  g.lineCap = "round";
  for (let i = 0; i < 900; i++) { const a = R(i) * Math.PI * 2, r = 470 * Math.sqrt(R(i + 5000)), x = 512 + r * Math.cos(a), y = 512 + r * Math.sin(a), l = 22 + 26 * R(i + 9000), b = (R(i + 7000) - 0.5) * 0.9;
    g.strokeStyle = i % 3 ? "#6f9a3c" : "#b7c95e"; g.lineWidth = 5; g.globalAlpha = Math.min(1, (512 - r) / 80);
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l * 0.2 * Math.sin(b), y - l * 0.6, x + l * Math.sin(b), y - l); g.stroke(); }
  g.globalAlpha = 1;
  for (let i = 0; i < 26; i++) { const a = R(i + 300) * Math.PI * 2, r = 120 + 330 * Math.sqrt(R(i + 400)), x = 512 + r * Math.cos(a), y = 512 + r * Math.sin(a), k = 9 + 5 * R(i + 500);
    for (let j = 0; j < 5; j++) { const b = (j * Math.PI * 2) / 5 + i; p.ell(x + 1.3 * k * Math.cos(b), y + 1.3 * k * Math.sin(b), k, k, i % 4 === 1 ? "#e8705e" : "#f4f7fb", 2.5); }
    p.ell(x, y, 0.8 * k, 0.8 * k, "#f5c733", 2.5); }
};
/** one loose digit, 200 x 220 */
const digit = (p: Pen, s: string) => text(p, s, 100, 115, 190, "#5ce1ff", "#0b1a33");
/** a loose V of gulls, 400 x 160, flap 0..1 */
const gulls = (p: Pen, flap: number) => {
  [[60, 90], [150, 50], [230, 100], [320, 60]].forEach(([x, y], i) => { const k = 20 + 14 * Math.sin(flap * Math.PI * 2 + i);
    p.stroke([[x - 34, y - k * 0.6], [x - 12, y], [x, y - 4], [x + 12, y], [x + 34, y - k * 0.6]], 7, INK); });
};

const xyz = ([x, y, z]: V3) => ({ x, y, z });
/** a card pinned to the screen of shot `id` at time t: centre (sx, sy) in 1080 x 1920 px, width wpx, d m from the lens */
const scr = (id: number, t: number, sx: number, sy: number, wpx: number, d: number) => {
  const c = camAt(id, Math.round(t * 30)), f = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]], n = Math.hypot(f[0], f[1], f[2]);
  f[0] /= n; f[1] /= n; f[2] /= n;
  const rl = Math.hypot(f[2], f[0]), r = [-f[2] / rl, 0, f[0] / rl], u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const px = (2 * d * Math.tan((c.fov * Math.PI) / 360)) / 1920, ox = (sx - 540) * px, oy = (960 - sy) * px;
  return { x: c.pos[0] + f[0] * d + r[0] * ox + u[0] * oy, y: c.pos[1] + f[1] * d + r[1] * ox + u[1] * oy, z: c.pos[2] + f[2] * d + r[2] * ox + u[2] * oy, w: wpx * px };
};
/** one big gull silhouette close to the lens, 300 x 160, flap 0..1 */
const gull = (p: Pen, flap: number) => {
  const k = 50 * Math.sin(flap * Math.PI * 2);
  p.poly([[20, 80 - k], [110, 70], [150, 84], [190, 70], [280, 80 - k], [200, 92], [150, 104], [100, 92]], "#1d2244", 5);
};
/** a real near object per sky shot: a gull past the lens (2026-11-07 rule change: sky shots are exempt from the near-dark
 *  plane, the painted navy cloud blobs read as crude; depth there = hazy ground + white cloud layers) */
const NEAR: Record<number, [number, number, number, number][]> = { // sx, sy, width px, metres from the lens
  10: [[820, 420, 420, 2.0]], 18: [[260, 520, 460, 2.4]], 20: [[170, 360, 380, 1.2]],
};
export const fx = (id: number, t: number, out: Stage) => {
  for (const [sx, sy, wpx, d] of NEAR[id] ?? []) { const [a0] = sec(id), u = q((t * 2.2) % 1, 10), c = scr(id, t, sx - (t - a0) * 140, sy, wpx, d);
    out.fx.push({ key: `gull|${u}`, cw: 300, ch: 160, draw: (p) => gull(p, u), ...c, h: c.w * 160 / 300 }); }
  const burst = (key: string, t0: number, dur: number, draw: (p: Pen, u: number) => void, cw: number, ch: number, at: V3, w: number, h: number, rot = 0) => {
    const u = q(clamp01((t - t0) / dur), 15);
    if (t >= t0 && u < 1) out.fx.push({ key: `${key}|${u}`, cw, ch, draw: (p) => draw(p, u), ...xyz(at), w, h, rot });
  };
  const [a] = sec(id);
  /** world point near the falling you: dx screen-right, dz screen-up (-z), dy toward the lens (top-down fall shots) */
  const nearFall = (dx: number, dz: number, dy = 0): V3 => { const p = fallPos(id, t, 4); return [p[0] + dx, p[1] + dy, p[2] - dz]; };
  if (id === 1) { const r = q(t * 160 % 360, 1); // the alarm clock tumbling beside you, and a flock far below
    out.fx.push({ key: "alarm", cw: 300, ch: 320, draw: alarm, ...xyz(nearFall(0.95, 0.7 - 0.25 * t, -0.6)), w: 0.55, h: 0.59, rot: rad(r) }); }
  if (id === 4) out.fx.push({ key: "alarm4", cw: 300, ch: 320, draw: alarm, ...xyz(nearFall(-0.85, -0.35, -1.2)), w: 0.5, h: 0.53, rot: rad(q(t * 120 % 360, 1)) });
  if (id === 5) { const c = L(5, [0, 150.9, 0]), u = q((t * 2.2) % 1, 12), w = q(3 * Math.sin(t * 20), 2);
    for (const [dx, dz, s] of [[-0.95, 0.3, 1], [0.95, -0.3, 0.8], [-0.7, -0.6, 0.7], [0.8, 0.6, 0.9]] as [number, number, number][])
      out.fx.push({ key: `spd|${u}`, cw: 500, ch: 300, draw: (p) => fxSpeed(p, u), x: c[0] + dx, y: c[1] - 1.2 + 0.4 * s, z: c[2] + dz, w: 0.9 * s, h: 0.54 * s, rot: rad(-90) });
    const k = ease((t - word("two") + 0.15) / 0.25);
    if (k > 0) out.fx.push({ key: `speedo|${w}`, cw: 420, ch: 320, draw: (p) => speedo(p, w), x: c[0] + 0.95, y: c[1] + 0.8, z: c[2] + 0.4, w: 0.72 * k, h: 0.55 * k }); }
  if (id === 6) { const u = 0.3; // frozen drawing: a redrawn line every frame boiled in temporal_qa (15.6 k/Mpx)
    for (const [dx, dz] of [[-0.9, 0.9], [0.9, 0.5], [-0.8, -1.0], [0.85, -1.1]] as [number, number][])
      out.fx.push({ key: `spd|${u}`, cw: 500, ch: 300, draw: (p) => fxSpeed(p, u), ...xyz(nearFall(dx, dz, -0.3)), w: 0.8, h: 0.48, rot: rad(dx < 0 ? 90 : -90) });
    burst("shock6", word("jerks") - 0.35, 0.5, fxShock, 400, 400, nearFall(0, 0.85, 0.2), 2.4, 2.4); }
  if (id === 7) { const c = L(7, ON_BED); burst("shock7", a, 0.45, fxShock, 400, 400, [c[0], c[1] + 1.75, c[2] + 0.1], 1.4, 1.4);
    const h0 = word("heart");
    if (t > h0 - 0.1) { const k = q(1 + 0.22 * Math.max(0, Math.sin((t - h0) * 13)), 8); out.fx.push({ key: `heart|${k}`, cw: 200, ch: 200, draw: (p) => heart(p, k), x: c[0] + 0.32, y: c[1] + 1.12, z: c[2] + 0.25, w: 0.42, h: 0.42 }); } }
  if (id === 13) { const c = L(13, BED_FEET), u = q((t * 0.6) % 1, 20); // the blanket: chest to past the feet, over the card
    out.fx.push({ key: "blanket", cw: 400, ch: 520, draw: blanket, x: c[0], y: c[1] + 0.17, z: c[2] - 0.45, w: 0.98, h: 1.28, flat: true });
    if (t > word("drift") - 0.1) out.fx.push({ key: `zz|${u}`, cw: 240, ch: 240, draw: (p) => zz(p, u), x: c[0] + 0.3, y: c[1] + 0.6, z: c[2] - 1.85, w: 0.5, h: 0.5 }); }
  if (id === 15) { const c = L(15, [40, 13.7, 30]); burst("shock15", word("twitch") - 0.05, 0.5, fxShock, 400, 400, [c[0], c[1] + 1.2, c[2] + 0.2], 2.2, 2.2); }
  if (id === 17) { const sl = word("slams"), shut = q(ease((t - sl + 0.45) / 0.35), 12), d = L(17, [0, 146.6, -0.4]);
    out.fx.push({ key: `door|${shut}`, cw: 420, ch: 720, draw: (p) => door(p, shut), ...xyz(d), w: 2.2, h: 3.8, flat: true });
    burst("shock17", sl - 0.12, 0.45, fxShock, 400, 400, L(17, [0, 147.2, -0.4]), 2.6, 2.6); }
  if (id === 10 || id === 18) { const c = L(id, [id === 10 ? -3 : -6, id === 10 ? 57 : 58, -14]), u = q((t * 1.6) % 1, 10);
    out.fx.push({ key: `gulls|${u}`, cw: 400, ch: 160, draw: (p) => gulls(p, u), x: c[0] + 1.5 * (t - a), y: c[1], z: c[2], w: 3.2, h: 1.28 }); }
  if (id === 19) { const k = q(ease((t - word("trick") + 0.3) / 0.3), 10);
    if (k > 0) out.fx.push({ key: `think|${k}`, cw: 520, ch: 380, draw: think, ...xyz(nearFall(-0.1, 1.0, 0.6)), w: 1.3 * k, h: 0.95 * k }); }
  if (id === 21) { const n = word("nine-forty"), s = t < n - 0.25 ? "3:07" : t < n - 0.05 ? "" : "9:40", c = scr(21, t, 540, 800, 860, 2.3); // on the focus plane (just before you): the watch is the subject
    out.fx.push({ key: `watch|${s}`, cw: 800, ch: 900, draw: (p) => watch(p, s), ...c, h: c.w * 900 / 800 }); }
  if (id === 22) { const c = L(22, [0, 100.9, 0]), d0 = word("numbers");
    ["3", "0", "7", "9", "4", "0", ":"].forEach((s, i) => { const k = ease((t - d0 + 1.2 - i * 0.12) / 0.4); if (k <= 0) return;
      const ang = i * 0.9 + (t - 51.65) * (0.5 + 0.08 * i), r = 0.9 + 0.12 * (i % 3);
      out.fx.push({ key: `dig|${s}`, cw: 200, ch: 220, draw: (p) => digit(p, s), x: c[0] + r * Math.cos(ang), y: c[1] + 0.35 * Math.sin(ang * 1.3) + 0.2, z: c[2] + 0.35 * Math.sin(ang), w: 0.3 * k, h: 0.33 * k, rot: rad(q(25 * Math.sin(t * 2 + i), 1)) }); }); }
  if (id === 25) { const m = L(25, [LAND[0] - 0.33, 0.215, LAND[2] - 0.67]); out.fx.push({ key: "meadow", cw: 1024, ch: 1024, draw: meadow, ...xyz(m), w: 6, h: 6, flat: true }); }
  if (id === 25) { const c = L(25, [20, 0, -0.9]); burst("puff25", 61.3, 0.6, (p, u) => fxPuff(p, u), 300, 300, [c[0], 0.08, c[2] + 0.6], 1.6, 1.6); }
  if (id === 27 || id === 28) { const c = L(id, [0.33, 0.62, -2.95]); // the real bedside clock: an LED face on the nightstand
    out.fx.push({ key: "led", cw: 600, ch: 300, draw: (p) => digital(p, "3:07"), ...xyz(c), w: 0.34, h: 0.17, face: [0, 0, 1] }); }
  if (id === 27) { const c = scr(27, t, 300, 1180, 420, 1.0); // the clock again, big in the foreground
    out.fx.push({ key: "led_fg", cw: 600, ch: 300, draw: (p) => digital(p, "3:07"), ...c, h: c.w / 2 }); }
};

export const CAST: [string, Outfit, Partial<FrontOpts>][] = [["You", YOU, { expr: "smile" }]];
