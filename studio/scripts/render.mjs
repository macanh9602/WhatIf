// usage: node scripts/render.mjs <name> [all | 7,12,...]   e.g. node scripts/render.mjs ep01 7,12
// Renders one h264 chunk per shot into out/<COMP>/chunks/ (bundles once), re-renders only the shots given
// (default all; any chunk that is missing is rendered too), concats + muxes public/eps/<name>/mix.wav, then copies
// <name>_<stamp>_<sha>{_master,_upload}.mp4 to OUT_ROOT (shared MEGA folder) and appends a row to ../RENDERS.md.
// Shared code (ink, toon, cast, captions) or new words.json → pass "all": old chunks would be stale.
// Shot ranges are regex-parsed from src/videos/engine/eps/<name>/story.ts (S(id, a, b, ...) + XFADE); <name> also picks the @ep bundle.
import fs from "node:fs";
if (process.env.REMOTION_TMP) { fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true }); process.env.TEMP = process.env.TMP = process.env.REMOTION_TMP; }
import { bundle } from "@remotion/bundler";
import { epOverride, epPaths } from "./ep.mjs";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import os from "node:os";

const [name, pick = "all"] = process.argv.slice(2);
if (!name) throw new Error("usage: node scripts/render.mjs <name> [all | 7,12,...]");
const COMP = process.env.COMP || "Short";
const OUT_ROOT = process.env.OUT_ROOT || path.resolve("out/final"); // a synced folder via env
// PREVIEW=1: a 1080p review copy for the user, kept in out/<COMP>/ (own chunk dir; no MEGA copy, no RENDERS.md row)
// PREVIEW=half: 540 x 960 for the reviewer loop (packs are <= 540 wide): ~4x fewer pixels, own chunk dir
const PREVIEW = !!process.env.PREVIEW;
const HALF = process.env.PREVIEW === "half";
const SCALE = HALF ? 0.5 : PREVIEW ? 1 : 1.3333333333333333; // 2K; "1.3333" breaks the stitching step (AGENTS.md log)
// look gate (fb0016): a 2K render needs bible/episodes/<name>-*/LOOK_SCORES.md with every "n/10" score >= 7
if (!PREVIEW) {
  const ep = fs.readdirSync("../bible/episodes").find((d) => d === name || d.startsWith(name + "-"));
  const scores = ep && fs.existsSync(`../bible/episodes/${ep}/LOOK_SCORES.md`) ? fs.readFileSync(`../bible/episodes/${ep}/LOOK_SCORES.md`, "utf8") : "";
  const low = [...scores.matchAll(/([\d.]+)\s*\/\s*10/g)].map((m) => +m[1]).filter((v) => v < 7);
  if (!scores || low.length) throw new Error(`look gate: ${scores ? `scores below 7: ${low.join(", ")}` : `no LOOK_SCORES.md for ${name}`} (PREVIEW=1 skips)`);
  // self-check gate (fb0099): SELF_CHECK.md (scripts/selfcheck.mjs sheets + review_prompts/F.md) with a "<shot> CLEAN" line for every
  // shot, written AFTER the last change to the episode code: a verdict on older frames proves nothing
  const sc = `../bible/episodes/${ep}/SELF_CHECK.md`, src = "src/videos/engine", P = epPaths(name);
  // the shared engine (files directly in engine/) + this episode's folder; other episodes' edits do not stale this verdict
  const code = [...fs.readdirSync(src).map((f) => `${src}/${f}`).filter((f) => fs.statSync(f).isFile()), ...fs.readdirSync(P.code).map((f) => `${P.code}/${f}`)];
  const newest = Math.max(...code.map((f) => fs.statSync(f).mtimeMs));
  const text = fs.existsSync(sc) ? fs.readFileSync(sc, "utf8") : "";
  const ids = [...fs.readFileSync(P.story, "utf8").matchAll(/^\s*S\((\d+),/gm)].map((m) => +m[1]);
  const notClean = ids.filter((i) => !new RegExp(`^\\s*-?\\s*${i}\\s+CLEAN\\b`, "m").test(text));
  if (!text || fs.statSync(sc).mtimeMs < newest || notClean.length)
    throw new Error(`self-check gate: ${!text ? "no SELF_CHECK.md" : fs.statSync(sc).mtimeMs < newest ? "SELF_CHECK.md is older than the code" : `shots not CLEAN: ${notClean.join(", ")}`} (PREVIEW=1 skips)`);
  // muted-viewer + said-not-shown gate (fb0110): the script was reviewed muted, and every shot says what its words show
  {
    const script = fs.readFileSync(`../bible/episodes/${ep}/SCRIPT.md`, "utf8");
    if (!/^- \[x\] .*tắt tiếng/m.test(script)) throw new Error("muted-review gate: tick the muted viewer review in SCRIPT.md (PREVIEW=1 skips)");
    const missing = ids.filter((i) => !new RegExp(`^\\s*-?\\s*${i}\\s+CLEAN\\b.*said-not-shown OK`, "m").test(text));
    if (missing.length) throw new Error(`said-not-shown gate: SELF_CHECK.md lines without "said-not-shown OK": ${missing.join(", ")} (PREVIEW=1 skips)`);
  }
  // expression gate (fb0106): faces hold a baseline per shot (no per-episode exemptions: a tool never names an episode)
  if (spawnSync(process.execPath, ["scripts/expr_qa.mjs"], { stdio: "inherit", env: { ...process.env, EP: name } }).status !== 0)
    throw new Error("expression gate: scripts/expr_qa.mjs failed (PREVIEW=1 skips)");
}
const mix = path.resolve(epPaths(name).mix);
if (!fs.existsSync(mix)) throw new Error(`${mix} missing: run studio/audio/build.py first`);

// chunk k = [start_k, start_{k+1}); a crossfade into shot s belongs wholly to s's chunk, so editing s-1 re-renders s too
const story = fs.readFileSync(epPaths(name).story, "utf8");
const FPS = 30;
const xfade = Object.fromEntries([...(story.match(/XFADE[^=]*=\s*\{([^}]*)\}/)?.[1] ?? "").matchAll(/(\d+):\s*(\d+)/g)].map((m) => [+m[1], +m[2]]));
// I(...) = a full-screen 2D insert shot (2D card): its own chunk, and the blank-frame check skips it (a space card is mostly black)
const shots = [...story.matchAll(/^\s*([SI])\((\d+),\s*([\d.]+),/gm)].map((m) => ({ id: +m[2], insert: m[1] === "I", start: Math.round(+m[3] * FPS) - Math.floor((xfade[+m[2]] ?? 0) / 2) }))
  .sort((p, q) => p.start - q.start);

const browserExecutable = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const chromiumOptions = { gl: "angle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public"), webpackOverride: epOverride(name) });
const composition = await selectComposition({ serveUrl, id: COMP, browserExecutable, chromiumOptions });
shots.forEach((s, i) => (s.end = (shots[i + 1]?.start ?? composition.durationInFrames) - 1));
if (shots[0].start !== 0 || shots.some((s) => s.end < s.start)) throw new Error("shot ranges do not tile the video: " + JSON.stringify(shots));

