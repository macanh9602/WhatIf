"""Muse delivery gate: run on EVERY clip Muse sends, before anyone calls it usable (bible/MUSE_PIPELINE.md step 5).

usage: python scripts/muse_check.py <clip.mp4> <outdir> [--box x0 y0 x1 y1]... [--step 0.25]
  --box   a region to judge by eye (an object that must keep ONE design; make it cover the object's whole path). Repeatable.
Writes <outdir>/<clip>_crops<N>.jpg (full-res crops every --step s, time stamped: read them, a 240 px sheet hides model swaps)
and <outdir>/<clip>_cam.jpg (frame 0 | worst frame). Prints and gates (exit 1) on what a number can catch:
  frozen head / tail  (a retimed take padded with a held frame)
  camera not locked   (median shift of the textured blocks vs frame 0: a blast scrambles a few blocks, a push-in moves most)
  biggest change at   (where the beat really landed; compare with the brief, not gated)
Object identity is NOT measured: that is what the crops are for.
"""
import argparse, os, subprocess, sys, numpy as np
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser()
ap.add_argument("clip"); ap.add_argument("out")
ap.add_argument("--box", type=int, nargs=4, action="append", default=[])
ap.add_argument("--step", type=float, default=0.25)
ap.add_argument("--cam", type=float, default=4.0, help="max median block shift vs frame 0 (full-res px) for a locked camera")
a = ap.parse_args()
probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height,r_frame_rate", "-of", "csv=p=0", a.clip],
                       capture_output=True, text=True).stdout.strip().split(",")
W, H = int(probe[0]), int(probe[1]); n, d = probe[2].split("/"); FPS = float(n) / float(d)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", a.clip, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3); N = len(F)
assert N > 1, "no frames decoded"
G = F[:, ::4, ::4].astype(np.float32).mean(3)  # quarter-res gray is enough for the numbers
os.makedirs(a.out, exist_ok=True); name = os.path.splitext(os.path.basename(a.clip))[0]

step = np.abs(np.diff(G, axis=0)).mean((1, 2))  # frame-to-frame change
still = step < 0.02  # a held frame is ~0.00; settling dust is 0.03+ (calibrated on ep14 sB_empty v1 / v2)
head = next((i for i, s in enumerate(still) if not s), N - 1) / FPS
tail = next((i for i, s in enumerate(still[::-1]) if not s), N - 1) / FPS

BY, BX = 8, 6  # per-block phase correlation vs frame 0 at half res; changed content gives junk shifts, the median ignores them
G2 = F[:, ::2, ::2].astype(np.float32).mean(3); bh, bw = G2.shape[1] // BY, G2.shape[2] // BX
blocks = lambda g: g[:bh * BY, :bw * BX].reshape(BY, bh, BX, bw).swapaxes(1, 2).reshape(BY * BX, bh, bw)
win = np.outer(np.hanning(bh), np.hanning(bw))
spec = lambda g: np.fft.fft2((blocks(g) - blocks(g).mean((1, 2), keepdims=True)) * win)
S0 = spec(G2[0]); tex = blocks(G2[0]).std((1, 2)) > 8  # only blocks with something drawn in frame 0 can show a move
def shift(g):  # median block displacement in full-res px
    R = S0[tex] * np.conj(spec(g)[tex]); r = np.fft.ifft2(R / (np.abs(R) + 1e-6)).real
    k = r.reshape(len(r), -1).argmax(1); dy, dx = k // bw, k % bw
    dy = np.where(dy > bh // 2, dy - bh, dy); dx = np.where(dx > bw // 2, dx - bw, dx)
    return 2 * np.median(np.hypot(dy, dx))
cam = np.array([shift(g) for g in G2])
worst = int(cam.argmax())

fails = []
if head > 0.2: fails.append(f"frozen head {head:.2f} s")
if tail > 0.2: fails.append(f"frozen tail {tail:.2f} s")
if cam.max() > a.cam: fails.append(f"camera not locked: {cam.max():.0f} px at {worst / FPS:.2f} s (limit {a.cam})")
print(f"{name}: {N} f, {N / FPS:.2f} s, {W}x{H}")
print(f"  frozen head {head:.2f} s, tail {tail:.2f} s")
print(f"  camera: median block shift max {cam.max():.0f} px at {worst / FPS:.2f} s, end {cam[-1]:.0f} px")
print(f"  biggest change at {(int(step.argmax()) + 1) / FPS:.2f} s")

Image.fromarray(np.concatenate([F[0], F[worst]], 1)).save(f"{a.out}/{name}_cam.jpg", quality=88)
idx = sorted({min(int(round(t * FPS)), N - 1) for t in np.arange(0, N / FPS, a.step)})
for k, (x0, y0, x1, y1) in enumerate(a.box):
    cw, ch = x1 - x0, y1 - y0; cols = max(1, min(len(idx), 1440 // cw)); rows = -(-len(idx) // cols)
    sheet = Image.new("RGB", (cols * cw, rows * ch)); dr = ImageDraw.Draw(sheet)
    for j, i in enumerate(idx):
        x, y = (j % cols) * cw, (j // cols) * ch
        sheet.paste(Image.fromarray(F[i, y0:y1, x0:x1]), (x, y)); dr.text((x + 4, y + 4), f"{i / FPS:.2f}s", fill=(255, 0, 255))
    sheet.save(f"{a.out}/{name}_crops{k}.jpg", quality=90); print(f"  READ {a.out}/{name}_crops{k}.jpg ({len(idx)} crops, same design in every one?)")
if not a.box: fails.append("no --box given: the object-identity crops were not made")
print("  FAIL: " + "; ".join(fails) if fails else "  numbers pass; identity = your eyes on the crops")
sys.exit(1 if fails else 0)
