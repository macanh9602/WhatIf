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
  // underwater (ep08 reef): cool key from above, blue-green shade, dense blue haze; sky = water colour, no clouds / sun disc
  sea: {
    az: 60, el: 70, pool: 0,
    lit: [1.05, 1.35, 1.5], shade: [0.16, 0.28, 0.42], lift: [0.02, 0.07, 0.14], lambert: 0.4, sideK: 0.84, term: 0.2,
    charTint: [0.86, 0.96, 1.0], charShade: 0.8, charGrad: 0.1, bodyGrad: 0.22, sideTint: [0.8, 0.9, 1.0],
    blob: [0.4, 0.5, 0.62], actorShadow: false,
    top: "#2a8fc0", hor: "#155a8a", skyCurve: [0, 0.5, 0.6], fog: "#17608f", fogNear: 2, fogFar: 30, sunDisc: "#000000",
    sunCol: "#d6f4ff", sunI: 2.4, sky: "#9fe3f0", ground: "#1d3d5a", hemiI: 0.5,
    bias: -0.00025, normalBias: 0.015,
  },
  // shallow sunny water (ep09 lagoon): bright sand, turquoise haze further out
  shallow: {
    az: 70, el: 65, pool: 0,
    lit: [1.5, 1.6, 1.45], shade: [0.32, 0.44, 0.5], lift: [0.04, 0.09, 0.12], lambert: 0.35, sideK: 0.84, term: 0.2,
    charTint: [0.95, 1.0, 1.0], charShade: 0.84, charGrad: 0.08, bodyGrad: 0.2, sideTint: [0.85, 0.95, 1.0],
    blob: [0.55, 0.66, 0.68], actorShadow: false,
    top: "#7fe0e0", hor: "#3fb6c4", skyCurve: [0, 0.5, 0.6], fog: "#43b9c6", fogNear: 4, fogFar: 42, sunDisc: "#000000",
    sunCol: "#fffbe8", sunI: 2.8, sky: "#c8f6f2", ground: "#e8dcb8", hemiI: 0.55,
    bias: -0.00025, normalBias: 0.015,
  },
  // outdoor night (2026-11-07): a cool moon key from the side, navy shade, deep blue haze; moon disc, dimmed clouds
  night: {
    az: 70, el: 35, pool: 0,
    lit: [0.45, 0.55, 0.85], shade: [0.11, 0.13, 0.27], lift: [0.03, 0.04, 0.1], lambert: 0.4, sideK: 0.84, term: 0.15,
    charTint: [0.78, 0.84, 1.0], charShade: 0.7, charGrad: 0.1, bodyGrad: 0.25, sideTint: [0.7, 0.76, 1.0],
    blob: [0.45, 0.45, 0.6], actorShadow: false,
    top: "#0e1430", hor: "#2c3a6e", skyCurve: [0, 0.5, 0.6], fog: "#24305e", fogNear: 12, fogFar: 110, sunDisc: "#e8eeff",
    sunCol: "#b8c8ff", sunI: 1.4, sky: "#3a4a80", ground: "#1c1a30", hemiI: 0.3,
    bias: -0.0004, normalBias: 0.02,
  },
  // dawn: low pink-gold sun across the frame, lavender shade, soft peach haze (softer and cooler than golden)
  dawn: {
    az: 60, el: 9, pool: 0,
    lit: [1.45, 0.98, 0.78], shade: [0.26, 0.24, 0.42], lift: [0.05, 0.06, 0.14], lambert: 0.35, sideK: 0.84, term: 0.1,
    charTint: [1.0, 0.86, 0.8], charShade: 0.84, charGrad: 0.09, bodyGrad: 0.22, sideTint: [0.85, 0.82, 1.0],
    blob: [0.68, 0.64, 0.82], actorShadow: true,
    top: "#7a86c4", hor: "#f6c2a8", skyCurve: [0, 0.5, 0.8], fog: "#e9c0b4", fogNear: 30, fogFar: 260, sunDisc: "#ffe0c8",
    sunCol: "#ffc8a0", sunI: 4.0, sky: "#c8b8e0", ground: "#8a7080", hemiI: 0.5,
    bias: -0.0006, normalBias: 0.03,
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
export const LOOK: Record<Light, WorldLook> = { ...LOOK2, lamp: { ...LOOK2.golden, sky: { c: ["#24305e", "#1e2a56", "#19224a", "#141b3f", "#0f1432"], e: [0, 3, 8, 16, 40] }, bounce: [0, 0, 0], sat: 1.15 }, window: { ...LOOK2.day, sat: 1.12 },
  sea: { ...LOOK2.day, sky: { c: ["#155a8a", "#1a6f9f", "#2a8fc0", "#56b3d6", "#9fe3f0"], e: [0, 8, 20, 40, 70] }, sat: 1.1 },
  shallow: { ...LOOK2.day, sky: { c: ["#3fb6c4", "#5fcad2", "#8fdedf", "#b5ece9", "#d8f8f4"], e: [0, 8, 20, 40, 70] }, sat: 1.12 },
  night: { ...LOOK2.golden, sky: { c: ["#2c3a6e", "#24305e", "#1a2350", "#121a40", "#0b1030"], e: [0, 4, 10, 22, 50] }, bounce: [0, 0, 0.02], sat: 1.05,
    water: { ...LOOK2.golden.water, far: "#2c3a6e", crest: "#8ea4d8", glint: "#e8eeff" } },
  dawn: { ...LOOK2.golden, sky: { c: ["#f6c2a8", "#eab4b0", "#c8a8c8", "#9a9ccc", "#7a86c4"], e: [0, 4, 10, 20, 45] }, bounce: [0.03, 0.02, 0.03], sat: 1.05 } };
/** cloud colour multiplier per light (default 1.1 grey, the clouds' look before 2026-11-07) */
export const CLOUD_TINT: Partial<Record<Light, C3>> = { night: [0.32, 0.38, 0.6], dawn: [1.05, 0.95, 1.0] };
/** grade, cloud and contact-blob palettes exist for day and golden only */
export const base = (l: Light): "day" | "golden" => (l === "golden" || l === "lamp" || l === "night" || l === "dawn" ? "golden" : "day");
