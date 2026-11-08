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
  "hot_air_balloon", "small_plane",
  "tank_hull", "tank_turret", "chalet_shell", "chalet_front", "chalet_side", "gun", "barn_shell", "barn_door", "rock_half", "bridge_deck", "bridge_pier", "cliff", "slope", "boulder",
  "tunnel_portal", "portal_rubble", "border_hut", "barrier_post", "barrier_arm", "crate",
  "sub_hull", "sub_hatch", "cutter", "fast_boat", "dome_hall",
  "shop_awning", "hydrant", "mailbox", "bush", "market_stall"]; // ep16 town kit // round 2 picks: CC0, plus the two CC-BY sky props for ep12's falls (credit them in the description)
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
  | "town" | "desert" | "sea" | "mountains" | "field" | "west" | "alps" | "pacific" | "tips" | "salary" | "tornado" | "turkey" | "alaska" | "talkton";
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
  // ep14: the road along x at z 0 (border x -300, villages x -130 / -85, chalet x -40, barn x -8, fake rock x 22), gorge at x 250 on a 14 m plateau,
  // rails along x at z 220 into the portal at x 120
  alps: info(30000, false, { you: [0, 0, 0] }, { wide: cam([0, 3, 14], [0, 2, 0], 46) }, { fog: [80, 1400], backdrop: { biome: "mountains" } }),
  // ep15: open sea round x 0 (water y 0), land x < -330 (jungle yard x -500, dock z 60 at the coast, domed hall x -450 z -250),
  // sub cabin x 500 z 0 + jail z 4 (one lamp/window pool between them), sea floor x 700
  pacific: info(33000, false, { you: [0, 0, 0] }, { wide: cam([0, 3, 14], [0, 1, 0], 46) }, { fog: [80, 1400], backdrop: { biome: "sea" } }),
  // ep16: shop street x 0 (fronts at z -3), steps x -80, cart plaza x 80, park x 160, bus stop x 240; elevator x 400 z 0 + bedroom z 4-8.6 (one lamp pool)
  tips: info(36000, false, { you: [0, 0, 0] }, { wide: cam([0, 1.6, 8], [0, 1.4, -2], 46) }, { fog: [80, 1300], backdrop: { biome: "town" } }),
  // ep17: your street + the Neighbor's yard x 0 (homes face +z at z -4), office plaza x 100, café terrace x 200, park x 300
  salary: info(39000, false, { you: [0, 0, 0] }, { wide: cam([0, 1.6, 8], [0, 1.4, -2], 46) }, { fog: [80, 1300], backdrop: { biome: "town" } }),
  // ep18: the mobile home x 0 (floor y 0.65), landing field z -398, road z -436 + porch x 44, doctor's room x 200 (one lamp pool: the lamp)
  tornado: info(42000, false, { you: [0, 0, 0] }, { wide: cam([0, 1.6, 8], [0, 1.4, -2], 46) }, { fog: [80, 1300], backdrop: { biome: "field", mid: 800, far: 1150 } }),
  // ep19: backyard x 0 (+ the Neighbor behind the fence z -3.2), the yard after the fire x 50, your street x 140, the Neighbor's porch + kitchen window x 240 (one lamp pool: the kitchen)
  turkey: info(45000, false, { you: [0, 0, 0] }, { wide: cam([0, 1.6, 8], [0, 1.4, -2], 46) }, { fog: [80, 1300], backdrop: { biome: "town" } }),
  // ep20: Sitka shore x 0 (water z > 4, fort z -10), gold creek x 60, oil tundra x 120, map clearing + border x 180, the border at night x 240
  alaska: info(48000, false, { you: [0, 0, 0] }, { wide: cam([0, 1.6, 8], [0, 1.4, -2], 46) }, { fog: [80, 1300], backdrop: { biome: "mountains" } }),
  // ep21: the gate x 0 (arch z -3, Main Street to -z), the market x 60, the stone bridge x 120, Mia's street at night x 180 (porch z -4.9)
  talkton: info(51000, false, { you: [0, 0, 0] }, { wide: cam([0, 1.6, 8], [0, 1.4, -2], 46) }, { fog: [80, 1300], backdrop: { biome: "town" } }),
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
  kitchen: [0.2, 2.15, -0.6], bathroom: [0.2, 2.2, -1.0], party: [0.0, 2.1, -1.0], street: [-3, 4.3, 2.85], pacific: [500, 1.75, 1.6], tips: [400, 1.9, 3.2], tornado: [5.45, 2.1, -1.45], turkey: [247.5, 2.6, -8.6], talkton: [179.05, 2.2, -5.4] }; // the pendant over the table, the street lamp
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
/** ep14: parts the episode moves per frame (story.ts MOVER_AT, like the mover train): an origin at the hinge, name -> group */
export const RIG = new Map<string, THREE.Group>();
function part(b: SetBuilder, name: string, file: string, at: V3 = [0, 0, 0], parent: THREE.Object3D = b.group) {
  const g = new THREE.Group(); g.name = name; g.position.set(...at); g.rotation.order = "YXZ"; parent.add(g);
  const m = new SetBuilder(g); outdoor(m, file, [0, 0, 0], 1, 0, () => undefined); m.finish(); RIG.set(name, g); return g;
}
/** the ridge above the road (x0 +- 40, z from -8 back): the front keeps the 0.773 grade the boulders of ep14 roll on, a jagged crest and sides fall away */
const hillN = (x: number, z: number) => { const h = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return h - Math.floor(h) - 0.5; };
const hillH = (x0: number, x: number, z: number) => {
  const d = -z - 8; if (d <= 0) return 0;
  const u = Math.min(1, Math.max(0, (Math.abs(x - x0) / 40 - 0.6) / 0.4)), side = 1 - u * u * (3 - 2 * u), crest = 58, top = 0.773 * crest;
  const prof = d < crest ? 0.773 * d : top * Math.max(0, 1 - (d - crest) / 8);
  return Math.max(0, (prof + hillN(x, z) * (1.2 + 9 * (Math.min(d, crest) / crest) ** 3) * (d < crest + 7 ? 1 : 0)) * side);
};
function hill(b: SetBuilder, x0: number) {
  const nx = 16, nd = 14, pt = (i: number, j: number): V3 => { const ex = i === 0 || i === nx, ej = j === 0 || j === nd, x = x0 - 40 + (i * 80) / nx + (ex ? 0 : hillN(i, j + 7) * 2.5), z = -8 - (j * 66) / nd + (ej ? 0 : hillN(j, i + 3) * 2.5); return [x, 14 + hillH(x0, x, z), z]; };
  const col: Record<string, number[]> = { "#6fa257": [], "#5f9050": [], "#8d877c": [], "#eef2f7": [] };
  const add = (a: V3, c: V3, e: V3) => { const y = (a[1] + c[1] + e[1]) / 3 - 14, n = hillN(a[0], c[2]), k = y + n * 8; (col[k > 40 ? "#eef2f7" : k > 25 ? "#8d877c" : n > 0 ? "#6fa257" : "#5f9050"]).push(...a, ...c, ...e); };
  for (let i = 0; i < nx; i++) for (let j = 0; j < nd; j++) { const a = pt(i, j), c = pt(i + 1, j), e = pt(i + 1, j + 1), f = pt(i, j + 1); if ((i + j) % 2) { add(a, c, e); add(a, e, f); } else { add(a, c, f); add(c, e, f); } }
  for (const [c, v] of Object.entries(col)) { if (!v.length) continue; const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(new Array((v.length / 3) * 2).fill(0), 2)); g.computeVertexNormals(); b.geo(g, [0, 0, 0], c); }
}
function alps(b: SetBuilder) {
  ground(b, 2400, "#74ad5e");
  const road = "#77736a";
  b.box([-145, 0.02, 0], [550, 0.02, 8], road);
  // column: hull + turret, parked out of sight until a shot asks
  for (let i = 0; i < 5; i++) part(b, `tur${i}`, "tank_turret", [0, 1.75, 0], part(b, `tank${i}`, "tank_hull"));
  // villages + trees along the road
  for (const [x0, n] of [[-138, 4], [-96, 4]] as number[][]) for (let i = 0; i < n; i++) { const x = x0 + i * 9.5, big = (i + x0) % 2 === 0;
    outdoor(b, big ? "house_a" : "house_b", [x, 0, -13], 1, 0, () => undefined); outdoor(b, i % 2 ? "house_a" : "house_b", [x + 4, 0, -26], 1, 0, () => undefined); }
  for (let k = 0; k < 46; k++) { const x = -340 + ornd() * 400, z = -30 - ornd() * 90, s = 0.9 + ornd() * 0.7; outdoor(b, k % 3 ? "tree_pine" : "pine_cluster", [x, 0, z], s, k, () => undefined); }
  for (let k = 0; k < 14; k++) { const x = -340 + ornd() * 400, z = 16 + ornd() * 30; if (Math.abs(x + 258) < 14 || Math.abs(x + 16) < 14 || Math.abs(x + 72) < 14) continue; outdoor(b, "pine_cluster", [x, 0, z], 1, k, () => undefined); }
  outdoor(b, "pine_cluster", [-140, 0, 13], 1.3, 2, () => undefined); // near dark for shot 10
  // the pink chalet: a concrete core, gun in the slot; walls are hinged at the foot (origin on the hinge)
  outdoor(b, "chalet_shell", [-40, 0, -13], 1, 0, () => undefined);
  part(b, "ch_front", "chalet_front", [-40, 0, -10]); part(b, "ch_right", "chalet_side", [-36, 0, -13]); part(b, "ch_left", "chalet_side", [-44, 0, -13]);
  part(b, "ch_gun", "gun", [-40, 1.6, -14.8]);
  // the barn and the fake rock
  outdoor(b, "barn_shell", [-8, 0, -13], 1, 0, () => undefined); part(b, "barn_l", "barn_door", [-10.7, 0, -10]); part(b, "barn_r", "barn_door", [-5.3, 0, -10]);
  outdoor(b, "gun", [-8, 1.4, -14.4], 1, 0, () => undefined);
  part(b, "rk_l", "rock_half", [22, 0, -11]); part(b, "rk_r", "rock_half", [22, 0, -11]);
  b.box([22, 0.8, -12], [2.4, 1.6, 2.4], "#8f8d88"); outdoor(b, "gun", [22, 1.0, -12.4], 0.8, 0, () => undefined);
  outdoor(b, "rock_cluster", [32, 0, -13], 1.6, 1, () => undefined); outdoor(b, "rock_cluster", [13, 0, -14], 1.2, 2, () => undefined);
  outdoor(b, "cow", [-16, 0, 7], 1, 0.5, () => undefined);
  // the concrete door with the year on it (shot 24)
  b.box([-60, 2, -22], [6, 4, 3], "#8f8d88"); b.box([-60, 0.03, -16], [12, 0.06, 10], "#4a4d55"); // + its concrete apron
  // the border + the dawn camp
  part(b, "bar_arm", "barrier_arm", [-300, 1.2, -4.5]); outdoor(b, "barrier_post", [-300, 0, -4.8], 1, 0, () => undefined);
  outdoor(b, "border_hut", [-272, 0, -8], 1, 0, () => undefined); b.cylinder([-268, 2.5, -7], 0.05, 5, "#c9ccd4");
  for (const [x, z, y] of [[-258, 7, 0.5], [-246, 16, 2], [-266, 24, -1], [-238, -14, 1], [-284, -16, 3]] as number[][]) outdoor(b, "cow", [x, 0, z], 1, y, () => undefined);
  outdoor(b, "crate", [-360, 0, 8], 1, 0, () => undefined);
  // (no pines beside the road at x 34-132: shot 18 sees it from above)
  // the gorge: two cliffs (gorge face at +-20 from x 250), river, piers, 3 deck sections, the slope behind the west bank
  outdoor(b, "cliff", [190, 0, 0], 1, 0, () => undefined); outdoor(b, "cliff", [310, 0, 0], 1, Math.PI, () => undefined);
  b.box([250, 0.02, 0], [40, 0.02, 160], "#2f7fa6");
  for (const x of [243.3, 256.7]) outdoor(b, "bridge_pier", [x, 0, 0], 1, 0, () => undefined);
  for (let i = 0; i < 3; i++) part(b, `dk${i}`, "bridge_deck", [236.6 + i * 13.4, 14, 0]);
  for (const x of [190, 310]) b.box([x, 14.12, 0], [80, 0.02, 7], road);
  hill(b, 190); hill(b, 310);
  for (const [x, z, k] of [[222, 11, 1.3], [205, -6.5, 1], [279, 9, 1.4], [176, 8, 1.2]] as number[][]) outdoor(b, "rock_cluster", [x, 14, z], k, x, () => undefined);
  for (const [x, z] of [[170, 26], [214, 40], [290, 30], [330, 16], [160, -20], [300, -26]] as number[][]) outdoor(b, "pine_cluster", [x, 14, z], 1.1, x, () => undefined);
  for (const [x, z, k] of [[212, -44, 2.6], [160, -40, 2]] as number[][]) outdoor(b, "rock_cluster", [x, 14 + hillH(190, x, z) - 0.5, z], k, x, () => undefined);
  for (const [x, z] of [[160, -24], [156, -44], [221, -26]] as number[][]) outdoor(b, "pine_cluster", [x, 14 + hillH(190, x, z) - 0.5, z], 1.2, x, () => undefined); // clear of the slide of 21
  outdoor(b, "tree_pine", [163.4, 14, 4.2], 1, 1, () => undefined); // near dark for shot 21
  for (let i = 0; i < 18; i++) part(b, `bo${i}`, "boulder");
  part(b, "cow_br", "cow");
  // the rails, the portal (intact or rubble, per shot) set in a rock wall, the peak behind it
  const RZ = 220;
  for (const dz of [-0.75, 0.75]) b.box([-40, 0.2, RZ + dz], [352, 0.11, 0.11], "#5c5c68");
  for (let x = -214; x <= 134; x += 1.6) b.box([x, 0.07, RZ], [0.3, 0.13, 2.5], "#5a4230");
  part(b, "portal", "tunnel_portal", [120, 0, RZ]); part(b, "rubble", "portal_rubble", [120, 0, RZ]);
  for (const s of [-1, 1]) b.box([128, 7, RZ + s * 47], [16, 14, 68], "#7a766f");
  b.box([128, 13, RZ], [16, 2, 26], "#7a766f");
  outdoor(b, "cliff", [176, 0, RZ], 1, Math.PI, () => undefined); outdoor(b, "mountain_peak", [300, -1, RZ], 0.3, 0.4, () => undefined);
  for (let k = 0; k < 26; k++) { const x = -180 + ornd() * 280, z = RZ + 22 + ornd() * 70; if (x > 20 && x < 60 && z < 262) continue; outdoor(b, k % 2 ? "pine_cluster" : "tree_pine", [x, 0, z], 1 + ornd() * 0.5, k, () => undefined); }
  for (let k = 0; k < 18; k++) { const x = -180 + ornd() * 280, z = RZ - 20 - ornd() * 60; outdoor(b, k % 2 ? "pine_cluster" : "tree_pine", [x, 0, z], 1 + ornd() * 0.5, k, () => undefined); }
  outdoor(b, "crate", [40, 0, 240], 1, 0, () => undefined); outdoor(b, "crate", [38.2, 0, 240], 1, 0.2, () => undefined); outdoor(b, "rock_cluster", [32, 0, 238], 1, 3, () => undefined);
  outdoor(b, "rock_cluster", [84, 0, 226], 0.9, 2, () => undefined);
  const mg = new THREE.Group(); mg.name = "mover"; b.group.add(mg);
  const m = new SetBuilder(mg); westTrain(m, 0, RZ, "express"); m.finish();
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

// ---------------- ep15 pacific set (2026-11-07): sea, jungle yard, dock, domed hall, sub cabin, jail, sea floor ----------------
/** a moving group built from primitives (ep15): name -> RIG like part() */
function rigBuild(b: SetBuilder, name: string, draw: (m: SetBuilder) => void, noCast = false) {
  const g = new THREE.Group(); g.name = name; g.rotation.order = "YXZ"; b.group.add(g);
  const m = new SetBuilder(g); draw(m); m.finish(); RIG.set(name, g);
  if (noCast) g.traverse((o) => { o.userData.noCast = true; });
  return g;
}
/** interiors lit by the set's pool only: no mesh of theirs casts (a roof would shade the pool's far key) */
function noCast(b: SetBuilder, draw: (m: SetBuilder) => void) {
  const g = new THREE.Group(); b.group.add(g); const m = new SetBuilder(g); draw(m); m.finish(); g.traverse((o) => { o.userData.noCast = true; });
}
const BALE = (m: SetBuilder, k = 1) => { m.box([0, 0.25 * k, 0], [0.9 * k, 0.5 * k, 0.6 * k], "#d8cfb8"); m.box([0, 0.25 * k, 0], [0.92 * k, 0.12 * k, 0.62 * k], "#9a8a6a"); };
function pacific(b: SetBuilder) {
  // ---- sea: swell tiles round the action, a flat sea beyond, land to the west (x < -330)
  // swells painted (no ink): their crest lines boiled at 49 k/Mpx at range in the first temporal run
  b.paint = true; if (OUT.has("wave_tile")) for (let i = -5; i <= 5; i++) for (let j = -5; j <= 3; j++) outdoor(b, "wave_tile", [i * 20, -0.75, j * 20], 1, 0, () => undefined); b.paint = false;
  b.paint = true; // sea, land and beach slabs unlined: their long shore edges boiled at grazing angles (shot 22)
  b.box([0, -0.06, 0], [660, 0.12, 900], "#2a8fb8");
  b.box([-765, 0.15, 0], [870, 0.3, 1400], "#7aa85a"); b.box([-326, 0.1, 0], [24, 0.2, 1400], "#e3cf9c"); b.paint = false; // land + a beach strip
  // ---- vessels: posed per shot (story.ts MOVER_AT)
  const sub = rigBuild(b, "sub", () => undefined); part(b, "sub_body", "sub_hull", [0, 0, 0], sub);
  part(b, "sub_hatch", "sub_hatch", [0, 2.2, 4.2], sub);
  { const sd = new SetBuilder(sub); sd.paint = true; sd.box([0, 1.37, -1.5], [2.0, 0.05, 10], "#7d8ea6"); sd.box([0.45, 1.4, -1.5], [0.3, 0.04, 9.6], "#d6e0ea"); sd.finish(); } // a lit deck top + highlight (round 2: the glb deck read as a black slab)
  part(b, "cutter", "cutter"); part(b, "fboat", "fast_boat"); part(b, "fboat2", "fast_boat"); part(b, "plane", "small_plane");
  for (let i = 0; i < 8; i++) rigBuild(b, `bale${i}`, (m) => BALE(m));
  // the cutter's aft deck, in its own frame (nose +z, deck y 4.6): table, seat crate, folded blankets, a locker
  const deck = new THREE.Group(); RIG.get("cutter")!.add(deck); const dk = new SetBuilder(deck), D = 4.6;
  dk.box([1.6, D + 0.45, -13.2], [0.9, 0.06, 1.6], "#8a8f99"); dk.box([1.6, D + 0.22, -13.2], [0.08, 0.44, 0.08], "#3a3f4a");
  dk.box([2.6, D + 0.22, -14.2], [0.6, 0.44, 0.6], "#4a5868");
  for (let i = 0; i < 6; i++) dk.box([2.6, D + 0.1 + i * 0.13, -16.4], [0.6, 0.12, 0.9], i % 2 ? "#8e8478" : "#7b7266");
  dk.box([2.9, D + 0.5, -15.2], [0.8, 1.0, 1.2], "#d8dde2"); dk.finish();
  // ---- jungle yard (x -500): a river along z, a log slip down to it, palms, green mounds
  const J = -500, G = 0.3;
  b.box([J + 34, G + 0.02, 0], [22, 0.02, 400], "#3f7f8a");
  for (let i = 0; i < 9; i++) b.geo(new THREE.CylinderGeometry(0.22, 0.22, 4.2, 8).rotateX(Math.PI / 2), [J - 8 + i * 4.2, G + 0.22, 0], "#6d4a30");
  for (const s of [-1, 1]) b.beam([J - 9, G + 0.5, s * 1.6], [J + 26, G + 0.5, s * 1.6], 0.28, "#5a3d28");
  b.box([J - 12, G + 1.4, -7], [6, 2.8, 4], "#7a6248"); b.box([J - 12, G + 2.9, -7], [7, 0.2, 5], "#5b6b4a"); // a palm-roof shed
  b.box([J - 4, G + 0.3, 3.4], [0.6, 0.6, 0.6], "#b9a27a"); b.box([J - 3.2, G + 0.25, 3.6], [0.5, 0.5, 0.5], "#4f6a7a"); // paint tins
  for (let k = 0; k < 34; k++) { const a = ornd() * 6.28, d = 9 + ornd() * 34, x = J + Math.cos(a) * d, z = Math.sin(a) * d * 0.9;
    if (x > J + 20 && x < J + 48) continue; if (Math.abs(z) < 4) continue; prop(b, "palm", [x, G, z], 6 + ornd() * 4, ornd() * 6); }
  for (const [x, z] of [[-506, 13], [-511, 9]] as number[][]) prop(b, "palm", [x, G, z], 8, x); // near the crane-down of 3
  for (let k = 0; k < 9; k++) b.geo(sph(26 + ornd() * 14, 1.4, 0.55, 1, 10), [J - 50 + ornd() * 60, G - 2, -70 - ornd() * 50], k % 2 ? "#4f7f45" : "#5f8f4c");
  // ---- dock (z 60): plank pier into the sea, posts, a ramp to land, crates, a shed
  const PZ = 60;
  b.box([-312, 1.1, PZ], [44, 0.2, 4], "#8a6a48");
  for (let x = -332; x <= -292; x += 4) for (const s of [-1, 1]) b.box([x, 0.4, PZ + s * 2.1], [0.35, 1.9, 0.35], "#4a3626");
  b.box([-338, 0.7, PZ], [8, 0.16, 3], "#8a6a48");
  b.box([-318, 1.55, PZ + 1.4], [0.8, 0.7, 0.7], "#6f7a84"); // the grey crate of 23 (the orange jacket reads on it)
  outdoor(b, "crate", [-306, 1.2, PZ - 1.2], 0.7, 0.5, () => undefined);
  hut(b, -350, PZ + 8, 9, 6, 3.4, "#d9c7a3", "#8a4b32"); hut(b, -360, PZ - 6, 7, 6, 3, "#a7c4d9", "#5b4636");
  for (const [x, z] of [[-346, 48], [-352, 74], [-372, 62]] as number[][]) prop(b, "palm", [x, G, z], 8, x);
  outdoor(b, "sailboat", [-300, 0.35, PZ + 9], 1, 1.4, () => undefined);
  // ---- domed hall (x -450, z -250): plaza, flagpole, trees, a lectern near the lens
  const HX = -450, HZ = -250;
  b.box([HX, G + 0.03, HZ + 22], [60, 0.06, 50], "#cfc8b8");
  outdoor(b, "dome_hall", [HX, G, HZ], 1, 0, () => b.box([HX, 6, HZ], [34, 12, 18], "#e9e3d3"));
  b.cylinder([HX - 20, G + 6, HZ + 12], 0.1, 12, "#c9ccd4");
  for (const x of [-34, 34]) for (const z of [-10, 8, 26]) outdoor(b, "tree_round", [HX + x, G, HZ + z], 1.3, x + z, () => undefined);
  b.box([HX, G + 0.55, HZ + 42], [0.8, 1.1, 0.6], "#6d4a30"); b.box([HX, G + 1.12, HZ + 42], [1.0, 0.06, 0.8], "#5a3d28");
  // ---- the sub's cabin (x 495-505, z +-1.3, 2.1 high): rust, pipes, a lamp; bales along the back
  const C = 500;
  noCast(b, (m) => {
    m.box([C, -0.05, 0], [10.4, 0.1, 3], "#2a221d");
    m.box([C, 1.05, -1.4], [10.4, 2.2, 0.12], "#8a979e"); m.box([C, 1.05, 1.4], [10.4, 2.2, 0.12], "#8a979e");
    for (const s of [-1, 1]) m.box([C + s * 5.2, 1.05, 0], [0.12, 2.2, 3], "#56626a");
    m.box([C, 2.2, 0], [10.4, 0.12, 3], "#6a767e");
    for (let i = 0; i < 7; i++) m.box([C - 4.5 + i * 1.5, 1.05, -1.33], [0.1, 2.1, 0.04], "#3e464c"); // ribs
    for (let i = 0; i < 9; i++) m.box([C - 4 + ((i * 37) % 9) * 0.9, 0.5 + ((i * 13) % 7) * 0.2, -1.32], [0.2 + (i % 3) * 0.12, 0.12 + (i % 2) * 0.1, 0.03], "#8a5236"); // rust patches
    m.box([C - 2.6, 1.7, -1.32], [0.9, 0.08, 0.03], "#b8b49a"); m.box([C - 2.2, 1.55, -1.32], [0.08, 0.6, 0.03], "#b8b49a"); // tape
    m.beam([C - 5, 1.85, 1.05], [C + 5, 1.85, 1.05], 0.14, "#2c3138"); m.beam([C - 5, 1.95, -1.1], [C + 5, 1.95, -1.1], 0.1, "#2c3138"); // pipes
    m.beam([C + 1, 0.1, -1.15], [C + 1, 0.95, -1.15], 0.12, "#2c3138"); // valve riser
    m.box([C + 2, 0.75, -1.05], [1.2, 0.08, 0.5], "#5a4a3a"); // the shelf of the jackets
    m.box([C - 1.9, 2.12, 0], [0.9, 0.06, 0.9], "#3e464c"); // hatch frame
    m.box([C, 2.08, 1.0], [0.2, 0.12, 0.2], "#ffd48a"); // the lamp
  });
  for (let i = 0; i < 6; i++) { const g = rigBuild(b, `cbale${i}`, (m) => BALE(m, 1), true); g.position.set(C + 3.7 + (i % 2) * 0.95, Math.floor(i / 2) * 0.5, -0.8); }
  rigBuild(b, "flood", (m) => m.box([C, 0, 0], [10.2, 0.04, 2.7], "#2a6f8f"), true);
  // the jail corner (z 2.2-7): cream block wall, a barred window, a bunk
  noCast(b, (m) => {
    m.box([C, -0.05, 4.6], [6, 0.1, 5], "#8a8578"); m.box([C, 1.4, 2.2], [6, 2.8, 0.12], "#d8d0bc");
    for (const s of [-1, 1]) m.box([C + s * 3, 1.4, 4.6], [0.12, 2.8, 5], "#cfc6b0");
    for (let i = 0; i < 5; i++) m.box([C, 0.3 + i * 0.55, 2.27], [6, 0.02, 0.02], "#b8b09c");
    m.box([C + 1.2, 2.0, 2.26], [1.0, 0.6, 0.02], "#cfe4f4"); for (let i = 0; i < 5; i++) m.box([C + 0.8 + i * 0.2, 2.0, 2.3], [0.04, 0.6, 0.04], "#3a3f4a");
    m.box([C - 1.8, 0.45, 2.8], [2, 0.12, 0.9], "#6a7686");
  });
  // ---- the sea floor (x 700): sand, dark rocks, a wall of blue round it
  const U = 700;
  b.box([U, -0.06, 0], [240, 0.12, 240], "#3d6f86");
  for (let k = 0; k < 6; k++) outdoor(b, "rock_cluster", [U - 40 + ornd() * 80, 0, -40 + ornd() * 70], 2 + ornd() * 3, k, () => undefined);
}
// ---------------- ep16 tips set (2026-11-07): see SETS.tips; moving parts are RIG groups posed from eps/ep16/story.ts ----------------
/** a tip screen body: dark slab, front +z turned by yaw; the face is an episode fx card 2.6 cm in front */
function tipBox(m: SetBuilder, [x, y, z]: V3, yaw = 0) { m.box([x, y, z], [0.36, 0.27, 0.045], "#2b2f3a", "plain", yaw); }
function tips(b: SetBuilder) {
  ground(b, 2400, "#86b864");
  const road = "#454a66", walk = "#c9b79a"; // round 2: darker asphalt, the near dark of the crane (shot 3 value .36)
  // ---- shop street (x -40..40): road z 5..13, walk z -3..4.6, kerb, shop fronts at z -3, houses across the road
  b.box([0, 0.02, 9], [600, 0.02, 8], road); b.box([0, 0.04, 0.8], [600, 0.04, 7.6], walk); b.box([0, 0.08, 4.65], [600, 0.16, 0.2], "#a69a85");
  const SH: [number, string, string][] = [[-21, "#d58a4b", "#c63939"], [-14, "#6f9f9a", "#2F6E73"], [-7, "#e2b04e", "#5b8eaa"], [0, "#b9748f", "#7a4a8c"], [7, "#d9c7a3", "#c63939"], [14, "#a7c4d9", "#2F6E73"], [21, "#e8dcc1", "#b93c51"]];
  for (const [x, wall, aw] of SH) {
    b.box([x, 5, -6.5], [7, 10, 7], wall); // plain: brick seams crawled under the crane (temporal_qa 3 / 24)
    b.paint = true; // panes, sills and awning slats unlined: their thin edges boiled at 81 k/Mpx in shot 3
    b.box([x - 1.2, 1.4, -2.95], [3.0, 1.9, 0.08], "#4d677a"); // display window: the shop is darker inside than the street b.box([x - 1.2, 0.35, -2.9], [3.2, 0.12, 0.12], "#3a3040");
    for (let k = 0; k < 7; k++) b.box([x - 3 + k + 0.5, 3.05, -2.4], [1, 0.1, 1.2], k % 2 ? "#f4f1ea" : aw);
    for (let y = 5.5; y < 9.5; y += 2.4) for (const dx of [-1.8, 1.8]) b.box([x + dx, y, -2.97], [1.2, 1.4, 0.06], "#9cc3d6");
    b.paint = false; b.box([x - 3 + 3.5, 3.0, -2.95], [7, 0.12, 0.2], aw); // one inked awning edge
    if (x !== 0) framed(b, x + 1.9, 1.1, -2.95, 1.0, 2.1, aw);
  }
  // the door shop (x 0): a dark frame, the hinged door is RIG "door" (story.ts puts its hinge at x 1.4)
  b.box([1.9, 1.15, -2.96], [1.3, 2.3, 0.1], "#2a2530"); b.box([1.9, 2.36, -2.9], [1.4, 0.12, 0.2], "#2a2530");
  rigBuild(b, "door", (m) => { m.box([0.5, 1.07, 0], [0.98, 2.1, 0.07], "#7a4a8c"); m.box([0.5, 1.75, 0.04], [0.6, 0.5, 0.02], "#cfe4f4"); m.box([0.86, 1.0, 0.07], [0.05, 0.3, 0.06], "#c9ccd4"); tipBox(m, [0.5, 1.3, 0.06]); });
  for (const [x, z] of [[-3.2, 3.9], [3.6, 3.9], [-17, 3.9], [17, 3.9], [-30, 3.9], [30, 3.9]] as number[][]) outdoor(b, "street_lamp", [x, 0, z], 1, 0, () => b.beam([x, 0, z], [x, 4.2, z], 0.14, "#2f3e4f"));
  outdoor(b, "hydrant", [-6.5, 0.04, 3.8], 1, 0, () => b.cylinder([-6.5, 0.4, 3.8], 0.18, 0.8, "#c63939"));
  outdoor(b, "mailbox", [-9.5, 0.04, 3.8], 1, 0, () => b.box([-9.5, 0.9, 3.8], [0.4, 0.5, 0.5], "#3f6c8c"));
  outdoor(b, "tree_round", [-12.6, 0, 4.0], 0.9, 1, () => puff(b, -12.6, 4, 1));
  for (const x of [-26, 26, 36]) outdoor(b, "tree_round", [x, 0, 3.8], 0.9, x, () => puff(b, x, 3.8, 1));
  for (const x of [-6.1, -9.1, -12.2]) { b.beam([x, 0, 3.8], [x, 0.9, 3.8], 0.06, "#3a3f4a"); tipBox(b, [x, 1.05, 3.86]); } // hydrant, mailbox, tree: each gets a screen post
  tipBox(b, [-3.2, 1.6, 4.06]); // on the near lamp
  for (let i = 0; i < 5; i++) tipBox(b, [10 + i * 3, 1.3, -2.88]); // the row of shot 24 on the shop walls
  for (const [x, c] of [[-36, "#d9c7a3"], [-24, "#c96b55"], [-12, "#83ad69"], [0, "#d58a4b"], [12, "#6f9f9a"], [24, "#a7c4d9"], [36, "#e2b04e"]] as [number, string][]) {
    b.box([x, 5, 20], [10, 10, 6], c); b.paint = true; for (const dx of [-2.5, 2.5]) for (const y of [2, 5.5, 8.5]) b.box([x + dx, y, 16.97], [1.4, 1.4, 0.06], "#9cc3d6"); b.paint = false; }
  rigBuild(b, "cab", (m) => outdoor(m, "car_small", [0, 0, 0], 1, 0, () => m.box([0, 0.7, 0], [1.8, 1.4, 4], "#c63939")));
  // ---- apartment steps (x -80): a block, a stoop with 5 RIG steps (st0 bottom, origin = top centre) that fold into a ramp, railings, a bush near the lens
  const A = -80;
  outdoor(b, "apartment_block", [A, 0, -9.6], 1, 0, () => b.box([A, 9, -9.6], [12, 18, 10], "#c96b55", "brick"));
  b.box([A, 0.5, -3.75], [2.8, 1.0, 1.1], "#b8ad9a"); b.box([A, 1.25, -4.28], [1.3, 2.3, 0.08], "#3a3040"); b.box([A, 1.2, -4.22], [1.0, 2.0, 0.06], "#2F6E73");
  for (let i = 0; i < 5; i++) { const h = 0.2 * (i + 1); rigBuild(b, `st${i}`, (m) => { m.box([0, -h / 2, 0], [2.2, h, 0.32], "#c9bfae"); m.box([0, -0.015, 0.155], [2.2, 0.03, 0.03], "#8d8578"); }); }
  for (const x of [A - 1.2, A + 1.2]) { b.beam([x, 0.95, -1.6], [x, 1.95, -3.2], 0.07, "#2c3138"); b.beam([x, 0, -1.6], [x, 0.95, -1.6], 0.08, "#2c3138"); b.beam([x, 1.0, -3.2], [x, 1.95, -3.2], 0.08, "#2c3138"); }
  tipBox(b, [A + 1.2, 1.12, -1.53]);
  outdoor(b, "bush", [A - 2.2, 0, 0.6], 0.8, 0.4, () => b.geo(sph(0.6, 1.2, 0.8, 1, 10), [A - 2.2, 0.4, 0.6], "#4f7f45"));
  for (const dx of [-14, 14]) outdoor(b, "house_a", [A + dx, 0, -8], 1, 0, () => undefined);
  for (const dx of [-5, 5]) outdoor(b, "tree_round", [A + dx, 0, -1.8], 0.9, dx, () => undefined);
  // ---- cart plaza (x 80): paving, the coffee cart (counter along x, customers at +z), its screen on a RIG post, trees, flats, screen posts
  const K = 80;
  b.box([K, 0.06, 0], [36, 0.04, 26], "#d8ccb4");
  b.box([K, 0.62, 0], [2.4, 0.9, 0.9], "#2F6E73"); b.box([K, 1.1, 0], [2.6, 0.08, 1.05], "#f3e7ce"); b.box([K, 0.62, 0.455], [2.2, 0.7, 0.03], "#3d8a8f");
  for (const dx of [-0.9, 0.9]) b.geo(new THREE.CylinderGeometry(0.22, 0.22, 0.1, 16).rotateX(Math.PI / 2), [K + dx, 0.22, 0.5], "#2a2530");
  for (const dx of [-1.2, 1.2]) for (const dz of [-0.45, 0.45]) b.beam([K + dx, 1.1, dz], [K + dx, 2.35, dz], 0.06, "#e8e2d4");
  b.box([K, 2.36, 0], [3.0, 0.06, 1.3], "#c63939"); b.paint = true; for (let k = 0; k < 6; k++) b.box([K - 1.25 + k * 0.5 + 0.25, 2.41, 0], [0.5, 0.04, 1.3], k % 2 ? "#f4f1ea" : "#c63939"); b.paint = false;
  b.box([K - 0.6, 1.4, -0.15], [0.5, 0.52, 0.42], "#3a3f4a"); b.box([K - 0.6, 1.55, 0.07], [0.3, 0.12, 0.05], "#c9ccd4"); // the coffee machine
  b.cylinder([K + 0.25, 1.24, 0.25], 0.09, 0.2, "#cfe4f4"); // tip jar
  for (const dx of [0, 0.12]) b.cylinder([K - 0.15 + dx, 1.19, 0.3], 0.04, 0.1, "#f4f1ea");
  rigBuild(b, "cscreen", (m) => { m.beam([0, -0.2, 0], [0, 0.04, 0], 0.05, "#2b2f3a"); tipBox(m, [0, 0.14, 0]); });
  for (const [x, z] of [[-14, -8], [14, -8], [-14, 9], [14, 9]] as number[][]) outdoor(b, "tree_round", [K + x, 0, z], 1, x + z, () => undefined);
  for (const dx of [-12, 12]) outdoor(b, "apartment_block", [K + dx, 0, -22], 1, 0, () => undefined);
  outdoor(b, "shop_awning", [K, 0, -18], 1.2, 0, () => undefined);
  for (const [x, z] of [[-8, 4], [8, 4], [-8, -5], [8, -5], [0, 8]] as number[][]) { b.beam([K + x, 0, z], [K + x, 1.15, z], 0.07, "#3a3f4a"); tipBox(b, [K + x, 1.3, z + 0.03]); }
  outdoor(b, "bench", [K - 6, 0.06, 6], 1, 0, () => undefined);
  // ---- park (x 160): lawn, a path, the RIG bench (origin on the front foot, tips forward about +x), trees, bushes
  const PK = 160;
  b.box([PK, 0.03, 0], [60, 0.03, 40], "#7fbf5e"); b.box([PK, 0.05, -4.5], [60, 0.02, 1.6], "#d8c9a2");
  rigBuild(b, "pbench", (m) => {
    m.box([0, 0.46, -0.24], [1.7, 0.07, 0.46], P.wood, "wood"); m.box([0, 0.8, -0.5], [1.7, 0.42, 0.06], P.wood, "wood");
    for (const dx of [-0.75, 0.75]) { m.box([dx, 0.23, -0.24], [0.08, 0.46, 0.4], "#3a3f4a"); m.box([dx, 0.62, -0.24], [0.08, 0.06, 0.46], "#3a3f4a"); }
    m.beam([0.98, 0.46, -0.12], [0.98, 0.6, -0.12], 0.05, "#3a3f4a"); tipBox(m, [0.98, 0.72, -0.1]);
  });
  for (const [x, z, k] of [[-4.5, 3.4, 1.2], [-9, -6, 1.3], [7, -9, 1.4], [14, -4, 1.2], [-16, -12, 1.5], [20, -14, 1.3]] as number[][]) outdoor(b, "tree_round", [PK + x, 0, z], k, x, () => puff(b, PK + x, z, k));
  for (const [x, z] of [[-2.4, -1.6], [2.6, -1.8], [5, 1], [-6.5, 0.5]] as number[][]) outdoor(b, "bush", [PK + x, 0, z], 1, x, () => undefined);
  outdoor(b, "bush", [PK + 1.7, 0, 3.6], 0.8, 2, () => undefined);
  // ---- bus stop (x 240): posts, glass back, bench, the RIG roof (slides along +x), stop sign, shops behind
  const BS = 240;
  for (const x of [BS - 1.7, BS + 1.7]) for (const z of [-0.72, 0.72]) b.box([x, 1.25, z], [0.09, 2.5, 0.09], "#3a3f4a");
  b.box([BS, 1.35, -0.74], [3.3, 2.0, 0.05], "#a9cfe0"); b.box([BS, 0.45, -0.45], [2.6, 0.07, 0.4], P.wood, "wood");
  for (const dx of [-1.1, 1.1]) b.box([BS + dx, 0.22, -0.45], [0.07, 0.44, 0.36], "#3a3f4a");
  rigBuild(b, "bsroof", (m) => { m.box([0, 0, 0], [3.8, 0.12, 1.8], "#5b8eaa"); m.box([0, 0.09, 0], [3.6, 0.06, 1.6], "#e8e2d4"); });
  tipBox(b, [BS + 1.7, 1.3, 0.79]);
  b.box([BS, 0.03, 4.4], [60, 0.03, 3.2], "#40455e"); b.box([BS, 0.08, 2.75], [60, 0.14, 0.18], "#a69a85"); // round 2: the bus road, a real near dark for 12-13
  b.beam([BS - 2.6, 0, 0.9], [BS - 2.6, 2.6, 0.9], 0.07, "#3a3f4a"); b.geo(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 20).rotateX(Math.PI / 2), [BS - 2.6, 2.75, 0.92], "#2F6E73");
  for (const [dx, c] of [[-9, "#d58a4b"], [0, "#a7c4d9"], [9, "#e2b04e"]] as [number, string][]) b.box([BS + dx, 4, -8], [8, 8, 6], c, "brick");
  for (const x of [BS - 6, BS + 6]) outdoor(b, "tree_round", [x, 0, -2.5], 1, x, () => undefined);
  // ---- interiors (x 400): the elevator car (z -0.85..0.85, open toward +z) and the bedroom (z 4..8.6, open toward +z); they cast nothing
  const E = 400, Z = 6.3;
  noCast(b, (m) => {
    m.box([E, -0.05, 0], [1.8, 0.1, 1.8], "#3a3640"); m.box([E, 2.35, 0], [1.8, 0.1, 1.8], "#8a929c"); m.box([E, 2.29, 0], [0.8, 0.03, 0.8], "#fff2d0");
    m.box([E, 1.15, -0.85], [1.8, 2.3, 0.08], "#a9b0b8"); for (const s of [-1, 1]) m.box([E + s * 0.86, 1.15, 0], [0.08, 2.3, 1.8], "#9aa2ac");
    m.beam([E - 0.8, 0.95, -0.78], [E + 0.8, 0.95, -0.78], 0.05, "#d8dde2");
    for (const s of [-1, 1]) m.box([E + s * 0.68, 1.15, 0.86], [0.42, 2.3, 0.07], "#4a525c");
    m.box([E + 0.8, 1.0, 0.45], [0.04, 0.5, 0.2], "#3a3f4a"); for (let i = 0; i < 3; i++) m.box([E + 0.78, 0.85 + i * 0.13, 0.45], [0.03, 0.07, 0.07], "#e8c45a");
    m.box([E, 2.12, -0.8], [0.5, 0.2, 0.04], "#1e2128");
    m.box([E, -0.05, Z], [4.4, 0.1, 4.6], "#8a6a48", "wood"); m.box([E, 2.75, Z], [4.4, 0.1, 4.6], "#e8dcc1");
    m.box([E, 1.35, 4.0], [4.4, 2.7, 0.1], "#5b6f9a", "wallpaper"); for (const s of [-1, 1]) m.box([E + s * 2.2, 1.35, Z], [0.1, 2.7, 4.6], "#56689a", "wallpaper");
    m.box([E, 2.15, 4.08], [1.8, 0.12, 0.12], "#3a2a22"); for (const s of [-1, 1]) m.box([E + s * 0.84, 1.07, 4.08], [0.12, 2.15, 0.12], "#3a2a22"); // the wall bed recess frame
    m.box([E - 1.5, 0.3, 4.4], [0.5, 0.6, 0.45], "#6a4a38"); m.box([E - 1.5, 0.95, 4.35], [0.24, 0.5, 0.24], "#ffd48a"); // nightstand + lamp
    m.box([E + 1.5, 1.7, 4.06], [0.8, 0.8, 0.04], "#1a2350"); m.box([E + 1.5, 1.7, 4.09], [0.85, 0.06, 0.03], "#e8dcc1"); // night window
    tipBox(m, [E + 0.79, 1.3, 0.1], -Math.PI / 2); tipBox(m, [E + 1.25, 0.95, 4.08]);
  });
  rigBuild(b, "wbed", (m) => { m.box([0, 0.2, 1.0], [1.4, 0.3, 2.0], "#3a2a22"); m.box([0, 0.42, 1.0], [1.32, 0.16, 1.92], "#f4f1ea"); m.box([0, 0.52, 1.25], [1.34, 0.06, 1.5], "#c63939", "cloth"); m.box([0, 0.55, 0.28], [0.8, 0.12, 0.34], "#e8e4f0"); }, true);
}

