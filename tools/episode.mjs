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
 * script that fails it.
 *
 * The script format is documented in source/episodes/FORMAT.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { browser, findFfmpeg, openContext, css, esc, FORMATS, ACID, MAL, BOTTLE, VOID, FLASH } from './lib/film.mjs';
import { markPath } from '../src/lib/rose.mjs';
import { SITE } from '../src/config.mjs';
import { chartBody, chartCss, parseChart, CHART_TYPES } from './lib/chart.mjs';

const [STEP, FILE] = process.argv.slice(2);
const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const ONLINE = process.argv.includes('--online');
if (!['check', 'sheet', 'narrate', 'render', 'all'].includes(STEP) || !FILE || !fs.existsSync(FILE)) {
  console.error('usage: node tools/episode.mjs check|sheet|narrate|render|all source/episodes/<slug>.md'); process.exit(1);
}
// --short renders the same script tall (1080x1920) and cuts the chapters named in `short:` for the Shorts feed.
const SHORT = process.argv.includes('--short');
const F = SHORT ? FORMATS.tall : FORMATS.wide, W = F.W, H = F.H, FPS = 24, M = SHORT ? 64 : 120;
// Type sized to the frame: tall frames are narrower, and the bottom third of a Short sits under YouTube's own controls.
const TY = SHORT ? { quote: 62, stmt: 170, title: 190, end: 130, slate: 44, low: Math.round(H * 0.3) } : { quote: 84, stmt: 170, title: 200, end: 150, slate: 56, low: M + 150 };
/** A figure's size: its base, or smaller if the string would not fit between the margins (condensed digits run about half an em). */
const fit = (value, base) => Math.min(base, Math.floor((W - 2 * M) / (Math.max(1, value.length) * 0.5)));
const KINDS = ['footage', 'gag', 'clip', 'quote', 'map', 'chart', 'fig', 'card', 'title', 'over'];
const CUTS = KINDS.filter((k) => k !== 'over');
const OWNER = ['footage', 'gag', 'clip']; // shots the owner supplies
// The grade that makes footage from six decades read as one film: most of the colour out, contrast up, pushed toward Void.
const GRADE = 'hue=s=0.18,eq=contrast=1.22:brightness=-0.07:gamma=0.92,'
  + 'colorbalance=rs=-0.10:gs=0.03:bs=-0.08:rm=-0.07:gm=0.03:bm=-0.06:rh=-0.04:bh=-0.04,'
  + 'vignette=angle=PI/4.2,noise=alls=7:allf=t+u';
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').slice(0, 5).join('-');

