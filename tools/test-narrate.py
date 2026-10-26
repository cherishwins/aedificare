"""The narrator's number normaliser, tested on the forms the pages print.

tools/narrate.py's normalise() turns each token of a read block into the
words the voice is sent, before narrate_gemini.spell writes the numbers
out. It exists because of one defect that reached three released films:
"$1 billion" is two tokens, "$1" became "1 dollars" and "billion" followed,
so The Countersign was voiced saying "1 dollars billion" seven times, The
Markup four and The Subtraction once (found 26 Oct 2026). Every case here
is a form a published page prints; a new money or unit form a page brings
in belongs here first.

narrate.py reads a render directory at import, so this executes only the
normaliser's slice of the file. Run by verify.yml: python3 -I tools/test-narrate.py
"""
import re
import sys
from pathlib import Path

src = (Path(__file__).parent / 'narrate.py').read_text(encoding='utf8')
ns = {'re': re}
exec(src[src.index('UNITS = {'):src.index('\nALNUM = ')], ns)
normalise = ns['normalise']

CASES = [
    # money with the scale word as its own token: the dollars wait for it
    ('worth more than $1 billion.', 'worth more than 1 billion dollars.'),
    ('it peaked near $1.35 billion. [15]', 'it peaked near 1.35 billion dollars. [15]'),
    ('pumped it to about $25 million and cashed out.', 'pumped it to about 25 million dollars and cashed out.'),
    ('once worth $2.4 billion, was declared', 'once worth 2.4 billion dollars, was declared'),
    ('a $4.4 billion contract', 'a 4.4 billion dollars contract'),
    ('(about $550 million)', '(about 550 million dollars)'),
    ('$1 trillion', '1 trillion dollars'),
    # money with its scale as a suffix, or none
    ('sent it $50,000 in Bitcoin.', 'sent it 50,000 dollars in Bitcoin.'),
    ('a $5.1M award', 'a 5.1 million dollars award'),
    ('costs $14.99 today', 'costs 14.99 dollars today'),
    ('$400. Then', '400 dollars. Then'),
    ('$18,214 a radio', '18,214 dollars a radio'),
    # not money, or not a scale that follows the figure
    ('a thousand agents', 'a thousand agents'),
    ('at $1, billion', 'at 1 dollars, billion'),
    ('~$600K netted', '~$600K netted'),
    # units
    ('at 8 MHz the MM8108', 'at 8 megahertz the MM8108'),
    ('about 15 Mbps each way', 'about 15 megabits per second each way'),
    ('fell 98.9%', 'fell 98.9 percent'),
    ('a 2019–2024 window', 'a 2019 to 2024 window'),
]

bad = 0
for text, want in CASES:
    got, spans = normalise(text)
    kept = [t for t in text.split() if normalise(t)[0] != '']
    words = got.split()
    ok = (got == want
          and [s[0] for s in spans] == kept                                    # one span per original token
          and all(0 <= a <= b < len(words) for _, a, b in spans)                # inside the spoken words
          and all(spans[i][2] < spans[i + 1][1] for i in range(len(spans) - 1)))  # in order, not overlapping
    if not ok:
        bad += 1
        print(f'test-narrate: FAIL {text!r} -> {got!r}; spans {spans}')
if bad:
    print(f'test-narrate: {bad} of {len(CASES)} forms wrong')
    sys.exit(1)
print(f'test-narrate: {len(CASES)} forms read as written, one span per token')
