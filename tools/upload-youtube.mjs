/**
 * Put a rendered film (or Short) on the channel through the Data API v3, or
 * bring a video that is already there up to the render's metadata. Both read
 * the meta.json the render wrote, so the title, description, chapters,
 * captions and thumbnail are the generated ones and nothing is typed.
 *
 *   node tools/upload-youtube.mjs brand/youtube/edition-03/meta.json [--privacy private|unlisted|public] [--playlist <id>]
 *   node tools/upload-youtube.mjs brand/youtube/edition-03/meta.json --update <videoId> [--playlist <id>]
 *
 * UPLOAD (the first form) does a resumable upload, PRIVATE by default, then
 * captions, thumbnail and an optional playlist insert; the owner presses
 * Publish in Studio after watching. THE PRIVATE LOCK: YouTube keeps every
 * video uploaded through the API by an API project created after 28 July
 * 2020 private until that project passes YouTube's API compliance audit (a
 * free form, days to weeks), and Studio will not flip it. Apply at
 * https://support.google.com/youtube/contact/yt_api_form
 * (developers.google.com/youtube/v3/revision_history, 28 July 2020).
 *
 * UPDATE (the second form) is the path that works before the audit: the owner
 * uploads the file by hand in Studio (public, no lock), then this sets the
 * generated title, description, category, language and licence on it,
 * replaces the English caption track, and sets the thumbnail. Metadata edits
 * are not locked. The owner never retypes a description again.
 *
 * Credentials, never in the repo: YT_CLIENT_ID, YT_CLIENT_SECRET and
 * YT_REFRESH_TOKEN in the environment (repository secrets on Actions; the
 * Claude Code cloud environment's variables so the builder can run this from
 * a session; a local shell on a Mac). tools/youtube-auth.mjs mints the
 * refresh token once. Scopes: youtube.upload (the video) and
 * youtube.force-ssl (metadata, captions, thumbnails, playlists).
 *
 * Quota: an upload costs 1,600 of the project's 10,000 daily units; a
 * metadata update 50; captions 400; a thumbnail 50; a playlist insert 50.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const META = process.argv[2];
const PRIVACY = arg('--privacy', 'private');
const UPDATE = arg('--update', null);
// In update mode the playlist is touched only when asked for explicitly: the hand upload may already be in it.
const PLAYLIST = arg('--playlist', UPDATE ? null : (process.env.YT_PLAYLIST_ID || null));
if (!META || !fs.existsSync(META)) { console.error('upload-youtube: pass the path to a meta.json written by generate-film'); process.exit(1); }
const { YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN } = process.env;
if (!YT_CLIENT_ID || !YT_CLIENT_SECRET || !YT_REFRESH_TOKEN) { console.error('upload-youtube: YT_CLIENT_ID, YT_CLIENT_SECRET and YT_REFRESH_TOKEN must be set'); process.exit(1); }
if (!['private', 'unlisted', 'public'].includes(PRIVACY)) { console.error('upload-youtube: --privacy must be private, unlisted or public'); process.exit(1); }

const meta = JSON.parse(fs.readFileSync(META, 'utf8'));
const dir = path.dirname(META);
const video = path.join(dir, meta.file);
if (!UPDATE && !fs.existsSync(video)) { console.error(`upload-youtube: ${video} is missing; render first`); process.exit(1); }

/* ---- a bearer token from the refresh token -------------------------------- */
const tok = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ client_id: YT_CLIENT_ID, client_secret: YT_CLIENT_SECRET, refresh_token: YT_REFRESH_TOKEN, grant_type: 'refresh_token' }),
});
if (!tok.ok) { console.error('upload-youtube: token refresh failed', tok.status, await tok.text()); process.exit(1); }
const { access_token } = await tok.json();
const auth = { authorization: `Bearer ${access_token}` };
const fail = async (what, r) => { console.error(`upload-youtube: ${what} failed`, r.status, await r.text()); process.exit(1); };
const API = 'https://www.googleapis.com/youtube/v3';

const snippet = { title: meta.title, description: meta.description, categoryId: meta.categoryId || '28', defaultLanguage: 'en', defaultAudioLanguage: 'en' };
const status = { license: meta.licence || 'youtube', embeddable: true, selfDeclaredMadeForKids: false, containsSyntheticMedia: false };

