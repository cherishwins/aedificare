/**
 * The narrated films. An edition read aloud, in full and verbatim, over the
 * site's own surfaces: the field, the section titles, every figure and
 * every name cut in at the moment it is spoken, the thesis on a Flash slap,
 * the record, the dove. Owner decision 2026-09-24: the channel speaks.
 *
 * Three steps, each resumable, all into brand/youtube/<slug>/:
 *
 *   script    walks the BUILT page (dist/<slug>/index.html) in Chromium and
 *             writes script.json: the blocks in reading order, which are
 *             read (title, lede, headings, prose, pulls, the slap) and which
 *             are shown (the headline figures), with each section's ground.
 *             Nothing is typed: the page is the script.
 *   narrate   tools/narrate.py through uv: Kokoro-82M, the voice am_michael,
 *             word timestamps for every original word. narration.wav and
 *             narration.json.
 *   render    the timeline from the timings: a section card while its title
 *             is read, its headline figure for a beat, then every money
 *             figure, unit figure and proper name as a full-frame surface at
 *             the word's own time with the sentence under it, the rose field
 *             breathing in between on the section's ground, the slap on
 *             Flash, the record, the dove in silence. Frames go to ffmpeg on
 *             a pipe with the narration (and a music bed if --music is
 *             given, mixed under the voice). Also captions.srt from the word
 *             timings (uploaded, never burned), the chapter list, a
 *             thumbnail that is a frame of the film, and the upload sheet.
 *
 * Every shot's HTML passes tools/check-brand.cjs before a frame is encoded.
 * Acid is spent once per shot (the opening field's k=5 curve, a section's
 * headline figure, the label furniture is under the at-scale threshold);
 * Shock rose once per film, on the opening field. The rose between shots is
 * Malachite only, so Acid never becomes wallpaper.
 *
 *   node tools/generate-film.mjs --slug edition-03                    all three steps, wide
 *   node tools/generate-film.mjs --slug edition-03 --step render      re-render from existing narration
 *   node tools/generate-film.mjs --slug edition-03 --music bed.mp3    a licensed bed under the voice
 *   node tools/generate-film.mjs --slug edition-03 --format tall --fps 24
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { HOUSE } from '../src/lib/rose.mjs';
import { EDITIONS, seedDrift, LICENCE, numberWord } from '../src/lib/editions.mjs';
import { SITE } from '../src/config.mjs';
import { ACID, MAL, BOTTLE, VOID, FLASH, SHOCK, GROUND, FORMATS, kLabel, esc, css, mastHtml, fieldHtml, doveHtml, findFfmpeg, openContext, encoder, browser } from './lib/film.mjs';

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const SLUG = arg('--slug', null);
const STEP = arg('--step', 'all');
const FORMAT = arg('--format', 'wide');
const FPS = +arg('--fps', 24);
const MUSIC = arg('--music', null);
const VOICE = arg('--voice', 'am_michael');
const UNTIL = +arg('--until', 0); // render only the first N seconds, to check the cuts before a long render
const ROSE_FPS = 12; // the field redraws at 12 per second; k moves 0.1 a second at most, so nothing steps visibly
if (!SLUG) { console.error('generate-film: --slug <edition> is required'); process.exit(1); }
const E = EDITIONS.find((e) => e.slug === SLUG);
if (!E) { console.error(`generate-film: no edition ${SLUG}`); process.exit(1); }
const DIR = path.join('brand/youtube', SLUG);
fs.mkdirSync(DIR, { recursive: true });
const F = FORMATS[FORMAT];
const HOST = SITE.origin.replace(/^https?:\/\//, '');
const URL_ = SITE.origin + E.path;
const FF = findFfmpeg();

const MONTHS = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' };
const spokenDate = (d) => d.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/, (m) => MONTHS[m]);
const cap = (s) => s.replace(/^./, (c) => c.toUpperCase());

/* ---- 1. the script, from the built page --------------------------------- */
async function script() {
  const built = path.join('dist', SLUG, 'index.html');
  if (!fs.existsSync(built)) { console.error(`generate-film: ${built} is missing; run npm run build first`); process.exit(1); }
  const b = await browser();
  const page = await b.newPage();
  await page.goto('file://' + path.resolve(built), { waitUntil: 'domcontentloaded' });
  const blocks = await page.evaluate(() => {
    const out = [];
    // Text node by text node with a space between, so a word after a <br> or a
    // display span does not fuse with the one before it; then whitespace collapsed.
    const T = (el) => { const parts = []; const walk = (n) => { for (const c of n.childNodes) { if (c.nodeType === 3) parts.push(c.nodeValue); else if (c.nodeType === 1) walk(c); } }; walk(el); return parts.join(' ').replace(/\s+/g, ' ').replace(/\s+([.,;:!?)])/g, '$1').trim(); };
    const push = (b) => out.push({ i: out.length, ...b });
    for (const sec of document.querySelectorAll('main section')) {
      if (sec.classList.contains('end') || sec.classList.contains('tight')) continue;
      const ground = sec.classList.contains('bottle') ? 'bottle' : sec.classList.contains('flash') ? 'flash' : 'void';
      const id = sec.id || (sec.classList.contains('cover') ? 'cover' : 'slap');
      const num = sec.querySelector('.sec .num')?.textContent.trim() || null;
      const els = sec.querySelectorAll('h1, h2, h3, p, blockquote, ol.sources');
      for (const el of els) {
        if (el.closest('.mast, nav, footer, .foot, figure, table, dl, li')) continue;
        if (el.tagName === 'P' && el.closest('blockquote')) continue;
        const cls = el.classList;
        if (el.tagName === 'H1') push({ kind: 'title', sec: id, ground, text: T(el), read: true });
        else if (el.tagName === 'H2') push({ kind: 'h2', sec: id, num, ground, text: T(el), read: true });
        else if (el.tagName === 'H3') push({ kind: 'h3', sec: id, ground, text: T(el), read: true });
        else if (el.tagName === 'BLOCKQUOTE') {
          const cite = el.querySelector('cite, footer');
          const q = cite ? T(el).replace(T(cite), '').trim() : T(el);
          push({ kind: 'quote', sec: id, ground, text: q, cite: cite ? T(cite) : null, read: true });
        } else if (el.tagName === 'OL') push({ kind: 'sources', sec: id, ground, count: el.querySelectorAll('li').length, read: false });
        else if (cls.contains('num')) {
          const cap = el.nextElementSibling?.matches('p.mono') ? T(el.nextElementSibling) : null;
          push({ kind: 'figure', sec: id, ground, text: T(el), caption: cap, read: false });
        } else if (cls.contains('slap') || cls.contains('closing')) push({ kind: 'slap', sec: id, ground, text: T(el), read: true });
        else if (cls.contains('mono') || cls.contains('mono-b')) continue; // labels, captions, registers: shown on the page, not read
        else if (cls.contains('lede') && id === 'cover') push({ kind: 'lede', sec: id, ground, text: T(el), read: true });
        else push({ kind: 'p', sec: id, ground, text: T(el), beat: cls.contains('beat') || cls.contains('lede'), read: true });
      }
    }
    return out;
  });
  await b.close();
  const sources = blocks.find((x) => x.kind === 'sources')?.count ?? 0;
  const sections = blocks.filter((x) => x.kind === 'h2').length;
  // The record line, generated from data the page carries, read last.
  blocks.push({ i: blocks.length, kind: 'record', sec: 'record', ground: 'flash', read: true,
    text: `${E.title}. ${spokenDate(E.dateLabel)}. ${cap(numberWord(sections))} sections, ${numberWord(sources)} sources, at aedificare dot art. ${LICENCE.name}.` });
  const out = { slug: SLUG, title: E.title, voice: VOICE, speed: 1.0, sections, sources, blocks };
  fs.writeFileSync(path.join(DIR, 'script.json'), JSON.stringify(out, null, 1));
  const words = blocks.filter((x) => x.read).reduce((n, x) => n + x.text.split(' ').length, 0);
  console.log(`  script.json: ${blocks.length} blocks, ${blocks.filter((x) => x.read).length} read, ${words} words (~${Math.round(words / 145)} min)`);
}

