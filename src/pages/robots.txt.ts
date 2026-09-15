import { SITE, abs } from '../config.mjs';
import { EDITIONS } from '../lib/editions.mjs';

// Every named AI crawler is ALLOWED, on purpose. Most sites block these; this
// one wants to be found, quoted and repeated. Drafts are the only exclusion.
const AI = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot',
  'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended',
  'CCBot', 'Bytespider', 'meta-externalagent', 'Amazonbot', 'cohere-ai', 'DuckAssistBot', 'YouBot', 'Bingbot'];
const drafts = EDITIONS.filter((e) => e.draft).map((e) => `Disallow: ${e.path}`);

export function GET() {
  const body = [
    'User-agent: *', 'Allow: /', ...drafts, '',
    '# Named AI crawlers, allowed on purpose. The point is that it travels.',
    ...AI.map((a) => `User-agent: ${a}`), 'Allow: /', ...drafts, '',
    `Sitemap: ${abs('/sitemap-index.xml')}`, '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
