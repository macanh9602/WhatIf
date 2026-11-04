// self-check for the card rig helpers (src/videos/owen/rig.ts): node scripts/rig.test.mjs
import assert from "node:assert/strict";
import { pieces, distinctHands, sliced } from "../src/videos/owen/rig.ts";

const card = (rects, w = 100, h = 100) => (x, y) => (rects.some(([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1) ? 255 : 0);
assert.deepEqual(pieces(card([[20, 10, 80, 90]]), 100, 100), []);                       // one body: nothing floats
assert.deepEqual(pieces(card([[20, 10, 80, 90], [78, 40, 95, 50]]), 100, 100), []);     // prop overlapping the hand: attached
const f = pieces(card([[20, 10, 80, 90], [88, 4, 96, 12]]), 100, 100);                   // hair clip off the head
assert.equal(f.length, 1); assert.ok(f[0].x > 0.8 && f[0].y < 0.15 && f[0].frac > 0 && f[0].frac < 0.05);
assert.deepEqual(pieces(card([[20, 10, 50, 50], [50, 50, 80, 90]]), 100, 100), []);     // diagonal touch counts as attached
assert.equal(distinctHands([[0, 0], [3, 2], [100, 0]], 12), 2);                          // prop redraws the same hand
assert.equal(distinctHands([[0, 0], [100, 0], [50, 80]], 12), 3);                        // a third hand
console.log("rig: ok");
const grid = (occ) => { const s = []; for (let gy = 0; gy < 20; gy++) for (let gx = 0; gx < 6; gx++) s.push({ gx, gy, occ: occ(gx, gy) }); return s; };
assert.equal(sliced(grid(() => false)), null);
assert.equal(sliced(grid((x, y) => y >= 9 && y <= 11)), "h");     // rail across the body, body above and below
assert.equal(sliced(grid((x, y) => y >= 12)), null);              // behind a desk from the waist down: not cut
assert.equal(sliced(grid((x, y) => x === 2 && y >= 6)), "v");     // chair post up the torso
assert.equal(sliced(grid((x, y) => y >= 2 && y <= 17)), null);    // mostly hidden: the occlusion checks own that
console.log("rig sliced: ok");
