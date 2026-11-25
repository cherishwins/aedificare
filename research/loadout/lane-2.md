# Lane 2: Palantir Foundry claims (LOADOUT, edition 07, 10 Oct 2026)

Checked 2026-11-01. Verdicts judge each claim as of 10 Oct 2026, with later changes noted separately. Quotes are as returned by WebFetch from the pages named; where a claim rests on a search-result summary rather than a fetched page, that is said.

Print and map locations checked against /home/user/aedificare/source/loadout/print.txt (page numbers sit at the top of each page: "12" at line 237, "13" at line 268, "14" at line 269, "15" at line 283, "07" at line 109) and /home/user/aedificare/source/loadout/map.html.

Pages opened:
- palantir.com/docs/foundry/ai-fde/overview (fetched twice)
- palantir.com/docs/foundry/ai-fde/prefill-sessions/
- palantir.com/docs/foundry/palantir-mcp/tool-search/
- palantir.com/docs/foundry/palantir-mcp/installation/
- palantir.com/docs/foundry/palantir-mcp/available-tools/
- palantir.com/docs/foundry/palantir-mcp/overview
- palantir.com/docs/foundry/ontology-mcp/overview/ and palantir.com/docs/foundry/ontology-mcp/
- github.com/palantir/osdk-ts/tree/main/packages/cli (package source repo)
- Searches only (not opened as primaries): GA announcement for AI FDE (two searches), Palantir MCP tool search, Ontology MCP tool list.
- Not opened: www.npmjs.com/package/@osdk/cli (returned HTTP 403; not routed around).

---

## 2.1. Palantir's in-platform builder agent went GA on 12 March 2026. (print 14) / 12.03 2026 Palantir's AI FDE goes generally available. (carousel 05) (tier B)
Verdict: could not settle
Primary: none found. Palantir's AI FDE overview page (palantir.com/docs/foundry/ai-fde/overview) gives no release or GA date and no publication date; its only date is the footer "© 2026 Palantir Technologies Inc. All rights reserved." https://www.palantir.com/docs/foundry/ai-fde/overview
Read: 2026-11-01
Quote: none from a primary giving a GA date. The overview page's footer note reads: "Note: AIP feature availability is subject to change and may differ between customers."
True as: not settled. The only dated source found says AI FDE reached general availability in March 2026, with no day given. Nothing opened confirms 12 March.
Notes:
- Search 1 ("Palantir AI FDE generally available announcement March 2026") returned no Palantir press release or newsroom item. Its one relevant hit was a BestHub article (besthub.dev, "Palantir's AI FDE Automates Forward Deployment While China Still Recruits Human FDEs"), summarised in the search result as saying "In March 2026, Palantir's AI FDE reached general availability." I did not open that article; it is secondary in any case.
- Search 2 ("AI FDE" Palantir "generally available" press release) returned no Palantir release announcing GA. It found a December 2025 Palantir press-release headline about a partner deploying AI FDE, which does not state GA.
- Not searched: investors.palantir.com or businesswire.com newsroom listings in full, and Palantir's release notes for the AI FDE product. The day "12" is therefore unsupported by anything opened.
- Suggested test: the Palantir newsroom for March 2026 (investors.palantir.com), or an AI FDE release-notes page if one exists.

---

## 2.2. AI FDE has no API. ... It is a chat window. No MCP tool, no CLI, no endpoint. The one programmatic hook is a browser pre-fill URL, and tool approvals still happen in the browser. (print 14) (tier B)
Verdict: overstated
Primary: Palantir, "AI FDE overview" (docs), undated page, read 2026-11-01. https://www.palantir.com/docs/foundry/ai-fde/overview ; Palantir, "AI FDE pre-fill sessions" (docs), undated page, read 2026-11-01. https://palantir.com/docs/foundry/ai-fde/prefill-sessions/
Read: 2026-11-01
Quote (overview): "AI FDE, the AI-powered forward deployed engineer, is an interactive agent that operates Foundry for you" / "through conversational commands."
Quote (overview, Capabilities): "You can customize the tools available to AI FDE in the **Tools** menu under the request input field."
Quote (overview, Capabilities section, same page): "keeps a record of all prompts and tools used during the active session in the chat outline." (as summarised; the fetch described it as implying a chat-style interface)
Quote (pre-fill): "Pre-fill links use the `/workspace/ai-fde/prefill` path followed by any combination of the URL parameters below."
Quote (pre-fill): "Sessions started with `autoStart=true` follow the same tool approval settings as any other session, so users are still asked to approve tools before they make changes."
True as: AI FDE is an interactive, conversational agent inside Foundry. Its documented link from outside is a browser pre-fill URL that starts a session with a prompt; sessions still ask the user to approve tools before they make changes. The two pages opened do not describe an API, an MCP tool, a CLI or an endpoint for AI FDE.
Notes:
- The "no API / no MCP tool / no CLI / no endpoint" part is a negative. I opened the overview and the pre-fill pages in full and found no mention of an API, MCP, CLI or endpoint for AI FDE. The pre-fill page's only API-related text is an unrelated navigation link ("Use AIP Chatbots through Foundry APIs" and "API Reference"), which is about other AIP products. That is not a full-text search of Palantir's docs, so the negative is not asserted here.
- "The one programmatic hook": the pre-fill page is the only AI FDE access route described in the pages opened. "The one" is therefore unestablished as a statement about all of Palantir's surfaces.
- The pre-fill page addresses approvals for tools only. It says nothing about other actions needing approval, so "approvals still happen in the browser" holds only as "tool approvals" in the session.
- The overview page never says "chat"; the words "chat window" come from the fetch's description of the Tools menu and chat outline. The summary "It is a chat window" is a reasonable reading, not a quoted statement.

