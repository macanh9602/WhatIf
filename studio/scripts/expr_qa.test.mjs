// self-check for the expression gate's judgeExpr(): node scripts/expr_qa.test.mjs
import assert from "node:assert/strict";
import { judgeExpr } from "./expr_qa.mjs";
const F = { neutral: "calm", smug: "smug", scheming: "smug", pained: "sad", shock: "shock", irritated: "annoyed", angry: "annoyed", worried: "worried" };
const j = (keys, a = 0, b = 4) => judgeExpr(keys, a, b, F);
assert.deepEqual(j([[0, "smug"]]), { bad: [], warn: [] });                                   // one held face
assert.deepEqual(j([[0, "smug"], [2, "scheming"]]).bad, []);                                  // one step, 2 s hold
assert.deepEqual(j([[0, "smug"], [1.5, "shock"], [2.0, "smug"]]).bad, []);                    // 0.5 s pop back to baseline
assert.match(j([[0, "smug"], [0.5, "scheming"]]).bad[0], /held 0.50 s/);                      // flicker
assert.deepEqual(j([[0, "pained"], [0.8, "neutral"], [1.2, "pained"], [1.9, "smug"]], 0, 3).bad, []); // ep01 s4: drop-the-act pop is legal
assert.match(j([[0, "smug"], [0.6, "irritated"], [1.0, "neutral"], [1.4, "smug"]], 0, 3).bad.join(), /held/); // A-B-C-A flicker
assert.match(j([[0, "smug"], [1.2, "pained"], [2.4, "angry"], [3.6, "worried"]], 0, 6).bad.join(), /jumps across/);
assert.equal(j([[0, "neutral"], [1.2, "smug"], [2.4, "irritated"], [3.6, "angry"]], 0, 6).warn.length, 1);
assert.match(j([[0, "neutral"], [1.2, "smug"], [2.4, "neutral"], [3.6, "angry"], [4.8, "irritated"]], 0, 7).bad[0], /4 expression changes/);
assert.deepEqual(j([[0, "smug"], [9, "shock"]], 10, 12).bad, []);                           // key before the shot carries in
assert.match(j([[0, "nope"]]).bad.join(), /no family/);
console.log("expr_qa self-test ok");
