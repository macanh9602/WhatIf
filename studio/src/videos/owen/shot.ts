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
export type Light = "day" | "golden" | "lamp" | "window";
/** close = a face or hands fills the frame (lens blur 12-14 px), mid = waist up (10), wide = sharp */
export type Size = "close" | "mid" | "wide";
export type CamSpec = { cam: string } | { on: string; dist: number; h: number; from: string; side?: number; fov?: number }
  | { local: V3; lookAt: V3; fov: number }; // set-local coordinates (origin added)
export type ShotDef = { id: number; a: number; b: number; set: SetId; light: Light; size: Size; cam: CamSpec; roll?: number; push?: number; cap?: "top";
  /** full-screen 2D insert (inserts.tsx) instead of the 3D world */ insert?: string;
  /** deliberate high / low / top-down angle: staging_qa skips the eye-level camera-height check */ angle?: "high" | "low" | "top" };

/** Motivated camera moves (camera grammar, cartoon-3d-short SKILL.md): push = realization, pull = reveal / abandonment,
 *  truck = follow intent (look moves with it), crane = reveal by height (look fixed), arc = discovery (deg around the
 *  look point), roll = the floor drops out (deg). Symmetric smoothstep ease over `dur` frames: the reference's bursts
 *  attack ~10 f and release ~10 f (references/reports/motion.md 2.1). `at` = seconds, keyed to the narration word. */
export type Move = { k: "push" | "pull" | "truck" | "crane" | "arc" | "roll"; at: number; dur: number; amt: number };
export const M = (k: Move["k"], at: number, dur: number, amt: number): Move => ({ k, at, dur, amt });
