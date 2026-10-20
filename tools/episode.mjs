#!/usr/bin/env node
/**
 * The channel's news films (owner, 2026-09-26; CLAUDE.md override 8). A film
 * is cut from a SCRIPT, not from a page: source/episodes/<slug>.md, written in
 * the film voice (source/film/voice.md), with the shots tagged inline where
 * the cut falls. The owner finds the footage the script asks for; everything
 * else (quotes, maps, figures, cards) is computed here in the brand's type.
 *
 *   node tools/episode.mjs check   source/episodes/<slug>.md [--online]
 *   node tools/episode.mjs sheet   source/episodes/<slug>.md
 *   node tools/episode.mjs narrate source/episodes/<slug>.md
 *   node tools/episode.mjs render  source/episodes/<slug>.md [--music none|<file>] [--short]
 *   node tools/episode.mjs all     source/episodes/<slug>.md
 *
 * Work directory: brand/youtube/ep-<slug>/ (gitignored). The owner drops each
 * requested clip in its footage/ folder under the name the sheet gives
 * (`<id>.mp4`, any video extension; `<id>@72.5.mp4` starts it 72.5 s in).
 * A shot whose file is missing renders as a slate naming what it needs, so a
 * render is always possible and the first one is the animatic.
 *
 * FACTS ARE NOT FREE (override 7): `check` fails a script whose sentences
 * carry a number without a source marker, whose markers name no source,
 * whose sources lack a URL or date, or whose quotes name no source. With
 * --online it also fetches every quote's source and fails a quote whose words
 * are not on that page. `render` runs `check` first and refuses to cut a
 * script that fails it. It also WARNS, without failing, when a chart's
 * starred value is not spoken while the chart is on screen (from its tag to
 * the next cut): the chart lands its point on the word that says it, and a
 * starred figure nobody says is a figure nobody reads, or worse, one the
 * picture gives away before the voice gets there.
 *
 * The script format is documented in source/episodes/FORMAT.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { browser, findFfmpeg, openContext, esc, ACID, VOID, FLASH } from './lib/film.mjs';
import { NARRATOR, SITE } from '../src/config.mjs';
import { CHART_TYPES, hotValues, findSpoken } from './lib/chart.mjs';
// The shots themselves (the tag, the computed cards, the footage cut, one shot to one segment) live in
// tools/lib/shots.mjs, so the edition films' cut lists build them the same way.
import { FPS, CUTS, OWNER, GRADE, shotContext, fit, parseTag, page, footageFile, hasAudio, overEnd, ff, warnOnce, renderSegment, renderOverlay } from './lib/shots.mjs';

const [STEP, FILE] = process.argv.slice(2);
const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const ONLINE = process.argv.includes('--online');
if (!['check', 'sheet', 'narrate', 'render', 'all'].includes(STEP) || !FILE || !fs.existsSync(FILE)) {
  console.error('usage: node tools/episode.mjs check|sheet|narrate|render|all source/episodes/<slug>.md'); process.exit(1);
}
// --short renders the same script tall (1080x1920) and cuts the chapters named in `short:` for the Shorts feed.
const SHORT = process.argv.includes('--short');

/* ---- the script ------------------------------------------------------------ */
function parse(file) {
  const src = fs.readFileSync(file, 'utf8');
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(src);
  if (!fm) { console.error(`episode: ${file} has no front matter`); process.exit(1); }
  const meta = {};
  for (const line of fm[1].split('\n')) { const i = line.indexOf(':'); if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
  const body = src.slice(fm[0].length).replace(/<!--[\s\S]*?-->/g, '');
  const sources = {}, blocks = [], issues = [];
  let inSources = false;
  for (const para of body.split(/\n\s*\n/)) {
    const t = para.trim();
    if (!t) continue;
    if (/^#\s+sources\b/i.test(t)) { inSources = true; }
    if (/^##\s/.test(t)) inSources = false;
    if (inSources) {
      for (const l of t.split('\n')) {
        const s = /^-\s*(s\d+)\s*\|(.+)$/.exec(l.trim());
        if (!s) continue;
        const [pub, title, date, url] = s[2].split('|').map((x) => x.trim());
        sources[s[1]] = { id: s[1], pub, title, date, url };
      }
      continue;
    }
    if (/^#\s/.test(t)) continue;
    if (/^##\s/.test(t)) { blocks.push({ kind: 'h2', text: t.replace(/^##\s+/, ''), read: false }); continue; }
    const lone = /^\[\[([\s\S]*?)\]\]$/.exec(t);
    if (lone && /^clip[:#]/.test(lone[1].trim())) { blocks.push({ kind: 'clip', tag: parseTag(lone[1]), read: false, text: '' }); continue; }
    // A narrated paragraph: tags become events anchored at the next word, [sN] markers become citations.
    const events = [], cites = [], tokens = [];
    let rest = t.replace(/\s+/g, ' ');
    const re = /\[\[([\s\S]*?)\]\]|\[(s\d+(?:\s*,\s*s\d+)*)\]/g;
    let last = 0, m;
    const addText = (s) => { for (const w of s.split(' ').filter(Boolean)) tokens.push(w); };
    while ((m = re.exec(rest))) {
      addText(rest.slice(last, m.index));
      if (m[1] !== undefined) { const tag = parseTag(m[1]); if (tag.bad) issues.push(`unknown tag [[${tag.bad.slice(0, 40)}]]`); else events.push({ anchor: tokens.length, tag }); }
      else cites.push({ anchor: tokens.length, ids: m[2].split(',').map((x) => x.trim()) });
      last = m.index + m[0].length;
    }
    addText(rest.slice(last));
    if (!tokens.length) { // a paragraph of tags only: the events land on the next paragraph's first word
      blocks.push({ kind: 'tags', events, read: false, text: '' }); continue;
    }
    blocks.push({ kind: 'p', text: tokens.join(' '), tokens, events, cites, read: true });
  }
  return { meta, sources, blocks, issues };
}

/* ---- check: facts are not free ------------------------------------------- */
async function check(S, { quiet = false } = {}) {
  const issues = [...S.issues];
  const warnings = []; // printed after the issues; they do not fail the check
  for (const k of ['title', 'date']) if (!S.meta[k]) issues.push(`front matter needs ${k}:`);
  // What the videos API refuses at the end of a two-hour render, caught here: a title over 100 characters, and < or >
  // anywhere in a title or the description (developers.google.com/youtube/v3/docs/videos).
  for (const k of ['title', 'title2', 'title3']) if (S.meta[k]) {
    if (S.meta[k].length > 100) issues.push(`${k}: ${S.meta[k].length} characters; YouTube takes 100`);
    if (/[<>]/.test(S.meta[k])) issues.push(`${k}: YouTube refuses < and > in a title`);
  }
  const inDescription = [S.meta.hook, S.blocks.find((x) => x.kind === 'p')?.text, ...S.blocks.filter((x) => x.kind === 'h2').map((x) => x.text), ...Object.values(S.sources).flatMap((x) => [x.pub, x.title])].filter(Boolean);
  for (const x of inDescription.filter((x) => /[<>]/.test(x))) issues.push(`YouTube refuses < and > in a description: "${x.slice(0, 70)}"`);
  for (const s of Object.values(S.sources)) {
    if (!/^https?:\/\//.test(s.url || '')) issues.push(`${s.id}: no URL`);
    if (!/^\d{4}(-\d{2}){0,2}$/.test(s.date || '')) issues.push(`${s.id}: date must be YYYY, YYYY-MM or YYYY-MM-DD, got "${s.date}"`);
  }
  const used = new Set();
  // The words spoken while a cut tag's shot is on screen: from its word to the next cut, across paragraphs
  // (a tags-only line holds in silence and the next paragraph plays over it); a clip or a cutting tags line ends it.
  const onScreen = (bi, e) => {
    const words = [];
    for (let j = bi; j < S.blocks.length; j++) {
      const b = S.blocks[j];
      if (j > bi && (b.kind === 'clip' || (b.kind === 'tags' && b.events.some((o) => CUTS.includes(o.tag.kind))))) break;
      if (b.kind !== 'p') continue;
      const next = b.events.filter((o) => CUTS.includes(o.tag.kind) && (j > bi || b.events.indexOf(o) > b.events.indexOf(e))).map((o) => o.anchor);
      words.push(...b.tokens.slice(j === bi ? e.anchor : 0, next.length ? Math.min(...next) : b.tokens.length));
      if (next.length) break;
    }
    return words;
  };
  for (const [bi, b] of S.blocks.entries()) {
    // A tags-only line has no sentences, but its tags are checked like any other: they cite through the next paragraph.
    if (b.kind !== 'p' && b.kind !== 'tags') continue;
    const cites = b.kind === 'p' ? b.cites : (S.blocks.slice(bi + 1).find((x) => x.kind === 'p') || { cites: [] }).cites;
    // Sentences by token range; a marker belongs to the sentence holding the token before it.
    const sent = []; let start = 0;
    (b.tokens || []).forEach((w, i) => { if (/[.?!]["”’)]*$/.test(w) || i === b.tokens.length - 1) { sent.push({ a: start, b: i, cited: false }); start = i + 1; } });
    for (const c of b.cites || []) {
      for (const id of c.ids) { used.add(id); if (!S.sources[id]) issues.push(`[${id}] cited but not in # Sources`); }
      const s = sent.find((x) => c.anchor - 1 >= x.a && c.anchor - 1 <= x.b); if (s) s.cited = true;
    }
    for (const s of sent) {
      const text = b.tokens.slice(s.a, s.b + 1).join(' ');
      if (/\d/.test(text) && !s.cited) issues.push(`uncited number: "${text.slice(0, 90)}"`);
    }
    for (const e of b.events) {
      if (e.tag.kind === 'quote') {
        if (!S.sources[e.tag.src]) issues.push(`quote cites "${e.tag.src}", which is not in # Sources`); else used.add(e.tag.src);
        if (!e.tag.text) issues.push('quote has no text');
      }
      if (CUTS.includes(e.tag.kind) && b.events.some((o) => o !== e && o.anchor === e.anchor && CUTS.includes(o.tag.kind) && b.events.indexOf(o) > b.events.indexOf(e))) issues.push(`two cuts on one word; the ${e.tag.kind} would get no screen time: "${(b.tokens || onScreen(bi, e)).slice(e.anchor, e.anchor + 5).join(' ')}"`);
      if (e.tag.kind === 'chart') {
        // A chart is a set of numbers, so it carries its own citations and they are on screen.
        if (!CHART_TYPES.includes(e.tag.type)) issues.push(`chart type "${e.tag.type}" is not one of ${CHART_TYPES.join(', ')}`);
        if (!e.tag.title) issues.push('chart has no title (the title is the takeaway, not the axis name)');
        issues.push(...e.tag.errors.map((x) => `chart "${e.tag.title}": ${x}`));
        if (!e.tag.srcs.length) issues.push(`chart "${e.tag.title}" cites no source (src: s1, s2)`);
        for (const id of e.tag.srcs) { if (!S.sources[id]) issues.push(`chart "${e.tag.title}" cites ${id}, which is not in # Sources`); else used.add(id); }
        if (e.tag.type !== 'flow' && e.tag.type !== 'timeline' && e.tag.rows.filter((r) => r.hot).length > 1) issues.push(`chart "${e.tag.title}": one point is the story; mark one row with *, not ${e.tag.rows.filter((r) => r.hot).length}`);
        // The chart lands its point on the word that says it (render); a point nobody says while it is on screen cannot land.
        const values = CHART_TYPES.includes(e.tag.type) ? hotValues(e.tag.type, e.tag.rows) : [];
        const typed = (e.tag.type === 'line' ? e.tag.rows.slice().sort((p, q) => p.t - q.t).slice(-1) : e.tag.rows.filter((r) => r.hot)).map((r) => r.text ?? (r.rb ? `${r.ra}..${r.rb}` : r.ra)).join(', ');
        if (values.length && findSpoken(onScreen(bi, e).map((w) => ({ w })), values) < 0) warnings.push(`chart "${e.tag.title}": its point (${typed}) is not spoken while the chart is on screen (its tag to the next cut), so it lands on the chart's own timing, ahead of the voice or without it`);
      }
      if (e.tag.kind === 'map' && e.tag.stops.some((x) => !x)) issues.push(`map stops must be "Name lat,lon > Name lat,lon": ${e.tag.args[0]}`);
      if ((e.tag.kind === 'fig' || e.tag.kind === 'over') && /\d/.test(e.tag.value) && !cites.length) issues.push(`figure "${e.tag.value}" sits in a paragraph with no citation`);
    }
  }
  for (const id of Object.keys(S.sources)) if (!used.has(id)) issues.push(`${id} is listed but never cited`);
  if (ONLINE) {
    const norm = (s) => s.toLowerCase().replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
    for (const b of S.blocks) for (const e of (b.events || [])) {
      if (e.tag.kind !== 'quote' || !S.sources[e.tag.src]) continue;
      try {
        // A declared agent naming the site: SEC.gov refuses anonymous scripts (fair-access policy) and accepts this.
        const r = await fetch(S.sources[e.tag.src].url, { headers: { 'user-agent': `Mozilla/5.0 (compatible; Aedificare episode check; +${SITE.origin})` } });
        let body = r.ok ? await r.text() : null;
        // Some publishers refuse Node's fetch and serve curl (Utility Dive, 2026-09-26): ask again that way before giving up.
        if (body === null) {
          const c = spawnSync('curl', ['-sSL', '--max-time', '60', '-A', `Mozilla/5.0 (compatible; Aedificare episode check; +${SITE.origin})`, S.sources[e.tag.src].url], { encoding: 'utf8', maxBuffer: 1 << 26 });
          if (c.status === 0 && c.stdout.length > 2000) body = c.stdout;
        }
        // A page that still refuses (403, a login wall) proves nothing either way: warned, not failed.
        if (body === null) { console.warn(`episode check: ${e.tag.src} answered ${r.status}; verify its quote by hand`); continue; }
        const page = norm(body);
        if (!page.includes(norm(e.tag.text))) issues.push(`quote not found on ${e.tag.src}: "${e.tag.text.slice(0, 70)}"`);
      } catch (err) { console.warn(`episode check: could not fetch ${e.tag.src} (${err.message}); verify its quote by hand`); }
    }
  }
  if (!quiet) {
    if (issues.length) { console.error(`episode check: ${issues.length} issue(s)\n  ` + issues.join('\n  ')); }
    else console.log(`episode check: clean (${Object.keys(S.sources).length} sources, ${S.blocks.filter((b) => b.kind === 'p').length} paragraphs${ONLINE ? ', quotes found online' : ''})`);
    if (warnings.length) console.warn(`episode check: ${warnings.length} warning(s), not failing\n  ` + warnings.join('\n  '));
  }
  return issues;
}

/* ---- paths ----------------------------------------------------------------- */
const S = parse(FILE);
const SLUG = S.meta.slug || path.basename(FILE, '.md');
const DIR = path.join('brand/youtube', `ep-${SLUG}`);
// What every shot is built from: the script, the frame with its margins and type sizes, and the footage folder.
const C = shotContext({ S, short: SHORT, dir: DIR });
const FOOT = C.FOOT;
fs.mkdirSync(FOOT, { recursive: true });
const SEED = (S.meta.date || '').replace(/-/g, '').slice(2) || '0';

/* ---- the timeline ---------------------------------------------------------- */
/** Every event with its time in the finished film; clips push everything after them later. */
function timeline() {
  const N = JSON.parse(fs.readFileSync(path.join(DIR, 'narration.json'), 'utf8'));
  let shift = 0, pending = [];
  const events = [], clips = [], chapters = [], words = [];
  N.blocks.forEach((nb, i) => {
    const b = S.blocks[i];
    if (b.kind === 'h2') { chapters.push({ text: b.text, block: i }); return; }
    if (b.kind === 'tags') {
      // A line of tags alone is a beat of its own when it cuts (a title drop, a statement card): it holds in
      // silence for `hold` seconds (default three beats) and pushes everything after it later, like a clip.
      const cutTags = b.events.filter((e) => CUTS.includes(e.tag.kind)).map((e) => e.tag);
      if (!cutTags.length) { pending.push(...b.events.map((e) => e.tag)); return; }
      const t = nb.start + shift, dur = +(cutTags[0].hold || 2.7);
      for (const c of chapters) if (c.t === undefined) c.t = t;
      clips.push({ at: nb.start, t, dur, tag: { kind: 'hold' }, f: null });
      events.push(...b.events.map((e) => ({ t, tag: e.tag })));
      shift += dur + 0.3;
      return;
    }
    if (b.kind === 'clip') {
      const f = footageFile(C, b.tag.id);
      if (f && !f.still) {
        // A clip is cut by its length, so a file that cannot state one, or that starts past its own end, stops the render
        // here with the file's name, not an hour later with ffmpeg's "whole_dur out of range" (both found 2026-10-03).
        if (!(f.len > 0)) { console.error(`episode: ${path.basename(f.file)} reports no duration (a stream dump or a cut-off download); remux it first: ffmpeg -i <file> -c copy <file>.mp4`); process.exit(1); }
        if (f.inPoint >= f.len) { console.error(`episode: ${path.basename(f.file)} starts at ${f.inPoint} s but the file runs ${f.len.toFixed(1)} s`); process.exit(1); }
      }
      // A still named as a clip is a card held while its words are said, not one frame.
      const dur = b.tag.dur || (f && !f.still ? Math.max(1 / FPS, Math.min(12, f.len - f.inPoint)) : Math.max(3, (b.tag.say || '').split(' ').length / 2.6));
      const t = nb.start + shift;
      for (const c of chapters) if (c.t === undefined) c.t = t;
      clips.push({ at: nb.start, t, dur, tag: b.tag, f });
      events.push({ t, tag: b.tag, clip: true }, ...pending.map((tag) => ({ t, tag })));
      pending = [];
      shift += dur + 0.3;
      return;
    }
    const tw = nb.words || [];
    const at = (anchor) => {
      const k = tw.length === b.tokens.length ? anchor : Math.round((anchor * tw.length) / b.tokens.length);
      return (k < tw.length ? tw[k].s : nb.end) + shift;
    };
    for (const tag of pending) events.push({ t: nb.start + shift, tag });
    pending = [];
    for (const e of b.events) events.push({ t: at(e.anchor), tag: e.tag });
    for (const w of tw) words.push({ ...w, s: w.s + shift, e: w.e + shift });
    for (const c of chapters) if (c.t === undefined) c.t = nb.start + shift;
  });
  const total = N.duration + shift + 0.6;
  events.sort((a, b) => a.t - b.t);
  const cuts = events.filter((e) => CUTS.includes(e.tag.kind));
  // The first cut owns the lead-in silence; a blank opens the film only when nothing is cut before the first two seconds.
  if (!cuts.length || cuts[0].t > 2) cuts.unshift({ t: 0, tag: { kind: 'blank' } });
  cuts[0].t = 0;
  const shots = cuts.map((c, i) => ({ ...c, end: i + 1 < cuts.length ? cuts[i + 1].t : total }));
  shots.push({ t: total, end: total + 3.6, tag: { kind: 'end' } });
  const all = events.map((e) => e.t).concat([total]);
  const overs = events.filter((e) => e.tag.kind === 'over').map((e) => ({ ...e, end: overEnd(e, Math.min(...all.filter((x) => x > e.t + 0.01)), words) }));
  return { N, shots, overs, clips, chapters, words, total, end: total + 3.6 };
}

/* ---- sheet: what the owner finds ------------------------------------------ */
function sheet(T) {
  const want = [];
  const seen = new Set();
  const add = (tag, dur, t) => { if (seen.has(tag.id)) return; seen.add(tag.id); want.push({ tag, dur, t }); };
  if (T) for (const s of T.shots) { if (OWNER.includes(s.tag.kind)) add(s.tag, s.end - s.t, s.t); }
  else for (const b of S.blocks) {
    if (b.kind === 'clip') add(b.tag, b.tag.dur || 6, null);
    for (const e of (b.events || [])) if (OWNER.includes(e.tag.kind)) add(e.tag, null, null);
  }
  const mmss = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
  const lines = [`# Footage for "${S.meta.title}"`, '',
    `Name each file exactly as below (any video extension, or a still: jpg, png) and attach it to the GitHub Release \`footage-${SLUG}\` (or drop it in \`${FOOT}/\` on your own machine). To start a clip partway in, add -at-seconds: \`${want[0]?.tag.id || 'id'}-at-72.5.mp4\`.`,
    'Footage and gags are graded to the channel look and play silent; clips play WITH their sound and the narration waits for them.',
    'Missing files render as a slate, so you can render at any point and see what is still needed.', ''];
  for (const kind of ['clip', 'footage', 'gag']) {
    const rows = want.filter((w) => w.tag.kind === kind);
    if (!rows.length) continue;
    lines.push(`## ${kind === 'clip' ? 'Clips (sound on: a person saying it)' : kind === 'gag' ? 'Gags (the exclamation marks)' : 'Footage (silent, graded)'}`, '');
    for (const { tag, dur, t } of rows) {
      const have = footageFile(C, tag.id);
      lines.push(`- [${have ? 'x' : ' '}] **${tag.id}**${dur ? ` · ${dur.toFixed(1)} s` : ''}${t !== null && t !== undefined ? ` · at ${mmss(t)}` : ''}`);
      lines.push(`  ${tag.desc}`);
      if (have && !have.still && have.inPoint >= have.len) lines.push(`  In hand, but ${path.basename(have.file)} starts at ${have.inPoint} s and the file runs ${have.len.toFixed(1)} s: lower the -at- number.`);
      else if (have && !have.still && tag.kind !== 'clip' && dur && have.len - have.inPoint < dur) lines.push(`  In hand, ${(have.len - have.inPoint).toFixed(1)} s from its in-point for a ${dur.toFixed(1)} s shot, so it repeats; a longer file or an earlier -at-.`);
      if (tag.say) lines.push(`  Says: "${tag.say}"`);
      if (tag.find) lines.push(`  Find: ${tag.find}`);
    }
    lines.push('');
  }
  lines.push('Credits: list each file\'s source in footage/credits.txt, one line per file ("id: source, licence"); the description carries them.', '');
  fs.writeFileSync(path.join(DIR, 'shots.md'), lines.join('\n'));
  console.log(lines.join('\n'));
  console.log(`episode sheet: ${want.length} shot(s) to find, ${want.filter((w) => footageFile(C, w.tag.id)).length} in hand -> ${DIR}/shots.md`);
}

/* ---- narrate ----------------------------------------------------------------- */
const NARRATE_AS = process.env.NARRATOR || NARRATOR; // the channel's voice unless NARRATOR overrides it
const spoken = () => JSON.stringify({ voice: 'am_michael', narrator: NARRATE_AS, speed: +(S.meta.speed || 1.05), seed: SEED, blocks: S.blocks.map((b, i) => ({ i, kind: b.kind, text: b.text || '', read: b.read })) }, null, 1) + '\n';
/** The narration on disk is stale when the words, the block order, the speed or the narrator changed since it was spoken. */
const stale = () => !fs.existsSync(path.join(DIR, 'narration.json')) || !fs.existsSync(path.join(DIR, 'script.json')) || fs.readFileSync(path.join(DIR, 'script.json'), 'utf8') !== spoken();

function narrate() {
  fs.writeFileSync(path.join(DIR, 'script.json'), spoken());
  const r = spawnSync('uv', ['run', '-q', 'tools/narrate.py', DIR], { stdio: 'inherit', env: { ...process.env, NARRATOR: NARRATE_AS } });
  if (r.status !== 0) { console.error('episode: narration failed'); process.exit(r.status === 75 ? 75 : 1); }
}

/* ---- render ------------------------------------------------------------------ */
/**
 * The Short's pieces: the chapters named in `short:` (the first by default) cut from the tall render, then the end
 * card, inside YouTube's three-minute ceiling. Planned before a frame is rendered, so an unknown chapter or a list
 * that overruns the cap is said at the start; a piece the cap leaves empty is dropped, because `-ss x -to x` is an
 * ffmpeg error at the end of the render (found 2026-10-03).
 */
function shortPlan(T) {
  const named = T.chapters.filter((c) => c.t !== undefined);
  const want = (S.meta.short || named[0]?.text || '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  const unknown = want.filter((w) => !named.some((c) => c.text.toLowerCase() === w));
  if (unknown.length) { console.error(`episode: short: names no chapter "${unknown.join('", "')}"; chapters are: ${named.map((c) => c.text).join(', ')}`); process.exit(1); }
  const segs = [];
  for (const [k, c] of named.entries()) if (want.includes(c.text.toLowerCase())) segs.push([k === 0 ? 0 : c.t, k + 1 < named.length ? named[k + 1].t : T.total]);
  const cap = 179 - (T.end - T.total);
  const asked = segs.reduce((n, [a, b]) => n + b - a, 0);
  let room = cap;
  for (const sg of segs) { const len = Math.min(sg[1] - sg[0], Math.max(0, room)); sg[1] = sg[0] + len; room -= len; }
  const kept = segs.filter(([a, b]) => b - a >= 1 / FPS);
  if (asked > cap) warnOnce(`episode: the Short's named chapters run ${asked.toFixed(0)} s against a cap of ${cap.toFixed(0)} s before the end card; cut at ${(cap).toFixed(1)} s${kept.length < segs.length ? `, ${segs.length - kept.length} chapter(s) dropped entirely` : ''}; name fewer chapters in short:`);
  kept.push([T.total, T.end]);
  return kept;
}

/**
 * The upload's description: the hook, the chapters, every source, the footage credits, the voice, the music.
 * Written once here so it can be measured before a frame is rendered: YouTube takes 5,000 bytes and the first
 * description that carried a full credits list ran 5,489 (found 2026-10-03).
 * Chapters only as YouTube shows them (support.google.com/youtube/answer/9884579): three or more, the first at 0:00,
 * none under ten seconds; otherwise the list is left out and said, because a list YouTube ignores is noise.
 */
function describe(T, bedLine) {
  const mmss = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
  const chapters = T.chapters.filter((c) => c.t !== undefined);
  const entries = !chapters.length ? [] : chapters[0].t < 10 ? chapters.map((c, i) => ({ t: i ? c.t : 0, text: c.text })) : [{ t: 0, text: 'Cold open' }, ...chapters.map((c) => ({ t: c.t, text: c.text }))];
  const brief = entries.filter((c, i) => (entries[i + 1]?.t ?? T.total) - c.t < 10);
  let chapterLines = [];
  if (entries.length && entries.length < 3) warnOnce(`episode: ${entries.length} chapter(s); YouTube shows chapters from three, so the description lists none`);
  else if (brief.length) warnOnce(`episode: chapter(s) under ten seconds (${brief.map((c) => c.text).join(', ')}); YouTube then shows no chapters at all, so the description lists none; move or merge the heading`);
  else chapterLines = entries.map((c) => `${mmss(c.t)} ${c.text}`);
  const sources = Object.values(S.sources).map((s, i) => `${i + 1}. ${s.pub}, ${s.title} (${s.date}) ${s.url}`);
  const creditsFile = path.join(FOOT, 'credits.txt');
  const credits = fs.existsSync(creditsFile) ? fs.readFileSync(creditsFile, 'utf8').trim().split('\n').filter(Boolean) : [];
  const bad = credits.filter((l) => /[<>]/.test(l));
  if (bad.length) { console.error(`episode: footage/credits.txt holds < or >, which YouTube refuses in a description: "${bad[0].slice(0, 70)}"`); process.exit(1); }
  // Every file in use is credited or named here; the first episode's footage sheet never said where the credits go.
  const inUse = [...new Set(T.shots.filter((s) => OWNER.includes(s.tag.kind) && footageFile(C, s.tag.id)).map((s) => s.tag.id))];
  const uncredited = inUse.filter((id) => !credits.some((l) => l.toLowerCase().startsWith(`${id.toLowerCase()}:`)));
  if (uncredited.length) warnOnce(`episode: ${uncredited.length} file(s) in use with no line in footage/credits.txt ("id: source, licence"): ${uncredited.join(', ')}`);
  const firstP = S.blocks.find((x) => x.kind === 'p');
  const text = [
    S.meta.hook || firstP.text,
    '',
    ...chapterLines, ...(chapterLines.length ? [''] : []),
    'Sources:',
    ...sources,
    '',
    ...(credits.length ? ['Footage:', ...credits, ''] : []),
    `Voice: synthetic, ${T.N.model} ${T.N.voice}. Quotes are the speakers' own words, cited above.`,
    bedLine,
    SITE.origin,
  ].join('\n');
  const bytes = Buffer.byteLength(text);
  if (bytes > 5000) { console.error(`episode: the description runs ${bytes.toLocaleString('en')} bytes and YouTube takes 5,000; shorten the source titles or the credits lines`); process.exit(1); }
  return text;
}

async function render() {
  const issues = await check(S, { quiet: true });
  if (issues.length) { await check(S); console.error('episode: fix the check before rendering'); process.exit(1); }
  // The Short is cut from the film's narration; speaking it again here could only change the voice or spend the quota.
  if (stale() && SHORT) { console.error('episode: the narration is stale or missing for this narrator; render the film first, then the Short'); process.exit(1); }
  if (stale()) narrate();
  const FFx = findFfmpeg();
  if (FFx.codec !== 'libx264') { console.error('episode: needs an ffmpeg with libx264'); process.exit(1); }
  const T = timeline();
  // Said before the first frame: the Short's plan, the description's length, the chapters YouTube will show, the credits.
  const music = arg('--music', 'bed');
  const bedLine = (bedFile) => bedFile === null ? 'Music: none.' : music === 'bed' ? `Music: computed from r = cos(kθ), seed ${SEED}; no third-party audio.` : `Music: ${path.basename(bedFile)} (add the licence credit here)`;
  if (SHORT) shortPlan(T); else describe(T, bedLine(music === 'none' ? null : music));
  const work = path.join(DIR, SHORT ? 'work-short' : 'work'); fs.rmSync(work, { recursive: true, force: true }); fs.mkdirSync(work, { recursive: true });
  const t0 = Date.now();

  // Brand check over every computed surface we typed; quoted words are someone else's and are checked by --online, not by the kit.
  const b = await browser();
  const { ctx, page: pg, show, shot } = await openContext(b, C.F, { frame: 'png' });
  const brandDir = path.join(work, 'brand'); fs.mkdirSync(brandDir);

  // Each shot to its own segment on the frame grid (tools/lib/shots.mjs); R carries what runs across shots.
  const segs = [];
  const missing = new Set();
  const R = { work, brandDir, words: T.words, pg, show, shot, missing, lastChart: null };
  for (let i = 0; i < T.shots.length; i++) segs.push(...await renderSegment(C, R, T.shots[i], i));
  // Overlays: one transparent still each, cut in and out on the word.
  const overs = [];
  for (const [j, o] of T.overs.entries()) overs.push(await renderOverlay(C, R, o, j));
  // Thumbnails: a frame of the named shot, graded, with two lines of type. Up to three variants for YouTube's
  // Test & Compare (thumb/thumbframe, thumb2/thumbframe2, thumb3/thumbframe3; a variant without its own frame
  // uses the first one's): thumb.png, thumb-b.png, thumb-c.png.
  const thumbs = [['', 'thumb.png'], ['2', 'thumb-b.png'], ['3', 'thumb-c.png']]
    .filter(([n]) => S.meta[`thumb${n}`])
    .map(([n, file]) => ({ n, file, text: S.meta[`thumb${n}`], frame: S.meta[`thumbframe${n}`] || S.meta.thumbframe || '' }));
  const { W, H, M } = C;
  for (const v of SHORT ? [] : thumbs) {
    const [line1, line2 = ''] = v.text.split('/').map((x) => x.trim());
    const tm = /^(.*?)(?:(?:@|-at-)([\d.]+))?$/.exec(v.frame);
    const tid = tm[1], tat = tm[2] || '0';
    const tf = tid ? footageFile(C, tid) : null;
    let bg = '';
    if (tf) {
      const jpg = path.join(work, `thumb${v.n}-bg.jpg`);
      const tfit = tf.h > tf.w && W > H ? `scale=-2:${H},pad=${W}:${H}:(ow-iw)/2:0:color=${VOID}` : `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`;
      ff([...(tf.still ? [] : ['-ss', String(tf.inPoint + +tat)]), '-i', tf.file, '-frames:v', '1', '-vf', `${tfit},${GRADE.replace(/,noise=[^,]+$/, '')}`, jpg], 'thumbnail frame');
      bg = `<img src="data:image/jpeg;base64,${fs.readFileSync(jpg).toString('base64')}" style="position:absolute;inset:0;width:${W}px;height:${H}px">`;
    }
    const th = page(C, `${bg}<div class="big" style="bottom:${M + 190}px;font-size:${fit(C, line1, line1.length > 8 ? 330 : 420)}px;color:${ACID}">${esc(line1)}</div><div class="big" style="bottom:${M}px;font-size:${fit(C, line2, 170)}px;color:${FLASH}">${esc(line2)}</div>`);
    fs.writeFileSync(path.join(brandDir, `thumb${v.n}.html`), th.replace(/<img[^>]+>/, ''));
    await show({ id: `thumb${v.n}`, html: th });
    fs.writeFileSync(path.join(work, `thumb${v.n}-1080.png`), await shot({ type: 'png' }));
    ff(['-i', path.join(work, `thumb${v.n}-1080.png`), '-vf', 'scale=1280:720', path.join(DIR, v.file)], 'thumbnail');
  }
  await ctx.close(); await b.close();
  const brand = spawnSync('node', ['tools/check-brand.cjs', brandDir], { encoding: 'utf8' });
  if (brand.status !== 0) { console.error(brand.stdout + brand.stderr); console.error('episode: a computed shot breaks the kit'); process.exit(1); }

  // Picture: concat, then the overlays.
  fs.writeFileSync(path.join(work, 'list.txt'), segs.map((s) => `file '${path.resolve(s)}'`).join('\n'));
  const body = path.join(work, 'body.mp4');
  ff(['-f', 'concat', '-safe', '0', '-i', path.join(work, 'list.txt'), '-c', 'copy', body], 'concat');

  // Sound: the narration, opened at each clip for the clip's own sound, then the bed under all of it.
  // The narration is levelled to -16 LUFS once, in two passes (measure, then apply with the measured values, linear
  // where the peaks allow), and each clip is levelled to the same figure on its own above. One dynamic loudnorm over
  // the finished track did neither well: it left a quiet clip at -50 and, once clips were levelled, lifted them 7 dB
  // above the voice as its gain trailed the speech around them (measured 2026-10-03).
  const raw = path.join(DIR, 'narration.wav');
  const meas = spawnSync('ffmpeg', ['-hide_banner', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 26 });
  const mj = JSON.parse(meas.stderr.slice(meas.stderr.lastIndexOf('{')));
  const narr = path.join(work, 'narration-16.wav');
  ff(['-i', raw, '-af', `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${mj.input_i}:measured_TP=${mj.input_tp}:measured_LRA=${mj.input_lra}:measured_thresh=${mj.input_thresh}:offset=${mj.target_offset}:linear=true,aresample=48000`, '-ar', '48000', narr], 'narration level');
  const ins = ['-i', narr];
  const parts = [];
  let from = 0;
  T.clips.forEach((c, k) => {
    parts.push(`[0:a]atrim=${from}:${c.at},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=mono[n${k}]`);
    // Each clip is trimmed to its length in the graph too (`-t 0` would mean unlimited) and levelled to the voice's
    // -16 LUFS on its own: the one loudnorm over the whole track pulled loud clips down but left a quiet one under
    // the bed (measured -50.6 LUFS against -16, 2026-10-03).
    if (c.f && hasAudio(c.f.file)) { ins.push('-ss', String(c.f.inPoint), '-t', String(c.dur), '-i', c.f.file); parts.push(`[${ins.filter((x) => x === '-i').length - 1}:a]aresample=48000,aformat=channel_layouts=mono,atrim=0:${c.dur},loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,apad=whole_dur=${c.dur + 0.3}[c${k}]`); }
    else parts.push(`anullsrc=r=48000:cl=mono,atrim=0:${c.dur + 0.3}[c${k}]`);
    from = c.at;
  });
  parts.push(`[0:a]atrim=${from},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=mono[nz]`);
  const order = T.clips.map((_, k) => `[n${k}][c${k}]`).join('') + '[nz]';
  parts.push(`${order}concat=n=${T.clips.length * 2 + 1}:v=0:a=1,apad=whole_dur=${T.end}[v]`);
  const voice = path.join(work, 'voice.wav');
  ff([...ins, '-filter_complex', parts.join(';'), '-map', '[v]', '-ar', '48000', voice], 'voice');

  let bedFile = null;
  if (music === 'bed') {
    const bd = path.join(work, 'bed'); fs.mkdirSync(bd);
    fs.writeFileSync(path.join(bd, 'narration.json'), JSON.stringify({ duration: T.total, blocks: [] }));
    fs.writeFileSync(path.join(bd, 'script.json'), JSON.stringify({ seed: SEED }));
    if (spawnSync('uv', ['run', '-q', 'tools/bed.py', bd], { stdio: 'inherit' }).status === 0) bedFile = path.join(bd, 'bed.wav');
  } else if (music !== 'none') bedFile = music;

  const film = SHORT ? path.join(work, 'full-tall.mp4') : path.join(DIR, `${SLUG}.mp4`);
  const fin = ['-i', body, '-i', voice];
  if (bedFile) fin.push('-i', bedFile);
  const ov = [];
  let last = '0:v';
  overs.forEach((o, j) => {
    fin.push('-loop', '1', '-i', o.png);
    const idx = 2 + (bedFile ? 1 : 0) + j;
    ov.push(`[${last}][${idx}:v]overlay=0:0:enable='between(t,${o.t.toFixed(3)},${o.end.toFixed(3)})':shortest=1[o${j}]`);
    last = `o${j}`;
  });
  const graph = [...ov];
  graph.push(bedFile ? `[2:a]aresample=48000,volume=0.35,apad=whole_dur=${T.end}[b];[1:a][b]amix=inputs=2:normalize=0:duration=first[a]` : '[1:a]anull[a]');
  ff([...fin, '-filter_complex', graph.join(';'), '-map', ov.length ? `[${last}]` : '0:v', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-maxrate', '8M', '-bufsize', '16M', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-t', String(T.end), film], 'final mix');

  // Captions from the words; a clip's own words as one cue.
  const cues = [];
  let sent = [];
  const emit = () => { if (!sent.length) return; const k = Math.ceil(sent.length / 8), size = Math.ceil(sent.length / k); for (let i = 0; i < sent.length; i += size) { const c = sent.slice(i, i + size); cues.push({ s: c[0].s, e: c[c.length - 1].e, text: c.map((w) => w.w).join(' ') }); } sent = []; };
  for (const w of T.words) { sent.push(w); if (/[.?!]["”’)]*$/.test(w.w)) emit(); }
  emit();
  for (const c of T.clips) if (c.tag.say) cues.push({ s: c.t, e: c.t + c.dur, text: c.tag.say });
  cues.sort((a, b) => a.s - b.s);
  const ts = (x) => { const h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), s = Math.floor(x % 60), ms = Math.round((x % 1) * 1000); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`; };
  const srt = (list) => list.map((c, i) => `${i + 1}\n${ts(c.s)} --> ${ts(c.e)}\n${c.text}\n`).join('\n');
  const sources = Object.values(S.sources).map((s, i) => `${i + 1}. ${s.pub}, ${s.title} (${s.date}) ${s.url}`);
  const firstP = S.blocks.find((x) => x.kind === 'p');

  if (SHORT) {
    // The Short: the chapters named in `short:` (the first chapter by default), then the end card, cut from the
    // tall render with voice and bed cut the same way, inside YouTube's three-minute ceiling for Shorts.
    const segs = shortPlan(T);
    const cutFrames = (x) => (Math.round(x * FPS) / FPS).toFixed(4);
    // One input per piece, seeked to it: trimming several pieces from one input makes ffmpeg hold every decoded frame
    // between them in memory (a 1080x1920 film ran the sandbox out of it on 2026-09-26).
    const ins = segs.flatMap(([a, b]) => ['-ss', cutFrames(a), '-to', cutFrames(b), '-i', film]);
    const g = segs.map((_, k) => `[${k}:v]setpts=PTS-STARTPTS[v${k}];[${k}:a]asetpts=PTS-STARTPTS[a${k}]`).join(';')
      + ';' + segs.map((_, k) => `[v${k}][a${k}]`).join('') + `concat=n=${segs.length}:v=1:a=1[v][a]`;
    const short = path.join(DIR, `${SLUG}-short.mp4`);
    ff([...ins, '-filter_complex', g, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-maxrate', '8M', '-bufsize', '16M',
      '-pix_fmt', 'yuv420p', '-r', String(FPS), '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', short], 'the Short');
    const remap = (x) => { let acc = 0; for (const [a, b] of segs) { if (x >= a && x < b) return acc + (x - a); acc += b - a; } return null; };
    const shortCues = cues.map((c) => ({ ...c, s: remap(c.s), e: remap(Math.min(c.e, segs.find(([a, b]) => c.s >= a && c.s < b)?.[1] ?? c.e) - 0.001) })).filter((c) => c.s !== null && c.e !== null);
    fs.writeFileSync(path.join(DIR, 'captions-short.srt'), srt(shortCues));
    const len = segs.reduce((n, [a, b]) => n + b - a, 0);
    const description = [S.meta.hook || firstP.text, '', 'The full film is on the channel.', '', 'Sources:', ...sources, '', `Voice: synthetic, ${T.N.model} ${T.N.voice}.`, SITE.origin].join('\n');
    fs.writeFileSync(path.join(DIR, 'meta-short.json'), JSON.stringify({
      kind: 'short', slug: SLUG, title: S.meta.title, description, file: path.basename(short), captions: 'captions-short.srt',
      thumbnail: null, categoryId: '28', licence: 'youtube', madeForKids: false, duration: Math.round(len),
    }, null, 1) + '\n');
    fs.writeFileSync(path.join(DIR, 'sheet-short.txt'), `Title: ${S.meta.title}\n\nDescription:\n${description}\n\nCaptions: captions-short.srt (English). Licence: Standard YouTube Licence. YouTube files it as a Short by its shape and length.\n`);
    console.log(`episode: ${short} ${len.toFixed(1)} s from ${segs.length - 1} chapter(s) and the end card, ${Math.round(fs.statSync(short).size / 1048576)} MB, ${((Date.now() - t0) / 60000).toFixed(1)} min wall`);
    if (missing.size) console.log(`episode: ${missing.size} shot(s) still slates: ${[...missing].join(', ')}`);
    longHolds(T);
    return;
  }
  fs.writeFileSync(path.join(DIR, 'captions.srt'), srt(cues));

  const description = describe(T, bedLine(bedFile));
  fs.writeFileSync(path.join(DIR, 'meta.json'), JSON.stringify({
    kind: 'film', slug: SLUG, title: S.meta.title, description, file: path.basename(film), captions: 'captions.srt',
    thumbnail: S.meta.thumb ? 'thumb.png' : null, categoryId: '28', licence: 'youtube', madeForKids: false, duration: Math.round(T.end),
    variants: { titles: [S.meta.title, S.meta.title2, S.meta.title3].filter(Boolean), thumbnails: thumbs.map((v) => v.file) },
  }, null, 1) + '\n');
  // Test & Compare takes up to three titles and three thumbnails; the sheet lists every variant the script names.
  const titleVariants = [S.meta.title, S.meta.title2, S.meta.title3].filter(Boolean);
  const variantLines = titleVariants.length > 1 || thumbs.length > 1
    ? `\n\nTest & Compare (Studio, the video's Details, "A/B testing"):\n${titleVariants.map((t, i) => `  Title ${'ABC'[i]}: ${t}`).join('\n')}\n${thumbs.map((v, i) => `  Thumbnail ${'ABC'[i]}: ${v.file}`).join('\n')}`
    : '';
  fs.writeFileSync(path.join(DIR, 'sheet.txt'), `Title: ${S.meta.title}\n\nDescription:\n${description}\n\nCaptions: captions.srt (English). Thumbnail: thumb.png. Licence: Standard YouTube Licence.${variantLines}\n`);
  sheet(T);
  console.log(`episode: ${film} ${(T.end / 60).toFixed(1)} min, ${T.shots.length} shots, ${overs.length} overlays, ${Math.round(fs.statSync(film).size / 1048576)} MB, ${((Date.now() - t0) / 60000).toFixed(1)} min wall`);
  if (missing.size) console.log(`episode: ${missing.size} shot(s) still slates: ${[...missing].join(', ')}`);
  longHolds(T);
}

/** A computed surface that holds past four beats of four is a static screen: say where, so the script gets another cut. */
/**
 * A static screen past four bars of four beats (14.4 s) gets another cut. Static is counted from when the picture
 * stops changing: a chart building in step with the voice, or a highlighter sweeping, is not a held screen, so after
 * a render the build (s.builtMs) is taken off; before one (sheet), the whole shot counts.
 */
function longHolds(T) {
  const held = (s) => s.end - s.t - (s.builtMs || 0) / 1000;
  const long = T.shots.filter((s) => !OWNER.includes(s.tag.kind) && !['end', 'blank'].includes(s.tag.kind) && held(s) > 14.4);
  for (const s of long) console.warn(`episode: long hold, ${held(s).toFixed(1)} s of ${s.tag.kind} standing still${s.builtMs ? ` after ${(s.builtMs / 1000).toFixed(1)} s of build` : ''} at ${Math.floor(s.t / 60)}:${String(Math.floor(s.t % 60)).padStart(2, '0')} (${s.tag.title || s.tag.value || s.tag.text || s.tag.by || ''}); add a cut`);
}

if (STEP === 'check') { const issues = await check(S); process.exit(issues.length ? 1 : 0); }
if (STEP === 'sheet') sheet(stale() ? null : timeline());
if (STEP === 'narrate') { if ((await check(S)).length) process.exit(1); narrate(); }
if (STEP === 'render' || STEP === 'all') await render();
