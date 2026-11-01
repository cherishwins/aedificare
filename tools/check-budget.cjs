#!/usr/bin/env node
/**
 * Client JavaScript budget: 6 kB gzipped for the whole site (5 kB until 1 Nov 2026).
 *
 * The rose must be computed live and the width axis must move with the
 * reader; that, the film on the reader's press, and Vercel's page-view count
 * are the only JavaScript this brand earns. Everything else is CSS. This
 * sums the gzipped size of every unique script the build ships, external
 * files and inline bodies alike (JSON-LD is data, not code, and is not
 * counted), plus the measured size of each script Vercel serves that a page
 * loads (`SERVED`), and fails the build above the budget. Runs in
 * `npm run build`.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = process.argv[2] || 'dist';
// 6 kB since 1 Nov 2026, when the owner chose Vercel Web Analytics (CLAUDE.md, Decisions log); 5 kB before.
const BUDGET = 6 * 1024;
// Scripts a page loads that the build does not ship, counted at their measured gzipped size so the
// budget stays the reader's real cost. Web Analytics' script is Vercel's, served at the edge: 4,522 B
// raw and 2,043 B gzipped, read from va.vercel-scripts.com/v1/script.js on 1 Nov 2026.
const SERVED = { '/_vercel/insights/script.js': 2043 };

const scripts = new Map(); // content -> where first seen
const served = new Set(); // SERVED paths some page loads
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (f.endsWith('.js')) scripts.set(fs.readFileSync(f, 'utf8'), f);
    else if (f.endsWith('.html')) {
      const html = fs.readFileSync(f, 'utf8');
      for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
        if (/type=["']application\/ld\+json["']/.test(m[1])) continue;
        const src = m[1].match(/\bsrc=["']([^"']+)["']/);
        if (src) { if (SERVED[src[1]]) served.add(src[1]); continue; }
        if (m[2].trim()) scripts.set(m[2], f + ' (inline)');
      }
    }
  }
}
walk(ROOT);

let total = 0;
for (const [src, where] of scripts) {
  const gz = zlib.gzipSync(Buffer.from(src)).length;
  total += gz;
  console.log(`  ${String(gz).padStart(6)} B gz  ${where}`);
}
for (const p of served) {
  total += SERVED[p];
  console.log(`  ${String(SERVED[p]).padStart(6)} B gz  ${p} (served by Vercel, measured)`);
}
console.log(`check-budget: ${total} B gzipped of ${BUDGET} B`);
if (total > BUDGET) {
  console.error(`\ncheck-budget: over budget by ${total - BUDGET} B. Question the feature before raising the number.\n`);
  process.exit(1);
}
