import * as THREE from "three";
import { Batch, boxGeo, quad, tri, V } from "./geom";
import { twoTone } from "./shade";
import { NOINK } from "./ink";
import { ctex, jit } from "./paint";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { staticFile } from "remotion";

/** CC0 Poly Pizza models (Kenney / Quaternius / CreativeTrio), exported from Blender into public/props
 *  (credits in CREDITS.txt). buildSets places them only once loadProps() has resolved. */
const PROP_FILES = ["toaster", "microwave", "stove", "houseplant", "tree", "palm", "bed_single", "nightstand", "alarm_clock", "bookcase_books", "sell_booth"] as const;
type PropName = (typeof PROP_FILES)[number];
const KIT = new Map<PropName, THREE.Object3D>();
let kitP: Promise<void> | undefined;
/** Outdoor GLB kit (public/props/outdoor/, MANIFEST.md: metres, base-centre origin, fronts +Z). outdoor() places a listed
 *  name and falls back to primitives when a file is missing or broken (a failed load is skipped, not fatal). */
const OUTDOOR_FILES = ["house_a", "house_b", "apartment_block", "tree_round", "tree_pine", "pine_cluster", "cactus", "mesa_rock", "dune",
  "haystack", "sailboat", "buoy", "wave_tile", "fountain", "car_small", "car_van", "bench", "street_lamp", "mountain_peak", "meadow_flowers", "wooden_cart",
  "windmill", "ferris_wheel", "water_tower", "cow", "sheep", "lighthouse", "rock_cluster",
  "hot_air_balloon", "small_plane"]; // round 2 picks: CC0, plus the two CC-BY sky props for ep12's falls (credit them in the description)
const OUT = new Map<string, THREE.Object3D>();
/** backdrop panoramas public/backdrops/<biome>_<mid|far>.png (Blender agent, README.md there); a missing file = no layer */
const BD = new Map<string, THREE.Texture>();
const bdKeys = () => [...new Set(Object.values(SETS).flatMap((v) => v.backdrop ? [`${v.backdrop.biome}_mid`, `${v.backdrop.biome}_far`] : []))];
export const loadProps = () => (kitP ??= Promise.all([
  ...bdKeys().map((k) => new THREE.TextureLoader().loadAsync(staticFile(`backdrops/${k}.png`)).then((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; BD.set(k, t); }, () => undefined)),
  ...PROP_FILES.map((n) =>
  new GLTFLoader().loadAsync(staticFile(`props/${n}.glb`)).then((g) => { g.scene.updateMatrixWorld(true); KIT.set(n, g.scene); })),
  ...OUTDOOR_FILES.map((n) => new GLTFLoader().loadAsync(staticFile(`props/outdoor/${n}.glb`)).then((g) => { g.scene.updateMatrixWorld(true); OUT.set(n, g.scene); }, () => undefined)),
]).then(() => undefined));

export type V3 = [number, number, number];
export type SetId = "home" | "yard" | "forest" | "snow" | "bedroom"
  | "counter" | "floor" | "kitchen" | "beach" | "reef" | "bathroom" | "party" | "lagoon" | "rooftops" | "street" | "park"
  | "town" | "desert" | "sea" | "mountains" | "field" | "west";
export type CamHint = { pos: V3; look: V3; fov: number };
/** distant scenery rings round the set origin (farLayers below): painted, no ink, hazed by the set's fog */
export type FarKind = "hills" | "skyline" | "dunes" | "sea" | "mountains";
/** fog: [near, far] m replacing the light's range (big outdoor sets seen from 20-1000 m); far: distant geometry rings
 *  (the fallback); backdrop: painted panorama cylinders (mid / far = radius m, defaults 450 / 950), used when the PNGs exist */
export type SetInfo = { origin: V3; indoor: boolean; spots: Record<string, V3>; cams: Record<string, CamHint>; fog?: [number, number]; far?: FarKind[];
  backdrop?: { biome: string; mid?: number; far?: number } };

// Metres, local +z is the open camera side. All public staging coordinates are world-space.
const info = (x: number, indoor: boolean, spots: Record<string, V3>, cams: Record<string, CamHint>, more: Pick<SetInfo, "fog" | "far" | "backdrop"> = {}): SetInfo => {
  const world = ([a, b, c]: V3): V3 => [x + a, b, c];
  return { origin: [x, 0, 0], indoor, ...more,
    spots: Object.fromEntries(Object.entries(spots).map(([k, v]) => [k, world(v)])),
    cams: Object.fromEntries(Object.entries(cams).map(([k, v]) => [k, { ...v, pos: world(v.pos), look: world(v.look) }])) };
};
const cam = (pos: V3, look: V3, fov = 40): CamHint => ({ pos, look, fov });
export const SETS: Record<SetId, SetInfo> = {
  // the channel's home: open kitchen + dining table, big window on the back wall
  home: info(0, true, { you: [0.4, 0, -0.9], table: [0.2, 0, 0.25], window: [0.6, 1.65, -3.5] }, {
    wide: cam([0.4, 1.6, 6.0], [0.2, 0.9, -1.2], 44),
  }),
  // front yards + a crossing
  yard: info(1600, false, { you: [-1.4, 0, -1.2], neighbor: [3.2, 0, -3.2], corner: [7.2, 0, 0.5], lamp: [-3.2, 0, 0.6], light: [8.4, 0, 1.1], booth: [-18, 0, 0.6] }, {
    wide: cam([0, 1.5, 8.5], [0.8, 1.0, -3], 46),
  }),
  forest: info(1800, false, { you: [0, 0, 0], bud: [1.1, 0, -1.2] }, {
    wide: cam([0, 1.4, 6], [0, 1.6, -4], 46),
  }),
  snow: info(2000, false, { you: [0, 0, 0], bud: [1.1, 0, -1.2] }, {
    wide: cam([0, 1.4, 6], [0, 1.6, -4], 46),
  }),
  // the sleep room: bed against the back wall, nightstand lamp, a night window
  bedroom: info(2200, true, { you: [0.9, 0, -0.9], bed: [-1.1, 0, -2.35], nightstand: [0.15, 0, -3.05], window: [1.75, 1.65, -3.5] }, {
    wide: cam([0.4, 1.6, 5.2], [0.2, 0.9, -1.2], 44),
  }),
  // ---- ep07+ (user 2026-11-06: new settings per episode) ----
  // you at 1 cm on a kitchen countertop, everything x170: tiles 17 m, a mug tower, a crumb boulder, the tap and its drip;
  // the counter edge at z = +4 is a 150 m cliff (the floor set is its foot)
  counter: info(2400, false, { you: [0, 0, 0], edge: [1.5, 0, 3.6], crumb: [-2.2, 0, -0.8], drip: [3.2, 0, -2.2], mug: [-9, 0, -16] }, {
    wide: cam([0.5, 1.4, 6.5], [0, 1.2, -3], 46),
  }),
  // the floor under the counter at x170: planks 25 m wide, the cabinet kick plate as a wall behind; the cat comes from +x
  floor: info(2600, false, { you: [0, 0, 0], land: [0.6, 0, 0.8], cat: [9, 0, -3] }, {
    wide: cam([0.5, 1.4, 6.5], [0, 1.2, -3], 46),
  }),
  // a normal-scale kitchen corner (mint + white, not the channel's peach home): the full-size ending
  kitchen: info(2800, true, { you: [0.3, 0, -0.9], counter: [0, 0, -3.0] }, {
    wide: cam([0.4, 1.6, 5.2], [0.2, 1.0, -1.2], 44),
  }),
  beach: info(3000, false, { you: [0, 0, 0], water: [0, 0, -6], chair: [-4.5, 0, -2.5] }, {
    wide: cam([0, 1.5, 7], [0, 1.0, -4], 46),
  }),
  // deep blue reef, rocky and dark (ep08); light "sea"
  reef: info(3200, false, { you: [0, 1.2, 0], rock: [-3, 0, -3] }, {
    wide: cam([0, 1.8, 7], [0, 1.4, -3], 50),
  }),
  bathroom: info(3400, true, { you: [0.9, 0, -0.9], tub: [-0.9, 0, -2.3], tap: [-2.1, 0.75, -2.3] }, {
    wide: cam([0.4, 1.6, 5.2], [0.0, 0.9, -1.2], 44),
  }),
  // a night house party: string lights, sofa, speaker, balloons (ep09)
  party: info(3600, true, { you: [-0.4, 0, -1.6], sofa: [-0.4, 0, -2.6], speaker: [2.6, 0, -2.8] }, {
    wide: cam([0.4, 1.6, 5.2], [0.0, 1.0, -1.2], 44),
  }),
  // shallow turquoise lagoon, white sand, a sponge garden (ep09); light "shallow"; spot "sponge" = where the lead sponge sits
  lagoon: info(3800, false, { you: [0, 0, 0], sponge: [0, 0, 0], grass: [-3, 0, -2] }, {
    wide: cam([0, 1.4, 6], [0, 0.9, -3], 48),
  }),
  // city rooftops at y = 0; the street is 12 m below past the roof edge at z = +3 (ep10)
  rooftops: info(4000, false, { you: [0, 0, 0], edge: [0, 0, 3], tower: [-6, 0, -6], air: [0, 0, 5.5] }, {
    wide: cam([3, 1.6, 6], [0, 1.2, -2], 48),
  }),
  // a sunny hill lawn with one big tree, sunflowers, a bench and a tennis court (ep11)
  park: info(4400, false, { you: [0, 0, 0], tree: [-5, 0, -4], bench: [3.2, 0, -2.4], court: [12, 0, -6] }, {
    wide: cam([0, 1.5, 7], [0, 1.2, -3], 46),
  }),
  street: info(4200, false, { you: [0, 0, 1.5], anvil: [0.5, 0, 1.8], lamp: [-3, 0, 2.6], awning: [3.5, 0, -1.2] }, {
    wide: cam([0, 1.5, 8.5], [0, 1.4, -2], 46),
  }),
  // ---- ep12 big outdoor sets (2026-11-07): 3 km apart, far past every older set and the 1500 m camera far plane ----
  // a town of 13 x 13 blocks (48 m pitch), park in the centre block; "street" = the detailed lane for the ~20 m shots
  town: info(10000, false, { you: [0, 0, 0], park: [0, 0, 0], street: [48, 0, 6], square: [-48, 0, 0] }, {
    air: cam([0, 300, 260], [0, 0, -40], 50), low: cam([30, 20, 60], [48, 0, 0], 50), wide: cam([48, 1.6, 20], [48, 1.6, 0], 46),
  }, { fog: [80, 1300], far: ["skyline", "hills"], backdrop: { biome: "town" } }),
  // golden dunes, cacti, a mesa, a far mountain wall
  desert: info(13000, false, { you: [0, 0, 0], mesa: [-120, 0, -260] }, {
    wide: cam([0, 1.5, 8], [0, 1.6, -4], 46), air: cam([0, 260, 220], [0, 0, -60], 50),
  }, { fog: [60, 1250], far: ["dunes", "mountains"], backdrop: { biome: "desert" } }),
  // open sea to the horizon: swells, foam, a sailboat and a buoy
  sea: info(16000, false, { you: [0, 0, 0], boat: [14, 0, -30] }, {
    wide: cam([0, 4, 14], [0, 1, -20], 46), air: cam([0, 260, 220], [0, 0, -60], 50),
  }, { fog: [60, 1300], far: ["sea"], backdrop: { biome: "sea" } }),
  // snowy peaks round a high pine valley
  mountains: info(19000, false, { you: [0, 0, 0], peak: [60, 0, -320] }, {
    wide: cam([0, 2, 12], [0, 6, -30], 50), air: cam([0, 320, 240], [0, 0, -60], 50),
  }, { fog: [80, 1300], far: ["mountains", "hills"], backdrop: { biome: "mountains" } }),
  // a golden meadow with haystacks and a fence, rolling hills behind (the landing)
  field: info(22000, false, { you: [0, 0, 0], hay: [-6, 0, -8] }, {
    wide: cam([0, 1.5, 8], [0, 1.2, -4], 46), air: cam([0, 260, 220], [0, 0, -60], 50),
  }, { fog: [50, 1200], far: ["hills"], backdrop: { biome: "field" } }),
  // ep13: 1899 Wyoming. Rails along x at z = -4: rail yard (x -120), wreck + second train (x 0), night train (x 60), depot (x 130),
  // open prairie rails (x -320); badlands round z -150; a small car interior at z 300
  west: info(25000, false, { you: [0, 0, 0], yard: [-120, 0, -4], wreck: [0, 0, -4], night: [60, 0, -4], depot: [130, 0, -4], prairie: [-320, 0, -4], bad: [0, 0, -150], ridge: [70, 0, -170], inside: [0, 0, 300] }, {
    wide: cam([0, 1.6, 12], [0, 1.6, -4], 46),
  }, { fog: [60, 1250], far: ["dunes", "mountains"], backdrop: { biome: "desert" } }),
};

// Static art profile. Change palette, architecture sizes and prop placement here; no runtime/domain decisions.
export const SET_ART = {
  wallHeight: 2.7, roomWidth: 8, roomDepth: 8, back: -3.5, groundSize: 140,
  palette: { wood: "#b59063", trim: "#f3e7ce", cream: "#e8dcc1", sage: "#bdcfb5", blue: "#5b8eaa",
    teal: "#2F6E73", red: "#b93c51", yellow: "#edcf53", metal: "#536479", paper: "#f5efd9",
    brick: "#a76a66", green: "#83ad69", foliage: "#68945d", siding: "#D9C7A3", roof: "#5B4636", pool: "#3fc1c9" },
  home: { tableTop: 0.76, window: { x: 0.6, w: 2.4 } },
  bedroom: { window: { x: 1.75, w: 2.0 } },
};
export const POOLS: Partial<Record<SetId, V3>> = { home: [0.2, 2.15, 0.25], yard: [-3.2, 3.5, 0.85], bedroom: [0.05, 1.05, -3.05],
  kitchen: [0.2, 2.15, -0.6], bathroom: [0.2, 2.2, -1.0], party: [0.0, 2.1, -1.0], street: [-3, 4.3, 2.85] }; // the pendant over the table, the street lamp
