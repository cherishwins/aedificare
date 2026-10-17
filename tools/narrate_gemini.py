"""
The Gemini voice for tools/narrate.py (imported from there, run in its uv
environment; see its docstring for why). One entry point, narrate_gemini(),
which writes <dir>/narration.wav and <dir>/narration.json in exactly the shape
the Kokoro path writes them.

  speak:  consecutive read blocks are joined into chunks of about four minutes
          and spoken by gemini-3.8-flash-tts in one stored voice, one style.
  align:  facebook/wav2vec2-base-960h gives per-frame character probabilities;
          a CTC Viterbi pass forces the known words onto them, so every word
          has a start and an end in the chunk.
  check:  forcing always succeeds, so the alignment is then scored: a chunk
          whose speech rate is impossible or whose words land on audio that
          does not say them (Gemini stopped early, skipped or garbled a
          passage) is spoken again, and a chunk that fails three times fails
          the run. Nothing is ever placed by proportion.
  cut:    each block is cut out of its chunk at its first and last word, with
          a short fade, and laid out with the same gaps the Kokoro path uses.

Numbers are spelled out before Gemini sees them (5.1 -> five point one, 2024
-> twenty twenty-four, -98.9% -> minus ninety-eight point nine percent,
21/4 -> twenty-one over four), so the words it says are the words the aligner
looks for, and every ORIGINAL token keeps the time of the words it became.

THE CACHE AND THE QUOTA. Every chunk that passes the check is kept in
NARRATION_CACHE (default ~/.cache/aedificare-narration), keyed by the model,
the voice, the style and the exact text, so a rerun pays only for chunks it
has not heard and a changed sentence costs one chunk, not a film. The free
tier allows 10 requests a day (found 2026-10-17, when six films dispatched at
once all stopped on it), so when Google says the day's quota is spent the run
stops at once with exit code 75 and the chunks it did get are already kept;
the workflows carry the cache between runs, and the next day's run continues
where this one stopped.
"""
import base64
import hashlib
import http.client
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

import numpy as np
import soundfile as sf

API = 'https://generativelanguage.googleapis.com/v1beta'
MODEL = 'gemini-3.8-flash-tts'
# The delivery, the same for every film so only the words change between them.
STYLE = ('Dry, deadpan documentary narration. Measured and unhurried, precise on every number, '
         'no enthusiasm and no upward inflection; let the understatement land with a small pause '
         'before the last clause of a joke. Never theatrical.')
CHUNK_CHARS = 3500  # about four minutes; a 13-minute film is four requests of the ten a day
ALIGN_MODEL = 'facebook/wav2vec2-base-960h'
ALIGN_SR = 16000
WINDOW_S = 15  # wav2vec2 attention is quadratic in length; emissions are computed in windows
CACHE = os.path.expanduser(os.environ.get('NARRATION_CACHE') or '~/.cache/aedificare-narration')
QUOTA_EXIT = 75  # EX_TEMPFAIL: the day's quota is spent; rerun after Google's reset
MAX_WAIT = 300   # a retry Google asks for beyond this is a quota, not a hiccup
SPEAK_TRIES = 3  # a chunk that fails the alignment check is spoken again, then the run fails
LEAD, TAIL, FADE = 0.2, 0.15, 0.01  # seconds of air before the first word and after the last; fade at each cut
# The check (check_chunk), calibrated 2026-10-17 on the Gemini voice samples (three voices, the passage of
# tools/voice-samples.mjs) and on Kokoro reading 3,400-character chunks of four films: clean audio scored at most
# 3.6 percent of words below BAD_WORD and never two in a row; the same audio truncated to 92 or 85 percent, with a
# 15 percent hole, or with six words added to the text that it does not say, scored runs of 6 to 70 bad words.
RATE_LO, RATE_HI = 1.0, 4.2   # words a second; deadpan Gemini reads at 2.1 to 2.4
BAD_WORD, BAD_SHARE, BAD_RUN = -6.0, 0.1, 5


class Quota(Exception):
    pass


# ---- numbers to words ---------------------------------------------------------
NUM = r'\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?'
TOKEN = re.compile(rf"(?P<num>{NUM})(?P<ord>st|nd|rd|th)?|(?P<word>[^\W\d_]+(?:['’][^\W\d_]+)*)|(?P<sym>\S)")
SYMBOL = {'=': ['equals'], '+': ['plus'], '%': ['percent'], '&': ['and'], '×': ['times'], '~': ['about'],
          '≈': ['about'], '<': ['less', 'than'], '>': ['more', 'than'], '≤': ['at', 'most'], '≥': ['at', 'least'],
          '°': ['degrees']}
