/**
 * The channel against the filing system. Every film and Short this repo has
 * rendered sits in a GitHub Release `film-<slug>` with the meta.json that
 * names its file; every video on the channel carries the name of the file
 * that was uploaded (the Data API's fileDetails.fileName, shown to the owner
 * only). So a hand upload is matched to its render by its file name, and
 * nobody pastes a video id back.
 *
 *   node tools/youtube-channel.mjs probe
 *   node tools/youtube-channel.mjs list
 *   node tools/youtube-channel.mjs sync   [--dry] [--force] [--only <tag>]
 *   node tools/youtube-channel.mjs upload [--dry] [--only <tag>] [--kinds film,short] [--max 10]
 *                                         [--privacy private|unlisted] [--publish-at <ISO time>] [--every <hours>]
 *                                         [--replace-old-voice] [--replace <release>[,...]]
 *   node tools/youtube-channel.mjs retire [--dry]
 *   node tools/youtube-channel.mjs schedule --set <release>:<film|short>=<ISO time|none>[,...] [--dry]
 *   node tools/youtube-channel.mjs withdraw --set <release>:<film|short>|<videoId>[,...] [--dry]
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
 * 500 of the project's 10,000 daily quota units, or unless its ledger says
 * the upload still owes it something (captions or a thumbnail that failed,
 * usually on quota), which sync sends and then clears by filing the ledger
 * again. --dry prints the plan.
 *
 * PROBE answers one question before any film goes up: does this Google
 * Cloud project's upload come out locked private? Since 28 July 2020 YouTube
 * has locked API uploads from unaudited projects created after that date,
 * and a locked video can never be unlocked, only uploaded again
 * (support.google.com/youtube/answer/7300965); in October 2026 the
 * videos.insert reference began saying the opposite, while the revision
 * history and the help page still say it. So the probe uploads a
 * three-second Void clip as unlisted, waits for YouTube to process it,
 * reports the privacy YouTube actually gave it, and deletes it. Needs ffmpeg.
 *
 * UPLOAD puts on the channel, through tools/upload-youtube.mjs, each render
 * that is not there yet: oldest release first, a film before its Short, at
 * most --max a run. Since 1 June 2026 videos.insert has its own bucket, 100
 * a day, so the cap is the shared 10,000 units: about 500 per video (400
 * captions, 50 thumbnail, 50 listing), about twenty videos a day. It
 * refuses a render whose release carries a shots.md with an unticked shot,
 * because a missing shot plays as a slate, and a render whose description
 * names a voice other than the channel's (--voice, default the voice in
 * NARRATOR), because the channel speaks in one voice and the Releases still
 * hold films in the old one until they are rendered again. After each upload it files the
 * video's id on the release as youtube.json (the film) or youtube-short.json
 * (the Short), so the next run, and every list, knows the video is there
 * even when the API leaves its file name empty. Private by default;
 * --publish-at keeps it private and has YouTube publish it at that time;
 * with --every <hours>, each later upload in the run is scheduled that many
 * hours after the one before, so a batch goes out as a run, not a dump.
 * Filing the id needs GH_TOKEN with contents: write (the workflow has it).
 *
 * RETIRE finishes a replacement. A render in the channel's voice whose video
 * is up in an older voice is uploaded beside it with upload
 * --replace-old-voice; once that new video is public, retire makes the old
 * one private (never deleted, so its views and comments stay and the owner
 * can restore it). A replacement still private or scheduled leaves the old
 * one up. About 50 units a video.
 *
 * A CORRECTED RENDER replaces its own video the same way. When an edition's
 * page is corrected after its film went up, the film is rendered again into
 * the same release (same file name, same voice), and upload --replace
 * <release> uploads it beside the video already there, refusing a render
 * older than that video. The new id is filed on the release, so the old
 * video now reads SUPERSEDED: the release files another video as its own.
 * Schedule and sync leave a superseded video alone, and retire treats it as
 * it treats an older voice.
 *
 * WITHDRAW takes a public or unlisted video private at once, named by
 * release and kind (the release's current video) or by its id (an earlier
 * cut still out), for a film found wrong after it went out. Never
 * deleted, so its views and comments stay and the owner can restore it in
 * Studio. Each write is read back. With --privacy unlisted it sets an
 * earlier cut unlisted instead (owner, 20 Oct 2026: a superseded cut goes
 * unlisted, never deleted, so a link already shared still opens), and it
 * refuses a video with a publish time, because that is a keeper waiting to
 * go out and unlisting it would drop the time. Retire takes the same flag.
 *
 * A video is matched by the id filed on its release first, then by file
 * name, then by a title equal to the render's and of the same kind (a hand
 * upload whose title was pasted from sheet.txt).
 *
 * Credentials as tools/upload-youtube.mjs: YT_CLIENT_ID, YT_CLIENT_SECRET,
 * YT_REFRESH_TOKEN, the token minted by tools/youtube-auth.mjs with the read
 * scope. Release files come down with curl (GH_TOKEN or GITHUB_TOKEN if set;
 * the repository is public, so neither is needed off a shared address).
 * Quota: list costs a few units; sync about 500 per video it changes;
 * upload one of the 100 daily uploads plus about 500 units per video;
 * probe one upload plus about 60 units.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fitDescription } from './lib/chapters.mjs';
import { lineDiff } from './lib/diff.mjs';

const REPO = 'cherishwins/aedificare';
const OUT = 'brand/youtube';
const CMD = process.argv[2];
const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');
const ONLY = arg('--only', null);
const KINDS = arg('--kinds', 'film,short').split(',');
const MAX = +arg('--max', 10);
const PRIVACY = arg('--privacy', 'private');
const PUBLISH_AT = arg('--publish-at', null);
const EVERY_H = +arg('--every', 0);
// The channel speaks in one voice (CLAUDE.md, override 6): a render whose description names another is never uploaded.
const { NARRATOR, SITE } = await import(new URL('../src/config.mjs', import.meta.url).href);
const VOICE = arg('--voice', (process.env.NARRATOR || NARRATOR).replace(/^(gemini|eleven):/, ''));
// A render in the channel's voice matched (by file name or title, which do not change with the voice) to a video
// whose description names no such voice is a NEW render of a video already up in an OLDER voice: never synced onto
// it, and uploaded beside it only with --replace-old-voice, because replacing a live video is the owner's call;
// `retire` then makes the old one private once the new one is public.
const REPLACE = process.argv.includes('--replace-old-voice');
// A corrected render of a video already up in the channel's voice: these releases' renders are uploaded although a
// video matches them, and nothing else is uploaded in that run.
const REPLACE_TAGS = arg('--replace', '').split(',').map((x) => x.trim()).filter(Boolean);
const inVoice = (text) => String(text || '').toLowerCase().includes(VOICE.toLowerCase());
if (!['list', 'sync', 'upload', 'retire', 'schedule', 'withdraw', 'probe'].includes(CMD)) { console.error('youtube-channel: probe | list | sync [--dry] [--force] [--only <tag>] | upload [--dry] [--only <tag>] [--kinds film,short] [--max 10] [--privacy private|unlisted] [--publish-at <ISO>] [--every <hours>] [--replace-old-voice] [--replace <tag>[,...]] | retire [--dry] [--privacy private|unlisted] | schedule --set <release>:<film|short>=<ISO|none>[,...] [--dry] | withdraw --set <release>:<film|short>|<videoId>[,...] [--dry] [--privacy private|unlisted]'); process.exit(1); }
// Nothing goes public from a machine (CLAUDE.md, the bed, the Short, the upload): public is refused here, and a scheduled publish is the owner's call, made by passing a time.
if (!['private', 'unlisted'].includes(PRIVACY)) { console.error('youtube-channel: --privacy is private or unlisted; publishing is the owner\'s, in Studio or with --publish-at'); process.exit(1); }
if (PUBLISH_AT && !(Date.parse(PUBLISH_AT) > Date.now())) { console.error(`youtube-channel: --publish-at ${PUBLISH_AT} is not a future ISO time`); process.exit(1); }
const { YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN } = process.env;
if (!YT_CLIENT_ID || !YT_CLIENT_SECRET || !YT_REFRESH_TOKEN) { console.error('youtube-channel: YT_CLIENT_ID, YT_CLIENT_SECRET and YT_REFRESH_TOKEN must be set (tools/youtube-auth.mjs says how)'); process.exit(1); }

/* ---- GitHub: the renders on Releases ---------------------------------------- */
const ghToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const ghAuth = ghToken ? ['-H', `authorization: Bearer ${ghToken}`] : [];
const curl = (url, accept) => execFileSync('curl', ['-sSLf', '-H', `accept: ${accept}`, ...ghAuth, url], { maxBuffer: 1 << 26 });
const releases = [];
for (let page = 1; ; page++) {
  const batch = JSON.parse(curl(`https://api.github.com/repos/${REPO}/releases?per_page=100&page=${page}`, 'application/vnd.github+json'));
  releases.push(...batch.filter((r) => r.tag_name.startsWith('film-') && (!ONLY || r.tag_name === ONLY)));
  if (batch.length < 100) break;
}
const asset = (rel, name) => rel.assets.find((a) => a.name === name);
const fetchAsset = (rel, name) => curl(asset(rel, name).url, 'application/octet-stream');
// A film is a gigabyte: straight to disk, never through memory.
const saveAsset = (rel, name, to) => execFileSync('curl', ['-sSLf', '-H', 'accept: application/octet-stream', ...ghAuth, '-o', to, asset(rel, name).url]);
// File a render's ledger on its release; false when there is no token to do it. The filed ledger is the only link from an
// API upload (which keeps no file name) to its render, and the only thing that marks an earlier cut superseded, so it is
// never deleted before its replacement is up: the old one is renamed aside, the new one posted, and only then is the old
// one deleted; a failed post renames it back. A leftover .prev from a run that died in between is cleared first when the
// ledger itself is there, and taken as the ledger when it is not.
const fileLedger = (r, dir) => {
  const ledgerFile = path.join(dir, r.ledgerName);
  if (!ghToken) { console.log(`  (no GH_TOKEN: ${r.ledgerName} written to ${ledgerFile} but not filed on the release)`); return false; }
  const prevName = `${r.ledgerName}.prev`;
  const api = (method, url, body) => execFileSync('curl', ['-sSLf', '-X', method, ...ghAuth, '-H', 'accept: application/vnd.github+json', ...(body ? ['-H', 'content-type: application/json', '--data-binary', JSON.stringify(body)] : []), url], { stdio: ['ignore', 'ignore', 'inherit'] });
  const cur = asset(r.rel, r.ledgerName), prev = asset(r.rel, prevName);
  if (cur && prev) api('DELETE', prev.url);
  const old = cur || prev;
  if (cur) api('PATCH', cur.url, { name: prevName });
  try {
    execFileSync('curl', ['-sSLf', '-X', 'POST', ...ghAuth, '-H', 'content-type: application/json', '--data-binary', `@${ledgerFile}`, `https://uploads.github.com/repos/${REPO}/releases/${r.rel.id}/assets?name=${r.ledgerName}`], { stdio: ['ignore', 'ignore', 'inherit'] });
  } catch (e) {
    try { if (old) api('PATCH', old.url, { name: r.ledgerName }); }
    catch { console.log(`::error::${r.tag}: ${r.ledgerName} could not be filed, and the earlier one is left as ${prevName}; rename it back by hand. The new ledger was:\n${fs.readFileSync(ledgerFile, 'utf8')}`); }
    throw e;
  }
  if (old) api('DELETE', old.url);
  console.log(`  filed ${r.ledgerName} on ${r.tag}`);
  return true;
};
// One entry per rendered video: the wide film from meta.json, the Short from meta-short.json.
const renders = [];
for (const rel of releases) {
  for (const metaName of ['meta.json', 'meta-short.json']) {
    if (!asset(rel, metaName)) continue;
    const meta = JSON.parse(fetchAsset(rel, metaName));
    if (!asset(rel, meta.file)) continue;
    const ledgerName = metaName === 'meta.json' ? 'youtube.json' : 'youtube-short.json';
    // A ledger left as .prev by a run that died while filing (fileLedger) still names the render's video.
    const ledgerAsset = asset(rel, ledgerName) ? ledgerName : asset(rel, `${ledgerName}.prev`) ? `${ledgerName}.prev` : null;
    const ledger = ledgerAsset ? JSON.parse(fetchAsset(rel, ledgerAsset)) : null;
    // An episode lists its missing shots in shots.md; each one plays as a slate, so the render is a draft.
    const slates = asset(rel, 'shots.md') ? (String(fetchAsset(rel, 'shots.md')).match(/^- \[ \]/gm) || []).length : 0;
    renders.push({ tag: rel.tag_name, metaName, meta, rel, ledgerName, ledgerId: ledger?.id || null, owed: ledger?.owed || [], slates });
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
const channel = (await get('channels?part=snippet,contentDetails,statistics,status&mine=true')).items?.[0];
if (!channel) { console.error('youtube-channel: the token is not signed in to a channel'); process.exit(1); }

/* ---- probe -------------------------------------------------------------------- */
if (CMD === 'probe') {
  const clip = path.join(OUT, 'probe.mp4');
  fs.mkdirSync(OUT, { recursive: true });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=0x050A06:s=1280x720:d=3:r=24', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', clip]);
  const body = fs.readFileSync(clip);
  const start = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST', headers: { ...auth, 'content-type': 'application/json; charset=UTF-8', 'x-upload-content-type': 'video/mp4', 'x-upload-content-length': String(body.length) },
    body: JSON.stringify({ snippet: { title: 'probe', description: 'An automated test of the upload route; deleted within minutes.', categoryId: '28' }, status: { privacyStatus: 'unlisted', selfDeclaredMadeForKids: false } }),
  });
  if (!start.ok) { console.error('youtube-channel: probe upload session failed', start.status, await start.text()); process.exit(1); }
  const put = await fetch(start.headers.get('location'), { method: 'PUT', headers: { 'content-type': 'video/mp4' }, body });
  if (!put.ok) { console.error('youtube-channel: probe upload failed', put.status, await put.text()); process.exit(1); }
  const id = (await put.json()).id;
  console.log(`probe: uploaded ${id} as unlisted; waiting for YouTube to process it`);
  let st;
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 15000));
    st = (await get(`videos?part=status&id=${id}`)).items?.[0]?.status;
    if (st && st.uploadStatus !== 'uploaded') break;
  }
  console.log(`probe: uploadStatus ${st?.uploadStatus}, privacyStatus ${st?.privacyStatus}${st?.rejectionReason ? `, rejected: ${st.rejectionReason}` : ''}${st?.failureReason ? `, failed: ${st.failureReason}` : ''}`);
  const del = await fetch(`${API}/videos?id=${id}`, { method: 'DELETE', headers: auth });
  console.log(`probe: ${del.ok ? 'deleted' : `NOT deleted (${del.status}); delete ${id} in Studio`}`);
  if (st?.privacyStatus === 'unlisted') console.log('probe: NOT LOCKED. API uploads from this project keep the privacy they are given; upload and publish-at work.');
  else if (st?.privacyStatus === 'private') console.log('probe: LOCKED. API uploads from this project are forced private and can never be made public; upload by hand in Studio and use sync, and apply for the audit.');
  else console.log('probe: inconclusive (still processing or failed); run it again.');
  process.exit(0);
}
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
  // The title route skips a render another video already claimed, except for a video in an older voice: that one is
  // the video the render replaces, and once the replacement is up and claims the render through its ledger, the old
  // video (whose file name the API may leave empty) must still be found, or retire never sees it.
  const r = renders.find((x) => x.ledgerId === v.id)
    || renders.find((x) => key(x.meta.file) === key(file))
    || renders.find((x) => x.meta.title === v.snippet.title && x.meta.kind === kind && (!matched.has(x) || (inVoice(x.meta.description) && !inVoice(v.snippet.description))));
  const older = !!r && inVoice(r.meta.description) && !inVoice(v.snippet.description);
  if (r && !(older && REPLACE) && !REPLACE_TAGS.includes(r.tag)) matched.add(r);
  return { v, r, file, older, superseded: false };
});
// A render whose release files a different video, one that is on the channel, has been uploaded again: this video is
// the earlier cut. It is handled as an older voice is (never scheduled or synced, retired once the new one is public).
for (const x of rows) {
  if (x.r && x.r.ledgerId && x.r.ledgerId !== x.v.id && ids.includes(x.r.ledgerId)) x.superseded = x.older = true;
}

