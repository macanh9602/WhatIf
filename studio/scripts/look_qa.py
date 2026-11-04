# Look gate (skill-evolution fb0015a + fb0016): exit 1 on any failure. Run before every 2K render.
#   python scripts/look_qa.py <video folder name, e.g. owen> <frames, one per set: 45,560,1240,1580> [ref frames glob]
# 1. wiring: no shader factory / light uniforms imported from another video folder (singletons split the light rig)
# 2. speckle: renders the ink MASK only at FULL scale (a 0.5 downscale turns faint solid lines into fake dots) and counts
#    lone dots (dark blobs < 40 px with no other ink within 6 px); > 15 per frame fails. An empty mask fails (ink broken).
# 3. tone: lum mean / p2 / saturation of the full stills vs the reference p10-p90 band (lum outside .23-.64 or sat < .27 fails)
import glob, json, os, re, subprocess, sys
import numpy as np
from PIL import Image
from scipy import ndimage

def imports_other_video(folder):
    bad = []
    for p in glob.glob(os.path.join(folder, "*.ts*")):
        for i, line in enumerate(open(p, encoding="utf-8"), 1):
            # only modules bound to a light rig are dangerous: shader factories and their uniform singletons
            m = re.search(r"import\s*\{([^}]*)\}\s*from\s+[\"']\.\./(\w+)/(\w+)", line)
            if m and (m.group(3) in ("shade", "cardshade", "lights") or re.search(r"(?<![A-Za-z])(lam|twoTone|toLambert|TONE|CHAR)(?![A-Za-z])", m.group(1))):
                bad.append(f"{os.path.basename(p)}:{i} takes light-rig code from ../{m.group(2)}/{m.group(3)}")
    return bad

def speckles(mask_png):
    a = np.asarray(Image.open(mask_png).convert("L"), dtype=np.float32) / 255
    dark = a < 0.5
    lab, n = ndimage.label(dark)
    sizes = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
    # a speckle is a tiny blob with no other ink within 3 px (line fragments cut by a character keep their neighbours)
    count = 0
    for k, sl in enumerate(ndimage.find_objects(lab), 1):
        if sizes[k - 1] >= 40: continue
        y0, x0 = max(sl[0].start - 6, 0), max(sl[1].start - 6, 0)
        win, faint = lab[y0:sl[0].stop + 6, x0:sl[1].stop + 6], a[y0:sl[0].stop + 6, x0:sl[1].stop + 6] < 0.85
        if ((win != 0) & (win != k)).any(): continue
        # a dark dot where 3+ faint lines meet (window mullion crosses, frame corners, ep01 v5) is a line junction, not noise;
        # a dot on ONE faint straight line (2 opposite directions) is the fb0016 dotted-line bug and still counts
        own = ndimage.binary_dilation(win == k, iterations=3)
        ys, xs = np.nonzero(faint & ~own)
        cy, cx = (sl[0].start + sl[0].stop) / 2 - y0, (sl[1].start + sl[1].stop) / 2 - x0
        octs = {int(((np.arctan2(y - cy, x - cx) + np.pi) / (np.pi / 4))) % 8 for y, x in zip(ys, xs)}
        dirs = {o % 4 for o in octs}  # a straight line through the dot fills 2 opposite octants = 1 direction (+ its neighbour)
        if len(dirs) < 3: count += 1
    return count, int(dark.sum())

# Pixel-space detector profile, measured on full-resolution masks only.
DASH = dict(dark=.5, min_segments=4, min_gap=2, max_gap=12,
            max_segment=24, min_span=22, tolerance=1.8, max_width=9)

