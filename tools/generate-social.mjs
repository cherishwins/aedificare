/**
 * The social kit, generated from the same system as the site.
 *
 * Headers and avatars for the platform slots that demand them, composed
 * from src/lib/rose.mjs so they match the site to the pixel and can be
 * regenerated the day a seed changes. Each header: Void ground, the house
 * configuration live-frozen at its own seed and cropped by the frame, the
 * wordmark running off the right edge, the mark and name at masthead size,
 * the seed logged in Martian Mono. Acid is spent once, on the k=5 curve.
 * Avatars are the mark alone, padded for a circular crop.
 *
 * Output goes to brand/, which .vercelignore keeps out of the deploy.
 *
 *   node tools/generate-social.mjs
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { rhodonea, markPath, HOUSE } from '../src/lib/rose.mjs';

const OUT = 'brand';
fs.mkdirSync(OUT, { recursive: true });

const font = (f) => fs.readFileSync(path.join('public/fonts', f)).toString('base64');
const fontCss = `
@font-face{font-family:'Bricolage Grotesque';src:url(data:font/woff2;base64,${font('BricolageGrotesque.woff2')}) format('woff2');font-weight:200 800;font-stretch:75% 100%;font-display:block}
@font-face{font-family:'Martian Mono';src:url(data:font/woff2;base64,${font('MartianMono.woff2')}) format('woff2');font-weight:100 800;font-stretch:75% 112.5%;font-display:block}`;

const COLOURS = ['#CCFF00', '#00B24F', '#FF1F5A'];
const OPACITY = [0.95, 0.6, 0.8];

function houseSvg(seed, size, style) {
  return `<svg viewBox="0 0 1000 1000" style="position:absolute;width:${size}px;height:${size}px;${style}">` +
    HOUSE.map((L, i) => `<path d="${rhodonea(500, 500, 480 * L.s, L.k + seed, L.ph, 9, 2400)}" fill="none" stroke="${COLOURS[i]}" stroke-width="${L.w}" stroke-opacity="${OPACITY[i]}"/>`).join('') +
    '</svg>';
}

/** Headers: [name, width, height, seed, wordmark size, wordmark left, rose size, rose style]. */
const HEADERS = [
  // X overlays the avatar bottom-left, so the wordmark starts a third in and the rose sits right.
  ['x-header-1500x500', 1500, 500, 0.5, 300, '31%', 900, 'top:-200px;right:-160px'],
  // LinkedIn overlays the photo bottom-left as well, on a wider, shorter canvas.
  ['linkedin-banner-1584x396', 1584, 396, 0.5, 240, '30%', 760, 'top:-180px;right:-120px'],
  // Facebook / generic wide cover.
  ['cover-1640x624', 1640, 624, 0.5, 380, '4%', 1100, 'top:-260px;right:-220px'],
];

const header = ([, w, h, seed, fs_, left, rs, rstyle]) => `<!doctype html><meta charset="utf-8"><style>${fontCss}
*{margin:0;padding:0;box-sizing:border-box}
body{width:${w}px;height:${h}px;background:#050A06;color:#FFFFFF;overflow:hidden;position:relative;font-family:'Bricolage Grotesque',sans-serif}
.mast{position:absolute;left:40px;top:36px;display:flex;align-items:center;gap:12px;font-family:'Martian Mono',monospace;font-variation-settings:'wdth' 75,'wght' 700;font-size:13px;letter-spacing:.3em;color:#00B24F;z-index:2}
.mast svg{width:26px;height:26px}
h1{position:absolute;left:${left};top:50%;transform:translateY(-46%);z-index:2;font-variation-settings:'opsz' 96,'wdth' 75,'wght' 800;font-size:${fs_}px;line-height:.8;letter-spacing:-.03em;white-space:nowrap;text-transform:uppercase}
.seed{position:absolute;right:40px;bottom:32px;z-index:2;font-family:'Martian Mono',monospace;font-variation-settings:'wdth' 75,'wght' 500;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#00B24F}
</style>
${houseSvg(seed, rs, rstyle)}
<div class="mast"><svg viewBox="0 0 100 100"><path d="${markPath(100)}" fill="none" stroke="#00B24F" stroke-width="6"/></svg>AEDIFICARE</div>
<h1>Aedificare</h1>
<div class="seed">r = cos(kθ) · seed 0500 · k 5/7/3</div>`;

/** Avatars: the mark alone. pad is the share of the canvas kept clear for circular crops. */
const AVATARS = [
  ['avatar-400', 400, 0.16, 5],
  ['avatar-800', 800, 0.16, 4],
  ['linkedin-logo-300', 300, 0.14, 5.5],
];
const avatar = ([, size, pad, stroke]) => `<!doctype html><meta charset="utf-8"><style>
*{margin:0;padding:0}body{width:${size}px;height:${size}px;background:#050A06;overflow:hidden}
svg{position:absolute;left:${pad * 100}%;top:${pad * 100}%;width:${(1 - 2 * pad) * 100}%;height:${(1 - 2 * pad) * 100}%}
</style><svg viewBox="0 0 100 100"><path d="${markPath(100)}" fill="none" stroke="#CCFF00" stroke-width="${stroke}" stroke-linejoin="round"/></svg>`;

const b = await chromium.launch();
for (const H of HEADERS) {
  const p = await b.newPage({ viewport: { width: H[1], height: H[2] }, deviceScaleFactor: 1 });
  await p.setContent(header(H), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.ready);
  const ok = await p.evaluate(() => document.fonts.check("800 40px 'Bricolage Grotesque'") && document.fonts.check("500 10px 'Martian Mono'"));
  if (!ok) { console.error(`generate-social: brand faces did not load for ${H[0]}`); process.exit(1); }
  await p.screenshot({ path: `${OUT}/${H[0]}.png` });
  console.log(`  brand/${H[0]}.png`.padEnd(38) + Math.round(fs.statSync(`${OUT}/${H[0]}.png`).size / 1024) + ' KB');
  await p.close();
}
for (const A of AVATARS) {
  const p = await b.newPage({ viewport: { width: A[1], height: A[1] }, deviceScaleFactor: 1 });
  await p.setContent(avatar(A), { waitUntil: 'load' });
  await p.screenshot({ path: `${OUT}/${A[0]}.png` });
  console.log(`  brand/${A[0]}.png`.padEnd(38) + Math.round(fs.statSync(`${OUT}/${A[0]}.png`).size / 1024) + ' KB');
  await p.close();
}
await b.close();
