// What If ep01 "What If Green Didn't Exist?" (1:30 cut, 2026-11-05). Times in seconds from public/eps/ep01/words.json
// (Chatterbox, 95.2 s). bible/episodes/ep01/SCRIPT.md has the facts. insert = a full-screen 2D card (inserts.tsx).
import type { SetId } from "../../sets";
import { F, M, CamSpec, Light, Move, ShotDef, Size, clamp01, smooth } from "../../shot";

export const TOTAL = F(96.8); // voice ends 95.2 s + a hold on the green forest

const S = (id: number, a: number, b: number, set: SetId, cam: CamSpec, size: Size, light: Light = "day", extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set, cam, size, light, ...extra });
const I = (id: number, a: number, b: number, insert: string): ShotDef => S(id, a, b, "forest", { cam: "wide" }, "wide", "day", { insert });

export const SHOTS: ShotDef[] = [
  S(1, 0, 6.2, "forest", { local: [0, 9, 14], lookAt: [0, 2, -18], fov: 50 }, "wide", "day", { angle: "high" }),   // forests turn black
  S(2, 6.2, 11.6, "home", { local: [1.9, 1.45, 2.2], lookAt: [0.8, 1.35, -2.8], fov: 44 }, "mid", "window"),        // opening your curtains
  I(3, 11.6, 18.1, "prism"),                                                                                           // red + blue = pink
  S(4, 18.1, 23.2, "yard", { local: [-2.6, 1.3, 2.4], lookAt: [2.4, 0.7, -3.4], fov: 46 }, "wide"),                 // neighbor mowing a black carpet
  I(5, 23.2, 29.6, "phone"),                                                                                           // phone turns purple
  S(6, 29.6, 37.2, "yard", { local: [4.4, 1.5, 6.2], lookAt: [7.4, 1.7, 0.6], fov: 46 }, "mid"),                    // red, yellow, nothing
  I(7, 37.2, 44.0, "eye"),                                                                                             // a quarter of sunlight, seen best
  S(8, 44.0, 51.0, "forest", { local: [0.7, 1.7, 2.3], lookAt: [1.1, 1.6, 0.0], fov: 40 }, "close"),               // black parrot, black leaf
  S(9, 51.0, 54.0, "yard", { local: [-1.2, 1.25, 2.6], lookAt: [-1.4, 1.1, -1.2], fov: 40 }, "mid"),                // the part that hurts
  I(10, 54.0, 58.2, "sunpie"),                                                                                         // a tenth of the sun's energy
  I(11, 58.2, 64.0, "thermo"),                                                                                         // eight degrees colder
  I(12, 64.0, 71.8, "loop"),                                                                                           // snow spreads until it all freezes
  S(13, 71.8, 75.9, "snow", { local: [-0.6, 1.4, 3.4], lookAt: [0.6, 1.3, -0.9], fov: 42 }, "mid"),                 // the black trees are still growing
  I(14, 75.9, 91.4, "leaf"),                                                                                           // why leaves are green
  S(15, 91.4, TOTAL / 30, "forest", { local: [0, 1.4, 5.0], lookAt: [0, 2.0, -3], fov: 48 }, "wide"),              // green returns: the part they gave us
];

export const XFADE: Record<number, number> = {};
export const FLASH_AT = F(6.2); // end of the hook
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const KICKS: number[] = [];
export const MOVES: Record<number, Move[]> = {
  1: [M("crane", 0.3, 160, -0.18)],
  2: [M("push", 8.6, 20, 0.08)],     // "glowing pink"
  4: [M("truck", 18.4, 120, 0.06)],
  6: [M("push", 35.0, 14, 0.08)],    // "nothing means go"
  8: [M("push", 47.0, 14, 0.1)],     // "camouflage"
  9: [M("push", 52.4, 16, 0.1)],     // "hurts"
  13: [M("push", 74.4, 16, 0.12)],   // "still growing"
  15: [M("crane", 91.6, 120, 0.1)],
};
export const HOLD: Record<number, number> = {};

/** green removed: 0 = normal, 1 = no green light. Hook: the change sweeps down from the horizon; payoff: green returns. */
export const noGreenAt = (f: number): { amt: number; wipe: number } => {
  const t = f / 30;
  if (t < 6.2) return { amt: 1, wipe: clamp01((t - 1.6) / 4.0) };
  if (t < 91.6) return { amt: 1, wipe: -1 };
  return { amt: 1 - smooth((t - 91.6) / 2.4), wipe: -1 };
};

export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