let id;
if (UPDATE) {
  /* ---- bring an existing video up to the render's metadata ---------------- */
  id = UPDATE;
  const cur = await fetch(`${API}/videos?part=snippet,status&id=${id}`, { headers: auth });
  if (!cur.ok) await fail('reading the video', cur);
  const item = (await cur.json()).items?.[0];
  if (!item) { console.error(`upload-youtube: no video ${id} on this channel`); process.exit(1); }
  // The API replaces the whole part, so the current values are merged under the generated ones and privacy is left alone.
  const body = { id, snippet: { ...item.snippet, ...snippet }, status: { ...item.status, ...status } };
  const put = await fetch(`${API}/videos?part=snippet,status`, { method: 'PUT', headers: { ...auth, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!put.ok) await fail('update', put);
  console.log(`  video ${id}: title, description, category, language, licence set (privacy ${item.status.privacyStatus}, unchanged)`);
} else {
  /* ---- the video, resumable ---------------------------------------------- */
  const size = fs.statSync(video).size;
  const start = await fetch(`https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`, {
    method: 'POST', headers: { ...auth, 'content-type': 'application/json; charset=UTF-8', 'x-upload-content-type': 'video/mp4', 'x-upload-content-length': String(size) },
    body: JSON.stringify({ snippet, status: { privacyStatus: PRIVACY, ...status } }),
  });
  if (!start.ok) await fail('upload session', start);
  const session = start.headers.get('location');
  console.log(`  uploading ${meta.file} (${Math.round(size / 1048576)} MB) as ${PRIVACY}`);
  const put = await fetch(session, { method: 'PUT', headers: { 'content-type': 'video/mp4', 'content-length': String(size) }, body: Readable.toWeb(fs.createReadStream(video)), duplex: 'half' });
  if (!put.ok) await fail('upload', put);
  id = (await put.json()).id;
  console.log(`  video ${id}: https://youtu.be/${id}`);
}

/* ---- captions: replace the English track if one exists, else insert ------- */
if (meta.captions && fs.existsSync(path.join(dir, meta.captions))) {
  const srt = fs.readFileSync(path.join(dir, meta.captions));
  const list = await fetch(`${API}/captions?part=snippet&videoId=${id}`, { headers: auth });
  const existing = list.ok ? ((await list.json()).items || []).find((c) => c.snippet.language === 'en' && !c.snippet.isAutoSynced && c.snippet.trackKind !== 'asr') : null;
  const boundary = 'aedificare-' + Date.now();
  const part = (snip) => Buffer.concat([
    Buffer.from(`--${boundary}\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(snip)}\r\n--${boundary}\r\ncontent-type: application/octet-stream\r\n\r\n`),
    srt, Buffer.from(`\r\n--${boundary}--`),
  ]);
  const headers = { ...auth, 'content-type': `multipart/related; boundary=${boundary}` };
  const cap = existing
    ? await fetch('https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet', { method: 'PUT', headers, body: part({ id: existing.id, snippet: { isDraft: false } }) })
    : await fetch('https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet', { method: 'POST', headers, body: part({ snippet: { videoId: id, language: 'en', name: 'English', isDraft: false } }) });
  if (!cap.ok) console.error('  captions failed (the video is up):', cap.status, await cap.text()); else console.log(`  captions: ${meta.captions}${existing ? ' (replaced)' : ''}`);
}

/* ---- thumbnail (needs a phone-verified channel; otherwise YouTube keeps its own frame) ---- */
if (meta.thumbnail && fs.existsSync(path.join(dir, meta.thumbnail))) {
  const th = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${id}`, { method: 'POST', headers: { ...auth, 'content-type': 'image/png' }, body: fs.readFileSync(path.join(dir, meta.thumbnail)) });
  if (!th.ok) console.error('  thumbnail failed (the video is up):', th.status, await th.text()); else console.log(`  thumbnail: ${meta.thumbnail}`);
}

/* ---- playlist ------------------------------------------------------------- */
if (PLAYLIST) {
  const pl = await fetch(`${API}/playlistItems?part=snippet`, { method: 'POST', headers: { ...auth, 'content-type': 'application/json' }, body: JSON.stringify({ snippet: { playlistId: PLAYLIST, resourceId: { kind: 'youtube#video', videoId: id } } }) });
  if (!pl.ok) console.error('  playlist failed (the video is up):', pl.status, await pl.text()); else console.log(`  playlist: ${PLAYLIST}`);
}

fs.writeFileSync(path.join(dir, meta.kind === 'short' ? 'youtube-short.json' : 'youtube.json'), JSON.stringify({ id, url: `https://youtu.be/${id}`, privacy: UPDATE ? 'unchanged' : PRIVACY, mode: UPDATE ? 'update' : 'upload', at: new Date().toISOString(), title: meta.title }, null, 1) + '\n');
console.log(`  done: https://studio.youtube.com/video/${id}/edit`);
