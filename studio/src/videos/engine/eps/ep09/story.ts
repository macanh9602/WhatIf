// What If ep09 "What If an Extrovert Turned Into a Sponge?" (~1:16, 2026-11-06). Times in seconds from
// public/eps/ep09/words.json (Chatterbox, last word ends 74.79 s). bible/episodes/ep09/SCRIPT.md has the facts. insert = 2D card.
import type { SetId } from "../../sets";
import { F, M, CamSpec, Light, Move, ShotDef, Size } from "../../shot";

export const TOTAL = F(75.9); // voice ends 74.79 s + a hold on the question

const S = (id: number, a: number, b: number, set: SetId, cam: CamSpec, size: Size, light: Light = "shallow", extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set, cam, size, light, ...extra });
const I = (id: number, a: number, b: number, insert: string): ShotDef => S(id, a, b, "lagoon", { cam: "wide" }, "wide", "shallow", { insert });

// lagoon: the lead sponge stands at spot "sponge" (local 0,0,0), ~1.1 m tall; low look points keep it above the caption band
const HOOK: CamSpec = { local: [0.2, 0.85, 3.1], lookAt: [0, 0.41, 0], fov: 42 };
const ROOM: CamSpec = { local: [0.3, 1.35, 4.2], lookAt: [-0.15, 0.85, -1.6], fov: 44 }; // party: the sofa, the guests, the speaker

export const SHOTS: ShotDef[] = [
  S(1, 0, 5.6, "lagoon", HOOK, "mid"),                                                                    // the red sponge with your curl, shrimp dance, lights
  S(2, 5.6, 9.7, "party", ROOM, "mid", "lamp"),                                                           // you mid-story, guests laughing on the sofa
  S(3, 9.7, 12.1, "lagoon", { local: [-0.55, 0.9, 3.3], lookAt: [0, 0.45, 0], fov: 42 }, "mid"),           // you wake up as a sponge: eyes open
  S(4, 12.1, 18.4, "lagoon", { local: [0.6, 1.0, 4.0], lookAt: [0.05, 0.62, 0], fov: 44 }, "wide"),        // no mouth / legs / brain, a fish swims past
  S(5, 18.4, 21.1, "lagoon", { local: [-0.3, 0.8, 2.9], lookAt: [0, 0.42, 0], fov: 44 }, "mid"),          // water pours in from every side
  I(6, 21.1, 30.25, "flow"),                                                                              // pores in, out the top, a pool a day
  S(7, 30.25, 36.0, "lagoon", { local: [0.5, 0.95, 3.8], lookAt: [0, 0.51, 0], fov: 44 }, "wide"),        // eat, sneeze the slime, fish eat it
  I(8, 36.0, 43.6, "guests"),                                                                             // shrimp, crab, worm move in; hundreds
  I(9, 43.6, 50.05, "crowd"),                                                                             // a crowd of cells holding on
  I(10, 50.05, 58.75, "cloth"),                                                                           // 1907: through the cloth, crawl back
  S(11, 58.75, 66.1, "lagoon", { local: [0, 0.9, 3.6], lookAt: [0, 0.47, 0], fov: 44 }, "mid"),           // your cells find each other, the curl pops
  S(12, 66.1, 72.2, "lagoon", { local: [0.4, 0.95, 3.8], lookAt: [0, 0.45, 0], fov: 42 }, "mid"),        // the party inside you, you feel nothing
  S(13, 72.2, 73.95, "party", { local: [-0.1, 1.2, 2.6], lookAt: [-0.4, 0.85, -2.1], fov: 42 }, "mid", "lamp"), // lonely you on the empty sofa
  S(14, 73.95, TOTAL / 30, "lagoon", { local: [-0.4, 0.95, 3.6], lookAt: [0, 0.45, 0], fov: 42 }, "mid"), // ... or the sponge with its party
];

export const XFADE: Record<number, number> = {};
export const FLASH_AT = F(5.6); // end of the hook
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const KICKS = [F(33.4), F(62.9)]; // the sneeze, the curl pops back
export const MOVES: Record<number, Move[]> = {
  1: [M("push", 4.6, 16, 0.08)],     // "never know"
  2: [M("push", 6.6, 14, 0.06)],     // "loudest"
  3: [M("push", 10.4, 14, 0.08)],    // "a sponge"
  4: [M("push", 17.3, 14, 0.06)],    // "no nerves"
  5: [M("push", 19.9, 14, 0.08)],    // "most social"
  7: [M("push", 33.2, 12, 0.08)],    // "sneeze"
  11: [M("push", 63.4, 16, 0.08)],   // "most extroverted"
  12: [M("push", 69.8, 16, 0.08)],   // "can't feel"
  13: [M("push", 73.3, 12, 0.06)],   // "lonely"
  14: [M("push", 74.2, 14, 0.06)],   // "a sponge"
};
export const HOLD: Record<number, number> = {};

/** no green-removal in this episode */
export const noGreenAt = (_f: number): { amt: number; wipe: number } => ({ amt: 0, wipe: -1 });

export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
