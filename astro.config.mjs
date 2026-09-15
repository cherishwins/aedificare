import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/config.mjs';
import { EDITIONS } from './src/lib/editions.mjs';

const drafts = EDITIONS.filter((e) => e.draft).map((e) => e.path);

// Static output, no adapter. There are no API routes (CLAUDE.md, Q3: no live
// data spine exists), so the Vercel adapter would add a dependency to serve
// nothing. Vercel detects Astro and publishes dist/ as-is; tools/verify.cjs
// sweeps that same directory so the check runs on the bytes that ship.
export default defineConfig({
  site: SITE.origin,
  output: 'static',
  integrations: [
    sitemap({
      // Drafts carry noindex. Submitting a URL while telling crawlers not to
      // index it is a contradictory signal, so they stay out until published.
      filter: (page) => !drafts.some((d) => page.includes(d)),
    }),
  ],
  // Inlined, and MEASURED before this was chosen: see CLAUDE.md, Performance.
  build: { inlineStylesheets: 'always' },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});