// ---------------- ep17 salary set (2026-11-08): your street + the Neighbor's yard x 0, office plaza x 100, café terrace x 200, park x 300 ----------------
/** a plain-walled gable home, front at z (facing +z): door (open, dark hall), 4 windows; the walls stay plain (wood seams boil in the cranes) */
function home17(b: SetBuilder, x: number, z: number, w: number, wall: string, roof: string, door: string) {
  const d = 7, h = 5.6;
  b.box([x, h / 2, z - d / 2], [w, h, d], wall);
  b.paint = true; // roof unlined: the eave line boiled in the cranes (temporal_qa 16 / 29)
  b.geo(tri(V(-w / 2 - 0.3, 0, 0), V(w / 2 + 0.3, 0, 0), V(0, 2.4, 0)), [x, h, z + 0.02], roof);
  for (const s of [-1, 1]) b.batch.add(quad(V(x, h + 2.4, z - d - 0.3), V(x + s * (w / 2 + 0.3), h - 0.1, z - d - 0.3), V(x + s * (w / 2 + 0.3), h - 0.1, z + 0.3), V(x, h + 2.4, z + 0.3)), material(roof));
  b.paint = false;
  b.box([x + w / 2 - 1.4, h + 1.2, z - d / 2], [0.7, 1.8, 0.7], P.brick); // chimney
  b.paint = true; // door, hall and windows unlined: their edges boiled under the night crane (temporal_qa 16 / 29)
  b.box([x, 1.15, z + 0.03], [1.36, 2.36, 0.08], "#f4f1ea"); b.box([x, 1.1, z + 0.07], [1.1, 2.2, 0.04], "#1a1620"); // door frame + dark hall (its face 1 cm proud: it z-fought the frame, temporal 16)
  b.box([x - 0.5, 1.08, z - 0.4], [0.07, 2.1, 0.86], door, "plain", 0.25); // the door leaf, swung open inside
  for (const wx of [-w / 2 + 1.5, w / 2 - 1.5]) for (const y of [1.55, 4.15]) { b.box([x + wx, y, z + 0.04], [1.3, 1.25, 0.06], "#f4f1ea"); b.box([x + wx, y, z + 0.07], [1.1, 1.05, 0.03], "#4d677a"); }
  b.paint = false;
}
function salary(b: SetBuilder) {
  ground(b, 2400, "#86b864");
  // ---- your street (x -40..40): road z 3..10, pavement z -0.2..2.8, front gardens z -4..-0.2, homes at z -4, houses across at z 13
  b.paint = true; // road, pavements and kerbs unlined: the far kerb line boiled in the crane (temporal_qa 24)
  b.box([0, 0.02, 6.5], [600, 0.02, 7], "#454a66"); b.box([0, 0.04, 1.3], [600, 0.04, 3], "#c9b79a"); b.box([0, 0.08, 2.85], [600, 0.16, 0.2], "#a69a85");
  b.box([0, 0.03, 10.6], [600, 0.04, 1.6], "#c9b79a"); b.paint = false;
  // your home (x 0, front z -4): porch deck 0.4 high (z -4..-2.8), one step, two dark posts, a roof, the doormat, a path
  home17(b, 0, -4, 8, "#e2b04e", "#8a4b32", "#2F6E73");
  b.paint = true; // deck, step, posts, porch roof, mat and path unlined (thin edges boiled in 16)
  for (const s of [-1, 1]) b.box([s * 1.45, 1.6, -2.95], [0.18, 2.4, 0.18], "#2f3e4f");
  b.box([0, 2.88, -3.35], [3.5, 0.16, 1.5], "#8a4b32");
  b.box([0, 0.425, -3.25], [0.9, 0.02, 0.5], "#7a3a2a"); // doormat 1.5 cm clear of the deck top (0.40): coplanar faces z-fought, flicker in 16
  b.box([0, 0.05, -1.6], [1.2, 0.03, 2.4], "#d8ccb4");
  b.box([0, 0.2, -3.45], [3.2, 0.4, 1.3], "#b8ad9a"); b.box([0, 0.1, -2.625], [1.6, 0.2, 0.45], "#a89e8b"); // deck runs into the wall, step into the deck: no shared planes
  b.geo(sph(0.6, 1.2, 0.8, 1, 10), [-2.6, 0.4, -1.0], "#4f7f45"); b.geo(sph(0.6, 1.2, 0.8, 1, 10), [4.6, 0.4, -0.9], "#4f7f45"); // plain: the bush GLB boiled in 29
  outdoor(b, "mailbox", [2.2, 0.04, -0.1], 1, 0, () => b.box([2.2, 0.9, -0.1], [0.4, 0.5, 0.5], "#3f6c8c")); b.paint = false;
  // the Neighbor's home (x 12, front z -4.5), a low solid white fence on z -0.4 (x 7.6..16.6, posts dark), a gap for the path, the rose bed
  home17(b, 12, -4.5, 8, "#a7c4d9", "#5b4636", "#c63939");
  b.box([12, 0.05, -2.3], [1.2, 0.03, 3.6], "#d8ccb4");
  for (const [x0, x1] of [[7.6, 11.4], [12.6, 16.6]]) {
    b.box([(x0 + x1) / 2, 0.45, -0.4], [x1 - x0, 0.7, 0.07], "#f4f1ea"); b.box([(x0 + x1) / 2, 0.83, -0.4], [x1 - x0 + 0.1, 0.07, 0.1], "#f4f1ea"); // rail thinner than the 0.14 posts: equal depth z-fought on every post
    const n = Math.round((x1 - x0) / 1.3);
    for (let i = 0; i <= n; i++) b.box([x0 + (i * (x1 - x0)) / n, 0.5, -0.4], [0.14, 1.0, 0.14], "#2f4a3a");
  }
  for (const [x, z, k] of [[13.6, -1.0, 1], [14.9, -1.05, 1.1], [16.0, -1.0, 0.9], [9.2, -1.0, 1], [15.2, -2.75, 0.8]] as number[][]) {
    b.geo(sph(0.55 * k, 1.25, 0.8, 1, 10), [x, 0.42 * k, z], "#3f6b3a");
    b.paint = true; for (let i = 0; i < 5; i++) b.geo(new THREE.SphereGeometry(0.11 * k, 8, 6), [x - 0.45 * k + i * 0.22 * k, (0.66 + 0.12 * Math.sin(i * 2.1)) * k, z + 0.28 * k * Math.cos(i * 1.3)], i % 2 ? "#d4344a" : "#e8506a"); b.paint = false;
  }
  // more homes along the street, houses across the road (front z 12.5, facing -z), lamps, trees
  for (const [x, c, r] of [[-12, "#c96b55", "#5b4636"], [-24, "#d9c7a3", "#8a4b32"], [24, "#83ad69", "#5b4636"], [36, "#e8dcc1", "#8a4b32"]] as [number, string, string][]) home17(b, x, -4.5, 8, c, r, "#2f3e4f");
  for (const [x, c] of [[-30, "#d58a4b"], [-18, "#a7c4d9"], [-6, "#e2b04e"], [6, "#b9748f"], [18, "#d9c7a3"], [30, "#6f9f9a"]] as [number, string][]) {
    b.box([x, 3.5, 16], [9, 7, 7], c); b.box([x, 7.1, 16], [9.4, 0.3, 7.4], "#5b4636");
    b.paint = true; for (const dx of [-2.6, 2.6]) for (const y of [1.8, 4.8]) b.box([x + dx, y, 12.47], [1.5, 1.4, 0.06], "#4d677a"); b.box([x, 1.1, 12.47], [1.2, 2.2, 0.06], "#2f3e4f"); b.paint = false;
  }
  for (const x of [-7, 7, -21, 21, 35]) outdoor(b, "street_lamp", [x, 0, 2.4], 1, 0, () => b.beam([x, 0, 2.4], [x, 4.2, 2.4], 0.14, "#2f3e4f"));
  for (const x of [-16, 18.5, 30]) outdoor(b, "tree_round", [x, 0, -1.6], 0.85, x, () => puff(b, x, -1.6, 0.85));
  outdoor(b, "car_small", [-10, 0.04, 4.4], 1, Math.PI / 2, () => b.box([-10, 0.7, 4.4], [4, 1.4, 1.8], "#3f6c8c"));
  // ---- office plaza (x 100): paving, the glass tower (front z -11), two twin desks on the terrace (z -3), planters, a glass pillar
  const O = 100;
  b.box([O, 0.05, -2], [44, 0.04, 26], "#a99e8c");
  b.box([O, 20, -16], [18, 40, 10], "#6f98b4");
  b.paint = true;
  for (let y = 3.6; y < 40; y += 3.6) b.box([O, y, -10.96], [18, 0.4, 0.06], "#4f7590");
  for (const dx of [-6, 0, 6]) b.box([O + dx, 20, -10.95], [0.4, 40, 0.06], "#4f7590");
  b.box([O, 1.5, -10.93], [3.2, 3.0, 0.06], "#2d4456");
  b.paint = false;
  for (const dx of [-17, 17]) outdoor(b, "apartment_block", [O + dx, 0, -18], 1, 0, () => b.box([O + dx, 9, -18], [12, 18, 10], "#c96b55"));
  for (const dx of [-1.0, 1.0]) {
    b.box([O + dx, 0.74, -3], [1.3, 0.06, 0.7], "#e8e2d4"); for (const ex of [-0.58, 0.58]) b.box([O + dx + ex, 0.37, -3], [0.06, 0.72, 0.6], "#3a3f4a");
    b.box([O + dx, 0.4, -2.67], [1.2, 0.56, 0.03], "#5a6070"); // modesty panel: the desk has a front
    b.box([O + dx, 0.47, -3.62], [0.5, 0.06, 0.46], "#2b2f3a"); b.box([O + dx, 0.8, -3.86], [0.5, 0.6, 0.06], "#2b2f3a"); b.beam([O + dx, 0, -3.62], [O + dx, 0.45, -3.62], 0.06, "#3a3f4a"); // office chair
    b.box([O + dx + 0.3, 0.8, -3.15], [0.4, 0.03, 0.28], "#2b2f3a"); b.box([O + dx + 0.3, 0.92, -3.29], [0.4, 0.26, 0.02], "#2b2f3a");
  }
  // a back row of desks with monitors (a lamp-lit office floor, so the wide reads as an office)
  for (const dx of [-4.2, -1.4, 1.4, 4.2]) { b.box([O + dx, 0.74, -6.2], [1.3, 0.06, 0.7], "#e8e2d4"); b.box([O + dx, 0.4, -5.87], [1.2, 0.56, 0.03], "#5a6070");
    b.box([O + dx + 0.25, 1.02, -6.4], [0.56, 0.36, 0.04], "#2b2f3a"); b.box([O + dx + 0.25, 0.86, -6.38], [0.06, 0.2, 0.06], "#3a3f4a");
    b.box([O + dx, 0.47, -6.85], [0.5, 0.06, 0.46], "#2b2f3a"); b.box([O + dx, 0.8, -7.1], [0.5, 0.6, 0.06], "#2b2f3a"); b.beam([O + dx, 0, -6.85], [O + dx, 0.45, -6.85], 0.06, "#3a3f4a"); }
  for (const [dx, dz] of [[-5.8, -0.2], [3.4, -1.0], [-7, -6], [7, -6]] as number[][]) { b.box([O + dx, 0.4, dz], [1.2, 0.8, 1.2], "#4a505e"); b.geo(sph(0.62, 1, 0.75, 1, 10), [O + dx, 1.0, dz], "#3f6b3a"); }
  b.cylinder([O - 2.4, 2.5, 1.4], 0.32, 5, "#2d4456");
  for (const [dx, dz] of [[-12, 2], [12, 2]] as number[][]) outdoor(b, "tree_round", [O + dx, 0, dz], 1, dx, () => puff(b, O + dx, dz, 1));
  // ---- café terrace (x 200): café front (z -6), sunny tables + parasols (x -6..1), the shade corner by the bins under a dark canopy (x 4..8.5)
  const C = 200;
  b.box([C, 0.05, -1], [40, 0.04, 16], "#b8a68a");
  b.box([C, 4, -9], [20, 8, 6], "#c9a98a"); b.box([C, 8.1, -9], [20.4, 0.3, 6.4], "#5b4636");
  b.paint = true; for (const dx of [-6, -2, 2]) b.box([C + dx, 1.4, -5.96], [3, 1.9, 0.06], "#3e5566"); b.box([C + 5.6, 1.15, -5.96], [1.3, 2.3, 0.06], "#2f3e4f");
  for (let k = 0; k < 10; k++) b.box([C - 8 + k * 1.2 + 0.6, 3.0, -5.4], [1.2, 0.08, 1.2], k % 2 ? "#f4f1ea" : "#2F6E73");
  b.paint = false;
  b.box([C - 2, 3.0, -4.8], [12.1, 0.12, 0.12], "#2F6E73");
  const table = (x: number, z: number, top = "#f4f1ea") => { b.cylinder([C + x, 0.74, z], 0.42, 0.05, top); b.cylinder([C + x, 0.37, z], 0.05, 0.72, "#3a3f4a"); b.cylinder([C + x, 0.03, z], 0.26, 0.04, "#3a3f4a"); };
  const parasol = (x: number, z: number, col: string) => { b.beam([C + x, 0, z], [C + x, 2.3, z], 0.06, "#e8e2d4"); b.geo(new THREE.ConeGeometry(1.3, 0.45, 10), [C + x, 2.45, z], col); };
  for (const [x, z] of [[-5.2, -2.6], [-2.6, -2.2], [-5.6, 0.4], [-2.2, 0.8], [0.4, -1.4]] as number[][]) table(x, z);
  for (const [x, z, c] of [[-5.2, -2.6, "#c63939"], [-2.2, 0.8, "#f4f1ea"], [0.4, -1.4, "#c63939"], [-5.6, 0.4, "#e2b04e"]] as [number, number, string][]) parasol(x, z, c);
  parasol(3.4, 4.4, "#c63939"); // the near parasol (its edge darkens the high shot)
  table(-3.6, 2.2); b.cylinder([C - 3.45, 0.88, 2.2], 0.05, 0.24, "#2a3a2e"); // near table + a dark bottle
  const chair = (x: number, z: number, yaw = 0) => { b.box([C + x, 0.44, z], [0.46, 0.05, 0.44], "#3a3f4a", "plain", yaw); b.box([C + x - 0.2 * Math.sin(yaw), 0.72, z - 0.2 * Math.cos(yaw)], [0.46, 0.5, 0.05], "#3a3f4a", "plain", yaw);
    for (const [ex, ez] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) b.beam([C + x + ex, 0, z + ez], [C + x + ex, 0.42, z + ez], 0.04, "#3a3f4a"); };
  for (const [x, z] of [[-5.2, -2.6], [-2.6, -2.2], [-5.6, 0.4], [-2.2, 0.8], [0.4, -1.4], [6.0, -2.6]] as number[][]) { chair(x - 0.45, z - 0.55); chair(x + 0.45, z - 0.55); }
  chair(4.4, -2.45); // his seat in the shade (13)
  b.box([C + 6.2, 2.6, -2.6], [4.4, 0.14, 3.6], "#3a4452");
  for (const dx of [-2, 2]) b.beam([C + 6.2 + dx, 0, -4.2], [C + 6.2 + dx, 2.6, -4.2], 0.08, "#2f3e4f"); // back posts only: the front ones crossed his face (13)
  table(6.0, -2.6, "#cfc6b0");
  for (const [x, z, c] of [[8.0, -3.9, "#3f6b4a"], [8.0, -2.9, "#5a6070"], [7.9, -0.9, "#3f6b4a"]] as [number, number, string][]) { b.box([C + x, 0.5, z], [0.7, 1.0, 0.75], c); b.box([C + x, 1.03, z], [0.76, 0.07, 0.8], "#2b2f3a"); }
  for (const dx of [-16, 16]) outdoor(b, "tree_round", [C + dx, 0, -3], 1, dx, () => puff(b, C + dx, -3, 1));
  for (const [dx, c] of [[-10, "#a7c4d9"], [0, "#e8dcc1"], [10, "#83ad69"]] as [number, string][]) b.box([C + dx, 4, 14], [8, 8, 6], c);
  // ---- park (x 300): lawn, path, a bench, trees, bushes, a low bush near the lens
  const K = 300;
  b.box([K, 0.03, 0], [70, 0.03, 50], "#7fbf5e"); b.box([K, 0.05, -2.2], [70, 0.02, 1.6], "#d8c9a2");
  outdoor(b, "bench", [K, 0.04, -0.9], 1, 0, () => b.box([K, 0.45, -0.9], [1.8, 0.1, 0.5], P.wood));
  for (const [x, z, k] of [[-4.5, -6, 1.3], [5, -7.5, 1.4], [-11, -3, 1.2], [12, -4, 1.3], [-18, -12, 1.5], [20, -14, 1.3], [3, -16, 1.4]] as number[][]) outdoor(b, "tree_round", [K + x, 0, z], k, x, () => puff(b, K + x, z, k));
  for (const [x, z] of [[-2.6, -3.6], [2.8, -3.8], [6.5, -1.5]] as number[][]) outdoor(b, "bush", [K + x, 0, z], 1, x, () => undefined);
  outdoor(b, "bush", [K + 2.6, 0, 4.2], 0.8, 2, () => undefined);
}