SCALE = {'K': 'thousand', 'M': 'million', 'B': 'billion', 'T': 'trillion', 'bn': 'billion', 'tn': 'trillion'}
DASH = '-−–'


def number(s, year_ok):
    from num2words import num2words
    n = s.replace(',', '')
    whole, _, frac = n.partition('.')
    if year_ok and not frac and ',' not in s and len(whole) == 4 and 1100 <= int(whole) <= 2099:
        return num2words(int(whole), to='year').split()
    out = num2words(int(whole)).split()
    if frac:
        out += ['point'] + [num2words(int(d)) for d in frac]
    return out


def digits(s):
    """A code read digit by digit: 0909 -> oh nine oh nine."""
    from num2words import num2words
    return ['oh' if d == '0' else num2words(int(d)) for d in s]


def name_number(s):
    """A number that is part of a name, read the way people say it: GPT-4 four, AES-256 two fifty-six,
    MIL-STD-810G eight ten, Curve25519 two five five one nine."""
    from num2words import num2words
    if s.startswith('0') or len(s) > 3:
        return digits(s)
    if len(s) == 3 and int(s) % 100:
        return [num2words(int(s[0]))] + (['oh', num2words(int(s[2]))] if s[1] == '0' else num2words(int(s[1:])).split())
    return num2words(int(s)).split()


def spell(word):
    """One spoken word (after narrate.normalise) -> the words to say. Punctuation stays on the last."""
    from num2words import num2words
    if re.fullmatch(r'\[\d+\][.,;:]*', word):
        return [word[word.index(']') + 1:]] if word[word.index(']') + 1:] else []  # a citation mark is seen, not said
    lead = re.match(r'^[\(\["“‘]*', word).group(0)
    trail = re.search(r'[\)\]"”’.,;:!?]*$', word).group(0)
    core = word[len(lead):len(word) - len(trail)] if trail else word[len(lead):]
    m802 = re.fullmatch(r'802\.11([a-z]*)', core)
    if m802:
        out = ['eight', 'oh', 'two', 'dot', 'eleven'] + list(m802.group(1))  # the IEEE way: eight oh two dot eleven ah
    elif not re.search(r'[\d$%=+~≈×<>≤≥°/' + DASH + ']', core) or not re.search(r'[\d=+~≈×<>≤≥%°]', core):
        out = [core] if core else []  # a plain word, hyphens and all
    else:
        toks = [(m.lastgroup if m.group('num') is None else 'num', m) for m in TOKEN.finditer(core)]
        out, money, i = [], False, 0
        while i < len(toks):
            kind, m = toks[i]
            prev = toks[i - 1][0] if i else None
            nxt = toks[i + 1] if i + 1 < len(toks) else (None, None)
            if kind == 'num':
                # A year reads as one alone (2024), as a decade (1990s) or in a range (2019-2024).
                alone = (len(toks) == 1 or (nxt[0] == 'word' and nxt[1].group(0) == 's' and i + 2 == len(toks))
                         or all(k == 'num' or (k == 'sym' and t.group(0) in DASH) for k, t in toks))
                after_word = prev == 'word' or (prev == 'sym' and toks[i - 1][1].group(0) in DASH and i > 1 and toks[i - 2][0] == 'word')
                plain = re.fullmatch(r'\d+', m.group('num')) and not m.group('ord')
                yearish = plain and len(m.group('num')) == 4 and 1100 <= int(m.group('num')) <= 2099
                decade = nxt[0] == 'word' and nxt[1].group(0) == 's' and i + 2 == len(toks)
                alone = alone or (yearish and (after_word or decade))  # mid-2024, late-1990s
                if plain and after_word and not money and not yearish:
                    out += name_number(m.group('num'))
                elif plain and m.group('num').startswith('0') and len(m.group('num')) > 1:
                    out += digits(m.group('num'))  # a code: NS-01, seed 0909
                elif m.group('ord'):
                    out += num2words(int(m.group('num').replace(',', '')), to='ordinal').split()
                else:
                    said = number(m.group('num'), year_ok=alone and not money)
                    if decade and alone:  # the 1990s
                        said[-1] = said[-1][:-1] + 'ies' if said[-1].endswith('y') else said[-1] + 's'
                        i += 1
                    out += said
                if money:
                    if nxt[0] == 'word' and nxt[1].group(0) in SCALE:
                        out.append(SCALE[nxt[1].group(0)]); i += 1
                    out.append('dollars'); money = False
                elif nxt[0] == 'word' and nxt[1].group(0) == 'x' and i + 2 == len(toks):  # 10x
                    out.append('times'); i += 1
                elif nxt[0] == 'word' and nxt[1].group(0) in ('M', 'B', 'T') and i + 2 == len(toks):  # 27B parameters
                    out.append(SCALE[nxt[1].group(0)]); i += 1
            elif kind == 'word':
                out.append(m.group(0))
            else:
                s = m.group(0)
                if s == '$':
                    money = True
                elif s in DASH:
                    if prev == 'num' and nxt[0] == 'num':
                        out.append('to')
                    elif prev not in ('word', 'num') and (nxt[0] == 'num' or (nxt[0] == 'sym' and nxt[1].group(0) == '$')):
                        out.append('minus')  # -98.9%, r = −0.619; the hyphen in GPT-2 is not said
                elif s == '/':
                    if prev == 'num' and nxt[0] == 'num':
                        out.append('over')
                elif s in SYMBOL:
                    out += SYMBOL[s]
                # anything else (a stray comma, a dot in a version, a quote) is not said
            i += 1
    out = [w for x in out for w in x.replace('-', ' ').replace(',', '').split()]
    if not out:
        return [lead + trail] if (lead + trail).strip() else []
    out[0] = lead + out[0]
    out[-1] = out[-1] + trail
    return out


