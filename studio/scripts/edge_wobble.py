"""Temporal stability of static ink lines (line boiling / edge crawling).
usage: python scripts/edge_wobble.py video.mp4 START_S x0,y0,x1,y1 [x0,y0,x1,y1 ...] [--frames 12]
Each box must hold one near-horizontal static line and nothing that moves (characters, captions).
Per frame it finds the line's row in every column (ink-weighted centroid) and reports the spread of the
frame-to-frame motion across columns: a rigid line under a slow camera moves together (spread ~0.1-0.3 px);
a boiling line moves differently column by column. Fails (exit 1) above 0.5 px.
"""
import subprocess, sys, tempfile, glob, os
import numpy as np
from PIL import Image

LIMIT = 0.5


def wobble(frames, box):
    x0, y0, x1, y1 = box
    rows = []
    for im in frames:
        a = (255 - im[y0:y1, x0:x1]) ** 3
        ys = np.arange(y0, y1)[:, None]
        rows.append((a * ys).sum(0) / (a.sum(0) + 1e-9))
    return float(np.median(np.diff(np.array(rows), axis=0).std(1)))


def main(a):
    n = int(a[a.index("--frames") + 1]) if "--frames" in a else 12
    a = [x for i, x in enumerate(a) if x != "--frames" and (i == 0 or a[i - 1] != "--frames")]
    vid, t, boxes = a[0], a[1], [tuple(map(int, b.split(","))) for b in a[2:]]
    with tempfile.TemporaryDirectory() as d:
        subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", t, "-i", vid, "-frames:v", str(n), os.path.join(d, "f%03d.png")], check=True)
        frames = [np.asarray(Image.open(p).convert("L"), float) for p in sorted(glob.glob(os.path.join(d, "f*.png")))]
    worst = 0.0
    for b in boxes:
        w = wobble(frames, b)
        worst = max(worst, w)
        print(f"box {b}: wobble {w:.2f} px{'  <- BOILING' if w > LIMIT else ''}")
    sys.exit(1 if worst > LIMIT else 0)


if __name__ == "__main__":
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    # self-check: a rigid line moving 0.3 px/frame scores ~0; the same line with per-column noise scores high
    xs = np.arange(200)
    rigid = [np.where(np.abs(np.arange(60)[:, None] - (30 + 0.3 * k + 0 * xs)) < 2, 0.0, 255.0) for k in range(6)]
    noisy = [np.where(np.abs(np.arange(60)[:, None] - (30 + np.random.default_rng(k).integers(-2, 3, 200))) < 2, 0.0, 255.0) for k in range(6)]
    assert wobble(rigid, (0, 0, 200, 60)) < 0.05 and wobble(noisy, (0, 0, 200, 60)) > 1.0
    main(sys.argv[1:])
