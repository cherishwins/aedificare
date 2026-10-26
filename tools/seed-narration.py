# /// script
# requires-python = ">=3.10"
# dependencies = ["soundfile", "numpy", "num2words"]
# ///
"""
Seeds the narration cache from a film the channel's voice has already read,
so a render after a fix to the words re-voices only the blocks whose words
changed, not the whole film.

Why it exists (26 Oct 2026). tools/narrate.py read "$1 billion" as "1 dollars
billion", and three released films were voiced that way. Every block the voice
speaks is kept in the Actions cache under narration-<slug> (film.yml), keyed
by the model, the voice, the format, the voice's stored settings and the
block's spelled text (tools/narrate_eleven.py, cache_file), and a rerun pays
only for blocks it has not heard. But GitHub drops a cache entry not used for
seven days, and these films were last rendered on 17 and 18 Oct, so their
caches were gone: a render would have spoken every block again, about 5,000
credits for the three. The render's own artifact (film-<slug>-wide, 90 days)
still holds narration.json and narration.wav, which carry every block's
piece of the voice and every word's time. This puts them back in the cache
under the keys the current code would ask for.

What it does, per read block of <dir>/narration.json:
  1. runs the CURRENT normaliser on the block's text and compares it with the
     `spoken` text the film was voiced from. A block whose spoken text has
     changed (the "$1 billion" blocks) is left out and named: the voice must
     read it again, and that is the point. A block with no change is a block
     the cache may hold;
  2. spells the spoken words as narrate_eleven does and computes the cache key;
  3. cuts the block's piece out of narration.wav between its `start` and `end`
     (the piece narrate_eleven placed there, trimmed to its words with LEAD
     and TAIL of air and faded, so a rerun's own trim is a no-op), and gives
     every spelled word a time inside the piece: the film's word times are per
     ORIGINAL token, so a token's interval is shared among its spelled words
     by their length. The ends of each token are exact, which is all the film
     cuts on; the split inside a token is an estimate no frame reads;
  4. writes eleven-<key>.flac and .json as narrate_eleven writes them.

The key needs the voice's stored settings, read from the account
(ELEVENLABS_API_KEY) as a render reads them; --settings <file> takes a saved
copy for an offline test. --check writes nothing and reports what it would do.
A narration in another model or voice is refused: a seeded piece in the wrong
voice would be a film in two voices.

  uv run tools/seed-narration.py <render dir> --voice <id> [--check] [--settings <json>]
  env NARRATION_CACHE (default ~/.cache/aedificare-narration), ELEVENLABS_API_KEY
"""
import argparse
import json
import os
import re
import sys
import time

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import narrate_gemini as G  # noqa: E402  spell, the cache directory, LEAD and TAIL
import narrate_eleven as E  # noqa: E402  the cache key, the API

# narrate.py narrates a render at import, so its normaliser is taken as tools/test-narrate.py takes it.
_src = open(os.path.join(HERE, 'narrate.py'), encoding='utf8').read()
_ns = {'re': re}
exec(_src[_src.index('UNITS = {'):_src.index('\nALNUM = ')], _ns)  # noqa: S102 - the repo's own file
normalise = _ns['normalise']


