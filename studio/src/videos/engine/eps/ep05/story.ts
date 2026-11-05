// What If ep05 "What If Everyone on Earth Ground Their Teeth at the Same Time?" (~1:05 after 1.1x, 2026-11-05). Times in
// seconds from public/eps/ep05/words.json (Chatterbox, 80.4 s). bible/episodes/ep05/SCRIPT.md has the facts. insert = 2D card.
import type { SetId } from "../../sets";
import { F, M, CamSpec, Light, Move, ShotDef, Size } from "../../shot";

export const TOTAL = F(81.5); // voice ends 80.4 s + a hold on the question

const S = (id: number, a: number, b: number, set: SetId, cam: CamSpec, size: Size, light: Light = "day", extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set, cam, size, light, ...extra });
const I = (id: number, a: number, b: number, insert: string): ShotDef => S(id, a, b, "yard", { cam: "wide" }, "wide", "day", { insert });

const YARD_MID: CamSpec = { local: [-0.6, 1.2, 4.4], lookAt: [-0.9, 1.15, 0.6], fov: 44 };
const HOME_CLOSE: CamSpec = { local: [0.6, 1.45, 1.9], lookAt: [0.4, 1.35, -0.9], fov: 40 };

export const SHOTS: ShotDef[] = [
  S(1, 0, 7.4, "yard", { local: [-0.9, 1.25, 6.2], lookAt: [-0.9, 1.1, 0.4], fov: 46 }, "mid"),                                                                             // everyone grinds; the loudest is you
  S(2, 7.4, 10.9, "home", HOME_CLOSE, "close", "window"),                                                            // three, two, one, grind
  S(3, 10.9, 14.8, "home", { local: [0.5, 1.5, 1.6], lookAt: [0.4, 1.45, -0.9], fov: 38 }, "close", "window"),      // gravel in a blender
  I(4, 14.8, 18.5, "skull"),                                                                                          // the skull carries the sound
  S(5, 18.5, 21.8, "yard", YARD_MID, "mid"),                                                                          // the neighbour hears a squeak
  I(6, 21.8, 29.5, "fade"),                                                                                           // eight billion squeaks, no roar
  S(7, 29.5, 33.3, "home", HOME_CLOSE, "close", "window"),                                                           // a hard bite: seventy kilos
  I(8, 33.3, 38.0, "pyramids"),                                                                                       // a hundred Great Pyramids
  S(9, 38.0, 44.3, "forest", { local: [0.3, 1.3, 4.0], lookAt: [0.3, 1.1, -0.6], fov: 44 }, "mid"),                 // Earth doesn't feel a thing
  I(10, 44.3, 56.1, "enamel"),                                                                                        // enamel: hardest, can't grow back
  S(11, 56.1, 59.0, "yard", YARD_MID, "mid"),                                                                         // this is already happening
  S(12, 59.0, 66.2, "home", { local: [0.6, 1.3, 3.0], lookAt: [0.4, 1.0, -0.9], fov: 42 }, "mid", "lamp"),          // one in eight adults, asleep
  I(13, 66.2, 73.5, "count"),                                                                                         // hundreds of millions sanding away
  S(14, 73.5, 77.6, "home", HOME_CLOSE, "close", "window"),                                                          // sore jaw: the night shift
  S(15, 77.6, TOTAL / 30, "yard", { local: [-1.1, 1.35, 1.9], lookAt: [-1.0, 1.25, 0.6], fov: 40 }, "close"),        // did you just clench your jaw?
];

export const XFADE: Record<number, number> = {};
export const FLASH_AT = F(7.4); // end of the hook
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const KICKS = [F(10.23), F(29.97)]; // "grind", "bite"
export const MOVES: Record<number, Move[]> = {
  1: [M("push", 4.2, 16, 0.08)],     // "loudest"
  2: [M("push", 9.9, 14, 0.08)],     // "grind"
  3: [M("push", 13.0, 12, 0.08)],    // "gravel"
  7: [M("push", 31.9, 12, 0.08)],    // "seventy"
  9: [M("push", 40.3, 14, 0.08)],    // "jaw"
  11: [M("push", 57.6, 14, 0.08)],   // "already"
  12: [M("push", 61.0, 16, 0.08)],   // "grinds"
  14: [M("push", 76.4, 14, 0.08)],   // "night shift"
  15: [M("push", 79.3, 16, 0.06)],   // "clench"
};
export const HOLD: Record<number, number> = {};

/** no green-removal in this episode */
export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });

export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
