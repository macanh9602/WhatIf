// What If ep06 "What If You Could Sell Your Sleep?" (~1:17 after 1.1x, 2026-11-06). Times in seconds from
// public/eps/ep06/words.json (Chatterbox, 84.6 s). bible/episodes/ep06/SCRIPT.md has the facts. insert = 2D card.
import type { SetId } from "../../sets";
import { F, M, CamSpec, Light, Move, ShotDef, Size } from "../../shot";

export const TOTAL = F(85.7); // voice ends 84.6 s + a hold on the question

const S = (id: number, a: number, b: number, set: SetId, cam: CamSpec, size: Size, light: Light = "day", extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set, cam, size, light, ...extra });
const I = (id: number, a: number, b: number, insert: string): ShotDef => S(id, a, b, "yard", { cam: "wide" }, "wide", "day", { insert });

const ROOM: CamSpec = { local: [0.0, 1.3, 3.9], lookAt: [-0.05, 1.0, -1.2], fov: 42 }; // far enough to keep the bed in frame
const HOME_CLOSE: CamSpec = { local: [0.6, 1.45, 1.9], lookAt: [0.4, 1.35, -0.9], fov: 40 };

export const SHOTS: ShotDef[] = [
  S(1, 0, 4.8, "yard", { local: [-0.9, 1.25, 5.4], lookAt: [-0.9, 1.1, 0.4], fov: 46 }, "mid"),           // you + HUD; a billionaire strides past
  S(2, 4.8, 10.6, "bedroom", ROOM, "mid", "lamp"),                                                        // the app; tap, sell two hours
  S(3, 10.6, 14.5, "home", HOME_CLOSE, "close", "window"),                                                // paid, up early, feel fine
  S(4, 14.5, 20.5, "bedroom", ROOM, "mid", "lamp"),                                                       // the billionaire beside a made bed
  I(5, 20.5, 26.7, "invoice"),                                                                            // 26 years, under 5 million
  S(6, 26.7, 31.9, "bedroom", ROOM, "mid", "lamp"),                                                       // day 14: keep selling, still "fine"
  I(7, 31.9, 38.4, "test"),                                                                               // tests like a skipped night
  I(8, 38.4, 49.7, "trash"),                                                                              // the brain's cleaning crew; in mice
  S(9, 49.7, 54.2, "home", HOME_CLOSE, "close", "window"),                                                // you sold the crew: thought bubble
  S(10, 54.2, 59.5, "yard", { local: [-17.7, 1.5, 7.8], lookAt: [-17.8, 1.3, 0.8], fov: 46 }, "wide"),     // the queue at the booth, the limit
  S(11, 59.5, 68.5, "bedroom", ROOM, "mid", "lamp"),                                                      // 1964: the teen, eleven days
  I(12, 68.5, 74.7, "dolphin"),                                                                           // half a brain at a time
  I(13, 74.7, 81.8, "market"),                                                                            // one in three, paid $0
  S(14, 81.8, TOTAL / 30, "yard", { local: [-0.9, 1.35, 3.1], lookAt: [-0.8, 1.25, 0.6], fov: 42 }, "close"), // how many hours? the billionaire strides past
];

export const XFADE: Record<number, number> = {};
export const FLASH_AT = F(4.8); // end of the hook
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const KICKS = [F(9.3), F(31.3)]; // "sell", "trap"
export const MOVES: Record<number, Move[]> = {
  1: [M("push", 2.2, 16, 0.08)],     // "billionaires"
  2: [M("push", 8.8, 14, 0.08)],     // "tap"
  3: [M("push", 13.5, 12, 0.08)],    // "feel fine"
  4: [M("push", 19.0, 14, 0.08)],    // "never goes to bed"
  6: [M("push", 30.6, 14, 0.08)],    // "the trap"
  9: [M("push", 52.3, 14, 0.08)],    // "you sold"
  10: [M("push", 57.9, 14, 0.08)],   // "hard limit"
  11: [M("push", 66.7, 16, 0.08)],   // "his memory"
  14: [M("push", 83.2, 16, 0.06)],   // "how many hours"
};
export const HOLD: Record<number, number> = {};

/** no green-removal in this episode */
export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });

export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
