# Skeptic, lane 3 (LOADOUT, edition 07, 10 Oct 2026)

Checked 2026-11-01 against /home/user/aedificare/research/loadout/lane-3.md. Verdicts judge the researcher's verdicts as of 10 Oct 2026; later changes are noted separately.

I re-read the edition text for each claim in /home/user/aedificare/source/loadout/print.txt (lines 115-124, 250, 256, 345-348, 430-431), carousel.txt (line 579) and map.html (lines 197-199, 287, 291, 301, 317).

Tally: upheld 2 (3.4, 3.5), overturned 0, amended 3 (3.1, 3.2, 3.3).

Walls met: none. Every page in this file was read directly. WebFetch would not reproduce whole tables or paragraphs verbatim, so the quotes here are the short exact excerpts it returned.

---

## 3.1. Stateless HTTP only; the 2026-07-28 spec removed sessions. (print 07) / Stateless HTTP; the 2026-07-28 spec removed sessions. (map, the ladder)
Researcher: overstated ("HTTP only" is wrong because the spec still defines stdio).
Skeptic: **amended**. The researcher's quotes are verbatim and the sessions half holds. But the ground for "overstated" misreads the claim, and the release-status question the researcher left open has an answer: the revision was released on 28 July 2026, well before 10 Oct.

Evidence:
- Changelog, under "Major changes", verbatim as the researcher quoted: "1. Remove protocol-level sessions and the `Mcp-Session-Id` header from the Streamable HTTP transport. ... Servers that need cross-call state use explicit, server-minted handles passed as ordinary tool arguments" and "2. Make MCP stateless: remove the `initialize`/`notifications/initialized` handshake." https://modelcontextprotocol.io/specification/2026-07-28/changelog
- Transports page lists two standard bindings, "1. [stdio]... newline-delimited messages over the standard streams of a client-launched subprocess." and "2. [Streamable HTTP]: each message is an HTTP POST to a single MCP endpoint". https://modelcontextprotocol.io/specification/2026-07-28/basic/transports.md
- Release status: the MCP blog post "The 2026-07-28 Specification", dated "July 28, 2026": "Today, we're officially pushing the release button on the next version of the MCP specification". A release candidate post is dated May 21, 2026. https://blog.modelcontextprotocol.io/posts/2026-07-28/ ; https://blog.modelcontextprotocol.io/tags/protocol/
- Versioning page (read today): "The **current** protocol version is [**2026-07-28**]". Revisions marked Current "may continue to receive backwards compatible changes". https://modelcontextprotocol.io/specification/versioning
- The same post qualifies "stateless": "The highlight of this release is a stateless protocol core" and "Dropping the protocol-level session doesn't force your application to be stateless." https://blog.modelcontextprotocol.io/posts/2026-07-28/

Where the researcher went wrong:
- "HTTP only" read as "HTTP is the only transport" ignores where the sentence sits. It closes rung 3, "Remote HTTP MCP with OAuth" (print line 120). Rung 4 of the same ladder is "Local stdio MCP" (print line 123). So the edition is not saying stdio has gone. The natural reading is that the HTTP transport is now stateless only, with no session mode, and the changelog supports that. "Only" is ambiguous, though, and the map already drops it. Dropping it is the smallest fix, not a rewrite.
- "I did not confirm the release status" was a gap with an easy answer. The revision was released on 28 Jul 2026 and is the "current" version (not a draft), so it was in force on 10 Oct.
- The researcher's rewording, "makes requests stateless", is not the source's wording. The changelog says "Make MCP stateless", and the blog says the protocol core is stateless while applications may still keep state.

Scope note for the owner (not part of the verdict): the edition reports that every server it booted "negotiated protocol 2025-11-25" (map line 230; print line 481). That revision has sessions. The 2026-07-28 spec defines a fallback for such servers (transports page, "Backward Compatibility"). So "stateless" describes the current spec, not every remote server a reader will connect to.

What the page should say (true as):
"Stateless HTTP; the 2026-07-28 spec removed sessions." This is the map's wording, with "only" dropped from the print. If more is wanted: "The 2026-07-28 MCP spec (released 28 July 2026) removes protocol-level sessions and the Mcp-Session-Id header from Streamable HTTP and makes the protocol core stateless." Verdict: holds once "only" is dropped. The researcher's "overstated" should become "holds (wording: drop 'only')".

