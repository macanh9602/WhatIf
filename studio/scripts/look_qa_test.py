# self-test for look_qa.speckles: a dotted line on white must count, a faint-line junction must not. Run: python scripts/look_qa_test.py
import numpy as np, importlib.util, tempfile, os  # noqa
from PIL import Image
spec = importlib.util.spec_from_file_location("lq", "scripts/look_qa.py"); m = importlib.util.module_from_spec(spec)
src = open("scripts/look_qa.py", encoding="utf-8").read().split("if __name__")[0]; exec(src, m.__dict__)
d = tempfile.mkdtemp()
a = np.ones((200, 200), np.float32)
for x in range(10, 190, 20): a[99:104, x - 1:x + 4] = .7; a[100:103, x:x + 3] = 0  # dotted line on white, soft rims: 9 lone dots
b = np.ones((200, 200), np.float32); b[50, :] = .7; b[:, 50] = .7; b[49:52, 49:52] = 0  # faint cross + dark junction
Image.fromarray((a * 255).astype(np.uint8)).save(os.path.join(d, "a.png")); Image.fromarray((b * 255).astype(np.uint8)).save(os.path.join(d, "b.png"))
c = np.ones((200, 200), np.float32); c[100:103, 5:195] = .72
for x in range(10, 190, 20): c[99:104, x:x + 4] = 0             # the fb0016 bug: dark dots ON one faint line: must still count
Image.fromarray((c * 255).astype(np.uint8)).save(os.path.join(d, "c.png"))
na, nb, nc = (m.speckles(os.path.join(d, f))[0] for f in ("a.png", "b.png", "c.png"))
assert na == 9 and nb == 0 and nc == 9, (na, nb, nc); print("look_qa speckle self-check ok", na, nb, nc)

# dashed-run detector: a dashed line counts once; a solid line, two crossing lines and a tick ring do not
def save(arr, name):
    path = os.path.join(d, name); Image.fromarray((arr * 255).astype(np.uint8)).save(path); return path
dash = np.ones((200, 300), np.float32)
for x in range(20, 280, 18): dash[100:103, x:x + 10] = 0                 # 15 dashes of 10 px, 8 px gaps
solid = np.ones((200, 300), np.float32); solid[100:103, 20:280] = 0
cross = solid.copy(); cross[20:180, 148:151] = 0
ring = np.ones((300, 300), np.float32)
for k in range(12):
    a = k * np.pi / 6; cx, cy = 150 + 100 * np.cos(a), 150 + 100 * np.sin(a)
    for r in range(0, 12): ring[int(cy + r * np.sin(a)), int(cx + r * np.cos(a))] = 0
nd, ns, nx, nr = (len(m.dashed_runs(save(x, f"{n}.png"))) for x, n in ((dash, "dash"), (solid, "solid"), (cross, "cross"), (ring, "ring")))
assert nd >= 1 and ns == 0 and nx == 0 and nr == 0, (nd, ns, nx, nr); print("look_qa dash self-check ok", nd, ns, nx, nr)
