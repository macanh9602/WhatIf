// Producer self-check pack (fb0099): what a viewer pauses on, at a size where defects show.
// usage: COMP=OwenShort node scripts/selfcheck.mjs <outDir> [shotIds e.g. 6,11]
// Per shot: a frame at every caption phrase start (where a viewer's screenshot lands) + the shot midpoint, at scale 0.75 WITH
// captions, joined into one sheet per shot (scripts/selfcheck_sheet.py). The ep01 self-check at 0.25 scale, 3 frames per shot,
// missed every defect the user then found at full size (floating pen, a 3rd hand, chair rails through bodies, a desk top across
// a chest, a half-hidden blank face, a mug under the head). Open every sheet, run review_prompts/F.md on it, write SELF_CHECK.md.
import fs from "node:fs";
if (process.env.REMOTION_TMP) { fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true }); process.env.TEMP = process.env.TMP = process.env.REMOTION_TMP; }
import { bundle } from "@remotion/bundler";
import { epOverride, epPaths } from "./ep.mjs";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import path from "node:path";

const [outDir = "out/selfcheck", only] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const browserExecutable = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const chromiumOptions = { gl: "angle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public"), webpackOverride: epOverride() });
const id = process.env.COMP || "OwenShort";
const comp = async (inputProps) => selectComposition({ serveUrl, id, browserExecutable, chromiumOptions, inputProps });
const qaComp = await comp({ qa: true, captions: false });
const logs = [];
await renderStill({ composition: qaComp, serveUrl, frame: 0, output: `${outDir}/_probe.jpg`, inputProps: { qa: true, captions: false }, scale: 0.1,
  browserExecutable, chromiumOptions, logLevel: "error", onBrowserLog: (l) => logs.push(l.text) });
const shots = JSON.parse(logs.find((l) => l.startsWith("QASHOTS ")).slice(8));
const words = JSON.parse(fs.readFileSync(epPaths().words, "utf8"));
const W = Array.isArray(words) ? words : words.words;
const composition = await comp({});
const want = only ? new Set(only.split(",").map(Number)) : null;
for (const [sid, a, b] of shots) {
  if (want && !want.has(sid)) continue;
  // phrase starts: a word after a pause or after . , ? ! (captions.ts breaks there), at least 12 frames apart
  const starts = W.filter((w, k) => k === 0 || w.start - W[k - 1].end > 0.15 || /[.,?!]$/.test(W[k - 1].text)).map((w) => Math.round(w.start * 30) + 6);
  let fr = [...starts.filter((f) => f > a && f < b), Math.round((a + b) / 2)].sort((x, y) => x - y);
  fr = fr.filter((f, k) => k === 0 || f - fr[k - 1] >= 12).slice(0, 5);
  for (const f of fr) await renderStill({ composition, serveUrl, frame: f, output: `${outDir}/s${String(sid).padStart(2, "0")}_f${f}.jpg`, imageFormat: "jpeg",
    jpegQuality: 88, scale: 0.75, browserExecutable, chromiumOptions, timeoutInMilliseconds: 180000, logLevel: "error" });
  console.log(`shot ${sid}: frames ${fr.join(", ")}`);
}
fs.rmSync(`${outDir}/_probe.jpg`, { force: true });
execFileSync("python", ["scripts/selfcheck_sheet.py", outDir], { stdio: "inherit" });