Changes after 10 Oct: none found in the changelog's major changes. The page has no revision date, and I found no dated copy for 10 Oct. The versioning page lets a Current revision take backwards-compatible changes, so later minor edits cannot be ruled out.

---

## 3.2. Reference servers are not hardened: the filesystem and git servers each shipped CVEs. (print 07) / Two Anthropic reference servers shipped CVEs; reference is not hardened. (print 21) / Shipped two path-bypass CVEs in 2025. (map, filesystem) / Shipped three CVEs in January 2026. (map, git)
Researcher: wrong.
Skeptic: **amended**. Three of the four statements hold, and the researcher's verdict of "wrong" for the whole claim is too strong. Only the git row's "three CVEs in January 2026" is off, and even there the researcher's "not supported by anything I found" is overturned: January 2026 is when the three git flaws were publicly disclosed. Two of the researcher's open notes are settled by the repo's own advisory list, which runs to a second page the researcher did not read.

Evidence, the repo's own advisory list (as of today, 15 published):
- Page 1 of https://github.com/modelcontextprotocol/servers/security/advisories?state=published shows 10, nine of them dated Oct 25 or Oct 28, 2026, plus GHSA-vjqx-cfc4-9h6v (Feb 25, 2026). It has a "Next" link.
- Page 2 (https://github.com/modelcontextprotocol/servers/security/advisories?page=2&state=published) shows five more: GHSA-5cgr-j3jf-jw3v, "Unrestricted git_init tool allows repository creation at arbitrary filesystem locations in mcp-server-git", Dec 17, 2025; GHSA-9xwc-hfwc-8w59, "Argument injection in git_diff and git_checkout functions for mcp-server-git allows overwriting local files", Dec 17, 2025; GHSA-j22h-9j4x-23w5, "Missing path validation when using --repository flag in mcp-server-git", Dec 17, 2025; GHSA-hc55-p739-j48w, "Path validation bypass via colliding path prefix", Jul 1, 2025; GHSA-q66q-fx2p-7w4m, "Path validation bypass via symlink handling", Jul 1, 2025.
- So up to 10 Oct 2026 the repo had published six advisories for these two servers: two for filesystem (Jul 2025) and four for git (three on Dec 17, 2025, one on Feb 25, 2026). Nothing else was published between Feb 25 and Oct 25, 2026.

Evidence, the individual advisories (GitHub Advisory Database):
- GHSA-q66q-fx2p-7w4m: "CVE-2025-53109", "npm @modelcontextprotocol/server-filesystem", affected "<= 0.6.2" and ">= 2025.1.14, < 2025.7.1", patched "2025.7.1", published and reviewed July 1, 2025. Description: "Versions of Filesystem prior to 0.6.3 & 2025.7.1 could allow access to unintended files via symlinks within allowed" [directories]. https://github.com/advisories/GHSA-q66q-fx2p-7w4m
- GHSA-hc55-p739-j48w: CVE-2025-53110, same package and versions, published Jul 1, 2025: "Versions of Filesystem prior to 0.6.3 & 2025.7.1 could allow access to unintended files in cases where the prefix matches an" [allowed directory]. https://github.com/advisories/GHSA-hc55-p739-j48w
- GHSA-5cgr-j3jf-jw3v: "CVE-2025-68143", "pip mcp-server-git", affected "< 2025.9.25", patched "2025.9.25", published "Dec 17, 2025". https://github.com/advisories/GHSA-5cgr-j3jf-jw3v
- GHSA-9xwc-hfwc-8w59: "CVE-2025-68144", affected "< 2025.12.18", patched "2025.12.18", "Published to the GitHub Advisory Database Dec 17, 2025". https://github.com/advisories/GHSA-9xwc-hfwc-8w59
- GHSA-j22h-9j4x-23w5: "CVE-2025-68145", affected "< 2025.12.18", patched "2025.12.18", "Published to the GitHub Advisory Database Dec 17, 2025". https://github.com/advisories/GHSA-j22h-9j4x-23w5
- GHSA-vjqx-cfc4-9h6v: "CVE-2026-27735", "pip mcp-server-git", affected "< 2026.1.14", patched "2026.1.14", published "Feb 25, 2026", "Reviewed Feb 26, 2026". https://github.com/advisories/GHSA-vjqx-cfc4-9h6v

Evidence, January 2026 (a report, not a CVE record): The Hacker News, "Three Flaws in Anthropic MCP Git Server Enable File Access and Code Execution", Jan 20, 2026: "A set of three security vulnerabilities has been disclosed in mcp-server-git". It names CVE-2025-68143, CVE-2025-68144 and CVE-2025-68145, says they "have been addressed in versions 2025.9.25 and 2025.12.18", and that the fixes followed "responsible disclosure in June 2025." https://thehackernews.com/2026/01/three-flaws-in-anthropic-mcp-git-server.html

Evidence, "reference" and "not hardened" (modelcontextprotocol/servers README, read today; I found no copy dated 10 Oct). Both Filesystem and Git are listed under the "Reference Servers" heading. The warning callout: "They are meant to serve as educational examples for developers building their own MCP servers, not as production-ready solutions." https://raw.githubusercontent.com/modelcontextprotocol/servers/main/README.md

Evidence, who maintains them (flag for the owner; reported as the sources wrote it). The README gives two descriptions. The IMPORTANT callout under the title says the repo is "dedicated to housing just the small number of reference servers maintained by the MCP steering group." The closing line, after "Support", says "Managed by Anthropic, but built together with the community." The Hacker News calls mcp-server-git "the official Git Model Context Protocol (MCP) server maintained by Anthropic." So print 21's "Anthropic reference servers" has support: Anthropic's own repo line says "Managed by Anthropic". But the same README credits maintenance to "the MCP steering group". The owner should decide whether "Anthropic" stays. I have not softened or sharpened either source.

Where the researcher went wrong:
- Verdict. "Wrong" condemns the whole claim, but the print 07 and print 21 statements hold (both servers shipped CVEs; the README itself says they are not production-ready) and so does the map's filesystem row. Only the git row needs amending.
- "path-bypass describes it loosely" (CVE-2025-53109) is overturned. The repo titles it "Path validation bypass via symlink handling", and the database title is "path validation bypass via prefix matching and symlink handling". "Two path-bypass CVEs in 2025" is the advisories' own wording.
- "CVE-2025-53109's published date comes from a search aggregator; I did not open its advisory." It is now opened: July 1, 2025.
- "Fixed versions differ across sources for CVE-2025-53109; I did not resolve them." Resolved: the advisory gives 0.6.3 (for the 0.6.x line) and 2025.7.1.
- "three CVEs in January 2026 is not supported by anything I found." Something did support it: the three git flaws were publicly disclosed in January 2026, as press coverage dated 20 Jan 2026 reports. The CVE records were published on 17 Dec 2025, and the fixes shipped in 2025.9.25 and 2025.12.18, so "shipped ... in January 2026" is still the wrong date for the CVEs. The researcher's "per search aggregators citing NVD" is now replaced by the GitHub advisories themselves.
- "The listing is the first page only" was itself the gap. A second page exists, and it holds every advisory the claim is about.
- "who maintains them... Not checked." Checked above.

What the page should say (true as):
- Print 07 and print 21: hold as written. If print 21 keeps "Anthropic", the owner should know the README also says "maintained by the MCP steering group".
- Map, filesystem: holds as written ("Shipped two path-bypass CVEs in 2025": CVE-2025-53109 and CVE-2025-53110, both 1 Jul 2025).
- Map, git: "Shipped three CVEs in December 2025 (made public in January 2026) and a fourth in February 2026." Or, shorter: "Four CVEs, December 2025 to February 2026." (CVE-2025-68143, -68144, -68145 published 17 Dec 2025; CVE-2026-27735 published 25 Feb 2026.)

Changes after 10 Oct (not used in the verdict): on 25 Oct 2026 the repo published GHSA-4gxg-m5jx-9j57, GHSA-53mr-w429-c597 and GHSA-hhwq-wxfx-cj7g (server-filesystem), plus GHSA-7rgq-gccq-qphx ("Path traversal via trailing quote/whitespace in validatePath", no package named on the listing). On 28 Oct it published GHSA-w766-5x43-whvw (mcp-server-git). As of 1 Nov, the filesystem server has at least five advisories and git five. A reprint should recount.

---

## 3.3. Cloudflare's three-tool server runs JavaScript against its API spec: 244,000 tokens of naive tools becomes 1,100. (print 07) / Three tools run JavaScript against the API spec. Vendor figure: about 1,100 tokens versus about 244,000 for naive tools. (map) / Cloudflare's 3-tool code mode. (carousel 28)
Researcher: overstated.
Skeptic: **amended**. The verdict stands, but two of the researcher's quotes are not verbatim, the tool count needs dating, and the negative "cites no methodology" is overturned by Cloudflare's own write-up, a better primary the researcher did not open.

Evidence, the README as it stood on 10 Oct. The commit list for README.md shows d5d326e (Oct 9, 2026) as the last change before the edition and 8158532 (Oct 19) as the next. https://github.com/cloudflare/mcp/commits/main/README.md
- At d5d326e, the Tools table has four rows: `docs` "Search Cloudflare developer documentation"; `search` "Write JavaScript to query `spec.paths` and find endpoints"; `execute` "Write JavaScript to call `cloudflare.request()` with the discovered endpoints"; `whoami` "Return the Cloudflare user or account this connection is authenticated as".
- Token Comparison rows (Tools / Token cost): "Native MCP (full schemas)" 2,594 / 1,170,523; "Native MCP (minimal, required params only)" 2,594 / 244,047; "Code mode" "3" / "~1,100".
- "The Cloudflare OpenAPI spec is 2 million tokens." "Even with native MCP tools using minimal schemas, it's still ~244k tokens." "Disabling code mode significantly increases the token cost (~244k tokens vs ~1k tokens)." https://raw.githubusercontent.com/cloudflare/mcp/d5d326e/README.md
- The tool count's history. At 15f2279 (Feb 20, 2026) the Tools table had only `search` and `execute`, and the Code mode row read "2" / "1,069" (https://raw.githubusercontent.com/cloudflare/mcp/15f2279/README.md). At eb5db41 (Sep 24, 2026) it had three tools, `docs`, `search` and `execute`, with no whoami (https://raw.githubusercontent.com/cloudflare/mcp/eb5db41/README.md). `whoami` came in with commit 05cb21d, "feat(mcp): add whoami, an OpenAI profile tool for the connected identity (#258)", dated Oct 7, 2026.

Evidence, the better primary: Cloudflare blog, Matt Carey, "Code Mode: give agents an entire API in 1,000 tokens", published 2026-02-20 (last modified 2026-07-15 per page metadata). "The full Cloudflare API spec has over 2,500 endpoints." "An equivalent MCP server without Code Mode would consume 1.17 million tokens". "Two tools, roughly 1,000 tokens, and coverage of every endpoint in the API." Chart caption: "Code mode savings vs native MCP, measured with tiktoken". The post does not give the 244k figure or mention "minimal" schemas. https://blog.cloudflare.com/code-mode-mcp/

Where the researcher went wrong:
- Quotes not verbatim. The README says "Write JavaScript to query `spec.paths` and find endpoints", not "Writes JavaScript ...", and "Write JavaScript to call `cloudflare.request()` with the discovered endpoints" is cut off without an ellipsis. The row is "Native MCP (minimal — required params only)" (live page; the d5d326e fetch rendered the dash as a comma), not "Native MCP (minimal)".
- The tool count went undated. On 10 Oct the server listed four tools, but only since 7 Oct; from about June to 6 Oct it listed three. The ~1,100 figure belongs to the three-tool code-mode configuration in Cloudflare's table, and the vendor gives no figure that includes whoami. So "three-tool" matches the vendor's measured configuration, but not the server as shipped on the edition date.
- "The README cites no methodology or external source for the token figures" is true of the README alone. Cloudflare's own write-up says its comparison was "measured with tiktoken", the same proxy the edition uses (print line 481). The blog's headline comparison is ~1,000 against 1.17 million full schemas. The 244,047 minimal-schema figure appears only in the README.
- "Changed since 10 Oct: not checked." Checked: the README has commits after 10 Oct (Oct 19 to Oct 28: OAuth scope handling, Forge-generated direct tools, a per-call truncate argument). The tables I quoted read the same today as at d5d326e.
- The rewording adds a negative ("not measured by us or an outside party") that a page cannot show. The edition marks the row "unmeasured" and the map already says "Vendor figure", so the plain attribution is enough.

What the page should say (true as):
Print 07: "Cloudflare's code-mode server has the model write JavaScript against its API spec. By Cloudflare's count, the minimal native tool schemas for its API come to about 244,000 tokens, and code mode to about 1,100." If a tool count is kept: "three tools in Cloudflare's own count (it has listed a fourth, whoami, since 7 October 2026)". Map: "Code mode runs JavaScript against the API spec. Vendor figure: about 1,100 tokens versus about 244,000 for minimal native tools (1.17 million with full schemas)." Carousel 28: "Cloudflare's code mode" (drop "3-tool"), or date the count as above.

---

## 3.4. Three tools, no auth, for reading other people's public repos. (map, DeepWiki) / DeepWiki for other people's repos. (print 12)
Researcher: holds.
Skeptic: **upheld**.

Evidence (read today; the page has no date): "The DeepWiki MCP server offers three main tools:" followed by `read_wiki_structure`, `read_wiki_contents` and `ask_question`. It describes the server as "a free, remote, no-authentication-required service" and asks "Want DeepWiki capabilities for private repositories?", pointing to the Devin MCP server and a Devin API key. Endpoints: "https://mcp.deepwiki.com/mcp" (Streamable HTTP) and "https://mcp.deepwiki.com/sse" (SSE, legacy). https://docs.devin.ai/work-with-devin/deepwiki-mcp

Tests run:
- Quotes: all three of the researcher's quotes are on the page, verbatim.
- "Main" in "three main tools" leaves room for more. I searched for a fourth tool or a 2026 change to the tool set and found none. Third-party listings name the same three; one directory calls the third "ask_wiki_question" and says names vary by version. Search hits only, unread beyond the search summary: https://www.mcpbundles.com/providers/deepwiki ; https://mcpplaygroundonline.com/mcp-servers/deepwiki ; https://mcp.directory/blog/deepwiki-mcp-complete-guide-2026
- "No auth" is a negative, but the vendor states it in so many words, so it does not rest on absence.
- Primary: the Devin docs are Cognition's, and Cognition publishes DeepWiki, so this is the vendor's own documentation and tier B is right. The researcher's "not by DeepWiki's own site" is accurate and harmless.

Limits: I found no dated copy of the page for 10 Oct, so the verdict is read from today's page, as the researcher's was. Changes after 10 Oct: none found.

---

## 3.5. −39% multi-turn versus single-turn across 200,000 simulated conversations. Mostly unreliability, not lost ability. (print 18)
Researcher: overstated.
Skeptic: **upheld**. The verdict and the rewording stand. I add the paper's body figures, which close the researcher's "did not check against the full text" caveat and sharpen the aptitude point.

Evidence:
- Abstract, verbatim as the researcher quoted: "with an average drop of 39% across six generation tasks"; "Analysis of 200,000+ simulated conversations decomposes the performance degradation into two components: a minor loss in aptitude"; "a significant increase in unreliability". Submission history: v1 only, 9 May 2025. Authors: Laban, Hayashi, Zhou, Neville. https://arxiv.org/abs/2505.06120
- Full text (HTML v1): "Model aptitude degrades in a non-significant way between the full and sharded settings, with an average drop of 16%." and "On the other hand, unreliability skyrockets with an average increase of 112% (more than doubling)." Section 5: "more than 200,000 simulated conversations". "We selected a total of 15 LLMs from eight model families." https://arxiv.org/html/2505.06120v1 (I read the first 100,000 of 184,346 characters.)

Notes:
- "Not lost ability". The paper's body calls the aptitude drop "non-significant", which is closer to the edition than "minor" alone. But it is still an average drop of 16%, so "not lost ability" overstates it. "Mostly unreliability" is well supported (+112% against −16%).
- Scope. "Single-turn" in the paper is the fully specified instruction ("full"), and "multi-turn" is the instruction sharded across turns ("sharded"). The 39% is an average drop across six tasks and 15 models, not one model's figure.

What the page should say (true as): the researcher's version stands. A shorter form: "−39% on average, multi-turn versus single-turn, across six tasks, 15 models and more than 200,000 simulated conversations. Mostly unreliability (up 112%), with a smaller loss of ability (down 16%)."

Changes after 10 Oct: none. The arXiv record has one version.
