# Viewer-review pack (skill-evolution fb0020): what a reviewer model "watches" instead of the video.
#   python scripts/review_pack.py <video.mp4> <shots.csv: id,first,last> <outdir> [per_sheet=4] [big]
# cam: 8 evenly spaced frames per shot at 135 x 240, so the DP reviewer sees camera moves (fb0035)
# act: 6 frames per shot at 270 x 480, faces readable across each beat, for the producer acting review (fb0036)
# big: 2 frames per shot (1/3, 2/3) at 540 x 960 for the animation-lead review (art defects need real pixels)
# Per shot 4 frames (start, 1/3, 2/3, end) with burned captions, shots in screen order, `per_sheet` shots per image,
# plus transcript.md (narration words with times from public/owen/<ep>/words.json) and index.md (sheet -> shots, times).
import csv, json, os, re, subprocess, sys
EP = os.environ.get("EP") or sorted(d for d in os.listdir("src/videos/owen/eps") if re.fullmatch(r"ep\d+", d))[-1]  # same rule as scripts/ep.mjs
from PIL import Image, ImageDraw

FPS = 30

def grab(video, frames):
    """frames by index from ONE decode pass. "-ss f/FPS" is not frame-exact on these files (B-frame delay): it returned
    frame f+1, so every pack before r5 showed the next shot as a shot's last frame."""
    want, got, n, size = set(frames), {}, 0, W * H * 3
    pr = subprocess.Popen(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    while len(got) < len(want) and (buf := pr.stdout.read(size)) and len(buf) == size:
        if n in want: got[n] = Image.frombytes("RGB", (W, H), buf)
        n += 1
    pr.kill()
    return got

if __name__ == "__main__":
    video, shots_csv, out = sys.argv[1:4]
    per = int(sys.argv[4]) if len(sys.argv) > 4 else 4
    mode = sys.argv[5] if len(sys.argv) > 5 else ""
    big, cam, act = mode == "big", mode == "cam", mode == "act"
    global W, H
    W, H = (540, 960) if big else (135, 240) if cam else (270, 480) if act else (216, 384)
    os.makedirs(out, exist_ok=True)
    shots = sorted(([int(v) for v in r] for r in csv.reader(open(shots_csv))), key=lambda s: s[1])
    index = []
    pick = lambda a, b: [a + (b - a) // 3, a + 2 * (b - a) // 3] if big else [a + (b - a) * i // 7 for i in range(8)] if cam else [a + (b - a) * i // 5 for i in range(6)] if act else [a, a + (b - a) // 3, a + 2 * (b - a) // 3, b]
    img = grab(video, [f for _, a, b in shots for f in pick(a, b)])
    for k in range(0, len(shots), per):
        group = shots[k:k + per]
        nf = 2 if big else 8 if cam else 6 if act else 4
        sheet = Image.new("RGB", (nf * W + 10, len(group) * (H + 24)), "white")
        d = ImageDraw.Draw(sheet)
        for r, (sid, a, b) in enumerate(group):
            y = r * (H + 24)
            d.text((4, y + 4), f"shot {sid}  {a / FPS:.1f}-{(b + 1) / FPS:.1f} s", fill="black")
            for c, f in enumerate(pick(a, b)):
                sheet.paste(img[f], (c * W + (c > 0) * 3, y + 22))
        name = f"sheet_{k // per + 1:02d}.jpg"
        sheet.save(os.path.join(out, name), quality=88)
        index.append(f"- {name}: " + ", ".join(f"shot {s} ({a / FPS:.1f}-{(b + 1) / FPS:.1f} s)" for s, a, b in group))
    words = json.load(open(f"public/owen/{EP}/words.json", encoding="utf-8"))
    words = words.get("words", words) if isinstance(words, dict) else words
    # words.json has no punctuation: a new line at every pause > 0.25 s
    lines, cur, t0 = [], [], None
    for i, w in enumerate(words):
        t0 = w["start"] if t0 is None else t0
        cur.append(w.get("text", w.get("word", "")))
        if i + 1 == len(words) or words[i + 1]["start"] - w["end"] > 0.25: lines.append(f"[{t0:5.1f} s] {' '.join(cur)}"); cur, t0 = [], None
    if cur: lines.append(f"[{t0:5.1f} s] {' '.join(cur)}")
    open(os.path.join(out, "transcript.md"), "w", encoding="utf-8").write("# Narration (Mom, deadpan)\n" + "\n".join(lines) + "\n")
    open(os.path.join(out, "index.md"), "w", encoding="utf-8").write(f"# Review sheets ({nf} frames per shot, evenly spaced from first to last frame)\n" + "\n".join(index) + "\n")
    print(len(index), "sheets ->", out)
