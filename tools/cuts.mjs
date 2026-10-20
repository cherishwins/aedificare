#!/usr/bin/env node
/**
 * The re-cut (spec 3.2, step 2): an edition film made to move with its words without a word spoken again. A cut
 * list, source/film/<slug>.cuts.md, names a phrase of the released narration and the shot that lands on it; this
 * renders each shot as a segment of exactly its length and cuts it into the clean render the list pins, on the
 * 24 fps grid, keeping the clean render's own sound. Nothing here calls a voice: the narration, its word times and
 * the picture the inserts are cut into are the release's own files (film-<slug>), pinned by sha256.
 *
 *   node tools/cuts.mjs suggest <slug>                      a draft list: a page line per timed citation mark,
 *                                                           every rose run over 3.6 s with its words
 *   node tools/cuts.mjs check  source/film/<slug>.cuts.md [--only film|short] [--online] [--until <s>]
 *   node tools/cuts.mjs pages  source/film/<slug>.cuts.md   the page tags with no capture yet, for tools/capture.mjs
 *   node tools/cuts.mjs render source/film/<slug>.cuts.md [--short] [--until <s>] [--out <dir>]
 *
 * --dir (default brand/youtube/<slug>/, gitignored) holds what the release carries: narration.json, script.json,
 * timeline.txt, meta.json and meta-short.json, the clean film and Short under their base names
 * (<slug>-film-base-1920x1080.mp4, <slug>-short-base-1080x1920.mp4, filed by release.yml from every fresh render and
 * by nothing else), pages/ (tools/capture.mjs) and footage/ (the owner's files). render writes the re-cut under the
 * release's usual names, <slug>-film-1920x1080.mp4 and <slug>-short-1080x1920.mp4, with meta.json, meta-short.json,
 * the sheets and cuts.json, into --out (default <dir>/recut/), which .github/workflows/recut.yml files.
 *
 * THE LIST. Front matter pins what it was written against; a source line gives an outside source the URL its page
 * does not carry (the pages cite as text: CLAUDE.md, "Block links only"), `pub:` and `date:` where a card names it,
 * and `by:` where the author a credit names is not the one the capture read (a page shot names its author either way);
 * an anchor line is a phrase the narration says, then the shot, in episode.mjs's tag grammar:
 *
 *   ---
 *   slug: the-floor
 *   narration: sha256:<of narration.json>
 *   base: sha256:<of the-floor-film-base-1920x1080.mp4>
 *   base-short: sha256:<of the-floor-short-base-1080x1920.mp4>
 *   hold: 3.6
 *   ---
 *   # Sources
 *   - 07 | https://www.morsemicro.com/products/chips/ | read 2026-10-20 | pub: Morse Micro | date: 2 Sep 2026
 *   ## The number
 *   @ "The Markup quoted the datasheet" -0.2 | over: base | hold: 2.6   [[page: self 11 | in: #ledger | hl: ...]]
 *   @ "from a datasheet" #1                                            [[pop: DATASHEET]]
 *   @ "at the physical layer" #1 | until: "It had no"                  [[page: 07 | hl: Peak throughput (PHY) 43.3 Mbps]]
 *
 * A phrase is matched against the narration's words once (lowercase letters and digits, citation marks skipped), or
 * its `#n`th time; `+s` or `-s` moves the cut. A cut lands 0.15 s before its word (generate-film's lead, sync rule 1),
 * on or before the frame, and holds until the next cut, `until:` (that phrase, led the same way) or `hold:` seconds
 * (the front matter's; four beats, 3.6 s, by default), then the clean render shows again. A pop or an overlay
 * rides over whatever is beneath it and leaves with its words (popEnd, overEnd), never past the next anchor.
 * The clean render's computed shots win: an insert that meets one is clipped to the rose between, unless it says
 * `over: base`. Nothing ever covers the opening field, the title's words, the record or the dove.
 *
 * CHECK holds, before any frame, what the spec holds (2.2, 2.5, 3.4.4): the pins; every anchor said once; every
 * number on a computed surface present in the built page's text (spelled numbers read as numbers, the page's SVG left
 * out, so "forty-four" counts and a path's 44.27 does not), a pop's words too; every page shot captured, its words
 * found and its source number in the edition's list, a picture touching its words turning it into its quote card (and
 * leaving it out of the Short), and so a block too wide to read whole at the frame's smallest type or a sliver of its
 * page at its largest (pageCrop in tools/lib/shots.mjs, said as a note), an author the page gives and no credit names
 * said; the owner's footage credited in footage/credits.txt or refused; quotes found on their source with --online;
 * twelve words at most on a card, its label counted with it, three in a pop, no exclamation; one Acid at a time (a
 * pop over a shot that spends one is Flash, an overlay that would make a second fails, a chart stars one row), Shock
 * rose left to the opening field, the dove once and last; no footage in a Short (it is left out of the Short and
 * said); the grammar's warnings (a picture unchanged past 5.4 s, a rose run in the body past 3.6 s, the rose alone
 * over 10 percent, a gag within 60 s of the last) and failures (a body stretch past 10.8 s with no new scene, the
 * rose alone over 20 percent); and each description, credits included, in YouTube's limits and still naming the
 * channel's voice. RENDER runs CHECK for its format and refuses on a failure.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { browser, openContext, findFfmpeg } from './lib/film.mjs';
import { FPS, KINDS, OVERLAYS, OWNER, shotContext, parseTag, chartHtml, chartLand, sweepPlan, pageSource, pageView, namesAuthor, popEnd, overEnd, footageFile, renderSegment, renderPop, renderOverlay, ff } from './lib/shots.mjs';
import { CHART_TYPES } from './lib/chart.mjs';
import { parsePage, shotName, sourcesOf, neverFetched, UA } from './capture.mjs';
import { edition } from '../src/lib/editions.mjs';
import { NARRATOR } from '../src/config.mjs';
import { filmMeta, sheetText, metaIssues } from './lib/film-meta.mjs';

const argv = process.argv.slice(2);
const [CMD, TARGET] = argv;
const arg = (name, dflt) => { const i = argv.indexOf(name); return i > 0 ? argv[i + 1] : dflt; };
const die = (m) => { console.error(`cuts: ${m}`); process.exit(1); };
if (!['suggest', 'check', 'pages', 'render'].includes(CMD) || !TARGET) die('usage: node tools/cuts.mjs suggest <slug> | check|pages|render source/film/<slug>.cuts.md [--dir <dir>] [--only film|short] [--short] [--until <s>] [--online] [--out <dir>]');

const LEAD = 0.15; // a picture 0.15 s before its word, as generate-film cuts its figures (sync rule 1)
const MIN = Math.round(0.5 * FPS); // an insert clipped below half a second cannot be read, so it fails
const CITE = /^\[\d+\]$/; // a citation mark: a zero-length word in the narration, never said
const FORBIDDEN = (id) => id === 'field' || id === 'record' || id === 'dove' || /^word-/.test(id);
// The kinds a cut list may carry. A clip carries its own sound and stops the narration, which an overlay re-cut cannot
// do (the spec's mode B); a slate is never shipped, so an owner shot needs its file.
const ALLOWED = KINDS.filter((k) => k !== 'clip');
// The Short rule (spec 2.3): no footage, archive film or third-party still in a Short, where any claim blocks it.
const IN_SHORT = (k) => !OWNER.includes(k);
const ACID_KINDS = new Set(['page', 'chart', 'fig', 'over', 'map']); // a quote card spends Acid when it highlights
const FORMAT = { film: { size: '1920x1080' }, short: { size: '1080x1920' } };
const usualName = (slug, fmt) => `${slug}-${fmt}-${FORMAT[fmt].size}.mp4`;
const baseName = (slug, fmt) => `${slug}-${fmt}-base-${FORMAT[fmt].size}.mp4`;
const mmss = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
const secs = (f) => (f / FPS).toFixed(2);
const sha256 = (buf) => 'sha256:' + crypto.createHash('sha256').update(buf).digest('hex');
const shaCache = new Map();
function sha256File(file) {
  if (!shaCache.has(file)) {
    const h = crypto.createHash('sha256'), fd = fs.openSync(file, 'r'), buf = Buffer.alloc(1 << 22);
    for (let n; (n = fs.readSync(fd, buf, 0, buf.length, null)) > 0;) h.update(buf.subarray(0, n));
    fs.closeSync(fd);
    shaCache.set(file, 'sha256:' + h.digest('hex'));
  }
  return shaCache.get(file);
}
const frameCount = (file) => +spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', file], { encoding: 'utf8' }).stdout.trim() || 0;

/* ---- frames -------------------------------------------------------------------- */
// generate-film shows a timeline row from the first frame at or after its start; timeline.txt prints times to 0.01 s,
// so a row's edge can sit a frame either side. An insert is clipped to the frames certainly a row's (core) and is
// refused near the frames possibly one (extent), so it never leaves a frame of rose at an edge or covers the dove.
const F = (t) => Math.ceil(t * FPS - 1e-9);
const core = (r) => [F(r.s + 0.005), F(r.e - 0.005)];
const extent = (r) => [F(r.s - 0.005), F(r.e + 0.005)];
const cutFrame = (t) => Math.max(0, Math.floor(t * FPS + 1e-6)); // on or before its time, so a lead is never shortened

