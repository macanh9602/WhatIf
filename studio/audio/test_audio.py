"""Small DSP regression checks: python -B audio/test_audio.py."""
import sys
sys.dont_write_bytecode = True
import json
import os
from pathlib import Path
import tempfile
import unittest
import numpy as np
from dsp import SR, ns, dbg, rng, true_peak, write_wav, read_wav
from build import duck, limiter
from effects import synth
import score

HERE = Path(__file__).resolve().parent


class AudioTests(unittest.TestCase):
    def setUp(self):
        self.cfg = json.loads((HERE/'settings.json').read_text(encoding='utf-8'))

    def test_pcm_roundtrip_does_not_change_gain(self):
        # Include negative values and near-full-scale samples; the source
        # template's asymmetric encoding denominator biases this roundtrip.
        x = np.array([[-.999, -.7, -.123, 0, .123, .7, .999]])
        fd, path = tempfile.mkstemp(dir=HERE, suffix='.wav')
        os.close(fd)
        try:
            write_wav(path, x)
            y, sr = read_wav(path)
        finally:
            Path(path).unlink()
        self.assertEqual(sr, SR)
        self.assertLessEqual(float(np.abs(y-x).max()), .5/8388608)

    def test_limiter_reconstruction_ceiling_and_stereo_link(self):
        t = np.arange(ns(.8))/SR
        x = np.sin(2*np.pi*5900*t)*1.3
        x[:ns(.05)] *= np.linspace(0, 1, ns(.05))
        x[-ns(.05):] *= np.linspace(1, 0, ns(.05))
        stereo = np.stack([x, x*.37])
        y, gain = limiter(stereo, self.cfg)
        self.assertEqual(y.shape, stereo.shape)
        self.assertLessEqual(float(true_peak(y)), self.cfg['ceiling_dbtp']+1e-6)
        self.assertLess(float(gain.min()), 1)
        self.assertLess(float(np.abs(y[1]-.37*y[0]).max()), 1e-12)
        np.testing.assert_allclose(y, stereo*gain, rtol=0, atol=1e-14)

    def test_word_duck_reaches_depth_and_recovers(self):
        cfg = dict(self.cfg, duration=3)
        envelope = duck([{'start': .5, 'end': 1.4}], cfg, ns(3))
        self.assertAlmostEqual(float(envelope[ns(.9)]), self.cfg['duck_db'], places=5)
        self.assertGreater(float(envelope[-1]), -.01)
        # Smooth word edges: no abrupt gain steps.
        self.assertLess(float(np.abs(np.diff(envelope)).max()), .01)

    def test_v3_foley_lengths_are_finite_and_deterministic(self):
        for kind in ('rustle', 'crinkle', 'sheet', 'tear', 'roll', 'sip', 'stamp',
                     'click', 'whoosh', 'room', 'steps', 'whoop', 'marker', 'fastclock', 'whistle_melody'):
            dur = 2.6 if kind == 'whistle_melody' else .4
            with self.subTest(kind=kind):
                x = synth(kind, dur, rng(42))
                self.assertEqual(x.shape[-1], ns(dur))
                self.assertTrue(np.isfinite(x).all())
                self.assertGreater(float(np.abs(x).max()), 0)
                np.testing.assert_array_equal(x, synth(kind, dur, rng(42)))

    def test_v3_score_stop_and_payoff(self):
        music, sections = score.render(self.cfg)
        self.assertEqual(music.shape, (2, ns(63)))
        self.assertTrue(np.isfinite(music).all())
        self.assertEqual(float(np.abs(music[:, ns(22.32):ns(25.5)]).max()), 0)
        self.assertEqual(float(np.abs(music[:, [0, -1]]).max()), 0)
        for start, end in ((55, 60.6), (60.6, 61.6), (61.6, 63)):
            self.assertGreater(float(np.abs(music[:, ns(start):ns(end)]).max()), .01)
        self.assertEqual(sections[-2]['start'], 55)
        self.assertEqual(sections[-1]['start'], 60.6)


if __name__ == '__main__':
    unittest.main()
