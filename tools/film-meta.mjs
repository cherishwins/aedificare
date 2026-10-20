/**
 * Files a film's title and description again without rendering it. A render writes meta.json (and meta-short.json)
 * with tools/lib/film-meta.mjs; this rebuilds them, and the upload sheets, from the same release's own script.json
 * and narration.json, so a title typed in src/lib/editions.mjs (`youtube`) or a change to the description reaches
 * the release in seconds and then the channel through youtube.yml action=sync. Everything else in the meta (the
 * files, the duration, the music credit) is kept as the render wrote it.
 *
 *   node tools/film-meta.mjs --slug edition-03 [--short] [--dry | --check]
 *   node tools/film-meta.mjs --test
 *
 * Reads and writes brand/youtube/<slug>/ (--dir to point elsewhere). It prints the title and a line diff of the
 * description against the meta already there; --dry then writes nothing, and --check writes nothing and exits 1
 * if they differ.
 * A re-cut (tools/cuts.mjs) marks its meta with `recut`, the hash of its cut list, and files cuts.json beside it,
 * whose credits name the pages it shows: the refile reads them, so the next title change cannot strip the credits
 * and put back "every frame is computed". A meta marked as a re-cut with no cuts.json, or with another list's, fails.
 * --test builds every published edition's description, plain and as a re-cut, and fails unless each still names the
 * channel's voice where film.yml's skip test and the upload guard look for it, and fits YouTube's limits.
 * .github/workflows/film-meta.yml runs it over the releases; verify.yml runs --test.
 */
import fs from 'node:fs';
import path from 'node:path';
import { EDITIONS, PUBLISHED } from '../src/lib/editions.mjs';
import { NARRATOR } from '../src/config.mjs';
import { filmMeta, sheetText, metaIssues, voiceText, DESCRIPTION_MAX } from './lib/film-meta.mjs';
import { lineDiff } from './lib/diff.mjs';

const arg = (name, dflt) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; };
const fail = (msg) => { console.error(`film-meta: ${msg}`); process.exit(1); };

if (process.argv.includes('--test')) {
  // The narrator as the workflows set it: film.yml takes the voice id after the engine's prefix and greps for it.
  const narrator = process.env.NARRATOR || NARRATOR;
  const V = narrator.replace(/^(gemini|eleven):/, '');
  const N = (E) => ({ model: 'eleven_v4_turbo', voice: V, duration: 900, blocks: (E.contents || []).map((c, i) => ({ kind: 'h2', text: c.t, start: 12 + i * 80 })) });
  const S = { sources: 54, sections: 12 };
  const musicLine = 'Music: computed from r = cos(kθ), seed 0; no third-party audio.';
  // A re-cut's credits as cuts.mjs writes them, at the length the source-heavy films would carry: every source shown.
  const credit = (n) => ({ n: String(n).padStart(2, '0'), line: `[${String(n).padStart(2, '0')}] A Publisher Of Ordinary Length, 12 Sep 2026`, own: false, pixels: true });
  const cuts = (k) => ({ credits: { film: Array.from({ length: k }, (_, i) => credit(i + 1)), short: [credit(2), { n: '11', line: '[11] The Markup, 15 Sep 2026, this site', own: true, pixels: true }] } });
  const problems = [];
  for (const E of PUBLISHED) for (const short of [false, true]) for (const [how, c] of [['plain', null], ['re-cut', cuts(54)], ['re-cut, nothing shown', { credits: { film: [], short: [] } }]]) {
    const fm = filmMeta(E, S, N(E), { short, musicLine, cuts: c });
    const where = `${E.slug} ${short ? 'short' : 'film'}, ${how}`;
    for (const x of metaIssues(fm, N(E))) problems.push(`${where}: ${x}`);
    // film.yml: `jq -r .description meta.json | grep -qiF -- "$V"`; tools/youtube-channel.mjs: the same, case-blind.
    if (!fm.description.toLowerCase().includes(V.toLowerCase())) problems.push(`${where}: the description does not name ${V}`);
    const line = fm.description.split('\n').find((l) => l.startsWith(voiceText(N(E))));
    if (c && line !== `${voiceText(N(E))}.`) problems.push(`${where}: the voice is not on a line of its own ("${line}")`);
    if (!c && !/^Voice: synthetic, \S+ \S+\. Every frame is computed from r = cos\(kθ\), seed \S+, k \S+\.$/.test(line || '')) problems.push(`${where}: the plain line changed, so every refile would rewrite every film ("${line}")`);
    if (c?.credits.film.length && !short && /Every frame is computed/.test(fm.description)) problems.push(`${where}: a re-cut that shows its sources' pages still says every frame is computed`);
  }
  // The owner's footage is someone's pixels too: a re-cut that shows footage and no source page never says every frame
  // is computed, says the footage is not, and carries its credits.txt line.
  const foot = { n: null, id: 'bench', line: 'bench: the creator, his own file, licensed by email', own: false, pixels: true, footage: true };
  for (const E of PUBLISHED) {
    const d = filmMeta(E, S, N(E), { musicLine, cuts: { credits: { film: [foot], short: [] } } }).description;
    if (/Every frame is computed/.test(d) || !/^Computed from .*, except the footage credited below\.$/m.test(d) || !d.split('\n').includes(foot.line)) problems.push(`${E.slug} film, footage only: the frame line does not name the footage, or its credit is missing`);
  }
  // The limit bites: a re-cut whose credits cannot fit is caught here, at filing, and not by the upload.
  const E = PUBLISHED[0], big = filmMeta(E, S, N(E), { musicLine, cuts: cuts(120) });
  if (!(big.bytes > DESCRIPTION_MAX && metaIssues(big, N(E)).some((x) => /bytes/.test(x)))) problems.push(`a description of ${big.bytes} bytes was not caught`);
  if (problems.length) fail(`--test: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`);
  console.log(`film-meta --test: ${PUBLISHED.length} editions, film and Short, plain and re-cut: every description names ${V} on its line and fits ${DESCRIPTION_MAX.toLocaleString('en')} bytes`);
  process.exit(0);
}

