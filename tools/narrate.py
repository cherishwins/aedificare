# /// script
# requires-python = ">=3.10"
# dependencies = ["kokoro>=0.9.4", "soundfile", "numpy", "torch"]
# [[tool.uv.index]]
# name = "pytorch-cpu"
# url = "https://download.pytorch.org/whl/cpu"
# explicit = true
# [tool.uv.sources]
# torch = { index = "pytorch-cpu" }
# ///
"""
The voice. Reads <dir>/script.json (written by tools/generate-film.mjs from
the built edition page), speaks every block marked `read` with Kokoro-82M
(Apache-2.0, CPU, no key, no account) and writes:

  <dir>/narration.wav    24 kHz mono, the whole film's voice with the gaps
  <dir>/narration.json   every block's start and end, and every ORIGINAL
                         word's start and end in film seconds, so the frames
                         can cut on the word being spoken

Money and units are normalised before the model sees them, because "$5.1M"
read raw comes out as five dollars and one cent M. The original tokens are
kept and the model's word timestamps are mapped back onto them; a block that
cannot be aligned falls back to proportional timing and says so on stderr.

Run through uv so nothing is installed into the repo:
  uv run tools/narrate.py brand/youtube/edition-03
Owner decision 2026-09-24: the channel speaks; the voice is am_michael.
"""
import json
import re
import sys
import time

import numpy as np
import soundfile as sf
from kokoro import KPipeline

DIR = sys.argv[1]
SCRIPT = json.load(open(f'{DIR}/script.json'))
VOICE = SCRIPT.get('voice', 'am_michael')
SPEED = float(SCRIPT.get('speed', 1.0))
SR = 24000

# Silence around blocks, in seconds, by what the block is.
GAP_BEFORE = {'title': 3.6, 'lede': 0.5, 'h2': 1.4, 'h3': 0.9, 'p': 0.55, 'quote': 0.7, 'slap': 1.2, 'record': 1.4}
GAP_AFTER = {'title': 0.4, 'lede': 0.6, 'h2': 0.6, 'h3': 0.4, 'p': 0.0, 'quote': 0.3, 'slap': 1.2, 'record': 2.7}

UNITS = {
    'MHz': 'megahertz', 'GHz': 'gigahertz', 'kHz': 'kilohertz', 'Hz': 'hertz',
    'Mbps': 'megabits per second', 'Gbps': 'gigabits per second', 'kbps': 'kilobits per second',
    'dBm': 'd B m', 'dBi': 'd B i', 'dB': 'decibels',
    'km': 'kilometres', 'mm': 'millimetres', 'cm': 'centimetres', 'kg': 'kilograms',
    'mW': 'milliwatts', 'kW': 'kilowatts', 'MW': 'megawatts', 'W': 'watts',
    'mAh': 'milliamp hours', 'Wh': 'watt hours', 'kWh': 'kilowatt hours',
    'ms': 'milliseconds', 'GB': 'gigabytes', 'MB': 'megabytes', 'TB': 'terabytes', 'kB': 'kilobytes',
    'IEEE': 'I triple E', 'FCC': 'F C C', 'ISED': 'I S E D', 'USAF': 'U S A F', 'GHQ': 'G H Q',
}
SCALE = {'K': 'thousand', 'M': 'million', 'B': 'billion', 'T': 'trillion'}


def norm_token(tok, prev):
    """One original token -> list of spoken words. Punctuation stays attached to the last word."""
    lead = re.match(r'^[\(\["“‘]*', tok).group(0)
    trail = re.search(r'[\)\]"”’.,;:!?]*$', tok).group(0)
    core = tok[len(lead):len(tok) - len(trail)] if trail else tok[len(lead):]
    words = []
    m = re.match(r'^\$([\d][\d,]*(?:\.\d+)?)([KMBT])?$', core)
    if m:
        words = [m.group(1)] + ([SCALE[m.group(2)]] if m.group(2) else []) + ['dollars']
    elif core in UNITS and prev is not None and re.match(r'^\d', prev):
        words = UNITS[core].split()
    elif core in UNITS:
        words = UNITS[core].split()
    elif re.match(r'^\d[\d,]*(?:\.\d+)?(MHz|GHz|kHz|Mbps|Gbps|dBm|dB|km|mm|cm|kg|mW|kW|W|ms|GB|MB|TB|%)$', core):
        n, u = re.match(r'^([\d,.]+)(.*)$', core).groups()
        words = [n] + (['percent'] if u == '%' else UNITS[u].split())
    elif core == '%':
        words = ['percent']
    elif core == '×':
        words = ['times']
    elif core == '÷':
        words = ['divided', 'by']
    elif core == '·':
        words = [',']
    elif re.match(r'^\d+–\d+$', core):
        a, b = core.split('–'); words = [a, 'to', b]
    elif core == '':
        words = []
    else:
        words = [core]
    if not words:
        return [trail] if trail else []
    words[-1] = words[-1] + trail
    words[0] = lead + words[0]
    return words