const P = SET_ART.palette;
// the engine's own twoTone: a lam() from another video folder binds THAT folder's light uniforms (a silently split rig)
const mats = new Map<string, THREE.MeshLambertMaterial>();
const lam = (key: string, make: () => THREE.MeshLambertMaterialParameters) => {
  let m = mats.get(key);
  if (!m) mats.set(key, (m = twoTone(new THREE.MeshLambertMaterial(make()))));
  return m;
};
type Surface = "wood" | "brick" | "tile" | "cloth" | "wallpaper" | "plain";
// Small repeatable painted swatches: seams, uneven pigment, grain. No font or external assets.
function paint(kind: Surface, color: string): THREE.CanvasTexture {
  return ctex(`set.v7.${kind}.${color}`, 1024, 1024, (g, r) => {
    const S = 1024;
    g.fillStyle = color; g.fillRect(0, 0, S, S);
    if (kind === "wallpaper") { // indoor walls (LOOK_SCORES 2026-11-04: plain walls scored textures 6/10): soft stripes + a small motif
      for (let x = 0, k = 0; x < S; x += 64, k++) { g.fillStyle = jit(r, color, .05, 0, k % 2 ? .05 : -.02); g.fillRect(x, 0, 64, S); }
      g.fillStyle = "rgba(255,246,220,.28)"; for (let x = 0; x < S; x += 128) g.fillRect(x + 62, 0, 4, S);
      g.fillStyle = "rgba(30,26,44,.13)"; for (let y = 32, row = 0; y < S; y += 64, row++) for (let x = (row % 2) * 64 + 32; x < S; x += 128) {
        g.beginPath(); g.moveTo(x, y - 9); g.lineTo(x + 7, y); g.lineTo(x, y + 9); g.lineTo(x - 7, y); g.fill(); }
    } else if (kind !== "plain") {
      const pitch = kind === "brick" ? 128 : 256;
      for (let y = 0, row = 0; y < S; y += pitch, row++) {
        const width = kind === "wood" ? 1024 : 256;
        for (let x = -(row % 2) * (kind === "brick" ? 128 : 0); x < S; x += width) {
          g.fillStyle = jit(r, color, kind === "cloth" ? .12 : .15, 2, .07);
          g.fillRect(x + 5, y + 5, width - 10, pitch - 10);
          g.fillStyle = "rgba(255,242,210,.22)"; g.fillRect(x + 6, y + 6, width - 12, 4);
          g.fillStyle = "rgba(27,24,37,.45)"; g.fillRect(x, y, width, 6);
          // What If: no grain strokes inside a plank, only its seams. 16 thin grain lines per plank crawled as moire under a
          // moving camera, and the no-green effect turned their brown/cream hue into red/blue stripes (user 2026-11-05)
          if (kind === "cloth") { g.strokeStyle = "rgba(255,244,210,.4)"; g.lineWidth = 5; g.strokeRect(x + 22, y + 22, width - 44, pitch - 44); }
        }
      }
    }
    for (let i = 0; i < 380; i++) {
      g.fillStyle = jit(r, color, .06, 0, .03); g.globalAlpha = .18;
      g.fillRect(r() * S, r() * S, 8 + r() * 70, 3 + r() * 14);
    }
    g.globalAlpha = 1;
    const shade = g.createLinearGradient(0, 0, S, S);
    shade.addColorStop(0, "rgba(255,245,210,.06)"); shade.addColorStop(1, "rgba(24,30,48,.12)");
    g.fillStyle = shade; g.fillRect(0, 0, S, S);
  });
}
function material(color: string, kind: Surface = "plain") {
  return lam(`set.${kind}.${color}`, () => ({ map: paint(kind, color) }));
}

// Geometry ownership stays in each set builder; one merged draw batch per material per set.
class SetBuilder {
  readonly batch = new Batch();
  /** slabs thinner than 3 cm (rugs, court lines, pool stripes, paper) are painted detail: no ink outline. As geometry
   *  they were inked on and off at range and read as dotted noise (fb0016) */
  readonly flat = new Batch();
  /** true while building a painted backdrop (the view through a window): no ink, its lines dotted at 10+ m (look_qa 50) */
  paint = false;
  constructor(readonly group: THREE.Group) {}
  box(p: V3, size: V3, color: string, kind: Surface = "plain", rotation = 0) {
    const [w, h, d] = size;
    // thinnest side, not just height: book labels / island grooves (< 3 cm deep or wide) inked as lone dots (look_qa 37)
    const into = this.paint || Math.min(w, h, d) < 0.03 ? this.flat : this.batch;
    const geo = Math.min(w, h, d) >= .03 && Math.max(w, h, d) < 5
      ? new RoundedBoxGeometry(w, h, d, 1, Math.min(.045, w / 6, h / 6, d / 6))
      : boxGeo(V(-w / 2, -h / 2, -d / 2), V(w / 2, h / 2, d / 2), kind === "plain" ? 0 : 2.4, true);
    const m = new THREE.Matrix4().compose(V(...p), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), rotation), V(1, 1, 1));
    into.add(geo, material(color, kind), m); geo.dispose();
  }
  geo(g: THREE.BufferGeometry, p: V3, color: string) {
    this.batch.add(g, material(color), new THREE.Matrix4().makeTranslation(...p)); g.dispose();
  }
  beam(a: V3, b: V3, width: number, color: string) {
    const start = V(...a), end = V(...b), geo = new THREE.BoxGeometry(width, start.distanceTo(end), width);
    geo.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), end.clone().sub(start).normalize()));
    this.geo(geo, start.add(end).multiplyScalar(0.5).toArray() as V3, color);
  }
  cylinder(p: V3, radius: number, height: number, color: string) {
    this.geo(new THREE.CylinderGeometry(radius, radius, height, 12), p, color);
  }
  finish() {
    this.batch.build(this.group);
    const n = this.group.children.length;
    this.flat.build(this.group, false);
    for (const o of this.group.children.slice(n)) { o.layers.set(NOINK); o.userData.noCast = true; }
  }
}
/** kit model, base on y, centred on x/z, scaled to height h, facing +z turned by yaw; materials keep the model's colour
 *  (or `recolor` by material name) on the engine's own two-tone rig. Returns false when the kit is not loaded. */
function prop(b: SetBuilder, name: PropName, [x, y, z]: V3, h: number, yaw = 0, recolor: Record<string, string> = {}) {
  const o = KIT.get(name);
  if (!o) return false;
  const box = new THREE.Box3().setFromObject(o), c = box.getCenter(new THREE.Vector3()), s = h / Math.max(0.01, box.max.y - box.min.y);
  const at = new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw), V(s, s, s))
    .multiply(new THREE.Matrix4().makeTranslation(-c.x, -box.min.y, -c.z));
  o.traverse((m) => {
    if (!(m instanceof THREE.Mesh)) return;
    const src = m.material as THREE.MeshStandardMaterial, hex = recolor[src.name] ?? `#${src.color.getHexString()}`;
    const mat = src.map ? lam(`prop.${name}.${src.name}`, () => ({ map: src.map })) : material(hex);
    (b.paint ? b.flat : b.batch).add(m.geometry, mat, at.clone().multiply(m.matrixWorld));
  });
  return true;
}
function framed(b: SetBuilder, x: number, y: number, z: number, w: number, h: number, color: string) {
  b.box([x, y, z], [w + 0.12, h + 0.12, 0.08], P.trim);
  b.box([x, y, z + 0.052], [w, h, 0.035], color);
}
/** Art-only profile: all repeated placements and palette choices stay together and tunable. */
const ROUND3 = {
  panel: { bottom: .18, top: .88, pitch: .55, color: "#c6a45e" },
  shelf: { y: 1.62, z: -3.12, w: 1.55, toys: [P.red, P.yellow, P.blue, P.green] },
  night: { z: -15, pane: [2.8, 1.9, .9] as V3 },
  notes: [P.red, P.yellow, P.blue, P.green, "#c394bd", P.paper],
};
function glowPane(b: SetBuilder, p: V3, size: V3) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshBasicMaterial({ color: new THREE.Color(...ROUND3.night.pane) }));
  m.position.set(...p); m.layers.set(NOINK); m.userData.noCast = true; b.group.add(m);
}
function windowView(b: SetBuilder, x: number, w: number, day: boolean) {
  const z = -3.36;
  for (const dx of [-w / 2 - .04, w / 2 + .04]) b.box([x + dx, 1.65, z], [.08, 1.41, .16], P.trim);
  for (const y of [1, 2.3]) b.box([x, y, z], [w + .24, .09, .18], P.trim);
  b.box([x, 1.65, z + .08], [.055, 1.3, .055], P.trim);
  b.box([x, 1.65, z + .08], [w, .055, .055], P.trim);
  b.box([x, .98, z + .12], [w + .3, .08, .35], P.trim);
  const farZ = ROUND3.night.z;
  b.paint = true;
  b.box([x, 1.7, farZ - 2], [18, 7, .2], day ? "#91bed3" : "#293956");
  b.box([x, -.15, -9], [14, .2, 11], day ? P.green : P.metal, "tile");
  for (const dx of [-3, 0, 3]) {
    b.box([x + dx, 1.8, farZ], [2.3, 3.6, 1.8], day ? P.siding : "#40516a", "brick");
    for (const wx of [-.6, .6]) for (const y of [1.3, 2.5]) {
      if (day) b.box([x + dx + wx, y, farZ + .93], [.6, .7, .04], P.blue);
      else glowPane(b, [x + dx + wx, y, farZ + .93], [.6, .7, .025]);
    }
  }
  if (day) for (const dx of [-2, 2]) prop(b, "tree", [x + dx, 0, -10], 3.8);
  b.paint = false;
}
function wainscot(b: SetBuilder, color: string) {
  const p = ROUND3.panel;
  // Side wall panels leave every doorway/window and story-relevant back-wall position untouched.
  b.box([3.90, (p.bottom + p.top) / 2, .2], [.018, p.top - p.bottom, 6.9], color, "wood");
  b.box([3.87, p.top, .2], [.05, .07, 6.9], P.trim);
  for (let z = -3; z < 3.5; z += p.pitch) b.box([3.88, .52, z], [.018, .62, .035], P.trim);
}
function room(b: SetBuilder, wall: string, doorway = false, opening?: { x: number; w: number }) {
  const { roomWidth: w, roomDepth: d, wallHeight: h, back: z } = SET_ART;
  b.box([0, -0.09, z + d / 2], [w, 0.18, d], P.wood, "wood");
  b.box([-w / 2, h / 2, z + d / 2], [0.14, h, d], wall, "wallpaper");
  b.box([w / 2, h / 2, z + d / 2], [0.14, h, d], wall, "wallpaper");
  // Build the wall around actual openings, rather than painting opaque blue glass on it.
  const holes = [...(doorway ? [{ x: 2.7, w: 1.2, lo: 0, hi: 2.2 }] : []),
    ...(opening ? [{ ...opening, lo: 1.025, hi: 2.275 }] : [])].sort((a, b) => a.x - b.x);
  let edge = -w / 2;
  for (const o of holes) {
    const left = o.x - o.w / 2, right = o.x + o.w / 2;
    b.box([(edge + left) / 2, h / 2, z], [left - edge, h, .14], wall, "wallpaper");
    if (o.lo > 0) b.box([o.x, o.lo / 2, z], [o.w, o.lo, .14], wall, "wallpaper");
    b.box([o.x, (h + o.hi) / 2, z], [o.w, h - o.hi, .14], wall, "wallpaper");
    edge = right;
  }
  b.box([(edge + w / 2) / 2, h / 2, z], [w / 2 - edge, h, .14], wall, "wallpaper");
  if (doorway) {
    b.box([2.7, 1.35, z - 4], [2, h, .12], P.cream, "wood");
    b.box([2.7, -.05, z - 2], [1.4, .1, 4], P.wood, "wood");
    for (const x of [2.07, 3.33]) b.box([x, 1.1, z + .1], [.1, 2.2, .18], P.trim);
    b.box([2.7, 2.2, z + .1], [1.36, .12, .18], P.trim);
    b.box([3.35, 1.05, z + .55], [.08, 2.1, 1], P.teal);
    lamp(b, [2.7, 1.8, z - 3.8]);
    framed(b, 2.7, 1.2, z - 3.9, .6, .55, P.red);
  }
  b.box([0, h - .09, z + .09], [w, .18, .14], P.trim, "wood");
  for (const x of [-3.88, 3.88]) b.box([x, h - .09, z + d / 2], [.16, .18, d], P.trim);
  for (const x of [-2.7, 2.1]) {
    b.box([x, .3, z + .09], [.15, .22, .04], P.trim);
    for (const dx of [-.035, .035]) b.box([x + dx, .3, z + .115], [.012, .04, .008], P.metal);
  }
  b.box([3.5, 1.2, z + .09], [.16, .22, .04], P.trim);
  b.box([3.5, 1.2, z + .12], [.07, .1, .035], P.paper);
  b.box([0, 0.08, z + 0.09], [doorway ? 4 : w, 0.16, 0.08], P.trim);
  for (const x of [-3.9, 3.9]) b.box([x, 0.08, z + d / 2], [0.08, 0.16, d], P.trim);
}
function table(b: SetBuilder, p: V3, width: number, depth: number, top: number, color = P.wood) {
  b.box([p[0], top - 0.045, p[2]], [width, 0.09, depth], color, "wood");
  for (const x of [-1, 1]) for (const z of [-1, 1])
    b.beam([p[0] + x * (width / 2 - 0.09), 0, p[2] + z * (depth / 2 - 0.09)], [p[0] + x * (width / 2 - 0.09), top - 0.09, p[2] + z * (depth / 2 - 0.09)], 0.08, P.metal); // square legs: rounded ones inked dots at the floor
}
function chair(b: SetBuilder, x: number, z: number, color = P.blue) {
  b.box([x, 0.44, z], [0.44, 0.07, 0.43], color);
  b.box([x, 0.72, z + 0.19], [0.44, 0.48, 0.07], color);
  for (const dx of [-0.16, 0.16]) for (const dz of [-0.15, 0.15]) b.beam([x + dx, 0, z + dz], [x + dx, 0.42, z + dz], 0.045, P.metal);
}
/** lamp with a glowing bulb at `p` (a pool centre): on a desk arm from `foot`, or hung on a cord when foot is omitted.
 *  Separate meshes flagged noCast: they sit at the light's origin and must not shadow the pool they make. */
