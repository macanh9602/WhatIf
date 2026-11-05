// What If ep04 acting: "you" with a second face on the back of the head, timed to the voice words, plus the shot fx
// (the neighbour's surprise, two pictures over the head, a hawk overhead).
// Cards always face the camera: a back view of you is YOU_BACK (the closed red jacket from behind, the curl unchanged),
// and the face on that card is the back face. The back face is always the deadpan one.
import { Pen, Outfit, FrontOpts, INK, POSES, fxExclaim, fxStars, fxShock } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, kf, q } from "../../act";
import { YOU, NEIGHBOR, CHANNEL_CAST } from "../people";
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

/** you seen from behind: the jacket's back is closed (no white tee), everything else is YOU */
const SIDEWALK: V3 = [-1.0, 0, 0.6]; // yard: in front of the picket fence (behind it the fence cuts the body)
export const YOU_BACK: Outfit = { ...YOU, jacket: YOU.layer!.color, layer: undefined };

const ACTS = (id: number): Act[] => {
  switch (id) {
    case 1: { const p0 = L(1, [-1.25, 0, 0.6]), t0 = word("sneak") + 0.25; return [
      { i: 0, o: YOU_BACK, at: p0, mode: "stand", expr: [[0, "bored"], [t0, "deadpan"]], look: kf([[0, -0.2], [word("nobody"), 0.9]], 0.3), lookY: () => 0.05 },
      { i: 1, o: NEIGHBOR, at: L(1, [-0.65, 0, 0.4]), mode: "stroll", phase: (t) => Math.min(t, t0) * 1.4, face: -1, expr: [[0, "scheming"], [t0, "shock"]],
        reach: (t) => (t < t0 ? POSES.hands_up : POSES.cover_mouth), moveTo: [[0.2, [1.0, 0, 0]], [t0, [0, 0, 0]]],
        path: (t) => { const k = clamp01((t - t0) / 0.5); return L(1, [-0.65, 0.35 * Math.sin(Math.PI * k), 0.4]); } },
    ]; }
    case 3: return [{ i: 0, o: YOU_BACK, at: L(3, SIDEWALK), mode: "stand", expr: [[0, "sideeye"], [word("staring") - LEAD, "deadpan"]], look: kf([[0, 0.7], [word("staring"), 0]], 0.25), lookY: () => 0 }];
    case 5: return [{ i: 0, o: YOU, at: spot(5, "you"), mode: "stand", expr: [[0, "curious"], [word("twice") - 0.2, "confused"], [word("stitch") + 0.2, "dazed"]],
      reach: (t) => (t < word("twice") ? POSES.chin_think : POSES.head_scratch), lookY: () => -0.3 }];
    case 6: return [{ i: 0, o: YOU, at: spot(6, "you"), mode: "stand", expr: [[0, "curious"], [word("tried") - 0.2, "amused"]], look: (t) => (t < 41 ? -0.6 : 0.6) }];
    case 9: { const tp = word("prey"); return [{ i: 0, o: YOU, at: spot(9, "you"), mode: "stand", expr: [[0, "smug"], [word("safer") - 0.2, "worried"], [tp - LEAD, "scared"]],
      reach: (t) => (t < tp ? POSES.arms_crossed : POSES.hands_up), lookY: (t) => (t < tp ? 0 : -0.8), tilt: (t) => (t < tp ? 0 : 4 * Math.sin(t * 30)) }]; }
    case 10: return [{ i: 0, o: YOU, at: spot(10, "you"), mode: "stand", expr: [[0, "confident"], [word("chasing") - 0.2, "proud"]],
      reach: (t) => (t < word("chasing") - 0.2 ? POSES.hands_on_hips : POSES.fist_pump) }];
    case 11: return [{ i: 0, o: YOU_BACK, at: L(11, SIDEWALK), mode: "stand", expr: [[0, "bored"], [word("back", 77) - LEAD, "smirk_wink"], [word("right", 78.5), "silly"]], look: () => 0 }];
    default: return [];
  }
};
export const acts = ACTS;

// ---------------- fx drawings ----------------
/** a small framed picture (sky, hill, sun), 300 x 220: one per pair of eyes */
const picture = (p: Pen, sky: string) => {
  p.poly([[10, 10], [290, 10], [290, 210], [10, 210]], sky, 8);
  p.poly([[14, 150], [90, 110], [170, 140], [286, 100], [286, 206], [14, 206]], "#6fbf73", 0);
  p.ell(220, 60, 26, 26, "#ffd23f", 5);
  p.poly([[10, 10], [290, 10], [290, 210], [10, 210]], null, 8);
};
/** a hawk silhouette gliding, 360 x 160 */
const hawk = (p: Pen, flap: number) => {
  const w = 40 * flap;
  p.poly([[20, 70 - w], [140, 70], [180, 95], [220, 70], [340, 70 - w], [230, 100], [190, 130], [150, 100]], INK, 0);
};

export const fx = (id: number, t: number, out: Stage) => {
  const burst = (key: string, t0: number, dur: number, draw: (p: Pen, u: number) => void, cw: number, ch: number, x: number, y: number, z: number, w: number, h: number) => {
    const u = q(clamp01((t - t0) / dur), 15);
    if (t >= t0 && u < 1) out.fx.push({ key: `${key}|${u}`, cw, ch, draw: (p) => draw(p, u), x, y, z, w, h });
  };
  if (id === 1) { const n = L(1, [-0.65, 0, 0.4]); burst("caught", word("sneak") + 0.25, 0.8, (p, u) => fxShock(p, u), 300, 300, n[0] + 0.1, 2.0, n[2] + 0.1, 0.4, 0.4); }
  if (id === 5) { const s = spot(5, "you"), k = clamp01((t - word("twice") + 0.2) / 0.25);
    if (k > 0) for (const [dx, sky, d] of [[-0.34, "#7ec8ff", 0], [0.34, "#ffb3c7", 1]] as [number, string, number][])
      out.fx.push({ key: `pic|${d}|${q(k, 10)}`, cw: 300, ch: 220, draw: (p) => picture(p, sky), x: s[0] + dx * k, y: 1.68 + 0.03 * Math.sin(t * 7 + d * 3), z: s[2] + 0.2, w: 0.33 * k, h: 0.24 * k });
    burst("stars", word("stitch") + 0.1, 1.4, (p, u) => fxStars(p, u), 400, 400, s[0], 1.75, s[2] + 0.15, 0.5, 0.5); }
  if (id === 9) { const s = spot(9, "you"), tp = word("prey") - 0.6;
    if (t > tp) { const k = clamp01((t - tp) / 1.6); out.fx.push({ key: `hawk|${Math.round(t * 8) % 6}`, cw: 360, ch: 160, draw: (p) => hawk(p, Math.sin(t * 9)), x: s[0] - 1.6 + 3.2 * k, y: 2.2 - 0.15 * k, z: s[2] - 0.4, w: 0.6, h: 0.27 }); }
    burst("yikes", word("prey"), 0.8, (p, u) => fxExclaim(p, u), 200, 260, s[0] + 0.3, 1.95, s[2] + 0.1, 0.22, 0.29); }
};

export const CAST: [string, Outfit, Partial<FrontOpts>][] = CHANNEL_CAST.map(([n, o]) => [n, o, { expr: "smile" }]);
