// What If ep11 sea slug inserts: a green sea slug eats algae and keeps its green cells, goes months without a meal, and
// still gets the GROWTH: NO stamp. Content in y 120-1250.
import React from "react";
import { at, W, Frame, Txt, CYAN, GRN, LINE, NAVY, RED, Y } from "./kit";

const grow = (k: number) => k * (1 + 0.3 * (1 - k));
const BODY = "#62c24e", DARK = "#3f8f3a";

/** a green sea slug in profile, facing right: a ruffled leaf-like back, a head with two horn tentacles, a face;
 *  spots = the green cells it stole 0..1, chew 0..1 */
const SlugArt: React.FC<{ x: number; y: number; s: number; spots?: number; chew?: number; t?: number }> = ({ x, y, s, spots = 0, chew = 0, t = 0 }) => {
  const w = 8 * Math.sin(t * 2);
  return <g transform={`translate(${x} ${y}) scale(${s})`} stroke={NAVY} strokeLinejoin="round" strokeLinecap="round">
    <path d="M-300 92 C-200 60 100 50 230 60 C270 64 280 96 240 100 L-260 104 Z" fill={DARK} strokeWidth={8} />
    <path d={`M-290 90 C-270 ${30 + w} -240 ${-50 - w} -190 -40 C-170 ${-110 + w} -110 -110 -80 -70 C-60 ${-140 - w} 10 -140 30 -80 C60 ${-130 + w} 120 -110 130 -50 C170 -70 190 -20 200 60 Z`} fill={BODY} strokeWidth={9} />
    {["M-230 40 C-170 -10 -120 0 -70 10", "M-120 -60 C-110 -20 -90 0 -70 10 C-20 20 40 10 110 40", "M0 -100 C0 -50 10 -20 30 15", "M-200 -20 C-170 10 -130 10 -110 5"].map((d) => <path key={d} d={d} fill="none" stroke={DARK} strokeWidth={6} />)}
    {[[-210, 30], [-150, -40], [-90, 50], [-40, -70], [-20, 30], [50, -50], [70, 40], [130, 0], [-130, 30], [0, -10]].map(([cx, cy], i) => spots * 10 > i ? <circle key={i} cx={cx} cy={cy} r={15} fill="#b6ff5c" strokeWidth={3} /> : null)}
    <path d="M160 -10 C210 -50 290 -40 310 20 C320 60 290 90 250 90 L170 80 Z" fill={BODY} strokeWidth={9} />
    {[`M235 -32 C225 -80 200 -110 ${190 + w} -130`, `M272 -28 C285 -75 310 -100 ${325 + w} -120`].map((d) => <g key={d} fill="none"><path d={d} stroke={NAVY} strokeWidth={26} /><path d={d} stroke={BODY} strokeWidth={13} /></g>)}
    <circle cx={240} cy={8} r={13} fill="#ffffff" strokeWidth={4} /><circle cx={245} cy={8} r={6} fill={NAVY} stroke="none" />
    <circle cx={282} cy={8} r={13} fill="#ffffff" strokeWidth={4} /><circle cx={287} cy={8} r={6} fill={NAVY} stroke="none" />
    <path d={`M250 ${48 - 4 * chew} Q275 ${58 + 14 * chew} 300 ${44 - 4 * chew}`} fill={chew > 0.3 ? "#2c6b2a" : "none"} strokeWidth={7} />
  </g>;
};
/** a tuft of green algae strands rising from the sand */
const Algae: React.FC<{ x: number; y: number; h: number; t: number }> = ({ x, y, h, t }) => <g transform={`translate(${x} ${y})`} fill="none" strokeLinecap="round">
  {[-70, -35, 0, 35, 70].map((dx, i) => { const s = 22 * Math.sin(t * 1.6 + i), hh = h * (0.75 + 0.125 * ((i * 7) % 3)), d = `M${dx} 0 C${dx + s} ${-hh * 0.35} ${dx - s} ${-hh * 0.65} ${dx + s} ${-hh}`;
    return <g key={i}><path d={d} stroke={NAVY} strokeWidth={30} /><path d={d} stroke="#2fae6a" strokeWidth={18} /></g>; })}
</g>;
const Sand: React.FC = () => <path d="M0 1010 C200 985 400 1020 620 1000 C800 985 950 1010 1080 995 V1190 H0 Z" fill="#e6c98a" stroke={NAVY} strokeWidth={8} />;