def normalise(text):
    """Returns (spoken text, [(original token, first spoken index, last spoken index)])."""
    toks = text.split()
    spoken, spans, prev = [], [], None
    for t in toks:
        ws = norm_token(t, prev)
        if not ws:
            continue
        spans.append((t, len(spoken), len(spoken) + len(ws) - 1))
        spoken.extend(ws)
        prev = t
    return ' '.join(spoken), spans


ALNUM = re.compile(r'[^0-9a-z]+')
key = lambda s: ALNUM.sub('', s.lower())


def align(spoken_words, ktokens):
    """Map Kokoro's tokens (with start_ts/end_ts, seconds within the block) onto the spoken words. Returns [(s, e) or None]."""
    out = [None] * len(spoken_words)
    i = 0
    buf, buf_s, buf_e = '', None, None
    for t in ktokens:
        txt = key(t.text)
        if not txt:
            continue
        if t.start_ts is None or t.end_ts is None:
            continue
        while i < len(spoken_words) and key(spoken_words[i]) == '':
            i += 1
        if i >= len(spoken_words):
            break
        want = key(spoken_words[i])
        buf += txt
        buf_s = t.start_ts if buf_s is None else buf_s
        buf_e = t.end_ts
        if buf == want:
            out[i] = (buf_s, buf_e); i += 1; buf, buf_s, buf_e = '', None, None
        elif not want.startswith(buf):
            # Lost the thread: give up on this block's alignment.
            return None
    return out


t0 = time.time()
pipe = KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')
print(f'narrate: model loaded in {time.time() - t0:.1f}s, voice {VOICE}, speed {SPEED}', flush=True)

audio_parts = []
cursor = 0.0
blocks_out = []
misaligned = 0
for b in SCRIPT['blocks']:
    if not b.get('read'):
        blocks_out.append({**b, 'start': cursor, 'end': cursor, 'words': []})
        continue
    kind = b['kind']
    gap = GAP_BEFORE.get(kind, 0.5)
    audio_parts.append(np.zeros(int(gap * SR), dtype=np.float32)); cursor += gap
    spoken, spans = normalise(b['text'])
    spoken_words = spoken.split()
    chunks, ktoks, offset = [], [], 0.0
    for r in pipe(spoken, voice=VOICE, speed=SPEED):
        a = r.audio.numpy() if hasattr(r.audio, 'numpy') else np.asarray(r.audio)
        for t in (r.tokens or []):
            if t.start_ts is not None:
                t.start_ts += offset; t.end_ts += offset
            ktoks.append(t)
        chunks.append(a); offset += len(a) / SR
    a = np.concatenate(chunks) if chunks else np.zeros(0, dtype=np.float32)
    dur = len(a) / SR
    times = align(spoken_words, ktoks)
    if times is None or any(t is None for t in times):
        misaligned += 1
        print(f'narrate: proportional timing for block {b["i"]} ({kind})', file=sys.stderr)
        n = len(spoken_words)
        times = [((k / n) * dur, ((k + 1) / n) * dur) for k in range(n)]
    words = []
    for tok, i0, i1 in spans:
        s = times[i0][0]; e = times[i1][1]
        words.append({'w': tok, 's': round(cursor + s, 3), 'e': round(cursor + e, 3)})
    start = cursor
    audio_parts.append(a); cursor += dur
    after = GAP_AFTER.get(kind, 0.0)
    audio_parts.append(np.zeros(int(after * SR), dtype=np.float32)); cursor += after
    blocks_out.append({**b, 'spoken': spoken, 'start': round(start, 3), 'end': round(start + dur, 3), 'words': words})
    print(f'  {b["i"]:>3} {kind:<7} {dur:6.1f}s  {b["text"][:60]}', flush=True)

audio = np.concatenate(audio_parts)
sf.write(f'{DIR}/narration.wav', audio, SR)
json.dump({'voice': VOICE, 'speed': SPEED, 'model': 'hexgrad/Kokoro-82M', 'sr': SR, 'duration': round(len(audio) / SR, 3), 'blocks': blocks_out},
          open(f'{DIR}/narration.json', 'w'), indent=1)
print(f'narrate: {len(audio) / SR / 60:.1f} min of narration in {(time.time() - t0) / 60:.1f} min wall, {misaligned} block(s) proportional', flush=True)
