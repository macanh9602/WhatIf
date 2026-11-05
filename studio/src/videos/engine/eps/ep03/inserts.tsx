// What If ep03 explanation inserts: full-screen animated blueprint cards (same style as ep01). 1080x1920; content stays in
// y 120-1250, the caption band is y 1290-1590.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SHOTS } from "./story";
import words from "./words";

const FPS = 30;
/** start of the first spoken `text` at or after `from` seconds */
const W = (text: string, from: number) => {
  const hit = words.find((w) => w.start >= from - 0.01 && w.text.replace(/[^A-Za-z']/g, "").toLowerCase() === text.toLowerCase());
  if (!hit) throw new Error(`insert word missing: ${text} after ${from}`);
  return hit.start;
};
const c01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const k = c01(x); return k * k * (3 - 2 * k); };
const at = (t: number, a: number, d = 0.5) => ease((t - a) / d);

const BG = "#16325c", LINE = "#dfe9f7", DIM = "rgba(223,233,247,.35)", Y = "#ffd23f", RED = "#ff5a4f", GRN = "#2ee86a", CYAN = "#5ce1ff";

const Txt: React.FC<{ x: number; y: number; s?: number; c?: string; a?: number; anchor?: "start" | "middle" | "end"; children: React.ReactNode }> = ({ x, y, s = 64, c = LINE, a = 1, anchor = "middle", children }) => (
  <text x={x} y={y} fontSize={s} fill={c} opacity={a} textAnchor={anchor} fontFamily='"Arial Black", Arial, sans-serif' fontWeight={900}
    stroke="#0b1a33" strokeWidth={s * 0.12} paintOrder="stroke" strokeLinejoin="round">{children}</text>
);
const Frame: React.FC<{ t: number; title: string; children: React.ReactNode }> = ({ t, title, children }) => (
  <AbsoluteFill style={{ background: BG }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <defs>
        <pattern id="grid" width={60} height={60} patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="rgba(223,233,247,.09)" strokeWidth={2} /></pattern>
        <radialGradient id="vig" cx="50%" cy="42%" r="70%"><stop offset="60%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#000" stopOpacity={0.45} /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#grid)" />
      <g transform={`translate(540 700) scale(${1 + 0.012 * t}) translate(-540 -700)`}>{children}</g>
      <rect x={60} y={1660} width={960} height={150} fill="none" stroke={DIM} strokeWidth={4} />
      <Txt x={90} y={1720} s={34} c={DIM} anchor="start">FIELD NOTES · WHAT IF</Txt>
      <Txt x={90} y={1780} s={44} anchor="start">{title}</Txt>
      <rect width={1080} height={1920} fill="url(#vig)" />
    </svg>
  </AbsoluteFill>
);

/** +10 % skill bar, then the life line 0-80 whose last year peels off the END */
const Deal: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 12.1, bar = at(t, W("ten", a0) - 0.2, 0.8), life = at(t, W("year", a0) - 0.3, 0.6), peel = at(t, W("end", a0) - 0.2, 0.9);
  const x0 = 120, x1 = 960, X = (age: number) => x0 + ((x1 - x0) * age) / 80;
  return (
    <Frame t={t - a0} title="THE DEAL">
      <Txt x={120} y={300} s={56} anchor="start">SKILL</Txt>
      <rect x={120} y={340} width={840} height={90} rx={20} fill="#0b1a33" stroke={LINE} strokeWidth={6} />
      <rect x={130} y={350} width={600 + 220 * bar} height={70} rx={14} fill={CYAN} />
      <Txt x={900} y={300} s={64} c={CYAN} a={bar} anchor="end">+10%</Txt>
      <g opacity={life}>
        <Txt x={120} y={720} s={56} anchor="start">YOUR LIFE</Txt>
        <rect x={x0} y={770} width={X(79) - x0} height={110} rx={14} fill={RED} stroke={LINE} strokeWidth={6} />
        <g transform={`translate(${60 * peel} ${420 * peel * peel}) rotate(${50 * peel} ${X(79.5)} 825)`}>
          <rect x={X(79)} y={770} width={X(80) - X(79) + 4} height={110} rx={6} fill={Y} stroke={LINE} strokeWidth={6} />
        </g>
        {[0, 20, 40, 60, 80].map((g) => <Txt key={g} x={X(g)} y={950} s={40}>{g}</Txt>)}
        <Txt x={X(76)} y={1180} s={60} c={Y} a={peel}>−1 YEAR</Txt><Txt x={X(76)} y={1250} s={40} c={Y} a={peel}>FROM THE END</Txt>
      </g>
    </Frame>
  );
};

/** a balance: levels against years */
const MathCard: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 28.5, tip = Math.sin((t - a0) * 1.6) * 8 * at(t, a0 + 0.4, 0.8), k = at(t, W("strange", a0) - 0.3, 0.5);
  return (
    <Frame t={t - a0} title="EVERYONE DOES THE MATH">
      <line x1={540} y1={420} x2={540} y2={1000} stroke={LINE} strokeWidth={14} />
      <polygon points="440,1000 640,1000 540,940" fill={LINE} />
      <g transform={`rotate(${tip} 540 430)`}>
        <line x1={180} y1={430} x2={900} y2={430} stroke={LINE} strokeWidth={14} />
        <path d="M120 600 L240 600 L180 430 Z M840 600 L960 600 L900 430 Z" fill="none" stroke={LINE} strokeWidth={5} />
        {[0, 1, 2].map((i) => <g key={i}><ellipse cx={180} cy={580 - i * 46} rx={70} ry={22} fill={Y} stroke="#0b1a33" strokeWidth={5} /></g>)}
        <Txt x={180} y={700} s={48} c={Y}>LEVELS</Txt>
        {[0, 1].map((i) => <g key={i} transform={`translate(${860 + i * 60} ${510})`}><path d="M-22 -60 L22 -60 L4 -5 L22 50 L-22 50 L-4 -5 Z" fill="rgba(220,240,255,.9)" stroke="#0b1a33" strokeWidth={5} /></g>)}
        <Txt x={900} y={700} s={48} c={RED}>YEARS</Txt>
      </g>
      <Txt x={540} y={300} s={70} a={k}>1 LEVEL = 1 YEAR</Txt>
    </Frame>
  );
};

const Bank: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 53.6, form = at(t, W("loans", a0) - 0.2, 0.5), rate = at(t, W("interest", a0) - 0.2, 0.4);
  return (
    <Frame t={t - a0} title="BANKS LEND YEARS">
      <polygon points="140,420 540,230 940,420" fill="#e9dfc8" stroke="#0b1a33" strokeWidth={8} />
      <rect x={180} y={420} width={720} height={60} fill="#e9dfc8" stroke="#0b1a33" strokeWidth={8} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={230 + i * 175} y={480} width={60} height={330} fill="#f4efe0" stroke="#0b1a33" strokeWidth={6} />)}
      <rect x={140} y={810} width={800} height={50} fill="#e9dfc8" stroke="#0b1a33" strokeWidth={8} />
      <Txt x={540} y={395} s={44} c="#16325c">BANK OF YEARS</Txt>
      <g opacity={form} transform={`translate(0 ${80 * (1 - form)})`}>
        <rect x={220} y={880} width={640} height={340} rx={18} fill="#f4f1ea" stroke="#0b1a33" strokeWidth={8} />
        <Txt x={540} y={960} s={48} c="#16325c">LOAN: 5 YEARS</Txt>
        <Txt x={540} y={1050} s={44} c="#16325c">REPAY: 5.6 YEARS</Txt>
        <Txt x={540} y={1160} s={54} c={RED} a={rate}>12% INTEREST</Txt>
      </g>
    </Frame>
  );
};

