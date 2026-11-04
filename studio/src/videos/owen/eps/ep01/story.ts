// What If ep01 "What If Green Didn't Exist?" timeline. Times in seconds from public/owen/ep01/words.json
// (Chatterbox, 160.6 s). bible/episodes/ep01/SCRIPT.md "Beat -> picture" has the verb of each shot.
// insert: a full-screen 2D blueprint card (inserts.tsx); the set is ignored then.
import type { SetId } from "../../sets";
import { F, M, CamSpec, Light, Move, ShotDef, Size, clamp01, smooth } from "../../shot";

export const TOTAL = F(162.2); // voice ends 160.6 s + a hold on the green forest

const S = (id: number, a: number, b: number, set: SetId, cam: CamSpec, size: Size, light: Light = "day", extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set, cam, size, light, ...extra });
const I = (id: number, a: number, b: number, insert: string): ShotDef => S(id, a, b, "forest", { cam: "wide" }, "wide", "day", { insert });

export const SHOTS: ShotDef[] = [
  S(1, 0, 6.2, "forest", { local: [0, 9, 14], lookAt: [0, 2, -18], fov: 50 }, "wide", "day", { angle: "high" }),       // If green vanished ... turn black
  S(2, 6.2, 11.6, "kitchen", { local: [0.9, 1.45, 3.2], lookAt: [0.2, 1.3, -2.6], fov: 44 }, "mid", "window"),            // Imagine opening your curtains
  I(3, 11.6, 18.1, "prism"),                                                                                              // Sunlight is every color mixed
  S(4, 18.1, 23.2, "yard", { local: [-2.6, 1.3, 2.4], lookAt: [2.4, 0.7, -3.4], fov: 46 }, "wide"),                      // lawn burnt toast, neighbor mowing
  I(5, 23.2, 30.2, "phone"),                                                                                              // phone purple
  S(6, 30.2, 37.4, "yard", { local: [4.4, 1.5, 6.2], lookAt: [7.4, 1.7, 0.6], fov: 46 }, "mid"),                        // crossing light
  S(7, 37.4, 41.4, "yard", { local: [0.5, 1.6, 11], lookAt: [0.5, 2.2, -6], fov: 50 }, "wide"),                          // whole day looks dim
  S(8, 41.4, 43.6, "yard", { local: [-1.4, 1.2, 1.2], lookAt: [-1.4, 1.15, -1.2], fov: 38 }, "close"),                   // not your imagination
  I(9, 43.6, 55.3, "eye"),                                                                                                // quarter of sunlight, eyes tuned
  S(10, 55.3, 58.2, "yard", { local: [-1.0, 1.3, 2.2], lookAt: [-1.4, 1.1, -1.2], fov: 40 }, "mid"),                     // more than half, sunglasses
  S(11, 58.2, 65.8, "kitchen", { local: [0.3, 1.5, 2.0], lookAt: [0.1, 1.0, -0.2], fov: 42 }, "mid", "window"),          // banana, gold ring, frog/parrot
  S(12, 65.8, 69.7, "forest", { local: [0.7, 1.7, 2.3], lookAt: [1.1, 1.6, 0.0], fov: 40 }, "close"),                 // camouflage on a black leaf
  S(13, 69.7, 75.5, "yard", { local: [0.5, 1.5, 9], lookAt: [-1, 2.6, -4], fov: 48 }, "wide", "lamp"),                   // nights get worse
  S(14, 75.5, 82.0, "yard", { local: [-4.6, 1.3, 4.6], lookAt: [-4.8, 1.0, 0.6], fov: 46 }, "mid", "lamp"),             // walk through ink
  S(15, 82.0, 87.0, "yard", { local: [-1.2, 1.25, 2.6], lookAt: [-1.4, 1.1, -1.2], fov: 40 }, "mid"),                     // here's the part that hurts
  I(16, 87.0, 92.8, "sunpie"),                                                                                            // a tenth of everything
  I(17, 92.8, 98.2, "thermo"),                                                                                            // cools eight degrees
  I(18, 98.2, 104.9, "icesheet"),                                                                                         // colder than the ice age
  I(19, 104.9, 111.4, "reflect"),                                                                                         // snow is white, reflects
  I(20, 111.4, 120.0, "loop"),                                                                                            // more snow more cold
  I(21, 120.0, 123.6, "snowball"),                                                                                        // Snowball Earth
  S(22, 123.6, 129.3, "snow", { local: [0.8, 1.5, 5.5], lookAt: [0, 1.6, -4], fov: 48 }, "wide"),                         // frozen pink dim planet
  S(23, 129.3, 133.0, "snow", { local: [-0.6, 1.4, 3.4], lookAt: [0.6, 1.3, -0.9], fov: 42 }, "mid"),                     // the black trees are still growing
  I(24, 133.0, 151.6, "leaf"),                                                                                            // You see ... goes black
  S(25, 151.6, 156.4, "forest", { local: [0, 1.4, 5.0], lookAt: [0, 2.0, -3], fov: 48 }, "wide"),                         // every green thing ... light a plant didn't want
  S(26, 156.4, TOTAL / 30, "forest", { local: [0.4, 1.25, 1.9], lookAt: [0.2, 1.3, -0.6], fov: 40 }, "mid"),             // the part they gave to us
];

export const XFADE: Record<number, number> = { 25: 10 };
export const FLASH_AT = F(6.2); // end of the hook
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const KICKS = [F(80.4)]; // bumps into the lamppost
export const MOVES: Record<number, Move[]> = {
  1: [M("crane", 0.3, 160, -0.18)],
  2: [M("push", 8.6, 20, 0.08)],      // "street is glowing pink"
  4: [M("truck", 18.4, 120, 0.06)],
  6: [M("push", 35.4, 14, 0.08)],     // "nothing means go"
  7: [M("pull", 37.6, 100, 0.08)],
  8: [M("push", 41.8, 18, 0.1)],
  12: [M("push", 67.4, 14, 0.1)],     // "perfect camouflage"
  14: [M("truck", 75.8, 150, 0.12)],  // walk home
  22: [M("crane", 123.8, 120, 0.08)],
  23: [M("push", 130.6, 16, 0.12)],   // "still growing"
  25: [M("crane", 151.8, 120, 0.1)],
  26: [M("push", 158.6, 30, 0.06)],
};
export const HOLD: Record<number, number> = {};

/** green removed: 0 = normal, 1 = no green light. Hook: the change sweeps down from the horizon; payoff: green returns. */
export const noGreenAt = (f: number): { amt: number; wipe: number } => {
  const t = f / 30;
  if (t < 6.2) return { amt: 1, wipe: clamp01((t - 1.6) / 4.0) };
  if (t < 152.0) return { amt: 1, wipe: -1 };
  return { amt: 1 - smooth((t - 152.0) / 2.6), wipe: -1 };
};

export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
