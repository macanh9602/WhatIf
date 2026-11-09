// usage: node scripts/splice_hook.mjs <ep> <newTtsDir> <cutEnd> <oldEnd> <tempo>
// Swaps the opening line of an episode's voice without moving anything after it (shots stay timed):
// new clip [0, cutEnd] at <tempo> (<1 = slower), padded to <oldEnd>, then the old voice from <oldEnd> on.
// Backs up public/eps/<ep>/voice.mp3 + words.json as *_pre_hook.* once. Then run audio/build.py and re-render the opening shots.
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const [ep, dir, cutEnd, oldEnd, tempo] = process.argv.slice(2).map((x, i) => (i < 2 ? x : +x));
const pub = `public/eps/${ep}`, LEAD = 0.1;
for (const f of ["voice.mp3", "words.json"]) { const b = `${pub}/${f.replace(".", "_pre_hook.")}`; if (!fs.existsSync(b)) fs.copyFileSync(`${pub}/${f}`, b); }
const oldWords = JSON.parse(fs.readFileSync(`${pub}/words_pre_hook.json`, "utf8"));
const newWords = JSON.parse(fs.readFileSync(`${dir}/words.json`, "utf8")).filter((w) => w.end <= cutEnd + 0.01);
const at = (t) => +(LEAD + (t - LEAD) / tempo).toFixed(3);
const head = newWords.map((w, i) => ({ ...w, start: at(w.start), end: at(w.end), ...(i === newWords.length - 1 ? { stop: true } : {}) }));
if (head.at(-1).end > oldEnd - 0.05) throw new Error(`new line ends at ${head.at(-1).end}, past ${oldEnd}: raise tempo or cut earlier`);
const words = [...head, ...oldWords.filter((w) => w.start >= oldEnd)];
console.assert(words.every((w, i) => !i || w.start >= words[i - 1].start), "word times must not go backwards");

execFileSync("ffmpeg", ["-v", "error", "-y", "-i", `${dir}/voice.mp3`, "-i", `${pub}/voice_pre_hook.mp3`, "-filter_complex",
  `[0]aresample=44100,atrim=0:${cutEnd + 0.08},afade=t=out:st=${cutEnd + 0.03}:d=0.05,asetpts=PTS-STARTPTS,atempo=${tempo},apad=whole_dur=${oldEnd},atrim=0:${oldEnd}[a];` +
  `[1]aresample=44100,atrim=start=${oldEnd},asetpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=0:a=1`,
  "-ac", "1", "-c:a", "libmp3lame", "-b:a", "128k", `${pub}/voice.mp3`]);
fs.writeFileSync(`${pub}/words.json`, JSON.stringify(words));
console.log(`${ep}: "${head.map((w) => w.text).join(" ")}" 0.1-${head.at(-1).end}s, old voice resumes at ${oldEnd}s`);
