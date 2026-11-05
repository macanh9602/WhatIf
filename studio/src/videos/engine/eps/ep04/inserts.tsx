// What If ep04 explanation inserts: full-screen animated blueprint cards (same style as ep01-03), 1080x1920;
// content stays in y 120-1250, the caption band is y 1290-1590.
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
/** 0..1 ramp starting at time a, lasting d seconds */
const at = (t: number, a: number, d = 0.5) => ease((t - a) / d);

const BG = "#16325c", LINE = "#dfe9f7", DIM = "rgba(223,233,247,.35)", Y = "#ffd23f";

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

// ---------------- the inserts (t = seconds since the voice start) ----------------
const RED = "#ff6b6b", BLUE = "#7ec8ff";
/** a stick person in the card style: head circle, bean body, stick legs */
const Person: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = "#c63939" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <line x1={-18} y1={60} x2={-24} y2={170} stroke={LINE} strokeWidth={10} strokeLinecap="round" /><line x1={18} y1={60} x2={24} y2={170} stroke={LINE} strokeWidth={10} strokeLinecap="round" />
    <ellipse cx={0} cy={20} rx={46} ry={62} fill={c} stroke={LINE} strokeWidth={8} />
    <circle cx={0} cy={-80} r={56} fill="#fbf8f4" stroke={LINE} strokeWidth={8} />
  </g>
);
/** arrow from (x1,y1) to (x2,y2) with a head */
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c: string; w?: number; a?: number }> = ({ x1, y1, x2, y2, c, w = 22, a = 1 }) => {
  const an = Math.atan2(y2 - y1, x2 - x1), h = w * 2.2;
  const p = (d: number, s: number) => `${x2 - Math.cos(an) * d + Math.cos(an + Math.PI / 2) * s},${y2 - Math.sin(an) * d + Math.sin(an + Math.PI / 2) * s}`;
  return <g opacity={a}><line x1={x1} y1={y1} x2={x2 - Math.cos(an) * h * 0.8} y2={y2 - Math.sin(an) * h * 0.8} stroke={c} strokeWidth={w} strokeLinecap="round" />
    <polygon points={`${x2},${y2} ${p(h, h * 0.7)} ${p(h, -h * 0.7)}`} fill={c} /></g>;
};


