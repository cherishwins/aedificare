"""
The ElevenLabs voice for tools/narrate.py (imported from there, run in its uv
environment). One entry point, narrate_eleven(), which writes
<dir>/narration.wav and <dir>/narration.json in exactly the shape the Kokoro
and Gemini paths write them, so both renderers are unchanged.

The owner chose ElevenLabs on 2026-10-17 (first on the Artificial Analysis
arena, on the paid Starter plan, which carries the commercial licence) and a
woman's voice, General American, designed from a written description in the
owner's account and never cloned from anyone (CLAUDE.md, override 6).

  speak:  every read block is one request to /text-to-speech/<voice>/with-timestamps
          on eleven_v4_turbo (ELEVEN_MODEL overrides), with the blocks either side
          as previous_text and next_text so the read runs on; numbers are spelled
          first by narrate_gemini.spell, so what is said is what was written.
  time:   ElevenLabs returns the time of every character it was given, so every
          word's start and end come straight from the reply; forced alignment
          (narrate_gemini) is only the fallback when the reply's characters do not
          match the text.
  check:  the same gate as the Gemini path: each block's audio is scored against
          its words by wav2vec2, and a block whose audio does not say them is
          spoken again, then fails the run. Nothing is placed by guesswork.
  cut:    each block is trimmed to its first and last word, with air and a short
          fade, and laid out with the gaps the other paths use.

Every block that passes is cached in NARRATION_CACHE keyed by model, voice and
text, so a rerun or a one-word edit pays only for what changed. Credits are the
limit here, not requests: the plan's monthly characters. A reply saying the
quota is spent stops the run with exit 75, as the Gemini daily quota does, and
the blocks already heard are kept.
"""
import base64
import hashlib
import http.client
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

import numpy as np
import soundfile as sf

import narrate_gemini as G  # spell, the aligner, the check, the cache directory, the fades

API = 'https://api.elevenlabs.io/v1'
MODEL = os.environ.get('ELEVEN_MODEL', 'eleven_v4_turbo')
FORMAT = 'pcm_24000'  # 16-bit mono at the narration's own rate: nothing to decode, nothing to resample
MIN_RATE_WORDS = 8    # the words-a-second test means nothing on a two-word title


class Quota(Exception):
    pass


def call(path, key, body=None):
    req = urllib.request.Request(f'{API}/{path}', data=json.dumps(body).encode() if body is not None else None,
                                 method='POST' if body is not None else 'GET',
                                 headers={'xi-api-key': key, 'content-type': 'application/json'})
    with urllib.request.urlopen(req, timeout=300) as r:
        return json.loads(r.read())


def credits(key):
    try:
        u = call('user/subscription', key)
        return u.get('character_count'), u.get('character_limit'), u.get('tier')
    except Exception as e:  # noqa: BLE001 - the count is a report, never a reason to stop
        print(f'narrate: could not read the ElevenLabs subscription ({str(e)[:120]})', file=sys.stderr)
        return None, None, None


