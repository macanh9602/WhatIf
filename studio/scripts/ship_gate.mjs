// The only way to make an upload copy. Episodes ship from the PREVIEW master, which skips every gate in render.mjs,
// so the checks that need no GPU run here, on the file that will be published.
// usage (from studio/): node scripts/ship_gate.mjs <ep> <preview_master.mp4>
// Blocks on: flicker_qa (z-fighting, popping), expr_qa (faces hold per shot). short_qa only writes its report to out/<ep>/qa.
// Not covered: temporal_qa (GPU, ~15 min; run it on the whole episode before this) and the independent critic.
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const [ep, master] = process.argv.slice(2);
if (!ep || !master || !fs.existsSync(master)) { console.error("usage: node scripts/ship_gate.mjs <ep> <preview_master.mp4>"); process.exit(2); }
const ok = (cmd, args) => spawnSync(cmd, args, { stdio: "inherit", env: { ...process.env, EP: ep } }).status === 0;

const failed = [
  ["flicker", "python", ["scripts/flicker_qa.py", master]],
  ["expression", process.execPath, ["scripts/expr_qa.mjs"]],
].filter(([, cmd, args]) => !ok(cmd, args)).map(([name]) => name);
ok("python", ["scripts/short_qa.py", master, `out/${ep}/qa`]);
if (failed.length) { console.error(`ship gate FAILED (${failed.join(", ")}): no upload copy written`); process.exit(1); }

const out = `out/Short/${ep}_x1.1_upload.mp4`;
fs.mkdirSync("out/Short", { recursive: true });
if (!ok("ffmpeg", ["-y", "-v", "error", "-i", master, "-filter_complex", "[0:v]setpts=PTS/1.1,fps=30[v];[0:a]atempo=1.1[a]", "-map", "[v]", "-map", "[a]",
  "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])) process.exit(1);
console.log(`ship gate PASSED -> ${out}`);
