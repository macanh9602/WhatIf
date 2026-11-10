// Staging gate (skill-evolution fb0015b): exit 1 if any shot fails, run before every 2K render.
// usage: COMP=Short node scripts/staging_qa.mjs <outDir> [shotIds e.g. 10,11] (renders first / mid / last frame of each shot
// at scale 0.25 with inputProps {qa:true}; the composition logs "QA {...}" per layer, see src/videos/engine/qa.ts)
import fs from "node:fs";
if (process.env.REMOTION_TMP) { fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true }); process.env.TEMP = process.env.TMP = process.env.REMOTION_TMP; }
import { bundle } from "@remotion/bundler";
import { epOverride, epPaths } from "./ep.mjs";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { fileURLToPath } from "node:url";

// thresholds (reference close-ups keep a head under ~25 % of the frame height; see the fb0015b proposal)
export const T = { headOcc: 0.25, torsoOcc: 0.6, headCov: 0.3, headH: 0.3, headCut: 0.7, gap: 0.06, contact: 0.04, minHeadH: 0.04, extraHeadH: 0.09, fg: 0.25, camLo: 0.6, camHi: 1.15, row: 4, haze: 0.15, fgShare: 0.25, island: 0.004, torsoCut: 0.1, halfFace: [0.25, 0.9] };

