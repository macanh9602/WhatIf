#!/usr/bin/env python
"""Value gate: a still whose tones sit in one narrow band reads "washed out" (ep12 haze, 2026-11-07).
usage: python scripts/value_qa.py <still.jpg ...> [--grid COLSxROWS] | --test.  Exit 1 when a frame fails.
Captions and ink are thin, so the range is p5..p95 of luma, not min..max."""
import sys
import numpy as np
from PIL import Image

MIN_RANGE = 0.40  # measured on ep12's contact sheet, see AGENTS.md

def value_range(im):
    l = np.asarray(im.convert("L"), dtype=np.float32) / 255
    return float(np.percentile(l, 95) - np.percentile(l, 5))

def cells(path, grid):
    im = Image.open(path)
    if not grid: return [(path, im)]
    c, r = grid; w, h = im.width // c, im.height // r
    return [(f"{path}#{y * c + x + 1}", im.crop((x * w, y * h, (x + 1) * w, (y + 1) * h))) for y in range(r) for x in range(c)]

def main(argv):
    if argv[:1] == ["--test"]:
        flat = Image.fromarray(np.full((64, 64), 200, np.uint8))
        ramp = Image.fromarray(np.tile(np.linspace(0, 255, 64).astype(np.uint8), (64, 1)))
        assert value_range(flat) < MIN_RANGE < value_range(ramp)
        print("self-test ok"); return 0
    grid = None
    if "--grid" in argv:
        i = argv.index("--grid"); grid = tuple(int(n) for n in argv[i + 1].split("x")); argv = argv[:i] + argv[i + 2:]
    bad = 0
    for p in argv:
        for name, im in cells(p, grid):
            v = value_range(im); ok = v >= MIN_RANGE; bad += not ok
            print(f"{'PASS' if ok else 'FAIL'} {v:.2f} {name}")
    return 1 if bad else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
