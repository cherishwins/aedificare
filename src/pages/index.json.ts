import { SITE, abs } from '../config.mjs';
import { PUBLISHED, LICENCE } from '../lib/editions.mjs';
import { film } from '../lib/films.mjs';

// The index in machine form. A companion on another origin (the desk at
// apt.grok.me first) renders its index from this at load, so nothing over
// there is typed and nothing can drift: same list, same order, same words
// as the masthead, the home, the feed and llms.txt. Published editions
// only. vercel.json sends it with Access-Control-Allow-Origin: * so a
// browser on that origin may fetch it. `film` is the edition's film's watch
// page once it is out, from src/lib/films.mjs, and null until then.
export function GET() {
  const body = {
    name: SITE.name,
    author: SITE.author,
    origin: SITE.origin,
    licence: { name: LICENCE.name, url: LICENCE.url },
    editions: PUBLISHED.map((e) => ({
      date: e.date,
      dateLabel: e.dateLabel,
      title: e.title,
      url: abs(e.path),
      lede: e.lede,
      note: e.note ?? null,
      pdf: e.pdf ? abs(e.pdf) : null,
      film: film(e.slug)?.url ?? null,
    })),
  };
  return new Response(JSON.stringify(body, null, 2) + '\n', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