const SLUG = arg('--slug', null);
const SHORT = process.argv.includes('--short');
const CHECK = process.argv.includes('--check');
const DRY = process.argv.includes('--dry');
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
// A re-cut's credits come from its own manifest; a fresh render's meta carries no `recut`, and a cuts.json left from
// an earlier re-cut (release.yml removes it when a fresh render is filed) is not its credits.
const cutsFile = path.join(DIR, 'cuts.json');
let cuts = null;
if (old.recut) {
  if (!fs.existsSync(cutsFile)) fail(`${metaName} is a re-cut (${old.recut}) but ${cutsFile} is missing; download cuts.json from the release too, or the refile would strip its credits`);
  cuts = JSON.parse(fs.readFileSync(cutsFile, 'utf8'));
  if (cuts.list !== old.recut) fail(`${metaName} is the re-cut of ${old.recut} but cuts.json is ${cuts.list}`);
} else if (fs.existsSync(cutsFile)) console.warn(`film-meta: ${cutsFile} is there, but ${metaName} is a fresh render, not a re-cut; its credits are not used`);
const next = filmMeta(E, S, N, { short: SHORT, musicLine, cuts });
const issues = metaIssues(next, N);
if (issues.length) fail(`${SLUG} ${SHORT ? 'short' : 'film'}: ${issues.join('; ')}`);

const changed = old.title !== next.title || old.description !== next.description;
console.log(`${SLUG} ${SHORT ? 'short' : 'film'}: ${changed ? 'changes' : 'unchanged'}${cuts ? ' (a re-cut, its credits from cuts.json)' : ''}`);
if (old.title !== next.title) console.log(`  title  - ${old.title}\n  title  + ${next.title}`);
if (old.description !== next.description) console.log(lineDiff(old.description, next.description).replace(/^/gm, '  '));
if (CHECK) process.exit(changed ? 1 : 0);
if (DRY || !changed) process.exit(0);

fs.writeFileSync(path.join(DIR, metaName), JSON.stringify({ ...old, title: next.title, description: next.description }, null, 1) + '\n');
fs.writeFileSync(path.join(DIR, SHORT ? 'sheet-short.txt' : 'sheet.txt'), sheetText(E, next, { short: SHORT, captions: old.captions, thumbnail: old.thumbnail, file: old.file }));
console.log(`  wrote ${metaName} and ${SHORT ? 'sheet-short.txt' : 'sheet.txt'}`);
