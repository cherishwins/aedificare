/**
 * The channel against the filing system. Every film and Short this repo has
 * rendered sits in a GitHub Release `film-<slug>` with the meta.json that
 * names its file; every video on the channel carries the name of the file
 * that was uploaded (the Data API's fileDetails.fileName, shown to the owner
 * only). So a hand upload is matched to its render by its file name, and
 * nobody pastes a video id back.
 *
 *   node tools/youtube-channel.mjs list
 *   node tools/youtube-channel.mjs sync [--dry] [--force] [--only <tag>]
 *
 * LIST prints every upload (id, privacy, date, length, views, file name,
 * title) and the release it came from, then the renders on Releases that
 * are not on the channel yet; it writes brand/youtube/channel.json.
 *
 * SYNC brings each matched video up to its render: downloads the meta,
 * captions and thumbnail from the release into brand/youtube/<tag>/ and runs
 * tools/upload-youtube.mjs --update on it (title, description with chapters
 * and sources, category, language, licence, the English caption track, the
 * thumbnail; privacy is never touched). A video whose title and description
 * already match is skipped unless --force, because each update spends about
 * 500 of the project's 10,000 daily quota units. --dry prints the plan.
 *
 * A video is matched by file name first and, failing that, by a title equal
 * to the render's (a hand upload whose title was pasted from sheet.txt).
 *
 * Credentials as tools/upload-youtube.mjs: YT_CLIENT_ID, YT_CLIENT_SECRET,
 * YT_REFRESH_TOKEN, the token minted by tools/youtube-auth.mjs with the read
 * scope. Release files come down with curl (GH_TOKEN or GITHUB_TOKEN if set;
 * the repository is public, so neither is needed off a shared address).
 * Quota: list costs a few units; sync about 500 per video it changes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const REPO = 'cherishwins/aedificare';
const OUT = 'brand/youtube';
const CMD = process.argv[2];
const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');
const ONLY = arg('--only', null);
if (!['list', 'sync'].includes(CMD)) { console.error('youtube-channel: list | sync [--dry] [--force] [--only <tag>]'); process.exit(1); }
const { YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN } = process.env;
if (!YT_CLIENT_ID || !YT_CLIENT_SECRET || !YT_REFRESH_TOKEN) { console.error('youtube-channel: YT_CLIENT_ID, YT_CLIENT_SECRET and YT_REFRESH_TOKEN must be set (tools/youtube-auth.mjs says how)'); process.exit(1); }

/* ---- GitHub: the renders on Releases ---------------------------------------- */
const ghToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const curl = (url, accept) => execFileSync('curl', ['-sSLf', '-H', `accept: ${accept}`, ...(ghToken ? ['-H', `authorization: Bearer ${ghToken}`] : []), url], { maxBuffer: 1 << 26 });
const releases = [];
for (let page = 1; ; page++) {
  const batch = JSON.parse(curl(`https://api.github.com/repos/${REPO}/releases?per_page=100&page=${page}`, 'application/vnd.github+json'));
  releases.push(...batch.filter((r) => r.tag_name.startsWith('film-') && (!ONLY || r.tag_name === ONLY)));
  if (batch.length < 100) break;
}
const asset = (rel, name) => rel.assets.find((a) => a.name === name);
const fetchAsset = (rel, name) => curl(asset(rel, name).url, 'application/octet-stream');
// One entry per rendered video: the wide film from meta.json, the Short from meta-short.json.
const renders = [];
for (const rel of releases) {
  for (const metaName of ['meta.json', 'meta-short.json']) {
    if (!asset(rel, metaName)) continue;
    const meta = JSON.parse(fetchAsset(rel, metaName));
    if (!asset(rel, meta.file)) continue;
    renders.push({ tag: rel.tag_name, metaName, meta, rel });
  }
}
const key = (name) => (name || '').toLowerCase();

/* ---- YouTube: the channel's uploads ------------------------------------------ */
const tok = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ client_id: YT_CLIENT_ID, client_secret: YT_CLIENT_SECRET, refresh_token: YT_REFRESH_TOKEN, grant_type: 'refresh_token' }),
});
if (!tok.ok) { console.error('youtube-channel: token refresh failed', tok.status, await tok.text()); process.exit(1); }
const auth = { authorization: `Bearer ${(await tok.json()).access_token}` };
const API = 'https://www.googleapis.com/youtube/v3';
const get = async (url) => {
  const r = await fetch(`${API}/${url}`, { headers: auth });
  if (!r.ok) { console.error(`youtube-channel: ${url.split('?')[0]} failed`, r.status, await r.text()); process.exit(1); }
  return r.json();
};
const channel = (await get('channels?part=snippet,contentDetails,statistics&mine=true')).items?.[0];
if (!channel) { console.error('youtube-channel: the token is not signed in to a channel'); process.exit(1); }
const ids = [];
for (let pageToken = ''; ;) {
  const p = await get(`playlistItems?part=contentDetails&maxResults=50&playlistId=${channel.contentDetails.relatedPlaylists.uploads}${pageToken ? `&pageToken=${pageToken}` : ''}`);
  ids.push(...p.items.map((i) => i.contentDetails.videoId));
  if (!(pageToken = p.nextPageToken)) break;
}
const videos = [];
for (let i = 0; i < ids.length; i += 50) {
  videos.push(...(await get(`videos?part=snippet,status,contentDetails,statistics,fileDetails&id=${ids.slice(i, i + 50).join(',')}`)).items);
}

