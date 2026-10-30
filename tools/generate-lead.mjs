/**
 * The lead images (CLAUDE.md, Decisions log, 30 Oct 2026): for each published edition, one of its own figures
 * rendered alone, so the article's structured data has a picture that is not text first in its `image` list. Google
 * Discover asks for large images and not text-heavy ones; og:image stays the type card with the mark (override 2).
 *
 * Each image is the BUILT page's own figure element, drawn by Chromium from dist/ as the page draws it: the page is
 * loaded at 1280 px, the figure measured there, then everything but the figure and the surface it sits on is hidden,
 * and the figure is set at its 1280 px width, zoomed to fill the frame inside a margin of 8 percent of the frame's
 * short side, and centred on its surface's own ground. No headline, no mark, no words but the figure's own. Three
 * frames each, as Google's article image guidance asks: 16:9 at 1920 by 1080, 4:3 at 1600 by 1200, 1:1 at 1200 by
 * 1200. The faces are asserted loaded with document.fonts.check, because fonts.ready resolves when nothing loaded.
 *
 * The figure is a picture (bars, a diagram, a grid), never a block of text; which one, and why, is the table below,
 * one line per edition, the builder's proposal of 30 Oct 2026 and the owner's to change. The figure is already on
 * the page, so the page shows no second copy of it. An edition whose page has no figure that is not text gets no lead
 * image rather than a picture of type, and src/lib/lead.mjs says why in NO_FIGURE; its article lists the card alone,
 * as before, until the page has a chart.
 *
 * Content-hashed into public/lead/ like the cards (src/lib/lead-manifest.json maps each edition to its three files
 * and the alt text). Renders depend on the machine's Chromium (CLAUDE.md, Discoverability: npm run og is not
 * reproducible), so the build never runs this; src/lib/lead.mjs holds the manifest to the files on disk and to the
 * published editions, and the build stops when they disagree. Run it after building, when an edition is published or
 * its chosen figure changes, and commit only the editions whose figure changed (restore the rest, as for the cards).
 *
 *   npm run build && node tools/generate-lead.mjs [slug ...]
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PUBLISHED } from '../src/lib/editions.mjs';
import { LEAD_DIR as OUT, LEAD_FILE, FRAMES, NO_FIGURE, ALT } from '../src/lib/lead.mjs';

/**
 * slug: [selector, why]. The selector names exactly one element on the built page; `keep`, where given, is the only
 * children of it shown (the two date columns of a section, without its prose).
 */
export const FIGURES = {
  'the-floor': { sel: 'figure[aria-label="Measured throughput by channel width, against the chip\'s peak"]', why: 'The bench bars are the edition: what the radio measured at each channel width, against the 32.5 Mbps peak the datasheet gives.' },
  'the-countersign': { sel: 'figure[aria-label="GOAT market value at four reported points, log scale"]', why: 'The climb, launch to peak on a log scale: the one picture of the money the edition is about.' },
  'the-supply-cabinet': { sel: 'figure[aria-label="What 100 agents did after one of them found the hole"]', why: 'The split: what a hundred agents did once one found the hole, the four-way figure the print set as its cover number.' },
  'the-fourth-axis': { sel: 'figure[aria-label="Top-1 accuracy on the Cars dataset from one token"]', why: 'One token holding the whole image: a stolen background patch names the car nearly as well as the class token, as three bars. Qwen3-Next\'s 48 layers were tried first and render as a strip of cells under a block of type; the path diagrams are thin strips.' },
  'the-tilt-gap': { sel: 'figure[aria-label="Hours of play behind each result, log scale"]', why: 'Hours of play behind each result on a log scale: the exhaust the thesis rests on, as bars.' },
  'edition-03': { sel: 'figure[aria-label="USD per node, log scale"]', why: 'The four node prices on a log scale: the markup itself.' },
  'edition-01': { sel: 'figure[aria-label="Exploit rate across 13 frontier models, range"]', why: 'The exploit-rate range across thirteen models: measured bars, where the cliff chart beside it is a schematic and the plasticity chart a qualitative placement.' },
};

const ROOT = 'dist';
const ORIGIN = 'https://local.test';
const MIME = { html: 'text/html', css: 'text/css', js: 'text/javascript', png: 'image/png', svg: 'image/svg+xml', woff2: 'font/woff2', json: 'application/json' };
const only = process.argv.slice(2);
const fail = (m) => { console.error(`generate-lead: ${m}`); process.exit(1); };
if (!fs.existsSync(path.join(ROOT, 'index.html'))) fail('no build in dist/; run npm run build first');
for (const e of PUBLISHED) if (!FIGURES[e.slug] && !NO_FIGURE[e.slug]) fail(`${e.slug} is published and the table names no figure for it, nor says in NO_FIGURE (src/lib/lead.mjs) why it has none`);
for (const s of Object.keys(FIGURES)) if (NO_FIGURE[s]) fail(`${s} is in the table and in NO_FIGURE; it is one or the other`);
for (const s of only) if (!FIGURES[s] || !PUBLISHED.some((e) => e.slug === s)) fail(`${s} is not a published edition in the table`);