/* ---- the script ------------------------------------------------------------ */
function parseTag(inner) {
  const m = /^(\w+)(?:#([\w-]+))?\s*:\s*([\s\S]*)$/.exec(inner.trim());
  if (!m || !KINDS.includes(m[1])) return { bad: inner };
  const parts = m[3].split('|').map((x) => x.trim()).filter(Boolean);
  const opts = {}, args = [];
  for (const p of parts) { const kv = /^(find|at|hl|say|by|raw|hold|src|unit|prefix|note|sub|ref)\s*:\s*([\s\S]*)$/.exec(p); if (kv) opts[kv[1]] = kv[2].trim(); else args.push(p); }
  const tag = { kind: m[1], args, ...opts };
  if (OWNER.includes(tag.kind)) {
    tag.desc = args[0] || '';
    const dur = args.find((a) => /^\d+(\.\d+)?s$/.test(a));
    if (dur) tag.dur = parseFloat(dur);
    tag.id = m[2] || slug(tag.desc);
  }
  if (tag.kind === 'quote') { tag.src = args[0]; tag.text = (args[1] || '').replace(/^["“]|["”]$/g, ''); tag.by = tag.by || args[2] || ''; }
  if (tag.kind === 'map') {
    tag.stops = (args[0] || '').split('>').map((s) => { const q = /^(.*?)\s+(-?[\d.]+)\s*,\s*(-?[\d.]+)$/.exec(s.trim()); return q ? { name: q[1], lat: +q[2], lon: +q[3] } : null; });
    tag.label = args[1] || '';
  }
  if (tag.kind === 'fig' || tag.kind === 'over') { tag.value = args[0] || ''; tag.label = args[1] || ''; }
  if (tag.kind === 'card' || tag.kind === 'title') { tag.text = args[0] || ''; tag.label = args[1] || ''; }
  if (tag.kind === 'chart') { tag.type = args[0] || ''; tag.title = args[1] || ''; Object.assign(tag, parseChart(tag.type, args.slice(2))); tag.srcs = (tag.src || '').split(',').map((x) => x.trim()).filter(Boolean); }
  return tag;
}

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
  for (const k of ['title', 'date']) if (!S.meta[k]) issues.push(`front matter needs ${k}:`);
  for (const s of Object.values(S.sources)) {
    if (!/^https?:\/\//.test(s.url || '')) issues.push(`${s.id}: no URL`);
    if (!/^\d{4}(-\d{2}){0,2}$/.test(s.date || '')) issues.push(`${s.id}: date must be YYYY, YYYY-MM or YYYY-MM-DD, got "${s.date}"`);
  }
  const used = new Set();
  for (const b of S.blocks) {
    if (b.kind !== 'p') continue;
    // Sentences by token range; a marker belongs to the sentence holding the token before it.
    const sent = []; let start = 0;
    b.tokens.forEach((w, i) => { if (/[.?!]["”’)]*$/.test(w) || i === b.tokens.length - 1) { sent.push({ a: start, b: i, cited: false }); start = i + 1; } });
    for (const c of b.cites) {
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
      if (CUTS.includes(e.tag.kind) && b.events.some((o) => o !== e && o.anchor === e.anchor && CUTS.includes(o.tag.kind) && b.events.indexOf(o) > b.events.indexOf(e))) issues.push(`two cuts on one word; the ${e.tag.kind} would get no screen time: "${b.tokens.slice(e.anchor, e.anchor + 5).join(' ')}"`);
      if (e.tag.kind === 'chart') {
        // A chart is a set of numbers, so it carries its own citations and they are on screen.
        if (!CHART_TYPES.includes(e.tag.type)) issues.push(`chart type "${e.tag.type}" is not one of ${CHART_TYPES.join(', ')}`);
        if (!e.tag.title) issues.push('chart has no title (the title is the takeaway, not the axis name)');
        issues.push(...e.tag.errors.map((x) => `chart "${e.tag.title}": ${x}`));
        if (!e.tag.srcs.length) issues.push(`chart "${e.tag.title}" cites no source (src: s1, s2)`);
        for (const id of e.tag.srcs) { if (!S.sources[id]) issues.push(`chart "${e.tag.title}" cites ${id}, which is not in # Sources`); else used.add(id); }
        if (e.tag.type !== 'flow' && e.tag.type !== 'timeline' && e.tag.rows.filter((r) => r.hot).length > 1) issues.push(`chart "${e.tag.title}": one point is the story; mark one row with *, not ${e.tag.rows.filter((r) => r.hot).length}`);
      }
      if (e.tag.kind === 'map' && e.tag.stops.some((x) => !x)) issues.push(`map stops must be "Name lat,lon > Name lat,lon": ${e.tag.args[0]}`);
      if ((e.tag.kind === 'fig' || e.tag.kind === 'over') && /\d/.test(e.tag.value) && !b.cites.length) issues.push(`figure "${e.tag.value}" sits in a paragraph with no citation`);
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
  }
  return issues;
}

/* ---- paths ----------------------------------------------------------------- */
const S = parse(FILE);
const SLUG = S.meta.slug || path.basename(FILE, '.md');
const DIR = path.join('brand/youtube', `ep-${SLUG}`);
const FOOT = path.join(DIR, 'footage');
fs.mkdirSync(FOOT, { recursive: true });
const SEED = (S.meta.date || '').replace(/-/g, '').slice(2) || '0';

function footageFile(id) {
  // <id>.mp4, or <id>@72.5.mp4 / <id>-at-72.5.mp4 to start 72.5 s in (1m12 works too). The -at- form survives
  // GitHub, which rewrites some characters in release asset names.
  const f = fs.readdirSync(FOOT).find((x) => /\.(mp4|mov|webm|mkv|m4v|jpe?g|png|webp|tiff?)$/i.test(x) && [`${id}.`, `${id}@`, `${id}-at-`].some((p) => x.startsWith(p)));
  if (!f) return null;
  const at = /(?:@|-at-)([\dm.]+?)\.[a-z0-9]+$/i.exec(f);
  const inPoint = at ? (at[1].includes('m') ? (+at[1].split('m')[0] * 60 + +(at[1].split('m')[1] || 0)) : +at[1]) : 0;
  // A still (a Library of Congress or DOE photograph, a Landsat frame) is held and panned like footage.
  return { file: path.join(FOOT, f), inPoint, still: /\.(jpe?g|png|webp|tiff?)$/i.test(f) };
}
const probeDur = (file) => +spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).stdout.trim() || 0;
const hasAudio = (file) => spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', file], { encoding: 'utf8' }).stdout.trim() !== '';

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
      const f = footageFile(b.tag.id);
      const dur = b.tag.dur || (f ? Math.min(12, probeDur(f.file) - f.inPoint) : Math.max(3, (b.tag.say || '').split(' ').length / 2.6));
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
  const overs = events.filter((e) => e.tag.kind === 'over').map((e) => ({ ...e, end: Math.min(...all.filter((x) => x > e.t + 0.01)) }));
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
      const have = footageFile(tag.id);
      lines.push(`- [${have ? 'x' : ' '}] **${tag.id}**${dur ? ` · ${dur.toFixed(1)} s` : ''}${t !== null && t !== undefined ? ` · at ${mmss(t)}` : ''}`);
      lines.push(`  ${tag.desc}`);
      if (tag.say) lines.push(`  Says: "${tag.say}"`);
      if (tag.find) lines.push(`  Find: ${tag.find}`);
    }
    lines.push('');
  }
  lines.push('Credits: list each file\'s source in footage/credits.txt, one line per file ("id: source, licence"); the description carries them.', '');
  fs.writeFileSync(path.join(DIR, 'shots.md'), lines.join('\n'));
  console.log(lines.join('\n'));
  console.log(`episode sheet: ${want.length} shot(s) to find, ${want.filter((w) => footageFile(w.tag.id)).length} in hand -> ${DIR}/shots.md`);
}

/* ---- narrate ----------------------------------------------------------------- */
const spoken = () => JSON.stringify({ voice: 'am_michael', speed: +(S.meta.speed || 1.05), seed: SEED, blocks: S.blocks.map((b, i) => ({ i, kind: b.kind, text: b.text || '', read: b.read })) }, null, 1) + '\n';
/** The narration on disk is stale when the words, the block order or the speed changed since it was spoken. */
const stale = () => !fs.existsSync(path.join(DIR, 'narration.json')) || !fs.existsSync(path.join(DIR, 'script.json')) || fs.readFileSync(path.join(DIR, 'script.json'), 'utf8') !== spoken();

function narrate() {
  fs.writeFileSync(path.join(DIR, 'script.json'), spoken());
  const r = spawnSync('uv', ['run', '-q', 'tools/narrate.py', DIR], { stdio: 'inherit' });
  if (r.status !== 0) { console.error('episode: narration failed'); process.exit(1); }
}

/* ---- the computed shots ---------------------------------------------------- */
const page = (body, ground = VOID, extra = '') => `<!doctype html><html><head><meta charset="utf-8"><style>${css(F, ground, FLASH)}
.q{position:absolute;left:${M}px;top:50%;transform:translateY(-50%);width:${W - 2 * M - (SHORT ? 0 : 240)}px}
.q .src{font-size:22px;color:${MAL};margin-bottom:44px}
.q .t{font-size:${TY.quote}px;line-height:1.12;font-variation-settings:'opsz' 48,'wdth' 100,'wght' 500;letter-spacing:-.005em}
.q .t .h:first-child,.q .t .h[data-k="0"]{padding-left:.08em;margin-left:-.08em}
.q .t .h.on{background:${ACID};color:${VOID}}
.q .by{margin-top:44px;font-size:24px}
.big{position:absolute;left:${M - 6}px;bottom:${TY.low}px;font-variation-settings:'opsz' 96,'wdth' 75,'wght' 800;line-height:.86;letter-spacing:-.02em;white-space:nowrap}
.sub{position:absolute;left:${M}px;bottom:${TY.low - 60}px;font-size:26px}
.stmt{position:absolute;left:${M - 6}px;top:50%;transform:translateY(-50%);max-width:${W - 2 * M}px;font-size:${TY.stmt}px;line-height:.88;letter-spacing:-.02em;text-transform:uppercase;font-variation-settings:'opsz' 96,'wdth' 75,'wght' 800}
.slate{position:absolute;left:${M}px;top:50%;transform:translateY(-50%);max-width:${W - 2 * M}px}
.slate .k{font-size:22px;color:${ACID};margin-bottom:28px}
.slate .d{font-size:${TY.slate}px;line-height:1.1;font-variation-settings:'opsz' 48,'wdth' 100,'wght' 500}
.slate .f{margin-top:28px;font-size:20px;color:${MAL};line-height:1.6}
svg.map{position:absolute;inset:0;width:${W}px;height:${H}px}
.maplabel{position:absolute;left:${M}px;top:${M}px;font-size:24px;color:${FLASH}}
${extra}</style></head><body>${body}</body></html>`;

function quoteHtml(tag, S) {
  const src = S.sources[tag.src];
  const text = tag.text.replace(/—/g, ' – ');
  const hl = (tag.hl || '').replace(/—/g, ' – ');
  let inner = esc(text);
  let n = 0;
  if (hl && text.includes(hl)) {
    const i = text.indexOf(hl);
    const words = hl.split(' ');
    n = words.length;
    // One span per word, each carrying the space after it, so the sweep reads as one bar and not a row of boxes.
    inner = esc(text.slice(0, i)) + words.map((w, k) => `<span class="h" data-k="${k}">${esc(w)}${k < n - 1 ? ' ' : ''}</span>`).join('') + esc(text.slice(i + hl.length));
  }
  const html = page(`<div class="q"><div class="src mono">${esc(src ? `${src.pub} · ${src.date}` : '')}</div><div class="t">“${inner}”</div><div class="by mono">${esc(tag.by)}</div></div>
<script>window.__frame=(ms)=>{const n=${n};document.querySelectorAll('.h').forEach((e)=>{e.classList.toggle('on',ms>=(+e.dataset.k/Math.max(1,n))*900)})};window.__frame(0);window.__ready=true;</script>`);
  return { html, anim: n > 0, live: true };
}

let WORLD = null;
async function world() {
  if (WORLD) return WORLD;
  const cache = path.join('brand/youtube/.cache/countries-50m.json');
  if (!fs.existsSync(cache)) {
    fs.mkdirSync(path.dirname(cache), { recursive: true });
    // Natural Earth (public domain) via the world-atlas package, pinned.
    const r = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json');
    if (!r.ok) { console.error('episode: could not fetch the world outlines', r.status); process.exit(1); }
    fs.writeFileSync(cache, Buffer.from(await r.arrayBuffer()));
  }
  const t = JSON.parse(fs.readFileSync(cache, 'utf8'));
  const { scale: [sx, sy], translate: [tx, ty] } = t.transform;
  const arcs = t.arcs.map((a) => { let x = 0, y = 0; return a.map(([dx, dy]) => { x += dx; y += dy; return [x * sx + tx, y * sy + ty]; }); });
  const arc = (i) => (i >= 0 ? arcs[i] : arcs[~i].slice().reverse());
  // Rings that cross the antimeridian (Russia, Fiji) are unwrapped into continuous longitude, or the flip from +180
  // to -180 draws a line across the whole world; the map then draws every ring at -360, 0 and +360.
  const ring = (idx) => {
    const pts = idx.flatMap((i, k) => (k ? arc(i).slice(1) : arc(i)));
    let off = 0;
    return pts.map(([lon, lat], j) => {
      if (j) { const prev = pts[j - 1][0]; if (lon - prev > 180) off -= 360; else if (prev - lon > 180) off += 360; }
      return [lon + off, lat];
    });
  };
  const polys = [];
  const geom = (g) => { if (g.type === 'Polygon') polys.push(g.arcs.map(ring)); else if (g.type === 'MultiPolygon') g.arcs.forEach((p) => polys.push(p.map(ring))); else if (g.type === 'GeometryCollection') g.geometries.forEach(geom); };
  geom(t.objects.countries);
  // Antarctica never frames a story here, and its ring wraps the pole.
  WORLD = polys.filter((p) => p[0].some(([, lat]) => lat > -58));
  return WORLD;
}

async function mapHtml(tag) {
  const polys = await world();
  const stops = tag.stops.map((s) => ({ ...s }));
  // Across the antimeridian (Taiwan to Arizona), carry the western stops east so the route takes the Pacific.
  const lons = stops.map((s) => s.lon);
  if (Math.max(...lons) - Math.min(...lons) > 180) stops.forEach((s) => { if (s.lon < 0) s.lon += 360; });
  const my = (lat) => Math.log(Math.tan(Math.PI / 4 + (Math.max(-80, Math.min(80, lat)) * Math.PI) / 360));
  const xs = stops.map((s) => s.lon), ys = stops.map((s) => my(s.lat));
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const r2d = 180 / Math.PI;
  const spanX = Math.max(x1 - x0, 12), spanY = Math.max((y1 - y0) * r2d, 7);
  const cx = (x0 + x1) / 2, cy = ((y0 + y1) / 2) * r2d;
  // Fit the stops in the middle 60 percent of a 16:9 frame.
  let sw = spanX / 0.6, sh = spanY / 0.6;
  if (sw / sh > W / H) sh = sw * (H / W); else sw = sh * (W / H);
  const px = (lon) => ((lon - (cx - sw / 2)) / sw) * W;
  const py = (lat) => ((cy + sh / 2 - my(lat) * r2d) / sh) * H;
  const land = [];
  for (const off of [-360, 0, 360]) for (const p of polys) {
    const d = p.map((r) => {
      if (!r.some(([lon]) => lon + off > cx - sw && lon + off < cx + sw)) return '';
      return 'M' + r.map(([lon, lat]) => `${px(lon + off).toFixed(1)},${py(lat).toFixed(1)}`).join('L') + 'Z';
    }).join('');
    if (d) land.push(d);
  }
  const pts = stops.map((s) => [px(s.lon), py(s.lat)]);
  let route = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
    const mx = (ax + bx) / 2, myy = (ay + by) / 2, dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
    route += `Q${(mx + (dy / len) * len * 0.18).toFixed(1)},${(myy - (Math.abs(dx) / len) * len * 0.18).toFixed(1)} ${bx.toFixed(1)},${by.toFixed(1)}`;
  }
  const labels = stops.map((s, i) => `<circle cx="${pts[i][0].toFixed(1)}" cy="${pts[i][1].toFixed(1)}" r="9" fill="${ACID}"/>
<text x="${(pts[i][0] + 22).toFixed(1)}" y="${(pts[i][1] + 8).toFixed(1)}" fill="${FLASH}" style="font-family:'Martian Mono';font-size:24px;letter-spacing:.14em;font-variation-settings:'wdth' 75,'wght' 500">${esc(s.name.toUpperCase())}</text>`).join('');
  const html = page(`<svg class="map" viewBox="0 0 ${W} ${H}"><path d="${land.join('')}" fill="${BOTTLE}" stroke="${VOID}" stroke-width="1.5"/>
${pts.length > 1 ? `<path id="r" d="${route}" fill="none" stroke="${ACID}" stroke-width="5"/>` : ''}${labels}</svg>
${tag.label ? `<div class="maplabel mono">${esc(tag.label)}</div>` : ''}
<script>const r=document.getElementById('r');const L=r?r.getTotalLength():0;if(r){r.style.strokeDasharray=L;}window.__frame=(ms)=>{if(r)r.style.strokeDashoffset=L*(1-Math.min(1,ms/900));};window.__frame(0);window.__ready=true;</script>`);
  return { html, anim: pts.length > 1, live: true };
}

function chartHtml(tag) {
  const num = (v) => v.toLocaleString('en-US', { maximumFractionDigits: 3 });
  // A typed string (the value as the source prints it) passes through; a computed tick is formatted.
  const fmt = (v) => `${tag.prefix || ''}${typeof v === 'string' ? v : num(v)}${tag.unit || ''}`;
  const sourceLine = 'SOURCE: ' + tag.srcs.map((id) => S.sources[id]).filter(Boolean).map((s) => `${s.pub}, ${s.date}`).join(' · ');
  const ref = tag.ref ? (() => { const m = /^(-?[\d.]+)\s*(.*)$/.exec(tag.ref); return m ? { v: +m[1], label: m[2] } : null; })() : null;
  const { body, animMs } = chartBody({ type: tag.type, title: tag.title, sub: tag.sub, note: tag.note, sourceLine, rows: tag.rows, fmt, W, H, M, ref });
  return { html: page(body, VOID, chartCss(W, H, M)), anim: true, live: true, animMs };
}

const figHtml = (tag) => ({ html: page(`<div class="big" style="font-size:${fit(tag.value, tag.value.length > 8 ? 260 : 360)}px;color:${ACID}">${esc(tag.value)}</div>${tag.label ? `<div class="sub mono" style="color:${MAL}">${esc(tag.label)}</div>` : ''}`) });
const cardHtml = (tag) => ({ html: page(`<div class="stmt">${esc(tag.text)}</div>${tag.label ? `<div class="sub mono" style="bottom:${M}px;color:${MAL}">${esc(tag.label)}</div>` : ''}`) });
const titleHtml = () => ({ html: page(`<div class="stmt" style="font-size:${TY.title}px">${esc(S.meta.title)}</div><div class="sub mono" style="bottom:${M}px;color:${MAL}">${esc(S.meta.date)}</div>${`<div class="mast mono" style="color:${FLASH}"><svg viewBox="0 0 100 100"><path d="${markPath(100)}" fill="none" stroke="${FLASH}" stroke-width="6"/></svg>AEDIFICARE</div>`}`) });
const slateHtml = (tag) => ({ html: page(`<div class="slate"><div class="k mono">${tag.kind === 'clip' ? 'Clip needed' : tag.kind === 'gag' ? 'Gag needed' : 'Footage needed'} · ${esc(tag.id)}</div><div class="d">${esc(tag.desc)}</div>${tag.say ? `<div class="f mono">Says: ${esc(tag.say)}</div>` : ''}${tag.find ? `<div class="f mono">Find: ${esc(tag.find)}</div>` : ''}</div>`, BOTTLE) });
const endHtml = () => ({ html: page(`<div class="stmt" style="font-size:${TY.end}px;text-transform:none">${esc(new URL(SITE.origin).host)}</div><div class="mast mono" style="color:${FLASH}"><svg viewBox="0 0 100 100"><path d="${markPath(100)}" fill="none" stroke="${FLASH}" stroke-width="6"/></svg>AEDIFICARE</div>`) });
const overHtml = (tag) => page(`${tag.value ? `<div class="big" style="font-size:${fit(tag.value, tag.value.length > 9 ? 200 : 300)}px;color:${ACID}">${esc(tag.value)}</div>` : ''}${tag.label ? `<div class="sub mono" style="color:${FLASH}">${esc(tag.label)}</div>` : ''}`, 'transparent');

/* ---- render ------------------------------------------------------------------ */
function ff(args, what) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (r.status !== 0) { console.error(`episode: ffmpeg failed on ${what}\n${(r.stderr || '').slice(-1500)}`); process.exit(1); }
}