export const Slug: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 44.3, slug = at(t, W("slug", 46.5) - 0.5, 0.3), steals = W("steals", a0), chewOn = t > steals - 0.1 ? Math.abs(Math.sin(t * 8)) : 0, cells = at(t, W("solar", 47.9) - 0.1, 1.2), eats = at(t, W("eats", 49) - 0.1, 0.2);
  const slide = 1 - at(t, a0 + 0.2, 2.8);
  return (
    <Frame t={t - a0} title="NATURE TRIED IT: A SEA SLUG">
      {[[160, 200], [300, 300], [840, 240]].map(([x, y], i) => <circle key={i} cx={x} cy={y - ((t * 40 + i * 90) % 120)} r={16} fill="none" stroke={CYAN} strokeWidth={5} opacity={0.6} />)}
      <Sand />
      <Algae x={880} y={1030} h={520} t={t} />
      <SlugArt x={480 - 500 * slide} y={920} s={1.05} spots={cells} chew={chewOn} t={t} />
      {cells > 0 && cells < 1 && Array.from({ length: 6 }, (_, i) => { const k = (t * 1.2 + i / 6) % 1; return <circle key={i} cx={840 - 500 * k} cy={760 + 110 * Math.sin(k * 3 + i)} r={15} fill="#b6ff5c" stroke={NAVY} strokeWidth={4} />; })}
      <g opacity={slug}><Txt x={430} y={640} s={60} c={GRN}>GREEN SEA SLUG</Txt></g>
      <g opacity={cells} transform={`translate(540 240) scale(${grow(cells)})`}><Txt x={0} y={0} s={70} c={Y}>STEALS SOLAR CELLS</Txt></g>
      <Txt x={880} y={440} s={60} c={LINE} a={at(t, W("algae", 48.9) - 0.8, 0.3)}>ALGAE</Txt>
      <g opacity={eats}><Txt x={540} y={350} s={56} c={LINE}>FROM WHAT IT EATS</Txt></g>
    </Frame>
  );
};

export const Growth: React.FC<{ t: number }> = ({ t }) => {
  const a0 = 50.15, months = W("months", a0), meal = at(t, W("meal", a0) - 0.15, 0.2), but = W("but", a0), stamp = at(t, W("can't", 53) - 0.05, 0.1), page = Math.min(5, Math.max(0, Math.floor((t - months) * 3.6)));
  const sun = at(t, W("light", 54) - 0.25, 0.3), dim = at(t, but - 0.1, 0.3);
  return (
    <Frame t={t - a0} title="MONTHS ON LIGHT, NO GROWING">
      <Sand />
      <SlugArt x={400} y={920} s={1.05} spots={1} t={t} />
      <g transform="translate(250 260)" opacity={1 - 0.5 * dim}>
        <rect x={-130} y={-120} width={260} height={270} rx={18} fill="#f4f1ea" stroke={NAVY} strokeWidth={8} />
        <rect x={-130} y={-120} width={260} height={70} fill={RED} stroke={NAVY} strokeWidth={8} />
        <Txt x={0} y={-65} s={44} c="#ffffff">{["JAN", "FEB", "MAR", "APR", "MAY", "JUN"][page]}</Txt>
        <Txt x={0} y={70} s={96} c={NAVY}>{page + 1}</Txt>
      </g>
      <Txt x={250} y={490} s={50} c={Y} a={at(t, months - 0.2, 0.2) * (1 - 0.5 * dim)}>MONTHS</Txt>
      <g transform="translate(740 270)" opacity={meal * (1 - 0.5 * dim)}>
        <ellipse rx={150} ry={150} fill="#f4f1ea" stroke={NAVY} strokeWidth={8} /><ellipse rx={100} ry={100} fill="#ffffff" stroke={NAVY} strokeWidth={4} />
        <path d="M-120 -120 L120 120 M120 -120 L-120 120" stroke={RED} strokeWidth={26} strokeLinecap="round" />
      </g>
      <Txt x={740} y={490} s={50} c={Y} a={meal * (1 - 0.5 * dim)}>NO MEAL</Txt>
      <g opacity={dim}>
        <rect x={80} y={1060} width={920} height={64} fill={Y} stroke={NAVY} strokeWidth={6} />
        {Array.from({ length: 19 }, (_, i) => <path key={i} d={`M${110 + i * 48} 1060v${i % 2 ? 22 : 36}`} stroke={NAVY} strokeWidth={5} />)}
      </g>
      <g opacity={sun} transform="translate(930 860)">
        <circle r={62} fill={Y} stroke={NAVY} strokeWidth={7} />
        {Array.from({ length: 8 }, (_, i) => { const a = (i * 45) * Math.PI / 180; return <line key={i} x1={Math.cos(a) * 80} y1={Math.sin(a) * 80} x2={Math.cos(a) * 106} y2={Math.sin(a) * 106} stroke={Y} strokeWidth={12} strokeLinecap="round" />; })}
      </g>
      <g opacity={stamp} transform={`translate(540 660) rotate(-9) scale(${1 + 1.6 * (1 - stamp)})`}>
        <rect x={-430} y={-100} width={860} height={200} rx={20} fill="rgba(255,90,79,.14)" stroke={RED} strokeWidth={16} />
        <Txt x={0} y={42} s={118} c={RED}>GROWTH: NO</Txt>
      </g>
    </Frame>
  );
};