const dir = path.resolve("out", COMP, name, HALF ? "chunks_half" : PREVIEW ? "chunks_preview" : "chunks"); // per episode: parallel renders of two episodes overwrote each other's shotNN.mp4
fs.mkdirSync(dir, { recursive: true });
const file = (s) => path.join(dir, `shot${String(s.id).padStart(2, "0")}.mp4`);
const want = new Set(pick === "all" ? shots.map((s) => s.id) : pick.split(",").map(Number));
shots.forEach((s, i) => { if (want.has(s.id) && xfade[shots[i + 1]?.id]) want.add(shots[i + 1].id); });
// too many tabs at 2K exhaust the 8 GB GPU: shaders fail to compile (VALIDATE_STATUS false) and the 3D canvas renders blank
const CONCURRENCY = Number(process.env.CONCURRENCY || 2);
/** chunk frame indices where the 3D is gone: > 85 % of a 36 x 64 thumbnail is the composition background (#cfe3f2), white or black.
 * Needs 2+ frames in a row, so the 1-frame white flash after the hook passes. */
const FLAT = [[0xcf, 0xe3, 0xf2], [255, 255, 255], [0, 0, 0]];
// the hook's white flash fades over 4 frames (Short.tsx): those frames are flat by design
const FLASH = Math.round(Number(story.match(/FLASH_AT\s*=\s*F\(([\d.]+)\)/)?.[1] ?? -1) * FPS);
const blankAt = (f) => {
  const W = 36, H = 64, n = W * H, px = spawnSync("ffmpeg", ["-v", "error", "-i", f, "-vf", `scale=${W}:${H}`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1 << 30 }).stdout;
  const flat = [];
  for (let i = 0; i * n * 3 < px.length; i++) {
    let k = 0;
    for (let j = 0; j < n; j++) { const o = (i * n + j) * 3; if (FLAT.some(([r, g, b]) => Math.abs(px[o] - r) + Math.abs(px[o + 1] - g) + Math.abs(px[o + 2] - b) < 40)) k++; }
    flat.push(k / n > 0.85);
  }
  return flat.flatMap((b, i) => (b && (flat[i - 1] || flat[i + 1]) ? [i] : []));
};
const done = [];
for (const s of shots) {
  if (!want.has(s.id) && fs.existsSync(file(s))) continue;
  done.push(s.id);
  for (const concurrency of [CONCURRENCY, 1]) {
    const t0 = Date.now();
    await renderMedia({ composition, serveUrl, codec: "h264", crf: 16, muted: true, frameRange: [s.start, s.end], outputLocation: file(s),
      scale: SCALE, browserExecutable, chromiumOptions, timeoutInMilliseconds: 180000, concurrency });
    const bad = s.insert ? [] : blankAt(file(s)).filter((i) => s.start + i < FLASH || s.start + i > FLASH + 3);
    console.log(`shot ${s.id} [${s.start}-${s.end}] ${((Date.now() - t0) / 1000).toFixed(0)}s x${concurrency}${bad.length ? ` BLANK frames ${bad.slice(0, 8).join(", ")}${bad.length > 8 ? " ..." : ""}` : ""}`);
    if (!bad.length) break;
    if (concurrency === 1) { fs.rmSync(file(s)); throw new Error(`shot ${s.id} still renders blank frames with 1 tab`); }
  }
}

