// What If ep12 explanation inserts (the two short ones in SCRIPT.md): "relax" = muscles go slack as springs, the brain
// rings FALLING?; "seven" = ten sleepers, seven jerk at once. Helpers in kit.tsx. Content in y 120-1250.
import React from "react";
import { useCurrentFrame } from "remotion";
import { SHOTS } from "./story";
import { at, W, c01, Frame, Txt, FPS, DIM, LINE, NAVY, RED, Y, CYAN } from "./kit";

const SKIN = "#f6e7da", JACKET = "#c63939", BLANKET = "#3f6c8c", PILLOW = "#f3e7ce", WOOD = "#8a5a3a";

/** a spring from (x0, y0) to (x1, y1); tight 0..1 (1 = coiled hard, 0 = slack and wavy) */
const Spring: React.FC<{ x0: number; y0: number; x1: number; y1: number; tight: number; c?: string }> = ({ x0, y0, x1, y1, tight, c = RED }) => {
  const n = 9, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, amp = 10 + 24 * tight;
  const pts = Array.from({ length: n * 2 + 1 }, (_, i) => { const s = i / (n * 2), side = i === 0 || i === n * 2 ? 0 : (i % 2 ? 1 : -1) * amp * (tight > 0.3 ? 1 : 0.4 + Math.sin(i) * 0.3);
    return `${x0 + dx * s - uy * side},${y0 + dy * s + ux * side}`; });
  return <polyline points={pts.join(" ")} fill="none" stroke={c} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" />;
};

/** a sleeper in bed seen from the side, head left; jerk 0..1 lifts the body and throws the arm up */
const Sleeper: React.FC<{ x: number; y: number; s: number; jerk: number; dim?: boolean }> = ({ x, y, s, jerk, dim }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={dim ? 0.55 : 1} strokeLinejoin="round">
    <rect x={-170} y={20} width={340} height={60} rx={10} fill={WOOD} stroke={NAVY} strokeWidth={8} />
    <rect x={-190} y={-70} width={30} height={170} rx={8} fill={WOOD} stroke={NAVY} strokeWidth={8} />
    <rect x={-150} y={-30} width={90} height={50} rx={20} fill={PILLOW} stroke={NAVY} strokeWidth={7} />
    <g transform={`translate(0 ${-40 * jerk}) rotate(${-6 * jerk} -110 0)`}>
      <path d="M-70 -20 C-40 -60 140 -60 165 -20 L165 20 L-70 20 Z" fill={BLANKET} stroke={NAVY} strokeWidth={8} />
      <ellipse cx={-105} cy={-30} rx={40} ry={36} fill={SKIN} stroke={NAVY} strokeWidth={7} />
      {jerk > 0.2 ? <><circle cx={-117} cy={-36} r={7} fill={NAVY} /><circle cx={-95} cy={-36} r={7} fill={NAVY} /><ellipse cx={-106} cy={-14} rx={8} ry={10} fill={NAVY} /></>
        : <path d="M-124 -32 Q-117 -26 -110 -32 M-102 -32 Q-95 -26 -88 -32" fill="none" stroke={NAVY} strokeWidth={5} />}
      <path d={jerk > 0.2 ? "M-40 -40 L-20 -120 L10 -150" : "M-40 -35 L20 -30"} fill="none" stroke={NAVY} strokeWidth={10} strokeLinecap="round" />
    </g>
    {jerk > 0.2 && <g stroke={Y} strokeWidth={8} strokeLinecap="round" opacity={jerk}>
      <path d="M-160 -110 L-180 -150 M-100 -130 L-100 -175 M-40 -110 L-20 -150" /></g>}
  </g>
);

