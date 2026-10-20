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
// What YouTube takes (developers.google.com/youtube/v3/docs/videos): a title of 100 characters, a description of
// 5,000 bytes, and neither holding < or >. Checked here, where the words are filed, and not only at upload.
export const TITLE_MAX = 100, DESCRIPTION_MAX = 5000;

/** The voice text two guards read: film.yml's morning skip test and the voice check in tools/youtube-channel.mjs. */
export const voiceText = (N) => `Voice: synthetic, ${N.model} ${N.voice}`;

/**
 * E: the edition. S: script.json. N: narration.json. short: the Short's meta. musicLine: the description's
 * music credit, which only the render knows (the computed bed, a licensed file, or none). cuts: the release's
 * cuts.json when the film is a re-cut (tools/cuts.mjs), whose credits name every source shown on screen.
 */
export function filmMeta(E, S, N, { short = false, musicLine, cuts = null }) {
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
    ...framesLines(E, N, url, cuts && (cuts.credits?.[short ? 'short' : 'film'] || [])),
    musicLine,
  ].join('\n');
  return { title, description, chapters, bytes: Buffer.byteLength(description) };
}

/**
 * What the frames are. A film rendered by tools/generate-film.mjs is computed throughout, and says so on the voice's
 * line, as every film filed before the re-cut did (kept byte for byte, so a refile changes nothing). A re-cut can show
 * pages its sources published (`pixels`: a page shot as served, or the owner's footage), and then "every frame is
 * computed" would be false: the voice keeps its text on a line of its own, the next line says what is computed, and
 * the sources named on screen follow in the short form ("[NN] Publisher, date", no URL; the source-heavy films leave
 * 75 to 94 bytes a source), then one line pointing at the numbered list.
 */
function framesLines(E, N, url, shown) {
  const computed = `computed from r = cos(kθ), seed ${E.seed}, k ${kLabel(E.k)}`;
  if (!shown) return [`${voiceText(N)}. Every frame is ${computed}.`];
  if (!shown.length) return [`${voiceText(N)}.`, `Every frame is ${computed}.`];
  const list = E.contents?.find((c) => /^sources$/i.test(c.t));
  return [
    `${voiceText(N)}.`,
    shown.some((c) => c.pixels && !c.own) ? `${computed[0].toUpperCase()}${computed.slice(1)}, except the source pages shown as their publishers serve them.` : `Every frame is ${computed}.`,
    'Sources on screen:',
    ...shown.map((c) => c.line),
    `Every source, numbered: ${url}${list ? `#${list.id}` : ''}`,
  ];
}

/** What YouTube would refuse in a title and description, and a description that lost the voice text the guards read. */
export function metaIssues({ title, description }, N) {
  const out = [];
  if (title.length > TITLE_MAX) out.push(`the title runs ${title.length} characters and YouTube takes ${TITLE_MAX}`);
  const bytes = Buffer.byteLength(description);
  if (bytes > DESCRIPTION_MAX) out.push(`the description runs ${bytes.toLocaleString('en')} bytes and YouTube takes ${DESCRIPTION_MAX.toLocaleString('en')}; shorten the credits`);
  if (/[<>]/.test(title) || /[<>]/.test(description)) out.push('YouTube refuses < and > in a title or a description');
  if (!description.split('\n').some((l) => l.startsWith(voiceText(N)))) out.push(`the description lost "${voiceText(N)}" at the start of a line, which film.yml's skip test and the upload's voice check read`);
  return out;
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