const SKIN = "#fbf8f4", JACKET = "#c63939", INK2 = "#0b1a33";
/** wedge from the centre, angles in degrees (0 = screen right, 90 = down), span may exceed 180 */
const wedge = (r: number, a0: number, a1: number) => {
  const rad = (d: number) => (d * Math.PI) / 180, large = a1 - a0 > 180 ? 1 : 0;
  return `M0 0 L${r * Math.cos(rad(a0))} ${r * Math.sin(rad(a0))} A${r} ${r} 0 ${large} 1 ${r * Math.cos(rad(a1))} ${r * Math.sin(rad(a1))} Z`;
};
/** a head seen from above, facing up: a nose at the front, plus one at the back when `two` */
const TopHead: React.FC<{ two?: boolean; s?: number }> = ({ two = false, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <ellipse rx={150} ry={70} fill={JACKET} stroke={LINE} strokeWidth={8} />
    <circle r={95} fill={SKIN} stroke={LINE} strokeWidth={8} />
    <path d="M-18 -92 L0 -126 L18 -92 Z" fill={SKIN} stroke={LINE} strokeWidth={7} strokeLinejoin="round" />
    {two && <path d="M-18 92 L0 126 L18 92 Z" fill={SKIN} stroke={LINE} strokeWidth={7} strokeLinejoin="round" />}
    <path d="M-6 -30 q 20 -24 6 -48" fill="none" stroke={INK2} strokeWidth={6} strokeLinecap="round" />
  </g>
);

/** 5.65-16.0: eyes cover ~200 degrees, a 160-degree blind spot behind; a second face closes the gap */
const Vision: React.FC<{ t: number }> = ({ t }) => {
  const front = at(t, W("two", 5.6) - 0.3, 0.9), blind = at(t, W("blind", 5.6) - 0.2, 0.4), back = at(t, W("second", 10) - 0.1, 1.2), full = at(t, W("circle", 13) - 0.2, 0.4);
  const span = 200 * front, bspan = 200 * back;
  return (
    <Frame t={t - 5.65} title="YOUR VIEW: 200° → 360°">
      <Txt x={540} y={250} s={84} c={Y} a={front * (1 - full)}>200°</Txt>
      <Txt x={540} y={250} s={96} c={Y} a={full}>360°</Txt>
      <g transform="translate(540 760)">
        {span > 1 && <path d={wedge(430, -90 - span / 2, -90 + span / 2)} fill="rgba(255,210,63,.28)" stroke={Y} strokeWidth={5} />}
        <path d={wedge(430, 10, 170)} fill="rgba(11,26,51,.55)" stroke={DIM} strokeWidth={5} strokeDasharray="18 12" opacity={blind * (1 - back)} />
        {bspan > 1 && <path d={wedge(430, 90 - bspan / 2, 90 + bspan / 2)} fill="rgba(126,200,255,.28)" stroke={BLUE} strokeWidth={5} />}
        <TopHead two={back > 0} s={1.5} />
      </g>
      <Txt x={540} y={1270} s={64} c={DIM} a={blind * (1 - back)}>BLIND SPOT</Txt>
      <Txt x={540} y={1270} s={64} c={BLUE} a={back * (1 - full)}>+ A SECOND PAIR</Txt>
      <Txt x={540} y={1270} s={64} c={Y} a={full}>THE WHOLE CIRCLE</Txt>
    </Frame>
  );
};

/** a head in profile with a face on each side (front = left); `squash` flattens the side that is down */
const SideHead: React.FC<{ squash?: number; zz?: number; t: number }> = ({ squash = 0, zz = 0, t }) => (
  <g>
    <ellipse rx={120} ry={120 * (1 - 0.18 * squash)} cy={22 * squash} fill={SKIN} stroke={LINE} strokeWidth={8} />
    {[-1, 1].map((s) => (
      <g key={s} transform={`scale(${s} 1)`}>
        <path d="M-118 -10 L-146 14 L-116 26" fill={SKIN} stroke={LINE} strokeWidth={7} strokeLinejoin="round" />
        <circle cx={-78} cy={-26} r={9} fill={INK2} />
        <path d="M-108 54 q 16 8 30 0" fill="none" stroke={INK2} strokeWidth={6} strokeLinecap="round" />
      </g>
    ))}
    {zz > 0 && [-1, 1].map((s) => <Txt key={s} x={s * (150 + 12 * Math.sin(t * 2 + s)) + 40} y={-90 - 30 * ((t * 0.6) % 1)} s={54} c={BLUE} a={zz}>Z</Txt>)}
  </g>
);
/** 21.93-32.69: on your back you squash one face, on your front the other, so everyone sleeps on their side */
const Sleep: React.FC<{ t: number }> = ({ t }) => {
  const p1 = at(t, W("back", 24) - 0.3, 0.4), p2 = at(t, W("front", 27) - 0.3, 0.4), p3 = at(t, W("side", 30) - 0.3, 0.4);
  const rot = p3 > 0 ? 0 : p2 > 0 ? -90 * p2 + 90 * (1 - p2) : 90 * p1;
  const sq = p3 > 0 ? 0 : p2 > 0 ? p2 : p1, label = p3 > 0 ? "SIDE: BOTH FACES FREE" : p2 > 0 ? "FRONT: SQUASH" : p1 > 0 ? "BACK: SQUASH" : "BEDTIME";
  return (
    <Frame t={t - 21.93} title="EVERYONE SLEEPS ON THEIR SIDE">
      <rect x={80} y={980} width={920} height={150} rx={36} fill="#7ec8ff" stroke={LINE} strokeWidth={8} />
      <rect x={120} y={850} width={480} height={140} rx={60} fill="#f4f1ea" stroke={LINE} strokeWidth={8} />
      <g transform={`translate(360 ${660 + 40 * sq}) scale(1.6 ${1.6 * (1 - 0.2 * sq)}) rotate(${rot})`}><SideHead zz={p3} t={t} /></g>
      <Txt x={540} y={300} s={70} c={p3 > 0 ? Y : RED}>{label}</Txt>
      <Txt x={800} y={620} s={64} c={RED} a={p3 > 0 ? 0 : sq}>MMPH!</Txt>
    </Frame>
  );
};

/** 42.5-51.89: a rabbit's eyes sit on the sides of its head and see almost all the way around: prey */
const Rabbit: React.FC<{ t: number }> = ({ t }) => {
  const cones = at(t, W("sides", 42) - 0.2, 0.9), prey = at(t, W("hunted", 48) - 0.2, 0.4);
  const span = 190 * cones;
  return (
    <Frame t={t - 42.5} title="RABBITS SEE ALMOST ALL AROUND">
      <Txt x={540} y={250} s={80} c={Y} a={at(t, W("around", 45) - 0.2)}>≈ 360°</Txt>
      <g transform="translate(540 780)">
        {span > 1 && <path d={wedge(420, 180 - span / 2, 180 + span / 2)} fill="rgba(255,210,63,.25)" stroke={Y} strokeWidth={5} />}
        {span > 1 && <path d={wedge(420, -span / 2, span / 2)} fill="rgba(255,210,63,.25)" stroke={Y} strokeWidth={5} />}
        <ellipse cx={-40} cy={150} rx={34} ry={120} fill="#e8dccb" stroke={LINE} strokeWidth={8} transform="rotate(-8 -40 150)" />
        <ellipse cx={40} cy={150} rx={34} ry={120} fill="#e8dccb" stroke={LINE} strokeWidth={8} transform="rotate(8 40 150)" />
        <ellipse rx={90} ry={120} fill="#e8dccb" stroke={LINE} strokeWidth={8} />
        <circle cx={-86} cy={-20} r={16} fill={INK2} /><circle cx={86} cy={-20} r={16} fill={INK2} />
        <circle cx={0} cy={-112} r={14} fill="#ff9fb2" stroke={LINE} strokeWidth={5} />
      </g>
      <Txt x={540} y={1270} s={72} c={RED} a={prey}>PREY: WATCH EVERYTHING</Txt>
    </Frame>
  );
};

/** 51.89-65.14: hunters (cats, owls, humans) have both eyes in front; the overlap gives depth to judge the distance */
const Hunter: React.FC<{ t: number }> = ({ t }) => {
  const who = at(t, W("cats", 53) - 0.2, 0.4), cones = at(t, W("front", 56) - 0.3, 0.8), ov = at(t, W("overlap", 59) - 0.2, 0.5), tgt = at(t, W("target", 63) - 0.3, 0.4);
  const half = 60 * cones;
  return (
    <Frame t={t - 51.89} title="HUNTERS: EYES IN FRONT">
      <Txt x={540} y={230} s={58} a={who}>CATS · OWLS · HUMANS</Txt>
      <g transform="translate(540 1000)">
        {half > 1 && <g transform="translate(-34 -95)"><path d={wedge(700, -90 - half - 10, -90 + half - 10)} fill="rgba(126,200,255,.22)" stroke={BLUE} strokeWidth={5} /></g>}
        {half > 1 && <g transform="translate(34 -95)"><path d={wedge(700, -90 - half + 10, -90 + half + 10)} fill="rgba(126,200,255,.22)" stroke={BLUE} strokeWidth={5} /></g>}
        <path d="M0 -150 L-300 -700 L300 -700 Z" fill="rgba(255,210,63,.35)" stroke={Y} strokeWidth={6} opacity={ov} />
        <TopHead s={1.0} />
        <circle cx={-34} cy={-78} r={12} fill={INK2} /><circle cx={34} cy={-78} r={12} fill={INK2} />
        <g opacity={tgt}>
          <circle cx={0} cy={-560} r={46} fill="none" stroke={RED} strokeWidth={10} /><circle cx={0} cy={-560} r={14} fill={RED} />
          <line x1={250} y1={-140} x2={250} y2={-560} stroke={LINE} strokeWidth={6} strokeDasharray="16 12" />
          <Txt x={370} y={-330} s={56}>3.2 M</Txt>
        </g>
      </g>
      <Txt x={540} y={1270} s={72} c={Y} a={ov}>OVERLAP = DEPTH</Txt>
    </Frame>
  );
};

const MAP: Record<string, React.FC<{ t: number }>> = { vision: Vision, sleep: Sleep, rabbit: Rabbit, hunter: Hunter };

export const Insert: React.FC<{ id: number }> = ({ id }) => {
  const t = useCurrentFrame() / FPS, C = MAP[SHOTS[id - 1].insert!];
  if (!C) throw new Error(`unknown insert ${SHOTS[id - 1].insert}`);
  return <C t={t} />;
};
