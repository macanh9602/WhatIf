"""Flicker gate on a finished video, no GPU. usage: python scripts/flicker_qa.py <video.mp4> [--limit N]
A flicker pixel differs from its neighbours in time while those two neighbours agree (z-fighting, popping). A thin
moving line does that once as it passes, so a block only counts when it blips again and again in the same place.
temporal_qa samples 16 frames per shot and missed the ep17 doormat; this scans every frame.
Self-check: flags ep17's 0114 master at 40-46 s (the doormat), passes 0155."""
import argparse, subprocess, sys
import numpy as np

W, H, FPS = 270, 480, 30
BLOCK = 15  # px of the small frame: a flicker must fill part of one block, so grain and captions do not add up
P = argparse.ArgumentParser(); P.add_argument("video"); P.add_argument("--limit", type=float, default=0.5)  # share of a block; 0.12-0.35 also flags thin lines under a moving camera
P.add_argument("--repeat", type=int, default=5)  # blips in one block within WINDOW frames
A = P.parse_args()

proc = subprocess.Popen(["ffmpeg", "-v", "error", "-i", A.video, "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
read = lambda: (lambda b: np.frombuffer(b, np.uint8).astype(np.int16).reshape(H, W) if len(b) == W * H else None)(proc.stdout.read(W * H))

WINDOW = 15
a, b, n, hits, recent = read(), read(), 1, [], []
if a is None or b is None: sys.exit(f"cannot read {A.video}")
while (c := read()) is not None:
    # one-frame blip: t differs from both sides by more than the sides differ from each other
    blip = (np.minimum(abs(b - a), abs(b - c)) - abs(c - a)) > 14
    h = H // BLOCK * BLOCK; w = W // BLOCK * BLOCK
    score = blip[:h, :w].reshape(h // BLOCK, BLOCK, w // BLOCK, BLOCK).mean((1, 3))
    # a cut or dip hits most of the frame at once: that is editing, not flicker
    on = score >= A.limit if blip.mean() < 0.25 else np.zeros_like(score, bool)
    recent = (recent + [on])[-WINDOW:]
    count = np.sum(recent, axis=0)
    if count.max() >= A.repeat:
        r, q = np.unravel_index(count.argmax(), count.shape)
        hits.append((n, float(count.max()), int(q * BLOCK / W * 100), int(r * BLOCK / H * 100)))
    a, b, n = b, c, n + 1
proc.wait()
assert n > 2 * FPS, "video too short: ffmpeg read failed?"

if not hits:
    print(f"PASS: no flicker in {n} frames"); sys.exit(0)
runs, start = [], hits[0]
for prev, cur in zip(hits, hits[1:] + [None]):  # group hits less than 1 s apart
    if cur is None or cur[0] - prev[0] > FPS:
        runs.append((start, prev)); start = cur
for s, e in runs:
    count = sum(s[0] <= h[0] <= e[0] for h in hits)
    print(f"{s[0] / FPS:6.2f}-{e[0] / FPS:6.2f} s  {count:3d} frames  at x {s[2]} % y {s[3]} %  peak {max(h[1] for h in hits if s[0] <= h[0] <= e[0]):.2f}")
print(f"FAIL: {len(runs)} flicker spans in {n} frames"); sys.exit(1)
