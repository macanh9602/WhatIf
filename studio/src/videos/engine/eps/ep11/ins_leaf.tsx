// What If ep11 leaf insert: sunlight hits a leaf, 2 % becomes food, the rest bounces off. Content in y 120-1250.
import React from "react";
import { at, W, Frame, Txt, DIM, GRN, LINE, NAVY, RED, Y } from "./kit";

const grow = (k: number) => k * (1 + 0.3 * (1 - k));
const N = 14;

/** a big broad leaf at (x, y): pointed tip, midrib, side veins, a stem */
const BigLeaf: React.FC<{ x: number; y: number; s: number; a?: number }> = ({ x, y, s, a = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`} stroke={NAVY} strokeLinejoin="round" strokeLinecap="round">
    <path d="M0 150 C-10 200 -30 240 -60 280" fill="none" stroke="#3f7a35" strokeWidth={22} />
    <path d="M0 -240 C150 -170 230 -40 170 70 C120 150 40 160 0 150 C-40 160 -120 150 -170 70 C-230 -40 -150 -170 0 -240 Z" fill="#62c24e" strokeWidth={9} />
    <path d="M0 -215 L0 150" fill="none" stroke="#2f7a2c" strokeWidth={9} />
    {[-130, -60, 10, 80].map((yy) => [-1, 1].map((d) => <path key={`${yy}${d}`} d={`M0 ${yy + 40} Q${d * 60} ${yy + 10} ${d * 120} ${yy - 30}`} fill="none" stroke="#2f7a2c" strokeWidth={6} />))}
  </g>
);
const Sun: React.FC<{ x: number; y: number; r: number; t: number }> = ({ x, y, r, t }) => <g transform={`translate(${x} ${y})`}>
  {Array.from({ length: 12 }, (_, i) => { const a = (i * 30 + t * 14) * Math.PI / 180; return <line key={i} x1={Math.cos(a) * r * 1.2} y1={Math.sin(a) * r * 1.2} x2={Math.cos(a) * r * 1.6} y2={Math.sin(a) * r * 1.6} stroke={Y} strokeWidth={14} strokeLinecap="round" />; })}
  <circle r={r} fill={Y} stroke={NAVY} strokeWidth={8} />
</g>;

export const Leaf: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 21.1, lf = at(t, a0 + 0.05, 0.3), job = at(t, W("job", a0) - 0.15, 0.2), two = at(t, W("two", a0) - 0.1, 0.15), rest = at(t, W("sunlight", 25.9) - 0.2, 0.3), food = at(t, W("food", 26.5) - 0.2, 0.2);
  const SX = 170, SY = 280, HX = 500, HY = 640;
  return (
    <Frame t={t - a0} title="A LEAF: SUNLIGHT IN, FOOD OUT">
      <Sun x={SX} y={SY} r={100} t={t} />
      <g opacity={lf}><BigLeaf x={500} y={640} s={1.2 * grow(lf)} a={8 * Math.sin(t * 1.3)} /></g>
      {Array.from({ length: N }, (_, i) => {
        const k = (t * 0.55 + i / N) % 1, hit = 0.5, tx = HX + ((i * 37) % 200) - 100, ty = HY + ((i * 53) % 220) - 120;
        if (k < hit) { const u = k / hit; return <circle key={i} cx={SX + (tx - SX) * u} cy={SY + (ty - SY) * u} r={21} fill={Y} stroke={NAVY} strokeWidth={4} opacity={0.3 + 0.7 * lf} />; }
        const u = (k - hit) / (1 - hit);
        if (i === 3 && two > 0) return <circle key={i} cx={tx + (300 - tx) * u} cy={ty + (1000 - ty) * u} r={24} fill={GRN} stroke={NAVY} strokeWidth={4} opacity={1 - 0.6 * u} />;
        return two > 0 ? <circle key={i} cx={tx + (1040 - tx) * u} cy={ty + (150 + i * 16 - ty) * u} r={21} fill={Y} stroke={NAVY} strokeWidth={4} opacity={1 - u} /> : null;
      })}
      <g opacity={job} transform={`translate(640 190) scale(${grow(job)})`}><Txt x={0} y={0} s={56} c={GRN}>1 JOB: MAKE FOOD</Txt></g>
      <g opacity={rest}><Txt x={830} y={380} s={42} c={RED}>THE REST</Txt><Txt x={830} y={432} s={42} c={RED}>BOUNCES OFF</Txt></g>
      {/* all the sunlight as one bar; the green sliver is the true 2 % */}
      <g opacity={two}>
        <rect x={110} y={1130} width={860} height={60} fill={Y} stroke={NAVY} strokeWidth={6} />
        <rect x={110} y={1130} width={17} height={60} fill={GRN} stroke={NAVY} strokeWidth={4} />
        <Txt x={540} y={1176} s={40} c={NAVY}>ALL THE SUNLIGHT</Txt>
      </g>
      <g transform={`translate(830 880) scale(${grow(two)})`}><Txt x={0} y={0} s={170} c={GRN}>2%</Txt></g>
      <g opacity={food} transform={`translate(300 1035) scale(${grow(food)})`}>
        <path d="M-90 -44 C-90 -80 -40 -80 0 -70 C40 -80 90 -80 90 -44 L84 44 L-84 44 Z" fill="#e9b86a" stroke={NAVY} strokeWidth={7} />
        <Txt x={190} y={18} s={56} c={LINE}>FOOD</Txt>
      </g>
      <Txt x={170} y={460} s={40} c={DIM}>SUNLIGHT</Txt>
    </Frame>
  );
};
