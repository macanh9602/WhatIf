// Light presets per time of day. The sun is CAMERA-RELATIVE and frozen per shot (world.ts update()):
// az = degrees from the shot camera's forward axis (0 = sun straight ahead = backlight, +90 = screen right,
// 180 = behind camera), el = elevation. lit/shade/lift are LINEAR RGB multipliers for shade.ts (may exceed 1).
// Field names follow lighting.md 9.1 exactly (the CHAR and POST agents read them); values are tuned on renders.
// pool > 0 (interiors): the key comes FROM the set's pool centre (sets.ts POOLS) and only lights within ~pool metres;
// outside it everything falls to `shade` (world and cards), so rooms get a lit pool and dark corners like the reference.
import type { Light } from "./story";
type C3 = [number, number, number];
export type LightPreset = {
  az: number; el: number; pool: number;
  lit: C3; shade: C3; lift: C3; lambert: number; sideK: number; term: number;      // world two-tone (shade.ts)
  charTint: C3; charShade: number; charGrad: number; bodyGrad: number; sideTint: C3; // character cards (cast.ts)
  blob: C3; actorShadow: boolean;                                                    // contact blobs / card shadows
  top: string; hor: string; skyCurve: C3; fog: string; fogNear: number; fogFar: number; sunDisc: string; // depth.md 6.5
  sunCol: string; sunI: number; sky: string; ground: string; hemiI: number;         // three lights (unpatched mats only)
  bias: number; normalBias: number;
};
export const LIGHTS: Record<Light, LightPreset> = {
  day: {
    az: 75, el: 48, pool: 0,
    lit: [1.58, 1.5, 1.33], shade: [0.3, 0.29, 0.36], lift: [0.05, 0.06, 0.11], lambert: 0.35, sideK: 0.84, term: 0.2,
    charTint: [1.0, 0.94, 0.92], charShade: 0.86, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.92, 0.90, 0.96],
    blob: [0.62, 0.58, 0.58], actorShadow: false,
    top: "#3e7fd2", hor: "#b8d0ec", skyCurve: [0.0, 0.5, 0.6], fog: "#b8d0ec", fogNear: 8, fogFar: 70, sunDisc: "#000000", // fb0016b: our sets are 15-40 m deep; 25 -> 300 m left them unhazed; 4 m washed the actors' own floor (yard sat .23)
    sunCol: "#fff3e0", sunI: 2.8, sky: "#dcecff", ground: "#b49a78", hemiI: 0.55,
    bias: -0.00025, normalBias: 0.015,
  },
  golden: {
    az: 6, el: 7, pool: 0,
    lit: [1.5, 0.68, 0.24], shade: [0.15, 0.15, 0.3], lift: [0.04, 0.06, 0.17], lambert: 0.35, sideK: 0.82, term: 0.07,
    charTint: [1.0, 0.78, 0.56], charShade: 0.88, charGrad: 0.1, bodyGrad: 0.25, sideTint: [0.85, 0.80, 0.95],
    blob: [0.75, 0.74, 0.9], actorShadow: true,
    top: "#6a4f8c", hor: "#ffd08a", skyCurve: [0.05, 0.6, 1.0], fog: "#efb489", fogNear: 50, fogFar: 380, sunDisc: "#ffcf9e",
    sunCol: "#ffab5e", sunI: 5.5, sky: "#d8b0b8", ground: "#8a6a60", hemiI: 0.5,
    bias: -0.0006, normalBias: 0.03,
  },
  // night interior: warm lamp pool, deep blue room (reference cabin / night-street frames)
  lamp: {
    // fb0017: shade .1/.12/.3 + pool 3.4 drowned walls, props and textures in one navy (look score colour 4, light 3)
    az: 0, el: 0, pool: 5.5,
    lit: [1.7, 1.2, 0.68], shade: [0.3, 0.27, 0.44], lift: [0.03, 0.04, 0.1], lambert: 0.5, sideK: 0.85, term: 0.2,
    charTint: [1.0, 0.84, 0.66], charShade: 0.68, charGrad: 0.1, bodyGrad: 0.25, sideTint: [0.7, 0.74, 1.0],
    blob: [0.55, 0.5, 0.62], actorShadow: false,
    top: "#1c2448", hor: "#2c3768", skyCurve: [0, 0.5, 0.6], fog: "#1c2448", fogNear: 60, fogFar: 600, sunDisc: "#000000",
    sunCol: "#ffc27a", sunI: 2.4, sky: "#3a4a80", ground: "#2a2440", hemiI: 0.3,
    bias: -0.0004, normalBias: 0.02,
  },
  // day interior: one raking window key, the far side of the room in cool shade
  window: {
    az: 0, el: 0, pool: 6.5,
    lit: [1.7, 1.56, 1.3], shade: [0.36, 0.37, 0.52], lift: [0.04, 0.05, 0.11], lambert: 0.45, sideK: 0.85, term: 0.2,
    charTint: [1.0, 0.95, 0.88], charShade: 0.72, charGrad: 0.09, bodyGrad: 0.22, sideTint: [0.82, 0.84, 1.0],
    blob: [0.6, 0.58, 0.64], actorShadow: false,
    top: "#3e7fd2", hor: "#b8d0ec", skyCurve: [0, 0.5, 0.6], fog: "#b8d0ec", fogNear: 60, fogFar: 600, sunDisc: "#000000",
    sunCol: "#fff3e0", sunI: 2.8, sky: "#dcecff", ground: "#b49a78", hemiI: 0.55,
    bias: -0.00025, normalBias: 0.015,
  },
};

