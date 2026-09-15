#!/usr/bin/env node
/**
 * The pre-push sweep, committed. Ported from cherishwins/teamcanada.
 *
 * Serves dist/ through Playwright request interception, so it exercises the
 * bytes Vercel will publish and needs no network. Every page across ten
 * viewports (320 to 2560) for horizontal overflow, console errors, tap
 * targets and broken references; once at 1280 for WCAG AA contrast against
 * the nearest opaque ancestor, a full axe-core pass, og:image:alt, that the
 * brand faces actually loaded, that Acid appears at scale at most once per
 * surface, and that every rose field runs live; then once under
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
const PAGES = ['/', '/ns-01', '/ns-02', '/edition-02', '/404.html'];
const VIEWPORTS = [320, 360, 390, 414, 600, 768, 1024, 1280, 1920, 2560];

const MIME = { html: 'text/html', css: 'text/css', js: 'text/javascript', png: 'image/png', svg: 'image/svg+xml',
  woff2: 'font/woff2', json: 'application/json', webmanifest: 'application/manifest+json', xml: 'application/xml',
  txt: 'text/plain', pdf: 'application/pdf' };

/**
 * Local mode: other origins answer 204 (the page must not depend on any) and
 * anything that 404s is a broken reference. Live mode: nothing is stubbed;
 * every same-origin response outside 2xx/3xx, and every failed request, is
 * a broken reference.
 */
function serve(page, onBroken) {
  if (LIVE) {
    const host = new URL(LIVE).host;
    page.on('response', (r) => { const u = new URL(r.url()); if (u.host === host && (r.status() < 200 || r.status() >= 400) && u.pathname !== '/404.html') onBroken(`${u.pathname} (${r.status()})`); });
    page.on('requestfailed', (r) => { const u = new URL(r.url()); if (u.host === host) onBroken(`${u.pathname} (${r.failure()?.errorText})`); });
    return Promise.resolve();
  }
  return page.route('**/*', (route) => {
    const u = new URL(route.request().url());
    if (u.host !== 'local.test') return route.fulfill({ status: 204, body: '' });
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
 */
const ACID_PROBE = () => {
  const ACID = 'rgb(204, 255, 0)';
  const out = [];
  document.querySelectorAll('.surface').forEach((s, i) => {
    const hits = [];
    for (const el of s.querySelectorAll('*')) {
      if (el.closest('.surface') !== s) continue;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (own && cs.color === ACID && parseFloat(cs.fontSize) >= 24) hits.push(el.textContent.trim().slice(0, 30));
      if (el instanceof SVGElement && el.getAttribute('stroke') === '#CCFF00' && Math.max(r.width, r.height) >= 200) {
        const svg = el.closest('svg');
        if (!hits.includes('[rose]')) hits.push(svg?.dataset.dove !== undefined ? '[dove]' : '[rose]');
      }
    }
    if (hits.length > 1) out.push({ surface: (s.getAttribute('aria-label') || s.getAttribute('aria-labelledby') || `#${i + 1}`), hits });
  });
  return out;
};

/** The brand faces loaded, the fields are live, the dove exists where declared. */
const RENDER_PROBE = () => ({
  bricolage: document.fonts.check("800 40px 'Bricolage Grotesque'"),
  martian: document.fonts.check("500 11px 'Martian Mono'"),
  roses: [...document.querySelectorAll('svg[data-rose]')].map((s) => ({ motion: s.dataset.motion, paths: s.querySelectorAll('path[d]').length })),
  doves: [...document.querySelectorAll('svg[data-dove]')].map((s) => s.querySelectorAll('path').length),
  sw: !!navigator.serviceWorker?.controller,
});

(async () => {
  if (!LIVE && !fs.existsSync(ROOT)) { console.error(`verify: no build at ${ROOT}`); process.exit(1); }
  if (LIVE) console.log(`  live sweep of ${LIVE}`);
  // No service worker, by decision (CLAUDE.md Q10). Its absence is asserted, not assumed.
  const swProblems = [];
  if (!LIVE) {
    if (fs.existsSync(path.join(ROOT, 'sw.js'))) swProblems.push('sw.js is in the build; the site ships no service worker');
    for (const f of fs.readdirSync(ROOT)) if (f.endsWith('.html') && /serviceWorker/.test(fs.readFileSync(path.join(ROOT, f), 'utf8'))) swProblems.push(`${f} references serviceWorker`);
  }
  for (const m of swProblems) console.log(`  SW        ${m}`);

  const browser = await chromium.launch();
  let overflow = 0, jsErrors = 0, taps = 0, contrast = 0, missing = 0, altMissing = 0, broken = 0, axeFails = 0, acid = 0, render = 0;
  const report = [];

  for (const width of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    let current = '';
    await serve(page, (p) => { broken++; report.push(`  BROKEN    ${width}px  ${current}  -> ${p}`); });
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
      for (const t of await page.evaluate(TAP_PROBE)) { taps++; report.push(`  TAP       ${width}px  ${p}  ${t.w}x${t.h}  "${t.text}"`); }

      if (width === 1280) {
        for (const c of await page.evaluate(CONTRAST_PROBE)) { contrast++; report.push(`  CONTRAST  ${p}  ${c.ratio}:1 (needs ${c.need}) ${c.px}px  "${c.text}"`); }
        for (const a of await page.evaluate(ACID_PROBE)) { acid++; report.push(`  ACID      ${p}  surface ${a.surface}: ${a.hits.length} at scale: ${a.hits.join(' | ')}`); }
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
  await serve(rp, () => {});
  for (const p of PAGES) {
    await rp.goto(ORIGIN + p, { waitUntil: 'load' }).catch(() => null);
    await rp.waitForTimeout(80);
    const r = await rp.evaluate(RENDER_PROBE);
    for (const rose of r.roses) if (rose.motion !== 'static' || rose.paths < 1) { render++; report.push(`  STILL     ${p}  reduced-motion motion=${rose.motion} paths=${rose.paths}`); }
  }
  await rm.close();
  process.stdout.write(`  reduced-motion ✓\n`);
  await browser.close();

  if (report.length) console.log('\n' + report.join('\n'));
  console.log(`\n${PAGES.length} pages × ${VIEWPORTS.length} viewports (320→2560)`);
  console.log(`  horizontal overflow      ${overflow}`);
  console.log(`  JS / console errors      ${jsErrors}`);
  console.log(`  undersized tap targets   ${taps}`);
  console.log(`  WCAG AA contrast fails   ${contrast}`);
  console.log(`  pages not served         ${missing}`);
  console.log(`  pages missing og alt     ${altMissing}`);
  console.log(`  broken references        ${broken}`);
  console.log(`  service-worker problems  ${swProblems.length}`);
  console.log(`  axe-core violations      ${axeFails}`);
  console.log(`  Acid twice on a surface  ${acid}`);
  console.log(`  render (fonts/rose/dove) ${render}`);
  const bad = overflow + jsErrors + taps + contrast + missing + altMissing + broken + swProblems.length + axeFails + acid + render;
  console.log(bad ? `\nverify: ${bad} issue(s)` : '\nverify: clean');
  process.exit(bad ? 1 : 0);
})();
