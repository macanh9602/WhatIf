# Backdrop colour gate (director rules 2026-11-07, (1) and (5)). Needs three stills per frame, rendered with
#   <p>all_<f>.png (default), <p>nobd_<f>.png (PROPS='{"post":{"backdrop":false}}'), <p>nocast_<f>.png (PROPS='{"post":{"cast":false}}').
# backdrop pixels = all vs nobd differ; character pixels = all vs nocast differ (minus backdrop).
# (1) backdrop mean chroma < character mean chroma; (5) mean |luma(backdrop) - luma(what is behind it)| >= .05 over the upper
# half of the backdrop's rows (the silhouette against the sky; the bottom deliberately melts into the ground and fog).
# usage: python scripts/backdrop_check.py out/_lab/bd_ 105,165
import sys
import numpy as np
from PIL import Image

pre, frames = sys.argv[1], [int(f) for f in sys.argv[2].split(",")]
load = lambda n: np.asarray(Image.open(n).convert("RGB")).astype(float) / 255
luma = lambda c: c @ np.array([0.2126, 0.7152, 0.0722])
chroma = lambda c: c.max(-1) - c.min(-1)
ok = True
for f in frames:
    a, b, c = load(f"{pre}all_{f}.png"), load(f"{pre}nobd_{f}.png"), load(f"{pre}nocast_{f}.png")
    bd = np.abs(a - b).max(-1) > 0.03
    ch = (np.abs(a - c).max(-1) > 0.03) & ~bd
    if bd.sum() < 500 or ch.sum() < 500:
        print(f"frame {f}: SKIP (backdrop px {bd.sum()}, character px {ch.sum()})"); continue
    rows = np.where(bd.any(1))[0]; top = bd.copy(); top[(rows[0] + rows[-1]) // 2:] = False
    cb, cc, dl = chroma(a[bd]).mean(), chroma(a[ch]).mean(), np.abs(luma(a[top]) - luma(b[top])).mean()
    p1, p5 = cb < cc, dl >= 0.05
    ok &= p1 and p5
    print(f"frame {f}: (1) chroma backdrop {cb:.3f} < character {cc:.3f}: {'PASS' if p1 else 'FAIL'};  (5) luma delta vs behind {dl:.3f} >= .05: {'PASS' if p5 else 'FAIL'}")
print("backdrop_check", "PASS" if ok else "FAIL")
sys.exit(0 if ok else 1)
