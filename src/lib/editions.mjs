/**
 * The editions, once. The home page, the feed, llms.txt, the sitemap filter
 * and the OG cards all read this list, so a title or a date is typed in one
 * place and cannot disagree with itself anywhere else. Each edition's own
 * page imports its entry for the same reason.
 *
 * THE CODE IS THE DATE (owner, 2026-09-16). There are no series numbers:
 * "Edition 03" and "NS-02" were decisions that had to be kept straight
 * across two series, and the owner was tired of getting them wrong. A date
 * is a fact. So an edition's code is its date label, its rose seed is its
 * date unless the print gave it one, its k is the house configuration
 * unless the print gave it one, and its URL is its title. Two editions on
 * one day are told apart by title, and the order of this list is the order
 * of the home and the masthead (newest first), so same-day order is
 * editorial and typed once, here. The printed PDFs keep the names printed
 * on them; each page carries that name in its JSON-LD alternativeHeadline
 * so a reader holding the print can find the page.
 *
 * `amends: '<slug>'` links an amendment to what it amends. Both sides get
 * a note, typed nowhere: the amendment says what it amends, the amended
 * says when, and only once the amendment is published.
 *
 * `draft: true` keeps an edition out of the index, the feed, llms.txt, the
 * sitemap and robots; the page still builds (noindex) so it can be swept.
 * A draft's date is provisional: set it to the day it goes live.
 */
import { HOUSE } from './rose.mjs';

const RAW = [
  {
    slug: 'the-floor', path: '/the-floor',
    title: 'The Floor', acid: 'Floor',
    lede: 'The Markup quoted the datasheet. The builder had measured the radio a year before.',
    date: '2026-09-16', dateLabel: '16 Sep 2026',
    amends: 'edition-03', pdf: null,
    draft: true,
    contents: [
      { n: '00', t: 'The number', id: 'number' },
      { n: '01', t: 'What The Markup did not have', id: 'missing' },
      { n: '02', t: 'The build', id: 'build' },
      { n: '03', t: 'The bench', id: 'bench' },
      { n: '04', t: 'The power', id: 'power' },
      { n: '05', t: 'The field', id: 'field' },
      { n: '06', t: 'The other radio', id: 'other' },
      { n: '07', t: 'What it carried', id: 'carried' },
      { n: '08', t: 'Where The Markup stands', id: 'stands' },
      { n: '09', t: 'Sources', id: 'sources' },
    ],
  },
  {
    slug: 'edition-03', path: '/edition-03', print: 'Edition 03',
    title: 'The Markup', acid: 'Markup',
    lede: 'A mesh radio the state pays eighteen thousand dollars for. A mesh radio a Canadian builds for four hundred.',
    date: '2026-09-15', dateLabel: '15 Sep 2026',
    seed: '0003', k: [5, 7], pdf: '/pdf/edition-03.pdf',
    contents: [
      { n: '00', t: 'The number', id: 'number' },
      { n: '01', t: 'The silicon', id: 'silicon' },
      { n: '02', t: 'The band', id: 'band' },
      { n: '03', t: 'The stack', id: 'stack' },
      { n: '04', t: 'The ledger', id: 'ledger' },
      { n: '05', t: 'The test', id: 'test' },
      { n: '06', t: 'The direction', id: 'direction' },
      { n: '07', t: 'Sources', id: 'sources' },
    ],
  },
  {
    slug: 'ns-02', path: '/ns-02', print: 'NS-02',
    title: 'The Closest Humans', acid: 'Humans',
    lede: 'Two men, one year, and a phone call on a Sunday.',
    date: '2026-09-13', dateLabel: '13 Sep 2026',
    seed: '0902', k: [6, 11], pdf: '/pdf/ns-02.pdf',
    amends: 'ns-01',
    // The contents, as printed on the home. tools/check-contents.cjs fails
    // the build if any id or title here is missing from the built page.
    contents: [
      { n: '01', t: 'What NS-01 got wrong', id: 'wrong' },
      { n: '02', t: 'The man who already won', id: 'won' },
      { n: '03', t: 'There is an asteroid', id: 'asteroid' },
      { n: '04', t: 'He paid for it himself', id: 'paid' },
      { n: '05', t: 'Twenty-four days', id: 'days-h' },
      { n: '06', t: 'Sparks', id: 'sparks' },
      { n: '07', t: 'One preposition, again', id: 'preposition' },
      { n: '08', t: 'The closest humans', id: 'closest' },
      { n: '09', t: 'Meanwhile, in Madrid', id: 'madrid' },
      { n: '10', t: 'Who has not spoken', id: 'silence' },
    ],
  },
  {
    slug: 'ns-01', path: '/ns-01', print: 'NS-01',
    title: 'The Hand in the Water', acid: 'Hand',
    lede: 'OpenAI opened door C. The world reported door A.',
    date: '2026-09-11', dateLabel: '11 Sep 2026',
    seed: '0413', k: [4, 9], pdf: '/pdf/ns-01.pdf',
    contents: [
      { n: '01', t: 'The post', id: 'post' },
      { n: '02', t: 'Four doors', id: 'doors' },
      { n: '03', t: 'The hand in the water', id: 'hand' },
      { n: '04', t: 'What it cost', id: 'cost-h' },
      { n: '05', t: 'What a proof checker checks', id: 'lean' },
      { n: '06', t: 'Telephone', id: 'telephone' },
      { n: '07', t: 'Page fifty six', id: 'page56' },
      { n: '08', t: 'Four days', id: 'fourdays' },
      { n: '09', t: 'The input was a rumour', id: 'rumour' },
      { n: '10', t: 'What would change my mind', id: 'mind' },
    ],
  },
  {
    slug: 'edition-01', path: '/edition-01', print: 'Edition 01',
    title: 'The Snapshot Problem', acid: 'Snapshot',
    lede: 'Agents formed societies this summer. The models under them learned nothing.',
    date: '2026-09-11', dateLabel: '11 Sep 2026',
    seed: '5A1E', k: [16 / 3, 29 / 4, 13 / 4], pdf: '/pdf/edition-01.pdf',
    contents: [
      { n: '00', t: 'The window', id: 'window' },
      { n: '01', t: 'Societies', id: 'societies' },
      { n: '02', t: 'The cliff', id: 'cliff' },
      { n: '03', t: 'The dark room', id: 'darkroom' },
      { n: '04', t: 'The snapshot', id: 'snapshot' },
      { n: '05', t: 'Plasticity', id: 'plasticity' },
      { n: '06', t: 'The living layer', id: 'living' },
      { n: '07', t: 'The mirror world', id: 'mirror' },
      { n: '08', t: 'Eight rules', id: 'rules' },
      { n: '09', t: 'Where it is wrong', id: 'wrong' },
      { n: '10', t: 'Sources', id: 'sources' },
      { n: '11', t: 'The vista', id: 'vista' },
    ],
  },
  {
    slug: 'edition-02', path: '/edition-02', print: 'Edition 02',
    title: 'The Subtraction', acid: 'Subtraction',
    lede: 'A processor was built, then deliberately reduced, then sold at a quarter of its worth. The reduction is the product.',
    date: '2026-09-13', dateLabel: '2026',
    seed: '0573', k: [8, 5], pdf: null,
    draft: true,
  },
];

