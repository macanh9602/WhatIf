// What If ep16 acting. Lead: the channel default (one curl, red varsity jacket, white tee, jeans). The running prop is ONE tip
// screen design (light face, three blue buttons 18% 20% 25%, a small grey "No tip"), drawn as an fx card on every slab of the set.
// No brands or logos anywhere: plain screens, a plain red car, a hand-written sign.
import { Pen, Outfit, FrontOpts, INK, POSES, SKINS } from "../../toon";
import type { Prop } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, q } from "../../act";
import { YOU, NEIGHBOR, TEEN, GRANDMA, RUNNER, BILLIONAIRE } from "../people";
import { SHOTS, BEATS, K, PK, BS, A, E, cartScreen, benchTip, stepZ, rampY, fold, ez } from "./story";
import words from "./words";

const O = SETS.tips.origin;
const L = ([x, y, z]: V3): V3 => [O[0] + x, y, z];
const X = (x: number) => O[0] + x;
export const word = (text: string, from = 0) => {
  const hit = words.find((w) => w.start >= from - 0.01 && w.text.replace(/[^A-Za-z0-9'-]/g, "").toLowerCase() === text.toLowerCase());
  if (!hit) throw new Error(`Missing cast beat word: ${text} after ${from}`);
  return hit.start;
};
export const wearAt = (_t: number) => 0;

// ---------------- cast ----------------
const TEAL = "#3d8a8f";
const YOU_AP: Outfit = { ...YOU, bottom: "overalls", pants: TEAL }; // the cart apron (teal bib) over the tee, jacket on
const OWNER: Outfit = { jacket: "#f4f1ea", pants: TEAL, boots: "#3a2f3f", hat: null, build: "stout", top: "tee", bottom: "overalls", shoe: "boot",
  style: "smooth", hair: "#3a2a20", moustache: "#3a2a20", skin: SKINS[2] };
export const CAST: [string, Outfit, Partial<FrontOpts>][] = [["You", YOU, { expr: "smile" }], ["You, apron", YOU_AP, { expr: "smile" }], ["Cart owner", OWNER, { expr: "smile" }], ["Neighbor", NEIGHBOR, { expr: "deadpan" }], ["Teen", TEEN, { expr: "nervous" }]];

const sec = (id: number) => [SHOTS[id - 1].a / 30, SHOTS[id - 1].b / 30];
const you = (at: V3, expr: Act["expr"], more: Partial<Act> = {}): Act => ({ i: 0, o: YOU, at: L(at), mode: "stand", expr, ...more });
const who = (i: number, o: Outfit, at: V3, expr: Act["expr"], more: Partial<Act> = {}): Act => ({ i, o, at: L(at), mode: "stand", expr, ...more });
/** the left arm (screen right) out to a screen at the card's right; k 0..1 = how far */
const TAP = (k = 1, hy = -0.05): FrontOpts["reach"] => [undefined, { ex: 18 + 10 * k, ey: 0.15 - 0.1 * k, hx: 18 + 30 * k, hy: 0.2 + (hy - 0.2) * k, front: true }];
const TAP_L = (k = 1, hy = -0.05): FrontOpts["reach"] => [{ ex: -18 - 10 * k, ey: 0.15 - 0.1 * k, hx: -18 - 30 * k, hy: 0.2 + (hy - 0.2) * k, front: true }, undefined];
const HANDS_IN = (): FrontOpts["reach"] => [{ ex: -14, ey: 0.35, hx: 22, hy: 0.28, front: true }, { ex: 14, ey: 0.35, hx: -22, hy: 0.28, front: true }];
const BROW = (): FrontOpts["reach"] => [undefined, { ex: 22, ey: -0.25, hx: -6, hy: -0.85, front: true }];
const SHIELD = (): FrontOpts["reach"] => [undefined, { ex: 20, ey: -0.55, hx: 2, hy: -1.15, front: true }];
const tapK = (t: number, t0: number) => ez(t, t0 - 0.35, t0) * (1 - ez(t, t0 + 0.5, t0 + 0.8));
const EXTRAS: Outfit[] = [NEIGHBOR, GRANDMA, RUNNER, TEEN, BILLIONAIRE];
/** step top under a set-local z on the stoop (0 off the stairs) */
const stepTop = (z: number) => { for (let i = 4; i >= 0; i--) if (z <= stepZ(i) + 0.16) return 0.2 * (i + 1); return 0; };

const ACTS = (id: number): Act[] => {
  const [a] = sec(id);
  switch (id) {
    case 1: return [you([1.3, 0, -2.3], [[0, "confident"], [word("twenty") - LEAD, "shock"]], { look: 0.7, reach: (t) => TAP(ez(t, 0.2, 0.9) * (t < 1.4 ? 1 : 0.6), 0.1) })];
    case 2: return [you([0.85, 0, -1.9], [[0, "confused"], [word("walked") - LEAD, "irritated"]], { noShadow: true, reach: (t) => (t < 3.3 ? POSES.point_right : [undefined, { ex: 18, ey: 0.3, hx: -12, hy: 0.35, front: true }]) })];
    case 3: return [you([0, 0, 0], [[0, "curious"], [7.0, "confused"]], { mode: "stroll", phase: (t) => t * 1.2, path: (t) => L([-3.6 - 1.25 * (t - a), 0, 2.3]), look: (t) => 0.7 * Math.sin(t * 2.2) })];
    case 4: return [you([0, 0, 0], [[0, "smile"]], { mode: "stroll", phase: (t) => t * 1.2, path: (t) => { const k = ez(t, 9.2, 10.7); return L([78.4 + 1.4 * k, 0, 2.1 - 0.85 * k]); }, look: 0.5 }),
      who(1, OWNER, [K + 0.15, 0, -0.75], [[0, "smile"]], { look: -0.4 })];
    case 5: return [you([K - 0.15, 0, 1.2], [[0, "smile"], [BEATS.tap5 - LEAD, "grin"]], { look: 0.5, reach: (t) => (t < BEATS.cup ? TAP(tapK(t, BEATS.tap5), 0.0) : undefined), prop: (t) => (t > BEATS.cup + 0.15 ? "mug" : null) }),
      who(1, OWNER, [K + 0.25, 0, -0.75], [[0, "smile"], [12.1, "smile_closed"]], { look: -0.5, reach: (t) => (t > 11.9 && t < BEATS.cup + 0.2 ? POSES.hold_out : undefined) })];
    case 6: return [you([K + 0.1, 0, 1.25], [[0, "curious"]], { lookY: () => 0.6, tilt: (t) => 10 * ez(t, 13.7, 14.6), prop: "mug", look: 0.4 })];
    case 8: return [you([0, 0, 0], [[0, "grin"], [word("laugh") - LEAD, "laugh"], [word("who") - LEAD, "smug"]], { prop: "mug", tilt: (t) => (t > 20.2 && t < 20.9 ? 4 * Math.sin(t * 16) : 0),
      mode: "stand", path: (t) => L([K - 0.5 - 1.6 * ez(t, 21.6, 22.3), 0, 1.6]) }),
      who(1, OWNER, [K + 0.5, 0, -0.75], [[0, "smile_closed"]], { look: -0.5 })];
    case 9: return [you([1.3, 0, -2.3], [[0, "smug"], [BEATS.lock - LEAD, "shock"], [BEATS.yank + 0.15, "angry"]], { look: 0.7,
      reach: (t) => (t < BEATS.lock ? TAP(tapK(t, BEATS.notip), 0.3) : TAP(0.9 + 0.1 * Math.sin(t * 40), 0.4)), tilt: (t) => (t > BEATS.yank ? 3 * Math.sin(t * 40) * Math.max(0, 1 - (t - BEATS.yank) / 0.5) : 0) })];
    case 10: return [you([PK - 0.15, 0.03, -0.2], [[0, "smile"], [word("asks") - LEAD, "curious"]], { mode: "sit", seat: 0.46, look: 0.6, noShadow: true })];
    case 11: { const sw = BEATS.tips + 0.4;
      return [you([0, 0, 0], [[0, "curious"], [BEATS.tips - LEAD, "shock"]], { mode: "sit", seat: 0.46, noShadow: true, path: (t) => { if (t >= sw) return null; const k = ez(t, BEATS.tips, sw); return L([PK - 0.15, 0.03 - 0.25 * k, -0.2 + 0.8 * k]); }, tilt: (t) => -30 * benchTip(11, t) }),
        { ...you([PK - 0.1, 0, 0.9], [[sw, "dazed"]], { mode: "sit", path: (t) => (t >= sw ? L([PK - 0.1, 0, 0.9]) : null), tilt: (t) => 6 * Math.sin((t - sw) * 12) * Math.max(0, 1 - (t - sw) / 0.6) }), i: 5 }]; }
    case 12: return [you([0, 0, 0], [[0, "tired"], [word("tip", 29.5) - LEAD, "curious"]], { mode: "stroll", phase: (t) => t * 1.1, path: (t) => { const k = ez(t, 28.8, 30.0); return L([BS - 1.6 + 1.8 * k, 0, 1.9 - 1.75 * k]); }, reach: (t) => (t > 29.2 && t < 30.0 ? BROW() : undefined), look: (t) => (t > 30.0 ? 0.7 : 0) })];
    case 13: return [you([BS + 0.2, 0, 0.15], [[0, "curious"], [31.95, "squint"]], { reach: (t) => (t > 31.95 ? SHIELD() : undefined), noShadow: true })];
    case 14: return [who(3, NEIGHBOR, [BS + 2.15, 0, 2.65], [[0, "deadpan"], [word("shakes") - LEAD, "bored"]], { head: (t) => (t > 33.5 ? 9 * Math.sin((t - 33.5) * 9) : 0), look: -0.6 }),
      you([BS + 0.2, 0, 0.15], [[0, "irritated"]], { reach: () => POSES.arms_crossed })];
    case 15: return [who(3, NEIGHBOR, [BS + 1.25, 0, 1.35], [[0, "smug"]], { look: 0.6, reach: (t) => TAP(tapK(t, BEATS.press15), 0.0) }),
      you([BS + 0.2, 0, 0.1], [[0, "irritated"], [36.4, "pouty"]], { reach: () => POSES.arms_crossed, look: 0.5 })];
    case 16: { const zAt = (t: number) => t < BEATS.fold ? -1.2 - 1.55 * ez(t, 37.95, 39.45) : t < 40.0 ? -2.75 : -2.75 + 1.75 * ez(t, 40.0, 40.55);
      const yAt = (t: number) => { const z = zAt(t); return t < BEATS.fold ? stepTop(z) : t < 40.0 ? stepTop(z) + (rampY(z) - stepTop(z)) * fold(16, t) : rampY(z); };
      return [you([0, 0, 0], [[0, "confident"], [BEATS.fold - LEAD, "shock"], [40.6, "dazed"]], { mode: "stroll", phase: (t) => (t < 39.45 ? t * 1.3 : 0.25), path: (t) => L([A - 0.2, yAt(t), zAt(t)]), noShadow: true, tilt: (t) => (t > 40.0 && t < 40.6 ? -8 : 0) })]; }
    case 17: { const bob = (t: number) => (t > BEATS.stop ? 0.1 * Math.abs(Math.sin((t - BEATS.stop) * 14)) * Math.exp(-(t - BEATS.stop) * 4) : 0);
      return [you([0, 0, 0], [[0, "bored"], [BEATS.stop - LEAD, "shock"], [42.4, "irritated"]], { path: (t) => L([E - 0.1, bob(t), -0.15]), noShadow: true, look: (t) => (t > 42.8 ? 0.7 : 0), reach: (t) => TAP(tapK(t, BEATS.pay17), -0.05) })]; }
    case 18: return [you([E + 0.65, 0, 4.85], [[0, "deadpan"], [word("zero") - LEAD, "sad"]], { mode: "sit", seat: 0.5, look: 0.6, reach: () => TAP(1, 0.32), noShadow: true, prop: CARD })]; // round 3: the card in his hand at the reader
    case 19: { const sw = BEATS.bed + 0.35;
      return [you([0, 0, 0], [[0, "tired"], [BEATS.bed - LEAD, "shock"]], { mode: "sit", seat: 0.5, noShadow: true, path: (t) => (t < sw ? L([E + 0.1, 0.35 * ez(t, BEATS.bed, sw), 5.2 - 0.3 * ez(t, BEATS.bed, sw)]) : null), tilt: (t) => -12 * ez(t, BEATS.bed, sw) }),
        { ...you([E + 0.1, 0, 6.6], [[sw, "dazed"]], { mode: "sit", path: (t) => (t >= sw ? L([E + 0.1, 0.3 * (1 - ez(t, sw, sw + 0.25)), 6.6]) : null) }), i: 5 }]; }
    case 20: return [you([E - 0.15, 0, 5.6], [[0, "sad"]], { mode: "sit", reach: HANDS_IN, head: () => 6 })];
    case 22: return [you([K - 0.95, 0, 1.0], [[0, "curious"], [word("hour", 56) - LEAD, "irritated"]], { lookY: () => 0.5, look: 0.5 }),
      who(1, OWNER, [K + 0.4, 0, -0.75], [[0, "smile_closed"]], { look: -0.3, reach: (t) => TAP_L(0.6 + 0.2 * Math.sin(t * 3), 0.25) })];
    case 23: return [you([K, 0, 1.3], [[0, "curious"], [word("you", 61.5) - LEAD, "sad"]], { look: (t) => (t < 60.9 ? 0.6 : 0), lookY: (t) => (t < 60.9 ? 0 : 0.5), reach: (t) => (t > 60.9 ? [undefined, { ex: 20, ey: 0.38, hx: 8, hy: 0.3, front: true }] : undefined), prop: (t) => (t > 60.9 ? WALLET : null) }), // round 3: the wallet in his hand (it was pasted on his chest)
      who(1, OWNER, [K + 0.55, 0, -0.75], [[0, "smile"]], { look: 0.5, reach: (t) => (t < 60.6 ? TAP(0.7, 0.1) : undefined) })];
    case 24: return [{ ...you([K - 1.55, 0, 0.55], [[0, "resolve"], [65.17, "smile_closed"]], { reach: (t) => (t < 64.77 ? TAP_L(0.5, 0.3) : HANDS_IN()) }), o: YOU_AP }];
    case 25: return [{ ...you([K, 0, -0.75], [[0, "deadpan"]], { reach: () => [undefined, { ex: 26, ey: -0.05, hx: 22, hy: -0.6, front: true }], prop: STUB91, look: 0.5 }), o: YOU_AP }]; // round 3: the stub in his hand (it floated beside him)
    case 26: return [who(4, TEEN, [K - 0.4, 0, 1.3], [[0, "nervous"], [70.57, "confused"]], { look: 0.7, lookY: () => 0.2 }),
      { ...you([K + 0.15, 0, -0.75], [[0, "smile"]], { prop: (t) => (t < 70.77 ? "mug" : null), reach: (t) => (t < 70.77 ? POSES.hold_out : undefined), look: 0.4 }), o: YOU_AP }];
    case 27: return [{ ...you([K + 0.1, 0, -0.75], [[0, "smile"], [BEATS.tap27 - LEAD, "grin"]], { look: 0.6, reach: (t) => TAP(tapK(t, BEATS.tap27), 0.0) }), o: YOU_AP }];
    default: return [];
  }
};
export const acts = (id: number): Act[] => ACTS(id);

// ---------------- props: the one screen design ----------------
const text = (p: Pen, s: string, x: number, y: number, px: number, col: string, weight = 900, font = `"Arial Black", Arial, sans-serif`) => {
  const g = p.g; g.save(); g.textAlign = "center"; g.textBaseline = "middle"; g.font = `${weight} ${px}px ${font}`; g.fillStyle = col; g.fillText(s, x, y); g.restore();
};
const rr = (p: Pen, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string, lw = 0) => {
  const g = p.g; g.beginPath(); g.roundRect(x, y, w, h, r); g.fillStyle = fill; g.fill(); if (stroke) { g.lineWidth = lw; g.strokeStyle = stroke; g.stroke(); }
};
type Scr = "off" | "ask" | "p20" | "p25" | "notip" | "lock" | "declined" | "cab" | "cab25";
/** 640 x 460 canvas = 0.32 x 0.23 m face */
const screen = (st: Scr) => (p: Pen) => {
  const g = p.g, W = 640, H = 460;
  if (st === "off") { rr(p, 0, 0, W, H, 26, "#1c2230"); g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(40, 30, 200, 18); return; }
  rr(p, 0, 0, W, H, 26, st === "lock" || st === "declined" ? "#fbe9e6" : "#eef3f6");
  if (st === "lock") { rr(p, 250, 150, 140, 120, 16, "#c62f2f"); g.lineWidth = 26; g.strokeStyle = "#c62f2f"; g.beginPath(); g.arc(320, 150, 48, Math.PI, 0); g.stroke();
    rr(p, 308, 190, 24, 50, 10, "#fbe9e6"); text(p, "LOCKED", 320, 360, 78, "#c62f2f"); return; }
  if (st === "declined") { text(p, "DECLINED", 320, 140, 92, "#c62f2f"); text(p, "$0.00", 320, 300, 150, "#1d1a3a"); return; }
  const cab = st === "cab" || st === "cab25", lab = cab ? ["20%", "25%", "30%"] : ["18%", "20%", "25%"], hit = st === "p20" ? 1 : st === "p25" || st === "cab25" ? (cab ? 1 : 2) : -1;
  text(p, "Add a tip?", 320, 62, 54, "#3a4256", 700, "Arial, sans-serif");
  for (let i = 0; i < 3; i++) { const x = 28 + i * 200, on = i === hit;
    rr(p, x, 116, 184, 210, 22, on ? "#2fa36b" : "#2f6fd6", "#1d1a3a", 6); text(p, lab[i], x + 92, 222, 72, "#ffffff"); }
  rr(p, 210, 356, 220, 70, 16, st === "notip" ? "#8a8f9e" : "#dde3e8"); text(p, "No tip", 320, 392, 40, st === "notip" ? "#ffffff" : "#8a8f9e", 700, "Arial, sans-serif");
};
/** a screen face on a slab at set-local p with world normal n */
const face = (out: Stage, key: string, st: Scr, [x, y, z]: V3, n: V3 = [0, 0, 1], noFog = false) =>
  out.fx.push({ key: `scr|${key}|${st}`, cw: 640, ch: 460, draw: screen(st), x: X(x + n[0] * 0.026), y: y + n[1] * 0.026, z: z + n[2] * 0.026, w: 0.32, h: 0.23, face: n, noFog });
const DOOR: V3 = [1.9, 1.3, -2.8225], RAIL: V3 = [A + 1.2, 1.12, -1.5075], STOP: V3 = [BS + 1.7, 1.3, 0.8125], LIFT: V3 = [E + 0.7675, 1.3, 0.1], BED: V3 = [E + 1.25, 0.95, 4.1025];
const STREET: V3[] = [[-3.2, 1.6, 4.0825], [-6.1, 1.05, 3.8225], [-9.1, 1.05, 3.8225], [-12.2, 1.05, 3.8225]];
const ROW: V3[] = [0, 1, 2, 3, 4].map((i) => [10 + i * 3, 1.3, -2.8575]);
const PLAZA: V3[] = ([[-8, 4], [8, 4], [-8, -5], [8, -5], [0, 8]] as number[][]).map(([x, z]) => [K + x, 1.3, z + 0.0525]);
const cartFace = (out: Stage, id: number, t: number, st: Scr) => { const [x, y, z, yaw] = cartScreen(id, t); face(out, "cart", st, [x, y + 0.14, z + 0], [Math.sin(yaw), 0, Math.cos(yaw)]); void x; };

const sign = (p: Pen) => { const g = p.g; g.fillStyle = "#f6f0dc"; g.fillRect(10, 18, 660, 450); g.strokeStyle = "#cfc6a8"; g.lineWidth = 6; g.strokeRect(10, 18, 660, 450);
  g.fillStyle = "rgba(230,226,200,0.85)"; g.save(); g.translate(60, 30); g.rotate(-0.5); g.fillRect(-60, -20, 130, 44); g.restore(); g.save(); g.translate(620, 30); g.rotate(0.5); g.fillRect(-70, -20, 130, 44); g.restore();
  text(p, "HELP WANTED", 340, 120, 82, "#c62f2f"); text(p, "$2.13", 340, 280, 190, "#1d1a3a"); text(p, "per hour", 340, 410, 64, "#1d1a3a", 700, "Arial, sans-serif"); };
const stub = (big: boolean) => (p: Pen) => { const g = p.g; g.fillStyle = "#fbfaf4"; g.fillRect(8, 8, 464, 624); g.strokeStyle = "#b8b2a2"; g.lineWidth = 6; g.strokeRect(8, 8, 464, 624);
  text(p, "PAY STUB", 240, 70, 54, "#3a4256"); g.fillStyle = "#b8b2a2"; g.fillRect(40, 112, 400, 6);
  text(p, "BASE PAY", 240, 175, 48, "#3a4256", 700, "Arial, sans-serif"); text(p, "$2.13/hr", 240, 270, 104, "#1d1a3a");
  if (!big) { text(p, "+ TIPS", 240, 400, 78, "#2fa36b"); text(p, "= the rest", 240, 500, 54, "#3a4256", 700, "Arial, sans-serif"); }
  else { g.save(); g.translate(250, 450); g.rotate(-0.18); g.globalAlpha = 0.6; g.strokeStyle = "#b03a3a"; g.lineWidth = 10; g.strokeRect(-150, -70, 300, 140); text(p, "1991", 0, 4, 110, "#b03a3a"); g.restore(); } };
const paper = (p: Pen) => { const g = p.g; g.fillStyle = "#efeadb"; g.fillRect(6, 6, 588, 408); g.fillStyle = "#c9c2ad"; g.fillRect(6, 70, 588, 6);
  text(p, "TOWN NEWS", 300, 40, 44, "#3a4256"); text(p, "72%", 300, 180, 170, "#1d1a3a"); text(p, "say tips are asked in", 300, 300, 40, "#3a4256", 700, "Arial, sans-serif"); text(p, "more places", 300, 352, 40, "#3a4256", 700, "Arial, sans-serif"); };
const bankCard = (p: Pen) => { rr(p, 4, 4, 312, 192, 22, "#2f6fd6", "#1d1a3a", 6); rr(p, 36, 60, 60, 46, 8, "#e8c45a"); const g = p.g; g.fillStyle = "rgba(255,255,255,0.8)"; for (let i = 0; i < 4; i++) g.fillRect(36 + i * 66, 140, 50, 14); };
/** the wall card reader: bezel, the DECLINED screen, a card slot, a keypad */
const reader = (p: Pen) => { const g = p.g; rr(p, 8, 8, 384, 584, 34, "#2b2f3a", "#14161c", 8); rr(p, 36, 40, 328, 236, 14, "#fbe9e6");
  text(p, "DECLINED", 200, 110, 58, "#c62f2f"); text(p, "$0.00", 200, 210, 92, "#1d1a3a");
  g.fillStyle = "#0c0d10"; g.fillRect(70, 300, 260, 14);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) rr(p, 70 + c * 92, 340 + r * 60, 76, 46, 10, r === 3 ? ["#c62f2f", "#e8c45a", "#2fa36b"][c] : "#5a6070"); };
/** local px about card point c (rotated, scaled), following the body tilt */
const local = (p: Pen, c: [number, number], ang: number, s: number, fn: (g: CanvasRenderingContext2D) => void) => {
  const g = p.g, [x, y] = p.P(c[0], c[1]), r = p.rot; g.save(); g.translate(x, y); g.rotate(ang + (r ? r[0] : 0)); g.scale(s, s); p.rot = null;
  try { fn(g); } finally { p.rot = r; g.restore(); }
};
/** the bank card pinched in the left hand (screen right), pointed at the reader */
const CARD: Prop = { k: "card18", draw: (p, h, u) => { const c = h[1]; if (!c) return; local(p, c, -0.25, 0.1 * u, (g) => { g.translate(-60, -100); bankCard(p); }); } };
/** an open, empty wallet in the left hand */
const WALLET: Prop = { k: "wallet23", draw: (p, h, u) => { const c = h[1]; if (!c) return; local(p, c, 0.12, 0.18 * u, (g) => { g.translate(-130, -110);
  rr(p, 6, 6, 248, 168, 18, "#6a4a32", "#2a1e16", 6); p.stroke([[130, 10], [130, 170]], 5, "#2a1e16");
  for (const x of [24, 148]) rr(p, x, 30, 88, 110, 8, "#4a3220"); text(p, "$0", 190, 86, 40, "#e9dcc0"); }); } };
/** the 1991 stub pinched at the middle of its left edge, held up beside his head (the hand clears the cup) */
const STUB91: Prop = { k: "stub91", draw: (p, h, u) => { const c = h[1]; if (!c) return; local(p, c, -0.06, 0.17 * u, (g) => { g.translate(-30, -300); stub(true)(p); }); } };
/** the folded wall bed's underside: the frame panel, two legs, a sheet hem and a pillow corner caught in the fold (1.4 x 2 m) */
const bedFace = (p: Pen) => { const g = p.g; rr(p, 10, 10, 540, 780, 18, "#6a4a38", "#2a1e16", 10); g.fillStyle = "#5a3d2e"; for (const x of [140, 280, 420]) g.fillRect(x - 6, 30, 12, 740);
  for (const x of [60, 500]) rr(p, x - 22, 20, 44, 70, 8, "#3a2a22", "#1c140f", 6);
  p.poly([[40, 790], [520, 790], [515, 760], [470, 778], [400, 756], [300, 782], [200, 758], [110, 780], [45, 760]], "#c63939", 6);
  rr(p, 340, 700, 150, 70, 30, "#e8e4f0", "#9a96aa", 6); };
/** ON STRIKE hung on a string over the frame's top rail */
const strikeSign = (p: Pen) => { const g = p.g; g.strokeStyle = "#1d1a3a"; g.lineWidth = 6; g.beginPath(); g.moveTo(80, 120); g.lineTo(200, 14); g.lineTo(320, 120); g.stroke(); p.ell(200, 14, 12, 12, "#c9ccd4", 4);
  g.fillStyle = "#f6f0dc"; g.fillRect(20, 120, 360, 250); g.strokeStyle = "#1d1a3a"; g.lineWidth = 8; g.strokeRect(20, 120, 360, 250);
  text(p, "ON", 200, 190, 88, "#c62f2f"); text(p, "STRIKE", 200, 300, 88, "#c62f2f"); };
const floorInd = (stuck: boolean) => (p: Pen) => { const g = p.g; g.fillStyle = "#14161c"; g.fillRect(0, 0, 250, 100); text(p, stuck ? "3 | 4" : "▲ 3", 125, 52, 70, stuck ? "#e04a3a" : "#ffb648"); };
const ellPx = (p: Pen, c: string) => { const g = p.g, r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, c); r.addColorStop(1, "rgba(255,240,200,0)"); g.fillStyle = r; g.fillRect(0, 0, 128, 128); };

export const fx = (id: number, t: number, out: Stage) => {
  const S20 = (t0: number): Scr => (t > t0 ? "p20" : "ask");
  // every street screen in the street shots
  if ([1, 2, 3, 9].includes(id)) {
    face(out, "door", id === 9 ? (t > BEATS.lock ? "lock" : t > BEATS.notip ? "notip" : "ask") : id === 1 && t < 0.35 ? "off" : "ask", DOOR);
    STREET.forEach((pt, i) => face(out, `st${i}`, id === 3 && t < 5.6 + 0.55 * i ? "off" : "ask", pt));
    ROW.forEach((pt, i) => face(out, `row${i}`, "ask", pt));
  }
  if (id === 3) STREET.forEach((pt, i) => { const k = clamp01((t - 5.6 - 0.55 * i) / 0.5); if (k > 0 && k < 1) out.fx.push({ key: `pop|${q(k, 8)}`, cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, `rgba(255,250,220,${q(1 - k, 8)})`), x: X(pt[0]), y: pt[1], z: pt[2] + 0.05, w: 0.9, h: 0.9, noFog: true }); });
  if ([4, 5, 6, 8, 22, 23, 24, 26, 27].includes(id)) cartFace(out, id, t, id === 5 ? S20(BEATS.tap5) : id === 27 ? S20(BEATS.tap27) : "ask");
  if ([4, 6, 7, 8, 21, 22].includes(id)) { const pk = id === 21 ? ez(t, BEATS.peel, BEATS.peel + 0.7) : 0;
    out.fx.push({ key: "sign", cw: 680, ch: 480, draw: sign, x: X(K + 0.75 - 0.03 * pk), y: 0.8 + 0.04 * pk, z: 0.474 + 0.05 * pk, w: 0.34, h: 0.24, face: [0, 0, 1], rot: q(-0.18 * pk, 24) }); }
  if (id === 22 || id === 24) PLAZA.forEach((pt, i) => face(out, `pz${i}`, "ask", pt));
  if (id === 22) out.fx.push({ key: "stub", cw: 480, ch: 640, draw: stub(false), x: X(K - 0.25), y: 1.15, z: 0.22, w: 0.24, h: 0.32, flat: true, rot: 0.08 });
  if (id === 24 && t < 64.77) out.fx.push({ key: "sign", cw: 680, ch: 480, draw: sign, x: X(K - 1.95), y: 1.05, z: 0.7, w: 0.34, h: 0.24, face: [0.3, 0, 1], rot: 0.15 });
  if (id === 10) out.fx.push({ key: "paper", cw: 600, ch: 420, draw: paper, x: X(PK + 0.45), y: 0.535, z: -0.24, w: 0.42, h: 0.3, flat: true, rot: -0.1 });
  if (id === 10 || id === 11) { const a = benchTip(id, t), y = 0.72, z = -0.1 + 0.0225;
    face(out, "bench", id === 10 ? "ask" : t > BEATS.tips - 0.3 ? "notip" : "ask", [PK + 0.98, 0.03 + y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)], [0, -Math.sin(a), Math.cos(a)]); }
  if (id >= 12 && id <= 15) face(out, "stop", id === 15 ? S20(BEATS.press15) : "ask", STOP);
  if (id === 16) face(out, "rail", "ask", RAIL);
  if (id === 17) { face(out, "lift", S20(BEATS.pay17), LIFT, [-1, 0, 0], true);
    out.fx.push({ key: `floor|${t > BEATS.stop}`, cw: 250, ch: 100, draw: floorInd(t > BEATS.stop && t < BEATS.pay17 + 0.3), x: X(E), y: 2.12, z: -0.775, w: 0.45, h: 0.18, face: [0, 0, 1], noFog: true }); }
  // round 3: the wall screen by the bed is a card reader (bezel, slot, keypad), DECLINED on its screen; the card is in his hand (cast)
  if (id === 18 || id === 19) out.fx.push({ key: "reader", cw: 400, ch: 600, draw: reader, x: X(BED[0]), y: BED[1] - 0.09, z: BED[2] + 0.03, w: 0.3, h: 0.45, face: [0, 0, 1], noFog: true });
  // round 3: the BED strikes: the sign hangs on a string from the folded bed's frame, a sheet and a pillow corner stick out of the fold
  if (id === 20) { out.fx.push({ key: "bedfold", cw: 560, ch: 800, draw: bedFace, x: X(E), y: 1.1, z: 4.17, w: 1.4, h: 2.0, face: [0, 0, 1] });
    out.fx.push({ key: "strike", cw: 400, ch: 400, draw: strikeSign, x: X(E), y: 1.5, z: 4.2, w: 0.7, h: 0.7, face: [0, 0, 1], rot: q(0.05 * Math.sin(t * 2.2), 16) }); } // round 3: the floor pillow went (the pillow is in the fold now)
  if ([17, 18, 19, 20].includes(id)) out.fx.push({ key: "lampglow", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, "rgba(255,226,160,1)"), x: X(E - 1.5), y: 1.0, z: 4.6, w: 0.9, h: 0.9, noFog: true });
};
