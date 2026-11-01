# Lane 1: Anthropic and Claude Code documentation (LOADOUT, edition 07, 10 Oct 2026)

Checked 2026-11-01. Verdicts judge each claim as of 10 Oct 2026, with later changes noted separately.

Pages opened (fetched as markdown; sentences below are verbatim from those fetches):
- code.claude.com/docs/en/mcp (section "Scale with MCP tool search", section "Configure tool search")
- code.claude.com/docs/en/best-practices
- code.claude.com/docs/en/memory
- platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools
- One web search for the sentence in claim 1.2 (no Anthropic page found containing it; see 1.2)

Scope note: the claim 1.1 figures and the claim 1.3 "our first count" wording are the edition's own. Their print and correction figures are as read in /home/user/aedificare/source/loadout/ (via research/loadout/SAMPLE.md); I did not re-open the print text itself.

---

## 1.1. That 72× gap is the whole argument for deferred tool loading, and Claude Code turned it on by default. (print 01) / Claude Code now holds back each tool's full definition until it is needed. It is called tool search, and it is on unless you turn it off. (carousel 15)
Verdict: overstated
Primary: Anthropic / Claude Code docs, "MCP" (sections "Scale with MCP tool search" and "Configure tool search"), undated page, read 2026-11-01. https://code.claude.com/docs/en/mcp
Read: 2026-11-01
Quote: "Tool search keeps MCP context usage low by deferring tool definitions until Claude needs them. Only tool names and server instructions load at session start, so adding more MCP servers has minimal impact on your context window."
Quote: "Tool search is enabled by default: MCP tools are deferred and discovered on demand."
Quote: "On earlier models, Claude Code loads all MCP tools upfront, and `ENABLE_TOOL_SEARCH=true` doesn't override this."
Quote: "# Disable tool search entirely / ENABLE_TOOL_SEARCH=false claude"
True as: Claude Code defers the definitions of MCP tools (not built-in tools) until they are needed, so only tool names load at start; tool search is on by default for supported models, and `ENABLE_TOOL_SEARCH=false` turns it off. The 72× gap is the print's first count, which the edition later corrected; on the corrected figures the gap is about 24× (52,409 against 2,165).
Notes:
- The 72× figure is arithmetic on the print's first count (102,616 / 1,415 = 72.5), per SAMPLE.md. The corrected figures on the map (52,409 / 2,165 = 24.2) give about 24×. So "that 72× gap" is the uncorrected number and is not the current one.
- "Whole argument": an opinion about the edition's argument, not a checkable fact; not settled here.
- "Each tool's full definition": the docs scope deferral to MCP tools. "Each tool" overstates it.
- "Turned it on by default" is true of the current docs. I did not find the date the default changed, so I could not settle whether it was a change Anthropic made before 10 Oct or earlier. Not settled: when the default was set.
- Models: the default is off on models earlier than Opus 4 and Sonnet 4 and on Microsoft Foundry deployments hosted on Azure (per the same section). Not a conflict with the claim, but the "on unless you turn it off" wording omits it.

---

## 1.2. "CLI tools are the most context-efficient way to interact with external services." Anthropic, Claude Code best practices. (print 06; carousel 27; map ladder)
Verdict: not in the source
Primary: Anthropic / Claude Code docs, "Best practices for Claude Code", undated page, read 2026-11-01. https://code.claude.com/docs/en/best-practices
Read: 2026-11-01
Quote: "Some of what Claude can't see lives in another system entirely, like your issue tracker or your error dashboard. If that system has a CLI, that's usually the easiest way in. With `gh` installed and signed in, for example, Claude will open pull requests and read review comments without any explanation from you."
True as: Anthropic's Claude Code best practices say that when a system Claude cannot see has a CLI, "that's usually the easiest way in." They do not describe CLI tools as the most context-efficient way to interact with external services, and the quoted sentence does not appear on that page.
Notes:
- I read the full fetched text of the best-practices page and searched it for "context-efficient", "most context", "efficient way" and "CLI tools"; none matched. The page does discuss MCP context cost only in passing ("Connected servers add their tool names and instructions to the context even when you're not using them, so it's worth turning off the ones you don't need").
- One web search for the exact sentence returned only third-party blog and vendor posts, none from Anthropic. I did not search the rest of Anthropic's site (blog, engineering posts, changelog) for the sentence, so this is a negative from the one page that carries the attribution, not from all of Anthropic's material. The attribution the edition gives is to the best-practices page, and that is where it fails.
- The edition's own wording uses quotation marks, so the words must match a source. None does on the cited page.

---

