# LOADOUT: verdicts of the sample audit

Edition 07, *LOADOUT*, dated 10 Oct 2026. Settled 2026-11-01. The rows behind every verdict, with the primary's own words, the URL and the day it was read, are in `research/loadout/settled-1.md`, `settled-2.md` and `settled-3.md`; the claims and how they were drawn are in `research/loadout/SAMPLE.md`; the passes are `lane-*.md` (researchers) and `skeptic-*.md` (skeptics).

## The method

- **Inventory.** All three versions in `source/loadout/` (the print, the carousel, the map) were read in full: 122 checkable claims, 96 in the sampling frame and 26 left out as the owner's own per-server token counts, which are tier A and which no document can settle.
- **Fifteen claims.** Ten by weight: the four the brief named (the MCP spec's sessions, the reference servers' CVEs, Cloudflare's code-mode figures, AI FDE's GA date) and six documentation claims a recommendation rests on, three about Anthropic's documents and three about Palantir's. Five by position: every 17th of the 86 claims left, with one rule set before the draw so each lane holds five.
- **Three lanes of five.** Anthropic's and Claude Code's documentation; Palantir's documentation; the MCP specification, the reference servers, Cloudflare, DeepWiki and one arXiv paper. A researcher per lane opened every primary; a skeptic per lane reopened what the researcher judged (lane 1's skeptic reviewed 1.1 to 1.3, lane 2's all five, lane 3's all five); the main thread settled every disagreement by opening the primary itself, and opened 1.4 and 1.5, which had no skeptic.
- **As of the edition's day.** A verdict is about 10 Oct 2026. Where a page has changed since, its 10 Oct text was read where one could be found (a dated mirror of Anthropic's docs, Cloudflare's README at the commit in force that day, Palantir's dated announcements); later changes are listed for the owner and not used. No wall was worked round: github.com's advisory and commit pages, web.archive.org, npm and two Anthropic issues refused this sandbox, and each refusal is named in its settled file.
- **A claim is one statement on several surfaces.** Its verdict is its worst surface's: a claim with one amended surface is changed, one with a wrong surface is wrong.

## The result

Of fifteen claims: **6 held, 8 changed, 1 wrong, 0 could not open.** By surface, 43 rows: 27 held, 15 amended, 1 wrong.

Changed or wrong: **9 of 15, 60 percent.** One of the eight changes, 1.1, is the print's 72×, which this page already prints as 24× from the corrected rows; counted on the page's own wording the rate is 8 of 15, 53 percent.

**Does it earn the full pass? Yes.** The bar (Decisions log, 1 Nov 2026, as the task gives it: a sample that finds errors at the rate past prints had, roughly a third or more of claims changed or wrong) is about 5 of 15, and the sample found 9, or 8 on the page's own wording. That is the record's rate (The Supply Cabinet 98 of 227, The Snapshot Problem 56 of 144, The Markup 28 of 81): a print checked by nobody but its author is wrong in about a third to a half of what it says. The skeptics changed 11 of the 13 researcher verdicts they reviewed, and the main thread changed 4 more, which says the full pass needs the skeptic on every lane. Note that the Decisions log entry the bar is named for is not in `CLAUDE.md` in this checkout (`SAMPLE.md` says the same); the bar is applied as the task states it.

The pattern, for the full pass: nothing in the sample was invented. The errors are a scope dropped (Cloudflare's 244,000 is its minimal-schema figure, not its full one; Palantir MCP starts with one tool only with tool search on, which on 30 June was opt-in), an absolute that a document contradicts ("the only MCP route that mutates data", beside Palantir MCP's own dataset-writing tools), a count and date that moved (four git CVEs, published December 2025 to February 2026, not three in January), and a negative stated as observed ("the model never sees them") that no document or uploaded test supports.

## Applied to `src/pages/loadout.astro`

Nine rows whose wording the page carries, each the settled wording: 1.3c (the correction line, 05), 2.2a (10), 2.3a and 3.3a (rung 2), 3.1a (rung 3), 2.4a (the Ontology MCP path, 11), 3.2e (the git entry, 09), 3.3c (the Cloudflare entry, 09), 3.5 (the −39% stat, 13). Thirteen sources added as 23 to 35, with their addresses; the line above the list says which were added; the dated mono note is under the list. Not applied, because the page does not carry that wording: 1.1a (the page computes 24×), 1.1b and 3.3d (carousel), 1.3b, 2.2c and 3.3b (map). Held rows and the row left for the owner (3.2c) are unchanged.

## For the owner

