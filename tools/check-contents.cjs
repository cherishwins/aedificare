#!/usr/bin/env node
/**
 * The home prints each edition's contents from src/lib/editions.mjs. That
 * list is typed, and what is typed drifts, so this fails the build unless
 * every entry's anchor id exists in the built edition page and its title
 * appears in a heading or section label there. Runs on dist/, after build.
 *
 * It also reads every published page's <meta name="description">, the home
 * included, and fails outside 100 to 200 characters: LinkedIn's Post
 * Inspector warns under 100, and search snippets cut at about 160, so the
 * lede must come first and the record line after it must stay short.
 *
 *   node tools/check-contents.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const norm = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim().toLowerCase();
const entities = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const DESC = { min: 100, max: 200 };
const checkDescription = (label, file, problems) => {
  const html = fs.readFileSync(file, 'utf8');
  const m = html.match(/<meta name="description" content="([^"]*)"/);
  if (!m) { problems.push(`${label}: no meta description in ${file}`); return; }
  const n = entities(m[1]).length;
  if (n < DESC.min || n > DESC.max) problems.push(`${label}: description is ${n} characters, not ${DESC.min} to ${DESC.max}: "${entities(m[1])}"`);
};

(async () => {
  const { PUBLISHED } = await import('../src/lib/editions.mjs');
  const problems = [];
  let checked = 0;
  for (const e of PUBLISHED) {
    if (!e.contents) { problems.push(`${e.code}: no contents list`); continue; }
    const file = path.join('dist', e.slug, 'index.html');
    if (!fs.existsSync(file)) { problems.push(`${e.code}: ${file} missing`); continue; }
    checkDescription(e.code, file, problems);
    const html = fs.readFileSync(file, 'utf8');
    const headings = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>|<p class="mono-b"[^>]*>(.*?)<\/p>/gs)]
      .map((m) => norm(m[1] || m[2] || ''));
    for (const c of e.contents) {
      checked++;
      if (!html.includes(`id="${c.id}"`)) problems.push(`${e.code} ${c.n}: no element with id="${c.id}" in ${file}`);
      const t = norm(c.t);
      if (!headings.some((h) => h.includes(t))) problems.push(`${e.code} ${c.n}: "${c.t}" is not a heading or label in ${file}`);
    }
  }
  checkDescription('home', path.join('dist', 'index.html'), problems);
  if (problems.length) {
    console.error('check-contents: ' + problems.length + ' problem(s)');
    for (const p of problems) console.error('  ' + p);
    process.exit(1);
  }
  console.log(`check-contents: ${checked} entries verified against the built pages; ${PUBLISHED.length + 1} descriptions within ${DESC.min} to ${DESC.max} characters`);
})();
