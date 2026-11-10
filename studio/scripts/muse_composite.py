"""Muse lab H13: put our lead card (transparent ProRes from scripts/lead_card.mjs) into a Muse world clip that has an EMPTY
tank hatch, tracking the dark hatch hole (scipy connected components, no OpenCV).

usage: python scripts/muse_composite.py <world.mp4> <card.mov> <out.mp4> --box x0 y0 x1 y1 --scale S --cut CY [--tint R G B]
  --box   the dark hatch hole in frame 0 (pixels); tracked per frame (position AND width, so the card grows with the tank)
  --scale card scale (600x1000 card) at frame 0       --cut  card row (unscaled) placed at the hole centre: rows below hidden
  --tint  multiply the card by the scene light (dawn ~ 200 205 235); --tint2 R G B T0 T1 eases to a second light; --bob px Hz
"""
import argparse, subprocess, numpy as np
from scipy import ndimage
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("world"); ap.add_argument("card"); ap.add_argument("out")
ap.add_argument("--box", type=int, nargs=4, required=True, help="hatch hole bbox in frame 0")
ap.add_argument("--dark", type=float, default=25); ap.add_argument("--smooth", type=int, default=5, help="odd frame count"); ap.add_argument("--open", type=int, default=2);
ap.add_argument("--autolight", action="store_true", help="scale the tint by the plate's colour change where the card stands (flashes, fades)")
ap.add_argument("--follow", type=float, default=0, help="0..1: rotate the card with the hatch tilt")
ap.add_argument("--tint", type=float, nargs=3, default=[255, 255, 255])
ap.add_argument("--tint2", type=float, nargs=5, help="R G B T0 T1: ease the tint to this colour between T0 and T1 s (a light he passes)")
ap.add_argument("--bob", type=float, nargs=2, default=[0, 0], help="px Hz: ride bob on top of the tracked hatch")
ap.add_argument("--scale", type=float, default=0.3); ap.add_argument("--cut", type=int, default=560)
ap.add_argument("--W", type=int, default=720); ap.add_argument("--H", type=int, default=1280)
a = ap.parse_args()
W, H = a.W, a.H

def frames(path, w, h, fmt, ch):
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", fmt, "-"], stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(w * h * ch)
        if len(b) < w * h * ch: return
        yield np.frombuffer(b, np.uint8).reshape(h, w, ch)

world = list(frames(a.world, W, H, "rgb24", 3))
card = list(frames(a.card, 600, 1000, "rgba", 4))
def hole(g, cx, cy, w0):  # the hatch hole = the solid near-black blob (fill > 60 %, width within 40 % of the first) nearest the prediction
    x0, y0 = max(int(cx - 2 * w0), 0), max(int(cy - 2 * w0), 0)
    m = g[y0:int(cy + 2 * w0), x0:int(cx + 2 * w0)] < a.dark
    if a.open: m = ndimage.binary_opening(m, iterations=a.open)  # cut ink lines that touch the hole (they are thinner than it)
    lab, _ = ndimage.label(m)
    best = None
    for k, sl in enumerate(ndimage.find_objects(lab), 1):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        if abs(w - w0) > 0.4 * w0 or h > w or (lab[sl] == k).sum() < 0.6 * w * h: continue
        yy, xx = np.nonzero(lab[sl] == k); cov = np.cov(np.stack([xx, yy]))
        ang = np.degrees(0.5 * np.arctan2(2 * cov[0, 1], cov[0, 0] - cov[1, 1]))  # + = right side down (image y is down)
        c = (x0 + (sl[1].start + sl[1].stop) / 2, y0 + (sl[0].start + sl[0].stop) / 2, w, ang)
        d = abs(c[0] - cx) + abs(c[1] - cy)
        if best is None or d < best[0]: best = (d, c)
    return best and best[1]

