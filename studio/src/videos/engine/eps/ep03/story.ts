// What If ep03 "What If Leveling Up Cost You Years of Your Life?" (1:30, 2026-11-05). Times in seconds from
// public/eps/ep03/words.json (Chatterbox, 95.5 s). bible/episodes/ep03/SCRIPT.md has the facts. insert = 2D card (inserts.tsx).
import type { SetId } from "../../sets";
import { F, M, CamSpec, Light, Move, ShotDef, Size } from "../../shot";

export const TOTAL = F(97.0); // voice ends 95.5 s + a hold on the question

const S = (id: number, a: number, b: number, set: SetId, cam: CamSpec, size: Size, light: Light = "day", extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set, cam, size, light, ...extra });
const I = (id: number, a: number, b: number, insert: string): ShotDef => S(id, a, b, "forest", { cam: "wide" }, "wide", "day", { insert });

export const SHOTS: ShotDef[] = [
  S(1, 0, 6.5, "yard", { local: [-0.8, 1.2, 3.9], lookAt: [-1.0, 1.15, 0.6], fov: 42 }, "mid"),                  // teenagers: the richest people on Earth
  S(2, 6.5, 12.1, "home", { local: [0.9, 1.5, 3.4], lookAt: [0.4, 1.3, -0.9], fov: 42 }, "mid", "window"),        // a glowing menu: +1 level, -1 year
  I(3, 12.1, 19.0, "deal"),                                                                                         // ten percent better, the year comes off the end
  S(4, 19.0, 21.6, "home", { local: [0.5, 1.45, 1.9], lookAt: [0.4, 1.4, -0.9], fov: 40 }, "close", "window"),   // so of course you take it. Then another
  S(5, 21.6, 28.5, "yard", { local: [-4.6, 1.3, 4.6], lookAt: [-4.6, 1.1, 0.6], fov: 46 }, "mid"),               // marathon, three languages, ten years shorter
  I(6, 28.5, 33.4, "math"),                                                                                         // the whole world is doing the math
  S(7, 33.4, 39.9, "yard", { local: [-0.6, 1.2, 4.2], lookAt: [-1.0, 1.15, 0.6], fov: 44 }, "mid"),               // teenagers become superheroes
  S(8, 39.9, 45.7, "home", { local: [0.3, 1.45, 3.4], lookAt: [0.2, 1.15, -0.6], fov: 42 }, "mid", "window"),     // grandma guards five years like gold
  S(9, 45.7, 53.6, "yard", { local: [-0.8, 1.3, 4.0], lookAt: [-1.0, 1.25, 0.6], fov: 42 }, "mid"),               // gold medal, very short retirement
  I(10, 53.6, 57.0, "bank"),                                                                                        // loans in years, with interest
  I(11, 57.0, 71.2, "discount"),                                                                                    // brains discount the future / credit cards
  S(12, 71.2, 75.4, "forest", { local: [0.2, 1.4, 4.4], lookAt: [0.2, 1.1, -0.8], fov: 44 }, "wide"),             // nature already plays this game
  I(13, 75.4, 92.5, "dogs"),                                                                                        // Great Dane vs Chihuahua, +2 kg = -1 month
  S(14, 92.5, TOTAL / 30, "home", { local: [0.6, 1.45, 2.0], lookAt: [0.4, 1.4, -0.9], fov: 40 }, "close", "window"), // how many levels would you buy?
];

export const XFADE: Record<number, number> = {};
export const FLASH_AT = F(6.5); // end of the hook
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const KICKS = [F(20.04), F(20.92)]; // "take" / "another": two level-ups land
export const MOVES: Record<number, Move[]> = {
  1: [M("push", 4.6, 16, 0.08)],     // "richest"
  2: [M("push", 8.8, 18, 0.08)],     // "menu"
  5: [M("truck", 21.8, 156, 0.56)],  // follow the run
  7: [M("push", 37.6, 14, 0.1)],     // "superheroes"
  8: [M("push", 44.1, 16, 0.08)],    // "guards"
  9: [M("push", 52.5, 12, 0.1)],     // "retirement"
  12: [M("push", 73.2, 30, 0.06)],
  14: [M("push", 94.4, 16, 0.08)],   // "buy"
};
export const HOLD: Record<number, number> = {};

/** no green-removal in this episode */
export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });

export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
