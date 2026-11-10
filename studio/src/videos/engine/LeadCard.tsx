// Muse lab H13: the episode lead alone on a transparent 600x1000 canvas, to composite over a Muse world clip.
// inputProps: { expr: [[sec, Expr], ...], look / lookY / headTilt / tilt: number | [[sec, value], ...] (smoothstep between keys),
//   who?: CAST index, blinks?: [sec, ...] (only these blinks; default = the engine's blink rate),
//   pose?: [[sec, POSES name], ...] (arm pose from that time on) }. Blinks and eased expression swaps come from the engine (act.ts), as in a normal shot.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, getInputProps, useCurrentFrame, useVideoConfig } from "remotion";
import { Pen, bodyFront, Expr, POSES } from "./toon";
import { exprAnim, exprAt, lidAt } from "./act";
import { CAST } from "@ep/cast";

type Keys = number | [number, number][];
type P = { expr?: [number, Expr][]; look?: Keys; lookY?: Keys; headTilt?: Keys; tilt?: Keys; who?: number; blinks?: number[]; pose?: [number, string][] };

const at = (k: Keys | undefined, t: number) => {
  if (k === undefined) return 0;
  if (typeof k === "number") return k;
  let i = 0; while (i + 1 < k.length && k[i + 1][0] <= t) i++;
  if (i + 1 >= k.length || t <= k[0][0]) return t <= k[0][0] ? k[0][1] : k[i][1];
  const [t0, v0] = k[i], [t1, v1] = k[i + 1], u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  return v0 + (v1 - v0) * u * u * (3 - 2 * u);
};

export const LeadCard: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  useLayoutEffect(() => { // drawn synchronously on commit, before the frame is captured
    const p = getInputProps() as P, t = f / fps, ex = p.expr ?? [[0, "neutral"]];
    const [, o] = CAST[p.who ?? 0], g = ref.current!.getContext("2d")!;
    const pose = p.pose?.filter(([s]) => s <= t).pop()?.[1], reach = pose ? POSES[pose] : undefined;
    g.clearRect(0, 0, 600, 1000);
    bodyFront(new Pen(g), o, { mode: "stand", expr: exprAt(ex, t), ...exprAnim(ex, t), blink: p.blinks ? (p.blinks.some((b) => Math.abs(t - b) < 0.06) ? 1 : 0) : lidAt(t, 0, ex.slice(1).map(([s]) => s)),
      look: at(p.look, t), lookY: at(p.lookY, t), headTilt: at(p.headTilt, t), tilt: at(p.tilt, t), reach });
  }, [f, fps]);
  return <AbsoluteFill><canvas ref={ref} width={600} height={1000} /></AbsoluteFill>;
};
