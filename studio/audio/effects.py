"""Short, entirely procedural Foley and crowd beds."""
import numpy as np
from dsp import SR, ns, tt, rng, phase, modal, fades, bp, lp, hp, pan, place, norm_to
import instruments as I
import sfx_gen as S


def synth(kind, dur, r):
    t = tt(dur)
    n = len(t)
    noise = r.standard_normal(n)
    if kind in ('rustle', 'crinkle', 'sheet', 'tear'):
        rates = {'rustle': 22, 'crinkle': 65, 'sheet': 8, 'tear': 110}
        grains = S.stick_slip(dur, rates[kind], r, jitter=.35)
        texture = bp(noise, 800, 6500) * (.2+.8*np.sin(2*np.pi*3.5*t)**4)
        y = texture*.12 + bp(grains, 500, 6000)*2
        if kind == 'sheet':
            y *= np.sin(np.pi*t/dur)**2
        return y
    if kind == 'roll':
        y = bp(noise, 300, 2200)*.1*(.4+.6*np.sin(phase(12+20*t))**6)
        S._place_mono(y, synth('thump', .22, r)*.65, dur-.22)
        return y
    if kind == 'sip':
        return S.bubbles(dur, r, 40, 700, 1800)*.2 + bp(noise, 800, 3000)*np.sin(np.pi*t/dur)**2*.03
    if kind == 'stamp':
        return modal(dur, [(330, 1, .025), (990, .25, .018)], r) + bp(noise, 1200, 6000)*np.exp(-t/.007)*.3
    if kind == 'click':
        return modal(dur, [(1700, 1, .004), (2700, .2, .003)], r)
    if kind == 'whoosh':
        return S.whoosh(dur, r, peak=dur*.25, tail=dur*.2, f_lo=350, f_hi=2400)
    if kind == 'room':
        return np.stack([lp(r.standard_normal(n), 450)*.5 + .025*np.sin(2*np.pi*120*t) for _ in range(2)])
    if kind == 'whistle_melody':
        # Original, relaxed D-F#-A-G-E-D phrase, independent of the score motif.
        notes = [(at, length, pitch, .45) for at, length, pitch in
                 [(0, .3, 74), (.4, .32, 78), (.83, .33, 81), (1.25, .35, 79), (1.72, .27, 76), (2.1, .3, 74)]]
        start, phrase = I.whistle(notes, r, jit=.003, vib_depth=10, breath=.04)
        y = np.zeros(n)
        S._place_mono(y, phrase, start)
        return y
    if kind == 'steps':
        y = np.zeros(n)
        for start in np.arange(0, dur-.12, .19):
            step = S.stroll_step(r, scuff=.3)*.45
            step += bp(r.standard_normal(len(step)), 700, 4800)*np.exp(-tt(len(step)/SR)/.025)*.25
            S._place_mono(y, step, start)
        return y
    if kind == 'whoop':
        y = np.zeros(n)
        S._place_mono(y, S.hurrah(r, base=330, scale=1.25, kid=True), 0)
        return y
    if kind == 'flash':
        return S.whoosh(dur, r, peak=.12, tail=.18)*.25 + I.glock(I.m2f(86), .25, r, dur=dur)*.18
    if kind == 'tape':
        impulses = S.stick_slip(dur, np.linspace(150, 55, n), r, jitter=.5)
        texture = bp(noise, 950, 6800) * (.35+.65*np.sin(np.pi*t/dur)**2)
        return (texture*.18 + bp(impulses, 500, 7500)*3) * np.sin(np.pi*t/dur)**.5
    if kind in ('paper', 'wince', 'marker'):
        f = (650 if kind == 'paper' else 940)*(1 + .25*np.sin(np.pi*t/dur) - .3*t/dur)
        ph = phase(f)
        return (np.sin(ph)+.12*np.sin(2.03*ph)) * np.sin(np.pi*t/dur)**1.5
    if kind == 'bell':
        y = np.zeros(n)
        for start in (0, .12, .24, .36):
            S._place_mono(y, modal(dur-start, [(1390, 1, .12), (2150, .5, .09), (3280, .22, .07)], r), start)
        return y
    if kind in ('tink', 'magnet'):
        return S.clink(r, f0=2250 if kind == 'tink' else 1650, dur=dur, bright=.35)
    if kind == 'scribble':
        return bp(noise, 1400, 5600) * (.15+.85*np.sin(2*np.pi*5*t)**8) * (0.65+.35*np.sin(2*np.pi*.8*t))
    if kind in ('kids', 'happy'):
        y = np.zeros((2, n))
        for k in range(5 if kind == 'kids' else 4):
            x = S.babble(dur, r, base=r.uniform(260, 370), scale=1.3, rate=5.5, active=.6, fmax=2600)
            if kind == 'happy':
                h = S.hurrah(r, base=r.uniform(280, 330), scale=1.25, kid=True)
                S._place_mono(x, h*.6, r.uniform(.1, .8))
            y += pan(lp(x, 1700 if kind == 'kids' else 2500), -.7 + k*.35)
        return y
    if kind == 'beep':  # ep21: "out of credit", two short square-ish tones falling a fifth
        y = np.zeros(n)
        for st, f, d in ((0.0, 988, .11), (.14, 659, .22)):
            seg = tt(d); tone = np.tanh(2.5*np.sin(2*np.pi*f*seg)) * np.minimum(1, seg/.004) * np.minimum(1, (d-seg)/.02)
            S._place_mono(y, lp(tone, 4000), st)
        return y
    if kind == 'giggle':  # ep21 Mia: a short warm female giggle, 5 falling "hee-he" syllables (glottal source through vowel formants)
        y = np.zeros(n)
        st, f0 = .0, 430.
        for i in range(5):
            d = .085 + .01*i
            seg = tt(d); f = f0*(1 - .12*seg/d) * (1 + .01*np.sin(2*np.pi*6*seg))
            ph = phase(f); src = sum(np.sin(k*ph)/k**1.15 for k in range(1, 14))
            env = np.sin(np.pi*np.minimum(1, seg/d))**.8
            voiced = .9*bp(src, 300, 700) + .7*bp(src, 1900, 2700) + .25*bp(src, 2900, 3600)
            breath = bp(r.standard_normal(len(seg)), 1500, 5000) * np.exp(-seg/.025) * .35
            S._place_mono(y, (voiced + breath)*env*(1 - .12*i), st)
            st += d + .035 + .006*i; f0 *= .955
        return lp(y, 5200)
    if kind == 'whistle':
        return np.sin(phase(2100 + 90*np.sin(2*np.pi*25*t))) * np.sin(np.pi*t/dur)**.7
    if kind == 'boing':
        return np.sin(phase(130+280*np.exp(-t/.065)+35*np.sin(2*np.pi*13*t)*np.exp(-t/.12))) * np.exp(-t/.10)
    if kind == 'tray':
        y = modal(dur, [(420, .8, .055), (930, .65, .08), (1620, .35, .04)], r)
        for start in (0, .075, .16, .235):
            S._place_mono(y, S.clink(r, f0=r.uniform(1700, 2600), dur=.13)*.25, start)
        return y + bp(noise, 400, 3500)*np.exp(-t/.03)*.12
    if kind in ('chug', 'chugslow'): # ep13: steam engine, four exhaust beats to the turn, the fourth heaviest
        y = np.zeros(n); step = .135 if kind == 'chug' else .3; j = 0
        for start in np.arange(0, dur-.02, step):
            m = int(min(.2, dur-start)*SR); u = np.arange(m)/SR; i0 = int(start*SR)
            y[i0:i0+m] += (1 if j % 4 == 3 else .62)*(bp(r.standard_normal(m), 180, 1500)*np.exp(-u/.05) + .55*np.sin(2*np.pi*70*u)*np.exp(-u/.07)); j += 1
        return y
    if kind == 'crack': # ep13: the dry top of a blast, a transient over the thumps
        return hp(noise, 900)*np.exp(-t/.014) + bp(noise, 300, 2500)*np.exp(-t/.07)*.6
    if kind == 'riser': # ep13: rising filtered noise + a climbing tone, ends at full level on its last sample
        k = (t/dur)**2.2
        return (bp(noise, 500, 5000)*.6 + np.sin(phase(70+620*k))*.7)*k
    if kind == 'bassdrop': # ep13: sub falling from 110 to 34 Hz over a long tail
        return np.sin(phase(34+76*np.exp(-t/.28)))*np.exp(-t/(dur*.42)) + lp(noise, 300)*np.exp(-t/.06)*.5
    if kind == 'thump':
        return np.sin(phase(85+30*np.exp(-t/.018)))*np.exp(-t/.045) + lp(noise, 600)*np.exp(-t/.025)*.5
    if kind == 'lace':
        return bp(noise, 1700, 6500)*np.sin(np.pi*t/dur)**2 + .13*np.sin(phase(1500-500*t/dur))*np.sin(np.pi*t/dur)**4
    if kind in ('clock', 'fastclock'):
        y = np.zeros(n)
        for j, start in enumerate(np.arange(0, dur, .125 if kind == 'fastclock' else .5)):
            tick = modal(.05, [(1300 if j%2 else 1050, 1, .005), (3200, .25, .003)], r)
            S._place_mono(y, fades(tick, .001, .01), start)
        return y
    if kind in ('water', 'splash'):
        if kind == 'water':
            return S.water_bed(dur, r, close=.45, slosh_rate=2.5)
        return lp(S.splash_big(r)[:n], 1900)*np.exp(-t/.45)
    raise ValueError(kind)


def render(cfg, voice_lufs):
    out = np.zeros((2, ns(cfg['duration'])))
    cues = []
    for index, (start, kind, dur, naive, p, desc) in enumerate(cfg['sfx']):
        assert start >= 0 and dur > 0 and start+dur <= cfg['duration']+1e-9, desc
        x = fades(synth(kind, dur, rng(cfg['seed']+index+100)), .004, .035 if dur < 1 else .12)
        assert x.shape[-1] == ns(dur) and np.isfinite(x).all(), desc
        if x.ndim == 1:
            x = pan(x, p)
        # Beds use integrated loudness; isolated events use max 400 ms momentary.
        mode = 'integrated' if kind in ('kids', 'happy', 'water', 'clock', 'fastclock', 'room') else 'momentary'
        target = voice_lufs + naive + cfg['sfx_standard_db']
        x = norm_to(x, target, mode)
        place(out, x, start)
        cues.append({'start': start, 'end': start+dur, 'kind': kind, 'description': desc,
                     'target': target, 'pan': p, 'mode': mode,
                     'edge_abs_max': float(np.abs(x[:, [0, -1]]).max())})
    return out, cues
