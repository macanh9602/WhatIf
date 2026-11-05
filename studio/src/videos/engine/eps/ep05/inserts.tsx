// What If ep05 explanation inserts: full-screen animated blueprint cards (same style as ep01-03). 1080x1920; content stays in
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

/** a head in profile: sound reaches the ear through the bone (bright, fast) and through the air (dim) */
const Skull: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 14.8, bone = at(t, W("skull", a0) - 0.2, 0.5), go = c01((t - W("carries", a0)) / 1.6), air = at(t, W("sound", a0) - 0.2, 0.5);
  const ph = (t * 3) % 1;
  return (
    <Frame t={t - a0} title="YOUR SKULL CARRIES THE SOUND">
      <path d="M380 260 C620 200 820 330 820 560 C820 700 760 760 720 800 L720 980 L520 980 L500 900 L380 900 C330 900 320 860 330 820 L300 760 L330 720 L290 660 C300 560 280 420 380 260 Z"
        fill="#f4f1ea" stroke="#0b1a33" strokeWidth={10} />
      <path d="M560 560 C600 520 660 540 660 600 C660 650 610 660 590 640" fill="none" stroke="#0b1a33" strokeWidth={10} />
      <rect x={320} y={790} width={150} height={34} rx={8} fill="#ffffff" stroke="#0b1a33" strokeWidth={6} />
      <rect x={330} y={826} width={140} height={30} rx={8} fill="#ffffff" stroke="#0b1a33" strokeWidth={6} />
      <g opacity={bone}>
        <path d="M420 810 C470 700 540 660 590 600" fill="none" stroke={CYAN} strokeWidth={18} strokeDasharray="40 22" strokeDashoffset={-120 * ph} />
        <circle cx={420 + 170 * go} cy={810 - 210 * go} r={22} fill={Y} stroke="#0b1a33" strokeWidth={5} opacity={go < 1 ? 1 : 0} />
        <Txt x={760} y={420} s={50} c={CYAN} anchor="start">BONE</Txt>
      </g>
      <g opacity={air}>
        {[0, 1, 2].map((i) => <path key={i} d={`M${200 - i * 50} ${760 - i * 40} q-40 60 0 120`} fill="none" stroke={DIM} strokeWidth={10} />)}
        <Txt x={130} y={1080} s={46} c={DIM} anchor="start">AIR: QUIET</Txt>
        <Txt x={950} y={1080} s={46} c={Y} anchor="end">BONE: LOUD</Txt>
      </g>
      <Txt x={540} y={210} s={60}>GRAVEL IN A BLENDER</Txt>
    </Frame>
  );
};

/** you in the middle; rings fade with distance; walls block; 8 billion squeaks are not a roar */
const Fade: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 21.8, many = at(t, W("billion", a0) - 0.3, 0.6), roar = at(t, W("roar", a0) - 0.2, 0.4), fade = at(t, W("fades", a0) - 0.3, 0.8), walls = at(t, W("walls", a0) - 0.2, 0.5);
  const dots = Array.from({ length: 70 }, (_, i) => { const a = i * 2.399, r = 120 + 34 * Math.sqrt(i) * 6.2; return [540 + Math.cos(a) * r * 0.95, 700 + Math.sin(a) * r * 0.95]; });
  return (
    <Frame t={t - a0} title="SOUND FADES FAST">
      {[0, 1, 2, 3].map((i) => { const r = 90 + ((t * 120 + i * 110) % 440); return <circle key={i} cx={540} cy={700} r={r} fill="none" stroke={CYAN} strokeWidth={8} opacity={(1 - r / 530) * (0.3 + 0.7 * fade)} />; })}
      {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={13} fill={Y} opacity={many * Math.max(0.12, 1 - fade * (Math.hypot(x - 540, y - 700) / 380))} />)}
      <circle cx={540} cy={700} r={44} fill={RED} stroke="#0b1a33" strokeWidth={6} /><Txt x={540} y={716} s={36}>YOU</Txt>
      <g opacity={walls}>
        <rect x={360} y={520} width={360} height={360} fill="none" stroke={LINE} strokeWidth={22} />
        <Txt x={540} y={1000} s={48} c={LINE}>WALLS BLOCK THE REST</Txt>
      </g>
      <Txt x={540} y={260} s={64} c={Y} a={many}>8,000,000,000 SQUEAKS</Txt>
      <Txt x={540} y={1160} s={80} c={RED} a={roar * (1 - walls)}>≠ A ROAR</Txt>
      <Txt x={540} y={1160} s={50} c={CYAN} a={walls}>YOU HEAR: FAMILY + NEIGHBORS</Txt>
    </Frame>
  );
};

/** 8 billion x 70 kg = 100 Great Pyramids (a 10 x 10 grid pops in) */
const Pyramids: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 33.3, sum = at(t, W("billion", a0) - 0.3, 0.5), grid = c01((t - W("hundred", a0) + 0.6) / 1.4), named = at(t, W("Pyramids", a0) - 0.2, 0.4);
  return (
    <Frame t={t - a0} title="ABOUT 570 MILLION TONNES">
      <Txt x={540} y={260} s={66} a={sum}>8 BILLION × 70 KG</Txt>
      {Array.from({ length: 100 }, (_, i) => { const r = Math.floor(i / 10), c = i % 10, k = c01(grid * 100 - i), x = 135 + c * 90, y = 450 + r * 72;
        return <polygon key={i} points={`${x - 38},${y + 30} ${x + 38},${y + 30} ${x},${y + 30 - 60 * k}`} fill={Y} stroke="#0b1a33" strokeWidth={4} opacity={k > 0 ? 1 : 0} />; })}
      <Txt x={540} y={1240} s={72} c={Y} a={named}>= 100 GREAT PYRAMIDS</Txt>
    </Frame>
  );
};

