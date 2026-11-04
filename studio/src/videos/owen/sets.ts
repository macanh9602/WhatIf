import * as THREE from "three";
import { Batch, boxGeo, quad, tri, V } from "../bridge/build";
import { twoTone } from "./shade";
import { NOINK } from "./ink";
import { ctex, jit } from "./paint";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { staticFile } from "remotion";

/** CC0 Poly Pizza models (Kenney / Quaternius / CreativeTrio), exported from Blender into public/owen/props
 *  (credits in CREDITS.txt). buildSets places them only once loadProps() has resolved. */
const PROP_FILES = ["toaster", "microwave", "stove", "bookcase_books", "houseplant", "tree", "palm", "duck"] as const;
type PropName = (typeof PROP_FILES)[number];
const KIT = new Map<PropName, THREE.Object3D>();
let kitP: Promise<void> | undefined;
export const loadProps = () => (kitP ??= Promise.all(PROP_FILES.map((n) =>
  new GLTFLoader().loadAsync(staticFile(`owen/props/${n}.glb`)).then((g) => { g.scene.updateMatrixWorld(true); KIT.set(n, g.scene); }))).then(() => undefined));

export type V3 = [number, number, number];
export type SetId = "bedroom" | "classroom" | "kitchen" | "schoolyard" | "waterpark" | "store" | "street" | "garage" | "yard" | "forest" | "snow";
export type CamHint = { pos: V3; look: V3; fov: number };
export type SetInfo = { origin: V3; indoor: boolean; spots: Record<string, V3>; cams: Record<string, CamHint> };

// Metres, local +z is the open camera side. All public staging coordinates are world-space.
const info = (x: number, indoor: boolean, spots: Record<string, V3>, cams: Record<string, CamHint>): SetInfo => {
  const world = ([a, b, c]: V3): V3 => [x + a, b, c];
  return { origin: [x, 0, 0], indoor,
    spots: Object.fromEntries(Object.entries(spots).map(([k, v]) => [k, world(v)])),
    cams: Object.fromEntries(Object.entries(cams).map(([k, v]) => [k, { ...v, pos: world(v.pos), look: world(v.look) }])) };
};
const cam = (pos: V3, look: V3, fov = 40): CamHint => ({ pos, look, fov });
export const SETS: Record<SetId, SetInfo> = {
  bedroom: info(0, true, {
    owen: [-0.5, 0, 0], mirror: [-1.7, 0, -2.35], desk: [1.05, 0, -1.95], door: [2.7, 0, -3.25], bed: [-2.45, 0.59, 0.2],
    calendar: [1.1, 0, -1.3],
  }, {
    wide: cam([0, 1.6, 5.4], [-0.5, -0.45, -0.8], 42),
    owenClose: cam([-0.5, 1.35, 2.6], [-0.5, 0.95, 0], 36),
    mirror: cam([-1.2, 1.55, -0.2], [-1.95, 1.1, -3.3], 40),
    door: cam([2.1, 1.5, 0.9], [2.7, 1, -3.3], 38),
    desk: cam([1.85, 1.7, -0.25], [1.85, 0.78, -2.75], 50),
    bed: cam([-0.9, 1.6, 2.5], [-2.4, 0.63, 0], 43),
    calendar: cam([1.1, 1.88, -1.08], [1.1, 1.88, -3.29], 38),
  }),
  classroom: info(200, true, {
    patel: [0, 0, -2.65], owenAtDesk: [0, 0, -0.35], owenSeat: [-1.5, 0, 1.6], window: [-3.5, 0, -1],
  }, {
    wide: cam([0.4, 1.65, 6.4], [0, -0.55, -1.3], 42),
    twoShot: cam([3.4, 1.65, 2.7], [0, 0.05, -1.55], 40),
    patelClose: cam([0, 1.6, -0.1], [0, 1.28, -2.65], 38),
    handClose: cam([0.7, 1.12, -0.4], [0, 0.83, -1.7], 42),
    owenSeat: cam([-0.2, 1.45, 3.55], [-1.5, 0.78, 1.6], 45),
  }),
  kitchen: info(400, true, { mom: [-0.65, 0, -1.2], owen: [0.65, 0, 1.1], fridge: [2.65, 0, -1.9] }, {
    wide: cam([0.4, 1.65, 6.4], [0, -0.55, -1.1], 42),
    momClose: cam([-1.1, 1.65, 1.3], [-0.65, 1.15, -1.2], 40),
    owenClose: cam([0.6, 1.45, 3.9], [0.65, 0.9, 1.1], 38),
    fridge: cam([2.4, 1.5, -0.25], [2.65, 1.2, -2.91], 38),
    night: cam([0.4, 1.65, 6.4], [0, -0.55, -1.1], 42),
  }),
  schoolyard: info(600, false, {
    bench: [-4, 0, -1.9], court1: [-1.6, 0, 3], court2: [1.6, 0, 3],
    court3: [-1.6, 0, 6], court4: [1.6, 0, 6], sideline: [-0.4, 0, 9.4], steps: [4, 0, -0.8], tray: [-7.1, 0, -2.6],
  }, {
    wide: cam([1, 1.7, 14], [0, 0.5, 2.5], 48),
    bench: cam([-3.4, 1.5, 2.3], [-4, 0.85, -2.3], 43),
    court: cam([0, 1.7, 13.7], [0, 0.5, 4.5], 49),
    steps: cam([4.2, 1.6, 4.6], [4, 0.8, -1.4], 43),
    tray: cam([-6.9, 1.5, 1.3], [-7.1, 0.95, -3.3], 40),
  }),
  waterpark: info(800, false, { chairs: [-1, 0, 0.5], chair2: [0.8, 0, 0.5], slide: [2, 0, -1.85], pool: [2, 0, -1.9] }, {
    wide: cam([-1, 1.3, 9.5], [1, 0.8, -2], 49), // eye level (staging_qa camH); was 1.7 m looking down at a flat floor
    chairs: cam([-0.3, 1.6, 6.8], [-0.2, 0.9, 0], 46),
    slide: cam([5, 1.7, 7.5], [5, 1.7, -6], 48),
  }),
  // ep02 "Cold Front"
  store: info(1000, true, { owen: [-0.45, 0, -0.35], theo: [1.0, 0, 0.35], counter: [0, 0, -1.25], ice: [1.05, 0, -1.25] }, {
    wide: cam([0.2, 1.3, 4.6], [0.1, 0.9, -1], 44),
  }),
  street: info(1200, false, {
    owen: [0, 0, -2.25], stand: [0, 0, -1.55], theo: [0.85, 0, -2.0], rival: [-3.4, 0, -2.25], rivalStand: [-3.4, 0, -1.55],
    rival2: [-6.6, 0, -2.25], board: [3.3, 0, -3.3], walk: [10, 0, -1.2], finish: [7, 0, 4.5],
  }, {
    wide: cam([0.5, 1.4, 7.5], [0, 0.9, -1.5], 46),
  }),
  // What If ep01: front yards + a crossing, a forest (green -> black), the same forest under snow
  yard: info(1600, false, { you: [-1.4, 0, -1.2], neighbor: [3.2, 0, -3.2], corner: [7.2, 0, 0.5], lamp: [-3.2, 0, 0.6], light: [8.4, 0, 1.1] }, {
    wide: cam([0, 1.5, 8.5], [0.8, 1.0, -3], 46),
  }),
  forest: info(1800, false, { you: [0, 0, 0], bud: [1.1, 0, -1.2] }, {
    wide: cam([0, 1.4, 6], [0, 1.6, -4], 46),
  }),
  snow: info(2000, false, { you: [0, 0, 0], bud: [1.1, 0, -1.2] }, {
    wide: cam([0, 1.4, 6], [0, 1.6, -4], 46),
  }),
  garage: info(1400, true, { bench: [2.6, 0, -2.6], door: [0, 0, -3.5], mom: [0, 0, -4.4], owen: [-0.6, 0, -1.2], theo: [0.6, 0, -1.4] }, {
    wide: cam([0, 1.35, 4.2], [0, 1, -3], 46),
  }),
};

