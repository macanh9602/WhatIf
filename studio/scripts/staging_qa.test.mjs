// self-check for the staging gate's judge(): node scripts/staging_qa.test.mjs
import assert from "node:assert/strict";
import { judge } from "./staging_qa.mjs";
const card = (o) => ({ i: 0, mode: "stand", n: 100, inFrame: 1, headIn: 1, headOcc: 0, headCov: 0, torsoOcc: 0, feetOcc: 0, headH: 0.15, gap: 0, ...o });
const rec = (cards, extra = {}) => ({ id: 1, f: 0, unwired: 0, cards, contacts: [], ...extra });
assert.deepEqual(judge(rec([card()])), []);
assert.match(judge(rec([card({ headH: 0.42 })]))[0], /too tight/);
assert.match(judge(rec([card({ headOcc: 0.5 })]))[0], /hidden by set/);
assert.match(judge(rec([card({ headCov: 0.6 })]))[0], /nearer character/);
assert.match(judge(rec([card({ headIn: 0.4 })]))[0], /cut by the frame/);
assert.match(judge(rec([card({ gap: 0.3 })]))[0], /floating/);
assert.deepEqual(judge(rec([card({ headH: 0.02, headOcc: 1 })])), []); // tiny background extra: occlusion ignored
assert.deepEqual(judge(rec([card({ headIn: 0 })])), []);                // off screen
assert.match(judge(rec([card()], { unwired: 3 }))[0], /light rig/);
assert.match(judge(rec([card()], { contacts: [{ a: 4, b: 0, dist: 0.1 }] }))[0], /contact/);
assert.match(judge(rec([card()], { fg: 0.5 }))[0], /foreground/);
assert.deepEqual(judge(rec([card({ principal: false, headH: 0.06, headOcc: 0.9 })])), []); // small extra behind a prop
assert.match(judge(rec([card({ principal: true, headH: 0.06, headOcc: 0.9 })]))[0], /hidden by set/);
assert.match(judge(rec([card()], { camH: 1.9 }))[0], /camera at/);
assert.deepEqual(judge(rec([card()], { camH: 1.9, angle: "high" })), []);
assert.match(judge(rec([card()], { row: 5 }))[0], /lined up/);
assert.match(judge(rec([card()], { bgN: 40, bgFog: 0.02 }))[0], /haze/);
assert.deepEqual(judge(rec([card({ rig: { arms: 2, legs: 2, hands: 2 }, float: [{ frac: 0.001, x: 0.5, y: 0.1 }] })])), []);
assert.match(judge(rec([card({ rig: { arms: 3, legs: 2, hands: 3 } })]))[0], /limb count/);
assert.match(judge(rec([card({ rig: { arms: 2, legs: 2, hands: 4 } })]))[0], /4 hands/);
assert.match(judge(rec([card({ float: [{ frac: 0.02, x: 0.9, y: 0.1 }] })]))[0], /detached piece/);
assert.match(judge(rec([card({ slice: "v" })]))[0], /cut in two/);
assert.match(judge(rec([card({ torsoOcc: 0.3 })]))[0], /cuts across the body/);
assert.match(judge(rec([card({ mode: "sit", torsoOcc: 0.12 })]))[0], /inside the seat/);
assert.match(judge(rec([card({ principal: false, headH: 0.06, headCov: 0.6 })]))[0], /faceless half head/);
assert.deepEqual(judge(rec([card({ principal: false, headH: 0.06, headCov: 0.95 })])), []); // fully hidden: fine
console.log("staging_qa judge: ok");
