"""
The Gemini voice for tools/narrate.py (imported from there, run in its uv
environment; see its docstring for why). One entry point, narrate_gemini(),
which writes <dir>/narration.wav and <dir>/narration.json in exactly the shape
the Kokoro path writes them.

  speak:  consecutive read blocks are joined into chunks of about two minutes
          and spoken by gemini-3.8-flash-tts in one stored voice, one style.
  align:  facebook/wav2vec2-base-960h gives per-frame character probabilities;
          a CTC Viterbi pass forces the known words onto them, so every word
          has a start and an end in the chunk.
  cut:    each block is cut out of its chunk at its first and last word and
          laid out with the same gaps the Kokoro path uses.

Numbers are spelled out before Gemini sees them (5.1 -> five point one, 2024
-> twenty twenty-four, 18,214 -> eighteen thousand two hundred and fourteen),
so the words it says are the words the aligner looks for, and every ORIGINAL
token keeps the time of the words it became.
"""
import base64
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
CHUNK_CHARS = 2000
ALIGN_MODEL = 'facebook/wav2vec2-base-960h'
ALIGN_SR = 16000
WINDOW_S = 15  # wav2vec2 attention is quadratic in length; emissions are computed in windows


# ---- numbers to words ---------------------------------------------------------
def spell(word):
    """One spoken word (after narrate.normalise) -> the words to say. Punctuation stays on the last."""
    from num2words import num2words
    lead = re.match(r'^[\(\["“‘]*', word).group(0)
    trail = re.search(r'[\)\]"”’.,;:!?]*$', word).group(0)
    core = word[len(lead):len(word) - len(trail)] if trail else word[len(lead):]
    out = []
    if core.startswith('$') and re.search(r'\d', core):
        # normalise() already says money; this catches a figure it passed through raw.
        out = spell(core[1:]) + ['dollars']
    elif re.fullmatch(r'\d{1,3}(,\d{3})+(\.\d+)?|\d+(\.\d+)?', core):
        n = core.replace(',', '')
        whole, _, frac = n.partition('.')
        if not frac and ',' not in core and len(whole) == 4 and 1100 <= int(whole) <= 2099:
            out = num2words(int(whole), to='year').split()
        else:
            out = num2words(int(whole)).split()
            if frac:
                out += ['point'] + [num2words(int(d)) for d in frac]
    elif re.fullmatch(r'(\d+)(st|nd|rd|th)', core):
        out = num2words(int(re.match(r'\d+', core).group(0)), to='ordinal').split()
    elif re.search(r'\d', core):
        # Letters and digits together (GPT-2, Qwen3, 4K): each run said as itself.
        for run in re.findall(r'[A-Za-z]+|\d[\d,]*(?:\.\d+)?|=', core):
            out += ['equals'] if run == '=' else spell(run) if run[0].isdigit() else [run]
    else:
        out = [core] if core else []
    out = [w for x in out for w in x.replace('-', ' ').replace(',', '').split()]
    if not out:
        return [lead + trail] if (lead + trail).strip() else []
    out[0] = lead + out[0]
    out[-1] = out[-1] + trail
    return out


def key(w):
    return re.sub(r"[^A-Z']", '', w.upper())