- **"Two Anthropic reference servers shipped CVEs" (16) is left as written.** It describes who runs the servers, and the builder is an Anthropic model. The servers README says both "maintained by the MCP steering group" and "Managed by Anthropic, but built together with the community"; The Hacker News calls mcp-server-git "maintained by Anthropic". Whether the line says "Anthropic", "the MCP project's" or neither is yours.
- **"The model never sees them": keep it only on a test.** No Anthropic page says what Claude Code does with an MCP tool's output schema, title or annotations, and nothing uploaded shows a request body. The page now says what Anthropic documents: Claude's tool format has no field for them. If you inspected what 2.1.296 sends, the original line can come back at tier A. Every corrected figure stands on this point, so the full pass should settle it.
- **Date the CLI quotation, or not.** "CLI tools are the most context-efficient way to interact with external services" was on Anthropic's best-practices page on 10 Oct and was gone by 27 Oct. The slap quotes it correctly for the day; "as of 10 Oct 2026" is the smallest addition. The map's "Anthropic recommends it by name for context efficiency" is in the same position.
- **"AI FDE has no API" as an absolute.** It held on every page read, and the section says "as of October 2026"; "Palantir documents no API for AI FDE" is the softer true form. Editorial.
- **Palantir MCP's tool-search default** changed from opt-in (30 June) to on, on a date nothing found gives. The amended rung is true either way; the install command's `--tool-search` stays correct.
- **Tier A on the filesystem and git entries.** The CVEs were read from advisories, not run; tier B fits the notes unless the tier is read as grading the token count beside them.
- **Stateless HTTP.** Every server measured negotiated 2025-11-25, the revision before sessions were removed, and the 2026-07-28 spec keeps a fallback for them, so a reader will meet servers that still keep sessions. True as printed.
- **Cloudflare's tool count** went from three to four (`whoami`) on 7 Oct; its token table still counted three on 10 Oct. The page now drops the count.
- **For the full pass, outside the sample:** brave_place_search's shipped size is 21,462 in the print and the map's correction note and 16,968 on carousel 22 and this page, and print 09 blames its input schema beside a correction that blames output schemas; "Build work only" beside Palantir MCP's `create_and_write_to_foundry_dataset`; the 2,048-character limit called "old" on the day 2.1.296 raised it.
- **Since 10 Oct, not used:** new advisories on server-filesystem (25 Oct) and mcp-server-git (28 Oct), so a reprint recounts; Anthropic's best-practices rewrite; the MCP page's new model list and gateway default.
- `src/lib/editions.mjs`'s comment on the entry still says "no source has been opened"; it is not this task's file and was left.

## The table

Verdicts read researcher → skeptic → settled; "page" is what changed on `src/pages/loadout.astro`.

| # | Claim (short) | Tier | Drawn by | Verdict | Page |
|---|---|---|---|---|---|
| 1.1 | Claude Code defers MCP tool definitions by default; the gap is 72× (print) / 24× | B, unmarked | weight | Overstated → Amended → **Changed**: 72× is the first count's; "on unless you turn it off" was not true behind a non-first-party base URL; "MCP tool's" added | none (the page computes 24×) |
| 1.2 | "CLI tools are the most context-efficient way to interact with external services." | unmarked | weight | Not in the source → Held → **Held**, on the 10 Oct page; removed between 23 and 27 Oct | none |
| 1.3 | The model never sees output schemas, titles, annotations | A | weight | Holds → Amended → **Changed**: the format has no field for them; what reaches the model is not documented | 05 correction line |
| 1.4 | Keep CLAUDE.md under 200 lines, only what the model cannot infer | B | position | Holds → not reviewed → **Held** | none |
| 1.5 | One `.claude/rules` file per sub-system with `paths:` | unmarked | position | Overstated → not reviewed → **Held** (main thread) | none |
| 2.1 | AI FDE GA on 12 March 2026 | B | weight | Could not settle → Held → **Held** | none |
| 2.2 | AI FDE has no API; tool approvals happen in the browser | B | weight | Overstated → Amended → **Changed**: no API held; a pre-filled session still asks to approve tools before they make changes, and edits auto-approve on feature branches | 10 |
| 2.3 | Palantir MCP starts with one tool, search_tools | B | weight | Overstated → Amended → **Changed**: only with tool search on, opt-in as of 30 June | rung 2 |
| 2.4 | Ontology MCP is the only MCP route that mutates data or triggers logic | B | weight | Overstated → Amended → **Changed**: the only route that writes ontology data; Palantir MCP writes datasets and runs compute functions | 11, Ontology MCP |
| 2.5 | `@osdk/cli` deploys a front end to a Foundry-hosted site | B | position | Held → Held → **Held** | none |
| 3.1 | Stateless HTTP only; the 2026-07-28 spec removed sessions | unmarked | weight | Overstated → Held without "only" → **Changed**: stdio is still a standard transport | rung 3 |
| 3.2 | The filesystem and git reference servers shipped CVEs; three git CVEs in January 2026 | A, B | weight | Wrong → Held / Amended → **Wrong** on the git entry: four CVEs, published 17 Dec 2025 and 26 Feb 2026; the rest held | 09, git |
| 3.3 | Cloudflare's three-tool server: 244,000 tokens of naive tools becomes 1,100 | B | weight | Overstated → Amended → **Changed**: 244,047 is the minimal-schema figure (full: 1,170,523); four tools on 10 Oct, two of them write JavaScript | rung 2; 09, Cloudflare |
| 3.4 | DeepWiki: three tools, no auth, public repos | B | position | Holds → Held → **Held** | none |
| 3.5 | −39% multi-turn; mostly unreliability, not lost ability | B | position | Overstated → Held → **Changed**: −39% is an average over six tasks across 200,000+ conversations; aptitude fell 16 percent, a minor loss | 13 stat |

