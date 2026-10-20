/**
 * Files a film's title and description again without rendering it. A render writes meta.json (and meta-short.json)
 * with tools/lib/film-meta.mjs; this rebuilds them, and the upload sheets, from the same release's own script.json
 * and narration.json, so a title typed in src/lib/editions.mjs (`youtube`) or a change to the description reaches
 * the release in seconds and then the channel through youtube.yml action=sync. Everything else in the meta (the
 * files, the duration, the music credit) is kept as the render wrote it.
 *
 *   node tools/film-meta.mjs --slug edition-03 [--short] [--dry | --check]
 *
 * Reads and writes brand/youtube/<slug>/ (--dir to point elsewhere). It prints the title and a line diff of the
 * description against the meta already there; --dry then writes nothing, and --check writes nothing and exits 1
 * if they differ.
 * .github/workflows/film-meta.yml runs it over the releases.
 */
import fs from 'node:fs';
import path from 'node:path';
import { EDITIONS } from '../src/lib/editions.mjs';
import { filmMeta, sheetText } from './lib/film-meta.mjs';
import { lineDiff } from './lib/diff.mjs';

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const SLUG = arg('--slug', null);
const SHORT = process.argv.includes('--short');
const CHECK = process.argv.includes('--check');
const DRY = process.argv.includes('--dry');
const fail = (msg) => { console.error(`film-meta: ${msg}`); process.exit(1); };
if (!SLUG) fail('--slug <edition> is required');
const E = EDITIONS.find((e) => e.slug === SLUG);
if (!E) fail(`no edition ${SLUG}`);
const DIR = arg('--dir', path.join('brand/youtube', SLUG));
const metaName = SHORT ? 'meta-short.json' : 'meta.json';
const read = (name) => {
  const p = path.join(DIR, name);
  if (!fs.existsSync(p)) fail(`${p} is missing; download it from the release film-${SLUG} first`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
};
const old = read(metaName), S = read('script.json'), N = read('narration.json');
// The music credit is the one line only the render knows (the computed bed, a licensed file or none): kept as filed.
const musicLine = String(old.description || '').split('\n').find((l) => l.startsWith('Music:'));
if (!musicLine) fail(`${metaName} has no Music: line to keep`);
const next = filmMeta(E, S, N, { short: SHORT, musicLine });

const changed = old.title !== next.title || old.description !== next.description;
console.log(`${SLUG} ${SHORT ? 'short' : 'film'}: ${changed ? 'changes' : 'unchanged'}`);
if (old.title !== next.title) console.log(`  title  - ${old.title}\n  title  + ${next.title}`);
if (old.description !== next.description) console.log(lineDiff(old.description, next.description).replace(/^/gm, '  '));
if (CHECK) process.exit(changed ? 1 : 0);
if (DRY || !changed) process.exit(0);

fs.writeFileSync(path.join(DIR, metaName), JSON.stringify({ ...old, title: next.title, description: next.description }, null, 1) + '\n');
fs.writeFileSync(path.join(DIR, SHORT ? 'sheet-short.txt' : 'sheet.txt'), sheetText(E, next, { short: SHORT, captions: old.captions, thumbnail: old.thumbnail, file: old.file }));
console.log(`  wrote ${metaName} and ${SHORT ? 'sheet-short.txt' : 'sheet.txt'}`);
