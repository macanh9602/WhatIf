// self-check for the temporal gate's pure parts: node scripts/temporal_qa.test.mjs (from studio/)
import assert from "node:assert/strict";
import { creepWindow, legMap, score } from "./temporal_qa.mjs";

const W = 200, H = 60, N = 16;
/** a soft dark line on a light wall; y(k, x) = its centre in frame k */
const scene = (y, rim = 0) => Array.from({ length: N }, (_, k) => {
  const f = new Uint8Array(W * H);
  for (let r = 0; r < H; r++) for (let x = 0; x < W; x++) {
    const d = r - y(k, x), cov = Math.max(0, Math.min(1, 3 - Math.abs(d))); // ~5 px line, 1 px ramps
    f[r * W + x] = 200 + (rim && d < -3 && d > -6 ? rim : 0) - 190 * cov;
  }
  return f;
});
const boil = (fr) => score(fr);

assert.equal(boil(scene(() => 30)), 0, "a static line never boils");
assert.equal(boil(scene((k) => 20 + 0.3 * k)), 0, "rigid line, creep speed");
assert.equal(boil(scene((k) => 20 + 1.0 * k)), 0, "rigid line, fastest creep (1 px/f at the frame edge)");
assert.equal(boil(scene((k) => 20 + 0.6 * k, 30)), 0, "rigid line with a painted bright rim: 2 reversals, but slow ones");
const twoLines = Array.from({ length: N }, (_, k) => {
  const f = new Uint8Array(W * H).fill(200), y = 8 + k;
  for (let x = 0; x < W; x++) for (const r of [y, y + 1, y + 2, y + 3, y + 8, y + 9, y + 10, y + 11]) f[r * W + x] = 10;
  return f;
});
assert.equal(boil(twoLines), 0, "two rigid lines with a 4 px gap, fastest creep");
// the same line, each column flipping +-2 px frame to frame (what the near-binary ink did to a thin trim)
assert.ok(boil(scene((k, x) => 30 + 2 * Math.sin(k * 2.5 + x * 7.1))) > 50000, "a boiling line fails");
// a dash on a thin trim blinking on and off: 2 frames on, 2 frames off
const blink = scene(() => 30).map((f, k) => (k % 4 < 2 ? f : new Uint8Array(W * H).fill(200)));
assert.ok(boil(blink) > 20000, "a blinking dash fails");
// a dark pixel that flips only once inside the window is not boiling yet
assert.equal(legMap([[9], [9], [90], [90], [90], [90]].map((a) => Uint8Array.from(a)))[0], 0);
assert.equal(legMap([[9], [90], [9], [90], [9]].map((a) => Uint8Array.from(a)))[0], 2);

assert.equal(creepWindow({ a: 0, b: 100 }, []), 22, "after the settle of the cut");
assert.equal(creepWindow({ a: 0, b: 100 }, [[20, 50]]), 50, "after a move");
assert.equal(creepWindow({ a: 0, b: 30 }, []), null, "too short: no creep window");
console.log("temporal_qa self-test ok");
