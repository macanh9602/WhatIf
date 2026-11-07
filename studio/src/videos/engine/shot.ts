// Shot-timeline vocabulary shared by every episode (eps/<ep>/story.ts): time helpers, shot / camera / move types.
// A leaf module (no episode imports), so episode data can import it without a cycle through story.ts.
import type { SetId, V3 } from "./sets";

export type { V3 };
export const FPS = 30;
export const D0 = 0; // ground height (kept for helpers copied from the template)

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
export const F = (s: number) => Math.round(s * FPS);

/** lamp = night interior lit by one lamp, window = day interior lit through one window (both use sets.ts POOLS) */
/** sea = deep underwater (blue haze from 2 m), shallow = sunny lagoon water (turquoise haze) */
/** night = outdoor moonlight (navy sky, moon disc), dawn = low pink-gold sun, lavender sky (2026-11-07) */
export type Light = "day" | "golden" | "lamp" | "window" | "sea" | "shallow" | "night" | "dawn";
/** close = a face or hands fills the frame (lens blur 12-14 px), mid = waist up (10), wide = sharp */
export type Size = "close" | "mid" | "wide";
export type CamSpec = { cam: string } | { on: string; dist: number; h: number; from: string; side?: number; fov?: number }
  | { local: V3; lookAt: V3; fov: number } // set-local coordinates (origin added)
  /** sky-fall: camera straight above set-local point `fall`, height h[0] -> h[1] m across the shot, looking down; clouds rush up
   *  past the lens at `rush` m/s (default 60). Pin the faller with story.ts fallPos(); world.ts turns cards to the lens. */
  | { fall: V3; h: [number, number]; fov?: number; rush?: number };
export type ShotDef = { id: number; a: number; b: number; set: SetId; light: Light; size: Size; cam: CamSpec; roll?: number; push?: number; cap?: "top";
  /** full-screen 2D insert (inserts.tsx) instead of the 3D world */ insert?: string;
  /** deliberate high / low / top-down angle: staging_qa skips the eye-level camera-height check */ angle?: "high" | "low" | "top";
  /** fog near / far in m for this shot instead of the set's (big outdoor sets: side views need more air than the top-down rig) */ haze?: [number, number];
  /** card orientation for every actor in the shot (default: upright, yawed to the lens). "cam" = fully faces the lens,
   *  pitch included (sky-fall: default there); { flat: yaw } = lies on the ground, head toward (-sin yaw, 0, -cos yaw)
   *  (yaw 0 = head to -z). A place's own `card` field wins once cast.ts passes it through. */ card?: CardMode };
export type CardMode = "cam" | { flat: number };

/** Motivated camera moves (camera grammar, cartoon-3d-short SKILL.md): push = realization, pull = reveal / abandonment,
 *  truck = follow intent (look moves with it), crane = reveal by height (look fixed), arc = discovery (deg around the
 *  look point), roll = the floor drops out (deg). Symmetric smoothstep ease over `dur` frames: the reference's bursts
 *  attack ~10 f and release ~10 f (references/reports/motion.md 2.1). `at` = seconds, keyed to the narration word. */
export type Move = { k: "push" | "pull" | "truck" | "crane" | "arc" | "roll"; at: number; dur: number; amt: number };
export const M = (k: Move["k"], at: number, dur: number, amt: number): Move => ({ k, at, dur, amt });