def key(w):
    return re.sub(r"[^A-Z']", '', w.upper().replace('’', "'"))


# ---- Gemini -------------------------------------------------------------------
def retry_after(msg):
    """Seconds Google asks us to wait, from a retryDelay field or a 'retry in 13h18m20s' sentence, else None."""
    m = re.search(r'"retryDelay":\s*"([\d.]+)s"', msg)
    if m:
        return float(m.group(1))
    m = re.search(r'retry in ((?:\d+h)?(?:\d+m(?!s))?(?:[\d.]+s)?)', msg)
    if m and m.group(1):
        h = re.search(r'(\d+)h', m.group(1)); mi = re.search(r'(\d+)m(?!s)', m.group(1)); s = re.search(r'([\d.]+)s', m.group(1))
        return (int(h.group(1)) * 3600 if h else 0) + (int(mi.group(1)) * 60 if mi else 0) + (float(s.group(1)) if s else 0)
    return None


def gemini_speak(text, voice, api_key):
    body = json.dumps({
        'model': MODEL,
        'input': [{'type': 'user_input', 'content': [{'type': 'text', 'text': text,
                                                       'annotations': [{'type': 'speech_metadata', 'style': STYLE}]}]}],
        'response_format': {'type': 'audio'},
        'generation_config': {'speech_config': [{'voice': voice}]},
    }).encode()
    delay, last = 10, ''
    for attempt in range(8):
        req = urllib.request.Request(f'{API}/interactions', data=body, method='POST',
                                     headers={'x-goog-api-key': api_key, 'content-type': 'application/json'})
        wait = delay
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                res = json.loads(r.read())
            audio = next((c for s in res.get('steps', []) if s.get('type') == 'model_output'
                          for c in s.get('content', []) if c.get('type') == 'audio'), None)
            if not audio or not audio.get('data'):
                raise ValueError(f'no audio in the reply: {json.dumps(res)[:300]}')
            a, sr = sf.read(io.BytesIO(base64.b64decode(audio['data'])), dtype='float32')
            if a.ndim > 1:
                a = a.mean(axis=1)
            if not len(a):
                raise ValueError('empty audio in the reply')
            return a, sr
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='replace')
            if e.code == 404:
                if 'voice' in msg.lower():
                    sys.exit(f'narrate: voice {voice} is not in this Google project: {msg[:300]}\n'
                             'narrate: refusing to fall back to another voice; the channel speaks in one voice')
                sys.exit(f'narrate: Gemini 404, the model {MODEL} or the endpoint was not found: {msg[:300]}')
            if e.code not in (429, 500, 502, 503, 504):
                sys.exit(f'narrate: Gemini refused ({e.code}): {msg[:600]}')
            asked = retry_after(msg)
            if e.code == 429 and ('per day' in msg.lower() or (asked or 0) > MAX_WAIT):
                raise Quota(msg[:400])
            wait = min(asked + 2, MAX_WAIT) if asked is not None else delay
            last = f'{e.code}: {msg[:300]}'
        except (urllib.error.URLError, OSError, http.client.HTTPException, ValueError, RuntimeError) as e:
            # A dropped connection, a timeout, a cut-off or undecodable body, a reply with no audio: all worth another try.
            last = f'{type(e).__name__}: {str(e)[:300]}'
        if attempt < 7:
            print(f'narrate: Gemini {last.split(":")[0]}, retrying in {wait:.0f}s', file=sys.stderr, flush=True)
            time.sleep(wait)
            delay = min(delay * 2, 120)
    sys.exit(f'narrate: Gemini kept failing ({last}); giving up')


