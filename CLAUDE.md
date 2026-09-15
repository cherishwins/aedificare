# CLAUDE.md — memory for this repo

> Read this first. Chat history does not survive a session; this file is the
> only memory. Record decisions AND the reasoning, especially the ones that
> will look arbitrary later. Update it in the same commit as the change.
>
> Rule for this file: every convention it claims must be enforced by something
> runnable. If a rule cannot fail a build, it says so and names it a human duty.

## Status — 2026-09-15, commit one

Nothing is built. The repo held a one-line README and a Next.js-flavoured
.gitignore from GitHub's template. This file is the first commit, before any
code, because the build is blocked on answers the owner has not yet given (see
**Open — blocking**). Do not build past those questions. Do not invent answers
to them.

## What this is (as far as is known)

**Aedificare** — Jesse James's loud-power brand. What it *does* is undisclosed
on every public surface by brand rule, and as of this commit is also not yet
disclosed to the builder. The observable output is numbered editorial dossiers
under the Aedificare mark:

| Piece | What | Date | State |
|---|---|---|---|
| Edition 02 · *The Subtraction* | 13-page A4 dossier on GPU market segmentation (NVIDIA CMP 170HX / GA100) | Sep 2026 | draft: table cells marked "check"/"unverified", dove slot empty, PDF shipped in the wrong fonts (below) |
| NS-01 · *The Hand in the Water* | 12 pages on the OpenAI Navier–Stokes claim | 11 Sep 2026 | complete, self-contained HTML |
| NS-02 · *The Closest Humans* | 12 pages, "amendment to NS-01" | 13 Sep 2026 | complete, self-contained HTML |

Two numbering series exist (Edition NN and NS-NN). Whether that is intended is
an open question.

## Brand — source of truth

The **`aedificare-brand-kit` skill** (Anthropic skills, synced). Read it at the
start of every session. Its values are deliberately NOT restated here or in
code comments: a restated value drifts, the skill does not. This file records
only what the kit does not settle and any decision taken against it.

Where the kit's rules are machine-checkable they will be enforced by a build
step (planned as tools/check-brand.cjs, running inside `npm run build` once it
exists). Planned checks, so the next session builds the checker rather than
re-deciding:

- Acid at scale at most once per page — count elements whose computed colour is
  Acid above a display font-size, per built page.
- No `border-radius` above 2px, no `box-shadow`, no `filter: blur`, no
  `gradient(` anywhere in shipped CSS.
- No italic and no underline on display type — computed-style probe.
- Motion durations only 120ms or 900ms; no default `ease` — grep shipped CSS.
- No em-dash (U+2014) in built copy — house rule carried from the kit.
- `prefers-reduced-motion` static render must exist for every rose field —
  the sweep runs once with the media feature emulated.

**Human duties** (cannot fail a build, so they are named here as duties):
one loud move per surface; never explain what the entity does; twelve words
maximum in display copy; the dove once per *sequence* (a checker can count
doves per page, but "sequence" is editorial); no building pun; no self-praise
adjectives. Review these by eye on every PR.

## Findings from the uploads — mistakes already made once

1. **Edition 02's PDF shipped in Liberation Sans and DejaVu Sans Mono, not
   Bricolage Grotesque and Martian Mono.** Cause: `fonts/local-fonts.css`
   in the source zip declares `src: url(fonts/bricolage-1.woff2)`, but CSS
   resolves `url()` relative to the *stylesheet*, which already lives in
   `fonts/`, so the browser asked for `fonts/fonts/…` and fell back. Verified
   two ways: rendering `ed02.html` in Chromium here shows fallback faces, and
   the PDF's embedded font table lists only LiberationSans and DejaVuSansMono.
   The NS-01/NS-02 PDFs are fine (fonts are base64-inlined). Lesson: **the
   font check is part of the render script**, `document.fonts.ready` proves
   nothing if the face never loaded. Assert `document.fonts.check()` for each
   family before exporting.
2. NS-01/NS-02's PDFs carry no Bricolage in their font table either, only a
   DejaVuSansMono fallback for one glyph. That is Chromium's PDF backend
   turning variable-font text into outlines. Consequence: those PDFs are most
   likely not text-selectable. Not a site problem; a PDF-pipeline note.
