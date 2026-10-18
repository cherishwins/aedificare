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
 *                                         [--replace-old-voice]
 *   node tools/youtube-channel.mjs retire [--dry]
 *   node tools/youtube-channel.mjs schedule --set <release>:<film|short>=<ISO time|none>[,...] [--dry]
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
const { NARRATOR } = await import(new URL('../src/config.mjs', import.meta.url).href);
const VOICE = arg('--voice', (process.env.NARRATOR || NARRATOR).replace(/^(gemini|eleven):/, ''));
// A render in the channel's voice matched (by file name or title, which do not change with the voice) to a video
// whose description names no such voice is a NEW render of a video already up in an OLDER voice: never synced onto
// it, and uploaded beside it only with --replace-old-voice, because replacing a live video is the owner's call;
// `retire` then makes the old one private once the new one is public.
const REPLACE = process.argv.includes('--replace-old-voice');
const inVoice = (text) => String(text || '').toLowerCase().includes(VOICE.toLowerCase());
if (!['list', 'sync', 'upload', 'retire', 'schedule', 'probe'].includes(CMD)) { console.error('youtube-channel: probe | list | sync [--dry] [--force] [--only <tag>] | upload [--dry] [--only <tag>] [--kinds film,short] [--max 10] [--privacy private|unlisted] [--publish-at <ISO>] [--every <hours>] [--replace-old-voice] | retire [--dry] | schedule --set <release>:<film|short>=<ISO|none>[,...] [--dry]'); process.exit(1); }
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
// One entry per rendered video: the wide film from meta.json, the Short from meta-short.json.
const renders = [];
for (const rel of releases) {
  for (const metaName of ['meta.json', 'meta-short.json']) {
    if (!asset(rel, metaName)) continue;
    const meta = JSON.parse(fetchAsset(rel, metaName));
    if (!asset(rel, meta.file)) continue;
    const ledgerName = metaName === 'meta.json' ? 'youtube.json' : 'youtube-short.json';
    const ledger = asset(rel, ledgerName) ? JSON.parse(fetchAsset(rel, ledgerName)) : null;
    // An episode lists its missing shots in shots.md; each one plays as a slate, so the render is a draft.
    const slates = asset(rel, 'shots.md') ? (String(fetchAsset(rel, 'shots.md')).match(/^- \[ \]/gm) || []).length : 0;
    renders.push({ tag: rel.tag_name, metaName, meta, rel, ledgerName, ledgerId: ledger?.id || null, slates });
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
  if (r && !(older && REPLACE)) matched.add(r);
  return { v, r, file, older };
});

