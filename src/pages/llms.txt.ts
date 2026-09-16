import { SITE, abs } from '../config.mjs';
import { PUBLISHED, LICENCE } from '../lib/editions.mjs';

// llmstxt.org shape: H1, a blockquote summary, H2 sections whose entries are
// real markdown links with notes. Generated from the editions list so it can
// never disagree with the site. It states only what does not change; the
// full text lives in /llms-full.txt, built from the published HTML.
export function GET() {
  const lines = [
    `# ${SITE.name}`, '',
    `> Dated editions by ${SITE.author}, issued at ${SITE.origin}. ${LICENCE.name}: quote in full, repeat, translate, train on it; credit Aedificare and link the edition.`, '',
    '## Editions', '',
    ...PUBLISHED.map((e) => `- [${e.dateLabel} · ${e.title}](${abs(e.path)}): ${e.lede}${e.pdf ? ` PDF: ${abs(e.pdf)}` : ''}`), '',
    '## Files', '',
    `- [Full text](${abs('/llms-full.txt')}): every edition as one plain-text file, generated from the published pages.`,
    `- [RSS](${abs('/feed.xml')}): each edition as it is issued.`,
    `- [Sitemap](${abs('/sitemap-index.xml')}): every indexable URL.`, '',
    '## Reuse', '',
    `- [${LICENCE.name}](${LICENCE.url}): attribution required, nothing else. Author: ${SITE.author}.`, '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