# ---- Gemini -------------------------------------------------------------------
def gemini_speak(text, voice, api_key):
    body = json.dumps({
        'model': MODEL,
        'input': [{'type': 'user_input', 'content': [{'type': 'text', 'text': text,
                                                       'annotations': [{'type': 'speech_metadata', 'style': STYLE}]}]}],
        'response_format': {'type': 'audio'},
        'generation_config': {'speech_config': [{'voice': voice}]},
    }).encode()
    delay = 10
    for attempt in range(8):
        req = urllib.request.Request(f'{API}/interactions', data=body, method='POST',
                                     headers={'x-goog-api-key': api_key, 'content-type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                res = json.loads(r.read())
            audio = next((c for s in res.get('steps', []) if s.get('type') == 'model_output'
                          for c in s.get('content', []) if c.get('type') == 'audio'), None)
            if not audio or not audio.get('data'):
                raise RuntimeError(f'no audio in the reply: {json.dumps(res)[:400]}')
            a, sr = sf.read(io.BytesIO(base64.b64decode(audio['data'])), dtype='float32')
            if a.ndim > 1:
                a = a.mean(axis=1)
            return a, sr
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='replace')
            if e.code == 404 or 'not found' in msg.lower() and 'voice' in msg.lower():
                sys.exit(f'narrate: voice {voice} is not in this Google project ({e.code}): {msg[:300]}\n'
                         'narrate: refusing to fall back to another voice; the channel speaks in one voice')
            if e.code in (429, 500, 502, 503, 504) and attempt < 7:
                m = re.search(r'"retryDelay":\s*"(\d+)', msg)
                wait = int(m.group(1)) + 2 if m else delay
                print(f'narrate: Gemini {e.code}, retrying in {wait}s', file=sys.stderr, flush=True)
                time.sleep(wait)
                delay = min(delay * 2, 120)
                continue
            sys.exit(f'narrate: Gemini refused ({e.code}): {msg[:600]}')
    sys.exit('narrate: Gemini kept refusing; giving up')


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
    """CTC Viterbi (as in the torchaudio forced-alignment tutorial) -> [(start_frame, end_frame) or None] per word."""
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
    t, j = T - 1, N - 1
    frames = [[] for _ in range(N)]
    frames[j].append(t)
    while j > 0:
        if t <= 0:
            return None
        stayed = trellis[t - 1, j] + em[t - 1, blank]
        changed = trellis[t - 1, j - 1] + em[t - 1, tok[j]]
        t -= 1
        if changed > stayed:
            j -= 1
        frames[j].append(t)
    spans = [None] * len(words)
    for ti, wi in enumerate(owner):
        if wi < 0 or not frames[ti]:
            continue
        a, b = min(frames[ti]), max(frames[ti]) + 1
        spans[wi] = (a, b) if spans[wi] is None else (min(spans[wi][0], a), max(spans[wi][1], b))
    return spans


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


# ---- the film -------------------------------------------------------------------
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
    order = [b for b in SCRIPT['blocks'] if b.get('read')]
    chunks, cur, size = [], [], 0
    for b in order:
        n = len(' '.join(prepared[b['i']][3]))
        if cur and size + n > CHUNK_CHARS:
            chunks.append(cur); cur, size = [], 0
        cur.append(b); size += n + 2
    if cur:
        chunks.append(cur)
    print(f'narrate: Gemini {MODEL}, voice {voice}, {len(order)} blocks in {len(chunks)} chunks', flush=True)

    pieces = {}  # block index -> (audio at SR, [(start, end) per said word, seconds from the cut])
    misaligned = 0
    for ci, chunk in enumerate(chunks):
        text = '\n\n'.join(' '.join(prepared[b['i']][3]) for b in chunk)
        audio, sr = gemini_speak(text, voice, api_key)
        if sr != SR:
            import torch
            audio = torch.nn.functional.interpolate(torch.from_numpy(audio)[None, None], scale_factor=SR / sr, mode='linear', align_corners=False)[0, 0].numpy()
        dur = len(audio) / SR
        words = [w for b in chunk for w in prepared[b['i']][3]]
        spans = None
        try:
            em, spf = emissions(audio, SR)
            spans = force_align(em, words)
        except Exception as e:  # noqa: BLE001 - any aligner failure falls back to proportional timing, loudly
            print(f'narrate: aligner failed on chunk {ci}: {e}', file=sys.stderr)
        if spans is None or sum(x is not None for x in spans) < 0.5 * len(words):
            misaligned += 1
            print(f'narrate: proportional timing for chunk {ci} ({len(chunk)} blocks)', file=sys.stderr)
            n = max(len(words), 1)
            times = [((k / n) * dur, ((k + 1) / n) * dur) for k in range(len(words))]
        else:
            times = fill([None if x is None else (x[0] * spf, x[1] * spf) for x in spans])
        # Cut each block at its first and last word, with a little air, never past its neighbours.
        k = 0
        bounds = []
        for b in chunk:
            n = len(prepared[b['i']][3])
            bt = times[k:k + n]
            bounds.append((bt[0][0] if bt else 0.0, bt[-1][1] if bt else 0.0, bt))
            k += n
        for bi, (b, (s, e, bt)) in enumerate(zip(chunk, bounds)):
            lo = max(0.0, s - 0.06) if bi == 0 else max((bounds[bi - 1][1] + s) / 2, s - 0.06)
            hi = min(dur, e + 0.15) if bi == len(chunk) - 1 else min((e + bounds[bi + 1][0]) / 2, e + 0.15)
            piece = audio[int(lo * SR):int(hi * SR)]
            pieces[b['i']] = (piece, [(max(0.0, x - lo), max(0.0, y - lo)) for x, y in bt])
        print(f'  chunk {ci + 1}/{len(chunks)}: {len(chunk)} blocks, {dur:.1f}s', flush=True)

    audio_parts, cursor, blocks_out = [], 0.0, []
    for b in SCRIPT['blocks']:
        if not b.get('read'):
            blocks_out.append({**b, 'start': cursor, 'end': cursor, 'words': []})
            continue
        kind = b['kind']
        gap = GAP_BEFORE.get(kind, 0.5)
        audio_parts.append(np.zeros(int(gap * SR), dtype=np.float32)); cursor += gap
        spoken, spans, sw, said, owner = prepared[b['i']]
        piece, saidt = pieces[b['i']]
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
          f'{misaligned} chunk(s) proportional', flush=True)
