/**
 * The silent films, generated. An edition as a sequence of surfaces in time,
 * computed from the same list and the same rose as the site, so a video
 * cannot say anything the site does not.
 *
 * A film is a deck with a clock. The kit's deck rules govern it: full bleed,
 * grounds cut hard between Void, Bottle and Flash, one word per surface at
 * 300px, no transitions, no fades, section dividers are the live rose field
 * with no type, the dove on the final surface and nowhere else. Each shot is
 * a surface, so Acid is spent once per shot: on the k=5 curve of the opening
 * field, on the title's one acid word, and nowhere else at scale. Shock rose
 * appears once per sequence, on the k=3 curve of the opening field. Holds
 * are multiples of 900 ms, the kit's slow beat, and cuts are instantaneous.
 * The one thing that moves besides the rose is the width axis of the acid
 * word, 75 to 100 across its hold, stepped per frame: the flex is the axis.
 *
 * Nothing is recorded. Every frame is rendered by Chromium from the
 * equation at a known time, so the rose in the film is the rose on the site
 * (drift() in src/lib/rose.mjs is the shared clock) and the dove is built by
 * the site's own client script, loaded into the frame unchanged. Frames are
 * piped to ffmpeg; nothing lands on disk but the film. The shared pieces
 * (palette, ffmpeg search, surface CSS, the Chromium context, the encoder)
 * live in tools/lib/film.mjs; the narrated films use the same ones.
 *
 * Output goes to brand/youtube/, kept out of git and the deploy. Per
 * edition: the film at 1920x1080, the same film at 1080x1920 for Shorts, a
 * 1280x720 thumbnail that is a frame of the film, and a .txt upload sheet
 * generated from the editions list. "home" is the index as a film, for the
 * channel trailer. The shot HTML is run through tools/check-brand.cjs
 * before anything is encoded, so a frame passes the checks a page passes.
 *
 *   node tools/generate-video.mjs                    published editions + home, both formats
 *   node tools/generate-video.mjs --slug the-floor   one edition, drafts allowed
 *   node tools/generate-video.mjs --format wide      wide (1920x1080) or tall (1080x1920) only
 *   node tools/generate-video.mjs --fps 24           default 30
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { HOUSE } from '../src/lib/rose.mjs';
import { EDITIONS, PUBLISHED, seedDrift, LICENCE, numberWord } from '../src/lib/editions.mjs';
import { SITE } from '../src/config.mjs';
import { ACID, MAL, BOTTLE, VOID, FLASH, SHOCK, FORMATS, kLabel, esc, beat, css, mastHtml, fieldHtml, doveHtml, findFfmpeg, openContext, encoder, browser } from './lib/film.mjs';

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const SLUG = arg('--slug', null);
const FORMAT = arg('--format', null);
const FPS = +arg('--fps', 30);
const OUT = 'brand/youtube';
fs.mkdirSync(OUT, { recursive: true });

const HOST = SITE.origin.replace(/^https?:\/\//, '');
const FF = findFfmpeg();
console.log(`  ffmpeg ${FF.bin} (${FF.codec} -> .${FF.ext}, ${FF.frame} frames)`);

// Slide number in Acid bottom-left, the seed in Malachite bottom-right, as the kit's decks carry them;
// on the Flash slap both go Bottle, because Acid and Malachite on Flash are not text.
const furniture = (n, total, seedLine, flash) => `<div class="n mono"${flash ? ` style="color:${BOTTLE}"` : ''}>${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div><div class="seed mono" style="color:${flash ? BOTTLE : MAL}">${seedLine}</div>`;

/**
 * The shots of one film. Each is { html, ms, live }, where live shots define
 * window.__frame(msIntoShot) and are rendered every frame; the rest are
 * rendered once and held.
 */