/* ---- the list ------------------------------------------------------------------ */
function parseList(file) {
  if (!fs.existsSync(file)) die(`${file} does not exist`);
  const raw = fs.readFileSync(file);
  const src = raw.toString('utf8');
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(src);
  if (!fm) die(`${file} has no front matter`);
  const meta = {};
  for (const l of fm[1].split('\n')) { const i = l.indexOf(':'); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); }
  const issues = [];
  // Comments are blanked line for line, so every line keeps its number for the messages.
  const body = src.slice(fm[0].length).replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ''));
  const first = fm[0].split('\n').length - 1;
  const sources = {}, entries = [];
  let inSources = false, section = '';
  body.split('\n').forEach((text, k) => {
    const line = first + k + 1, t = text.trim();
    if (!t) return;
    if (/^#{1,6}\s/.test(t)) { inSources = /^#{1,6}\s+Sources\s*$/i.test(t); if (!inSources) section = t.replace(/^#+\s*/, ''); return; }
    if (inSources && !t.startsWith('@')) {
      const m = /^-\s*(\d{1,3})\s*\|(.*)$/.exec(t);
      if (!m) { issues.push(`line ${line}: a source line is "- NN | <url> | read <date>"`); return; }
      const [url, ...rest] = m[2].split('|').map((x) => x.trim());
      const n = m[1].padStart(2, '0'), s = { id: n, url };
      for (const r of rest) { const kv = /^(pub|date|by)\s*:\s*(.+)$/.exec(r); if (kv) s[kv[1]] = kv[2]; else if (/^read\s/.test(r)) s.read = r.replace(/^read\s+/, ''); }
      sources[n] = s;
      return;
    }
    const a = /^@\s*["“]([^"”]+)["”]\s*(?:#(\d+))?\s*([+-]\d+(?:\.\d+)?)?\s*((?:\|[^|[]*)*)\[\[([\s\S]+)\]\]\s*$/.exec(t);
    if (!a) { issues.push(`line ${line}: neither a heading, a source nor an anchor (@ "phrase" ... [[kind: ...]]); notes go in <!-- -->`); return; }
    const e = { line, section, phrase: a[1].trim(), nth: a[2] ? +a[2] : null, off: a[3] ? +a[3] : 0, over: false, until: null, hold: null, raw: a[5].trim() };
    for (const o of a[4].split('|').map((x) => x.trim()).filter(Boolean)) {
      let m;
      if ((m = /^until\s*:\s*["“]([^"”]+)["”]\s*(?:#(\d+))?$/.exec(o))) e.until = { phrase: m[1].trim(), nth: m[2] ? +m[2] : null };
      else if ((m = /^hold\s*:\s*(\d+(?:\.\d+)?)$/.exec(o))) e.hold = +m[1];
      else if (/^over\s*:\s*base$/.test(o)) e.over = true;
      else issues.push(`line ${line}: unknown option "${o}" (until: "phrase", hold: seconds, over: base)`);
    }
    e.tag = parseTag(e.raw);
    if (e.tag.bad) { issues.push(`line ${line}: unknown tag [[${e.raw.slice(0, 50)}]] (${ALLOWED.join(', ')})`); return; }
    if (!ALLOWED.includes(e.tag.kind)) { issues.push(`line ${line}: a clip carries its own sound and stops the narration; an overlay re-cut keeps the narration whole, so it cannot cut one`); return; }
    e.kind = e.tag.kind;
    e.overlay = OVERLAYS.includes(e.kind);
    entries.push(e);
  });
  if (!meta.slug) issues.push('front matter needs slug:');
  const hold = +(meta.hold || 3.6);
  if (!(hold > 0)) issues.push(`front matter hold: "${meta.hold}" is not a length in seconds`);
  return { file, hash: sha256(raw), meta, slug: meta.slug, hold, sources, entries, issues };
}

/* ---- the release's files ---------------------------------------------------------- */
function readTimeline(file) {
  return fs.readFileSync(file, 'utf8').split('\n').map((l) => l.trim().split(/\s+/)).filter((p) => p.length >= 4).map((p) => ({ s: +p[0], e: +p[1], ground: p[2], id: p[3] }));
}
const key = (w) => String(w).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '');

/** Everything a check or a render reads, from --dir; what is missing is an issue, said once. */
function load(L) {
  const slug = L.slug;
  const E = edition(slug);
  if (!E) die(`${slug} is not one of our editions`);
  const dir = arg('--dir', path.join('brand/youtube', slug));
  const issues = [];
  const json = (name) => { const p = path.join(dir, name); if (!fs.existsSync(p)) { issues.push(`${p} is missing: download it from the release film-${slug}`); return null; } return JSON.parse(fs.readFileSync(p, 'utf8')); };
  const N = json('narration.json'), S = json('script.json');
  const tl = path.join(dir, 'timeline.txt');
  if (!fs.existsSync(tl)) issues.push(`${tl} is missing: download it from the release film-${slug}`);
  if (!N || !fs.existsSync(tl)) { for (const x of [...L.issues, ...issues]) console.error(`  ${x}`); die('nothing to resolve against'); }
  const rows = readTimeline(tl);
  const words = N.blocks.flatMap((b, bi) => (b.words || []).map((w) => ({ ...w, bi })));
  const W = words.filter((w) => !CITE.test(w.w) && key(w.w)).map((w) => ({ ...w, k: key(w.w) }));
  return { L, E, dir, N, S, rows, words, W, issues };
}

function findPhrase(W, phrase, nth) {
  const want = phrase.split(/\s+/).map(key).filter(Boolean);
  if (!want.length) return { error: `"${phrase}" has no words` };
  const hits = [];
  for (let i = 0; i + want.length <= W.length; i++) if (want.every((k, j) => W[i + j].k === k)) hits.push(i);
  if (!hits.length) return { error: `"${phrase}" is not in the narration (its words as the release spoke them; a hyphenated word is one word)` };
  if (nth) return nth <= hits.length ? { word: W[hits[nth - 1]], i: hits[nth - 1] } : { error: `"${phrase}" #${nth}: it is said ${hits.length} time(s)` };
  if (hits.length > 1) return { error: `"${phrase}" is said ${hits.length} times (at ${hits.map((h) => mmss(W[h].s)).join(', ')}); add #n or more words` };
  return { word: W[hits[0]], i: hits[0] };
}

/* ---- the plan ------------------------------------------------------------------- */
/** The two cuts' frames, the timeline rows as each shows them, where an insert may go, and how long each runs. */
function formatOf(X, fmt, frames) {
  const { rows, N } = X;
  const rec = rows.find((r) => r.id === 'record');
  if (!rec) die('timeline.txt has no record row; it is not an edition film\'s');
  if (fmt === 'film') { const total = frames ?? F(N.duration); return { fmt, rows, total, edge: total }; }
  // generate-film's Short: the cover and section 00, then the record and the dove (its lines 317 to 330).
  const h2s = N.blocks.filter((x) => x.kind === 'h2');
  let cutA = h2s[1] ? (rows.find((r) => r.id === `sec-${h2s[1].sec}`)?.s ?? rec.s) : rec.s;
  if (cutA > 165) { const last = N.blocks.filter((x) => x.sec === h2s[0].sec && x.read && x.end + 0.4 <= 165).pop(); cutA = last ? last.end + 0.4 : 165; }
  const shift = cutA - rec.s;
  const fr = rows.filter((r) => r.s < cutA).map((r) => ({ ...r, e: Math.min(r.e, cutA) }))
    .concat(rows.filter((r) => r.s >= rec.s).map((r) => ({ ...r, s: r.s + shift, e: r.e + shift })));
  return { fmt, rows: fr, total: frames ?? F(cutA + N.duration - rec.s), edge: F(cutA - 0.005), cutA };
}

/** Resolve every anchor once, on the film's clock (the Short shares it up to its cut). */
function resolve(X) {
  const { L, W, words } = X;
  const issues = [], warnings = [];
  const ok = [];
  for (const e of L.entries) {
    const f = findPhrase(W, e.phrase, e.nth);
    if (f.error) { issues.push(`line ${e.line}: ${f.error}`); continue; }
    e.word = f.word;
    e.a = cutFrame(f.word.s - LEAD + e.off);
    if (e.until) {
      const u = findPhrase(W, e.until.phrase, e.until.nth);
      if (u.error) { issues.push(`line ${e.line}: until: ${u.error}`); continue; }
      e.u = cutFrame(u.word.s - LEAD);
      if (e.u <= e.a) { issues.push(`line ${e.line}: until: "${e.until.phrase}" comes before the cut`); continue; }
    }
    ok.push(e);
  }
  ok.sort((p, q) => p.a - q.a || p.line - q.line);
  const cuts = ok.filter((e) => !e.overlay), overlays = ok.filter((e) => e.overlay);
  cuts.forEach((e, k) => {
    const next = cuts.slice(k + 1).find((x) => x.a > e.a);
    if (cuts[k + 1] && cuts[k + 1].a === e.a) { issues.push(`line ${e.line}: two cuts on one frame (${secs(e.a)} s); the ${e.kind} would get no screen time, so the later line wins: move one`); e.dead = true; return; }
    e.b = e.u ?? e.a + Math.round((e.hold ?? L.hold) * FPS);
    if (next && e.b > next.a) e.b = next.a; // a cut is a cut: the later shot wins, as generate-film resolves overlaps
  });
  // An overlay leaves with its words and never stays past the next anchor of any kind, nor past its paragraph: with
  // no anchor after it, overEnd would hold a figure until the last time the film says its number.
  const starts = ok.map((e) => e.a);
  for (const e of overlays) {
    const nextA = starts.find((a) => a > e.a);
    const para = X.N.blocks.slice(e.word.bi + 1).find((b) => b.start > e.word.s)?.start ?? X.N.duration;
    const next = Math.min(nextA === undefined ? Infinity : nextA / FPS, para);
    const o = { t: e.a / FPS, tag: e.hold ? { ...e.tag, hold: e.hold } : e.tag };
    e.b = Math.round((e.kind === 'pop' ? popEnd(o, next, words) : overEnd(o, next, words)) * FPS);
    if (e.u) e.b = Math.min(e.b, e.u);
  }
  return { cuts: cuts.filter((e) => !e.dead), overlays, issues, warnings };
}

/**
 * One format's re-cut: which frames each insert takes, what is beneath each overlay, and the grammar's numbers. `C`
 * is the format's shot context, because a page shot's crop, and so whether a picture touches its words, is the
 * frame's (pageView): the film then shows the shot's quote card, and the Short leaves the shot out.
 */
function place(X, P, fmt, frames, C) {
  const G = formatOf(X, fmt, frames);
  const issues = [], warnings = [], notes = [];
  const lim = fmt === 'short' ? G.edge : G.total;
  const rows = G.rows.filter((r) => r.e - r.s > 0.011);
  const cores = rows.map((r) => ({ r, c: core(r), x: extent(r) })).filter((q) => q.c[1] > q.c[0]);
  const forbidden = (a, b) => rows.find((r) => FORBIDDEN(r.id) && extent(r)[0] < b && extent(r)[1] > a);
  const placed = [];
  for (const e of P.cuts) {
    if (e.a >= lim) continue;
    if (fmt === 'short' && !IN_SHORT(e.kind)) { notes.push(`line ${e.line}: ${e.kind} is left out of the Short (no footage in a Short, spec 2.3)`); continue; }
    const r = e.kind === 'page' ? pageCapture(X, e) : null;
    const v = r?.rec && r.rec.ok ? pageView(C, r.rec, r.shot) : null;
    if (v?.error) { issues.push(`line ${e.line}: page: ${v.error}`); continue; }
    if (v?.card === 'picture') {
      if (fmt === 'short') { notes.push(`line ${e.line}: page is left out of the Short: a picture on the source touches its words (no third-party still in a Short, spec 2.3)`); continue; }
      warnings.push(`line ${e.line}: page: a picture on the source touches its words, so the film shows the shot's quote card (spec 2.3, row 5: text only); words away from the picture show the page`);
    }
    // A block too wide to read whole at the frame's smallest type is its quote card, never a picture of cut lines.
    if (v?.card === 'wide') notes.push(`line ${e.line}: page: the words' block cannot be read whole at the ${fmt}'s smallest type (${v.P.minType} px), so the ${fmt} shows the shot's quote card; words in a narrower block show the page`);
    if (v?.card === 'small') notes.push(`line ${e.line}: page: the words' block, with the blocks around it, is a sliver of its page at the ${fmt}'s largest type (${v.P.maxType} px), so the ${fmt} shows the shot's quote card`);
    if (v?.card === 'unnamed') notes.push(`line ${e.line}: page: the words sit in a table whose head names its columns, or carry a figure only a head or caption names, and the ${fmt} cannot show both at its smallest type (${v.P.minType} px), so it shows the shot's quote card`);
    let a = e.a, b = Math.min(e.b, lim);
    const bad = forbidden(a, b);
    if (bad) { issues.push(`line ${e.line}: ${e.kind} at ${secs(a)} s would cover ${bad.id}, which nothing covers`); continue; }
    if (!e.over) {
      for (let q; (q = cores.find(({ c }) => a >= c[0] && a < c[1]));) a = q.c[1];
      const meet = cores.filter(({ c }) => c[0] >= a && c[0] < b).sort((p, q) => p.c[0] - q.c[0])[0];
      if (meet) b = meet.c[0];
      if (a > e.a + Math.round(0.3 * FPS)) warnings.push(`line ${e.line}: ${e.kind} lands ${secs(a - e.a)} s after its word, because the clean render's shot there wins; say over: base, or anchor it later`);
    }
    if (b - a < MIN) { issues.push(`line ${e.line}: ${e.kind} runs ${secs(Math.max(0, b - a))} s, too short to read; give it room (hold:, until:, the next cut later, or over: base where a clean shot wins)`); continue; }
    placed.push({ e, a, b });
  }
  // What each frame shows: -1 the rose, a row's index, or 1000 + an insert's index.
  const T = G.total, own = new Int32Array(T).fill(-1);
  rows.forEach((r, i) => { for (let f = Math.max(0, F(r.s)); f < Math.min(T, F(r.e)); f++) own[f] = i; });
  placed.forEach((p, i) => { for (let f = p.a; f < p.b; f++) own[f] = 1000 + i; });
  const acidId = (() => { const words = X.E.title.toUpperCase().split(' '); const k = words.indexOf(X.E.acid.toUpperCase()); return k < 0 ? null : `word-${k}`; })();
  const spends = (f) => {
    const o = own[f];
    if (o >= 1000) { const p = placed[o - 1000]; return ACID_KINDS.has(p.e.kind) || (p.e.kind === 'quote' && !!p.e.tag.hl); }
    if (o < 0) return false;
    const id = rows[o].id;
    return id === 'field' || id === acidId || /^headline-/.test(id);
  };
  const ov = [];
  for (const e of P.overlays) {
    if (e.a >= lim) continue;
    let a = e.a, b = Math.min(e.b, lim);
    const bad = forbidden(a, b);
    if (bad) { issues.push(`line ${e.line}: ${e.kind} at ${secs(a)} s would cover ${bad.id}, which nothing covers`); continue; }
    if (!e.over) {
      if (own[a] >= 0 && own[a] < 1000) { issues.push(`line ${e.line}: ${e.kind} lands on the clean render's ${rows[own[a]].id}, which wins; say over: base, or move it`); continue; }
      for (let f = a + 1; f < b; f++) if (own[f] >= 0 && own[f] < 1000) { b = f; break; }
    }
    if (b - a < MIN) { issues.push(`line ${e.line}: ${e.kind} is left ${secs(Math.max(0, b - a))} s before the shot after it; move it or give it more room`); continue; }
    let under = false;
    for (let f = a; f < b && !under; f++) under = spends(f);
    if (e.kind === 'over' && under) { issues.push(`line ${e.line}: an overlay's figure is Acid, and the shot beneath it spends Acid already (one Acid at a time)`); continue; }
    ov.push({ e, a, b, acid: e.kind === 'pop' ? !under : true });
  }
  ov.sort((p, q) => p.a - q.a);
  for (let k = 1; k < ov.length; k++) if (ov[k].a < ov[k - 1].b) issues.push(`line ${ov[k].e.line}: two overlays on screen at once (with line ${ov[k - 1].e.line}); one leaves before the next lands`);
  // The dove once and last, as the clean render made it; inserts are refused before they reach it.
  const doves = G.rows.filter((r) => r.id === 'dove');
  if (doves.length !== 1 || G.rows[G.rows.length - 1].id !== 'dove') issues.push(`the clean ${fmt}'s timeline does not end on one dove`);
  return { G, rows, placed, ov, own, spends, issues, warnings, notes };
}

/* ---- the grammar (spec 2.2) ---------------------------------------------------- */
function shotFor(p) { return { t: p.a / FPS, end: p.b / FPS, tag: p.e.tag }; }

/** The frames inside an insert where its picture moves on: a highlighter starting, a chart's next step, a sub-cut. */
function innerChanges(X, C, p) {
  const d = (p.b - p.a) / FPS, s = shotFor(p), k = p.e.kind, out = [];
  const beat = Math.round(0.9 * FPS);
  if (k === 'page') {
    const r = X.pages?.get(p.e.raw);
    const v = r?.rec ? pageView(C, r.rec, r.shot) : null;
    if (v && !v.error) {
      const texts = v.card ? r.shot.hl : v.phrases.map((h) => h.text);
      for (const x of sweepPlan(texts.filter(Boolean), s, d, X.words)) out.push(Math.round((x.at / 1000) * FPS));
    }
  } else if (k === 'chart') {
    const land = chartLand(s, X.words, d);
    const h = chartHtml(C, p.e.tag, land ? land.ms : null);
    const build = Math.min(h.animMs || 900, d * 1000);
    for (let ms = 900; ms <= build; ms += 900) out.push(Math.round((ms / 1000) * FPS));
    if (land) out.push(Math.round((land.ms / 1000) * FPS));
  } else if (k === 'quote' || k === 'map') out.push(beat);
  else if (OWNER.includes(k)) { const n = k === 'footage' && d > 5.4 ? Math.round(d / 3.6) : 1; for (let j = 1; j < n; j++) out.push(Math.round(((p.b - p.a) * j) / n)); }
  return out.filter((f) => f > 0 && f < p.b - p.a).map((f) => p.a + f);
}

function grammar(X, Q, C, untilF) {
  const { G, rows, placed, ov, own } = Q;
  const T = Math.min(G.total, untilF || Infinity);
  const warnings = [], fails = [];
  const rec = rows.find((r) => r.id === 'record');
  const B0 = Math.min(T, 30 * FPS), B1 = Math.min(T, rec ? F(rec.s) : T);
  const cover = new Uint8Array(T);
  for (const o of ov) for (let f = o.a; f < Math.min(o.b, T); f++) cover[f] = 1;
  const alone = (f) => own[f] === -1 && !cover[f];
  const label = (f) => (own[f] >= 1000 ? `${placed[own[f] - 1000].e.kind} (line ${placed[own[f] - 1000].e.line})` : own[f] >= 0 ? rows[own[f]].id : 'the rose');
  // Changes: every cut, an overlay landing or leaving, and the moves inside an insert.
  const changes = new Set([0, T]);
  for (let f = 1; f < T; f++) if (own[f] !== own[f - 1]) changes.add(f);
  for (const o of ov) { if (o.a < T) changes.add(o.a); if (o.b < T) changes.add(o.b); }
  for (const p of placed) for (const f of innerChanges(X, C, p)) if (f < T) changes.add(f);
  const ch = [...changes].sort((a, b) => a - b);
  // New scenes: an insert's first frame, or a clean shot's own first frame (a shot showing again after an insert is not new).
  const scenes = new Set([0]);
  for (const p of placed) if (p.a < T) scenes.add(p.a);
  rows.forEach((r, i) => { const f = Math.max(0, F(r.s)); if (f < T && own[f] === i) scenes.add(f); });
  const sc = [...scenes].sort((a, b) => a - b);
  // The rose alone: share, and runs in the body.
  let roseF = 0, longest = 0, longestAt = 0;
  for (let f = 0; f < T; f++) if (alone(f)) roseF++;
  for (let f = B0; f < B1;) {
    if (!alone(f)) { f++; continue; }
    let g = f; while (g < B1 && alone(g)) g++;
    if (g - f > longest) { longest = g - f; longestAt = f; }
    if (g - f > 3.6 * FPS) warnings.push(`the rose alone for ${secs(g - f)} s at ${mmss(f / FPS)} (a body rose run past 3.6 s)`);
    f = g;
  }
  const share = T ? roseF / T : 0;
  if (share > 0.2) fails.push(`the rose alone is ${(share * 100).toFixed(1)} percent of the ${G.fmt} (fails over 20)`);
  else if (share > 0.1) warnings.push(`the rose alone is ${(share * 100).toFixed(1)} percent of the ${G.fmt} (warns over 10)`);
  // A picture unchanged: the rose in the body has its own, stricter rule above; the record and the dove are left as they are.
  for (let k = 0; k + 1 < ch.length; k++) {
    const a = ch[k], b = ch[k + 1], id = own[a] >= 0 && own[a] < 1000 ? rows[own[a]].id : '';
    if (b - a <= 5.4 * FPS || id === 'record' || id === 'dove' || (alone(a) && a >= B0 && a < B1)) continue;
    warnings.push(`${label(a)} unchanged for ${secs(b - a)} s at ${mmss(a / FPS)} (warns past 5.4 s)`);
  }
  // A stretch with no new scene, ending in the body.
  let noScene = 0, noSceneAt = 0;
  const bounds = [...sc.filter((f) => f < B1), B1];
  for (let k = 0; k + 1 < bounds.length; k++) {
    const a = bounds[k], b = bounds[k + 1];
    if (b <= B0) continue;
    if (b - a > noScene) { noScene = b - a; noSceneAt = a; }
    if (b - a > 10.8 * FPS) fails.push(`no new scene for ${secs(b - a)} s from ${mmss(a / FPS)} (${label(a)}; fails past 10.8 s in the body)`);
  }
  // Gags: the punchline, rare, never beside a chart (sync rule 6).
  const gags = placed.filter((p) => p.e.kind === 'gag' && p.a < T);
  gags.forEach((p, k) => {
    const d = (p.b - p.a) / FPS;
    if (d < 0.9 || d > 2.7) warnings.push(`line ${p.e.line}: a gag runs ${d.toFixed(2)} s (0.9 to 2.7)`);
    if (k && p.a - gags[k - 1].b < 60 * FPS) warnings.push(`line ${p.e.line}: a gag ${secs(p.a - gags[k - 1].b)} s after the last (60 s apart at least)`);
    if (placed.some((q) => q.e.kind === 'chart' && (q.b === p.a || p.b === q.a || Math.abs(q.a - p.a) < 2 * FPS))) warnings.push(`line ${p.e.line}: a gag beside a chart`);
  });
  const per = (n, f0, f1) => (f1 > f0 ? (n * 60 * FPS) / (f1 - f0) : 0);
  const inBody = (xs) => xs.filter((f) => f >= B0 && f < B1).length;
  return {
    warnings, fails,
    metrics: { seconds: T / FPS, rose: share, hook: ch.filter((f) => f > 0 && f < B0).length, changesPerMin: per(inBody(ch), B0, B1), scenesPerMin: per(inBody(sc), B0, B1), longestRose: longest / FPS, longestRoseAt: longestAt / FPS, noScene: noScene / FPS, noSceneAt: noSceneAt / FPS },
  };
}

/* ---- facts: every number shown is on the page ------------------------------------ */
const UNITS = Object.fromEntries('zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ').map((w, i) => [w, i]));
const TENS = Object.fromEntries('twenty thirty forty fifty sixty seventy eighty ninety'.split(' ').map((w, i) => [w, 20 + 10 * i]));
const SCALES = { hundred: 100, thousand: 1e3, million: 1e6, billion: 1e9, trillion: 1e12 };
const isNumWord = (t) => t.split('-').every((p) => p in UNITS || p in TENS);
/** The numbers in a text, written or spelled ("forty-four" is 44, "one hundred and six" 106); `scaled` adds "8.9 million" as 8,900,000. */
function numbersIn(text) {
  const primary = [], scaled = [];
  const toks = String(text).toLowerCase().replace(/[\u2013\u2014]/g, ' ').match(/\d[\d,]*(?:\.\d+)?|[a-z]+(?:-[a-z]+)*/g) || [];
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (/\d/.test(t)) {
      const v = +t.replace(/,/g, '').replace(/\.$/, '');
      if (Number.isFinite(v)) { primary.push(v); const sc = SCALES[toks[i + 1]]; if (sc >= 1e3) scaled.push(v * sc); }
      continue;
    }
    let j = i, total = 0, cur = 0, any = false;
    while (j < toks.length) {
      if (isNumWord(toks[j])) { for (const p of toks[j].split('-')) cur += UNITS[p] ?? TENS[p]; any = true; j++; }
      else if (any && toks[j] in SCALES) { if (SCALES[toks[j]] === 100) cur *= 100; else { total += cur * SCALES[toks[j]]; cur = 0; } j++; }
      else if (any && toks[j] === 'and' && toks[j + 1] && isNumWord(toks[j + 1])) j++;
      else break;
    }
    if (any) { primary.push(total + cur); i = j - 1; }
  }
  return { primary, scaled };
}
const STOPWORDS = new Set('the and for but not nor with from into onto over under this that these those its his her our are was were has had have than then what when who all any per via off out one'.split(' '));
const contentWords = (text) => (String(text).toLowerCase().match(/[a-z]+/g) || []).filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !isNumWord(w) && !(w in SCALES));
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos|nbsp);/gi, (_, e) => (e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)) : { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[e.toLowerCase()]));

