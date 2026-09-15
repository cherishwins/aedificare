/**
 * The mark, frozen. Seed AED-M-01: one rhodonea, k=5, one turn.
 *
 * Writes favicon.svg (Acid on Void, crisp at any size) and the PNG icons the
 * platforms insist on, all from src/lib/rose.mjs so the favicon is the same
 * curve as the live field. Stroke thickens as the canvas shrinks: a 0.8
 * hairline that reads at 300px is invisible at 16px, and an icon that is
 * invisible is not a mark.
 *
 *   node tools/generate-marks.mjs
 */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import { markPath } from '../src/lib/rose.mjs';

const d = markPath(100);
const svg = (stroke, pad = 0) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${100 + 2 * pad} ${100 + 2 * pad}">` +
  `<rect x="${-pad}" y="${-pad}" width="${100 + 2 * pad}" height="${100 + 2 * pad}" fill="#050A06"/>` +
  `<path d="${d}" fill="none" stroke="#CCFF00" stroke-width="${stroke}" stroke-linejoin="round"/></svg>`;

fs.writeFileSync('public/favicon.svg', svg(7));
console.log('  public/favicon.svg');

const PNGS = [
  ['favicon-32.png', 32, 7, 0],
  ['apple-touch-icon.png', 180, 4.5, 0],
  ['icon-192.png', 192, 4.5, 0],
  ['icon-512.png', 512, 3.2, 0],
  // Maskable: the safe zone is the central 80%, so pad the artwork by 12.5%.
  ['maskable-512.png', 512, 3.2, 12.5],
];
const b = await chromium.launch();
for (const [name, size, stroke, pad] of PNGS) {
  const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await p.setContent(`<!doctype html><style>html,body{margin:0;background:#050A06}svg{display:block;width:${size}px;height:${size}px}</style>${svg(stroke, pad)}`);
  await p.screenshot({ path: 'public/' + name, omitBackground: false });
  await p.close();
  console.log('  public/' + name.padEnd(22), fs.statSync('public/' + name).size, 'bytes');
}
await b.close();
