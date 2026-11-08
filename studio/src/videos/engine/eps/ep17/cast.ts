// What If ep17 acting. Lead: the channel default (one curl, red varsity jacket, white tee, jeans). The running prop is ONE salary
// tag design (white pill, navy rim, bold navy "$41K", optional small grey second line), an fx card ~0.36 m over each crown that
// turns to the lens and bobs 2 cm every 2 s. Held props (bank phone, newspaper, flowers, hose) are drawn inside the character
// card with the hands (toon.ts episode Prop), so they move with the arm. No brands or logos anywhere.
import { Pen, Outfit, FrontOpts, INK, POSES, SKINS } from "../../toon";
import type { Prop } from "../../toon";
import { V3, clamp01 } from "../../shot";
import { SETS } from "../../sets";
import { Act, Stage, LEAD, q } from "../../act";
import { YOU, NEIGHBOR, TEEN, GRANDMA, RUNNER, BILLIONAIRE } from "../people";
import { SHOTS, BEATS, O as OF, C as CF, K as KP, walk5, walk22, ez } from "./story";
import words from "./words";

const SO = SETS.salary.origin;
const L = ([x, y, z]: V3): V3 => [SO[0] + x, y, z];
const X = (x: number) => SO[0] + x;
export const word = (text: string, from = 0) => {
  const hit = words.find((w) => w.start >= from - 0.01 && w.text.replace(/[^A-Za-z0-9'-]/g, "").toLowerCase() === text.toLowerCase());
  if (!hit) throw new Error(`Missing cast beat word: ${text} after ${from}`);
  return hit.start;
};
export const wearAt = (_t: number) => 0;
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------------- cast ----------------
const TWIN: Outfit = { ...YOU, sprout: false, layer: { kind: "jacket", color: "#7d828c" }, acc: ["lanyard"], style: "smooth", hair: "#2a1e16", skin: SKINS[1] }; // your build, your job, a grey jacket
const DATE: Outfit = { fem: true, jacket: "#3f9a5a", dress: "#3f9a5a", pants: "#3f9a5a", boots: "#3a2f3f", hat: null, build: "adult", top: "blouse", shoe: "flat",
  style: "smooth", hair: "#4a2a1c", skin: SKINS[1] };
const MILK: Outfit = { jacket: "#f4f1ea", pants: "#5b8eaa", boots: "#3a2f3f", hat: null, cap: "#5b8eaa", build: "stout", top: "button", bottom: "jeans", shoe: "boot",
  style: "smooth", hair: "#6a4a32", skin: SKINS[3] };
const RICH2: Outfit = { fem: true, jacket: "#e8506a", dress: "#b93c51", pants: "#b93c51", boots: "#2b2f3d", hat: null, build: "adult", top: "blouse", shoe: "flat",
  style: "ponytail", hair: "#e3c27a", skin: SKINS[0], glasses: "#2b2f3d" };
const POLO: Outfit = { jacket: "#7a4a8c", pants: "#2b2f3d", boots: "#1e1a1a", hat: null, build: "stout", top: "polo", bottom: "jeans", shoe: "boot",
  style: "spiky", hair: "#1e1a1a", skin: SKINS[2], acc: ["watch"] };
export const CAST: [string, Outfit, Partial<FrontOpts>][] = [["You", YOU, { expr: "smile" }], ["Neighbor", NEIGHBOR, { expr: "smug" }], ["Office twin", TWIN, { expr: "smile" }],
  ["Date", DATE, { expr: "smile" }], ["Milkman", MILK, { expr: "smile" }], ["Sun table", RICH2, { expr: "smug" }], ["Polo", POLO, { expr: "smug" }]];

/** an act with its salary tag (amount + optional second line); scale 1 everywhere */
type TA = Act & { tag?: string; tag2?: string | ((t: number) => string | undefined); pop?: number };
const sec = (id: number) => [SHOTS[id - 1].a / 30, SHOTS[id - 1].b / 30];
const you = (at: V3, expr: Act["expr"], more: Partial<TA> = {}): TA => ({ i: 0, o: YOU, at: L(at), mode: "stand", expr, tag: "$41K", ...more });
const who = (i: number, o: Outfit, at: V3, expr: Act["expr"], tag: string, more: Partial<TA> = {}): TA => ({ i, o, at: L(at), mode: "stand", expr, tag, ...more });
const SEEN_YOU = "Seen by: your neighbor", SEEN_HIM = "Seen by: You";
const tapK = (t: number, t0: number) => ez(t, t0 - 0.35, t0) * (1 - ez(t, t0 + 0.5, t0 + 0.8));
/** the left hand (screen right) up to the tag over his curl */
const TAPUP = (k: number): FrontOpts["reach"] => [undefined, { ex: 20 - 4 * k, ey: 0.3 - 0.75 * k, hx: 12 - 14 * k, hy: 0.6 - 2.6 * k, front: true }];
/** the bank phone up beside his face, in the left hand (screen right) */
const PHONE_UP = (k = 1): FrontOpts["reach"] => [undefined, { ex: 24, ey: 0.45 - 0.1 * k, hx: 22 + 14 * k, hy: 0.55 - 0.95 * k, front: true }];
/** both hands at the side edges of the open paper, chest high (low = let down a little) */
const PAPER_R = (low = 0, t = 0): FrontOpts["reach"] => { const s = 0.025 * Math.sin(t * 2.3); // a slow hand sway: the sheet tilts, it is held
  return [{ ex: -24, ey: 0.3 + 0.1 * low, hx: -15, hy: 0.22 + 0.25 * low + s, front: true }, { ex: 24, ey: 0.3 + 0.1 * low, hx: 15, hy: 0.22 + 0.25 * low - s, front: true }]; };
const TRAY_R = (): FrontOpts["reach"] => [{ ex: -24, ey: 0.5, hx: -8, hy: 0.85, front: true }, { ex: 24, ey: 0.5, hx: 8, hy: 0.85, front: true }];
const HANDS_IN = (): FrontOpts["reach"] => [{ ex: -14, ey: 0.35, hx: 22, hy: 0.28, front: true }, { ex: 14, ey: 0.35, hx: -22, hy: 0.28, front: true }];
/** flowers held out toward screen left (the date), k 0 = let down */
const FLOWERS_R = (k = 1): FrontOpts["reach"] => [{ ex: -24, ey: 0.35 - 0.1 * k, hx: -30 - 10 * k, hy: 0.75 - 0.6 * k, front: true }, undefined];
/** the hose in the left hand (screen right), nozzle low toward screen left */
const HOSE_R = (): FrontOpts["reach"] => [undefined, { ex: 18, ey: 0.45, hx: 4, hy: 0.62, front: true }];
const MUG_R = (): FrontOpts["reach"] => [{ ex: -18, ey: 0.42, hx: 4, hy: 0.38, front: true }, undefined];
const SIP_R = (k: number): FrontOpts["reach"] => [{ ex: -18, ey: 0.42 - 0.2 * k, hx: 4 + 12 * k, hy: 0.38 - 0.62 * k, front: true }, undefined];
const SHIELD = (): FrontOpts["reach"] => [undefined, { ex: 20, ey: -0.45, hx: 4, hy: -1.05, front: true }];
const PAVE = 1.0;

const ACTS = (id: number): TA[] => {
  const [a, b] = sec(id);
  switch (id) {
    case 1: case 25: { const up = id === 1 ? 1.0 : 67.5, t0 = a + 0.1;
      return [you([0, 0.4, -3.35], id === 1 ? [[0, "curious"], [BEATS.head - LEAD, "confused"]] : [[0, "curious"], [word("line", 68) - LEAD, "embarrassed"]],
        { mode: "stroll", phase: (t) => (t < t0 + 0.8 ? (t - t0) * 1.5 : 0), path: (t) => L([0, 0.4, lerp(-3.8, -3.35, ez(t, t0, t0 + 0.8))]), lookY: (t) => -0.85 * ez(t, up, up + 0.4),
          tag2: id === 25 ? SEEN_YOU : undefined })]; }
    case 2: case 29: { const day = id === 29, down = day ? () => 0.75 : undefined;
      return [
        day ? you([0, 0, 0], [[0, "deadpan"]], { mode: "stroll", phase: (t) => t * 1.2, path: (t) => L([lerp(2.4, 0.6, (t - a) / (b - a)), 0, 1.2]), lookY: () => 0.7, tag2: SEEN_YOU })
          : you([0, 0.4, -3.2], [[0, "shock"]], { look: (t) => 0.8 * Math.sin((t - a) * 5) }),
        who(1, MILK, [0, 0, 0], [[0, "smile"]], "$38K", { mode: "stroll", phase: (t) => t * 1.2, path: (t) => L([lerp(day ? 6.5 : 3.2, day ? 9.5 : 5.0, (t - a) / (b - a)), 0, 1.6]), lookY: down, pop: 3.8 }),
        who(2, RUNNER, [0, 0, 0], [[0, "concentrate"]], "$64K", { mode: "stroll", phase: (t) => t * 2.2, path: (t) => L([lerp(-6.5, day ? 0 : -4.6, (t - a) / (b - a)), 0, 2.1]), lookY: down, pop: 3.95 }),
        who(3, GRANDMA, [-2.4, 0, 0.9], [[0, "smile"]], "$30K", { look: 0.4, lookY: down, pop: 4.1 }),
        who(4, NEIGHBOR, [13.0, 0, -1.7], [[0, "smile"]], "$96K", { reach: HOSE_R, prop: HOSE, look: -0.4, lookY: down, pop: 4.25, tag2: day ? SEEN_HIM : undefined }),
        who(5, TEEN, [5.6, 0, 1.3], [[0, "curious"]], "$22K", { look: -0.3, lookY: down, pop: 4.0 }),
      ]; }
    case 3: return [you([0.6, 0, PAVE], [[0, "confused"]], { lookY: () => -0.8, reach: (t) => { const k = tapK(t, BEATS.salary); return k > 0.01 ? TAPUP(k) : undefined; } })];
    case 4: return [you([0.6, 0, PAVE], [[0, "smile"], [8.9, "smile_closed"]], { prop: PHONE, reach: () => PHONE_UP(), look: (t) => (t < 9.2 ? 0.55 : 0), lookY: (t) => (t < 9.2 ? 0.25 : -0.8 * ez(t, 9.2, 9.6)) })];
    case 5: return [you([0, 0, 0], [[0, "whistle"]], { mode: "stroll", phase: (t) => t * 1.3, path: (t) => L([walk5(t), 0, PAVE]), prop: (t) => (t < 10.5 ? PHONE : null), reach: (t) => (t < 10.5 ? PHONE_UP(1 - ez(t, 10.1, 10.5)) : undefined) })];
    case 6: case 26: { const late = id === 26;
      return [who(1, NEIGHBOR, [13.0, 0, -1.7], late ? [[0, "whistle"]] : [[0, "smile"]], "$96K", { reach: HOSE_R, prop: HOSE, look: late ? (t) => 0.8 * Math.sin((t - a) * 1.6) : -0.4, lookY: late ? () => 0.45 : undefined, tag2: late ? SEEN_HIM : undefined }),
        late ? you([11.5, 0, 0.5], [[0, "deadpan"]], { lookY: () => 0.4, tag2: SEEN_YOU })
          : you([0, 0, 0], [[0, "grin"]], { mode: "stroll", phase: (t) => (t < 14.0 ? t * 1.25 : 0), path: (t) => L([lerp(8.6, 11.3, ez(t, 11.7, 14.0)), 0, 1.1]),
            reach: (t) => (t > 12.15 && t < 13.4 ? [undefined, { ex: 26, ey: -0.2, hx: 30 + 6 * Math.sin(t * 14), hy: -0.63, front: true }] : undefined), look: 0.5 })]; }
    case 7: return [you([11.7, 0, 0.5], [[0, "smile"], [16.95, "nervous"]], { look: 0.5 }),
      who(1, NEIGHBOR, [12.8, 0, -1.2], [[0, "smug"]], "$96K", { reach: HOSE_R, prop: HOSE, look: -0.75, lookY: (t) => (t > BEATS.looks7 ? -0.75 * ez(t, BEATS.looks7, BEATS.looks7 + 0.3) : 0) })];
    case 8: return [who(1, NEIGHBOR, [12.8, 0, -1.25], [[0, "smug"]], "$96K", { reach: HOSE_R, prop: HOSE, look: -0.6, lookY: () => 0.15, head: (t) => (t > 17.6 && t < 18.2 ? 4 : 0) })];
    case 9: case 10: {
      const lead = id === 9 ? you([OF - 1.0, 0, -3.62], [[0, "smile"], [22.4, "irritated"]], { mode: "sit", seat: 0.47, look: (t) => (t > 22.4 ? 0.65 : 0), prop: (t) => (t < BEATS.mug ? "mug" : null), reach: (t) => (t < BEATS.mug ? MUG_R() : undefined) })
        : you([OF - 1.0, 0, -3.62], [[0, "irritated"]], { mode: "sit", seat: 0.47, look: (t) => (t < 24.15 ? 0.6 : -0.9), head: (t) => (t > 24.2 ? -6 : 0),
          reach: (t) => (t < BEATS.wave10 ? undefined : t < 24.35 ? POSES.wave : POSES.head_scratch) });
      const floor = id === 9 ? [who(2, MILK, [OF - 4.2, 0, -6.85], [[0, "bored"]], "$38K", { mode: "sit", seat: 0.47, look: 0.3 }),
        who(3, RICH2, [OF + 4.2, 0, -6.85], [[0, "smug"]], "$120K", { mode: "sit", seat: 0.47, look: -0.3 })] : [];
      return [lead, ...floor, who(1, TWIN, [OF + 1.0, 0, -3.62], [[0, "smile"]], "$58K", { mode: "sit", seat: 0.47, look: -0.6,
        reach: id === 10 ? (t) => (t > 23.9 && t < 24.9 ? [undefined, { ex: 26, ey: -0.2, hx: 30 + 6 * Math.sin(t * 14), hy: -0.63, front: true }] : undefined) : undefined })]; }
    case 11: return [
      you([0, 0, 0], [[0, "smile"], [BEATS.sorts - LEAD, "confused"]], { mode: "stroll", phase: (t) => (t < 26.7 ? t * 1.2 : 0), path: (t) => L([CF + lerp(-3.4, -1.0, ez(t, 25.6, 26.7)), 0, lerp(2.6, 1.6, ez(t, 25.6, 26.7))]), prop: "tray", reach: TRAY_R, look: (t) => 0.6 * Math.sin((t - a) * 2) }),
      who(1, BILLIONAIRE, [CF - 5.65, 0, -3.15], [[0, "smug"]], "$180K", { mode: "sit", seat: 0.46 }),
      who(2, RICH2, [CF - 4.75, 0, -3.15], [[0, "smug"]], "$120K", { mode: "sit", seat: 0.46 }),
      who(3, RUNNER, [CF - 5.15, 0, -0.15], [[0, "smile"]], "$64K", { mode: "sit", seat: 0.46 }),
      who(4, GRANDMA, [0, 0, 0], [[0, "sad"]], "$30K", { mode: "stroll", phase: (t) => t * 1.1, path: (t) => L([CF + lerp(-2.2, 4.6, ez(t, 25.6, 28.7)), 0, lerp(-1.4, -2.0, ez(t, 25.6, 28.7))]) }),
      who(5, POLO, [0, 0, 0], [[0, "smug"]], "$150K", { mode: "stroll", phase: (t) => t * 1.2, path: (t) => L([CF + lerp(6.2, -1.75, ez(t, 25.6, 28.7)), 0, lerp(-0.8, 0.0, ez(t, 25.6, 28.7))]) }),
      who(6, TEEN, [CF + 5.55, 0, -3.15], [[0, "bored"]], "$22K", { mode: "sit", seat: 0.46 }),
    ];
    case 12: return [
      who(1, BILLIONAIRE, [CF - 5.65, 0, -3.15], [[0, "smug"]], "$180K", { mode: "sit", seat: 0.46, prop: "mug", reach: (t) => SIP_R(ez(t, 29.0, 29.4) * (1 - ez(t, 29.9, 30.2))) }),
      who(2, RICH2, [CF - 4.75, 0, -3.15], [[0, "smug"]], "$120K", { mode: "sit", seat: 0.46, prop: "mug", reach: (t) => SIP_R(ez(t, 29.4, 29.8)), look: -0.4 }),
      who(3, POLO, [CF - 1.75, 0, 0.25], [[0, "smug"]], "$150K", { mode: "sit", seat: 0.46, look: -0.5 }),
    ];
    case 13: { const sit = BEATS.sit13;
      return [
        you([0, 0, 0], [[0, "sad"]], { mode: "stroll", phase: (t) => t * 1.1, path: (t) => (t < sit ? L([CF + lerp(3.6, 4.4, ez(t, 30.3, sit)), 0, lerp(-1.4, -2.3, ez(t, 30.3, sit))]) : null), prop: "tray", reach: TRAY_R }),
        { ...you([CF + 4.4, 0, -2.45], [[sit, "sad"]], { mode: "sit", seat: 0.46, path: (t) => (t >= sit ? L([CF + 4.4, 0, -2.45]) : null), look: 0.5 }), i: 7 },
        who(1, TEEN, [CF + 5.55, 0, -3.15], [[0, "bored"]], "$22K", { mode: "sit", seat: 0.46, look: -0.3 }),
        who(2, GRANDMA, [CF + 6.45, 0, -3.15], [[0, "sad"]], "$30K", { mode: "sit", seat: 0.46, look: -0.5 }),
      ]; }
    case 14: return [you([KP + 0.9, 0, -0.3], [[0, "smile"], [word("date") - LEAD, "grin"]], { prop: FLOWERS, reach: (t) => FLOWERS_R(ez(t, 32.9, 33.3)), look: -0.6 }),
      who(1, DATE, [0, 0, 0], [[0, "smile"], [BEATS.above - LEAD, "curious"]], "$73K", { mode: "stroll", phase: (t) => (t < 33.6 ? t * 1.2 : 0), path: (t) => L([KP + lerp(-4.2, -0.4, ez(t, 31.9, 33.6)), 0, 0.5]), look: 0.5,
        lookY: (t) => (t > BEATS.above ? -0.75 : 0) })];
    case 15: return [who(1, DATE, [KP - 0.15, 0, 0.6], [[0, "curious"], [BEATS.face - LEAD, "fake_smile"]], "$73K", { look: 0.65, lookY: (t) => (t < 35.85 ? -0.8 : 0.1 * ez(t, 35.85, 36.1)) }),
      you([KP + 0.85, 0, 0.0], [[0, "grin"], [35.7, "nervous"]], { prop: FLOWERS, reach: (t) => FLOWERS_R(1 - ez(t, 35.3, 35.9)), look: -0.6 })];
    case 16: return [you([0, 0, -2.55], [[0, "sad"]], { mode: "sit", seat: 0.4, reach: HANDS_IN, head: () => 6, lookY: () => 0.4 }),
      who(1, NEIGHBOR, [12.4, 0, -4.15], [[0, "deadpan"]], "$96K"), who(2, TEEN, [6.0, 0, 11.9], [[0, "bored"]], "$22K"), who(3, GRANDMA, [-6.0, 0, 11.9], [[0, "smile"]], "$30K"),
      who(4, RUNNER, [18.0, 0, 11.9], [[0, "smile"]], "$64K"), who(5, MILK, [-18.0, 0, 11.9], [[0, "smile"]], "$38K")];
    case 17: return [you([0, 0, -2.55], [[0, "tired"], [BEATS.same17 - LEAD, "deadpan"]], { mode: "sit", seat: 0.4, prop: PHONE, reach: () => PHONE_UP(0.7), look: 0.5, lookY: () => 0.3 })];
    case 18: return [you([0, 0, -2.55], [[0, "tired"], [44.4, "curious"]], { mode: "sit", seat: 0.4, look: (t) => (t < BEATS.paper18 ? 0.6 : 0),
      prop: (t) => (t < BEATS.paper18 ? null : t < BEATS.open18 + 0.1 ? PAPER_FOLD : PAPER1), reach: (t) => (t < 43.5 ? HANDS_IN() : t < BEATS.paper18 ? [undefined, { ex: 30, ey: 0.6, hx: 40, hy: 1.1, front: true }] : PAPER_R()) })];
    case 19: return [you([3.0, 0, 1.4], [[0, "curious"], [word("anyone", 49.9) - LEAD, "concentrate"]], { prop: PAPER1, reach: (t) => PAPER_R(0, t), lookY: () => 0.35 })];
    case 20: return [you([3.0, 0, 1.4], [[0, "sad"]], { prop: PAPER1, reach: (t) => PAPER_R(1, t), lookY: (t) => (t < BEATS.look20 ? 0.35 : -0.85) })];
    case 21: return [you([3.0, 0, 1.4], [[0, "deadpan"], [word("grew") - LEAD, "sad"]], { prop: PAPER2, reach: (t) => PAPER_R(0, t), lookY: () => 0.3 })];
    case 22: return [you([0, 0, 0], [[0, "resolve"]], { mode: "stroll", phase: (t) => t * 1.6, path: (t) => L([walk22(t), 0, PAVE]), prop: ROLL, reach: () => [undefined, { ex: 22, ey: 0.4, hx: 14, hy: 0.55, front: true }] })];
    case 23: return [you([11.2, 0, 0.45], [[0, "squint"], [BEATS.name23 + 0.1, "shock"]], { look: 0.5, lookY: (t) => (t < BEATS.duck23 ? -0.8 : 0.5), head: (t) => (t > BEATS.duck23 ? 8 : 0),
      reach: (t) => (t > BEATS.duck23 ? SHIELD() : undefined), path: (t) => L([11.2, -0.05 * ez(t, BEATS.duck23, BEATS.duck23 + 0.2), 0.45]), noShadow: true }),
      who(1, NEIGHBOR, [12.6, 0, -1.3], [[0, "bored"]], "$96K", { look: -0.3, lookY: () => 0.3, tag2: (t) => (t > BEATS.name23 ? SEEN_HIM : undefined) })];
    case 24: { const inside = (i: number, x: number, z0: number, z1: number, t0: number, x0 = x) => ({ path: (t: number) => { const k = ez(t, t0, t0 + 1.0); return k >= 1 ? null : L([lerp(x0, x, k), 0, lerp(z0, z1, k)]); },
      mode: "stroll" as const, phase: (t: number) => t * 1.6, lookY: (t: number) => (t > 64.9 + 0.08 * i ? 0.85 : -0.3) });
      return [you([0, 0, 0], [[0, "embarrassed"]], { path: (t) => L([lerp(11.2, 10.3, ez(t, 64.4, 65.4)), 0, lerp(0.45, 1.4, ez(t, 64.4, 65.4))]), lookY: () => 0.5 }),
        who(1, NEIGHBOR, [0, 0, 0], [[0, "embarrassed"]], "$96K", { ...inside(0, 12.4, -1.3, -4.1, 65.1), tag2: SEEN_HIM }),
        who(2, TEEN, [0, 0, 0], [[0, "nervous"]], "$22K", inside(1, 6.0, 10.4, 12.2, 65.2, 8.0)),
        who(3, GRANDMA, [0, 0, 0], [[0, "nervous"]], "$30K", inside(2, 6.6, 10.6, 12.2, 65.35, 10.2)),
        who(4, RUNNER, [0, 0, 0], [[0, "nervous"]], "$64K", inside(3, 18.0, 10.2, 12.2, 65.0, 12.6)),
        who(5, BILLIONAIRE, [0, 0, 0], [[0, "nervous"]], "$180K", inside(4, 17.4, 10.4, 12.2, 65.5, 14.8))]; }
    case 27: case 28: return [ // round 2: one two-shot, both faces and both tags; he waves (27), you wave back (28)
      who(1, NEIGHBOR, [12.7, 0, -1.3], [[0, "fake_smile"]], "$96K", { prop: (t) => (t > BEATS.waves - 0.1 && t < 72.6 ? HOSE_UP : HOSE), reach: (t) => (t > BEATS.waves - 0.1 && t < 72.6 ? [undefined, { ex: 26, ey: -0.2, hx: 28 + 5 * Math.sin(t * 14), hy: -0.6, front: true }] : HOSE_R()), tag2: SEEN_HIM, look: -0.5 }),
      you([11.65, 0, 0.6], [[0, "fake_smile"]], { reach: (t) => (t > BEATS.wave28 - 0.1 ? POSES.wave : undefined), tag2: SEEN_YOU, look: 0.45 })];
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
/** the bank app: 300 x 560 px phone, screen "Balance $2,310 - same as yesterday" */
const phoneFace = (g: CanvasRenderingContext2D) => {
  rr(g, 0, 0, 300, 560, 44, "#23262f", INK, 10); rr(g, 18, 40, 264, 480, 18, "#f2f6fa");
  rr(g, 18, 40, 264, 92, 18, "#2f6fd6"); g.fillStyle = "#2f6fd6"; g.fillRect(18, 100, 264, 32);
  text(g, "BANK", 150, 88, 40, "#ffffff", 800, "Arial, sans-serif");
  text(g, "Balance", 150, 190, 38, "#5a6274", 700, "Arial, sans-serif");
  text(g, "$2,310", 150, 270, 78, "#1d1a3a");
  rr(g, 40, 330, 220, 64, 32, "#e3f3e8"); text(g, "same as", 150, 352, 30, "#2f8a55", 800, "Arial, sans-serif"); text(g, "yesterday", 150, 380, 30, "#2f8a55", 800, "Arial, sans-serif");
  g.fillStyle = "#d5dce4"; for (let i = 0; i < 3; i++) g.fillRect(44, 424 + i * 30, 212 - i * 40, 12);
};
const PHONE: Prop = { k: "bank17", draw: (p, h, u) => { const c = h[1]; if (!c) return; local(p, c, 0.06, 0.105 * u, (g) => { g.translate(-150, -530); phoneFace(g); }); } };
/** newspaper pages, 800 x 560 px: p1 the 2001 headline + name / income rows, p2 the happiness-gap chart */
const page1 = (g: CanvasRenderingContext2D) => {
  text(g, "2001: ALL INCOMES", 400, 70, 66, "#1d1a3a"); text(g, "ONLINE", 400, 140, 66, "#1d1a3a");
  g.fillStyle = "#9a9484"; g.fillRect(50, 186, 700, 6);
  const rows: [string, string][] = [["Ola N.", "412,000"], ["Kari H.", "389,000"], ["Per S.", "1,250,000"], ["Ingrid B.", "298,000"], ["Lars T.", "540,000"]];
  rows.forEach(([n, v], i) => { const y = 236 + i * 58; text(g, n, 90, y, 36, "#3a4256", 700, "Arial, sans-serif", "left"); text(g, v, 710, y, 36, "#1d1a3a", 800, "Arial, sans-serif", "right");
    g.fillStyle = "#c9c2ad"; g.fillRect(90, y + 26, 620, 3); });
};
const smiley = (g: CanvasRenderingContext2D, x: number, y: number, r: number, happy: boolean) => {
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = happy ? "#f2c230" : "#9fb7d6"; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke();
  g.fillStyle = INK; for (const s of [-1, 1]) { g.beginPath(); g.arc(x + s * r * 0.35, y - r * 0.2, r * 0.11, 0, Math.PI * 2); g.fill(); }
  g.beginPath(); if (happy) g.arc(x, y + r * 0.05, r * 0.5, 0.15 * Math.PI, 0.85 * Math.PI); else g.arc(x, y + r * 0.62, r * 0.42, 1.18 * Math.PI, 1.82 * Math.PI); g.lineWidth = 7; g.stroke();
};
const page2 = (g: CanvasRenderingContext2D) => {
  text(g, "HAPPINESS GAP", 400, 62, 58, "#1d1a3a"); g.fillStyle = "#9a9484"; g.fillRect(50, 106, 700, 6);
  g.fillStyle = INK; g.fillRect(90, 500, 620, 6);
  rr(g, 150, 190, 150, 310, 8, "#2fa36b", INK, 6); rr(g, 500, 360, 150, 140, 8, "#5b8eaa", INK, 6);
  smiley(g, 225, 150, 34, true); smiley(g, 575, 320, 34, false);
  text(g, "richer", 225, 530, 32, "#3a4256", 800, "Arial, sans-serif"); text(g, "poorer", 575, 530, 32, "#3a4256", 800, "Arial, sans-serif");
  g.strokeStyle = "#c62f2f"; g.lineWidth = 10; g.beginPath(); g.moveTo(400, 200); g.lineTo(400, 350); g.stroke();
  for (const [y, d] of [[200, 1], [350, -1]] as [number, number][]) { g.beginPath(); g.moveTo(380, y + d * 26); g.lineTo(400, y); g.lineTo(420, y + d * 26); g.stroke(); }
  rr(g, 318, 236, 164, 78, 14, "#ffffff", "#c62f2f", 6); text(g, "+29%", 400, 276, 56, "#c62f2f");
};
const paperSheet = (pg: (g: CanvasRenderingContext2D) => void) => (g: CanvasRenderingContext2D) => {
  g.fillStyle = "#efeadb"; g.fillRect(0, 0, 800, 560); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(0, 0, 800, 560);
  g.fillStyle = "rgba(29,26,58,0.12)"; g.fillRect(396, 0, 8, 560); pg(g); // the fold
};
const twoHand = (key: string, draw: (g: CanvasRenderingContext2D) => void): Prop => ({ k: key, draw: (p, h, u) => { const a = h[0], b = h[1]; if (!a || !b) return;
  const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], w = Math.abs(b[0] - a[0]) + 12 * u;
  // round 2: the hands grip the top corners (the sheet hangs from them, tilts with them): it read as pasted on the torso
  local(p, mid, Math.atan2(b[1] - a[1], b[0] - a[0]), w / 800, (g) => { g.translate(-400, -70); draw(g); }); } });
const PAPER1 = twoHand("paper1_17", paperSheet(page1)), PAPER2 = twoHand("paper2_17", paperSheet(page2));
/** the folded paper, in both hands, before it opens */
const PAPER_FOLD: Prop = { k: "paperfold17", draw: (p, h, u) => { const c = h[1] ?? h[0]; if (!c) return; local(p, c, -0.2, 0.09 * u, (g) => { g.translate(-60, -200);
  g.fillStyle = "#efeadb"; g.fillRect(0, 0, 400, 260); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(0, 0, 400, 260); text(g, "2001", 200, 90, 70, "#1d1a3a");
  g.fillStyle = "#c9c2ad"; for (let i = 0; i < 3; i++) g.fillRect(40, 150 + i * 30, 320, 8); }); } };
/** the paper rolled in his fist */
const ROLL: Prop = { k: "roll17", draw: (p, h, u) => { const c = h[1]; if (!c) return; local(p, c, -0.5, 0.1 * u, (g) => { g.translate(-50, -260);
  rr(g, 0, 0, 100, 320, 40, "#efeadb", INK, 8); g.fillStyle = "#c9c2ad"; for (let i = 0; i < 4; i++) g.fillRect(20, 60 + i * 50, 60, 8); }); } };
/** a bouquet: paper cone gripped in the right hand (screen left), three red / pink blooms above it */
const FLOWERS: Prop = { k: "flowers17", draw: (p, h, u) => { const c = h[0]; if (!c) return; local(p, c, -0.15, 0.13 * u, (g) => { g.translate(-130, -260);
  g.strokeStyle = "#3f7a3a"; g.lineWidth = 10; for (const x of [90, 130, 170]) { g.beginPath(); g.moveTo(130, 300); g.lineTo(x, 110); g.stroke(); }
  for (const [x, y, col] of [[80, 100, "#d4344a"], [130, 70, "#e8506a"], [180, 104, "#d4344a"], [108, 140, "#f2c230"], [156, 140, "#e8506a"]] as [number, number, string][]) {
    g.beginPath(); g.arc(x, y, 34, 0, Math.PI * 2); g.fillStyle = col; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.arc(x, y, 11, 0, Math.PI * 2); g.fillStyle = "rgba(29,26,58,0.35)"; g.fill(); }
  g.beginPath(); g.moveTo(60, 170); g.lineTo(200, 170); g.lineTo(150, 380); g.lineTo(110, 380); g.closePath(); g.fillStyle = "#f4f1ea"; g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke(); }); } };
/** the garden hose: a green tube from the card bottom up into the left hand (screen right), a brass nozzle, and the water stream */
const hoseDraw = (up: boolean) => (p: Pen, h: [number, number][], u: number) => { const c = h[1]; if (!c) return;
  const g = p.g, [hx, hy] = p.P(c[0], c[1]), [bx, by] = p.P(c[0] + 34 * u, 975);
  g.save(); g.lineCap = "round"; for (const [w, col] of [[7 * u, INK], [4.4 * u, "#3f9a4a"]] as [number, string][]) { g.beginPath(); g.moveTo(hx + 2 * u, hy + 4 * u); g.bezierCurveTo(hx + 30 * u, hy + 40 * u, bx - 20 * u, by - 60 * u, bx, by); g.lineWidth = w; g.strokeStyle = col; g.stroke(); }
  const ang = up ? -2.2 : 2.6, nx = hx + Math.cos(ang) * 16 * u, ny = hy + Math.sin(ang) * 16 * u;
  for (const [w, col] of [[7 * u, INK], [4.6 * u, "#c9a24a"]] as [number, string][]) { g.beginPath(); g.moveTo(hx, hy); g.lineTo(nx, ny); g.lineWidth = w; g.strokeStyle = col; g.stroke(); }
  g.strokeStyle = "rgba(150,205,240,0.9)"; g.lineWidth = 2.6 * u; g.setLineDash([7 * u, 5 * u]);
  for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(nx, ny); g.quadraticCurveTo(nx + Math.cos(ang) * 40 * u + k * 4 * u, ny + Math.sin(ang) * 40 * u - (up ? 0 : 20 * u), nx + Math.cos(ang) * 70 * u + k * 8 * u, ny + Math.sin(ang) * 30 * u + (up ? 50 * u : 60 * u)); g.stroke(); }
  g.restore(); };
const HOSE: Prop = { k: "hose17", draw: hoseDraw(false) }, HOSE_UP: Prop = { k: "hoseup17", draw: hoseDraw(true) };

// ---------------- the salary tag ----------------
/** 520 x 220 px pill (two lines: 520 x 300): white, navy rim, bold navy amount, small grey second line */
const tagDraw = (amt: string, line2?: string, glow = false) => (p: Pen) => {
  const g = p.g, H = line2 ? 300 : 220;
  g.save(); g.shadowColor = glow ? "rgba(255,226,150,0.9)" : "rgba(29,26,58,0.35)"; g.shadowBlur = glow ? 12 : 16; g.shadowOffsetY = glow ? 0 : 8;
  rr(g, 18, 14, 484, H - 36, (H - 36) / 2 > 92 ? 92 : (H - 36) / 2, glow ? "#fffbea" : "#ffffff"); g.restore();
  rr(g, 18, 14, 484, H - 36, (H - 36) / 2 > 92 ? 92 : (H - 36) / 2, "rgba(0,0,0,0)", INK, 9);
  text(g, amt, 260, line2 ? 98 : 112, 116, INK);
  if (line2) text(g, line2, 260, 214, line2.length > 14 ? 38 : 46, "#6a7080", 800, `"Segoe UI", Arial, sans-serif`);
};
const ellPx = (p: Pen, c: string, edge = "rgba(255,240,200,0)") => { const g = p.g, r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, c); r.addColorStop(1, edge); g.fillStyle = r; g.fillRect(0, 0, 128, 128); };
const SU = 0.00216;
/** crown height over the act's feet (m), toon.ts bean builds: stand (1 + torso + legs) HH, sit (1.2 + torso) HH + seat */
const crown = (a: TA) => { const o = a.o, HH = 2 * 0.94 * (o.build === "kid" ? 112 : 118), T = o.build === "kid" ? [0.85, 1.0] : o.build === "stout" ? [1.15, 1.32] : [1.1, 1.4];
  const h = a.mode === "sit" ? (1.2 + T[0]) * HH * SU + (a.seat ?? 0) : (1 + T[0] + T[1]) * HH * SU; return h + (o.sprout ? 0.07 : 0) + (o.bun ? 0.05 : 0); };
const night = (id: number) => SHOTS[id - 1].light === "night";
const tags = (id: number, t: number, out: Stage) => {
  for (const a of ACTS(id)) {
    if (!a.tag) continue;
    const at = a.path ? a.path(t) : a.at; if (!at) continue;
    const l2 = typeof a.tag2 === "function" ? a.tag2(t) : a.tag2, glow = night(id);
    const k = a.pop ? clamp01((t - a.pop) / 0.18) : 1; if (k <= 0) continue;
    const pk = a.pop && k < 1 ? 1 + 0.25 * Math.sin(k * Math.PI) : 1, s = q(k * pk, 16);
    const ring = id === 3 && a.i === 0 && t > BEATS.salary ? Math.max(0, 1 - (t - BEATS.salary) / 0.7) : 0;
    const y = at[1] + crown(a) + 0.36 + 0.02 * Math.sin(t * Math.PI + a.i * 1.7) + (l2 ? 0.04 : 0), w = 0.46 * s, h = (l2 ? 0.265 : 0.195) * s;
    out.fx.push({ key: `tag|${a.tag}|${l2 ?? ""}|${glow}`, cw: 520, ch: l2 ? 300 : 220, draw: tagDraw(a.tag, l2, glow), x: at[0], y, z: at[2] + 0.02, w, h, noFog: glow, rot: q(0.1 * ring * Math.sin(t * 40), 24) });
    if (glow) out.fx.push({ key: "tagglow", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, "rgba(255,222,150,0.3)"), x: at[0], y, z: at[2] - 0.02, w: 0.95 * s, h: 0.6 * s, noFog: true });
    if (ring > 0) out.fx.push({ key: `ring|${q(ring, 8)}`, cw: 256, ch: 128, soft: true, draw: (p) => { const g = p.g; g.strokeStyle = `rgba(255,255,255,${q(ring, 8)})`; g.lineWidth = 8; g.beginPath(); g.ellipse(128, 64, 120, 58, 0, 0, Math.PI * 2); g.stroke(); },
      x: at[0], y, z: at[2] + 0.03, w: 0.46 + 0.3 * (1 - ring), h: 0.22 + 0.14 * (1 - ring) });
  }
};

// ---------------- night lights: windows, lamps, the porch ----------------
type Win = { x: number; y: number; z: number; n: 1 | -1; w: number; h: number; i: number };
const WINS: Win[] = (() => { const out: Win[] = []; let i = 0;
  for (const [cx, z] of [[0, -4], [12, -4.5], [-12, -4.5], [-24, -4.5], [24, -4.5], [36, -4.5]] as number[][]) for (const dx of [-2.5, 2.5]) for (const y of [1.55, 4.15]) out.push({ x: cx + dx, y, z: z + 0.1, n: 1, w: 1.08, h: 1.02, i: i++ });
  for (const cx of [-30, -18, -6, 6, 18, 30]) for (const dx of [-2.6, 2.6]) for (const y of [1.8, 4.8]) out.push({ x: cx + dx, y, z: 12.4, n: -1, w: 1.45, h: 1.35, i: i++ });
  return out; })();
const lit = (w: Win) => ((w.i * 37) % 10) < 7 && !(w.x === -2.5 && w.y === 1.55); // most windows lit; yours by the porch stays dark
/** a lit window; laptop = a figure at a glowing laptop with a tiny tag over its head (19) */
const winDraw = (laptop: boolean) => (p: Pen) => { const g = p.g; const r = g.createLinearGradient(0, 0, 0, 200); r.addColorStop(0, "#ffe2a0"); r.addColorStop(1, "#f2b860");
  g.fillStyle = r; g.fillRect(0, 0, 200, 200); g.fillStyle = "rgba(90,50,30,0.35)"; g.fillRect(96, 0, 8, 200); g.fillRect(0, 96, 200, 8);
  if (laptop) { g.fillStyle = "#3a2a3a"; g.beginPath(); g.arc(100, 92, 26, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(100, 170, 56, 46, 0, Math.PI, 0); g.fill();
    g.fillStyle = "#9fd3f0"; g.fillRect(64, 150, 72, 44); g.fillStyle = "#ffffff"; g.beginPath(); g.roundRect(78, 34, 44, 20, 10); g.fill(); } };
const lights = (id: number, t: number, out: Stage) => {
  if (!night(id)) return;
  for (const w of WINS) {
    if (!lit(w) && id !== 24) continue; // 24: every window starts lit, so the dark-out reads
    if (id === 24 && t > 65.3 + 0.07 * ((w.i * 13) % 17)) continue; // windows go dark one by one
    out.fx.push({ key: `win|${id === 19 && w.n < 0 && w.i % 3 === 0}`, cw: 200, ch: 200, draw: winDraw(id === 19 && w.n < 0 && w.i % 3 === 0), x: X(w.x), y: w.y, z: w.z + 0.03 * w.n, w: w.w, h: w.h, face: [0, 0, w.n], noFog: true });
  }
  for (const x of [-7, 7, -21, 21, 35]) {
    out.fx.push({ key: "lampglow", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, "rgba(255,226,160,1)"), x: X(x), y: 4.55, z: 2.4, w: 1.5, h: 1.5, noFog: true });
    out.fx.push({ key: "lamppool", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, "rgba(255,214,140,0.42)"), x: X(x), y: 0.075, z: 2.0, w: 5.5, h: 4.5, flat: true, noFog: true });
  }
  out.fx.push({ key: "lampglow", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, "rgba(255,226,160,1)"), x: X(0), y: 2.7, z: -3.3, w: 0.8, h: 0.8, noFog: true }); // the porch light
  out.fx.push({ key: "porchpool", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, "rgba(255,214,140,0.45)"), x: X(0), y: 0.43, z: -3.2, w: 3.0, h: 1.4, flat: true, noFog: true });
  out.fx.push({ key: "porchpool2", cw: 128, ch: 128, soft: true, draw: (p) => ellPx(p, "rgba(255,214,140,0.35)"), x: X(0), y: 0.07, z: -2.0, w: 3.6, h: 2.4, flat: true, noFog: true });
};
const mugDraw = (p: Pen) => { const g = p.g; rr(g, 20, 20, 90, 100, 10, "#2f8f9d", INK, 8); g.lineWidth = 9; g.strokeStyle = INK; g.beginPath(); g.arc(112, 70, 24, -1.2, 1.2); g.stroke(); };
const trayDraw = (p: Pen) => { const g = p.g; rr(g, 10, 30, 380, 120, 20, "#7aa7c7", INK, 8); g.fillStyle = "#f1e2b8"; g.beginPath(); g.ellipse(120, 80, 60, 30, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = "#d9423a"; g.beginPath(); g.arc(280, 76, 34, 0, Math.PI * 2); g.fill(); g.stroke(); };

export const fx = (id: number, t: number, out: Stage) => {
  tags(id, t, out);
  lights(id, t, out);
  if (id === 9 && t >= BEATS.mug) out.fx.push({ key: "mug17", cw: 140, ch: 140, draw: mugDraw, x: X(OF - 1.35), y: 0.83, z: -2.82, w: 0.12, h: 0.12 });
  if (id === 13 && t >= BEATS.sit13) out.fx.push({ key: "tray17", cw: 400, ch: 180, draw: trayDraw, x: X(CF + 5.75), y: 0.79, z: -2.45, w: 0.46, h: 0.2, flat: true, rot: 0.1 });
  if (id === 18 && t < BEATS.paper18) out.fx.push({ key: "paperflat17", cw: 400, ch: 260, draw: (p) => { const g = p.g; g.fillStyle = "#efeadb"; g.fillRect(0, 0, 400, 260); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(0, 0, 400, 260); text(g, "2001", 200, 90, 70, "#1d1a3a"); },
    x: X(0.55), y: 0.42, z: -3.05, w: 0.36, h: 0.24, flat: true, rot: 0.3 });
};
