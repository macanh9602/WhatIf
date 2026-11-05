# Every word("x", n) cue in cast.ts must exist in the narration (n = 0-based occurrence), else the render throws mid-way.
# Run: python scripts/check_words.py   (exit 1 lists the missing cues)
import json, os, re, sys
EP = os.environ.get("EP") or sorted(d for d in os.listdir("src/videos/engine/eps") if re.fullmatch(r"ep\d+", d))[-1]  # same rule as scripts/ep.mjs
w = [x["text"] for x in json.load(open(f"public/eps/{EP}/words.json", encoding="utf-8"))]
src = open(f"src/videos/engine/eps/{EP}/cast.ts", encoding="utf-8").read()
bad = sorted({(t, int(n or 0)) for t, n in re.findall(r'word\("([^"]+)"(?:,\s*(\d+))?\)', src) if w.count(t) <= int(n or 0)})
print("missing word cues:", bad) if bad else print("word cues ok")
sys.exit(1 if bad else 0)