/** a year at 20 vs at 80, then the discount curve and the credit card */
const Discount: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 57.0, two = at(t, W("year", a0) - 0.2, 0.5), meh = at(t, W("worthless", a0) - 0.2, 0.6), curve = at(t, W("discount", a0) - 0.3, 1.2);
  const card = at(t, W("credit", a0) - 0.3, 0.6), phase2 = at(t, W("Brains", a0) - 0.4, 0.5);
  const pts = Array.from({ length: 41 }, (_, i) => { const yrs = i * 1.5, v = 1 / (1 + 0.35 * yrs); return `${160 + i * 19 * curve},${1050 - 600 * v}`; }).join(" ");
  return (
    <Frame t={t - a0} title="WHY TODAY ALWAYS WINS">
      <g opacity={1 - phase2}>
        <g opacity={two}><circle cx={300} cy={620} r={190} fill={Y} stroke="#0b1a33" strokeWidth={8} /><Txt x={300} y={640} s={56} c="#16325c">AGE 20</Txt><Txt x={300} y={880} s={50}>A YEAR NOW</Txt></g>
        <g opacity={two}><circle cx={800} cy={620} r={190 - 120 * meh} fill={Y} opacity={1 - 0.6 * meh} stroke="#0b1a33" strokeWidth={8} /><Txt x={800} y={640} s={44} c="#16325c">AGE 80</Txt><Txt x={800} y={880} s={50}>A YEAR LATER</Txt></g>
        <Txt x={800} y={980} s={46} c={RED} a={meh}>"WORTHLESS"</Txt>
      </g>
      <g opacity={phase2}>
        <line x1={160} y1={1050} x2={960} y2={1050} stroke={LINE} strokeWidth={6} /><line x1={160} y1={1050} x2={160} y2={380} stroke={LINE} strokeWidth={6} />
        <polyline points={pts} fill="none" stroke={CYAN} strokeWidth={12} />
        <Txt x={180} y={340} s={44} anchor="start">HOW MUCH IT FEELS WORTH</Txt>
        <Txt x={960} y={1120} s={44} anchor="end">YEARS AWAY →</Txt>
        <Txt x={240} y={430} s={48} c={Y}>TODAY</Txt>
        <g opacity={card} transform={`translate(${300 * (1 - card)} 0) rotate(-8 760 760)`}>
          <rect x={580} y={640} width={380} height={240} rx={26} fill="#c63939" stroke="#0b1a33" strokeWidth={8} />
          <rect x={620} y={700} width={70} height={50} rx={8} fill={Y} stroke="#0b1a33" strokeWidth={4} />
          <Txt x={770} y={810} s={34}>BUY NOW</Txt><Txt x={770} y={855} s={30}>PAY LATER</Txt>
        </g>
      </g>
    </Frame>
  );
};