function lamp(b: SetBuilder, [x, y, z]: V3, foot?: number) {
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, py: number) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, py, z); m.userData.noCast = true; b.group.add(m);
  };
  add(new THREE.CylinderGeometry(0.07, 0.17, 0.2, 16), material(P.teal), y + 0.06);
  add(new THREE.SphereGeometry(0.065, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 4.4, 2.2) }), y - 0.05);
  if (foot === undefined) add(new THREE.CylinderGeometry(0.012, 0.012, SET_ART.wallHeight - y), material(P.metal), (SET_ART.wallHeight + y) / 2);
  else {
    add(new THREE.CylinderGeometry(0.012, 0.012, y - foot), material(P.metal), (y + foot) / 2);
    add(new THREE.CylinderGeometry(0.1, 0.12, 0.03, 16), material(P.metal), foot + 0.015);
  }
}
function tree(b: SetBuilder, x: number, z: number, scale = 1) {
  if (prop(b, "tree", [x, 0, z], 4.2 * scale, x * 1.7)) return;
  b.box([x, scale, z], [0.3 * scale, 2 * scale, 0.3 * scale], P.roof, "wood");
  b.geo(new THREE.SphereGeometry(.9 * scale, 12, 8), [x + .8 * scale, 3.5 * scale, z], P.green);
  b.geo(new THREE.SphereGeometry(1.4 * scale, 12, 8), [x, 2.8 * scale, z], P.foliage);
  b.geo(new THREE.SphereGeometry(scale, 12, 8), [x - 0.7 * scale, 2.5 * scale, z + 0.3], P.green);
}
type Rect = [number, number, number, number]; // xmin, zmin, xmax, zmax
function groundPatch(b: SetBuilder, [x0, z0, x1, z1]: Rect, color: string, kind: Surface) {
  b.box([(x0 + x1) / 2, -0.06, (z0 + z1) / 2], [x1 - x0, 0.12, z1 - z0], color, kind);
}
function groundAround(b: SetBuilder, bounds: Rect, hole: Rect, color: string, kind: Surface) {
  const [x0, z0, x1, z1] = bounds, [hx0, hz0, hx1, hz1] = hole;
  groundPatch(b, [x0, z0, hx0, z1], color, kind);
  groundPatch(b, [hx1, z0, x1, z1], color, kind);
  groundPatch(b, [hx0, z0, hx1, hz0], color, kind);
  groundPatch(b, [hx0, hz1, hx1, z1], color, kind);
}

/** a painted sign: bold text on a coloured card (canvas texture) facing +z, turned by rot */
function sign(b: SetBuilder, key: string, [x, y, z]: V3, w: number, h: number, bg: string, fg: string, text: string | ((g: CanvasRenderingContext2D, W: number) => void), rot = 0) {
  const tex = ctex(`sign.${key}`, Math.round(256 * w / h), 256, (g) => {
    const W = g.canvas.width; g.fillStyle = bg; g.fillRect(0, 0, W, 256);
    g.strokeStyle = "#1f1a2c"; g.lineWidth = 12; g.strokeRect(6, 6, W - 12, 244);
    if (typeof text === "function") { text(g, W); return; }
    g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
    const lines = text.split("\n"), size = Math.min(200 / lines.length, (W * 0.9) / Math.max(...lines.map((l) => l.length)) * 1.6);
    g.font = `900 ${size}px "Arial Black", Arial, sans-serif`;
    lines.forEach((l, i) => g.fillText(l, W / 2, 128 + (i - (lines.length - 1) / 2) * size * 1.05));
  });
  const m = new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), rot), V(1, 1, 1));
  const back = new THREE.Vector3(0, 0, -0.02).applyAxisAngle(V(0, 1, 0), rot);
  b.box([x + back.x, y, z + back.z], [w + 0.06, h + 0.06, 0.035], P.trim, "plain", rot);
  b.batch.add(quad(V(-w / 2, -h / 2, 0.001), V(w / 2, -h / 2, 0.001), V(w / 2, h / 2, 0.001), V(-w / 2, h / 2, 0.001)).applyMatrix4(m),
    lam(`sign.${key}`, () => ({ map: tex })));
}


/** the channel's home: peach walls, terracotta cabinets on the back wall under a big window, a round dining table in the
 *  middle under a pendant lamp, fridge left, open shelf + clock right. Our own layout (no island, no teal). */
function home(b: SetBuilder) {
  const { x: wx, w: ww } = SET_ART.home.window, top = SET_ART.home.tableTop, z = SET_ART.back;
  room(b, "#f1d2b0", false, { x: wx, w: ww });
  windowView(b, wx, ww, true);
  b.beam([wx - ww / 2 - 0.35, 2.42, z + 0.16], [wx + ww / 2 + 0.35, 2.42, z + 0.16], 0.04, P.metal); // curtain rod
  // back-wall counter run: terracotta doors, cream worktop, a sink under the window
  for (const x of [-2.2, -1.3, -0.4, 0.5, 1.4, 2.3]) {
    if (x === -1.3 && prop(b, "stove", [x, 0, z + 0.52], 0.92)) continue;
    b.box([x, 0.44, z + 0.5], [0.88, 0.88, 0.78], "#c8603f", "wood");
    b.box([x, 0.65, z + 0.9], [0.22, 0.04, 0.04], P.metal);
  }
  b.box([0.05, 0.91, z + 0.5], [5.4, 0.06, 0.86], "#efe6d2", "tile");
  b.box([wx, 0.945, z + 0.5], [0.7, 0.02, 0.45], P.metal);
  b.beam([wx, 0.95, z + 0.2], [wx, 1.22, z + 0.2], 0.045, P.metal);
  for (let i = 0; i < 9; i++) b.box([-2.6 + i * 0.6, 1.2, z + 0.08], [0.58, 0.5, 0.03], i % 2 ? "#f7efe0" : "#e9b44c", "tile"); // backsplash
  prop(b, "toaster", [-2.3, 0.94, z + 0.45], 0.22);
  prop(b, "microwave", [2.2, 0.94, z + 0.5], 0.3);
  // fridge (left wall corner), shelf with jars + a clock (right)
  b.box([-3.3, 1.0, z + 0.6], [0.9, 2.0, 0.8], "#f4f1ea");
  b.box([-3.3, 1.4, z + 1.01], [0.86, 0.02, 0.02], P.metal); b.box([-2.9, 1.1, z + 1.03], [0.04, 0.5, 0.05], P.metal);
  b.box([3.1, 1.75, z + 0.25], [1.1, 0.05, 0.36], P.wood, "wood");
  for (let i = 0; i < 4; i++) b.cylinder([2.7 + i * 0.27, 1.88, z + 0.25], 0.08, 0.2, ["#e9b44c", "#c8603f", "#5b8eaa", "#f7efe0"][i]);
  b.geo(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 24).rotateX(Math.PI / 2), [3.1, 2.25, z + 0.1], "#f7efe0");
  b.beam([3.1, 2.25, z + 0.14], [3.1, 2.4, z + 0.14], 0.025, "#1d1a3a"); b.beam([3.1, 2.25, z + 0.14], [3.2, 2.25, z + 0.14], 0.025, "#1d1a3a");
  // round dining table + two chairs + a rug, pendant lamp above
  const [tx, , tz] = SETS.home.spots.table.map((v, i) => v - SETS.home.origin[i]) as V3;
  b.box([tx, 0.006, tz], [3.0, 0.012, 2.2], "#7a4a8c", "cloth"); // rug
  b.geo(new THREE.CylinderGeometry(0.75, 0.75, 0.06, 32), [tx, top - 0.03, tz], P.wood);
  b.beam([tx, 0, tz], [tx, top - 0.06, tz], 0.12, P.metal);
  b.geo(new THREE.CylinderGeometry(0.35, 0.35, 0.03, 20), [tx, 0.015, tz], P.metal);
  chair(b, tx - 1.05, tz + 0.1, "#e9b44c"); chair(b, tx + 1.05, tz + 0.1, "#e9b44c");
  lamp(b, POOLS.home!);
  plant(b, -3.4, 2.4, 0, 1.6); plant(b, 3.3, 2.6, 0, 1.2);
}

/** the sleep room: dusk-blue walls, a bed under two pictures, nightstand with a lamp + alarm clock, a night window, clutter. */
function bedroom(b: SetBuilder) {
  const { x: wx, w: ww } = SET_ART.bedroom.window, z = SET_ART.back, [lx, ly, lz] = POOLS.bedroom!;
  room(b, "#a9bbd4", false, { x: wx, w: ww });
  windowView(b, wx, ww, false);
  b.beam([wx - ww / 2 - 0.4, 2.42, z + 0.16], [wx + ww / 2 + 0.4, 2.42, z + 0.16], 0.04, P.metal); // curtain rod
  for (const s of [-1, 1]) b.box([wx + s * (ww / 2 + 0.2), 1.48, z + 0.2], [0.42, 1.88, 0.08], P.teal, "cloth");
  const wood = "#8a5a3a";
  b.box([-1.1, 0.006, -1.9], [3.2, 0.012, 2.8], "#7a4a8c", "cloth"); // rug
  prop(b, "bed_single", [-1.1, 0, -2.35], 0.67, Math.PI, { wood, carpet: "#3f6c8c", carpetWhite: "#f3e7ce", metal: P.metal });
  prop(b, "nightstand", [lx + 0.1, 0, lz], 0.55, 0, { wood, _defaultMat: "#6e452c", metal: P.metal });
  lamp(b, [lx, ly, lz], 0.55);
  prop(b, "alarm_clock", [lx + 0.28, 0.55, lz + 0.05], 0.2);
  sign(b, "moon", [-1.65, 1.75, z + 0.11], 0.7, 0.9, "#1d2a55", "#ffd23f", (g, W) => { // a poster + a picture, not blank colour cards
    g.fillStyle = "#ffd23f"; g.beginPath(); g.arc(W / 2, 110, 62, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#1d2a55"; g.beginPath(); g.arc(W / 2 + 28, 96, 54, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#f5efd9"; for (const [x, y] of [[.2, .2], [.8, .3], [.25, .75], [.7, .8], [.5, .9]]) g.fillRect(x * W, y * 256, 9, 9);
  });
  sign(b, "hills", [-0.65, 1.8, z + 0.11], 0.6, 0.6, "#e9b44c", "#7a4a2a", (g, W) => {
    g.fillStyle = "#7a4a2a"; g.beginPath(); g.moveTo(10, 246); g.lineTo(W * .35, 90); g.lineTo(W * .6, 180); g.lineTo(W * .78, 110); g.lineTo(W - 10, 246); g.fill();
  });
  prop(b, "bookcase_books", [-3.3, 0, -2.6], 2.0, Math.PI / 2);
  // a low dresser under the window, in the main camera's view, with its clutter
  const dz = z + 0.42, dy = 0.42;
  b.box([wx, dy, dz], [1.5, 0.84, 0.56], wood, "wood");
  for (const y of [0.24, 0.6]) { b.box([wx, y, dz + 0.3], [1.36, 0.3, 0.04], "#b5763f"); for (const dx of [-0.35, 0.35]) b.box([wx + dx, y, dz + 0.33], [0.14, 0.05, 0.04], P.metal); }
  b.box([wx - 0.4, 0.9, dz], [0.3, 0.12, 0.22], "#c63939"); b.cylinder([wx + 0.45, 0.94, dz], 0.06, 0.2, P.yellow);
  // the morning's mess: a chair with a towel, a laundry basket, a plant
  chair(b, 3.0, 1.2, "#c8603f"); b.box([3.0, 0.8, 1.42], [0.34, 0.34, 0.09], "#f4f1ea", "cloth");
  b.cylinder([-2.45, 0.26, -2.85], 0.26, 0.52, "#c9b79a"); ball(b, [-2.45, 0.55, -2.85], 0.2, "#c63939");
  plant(b, -3.4, 2.2, 0, 1.2);
}

// ---------------- outdoor sets ----------------
function house(b: SetBuilder, x: number, z: number, wall: string, roof: string, door: string) {
  b.box([x, 1.9, z], [6.4, 3.8, 5], wall, "wood");
  b.geo(tri(V(-3.5, 0, 0), V(3.5, 0, 0), V(0, 2.0, 0)), [x, 3.8, z + 2.52], roof);
  for (const side of [-1, 1]) b.batch.add(quad(V(x, 5.8, z - 2.7), V(x + side * 3.5, 3.8, z - 2.7), V(x + side * 3.5, 3.8, z + 2.7), V(x, 5.8, z + 2.7)), material(roof));
  framed(b, x, 1.05, z + 2.53, 1.0, 2.1, door);
  for (const wx of [-2, 2]) { framed(b, x + wx, 1.75, z + 2.53, 1.2, 1.1, "#9cc3d6"); b.box([x + wx, 1.12, z + 2.66], [1.4, 0.08, 0.2], P.trim); }
  b.box([x, 0.08, z + 3.0], [1.4, 0.16, 0.8], "#c9b79a", "tile"); // step
  b.box([x + 2.4, 5.0, z - 0.8], [0.6, 1.6, 0.6], P.brick, "brick"); // chimney
}
function picket(b: SetBuilder, x0: number, x1: number, z: number) {
  for (let x = x0; x <= x1 + 1e-6; x += 0.32) b.box([x, 0.42, z], [0.09, 0.84, 0.05], P.trim);
  for (const y of [0.3, 0.65]) b.box([(x0 + x1) / 2, y, z - 0.04], [x1 - x0, 0.07, 0.04], P.trim);
}
function yard(b: SetBuilder) {
  const ext = SET_ART.groundSize / 2;
  groundAround(b, [-ext, -ext, ext, ext], [-24, -9, 24, 9], P.green, "plain");
  groundPatch(b, [-24, -9, 24, -0.2], "#6fa35a", "plain"); // the lawns
  groundPatch(b, [-24, -0.2, 24, 1.4], "#c9b79a", "tile"); // sidewalk
  groundPatch(b, [-24, 1.4, 24, 9], "#5d6382", "plain"); // road
  for (let x = -22; x < 24; x += 3) if (Math.abs(x - 9) > 2) b.box([x, 0.008, 5.2], [1.4, 0.016, 0.12], P.yellow);
  for (let k = 0; k < 7; k++) b.box([9 + (k - 3) * 0.6, 0.008, 5.2], [0.36, 0.016, 7.4], "#f3efe4"); // zebra crossing
  b.box([0, 0.08, 1.42], [48, 0.16, 0.16], "#a69a85"); // kerb
  for (let x = -0.7; x <= 0.7; x += 1.4) b.box([x, -0.004, -3.5], [0.9, 0.012, 6.4], "#c9b79a", "tile"); // garden paths
  house(b, -4.5, -10, "#d9c7a3", "#5b4636", P.teal);
  house(b, 4.5, -10, "#a7c4d9", "#8a4b32", P.red);
  house(b, 13.5, -10, "#e2b04e", "#5b4636", P.blue);
  house(b, -13.5, -10, "#b9748f", "#3e4a5c", P.yellow);
  picket(b, -8, -1.2, -0.4); picket(b, 1.2, 8, -0.4);
  b.box([0, 0.42, -4], [0.06, 0.84, 7], P.trim); // fence between the two front yards
  tree(b, -7.5, -5.5, 0.9); tree(b, 7.6, -6.2, 1); tree(b, -16, -4, 1.1); tree(b, 17, -4.5, 1); tree(b, 11.5, 11.5, 1.2); tree(b, -9, 12, 1.1);
  for (const x of [-6, -2.6, 2.6]) plant(b, x, -7.3, 0, 1.1);
  // street lamp (the night shots' light) + mailbox
  b.beam([-3.2, 0, 0.6], [-3.2, 3.6, 0.6], 0.1, "#2f3e4f"); b.box([-3.2, 3.65, 0.85], [0.35, 0.2, 0.6], "#2f3e4f");
  b.beam([2.1, 0, -0.1], [2.1, 1.0, -0.1], 0.08, P.wood); b.box([2.1, 1.15, -0.1], [0.3, 0.3, 0.5], P.red);
  // traffic-light pole at the corner (fx draws the head and its state)
  b.beam([8.4, 0, 1.1], [8.4, 2.9, 1.1], 0.12, "#2f3e4f");
  prop(b, "sell_booth", [-18, 0, -1.4], 2.67); // ep06's kiosk: far left of every earlier yard camera, its sign board stays blank for the episode's card
  // houses across the road
  for (const [x, c] of [[-9, "#c96b55"], [0, "#83ad69"], [9, "#d58a4b"], [18, "#6f9f9a"]] as [number, string][]) b.box([x, 2.2, 16], [6, 4.4, 4], c, "brick");
}
function woods(b: SetBuilder, ground: string, snowy: boolean) {
  const ext = SET_ART.groundSize / 2;
  groundPatch(b, [-ext, -ext, ext, ext], ground, "plain");
  for (let k = 0; k < 5; k++) b.geo(new THREE.SphereGeometry(9 + k * 2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), [-30 + k * 15, -3, -38 - (k % 2) * 8], snowy ? "#e8edf5" : "#6a9a55"); // hills
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) {
    const x = (rnd() - 0.5) * 60, z = -3 - rnd() * 40;
    if (Math.abs(x) < 2.5 && z > -4) continue; // keep the clearing open
    tree(b, x, z, 0.8 + rnd() * 0.6);
  }
  for (const [x, z, s] of [[-3.2, -1.6, 1.0], [3.4, -2.4, 1.1], [-5.5, 1.5, 0.9], [5.8, 1.2, 1.0], [1.1, -1.2, 0.55]] as V3[]) tree(b, x, z, s);
  if (snowy) for (let i = 0; i < 30; i++) b.geo(new THREE.SphereGeometry(0.4 + rnd() * 0.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), [(rnd() - 0.5) * 24, -0.05, -rnd() * 16 + 4], "#f4f7fb");
  else for (let i = 0; i < 24; i++) { const x = (rnd() - 0.5) * 20, z = -rnd() * 12 + 3; if (Math.abs(x) > 1.5) for (let k = 0; k < 3; k++) ball(b, [x + (k - 1) * 0.35, 0.3 + (k % 2) * 0.12, z], 0.38, k % 2 ? P.foliage : P.green); }
}
function forest(b: SetBuilder) { woods(b, "#6fa35a", false); }
function snow(b: SetBuilder) { woods(b, "#eef2f8", true); }

