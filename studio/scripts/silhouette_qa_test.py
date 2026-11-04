# self-test for silhouette_qa: two identical stick kids must fail, a kid in shorts vs an adult in a skirt must pass.
# Run: python scripts/silhouette_qa_test.py
import os, sys, tempfile
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
import silhouette_qa as q

def fig(d, x0, skirt):
    d.ellipse((x0 + 30, 10, x0 + 90, 70), fill=0)                       # head
    d.rectangle((x0 + 35, 75, x0 + 85, 150), fill=0)                    # tee
    if skirt: d.polygon([(x0 + 35, 150), (x0 + 85, 150), (x0 + 110, 220), (x0 + 10, 220)], fill=0)
    else: d.rectangle((x0 + 38, 150, x0 + 82, 185), fill=0)             # shorts
    for x in (x0 + 48, x0 + 72): d.line((x, 150, x, 290), fill=0, width=6)  # stick legs

im = Image.new("L", (360, 300), 255); d = ImageDraw.Draw(im)
fig(d, 0, False); fig(d, 120, False); fig(d, 240, True)
p = os.path.join(tempfile.mkdtemp(), "row.png"); im.save(p)
pairs = {(i, j): iou for iou, i, j in q.worst(q.masks(p, 3))}
assert pairs[(0, 1)] > q.IOU_MAX, pairs
assert pairs[(0, 2)] < q.IOU_MAX, pairs
print("silhouette_qa self-check ok", {k: round(v, 2) for k, v in pairs.items()})
