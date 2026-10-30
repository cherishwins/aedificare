/**
 * An edition's structured data, one @graph built here for every page (30 Oct
 * 2026), where each page used to type its own Article. A page passes only
 * what is its own: its alternativeHeadline (the name its print carries, so a
 * reader holding the print finds the page; CLAUDE.md, "The code is the
 * date") and its sources list. Everything else is read from the editions
 * list, src/config.mjs and the OG manifest, so it cannot disagree with the
 * page.
 *
 * Every property describes something the page carries: the headline is the
 * <h1>'s own text (tools/check-discovery.cjs holds them equal), the citations
 * are the page's numbered sources that print their own document's address
 * (pick, below), and nothing is rated, reviewed or asked. Two properties
 * name what the page does not show, and both are the owner's to keep or
 * drop: alternativeHeadline, the print's name (CLAUDE.md, "The code is the
 * date", which keeps it off every surface and in the JSON-LD so a reader
 * holding the print finds the page), and isPartOf's series name, which the
 * page's Same thread label now shows. The WebSite node stays in src/layouts/Base.astro, on
 * every page.
 */
import fs from 'node:fs';
import { SITE, abs } from '../config.mjs';
import { LICENCE, SERIES, edition, describe, headline } from './editions.mjs';
import { zoned, zonedInstant } from './dates.mjs';
import { lead } from './lead.mjs';
import { film } from './films.mjs';
import { transcript } from './transcripts.mjs';

const OG = JSON.parse(fs.readFileSync('src/lib/og-manifest.json', 'utf8'));

export const ORG_ID = `${SITE.origin}/#org`;
// The author's node lives on /about since 30 Oct 2026, the page that is about him (it was the home's #jesse).
export const PERSON_ID = `${SITE.origin}/about#jesse`;
/** An edition's watch page: its film's own page (CLAUDE.md, Decisions log, 30 Oct 2026). */
export const watchPath = (e) => `${e.path}/film`;

// A bare host is a URL only when it is written in lower case and ends in a
// known top-level domain or carries a path: "Unite.AI" names an outlet,
// "buildwithparallel.com" and "x.com/pmarca/status/..." are addresses.
const TLD = /\.(com|org|net|gov|edu|mil|int|io|ai|me|be|ca|uk|de|fr|cn|jp|kr|tw|hk|eu|us|co|art|dev|app|info|news|tv|lol|so|sh|ly|gl)$/;
const URLISH = /(?<![\w@./-])(https?:\/\/)?((?:[a-z0-9-]+\.)+[a-z]{2,})(\/[^\s]*)?/gi;
const trim = (u) => u.replace(/[.,;:)\]'"”’]+$/, '');

/** Every address a source prints, in order: [index, absolute URL, whether it names a page (a scheme or a path)]. */
const addresses = (text) => {
  const out = [];
  for (const m of text.matchAll(URLISH)) {
    const [, scheme, host, rest = ''] = m;
    if (!scheme && (host !== host.toLowerCase() || (!rest && !TLD.test(host)))) continue;
    out.push([m.index, trim(scheme ? m[0] : `https://${host}${rest}`), Boolean(scheme || rest.length > 1)]);
  }
  return out;
};

/**
 * The address of the document a source names, or null. Only a page address
 * counts (a scheme or a path): a bare host names the publisher, not the
 * document ("openai.com" for a post, "buildwithparallel.com" for an article),
 * so a source that prints only a host is not cited. Of its page addresses,
 * the first that opens a sentence of its own (the house style sets the
 * document's address after its record, "... 10 Jul 2024. decrypt.co/..."),
 * else the first in its record, before the first colon outside quotes. One
 * inside the clauses after that colon is one the document quotes or embeds
 * ("manuscript at alpo.ge/s6.pdf" in an entry for posts on X), never its own,
 * so a source whose only address sits there is not cited either.
 */