3. **The NS documents quietly introduced values the kit does not have:**
   `--dim #5E7A63` "for rules only" but used for footer and caption text,
   tinted off-whites `#E6EFE7` `#BFD0C2` `#A9BDAC` `#DCE8DD` for body and
   rails, `#0E6B38` as a third curve colour, `#2E4A36` for rules. The kit says
   the only non-green values are Flash and Void, and no grey. Decision pending
   (Q9 below); default is kit values only.
4. **Contrast, computed (WCAG relative luminance), text on each ground:**

   | fg \ bg | Void | Bottle | Flash |
   |---|---|---|---|
   | Acid | 16.98 | 10.79 | 1.18 |
   | Malachite | 7.11 | **4.52** | 2.81 |
   | Flash | 19.95 | 12.68 | — |
   | Shock rose | 5.32 | **3.38** | 3.75 |
   | `--dim` (NS docs) | **4.22** | 2.68 | 4.73 |

   **Bottle is the lightest dark ground, so Bottle is the calibration
   surface, never Void.** Malachite as small text on Bottle sits on the AA
   line at 4.52:1; Shock rose as small text on Bottle fails; the NS docs'
   `--dim` fails on Void at the 7pt it was used at. Acid on Flash and
   Malachite on Flash are unusable for text and must only ever be hairlines
   or display-size on white. `tools/verify.cjs` will enforce this on the
   built DOM; this table is so nobody retunes a token against Void again.
5. **Reusable code in the uploads, to port rather than rewrite:** `rhodonea()`
   (polar sampler to SVG path), `roseField()` (three curves, 5.5 s cycle,
   `k` drift ±0.085, `prefers-reduced-motion` → static seed, `?print=1` →
   still), `doveOfRoses()` (rose field clipped to a silhouette, acid, edge
   shrink). `rose.py` is the print-still generator with its seed log. The
   house configuration in the kit and the code agree.
6. Two of the four uploads were duplicates: `files_33.zip` contained the same
   Edition 02 PDF and source zip as the two standalone uploads (md5 identical).

## Ported from cherishwins/teamcanada — read its CLAUDE.md in full first

Its CLAUDE.md (30 kB, read 2026-09-15) is a list of expensive mistakes. The
ones that transfer, and how:

- **What is GENERATED stays true; what is TYPED drifts.** Never restate a
  figure in a static file; link to the thing that generates it.
- **A checker that only passes where its author ran it is not a checker.**
  Reproduce the deploy environment. Their `check-docs` broke production once
  by asserting paths `.vercelignore` had excluded; the fix reads the ignore
  file. `verify.cjs` serves the built output directory through Playwright
  request interception so it tests the bytes Vercel publishes.
- **Playwright is NOT a package.json dependency.** Vercel installs
  devDependencies; CI installs Playwright with `--no-save`. `axe-core` is a
  devDependency (dev-only, never reaches a page). Same here.
- **Never publish a number assembled from two sources or two dates.**
- **OG cards are content-hashed** (`/og/name.<sha8>.png`) via a generated
  manifest carrying path and alt together, because LinkedIn mirrors OG bytes
  by URL and a re-scrape cannot refresh a stale card. Ported as-is; the card
  design follows the kit's OG spec instead.
- `build.inlineStylesheets: 'always'` was *measured* there to be smaller on
  first load for a share-link site. Re-measure here before assuming.
- `check-docs.cjs`: every backticked path this file names under `src/`,
  `tools/`, `public/`, `.github/` must exist. Runs in the build. Until it is
  ported, planned paths in this file are written **without** backticks.

To port verbatim (adapting page lists and names only): `tools/verify.cjs`,
`tools/check-docs.cjs`, `.github/workflows/verify.yml`, the
`tools/generate-og.cjs` → `src/lib/og-manifest.json` → `Base.astro` pattern.

## Hard constraints

- **Zero budget.** Every dependency free and free at scale: Vercel Hobby,
  open-licence fonts self-hosted, GitHub Actions (free because the repo is
  public), no paid tier of anything, no analytics unless the owner names a
  free cookieless one. Before adding a service the question is "is it free,
  and does it stay free at scale."
