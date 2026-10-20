#!/usr/bin/env node
/**
 * Screenshots of the documents a film shows (CLAUDE.md, override 8): a cited
 * source as its publisher serves it, with the quoted words found and boxed so
 * the render can sweep them in Acid, or a stretch of our own built page.
 * This is the capture half of the `page` shot; the render half puts the PNG
 * on Void and falls back to a computed quote card when a capture is refused.
 *
 *   node tools/capture.mjs <slug> --page "<tag>" [--page "<tag>" ...] [--cuts <file>] [--raw] [--height <px>] [--out <dir>]
 *
 * <tag> is what follows `page:` in a cut list's [[page: ...]]:
 *   07 | hl: These are PHY rates | url: https://www.morsemicro.com/products/chips/
 *   self 11 | in: #ledger | hl: 43.3 Mbps at the physical layer   (source 11 is one of our pages)
 *   self #stands | hl: ...                                         (this edition's own page, element #stands)
 *   self edition-03#ledger                                         (another of our pages, framed at the element)
 * `hl:` may be given more than once (one picture, two related steps). `in:` limits the search to one element and,
 * with no `hl:`, frames it. The pages cite their sources as text, not links (CLAUDE.md, "Block links only"), so an
 * outside source's URL comes from `url:` or from the cut list's `# Sources` line, `- 07 | <url> | read <date>`.
 * --cuts reads that section and every [[page: ...]] tag in the file.
 *
 * What it will not do, each a refusal recorded in the shot's JSON and never a workaround:
 * - fetch anything from YouTube or a streaming service, not even an embed's thumbnail or a redirect hop. Every
 *   connection the browser makes goes through a gate on 127.0.0.1 that refuses those hosts, because Playwright's
 *   routes never see a redirect hop and a news page that embeds a video preconnects to YouTube on its own;
 * - load a page its robots.txt disallows to this agent, which says who it is and links the site;
 * - pass a bot check, a WAF challenge, a sign-in wall, a paywall or an ad-blocker prompt, or keep a page that
 *   answered 403 and then replaced itself by script. On any of them the shot stops, nothing is clicked or hidden,
 *   and the host is not asked again in the same run;
 * - in clean mode (the default; --raw turns it off), hide anything but cookie banners and ad slots, and those by CSS
 *   only: no ad server is blocked, because a blocked ad server is what puts up an ad-blocker wall (Geeky Gadgets
 *   did, 2026-10-20, over the very sentence the shot was for). A banner whose text reads like a wall is left alone,
 *   because a wall is refused, never hidden;
 * - call words boxed that a reader cannot see: words in a collapsed part of the page, or under an overlay, fail. A
 *   closed <details> holding them is opened (the page's own "expand"); a script's accordion is not touched.
 * A `self` shot is served from dist/ with the network closed: run `npm run build` first.
 *
 * Out, per shot, in brand/youtube/<slug>/pages/ (gitignored; filing them on a release is the re-cut's job):
 * <key>-<sha8>.png and <key>-<sha8>.json, where sha8 is a hash of what was asked for (the URL or our page, the
 * words, the element, the mode, the height), so the same tag always names the same file. The PNG is the viewport,
 * 1440 CSS px wide at 2 device pixels per CSS px, scrolled so the words sit at 40 percent of its height; a viewport
 * taller than any frame needs means a push-in never shows its edge. Every box in the JSON is in CSS px of that
 * viewport (double it for the PNG's pixels). Each phrase also carries `block`, the box of the paragraph or table
 * row it sits in, so the render can crop to the words' own column and leave a sidebar out. `media` lists the
 * pictures in view, so the render can crop a news photograph out and show only the words. A refused shot writes
 * its JSON and no PNG.
 * Exit 1 when a shot failed (its words are not on the page, the URL is gone, the tag is wrong); a refusal is an
 * answer, not a failure, because the render has a fallback for it.
 */
import fs from 'node:fs';
import net from 'node:net';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { browser } from './lib/film.mjs';
import { SITE, abs } from '../src/config.mjs';
import { EDITIONS, edition } from '../src/lib/editions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Honest: the tool's name, the site it works for, nothing borrowed from a browser. A site that refuses it is answered.
export const UA = `AedificareFilmBot/1.0 (+${SITE.origin})`;
const TOKEN = 'aedificarefilmbot'; // the product token a robots.txt group would name
export const WIDTH = 1440, DPR = 2, HEIGHT = 1600;

// Never fetched, whatever the page asks for: their terms forbid taking from them (override 8; the YouTube Terms).
const NEVER = /(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com|youtubei\.googleapis\.com|youtube\.googleapis\.com|googlevideo\.com|ytimg\.com|yt\d\.ggpht\.com|netflix\.com|nflxvideo\.net|nflximg\.net|nflxext\.com|nflxso\.net|primevideo\.com|disneyplus\.com|disney-plus\.net|bamgrid\.com|hulu\.com|hulustream\.com|max\.com|hbomax\.com|peacocktv\.com|paramountplus\.com|crunchyroll\.com|tv\.apple\.com|twitch\.tv|ttvnw\.net|jtvnw\.net|vimeo\.com|vimeocdn\.com|dailymotion\.com|dmcdn\.net|tiktok\.com|tiktokcdn\.com|spotify\.com|scdn\.co|soundcloud\.com|sndcdn\.com)$/i;
// A page out there has no business reaching this machine's own services (the gate, the sandbox's proxy).
const LOCAL = /^(localhost|.*\.localhost|127\.\d+\.\d+\.\d+|0\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|169\.254\.\d+\.\d+|::1?|f[cd][0-9a-f]*:.*|fe80:.*)$/i;
// The consent managers' own containers, by their documented ids and classes; a banner none of them names is found
// by its words instead (CLEAN, below).
const CMP = ['#onetrust-consent-sdk', '#onetrust-banner-sdk', '.onetrust-pc-dark-filter', '#CybotCookiebotDialog', '#CybotCookiebotDialogBodyUnderlay',
  '#truste-consent-track', '#truste-consent-content', '.truste_overlay', '.truste_box_overlay', '#consent_blackbar', '#qc-cmp2-container', '#didomi-host',
  '#usercentrics-root', '[id^="sp_message_container"]', '.fc-consent-root', '.fc-dialog-overlay', '#cookie-law-info-bar', '.cky-consent-container', '.cky-overlay',
  '#cmplz-cookiebanner-container', '.cmplz-cookiebanner', '.osano-cm-window', '.osano-cm-dialog', '#iubenda-cs-banner', '#termly-code-snippet-support',
  '#cookiescript_injected', '.cc-window', '#gdpr-cookie-message', '#cookie-notice', '#BorlabsCookieBox', '.moove-gdpr-info-bar-container',
  '#hs-eu-cookie-confirmation', '#_evidon_banner', '.evidon-banner', '#klaro'].join(',');
// Ad slots by the names ad tags give them. Whole class names only: a substring such as "ad-slot" is also inside "head-slot".
const AD_SLOTS = ['ins.adsbygoogle', '.adsbygoogle', '[id^="google_ads_iframe"]', '[id^="div-gpt-ad"]', '[id^="gpt-ad"]', '.gpt-ad', '[data-google-query-id]',
  '[data-ad-slot]', '[data-ad-unit]', '[data-adunit]', '[id^="taboola-"]', '.trc_related_container', '.OUTBRAIN', '.ad-slot', '.adslot', '.ad-container',
  '.ad-wrapper', '.ad-unit', '.advertisement', '.advert', '.sticky-ad', '[aria-label="Advertisement"]', '[aria-label="advertisement"]'].join(',');
