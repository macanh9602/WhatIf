"""What If score: original, synthesized, one style per section (settings.json music_sections: [name, a, b, base, style]).
Styles: pulse (hook tension), bounce (everyday montage), explain (diagram glock), dark (cold), pad (held), warm (leaf),
resolve (payoff). Melody / chords come from settings.json (our own). No samples, no template melodies."""
import numpy as np
from dsp import ns, rng, dbg, pan, place, fades, lp
import instruments as I


def render(cfg):
    out = np.zeros((2, ns(cfg['duration'])))
    random = rng(cfg['seed'])
    q = 60 / cfg['bpm']
    levels = cfg['music_levels']
    records = []

    def add(buf, x, t, kind, p=0, gain=1):
        if t < 0 or t >= buf.shape[1] / 48000 - .05:
            return
        place(buf, pan(fades(x, .003, .035), p) if x.ndim == 1 else fades(x, .01, .06), t, dbg(levels[kind]) * gain)

    for index, (name, a, b, base, style) in enumerate(cfg['music_sections']):
        dur = b - a
        buf = np.zeros((2, ns(dur)))
        major, minor = cfg['major_chords'], cfg['minor_chords']
        if style == 'pulse':
            add(buf, I.pad([I.m2f(m) for m in minor[0][1:]], dur - .2, .3, random, att=1.2, rel=.6), 0, 'pad')
            for j, t in enumerate(np.arange(0, dur - .3, q / 2)):
                add(buf, I.pluck(I.m2f(57 if j % 4 else 45), .5, random, dur=.25, bright=.3), t, 'bass', -.1)
        elif style == 'bounce':
            for bar, bt in enumerate(np.arange(0, dur, 4 * q)):
                chord = major[bar % 4]
                for beat, pitch in [(0, chord[0]), (2.5, chord[1])]:
                    add(buf, I.pluck(I.m2f(pitch), .7, random, dur=.65, bright=.22), bt + beat * q, 'bass', -.12)
                for beat in (1.25, 3.25):
                    for pitch in chord[2:]:
                        add(buf, I.pluck(I.m2f(pitch), .45, random, dur=.6, bright=.25), bt + beat * q, 'chord', .25)
                for beat in (1, 3):
                    add(buf, I.brush(.5, random, dur=.18), bt + beat * q + .018, 'brush', -.3)
            for cycle in np.arange(0, dur, 8 * q):
                for beat, pitch in cfg['theme']:
                    add(buf, I.pluck(I.m2f(pitch), .6, random, dur=.6, bright=.38), cycle + beat * q, 'melody', .2)
        elif style == 'explain':
            for bar, bt in enumerate(np.arange(0, dur, 4 * q)):
                chord = major[bar % 4]
                add(buf, I.pluck(I.m2f(chord[0]), .6, random, dur=1.2, bright=.2), bt, 'bass')
                for k, pitch in enumerate(chord[1:] + [chord[1] + 12]):
                    add(buf, I.glock(I.m2f(pitch + 12), .3, random, dur=.6), bt + k * q, 'glock', -.3 + k * .2)
        elif style == 'dark':
            for bar, bt in enumerate(np.arange(0, dur, 8 * q)):
                chord = minor[bar % 4]
                add(buf, I.pad([I.m2f(m) for m in chord[1:]], 8 * q, .32, random, att=1.0, rel=1.0), bt, 'pad')
                for beat in (0, 3, 6):
                    add(buf, I.pluck(I.m2f(chord[0] - 12 if chord[0] > 40 else chord[0]), .6, random, dur=1.0, bright=.15), bt + beat * q, 'bass')
                add(buf, I.musicbox(I.m2f(chord[2] + 12), .3, random, dur=1.6), bt + 4 * q, 'musicbox', .3)
        elif style == 'pad':
            add(buf, I.pad([I.m2f(m) for m in minor[2][1:]], dur - .2, .22, random, att=1.5, rel=1.0), 0, 'pad')
        elif style == 'warm':
            for bar, bt in enumerate(np.arange(0, dur, 4 * q)):
                chord = major[bar % 4]
                add(buf, I.pad([I.m2f(m) for m in chord[1:]], 4 * q, .22, random, att=.6, rel=.6), bt, 'pad')
            for cycle in np.arange(0, dur, 8 * q):
                for beat, pitch in cfg['theme']:
                    add(buf, I.musicbox(I.m2f(pitch), .4, random, dur=1.2), cycle + beat * q, 'musicbox', .15)
        elif style == 'resolve':
            add(buf, I.pad([I.m2f(m) for m in major[0][1:]], dur - .3, .32, random, att=.8, rel=1.2), 0, 'pad')
            for j, pitch in enumerate([72, 76, 79, 84, 88]):
                add(buf, I.glock(I.m2f(pitch), .45, random, dur=1.4), .3 + j * .32, 'glock', -.3 + j * .15, 1.4)
            for beat, pitch in cfg['theme']:
                add(buf, I.pluck(I.m2f(pitch), .6, random, dur=.7, bright=.38), 2.4 + beat * q, 'melody', .2)
            add(buf, I.pluck(I.m2f(36), .65, random, dur=1.4), dur - 1.6, 'bass')
        else:
            raise ValueError(f'unknown music style {style}')
        buf = fades(lp(buf, 7500), .012, .35)
        place(out, buf, a)
        records.append({'name': name, 'start': a, 'end': b, 'base_margin': base})
    return out, records