## 1.3. Name, description and input schema for every tool, which is what Claude's tool format carries. ... Our first count included each tool's output schema, title and annotations. The model never sees those, so the first deck overstated several servers (map) / Our first count included output schemas. The model never sees them. We corrected every figure here. (carousel 22)
Verdict: holds
Primary: Anthropic, "Define tools" (Tool use, Messages API), current docs, read 2026-11-01. https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools
Read: 2026-11-01
Quote: "A user-defined tool definition includes:" (table rows) "`name` | The name of the tool." (full text: "The name of the tool. Must match the regex `^[a-zA-Z0-9_-]{1,128}$`.") "`description` | A detailed plain text description of what the tool does, when it should be used, and how it behaves." "`input_schema` | A [JSON Schema](https://json-schema.org/) object defining the expected parameters for the tool." "`input_examples` | (Optional) An array of example input objects that show Claude how to use the tool."
Quote: "For the full set of optional properties available on any single tool definition, including `cache_control`, `strict`, `defer_loading`, and `allowed_callers`, see [Tool definition properties]..."
True as: Anthropic's tool definition format takes a name, a description and an input_schema (with optional fields such as input_examples); the format's table lists no output schema, title or annotations field.
Notes:
- Scope: the page describes user-defined tools in the Messages API. It does not describe Claude Code's handling of MCP tool metadata, so "every tool" in Claude Code is inferred from the format, not stated by the page.
- "The model never sees those" is a negative about what Claude Code passes to the model. Neither page states it. The format table shows the fields the API defines; it does not say that output schemas, titles or annotations are withheld from the model. Not settled by these pages; this is the claim the corrected counts rest on, and it needs a test (e.g. inspect the request body or /context output on a booted server) before the correction can be called verified.
- The MCP doc's tool-search section gives no field list for tool definitions either.

---

## 1.4. Keep CLAUDE.md under 200 lines. Put only what the model cannot infer. (print 05; carousel 25 and map repeat it)
Verdict: holds
Primary: Anthropic / Claude Code docs, "How Claude remembers your project" (CLAUDE.md and memory), current page, read 2026-11-01. https://code.claude.com/docs/en/memory
Read: 2026-11-01
Quote: "**Size**: target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence." (section "Write effective instructions")
Quote: "Refine from there with instructions Claude wouldn't discover on its own." (passage on `/init`, fetched text line 74)
Quote: "Keep it to facts Claude should hold in every session: build commands, conventions, project layout, "always do X" rules." (CLAUDE.md contents passage, fetched text line 51)
True as: Anthropic's memory guide says to target under 200 lines per CLAUDE.md file, and to keep to facts Claude should hold in every session, adding instructions Claude would not discover on its own.
Notes:
- "Keep ... under 200 lines" is a target in the docs, not a hard limit. Within the wording tolerance of a paraphrase; the rewording above uses the docs' word.
- "Put only what the model cannot infer" is a paraphrase of "instructions Claude wouldn't discover on its own" and of "facts Claude should hold in every session". The edition does not put it in quotation marks, so a paraphrase is allowed.
- The best-practices page also says "`/doctor` suggests cuts for anything Claude can already work out from the code" (same idea).

---

## 1.5. CLAUDE.md under 200 lines: build and test commands, the host names, the rules the model cannot infer. One .claude/rules file per sub-system with paths: . (print 22, step 1)
Verdict: overstated
Primary: Anthropic / Claude Code docs, "How Claude remembers your project" (sections "Write effective instructions" and "Path-specific rules"), current page, read 2026-11-01. https://code.claude.com/docs/en/memory
Read: 2026-11-01
Quote: "Move instructions that matter for only part of the codebase into [path-scoped rules], which load only when Claude works with matching files." (section "Write effective instructions")
Quote: "Rules can be scoped to specific files using YAML frontmatter with the `paths` field. These conditional rules only apply when Claude is working with files matching the specified patterns." (section "Path-specific rules")
Quote: "Rules without a `paths` field are loaded unconditionally and apply to all files."
True as: Claude Code lets a rule in .claude/rules/ carry a `paths:` frontmatter field, so it loads only when Claude works on matching files; the memory guide suggests moving instructions that matter for only part of the codebase there, and does not say to keep one rules file per sub-system.
Notes:
- The `paths:` feature and the 200-line target are in the docs (see 1.4). Holds for those parts.
- "One .claude/rules file per sub-system" is not in the docs. The docs' own example is organised by topic (code-style.md, testing.md, security.md), not by sub-system. This is the edition's own advice, presented in the same line as the doc-backed points.
- "Host names" and "build and test commands" are listed as CLAUDE.md content: the docs name "build commands" and "conventions" (see 1.4); host names are not mentioned. Not settled as a doc claim; it is the edition's example.

---

## Changes since 10 Oct 2026 (noted separately, not used in the verdicts)
- The MCP doc now states the description limit for a tool loaded through tool search as 16,384 characters, and says "Before v2.1.296, the shorter limit was 2,048 characters, and before v2.1.295 it applied to every tool description". The map's sequential-thinking note ("its description runs past the old 2,048-character limit") refers to the older limit. I did not date when the change landed relative to 10 Oct.
- The MCP doc now has a `retry without tool search` note for v2.1.305 and later. I did not date it.
- I did not check the Claude Code changelog for default-setting changes, so I cannot say whether the 1.1 default changed after 10 Oct.

## Could not settle
- 1.1 "turned it on by default" as a dated change: the docs state the current default, not when it changed. Tried: the MCP docs page only.
- 1.3 "the model never sees those": not stated by the Anthropic format page or the MCP doc. Needs a test on a booted server.
- 1.2: searched the best-practices page in full and one web search; did not search the rest of anthropic.com.
