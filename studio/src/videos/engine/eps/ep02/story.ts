// What If ep02 "What If You Could Change Your Weight Like Volume?" (1:30, 2026-11-05). Times in seconds from
// public/eps/ep02/words.json (Chatterbox, 88.8 s). bible/episodes/ep02/SCRIPT.md has the facts. insert = 2D card (inserts.tsx).
import type { SetId } from "../../sets";
import { F, M, CamSpec, Light, Move, ShotDef, Size } from "../../shot";

export const TOTAL = F(90.3); // voice ends 88.8 s + a hold on the question

const S = (id: number, a: number, b: number, set: SetId, cam: CamSpec, size: Size, light: Light = "day", extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set, cam, size, light, ...extra });
const I = (id: number, a: number, b: number, insert: string): ShotDef => S(id, a, b, "yard", { cam: "wide" }, "wide", "day", { insert });

export const SHOTS: ShotDef[] = [
  S(1, 0, 6.0, "yard", { local: [-1.0, 1.0, 3.6], lookAt: [-1.35, 2.1, -1.2], fov: 50 }, "wide", "day", { angle: "low" }), // below 80 g you float away
  S(2, 6.0, 11.1, "home", { local: [0.6, 1.4, 1.7], lookAt: [0.45, 1.25, -0.9], fov: 40 }, "close", "window"),             // a dial on your wrist
  S(3, 11.1, 17.2, "home", { local: [0.4, 1.5, 5.0], lookAt: [0.35, 1.3, -0.8], fov: 46 }, "wide", "window"),             // half weight: trampoline
  S(4, 17.2, 21.9, "yard", { local: [3.0, 1.4, 6.0], lookAt: [3.6, 3.0, -5.0], fov: 52 }, "wide", "day", { angle: "low" }), // jump onto the roof
  S(5, 21.9, 27.6, "yard", { local: [-0.9, 1.3, 6.5], lookAt: [-0.9, 0.9, 0.6], fov: 44 }, "mid"),                       // shoes skid like ice
  I(6, 27.6, 32.9, "wind"),                                                                                                // wind pushes as hard as gravity
  S(7, 32.9, 37.0, "yard", { local: [2.0, 1.6, 11.0], lookAt: [2.0, 1.3, 3.0], fov: 50 }, "wide"),                        // blown down the street
  I(8, 37.0, 44.4, "float"),                                                                                               // lighter than the air you push aside
  S(9, 44.4, 46.2, "home", { local: [0.6, 1.4, 1.9], lookAt: [0.45, 1.2, -0.9], fov: 40 }, "close", "window"),            // turning it up is worse
  S(10, 46.2, 51.3, "yard", { local: [-0.9, 1.3, 2.9], lookAt: [-1.4, 1.2, -1.2], fov: 42 }, "mid"),                      // twice: a second person on your back
  S(11, 51.3, 56.8, "yard", { local: [-0.4, 1.2, 2.8], lookAt: [-0.6, 0.8, -1.4], fov: 42 }, "mid"),                      // ten times: the chair explodes
  I(12, 56.8, 59.1, "elevator"),                                                                                           // the elevator refuses to move
  I(13, 59.1, 68.6, "pull"),                                                                                               // weight = how hard Earth pulls
  S(14, 68.6, 73.0, "yard", { local: [-1.2, 1.3, 1.4], lookAt: [-1.4, 1.2, -1.2], fov: 38 }, "close"),                   // Earth already has a tiny dial
  I(15, 73.0, 82.0, "equator"),                                                                                            // half a percent at the equator
  S(16, 82.0, 86.2, "home", { local: [0.5, 1.4, 2.4], lookAt: [0.4, 1.1, -0.9], fov: 42 }, "mid", "window"),             // the easiest diet: a plane ticket
  S(17, 86.2, TOTAL / 30, "yard", { local: [-1.3, 1.35, 1.6], lookAt: [-1.4, 1.2, -1.2], fov: 40 }, "close"),            // which way would you turn it?
];

export const XFADE: Record<number, number> = {};
export const FLASH_AT = F(6.0); // end of the hook
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const KICKS = [F(19.6), F(55.45)]; // take-off, the chair explodes
export const MOVES: Record<number, Move[]> = {
  1: [M("crane", 3.3, 80, 0.12)],     // rise with him
  2: [M("push", 9.2, 14, 0.08)],      // "quarter turn"
  4: [M("crane", 19.6, 40, 0.1)],     // follow the jump up
  5: [M("truck", 22.0, 160, 0.1)],    // slide along with him
  7: [M("truck", 33.0, 110, 0.18)],   // chase the tumble
  11: [M("push", 55.3, 10, 0.08)],    // "explode"
  14: [M("push", 71.0, 18, 0.08)],    // "tiny version"
  17: [M("push", 87.4, 20, 0.06)],    // "which way"
};
export const HOLD: Record<number, number> = {};

/** no green effect in this episode */
export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });

export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
