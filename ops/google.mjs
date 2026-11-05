// Google OAuth for the ops tools (installed-app loopback flow + PKCE, stdlib only) and a small authorised fetch.
// usage: node ops/google.mjs login   (once per machine: opens the browser, pick the channel, prints which one you got)
// client_secret*.json is read from OAUTH_CLIENT_DIR; token.json lives in WHATIF_OPS_DIR (never in the project).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import crypto from "node:crypto";
import { execFile } from "node:child_process";

// shared OAuth client with the Owen tool (same Cloud project); this channel keeps its own token
export const DIR = process.env.WHATIF_OPS_DIR || path.join(os.homedir(), ".config/whatif-ops");
const hasSecret = (d) => fs.existsSync(d) && fs.readdirSync(d).some((x) => /^client_secret.*.json$/.test(x));
const SECRETS = process.env.OAUTH_CLIENT_DIR || [DIR, path.join(os.homedir(), ".config/owen-ops")].find(hasSecret) || DIR;
const TOKEN = path.join(DIR, "token.json");
export const SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly"];

const client = () => {
  const f = fs.existsSync(SECRETS) && fs.readdirSync(SECRETS).find((x) => /^client_secret.*\.json$/.test(x));
  if (!f) throw new Error(`no client_secret*.json in ${SECRETS} (Google Cloud > Clients > Desktop app > Download JSON)`);
  const j = JSON.parse(fs.readFileSync(path.join(SECRETS, f), "utf8"));
  return j.installed ?? j.web;
};
const b64url = (b) => b.toString("base64url");
const saveToken = (t) => { fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(TOKEN + ".tmp", JSON.stringify(t, null, 2)); fs.renameSync(TOKEN + ".tmp", TOKEN); };

const tokenRequest = async (params) => {
  const c = client();
  const r = await fetch(c.token_uri, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: c.client_id, client_secret: c.client_secret, ...params }) });
  const j = await r.json();
  if (!r.ok) throw new Error(`token: ${j.error} ${j.error_description ?? ""}`.trim());
  return j;
};

/** browser consent on a one-shot 127.0.0.1 listener; resolves with the stored token */
export const login = async () => {
  const c = client(), verifier = b64url(crypto.randomBytes(48)), state = b64url(crypto.randomBytes(16));
  const challenge = b64url(crypto.createHash("sha256").update(verifier).digest());
  const srv = http.createServer();
  await new Promise((ok) => srv.listen(0, "127.0.0.1", ok));
  const redirect = `http://127.0.0.1:${srv.address().port}`;
  const url = `${c.auth_uri}?${new URLSearchParams({ client_id: c.client_id, redirect_uri: redirect, response_type: "code", scope: SCOPES.join(" "),
    access_type: "offline", prompt: "consent select_account", code_challenge: challenge, code_challenge_method: "S256", state })}`;
  console.log("Mở trình duyệt để đăng nhập (nếu không tự mở, dán link này):\n" + url);
  execFile("cmd", ["/c", "start", "", url.replace(/&/g, "^&")], () => {});
  const code = await new Promise((ok, bad) => {
    const timer = setTimeout(() => bad(new Error("login: hết 5 phút chờ")), 300e3);
    srv.on("request", (req, res) => {
      const q = new URL(req.url, redirect).searchParams;
      if (!q.has("code") && !q.has("error")) { res.writeHead(404); return res.end(); } // favicon etc.
      const good = q.get("state") === state && q.get("code");
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(good ? "<h3>Xong, quay lại terminal.</h3>" : "<h3>Lỗi đăng nhập, xem terminal.</h3>");
      clearTimeout(timer);
      good ? ok(q.get("code")) : bad(new Error(`login: ${q.get("error") ?? "state mismatch"}`));
    });
  }).finally(() => srv.close());
  const t = await tokenRequest({ grant_type: "authorization_code", code, redirect_uri: redirect, code_verifier: verifier });
  saveToken({ ...t, expiry: Date.now() + t.expires_in * 1000 });
};

const accessToken = async () => {
  if (!fs.existsSync(TOKEN)) throw new Error("chưa đăng nhập trên máy này: node ops/google.mjs login");
  const t = JSON.parse(fs.readFileSync(TOKEN, "utf8"));
  if (t.expiry - Date.now() > 60e3) return t.access_token;
  const n = await tokenRequest({ grant_type: "refresh_token", refresh_token: t.refresh_token }).catch((e) => {
    throw new Error(`${e.message}: refresh token hết hạn (app còn ở Testing?) → node ops/google.mjs login`);
  });
  saveToken({ ...t, ...n, expiry: Date.now() + n.expires_in * 1000 });
  return n.access_token;
};

/** authorised fetch; throws with Google's error message on a non-2xx */
export const gfetch = async (url, init = {}) => {
  const r = await fetch(url, { ...init, headers: { authorization: `Bearer ${await accessToken()}`, ...(init.headers ?? {}) } });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw Object.assign(new Error(`${r.status} ${j.error?.message ?? r.statusText}`), { status: r.status, reason: j.error?.errors?.[0]?.reason });
  }
  return r;
};
export const myChannel = async () => {
  const j = await (await gfetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&mine=true")).json();
  const ch = j.items?.[0];
  if (!ch) throw new Error("tài khoản này chưa có kênh YouTube");
  return { id: ch.id, title: ch.snippet.title, uploads: ch.contentDetails.relatedPlaylists.uploads };
};

if (process.argv[1]?.endsWith("google.mjs") && process.argv[2] === "login") {
  await login();
  const ch = await myChannel();
  console.log(`Đăng nhập xong: kênh "${ch.title}" (${ch.id}). Sai kênh → chạy lại login và chọn kênh khác.`);
}