// ISO 8601 duration to seconds, and to m:ss.
const secs = (iso) => { const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso || '') || []; return (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0); };
const dur = (iso) => { const s = secs(iso); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const matched = new Set();
const rows = videos.map((v) => {
  const file = v.fileDetails?.fileName || '';
  // A film and its Short share a title, so the title fallback also needs the kind: YouTube's Shorts run three minutes at most.
  const kind = secs(v.contentDetails.duration) <= 180 ? 'short' : 'film';
  const r = renders.find((x) => key(x.meta.file) === key(file))
    || renders.find((x) => x.meta.title === v.snippet.title && x.meta.kind === kind && !matched.has(x));
  if (r) matched.add(r);
  return { v, r, file };
});

/* ---- list --------------------------------------------------------------------- */
console.log(`${channel.snippet.title} · ${channel.snippet.customUrl || channel.id} · ${channel.statistics.subscriberCount} subscribers · ${videos.length} uploads\n`);
for (const { v, r, file } of rows) {
  const s = v.statistics || {};
  console.log(`${v.id}  ${v.status.privacyStatus.padEnd(8)} ${v.snippet.publishedAt.slice(0, 10)}  ${dur(v.contentDetails.duration).padStart(6)}  ${String(s.viewCount ?? '-').padStart(6)} views  ${r ? `${r.tag}/${r.metaName}` : 'no render'}`);
  console.log(`             ${v.snippet.title}${file ? `  [${file}]` : ''}`);
}
const missing = renders.filter((r) => !matched.has(r));
if (missing.length) {
  console.log('\nRendered, not on the channel:');
  for (const r of missing) console.log(`  ${r.tag}/${r.meta.file}  ${r.meta.kind}  ${Math.round(r.meta.duration / 60)} min  "${r.meta.title}"`);
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'channel.json'), JSON.stringify({
  at: new Date().toISOString(), channel: { id: channel.id, title: channel.snippet.title, handle: channel.snippet.customUrl, subscribers: +channel.statistics.subscriberCount },
  videos: rows.map(({ v, r, file }) => ({ id: v.id, title: v.snippet.title, privacy: v.status.privacyStatus, published: v.snippet.publishedAt, duration: v.contentDetails.duration, views: +(v.statistics?.viewCount ?? 0), file, release: r ? `${r.tag}/${r.metaName}` : null })),
  notOnChannel: missing.map((r) => ({ release: r.tag, file: r.meta.file, kind: r.meta.kind, title: r.meta.title })),
}, null, 1) + '\n');
if (CMD === 'list') process.exit(0);

/* ---- sync --------------------------------------------------------------------- */
console.log(`\nsync${DRY ? ' (dry run)' : ''}:`);
let changed = 0;
for (const { v, r } of rows) {
  if (!r) continue;
  const same = v.snippet.title === r.meta.title && v.snippet.description === r.meta.description;
  if (same && !FORCE) { console.log(`  ${v.id} ${r.tag}/${r.metaName}: already matches, skipped`); continue; }
  console.log(`  ${v.id} ${r.tag}/${r.metaName}: ${same ? 'forced' : 'title or description differs'}, updating`);
  changed++;
  if (DRY) continue;
  const dir = path.join(OUT, r.tag);
  fs.mkdirSync(dir, { recursive: true });
  for (const name of [r.metaName, r.meta.captions, r.meta.thumbnail].filter(Boolean)) {
    if (asset(r.rel, name)) fs.writeFileSync(path.join(dir, name), fetchAsset(r.rel, name));
  }
  // upload-youtube writes youtube.json or youtube-short.json beside the meta, so the record of what went where stays with the render.
  execFileSync(process.execPath, ['tools/upload-youtube.mjs', path.join(dir, r.metaName), '--update', v.id], { stdio: 'inherit' });
}
console.log(`  ${changed} ${DRY ? 'to update' : 'updated'}, ${rows.filter((x) => x.r).length - changed} matched and left, ${rows.filter((x) => !x.r).length} uploads with no render`);
