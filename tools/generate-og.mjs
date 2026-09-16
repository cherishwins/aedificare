/**
 * The share cards, generated. Ported pattern from cherishwins/teamcanada;
 * card design from the brand kit's OG rules.
 *
 * Each card: Void ground, a Malachite rose field behind at 0.35 to 0.5 from
 * its own seed and k so no two match, type at 200px or more bleeding off both
 * edges so the card is legible only as a fragment, Acid spent once on one
 * word, the seed logged in Martian Mono at 10px. The mark and name ride
 * top-left at masthead size (an owner decision over the kit's "no lockup",
 * recorded in CLAUDE.md).
 *
 * Filenames are CONTENT-HASHED and resolved through src/lib/og-manifest.json,
 * which carries the hashed path and the alt text together so neither can
 * drift from the card. Platforms mirror OG bytes by URL and a re-scrape cannot
 * refresh a stale card; only a new URL can. The unhashed copy stays so links
 * already in the wild resolve.
 *
 *   node tools/generate-og.mjs
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { rhodonea, markPath } from '../src/lib/rose.mjs';
import { EDITIONS, PUBLISHED, seedNumber } from '../src/lib/editions.mjs';

const OUT = 'public/og';
fs.mkdirSync(OUT, { recursive: true });

// Per-card composition only; the words come from the editions list.
const X = { 'ns-01': -0.18, 'ns-02': -0.3, 'edition-02': -0.22, 'edition-03': 0.037, 'edition-01': -0.06 };
const COUNT = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'][PUBLISHED.length] ?? String(PUBLISHED.length);
const CARDS = [
  { slug: 'home', words: ['AEDIFICARE'], acid: 'AEDIFICARE', line: `${COUNT} editions · September 2026`, seed: '0500', k: [5, 7, 3], x: -0.06 },
  ...EDITIONS.map((e) => ({
    slug: e.slug, words: e.title.toUpperCase().split(' '), acid: e.acid.toUpperCase(),
    line: `${e.dateLabel} · ${e.lede}`, seed: e.seed, k: e.k, x: X[e.slug] ?? -0.2,
  })),
];

const font = (f) => fs.readFileSync(path.join('public/fonts', f)).toString('base64');
const fontCss = `
@font-face{font-family:'Bricolage Grotesque';src:url(data:font/woff2;base64,${font('BricolageGrotesque.woff2')}) format('woff2');font-weight:200 800;font-stretch:75% 100%;font-display:block}
@font-face{font-family:'Martian Mono';src:url(data:font/woff2;base64,${font('MartianMono.woff2')}) format('woff2');font-weight:100 800;font-stretch:75% 112.5%;font-display:block}`;

// Seeds are parsed by the editions module: decimal, or hexadecimal when not all digits.
const kLabel = (ks) => ks.map((k) => (Number.isInteger(k) ? String(k) : k.toFixed(2))).join('/');

function roseSvg(ks, seed) {
  const phase = (seedNumber(seed) / 10000) * Math.PI;
  const layers = ks.map((k, i) => ({ k: k + 0.04 * i, s: [1, 0.74, 0.5][i], ph: phase + i * 0.41, o: [0.5, 0.4, 0.35][i], w: [0.9, 0.8, 0.8][i] }));
  return `<svg viewBox="0 0 1000 1000" style="position:absolute;width:1040px;height:1040px;top:-330px;right:-260px">` +
    layers.map((L) => `<path d="${rhodonea(500, 500, 480 * L.s, L.k, L.ph, 9, 2400)}" fill="none" stroke="#00B24F" stroke-width="${L.w}" stroke-opacity="${L.o}"/>`).join('') + '</svg>';
}

const page = (c) => `<!doctype html><meta charset="utf-8"><style>${fontCss}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#050A06;color:#FFFFFF;overflow:hidden;position:relative;font-family:'Bricolage Grotesque',sans-serif}
.mast{position:absolute;left:44px;top:40px;display:flex;align-items:center;gap:14px;font-family:'Martian Mono',monospace;font-variation-settings:'wdth' 75,'wght' 700;font-size:14px;letter-spacing:.3em;color:#00B24F;z-index:2}
.mast svg{width:30px;height:30px}
h1{position:absolute;left:${c.x * 100}%;top:118px;z-index:2;font-variation-settings:'opsz' 96,'wdth' 75,'wght' 800;font-size:${c.words.length > 2 ? 210 : 240}px;line-height:.8;letter-spacing:-.025em;white-space:nowrap;text-transform:uppercase}
h1 .acid{color:#CCFF00}
.line{position:absolute;left:44px;bottom:44px;z-index:2;font-family:'Martian Mono',monospace;font-variation-settings:'wdth' 75,'wght' 500;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#00B24F;max-width:820px;line-height:1.6}
.seed{position:absolute;right:44px;bottom:44px;z-index:2;font-family:'Martian Mono',monospace;font-variation-settings:'wdth' 75,'wght' 500;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#00B24F}
</style>
${roseSvg(c.k, c.seed)}
<div class="mast"><svg viewBox="0 0 100 100"><path d="${markPath(100)}" fill="none" stroke="#00B24F" stroke-width="6"/></svg>AEDIFICARE</div>
<h1>${c.words.map((w) => (w === c.acid ? `<span class="acid">${w}</span>` : w)).join(' ')}</h1>
<div class="line">${c.line}</div>
<div class="seed">r = cos(kθ) · seed ${c.seed} · k ${kLabel(c.k)}</div>`;

/** Alt text derived from the card, so it cannot drift from what the card says. */
const altFor = (c) => `Aedificare share card: ${c.words.join(' ')}, in acid green and white type running off both edges over a green rose curve. ${c.line.replace(/ · /g, '. ')}.`;

const hashed = {};
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
for (const c of CARDS) {
  await p.setContent(page(c), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  const ok = await p.evaluate(() => document.fonts.check("800 40px 'Bricolage Grotesque'") && document.fonts.check("500 10px 'Martian Mono'"));
  if (!ok) { console.error(`generate-og: brand faces did not load for ${c.slug}`); process.exit(1); }
  await p.waitForTimeout(100);
  const base = path.join(OUT, c.slug + '.png');
  await p.screenshot({ path: base });
  const bytes = fs.readFileSync(base);
  const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 8);
  hashed[c.slug] = `/og/${c.slug}.${hash}.png`;
  fs.writeFileSync(path.join(OUT, `${c.slug}.${hash}.png`), bytes);
  console.log(`  og/${c.slug}.${hash}.png`.padEnd(34) + Math.round(bytes.length / 1024) + ' KB');
}
await b.close();

// Drop hashed cards from earlier runs so the folder does not accumulate.
const keep = new Set(Object.values(hashed).map((u) => path.basename(u)));
for (const f of fs.readdirSync(OUT)) if (/^.+\.[0-9a-f]{8}\.png$/.test(f) && !keep.has(f)) fs.unlinkSync(path.join(OUT, f));

const manifest = {};
for (const c of CARDS) manifest[`/og/${c.slug}.png`] = { src: hashed[c.slug], alt: altFor(c) };
fs.writeFileSync('src/lib/og-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log('  src/lib/og-manifest.json'.padEnd(34) + Object.keys(manifest).length + ' entries');
