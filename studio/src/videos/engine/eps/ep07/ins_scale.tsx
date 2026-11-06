// What If ep07 square-cube inserts: a cube shrinks x170, skin by the square vs weight by the cube; five million times
// lighter, the air carries you like a dust speck. t = seconds since the start of the video. Content stays above y ~1190.
import React from "react";
import { at, W, Frame, Txt, CYAN, DIM, GRN, LINE, NAVY, RED, Y } from "./kit";

/** a reaction: starts 6 frames before the word and lands about 2 frames before it */
const land = (t: number, word: number) => at(t, word - 0.2, 0.12);
const grow = (k: number) => k * (1 + 0.3 * (1 - k));

/** isometric cube centred at (0,0), edge s */
const Cube: React.FC<{ s: number; top?: string; left?: string; right?: string }> = ({ s, top = CYAN, left = "#3a8fb7", right = "#2a6f93" }) => {
  const h = s * 0.5, w = s * 0.866;
  return <g stroke={NAVY} strokeWidth={Math.max(3, s * 0.03)} strokeLinejoin="round">
    <polygon points={`0,${-s} ${w},${-s + h} 0,${-s + 2 * h} ${-w},${-s + h}`} fill={top} />
    <polygon points={`${-w},${-s + h} 0,${-s + 2 * h} 0,${s} ${-w},${s - h}`} fill={left} />
    <polygon points={`${w},${-s + h} 0,${-s + 2 * h} 0,${s} ${w},${s - h}`} fill={right} />
  </g>;
};
/** the channel lead as a tiny blueprint figure: pale bean head, one curl, white tee, blue jeans */
export const Tiny: React.FC<{ x: number; y: number; s: number; r?: number }> = ({ x, y, s, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} stroke={NAVY} strokeWidth={6} strokeLinejoin="round">
    <path d="M4 -96 C-10 -128 26 -136 22 -110" fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={-70} rx={30} ry={34} fill="#fbf8f4" />
    <rect x={-26} y={-34} width={52} height={50} rx={22} fill="#f4f1ea" />
    <path d="M-14 16 L-18 60 M14 16 L18 60 M-26 -20 L-48 -48 M26 -20 L48 -48" stroke={NAVY} strokeWidth={7} strokeLinecap="round" fill="none" />
    <rect x={-22} y={10} width={44} height={22} rx={8} fill="#3b5b9a" />
    <circle cx={-10} cy={-72} r={4} fill={NAVY} stroke="none" /><circle cx={10} cy={-72} r={4} fill={NAVY} stroke="none" />
  </g>
);

