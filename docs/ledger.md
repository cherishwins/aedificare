# The publishing ledger

Every edition the owner has made, wherever it was made, and where it stands.
This is the inventory that was first kept in a claude.ai chat and lost to its
compaction (1 Nov 2026); it lives here so it cannot be lost again. The
editions list in `src/lib/editions.mjs` is the truth for what the site
carries; this file adds what the site does not carry yet. Update it in the
same commit as any change to that list, and whenever the owner names a new
piece.

States: **live** (published), **held** (built, a draft, noindex and out of
every index, waiting on one named thing), **porting** (its files are here,
the page is being built or checked), **stranded** (made elsewhere, its files
not yet in this repo), **intake** (raw material for a future edition).

## Live (10)

| Date | Title | Print | Path |
|---|---|---|---|
| 11 Sep 2026 | The Snapshot Problem | Edition 01 | `/edition-01` |
| 11 Sep 2026 | The Hand in the Water | NS-01 | `/ns-01` |
| 13 Sep 2026 | The Closest Humans | NS-02 | `/ns-02` |
| 15 Sep 2026 | The Markup | Edition 03 | `/edition-03` |
| 3 Oct 2026 | The Tilt Gap | Edition 04 | `/the-tilt-gap` |
| 6 Oct 2026 | The Fourth Axis | Edition 05 | `/the-fourth-axis` |
| 8 Oct 2026 | The Supply Cabinet | Edition 06 | `/the-supply-cabinet` |
| 16 Oct 2026 | The Countersign | Edition 09 | `/the-countersign` |
| 18 Oct 2026 | The Subtraction | Edition 02 | `/edition-02` |
| 18 Oct 2026 | The Floor | none (amends The Markup) | `/the-floor` |

## Held: built, each waiting on one thing

A held page loads for anyone with its link but is noindex and out of the
home, feed, sitemaps and `llms.txt`. None is a one-line flip: each waits on
what is named here, and the flip follows the standing rule that a ported
edition's sources are opened first (Decisions log, 11 Oct 2026).

| Date | Title | Print | Waits on |
|---|---|---|---|
| 15 Oct 2026 | Waiting for the Tie-In | Edition 08 | the owner's list at the top of `research/waiting-for-the-tie-in/VERDICTS.md`: each line that could not be opened is read by the owner or cut, and the heading "Move the numbers." kept or retitled (checked 1 Nov 2026, Findings 0l) |
| 22 Oct 2026 | The Grade | Edition 10 | a sample audit of its sources (Decisions log, 1 Nov 2026; Findings 0i: Chinese-language press, a 63 or 66 conflict) |
| 27 Oct 2026 | The Middleman | none (from a deck) | the owner's yes on its title and lede (Findings 0j) |
| 30 Oct 2026 | The Night Pin | Edition 11 | the owner's yes on the View, the title and NCSL's counts (`docs/release-the-night-pin.md`) |

## Porting

| Date | Title | Print | State |
|---|---|---|---|
| 10 Oct 2026 | LOADOUT | Edition 07 | built as a draft on the same-day correction's counts (the print, of 08:28 UTC, keeps the first count and stays as issued); a sample audit changed or overturned 9 of 15 claims, so the full pass is running (`research/loadout/VERDICTS.md`) |

## Stranded: made elsewhere, files not in this repo

Named in the owner's inventory of 1 Nov 2026. Most were finished in chat as
PDF carousels, so the web text may exist only there. None is on the owner's
Google Drive under its title or on macroview.live (searched 1 Nov 2026).
Each needs its files (the web HTML or Markdown if one exists, else the PDF)
dropped into a session.

| Title | Print | What is needed |
|---|---|---|
| The Denominator | NS-03 | its files (a third Navier-Stokes edition; its series would be Navier-Stokes) |
| The Missing Version | Edition 12 | its files |

## Intake: raw material, not yet editions

Uploaded to the session of 1 Nov 2026 and kept out of the repo until the
owner picks one, because the repository is public.

| Working title | What it is |
|---|---|
| South Korea's Hormuz problem (naphtha) | a draft for Korea Pro with a fact-check sheet and four figures |
| The Cartel and the Crypto-Phone | research, 132 sources, flags its own items to verify |
| Rassvet-3 | research, with an infographic outside the brand |
| The Navigator | drafted 16 Sep 2026; waits on the owner's screenshots (CLAUDE.md Open 8) |
| The One Machine, The Mouths, The Example | the desk's drafts at apt.grok.me, never sent here (Open 7) |
