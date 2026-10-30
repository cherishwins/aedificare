/**
 * Each published edition's lead image (CLAUDE.md, Decisions log, 30 Oct 2026): one of its own figures rendered alone
 * by tools/generate-lead.mjs, in three frames, content-hashed into public/lead/ and mapped by
 * src/lib/lead-manifest.json with its alt text. The NewsArticle's `image` lists the three first (16:9, 4:3, 1:1), then
 * the type card; og:image stays the card (override 2).
 *
 * Renders depend on the machine, so the build never makes them; this checks, with no network and on first use (the
 * article graph reads it, so a build stops), that the manifest holds: an entry for every published edition and none
 * for anything else, each frame at its size, the file on disk, a PNG of that size, named for its edition and frame
 * and the bytes its hash says, alt text, and no file under public/lead that nothing names.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PUBLISHED, EDITIONS } from './editions.mjs';

export const LEAD_FILE = 'src/lib/lead-manifest.json';
export const LEAD_DIR = 'public/lead';
/** The three frames Google's article image guidance names, largest first: 16:9, 4:3 and 1:1, each at least 1,200 px wide. */
export const FRAMES = { '16x9': { width: 1920, height: 1080 }, '4x3': { width: 1600, height: 1200 }, '1x1': { width: 1200, height: 1200 } };

const pngSize = (b) => (b.length >= 24 && b.subarray(0, 8).toString('hex') === '89504e470d0a1a0a' && b.toString('latin1', 12, 16) === 'IHDR' ? { width: b.readUInt32BE(16), height: b.readUInt32BE(20) } : null);

export function problems(raw = fs.existsSync(LEAD_FILE) ? JSON.parse(fs.readFileSync(LEAD_FILE, 'utf8')) : null) {
  const out = [];
  if (!raw || typeof raw !== 'object') return [`${LEAD_FILE} is missing; node tools/generate-lead.mjs writes it`];
  const named = new Set();
  for (const e of PUBLISHED) if (!raw[e.slug]) out.push(`${e.slug} is published and has no lead image; node tools/generate-lead.mjs ${e.slug}`);
  for (const [slug, x] of Object.entries(raw)) {
    const e = EDITIONS.find((y) => y.slug === slug);
    if (!e) { out.push(`${slug}: no edition has this slug`); continue; }
    if (e.draft) out.push(`${slug}: a draft has no lead image; it is made the day the edition is published`);
    if (!x.alt || !String(x.alt).trim()) out.push(`${slug}: the lead image has no alt text`);
    if (!x.figure) out.push(`${slug}: the manifest does not say which figure the image is`);
    for (const [key, { width, height }] of Object.entries(FRAMES)) {
      const f = x[key];
      const m = typeof f?.src === 'string' && f.src.match(new RegExp(`^/lead/${slug}-${key}\\.([0-9a-f]{8})\\.png$`));
      if (!m) { out.push(`${slug}: the ${key} image ${JSON.stringify(f?.src)} is not /lead/${slug}-${key}.<hash>.png`); continue; }
      if (f.width !== width || f.height !== height) out.push(`${slug}: the ${key} image is listed at ${f.width}x${f.height}, not ${width}x${height}`);
      const file = path.join('public', f.src);
      named.add(path.basename(file));
      if (!fs.existsSync(file)) { out.push(`${slug}: ${file} is missing`); continue; }
      const bytes = fs.readFileSync(file);
      const size = pngSize(bytes);
      if (!size || size.width !== width || size.height !== height) out.push(`${slug}: ${file} is not a ${width}x${height} PNG`);
      const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 8);
      if (hash !== m[1]) out.push(`${slug}: ${file} hashes to ${hash}, not the ${m[1]} its name says`);
    }
  }
  if (fs.existsSync(LEAD_DIR)) for (const f of fs.readdirSync(LEAD_DIR)) if (!named.has(f)) out.push(`${path.join(LEAD_DIR, f)} is named by no edition's entry`);
  return out;
}

let cache = null;
/** The lead image's three frames for a published edition, largest first, each { src, width, height }, and its alt; null for a draft. */
export const lead = (slug) => {
  if (!cache) {
    const bad = problems();
    if (bad.length) throw new Error(`lead: ${bad.length} problem(s) in ${LEAD_FILE}\n  ${bad.join('\n  ')}`);
    cache = JSON.parse(fs.readFileSync(LEAD_FILE, 'utf8'));
  }
  const x = cache[slug];
  return x ? { frames: Object.keys(FRAMES).map((k) => x[k]), alt: x.alt } : null;
};