/** A seed is a string: decimal digits, or hexadecimal when it is not all digits. */
export const seedNumber = (seed) => (/^\d+$/.test(seed) ? +seed : parseInt(seed, 16)) % 10000;
/** The drift a page adds to k for its cover field: seed 0003 is 0.003, seed 260916 is 0.916. */
export const seedDrift = (seed) => seedNumber(seed) / 1000;
/** The seed of a dated edition is its date, YYMMDD. */
const seedOf = (date) => date.slice(2).replace(/-/g, '');
/** How an edition is named anywhere it is linked: the date, then the title. */
export const label = (e) => `${e.dateLabel} · ${e.title}`;

export const EDITIONS = RAW.map((e) => ({
  ...e,
  code: e.dateLabel,
  seed: e.seed ?? seedOf(e.date),
  k: e.k ?? HOUSE.map((L) => L.k),
}));

for (const e of EDITIONS) {
  if (!e.amends) continue;
  const target = EDITIONS.find((x) => x.slug === e.amends);
  if (!target) throw new Error(`${e.slug} amends an edition that does not exist: ${e.amends}`);
  e.note = `Amends ${label(target)}`;
  if (!e.draft) target.note = `Amended ${e.dateLabel}`;
}

export const PUBLISHED = EDITIONS.filter((e) => !e.draft);
export const edition = (slug) => EDITIONS.find((e) => e.slug === slug);

/** The published neighbours of an edition in list order: newer is above it, older below. Drafts have none. */
export const neighbours = (slug) => {
  const i = PUBLISHED.findIndex((e) => e.slug === slug);
  return i < 0 ? {} : { newer: PUBLISHED[i - 1], older: PUBLISHED[i + 1] };
};

export const LICENCE = {
  name: 'CC BY 4.0',
  url: 'https://creativecommons.org/licenses/by/4.0/',
  spdx: 'CC-BY-4.0',
};

// Counts read from lists are printed as words, never typed.
export const numberWord = (n) =>
  ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'][n] ?? String(n);

// The meta description of an edition: the lede, then the record line (date,
// title, section count, licence). Generated, never typed, because
// LinkedIn's Post Inspector warns under 100 characters and a lede alone can
// be 48; everything after the lede is data the page already carries.
// tools/check-contents.cjs fails the build outside 100 to 200 characters.
export const describe = (e) => {
  const record = [e.dateLabel, e.title];
  if (e.contents) record.push(`${numberWord(e.contents.length)} sections`);
  record.push(LICENCE.name);
  return `${e.lede} ${record.join(' · ')}`;
};
