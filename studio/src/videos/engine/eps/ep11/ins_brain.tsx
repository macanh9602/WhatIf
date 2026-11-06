// What If ep11 brain insert: the brain eats a fifth of the energy bar; your skin unfolds as a 2 m2 sheet. Content in y 120-1250.
import React from "react";
import { at, W, c01, Frame, Txt, DIM, GRN, LINE, NAVY, RED, Y } from "./kit";

const grow = (k: number) => k * (1 + 0.3 * (1 - k));
const PINK = "#f7a6c4", FOLD = "#c8608c";

/** a side-view cartoon brain, wrinkled lobes and a stem, with a chomping mouth; chew 0..1 */
const BrainArt: React.FC<{ x: number; y: number; s: number; chew: number }> = ({ x, y, s, chew }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
    <path d="M30 110 C30 160 10 190 -10 210 L50 210 C70 180 80 150 80 110 Z" fill={FOLD} stroke={NAVY} strokeWidth={8} />
    <path d="M-170 40 C-220 -20 -180 -90 -120 -90 C-110 -150 -30 -170 20 -130 C70 -170 150 -140 160 -80 C220 -70 230 10 180 50 C180 100 120 130 80 110 C40 140 -30 130 -50 100 C-110 130 -160 90 -170 40 Z" fill={PINK} stroke={NAVY} strokeWidth={9} />
    {["M-130 -30 C-90 -70 -60 -30 -30 -60 C0 -90 30 -50 60 -80", "M-140 30 C-100 0 -70 40 -30 10 C10 -20 40 20 90 -10 C120 -30 150 -20 170 0", "M-90 80 C-60 50 -20 90 10 60 C40 40 70 70 110 60", "M60 -130 C50 -100 100 -90 90 -60", "M-60 -130 C-70 -100 -30 -100 -40 -70"].map((d) => <path key={d} d={d} fill="none" stroke={FOLD} strokeWidth={9} />)}
    <g transform="translate(205 10)"><path d={`M-40 ${-24 - 26 * chew} L40 ${-8 - 16 * chew} L40 ${8 + 16 * chew} L-40 ${24 + 26 * chew} Z`} fill="#7a1a3a" stroke={NAVY} strokeWidth={7} /></g>
  </g>
);

export const Brain: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 33.95, brain = at(t, W("brain", a0) - 0.3, 0.25), burns = W("burns", a0), fifth = at(t, W("fifth", a0) - 0.1, 0.15), eaten = at(t, burns, W("energy", a0) + 0.3 - burns);
  const skin = at(t, W("and", 37) - 0.1, 0.3), unfold = c01((t - W("around", a0)) / 1.0), m2 = at(t, W("two", 38) - 0.1, 0.2), chew = t > burns && t < burns + 3 ? Math.abs(Math.sin(t * 9)) : 0.2;
  const X0 = 420, CW = 118, u1 = 1 - eaten;
  return (
    <Frame t={t - a0} title="YOU RUN HOT, ON A SMALL SHEET">
      <g opacity={brain}><BrainArt x={230} y={320} s={0.86 * grow(brain)} chew={chew} /></g>
      <Txt x={230} y={170} s={50} c={LINE} a={brain}>YOUR BRAIN</Txt>
      {/* the bar: five blocks, the brain eats the first */}
      <g opacity={brain}>
        <rect x={X0 - 12} y={260} width={CW * 5 + 24} height={130} rx={14} fill="#2b2f3a" stroke={LINE} strokeWidth={7} />
        {[1, 2, 3, 4].map((i) => <rect key={i} x={X0 + i * CW + 4} y={272} width={CW - 8} height={106} fill={GRN} stroke={NAVY} strokeWidth={4} />)}
        <rect x={X0 + 4 - 60 * (1 - u1)} y={272 + 53 * (1 - u1)} width={(CW - 8) * u1} height={106 * u1} fill={RED} stroke={NAVY} strokeWidth={4} />
        <Txt x={X0 + CW * 2.5} y={220} s={46} c={LINE}>YOUR ENERGY</Txt>
      </g>
      <g transform={`translate(740 490) scale(${grow(fifth)})`} opacity={fifth}><Txt x={0} y={0} s={88} c={RED}>A FIFTH</Txt></g>
      <path d="M90 590H990" stroke={DIM} strokeWidth={4} strokeDasharray="18 14" />
      {/* a green you and the sheet of your skin, unfolding panel by panel */}
      <g opacity={skin}>
        <g transform="translate(205 1060)" strokeLinecap="round">
          <path d="M-22 60 L-30 150 M22 60 L30 150 M-48 -30 L-100 40 M48 -30 L100 40" stroke={NAVY} strokeWidth={13} fill="none" />
          <ellipse cy={-140} rx={72} ry={80} fill="#7ccb5a" stroke={NAVY} strokeWidth={8} />
          <rect x={-58} y={-68} width={116} height={140} rx={46} fill="#c63939" stroke={NAVY} strokeWidth={8} />
          <circle cx={-24} cy={-150} r={9} fill={NAVY} /><circle cx={24} cy={-150} r={9} fill={NAVY} />
          <path d="M-22 -112 Q0 -96 22 -112" fill="none" stroke={NAVY} strokeWidth={7} />
        </g>
        <Txt x={640} y={690} s={48} c={LINE}>ALL YOUR SKIN, LAID FLAT</Txt>
        {[0, 1, 2, 3].map((i) => { const k = c01(unfold * 4 - i), w = 130; return <g key={i} transform={`translate(${380 + i * w} 760)`}>
          <rect x={0} y={0} width={w * k} height={390} fill={i % 2 ? "#7ccb5a" : "#6abc4c"} stroke={NAVY} strokeWidth={7} />
        </g>; })}
        <g opacity={m2}>
          <Txt x={640} y={990} s={120} c="#ffffff">2 m²</Txt>
          <Txt x={640} y={1215} s={46} c={Y}>THAT IS ALL YOU GET</Txt>
        </g>
      </g>
    </Frame>
  );
};
