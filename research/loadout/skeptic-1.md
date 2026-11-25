# Skeptic, lane 1 (LOADOUT, edition 07, 10 Oct 2026)

Checked 2026-11-01 against /home/user/aedificare/research/loadout/lane-1.md. Verdicts judge the researcher's verdicts as of 10 Oct 2026; later changes are noted separately.

Walls met, none worked round:
- web.archive.org refused the fetch ("Claude Code is unable to fetch from web.archive.org").
- claudeissues.com did not resolve in this session (outside the allowed network domains); it has to be allowed in the session's network settings before it can be read.
- outflank.nl returned HTTP 403 for https://www.outflank.nl/blog/2026/09/30/mcp-design/ (relevant to 1.3; unread).

For the docs as they stood on 10 Oct I used a public third-party mirror of the Claude Code docs on GitHub, ericbuess/claude-code-docs. A bot syncs it (commits by github-actions[bot] titled "Update Claude Code docs - YYYY-MM-DD"). It is a report of the primary, not the primary; where a verdict rests on it, that is said.

I re-read the edition text in /home/user/aedificare/source/loadout/print.txt and carousel.txt for the wording of each claim.

---

## 1.1. That 72× gap is the whole argument for deferred tool loading, and Claude Code turned it on by default. (print 01) / Claude Code now holds back each tool's full definition until it is needed. It is called tool search, and it is on unless you turn it off. (carousel 15)
Researcher: overstated.
Skeptic: **amended**. The verdict stands, but the researcher's exceptions and model list come from the 1 Nov page, not the 10 Oct one. The page then had an exception the researcher did not list (a non-first-party `ANTHROPIC_BASE_URL`). And the "(not built-in tools)" in the rewording is a negative no page states.

Evidence, the page as of 10 Oct (mirror of code.claude.com/docs/en/mcp at commits c4226b0, synced 2026-10-09, and f289630, synced 2026-10-10; the two read the same on these points):
- "Tool search keeps MCP context usage low by deferring tool definitions until Claude needs them. Only tool names and server instructions load at session start, so adding more MCP servers has minimal impact on your context window."
- "Tool search is enabled by default: MCP tools are deferred and discovered on demand."
- "Tool search requires a model that supports `tool_reference` blocks: Claude Sonnet 4.5, Claude Haiku 4.5, Claude Opus 4.5, and later models."
- `ENABLE_TOOL_SEARCH` (unset): "All MCP tools deferred and loaded on demand. Falls back to loading upfront on Google Cloud's Agent Platform models earlier than the Claude 4.5 generation, when `ANTHROPIC_BASE_URL` is a non-first-party host, or on a Microsoft Foundry deployment hosted on Azure"
- "Claude Code disables it when `ANTHROPIC_BASE_URL` points to a non-first-party host", "since most proxies don't forward `tool_reference` blocks."
- `false`: "All MCP tools loaded upfront, no deferral"
- https://raw.githubusercontent.com/ericbuess/claude-code-docs/f289630/docs/mcp.md ; https://raw.githubusercontent.com/ericbuess/claude-code-docs/c4226b0/docs/mcp.md ; commit list https://github.com/ericbuess/claude-code-docs/commits/main/docs/mcp.md

Evidence, the live page (read 2026-11-01), which is what the researcher read. Its quotes are verbatim there: "Tool search is enabled by default: MCP tools are deferred and discovered on demand." and "Claude Code uses tool search on Claude Opus 4, Claude Sonnet 4, Claude Haiku 4.5, and later models, or Opus 4.5, Sonnet 4.5, Haiku 4.5, and later models on Google Cloud's Agent Platform. On earlier models, Claude Code loads all MCP tools upfront, and `ENABLE_TOOL_SEARCH=true` doesn't override this." https://code.claude.com/docs/en/mcp

