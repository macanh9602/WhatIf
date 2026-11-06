// What If ep07 heat inserts: the same skin bleeds heat x170 per gram; eat like a shrew, your own weight in food a day.
// t = seconds since the start of the video. Content stays above y ~1190 (caption band 1290-1590).
import React from "react";
import { at, W, Frame, Txt, CYAN, DIM, LINE, NAVY, RED, Y } from "./kit";
import { Tiny } from "./ins_scale";

const land = (t: number, word: number) => at(t, word - 0.2, 0.12);
const grow = (k: number) => k * (1 + 0.3 * (1 - k));

/** a wavy heat arrow leaving (x, y) along angle a (deg), length l, drifting outward with time */
const HeatArrow: React.FC<{ x: number; y: number; a: number; l: number; t: number; o?: number }> = ({ x, y, a, l, t, o = 1 }) => {
  const d = (t * 0.9) % 1, r = (a * Math.PI) / 180, x0 = x + Math.cos(r) * l * 0.3 * d, y0 = y + Math.sin(r) * l * 0.3 * d;
  const pts = Array.from({ length: 9 }, (_, i) => { const k = i / 8, w = 0.08 * l * Math.sin(k * 9 + t * 8); return [x0 + Math.cos(r) * l * k - Math.sin(r) * w, y0 + Math.sin(r) * l * k + Math.cos(r) * w]; });
  const [ex, ey] = pts[8], hx = Math.cos(r) * l * 0.18, hy = Math.sin(r) * l * 0.18;
  return <g opacity={o * (1 - d * 0.5)}>
    <polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={RED} strokeWidth={Math.max(6, l * 0.08)} strokeLinecap="round" />
    <polygon points={`${ex + hx},${ey + hy} ${ex - hy * 0.8},${ey + hx * 0.8} ${ex + hy * 0.8},${ey - hx * 0.8}`} fill={RED} stroke={NAVY} strokeWidth={4} />
  </g>;
};

export const Heat: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 29.15, heat = at(t, W("heat", a0) - 0.2, 0.4), x170 = land(t, W("seventy", a0)), fast = at(t, W("faster", a0) - 0.15, 0.5), gram = land(t, W("gram", a0));
  const shiver = 3 * Math.sin(t * 40) * heat;
  return (
    <Frame t={t - a0} title="TINY BODY, SAME SKIN">
      <Txt x={270} y={200} s={46} c={DIM}>FULL SIZE</Txt>
      <Txt x={790} y={200} s={46} c={DIM}>1 CM YOU</Txt>
      <path d="M540 170V690" stroke={DIM} strokeWidth={4} strokeDasharray="18 14" />
      <Tiny x={270} y={610} s={2.3} />
      {[-30, 210].map((a) => <HeatArrow key={a} x={270 + 80 * Math.cos((a * Math.PI) / 180)} y={460 + 70 * Math.sin((a * Math.PI) / 180)} a={a} l={90} t={t} o={heat} />)}
      <g transform={`translate(${790 + shiver} 0)`}><Tiny x={0} y={480} s={0.9} /></g>
      {Array.from({ length: 12 }, (_, i) => i * 30).map((a) => <HeatArrow key={a} x={790 + 40 * Math.cos((a * Math.PI) / 180)} y={430 + 40 * Math.sin((a * Math.PI) / 180)} a={a} l={150} t={t + a / 90} o={heat} />)}
      <Txt x={540} y={790} s={52}>HEAT LOST PER GRAM</Txt>
      <Txt x={110} y={900} s={44} anchor="start">BIG</Txt>
      <rect x={300} y={862} width={36} height={52} fill={RED} stroke={NAVY} strokeWidth={5} />
      <Txt x={110} y={1030} s={44} anchor="start">TINY</Txt>
      <rect x={300} y={992} width={36 + 640 * fast} height={52} fill={RED} stroke={NAVY} strokeWidth={5} />
      <g transform={`translate(800 1130) scale(${grow(x170)})`}><Txt x={0} y={0} s={96} c={Y}>×170</Txt></g>
      <g opacity={gram} transform={`translate(220 1135) scale(${grow(gram)})`}>
        <rect x={-70} y={-55} width={140} height={90} rx={10} fill={CYAN} stroke={NAVY} strokeWidth={6} />
        <Txt x={0} y={14} s={50} c="#ffffff">1 g</Txt>
      </g>
      <Txt x={390} y={1145} s={40} c={LINE} a={gram}>EVERY</Txt>
    </Frame>
  );
};