/* ---- list --------------------------------------------------------------------- */
// Over fifteen minutes needs a verified channel; unverified, YouTube takes the upload and then rejects it for length.
const LONG = channel.status?.longUploadsStatus || 'not reported';
console.log(`${channel.snippet.title} · ${channel.snippet.customUrl || channel.id} · ${channel.statistics.subscriberCount} subscribers · ${videos.length} uploads · long uploads ${LONG}\n`);
for (const { v, r, file, older } of rows) {
  const s = v.statistics || {};
  console.log(`${v.id}  ${v.status.privacyStatus.padEnd(8)} ${v.snippet.publishedAt.slice(0, 10)}  ${dur(v.contentDetails.duration).padStart(6)}  ${String(s.viewCount ?? '-').padStart(6)} views  ${r ? `${r.tag}/${r.metaName}` : 'no render'}${v.status.publishAt ? `  publishes ${v.status.publishAt}` : ''}${v.status.uploadStatus === 'rejected' ? `  REJECTED (${v.status.rejectionReason})` : ''}${older ? '  (OLDER VOICE: the render is new, the video is not; replacing it is the owner\'s call)' : ''}`);
  console.log(`             ${v.snippet.title}${file ? `  [${file}]` : ''}`);
}
const missing = renders.filter((r) => !matched.has(r));
if (missing.length) {
  console.log('\nRendered, not on the channel:');
  for (const r of missing) console.log(`  ${r.tag}/${r.meta.file}  ${r.meta.kind}  ${Math.round(r.meta.duration / 60)} min  "${r.meta.title}"${r.slates ? `  (draft: ${r.slates} shots missing)` : ''}${r.ledgerId ? `  (filed as ${r.ledgerId}, not on the channel: deleted?)` : ''}`);
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'channel.json'), JSON.stringify({
  at: new Date().toISOString(), channel: { id: channel.id, title: channel.snippet.title, handle: channel.snippet.customUrl, subscribers: +channel.statistics.subscriberCount, longUploads: LONG },
  videos: rows.map(({ v, r, file, older }) => ({ id: v.id, title: v.snippet.title, privacy: v.status.privacyStatus, publishAt: v.status.publishAt || null, upload: v.status.uploadStatus, published: v.snippet.publishedAt, duration: v.contentDetails.duration, views: +(v.statistics?.viewCount ?? 0), file, release: r ? `${r.tag}/${r.metaName}` : null, olderVoice: older })),
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
  const queue = missing
    .filter((r) => KINDS.includes(r.meta.kind))
    .sort((a, b) => issued(a).localeCompare(issued(b)) || place(a) - place(b) || a.tag.localeCompare(b.tag) || (a.meta.kind === b.meta.kind ? 0 : a.meta.kind === 'film' ? -1 : 1));
  console.log(`\nupload${DRY ? ' (dry run)' : ''}: ${queue.length} rendered and not on the channel; at most ${MAX} this run, ${PUBLISH_AT ? `private until ${PUBLISH_AT}` : PRIVACY}`);
  let done = 0;
  for (const r of queue) {
    // A Short-only episode renders its wide cut under three minutes too; the same minute twice on one channel is a duplicate, so the Short stands alone.
    if (r.meta.kind === 'film' && r.meta.duration <= 180 && renders.some((x) => x.tag === r.tag && x.meta.kind === 'short')) { console.log(`  ${r.tag}/${r.meta.file}: skipped, ${r.meta.duration} s wide cut of a Short-only episode; the Short goes up instead`); continue; }
    if (r.slates) { console.log(`  ${r.tag}/${r.meta.file}: refused, ${r.slates} shots still play as slates (shots.md)`); continue; }
    if (!String(r.meta.description || '').toLowerCase().includes(VOICE.toLowerCase())) { console.log(`  ${r.tag}/${r.meta.file}: refused, not in the channel's voice ${VOICE} (${(String(r.meta.description).match(/Voice: [^\n]*/) || ['no voice line'])[0]}); render it again first`); continue; }
    if (r.ledgerId) { console.log(`  ${r.tag}/${r.meta.file}: refused, filed as ${r.ledgerId}, which is not on the channel; delete ${r.ledgerName} from the release to upload it again`); continue; }
    if (tooLong(r)) { console.log(`  ${r.tag}/${r.meta.file}: refused, ${Math.round(r.meta.duration / 60)} min and the channel's long uploads are ${LONG}; YouTube would reject it for length. ${LONG_FIX}`); continue; }
    // A Short's description sends the viewer to the film, so it waits while its film is held for length.
    const film = r.meta.kind === 'short' && missing.find((x) => x.tag === r.tag && x.meta.kind === 'film');
    if (film && tooLong(film)) { console.log(`  ${r.tag}/${r.meta.file}: held, its film is held for length and this Short points at it; it goes up with the film`); continue; }
    if (done >= MAX) { console.log(`  ${r.tag}/${r.meta.file}: next run (the cap of ${MAX} keeps a run inside one day's quota)`); continue; }
    done++;
    console.log(`  ${r.tag}/${r.meta.file}: ${DRY ? 'would upload' : 'uploading'} "${r.meta.title}"${PUBLISH_AT ? `, publishing ${new Date(Date.parse(PUBLISH_AT) + (done - 1) * EVERY_H * 3600e3).toISOString()}` : ''}`);
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
    // File the id on the release, replacing any earlier ledger of the same name.
    const ledgerFile = path.join(dir, r.ledgerName);
    if (!ghToken) { console.log(`  (no GH_TOKEN: ${r.ledgerName} written to ${ledgerFile} but not filed on the release)`); continue; }
    const old = asset(r.rel, r.ledgerName);
    if (old) execFileSync('curl', ['-sSLf', '-X', 'DELETE', ...ghAuth, old.url]);
    execFileSync('curl', ['-sSLf', '-X', 'POST', ...ghAuth, '-H', 'content-type: application/json', '--data-binary', `@${ledgerFile}`, `https://uploads.github.com/repos/${REPO}/releases/${r.rel.id}/assets?name=${r.ledgerName}`], { stdio: ['ignore', 'ignore', 'inherit'] });
    console.log(`  filed ${r.ledgerName} on ${r.tag}`);
  }
  console.log(`  ${done} ${DRY ? 'to upload' : 'uploaded'}`);
  process.exit(0);
}

/* ---- schedule ----------------------------------------------------------------- */
// Moves a scheduled video's publish time, or holds it (private, no time) while its edition is checked or its render is
// replaced. Only a private video is touched, so nothing already out changes, and nothing is made public from here: a
// time is YouTube's own publishAt, which keeps the video private until then.
if (CMD === 'schedule') {
  const plan = arg('--set', '').split(',').map((x) => x.trim()).filter(Boolean).map((x) => {
    const m = /^([\w.-]+):(film|short)=(.+)$/.exec(x);
    if (!m) { console.error(`youtube-channel: --set wants <release>:<film|short>=<ISO time|none>, got "${x}"`); process.exit(1); }
    const hold = m[3] === 'none';
    const when = hold ? null : new Date(m[3]);
    if (!hold && (isNaN(when) || when <= Date.now())) { console.error(`youtube-channel: ${m[1]}:${m[2]}: "${m[3]}" is not a time in the future`); process.exit(1); }
    return { tag: m[1], kind: m[2], at: when };
  });
  if (!plan.length) { console.error('youtube-channel: schedule needs --set <release>:<film|short>=<ISO time|none>'); process.exit(1); }
  console.log(`\nschedule${DRY ? ' (dry run)' : ''}: private videos only; a time keeps the video private until YouTube publishes it, none holds it`);
  // Each Short publishes after its own film: warn when the plan, laid over what is already scheduled, says otherwise.
  const timeOf = (tag, kind) => {
    const p = plan.find((x) => x.tag === tag && x.kind === kind);
    if (p) return p.at;
    const row = rows.find((x) => x.r && x.r.tag === tag && x.r.meta.kind === kind && !x.older);
    return row?.v.status.publishAt ? new Date(row.v.status.publishAt) : null;
  };
  for (const tag of new Set(plan.map((x) => x.tag))) {
    const film = timeOf(tag, 'film'), short = timeOf(tag, 'short');
    if (film && short && short < film) console.log(`  warning: ${tag}'s Short (${short.toISOString()}) would come out before its film (${film.toISOString()})`);
  }
  let done = 0;
  for (const { tag, kind, at } of plan) {
    const row = rows.find((x) => x.r && x.r.tag === tag && x.r.meta.kind === kind && !x.older);
    if (!row) { console.log(`  ${tag}:${kind}: no video on the channel for that render`); continue; }
    const { v } = row;
    const name = `${v.id} ${tag}:${kind}`;
    if (v.status.privacyStatus !== 'private') { console.log(`  ${name}: refused, it is ${v.status.privacyStatus}; schedule never touches a video that is already out`); continue; }
    const from = v.status.publishAt ? new Date(v.status.publishAt) : null;
    if ((from?.getTime() ?? null) === (at?.getTime() ?? null)) { console.log(`  ${name}: already ${at ? at.toISOString() : 'held'}`); continue; }
    console.log(`  ${name}: ${from ? from.toISOString() : 'held'} -> ${at ? at.toISOString() : 'held, no publish time'}`);
    done++;
    if (DRY) continue;
    // As in retire, the whole status part is replaced, so every writable field goes back unchanged beside the time.
    const keep = ['license', 'embeddable', 'publicStatsViewable', 'selfDeclaredMadeForKids', 'containsSyntheticMedia'].filter((k) => k in v.status);
    const status = { ...Object.fromEntries(keep.map((k) => [k, v.status[k]])), privacyStatus: 'private', ...(at ? { publishAt: at.toISOString() } : {}) };
    const put = await fetch(`${API}/videos?part=status`, { method: 'PUT', headers: { ...auth, 'content-type': 'application/json' }, body: JSON.stringify({ id: v.id, status }) });
    if (!put.ok) { console.error(`youtube-channel: ${v.id} could not be rescheduled`, put.status, await put.text()); process.exit(1); }
    const now = (await put.json()).status || {};
    console.log(`    now ${now.privacyStatus}, ${now.publishAt ? `publishes ${now.publishAt}` : 'no publish time'}`);
  }
  console.log(`  ${done} ${DRY ? 'to change' : 'changed'}`);
  process.exit(0);
}

/* ---- retire ------------------------------------------------------------------- */
// The second half of a replacement: once the new render is PUBLIC, the video in the older voice goes private (never
// deleted: its views and comments stay with it, and the owner can bring it back in Studio). Never before, so the
// channel is not left without the piece if the new upload is held, rejected or still scheduled.
if (CMD === 'retire') {
  console.log(`\nretire${DRY ? ' (dry run)' : ''}: a video in an older voice goes private once its replacement in ${VOICE} is public`);
  let done = 0;
  for (const { v, r, older } of rows) {
    if (!older) continue;
    const next = rows.find((x) => x.r === r && !x.older && x.v.id !== v.id);
    const name = `${v.id} ${r.tag}/${r.metaName}`;
    if (v.status.privacyStatus === 'private') { console.log(`  ${name}: already private`); continue; }
    if (!next) { console.log(`  ${name}: left, no replacement on the channel (upload --replace-old-voice first)`); continue; }
    if (next.v.status.privacyStatus !== 'public') { console.log(`  ${name}: left until its replacement ${next.v.id} is public${next.v.status.publishAt ? ` (scheduled ${next.v.status.publishAt})` : ''}`); continue; }
    console.log(`  ${name}: ${DRY ? 'would go' : 'going'} private, replaced by ${next.v.id} (its ${v.statistics?.viewCount ?? 0} views stay with it)`);
    done++;
    if (DRY) continue;
    // The API replaces the whole status part, so every writable field the video has is sent back unchanged beside the privacy.
    const keep = ['license', 'embeddable', 'publicStatsViewable', 'selfDeclaredMadeForKids', 'containsSyntheticMedia'].filter((k) => k in v.status);
    const status = { ...Object.fromEntries(keep.map((k) => [k, v.status[k]])), privacyStatus: 'private' };
    const put = await fetch(`${API}/videos?part=status`, { method: 'PUT', headers: { ...auth, 'content-type': 'application/json' }, body: JSON.stringify({ id: v.id, status }) });
    if (!put.ok) { console.error(`youtube-channel: ${v.id} could not be made private`, put.status, await put.text()); process.exit(1); }
    console.log('    private');
  }
  console.log(`  ${done} ${DRY ? 'to retire' : 'retired'}`);
  process.exit(0);
}

/* ---- sync --------------------------------------------------------------------- */
console.log(`\nsync${DRY ? ' (dry run)' : ''}:`);
let changed = 0;
for (const { v, r, older } of rows) {
  if (!r) continue;
  if (older) { console.log(`  ${v.id} ${r.tag}/${r.metaName}: refused, the video is in an older voice and the render in ${VOICE}; its captions and chapters would not fit the video's audio. Replace it (upload --replace-old-voice, then retire once the new one is public) or leave it`); continue; }
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
