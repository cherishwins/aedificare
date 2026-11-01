import { SITE, abs } from '../config.mjs';
import { EDITIONS } from '../lib/editions.mjs';

// Every named AI crawler is ALLOWED, on purpose. Most sites block these; this
// one wants to be found, quoted and repeated. Drafts are the only exclusion.
const AI = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot',
  'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended',
  'CCBot', 'Bytespider', 'meta-externalagent', 'Amazonbot', 'cohere-ai', 'DuckAssistBot', 'YouBot'];
// The two search engines' own crawlers get a group of their own with no draft disallowed, so they can read a draft's
// noindex and keep it out of their index: Google reads noindex only on a page robots.txt lets it fetch, and a page it
// may not fetch can still be listed bare when someone links it (Google's block-indexing guide). A crawler obeys only
// the most specific group naming it, so every other crawler still keeps off the drafts (Decisions log, 1 Nov 2026).
const SEARCH = ['Googlebot', 'Bingbot'];
const drafts = EDITIONS.filter((e) => e.draft).map((e) => `Disallow: ${e.path}`);

export function GET() {
  const body = [
    'User-agent: *', 'Allow: /', ...drafts, '',
    '# The search engines read the drafts\' noindex, so they may fetch them.',
    ...SEARCH.map((a) => `User-agent: ${a}`), 'Allow: /', '',
    '# Named AI crawlers, allowed on purpose. The point is that it travels.',
    ...AI.map((a) => `User-agent: ${a}`), 'Allow: /', ...drafts, '',
    `Sitemap: ${abs('/sitemap-index.xml')}`, '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