# ---- alignment ------------------------------------------------------------------
_aligner = None


def aligner():
    global _aligner
    if _aligner is None:
        import torch
        from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
        proc = Wav2Vec2Processor.from_pretrained(ALIGN_MODEL)
        model = Wav2Vec2ForCTC.from_pretrained(ALIGN_MODEL).eval()
        _aligner = (torch, proc, model)
    return _aligner


def emissions(audio, sr):
    torch, proc, model = aligner()
    x = torch.from_numpy(np.ascontiguousarray(audio, dtype=np.float32))
    if sr != ALIGN_SR:
        x = torch.nn.functional.interpolate(x[None, None], scale_factor=ALIGN_SR / sr, mode='linear', align_corners=False)[0, 0]
    out = []
    step = WINDOW_S * ALIGN_SR
    with torch.inference_mode():
        for i in range(0, len(x), step):
            seg = x[i:i + step]
            if len(seg) < 400:
                continue
            seg = (seg - seg.mean()) / (seg.std() + 1e-7)
            out.append(torch.log_softmax(model(seg[None]).logits[0], dim=-1).numpy())
    em = np.concatenate(out) if out else np.zeros((0, 32), dtype=np.float32)
    return em, (len(x) / ALIGN_SR) / max(len(em), 1)  # seconds per frame


def force_align(em, words):
    """CTC Viterbi (as in the torchaudio forced-alignment tutorial).

    Returns ([(start_frame, end_frame) or None per word], [score or None per word]), or None when the audio is too
    short to hold the words. A word's score is the mean, over its letters, of the log-probability of the letter on
    the frame the path says it: near 0 where the audio says the word, far below where the word was forced onto
    silence or onto other speech."""
    _, proc, _ = aligner()
    vocab = proc.tokenizer.get_vocab()
    blank, sep = vocab.get('<pad>', 0), vocab['|']
    toks, owner = [sep], [-1]
    for wi, w in enumerate(words):
        k = key(w)
        if not k:
            continue
        for ch in k:
            if ch in vocab:
                toks.append(vocab[ch]); owner.append(wi)
        toks.append(sep); owner.append(-1)
    T, N = len(em), len(toks)
    if T <= N:
        return None
    tok = np.array(toks)
    trellis = np.zeros((T, N), dtype=np.float64)
    trellis[1:, 0] = np.cumsum(em[1:, blank])
    trellis[0, 1:] = -np.inf
    trellis[-N + 1:, 0] = np.inf
    for t in range(T - 1):
        trellis[t + 1, 1:] = np.maximum(trellis[t, 1:] + em[t, blank], trellis[t, :-1] + em[t, tok[1:]])
    # Walking back from (T-1, N-1): a step from (t-1, j-1) means frame t-1 SAID token j, a step from (t-1, j) means
    # frame t-1 was blank after it; both frames belong to token j. (The tutorial files the saying frame under j-1,
    # one frame early for the next token's owner and late for this one; the score below needs the right frame.)
    t, j = T - 1, N - 1
    frames, said = [[] for _ in range(N)], [None] * N
    while j > 0:
        if t <= 0:
            return None
        stayed = trellis[t - 1, j] + em[t - 1, blank]
        changed = trellis[t - 1, j - 1] + em[t - 1, tok[j]]
        t -= 1
        frames[j].append(t)
        if changed > stayed:
            said[j] = float(em[t, tok[j]])
            j -= 1
    spans, letters = [None] * len(words), [[] for _ in words]
    for ti, wi in enumerate(owner):
        if wi < 0 or not frames[ti]:
            continue
        a, b = min(frames[ti]), max(frames[ti]) + 1
        spans[wi] = (a, b) if spans[wi] is None else (min(spans[wi][0], a), max(spans[wi][1], b))
        letters[wi].append(said[ti] if said[ti] is not None else -np.inf)
    return spans, [float(np.mean(x)) if x else None for x in letters]


