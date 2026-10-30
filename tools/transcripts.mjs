#!/usr/bin/env node
/**
 * The transcripts the watch pages print (/<slug>/film; CLAUDE.md, Decisions log, 30 Oct 2026), written from the
 * releases and committed, so the build never fetches anything.
 *
 *   node tools/transcripts.mjs            write src/lib/transcripts/<slug>.json for every film src/lib/films.json links
 *   node tools/transcripts.mjs --check    check them against the linked films, no network (npm run build runs this)
 *
 * For each linked film, the release film-<slug> is looked up by its tag (never through the listing; tools/films.mjs
 * says why) and its ledger (youtube.json) must still name the linked id, so the words are the linked video's. Its
 * narration.json must have been filed before that upload, or it is a later render's voice. The transcript is the
 * narration as spoken: every block the film read aloud, in order, each one's words as the narration's own word
 * timings carry them (the page's text, mapped back onto the voice), with the citation marks left out, because the
 * voice never says them (they are timed at zero length). Blocks the film shows and does not read (a figure, the
 * sources list) are not in it.
 *
 * The chapters are the film's own, built as tools/lib/film-meta.mjs builds them for the description (the title at
 * 0:00, then each section heading 0.4 s before it is read, fitted to YouTube's rule by tools/lib/chapters.mjs), and
 * held to the chapter lines of the description the release files in meta.json: a list that differs is refused, so
 * the watch page's chapters are the ones YouTube shows. Each block goes to the chapter it starts in.
 *
 * A transcript is rewritten only when its id or its narration's bytes change; one for a film no longer linked is
 * removed.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { edition } from '../src/lib/editions.mjs';
import { films } from '../src/lib/films.mjs';
import { problems, TRANSCRIPTS_DIR as DIR } from '../src/lib/transcripts.mjs';
import { fitChapters, fitDescription } from './lib/chapters.mjs';

const REPO = 'cherishwins/aedificare';
const fail = (msg) => { console.error(`transcripts: ${msg}`); process.exit(1); };

if (process.argv[2] === '--check') {
  let bad;
  try { bad = problems(); } catch (err) { fail(err.message); }
  if (bad.length) fail(`${bad.length} problem(s)\n  ${bad.join('\n  ')}`);
  const n = films().length;
  console.log(`check-transcripts: ${n} linked film(s), each with the transcript of its current video id, none left over`);
  process.exit(0);
}
if (process.argv.length > 2) fail('usage: node tools/transcripts.mjs [--check]');

const ghToken = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const why = (err) => String(err.stderr || err.message).trim();
const release = (slug) => {
  const tag = `film-${slug}`;
  let body;
  try { body = execFileSync('curl', ['-sSLf', '--retry', '2', '-H', 'accept: application/vnd.github+json', ...(ghToken ? ['-H', `authorization: Bearer ${ghToken}`] : []), `https://api.github.com/repos/${REPO}/releases/tags/${tag}`], { maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'pipe'] }).toString('utf8'); }
  catch (err) { fail(`could not look up the release ${tag}: ${why(err)}`); }
  const rel = JSON.parse(body);
  if (rel?.tag_name !== tag || !Array.isArray(rel.assets)) fail(`GitHub's answer for ${tag} is not that release`);
  return rel;
};
const download = (a) => {
  try { return execFileSync('curl', ['-sSLf', '--retry', '2', a.browser_download_url], { maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (err) { fail(`could not fetch ${a.browser_download_url}: ${why(err)}`); }
};
const asset = (rel, name) => rel.assets.find((a) => a.name === name);
const json = (rel, name) => { const a = asset(rel, name); return a ? JSON.parse(download(a).toString('utf8')) : null; };
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');

// The voice never says a citation mark: the narration keeps "[01]" on the word list, timed at zero length.
const CITE = /^\[\d+\][.,;:)]?$/;
const spoken = (b) => {
  const words = Array.isArray(b.words) && b.words.length ? b.words.map((w) => w.w) : String(b.text ?? '').split(/\s+/);
  return words.filter((w) => w && !CITE.test(w)).join(' ').replace(/\s+([.,;:])/g, '$1').trim();
};

fs.mkdirSync(DIR, { recursive: true });
const keep = new Set();
for (const f of films()) {
  const e = edition(f.slug);
  const file = path.join(DIR, `${f.slug}.json`);
  keep.add(path.basename(file));
  const rel = release(f.slug);
  const ledger = json(rel, 'youtube.json') ?? json(rel, 'youtube.json.prev');
  if (ledger?.id !== f.id) fail(`film-${f.slug} files ${ledger?.id ?? 'no video'} as its film, and the site links ${f.id}; relink the film first (tools/films.mjs)`);
  if (!Date.parse(ledger.at)) fail(`film-${f.slug}'s ledger records no upload time`);
  const na = asset(rel, 'narration.json');
  if (!na) fail(`film-${f.slug} files no narration.json`);
  if (!(Date.parse(na.updated_at) <= Date.parse(ledger.at))) fail(`film-${f.slug}/narration.json was filed ${na.updated_at}, after ${f.id} went up (${ledger.at}), so it is a later render's voice, not that video's`);
  const bytes = download(na);
  const digest = sha256(bytes);
  const old = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  if (old?.id === f.id && old.source?.sha256 === digest && old.uploaded === ledger.at) { console.log(`  ${f.slug}: ${f.id}, unchanged`); continue; }
  const N = JSON.parse(bytes.toString('utf8'));
  if (!Array.isArray(N.blocks) || !N.duration) fail(`film-${f.slug}/narration.json has no blocks or no duration`);

  // The chapters, as the description builds them, held to the description the release files.
  const raw = fitChapters([{ t: 0, text: e.title }, ...N.blocks.filter((x) => x.kind === 'h2').map((x) => ({ t: Math.max(0, x.start - 0.4), text: x.text }))], N.duration);
  if (raw.length < 3) fail(`${f.slug}: the film has ${raw.length} chapters as YouTube shows them, not three or more`);
  const mmss = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
  const meta = json(rel, 'meta.json');
  const filed = fitDescription(meta?.description ?? '', N.duration).split('\n').filter((l) => /^(\d+:)?\d{1,2}:\d\d \S/.test(l));
  const built = raw.map((c) => `${mmss(c.t)} ${c.text}`);
  if (filed.join('\n') !== built.join('\n')) fail(`${f.slug}: the chapters built from the narration are not the ones film-${f.slug}/meta.json files:\n    built  ${built.join(' | ')}\n    filed  ${filed.join(' | ')}`);

  const chapters = raw.map((c) => ({ t: Math.floor(c.t), title: c.text, paragraphs: [] }));
  for (const b of N.blocks) {
    if (!b.read || !Number.isFinite(b.start)) continue;
    const text = spoken(b);
    if (!text) continue;
    let i = raw.length - 1;
    while (i > 0 && b.start < raw[i].t) i--;
    chapters[i].paragraphs.push(text);
  }
  const out = {
    slug: f.slug, id: f.id,
    // The ledger's time is when the upload was filed; YouTube's own publish time is not recorded anywhere this can read.
    uploaded: ledger.at,
    source: { release: rel.tag_name, asset: 'narration.json', sha256: digest, updated: na.updated_at, voice: N.voice, model: N.model },
    chapters,
  };
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
  const words = chapters.reduce((n, c) => n + c.paragraphs.join(' ').split(/\s+/).length, 0);
  console.log(`  ${file}: ${f.id}, ${chapters.length} chapters, ${words} words`);
}
for (const f of fs.readdirSync(DIR)) if (!keep.has(f)) { fs.unlinkSync(path.join(DIR, f)); console.log(`  removed ${path.join(DIR, f)}`); }
const bad = problems();
if (bad.length) fail(`written, and they do not hold:\n  ${bad.join('\n  ')}`);
console.log(`  ${DIR}: ${keep.size} transcript(s)`);
