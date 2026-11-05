// usage: node ops/stats.mjs   pulls every uploaded video (ops/uploaded.json) into ops/stats/<YYYY-MM-DD>.json. Read-only on YouTube.
// Data API: views/likes/comments (lags Studio by hours). Analytics API (lags ~1-2 days): watch time, % viewed, retention
// curve, traffic sources, subs. "Viewed vs swiped away" is not in the API; the retention at the first points stands in.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gfetch, myChannel } from "./google.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uploaded = JSON.parse(fs.readFileSync(path.join(ROOT, "ops/uploaded.json"), "utf8"));
const day = (d) => d.toISOString().slice(0, 10);
const report = async (q) => {
  const r = await (await gfetch(`https://youtubeanalytics.googleapis.com/v2/reports?${new URLSearchParams({ ids: "channel==MINE", ...q })}`)).json();
  const names = (r.columnHeaders ?? []).map((h) => h.name);
  return (r.rows ?? []).map((row) => Object.fromEntries(names.map((n, i) => [n, row[i]])));
};

const ch = await myChannel();
const ids = Object.entries(uploaded).map(([ep, u]) => ({ ep, id: u.id, publishAt: u.publishAt }));
const data = (await (await gfetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,status,snippet,contentDetails&id=${ids.map((x) => x.id).join(",")}`)).json()).items;
const out = { at: new Date().toISOString(), channel: ch, videos: [] };
for (const { ep, id, publishAt } of ids) {
  const v = data.find((x) => x.id === id);
  if (!v) { out.videos.push({ ep, id, missing: true }); continue; }
  const row = { ep, id, title: v.snippet.title, privacy: v.status.privacyStatus, publishAt, duration: v.contentDetails.duration,
    views: +v.statistics.viewCount, likes: +(v.statistics.likeCount ?? 0), comments: +(v.statistics.commentCount ?? 0) };
  const span = { startDate: day(new Date(Date.parse(publishAt) - 864e5)), endDate: day(new Date()), filters: `video==${id}` };
  try {
    row.analytics = (await report({ ...span, metrics: "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,likes,shares,subscribersGained" }))[0] ?? null;
    row.retention = (await report({ ...span, dimensions: "elapsedVideoTimeRatio", metrics: "audienceWatchRatio,relativeRetentionPerformance" }))
      .map((r) => [r.elapsedVideoTimeRatio, +r.audienceWatchRatio.toFixed(3), +r.relativeRetentionPerformance.toFixed(3)]);
    row.traffic = await report({ ...span, dimensions: "insightTrafficSourceType", metrics: "views", sort: "-views" });
    row.countries = (await report({ ...span, dimensions: "country", metrics: "views,averageViewDuration,averageViewPercentage", sort: "-views", maxResults: 10 }));
  } catch (e) { row.analyticsError = e.message; } // no analytics scope yet, or data not ready
  out.videos.push(row);
}
// channel-wide top countries since the first upload (the per-video lists above can be sparse while data is thin)
try {
  const first = Math.min(...ids.map((x) => Date.parse(x.publishAt)));
  out.countries = await report({ startDate: day(new Date(first - 864e5)), endDate: day(new Date()), dimensions: "country",
    metrics: "views,averageViewDuration,averageViewPercentage", sort: "-views", maxResults: 15 });
} catch (e) { out.countriesError = e.message; }
const dir = path.join(ROOT, "ops/stats");
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, `${day(new Date(Date.now() + 7 * 3600e3))}.json`); // dated in Vietnam time
fs.writeFileSync(file, JSON.stringify(out, null, 2));
for (const r of out.videos) console.log(`${r.ep} ${String(r.views).padStart(6)} views ${r.analytics ? `${r.analytics.averageViewPercentage?.toFixed?.(1)}% viewed` : r.analyticsError ? "(" + r.analyticsError.slice(0, 60) + ")" : "(no analytics yet)"}`);
console.log(`countries: ${(out.countries ?? []).map((c) => `${c.country} ${c.views}`).join(", ") || out.countriesError || "(no data yet)"}`);
console.log(`→ ${file}`);
