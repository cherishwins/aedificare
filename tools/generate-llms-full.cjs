#!/usr/bin/env node
/**
 * /llms-full.txt: the whole site as one plain-text file, generated as a
 * post-build step FROM THE BUILT HTML so it can never drift from what is
 * published. Ported pattern from cherishwins/teamcanada. Drafts are skipped.
 * Runs inside `npm run build`, so Vercel produces it too.
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.argv[2] || 'dist';

async function main() {
  const { PUBLISHED } = await import('../src/lib/editions.mjs');
  const { SITE } = await import('../src/config.mjs');
  const out = [`${SITE.name}. Numbered editions by ${SITE.author}. ${SITE.origin}`, 'Licence: CC BY 4.0. Quote, repeat, translate, train; credit Aedificare and link the edition.', ''];
  let words = 0;
  for (const e of PUBLISHED) {
    const html = fs.readFileSync(path.join(ROOT, e.slug, 'index.html'), 'utf8');
    const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? '';
    const text = main
      .replace(/<(script|style|svg|nav|header|footer)\b[\s\S]*?<\/\1>/g, '')
      .replace(/<div class="foot[^"]*">[\s\S]*?<\/div>/g, '')
      .replace(/<span class="num no"[^>]*>[\s\S]*?<\/span>/g, '')
      .replace(/<span class="sr">([\s\S]*?)<\/span>/g, '$1')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<\/(p|h1|h2|h3|li|dd|tr|blockquote|section|caption)>/g, '\n\n')
      .replace(/<\/(dt|th|td)>/g, ' · ')
      .replace(/<\/(div|span|a|b|strong|cite|q|dl)>/g, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/[ \t]+/g, ' ').replace(/ ·\s*\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    words += text.split(/\s+/).length;
    out.push('='.repeat(72), `${e.code} · ${e.title}`, `${e.dateLabel} · ${SITE.origin}${e.path}${e.pdf ? ` · PDF ${SITE.origin}${e.pdf}` : ''}`, '='.repeat(72), '', text, '');
  }
  fs.writeFileSync(path.join(ROOT, 'llms-full.txt'), out.join('\n'));
  console.log(`generate-llms-full: ${PUBLISHED.length} editions, ~${words} words -> ${ROOT}/llms-full.txt`);
}
main();