async function render() {
  const issues = await check(S, { quiet: true });
  if (issues.length) { await check(S); console.error('episode: fix the check before rendering'); process.exit(1); }
  if (stale()) narrate();
  const FFx = findFfmpeg();
  if (FFx.codec !== 'libx264') { console.error('episode: needs an ffmpeg with libx264'); process.exit(1); }
  const T = timeline();
  const work = path.join(DIR, SHORT ? 'work-short' : 'work'); fs.rmSync(work, { recursive: true, force: true }); fs.mkdirSync(work, { recursive: true });
  const t0 = Date.now();

  // Brand check over every computed surface we typed; quoted words are someone else's and are checked by --online, not by the kit.
  const b = await browser();
  const { ctx, page: pg, show, shot } = await openContext(b, F, { frame: 'png' });
  const html = async (s) => {
    const k = s.tag.kind;
    if (k === 'quote') return quoteHtml(s.tag, S);
    if (k === 'map') return mapHtml(s.tag);
    if (k === 'chart') return chartHtml(s.tag);
    if (k === 'fig') return figHtml(s.tag);
    if (k === 'card') return cardHtml(s.tag);
    if (k === 'title') return titleHtml();
    if (k === 'end') return endHtml();
    if (k === 'blank') return { html: page('') };
    return slateHtml(s.tag);
  };
  const brandDir = path.join(work, 'brand'); fs.mkdirSync(brandDir);

  const segs = [];
  const missing = new Set();
  for (let i = 0; i < T.shots.length; i++) {
    const s = T.shots[i];
    // Cut points sit on the film's frame grid, so segment lengths add up exactly and the picture cannot drift from the voice.
    const frames = Math.max(1, Math.round(s.end * FPS) - Math.round(s.t * FPS));
    const d = frames / FPS;
    const out = path.join(work, `${String(i).padStart(3, '0')}.mp4`);
    const enc = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-an', out];
    const f = OWNER.includes(s.tag.kind) ? footageFile(s.tag.id) : null;
    if (f) {
      // B-roll cuts every four beats: a footage shot longer than six beats is cut into pieces of about 3.6 s,
      // each from a later moment of the same file, panning the other way. One clip becomes a sequence.
      const look = s.tag.kind === 'gag' || s.tag.raw ? 'eq=contrast=1.05' : GRADE;
      const n = s.tag.kind === 'footage' && d > 5.4 ? Math.round(d / 3.6) : 1;
      const len = f.still ? 0 : probeDur(f.file);
      for (let k = 0; k < n; k++) {
        const dk = (Math.round(((k + 1) * frames) / n) - Math.round((k * frames) / n)) / FPS;
        const spread = Math.max(0, len - f.inPoint - dk);
        const from = f.inPoint + (n > 1 ? (spread * k) / (n - 1) : 0);
        const pan = (i + k) % 2 ? `(in_w-out_w)*t/${dk}` : `(in_w-out_w)*(1-t/${dk})`;
        const piece = n === 1 ? out : out.replace(/\.mp4$/, `-${k}.mp4`);
        ff([...(f.still ? ['-loop', '1', '-framerate', String(FPS)] : ['-ss', String(from), '-stream_loop', '-1']), '-i', f.file, '-t', String(dk), '-vf',
          `scale=${Math.round(W * 1.1)}:${Math.round(H * 1.1)}:force_original_aspect_ratio=increase,crop=${W}:${H}:x='${pan}':y='(in_h-out_h)/2',${look},fps=${FPS},format=yuv420p`,
          '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-an', piece], s.tag.id);
        if (n > 1) segs.push(piece);
      }
      if (n > 1) { process.stdout.write(`  ${String(i).padStart(3)} ${s.t.toFixed(2).padStart(7)} ${d.toFixed(2).padStart(6)}s ${s.tag.kind} ${s.tag.id} (${n} cuts)\n`); continue; }
    } else {
      if (OWNER.includes(s.tag.kind)) missing.add(s.tag.id);
      const h = await html(s);
      fs.writeFileSync(path.join(brandDir, `${i}.html`), s.tag.kind === 'quote' ? h.html.replace(/<div class="t">[\s\S]*?<\/div>/, '<div class="t"></div>') : h.html);
      await show({ id: `${i}`, html: h.html, live: h.live });
      const fdir = path.join(work, `f${i}`); fs.mkdirSync(fdir);
      // A build longer than the shot is compressed to finish inside 80 percent of it, so the point always lands on screen.
      const animMs = h.animMs || 900, pace = h.anim ? Math.max(1, animMs / (0.8 * d * 1000)) : 1;
      const n = h.anim ? Math.min(Math.ceil((animMs / pace / 1000) * FPS) + 1, Math.ceil(d * FPS)) : 1;
      for (let k = 0; k < n; k++) {
        if (h.live) await pg.evaluate((ms) => window.__frame(ms), (k / FPS) * 1000 * pace);
        fs.writeFileSync(path.join(fdir, `${String(k).padStart(4, '0')}.png`), await shot());
      }
      ff(['-framerate', String(FPS), '-i', path.join(fdir, '%04d.png'), '-vf', `tpad=stop_mode=clone:stop_duration=${d},trim=duration=${d},format=yuv420p`, ...enc], `shot ${i}`);
    }
    segs.push(out);
    process.stdout.write(`  ${String(i).padStart(3)} ${s.t.toFixed(2).padStart(7)} ${d.toFixed(2).padStart(6)}s ${s.tag.kind}${s.tag.id ? ' ' + s.tag.id : ''}${OWNER.includes(s.tag.kind) && !f ? ' (slate)' : ''}\n`);
  }
  // Overlays: one transparent still each, cut in and out on the word.
  const overs = [];
  for (const [j, o] of T.overs.entries()) {
    const p = path.join(work, `over${j}.png`);
    const h = overHtml(o.tag);
    fs.writeFileSync(path.join(brandDir, `over${j}.html`), h);
    await show({ id: `over${j}`, html: h });
    fs.writeFileSync(p, await shot({ omitBackground: true, type: 'png' }));
    overs.push({ ...o, png: p });
  }
  // Thumbnail: a frame of the named shot, graded, with the two lines of type from the front matter.
  const thumb = path.join(DIR, 'thumb.png');
  if (S.meta.thumb && !SHORT) {
    const [line1, line2 = ''] = S.meta.thumb.split('/').map((x) => x.trim());
    const tm = /^(.*?)(?:(?:@|-at-)([\d.]+))?$/.exec(S.meta.thumbframe || '');
    const tid = tm[1], tat = tm[2] || '0';
    const tf = tid ? footageFile(tid) : null;
    let bg = '';
    if (tf) {
      const jpg = path.join(work, 'thumb-bg.jpg');
      ff([...(tf.still ? [] : ['-ss', String(tf.inPoint + +tat)]), '-i', tf.file, '-frames:v', '1', '-vf', `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},${GRADE.replace(/,noise=[^,]+$/, '')}`, jpg], 'thumbnail frame');
      bg = `<img src="data:image/jpeg;base64,${fs.readFileSync(jpg).toString('base64')}" style="position:absolute;inset:0;width:${W}px;height:${H}px">`;
    }
    const th = page(`${bg}<div class="big" style="bottom:${M + 190}px;font-size:${line1.length > 8 ? 330 : 420}px;color:${ACID}">${esc(line1)}</div><div class="big" style="bottom:${M}px;font-size:170px;color:${FLASH}">${esc(line2)}</div>`);
    fs.writeFileSync(path.join(brandDir, 'thumb.html'), th.replace(/<img[^>]+>/, ''));
    await show({ id: 'thumb', html: th });
    fs.writeFileSync(path.join(work, 'thumb-1080.png'), await shot({ type: 'png' }));
    ff(['-i', path.join(work, 'thumb-1080.png'), '-vf', 'scale=1280:720', thumb], 'thumbnail');
  }
  await ctx.close(); await b.close();
  const brand = spawnSync('node', ['tools/check-brand.cjs', brandDir], { encoding: 'utf8' });
  if (brand.status !== 0) { console.error(brand.stdout + brand.stderr); console.error('episode: a computed shot breaks the kit'); process.exit(1); }

  // Picture: concat, then the overlays.
  fs.writeFileSync(path.join(work, 'list.txt'), segs.map((s) => `file '${path.resolve(s)}'`).join('\n'));
  const body = path.join(work, 'body.mp4');
  ff(['-f', 'concat', '-safe', '0', '-i', path.join(work, 'list.txt'), '-c', 'copy', body], 'concat');

  // Sound: the narration, opened at each clip for the clip's own sound, then the bed under all of it.
  const narr = path.join(DIR, 'narration.wav');
  const ins = ['-i', narr];
  const parts = [];
  let from = 0;
  T.clips.forEach((c, k) => {
    parts.push(`[0:a]atrim=${from}:${c.at},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=mono[n${k}]`);
    if (c.f && hasAudio(c.f.file)) { ins.push('-ss', String(c.f.inPoint), '-t', String(c.dur), '-i', c.f.file); parts.push(`[${ins.filter((x) => x === '-i').length - 1}:a]aresample=48000,aformat=channel_layouts=mono,apad=whole_dur=${c.dur + 0.3}[c${k}]`); }
    else parts.push(`anullsrc=r=48000:cl=mono,atrim=0:${c.dur + 0.3}[c${k}]`);
    from = c.at;
  });
  parts.push(`[0:a]atrim=${from},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=mono[nz]`);
  const order = T.clips.map((_, k) => `[n${k}][c${k}]`).join('') + '[nz]';
  parts.push(`${order}concat=n=${T.clips.length * 2 + 1}:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11,apad=whole_dur=${T.end}[v]`);
  const voice = path.join(work, 'voice.wav');
  ff([...ins, '-filter_complex', parts.join(';'), '-map', '[v]', '-ar', '48000', voice], 'voice');

  const music = arg('--music', 'bed');
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
    const named = T.chapters.filter((c) => c.t !== undefined);
    const want = (S.meta.short || named[0]?.text || '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
    const segs = [];
    for (const [k, c] of named.entries()) if (want.includes(c.text.toLowerCase())) segs.push([k === 0 ? 0 : c.t, k + 1 < named.length ? named[k + 1].t : T.total]);
    const unknown = want.filter((w) => !named.some((c) => c.text.toLowerCase() === w));
    if (unknown.length) { console.error(`episode: short: names no chapter "${unknown.join('", "')}"; chapters are: ${named.map((c) => c.text).join(', ')}`); process.exit(1); }
    let room = 179 - (T.end - T.total);
    for (const sg of segs) { const len = Math.min(sg[1] - sg[0], Math.max(0, room)); if (len < sg[1] - sg[0]) console.warn(`episode: the Short is capped at three minutes; cut at ${(sg[0] + len).toFixed(1)} s`); sg[1] = sg[0] + len; room -= len; }
    segs.push([T.total, T.end]);
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

  // Description: the hook, chapters, every source, the footage credits, the voice.
  const mmss = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
  const chapters = T.chapters.filter((c) => c.t !== undefined);
  const chapterLines = chapters.length >= 2 ? [`0:00 ${chapters[0].t < 10 ? chapters[0].text : 'Cold open'}`, ...chapters.slice(chapters[0].t < 10 ? 1 : 0).map((c) => `${mmss(c.t)} ${c.text}`)] : [];
  const creditsFile = path.join(FOOT, 'credits.txt');
  const credits = fs.existsSync(creditsFile) ? fs.readFileSync(creditsFile, 'utf8').trim().split('\n').filter(Boolean) : [];
  const description = [
    S.meta.hook || firstP.text,
    '',
    ...chapterLines, ...(chapterLines.length ? [''] : []),
    'Sources:',
    ...sources,
    '',
    ...(credits.length ? ['Footage:', ...credits, ''] : []),
    `Voice: synthetic, ${T.N.model} ${T.N.voice}. Quotes are the speakers' own words, cited above.`,
    bedFile === null ? 'Music: none.' : music === 'bed' ? `Music: computed from r = cos(kθ), seed ${SEED}; no third-party audio.` : `Music: ${path.basename(bedFile)} (add the licence credit here)`,
    SITE.origin,
  ].join('\n');
  fs.writeFileSync(path.join(DIR, 'meta.json'), JSON.stringify({
    kind: 'film', slug: SLUG, title: S.meta.title, description, file: path.basename(film), captions: 'captions.srt',
    thumbnail: S.meta.thumb ? 'thumb.png' : null, categoryId: '28', licence: 'youtube', madeForKids: false, duration: Math.round(T.end),
  }, null, 1) + '\n');
  fs.writeFileSync(path.join(DIR, 'sheet.txt'), `Title: ${S.meta.title}\n\nDescription:\n${description}\n\nCaptions: captions.srt (English). Thumbnail: thumb.png. Licence: Standard YouTube Licence.\n`);
  sheet(T);
  console.log(`episode: ${film} ${(T.end / 60).toFixed(1)} min, ${T.shots.length} shots, ${overs.length} overlays, ${Math.round(fs.statSync(film).size / 1048576)} MB, ${((Date.now() - t0) / 60000).toFixed(1)} min wall`);
  if (missing.size) console.log(`episode: ${missing.size} shot(s) still slates: ${[...missing].join(', ')}`);
  longHolds(T);
}

/** A computed surface that holds past four beats of four is a static screen: say where, so the script gets another cut. */
function longHolds(T) {
  const long = T.shots.filter((s) => !OWNER.includes(s.tag.kind) && !['end', 'blank'].includes(s.tag.kind) && s.end - s.t > 14.4);
  for (const s of long) console.warn(`episode: long hold, ${(s.end - s.t).toFixed(1)} s of ${s.tag.kind} at ${Math.floor(s.t / 60)}:${String(Math.floor(s.t % 60)).padStart(2, '0')} (${s.tag.title || s.tag.value || s.tag.text || s.tag.by || ''}); add a cut`);
}

if (STEP === 'check') { const issues = await check(S); process.exit(issues.length ? 1 : 0); }
if (STEP === 'sheet') sheet(stale() ? null : timeline());
if (STEP === 'narrate') { if ((await check(S)).length) process.exit(1); narrate(); }
if (STEP === 'render' || STEP === 'all') await render();
