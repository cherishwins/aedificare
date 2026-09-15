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
    code: 'NS-02', slug: 'ns-02', path: '/ns-02',
    title: 'The Closest Humans', acid: 'Humans',
    lede: 'Two men, one year, and a phone call on a Sunday.',
    date: '2026-09-13', dateLabel: '13 Sep 2026',
    seed: '0902', k: [6, 11], pdf: '/pdf/ns-02.pdf',
    note: 'Amendment to NS-01',
  },
  {
    code: 'NS-01', slug: 'ns-01', path: '/ns-01',
    title: 'The Hand in the Water', acid: 'Hand',
    lede: 'OpenAI opened door C. The world reported door A.',
    date: '2026-09-11', dateLabel: '11 Sep 2026',
    seed: '0413', k: [4, 9], pdf: '/pdf/ns-01.pdf',
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
