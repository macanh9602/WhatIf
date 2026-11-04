// Which episode a bundle builds: the engine in src/videos/owen imports the episode's shots / acting / words from "@ep",
// aliased here to src/videos/owen/eps/<ep>. EP env wins; otherwise the newest eps/<ep> folder (the one in production).
// Every script that bundles src/index.ts passes webpackOverride: epOverride(); remotion.config.ts does the same for the Studio.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const STUDIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EPS = path.join(STUDIO, "src/videos/owen/eps");

export const episodes = () => fs.readdirSync(EPS).filter((d) => /^ep\d+$/.test(d)).sort();
export const activeEp = (ep = process.env.EP) => {
  const name = ep || episodes().at(-1);
  if (!name || !fs.existsSync(path.join(EPS, name))) throw new Error(`episode "${name}" not found in ${EPS} (have: ${episodes().join(", ")})`);
  return name;
};
/** per-episode paths, relative to studio/ */
export const epPaths = (ep = activeEp()) => ({
  ep, code: `src/videos/owen/eps/${ep}`, story: `src/videos/owen/eps/${ep}/story.ts`,
  pub: `public/owen/${ep}`, words: `public/owen/${ep}/words.json`, mix: `public/owen/${ep}/mix.wav`, voice: `public/owen/${ep}/voice.mp3`,
});
export const epOverride = (ep = activeEp()) => {
  console.log(`[ep] bundling ${ep}`);
  return (c) => ({ ...c, resolve: { ...c.resolve, alias: { ...(c.resolve?.alias ?? {}), "@ep": path.join(EPS, ep) } } });
};