Where the researcher went wrong:
- The model note ("off on models earlier than Opus 4 and Sonnet 4") is the 1 Nov text. On 10 Oct the page said tool search "requires" Sonnet 4.5, Haiku 4.5, Opus 4.5 or later.
- The gateway exception was missing. On 10 Oct, setting `ANTHROPIC_BASE_URL` to a non-first-party host turned tool search off without the user doing anything, so "on unless you turn it off" was wrong there too.
- "(not built-in tools)" is not on the page. The page describes deferral for MCP tools and says nothing about built-in tools either way. The tools reference lists `ToolSearch` as the tool that "Searches for and loads deferred tools when tool search is enabled", but no page says which built-ins, if any, are deferred (https://code.claude.com/docs/en/tools-reference). The rewording should say what the page says, not add a negative.
- "Could not settle when the default was set." The researcher did not need this for the verdict. The claim says Claude Code "turned it on by default", and the 10 Oct page states the default. For the record: third-party reports quote the v2.1.7 changelog (January 2026) as "Enabled MCP tool search auto mode by default for all users" (threshold mode, not all-deferred). I could not reach the official changelog's older entries in this run (the file is about 1.1 million characters and the reads stopped at 2.1.301), so this is secondhand. Search hits: https://cdn.jsdelivr.net/npm/aiwg@2026.8.8/docs/mcp-auto-mode-guide.md (unread, search hit only).
- Arithmetic re-done: 102,616 / 1,415 = 72.5; 52,409 / 2,165 = 24.2. The researcher is right. The carousel (page 14) itself prints "24×", so the corrected deck already carries the corrected gap. Only the print's 72× is stale.

What the page should say (true as):
Claude Code defers the definitions of MCP tools until they are needed, so only tool names and server instructions load at session start. As of 10 Oct 2026 tool search was on by default on Claude Sonnet 4.5, Haiku 4.5, Opus 4.5 and later. It fell back to loading every tool upfront on earlier Agent Platform models, when `ANTHROPIC_BASE_URL` pointed at a non-first-party host, and on Microsoft Foundry deployments hosted on Azure. `ENABLE_TOOL_SEARCH=false` turns it off. The 72× gap is the print's first count; on the corrected figures it is about 24× (52,409 against 2,165).

Changes after 10 Oct (not used in the verdict):
- The live page now lists Claude Opus 4, Sonnet 4, Haiku 4.5 and later as models that use tool search.
- Changelog 2.1.304: "Changed tool search to be on by default behind a custom `ANTHROPIC_BASE_URL`…". 2.1.305: "Fixed every request failing on Vertex, Bedrock and other providers when the endpoint or a gateway rejects tool search…". https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md (I did not date these releases.) So the gateway exception that applied on 10 Oct has since gone.
- On 10 Oct the page read "Claude Code truncates each tool description and each server's instructions at 2,048 characters by default." So for claim 94 in the full check, the map's "the old 2,048-character limit" was the current limit on that day by the docs. The 16,384 limit and the v2.1.295/v2.1.296 notes are not in the 10 Oct text. (The edition ran 2.1.296, and the live page says the limit changed at 2.1.296, so the binary and the docs may have disagreed on 10 Oct. Left for the full check.)

---

## 1.2. "CLI tools are the most context-efficient way to interact with external services." Anthropic, Claude Code best practices.
Researcher: not in the source.
Skeptic: **overturned**. The sentence was on the cited page on 10 Oct 2026. Anthropic rewrote the page later in October.

Evidence:
- Mirror of code.claude.com/docs/en/best-practices at commit a434f50. It was synced 2026-10-06 and the file's next commit is 2026-10-20, so this is the text in force on 10 Oct. Section "Use CLI tools": "CLI tools are the most context-efficient way to interact with external services." Same section: "Tell Claude Code to use CLI tools like `gh`, `aws`, `gcloud`, and `sentry-cli` when interacting with external services." and "If you use GitHub, install the `gh` CLI." https://raw.githubusercontent.com/ericbuess/claude-code-docs/a434f50/docs/best-practices.md
- The sentence is still there at commits 566a69e and c8044e1 (2026-10-20), 3f8b93e (2026-10-22) and 1333191 (2026-10-23). It is gone at 76227ee (2026-10-27), which has "If that system has a CLI, that's usually the easiest way in." instead. https://raw.githubusercontent.com/ericbuess/claude-code-docs/1333191/docs/best-practices.md ; https://raw.githubusercontent.com/ericbuess/claude-code-docs/76227ee/docs/best-practices.md ; commit list: https://github.com/ericbuess/claude-code-docs/commits/main/docs/best-practices.md
- A separate report of the same attribution, before the edition: Firecrawl's blog (11 June 2026) quotes "CLI tools are the most context-efficient way to interact with external services." and attributes it to https://code.claude.com/docs/en/best-practices . https://www.firecrawl.dev/blog/why-is-cli
- The live page (read 2026-11-01) has the rewritten text the researcher quoted, under "Connect the tools Claude needs": "If that system has a CLI, that's usually the easiest way in." https://code.claude.com/docs/en/best-practices

Where the researcher went wrong: the verdict judged the 1 Nov page and called it a 10 Oct verdict. By the mirror's sync dates, the page changed between 23 and 27 Oct 2026. The negative also rested on a single web search. Searching for the page's history settles it.

Wording check: the edition's quotation matches the 10 Oct sentence word for word, punctuation included. Print 06, carousel 27 and the map ladder all read "CLI tools are the most context-efficient way to interact with external services."

What the page should say: the quotation stands as of 10 Oct 2026. Verdict: holds as of 10 Oct 2026, on a third-party mirror of the page. The Anthropic page itself could not be re-read as of that date (web.archive.org refused). Later change: the page was rewritten in late October 2026 and the sentence is gone. The nearest wording now is "If that system has a CLI, that's usually the easiest way in." Any reprint after that date needs the quotation dated or replaced.

Also for the full check: the map's GitHub category says "Anthropic recommends it by name for context efficiency" (of the gh CLI). On the 10 Oct page the gh recommendation ("If you use GitHub, install the `gh` CLI.") sits in the same "Use CLI tools" section as the context-efficiency sentence. So that line was supported then, and the page today does not support it.

---

## 1.3. Name, description and input schema for every tool, which is what Claude's tool format carries. ... Our first count included each tool's output schema, title and annotations. The model never sees those (map) / Our first count included output schemas. The model never sees them. We corrected every figure here. (carousel 22)
Researcher: holds.
Skeptic: **amended**. The researcher's own notes say the half of the claim the correction rests on ("the model never sees those") is "not settled", yet the verdict is "holds". A claim whose load-bearing half is unsettled does not hold. The researcher also said nothing beyond the docs bears on that half. That is wrong: there is evidence, but it is third-party, not Anthropic's documentation.

Evidence, the format half (verified, verbatim):
- "A user-defined tool definition includes:" `name` "The name of the tool. Must match the regex `^[a-zA-Z0-9_-]{1,128}$`."; `description` "A detailed plain text description of what the tool does, when it should be used, and how it behaves."; `input_schema` "A [JSON Schema](https://json-schema.org/) object defining the expected parameters for the tool."; `input_examples` "(Optional) An array of example input objects that show Claude how to use the tool." https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools (live page; I found no dated copy for 10 Oct.)
- The full optional-property list ("Tool definition properties") is `cache_control`, `strict`, `defer_loading`, `allowed_callers`, `input_examples`, `eager_input_streaming`. None is an output schema, a title or annotations. https://platform.claude.com/docs/en/agents-and-tools/tool-use/tool-reference

Evidence, the "never sees" half (third-party, on Anthropic's own issue tracker, no Anthropic reply on either issue):
- anthropics/claude-code issue #54197, opened 28 Apr 2026, closed as not planned (by the stale bot): "The model receives only:" `{ name, description, parameters }   // parameters = inputSchema` and "`outputSchema` is dropped before reaching the model." Method given: "Confirmed by tools/list wire capture (`outputSchema` present) plus an in-session prompt asking the model to print the literal `outputSchema` for a registered tool." https://github.com/anthropics/claude-code/issues/54197
- anthropics/claude-code issue #90150, opened 27 Aug 2026, open: "the tool definition presented to the model contains only `name`, `description`, and `input_schema`." and "an explicit field allowlist (`name`, `description`, `input_schema`, `cache_control`) strips everything else before the request is sent." Version: "the behavior is unchanged as of Claude Code 2.1.220". https://github.com/anthropics/claude-code/issues/90150
- Neither issue names `title` or `annotations`. The allowlist reported in #90150 would exclude them, but that is inference from a user's report.
- The Claude Code MCP doc (live page) shows Claude Code rewrites what it sends rather than passing the server's entry through: "Before sending the tool to the API, Claude Code flattens the schema into a single object and prepends a sentence to the tool's description". The doc also describes annotations as acting on Claude Code's own behaviour, not as text for the model: `readOnlyHint` "the tool changes nothing. Claude Code also runs the tool's calls in parallel with other read-only calls." No passage says annotations, title or output schema reach the model, and none says they do not. https://code.claude.com/docs/en/mcp

What the page should say (true as):
Anthropic's tool format carries a name, a description and an input schema (plus optional properties such as input_examples), and it has no field for an output schema, a title or annotations. That Claude Code never shows those to the model is not stated in Anthropic's documentation. Two user reports on Anthropic's Claude Code issue tracker say the model-facing definition is name, description and input schema only, and that the output schema is dropped (one tested at Claude Code 2.1.220; the edition ran 2.1.296). Verdict: holds for the format; the "never sees" half rests on third-party reports and the edition's own test, not on a document. Tier A (the owner's measurement) is the right mark for that half. To promote it to B, run a test on 2.1.296 (inspect the request body for a server whose tools ship an outputSchema, title and annotations), as the researcher proposed.
