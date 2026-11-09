// usage: node ops/replace.mjs <ep..>   re-uploads each ep's card file as a new scheduled video, then takes the schedule
// off the old one (it stays private, nothing is deleted; uploaded.json keeps it as <ep>_old). Old schedule stays if the upload fails.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { gfetch } from "./google.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOG = path.join(ROOT, "ops/uploaded.json");
const read = () => JSON.parse(fs.readFileSync(LOG, "utf8"));
for (const ep of process.argv.slice(2)) {
  const d = read(), old = d[ep];
  if (!old) throw new Error(`${ep}: not in uploaded.json`);
  delete d[ep]; fs.writeFileSync(LOG, JSON.stringify(d, null, 2));
  try { execFileSync("node", ["ops/upload.mjs", "--go", ep], { cwd: ROOT, stdio: "inherit" }); }
  catch (e) { const r = read(); r[ep] = old; fs.writeFileSync(LOG, JSON.stringify(r, null, 2)); throw new Error(`${ep}: upload failed, old video kept as is`); }
  const v = (await (await gfetch(`https://www.googleapis.com/youtube/v3/videos?part=status&id=${old.id}`)).json()).items?.[0];
  if (v?.status.privacyStatus === "private") {
    const { selfDeclaredMadeForKids, containsSyntheticMedia, embeddable, license, publicStatsViewable } = v.status;
    await gfetch("https://www.googleapis.com/youtube/v3/videos?part=status", { method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: old.id, status: { privacyStatus: "private", publishAt: null, selfDeclaredMadeForKids, containsSyntheticMedia, embeddable, license, publicStatsViewable } }) });
  } else console.log(`${ep}: old ${old.id} is ${v?.status.privacyStatus ?? "gone"}, left alone`);
  const r = read(); r[`${ep}_old`] = { ...old, publishAt: null, note: `replaced ${new Date().toISOString().slice(0, 10)}, schedule removed, kept private` };
  fs.writeFileSync(LOG, JSON.stringify(r, null, 2));
  console.log(`${ep}: new ${r[ep].id} scheduled ${r[ep].publishAt}; old ${old.id} unscheduled`);
}
