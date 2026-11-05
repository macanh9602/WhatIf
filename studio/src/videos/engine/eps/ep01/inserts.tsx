// What If ep01 explanation inserts: full-screen animated blueprint cards (the hypothetical format's "how it really
// works" beat, our own design). 1080x1920; content stays in y 120-1250, the caption band is y 1290-1590.
// Inserts are DOM, so the no-green post effect does not touch them: the diagrams may show green on purpose.
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
const SPEC = ["#7b3fe0", "#2f5fff", "#00b7ff", "#2ee86a", "#c8f03a", "#ffd23f", "#ff8a1f", "#ff3b30"]; // 400 -> 700 nm
const GREEN = "#2ee86a", PINK = "#ff5fc8";

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
const Prism: React.FC<{ t: number }> = ({ t }) => {
  const drop = at(t, W("without", 11.6) - 0.1, 0.8), mixK = at(t, W("pink", 11.6) - 0.4, 0.6), fan = at(t, 12.6, 1.0);
  const rays = SPEC.map((c, i) => { const isG = i === 3 || i === 4, dy = isG ? 260 * drop : 0, o = isG ? 1 - drop : 1;
    return <line key={i} x1={600} y1={640} x2={1020} y2={430 + i * 50 + dy} stroke={c} strokeWidth={26} opacity={o * fan * (1 - 0.7 * mixK)} />; });
  return (
    <Frame t={t - 11.6} title="WHITE LIGHT = EVERY COLOUR">
      <line x1={40} y1={680} x2={480 * at(t, 11.7, 0.6) + 40} y2={640} stroke="#ffffff" strokeWidth={30} />
      <polygon points="470,800 610,500 750,800" fill="rgba(223,233,247,.15)" stroke={LINE} strokeWidth={8} />
      {rays}
      <rect x={790} y={560 + 300 * drop} width={250} height={90} rx={10} fill="none" stroke={GREEN} strokeWidth={6} opacity={drop} />
      <Txt x={915} y={625 + 300 * drop} s={42} c={GREEN} a={drop}>GREEN</Txt>
      <Txt x={540} y={330} s={70} a={fan}>SUNLIGHT</Txt>
      <circle cx={860} cy={1120} r={110 * mixK} fill={PINK} stroke={LINE} strokeWidth={8} />
      <Txt x={420} y={1100} s={60} c="#ff6b6b" a={mixK}>RED</Txt><Txt x={420} y={1170} s={60} c="#5a8cff" a={mixK}>+ BLUE</Txt>
      <Txt x={650} y={1140} s={70} a={mixK}>=</Txt>
    </Frame>
  );
};

const Phone: React.FC<{ t: number }> = ({ t }) => {
  const zoom = at(t, W("pixel", 23.2) - 0.6, 0.6), cross = at(t, W("green", 23.2) - 0.2, 0.4); // "secretly part green"
  return (
    <Frame t={t - 23.2} title="EVERY PIXEL = RED + GREEN + BLUE">
      <rect x={250} y={230} width={420} height={820} rx={60} fill="#1d232b" stroke={LINE} strokeWidth={8} />
      <rect x={280} y={300} width={360} height={680} rx={20} fill="#ff4fd8" />
      <Txt x={460} y={520} s={56} c="#ffffff">NEWS</Txt>
      <rect x={320} y={570} width={280} height={24} fill="#ffffff" opacity={0.85} /><rect x={320} y={620} width={220} height={24} fill="#ffffff" opacity={0.85} />
      <g opacity={zoom} transform={`translate(780 700) scale(${0.6 + 0.4 * zoom})`}>
        <line x1={-330} y1={-140} x2={-160} y2={-60} stroke={LINE} strokeWidth={6} />
        <circle r={230} fill="#0b1a33" stroke={LINE} strokeWidth={10} />
        {[["#ff3b30", -110], [GREEN, 0], ["#2f5fff", 110]].map(([c, x], i) => (
          <rect key={i} x={(x as number) - 40} y={-140} width={80} height={280} rx={14} fill={i === 1 ? (cross > 0.5 ? "#1d232b" : GREEN) : (c as string)} stroke={LINE} strokeWidth={4} />))}
        <g opacity={cross} stroke="#ffffff" strokeWidth={16}><line x1={-50} y1={-60} x2={50} y2={60} /><line x1={50} y1={-60} x2={-50} y2={60} /></g>
      </g>
      <Txt x={540} y={1160} s={60} a={cross}>GREEN DOT = DEAD</Txt>
    </Frame>
  );
};