def split_even(s, e, parts):
    """One interval shared among parts by their length; the first starts at s, the last ends at e."""
    L = sum(len(p) for p in parts) or 1
    out, cur = [], s
    for i, p in enumerate(parts):
        nxt = e if i == len(parts) - 1 else cur + (e - s) * len(p) / L
        out.append((round(cur, 3), round(nxt, 3)))
        cur = nxt
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('dir')
    ap.add_argument('--voice', required=True)
    ap.add_argument('--settings', help='a saved voice_settings JSON, for a run with no key')
    ap.add_argument('--check', action='store_true', help='report only; write nothing')
    a = ap.parse_args()
    voice = a.voice.strip()
    nj_path = os.path.join(a.dir, 'narration.json')
    if not os.path.exists(nj_path):
        sys.exit(f'seed: no narration.json in {a.dir}')
    nj = json.load(open(nj_path))
    if nj.get('model') != E.MODEL:
        sys.exit(f'seed: {nj_path} was voiced by {nj.get("model")!r}, not {E.MODEL!r}; refusing to seed another model\'s cache')
    if nj.get('voice') != voice:
        sys.exit(f'seed: {nj_path} was voiced by {nj.get("voice")!r}, not {voice!r}; refusing to seed another voice\'s cache')
    sr = int(nj['sr'])
    audio_path = next((p for p in (os.path.join(a.dir, 'narration.wav'), os.path.join(a.dir, 'narration.flac')) if os.path.exists(p)), None)
    if not audio_path:
        sys.exit(f'seed: no narration.wav or narration.flac in {a.dir}')
    audio, asr = sf.read(audio_path, dtype='float32')
    if asr != sr:
        sys.exit(f'seed: {audio_path} is at {asr} Hz, the narration at {sr}')
    if audio.ndim > 1:
        audio = audio[:, 0]
    if abs(len(audio) / sr - float(nj['duration'])) > 0.05:
        sys.exit(f'seed: {audio_path} runs {len(audio) / sr:.3f} s, the narration says {nj["duration"]}; not the same take')

    key = os.environ.get('ELEVENLABS_API_KEY')
    if a.settings:
        E.SETTINGS = json.load(open(a.settings))
    elif key:
        E.SETTINGS = E.call(f'voices/{voice}/settings', key)
    else:
        sys.exit('seed: the cache key needs the voice\'s stored settings: set ELEVENLABS_API_KEY or pass --settings <json>')
    if key:
        try:
            u = E.call('user/subscription', key)
            reset = u.get('next_character_count_reset_unix')
            print(f'seed: ElevenLabs {u.get("tier")}: {u.get("character_count")} of {u.get("character_limit")} credits used'
                  + (f', reset {time.strftime("%Y-%m-%d %H:%M UTC", time.gmtime(reset))}' if reset else ''), flush=True)
        except Exception as e:  # noqa: BLE001 - a report, never a reason to stop
            print(f'seed: could not read the subscription ({str(e)[:120]})', file=sys.stderr)

    seeded, present, changed, odd = [], [], [], []
    for b in nj['blocks']:
        if not b.get('read') or not b.get('words'):
            continue
        spoken, spans = normalise(b['text'])
        if spoken != b.get('spoken'):
            changed.append((b, spoken))
            continue
        sw = spoken.split()
        said, owner = [], []
        for si, w in enumerate(sw):
            for x in G.spell(w):
                said.append(x)
                owner.append(si)
        if not said:
            continue
        text = ' '.join(said)
        toks = b['words']
        if len(toks) != len(spans) or any(t['w'] != sp[0] for t, sp in zip(toks, spans)):
            odd.append((b, 'its word list does not match the normaliser\'s spans'))
            continue
        start, end = float(b['start']), float(b['end'])
        piece = audio[int(round(start * sr)):int(round(end * sr))]
        if len(piece) < sr // 10:
            odd.append((b, f'its piece is {len(piece) / sr:.3f} s'))
            continue
        # spoken-word times inside the piece, then spelled-word times inside each spoken word
        sp = [None] * len(sw)
        for (tok, i0, i1), tw in zip(spans, toks):
            for j, iv in enumerate(split_even(max(0.0, tw['s'] - start), max(0.0, tw['e'] - start), sw[i0:i1 + 1])):
                sp[i0 + j] = iv
        sp = G.fill(sp)
        wt = []
        for si in range(len(sw)):
            mine = [said[k] for k, o in enumerate(owner) if o == si]
            wt.extend(split_even(sp[si][0], sp[si][1], mine))
        dur = len(piece) / sr
        if wt[-1][1] > dur + 0.05 or wt[0][0] < -0.001:
            odd.append((b, f'its words run {wt[0][0]:.3f} to {wt[-1][1]:.3f} s in a {dur:.3f} s piece'))
            continue
        wt = [(min(x, dur), min(y, dur)) for x, y in wt]
        cf = E.cache_file(voice, text)
        if E.heard(voice, text):
            present.append(b)
            continue
        if not a.check:
            os.makedirs(G.CACHE, exist_ok=True)
            sf.write(cf + '.part.flac', piece, sr, subtype='PCM_16')
            os.replace(cf + '.part.flac', cf + '.flac')
            with open(cf + '.part.json', 'w') as f:
                json.dump({'words': wt}, f)
            os.replace(cf + '.part.json', cf + '.json')
        seeded.append((b, text))

    verb = 'would seed' if a.check else 'seeded'
    print(f'seed: {verb} {len(seeded)} block(s), {len(present)} already in {G.CACHE}, {len(changed)} changed since the film was voiced, {len(odd)} left out')
    chars = 0
    for b, spoken in changed:
        chars += len(' '.join(x for w in spoken.split() for x in G.spell(w)))
        print(f'  block {b["i"]} ({b["kind"]}) reads differently now and will be voiced again:\n'
              f'    was: {b.get("spoken", "")[:140]!r}\n    now: {spoken[:140]!r}')
    if changed:
        print(f'  about {chars} characters to voice again, roughly {int(chars * 0.14)} to {int(chars * 0.2)} credits')
    for b, why in odd:
        print(f'  block {b["i"]} ({b["kind"]}) left out: {why}; it will be voiced again')
    return 0


if __name__ == '__main__':
    sys.exit(main())