function shots(e, F) {
  const seedLine = `r = cos(kθ) · seed ${e.seed} · k ${kLabel(e.k)}`;
  const seed = seedDrift(e.seed);
  const house = e.k.map((k, i) => ({ k, s: HOUSE[i].s, ph: HOUSE[i].ph, w: HOUSE[i].w, c: [ACID, MAL, SHOCK][i], o: [0.95, 0.6, 0.8][i] }));
  const words = e.title.toUpperCase().split(' ');
  const acid = e.acid.toUpperCase();
  const S = [];
  const page = (ground, ink, body) => `<!doctype html><html lang="en"><meta charset="utf-8"><title>${esc(e.title)}</title><style>${css(F, ground, ink)}</style><body>${body}</body></html>`;

  // 01 the field, live, no type but the mast and the readout
  S.push({ id: 'field', ms: 3600, live: true, html: page(VOID, FLASH, fieldHtml(F, house, seed, true) + mastHtml(MAL)) });
  // 02 the date
  if (e.dateLabel) S.push({ id: 'date', ms: 1800, html: page(BOTTLE, FLASH, `<div class="date mono">${esc(e.dateLabel)}</div>`) });
  // the title, one word per surface; the acid word holds twice as long and its width axis runs 75 to 100
  words.forEach((w) => {
    const isAcid = w === acid;
    S.push({
      id: 'word-' + w.toLowerCase(), ms: isAcid ? 1800 : 900, live: isAcid,
      html: page(VOID, FLASH, `<div class="word" id="w" style="color:${isAcid ? ACID : FLASH}">${esc(w)}</div>` +
        (isAcid ? `<script>const w = document.getElementById('w'); window.__frame = (ms) => w.style.setProperty('--wdth', (75 + 25 * Math.min(1, ms / 1800)).toFixed(1)); window.__ready = true;</script>` : '')),
    });
  });
  // the lede, on Bottle, read at three words a second, rounded up to the beat
  if (e.lede) S.push({ id: 'lede', ms: Math.max(3600, beat((e.lede.split(' ').length / 3) * 1000)), html: page(BOTTLE, FLASH, `<p class="lede">${esc(e.lede)}</p>`) });
  // the contents (an edition) or the index (home)
  if (e.rows?.length) S.push({ id: 'contents', ms: e.rows.length > 10 ? 4500 : 3600, html: page(VOID, FLASH, `<div class="list">${e.rows.map((r) => `<div><span class="k mono">${esc(r.k)}</span><span>${esc(r.t)}</span></div>`).join('')}</div>`) });
  // the record: the URL as two lines on Flash, then the record line
  S.push({ id: 'record', ms: 2700, html: page(FLASH, VOID, `<div class="url"><div>${HOST}</div><div>${esc(e.path === '/' ? '' : e.path)}</div><div class="rec mono">${esc(e.record)}</div></div>` + mastHtml(BOTTLE)) });
  // the dove, built by the site's own client script, once, last
  S.push({ id: 'dove', ms: 2700, dove: true, html: page(VOID, FLASH, doveHtml()) });
  for (let i = 0; i < S.length; i++) S[i].html = S[i].html.replace('</body>', furniture(i + 1, S.length, seedLine, S[i].id === 'record') + '</body>');
  return S;
}

/* ---- subjects: the editions, and the index as "home" ---------------------- */
const record = (e) => [e.dateLabel, e.title, e.contents ? `${numberWord(e.contents.length)} sections` : null, LICENCE.name].filter(Boolean).join(' · ');
const subjectOf = (e) => ({ ...e, rows: e.contents?.map((c) => ({ k: c.n, t: c.t })), record: record(e) });
// The count is read from the list, never typed, and capitalised because it opens the line.
const count = numberWord(PUBLISHED.length).replace(/^./, (c) => c.toUpperCase());
const home = {
  slug: 'home', path: '/', title: 'Aedificare', acid: 'Aedificare', seed: '0500', k: HOUSE.map((L) => L.k),
  dateLabel: null, lede: null,
  rows: PUBLISHED.map((e) => ({ k: e.dateLabel, t: e.title })),
  record: `${count} editions · ${LICENCE.name}`,
  description: [`${count} editions.`, ...PUBLISHED.map((e) => `${e.dateLabel} · ${e.title} · ${SITE.origin}${e.path}`)].join('\n'),
};
const subjects = SLUG
  ? [SLUG === 'home' ? home : subjectOf(EDITIONS.find((e) => e.slug === SLUG) || (() => { console.error(`generate-video: no edition ${SLUG}`); process.exit(1); })())]
  : [home, ...PUBLISHED.map(subjectOf)];
