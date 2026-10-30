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
  // The author's own profile, written here and nowhere else: the JSON-LD Person's sameAs reads it (30 Oct 2026).
  linkedin: 'https://www.linkedin.com/in/jessecares',
  // The author's local time, which an edition's date is in. A date with no time is set at its 00:00 there.
  timeZone: 'America/Vancouver',
};

// The channel's narrator (CLAUDE.md, override 6): the ElevenLabs voice designed in the owner's account. The film
// tools and the upload guard read it from here; the workflows pass a repository variable NARRATOR only to override
// it. One voice, written once.
export const NARRATOR = 'eleven:sacfsNbCahgH0qw7PIO8';

/** Absolute URL for a site-relative path. */
export const abs = (path = '/') => new URL(path, SITE.origin).href;

// The commit the bytes were built from, first eight characters, "dev" when
// there is none. Vercel sets VERCEL_GIT_COMMIT_SHA at build time. It ships
// as <meta name="build"> so verify-live can prove WHICH commit is live, not
// only that something is.
export const BUILD = (process.env.VERCEL_GIT_COMMIT_SHA || 'dev').slice(0, 8);