/** spectrum bar + "how bright it looks to you" hill (CIE photopic, peak 555 nm) */
const Eye: React.FC<{ t: number }> = ({ t }) => {
  const bar = at(t, 37.4, 0.6), slice = at(t, W("quarter", 37.2) - 0.2, 0.5), hill = at(t, W("eyes", 37.2) - 0.3, 0.9), gone = at(t, W("best", 37.2) - 0.5, 0.8), shades = at(t, 999, 0.4);
  const x0 = 120, x1 = 960, nm = (l: number) => x0 + ((l - 400) / 300) * (x1 - x0);
  const V = (l: number) => Math.exp(-0.5 * ((l - 555) / 45) ** 2);
  const pts = Array.from({ length: 61 }, (_, i) => 400 + i * 5).map((l) => `${nm(l)},${980 - 520 * V(l) * hill}`).join(" ");
  const gPts = Array.from({ length: 16 }, (_, i) => 495 + i * 5).map((l) => `${nm(l)},${980 - 520 * V(l) * hill}`).join(" ");
  return (
    <Frame t={t - 37.2} title="YOUR EYES ARE BUILT FOR GREEN">
      <defs><linearGradient id="spec" x1="0" x2="1">{SPEC.map((c, i) => <stop key={i} offset={i / 7} stopColor={c} />)}</linearGradient></defs>
      <rect x={x0} y={1000} width={(x1 - x0) * bar} height={70} fill="url(#spec)" />
      <rect x={nm(495)} y={990 + 200 * gone} width={nm(570) - nm(495)} height={90} fill="none" stroke="#ffffff" strokeWidth={8} opacity={slice} />
      <Txt x={(nm(495) + nm(570)) / 2} y={1150 + 200 * gone} s={46} a={slice * (1 - gone)}>1/4 OF SUNLIGHT</Txt>
      <polyline points={pts} fill="none" stroke={Y} strokeWidth={10} opacity={hill} />
      <polygon points={`${nm(495)},980 ${gPts} ${nm(570)},980`} fill={GREEN} opacity={0.55 * hill * (1 - gone)} />
      <Txt x={540} y={330} s={58} a={hill}>HOW BRIGHT IT</Txt><Txt x={540} y={400} s={58} a={hill}>LOOKS TO YOU</Txt>
      <Txt x={540} y={700} s={80} c={Y} a={gone}>THE COLOUR YOU</Txt><Txt x={540} y={790} s={80} c={Y} a={gone}>SEE BEST — GONE</Txt>
      <g opacity={shades} transform="translate(540 560)"><rect x={-260} y={-60} width={220} height={120} rx={30} fill="#14141a" stroke={LINE} strokeWidth={6} />
        <rect x={40} y={-60} width={220} height={120} rx={30} fill="#14141a" stroke={LINE} strokeWidth={6} /><line x1={-40} y1={-20} x2={40} y2={-20} stroke={LINE} strokeWidth={10} /></g>
    </Frame>
  );
};

const SunPie: React.FC<{ t: number }> = ({ t }) => {
  const lift = at(t, W("tenth", 54) - 0.3, 0.8), a = (0.11 * Math.PI * 2) / 2;
  const arc = (r: number, a0: number, a1: number) => `M0 0 L${r * Math.cos(a0)} ${r * Math.sin(a0)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)} Z`;
  return (
    <Frame t={t - 54} title="SUNLIGHT IS ENERGY">
      <g transform="translate(540 720)">
        {Array.from({ length: 16 }, (_, k) => { const g = (k / 16) * Math.PI * 2; return <line key={k} x1={330 * Math.cos(g)} y1={330 * Math.sin(g)} x2={400 * Math.cos(g)} y2={400 * Math.sin(g)} stroke={Y} strokeWidth={20} strokeLinecap="round" />; })}
        <path d={arc(300, -Math.PI / 2 + a, Math.PI * 1.5 - a)} fill={Y} stroke="#0b1a33" strokeWidth={8} />
        <g transform={`translate(${300 * lift} ${-360 * lift})`}><path d={arc(300, -Math.PI / 2 - a, -Math.PI / 2 + a)} fill={GREEN} stroke="#0b1a33" strokeWidth={8} /></g>
      </g>
      <Txt x={760} y={300} s={60} c={GREEN} a={lift}>GREEN ≈ 1/10</Txt>
      <Txt x={540} y={1200} s={58} a={at(t, 54.6)}>ALL THE SUN SENDS US</Txt>
    </Frame>
  );
};

