// THROWAWAY engine lab (2026-11-07): one 2 s shot per new feature (ep12 outdoor sets, far layers, night / dawn, sky-fall,
// flat / lens-facing cards, the transition pass). Not an episode: EP=_lab only.
import type { SetId } from "../../sets";
import { F, CamSpec, Light, Move, ShotDef, Size } from "../../shot";
import type { Trans } from "../../story";

const S = (id: number, a: number, b: number, set: SetId, cam: CamSpec, size: Size, light: Light = "day", extra: Partial<ShotDef> = {}): ShotDef =>
  ({ id, a: F(a), b: F(b), set, cam, size, light, ...extra });

export const SHOTS: ShotDef[] = [
  S(1, 0, 2, "town", { cam: "air" }, "wide", "day", { angle: "high" }),
  S(2, 2, 4, "town", { cam: "low" }, "wide", "day", { angle: "high" }),
  S(3, 4, 6, "town", { local: [48, 1.5, 12], lookAt: [48, 1.2, 6], fov: 46 }, "mid"),
  S(4, 6, 8, "desert", { cam: "wide" }, "wide", "golden"),
  S(5, 8, 10, "sea", { cam: "wide" }, "wide", "day"),
  S(6, 10, 12, "mountains", { cam: "wide" }, "wide", "dawn", { angle: "low" }),
  S(7, 12, 14, "field", { cam: "wide" }, "wide", "golden"),
  S(8, 14, 16, "town", { local: [48, 1.5, 12], lookAt: [48, 1.2, 6], fov: 46 }, "mid", "night"),
  S(9, 16, 18, "town", { fall: [0, 0, 0], h: [420, 380] }, "wide", "day", { angle: "top" }),
  S(10, 18, 20, "desert", { fall: [0, 0, -40], h: [260, 220], rush: 80 }, "wide", "golden", { angle: "top" }),
  S(11, 20, 22, "field", { local: [0, 3.0, -0.85], lookAt: [0, 0, -0.9], fov: 50 }, "mid", "golden", { angle: "top", card: { flat: 0 } }),
  S(12, 22, 24, "field", { cam: "air" }, "wide", "night"),
  S(13, 24, 26, "town", { cam: "wide" }, "wide", "day", { insert: "card" }),
];
export const TOTAL = F(26);
export const TRANS: Record<number, Trans> = {
  2: { kind: "zoom", dur: 12, cx: 0.5, cy: 0.45 }, 3: { kind: "whip", dur: 12 }, 4: { kind: "iris", dur: 12, cx: 0.5, cy: 0.6 },
  5: { kind: "dipWhite", dur: 6 }, 6: { kind: "dipBlack", dur: 8 }, 13: { kind: "iris", dur: 12, cx: 0.4, cy: 0.5 },
};
export const XFADE: Record<number, number> = {};
export const FLASH_AT = -100;
export const CAPTION_STOPS: string[] = [];
export const REFRAME: Record<number, number> = {};
export const KICKS: number[] = [];
export const MOVES: Record<number, Move[]> = {};
export const HOLD: Record<number, number> = {};
export const noGreenAt = (_f: number) => ({ amt: 0, wipe: -1 });
export const CONTACTS: [number, number, "feet" | "torso" | "any", number, "feet" | "torso" | "any"][] = [];
export const WAIVE: [number, number, string, string][] = [];
