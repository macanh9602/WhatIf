// What If ep02 explanation inserts: full-screen animated blueprint cards (same style as ep01), 1080x1920;
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

/** 27.6-32.9: a 10 m/s wind pushes on a 4 kg you as hard as gravity pulls */
const Wind: React.FC<{ t: number }> = ({ t }) => {
  const w = at(t, W("windy", 27.6) - 0.2, 0.6), g = at(t, W("gravity", 27.6) - 0.3, 0.5), sway = 10 * Math.sin(t * 6) * w;
  return (
    <Frame t={t - 27.6} title="WIND VS GRAVITY">
      <Txt x={540} y={260} s={80} c={Y} a={at(t, 27.8)}>YOU = 4 KG</Txt>
      <g transform={`rotate(${sway} 540 760)`}><Person x={540} y={640} /></g>
      {[0, 1, 2].map((k) => <Arrow key={k} x1={60 + 30 * Math.sin(t * 3 + k)} y1={520 + k * 110} x2={60 + 330 * w} y2={520 + k * 110} c={BLUE} w={18} a={w} />)}
      <Txt x={200} y={470} s={46} c={BLUE} a={w}>WIND 36 KM/H</Txt>
      <Arrow x1={540} y1={830} x2={540} y2={830 + 300 * g} c={RED} a={g} />
      <Txt x={800} y={1080} s={46} c={RED} a={g}>GRAVITY</Txt>
      <Txt x={540} y={1240} s={64} a={g}>SAME PUSH ≈ 48 N</Txt>
    </Frame>
  );
};

/** 37.0-44.4: below 80 g you are lighter than the air your body pushes aside, so you rise */
const Float: React.FC<{ t: number }> = ({ t }) => {
  const deck = at(t, W("deck", 37) - 0.2, 0.5), air = at(t, W("air", 37) - 0.3, 0.6), rise = at(t, W("rise", 37) - 0.2, 0.8);
  return (
    <Frame t={t - 37} title="LIGHTER THAN THE AIR">
      <Txt x={540} y={250} s={80} c={Y} a={at(t, 37.3)}>80 GRAMS</Txt>
      <g opacity={deck} transform="translate(820 420) rotate(-8)">
        <rect x={-80} y={-110} width={160} height={220} rx={16} fill="#f4f1ea" stroke={LINE} strokeWidth={8} />
        <Txt x={0} y={30} s={110} c="#c63939">♥</Txt>
      </g>
      <Txt x={820} y={600} s={40} a={deck}>A DECK OF CARDS</Txt>
      <g transform={`translate(0 ${-260 * rise})`}>
        <ellipse cx={400} cy={760} rx={210} ry={270} fill="rgba(126,200,255,.18)" stroke={BLUE} strokeWidth={6} strokeDasharray="22 16" opacity={air} />
        <Person x={400} y={720} />
      </g>
      <Txt x={400} y={1120} s={44} c={BLUE} a={air}>AIR YOUR BODY PUSHES ASIDE ≈ 80 G</Txt>
      <Arrow x1={400} y1={1060} x2={400} y2={880} c={BLUE} a={air * (1 - rise)} />
      <Txt x={760} y={900} s={90} c={Y} a={rise}>UP!</Txt>
    </Frame>
  );
};

/** 56.8-59.1: the elevator refuses to move */
const Elevator: React.FC<{ t: number }> = ({ t }) => {
  const blink = Math.floor(t * 4) % 2 === 0, k = at(t, 56.9, 0.3);
  return (
    <Frame t={t - 56.8} title="MAX LOAD 630 KG">
      <rect x={240} y={260} width={600} height={900} rx={20} fill="#2a3346" stroke={LINE} strokeWidth={10} />
      <line x1={540} y1={260} x2={540} y2={1160} stroke={LINE} strokeWidth={6} />
      <rect x={330} y={360} width={420} height={150} rx={14} fill={blink ? "#ff3b30" : "#5a1d1d"} stroke={LINE} strokeWidth={8} opacity={k} />
      <Txt x={540} y={462} s={80} c="#ffffff" a={k}>OVERLOAD</Txt>
      <Person x={540} y={820} s={1.4} />
      <Txt x={540} y={1240} s={60} c={Y} a={k}>YOU: 700 KG</Txt>
    </Frame>
  );
};

