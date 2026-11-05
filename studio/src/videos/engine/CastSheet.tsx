// Cast sheet for approval (video-pipeline step 3): every named character of the active episode (@ep/cast CAST),
// front view + a solid silhouette row (silhouette_qa.py), feet aligned.
import React, { useEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { Pen, bodyFront } from "./toon";
import { CAST } from "@ep/cast";

export const CastSheet: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [h] = useState(() => delayRender("cast sheet"));
  useEffect(() => {
    const g = ref.current!.getContext("2d")!, W = 2400, n = CAST.length, cell = W / n;
    g.fillStyle = "#f4efe6"; g.fillRect(0, 0, W, 1500);
    CAST.forEach(([name, o, opts], i) => {
      g.save(); g.translate(i * cell + cell / 2 - 300, 40); bodyFront(new Pen(g), o, { mode: "stand", ...opts }); g.restore();
      const off = document.createElement("canvas"); off.width = 600; off.height = 1000;
      const og = off.getContext("2d")!; bodyFront(new Pen(og), o, { mode: "stand" });
      og.globalCompositeOperation = "source-in"; og.fillStyle = "#000"; og.fillRect(0, 0, 600, 1000);
      g.drawImage(off, i * cell + cell / 2 - 120, 1070, 240, 400);
      g.fillStyle = "#1d1a3a"; g.font = '900 54px "Segoe UI Black", Arial'; g.textAlign = "center"; g.fillText(name, i * cell + cell / 2, 1010);
    });
    continueRender(h);
  }, [h]);
  return <AbsoluteFill><canvas ref={ref} width={2400} height={1500} /></AbsoluteFill>;
};