// ---------------- ep18 tornado set (2026-11-08): the mobile home x 0 (floor top y 0.65, long axis x, front +z), yard, wire fence z -25,
// crop strips, the landing field z -398 (1,307 ft), wire fence z -430, gravel road z -436, the Neighbor's porch x 44 z -444, storm clouds
// over z -90..-200 (RIG "clouds"), the funnel (RIG "funnel"), the doctor's room x 200. Walls, roof, doors, sash, couch, lamp, room and the
// dawn debris are RIG groups posed from eps/ep18/story.ts MOVER_AT (interiors noCast: the lamp pool keys them). ----------------
const F18 = 0.65;
type Hole18 = [number, number, number, number]; // wall-local centre x, width, bottom y, top y
/** a wall in its own x-y plane (z 0 = its middle): outer siding on +z, wallpaper on -z, openings cut out, trim round them inside */
function wall18(m: SetBuilder, len: number, h: number, holes: Hole18[], out: string, inn: string) {
  const xs = [-len / 2, len / 2, ...holes.flatMap(([c, w]) => [c - w / 2, c + w / 2])].sort((a, b) => a - b);
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[i], x1 = xs[i + 1], w = x1 - x0; if (w < 0.01) continue;
    const c = (x0 + x1) / 2, hole = holes.find(([hc, hw]) => Math.abs(hc - c) < hw / 2);
    for (const [y0, y1] of (hole ? [[0, hole[2]], [hole[3], h]] : [[0, h]]) as [number, number][]) if (y1 - y0 > 0.01) {
      m.box([c, (y0 + y1) / 2, 0.03], [w, y1 - y0, 0.05], out); m.box([c, (y0 + y1) / 2, -0.03], [w, y1 - y0, 0.05], inn, "wallpaper");
    }
  }
  for (const [c, w, y0, y1] of holes) {
    for (const s of [-1, 1]) m.box([c + s * (w / 2 + 0.03), (y0 + y1) / 2, -0.07], [0.07, y1 - y0 + 0.12, 0.06], "#f1ead8");
    m.box([c, y1 + 0.03, -0.07], [w + 0.12, 0.07, 0.06], "#f1ead8"); if (y0 > 0.05) m.box([c, y0 - 0.03, -0.08], [w + 0.2, 0.07, 0.12], "#f1ead8");
  }
}
/** the plant: brass foot, a fat avocado-green glass belly, brass neck, a big pleated orange shade. Origin = the foot. Two shades,
 *  "shadeOn" (self-lit, the room's light) and "shadeOff" (dawn, dented), one bulb "bulb"; story.ts picks */