- **Client JS budget: 5 kB gzipped for the whole site**, proposed, owner to
  confirm. Reasoning: the kit requires the rose to be computed live and the
  width axis to move with scroll or cursor; that is the only JavaScript the
  brand earns. Rose field ≈1.5 kB, axis flex ≈0.5 kB, dove ≈1 kB, headroom for
  nothing else. To be enforced by tools/check-budget.cjs (planned): sums the
  gzipped bytes of every inline `<script>` and every `.js` in the build, fails
  above 5,120 bytes.
- **WCAG AA contrast on every surface and zero axe-core violations**, enforced
  by `tools/verify.cjs` on every PR and push.
- **Branch → draft PR → owner merges. Never push to `main`.**
- Anything the owner must action is said in chat, not only in the PR, and then
  verified rather than taken on their word.

## Infrastructure — as found

- **GitHub:** `cherishwins/aedificare`, default branch `main`, one commit
  before this one, no PRs. Work branch `claude/exciting-edison-65prmb`.
- **Vercel:** team "Jesse James' projects" (`team_yBUeW5WttkjSHbHuMRF0ptM5`,
  Hobby). **No Aedificare project exists yet.** Five unrelated projects do.
- **Domain:** none known. `src/config.mjs` (planned, the only place the
  origin is written) cannot be filled until one is named.
- **Sandbox:** Node 22.22, npm 10.9, Playwright 1.56.1 global at
  `/opt/node22/lib/node_modules/playwright`, Chromium 1194 at
  `/opt/pw-browsers`. No poppler, so PDFs cannot be rasterised here; render
  the source HTML with Playwright instead. Astro 7.3.2 and `@astrojs/vercel`
  11.0.10 are current on npm.

## Open — blocking (owner must answer; do not invent)

- **Q1. What Aedificare does and who the site is for.** The site will never
  say it (kit rule), but the builder has to know it to choose what goes on
  the page.
- **Q2. The one action a visitor must take.** The kit says the brand does not
  ask, so "the action that counts" has to be reconciled with "no calls to
  action" by the owner, not guessed.
- **Q3. Is there a live data spine?** The three dossiers carry fixed figures
  (die specs, a timeline). Nothing observable is live. If there is none the
  site says nothing live and gets no filler sections.
- **Q4. Domain.** Needed for canonicals, OG, sitemap, and the Vercel project.
- **Q5. Who creates the Vercel project** (Hobby, free) linked to this repo:
  the builder via the Vercel MCP, or the owner. Then the builder verifies it
  exists and deploys.

## Open — defaults the builder will take unless told otherwise

- **Q6. Content for v1:** NS-01, NS-02 and Edition 02 as web pages, Edition 02
  flagged as a draft until its "check"/"unverified" cells are sourced and its
  dove slot filled from `doveOfRoses()`. Is there an Edition 01? Are the two
  numbering series intended?
- **Q7. Licence and analytics:** teamcanada is CC0 with Umami. Default here:
  licence unstated until the owner picks one; no analytics.
- **Q8. No logo.** The kit is explicit: the rose is a generator, not a logo;
  the dove appears once per sequence precisely so it never becomes one; OG
  cards carry no lockup; illustrating the rose is failure mode 6. The owner
  said on 2026-09-15 they would "work on a logo". The builder will produce
  the typographic wordmark, a favicon that is one frozen, numbered rose seed,
  and generated OG cards, all in code. An image-generated logo is an override
  of the kit and must be stated as one.
- **Q9. Off-kit tints from the NS docs** (finding 3): default is kit values
  only; Flash for body copy, Malachite for secondary, hairlines in Malachite
  at reduced opacity where the docs used `--dim`.
- **Q10. Service worker:** default none. teamcanada needed one for live
  figures offline; a static editorial site does not, and a service worker is
  the one component the sweep cannot exercise. `verify.cjs` will assert no
  registration exists so the absence is a checked fact, not an omission.
- **Q11. PDFs:** default is to serve the existing NS PDFs as downloads and to
  re-render Edition 02 after the font fix, via a committed render script that
  asserts the faces loaded.

## Decisions log

- **2026-09-15 · CLAUDE.md before any code.** Owner's instruction, and the
  build is blocked on Q1–Q5; a session can end before answers arrive and this
  file is the only memory.
- **2026-09-15 · Astro 7, `output: 'static'`, Vercel.** Owner's brief. The
  `@astrojs/vercel` adapter is added only if Q3 produces an API route;
  otherwise plain static output and the sweep serves `dist/`.
