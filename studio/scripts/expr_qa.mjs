// Expression gate (fb0106): exit 1 if any actor's face flickers. Reads the episode's code, renders nothing.
// Reference shorts hold one baseline face per shot (3-6 s); a change is a step within one emotion, or a 0.4-0.7 s pop back
// to the baseline (.claude/skills/cartoon-3d-short/references/reports/acting.md). Ep01 held faces 0.55 s (median).
// usage: [EP=ep02] node scripts/expr_qa.mjs
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { STUDIO, activeEp } from "./ep.mjs";

export const T = { hold: 1.1, pop: 0.7, warn: 3, max: 3, jumps: 1 };

/** pure judge: keys [[t, expr]...] (s), shot [a, b) (s), family table -> { bad: [], warn: [] } */
export function judgeExpr(keys, a, b, FAMILY) {
  const bad = [], warn = [];
  if (!keys.length) return { bad, warn };
  // what the viewer sees inside the shot
  let seg = [[a, [...keys].reverse().find(([t]) => t <= a)?.[1] ?? keys[0][1]]];
  for (const [t, e] of keys) if (t > a && t < b) seg.push([t, e]);
  const collapse = (s) => s.filter((x, i) => i === 0 || x[1] !== s[i - 1][1]);
  seg = collapse(seg);
  // pops: a short face that returns to the one before it is a reaction, not a change
  const dur = (s, i) => (i + 1 < s.length ? s[i + 1][0] : b) - s[i][0];
  for (let i = 1; i + 1 < seg.length; i++)
    if (dur(seg, i) <= T.pop && seg[i + 1][1] === seg[i - 1][1]) { seg.splice(i, 2); i--; }
  seg = collapse(seg);
  const changes = seg.length - 1;
  if (changes > T.max) bad.push(`${changes} expression changes in one shot (${seg.map((s) => s[1]).join(" > ")}): hold one baseline, max ${T.max}`);
  else if (changes >= T.warn) warn.push(`${changes} expression changes: only on a key beat`);
  for (let i = 0; i + 1 < seg.length; i++)
    if (dur(seg, i) < T.hold) bad.push(`${seg[i][1]} held ${dur(seg, i).toFixed(2)} s before ${seg[i + 1][1]} (min ${T.hold} s; a pop of <= ${T.pop} s must return to the face before it)`);
  const fam = (e) => FAMILY[e] ?? "?";
  const unknown = seg.filter((s) => !FAMILY[s[1]]).map((s) => s[1]);
  if (unknown.length) bad.push(`no family for ${unknown.join(", ")} (add to FAMILY in act.ts)`);
  const jumps = seg.slice(1).filter((s, i) => fam(s[1]) !== fam(seg[i][1]) && fam(s[1]) !== "calm" && fam(seg[i][1]) !== "calm").length;
  if (jumps > T.jumps) bad.push(`${jumps} jumps across emotion families (${seg.map((s) => `${s[1]}/${fam(s[1])}`).join(" > ")}): move along one emotion`);
  return { bad, warn };
}

async function main() {
  const ep = activeEp();
  const entry = path.join(STUDIO, "scripts", "expr_qa.entry.ts");
  const out = path.join(os.tmpdir(), `expr_qa_${ep}_${process.pid}.mjs`);
  await build({
    entryPoints: [entry], bundle: true, platform: "node", format: "esm", outfile: out, logLevel: "error",
    alias: { "@ep": path.join(STUDIO, "src/videos/engine/eps", ep) },
    loader: { ".png": "empty", ".jpg": "empty", ".glb": "empty", ".ttf": "empty", ".woff2": "empty", ".mp3": "empty", ".wav": "empty" },
  });
  const { SHOTS, acts, FAMILY, FPS } = await import(pathToFileURL(out).href);
  let fails = 0, warns = 0;
  for (const s of SHOTS) {
    const seen = new Set();
    for (const act of acts(s.id)) {
      if (!Array.isArray(act.expr) || seen.has(act.i)) continue; // mirrored reflections repeat the same actor id
      seen.add(act.i);
      const { bad, warn } = judgeExpr(act.expr, s.a / FPS, s.b / FPS, FAMILY);
      for (const m of bad) { console.log(`FAIL shot ${s.id} actor ${act.i}: ${m}`); fails++; }
      for (const m of warn) { console.log(`warn shot ${s.id} actor ${act.i}: ${m}`); warns++; }
    }
  }
  console.log(`expr_qa ${ep}: ${SHOTS.length} shots, ${fails} fail, ${warns} warn`);
  process.exit(fails ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
