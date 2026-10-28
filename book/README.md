# The book

> Working notes for the first Aedificare book. CLAUDE.md is still the
> memory for the repo; this file is the book's plan and its state, and
> CLAUDE.md points here. Nothing in `book/` ships with the site
> (`.vercelignore`).

## What it is (decided 28 Oct 2026)

The owner sent six drops in one sitting (transcripts of a Patrick Boyle
video, an All-In episode, a China supply-chain video, an explainer on
AI capital flows, a DW profile of Ed Zitron and a Fireship Code Report,
all of late October 2026) and said: "start with that because it's all
consistent theme... and then our other stories, which you can weave in
there as you wish. Let's get to it."

So the first book follows the money round the AI buildout. Every drop is
one part of the same circuit, and six editions already belong in it. The
claims in the drops are logged, with what was checked, in
`book/intake/2026-10-28.md`.

**Thesis, draft.** The money goes round. Chips made in Asia earn
surpluses that come back to buy American AI shares and bonds; Nvidia
funds the customers that buy its chips; venture money pays for the tokens
that become the labs' revenue; pensions buy the bonds that build the data
centres their members protest. Each loop is real. Many of the numbers told
about them are not, and the book follows the money and checks every
number on the way. The corrections are the evidence: The Middleman's
"$87 billion" is $72 billion, the famous F-35s without radars are late
radars and not missing gallium, and a run rate is not revenue.

**Title.** The owner's. Working: *The Loop*. Others: *Round Trip*,
*Follow the Money Round*.

## The rule that makes it a book and not a second job

Every chapter is an edition first: sourced by the house method, checked
by the build, published on the site under CC BY, then given its film.
The book is assembled from editions, never written beside them, so a
correction made on the site is the book's correction too, and each
chapter is also a week of the channel.

## Outline

| # | Chapter (working) | Built from | State |
|---|---|---|---|
| 0 | The run rate | drops 5 and 6; Anthropic's S-1 | to research |
| **I** | **What goes in** | | |
| 1 | The radar that isn't there | drop 3 (gallium, 6G) | to research; the pilot |
| 2 | The Subtraction | edition, live | done |
| 3 | The Grade | edition, draft | sources to open |
| **II** | **The loop** | | |
| 4 | The round trip | drop 4 (surpluses into US AI) | to research |
| 5 | The Middleman | edition, draft; drop 6 for what moved since | owner's two calls |
| 6 | The labs' books | drops 5 and 6; The Middleman, section 08 | to research |
| 7 | The buyers | drop 2 (1% of companies, venture money) | waits on Ramp publishing |
| | *Interlude: what the money buys* | The Hand in the Water, The Closest Humans | done |
| | *Interlude: the carnival* | The Countersign | done |
| **III** | **The ground** | | |
| 8 | Contracted, not energised | drop 1 (EPRI, PJM); The Middleman, section 09 | to research |
| 9 | The towns | drop 1 | to research |
| 10 | Who holds the bond | drop 1; The Middleman, sections 05 and 06 | to research |
| | *Coda: 1873* | drop 1 (railroads, Foxconn, SolarCity) | to research |
| | *The ledger* | every correction these editions carry, dated | assembled |

The interludes give the case for the buildout its due: the money is
buying something, and two editions show what.

Not in this book, kept for a later one: The Markup, The Floor, The Tilt
Gap, The Fourth Axis, The Snapshot Problem, The Supply Cabinet.

**Length.** About 26,000 words exist on theme, counted on the built pages
with their tables and source lists; nine new pieces at 3,000 to 5,000
words each bring it to 55,000 to 70,000, a normal length for non-fiction.

## The research budget

The Middleman, measured from its session's logs: 12 agents and the main
thread, about $100 to $120 at Opus 5.5's API prices and $190 to $230 at
Fable 5.1's. Nine new chapters at that cost is $900 or more, against
$200 of API credit. Two thirds of the agents' cost was re-reading: long
loops over a growing context, about 110 turns each.

So the crew is split by model (`.claude/agents/`): researchers on Haiku
5.5, which re-reads at a fraction of Opus's price, each on a narrow lane
with a turn cap so its loop stays short; skeptics on Opus 5.5, where
judgment is what catches errors. Neither loads CLAUDE.md, about 36,000
words that a subagent otherwise carries into every turn by default; each
role's file holds the rules it needs. Whether Haiku researches well enough is not known; the
skeptics' overturn rate will say. The target is $25 an edition, which
fits nine chapters in $200. **Chapter 1 is the pilot**: about a dozen
claims, public primaries (USGS, the F-35 programme's testimony, the
Federal Register), a neutral subject, and a clear result if it works. Its
cost and its overturn rate decide the crew for the rest.

## Open, the owner's

1. The title.
2. Licence: the editions are CC BY 4.0, so anyone may sell their text. The
   book can stay CC BY (the object, the design and the ledger are what
   sell) or reserve rights on book-only material.
3. Print: black type on white paper with the cover in colour (proposed),
   or a colour interior at two to four times the cost a copy.
4. Canada: free ISBNs from Library and Archives Canada if published from
   there, with Aedificare as publisher of record.
5. Chapters 0 and 6 are largely about Anthropic, and the builder is an
   Anthropic model. Facts are checked like any other; characterisations
   are the owner's (CLAUDE.md, Decisions log, 2026-10-18).
