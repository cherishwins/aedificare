import { SITE, abs } from '../config.mjs';
import { PUBLISHED, pageTitle } from '../lib/editions.mjs';
import { zoned, instant } from '../lib/dates.mjs';

// The Google News sitemap (30 Oct 2026): only published editions dated within
// two days of the build, as Google News asks, and an empty urlset when there
// are none, which is most days. Listed in /sitemap-index.xml through
// @astrojs/sitemap's customSitemaps (astro.config.mjs). The title is the
// edition's checked seoTitle; the date is its day at 00:00 in SITE.timeZone.
// It is fresh only as of the last build: Vercel builds on every push, and an
// edition goes live by a push, so the build that publishes it lists it.
const WINDOW = 2 * 24 * 3600 * 1000;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function GET() {
  const now = Date.now();
  const recent = PUBLISHED.filter((e) => now - +instant(e.date) <= WINDOW && +instant(e.date) <= now);
  const urls = recent.map((e) => [
    '  <url>',
    `    <loc>${esc(abs(e.path))}</loc>`,
    '    <news:news>',
    '      <news:publication>',
    `        <news:name>${esc(SITE.name)}</news:name>`,
    `        <news:language>${SITE.locale}</news:language>`,
    '      </news:publication>',
    `      <news:publication_date>${zoned(e.date)}</news:publication_date>`,
    `      <news:title>${esc(pageTitle(e))}</news:title>`,
    '    </news:news>',
    '  </url>',
  ].join('\n'));
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