def speak(text, voice, key, prev_text, next_text):
    body = {'text': text, 'model_id': MODEL}
    if prev_text:
        body['previous_text'] = prev_text
    if next_text:
        body['next_text'] = next_text
    delay, last = 5, ''
    for attempt in range(8):
        wait = delay
        try:
            res = call(f'text-to-speech/{voice}/with-timestamps?output_format={FORMAT}', key, body)
            pcm = base64.b64decode(res.get('audio_base64') or '')
            if len(pcm) < 2:
                raise ValueError('empty audio in the reply')
            audio = np.frombuffer(pcm[:len(pcm) // 2 * 2], dtype='<i2').astype(np.float32) / 32768.0
            return audio, res.get('alignment')
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='replace')
            low = msg.lower()
            if 'quota_exceeded' in low or 'quota' in low and e.code in (401, 402, 403):
                raise Quota(msg[:300])
            if e.code in (400, 422) and ('previous_text' in low or 'next_text' in low) and ('previous_text' in body or 'next_text' in body):
                body.pop('previous_text', None); body.pop('next_text', None)  # a model without request context
                last = f'{e.code}: dropped previous_text/next_text'
                continue
            if e.code == 404 or 'voice_not_found' in low:
                sys.exit(f'narrate: voice {voice} is not in this ElevenLabs account: {msg[:300]}\n'
                         'narrate: refusing to fall back to another voice; the channel speaks in one voice')
            if e.code == 401:
                sys.exit(f'narrate: ElevenLabs refused the key (401): {msg[:300]}')
            if e.code not in (429, 500, 502, 503, 504):
                sys.exit(f'narrate: ElevenLabs refused ({e.code}): {msg[:600]}')
            last = f'{e.code}: {msg[:200]}'
        except (urllib.error.URLError, OSError, http.client.HTTPException, ValueError) as e:
            last = f'{type(e).__name__}: {str(e)[:200]}'
        if attempt < 7:
            print(f'narrate: ElevenLabs {last.split(":")[0]}, retrying in {wait}s', file=sys.stderr, flush=True)
            time.sleep(wait)
            delay = min(delay * 2, 120)
    sys.exit(f'narrate: ElevenLabs kept failing ({last}); giving up')


def word_spans(text):
    """[(start char, end char)] of each space-separated word in text."""
    return [(m.start(), m.end()) for m in re.finditer(r'\S+', text)]


def times_from_alignment(text, alignment):
    """Each word's (start, end) in seconds from the reply's character times, or None if they do not fit the text."""
    if not alignment:
        return None
    chars = alignment.get('characters') or []
    st, en = alignment.get('character_start_times_seconds') or [], alignment.get('character_end_times_seconds') or []
    if ''.join(chars) != text or len(st) != len(chars) or len(en) != len(chars):
        return None
    return [(float(st[a]), float(en[b - 1])) for a, b in word_spans(text)]


def cache_file(voice, text):
    h = hashlib.sha256(json.dumps(['eleven', MODEL, voice, text]).encode()).hexdigest()[:32]
    return os.path.join(G.CACHE, f'eleven-{h}')


def narrate_eleven(DIR, SCRIPT, voice, normalise, GAP_BEFORE, GAP_AFTER, SR):
    key = os.environ.get('ELEVENLABS_API_KEY')
    if not key:
        sys.exit('narrate: NARRATOR is eleven but ELEVENLABS_API_KEY is not set')
    t0 = time.time()
    prepared = {}
    for b in SCRIPT['blocks']:
        if not b.get('read'):
            continue
        spoken, spans = normalise(b['text'])
        sw = spoken.split()
        said, owner = [], []
        for si, w in enumerate(sw):
            for x in G.spell(w):
                said.append(x); owner.append(si)
        prepared[b['i']] = (spoken, spans, sw, said, owner)
    order = [b for b in SCRIPT['blocks'] if b.get('read') and prepared[b['i']][3]]
    texts = {b['i']: ' '.join(prepared[b['i']][3]) for b in order}
    total = sum(len(t) for t in texts.values())
    have = sum(os.path.exists(cache_file(voice, t) + '.flac') for t in texts.values())
    used0, limit, tier = credits(key)
    print(f'narrate: ElevenLabs {MODEL}, voice {voice}, {len(order)} blocks, {total} characters, {have} blocks already heard'
          + (f'; plan {tier}, {used0} of {limit} credits used' if limit else ''), flush=True)

    pieces, asked, asked_chars = {}, 0, 0
    for k, b in enumerate(order):
        text = texts[b['i']]
        words = prepared[b['i']][3]
        cf = cache_file(voice, text)
        when = G.rejected(voice, 'eleven:' + text)
        if when and not os.path.exists(cf + '.flac'):
            sys.exit(f'narrate: block {b["i"]} failed the alignment check {G.SPEAK_TRIES} times on {when}; it is not asked for '
                     f'again for {G.REJECT_DAYS} days. Fix its text, or delete {G.cache_path(voice, "eleven:" + text)[:-5]}.rejected. '
                     f'It reads: {text[:160]!r}')
        why = None
        for attempt in range(G.SPEAK_TRIES):
            fresh = not (attempt == 0 and os.path.exists(cf + '.flac') and os.path.exists(cf + '.json'))
            if not fresh:
                audio, _ = sf.read(cf + '.flac', dtype='float32')
                wt = json.load(open(cf + '.json'))['words']
            else:
                prev_text = texts[order[k - 1]['i']] if k else None
                next_text = texts[order[k + 1]['i']] if k + 1 < len(order) else None
                try:
                    audio, alignment = speak(text, voice, key, prev_text, next_text)
                except Quota as q:
                    done = sum(os.path.exists(cache_file(voice, t) + '.flac') for t in texts.values())
                    print(f'narrate: the ElevenLabs credits are spent ({q}).\n'
                          f'narrate: {done} of {len(order)} blocks are kept in {G.CACHE}; rerun when credits are back to continue',
                          file=sys.stderr, flush=True)
                    sys.exit(G.QUOTA_EXIT)
                asked += 1; asked_chars += len(text)
                wt = times_from_alignment(text, alignment)
            dur = len(audio) / SR
            em, spf = G.emissions(audio, SR)
            aligned = G.force_align(em, words)
            why = G.check_chunk(words, dur, aligned, rate_test=len(words) >= MIN_RATE_WORDS)
            if why is None:
                if wt is None:  # the reply's characters did not match the text: take the aligner's times
                    wt = G.fill([None if x is None else (x[0] * spf, x[1] * spf) for x in aligned[0]])
                if fresh:
                    os.makedirs(G.CACHE, exist_ok=True)
                    sf.write(cf + '.part.flac', audio, SR, subtype='PCM_16'); os.replace(cf + '.part.flac', cf + '.flac')
                    json.dump({'words': wt}, open(cf + '.json', 'w'))
                break
            print(f'narrate: block {b["i"]} failed the alignment check ({why}); '
                  f'{"speaking it again" if attempt < G.SPEAK_TRIES - 1 else "giving up"}', file=sys.stderr, flush=True)
            if not fresh:
                for ext in ('.flac', '.json'):
                    if os.path.exists(cf + ext):
                        os.remove(cf + ext)
        if why is not None:
            os.makedirs(G.CACHE, exist_ok=True)
            with open(G.cache_path(voice, 'eleven:' + text)[:-5] + '.rejected', 'w') as f:
                f.write(time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime()))
            sys.exit(f'narrate: block {b["i"]} would not align after {G.SPEAK_TRIES} tries ({why}); '
                     f'nothing is placed by guesswork. It reads: {text[:160]!r}')
        # Trim to the words, with air, and fade the cut.
        s, e = wt[0][0], wt[-1][1]
        lo, hi = max(0.0, s - G.LEAD), min(dur, e + G.TAIL)
        piece = G.faded(audio[int(lo * SR):int(hi * SR)], SR)
        pieces[b['i']] = (piece, [(min(max(0.0, x - lo), hi - lo), min(max(0.0, y - lo), hi - lo)) for x, y in wt])
        if (k + 1) % 10 == 0 or k + 1 == len(order):
            print(f'  {k + 1}/{len(order)} blocks', flush=True)

    audio_parts, cursor, blocks_out = [], 0.0, []
    for b in SCRIPT['blocks']:
        if not b.get('read'):
            blocks_out.append({**b, 'start': cursor, 'end': cursor, 'words': []})
            continue
        kind = b['kind']
        gap = GAP_BEFORE.get(kind, 0.5)
        audio_parts.append(np.zeros(int(gap * SR), dtype=np.float32)); cursor += gap
        spoken, spans, sw, said, owner = prepared[b['i']]
        piece, saidt = pieces.get(b['i'], (np.zeros(0, dtype=np.float32), []))
        dur = len(piece) / SR
        sp = [None] * len(sw)
        for (x, y), si in zip(saidt, owner):
            sp[si] = (x, y) if sp[si] is None else (min(sp[si][0], x), max(sp[si][1], y))
        sp = G.fill(sp)
        words = [{'w': tok, 's': round(cursor + sp[i0][0], 3), 'e': round(cursor + sp[i1][1], 3)} for tok, i0, i1 in spans]
        start = cursor
        audio_parts.append(piece.astype(np.float32)); cursor += dur
        after = GAP_AFTER.get(kind, 0.0)
        audio_parts.append(np.zeros(int(after * SR), dtype=np.float32)); cursor += after
        blocks_out.append({**b, 'spoken': spoken, 'start': round(start, 3), 'end': round(start + dur, 3), 'words': words})

    audio = np.concatenate(audio_parts) if audio_parts else np.zeros(0, dtype=np.float32)
    sf.write(f'{DIR}/narration.wav', audio, SR)
    json.dump({'voice': voice, 'speed': 1.0, 'model': MODEL, 'sr': SR, 'duration': round(len(audio) / SR, 3), 'blocks': blocks_out},
              open(f'{DIR}/narration.json', 'w'), indent=1)
    time.sleep(3)  # the subscription count lags a request by a moment
    used1, _, _ = credits(key)
    cost = f', {used1 - used0} credits for {asked_chars} characters' if used0 is not None and used1 is not None else ''
    print(f'narrate: {len(audio) / SR / 60:.1f} min of narration in {(time.time() - t0) / 60:.1f} min wall, '
          f'{asked} request(s) to ElevenLabs, {len(order) - asked} block(s) from the cache{cost}', flush=True)