function ball(b: SetBuilder, p: V3, r: number, col: string) { b.geo(new THREE.SphereGeometry(r, 12, 8), p, col); }
function plant(b: SetBuilder, x: number, z: number, y = 0, scale = 1) {
  if (prop(b, scale > 1.5 ? "palm" : "houseplant", [x, y, z], scale > 1.5 ? 2.2 * scale : .75 * scale, x)) return;
  b.cylinder([x, y + .18 * scale, z], .21 * scale, .36 * scale, P.red);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    b.beam([x, y + .3 * scale, z], [x + Math.cos(a) * .25 * scale, y + .72 * scale, z + Math.sin(a) * .2 * scale], .035, P.green);
    ball(b, [x + Math.cos(a) * .23 * scale, y + .65 * scale, z + Math.sin(a) * .2 * scale], .16 * scale, i % 2 ? P.foliage : P.green);
  }
}


// ---------------- ep07-ep10 sets (2026-11-06) ----------------
let rs = 11; const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647);
const sph = (r: number, sx = 1, sy = 1, sz = 1, seg = 14) => new THREE.SphereGeometry(r, seg, Math.max(6, seg >> 1)).scale(sx, sy, sz);
/** an emissive bulb (fairy light, string light): no ink, no shadow */
function bulb(b: SetBuilder, p: V3, r: number, col: [number, number, number]) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(...col) }));
  m.position.set(...p); m.layers.set(NOINK); m.userData.noCast = true; b.group.add(m);
}

