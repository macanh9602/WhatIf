// Which episode a bundle builds: the engine in src/videos/engine imports the episode's shots / acting / words from "@ep",
// aliased here to src/videos/engine/eps/<ep>. EP env wins; otherwise the newest eps/<ep> folder (the one in production).
// Every script that bundles src/index.ts passes webpackOverride: epOverride(); remotion.config.ts does the same for the Studio.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// the Remotion CLI loads remotion.config.ts as CommonJS, where import.meta.url is undefined; it always runs from studio/
export const STUDIO = import.meta.url ? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..") : process.cwd();
const EPS = path.join(STUDIO, "src/videos/engine/eps");

export const episodes = () => fs.readdirSync(EPS).filter((d) => /^ep\d+$/.test(d)).sort();
export const activeEp = (ep = process.env.EP) => {
  const name = ep || episodes().at(-1);
  if (!name || !fs.existsSync(path.join(EPS, name))) throw new Error(`episode "${name}" not found in ${EPS} (have: ${episodes().join(", ")})`);
  return name;
};
/** per-episode paths, relative to studio/ */
export const epPaths = (ep = activeEp()) => ({
  ep, code: `src/videos/engine/eps/${ep}`, story: `src/videos/engine/eps/${ep}/story.ts`,
  pub: `public/eps/${ep}`, words: `public/eps/${ep}/words.json`, mix: `public/eps/${ep}/mix.wav`, voice: `public/eps/${ep}/voice.mp3`,
});
export const epOverride = (ep = activeEp()) => {
  console.log(`[ep] bundling ${ep}`);
  return (c) => ({ ...c, resolve: { ...c.resolve, alias: { ...(c.resolve?.alias ?? {}), "@ep": path.join(EPS, ep) } } });
};