/* ---- list --------------------------------------------------------------------- */
// Over fifteen minutes needs a verified channel; unverified, YouTube takes the upload and then rejects it for length.
const LONG = channel.status?.longUploadsStatus || 'not reported';
console.log(`${channel.snippet.title} · ${channel.snippet.customUrl || channel.id} · ${channel.statistics.subscriberCount} subscribers · ${videos.length} uploads · long uploads ${LONG}\n`);
for (const { v, r, file, older, superseded } of rows) {
  const s = v.statistics || {};
  console.log(`${v.id}  ${v.status.privacyStatus.padEnd(8)} ${v.snippet.publishedAt.slice(0, 10)}  ${dur(v.contentDetails.duration).padStart(6)}  ${String(s.viewCount ?? '-').padStart(6)} views  ${r ? `${r.tag}/${r.metaName}` : 'no render'}${v.status.publishAt ? `  publishes ${v.status.publishAt}` : ''}${v.status.uploadStatus === 'rejected' ? `  REJECTED (${v.status.rejectionReason})` : ''}${r && r.ledgerId === v.id && r.owed.length ? `  (OWED: its ${r.owed.join(' and ')} did not go up; sync sends ${r.owed.length > 1 ? 'them' : 'it'})` : ''}${older ? (superseded ? `  (SUPERSEDED: ${r.tag} files ${r.ledgerId} as this render's video; retire makes this one private once that one is public)` : '  (OLDER VOICE: the render is new, the video is not; replacing it is the owner\'s call)') : ''}`);
  console.log(`             ${v.snippet.title}${file ? `  [${file}]` : ''}`);
}
const missing = renders.filter((r) => !matched.has(r));
if (missing.length) {
  console.log('\nRendered, not on the channel:');
  for (const r of missing) console.log(`  ${r.tag}/${r.meta.file}  ${r.meta.kind}  ${Math.round(r.meta.duration / 60)} min  "${r.meta.title}"${r.slates ? `  (draft: ${r.slates} shots missing)` : ''}${REPLACE_TAGS.includes(r.tag) ? '  (a corrected render, to go up with --replace)' : r.ledgerId ? `  (filed as ${r.ledgerId}, not on the channel: deleted?)` : ''}`);
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'channel.json'), JSON.stringify({
  at: new Date().toISOString(), channel: { id: channel.id, title: channel.snippet.title, handle: channel.snippet.customUrl, subscribers: +channel.statistics.subscriberCount, longUploads: LONG },
  videos: rows.map(({ v, r, file, older, superseded }) => ({ id: v.id, title: v.snippet.title, privacy: v.status.privacyStatus, publishAt: v.status.publishAt || null, upload: v.status.uploadStatus, published: v.snippet.publishedAt, duration: v.contentDetails.duration, views: +(v.statistics?.viewCount ?? 0), file, release: r ? `${r.tag}/${r.metaName}` : null, olderVoice: older && !superseded, superseded })),
  notOnChannel: missing.map((r) => ({ release: r.tag, file: r.meta.file, kind: r.meta.kind, title: r.meta.title, slates: r.slates, filedAs: r.ledgerId })),
}, null, 1) + '\n');
if (CMD === 'list') process.exit(0);

/* ---- upload ------------------------------------------------------------------- */
if (CMD === 'upload') {
  // In the order the work was issued (an edition's own date, else the day its release was filed), a film before its Short.
  // Two editions on one day go in the registry's order, which is newest first, so the later index is the earlier edition.
  const { EDITIONS } = await import(new URL('../src/lib/editions.mjs', import.meta.url).href);
  const issued = (r) => EDITIONS.find((e) => e.slug === r.meta.slug)?.date || (r.rel.published_at || r.rel.created_at).slice(0, 10);
  const place = (r) => { const i = EDITIONS.findIndex((e) => e.slug === r.meta.slug); return i < 0 ? -1 : EDITIONS.length - i; };
  // Fails closed: only 'allowed' takes a film over fifteen minutes. 'eligible' is fixed by phone verification; 'disallowed' is a
  // channel not in good standing (strikes, Content ID blocks), which verification does not fix.
  const tooLong = (r) => r.meta.duration > 900 && LONG !== 'allowed';
  const LONG_FIX = LONG === 'eligible' ? 'The owner verifies the channel by phone at youtube.com/verify; the next run takes it'
    : LONG === 'disallowed' ? 'The channel is not in good standing (Studio shows the strike or block); verifying does not lift it'
    : 'YouTube did not report the channel\'s status; youtube.com/verify shows it';
  for (const t of REPLACE_TAGS) if (!releases.some((r) => r.tag_name === t)) { console.error(`youtube-channel: --replace ${t} is not a film release on this repository`); process.exit(1); }
  const queue = missing
    .filter((r) => KINDS.includes(r.meta.kind) && (!REPLACE_TAGS.length || REPLACE_TAGS.includes(r.tag)))
    .sort((a, b) => issued(a).localeCompare(issued(b)) || place(a) - place(b) || a.tag.localeCompare(b.tag) || (a.meta.kind === b.meta.kind ? 0 : a.meta.kind === 'film' ? -1 : 1));
  console.log(`\nupload${DRY ? ' (dry run)' : ''}: ${queue.length} rendered and not on the channel; at most ${MAX} this run, ${PUBLISH_AT ? `private until ${PUBLISH_AT}` : PRIVACY}`);
  let done = 0;
  for (const r of queue) {
    // A Short-only episode renders its wide cut under three minutes too; the same minute twice on one channel is a duplicate, so the Short stands alone.
    if (r.meta.kind === 'film' && r.meta.duration <= 180 && renders.some((x) => x.tag === r.tag && x.meta.kind === 'short')) { console.log(`  ${r.tag}/${r.meta.file}: skipped, ${r.meta.duration} s wide cut of a Short-only episode; the Short goes up instead`); continue; }
    if (r.slates) { console.log(`  ${r.tag}/${r.meta.file}: refused, ${r.slates} shots still play as slates (shots.md)`); continue; }
    if (!String(r.meta.description || '').toLowerCase().includes(VOICE.toLowerCase())) { console.log(`  ${r.tag}/${r.meta.file}: refused, not in the channel's voice ${VOICE} (${(String(r.meta.description).match(/Voice: [^\n]*/) || ['no voice line'])[0]}); render it again first`); continue; }
    // The video a corrected render replaces is the one its release files (or, unfiled, the one it matched). A render no
    // newer than that video is the same cut, and YouTube would hold it as a duplicate.
    const current = REPLACE_TAGS.includes(r.tag) && rows.find((x) => x.r === r && !x.older);
    if (current && Date.parse(asset(r.rel, r.meta.file).updated_at) <= Date.parse(current.v.snippet.publishedAt)) { console.log(`  ${r.tag}/${r.meta.file}: refused, this render is not newer than ${current.v.id}, the video it would replace; render it again first`); continue; }
    if (r.ledgerId && !current) { console.log(`  ${r.tag}/${r.meta.file}: refused, filed as ${r.ledgerId}, which is not on the channel; delete ${r.ledgerName} from the release to upload it again`); continue; }
    if (tooLong(r)) { console.log(`  ${r.tag}/${r.meta.file}: refused, ${Math.round(r.meta.duration / 60)} min and the channel's long uploads are ${LONG}; YouTube would reject it for length. ${LONG_FIX}`); continue; }
    // A Short's description sends the viewer to the film, so it waits while its film is held for length.
    const film = r.meta.kind === 'short' && missing.find((x) => x.tag === r.tag && x.meta.kind === 'film');
    if (film && tooLong(film)) { console.log(`  ${r.tag}/${r.meta.file}: held, its film is held for length and this Short points at it; it goes up with the film`); continue; }
    if (done >= MAX) { console.log(`  ${r.tag}/${r.meta.file}: next run (the cap of ${MAX} keeps a run inside one day's quota)`); continue; }
    done++;
    console.log(`  ${r.tag}/${r.meta.file}: ${DRY ? 'would upload' : 'uploading'} "${r.meta.title}"${current ? `, replacing ${current.v.id} (${current.v.status.privacyStatus})` : ''}${PUBLISH_AT ? `, publishing ${new Date(Date.parse(PUBLISH_AT) + (done - 1) * EVERY_H * 3600e3).toISOString()}` : ''}`);
    if (DRY) continue;
    const dir = path.join(OUT, r.tag);
    fs.mkdirSync(dir, { recursive: true });
    for (const name of [r.metaName, r.meta.captions, r.meta.thumbnail].filter(Boolean)) {
      if (asset(r.rel, name)) fs.writeFileSync(path.join(dir, name), fetchAsset(r.rel, name));
    }
    saveAsset(r.rel, r.meta.file, path.join(dir, r.meta.file));
    const at = PUBLISH_AT ? new Date(Date.parse(PUBLISH_AT) + (done - 1) * EVERY_H * 3600e3).toISOString() : null;
    if (at) console.log(`    publishes ${at}`);
    execFileSync(process.execPath, ['tools/upload-youtube.mjs', path.join(dir, r.metaName), '--privacy', PRIVACY, ...(at ? ['--publish-at', at] : [])], { stdio: 'inherit' });
    fs.rmSync(path.join(dir, r.meta.file));
    if (!fileLedger(r, dir)) continue;
    // The video a corrected render replaced must not publish too: a scheduled one is held (private, no time), read
    // back. One already out stays until withdraw or retire takes it down, which is said here, not done.
    if (current && current.v.status.privacyStatus === 'private' && current.v.status.publishAt) {
      const keep = ['license', 'embeddable', 'publicStatsViewable', 'selfDeclaredMadeForKids', 'containsSyntheticMedia'].filter((k) => k in current.v.status);
      const status = { ...Object.fromEntries(keep.map((k) => [k, current.v.status[k]])), privacyStatus: 'private' };
      const put = await fetch(`${API}/videos?part=status`, { method: 'PUT', headers: { ...auth, 'content-type': 'application/json' }, body: JSON.stringify({ id: current.v.id, status }) });
      let now = {};
      for (let i = 0; put.ok && i < 3; i++) {
        if (i) await new Promise((ok) => setTimeout(ok, 3000));
        const rr = await fetch(`${API}/videos?part=status&id=${current.v.id}`, { headers: auth });
        now = rr.ok ? (await rr.json()).items?.[0]?.status || {} : {};
        if (now.privacyStatus === 'private' && !now.publishAt) break;
      }
      if (now.privacyStatus === 'private' && !now.publishAt) console.log(`    held ${current.v.id}, the video it replaces (was scheduled ${current.v.status.publishAt})`);
      else { console.error(`youtube-channel: ${current.v.id}, the video this render replaces, is still scheduled for ${current.v.status.publishAt}; hold it in Studio now`); process.exit(1); }
    } else if (current && current.v.status.privacyStatus !== 'private') console.log(`    ${current.v.id}, the video it replaces, is ${current.v.status.privacyStatus}: withdraw it now, or retire it once this one is public`);
  }
  console.log(`  ${done} ${DRY ? 'to upload' : 'uploaded'}`);
  process.exit(0);
}

