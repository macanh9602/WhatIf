// Acting vocabulary shared by every episode (eps/<ep>/cast.ts): placements, blinks, keyed tracks, contact shadows and
// the Act record stage() in cast.ts turns into cards. A leaf module (no episode imports), like shot.ts.
import * as THREE from "three";
import { Pen, fxContact, fxShadow, Outfit, Expr, FrontOpts, Prop, animSpan } from "./toon";
import { FPS, V3, smooth } from "./shot";

// ---------------- placements ----------------
export type Place = { key: string; draw: (p: Pen) => void; x: number; y: number; z: number; scale?: number; mirror?: boolean; yaw?: number; size?: [number, number, number] };
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean;
  /** lies on a wall: the card's normal (world), instead of turning to the camera */
  face?: V3 };
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun: THREE.Vector3 };
export type Stage = { places: Place[]; fx: FxPlace[] };

export const q = (v: number, n = 120) => Math.round(v * n) / n;
export const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design] for the 1440 x 2560 final */
export const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
export const light2D = (cam: CamInfo) => Math.round(Math.atan2(-cam.sun.y, cam.sun.dot(cam.right)) / (Math.PI / 4)) * (Math.PI / 4);

// ---------------- life: blinks (4 f: half / shut / shut / half, every 0.5-2.3 s, plus one across each expression swap) ----------------
export const LEAD = 2 / FPS; // reactions land 0-3 f before the word
const LID = [0.5, 1, 1, 0.5];
const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
export const lidAt = (t: number, i: number, swaps: number[]) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13));
  }
  return 0;
};
/** keyed acting track (gaze, head, lean): starts at keys[0], eases to each next value over `dur` s from its time (r4-sol E) */
export type Keys = [number, number][];
export const kf = (keys: Keys, dur = 0.2) => (t: number) => { let v = keys[0][1]; for (const [tk, x] of keys.slice(1)) if (t > tk) v += (x - v) * smooth((t - tk) / dur); return v; };
/** expression track: [[time, expr], ...] -> expr at t (switches LEAD early) + the swap times for the blink */
export type Track = [number, Expr][];
/** a reaction pop: `face` for `dur` s from `at`, then back to `base` (reference pops are 0.4-0.7 s; acting.md, fb0106) */
export const pop = (base: Expr, at: number, face: Expr, dur = 0.5): Track => [[at, face], [at + dur, base]];
/** emotion families for scripts/expr_qa.mjs: a shot moves along one family; "calm" borders every family (fb0106) */
export type Family = "calm" | "smug" | "happy" | "annoyed" | "worried" | "sad" | "shock";
export const FAMILY: Record<Expr, Family> = {
  neutral: "calm", deadpan: "calm", casual: "calm", bored: "calm", tired: "calm", concentrate: "calm", smile: "calm", curious: "calm",
  sideeye: "calm", eyeroll: "calm", bruh: "calm", whistle: "calm", lick: "calm",
  smug: "smug", sly: "smug", scheming: "smug", confident: "smug", proud_chin: "smug", smirk_wink: "smug", resolve: "smug", amused: "smug",
  grin: "happy", laugh: "happy", relief: "happy", relief_open: "happy", excited: "happy", silly: "happy", proud: "happy", smile_closed: "happy",
  stern: "annoyed", irritated: "annoyed", angry: "annoyed", rage: "annoyed", disgusted: "annoyed", pouty: "annoyed", pressed: "annoyed",
  nervous: "worried", worried: "worried", scared: "worried", shook: "worried", cringe: "worried", fake_smile: "worried", nervous_laugh: "worried",
  embarrassed: "worried", sheepish: "worried", concede: "worried",
  sad: "sad", cry: "sad", sigh: "sad", puppy: "sad", pained: "sad",
  shock: "shock", jawdrop: "shock", mindblown: "shock", dazed: "shock", confused: "shock",
};
export const exprAt = (tr: Track, t: number): Expr => { let e = tr[0][1]; for (const [ts, x] of tr) if (t >= ts - LEAD) e = x; return e; };
/** face animation inputs: seconds since the current expression began (frame-quantised) and the one before it */
export const exprAnim = (tr: Track, t: number): { exprT: number; exprFrom?: Expr } => {
  let i = 0; for (let j = 0; j < tr.length; j++) if (t >= tr[j][0] - LEAD) i = j;
  const t0 = i ? tr[i][0] - LEAD : -9, et = Math.round((t - t0) * FPS) / FPS;
  return { exprT: Math.min(et, animSpan(tr[i][1]), 600), exprFrom: i && tr[i - 1][1] !== tr[i][1] && et < 0.35 ? tr[i - 1][1] : undefined };
};

// ---------------- contact shadow (multiply, blue-violet; by day a soft tail away from the sun) ----------------
export const blob = (out: Stage, sun: THREE.Vector3, golden: boolean, x: number, y: number, z: number, sc = 1) => {
  const hl = Math.hypot(sun.x, sun.z) || 1, ox = -sun.x / hl, oz = -sun.z / hl, rot = Math.atan2(-ox, -oz);
  if (!golden) {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, sun.y)));
    const l = Math.min(2.2, Math.max(0.5, 1.4 / Math.tan(el))) * sc, h = l + 0.5 * sc, c = 0.3 * h;
    out.fx.push({ key: "blob|shadow|tail", cw: 128, ch: 256, draw: (p) => fxShadow(p, "#b8bdd6"), x: x + ox * c, y: y + 0.018, z: z + oz * c, w: 0.66 * sc, h, flat: true, rot });
  }
  out.fx.push({ key: `blob|contact|${golden ? "g" : "d"}`, cw: 128, ch: 128, draw: (p) => fxContact(p, golden ? "#4d3f63" : "#4a4c72"), x, y: y + 0.022, z, w: 0.48 * sc, h: 0.36 * sc, flat: true, rot });
};

// ---------------- who acts in each shot ----------------
export type Act = {
  i: number; o: Outfit; at: V3; off?: V3; mode?: FrontOpts["mode"]; expr: Track; prop?: Prop | ((t: number) => Prop);
  wave?: (t: number) => number | undefined; cast?: (t: number) => number; face?: number | ((t: number) => number); look?: number | ((t: number) => number); phase?: (t: number) => number;
  lookY?: (t: number) => number; head?: (t: number) => number; // gaze up (-) / down (+), head tilt in degrees: the thinking layer (r4-sol E)
  tilt?: (t: number) => number; scale?: number; reach?: (t: number) => FrontOpts["reach"]; seat?: number; // seat height in metres (sit mode)
  drift?: (t: number) => V3; // added to off: small wander (kids at play)
  moveTo?: [[number, V3], [number, V3]]; // off glides from the first to the second between the two times (a run)
  mirror?: boolean; yaw?: number; // a reflection: flipped, flat on the mirror instead of turned to the camera
  path?: (t: number) => V3 | null; // replaces at: a ride along a path; null = out of sight (under water, still climbing)
  noShadow?: boolean; // no contact shadow (a rider on the slide)
};