---

## 2.3. Palantir MCP starts with one tool, search_tools. (print 07) / About 90 tools, starts with one when --tool-search is on. (map) (tier unmarked in print; B in map)
Verdict: overstated
Primary: Palantir, "Tool search" (Palantir MCP docs), undated page, read 2026-11-01. https://palantir.com/docs/foundry/palantir-mcp/tool-search/ ; Palantir, "Installation" (Palantir MCP docs), undated page, read 2026-11-01. https://palantir.com/docs/foundry/palantir-mcp/installation/ ; Palantir, "Available tools" (Palantir MCP docs), undated page, read 2026-11-01. https://www.palantir.com/docs/foundry/palantir-mcp/available-tools/
Read: 2026-11-01
Quote (tool search): "The server initially shows only the `search_tools` tool in your agent's tool list."
Quote (tool search): "No additional configuration is needed to enable tool search." and "Existing configurations that pass `--tool-search` or set `PALANTIR_MCP_TOOL_SEARCH=true` remain supported."
Quote (installation): "Tool search is enabled by default, so your agent discovers tools as needed."
Quote (installation): "add `--no-tool-search` to the server arguments in your configuration" and "to load the full permitted catalog at startup."
Quote (available tools): "The `search_tools` tool is enabled by default in both environments."
True as: Palantir MCP starts a session with one visible tool, search_tools, because tool search is on by default; the --tool-search flag is still accepted but is no longer needed. The docs I opened give no total tool count, so "about 90 tools" is not confirmed.
Notes:
- The one-tool start holds (print 07 wording), but the map's condition "when --tool-search is on" is out of date: the docs say tool search is on by default and that --tool-search remains supported for existing configurations. The docs also name --no-tool-search as the way to turn it off.
- "About 90 tools": none of the three pages opened gives a number. The installation page says the "full permitted catalog" depends on the user token's permissions; the available-tools page says "No sentence on the page gives a number of tools, and no total count is stated anywhere." This is not a negative about Palantir's whole site; it is what these pages say.
- Scope: the count depends on the caller's permissions (installation page), so a single figure is a scope choice that the docs do not make.
- A search-result snippet (not a fetched page) reported the Palantir MCP overview as labelled "[Beta]". The overview fetch did not show a beta label in the extracted text I received; I did not settle that point. This matters for the map's "GA 2026-06-25" tag in 2.3 and 2.4, which I did not find in any page opened.
- The default-on behaviour: I did not find the date the default changed, so I cannot say whether it was on at 10 Oct 2026. The docs read today say it is on by default.

---

