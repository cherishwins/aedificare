#!/usr/bin/env node
/**
 * Client JavaScript budget: 5 kB gzipped for the whole site.
 *
 * The rose must be computed live and the width axis must move with the
 * reader; that is the only JavaScript this brand earns. Everything else is
 * CSS. This sums the gzipped size of every unique script the build ships,
 * external files and inline bodies alike (JSON-LD is data, not code, and is
 * not counted), and fails the build above the budget. Runs in `npm run build`.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = process.argv[2] || 'dist';
const BUDGET = 5 * 1024;

const scripts = new Map(); // content -> where first seen
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (f.endsWith('.js')) scripts.set(fs.readFileSync(f, 'utf8'), f);
    else if (f.endsWith('.html')) {
      const html = fs.readFileSync(f, 'utf8');
      for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
        if (/type=["']application\/ld\+json["']/.test(m[1])) continue;
        if (/\bsrc=/.test(m[1])) continue;
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
console.log(`check-budget: ${total} B gzipped of ${BUDGET} B`);
if (total > BUDGET) {
  console.error(`\ncheck-budget: over budget by ${total - BUDGET} B. Question the feature before raising the number.\n`);
  process.exit(1);
}
