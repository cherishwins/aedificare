/**
 * The films, generated. An edition as a sequence of surfaces in time,
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
 * piped to ffmpeg; nothing lands on disk but the film.
 *
 * ffmpeg: the one on PATH when it has libx264 (H.264 MP4); otherwise the
 * build Playwright installs beside Chromium, which encodes VP8 WebM only.
 * YouTube accepts both. FFMPEG=/path overrides the search.
 *
 * Output goes to brand/youtube/, kept out of git and the deploy. Per
 * edition: the film at 1920x1080, the same film at 1080x1920 for Shorts, a
 * 1280x720 thumbnail that is a frame of the film, and a .txt upload sheet
 * (title, description, licence) generated from the editions list. "home" is
 * the index as a film, for the channel trailer. The shot HTML is also run
 * through tools/check-brand.cjs before anything is encoded, so a frame
 * passes the checks a page passes.
 *
 *   node tools/generate-video.mjs                    published editions + home, both formats
 *   node tools/generate-video.mjs --slug the-floor   one edition, drafts allowed
 *   node tools/generate-video.mjs --format wide      wide (1920x1080) or tall (1080x1920) only
 *   node tools/generate-video.mjs --fps 24           default 30
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { HOUSE, markPath } from '../src/lib/rose.mjs';
import { EDITIONS, PUBLISHED, seedDrift, LICENCE, numberWord } from '../src/lib/editions.mjs';
import { SITE } from '../src/config.mjs';

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const SLUG = arg('--slug', null);
const FORMAT = arg('--format', null);
const FPS = +arg('--fps', 30);
const OUT = 'brand/youtube';
fs.mkdirSync(OUT, { recursive: true });

const ACID = '#CCFF00', MAL = '#00B24F', BOTTLE = '#063B22', VOID = '#050A06', FLASH = '#FFFFFF', SHOCK = '#FF1F5A';
const HOST = SITE.origin.replace(/^https?:\/\//, '');

/* ---- ffmpeg ------------------------------------------------------------- */
function probe(bin) {
  const enc = spawnSync(bin, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
  if (enc.status !== 0) return null;
  const dec = spawnSync(bin, ['-hide_banner', '-decoders'], { encoding: 'utf8' }).stdout || '';
  const has = (s, name) => new RegExp(`^ [A-Z.]{6} ${name} `, 'm').test(s);
  if (has(enc.stdout, 'libx264')) return { bin, codec: 'libx264', ext: 'mp4', frame: has(dec, 'png') ? 'png' : 'jpeg' };
  if (has(enc.stdout, 'libvpx')) return { bin, codec: 'libvpx', ext: 'webm', frame: has(dec, 'png') ? 'png' : 'jpeg' };
  return null;
}
function findFfmpeg() {
  const candidates = [process.env.FFMPEG, 'ffmpeg'];
  for (const root of [process.env.PLAYWRIGHT_BROWSERS_PATH, path.join(os.homedir(), '.cache/ms-playwright'), path.join(os.homedir(), 'Library/Caches/ms-playwright')]) {
    if (!root || !fs.existsSync(root)) continue;
    for (const d of fs.readdirSync(root)) if (d.startsWith('ffmpeg-')) for (const f of fs.readdirSync(path.join(root, d))) if (f.startsWith('ffmpeg-') && !f.endsWith('.txt')) candidates.push(path.join(root, d, f));
  }
  for (const c of candidates.filter(Boolean)) { const p = probe(c); if (p) return p; }
  console.error('generate-video: no ffmpeg with libx264 or libvpx found. Install ffmpeg or set FFMPEG=/path/to/ffmpeg.');
  process.exit(1);
}
const FF = findFfmpeg();
console.log(`  ffmpeg ${FF.bin} (${FF.codec} -> .${FF.ext}, ${FF.frame} frames)`);

/* ---- the surfaces ------------------------------------------------------- */
const FORMATS = {
  wide: { W: 1920, H: 1080, gut: 72, word: 300, date: 240, lede: 76, row: 40, url: 140, mast: 18, mark: 36, small: 16, dove: 0.5 },
  tall: { W: 1080, H: 1920, gut: 56, word: 200, date: 128, lede: 58, row: 40, url: 92, mast: 18, mark: 36, small: 16, dove: 0.86 },
};
const kLabel = (ks) => ks.map((k) => (Number.isInteger(k) ? String(k) : k.toFixed(2))).join('/');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const beat = (ms) => Math.ceil(ms / 900) * 900;

const css = (F, ground, ink) => `
@font-face{font-family:'Bricolage Grotesque';src:url(/fonts/BricolageGrotesque.woff2) format('woff2');font-weight:200 800;font-stretch:75% 100%;font-display:block}
@font-face{font-family:'Martian Mono';src:url(/fonts/MartianMono.woff2) format('woff2');font-weight:100 800;font-stretch:75% 112.5%;font-display:block}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${F.W}px;height:${F.H}px;overflow:hidden}
body{position:relative;background:${ground};color:${ink};font-family:'Bricolage Grotesque',sans-serif}
.mono{font-family:'Martian Mono',monospace;font-variation-settings:'wdth' 75,'wght' 500;letter-spacing:.14em;text-transform:uppercase}
.mast{position:absolute;left:${F.gut}px;top:${F.gut * 0.8}px;display:flex;align-items:center;gap:14px;font-variation-settings:'wdth' 75,'wght' 700;font-size:${F.mast}px;letter-spacing:.3em;z-index:2}
.mast svg{width:${F.mark}px;height:${F.mark}px}
.n{position:absolute;left:${F.gut}px;bottom:${F.gut * 0.7}px;font-size:${F.small}px;color:${ACID};z-index:2}
.seed{position:absolute;right:${F.gut}px;bottom:${F.gut * 0.7}px;font-size:${F.small}px;z-index:2}
.rose{position:absolute;z-index:0}
.word{position:absolute;left:${F.gut - 8}px;top:50%;transform:translateY(-44%);font-size:${F.word}px;line-height:.8;letter-spacing:-.03em;white-space:nowrap;text-transform:uppercase;font-variation-settings:'opsz' 96,'wdth' var(--wdth,75),'wght' 800;z-index:1}
.date{position:absolute;left:${F.gut}px;top:50%;transform:translateY(-50%);font-size:${F.date}px;font-variation-settings:'wdth' 75,'wght' 700;letter-spacing:-.01em;line-height:1;white-space:nowrap;text-transform:uppercase;z-index:1}
.lede{position:absolute;left:${F.gut}px;top:50%;transform:translateY(-50%);width:${F.W - 2 * F.gut}px;max-width:${F.W > F.H ? '76%' : '100%'};font-size:${F.lede}px;line-height:1.08;letter-spacing:-.005em;font-variation-settings:'opsz' 48,'wdth' 100,'wght' 500;z-index:1}
.list{position:absolute;left:${F.gut}px;top:50%;transform:translateY(-50%);width:${F.W - 2 * F.gut}px;z-index:1}
.list div{display:flex;gap:${F.row}px;align-items:baseline;font-size:${F.row}px;line-height:1.35;font-variation-settings:'opsz' 32,'wdth' 75,'wght' 600;white-space:nowrap;overflow:hidden}
.list .k{font-size:${F.row * 0.5}px;color:${MAL};min-width:${F.row * 2.2}px}
.url{position:absolute;left:${F.gut - 6}px;top:50%;transform:translateY(-50%);z-index:1}
.url div{font-size:${F.url}px;line-height:.9;letter-spacing:-.01em;white-space:nowrap;font-variation-settings:'opsz' 96,'wdth' 75,'wght' 800}
.url .rec{margin-top:${F.url * 0.35}px;font-size:${F.small + 2}px;line-height:1.6;color:${BOTTLE};max-width:${F.W - 2 * F.gut}px;white-space:normal}
.dove{position:absolute;left:${F.gut}px;top:50%;transform:translateY(-50%);width:${Math.round(F.W * F.dove)}px;height:auto;z-index:1}
`;

const mastHtml = (colour) => `<div class="mast mono" style="color:${colour}"><svg viewBox="0 0 100 100"><path d="${markPath(100)}" fill="none" stroke="${colour}" stroke-width="6"/></svg>AEDIFICARE</div>`;
// Slide number in Acid bottom-left, the seed in Malachite bottom-right, as the kit's decks carry them;
// on the Flash slap both go Bottle, because Acid and Malachite on Flash are not text.
const furniture = (n, total, seedLine, flash) => `<div class="n mono"${flash ? ` style="color:${BOTTLE}"` : ''}>${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}</div><div class="seed mono" style="color:${flash ? BOTTLE : MAL}">${seedLine}</div>`;

/** A live field: k drifts by the shared clock, the readout follows the k=5 curve. */
function fieldHtml(F, layers, seed, readout) {
  const size = Math.round(Math.max(F.W, F.H * 1.2));
  return `<svg class="rose" id="f" viewBox="0 0 1000 1000" style="width:${size}px;height:${size}px;left:50%;top:50%;transform:translate(-50%,-50%)"></svg>
${readout ? `<div class="seed mono" style="left:${F.gut}px;right:auto;bottom:${F.gut * 0.7 + F.small * 2}px;color:${MAL}">r = cos(kθ) · k = <span id="k">${layers[0].k.toFixed(3)}</span></div>` : ''}
<script type="module">
import { rhodonea, drift } from '/src/lib/rose.mjs';
const layers = ${JSON.stringify(layers)}, seed = ${seed};
const NS = 'http://www.w3.org/2000/svg', svg = document.getElementById('f'), out = document.getElementById('k');
const paths = layers.map((L) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', L.c); p.setAttribute('stroke-width', L.w); p.setAttribute('stroke-opacity', L.o); svg.appendChild(p); return p; });
window.__frame = (ms) => { const d = drift(seed, ms); layers.forEach((L, i) => paths[i].setAttribute('d', rhodonea(500, 500, 480 * L.s, L.k + d, L.ph, 9, 1800))); if (out) out.textContent = (layers[0].k + d).toFixed(3); };
window.__frame(0); window.__ready = true;
</script>`;
}

/**
 * The shots of one film. Each is { html, ms, live }, where live shots define
 * window.__frame(msIntoShot) and are rendered every frame; the rest are
 * rendered once and held.
 */
function shots(subject, F) {
  const e = subject;
  const seedLine = `r = cos(kθ) · seed ${e.seed} · k ${kLabel(e.k)}`;
  const seed = seedDrift(e.seed);
  const house = e.k.map((k, i) => ({ k, s: HOUSE[i].s, ph: HOUSE[i].ph, w: HOUSE[i].w, c: [ACID, MAL, SHOCK][i], o: [0.95, 0.6, 0.8][i] }));
  const words = e.title.toUpperCase().split(' ');
  const acid = e.acid.toUpperCase();
  const S = [];
  const page = (ground, ink, body, extra = '') => `<!doctype html><html lang="en"><meta charset="utf-8"><title>${esc(e.title)}</title><style>${css(F, ground, ink)}${extra}</style><body>${body}</body></html>`;

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
  S.push({ id: 'dove', ms: 2700, dove: true, html: page(VOID, FLASH, `<svg class="dove" viewBox="0 0 260 180" role="img" aria-label="A dove, resolved out of the rose field." data-dove="${ACID}"></svg><script type="module" src="/src/scripts/aed.js"></script>`) });
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
const MIME = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.woff2': 'font/woff2', '.html': 'text/html; charset=utf-8' };
const b = await chromium.launch();

async function context(F, scale = 1) {
  const ctx = await b.newContext({ viewport: { width: F.W, height: F.H }, deviceScaleFactor: scale, reducedMotion: 'no-preference' });
  let current = '';
  await ctx.route('http://aed.film/**', (route) => {
    const p = new URL(route.request().url()).pathname;
    if (p === '/slide.html') return route.fulfill({ status: 200, contentType: MIME['.html'], body: current });
    const file = p.startsWith('/fonts/') ? 'public' + p : p.startsWith('/src/') ? '.' + p : null;
    if (!file || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
    return route.fulfill({ status: 200, contentType: MIME[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) });
  });
  const page = await ctx.newPage();
  page.on('pageerror', (err) => { console.error('generate-video: page error', err.message); process.exit(1); });
  const show = async (sh) => {
    current = sh.html;
    await page.goto('http://aed.film/slide.html', { waitUntil: 'load' });
    // A face loads only once text uses it, and a shot may set only one face,
    // so both are loaded explicitly before the check; fonts.ready alone resolves
    // even when nothing loaded (CLAUDE.md, Findings 1).
    await page.evaluate(() => Promise.all([document.fonts.load("800 40px 'Bricolage Grotesque'"), document.fonts.load("500 10px 'Martian Mono'")]));
    const ok = await page.evaluate(() => document.fonts.check("800 40px 'Bricolage Grotesque'") && document.fonts.check("500 10px 'Martian Mono'"));
    if (!ok) { console.error(`generate-video: brand faces did not load for ${sh.id}`); process.exit(1); }
    if (sh.live) await page.waitForFunction(() => window.__ready === true);
    if (sh.dove) await page.waitForSelector('svg[data-dove] g path');
  };
  const shot = (opts = {}) => page.screenshot({ type: FF.frame, ...(FF.frame === 'jpeg' ? { quality: 100 } : {}), ...opts });
  return { ctx, page, show, shot };
}

function encoder(file) {
  const input = ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', FF.frame === 'png' ? 'png' : 'mjpeg', '-i', 'pipe:0'];
  const video = FF.codec === 'libx264'
    ? ['-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
    : ['-c:v', 'libvpx', '-b:v', '12M', '-crf', '6', '-quality', 'good', '-cpu-used', '1', '-auto-alt-ref', '1', '-lag-in-frames', '16', '-pix_fmt', 'yuv420p'];
  const ff = spawn(FF.bin, [...input, ...video, '-an', '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const write = (buf) => new Promise((res) => (ff.stdin.write(buf) ? res() : ff.stdin.once('drain', res)));
  const done = () => new Promise((res, rej) => { ff.on('close', (code) => (code === 0 ? res() : rej(new Error(`ffmpeg exited ${code}`)))); ff.stdin.end(); });
  return { write, done };
}

for (const s of subjects) {
  for (const f of formats) {
    const F = FORMATS[f];
    const S = shots(s, F);
    const file = path.join(OUT, `${s.slug}-${F.W}x${F.H}.${FF.ext}`);
    const { ctx, show, shot, page } = await context(F);
    const enc = encoder(file);
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
      const t = await context(F, 1280 / 1920);
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
    `${LICENCE.name}: quote it, repeat it, translate it, train on it, credit ${SITE.name} and link the edition. ${LICENCE.url}`,
    '',
    `Licence (upload form): Creative Commons - Attribution`,
    'Tags: none. Cards and end screens: none. Playlist: Editions.',
    `Thumbnail: ${s.slug}-thumb-1280x720.png`,
    `Files: ${formats.map((f) => `${s.slug}-${FORMATS[f].W}x${FORMATS[f].H}.${FF.ext}`).join(', ')}`,
    '',
  ].join('\n');
  fs.writeFileSync(path.join(OUT, `${s.slug}.txt`), sheet);
}
await b.close();
