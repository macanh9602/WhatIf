// usage: node scripts/shots_csv.mjs [story.ts] > out/ep01/shots.csv   (default: the active episode, EP env / newest eps/<ep>)
// Shot frame ranges in screen order (id,first,last), computed like render.mjs: start = round(a*30) - floor(xfade/2).
import fs from "node:fs";
import { epPaths } from "./ep.mjs";
const FPS = 30;
const story = fs.readFileSync(process.argv[2] ?? epPaths().story, "utf8");
const total = Number(story.match(/TOTAL\s*=\s*(\d+)/)?.[1] ?? NaN);
const xfade = Object.fromEntries([...(story.match(/XFADE[^=]*=\s*\{([^}]*)\}/)?.[1] ?? "").matchAll(/(\d+):\s*(\d+)/g)].map((m) => [+m[1], +m[2]]));
const shots = [...story.matchAll(/^\s*S\((\d+),\s*([\d.]+),/gm)].map((m) => ({ id: +m[1], s: Math.round(+m[2] * FPS) - Math.floor((xfade[+m[1]] ?? 0) / 2) })).sort((a, b) => a.s - b.s);
if (!Number.isFinite(total)) throw new Error("TOTAL not found in story.ts");
process.stdout.write(shots.map((x, i) => `${x.id},${x.s},${(shots[i + 1]?.s ?? total) - 1}`).join("\n") + "\n");
