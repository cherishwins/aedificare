#!/usr/bin/env node
/**
 * The pre-push sweep, committed. Ported from cherishwins/teamcanada.
 *
 * Serves dist/ through Playwright request interception, so it exercises the
 * bytes Vercel will publish and needs no network. Every page across ten
 * viewports (320 to 2560) for horizontal overflow, text cut off the screen,
 * console errors, tap targets, broken references and any request that leaves
 * the origin; once at 1280 for WCAG AA contrast against
 * the nearest opaque ancestor, a full axe-core pass, og:image:alt, that the
 * brand faces actually loaded, that Acid appears at scale at most once per
 * surface and never in a film's thumbnail, and that every rose field runs
 * live; then once under
 * prefers-reduced-motion to prove the still exists. Exits non-zero.
 *
 *   node tools/verify.cjs [dist]                 sweep the local build
 *   node tools/verify.cjs --url https://host     sweep a LIVE origin instead
 *
 * The --url mode exists because a deploy status is not a verification. It
 * loads the real pages over the real network, counts every same-origin
 * response that is not 2xx/3xx as a broken reference, and runs the same
 * probes; only the file-level checks (sw.js on disk) are skipped, since the
 * render probe covers the live equivalent.
 */
const path = require('path');
const fs = require('fs');

/**
 * Playwright is deliberately NOT in package.json. Vercel installs
 * devDependencies to build, and a browser-automation library has no place in
 * the install path of a static site. CI installs it with --no-save; the
 * sandbox has it globally. Resolve whichever is present.
 */
function loadChromium() {
  for (const m of ['playwright', '@playwright/test', '/opt/node22/lib/node_modules/playwright']) {
    try { return require(m).chromium; } catch { /* next */ }
  }
  console.error('verify: playwright not found. Run `npm i --no-save playwright`');
  process.exit(1);
}
const chromium = loadChromium();
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const argv = process.argv.slice(2);
const URL_IDX = argv.indexOf('--url');
const LIVE = URL_IDX >= 0 ? argv[URL_IDX + 1].replace(/\/$/, '') : null;
const ROOT = (URL_IDX >= 0 ? argv.filter((_, i) => i !== URL_IDX && i !== URL_IDX + 1)[0] : argv[0]) || 'dist';
const ORIGIN = LIVE || 'https://local.test';
// The pages are read from the editions list, drafts included, never typed: a typed list missed The Tilt
// Gap from 3 Oct to 6 Oct 2026, so every sweep in that window passed without opening it.
let PAGES = [];
const loadPages = async () => {
  const { EDITIONS } = await import(require('node:url').pathToFileURL(path.join(__dirname, '../src/lib/editions.mjs')).href);
  PAGES = ['/', ...EDITIONS.map((e) => e.path), '/404.html'];
};
const VIEWPORTS = [320, 360, 390, 414, 600, 768, 1024, 1280, 1920, 2560];

const MIME = { html: 'text/html', css: 'text/css', js: 'text/javascript', png: 'image/png', svg: 'image/svg+xml',
  woff2: 'font/woff2', json: 'application/json', webmanifest: 'application/manifest+json', xml: 'application/xml',
  txt: 'text/plain', pdf: 'application/pdf' };

/**
 * Local mode: other origins answer 204 (the page must not depend on any) and
 * anything that 404s is a broken reference. Live mode: nothing is stubbed;
 * every same-origin response outside 2xx/3xx, and every failed request, is
 * a broken reference. In both, a request to any other host is counted: a page
 * here asks nobody else for anything (no embed, no font service, no
 * analytics; CLAUDE.md, Decisions log, 21 Oct 2026), and until then a
 * third-party request was answered 204 and never seen.
 */
