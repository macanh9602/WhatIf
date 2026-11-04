// said-not-shown gate (fb0110): the SELF_CHECK.md line regex in render.mjs. usage: node scripts/render_gate.test.mjs (from studio/)
import fs from "node:fs";
const src = fs.readFileSync("scripts/render.mjs", "utf8");
const line = src.split("\n").find((l) => l.includes("said-not-shown OK`"));
const re = line.match(/new RegExp\((`[^`]+`)/)[1];
const text = "- 3 CLEAN  foo said-not-shown OK\n- 4 CLEAN bar\n- 13 CLEAN x said-not-shown OK";
const missing = [3, 4, 13].filter((i) => !new RegExp(eval(re), "m").test(text));
console.assert(JSON.stringify(missing) === "[4]", missing); console.log("gate regex ok", missing);