const Globe: React.FC<{ ice: number; snow?: number }> = ({ ice, snow = 0 }) => (
  <g>
    <circle r={300} fill="#2f6fd0" stroke={LINE} strokeWidth={8} />
    <path d="M-170 -210 C-80 -260 40 -230 60 -150 C90 -60 10 -20 -20 60 C-50 140 -140 120 -170 40 C-230 -40 -250 -150 -170 -210 Z" fill={snow > 0.5 ? "#f4f7fb" : "#5aa86a"} stroke="#0b1a33" strokeWidth={6} />
    <path d="M60 40 C140 20 230 60 220 150 C210 230 120 250 80 190 C40 130 20 70 60 40 Z" fill={snow > 0.5 ? "#f4f7fb" : "#c9a45e"} stroke="#0b1a33" strokeWidth={6} />
    <clipPath id="gc"><circle r={300} /></clipPath>
    <g clipPath="url(#gc)">
      <rect x={-320} y={-320} width={640} height={300 * ice} fill="#f4f7fb" opacity={0.95} />
      <rect x={-320} y={320 - 160 * ice} width={640} height={200} fill="#f4f7fb" opacity={0.95} />
      <circle r={300} fill="#f4f7fb" opacity={snow} />
    </g>
  </g>
);

const Thermo: React.FC<{ t: number }> = ({ t }) => {
  const k = at(t, W("cools", 58.2) - 0.3, 2.6), temp = 15 - 8 * k;
  return (
    <Frame t={t - 58.2} title="LESS SUN, COLDER EARTH">
      <g transform="translate(400 700)"><Globe ice={0.25 * k} /></g>
      <g transform="translate(880 700)">
        <rect x={-45} y={-380} width={90} height={640} rx={45} fill="#f4f7fb" stroke={LINE} strokeWidth={8} />
        <rect x={-25} y={-330 + 18 * (15 - temp) * 2} width={50} height={560 - 36 * (15 - temp)} fill="#ff3b30" />
        <circle cy={300} r={80} fill="#ff3b30" stroke={LINE} strokeWidth={8} />
      </g>
      <Txt x={880} y={1130} s={70}>{`${Math.round(temp)}°C`}</Txt>
      <Txt x={400} y={1240} s={44} a={k}>COLDER THAN THE ICE AGE</Txt>
      <Txt x={400} y={1150} s={90} c="#7ec8ff" a={k}>−8°C</Txt>
      <Txt x={540} y={260} s={50} a={at(t, 58.6)}>WHOLE-PLANET AVERAGE</Txt>
    </Frame>
  );
};

const IceSheet: React.FC<{ t: number }> = ({ t }) => {
  const k = at(t, W("ice", 98.2) - 0.4, 3.0), cmp = at(t, W("colder", 98.2) - 0.2, 0.5);
  return (
    <Frame t={t - 98.2} title="COLDER THAN THE LAST ICE AGE">
      <g transform="translate(540 720)">
        <path d="M-380 -330 L-60 -380 L240 -330 L360 -220 L300 -60 L200 40 L120 160 L40 300 L-20 380 L-60 300 L-160 220 L-260 120 L-330 -40 L-400 -200 Z" fill="#5aa86a" stroke="#0b1a33" strokeWidth={8} />
        <clipPath id="na"><path d="M-380 -330 L-60 -380 L240 -330 L360 -220 L300 -60 L200 40 L120 160 L40 300 L-20 380 L-60 300 L-160 220 L-260 120 L-330 -40 L-400 -200 Z" /></clipPath>
        <rect clipPath="url(#na)" x={-420} y={-400} width={840} height={420 * k} fill="#f4f7fb" />
        <line x1={-420} y1={-30} x2={420} y2={-30} stroke={DIM} strokeWidth={4} strokeDasharray="20 16" />
        <Txt x={0} y={-120} s={56} c="#16325c" a={k}>CANADA</Txt>
      </g>
      <Txt x={300} y={240} s={46} a={cmp}>ICE AGE −6°C</Txt><Txt x={780} y={240} s={46} c={Y} a={cmp}>NO GREEN −8°C</Txt>
      <Txt x={540} y={1210} s={52} a={k}>ICE A MILE THICK</Txt>
    </Frame>
  );
};

