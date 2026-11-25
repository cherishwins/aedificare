# Lane 3: LOADOUT (10 Oct 2026), MCP claims

Edition: "LOADOUT", Aedificare, dated 10 Oct 2026. Judged as of 10 Oct 2026. Changes after that date are noted separately under each claim.
Leads read: /home/user/aedificare/source/loadout/map.html (sources list, lines 236-263; rows at lines 197-199, 287, 291, 301, 317) and /home/user/aedificare/source/loadout/print.txt (lines 117-124, 250, 345-348, 430).

## 3.1. Stateless HTTP only; the 2026-07-28 spec removed sessions. (print 07; map) (tier unmarked (method lists the MCP spec as a B source))
Verdict: overstated
Primary: Model Context Protocol maintainers, "Specification 2026-07-28: Key Changes" (changelog), undated on page. https://modelcontextprotocol.io/specification/2026-07-28/changelog
Read: 2026-11-01
Quote: "1. Remove protocol-level sessions and the `Mcp-Session-Id` header from the Streamable HTTP transport." (under "## Major changes")
Quote: "2. Make MCP stateless: remove the `initialize`/`notifications/initialized` handshake." (under "## Major changes")
Quote (transports page, https://modelcontextprotocol.io/specification/2026-07-28/basic/transports.md, under "# Overview"): "The binding pages specify the standard transports:" followed by "1. [stdio]... newline-delimited messages over the standard streams of a client-launched subprocess." and "2. [Streamable HTTP]... each message is an HTTP POST to a single MCP endpoint".
True as: The 2026-07-28 spec removes protocol-level sessions and the Mcp-Session-Id header from Streamable HTTP, and makes requests stateless.
Notes: "HTTP only" is wrong: the same spec still defines stdio as a standard transport. The changelog supports "removed sessions" and "stateless" for the protocol, not "HTTP only". I did not confirm the release status of the 2026-07-28 revision as of 10 Oct (draft or final); the page fetched today is a versioned spec URL with no status line. Read today, not as of 10 Oct; no change check run.

## 3.2. Reference servers are not hardened: the filesystem and git servers each shipped CVEs. (print 07) / Two Anthropic reference servers shipped CVEs (print 21) / Shipped two path-bypass CVEs in 2025. (map, filesystem) / Shipped three CVEs in January 2026. (map, git) (tier A in map rows; unmarked in print)
Verdict: wrong
Primary: GitHub Advisory Database, advisories GHSA-hc55-p739-j48w (CVE-2025-53110, @modelcontextprotocol/server-filesystem, published Jul 1, 2025), GHSA-vjqx-cfc4-9h6v (CVE-2026-27735, mcp-server-git, published Feb 25, 2026); GitHub advisory search for CVE-2025-68145 (GHSA-j22h-9j4x-23w5, mcp-server-git, published Dec 17, 2025). https://github.com/advisories/GHSA-vjqx-cfc4-9h6v ; https://github.com/advisories?query=CVE-2025-53110 ; https://github.com/advisories?query=CVE-2025-68145
Read: 2026-11-01
Quote (GHSA-vjqx-cfc4-9h6v): "In `mcp-server-git` versions prior to 2026.1.14, the `git_add` tool did not validate that file paths" ... "provided in the files argument were within the repository boundaries." Published "Feb 25, 2026" (GitHub Advisory Database publication "Feb 26, 2026").
Quote (advisory search for CVE-2025-53110): "@modelcontextprotocol/server-filesystem vulnerability allows for path validation bypass via colliding path prefix" — Published: "Jul 1, 2025".
Quote (advisory search for CVE-2025-68145): "mcp-server-git has missing path validation when using --repository flag" — Published: "Dec 17, 2025".
True as: The filesystem server shipped two CVEs in 2025 (CVE-2025-53109 and CVE-2025-53110, both published 1 Jul 2025), and the git server has shipped at least four CVEs: CVE-2025-68143, CVE-2025-68144 and CVE-2025-68145 (published 17 Dec 2025), and CVE-2026-27735 (published 25 Feb 2026).
Notes:
- The "January 2026" date is wrong for git. Three git CVEs were published in December 2025 (per search aggregators citing NVD; I did not open NVD itself, which returned only its title). The only 2026 git CVE I confirmed is CVE-2026-27735, published February 2026. So "three CVEs in January 2026" is not supported by anything I found.
- Filesystem: CVE-2025-53110 is a path-prefix bypass. CVE-2025-53109 is a symlink-following flaw (GitLab CWE-59), so "path-bypass" describes it loosely. CVE-2025-53109's published date comes from a search aggregator; I did not open its advisory.
- "Anthropic reference servers" (print 21): the packages are in the modelcontextprotocol/servers repo; I did not verify who maintains them. Not checked.
- Fixed versions differ across sources for CVE-2025-53109; I did not resolve them.
- Could not open: github.com/advisories listing for modelcontextprotocol/servers (readable, but only 10 entries shown, all dated 2026, with CVE IDs and fixed versions "Not shown"); api.github.com (HTTP 403); nvd.nist.gov detail pages (only the title rendered); cvelogic.com (HTTP 403).
- Changed since 10 Oct 2026: the GitHub listing shows new advisories after the edition date: GHSA-4gxg-m5jx-9j57, GHSA-53mr-w429-c597 and GHSA-hhwq-wxfx-cj7g (server-filesystem, published Oct 25, 2026), and GHSA-w766-5x43-whvw (mcp-server-git, "nested gitdir file bypasses --repository confinement", published Oct 28, 2026). These did not exist on 10 Oct and are not evidence for the edition's claim.
- The listing is the first page only; a full-text check of every page of the repo advisories was not run.

## 3.3. Cloudflare's three-tool server runs JavaScript against its API spec: 244,000 tokens of naive tools becomes 1,100. (print 07) / Vendor figure: about 1,100 tokens versus about 244,000 for naive tools. (map) (tier B (map))
Verdict: overstated
Primary: Cloudflare, "cloudflare/mcp" README (repository README, undated; read today). https://github.com/cloudflare/mcp
Read: 2026-11-01
Quote (Tools table): "`docs`: Search Cloudflare developer documentation"; "`search`: Writes JavaScript to query `spec.paths` and find endpoints."; "`execute`: Writes JavaScript to call `cloudflare.request()`"; "`whoami`: Return the Cloudflare user or account this connection is authenticated as". The table lists four tools.
Quote (Token Comparison table): "Code mode" row lists "3 tools".
Quote (Problem section): "The Cloudflare OpenAPI spec is **2 million tokens**." and "still **~244k tokens**."
Quote (Token Comparison table): "Native MCP (minimal): 244,047"; "Code mode: ~1,100 (0.5% of a 200K context)".
Quote (Code Mode note): "Disabling code mode significantly increases the token cost (~244k tokens vs ~1k tokens)."
True as: Cloudflare's code-mode MCP server runs JavaScript against its API spec. Its README gives the token cost of the minimal native MCP schemas for the whole Cloudflare API (about 244,000 tokens) and of code mode (about 1,100 tokens) as its own figures, not measured by us or an outside party.
Notes:
- "Three-tool" conflicts with the README: the Tools table lists four (docs, search, execute, whoami); the Token Comparison table says code mode uses 3 tools. The edition should not state a tool count without saying which.
- "Naive tools" is the edition's phrase. The README's 244k figure is the minimal native MCP schema for roughly 2,500 endpoints, which is a different thing from a generic set of naive tools.
- The README cites no methodology or external source for the token figures.
- The edition's own tokenizer caveat (print.txt lines 480-482: figures read as relative, tokenizer runs 10 to 20% higher on JSON) was not checked here.
- Changed since 10 Oct: not checked. The README was read today with no changelog; I cannot say whether it changed after 10 Oct.

## 3.4. Three tools, no auth, for reading other people's public repos. (map, DeepWiki) / DeepWiki for other people's repos. (print 12) (tier B)
Verdict: holds
Primary: DeepWiki, "DeepWiki MCP server" documentation page (Devin docs), undated on page; read today. https://docs.devin.ai/work-with-devin/deepwiki-mcp
Read: 2026-11-01
Quote: "The DeepWiki MCP server offers three main tools:" followed by "read_wiki_structure", "read_wiki_contents", and "ask_question".
Quote: "a free, remote, no-authentication-required service that provides access to public repositories."
Quote: "Want DeepWiki capabilities for private repositories?" (directs to a Devin account and the Devin MCP server "with your Devin API key").
True as: DeepWiki's remote MCP server has three tools, needs no login or API key, and covers public repositories only.
Notes: The page is hosted by Devin (Cognition), not by DeepWiki's own site. "Other people's" is the edition's gloss on "public repositories"; the wording is fine. Tier B is consistent with a vendor docs page. Changed since 10 Oct: not checked; page read today without a date.

## 3.5. −39% multi-turn versus single-turn across 200,000 simulated conversations. Mostly unreliability, not lost ability. (print 18) (tier B)
Verdict: overstated
Primary: Philippe Laban, Hiroaki Hayashi, Yingbo Zhou, Jennifer Neville, "LLMs Get Lost In Multi-Turn Conversation", arXiv:2505.06120, submitted 9 May 2025. https://arxiv.org/abs/2505.06120
Read: 2026-11-01
Quote: "Analysis of 200,000+ simulated conversations decomposes the performance degradation into two components"
Quote: "with an average drop of 39% across six generation tasks"
Quote: "a minor loss in aptitude and a significant increase in unreliability"
True as: Across six generation tasks and more than 200,000 simulated conversations, the paper reports an average 39% performance drop from single-turn to multi-turn; it attributes the degradation mainly to unreliability, with a minor loss in aptitude.
Notes:
- "200,000" should be "200,000+" per the abstract.
- The 39% is an average across six tasks, not a single figure for every task.
- "Not lost ability" is stronger than the paper's "a minor loss in aptitude." Use the paper's words.
- Quotes were returned by WebFetch from the arXiv abstract page; I did not check them against the full PDF text. Changed since 10 Oct: not applicable (2025 paper).
