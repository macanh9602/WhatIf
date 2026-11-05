// usage (from the project root):
//   node ops/google.mjs login        once: opens the browser, pick the What If channel
//   node ops/upload.mjs              dry run: checks channel, files, times; uploads nothing
//   node ops/upload.mjs --go [ep..]  uploads every card (or the named eps) as private + publishAt; YouTube publishes it
// Since 2026-11-02 unverified API projects are no longer locked to private (YouTube API revision history).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gfetch, myChannel } from "./google.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOG = path.join(ROOT, "ops/uploaded.json");
const cards = JSON.parse(fs.readFileSync(path.join(ROOT, "ops/cards.json"), "utf8"));
const done = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, "utf8")) : {};

/** card → videos.insert body; publishAt needs privacyStatus private and a future time */
export const meta = (c, now = Date.now()) => {
  const at = new Date(c.publishAt);
  if (isNaN(at)) throw new Error(`${c.ep}: bad publishAt ${c.publishAt}`);
  if (at - now < 15 * 60e3) throw new Error(`${c.ep}: publishAt ${c.publishAt} is less than 15 min away`);
  if (!c.title || c.title.length > 100) throw new Error(`${c.ep}: title empty or > 100 chars`);
  return {
    snippet: { title: c.title, description: c.description, tags: c.tags, categoryId: "27" /* Education */, defaultLanguage: "en", defaultAudioLanguage: "en" },
    status: { privacyStatus: "private", publishAt: at.toISOString(), selfDeclaredMadeForKids: false, containsSyntheticMedia: true /* cloned narrator voice */ },
  };
};

const upload = async (file, body) => {
  const size = fs.statSync(file).size;
  const init = await gfetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
    method: "POST", body: JSON.stringify(body),
    headers: { "content-type": "application/json; charset=UTF-8", "x-upload-content-type": "video/mp4", "x-upload-content-length": String(size) },
  });
  const r = await gfetch(init.headers.get("location"), { method: "PUT", body: fs.readFileSync(file), headers: { "content-type": "video/mp4" } });
  return r.json();
};

if (process.argv[2] === "--self-test") {
  const c = { ep: "t", publishAt: "2026-11-06T07:00:00+07:00", title: "x", description: "", tags: [] };
  console.assert(meta(c, Date.parse("2026-11-05T12:00:00Z")).status.publishAt === "2026-11-06T00:00:00.000Z", "UTC conversion");
  let threw = false; try { meta(c, Date.parse("2026-11-06T00:00:00Z")); } catch { threw = true; }
  console.assert(threw, "past publishAt must throw");
  console.log("self-test done");
  process.exit(0);
}

const go = process.argv[2] === "--go", only = process.argv.slice(3);
const ch = await myChannel();
console.log(`channel: ${ch.title} (${ch.id})`);
if (ch.id !== cards.channelId) throw new Error(`wrong channel: logged in as ${ch.id}, cards are for ${cards.channelId}. Run: node ops/google.mjs login`);

for (const c of cards.videos.filter((v) => !only.length || only.includes(v.ep))) {
  const file = path.join(ROOT, c.file), body = meta(c);
  if (!fs.existsSync(file)) throw new Error(`${c.ep}: missing ${c.file}`);
  if (done[c.ep]) { console.log(`${c.ep}: already uploaded ${done[c.ep].id}, skipped`); continue; }
  console.log(`${c.ep}: ${c.title} | ${(fs.statSync(file).size / 1e6).toFixed(1)} MB | publishes ${c.publishAt}`);
  if (!go) continue;
  const v = await upload(file, body);
  done[c.ep] = { id: v.id, publishAt: v.status?.publishAt, privacy: v.status?.privacyStatus, uploadedAt: new Date().toISOString(), file: c.file };
  fs.writeFileSync(LOG, JSON.stringify(done, null, 2));
  console.log(`  → https://studio.youtube.com/video/${v.id}/edit  (status ${v.status?.privacyStatus}, publishAt ${v.status?.publishAt})`);
}
if (!go) console.log("dry run only. Upload: node ops/upload.mjs --go");
