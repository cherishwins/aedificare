# Episode scripts

An episode is one file here, `source/episodes/<slug>.md`, cut into a film by
`tools/episode.mjs` (CLAUDE.md, override 8). The narration is written in the
film voice (`source/film/voice.md`); the shots are tagged inline, exactly
where the cut falls. The words are the script and the tags are the edit.

```
node tools/episode.mjs check  source/episodes/<slug>.md [--online]   facts, sources, tags
node tools/episode.mjs sheet  source/episodes/<slug>.md              the footage shopping list
node tools/episode.mjs all    source/episodes/<slug>.md              narrate if the words changed, then render
```

## The process, every episode

1. **Story.** One tech-and-money story with one number in it.
2. **Research.** Primary sources first: filings, releases, transcripts, the
   committee's own hearing video. Every figure and quote gets a source line.
3. **Script.** Written here, in the voice, with shot tags.
4. **Check.** `check --online` passes: every sentence with a number cites a
   source, every quote's words are on its source page.
5. **Sheet.** `sheet` lists every clip, footage shot and gag the script asks
   for, with the file name each one needs. The owner finds them and attaches
   them to the GitHub Release `footage-<slug>`.
6. **Render.** The `episode` workflow pulls the footage, narrates, renders,
   and files the film under the Release `film-ep-<slug>`. A shot still
   missing renders as a slate naming what it needs, so an early render is
   the animatic.
7. **Upload.** From the release, with `sheet.txt`; or `upload-youtube.mjs`.
   The Short (`render --short`, the chapters named in `short:`, tall, with
   the end card) goes up the same day with `sheet-short.txt`; Shorts are a
   separate feed, not a trailer.

## Front matter

```
---
title: The $18,214 Radio          # the YouTube title: under 100 characters, the number in it
slug: markup-radio                # the work directory and the release names
date: 2026-09-27                  # the day it is issued; also seeds the computed music
speed: 1.05                       # am_michael's pace
hook: optional first line of the description (defaults to the first paragraph)
thumb: $18,214 / FOR ONE RADIO    # the thumbnail's two lines, split on /
thumbframe: airmen-helmet-at-2.5  # which footage file, and how far in, the thumbnail is cut from
short: Cold open, The tote bag     # the chapters the Short is cut from (default: the first); under three minutes
---
```

## Sources

```
# Sources

- s1 | Publisher | Title of the document | 2024-02-08 | https://…
- s2 | …
```

In the narration, `[s1]` after a sentence cites it; `[s1, s2]` cites both.
Markers are never read aloud. `check` fails any sentence carrying a digit
without one, any marker naming no source, any source never cited. Numbers
assembled from two sources or two dates say so in the sentence.

## Chapters

`## Heading` starts a YouTube chapter. Headings are not read aloud.

## Shot tags

A tag cuts at the next word spoken and holds until the next cut. Two cut
tags on the same word is an error (the first would never be seen). A cut
tag on a line of its own is a beat of its own: it holds in silence for
`hold: 2.7` seconds (the default, three of the kit's beats) and the
narration resumes after it, which is how a title drops.

| Tag | What it puts on screen | Who makes it |
|---|---|---|
| `[[footage#id: what it shows \| find: where to look]]` | real footage, silent, graded to the channel look | owner |
| `[[gag#id: what it shows \| find: …]]` | a comedy beat, silent, ungraded so it pops | owner |
| `[[clip#id: who says what \| say: "the exact words" \| find: … \| 6s]]` on its own line | a person saying it, **with their sound**; the narration waits | owner |
| `[[quote: s3 \| "exact words" \| NAME, ROLE, DATE \| hl: the words to highlight]]` | the quote typeset, the highlighter sweeping the key words | computed |
| `[[map: Hsinchu 24.8,121.0 > Phoenix 33.4,-112.1 \| label]]` | the world in Bottle, the route drawn in Acid | computed |
| `[[fig: $18,214 \| PER RADIO]]` | a figure card | computed |
| `[[card: SAME PHYSICS.]]` | a statement card | computed |
| `[[title: The $18,214 Radio]]` | the title card with the mark | computed |
| `[[over: $5.1M \| USAF · FEB 2024]]` | type over the current shot, no cut, until the next tag | computed |

`#id` names the file the owner supplies (`footage/<id>.mp4`); without one,
the id is the first five words of the description. `raw` on a footage tag
(`| raw: yes`) skips the grade.

## What the owner supplies, and the rules for it

- **Public domain first**: US federal government video (White House, the
  committees' own hearing streams, the House and Senate floor, DVIDS, NASA),
  the Library of Congress, Prelinger and Internet Archive films, pre-1931
  films, Wikimedia Commons files marked public domain.
- **Anything else is fair use and a claim risk**: a news broadcast, a film,
  a meme. Keep it to the seconds the point needs (a gag is one to three
  seconds), put commentary on either side of it, and log it in
  `footage/credits.txt`. A Content ID claim usually moves that video's ad
  money; it rarely strikes.
- **Never** a clip that makes a real person appear to say or do something
  they did not. The narrator is synthetic and never imitates a real voice.

## Credits

`footage/credits.txt`, one line per file: `id: source, licence`. The
description carries them under "Footage:".
