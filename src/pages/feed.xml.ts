import rss from '@astrojs/rss';
import { SITE } from '../config.mjs';
import { PUBLISHED, describe } from '../lib/editions.mjs';
import { rfc822 } from '../lib/dates.mjs';

// Each edition as it is issued. The links carry no trailing slash (one URL per
// page), the date is the edition's day at 00:00 in SITE.timeZone with that
// day's offset (written as customData, because @astrojs/rss would print a
// Date in GMT), and the description is the edition's checked one where it
// has one. RSS 2.0's <author> wants an address, so the name also goes in
// dc:creator, which wants a name.
export function GET() {
  return rss({
    title: SITE.name,
    description: 'Dated editions.',
    site: SITE.origin,
    trailingSlash: false,
    xmlns: { dc: 'http://purl.org/dc/elements/1.1/' },
    items: PUBLISHED.map((e) => ({
      title: e.title,
      link: e.path,
      description: describe(e),
      author: SITE.author,
      customData: `<pubDate>${rfc822(e.date)}</pubDate><dc:creator>${SITE.author}</dc:creator>`,
    })),
  });
}
