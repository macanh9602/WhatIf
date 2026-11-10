// Temporal gate: set lines must hold still under the creeping camera. Stills and sheets cannot see boiling, so nothing else catches it.
// usage (from studio/): EP=ep03 node scripts/temporal_qa.mjs [shotIds e.g. 5,6]; exit 1 if a shot fails. PROPS='{...}' adds inputProps for A/B.
// Renders WINDOW frames of each shot at the final size with the cast and captions off, so everything left is static,
// at a moment the camera only creeps (past the settle of the cut, clear of MOVES and KICKS). Writes out/temporal/<ep>/s<id>.mp4, and for a
// failed shot s<id>_boil.png (white = boiling pixels) to show which lines to fix.
//
// Metric: per-pixel zigzag on the luma. A turning point needs a swing >= PROMINENCE; a leg between two turning points that took <= FAST
// frames is a fast leg; a pixel with >= MIN_LEGS fast legs boils. A rigid line (with a painted rim, or two lines and a gap) drifts past a
// pixel over many frames at creep speed: slow legs. A boiling one flips within a few frames. No hand-picked boxes, no optical flow.
// LIMIT, from ep02 at 2K (k/Mpx per shot): before the fix 7 shots of 22 at 2.2-6.2, 2 more at 1.7-1.9; after (16 ink jitters, no gap bridge) worst 1.30,
// next 0.87, mean 0.18. The published master scores what a fresh world-only render scores, and crf 16 / 20 add nothing, so the render is the cause.
import fs from "node:fs";
if (process.env.REMOTION_TMP) { fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true }); process.env.TEMP = process.env.TMP = process.env.REMOTION_TMP; }
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const WINDOW = 16, PROMINENCE = 16, FAST = 3, MIN_LEGS = 2, LIMIT = 1.5; // k/Mpx
const W = 1440, H = 2560, SCALE = 1.3333333333333333, FPS = 30; // same as a 2K render.mjs

/** first frame of a window with the camera at creep speed; null if the shot has none */
export function creepWindow(s, moves, n = WINDOW, settle = 22) {
  for (let f = s.a + settle; f + n <= s.b; f++) if (!moves.some(([a, b]) => f < b && a < f + n)) return f;
  return null;
}

/** per pixel, how many fast legs its luma makes over the frames */
export function legMap(frames, T = PROMINENCE, K = FAST) {
  const n = frames[0].length, legs = new Uint8Array(n), ext = Int16Array.from(frames[0]), dir = new Int8Array(n), tExt = new Uint8Array(n), tTurn = new Uint8Array(n).fill(255);
  for (let t = 1; t < frames.length; t++) {
    const f = frames[t];
    for (let i = 0; i < n; i++) {
      const v = f[i], d = dir[i], e = ext[i];
      if (d === 0) { if (Math.abs(v - e) >= T) { dir[i] = v > e ? 1 : -1; ext[i] = v; tExt[i] = t; } continue; }
      if (d > 0 ? v > e : v < e) { ext[i] = v; tExt[i] = t; continue; }
      if (Math.abs(v - e) >= T) { // the extreme at tExt was a turning point
        if (tTurn[i] !== 255 && tExt[i] - tTurn[i] <= K) legs[i]++;
        tTurn[i] = tExt[i]; dir[i] = -d; ext[i] = v; tExt[i] = t;
      }
    }
  }
  return legs;
}

/** boiling pixels per million pixels */
export function score(frames, { T = PROMINENCE, K = FAST, minLegs = MIN_LEGS, mask = null } = {}) {
  const legs = legMap(frames, T, K);
  let boil = 0, px = 0;
  for (let i = 0; i < legs.length; i++) { if (mask && mask[i]) continue; px++; if (legs[i] >= minLegs) boil++; }
  return boil / (px / 1e6);
}

