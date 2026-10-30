import { abs } from '../config.mjs';
import { edition, describe } from '../lib/editions.mjs';
import { films } from '../lib/films.mjs';
import { transcript } from '../lib/transcripts.mjs';
import { watchPath } from '../lib/schema.mjs';
import { zonedInstant } from '../lib/dates.mjs';

// The video sitemap (30 Oct 2026): one <video:video> per watch page (/<slug>/film), the page whose main content is
// the film, with the values its VideoObject carries: the poster as thumbnail_loc, the title and description, the
// privacy-enhanced embed as player_loc, the measured length in seconds and the ledger's upload time with its
// offset. Listed in /sitemap-index.xml through @astrojs/sitemap's customSitemaps (astro.config.mjs), beside the
// pages' own sitemap, which lists the watch pages too.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function GET() {
  const urls = films().map((f) => {
    const e = edition(f.slug);
    return [
      '  <url>',
      `    <loc>${esc(abs(watchPath(e)))}</loc>`,
      '    <video:video>',
      `      <video:thumbnail_loc>${esc(abs(f.poster.src))}</video:thumbnail_loc>`,
      `      <video:title>${esc(`${e.title}: the film`)}</video:title>`,
      `      <video:description>${esc(describe(e))}</video:description>`,
      `      <video:player_loc>${esc(f.embed)}</video:player_loc>`,
      `      <video:duration>${f.duration}</video:duration>`,
      `      <video:publication_date>${zonedInstant(transcript(f.slug).uploaded)}</video:publication_date>`,
      '      <video:family_friendly>yes</video:family_friendly>',
      '    </video:video>',
      '  </url>',
    ].join('\n');
  });
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