def check_chunk(words, dur, aligned):
    """None when the alignment is believable, else why not. Forcing always places every word, so this is the gate."""
    if aligned is None:
        return 'the audio is too short to hold the words'
    spans, scores = aligned
    n = sum(s is not None for s in spans)
    rate = n / max(dur, 1e-6)
    if not RATE_LO <= rate <= RATE_HI:
        return f'{rate:.1f} words a second is not speech'
    bad = [s is not None and s < BAD_WORD for s in scores]
    share = sum(bad) / max(n, 1)
    run = best = 0
    for b in bad:
        run = run + 1 if b else 0
        best = max(best, run)
    if share > BAD_SHARE:
        return f'{share:.0%} of the words are not in the audio'
    if best >= BAD_RUN:
        return f'a run of {best} words is not in the audio (a skipped or garbled passage)'
    return None


def fill(times):
    """Words the aligner could not place (no letters) take the end of the word before them."""
    last = 0.0
    out = []
    for x in times:
        if x is None:
            out.append((last, last))
        else:
            out.append(x); last = x[1]
    return out


# ---- the cache ------------------------------------------------------------------
def cache_path(voice, text):
    h = hashlib.sha256(json.dumps([MODEL, voice, STYLE, text]).encode()).hexdigest()[:32]
    return os.path.join(CACHE, f'{h}.flac')


def cached(voice, text):
    p = cache_path(voice, text)
    if not os.path.exists(p):
        return None
    try:
        a, sr = sf.read(p, dtype='float32')
        return a, sr
    except Exception:  # noqa: BLE001 - a damaged cache file is only a chunk to speak again
        os.remove(p)
        return None


def keep(voice, text, audio, sr):
    os.makedirs(CACHE, exist_ok=True)
    p = cache_path(voice, text)
    sf.write(p + '.part.flac', audio, sr, subtype='PCM_16')
    os.replace(p + '.part.flac', p)


# ---- the film -------------------------------------------------------------------
def resample(audio, sr, to):
    if sr == to:
        return audio
    import torch
    return torch.nn.functional.interpolate(torch.from_numpy(np.ascontiguousarray(audio))[None, None], scale_factor=to / sr,
                                           mode='linear', align_corners=False)[0, 0].numpy()


