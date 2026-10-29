#!/usr/bin/env node
/**
 * The public-domain footage an episode can fetch for itself (CLAUDE.md,
 * Decisions log, 29 Oct 2026). Until then every shot was the owner's to
 * find and attach to the Release footage-<slug>, and no episode had any:
 * the footage lists traced most shots to a file URL on NASA, the Library of
 * Congress or archive.org, and nobody downloaded them. A shot whose file sits
 * on one of those archives is now fetched by the episode workflow from
 * source/episodes/<slug>.fetch.json; the owner supplies only what this may
 * not fetch (anything on YouTube, a network's recording, a film still under
 * copyright).
 *
 *   node tools/fetch-footage.mjs <manifest.json> <footage dir>
 *
 * The manifest, typed once per episode beside its script:
 *
 *   { "items": [ { "id": "pjm-night", "file": "pjm-night.jpg",
 *       "crop": "2320:1305:3990:1050",                       optional, a still only (ffmpeg w:h:x:y)
 *       "sources": [ { "url": "https://…", "credit": "NASA …, public domain" }, … ] } ] }
 *
 * What it holds to:
 * - A file the footage dir already has for the id (the owner's, from the
 *   Release) wins, matched as tools/lib/shots.mjs matches it: <id>.ext,
 *   <id>@N.ext or <id>-at-N.ext, case-blind, spaces and underscores as hyphens.
 * - Only https, and only the archives below, on every hop of a redirect, so a
 *   file cannot arrive from anywhere else. YouTube and Google's video hosts are
 *   refused by name: their terms bar downloading, and the owner fetches those.
 * - The bytes must be an image or a video by their content type and must
 *   decode (ffprobe finds a video stream), under 1.5 GB.
 * - Sources are tried in order; the first that passes is kept and its credit
 *   line goes into credits.txt, which the episode's description reads. A shot
 *   none of them supplies is left out and renders as a slate, with a warning,
 *   never a failure: a slate is how an early render shows what is missing.
 *
 * Downloads go through curl, which reads the proxy and the CA bundle a
 * sandbox gives it; Node's fetch reads neither.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ARCHIVES = [
  'archive.org',            // the Internet Archive, its *.us.archive.org data hosts included
  'images-assets.nasa.gov', 'images.nasa.gov', 'eol.jsc.nasa.gov', 'wvs.earthdata.nasa.gov',
  'tile.loc.gov',           // the Library of Congress
  'live.staticflickr.com',  // a government account's photographs (DOE posts as United States Government Work)
  'mediasvc.eurekalert.org',
];
const REFUSED = /(^|\.)(youtube\.com|youtu\.be|googlevideo\.com|ytimg\.com)$/i;
const MAX = 1.5 * 2 ** 30;

const [manifestPath, dir] = process.argv.slice(2);
if (!manifestPath || !dir) {
  console.error('usage: node tools/fetch-footage.mjs <manifest.json> <footage dir>');
  process.exit(2);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
fs.mkdirSync(dir, { recursive: true });

const gh = !!process.env.GITHUB_ACTIONS;
const warn = (m) => console.log(gh ? `::warning::${m}` : `warning: ${m}`);
const norm = (s) => s.toLowerCase().replace(/[\s_]+/g, '-');

function allowed(u) {
  let url;
  try { url = new URL(u); } catch { return 'not a URL'; }
  if (url.protocol !== 'https:') return 'not https';
  if (REFUSED.test(url.hostname)) return `${url.hostname} is never fetched here (the owner downloads from YouTube)`;
  if (!ARCHIVES.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`))) return `${url.hostname} is not one of the public-domain archives this fetches from`;
  return null;
}

function curl(url, out) {
  const r = spawnSync('curl', ['-sS', '--proto', '=https', '--max-time', '1800', '--max-filesize', String(MAX),
    '-o', out, '-w', '%{http_code}\t%{content_type}\t%{redirect_url}', url], { encoding: 'utf8' });
  if (r.status !== 0) return { error: (r.stderr || `curl exited ${r.status}`).trim() };
  const [code, type, next] = r.stdout.split('\t');
  return { code: +code, type, next };
}

/** Follows redirects one hop at a time so that every hop is checked against the archives. */
function download(url, out) {
  for (let hop = 0; hop < 6; hop++) {
    const why = allowed(url);
    if (why) return why;
    const r = curl(url, out);
    if (r.error) return r.error;
    if (r.code >= 300 && r.code < 400 && r.next) { url = r.next; continue; }
    if (r.code !== 200) return `HTTP ${r.code}`;
    if (!/^(image|video)\//i.test(r.type)) return `answered ${r.type || 'no content type'}, not an image or a video`;
    return null;
  }
  return 'too many redirects';
}

const decodes = (file) => spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
  '-of', 'csv=p=0', file], { encoding: 'utf8' }).stdout.trim();

const have = fs.readdirSync(dir);
const credits = path.join(dir, 'credits.txt');
const credited = new Set((fs.existsSync(credits) ? fs.readFileSync(credits, 'utf8') : '').split('\n')
  .map((l) => norm(l.split(':')[0].trim())).filter(Boolean));
let fetched = 0, kept = 0, missing = 0;

for (const it of manifest.items) {
  const id = norm(it.id);
  if (have.some((f) => [`${id}.`, `${id}@`, `${id}-at-`].some((p) => norm(f).startsWith(p)))) {
    console.log(`${it.id}: the owner's file is in place, kept`);
    kept++;
    continue;
  }
  let done = false;
  for (const src of it.sources) {
    const tmp = path.join(dir, `.part-${it.file}`);
    const why = download(src.url, tmp);
    if (why) { fs.rmSync(tmp, { force: true }); warn(`${it.id}: ${src.url} refused: ${why}`); continue; }
    const dims = decodes(tmp);
    if (!dims) { fs.rmSync(tmp, { force: true }); warn(`${it.id}: ${src.url} does not decode as a picture`); continue; }
    const out = path.join(dir, it.file);
    if (it.crop) {
      const c = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-vf', `crop=${it.crop}`, '-q:v', '2', out]);
      fs.rmSync(tmp, { force: true });
      if (c.status !== 0) { warn(`${it.id}: the crop ${it.crop} failed on ${dims}`); continue; }
    } else fs.renameSync(tmp, out);
    if (!credited.has(id)) fs.appendFileSync(credits, `${it.id}: ${src.credit}\n`);
    console.log(`${it.id}: ${it.file} (${dims.replace(',', ' x ')}${it.crop ? `, cropped ${it.crop}` : ''}) from ${new URL(src.url).hostname}`);
    fetched++;
    done = true;
    break;
  }
  if (!done) { warn(`${it.id}: no source supplied it, so it renders as a slate`); missing++; }
}
console.log(`fetch-footage: ${fetched} fetched, ${kept} the owner's, ${missing} still to find`);