const manifest = fs.existsSync(LEAD_FILE) ? JSON.parse(fs.readFileSync(LEAD_FILE, 'utf8')) : {};
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const page = await ctx.newPage();
await page.route('**/*', (route) => {
  const u = new URL(route.request().url());
  if (u.host !== 'local.test') return route.fulfill({ status: 204, body: '' });
  let f = path.join(ROOT, decodeURIComponent(u.pathname));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f) && fs.existsSync(f + '/index.html')) f += '/index.html';
  if (fs.existsSync(f) && fs.statSync(f).isFile()) return route.fulfill({ status: 200, contentType: MIME[path.extname(f).slice(1)] || 'application/octet-stream', body: fs.readFileSync(f) });
  return route.fulfill({ status: 404, body: '' });
});

for (const e of PUBLISHED) {
  if (only.length && !only.includes(e.slug)) continue;
  if (!FIGURES[e.slug]) continue;
  const { sel, keep, why } = FIGURES[e.slug];
  const entry = { figure: sel, why, alt: '' };
  for (const [key, { width: W, height: H }] of Object.entries(FRAMES)) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(ORIGIN + e.path, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const ok = await page.evaluate(() => document.fonts.check("800 40px 'Bricolage Grotesque'") && document.fonts.check("500 11px 'Martian Mono'"));
    if (!ok) fail(`the brand faces did not load on ${e.path}`);
    const m = await page.evaluate(({ sel }) => {
      const all = document.querySelectorAll(sel);
      if (all.length !== 1) return { n: all.length };
      const el = all[0], r = el.getBoundingClientRect();
      const surface = el.closest('.surface');
      const ground = surface?.classList.contains('flash') ? 'white' : surface?.classList.contains('bottle') ? 'dark green' : 'black';
      return { n: 1, w: Math.ceil(Math.max(r.width, el.scrollWidth)), label: el.getAttribute('aria-label') || el.querySelector('figcaption')?.textContent || '', ground };
    }, { sel });
    if (m.n !== 1) fail(`${e.slug}: "${sel}" names ${m.n} elements on ${e.path}, not one`);
    if (!m.label.trim()) fail(`${e.slug}: "${sel}" has no aria-label and no figcaption, so the alt text would name nothing; choose a figure the page names`);
    await page.setViewportSize({ width: W, height: H });
    const z = await page.evaluate(({ sel, keep, w, W, H }) => {
      const el = document.querySelector(sel);
      const surface = el.closest('.surface');
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
        for (const s of n.parentElement?.children ?? []) if (s !== n && !['STYLE', 'SCRIPT', 'LINK', 'META'].includes(s.tagName)) s.style.setProperty('display', 'none', 'important');
      }
      if (keep) for (const c of el.children) if (!c.matches(keep)) c.style.setProperty('display', 'none', 'important');
      Object.assign(surface.style, { position: 'fixed', inset: '0', margin: '0', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minHeight: '0', height: '100vh' });
      for (let n = el.parentElement; n && n !== surface; n = n.parentElement) Object.assign(n.style, { display: 'block', padding: '0', margin: '0', width: 'auto' });
      Object.assign(el.style, { maxWidth: 'none', margin: '0', flex: 'none', overflow: 'visible', gridColumn: 'auto' });
      // The width the figure is laid out at: its own at 1280, or a narrower one where the frame is squarer, whichever
      // fills the most of the frame once zoomed (a full-width chart in a square frame is otherwise a strip). Never
      // narrower than the figure's own content, so a table is never squeezed past its columns.
      const pad = Math.round(0.08 * Math.min(W, H));
      let best = null;
      for (const c of [w, ...[1120, 1000, 880, 760, 640, 560, 480, 400].filter((x) => x < w)]) {
        el.style.width = `${c}px`;
        const cw = Math.max(c, el.scrollWidth), h = el.getBoundingClientRect().height;
        const z = Math.min((W - 2 * pad) / cw, (H - 2 * pad) / h, 3);
        const area = z * z * cw * h;
        if (!best || area > best.area * 1.02) best = { cw, z, area };
      }
      el.style.width = `${best.cw}px`;
      el.style.zoom = String(best.z);
      return best.z;
    }, { sel, keep: keep ?? null, w: m.w, W, H });
    await page.waitForTimeout(120);
    const bytes = await page.screenshot({ type: 'png' });
    const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 8);
    const name = `${e.slug}-${key}.${hash}.png`;
    fs.writeFileSync(path.join(OUT, name), bytes);
    entry[key] = { src: `/lead/${name}`, width: W, height: H };
    entry.alt = ALT(e.title, m.label.trim().replace(/\.$/, ''), m.ground);
    console.log(`  ${path.join(OUT, name)}`.padEnd(52) + `${W}x${H}  zoom ${z.toFixed(2)}  ${Math.round(bytes.length / 1024)} KB`);
  }
  manifest[e.slug] = entry;
}
await browser.close();

const ordered = {};
for (const e of PUBLISHED) if (manifest[e.slug] && FIGURES[e.slug]) ordered[e.slug] = manifest[e.slug];
const keepFiles = new Set(Object.values(ordered).flatMap((x) => Object.keys(FRAMES).map((k) => path.basename(x[k].src))));
for (const f of fs.readdirSync(OUT)) if (!keepFiles.has(f)) { fs.unlinkSync(path.join(OUT, f)); console.log(`  removed ${path.join(OUT, f)}`); }
fs.writeFileSync(LEAD_FILE, JSON.stringify(ordered, null, 2) + '\n');
console.log(`  ${LEAD_FILE}: ${Object.keys(ordered).length} editions`);
