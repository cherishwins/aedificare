/**
 * Upload a rendered film (or Short) to YouTube through the Data API v3, with
 * its captions and thumbnail, from the meta.json the render wrote. The
 * second half of the publish pipeline: the film workflow renders on merge or
 * dispatch, this puts the result on the channel as PRIVATE by default, and
 * the owner presses Publish after watching it. Nothing here is typed: the
 * title, description and files come from meta.json, which came from the
 * editions list and the built page.
 *
 * Credentials, never in the repo: YT_CLIENT_ID, YT_CLIENT_SECRET and
 * YT_REFRESH_TOKEN in the environment (repository secrets on Actions; a
 * local shell on a Mac). tools/youtube-auth.mjs mints the refresh token
 * once. Scopes: youtube.upload (the video) and youtube.force-ssl (captions,
 * thumbnails, playlists).
 *
 * THE PRIVATE LOCK. YouTube locks every video uploaded through the API by
 * an API project created after 28 July 2020 to private until that project
 * passes YouTube's API compliance audit (a free form, days to weeks); the
 * owner cannot flip such a video to public in Studio. So this step is a
 * staging step until the audit is done: the film lands in Studio, private,
 * with its metadata and captions in place. To publish before the audit,
 * upload the same file by hand in Studio using sheet.txt. Apply for the
 * audit at https://support.google.com/youtube/contact/yt_api_form
 * (developers.google.com/youtube/v3/revision_history, 28 July 2020).
 *
 * Quota: an upload costs 1,600 of the project's 10,000 daily units; captions
 * 400; a thumbnail 50; a playlist insert 50. Five films a day is the ceiling
 * without asking Google for more, which this brand will never need.
 *
 *   node tools/upload-youtube.mjs brand/youtube/edition-03/meta.json [--privacy private|unlisted|public] [--playlist <id>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const META = process.argv[2];
const PRIVACY = arg('--privacy', 'private');
const PLAYLIST = arg('--playlist', process.env.YT_PLAYLIST_ID || null);
if (!META || !fs.existsSync(META)) { console.error('upload-youtube: pass the path to a meta.json written by generate-film'); process.exit(1); }
const { YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN } = process.env;
if (!YT_CLIENT_ID || !YT_CLIENT_SECRET || !YT_REFRESH_TOKEN) { console.error('upload-youtube: YT_CLIENT_ID, YT_CLIENT_SECRET and YT_REFRESH_TOKEN must be set'); process.exit(1); }
if (!['private', 'unlisted', 'public'].includes(PRIVACY)) { console.error('upload-youtube: --privacy must be private, unlisted or public'); process.exit(1); }

const meta = JSON.parse(fs.readFileSync(META, 'utf8'));
const dir = path.dirname(META);
const video = path.join(dir, meta.file);
if (!fs.existsSync(video)) { console.error(`upload-youtube: ${video} is missing; render first`); process.exit(1); }

/* ---- a bearer token from the refresh token -------------------------------- */
const tok = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ client_id: YT_CLIENT_ID, client_secret: YT_CLIENT_SECRET, refresh_token: YT_REFRESH_TOKEN, grant_type: 'refresh_token' }),
});
if (!tok.ok) { console.error('upload-youtube: token refresh failed', tok.status, await tok.text()); process.exit(1); }
const { access_token } = await tok.json();
const auth = { authorization: `Bearer ${access_token}` };
const fail = async (what, r) => { console.error(`upload-youtube: ${what} failed`, r.status, await r.text()); process.exit(1); };

/* ---- the video, resumable ------------------------------------------------- */
const size = fs.statSync(video).size;
const body = {
  snippet: { title: meta.title, description: meta.description, categoryId: meta.categoryId || '28', defaultLanguage: 'en', defaultAudioLanguage: 'en' },
  status: { privacyStatus: PRIVACY, license: meta.licence || 'youtube', embeddable: true, selfDeclaredMadeForKids: false, containsSyntheticMedia: false },
};
const start = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
  method: 'POST', headers: { ...auth, 'content-type': 'application/json; charset=UTF-8', 'x-upload-content-type': 'video/mp4', 'x-upload-content-length': String(size) },
  body: JSON.stringify(body),
});
if (!start.ok) await fail('upload session', start);
const session = start.headers.get('location');
console.log(`  uploading ${meta.file} (${Math.round(size / 1048576)} MB) as ${PRIVACY}`);
const put = await fetch(session, { method: 'PUT', headers: { 'content-type': 'video/mp4', 'content-length': String(size) }, body: Readable.toWeb(fs.createReadStream(video)), duplex: 'half' });
if (!put.ok) await fail('upload', put);
const uploaded = await put.json();
const id = uploaded.id;
console.log(`  video ${id}: https://youtu.be/${id}`);

/* ---- captions ------------------------------------------------------------- */
if (meta.captions && fs.existsSync(path.join(dir, meta.captions))) {
  const boundary = 'aedificare-' + Date.now();
  const srt = fs.readFileSync(path.join(dir, meta.captions));
  const part = Buffer.concat([
    Buffer.from(`--${boundary}\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ snippet: { videoId: id, language: 'en', name: 'English', isDraft: false } })}\r\n--${boundary}\r\ncontent-type: application/octet-stream\r\n\r\n`),
    srt, Buffer.from(`\r\n--${boundary}--`),
  ]);
  const cap = await fetch('https://www.googleapis.com/upload/youtube/v3/captions?uploadType=multipart&part=snippet', { method: 'POST', headers: { ...auth, 'content-type': `multipart/related; boundary=${boundary}` }, body: part });
  if (!cap.ok) console.error('  captions failed (the video is up):', cap.status, await cap.text()); else console.log(`  captions: ${meta.captions}`);
}

/* ---- thumbnail (needs a phone-verified channel; otherwise YouTube keeps its own frame) ---- */
if (meta.thumbnail && fs.existsSync(path.join(dir, meta.thumbnail))) {
  const th = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${id}`, { method: 'POST', headers: { ...auth, 'content-type': 'image/png' }, body: fs.readFileSync(path.join(dir, meta.thumbnail)) });
  if (!th.ok) console.error('  thumbnail failed (the video is up):', th.status, await th.text()); else console.log(`  thumbnail: ${meta.thumbnail}`);
}

/* ---- playlist ------------------------------------------------------------- */
if (PLAYLIST) {
  const pl = await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', { method: 'POST', headers: { ...auth, 'content-type': 'application/json' }, body: JSON.stringify({ snippet: { playlistId: PLAYLIST, resourceId: { kind: 'youtube#video', videoId: id } } }) });
  if (!pl.ok) console.error('  playlist failed (the video is up):', pl.status, await pl.text()); else console.log(`  playlist: ${PLAYLIST}`);
}

fs.writeFileSync(path.join(dir, meta.kind === 'short' ? 'youtube-short.json' : 'youtube.json'), JSON.stringify({ id, url: `https://youtu.be/${id}`, privacy: PRIVACY, uploaded: new Date().toISOString(), title: meta.title }, null, 1) + '\n');
console.log(`  done: https://studio.youtube.com/video/${id}/edit`);
