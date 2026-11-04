// REMOTION_TMP=E:/remotion-tmp node scripts/sets-stills.mjs [frame,frame,...] [scale=0.5]
// Include the CC0 GLBs used by the production sets.
import fs from "node:fs";
import path from "node:path";

if (!process.env.REMOTION_TMP) throw new Error("Set REMOTION_TMP=E:/remotion-tmp before rendering.");
fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true });
process.env.TEMP = process.env.TMP = process.env.REMOTION_TMP;
// Dynamic imports ensure os.tmpdir() consumers see the required environment first.
const { bundle } = await import("@remotion/bundler");
const { renderStill, selectComposition, openBrowser } = await import("@remotion/renderer");
const outputDir = path.resolve("out/sets");
fs.mkdirSync(outputDir, { recursive: true });
const browserExecutable = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const chromiumOptions = { gl: "angle" };
const cameraNames = {
  bedroom: ["wide", "owenClose", "mirror", "door", "desk", "bed", "calendar"],
  classroom: ["wide", "twoShot", "patelClose", "handClose", "owenSeat"],
  kitchen: ["wide", "momClose", "owenClose", "fridge", "night"],
  schoolyard: ["wide", "bench", "court", "steps", "tray"],
  waterpark: ["wide", "chairs", "slide"],
};
const names = Object.entries(cameraNames).flatMap(([set, cams]) => cams.map((cam) => `${set}-${cam}`));
const frames = process.argv[2] ? process.argv[2].split(",").map(Number) : names.map((_, i) => i);
const scale = Number(process.argv[3] ?? 0.5);
if (!(scale > 0) || frames.some((f) => !Number.isInteger(f) || f < 0 || f >= names.length)) throw new Error("Invalid frames or scale");
const log = [];
const logName = process.argv[2] ? `render-log-${frames.join("-")}.txt` : "render-log.txt";
const write = (s) => { log.push(s); console.log(s); fs.writeFileSync(path.join(outputDir, logName), log.join("\n") + "\n"); };
let browser;
try {
  const serveUrl = await bundle({ entryPoint: path.resolve("src/sandboxes/sets/index.tsx"), publicDir: path.resolve("public") });
  browser = await openBrowser("chrome", { browserExecutable, chromiumOptions });
  const composition = await selectComposition({ serveUrl, id: "SetsPreview", browserExecutable, browserInstance: browser, chromiumOptions });
  for (const frame of frames) {
    const start = Date.now();
    await renderStill({ composition, serveUrl, frame, output: path.join(outputDir, `${String(frame).padStart(2, "0")}-${names[frame]}.jpg`),
      imageFormat: "jpeg", jpegQuality: 92, scale, browserInstance: browser, chromiumOptions, timeoutInMilliseconds: 180000,
      onBrowserLog: (l) => { if (l.text.includes("SETS_STATS") || l.type === "error" || l.type === "warning") write(`[${l.type}] ${l.text.slice(0, 1200)}`); } });
    write(`still ${frame} ${names[frame]} ${((Date.now() - start) / 1000).toFixed(2)}s`);
  }
} catch (e) {
  write(`RENDER_FAILED ${e?.stack ?? e}`); process.exitCode = 1;
} finally { if (browser) await browser.close({ silent: true }); }
