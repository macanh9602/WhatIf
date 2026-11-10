// Muse lab H13: render the LeadCard composition (episode lead, transparent) to a ProRes 4444 .mov for compositing.
// usage (from studio/): EP=<ep> PROPS='{"expr":[[0,"curious"],[1.6,"squint"]],"look":0.8}' node scripts/lead_card.mjs <out.mov> [frames=120]
import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { epOverride } from "./ep.mjs";

if (process.env.REMOTION_TMP) { fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true }); process.env.TEMP = process.env.TMP = process.env.REMOTION_TMP; }
const [out, frames = "120"] = process.argv.slice(2);
if (!process.env.GPU_LOCK) throw new Error("GPU job: run it as  sh scripts/gpu.sh node scripts/lead_card.mjs ...  (one job at a time on the 8 GB card)");
if (!out || !process.env.EP) { console.error("usage: EP=<ep> PROPS=... node scripts/lead_card.mjs <out.mov> [frames]"); process.exit(1); }
const browserExecutable = process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const inputProps = JSON.parse(process.env.PROPS || "{}");
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public"), webpackOverride: epOverride(process.env.EP) });
const composition = { ...(await selectComposition({ serveUrl, id: "LeadCard", browserExecutable, inputProps })), durationInFrames: +frames };
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
await renderMedia({ composition, serveUrl, codec: "prores", proResProfile: "4444", imageFormat: "png", pixelFormat: "yuva444p10le",
  inputProps, outputLocation: out, browserExecutable, concurrency: 2 });
console.log("→", out);