const Reflect: React.FC<{ t: number }> = ({ t }) => {
  const s = at(t, W("snow", 104.9) - 0.3, 0.6), b = at(t, W("reflects", 104.9) - 0.3, 1.2);
  return (
    <Frame t={t - 104.9} title="WHITE BOUNCES SUNLIGHT AWAY">
      <circle cx={180} cy={260} r={110} fill={Y} />
      <rect x={0} y={1000} width={1080} height={260} fill="#5aa86a" />
      <rect x={0} y={1000} width={1080 * s} height={260} fill="#f4f7fb" />
      {[0, 1, 2, 3].map((k) => { const x = 360 + k * 160; return (<g key={k}>
        <line x1={x - 220} y1={330} x2={x} y2={1000} stroke={Y} strokeWidth={18} />
        <line x1={x} y1={1000} x2={x + 360 * b} y2={1000 - 680 * b} stroke={Y} strokeWidth={18} opacity={b} /></g>); })}
      <Txt x={760} y={380} s={58} a={b}>BACK TO SPACE</Txt>
      <Txt x={540} y={1150} s={56} c="#16325c" a={s}>SNOW</Txt>
    </Frame>
  );
};

const Loop: React.FC<{ t: number }> = ({ t }) => {
  const u = t - 64, spin = u * (0.8 + 0.25 * u), white = at(t, W("freezes", 64) - 1.0, 2.2);
  const lab = ["MORE SNOW", "MORE SUN BOUNCED", "MORE COLD"];
  return (
    <Frame t={u} title="A LOOP THAT FEEDS ITSELF">
      <g transform="translate(540 720)">
        <g transform="scale(0.6)"><Globe ice={0.4 + 0.6 * white} snow={white} /></g>
        <g transform={`rotate(${(spin * 180) / Math.PI})`}>
          {[0, 1, 2].map((k) => { const a0 = (k * 2 * Math.PI) / 3, a1 = a0 + 1.6; return (
            <path key={k} d={`M${330 * Math.cos(a0)} ${330 * Math.sin(a0)} A330 330 0 0 1 ${330 * Math.cos(a1)} ${330 * Math.sin(a1)}`} fill="none" stroke={LINE} strokeWidth={22} markerEnd="url(#ah)" />); })}
        </g>
        <defs><marker id="ah" markerWidth={4} markerHeight={4} refX={2} refY={2} orient="auto"><path d="M0 0 L4 2 L0 4 Z" fill={LINE} /></marker></defs>
      </g>
      <Txt x={540} y={240} s={58} a={at(t, W("snow", 64) - 0.2)}>{lab[0]}</Txt>
      <Txt x={540} y={1180} s={58} a={at(t, W("reflects", 64) - 0.2)}>{lab[2]}</Txt>
      <Txt x={540} y={1260} s={46} c={Y} a={white}>…UNTIL EVERYTHING FREEZES</Txt>
    </Frame>
  );
};

const Snowball: React.FC<{ t: number }> = ({ t }) => {
  const k = at(t, W("Snowball", 120) - 0.3, 0.4);
  return (
    <AbsoluteFill style={{ background: "#05070f" }}>
      <svg width={1080} height={1920}>
        {Array.from({ length: 90 }, (_, i) => <circle key={i} cx={(i * 397) % 1080} cy={(i * 761) % 1300} r={(i % 3) + 1.5} fill="#ffffff" opacity={0.7} />)}
        <g transform={`translate(540 700) scale(${1 + 0.02 * (t - 120)})`}><Globe ice={1} snow={1} /><circle r={300} fill="none" stroke="#ffb3e6" strokeWidth={14} opacity={0.6} /></g>
        <Txt x={540} y={1190} s={96} a={k}>SNOWBALL</Txt><Txt x={540} y={1290} s={96} a={k}>EARTH</Txt>
      </svg>
    </AbsoluteFill>
  );
};

