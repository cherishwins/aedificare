/**
 * Read the channel's numbers and write a report, so the builder can see what
 * the owner sees and the two of them read the same page. Same OAuth client
 * and refresh token as tools/upload-youtube.mjs; the token must have been
 * minted with the read scopes (tools/youtube-auth.mjs asks for youtube.readonly
 * and yt-analytics.readonly; a token minted before that needs minting again).
 *
 * What the Analytics API gives, per video and per day: views, watch time,
 * average view duration, average percentage viewed, subscribers gained and
 * lost, likes, shares, where the views came from, and the audience-retention
 * curve. What it does NOT give: impressions and impressions click-through
 * rate. Those live only in Studio's Reach tab, a gap YouTube has kept since
 * 2018, so of the two numbers the research said to watch (CTR against
 * average view duration) the CTR half is read by the owner in Studio and the
 * AVD half is here. Nothing here costs quota worth counting.
 *
 *   node tools/youtube-analytics.mjs [--days 28] [--retention] [--out brand/youtube/analytics]
 *
 * Writes <out>/<YYYY-MM-DD>.json (everything) and <out>/<YYYY-MM-DD>.md (the
 * report) and prints the report. brand/youtube/ is gitignored; a report the
 * owner should keep is pasted into chat or committed by hand.
 */
import fs from 'node:fs';
import path from 'node:path';

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const DAYS = +arg('--days', 28);
const OUT = arg('--out', 'brand/youtube/analytics');
const RETENTION = process.argv.includes('--retention');
const { YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN } = process.env;
if (!YT_CLIENT_ID || !YT_CLIENT_SECRET || !YT_REFRESH_TOKEN) { console.error('youtube-analytics: YT_CLIENT_ID, YT_CLIENT_SECRET and YT_REFRESH_TOKEN must be set'); process.exit(1); }

const tok = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ client_id: YT_CLIENT_ID, client_secret: YT_CLIENT_SECRET, refresh_token: YT_REFRESH_TOKEN, grant_type: 'refresh_token' }),
});
if (!tok.ok) { console.error('youtube-analytics: token refresh failed', tok.status, await tok.text()); process.exit(1); }
const { access_token } = await tok.json();
const auth = { authorization: `Bearer ${access_token}` };
const DATA = 'https://www.googleapis.com/youtube/v3';
const ANALYTICS = 'https://youtubeanalytics.googleapis.com/v2/reports';

async function get(url, what) {
  const r = await fetch(url, { headers: auth });
  if (r.status === 403) {
    const t = await r.text();
    if (/insufficient|scope/i.test(t)) { console.error(`youtube-analytics: the token lacks the read scopes. Mint it again with tools/youtube-auth.mjs (it now asks for youtube.readonly and yt-analytics.readonly).`); process.exit(1); }
    console.error(`youtube-analytics: ${what} failed 403`, t); process.exit(1);
  }
  if (!r.ok) { console.error(`youtube-analytics: ${what} failed`, r.status, await r.text()); process.exit(1); }
  return r.json();
}
const day = (d) => d.toISOString().slice(0, 10);
const end = new Date(); end.setUTCDate(end.getUTCDate() - 1); // yesterday: today is never complete
const start = new Date(end); start.setUTCDate(start.getUTCDate() - (DAYS - 1));
const range = `startDate=${day(start)}&endDate=${day(end)}`;
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

/* ---- the channel and its uploads (Data API) ------------------------------- */
const ch = (await get(`${DATA}/channels?part=id,snippet,statistics,contentDetails&mine=true`, 'channels')).items?.[0];
if (!ch) { console.error('youtube-analytics: this account has no channel'); process.exit(1); }
const uploads = ch.contentDetails.relatedPlaylists.uploads;
const videos = [];
for (let page = ''; ;) {
  const j = await get(`${DATA}/playlistItems?part=snippet,contentDetails&playlistId=${uploads}&maxResults=50${page ? `&pageToken=${page}` : ''}`, 'playlistItems');
  for (const it of j.items || []) videos.push({ id: it.contentDetails.videoId, title: it.snippet.title, published: it.contentDetails.videoPublishedAt || it.snippet.publishedAt });
  if (!j.nextPageToken) break; page = j.nextPageToken;
}
for (let i = 0; i < videos.length; i += 50) {
  const ids = videos.slice(i, i + 50).map((v) => v.id).join(',');
  const j = await get(`${DATA}/videos?part=statistics,contentDetails,status&id=${ids}`, 'videos');
  for (const it of j.items || []) {
    const v = videos.find((x) => x.id === it.id);
    const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(it.contentDetails.duration) || [];
    Object.assign(v, { seconds: (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0), privacy: it.status.privacyStatus, lifetimeViews: +it.statistics.viewCount || 0, likes: +it.statistics.likeCount || 0, comments: +it.statistics.commentCount || 0 });
  }
}