const pick = (text) => {
  const a = addresses(text).filter((x) => x[2]);
  if (!a.length) return null;
  const colon = text.replace(/[“"][^”"]*[”"]/g, (q) => ' '.repeat(q.length)).search(/:\s/);
  const opens = (x) => x[0] === 0 || /\.\s$/.test(text.slice(Math.max(0, x[0] - 2), x[0]));
  return a.find(opens) ?? a.find((x) => colon < 0 || x[0] < colon) ?? null;
};
export const urlOf = (text) => pick(text)?.[1] ?? null;

const clean = (s) => s.replace(/^[\s.,;:·]+|[\s.,;:·]+$/g, '').trim();
const cap = (s) => (s.length > 160 ? s.slice(0, s.lastIndexOf(' ', 157)) + '…' : s);

/**
 * A source's name: its quoted title, where the quote comes before the first
 * colon outside quotes (after it a source lists what it says, and a quote
 * there is a quotation, not the title). Otherwise, where its address sits in
 * a later sentence that names a document of its own ("... MTU. OpenMANET
 * documentation, openmanet.github.io."), that sentence's words. Otherwise its
 * opening, up to the first address it prints (where it names several
 * documents, split by semicolons, the one that opens with the address's own
 * publisher), cut at that colon only when
 * the opening runs past 160 characters, and at a word past that.
 */
export const nameOf = (text) => {
  const blanked = text.replace(/[“"][^”"]*[”"]/g, (q) => ' '.repeat(q.length));
  const colon = blanked.search(/:\s/);
  const q = text.match(/[“"]([^”"]{6,240})[”"]/);
  if (q && (colon < 0 || q.index < colon)) return q[1].replace(/[,.]$/, '').trim();
  const at = pick(text)?.[0] ?? text.length;
  const stop = text.lastIndexOf('. ', at);
  // A sentence ends at a full stop after a word, not after an initial ("Charles L. Fefferman").
  if (stop > 0 && /[A-Za-z0-9)]{2}$/.test(text.slice(0, stop))) {
    const own = clean(text.slice(stop + 2, at));
    if (own.split(/\s+/).length >= 2 && /^[A-Z0-9“"]/.test(own)) return cap(own);
  }
  const a = addresses(text);
  const first = Math.min(a[0]?.[0] ?? text.length, at);
  let s = clean(text.slice(0, first));
  // A source that names several documents before its address ("Reuters. ...; TechCrunch, ... 13 Jun 2025.
  // techcrunch.com/...") is named by the one whose publisher the address is on, where a later one opens with the
  // address's own name; otherwise (a semicolon that starts a note, or no publisher named) the opening stands.
  const p = pick(text);
  if (p) {
    const label = new URL(p[1]).hostname.split('.').slice(-2)[0];
    const docs = s.split(/;\s+/);
    const own = docs.findIndex((d, i) => i > 0 && d.toLowerCase().replace(/[^a-z0-9]/g, '').startsWith(label));
    if (own > 0) s = clean(docs[own]);
  }
  if (!s && a.length) s = clean(text.slice(first + (text.slice(first).match(/^\S+/)?.[0].length ?? 0), at));
  if (s.length > 160 && colon > 0 && colon < first) s = clean(text.slice(0, colon));
  return cap(s);
};

/** A page's sources list as CreativeWorks: one per source that prints its own document's address, in the list's order. */
export const citations = (sources = []) =>
  sources
    .map((s) => (Array.isArray(s) ? s.slice(1).join('. ') : String(s)))
    .map((text) => ({ text, url: urlOf(text) }))
    .filter((s) => s.url)
    .map((s) => ({ '@type': 'CreativeWork', name: nameOf(s.text), url: s.url }));

export const organization = () => ({
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE.name,
  url: SITE.origin,
  logo: { '@type': 'ImageObject', url: abs('/icon-512.png'), width: 512, height: 512 },
  sameAs: [SITE.channel],
});

export const person = () => ({
  '@type': 'Person',
  '@id': PERSON_ID,
  name: SITE.author,
  url: abs('/about'),
  sameAs: [SITE.channel, SITE.linkedin],
});

/**
 * The page's graph: NewsArticle, Organization, Person, BreadcrumbList.
 * `alternativeHeadline` is the page's own (the print's name); without one
 * the lede stands in. Dates are set at 00:00 in SITE.timeZone with that
 * day's offset (src/lib/dates.mjs), because an edition's date has no time.
 */
export const articleGraph = (e, { alternativeHeadline, sources } = {}) => {
  const url = abs(e.path);
  const card = OG[`/og/${e.slug}.png`];
  const article = {
    '@type': 'NewsArticle',
    '@id': `${url}#article`,
    headline: headline(e),
    alternativeHeadline: alternativeHeadline ?? e.lede,
    description: describe(e),
    datePublished: zoned(e.date),
    dateModified: zoned(e.modified ?? e.date),
    url,
    mainEntityOfPage: url,
    isAccessibleForFree: true,
    license: LICENCE.url,
    inLanguage: SITE.locale,
    author: { '@type': 'Person', '@id': PERSON_ID, name: SITE.author },
    publisher: { '@id': ORG_ID },
    // The lead image's three frames first (a figure of the edition's own, not text; src/lib/lead.mjs), then the
    // type card, which stays og:image (override 2). A draft has no lead image yet.
    image: [...(e.draft ? [] : lead(e.slug)?.frames ?? []).map((f) => abs(f.src)), ...(card ? [abs(card.src)] : [])],
  };
  // The film, by reference only: its VideoObject lives on the watch page, whose main content it is.
  if (!e.draft && film(e.slug)) article.video = { '@id': `${abs(watchPath(e))}#video` };
  const cited = citations(sources);
  if (cited.length) article.citation = cited;
  if (e.amends) article.isBasedOn = abs(edition(e.amends).path);
  if (e.series) article.isPartOf = { '@type': 'CreativeWorkSeries', name: SERIES[e.series] };
  const crumbs = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE.name, item: abs('/') },
      { '@type': 'ListItem', position: 2, name: e.title, item: url },
    ],
  };
  return { '@context': 'https://schema.org', '@graph': [article, organization(), person(), crumbs] };
};

/**
 * A watch page's graph (CLAUDE.md, Decisions log, 30 Oct 2026): the VideoObject whose page it is, the Organization,
 * the Person and the breadcrumbs. Every value is read from src/lib/films.json (the id, the measured length, the
 * poster and the thumbnail), the film's transcript (src/lib/transcripts, the ledger's upload time and the chapters)
 * and the edition. uploadDate is the ledger's upload time, in SITE.timeZone with its offset; a Clip per chapter runs
 * from its start to the next chapter's, and its url is the watch page at that second (?t=), which the page's player
 * starts from.
 */
export const videoGraph = (e) => {
  const f = film(e.slug);
  const t = transcript(e.slug);
  const url = abs(watchPath(e));
  const name = `${e.title}: the film`;
  const video = {
    '@type': 'VideoObject',
    '@id': `${url}#video`,
    name,
    description: describe(e),
    thumbnailUrl: [abs(f.poster.src), abs(f.thumb.src2x), abs(f.thumb.src)],
    uploadDate: zonedInstant(t.uploaded),
    duration: f.iso,
    embedUrl: f.embed,
    url,
    mainEntityOfPage: url,
    inLanguage: SITE.locale,
    isAccessibleForFree: true,
    publisher: { '@id': ORG_ID },
    creator: { '@type': 'Person', '@id': PERSON_ID, name: SITE.author },
    isBasedOn: abs(e.path),
    transcript: t.chapters.map((c) => c.paragraphs.join('\n\n')).join('\n\n'),
    hasPart: t.chapters.map((c) => ({ '@type': 'Clip', name: c.title, startOffset: c.t, endOffset: c.end, url: `${url}?t=${c.t}` })),
  };
  const crumbs = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE.name, item: abs('/') },
      { '@type': 'ListItem', position: 2, name: e.title, item: abs(e.path) },
      { '@type': 'ListItem', position: 3, name: 'Film', item: url },
    ],
  };
  return { '@context': 'https://schema.org', '@graph': [video, organization(), person(), crumbs] };
};

/** /about, /standards and /amendments: a ProfilePage whose mainEntity is the Person on /about, a WebPage elsewhere. */
export const pageGraph = ({ path, name, description, profile = false }) => {
  const url = abs(path);
  const page = {
    '@type': profile ? 'ProfilePage' : 'WebPage',
    '@id': `${url}#page`,
    name,
    description,
    url,
    inLanguage: SITE.locale,
    isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.origin },
    publisher: { '@id': ORG_ID },
    ...(profile ? { mainEntity: { '@id': PERSON_ID } } : { author: { '@id': PERSON_ID } }),
  };
  return { '@context': 'https://schema.org', '@graph': [page, organization(), person()] };
};
