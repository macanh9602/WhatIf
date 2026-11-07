// Shot timeline engine: the active episode's shots and camera data (@ep = eps/<ep>, chosen per bundle by scripts/ep.mjs)
// played through the camera and lens rules shared by every episode.
// Shots name a set + a camera hint from sets.ts; the camera creeps in on every hold (no static hold >= 4 f),
// hard cuts inside a place, crossfades on place changes, a white flash after the hook.
import { SETS } from "./sets";
import { F, V3, ShotDef, Size } from "./shot";
import { SHOTS, XFADE, REFRAME, KICKS, MOVES, HOLD } from "@ep/story";
import * as EP from "@ep/story";
import type { TransKind } from "./trans";

export * from "./shot";
export { TOTAL, FLASH_AT, SHOTS, XFADE, CAPTION_STOPS, CONTACTS, WAIVE, noGreenAt } from "@ep/story";

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

/** Optional episode export TRANS: the cut INTO shot `id` as a post transition (trans.ts), `dur` frames centred on the cut,
 *  (cx, cy) = screen point in uv (0..1, y up) for iris / zoom. e.g. `export const TRANS = { 5: { kind: "iris", dur: 12, cx: 0.5, cy: 0.6 } }` */
export type Trans = { kind: TransKind; dur: number; cx?: number; cy?: number };
// read by key: a plain named import of a missing export breaks episodes that do not define it
const TRANS = ((EP as Record<string, unknown>)["TRANS"] ?? {}) as Record<number, Trans>;
/** does shot `id` carry an in or out half of a transition (Short.tsx mounts the pass only then) */
export const transIn = (id: number) => !!(TRANS[id] || TRANS[id + 1]);
/** the transition state at frame f: p 0..1 (1 at the cut), side -1 = outgoing shot, +1 = incoming */
export const transAt = (f: number) => {
  for (const s of SHOTS) {
    const t = TRANS[s.id], h = t ? Math.max(1, Math.round(t.dur / 2)) : 0;
    if (!t || f < s.a - h || f >= s.a + h) continue;
    const u = f < s.a ? (f - (s.a - h) + 1) / h : 1 - (f - s.a) / h;
    return { kind: t.kind, p: u * u, side: f < s.a ? -1 : 1, cx: t.cx ?? 0.5, cy: t.cy ?? 0.5 };
  }
  return null;
};

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]) || 1;

const baseCam = (s: ShotDef, f: number): { pos: V3; look: V3; fov: number } => {
  const set = SETS[s.set], c = s.cam;
  if ("fall" in c) { // straight down (a 2 % tilt keeps lookAt defined), height eased linearly across the shot
    const u = Math.min(1, Math.max(0, (f - s.a) / Math.max(1, s.b - s.a))), h = c.h[0] + (c.h[1] - c.h[0]) * u, look = add(set.origin, c.fall);
    return { pos: [look[0], look[1] + h, look[2] + h * 0.02], look, fov: c.fov ?? 50 };
  }
  if ("local" in c) {
    const look = add(set.origin, c.lookAt), k = (REFRAME[s.id] ?? 1) * 1.15; // x1.15 everywhere: the room around the cast (fb0016 "bí bách")
    return { pos: add(look, sub(add(set.origin, c.local), look), k), look, fov: c.fov };
  }
  if ("cam" in c) {
    const h = set.cams[c.cam] ?? Object.values(set.cams)[0];
    return { pos: h.pos, look: h.look, fov: h.fov };
  }
  // a close camera on a spot, from the direction of another camera (same side of the action), slightly off-axis
  const spot = set.spots[c.on], ref = set.cams[c.from];
  const look: V3 = [spot[0], spot[1] + c.h, spot[2]];
  let d = sub(ref.pos, look); d = [d[0], 0, d[2]];
  const n = len(d), dir: V3 = [d[0] / n, 0, d[2] / n], perp: V3 = [-dir[2], 0, dir[0]], k = c.side ?? 0;
  const pos: V3 = [look[0] + (dir[0] + perp[0] * k) * c.dist, look[1] + 0.12, look[2] + (dir[2] + perp[2] * k) * c.dist];
  return { pos, look, fov: c.fov ?? 36 };
};

