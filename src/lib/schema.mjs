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
 * are the page's numbered sources that print a URL, and nothing is rated,
 * reviewed or asked. The WebSite node stays in src/layouts/Base.astro, on
 * every page.
 */
import fs from 'node:fs';
import { SITE, abs } from '../config.mjs';
import { LICENCE, SERIES, edition, describe, headline } from './editions.mjs';
import { zoned } from './dates.mjs';

const OG = JSON.parse(fs.readFileSync('src/lib/og-manifest.json', 'utf8'));

export const ORG_ID = `${SITE.origin}/#org`;
export const PERSON_ID = `${SITE.origin}/#jesse`;

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
 * The address a source points at: the first page address that opens a
 * sentence of its own (the house style sets the document's address after
 * its record, "... 10 Jul 2024. decrypt.co/...", while an address inside a
 * clause is one the document quotes or embeds); else its first page
 * address; else its first bare host. Null when it prints none.
 */
const pick = (text) => {
  const a = addresses(text);
  if (!a.length) return null;
  const opens = (x) => x[0] === 0 || /\.\s$/.test(text.slice(Math.max(0, x[0] - 2), x[0]));
  return a.find((x) => x[2] && opens(x)) ?? a.find((x) => x[2]) ?? a[0];
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
 * opening, up to the first address it prints, cut at that colon only when
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
  const first = a[0]?.[0] ?? text.length;
  let s = clean(text.slice(0, first));
  if (!s && a.length) s = clean(text.slice(first + (text.slice(first).match(/^\S+/)?.[0].length ?? 0), at));
  if (s.length > 160 && colon > 0 && colon < first) s = clean(text.slice(0, colon));
  return cap(s);
};

/** A page's sources list as CreativeWorks: one per source that prints an address, in the list's order. */
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
    image: card ? [abs(card.src)] : [],
  };
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