/** The built page as a reader reads it: <main>, without its SVG (path coordinates are not facts), scripts, styles or nav. */
function pageFacts(E) {
  const file = path.join('dist', E.path.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(file)) return null;
  let h = fs.readFileSync(file, 'utf8');
  const m = /<main\b[\s\S]*<\/main>/i.exec(h);
  if (m) h = m[0];
  const text = decode(h.replace(/<(svg|script|style|template|nav)\b[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  const n = numbersIn(text);
  const words = new Set(text.toLowerCase().match(/[a-z]+/g) || []);
  return { text, lower: text.toLowerCase(), nums: [...n.primary, ...n.scaled], words };
}
const has = (facts, v) => facts.nums.some((x) => Math.abs(x - v) <= 1e-9 * Math.max(1, Math.abs(v)));
const ONE_SURFACE = new Set(['card', 'fig', 'over', 'title', 'pop']); // the kinds whose fields are one surface of type
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * What a computed insert puts on screen as type: [text, the words it must have on the page (true) or should (false)].
 * A title card shows the edition's own title and date, whatever its tag says (titleHtml), so those are what it shows.
 */
function displayed(tag, E) {
  const k = tag.kind;
  if (k === 'pop') return [[tag.text, true]];
  if (k === 'fig' || k === 'over') return [[tag.value, false], [tag.label, false]];
  if (k === 'card') return [[tag.text, false], [tag.label, false]];
  if (k === 'title') return E ? [[E.title, false], [E.dateLabel, false]] : [];
  if (k === 'map') return [[tag.label, false], ...(tag.stops || []).filter(Boolean).map((s) => [s.name, false])];
  if (k === 'chart') {
    const out = [[tag.title, false], [tag.sub, false], [tag.note, false], [tag.ref, false]];
    for (const r of tag.rows || []) {
      if (tag.type === 'timeline' || tag.type === 'flow') out.push([r.text, false], ...(tag.type === 'flow' ? [[r.from, false], [r.to, false]] : []));
      else out.push([[r.ra, r.rb].filter((x) => x !== null && x !== undefined).join(' '), false], [r.show, false], ...(tag.type === 'line' ? [] : [[r.label, false]]));
    }
    return out;
  }
  return [];
}

function facts(X, e, out) {
  const page = X.facts;
  if (!page) { out.issues.push(`dist/${X.E.slug}/index.html is not built: run npm run build`); return; }
  const where = `line ${e.line}: ${e.kind}`;
  const count = (text) => String(text || '').split(/\s+/).filter((w) => /[a-z0-9$]/i.test(w)).length;
  const shown = displayed(e.tag, X.E);
  // Twelve words on a card means the card: its words and its label are read as one surface, so they are counted
  // together. A chart's or a map's labels are data, each read on its own, and keep the count per label.
  if (ONE_SURFACE.has(e.kind)) {
    const n = shown.reduce((a, [text]) => a + count(text), 0);
    if (n > 12) out.issues.push(`${where}: ${n} words of display copy on one card ("${shown.map(([t]) => t).filter(Boolean).join(' | ').slice(0, 60)}..."); twelve at most, label included`);
  }
  for (const [text, must] of shown) {
    if (!text) continue;
    if (e.kind !== 'pop' && /!/.test(text)) out.issues.push(`${where}: no exclamation on a card ("${text}")`);
    const n = count(text);
    if (n > 12 && !ONE_SURFACE.has(e.kind)) out.issues.push(`${where}: ${n} words of display copy ("${text.slice(0, 50)}..."); twelve at most`);
    for (const v of numbersIn(text).primary) if (!has(page, v)) out.issues.push(`${where}: ${v} is not on the built page ("${text}"); facts are not free`);
    const missing = contentWords(text).filter((w) => !page.words.has(w) && !page.words.has(w.replace(/s$/, '')) && !page.words.has(`${w}s`));
    if (missing.length) (must ? out.issues : out.warnings).push(`${where}: "${missing.join('", "')}" ${missing.length > 1 ? 'are' : 'is'} not on the built page ("${text}")${must ? '; a pop is a word the page says' : ''}`);
  }
  if (e.kind === 'pop') for (const x of e.tag.errors || []) out.issues.push(`line ${e.line}: ${x}`);
  if (e.kind === 'chart') {
    if (!CHART_TYPES.includes(e.tag.type)) out.issues.push(`${where}: type "${e.tag.type}" is not one of ${CHART_TYPES.join(', ')}`);
    for (const x of e.tag.errors || []) out.issues.push(`${where}: ${x}`);
    if (!e.tag.srcs.length) out.issues.push(`${where}: it cites no source (src: NN); a chart carries its own citation on screen`);
    // The Acid ledger counts a chart's stars: chartBody draws every starred row in Acid, so two stars are two Acid
    // marks in one shot (sync rule 3). A line's Acid is its series, whatever is starred.
    const stars = e.tag.type === 'line' ? 0 : (e.tag.rows || []).filter((r) => r.hot).length;
    if (stars > 1) out.issues.push(`${where}: ${stars} rows starred, each drawn in Acid; one Acid at a time (sync rule 3): star the one row the shot is for`);
    // A timeline's dates are facts too, and a date is checked as the page writes one, not as three numbers.
    if (e.tag.type === 'timeline') for (const r of e.tag.rows) {
      const d = new Date(r.t), y = d.getUTCFullYear(), M = MONTHS[d.getUTCMonth()], day = d.getUTCDate();
      const forms = [`${day} ${M} ${y}`, `${day} ${M.slice(0, 3)} ${y}`, `${M} ${day}, ${y}`, `${M} ${y}`, `${M.slice(0, 3)} ${y}`].map((x) => x.toLowerCase());
      if (!forms.some((x) => page.lower.includes(x))) out.issues.push(`${where}: the date ${r.date} is not on the built page`);
    }
  }
}

/* ---- sources, pages and quotes ------------------------------------------------------ */
function sourceList(X) { return X._list === undefined ? (X._list = sourcesOf(X.E)) : X._list; }

function checkSources(X, e, out) {
  const list = sourceList(X);
  const where = `line ${e.line}: ${e.kind}`;
  const need = (n, what) => {
    if (!list) { out.issues.push(`dist/${X.E.slug}/index.html is not built: run npm run build`); return; }
    if (!list[+n - 1]) out.issues.push(`${where}: source ${n} is not in the edition's list (it has ${list.length})`);
    const s = X.L.sources[n];
    if (!s || !s.pub || !s.date) out.issues.push(`${where}: source ${n} needs "| pub: <publisher> | date: <date>" on its line under # Sources, for the ${what}`);
  };
  if (e.kind === 'quote') { if (!/^\d{1,3}$/.test(e.tag.src || '')) out.issues.push(`${where}: a quote names its source by number (quote: NN | "words")`); else need(e.tag.src.padStart(2, '0'), 'card\'s source line'); }
  if (e.kind === 'chart') for (const n of e.tag.srcs) need(n.padStart(2, '0'), 'chart\'s source line');
}

/** A page tag's capture, read without stopping: the tag, the shot capture.mjs parsed from it, its record or why not. */
function pageCapture(X, e) {
  if (!X.pages) X.pages = new Map();
  if (X.pages.has(e.raw)) return X.pages.get(e.raw);
  const urls = Object.fromEntries(Object.entries(X.L.sources).map(([k, v]) => [k, v.url]));
  let r;
  try {
    const shot = parsePage(e.tag.body, urls);
    const name = shotName(X.E.slug, shot);
    const file = path.join(X.dir, 'pages', `${name}.json`);
    r = { shot, name, file, rec: fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null };
  } catch (err) { r = { error: err.message }; }
  X.pages.set(e.raw, r);
  return r;
}

function checkPage(X, e, out) {
  const r = pageCapture(X, e), where = `line ${e.line}: page`;
  if (r.error) { out.issues.push(`${where}: ${r.error.replace(/^page:\s*/, '')}`); return; }
  if (!r.rec) { out.issues.push(`${where}: no capture (${r.file}); node tools/cuts.mjs pages ${X.L.file} lists what tools/capture.mjs still has to shoot`); return; }
  const rec = r.rec;
  if (rec.refused) { out.warnings.push(`${where}: ${rec.src ? `source ${rec.src}` : 'the page'} refused the capture (${rec.refusal}: ${String(rec.reason).slice(0, 80)}); the shot is a quote card of words nobody could read on the source, so a person confirms them before upload`); return; }
  if (!rec.ok || !rec.png) { out.issues.push(`${where}: the capture failed (${rec.error || 'no PNG'}); fix the tag and capture again`); return; }
  const lost = r.shot.hl.filter((h, i) => !(rec.hl?.[i]?.found && rec.hl[i].union && rec.hl[i].boxes?.length));
  if (lost.length) out.issues.push(`${where}: "${lost.join('", "')}" not boxed in the capture`);
  if (rec.source && rec.source.namesHost === false) out.warnings.push(`${where}: source ${rec.src}'s entry does not name ${new URL(rec.url).hostname}; a person confirms the URL is the cited document`);
  // Fair dealing names the author where the source gives one (ss. 29.1 and 29.2): a by: that leaves the page's own
  // byline out is said, so a person decides.
  const ps = pageSource({ S: shotS(X) }, rec);
  if (ps.author && !namesAuthor(`${ps.by || ''} ${ps.pub}`, ps.author)) out.warnings.push(`${where}: source ${rec.src}'s page gives its author as "${ps.author}", and its credit ("${ps.by ? `${ps.by}, ` : ''}${ps.pub}") does not name them; fair dealing names the author the source gives`);
  if (rec.self && rec.built?.sha256) {
    const f = path.join('dist', edition(rec.page).path.replace(/^\//, ''), 'index.html');
    if (fs.existsSync(f) && 'sha256:' + rec.built.sha256 !== sha256(fs.readFileSync(f))) out.warnings.push(`${where}: our page ${rec.page} changed since its capture (${rec.readAt.slice(0, 10)}); capture it again so the shot shows the page as built`);
  }
}

async function checkQuoteOnline(X, e, out) {
  const s = X.L.sources[(e.tag.src || '').padStart(2, '0')];
  const where = `line ${e.line}: quote`;
  if (!s?.url) { out.issues.push(`${where}: source ${e.tag.src} has no URL under # Sources`); return; }
  if (neverFetched(s.url)) { out.warnings.push(`${where}: ${new URL(s.url).hostname} is never fetched; a person confirms the words`); return; }
  const norm = (t) => t.toLowerCase().replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
  try {
    const r = await fetch(s.url, { headers: { 'user-agent': UA } });
    if (!r.ok) { out.warnings.push(`${where}: source ${e.tag.src} answered ${r.status}; a person confirms the words`); return; }
    if (!norm(await r.text()).includes(norm(e.tag.text))) out.issues.push(`${where}: not found on source ${e.tag.src}: "${e.tag.text.slice(0, 70)}"`);
  } catch (err) { out.warnings.push(`${where}: could not fetch source ${e.tag.src} (${err.message}); a person confirms the words`); }
}

/* ---- credits: what the description names, from what is on screen ----------------------- */
/**
 * What one insert puts on screen of its sources, in the description's short form ("[NN] Publisher, date"): a page
 * shot's source as its label names it, a quote card's, a chart's source line, the owner's footage by its credits.txt
 * line. `pixels`: the source's own page is on screen (a page shot as served), not only its name (a chart's source
 * line, a quote card, a capture refused and shown as a card), so the description cannot say every frame is computed.
 */
function creditOf(X, C, e) {
  const src = (n) => X.L.sources[n];
  if (e.kind === 'page') {
    const r = pageCapture(X, e);
    if (!r.rec || !r.rec.src) return [];
    const ps = pageSource(C, r.rec), n = r.rec.src, v = pageView(C, r.rec, r.shot);
    // The author before the publisher, as the label sets them; a shot shown as its quote card shows no pixels of the page.
    return [{ n, line: ps.own ? `[${n}] ${ps.own}, ${ps.date}, this site` : `[${n}] ${ps.by ? `${ps.by}, ` : ''}${ps.pub}, ${ps.date}`.replace(/, $/, ''), by: ps.by, own: !!ps.own, pixels: !v.card && !v.error }];
  }
  const named = (raw) => { const n = String(raw).padStart(2, '0'), s = src(n); return s?.pub ? [{ n, line: `[${n}] ${s.by ? `${s.by}, ` : ''}${s.pub}, ${s.date}`, by: s.by || null, own: false, pixels: false }] : []; };
  if (e.kind === 'quote') return named(e.tag.src);
  if (e.kind === 'chart') return e.tag.srcs.flatMap(named);
  if (OWNER.includes(e.kind)) {
    // Footage is always pixels, credited or not, so the description never calls such a film computed throughout; a
    // clip with no credits line fails the check, so a line of null never reaches a description.
    const line = X.credits.find((l) => l.toLowerCase().startsWith(`${e.tag.id.toLowerCase()}:`)) || null;
    return [{ n: null, id: e.tag.id, line, own: false, pixels: true, footage: true }];
  }
  return [];
}

/** A format's credits: every source on screen in it once, by number, then the footage lines. */
function creditsOf(X, Q, C) {
  const byN = new Map(), extra = [];
  for (const p of Q.placed) for (const c of creditOf(X, C, p.e)) {
    if (!c.n) { if (!extra.some((x) => x.id === c.id && x.line === c.line)) extra.push(c); continue; }
    const was = byN.get(c.n);
    // One line a source; the line that names its author wins, whichever shot came first (a chart's source line
    // names no author, and the page shot of the same source does).
    if (!was) byN.set(c.n, { ...c });
    else { was.pixels ||= c.pixels; if (!was.by && c.by) Object.assign(was, { line: c.line, by: c.by }); }
  }
  return [...[...byN.values()].sort((a, b) => +a.n - +b.n), ...extra];
}

/* ---- check ------------------------------------------------------------------------- */
async function check(L, { only = null, untilS = 0, quiet = false } = {}) {
  const X = load(L);
  X.facts = pageFacts(X.E);
  const credFile = path.join(X.dir, 'footage', 'credits.txt');
  X.credits = fs.existsSync(credFile) ? fs.readFileSync(credFile, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean) : [];
  const out = { issues: [...L.issues, ...X.issues], warnings: [], notes: [] };
  if (L.slug !== X.E.slug) out.issues.push(`slug: ${L.slug} is not ${X.E.slug}`);
  // The pins: the list was written against these files, and against no others.
  const pin = (field, file, what) => {
    if (!L.meta[field]) { out.issues.push(`front matter needs ${field}: sha256:<of ${path.basename(file)}>`); return false; }
    if (!fs.existsSync(file)) { out.issues.push(`${file} is missing: the ${what} the list pins (filed by release.yml from the clean render, never by a re-cut)`); return false; }
    if (sha256File(file) !== L.meta[field]) { out.issues.push(`${path.basename(file)} is ${sha256File(file)}, not the ${L.meta[field]} the list pins; the ${what} changed since the list was written, so check every anchor against it and pin it again`); return false; }
    return true;
  };
  pin('narration', path.join(X.dir, 'narration.json'), 'narration');
  // The channel speaks in one voice: a release in an older one is rendered again, never re-cut into a new film.
  const V = (process.env.NARRATOR || NARRATOR).replace(/^(gemini|eleven):/, '');
  if (X.N.voice !== V) out.issues.push(`the release's narration is in ${X.N.voice}, not the channel's ${V}; a re-cut keeps the voice it is given`);
  const P = resolve(X);
  out.issues.push(...P.issues); out.warnings.push(...P.warnings);
  // Per insert, whatever the format: facts, sources, captures, footage.
  const C0 = shotContext({ S: shotS(X), short: false, dir: X.dir, slug: X.E.slug, pages: path.join(X.dir, 'pages') });
  for (const e of [...P.cuts, ...P.overlays]) {
    facts(X, e, out);
    checkSources(X, e, out);
    if (e.kind === 'page') checkPage(X, e, out);
    if (e.kind === 'quote') { if (argv.includes('--online')) await checkQuoteOnline(X, e, out); else out.warnings.push(`line ${e.line}: quote not checked against its source (check --online)`); }
    if (OWNER.includes(e.kind)) {
      if (!fs.existsSync(C0.FOOT) || !footageFile(C0, e.tag.id)) out.issues.push(`line ${e.line}: ${e.kind} ${e.tag.id} has no file in ${C0.FOOT}; a re-cut never ships a slate`);
      // Someone else's pictures go out credited or not at all: fair dealing names the source (Copyright Act ss. 29.1
      // and 29.2), a CC licence its creator, and the description is where both are read.
      else if (!X.credits.some((l) => l.toLowerCase().startsWith(`${e.tag.id.toLowerCase()}:`))) out.issues.push(`line ${e.line}: ${e.tag.id} has no line in footage/credits.txt ("id: source, licence"); the owner's footage is never shown uncredited`);
    }
  }
  const fmts = only ? [only] : ['film', 'short'];
  const plans = {};
  const untilF = untilS ? Math.round(untilS * FPS) : 0;
  for (const fmt of ['film', 'short']) {
    // Both formats are planned, so the manifest is the same whichever renders; only the checked ones are held to it.
    const base = path.join(X.dir, baseName(X.E.slug, fmt));
    const held = fmts.includes(fmt);
    if (held) pin(fmt === 'film' ? 'base' : 'base-short', base, `clean ${fmt}`);
    const frames = fs.existsSync(base) ? frameCount(base) : null;
    const C = shotContext({ S: shotS(X), short: fmt === 'short', dir: X.dir, slug: X.E.slug, pages: path.join(X.dir, 'pages') });
    const Q = place(X, P, fmt, frames, C);
    if (held && frames !== null) { const want = formatOf(X, fmt, null).total; if (Math.abs(want - frames) > 1) out.issues.push(`${path.basename(base)} has ${frames} frames, and this narration and timeline make ${want}: it is not this release's clean ${fmt}`); }
    const g = grammar(X, Q, C, untilF);
    Q.grammar = g; Q.C = C; Q.base = base; Q.frames = frames;
    Q.credits = creditsOf(X, Q, C);
    plans[fmt] = Q;
    if (held) {
      const tagF = (m) => `${fmt}: ${m}`;
      out.issues.push(...Q.issues.map(tagF), ...g.fails.map(tagF));
      out.warnings.push(...Q.warnings.map(tagF), ...g.warnings.map(tagF));
      out.notes.push(...Q.notes);
    }
  }
  // The descriptions, credits included, against YouTube's limits and the voice text the guards read.
  const manifest = manifestOf(X, P, plans);
  const desc = {};
  for (const fmt of fmts) {
    const metaFile = path.join(X.dir, fmt === 'film' ? 'meta.json' : 'meta-short.json');
    if (!fs.existsSync(metaFile) || !X.S) { out.issues.push(`${metaFile} and script.json are needed for the description: download them from the release`); continue; }
    const old = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    const musicLine = String(old.description || '').split('\n').find((l) => l.startsWith('Music:'));
    if (!musicLine) { out.issues.push(`${metaFile} has no Music: line`); continue; }
    const fm = filmMeta(X.E, X.S, X.N, { short: fmt === 'short', musicLine, cuts: manifest });
    out.issues.push(...metaIssues(fm, X.N).map((m) => `${fmt} description: ${m}`));
    desc[fmt] = { fm, old, bytes: fm.bytes, credits: manifest.credits[fmt] };
  }
  const R = { X, P, plans, out, manifest, desc, fmts, untilF };
  if (!quiet) report(R);
  return R;
}

/** The context the shot builders need: the edition as the script, the list's sources (with their pub: and date:). */
function shotS(X) { return { meta: { slug: X.E.slug, title: X.E.title, date: X.E.dateLabel }, sources: X.L.sources }; }

function manifestOf(X, P, plans) {
  const inF = (fmt, e) => plans[fmt].placed.find((p) => p.e === e) || plans[fmt].ov.find((p) => p.e === e);
  const win = (p) => (p ? { from: +(p.a / FPS).toFixed(4), to: +(p.b / FPS).toFixed(4), frames: [p.a, p.b] } : null);
  const all = [...P.cuts, ...P.overlays].sort((a, b) => a.a - b.a || a.line - b.line);
  return {
    slug: X.E.slug, list: X.L.hash, narration: X.L.meta.narration || null, base: { film: X.L.meta.base || null, short: X.L.meta['base-short'] || null },
    inserts: all.map((e) => {
      const f = inF('film', e), s = inF('short', e);
      const cap = e.kind === 'page' ? pageCapture(X, e) : null;
      const credit = creditOf(X, plans.film.C, e);
      return {
        line: e.line, at: e.phrase, kind: e.kind, tag: e.raw, over: e.over, film: win(f), short: win(s),
        ...(e.overlay ? { acid: { film: f ? f.acid : null, short: s ? s.acid : null } } : {}),
        ...(cap?.rec ? { capture: cap.name, refused: cap.rec.refused ? cap.rec.refusal : null } : {}),
        sources: credit.map((c) => c.n).filter(Boolean), credit: credit.map((c) => c.line).filter(Boolean),
      };
    }),
    credits: { film: plans.film.credits, short: plans.short.credits },
  };
}

function report(R) {
  const { X, plans, out, desc, fmts } = R;
  console.log(`cuts check: ${X.L.file} against ${X.dir}`);
  const rows = [...plans.film.placed, ...plans.film.ov].sort((a, b) => a.a - b.a);
  const inShort = (e) => plans.short.placed.find((p) => p.e === e) || plans.short.ov.find((p) => p.e === e);
  for (const p of rows) {
    const s = inShort(p.e);
    const acid = p.acid === undefined ? '' : p.acid ? ' Acid' : ' Flash';
    console.log(`  line ${String(p.e.line).padStart(3)}  ${secs(p.a).padStart(7)} to ${secs(p.b).padStart(7)}  ${s ? 'film+short' : 'film      '}  ${(p.e.kind + acid).padEnd(11)} "${p.e.phrase}"${p.e.over ? ' (over base)' : ''}`);
  }
  for (const fmt of fmts) {
    const m = plans[fmt].grammar.metrics;
    console.log(`  ${fmt}: ${m.seconds.toFixed(1)} s, the rose alone ${(m.rose * 100).toFixed(1)} percent, ${m.hook} changes in the first 30 s, ${m.changesPerMin.toFixed(1)} changes and ${m.scenesPerMin.toFixed(1)} new scenes a minute in the body, longest rose run ${m.longestRose.toFixed(1)} s, longest with no new scene ${m.noScene.toFixed(1)} s at ${mmss(m.noSceneAt)}`);
    if (desc[fmt]) console.log(`  ${fmt} description: ${desc[fmt].bytes.toLocaleString('en')} of 5,000 bytes, ${desc[fmt].credits.length} source(s) credited`);
  }
  const acid = (fmt) => plans[fmt].ov.filter((o) => o.e.kind === 'pop');
  for (const fmt of fmts) if (acid(fmt).length) console.log(`  ${fmt} pops: ${acid(fmt).filter((o) => o.acid).length} Acid (nothing beneath spends any), ${acid(fmt).filter((o) => !o.acid).length} Flash (over a shot that does); Shock rose stays on the opening field, which nothing covers`);
  for (const n of [...new Set(out.notes)]) console.log(`  note: ${n}`);
  const w = [...new Set(out.warnings)], i = [...new Set(out.issues)];
  if (w.length) console.warn(`cuts check: ${w.length} warning(s), not failing\n  ` + w.join('\n  '));
  if (i.length) console.error(`cuts check: ${i.length} issue(s)\n  ` + i.join('\n  '));
  else console.log(`cuts check: clean (${rows.length} inserts${R.untilF ? `, the grammar to ${secs(R.untilF)} s` : ''})`);
}

/* ---- render ------------------------------------------------------------------------ */
async function render(L) {
  const fmt = argv.includes('--short') ? 'short' : 'film';
  const untilS = +arg('--until', 0);
  const R = await check(L, { only: fmt, untilS });
  const issues = [...new Set(R.out.issues)];
  if (issues.length) die(`fix the check before rendering (${issues.length} issue(s))`);
  const { X, plans } = R, Q = plans[fmt], C = Q.C;
  if (findFfmpeg().codec !== 'libx264') die('needs an ffmpeg with libx264');
  const T = R.untilF ? Math.min(R.untilF, Q.G.total) : Q.G.total;
  const outDir = arg('--out', path.join(X.dir, 'recut'));
  const work = path.join(X.dir, `recut-work-${fmt}`);
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });
  const brandDir = path.join(work, 'brand'); fs.mkdirSync(brandDir);
  const t0 = Date.now();

  // Each insert to its own segment of exactly its frames (tools/lib/shots.mjs), on the film's clock.
  const b = await browser();
  const { ctx, page: pg, show, shot } = await openContext(b, C.F, { frame: 'png' });
  const RS = { work, brandDir, words: X.words, pg, show, shot, missing: new Set(), lastChart: null };
  const placed = Q.placed.filter((p) => p.a < T).map((p) => ({ ...p, b: Math.min(p.b, T) }));
  const segs = new Map();
  for (const [i, p] of placed.entries()) {
    segs.set(p, await renderSegment(C, RS, { t: p.a / FPS, end: p.b / FPS, tag: p.e.tag }, i));
    // A shot's frames go once its segment is encoded: a page shot's are a megabyte or more each, and a film's hundred
    // and fifty inserts kept on disk would fill a runner's 14 GB.
    fs.rmSync(path.join(work, `f${i}`), { recursive: true, force: true });
  }
  // The overlays as stills with their windows on the grid; a pop's three landing frames, then the word.
  const layer = [];
  for (const [j, o] of Q.ov.filter((x) => x.a < T).entries()) {
    const end = Math.min(o.b, T) / FPS;
    if (o.e.kind === 'pop') layer.push(...(await renderPop(C, RS, { t: o.a / FPS, end, tag: o.e.tag, acid: o.acid }, j)).pieces);
    else { const r = await renderOverlay(C, RS, { t: o.a / FPS, end, tag: o.e.tag }, j); layer.push({ png: r.png, t: o.a / FPS, end }); }
  }
  await ctx.close(); await b.close();
  const brand = spawnSync('node', ['tools/check-brand.cjs', brandDir], { encoding: 'utf8' });
  if (brand.status !== 0) { console.error(brand.stdout + brand.stderr); die('a computed insert breaks the kit'); }
  // Shock rose is the opening field's, once a film; no insert may carry it.
  for (const f of fs.readdirSync(brandDir)) if (/#ff1f5a/i.test(fs.readFileSync(path.join(brandDir, f), 'utf8'))) die(`${f} carries Shock rose, which is the opening field's alone`);

  // The clean render between the inserts, cut on the same grid: seeked half a frame early, so the first frame is
  // the one asked for whatever the rounding, and encoded as the segments are, so the pieces join without a re-encode.
  const pieces = [];
  let f = 0;
  const baseCut = (f0, f1) => {
    const out = path.join(work, `base-${String(f0).padStart(6, '0')}.mp4`);
    ff([...(f0 ? ['-ss', ((f0 - 0.5) / FPS).toFixed(6)] : []), '-i', Q.base, '-map', '0:v:0', '-frames:v', String(f1 - f0), '-vf', 'setpts=PTS-STARTPTS,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-an', out], `the clean ${fmt}, frames ${f0} to ${f1}`);
    const n = frameCount(out);
    if (n !== f1 - f0) die(`the clean ${fmt}'s frames ${f0} to ${f1} came out as ${n} frames`);
    return out;
  };
  for (const p of placed) { if (p.a > f) pieces.push(baseCut(f, p.a)); pieces.push(...segs.get(p)); f = p.b; }
  if (f < T) pieces.push(baseCut(f, T));
  fs.writeFileSync(path.join(work, 'list.txt'), pieces.map((x) => `file '${path.resolve(x)}'`).join('\n') + '\n');
  const body = path.join(work, 'body.mp4');
  ff(['-f', 'concat', '-safe', '0', '-i', path.join(work, 'list.txt'), '-c', 'copy', body], 'the concat');
  if (frameCount(body) !== T) die(`the joined picture has ${frameCount(body)} frames, not ${T}`);

  // The overlays as one sparse layer: each still is one frame at its first frame and holds until the next, a
  // transparent frame between them, at 24 a second so every time lands on a frame. One input, not one per still.
  const fin = ['-i', body, '-i', Q.base];
  let graph = null;
  if (layer.length) {
    const clear = path.join(work, 'clear.png');
    ff(['-f', 'lavfi', '-i', `color=c=black@0.0:s=${C.W}x${C.H},format=rgba`, '-frames:v', '1', clear], 'a transparent frame');
    const lines = ['ffconcat version 1.0'], put = (png, n) => { if (n > 0) lines.push(`file '${path.resolve(png)}'`, 'option framerate 24', `duration ${(n / FPS).toFixed(6)}`); };
    let at = 0;
    for (const x of layer.sort((p, q) => p.t - q.t)) {
      const a = Math.round(x.t * FPS), e = Math.round(x.end * FPS);
      put(clear, a - at); put(x.png, e - a); at = e;
    }
    put(clear, Math.max(1, T - at));
    fs.writeFileSync(path.join(work, 'layer.ffconcat'), lines.join('\n') + '\n');
    fin.push('-f', 'concat', '-safe', '0', '-i', path.join(work, 'layer.ffconcat'));
    graph = '[0:v][2:v]overlay=0:0:eof_action=repeat:format=auto[v]';
  }
  // The sound is the clean render's own track, copied: the words stay exactly where the picture was cut to them.
  // The picture keeps the 8 Mbps cap that holds a film under GitHub's 2 GiB asset limit (tools/lib/film.mjs), with
  // six seconds of buffer: at the encoder's 16 Mbit the opening field's dense curves, already compressed once, were
  // starved into blocks (a squared error of 27 against the clean frame, measured 2026-10-20); at 48 under 1.
  const file = path.join(outDir, R.untilF ? usualName(X.E.slug, fmt).replace(/\.mp4$/, '-preview.mp4') : usualName(X.E.slug, fmt));
  ff([...fin, ...(graph ? ['-filter_complex', graph, '-map', '[v]'] : ['-map', '0:v:0']), '-map', '1:a:0?',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-maxrate', '8M', '-bufsize', '48M', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'copy', '-frames:v', String(T), '-t', (T / FPS).toFixed(6), '-movflags', '+faststart', file], 'the compose');
  const n = frameCount(file);
  if (n !== T) die(`${file} has ${n} frames, not ${T}`);
  const sound = audioHashes(file), clean = audioHashes(Q.base);
  if (!sound.length || !sound.every((h, i) => h === clean[i]) || (!R.untilF && sound.length !== clean.length)) die(`${file}'s sound is not the clean ${fmt}'s, packet for packet`);
  console.log(`cuts: ${file}: ${n} frames (${(n / FPS).toFixed(2)} s), ${placed.length} inserts, ${layer.length} overlay stills, the clean ${fmt}'s sound packet for packet, ${((Date.now() - t0) / 60000).toFixed(1)} min wall`);
  if (R.untilF) { console.log('cuts: a preview; nothing filed beside it'); return; }

  // What the release files beside it: the meta under the usual name, the sheet, and the manifest the refile reads.
  const d = R.desc[fmt];
  const metaName = fmt === 'film' ? 'meta.json' : 'meta-short.json';
  fs.writeFileSync(path.join(outDir, metaName), JSON.stringify({ ...d.old, title: d.fm.title, description: d.fm.description, file: path.basename(file), recut: X.L.hash, cuts: 'cuts.json' }, null, 1) + '\n');
  fs.writeFileSync(path.join(outDir, fmt === 'film' ? 'sheet.txt' : 'sheet-short.txt'), sheetText(X.E, d.fm, { short: fmt === 'short', captions: d.old.captions, thumbnail: d.old.thumbnail, file }));
  fs.writeFileSync(path.join(outDir, 'cuts.json'), JSON.stringify(R.manifest, null, 1) + '\n');
  console.log(`cuts: ${metaName}, ${fmt === 'film' ? 'sheet.txt' : 'sheet-short.txt'} and cuts.json in ${outDir}`);
}

/** Each audio packet's hash, in order: two files with the same list carry the same sound at the same times. */
function audioHashes(file) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-map', '0:a:0', '-c', 'copy', '-f', 'framemd5', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 });
  return r.stdout.split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split(',').pop().trim());
}

/* ---- pages: what tools/capture.mjs still has to shoot ------------------------------------ */
function pages(L) {
  const E = edition(L.slug);
  if (!E) die(`${L.slug} is not one of our editions`);
  const X = { L, E, dir: arg('--dir', path.join('brand/youtube', L.slug)) };
  const urls = Object.fromEntries(Object.entries(L.sources).map(([k, v]) => [k, v.url]));
  for (const e of L.entries.filter((x) => x.kind === 'page')) {
    const r = pageCapture(X, e);
    if (r.error) { console.error(`cuts: line ${e.line}: ${r.error}`); continue; }
    if (r.rec && (r.rec.ok || r.rec.refused)) continue;
    // The URL travels with the tag, so capture.mjs needs no cut list; it names the same file either way.
    const url = !r.shot.self && !/\|\s*url\s*:/.test(e.tag.body) ? ` | url: ${urls[r.shot.src]}` : '';
    console.log(`${e.tag.body}${url}`);
  }
}

/* ---- suggest: a draft from the citation marks and the rose ---------------------------------- */
function suggest(slug) {
  const E = edition(slug);
  if (!E) die(`${slug} is not one of our editions`);
  const dir = arg('--dir', path.join('brand/youtube', slug));
  for (const f of ['narration.json', 'timeline.txt']) if (!fs.existsSync(path.join(dir, f))) die(`${path.join(dir, f)} is missing: download it from the release film-${slug}`);
  const N = JSON.parse(fs.readFileSync(path.join(dir, 'narration.json'), 'utf8'));
  const rows = readTimeline(path.join(dir, 'timeline.txt'));
  const list = sourcesOf(E) || [];
  const words = N.blocks.flatMap((b) => (b.words || []).map((w) => ({ ...w, block: b })));
  const W = words.filter((w) => !CITE.test(w.w) && key(w.w)).map((w) => ({ ...w, k: key(w.w) }));
  const pinOf = (f) => (fs.existsSync(path.join(dir, f)) ? sha256File(path.join(dir, f)) : `sha256:<of ${f}, filed by release.yml>`);
  // The shortest phrase from a word that is said once (four words at least, eight at most), else the first four and #n.
  const bare = (w) => w.w.replace(/[.,;:!?"\u201c\u201d()]+$/g, '').replace(/^["\u201c(]+/, '');
  const phraseAt = (i) => {
    for (let n = 4; n <= 8 && i + n <= W.length; n++) { const p = W.slice(i, i + n).map(bare).join(' '); if (!findPhrase(W, p).error) return `"${p}"`; }
    const p = W.slice(i, i + 4).map(bare).join(' '), want = p.split(/\s+/).map(key);
    let nth = 0;
    for (let j = 0; j <= i; j++) if (want.every((k, q) => W[j + q]?.k === k)) nth++;
    return `"${p}" #${nth}`;
  };
  const items = [];
  // A page line per timed citation mark, on its sentence; several marks share a sentence out between them.
  for (let i = 0; i < words.length; i++) {
    if (!CITE.test(words[i].w)) continue;
    let j = i; while (j < words.length && CITE.test(words[j].w)) j++;
    const marks = words.slice(i, j).map((w) => w.w.slice(1, -1).padStart(2, '0'));
    let s = i - 1; while (s > 0 && !/[.?!]["”’)]*$/.test(words[s - 1].w) && !CITE.test(words[s - 1].w)) s--;
    const sentence = words.slice(Math.max(0, s), i).filter((w) => !CITE.test(w.w) && key(w.w));
    marks.forEach((n, k) => {
      const w = sentence[Math.floor((k * sentence.length) / marks.length)];
      if (!w) return;
      const at = W.findIndex((x) => x.s === w.s && x.w === w.w);
      const text = list[+n - 1] || '';
      const own = /\bthis site\b/.test(text);
      const yt = /youtube|youtu\.be/i.test(text);
      items.push({ t: w.s, block: w.block, line: yt ? `<!-- [${n}] is a video on YouTube, never fetched: a pop or a quote card of its words instead, at ${phraseAt(at)} -->` : `@ ${phraseAt(at)}  [[page: ${own ? `self ${n}` : n} | hl: ]]`, n: own || yt ? null : n });
    });
    i = j - 1;
  }
  // Every rose run over 3.6 s, with what is said over it: the gaps the list is for.
  const shown = rows.filter((r) => r.e - r.s > 0.011).sort((a, b) => a.s - b.s);
  for (let k = 0; k + 1 < shown.length; k++) {
    const a = shown[k].e, b = shown[k + 1].s;
    if (b - a <= 3.6) continue;
    const said = words.filter((w) => w.s >= a && w.s < b && !CITE.test(w.w)).map((w) => w.w).join(' ');
    items.push({ t: a, block: words.find((w) => w.s >= a)?.block, line: `<!-- the rose, ${mmss(a)} to ${mmss(b)} (${(b - a).toFixed(1)} s): "${said.replace(/--/g, '-')}" -->` });
  }
  items.sort((p, q) => p.t - q.t);
  const cited = [...new Set(items.map((x) => x.n).filter(Boolean))].sort();
  const out = ['---', `slug: ${slug}`, `narration: ${pinOf('narration.json')}`, `base: ${pinOf(baseName(slug, 'film'))}`, `base-short: ${pinOf(baseName(slug, 'short'))}`, 'hold: 3.6', '---',
    `<!-- Drafted by tools/cuts.mjs suggest from film-${slug}'s narration.json and timeline.txt. Every hl: is blank: copy the words`,
    '     from the source itself, as it serves them. Each source needs its URL; a quote card or a chart citing one needs pub: and date:. -->', '', '# Sources'];
  for (const n of cited) out.push(`- ${n} | <url> | read <YYYY-MM-DD>   <!-- ${String(list[+n - 1] || '').slice(0, 110).replace(/--/g, '-')} -->`);
  let sec = null;
  for (const x of items) {
    const h = x.block?.sec;
    if (h !== sec) { sec = h; const hb = N.blocks.find((b) => b.sec === h && b.kind === 'h2'); out.push('', `## ${hb ? hb.text : 'The opening'}`); }
    out.push(x.line);
  }
  console.log(out.join('\n'));
}

if (CMD === 'suggest') suggest(TARGET);
else {
  const L = parseList(TARGET);
  if (CMD === 'pages') pages(L);
  if (CMD === 'check') { const R = await check(L, { only: arg('--only', null), untilS: +arg('--until', 0) }); process.exit(new Set(R.out.issues).size ? 1 : 0); }
  if (CMD === 'render') await render(L);
}
