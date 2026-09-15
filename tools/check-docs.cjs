#!/usr/bin/env node
/**
 * CLAUDE.md names real files. Verified, not assumed.
 *
 * Ported from cherishwins/teamcanada, where that file described something
 * untrue three times and each was found by accident. A path is the cheapest
 * kind of claim to check: either the file is there or it is not. This does
 * not verify that the PROSE is true; nothing can. It verifies the one part a
 * machine can settle. Runs inside `npm run build`.
 */
const fs = require('fs');
const path = require('path');

const DOC = process.argv[2] || 'CLAUDE.md';
const text = fs.readFileSync(DOC, 'utf8');

// Only backticked paths rooted at a real top-level directory. Prose like
// `npm run build` or a bare filename is not a path claim and is left alone.
const ROOTS = ['src/', 'tools/', 'public/', '.github/', 'source/'];

/**
 * Paths the deploy does not receive are not this check's business.
 * `.vercelignore` keeps source/ out of the upload, so on Vercel that
 * directory genuinely does not exist. Read the ignore file rather than
 * hardcoding the exception; skips are printed, never silent.
 */
function ignoredPrefixes() {
  const f = path.join(path.dirname(DOC), '.vercelignore');
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, 'utf8').split('\n')
    .map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
    .map((l) => (l.endsWith('/') ? l : l + '/'));
}
const IGNORED = ignoredPrefixes();

const missing = [], skipped = [], seen = new Set();
for (const m of text.matchAll(/`([A-Za-z0-9_.@/-]+)`/g)) {
  const p = m[1];
  if (!ROOTS.some((r) => p.startsWith(r))) continue;
  if (seen.has(p)) continue;
  seen.add(p);
  if (IGNORED.some((ig) => p === ig.slice(0, -1) || p.startsWith(ig))) { skipped.push(p); continue; }
  const probe = p.includes('*') ? path.dirname(p) : p;
  if (!fs.existsSync(probe)) missing.push(p);
}

if (missing.length) {
  console.error(`\ncheck-docs: ${DOC} names ${missing.length} path(s) that do not exist\n`);
  for (const p of missing) console.error('  ' + p);
  console.error('\nRename or remove them. A file that documents the wrong filename is worse');
  console.error('than one that documents nothing: it sends the next reader somewhere empty.\n');
  process.exit(1);
}
const note = skipped.length ? ` (${skipped.length} not checked, kept out of the deploy by .vercelignore: ${skipped.join(', ')})` : '';
console.log(`check-docs: ${DOC}, ${seen.size - skipped.length} paths present${note}`);