Totals: 6 held, 8 changed, 1 wrong, 0 could not open, of 15. Researcher verdicts changed by the skeptic: 11 of the 13 reviewed (1.1, 1.2, 1.3; 2.1 to 2.5; 3.1, 3.2, 3.3); by the main thread: 1.5, 3.1, 3.2's git entry and 3.3c's tool count.

## Recheck, 1 Nov 2026

A review of the port against these verdicts and the three versions in `source/loadout/` raised five findings on `src/pages/loadout.astro`. Each was checked against its evidence; all five held and each is applied with the smallest true change. Build and sweep clean after.

| # | Where | Finding | Evidence checked | Applied |
|---|---|---|---|---|
| R1 | 06, the mono line and the brave_place_search label | The page applied 1.3c in 05 ("Claude's tool format has no field for them") but 06 still stated the unsettled negative as fact: "What a server ships is not what the model reads" and "1,518 · what the model reads" (carousel 22, word for word) | settled-1.md 1.3b/1.3c; "For the owner" above | **Held.** Now "What a server ships is not what Claude's tool format carries." and "1,518 · name, description and input schema". The original wording can come back at tier A on the owner's test, with 1.3. |
| R2 | 09, "Every entry on the map", prose and the first stat | The prose said unmeasured servers are "not counted as zero", but both sums skip them (map.html line 359, `if(i.m){full+=...;names+=...}`; its own fine print, line 184: "Servers we did not measure count as zero and are flagged"), and the first stat credited 56 tokens to "the shortlist's 4 servers" with no caveat (Palantir MCP and Ontology MCP unmeasured) | map.html 184, 359; the page's `shortMeasured` | **Held.** Prose: "marked so in the table and count as zero in the two sums below." First stat: "for the 2 of the shortlist's 4 servers we measured." |
| R3 | 06, "First count:" line; 05 correction note | "Postgres MCP Pro's nine tools cost three times Chrome DevTools' thirty" (print 09) is not what the first count's own rows give: 8,291 against 5,684 (print 08) is 1.46 times (about 4.9 a tool). The 05 note counted "two figures in 08" and left out 06's | print.txt 08 and 09 | **Held.** The line now gives the print's rows, "nine tools at 8,291 tokens, Chrome DevTools' thirty at 5,684", then the corrected 1,156 against 5,414; the print's "three times" is dropped. The 05 note reads "The first-count figures still on this page, in 06 and 08, say so." |
| R4 | 06, the 16,968 stat | The same-day correction gives two shipped sizes for brave_place_search: 16,968 (carousel 22) and 21,462 (map.html 232, as print 09). The page printed 16,968 without saying so; the conflict was listed above for the full pass, not resolved | carousel.txt slide 22; map.html 232; print.txt 09 | **Held.** 16,968 kept, with a mono line in 06: "What brave_place_search ships, below, is 16,968 tokens on the carousel; the map's correction gives 21,462. Which is right is to be settled." Still the full pass's to settle. |
| R5 | 00, the section label's tier mark | Print 01 carries no mark; the page put A on the label of a section whose one claim, "Claude Code turned it on by default", the edition grades B (carousel 15) and this audit classed B (1.1) | print.txt 01; carousel.txt 12, 13, 15 | **Held.** A dropped from the label; B after the sentence, as carousel 15 marks it. The counts carry no mark on the page (the Stats labels take no inline mark; carousels 12 and 13 put A on them). |

**A port change, recorded:** print 09's cause, brave_place_search's "input schema carries a giant enum", is not on the page. It was left out in the port, unrecorded until now; it sits beside a correction that blames output schemas, and whether either cause is right is the full pass's question with R4.
