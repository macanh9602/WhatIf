// What If ep03 acting: you, the teen, grandma and the runner, timed to the voice words, plus the shot fx (the level-up
// menu, a level / years HUD over heads, level-up bursts, language bubbles, grandma's hourglass, the medal, a dog).
import { Pen, Outfit, FrontOpts, INK, POSES, fxBurst, fxStars, fxExclaim } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, kf, q } from "../../act";
import { YOU, TEEN, GRANDMA, RUNNER, CHANNEL_CAST } from "../people";
import { SHOTS } from "./story";
import words from "./words";

const set = (id: number) => SETS[SHOTS[id - 1].set];
const spot = (id: number, name: string): V3 => set(id).spots[name] ?? set(id).origin;
const L = (id: number, [x, y, z]: V3): V3 => { const o = set(id).origin; return [o[0] + x, o[1] + y, o[2] + z]; };
/** start of the first spoken `text` at or after `from` seconds */
const word = (text: string, from = 0) => {
  const hit = words.find((w) => w.start >= from - 0.01 && w.text.replace(/[^A-Za-z']/g, "").toLowerCase() === text.toLowerCase());
  if (!hit) throw new Error(`Missing cast beat word: ${text} after ${from}`);
  return hit.start;
};
export const wearAt = (_t: number) => 0;

type Pose = FrontOpts["reach"];
const SIDEWALK: V3 = [-1.0, 0, 0.6]; // yard: in front of the picket fence (behind it the fence cut the body)
const TAP: Pose = [undefined, { ex: 26, ey: 0.05, hx: 50, hy: -0.25, front: true }]; // finger out to the menu on screen right
const HOLD_UP: Pose = [undefined, { ex: 24, ey: 0.15, hx: 18, hy: -0.05, front: true }]; // the medal held at the chest

const ACTS = (id: number): Act[] => {
  switch (id) {
    case 1: return [{ i: 3, o: TEEN, at: L(1, SIDEWALK), mode: "stand", expr: [[0, "smug"], [word("richest") - 0.2, "proud_chin"]], reach: () => POSES.hands_on_hips }];
    case 2: return [{ i: 0, o: YOU, at: spot(2, "you"), mode: "stand", expr: [[0, "tired"], [word("menu") - 0.2, "curious"], [word("minus") - 0.2, "concentrate"]], look: 0.6, lookY: () => -0.2 }];
    case 4: return [{ i: 0, o: YOU, at: spot(4, "you"), mode: "stand", expr: [[0, "smirk_wink"], [word("take") - 0.1, "excited"], [word("another") - 0.1, "grin"]], reach: () => TAP, look: 0.7 }];
    case 5: return [{ i: 0, o: YOU, at: L(5, [-5.2, 0, 0.6]), mode: "stroll", phase: (t) => t * 2.6, expr: [[0, "confident"], [word("shorter") - 0.3, "shock"]], face: 1, look: 1,
      moveTo: [[21.8, [0, 0, 0]], [27.0, [2.6, 0, 0]]], tilt: () => 6 }];
    case 7: return [{ i: 3, o: TEEN, at: L(7, SIDEWALK), mode: "stand", expr: [[0, "confident"], [word("superheroes") - 0.2, "excited"]],
      reach: (t) => (t < word("superheroes") - 0.2 ? POSES.hands_on_hips : POSES.fist_pump) }];
    case 8: return [{ i: 2, o: GRANDMA, at: L(8, [0.2, 0, -0.75]), mode: "stand", expr: [[0, "neutral"], [word("guards") - 0.2, "sly"]], reach: () => POSES.arms_crossed,
      lookY: () => 0.3, head: kf([[39.9, 0], [word("guards"), 6]], 0.3) }];
    case 9: return [{ i: 4, o: RUNNER, at: L(9, SIDEWALK), mode: "stand", expr: [[0, "proud"], [word("retirement") - 0.2, "shook"]], reach: () => HOLD_UP }];
    case 12: return [{ i: 0, o: YOU, at: spot(12, "you"), mode: "stand", expr: [[0, "curious"], [word("game") - 0.2, "amused"]], look: (t) => (t < 73 ? -0.6 : 0.6) }];
    case 14: return [{ i: 0, o: YOU, at: spot(14, "you"), mode: "stand", expr: [[0, "sly"], [word("buy") - 0.2, "smirk_wink"]], reach: () => TAP, look: 0 }];
    default: return [];
  }
};
export const acts = ACTS;

// ---------------- fx drawings ----------------
const pop = (t: number, t0: number) => clamp01((t - t0) / 0.12) * (1 + 0.15 * Math.sin(clamp01((t - t0) / 0.3) * Math.PI));
const text = (p: Pen, s: string, x: number, y: number, px: number, col: string, stroke = INK) => {
  const g = p.g; g.save(); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${px}px "Arial Black", Arial, sans-serif`;
  g.lineJoin = "round"; g.lineWidth = px * 0.16; g.strokeStyle = stroke; g.strokeText(s, x, y); g.fillStyle = col; g.fillText(s, x, y); g.restore();
};
const panel = (p: Pen, x0: number, y0: number, x1: number, y1: number, fill: string, ol = 8) => {
  const r = 26; p.poly([[x0 + r, y0], [x1 - r, y0], [x1, y0 + r], [x1, y1 - r], [x1 - r, y1], [x0 + r, y1], [x0, y1 - r], [x0, y0 + r]], fill, ol);
};
/** game HUD over a head, 480 x 180: level badge + years-left bar */
const hud = (p: Pen, lv: number, years: number, max = 60) => {
  panel(p, 10, 20, 470, 170, "rgba(22,50,92,.92)");
  p.ell(85, 95, 62, 62, "#ffd23f", 7); text(p, "LV", 85, 72, 30, "#16325c", "#ffd23f"); text(p, String(lv), 85, 112, 44, "#16325c", "#ffd23f");
  text(p, `${years} YEARS LEFT`, 300, 62, 34, "#ffffff");
  panel(p, 165, 95, 445, 140, "#2b2f3a", 5);
  const w = 270 * clamp01(years / max); if (w > 4) panel(p, 170, 100, 170 + Math.max(w, 30), 135, years < 10 ? "#ff3b30" : "#ff6b8a", 0);
};
/** the glowing level-up menu, 460 x 320; hi = 0 none, 1 "+1 LEVEL", 2 "-1 YEAR" */
const menu = (p: Pen, hi: number) => {
  const g = p.g; g.save(); g.shadowColor = "#5ce1ff"; g.shadowBlur = 40; panel(p, 14, 14, 446, 306, "rgba(22,50,92,.95)", 8); g.restore();
  text(p, "LEVEL UP?", 230, 70, 46, "#5ce1ff");
  panel(p, 50, 115, 410, 195, hi === 1 ? "#2ee86a" : "#1f8a4c", 6); text(p, "+1 LEVEL", 230, 157, 44, "#ffffff");
  panel(p, 50, 215, 410, 285, hi === 2 ? "#ff3b30" : "#9a2b2b", 6); text(p, "-1 YEAR", 230, 252, 40, "#ffffff");
};
const levelUp = (p: Pen, u: number) => { fxBurst(p, u, "#ffd23f", 12, 60, 240); if (u < 0.8) text(p, "LEVEL UP!", 250, 250, 70, "#ffd23f"); };
const bubble = (p: Pen, s: string) => {
  p.ell(200, 110, 185, 90, "#ffffff", 7); p.poly([[120, 180], [90, 240], [170, 190]], "#ffffff", 7); p.ell(200, 110, 178, 83, "#ffffff", 0);
  text(p, s, 200, 112, 58, "#16325c", "#ffffff");
};
/** grandma's five years in an hourglass, 300 x 420 */
const hourglass = (p: Pen) => {
  p.poly([[30, 20], [270, 20], [270, 50], [30, 50]], "#8a5a3a", 6); p.poly([[30, 370], [270, 370], [270, 400], [30, 400]], "#8a5a3a", 6);
  p.poly([[55, 50], [245, 50], [165, 210], [245, 370], [55, 370], [135, 210]], "rgba(220,240,255,.85)", 7);
  p.poly([[95, 300], [205, 300], [235, 365], [65, 365]], "#ffd23f", 0); p.poly([[130, 120], [170, 120], [152, 160], [148, 160]], "#ffd23f", 0);
  p.stroke([[150, 160], [150, 300]], 4, "#ffd23f"); text(p, "5", 150, 330, 44, "#16325c", "#ffd23f");
};
const medal = (p: Pen) => { p.poly([[70, 0], [130, 0], [115, 120], [85, 120]], "#2f5fff", 5); p.ell(100, 165, 62, 62, "#ffd23f", 7); text(p, "1", 100, 168, 64, "#c98a00", "#ffd23f"); };
const retired = (p: Pen) => { panel(p, 10, 10, 490, 170, "#f4f1ea", 8); text(p, "RETIRED", 250, 65, 56, "#c63939", "#f4f1ea"); text(p, "AGE 41", 250, 128, 46, "#16325c", "#f4f1ea"); };
/** a trotting dog, side view, 500 x 300 (legs swing with k) */
const dog = (p: Pen, k: number) => {
  for (const [x, ph] of [[150, 0], [190, 0.5], [330, 0.5], [370, 0]] as const) { const s = Math.sin((k + ph) * Math.PI * 2) * 18; p.stroke([[x, 200], [x + s, 280]], 14, "#7a4a2a"); }
  p.ell(260, 170, 150, 62, "#a8703f", 8); p.ell(420, 110, 62, 52, "#a8703f", 8); p.ell(468, 122, 26, 18, "#7a4a2a", 5);
  p.poly([[395, 70], [380, 20], [425, 62]], "#7a4a2a", 6); p.ell(430, 98, 8, 8, INK, 0); p.stroke([[110, 150], [60, 110 + 10 * Math.sin(k * 12)]], 12, "#a8703f");
};

export const fx = (id: number, t: number, out: Stage) => {
  const burst = (key: string, t0: number, dur: number, draw: (p: Pen, u: number) => void, cw: number, ch: number, x: number, y: number, z: number, w: number, h: number) => {
    const u = q(clamp01((t - t0) / dur), 15);
    if (t >= t0 && u < 1) out.fx.push({ key: `${key}|${u}`, cw, ch, draw: (p) => draw(p, u), x, y, z, w, h });
  };
  const hudAt = (s: V3, y: number, lv: number, years: number, max = 60) =>
    out.fx.push({ key: `hud|${lv}|${years}|${max}`, cw: 480, ch: 180, draw: (p) => hud(p, lv, years, max), x: s[0], y, z: s[2] + 0.1, w: 0.72, h: 0.27 });
  if (id === 1) { const s = L(1, SIDEWALK); hudAt(s, 1.72, 1, 60); burst("stars", word("richest") - 0.1, 1.4, (p, u) => fxStars(p, u), 400, 400, s[0] + 0.35, 1.45, s[2] + 0.1, 0.7, 0.7); }
  if (id === 2 && t > word("menu") - LEAD) { const s = spot(2, "you"), k = q(pop(t, word("menu") - LEAD), 10), hi = t < word("plus") ? 0 : t < word("minus") ? 1 : 2;
    out.fx.push({ key: `menu|${k}|${hi}`, cw: 460, ch: 320, draw: (p) => menu(p, hi), x: s[0] + 0.62, y: 1.55, z: s[2] + 0.3, w: 0.62 * k, h: 0.43 * k }); }
  if (id === 4) { const s = spot(4, "you"), lv = t < word("take", 19) ? 1 : t < word("another", 19) ? 2 : 3;
    out.fx.push({ key: `menu4|${t < word("take", 19) ? 1 : 0}`, cw: 460, ch: 320, draw: (p) => menu(p, t < word("take", 19) ? 1 : 0), x: s[0] + 0.4, y: 1.45, z: s[2] + 0.35, w: 0.4, h: 0.28 });
    hudAt(s, 1.98, lv, 61 - lv);
    for (const wd of ["take", "another"]) burst(`lvl${wd}`, word(wd, 19) - 0.05, 0.8, levelUp, 500, 500, s[0] - 0.3, 1.85, s[2] + 0.2, 0.55, 0.55); }
  if (id === 5) { const k = clamp01((t - 21.8) / 5.2), s = L(5, [-5.2 + 2.6 * k, 0, 0.6]), short = t > word("shorter") - LEAD;
    hudAt(s, 1.98, short ? 10 : 3 + Math.round(6 * k), short ? 50 : 57 - Math.round(6 * k));
    const langs: [string, string][] = [["speak", "HOLA!"], ["three", "CIAO!"], ["languages", "BONJOUR!"]];
    langs.forEach(([wd, l], i) => { const t0 = word(wd, 21) - LEAD; if (t > t0 && t < 27.4) { const b = q(pop(t, t0), 10); out.fx.push({ key: `bub|${i}|${b}`, cw: 400, ch: 250, draw: (p) => bubble(p, l), x: s[0] + 0.45 + 0.1 * i, y: 1.55 + 0.32 * i, z: s[2] + 0.1, w: 0.5 * b, h: 0.31 * b }); } }); }
  if (id === 7) { const s = L(7, SIDEWALK); hudAt(s, 1.72, t < word("superheroes") ? 1 : 60, t < word("superheroes") ? 60 : 1);
    burst("aura", word("superheroes") - 0.1, 1.2, (p, u) => fxBurst(p, u, "#ffd23f", 14, 80, 250), 500, 500, s[0], 0.85, s[2] - 0.05, 1.6, 1.6);
    burst("stars7", word("overnight") - 0.1, 1.2, (p, u) => fxStars(p, u), 400, 400, s[0], 1.5, s[2] + 0.1, 0.8, 0.8); }
  if (id === 8) { const s = L(8, [0.2, 0, -0.75]); hudAt(s, 1.98, 1, 5, 60);
    out.fx.push({ key: "hourglass", cw: 300, ch: 420, draw: hourglass, x: s[0] + 0.05, y: 0.76 + 0.2, z: 0.15, w: 0.28, h: 0.39 }); }
  if (id === 9) { const s = L(9, SIDEWALK);
    if (t > word("medal") - LEAD) out.fx.push({ key: "medal", cw: 200, ch: 240, draw: medal, x: s[0] + 0.02, y: 1.02, z: s[2] + 0.12, w: 0.16, h: 0.19 });
    if (t > word("retirement") - LEAD) { const k = q(pop(t, word("retirement") - LEAD), 10); out.fx.push({ key: `ret|${k}`, cw: 500, ch: 180, draw: retired, x: s[0] + 0.62, y: 1.85, z: s[2] + 0.2, w: 0.62 * k, h: 0.22 * k }); }
    burst("ex9", word("retirement") - 0.05, 0.8, (p, u) => fxExclaim(p, u), 200, 260, s[0] - 0.3, 1.95, s[2], 0.2, 0.26); }
  if (id === 12) { const k = clamp01((t - 71.4) / 3.8), x = 2.4 - 4.8 * k, o = set(12).origin;
    out.fx.push({ key: `dog|${Math.round(t * 8) % 8}`, cw: 500, ch: 300, draw: (p) => { p.g.translate(500, 0); p.g.scale(-1, 1); dog(p, (t * 2) % 1); }, x: o[0] + x, y: 0.32, z: 0.9, w: 0.95, h: 0.57 }); }
  if (id === 14) { const s = spot(14, "you"); out.fx.push({ key: "menu14", cw: 460, ch: 320, draw: (p) => menu(p, 0), x: s[0] + 0.4, y: 1.45, z: s[2] + 0.35, w: 0.4, h: 0.28 }); }
};
export const CAST: [string, Outfit, Partial<FrontOpts>][] = CHANNEL_CAST.map(([n, o]) => [n, o, { expr: "smile" }]);
