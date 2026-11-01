import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE, abs } from './src/config.mjs';
import { EDITIONS } from './src/lib/editions.mjs';
import { instant } from './src/lib/dates.mjs';
import { films, filmDrops } from './src/lib/films.mjs';

const drafts = EDITIONS.filter((e) => e.draft).map((e) => e.path);
// A sitemap lastmod is never the build time: a lastmod that moves on every build tells a crawler every page changed,
// and it stops believing the field (30 Oct 2026). Google counts a change to a page's main content, its structured data
// or its links (its sitemap guide), and the lastmod follows the four such events this repo records: an edition's
// correction (modified, else its date); its film linked or relinked (films.json `linked`) or taken off
// (film-drops.json), which adds or removes the player and the film's @id; and MARKUP, the last change to the markup
// every page shares, a dated constant bumped by hand in the commit that makes one (a human duty, CLAUDE.md). A watch
// page follows its film's `linked` and MARKUP, never YouTube's upload time, which came days before the film was
// public and before the page existed (1 Nov 2026).
const MARKUP = new Date('2026-11-01T06:51:00Z'); // the structured data held to Google's own pages (Decisions log)
const filmOf = new Map(films().map((f) => [f.slug, new Date(f.linked)]));
const dropOf = filmDrops();
const later = (...ds) => new Date(Math.max(...ds.filter(Boolean).map(Number)));
const lastmod = new Map(EDITIONS.map((e) => [abs(e.path), later(instant(e.modified ?? e.date), filmOf.get(e.slug), dropOf.get(e.slug), MARKUP)]));
for (const [slug, at] of filmOf) lastmod.set(abs(`${EDITIONS.find((e) => e.slug === slug).path}/film`), later(at, MARKUP));
const newest = later(...EDITIONS.filter((e) => !e.draft).map((e) => lastmod.get(abs(e.path))));

// Static output, no adapter. There are no API routes (CLAUDE.md, Q3: no live
// data spine exists), so the Vercel adapter would add a dependency to serve
// nothing. Vercel detects Astro and publishes dist/ as-is; tools/verify.cjs
// sweeps that same directory so the check runs on the bytes that ship.
export default defineConfig({
  site: SITE.origin,
  output: 'static',
  // One URL per page, with no trailing slash (CLAUDE.md, Discoverability). Pages still build as <slug>/index.html,
  // which every tool here reads; Vercel serves that file at /<slug>, and vercel.json's trailingSlash: false sends
  // /<slug>/ there with a 308. Stylesheets inlined, and MEASURED before that was chosen: see CLAUDE.md.
  trailingSlash: 'never',
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      // Drafts carry noindex. Submitting a URL while telling crawlers not to
      // index it is a contradictory signal, so they stay out until published.
      filter: (page) => !drafts.some((d) => page.includes(d)),
      // The news sitemap is an endpoint (src/pages/sitemap-news.xml.ts); the index lists it beside the pages' own.
      // The video sitemap too (src/pages/sitemap-video.xml.ts): one entry per watch page.
      customSitemaps: [abs('/sitemap-news.xml'), abs('/sitemap-video.xml')],
      serialize: (item) => {
        const url = item.url === `${SITE.origin}/` ? item.url : item.url.replace(/\/+$/, '');
        // The home changes when an edition is published or corrected: the newest such day.
        return { ...item, url, lastmod: lastmod.get(url) ?? (url === `${SITE.origin}/` ? newest : undefined) };
      },
    }),
  ],
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});