function serve(page, onBroken, onOffOrigin = () => {}) {
  if (LIVE) {
    const host = new URL(LIVE).host;
    page.on('request', (r) => { const u = new URL(r.url()); if (/^https?:$/.test(u.protocol) && u.host !== host) onOffOrigin(u.href); });
    page.on('response', (r) => { const u = new URL(r.url()); if (u.host === host && (r.status() < 200 || r.status() >= 400) && u.pathname !== '/404.html') onBroken(`${u.pathname} (${r.status()})`); });
    page.on('requestfailed', (r) => { const u = new URL(r.url()); if (u.host === host) onBroken(`${u.pathname} (${r.failure()?.errorText})`); });
    return Promise.resolve();
  }
  return page.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.host !== 'local.test') { onOffOrigin(u.href); return route.fulfill({ status: 204, body: '' }); }
    let f = path.join(ROOT, decodeURIComponent(u.pathname));
    if (f.endsWith('/')) f += 'index.html';
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f) && fs.existsSync(f + '/index.html')) f += '/index.html';
    if (fs.existsSync(f) && fs.statSync(f).isFile()) {
      return route.fulfill({ status: 200, contentType: MIME[path.extname(f).slice(1)] || 'application/octet-stream', body: fs.readFileSync(f) });
    }
    onBroken(u.pathname);
    return route.fulfill({ status: 404, body: 'not found' });
  });
}

/** Relative-luminance contrast against the nearest opaque ancestor's background. */
const CONTRAST_PROBE = () => {
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const parse = (s) => { const m = s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/); return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null; };
  const bgOf = (el) => { let n = el; while (n && n !== document.documentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c[3] > 0.9) return c; n = n.parentElement; } return parse(getComputedStyle(document.documentElement).backgroundColor) || [0, 0, 0, 1]; };
  const out = [];
  for (const el of document.querySelectorAll('p,span,div,li,h1,h2,h3,h4,a,strong,b,dt,dd,td,th,label,button,figcaption,summary,cite,q,caption,output')) {
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.5) continue;
    if (el.classList.contains('sr')) continue;
    const fg = parse(cs.color); if (!fg) continue;
    const bg = bgOf(el);
    const a = L(...fg.slice(0, 3)), b = L(...bg.slice(0, 3));
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const px = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
    const large = px >= 24 || (px >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (ratio < need - 0.01) out.push({ ratio: +ratio.toFixed(2), need, px: +px.toFixed(1), text: el.textContent.trim().slice(0, 52) });
  }
  return out;
};

/**
 * Text cut off the screen. The body clips horizontal overflow, which keeps
 * scrollWidth at the viewport width, so the overflow count above cannot see a
 * line that runs past the edge: it is simply hidden. Found 2026-10-17, when a
 * source entry with an unbreakable URL was clipped on every phone on two
 * pages and the sweep read clean. This measures every visible run of text
 * against the viewport. Text inside a scroll region is reachable and is not
 * counted; decoration is aria-hidden; a deliberate bleed says so with
 * data-bleed (the home wordmark).
 */
const CLIP_PROBE = () => {
  const W = document.documentElement.clientWidth;
  const out = [];
  const scrolls = (el) => {
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const ox = getComputedStyle(e).overflowX;
      if (ox === 'auto' || ox === 'scroll') return true;
    }
    return false;
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const range = document.createRange();
  for (let n; (n = walker.nextNode());) {
    const el = n.parentElement;
    if (!el || el.closest('.sr, [aria-hidden="true"], [data-bleed], script, style, noscript, template')) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      if (!r.width || (r.right <= W + 1 && r.left >= -1)) continue;
      if (!scrolls(el)) out.push({ text: n.textContent.trim().slice(0, 40), left: Math.round(r.left), right: Math.round(r.right) });
      break;
    }
  }
  return out;
};

/** Anything interactive that is not inline in a run of text must reach 24px. */
const TAP_PROBE = () => {
  const out = [];
  for (const el of document.querySelectorAll('a,button,input,select,summary,[role="button"],[tabindex="0"]')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (cs.display === 'inline' && el.closest('p,li,dd,figcaption')) continue;
    if (r.width < 24 || r.height < 24) out.push({ text: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 34), w: Math.round(r.width), h: Math.round(r.height) });
  }
  return out;
};

