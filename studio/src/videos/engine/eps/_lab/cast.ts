// _lab acting: YOU on each ground shot, fall_belly pinned under the sky-fall lens, lie_back flat on the field.
import { V3 } from "../../shot";
import { SETS } from "../../sets";
import { fallPos } from "../../story";
import { Act, Stage } from "../../act";
import { YOU } from "../people";
import { SHOTS } from "./story";

const L = (id: number, [x, y, z]: V3): V3 => { const o = SETS[SHOTS[id - 1].set].origin; return [o[0] + x, o[1] + y, o[2] + z]; };
export const wearAt = (_t: number) => 0;
const stand = (id: number, at: V3): Act[] => [{ i: 0, o: YOU, at: L(id, at), mode: "stand", expr: [[0, "curious"]] }];
const fall = (id: number): Act[] => [{ i: 0, o: YOU, at: [0, 0, 0], mode: "fall_belly", expr: [[0, "shock"]], path: (t) => fallPos(id, t, 4) }];
export const acts = (id: number): Act[] => {
  if (id === 3 || id === 8) return stand(id, [48, 0, 6]);
  if (id >= 4 && id <= 7) return stand(id, [0, 0, 0]);
  if (id === 9 || id === 10) return fall(id);
  if (id === 11) return [{ i: 0, o: YOU, at: L(11, [0, 0, 0]), mode: "lie_back", expr: [[0, "relief"]] }];
  return [];
};
export const fx = (_id: number, _t: number, _out: Stage) => {};