/** luma of frames from .. from + n - 1 of a video, as one Uint8Array per frame */
export const decode = (file, from = 0, n = 1e9) => {
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-vf", `select='between(n\\,${from}\\,${from + n - 1})'`, "-fps_mode", "passthrough", "-f", "rawvideo", "-pix_fmt", "gray", "-"], { maxBuffer: 2 ** 32 });
  if (r.status) throw new Error(`ffmpeg: ${r.stderr}`);
  const out = [];
  for (let i = 0; i + W * H <= r.stdout.length; i += W * H) out.push(r.stdout.subarray(i, i + W * H));
  return out;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.env.GPU_LOCK) throw new Error("GPU job: run it as  sh scripts/gpu.sh node scripts/temporal_qa.mjs ...  (one job at a time on the 8 GB card)");
  const { bundle } = await import("@remotion/bundler");
  const { renderMedia, selectComposition } = await import("@remotion/renderer");
  const { epOverride, epPaths, activeEp } = await import("./ep.mjs");
  const EP = activeEp(), pick = process.argv[2]?.split(",").map(Number), OUT = path.resolve(process.env.OUT || `out/temporal/${EP}`);
  fs.mkdirSync(OUT, { recursive: true });
  const story = fs.readFileSync(epPaths(EP).story, "utf8"), frame = (x) => Math.round(+x * FPS);
  // I(...) = a 2D insert: it ends the shot before it, but has no world to measure
  const starts = [...story.matchAll(/^\s*([SI])\((\d+),\s*([\d.]+),/gm)].map((m) => ({ id: +m[2], a: frame(m[3]), insert: m[1] === "I" })).sort((p, q) => p.a - q.a);
  const tm = story.match(/TOTAL\s*=\s*(F\()?([\d.]+)/), total = tm[1] ? frame(tm[2]) : +tm[2]; // TOTAL = 2571 or F(85.7)
  const shots = starts.map((s, i) => ({ ...s, b: starts[i + 1]?.a ?? total })).filter((s) => !s.insert && (!pick || pick.includes(s.id)));
  const moves = [...(story.match(/MOVES[^=]*=\s*\{([\s\S]*?)\n\};/)?.[1] ?? "").matchAll(/^\s*(\d+):\s*\[(.*)\]/gm)]
    .flatMap((m) => [...m[2].matchAll(/M\("\w+",\s*([\d.]+),\s*(\d+)/g)].map((x) => [+m[1], frame(x[1]), frame(x[1]) + +x[2]]));
  const kicks = [...(story.match(/KICKS\s*=\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(/F\(([\d.]+)\)/g)].map((m) => [frame(m[1]), frame(m[1]) + 7]);
  const props = JSON.parse(process.env.PROPS || "{}"), inputProps = { captions: false, ...props, post: { cast: false, ...props.post } };
  const browserExecutable = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe", chromiumOptions = { gl: "angle" };
  const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public"), webpackOverride: epOverride(EP) });
  const composition = await selectComposition({ serveUrl, id: process.env.COMP || "Short", browserExecutable, chromiumOptions, inputProps });
  const bad = [];
  for (const s of shots) {
    const from = creepWindow(s, [...moves.filter((m) => m[0] === s.id).map((m) => m.slice(1)), ...kicks]);
    if (from === null) { console.log(`shot ${s.id}: no ${WINDOW}-frame creep window, not measured`); continue; }
    const file = path.join(OUT, `s${String(s.id).padStart(2, "0")}.mp4`);
    await renderMedia({ composition, serveUrl, codec: "h264", crf: 1, x264Preset: "veryfast", muted: true, frameRange: [from, from + WINDOW - 1], outputLocation: file, inputProps, scale: SCALE, browserExecutable, chromiumOptions, timeoutInMilliseconds: 180000, concurrency: Number(process.env.CONCURRENCY || 2) });
    const f = decode(file), k = score(f) / 1000;
    console.log(`shot ${s.id} [${from}+${WINDOW}] boil ${k.toFixed(2)} k/Mpx${k > LIMIT ? `  <- over ${LIMIT}` : ""}`);
    if (k > LIMIT) {
      bad.push(s.id);
      const legs = legMap(f), map = Buffer.from(legs.map((v) => (v >= MIN_LEGS ? 255 : 0)));
      spawnSync("ffmpeg", ["-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "gray", "-s", `${W}x${H}`, "-i", "-", file.replace(/\.mp4$/, "_boil.png")], { input: map });
    }
  }
  console.log(bad.length ? `temporal_qa FAILED: shots ${bad.join(", ")} boil (maps in ${OUT})` : "temporal_qa PASSED");
  process.exit(bad.length ? 1 : 0);
}
