// Card rig checks (skill-evolution fb0095): pure, no imports, so node can test them (scripts/rig.test.mjs).
// pieces(): every part of a character card (hair, glasses, held prop, hand) must touch the body. A separate opaque island
// on the card is a floating accessory, a prop that left its hand or a detached limb (reviewer classes anchor / hand-prop / limbs).

/** opaque islands of a card's alpha channel on a grid of `step` px; returns each island but the largest as a share of the
 *  opaque cells, with its centre in card fractions (x right, y down). 8-connected, so a diagonal stroke stays one piece. */
export function pieces(alpha: (x: number, y: number) => number, w: number, h: number, step = 4) {
  const W = Math.ceil(w / step), H = Math.ceil(h / step), on = new Uint8Array(W * H), lab = new Int32Array(W * H).fill(-1);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) on[y * W + x] = alpha(Math.min(w - 1, x * step), Math.min(h - 1, y * step)) >= 128 ? 1 : 0;
  const isl: { n: number; sx: number; sy: number }[] = [];
  const stack: number[] = [];
  for (let i = 0; i < W * H; i++) {
    if (!on[i] || lab[i] >= 0) continue;
    const k = isl.length, s = { n: 0, sx: 0, sy: 0 };
    isl.push(s); lab[i] = k; stack.push(i);
    while (stack.length) {
      const j = stack.pop()!, x = j % W, y = (j / W) | 0;
      s.n++; s.sx += x; s.sy += y;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const X = x + dx, Y = y + dy, q = Y * W + X;
        if (X >= 0 && Y >= 0 && X < W && Y < H && on[q] && lab[q] < 0) { lab[q] = k; stack.push(q); }
      }
    }
  }
  const total = isl.reduce((a, s) => a + s.n, 0), big = isl.reduce((b, s, i) => (s.n > isl[b].n ? i : b), 0);
  return isl.filter((_, i) => i !== big).map((s) => ({ frac: +(s.n / total).toFixed(3), x: +(s.sx / s.n / W).toFixed(2), y: +(s.sy / s.n / H).toFixed(2) }));
}

/** a card cut in two by set geometry (user checklist "mảng cắt đôi nhân vật"; ep01 chair posts, lounger rails, desk tops):
 *  a band of rows (h) or, across the torso, of columns (v) that is >= 80 % hidden, with visible body (<= 20 % hidden) on
 *  BOTH sides, and thinner than 40 % of the card. A body hidden from the waist down by a desk is not cut: nothing shows below. */
export function sliced(s: { gx: number; gy: number; occ: boolean }[]): "h" | "v" | null {
  const band = (key: "gx" | "gy", list: typeof s) => {
    const m = new Map<number, [number, number]>();
    for (const q of list) { const r = m.get(q[key]) ?? [0, 0]; r[0]++; if (q.occ) r[1]++; m.set(q[key], r); }
    const ks = [...m.keys()].filter((k) => m.get(k)![0] >= 2).sort((a, b) => a - b);
    const st = ks.map((k) => { const [n, o] = m.get(k)!; return o / n >= 0.8 ? "o" : o / n <= 0.2 ? "v" : "-"; }).join("");
    const run = /v[-o]*o[-o]*v/.exec(st);
    return !!run && run[0].length - 2 <= 0.4 * ks.length && run[0].replace(/[^o]/g, "").length >= 1;
  };
  if (band("gy", s)) return "h";
  const ys = s.map((q) => q.gy), y0 = Math.min(...ys), y1 = Math.max(...ys);
  return band("gx", s.filter((q) => q.gy >= y0 + 0.3 * (y1 - y0) && q.gy <= y0 + 0.8 * (y1 - y0))) ? "v" : null;
}

/** what bodyFront drew, written onto the card canvas as `rig` (toon.ts): stick arms, legs, and hands at distinct places */
export type Rig = { arms: number; legs: number; hands: number };

/** hands closer than `d` design units are one hand drawn twice (a prop redraws the hand over itself to grip) */
export function distinctHands(pts: [number, number][], d: number) {
  const out: [number, number][] = [];
  for (const p of pts) if (!out.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < d)) out.push(p);
  return out.length;
}