/** x170 countertop: 17 m tiles with 0.6 m grout trenches, the counter edge cliff at z = +4, a mug tower, the tap overhead */
function counter(b: SetBuilder) {
  b.box([0, -1.2, -43.2], [220, 1.6, 93.5], "#6f6a78"); // grout bed, ends behind the edge (a ledge past it read as a slope)
  b.box([0, -150.5, 30], [260, 1, 240], "#a06d42", "wood"); // the kitchen floor far below the cliff
  for (let x = -102; x <= 102; x += 17) for (let z = -4.5; z > -95; z -= 17) b.box([x, -0.3, z], [16.4, 0.6, 16.4], (Math.abs(x / 17 + z / 17) | 0) % 2 ? "#f1ece0" : "#e7dfcf");
  b.box([0, -1.1, 3.85], [220, 2.2, 0.6], "#d8cfbd"); // the worktop's front edge: thin, so the drop shows below it
  b.box([0, -80, -0.5], [220, 146, 0.8], "#7fb7a8", "wood"); // cabinet doors far below
  b.box([0, 100, -96], [240, 200, 1], "#cfe3ee"); // backsplash wall
  for (let y = 17; y < 200; y += 17) b.box([0, y, -95.4], [240, 0.5, 0.3], "#9fb6c4");
  // the mug (10 cm -> 17 m): a red tower with a handle
  const [mx, , mz] = SETS.counter.spots.mug.map((v, i) => v - SETS.counter.origin[i]) as V3;
  b.geo(new THREE.CylinderGeometry(6.8, 6.4, 17, 40), [mx, 8.5, mz], "#c63939");
  b.geo(new THREE.CylinderGeometry(6.0, 6.0, 0.4, 40), [mx, 16.9, mz], "#5a3220");
  b.geo(new THREE.TorusGeometry(4, 1.1, 10, 24, Math.PI).rotateZ(-Math.PI / 2), [mx + 6.8, 9, mz], "#c63939");
  // tap: a steel column far back, its spout overhead ending above the drip spot; a puddle under it
  const [dx, , dz] = SETS.counter.spots.drip.map((v, i) => v - SETS.counter.origin[i]) as V3;
  b.cylinder([14, 21, -30], 3.2, 42, "#aab4c3");
  b.beam([14, 40, -30], [dx, 40, dz], 3, "#aab4c3");
  b.geo(new THREE.CylinderGeometry(1.4, 1.6, 3, 20), [dx, 37.6, dz], "#8e99aa");
  b.geo(new THREE.CylinderGeometry(1.6, 1.6, 0.02, 24), [dx, 0.012, dz], "#8fd3e6");
  // crumbs, sugar grains, a coin: things whose real size tells your size
  const [cx, , cz] = SETS.counter.spots.crumb.map((v, i) => v - SETS.counter.origin[i]) as V3;
  b.geo(new THREE.DodecahedronGeometry(0.55, 0).scale(1.2, 0.8, 1), [cx, 0.4, cz], "#d9a55a");
  for (const [x, z, r] of [[cx + 0.9, cz + 0.5, 0.18], [cx - 0.8, cz - 0.4, 0.24], [cx + 2.5, cz - 2.2, 0.3]] as V3[]) b.geo(new THREE.DodecahedronGeometry(r, 0), [x, r * 0.7, z], "#c98f45");
  for (let i = 0; i < 14; i++) b.box([(rnd() - 0.5) * 14, 0.08, -rnd() * 9 + 2], [0.16, 0.16, 0.16], "#fbfaf6", "plain", rnd() * 3);
  b.geo(new THREE.CylinderGeometry(2.1, 2.1, 0.3, 40), [5.5, 0.15, -4], "#d9b44a");
  b.geo(new THREE.CylinderGeometry(1.7, 1.7, 0.05, 40), [5.5, 0.32, -4], "#e8c45a");
  // a bread slice standing far left
  b.box([-30, 7, -30], [26, 14, 2.4], "#e6b56a"); b.box([-30, 7, -28.7], [24, 12, 0.3], "#f6e3b4");
}
/** x170 floor under the counter: 25 m planks, the kick plate + cabinet doors as a wall behind, dust and a lost button */
function floor(b: SetBuilder) {
  for (let x = -112.5; x <= 112.5; x += 25) b.box([x, -0.3, 30], [24.6, 0.6, 140], (Math.round(x / 25) & 1) ? "#b07a4a" : "#a06d42", "wood");
  b.box([0, -1, 30], [240, 1, 140], "#3a2a22");
  b.box([0, 8.5, -9], [240, 17, 1], "#2f3b46"); // kick plate (10 cm)
  b.box([0, 95, -14], [240, 156, 1], "#7fb7a8"); // cabinet doors above
  for (let x = -100; x <= 100; x += 34) b.box([x, 95, -13.4], [0.6, 150, 0.3], "#5c8f82");
  for (let x = -100; x <= 100; x += 34) b.box([x + 14, 150, -13.3], [6, 1.2, 1.2], "#aab4c3"); // handles
  for (const [x, z, r] of [[-6, -4, 1.3], [-9.5, -2, 0.8], [7, -5, 1.0], [-14, 1, 1.6]] as V3[]) b.geo(sph(r, 1.2, 0.8, 1, 10), [x, r * 0.75, z], "#b9b4c4"); // dust bunnies
  b.geo(new THREE.CylinderGeometry(2.4, 2.4, 0.5, 36), [-5, 0.25, 4], "#3f6c8c");
  for (const [x, z] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) b.geo(new THREE.CylinderGeometry(0.28, 0.28, 0.02, 12), [-5 + x, 0.51, 4 + z], "#1d2a3a");
}
/** normal-scale kitchen corner: mint walls, white cabinets, butcher-block top, a pendant over the worktop */
function kitchen(b: SetBuilder) {
  const z = SET_ART.back;
  room(b, "#cfe8dc", false, { x: 1.8, w: 1.8 });
  windowView(b, 1.8, 1.8, true);
  for (const x of [-2.4, -1.5, -0.6, 0.3, 1.2, 2.1, 3.0]) { b.box([x, 0.44, z + 0.5], [0.88, 0.88, 0.78], "#f4f1ea", "wood"); b.box([x, 0.7, z + 0.9], [0.3, 0.04, 0.04], P.metal); }
  b.box([0.3, 0.91, z + 0.5], [6.4, 0.06, 0.86], "#c08a54", "wood");
  for (const x of [-2.4, -1.4, -0.4]) b.box([x, 1.95, z + 0.2], [0.95, 0.75, 0.38], "#f4f1ea", "wood");
  for (let i = 0; i < 8; i++) b.box([-2.6 + i * 0.6, 1.25, z + 0.08], [0.58, 0.52, 0.03], i % 2 ? "#f7efe0" : "#8fc7b4", "tile");
  prop(b, "toaster", [-1.6, 0.94, z + 0.45], 0.22); prop(b, "microwave", [-0.3, 0.94, z + 0.5], 0.3);
  b.box([-3.3, 1.0, z + 0.6], [0.9, 2.0, 0.8], "#e9b44c"); // a yellow fridge
  b.geo(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 28), [-1.9, 0.97, -0.6], "#f4f1ea"); // a plate on a small island
  b.box([-1.9, 0.45, -0.6], [1.6, 0.9, 0.8], "#2F6E73", "wood"); b.box([-1.9, 0.92, -0.6], [1.7, 0.05, 0.9], "#c08a54", "wood");
  lamp(b, POOLS.kitchen!);
  plant(b, 3.3, 2.6, 0, 1.2);
}
/** morning beach: sand, a flat sea with foam bands, lifeguard chair, umbrella, towel, rocks, palms */
function beach(b: SetBuilder) {
  groundPatch(b, [-80, -4, 80, 40], "#ecd6a4", "plain");
  groundPatch(b, [-80, -6, 80, -4], "#d9bf8a", "plain"); // wet sand
  b.box([0, -0.08, -60], [200, 0.1, 108], "#2a8fb8"); b.box([0, -0.02, -9], [200, 0.012, 6], "#3fb6cf");
  for (const z of [-6.2, -11, -18]) b.box([0, 0.005, z], [200, 0.012, z > -7 ? 0.6 : 0.35], "#e9f7fb"); // foam bands (flat: no ink)
  const [hx, , hz] = SETS.beach.spots.chair.map((v, i) => v - SETS.beach.origin[i]) as V3;
  for (const dx of [-0.6, 0.6]) for (const dz of [-0.5, 0.5]) b.beam([hx + dx, 0, hz + dz], [hx + dx * 0.6, 2.2, hz + dz * 0.6], 0.1, "#f4f1ea");
  b.box([hx, 2.25, hz], [1.0, 0.1, 0.8], "#c63939"); b.box([hx, 2.7, hz - 0.35], [1.0, 0.8, 0.1], "#c63939");
  b.box([hx, 1.1, hz + 0.45], [0.9, 0.08, 0.08], "#f4f1ea");
  sign(b, "guard", [hx, 3.4, hz - 0.35], 1.1, 0.4, "#c63939", "#f4f1ea", "LIFEGUARD");
  b.beam([3.5, 0, -1.5], [3.4, 2.3, -1.5], 0.06, "#f4f1ea");
  b.geo(new THREE.ConeGeometry(1.5, 0.6, 12), [3.4, 2.4, -1.5], "#f0b93a");
  b.box([3.0, 0.012, -0.6], [0.8, 0.02, 1.8], "#5b8eaa"); // towel (flat)
  for (const [x, z, r] of [[-9, -5, 1.6], [-7.5, -6.5, 1.0], [10, -7, 2.2], [12, -4.5, 1.1]] as V3[]) b.geo(sph(r, 1.3, 0.7, 1, 10), [x, r * 0.25, z], "#8a8178");
  plant(b, -11, 3, 0, 1.8); plant(b, 13, 4, 0, 2.0); plant(b, -16, -1, 0, 1.9);
  for (const [x, z] of [[1.5, 1.5], [-2.4, 2.4], [5, 3]]) b.geo(sph(0.12, 1.4, 0.5, 1, 8), [x, 0.03, z], "#f4f1ea"); // shells
}
/** deep reef (ep08): sand floor, dark rocks, coral heads, kelp, the silver surface overhead */
function reef(b: SetBuilder) {
  groundPatch(b, [-80, -80, 80, 40], "#c9b98e", "plain");
  b.paint = true; b.box([0, 11, -20], [300, 0.2, 300], "#9fe3f0"); b.paint = false; // the surface from below
  for (const [x, z, r] of [[-3, -3, 1.6], [-6, -6, 2.4], [4.5, -4, 1.9], [8, -9, 3], [-10, -12, 3.5], [1, -13, 2.6], [-14, -2, 2.0], [13, -2, 1.8]] as V3[]) b.geo(sph(r, 1.2, 0.75, 1, 12), [x, r * 0.35, z], "#5a5f72");
  const CORAL = ["#e8705e", "#f0b93a", "#b45fa0", "#5ce1c0", "#ff8fa3"];
  for (let i = 0; i < 26; i++) {
    const x = (rnd() - 0.5) * 30, z = -rnd() * 18 + 1.5, c = CORAL[i % 5];
    if (Math.abs(x) < 2.2 && z > -2.5) continue; // the swim lane stays clear
    if (i % 3 === 0) for (let k = 0; k < 4; k++) b.cylinder([x + (k % 2) * 0.25 - 0.1, 0.35 + k * 0.08, z + (k >> 1) * 0.25], 0.09, 0.7 + k * 0.16, c); // tube coral
    else if (i % 3 === 1) b.geo(sph(0.45 + rnd() * 0.3, 1, 0.7, 1, 12), [x, 0.25, z], c); // brain coral
    else for (let k = 0; k < 5; k++) b.geo(sph(0.22, 1, 1, 1, 8), [x + Math.cos(k) * 0.3, 0.25 + (k % 3) * 0.2, z + Math.sin(k) * 0.3], c);
  }
  for (let i = 0; i < 12; i++) { const x = (rnd() - 0.5) * 34, z = -6 - rnd() * 16, h = 3 + rnd() * 4; b.beam([x, 0, z], [x + 0.3, h, z], 0.14, "#3f7a52"); }
}
/** a tiled bathroom: clawfoot tub with water, tap, towel rail, mirror, a window */
function bathroom(b: SetBuilder) {
  const z = SET_ART.back;
  room(b, "#e3eef2", false, { x: 1.9, w: 1.4 });
  windowView(b, 1.9, 1.4, true);
  for (let i = 0; i < 13; i++) b.box([-3.6 + i * 0.6, 0.6, z + 0.08], [0.58, 1.2, 0.03], i % 2 ? "#f4f1ea" : "#7fc3cf", "tile");
  b.box([0, 0.006, -0.8], [7.6, 0.012, 6], "#d9e2e8", "tile");
  const [tx, , tz] = SETS.bathroom.spots.tub.map((v, i) => v - SETS.bathroom.origin[i]) as V3;
  b.geo(new RoundedBoxGeometry(1.8, 0.6, 0.85, 4, 0.25), [tx, 0.48, tz], "#fbfaf6");
  b.box([tx, 0.73, tz], [1.6, 0.012, 0.66], "#6fd0de"); // water (flat)
  for (const dx of [-0.7, 0.7]) for (const dz of [-0.3, 0.3]) b.geo(sph(0.08, 1, 1.4, 1, 8), [tx + dx, 0.1, tz + dz], "#e8c45a");
  b.beam([tx - 0.85, 0.75, tz], [tx - 0.85, 1.0, tz], 0.05, P.metal); b.beam([tx - 0.85, 1.0, tz], [tx - 0.68, 1.0, tz], 0.05, P.metal);
  b.box([tx + 0.55, 0.81, tz - 0.32], [0.16, 0.1, 0.1], "#2b2f3a"); // the aquarium pump on the rim
  framed(b, -0.2, 1.75, z + 0.06, 0.8, 0.9, "#cfe3ee"); // mirror
  b.box([-0.2, 0.85, z + 0.3], [0.7, 0.12, 0.45], "#fbfaf6"); b.beam([-0.2, 0, z + 0.3], [-0.2, 0.8, z + 0.3], 0.12, "#fbfaf6");
  b.beam([3.85, 1.2, -1.6], [3.85, 1.2, -0.6], 0.04, P.metal);
  b.box([3.82, 0.95, -1.1], [0.06, 0.55, 0.7], "#e9b44c", "cloth");
  b.box([-2.6, 0.006, -1.0], [0.9, 0.014, 0.6], "#c8603f", "cloth"); // bath mat (flat)
  lamp(b, POOLS.bathroom!);
  plant(b, 3.2, -2.6, 0, 0.9);
}
/** night party room: purple walls, string lights, a sofa, a speaker stack, balloons, snacks */
function party(b: SetBuilder) {
  const z = SET_ART.back;
  room(b, "#5a4f8f", true);
  for (let i = 0; i <= 20; i++) { const u = i / 20, x = -3.6 + 7.2 * u; bulb(b, [x, 2.35 - 0.35 * Math.sin(u * Math.PI), z + 0.18], 0.045, [[5, 3.6, 1.6], [5, 1.8, 2.4], [1.6, 3.6, 5]][i % 3] as [number, number, number]); }
  const [sx, , sz] = SETS.party.spots.sofa.map((v, i) => v - SETS.party.origin[i]) as V3;
  b.box([sx, 0.25, sz], [2.4, 0.5, 0.9], "#e9b44c", "cloth"); b.box([sx, 0.7, sz - 0.38], [2.4, 0.6, 0.18], "#e9b44c", "cloth");
  for (const dx of [-1.25, 1.25]) b.box([sx + dx, 0.45, sz], [0.2, 0.6, 0.9], "#d39a30", "cloth");
  for (const dx of [-0.6, 0.6]) b.box([sx + dx, 0.56, sz + 0.05], [1.1, 0.14, 0.75], "#f0c25e", "cloth");
  const [px, , pz] = SETS.party.spots.speaker.map((v, i) => v - SETS.party.origin[i]) as V3;
  b.box([px, 0.6, pz], [0.6, 1.2, 0.5], "#1d1a3a");
  for (const [y, r] of [[0.35, 0.2], [0.85, 0.14]] as [number, number][]) b.geo(new THREE.CylinderGeometry(r, r, 0.04, 20).rotateX(Math.PI / 2), [px, y, pz + 0.26], "#5a5f72");
  table(b, [1.1, 0, -1.0], 0.9, 0.6, 0.45, "#c08a54");
  for (const [dx, c] of [[-0.25, "#c63939"], [0.05, "#f0b93a"], [0.3, "#5ce1ff"]] as [number, string][]) b.cylinder([1.1 + dx, 0.51, -1.0], 0.06, 0.12, c); // cups
  for (const [x, y, zz, c] of [[-3.2, 2.0, -2.6, "#c63939"], [-2.8, 1.8, -3.0, "#5ce1ff"], [3.2, 2.1, -2.2, "#f0b93a"], [2.9, 1.85, -1.6, "#ff8fa3"]] as [number, number, number, string][]) b.geo(sph(0.22, 1, 1.2, 1, 12), [x, y, zz], c);
  b.box([-1.2, 0.006, -1.4], [3.4, 0.012, 2.4], "#2F6E73", "cloth");
  lamp(b, POOLS.party!);
}
/** shallow lagoon (ep09): bright sand, seagrass tufts, a garden of tube and barrel sponges, ripple-lit surface overhead */
function lagoon(b: SetBuilder) {
  groundPatch(b, [-80, -80, 80, 40], "#f2e6c4", "plain");
  b.paint = true; b.box([0, 5, -20], [300, 0.2, 300], "#c8f6f2"); b.paint = false;
  for (let i = 0; i < 40; i++) { // seagrass tufts: few, fat blades (thin ones boil at range)
    const x = (rnd() - 0.5) * 34, z = -rnd() * 20 + 2;
    if (Math.abs(x) < 2.5 && z > -2) continue;
    for (let k = 0; k < 3; k++) b.geo(new THREE.ConeGeometry(0.09, 0.6 + rnd() * 0.4, 6), [x + (k - 1) * 0.16, 0.35, z + (k % 2) * 0.12], k % 2 ? "#6fae5a" : "#86c06a");
  }
  const SP = ["#f0b93a", "#b45fa0", "#e8705e", "#5ca8d8"];
  for (let i = 0; i < 16; i++) {
    const x = (rnd() - 0.5) * 26, z = -2.5 - rnd() * 14, c = SP[i % 4];
    if (i % 2) { // barrel sponge: a lumpy body, a knobbly rim round a dark mouth (smooth open cylinders read as trash cans)
      b.geo(sph(0.46, 1, 1.05, 1, 12), [x, 0.42, z], c);
      for (let k = 0; k < 9; k++) { const a = k * 0.7; b.geo(sph(0.15, 1, 1, 1, 7), [x + Math.cos(a) * 0.36, 0.76 + (k % 2) * 0.03, z + Math.sin(a) * 0.36], c); }
      for (let k = 0; k < 7; k++) { const a = k * 0.9 + 0.4; b.geo(sph(0.12, 1, 1.3, 1, 7), [x + Math.cos(a) * 0.44, 0.3 + (k % 3) * 0.12, z + Math.sin(a) * 0.44], c); }
      b.geo(sph(0.25, 1, 0.3, 1, 10), [x, 0.84, z], "#3a2c46");
    } else for (let k = 0; k < 3; k++) { const tx = x + (k - 1) * 0.24, h = 0.7 + k * 0.24; // tube sponges: fat fingers with a dark tip
      b.cylinder([tx, h / 2, z], 0.11, h, c); b.geo(sph(0.13, 1, 0.6, 1, 8), [tx, h, z], c); b.geo(sph(0.06, 1, 0.4, 1, 6), [tx, h + 0.07, z], "#3a2c46"); }
  }
  for (const [x, z, r] of [[-5, -5, 1.0], [6, -7, 1.4], [-9, -10, 1.8]] as V3[]) b.geo(sph(r, 1.3, 0.6, 1, 10), [x, r * 0.25, z], "#b8ad94");
}
/** city rooftops at y = 0 over a 12 m street (ep10): parapets, water tower, vents, AC units, a stair hut, neighbours */
function rooftops(b: SetBuilder) {
  b.box([0, -6.05, -4.5], [20, 12.1, 15], "#a76a66", "brick"); // our building, top at y = 0, front face at z = +3
  b.box([0, 0.01, -4.5], [19.6, 0.02, 14.6], "#7d7a86"); // tar roof (flat)
  for (const x of [-9.9, 9.9]) b.box([x, 0.3, -4.5], [0.25, 0.6, 15], "#c9b79a");
  b.box([0, 0.3, -11.9], [20, 0.6, 0.25], "#c9b79a"); b.box([0, 0.15, 2.9], [20, 0.3, 0.25], "#c9b79a"); // low front lip
  const [tx, , tz] = SETS.rooftops.spots.tower.map((v, i) => v - SETS.rooftops.origin[i]) as V3;
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.beam([tx + dx, 0, tz + dz], [tx + dx * 0.9, 3, tz + dz * 0.9], 0.18, "#5a4a3a");
  b.cylinder([tx, 4.5, tz], 1.5, 3, "#8a5a3a"); b.geo(new THREE.ConeGeometry(1.7, 1.2, 16), [tx, 6.6, tz], "#5a4a3a");
  for (const [x, z] of [[4, -3], [6.5, -7]]) { b.box([x, 0.5, z], [1.4, 1, 1.0], "#b9c2cf"); b.geo(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 18), [x, 1.03, z], "#5a5f72"); }
  for (const x of [-3, -1.5]) b.cylinder([x, 0.6, -9], 0.25, 1.2, "#aab4c3");
  b.box([7, 1.3, -10.5], [2.6, 2.6, 2.4], "#c96b55", "brick"); framed(b, 7, 1.0, -9.28, 0.9, 1.9, P.teal);
  // the street below and the far side
  b.box([0, -12.05, 10], [120, 0.1, 16], "#5d6382");
  for (const z of [3.8, 16.2]) b.box([0, -11.9, z], [120, 0.2, 1.6], "#c9b79a");
  for (let x = -20; x <= 20; x += 5) b.box([x, -11.98, 10], [2.2, 0.012, 0.2], P.yellow);
  for (const [x, h, c] of [[-14, 18, "#c96b55"], [-5, 26, "#6f9f9a"], [5, 20, "#d58a4b"], [15, 30, "#5b8eaa"]] as [number, number, string][]) {
    b.box([x, -12 + h / 2, 21], [9, h, 6], c, "brick");
    for (let y = -10; y < h - 12; y += 3.2) for (const dx of [-2.6, 0, 2.6]) b.box([x + dx, y, 17.97], [1.3, 1.6, 0.06], "#9cc3d6");
  }
  for (const [x, top, c] of [[-18, 3.5, "#b9748f"], [18, -4, "#e2b04e"]] as [number, number, string][]) b.box([x, (top - 12) / 2, -4], [14, top + 12, 14], c, "brick"); // neighbour roofs
}
/** a city street at y = 0 (ep10): road, kerbs, shop fronts with striped awnings, a lamp post, manhole, hydrant */
function street(b: SetBuilder) {
  groundPatch(b, [-80, 4, 80, 40], "#5d6382", "plain");
  groundPatch(b, [-80, -3, 80, 4], "#c9b79a", "tile");
  groundPatch(b, [-80, -60, 80, -3], "#8a8f9e", "plain");
  b.box([0, 0.08, 4.0], [160, 0.16, 0.18], "#a69a85");
  for (let x = -30; x <= 30; x += 4) b.box([x, 0.008, 9], [2, 0.016, 0.16], P.yellow);
  b.geo(new THREE.CylinderGeometry(0.45, 0.45, 0.02, 24), [-1.5, 0.012, 2.2], "#3b3f52"); // manhole (flat)
  const SHOPS: [number, string, string, string][] = [[-9, "#d58a4b", "#c63939", "BAKERY"], [-3, "#6f9f9a", "#2F6E73", "BOOKS"], [3.5, "#e2b04e", "#5b8eaa", "DINER"], [10, "#b9748f", "#7a4a8c", "SHOES"]];
  for (const [x, wall, aw, name] of SHOPS) {
    b.box([x, 6, -6], [6, 12, 6], wall, "brick");
    b.box([x - 0.4, 1.3, -2.95], [3.4, 2.2, 0.08], "#9cc3d6"); framed(b, x + 2.3, 1.1, -2.95, 0.9, 2.1, aw);
    for (let k = 0; k < 6; k++) b.box([x - 2.5 + k + 0.5, 3.0, -2.45], [1, 0.08, 1.1], k % 2 ? "#f4f1ea" : aw, "plain", 0);
    sign(b, `shop.${name}`, [x, 3.9, -2.93], 3, 0.6, "#f4f1ea", "#1d1a3a", name);
    for (let y = 6; y < 11.5; y += 2.6) for (const dx of [-1.6, 1.6]) b.box([x + dx, y, -2.97], [1.1, 1.4, 0.06], "#9cc3d6");
  }
  const [lx, , lz] = SETS.street.spots.lamp.map((v, i) => v - SETS.street.origin[i]) as V3;
  b.beam([lx, 0, lz], [lx, 4.2, lz], 0.14, "#2f3e4f"); b.box([lx, 4.45, lz + 0.25], [0.5, 0.18, 0.7], "#2f3e4f");
  b.cylinder([5.6, 0.35, 2.8], 0.18, 0.7, "#c63939"); b.cylinder([-6, 0.45, 2.9], 0.3, 0.9, "#3f6c8c"); // hydrant, bin
  for (const x of [-14, 15]) tree(b, x, 2.6, 0.8);
  for (const [x, c] of [[-20, "#c96b55"], [-10, "#83ad69"], [10, "#d58a4b"], [20, "#6f9f9a"]] as [number, string][]) b.box([x, 7, 22], [9, 14, 5], c, "brick");
}