/**
 * Acid appears once per surface, at scale. "At scale" is text at 24px or
 * larger, or an SVG stroke whose box is 200px or larger. Hairlines and 11px
 * mono labels do not count; a headline, a beat, a figure or a rose does.
 * An image counts by its pixels (a film's thumbnail sets its word or figure
 * in Acid): drawn at the size it is shown, its tallest unbroken band of Acid
 * ink must stay under a capital of 24px type in the brand face, or it is a
 * loud move like any other. A lazy image is loaded first, so the one below
 * the fold is measured too. A film's thumbnail (an image in a .film link)
 * is never to be a loud move at all (CLAUDE.md, Decisions log, 21 Oct 2026),
 * so one at scale fails on its own, whatever else its surface spends.
 */
const ACID_PROBE = async () => {
  const ACID = 'rgb(204, 255, 0)';
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  ctx.font = "800 24px 'Bricolage Grotesque'";
  const CAP = ctx.measureText('H').actualBoundingBoxAscent;
  const acidInk = async (img) => {
    if (!img.complete || !img.naturalWidth) { img.loading = 'eager'; try { await img.decode(); } catch { return 0; } }
    const w = img.clientWidth, h = img.clientHeight;
    if (!w || !h) return 0;
    ctx.canvas.width = w; ctx.canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data;
    let run = 0, tallest = 0;
    for (let y = 0; y < h; y++) {
      let lit = false;
      for (let x = 0; x < w && !lit; x++) { const i = (y * w + x) * 4; lit = d[i] > 150 && d[i + 1] > 200 && d[i + 2] < 100; }
      run = lit ? run + 1 : 0;
      tallest = Math.max(tallest, run);
    }
    return tallest;
  };
  const out = [];
  for (const [i, s] of [...document.querySelectorAll('.surface')].entries()) {
    const hits = [];
    const label = () => s.getAttribute('aria-label') || s.getAttribute('aria-labelledby') || `#${i + 1}`;
    for (const img of s.querySelectorAll('img')) {
      if (img.closest('.surface') !== s) continue;
      const ink = await acidInk(img);
      if (ink < CAP) continue;
      hits.push(`[image ${img.getAttribute('src')}]`);
      if (img.closest('.film, .player')) out.push({ surface: label(), hits: [`[film thumbnail ${img.getAttribute('src')}: ${ink}px of Acid ink, at or over the ${CAP.toFixed(1)}px capital]`], film: true });
    }
    for (const el of s.querySelectorAll('*')) {
      if (el.closest('.surface') !== s) continue;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (own && cs.color === ACID && parseFloat(cs.fontSize) >= 24) hits.push(el.textContent.trim().slice(0, 30));
      // The film's poster is quiet: the cover above it is the loud move (CLAUDE.md, Decisions log, 26 Oct 2026).
      if (el.closest('.player') && ((own && cs.color === ACID && parseFloat(cs.fontSize) >= 24) || el.getAttribute('stroke') === '#CCFF00'))
        out.push({ surface: label(), hits: [`[film poster: Acid at scale in ${el.tagName.toLowerCase()}]`], film: true });
      if (el instanceof SVGElement && el.getAttribute('stroke') === '#CCFF00' && Math.max(r.width, r.height) >= 200) {
        const svg = el.closest('svg');
        if (!hits.includes('[rose]')) hits.push(svg?.dataset.dove !== undefined ? '[dove]' : '[rose]');
      }
    }
    if (hits.length > 1) out.push({ surface: label(), hits });
  }
  return out;
};

/**
 * The film plays on its page, and only once its reader asks (CLAUDE.md, Decisions log, 26 Oct 2026).
 * Before the click: one player, no iframe, a button named by the film's record, at least YouTube's 200 by
 * 200, and (counted by the sweep itself) no request off the origin. The click, Space or Enter: one iframe
 * whose src is exactly the data-embed URL on YouTube's privacy-enhanced host, a title naming the film,
 * autoplay and full screen allowed, a referrer YouTube can read, focus moved into it, nothing left in
 * front of it, and the first request off the origin is that URL. Returns the page's problems.
 */
