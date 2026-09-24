# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "soundfile"]
# ///
"""
The bed. The owner asked for soft piano under the voice; the brand's rule is
that nothing is drawn, so nothing is sampled either: the bed is computed,
like the rose. A sparse, quiet, piano-like line on a fixed pentatonic, one
note every second or third beat of 900 ms, a low root held underneath, all
of it seeded by the edition's own seed so the same edition always gets the
same bed and no two editions share one. It runs from the first frame to the
end of the record line and fades out before the dove, which stays silent.

Because it is computed here it carries no third-party licence, which keeps
CC BY possible on the file; a licensed track passed with --music replaces it.

  uv run tools/bed.py brand/youtube/<slug>
Reads narration.json and script.json there; writes bed.wav (24 kHz mono).
"""
import json
import sys

import numpy as np
import soundfile as sf

DIR = sys.argv[1]
N = json.load(open(f'{DIR}/narration.json'))
S = json.load(open(f'{DIR}/script.json'))
SR = 24000
BEAT = 0.9
seed_text = str(S.get('seed', '0'))
seed = int(seed_text) if seed_text.isdigit() else int(seed_text, 16)
rng = np.random.default_rng(seed)

record = next((b for b in N['blocks'] if b['kind'] == 'record'), None)
end = (record['end'] if record else N['duration']) + 0.6
n = int(end * SR)
out = np.zeros(n, dtype=np.float64)
t_all = np.arange(n) / SR

# A minor pentatonic across two octaves, in hertz. Nothing brighter than A5.
SCALE = [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.26, 783.99]


def note(freq, dur, vel):
    """A piano-like tone: six partials, higher ones decaying faster, a soft attack, a slow release."""
    t = np.arange(int(dur * SR)) / SR
    y = np.zeros_like(t)
    for k in range(1, 7):
        amp = vel / k ** 1.6
        decay = np.exp(-t * (1.1 + 0.9 * k))
        y += amp * decay * np.sin(2 * np.pi * freq * k * t * (1 + 0.0004 * (k - 1)))
    attack = np.minimum(1.0, t / 0.008)
    return y * attack


# The root, held: a very quiet sine with a slow breath in its level.
root = 110.0
out += 0.05 * (0.7 + 0.3 * np.sin(2 * np.pi * t_all / 11.0)) * np.sin(2 * np.pi * root * t_all)

# The line: a random walk on the scale, a note every two or three beats, rests now and then.
i = int(rng.integers(2, 6))
t = 2 * BEAT
while t < end - 4:
    step = int(rng.choice([-2, -1, -1, 0, 1, 1, 2]))
    i = min(len(SCALE) - 1, max(0, i + step))
    if rng.random() > 0.18:  # a rest, sometimes
        vel = 0.28 + 0.12 * rng.random()
        y = note(SCALE[i], 4.0, vel)
        s = int(t * SR)
        e = min(n, s + len(y))
        out[s:e] += y[: e - s]
    t += BEAT * int(rng.choice([2, 2, 3, 3, 4]))

# Fade in over two beats, out over two beats before the dove.
fade = int(2 * BEAT * SR)
out[:fade] *= np.linspace(0, 1, fade)
out[-fade:] *= np.linspace(1, 0, fade)
peak = np.max(np.abs(out)) or 1.0
out = out / peak * 10 ** (-12 / 20)  # peak at -12 dBFS; the mix sets the level under the voice
sf.write(f'{DIR}/bed.wav', out.astype(np.float32), SR)
print(f'bed: {end / 60:.1f} min, seed {seed_text}, peak -12 dBFS -> {DIR}/bed.wav')