// Static art profile. Change palette, architecture sizes and prop placement here; no runtime/domain decisions.
/** water slide x (local): behind the chairs, inside the vertical frame of the closing two-shot (was 5, out of frame) */
export const SLIDE_X = 2;
export const SLIDE_PATH: V3[] = [[SLIDE_X, 3.12, -9.1], [SLIDE_X, 3, -8.5], [SLIDE_X, 2.7, -7.7], [SLIDE_X, 1.9, -6.8], [SLIDE_X, 0.85, -5.6], [SLIDE_X, 0.22, -4.7], [SLIDE_X, 0.16, -4.1]];
export const SET_ART = {
  wallHeight: 2.7, roomWidth: 8, roomDepth: 8, back: -3.5, groundSize: 140,
  palette: { wood: "#b59063", trim: "#f3e7ce", cream: "#e8dcc1", sage: "#bdcfb5", blue: "#5b8eaa",
    teal: "#2F6E73", red: "#b93c51", yellow: "#edcf53", metal: "#536479", paper: "#f5efd9",
    brick: "#a76a66", green: "#83ad69", foliage: "#68945d", siding: "#D9C7A3", roof: "#5B4636", pool: "#3fc1c9" },
  bedroom: { bed: [-2.45, 0, 0] as V3, desk: [1.65, 0, -2.8] as V3, bedTop: 0.59,
    calendar: { center: [1.1, 1.88, -3.29] as V3, w: 0.6, h: 0.45, normal: [0, 0, 1] as V3 },
    clock: { center: [-1.13, 2.03, -3.245] as V3, r: 0.22, normal: [0, 0, 1] as V3 } },
  classroom: { desk: [0, 0, -1.65] as V3, deskTop: 0.82, rows: [1, 2.9], columns: [-2.6, -1.5, 1.5, 2.6] },
  kitchen: { island: [0, 0, 0] as V3, islandTop: 0.98, fridge: [2.65, 0, -3.15] as V3 },
  schoolyard: { schoolZ: -4, bench: [-4, 0, -2.8] as V3, court: [0, 0, 4.5] as V3 },
  street: { thermo: { center: [-8.3, 3.1, -4.43] as V3, w: 0.9, h: 2.0, normal: [0, 0, 1] as V3 },
    poster: { center: [3.3, 1.5, -3.27] as V3, w: 0.8, h: 1.0, normal: [0, 0, 1] as V3 } },
  garage: { door: { center: [0, 1.2, -3.47] as V3, w: 3.0, h: 2.4, normal: [0, 0, 1] as V3 }, benchTop: 0.9 },
  waterpark: { pool: [3, 0, -5.8] as V3, poolSize: [10, 0.12, 7] as V3,
    umbrella: [-0.2, 0, -0.2] as V3, umbrellaRadius: 2.45, canopyHeight: 2.75, chairs: [-1.05, 0.85] },
};
/** light-pool centres (set-local) for the lamp / window presets in lights.ts: the desk lamp, the pendant over the
 *  island, the classroom side window */