const Relax: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 30.0, slack = c01((t - W("relax", 29) + 0.3) / 1.2), brain = at(t, W("brain", a0) - 0.2, 0.25), fall = at(t, W("falling", a0) - 0.15, 0.2);
  const ring = fall > 0 ? Math.sin(t * 40) * 6 : 0;
  return (
    <Frame t={t - a0} title="AS YOU DRIFT OFF">
      {/* you asleep in bed, side view; arm + leg muscles drawn as springs */}
      <g transform="translate(540 880)">
        <rect x={-400} y={60} width={800} height={90} rx={14} fill={WOOD} stroke={NAVY} strokeWidth={9} />
        <rect x={-440} y={-120} width={44} height={270} rx={10} fill={WOOD} stroke={NAVY} strokeWidth={9} />
        <rect x={-380} y={-40} width={170} height={80} rx={30} fill={PILLOW} stroke={NAVY} strokeWidth={8} />
        <ellipse cx={-290} cy={-40} rx={80} ry={74} fill={SKIN} stroke={NAVY} strokeWidth={9} />
        <path d="M-330 -48 Q-318 -38 -306 -48 M-284 -48 Q-272 -38 -260 -48" fill="none" stroke={NAVY} strokeWidth={7} />
        <path d="M-200 -10 C-150 -90 300 -90 380 -10 L380 60 L-200 60 Z" fill={BLANKET} stroke={NAVY} strokeWidth={9} opacity={0.35} />
        <path d="M-210 -30 L60 -30 L60 40 L-210 40 Z" fill={JACKET} stroke={NAVY} strokeWidth={8} />
        <Spring x0={-150} y0={-8} x1={40} y1={-8} tight={1 - slack} />
        <Spring x0={70} y0={-10} x1={360} y1={-10} tight={1 - slack} c={CYAN} />
        <Txt x={-50} y={-110} s={46} c={RED} a={1 - slack * 0.6}>TENSE</Txt>
        <Txt x={180} y={140 + 70} s={52} c={Y} a={slack}>SLACK, FAST</Txt>
      </g>
      {/* the brain, worried: FALLING? */}
      <g opacity={brain} transform={`translate(${300 + ring} 420)`}>
        <path d="M-150 30 C-190 -20 -150 -90 -95 -85 C-80 -140 -10 -150 25 -115 C70 -150 140 -120 145 -65 C195 -50 195 20 150 40 C140 90 80 100 50 80 C10 110 -50 100 -70 75 C-120 100 -150 70 -150 30 Z" fill="#f7a6c4" stroke={NAVY} strokeWidth={9} />
        <circle cx={-30} cy={-10} r={12} fill={NAVY} /><circle cx={40} cy={-10} r={12} fill={NAVY} /><ellipse cx={5} cy={40} rx={16} ry={20} fill={NAVY} />
        <path d="M60 85 L90 170" stroke={NAVY} strokeWidth={8} />
      </g>
      <g opacity={fall} transform={`translate(${720 + ring} 330) scale(${0.8 + 0.2 * fall})`}>
        <rect x={-260} y={-90} width={520} height={180} rx={40} fill={RED} stroke={NAVY} strokeWidth={10} />
        <Txt x={0} y={30} s={100} c="#ffffff">FALLING?</Txt>
        <path d="M-200 90 L-260 160 L-140 90 Z" fill={RED} stroke={NAVY} strokeWidth={8} />
      </g>
      <Txt x={300} y={250} s={44} c={LINE} a={brain}>YOUR BRAIN</Txt>
    </Frame>
  );
};

const Seven: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 35.4, sv = W("seven", a0), jerk = (i: number) => (i < 7 ? c01(Math.sin(c01((t - sv + 0.05 - i * 0.03) / 0.5) * Math.PI) * 1.2) : 0), big = at(t, W("ten", a0) - 0.1, 0.25);
  return (
    <Frame t={t - a0} title="THE SLEEP START">
      {Array.from({ length: 10 }, (_, i) => { const r = Math.floor(i / 2), c = i % 2; // 5 rows of 2
        const order = [0, 3, 5, 1, 8, 6, 2, 9, 4, 7][i]; // which seven jerk: scattered, not the first seven
        return <Sleeper key={i} x={300 + c * 480} y={250 + r * 175} s={0.95} jerk={order < 7 ? jerk(order) : 0} dim={order >= 7 && big > 0.5} />; })}
      <g opacity={big} transform={`translate(540 1180) scale(${0.85 + 0.15 * big})`}>
        <rect x={-330} y={-80} width={660} height={150} rx={30} fill={Y} stroke={NAVY} strokeWidth={10} />
        <Txt x={0} y={30} s={110} c={NAVY} >7 IN 10</Txt>
      </g>
      <Txt x={540} y={150} s={44} c={DIM}>ONE TWITCH, ON THE EDGE OF SLEEP</Txt>
    </Frame>
  );
};

const MAP: Record<string, React.FC<{ t: number }>> = { relax: Relax, seven: Seven };

export const Insert: React.FC<{ id: number }> = ({ id }) => {
  const t = useCurrentFrame() / FPS, C = MAP[SHOTS[id - 1].insert!];
  if (!C) throw new Error(`unknown insert ${SHOTS[id - 1].insert}`);
  return <C t={t} />;
};
