/**
 * The films on the site: each published edition's current film, once it is
 * public, as a link to its YouTube watch page with its own thumbnail served
 * from this origin (CLAUDE.md, Decisions log, 21 Oct 2026). Nothing is
 * embedded: no iframe, no script, no request to anyone else when a page
 * loads; the link is the only way out.
 *
 * Read from src/lib/films.json, which tools/films.mjs writes from the
 * releases (the id from a release's youtube.json, the length from its film's
 * own MP4 header, the thumbnail from its meta.json) and never by hand. What
 * is public cannot be read from here, so the tool is told which ids are.
 * This module checks, with no network, that what the tool wrote still holds,
 * and the build stops if it does not: an entry for an edition that is not
 * published, an id that is not eleven characters or is linked twice, a length
 * that is not the measured file's rounded up, a source that is not the
 * edition's own release, a thumbnail that is missing, not named for its
 * edition, not the size below or not the bytes its hashed name says, or a
 * file under public/film that nothing links. Whether each link is still the
 * film its release files is `node tools/films.mjs --check --online`
 * (verify.yml), and whether it is still public only the channel's own list
 * can say (tools/youtube-channel.mjs).
 *
 * Paths are read from the working directory, as the home reads its PDF
 * sizes: Astro builds from the repository root, and so do the tools.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { EDITIONS } from './editions.mjs';

export const FILMS_FILE = 'src/lib/films.json';
export const FILMS_DIR = 'public/film';
/**
 * The thumbnail is shown at 112 by 63. Every thumbnail so far sets one word or
 * figure in Acid; at 63 px the tallest is 15 px of ink by the Acid probe's own
 * reading (The Markup's $18,214; 1,200 with its comma's tail and 9,000+
 * read 14), under the 16 px capital of 24 px type, which is where
 * tools/verify.cjs starts counting Acid "at scale". At 128 by 72 the comma
 * took 1,200 to 16 px, level with the capital, so the size came down. The
 * check below holds every entry to this size, and the sweep fails any film
 * thumbnail whose Acid ink reaches the capital where it is shown, whatever
 * else its surface spends.
 */
export const THUMB = { width: 112, height: 63 };
export const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
/**
 * The player an edition page loads when, and only when, its reader plays the film: YouTube's
 * privacy-enhanced host, started by that click (autoplay), inline on iOS (playsinline), a white
 * progress bar rather than YouTube's red (color), and the end screen's suggestions from this
 * channel only (rel). Written into the page as an inert data attribute; src/scripts/aed.js turns it
 * into an iframe on the click, and tools/verify.cjs asserts the iframe it makes is this URL.
 */
export const EMBED_HOST = 'https://www.youtube-nocookie.com';
export const embedUrl = (id) => `${EMBED_HOST}/embed/${id}?autoplay=1&playsinline=1&rel=0&color=white`;
/** 865 seconds is 14:25; an hour or more is h:mm:ss. */
export const clock = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
};
/** 1096 seconds is PT18M16S, for a <time datetime> that says the length is a duration and not a time of day. */
export const isoDuration = (s) => `PT${Math.floor(s / 3600) ? `${Math.floor(s / 3600)}H` : ''}${Math.floor((s % 3600) / 60) ? `${Math.floor((s % 3600) / 60)}M` : ''}${s % 60 || s < 60 ? `${s % 60}S` : ''}`;
/**
 * The length a link shows: the film file's own, rounded UP to the second,
 * because that is what YouTube shows. Measured 21 Oct 2026 from the MP4
 * headers: 1,095.375, 818.125 and 864.959 s, which YouTube lists as 18:16,
 * 13:39 and 14:25; meta.json's rounded 1,095 and 818 read a second short.
 */
export const lengthOf = (seconds) => Math.ceil(seconds);

const pngSize = (bytes) => {
  const sig = '89504e470d0a1a0a';
  if (bytes.length < 24 || bytes.subarray(0, 8).toString('hex') !== sig || bytes.toString('latin1', 12, 16) !== 'IHDR') return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};
const ISO = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/;