/** sunny park (ep11): lawn, far hills, one big tree, sunflowers, a bench, a green tennis court with white lines and a net */
function park(b: SetBuilder) {
  groundPatch(b, [-80, -80, 80, 40], "#7fbf5e", "plain");
  for (let k = 0; k < 5; k++) b.geo(new THREE.SphereGeometry(14 + k * 3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), [-36 + k * 18, -4, -46 - (k % 2) * 8], "#6aa956");
  const c = SETS.park.spots, o = SETS.park.origin, l = (v: V3): V3 => [v[0] - o[0], v[1], v[2]];
  const [tx, , tz] = l(c.tree), [bx, , bz] = l(c.bench), [cx, , cz] = l(c.court);
  tree(b, tx, tz, 1.7); tree(b, -12, -9, 1.2); tree(b, 6, -14, 1.3); tree(b, 24, -12, 1.2);
  for (let i = 0; i < 9; i++) { const x = -3.4 + i * 0.5 + (i % 2) * 0.12, z = -3.4 - (i % 3) * 0.3, h = 1.0 + (i % 3) * 0.14; // sunflowers
    b.beam([x, 0, z], [x, h, z], 0.05, "#4f8a42");
    b.geo(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 14).rotateX(Math.PI / 2), [x, h, z + 0.04], "#f5c733");
    b.geo(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 12).rotateX(Math.PI / 2), [x, h, z + 0.07], "#6a3f22"); }
  b.box([bx, 0.45, bz], [1.6, 0.07, 0.42], P.wood, "wood"); b.box([bx, 0.75, bz - 0.2], [1.6, 0.4, 0.06], P.wood, "wood");
  for (const dx of [-0.65, 0.65]) b.box([bx + dx, 0.22, bz], [0.08, 0.44, 0.38], P.metal);
  b.box([cx, 0.006, cz], [13, 0.012, 24.8], "#3f8f6e"); b.box([cx, 0.008, cz], [10.97, 0.012, 23.77], "#4aa37e");
  for (const dz of [-11.885, 11.885, -6.4, 6.4]) b.box([cx, 0.016, cz + dz], [Math.abs(dz) > 10 ? 10.97 : 8.23, 0.012, 0.1], "#f4f7fb");
  for (const dx of [-5.485, 5.485, -4.115, 4.115, 0]) b.box([cx + dx, 0.016, cz], [0.1, 0.012, dx === 0 ? 12.8 : Math.abs(dx) > 5 ? 23.77 : 23.77], "#f4f7fb");
  b.box([cx, 0.5, cz], [11.6, 0.9, 0.05], "#e8edf2"); for (const dx of [-5.9, 5.9]) b.cylinder([cx + dx, 0.53, cz], 0.06, 1.06, P.metal);
}