const Dog: React.FC<{ x: number; y: number; s: number; col: string; floppy?: boolean }> = ({ x, y, s, col, floppy }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-70, -40, 40, 70].map((lx) => <rect key={lx} x={lx - 9} y={20} width={18} height={90} rx={8} fill={col} stroke="#0b1a33" strokeWidth={5} />)}
    <ellipse cx={0} cy={0} rx={110} ry={50} fill={col} stroke="#0b1a33" strokeWidth={6} />
    <rect x={60} y={-80} width={40} height={60} fill={col} stroke="#0b1a33" strokeWidth={5} />
    <ellipse cx={115} cy={-75} rx={42} ry={34} fill={col} stroke="#0b1a33" strokeWidth={6} />
    <rect x={130} y={-82} width={50} height={30} rx={12} fill={col} stroke="#0b1a33" strokeWidth={5} />
    {floppy ? <ellipse cx={98} cy={-62} rx={14} ry={30} fill="#7a4a2a" stroke="#0b1a33" strokeWidth={5} />
      : <path d="M95 -100 L80 -150 L118 -108 Z" fill={col} stroke="#0b1a33" strokeWidth={5} />}
    <rect x={60} y={-40} width={44} height={12} rx={5} fill="#c63939" stroke="#0b1a33" strokeWidth={3} />
    <circle cx={126} cy={-86} r={7} fill="#0b1a33" /><ellipse cx={178} cy={-72} rx={9} ry={7} fill="#0b1a33" />
    <path d="M-110 -10 Q-150 -40 -140 -70" fill="none" stroke={col} strokeWidth={16} strokeLinecap="round" />
  </g>
);
/** Great Dane vs Chihuahua: weight, typical lifespan, then +2 kg = -1 month (Kraus, Pavard & Promislow 2013) */
const Dogs: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 75.4, dane = at(t, W("Dane", a0) - 0.3, 0.6), daneY = at(t, W("eight", a0) - 0.3, 0.6), chi = at(t, W("Chihuahua", a0) - 0.3, 0.6),
    chiY = at(t, W("fifteen", a0) - 0.3, 0.6), study = at(t, W("study", a0) - 0.3, 0.6), sizeUp = at(t, a0 + 0.3, 1.2);
  return (
    <Frame t={t - a0} title="NATURE ALREADY PLAYS THIS GAME">
      <g opacity={1 - 0.75 * study}>
        <g opacity={Math.max(dane, 1 - chi) > 0 ? 1 : 0}><Dog x={330} y={700} s={0.6 + 1.2 * Math.max(sizeUp * (1 - dane) * 0.5, dane)} col="#a8703f" floppy /></g>
        <Txt x={330} y={330} s={52} a={dane}>GREAT DANE</Txt><Txt x={330} y={400} s={46} c={Y} a={dane}>70 KG</Txt>
        <g opacity={chi}><Dog x={820} y={790} s={0.45} col="#e3b77a" /></g>
        <Txt x={820} y={330} s={52} a={chi}>CHIHUAHUA</Txt><Txt x={820} y={400} s={46} c={Y} a={chi}>2 KG</Txt>
        <rect x={150} y={1000} width={360 * (8 / 15) * daneY} height={70} rx={12} fill={RED} /><Txt x={330} y={1140} s={50} a={daneY}>~8 YEARS</Txt>
        <rect x={640} y={1000} width={360 * chiY} height={70} rx={12} fill={GRN} /><Txt x={820} y={1140} s={50} a={chiY}>~15 YEARS</Txt>
      </g>
      <g opacity={study}>
        <rect x={140} y={560} width={800} height={320} rx={30} fill="rgba(11,26,51,.92)" stroke={Y} strokeWidth={8} />
        <Txt x={540} y={680} s={80} c={Y}>+2 KG</Txt><Txt x={540} y={790} s={64}>≈ −1 MONTH</Txt><Txt x={540} y={850} s={40} c={DIM}>OF LIFE</Txt>
        <Txt x={540} y={960} s={32} c={DIM}>KRAUS, PAVARD &amp; PROMISLOW 2013</Txt>
      </g>
    </Frame>
  );
};

const MAP: Record<string, React.FC<{ t: number }>> = { deal: Deal, math: MathCard, bank: Bank, discount: Discount, dogs: Dogs };

export const Insert: React.FC<{ id: number }> = ({ id }) => {
  const t = useCurrentFrame() / FPS, C = MAP[SHOTS[id - 1].insert!];
  if (!C) throw new Error(`unknown insert ${SHOTS[id - 1].insert}`);
  return <C t={t} />;
};