/* ---- the window (Analytics API) ------------------------------------------ */
const rows = (j) => (j.rows || []).map((r) => Object.fromEntries(j.columnHeaders.map((h, i) => [h.name, r[i]])));
const perVideo = rows(await get(`${ANALYTICS}?ids=channel==MINE&${range}&metrics=views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,likes,shares&dimensions=video&sort=-views&maxResults=200`, 'per-video report'));
const perDay = rows(await get(`${ANALYTICS}?ids=channel==MINE&${range}&metrics=views,estimatedMinutesWatched,subscribersGained,subscribersLost&dimensions=day&sort=day`, 'per-day report'));
const traffic = rows(await get(`${ANALYTICS}?ids=channel==MINE&${range}&metrics=views,estimatedMinutesWatched&dimensions=insightTrafficSourceType&sort=-views`, 'traffic report'));
const totals = perDay.reduce((a, r) => ({ views: a.views + r.views, minutes: a.minutes + r.estimatedMinutesWatched, gained: a.gained + r.subscribersGained, lost: a.lost + r.subscribersLost }), { views: 0, minutes: 0, gained: 0, lost: 0 });
const retention = {};
if (RETENTION) {
  for (const v of videos.filter((x) => x.privacy === 'public')) {
    const j = await get(`${ANALYTICS}?ids=channel==MINE&${range}&metrics=audienceWatchRatio,relativeRetentionPerformance&dimensions=elapsedVideoTimeRatio&filters=video==${v.id}`, `retention for ${v.id}`);
    const r = rows(j);
    if (r.length) retention[v.id] = r;
  }
}

/* ---- the report ----------------------------------------------------------- */
const byId = Object.fromEntries(perVideo.map((r) => [r.video, r]));
const lines = [];
lines.push(`# ${ch.snippet.title} · ${day(start)} to ${day(end)} (${DAYS} days)`, '');
lines.push(`Subscribers ${ch.statistics.subscriberCount} · lifetime views ${ch.statistics.viewCount} · videos ${ch.statistics.videoCount}`);
lines.push(`Window: ${totals.views} views · ${(totals.minutes / 60).toFixed(1)} watch hours · subscribers +${totals.gained} -${totals.lost}`, '');
lines.push('## Videos', '', '| Video | Published | Length | Privacy | Views (window) | Views (life) | Watch h | AVD | Avg % | Subs +/- |', '|---|---|---|---|---|---|---|---|---|---|');
for (const v of videos.sort((a, b) => (b.published || '').localeCompare(a.published || ''))) {
  const r = byId[v.id] || {};
  lines.push(`| ${v.title} | ${(v.published || '').slice(0, 10)} | ${mmss(v.seconds || 0)} | ${v.privacy} | ${r.views ?? 0} | ${v.lifetimeViews} | ${((r.estimatedMinutesWatched || 0) / 60).toFixed(1)} | ${r.averageViewDuration ? mmss(r.averageViewDuration) : '-'} | ${r.averageViewPercentage ? r.averageViewPercentage.toFixed(0) + '%' : '-'} | +${r.subscribersGained || 0} -${r.subscribersLost || 0} |`);
}
lines.push('', '## Where the views came from', '', '| Source | Views | Watch h |', '|---|---|---|');
for (const t of traffic) lines.push(`| ${t.insightTrafficSourceType} | ${t.views} | ${(t.estimatedMinutesWatched / 60).toFixed(1)} |`);
lines.push('', '## By day', '', '| Day | Views | Watch h | Subs +/- |', '|---|---|---|---|');
for (const d of perDay) lines.push(`| ${d.day} | ${d.views} | ${(d.estimatedMinutesWatched / 60).toFixed(1)} | +${d.subscribersGained} -${d.subscribersLost} |`);
if (RETENTION) {
  lines.push('', '## Retention', '', 'Share of viewers still watching at 2 percent, 10 percent and 50 percent of the film, and where the curve first drops under half. The first fifteen seconds of a fourteen-minute film are the 2 percent mark.', '', '| Video | at 2% | at 10% | at 50% | under half at |', '|---|---|---|---|---|');
  for (const v of videos) {
    const r = retention[v.id]; if (!r) continue;
    const at = (x) => { const p = r.find((q) => Math.abs(q.elapsedVideoTimeRatio - x) < 0.006); return p ? (p.audienceWatchRatio * 100).toFixed(0) + '%' : '-'; };
    const half = r.find((q) => q.audienceWatchRatio < 0.5);
    lines.push(`| ${v.title} | ${at(0.02)} | ${at(0.10)} | ${at(0.50)} | ${half ? mmss(half.elapsedVideoTimeRatio * (v.seconds || 0)) : 'never'} |`);
  }
}
lines.push('', 'Impressions and click-through rate are not in the API: read them in Studio, Analytics, Reach.', '');

fs.mkdirSync(OUT, { recursive: true });
const stamp = day(new Date());
fs.writeFileSync(path.join(OUT, `${stamp}.json`), JSON.stringify({ channel: ch, window: { start: day(start), end: day(end) }, videos, perVideo, perDay, traffic, retention }, null, 1) + '\n');
fs.writeFileSync(path.join(OUT, `${stamp}.md`), lines.join('\n'));
console.log(lines.join('\n'));
console.log(`written ${OUT}/${stamp}.md and .json`);