def faded(piece, sr):
    n = min(int(FADE * sr), len(piece) // 2)
    if n > 0:
        piece = piece.copy()
        ramp = np.linspace(0.0, 1.0, n, dtype=np.float32)
        piece[:n] *= ramp
        piece[-n:] *= ramp[::-1]
    return piece


def narrate_gemini(DIR, SCRIPT, voice, normalise, GAP_BEFORE, GAP_AFTER, SR):
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        sys.exit('narrate: NARRATOR is gemini but GEMINI_API_KEY is not set')
    t0 = time.time()
    # Every read block, normalised (money and units) and spelled (numbers), with the map back to its original tokens.
    prepared = {}
    for b in SCRIPT['blocks']:
        if not b.get('read'):
            continue
        spoken, spans = normalise(b['text'])
        sw = spoken.split()
        said, owner = [], []  # the words Gemini says, and which spoken word each came from
        for si, w in enumerate(sw):
            for x in spell(w):
                said.append(x); owner.append(si)
        prepared[b['i']] = (spoken, spans, sw, said, owner)
    order = [b for b in SCRIPT['blocks'] if b.get('read') and prepared[b['i']][3]]
    chunks, cur, size = [], [], 0
    for b in order:
        n = len(' '.join(prepared[b['i']][3]))
        if cur and size + n > CHUNK_CHARS:
            chunks.append(cur); cur, size = [], 0
        cur.append(b); size += n + 2
    if cur:
        chunks.append(cur)
    texts = ['\n\n'.join(' '.join(prepared[b['i']][3]) for b in chunk) for chunk in chunks]
    have = sum(os.path.exists(cache_path(voice, t)) for t in texts)
    print(f'narrate: Gemini {MODEL}, voice {voice}, {len(order)} blocks in {len(chunks)} chunks, {have} already heard',
          flush=True)

    pieces = {}  # block index -> (audio at SR, [(start, end) per said word, seconds from the cut])
    asked = 0
    for ci, (chunk, text) in enumerate(zip(chunks, texts)):
        words = [w for b in chunk for w in prepared[b['i']][3]]
        why = None
        for attempt in range(SPEAK_TRIES):
            got = cached(voice, text) if attempt == 0 else None
            fresh = got is None
            if fresh:
                try:
                    got = gemini_speak(text, voice, api_key)
                except Quota as q:
                    done = sum(os.path.exists(cache_path(voice, t)) for t in texts)
                    print(f'narrate: the day\'s Gemini quota is spent ({q}).\n'
                          f'narrate: {done} of {len(chunks)} chunks are kept in {CACHE}; rerun after the reset to continue',
                          file=sys.stderr, flush=True)
                    sys.exit(QUOTA_EXIT)
                asked += 1
            audio = resample(*got, SR)
            dur = len(audio) / SR
            em, spf = emissions(audio, SR)  # an aligner that cannot load or run fails the run: it never guesses
            aligned = force_align(em, words)
            why = check_chunk(words, dur, aligned)
            if why is None:
                if fresh:
                    keep(voice, text, *got)
                break
            print(f'narrate: chunk {ci + 1} failed the alignment check ({why}); '
                  f'{"speaking it again" if attempt < SPEAK_TRIES - 1 else "giving up"}', file=sys.stderr, flush=True)
            if not fresh:
                os.remove(cache_path(voice, text))
        if why is not None:
            sys.exit(f'narrate: chunk {ci + 1} of {len(chunks)} would not align after {SPEAK_TRIES} tries ({why}); '
                     'nothing is placed by guesswork')
        spans, scores = aligned
        raw = [None if x is None else (x[0] * spf, x[1] * spf) for x in spans]
        times = fill(raw)
        # Cut each block at its first and last placed word, with air, never past the midpoint to its neighbours.
        k, bounds = 0, []
        for b in chunk:
            n = len(prepared[b['i']][3])
            placed = [x for x in raw[k:k + n] if x is not None]
            bounds.append((placed[0][0], placed[-1][1]) if placed else None)
            k += n
        k = 0
        for bi, b in enumerate(chunk):
            n = len(prepared[b['i']][3])
            bt = times[k:k + n]
            k += n
            if bounds[bi] is None:  # a block with nothing the aligner can hear (all symbols): no audio, no time
                pieces[b['i']] = (np.zeros(0, dtype=np.float32), [(0.0, 0.0)] * n)
                continue
            s, e = bounds[bi]
            before = next((x[1] for x in reversed(bounds[:bi]) if x), None)
            after = next((x[0] for x in bounds[bi + 1:] if x), None)
            lo = max(0.0, s - LEAD) if before is None else max((before + s) / 2, s - LEAD)
            hi = min(dur, e + TAIL) if after is None else min((e + after) / 2, e + TAIL)
            piece = faded(audio[int(lo * SR):int(hi * SR)], SR)
            pieces[b['i']] = (piece, [(min(max(0.0, x - lo), hi - lo), min(max(0.0, y - lo), hi - lo)) for x, y in bt])
        good = [x for x in scores if x is not None]
        print(f'  chunk {ci + 1}/{len(chunks)}: {len(chunk)} blocks, {dur:.1f}s, '
              f'{len(words) / dur:.1f} words/s, word score median {np.median(good):.2f}', flush=True)

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
        # Said words -> spoken words (the union of what each became) -> original tokens.
        sp = [None] * len(sw)
        for (x, y), si in zip(saidt, owner):
            sp[si] = (x, y) if sp[si] is None else (min(sp[si][0], x), max(sp[si][1], y))
        sp = fill(sp)
        words = []
        for tok, i0, i1 in spans:
            words.append({'w': tok, 's': round(cursor + sp[i0][0], 3), 'e': round(cursor + sp[i1][1], 3)})
        start = cursor
        audio_parts.append(piece.astype(np.float32)); cursor += dur
        after = GAP_AFTER.get(kind, 0.0)
        audio_parts.append(np.zeros(int(after * SR), dtype=np.float32)); cursor += after
        blocks_out.append({**b, 'spoken': spoken, 'start': round(start, 3), 'end': round(start + dur, 3), 'words': words})

    audio = np.concatenate(audio_parts) if audio_parts else np.zeros(0, dtype=np.float32)
    sf.write(f'{DIR}/narration.wav', audio, SR)
    json.dump({'voice': voice, 'speed': 1.0, 'model': MODEL, 'sr': SR, 'duration': round(len(audio) / SR, 3), 'blocks': blocks_out},
              open(f'{DIR}/narration.json', 'w'), indent=1)
    print(f'narrate: {len(audio) / SR / 60:.1f} min of narration in {(time.time() - t0) / 60:.1f} min wall, '
          f'{asked} request(s) to Gemini, {len(chunks) - asked} chunk(s) from the cache', flush=True)