/** the leaf: red + blue light eaten, green bounced to your eye; then green removed, leaf black, still eating */
const Leaf: React.FC<{ t: number }> = ({ t }) => {
  const show = at(t, 76.1, 0.6), eat = at(t, W("feeds", 75.9) - 0.3, 0.8), bounce = at(t, W("throws", 75.9) - 0.3, 0.8);
  const away = at(t, W("Take", 75.9) - 0.2, 0.6), black = at(t, W("black", 86) - 0.5, 0.8), still = at(t, W("eating", 86) - 0.3, 0.5);
  const leafCol = `rgb(${Math.round(63 - 40 * black)},${Math.round(160 - 140 * black)},${Math.round(70 - 50 * black)})`;
  const chomp = 1 + 0.06 * Math.sin(t * 14) * eat;
  const ray = (c: string, x: number, o: number) => <line x1={x - 260} y1={160} x2={x} y2={720} stroke={c} strokeWidth={24} opacity={o} />;
  return (
    <Frame t={t - 75.9} title="WHY LEAVES ARE GREEN">
      <circle cx={120} cy={150} r={90} fill={Y} opacity={show} />
      <g transform={`translate(540 860) rotate(-20) scale(${chomp})`} opacity={show}>
        <path d="M-330 0 C-200 -230 200 -230 330 0 C200 230 -200 230 -330 0 Z" fill={leafCol} stroke="#0b1a33" strokeWidth={10} />
        <line x1={-330} y1={0} x2={330} y2={0} stroke="rgba(11,26,51,.6)" strokeWidth={8} />
        {[-180, -60, 60, 180].map((x) => <g key={x}><line x1={x} y1={0} x2={x + 70} y2={-110} stroke="rgba(11,26,51,.5)" strokeWidth={6} /><line x1={x} y1={0} x2={x + 70} y2={110} stroke="rgba(11,26,51,.5)" strokeWidth={6} /></g>)}
      </g>
      {ray("#ff3b30", 420, show)}{ray("#2f5fff", 640, show)}{ray(GREEN, 530, show * (1 - away))}
      <line x1={530} y1={720} x2={530 + 330 * bounce} y2={720 - 360 * bounce} stroke={GREEN} strokeWidth={24} opacity={bounce * (1 - away)} />
      <g transform="translate(900 330)" opacity={bounce * (1 - away)}><ellipse rx={110} ry={62} fill="#ffffff" stroke={LINE} strokeWidth={6} /><circle r={40} fill="#2b2b2b" /></g>
      <Txt x={300} y={1220} s={52} c="#ff6b6b" a={eat}>EATEN</Txt><Txt x={760} y={1220} s={52} c="#7ea0ff" a={eat}>EATEN</Txt>
      <Txt x={760} y={180} s={50} c={GREEN} a={bounce * (1 - away)}>THROWN BACK</Txt>
      <Txt x={540} y={430} s={64} a={still}>STILL EATING</Txt>
      <g opacity={away * (1 - black * 0.5)} stroke="#ffffff" strokeWidth={18}><line x1={420} y1={380} x2={540} y2={500} /><line x1={540} y1={380} x2={420} y2={500} /></g>
    </Frame>
  );
};

const MAP: Record<string, React.FC<{ t: number }>> = { prism: Prism, phone: Phone, eye: Eye, sunpie: SunPie, thermo: Thermo, icesheet: IceSheet, reflect: Reflect, loop: Loop, snowball: Snowball, leaf: Leaf };

export const Insert: React.FC<{ id: number }> = ({ id }) => {
  const t = useCurrentFrame() / FPS, C = MAP[SHOTS[id - 1].insert!];
  if (!C) throw new Error(`unknown insert ${SHOTS[id - 1].insert}`);
  return <C t={t} />;
};
