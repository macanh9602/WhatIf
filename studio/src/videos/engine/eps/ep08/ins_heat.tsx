// What If ep08 heat inserts: gills are a radiator (shot 9) and water pulls heat 25x faster, past your warmest blood
// (shot 10). t = seconds since the start of the video. Content stays in y 150-1190 (Frame creep, caption band below).
import React from "react";
import { at, c01, W, Frame, Txt, CYAN, LINE, NAVY, RED, Y } from "./kit";

const BLUE = "#3f9be0", HEAT = "#ff8a3d", PAPER = "#f4f1ea";
const land = (t: number, word: number) => at(t, word - 0.2, 0.12);
/** a wavy heat arrow from (x, y) to the right, length l */
const HeatArrow: React.FC<{ x: number; y: number; l: number; a?: number; t: number }> = ({ x, y, l, a = 1, t }) => {
  let d = `M${x} ${y}`; for (let k = 1; k <= 8; k++) d += ` L${x + (l - 30) * k / 8} ${y + 12 * Math.sin(k * 1.6 + t * 9)}`;
  return <g opacity={a}><path d={d} fill="none" stroke={HEAT} strokeWidth={12} strokeLinecap="round" /><path d={`M${x + l - 40} ${y - 22} L${x + l} ${y} L${x + l - 40} ${y + 22} Z`} fill={HEAT} stroke={NAVY} strokeWidth={5} /></g>;
};