/* ---- schedule ----------------------------------------------------------------- */
// Moves a scheduled video's publish time, or holds it (private, no time) while its edition is checked or its render is
// replaced. Only a private video is touched, so nothing already out changes, and nothing is made public from here: a
// time is YouTube's own publishAt, which keeps the video private until then. The whole plan is checked before the first
// write, so a typo or an unsafe pairing changes nothing.
if (CMD === 'schedule') {
  const fail = (msg) => { console.error(`youtube-channel: ${msg}`); process.exit(1); };
  // A time needs its zone: a zoneless one means 8am on the owner's Mac and 8am UTC on a runner.
  const ISO = /^\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d(\.\d+)?)?(Z|[+-]\d\d:\d\d)$/;
  const seen = new Set();
  const plan = arg('--set', '').split(',').map((x) => x.trim()).filter(Boolean).map((x) => {
    const m = /^([\w.-]+):(film|short)=(.+)$/.exec(x);
    if (!m) fail(`--set wants <release>:<film|short>=<ISO time with zone|none>, got "${x}"`);
    const [, tag, kind, val] = m;
    if (seen.has(`${tag}:${kind}`)) fail(`${tag}:${kind} is in --set twice; give each video one entry`);
    seen.add(`${tag}:${kind}`);
    if (val !== 'none' && !ISO.test(val)) fail(`${tag}:${kind}: "${val}" needs a full time with a zone, e.g. 2026-10-22T15:00:00Z`);
    const at = val === 'none' ? null : new Date(val);
    if (at && at <= Date.now()) fail(`${tag}:${kind}: ${val} is not in the future`);
    return { tag, kind, at };
  });
  if (!plan.length) fail('schedule needs --set <release>:<film|short>=<ISO time|none>');

  // Each entry must resolve to exactly one private, never-published video whose slot has not already come.
  const one = (tag, kind) => rows.filter((x) => x.r && x.r.tag === tag && x.r.meta.kind === kind && !x.older && !['rejected', 'failed', 'deleted'].includes(x.v.status.uploadStatus));
  for (const p of plan) {
    if (!releases.some((r) => r.tag_name === p.tag)) fail(`${p.tag} is not a film release on this repository`);
    const c = one(p.tag, p.kind);
    if (!c.length) fail(`${p.tag}:${p.kind}: no video on the channel for that render`);
    if (c.length > 1) fail(`${p.tag}:${p.kind} matches ${c.map((x) => x.v.id).join(', ')}; leave one (delete the other or re-file the ledger) and run again`);
    p.v = c[0].v;
    if (p.v.status.privacyStatus !== 'private') fail(`${p.v.id} ${p.tag}:${p.kind} is ${p.v.status.privacyStatus}; schedule never touches a video that is already out`);
    if (p.v.status.publishAt && Date.parse(p.v.status.publishAt) <= Date.now()) fail(`${p.v.id} ${p.tag}:${p.kind} was due at ${p.v.status.publishAt}; YouTube may already be publishing it`);
    p.from = p.v.status.publishAt ? Date.parse(p.v.status.publishAt) : Infinity;
    p.to = p.at ? p.at.getTime() : Infinity;
  }

  // Each Short publishes after its own film. Infinity is held; null is no video or already out. A Short left scheduled
  // while its film is held is held with it (a hold never publishes anything); a Short set before its film is refused.
  const timeOf = (tag, kind) => {
    const p = plan.find((x) => x.tag === tag && x.kind === kind);
    if (p) return p.to;
    const c = one(tag, kind);
    if (c.length !== 1 || c[0].v.status.privacyStatus !== 'private') return null;
    return c[0].v.status.publishAt ? Date.parse(c[0].v.status.publishAt) : Infinity;
  };
  for (const tag of new Set(plan.map((x) => x.tag))) {
    const film = timeOf(tag, 'film'), short = timeOf(tag, 'short');
    if (film == null || short == null || short === Infinity || short > film) continue;
    if (film === Infinity && !plan.some((x) => x.tag === tag && x.kind === 'short')) {
      const c = one(tag, 'short')[0];
      plan.push({ tag, kind: 'short', at: null, v: c.v, from: Date.parse(c.v.status.publishAt), to: Infinity, added: true });
      continue;
    }
    fail(`${tag}'s Short would come out ${film === Infinity ? 'while its film is held' : `before its film (${new Date(film).toISOString()})`}; move it after the film or add ${tag}:short=none`);
  }

  // Per release, the first write is the one that keeps the Short after its film on its own: the Short goes first when it
  // is held or moved later, the film first otherwise. If that first write fails, the second is not sent.
  const order = [];
  for (const tag of new Set(plan.map((x) => x.tag))) {
    const f = plan.find((x) => x.tag === tag && x.kind === 'film'), sh = plan.find((x) => x.tag === tag && x.kind === 'short');
    order.push(...(sh && f && sh.to < sh.from ? [f, sh] : [sh, f]).filter(Boolean));
  }
  const show = (t) => (t === Infinity ? 'held' : new Date(t).toISOString());
  console.log(`\nschedule${DRY ? ' (dry run)' : ''}: private videos only; a time keeps the video private until YouTube publishes it, none holds it`);
  const failed = new Set(), done = [];
  for (const p of order) {
    const name = `${p.v.id} ${p.tag}:${p.kind}`;
    if (p.from === p.to) { console.log(`  ${name}: already ${show(p.to)}`); continue; }
    if (failed.has(p.tag)) { console.log(`  ${name}: not sent, the other half of ${p.tag} failed`); continue; }
    console.log(`  ${name}: ${show(p.from)} -> ${show(p.to)}${p.added ? ' (its film is held, so the Short is held with it)' : ''}`);
    if (DRY) { done.push(name); continue; }
    // As in retire, the whole status part is replaced, so every writable field goes back unchanged beside the time.
    const keep = ['license', 'embeddable', 'publicStatsViewable', 'selfDeclaredMadeForKids', 'containsSyntheticMedia'].filter((k) => k in p.v.status);
    const status = { ...Object.fromEntries(keep.map((k) => [k, p.v.status[k]])), privacyStatus: 'private', ...(p.at ? { publishAt: p.at.toISOString() } : {}) };
    try {
      const put = await fetch(`${API}/videos?part=status`, { method: 'PUT', headers: { ...auth, 'content-type': 'application/json' }, body: JSON.stringify({ id: p.v.id, status }) });
      if (!put.ok) throw new Error(`${put.status} ${await put.text()}`);
      // What YouTube kept is read back, not taken from the PUT's reply: on 2026-10-18 three holds came back echoing the
      // old publishAt while a fresh read showed it cleared. A few reads, because the read can lag the write.
      const asked = (st) => st.privacyStatus === 'private' && (st.publishAt ? Math.abs(Date.parse(st.publishAt) - p.to) <= 60e3 : p.to === Infinity);
      let now = {};
      for (let i = 0; i < 3; i++) {
        if (i) await new Promise((ok) => setTimeout(ok, 3000));
        const r = await fetch(`${API}/videos?part=status&id=${p.v.id}`, { headers: auth });
        if (!r.ok) throw new Error(`the write went through but the read back failed: ${r.status} ${await r.text()}`);
        now = (await r.json()).items?.[0]?.status || {};
        if (asked(now)) break;
      }
      console.log(`    now ${now.privacyStatus}, ${now.publishAt ? `publishes ${now.publishAt}` : 'no publish time'}`);
      if (!asked(now)) throw new Error(`not as asked: YouTube kept ${now.privacyStatus}, ${now.publishAt || 'no time'}`);
      done.push(name);
    } catch (e) {
      console.log(`    FAILED: ${e.message}`);
      failed.add(p.tag);
    }
  }
  console.log(`  ${done.length} ${DRY ? 'to change' : 'changed'}${failed.size ? `, failed for ${[...failed].join(', ')}` : ''}`);
  process.exit(failed.size ? 1 : 0);
}