const EMBED = /^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}\?autoplay=1&playsinline=1&rel=0&color=white$/;
async function filmProbe(page, how, off) {
  const out = [];
  const st = await page.evaluate(() => {
    const boxes = document.querySelectorAll('[data-embed]'), box = boxes[0];
    if (!box) return null;
    const r = box.getBoundingClientRect(), btn = box.querySelector(':scope > button');
    return { n: boxes.length, w: r.width, h: r.height, embed: box.dataset.embed, name: btn ? btn.textContent.replace(/\s+/g, ' ').trim() : null, iframes: document.querySelectorAll('iframe').length };
  });
  if (!st) return null;
  if (st.n > 1) out.push(`${st.n} players; an edition has one film`);
  if (st.iframes) out.push(`${st.iframes} iframe(s) before any click`);
  if (st.w < 200 || st.h < 200) out.push(`the player is ${Math.round(st.w)}x${Math.round(st.h)}, under YouTube's 200x200`);
  if (st.name === null) out.push('the poster is not a button once the script has run');
  else if (!/^Film · \d+:\d\d/.test(st.name)) out.push(`the button's name "${st.name}" does not start with the film's record`);
  if (!EMBED.test(st.embed)) out.push(`data-embed ${st.embed} is not the privacy-enhanced player URL`);
  off.length = 0;
  if (how === 'click') await page.click('[data-embed] > button');
  else { await page.focus('[data-embed] > button'); await page.keyboard.press(how); }
  await page.waitForTimeout(250);
  const f = await page.evaluate(() => {
    const box = document.querySelector('[data-embed]'), f = box.querySelector(':scope > iframe');
    return f && { src: f.src, title: f.title, allow: f.allow, fs: f.allowFullscreen, ref: f.referrerPolicy, focused: document.activeElement === f, front: box.children.length };
  });
  if (!f) { out.push(`${how} made no player`); return out; }
  if (f.src !== st.embed) out.push(`the player loaded ${f.src}, not ${st.embed}`);
  if (!f.title.includes(', film, ')) out.push(`the player's title "${f.title}" does not name the film`);
  if (!/\bautoplay\b/.test(f.allow) || !f.fs) out.push(`the player may not autoplay or fill the screen (allow="${f.allow}")`);
  if (f.ref !== 'strict-origin-when-cross-origin') out.push(`the player's referrer policy is ${f.ref}; YouTube refuses an embed it cannot identify`);
  if (!f.focused) out.push('focus did not move into the player');
  if (f.front !== 1) out.push('something is left in the box with the player, in front of it');
  if (off[0] !== st.embed) out.push(`the first request off the origin after the click was ${off[0] ?? 'none'}, not the player`);
  return out;
}

/** The brand faces loaded, the fields are live, the dove exists where declared. */
const RENDER_PROBE = () => ({
  bricolage: document.fonts.check("800 40px 'Bricolage Grotesque'"),
  martian: document.fonts.check("500 11px 'Martian Mono'"),
  roses: [...document.querySelectorAll('svg[data-rose]')].map((s) => ({ motion: s.dataset.motion, paths: s.querySelectorAll('path[d]').length })),
  doves: [...document.querySelectorAll('svg[data-dove]')].map((s) => s.querySelectorAll('path').length),
  sw: !!navigator.serviceWorker?.controller,
});

