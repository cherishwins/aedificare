#!/usr/bin/env node
/**
 * Screenshots of the documents a film shows (CLAUDE.md, override 8): a cited
 * source as its publisher serves it, with the quoted words found and boxed so
 * the render can sweep them in Acid, or a stretch of our own built page.
 * This is the capture half of the `page` shot; the render half puts the PNG
 * on Void and falls back to a computed quote card when a capture is refused.
 *
 *   node tools/capture.mjs <slug> --page "<tag>" [--page "<tag>" ...] [--cuts <file>] [--raw] [--height <px>] [--out <dir>]
 *   node tools/capture.mjs source/episodes/<slug>.md [--page "<tag>" ...] [--raw] [--height <px>] [--out <dir>]
 *
 * <tag> is what follows `page:` in a cut list's [[page: ...]]:
 *   07 | hl: These are PHY rates | url: https://www.morsemicro.com/products/chips/
 *   self 11 | in: #ledger | hl: 43.3 Mbps at the physical layer   (source 11 is one of our pages)
 *   self #stands | hl: ...                                         (this edition's own page, element #stands)
 *   self edition-03#ledger                                         (another of our pages, framed at the element)
 * `hl:` may be given more than once (one picture, two related steps). `in:` limits the search to one element and,
 * with no `hl:`, frames it. The pages cite their sources as text, not links (CLAUDE.md, "Block links only"), so an
 * outside source's URL comes from `url:` or from the cut list's `# Sources` line, `- 07 | <url> | read <date>`.
 * --cuts reads that section and every [[page: ...]] tag in the file. `by:` is the render's (the author its label
 * credits) and is carried, not shot: it names no file, so a credit changed is not a page shot again.
 * An EPISODE's script (source/episodes/<slug>.md, 2026-10-26) names its sources `s3`, and its `# Sources` line gives the
 * URL (`- s3 | publisher | title | date | url`, FORMAT.md); with no --page every [[page: ...]] tag in the script is
 * shot, into brand/youtube/ep-<slug>/pages/, where tools/episode.mjs reads them. An episode has no page of its own,
 * so `self` there names one of our pages whole (self edition-03#ledger), never a source number.
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
 * row it sits in, and `blk`, its block in `layout`: every line of text in view, the blocks as a tree and the boxes
 * the page draws that hold no text (LAYOUT), so the render can snap its crop to the words' block and keep its edges
 * out of a neighbour's text (pageCrop in tools/lib/shots.mjs). `media` lists the
 * pictures in view, so the render can crop a news photograph out and show only the words; on someone else's page
 * every one of them but inline SVG is painted Void in the PNG itself (`masked` counts them), because that PNG is
 * filed on a public Release, and no copy of a photograph should exist to file. A refused shot writes its JSON and
 * no PNG.
 * Exit 1 when a shot failed (its words are not on the page, the URL is gone, the tag is wrong); a refusal is an
 * answer, not a failure, because the render has a fallback for it.
 */
import fs from 'node:fs';
import net from 'node:net';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { lookup as dnsLookup } from 'node:dns/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { browser, GREY_TEXT } from './lib/film.mjs';
import { SITE, abs } from '../src/config.mjs';
import { EDITIONS, edition } from '../src/lib/editions.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Honest: the tool's name, the site it works for, nothing borrowed from a browser. A site that refuses it is answered.
export const UA = `AedificareFilmBot/1.0 (+${SITE.origin})`;
const TOKEN = 'aedificarefilmbot'; // the product token a robots.txt group would name
export const WIDTH = 1440, DPR = 2, HEIGHT = 1600;

