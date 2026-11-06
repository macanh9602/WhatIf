// What If ep08 "What If You Could Breathe Underwater?" (~1:06 after 1.1x, 2026-11-06). Times in seconds from
// public/eps/ep08/words.json (Chatterbox, last word ends 71.36 s). bible/episodes/ep08/SCRIPT.md has the facts. insert = 2D card.
import type { SetId } from "../../sets";
import { F, M, CamSpec, Light, Move, ShotDef, Size } from "../../shot";

export const TOTAL = F(72.5); // voice ends 71.36 s + a hold on the question

const S = (id: number, a: number, b: number, set: SetId, cam: CamSpec, size: Size, light: Light = "day", extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set, cam, size, light, ...extra });
const I = (id: number, a: number, b: number, insert: string): ShotDef => S(id, a, b, "beach", { cam: "wide" }, "wide", "day", { insert });

/** high over the tub from its tap end, so the tub runs up the vertical frame and you lie head-up in it */
const TUB_TOP: CamSpec = { local: [-2.25, 2.95, -2.3], lookAt: [-0.72, 0.62, -2.3], fov: 46 };
const TUB_CLOSE: CamSpec = { local: [-1.35, 2.35, -2.3], lookAt: [-0.45, 0.78, -2.3], fov: 40 };
const TAP: CamSpec = { local: [-1.5, 1.5, 2.9], lookAt: [-1.55, 1.0, -2.0], fov: 44 };
const SHORE: CamSpec = { local: [0.2, 1.4, 0.5], lookAt: [0.0, 0.95, -5.5], fov: 44 };
const SEA: CamSpec = { local: [0.3, 2.5, -12.6], lookAt: [0.0, 0.2, -6.0], fov: 44 }; // over the sea, looking back at the beach
const REEF_MID: CamSpec = { local: [0.0, 2.15, 3.8], lookAt: [0.0, 1.95, -1.0], fov: 44 };
const REEF_TWO: CamSpec = { local: [0.1, 2.15, 3.8], lookAt: [0.1, 1.95, -1.0], fov: 46 };

export const SHOTS: ShotDef[] = [
  S(1, 0, 5.2, "bathroom", TUB_TOP, "mid", "window", { angle: "top" }),                                    // hook: you lie under the bath water, wave
  S(2, 5.2, 7.05, "beach", { local: [0.1, 1.5, 1.9], lookAt: [0.0, 1.3, 0.0], fov: 40 }, "close"),        // you wake up with gills, touch them
  S(3, 7.05, 11.4, "beach", SEA, "wide"),                                                                // wade in, first breath of water
  S(4, 11.4, 13.5, "reef", REEF_MID, "mid", "sea"),                                                         // it works, but heavy
  I(5, 13.5, 16.85, "heavy"),                                                                              // AIR vs WATER, x800
  I(6, 16.85, 24.15, "thin"),                                                                              // 30x less O2, a bathtub through your chest
  S(7, 24.15, 29.85, "reef", { local: [0.0, 2.2, 4.4], lookAt: [0.0, 1.9, -1.5], fov: 48 }, "wide", "sea"), // you swim the reef, fish pass
  S(8, 29.85, 34.0, "reef", REEF_MID, "mid", "sea"),                                                        // you shiver, frost, temp falls
  I(9, 34.0, 40.85, "radiator"),                                                                           // gills = radiator: O2 in, heat out
  I(10, 40.85, 49.2, "faster"),                                                                            // x25, past your warmest blood
  S(11, 49.2, 53.75, "reef", REEF_TWO, "wide", "sea"), // a cold fish swims past
  S(12, 53.75, 59.85, "reef", REEF_TWO, "wide", "sea"), // the opah, +5 C
  S(13, 59.85, 61.7, "beach", SHORE, "wide"),                                                              // swim back to shore
  S(14, 61.7, 66.3, "bathroom", TAP, "mid", "window"),                                                     // hot tap, drop in the pump
  S(15, 66.3, 69.05, "bathroom", TUB_TOP, "mid", "window", { angle: "top" }),                              // lie down, breathe the bath
  S(16, 69.05, TOTAL / 30, "bathroom", TUB_CLOSE, "close", "window", { angle: "top" }),                    // would you still trade?
];

export const XFADE: Record<number, number> = {};
export const FLASH_AT = F(5.2); // end of the hook
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const KICKS = [F(10.4), F(15.0), F(30.8)]; // "breath" (dunk), "eight hundred", "shiver"
export const MOVES: Record<number, Move[]> = {
  1: [M("push", 3.0, 18, 0.07)],     // "live is your bathtub"
  2: [M("push", 6.6, 12, 0.1)],      // "gills"
  3: [M("push", 10.2, 14, 0.08)],    // "first breath"
  4: [M("push", 13.2, 10, 0.08)],    // "heavy"
  7: [M("push", 28.0, 18, 0.06)],    // "the whole reef"
  8: [M("push", 30.7, 12, 0.1)],     // "shiver"
  11: [M("push", 51.7, 14, 0.07)],   // "cold"
  12: [M("push", 57.9, 14, 0.08)],   // "five degrees"
  14: [M("push", 64.4, 12, 0.03)],   // "drop in"
  15: [M("push", 67.9, 14, 0.07)],   // "breathe the bath"
  16: [M("push", 69.8, 16, 0.06)],   // "trade your lungs"
};
export const HOLD: Record<number, number> = {};

/** no green-removal in this episode */
export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });

export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
