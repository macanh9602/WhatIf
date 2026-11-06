// What If ep10 "What If You Lived One Day Inside a Cartoon?" (~1:21, 2026-11-06). Times in seconds from
// public/eps/ep10/words.json (Chatterbox, last word ends 80.27 s). bible/episodes/ep10/SCRIPT.md has the facts. insert = 2D card.
import type { SetId } from "../../sets";
import { F, M, CamSpec, Light, Move, ShotDef, Size } from "../../shot";

export const TOTAL = F(81.4); // voice ends 80.27 s + a hold on the question

const S = (id: number, a: number, b: number, set: SetId, cam: CamSpec, size: Size, light: Light = "day", extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set, cam, size, light, ...extra });
const I = (id: number, a: number, b: number, insert: string): ShotDef => S(id, a, b, "rooftops", { cam: "wide" }, "wide", "day", { insert });

/** rooftops: you hang at spot "air" (0, 0, 5.5), past the front lip (z 2.9); the street is 12 m down */
const HOOK: CamSpec = { local: [0.7, 2.53, 1.83], lookAt: [0.0, -0.6, 6.0], fov: 50 }; // on the roof looking out: lip in front, you past it, the street far below
const HANG: CamSpec = { local: [-4.6, 1.9, 8.6], lookAt: [0.95, 0.0, 5.0], fov: 50 };
const NIGHT: CamSpec = { local: [-0.4, 1.0, 8.0], lookAt: [-2.0, 4.0, 3.4], fov: 52 }; // street, from below: you over the kerb in the lamp pool
const SPLAT: CamSpec = { local: [0.9, 3.4, 6.4], lookAt: [0.4, 0.3, 1.5], fov: 46 }; // street, high: the anvil + the pancake

export const SHOTS: ShotDef[] = [
  S(1, 0, 4.6, "rooftops", HOOK, "wide", "day", { angle: "high" }),                                                // on thin air past the edge, glance down
  S(2, 4.6, 13.0, "rooftops", { local: [0.75, 1.5, 3.0], lookAt: [0.1, 1.2, -0.4], fov: 42 }, "mid"),             // wake: outline, saucer eyes, four fingers
  I(3, 13.0, 19.45, "flipbook"),                                                                                 // fifth finger erased, 5,040 drawings
  S(4, 19.45, 23.75, "rooftops", { local: [-5.6, 1.35, 1.8], lookAt: [0.0, 0.9, 1.8], fov: 46 }, "wide"),          // legs spin in place, shoot off the edge
  S(5, 23.75, 33.05, "rooftops", HANG, "wide"),                                                                  // you zip in past the lip and stop on air; hang, arms crossed; LAW #1 · 1980 flutters past
  S(6, 33.05, 37.45, "rooftops", { local: [-6.2, 0.8, 10.5], lookAt: [0.0, -1.8, 5.5], fov: 58 }, "wide", "day", { angle: "low" }), // ghost real you 4.9 m lower
  S(7, 37.45, 39.65, "rooftops", { local: [-2.6, 1.6, 8.6], lookAt: [0.0, 0.5, 5.5], fov: 46 }, "mid"),           // look down, drop out of frame
  S(8, 39.65, 43.75, "street", SPLAT, "wide", "day", { angle: "high" }),                                         // land, anvil, pancake
  S(9, 43.75, 48.6, "street", { local: [0.6, 2.6, 6.2], lookAt: [0.3, 0.1, 1.5], fov: 44 }, "mid", "day", { angle: "high" }), // peel off, shake, pop back
  I(10, 48.6, 56.3, "squash"),                                                                                    // squash and stretch, rule #1, one condition
  I(11, 56.3, 61.05, "volume"),                                                                                   // flatten any way, volume stays the same
  I(12, 61.05, 64.95, "real"),                                                                                    // a real body: NO BOUNCE
  S(13, 64.95, 71.0, "street", NIGHT, "wide", "lamp", { angle: "low" }),                                         // 11:59, thin air over the street, eyes shut
  S(14, 71.0, 75.6, "street", NIGHT, "wide", "lamp", { angle: "low" }),                                          // midnight: fifth finger, outline thins, drop
  S(15, 75.6, TOTAL / 30, "street", { local: [0.6, 3.6, 4.2], lookAt: [2.6, 3.5, -2.0], fov: 44 }, "mid"),        // morning: you land on the awning, dazed, five fingers
];

export const XFADE: Record<number, number> = {};
export const FLASH_AT = F(4.6); // end of the hook
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const KICKS = [F(40.45), F(71.44)]; // anvil lands, midnight
export const MOVES: Record<number, Move[]> = {
  1: [M("push", 3.8, 14, 0.03)],      // "look down"
  2: [M("push", 11.0, 14, 0.06)],     // "four fingers"
  4: [M("push", 21.0, 16, 0.08)],    // "legs spin"
  5: [M("push", 30.6, 16, 0.08)],    // "nothing falls"
  6: [M("pull", 35.4, 18, 0.08)],    // "dropped": reveal down
  7: [M("push", 37.85, 10, 0.1)],    // "look down"
  9: [M("push", 46.8, 12, 0.08)],    // "pop back"
  13: [M("push", 69.8, 14, 0.08)],   // "eyes shut tight"
  14: [M("push", 71.4, 12, 0.06)],   // "midnight"
  15: [M("push", 77.0, 16, 0.06)],   // "what would you do"
};
export const HOLD: Record<number, number> = {};

/** no green-removal in this episode */
export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });

export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
