/**
 * Facts are not free (CLAUDE.md, override 7): every number a film puts on a computed surface, or speaks, must be on
 * the built edition page it is cut from. Lifted out of tools/cuts.mjs on 2026-10-26 so the episodes' edition films
 * (tools/episode.mjs, `edition:`) are held to the same reading of the page as the re-cut's cut lists, with no second
 * copy of it. What it reads: the built page's <main> as text, without its SVG (a path's 44.27 is not a fact), scripts,
 * styles or nav; spelled numbers read as numbers ("forty-four" is 44, "one hundred and six" 106), and a number at a
 * scale is read both ways ("8.9 million" is 8.9 and 8,900,000; "$600K", "$2.4B" the same, 26 Oct 2026), so a script
 * that says "600 thousand dollars" is found on a page that prints $600,000. A chart row with display text
 * (`Label=0.05 ($50K)`) shows that text, so the text is what is checked; the value beneath it is placement.
 */
import fs from 'node:fs';
import path from 'node:path';
import { CHART_TYPES } from './chart.mjs';

const UNITS = Object.fromEntries('zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ').map((w, i) => [w, i]));
const TENS = Object.fromEntries('twenty thirty forty fifty sixty seventy eighty ninety'.split(' ').map((w, i) => [w, 20 + 10 * i]));
const SCALES = { hundred: 100, thousand: 1e3, million: 1e6, billion: 1e9, trillion: 1e12 };
const SUFFIX = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 }; // $50K, $20M, $1B, as a card or a page abbreviates them
export const isNumWord = (t) => t.split('-').every((p) => p in UNITS || p in TENS);
/**
 * The numbers in a text, written or spelled; `pairs` is each as written with its scaled form or null ("8.9 million"
 * is [8.9, 8900000], "$50K" [50, 50000], "forty-four" [44, null]); `primary` and `scaled` are the two columns.
 */
export function numbersIn(text) {
  const pairs = [];
  // A suffix letter counts only when no letter follows it: "19th" is 19, "10km" is 10 with its unit, "$50k" is 50 thousand.
  const toks = String(text).toLowerCase().replace(/[–—]/g, ' ').match(/\d[\d,]*(?:\.\d+)?(?:[kmbt](?![a-z]))?|[a-z]+(?:-[a-z]+)*/g) || [];
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (/\d/.test(t)) {
      const suf = /[kmbt]$/.test(t) ? SUFFIX[t.slice(-1)] : null;
      const v = +t.replace(/[kmbt]$/, '').replace(/,/g, '').replace(/\.$/, '');
      if (Number.isFinite(v)) { const sc = suf ?? SCALES[toks[i + 1]]; pairs.push([v, sc >= 1e3 ? v * sc : null]); }
      continue;
    }
    let j = i, total = 0, cur = 0, any = false;
    while (j < toks.length) {
      if (isNumWord(toks[j])) { for (const p of toks[j].split('-')) cur += UNITS[p] ?? TENS[p]; any = true; j++; }
      else if (any && toks[j] in SCALES) { if (SCALES[toks[j]] === 100) cur *= 100; else { total += cur * SCALES[toks[j]]; cur = 0; } j++; }
      else if (any && toks[j] === 'and' && toks[j + 1] && isNumWord(toks[j + 1])) j++;
      else break;
    }
    if (any) { pairs.push([total + cur, null]); i = j - 1; }
  }
  return { pairs, primary: pairs.map((p) => p[0]), scaled: pairs.map((p) => p[1]).filter((x) => x !== null) };
}
const STOPWORDS = new Set('the and for but not nor with from into onto over under this that these those its his her our are was were has had have than then what when who all any per via off out one'.split(' '));
export const contentWords = (text) => (String(text).toLowerCase().match(/[a-z]+/g) || []).filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !isNumWord(w) && !(w in SCALES));
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos|nbsp);/gi, (_, e) => (e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)) : { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[e.toLowerCase()]));

