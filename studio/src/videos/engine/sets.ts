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
export const loadProps = () => (kitP ??= Promise.all(PROP_FILES.map((n) =>
  new GLTFLoader().loadAsync(staticFile(`props/${n}.glb`)).then((g) => { g.scene.updateMatrixWorld(true); KIT.set(n, g.scene); }))).then(() => undefined));

export type V3 = [number, number, number];
export type SetId = "home" | "yard" | "forest" | "snow" | "bedroom";
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
export const POOLS: Partial<Record<SetId, V3>> = { home: [0.2, 2.15, 0.25], yard: [-3.2, 3.5, 0.85], bedroom: [0.05, 1.05, -3.05] }; // the pendant over the table, the street lamp
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


/** Builds every static set once. Caller owns root lifecycle, lighting, fog, cards and animation.
 * Geometry is owned by root; palette materials / CanvasTextures are shared caches (do not dispose per set).
 * No asset loading, environment mutation, actors, lights, cameras or runtime gameplay behavior.
 */
export function buildSets(root: THREE.Object3D): void {
  const start = performance.now();
  const builders: Record<SetId, (b: SetBuilder) => void> = { home, yard, forest, snow, bedroom };
  let triangles = 0;
  for (const id of Object.keys(SETS) as SetId[]) {
    const group = new THREE.Group(); group.name = `set:${id}`; group.position.set(...SETS[id].origin);
    const b = new SetBuilder(group); builders[id](b); b.finish();
    let count = 0;
    group.traverse((o) => { if (o instanceof THREE.Mesh) count += (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3; });
    group.userData.triangles = count; triangles += count; root.add(group);
  }
  root.userData.setsStats = { triangles, buildMs: performance.now() - start };
}