/** pure judge: one QA record -> list of failure strings (also used by the self-test below) */
export function judge(q) {
  const bad = [];
  if (q.unwired > 0) bad.push(`${q.unwired} set materials not on this video's light rig`);
  if (q.fg > T.fg) bad.push(`foreground set pieces cover ${Math.round(q.fg * 100)} % of the frame`);
  // depth cues (fb0016b, depth.md 4.1-4.2): eye-level camera (reference IQR 0.67-1.00 x the subject's height),
  // no line-ups at one depth, haze on far outdoor geometry
  if (q.camH > 0 && (q.angle ?? "eye") === "eye" && (q.camH < T.camLo || q.camH > T.camHi))
    bad.push(`camera at ${q.camH} x subject height (eye level ${T.camLo}-${T.camHi}; mark the shot angle "high"/"low" if meant)`);
  if ((q.row ?? 0) >= T.row) bad.push(`${q.row} characters lined up within 0.6 m of depth: stage them in layers`);
  if ((q.bgN ?? 0) >= 20 && q.bgFog < T.haze) bad.push(`no haze: far geometry only ${Math.round(q.bgFog * 100)} % fogged (want >= ${T.haze * 100} %)`);
  const waived = (i, msg) => (q.waive ?? []).some(([wi, check]) => wi === i && msg.startsWith(`actor ${i}:`) && msg.includes(check));
  for (const c of q.cards) {
    if (c.headIn === 0) continue; // off screen: not staged in this frame
    const who = `actor ${c.i}`, n0 = bad.length;
    if (c.headH > T.headH) bad.push(`${who}: too tight, head ${Math.round(c.headH * 100)} % of frame height`);
    // tiny cards, and extras that are not a point of interest (head < 9 %), get only the size check above: an extra
    // half behind a chair in the background is normal staging; a named character never is
    // a head half behind a nearer head shows as a blank white face: any visible extra, not only points of interest (user, ep01 s12)
    if (c.headH >= T.minHeadH && c.headCov >= T.halfFace[0] && c.headCov < T.halfFace[1]) bad.push(`${who}: head ${Math.round(c.headCov * 100)} % behind a nearer character (a faceless half head): show the face or hide it`);
    if (c.headH < T.minHeadH || (c.principal === false && c.headH < T.extraHeadH)) continue;
    if (c.headIn >= 0.1 && c.headIn < T.headCut) bad.push(`${who}: head cut by the frame edge (${Math.round(c.headIn * 100)} % in)`);
    if (c.headOcc > T.headOcc) bad.push(`${who}: head hidden by set geometry (${Math.round(c.headOcc * 100)} %)`);
    if (c.torsoOcc > T.torsoOcc) bad.push(`${who}: body hidden by set geometry (${Math.round(c.torsoOcc * 100)} %)`);
    // set geometry IN FRONT of part of the torso: a desk edge through an arm, a chair rail through the belly, a table top across a chest
    // (user, ep01 s6 / s11 / s12). Behind-the-desk staging is legit only with a WAIVE reason.
    else if (c.torsoOcc >= T.torsoCut) bad.push(`${who}: set geometry cuts across the body (${Math.round(c.torsoOcc * 100)} % of the torso${c.mode === "sit" ? ", sitting inside the seat" : ""})`);
    if (c.headCov > T.headCov) bad.push(`${who}: head covered by a nearer character (${Math.round(c.headCov * 100)} %)`);
    if (c.gap > T.gap) bad.push(`${who}: floating ${c.gap} m above the surface below`);
    // rig (fb0095, reviewer classes limbs / hand-prop / anchor): checked on the card itself, so set occlusion does not matter
    if (c.slice) bad.push(`${who}: cut in two by set geometry (a ${c.slice === "h" ? "horizontal" : "vertical"} bar of the set crosses the body)`);
    const r = c.rig;
    if (r && (r.arms !== 2 || r.legs !== 2)) bad.push(`${who}: limb count ${r.arms} arms / ${r.legs} legs (want 2 / 2)`);
    if (r && r.hands > 2) bad.push(`${who}: ${r.hands} hands drawn (a prop draws a hand where no arm ends)`);
    for (const f of c.float ?? []) if (f.frac >= T.island)
      bad.push(`${who}: detached piece ${Math.round(f.frac * 1000) / 10} % of the card at (${f.x}, ${f.y}): floating accessory or a prop off its hand`);
    for (let k = bad.length - 1; k >= n0; k--) if (waived(c.i, bad[k])) bad.splice(k, 1);
  }
  for (const k of q.contacts) if (k.dist < 0 || k.dist > T.contact) bad.push(`contact ${k.a}->${k.b}: ${k.dist < 0 ? "an actor is missing" : `${Math.round(k.dist * 100)} % of frame width apart`}`);
  return bad;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.env.GPU_LOCK) throw new Error("GPU job: run it as  sh scripts/gpu.sh node scripts/staging_qa.mjs ...  (one job at a time on the 8 GB card)");
  let [outDir = "out/staging_qa", only] = process.argv.slice(2);
  if (/^[\d,]+$/.test(outDir)) [outDir, only] = ["out/staging_qa", outDir]; // ids given first, as temporal_qa takes them: no folder named "11,12"
  fs.mkdirSync(outDir, { recursive: true });
  const browserExecutable = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
  const chromiumOptions = { gl: "angle" };
  const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public"), webpackOverride: epOverride() });
  const inputProps = { qa: true, captions: false };
  const composition = await selectComposition({ serveUrl, id: process.env.COMP || "Short", browserExecutable, chromiumOptions, inputProps });
  const still = async (frame) => {
    const logs = [];
    await renderStill({ composition, serveUrl, frame, output: `${outDir}/f${frame}.jpg`, imageFormat: "jpeg", jpegQuality: 80, inputProps, scale: 0.25,
      browserExecutable, chromiumOptions, timeoutInMilliseconds: 180000, logLevel: "error", onBrowserLog: (l) => logs.push(l.text) });
    return logs;
  };
  const shots = JSON.parse((await still(0)).find((l) => l.startsWith("QASHOTS ")).slice(8));
  const want = only ? new Set(only.split(",").map(Number)) : null;
  const report = [];
  let fails = 0;
  for (const [id, a, b] of shots) {
    if (want && !want.has(id)) continue;
    const frames = [...new Set([Math.min(a + 3, b - 1), Math.round((a + b) / 2), Math.max(b - 4, a)])];
    for (const f of frames) {
      // a long session can lose the GPU context: the frame renders white and every card has 0 samples, which would
      // silently PASS every check. Retry, then fail loudly.
      let q;
      for (let k = 0; k < 3; k++) {
        q = (await still(f)).filter((l) => l.startsWith("QA ")).map((l) => JSON.parse(l.slice(3))).filter((r) => r.id === id).pop(); // the last pass has every texture
        if (q && !q.cards.some((c) => c.n === 0)) break;
      }
      if (!q) { console.log(`shot ${id} f${f}: no QA record`); fails++; continue; }
      if (q.cards.some((c) => c.n === 0)) { console.log(`FAIL shot ${id} f${f}: render broken (card textures empty after 3 tries)`); fails++; continue; }
      // contacts are judged at the shot midpoint only (hands travel at the start and end)
      if (f !== Math.round((a + b) / 2)) q.contacts = [];
      const bad = judge(q);
      report.push({ id, f, bad, q });
      if (bad.length) { fails++; console.log(`FAIL shot ${id} f${f} (${(f / 30).toFixed(1)} s): ${bad.join("; ")}`); }
    }
  }
  // shot mix: at least a quarter of the mid / close shots need a foreground layer (reference 38 %), judged at mid frames
  // fall_belly = mid-air: nothing is near in the sky (director rule 2026-11-07), so those shots do not count either way
  const mids = report.filter((r) => r.q.contacts !== undefined && ["mid", "close"].includes(r.q.size) && r.q.nCast > 0 && !r.q.cards.some((c) => c.mode === "fall_belly"));
  const byShot = new Map(mids.map((r) => [r.id, r.q.fg]));
  if (!want && byShot.size) {
    const share = [...byShot.values()].filter((v) => v >= 0.03).length / byShot.size;
    console.log(`foreground layer in ${Math.round(share * 100)} % of mid/close shots (want >= ${T.fgShare * 100} %)`);
    if (share < T.fgShare) { fails++; console.log("FAIL shot mix: too few shots with a foreground layer"); }
  }
  fs.writeFileSync(`${outDir}/report.json`, JSON.stringify(report, null, 1));
  console.log(`${fails ? "FAILED" : "PASSED"}: ${fails} failing frames, report ${outDir}/report.json`);
  process.exit(fails ? 1 : 0);
}
