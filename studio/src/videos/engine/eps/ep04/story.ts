// What If ep04 "What If Humans Had a Second Face on the Back of Their Heads?" (~1:05 after 1.1x, 2026-11-05). Times in
// seconds from public/eps/ep04/words.json (Chatterbox, 80.0 s). bible/episodes/ep04/SCRIPT.md has the facts.
// Cards always face the camera, so a "back view" of you = the closed red jacket + the back face (cast.ts YOU_BACK).
import type { SetId } from "../../sets";
import { F, M, CamSpec, Light, Move, ShotDef, Size } from "../../shot";

export const TOTAL = F(81.0); // voice ends 79.85 s + a hold on the question

const S = (id: number, a: number, b: number, set: SetId, cam: CamSpec, size: Size, light: Light = "day", extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set, cam, size, light, ...extra });
const I = (id: number, a: number, b: number, insert: string): ShotDef => S(id, a, b, "yard", { cam: "wide" }, "wide", "day", { insert });

export const SHOTS: ShotDef[] = [
  S(1, 0, 5.65, "yard", { local: [-0.8, 1.2, 3.9], lookAt: [-1.0, 1.15, 0.6], fov: 42 }, "mid"),                  // the back face catches the sneaking neighbour
  I(2, 5.65, 16.0, "vision"),                                                                                      // 200 degrees + blind spot -> the whole circle
  S(3, 16.0, 21.93, "yard", { local: [-0.95, 1.42, 3.4], lookAt: [-1.0, 1.32, 0.6], fov: 40 }, "close"),            // the queue: the back face stares into your eyes
  I(4, 21.93, 32.69, "sleep"),                                                                                     // back, front, side sleeper
  S(5, 32.69, 39.69, "home", { local: [0.5, 1.45, 2.0], lookAt: [0.4, 1.35, -0.9], fov: 40 }, "close", "window"), // the brain: twice the picture
  S(6, 39.69, 42.5, "forest", { local: [0.2, 1.4, 4.4], lookAt: [0.2, 1.1, -0.8], fov: 44 }, "wide"),             // nature already tried this
  I(7, 42.5, 51.89, "rabbit"),                                                                                     // rabbits see almost all around: prey
  I(8, 51.89, 65.14, "hunter"),                                                                                    // hunters: eyes in front, overlap = depth
  S(9, 65.14, 71.38, "forest", { local: [0.1, 1.35, 2.6], lookAt: [0.0, 1.2, -0.6], fov: 42 }, "mid"),            // not safer: prey
  S(10, 71.38, 76.39, "forest", { local: [-0.3, 1.0, 3.4], lookAt: [0.0, 1.3, -0.6], fov: 46 }, "mid", "day", { angle: "low" }), // ancestors did the chasing
  S(11, 76.39, TOTAL / 30, "yard", { local: [-0.95, 1.38, 3.5], lookAt: [-1.0, 1.25, 0.6], fov: 40 }, "close"),    // what would your back face be doing?
];

export const XFADE: Record<number, number> = {};
export const FLASH_AT = F(5.65); // end of the hook
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const KICKS = [F(4.2), F(70.0)]; // the neighbour jumps, "prey"
export const MOVES: Record<number, Move[]> = {
  1: [M("push", 3.6, 12, 0.08)],     // the back face turns
  3: [M("push", 17.5, 22, 0.06)],    // "staring right into your eyes"
  5: [M("push", 36.0, 14, 0.08)],    // "twice the picture"
  9: [M("push", 69.0, 16, 0.1)],     // "prey"
  11: [M("push", 77.6, 18, 0.06)],   // "back face"
};
export const HOLD: Record<number, number> = {};

/** no green effect in this episode */
export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });

export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
