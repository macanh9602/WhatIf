// Burned-in captions from the voice word times (public/eps/<ep>/words.json): short phrases of up to 4 words / 22
// characters, never across a sentence or clause end (`stop`, set by pipeline/tts.py) or a pause, so a muted viewer reads whole
// thoughts ("He's right-handed", not "He's" | "right-handed"). Self-check: node src/videos/engine/captions.ts
export type Word = { text: string; start: number; end: number; stop?: boolean };

const fits = (c: Word[], max: number, chars: number) => c.length <= max && c.map((x) => x.text).join(" ").length <= chars;

export const chunk = (ws: Word[], max = 4, chars = 22, gap = 0.3): Word[][] => {
  // 1) runs: cut at sentence ends and pauses
  const runs: Word[][] = [];
  for (const w of ws) {
    const cur = runs[runs.length - 1], prev = cur?.[cur.length - 1];
    if (!cur || prev!.stop || w.start - prev!.end > gap) runs.push([w]);
    else cur.push(w);
  }
  // 2) split each run into the fewest even pieces that fit (no orphan last word: "water | park")
  const out: Word[][] = [];
  for (const r of runs) {
    for (let n = 1; n <= r.length; n++) {
      const size = Math.ceil(r.length / n), parts = Array.from({ length: n }, (_, k) => r.slice(Math.round((k * r.length) / n), Math.round(((k + 1) * r.length) / n)));
      if (size <= max && parts.every((p) => fits(p, max, chars))) { out.push(...parts); break; }
      if (n === r.length) out.push(...parts);
    }
  }
  return out;
};

/** the phrase on screen at time t (held until the next one starts, at most 0.5 s past its last word) */
export const phraseAt = (cs: Word[][], t: number): Word[] | null => {
  for (let i = 0; i < cs.length; i++) {
    const c = cs[i], end = Math.min(cs[i + 1]?.[0].start ?? Infinity, c[c.length - 1].end + 0.5);
    if (t >= (i ? c[0].start - 0.05 : 0) && t < end) return c; // the first phrase from frame 0: the hook (r5 A17)
  }
  return null;
};

if (typeof process !== "undefined" && process.argv?.[1]?.endsWith("captions.ts")) {
  const w = (text: string, start: number, end = start + 0.2): Word => ({ text, start, end });
  const cs = chunk([w("My", 0), w("son", 0.25), w("faked", 0.5), w("a", 0.75), w("Honestly", 2), w("right-handed", 2.25)], 3, 16);
  console.assert(JSON.stringify(cs.map((c) => c.map((x) => x.text))) === '[["My","son"],["faked","a"],["Honestly"],["right-handed"]]', "chunk"); // even split, no orphan
  const s = chunk([{ ...w("dodgeball", 0), stop: true }, w("And", 0.25), w("Sam", 0.5)]); // never across a sentence end
  console.assert(JSON.stringify(s.map((c) => c.map((x) => x.text))) === '[["dodgeball"],["And","Sam"]]', "stop");
  console.assert(phraseAt(cs, 0.6)?.[0].text === "faked" && phraseAt(cs, 1.5) === null && phraseAt(cs, 1.96)?.[0].text === "Honestly", "phraseAt");
  console.log("captions ok");
}
