// Staging QA (skill-evolution fb0015b): measures what a viewer sees of every character card in the current frame, so
// staging faults fail a script instead of relying on a reviewer (scripts/staging_qa.mjs reads the console line).
// Per card: opaque pixels of its own drawing are sampled, mapped to world space, projected, and ray-cast against the
// shot's set (layer 0) and against nearer cards. Regions run down the card's opaque height: head = top 30 %,
// torso 30-62 %, feet = bottom 12 %. All fractions are of the region's samples; heights are of the frame height.
import * as THREE from "three";
import { World } from "./world";
import { SU } from "./cast";
import { SHOTS, CONTACTS, WAIVE } from "./story";
import { SETS } from "./sets";
import { TONE } from "./shade";
import { pieces, Rig, sliced } from "./rig";

const GX = 18, GY = 30;
type S = { p: THREE.Vector3; ndc: THREE.Vector3; ry: number; gx: number; gy: number; inFrame: boolean; occ: boolean; covered: boolean };
const ray = new THREE.Raycaster();

export function stagingQA(world: World, id: number, f: number, cam: THREE.PerspectiveCamera, fog?: THREE.Fog | null) {
  const s = SHOTS[id - 1];
  const set = world.root.getObjectByName(`set:${s.set}`)!;
  const setMeshes: THREE.Mesh[] = [];
  let unwired = 0;
  world.root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || m.layers.mask !== 1) return;
    const mat = m.material as THREE.Material;
    if ((mat as THREE.MeshLambertMaterial).isMeshLambertMaterial && mat.userData.tone !== TONE) unwired++;
  });
  set.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && m.visible) setMeshes.push(m); });
  cam.updateMatrixWorld();
  // mirrored cards are reflections (mirror glass): not staged bodies
  const cards = world.actors.filter((a) => a.mesh.visible && a.r?.tex && a.mesh.scale.x > 0).map((a) => {
    const cv = a.r!.tex!.image as HTMLCanvasElement, w = cv.width, h = cv.height;
    const px = cv.getContext("2d", { willReadFrequently: true })!.getImageData(0, 0, w, h).data;
    const key = a.r!.key, i = Number(key.split("|")[2] ?? -1), mode = /"mode":"(\w+)"/.exec(key)?.[1] ?? "?";
    const pts: S[] = [];
    for (let gy = 0; gy < GY; gy++) for (let gx = 0; gx < GX; gx++) {
      const cx = Math.floor(((gx + 0.5) / GX) * w), cy = Math.floor(((gy + 0.5) / GY) * h);
      if (px[(cy * w + cx) * 4 + 3] < 128) continue;
      const p = a.mesh.localToWorld(new THREE.Vector3((cx / w - 0.5) * 600 * SU, (975 - (cy / h) * 1000) * SU, 0));
      const ndc = p.clone().project(cam);
      pts.push({ p, ndc, ry: cy / h, gx, gy, inFrame: Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1 && ndc.z < 1, occ: false, covered: false });
    }
    // rig gates (fb0095): islands off the body = floating accessory / prop left its hand; limb count from bodyFront
    const float = pieces((x, y) => px[(y * w + x) * 4 + 3], w, h).filter((q) => q.frac >= 0.002);
    const flat = new THREE.Vector3(0, 0, 1).transformDirection(a.mesh.matrixWorld).y > 0.9; // lies on a surface (story.ts card { flat })
    return { a, i, mode, pts, flat, dist: a.mesh.position.distanceTo(cam.position), float, rig: (cv as HTMLCanvasElement & { rig?: Rig }).rig };
  });
  // occlusion by the set: first hit closer than the sample
  for (const c of cards) for (const q of c.pts) if (q.inFrame) {
    const d = q.p.clone().sub(cam.position), len = d.length();
    // a flat card lies 2 cm over its surface: the 3 cm upright-card slack let a pillow 2 cm above the card hide half the head
    // unseen (ep12 s13), so flat cards only forgive 5 mm
    ray.set(cam.position, d.normalize()); ray.far = len - (c.flat ? 0.005 : 0.03); ray.near = 0.05;
    q.occ = ray.intersectObjects(setMeshes, false).length > 0;
  }
  // coverage by nearer cards: a coarse screen mask of each card's opaque samples (cell = 1/40 frame width)
  const cell = (n: THREE.Vector3) => `${Math.floor((n.x + 1) * 20)},${Math.floor((n.y + 1) * 35)}`;
  for (const c of cards) {
    const nearer = cards.filter((o) => o !== c && o.dist < c.dist + 0.15); // same depth counts: two cards side by side must not overlap
    if (!nearer.length) continue;
    const mask = new Set(nearer.flatMap((o) => o.pts.filter((q) => q.inFrame).map((q) => cell(q.ndc))));
    for (const q of c.pts) if (q.inFrame && !q.occ) q.covered = mask.has(cell(q.ndc));
  }
  const region = (c: (typeof cards)[number], r: "head" | "torso" | "feet" | "any") => {
    if (!c.pts.length) return [];
    const y0 = Math.min(...c.pts.map((q) => q.ry)), y1 = Math.max(...c.pts.map((q) => q.ry)), u = (q: S) => (q.ry - y0) / Math.max(1e-6, y1 - y0);
    return c.pts.filter((q) => r === "any" || (r === "head" ? u(q) < 0.3 : r === "torso" ? u(q) >= 0.3 && u(q) < (c.mode === "sit" ? 0.8 : 0.62) : u(q) >= 0.88));
  };
  const frac = (l: S[], k: (q: S) => boolean) => (l.length ? +(l.filter(k).length / l.length).toFixed(2) : 0);
  const out = cards.map((c) => {
    const head = region(c, "head"), torso = region(c, "torso"), feet = region(c, "feet"), seen = head.filter((q) => q.inFrame);
    const hy = head.map((q) => q.ndc.y); // whole head, also the part outside the frame
    // floor under the soles (standing cards only): gap between the card origin and the first surface below it
    let gap = 0;
    if (c.flat) { // lying: it rests on its highest support (a head on the pillow), so the gap is the smallest one under the card
      const gs = c.pts.map((q) => { ray.set(q.p.clone().add(new THREE.Vector3(0, 0.3, 0)), new THREE.Vector3(0, -1, 0)); ray.near = 0; ray.far = 5;
        const hit = ray.intersectObjects(setMeshes, false)[0]; return hit ? q.p.y - hit.point.y : 9; });
      gap = gs.length && Math.min(...gs) < 9 ? +Math.min(...gs).toFixed(2) : -1;
    } else if (c.mode !== "sit" && !c.mode.startsWith("fall")) { // fall, fall_belly: in the air
      ray.set(c.a.mesh.position.clone().add(new THREE.Vector3(0, 0.3, 0)), new THREE.Vector3(0, -1, 0)); ray.near = 0; ray.far = 5;
      const hit = ray.intersectObjects(setMeshes, false)[0];
      gap = hit ? +(c.a.mesh.position.y - hit.point.y).toFixed(2) : -1;
    }
    return {
      i: c.i, principal: c.i < 10, mode: c.mode, n: c.pts.length, // ep01 cast ids: < 10 named characters, >= 10 extras
      inFrame: frac(c.pts, (q) => q.inFrame),
      headIn: frac(head, (q) => q.inFrame), headOcc: frac(seen, (q) => q.occ), headCov: frac(seen, (q) => q.covered),
      torsoOcc: frac(torso.filter((q) => q.inFrame), (q) => q.occ), feetOcc: frac(feet.filter((q) => q.inFrame), (q) => q.occ),
      headH: hy.length ? +((Math.max(...hy) - Math.min(...hy)) / 2).toFixed(2) : 0, gap, float: c.float, rig: c.rig, slice: sliced(c.pts.filter((q) => q.inFrame)),
    };
  });
  // foreground: share of the frame where set geometry sits in front of the nearest card (fb0003 rule c)
  const near = Math.min(...cards.filter((c) => c.pts.some((q) => q.inFrame)).map((c) => c.dist), 1e9) - 0.3;
  let fg = 0;
  for (let gy = 0; gy < 20; gy++) for (let gx = 0; gx < 12; gx++) {
    ray.setFromCamera(new THREE.Vector2(((gx + 0.5) / 12) * 2 - 1, ((gy + 0.5) / 20) * 2 - 1), cam); ray.near = 0.05; ray.far = near;
    const hit = near > 0.1 && near < 1e8 ? ray.intersectObjects(setMeshes, false)[0] : undefined;
    // the floor / water surface in front of the cast is not a foreground prop
    if (hit && !(hit.point.y < 0.15 && (hit.face?.normal.clone().transformDirection(hit.object.matrixWorld).y ?? 0) > 0.9)) fg++;
  }
  // ---- depth cues (fb0016b, depth.md 4.2 / 2.x) ----
  // subject = the biggest named character in frame (else the biggest card); camera height over its feet / its height
  const seenCards = cards.filter((c) => c.pts.filter((q) => q.inFrame).length > c.pts.length * 0.3);
  const subj = [...seenCards].sort((a, b) => (b.i < 10 ? 1 : 0) - (a.i < 10 ? 1 : 0) || b.pts.length / b.dist - a.pts.length / a.dist)[0];
  let camH = -1;
  if (subj && subj.pts.length && !subj.mode.startsWith("fall")) { // fall = swimmers / sliders: no ground to stand on
    const ys = subj.pts.map((q) => q.p.y), top = Math.max(...ys), feet = subj.a.mesh.position.y;
    camH = +((cam.position.y - feet) / Math.max(0.3, top - feet)).toFixed(2);
  }
  // depth spread of the visible cast along the view axis (a line-up parallel to the lens reads flat)
  const fwd = cam.getWorldDirection(new THREE.Vector3());
  const zs = seenCards.map((c) => c.a.mesh.position.clone().sub(cam.position).dot(fwd));
  const spread = zs.length ? +(Math.max(...zs) - Math.min(...zs)).toFixed(2) : 0;
  // line-up: the most cards standing within one 0.6 m depth slab (the reference stages fore / mid / back layers)
  const zz = [...zs].sort((a, b) => a - b);
  let row = 0;
  for (let i = 0, j = 0; j < zz.length; j++) { while (zz[j] - zz[i] > 0.6) i++; row = Math.max(row, j - i + 1); }
  // haze: fog factor at background hits (> 2.5x the subject distance and > 15 m); the reference pulls far things ~40 %
  // toward the horizon colour (outdoor only: fog exists there)
  const bgFog: number[] = [];
  // sky-fall (cam { fall }): straight down from 30-400 m the ground is the subject's only background and sits near, so no
  // haze is correct there; depth comes from the rush clouds between (ep12 #10). Side-view sky shots are still judged.
  if (fog && subj && !SETS[s.set].indoor && !("fall" in s.cam)) for (let gy = 0; gy < 20; gy++) for (let gx = 0; gx < 12; gx++) {
    ray.setFromCamera(new THREE.Vector2(((gx + 0.5) / 12) * 2 - 1, ((gy + 0.5) / 20) * 2 - 1), cam); ray.near = 0.05; ray.far = 1e4;
    const hit = ray.intersectObjects(setMeshes, false)[0];
    if (hit && hit.distance > Math.max(15, subj.dist * 2.5)) bgFog.push(THREE.MathUtils.clamp((hit.distance - fog.near) / (fog.far - fog.near), 0, 1));
  }
  bgFog.sort((a, b) => a - b);
  const contacts = CONTACTS.filter((k) => k[0] === id).map(([, ia, ra, ib, rb]) => {
    const A = cards.find((c) => c.i === ia), B = cards.find((c) => c.i === ib);
    if (!A || !B) return { a: ia, b: ib, dist: -1 };
    const pa = region(A, ra).filter((q) => q.inFrame), pb = region(B, rb).filter((q) => q.inFrame);
    let best = 9;
    const aspect = cam.aspect; // ndc x spans the width, y the height: express in frame widths
    for (const x of pa) for (const y of pb) best = Math.min(best, Math.hypot((x.ndc.x - y.ndc.x) / 2, ((x.ndc.y - y.ndc.y) / 2) / aspect));
    return { a: ia, b: ib, dist: +best.toFixed(3) };
  });
  return { id, f, size: s.size, angle: s.angle ?? "eye", unwired, fg: +(fg / 240).toFixed(2), camH, spread, row, nCast: seenCards.length,
    bgN: bgFog.length, bgFog: bgFog.length ? +bgFog[bgFog.length >> 1].toFixed(2) : -1, cards: out, contacts, waive: WAIVE.filter((w) => w[0] === id).map(([, i, check]) => [i, check]) };
}