/* ---- withdraw ----------------------------------------------------------------- */
// A video found wrong after it went out (its edition's check changed the page) comes down at once: private, never
// deleted, so its views and comments stay and the owner can bring it back in Studio. Named one by one, all checked
// before the first write; a corrected render then goes up with upload --replace.
if (CMD === 'withdraw') {
  const fail = (msg) => { console.error(`youtube-channel: ${msg}`); process.exit(1); };
  const plan = [...new Set(arg('--set', '').split(',').map((x) => x.trim()).filter(Boolean))].map((x) => {
    // A video id names one directly, for an earlier cut (an older voice, or superseded) that is still out. Only one of
    // ours: matched to one of this repository's renders, or an earlier cut that no longer matches because its correction
    // changed the title, which its generated description still marks by the site's link. The owner's own videos carry
    // neither, so nothing else on the channel can be touched from here (19 Oct 2026: three uncorrected cuts went public
    // while matching no render, and withdraw refused them).
    if (/^[\w-]{11}$/.test(x)) {
      const y = rows.find((z) => z.v.id === x);
      // The origin as a whole link, with or without a path: edition descriptions carry <origin>/<slug>, episode ones end on
      // the bare origin; a longer host (aedificare.art.example, aedificare.artist) is not it.
      const links = new RegExp(`${SITE.origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[\\s/?#])`, 'm');
      const ours = y && (y.r || links.test(String(y.v.snippet.description || '')));
      if (!ours) fail(`${x} is not one of this repository's videos (matched to no render, and its description carries no link to ${SITE.origin})`);
      return { tag: y.r ? y.r.tag : 'an earlier cut', kind: y.r ? y.r.meta.kind : 'unmatched', v: y.v };
    }
    const m = /^([\w.-]+):(film|short)$/.exec(x);
    if (!m) fail(`--set wants <release>:<film|short> or a video id, got "${x}"`);
    const [, tag, kind] = m;
    if (!releases.some((r) => r.tag_name === tag)) fail(`${tag} is not a film release on this repository`);
    const c = rows.filter((y) => y.r && y.r.tag === tag && y.r.meta.kind === kind && !y.older);
    if (c.length !== 1) fail(`${tag}:${kind} matches ${c.length ? c.map((y) => y.v.id).join(', ') : 'no video'}; withdraw names exactly one`);
    return { tag, kind, v: c[0].v };
  });
  if (!plan.length) fail('withdraw needs --set <release>:<film|short>');
  // Unlisted is for an earlier cut: a scheduled video is a keeper, and unlisting it would cancel its publish time.
  if (PRIVACY === 'unlisted') for (const { v } of plan) if (v.status.publishAt) fail(`${v.id} is scheduled for ${v.status.publishAt}; unlisting it would drop that time. Name an earlier cut, or hold it with schedule first if that is meant`);
  console.log(`\nwithdraw${DRY ? ' (dry run)' : ''}: each named video goes ${PRIVACY} now, never deleted`);
  let done = 0, failed = 0;
  for (const { tag, kind, v } of plan) {
    const name = `${v.id} ${tag}:${kind}`;
    if (v.status.privacyStatus === PRIVACY && !v.status.publishAt) { console.log(`  ${name}: already ${PRIVACY}`); continue; }
    console.log(`  ${name}: ${v.status.privacyStatus}${v.status.publishAt ? `, publishes ${v.status.publishAt}` : ''} -> ${PRIVACY} (its ${v.statistics?.viewCount ?? 0} views stay with it)`);
    if (DRY) { done++; continue; }
    const keep = ['license', 'embeddable', 'publicStatsViewable', 'selfDeclaredMadeForKids', 'containsSyntheticMedia'].filter((k) => k in v.status);
    const status = { ...Object.fromEntries(keep.map((k) => [k, v.status[k]])), privacyStatus: PRIVACY };
    try {
      const put = await fetch(`${API}/videos?part=status`, { method: 'PUT', headers: { ...auth, 'content-type': 'application/json' }, body: JSON.stringify({ id: v.id, status }) });
      if (!put.ok) throw new Error(`${put.status} ${await put.text()}`);
      // Judged on a fresh read, as in schedule: the PUT's reply can lag what YouTube kept.
      let now = {};
      for (let i = 0; i < 3; i++) {
        if (i) await new Promise((ok) => setTimeout(ok, 3000));
        const r = await fetch(`${API}/videos?part=status&id=${v.id}`, { headers: auth });
        if (!r.ok) throw new Error(`the write went through but the read back failed: ${r.status} ${await r.text()}`);
        now = (await r.json()).items?.[0]?.status || {};
        if (now.privacyStatus === PRIVACY && !now.publishAt) break;
      }
      console.log(`    now ${now.privacyStatus}${now.publishAt ? `, publishes ${now.publishAt}` : ''}`);
      if (now.privacyStatus !== PRIVACY || now.publishAt) throw new Error(`not as asked: YouTube kept ${now.privacyStatus}${now.publishAt ? `, ${now.publishAt}` : ''}`);
      done++;
    } catch (e) {
      console.log(`    FAILED: ${e.message}`);
      failed++;
    }
  }
  console.log(`  ${done} ${DRY ? 'to withdraw' : 'withdrawn'}${failed ? `, ${failed} failed` : ''}`);
  process.exit(failed ? 1 : 0);
}

