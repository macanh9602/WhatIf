// Muse lab: lay our captions, hook flash and mix over a Muse picture-only cut.
// usage (from studio/): [CAP_TOP='[[a,b],...]'] EP=<ep> node scripts/muse_final.mjs <public-relative picture.mp4> <out.mp4> [scale=1]
// Writes <out.mp4> (h264 + mix.wav) and <out>_x1.1_upload.mp4 (the channel's 1.1x upload copy).
import path from "path";
import fs from "fs";
import { spawnSync } from "child_process";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { epOverride, epPaths } from "./ep.mjs";

if (process.env.REMOTION_TMP) { fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true }); process.env.TEMP = process.env.TMP = process.env.REMOTION_TMP; }
const [bg, out, scale = "1"] = process.argv.slice(2);
const name = process.env.EP;
if (!bg || !out || !name) { console.error("usage: EP=<ep> node scripts/muse_final.mjs <public-relative picture.mp4> <out.mp4> [scale]"); process.exit(1); }
if (!fs.existsSync(path.resolve("public", bg))) throw new Error(`public/${bg} missing`);
const mix = path.resolve(epPaths(name).mix);
if (!fs.existsSync(mix)) throw new Error(`${mix} missing`);

const browserExecutable = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const chromiumOptions = { gl: "angle" };
const inputProps = { bg, capTop: JSON.parse(process.env.CAP_TOP || "[]") }; // CAP_TOP='[[69.2,73.2]]': captions on top in those seconds
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public"), webpackOverride: epOverride(name) });
const composition = await selectComposition({ serveUrl, id: "Short", browserExecutable, chromiumOptions, inputProps });
const silent = out.replace(/\.mp4$/, "_silent.mp4");
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
await renderMedia({ composition, serveUrl, codec: "h264", crf: 16, muted: true, inputProps, outputLocation: silent, scale: +scale,
  browserExecutable, chromiumOptions, timeoutInMilliseconds: 180000, concurrency: 2,
  onProgress: ({ progress }) => process.stdout.write(`\r${(progress * 100).toFixed(0)} %`) });
const ff = (...a) => { const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...a], { stdio: "inherit" }); if (r.status) throw new Error("ffmpeg failed"); };
ff("-i", silent, "-i", mix, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-shortest", out);
ff("-i", out, "-filter_complex", "[0:v]setpts=PTS/1.1,fps=30[v];[0:a]atempo=1.1[a]", "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "slow",
  "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out.replace(/\.mp4$/, "_x1.1_upload.mp4"));
fs.rmSync(silent);
console.log("\n→", out);