export const kickAt = (f: number) => {
  for (const k of KICKS) { const d = f - k; if (d >= 0 && d < 7) return (d % 2 ? -1 : 1) * 0.035 * (1 - d / 7); }
  return 0;
};

const SETTLE = 22; // f: each cut arrives with a small ease-out move into its framing (the reference holds only ~10 % of frames)
const ease = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k * k * (3 - 2 * k); };
const norm = (a: V3): V3 => { const n = len(a); return [a[0] / n, a[1] / n, a[2] / n]; };
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export const camAt = (id: number, f: number): Cam => {
  const s = SHOTS[id - 1], b = baseCam(s, f);
  // creeping push-in: 0.08 %/f of the distance (x push on punch shots), slowed on long shots so it never reaches
  // the cap (a capped push froze the last ~15 f of shots 9 and 22 in QA)
  const rate = Math.min(0.0008 * (s.push ?? 1), 0.5 / Math.max(1, s.b - s.a)); // fb0016: 0.25 %/f read as constant zoom-in; ~7 % over 3 s still keeps holds alive
  const hold = HOLD[id], fc = hold === undefined ? f : hold === 0 ? s.a : Math.min(f, F(hold));
  const k = Math.min(0.55, rate * Math.max(0, fc - s.a));
  let pos = add(b.pos, sub(b.look, b.pos), k), look = b.look, rollDeg = s.roll ?? 0;
  const d = len(sub(look, pos)), fwd = norm(sub(look, pos)), right = norm(cross(fwd, [0, 1, 0])), up = cross(right, fwd);
  const settle = hold === 0 || s.size !== "wide" || "fall" in s.cam ? 0 : // fall: a sideways offset beats the rig's 2 % tilt and spins the whole view
     1 - ease((f - s.a) / SETTLE), side = id % 2 ? 1 : -1; // r5 D1: settle on wides only, elsewhere it read as drift
  pos = add(pos, right, 0.025 * d * side * settle); // halved (D1: read as drift) // sideways only: easing back along a down-tilted axis raised the camera (staging camH)
  for (const m of MOVES[id] ?? []) {
    const e = ease((f - F(m.at)) / m.dur);
    if (!e) continue;
    if (m.k === "push" || m.k === "pull") pos = add(pos, fwd, (m.k === "push" ? 1 : -1) * m.amt * d * e);
    else if (m.k === "truck") { pos = add(pos, right, m.amt * d * e); look = add(look, right, m.amt * d * e); }
    else if (m.k === "crane") pos = add(pos, up, m.amt * d * e);
    else if (m.k === "roll") rollDeg += m.amt * e;
    else { const a = (m.amt * e * Math.PI) / 180, r = sub(pos, look), c = Math.cos(a), sn = Math.sin(a); pos = [look[0] + r[0] * c - r[2] * sn, pos[1], look[2] + r[0] * sn + r[2] * c]; }
  }
  const kick = kickAt(f);
  return { pos: [pos[0], pos[1] + kick, pos[2]], look, fov: b.fov, roll: (rollDeg * Math.PI) / 180 + kick * 0.6 };
};

/** sky-fall shots: where to pin the falling card, `below` m under the lens (follows every camera move) */
export const fallPos = (id: number, t: number, below = 4): V3 => { const c = camAt(id, Math.round(t * 30)); return [c.pos[0], c.pos[1] - below, c.pos[2]]; };

// ---------------- lens blur ----------------
export type Dof = { cInf: number; focus?: (f: number) => V3 };
const CINF: Record<Size, number> = { close: 13, mid: 10, wide: 5 }; // depth.md 5.1: WS 5 px too (was 0: wides read flat, fb0016b)
export const dofAt = (f: number): Dof => { const s = shotAt(f); return "fall" in s.cam ? { cInf: CINF[s.size], focus: (g) => fallPos(s.id, g / 30) } : { cInf: CINF[s.size] }; }; // sky-fall: focus on the faller