/** a head with gills, the zoomed cross-section: blood beside water through a thin wall; O2 in, heat out; = a radiator */
export const Radiator: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 34.0, gills = W("gills", a0), rad = W("radiator", a0), thin = W("thin", a0), oxy = W("oxygen", a0), heat = W("heat", a0);
  const head = at(t, a0 + 0.1, 0.3), zoom = at(t, gills - 0.2, 0.4), radK = land(t, rad), thinK = land(t, thin), o2 = c01((t - oxy + 0.1) / 1.0), heatK = at(t, heat - 0.2, 0.25);
  return (
    <Frame t={t - a0} title="GILLS ARE A RADIATOR">
      <g opacity={head}>
        <ellipse cx={230} cy={330} rx={120} ry={128} fill={PAPER} stroke={NAVY} strokeWidth={8} />
        <circle cx={195} cy={310} r={11} fill={NAVY} /><circle cx={265} cy={310} r={11} fill={NAVY} />
        {[0, 1, 2].map((k) => <path key={k} d={`M${312 - k * 3} ${360 + k * 20} q16 ${8 + 6 * Math.sin(t * 8)} 30 -4`} fill="none" stroke="#a3263f" strokeWidth={8} strokeLinecap="round" />)}
        <circle cx={330} cy={385} r={58} fill="none" stroke={Y} strokeWidth={7} opacity={zoom} />
        <path d="M370 430 L470 560" stroke={Y} strokeWidth={7} strokeDasharray="18 12" opacity={zoom} />
      </g>
      <Txt x={530} y={340} s={110} c={Y} a={radK}>=</Txt>
      <g opacity={radK} transform={`translate(800 330) scale(${radK * (1 + 0.25 * (1 - radK))})`}>
        {[-100, -50, 0, 50, 100].map((x) => <rect key={x} x={x - 20} y={-110} width={40} height={210} rx={14} fill={heatK > 0 ? "#ffb08a" : LINE} stroke={NAVY} strokeWidth={7} />)}
        <rect x={-140} y={70} width={280} height={26} rx={8} fill={LINE} stroke={NAVY} strokeWidth={7} />
        {heatK > 0 && [-60, 0, 60].map((x, i) => <path key={x} d={`M${x} -130 q-16 -20 0 -40 q16 -20 0 -40`} fill="none" stroke={HEAT} strokeWidth={8} opacity={0.5 + 0.5 * Math.sin(t * 6 + i)} />)}
        <Txt x={0} y={150} s={44}>RADIATOR</Txt>
      </g>
      <g opacity={zoom} transform={`translate(540 880) scale(${0.6 + 0.4 * zoom}) translate(-540 -880)`}>
        <rect x={110} y={580} width={420} height={600} rx={24} fill="rgba(255,90,79,.35)" stroke={RED} strokeWidth={8} />
        <rect x={550} y={580} width={420} height={600} rx={24} fill="rgba(63,155,224,.4)" stroke={BLUE} strokeWidth={8} />
        {Array.from({ length: 9 }, (_, i) => { const y = 1150 - ((t * 160 + i * 66) % 560); return <ellipse key={i} cx={220 + (i % 3) * 100} cy={y} rx={30} ry={20} fill={RED} stroke={NAVY} strokeWidth={4} />; })}
        {Array.from({ length: 6 }, (_, i) => { const y = 610 + ((t * 150 + i * 95) % 540); return <path key={i} d={`M600 ${y} q45 -16 90 0 t90 0 t90 0 t90 0`} fill="none" stroke={CYAN} strokeWidth={6} />; })}
        <rect x={528} y={580} width={24} height={600} fill={PAPER} stroke={NAVY} strokeWidth={5} />
        <Txt x={320} y={640} s={50}>BLOOD</Txt>
        <Txt x={760} y={640} s={50} c={CYAN}>WATER</Txt>
        <g opacity={thinK}><rect x={370} y={700} width={340} height={70} rx={16} fill={Y} stroke={NAVY} strokeWidth={6} />
          <text x={540} y={750} fontSize={44} textAnchor="middle" fill={NAVY} fontFamily='"Arial Black", Arial, sans-serif' fontWeight={900}>THIN SKIN</text></g>
        {[0, 1, 2, 3].map((i) => { const k = o2 > 0 ? ((t - oxy) * 0.7 + i / 4 + 1) % 1 : -1; return k > 0 && k < 1 ? <g key={i} opacity={o2}>
          <circle cx={820 - 520 * k} cy={850 + i * 60} r={20} fill={Y} stroke={NAVY} strokeWidth={4} />
          <text x={820 - 520 * k} y={858 + i * 60} fontSize={20} textAnchor="middle" fill={NAVY} fontWeight={900} fontFamily="Arial">O₂</text></g> : null; })}
        <Txt x={760} y={1130} s={44} c={Y} a={land(t, oxy)}>O₂ IN →</Txt>
        {[0, 1, 2].map((i) => <HeatArrow key={i} x={230} y={900 + i * 90} l={520 * heatK} a={heatK} t={t + i} />)}
        <Txt x={320} y={1130} s={44} c={HEAT} a={heatK}>HEAT OUT →</Txt>
      </g>
    </Frame>
  );
};