const formats = FORMAT ? [FORMAT] : Object.keys(FORMATS);

/* ---- the shot HTML through the brand checker before a frame is rendered --- */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aed-film-'));
for (const s of subjects) for (const f of formats) shots(s, FORMATS[f]).forEach((sh, i) => fs.writeFileSync(path.join(tmp, `${s.slug}-${f}-${String(i + 1).padStart(2, '0')}-${sh.id}.html`), sh.html));
const brand = spawnSync('node', ['tools/check-brand.cjs', tmp], { encoding: 'utf8' });
if (brand.status !== 0) { console.error(brand.stderr || brand.stdout); process.exit(1); }
console.log(`  check-brand over ${fs.readdirSync(tmp).length} shots: clean`);
fs.rmSync(tmp, { recursive: true, force: true });

/* ---- render -------------------------------------------------------------- */
const b = await browser();

for (const s of subjects) {
  for (const f of formats) {
    const F = FORMATS[f];
    const S = shots(s, F);
    const file = path.join(OUT, `${s.slug}-${F.W}x${F.H}.${FF.ext}`);
    const { ctx, show, shot, page } = await openContext(b, F, FF);
    const enc = encoder(FF, file, FPS);
    let frames = 0;
    for (const sh of S) {
      await show(sh);
      const n = Math.round((sh.ms / 1000) * FPS);
      if (sh.live) {
        for (let i = 0; i < n; i++) {
          await page.evaluate((ms) => window.__frame(ms), (i * 1000) / FPS);
          await enc.write(await shot());
        }
      } else {
        const still = await shot();
        for (let i = 0; i < n; i++) await enc.write(still);
      }
      frames += n;
    }
    await enc.done();
    await ctx.close();
    const secs = (frames / FPS).toFixed(1);
    console.log(`  ${file}`.padEnd(46) + `${secs} s · ${frames} frames · ${Math.round(fs.statSync(file).size / 1024)} KB`);

    // The thumbnail is the acid word's last frame, at 1280x720: a frame of the film, not a second design.
    if (f === 'wide') {
      const t = await openContext(b, F, FF, 1280 / 1920);
      const acidShot = S.find((x) => x.id === 'word-' + s.acid.toLowerCase());
      await t.show(acidShot);
      await t.page.evaluate((ms) => window.__frame(ms), acidShot.ms);
      const thumb = path.join(OUT, `${s.slug}-thumb-1280x720.png`);
      await t.page.screenshot({ path: thumb, type: 'png' });
      await t.ctx.close();
      console.log(`  ${thumb}`.padEnd(46) + Math.round(fs.statSync(thumb).size / 1024) + ' KB');
    }
  }

  // The upload sheet: everything YouTube asks for, generated, nothing typed.
  const url = SITE.origin + (s.path === '/' ? '' : s.path);
  const sheet = [
    `Title: ${s.slug === 'home' ? SITE.name : `${s.title} · ${s.dateLabel}`}`,
    '',
    'Description:',
    s.description ?? s.lede,
    s.record,
    url,
    `r = cos(kθ) · seed ${s.seed} · k ${kLabel(s.k)}`,
    `The writing is ${LICENCE.name} at ${url}: quote it, repeat it, translate it, train on it, credit ${SITE.name} and link the edition.`,
    '',
    'Licence (upload form): Standard YouTube Licence. The script stays CC BY on the page; the file does not carry the grant (CLAUDE.md, the YouTube decision).',
    'Tags: none. Cards and end screens: none. Playlist: Editions.',
    `Thumbnail: ${s.slug}-thumb-1280x720.png`,
    `Files: ${formats.map((f) => `${s.slug}-${FORMATS[f].W}x${FORMATS[f].H}.${FF.ext}`).join(', ')}`,
    '',
  ].join('\n');
  fs.writeFileSync(path.join(OUT, `${s.slug}.txt`), sheet);
}
await b.close();