gray = lambda f: f.astype(np.float32).mean(2)
cx, cy, w0 = (a.box[0] + a.box[2]) / 2, (a.box[1] + a.box[3]) / 2, a.box[2] - a.box[0]
track, vx, vy = [], 0.0, 0.0
for f in world:  # fixed-size window at the predicted position (last + velocity); reject widths off by > 25 %
    h = hole(gray(f), cx + vx, cy + vy, w0)
    if h:
        if track: vx, vy = h[0] - cx, h[1] - cy
        cx, cy = h[0], h[1]; track.append(h)
    else:
        cx, cy = cx + vx, cy + vy; track.append((cx, cy, track[-1][2] if track else w0, track[-1][3] if track else 0.0))
track = np.array(track, np.float32)
k = np.ones(a.smooth) / a.smooth  # light moving average: per-frame noise reads as jitter, a fit would erase real jolts
sm = np.stack([np.convolve(np.pad(track[:, i], a.smooth // 2, mode="edge"), k, "valid") for i in range(4)], 1)
assert len(sm) == len(world), (len(sm), len(world))
tint = np.array(a.tint, np.float32) / 255  # multiply the card by the scene's light colour
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", "24", "-i", "-",
                        "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p", a.out], stdin=subprocess.PIPE)
def region(f, i):  # mean plate colour of the turret around the hatch: the light that falls on the man in it
    w = sm[i, 2]; x0, x1, y0, y1 = int(sm[i, 0] - w), int(sm[i, 0] + w), int(sm[i, 1] - 0.3 * w), int(sm[i, 1] + 0.5 * w)
    r = f[max(y0, 0):max(y1, 1), max(x0, 0):max(x1, 1)].reshape(-1, 3)
    return r.mean(0) if len(r) else np.ones(3)
if a.autolight:
    ref = region(world[0], 0) + 1
    gain = np.array([np.clip((region(f, i) + 1) / ref, 0.6, 1.8) for i, f in enumerate(world)])
    gain = np.stack([np.convolve(np.pad(gain[:, j], 2, mode="edge"), np.ones(5) / 5, "valid") for j in range(3)], 1)
for i, f in enumerate(world):
    sc = a.scale * sm[i, 2] / sm[0, 2]
    cw, chh = int(600 * sc), int(a.cut * sc)
    tt = i / 24; ti = tint
    if a.tint2:
        u = np.clip((tt - a.tint2[3]) / (a.tint2[4] - a.tint2[3]), 0, 1); ti = tint + (np.array(a.tint2[:3], np.float32) / 255 - tint) * u * u * (3 - 2 * u)
    if a.autolight: ti = ti * gain[i]
    img = Image.fromarray(card[min(i, len(card) - 1)][: a.cut]).resize((cw, chh), Image.LANCZOS)
    S2 = 2 * max(cw, chh); sq = Image.new("RGBA", (S2, S2)); sq.paste(img, (S2 // 2 - cw // 2, S2 // 2 - chh))  # bottom centre at the middle
    if a.follow: sq = sq.rotate(-a.follow * sm[i, 3], resample=Image.BICUBIC)
    c = np.asarray(sq).astype(np.float32); c[..., :3] *= ti
    ox = int(round(sm[i, 0] - S2 / 2)); oy = int(round(sm[i, 1] - S2 / 2 + a.bob[0] * abs(np.sin(np.pi * a.bob[1] * tt))))
    out = f.astype(np.float32).copy()
    ys, xs = max(oy, 0), max(ox, 0); ye, xe = min(oy + S2, H), min(ox + S2, W)
    if xe <= xs or ye <= ys: enc.stdin.write(f.tobytes()); continue  # card fully off frame
    al = c[ys - oy:ye - oy, xs - ox:xe - ox, 3:4] / 255
    out[ys:ye, xs:xe] = np.clip(c[ys - oy:ye - oy, xs - ox:xe - ox, :3], 0, 255) * al + out[ys:ye, xs:xe] * (1 - al)
    enc.stdin.write(out.astype(np.uint8).tobytes())
enc.stdin.close(); enc.wait()
print("hole x", sm[0, 0], "->", sm[-1, 0], " width", sm[0, 2], "->", sm[-1, 2], "->", a.out)
