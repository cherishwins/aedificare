/**
 * What a film's upload carries: its YouTube title, its description and its upload sheet, built from the edition,
 * the script and the narration and nothing else. One function, shared by the render (tools/generate-film.mjs) and
 * the meta-only refile (tools/film-meta.mjs), so the two cannot disagree: a title changes in src/lib/editions.mjs
 * and is filed again on the release without a render, and a later render writes the same thing.
 */
import path from 'node:path';
import { EDITIONS, LICENCE, numberWord } from '../../src/lib/editions.mjs';
import { SITE } from '../../src/config.mjs';
import { kLabel } from './film.mjs';
import { fitChapters } from './chapters.mjs';

const mmss = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;

/**
 * E: the edition. S: script.json. N: narration.json. short: the Short's meta. musicLine: the description's
 * music credit, which only the render knows (the computed bed, a licensed file, or none).
 */
export function filmMeta(E, S, N, { short = false, musicLine }) {
  const url = SITE.origin + E.path;
  const chapters = fitChapters([{ t: 0, text: E.title }, ...N.blocks.filter((x) => x.kind === 'h2').map((x) => ({ t: Math.max(0, x.start - 0.4), text: x.text }))], N.duration)
    .map((c) => `${mmss(c.t)} ${c.text}`);
  // The title is typed once per edition (`youtube` in src/lib/editions.mjs) under the owner's rule of 20 Oct 2026: the
  // searchable noun inside the first 40 characters, which is what a phone shows, and nothing the film does not say.
  // An edition without one falls back to its lede's first sentence, as every film did before.
  const firstSentence = E.lede.split(/(?<=\.)\s/)[0].replace(/\.$/, '');
  const title = (short ? E.youtube?.short : null) ?? E.youtube?.film ?? (firstSentence.length <= 100 ? firstSentence : E.title);
  // An amendment and what it amends point at each other near the top, the way the pages do (editions.mjs, `amends`).
  const amends = E.amends && EDITIONS.find((x) => x.slug === E.amends);
  const amendedBy = EDITIONS.filter((x) => x.amends === E.slug && !x.draft);
  const description = [
    // The edition's link opens the description (owner, 20 Oct 2026), so it is the first thing under the title.
    url,
    E.lede,
    ...(amends ? [`Amends ${amends.title}: ${SITE.origin + amends.path}`] : []),
    ...amendedBy.map((x) => `Amended by ${x.title}, ${x.dateLabel}: ${SITE.origin + x.path}`),
    // The page's own section count (its contents list), not the script's: an older script counted every h2.
    `${E.dateLabel} · ${E.title} · ${numberWord(E.contents?.length ?? S.sections)} sections · ${numberWord(S.sources)} sources`,
    '',
    ...(short ? [`The full edition, read in full, is on the channel and at ${url}.`] : chapters),
    '',
    `The writing is ${LICENCE.name} at ${url}: quote it, repeat it, translate it, train on it, credit ${SITE.name} and link the edition.`,
    `Voice: synthetic, ${N.model} ${N.voice}. Every frame is computed from r = cos(kθ), seed ${E.seed}, k ${kLabel(E.k)}.`,
    musicLine,
  ].join('\n');
  return { title, description, chapters };
}

/** The upload sheet a person pastes from, beside meta.json. */
export function sheetText(E, { title, description }, { short = false, captions, thumbnail, file }) {
  return [
    `Title: ${title}`,
    `(alternative: ${E.title} · ${E.dateLabel})`,
    '',
    'Description:',
    description,
    '',
    'Licence (upload form): Standard YouTube Licence. The script is CC BY on the page; the file does not carry the grant.',
    'Altered or synthetic content disclosure: not required (a synthetic voice reading an original script over computed visuals depicts no real person or event).',
    `Captions: upload ${path.basename(captions)} as English. Tags: none. Cards and end screens: none. Playlist: Editions.`,
    short ? 'Short: YouTube files it as a Short by shape and length; no hashtag needed.' : `Thumbnail: ${path.basename(thumbnail)}`,
    `File: ${path.basename(file)}`,
    '',
  ].join('\n');
}