/** a tooth: the enamel shell, harder than bone, wears down, no living cells, never grows back */
const Enamel: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 44.3, shell = at(t, W("Enamel", a0) - 0.2, 0.5), hard = at(t, W("hardest", a0) - 0.2, 0.5), bone = at(t, W("body", a0) - 0.2, 0.5),
    wear = at(t, W("wears", a0) - 0.2, 1.4), cells = at(t, W("living", a0) - 0.2, 0.5), never = at(t, W("never", a0) - 0.2, 0.4);
  const top = 420 + 70 * wear; // the biting surface sanded down
  return (
    <Frame t={t - a0} title="ENAMEL NEVER GROWS BACK">
      <g transform="translate(-170 0)">
        <path d={`M380 ${top} C380 ${top - 40} 700 ${top - 40} 700 ${top} L700 760 C700 860 650 1150 600 1150 C560 1150 560 900 540 900 C520 900 520 1150 480 1150 C430 1150 380 860 380 760 Z`}
          fill="#f6e7c8" stroke="#0b1a33" strokeWidth={10} />
        <path d={`M380 ${top} C380 ${top - 40} 700 ${top - 40} 700 ${top} L700 760 L640 760 L640 ${top + 40} C640 ${top + 10} 440 ${top + 10} 440 ${top + 40} L440 760 L380 760 Z`}
          fill="#ffffff" stroke="#0b1a33" strokeWidth={8} opacity={shell} />
        <g opacity={wear * (1 - cells)}>{[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={430 + i * 55 + 20 * Math.sin(t * 6 + i)} cy={top - 50 - 40 * ((t * 1.5 + i * 0.2) % 1)} r={8} fill={DIM} />)}</g>
        <Txt x={540} y={340} s={48} c={CYAN} a={shell}>ENAMEL</Txt>
      </g>
      <g opacity={hard}>
        <Txt x={690} y={500} s={42} anchor="start">HARDNESS</Txt>
        <rect x={690} y={540} width={120 * bone} height={60} rx={10} fill={DIM} /><Txt x={690} y={650} s={36} anchor="start" a={bone}>BONE</Txt>
        <rect x={690} y={690} width={220} height={60} rx={10} fill={CYAN} /><Txt x={690} y={800} s={36} anchor="start">ENAMEL</Txt>
      </g>
      <g opacity={cells}>
        <Txt x={800} y={950} s={46} c={RED}>NO LIVING</Txt><Txt x={800} y={1010} s={46} c={RED}>CELLS</Txt>
      </g>
      <Txt x={540} y={1240} s={64} c={Y} a={never}>CAN'T GROW BACK</Txt>
      <Txt x={540} y={220} s={56} a={1 - shell}>THE REAL DAMAGE</Txt>
    </Frame>
  );
};

/** 1 in 8 adults, every night: hundreds of millions sanding away their enamel */
const Count: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 66.2, ppl = at(t, a0 + 0.1, 0.5), big = at(t, W("hundreds", a0) - 0.2, 0.5), sand = at(t, W("sanding", a0) - 0.2, 0.5), rep = at(t, W("repair", a0) - 0.3, 0.4);
  return (
    <Frame t={t - a0} title="1 IN 8 ADULTS · EVERY NIGHT">
      {Array.from({ length: 8 }, (_, i) => { const x = 150 + (i % 4) * 260, y = 380 + Math.floor(i / 4) * 300, hit = i === 5;
        return <g key={i} opacity={ppl}><circle cx={x} cy={y} r={46} fill={hit ? RED : DIM} stroke="#0b1a33" strokeWidth={5} />
          <rect x={x - 65} y={y + 58} width={130} height={150} rx={36} fill={hit ? RED : DIM} stroke="#0b1a33" strokeWidth={5} />
          {hit && <Txt x={x} y={y - 90} s={40} c={Y}>KRRK</Txt>}</g>; })}
      <Txt x={540} y={1010} s={66} c={Y} a={big}>≈ 740,000,000 PEOPLE</Txt>
      <g opacity={sand} transform={`translate(${30 * Math.sin(t * 9)} 0)`}>
        <rect x={380} y={1060} width={320} height={70} rx={10} fill="#c98a50" stroke="#0b1a33" strokeWidth={6} />
        <Txt x={540} y={1112} s={36} c="#0b1a33">SANDPAPER</Txt>
      </g>
      <Txt x={540} y={1230} s={48} c={RED} a={rep}>NO REPAIRS</Txt>
    </Frame>
  );
};

const MAP: Record<string, React.FC<{ t: number }>> = { skull: Skull, fade: Fade, pyramids: Pyramids, enamel: Enamel, count: Count };

export const Insert: React.FC<{ id: number }> = ({ id }) => {
  const t = useCurrentFrame() / FPS, C = MAP[SHOTS[id - 1].insert!];
  if (!C) throw new Error(`unknown insert ${SHOTS[id - 1].insert}`);
  return <C t={t} />;
};
