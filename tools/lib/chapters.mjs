/**
 * Chapters as YouTube shows them (support.google.com/youtube/answer/9884579): three or more, the first at 0:00, and
 * none under ten seconds. One short chapter switches the whole list off, which is what four films had on 18 Oct 2026
 * (a section heading read just before the next one: "Where it is wrong", 3 s). So a chapter under ten seconds is
 * merged into the one before it, the first (at 0:00) absorbing the one after, and a list left under three is dropped.
 * The film generator fits its list before it writes the description; the uploader and the channel tool fit any
 * description they send or compare, so a render filed before this rule existed is repaired by a sync, not a render.
 */

const MIN = 10;

/** entries: [{ t: seconds, text }] in order, the first at 0. total: the video's length in seconds. */
export function fitChapters(entries, total) {
  const out = entries.map((c) => ({ ...c }));
  for (let i = 0; i < out.length;) {
    const end = out[i + 1]?.t ?? total;
    if (end - out[i].t >= MIN || out.length === 1) { i++; continue; }
    // The first chapter must stay at 0:00, so it takes over the next one's span; any other joins the one before it.
    if (i === 0) out.splice(1, 1); else out.splice(i, 1);
    if (i > 0) i--;
  }
  return out.length >= 3 ? out : [];
}

const LINE = /^(?:(\d+):)?(\d{1,2}):(\d\d) (\S.*)$/;
const secs = (m) => (+(m[1] || 0)) * 3600 + (+m[2]) * 60 + (+m[3]);
const stamp = (t) => {
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60);
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
};

/** The description with its chapter run (the lines from "0:00 ..." on) fitted to YouTube's rule; anything else untouched. */
export function fitDescription(description, total) {
  const lines = String(description || '').split('\n');
  const start = lines.findIndex((l) => /^0:00 \S/.test(l));
  if (start < 0 || !total) return description;
  let end = start;
  while (end < lines.length && LINE.test(lines[end])) end++;
  const entries = lines.slice(start, end).map((l) => { const m = LINE.exec(l); return { t: secs(m), text: m[4] }; });
  const fitted = fitChapters(entries, total).map((c) => `${stamp(c.t)} ${c.text}`);
  // A list that no longer qualifies leaves the run and the blank line after it, so the description does not open on a gap.
  const after = !fitted.length && lines[end] === '' ? end + 1 : end;
  return [...lines.slice(0, start), ...fitted, ...lines.slice(after)].join('\n');
}
