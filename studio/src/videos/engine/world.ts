// Ep01 world: sky + two-tone light rig (the template's, camera-relative sun frozen per shot), all five sets from
// sets.ts, and the cast. update(id, f, camera) poses everything for shot `id` at frame f (pure function of id + f).
import * as EP_SUN from "@ep/story";
import * as THREE from "three";
import { getInputProps } from "remotion";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ctex, cloudHD } from "./paint";
import { LIGHTS, LOOK, LightPreset, base, CLOUD_TINT } from "./lights";
import { TONE, CHAR, POOL, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage } from "./cast";
import { FPS, SHOTS, camAt, ShotDef, CardMode } from "./story";
import { SETS, POOLS, BACKDROP, buildSets } from "./sets";

const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
/** sky-fall cloud palettes: lit top, shade side, projected ground-shadow tint */
type TopPal = { lit: string; shade: string; ink: [number, number, number] };
const TOPCLOUD: Partial<Record<string, TopPal>> = {
  day: { lit: "#ffffff", shade: "#9fb3d6", ink: [0.12, 0.16, 0.3] }, golden: { lit: "#fff0d6", shade: "#a98cc0", ink: [0.2, 0.12, 0.28] }, dawn: { lit: "#ffe3e6", shade: "#a595c6", ink: [0.18, 0.13, 0.3] },
};
/** one cloud volume, unit radius: 3-4 lobes of overlapping spheres, tall in the middle, flat underneath. k = shape 0..3 */
const puffs = (k: number) => {
  let sd = k * 97 + 13; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647, B: [number, number, number, number][] = [];
  for (let i = 0, n = 3 + (k % 2); i < n; i++) { const cx = (r() - 0.5) * 1.0, cz = (r() - 0.5) * 1.0, R = 0.3 + r() * 0.14; B.push([cx, 0.1, cz, R]);
    for (let j = 0; j < 8; j++) { const a = (j / 8) * Math.PI * 2 + r() * 0.4, q = R * (0.75 + 0.3 * r()); B.push([cx + q * Math.cos(a), -0.02 + 0.08 * r(), cz + q * Math.sin(a), R * (0.42 + 0.26 * r())]); } }
  return B;
};
const geoCache = new Map<number, THREE.BufferGeometry>();
const cloudGeo = (k: number) => { let g = geoCache.get(k); if (g) return g;
  const parts = puffs(k).map(([x, y, z, r], i) => { const b = new THREE.SphereGeometry(1, 20, 14), p = b.attributes.position; // lumpy: displaced along the normal
    for (let v = 0; v < p.count; v++) { const nx = p.getX(v), ny = p.getY(v), nz = p.getZ(v), d = 1 + 0.09 * Math.sin(nx * 7 + i) * Math.sin(ny * 6 + i * 2) + 0.06 * Math.sin(nz * 11 + i * 3); p.setXYZ(v, nx * d, ny * d, nz * d); }
    b.computeVertexNormals(); b.scale(r, r * 0.72, r); b.translate(x, y, z); return b; });
  g = mergeGeometries(parts)!; parts.forEach((b) => b.dispose()); geoCache.set(k, g); return g; };
