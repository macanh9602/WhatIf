// Cast sheet for approval (video-pipeline step 3): every named character of the active episode (@ep/cast CAST),
// front view + a solid silhouette row (silhouette_qa.py), feet aligned, and a pose row of the lead (YOU) with each card's
// rig gate result (rig.ts: 2 arms / 2 legs / <= 2 hands / no floating piece) printed under it.
import React, { useEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { Pen, bodyFront, FrontOpts, POSES } from "./toon";
import { CAST } from "@ep/cast";
import { YOU } from "./eps/people";
import { Rig, pieces } from "./rig";

const POSE_ROW: [string, Partial<FrontOpts>][] = [
  ["fall_belly", { mode: "fall_belly", expr: "scared" }], ["jolt_bed", { mode: "jolt_bed", expr: "shock" }],
  ["slide_off", { mode: "slide_off", expr: "scared" }], ["lie_back", { mode: "lie_back", expr: "relief" }],
  ["watch_read", { mode: "stand", reach: POSES.watch_read, prop: "watch", expr: "concentrate", lookY: 0.6, look: 0.4 }], ["squint", { mode: "stand", expr: "squint" }],
];

export const CastSheet: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [h] = useState(() => delayRender("cast sheet"));
  useEffect(() => {
    const g = ref.current!.getContext("2d")!, W = 2400, n = CAST.length, cell = W / n;
    g.fillStyle = "#f4efe6"; g.fillRect(0, 0, W, 2400);
    CAST.forEach(([name, o, opts], i) => {
      g.save(); g.translate(i * cell + cell / 2 - 300, 40); bodyFront(new Pen(g), o, { mode: "stand", ...opts }); g.restore();
      const off = document.createElement("canvas"); off.width = 600; off.height = 1000;
      const og = off.getContext("2d")!; bodyFront(new Pen(og), o, { mode: "stand" });
      og.globalCompositeOperation = "source-in"; og.fillStyle = "#000"; og.fillRect(0, 0, 600, 1000);
      g.drawImage(off, i * cell + cell / 2 - 120, 1070, 240, 400);
      g.fillStyle = "#1d1a3a"; g.font = '900 54px "Segoe UI Black", Arial'; g.textAlign = "center"; g.fillText(name, i * cell + cell / 2, 1010);
    });
    const pc = W / POSE_ROW.length;
    POSE_ROW.forEach(([name, opts], i) => {
      const off = document.createElement("canvas") as HTMLCanvasElement & { rig?: Rig }; off.width = 600; off.height = 1000;
      const og = off.getContext("2d")!; bodyFront(new Pen(og), YOU, opts);
      const a = og.getImageData(0, 0, 600, 1000).data, r = off.rig!, fl = pieces((x, y) => a[(y * 600 + x) * 4 + 3], 600, 1000).filter((q) => q.frac >= 0.004);
      const ok = r.arms === 2 && r.legs === 2 && r.hands <= 2 && !fl.length;
      g.drawImage(off, i * pc, 1560, pc, (pc / 600) * 1000);
      g.textAlign = "center"; g.fillStyle = "#1d1a3a"; g.font = '900 40px "Segoe UI Black", Arial'; g.fillText(name, i * pc + pc / 2, 2280);
      g.fillStyle = ok ? "#2f7a3a" : "#c63939"; g.font = '700 30px Arial';
      g.fillText(`${r.arms}A ${r.legs}L ${r.hands}H ${fl.length}F ${ok ? "ok" : "FAIL"}`, i * pc + pc / 2, 2330);
    });
    continueRender(h);
  }, [h]);
  return <AbsoluteFill><canvas ref={ref} width={2400} height={2400} /></AbsoluteFill>;
};
