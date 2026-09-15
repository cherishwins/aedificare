/**
 * The editions, once. The home page, the feed, llms.txt, the sitemap filter
 * and the OG cards all read this list, so a title or a date is typed in one
 * place and cannot disagree with itself anywhere else. Each edition's own
 * page imports its entry for the same reason.
 *
 * `draft: true` keeps an edition out of the index, the feed, llms.txt, the
 * sitemap and robots; the page still builds (noindex) so it can be swept.
 */
export const EDITIONS = [
  {
    code: 'Edition 03', slug: 'edition-03', path: '/edition-03',
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
    code: 'NS-02', slug: 'ns-02', path: '/ns-02',
    title: 'The Closest Humans', acid: 'Humans',
    lede: 'Two men, one year, and a phone call on a Sunday.',
    date: '2026-09-13', dateLabel: '13 Sep 2026',
    seed: '0902', k: [6, 11], pdf: '/pdf/ns-02.pdf',
    note: 'Amendment to NS-01',
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
    code: 'NS-01', slug: 'ns-01', path: '/ns-01',
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
    code: 'Edition 02', slug: 'edition-02', path: '/edition-02',
    title: 'The Subtraction', acid: 'Subtraction',
    lede: 'A processor was built, then deliberately reduced, then sold at a quarter of its worth. The reduction is the product.',
    date: '2026-09-13', dateLabel: '2026',
    seed: '0573', k: [8, 5], pdf: null,
    draft: true,
  },
];

export const PUBLISHED = EDITIONS.filter((e) => !e.draft);
export const edition = (slug) => EDITIONS.find((e) => e.slug === slug);

export const LICENCE = {
  name: 'CC BY 4.0',
  url: 'https://creativecommons.org/licenses/by/4.0/',
  spdx: 'CC-BY-4.0',
};
