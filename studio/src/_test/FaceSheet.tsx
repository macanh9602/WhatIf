// test only: every expression on Owen's head, 10 per row, labelled; frame = 30 x seconds since each one began (eased in from
// neutral), for the user's face-style approval (AGENTS.md workflow: cast sheet -> người duyệt)
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Pen, bodyFront, EXPRESSION_NAMES } from "../videos/owen/toon";
import { OWEN, MOM, PATEL } from "../videos/owen/people";

const COLS = 10, CW = 300, CH = 330;
export const FACE_ROWS = Math.ceil(EXPRESSION_NAMES.length / COLS) + 1;

export const FaceSheet: React.FC = () => {
  const f = useCurrentFrame(), ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const g = ref.current!.getContext("2d")!;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#f3efe6"; g.fillRect(0, 0, COLS * CW, FACE_ROWS * CH);
    const cell = (i: number, draw: (p: Pen) => void, label: string) => {
      const x = (i % COLS) * CW, y = Math.floor(i / COLS) * CH;
      // crop to the head: the design space is 600 x 1000, Owen's head sits around y 300-560
      g.save(); g.beginPath(); g.rect(x, y, CW, CH - 40); g.clip();
      g.setTransform(1.15, 0, 0, 1.15, x - 195, y - 300); draw(new Pen(g));
      g.restore(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = "#222"; g.font = "700 22px Arial"; g.textAlign = "center"; g.fillText(label, x + CW / 2, y + CH - 12);
    };
    EXPRESSION_NAMES.forEach((e, i) => cell(i, (p) => bodyFront(p, OWEN, { mode: "stand", expr: e, exprT: f / 30, exprFrom: "neutral", light: -2.1, seed: 1 }), e));
    // the adults' resting faces, as the episode uses them most
    const n = EXPRESSION_NAMES.length;
    ([[MOM, "deadpan", "Mom deadpan"], [MOM, "sideeye", "Mom sideeye"], [MOM, "smug", "Mom smug"], [PATEL, "sly", "Patel sly"], [PATEL, "curious", "Patel curious"], [PATEL, "shook", "Patel shook"]] as const)
      .forEach(([o, e, l], k) => cell(n + k + (COLS - (n % COLS)) % COLS, (p) => bodyFront(p, o, { mode: "stand", expr: e, exprT: f / 30, exprFrom: "neutral", light: -2.1, seed: 2 }), l));
  }, [f]);
  return <AbsoluteFill><canvas ref={ref} width={COLS * CW} height={FACE_ROWS * CH + CH} /></AbsoluteFill>;
};
