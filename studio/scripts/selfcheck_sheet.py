# One sheet per shot from scripts/selfcheck.mjs frames: frames side by side at 405 x 720 (half of the 0.75-scale still), labelled.
#   python scripts/selfcheck_sheet.py <outDir>  ->  <outDir>/sheet_sNN.jpg
import glob, os, re, sys
from PIL import Image, ImageDraw

out = sys.argv[1]
by = {}
for f in glob.glob(os.path.join(out, "s*_f*.jpg")):
    m = re.search(r"s(\d+)_f(\d+)\.jpg$", f)
    by.setdefault(int(m.group(1)), []).append((int(m.group(2)), f))
for sid, fs in sorted(by.items()):
    fs.sort()
    sheet = Image.new("RGB", (405 * len(fs), 744), "white")
    d = ImageDraw.Draw(sheet)
    for k, (fr, f) in enumerate(fs):
        sheet.paste(Image.open(f).resize((405, 720)), (405 * k, 24))
        d.text((405 * k + 6, 6), f"shot {sid}  f{fr}  {fr / 30:.1f}s", fill="black")
    sheet.save(os.path.join(out, f"sheet_s{sid:02d}.jpg"), quality=88)
print(f"{len(by)} sheets in {out}")