def dashed_runs(mask_png):
    """Cluster short dark components by collinearity, then validate projected gaps.

    Faint support is deliberately excluded: dark beads on a pale continuous edge
    must remain separate segments. Curved tick rings lack four collinear centres.
    """
    a = np.asarray(Image.open(mask_png).convert("L"), dtype=np.float32) / 255
    lab, _ = ndimage.label(a < DASH['dark'], structure=np.ones((3, 3)))
    pieces = []
    for sl in ndimage.find_objects(lab):
        if sl is None: continue
        h, w = sl[0].stop-sl[0].start, sl[1].stop-sl[1].start
        if max(h, w) > DASH['max_segment'] or min(h, w) > DASH['max_width']: continue
        yy, xx = np.nonzero(lab[sl])
        if len(xx) < 2: continue
        pieces.append((np.array([xx.mean()+sl[1].start, yy.mean()+sl[0].start]),
                       np.column_stack((xx+sl[1].start, yy+sl[0].start))))
    found = []
    if not pieces: return []
    C = np.array([c for c, _ in pieces])
    reach = DASH['max_segment'] + DASH['max_gap'] + 4
    for i, (c, _) in enumerate(pieces):
        d = C - c
        # vectorised neighbour filter (the plain triple loop is O(n^3) on full-scale masks)
        near = np.nonzero((np.hypot(d[:, 0], d[:, 1]) >= 3) & (np.hypot(d[:, 0], d[:, 1]) <= reach) & (np.arange(len(C)) > i))[0]
        for j in near:
            v = d[j] / np.linalg.norm(d[j]); normal = np.array([-v[1], v[0]])
            on_line = np.nonzero((np.abs(d @ normal) <= DASH['tolerance']) & (np.abs(d @ v) <= 40 * reach))[0]
            candidates = []
            for k in on_line:
                pixels = pieces[k][1]
                # Reject perpendicular stripes / ticks, even if their centres align.
                along, across = pixels @ v, pixels @ normal
                if np.ptp(across) > max(4, np.ptp(along)*.7): continue
                candidates.append((float(along.min()), float(along.max()), int(k)))
            candidates.sort(); chain = []
            def emit(chain):
                if len(chain) < DASH['min_segments']: return
                if chain[-1][1]-chain[0][0] < DASH['min_span']: return
                ids = frozenset(t[2] for t in chain)
                if any(len(ids & old[0]) >= min(len(ids), len(old[0]))*.6 for old in found): return
                pixels = np.concatenate([pieces[k][1] for k in ids])
                lo, hi = pixels.min(0)-2, pixels.max(0)+3
                found.append((ids, [int(lo[0]), int(lo[1]), int(hi[0]), int(hi[1])]))
            for item in candidates:
                if chain and not DASH['min_gap'] <= item[0]-chain[-1][1]-1 <= DASH['max_gap']:
                    emit(chain); chain = []
                chain.append(item)
            emit(chain)
    return [box for _, box in found]

def dash_overlay(mask_png, boxes, output):
    from PIL import ImageDraw
    im = Image.open(mask_png).convert('RGB'); draw = ImageDraw.Draw(im)
    for box in boxes: draw.rectangle(box, outline='red', width=3)
    im.save(output)

def tone(p):
    a = np.asarray(Image.open(p).convert("RGB").resize((270, 480)), dtype=np.float32) / 255
    h = a.shape[0]; a = np.concatenate([a[:int(h * .55)], a[int(h * .78):]])  # caption band masked like the reference stats
    y = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]).ravel()
    mx, mn = a.max(-1), a.min(-1); s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0).ravel()
    return float(y.mean()), float(np.percentile(y, 2)), float(np.median(s))

def still(prefix, frames, props, scale="0.5"):
    env = dict(os.environ, COMP=os.environ.get("COMP", "OwenShort"), PROPS=json.dumps(props), PNG="1")
    subprocess.run(["node", "scripts/stills.mjs", prefix, frames, scale], check=True, env=env, stdout=subprocess.DEVNULL)

if __name__ == "__main__":
    name, frames = sys.argv[1], sys.argv[2]
    out = f"out/look_qa/{name}/"; os.makedirs(out, exist_ok=True)
    fails = [f"wiring: {b}" for b in imports_other_video(f"src/videos/{name}")]
    still(out + "m", frames, {"captions": False, "post": {"inkMask": True}}, "1")
    still(out + "c", frames, {"captions": False})
    for f in frames.split(","):
        (n, ink), (lum, p2, sat) = speckles(f"{out}m{f}.png"), tone(f"{out}c{f}.png")
        boxes = dashed_runs(f"{out}m{f}.png")
        if len(boxes) > 3:
            fails.append(f"f{f}: {len(boxes)} dashed runs: {boxes}")
            dash_overlay(f"{out}m{f}.png", boxes, f"{out}dash_{f}.png")
        print(f"f{f}: dashes {len(boxes)}, boxes {boxes}, speckles {n}, lum mean {lum:.2f}, p2 {p2:.2f}, sat {sat:.2f}")
        if n > 15: fails.append(f"f{f}: {n} lone ink dots")  # clean ep01 frames measure 5-16 (line stubs cut by cards); the dotted-line bug measured 30-52
        if ink < 500: fails.append(f"f{f}: ink mask nearly empty ({ink} px): the ink pass is broken")
        # band = p10-p90 of the 40 reference frames measured with tone() (lum .19-.75, median .37; sat median .49)
        if not .23 <= lum <= .64: fails.append(f"f{f}: lum mean {lum:.2f} outside .23-.64 (reference median .37)")
        if sat < .27: fails.append(f"f{f}: saturation {sat:.2f} < .27 (reference median .49): washed out")
    print("\n".join(fails) or "PASSED"); sys.exit(1 if fails else 0)