function lamp18(m: SetBuilder) {
  m.cylinder([0, 0.025, 0], 0.13, 0.05, "#c9a24a");
  m.geo(sph(0.17, 1, 1.15, 1, 18), [0, 0.24, 0], "#7d8f3a");
  m.cylinder([0, 0.54, 0], 0.03, 0.34, "#c9a24a"); m.cylinder([0, 0.43, 0], 0.06, 0.05, "#c9a24a");
  const shade = new THREE.CylinderGeometry(0.19, 0.3, 0.36, 40, 1, true), p = shade.attributes.position;
  for (let v = 0; v < p.count; v++) { const k = 1 + ((v % 41) % 2 ? 0.035 : -0.035); p.setX(v, p.getX(v) * k); p.setZ(v, p.getZ(v) * k); } // pleats
  shade.computeVertexNormals();
  const tex = ctex("lampshade18", 512, 256, (g) => { const r = g.createLinearGradient(0, 0, 0, 256); r.addColorStop(0, "#f2a040"); r.addColorStop(1, "#ffd27a");
    g.fillStyle = r; g.fillRect(0, 0, 512, 256); g.fillStyle = "rgba(150,60,10,0.22)"; for (let x = 0; x < 512; x += 25.6) g.fillRect(x, 0, 9, 256);
    g.fillStyle = "#8a4a1e"; g.fillRect(0, 0, 512, 14); g.fillRect(0, 240, 512, 16); });
  const on = new THREE.Mesh(shade, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, color: new THREE.Color(1.15, 1.05, 0.95) }));
  on.name = "shadeOn"; on.position.set(0, 0.86, 0); m.group.add(on);
  const off = new THREE.Mesh(shade, material("#c8742e", "cloth")); off.name = "shadeOff"; off.position.set(0, 0.86, 0); off.visible = false; m.group.add(off);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 4.4, 2.2) }));
  bulb.name = "bulb"; bulb.position.set(0, 0.76, 0); bulb.layers.set(NOINK); m.group.add(bulb);
  m.geo(sph(0.035, 1, 1, 1, 10), [0, 1.08, 0], "#c9a24a");
}
function tornado(b: SetBuilder) {
  ground(b, 2400, "#6f8a4c");
  const R = (k: number) => hash(k * 1.37 + 18);
  // ---- the mobile home: skirt + floor deck stay (the dawn site is this floor, bare); everything above is RIG
  b.box([0, 0.29, 0], [13.9, 0.58, 3.9], "#7c7f86"); b.box([0, F18 - 0.025, 0], [14.2, 0.05, 4.2], "#a8987c");
  const H = 2.3, panel = (name: string, at: V3, ry: number, len: number, holes: Hole18[]) =>
    rigBuild(b, name, (m) => { wall18(m, len, H, holes, "#e3e5df", "#c9b48a"); m.paint = true; m.box([0, 2.15, 0.07], [len, 0.16, 0.01], "#2F6E73"); m.paint = false; }, true)
      .userData.base = { at, ry };
  panel("wF", [0, F18, 2.05], 0, 14, [[6.0, 0.9, 0, 2.0], [3.55, 1.3, 0.9, 1.75], [-2.5, 1.0, 0.9, 1.7], [-5.2, 1.0, 0.9, 1.7]]);
  panel("wB", [0, F18, -2.05], Math.PI, 14, [[-1.8, 0.9, 0, 2.0], [-3.85, 1.25, 0.88, 1.72], [2.5, 1.0, 0.9, 1.7]]); // turned: wall-local x = -world x
  panel("wE", [7.05, F18, 0], Math.PI / 2, 4.1, [[-0.4, 1.2, 0.9, 1.72]]);
  panel("wW", [-7.05, F18, 0], -Math.PI / 2, 4.1, []);
  panel("part", [1.0, F18, 0], -Math.PI / 2, 4.0, [[-0.8, 0.9, 0, 2.05]]);
  rigBuild(b, "roof", (m) => { m.box([0, 0.1, 0], [14.4, 0.16, 4.5], "#b9bdc2"); m.box([0, -0.03, 0], [14, 0.04, 4.05], "#e8dfc8"); }, true).userData.base = { at: [0, F18 + H, 0], ry: 0 };
  const leaf = (name: string, at: V3, ry: number) => rigBuild(b, name, (m) => { m.box([0.45, 1.0, 0], [0.88, 1.98, 0.05], "#8a5a3a"); m.box([0.45, 1.45, 0.03], [0.4, 0.5, 0.02], "#3a4a6a");
    m.geo(sph(0.035, 1, 1, 1, 8), [0.8, 1.0, 0.05], "#c9a24a"); }, true).userData.base = { at, ry };
  leaf("doorF", [5.56, F18, 2.05], 0); leaf("doorB", [2.25, F18, -2.05], Math.PI);
  rigBuild(b, "sash", (m) => { for (const s of [-1, 1]) m.box([s * 0.6, 0.38, 0], [0.06, 0.8, 0.05], "#f1ead8"); for (const y of [0, 0.38, 0.76]) m.box([0, y, 0], [1.26, 0.06, 0.05], "#f1ead8"); }, true)
    .userData.base = { at: [3.85, F18 + 0.9, -1.98], ry: 0 };
  rigBuild(b, "pane", (m) => { m.paint = true; m.box([0, 0, 0], [0.02, 0.8, 1.15], "#9fc0d8"); m.paint = false; }, true).userData.base = { at: [7.0, F18 + 1.31, 0.4], ry: 0 };
  // the room (couch, side table, rug, curtains, a picture, the jacket on the couch arm) and the lamp
  rigBuild(b, "room", (m) => {
    m.paint = true; m.box([4.0, F18 + 0.02, -0.25], [3.0, 0.02, 2.0], "#8a4a3a"); m.box([4.0, F18 + 0.05, -0.25], [2.6, 0.02, 1.6], "#b8784a"); m.paint = false; // rug
    m.box([5.45, F18 + 0.575, -1.6], [0.56, 0.05, 0.56], "#6a4a32"); m.box([5.45, F18 + 0.2, -1.6], [0.5, 0.03, 0.5], "#6a4a32"); // side table
    for (const [dx, dz] of [[-0.23, -0.23], [0.23, -0.23], [-0.23, 0.23], [0.23, 0.23]]) m.box([5.45 + dx, F18 + 0.28, -1.6 + dz], [0.05, 0.56, 0.05], "#4a3222");
    for (const s of [-1, 1]) m.box([6.96, F18 + 1.3, 0.4 + s * 0.78], [0.05, 1.3, 0.34], "#c94a4a", "cloth"); // curtains at the end window
    framed(m, 2.3, F18 + 1.4, -1.97, 0.7, 0.5, "#6f8fa8"); framed(m, 6.45, F18 + 1.45, -1.97, 0.45, 0.6, "#b98a5a");
    m.box([1.6, F18 + 0.35, 1.5], [0.6, 0.7, 0.45], "#5a4a3a"); m.box([1.6, F18 + 0.9, 1.5], [0.55, 0.4, 0.4], "#2b2f3a"); // the old TV on its cabinet
  }, true);
  rigBuild(b, "couch", (m) => { const C = "#8a8a4a";
    m.box([0, 0.21, 0], [2.0, 0.42, 0.85], C); m.box([0, 0.66, -0.33], [2.0, 0.5, 0.22], C);
    for (const s of [-1, 1]) { m.box([s * 1.0, 0.31, 0], [0.22, 0.62, 0.86], C); m.box([s * 0.47, 0.47, 0.05], [0.9, 0.12, 0.72], "#9a9a5a"); }
    m.box([-1.0, 0.66, 0.05], [0.3, 0.1, 0.55], "#c63939"); m.box([-1.13, 0.42, 0.22], [0.08, 0.42, 0.14], "#c63939"); // the red jacket over the arm
  }, true).userData.base = { at: [4.0, F18, -1.5], ry: 0 };
  rigBuild(b, "lamp", lamp18, true).userData.base = { at: [5.45, F18 + 0.61, -1.6], ry: 0 };
  // the dawn site: boards, shingles, a bent sheet, a board stuck in the soil, a bare stud frame stub, the couch on its back
  rigBuild(b, "debris", (m) => {
    for (let k = 0; k < 34; k++) { const a = R(k) * 6.28, r = 6 + 34 * R(k + 50), x = Math.cos(a) * r * 1.4, z = -Math.abs(Math.sin(a) * r) * 1.2 - 3;
      m.box([x, 0.05 + k * 0.012, z], [1.6 + 1.6 * R(k + 9), 0.05, 0.16], k % 3 ? "#b08a5a" : "#8a6a48", "plain", a * 3); }
    for (let k = 0; k < 26; k++) { const x = (R(k + 200) - 0.5) * 40, z = -2 - 30 * R(k + 300); m.box([x, 0.04 + k * 0.012, z], [0.5, 0.03, 0.32], "#4a4448", "plain", R(k + 400) * 6); }
    for (let k = 0; k < 6; k++) { const x = -6 + k * 2.4, z = -6 - 10 * R(k + 600); m.box([x, 0.09 + k * 0.012, z], [1.4, 0.04, 0.9], "#aab2b8", "plain", R(k + 700) * 3); }
    // torn sections of dark roofing felt: the near darks of the bright dawn site (18, 24)
    for (const [x, z, w, d, a] of [[-5, -4.2, 3.4, 2.2, 0.3], [8.5, -5, 3, 2.4, -0.5], [-2, -9, 4, 2.6, 0.9], [11, 1.5, 2.8, 2, 0.2], [-10, 3.5, 3.6, 2.6, -0.3], [4, -12, 4.2, 2.8, 0.1], [-4, 10.5, 4.4, 3, 0.2], [6.5, 8, 3.8, 2.6, -0.4], [12, 9, 3.6, 2.6, 0.5], [-12, 9, 3.6, 2.8, -0.2], [2, -4.6, 5, 3, 0.1], [-8, -8, 4.4, 3, 0.6]] as number[][]) m.box([x, 0.1, z], [w, 0.04, d], "#1f1c24", "plain", a);
    m.beam([-0.7, -0.3, 4.0], [-0.3, 1.0, 3.7], 0.16, "#b08a5a"); // the board stuck in the soil (19)
    const sx = 0.8, sz = 4.3; m.batch.add(quad(V(sx - 0.7, 0.02, sz + 0.4), V(sx + 0.1, 0.5, sz + 0.5), V(sx + 0.1, 0.5, sz - 0.4), V(sx - 0.7, 0.02, sz - 0.5)), material("#9aa4ac")); // the bent sheet (19)
    m.batch.add(quad(V(sx + 0.1, 0.5, sz + 0.5), V(sx + 0.9, 0.03, sz + 0.45), V(sx + 0.9, 0.03, sz - 0.45), V(sx + 0.1, 0.5, sz - 0.4)), material("#b4bcc2"));
    for (const x of [-6.9, 6.9]) m.box([x, F18 + 0.4, -2.0], [0.24, 0.8 - 0.1 * Math.abs(x) / 7, 0.14], "#b08a5a"); // stud stubs on the floor edge
    m.box([-12, 0.45, -9], [2.0, 0.42, 0.85], "#8a8a4a", "cloth", 0.7); m.box([9, 0.3, -12], [1.2, 0.6, 0.7], "#c63939", "plain", 2.1); // the couch, a chair
  }, true);
  // ---- yard: gravel pad, steps, a propane tank, the power pole, a van, trees; the wire fence z -25 and the crop strips beyond
  b.paint = true; b.box([2, 0.02, 7], [18, 0.02, 8], "#8f8778"); b.paint = false;
  b.box([6.0, 0.15, 2.5], [1.2, 0.3, 0.7], "#8a6a48"); b.box([6.0, 0.45, 2.3], [1.2, 0.3, 0.35], "#8a6a48");
  b.geo(new THREE.CapsuleGeometry(0.4, 1.0, 6, 12).rotateZ(Math.PI / 2), [-8.4, 0.45, 1.0], "#e8e8e2");
  b.beam([-11, 0, 7], [-11, 8, 7], 0.24, "#4a3a2e"); b.box([-11, 7.4, 7], [2.2, 0.16, 0.16], "#4a3a2e");
  outdoor(b, "car_van", [-4.5, 0, 9.5], 1, 0.3, () => b.box([-4.5, 0.9, 9.5], [4.4, 1.8, 2], "#5b6b7a"));
  for (const [x, z, k] of [[-20, -6, 1.6], [16, -10, 1.4], [24, 8, 1.5], [-28, 12, 1.3]] as number[][]) outdoor(b, "tree_round", [x, 0, z], k, x, () => puff(b, x, z, k));
  const fence = (z: number, x0: number, x1: number) => { for (let x = x0; x <= x1; x += 3) b.box([x, 0.65, z], [0.14, 1.3, 0.14], "#5a4632");
    b.paint = true; for (const y of [0.5, 0.85, 1.2]) b.box([(x0 + x1) / 2, y, z], [x1 - x0, 0.02, 0.02], "#2b2f3a"); b.paint = false; };
  fence(-25, -60, 60);
  // the back yard seen from above in 08: a shed, a wood stack, two drums (plain, unlined: thin lines boil)
  hut(b, -9, -14, 5, 4, 2.4, "#6a7a8a", "#3a3440");
  b.paint = true; for (let k = 0; k < 4; k++) b.box([8 + k * 0.5, 0.4 + k * 0.26, -16], [3.2 - k * 0.5, 0.26, 1.2], k % 2 ? "#8a6a48" : "#a8845a"); b.paint = false;
  b.cylinder([1, 0.5, -10], 0.35, 1, "#5a6b7a"); b.cylinder([2, 0.5, -10.5], 0.35, 1, "#7a4a3a");
  b.paint = true; for (let k = 0; k < 24; k++) b.box([0, 0.02, -36 - k * 14.5], [260, 0.02, 14.5], k % 2 ? "#7a6a3a" : "#5f7a3a"); b.paint = false; // crop strips
  // ---- the landing field: soft grass, one old leaning post; wire fence z -430, the gravel road z -436, the Neighbor's home x 44
  b.paint = true; b.box([10, 0.03, -404], [120, 0.02, 48], "#6f8f4a"); b.paint = false;
  b.beam([7.6, 0, -394.6], [7.7, 1.25, -394.5], 0.15, "#4a3a2e"); b.beam([12.3, 0, -400.3], [12.2, 1.25, -400.4], 0.15, "#4a3a2e"); b.beam([13.1, 0, -397.4], [13.0, 1.6, -397.5], 0.2, "#2a2230"); // near darks for 11 and 15
  fence(-430, -60, 120);
  b.paint = true; b.box([30, 0.03, -436], [400, 0.03, 4.2], "#9a948a"); b.box([30, 0.02, -433.4], [400, 0.02, 1.0], "#7f8a5a"); b.paint = false;
  home17(b, 44, -444, 8, "#c9b79a", "#5b4636", "#2f3e4f");
  b.paint = true; for (const s of [-1, 1]) b.box([44 + s * 1.45, 1.6, -443.0], [0.18, 2.4, 0.18], "#2f3e4f");
  b.box([44, 2.88, -443.4], [3.5, 0.16, 1.5], "#8a4b32"); b.box([44, 0.2, -443.4], [3.2, 0.4, 1.2], "#b8ad9a"); b.box([44, 0.1, -442.6], [1.6, 0.2, 0.4], "#a89e8b"); b.paint = false;
  for (const [x, c] of [[-70, "#8a4b32"], [120, "#6f7a8a"]] as [number, string][]) hut(b, x, -470, 10, 8, 5, c, "#3a3440");
  outdoor(b, "barn_shell", [-120, 0, -520], 1.4, 0.3, () => hut(b, -120, -520, 14, 10, 7, "#8a3a2e", "#3a3440"));
  // ---- the doctor's room (x 200): a tiled floor, a back wall with a window, a side wall, the bed, a cabinet
  noCast(b, (m) => {
    m.box([200, 0.05, -0.5], [6.4, 0.06, 5], "#8fa2a8", "tile");
    wall18Mount(m, [200, 0, -2.05], 0, 6.4, 4.4, [[1.2, 1.4, 1.0, 2.2]]);
    m.paint = true; m.box([201.2, 1.6, -2.13], [1.4, 1.2, 0.02], "#a9cde0"); m.paint = false;
    m.box([196.85, 2.2, -0.5], [0.1, 4.4, 5], "#a9c2c6");
    m.box([200.4, 0.25, -1.15], [2.05, 0.5, 0.98], "#e8eef0"); m.box([200.4, 0.575, -1.15], [1.98, 0.15, 0.92], "#f4f6f6", "cloth");
    m.box([200.4, 0.67, -1.35], [1.98, 0.05, 0.55], "#9ec6d6", "cloth"); m.box([199.6, 0.72, -1.4], [0.5, 0.12, 0.38], "#ffffff", "cloth");
    m.beam([199.4, 0.75, -0.66], [201.4, 0.75, -0.66], 0.04, "#9aa4ac"); for (const x of [199.4, 201.4]) m.beam([x, 0.5, -0.66], [x, 0.75, -0.66], 0.04, "#9aa4ac");
    m.box([198.0, 0.42, -1.65], [0.55, 0.84, 0.45], "#b8c4c8"); m.box([198.0, 0.86, -1.65], [0.6, 0.04, 0.5], "#8a9aa0");
  });
  // ---- the storm: cloud lumps over the flight (08 / 09) and the funnel; both RIG, shown per shot
  rigBuild(b, "clouds", (m) => { m.paint = true; // painted volumes, no ink: lumpy outlines boiled under the orbit
    const C: [number, number, number, number][] = [[-9, 60, -112, 6], [10, 56, -126, 5], [-3, 55, -128, 4.5], [14, 70, -150, 8], [-14, 66, -150, 7], [-8, 73, -178, 9],
      [11, 62, -182, 7], [2, 58, -196, 8], [-18, 58, -170, 6], [20, 66, -168, 6], [0, 80, -160, 10], [-4, 50, -160, 7], [6, 52, -150, 5], [-14, 70, -176, 8], [13, 72, -172, 8], [-11, 56, -158, 6], [12, 57, -160, 6], [-6, 76, -150, 7], [7, 76, -176, 7], ...Array.from({ length: 14 }, (_, i): [number, number, number, number] => { const a = i * 0.45; return [Math.cos(a) * (6 + 2.4 * i), 50 + 1.5 * (i % 3), -162 + Math.sin(a) * (6 + 2.4 * i), 11 + (i % 4)]; })]; // + a floor of lumps under you
    C.forEach(([x, y, z, r], i) => { for (let j = 0; j < 6; j++) { const a = j * 1.05 + i, q = r * (0.45 + 0.35 * R(i * 7 + j)), s = r * (0.5 + 0.3 * R(i * 11 + j));
      soft18(m, sph(s, 1.15, 0.72, 1, 16), [x + q * Math.cos(a), y + (j % 3) * 0.25 * s - 0.2 * s, z + q * Math.sin(a)], j % 2 ? "#b4aea8" : "#9c9894"); } });
    m.paint = false; }, true);
  // the night ground: one navy sheet over all fields (grass colours stay for dawn), shown per shot
  rigBuild(b, "dusk", (m) => { const d = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#0a1030", transparent: true, opacity: 0.5, depthWrite: false, fog: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    d.position.y = 0.12; d.layers.set(NOINK); m.group.add(d); }, true);
  rigBuild(b, "funnel", (m) => {
    const pts: THREE.Vector2[] = []; for (let y = 0; y <= 170; y += 5) pts.push(new THREE.Vector2(3.5 + 0.0016 * y * y + 1.3 * Math.sin(y * 0.21), y));
    m.geo(new THREE.LatheGeometry(pts, 28), [0, 0, 0], "#7d857e");
    for (let i = 0; i < 18; i++) { const y = 8 + i * 8.5, r = 3.5 + 0.0016 * y * y, a = i * 2.4; m.paint = true; soft18(m, sph(0.45 * r + 1.5, 1.2, 0.6, 1, 12), [Math.cos(a) * r * 0.85, y, Math.sin(a) * r * 0.85], i % 2 ? "#6b736e" : "#878f88"); m.paint = false; } // no ink: inked lumps read as holes
    m.paint = true; for (let i = 0; i < 10; i++) { const a = i * 0.63; soft18(m, sph(7 + 4 * R(i + 900), 1.3, 0.55, 1, 12), [Math.cos(a) * 9, 3 + 2 * R(i + 910), Math.sin(a) * 9], "#7a6e60"); } // the dust skirt
    for (let i = 0; i < 9; i++) { const a = i * 0.7; soft18(m, sph(42 + 10 * R(i + 950), 1.3, 0.35, 1, 14), [Math.cos(a) * 55, 172, Math.sin(a) * 55], "#4a5266"); } m.paint = false; // the wall cloud
    for (let i = 0; i < 14; i++) { const a = i * 0.9, r = 10 + 7 * R(i + 970), y = 4 + 26 * R(i + 980); m.box([Math.cos(a) * r, y, Math.sin(a) * r], [1.4, 0.12, 0.35], i % 2 ? "#4a3a2e" : "#6a5a48", "plain", a); }
  }, true);
}
/** a volume with no ink lines (SetBuilder.geo always inks) */
function soft18(m: SetBuilder, g: THREE.BufferGeometry, p: V3, col: string) { m.flat.add(g, material(col), new THREE.Matrix4().makeTranslation(...p)); g.dispose(); }
/** wall18 placed at `at` turned by ry (a static wall) */
function wall18Mount(m: SetBuilder, at: V3, ry: number, len: number, h: number, holes: Hole18[]) {
  const g = new THREE.Group(); g.position.set(...at); g.rotation.y = ry; m.group.add(g); const w = new SetBuilder(g); wall18(w, len, h, holes, "#a9c2c6", "#a9c2c6"); w.finish();
}

// ---------------- ep19 turkey set (2026-11-08): backyard x 0 (+ the Neighbor's yard behind the fence z -3.2, house z -8), the same yard
// after the fire x 50, your street x 140 (house z -4, road z 3..10, fire engine z 6.4), the Neighbor's porch + kitchen window x 240 ----------------
/** a flat disc slab (painted detail, no ink): stack overlapping discs >= 1.2 cm apart in y */
const disc19 = (b: SetBuilder, x: number, y: number, z: number, r: number, color: string, ry = 1) =>
  b.flat.add(new THREE.CylinderGeometry(r, r, 0.02, 24).scale(1, 1, ry), material(color), new THREE.Matrix4().makeTranslation(x, y, z));
/** a post-and-board fence along x at z: dark posts every ~2.2 m, white boards IN FRONT of the posts (never equal depth) with gaps to see through */
function fence19(b: SetBuilder, x0: number, x1: number, z: number, h = 1.1) {
  const n = Math.max(1, Math.round((x1 - x0) / 2.2));
  for (let i = 0; i <= n; i++) b.box([x0 + (i * (x1 - x0)) / n, h / 2, z], [0.14, h, 0.14], "#3d3026");
  b.paint = true; // boards + cap rail unlined: their thin edges boiled under the cranes (temporal_qa 2 / 16 / 30)
  for (const k of h > 1 ? [0.3, 0.62, 0.94] : [0.3, 0.64]) b.box([(x0 + x1) / 2, (k * h) / 1.1, z + 0.09], [x1 - x0, 0.17, 0.04], "#eee6d6");
  b.box([(x0 + x1) / 2, h, z], [x1 - x0, 0.05, 0.2], "#d9d0bd"); // cap rail, wider than the posts
  b.paint = false;
}
/** a gable house, front at z facing +z; ridge along x when `long`, else along z. No door or windows (the caller adds them). */
function house19(b: SetBuilder, x: number, z: number, w: number, d: number, h: number, wall: string, roof: string, rise = 2.2, long = false) {
  b.box([x, h / 2, z - d / 2], [w, h, d], wall);
  b.paint = true; // roof unlined (eave lines boil in the cranes)
  if (long) {
    b.batch.add(quad(V(x - w / 2 - 0.3, h - 0.15, z + 0.35), V(x + w / 2 + 0.3, h - 0.15, z + 0.35), V(x + w / 2 + 0.3, h + rise, z - d / 2), V(x - w / 2 - 0.3, h + rise, z - d / 2)), material(roof));
    b.batch.add(quad(V(x + w / 2 + 0.3, h - 0.15, z - d - 0.35), V(x - w / 2 - 0.3, h - 0.15, z - d - 0.35), V(x - w / 2 - 0.3, h + rise, z - d / 2), V(x + w / 2 + 0.3, h + rise, z - d / 2)), material(roof));
    b.batch.add(tri(V(x - w / 2 - 0.005, h, z - d), V(x - w / 2 - 0.005, h, z), V(x - w / 2 - 0.005, h + rise, z - d / 2)), material(wall));
    b.batch.add(tri(V(x + w / 2 + 0.005, h, z), V(x + w / 2 + 0.005, h, z - d), V(x + w / 2 + 0.005, h + rise, z - d / 2)), material(wall));
  } else {
    b.geo(tri(V(-w / 2 - 0.3, 0, 0), V(w / 2 + 0.3, 0, 0), V(0, rise, 0)), [x, h, z + 0.02], roof);
    for (const s of [-1, 1]) b.batch.add(quad(V(x, h + rise, z - d - 0.3), V(x + s * (w / 2 + 0.3), h - 0.1, z - d - 0.3), V(x + s * (w / 2 + 0.3), h - 0.1, z + 0.3), V(x, h + rise, z + 0.3)), material(roof));
  }
  b.paint = false;
}
/** window on a wall face at z: frame + pane, painted (unlined), the pane 3 cm proud of the frame */
const win19 = (b: SetBuilder, x: number, y: number, z: number, w = 1.3, h = 1.25) => {
  b.paint = true; b.box([x, y, z + 0.035], [w, h, 0.06], "#f4f1ea"); b.box([x, y, z + 0.095], [w - 0.2, h - 0.2, 0.03], "#4d677a"); b.paint = false;
};
/** the yard (ox = x origin): patio, burner stand, pot, tank, picnic table, fence z -3.2, the Neighbor's house + washing line behind it.
 *  after = the pot lies on its side, soot on the slab, singed lawn */
function yard19(b: SetBuilder, ox: number, after: boolean) {
  b.paint = true; b.box([ox, 0.02, 1.9], [9, 0.04, 6.4], after ? "#8f96a6" : "#bcae96"); b.paint = false;
  if (after) {
    disc19(b, ox, 0.062, 1.0, 1.5, "#3a2f2b", 0.9); disc19(b, ox + 0.5, 0.074, 2.6, 1.1, "#32282a"); disc19(b, ox - 1.4, 0.086, 0.4, 0.9, "#3a2f2b");
    disc19(b, ox + 0.4, 0.1, 5.2, 1.7, "#4a4a2a"); disc19(b, ox - 2.2, 0.112, 4.6, 1.1, "#5a5a2c"); disc19(b, ox + 3.1, 0.124, 5.8, 0.9, "#4a4a2a"); // singed lawn (clear of the patio top, y 0.04)
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.beam([ox + sx * 0.2, 0.04, 1.0 + sz * 0.2], [ox + sx * 0.2, 0.33, 1.0 + sz * 0.2], 0.05, "#262a33");
  b.box([ox, 0.335, 1.0], [0.52, 0.03, 0.52], "#323744");
  b.cylinder([ox, 0.12, 1.0], 0.15, 0.04, "#1f222a");
  b.cylinder([ox + 0.85, 0.24, 0.35], 0.17, 0.46, "#e6e2d6"); b.beam([ox + 0.85, 0.3, 0.35], [ox + 0.22, 0.16, 0.9], 0.03, "#262a33"); // gas tank + hose
  if (!after) {
    b.geo(new THREE.CylinderGeometry(0.31, 0.31, 0.54, 28), [ox, 0.63, 1.0], "#b4bac3");
    b.geo(new THREE.TorusGeometry(0.315, 0.022, 8, 28).rotateX(Math.PI / 2), [ox, 0.905, 1.0], "#dde1e6");
    for (const s of [-1, 1]) b.box([ox + s * 0.36, 0.82, 1.0], [0.1, 0.035, 0.05], "#262a33");
  } else { // on its side, open end toward +x, a little oil still in the mouth
    b.geo(new THREE.CylinderGeometry(0.31, 0.31, 0.54, 28).rotateZ(Math.PI / 2), [ox + 1.5, 0.315, 2.5], "#8d9199");
    b.geo(new THREE.TorusGeometry(0.315, 0.022, 8, 28).rotateY(Math.PI / 2), [ox + 1.77, 0.315, 2.5], "#dde1e6");
    b.flat.add(new THREE.CylinderGeometry(0.27, 0.27, 0.01, 24).rotateZ(Math.PI / 2), material("#2a2018"), new THREE.Matrix4().makeTranslation(ox + 1.775, 0.315, 2.5));
  }
  // picnic table, left
  b.box([ox - 4.3, 0.76, 0.2], [1.9, 0.06, 0.85], "#b59063");
  for (const s of [-1, 1]) b.box([ox - 4.3, 0.46, 0.2 + s * 0.78], [1.9, 0.05, 0.3], "#a37f55");
  for (const s of [-1, 1]) b.box([ox - 4.3 + s * 0.8, 0.38, 0.2], [0.07, 0.74, 1.5], "#8c6a44");
  fence19(b, ox - 11, ox + 11, -3.2);
  for (const x of [-9.5, 9.8]) outdoor(b, "tree_round", [ox + x, 0, -1.8], 0.9, x, () => puff(b, ox + x, -1.8, 0.9));
  for (const x of [-7, -2.5, 6, 8.2]) b.geo(sph(0.55, 1.3, 0.8, 0.9, 10), [ox + x, 0.4, -2.55], "#4a7a42"); // shrubs along the fence
  // the Neighbor's side: house wall z -8 (centre x +3), a back door at x 3.5, windows, a washing line
  const hx = ox + 3;
  house19(b, hx, -8, 10, 7, 5.0, "#a7c4d9", "#5b4636", 2.2);
  for (const dx of [-3.4, 0.4]) win19(b, hx + dx, 1.8, -8); for (const dx of [-3.4, 0, 3.4]) win19(b, hx + dx, 3.9, -8);
  b.paint = true; b.box([ox + 3.5, 1.1, -7.965], [1.3, 2.3, 0.06], "#f4f1ea"); b.box([ox + 3.5, 1.05, -7.92], [1.05, 2.1, 0.03], "#c63939"); b.paint = false;
  b.box([ox + 3.5, 0.06, -7.1], [1.8, 0.12, 1.4], "#bcae96");
  b.beam([ox - 1.6, 0, -5.6], [ox - 1.6, 1.95, -5.6], 0.07, "#4a3a2c"); b.beam([ox + 6.8, 0, -5.6], [ox + 6.8, 1.95, -5.6], 0.07, "#4a3a2c");
  b.paint = true; b.box([ox + 2.6, 1.9, -5.6], [8.4, 0.012, 0.012], "#d8d4c8");
  for (const [dx, c, w] of [[0.0, "#d8504a", 0.55], [1.1, "#f4f1ea", 0.7], [2.2, "#3b5b9a", 0.55], [3.1, "#f2c230", 0.5]] as [number, string, number][]) b.box([ox + 1.2 + dx, 1.58, -5.6], [w, 0.6, 0.012], c);
  b.paint = false;
  for (const x of [-9, 11]) outdoor(b, "tree_round", [ox + x, 0, -11], 1.1, x, () => puff(b, ox + x, -11, 1.1));
}
/** the fire engine: along x, nose +x, side facing -z (the pavement). A blank white band: no department name. */
function engine19(b: SetBuilder, x: number, z: number) {
  const red = "#bf2a2c";
  b.box([x - 0.9, 1.5, z], [6.0, 2.0, 2.5], red);
  b.box([x + 3.0, 1.55, z], [2.0, 2.2, 2.5], red);
  b.paint = true; b.box([x + 3.0, 2.25, z], [2.03, 0.6, 2.53], "#2d4456"); b.paint = false; // cab glass band
  b.box([x + 3.0, 0.55, z], [2.1, 0.5, 2.6], "#d8dce2"); // bumper block
  b.box([x - 1.0, 2.58, z], [6.2, 0.14, 2.6], "#a82326"); // roof cap
  b.paint = true;
  b.box([x - 0.9, 1.7, z - 1.28], [6.0, 0.34, 0.03], "#f4f1ea");
  for (const dx of [-2.9, -1.4, 0.1]) b.box([x + dx, 1.0, z - 1.28], [1.3, 1.15, 0.03], "#8b1e20");
  for (const dx of [-2.9, -1.4, 0.1]) b.box([x + dx, 1.0, z - 1.31], [0.9, 0.04, 0.02], "#c9ccd4");
  b.box([x + 3.0, 1.35, z - 1.28], [1.2, 0.8, 0.03], "#8b1e20");
  b.paint = false;
  for (const [dx, dz] of [[3.0, -1.1], [3.0, 1.1], [-2.0, -1.1], [-2.0, 1.1]] as number[][]) { b.geo(new THREE.CylinderGeometry(0.58, 0.58, 0.34, 18).rotateX(Math.PI / 2), [x + dx, 0.58, z + dz], "#1c1c22"); b.geo(new THREE.CylinderGeometry(0.28, 0.28, 0.36, 12).rotateX(Math.PI / 2), [x + dx, 0.58, z + dz], "#c9ccd4"); }
  b.beam([x - 3.6, 2.9, z - 0.8], [x + 1.6, 2.9, z - 0.8], 0.07, "#c9ccd4"); b.beam([x - 3.6, 2.9, z + 0.8], [x + 1.6, 2.9, z + 0.8], 0.07, "#c9ccd4");
  b.paint = true; for (let i = 0; i < 9; i++) b.box([x - 3.4 + i * 0.58, 2.9, z], [0.04, 0.04, 1.6], "#c9ccd4"); b.paint = false;
  b.box([x + 2.8, 2.82, z - 0.55], [0.4, 0.2, 0.4], "#d9302f"); b.box([x + 2.8, 2.82, z + 0.55], [0.4, 0.2, 0.4], "#2f6fd6"); // light bar (the flashers are fx)
}
function turkey(b: SetBuilder) {
  ground(b, 2400, "#86b864");
  yard19(b, 0, false);
  yard19(b, 50, true);
  // ---- your street (x 140): pavement z -0.2..2.8, kerb, road z 3..10, houses across z 12.5+, your ranch house (front z -4) + garage, the Neighbor's house x +17
  const S = 140;
  b.paint = true;
  b.box([S, 0.02, 6.5], [90, 0.02, 7], "#454a66"); b.box([S, 0.04, 1.3], [90, 0.04, 3], "#c9b79a"); b.box([S, 0.08, 2.85], [90, 0.16, 0.2], "#a69a85"); b.box([S, 0.03, 10.6], [90, 0.04, 1.6], "#c9b79a");
  b.paint = false;
  house19(b, S + 1, -4, 9, 8, 3.3, "#d9c7a3", "#7a4b36", 1.7, true);
  win19(b, S - 1.4, 1.7, -4, 1.6, 1.2); win19(b, S + 4.2, 1.7, -4, 1.6, 1.2);
  b.paint = true; b.box([S + 1.6, 1.05, -3.965], [1.2, 2.2, 0.06], "#f4f1ea"); b.box([S + 1.6, 1.0, -3.92], [0.98, 2.04, 0.03], "#2F6E73"); b.paint = false;
  b.box([S + 1.6, 0.2, -3.2], [2.4, 0.4, 1.4], "#b8ad9a"); // porch slab
  for (const s of [-1, 1]) b.box([S + 1.6 + s * 1.1, 1.45, -2.6], [0.12, 2.5, 0.12], "#2f3e4f");
  b.box([S + 1.6, 2.72, -3.2], [2.6, 0.14, 1.6], "#7a4b36"); // porch roof
  b.box([S - 6.35, 1.5, -6.7], [5.7, 3.0, 7.0], "#d9c7a3"); // garage, front face z -3.2
  b.box([S - 6.35, 3.1, -6.7], [6.0, 0.2, 7.4], "#7a4b36");
  b.paint = true; b.box([S - 6.35, 1.2, -3.17], [4.4, 2.4, 0.04], "#ece8de");
  for (const y of [0.45, 0.85, 1.25, 1.65, 2.05]) b.box([S - 6.35, y, -3.14], [4.4, 0.03, 0.02], "#b9b5aa");
  b.paint = false;
  b.box([S - 6.35, 2.78, -3.1], [0.9, 0.16, 0.14], "#2b2f3a"); // garage lamp
  fence19(b, S - 13, S - 4.4, -0.5, 0.9); fence19(b, S + 4, S + 12, -0.5, 0.9);
  disc19(b, S - 2.5, 0.03, -1.8, 1.3, "#3d3a22"); disc19(b, S - 6.4, 0.042, -1.9, 1.0, "#4a4a2a"); disc19(b, S + 1.6, 0.054, -1.6, 0.9, "#3d3a22"); // the scorched front lawn
  const NB = S - 18.5; // the Neighbor's house, left of your garage; its front-right window (S-16.1, y 1.6) is the peek window of shot 16
  house19(b, NB, -4.5, 8, 7, 5.4, "#a7c4d9", "#5b4636", 2.2);
  for (const dx of [-2.4, 2.4]) for (const y of [1.6, 4.0]) win19(b, NB + dx, y, -4.5);
  b.paint = true; b.box([NB, 1.1, -4.465], [1.3, 2.3, 0.06], "#f4f1ea"); b.box([NB, 1.05, -4.42], [1.05, 2.1, 0.03], "#c63939"); b.paint = false;
  house19(b, S + 17, -4.5, 8, 7, 5.0, "#c96b55", "#5b4636", 2.2); house19(b, S + 29, -4.5, 8, 7, 5.0, "#e8dcc1", "#8a4b32", 2.2);
  for (const [x, c] of [[-34, "#d58a4b"], [10, "#b9748f"], [22, "#d9c7a3"], [34, "#6f9f9a"]] as [number, string][]) { // none across from x -28..4: the camera of 16 stands there
    b.box([S + x, 3.5, 16], [9, 7, 7], c); b.box([S + x, 7.1, 16], [9.4, 0.3, 7.4], "#5b4636");
    b.paint = true; for (const dx of [-2.6, 2.6]) for (const y of [1.8, 4.8]) b.box([S + x + dx, y, 12.47], [1.5, 1.4, 0.06], "#4d677a"); b.box([S + x, 1.1, 12.47], [1.2, 2.2, 0.06], "#2f3e4f"); b.paint = false;
  }
  for (const x of [-9, 9, 24]) outdoor(b, "street_lamp", [S + x, 0, 2.4], 1, 0, () => b.beam([S + x, 0, 2.4], [S + x, 4.2, 2.4], 0.14, "#2f3e4f"));
  outdoor(b, "hydrant", [S - 3.4, 0.04, 2.3], 1, 0, () => b.cylinder([S - 3.4, 0.4, 2.3], 0.2, 0.8, "#b8302b"));
  outdoor(b, "mailbox", [S + 6.2, 0.04, -0.1], 1, 0, () => b.box([S + 6.2, 0.9, -0.1], [0.4, 0.5, 0.5], "#3f6c8c"));
  b.geo(new THREE.ConeGeometry(0.2, 0.62, 12), [S - 1.4, 0.35, 2.2], "#e8702a"); b.box([S - 1.4, 0.03, 2.2], [0.46, 0.05, 0.46], "#2b2f3a"); // fire cone
  for (const [x, z, k] of [[-11, -1.5, 1.0], [8.5, -1.2, 1.1], [13, -1.6, 1.2], [-3.8, -1.1, 0.8]] as number[][]) b.geo(sph(0.7 * k, 1.5, 0.9, 1, 10), [S + x, 0.5 * k, z], "#3f6b3a"); // hedges
  for (const x of [-5, 20]) outdoor(b, "tree_round", [S + x, 0, -1.2], 0.85, x, () => puff(b, S + x, -1.2, 0.85));
  for (const x of [-15.5, -10.5, -6]) b.geo(sph(0.7, 1.5, 0.9, 1, 10), [S + x, 0.4, 11.6], "#3a6236"); // hedges on the far pavement: the near dark of 16
  engine19(b, S + 0.5, 6.4);
  // ---- the Neighbor's porch + kitchen (x 240): back wall z -6 facing +z, covered porch z -6..-1, a long table z -3, a window (x 6.4..8.6, y 1..2.3) into the kitchen
  const P = 240;
  b.paint = true; b.box([P, 0.02, -2.0], [24, 0.04, 8], "#a89a84"); b.paint = false;
  b.box([P - 4.5, 2.7, -6.2], [21.8, 5.4, 0.4], "#d9b88a"); b.box([P + 12.8, 2.7, -6.2], [8.4, 5.4, 0.4], "#d9b88a");
  b.box([P + 7.5, 0.5, -6.2], [2.2, 1.0, 0.4], "#d9b88a"); b.box([P + 7.5, 3.85, -6.2], [2.2, 3.1, 0.4], "#d9b88a");
  b.box([P + 7.5, 5.55, -7.4], [34, 0.3, 3.4], "#6a4a36"); // roof line
  b.box([P + 7.5, 0.99, -5.9], [2.5, 0.07, 0.5], "#f4f1ea"); // sill
  for (const s of [-1, 1]) b.box([P + 7.5 + s * 1.2, 1.7, -5.96], [0.12, 1.5, 0.12], "#f4f1ea"); b.box([P + 7.5, 2.4, -5.96], [2.5, 0.12, 0.12], "#f4f1ea"); // frame (outside)
  b.paint = true; for (const x of [-3, 12.6]) b.box([P + x, 2.3, -5.965], [1.6, 1.4, 0.04], "#fff0c9"); b.paint = false; // two lit windows (glass)
  b.box([P, 2.85, -3.5], [26, 0.14, 5.4], "#6a4a36"); // porch roof
  for (const x of [-9, -4.5, 0, 4.5, 9]) b.beam([P + x, 0, -1.0], [P + x, 2.8, -1.0], 0.14, "#4a3426");
  b.box([P - 1.5, 0.76, -3.0], [6.4, 0.06, 1.0], "#b59063"); for (const s of [-2.8, 2.8]) b.box([P - 1.5 + s, 0.38, -3.0], [0.1, 0.72, 0.85], "#8c6a44");
  for (const z of [-3.95, -2.05]) { b.box([P - 1.5, 0.46, z], [6.4, 0.05, 0.3], "#a37f55"); for (const s of [-2.9, 2.9]) b.box([P - 1.5 + s, 0.23, z], [0.07, 0.46, 0.26], "#8c6a44"); }
  b.paint = true; b.box([P - 1.5, 0.795, -3.0], [6.4, 0.025, 1.0], "#e8e2d4"); b.paint = false; // cloth, 1.3 cm above the top
  noCast(b, (m) => { // kitchen interior, lit by the set's pool only
    m.box([P + 7.5, 0.04, -8.75], [6.2, 0.08, 4.7], "#c9a97a"); m.box([P + 7.5, 3.1, -8.75], [6.2, 0.12, 4.7], "#efe3c8");
    m.box([P + 7.5, 1.6, -11.2], [6.2, 3.2, 0.2], "#eadcb5"); m.box([P + 4.4, 1.6, -8.75], [0.2, 3.2, 4.9], "#e5d3a8"); m.box([P + 10.6, 1.6, -8.75], [0.2, 3.2, 4.9], "#e5d3a8");
    m.box([P + 5.6, 0.46, -10.6], [1.0, 0.9, 0.7], "#d8dce2"); m.box([P + 5.6, 0.93, -10.6], [1.04, 0.05, 0.74], "#2b2f3a"); m.box([P + 5.6, 0.5, -10.2], [0.8, 0.5, 0.03], "#2b2f3a"); // plain oven + its dark window
    m.box([P + 5.6, 0.58, -10.0], [0.9, 0.04, 0.5], "#c9ccd4"); // the oven door, lowered
    m.box([P + 9.7, 0.95, -10.7], [0.9, 1.9, 0.75], "#e6e8ec"); m.box([P + 9.15, 0.95, -10.0], [0.05, 1.8, 0.7], "#d8dce2", "plain", 0.5); // fridge + its door ajar
    m.box([P + 7.5, 0.45, -10.9], [2.2, 0.9, 0.5], "#7a5a3a"); m.box([P + 7.5, 0.92, -10.9], [2.3, 0.05, 0.54], "#d9d0bd"); // counter
    m.box([P + 7.5, 2.9, -8.5], [0.5, 0.12, 0.5], "#2b2f3a");
  });
  for (const [z, y0] of [[-1.2, 2.64], [-1.55, 2.56]] as number[][]) for (let i = 0; i <= 18; i++) bulb(b, [P - 9 + i, y0 - 0.42 * Math.sin((i / 18) * Math.PI), z], 0.06, [1.0, 0.82, 0.45]); // string lights
  b.paint = true; b.box([P, 2.76, -1.2], [18, 0.012, 0.012], "#2b2f3a"); b.paint = false;
  for (const x of [-14, 16]) outdoor(b, "tree_round", [P + x, 0, 2], 1.2, x, () => puff(b, P + x, 2, 1.2));
  for (const [x, z, k] of [[-11, 0, 1.0], [14, 0.6, 1.1]] as number[][]) b.geo(sph(0.7 * k, 1.5, 0.9, 1, 10), [P + x, 0.5 * k, z], "#3f6b3a");
}

// ---------------- ep20 alaska set (2026-11-08): Sitka shore x 0 (snow z < 4, harbour water z > 4, dock z 3.5..14, fort palisade z -10,
// flagpole x 3 z -6, Canada ridge x 30 z -14), gold creek x 60 (creek along x at z 0, claim fence z 2.4), oil tundra x 120 (derrick x -6 z -9,
// pipeline along x at z -3, barrels x 3 z -1), map clearing x 180 (map board z -4, border post x 5, hut x 9), the border at night x 240.
// Flags, signs, the map and every lettered board are fx cards from eps/ep20/cast.ts (sharp text, animated). ----------------
let ar = 20; const arnd = () => ((ar = (ar * 16807) % 2147483647) / 2147483647);
const pine20 = (b: SetBuilder, x: number, z: number, s: number) =>
  outdoor(b, "tree_pine", [x, 0, z], s, x * 0.7 + z, () => { b.box([x, s, z], [0.4 * s, 2 * s, 0.4 * s], P.roof); b.geo(new THREE.ConeGeometry(1.6 * s, 4.5 * s, 8), [x, 3.6 * s, z], "#2f5a46"); });
const drift20 = (b: SetBuilder, x: number, z: number, r: number, h = 0.35) => b.geo(sph(r, 1.6, h, 1, 10), [x, 0, z], "#f2f5fa");
/** a split-rail fence along x at z: dark posts, two rails */
function rail20(b: SetBuilder, x0: number, x1: number, z: number, h = 1.05) {
  const n = Math.max(1, Math.round((x1 - x0) / 2.4));
  for (let i = 0; i <= n; i++) b.box([x0 + (i * (x1 - x0)) / n, h / 2, z], [0.14, h, 0.14], "#4a3426");
  for (const y of [0.45, 0.9]) b.box([(x0 + x1) / 2, y * h, z + 0.1], [x1 - x0, 0.1, 0.07], "#7a5a3e");
}
function border20(b: SetBuilder, ox: number, night: boolean) {
  b.paint = true; b.box([ox, 0.02, 0.5], [60, 0.02, 3.2], "#cfd6df"); b.paint = false; // the cleared track through the snow
  outdoor(b, "barrier_post", [ox + 5, 0, -1.0], 1, 0, () => b.box([ox + 5, 0.6, -1.0], [0.3, 1.2, 0.3], "#c63939"));
  outdoor(b, "border_hut", [ox + 9, 0, -3.5], 1, -0.3, () => b.box([ox + 9, 1.3, -3.5], [2.4, 2.6, 2.4], "#7a5a3e"));
  if (night) { // the watch tower: four legs, a platform, a cabin
    const tx = ox - 7, tz = -6;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.beam([tx + sx * 1.3, 0, tz + sz * 1.3], [tx + sx * 0.9, 6, tz + sz * 0.9], 0.16, "#3d3026");
    b.box([tx, 6.05, tz], [2.6, 0.14, 2.6], "#4a3426"); b.box([tx, 7.0, tz], [2.2, 1.8, 2.2], "#5a4030"); b.box([tx, 8.0, tz], [2.8, 0.18, 2.8], "#3d3026");
    b.box([tx + 0.6, 6.6, tz + 1.4], [0.5, 0.4, 0.5], "#2b2f3a"); // the searchlight housing (its beam is fx)
    b.beam([ox - 3, 0, 1.6], [ox - 3, 4.2, 1.6], 0.1, "#c9ccd4"); // the CANADA pennant pole
  }
  for (const [x, z, s] of [[-14, -9, 0.8], [-18, -5, 0.9], [15, -8, 0.85], [19, -12, 1], [-11, -14, 1.1], [24, -4, 0.75]] as V3[]) pine20(b, ox + x, z, s);
  for (const [x, z, r] of [[-5, 3.4, 1.2], [3, 4.2, 1.0], [12, 2.6, 1.4], [-12, 2.8, 1.1]] as V3[]) drift20(b, ox + x, z, r);
}
function alaska(b: SetBuilder) {
  ground(b, 2400, "#e6ecf3");
  // ---- A: Sitka shore (x 0)
  b.paint = true; b.box([0, 0.012, 104], [140, 0.02, 200], "#3f6f8f"); b.box([0, 0.025, 4.3], [140, 0.02, 0.7], "#8fb2c8"); b.paint = false; // harbour + the wet edge
  b.box([0, 0.12, 9], [2.4, 0.12, 11], "#7a5a3e", "wood"); // the dock (top y 0.18)
  for (const z of [4.5, 8, 11.5, 14.2]) for (const s of [-1, 1]) b.cylinder([s * 1.15, 0.2, z], 0.12, 0.5, "#4a3426");
  for (const s of [-1, 1]) b.cylinder([s * 0.9, 0.38, 4.0], 0.14, 0.4, "#2b2f3a"); // bollards
  for (const [x, z, k] of [[-2.0, 2.8, 1], [-2.9, 1.9, 0.8], [2.4, 3.3, 0.9]] as V3[]) outdoor(b, "crate", [x, 0, z], k, x, () => b.box([x, 0.4 * k, z], [0.8 * k, 0.8 * k, 0.8 * k], "#9a7448"));
  for (const x of [-2.2, -1.75]) b.cylinder([x, 0.42, 3.6], 0.26, 0.84, "#6a4a36"); // barrels by the crates
  // the news stand (x 3.2 z 0.2): a box with a canopy, the headline boards are fx
  b.box([3.4, 0.7, -0.2], [1.3, 1.4, 0.7], "#2f5a46"); b.box([3.4, 1.95, -0.2], [1.6, 0.12, 1.0], "#c63939"); for (const s of [-1, 1]) b.beam([3.4 + s * 0.72, 1.4, -0.5], [3.4 + s * 0.72, 1.95, -0.5], 0.06, "#2b2f3a");
  // the ice crate (x -1.6 z 0.4): an open crate full of pale blocks
  b.box([-1.7, 0.3, 0.2], [1.1, 0.6, 0.8], "#9a7448", "wood");
  for (const [dx, dz, h] of [[-0.25, -0.15, 0.3], [0.25, -0.1, 0.36], [0, 0.2, 0.26], [-0.3, 0.22, 0.22]] as V3[]) b.box([-1.7 + dx, 0.6 + h / 2, 0.2 + dz], [0.42, h, 0.36], "#cfe6f5");
  // the fort: a log palisade z -10 with a gate gap x -7..-4, a blockhouse behind, the old cannon by the gate
  b.paint = true; for (let x = -16; x <= 14; x += 0.42) { if (x > -7 && x < -4) continue; b.box([x, 1.5 + 0.12 * Math.sin(x * 3.1), -10], [0.4, 3 + 0.24 * Math.sin(x * 3.1), 0.4], Math.round(x / 0.42) % 2 ? "#6e4e36" : "#5a3f2b"); }
  b.paint = false; // logs unlined: their seams strobed in the pull-backs (flicker_qa shot 6)
  b.box([-7.2, 3.4, -10], [0.6, 0.5, 0.6], "#4a3426"); b.box([-3.8, 3.4, -10], [0.6, 0.5, 0.6], "#4a3426");
  outdoor(b, "house_b", [-2, 0, -15], 1.0, 0, () => b.box([-2, 2, -15], [6, 4, 6], "#8a6a44"));
  b.geo(new THREE.CylinderGeometry(0.16, 0.2, 1.6, 14).rotateZ(Math.PI / 2 - 0.22), [-3.4, 0.75, -8.9], "#2b2f3a"); // cannon barrel, nose to +x
  for (const s of [-1, 1]) b.geo(new THREE.CylinderGeometry(0.38, 0.38, 0.1, 16).rotateX(Math.PI / 2), [-3.7, 0.38, -8.9 + s * 0.3], "#5a4030");
  b.box([-4.05, 0.45, -8.9], [0.7, 0.18, 0.5], "#5a4030");
  b.cylinder([3, 4.5, -6], 0.08, 9, "#e8e4da"); b.geo(new THREE.SphereGeometry(0.16, 10, 6), [3, 9.05, -6], "#e8c45a"); // the flagpole (the flag is fx)
  for (const [x, z, s] of [[-5.2, 0.6, 0.62], [6.5, -2.4, 0.7], [-10, -4, 0.85], [11, -7, 0.9], [-14, 1, 0.75], [15, -1, 0.8], [-20, -6, 1], [20, -14, 1], [-24, -16, 1.1], [8, -18, 1], [4.6, -8.6, 0.9]] as V3[]) pine20(b, x, z, s); // the last one: near dark behind the flagpole (12)
  for (let k = 0; k < 26; k++) { const x = (arnd() - 0.5) * 140, z = -22 - arnd() * 70; outdoor(b, "pine_cluster", [x, 0, z], 0.9 + arnd() * 0.5, k, () => pine20(b, x, z, 1)); }
  for (const [x, z, r] of [[-6, 2.6, 1.0], [5.6, 2.2, 0.9], [-9, -1, 1.4], [9.5, 0.5, 1.2]] as V3[]) drift20(b, x, z, r);
  outdoor(b, "rock_cluster", [-4.2, 0, 4.1], 0.7, 1, () => undefined); outdoor(b, "rock_cluster", [5.8, 0, 4.4], 0.8, 2, () => undefined); // shore rocks
  // the Canada ridge (shot 10): a snow mound east, top y ~3, a rail fence in front of the camera
  b.geo(sph(10, 1.8, 0.3, 0.9, 16), [30, 0, -14], "#eef2f7");
  rail20(b, 4.6, 9.2, 1.6);
  // ---- B: the gold creek (x 60): water along x at z 0, snow banks, rocks, the claim fence z 2.4
  const B = 60;
  b.paint = true; b.box([B, 0.03, 0], [80, 0.02, 1.5], "#4f86a8"); for (const s of [-1, 1]) b.box([B, 0.02, s * 0.9], [80, 0.02, 0.35], "#b7c9d6"); b.paint = false;
  for (let i = 0; i < 14; i++) drift20(b, B - 26 + i * 4 + arnd(), -1.9 - arnd() * 0.6, 0.9 + arnd() * 0.6, 0.3);
  for (const x of [-6.5, 7.5, -13]) outdoor(b, "rock_cluster", [B + x, 0, -1.4], 0.55, x, () => undefined);
  rail20(b, B - 6, B + 6, 2.4);
  for (const [x, z, s] of [[-4, -6, 0.75], [3, -8, 0.85], [9, -5.5, 0.7], [-10, -9, 0.9], [14, -10, 1], [-17, -6, 0.8], [-3.6, 4.6, 0.6]] as V3[]) pine20(b, B + x, z, s);
  b.beam([B - 2.6, 0, 1.4], [B - 2.6, 1.8, 1.4], 0.1, "#4a3426"); // the "1898" sign pole (board is fx)
  // ---- C: the oil tundra (x 120): the derrick, the pipeline on stilts, the barrel pyramid
  const C = 120, dx = C - 6, dz = -9;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.beam([dx + sx * 1.8, 0, dz + sz * 1.8], [dx + sx * 0.35, 10, dz + sz * 0.35], 0.18, "#2b2f3a");
  for (const y of [2.5, 5, 7.5]) { const w = 1.8 - (1.45 * y) / 10; for (const s of [-1, 1]) { b.beam([dx - w, y, dz + s * w], [dx + w, y, dz + s * w], 0.1, "#2b2f3a"); b.beam([dx + s * w, y, dz - w], [dx + s * w, y, dz + w], 0.1, "#2b2f3a"); } }
  b.box([dx, 10.1, dz], [1.0, 0.3, 1.0], "#2b2f3a");
  b.geo(new THREE.CylinderGeometry(0.42, 0.42, 50, 18).rotateZ(Math.PI / 2), [C, 1.7, -3.2], "#b9bfc9"); // the pipeline (x +-25: clear of the creek and the map)
  for (let x = -24; x <= 24; x += 4) { for (const s of [-1, 1]) b.beam([C + x, 0, -3.2 + s * 0.45], [C + x, 1.3, -3.2 + s * 0.2], 0.12, "#4a4d55"); b.box([C + x, 1.3, -3.2], [0.16, 0.12, 1.1], "#4a4d55"); }
  const by = [[4, 0.43], [3, 1.29], [2, 2.15], [1, 3.01]] as number[][]; // barrels: rows of 4-3-2-1, 0.62 m apart
  by.forEach(([n, y]) => { for (let i = 0; i < n; i++) b.cylinder([C + 3 + (i - (n - 1) / 2) * 0.64, y, -1.2], 0.3, 0.86, "#2f4a8a"); });
  for (const [x, z, s] of [[-16, -12, 0.8], [14, -14, 0.9], [22, -9, 0.75], [-24, -16, 1]] as V3[]) pine20(b, C + x, z, s);
  for (let i = 0; i < 10; i++) drift20(b, C - 20 + i * 4.4, 3.4 + arnd() * 2, 1 + arnd() * 0.8, 0.28);
  // ---- D: the map clearing (x 180): the board on two posts z -4, the border post + hut, a flagpole
  const D = 180;
  for (const s of [-1, 1]) b.box([D + s * 3.25, 2.4, -4.15], [0.22, 4.8, 0.22], "#4a3426");
  b.box([D, 2.75, -4.12], [6.3, 3.9, 0.12], "#5a4030"); // the board (the map card sits 6 cm proud of it)
  b.cylinder([D - 6, 4.5, -2.5], 0.08, 9, "#e8e4da"); pine20(b, D - 4.2, -5.8, 0.85); pine20(b, D - 8.4, -4.6, 0.8); // near dark behind the flag (30) b.geo(new THREE.SphereGeometry(0.16, 10, 6), [D - 6, 9.05, -2.5], "#e8c45a");
  b.box([D - 0.6, 0.25, -3.3], [0.8, 0.5, 0.6], "#9a7448", "wood"); // the step box he stands on at the map (top y 0.5)
  border20(b, D, false);
  // ---- E: the same border at night (x 240)
  border20(b, 240, true);
}

// ---------------- ep21 talkton set (2026-11-08): the gate x 0 (plaza z 0..4, arch z -3, Main Street road x -3..3 running to -z, bus x -4.6),
// the market x 60 (stalls along x at z -2.6, lamp post x 2.2 z 0.4), the stone bridge x 120 (deck along x at z 0, top y 1.0, creek along z),
// Mia's street at night x 180 (road z 1..6, fence z -1.6, Mia's house front z -6 + porch y 0.6, Grandma's house x -9 with a lit window).
// Every lettered board, the LOVE BOX face and the glows are fx cards from eps/ep21/cast.ts. ----------------
let tr = 21; const trnd = () => ((tr = (tr * 16807) % 2147483647) / 2147483647);
const tree21 = (b: SetBuilder, x: number, z: number, s: number) => outdoor(b, "tree_round", [x, 0, z], s, x * 0.7 + z, () => puff(b, x, z, s));
const bush21 = (b: SetBuilder, x: number, z: number, k: number, c = "#3f6b3a") => b.geo(sph(0.7 * k, 1.5, 0.9, 1, 10), [x, 0.45 * k, z], c);
function talkton(b: SetBuilder) {
  ground(b, 2400, "#8fbf6a");
  // ---- A: the gate (x 0)
  b.paint = true;
  b.box([0, 0.02, -45], [6, 0.02, 96], "#6f7590"); // Main Street
  b.box([0, 0.03, 2.5], [16, 0.03, 7], "#d8cbb0"); // the plaza at the bus stop
  for (const s of [-1, 1]) b.box([s * 4, 0.03, -45], [2, 0.03, 96], "#d8cbb0"); // pavements
  for (let z = -6; z > -90; z -= 4) b.box([0, 0.04, z], [0.18, 0.012, 1.8], "#eee6d6"); // centre dashes
  b.paint = false;
  for (const s of [-1, 1]) b.box([s * 3.3, 2.6, -3], [0.45, 5.2, 0.45], "#8a5a3a"); // the arch legs
  b.box([0, 5.0, -3], [7.4, 0.5, 0.5], "#8a5a3a"); // its beam (the TALKTON board is fx)
  for (const s of [-1, 1]) b.beam([s * 1.1, 4.75, -3.05], [s * 1.1, 4.2, -3.05], 0.04, "#2b2f3a"); // chains of the hanging price board
  // the bus (ep21 fix: a 5 m town bus along x, door side facing +z, nose +x, so shot 2 holds the whole bus with the arch behind)
  // fix round 2: a 6.2 m rounded city bus x -7.6..-1.4, z 1.35..3.85 (side face z 3.85), body y 0.5..2.95; door x -2.05, axles x -3.1 / -6.3
  b.geo(new RoundedBoxGeometry(6.2, 2.45, 2.5, 4, 0.3), [-4.5, 1.725, 2.6], "#ffd02a");
  b.geo(new RoundedBoxGeometry(5.6, 0.14, 2.0, 2, 0.06), [-4.55, 3.03, 2.6], "#f4f1ea"); b.box([-5.2, 3.21, 2.6], [1.6, 0.22, 1.2], "#e4e1da"); // roof cap clear above the body top (2.95): the sunk cap's seam boiled; the A/C pod
  b.paint = true;
  for (const x of [-7.0, -6.0, -5.0, -4.0, -3.0]) b.box([x, 1.95, 3.87], [0.85, 0.95, 0.02], "#3d5468"); // the window row
  b.box([-1.38, 1.85, 2.6], [0.02, 1.1, 1.8], "#3d5468"); b.box([-1.38, 2.53, 2.6], [0.02, 0.2, 1.4], "#1d1a3a"); // windscreen + route sign
  b.box([-4.95, 1.25, 3.87], [5.1, 0.12, 0.02], "#c63939"); b.box([-2.05, 1.45, 3.87], [0.7, 1.9, 0.02], "#2a3442"); // stripe, the open doorway
  b.paint = false;
  for (const x of [-2.42, -1.68]) b.box([x, 1.45, 3.97], [0.05, 1.8, 0.2], "#4a5262"); // the folded door leaves
  b.box([-2.05, 0.6, 3.92], [0.7, 0.08, 0.1], "#9a9aa2"); b.box([-2.05, 0.26, 4.04], [0.8, 0.08, 0.35], "#9a9aa2"); // sill + the step (top y 0.30)
  for (const x of [-3.1, -6.3]) { // wheels inside dark arches, axle along z: round from the side
    b.geo(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 32, 1, false, Math.PI / 2, Math.PI).rotateX(Math.PI / 2), [x, 0.55, 3.875], "#202028");
    b.geo(new THREE.CylinderGeometry(0.5, 0.5, 0.22, 32).rotateX(Math.PI / 2), [x, 0.555, 3.83], "#1c1c22");
    b.geo(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 16).rotateX(Math.PI / 2), [x, 0.555, 3.96], "#b9bcc4"); }
  for (const x of [-1.33, -7.67]) b.box([x, 0.58, 2.6], [0.14, 0.24, 2.4], "#2b2f3a"); // bumpers
  for (const z of [1.85, 3.35]) b.geo(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 12).rotateZ(Math.PI / 2), [-1.36, 0.95, z], "#fff3c4"); // headlights
  b.beam([2.9, 0, 0.2], [2.9, 2.6, 0.2], 0.09, "#2b2f3a"); // the bus-stop pole (its round sign is fx) + the bin: the near dark of 1-2
  b.cylinder([3.5, 0.45, 0.6], 0.28, 0.9, "#2f4a3a");
  outdoor(b, "bench", [5.2, 0.03, 0.0], 1, 0, () => b.box([5.2, 0.45, 0], [1.8, 0.1, 0.5], "#8a5a3a"));
  for (let i = 0; i < 9; i++) { const z = -9 - i * 8.5; // houses both sides of Main Street, fronts facing the road
    outdoor(b, i % 3 === 1 ? "shop_awning" : i % 2 ? "house_b" : "house_a", [-9.5, 0, z], 1, Math.PI / 2, () => hut(b, -9.5, z, 6, 6, 4, "#d9c7a3", "#7a4b36"));
    outdoor(b, i % 3 === 2 ? "shop_awning" : i % 2 ? "house_a" : "house_b", [9.5, 0, z - 3], 1, -Math.PI / 2, () => hut(b, 9.5, z - 3, 6, 6, 4, "#c96b55", "#5b4636"));
    if (i % 2 === 0) for (const s of [-1, 1]) outdoor(b, "street_lamp", [s * 5.2, 0, z - 4], 1, 0, () => b.beam([s * 5.2, 0, z - 4], [s * 5.2, 4.6, z - 4], 0.14, "#2f3e4f")); }
  house19(b, 0, -96, 7, 6, 3.4, "#e8dcc1", "#8a4b32", 2.0); b.paint = true; b.box([0, 1.05, -95.96], [1.3, 2.1, 0.05], "#c63939"); b.paint = false; // Mia's red door at the end of the street
  for (const [x, z] of [[-10.5, 6.5], [7.5, 3.5], [-13, -1], [14, -2], [-6.6, -5.5]] as number[][]) tree21(b, x, z, 0.9);
  for (const [x, z, k] of [[-9.0, 7.5, 1.0], [8.5, 5.8, 0.9], [6.2, -1.4, 0.8]] as number[][]) bush21(b, x, z, k);
  // ---- B: the market (x 60): five stalls facing +z along z -2.6, shops behind, the lamp post with the price list
  const B = 60;
  b.paint = true; b.box([B, 0.03, 0], [44, 0.03, 9], "#d8cbb0"); for (let x = -21; x <= 21; x += 1.5) b.box([B + x, 0.058, 0], [0.04, 0.012, 9], "#c4b698"); // seams clear of the plaza top (.045) b.paint = false;
  for (const x of [-8, -4, 0, 4, 8]) outdoor(b, "market_stall", [B + x, 0.066, -2.6], 1.15, 0, () => { b.box([B + x, 0.5, -2.6], [2.8, 1.0, 1.4], "#b59063"); b.box([B + x, 2.4, -2.6], [3, 0.12, 1.8], "#83ad69"); });
  for (const dx of [-0.6, 0, 0.6]) b.geo(sph(0.22, 1.6, 0.8, 1, 10), [B + dx, 1.12, -2.0], "#c98a4a"); // loaves on the bakery stall
  for (const [x, z] of [[-6.3, -0.9], [-5.3, -0.6], [2.6, -1.0], [6.2, -0.8], [9.8, -1.1]] as number[][]) outdoor(b, "crate", [B + x, 0.066, z], 0.7, x, () => b.box([B + x, 0.3, z], [0.6, 0.6, 0.6], "#9a7448"));
  for (const x of [-15, -7.5, 0.5, 8, 15.5]) outdoor(b, x === 0.5 ? "shop_awning" : x < 0 ? "house_a" : "house_b", [B + x, 0, -10], 1, 0, () => hut(b, B + x, -10, 6, 6, 4, "#d9c7a3", "#7a4b36"));
  outdoor(b, "street_lamp", [B - 10.5, 0.03, 1.2], 1, 0, () => b.beam([B - 10.5, 0, 1.2], [B - 10.5, 4.6, 1.2], 0.14, "#2f3e4f")); // off the PRICE LIST (its own legs are fx)
  for (const x of [-12, 12]) tree21(b, B + x, -5.5, 0.85);
  for (const x of [-11, 11.5]) bush21(b, B + x, 4.6, 1.0);
  // ---- C: the stone bridge (x 120): a creek along z (x -3.6..3.6), grass banks, the deck along x at z 0 (top y 1.0) on three arches
  const C = 120, stone = "#aeb0b4", dark = "#85878f";
  b.paint = true; b.box([C, 0.025, 0], [7.2, 0.02, 200], "#4f86a8"); for (const s of [-1, 1]) b.box([C + s * 3.75, 0.035, 0], [0.4, 0.02, 200], "#9fbccc"); b.paint = false;
  b.box([C, 0.8, 0], [10, 0.4, 2.2], stone); // the deck, x -5..5
  for (const s of [-1, 1]) b.geo(new THREE.BoxGeometry(3.4, 0.4, 2.2).rotateZ(s * -0.3), [C + s * 6.6, 0.48, 0], stone); // ramps down to the banks
  for (const x of [-2.6, 0, 2.6]) b.box([C + x, 0.3, 0], [0.5, 0.6, 2.0], dark); // piers
  for (const x of [-1.3, 1.3]) for (const z of [-1.12, 1.12]) b.geo(new THREE.TorusGeometry(1.05, 0.12, 6, 18, Math.PI), [C + x, -0.25, z], dark); // arch rings
  const cope = "#d3d4d6", joint = "#7c7f88"; // grey stone parapet: wall, a wider pale coping on top, short capped pillars every 2.4 m
  for (const z of [-1.0, 1.0]) { b.box([C, 1.22, z], [10, 0.44, 0.24], stone); b.box([C, 1.48, z], [10.1, 0.08, 0.34], cope);
    b.paint = true; for (let x = -4.4; x <= 4.41; x += 0.8) b.box([C + x, 1.22, z + 0.135], [0.025, 0.42, 0.01], joint); b.box([C, 1.21, z + 0.135], [10, 0.025, 0.01], joint); b.paint = false;
    for (let x = -4.8; x <= 4.81; x += 2.4) { b.box([C + x, 1.3, z], [0.36, 0.6, 0.36], stone); b.box([C + x, 1.63, z], [0.44, 0.08, 0.44], cope); } }
  for (const [x, z, k] of [[-5.6, 2.6, 0.6], [5.4, -2.8, 0.7], [-4.6, -4, 0.55], [4.4, 4.5, 0.6]] as number[][]) outdoor(b, "rock_cluster", [C + x, 0, z], k, x, () => undefined);
  for (const [x, z] of [[-9, -6], [10, -8], [-12, 5], [13, 3], [-7, -14], [8, -18]] as number[][]) tree21(b, C + x, z, 0.95);
  for (let i = 0; i < 12; i++) { const s = i % 2 ? 1 : -1; bush21(b, C + s * (4.6 + trnd() * 3), -12 + i * 2.2, 0.45 + trnd() * 0.3, ["#d77aa0", "#e8c45a", "#4a7a42"][i % 3]); } // flowers on the banks
  // ---- D: Mia's street at night (x 180)
  const D = 180;
  b.paint = true; b.box([D, 0.02, 3.6], [60, 0.02, 5.2], "#8f97b0"); b.box([D, 0.04, -0.4], [60, 0.04, 2.8], "#c9c4b6"); b.paint = false;
  // Mia's house: front z -6, the porch floor y 0.6 (z -6..-3.8), three steps down to z -2.6, a roof on two posts, the door x 0
  house19(b, D, -6, 8, 7, 3.6, "#e8dcc1", "#7a4b36", 2.0);
  win19(b, D - 2.6, 1.9, -6); win19(b, D + 2.6, 1.9, -6);
  b.paint = true; b.box([D, 1.65, -5.965], [1.2, 2.2, 0.06], "#f4f1ea"); b.box([D, 1.6, -5.92], [0.98, 2.04, 0.03], "#c63939"); b.paint = false; // the red door (y 0.6..2.7)
  b.box([D, 0.3, -4.9], [4.2, 0.6, 2.2], "#b8ad9a"); // porch floor (top y 0.6)
  for (let i = 0; i < 3; i++) b.box([D, 0.075 * (i + 1), -2.925 - 0.35 * i], [1.2, 0.15 * (i + 1), 0.35], "#cfc6b4"); // steps, tops y .15 .30 .45
  for (const s of [-1, 1]) { b.beam([D + s * 1.9, 0.6, -3.95], [D + s * 1.9, 2.8, -3.95], 0.14, "#f4f1ea"); b.box([D + s * 1.2, 0.95, -3.95], [1.4, 0.07, 0.07], "#f4f1ea"); } // posts + rails
  b.box([D, 2.9, -4.9], [4.6, 0.14, 2.6], "#7a4b36"); // porch roof
  b.box([D - 0.95, 2.35, -5.92], [0.16, 0.26, 0.1], "#2b2f3a"); bulb(b, [D - 0.95, 2.2, -5.84], 0.07, [1.0, 0.85, 0.5]); // the porch light
  b.box([D + 1.55, 0.8, -3.2], [0.12, 1.6, 0.12], "#4a3426"); b.box([D + 1.55, 1.83, -3.2], [0.52, 0.46, 0.4], "#c9a24a"); // the LOVE BOX post + brass body (face is fx at z -3.02)
  b.cylinder([D + 1.55, 2.12, -3.2], 0.06, 0.14, "#c9a24a");
  // the front fence (fix round 2): one solid board panel per run on square posts, a cap rail; brick gate pillars x +-1.1 and the gate leaf
  // swung open into the yard. No slats or thin rails: they boiled at range (fence19). The MIA plate on the left pillar is fx.
  for (const [x0, x1] of [[-14, -1.32], [1.32, 12]]) { const n = Math.round((x1 - x0) / 2.4), cx = D + (x0 + x1) / 2;
    b.box([cx, 0.5, -1.6], [x1 - x0, 0.6, 0.06], "#eee6d6"); b.box([cx, 0.83, -1.6], [x1 - x0, 0.07, 0.12], "#d9d0bd");
    for (let i = 0; i <= n; i++) { const x = D + x0 + (i * (x1 - x0)) / n; b.box([x, 0.5, -1.6], [0.14, 1.0, 0.14], "#eee6d6"); b.box([x, 1.03, -1.6], [0.2, 0.06, 0.2], "#d9d0bd"); } }
  for (const s of [-1, 1]) { b.box([D + s * 1.1, 0.6, -1.6], [0.44, 1.2, 0.44], "#a4553f"); b.box([D + s * 1.1, 1.24, -1.6], [0.54, 0.08, 0.54], "#d9d0bd"); }
  b.box([D + 0.84, 0.5, -2.2], [0.05, 0.6, 0.8], "#eee6d6"); b.box([D + 0.84, 0.83, -2.2], [0.08, 0.07, 0.84], "#d9d0bd"); // the gate, open
  // Grandma's house x -9: its ground-floor window is a real hole (x -9.7..-8.3, y 1.0..2.2) into a lit room
  const G = D - 9.5;
  b.box([G - 2.6, 1.8, -6.2], [3.8, 3.6, 0.4], "#a7c4d9"); b.box([G + 2.6, 1.8, -6.2], [3.8, 3.6, 0.4], "#a7c4d9");
  b.box([G, 0.5, -6.2], [1.4, 1.0, 0.4], "#a7c4d9"); b.box([G, 2.9, -6.2], [1.4, 1.4, 0.4], "#a7c4d9");
  b.box([G, 3.75, -9.5], [9.2, 0.3, 7], "#5b4636"); b.box([G, 1.8, -12.8], [9, 3.6, 0.3], "#a7c4d9");
  b.box([G, 1.0, -5.95], [1.7, 0.08, 0.3], "#f4f1ea"); for (const s of [-1, 1]) b.box([G + s * 0.76, 1.6, -5.98], [0.1, 1.3, 0.1], "#f4f1ea"); b.box([G, 2.22, -5.98], [1.6, 0.1, 0.1], "#f4f1ea");
  noCast(b, (m) => { m.box([G, 0.04, -7.6], [3, 0.08, 2.6], "#c9a97a"); m.box([G, 1.7, -8.9], [3, 3.4, 0.2], "#f0d9a8"); m.box([G - 1.4, 1.7, -7.6], [0.2, 3.4, 2.6], "#e5d3a8"); m.box([G + 1.4, 1.7, -7.6], [0.2, 3.4, 2.6], "#e5d3a8"); m.box([G, 3.2, -7.6], [3, 0.12, 2.6], "#efe3c8"); });
  for (const x of [-5.6, 6.2]) outdoor(b, "street_lamp", [D + x, 0.04, 0.6], 1, 0, () => b.beam([D + x, 0, 0.6], [D + x, 4.6, 0.6], 0.14, "#2f3e4f"));
  outdoor(b, "mailbox", [D - 1.85, 0.06, -1.1], 1, 0, () => b.box([D - 1.85, 0.9, -1.1], [0.4, 0.5, 0.5], "#3f6c8c")); // beside the gate
  for (const [x, z] of [[-17, -3], [9.5, -4], [14, -8], [-22, -9]] as number[][]) tree21(b, D + x, z, 1.0);
  for (const [x, z, k] of [[-3.2, -2.6, 0.8], [3.4, -2.8, 0.9], [-6.4, -2.4, 0.7]] as number[][]) bush21(b, D + x, z, k, "#355e34");
  house19(b, D + 22, -6, 8, 7, 4.2, "#c96b55", "#5b4636", 2.0); house19(b, D - 24, -6, 8, 7, 4.2, "#e8dcc1", "#8a4b32", 2.0);
}

/** Builds every static set once. Caller owns root lifecycle, lighting, fog, cards and animation.
 * Geometry is owned by root; palette materials / CanvasTextures are shared caches (do not dispose per set).
 * No asset loading, environment mutation, actors, lights, cameras or runtime gameplay behavior.
 */
export function buildSets(root: THREE.Object3D, used?: Set<SetId>): void {
  const start = performance.now();
  const builders: Record<SetId, (b: SetBuilder) => void> = { home, yard, forest, snow, bedroom,
    counter, floor, kitchen, beach, reef, bathroom, party, lagoon, rooftops, street, park, town, desert, sea, mountains, field, west, alps, pacific, tips, salary, tornado, turkey, alaska, talkton };
  const BIG = new Set<SetId>(["town", "desert", "sea", "mountains", "field", "west", "alps", "pacific", "tips", "salary", "tornado", "turkey", "alaska", "talkton"]); // only when the episode uses them (older sets always, in order: they share rnd())
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