/** 59.1-68.6: weight is how hard Earth pulls on you; the dial turns that pull */
const Pull: React.FC<{ t: number }> = ({ t }) => {
  const e = at(t, W("Earth", 59.1) - 0.3, 0.6), d = at(t, W("dial", 63) - 0.3, 0.6), knob = (t - 59) * 0.8;
  return (
    <Frame t={t - 59.1} title="WEIGHT = EARTH'S PULL">
      <Txt x={540} y={250} s={60} a={at(t, 59.3)}>NOT YOURS…</Txt>
      <Person x={540} y={470} s={0.9} />
      <Arrow x1={540} y1={640} x2={540} y2={640 + 260 * e} c={RED} w={26} a={e} />
      <Txt x={760} y={800} s={50} c={RED} a={e}>THE PULL</Txt>
      <clipPath id="earthc"><rect x={0} y={960} width={1080} height={400} /></clipPath>
      <circle cx={540} cy={1700} r={760} fill="#2f6fd0" stroke={LINE} strokeWidth={10} clipPath="url(#earthc)" opacity={e} />
      <Txt x={540} y={1150} s={70} a={e}>EARTH</Txt>
      <g opacity={d} transform="translate(860 470)">
        <circle r={110} fill="#f4f1ea" stroke={LINE} strokeWidth={8} />
        <line x1={0} y1={0} x2={80 * Math.cos(knob)} y2={80 * Math.sin(knob)} stroke="#c63939" strokeWidth={14} strokeLinecap="round" />
      </g>
      <Txt x={860} y={650} s={42} a={d}>TURNS THE PULL</Txt>
    </Frame>
  );
};

/** 73.0-82.0: spin + a farther centre = about 0.5 % less weight at the equator than at the North Pole */
const Equator: React.FC<{ t: number }> = ({ t }) => {
  const spin = at(t, W("spin", 73) - 0.2, 0.6), far = at(t, W("farther", 73) - 0.2, 0.6), num = at(t, W("half", 78) - 0.3, 0.5), rot = (t - 73) * 40;
  return (
    <Frame t={t - 73} title="THE PLANET'S OWN DIAL">
      <g transform="translate(540 720)">
        <ellipse rx={330} ry={315} fill="#2f6fd0" stroke={LINE} strokeWidth={10} />
        <g clipPath="url(#globe2)"><clipPath id="globe2"><ellipse rx={330} ry={315} /></clipPath>
          {[0, 1, 2].map((k) => <ellipse key={k} cx={((rot + k * 220) % 660) - 330} cy={-40 + k * 70} rx={90} ry={60} fill="#5aa86a" stroke="#0b1a33" strokeWidth={6} />)}
        </g>
        <line x1={-350} y1={0} x2={350} y2={0} stroke={Y} strokeWidth={6} strokeDasharray="20 14" />
        <path d="M-200 -330 A 220 60 0 0 0 200 -330" fill="none" stroke={LINE} strokeWidth={10} opacity={spin} />
        <Arrow x1={170} y1={-338} x2={210} y2={-322} c={LINE} w={10} a={spin} />
        <Person x={0} y={-520} s={0.55} c="#c63939" />
        <Person x={430} y={-60} s={0.55} c="#c63939" />
        <Arrow x1={350} y1={-20} x2={350 + 160 * spin} y2={-20} c={BLUE} w={16} a={spin} />
        <line x1={0} y1={0} x2={330 + 22 * far} y2={0} stroke={LINE} strokeWidth={4} opacity={far} />
      </g>
      <Txt x={540} y={210} s={50} a={at(t, 81.0)}>NORTH POLE: 100%</Txt>
      <Txt x={860} y={590} s={52} c={BLUE} a={spin}>FLUNG OUT</Txt>
      <Txt x={540} y={1180} s={80} c={Y} a={num}>EQUATOR: −0.5%</Txt>
    </Frame>
  );
};

const MAP: Record<string, React.FC<{ t: number }>> = { wind: Wind, float: Float, elevator: Elevator, pull: Pull, equator: Equator };

export const Insert: React.FC<{ id: number }> = ({ id }) => {
  const t = useCurrentFrame() / FPS, C = MAP[SHOTS[id - 1].insert!];
  if (!C) throw new Error(`unknown insert ${SHOTS[id - 1].insert}`);
  return <C t={t} />;
};