/** lit by the frozen sun of the shot: bright tops, soft terminator, blue-grey sides, darker low down (the shading sells the volume) */
const cloudMat = (fade: boolean) => new THREE.ShaderMaterial({ transparent: fade, uniforms: { uSun: { value: new THREE.Vector3(0, 1, 0) }, uLit: { value: new THREE.Color() }, uShade: { value: new THREE.Color() }, uOp: { value: 1 } },
  vertexShader: "varying vec3 vN; varying float vH; void main() { vN = normalize(mat3(modelMatrix) * normal); vH = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader: "uniform vec3 uSun, uLit, uShade; uniform float uOp; varying vec3 vN; varying float vH; void main() { float k = smoothstep(0.02, 0.5, dot(normalize(vN), uSun)) * mix(0.45, 1.0, smoothstep(-0.12, 0.22, vH)); gl_FragColor = vec4(mix(uShade, uLit * 1.08, k), uOp); }" });
const topShadow = (k: number) => ctex(`topshadow|${k}`, 512, 512, (g) => { g.filter = "blur(14px)"; g.fillStyle = "#fff"; for (const [x, , z, r] of puffs(k)) { g.beginPath(); g.arc(256 + x * 230, 256 + z * 230, r * 230, 0, Math.PI * 2); g.fill(); } g.filter = "none"; });
/** per-shot sun override: indoors a high sun over the open wall tops reads as window light */
const SUN_SHOT = ((EP_SUN as Record<string, unknown>)["SUN_SHOT"] ?? {}) as Record<number, { az?: number; el?: number }>; // optional episode export (ep13: golden shots lit from behind the lens)
const INDOOR_EL = 58;
/** A/B for scripts (backdrop_check.py): inputProps `{ post: { backdrop: false } }` hides the panorama layers */
const NO_BACKDROP = (getInputProps() as { post?: { backdrop?: boolean } }).post?.backdrop === false;

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  actors: Actor[] = []; // read by qa.ts
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private fitCache = new Map<number, { center: THREE.Vector3; R: number }>();
  private cloudMaps: Record<"day" | "golden", THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private rush: THREE.Mesh[] = []; // sky-fall: cloud layers rushing up past the lens (hidden on other shots)
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor() {
    const R = this.root;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunDisc.renderOrder = -0.5; this.sunDisc.frustumCulled = false; this.sunDisc.layers.set(NOINK); R.add(this.sunDisc);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)) };
    for (let i = 0; i < 9; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }
    // sky-fall layers: 0-2 far clouds, 3-5 their projected ground shadows, 6-7 mid clouds, 8 near cloud (fades), 9 altitude haze.
    // NOINK: no world ink on the clouds; they and the haze write depth, so ink.ts draws no set lines on top of them either
    for (let i = 0; i < 10; i++) {
      const plane = (i >= 3 && i <= 5) || i === 9;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), plane ? new THREE.MeshBasicMaterial({ transparent: true, depthWrite: i === 9, fog: false, side: THREE.DoubleSide }) : cloudMat(i === 8));
      m.layers.set(NOINK); m.visible = false; m.renderOrder = i === 9 ? 1.5 : i === 8 ? 2 : 1; m.userData.noCast = true;
      this.rush.push(m); R.add(m);
    }
    buildSets(R, new Set(SHOTS.map((s) => s.set)));
    R.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && m.layers.mask === 1 && !m.userData.noCast) { m.castShadow = true; m.receiveShadow = true; } });
  }

  /** camera-relative sun, frozen per shot: the shot's mean view direction turned by az toward screen right, lifted by el */
  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const indoor = SETS[s.set].indoor;
    const az = THREE.MathUtils.degToRad(SUN_SHOT[id]?.az ?? (indoor ? 110 : L.az));
    const el = THREE.MathUtils.degToRad(SUN_SHOT[id]?.el ?? (indoor ? Math.max(INDOOR_EL, L.el) : L.el));
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }

  /** nothing animated left in the frame: actors and effect cards off (the next update brings them back) */
  hideCast() { for (const a of [...this.actors, ...this.fxs]) a.mesh.visible = false; }

  /** shadow fit frozen per shot like the sun: a fit that follows the camera slides the texel grid under every shadow edge */
  private shotFit(id: number, s: ShotDef, indoor: boolean) {
    let v = this.fitCache.get(id);
    if (v) return v;
    const c = new THREE.Vector3(), p = new THREE.Vector3(), cams: THREE.Vector3[] = [];
    let far = 0, n = 0;
    for (let f = s.a; f < s.b; f += 3, n++) {
      const k = camAt(id, f);
      cams.push(new THREE.Vector3(...k.look)); c.add(cams[n]);
      far = Math.max(far, p.set(...k.pos).distanceTo(cams[n]));
    }
    c.divideScalar(n);
    const reach = Math.max(...cams.map((l) => l.distanceTo(c)));
    v = { center: c, R: THREE.MathUtils.clamp(far * 1.15 + 6 + reach, 10, indoor ? 16 : 60) };
    this.fitCache.set(id, v);
    return v;
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LIGHTS[s.light], K = LOOK[s.light], indoor = SETS[s.set].indoor;
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    // big outdoor sets seen from high up: a near plane ~1 % of the height keeps the depth buffer fine at 300+ m (older sets: 0.05 as before)
    const near = !SETS[s.set].fog ? 0.05 : "fall" in s.cam ? 1 : Math.min(2, Math.max(0.05, c.pos[1] / 100));
    cam.fov = c.fov; cam.near = near; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const mover = (EP_SUN as Record<string, unknown>)["MOVER_AT"] as ((id: number, f: number) => number | null) | undefined; // optional episode export (ep13: a train that really rolls)
    if (mover) { const g = this.root.getObjectByName("mover"), x = mover(id, f); if (g) { g.visible = x !== null; if (x !== null) { g.position.x = x; g.updateMatrixWorld(true); } } }
    const focus = new THREE.Vector3(...c.look), fit = this.shotFit(id, s, indoor);
    cam.layers.enable(NOINK);
    // ---- light rig: camera-relative sun frozen per shot, two-tone uniforms, shadow fit around the focus ----
    const sunDir = this.shotSun(id, s, L).clone();
    // interior pool: the key comes from the pool centre (lamp / window) toward the focus, and fades past L.pool metres
    const pc = L.pool > 0 ? POOLS[s.set] : undefined;
    POOL.uPoolR.value = pc ? L.pool : 0;
    if (pc) {
      const pw = new THREE.Vector3(pc[0] + SETS[s.set].origin[0], pc[1], pc[2]);
      sunDir.copy(pw).sub(fit.center).normalize();
      POOL.uPoolV.value.copy(pw).applyMatrix4(cam.matrixWorldInverse);
    }
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = fit.R;
    this.sun.position.copy(fit.center).addScaledVector(sunDir, 120); this.sun.target.position.copy(fit.center);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 260; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- sky, fog (= horizon colour), sun disc, clouds (outdoor only) ----
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    const sf = s.haze ?? SETS[s.set].fog; // big outdoor sets: their own haze range (far layers fade into the horizon)
    untone(L.fog, this.fog.color); this.fog.near = indoor ? 60 : sf ? sf[0] : L.fogNear; this.fog.far = indoor ? 600 : sf ? sf[1] : L.fogFar;
    scene.fog = this.fog; scene.background = null;
    const fall = "fall" in s.cam, moon = s.light === "night";
    untone(L.fog, BACKDROP.uFog.value); BACKDROP.uMul.value.setRGB(...(CLOUD_TINT[s.light] ?? [1, 1, 1])); BACKDROP.uOn.value = fall || NO_BACKDROP ? 0 : 1;
    this.sunDisc.visible = !indoor && !fall && (s.light === "golden" || s.light === "dawn" || moon);
    if (this.sunDisc.visible) {
      (this.sunDisc.material as THREE.SpriteMaterial).color.setRGB(...(moon ? [1.6, 1.7, 2.0] : [6.0, 4.4, 2.4]) as [number, number, number]);
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900);
      this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(1.7)));
    }
    const o = SETS[s.set].origin;
    this.clouds.forEach((m, i) => {
      m.visible = !indoor && !fall && s.light !== "sea" && s.light !== "shallow";
      (m.material as THREE.MeshBasicMaterial).color.setRGB(...(CLOUD_TINT[s.light] ?? [1.1, 1.1, 1.1]));
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 520 + (i % 3) * 60, w = 120 + (i % 4) * 30;
      m.position.set(o[0] + Math.cos(a) * d, 110 + (i % 4) * 36, o[2] + Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      (m.material as THREE.MeshBasicMaterial).map = this.cloudMaps[base(s.light)][i % 4];
    });
    // ---- sky-fall (ep12 #12): real cloud volumes fixed in the world at true heights, so the fall itself grows them and slides
    // them outward. Far: below you, hazed, with projected ground shadows. Mid: two at the frame edges. Near: one passes a top
    // corner through the lens plane, fading by distance. None starts over the face or the caption band; below 60 m (rooftops) none.
    const sky = fall && c.pos[1] - o[1] >= 60;
    this.rush.forEach((m) => { m.visible = false; });
    if (sky) {
      const c0 = camAt(id, s.a), c1 = camAt(id, s.b - 1), h0 = c0.pos[1] - o[1], drop = c0.pos[1] - c1.pos[1], y0 = c0.pos[1], hNow = c.pos[1] - o[1];
      const tv = Math.tan((c0.fov * Math.PI) / 360), th = (tv * 9) / 16, mir = id % 2 ? 1 : -1, pal = TOPCLOUD[s.light] ?? TOPCLOUD.day!;
      const lit = new THREE.Color(pal.lit), shade = new THREE.Color(pal.shade), hl = Math.hypot(sunDir.x, sunDir.z) || 1;
      const cloud = (i: number, k: number, x: number, y: number, z: number, w: number, op = 1) => {
        const m = this.rush[i], u = (m.material as THREE.ShaderMaterial).uniforms;
        m.geometry = cloudGeo(k); m.visible = op > 0.01; m.position.set(x, y, z); m.scale.setScalar(w / 2); m.rotation.set(0, (k + id) * 1.7 + i, 0);
        u.uSun.value.copy(sunDir); u.uLit.value.copy(lit); u.uShade.value.copy(shade); u.uOp.value = op; };
      const dF = 0.52 * h0, wF = 0.9 * dF * th, dM = 1.5 * drop + 20, wM = 0.8 * dM * th, gy = o[1] + 40;
      [[-0.78, 0.05], [0.8, -0.88], [0.72, 0.62]].forEach(([sx, sy], i) => {
        const k = (i + id) % 4, x = c0.pos[0] + mir * sx * dF * th, z = c0.pos[2] - sy * dF * tv;
        cloud(i, k, x, y0 - dF, z, wF);
        const off = Math.min(0.28 * h0 * th, ((y0 - dF - gy) * hl) / Math.max(0.2, sunDir.y)), m = this.rush[3 + i], mat = m.material as THREE.MeshBasicMaterial; // falls away from the sun
        m.visible = true; m.position.set(x - (sunDir.x / hl) * off, gy, z - (sunDir.z / hl) * off); m.scale.set(wF, 1, wF); m.rotation.set(0, (k + id) * 1.7 + i, 0);
        mat.map = topShadow(k); mat.opacity = 0.34; mat.color.setRGB(...pal.ink);
      });
      [[0.85, 0.2], [-0.9, -0.85]].forEach(([sx, sy], j) => cloud(6 + j, (id + j * 2 + 1) % 4, c0.pos[0] + mir * sx * dM * th, y0 - dM, c0.pos[2] - sy * dM * tv, wM));
      const dN = 0.7 * drop + 4, rN = 0.5 * dN, inner = 0.75 * dN * th + rN; // reaches the lens ~70 % into the shot
      cloud(8, (id + 3) % 4, c0.pos[0] - mir * inner, y0 - dN, c0.pos[2] - 0.75 * dN * tv - rN, 2 * rN, Math.min(1, Math.max(0, (c.pos[1] - (y0 - dN) - 3) / 8)));
      const haze = this.rush[9], hm = haze.material as THREE.MeshBasicMaterial;
      haze.visible = true; haze.position.set(c.pos[0], y0 - (dM + 0.25 * wM + 2), c.pos[2]); haze.scale.set(8000, 1, 8000);
      hm.opacity = 0.36 * Math.min(1, Math.max(0, (hNow - 30) / 300)); untone(L.fog, hm.color); // 36 % at 330 m+, gone near the ground
    }
    // ---- cast + effects ----
    const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, t, { pos: cam.position, right, sun: sunDir }, base(s.light) === "golden");
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.0 * sc2, p.z), 2.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      const card = (p as { card?: CardMode }).card ?? s.card ?? (fall ? "cam" : undefined);
      if (card === "cam") a.mesh.quaternion.copy(cam.quaternion);
      else if (card) { a.mesh.rotation.set(-Math.PI / 2, card.flat, 0); a.mesh.position.y += 0.02; } // lies on the ground (YXZ: yaw after the tip-over)
      else a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0);
      if (p.roll) a.mesh.rotateZ(p.roll); // the card is rotated about its normal (the roll about the view axis for "cam" cards)
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = L.actorShadow && !indoor;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e2 = this.fx(fi++);
      e2.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e2.use(!!p.soft);
      e2.mesh.visible = true;
      e2.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e2.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else if (p.face) { e2.mesh.rotation.set(0, 0, 0); e2.mesh.lookAt(p.x + p.face[0], p.y + p.face[1], p.z + p.face[2]); e2.mesh.rotateZ(p.rot ?? 0); }
      else { e2.mesh.quaternion.copy(cam.quaternion); e2.mesh.rotateZ(p.rot ?? 0); }
      e2.mesh.scale.set(p.w, p.h, 1);
      fused.push(e2);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e3 of fused) e3.bind();
    return focus;
  }
}