// ---------------- ep12 big outdoor sets + far layers (2026-11-07) ----------------
// Own seeded rng (the shared rnd() above drives the older sets: drawing from it here would move their props).
let os = 5; const ornd = () => ((os = (os * 16807) % 2147483647) / 2147483647);
/** outdoor kit GLB by name at native metres x k (OUTDOOR_FILES), or the primitive fallback when it is not loaded */
function outdoor(b: SetBuilder, name: string, [x, y, z]: V3, k: number, yaw: number, fallback: () => void) {
  const o = OUT.get(name);
  if (!o) return fallback();
  const at = new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw), V(k, k, k));
  o.traverse((m) => {
    if (!(m instanceof THREE.Mesh)) return;
    const src = m.material as THREE.MeshStandardMaterial;
    (b.paint ? b.flat : b.batch).add(m.geometry, material(`#${src.color.getHexString()}`), at.clone().multiply(m.matrixWorld));
  });
}
/** big plain ground slab */
const ground = (b: SetBuilder, size: number, color: string) => b.box([0, -0.06, 0], [size, 0.12, size], color);
/** a cheap gable house for distance (~20 tris): body + two roof planes + gables */
function hut(b: SetBuilder, x: number, z: number, w: number, d: number, h: number, wall: string, roof: string, yaw = 0) {
  const r = new THREE.Matrix4().compose(V(x, 0, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw), V(1, 1, 1));
  b.batch.add(boxGeo(V(-w / 2, 0, -d / 2), V(w / 2, h, d / 2)), material(wall), r);
  const rh = Math.min(w, d) * 0.4, ex = 0.4;
  for (const sd of [-1, 1]) b.batch.add(quad(V(-w / 2 - ex, h + rh, 0), V(-w / 2 - ex, h - 0.2, sd * (d / 2 + ex)), V(w / 2 + ex, h - 0.2, sd * (d / 2 + ex)), V(w / 2 + ex, h + rh, 0)), material(roof), r);
  for (const sx of [-1, 1]) b.batch.add(tri(V(sx * w / 2, h, sx * d / 2), V(sx * w / 2, h, -sx * d / 2), V(sx * w / 2, h + rh, 0)), material(wall), r);
}
function puff(b: SetBuilder, x: number, z: number, s: number) {
  b.box([x, s * 1.2, z], [0.5 * s, 2.4 * s, 0.5 * s], P.roof);
  b.geo(sph(1.8 * s, 1, 1, 1, 10), [x, 3.4 * s, z], P.foliage);
}
/** a ring strip at radius r: top edge prof(angle), bottom bot(angle); normals face the centre, tilted up (a slope) */
function ring(r: number, prof: (a: number) => number, bot: (a: number) => number = () => -20, n = 360) {
  const pos: number[] = [], nor: number[] = [], uv: number[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2;
    const t0 = prof(a0), t1 = prof(a1), b0 = Math.min(bot(a0), t0), b1 = Math.min(bot(a1), t1);
    if (t0 - b0 < 0.01 && t1 - b1 < 0.01) continue;
    const p0 = [Math.cos(a0) * r, Math.sin(a0) * r], p1 = [Math.cos(a1) * r, Math.sin(a1) * r];
    for (const [[x, z], y] of [[p0, b0], [p1, b1], [p1, t1], [p0, b0], [p1, t1], [p0, t0]] as [number[], number][]) {
      pos.push(x, y, z); const l = Math.hypot(x, z), nx = -x / l, nz = -z / l, ny = 1.1, k = Math.hypot(nx, ny, nz); nor.push(nx / k, ny / k, nz / k); uv.push(0, 0);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  return g;
}
const hash = (k: number) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** 2-3 distant layers per kind, painted (NOINK: lines at 300+ m only dot and boil), hazed by distance through the set fog */
function farLayers(b: SetBuilder, kinds: FarKind[]) {
  const add = (g: THREE.BufferGeometry, col: string) => { b.flat.add(g, material(col)); g.dispose(); };
  for (const kind of kinds) {
    if (kind === "sea") add(boxGeo(V(-1100, -0.4, -1100), V(1100, -0.25, 1100)), "#2a8fb8");
    if (kind === "hills") ([[380, 28, "#6aa956"], [620, 48, "#5f9a6a"], [880, 72, "#6f9a8a"]] as [number, number, string][]).forEach(([r, H, c], L) =>
      add(ring(r, (a) => H * (0.55 + 0.25 * Math.sin(3 * a + L * 2) + 0.15 * Math.sin(7 * a + L) + 0.05 * Math.sin(17 * a + 3 * L))), c));
    if (kind === "dunes") ([[320, 22, "#e6b56a"], [560, 36, "#dca866"], [820, 52, "#c99e7c"]] as [number, number, string][]).forEach(([r, H, c], L) =>
      add(ring(r, (a) => H * (0.25 + 0.75 * Math.pow(0.5 + 0.5 * Math.sin(5 * a + L * 1.7 + 0.4 * Math.sin(11 * a)), 2))), c));
    if (kind === "skyline") ([[300, 34, "#8a8fa8"], [470, 58, "#9ea4bc"]] as [number, number, string][]).forEach(([r, H, c], L) => {
      const N = 200, h = (a: number) => { const k = Math.floor((a / (Math.PI * 2)) * N); return H * (hash(k + L * 999) < 0.15 ? 0.1 : 0.3 + 0.7 * hash(k * 3 + L) ** 2); };
      add(ring(r, h, () => -20, N), c);
    });
    if (kind === "mountains") ([[680, 170, "#7a7f9a"], [960, 290, "#8d93ad"]] as [number, number, string][]).forEach(([r, H, c], L) => {
      const N = 9 + L * 4, h = (a: number) => { const x = (a / (Math.PI * 2)) * N, k = Math.floor(x), f = x - k, amp = 0.45 + 0.55 * hash(k + L * 50);
        return H * (0.2 + amp * (1 - Math.abs(2 * f - 1)) * (0.9 + 0.1 * Math.sin(a * 41))); };
      add(ring(r, h, () => -20, 540), c);
      add(ring(r - 4, h, (a) => Math.max(h(a) - 0.22 * H, 0.62 * H), 540), "#f4f7fb"); // snow caps
    });
  }
}
/** per-frame backdrop uniforms (world.ts): horizon/fog colour, light tint, off in sky-fall shots (no bottom edge from above) */
export const BACKDROP = { uFog: { value: new THREE.Color() }, uMul: { value: new THREE.Color(1, 1, 1) }, uOn: { value: 1 } };
// horizon (eye level) = row 614 of 1024 from the top in every backdrop PNG (public/backdrops/README.md) = 40 % from the bottom
const BD_HORIZON = 1 - 614 / 1024;
/** atmospheric perspective per layer (director 2026-11-07; the PNGs come in neutral): contrast pivots on the haze colour,
 *  then saturation, then a mix toward the haze; blur = px at 1080 (mip bias). The far layer stays below the mid in chroma. */
export type BdGrade = { contrast: number; sat: number; haze: number; blur: number };
// director's starting values, haze .25 / .5 -> .2 / .4 after backdrop_check: at golden the haze colour itself is saturated and close
// to the horizon sky, so the full haze pushed the field's far layer above the cast's chroma and under the .05 luma gap
const BD_MID: BdGrade = { contrast: 0.75, sat: 0.85, haze: 0.2, blur: 0 }, BD_FAR: BdGrade = { contrast: 0.5, sat: 0.7, haze: 0.4, blur: 1.5 };
const BD_FAR_BRIGHT: BdGrade = { contrast: 0.65, sat: 0.88, haze: 0.25, blur: 1.5 }; // sea: its pale far island vanished at .5/.4 (luma gap .01)
/** an open cylinder seen from inside, the panorama wrapped once round it (square texels), unlit, graded toward the light's haze */
function backdrop(b: SetBuilder, r: number, tex: THREE.Texture, g: BdGrade) {
  const img = tex.image as { width: number; height: number }, h = (2 * Math.PI * r * img.height) / img.width;
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 160, 1, true), new THREE.ShaderMaterial({
    uniforms: { ...BACKDROP, map: { value: tex }, uCon: { value: g.contrast }, uSat: { value: g.sat }, uHaze: { value: g.haze }, uBias: { value: Math.log2(1 + g.blur) } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `uniform sampler2D map; uniform vec3 uFog, uMul; uniform float uCon, uSat, uHaze, uBias, uOn; varying vec2 vUv;
      void main(){ vec4 t = texture2D(map, vec2(1.0 - vUv.x, vUv.y), uBias); float low = smoothstep(0.0, 0.08, vUv.y), a = t.a * low * uOn;
        if (a < 0.01) discard;
        vec3 hz = mix(vec3(dot(uFog, vec3(0.2126, 0.7152, 0.0722))), uFog, 0.6); // the preset's haze hue at 60 % chroma: golden fog is
        vec3 c = mix(hz, t.rgb * uMul, uCon);                           // more saturated than the cast (backdrop_check rule 1)
        c = mix(vec3(dot(c, vec3(0.2126, 0.7152, 0.0722))), c, uSat);
        c = mix(c, hz, uHaze);
        float lf = dot(uFog, vec3(0.2126, 0.7152, 0.0722)), lc = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c *= min(1.0, (lf - 0.1) / max(lc, 1e-3));                       // never within ~.06 (display) of the sky: the silhouette stays (rule 5)
        gl_FragColor = vec4(mix(uFog, c, low), a); }`,                   // the bottom 8 % melts into the fog
    transparent: true, depthWrite: false, side: THREE.BackSide, fog: false,
  }));
  m.position.y = (0.5 - BD_HORIZON) * h; m.layers.set(NOINK); m.userData.noCast = true; m.renderOrder = -0.4; m.frustumCulled = false;
  b.group.add(m);
}
function town(b: SetBuilder) {
  ground(b, 2400, "#86b864");
  const pitch = 48, st = 10, n = 6, half = pitch * n + pitch / 2;
  for (let i = -n; i <= n + 1; i++) { // streets (flat: no ink), along x and z
    const c = (i - 0.5) * pitch;
    b.box([c, 0.02, 0], [st, 0.02, 2 * half], "#5d6382"); b.box([0, 0.02, c], [2 * half, 0.02, st], "#5d6382"); // flat layers 3 cm apart: 2 mm steps z-fought from 300 m
  }
  const WALL = ["#d9c7a3", "#a7c4d9", "#e2b04e", "#b9748f", "#e8dcc1", "#c96b55"], ROOF = ["#8a4b32", "#5b4636", "#3e4a5c", "#b93c51"];
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
    const cx = i * pitch, cz = j * pitch, inner = pitch - st, r = Math.hypot(i, j);
    if (i === 0 && j === 0) { // the park: lawn, pond, paths, fountain, trees
      b.box([cx, 0.05, cz], [inner, 0.02, inner], "#7fbf5e"); b.box([cx + 9, 0.08, cz - 9], [12, 0.02, 8], "#3fb6cf");
      b.box([cx, 0.08, cz], [inner, 0.02, 2.4], "#c9b79a"); b.box([cx, 0.08, cz], [2.4, 0.02, inner], "#c9b79a");
      outdoor(b, "fountain", [cx, 0, cz], 1, 0, () => { b.cylinder([cx, 0.3, cz], 2.2, 0.6, "#c9b79a"); b.cylinder([cx, 1.2, cz], 0.3, 1.8, "#c9b79a"); });
      for (let k = 0; k < 14; k++) { const a = k * 2.4, d = 9 + (k % 4) * 3.5, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (Math.abs(x - cx) < 2 || Math.abs(z - cz) < 2) continue; outdoor(b, "tree_round", [x, 0, z], 1.2, a, () => puff(b, x, z, 1.4)); }
      continue;
    }
    if (i === -2 && j === -2) { outdoor(b, "ferris_wheel", [cx, 0, cz], 1.4, 0.5, () => undefined); outdoor(b, "water_tower", [cx + 14, 0, cz + 12], 1, 0, () => undefined); b.box([cx, 0.05, cz], [inner, 0.02, inner], "#7fbf5e"); continue; } // the fairground
    b.box([cx, 0.05, cz], [inner, 0.02, inner], "#c9b79a"); // pavement block
    if (i === 1 && j === 0) { // the detailed lane for the ground shots (spot "street" in front of it)
      for (const x of [-12, 0, 12]) { house(b, cx + x, cz - 8, WALL[(x / 12 + 1) | 0], ROOF[(x / 12 + 2) & 3], P.teal); }
      for (const x of [-6, 6]) outdoor(b, "street_lamp", [cx + x, 0, cz + 2], 1, 0, () => b.beam([cx + x, 0, cz + 2], [cx + x, 4, cz + 2], 0.12, "#2f3e4f"));
      outdoor(b, "bench", [cx - 2, 0, cz + 1.5], 1, 0, () => b.box([cx - 2, 0.45, cz + 1.5], [1.6, 0.1, 0.45], P.wood));
      outdoor(b, "car_van", [cx + 14, 0, cz + 21], 1, Math.PI / 2, () => b.box([cx + 14, 1, cz + 21], [5, 2, 2.1], "#e8dcc1"));
      continue;
    }
    if (r < 2.3 && (i + j) % 2) { // downtown: two blocks of flats
      for (const [dx, dz] of [[-9, -6], [9, 7]]) { const k = 1 + ornd(), x = cx + dx, z = cz + dz;
        outdoor(b, "apartment_block", [x, 0, z], k, 0, () => b.box([x, 9 * k, z], [12, 18 * k, 10], WALL[(ornd() * 6) | 0], "brick")); }
      continue;
    }
    for (let k = 0; k < 8; k++) { // 2 rows of 4 houses facing the streets, gardens between
      const row = k < 4 ? -1 : 1, x = cx - 14 + (k % 4) * 9.4, z = cz + row * 11, w = WALL[(ornd() * 6) | 0], rf = ROOF[(ornd() * 4) | 0], big = ornd() < 0.5;
      outdoor(b, big ? "house_a" : "house_b", [x, 0, z], 1, row < 0 ? Math.PI : 0, () => hut(b, x, z, 7.5, 7, 4 + ornd() * 2.5, w, rf));
    }
    b.box([cx, 0.08, cz], [inner - 4, 0.02, 8], "#7fbf5e"); // the gardens
    for (let k = 0; k < 3; k++) { const x = cx - 14 + k * 14 + ornd() * 4, z = cz + (ornd() - 0.5) * 3; outdoor(b, "tree_round", [x, 0, z], 0.9, k, () => puff(b, x, z, 1)); }
  }
  for (let k = 0; k < 14; k++) { const i = ((ornd() * 13) | 0) - 6, x = (i - 0.5) * pitch + 2.2, z = (ornd() - 0.5) * 2 * half; // cars
    outdoor(b, "car_small", [x, 0, z], 1, 0, () => b.box([x, 0.6, z], [1.8, 1.2, 4], ROOF[k & 3])); }
  outdoor(b, "small_plane", [30, 260, -30], 1.5, 2.2, () => undefined); // sky life under ep12's falls (no balloon: from the top it read as a striped disc)
}
function desert(b: SetBuilder) {
  ground(b, 2400, "#ecc985");
  for (let k = 0; k < 36; k++) { const x = (ornd() - 0.5) * 500, z = -30 - ornd() * 400, s = 0.5 + ornd() * 1.5; // dunes
    outdoor(b, "dune", [x, 0, z], s, (ornd() - 0.5) * 0.8, () => b.geo(new THREE.SphereGeometry(20 * s, 24, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.6, 0.28, 1), [x, -0.5, z], "#e6bd78")); }
  const [mx, , mz] = SETS.desert.spots.mesa.map((v, i) => v - SETS.desert.origin[i]) as V3;
  outdoor(b, "mesa_rock", [mx, 0, mz], 1.8, 0, () => b.box([mx, 30, mz], [140, 60, 70], "#c8754a"));
  for (let k = 0; k < 22; k++) { const x = (ornd() - 0.5) * 60, z = 6 - ornd() * 70, s = 0.7 + ornd() * 0.6; // cacti
    if (Math.abs(x) < 3 && z > -4) continue;
    outdoor(b, "cactus", [x, 0, z], s, k, () => { b.cylinder([x, 1.5 * s, z], 0.3 * s, 3 * s, "#5f9a4e"); b.beam([x, 1.4 * s, z], [x + 0.8 * s, 1.4 * s, z], 0.4 * s, "#5f9a4e"); }); }
  for (let k = 0; k < 12; k++) b.geo(sph(0.5 + ornd() * 1.4, 1.3, 0.6, 1, 8), [(ornd() - 0.5) * 50, 0.2, -ornd() * 50], "#b98a5e");
}
// ---------------- ep13 western set (2026-11-07): rolling stock from primitives, no third-party assets ----------------
const axleZ = (r: number, w: number) => new THREE.CylinderGeometry(r, r, w, 18).rotateX(Math.PI / 2);
/** a car along x centred on x, rails at z. baggage = plank car with a door on the +z side, express = dark green, wreck = no roof, walls torn */
function railCar(b: SetBuilder, x: number, z: number, kind: "baggage" | "express" | "wreck") {
  const L = 13, W = 2.9, y0 = 1.15, H = 2.7, col = kind === "baggage" ? "#a4452f" : "#3f6a55";
  b.box([x, y0 - 0.12, z], [L + 0.4, 0.24, W + 0.2], "#2c2a36");
  for (const dx of [-4.6, 4.6]) for (const dx2 of [-0.8, 0.8]) for (const s of [-1, 1]) b.geo(axleZ(0.46, 0.14), [x + dx + dx2, 0.46, z + s * 0.78], "#23222c");
  if (kind === "wreck") { // floor, torn back wall, end frames and the split safe; no roof
    b.box([x, y0 + 0.05, z], [L, 0.1, W], "#2b2422");
    for (let i = 0; i < 9; i++) { const h = 0.5 + ((i * 37) % 11) / 8; b.box([x - 6 + i * 1.5, y0 + h / 2, z - W / 2], [1.2, h, 0.12], i % 2 ? "#3a2f2c" : "#4a3a33", "plain", 0.05 * (i % 3 - 1)); }
    for (const s of [-1, 1]) b.box([x + s * L / 2, y0 + 0.9, z], [0.14, 1.8, W], "#2f2725");
    b.box([x + 1.5, y0 + 0.65, z - 0.2], [1.1, 1.2, 1.1], "#23262f"); b.box([x + 1.5, y0 + 0.65, z + 0.5], [0.08, 1.15, 1.05], "#3b3f4e", "plain", 1.0);
    return;
  }
  b.box([x, y0 + H / 2, z], [L, H, W], col);
  b.box([x, y0 + H + 0.09, z], [L + 0.5, 0.18, W + 0.45], "#3d3540");
  b.box([x, y0 + H + 0.28, z], [L - 1.5, 0.2, W - 0.9], "#3d3540");
  for (let i = 0; i <= 13; i++) b.box([x - L / 2 + i, y0 + H / 2, z + W / 2 + 0.03], [0.05, H, 0.05], "#7a3323"); // planks
  b.box([x, y0 + 1.15, z + W / 2 + 0.05], [2.5, 2.3, 0.08], kind === "baggage" ? "#caa56b" : "#2f5243");
  b.box([x, y0 + H - 0.2, z + W / 2 + 0.05], [L, 0.14, 0.06], "#e8cf8f");
}
/** a steam locomotive along x, nose toward +x */
function loco(b: SetBuilder, x: number, z: number) {
  const dark = "#262833", red = "#a82e28";
  b.box([x, 1.0, z], [9.6, 0.34, 2.2], dark);
  b.geo(new THREE.CylinderGeometry(1.0, 1.0, 6.2, 20).rotateZ(Math.PI / 2), [x + 0.9, 2.35, z], dark);
  for (const dx of [-1.2, 0.6, 2.4]) b.geo(new THREE.CylinderGeometry(1.04, 1.04, 0.16, 20).rotateZ(Math.PI / 2), [x + dx, 2.35, z], "#c9a24b"); // brass bands
  b.geo(new THREE.CylinderGeometry(0.42, 0.26, 1.5, 14), [x + 3.1, 4.0, z], dark); b.geo(new THREE.CylinderGeometry(0.6, 0.42, 0.5, 14), [x + 3.1, 4.95, z], "#17181f"); // stack
  b.geo(new THREE.SphereGeometry(0.46, 14, 10), [x + 0.9, 3.45, z], "#c9a24b"); // dome
  b.box([x + 4.05, 2.35, z], [0.14, 2.0, 2.0], "#17181f");
  b.geo(new THREE.CylinderGeometry(0.3, 0.34, 0.5, 12).rotateZ(Math.PI / 2), [x + 4.2, 3.55, z], "#e7c65c"); // headlamp
  b.geo(new THREE.ConeGeometry(1.05, 1.5, 4).rotateZ(-Math.PI / 2).scale(1, 0.75, 1.1), [x + 5.2, 0.72, z], red); // cowcatcher
  b.box([x - 3.3, 2.65, z], [2.7, 2.9, 2.5], red); b.box([x - 3.3, 4.2, z], [3.2, 0.2, 3.0], dark); b.box([x - 3.3, 3.1, z + 1.28], [1.2, 0.95, 0.05], "#f0d890");
  for (const s of [-1, 1]) { for (const dx of [-1.8, 0.2, 2.2]) { b.geo(axleZ(0.82, 0.16), [x + dx, 0.82, z + s * 1.05], red); b.geo(axleZ(0.28, 0.2), [x + dx, 0.82, z + s * 1.05], "#2c2a36"); } b.beam([x - 1.8, 0.82, z + s * 1.17], [x + 2.2, 0.82, z + s * 1.17], 0.14, "#c9ccd4"); }
}
/** car + tender + engine, the nose at +x */
function westTrain(b: SetBuilder, x: number, z: number, car: "baggage" | "express") {
  railCar(b, x, z, car); tenderLoco(b, x, z);
}
function tenderLoco(b: SetBuilder, x: number, z: number) {
  b.box([x + 8.6, 1.9, z], [3.2, 1.7, 2.5], "#2c2a36"); b.box([x + 8.6, 2.85, z], [2.8, 0.3, 2.1], "#14141a"); for (const d of [-0.9, 0.9]) b.geo(axleZ(0.46, 2.0), [x + 8.6 + d, 0.46, z], "#23222c");
  loco(b, x + 15, z);
}
function west(b: SetBuilder) {
  ground(b, 2400, "#cdb48c");
  const O = SETS.west.origin, loc = (k: string) => { const v = SETS.west.spots[k]; return [v[0] - O[0], v[1], v[2]] as V3; };
  const R = -4;
  for (const dz of [-0.75, 0.75]) b.box([0, 0.2, R + dz], [1400, 0.11, 0.11], "#5c5c68");
  for (let x = -560; x <= 220; x += 1.3) b.box([x, 0.07, R], [0.3, 0.13, 2.5], "#5a4230");
  for (let k = 0; k < 90; k++) { const x = (ornd() - 0.5) * 500, z = -8 - ornd() * 240, s = 0.6 + ornd() * 0.9; if (z > -162 && z < -122) continue; if (k % 3) b.geo(sph(0.5 + ornd() * 1.2, 1.3, 0.6, 1, 8), [x, 0.2, z], "#b2845a"); else outdoor(b, "cactus", [x, 0, z], s, k, () => undefined); }
  for (const [x, z, s, y] of [[-260, -330, 1.8, 0.3], [40, -420, 2.6, -0.5], [260, -340, 1.7, 1.1], [-90, -240, 0.8, 0.8], [160, -230, 0.7, -0.4]] as number[][]) outdoor(b, "mesa_rock", [x, 0, z], s, y, () => undefined);
  for (const [x, z, s] of [[-34, -172, 2.4], [20, -176, 1.8], [52, -170, 2.2], [-74, -168, 2.6], [-12, -184, 1.4], [100, -176, 2]] as number[][]) outdoor(b, "rock_cluster", [x, 0, z], s, x, () => undefined);
  // the ridge: a low mound with rocks
  const [rx, , rz] = loc("ridge");
  b.geo(new THREE.SphereGeometry(16, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.28, 0.7), [rx, 0, rz], "#b98a55");
  outdoor(b, "rock_cluster", [rx - 6, 2, rz + 6], 1.5, 1, () => undefined);
  // the rail yard: the odd car, water tower, sheds, hay
  const [yx] = loc("yard");
  railCar(b, yx, R, "baggage"); outdoor(b, "water_tower", [yx - 11, 0, R - 8], 1, 0.3, () => undefined);
  hut(b, yx + 12, R - 13, 11, 7, 3.6, "#a98d6c", "#6c4a36"); hut(b, yx - 20, R - 16, 8, 6, 3, "#94775b", "#5c4230");
  outdoor(b, "haystack", [yx + 5, 0, R + 6.5], 0.42, 1, () => undefined);
  // the wreck + the second train
  const [wx] = loc("wreck");
  railCar(b, wx, R, "wreck"); for (let k = 0; k < 18; k++) b.box([wx - 8 + ornd() * 18, 0.1, R + 2 + ornd() * 5], [0.3 + ornd() * 1.2, 0.08, 0.2], "#332a28", "plain", ornd() * 3);
  tenderLoco(b, wx, R);
  // the rolling train: its own group, moved per shot by the episode (story.ts MOVER_AT, world.ts)
  const mg = new THREE.Group(); mg.name = "mover"; b.group.add(mg);
  const m = new SetBuilder(mg); westTrain(m, 0, R, "baggage"); m.finish();
  // the depot: station house, platform, a waiting train
  const [dx] = loc("depot");
  westTrain(b, dx - 8, R, "baggage");
  b.box([dx, 0.3, R + 3.6], [36, 0.6, 3.6], "#7d5f43"); hut(b, dx + 2, R + 28, 15, 7, 4.2, "#c9a877", "#7a4a33"); b.box([dx + 2, 1.2, R + 24.4], [1.3, 2.4, 0.1], "#5a3d2a");
  outdoor(b, "water_tower", [dx - 26, 0, R + 18], 0.9, 0, () => undefined);
  // inside the baggage car: plank floor, 3 walls, roof, hay against the back
  const [ix, , iz] = loc("inside");
  b.box([ix, 0.05, iz], [9, 0.1, 5], "#6f4e35"); b.box([ix, 3, iz - 2.5], [9, 6, 0.12], "#a06a48"); for (const s of [-1, 1]) b.box([ix + s * 4.5, 3, iz], [0.12, 6, 5], "#8a5a3e");
  for (let i = 0; i < 12; i++) b.box([ix - 4.2 + i * 0.76, 3, iz - 2.42], [0.04, 6, 0.04], "#6e4530");
  outdoor(b, "haystack", [ix + 1.4, 0.05, iz - 1.1], 0.42, 0, () => b.geo(sph(1.1, 1.2, 0.7, 1, 10), [ix + 1.4, 0.3, iz - 1.1], "#e0bf63"));
}
function sea(b: SetBuilder) {
  if (OUT.has("wave_tile")) for (let i = -4; i <= 4; i++) for (let j = -6; j <= 2; j++) outdoor(b, "wave_tile", [i * 20, -0.75, j * 20], 1, 0, () => undefined); // mean water at y = 0
  b.box([0, -0.06, 0], [600, 0.12, 600], "#2a8fb8");
  for (let k = 0; k < 50; k++) { const x = (ornd() - 0.5) * 400, z = 20 - ornd() * 400; // foam streaks (flat)
    if (!OUT.has("wave_tile")) b.geo(new THREE.CylinderGeometry(1, 1, 18 + ornd() * 20, 16, 1).rotateZ(Math.PI / 2).scale(1, 0.35, 1.6), [x, -0.15, z], "#2685b0");
    b.box([x + 2, 0.8, z - 1.2], [8 + ornd() * 10, 0.02, 0.6], "#e9f7fb"); }
  const [bx, , bz] = SETS.sea.spots.boat.map((v, i) => v - SETS.sea.origin[i]) as V3;
  outdoor(b, "sailboat", [bx, 0.35, bz], 1, 0.6, () => {
    b.box([bx, 0.5, bz], [2.4, 1.2, 7], "#f4f1ea"); b.beam([bx, 1.1, bz - 0.6], [bx, 9, bz - 0.6], 0.15, "#5a4a3a");
    b.geo(tri(V(0, 0, 0), V(0, 0, -3), V(0, 7, -0.2)), [bx + 0.05, 1.8, bz - 0.7], "#fbfaf6"); });
  outdoor(b, "buoy", [-8, 0.35, -18], 1, 0, () => b.cylinder([-8, 0.8, -18], 0.5, 1.6, "#c63939"));
  outdoor(b, "lighthouse", [-90, 0, -160], 1.5, 0, () => undefined); outdoor(b, "rock_cluster", [-90, -0.5, -160], 6, 0, () => undefined); // a rock islet
}
function mountains(b: SetBuilder) {
  ground(b, 2400, "#7f9f6a");
  const [px, , pz] = SETS.mountains.spots.peak.map((v, i) => v - SETS.mountains.origin[i]) as V3;
  outdoor(b, "mountain_peak", [px, -2, pz], 0.6, 0.3, () => b.geo(new THREE.ConeGeometry(220, 300, 7), [px, 148, pz], "#7a7f9a"));
  for (let k = 0; k < 7; k++) { // low-poly side peaks (7 facets: inked ridges) with snow cones
    const x = (ornd() - 0.5) * 800, z = -200 - ornd() * 300, h = 90 + ornd() * 140, r = h * 0.75;
    if (Math.abs(x - px) < 200) continue;
    b.geo(new THREE.ConeGeometry(r, h, 7), [x, h / 2 - 1, z], "#7a7f9a");
    b.geo(new THREE.ConeGeometry(r * 0.36, h * 0.36, 7), [x, h - h * 0.18 - 0.5, z], "#f4f7fb");
  }
  for (let k = 0; k < 40; k++) { const x = (ornd() - 0.5) * 140, z = 10 - ornd() * 130, s = 0.8 + ornd() * 0.6;
    if (Math.abs(x) < 6 && z > -8) continue;
    outdoor(b, k % 3 ? "tree_pine" : "pine_cluster", [x, 0, z], s, k, () => { b.box([x, s, z], [0.4 * s, 2 * s, 0.4 * s], P.roof); b.geo(new THREE.ConeGeometry(1.6 * s, 4.5 * s, 8), [x, 3.6 * s, z], "#3f6f55"); }); }
  for (let k = 0; k < 16; k++) b.geo(sph(0.6 + ornd() * 1.4, 1.2, 0.7, 1, 8), [(ornd() - 0.5) * 60, 0.3, -ornd() * 60], "#8e8a92");
  outdoor(b, "small_plane", [15, 230, -10], 1.5, -0.8, () => undefined); // sky life under ep12's fall
}
function field(b: SetBuilder) {
  ground(b, 2400, "#a9bd5a");
  for (let k = 0; k < 30; k++) b.box([(ornd() - 0.5) * 300, 0.01 + k * 0.006, -ornd() * 300 + 40], [30 + ornd() * 40, 0.02, 20 + ornd() * 30], k % 2 ? "#c9b45a" : "#93b455"); // patches
  const [hx, , hz] = SETS.field.spots.hay.map((v, i) => v - SETS.field.origin[i]) as V3;
  for (let k = 0; k < 10; k++) { const x = k ? (ornd() - 0.5) * 80 : hx, z = k ? -12 - ornd() * 60 : hz;
    outdoor(b, "haystack", [x, 0, z], 0.7, k, () => { b.cylinder([x, 0.9, z], 1.6, 1.8, "#e2b04e"); b.geo(new THREE.ConeGeometry(1.8, 1.4, 14), [x, 2.5, z], "#d39a30"); }); }
  outdoor(b, "wooden_cart", [5, 0, -6], 1, -0.5, () => undefined);
  outdoor(b, "windmill", [-40, 0, -70], 1.4, 0.4, () => undefined);
  for (let k = 0; k < 6; k++) outdoor(b, k % 2 ? "sheep" : "cow", [14 + k * 3.5, 0, -24 - (k % 3) * 4], 1, k * 1.3, () => undefined);
  for (const y of [0.45, 0.85]) b.box([0, y, -14], [60, 0.1, 0.08], P.wood); // a plain rail fence (picket GLB too thin: it dots at range)
  for (let x = -30; x <= 30; x += 3) b.box([x, 0.55, -14], [0.16, 1.1, 0.16], P.wood);
  for (let k = 0; k < 10; k++) { const x = (ornd() - 0.5) * 160, z = -40 - ornd() * 120; outdoor(b, "tree_round", [x, 0, z], 1.5, k, () => puff(b, x, z, 1.5)); }
  // flowers: flat dots only (the meadow_flowers GLB's 90 thin stems boil under ink; kept out, see the report)
  outdoor(b, "hot_air_balloon", [-20, 45, -60], 1, 0.5, () => undefined); // sky life over ep12's landing
  // daisies: 5 round petals + a yellow eye, flat (no ink); the old 18 cm squares read as red tiles from above (ep12 #8)
  for (let k = 0; k < 160; k++) { const x = (ornd() - 0.5) * 30, z = 4 - ornd() * 30, r = 0.05 + 0.03 * ornd(), a0 = ornd() * 6;
    const col = ["#f4f7fb", "#f4f7fb", "#e8705e", "#c99be0"][k % 4];
    for (let j = 0; j < 5; j++) { const a = a0 + (j * Math.PI * 2) / 5; b.flat.add(new THREE.CylinderGeometry(r, r, 0.01, 10), material(col), new THREE.Matrix4().makeTranslation(x + 1.2 * r * Math.cos(a), 0.2, z + 1.2 * r * Math.sin(a))); }
    b.flat.add(new THREE.CylinderGeometry(0.8 * r, 0.8 * r, 0.01, 10), material("#f5c733"), new THREE.Matrix4().makeTranslation(x, 0.207, z)); }
}