const ADBLOCK_TEXT = /ad ?-?blocker|adblock|disable your ad|(allow|white)list (us|this site|our site)|support (us|our site) by disabling/i;
const PAYWALL_SEL = '[class*="paywall" i],[id*="paywall" i],[class*="regwall" i],[id*="regwall" i],[class*="piano" i],.tp-modal,[class*="subscribe-wall" i],[class*="meter-wall" i]';

// What a wall says. Read from the title always, and from the page only when the page is short, which a challenge
// page is: an article ABOUT captchas is long, and should not read as one.
const CHALLENGE = /just a moment\b|attention required|verify (that )?you are (a )?human|are you a robot|not a robot|unusual traffic|automated (queries|requests)|access denied|request access|captcha|security (verification|check)\b|checking (if the site connection is secure|your browser)|enable javascript and cookies to continue|pardon our interruption|incapsula incident|press (&|and) hold|one more step|please verify you are|before you continue to/i;
// DataDome, PerimeterX and Arkose frames appear only to challenge. Cloudflare's Turnstile, hCaptcha and reCAPTCHA also
// guard ordinary forms (Morse Micro's chips page loads Turnstile for one), so they count only on a short page.
const STRICT_FRAMES = /captcha-delivery\.com|perimeterx|px-cdn\.net|px-cloud\.net|arkoselabs\.com|funcaptcha\.com/i;
const SOFT_FRAMES = /challenges\.cloudflare\.com|turnstile|hcaptcha\.com|recaptcha\/(api2|enterprise)\/(anchor|bframe)(?!.*size=invisible)/i;
const LOGIN_PATH = /(^|\/)(login|log-in|signin|sign-in|sign_in|sso|auth|users\/sign_in|account\/login)(\/|$)/i;
const LOGIN_TEXT = /(sign|log) ?in to (continue|read|view|see)|you must (be )?(logged|signed) in|create a free account to (continue|read)|register to (continue|read)/i;
const PAYWALL_TEXT = /subscribe (now )?to (continue|keep) reading|to continue reading,? (please )?(subscribe|sign in|log in|register)|this (article|story|content) is (only )?(available|reserved|exclusive) (to|for) (subscribers|members|premium)|you('ve| have) (reached|read) (your|all (of )?your) (free|monthly)|unlock (this|the full) (article|story)/i;
const SHORT_PAGE = 2500;
const MODAL_SEL = '[role="dialog"],[role="alertdialog"],[aria-modal="true"],dialog[open]';

/* ---- the tag ------------------------------------------------------------------ */
/** One [[page: ...]] body, with `sources` (number to URL) from the cut list. Throws on a tag that cannot be shot. */
export function parsePage(body, sources = {}) {
  const [head, ...fields] = String(body).split('|').map((x) => x.trim());
  const shot = { tag: String(body).trim(), self: false, src: null, page: null, url: null, in: null, hl: [] };
  for (const f of fields) {
    const kv = /^(hl|in|url)\s*:\s*([\s\S]*)$/.exec(f);
    if (!kv) throw new Error(`page: unknown field "${f}" (hl:, in: and url: are the fields)`);
    const v = kv[2].trim().replace(/^["\u201c](.*)["\u201d]$/, '$1');
    if (kv[1] === 'hl') shot.hl.push(v); else shot[kv[1]] = v;
  }
  let m;
  if ((m = /^self\s+(\d{1,3})(#[\w-]+)?$/.exec(head))) { shot.self = true; shot.src = m[1].padStart(2, '0'); if (m[2]) shot.in = shot.in ? scopeClash(head) : m[2]; }
  else if ((m = /^self\s+([a-z][a-z0-9-]*)?(#[\w-]+)?$/.exec(head)) && (m[1] || m[2])) { shot.self = true; shot.page = m[1] || null; if (m[2]) shot.in = shot.in ? scopeClash(head) : m[2]; }
  else if ((m = /^(\d{1,3})$/.exec(head))) { shot.src = m[1].padStart(2, '0'); shot.url = shot.url || sources[shot.src] || null; }
  else throw new Error(`page: "${head}" is neither a source number nor self <n>, self #<id> or self <slug>#<id>`);
  if (shot.hl.some((h) => !h)) throw new Error(`page: ${head} has an empty hl:; copy the words from the source itself`);
  if (!shot.self && !shot.url) throw new Error(`page: source ${shot.src} has no URL (give url:, or a "- ${shot.src} | <url>" line under # Sources)`);
  // The words are the point of a source's shot: a page with nothing found on it proves nothing.
  if (!shot.self && !shot.hl.length) throw new Error(`page: source ${shot.src} needs hl:, the words the shot is for`);
  return shot;
}
const scopeClash = (head) => { throw new Error(`page: ${head} names its element twice (in: and #id)`); };

/** A cut list's sources and page tags (the format of source/film/<slug>.cuts.md). */
export function cutsPages(file) {
  const src = fs.readFileSync(file, 'utf8');
  const sources = {};
  let inSources = false;
  for (const line of src.split('\n')) {
    if (/^#{1,6}\s/.test(line)) { inSources = /^#{1,6}\s+Sources\s*$/i.test(line); continue; }
    const m = inSources && /^-\s*(\d{1,3})\s*\|\s*(\S+)/.exec(line);
    if (m) sources[m[1].padStart(2, '0')] = m[2];
  }
  const tags = [...src.matchAll(/\[\[page:\s*([\s\S]*?)\]\]/g)].map((m) => m[1]);
  return { sources, tags };
}

/** The file stem a shot is written under, the same for the same request on any day. */
export function shotName(slug, shot, { clean = true, height = HEIGHT } = {}) {
  const spec = shot.self
    ? { self: shot.page || (shot.src ? null : slug), src: shot.src, in: shot.in, hl: shot.hl, height }
    : { url: shot.url, in: shot.in, hl: shot.hl, clean, height };
  const sha8 = crypto.createHash('sha256').update(JSON.stringify(spec)).digest('hex').slice(0, 8);
  const head = shot.self ? ['self', shot.src || shot.page, (shot.in || '').replace(/^#/, '')].filter(Boolean).join('-') : shot.src;
  return `${head.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${sha8}`;
}

/* ---- robots.txt ---------------------------------------------------------------- */
/** RFC 9309 groups: the user agents they name, their rules, and any Crawl-delay. */
export function parseRobots(txt) {
  const groups = [];
  let cur = null, agentLine = false;
  for (const raw of txt.split(/\r?\n/)) {
    const m = /^\s*([A-Za-z-]+)\s*:\s*(.*?)\s*$/.exec(raw.replace(/#.*/, ''));
    if (!m) continue;
    const k = m[1].toLowerCase(), v = m[2];
    if (k === 'user-agent') { if (!agentLine) groups.push(cur = { agents: [], rules: [], delay: null }); cur.agents.push(v.toLowerCase().split('/')[0].trim()); agentLine = true; continue; }
    agentLine = false;
    if (!cur) continue;
    if ((k === 'allow' || k === 'disallow') && v) cur.rules.push({ allow: k === 'allow', path: v }); // an empty Disallow allows everything
    else if (k === 'crawl-delay' && +v > 0) cur.delay = +v;
  }
  return groups;
}
const robotsRe = (p) => { const end = p.endsWith('$'); return new RegExp('^' + (end ? p.slice(0, -1) : p).split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + (end ? '$' : '')); };
/** Our group if one names us, else `*`; the longest matching rule wins, and Allow wins a tie (RFC 9309, 2.2.2). */
export function robotsVerdict(groups, pathAndQuery) {
  let mine = groups.filter((g) => g.agents.includes(TOKEN));
  if (!mine.length) mine = groups.filter((g) => g.agents.includes('*'));
  let best = null;
  for (const r of mine.flatMap((g) => g.rules)) if (robotsRe(r.path).test(pathAndQuery) && (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow))) best = r;
  const delay = Math.max(0, ...mine.map((g) => g.delay || 0));
  return { allowed: !best || best.allow, rule: best ? `${best.allow ? 'Allow' : 'Disallow'}: ${best.path}` : null, delay };
}

/* ---- the gate ------------------------------------------------------------------ */
/**
 * The one door out. Chromium and Playwright's own requests (robots.txt) are pointed at this proxy, which opens a
 * connection only to a host that may be fetched, chaining through HTTPS_PROXY when the machine has one (this
 * sandbox does; a runner does not) and directly otherwise. It refuses at the connection, so it holds for redirect
 * hops, preconnects, iframes and sockets, which a Playwright route never sees. It counts what it let through and
 * what it refused, and each shot's JSON carries that count.
 */
async function openGate() {
  let up = null;
  try { up = process.env.HTTPS_PROXY || process.env.https_proxy ? new URL(process.env.HTTPS_PROXY || process.env.https_proxy) : null; } catch { up = null; }
  const auth = up && up.username ? `Proxy-Authorization: Basic ${Buffer.from(`${decodeURIComponent(up.username)}:${decodeURIComponent(up.password)}`).toString('base64')}\r\n` : '';
  const gate = { closed: false, hosts: {}, refused: {} };
  const why = (host) => {
    host = host.replace(/^\[|\]$/g, '').toLowerCase();
    if (gate.closed) return 'closed';
    if (LOCAL.test(host)) return 'local';
    if (NEVER.test(host)) return 'never';
    return null;
  };
  const tally = (host, no) => { const t = no ? gate.refused : gate.hosts; const k = host.toLowerCase(); t[k] = (t[k] || 0) + 1; };
  const sockets = new Set();
  const server = http.createServer((req, res) => {
    let u;
    try { u = new URL(req.url); } catch { res.writeHead(400).end(); return; }
    const no = why(u.hostname);
    tally(u.hostname, no);
    if (no) { res.writeHead(403).end(); return; }
    const opt = up
      ? { host: up.hostname, port: up.port || 80, path: req.url, method: req.method, headers: { ...req.headers, ...(auth ? { 'proxy-authorization': auth.slice(21, -2) } : {}) } }
      : { host: u.hostname, port: u.port || 80, path: u.pathname + u.search, method: req.method, headers: req.headers };
    const out = http.request(opt, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
    out.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
    req.pipe(out);
  });
  server.on('connection', (s) => { sockets.add(s); s.on('close', () => sockets.delete(s)); });
  server.on('connect', (req, sock, head) => {
    sock.on('error', () => {});
    const m = /^\[?([^\]]+?)\]?:(\d+)$/.exec(req.url || '');
    if (!m) { sock.end('HTTP/1.1 400 Bad Request\r\n\r\n'); return; }
    const [, host, port] = m, no = why(host);
    tally(host, no);
    if (no) { sock.end('HTTP/1.1 403 Forbidden\r\n\r\n'); return; }
    const join = (out, rest) => {
      sock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (rest && rest.length) sock.write(rest);
      if (head && head.length) out.write(head);
      out.pipe(sock); sock.pipe(out);
    };
    const target = host.includes(':') ? `[${host}]:${port}` : `${host}:${port}`;
    const out = up ? net.connect(+(up.port || 80), up.hostname) : net.connect(+port, host);
    sockets.add(out);
    out.on('close', () => { sockets.delete(out); sock.destroy(); });
    out.on('error', () => sock.destroy());
    sock.on('close', () => out.destroy());
    if (!up) { out.on('connect', () => join(out)); return; }
    out.on('connect', () => out.write(`CONNECT ${target} HTTP/1.1\r\nHost: ${target}\r\n${auth}\r\n`));
    let buf = Buffer.alloc(0);
    const reply = (d) => {
      buf = Buffer.concat([buf, d]);
      const i = buf.indexOf('\r\n\r\n');
      if (i < 0) { if (buf.length > 16384) out.destroy(); return; }
      out.off('data', reply);
      if (!/^HTTP\/1\.[01] 200/.test(buf.toString('latin1', 0, i))) { sock.end('HTTP/1.1 502 Bad Gateway\r\n\r\n'); out.destroy(); return; }
      join(out, buf.subarray(i + 4));
    };
    out.on('data', reply);
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  gate.url = `http://127.0.0.1:${server.address().port}`;
  gate.reset = () => { gate.hosts = {}; gate.refused = {}; };
  gate.close = () => new Promise((ok) => { for (const s of sockets) s.destroy(); server.close(() => ok()); });
  return gate;
}

/* ---- inside the page ------------------------------------------------------------ */
// Each runs in the captured page through page.evaluate, so each is self-contained.

/** What the page says it is, and every sign that it is a wall instead. */
const PROBE = ({ paywallSel, modalSel }) => {
  const vis = (el) => !el.checkVisibility || el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
  const body = document.body ? document.body.innerText || '' : '';
  const frames = [...document.querySelectorAll('iframe')].filter((f) => { const r = f.getBoundingClientRect(); return vis(f) && r.width >= 60 && r.height >= 40; }).map((f) => f.src || '');
  const meta = (sel) => document.querySelector(sel)?.getAttribute('content')?.trim() || null;
  const name = (x) => (typeof x === 'string' ? x : Array.isArray(x) ? name(x[0]) : x && typeof x.name === 'string' ? x.name : null);
  const ld = { publisher: null, author: null, published: null, notFree: false };
  const walk = (o) => {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) { o.forEach(walk); return; }
    if ('isAccessibleForFree' in o && String(o.isAccessibleForFree).toLowerCase() === 'false') ld.notFree = true;
    if (!ld.publisher && o.publisher) ld.publisher = name(o.publisher);
    if (!ld.author && o.author) ld.author = name(o.author);
    if (!ld.published && typeof o.datePublished === 'string') ld.published = o.datePublished;
    Object.values(o).forEach(walk);
  };
  for (const s of document.querySelectorAll('script[type="application/ld+json"]')) { try { walk(JSON.parse(s.textContent)); } catch { /* a page's broken JSON-LD is its own business */ } }
  const prompt = [...document.querySelectorAll(paywallSel)].find((el) => {
    const r = el.getBoundingClientRect(), t = el.innerText || '';
    return vis(el) && r.width > 120 && r.height > 40 && t.length < 1500 && /subscri|sign in|log in|register|create (an|a free) account/i.test(t);
  });
  // A sign-in prompt is read only where it can be a wall: the whole of a short page, or an overlay (an open dialog, or
  // a fixed or sticky box). A long page's own furniture says "You must be signed in to change notification settings"
  // (every GitHub repository does).
  const modals = [...document.querySelectorAll(modalSel)].filter(vis);
  for (const el of document.querySelectorAll('body *')) {
    const pos = getComputedStyle(el).position;
    if ((pos === 'fixed' || pos === 'sticky') && vis(el) && !modals.some((m) => m.contains(el) || el.contains(m))) modals.push(el);
  }
  return {
    title: document.title || '', text: body.slice(0, 8000), length: body.length, frames, notFree: ld.notFree,
    modal: modals.map((el) => (el.innerText || '').slice(0, 3000)).join('\n').slice(0, 12000),
    modalPassword: modals.some((el) => [...el.querySelectorAll('input[type="password"]')].some(vis)),
    paywall: prompt ? (prompt.id ? `#${prompt.id}` : `${prompt.tagName.toLowerCase()}.${[...prompt.classList].join('.')}`) : null,
    password: [...document.querySelectorAll('input[type="password"]')].some(vis),
    publisher: meta('meta[property="og:site_name"]') || ld.publisher || meta('meta[name="citation_publisher"]') || meta('meta[name="application-name"]'),
    // Most titles end on the site's name ("Wi-Fi HaLow Chips & SoCs | Morse Micro"): the last resort, and marked as one.
    titleTail: (/\s[|\u2013\u2014\u00b7-]\s([^|\u2013\u2014\u00b7]{2,40})$/.exec(document.title || '') || [])[1]?.trim() || null,
    author: meta('meta[name="author"]') || ld.author || meta('meta[name="citation_author"]'),
    published: meta('meta[property="article:published_time"]') || ld.published || meta('meta[name="citation_date"]') || meta('meta[name="citation_publication_date"]'),
    canonical: document.querySelector('link[rel="canonical"]')?.href || null,
  };
};

/** Clean mode: the consent managers' boxes, the ad slots, and any fixed or sticky box that reads as a cookie notice. */
const CLEAN = ({ cmp, ads }) => {
  const vis = (el) => !el.checkVisibility || el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
  const count = (sel) => [...document.querySelectorAll(sel)].filter(vis).length;
  const hidden = { cmp: count(cmp), ads: count(ads), banners: 0 };
  if (!document.querySelector('style[data-aed-clean]')) {
    const st = document.createElement('style');
    st.dataset.aedClean = '';
    st.textContent = `${cmp},${ads}{display:none!important}`;
    (document.head || document.documentElement).appendChild(st);
  }
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el);
    if ((s.position !== 'fixed' && s.position !== 'sticky') || !vis(el)) continue;
    const t = el.innerText || '';
    if (t.length > 3000 || !/cookie|consent|gdpr|privacy (choices|preferences|settings)/i.test(t)) continue;
    if (/subscri|paywall|sign in to|log in to|register to/i.test(t)) continue; // a wall is refused, never hidden
    if (!el.querySelector('button,[role="button"],a')) continue;
    el.style.setProperty('display', 'none', 'important');
    hidden.banners++;
  }
  return hidden;
};

/**
 * The words, across text nodes. The page's visible text is joined node by node, a space where a block ends (so a
 * table's cells or a list's items do not run together) and nothing inside a line (so "up to <b>15</b> Mbps" stays
 * one phrase), then folded the way a person copying it would read it: case, runs of space, curly quotes, dashes
 * and the ellipsis. Each phrase's first match becomes a Range kept on the page for MEASURE. With `open`, a closed
 * <details> whose text holds a phrase is opened first: the page's own disclosure, the click a reader would make.
 */
const FIND = ({ phrases, scope, open }) => {
  const root = scope ? document.querySelector(scope) : document.body;
  if (!root) return { scope: false, phrases: [] };
  const fold = (c) => (/[\u2018\u2019\u201a\u201b\u2032`\u00b4]/.test(c) ? "'" : /[\u201c\u201d\u201e\u201f\u2033]/.test(c) ? '"' : /[\u2010-\u2015\u2212]/.test(c) ? '-'
    : c === '\u2026' ? '...' : /[\u00ad\u200b-\u200d\u2060\ufeff]/.test(c) ? '' : /\s/.test(c) ? ' ' : c.toLowerCase());
  const want = (p) => { let s = ''; for (const ch of p) for (const c of fold(ch)) { if (c === ' ' && (!s || s.endsWith(' '))) continue; s += c; } return s.trim(); };
  let opened = 0;
  if (open) {
    const qs = phrases.map(want).filter(Boolean);
    for (const d of root.querySelectorAll('details:not([open])')) { const t = want(d.textContent || ''); if (qs.some((q) => t.includes(q))) { d.open = true; opened++; } }
  }
  const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|IFRAME|OBJECT|TEXTAREA|SELECT|OPTION)$/;
  const shownCache = new Map(), blockCache = new Map();
  const shown = (el) => {
    if (!shownCache.has(el)) shownCache.set(el, getComputedStyle(el).display === 'contents' || !el.checkVisibility || el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }));
    return shownCache.get(el);
  };
  const blockOf = (el) => {
    for (let e = el; e && e !== root; e = e.parentElement) {
      if (!blockCache.has(e)) blockCache.set(e, !/^(inline|contents|ruby)/.test(getComputedStyle(e).display));
      if (blockCache.get(e)) return e;
    }
    return root;
  };
  const segs = [];
  let raw = '', last = null;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeType === 3 ? NodeFilter.FILTER_ACCEPT
      : SKIP.test(n.tagName.toUpperCase()) || !shown(n) ? NodeFilter.FILTER_REJECT
        : n.tagName === 'BR' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
  });
  for (let n; (n = w.nextNode());) {
    if (n.nodeType === 1) { raw += ' '; continue; }
    const b = blockOf(n.parentElement);
    if (last && b !== last) raw += ' ';
    last = b;
    segs.push({ n, at: raw.length });
    raw += n.nodeValue;
  }
  let norm = '';
  const map = [];
  for (let i = 0; i < raw.length; i++) for (const c of fold(raw[i])) { if (c === ' ' && (!norm || norm.endsWith(' '))) continue; norm += c; map.push(i); }
  const loc = (r) => {
    let lo = 0, hi = segs.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (segs[mid].at <= r) lo = mid; else hi = mid - 1; }
    const s = segs[lo];
    return [s.n, Math.max(0, Math.min(r - s.at, s.n.nodeValue.length))];
  };
  window.__aedRanges = [];
  let all = null; // the same text with nothing skipped, read only to say why a phrase was not found
  const out = phrases.map((p) => {
    const q = want(p), hits = [];
    for (let k = q ? norm.indexOf(q) : -1; k >= 0 && hits.length < 50; k = norm.indexOf(q, k + 1)) hits.push(k);
    if (!hits.length) {
      if (all === null) all = want(root.textContent || '');
      return { text: p, found: false, occurrences: 0, hidden: !!q && all.includes(q) };
    }
    const a = map[hits[0]], z = map[hits[0] + q.length - 1] + 1, r = document.createRange();
    r.setStart(...loc(a));
    r.setEnd(...loc(z));
    window.__aedRanges.push(r);
    // As joined above (a space between table cells), which Range.toString() would run together.
    return { text: p, found: true, matched: raw.slice(a, z).replace(/\s+/g, ' ').trim(), occurrences: hits.length };
  });
  return { scope: true, phrases: out, opened };
};

/** Bring the words (or the element, or the top) into frame: the words' middle at 40 percent of the viewport. */
const SCROLL = ({ mode, scope }) => {
  const union = (rs) => rs.reduce((u, r) => (u ? { top: Math.min(u.top, r.top), bottom: Math.max(u.bottom, r.bottom) } : { top: r.top, bottom: r.bottom }), null);
  if (mode === 'hl') {
    const rs = window.__aedRanges.map((r) => r.getBoundingClientRect());
    window.__aedRanges[0].startContainer.parentElement.scrollIntoView({ block: 'center' });
    const u = union(window.__aedRanges.map((r) => r.getBoundingClientRect())) || union(rs);
    window.scrollBy(0, u.bottom - u.top > 0.8 * innerHeight ? u.top - 0.1 * innerHeight : (u.top + u.bottom) / 2 - 0.4 * innerHeight);
  } else if (mode === 'scope') {
    document.querySelector(scope).scrollIntoView({ block: 'start' });
    window.scrollBy(0, -0.12 * innerHeight);
  } else window.scrollTo(0, 0);
  return { x: Math.round(scrollX), y: Math.round(scrollY) };
};

/** Each kept Range's boxes, in CSS px of the viewport as it is now. */
const MEASURE = () => (window.__aedRanges || []).map((r) => {
  const seen = new Set();
  return [...r.getClientRects()].filter((x) => x.width > 0.5 && x.height > 0.5)
    .map((x) => ({ x: +x.left.toFixed(1), y: +x.top.toFixed(1), w: +x.width.toFixed(1), h: +x.height.toFixed(1) }))
    .filter((b) => { const k = `${b.x},${b.y},${b.w},${b.h}`; if (seen.has(k)) return false; seen.add(k); return true; });
});

/**
 * What a reader would see at the middle of each box: the words' own element, or something over them (a dialog, a
 * backdrop, a banner nobody hid). Found words under an overlay are not on screen, so they are not a shot.
 */
const COVER = () => (window.__aedRanges || []).map((r) => {
  const c = r.commonAncestorContainer, anc = c.nodeType === 1 ? c : c.parentElement;
  for (const x of r.getClientRects()) {
    const cx = x.left + x.width / 2, cy = x.top + x.height / 2;
    if (x.width < 1 || x.height < 1 || cx < 0 || cy < 0 || cx >= innerWidth || cy >= innerHeight) continue;
    const el = document.elementFromPoint(cx, cy);
    if (!el || anc.contains(el) || el.contains(anc)) continue;
    return { by: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + [...el.classList].slice(0, 3).map((k) => `.${k}`).join(''), text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120) };
  }
  return null;
});

/**
 * The block each phrase sits in: its nearest ancestor that is not inline, or the whole row when that is a table
 * cell, because a row's label is the cell's context. The render crops to its left and right edges, which a news
 * page's sidebar of photographs lies outside.
 */
const BLOCKS = () => (window.__aedRanges || []).map((r) => {
  let el = r.commonAncestorContainer.nodeType === 1 ? r.commonAncestorContainer : r.commonAncestorContainer.parentElement;
  while (el && el !== document.body && /^(inline|contents|ruby)/.test(getComputedStyle(el).display)) el = el.parentElement;
  if (el && /^table-cell$/.test(getComputedStyle(el).display) && el.closest('tr')) el = el.closest('tr');
  if (!el || el === document.body || el === document.documentElement) return null;
  const b = el.getBoundingClientRect();
  return { x: +b.left.toFixed(1), y: +b.top.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), tag: el.tagName.toLowerCase() };
});

/**
 * The pictures in view (a news photograph is cropped out at render; a shot of a source shows its words). Opacity
 * is not a test: a lazy image fades in from 0. Nor is 48 px: Geeky Gadgets' sidebar thumbnails are 75 by 42 and
 * were in the PNG while this list said there were none (2026-10-20). Under 32 px it is an icon.
 */
const MEDIA = () => {
  const out = [], vw = innerWidth, vh = innerHeight;
  // What shows of a picture is its box cut by every ancestor that clips: a carousel's thumbnails past its strip
  // report boxes over the text beside it (Parallel's product page, 2026-10-20), and the render would cover the text.
  const shown = (el) => {
    const b = el.getBoundingClientRect();
    let x0 = b.left, y0 = b.top, x1 = b.right, y1 = b.bottom;
    for (let a = el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.overflowX !== 'visible' || s.overflowY !== 'visible') {
        const c = a.getBoundingClientRect();
        if (s.overflowX !== 'visible') { x0 = Math.max(x0, c.left); x1 = Math.min(x1, c.right); }
        if (s.overflowY !== 'visible') { y0 = Math.max(y0, c.top); y1 = Math.min(y1, c.bottom); }
      }
      if (s.position === 'fixed') break;
    }
    return { left: x0, top: y0, right: x1, bottom: y1, width: x1 - x0, height: y1 - y0 };
  };
  const add = (el, kind) => {
    const r = shown(el);
    if (r.width < 32 || r.height < 32 || r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) return;
    if (el.checkVisibility && !el.checkVisibility({ checkVisibilityCSS: true })) return;
    out.push({ kind, x: +r.left.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) });
  };
  document.querySelectorAll('img,video,canvas,iframe,embed,object').forEach((el) => add(el, el.tagName.toLowerCase()));
  document.querySelectorAll('svg').forEach((el) => { if (!el.parentElement?.closest('svg')) add(el, 'svg'); });
  for (const el of document.querySelectorAll('body *')) if (/url\(/.test(getComputedStyle(el).backgroundImage)) add(el, 'background');
  return out;
};

/* ---- our own pages -------------------------------------------------------------- */
const MIME = { html: 'text/html', css: 'text/css', js: 'text/javascript', mjs: 'text/javascript', png: 'image/png', svg: 'image/svg+xml', woff2: 'font/woff2', json: 'application/json', webmanifest: 'application/manifest+json', xml: 'application/xml', txt: 'text/plain' };
const DIST = path.join(ROOT, 'dist');
const distPage = (ed) => path.join(DIST, ed.path.replace(/^\//, ''), 'index.html');
const decode = (s) => s.replace(/<[^>]+>/g, '').replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos|nbsp);/gi, (_, e) => (e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1)) : { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }[e.toLowerCase()])).replace(/\s+/g, ' ').trim();
/** An edition's numbered sources, read from its built page (ours, generated), or null before a build. */
function sourcesOf(ed) {
  const f = distPage(ed);
  if (!fs.existsSync(f)) return null;
  const ol = /<ol[^>]*class="[^"]*\bsources\b[^"]*"[^>]*>([\s\S]*?)<\/ol>/.exec(fs.readFileSync(f, 'utf8'));
  return ol ? [...ol[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => decode(m[1].replace(/^\s*<span class="[^"]*\bn\b[^"]*">[^<]*<\/span>/, ''))) : [];
}
/** Our own source cites one of our pages as "<Title>, <date>, this site ...". */
const ownEdition = (text) => (/\bthis site\b/.test(text) ? EDITIONS.find((e) => text.startsWith(`${e.title}, ${e.dateLabel}`)) : null) || null;
/** The source entry should name the URL's site; a weak check, so a mismatch warns and a person looks. */
function namesHost(text, url) {
  const t = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  const labels = new URL(url).hostname.toLowerCase().replace(/^www\./, '').split('.');
  const generic = /^(com|org|net|gov|edu|io|co|uk|ca|www|github|docs|blog|news|help|support|cdn|app)$/;
  return [labels.slice(0, -1).join(''), ...labels.filter((l) => l.length >= 4 && !generic.test(l))].some((l) => l && t.includes(l.replace(/[^a-z0-9]/g, '')));
}

/* ---- one shot ------------------------------------------------------------------- */
const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
const box = (bs) => (bs.length ? (({ x0, y0, x1, y1 }) => ({ x: +x0.toFixed(1), y: +y0.toFixed(1), w: +(x1 - x0).toFixed(1), h: +(y1 - y0).toFixed(1) }))(bs.reduce((u, b) => ({ x0: Math.min(u.x0, b.x), y0: Math.min(u.y0, b.y), x1: Math.max(u.x1, b.x + b.w), y1: Math.max(u.y1, b.y + b.h) }), { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity })) : null);

/** Find the words (opening a closed <details> that holds them), scroll them to 40 percent, let the page settle. */
async function locate(page, shot, height) {
  let found = await page.evaluate(FIND, { phrases: shot.hl, scope: shot.in, open: false });
  if (!found.scope) return { error: `${shot.in} is not on the page` };
  if (found.phrases.some((p) => p.hidden)) found = await page.evaluate(FIND, { phrases: shot.hl, scope: shot.in, open: true });
  const missing = found.phrases.filter((p) => !p.found).map((p) => `"${p.text}"${p.hidden ? ' (in the page but not shown: a collapsed answer, a tab or a menu; name words a reader can see)' : ''}`);
  const mode = shot.hl.length && !missing.length ? 'hl' : shot.in ? 'scope' : 'top';
  let scroll = await page.evaluate(SCROLL, { mode, scope: shot.in });
  // Lazy images and late fonts move the text after a scroll; measure where it settled, and scroll again if it moved.
  await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  await sleep(500);
  if (mode === 'hl') {
    const u = box((await page.evaluate(MEASURE)).flat());
    if (u && Math.abs(u.y + u.h / 2 - 0.4 * height) > 8 && u.h <= 0.8 * height) { scroll = await page.evaluate(SCROLL, { mode, scope: shot.in }); await sleep(300); }
  }
  return { found, scroll, opened: found.opened, error: missing.length ? `words not found on the page: ${missing.join(', ')}` : null };
}

/** The boxes as they are now, whether anything covers them, and the pictures in view. */
async function measure(page, at, height) {
  const rects = await page.evaluate(MEASURE), covers = await page.evaluate(COVER), blocks = await page.evaluate(BLOCKS);
  let k = 0;
  const hl = at.found.phrases.map((p) => {
    if (!p.found) return p;
    const boxes = rects[k] || [], u = box(boxes), covered = covers[k] || null, block = blocks[k++] || null;
    return { ...p, boxes, union: u, block, inView: !!u && u.y >= 0 && u.y + u.h <= height && u.x >= 0 && u.x + u.w <= WIDTH, covered };
  });
  const under = hl.filter((h) => h.covered).map((h) => `"${h.text}" is under ${h.covered.by}${h.covered.text ? ` ("${h.covered.text.slice(0, 60)}")` : ''}`);
  return { hl, media: await page.evaluate(MEDIA), error: at.error || (under.length ? `covered, so not on screen: ${under.join('; ')}` : null) };
}

async function settle(page) {
  await page.waitForLoadState('load', { timeout: 20000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((ok) => setTimeout(ok, 5000))])).catch(() => {});
  await sleep(800);
}

/** Every sign, from the response and from the page, that what loaded is a wall and not the document. */
function walls(status, headers, probe, asked, final, navs = []) {
  const sig = [], q = (m) => `"${m[0]}"`;
  let m;
  // A challenge that solves itself by script answers 403 or 503 first and then replaces the page: the final page
  // looks clean, so every main-frame answer before it is read too.
  const passed = navs.slice(0, -1).find((n) => [401, 403, 407, 429, 451, 503].includes(n.status) || n.challenge);
  if (passed) sig.push(`the first answer was HTTP ${passed.status}${passed.challenge ? ' (a challenge)' : ''}, then the page replaced itself: a check passed by script`);
  if ([401, 403, 407, 429, 451].includes(status) || status >= 500) sig.push(`HTTP ${status}`);
  if (status === 202 && probe.length < 200) sig.push('HTTP 202 and an empty page, the way a WAF challenge answers');
  if (headers['cf-mitigated']) sig.push(`cf-mitigated: ${headers['cf-mitigated']} (a Cloudflare challenge)`);
  if (headers['x-amzn-waf-action']) sig.push(`x-amzn-waf-action: ${headers['x-amzn-waf-action']} (an AWS WAF challenge)`);
  if (headers['x-datadome'] && status >= 400) sig.push('x-datadome (a DataDome block)');
  if ((m = CHALLENGE.exec(probe.title))) sig.push(`the title reads "${probe.title.trim()}"`);
  else if (probe.length < SHORT_PAGE && (m = CHALLENGE.exec(probe.text))) sig.push(`the page reads ${q(m)}`);
  const fr = probe.frames.find((s) => STRICT_FRAMES.test(s) || (probe.length < SHORT_PAGE && SOFT_FRAMES.test(s)));
  if (fr) sig.push(`a challenge frame from ${new URL(fr).hostname}`);
  const a = new URL(asked), f = new URL(final);
  if (LOGIN_PATH.test(f.pathname) && !LOGIN_PATH.test(a.pathname)) sig.push(`redirected to a sign-in page (${f.hostname}${f.pathname})`);
  if (probe.password && probe.length < SHORT_PAGE) sig.push('the page is a sign-in form');
  if (probe.modalPassword) sig.push('a sign-in dialog over the page');
  if ((m = LOGIN_TEXT.exec(probe.length < SHORT_PAGE ? probe.text : probe.modal))) sig.push(`the page reads ${q(m)}`);
  if (probe.notFree) sig.push('the page marks itself isAccessibleForFree: false (a paywall)');
  if (probe.paywall) sig.push(`a paywall prompt (${probe.paywall})`);
  if ((m = PAYWALL_TEXT.exec(probe.text)) || (m = PAYWALL_TEXT.exec(probe.modal))) sig.push(`the page reads ${q(m)}`);
  if ((m = ADBLOCK_TEXT.exec(probe.modal))) sig.push(`an ad-blocker prompt over the page, ${q(m)}`);
  if (f.hostname !== a.hostname && /(^|\.)(consent|guce)\./.test(f.hostname)) sig.push(`redirected to a consent wall (${f.hostname})`);
  return sig;
}

const ctxOptions = (height) => ({ viewport: { width: WIDTH, height }, deviceScaleFactor: DPR, locale: 'en-US', timezoneId: 'UTC', reducedMotion: 'reduce', serviceWorkers: 'block', acceptDownloads: false });

/** A cited source on the open web. */
async function outside(b, gate, run, rec, shot) {
  const u = new URL(shot.url), host = u.hostname.toLowerCase();
  const refuse = (kind, reason, signals = []) => { Object.assign(rec, { refused: true, refusal: kind, reason, signals }); if (kind !== 'policy') run.stopped.set(host, reason); return rec; };
  if (!/^https?:$/.test(u.protocol)) return Object.assign(rec, { error: `${u.protocol} is not the web` });
  if ([new URL(SITE.origin).hostname, `www.${new URL(SITE.origin).hostname}`].includes(host)) return Object.assign(rec, { error: 'our own site: shoot it from the build with self <n>' });
  if (NEVER.test(host)) return refuse('policy', `${host} is YouTube or a streaming service, never fetched (their terms forbid it; CLAUDE.md, override 8)`);
  if (LOCAL.test(host)) return refuse('policy', `${host} is a local or private address`);
  if (run.stopped.has(host)) return refuse('stopped', `${host} refused earlier in this run (${run.stopped.get(host)}), so it is not asked again`);
  const polite = async () => { const wait = (run.last.get(host) || 0) + Math.max(1000, (run.delay.get(host) || 0) * 1000) - Date.now(); if (wait > 0) await sleep(wait); run.last.set(host, Date.now()); };
  const ctx = await b.newContext({ ...ctxOptions(run.height), userAgent: UA, colorScheme: 'light' });
  try {
    // robots.txt, once per origin per run, asked as ourselves through the gate.
    if (!run.robots.has(u.origin)) {
      await polite();
      let r = { url: `${u.origin}/robots.txt` };
      try {
        // One more try when the connection itself drops (it did once on meshtastic.org, 2026-10-20); an HTTP answer
        // is the site speaking and is taken as given.
        const get = () => ctx.request.get(r.url, { headers: { 'user-agent': UA }, timeout: 20000, failOnStatusCode: false, maxRedirects: 5 });
        const res = await get().catch(async () => { await sleep(3000); return get(); });
        r.status = res.status();
        const body = r.status < 300 ? await res.text() : '';
        // RFC 9309, 2.3.1: a 4xx means no rules; a 5xx (and a 429, read as the site saying stop) means assume none allowed.
        r.groups = r.status >= 500 || r.status === 429 ? null : /^\s*</.test(body) ? [] : parseRobots(body);
      } catch (e) { r.groups = null; r.status = `unreachable (${e.message.split('\n')[0]})`; }
      run.robots.set(u.origin, r);
    }
    const r = run.robots.get(u.origin);
    const v = r.groups ? robotsVerdict(r.groups, u.pathname + u.search) : { allowed: false, rule: `robots.txt answered ${r.status}` };
    rec.robots = { url: r.url, status: r.status, allowed: v.allowed, rule: v.rule };
    if (v.delay) run.delay.set(host, Math.min(30, v.delay));
    if (!v.allowed) return refuse('robots', `robots.txt does not allow this agent here (${v.rule})`);

    const aborted = { never: 0, media: 0 };
    await ctx.route('**/*', (route) => {
      const q = route.request();
      const h = new URL(q.url()).hostname.replace(/^\[|\]$/g, '');
      if (NEVER.test(h) || LOCAL.test(h)) { aborted.never++; return route.abort('blockedbyclient'); }
      // No video or sound is ever downloaded for a still of a page.
      if (q.resourceType() === 'media') { aborted.media++; return route.abort('blockedbyclient'); }
      return route.continue();
    });
    const page = await ctx.newPage();
    const navs = []; // every answer the main frame took, redirects and script replacements included
    page.on('response', (r) => { try { if (r.frame() === page.mainFrame() && r.request().isNavigationRequest()) navs.push({ url: r.url(), status: r.status(), challenge: !!r.headers()['cf-mitigated'] }); } catch { /* a worker's response has no frame */ } });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    ctx.on('page', (p) => { if (p !== page) p.close().catch(() => {}); });
    await polite();
    const t0 = Date.now();
    let res = null;
    try { res = await page.goto(shot.url, { waitUntil: 'domcontentloaded', timeout: 45000 }); } catch (e) {
      const msg = e.message.split('\n')[0];
      if (/download/i.test(msg)) return refuse('download', 'the URL starts a download (a PDF?), not a page: a document is shot from its file, by another route');
      return refuse('load', `did not load: ${msg}`);
    }
    await settle(page);
    rec.ms = { load: Date.now() - t0 };
    const headers = res ? res.headers() : {};
    Object.assign(rec, { finalUrl: page.url(), status: res ? res.status() : null, contentType: headers['content-type'] || null });
    let probe = await page.evaluate(PROBE, { paywallSel: PAYWALL_SEL, modalSel: MODAL_SEL });
    Object.assign(rec, { title: probe.title.trim() || null, publisher: probe.publisher || probe.titleTail, publisherFrom: probe.publisher ? 'meta' : probe.titleTail ? 'title' : null,
      author: probe.author, published: probe.published, canonical: probe.canonical });
    const finish = () => Object.assign(rec, { aborted, navigations: navs });
    let sig = walls(rec.status, headers, probe, shot.url, page.url(), navs);
    if (sig.length) return finish(), refuse('wall', sig[0], sig);
    if (rec.status === 404 || rec.status === 410) return finish(), Object.assign(rec, { error: `HTTP ${rec.status}: the URL is wrong or gone; fix it in the cut list` });
    rec.clean = { on: run.clean, cmp: 0, ads: 0, banners: 0 };
    const tidy = async () => { if (run.clean) for (const [k, n] of Object.entries(await page.evaluate(CLEAN, { cmp: CMP, ads: AD_SLOTS }))) rec.clean[k] += n; };
    await tidy();
    const at = await locate(page, shot, run.height);
    if (!at.found) return finish(), Object.assign(rec, { error: at.error });
    // A banner that arrives late (GitBook's comes after a few seconds) is hidden before the shot, not left over the words.
    await tidy();
    // A wall that waits for a scroll (a metered paywall, a late challenge) is still a wall.
    probe = await page.evaluate(PROBE, { paywallSel: PAYWALL_SEL, modalSel: MODAL_SEL });
    sig = walls(rec.status, headers, probe, shot.url, page.url(), navs);
    if (sig.length) return finish(), refuse('wall', `after the scroll: ${sig[0]}`, sig);
    const m = await measure(page, at, run.height);
    Object.assign(rec, { scroll: at.scroll, opened: at.opened, hl: m.hl, media: m.media, error: m.error });
    await shoot(page, rec, run);
    rec.ms.total = Date.now() - t0;
    return finish();
  } finally { await ctx.close(); }
}

/** One of our own pages, served from dist/ with the network closed. */
async function ours(b, gate, run, rec, shot, slug) {
  let ed = shot.page ? edition(shot.page) : edition(slug);
  if (shot.page && !ed) return Object.assign(rec, { error: `${shot.page} is not one of our editions` });
  if (shot.src) {
    const list = sourcesOf(edition(slug));
    if (!list) return Object.assign(rec, { error: 'no build to read the sources from: run npm run build first' });
    const text = list[+shot.src - 1];
    if (!text) return Object.assign(rec, { error: `source ${shot.src} is not in the edition's list (it has ${list.length})` });
    ed = ownEdition(text);
    rec.source = { n: shot.src, text: text.slice(0, 240) };
    if (!ed) return Object.assign(rec, { error: `source ${shot.src} is not one of our pages (it reads "${text.slice(0, 80)}...")` });
  }
  const file = distPage(ed);
  if (!fs.existsSync(file)) return Object.assign(rec, { error: `${path.relative(ROOT, file)} is not built: run npm run build first` });
  const bytes = fs.readFileSync(file);
  Object.assign(rec, { page: ed.slug, url: abs(ed.path), finalUrl: abs(ed.path), status: 200, publisher: SITE.name, servedFrom: path.relative(ROOT, file),
    built: { sha256: crypto.createHash('sha256').update(bytes).digest('hex'), mtime: fs.statSync(file).mtime.toISOString() } });
  gate.closed = true; // a self shot has no network: the context is offline and the gate refuses anything that tries
  const offsite = [];
  const ctx = await b.newContext({ ...ctxOptions(run.height), offline: true, colorScheme: 'dark' });
  try {
    await ctx.route('**/*', (route) => {
      const u = new URL(route.request().url());
      if (u.host !== 'local.test') { offsite.push(u.href); return route.abort('blockedbyclient'); }
      let f = path.resolve(DIST, '.' + decodeURIComponent(u.pathname));
      if (!f.startsWith(DIST + path.sep) && f !== DIST) return route.fulfill({ status: 404, body: '' });
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ status: 200, contentType: MIME[path.extname(f).slice(1)] || 'application/octet-stream', body: fs.readFileSync(f) });
    });
    const page = await ctx.newPage();
    const t0 = Date.now();
    await page.goto(`http://local.test${ed.path}/`, { waitUntil: 'load', timeout: 30000 });
    // The brand faces must be the ones in the shot (CLAUDE.md, Findings 1: fonts.ready resolves when nothing loaded).
    await page.evaluate(() => Promise.all([document.fonts.load("800 40px 'Bricolage Grotesque'"), document.fonts.load("500 10px 'Martian Mono'")]));
    if (!(await page.evaluate(() => document.fonts.check("800 40px 'Bricolage Grotesque'") && document.fonts.check("500 10px 'Martian Mono'")))) return Object.assign(rec, { error: 'the brand faces did not load from dist/fonts' });
    await sleep(300);
    rec.title = await page.title();
    const at = await locate(page, shot, run.height);
    if (!at.found) return Object.assign(rec, { error: at.error });
    const m = await measure(page, at, run.height);
    Object.assign(rec, { scroll: at.scroll, opened: at.opened, hl: m.hl, media: m.media, error: m.error });
    await shoot(page, rec, run);
    rec.ms = { total: Date.now() - t0 };
    return Object.assign(rec, { offsite });
  } finally { await ctx.close(); gate.closed = false; }
}

async function shoot(page, rec, run) {
  const png = await page.screenshot({ type: 'png', animations: 'disabled', caret: 'hide' });
  fs.writeFileSync(path.join(run.out, `${rec.name}.png`), png);
  // The pictures counted again once the PNG exists: a lazy image that arrived between the measure and the shot is
  // in the PNG and must be in the list the render crops by. One counted that never showed costs only a crop.
  const seen = new Set(rec.media.map((m) => `${m.kind},${m.x},${m.y},${m.w},${m.h}`));
  for (const m of await page.evaluate(MEDIA)) if (!seen.has(`${m.kind},${m.x},${m.y},${m.w},${m.h}`)) rec.media.push(m);
  Object.assign(rec, { png: `${rec.name}.png`, pngSha256: crypto.createHash('sha256').update(png).digest('hex') });
}

/* ---- the run -------------------------------------------------------------------- */
/**
 * Shoot each parsed shot for an edition, one at a time, at least a second apart on any one host (longer if its
 * robots.txt asks). Returns the records, each also written as <name>.json in `out`.
 */
export async function capture(slug, shots, { out = path.join(ROOT, 'brand/youtube', slug, 'pages'), clean = true, height = HEIGHT, log = console.log } = {}) {
  const ed = edition(slug);
  if (!ed) throw new Error(`capture: ${slug} is not one of our editions`);
  fs.mkdirSync(out, { recursive: true });
  const gate = await openGate();
  const run = { out, clean, height, stopped: new Map(), robots: new Map(), last: new Map(), delay: new Map() };
  // <-loopback> takes away Chromium's own exception for 127.0.0.1, so a page's request for this machine meets the gate too.
  const b = await browser({ proxy: { server: gate.url, bypass: '<-loopback>' } });
  const list = sourcesOf(ed);
  if (!list) log('capture: no build, so source numbers are not checked against the edition (npm run build)');
  const records = [];
  try {
    for (const shot of shots) {
      const name = shotName(slug, shot, { clean, height });
      const rec = { slug, name, tag: shot.tag, src: shot.src, self: shot.self, page: shot.page, in: shot.in, url: shot.url, finalUrl: null, status: null,
        title: null, publisher: null, author: null, published: null, readAt: new Date().toISOString(), ua: shot.self ? null : UA,
        viewport: { width: WIDTH, height, dpr: DPR }, scroll: null, hl: [], media: [], refused: false, refusal: null, reason: null, signals: [],
        error: null, png: null };
      for (const ext of ['png', 'json']) fs.rmSync(path.join(out, `${name}.${ext}`), { force: true }); // nothing stale survives a re-shoot
      if (!shot.self && list) {
        const text = list[+shot.src - 1];
        rec.source = text ? { n: shot.src, text: text.slice(0, 240), namesHost: namesHost(text, shot.url) } : null;
        if (!text) rec.error = `source ${shot.src} is not in the edition's list (it has ${list.length})`;
      }
      gate.reset();
      try {
        if (!rec.error) await (shot.self ? ours(b, gate, run, rec, shot, slug) : outside(b, gate, run, rec, shot));
      } catch (e) { rec.error = `capture failed: ${e.message.split('\n')[0]}`; }
      // What this shot's browser reached and what the gate turned away: the proof that nothing went where it may not.
      Object.assign(rec, { hosts: { ...gate.hosts }, refusedHosts: { ...gate.refused } });
      rec.ok = !rec.refused && !rec.error && !!rec.png;
      fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify(rec, null, 2) + '\n');
      records.push(rec);
      const where = shot.self ? `self ${rec.page || shot.page || slug}${shot.in || ''}` : new URL(shot.url).hostname;
      const said = rec.ok ? `captured, ${rec.hl.length ? `${rec.hl.filter((h) => h.found).length} of ${rec.hl.length} phrase(s) boxed` : 'framed'}${rec.hl.some((h) => h.found && !h.inView) ? ' (one runs out of frame)' : ''}`
        : rec.refused ? `REFUSED (${rec.refusal}): ${rec.reason}` : `FAILED: ${rec.error}`;
      log(`capture: ${(shot.src || '--').padEnd(3)} ${where}  ${said}${rec.png ? `  ${path.relative(ROOT, path.join(out, rec.png))}` : ''}`);
      if (rec.source && rec.source.namesHost === false) log(`capture:     the source entry does not name ${new URL(shot.url).hostname}; check this is the edition's cited document`);
      if (rec.offsite?.length) log(`capture:     ${rec.offsite.length} request(s) left the build and were refused: ${rec.offsite.slice(0, 3).join(', ')}`);
    }
  } finally { await b.close(); await gate.close(); }
  return records;
}

// The page probes and the gate, so a harness can drive them against synthetic pages with no network.
export const internals = { PROBE, CLEAN, FIND, MEASURE, COVER, BLOCKS, MEDIA, walls, locate, measure, openGate, PAYWALL_SEL, MODAL_SEL, CMP, AD_SLOTS };

/* ---- the command ---------------------------------------------------------------- */
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const argv = process.argv.slice(2), tags = [], flag = (n) => argv.includes(n);
  let slug = null, cuts = null, out, height = HEIGHT;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--page') tags.push(argv[++i]);
    else if (a === '--cuts') cuts = argv[++i];
    else if (a === '--out') out = path.resolve(argv[++i]);
    else if (a === '--height') height = +argv[++i];
    else if (a === '--raw') continue;
    else if (!a.startsWith('--') && !slug) slug = a;
    else { console.error(`capture: unknown argument ${a}`); process.exit(1); }
  }
  if (!slug || (!tags.length && !cuts) || !(height >= 600 && height <= 4000)) {
    console.error('usage: node tools/capture.mjs <slug> --page "<tag>" [--page ...] [--cuts <file>] [--raw] [--height <px, 600 to 4000>] [--out <dir>]');
    process.exit(1);
  }
  let sources = {};
  if (cuts) { const c = cutsPages(cuts); sources = c.sources; tags.push(...c.tags); }
  let shots;
  try { shots = tags.map((t) => parsePage(t, sources)); } catch (e) { console.error(`capture: ${e.message}`); process.exit(1); }
  const records = await capture(slug, shots, { out, clean: !flag('--raw'), height });
  const n = (f) => records.filter(f).length;
  console.log(`capture: ${records.length} shot(s): ${n((r) => r.ok)} captured, ${n((r) => r.refused)} refused, ${n((r) => !r.ok && !r.refused)} failed`);
  process.exit(n((r) => !r.ok && !r.refused) ? 1 : 0);
}