// Never fetched, whatever the page asks for: their terms forbid taking from them (override 8; the YouTube Terms).
const NEVER = /(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com|youtubei\.googleapis\.com|youtube\.googleapis\.com|googlevideo\.com|ytimg\.com|yt\d\.ggpht\.com|netflix\.com|nflxvideo\.net|nflximg\.net|nflxext\.com|nflxso\.net|primevideo\.com|disneyplus\.com|disney-plus\.net|bamgrid\.com|hulu\.com|hulustream\.com|max\.com|hbomax\.com|peacocktv\.com|paramountplus\.com|crunchyroll\.com|tv\.apple\.com|twitch\.tv|ttvnw\.net|jtvnw\.net|vimeo\.com|vimeocdn\.com|dailymotion\.com|dmcdn\.net|tiktok\.com|tiktokcdn\.com|spotify\.com|scdn\.co|soundcloud\.com|sndcdn\.com)$/i;
/** Whether a URL is one of those hosts; tools/cuts.mjs asks before it fetches a quote's source. */
export const neverFetched = (url) => { try { return NEVER.test(new URL(url).hostname); } catch { return true; } };
// A page out there has no business reaching this machine or its network (the gate, the sandbox's proxy, a cloud's
// metadata address): loopback, private, shared, link-local, multicast and reserved ranges. A BlockList reads an
// IPv4-mapped IPv6 address (::ffff:7f00:1) as the IPv4 address it carries, which a pattern on the text did not.
const PRIVATE = new net.BlockList();
for (const [a, n] of [['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['224.0.0.0', 3]]) PRIVATE.addSubnet(a, n, 'ipv4');
for (const [a, n] of [['::', 96], ['fc00::', 7], ['fe80::', 10], ['fec0::', 10], ['ff00::', 8]]) PRIVATE.addSubnet(a, n, 'ipv6');
const bare = (host) => String(host).replace(/^\[|\]$/g, '').replace(/%.*$/, '').replace(/\.$/, '').toLowerCase();
/** A local name, or an address literal in a local range, however it is spelled; a name is resolved by the gate. */
export function isLocal(host) {
  const h = bare(host), v = net.isIP(h);
  if (!v) return h === 'localhost' || h.endsWith('.localhost');
  try { return PRIVATE.check(h, v === 6 ? 'ipv6' : 'ipv4'); } catch { return true; }
}
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
/**
 * One [[page: ...]] body, with `sources` (number, or an episode's id, to URL) from the cut list or the script. Throws
 * on a tag that cannot be shot. `by:` is kept for the render's label and is not part of the shot.
 */
export function parsePage(body, sources = {}) {
  const [head, ...fields] = String(body).split('|').map((x) => x.trim());
  const shot = { tag: String(body).trim(), self: false, src: null, page: null, url: null, in: null, hl: [], by: null };
  for (const f of fields) {
    const kv = /^(hl|in|url|by)\s*:\s*([\s\S]*)$/.exec(f);
    if (!kv) throw new Error(`page: unknown field "${f}" (hl:, in:, url: and by: are the fields)`);
    const v = kv[2].trim().replace(/^["\u201c](.*)["\u201d]$/, '$1');
    if (kv[1] === 'hl') shot.hl.push(v); else shot[kv[1]] = v;
  }
  let m;
  if ((m = /^self\s+(\d{1,3})(#[\w-]+)?$/.exec(head))) { shot.self = true; shot.src = m[1].padStart(2, '0'); if (m[2]) shot.in = shot.in ? scopeClash(head) : m[2]; }
  else if ((m = /^self\s+([a-z][a-z0-9-]*)?(#[\w-]+)?$/.exec(head)) && (m[1] || m[2])) { shot.self = true; shot.page = m[1] || null; if (m[2]) shot.in = shot.in ? scopeClash(head) : m[2]; }
  else if ((m = /^(\d{1,3})$/.exec(head))) { shot.src = m[1].padStart(2, '0'); shot.url = shot.url || sources[shot.src] || null; }
  else if ((m = /^(s\d+)$/.exec(head))) { shot.src = m[1]; shot.url = shot.url || sources[shot.src] || null; }
  else throw new Error(`page: "${head}" is neither a source number (07, or an episode's s3) nor self <n>, self #<id> or self <slug>#<id>`);
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

/**
 * An episode script's slug, sources and page tags (the format of source/episodes/<slug>.md, FORMAT.md): the
 * `# Sources` section runs to the next `##`, each line `- sN | publisher | title | date | url`, and the URL is the
 * last field, as tools/episode.mjs reads it.
 */
export function episodePages(file) {
  const src = fs.readFileSync(file, 'utf8');
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(src);
  const slug = (fm && /^slug\s*:\s*(.+)$/m.exec(fm[1])?.[1].trim()) || path.basename(file, '.md');
  const sources = {};
  let inSources = false;
  for (const line of src.replace(/<!--[\s\S]*?-->/g, '').split('\n')) {
    if (/^#\s+sources\b/i.test(line)) { inSources = true; continue; }
    if (/^##\s/.test(line)) { inSources = false; continue; }
    const m = inSources && /^-\s*(s\d+)\s*\|(.+)$/.exec(line.trim());
    if (m) sources[m[1]] = m[2].split('|').map((x) => x.trim()).pop();
  }
  const tags = [...src.replace(/<!--[\s\S]*?-->/g, '').matchAll(/\[\[page:\s*([\s\S]*?)\]\]/g)].map((m) => m[1].replace(/\s+/g, ' ').trim());
  return { slug, sources, tags };
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
 *
 * Nothing local gets through, however it is spelled: an address literal in a local range (::ffff:7f00:1 is
 * 127.0.0.1), and a name that resolves to one (localtest.me, 127.1), which the gate resolves itself before it
 * connects, every request and every tunnel, then connects to the very addresses it checked, so a second answer
 * cannot differ. Behind an upstream proxy the upstream resolves: a name this machine cannot resolve (this sandbox
 * has no DNS of its own) goes to it by name, and its network, not this machine's, is where the name lands.
 * `lookup` is dns.lookup unless a harness gives its own.
 */
async function openGate({ lookup = dnsLookup } = {}) {
  let up = null;
  try { up = process.env.HTTPS_PROXY || process.env.https_proxy ? new URL(process.env.HTTPS_PROXY || process.env.https_proxy) : null; } catch { up = null; }
  const auth = up && up.username ? `Proxy-Authorization: Basic ${Buffer.from(`${decodeURIComponent(up.username)}:${decodeURIComponent(up.password)}`).toString('base64')}\r\n` : '';
  const gate = { closed: false, hosts: {}, refused: {} };
  /** Why a host is refused, or the addresses to connect to (null: by name, through the upstream). */
  const why = async (raw) => {
    const host = bare(raw);
    if (gate.closed) return { no: 'closed' };
    if (NEVER.test(host)) return { no: 'never' };
    if (isLocal(host)) return { no: 'local' };
    if (net.isIP(host)) return { addrs: [{ address: host, family: net.isIP(host) }] };
    let addrs;
    try { addrs = await lookup(host, { all: true, order: 'verbatim' }); } catch { return up ? { addrs: null } : { no: 'unresolved' }; }
    if (!addrs.length) return up ? { addrs: null } : { no: 'unresolved' };
    if (addrs.some((a) => isLocal(a.address))) return { no: 'local' };
    return { addrs };
  };
  // Connect to what was checked: net's own lookup is replaced by the answer the gate already judged.
  const pinned = (addrs) => (h, o, cb) => (o && o.all ? cb(null, addrs) : cb(null, addrs[0].address, addrs[0].family));
  const tally = (host, no) => { const t = no ? gate.refused : gate.hosts; const k = host.toLowerCase(); t[k] = (t[k] || 0) + 1; };
  const sockets = new Set();
  const server = http.createServer(async (req, res) => {
    let u;
    try { u = new URL(req.url); } catch { res.writeHead(400).end(); return; }
    const v = await why(u.hostname);
    tally(u.hostname, v.no);
    if (v.no) { res.writeHead(403).end(); return; }
    const opt = up
      ? { host: up.hostname, port: up.port || 80, path: req.url, method: req.method, headers: { ...req.headers, ...(auth ? { 'proxy-authorization': auth.slice(21, -2) } : {}) } }
      : { host: bare(u.hostname), port: u.port || 80, path: u.pathname + u.search, method: req.method, headers: req.headers, lookup: pinned(v.addrs) };
    const out = http.request(opt, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
    out.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
    req.pipe(out);
  });
  server.on('connection', (s) => { sockets.add(s); s.on('close', () => sockets.delete(s)); });
  server.on('connect', async (req, sock, head) => {
    sock.on('error', () => {});
    const m = /^\[?([^\]]+?)\]?:(\d+)$/.exec(req.url || '');
    if (!m) { sock.end('HTTP/1.1 400 Bad Request\r\n\r\n'); return; }
    const [, host, port] = m, v = await why(host);
    tally(host, v.no);
    if (v.no) { sock.end('HTTP/1.1 403 Forbidden\r\n\r\n'); return; }
    const join = (out, rest) => {
      sock.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (rest && rest.length) sock.write(rest);
      if (head && head.length) out.write(head);
      out.pipe(sock); sock.pipe(out);
    };
    const target = host.includes(':') ? `[${host}]:${port}` : `${host}:${port}`;
    const out = up ? net.connect(+(up.port || 80), up.hostname) : net.connect({ port: +port, host: bare(host), lookup: pinned(v.addrs) });
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
 * The page's text as it lies in view, for the render's crop (pageCrop in tools/lib/shots.mjs): every line of visible
 * text as one box a block and a line, with its font size and the block it belongs to, and those blocks as a tree
 * (tag, display, border box, padding, the borders it draws, `fill` where it paints a background of its own and
 * `shadow` where a shadow draws its outline, `radius`, its largest rounded corner, a list
 * marker's font size, parent), with `words`, each phrase's own block, and `frames`, the boxes the page draws that
 * hold no text (a search field, an empty card, a painted panel, a rule down a side). A crop that knows where every
 * other block's text lies can snap to the words' paragraph, list item, row, cell or card and keep its edges out of
 * the text beside it; the first version knew only the words' block, and its 40 px of margin took a letter of The
 * Floor's rail and the ends of Morse Micro's neighbouring card into the frame (2026-10-20). A line is cut by every
 * ancestor that clips it, as a picture is (MEDIA); visually hidden text (a 1 px box, clip: rect(0 0 0 0)) is not text
 * anyone sees, so it is left out.
 */
const LAYOUT = () => {
  const vw = innerWidth, vh = innerHeight, ids = new Map(), blocks = [], clips = new Map();
  const r1 = (v) => +(+v).toFixed(1);
  const inl = (el) => /^(inline|contents|ruby)/.test(getComputedStyle(el).display);
  const blockOf = (el) => { while (el && el !== document.body && el !== document.documentElement && inl(el)) el = el.parentElement; return el && el !== document.documentElement ? el : document.body; };
  // A border drawn on the page (a box's rule, a rail): its width a side, or 0 where none shows.
  const bdOf = (s) => ['Top', 'Right', 'Bottom', 'Left'].map((d) => (s[`border${d}Style`] === 'none' || s[`border${d}Style`] === 'hidden' || /rgba\([^)]*,\s*0\)$|transparent/.test(s[`border${d}Color`]) ? 0 : r1(parseFloat(s[`border${d}Width`]) || 0)));
  // A box the page paints: a gradient, or a background colour that differs from what lies behind it (the nearest
  // ancestor's opaque background, else the canvas). A box that only repeats the colour behind it draws nothing.
  // Seeed's quote button is a gradient with no border, Meshtastic's note a grey fill with one rule down its left
  // (2026-10-20); neither was a box to the crop while it counted borders on three sides.
  const rgba = (c) => { const m = /rgba?\(([^)]*)\)/.exec(c || ''); if (!m) return null; const v = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat); return v.length >= 3 ? [v[0], v[1], v[2], v.length > 3 ? v[3] : 1] : null; };
  const canvas = (() => { for (const el of [document.documentElement, document.body]) { const c = el && rgba(getComputedStyle(el).backgroundColor); if (c && c[3] >= 0.5) return c; } return [255, 255, 255, 1]; })();
  const behind = (el) => { for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) { const c = rgba(getComputedStyle(a).backgroundColor); if (c && c[3] >= 0.5) return c; } return canvas; };
  // A shadow draws a box's outline even where its ground is the page's own (Meshtastic's notes, a near-white fill
  // under a soft shadow and rounded corners): any layer with a visible colour and a length that is not zero.
  const shadowed = (s) => !!s.boxShadow && s.boxShadow !== 'none' && s.boxShadow.split(/,(?![^(]*\))/).some((layer) => {
    const c = rgba(layer);
    return !!c && c[3] > 0.02 && layer.replace(/rgba?\([^)]*\)/, '').trim().split(/\s+/).map(parseFloat).some((v) => Number.isFinite(v) && v !== 0);
  });
  const paints = (el, s) => {
    if (/gradient\(/.test(s.backgroundImage)) return true;
    const c = rgba(s.backgroundColor);
    if (!c || c[3] < 0.05) return false;
    const b = behind(el);
    return Math.max(...[0, 1, 2].map((i) => Math.abs(c[i] * c[3] + b[i] * (1 - c[3]) - b[i]))) >= 4;
  };
  const id = (el) => {
    if (ids.has(el)) return ids.get(el);
    const k = blocks.length;
    ids.set(el, k); blocks.push(null);
    const s = getComputedStyle(el), b = el.getBoundingClientRect(), px = (v) => r1(parseFloat(v) || 0);
    const parent = el === document.body ? -1 : id(blockOf(el.parentElement));
    const bd = bdOf(s);
    blocks[k] = { tag: el.tagName.toLowerCase(), display: s.display, x: r1(b.left), y: r1(b.top), w: r1(b.width), h: r1(b.height),
      pad: [px(s.paddingTop), px(s.paddingRight), px(s.paddingBottom), px(s.paddingLeft)], bd, parent,
      ...(el !== document.body && paints(el, s) ? { fill: 1 } : {}), ...(el !== document.body && shadowed(s) ? { shadow: 1 } : {}),
      // A rounded corner curves inside the box, so a crop that stops on the box's edge shows the curve.
      ...(() => { const r = Math.max(...['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map((c) => parseFloat(s[`border${c}Radius`]) || 0)); return r > 0 ? { radius: r1(r) } : {}; })(),
      // A list item's marker hangs outside its box, where no text line records it: its font size says how far.
      ...(s.display === 'list-item' && s.listStyleType !== 'none' && s.listStylePosition === 'outside' ? { marker: px(s.fontSize) } : {}) };
    return k;
  };
  // What of an element's box any clipping ancestor (or the element itself) lets show, or null when nothing does.
  const clipOf = (el) => {
    if (clips.has(el)) return clips.get(el);
    let c = { x0: -Infinity, y0: -Infinity, x1: Infinity, y1: Infinity };
    if (el && el !== document.body && el !== document.documentElement) {
      const up = getComputedStyle(el).position === 'fixed' ? c : clipOf(el.parentElement);
      const s = getComputedStyle(el), b = el.getBoundingClientRect();
      if (!up || (s.position === 'absolute' && /^rect\(0(px)?,? 0(px)?,? 0(px)?,? 0(px)?\)$/.test(s.clip)) || (s.overflow !== 'visible' && (b.width <= 2 || b.height <= 2))) c = null;
      else {
        c = { ...up };
        if (s.overflowX !== 'visible') { c.x0 = Math.max(c.x0, b.left); c.x1 = Math.min(c.x1, b.right); }
        if (s.overflowY !== 'visible') { c.y0 = Math.max(c.y0, b.top); c.y1 = Math.min(c.y1, b.bottom); }
        if (c.x1 - c.x0 < 1 || c.y1 - c.y0 < 1) c = null;
      }
    }
    clips.set(el, c);
    return c;
  };
  const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|IFRAME|OBJECT|TEXTAREA|SELECT|OPTION)$/;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.nodeType === 3 ? (/\S/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
      : SKIP.test(n.tagName.toUpperCase()) || (n.checkVisibility && getComputedStyle(n).display !== 'contents' && !n.checkVisibility({ checkVisibilityCSS: true })) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP),
  });
  const lines = [], range = document.createRange();
  for (let n; (n = w.nextNode());) {
    const el = n.parentElement, c = clipOf(el);
    if (!c) continue;
    const b = id(blockOf(el)), f = r1(parseFloat(getComputedStyle(el).fontSize) || 16);
    range.selectNodeContents(n);
    for (const x of range.getClientRects()) {
      const x0 = Math.max(x.left, c.x0, 0), y0 = Math.max(x.top, c.y0, 0), x1 = Math.min(x.right, c.x1, vw), y1 = Math.min(x.bottom, c.y1, vh);
      if (x1 - x0 < 2 || y1 - y0 < 2) continue;
      // One box a block and a line: the next fragment of the same block on the same line, within an em, joins it.
      const l = lines[lines.length - 1];
      if (l && l.b === b && Math.abs(l.y - y0) < 1 && Math.abs(l.y + l.h - y1) < 1 && x0 >= l.x - 0.5 && x0 - (l.x + l.w) < f) { l.w = r1(Math.max(l.x + l.w, x1) - l.x); l.f = Math.max(l.f, f); continue; }
      lines.push({ x: r1(x0), y: r1(y0), w: r1(x1 - x0), h: r1(y1 - y0), f, b });
    }
  }
  // Boxes the page draws that hold no text a line records: a search field, a button of icons, an empty card, a panel
  // painted behind a gallery, a divider down a side. A crop that halves one shows a stray frame at its edge (Morse
  // Micro's search box under its release notes' list), and one beside the words is a change of background a margin
  // must stop at (a grey strip down the left of Seeed's product text, 2026-10-20). A rule across the top or bottom
  // alone (a horizontal rule) is not a box: cut, it runs off the side as a table's own rows do.
  const frames = [];
  for (const el of document.querySelectorAll('body *')) {
    if (SKIP.test(el.tagName) && !/^(TEXTAREA|SELECT)$/.test(el.tagName)) continue;
    const s = getComputedStyle(el), control = /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName) && s.display !== 'none';
    const bd = bdOf(s), sides = bd.filter((v) => v > 0).length;
    if (!control && sides < 3 && !bd[1] && !bd[3] && !paints(el, s) && !shadowed(s)) continue;
    if (!control && /\S/.test(el.innerText || '')) continue;
    if (el.checkVisibility && !el.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true })) continue;
    const c = clipOf(el), b = el.getBoundingClientRect();
    if (!c) continue;
    const x0 = Math.max(b.left, c.x0, 0), y0 = Math.max(b.top, c.y0, 0), x1 = Math.min(b.right, c.x1, vw), y1 = Math.min(b.bottom, c.y1, vh);
    // Under 8 px a side is an icon; a divider down a side is one rule wide and still a mark.
    if (x1 - x0 < (bd[1] || bd[3] ? 0.5 : 8) || y1 - y0 < 8) continue;
    frames.push({ x: r1(x0), y: r1(y0), w: r1(x1 - x0), h: r1(y1 - y0) });
  }
  const words = (window.__aedRanges || []).map((r) => id(blockOf(r.commonAncestorContainer.nodeType === 1 ? r.commonAncestorContainer : r.commonAncestorContainer.parentElement)));
  return { blocks, lines, frames, words };
};

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
export function sourcesOf(ed) {
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
  const layout = await page.evaluate(LAYOUT);
  hl.forEach((h, i) => { if (h.found) h.blk = layout.words[at.found.phrases.slice(0, i + 1).filter((p) => p.found).length - 1] ?? null; });
  return { hl, media: await page.evaluate(MEDIA), layout: { blocks: layout.blocks, lines: layout.lines, frames: layout.frames }, error: at.error || (under.length ? `covered, so not on screen: ${under.join('; ')}` : null) };
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
  if (isLocal(host)) return refuse('policy', `${host} is a local or private address`);
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
      if (NEVER.test(h) || isLocal(h)) { aborted.never++; return route.abort('blockedbyclient'); }
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
    Object.assign(rec, { scroll: at.scroll, opened: at.opened, hl: m.hl, media: m.media, layout: m.layout, error: m.error });
    await shoot(page, rec, run);
    rec.ms.total = Date.now() - t0;
    return finish();
  } finally { await ctx.close(); }
}

/** One of our own pages, served from dist/ with the network closed. */
async function ours(b, gate, run, rec, shot, slug) {
  // An episode has no page and no numbered sources of its own: its self shot names one of our pages whole.
  if (run.episode && (shot.src || !shot.page)) return Object.assign(rec, { error: 'an episode has no page of its own; name one of ours: self <slug>#<id>' });
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
    Object.assign(rec, { scroll: at.scroll, opened: at.opened, hl: m.hl, media: m.media, layout: m.layout, error: m.error });
    await shoot(page, rec, run);
    rec.ms = { total: Date.now() - t0 };
    return Object.assign(rec, { offsite });
  } finally { await ctx.close(); gate.closed = false; }
}

async function shoot(page, rec, run) {
  let png = await page.screenshot({ type: 'png', animations: 'disabled', caret: 'hide' });
  // The pictures counted again once the PNG exists: a lazy image that arrived between the measure and the shot is
  // in the PNG and must be in the list the render crops by. One counted that never showed costs only a crop.
  const seen = new Set(rec.media.map((m) => `${m.kind},${m.x},${m.y},${m.w},${m.h}`));
  for (const m of await page.evaluate(MEDIA)) if (!seen.has(`${m.kind},${m.x},${m.y},${m.w},${m.h}`)) rec.media.push(m);
  // Someone else's page is written with every picture on it painted Void, so no copy of their photograph exists to
  // file: this PNG is what the film is cut from and what recut.yml puts on the public Release pages-<slug> (spec 2.3,
  // row 5, text only; Chosen Figure). Our own pages are ours and stay whole.
  if (!rec.self) { png = paintOut(png, rec.media, (rec.viewport && rec.viewport.dpr) || DPR); rec.masked = rec.media.filter((m) => m.kind !== 'svg').length; }
  fs.writeFileSync(path.join(run.out, `${rec.name}.png`), png);
  Object.assign(rec, { png: `${rec.name}.png`, pngSha256: crypto.createHash('sha256').update(png).digest('hex') });
}

/**
 * A PNG with each picture's box (CSS px, as MEDIA measures them, clipped as they show) filled Void, through ffmpeg's
 * drawbox, which leaves every other pixel as it was (checked byte for byte on a 2880 by 3200 capture, 2026-10-20).
 * Inline SVG stays, as the render keeps it: it is the page's type and diagrams. A PNG that cannot be painted is not
 * written, so the capture fails rather than leaving a photograph in it.
 */
function paintOut(png, media, dpr) {
  const boxes = media.filter((m) => m.kind !== 'svg').map((m) => {
    const x0 = Math.max(0, Math.floor(m.x * dpr)), y0 = Math.max(0, Math.floor(m.y * dpr));
    return { x: x0, y: y0, w: Math.ceil((m.x + m.w) * dpr) - x0, h: Math.ceil((m.y + m.h) * dpr) - y0 };
  }).filter((b) => b.w > 0 && b.h > 0);
  if (!boxes.length) return png;
  const vf = boxes.map((b) => `drawbox=x=${b.x}:y=${b.y}:w=${b.w}:h=${b.h}:color=0x050A06@1:t=fill`).join(',');
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'png_pipe', '-i', 'pipe:0', '-vf', vf, '-frames:v', '1', '-f', 'image2pipe', '-c:v', 'png', 'pipe:1'], { input: png, maxBuffer: 1 << 28 });
  if (r.status !== 0 || !r.stdout || !r.stdout.length) throw new Error(`could not paint the page's pictures out (ffmpeg: ${String(r.stderr || r.error || '').trim().slice(-200)})`);
  return r.stdout;
}

/* ---- the run -------------------------------------------------------------------- */
/**
 * Shoot each parsed shot for an edition, one at a time, at least a second apart on any one host (longer if its
 * robots.txt asks). Returns the records, each also written as <name>.json in `out`. With `episode`, `slug` is an
 * episode's work name (ep-<slug>), which has no edition and no numbered source list to check the shots against.
 */
export async function capture(slug, shots, { out = path.join(ROOT, 'brand/youtube', slug, 'pages'), clean = true, height = HEIGHT, log = console.log, episode = false } = {}) {
  const ed = episode ? null : edition(slug);
  if (!episode && !ed) throw new Error(`capture: ${slug} is not one of our editions`);
  fs.mkdirSync(out, { recursive: true });
  const gate = await openGate();
  const run = { out, clean, height, episode, stopped: new Map(), robots: new Map(), last: new Map(), delay: new Map() };
  // <-loopback> takes away Chromium's own exception for 127.0.0.1, so a page's request for this machine meets the gate too.
  // Grey antialiased text (GREY_TEXT, tools/lib/film.mjs): the PNG is the picture the film shows, and Chromium's LCD
  // text put a blue and an orange fringe on every glyph of our own pages, colours the kit does not have.
  const b = await browser({ proxy: { server: gate.url, bypass: '<-loopback>' }, args: [GREY_TEXT] });
  const list = ed ? sourcesOf(ed) : null;
  if (!list && !episode) log('capture: no build, so source numbers are not checked against the edition (npm run build)');
  const records = [];
  try {
    for (const shot of shots) {
      const name = shotName(slug, shot, { clean, height });
      const rec = { slug, name, tag: shot.tag, src: shot.src, self: shot.self, page: shot.page, in: shot.in, url: shot.url, finalUrl: null, status: null,
        title: null, publisher: null, author: null, published: null, readAt: new Date().toISOString(), ua: shot.self ? null : UA,
        viewport: { width: WIDTH, height, dpr: DPR }, greyText: true, scroll: null, hl: [], media: [], refused: false, refusal: null, reason: null, signals: [],
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
export const internals = { PROBE, CLEAN, FIND, MEASURE, COVER, BLOCKS, LAYOUT, MEDIA, walls, locate, measure, shoot, openGate, PAYWALL_SEL, MODAL_SEL, CMP, AD_SLOTS };

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
  // An episode's script in place of a slug: its sources give the URLs, and its page tags are the shots unless --page names them.
  const script = slug && /\.md$/.test(slug) && fs.existsSync(slug) ? slug : null;
  if (!slug || (!tags.length && !cuts && !script) || (script && cuts) || !(height >= 600 && height <= 4000)) {
    console.error('usage: node tools/capture.mjs <slug> --page "<tag>" [--page ...] [--cuts <file>] [--raw] [--height <px, 600 to 4000>] [--out <dir>]\n       node tools/capture.mjs source/episodes/<slug>.md [--page "<tag>" ...] [--raw] [--height <px>] [--out <dir>]');
    process.exit(1);
  }
  let sources = {};
  if (cuts) { const c = cutsPages(cuts); sources = c.sources; tags.push(...c.tags); }
  if (script) { const e = episodePages(script); sources = e.sources; slug = `ep-${e.slug}`; if (!tags.length) tags.push(...e.tags); }
  if (!tags.length) { console.error(`capture: ${script} has no [[page: ...]] tag`); process.exit(1); }
  let shots;
  try { shots = tags.map((t) => parsePage(t, sources)); } catch (e) { console.error(`capture: ${e.message}`); process.exit(1); }
  const records = await capture(slug, shots, { out, clean: !flag('--raw'), height, episode: !!script });
  const n = (f) => records.filter(f).length;
  console.log(`capture: ${records.length} shot(s): ${n((r) => r.ok)} captured, ${n((r) => r.refused)} refused, ${n((r) => !r.ok && !r.refused)} failed`);
  process.exit(n((r) => !r.ok && !r.refused) ? 1 : 0);
}
