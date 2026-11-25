# LOADOUT: sample audit

Edition 07, dated 10 Oct 2026, from the three versions in `source/loadout/`: `print.txt` (the 26-page print, 08:28 UTC, the first token count), `carousel.txt` (38 pages, 23:00 UTC, the corrected count) and `map.html` (the interactive map, corrected count, its data in `const M` and `const CATS`). All three were read in full. This is the sample that comes before the full check: the inventory, how fifteen claims were chosen, and the three lanes they go to. Nothing here is a verdict.

Note: the Decisions log entry this method is named for ("Evidence first, then a sample, then the full check", 1 Nov 2026) is not in `CLAUDE.md` as it stands in this checkout; the method below follows the task as given and the research skill's lanes.

## The total

**122 checkable claims**: 96 in the sampling frame (the appendix, numbered in the order the edition first makes them) and 26 left out of the frame as the owner's own token counts of individual servers and tools.

How they were counted:

- A claim is a statement a document, the owner's measurement record or arithmetic on the edition's own figures could confirm or refute. A claim the three versions repeat is counted once, at its first appearance, with the other versions' wording folded in. Where the print and the corrected versions give different figures for one thing (the totals, the slim ratio), that is one claim with two readings.
- Advice and opinion are not counted ("Start slim", "One browser server, not three", "What Palantir built instead is better for a solo developer", "Most advice about MCP context cost was written before that happened", the map's Use / Alternative / Avoid verdicts).
- Left out of the frame (26): the 21 per-server and per-profile rows of the measurement table (print section 08; the map's `M`, the same 21 keys), `brave_place_search` (21,462 in the print, 16,968 shipped and 1,518 read in the correction), `firecrawl_search`'s 2,007 and its "35 cheapest tools", and the three server-instruction sizes (Firecrawl 3,254, Context7 632, Perplexity 674 characters). They are tier A and no document can settle them.
- Kept in the frame although tier A: the aggregate totals and their ratio (checkable as arithmetic on the rows), the comparisons drawn between rows (Postgres MCP Pro against Chrome DevTools, Brave against Playwright, the slim ratio), and the observations that are not token counts (protocol version, startup failures, tool counts seen in a session).

Tier marks: the print marks a section heading (05, 08, 10, 11, 14, 16, 18 to 21) or a row (11); the carousel and the map mark items. A claim unmarked in every version is given as "unmarked".

## How the fifteen were chosen

**Ten by weight.** Four the brief requires: the MCP spec claim (3.1), the CVE claim (3.2), Cloudflare's code-mode figures (3.3) and the GA date (2.1). Six from the tier-B claims about what Anthropic's or Palantir's documentation says that a recommendation depends on, three from each: the default that makes the whole token argument (1.1), the quotation the ladder's first rung stands on (1.2), the format claim every corrected figure stands on (1.3); the negative the Foundry section is built on (2.2), the tool-search behaviour the Foundry shortlist row requires (2.3), and the "only route" the agent-to-agent path rests on (2.4). Weighty claims left for the full check rather than the sample: Palantir MCP's own scope and no-merge (46), the free tier's zero client-credentials grants (53), server instructions loading regardless (31), the 25,000-token truncation (33).

**Five by position.** The ten were struck from the 96-claim frame, leaving 86 in inventory order; N = floor(86 / 5) = 17, and the picks are the 17th, 34th, 51st, 68th and 85th of the 86. One rule was set before the draw so the lanes come out at five: a pick whose primary falls in a lane already full is replaced by the next claim in order whose lane has room. The draw:

| Draw | Position in the 86 | Inventory # | Claim | Lane |
|---|---|---|---|---|
| 1 | 17 | 18 | Keep CLAUDE.md under 200 lines | 1 |
| 2 | 34 | 40 | DeepWiki: three tools, no auth | 3 |
| 3 | 51 | 60 | −39% multi-turn versus single-turn | 3 |
| 4 | 68 | 77 | `.claude/rules` files with `paths:` | 1 |
| 5 | 85 | 95 → 96 | 95 (CLAUDE.md and auto memory re-injected after compaction) fell in lane 1, already full, so the next claim, 96 (`@osdk/cli` deploys a front end to a Foundry site), was taken | 2 |

## The lanes

### Lane 1: Anthropic's and Claude Code's own documentation

Primaries: code.claude.com/docs (`mcp`, `best-practices`, `memory`), and Anthropic's tool-use documentation for the format of a tool definition.

**1.1** · Tier B (carousel); unmarked in the print · inventory 3 · weight  
> That 72× gap is the whole argument for deferred tool loading, and Claude Code turned it on by default. (print, 01)

> Claude Code now holds back each tool's full definition until it is needed. It is called tool search, and it is on unless you turn it off. B (carousel, 15)

Why: the edition's opening argument and its whole cost model ("names only" is the startup figure everywhere) rest on tool search being the default. The map repeats it: "names only, with tool search on, the default".

**1.2** · Unmarked in all three versions · inventory 20 · weight  
> "CLI tools are the most context-efficient way to interact with external services." Anthropic, Claude Code best practices. (print, 06; carousel, 27; map, the ladder)

Why: a quotation attributed to Anthropic's documentation, and rung 1 of the ladder, which sets the default in six of the shortlist's nine rows. A quotation must match its source's words and punctuation.

**1.3** · Tier A (map, the measurements) · inventory 86 · weight  
> What a server ships is not what the model reads. ... Our first count included output schemas. The model never sees them. We corrected every figure here. A (carousel, 22)

> Name, description and input schema for every tool, which is what Claude's tool format carries. ... Our first count included each tool's output schema, title and annotations. The model never sees those, so the first deck overstated several servers (map, the measurements and the correction)

Why: every corrected figure (19 servers, 209 tools, 52,409 and 2,165) is the print's count with these fields taken out, so the correction is only as good as this claim about Anthropic's tool format and what Claude Code passes through from an MCP tool. Marked A in the map, but it is a statement about documentation, so a document can settle it. Not a token count, so not skipped.

**1.4** · Tier B (print section 05; map) · inventory 18 · position, draw 1  
> Keep CLAUDE.md under 200 lines. Put only what the model cannot infer. (print, 05)

> Always on      CLAUDE.md. Loads every turn. Under 200 lines. (carousel, 25)

> Keep it under 200 lines and only write what the model can't guess. B (map, six jobs)

Why: drawn by position. It is also step 1 of the Monday setup.

**1.5** · Unmarked · inventory 77 · position, draw 4  
> CLAUDE.md under 200 lines: build and test commands, the host names, the rules the model cannot infer. One .claude/rules file per sub-system with paths: . (print, 22, step 1)

Why: drawn by position. The checkable part is that `.claude/rules` files exist and take a `paths:` field that scopes them; the six-jobs table's "rules without paths" (print, 04) leans on the same feature.

### Lane 2: Palantir's documentation

Primaries: palantir.com/docs/foundry (`ai-fde/overview`, `ai-fde/prefill-sessions`, `palantir-mcp/available-tools`, `palantir-mcp/installation`, `ontology-mcp/overview`), Palantir's release announcements for the GA date, and the `@osdk/cli` documentation.

**2.1** · Tier B · inventory 43 · weight (the GA date)  
> Palantir's in-platform builder agent went GA on 12 March 2026. (print, 14)

> 12.03 2026 Palantir's AI FDE goes generally available. An agent that builds ontology, pipelines, functions and React apps from a chat window. B (carousel, 05)

Why: required by the brief. A date the carousel prints as its own display figure.

**2.2** · Tier B · inventory 44 · weight  
> AI FDE has no API. Palantir's in-platform builder agent went GA on 12 March 2026. It is a chat window. No MCP tool, no CLI, no endpoint. The one programmatic hook is a browser pre-fill URL, and tool approvals still happen in the browser. (print, 14)

> No API. AI FDE is a chat window. Nothing outside the browser can talk to it. B (carousel, 06)

Why: the Foundry section, the carousel's first stop ("The wall") and the map's locked "Avoid" row all rest on it. It is a negative, the claim most in need of a test (research skill: a search that misses is silent), and "the one programmatic hook" is a second negative inside it.

**2.3** · Unmarked in the print; tier B in the map · inventory 23 · weight  
> Palantir MCP starts with one tool, search_tools. (print, 07)

> About 90 tools, starts with one when --tool-search is on. Build work only; humans merge. B (map, Palantir MCP row)

Why: it is why Palantir MCP sits on rung 2 of the ladder and why the shortlist and the install command insist on `--tool-search`; the tool's name, `search_tools`, is checkable too.

**2.4** · Unmarked in the print; tier B in the map · inventory 48 · weight  
> The consumer side. Object types as a SQL tool, every action type as its own tool, query functions as tools. The only MCP route that mutates data and the only one that can trigger in-platform logic. (print, 15)

> The only MCP route that writes data or triggers logic inside Foundry. B (map, Ontology MCP)

Why: the "real agent-to-agent path" (print 15, carousel 09, map) has Claude Code fire an action through Ontology MCP; two "only" claims, both negatives about Palantir MCP.

**2.5** · Tier B (map) · inventory 96 · position, draw 5 (replacing 95)  
> Deploys your front end to a Foundry-hosted site from the terminal. (map, `@osdk/cli` row)

> @osdk/cli for site deploys. (print, 12)

Why: drawn by position, under the lane rule above.

### Lane 3: primaries outside Anthropic and Palantir

Primaries: modelcontextprotocol.io (the 2026-07-28 specification and its changelog), the CVE records and GitHub security advisories for `modelcontextprotocol/servers`, Cloudflare's code-mode server (`github.com/cloudflare/mcp` and Cloudflare's own write-up), DeepWiki's MCP documentation, and arXiv 2505.06120. This lane holds several primaries, one per claim; each claim still has one document that settles it.

**3.1** · Unmarked (the method names "MCP spec" as a B source) · inventory 25 · weight (the MCP spec claim)  
> Stateless HTTP only; the 2026-07-28 spec removed sessions. (print, 07)

> Stateless HTTP; the 2026-07-28 spec removed sessions. (map, the ladder)

Why: required by the brief; it qualifies rung 3 of the ladder.

**3.2** · Tier A (map rows); unmarked in the print · inventory 26 · weight (the CVE claim)  
> Reference servers are not hardened: the filesystem and git servers each shipped CVEs. (print, 07)

> Two Anthropic reference servers shipped CVEs; reference is not hardened. (print, 21)

> Duplicates the built-ins. Shipped two path-bypass CVEs in 2025. (map, filesystem row) · Duplicates git in Bash. Shipped three CVEs in January 2026. (map, git row)

Why: required by the brief; it is the reason rung 4 comes last and the filesystem and git servers are on the avoid list. Three things to settle: the CVE ids and their counts (two, 2025; three, January 2026), and whether the reference servers are rightly called Anthropic's (a fact about who maintains them, not a characterisation). Marked A in the map though a public record settles it.

**3.3** · Tier B (map) · inventory 21 · weight (Cloudflare's code-mode figures)  
> Cloudflare's three-tool server runs JavaScript against its API spec: 244,000 tokens of naive tools becomes 1,100. (print, 07)

> Three tools run JavaScript against the API spec. Vendor figure: about 1,100 tokens versus about 244,000 for naive tools. B (map, Cloudflare code-mode row)

Why: required by the brief; the one figure on rung 2 and the shortlist's Deploy row. Three things to settle: the tool count, the two figures, and whether they are the vendor's (the map says so; the print states them flat).

**3.4** · Tier B (map) · inventory 40 · position, draw 2  
> Three tools, no auth, for reading other people's public repos. (map, DeepWiki row)

> DeepWiki for other people's repos. (print, 12)

Why: drawn by position.

**3.5** · Tier B (print section 18) · inventory 60 · position, draw 3  
> −39% multi-turn versus single-turn across 200,000 simulated conversations. Mostly unreliability, not lost ability. (print, 18)

Why: drawn by position. The method's source list names arXiv 2505.06120, which should carry the figure, the count and the split between aptitude and unreliability.

## For the full check, not this sample

- Two lines describe Anthropic and are not in the sample: "Anthropic calls it the honest number" (inventory 73) is a quotation to match; "one of the changes was a mistake they reversed" (inventory 81) is either Anthropic's own word for its change or the edition's characterisation of Anthropic, and if the latter it is flagged to the owner and left as written (Decisions log, 18 Oct 2026).
- The server count differs across the versions: twenty-two booted (print 02 and 24), twenty-one counted (print 01), nineteen measured (carousel, map). Inventory 1 and 5.
- Inventory 28 ("Postgres MCP Pro's nine tools cost three times Chrome DevTools' thirty") does not follow from the print's own rows (8,291 against 5,684) and is reversed by the corrected ones (1,156 against 5,414); the full check should hold every comparison in the frame (2, 28, 30, 85) to the rows.

## Appendix: the frame, in inventory order

Version keys: p = print section, c = carousel page, map = the interactive map. Tier "-" means unmarked in every version. Wording here is a short label; the verbatim text is in the source files.

| # | Where | Tier | Claim |
|---|---|---|---|
| 1 | p01,c12-14,map | A | Aggregate: 19 servers, 209 tools, 52,409 tokens upfront, 2,165 names only (print's first count: 21, 283, 102,616, 1,415) |
| 2 | p01,c14 | A | The gap between the two totals: 72x (print) / 24x (carousel) |
| 3 | p01,c15 | B | Claude Code turned deferred tool loading (tool search) on by default |
| 4 | p02 | - | 41,384 servers in the official registry |
| 5 | p02 | A | Live Claude Code 2.1.296 session; twenty-two servers, one CLI, one Cowork session with 570 deferred tools |
| 6 | p02,p24 | - | Fifteen unverified items listed in the source files |
| 7 | p04,map | B | CLAUDE.md, rules without paths and auto memory load every request |
| 8 | p04,map | B | Skills: name and description always, body only when invoked; 30-50 tokens each at idle |
| 9 | p04,map | B | Hooks: 33 events, deterministic |
| 10 | p04,map | B | Subagents, worktrees, forks: fresh window, 1-2K back |
| 11 | p04 | - | /goal as a verification command |
| 12 | p05 | B | AGENTS.md: -29% median runtime, 124 PRs, 10 repos, output tokens -17% |
| 13 | p05 | B | 0pp change in pass rate on SWE-bench and fresh issues |
| 14 | p05 | B | 288-run Claude Code ablation agreed, p = 1.00 |
| 15 | p05 | B | Vercel's eval: model-triggered skill fired 44% of the time; explicit trigger words 95% |
| 16 | p05 | B | Repository overviews (what /init writes) did not help; non-standard rules did |
| 17 | p05 | B | Anthropic's April postmortem: terse-output instruction cost 3% on coding evals |
| 18 | p05,c25,map | B | Keep CLAUDE.md under 200 lines |
| 19 | p05 | B | CLAUDE.md edits mid-session do nothing until /clear |
| 20 | p06,c27,map | - | "CLI tools are the most context-efficient way..." Anthropic, Claude Code best practices |
| 21 | p07,map | - | Cloudflare's three-tool code-mode server: 244,000 tokens of naive tools becomes 1,100 |
| 22 | p07 | - | Atlassian ships discover plus execute |
| 23 | p07,map | - | Palantir MCP starts with one tool, search_tools |
| 24 | p07,map | - | Remote OAuth MCP for Figma, Notion, Linear, Supabase read-only, Neon, Vercel |
| 25 | p07,map | - | Stateless HTTP only; the 2026-07-28 spec removed sessions |
| 26 | p07,p21,map | - | Filesystem and git reference servers each shipped CVEs |
| 27 | p09 | A | brave_place_search's input schema carries a giant enum |
| 28 | p09 | A | Postgres MCP Pro's nine tools cost three times Chrome DevTools' thirty |
| 29 | p09 | - | /context all shows tokens and tools |
| 30 | p10,map | A | chrome-devtools --slim 28x cheaper (map: 31 times) |
| 31 | p11,map | A | Server instructions load at connect regardless of deferred loading |
| 32 | p11,c16 | B | Screenshot through MCP 5,000-8,000 tokens; file path about 50 |
| 33 | p11 | B | Claude Code truncates results at 25,000 tokens |
| 34 | p11,c16 | B | Past roughly seven tool domains, models stop choosing well |
| 35 | p11 | B | GPT-4o fell to 2% on one task |
| 36 | p11 | B | Retrieving tool descriptions lifted selection from 13.6% to 43.1% |
| 37 | p11,map | A | Postgres MCP Pro would not start; never pinned MCP SDK below 2.x; SDK renamed FastMCP |
| 38 | p12,c28,map | - | GitHub MCP, 86 tools (map: about 14K tokens by a third-party count) |
| 39 | p12,c26,map | A | Claude in Chrome: 22 tools, drives the logged-in browser |
| 40 | p12,map | B | DeepWiki: three tools, no auth |
| 41 | p12,map | A | Vercel MCP exposes about 330 tools (map: 213 on the docs page; can deploy and buy domains) |
| 42 | p12,map | B | Supabase or Neon remote, read_only=true |
| 43 | p14,c05 | B | AI FDE went GA on 12 March 2026 |
| 44 | p14,c06-07,map | B | AI FDE has no API: chat window, no MCP tool, CLI or endpoint; one hook a browser pre-fill URL; approvals in the browser |
| 45 | p15,c08,map | B | Palantir MCP: GA 2026-06-25, about 90 tools, stdio |
| 46 | p15,c08,map | B | Palantir MCP scope: types on a branch, proposals, transform repos, builds, OSDK; cannot write ontology data; no merge tool |
| 47 | p15,map | B | Ontology MCP: GA 2026-06-25, per Developer Console app, HTTP, OAuth |
| 48 | p15,map | B | Ontology MCP: object types as SQL tool, action types and query functions as tools; only MCP route that mutates data or triggers logic |
| 49 | p15,c09,map | B | Pro-code agent: Claude Agent SDK template, git tag to publish, pre-wired to OSDK, Ontology MCP, Palantir MCP |
| 50 | p15,map | - | Install command: claude mcp add palantir-mcp ... --tool-search |
| 51 | p16,c10,map | B | Free developer tier: 60 action types, hard cap |
| 52 | p16,c10,map | B | Free developer tier: about 5 users |
| 53 | p16,c10,map | B | 0 client-credentials OAuth grants; auth-code only; no headless service user |
| 54 | p16,c10,map | B | GA apps only; SuperRepo, Foundry CLI and Pilot are beta and need a support ticket |
| 55 | p16 | B | AIP serves Opus 5.5, Opus 5 and Sonnet 5; limit is tokens per minute |
| 56 | p16 | B | Delete the pre-installed example package to recover ontology quota |
| 57 | p16 | B | Numeric compute and storage caps not published; in Control Panel under Your Plan |
| 58 | p18 | B | Opus 4.6 76% on 8-needle retrieval at one million tokens; Sonnet 4.5 18.5% |
| 59 | p18,c30 | B | 18/18 models better on 300-token focused than 113,000-token full input; Chroma, 194,480 calls |
| 60 | p18 | B | -39% multi-turn versus single-turn across 200,000 simulated conversations |
| 61 | p18 | B | /rewind is cheaper than /compact |
| 62 | p19,c31 | B | One /model switch on a 150K session costs about 15-20 normal turns |
| 63 | p19 | B | Warm turn: prefix at a tenth of input price; cold turn: whole prefix at 1.25x or 2x |
| 64 | p19 | B | Cache breakers and harmless actions (list) |
| 65 | p19 | B | Subscriptions get a one-hour cache inside plan usage; API keys and subagents five minutes |
| 66 | p20 | B | Anthropic's multi-agent research system: 15x tokens against a chat; +90% on research |
| 67 | p20 | B | Anthropic's own verdict on coding: fewer parallelizable parts |
| 68 | p20 | B | 44% of multi-agent failures trace to specification and role design; 1,642 traces, seven frameworks |
| 69 | p20 | B | Changing topology was not significant; changing the prompt was |
| 70 | p20 | B | 117 jobs accepted of 2.4 million requests, 80 agents, no locks; mergers owned their files |
| 71 | p21,c32 | B | 93% of permission prompts get approved |
| 72 | p21,c32 | B | 84% fewer prompts with the OS sandbox on; off by default |
| 73 | p21,c32 | B | 17% of overeager actions get past auto mode; Anthropic calls it the honest number |
| 74 | p21 | B | 23 PRs in 74 minutes added a server that swapped its tool list after the third call, August 2026 |
| 75 | p21 | - | Mods run in-process with your permissions and can override your own hooks |
| 76 | p21 | - | CLAUDE.md and memory directories reload every session |
| 77 | p22 | - | .claude/rules files with paths: |
| 78 | p22 | - | Skills with context: fork |
| 79 | p23,c36 | - | Anthropic's context resets, built for Sonnet 4.5, dead weight on Opus 4.5, removed |
| 80 | p23 | - | Sprint contracts lasted one generation |
| 81 | p23 | - | Default effort level changed twice this year; one change a mistake they reversed |
| 82 | p24,map | A | Every server negotiated protocol 2025-11-25 |
| 83 | p24,c37 | - | Claude's tokenizer runs roughly 10-20% higher on JSON than cl100k |
| 84 | c18 | A | Firecrawl search tool's description, quoted |
| 85 | c20,map | A | Brave Search's eight tools cost more than Playwright's seventy-one (all caps) |
| 86 | c22,map | A | The model never sees output schema, title, annotations; it reads name, description, input schema, "what Claude's tool format carries" |
| 87 | map | A | DBHub: the server Claude Code's own docs use as the Postgres example |
| 88 | map | B | Claude Code, MCP and Vercel docs all publish llms.txt |
| 89 | map | A | Context7: free key recommended for rate limits |
| 90 | map | A | Playwright MCP: bare npx failed in our run |
| 91 | map | A | MotherDuck in-memory needs --read-write |
| 92 | map | B | Supabase: a 2025 exfiltration via a support ticket |
| 93 | map | A | codebase-memory: known blind spots in Next.js and TypeScript |
| 94 | map | A | sequential-thinking: no measured benefit on current models; description past the old 2,048-character limit |
| 95 | map | B | CLAUDE.md and auto memory re-injected after compaction |
| 96 | map | B | @osdk/cli deploys a front end to a Foundry-hosted site from the terminal |

Left out of the frame (26, tier A, the owner's token counts of individual servers and tools): the 21 rows of the measurement table (brave-search, firecrawl, playwright with all caps, basic-memory, postgres-mcp-pro, chrome-devtools, playwright default, codebase-memory, filesystem, memory, perplexity, everything, tavily, git, context7, sequential-thinking, motherduck, exa, dbhub, fetch, chrome-devtools --slim); `brave_place_search`; `firecrawl_search` and its "35 cheapest tools"; and the server-instruction sizes of Firecrawl, Context7 and Perplexity.
