#!/usr/bin/env node
/**
 * The discovery gate (30 Oct 2026): what a search engine reads off the built
 * pages, checked on dist/ after every other checker, so a page that ships
 * says one thing about itself everywhere.
 *
 * For the home, every published edition and every draft, read from the
 * editions list and never from the sitemap (so a page the sitemap drops is
 * still checked, and its absence fails), where every published page must be
 * in the sitemap and every draft must carry noindex and be absent from it:
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
 * published editions.
 *
 * Since part B (30 Oct 2026): the watch pages (/<slug>/film) and /about,
 * /standards and /amendments are pages like the rest, in the sitemap. Every
 * edition carries its byline, whose date is its datePublished; a published
 * one's NewsArticle opens its image list with its lead figure's three frames
 * (src/lib/lead.mjs; none where NO_FIGURE says the page has no figure that is
 * not text), ends with the type card, and refers to its film's
 * VideoObject by @id alone. A watch page carries one VideoObject with every
 * field Google reads, a Clip per chapter whose url is the page at its second,
 * and exactly one iframe in the server's HTML, the embed URL, no autoplay;
 * no other page ships an iframe. The video sitemap lists every watch page
 * with the same values. Every page's footer links the three pages about the
 * method, and every Person node is the one on /about. Every address of this origin printed in the feed,
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
  const { SITE, PRODUCTION_ORIGIN } = await import('../src/config.mjs');
  const { films } = await import('../src/lib/films.mjs');
  const { transcript } = await import('../src/lib/transcripts.mjs');
  const { lead, NO_FIGURE } = await import('../src/lib/lead.mjs');
  const { PERSON_ID, watchPath } = await import('../src/lib/schema.mjs');
  const FILMS = films();
  // The watch pages (/<slug>/film) and the three pages about the method, read from the lists, never from the sitemap.
  const WATCH = new Map(FILMS.map((f) => [watchPath(EDITIONS.find((e) => e.slug === f.slug)), f]));
  const METHOD = ['/about', '/standards', '/amendments'];
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
  if (!maps.includes(`${O}/sitemap-video.xml`)) fail('sitemap-index.xml', 'does not list /sitemap-video.xml');
  const pagesMap = maps.filter((m) => /\/sitemap-\d+\.xml$/.test(m));
  if (!pagesMap.length) fail('sitemap-index.xml', 'lists no pages sitemap (sitemap-0.xml)');
  const locs = [];
  for (const m of maps) {
    const p = pathOfUrl(m);
    if (!p) { fail('sitemap-index.xml', `lists ${m}, off this origin`); continue; }
    const f = path.join(DIST, p);
    if (!fs.existsSync(f)) { fail('sitemap-index.xml', `lists ${m}, which is not built`); continue; }
    if (p === '/sitemap-news.xml' || p === '/sitemap-video.xml') continue;
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

  // The video sitemap: one entry per linked film, on its watch page, carrying what its VideoObject carries.
  const video = fs.readFileSync(path.join(DIST, 'sitemap-video.xml'), 'utf8');
  if (!/<urlset[^>]*xmlns:video="http:\/\/www\.google\.com\/schemas\/sitemap-video\/1\.1"/.test(video)) fail('sitemap-video.xml', 'is not a video urlset');
  const listed = new Set();
  for (const m of video.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1] ?? '';
    const p = pathOfUrl(loc);
    const f = p && WATCH.get(p);
    if (!f) { fail('sitemap-video.xml', `${loc} is not a watch page`); continue; }
    listed.add(p);
    const tag = (t) => decode(m[1].match(new RegExp(`<video:${t}>([^<]*)</video:${t}>`))?.[1] ?? '');
    if (tag('player_loc') !== f.embed) fail('sitemap-video.xml', `${loc} player_loc is not ${f.embed}`);
    if (tag('duration') !== String(f.duration)) fail('sitemap-video.xml', `${loc} duration ${tag('duration')} is not ${f.duration}`);
    if (!OFFSET.test(tag('publication_date'))) fail('sitemap-video.xml', `${loc} publication_date carries no offset`);
    const thumb = tag('thumbnail_loc').startsWith(O) ? new URL(tag('thumbnail_loc')).pathname : null;
    if (!thumb || !fs.existsSync(path.join(DIST, thumb))) fail('sitemap-video.xml', `${loc} thumbnail_loc ${tag('thumbnail_loc')} is not a built file`);
    for (const t of ['title', 'description']) if (!tag(t).trim()) fail('sitemap-video.xml', `${loc} has no ${t}`);
  }
  for (const p of WATCH.keys()) if (!listed.has(p)) fail('sitemap-video.xml', `does not list the watch page ${p}`);

  // ---- /404 is in no sitemap and carries no canonical, but its footer links the method pages as every page's does.
  {
    const f = path.join(DIST, '404.html');
    if (!fs.existsSync(f)) fail('/404', `${f} is missing`);
    else for (const m of METHOD) if (!fs.readFileSync(f, 'utf8').includes(`href="${m}"`)) fail('/404', `does not link ${m}`);
  }

  // ---- pages: the home, the published editions and the drafts, from the list, never from the sitemap
  const drafts = EDITIONS.filter((e) => e.draft);
  const published = ['/', ...PUBLISHED.map((e) => e.path), ...WATCH.keys(), ...METHOD];
  for (const d of drafts) if (sitemapPaths.has(d.path)) fail(d.path, 'is a draft and is in the sitemap');
  for (const p of published) if (!sitemapPaths.has(p)) fail(p, 'is published and is not in the sitemap');
  const pages = [...new Set([...published, ...drafts.map((d) => d.path)])];
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
    if (!e?.draft && /noindex/.test(robots)) fail(p, 'is published and carries noindex');

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
      // A Clip's url is the watch page at its second, ?t=N, and nothing else may carry a query.
      const bare = v.split('#')[0].replace(/\?t=\d+$/, '');
      if (u.search && !(WATCH.has(p) && /^\?t=\d+$/.test(u.search))) fail(p, `JSON-LD ${key} ${v} carries a query`);
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
      // The lead image first (a figure, src/lib/lead.mjs), the type card last; a draft, and an edition whose page has
      // no figure that is not text (NO_FIGURE), has the card alone.
      if (e && !e.draft) {
        const l = lead(e.slug);
        const frames = l ? l.frames.map((x) => O + x.src) : [];
        if (!l && !NO_FIGURE[e.slug]) fail(p, 'has no lead image and NO_FIGURE gives no reason');
        if (JSON.stringify((a.image || []).slice(0, frames.length)) !== JSON.stringify(frames)) fail(p, `NewsArticle image does not open with the lead image's three frames ${frames.join(', ')}`);
        if ((a.image || []).length !== frames.length + 1) fail(p, `NewsArticle image lists ${(a.image || []).length} pictures, not ${frames.length ? 'the lead image\'s three frames and' : ''} the card`);
        if (!/\/og\/[^/]+\.[0-9a-f]{8}\.png$/.test(a.image?.[frames.length] ?? '')) fail(p, 'NewsArticle image does not end with the type card');
        const f = FILMS.find((x) => x.slug === e.slug);
        const ref = f ? `${O}${watchPath(e)}#video` : undefined;
        if (a.video?.['@id'] !== ref || (a.video && Object.keys(a.video).length !== 1)) fail(p, `NewsArticle video is ${JSON.stringify(a.video)}, not ${ref ? `a reference to ${ref}` : 'absent'}`);
      }
      for (const u of a.image || []) if (!u.startsWith(O) || !fs.existsSync(path.join(DIST, new URL(u).pathname))) fail(p, `NewsArticle image ${u} is not a built file of this origin`);
      // The byline's first date is the article's datePublished.
      const by = html.match(/<span class="byline">By <a href="\/about"[^>]*>([^<]+)<\/a> · <time datetime="([^"]+)"/);
      if (!by) fail(p, 'carries no byline (By <name>, linked to /about, then the date)');
      else {
        if (decode(by[1]) !== SITE.author) fail(p, `the byline names ${by[1]}, not ${SITE.author}`);
        if (by[2] !== String(a.datePublished).slice(0, 10)) fail(p, `the byline's date ${by[2]} is not datePublished's ${String(a.datePublished).slice(0, 10)}`);
      }
      if (a.author?.['@id'] !== PERSON_ID) fail(p, `NewsArticle author is not ${PERSON_ID}`);
    }
    // A watch page: its VideoObject whole, its Clips on this page, and the player in the server's HTML.
    const wf = WATCH.get(p);
    if (wf) {
      const e = EDITIONS.find((x) => x.slug === wf.slug);
      const t = transcript(wf.slug);
      if (!h1.startsWith(`${e.title}: the film`)) fail(p, `the h1 "${h1}" does not open "${e.title}: the film"`);
      const videos = nodes.filter((x) => x['@type'] === 'VideoObject');
      if (videos.length !== 1) fail(p, `${videos.length} VideoObject nodes, not one`);
      for (const v of videos) {
        if (v['@id'] !== `${want}#video`) fail(p, `VideoObject @id is ${v['@id']}, not ${want}#video`);
        for (const k of ['name', 'description', 'thumbnailUrl', 'uploadDate', 'duration', 'embedUrl', 'publisher', 'creator', 'transcript', 'hasPart'])
          if (v[k] == null || (Array.isArray(v[k]) && !v[k].length) || v[k] === '') fail(p, `VideoObject has no ${k}`);
        if (v.embedUrl !== wf.embed) fail(p, `VideoObject embedUrl is ${v.embedUrl}, not ${wf.embed}`);
        if (v.duration !== wf.iso) fail(p, `VideoObject duration ${v.duration} is not the measured ${wf.iso}`);
        if (!OFFSET.test(v.uploadDate || '')) fail(p, `VideoObject uploadDate "${v.uploadDate}" carries no offset`);
        if (v.creator?.['@id'] !== PERSON_ID) fail(p, `VideoObject creator is not ${PERSON_ID}`);
        for (const u of [].concat(v.thumbnailUrl || [])) if (!u.startsWith(O) || !fs.existsSync(path.join(DIST, new URL(u).pathname))) fail(p, `VideoObject thumbnailUrl ${u} is not a built file of this origin`);
        const clips = v.hasPart || [];
        if (clips.length !== t.chapters.length) fail(p, `${clips.length} Clips, and the film has ${t.chapters.length} chapters`);
        clips.forEach((c, i) => {
          if (c['@type'] !== 'Clip' || !c.name) fail(p, `hasPart ${i + 1} is not a named Clip`);
          if (!(Number.isInteger(c.startOffset) && Number.isInteger(c.endOffset) && c.startOffset < c.endOffset && c.endOffset <= wf.duration)) fail(p, `Clip "${c.name}" runs ${c.startOffset} to ${c.endOffset}, not inside the film`);
          if (c.url !== `${want}?t=${c.startOffset}`) fail(p, `Clip "${c.name}" url ${c.url} is not ${want}?t=${c.startOffset}`);
          if (i && c.startOffset !== clips[i - 1].endOffset) fail(p, `Clip "${c.name}" does not start where the one before it ends`);
        });
      }
      const frames = [...html.matchAll(/<iframe\b([^>]*)>/gi)];
      if (frames.length !== 1) fail(p, `${frames.length} iframes in the server's HTML, not the one player`);
      for (const [, attrs] of frames) {
        const at = (n) => decode(attrs.match(new RegExp(`\\s${n}="([^"]*)"`))?.[1] ?? '');
        if (at('src') !== wf.embed) fail(p, `the iframe loads ${at('src')}, not ${wf.embed}`);
        if (/autoplay/i.test(attrs)) fail(p, 'the iframe may autoplay; the reader presses play');
        if (at('loading') !== 'eager' || !at('title') || !at('width') || !at('height')) fail(p, 'the iframe lacks loading="eager", a title, a width or a height');
      }
      // Every chapter link on the page is this page at a chapter's second.
      const starts = new Set(t.chapters.map((c) => c.t));
      for (const m of html.matchAll(/href="([^"]*\?t=[^"]*)"/g)) {
        const u = new URL(decode(m[1]), O);
        if (u.pathname !== p || !/^\?t=\d+$/.test(u.search) || !starts.has(+u.search.slice(3))) fail(p, `links ${m[1]}, which is not this page at a chapter's start`);
      }
    } else if (/<iframe\b/i.test(html)) fail(p, 'ships an iframe; only a watch page loads a player as it opens');
    if (METHOD.includes(p)) {
      const kind = p === '/about' ? 'ProfilePage' : 'WebPage';
      const pg = nodes.filter((x) => x['@type'] === kind);
      if (pg.length !== 1 || pg[0].url !== want) fail(p, `no ${kind} node for ${want}`);
      if (p === '/about' && pg[0]?.mainEntity?.['@id'] !== PERSON_ID) fail(p, `the ProfilePage's mainEntity is not ${PERSON_ID}`);
      const desc = meta(html, 'name', 'description') || '';
      if (desc.length < 140 || desc.length > 160) fail(p, `description runs ${desc.length} characters, not 140 to 160 (the owner's copy: report it rather than rewrite it)`);
    }
    // The Person every page names is the one on /about.
    for (const x of nodes.filter((n) => n['@type'] === 'Person' && n['@id'])) if (x['@id'] !== PERSON_ID || x.url !== `${O}/about`) fail(p, `a Person node is ${x['@id']} at ${x.url}, not ${PERSON_ID} at ${O}/about`);
    // Every page's footer links the three pages about the method.
    for (const m of METHOD) if (!html.includes(`href="${m}"`)) fail(p, `does not link ${m}`);

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
  if (O === PRODUCTION_ORIGIN && !fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8').split('\n').includes(`Sitemap: ${O}/sitemap-index.xml`))
    fail('robots.txt', `has no Sitemap line for ${O}/sitemap-index.xml`);

  if (problems.length) {
    console.error(`check-discovery: ${problems.length} problem(s)`);
    for (const x of problems) console.error('  ' + x);
    process.exit(1);
  }
  console.log(`check-discovery: ${n} pages (the home, ${PUBLISHED.length} published editions, ${WATCH.size} watch pages and ${METHOD.length} pages on the method, all in the sitemap; ${drafts.length} drafts out of it) carry one URL, one h1 and a whole graph; every edition its byline, every published one with a figure that is not text its lead figure first; every watch page its VideoObject, its Clips and its one player; the sitemaps, the video sitemap and the files machines read print no trailing slash`);
})();
