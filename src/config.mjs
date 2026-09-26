// The one place the public origin is written down. Canonicals, OG, sitemap,
// feed, robots and llms.txt all read it, so moving domains is a one-line
// change. SITE_ORIGIN overrides it for previews.
export const SITE = {
  origin: process.env.SITE_ORIGIN || 'https://aedificare.art',
  name: 'Aedificare',
  author: 'Jesse James',
  locale: 'en',
  // The one other place the brand is published. Feeds the JSON-LD sameAs; the
  // static public/humans.txt repeats it, so change both (CLAUDE.md, Open 9).
  channel: 'https://www.youtube.com/@aedificare_art',
};

/** Absolute URL for a site-relative path. */
export const abs = (path = '/') => new URL(path, SITE.origin).href;

// The commit the bytes were built from, first eight characters, "dev" when
// there is none. Vercel sets VERCEL_GIT_COMMIT_SHA at build time. It ships
// as <meta name="build"> so verify-live can prove WHICH commit is live, not
// only that something is.
export const BUILD = (process.env.VERCEL_GIT_COMMIT_SHA || 'dev').slice(0, 8);
