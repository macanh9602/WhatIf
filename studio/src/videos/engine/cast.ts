// Cast as lit flat sprites (pool / Actor / Fx / contact blobs / blinks are the template's, unchanged in spirit).
// stage(id, t, cam) turns the active episode's acts (@ep/cast: who stands where in each shot, how they act) into cards,
// then appends that episode's shot fx.
import * as THREE from "three";
import { Pen, bodyFront, fxSplash, fxContact, fxShadow, fxNote, Outfit, Expr, FrontOpts, Prop, INK, SKIN, curve, animSpan, POSES, fxExclaim, fxShock, fxSpeed, fxSweatBurst } from "./toon";
import { V3, clamp01 } from "./shot";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";
import { CamInfo, Place, FxPlace, Stage, blob, exprAnim, exprAt, fkey, lidAt, light2D, q, tier } from "./act";
import { acts, fx, wearAt } from "@ep/cast";

export type { CamInfo, Place, FxPlace, Stage };

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
/** metres per design unit: 1000 units = 2.16 m, so an adult (3.5 head-heights) is ~1.75 m and a kid ~1.35 m */
export const SU = 0.00216;
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);

export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false;
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(BODY, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false;
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    } else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

export const stage = (id: number, t: number, cam: CamInfo, golden: boolean): Stage => {
  const out: Stage = { places: [], fx: [] }, light = light2D(cam);
  for (const a of acts(id)) {
    const at = a.path ? a.path(t) : a.at;
    if (!at) continue;
    let off: V3 = a.off ?? [0, 0, 0];
    if (a.moveTo) { const [[t0, p0], [t1, p1]] = a.moveTo, k = clamp01((t - t0) / (t1 - t0)); off = [p0[0] + (p1[0] - p0[0]) * k, p0[1] + (p1[1] - p0[1]) * k, p0[2] + (p1[2] - p0[2]) * k]; }
    if (a.drift) { const d = a.drift(t); off = [off[0] + d[0], off[1] + d[1], off[2] + d[2]]; }
    const [x, y, z] = [at[0] + off[0], at[1] + off[1], at[2] + off[2]];
    const swaps = a.expr.slice(1).map(([ts]) => ts);
    const prop = typeof a.prop === "function" ? a.prop(t) : a.prop ?? null;
    const o: Outfit = a.cast ? { ...a.o, cast: q(a.cast(t), 8), castWear: q(wearAt(t), 8) } : a.o;
    const face = typeof a.face === "function" ? a.face(t) : a.face ?? 0;
    const fo: FrontOpts = {
      mode: a.mode ?? "stand", expr: exprAt(a.expr, t), ...exprAnim(a.expr, t), blink: lidAt(t, a.mirror ? 0 : a.i, swaps), prop, wave: a.wave?.(t), facing: face as -1 | 0 | 1,
      look: typeof a.look === "function" ? a.look(t) : a.look ?? 0, lookY: a.lookY?.(t) ?? 0, headTilt: a.head?.(t) ?? 0, phase: a.phase ? ((a.phase(t) % 1) + 1) % 1 : 0, tilt: a.tilt?.(t) ?? 0, light, seed: ((a.mirror ? 0 : a.i) % 7) + 1,
      reach: a.reach ? a.reach(t) : undefined, ...(a.flail ? { flail: a.flail(t) } : {}), ...(a.moveTo ? { lift: 110 } : {}), ...(a.seat ? { seat: a.seat / SU } : {}), // a run: high knees
    };
    const sc = a.scale ?? 1, d = cam.pos.distanceTo(new THREE.Vector3(x, y + 1, z)) / sc, [w, h, k] = tier(d);
    out.places.push({ key: `F|${a.i}|${fkey(o)}|${fkey(fo)}`, draw: (p) => bodyFront(p, o, fo), x, y, z, scale: sc, size: [w, h, k], mirror: a.mirror, yaw: a.yaw, ...(a.roll ? { roll: (a.roll(t) * Math.PI) / 180 } : {}) });
    if (!a.mirror && Math.abs(off[1]) < 1e-6 && Math.abs(y) < 0.5 && !a.noShadow && y > -0.1) blob(out, cam.sun, golden, x, y, z, sc * (a.o.build === "kid" ? 0.85 : 1)); // no ground shadow: reflection, swimmers, slider
  }
  fx(id, t, out);
  return out;
};