/** a pygmy shrew facing right: long body, pointed pink nose, tiny eye, round ear, thin tail; chew 0..1 */
const ShrewBody: React.FC<{ x: number; y: number; s: number; chew: number; shiver: number }> = ({ x, y, s, chew, shiver }) => (
  <g transform={`translate(${x + shiver} ${y}) scale(${s})`} stroke={NAVY} strokeWidth={6} strokeLinejoin="round">
    <path d="M-150 20 C-220 30 -260 0 -300 -20" fill="none" strokeWidth={8} strokeLinecap="round" />
    <ellipse cx={-40} cy={0} rx={130} ry={72} fill="#8a6a55" />
    <path d={`M60 -40 C120 -40 170 -10 ${200 + 6 * chew} ${10 + 8 * chew} C150 40 90 50 60 40 Z`} fill="#8a6a55" />
    <circle cx={203 + 6 * chew} cy={12 + 8 * chew} r={12} fill="#f7a6c4" />
    <circle cx={110} cy={-12} r={8} fill={NAVY} />
    <ellipse cx={60} cy={-50} rx={22} ry={18} fill="#a4826a" />
    <ellipse cx={-40} cy={20} rx={90} ry={34} fill="#b49880" stroke="none" />
    <path d="M-90 60 L-100 90 M10 60 L20 90" strokeWidth={8} strokeLinecap="round" />
    {[-1, 1].map((k) => <path key={k} d={`M190 ${4 + 8 * chew} L240 ${-10 + k * 16}`} strokeWidth={3} />)}
  </g>
);

export const Shrew: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 35.7, cold = at(t, a0, 0.3) * (1 - at(t, W("eat", a0) - 0.1, 0.3)), shrew = land(t, W("shrew", a0)), eat = at(t, W("eat", a0) - 0.1, 0.2);
  const scale = at(t, W("own", a0) - 0.2, 0.5), level = at(t, W("weight", a0) - 0.05, 0.5), day = land(t, W("day", a0)), chew = eat * Math.max(0, Math.sin(t * 14));
  const tilt = 14 * (1 - level);
  return (
    <Frame t={t - a0} title="TO STAY WARM: EAT LIKE A SHREW">
      <Txt x={330} y={330} s={54} c={CYAN} a={cold}>BRRR</Txt>
      <g><ShrewBody x={320} y={430} s={1.05} chew={chew} shiver={4 * Math.sin(t * 45) * cold} /></g>
      <g transform={`translate(780 470) scale(${0.4 + 0.6 * eat})`} opacity={eat}>
        <ellipse cx={0} cy={60} rx={210} ry={44} fill="#f4f1ea" stroke={NAVY} strokeWidth={8} />
        {[[-120, 20], [-60, 0], [0, -10], [60, 0], [120, 20], [-90, -50], [-20, -60], [50, -50], [0, -110]].map(([x, y], i) =>
          <ellipse key={i} cx={x} cy={y} rx={42} ry={34} fill={i % 3 ? "#d9a55a" : i % 2 ? "#7cc35a" : "#c98f45"} stroke={NAVY} strokeWidth={5} />)}
      </g>
      <Txt x={300} y={250} s={64} c={Y} a={shrew}>SHREW</Txt>
      <Txt x={780} y={250} s={50} a={eat}>ITS FOOD</Txt>
      {/* balance: shrew vs a day's food */}
      <g opacity={scale}>
        <polygon points="540,1060 500,1140 580,1140" fill={LINE} stroke={NAVY} strokeWidth={6} />
        <g transform={`rotate(${tilt} 540 1060)`}>
          <rect x={200} y={1052} width={680} height={16} fill={LINE} stroke={NAVY} strokeWidth={5} />
          <path d="M220 1060 L250 940 M220 1060 L190 940 M860 1060 L890 940 M860 1060 L830 940" stroke={LINE} strokeWidth={5} />
          <ellipse cx={220} cy={940} rx={90} ry={16} fill={LINE} stroke={NAVY} strokeWidth={5} />
          <ellipse cx={860} cy={940} rx={90} ry={16} fill={LINE} stroke={NAVY} strokeWidth={5} />
          <ShrewBody x={235} y={890} s={0.32} chew={0} shiver={0} />
          {[[-40, 920], [0, 920], [40, 920], [-20, 890], [20, 890], [0, 862]].map(([x, y], i) => <ellipse key={i} cx={860 + x} cy={y} rx={22} ry={18} fill="#d9a55a" stroke={NAVY} strokeWidth={4} />)}
        </g>
        <Txt x={540} y={800} s={52} c={level > 0.9 ? Y : LINE}>= ITS OWN WEIGHT</Txt>
      </g>
      <g transform={`translate(540 1185) scale(${grow(day)})`}><Txt x={0} y={0} s={60} c={CYAN}>EVERY DAY</Txt></g>
    </Frame>
  );
};
