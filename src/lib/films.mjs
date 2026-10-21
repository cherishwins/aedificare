/**
 * The films on the site: each published edition's current film, once it is
 * public, as a link to its YouTube watch page with its own thumbnail served
 * from this origin (CLAUDE.md, Decisions log, 21 Oct 2026). Nothing is
 * embedded: no iframe, no script, no request to anyone else when a page
 * loads; the link is the only way out.
 *
 * Read from src/lib/films.json, which tools/films.mjs writes from the
 * releases (the id from a release's youtube.json, the length and the
 * thumbnail from its meta.json) and never by hand. What is public cannot be
 * read from here, so the tool is told which ids are; this module only checks
 * that what it wrote still holds, and the build stops if it does not: an
 * entry for an edition that is not published, an id that is not eleven
 * characters, a thumbnail that is missing, the wrong size or not the bytes
 * its hashed name says, or a file under public/film that nothing links.
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
export const watchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
/** 865 seconds is 14:25; an hour or more is h:mm:ss. */
export const clock = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
};

const pngSize = (bytes) => {
  const sig = '89504e470d0a1a0a';
  if (bytes.length < 24 || bytes.subarray(0, 8).toString('hex') !== sig || bytes.toString('latin1', 12, 16) !== 'IHDR') return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};

/** Everything wrong with a films.json object, as sentences; empty when it holds. */
export function problems(raw) {
  const out = [];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [`${FILMS_FILE} is not an object keyed by edition`];
  const linked = new Set();
  for (const [slug, f] of Object.entries(raw)) {
    const e = EDITIONS.find((x) => x.slug === slug);
    if (!e) { out.push(`${slug}: no edition has this slug`); continue; }
    if (e.draft) out.push(`${slug}: the edition is a draft, and a draft's film is not linked`);
    if (!/^[A-Za-z0-9_-]{11}$/.test(f?.id ?? '')) out.push(`${slug}: id ${JSON.stringify(f?.id)} is not an eleven-character YouTube id`);
    if (!Number.isInteger(f?.duration) || f.duration <= 0) out.push(`${slug}: duration ${JSON.stringify(f?.duration)} is not a whole number of seconds`);
    const t = f?.thumb ?? {};
    if (!Number.isInteger(t.width) || !Number.isInteger(t.height)) { out.push(`${slug}: the thumbnail has no width and height`); continue; }
    if (!t.alt || !String(t.alt).trim()) out.push(`${slug}: the thumbnail has no alt text`);
    for (const [key, scale] of [['src', 1], ['src2x', 2]]) {
      const src = t[key];
      const m = typeof src === 'string' && src.match(/^\/film\/[a-z0-9-]+\.([0-9a-f]{8})\.png$/);
      if (!m) { out.push(`${slug}: thumbnail ${key} ${JSON.stringify(src)} is not /film/<name>.<hash>.png`); continue; }
      const file = path.join('public', src);
      linked.add(path.basename(src));
      if (!fs.existsSync(file)) { out.push(`${slug}: thumbnail ${file} is missing`); continue; }
      const bytes = fs.readFileSync(file);
      const size = pngSize(bytes);
      if (!size) { out.push(`${slug}: ${file} is not a PNG`); continue; }
      if (size.width !== t.width * scale || size.height !== t.height * scale) out.push(`${slug}: ${file} is ${size.width}x${size.height}, not ${t.width * scale}x${t.height * scale}`);
      const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 8);
      if (hash !== m[1]) out.push(`${slug}: ${file} hashes to ${hash}, not the ${m[1]} its name says`);
    }
  }
  // A thumbnail nothing links would ship for nothing, and say a film is out that is not.
  if (fs.existsSync(FILMS_DIR)) for (const f of fs.readdirSync(FILMS_DIR)) if (!linked.has(f)) out.push(`${path.join(FILMS_DIR, f)} is linked by no entry`);
  return out;
}

export const readFilms = () => (fs.existsSync(FILMS_FILE) ? JSON.parse(fs.readFileSync(FILMS_FILE, 'utf8')) : {});

/** The films that are out, in the editions' order: { slug, id, url, duration, length, thumb }. Checked on first use, so a build that reads one stops on a films.json that does not hold. */
let cache = null;
export const films = () => {
  if (cache) return cache;
  const raw = readFilms();
  const bad = problems(raw);
  if (bad.length) throw new Error(`films: ${bad.length} problem(s) in ${FILMS_FILE}; tools/films.mjs writes it\n  ${bad.join('\n  ')}`);
  cache = EDITIONS.filter((e) => raw[e.slug]).map((e) => {
    const f = raw[e.slug];
    return { slug: e.slug, id: f.id, url: watchUrl(f.id), duration: f.duration, length: clock(f.duration), thumb: f.thumb };
  });
  return cache;
};
export const film = (slug) => films().find((f) => f.slug === slug);
