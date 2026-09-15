import rss from '@astrojs/rss';
import { SITE } from '../config.mjs';
import { PUBLISHED } from '../lib/editions.mjs';

export function GET() {
  return rss({
    title: SITE.name,
    description: 'Numbered editions.',
    site: SITE.origin,
    items: PUBLISHED.map((e) => ({
      title: `${e.code} · ${e.title}`,
      link: e.path,
      pubDate: new Date(e.date),
      description: e.lede,
      author: SITE.author,
    })),
  });
}