export const CubeIns: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 16.8, shrink = at(t, W("shrink", a0) - 0.1, W("times", a0) + 0.2 - W("shrink", a0)), div = land(t, W("seventy", a0));
  const sq = land(t, W("square", a0)), cu = land(t, W("cube", a0)), skinAt = at(t, W("skin", a0) - 0.1, 0.9), wAt = at(t, W("weight", a0) - 0.1, 1.0);
  const s = 230 * (1 - 0.88 * shrink);
  return (
    <Frame t={t - a0} title="SQUARE VS CUBE">
      <g transform="translate(330 420)" opacity={0.35 * shrink}><Cube s={230} top="none" left="none" right="none" /></g>
      <g transform={`translate(330 ${420 + 6 * Math.sin(t * 2)})`}><Cube s={s} /></g>
      <path d="M560 300 C640 260 700 300 720 360" fill="none" stroke={DIM} strokeWidth={8} strokeDasharray="20 14" />
      <g transform={`translate(800 430) scale(${grow(div)})`}><Txt x={0} y={0} s={120} c={Y}>÷170</Txt></g>
      <Txt x={540} y={700} s={44} c={DIM}>EVERY LENGTH</Txt>
      {/* skin: a flat square sheet, its bar shrinks to a sliver */}
      <g transform="translate(0 0)">
        <rect x={110} y={760} width={150} height={150} fill={Y} stroke={NAVY} strokeWidth={6} transform={`translate(185 835) scale(${1 - 0.6 * skinAt}) translate(-185 -835)`} />
        <Txt x={420} y={810} s={56} anchor="start">SKIN</Txt>
        <rect x={420} y={835} width={540} height={46} fill={NAVY} stroke={LINE} strokeWidth={4} />
        <rect x={420} y={835} width={Math.max(8, 540 * (1 - skinAt))} height={46} fill={Y} />
        <g transform={`translate(690 960) scale(${grow(sq)})`}><Txt x={0} y={0} s={68} c={Y}>1 / 28,900</Txt></g>
      </g>
      <g>
        <g transform={`translate(185 1100) scale(${1 - 0.85 * wAt})`}><Cube s={78} top={RED} left="#c63939" right="#9a2a2a" /></g>
        <Txt x={420} y={1060} s={56} anchor="start">WEIGHT</Txt>
        <rect x={420} y={1085} width={540} height={46} fill={NAVY} stroke={LINE} strokeWidth={4} />
        <rect x={420} y={1085} width={Math.max(2, 540 * (1 - wAt))} height={46} fill={RED} />
        <g transform={`translate(690 1195) scale(${grow(cu)})`}><Txt x={0} y={0} s={68} c={RED}>1 / 5,000,000</Txt></g>
      </g>
    </Frame>
  );
};

export const Dust: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 23.6, five = land(t, W("five", a0)), light = land(t, W("lighter", a0)), air = at(t, W("air", a0) - 0.1, 0.5), dust = land(t, W("dust", a0));
  const bob = (k: number) => 14 * Math.sin(t * 2.2 + k), lift = air * 60;
  return (
    <Frame t={t - a0} title="LIGHT AS A SPECK OF DUST">
      <g transform={`translate(540 300) scale(${grow(five)})`}><Txt x={0} y={0} s={150} c={Y}>5,000,000×</Txt></g>
      <g transform={`translate(540 410) scale(${grow(light)})`}><Txt x={0} y={0} s={90}>LIGHTER</Txt></g>
      {/* air streams rising */}
      {[0, 1, 2, 3, 4, 5].map((i) => { const x = 160 + i * 150, o = ((t * 120 + i * 70) % 160);
        return <path key={i} d={`M${x} ${1180 - o} C${x - 40} ${1080 - o} ${x + 40} ${980 - o} ${x} ${880 - o} C${x - 40} ${780 - o} ${x + 40} ${700 - o} ${x} ${620 - o}`}
          fill="none" stroke={CYAN} strokeOpacity={0.25 + 0.5 * air} strokeWidth={8} strokeDasharray="40 30" />; })}
      {[300, 780].map((x, i) => <g key={x} opacity={air} transform={`translate(${x} ${1120 - 40 * ((t * 1.5 + i * 0.5) % 1)})`}>
        <polygon points="0,-60 40,0 15,0 15,60 -15,60 -15,0 -40,0" fill={GRN} stroke={NAVY} strokeWidth={6} />
      </g>)}
      <Txt x={540} y={1170} s={46} c={GRN} a={air}>AIR DRAG</Txt>
      <Tiny x={420} y={880 - lift + bob(0)} s={1.5} r={8 * Math.sin(t * 1.3)} />
      <g transform={`translate(700 ${820 - lift + bob(2)})`}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => <circle key={k} cx={22 * Math.cos(k * 0.8 + t)} cy={22 * Math.sin(k * 0.8 + t)} r={26} fill="#b9b4c4" stroke={NAVY} strokeWidth={4} />)}
        <circle r={30} fill="#cfcad8" />
        <g transform={`translate(0 -90) scale(${grow(dust)})`}><Txt x={0} y={0} s={50}>DUST</Txt></g>
      </g>
      <Txt x={420} y={1000 - lift + bob(0)} s={44} c={LINE} a={air}>YOU</Txt>
    </Frame>
  );
};

