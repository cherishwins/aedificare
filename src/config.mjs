// The one place the public origin is written down. Canonicals, OG, sitemap,
// feed, robots and llms.txt all read it, so moving domains is a one-line
// change. SITE_ORIGIN overrides it for previews.
export const SITE = {
  origin: process.env.SITE_ORIGIN || 'https://aedificare.art',
  name: 'Aedificare',
  author: 'Jesse James',
  locale: 'en',
};

/** Absolute URL for a site-relative path. */
export const abs = (path = '/') => new URL(path, SITE.origin).href;