/* ---- retire ------------------------------------------------------------------- */
// The second half of a replacement: once the new render is PUBLIC, the video in the older voice goes private (never
// deleted: its views and comments stay with it, and the owner can bring it back in Studio). Never before, so the
// channel is not left without the piece if the new upload is held, rejected or still scheduled.
if (CMD === 'retire') {
  console.log(`\nretire${DRY ? ' (dry run)' : ''}: a video in an older voice, or superseded by a corrected render, goes ${PRIVACY} once its replacement is public`);
  let done = 0;
  for (const { v, r, older } of rows) {
    if (!older) continue;
    const next = rows.find((x) => x.r === r && !x.older && x.v.id !== v.id);
    const name = `${v.id} ${r.tag}/${r.metaName}`;
    if (v.status.privacyStatus === PRIVACY) { console.log(`  ${name}: already ${PRIVACY}`); continue; }
    if (!next) { console.log(`  ${name}: left, no replacement on the channel (upload --replace-old-voice, or --replace for a corrected render, first)`); continue; }
    if (next.v.status.privacyStatus !== 'public') { console.log(`  ${name}: left until its replacement ${next.v.id} is public${next.v.status.publishAt ? ` (scheduled ${next.v.status.publishAt})` : ''}`); continue; }
    console.log(`  ${name}: ${DRY ? 'would go' : 'going'} ${PRIVACY}, replaced by ${next.v.id} (its ${v.statistics?.viewCount ?? 0} views stay with it)`);
    done++;
    if (DRY) continue;
    // The API replaces the whole status part, so every writable field the video has is sent back unchanged beside the privacy.
    const keep = ['license', 'embeddable', 'publicStatsViewable', 'selfDeclaredMadeForKids', 'containsSyntheticMedia'].filter((k) => k in v.status);
    const status = { ...Object.fromEntries(keep.map((k) => [k, v.status[k]])), privacyStatus: PRIVACY };
    const put = await fetch(`${API}/videos?part=status`, { method: 'PUT', headers: { ...auth, 'content-type': 'application/json' }, body: JSON.stringify({ id: v.id, status }) });
    if (!put.ok) { console.error(`youtube-channel: ${v.id} could not be made ${PRIVACY}`, put.status, await put.text()); process.exit(1); }
    console.log(`    ${PRIVACY}`);
  }
  console.log(`  ${done} ${DRY ? 'to retire' : 'retired'}`);
  process.exit(0);
}

