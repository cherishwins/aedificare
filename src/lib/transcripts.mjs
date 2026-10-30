/**
 * Each linked film's transcript, for its watch page (/<slug>/film; CLAUDE.md, Decisions log, 30 Oct 2026): the
 * narration as it was spoken, in the film's own chapters. Written by tools/transcripts.mjs from the release the
 * film's ledger names, never fetched at build time, and committed as src/lib/transcripts/<slug>.json.
 *
 * This module checks, with no network, that what the tool wrote still holds, and the build stops if it does not
 * (tools/transcripts.mjs --check, a step of npm run build, and on first use here): every linked film in
 * src/lib/films.json has a transcript, the transcript is for that film's video id and release, its chapters start at
 * 0:00, rise, and fall inside the film, every chapter carries words, and no transcript is left for a film the site
 * no longer links or for an id it no longer links. A film relinked to a corrected render (node tools/films.mjs
 * <new id>) fails the build until node tools/transcripts.mjs writes the new one.
 */
import fs from 'node:fs';
import path from 'node:path';
import { films } from './films.mjs';

export const TRANSCRIPTS_DIR = 'src/lib/transcripts';
const ISO = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/;

const read = (slug) => {
  const f = path.join(TRANSCRIPTS_DIR, `${slug}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
};

/** Everything wrong with the transcripts against the linked films, as sentences; empty when they hold. */
export function problems() {
  const out = [];
  const linked = films();
  const want = new Set(linked.map((f) => `${f.slug}.json`));
  for (const f of linked) {
    const t = read(f.slug);
    if (!t) { out.push(`${f.slug}: the film ${f.id} is linked and ${TRANSCRIPTS_DIR}/${f.slug}.json is missing; node tools/transcripts.mjs writes it`); continue; }
    if (t.slug !== f.slug) out.push(`${f.slug}: the transcript names ${t.slug}`);
    if (t.id !== f.id) { out.push(`${f.slug}: the transcript is for ${t.id}, and the linked film is ${f.id}; node tools/transcripts.mjs writes the current one`); continue; }
    if (t.source?.release !== `film-${f.slug}` || t.source?.asset !== 'narration.json' || !/^[0-9a-f]{64}$/.test(t.source?.sha256 ?? '') || !ISO.test(t.source?.updated ?? '')) out.push(`${f.slug}: the transcript's source ${JSON.stringify(t.source)} is not film-${f.slug}'s narration.json with its sha256 and filing time`);
    if (!ISO.test(t.uploaded ?? '')) out.push(`${f.slug}: the transcript carries no upload time from the film's ledger`);
    const ch = t.chapters;
    if (!Array.isArray(ch) || !ch.length) { out.push(`${f.slug}: the transcript has no chapters`); continue; }
    if (ch[0].t !== 0) out.push(`${f.slug}: the first chapter starts at ${ch[0].t}, not 0:00`);
    ch.forEach((c, i) => {
      if (!Number.isInteger(c.t) || c.t < 0 || c.t >= f.duration) out.push(`${f.slug}: chapter ${i + 1} starts at ${c.t}, not a whole second inside the film's ${f.duration}`);
      if (i && !(c.t > ch[i - 1].t)) out.push(`${f.slug}: chapter ${i + 1} does not start after chapter ${i}`);
      if (!c.title || !String(c.title).trim()) out.push(`${f.slug}: chapter ${i + 1} has no title`);
      if (!Array.isArray(c.paragraphs) || !c.paragraphs.length || c.paragraphs.some((p) => typeof p !== 'string' || !p.trim())) out.push(`${f.slug}: chapter ${i + 1}, "${c.title}", has no words`);
      if (c.paragraphs?.some((p) => /\[\d+\]/.test(p))) out.push(`${f.slug}: chapter ${i + 1} prints a citation mark, which the film does not say`);
    });
  }
  if (fs.existsSync(TRANSCRIPTS_DIR)) for (const f of fs.readdirSync(TRANSCRIPTS_DIR)) if (!want.has(f)) out.push(`${path.join(TRANSCRIPTS_DIR, f)} is the transcript of no linked film; node tools/transcripts.mjs removes it`);
  return out;
}

let cache = null;
/** The linked films' transcripts by slug, each chapter with its end (the next chapter's start, the last the film's length). Checked on first use. */
export const transcripts = () => {
  if (cache) return cache;
  const bad = problems();
  if (bad.length) throw new Error(`transcripts: ${bad.length} problem(s)\n  ${bad.join('\n  ')}`);
  cache = new Map(films().map((f) => {
    const t = read(f.slug);
    const chapters = t.chapters.map((c, i) => ({ ...c, end: t.chapters[i + 1]?.t ?? f.duration }));
    return [f.slug, { ...t, chapters }];
  }));
  return cache;
};
export const transcript = (slug) => transcripts().get(slug);
