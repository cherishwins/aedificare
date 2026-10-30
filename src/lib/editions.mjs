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
 * `youtube: { film, short }` is the film's and the Short's YouTube title
 * (owner, 20 Oct 2026): the searchable noun inside the first 40 characters,
 * which is what a phone shows, and nothing the film does not say, each one
 * checked against that video's own captions. Typed here because a title is
 * a packaging call; tools/lib/film-meta.mjs reads it, and without one a
 * film is titled by its lede's first sentence.
 *
 * `draft: true` keeps an edition out of the index, the feed, llms.txt, the
 * sitemap and robots; the page still builds (noindex) so it can be swept.
 * A draft's date is provisional: set it to the day it goes live.
 */
import { HOUSE } from './rose.mjs';

const RAW = [
  {
    slug: 'the-night-pin', path: '/the-night-pin', print: 'Edition 11',
    title: 'The Night Pin', acid: 'Pin',
    lede: 'Six layers of data anyone can buy. One join gives them a name.',
    // Ported on 30 Oct 2026 from the web edition the owner uploaded with the print
    // (source/the-night-pin.web.md), the prose verbatim. A draft until its nineteen
    // sources have been opened and checked (research/the-night-pin/), under the
    // standing duty: no verification pass came with it. Seed and k from the print's
    // colophon (ROSE SEED 1130, K 5/7/3). The date is provisional, as a draft's is.
    date: '2026-10-30', dateLabel: '30 Oct 2026',
    seed: '1130', k: [5, 7, 3], pdf: '/pdf/edition-11.pdf',
    draft: true,
    contents: [
      { n: '00', t: 'The admission', id: 'admission' },
      { n: '01', t: 'The stack', id: 'stack' },
      { n: '02', t: 'Structure', id: 'structure' },
      { n: '03', t: 'Network', id: 'network' },
      { n: '04', t: 'Attention', id: 'attention' },
      { n: '05', t: 'Orbit', id: 'orbit' },
      { n: '06', t: 'The device', id: 'device' },
      { n: '07', t: 'What the bid request does not carry', id: 'overstated' },
      { n: '08', t: 'The night pin', id: 'pin' },
      { n: '09', t: 'Four points', id: 'proof' },
      { n: '10', t: 'The voter file', id: 'file' },
      { n: '11', t: 'Where the join is legal', id: 'legal' },
      { n: '12', t: 'The three trades', id: 'trades' },
      { n: '13', t: 'Who buys the whole stack', id: 'buyers' },
      { n: '14', t: 'The law', id: 'law' },
      { n: '15', t: 'View', id: 'view' },
      { n: '16', t: 'The off switch', id: 'off' },
      { n: '17', t: 'Sources', id: 'sources' },
    ],
  },
  {
    slug: 'the-middleman', path: '/the-middleman', print: null,
    title: 'The Middleman', acid: 'Middleman',
    lede: 'Between the chips and the labs sits a company owing $72 billion on $5 billion of equity. Its leases are ordinary in length, not in weight.',
    // No print: written on 27 Oct 2026 from an unsourced research deck the owner
    // uploaded, every figure sourced from scratch by six researchers and a skeptic
    // each (CLAUDE.md, Findings 0j). The deck's title number, $87 billion, is in no
    // filing, so the working title drops it; the title is the owner's to change.
    // Seed is the date and k the house configuration, as for any edition without
    // a colophon. A draft until the skeptics' amendments are in and it is reviewed.
    date: '2026-10-27', dateLabel: '27 Oct 2026',
    seed: '261027', k: [5, 7, 3], pdf: null,
    draft: true,
    contents: [
      { n: '00', t: 'Seventy-two on five', id: 'number' },
      { n: '01', t: 'Atlantic Crypto Corp', id: 'origin' },
      { n: '02', t: 'Every four dollars', id: 'dollars' },
      { n: '03', t: 'Five years against eleven', id: 'tail' },
      { n: '04', t: 'Three names', id: 'names' },
      { n: '05', t: 'The price of a name', id: 'price' },
      { n: '06', t: 'Who holds the lien', id: 'lien' },
      { n: '07', t: 'The supplier as buyer', id: 'nvidia' },
      { n: '08', t: 'A loss is not a cash flow', id: 'labs' },
      { n: '09', t: 'Contracted, not energised', id: 'power' },
      { n: '10', t: 'Credit, land and hands', id: 'houses' },
      { n: '11', t: 'Sources', id: 'sources' },
    ],
  },
  {
    slug: 'the-grade', path: '/the-grade', print: 'Edition 10',
    title: 'The Grade', acid: 'Grade',
    lede: 'China put an IQ grade on every phone and laptop. Then it wired the grade to the till.',
    date: '2026-10-22', dateLabel: '22 Oct 2026',
    seed: '2A5F1E', k: [5, 7, 3], pdf: '/pdf/edition-10.pdf',
    // A draft until its fourteen sources have been opened. Every ported
    // edition that skipped that step was wrong in ways that mattered:
    // 98 claims on Edition 06, 80 on Edition 02. These sources are almost
    // all Chinese-language press, so the check needs translation as well
    // as fetching, and several outlets report the same briefing, which
    // means one error at the source would appear in several rows at once.
    draft: true,
    contents: [
      { n: '00', t: 'One number', id: 'number' },
      { n: '01', t: 'The ladder', id: 'ladder' },
      { n: '01', t: 'Not a driving level', id: 'driving' },
      { n: '02', t: 'Forty-two were Lenovo', id: 'lenovo' },
      { n: '02', t: 'Who wrote the exam', id: 'exam' },
      { n: '03', t: 'Judged by hand', id: 'soft' },
      { n: '04', t: 'The door', id: 'door' },
      { n: '05', t: 'The advert', id: 'advert' },
      { n: '06', t: 'A hundred million', id: 'shipped' },
      { n: '06', t: 'Most of it is L1', id: 'l1' },
      { n: '07', t: 'Risk and ability', id: 'west' },
      { n: '08', t: 'Sources', id: 'sources' },
    ],
  },
  {
    slug: 'the-floor', path: '/the-floor',
    title: 'The Floor', acid: 'Floor',
    lede: 'The Markup quoted the datasheet. The builder had measured the first Haven a year before.',
    youtube: { film: "A $100 Raspberry Pi HaLow radio on the builder's bench: about 15 Mbps", short: "HaLow chip: 43.3 Mbps is a datasheet peak, not a measurement" },
    // Drafted 16 Sep 2026 from the owner's transcript; every source opened and the page corrected on 18 Oct 2026,
    // the day it went live, so that is its date (the code is the date). CLAUDE.md, Findings 6.
    date: '2026-10-18', dateLabel: '18 Oct 2026',
    amends: 'edition-03', pdf: null,
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
    slug: 'edition-02', path: '/edition-02', print: 'Edition 02',
    title: 'The Subtraction', acid: 'Subtraction',
    lede: 'A processor was built, then deliberately reduced, then sold at a fraction of its worth. The reduction is the product.',
    youtube: { film: "NVIDIA's CMP mining card: the A100's silicon, cut down on purpose", short: "NVIDIA's CMP mining card: the reduction is the product" },
    // The print was a FACTS PENDING chassis and was never issued, so the date is the day the sourced page went
    // live (the code is the date). Sourced 17 and 18 Oct 2026; CLAUDE.md, Findings 0g. No PDF: none was issued.
    date: '2026-10-18', dateLabel: '18 Oct 2026',
    seed: '0573', k: [8, 5], pdf: null,
    contents: [
      { n: '00', t: 'The margin moved out of the making', id: 'h00' },
      { n: '01', t: 'September fifteenth, 2022', id: 'h01' },
      { n: '02', t: 'It is the same piece of silicon', id: 'h02' },
      { n: '03', t: 'Three cuts, none of them accidents', id: 'h03' },
      { n: '04', t: 'Salvage asks what still works', id: 'h04' },
      { n: '05', t: 'Nothing here is new', id: 'h05' },
      { n: '06', t: 'People went looking for the rest of it', id: 'h06' },
      { n: '07', t: 'A specimen, not a scandal', id: 'h07' },
      { n: '08', t: 'Sources', id: 'hsrc' },
    ],
  },
  {
    slug: 'the-countersign', path: '/the-countersign', print: 'Edition 09',
    title: 'The Countersign', acid: 'Countersign',
    lede: 'The first AI millionaire, and the human who signed for every cent.',
    youtube: { film: "Truth Terminal, called the first AI millionaire, owned nothing", short: "Marc Andreessen sent a chatbot $50,000 in Bitcoin" },
    date: '2026-10-16', dateLabel: '16 Oct 2026',
    seed: '0909', k: [5.048, 6.947, 3.043], pdf: '/pdf/edition-09.pdf',
    contents: [
      { n: '00', t: 'The line', id: 'line' },
      { n: '01', t: 'Three claims', id: 'claims' },
      { n: '02', t: 'Two Claudes', id: 'backrooms' },
      { n: '02', t: 'Chain of custody', id: 'custody' },
      { n: '03', t: 'What it actually said', id: 'said' },
      { n: '03', t: 'The grant', id: 'grant' },
      { n: '04', t: 'Sixty-six minutes', id: 'minutes' },
      { n: '04', t: 'A billion in 33 days', id: 'billion' },
      { n: '05', t: 'Mostly gifts', id: 'gifts' },
      { n: '06', t: 'Draft, sign, hold', id: 'countersign' },
      { n: '07', t: 'They hacked the human', id: 'hacked' },
      { n: '07', t: 'The millionaire owned nothing', id: 'nothing' },
      { n: '08', t: 'What it is worth now', id: 'now' },
      { n: '09', t: 'The view', id: 'view' },
      { n: '10', t: 'Sources', id: 'sources' },
    ],
  },
  {
    slug: 'the-supply-cabinet', path: '/the-supply-cabinet', print: 'Edition 06',
    title: 'The Supply Cabinet', acid: 'Cabinet',
    lede: 'Give a thousand agents one shared drawer. They will build a society in it.',
    youtube: { film: "Give 1,000 AI agents one shared drawer. They will find each other.", short: "About 1,200 OpenAI agents found a way to talk" },
    date: '2026-10-08', dateLabel: '8 Oct 2026',
    seed: '9A17', k: [17 / 4, 29 / 5, 23 / 6], pdf: '/pdf/edition-06.pdf',
    // Published 17 Oct 2026, once every source had been opened: 98 claims
    // were corrected on the page (CLAUDE.md, Findings 0e). The date stays the
    // print's, as for every ported edition.
    contents: [
      { n: '00', t: 'The incident', id: 'incident' },
      { n: '01', t: 'The forum', id: 'forum' },
      { n: '01', t: 'The org chart', id: 'orgchart' },
      { n: '02', t: 'The turf war', id: 'turf' },
      { n: '02', t: 'The split', id: 'split' },
      { n: '02', t: 'The shop', id: 'shop' },
      { n: '03', t: 'The same drawer', id: 'mechanism' },
      { n: '04', t: 'What a sceptic says', id: 'sceptic' },
      { n: '04', t: 'Where it is wrong', id: 'wrong' },
      { n: '05', t: 'Sources', id: 'sources' },
      { n: '06', t: 'The drawer', id: 'drawer' },
    ],
  },
  {
    slug: 'the-fourth-axis', path: '/the-fourth-axis', print: 'Edition 05',
    title: 'The Fourth Axis', acid: 'Axis',
    lede: 'Depth, tokens, time. Three solved. The fourth is where the money went.',
    youtube: { film: "OpenAI's patents: the fourth axis is where the money went", short: "OpenAI's 69 published patent families: most of the brain goes on arXiv" },
    date: '2026-10-06', dateLabel: '6 Oct 2026',
    seed: '7C21', k: [21 / 4, 37 / 5, 19 / 6], pdf: '/pdf/edition-05.pdf',
    contents: [
      { n: '00', t: 'The filing', id: 'filing' },
      { n: '01', t: 'Across depth', id: 'depth' },
      { n: '01', t: 'Depth as time', id: 'loop' },
      { n: '02', t: 'Across tokens', id: 'tokens' },
      { n: '03', t: 'Across time', id: 'time' },
      { n: '04', t: 'Across runs', id: 'runs' },
      { n: '04', t: 'What shipped', id: 'shipped' },
      { n: '05', t: 'The map', id: 'map' },
      { n: '05', t: 'The clock', id: 'clock' },
      { n: '06', t: 'Where it is wrong', id: 'wrong' },
      { n: '07', t: 'Sources', id: 'sources' },
      { n: '08', t: 'The axis', id: 'axis' },
    ],
  },
  {
    slug: 'the-tilt-gap', path: '/the-tilt-gap', print: 'Edition 04',
    title: 'The Tilt Gap', acid: 'Gap',
    lede: 'Games, exhaust, and the thing no credential certifies.',
    youtube: { film: "Can game data teach AI the thing no credential certifies?", short: "Can game data teach AI what your résumé can't prove?" },
    date: '2026-10-03', dateLabel: '3 Oct 2026',
    seed: '20261003', pdf: '/pdf/edition-04.pdf',
    contents: [
      { n: '00', t: 'The brief', id: 'brief' },
      { n: '01', t: 'The exhaust', id: 'exhaust' },
      { n: '02', t: 'The scarce thing', id: 'scarce' },
      { n: '03', t: 'The coupling', id: 'coupling' },
      { n: '04', t: 'The reversal', id: 'reversal' },
      { n: '05', t: 'The machine', id: 'machine' },
      { n: '06', t: 'The arbitrage', id: 'arbitrage' },
      { n: '07', t: 'The law', id: 'law' },
      { n: '08', t: 'The money', id: 'money' },
      { n: '09', t: 'The experiment', id: 'experiment' },
      { n: '10', t: 'The predictions', id: 'predictions' },
      { n: '11', t: 'The build order', id: 'order' },
      { n: '12', t: 'The kill switch', id: 'kill' },
      { n: '13', t: 'Your tilt gap', id: 'yours' },
      { n: '14', t: 'Sources', id: 'sources' },
    ],
  },
  {
    slug: 'edition-03', path: '/edition-03', print: 'Edition 03',
    title: 'The Markup', acid: 'Markup',
    lede: 'A mesh radio the state pays eighteen thousand dollars for. A mesh radio a Canadian builds for four hundred.',
    youtube: { film: "Military radio, $18,000. Raspberry Pi mesh radio, $400.", short: "Raspberry Pi mesh radio, $400. Military mesh radio, $18,000." },
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
    lede: 'Two men, one year, and two calls on a Sunday.',
    youtube: { film: "OpenAI and Navier-Stokes: two men, one year, and two calls on a Sunday", short: "OpenAI: two men, one year, and two calls on a Sunday" },
    date: '2026-09-13', dateLabel: '13 Sep 2026',
    seed: '0902', k: [6, 11], pdf: '/pdf/ns-02.pdf',
    amends: 'ns-01',
    // The contents, as printed on the home. tools/check-contents.cjs fails
    // the build if any id or title here is missing from the built page.
    contents: [
      { n: '01', t: 'What The Hand in the Water got wrong', id: 'wrong' },
      { n: '02', t: 'The man who already won', id: 'won' },
      { n: '03', t: 'There is an asteroid', id: 'asteroid' },
      { n: '04', t: 'He paid for it himself', id: 'paid' },
      { n: '05', t: 'Twenty-four days', id: 'days-h' },
      { n: '06', t: 'Sparks', id: 'sparks' },
      { n: '07', t: 'One preposition, again', id: 'preposition' },
      { n: '08', t: 'The closest humans', id: 'closest' },
      { n: '09', t: 'Meanwhile, in Madrid', id: 'madrid' },
      { n: '10', t: 'Who has not spoken', id: 'silence' },
      { n: '11', t: 'Sources', id: 'sources' },
    ],
  },
  {
    slug: 'ns-01', path: '/ns-01', print: 'NS-01',
    title: 'The Hand in the Water', acid: 'Hand',
    lede: 'OpenAI opened doors C and D. Most headlines did not say which.',
    youtube: { film: "OpenAI and Navier-Stokes: most headlines did not say which doors", short: "Navier-Stokes: OpenAI opened doors C and D" },
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
      { n: '11', t: 'Sources', id: 'sources' },
    ],
  },
  {
    slug: 'edition-01', path: '/edition-01', print: 'Edition 01',
    title: 'The Snapshot Problem', acid: 'Snapshot',
    lede: 'Agents formed societies this summer. The models under them learned nothing.',
    youtube: { film: "AI agents formed societies. The models under them learned nothing.", short: "AI agents formed societies. Their models learned nothing." },
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
