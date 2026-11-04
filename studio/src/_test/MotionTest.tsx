// test only: a 12 s acting clip on a flat set to review the cast's motion range (walk, run, sit, pose blends,
// expression swaps with their own motion) before anything goes into the 3D episode. Render:
//   npx remotion render src/index.ts MotionTest out/chars/motion_test.mp4
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Pen, bodyFront, POSES, Reach, Expr, FrontOpts, Outfit } from "../videos/owen/toon";
import { OWEN, MOM, THEO } from "../videos/owen/people";

export const MOTION_FRAMES = 360;
const FPS = 30, BLEND = 0.25; // s: pose-to-pose ease
/** arms hanging (what `reach: undefined` draws), as Reach, so a blend never jumps */
const REST: [Reach, Reach] = [{ ex: -14, ey: 0.39, hx: -17, hy: 0.74 }, { ex: 14, ey: 0.39, hx: 17, hy: 0.74 }];
const smooth = (x: number) => { const k = Math.max(0, Math.min(1, x)); return k * k * (3 - 2 * k); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const poseOf = (name: string | null): [Reach, Reach] => { const p = name ? POSES[name] : undefined; return [p?.[0] ?? REST[0], p?.[1] ?? REST[1]]; };
const mixReach = (a: Reach, b: Reach, k: number): Reach =>
  ({ ex: lerp(a.ex, b.ex, k), ey: lerp(a.ey, b.ey, k), hx: lerp(a.hx, b.hx, k), hy: lerp(a.hy, b.hy, k), front: k < 0.5 ? a.front : b.front });

/** one key: from time t on, this pose / expression / mode; x moves linearly to the next key's x */
type Key = { t: number; x: number; pose?: string | null; expr: Expr; mode?: FrontOpts["mode"]; facing?: -1 | 0 | 1 };
const at = (keys: Key[], t: number) => {
  let i = 0; while (i + 1 < keys.length && t >= keys[i + 1].t) i++;
  const k = keys[i], n = keys[i + 1], prev = keys[i - 1];
  const x = n ? lerp(k.x, n.x, Math.min(1, (t - k.t) / (n.t - k.t))) : k.x; // walks and runs move at constant speed
  const kb = smooth((t - k.t) / BLEND), from = poseOf(prev?.pose ?? null), to = poseOf(k.pose ?? null);
  const reach: [Reach, Reach] = [mixReach(from[0], to[0], kb), mixReach(from[1], to[1], kb)];
  return { x, reach, expr: k.expr, exprT: t - k.t, exprFrom: prev && prev.expr !== k.expr ? prev.expr : undefined, mode: k.mode ?? "stand", facing: k.facing ?? 0 };
};

const OWEN_KEYS: Key[] = [
  { t: 0, x: -120, expr: "whistle", mode: "stroll", facing: 1 },
  { t: 2.0, x: 430, pose: "hands_on_hips", expr: "smug" },
  { t: 3.4, x: 430, pose: "shrug", expr: "confused" },
  { t: 4.8, x: 430, pose: "facepalm", expr: "bruh" },
  { t: 6.4, x: 430, pose: "hands_up", expr: "shook", facing: 1 },
  { t: 7.3, x: 430, pose: "hands_up", expr: "cringe", facing: 1 },
  { t: 8.2, x: 430, pose: "head_scratch", expr: "nervous_laugh" },
  { t: 9.4, x: 430, pose: null, expr: "excited", mode: "march", facing: -1 },
  { t: 10.6, x: -260, pose: null, expr: "excited", mode: "march", facing: -1 },
];
const MOM_KEYS: Key[] = [
  { t: 0, x: 1300, expr: "deadpan", facing: -1 },
  { t: 5.6, x: 1300, expr: "deadpan", mode: "stroll", facing: -1 },
  { t: 6.6, x: 780, pose: "hands_on_hips", expr: "angry", facing: -1 },
  { t: 8.2, x: 780, pose: "arms_crossed", expr: "sideeye", facing: -1 },
  { t: 9.6, x: 780, pose: "facepalm", expr: "sigh", facing: -1 },
  { t: 11.0, x: 780, pose: "arms_crossed", expr: "deadpan", facing: -1 },
];
const THEO_KEYS: Key[] = [
  { t: 0, x: 130, expr: "curious", mode: "sit", facing: 1 },
  { t: 3.4, x: 130, expr: "sideeye", mode: "sit", facing: 1 },
  { t: 6.4, x: 130, pose: "cover_mouth", expr: "shook", mode: "sit", facing: 1 },
  { t: 9.6, x: 130, pose: "clap", expr: "laugh", mode: "sit", facing: 1 },
];
const CAST: [Outfit, Key[], number][] = [[THEO, THEO_KEYS, 0.95], [MOM, MOM_KEYS, 1.12], [OWEN, OWEN_KEYS, 1.12]]; // kid ~36 % of frame height (mid shot)

export const MotionTest: React.FC = () => {
  const f = useCurrentFrame(), ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const g = ref.current!.getContext("2d")!, t = f / FPS;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = "#efe3c8"; g.fillRect(0, 0, 1080, 1920);
    g.fillStyle = "#c79a63"; g.fillRect(0, 1560, 1080, 360);
    g.fillStyle = "#3b2b22"; g.fillRect(0, 1556, 1080, 8);
    g.font = "700 34px Arial"; g.fillStyle = "#6b5a44"; g.fillText(`MOTION TEST  t = ${t.toFixed(2)} s`, 40, 70);
    CAST.forEach(([o, keys, sc], i) => {
      const s = at(keys, t);
      // design space: feet centre at x = 300, soles at y = 975; facing -1 mirrors the card about the feet
      const m = s.facing === -1 ? -1 : 1;
      g.setTransform(m * sc, 0, 0, sc, s.x - m * 300 * sc, 1640 - 975 * sc);
      bodyFront(new Pen(g), o, { mode: s.mode, phase: s.mode === "march" ? t * 3 : t * 2, lift: s.mode === "march" ? 120 : 60, expr: s.expr,
        exprT: s.exprT, exprFrom: s.exprFrom, reach: s.mode === "march" || s.mode === "stroll" ? undefined : s.reach,
        facing: 0, seed: i + 1, light: -2.1, look: s.facing * 0.6 });
    });
  }, [f]);
  return <AbsoluteFill><canvas ref={ref} width={1080} height={1920} /></AbsoluteFill>;
};