(async () => {
  await loadPages();
  if (!LIVE && !fs.existsSync(ROOT)) { console.error(`verify: no build at ${ROOT}`); process.exit(1); }
  if (LIVE) console.log(`  live sweep of ${LIVE}`);
  // No service worker, by decision (CLAUDE.md Q10). Its absence is asserted, not assumed.
  const swProblems = [], iframes = [];
  if (!LIVE) {
    if (fs.existsSync(path.join(ROOT, 'sw.js'))) swProblems.push('sw.js is in the build; the site ships no service worker');
    for (const f of fs.readdirSync(ROOT)) if (f.endsWith('.html') && /serviceWorker/.test(fs.readFileSync(path.join(ROOT, f), 'utf8'))) swProblems.push(`${f} references serviceWorker`);
    // A film's player is made by the reader's click, never shipped: no page carries an iframe.
    for (const p of PAGES) { const f = path.join(ROOT, p === '/' ? 'index.html' : p.endsWith('.html') ? p : `${p}/index.html`); if (fs.existsSync(f) && /<iframe\b/i.test(fs.readFileSync(f, 'utf8'))) iframes.push(`${p} ships an iframe; a film's player is made by the click`); }
  }
  for (const m of swProblems) console.log(`  SW        ${m}`);
  for (const m of iframes) console.log(`  FILM      ${m}`);

  const browser = await chromium.launch();
  let overflow = 0, clipped = 0, jsErrors = 0, taps = 0, contrast = 0, missing = 0, altMissing = 0, broken = 0, axeFails = 0, acid = 0, render = 0, offOrigin = 0, films = 0, filmFails = 0;
  const report = [];

  for (const width of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    let current = '';
    await serve(page, (p) => { broken++; report.push(`  BROKEN    ${width}px  ${current}  -> ${p}`); },
      (u) => { offOrigin++; report.push(`  OFF-ORIGIN ${width}px  ${current}  -> ${u}`); });
    page.on('pageerror', (e) => { jsErrors++; report.push(`  JS ERROR  ${width}px  ${current}  ${e.message}`); });
    page.on('console', (m) => {
      if (m.type() !== 'error') return;
      if (/Failed to load resource/.test(m.text())) return; // counted precisely above, by path
      jsErrors++; report.push(`  CONSOLE   ${width}px  ${current}  ${m.text()}`);
    });

    for (const p of PAGES) {
      current = p;
      const res = await page.goto(ORIGIN + p, { waitUntil: 'load' }).catch(() => null);
      // Served for real, /404.html is a file (200) and also what unmatched
      // routes answer with (404); either proves the page exists.
      const ok = res && (res.status() === 200 || (LIVE && p === '/404.html' && res.status() === 404));
      if (!ok) { missing++; report.push(`  MISSING   ${width}px  ${p}  (${res ? res.status() : 'no response'})`); continue; }
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(80);

      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 0) { overflow++; report.push(`  OVERFLOW  ${width}px  ${p}  +${over}px`); }
      for (const c of await page.evaluate(CLIP_PROBE)) { clipped++; report.push(`  CLIPPED   ${width}px  ${p}  ${c.left}..${c.right}px  "${c.text}"`); }
      for (const t of await page.evaluate(TAP_PROBE)) { taps++; report.push(`  TAP       ${width}px  ${p}  ${t.w}x${t.h}  "${t.text}"`); }

      if (width === 1280) {
        for (const c of await page.evaluate(CONTRAST_PROBE)) { contrast++; report.push(`  CONTRAST  ${p}  ${c.ratio}:1 (needs ${c.need}) ${c.px}px  "${c.text}"`); }
        for (const a of await page.evaluate(ACID_PROBE)) { acid++; report.push(`  ACID      ${p}  surface ${a.surface}: ${a.film ? 'a film thumbnail is a loud move' : `${a.hits.length} at scale`}: ${a.hits.join(' | ')}`); }
        const r = await page.evaluate(RENDER_PROBE);
        if (!r.bricolage || !r.martian) { render++; report.push(`  FONTS     ${p}  bricolage=${r.bricolage} martian=${r.martian}`); }
        for (const rose of r.roses) if (rose.motion !== 'live' || rose.paths < 1) { render++; report.push(`  ROSE      ${p}  motion=${rose.motion} paths=${rose.paths}`); }
        for (const n of r.doves) if (n < 100) { render++; report.push(`  DOVE      ${p}  only ${n} roses in the figure`); }
        if (r.sw) { swProblems.push(`${p} is controlled by a service worker`); }

        await page.addScriptTag({ content: AXE });
        const violations = await page.evaluate(async () =>
          (await axe.run(document, { resultTypes: ['violations'] })).violations
            .map((v) => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, sample: v.nodes[0]?.html.slice(0, 110) })));
        for (const v of violations) { axeFails++; report.push(`  AXE       ${p}  [${v.impact}] ${v.id} × ${v.n}: ${v.help}\n              ${v.sample}`); }

        const alt = await page.evaluate(() => {
          const g = (s) => document.querySelector(s)?.getAttribute('content') || '';
          return { alt: g('meta[property="og:image:alt"]'), talt: g('meta[name="twitter:image:alt"]') };
        });
        if (!alt.alt || !alt.talt) { altMissing++; report.push(`  OG ALT    ${p}  missing`); }
      }
    }
    await ctx.close();
    process.stdout.write(`  ${width}px ✓\n`);
  }

  // Reduced motion: every field must render its still and say so.
  const rm = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const rp = await rm.newPage();
  await serve(rp, () => {}, (u) => { offOrigin++; report.push(`  OFF-ORIGIN reduced-motion  -> ${u}`); });
  for (const p of PAGES) {
    await rp.goto(ORIGIN + p, { waitUntil: 'load' }).catch(() => null);
    await rp.waitForTimeout(80);
    const r = await rp.evaluate(RENDER_PROBE);
    for (const rose of r.roses) if (rose.motion !== 'static' || rose.paths < 1) { render++; report.push(`  STILL     ${p}  reduced-motion motion=${rose.motion} paths=${rose.paths}`); }
  }
  await rm.close();
  process.stdout.write(`  reduced-motion ✓\n`);

  // The film, played: by mouse at desktop, by Space and by Enter on the phones. In its own context, so the
  // requests the player makes once asked for are not counted against the pages above.
  for (const [width, how] of [[1280, 'click'], [390, 'Space'], [320, 'Enter']]) {
    const fc = await browser.newContext({ viewport: { width, height: 900 } });
    const fp = await fc.newPage();
    const off = [];
    await serve(fp, () => {}, (u) => off.push(u));
    for (const p of PAGES) {
      off.length = 0;
      await fp.goto(ORIGIN + p, { waitUntil: 'load' }).catch(() => null);
      await fp.waitForTimeout(80);
      if (off.length) { filmFails++; report.push(`  FILM      ${width}px  ${p}  asked ${off[0]} before any click`); }
      const problems = await filmProbe(fp, how, off);
      if (!problems) continue;
      films++;
      for (const m of problems) { filmFails++; report.push(`  FILM      ${width}px  ${p}  ${m}`); }
    }
    await fc.close();
  }
  // Without the script, the poster is the link it was rendered as.
  const nj = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
  const np = await nj.newPage();
  await serve(np, () => {});
  for (const p of PAGES) {
    await np.goto(ORIGIN + p, { waitUntil: 'load' }).catch(() => null);
    const href = await np.evaluate(() => { const a = document.querySelector('[data-embed] > *'); return a ? a.getAttribute('href') ?? a.tagName : null; });
    if (href !== null && !/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/.test(href)) { filmFails++; report.push(`  FILM      no-js  ${p}  the poster is ${href}, not a link to the watch page`); }
  }
  await nj.close();
  process.stdout.write(`  films played ✓\n`);
  await browser.close();

  if (report.length) console.log('\n' + report.join('\n'));
  console.log(`\n${PAGES.length} pages × ${VIEWPORTS.length} viewports (320→2560)`);
  console.log(`  horizontal overflow      ${overflow}`);
  console.log(`  text cut off the screen  ${clipped}`);
  console.log(`  JS / console errors      ${jsErrors}`);
  console.log(`  undersized tap targets   ${taps}`);
  console.log(`  WCAG AA contrast fails   ${contrast}`);
  console.log(`  pages not served         ${missing}`);
  console.log(`  pages missing og alt     ${altMissing}`);
  console.log(`  broken references        ${broken}`);
  console.log(`  requests off the origin  ${offOrigin}`);
  console.log(`  service-worker problems  ${swProblems.length}`);
  console.log(`  axe-core violations      ${axeFails}`);
  console.log(`  Acid beyond its rule     ${acid}`);  // twice at scale on a surface, or a film thumbnail at scale
  console.log(`  render (fonts/rose/dove) ${render}`);
  console.log(`  film players (${String(films).padStart(2)} played) ${filmFails + iframes.length}`);
  const bad = overflow + clipped + jsErrors + taps + contrast + missing + altMissing + broken + offOrigin + swProblems.length + axeFails + acid + render + filmFails + iframes.length;
  console.log(bad ? `\nverify: ${bad} issue(s)` : '\nverify: clean');
  process.exit(bad ? 1 : 0);
})();
