// What If ep07 "What If You Could Shrink Yourself With a Dial?" (~1:03 after 1.1x, 2026-11-06). Times in seconds from
// public/eps/ep07/words.json (Chatterbox, last word ends 68.37 s). bible/episodes/ep07/SCRIPT.md has the facts.
// counter / floor = the x170 world (you are 1 cm), kitchen = full size. insert = 2D card.
import type { SetId } from "../../sets";
import { F, M, CamSpec, Light, Move, ShotDef, Size } from "../../shot";

export const TOTAL = F(69.5); // voice ends 68.37 s + a hold on the question

const S = (id: number, a: number, b: number, set: SetId, cam: CamSpec, size: Size, light: Light = "day", extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set, cam, size, light, ...extra });
const I = (id: number, a: number, b: number, insert: string): ShotDef => S(id, a, b, "counter", { cam: "wide" }, "wide", "day", { insert });

export const SHOTS: ShotDef[] = [
  S(1, 0, 5.2, "counter", { local: [6.5, 1.0, 7.0], lookAt: [-0.8, -0.4, 2.5], fov: 50 }, "mid"),                  // hook: you on the cliff edge, a crumb, the clock near 12
  S(2, 5.2, 10.6, "counter", { local: [2.2, 1.6, 9.0], lookAt: [-0.6, 4.0, -3.0], fov: 50 }, "mid", "day", { cap: "top" }),                // the wrist dial clicks down, you shrink, the mug towers
  S(3, 10.6, 13.0, "counter", { local: [6.5, 0.8, 7.4], lookAt: [0.3, -1.2, 3.4], fov: 50 }, "mid"),                 // you step off the counter edge
  S(4, 13.0, 16.8, "floor", { local: [2.0, 5.5, 10.5], lookAt: [0.5, 1.0, -0.5], fov: 48 }, "wide", "day", { angle: "high" }),                  // drift down like a leaf, land unhurt
  I(5, 16.8, 23.6, "cube"),                                                                                         // skin by the square, weight by the cube
  I(6, 23.6, 29.15, "dust"),                                                                                        // five million times lighter: a dust speck
  I(7, 29.15, 35.7, "heat"),                                                                                        // heat x170 per gram
  I(8, 35.7, 40.9, "shrew"),                                                                                        // eat like a shrew
  S(9, 40.9, 43.6, "counter", { local: [-0.5, 1.3, 5.2], lookAt: [-1.3, 1.0, -0.5], fov: 42 }, "mid"),             // shiver beside the crumb, the cold wins
  S(10, 43.6, 46.6, "counter", { local: [5.63, 4.2, 15.0], lookAt: [3.2, 12.0, -2.2], fov: 76 }, "wide", "day", { angle: "low" }), // the tap drips
  S(11, 46.6, 50.0, "counter", { local: [3.9, 1.2, 3.4], lookAt: [3.2, 1.0, -2.0], fov: 40 }, "mid"),              // the drop wraps you
  S(12, 50.0, 56.3, "floor", { local: [1.4, 1.85, 6.6], lookAt: [0.5, 1.0, 0.4], fov: 46 }, "mid"),                  // you shout: too high to hear
  S(13, 56.3, 60.3, "floor", { local: [2.8, 1.9, 12.0], lookAt: [2.8, 2.0, -1.2], fov: 54 }, "wide"),                // only the cat can
  S(14, 60.3, 62.25, "floor", { local: [1.4, 1.85, 6.6], lookAt: [0.5, 1.0, 0.4], fov: 46 }, "mid"),                 // spin the dial back up
  S(15, 62.25, 65.85, "kitchen", { local: [0.4, 1.4, 3.2], lookAt: [0.3, 1.15, -0.9], fov: 42 }, "mid", "window"),  // full size: a giant lunch
  S(16, 65.85, 69.5, "kitchen", { local: [0.6, 1.45, 2.4], lookAt: [0.15, 1.3, -0.9], fov: 40 }, "close", "window"), // how small would you dare to go?
];

export const XFADE: Record<number, number> = {};
export const FLASH_AT = F(5.2); // end of the hook
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const KICKS = [F(15.15), F(46.7)]; // "land", "wraps"
export const MOVES: Record<number, Move[]> = {
  1: [M("push", 3.8, 16, 0.08)],     // "starve"
  2: [M("push", 9.1, 14, 0.08)],     // "one centimetre"
  3: [M("push", 11.3, 12, 0.06)],    // "step off"
  9: [M("push", 42.5, 12, 0.08)],    // "the cold wins"
  11: [M("push", 48.8, 14, 0.08)],   // "can't lift"
  12: [M("push", 53.9, 14, 0.08)],   // "so high"
  13: [M("push", 59.3, 16, 0.08)],   // "very interested"
  15: [M("push", 64.6, 14, 0.08)],   // "giant lunch"
  16: [M("push", 67.4, 16, 0.06)],   // "dare"
};
export const HOLD: Record<number, number> = {};

/** no green-removal in this episode */
export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });

export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
