import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE, abs } from './src/config.mjs';
import { EDITIONS } from './src/lib/editions.mjs';
import { instant } from './src/lib/dates.mjs';
import { films } from './src/lib/films.mjs';
import { transcript } from './src/lib/transcripts.mjs';

const drafts = EDITIONS.filter((e) => e.draft).map((e) => e.path);
// An edition's sitemap lastmod is the day it was last corrected, else its date, never the build time: a lastmod that
// moves on every build tells a crawler every page changed, and it stops believing the field (30 Oct 2026).
const lastmod = new Map(EDITIONS.map((e) => [abs(e.path), instant(e.modified ?? e.date)]));
// A watch page changes when its film does: the upload the film's ledger records (src/lib/transcripts).
for (const f of films()) lastmod.set(abs(`${EDITIONS.find((e) => e.slug === f.slug).path}/film`), new Date(transcript(f.slug).uploaded));
const newest = new Date(Math.max(...EDITIONS.filter((e) => !e.draft).map((e) => +instant(e.modified ?? e.date))));

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
