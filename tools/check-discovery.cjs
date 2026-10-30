#!/usr/bin/env node
/**
 * The discovery gate (30 Oct 2026): what a search engine reads off the built
 * pages, checked on dist/ after every other checker, so a page that ships
 * says one thing about itself everywhere.
 *
 * For every page in the sitemap, and every draft (which must carry noindex
 * and be absent from the sitemap):
 *   - canonical, og:url and every JSON-LD url naming the page are the
 *     origin plus its path, with no trailing slash (the root is the origin
 *     and "/");
 *   - exactly one <h1>;
 *   - every JSON-LD block parses; a NewsArticle carries headline, url,
 *     author, publisher, image, and datePublished and dateModified with an
 *     offset, and its headline is the h1's own text;
 *   - for a published edition, the <title> before " · Aedificare" is its
 *     seoTitle, the edition's title (the part before its colon) stands in
 *     the h1, and its description runs 140 to 160 characters; the home's
 *     description too.
 * And the sitemaps: every <loc> has no trailing slash and is a built page,
 * the index lists the news sitemap, and the news sitemap names only
 * published editions. Every address of this origin printed in the feed,
 * llms.txt, index.json and the pages' links carries no trailing slash.
 *
 *   node tools/check-discovery.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

const DIST = 'dist';
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const textOf = (html) => norm(decode(html.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')));
const meta = (html, attr, name) => {
  const m = html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`));
  return m ? decode(m[1]) : null;
};
const OFFSET = /T\d{2}:\d{2}(:\d{2}(\.\d+)?)?([+-]\d{2}:\d{2}|Z)$/;

(async () => {
  const { EDITIONS, PUBLISHED, pageTitle, headline } = await import('../src/lib/editions.mjs');
  const { SITE } = await import('../src/config.mjs');
  const O = SITE.origin;
  const problems = [];
  const fail = (where, what) => problems.push(`${where}: ${what}`);
  const fileOf = (p) => path.join(DIST, p === '/' ? 'index.html' : `${p.replace(/^\//, '')}/index.html`);
  const urlOfPath = (p) => (p === '/' ? `${O}/` : O + p);
  const pathOfUrl = (u) => {
    const x = new URL(u);
    return x.origin === new URL(O).origin ? x.pathname : null;
  };

  // ---- sitemaps
  const index = fs.readFileSync(path.join(DIST, 'sitemap-index.xml'), 'utf8');
  const maps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!maps.includes(`${O}/sitemap-news.xml`)) fail('sitemap-index.xml', 'does not list /sitemap-news.xml');
  const locs = [];
  for (const m of maps) {
    const p = pathOfUrl(m);
    if (!p) { fail('sitemap-index.xml', `lists ${m}, off this origin`); continue; }
    const f = path.join(DIST, p);
    if (!fs.existsSync(f)) { fail('sitemap-index.xml', `lists ${m}, which is not built`); continue; }
    if (p === '/sitemap-news.xml') continue;
    for (const l of fs.readFileSync(f, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) locs.push(l[1]);
  }
  const sitemapPaths = new Set();
  for (const l of locs) {
    const p = pathOfUrl(l);
    if (!p) { fail('sitemap', `${l} is off this origin`); continue; }
    if (p !== '/' && p.endsWith('/')) fail('sitemap', `${l} ends in a slash`);
    if (!fs.existsSync(fileOf(p.replace(/\/$/, '') || '/'))) fail('sitemap', `${l} is not a built page`);
    sitemapPaths.add(p.replace(/\/$/, '') || '/');
  }
  const news = fs.readFileSync(path.join(DIST, 'sitemap-news.xml'), 'utf8');
  if (!/<urlset[^>]*xmlns:news="http:\/\/www\.google\.com\/schemas\/sitemap-news\/0\.9"/.test(news)) fail('sitemap-news.xml', 'is not a news urlset');
  for (const m of news.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '';
    const e = PUBLISHED.find((x) => urlOfPath(x.path) === loc);
    if (!e) { fail('sitemap-news.xml', `${loc} is not a published edition`); continue; }
    const d = m[1].match(/<news:publication_date>([^<]+)</)?.[1] ?? '';
    if (!OFFSET.test(d)) fail('sitemap-news.xml', `${loc} publication_date "${d}" carries no offset`);
    const t = decode(m[1].match(/<news:title>([^<]+)</)?.[1] ?? '');
    if (t !== pageTitle(e)) fail('sitemap-news.xml', `${loc} title "${t}" is not its seoTitle`);
  }

  // ---- pages: the sitemap's, and the drafts
  const drafts = EDITIONS.filter((e) => e.draft);
  for (const d of drafts) if (sitemapPaths.has(d.path)) fail(d.path, 'is a draft and is in the sitemap');
  const pages = [...new Set([...sitemapPaths, ...drafts.map((d) => d.path)])];
  let n = 0;
  for (const p of pages) {
    const f = fileOf(p);
    if (!fs.existsSync(f)) { fail(p, `${f} is missing`); continue; }
    n++;
    const html = fs.readFileSync(f, 'utf8');
    const want = urlOfPath(p);
    const e = EDITIONS.find((x) => x.path === p);
    const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? null;
    const ogUrl = meta(html, 'property', 'og:url');
    if (canonical !== want) fail(p, `canonical is ${canonical}, not ${want}`);
    if (ogUrl !== want) fail(p, `og:url is ${ogUrl}, not ${want}`);
    const robots = meta(html, 'name', 'robots') || '';
    if (e?.draft && !/noindex/.test(robots)) fail(p, 'is a draft without noindex');
    if (!e?.draft && /noindex/.test(robots)) fail(p, 'is in the sitemap and carries noindex');

    const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
    if (h1s.length !== 1) fail(p, `${h1s.length} <h1> elements, not one`);
    const h1 = h1s[0] ? textOf(h1s[0][1]) : '';

    // JSON-LD
    const nodes = [];
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try {
        const j = JSON.parse(m[1]);
        for (const x of (j['@graph'] || [j])) nodes.push(x);
      } catch (err) { fail(p, `a JSON-LD block does not parse: ${err.message}`); }
    }
    const visit = (v, key) => {
      if (Array.isArray(v)) return v.forEach((x) => visit(x, key));
      if (v && typeof v === 'object') return Object.entries(v).forEach(([k, x]) => visit(x, k));
      if (typeof v !== 'string' || !['url', 'item', 'mainEntityOfPage', '@id'].includes(key)) return;
      let u;
      try { u = new URL(v); } catch { return; }
      if (u.origin !== new URL(O).origin) return;
      const bare = v.split('#')[0];
      if (u.pathname !== '/' && u.pathname.endsWith('/')) fail(p, `JSON-LD ${key} ${v} ends in a slash`);
      const names = (u.pathname.replace(/\/$/, '') || '/') === p;
      if (names && key !== '@id' && bare !== want && !(p === '/' && u.href === want)) fail(p, `JSON-LD ${key} is ${v}, not ${want}`);
    };
    nodes.forEach((x) => visit(x));
    const articles = nodes.filter((x) => x['@type'] === 'NewsArticle');
    if (e && articles.length !== 1) fail(p, `${articles.length} NewsArticle nodes, not one`);
    for (const a of articles) {
      for (const k of ['headline', 'datePublished', 'dateModified', 'author', 'publisher', 'image', 'url'])
        if (a[k] == null || (Array.isArray(a[k]) && !a[k].length)) fail(p, `NewsArticle has no ${k}`);
      for (const k of ['datePublished', 'dateModified']) if (a[k] && !OFFSET.test(a[k])) fail(p, `NewsArticle ${k} "${a[k]}" carries no offset`);
      if (a.url !== want || a.mainEntityOfPage !== want) fail(p, `NewsArticle url ${a.url} or mainEntityOfPage ${a.mainEntityOfPage} is not ${want}`);
      if (a.headline && norm(a.headline) !== h1) fail(p, `NewsArticle headline "${a.headline}" is not the h1's text "${h1}"`);
      if (e && a.headline !== headline(e)) fail(p, `NewsArticle headline is not the edition's title and dek`);
    }

    if (e && !e.draft) {
      const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
      const base = title.replace(/ · Aedificare$/, '');
      if (base === title) fail(p, `<title> "${title}" does not end " · Aedificare"`);
      if (base !== pageTitle(e)) fail(p, `<title> "${base}" is not its seoTitle "${pageTitle(e)}"`);
      const lead = base.split(':')[0];
      if (!h1.includes(lead)) fail(p, `the title's "${lead}" is not in the h1 "${h1}"`);
      if (e.dek && !h1.includes(e.dek)) fail(p, `the dek is not in the h1 "${h1}"`);
      const desc = meta(html, 'name', 'description') || '';
      if (desc.length < 140 || desc.length > 160) fail(p, `description runs ${desc.length} characters, not 140 to 160`);
      for (const [a, k] of [['property', 'og:title'], ['name', 'twitter:title']]) if (meta(html, a, k) !== pageTitle(e)) fail(p, `${k} is not its seoTitle`);
      for (const [a, k] of [['property', 'og:description'], ['name', 'twitter:description']]) if (meta(html, a, k) !== desc) fail(p, `${k} is not its description`);
    }
    if (p === '/') {
      const desc = meta(html, 'name', 'description') || '';
      if (desc.length < 140 || desc.length > 160) fail(p, `description runs ${desc.length} characters, not 140 to 160`);
    }
    // Links: a path of this site never ends in a slash.
    for (const m of html.matchAll(/href="([^"]+)"/g)) {
      const h = decode(m[1]);
      if (!(h.startsWith('/') || h.startsWith(O)) || h.startsWith('//')) continue;
      const u = new URL(h, O);
      if (u.pathname !== '/' && u.pathname.endsWith('/')) fail(p, `links ${h}, which ends in a slash`);
    }
  }

  // ---- the files machines read
  const host = O.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const f of ['feed.xml', 'llms.txt', 'index.json', 'robots.txt', 'sitemap-index.xml', ...fs.readdirSync(DIST).filter((x) => /^sitemap-\d+\.xml$/.test(x))]) {
    const s = fs.readFileSync(path.join(DIST, f), 'utf8');
    for (const m of s.matchAll(new RegExp(`${host}(/[^\\s"'<>)\\]]*)`, 'g'))) {
      if (m[1] !== '/' && m[1].endsWith('/')) fail(f, `prints ${O}${m[1]}, which ends in a slash`);
    }
  }
  if (!/^Sitemap: https:\/\/aedificare\.art\/sitemap-index\.xml$/m.test(fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8')) && O === 'https://aedificare.art')
    fail('robots.txt', 'has no Sitemap line for the apex');

  if (problems.length) {
    console.error(`check-discovery: ${problems.length} problem(s)`);
    for (const x of problems) console.error('  ' + x);
    process.exit(1);
  }
  console.log(`check-discovery: ${n} pages (${sitemapPaths.size} in the sitemap, ${drafts.length} drafts out of it) carry one URL, one h1 and a whole graph; the sitemaps and the files machines read print no trailing slash`);
})();