export const POOLS: Partial<Record<SetId, V3>> = { bedroom: [0.85, 1.28, -2.75], kitchen: [0, 2.1, 0], classroom: [-3.6, 1.62, -1], yard: [-3.2, 3.5, 0.85] };
const P = SET_ART.palette;
// Owen's own twoTone: bridge/build's lam() binds the BRIDGE light uniforms, which world.ts never sets, so the sets
// ignored every Owen light preset (flat lavender shade on all of ep01 v1-v4)
const mats = new Map<string, THREE.MeshLambertMaterial>();
const lam = (key: string, make: () => THREE.MeshLambertMaterialParameters) => {
  let m = mats.get(key);
  if (!m) mats.set(key, (m = twoTone(new THREE.MeshLambertMaterial(make()))));
  return m;
};
type Surface = "wood" | "brick" | "tile" | "cloth" | "wallpaper" | "plain";
// Small repeatable painted swatches: seams, uneven pigment, grain. No font or external assets.
function paint(kind: Surface, color: string): THREE.CanvasTexture {
  return ctex(`owen.set.v5.${kind}.${color}`, 1024, 1024, (g, r) => {
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
          if (kind === "wood") for (let k = 0; k < 16; k++) {
            g.strokeStyle = k % 3 ? "rgba(65,34,20,.26)" : "rgba(255,237,196,.26)";
            g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + k * 16);
            g.bezierCurveTo(320, y + k * 16 - 14, 700, y + k * 16 + 18, 1024, y + k * 16); g.stroke();
          }
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
  return lam(`owen.set.${kind}.${color}`, () => ({ map: paint(kind, color) }));
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
 *  (or `recolor` by material name) on Owen's own two-tone rig. Returns false when the kit is not loaded. */
function prop(b: SetBuilder, name: PropName, [x, y, z]: V3, h: number, yaw = 0, recolor: Record<string, string> = {}) {
  const o = KIT.get(name);
  if (!o) return false;
  const box = new THREE.Box3().setFromObject(o), c = box.getCenter(new THREE.Vector3()), s = h / Math.max(0.01, box.max.y - box.min.y);
  const at = new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw), V(s, s, s))
    .multiply(new THREE.Matrix4().makeTranslation(-c.x, -box.min.y, -c.z));
  o.traverse((m) => {
    if (!(m instanceof THREE.Mesh)) return;
    const src = m.material as THREE.MeshStandardMaterial, hex = recolor[src.name] ?? `#${src.color.getHexString()}`;
    const mat = src.map ? lam(`owen.prop.${name}.${src.name}`, () => ({ map: src.map })) : material(hex);
    (b.paint ? b.flat : b.batch).add(m.geometry, mat, at.clone().multiply(m.matrixWorld));
  });
  return true;
}
function framed(b: SetBuilder, x: number, y: number, z: number, w: number, h: number, color: string) {
  b.box([x, y, z], [w + 0.12, h + 0.12, 0.08], P.trim);
  b.box([x, y, z + 0.052], [w, h, 0.035], color);
}
function windowBack(b: SetBuilder, x: number, z: number, w = 1.7) {
  framed(b, x, 1.65, z, w, 1.25, "#9cc3d6");
  b.box([x, 1.65, z + 0.085], [0.045, 1.25, 0.03], P.trim);
  b.box([x, 1.65, z + 0.085], [w, 0.045, 0.03], P.trim);
  b.box([x, 1, z + 0.14], [w + 0.25, 0.07, 0.3], P.trim);
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
function wallNotes(b: SetBuilder, x: number, y: number, z: number, cols: number, rows: number, pitch = .24) {
  for (let i = 0; i < cols * rows; i++) {
    const px = x + (i % cols) * pitch, py = y + Math.floor(i / cols) * pitch;
    b.box([px, py, z], [pitch * .76, pitch * .72, .012], ROUND3.notes[i % ROUND3.notes.length]);
    b.box([px, py + pitch * .26, z + .009], [.055, .035, .008], P.trim);
  }
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
function bedroom(b: SetBuilder) {
  const [lx, ly, lz] = POOLS.bedroom!;
  lamp(b, [lx, ly, lz], 0.78);
  room(b, "#e1c268", true, { x: -.05, w: .95 });
  const { bed: [x, , z], desk, bedTop } = SET_ART.bedroom;
  b.box([x, 0.25, z], [1.4, 0.42, 2.35], P.teal, "wood");
  b.box([x, 0.51, z], [1.35, bedTop - 0.43, 2.27], P.paper);
  b.box([x, 0.9, z - 1.15], [1.5, 0.85, 0.12], P.teal, "wood");
  b.box([x - 0.05, 0.64, z - 0.72], [0.9, 0.13, 0.43], P.cream, "cloth", 0.12);
  b.box([x + 0.08, 0.62, z + 0.36], [1.38, 0.06, 1.1], P.blue, "cloth", -0.07);
  b.box([x + 0.57, 0.39, z + 0.6], [0.1, 0.45, 0.75], P.blue, "cloth");
  b.box([-0.3, 0.012, 0.7], [2.2, 0.024, 2.4], "#3f73a8", "cloth"); // saturated rug fills the empty lower third of shot 1 (look score)
  b.box([-1.95, 0.42, -3.1], [1.05, 0.84, 0.45], P.wood, "wood"); // dresser under the mirror
  for (const y of [0.25, 0.6]) b.box([-1.95, y, -2.87], [0.95, 0.025, 0.02], "#7a5a3a");
  framed(b, -1.95, 1.45, -3.35, 0.82, 1.1, "#c0d7dc");
  // Upper-corner glints leave the centre clear for the animated reflection.
  b.beam([-2.27, 1.62, -3.269], [-2.05, 1.95, -3.269], 0.035, "#edf5f5");
  b.beam([-2.13, 1.62, -3.269], [-1.91, 1.95, -3.269], 0.018, "#edf5f5");
  const { clock, calendar } = SET_ART.bedroom;
  const [cx, cy, cz] = clock.center;
  b.geo(new THREE.CircleGeometry(clock.r + 0.025, 32), [cx, cy, cz - 0.02], P.trim);
  const clockFace = ctex("owen.set.clock", 256, 256, (g) => {
    g.fillStyle = P.paper; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = P.metal; g.lineCap = "round";
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6, inner = i % 3 ? 98 : 87;
      g.lineWidth = i % 3 ? 4 : 7;
      g.beginPath(); g.moveTo(128 + Math.sin(a) * inner, 128 - Math.cos(a) * inner);
      g.lineTo(128 + Math.sin(a) * 112, 128 - Math.cos(a) * 112); g.stroke();
    }
  });
  const face = new THREE.CircleGeometry(clock.r, 32);
  b.batch.add(face, lam("owen.set.clock", () => ({ map: clockFace })), new THREE.Matrix4().makeTranslation(cx, cy, cz)); face.dispose();
  table(b, desk, 1.9, 0.92, 0.78);
  chair(b, 1.3, -1.9);
  for (let i = 0; i < 5; i++) b.box([1.1 + i * 0.11, 0.788 + i * 0.003, -3.02 + (i % 2) * 0.15], [0.44, 0.008, 0.32], P.paper, "plain", i * 0.23);
  b.box([1.55, 0.81, -2.65], [0.43, 0.05, 0.56], P.red);
  b.box([1.37, 0.839, -2.65], [0.028, 0.008, 0.56], "#6f3548");
  b.cylinder([2.12, 0.92, -2.85], 0.13, 0.28, P.paper);
  b.cylinder([2.12, 1.064, -2.85], 0.048, 0.008, P.roof);
  const tape = new THREE.TorusGeometry(0.1, 0.037, 6, 16); tape.rotateX(Math.PI / 2);
  b.geo(tape, [2.28, 0.821, -2.48], "#e2c97e");
  const poster = lam("owen.set.flyer", () => ({ map: flyer() }));
  b.batch.add(quad(V(-0.2, 1.15, -3.29), V(0.36, 1.15, -3.29), V(0.36, 1.85, -3.29), V(-0.2, 1.85, -3.29)), poster);
  const paper = ctex("owen.set.calendar", 640, 480, (g) => {
    g.fillStyle = P.paper; g.fillRect(0, 0, 640, 480);
    g.fillStyle = P.teal; g.fillRect(0, 0, 640, 90);
    g.fillStyle = P.paper; g.font = "bold 33px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(64 + i * 128, 45, 12, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = P.metal; g.lineWidth = 3;
    for (let i = 0; i <= 5; i++) { g.beginPath(); g.moveTo(i * 128, 90); g.lineTo(i * 128, 480); g.stroke(); }
    for (const y of [90, 480]) { g.beginPath(); g.moveTo(0, y); g.lineTo(640, y); g.stroke(); }
  });
  const [kx, ky, kz] = calendar.center, hw = calendar.w / 2, hh = calendar.h / 2;
  b.box([kx, ky, kz - 0.012], [calendar.w, calendar.h, 0.018], P.paper);
  b.batch.add(quad(V(kx - hw, ky - hh, kz), V(kx + hw, ky - hh, kz), V(kx + hw, ky + hh, kz), V(kx - hw, ky + hh, kz)),
    lam("owen.set.calendar", () => ({ map: paper })));
  b.box([-3.45, 0.35, -2.8], [0.6, 0.7, 0.65], P.wood, "wood");
}
function classroom(b: SetBuilder) {
  room(b, "#83bfa1", false, { x: -2.95, w: 1.1 });
  framed(b, 0, 1.79, -3.36, 3.6, 1.24, "#35614f"); // green chalkboard: a white board + white faces left two-shots at sat .18-.25
  // Diagram/scribbles only; no readable writing.
  for (let i = 0; i < 7; i++) b.beam([-1.42 + i * 0.18, 1.72, -3.285], [-1.34 + i * 0.18, 1.84 + (i % 3) * 0.06, -3.285], 0.012, P.paper);
  b.box([0, 1.13, -3.2], [3.7, 0.045, 0.18], P.metal);
  const { desk, deskTop, rows, columns } = SET_ART.classroom;
  table(b, desk, 2.2, 0.9, deskTop);
  b.box([0, 0.45, -1.23], [1.95, 0.54, 0.06], P.wood, "wood"); // flush with the desk-top front edge: a 5 cm step dashed the ink (look_qa dash, f460)
  chair(b, -0.75, -2.8); // beside Patel, not under her: she stood inside it, its back across her belly (shot 10)
  b.box([-0.6, 0.85, -1.7], [0.48, 0.06, 0.33], P.paper);
  b.cylinder([0.7, 0.91, -1.8], 0.07, 0.18, P.teal);
  for (const z of rows) for (const x of columns) { table(b, [x, 0, z], 0.85, 0.6, 0.67); chair(b, x, z + 0.6); }
  windowView(b, -2.95, 1.1, true);
  // Side-wall window is an inset graphic; its opaque backing avoids a view of another set.
  b.box([-3.9, 1.62, -1], [0.05, 1.4, 2.3], P.trim);
  b.box([-3.86, 1.62, -1], [0.04, 1.25, 2.12], "#9cc3d6");
  for (const z of [-1.55, -0.45]) b.box([-3.82, 1.62, z], [0.04, 1.25, 0.05], P.trim);
  for (let i = 0; i < 3; i++) {
    const x = 2.8 + i * 0.4;
    b.box([x, 1.03, -3.15], [0.36, 2.06, 0.48], P.blue);
    b.box([x + 0.1, 1.08, -2.89], [0.025, 0.16, 0.04], P.metal);
    for (let j = 0; j < 3; j++) b.box([x, 1.75 - j * 0.055, -2.9], [0.2, 0.012, 0.012], P.metal);
  }
}
function flyer() {
  return ctex("owen.set.flyer", 256, 320, (g) => {
    g.fillStyle = "#f5efd9"; g.fillRect(0, 0, 256, 320);
    g.fillStyle = "#9cc3ea"; g.fillRect(15, 15, 226, 290);
    g.fillStyle = P.yellow; g.beginPath(); g.arc(196, 66, 29, 0, Math.PI * 2); g.fill();
    g.strokeStyle = P.yellow; g.lineWidth = 4;
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(196 + Math.cos(a) * 34, 66 + Math.sin(a) * 34); g.lineTo(196 + Math.cos(a) * 43, 66 + Math.sin(a) * 43); g.stroke(); }
    g.fillStyle = P.pool; g.beginPath(); g.ellipse(130, 253, 100, 35, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = P.red; g.lineWidth = 23; g.lineCap = "round";
    g.beginPath(); g.moveTo(63, 112); g.bezierCurveTo(175, 101, 72, 223, 163, 238); g.stroke();
    g.strokeStyle = P.yellow; g.lineWidth = 12; g.stroke();
    g.strokeStyle = P.teal; g.lineWidth = 6;
    for (const x of [43, 61]) { g.beginPath(); g.moveTo(x, 122); g.lineTo(x, 241); g.stroke(); }
    for (let y = 143; y < 237; y += 23) { g.beginPath(); g.moveTo(43, y); g.lineTo(61, y); g.stroke(); }
    g.fillStyle = P.paper; g.fillRect(26, 32, 96, 51);
    g.fillStyle = P.teal; g.font = "bold 30px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.beginPath(); g.arc(74, 58, 13, 0, Math.PI * 2); g.fill();
    g.strokeStyle = P.red; g.lineWidth = 4;
    g.beginPath(); g.ellipse(74, 58, 51, 30, -0.12, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.ellipse(75, 57, 49, 28, 0.04, -0.2, Math.PI * 1.75); g.stroke();
    // why Mrs. Patel is at the water park: it is a class trip
    g.fillStyle = P.teal; g.fillRect(15, 272, 226, 36);
    g.fillStyle = P.paper; g.font = "bold 26px sans-serif"; for (let i = 0; i < 7; i++) g.fillRect(38 + i * 26, 282, 16, 16);
  });
}
function kitchen(b: SetBuilder) {
  room(b, "#d2ad48", false, { x: -.7, w: 2.15 });
  lamp(b, POOLS.kitchen!);
  windowView(b, -.7, 2.15, true); // What If ep01: morning window (was night)
  for (const x of [-2.75, -1.8, -0.85, 0.1, 1.05]) {
    if (x === -1.8 && prop(b, "stove", [x, 0, -2.98], 0.92)) continue;
    b.box([x, 0.44, -3], [0.91, 0.88, 0.8], P.teal, "wood");
    b.box([x, 0.92, -2.98], [0.95, 0.08, 0.88], P.trim);
    b.box([x, 0.65, -2.565], [0.3, 0.035, 0.035], P.metal);
  }
  b.box([-0.85, 0.965, -3.0], [0.66, 0.025, 0.48], P.metal);
  b.beam([-0.85, 0.97, -3.28], [-0.85, 1.2, -3.28], 0.045, P.metal);
  b.beam([-0.85, 1.2, -3.28], [-0.85, 1.2, -3.05], 0.045, P.metal);
  for (const x of [-2.7, 1.05]) { b.box([x, 1.95, -3.17], [0.95, 0.9, 0.5], P.teal, "wood"); b.box([x, 1.6, -2.89], [0.28, 0.03, 0.035], P.metal); }
  const { island: [x, , z], islandTop, fridge: [fx, , fz] } = SET_ART.kitchen;
  b.box([x, 0.44, z], [2.4, 0.88, 1.05], P.teal, "wood");
  b.box([x, islandTop - 0.05, z], [2.65, 0.1, 1.25], P.wood, "wood");
  for (const dx of [-0.76, 0, 0.76]) b.box([dx, 0.5, 0.535], [0.025, 0.62, 0.024], "#244d59");
  b.cylinder([0.4, islandTop + 0.1, -0.25], 0.085, 0.2, P.paper); // off the momClose sightline
  const handle = new THREE.TorusGeometry(0.06, 0.018, 6, 12);
  b.geo(handle, [0.51, islandTop + 0.1, -0.25], P.paper);
  b.cylinder([0.65, islandTop + 0.04, -0.17], 0.24, 0.08, P.yellow);
  b.box([fx, 1.07, fz], [1.08, 2.14, 0.8], "#dbe3d6");
  b.box([fx, 1.48, fz + 0.415], [0.99, 1.15, 0.035], P.paper);
  b.box([fx, 0.43, fz + 0.415], [0.99, 0.83, 0.035], P.paper);
  for (const y of [0.65, 1.2]) b.box([fx - 0.38, y, fz + 0.47], [0.045, 0.35, 0.06], P.metal);
  const poster = lam("owen.set.flyer", () => ({ map: flyer() }));
  b.batch.add(quad(V(fx - 0.29, 1.08, fz + 0.442), V(fx + 0.27, 1.08, fz + 0.442), V(fx + 0.27, 1.78, fz + 0.442), V(fx - 0.29, 1.78, fz + 0.442)), poster);
  for (const dx of [-0.22, 0.21]) b.cylinder([fx + dx, 1.8, fz + 0.46], 0.028, 0.025, P.red);
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
function outdoors(b: SetBuilder, paved: boolean) {
  const extent = SET_ART.groundSize / 2;
  const deck: Rect = paved ? [-12, -10.5, 12, 12.5] : [-10.5, -12, 12.5, 10];
  // Disjoint slabs: every walking surface is exactly y=0, without coplanar grass/paving.
  groundAround(b, [-extent, -extent, extent, extent], deck, P.green, "plain");
  if (paved) groundPatch(b, deck, "#a35f4a", "tile"); // red playground rubber: pale #b6b7a3 put the yard at lum .72, grey-teal #627d74 at sat .29
  for (let i = 0; i < 11; i++) tree(b, -27 + i * 5.1, -22 - (i % 3) * 3, 1.2 + (i % 3) * 0.2);
  for (let x = -28; x <= 28; x += 2) b.box([x, 0.65, -18], [0.12, 1.3, 0.12], P.teal);
  for (const y of [0.4, 1.05]) b.box([0, y, -18], [56, 0.08, 0.07], P.teal);
  for (const x of [-20, 19]) {
    b.box([x, 1.8, -29], [5, 3.6, 4], P.siding, "wood");
    b.geo(tri(V(-2.8, 0, 0), V(2.8, 0, 0), V(0, 1.65, 0)), [x, 3.6, -26.98], P.roof);
    for (const side of [-1, 1]) b.batch.add(quad(V(x, 5.25, -31.2), V(x + side * 2.8, 3.6, -31.2), V(x + side * 2.8, 3.6, -26.8), V(x, 5.25, -26.8)), material(P.roof));
    framed(b, x, 1, -26.94, 0.9, 2, P.teal);
  }
}
function schoolyard(b: SetBuilder) {
  outdoors(b, true);
  const z = SET_ART.schoolyard.schoolZ;
  b.box([0, 2.3, z - 1.5], [20, 4.6, 3], P.brick, "brick");
  b.box([0, 4.55, z + 0.04], [20.3, 0.18, 0.2], P.trim);
  for (const x of [-8, -4, 0, 7.5]) windowBack(b, x, z + 0.03, 2.2);
  framed(b, 4, 1.3, z + 0.04, 1.7, 2.6, P.teal);
  b.box([4, 1.3, z + 0.12], [0.06, 2.6, 0.04], P.trim);
  for (const x of [3.7, 4.3]) b.box([x, 1.2, z + 0.15], [0.04, 0.25, 0.045], P.yellow);
  // The public steps spot stays on grade; three shallow steps rise behind it to the entrance.
  for (let i = 0; i < 3; i++) b.box([4, (i + 1) * 0.065, -2.15 - i * 0.5], [2.5, (i + 1) * 0.13, 0.52], "#d7cdb6", "tile");
  const [bx, , bz] = SET_ART.schoolyard.bench;
  for (let i = 0; i < 4; i++) b.box([bx, 0.46, bz - 0.21 + i * 0.14], [2.2, 0.07, 0.12], P.wood, "wood");
  for (const y of [0.76, 0.96]) b.box([bx, y, bz - 0.3], [2.2, 0.15, 0.07], P.wood, "wood");
  for (const x of [bx - 0.85, bx + 0.85]) { b.box([x, 0.24, bz], [0.08, 0.48, 0.5], P.metal); b.box([x, 0.67, bz - 0.32], [0.07, 0.65, 0.07], P.metal); }
  framed(b, -7.1, 1.14, z + 0.08, 1.25, 2.25, P.teal);
  table(b, [-7.1, 0, -3.25], 0.8, 0.44, 0.72, P.blue);
  b.box([-7.1, 0.75, -3.25], [0.52, 0.045, 0.34], P.yellow);
  for (const x of [-7.25, -7.06, -6.91]) b.box([x, 0.778, -3.25], [0.1, 0.016, 0.23], P.paper);
  b.box([0, 0.008, 4.5], [6, 0.016, 7], "#477d83");
  for (const x of [-3, 3]) b.box([x, 0.019, 4.5], [0.06, 0.014, 7], P.paper);
  for (const zz of [1, 4.5, 8]) b.box([0, 0.019, zz], [6, 0.014, 0.06], P.paper);
  const ring = new THREE.RingGeometry(0.62, 0.67, 32); ring.rotateX(-Math.PI / 2);
  b.geo(ring, [0, 0.03, 4.5], P.paper);
  b.geo(new THREE.IcosahedronGeometry(0.15, 1), [2.35, 0.16, 5.2], P.red);
  tree(b, -11, -1, 1.1); tree(b, 11, -1, 1.3);
}
function waterpark(b: SetBuilder) {
  outdoors(b, false);
  const { pool: [px, , pz], poolSize: [pw, , pd], umbrella: [ux, , uz], umbrellaRadius: radius, canopyHeight, chairs } = SET_ART.waterpark;
  groundAround(b, [-10.5, -12, 12.5, 10], [px - pw / 2, pz - pd / 2, px + pw / 2, pz + pd / 2], "#947354", "tile"); // warm deck, not P.cream (lum .65)
  // Recessed basin: water below grade, walkable deck and spots remain y=0.
  b.box([px, -0.05, pz], [pw, 0.06, pd], P.pool);
  for (const dx of [-pw / 2, pw / 2]) b.box([px + dx, 0.035, pz], [0.2, 0.07, pd + 0.2], P.paper, "tile");
  for (const dz of [-pd / 2, pd / 2]) b.box([px, 0.035, pz + dz], [pw, 0.07, 0.2], P.paper, "tile");
  for (let i = 0; i < 18; i++) b.box([px - 4.3 + (i % 6) * 1.6, -0.015, pz - 2.6 + Math.floor(i / 6) * 2.2], [0.65, 0.005, 0.035], "#b1e6dc", "plain", (i % 3) * 0.12);
  for (const x of chairs) {
    b.box([x, 0.4, 0.65], [0.72, 0.1, 1.5], P.paper, "cloth");
    // low side rails on legs: solid 0.62 m slabs hid the seated characters in the closing two-shot
    for (const dx of [-0.4, 0.4]) {
      b.box([x + dx, 0.38, 0.65], [0.07, 0.08, 1.65], P.teal);
      for (const dz of [-0.1, 1.4]) b.box([x + dx, 0.19, dz], [0.07, 0.38, 0.07], P.teal);
    }
    // Tilted, chunky backrest; shallow enough to read behind a character card.
    b.beam([x - 0.36, 0.45, -0.05], [x - 0.36, 1.03, -0.65], 0.07, P.teal);
    b.beam([x + 0.36, 0.45, -0.05], [x + 0.36, 1.03, -0.65], 0.07, P.teal);
    b.batch.add(quad(V(x - 0.33, 0.45, 0), V(x + 0.33, 0.45, 0), V(x + 0.33, 1.03, -0.65), V(x - 0.33, 1.03, -0.65)), material(P.paper, "cloth"));
    b.box([x, 0.46, 0.8], [0.55, 0.025, 0.65], "#83b9bc", "cloth");
  }
  b.cylinder([ux, canopyHeight / 2, uz], 0.045, canopyHeight, P.roof);
  const segments = 12;
  for (let i = 0; i < segments; i++) {
    const a = i * Math.PI * 2 / segments, c = (i + 1) * Math.PI * 2 / segments;
    const edgeA = V(ux + Math.cos(a) * radius, canopyHeight - 0.55, uz + Math.sin(a) * radius);
    const edgeB = V(ux + Math.cos(c) * radius, canopyHeight - 0.55, uz + Math.sin(c) * radius);
    const peak = V(ux, canopyHeight, uz), color = i % 2 ? P.paper : P.red;
    b.batch.add(tri(peak, edgeB, edgeA), material(color));
    b.batch.add(tri(peak, edgeA, edgeB), material(color)); // underside must cast shade and read from low cameras
    b.batch.add(quad(edgeB, edgeA, edgeA.clone().add(V(0, -0.16, 0)), edgeB.clone().add(V(0, -0.16, 0))), material(color));
  }
  // Raised slide tower behind the pool, with a segmented open flume into the water.
  table(b, [SLIDE_X, 0, -9.8], 2, 1.8, 3.1, P.red);
  for (const x of [SLIDE_X - 0.95, SLIDE_X + 0.95]) {
    b.beam([x, 0, -10.9], [x, 3.7, -10.9], 0.09, P.teal);
    b.beam([x, 3.7, -10.9], [x, 3.7, -9.1], 0.07, P.teal);
  }
  b.beam([SLIDE_X - 0.95, 3.7, -10.9], [SLIDE_X + 0.95, 3.7, -10.9], 0.07, P.teal);
  for (const x of [SLIDE_X - 0.45, SLIDE_X + 0.45]) b.beam([x, 0, -12.1], [x, 3.1, -10.5], 0.07, P.teal);
  for (let i = 0; i < 10; i++) b.beam([SLIDE_X - 0.45, i * 0.31, -12.1 + i * 0.16], [SLIDE_X + 0.45, i * 0.31, -12.1 + i * 0.16], 0.07, P.yellow);
  const path = SLIDE_PATH;
  for (let i = 0; i < path.length - 1; i++) {
    const [x, y, z] = path[i], [nx, ny, nz] = path[i + 1];
    b.batch.add(quad(V(x + 0.52, y, z), V(x - 0.52, y, z), V(nx - 0.52, ny, nz), V(nx + 0.52, ny, nz)), material(P.yellow));
    // Thick side rails and an underside keep the flume visible from any shot.
    for (const side of [-1, 1]) b.beam([x + side * 0.56, y + 0.14, z], [nx + side * 0.56, ny + 0.14, nz], 0.18, P.red);
    b.beam([x, y - 0.08, z], [nx, ny - 0.08, nz], 0.16, P.yellow);
  }
  for (const z of [-8, -6.5]) b.box([SLIDE_X, 0.65, z], [0.13, 1.3, 0.13], P.teal);
  tree(b, -7, -8, 1.2); tree(b, 11, -10, 1.1);
}

// ---------------- ep02 "Cold Front" ----------------
/** a painted sign: bold text on a coloured card (canvas texture) facing +z, turned by rot */
function sign(b: SetBuilder, key: string, [x, y, z]: V3, w: number, h: number, bg: string, fg: string, text: string | ((g: CanvasRenderingContext2D, W: number) => void), rot = 0) {
  const tex = ctex(`owen.sign.${key}`, Math.round(256 * w / h), 256, (g) => {
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
    lam(`owen.sign.${key}`, () => ({ map: tex })));
}
/** three ice cubes with a shine, on a sign canvas 256 high */
const iceCubes = (g: CanvasRenderingContext2D, W: number) => {
  for (let i = 0; i < 3; i++) {
    const x = W / 2 + (i - 1) * 150, y = 128 + (i % 2) * 14, s = 62;
    g.save(); g.translate(x, y); g.rotate((i - 1) * 0.15);
    g.fillStyle = "#e4f6ff"; g.strokeStyle = "#1f1a2c"; g.lineWidth = 9; g.beginPath(); g.roundRect(-s, -s, 2 * s, 2 * s, 18); g.fill(); g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(-s * 0.6, -s * 0.6); g.lineTo(-s * 0.1, -s * 0.6); g.lineTo(-s * 0.6, -s * 0.1); g.fill(); g.restore();
  }
};
/** a bag of ice: frosted blue-white sack with a blue band */
function iceBag(b: SetBuilder, [x, y, z]: V3, rot = 0, band = true) {
  b.box([x, y + 0.13, z], [0.34, 0.26, 0.2], "#cfe8f8", "plain", rot);
  if (band) b.box([x, y + 0.13, z + 0.002], [0.35, 0.07, 0.205], "#3d8fd1", "plain", rot); // thin bands ink as dots at range (look_qa, store wide)
}
function store(b: SetBuilder) {
  room(b, "#8fc7b9", false, { x: -2.3, w: 1.6 });
  windowView(b, -2.3, 1.6, true);
  // shelves of colourful goods behind the counter
  for (const x of [-0.2, 1.6]) {
    b.box([x, 1.0, -3.2], [1.6, 2.0, 0.4], P.teal, "wood");
    for (const y of [0.45, 0.95, 1.45]) for (let i = 0; i < 6; i++) b.box([x - 0.62 + i * 0.25, y + 0.14, -2.98], [0.25, 0.28 + (i % 2) * 0.06, 0.16], DRESS.colors[(i + Math.round(y * 2)) % 5]);
  }
  // counter + register
  const cz = -1.25;
  b.box([0.3, 0.47, cz], [2.6, 0.94, 0.6], P.red, "wood");
  b.box([0.3, 0.97, cz], [2.75, 0.07, 0.72], P.wood, "wood");
  b.box([-1.25, 1.12, cz - 0.1], [0.42, 0.24, 0.34], P.metal);
  b.box([-1.25, 1.33, cz - 0.2], [0.34, 0.2, 0.06], "#2b2f3a");
  // the ice: a tall stack on the counter end + the ice freezer
  for (let i = 0; i < 9; i++) iceBag(b, [0.85 + (i % 3) * 0.36, 1.0 + Math.floor(i / 3) * 0.26, cz + ((i % 2) - 0.5) * 0.1], (i % 3 - 1) * 0.08, false);
  sign(b, "icestack", [1.21, 1.92, cz - 0.05], 1.0, 0.36, "#3d8fd1", "#ffffff", iceCubes); // a picture, not the word (user)
  b.box([-2.9, 0.45, -1.1], [1.3, 0.9, 0.8], "#e9f4f8");
  b.box([-2.9, 0.92, -1.1], [1.34, 0.06, 0.84], P.blue);
  sign(b, "ice", [-2.9, 0.55, -0.68], 0.8, 0.36, "#3d8fd1", "#ffffff", iceCubes);
  sign(b, "open", [-2.3, 2.45, -3.33], 0.7, 0.3, P.yellow, P.red, "OPEN");
  plant(b, 3.3, -2.6, 0, 1.1);
  for (let i = 0; i < 5; i++) b.box([3.4, 0.5 + i * 0.32, -0.6], [0.5, 0.28, 1.4], DRESS.colors[i], "cloth");
}
/** a lemonade stand: table with a striped skirt, a price sign on the front, posts and a striped roof */
function stand(b: SetBuilder, x: number, z: number, top: string, price: string, key: string) {
  b.box([x, 0.3, z], [1.5, 0.6, 0.62], top, "wood");
  b.box([x, 0.62, z], [1.62, 0.05, 0.72], P.trim, "wood");
  for (let i = 0; i < 6; i++) b.box([x - 0.625 + i * 0.25, 0.3, z + 0.315], [0.25, 0.56, 0.012], i % 2 ? P.paper : top);
  sign(b, `price.${key}`, [x, 0.33, z + 0.34], 0.62, 0.36, P.paper, P.red, price);
  for (const dx of [-0.72, 0.72]) { b.beam([x + dx, 0, z - 0.95], [x + dx, 2.0, z - 0.95], 0.06, P.wood); b.beam([x + dx, 2.0, z - 0.95], [x + dx, 2.0, z - 0.45], 0.05, P.wood); }
  for (let i = 0; i < 6; i++) b.box([x - 0.75 + i * 0.3, 2.03, z - 0.7], [0.3, 0.07, 0.6], i % 2 ? P.paper : top);
  sign(b, `lem.${key}`, [x, 1.8, z - 0.93], 1.25, 0.3, P.yellow, "#1f1a2c", "LEMONADE");
}
function street(b: SetBuilder) {
  const ext = SET_ART.groundSize / 2;
  groundAround(b, [-ext, -ext, ext, ext], [-24, -5, 24, 9], P.green, "plain");
  groundPatch(b, [-24, -5, 24, 0.9], "#c9b79a", "tile"); // sidewalk
  groundPatch(b, [-24, 0.9, 24, 9], "#5d6382", "plain"); // road
  for (let x = -22; x < 24; x += 3) b.box([x, 0.008, 5], [1.4, 0.016, 0.12], P.yellow);
  b.box([0, 0.08, 0.95], [48, 0.16, 0.16], "#a69a85");
  // Main Street storefronts
  const fronts = ["#c96b55", "#e2b04e", "#5b8eaa", "#83ad69", "#b9748f", "#d58a4b", "#6f9f9a", "#c25a5a"];
  for (let i = 0; i < 8; i++) {
    const x = -21 + i * 6, h = 4.2 + (i % 3) * 0.9, col = fronts[i];
    b.box([x, h / 2, -6.5], [5.9, h, 4], col, i % 2 ? "brick" : "wood");
    b.box([x, h + 0.1, -4.45], [6, 0.2, 0.2], P.trim);
    framed(b, x - 1.3, 1.3, -4.46, 1.6, 1.5, "#9cc3d6");
    framed(b, x + 1.35, 1.1, -4.46, 0.95, 2.2, P.teal);
    for (const wx of [-1.5, 0, 1.5]) framed(b, x + wx, h - 1.1, -4.46, 0.8, 0.9, "#9cc3d6");
    for (let k = 0; k < 6; k++) b.box([x - 1.3 - 0.75 + k * 0.3, 2.35, -4.1], [0.3, 0.06, 0.7], k % 2 ? P.paper : fronts[(i + 3) % 8]); // awning
  }
  // bank front with the big thermometer (fx draws the reading), a bulletin board with the 5K poster
  b.box([-8.3, 3.1, -4.47], [1.1, 2.2, 0.06], P.trim);
  b.box([3.3, 1.5, -3.32], [1.0, 1.25, 0.08], "#9a6a3c");
  b.beam([3.3, 0, -3.36], [3.3, 0.9, -3.36], 0.08, P.metal);
  sign(b, "5k", [3.3, 1.5, -3.27], 0.8, 1.0, P.paper, P.red, "5K\nFINISH\nMAIN ST\n10 AM");
  // three stands: two cheap ones (yellow) and Owen's (blue)
  stand(b, -6.6, -1.55, P.yellow, "50¢", "r2");
  stand(b, -3.4, -1.55, P.yellow, "50¢", "r1");
  stand(b, 0, -1.55, P.blue, "$2", "owen");
  // coolers on crates beside the stands (on the table they hid the sellers' faces)
  for (const [x, col] of [[-1.15, "#3d8fd1"], [-2.3, P.red], [-5.5, P.red]] as [number, string][]) {
    b.box([x, 0.15, -1.55], [0.5, 0.3, 0.4], P.wood, "wood");
    b.box([x, 0.46, -1.55], [0.48, 0.32, 0.36], col); b.box([x, 0.645, -1.55], [0.51, 0.05, 0.39], P.paper);
  }
  // finish arch across the road
  for (const z of [1.2, 8.6]) b.beam([7, 0, z], [7, 3.6, z], 0.18, P.red);
  b.box([7, 3.55, 4.9], [0.2, 0.75, 7.6], P.red);
  sign(b, "finish", [7.12, 3.55, 4.9], 5.6, 0.62, P.red, "#ffffff", "FINISH  ★  FINISH", Math.PI / 2); // read from any part of the span
  sign(b, "finish2", [6.88, 3.55, 4.9], 5.6, 0.62, P.red, "#ffffff", "FINISH  ★  FINISH", -Math.PI / 2);
  for (let i = 0; i < 6; i++) b.box([4 + i * 0.5, 0.45, 1.25], [0.12, 0.9, 0.12], P.metal);
  b.box([5.25, 0.85, 1.25], [2.6, 0.08, 0.05], P.metal);
  // street furniture
  for (const x of [-12, 5.3, 15.5]) { b.beam([x, 0, -0.4], [x, 3.3, -0.4], 0.09, "#2f3e4f"); b.box([x, 3.35, -0.25], [0.3, 0.18, 0.5], "#2f3e4f"); }
  for (const x of [-10.5, 2.0, 9.5]) { b.box([x, 0.3, -3.6], [0.9, 0.6, 0.9], P.brick, "brick"); plant(b, x, -3.6, 0.6, 0.9); }
  bunting(b, -12, 3.9, -4.2, 40, 0.6);
  tree(b, -16, -3.4, 0.9); tree(b, 15, -3.4, 0.9);
}
function garage(b: SetBuilder) {
  const { wallHeight: h, back: z } = SET_ART, wall = "#5f9ec0";
  b.box([0, -0.09, 0.5], [8, 0.18, 8], "#a8714f", "tile");
  for (const x of [-4, 4]) b.box([x, h / 2, 0.5], [0.14, h, 8], wall, "brick");
  b.box([-2.75, h / 2, z], [2.5, h, 0.14], wall, "brick");
  b.box([2.75, h / 2, z], [2.5, h, 0.14], wall, "brick");
  b.box([0, 2.55, z], [3.0, 0.3, 0.14], wall, "brick");
  for (const x of [-1.52, 1.52]) b.box([x, 1.2, z + 0.06], [0.08, 2.4, 0.2], P.trim);
  b.box([0, 2.42, z + 0.06], [3.1, 0.08, 0.2], P.trim);
  // outside the door: driveway, lawn, the house across the street (bright day: the light Mom lets in)
  b.box([0, -0.06, -8], [3.4, 0.12, 9], "#8f8478", "tile");
  b.box([0, -0.07, -10], [30, 0.1, 14], P.green);
  b.box([0, 1.8, -17], [9, 3.6, 3], P.brick, "brick");
  for (const x of [-2.5, 2.5]) framed(b, x, 2, -15.45, 1.2, 1.1, "#9cc3d6");
  tree(b, -6, -14, 1); tree(b, 6.5, -13, 0.9);
  // workbench (where the food goes) + shelves, a bike, boxes
  const top = SET_ART.garage.benchTop;
  table(b, [2.6, 0, -2.85], 1.9, 0.7, top, P.wood);
  b.box([2.6, 1.7, -3.38], [1.9, 1.0, 0.04], "#9a6a3c", "wood"); // pegboard
  for (let i = 0; i < 5; i++) b.beam([1.9 + i * 0.35, 1.55, -3.33], [1.9 + i * 0.35, 1.85, -3.3], 0.03, DRESS.colors[i]);
  for (const y of [0.4, 1.1, 1.8]) b.box([-2.9, y, -3.15], [1.6, 0.06, 0.5], P.metal);
  for (const y of [0.4, 1.1, 1.8]) for (let i = 0; i < 3; i++) b.box([-3.4 + i * 0.5, y + 0.2, -3.15], [0.45, 0.34, 0.42], i % 2 ? "#c8a46a" : "#b58b56");
  for (const dx of [-0.35, 0.35]) b.geo(new THREE.TorusGeometry(0.3, 0.04, 6, 18), [-3.5 + dx, 0.32, -1.2], P.metal);
  b.beam([-3.85, 0.32, -1.2], [-3.5, 0.7, -1.2], 0.05, P.red); b.beam([-3.5, 0.7, -1.2], [-3.15, 0.32, -1.2], 0.05, P.red);
  b.box([0, 0.006, -1], [2.6, 0.012, 3.6], "#7d5a45"); // parking pad
  lamp(b, [0, 2.3, -0.8]);
}


// ---------------- What If ep01 sets ----------------
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

// Set dressing remains static and local: the story owns all acting and timing.
const DRESS = { colors: [P.red, P.blue, P.yellow, P.teal, "#8c639c"], shelfX: -3.15, backZ: -3.18 };
function ball(b: SetBuilder, p: V3, r: number, col: string) { b.geo(new THREE.SphereGeometry(r, 12, 8), p, col); }
function books(b: SetBuilder, x: number, y: number, z: number, n = 7) {
  for (let i = 0; i < n; i++) {
    // books touch (2.5 cm gaps broke their ink into lone dots at range)
    b.box([x + i * .11, y + .14 + (i % 3) * .025, z], [.108, .28 + (i % 3) * .05, .2], DRESS.colors[i % 5]);
    b.box([x + i * .11, y + .12, z + .105], [.055, .018, .008], P.paper);
  }
}
function bookcase(b: SetBuilder, x: number, z: number, kit = true) {
  // the model's own dark woods / covers read as a black block in our rooms: palette woods, saturated covers.
  // kit = false: its ~100 tiny books add lone ink dots; the classroom wide shot is at the look_qa limit already
  if (kit && prop(b, "bookcase_books", [x, 0, z], 1.7, 0, { DarkWood: P.teal, Wood1: P.wood, Wood2: "#d1a56c", Metal: P.metal, Pages: P.paper,
    Cover1: P.red, Cover2: P.yellow, Cover3: P.blue, Cover4: "#8c639c", Cover5: P.green, Cover6: "#e58a9a" })) return;
  b.box([x, .85, z], [1, 1.7, .36], P.teal, "wood");
  for (const y of [.15, .68, 1.2]) {
    b.box([x, y + .21, z + .18], [.86, .43, .035], P.roof);
    b.box([x, y, z + .1], [1.04, .07, .46], P.wood, "wood"); books(b, x - .35, y + .035, z + .22);
  }
}
function plant(b: SetBuilder, x: number, z: number, y = 0, scale = 1) {
  if (prop(b, scale > 1.5 ? "palm" : "houseplant", [x, y, z], scale > 1.5 ? 2.2 * scale : .75 * scale, x)) return;
  b.cylinder([x, y + .18 * scale, z], .21 * scale, .36 * scale, P.red);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    b.beam([x, y + .3 * scale, z], [x + Math.cos(a) * .25 * scale, y + .72 * scale, z + Math.sin(a) * .2 * scale], .035, P.green);
    ball(b, [x + Math.cos(a) * .23 * scale, y + .65 * scale, z + Math.sin(a) * .2 * scale], .16 * scale, i % 2 ? P.foliage : P.green);
  }
}
function backpack(b: SetBuilder, x: number, y: number, z: number, col = P.blue) {
  b.box([x, y + .25, z], [.35, .5, .2], col);
  b.box([x, y + .16, z + .12], [.27, .2, .09], P.yellow);
  b.geo(new THREE.TorusGeometry(.08, .02, 6, 12), [x, y + .51, z], P.metal);
}
function bunting(b: SetBuilder, x: number, y: number, z: number, n: number, spacing = .3) {
  // painted detail (no ink): a 2.5 cm string and zero-thickness flags inked as dotted lines (look_qa)
  const g = new THREE.BoxGeometry(n * spacing, .025, .025); b.flat.add(g, material(P.trim), new THREE.Matrix4().makeTranslation(x + n * spacing / 2, y, z)); g.dispose();
  for (let i = 0; i < n; i++) b.flat.add(tri(V(x + i * spacing, y, z), V(x + i * spacing + spacing * .8, y, z), V(x + i * spacing + spacing * .4, y - .25, z)), material(DRESS.colors[i % 5]));
}
function dressing(b: SetBuilder, id: SetId) {
  round3Dressing(b, id);
  if (id === "bedroom") {
    bookcase(b, -3.25, -1.9);
    b.box([-3.3, .22, 1.8], [.75, .44, .65], P.blue);
    for (let i = 0; i < 4; i++) ball(b, [-3.5 + i * .14, .5, 1.8], .13, DRESS.colors[i]);
    backpack(b, -2.2, 0, 1.9); // was 2.9,-2.45: in the door shot foreground
    for (const x of [1.6, 1.9]) { b.box([x, .1, 1.7], [.22, .2, .44], P.blue); b.box([x, .055, 1.75], [.24, .07, .45], P.paper); }
    for (let i = 0; i < 4; i++) b.box([-3.35 + i * .12, .06 + i * .04, .8], [.48, .11, .4], DRESS.colors[i], "cloth", i * .4);
    table(b, [-3.45, 0, -2.7], .65, .65, .74); b.cylinder([-3.45, .83, -2.7], .11, .18, P.yellow);
    windowView(b, -.05, .95, false);
    for (const x of [-.65, .55]) for (let i = 0; i < 3; i++) b.box([x + i * .065, 1.65, -3.12], [.09, 1.45, .12], P.blue, "cloth");
    framed(b, -2.8, 2.1, -3.32, .65, .7, P.blue);
    b.geo(new THREE.ConeGeometry(.12, .4, 12), [-2.8, 2.13, -3.2], P.paper); ball(b, [-2.8, 2.13, -3.08], .045, P.teal);
  } else if (id === "classroom") {
    bookcase(b, -3.2, -2.6, false); plant(b, 3.35, -.2);
    ball(b, [-.73, .95, -1.65], .11, P.red);
    b.cylinder([-1.0, .9, -1.9], .12, .08, P.yellow); ball(b, [-1.0, 1.13, -1.9], .19, P.blue); // globe on the far desk end: at .85 a blue slab over Patel (s6 / s10), at -.4 a halo behind Owen's head (s6)
    b.beam([.85, .92, -1.8], [.85, 1.2, -1.8], .035, P.metal);
    for (const z of SET_ART.classroom.rows) for (const x of SET_ART.classroom.columns) b.box([x + .15, .7, z], [.28, .055, .35], P.red);
    framed(b, 2, 1.85, -3.3, .9, 1, P.roof);
    for (let i = 0; i < 6; i++) b.box([1.73 + (i % 2) * .4, 1.55 + Math.floor(i / 2) * .27, -3.2], [.26, .2, .012], DRESS.colors[i % 5]);
    bunting(b, -1.8, 2.55, -3.12, 12);
    for (let i = 0; i < 3; i++) { b.box([2.7 + i * .4, .25, -2.55], [.37, .5, .4], P.wood); backpack(b, 2.7 + i * .4, .1, -2.3, DRESS.colors[i]); }
    for (let i = 0; i < 8; i++) b.box([-3.79, 1.1 + i * .15, -1], [.04, .055, 2.15], P.trim);
    b.cylinder([-3.4, .25, .2], .23, .5, P.metal);
    b.geo(new THREE.CircleGeometry(.21, 24), [2.1, 2.45, -3.17], P.paper);
    b.beam([2.1, 2.45, -3.15], [2.1, 2.59, -3.15], .018, P.metal);
    b.beam([2.1, 2.45, -3.15], [2.22, 2.45, -3.15], .018, P.metal);
  } else if (id === "kitchen") {
    // Checker floor is painted detail, with no ink or raised walking surface.
    for (let x = -4; x < 4; x++) for (let z = -3; z < 4; z++) b.box([x + .5, .006, z + .5], [.98, .012, .98], (x + z) % 2 ? "#827b53" : "#bbb083", "tile");
    for (let x = -3; x < 2; x++) b.box([x + .25, 1.23, -3.36], [.96, .5, .035], P.blue, "tile");
    prop(b, "toaster", [-2.75, .96, -2.95], .22);
    prop(b, "microwave", [1.05, .96, -3.0], .3);
    prop(b, "houseplant", [-3.25, .96, -2.95], .4);
    ball(b, [.8, 1.13, -2.95], .18, P.red); b.cylinder([.8, 1.32, -2.95], .07, .04, P.metal);
    b.geo(new THREE.TorusGeometry(.12, .025, 6, 12), [.99, 1.15, -2.95], P.metal);
    b.box([1.45, 1.08, -2.95], [.22, .25, .23], P.wood, "wood");
    for (let i = 0; i < 3; i++) b.box([1.38 + i * .07, 1.32, -2.95], [.035, .25, .07], P.metal);
    b.box([-.05, .98, -2.85], [.42, .035, .35], P.wood, "wood");
    b.cylinder([-.45, 1.02, -2.8], .2, .09, P.yellow);
    for (let i = 0; i < 4; i++) ball(b, [-.55 + (i % 2) * .15, 1.11, -2.8 + Math.floor(i / 2) * .12], .1, i % 2 ? P.red : P.green);
    for (const x of [-1.5, 1.55]) { b.cylinder([x, .64, .35], .25, .1, P.red); for (const dx of [-.16, .16]) b.beam([x + dx, 0, .35], [x + dx, .62, .35], .06, P.wood); }
    b.box([-1.4, 1.0, -2.95], [.4, .12, .32], P.metal);
    for (let i = 0; i < 4; i++) b.cylinder([-1.55 + i * .1, 1.1, -2.95], .11, .035, P.paper);
    b.box([1.85, 1.65, -3.3], [.18, .45, .12], P.red);
    b.box([2.95, .6, -2.72], [.3, .4, .008], P.blue);
    for (let i = 0; i < 3; i++) ball(b, [2.82 + i * .13, .88, -2.7], .04, DRESS.colors[i]);
  } else if (id === "schoolyard") {
    b.box([0, 4.72, -4], [20.5, .16, .3], P.roof, "wood");
    for (const x of [-9.8, 9.8]) b.beam([x, .2, -3.8], [x, 4.6, -3.8], .1, P.metal);
    b.beam([0, 0, .7], [0, 3.1, .7], .12, P.metal);
    b.box([0, 3, .6], [1.2, .8, .09], P.paper);
    const hoop = new THREE.TorusGeometry(.28, .035, 6, 20); hoop.rotateX(Math.PI / 2); b.geo(hoop, [0, 2.7, 1.05], P.red);
    // x = +-9: at -6 the planter stood 0.7 m in front of the bench camera (shot 14) and filled its lower fifth
    for (const x of [-9, 9]) { b.cylinder([x, .4, -2.7], .3, .8, P.teal); plant(b, x + .7, -2.7, 0, .8); }
    for (let i = 0; i < 3; i++) {
      const x = 5.6 + i * .7, z = -2.3;
      for (const dx of [-.3, .3]) { const wheel = new THREE.TorusGeometry(.25, .045, 6, 16); b.geo(wheel, [x + dx, .28, z], P.metal); }
      b.beam([x - .3, .28, z], [x, .7, z], .05, DRESS.colors[i]); b.beam([x, .7, z], [x + .3, .28, z], .05, DRESS.colors[i]);
      b.beam([x - .3, .28, z], [x + .3, .28, z], .05, DRESS.colors[i]); b.box([x, .74, z], [.23, .06, .12], P.roof);
    }
    for (let i = 0; i < 5; i++) b.beam([5.2 + i * .65, .05, -1.8], [5.2 + i * .65, .7, -1.8], .05, P.metal);
    for (let i = 0; i < 6; i++) b.box([4.4 + (i % 2) * .48, .012, 2 + Math.floor(i / 2) * .5], [.44, .024, .45], DRESS.colors[i % 5]);
    b.box([-7, .65, -12], [4.4, 1.3, 1.8], P.yellow); b.box([-7.5, 1.7, -12], [3.3, 1, 1.8], P.yellow);
    for (let i = 0; i < 5; i++) b.box([-8.8 + i * .65, 1.75, -11.08], [.5, .55, .04], P.blue);
    for (const x of [-8.4, -5.6]) ball(b, [x, .4, -11.05], .4, P.metal);
  } else if (id === "waterpark") {
    // Kiosk and lifeguard station form separate mid/background layers.
    b.box([-4.7, 1.05, -7.5], [2.5, 2.1, 1.6], P.teal, "wood");
    framed(b, -4.7, 1.35, -6.65, 1.9, .9, P.roof);
    b.box([-4.7, .9, -6.45], [2.8, .12, .6], P.yellow, "wood");
    for (let i = 0; i < 8; i++) b.box([-5.88 + i * .34, 2.2, -6.55], [.34, .12, 1.2], i % 2 ? P.paper : P.red);
    for (let i = 0; i < 4; i++) b.cylinder([-5.3 + i * .35, 1.05, -6.45], .08, .2, DRESS.colors[i]);
    table(b, [9, 0, -6], .9, .8, 1.7, P.paper); chair(b, 9, -6);
    for (let i = 0; i < 5; i++) b.beam([8.6, .2 + i * .3, -5.1], [9.4, .2 + i * .3, -5.1], .06, P.teal);
    for (const x of [8.6, 9.4]) b.beam([x, 0, -4.9], [x, 1.7, -5.9], .06, P.teal);
    for (const x of [-2.05, -1.5]) { b.beam([x, -.3, -4], [x, .8, -4], .055, P.metal); b.beam([x, .8, -4], [x, .8, -3.5], .055, P.metal); }
    for (let i = 0; i < 4; i++) b.beam([-2.05, i * .18, -4], [-1.5, i * .18, -4], .04, P.metal);
    const ring = new THREE.TorusGeometry(.4, .12, 8, 24); ring.rotateX(Math.PI / 2); b.geo(ring, [5, .15, -3.5], P.red);
    b.box([-2.7, .22, 1], [.65, .44, .46], P.blue); b.box([-2.7, .45, 1], [.69, .08, .5], P.paper);
    plant(b, -5.7, -4.5, 0, 2.3); plant(b, 10, -9, 0, 2.5);
    bunting(b, -6.2, 3, -10, 24, .5);
    b.cylinder([-3.5, .3, -1], .26, .6, P.teal);
    prop(b, "duck", [4.6, -0.03, -3.9], .45, .7); prop(b, "duck", [0.4, -0.03, -6.6], .3, -.4);
  }
}

function round3Dressing(b: SetBuilder, id: SetId) {
  if (id === "bedroom") {
    wainscot(b, "#b99d5c");
    // Toys, books and pinned plans sit behind actors, above furniture height.
    for (const x of [-.9, 1.55]) {
      b.box([x, 1.35, -3.12], [1.05, .10, .34], P.teal, "wood");
      for (let i = 0; i < 4; i++) b.box([x - .36 + i * .23, 1.52, -3.11], [.225, .25 + (i % 2) * .08, .19], ROUND3.shelf.toys[i]); // touching: 7 cm gaps inked as lone dots
    }
    wallNotes(b, .63, 1.42, -3.24, 5, 1, .23);
    wallNotes(b, .66, 2.24, -3.24, 5, 1, .23);
    bunting(b, -1.45, 2.53, -3.18, 9, .36);
    prop(b, "duck", [-1.25, 1.4, -3.08], .22);
    // (no desk plant: it stood in front of Mom in the door shot, 27 % foreground)
    for (const x of [.1, .42]) { b.box([x, .09, -2.55], [.23, .18, .43], P.blue); b.box([x, .035, -2.5], [.25, .06, .46], P.paper); }
    for (let i = 0; i < 3; i++) b.box([-2.95 + i * .15, .07 + i * .06, 1.55], [.55, .12, .4], ROUND3.notes[i], "cloth", i * .3); // laundry: at x 2.75 it filled 27 % of the door shot (5)
    framed(b, -1, 1.61, -3.32, .55, .48, P.red);
  } else if (id === "classroom") {
    wainscot(b, "#689b85");
    // A low strip of teaching shapes behind the teacher remains visible in the tight reverse angle.
    b.box([0, 1.02, -3.25], [3.7, .16, .018], P.yellow);
    wallNotes(b, -1.65, 1.02, -3.23, 12, 1, .3);
    wallNotes(b, -1.5, 2.18, -3.22, 10, 1, .32);
    prop(b, "bookcase_books", [2.9, 0, .5], 1.25, -Math.PI / 2);
    prop(b, "houseplant", [-2.1, .67, 1], .45);
    for (let i = 0; i < 4; i++) b.box([-.3 + i * .17, .85, -1.9], [.13, .06, .25], ROUND3.notes[i]);
  } else if (id === "kitchen") {
    wainscot(b, "#c3a04b");
    wallNotes(b, 2.38, .42, -2.70, 3, 2, .23);
    wallNotes(b, 2.34, 1.94, -2.70, 3, 1, .26);
    framed(b, -1.85, 1.75, -3.31, .63, .68, P.paper);
    wallNotes(b, -2.04, 1.55, -3.24, 3, 3, .19);
    b.box([1.87, 1.66, -3.18], [.3, .5, .16], P.red);
    b.box([1.87, 1.68, -3.06], [.16, .32, .07], P.paper);
    b.box([.2, 1.95, -3.13], [.78, .09, .35], P.wood, "wood");
    for (let i = 0; i < 4; i++) b.cylinder([-.08 + i * .19, 2.1, -3.08], .093, .2, ROUND3.notes[i]); // jars touch
    prop(b, "houseplant", [-1.65, .96, -3], .4);
    b.box([.18, 1.01, -2.94], [.46, .08, .37], P.metal);
    for (let i = 0; i < 3; i++) b.box([.03 + i * .13, 1.12, -2.94], [.125, .19, .28], P.paper);
  } else if (id === "waterpark") {
    // Repeated mid-distance concessions and pool gear fall behind the seated two-shot, never in its sightline.
    // 4 m further back than first built: at ~15 m from shot 24 they took only 12 % haze (staging_qa wants 15 %)
    b.box([-.9, .6, -15.5], [2.7, 1.2, 1.2], P.teal, "wood");
    for (let i = 0; i < 7; i++) b.box([-2.1 + i * .4, 2.2, -15.1], [.4, .12, 1.8], i % 2 ? P.paper : P.red);
    for (const x of [-2.25, .45]) b.beam([x, .6, -15.1], [x, 2.2, -15.1], .09, P.teal);
    for (let i = 0; i < 6; i++) b.cylinder([-1.95 + i * .4, 1.35, -14.85], .13, .3, ROUND3.notes[i]);
    for (const x of [-3, 5.4]) prop(b, "palm", [x, 0, -16.8], 4.2);
    bunting(b, -2.7, 2.9, -16, 14, .4);
    for (let i = 0; i < 3; i++) {
      b.box([-.8 + i * .65, .16, -2.15], [.55, .32, .4], ROUND3.notes[i], "cloth");
      b.box([-.8 + i * .65, .34, -2.15], [.57, .06, .43], P.paper);
    }
    const ring = new THREE.TorusGeometry(.32, .1, 8, 20); ring.rotateX(Math.PI / 2); b.geo(ring, [-1.1, .14, -3.8], P.yellow);
    prop(b, "duck", [1.1, -.02, -4.1], .3);
  }
}

/** Builds all five static sets once. Caller owns root lifecycle, lighting, fog, cards and animation.
 * Geometry is owned by root; palette materials / CanvasTextures are shared caches (do not dispose per set).
 * No asset loading, environment mutation, actors, lights, cameras or runtime gameplay behavior.
 */
export function buildSets(root: THREE.Object3D): void {
  const start = performance.now();
  const builders: Record<SetId, (b: SetBuilder) => void> = { bedroom, classroom, kitchen, schoolyard, waterpark, store, street, garage, yard, forest, snow };
  let triangles = 0;
  for (const id of Object.keys(SETS) as SetId[]) {
    const group = new THREE.Group(); group.name = `set:${id}`; group.position.set(...SETS[id].origin);
    const b = new SetBuilder(group); builders[id](b); dressing(b, id); b.finish();
    let count = 0;
    group.traverse((o) => { if (o instanceof THREE.Mesh) count += (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3; });
    group.userData.triangles = count; triangles += count; root.add(group);
  }
  root.userData.setsStats = { triangles, buildMs: performance.now() - start };
}