/* ---- sync --------------------------------------------------------------------- */
console.log(`\nsync${DRY ? ' (dry run)' : ''}:`);
let changed = 0;
for (const { v, r, older, superseded } of rows) {
  if (!r) continue;
  if (superseded) { console.log(`  ${v.id} ${r.tag}/${r.metaName}: left, superseded by ${r.ledgerId}; the render's captions and chapters belong to that video`); continue; }
  if (older) { console.log(`  ${v.id} ${r.tag}/${r.metaName}: refused, the video is in an older voice and the render in ${VOICE}; its captions and chapters would not fit the video's audio. Replace it (upload --replace-old-voice, then retire once the new one is public) or leave it`); continue; }
  // Compared with the description as the uploader will send it, chapters fitted (tools/lib/chapters.mjs).
  const sendDesc = fitDescription(r.meta.description, r.meta.duration);
  const same = v.snippet.title === r.meta.title && v.snippet.description === sendDesc;
  // A video the release's ledger names, with something its upload could not send (captions, a thumbnail), is not done.
  const owed = r.ledgerId === v.id ? r.owed : [];
  if (same && !FORCE && !owed.length) { console.log(`  ${v.id} ${r.tag}/${r.metaName}: already matches, skipped`); continue; }
  console.log(`  ${v.id} ${r.tag}/${r.metaName}: ${!same ? 'title or description differs' : owed.length ? `owed its ${owed.join(' and ')}` : 'forced'}, ${DRY ? 'would update' : 'updating'}`);
  // What changes, before and after, line by line: the record a dry run is read for, and the log of a real one.
  if (v.snippet.title !== r.meta.title) console.log(`      title  - ${v.snippet.title}\n      title  + ${r.meta.title}`);
  if (v.snippet.description !== sendDesc) console.log(lineDiff(v.snippet.description, sendDesc).replace(/^/gm, '      '));
  // Only words changed: the title and description go up alone (about 50 units), not the captions and thumbnail
  // again (about 450 more each), so a retitle of every film fits inside one day's 10,000.
  const metaOnly = !same && !owed.length && !FORCE;
  changed++;
  if (DRY) continue;
  const dir = path.join(OUT, r.tag);
  fs.mkdirSync(dir, { recursive: true });
  // The ledger comes down too when it names this video, so the update keeps the upload's record and only settles what is owed.
  const mine = r.ledgerId === v.id;
  for (const name of [r.metaName, !metaOnly && r.meta.captions, !metaOnly && r.meta.thumbnail, mine && r.ledgerName].filter(Boolean)) {
    if (asset(r.rel, name)) fs.writeFileSync(path.join(dir, name), fetchAsset(r.rel, name));
  }
  // upload-youtube writes youtube.json or youtube-short.json beside the meta, so the record of what went where stays with the render.
  execFileSync(process.execPath, ['tools/upload-youtube.mjs', path.join(dir, r.metaName), '--update', v.id, ...(mine ? [] : ['--untracked']), ...(metaOnly ? ['--meta-only'] : [])], { stdio: 'inherit' });
  // Filed back only over a ledger that already named this video: a debt paid is cleared, and a match by file name alone does not
  // claim the render. Such a video (a hand upload) has nowhere to record a debt, so one is said here, with the way to pay it.
  if (mine) fileLedger(r, dir);
  else {
    const left = JSON.parse(fs.readFileSync(path.join(dir, r.ledgerName), 'utf8')).owed || [];
    if (left.length) console.log(`${process.env.GITHUB_ACTIONS ? '::warning::' : '  '}${v.id} (${r.tag}/${r.metaName}) is up without its ${left.join(' and ')}, and no ledger on the release names it, so nothing records the debt; once the quota is back run youtube.yml action=sync only=${r.tag} set=force`);
  }
}
console.log(`  ${changed} ${DRY ? 'to update' : 'updated'}, ${rows.filter((x) => x.r).length - changed} matched and left, ${rows.filter((x) => !x.r).length} uploads with no render`);
