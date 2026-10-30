#!/usr/bin/env node
/**
 * The home prints each edition's contents from src/lib/editions.mjs. That
 * list is typed, and what is typed drifts, so this fails the build unless
 * every entry's anchor id exists in the built edition page and its title
 * appears in a heading or section label there. Runs on dist/, after build.
 *
 * A draft is not on the home, but its contents list is typed all the same
 * and its page is built, so a draft that HAS a list is checked too. That
 * way the list is already true on the day `draft` is flipped, which is the
 * one day nobody re-reads it. Only a published edition is REQUIRED to have
 * a list.
 *
 * It also reads every published page's <meta name="description">, the home
 * included, and fails outside 100 to 200 characters: LinkedIn's Post
 * Inspector warns under 100, and search snippets cut at about 160, so the
 * lede must come first and the record line after it must stay short.
 *
 * Since 30 Oct 2026 it also holds every published edition to its checked
 * dek, seoTitle and description and their lengths (title and dek at most
 * 110, seoTitle at most 70, description 140 to 160, no em dash), and
 * vercel.json's PDF headers to the list: each edition with a PDF has one
 * rule for it whose Link names its page as canonical.
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
  const { EDITIONS, PUBLISHED } = await import('../src/lib/editions.mjs');
  const problems = [];
  let checked = 0;
  for (const e of EDITIONS) {
    if (!e.contents) {
      if (!e.draft) problems.push(`${e.code}: no contents list`);
      continue;
    }
    const file = path.join('dist', e.slug, 'index.html');
    if (!fs.existsSync(file)) { problems.push(`${e.code}: ${file} missing`); continue; }
    if (!e.draft) checkDescription(e.code, file, problems);
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

  // The packaging (30 Oct 2026): every published edition carries a checked dek, seoTitle and description, and each
  // fits where it is shown. Title, colon, dek is the NewsArticle headline, which Google cuts at 110 characters; a
  // <title> is cut near 70 before the site name; a description runs 140 to 160 so a snippet shows all of it.
  let packaged = 0;
  for (const e of PUBLISHED) {
    const miss = ['dek', 'seoTitle', 'description'].filter((k) => typeof e[k] !== 'string' || !e[k].trim());
    if (miss.length) { problems.push(`${e.code}: published with no ${miss.join(', ')}`); continue; }
    packaged++;
    const head = `${e.title}: ${e.dek}`;
    if (head.length > 110) problems.push(`${e.code}: title and dek run ${head.length} characters, over 110: "${head}"`);
    if (e.seoTitle.length > 70) problems.push(`${e.code}: seoTitle runs ${e.seoTitle.length} characters, over 70: "${e.seoTitle}"`);
    if (e.description.length < 140 || e.description.length > 160) problems.push(`${e.code}: description runs ${e.description.length} characters, not 140 to 160: "${e.description}"`);
    for (const k of ['dek', 'seoTitle', 'description']) if (/\u2014/.test(e[k])) problems.push(`${e.code}: ${k} carries an em dash`);
  }

  // The PDFs' canonical headers. vercel.json is static, so the map from each print to its page is typed there; this
  // holds it to the editions list: every edition with a PDF has exactly one header rule for it, naming its page.
  const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  const { SITE } = await import('../src/config.mjs');
  const origin = 'https://aedificare.art'; // the production origin, never a preview's SITE_ORIGIN
  if (SITE.origin !== origin && !process.env.SITE_ORIGIN) problems.push(`vercel.json canonicals name ${origin}, src/config.mjs ${SITE.origin}`);
  const canonOf = (h) => [...(h.headers || [])].filter((x) => x.key.toLowerCase() === 'link')
    .flatMap((x) => [...x.value.matchAll(/<([^>]+)>;\s*rel="canonical"/g)].map((m) => m[1]));
  const pdfRules = vercel.headers.filter((h) => /^\/pdf\//.test(h.source));
  let pdfs = 0;
  for (const e of EDITIONS.filter((x) => x.pdf)) {
    pdfs++;
    const rules = pdfRules.filter((h) => h.source === e.pdf);
    const want = origin + e.path;
    if (rules.length !== 1) { problems.push(`vercel.json: ${rules.length} header rules for ${e.pdf}, not one`); continue; }
    const got = canonOf(rules[0]);
    if (got.length !== 1 || got[0] !== want) problems.push(`vercel.json: ${e.pdf} names canonical ${got.join(', ') || 'none'}, not ${want}`);
  }
  for (const h of pdfRules) if (!EDITIONS.some((x) => x.pdf === h.source)) problems.push(`vercel.json: a header rule for ${h.source}, which no edition prints`);
  const catchAll = vercel.headers.filter((h) => !/^\/pdf\//.test(h.source) && canonOf(h).length);
  for (const h of catchAll) problems.push(`vercel.json: ${h.source} sets a canonical Link; only a PDF's rule may`);
  if (problems.length) {
    console.error('check-contents: ' + problems.length + ' problem(s)');
    for (const p of problems) console.error('  ' + p);
    process.exit(1);
  }
  console.log(`check-contents: ${checked} entries verified against the built pages; ${PUBLISHED.length + 1} descriptions within ${DESC.min} to ${DESC.max} characters; ${packaged} editions' dek, seoTitle and description in their lengths; ${pdfs} PDFs' canonical headers match the list`);
})();