/* ---- 2. the voice ------------------------------------------------------- */
function narrate() {
  const r = spawnSync('uv', ['run', 'tools/narrate.py', DIR], { stdio: 'inherit' });
  if (r.status !== 0) { console.error('generate-film: narration failed'); process.exit(1); }
}

/* ---- 3. the frames ------------------------------------------------------ */
const UNIT = /^(MHz|GHz|kHz|Hz|Mbps|Gbps|kbps|dBm|dBi|dB|km|mm|cm|m|kg|g|mW|kW|MW|W|mAh|Wh|kWh|ms|GB|MB|TB|kB|percent|%|million|billion|thousand|trillion|dollars|radios|nodes|units|watts|volts|amps|hours|days|weeks|months|years|seconds|minutes|metres|meters|kilometres|miles|pages|sources|sections|people|men|women|employees|engineers|lines|files|bits|bytes|tokens|parameters|petals|turns|per)$/;
const STOP = new Set(['The', 'A', 'An', 'In', 'At', 'On', 'By', 'For', 'Of', 'To', 'It', 'That', 'This', 'These', 'Those', 'There', 'Then', 'But', 'And', 'Or', 'So', 'If', 'When', 'What', 'Which', 'Who', 'Two', 'One', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Its', 'Their', 'His', 'Her', 'Not', 'No', 'Yes', 'Each', 'Every', 'Both', 'Neither', 'Either', 'Nothing', 'Something', 'Everything', 'Twenty', 'Eighteen']);
const strip = (w) => w.replace(/^[\(\["“‘]+|[\)\]"”’.,;:!?]+$/g, '');
const isMoney = (w) => /^\$[\d][\d,]*(\.\d+)?[KMBT]?$/.test(w);
const isNum = (w) => /^\d[\d,]*(\.\d+)?$/.test(w) || /^\d[\d,]*(\.\d+)?(MHz|GHz|kHz|Mbps|Gbps|dBm|dB|km|mm|cm|kg|mW|kW|W|ms|GB|MB|TB|%)$/.test(w);
const isYear = (w) => /^(19|20)\d\d$/.test(w);
const isCap = (w) => /^[A-Z][A-Za-z0-9-]*$/.test(w) && !STOP.has(w);
const endsSentence = (w) => /[.!?]["”’)]?$/.test(w);
const NUMWORD = /^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|trillion|half|quarter|third|dozen)(-[a-z]+)?$/i;
const NUMJOIN = /^(and|a)$/;

/** The figures and names in a spoken block: [{ words: [i0..i1], display, kind }] */
function figuresIn(words) {
  const out = [];
  let i = 0;
  while (i < words.length) {
    const w = strip(words[i].w);
    const sentenceStart = i === 0 || endsSentence(words[i - 1].w);
    if (isMoney(w)) {
      let j = i; const parts = [w];
      const scale = () => { const nx = j + 1 < words.length ? strip(words[j + 1].w) : ''; if (/^(million|billion|thousand|trillion)$/.test(nx)) { j++; parts.push(nx); } };
      scale();
      // a range: "$208 to $450", "$8,025 and $10,500"
      const nx = j + 1 < words.length ? strip(words[j + 1].w) : '';
      if (/^(to|and)$/.test(nx) && j + 2 < words.length && isMoney(strip(words[j + 2].w))) { parts.push(nx, strip(words[j + 2].w)); j += 2; scale(); }
      out.push({ i0: i, i1: j, display: parts.join(' '), kind: 'fig' }); i = j + 1; continue;
    }
    if (isNum(w) && !(isYear(w) && !(i + 1 < words.length && UNIT.test(strip(words[i + 1].w))))) {
      let j = i; const parts = [w];
      const nx = j + 1 < words.length ? strip(words[j + 1].w) : '';
      if (UNIT.test(nx) && nx !== 'per') { j++; parts.push(nx); }
      else if (/^(to|and)$/.test(nx) && j + 2 < words.length && isNum(strip(words[j + 2].w))) {
        parts.push(nx, strip(words[j + 2].w)); j += 2;
        const u = j + 1 < words.length ? strip(words[j + 1].w) : '';
        if (UNIT.test(u) && u !== 'per') { j++; parts.push(u); }
      }
      if (w.length >= 3 || parts.length > 1 || /[.,]/.test(w)) out.push({ i0: i, i1: j, display: parts.join(' '), kind: 'fig' });
      i = j + 1; continue;
    }
    // Numbers spelled out ("four hundred and sixteen dollars", "twenty thousand a unit"): two or more number words,
    // joined by "and" or "a", with a trailing unit if one follows. Shown as words, in the display face.
    if (NUMWORD.test(w)) {
      let j = i; const parts = [w]; let count = 1;
      while (j + 1 < words.length && !endsSentence(words[j].w)) {
        const nx = strip(words[j + 1].w);
        if (NUMWORD.test(nx)) { j++; parts.push(nx); count++; }
        else if (NUMJOIN.test(nx) && j + 2 < words.length && NUMWORD.test(strip(words[j + 2].w))) { j += 2; parts.push(nx, strip(words[j].w)); count++; }
        else break;
      }
      const u = j + 1 < words.length ? strip(words[j + 1].w) : '';
      if (count >= 2) {
        if (UNIT.test(u) && u !== 'per') { j++; parts.push(u); }
        out.push({ i0: i, i1: j, display: parts.join(' ').toLowerCase(), kind: 'words' }); i = j + 1; continue;
      }
    }
    if (isCap(w) && !(sentenceStart && STOP.has(w))) {
      let j = i; const parts = [w];
      while (j + 1 < words.length && !endsSentence(words[j].w) && (isCap(strip(words[j + 1].w)) || /^\d+$/.test(strip(words[j + 1].w)) && parts.length >= 1 && isCap(parts[parts.length - 1]))) { j++; parts.push(strip(words[j].w)); }
      const real = parts.filter((p) => !STOP.has(p));
      if (real.length >= 2 || (real.length === 1 && parts.length >= 2 && /\d/.test(parts.join('')))) { out.push({ i0: i, i1: j, display: parts.join(' '), kind: 'name' }); i = j + 1; continue; }
    }
    i++;
  }
  return out;
}

/** The sentence around word k, clipped to at most twelve words. */
function fragment(words, k0, k1) {
  let a = k0, b = k1;
  while (a > 0 && !endsSentence(words[a - 1].w)) a--;
  while (b < words.length - 1 && !endsSentence(words[b].w)) b++;
  if (b - a + 1 > 14) {
    // Too long to sit under a figure: a window around the figure, cut back to a clause boundary where one exists.
    a = Math.max(a, k0 - 5); b = Math.min(b, a + 13); if (b < k1) { b = k1; a = Math.max(0, b - 13); }
    for (let c = b; c > k1; c--) if (/[,;:]$/.test(words[c].w)) { b = c; break; }
    for (let c = a; c < k0; c++) if (/[,;:]$/.test(words[c - 1]?.w ?? '')) { a = c; break; }
  }
  return words.slice(a, b + 1).map((x) => x.w).join(' ');
}

async function render() {
  const N = JSON.parse(fs.readFileSync(path.join(DIR, 'narration.json'), 'utf8'));
  const S = JSON.parse(fs.readFileSync(path.join(DIR, 'script.json'), 'utf8'));
  const seedLine = `r = cos(kθ) · seed ${E.seed} · k ${kLabel(E.k)}`;
  const seed = seedDrift(E.seed);
  const house = E.k.map((k, i) => ({ k, s: HOUSE[i].s, ph: HOUSE[i].ph, w: HOUSE[i].w, c: [ACID, MAL, SHOCK][i], o: [0.95, 0.6, 0.8][i] }));
  const quiet = E.k.map((k, i) => ({ k, s: HOUSE[i].s, ph: HOUSE[i].ph, w: HOUSE[i].w, c: MAL, o: [0.62, 0.34, 0.2][i] }));
  const label = (blk) => blk.sec === 'cover' ? E.dateLabel : blk.sec === 'record' ? '' : `${blk.num ?? ''} · ${blk.h2 ?? ''}`.replace(/^ · /, '');
  const page = (ground, body, blk) => {
    const flash = ground === 'flash';
    const ink = flash ? VOID : FLASH;
    const furniture = `<div class="label mono"${flash ? ` style="color:${BOTTLE}"` : ''}>${esc(label(blk))}</div><div class="seed mono" style="color:${flash ? BOTTLE : MAL}">${seedLine}</div>`;
    return `<!doctype html><html lang="en"><meta charset="utf-8"><title>${esc(E.title)}</title><style>${css(F, GROUND[ground], ink)}</style><body>${body}${furniture}</body></html>`;
  };

  // Carry each section's number and title onto its blocks, for the label.
  let cur = { num: null, h2: null };
  for (const blk of N.blocks) { if (blk.kind === 'h2') cur = { num: blk.num, h2: blk.text }; blk.num = cur.num; blk.h2 = cur.h2; }

  /* The timeline: shots with [start, end) in seconds; gaps are the rose. */
  const shots = [];
  const add = (s) => shots.push(s);
  const total = N.duration + 0.1;
  const titleWords = E.title.toUpperCase().split(' ');
  const acid = E.acid.toUpperCase();
  add({ id: 'field', start: 0, end: 0, live: true, ground: 'void', html: page('void', fieldHtml(F, house, seed, true) + mastHtml(MAL), { sec: 'cover' }) });
  let headline = null;
  for (let bi = 0; bi < N.blocks.length; bi++) {
    const blk = N.blocks[bi];
    const g = blk.ground;
    if (blk.kind === 'title') {
      shots[0].end = blk.start;
      // one word per surface while the title is read; the acid word holds to the lede
      const ws = blk.words;
      titleWords.forEach((w, k) => {
        const wd = ws[k] ?? ws[ws.length - 1];
        const isAcid = w === acid;
        const end = k + 1 < titleWords.length ? (ws[k + 1]?.s ?? wd.e) : blk.end + 0.4;
        add({ id: 'word-' + k, start: k === 0 ? blk.start - 0.15 : wd.s, end, ground: 'void',
          html: page('void', `<div class="word" style="color:${isAcid ? ACID : FLASH};--wdth:${isAcid ? 100 : 75}">${esc(w)}</div>`, blk) });
      });
    } else if (blk.kind === 'lede') {
      add({ id: 'lede', start: blk.start - 0.3, end: blk.end + 0.6, ground: 'bottle', html: page('bottle', `<p class="lede">${esc(blk.text)}</p>`, blk) });
    } else if (blk.kind === 'h2' || blk.kind === 'h3') {
      add({ id: 'sec-' + blk.sec, start: blk.start - 0.4, end: blk.end + 0.9, ground: g,
        html: page(g, `<div class="sec"><span class="k mono">${esc(blk.num ?? '')}</span><div class="t">${esc(blk.text)}</div></div>`, blk) });
      const fig = N.blocks[bi + 1]?.kind === 'figure' ? N.blocks[bi + 1] : null;
      if (fig) {
        const long = fig.text.length > 9;
        const sh = { id: 'headline-' + blk.sec, start: blk.end + 0.9, end: blk.end + 0.9 + 2.7, ground: g, headline: true,
          html: page(g, `<div class="fig"><div class="v mono${long ? ' long' : ''}" style="color:${ACID}">${esc(fig.text)}</div>${fig.caption ? `<div class="c mono"${g === 'bottle' ? ` style="color:${FLASH}"` : ''}>${esc(fig.caption)}</div>` : ''}</div>`, blk) };
        add(sh); if (!headline) headline = sh;
      }
    } else if (blk.kind === 'slap') {
      add({ id: 'slap-' + bi, start: blk.start - 0.3, end: blk.end + 0.9, ground: 'flash', html: page('flash', `<div class="slap">${esc(blk.text)}</div>`, blk) });
    } else if (blk.kind === 'record') {
      add({ id: 'record', start: blk.start - 0.3, end: blk.end + 0.6, ground: 'flash',
        html: page('flash', `<div class="url"><div>${HOST}</div><div>${esc(E.path)}</div><div class="rec mono">${esc([E.dateLabel, E.title, `${numberWord(S.sections)} sections`, `${numberWord(S.sources)} sources`, LICENCE.name].join(' · '))}</div></div>` + mastHtml(BOTTLE), blk) });
      add({ id: 'dove', start: blk.end + 0.6, end: total, ground: 'void', dove: true, html: page('void', doveHtml(), { sec: 'record' }) });
    } else if (blk.read && blk.words?.length) {
      const figs = figuresIn(blk.words);
      figs.forEach((f, k) => {
        const s = blk.words[f.i0].s - 0.15, e0 = blk.words[f.i1].e;
        let end = Math.min(Math.max(s + 1.8, e0 + 0.9), s + 4.5);
        const next = figs[k + 1] ? blk.words[figs[k + 1].i0].s - 0.15 : (N.blocks[bi + 1]?.start ?? total) - 0.4;
        if (next - s < 0.9) return; // the next figure arrives before this one can be read
        end = Math.min(end, next);
        const frag = fragment(blk.words, f.i0, f.i1);
        const body = f.kind === 'fig'
          ? `<div class="fig"><div class="v mono${f.display.length > 9 ? ' long' : ''}">${esc(f.display)}</div><div class="c mono"${g === 'bottle' ? ` style="color:${FLASH}"` : ''}>${esc(frag)}</div></div>`
          : `<div class="name">${esc(f.display)}<div class="c mono" style="margin-top:${F.gut * 0.35}px;font-size:${F.small + 4}px;line-height:1.6;letter-spacing:.14em;font-variation-settings:'wdth' 75,'wght' 500;max-width:${Math.round(F.W * 0.6)}px;color:${g === 'bottle' ? FLASH : MAL}">${esc(frag)}</div></div>`;
        add({ id: `${f.kind}-${bi}-${k}`, start: s, end, ground: g, html: page(g, body, blk) });
      });
    }
  }
  shots.sort((a, b) => a.start - b.start);
  // Resolve overlaps in favour of the later shot: a cut is a cut.
  for (let k = 0; k < shots.length - 1; k++) if (shots[k].end > shots[k + 1].start) shots[k].end = shots[k + 1].start;
  // Rose fills the gaps, on the ground of the section being read.
  const roseFor = (t) => { let g = 'void'; for (const blk of N.blocks) { if (blk.start <= t) g = blk.ground === 'flash' ? g : blk.ground; else break; } return g; };
  let roseCache = {};
  const roseShot = (g, blk) => (roseCache[`${g}|${label(blk)}`] ??= { id: 'rose-' + g, live: true, ground: g, html: page(g, fieldHtml(F, quiet, seed, false), blk) });
  const blockAt = (t) => { let b = N.blocks[0]; for (const blk of N.blocks) { if (blk.start <= t) b = blk; else break; } return b; };

  // Brand check over every shot.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aed-film-'));
  shots.forEach((sh, i) => fs.writeFileSync(path.join(tmp, `${String(i).padStart(3, '0')}-${sh.id}.html`), sh.html));
  ['void', 'bottle'].forEach((g) => fs.writeFileSync(path.join(tmp, `rose-${g}.html`), roseShot(g, { sec: 'x', num: '00', h2: 'x' }).html));
  const brand = spawnSync('node', ['tools/check-brand.cjs', tmp], { encoding: 'utf8' });
  if (brand.status !== 0) { console.error(brand.stderr || brand.stdout); process.exit(1); }
  console.log(`  check-brand over ${shots.length} shots: clean`);
  fs.rmSync(tmp, { recursive: true, force: true });
  roseCache = {}; // the check's sample rose shots carry a dummy label; never serve them

  /* Frames. */
  const b = await browser();
  const { ctx, page: pg, show, shot } = await openContext(b, F, FF);
  const file = path.join(DIR, `${SLUG}-film-${F.W}x${F.H}${UNTIL ? '-preview' : ''}.${FF.ext}`);
  const enc = encoder(FF, file, FPS, { audio: path.join(DIR, 'narration.wav'), music: MUSIC, crf: 20 });
  fs.writeFileSync(path.join(DIR, 'timeline.txt'), shots.map((s) => `${s.start.toFixed(2).padStart(8)} ${s.end.toFixed(2).padStart(8)}  ${s.ground.padEnd(6)} ${s.id}`).join('\n') + '\n');
  const until = UNTIL ? Math.min(total, UNTIL) : total;
  const frames = Math.ceil(until * FPS);
  let si = 0, current = null, still = null, lastRoseTick = -1, t0 = Date.now(), cuts = 0;
  for (let i = 0; i < frames; i++) {
    const t = i / FPS;
    while (si < shots.length && shots[si].end <= t) si++;
    const active = si < shots.length && shots[si].start <= t ? shots[si] : roseShot(roseFor(t), blockAt(t));
    if (active !== current) { await show(active); current = active; still = null; lastRoseTick = -1; cuts++; }
    if (active.live) {
      const tick = Math.floor(t * ROSE_FPS);
      if (tick !== lastRoseTick) { await pg.evaluate((ms) => window.__frame(ms), t * 1000); still = await shot(); lastRoseTick = tick; }
    } else if (!still) still = await shot();
    await enc.write(still);
    if (i % (FPS * 60) === 0 && i) console.log(`  ${Math.round(t / 60)} min of ${Math.round(total / 60)} rendered, ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min wall`);
  }
  await enc.done();

  // Thumbnail: the first headline figure (or the acid word), at 1280x720.
  const th = await openContext(b, F, FF, 1280 / F.W);
  const tshot = headline ?? shots.find((s) => s.id.startsWith('word-'));
  await th.show(tshot);
  const thumb = path.join(DIR, `${SLUG}-thumb-1280x720.png`);
  await th.page.screenshot({ path: thumb, type: 'png' });
  await th.ctx.close();
  await ctx.close();
  await b.close();

  /* Captions, chapters, sheet. */
  // Captions: each sentence split into near-equal cues of at most eight words, so no cue is a stranded word.
  const cues = [];
  for (const blk of N.blocks) {
    if (!blk.words?.length) continue;
    let sentence = [];
    const emit = () => {
      if (!sentence.length) return;
      const k = Math.ceil(sentence.length / 8), size = Math.ceil(sentence.length / k);
      for (let i = 0; i < sentence.length; i += size) { const c = sentence.slice(i, i + size); cues.push({ s: c[0].s, e: c[c.length - 1].e, text: c.map((w) => w.w).join(' ') }); }
      sentence = [];
    };
    for (const w of blk.words) { sentence.push(w); if (endsSentence(w.w)) emit(); }
    emit();
  }
  const ts = (x) => { const h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), s = Math.floor(x % 60), ms = Math.round((x % 1) * 1000); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`; };
  fs.writeFileSync(path.join(DIR, 'captions.srt'), cues.map((c, i) => `${i + 1}\n${ts(c.s)} --> ${ts(c.e)}\n${c.text}\n`).join('\n'));
  const mmss = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
  const chapters = [`0:00 ${E.title}`, ...N.blocks.filter((x) => x.kind === 'h2').map((x) => `${mmss(Math.max(0, x.start - 0.4))} ${x.text}`)];
  const firstSentence = E.lede.split(/(?<=\.)\s/)[0].replace(/\.$/, '');
  const sheet = [
    `Title: ${firstSentence.length <= 100 ? firstSentence : E.title}`,
    `(alternative: ${E.title} · ${E.dateLabel})`,
    '',
    'Description:',
    E.lede,
    `${E.dateLabel} · ${E.title} · ${numberWord(S.sections)} sections · ${numberWord(S.sources)} sources`,
    URL_,
    '',
    ...chapters,
    '',
    `The writing is ${LICENCE.name} at ${URL_}: quote it, repeat it, translate it, train on it, credit ${SITE.name} and link the edition.`,
    `Voice: synthetic, ${N.model} ${N.voice}. Every frame is computed from r = cos(kθ), seed ${E.seed}, k ${kLabel(E.k)}.`,
    MUSIC ? `Music: ${path.basename(MUSIC)} (add the licence credit here)` : '',
    '',
    'Licence (upload form): Standard YouTube Licence. The script is CC BY on the page; the file does not carry the grant.',
    'Altered or synthetic content disclosure: not required (a synthetic voice reading an original script over computed visuals depicts no real person or event).',
    'Captions: upload captions.srt as English. Tags: none. Cards and end screens: none. Playlist: Editions.',
    `Thumbnail: ${path.basename(thumb)}`,
    `File: ${path.basename(file)}`,
    '',
  ].filter((l) => l !== null).join('\n');
  fs.writeFileSync(path.join(DIR, 'sheet.txt'), sheet);
  const mins = (total / 60).toFixed(1);
  console.log(`  ${file}: ${mins} min, ${frames} frames, ${cuts} cuts, ${Math.round(fs.statSync(file).size / 1048576)} MB, ${((Date.now() - t0) / 60000).toFixed(1)} min wall`);
  console.log(`  ${thumb}, captions.srt (${cues.length} cues), sheet.txt (${chapters.length} chapters)`);
}

if (STEP === 'script' || STEP === 'all') await script();
if (STEP === 'narrate' || STEP === 'all') narrate();
if (STEP === 'render' || STEP === 'all') await render();