/**
 * The built page as a reader reads it: <main>, without its SVG (path coordinates are not facts), scripts, styles or
 * nav; null when dist/ has no page. `sources` counts the page's own sources list (ol.sources), as the record line
 * counts it (tools/generate-film.mjs).
 */
export function pageFacts(E) {
  const file = path.join('dist', E.path.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(file)) return null;
  let h = fs.readFileSync(file, 'utf8');
  const m = /<main\b[\s\S]*<\/main>/i.exec(h);
  if (m) h = m[0];
  const ol = /<ol\b[^>]*\bclass="[^"]*\bsources\b[^"]*"[^>]*>([\s\S]*?)<\/ol>/i.exec(h);
  const sources = ol ? (ol[1].match(/<li\b/gi) || []).length : 0;
  const text = decode(h.replace(/<(svg|script|style|template|nav)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  const n = numbersIn(text);
  const words = new Set(text.toLowerCase().match(/[a-z]+/g) || []);
  return { text, lower: text.toLowerCase(), nums: [...n.primary, ...n.scaled], words, sources };
}
export const has = (facts, v) => facts.nums.some((x) => Math.abs(x - v) <= 1e-9 * Math.max(1, Math.abs(v)));
/** A number is on the page as written or at its scale: "600 thousand" on a page that prints $600,000. */
export const found = (facts, [v, sc]) => has(facts, v) || (sc !== null && has(facts, sc));
/** The numbers in a text that the page does not carry, each as written. */
export const missingNumbers = (facts, text) => numbersIn(text).pairs.filter((p) => !found(facts, p)).map((p) => p[0]);
const ONE_SURFACE = new Set(['card', 'fig', 'over', 'title', 'pop']); // the kinds whose fields are one surface of type
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * What a computed shot puts on screen as type: [text, the words it must have on the page (true) or should (false),
 * and `verbatim` where the words are someone else's]. A title card shows the title and date it is given (`T`: the
 * edition for a cut list, titleHtml; the script's own for an episode), whatever its tag says. A quote card shows the
 * quote's words and its source line (26 Oct 2026): the source line is ours and is read like a label; the words are
 * the speaker's, read for their numbers only, never counted as display copy or held to its rules (a cut list's
 * quotes are also checked online against their source). A bars, range, stack or line row shows its display text
 * where it has one (chart.mjs `val`: the text in place of the value, or of a range's high end) and its value otherwise.
 */
export function displayed(tag, T) {
  const k = tag.kind;
  if (k === 'pop') return [[tag.text, true]];
  if (k === 'fig' || k === 'over') return [[tag.value, false], [tag.label, false]];
  if (k === 'card') return [[tag.text, false], [tag.label, false]];
  if (k === 'title') return T ? [[T.title, false], [T.dateLabel, false]] : [];
  if (k === 'quote') return [[tag.text, false, true], [tag.by, false]];
  if (k === 'map') return [[tag.label, false], ...(tag.stops || []).filter(Boolean).map((s) => [s.name, false])];
  if (k === 'chart') {
    const out = [[tag.title, false], [tag.sub, false], [tag.note, false], [tag.ref, false]];
    for (const r of tag.rows || []) {
      if (tag.type === 'timeline' || tag.type === 'flow') out.push([r.text, false], ...(tag.type === 'flow' ? [[r.from, false], [r.to, false]] : []));
      else {
        const high = r.rb !== null && r.rb !== undefined;
        out.push([r.show ? [high ? r.ra : null, r.show].filter((x) => x !== null).join(' ') : [r.ra, r.rb].filter((x) => x !== null && x !== undefined).join(' '), false], ...(tag.type === 'line' ? [] : [[r.label, false]]));
      }
    }
    return out;
  }
  return [];
}

/**
 * One shot against the page: `X.facts` is pageFacts(), `X.E` what a title card shows; `e` is { line, kind, tag };
 * issues and warnings go on `out`. Twelve words on a card means the card: its words and its label are read as one
 * surface, so they are counted together; a chart's or a map's labels are data, each read on its own, and keep the
 * count per label. A number the page does not carry is an issue; a word it does not is a warning, except on a pop,
 * which is a word the page says. A chart is also held to its form here (type, a source, one star, its dates on the
 * page) because a cut list has no other check of it; an episode's `check` holds the form itself and asks for
 * `page` only.
 */
export function facts(X, e, out, { page = false } = {}) {
  const facts = X.facts;
  if (!facts) { out.issues.push(`dist/${X.E.slug}/index.html is not built: run npm run build`); return; }
  const where = `line ${e.line}: ${e.kind}`;
  const count = (text) => String(text || '').split(/\s+/).filter((w) => /[a-z0-9$]/i.test(w)).length;
  const shown = displayed(e.tag, X.E);
  if (ONE_SURFACE.has(e.kind)) {
    const n = shown.reduce((a, [text]) => a + count(text), 0);
    if (n > 12) out.issues.push(`${where}: ${n} words of display copy on one card ("${shown.map(([t]) => t).filter(Boolean).join(' | ').slice(0, 60)}..."); twelve at most, label included`);
  }
  for (const [text, must, verbatim] of shown) {
    if (!text) continue;
    if (e.kind !== 'pop' && !verbatim && /!/.test(text)) out.issues.push(`${where}: no exclamation on a card ("${text}")`);
    const n = count(text);
    if (n > 12 && !ONE_SURFACE.has(e.kind) && !verbatim) out.issues.push(`${where}: ${n} words of display copy ("${text.slice(0, 50)}..."); twelve at most`);
    for (const v of missingNumbers(facts, text)) out.issues.push(`${where}: ${v} is not on the built page ("${text}"); facts are not free`);
    const missing = contentWords(text).filter((w) => !facts.words.has(w) && !facts.words.has(w.replace(/s$/, '')) && !facts.words.has(`${w}s`));
    if (missing.length) (must ? out.issues : out.warnings).push(`${where}: "${missing.join('", "')}" ${missing.length > 1 ? 'are' : 'is'} not on the built page ("${text}")${must ? '; a pop is a word the page says' : ''}`);
  }
  if (e.kind === 'pop') for (const x of e.tag.errors || []) out.issues.push(`line ${e.line}: ${x}`);
  if (e.kind === 'chart') {
    if (!page) {
      if (!CHART_TYPES.includes(e.tag.type)) out.issues.push(`${where}: type "${e.tag.type}" is not one of ${CHART_TYPES.join(', ')}`);
      for (const x of e.tag.errors || []) out.issues.push(`${where}: ${x}`);
      if (!e.tag.srcs.length) out.issues.push(`${where}: it cites no source (src: NN); a chart carries its own citation on screen`);
      // The Acid ledger counts a chart's stars: chartBody draws every starred row in Acid, so two stars are two Acid
      // marks in one shot (sync rule 3). A line's Acid is its series, whatever is starred.
      const stars = e.tag.type === 'line' ? 0 : (e.tag.rows || []).filter((r) => r.hot).length;
      if (stars > 1) out.issues.push(`${where}: ${stars} rows starred, each drawn in Acid; one Acid at a time (sync rule 3): star the one row the shot is for`);
    }
    // A timeline's dates are facts too, and a date is checked as the page writes one, not as three numbers: a row that
    // names a day is found with its day (until 26 Oct 2026 the month alone would do, and a wrong day in a right month
    // passed); a row of a month alone (YYYY-MM, its label starting on the month) is found by its month.
    if (e.tag.type === 'timeline') for (const r of e.tag.rows) {
      const d = new Date(r.t), y = d.getUTCFullYear(), M = MONTHS[d.getUTCMonth()], day = d.getUTCDate();
      const forms = (/^\d/.test(r.date) ? [`${day} ${M} ${y}`, `${day} ${M.slice(0, 3)} ${y}`, `${M} ${day}, ${y}`] : [`${M} ${y}`, `${M.slice(0, 3)} ${y}`]).map((x) => x.toLowerCase());
      if (!forms.some((x) => facts.lower.includes(x))) out.issues.push(`${where}: the date ${r.date} is not on the built page`);
    }
  }
}