/** world-only look per light (sky stops by elevation in degrees, river colours, cloud palette). All colours are
 *  ON-SCREEN targets under the current PBR-Neutral tone map; world.ts pre-inverts the tone map (shade.ts untone). */
export type WorldLook = {
  sky: { c: string[]; e: number[] };                         // 5 stops: c[i] at elevation e[i] (deg), smoothstep between
  water: { near: string; mid: string; far: string; crest: string; trough: string; glint: string; shade: C3 };
  bounce: C3;                                                 // shade.ts uBounce: albedo x bounce on shaded faces turned to the lens
  sat: number;                                                // shade.ts uSat: world albedo saturation (1 = as painted)
  cloud: { lit: string; mid: string; shade: string };
};
const LOOK2: Record<"day" | "golden", WorldLook> = {
  day: {
    // depth.md 2.2: horizon #9fb6e6 just above the skyline, upper sky #5e93d9 at ~20 deg (grade: frame top #5997e2)
    sky: { c: ["#b8d0ec", "#9cbfea", "#6a9fe0", "#4f8cdb", "#3373cc"], e: [0, 3, 8, 16, 40] },
    water: { near: "#22a7b6", mid: "#167fb2", far: "#1a5596", crest: "#7ddfe8", trough: "#0e4a80", glint: "#ffffff", shade: [0.5, 0.56, 0.72] },
    cloud: { lit: "#fbf8f1", mid: "#e1e5f3", shade: "#c3cbe9" },
    bounce: [0, 0, 0],
    sat: 1.08,
  },
  golden: {
    // sunset, not dusk: #ffd08a horizon, peach/orange through ~10 deg, warm rose at 20, muted warm mauve only near the top
    // (the golden grade adds ~+11/255 blue to shadows/mids, so these lean warm)
    sky: { c: ["#ffc47c", "#f7ae78", "#e8967c", "#c4848e", "#8a6f8a"], e: [0, 4, 10, 20, 40] },
    water: { near: "#1e3a6e", mid: "#355f96", far: "#d4a48e", crest: "#d9a088", trough: "#16294f", glint: "#ffe2b0", shade: [0.42, 0.46, 0.72] },
    cloud: { lit: "#ffd2a8", mid: "#f2a08f", shade: "#a98fc4" },
    bounce: [0.04, 0.02, 0.0],
    sat: 1.1,
  },
};
/** interiors reuse an outdoor look (sky/clouds are hidden there; only bounce and sat matter) */
export const LOOK: Record<Light, WorldLook> = { ...LOOK2, lamp: { ...LOOK2.golden, sky: { c: ["#24305e", "#1e2a56", "#19224a", "#141b3f", "#0f1432"], e: [0, 3, 8, 16, 40] }, bounce: [0, 0, 0], sat: 1.15 }, window: { ...LOOK2.day, sat: 1.12 } };
/** grade, cloud and contact-blob palettes exist for day and golden only */
export const base = (l: Light): "day" | "golden" => (l === "golden" || l === "lamp" ? "golden" : "day");
