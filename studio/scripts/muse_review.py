"""Review a Muse picture cut shot by shot.

usage: python scripts/muse_review.py <cut.mp4> <brief.md> <outdir> [voice.mp3]

Reads shot times from the brief's shot table (rows like `| 1 | 0-2.9 | 01 | line | picture |`, `11-12` style shot ids ok),
writes into outdir:
  sheet_mid.jpg     one mid frame per shot, numbered
  motion_N.jpg      6 fps strips, one row per shot (long shots wrap / subsample to 3 rows)
  with_voice.mp4    the cut with voice.mp3 under it (if given), to check beats against the line
"""
import re, subprocess, sys, os, shutil
from PIL import Image, ImageDraw

FPS, W, H, COLS = 6, 135, 240, 14


def shots_from_brief(path):
    rows = []
    for line in open(path, encoding='utf-8'):
        m = re.match(r'\|\s*\d+\s*\|\s*([\d.]+)\s*-\s*([\d.]+)\s*\|\s*([\d-]+)\s*\|', line)
        if m:
            rows.append((m.group(3), float(m.group(1)), float(m.group(2))))
    assert rows, 'no shot rows found in brief'
    for (_, _, b), (_, a, _) in zip(rows, rows[1:]):
        assert abs(a - b) < 0.01, f'gap/overlap in brief times at {b}/{a}'
    return rows


def main(cut, brief, out, voice=None):
    shots = shots_from_brief(brief)
    fr = os.path.join(out, '_frames')
    shutil.rmtree(fr, ignore_errors=True)
    os.makedirs(fr)
    subprocess.run(['ffmpeg', '-v', 'error', '-i', cut, '-vf', f'fps={FPS},scale={W}:{H}', '-q:v', '4',
                    os.path.join(fr, '%04d.jpg')], check=True)
    n_frames = len(os.listdir(fr))
    frame = lambda k: Image.open(os.path.join(fr, f'{k:04d}.jpg'))

    # mid sheet
    cols = 8
    S = Image.new('RGB', (cols * W, -(-len(shots) // cols) * H), 'black')
    for i, (sid, a, b) in enumerate(shots):
        k = min(n_frames, max(1, round((a + b) / 2 * FPS)))
        im = frame(k); d = ImageDraw.Draw(im); d.rectangle([0, 0, 38, 14], fill='black'); d.text((3, 2), sid, fill='yellow')
        S.paste(im, ((i % cols) * W, (i // cols) * H))
    S.save(os.path.join(out, 'sheet_mid.jpg'), quality=88)

    # motion strips
    rows = []
    for sid, a, b in shots:
        ks = [k for k in range(1, n_frames + 1) if a <= (k - 0.5) / FPS < b]
        if len(ks) > COLS * 3:
            ks = ks[::-(-len(ks) // (COLS * 3))]
        rows += [(sid if r == 0 else '', ks[r:r + COLS]) for r in range(0, len(ks), COLS)]
    for g in range(0, len(rows), 8):
        grp = rows[g:g + 8]
        S = Image.new('RGB', (40 + COLS * W, len(grp) * H), 'black'); d = ImageDraw.Draw(S)
        for r, (sid, ks) in enumerate(grp):
            d.text((4, r * H + 4), sid, fill='yellow')
            for c, k in enumerate(ks):
                S.paste(frame(k), (40 + c * W, r * H))
        S.save(os.path.join(out, f'motion_{g // 8 + 1}.jpg'), quality=85)

    if voice:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', cut, '-i', voice, '-map', '0:v', '-map', '1:a',
                        '-c:v', 'copy', '-c:a', 'aac', '-shortest', os.path.join(out, 'with_voice.mp4')], check=True)
    print(f'{len(shots)} shots, {n_frames} frames -> {out}')


if __name__ == '__main__':
    if len(sys.argv) < 4:
        sys.exit(__doc__)
    main(*sys.argv[1:5])
