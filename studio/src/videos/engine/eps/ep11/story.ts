// What If ep11 "What If You Could Photosynthesize?" (2026-11-07). Times in seconds from public/eps/ep11/words.json
// (Chatterbox, last word ends 64.42 s). bible/episodes/ep11/SCRIPT.md has the facts. insert = 2D card.
import type { SetId } from "../../sets";
import { F, M, CamSpec, Light, Move, ShotDef, Size } from "../../shot";

export const TOTAL = F(65.5); // voice ends 64.42 s + a hold on the question

const S = (id: number, a: number, b: number, set: SetId, cam: CamSpec, size: Size, light: Light = "day", extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set, cam, size, light, ...extra });
const I = (id: number, a: number, b: number, insert: string): ShotDef => S(id, a, b, "park", { cam: "wide" }, "wide", "day", { insert });

export const SHOTS: ShotDef[] = [
  S(1, 0, 4.3, "park", { local: [0.0, 1.2, 4.8], lookAt: [-0.32, 0.85, 0], fov: 44 }, "mid"),                       // hook: green you, 1 % HUD, one bite on a plate
  S(2, 4.3, 6.45, "kitchen", { local: [-0.2, 1.35, 2.9], lookAt: [-0.3, 0.95, -0.6], fov: 44 }, "mid", "window"),  // stares at green hands
  S(3, 6.45, 8.4, "kitchen", { local: [0.9, 1.3, 2.4], lookAt: [0.6, 1.0, -1.6], fov: 46 }, "mid", "window"),      // sunbeam through the window, sun -> toast
  S(4, 8.4, 9.5, "kitchen", { local: [-0.6, 1.35, 2.9], lookAt: [-0.7, 0.95, -0.6], fov: 44 }, "mid", "window"),   // pushes the breakfast plate away
  S(5, 9.5, 10.7, "park", { local: [0.6, 1.2, 5.4], lookAt: [-0.2, 0.85, 0], fov: 46 }, "mid"),                    // steps out into the sun
  S(6, 10.7, 14.1, "park", { local: [0.2, 1.0, 5.6], lookAt: [0, 1.75, 0], fov: 52 }, "wide"),                      // sun sweeps, clock spins, arms wide
  S(7, 14.1, 15.95, "park", { local: [1.0, 1.3, 3.8], lookAt: [0.66, 0.95, 0], fov: 44 }, "mid"),                   // beside a solar panel
  S(8, 15.95, 21.1, "park", { local: [0.5, 1.15, 3.4], lookAt: [0.2, 1.0, 0], fov: 42 }, "mid"),                   // checks the bar: 1 %
  I(9, 21.1, 27.5, "leaf"),                                                                                        // 2 % to food, the rest bounces
  S(10, 27.5, 33.95, "park", { local: [-2.4, 1.3, 6.5], lookAt: [-3.6, 3.6, -4], fov: 62 }, "wide", "day", { angle: "low" }), // the tree: NO BRAIN
  I(11, 33.95, 40.1, "brain"),                                                                                     // a fifth of the bar, the 2 m2 sheet
  S(12, 40.1, 44.3, "park", { local: [12, 6.5, 12.5], lookAt: [12, 0, 3], fov: 62 }, "wide", "day", { angle: "high" }), // skin rolls across the court
  I(13, 44.3, 50.15, "slug"),                                                                                      // the slug eats algae, keeps the cells
  I(14, 50.15, 55.4, "growth"),                                                                                    // months, no meal, GROWTH: NO
  S(15, 55.4, 57.75, "park", { local: [-0.6, 1.1, 5.0], lookAt: [-0.3, 0.85, 0], fov: 46 }, "mid"),      // sunset, walks in
  S(16, 57.75, 59.85, "kitchen", { local: [-0.8, 1.35, 2.7], lookAt: [-0.7, 1.0, -0.6], fov: 44 }, "mid", "window"), // toast pops, one bite
  S(17, 59.85, 62.7, "kitchen", { local: [-0.5, 1.3, 2.6], lookAt: [-0.55, 1.05, -0.6], fov: 42 }, "mid", "window"), // HUD falls to 0
  S(18, 62.7, 65.5, "park", { local: [0.4, 1.3, 3.6], lookAt: [0.05, 1.0, 0], fov: 42 }, "mid"),         // would you still go green?
];

export const XFADE: Record<number, number> = {};
export const FLASH_AT = F(4.3); // end of the hook
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const KICKS = [F(19.0), F(59.3)]; // "percent", the bite
export const MOVES: Record<number, Move[]> = {
  1: [M("push", 3.2, 16, 0.08)],     // "one bite"
  2: [M("push", 5.7, 12, 0.08)],     // "green"
  8: [M("push", 18.4, 14, 0.08)],    // "one percent"
  17: [M("push", 60.8, 16, 0.08)],   // "everything"
  18: [M("push", 63.8, 16, 0.06)],   // "go green"
};
export const HOLD: Record<number, number> = {};

/** no green-removal in this episode */
export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });

export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
