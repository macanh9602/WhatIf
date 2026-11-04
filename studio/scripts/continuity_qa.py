# Camera-grammar gate (camera grammar in cartoon-3d-short SKILL.md): two consecutive shots on the same subject must change
# the angle by >= 30 degrees or the shot size by one step, or the cut reads as a jump cut.
#   python scripts/continuity_qa.py [src/videos/owen/eps/<ep>/story.ts]      (exit 1 on a jump cut)
# Shots with a named camera ({ cam: "door" }) are skipped (their vectors live in sets.ts). "Same subject" = look points < 1.2 m apart.
import math, os, re, sys

S_RE = re.compile(r'S\((\d+),\s*([\d.]+),\s*[^,]+,\s*"(\w+)",\s*\{\s*local:\s*\[([^\]]+)\],\s*lookAt:\s*\[([^\]]+)\][^}]*\},\s*"(\w+)"')
SIZES = {"wide": 0, "mid": 1, "close": 2}

def shots(src):
    out = []
    for m in S_RE.finditer(src):
        pos, look = [float(v) for v in m.group(4).split(",")], [float(v) for v in m.group(5).split(",")]
        out.append({"id": int(m.group(1)), "t": float(m.group(2)), "set": m.group(3), "pos": pos, "look": look, "size": m.group(6)})
    return sorted(out, key=lambda s: s["t"])

def jump_cuts(shs):
    bad = []
    for a, b in zip(shs, shs[1:]):
        if a["set"] != b["set"] or math.dist(a["look"], b["look"]) > 1.2: continue
        ha = math.atan2(a["pos"][0] - a["look"][0], a["pos"][2] - a["look"][2])
        hb = math.atan2(b["pos"][0] - b["look"][0], b["pos"][2] - b["look"][2])
        ang = abs((math.degrees(ha - hb) + 180) % 360 - 180)
        da, db = math.dist(a["pos"], a["look"]), math.dist(b["pos"], b["look"])
        step = SIZES[a["size"]] != SIZES[b["size"]] or max(da, db) / max(1e-6, min(da, db)) >= 1.5  # 1.5x the distance = a size step
        if ang < 30 and not step:
            bad.append(f"shot {a['id']} -> {b['id']}: {ang:.0f} deg apart, both {a['size']} (want >= 30 deg or a size step)")
    return bad

if __name__ == "__main__":
    if "--test" in sys.argv:
        t = ('S(1, 0, 2, "x", { local: [0, 1, 3], lookAt: [0, 1, 0], fov: 40 }, "mid"),\n'
             'S(2, 2, 4, "x", { local: [0.5, 1, 3], lookAt: [0, 1, 0], fov: 40 }, "mid"),\n'   # ~10 deg, same size -> jump
             'S(3, 4, 6, "x", { local: [3, 1, 0.5], lookAt: [0, 1, 0], fov: 40 }, "mid"),\n'   # ~70 deg -> ok
             'S(4, 6, 8, "x", { local: [3, 1, 0.8], lookAt: [0, 1, 0], fov: 40 }, "close"),')  # same angle, size step -> ok
        r = jump_cuts(shots(t)); assert len(r) == 1 and r[0].startswith("shot 1 -> 2"), r; print("continuity_qa self-check ok"); sys.exit(0)
    EP = os.environ.get("EP") or sorted(d for d in os.listdir("src/videos/owen/eps") if re.fullmatch(r"ep\d+", d))[-1]  # same rule as scripts/ep.mjs
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    src = open(args[0] if args else f"src/videos/owen/eps/{EP}/story.ts", encoding="utf-8").read()
    shs = shots(src); bad = jump_cuts(shs)
    print(f"{len(shs)} shots checked"); print("\n".join(bad) or "PASSED"); sys.exit(1 if bad else 0)
