# Silhouette gate (skill-evolution fb0019): every named character must read by shape alone.
#   python scripts/silhouette_qa.py <silhouette_row.png> <n_figures> [names,comma,separated]
# The row is n equal-width cells, each one figure drawn solid dark on a light background. Each figure is cropped, scaled to
# the same height with its feet on the bottom edge, centred, and compared pairwise: IoU > 0.85 = the two read as one shape.
import sys
import numpy as np
from PIL import Image

IOU_MAX, H, W = 0.85, 200, 120

def masks(path, n):
    a = np.asarray(Image.open(path).convert("L"), dtype=np.float32) / 255
    out = []
    for i in range(n):
        cell = a[:, i * a.shape[1] // n:(i + 1) * a.shape[1] // n] < 0.5
        ys, xs = np.nonzero(cell)
        if not len(ys): out.append(np.zeros((H, W), bool)); continue
        fig = cell[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        w = max(1, round(fig.shape[1] * H / fig.shape[0]))
        img = Image.fromarray(fig.astype(np.uint8) * 255).resize((min(w, W), H), Image.NEAREST)
        m = np.zeros((H, W), bool); x0 = (W - img.width) // 2
        m[:, x0:x0 + img.width] = np.asarray(img) > 127
        out.append(m)
    return out

def worst(ms):
    """[(iou, i, j)] for every pair, highest first"""
    r = [(float((a & b).sum() / max(1, (a | b).sum())), i, j) for i, a in enumerate(ms) for j, b in enumerate(ms) if i < j]
    return sorted(r, reverse=True)

if __name__ == "__main__":
    path, n = sys.argv[1], int(sys.argv[2])
    names = sys.argv[3].split(",") if len(sys.argv) > 3 else [str(i) for i in range(n)]
    pairs = worst(masks(path, n))
    for iou, i, j in pairs[:5]: print(f"{names[i]} vs {names[j]}: IoU {iou:.2f}")
    bad = [p for p in pairs if p[0] > IOU_MAX]
    print("\n".join(f"FAIL {names[i]} and {names[j]} share one silhouette (IoU {iou:.2f} > {IOU_MAX})" for iou, i, j in bad) or "PASSED")
    sys.exit(1 if bad else 0)