/** Everything wrong with a films.json object, as sentences; empty when it holds. */
export function problems(raw) {
  const out = [];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [`${FILMS_FILE} is not an object keyed by edition`];
  const linked = new Set();
  const ids = new Map();
  for (const [slug, f] of Object.entries(raw)) {
    const e = EDITIONS.find((x) => x.slug === slug);
    if (!e) { out.push(`${slug}: no edition has this slug`); continue; }
    if (e.draft) out.push(`${slug}: the edition is a draft, and a draft's film is not linked`);
    if (!/^[A-Za-z0-9_-]{11}$/.test(f?.id ?? '')) out.push(`${slug}: id ${JSON.stringify(f?.id)} is not an eleven-character YouTube id`);
    else if (ids.has(f.id)) out.push(`${slug}: id ${f.id} is already ${ids.get(f.id)}'s film; one video is one edition's`);
    else ids.set(f.id, slug);
    // The length is the film file's, measured, and the link shows it rounded up: both are in the entry, so they must agree.
    const s = f?.source ?? {};
    if (s.release !== `film-${slug}`) out.push(`${slug}: the film's source release ${JSON.stringify(s.release)} is not film-${slug}`);
    if (!new RegExp(`^${slug}-film-\\d+x\\d+\\.mp4$`).test(s.asset ?? '')) out.push(`${slug}: the film's source asset ${JSON.stringify(s.asset)} is not ${slug}-film-<w>x<h>.mp4`);
    if (!Number.isInteger(s.bytes) || s.bytes <= 0 || !ISO.test(s.updated ?? '')) out.push(`${slug}: the film's source has no size and filing time, so a later render cannot be told from it`);
    if (!(Number.isFinite(s.seconds) && s.seconds > 0)) out.push(`${slug}: the film's measured length ${JSON.stringify(s.seconds)} is not a number of seconds`);
    else if (f.duration !== lengthOf(s.seconds)) out.push(`${slug}: duration ${JSON.stringify(f.duration)} is not the measured ${s.seconds} s rounded up (${lengthOf(s.seconds)}), as YouTube shows it`);
    const t = f?.thumb ?? {};
    if (t.width !== THUMB.width || t.height !== THUMB.height) out.push(`${slug}: the thumbnail is ${t.width}x${t.height}, not the ${THUMB.width}x${THUMB.height} it is shown at (src/lib/films.mjs says why)`);
    if (!t.alt || !String(t.alt).trim()) out.push(`${slug}: the thumbnail has no alt text`);
    const ts = t.source ?? {};
    if (ts.release !== `film-${slug}` || !new RegExp(`^${slug}-thumb-\\d+x\\d+\\.png$`).test(ts.asset ?? '') || !/^[0-9a-f]{64}$/.test(ts.sha256 ?? '')) out.push(`${slug}: the thumbnail's source ${JSON.stringify(ts)} is not film-${slug}'s ${slug}-thumb-<w>x<h>.png with its sha256`);
    for (const [key, scale] of [['src', 1], ['src2x', 2]]) {
      const src = t[key];
      // Named for its own edition, so one edition's entry cannot point at another's picture.
      const m = typeof src === 'string' && src.match(new RegExp(`^/film/${slug}${scale > 1 ? `-${scale}x` : ''}\\.([0-9a-f]{8})\\.png$`));
      if (!m) { out.push(`${slug}: thumbnail ${key} ${JSON.stringify(src)} is not /film/${slug}${scale > 1 ? `-${scale}x` : ''}.<hash>.png`); continue; }
      const file = path.join('public', src);
      linked.add(path.basename(src));
      if (!fs.existsSync(file)) { out.push(`${slug}: thumbnail ${file} is missing`); continue; }
      const bytes = fs.readFileSync(file);
      const size = pngSize(bytes);
      if (!size) { out.push(`${slug}: ${file} is not a PNG`); continue; }
      if (size.width !== THUMB.width * scale || size.height !== THUMB.height * scale) out.push(`${slug}: ${file} is ${size.width}x${size.height}, not ${THUMB.width * scale}x${THUMB.height * scale}`);
      const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 8);
      if (hash !== m[1]) out.push(`${slug}: ${file} hashes to ${hash}, not the ${m[1]} its name says`);
    }
  }
  // A thumbnail nothing links would ship for nothing, and say a film is out that is not.
  if (fs.existsSync(FILMS_DIR)) for (const f of fs.readdirSync(FILMS_DIR)) if (!linked.has(f)) out.push(`${path.join(FILMS_DIR, f)} is linked by no entry`);
  return out;
}

export const readFilms = () => (fs.existsSync(FILMS_FILE) ? JSON.parse(fs.readFileSync(FILMS_FILE, 'utf8')) : {});

/** The films that are out, in the editions' order: { slug, id, url, duration, length, iso, thumb }. Checked on first use, so a build that reads one stops on a films.json that does not hold. */
let cache = null;
export const films = () => {
  if (cache) return cache;
  const raw = readFilms();
  const bad = problems(raw);
  if (bad.length) throw new Error(`films: ${bad.length} problem(s) in ${FILMS_FILE}; tools/films.mjs writes it\n  ${bad.join('\n  ')}`);
  cache = EDITIONS.filter((e) => raw[e.slug]).map((e) => {
    const f = raw[e.slug];
    return { slug: e.slug, id: f.id, url: watchUrl(f.id), embed: embedUrl(f.id), duration: f.duration, length: clock(f.duration), iso: isoDuration(f.duration), thumb: f.thumb };
  });
  return cache;
};
export const film = (slug) => films().find((f) => f.slug === slug);