## 2.4. The consumer side. Object types as a SQL tool, every action type as its own tool, query functions as tools. The only MCP route that mutates data and the only one that can trigger in-platform logic. (print 15) (tier unmarked in print; B in map)
Verdict: overstated
Primary: Palantir, "Ontology MCP (OMCP)" overview (docs), undated page, read 2026-11-01. https://palantir.com/docs/foundry/ontology-mcp/overview/ ; Palantir, "Palantir MCP" overview (docs), undated page, read 2026-11-01. https://www.palantir.com/docs/foundry/palantir-mcp/overview
Read: 2026-11-01
Quote (Ontology MCP): "exposes your application's ontology resources as Model Context Protocol (MCP) tools"
Quote (Ontology MCP): "resources (such as object types, action types, and query functions) available as MCP tools"
Quote (Ontology MCP): "allows LLM agents to read objects, execute predefined actions, and query data"
Quote (Ontology MCP vs Palantir MCP): "Ontology MCP enables controlled writes to ontology data, while Palantir MCP enables modifications to ontology structure."
Quote (Palantir MCP): "Palantir MCP is designed for ontology builders and can modify ontology types, but cannot write ontology data."
Quote (Palantir MCP): "The MCP provides tools to run Python transforms."
True as: Ontology MCP exposes a Foundry app's object types, action types and query functions as MCP tools, and lets agents read objects, execute predefined actions and query data. Among the Palantir MCP servers, Ontology MCP is the one documented as writing ontology data; Palantir MCP can change ontology structure and run Python transforms.
Notes:
- "Object types as a SQL tool": the Ontology MCP overview does not mention SQL as an exposed tool (its summary: "The page does not mention SQL as an exposed tool"). A search-result summary said Palantir MCP's beta tools include running SQL against datasets; the Palantir MCP overview fetch did not list SQL. Not settled; the SQL tool is unverified.
- "Every action type as its own tool": the docs say action types are exposed as MCP tools; they do not say each action type becomes its own tool. Not verified in the wording given.
- "Only MCP route that mutates data": the docs compare Ontology MCP with Palantir MCP only. I did not check other MCP servers, so "only" is supported only inside the Palantir pair. The Palantir MCP docs say it "cannot write ontology data", which supports the comparison.
- "Only one that can trigger in-platform logic": contradicted in part by the Palantir MCP overview, which says "The MCP provides tools to run Python transforms." Running a transform is in-platform logic. So Ontology MCP is not the only route that triggers in-platform logic on that wording. The print's own 2.4 wording says "mutates data", which is narrower than the map's "writes data or triggers logic".
- Ontology MCP's status: its overview gives no beta or GA status (checked on both the overview page and the index page). The map's "GA 2026-06-25" tag is not confirmed by these pages.

---

## 2.5. Deploys your front end to a Foundry-hosted site from the terminal. (map, @osdk/cli row) / @osdk/cli for site deploys. (print 12) (tier B)
Verdict: holds
Primary: Palantir, "@osdk/cli" (source repository, packages/cli), undated, read 2026-11-01. https://github.com/palantir/osdk-ts/tree/main/packages/cli (the npm page https://www.npmjs.com/package/@osdk/cli returned HTTP 403 and was not opened.)
Read: 2026-11-01
Quote: "A CLI for generating OSDKs and managing Foundry site deployments"
Quote: "The site subcommand allows users to manage their Foundry site" (`npx @osdk/cli site`)
Quote: "The deploy subcommand allows users to upload new versions of their site and set it as deployed" (`npx @osdk/cli site deploy`)
True as: @osdk/cli has a `site deploy` subcommand that uploads new versions of a Foundry site and sets it as deployed, so a site can be deployed from the terminal.
Notes:
- The sources say "Foundry site", not "front end" or "Foundry-hosted". The gloss "front end" is the edition's; the repository text does not say a site is a front end or that it is hosted by Foundry. The "Foundry-hosted" wording is the edition's reading of "Foundry site". Holds on the command; the description is the edition's gloss.
- The package description and the site subcommands carry no beta or status note in the repo text. The repo text says the only "unstable" wording refers to the `branch` command.
- Could not open: the npm page (HTTP 403). Not routed around.

---

## Changes since 10 Oct 2026 (noted separately, not used in the verdicts)
- Palantir MCP tool-search docs now state the default on, with --tool-search "remain supported" for existing configurations. I did not find a dated change, so I cannot say whether the text changed after 10 Oct.
- I found no dated release note for any of the five claims in the pages opened, so I cannot say whether any wording changed after 10 Oct.

## Could not settle
- 2.1 GA date (12 March 2026): tried two web searches, the AI FDE overview page, and a secondary article's search summary. No Palantir primary gives a date. Not tried: investors.palantir.com or businesswire.com newsroom listings in full; a Palantir release-notes page.
- 2.2 "no API / no MCP tool / no CLI / no endpoint": a negative. Read the overview and pre-fill pages; no full-text search of Palantir's docs for AI FDE API or endpoint references.
- 2.3 "about 90 tools": not stated in the three Palantir MCP pages opened.
- 2.4 "object types as a SQL tool": not in the Ontology MCP overview; a search summary points to SQL on Palantir MCP datasets, not opened as a fetched page.