/** heat pull bars: AIR 1x, WATER 25x; then the gill: your warmest blood in a pipe with cold water flowing past */
export const Faster: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 40.85, pulls = W("pulls", a0), tw = W("twentyfive", a0), air = W("air", a0), flows = W("flows", a0), warm = W("warmest", a0);
  const bars = at(t, a0 + 0.1, 0.3), grow = at(t, tw - 0.3, 0.45), x25 = land(t, tw), airK = land(t, air), gill = at(t, flows - 0.3, 0.35), warmK = land(t, warm);
  const H = 420 * grow, base = 690;
  return (
    <Frame t={t - a0} title="WATER STEALS YOUR HEAT">
      <Txt x={540} y={420} s={54} c={Y} a={bars * (1 - at(t, tw - 0.4, 0.2))}>HEAT PULLED FROM SKIN</Txt>
      <g opacity={bars * (1 - gill)}>
        <rect x={110} y={800} width={860} height={210} fill="rgba(63,155,224,.4)" stroke={BLUE} strokeWidth={8} />
        <Txt x={190} y={855} s={40} c={CYAN} anchor="start">WATER</Txt>
        <rect x={110} y={1010} width={860} height={130} rx={18} fill={PAPER} stroke={NAVY} strokeWidth={8} />
        <rect x={110} y={1100} width={860} height={40} rx={18} fill="#ff9fb0" stroke={NAVY} strokeWidth={6} />
        <text x={540} y={1078} fontSize={56} textAnchor="middle" fill={NAVY} fontFamily='"Arial Black", Arial, sans-serif' fontWeight={900}>SKIN</text>
        {[250, 400, 550, 700, 850].map((x, i) => { const k = (t * 0.9 + i * 0.37) % 1, y = 1000 - 130 * k;
          return <g key={x} opacity={at(t, pulls - 0.3, 0.3) * (1 - k * k)}>
            <path d={`M${x} ${y + 60} q-14 -15 0 -30 q14 -15 0 -30`} fill="none" stroke={HEAT} strokeWidth={10} strokeLinecap="round" />
            <path d={`M${x - 20} ${y} L${x} ${y - 30} L${x + 20} ${y} Z`} fill={HEAT} stroke={NAVY} strokeWidth={4} />
          </g>; })}
      </g>
      <g opacity={bars}>
        <path d={`M120 ${base} H960`} stroke={LINE} strokeWidth={6} />
        <rect x={190} y={base - 17} width={220} height={17} fill={HEAT} stroke={NAVY} strokeWidth={6} opacity={0.4 + 0.6 * Math.max(airK, 1 - grow)} />
        <Txt x={300} y={base + 70} s={52}>AIR</Txt>
        <Txt x={300} y={base - 50} s={56} a={airK}>1×</Txt>
        <rect x={640} y={base - 17 - H} width={220} height={17 + H} fill={HEAT} stroke={NAVY} strokeWidth={6} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${690 + i * 60} ${base - 40 - H} q-16 -22 0 -44 q16 -22 0 -44`} fill="none" stroke={HEAT} strokeWidth={9} opacity={at(t, pulls - 0.2, 0.3) * (0.5 + 0.5 * Math.sin(t * 7 + i))} />)}
        <Txt x={750} y={base + 70} s={52} c={CYAN}>WATER</Txt>
      </g>
      <g transform={`translate(390 ${base - 300}) rotate(-6) scale(${x25 * (1 + 0.3 * (1 - x25))})`} opacity={x25 > 0 ? 1 : 0}><Txt x={0} y={0} s={160} c={Y}>×25</Txt></g>
      <Txt x={390} y={base - 210} s={44} a={land(t, W("faster", a0))}>FASTER</Txt>
      <g opacity={gill} transform={`translate(0 ${60 * (1 - gill)})`}>
        <rect x={110} y={800} width={860} height={330} rx={24} fill="rgba(63,155,224,.4)" stroke={BLUE} strokeWidth={8} />
        {Array.from({ length: 5 }, (_, i) => { const x = 1000 - ((t * 260 + i * 200) % 960); return <path key={i} d={`M${x} ${840 + (i % 2) * 230} q-40 -14 -80 0 t-80 0`} fill="none" stroke={CYAN} strokeWidth={6} />; })}
        <rect x={150} y={925} width={780} height={90} rx={45} fill={warmK > 0 ? "#ff3b4a" : RED} stroke={NAVY} strokeWidth={8} />
        {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={180 + ((t * 180 + i * 130) % 720)} cy={970} rx={26} ry={18} fill="#ffb0b0" stroke={NAVY} strokeWidth={4} />)}
        {[250, 450, 650, 850].map((x, i) => <path key={x} d={`M${x} 915 q-14 -18 0 -36 q14 -18 0 -36`} fill="none" stroke={HEAT} strokeWidth={9} opacity={0.5 + 0.5 * Math.sin(t * 6 + i)} />)}
        <Txt x={540} y={1100} s={44} c={warmK > 0 ? Y : LINE}>{warmK > 0 ? "YOUR WARMEST BLOOD" : "BLOOD"}</Txt>
        <Txt x={720} y={870} s={36} c={CYAN}>← COLD WATER</Txt>
      </g>
    </Frame>
  );
};
