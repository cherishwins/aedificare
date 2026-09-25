/**
 * Mint the refresh token that tools/upload-youtube.mjs and the film workflow
 * use. Run ONCE, on the owner's own machine, signed in as the channel's
 * Google account. No dependencies.
 *
 * Before running, in Google Cloud (console.cloud.google.com), free:
 *   1. A project (any name). APIs & Services → Library → enable "YouTube Data API v3".
 *   2. OAuth consent screen: External. Add the channel's Google account as a
 *      test user. Then set the publishing status to "In production": while it
 *      stays "Testing", Google expires every refresh token after seven days,
 *      which would break the pipeline weekly. Production without verification
 *      shows an "unverified app" warning on the consent page; click through it.
 *      Only this account ever consents, so verification is not needed.
 *   3. Credentials → Create credentials → OAuth client ID → Desktop app.
 *      Copy the client ID and secret. (There is no "YouTube API key" for
 *      uploads: an API key only reads public data; uploading acts on a
 *      channel and needs this OAuth client plus the refresh token below.)
 *   4. Apply for the API compliance audit under the same project as soon
 *      as it exists: until it passes, every video the API uploads is locked
 *      to private (see tools/upload-youtube.mjs).
 *
 *   YT_CLIENT_ID=... YT_CLIENT_SECRET=... node tools/youtube-auth.mjs
 *
 * It opens a consent URL (paste it into a browser if it does not open),
 * listens on 127.0.0.1 for the redirect, exchanges the code and prints the
 * refresh token. The three values live in two places, both set by the owner
 * and never pasted into a chat or a commit:
 *   1. The repository's Actions secrets (Settings → Secrets and variables →
 *      Actions) as YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN, so the
 *      film workflow uploads what it renders.
 *   2. The Claude Code cloud environment's variables (the environment menu
 *      in the session's title bar → Edit → environment variables, the same
 *      three names), so the builder can run upload-youtube.mjs --update and
 *      youtube-analytics.mjs from a session: set descriptions, captions and
 *      thumbnails on videos the owner uploaded by hand, and read the numbers.
 *      A new session picks them up.
 * Optionally YT_PLAYLIST_ID, the "Editions" playlist's id, as a repository
 * variable and environment variable.
 */
import http from 'node:http';
import { exec } from 'node:child_process';

const { YT_CLIENT_ID, YT_CLIENT_SECRET } = process.env;
if (!YT_CLIENT_ID || !YT_CLIENT_SECRET) { console.error('youtube-auth: set YT_CLIENT_ID and YT_CLIENT_SECRET'); process.exit(1); }
let redirect;
// upload: the video. force-ssl: metadata, captions, thumbnails, playlists. readonly and
// yt-analytics.readonly: tools/youtube-analytics.mjs, so the builder reads the channel's
// numbers. A token minted before the read scopes were added must be minted again.
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.force-ssl', 'https://www.googleapis.com/auth/youtube.readonly', 'https://www.googleapis.com/auth/yt-analytics.readonly'];

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (url.pathname !== '/') { res.writeHead(404); return res.end(); }
  const code = url.searchParams.get('code');
  if (!code) { res.writeHead(400); return res.end('no code'); }
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: YT_CLIENT_ID, client_secret: YT_CLIENT_SECRET, redirect_uri: redirect, grant_type: 'authorization_code' }),
  });
  const j = await r.json();
  if (!j.refresh_token) { res.end('No refresh token in the reply; revoke the app at myaccount.google.com/permissions and run again.'); console.error(j); process.exit(1); }
  res.end('Done. Close this tab; the refresh token is in the terminal.');
  console.log('\nYT_REFRESH_TOKEN=' + j.refresh_token + '\n\nStore it as a repository secret. It is shown once.');
  server.close();
});
server.listen(0, '127.0.0.1', () => {
  const port = server.address().port;
  redirect = `http://127.0.0.1:${port}/`;
  const u = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  u.search = new URLSearchParams({ client_id: YT_CLIENT_ID, redirect_uri: redirect, response_type: 'code', scope: SCOPES.join(' '), access_type: 'offline', prompt: 'consent' }).toString();
  console.log('Open this URL, signed in as the channel account:\n\n' + u.href + '\n');
  exec(`${process.platform === 'darwin' ? 'open' : 'xdg-open'} "${u.href}"`, () => {});
});