/** Builds every static set once. Caller owns root lifecycle, lighting, fog, cards and animation.
 * Geometry is owned by root; palette materials / CanvasTextures are shared caches (do not dispose per set).
 * No asset loading, environment mutation, actors, lights, cameras or runtime gameplay behavior.
 */
export function buildSets(root: THREE.Object3D, used?: Set<SetId>): void {
  const start = performance.now();
  const builders: Record<SetId, (b: SetBuilder) => void> = { home, yard, forest, snow, bedroom,
    counter, floor, kitchen, beach, reef, bathroom, party, lagoon, rooftops, street, park, town, desert, sea, mountains, field, west };
  const BIG = new Set<SetId>(["town", "desert", "sea", "mountains", "field", "west"]); // only when the episode uses them (older sets always, in order: they share rnd())
  let triangles = 0;
  for (const id of Object.keys(SETS) as SetId[]) {
    if (BIG.has(id) && used && !used.has(id)) continue;
    const group = new THREE.Group(); group.name = `set:${id}`; group.position.set(...SETS[id].origin);
    const b = new SetBuilder(group); builders[id](b);
    const bd = SETS[id].backdrop, mid = bd && BD.get(`${bd.biome}_mid`), far = bd && BD.get(`${bd.biome}_far`);
    if (mid) backdrop(b, bd!.mid ?? 450, mid, BD_MID);
    if (far) backdrop(b, bd!.far ?? 950, far, id === "sea" ? BD_FAR_BRIGHT : BD_FAR);
    if (SETS[id].far && !mid && !far) { b.paint = true; farLayers(b, SETS[id].far!); b.paint = false; } // the geometry rings stand in until the panoramas exist
    b.finish();
    let count = 0;
    group.traverse((o) => { if (o instanceof THREE.Mesh) count += (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3; });
    group.userData.triangles = count; triangles += count; root.add(group);
  }
  root.userData.setsStats = { triangles, buildMs: performance.now() - start };
}