const list = path.join(dir, "list.txt");
fs.writeFileSync(list, shots.map((s) => `file '${file(s).replace(/\\/g, "/")}'`).join("\n"));
const git = (...a) => execFileSync("git", a, { encoding: "utf8" }).trim();
let sha; try { sha = git("rev-parse", "--short", "HEAD") + (git("status", "--porcelain") ? "-dirty" : ""); } catch { sha = "nogit"; } // shortcut: no repo yet, the publish gate needs one
const now = new Date(), pad = (n) => String(n).padStart(2, "0"); // local time, not UTC
const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`, hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
const stamp = `${day.replace(/-/g, "")}-${hm.replace(":", "")}`;
const base = `${name}_${stamp}_${sha}${HALF ? "_half" : PREVIEW ? "_preview" : ""}`;
const master = path.resolve("out", COMP, `${base}_master.mp4`), upload = path.resolve("out", COMP, `${base}_upload.mp4`);
const ff = (...a) => execFileSync("ffmpeg", ["-y", "-v", "error", ...a], { stdio: "inherit" });
ff("-f", "concat", "-safe", "0", "-i", list, "-i", mix, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-shortest", master);
ff("-i", master, "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", upload);

if (PREVIEW) { console.log("→", upload); process.exit(0); }
const dest = path.join(OUT_ROOT, name);
fs.mkdirSync(dest, { recursive: true });
for (const f of [master, upload]) fs.copyFileSync(f, path.join(dest, path.basename(f)));
const log = path.resolve("../RENDERS.md");
if (!fs.existsSync(log)) fs.writeFileSync(log, "# Renders\n\nFiles live in the shared MEGA folder (`OUT_ROOT`, default `out/final/<name>/`). One row per render, newest last.\n\n| date | name | commit | shots re-rendered | upload MB | note |\n|---|---|---|---|---|---|\n");
const mb = (fs.statSync(upload).size / 1e6).toFixed(1);
fs.appendFileSync(log, `| ${day} ${hm} | ${base} | ${sha} | ${done.length === shots.length ? "all" : done.join(",")} | ${mb} | ${process.env.NOTE ?? ""} |\n`);
console.log("→", path.join(dest, path.basename(upload)), mb, "MB");
