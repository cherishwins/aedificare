# CLAUDE.md — memory for this repo

> Read this first. Chat history does not survive a session; this file is the
> only memory. Record decisions AND the reasoning, especially the ones that
> will look arbitrary later. Update it in the same commit as the change.
>
> Rule for this file: every convention it claims is enforced by something
> runnable, named beside it. If a rule cannot fail a build, it says so and
> names it a human duty. `tools/check-docs.cjs` verifies every backticked
> path here exists; the prose still cannot be verified, so keep it honest.

## What this is

**Aedificare** at **aedificare.art**. Jesse James's loud-power brand, issuing
numbered editions. What the entity *does* is undisclosed on every public
surface, by brand rule. The site is an index of editions and the editions
themselves, nothing else; there is no live data spine and no filler section
pretending to be one.

Licence: **CC BY 4.0** on the writing. The owner's instruction was that
crawlers and models should be able to "cite, use and repeat" the work, and
BY is exactly that: reuse freely, credit Aedificare. CC0 is the alternative
if the credit requirement should go; it is one line in `src/lib/editions.mjs`.

Shipped (2026-09-15):

| Route | What | State |
|---|---|---|
| `/` | The index: live house-configuration rose, cropped wordmark, the editions with their contents | live |
| `/edition-03` | Edition 03 · *The Markup* (15 Sep 2026), ten sections, twelve sources | live |
| `/edition-01` | Edition 01 · *The Snapshot Problem* (11 Sep 2026), twelve sections, thirty-three sources, three registers | live |
| `/ns-01` | NS-01 · *The Hand in the Water* (11 Sep 2026) | live |
| `/ns-02` | NS-02 · *The Closest Humans* (13 Sep 2026), amendment to NS-01 | live |
| `/edition-02` | Edition 02 · *The Subtraction* | **draft**: noindex, unlinked, out of sitemap/robots/feed |
| `/404` | | live |
| `/feed.xml` `/llms.txt` `/llms-full.txt` `/robots.txt` `/sitemap-index.xml` `/ai.txt` `/humans.txt` | discoverability | generated or static |
| `/pdf/ns-01.pdf` `/pdf/ns-02.pdf` `/pdf/edition-01.pdf` `/pdf/edition-03.pdf` | the print editions as uploaded | as uploaded |

## Brand — source of truth, and the overrides

The **`aedificare-brand-kit` skill** (Anthropic skills, synced) is the source
of truth. Read it at the start of every session. Its values are deliberately
NOT restated here or in code comments: a restated value drifts, the skill
does not. `src/styles/base.css` names the tokens so CSS can reference them;
that is a reference, not documentation.

**Overrides, all owner decisions, all recorded so nobody "fixes" them back:**

1. **There is a mark.** The kit says the rose is a generator, not a logo,
   and forbids a logo. The owner's position (2026-09-15): a brand without a
   mark cannot establish a foothold; avatar, favicon and icon slots demand
   one, and the kit's own model brand, Off-White, has one. The builder
   agreed the kit was wrong on this point and right on *how*: the mark is
   **one rhodonea, k=5, one turn, stroke only, frozen at seed AED-M-01**,
   computed by `src/lib/rose.mjs` like every other rose, never drawn. It is
   `src/components/Mark.astro` on every masthead, `public/favicon.svg` and
   the PNG icons from `tools/generate-marks.mjs`. The dove stays the
   once-per-sequence resolve and is NOT the mark: at 32px a dove is a bird,
   and the world has one of those. **The kit skill should be edited to say
   this**; until it is, this paragraph wins.
2. **OG cards carry the mark and the name** at masthead size, top-left. The
   kit says "no logo lockup"; the owner wants the foothold. Everything else
   about the cards follows the kit.
3. **The width axis animates.** The kit says only `transform` and `opacity`
   animate, and also says the width axis must move with scroll or cursor.
   The axis wins, on one element per surface, via `font-variation-settings`
   on a custom property; it is the kit's own signature move.
4. **"Surface" means a `.surface` element**, not the page. The kit's unit is
   per surface (a slide, an A4 page). On a scrolling page a full-bleed
   ground section is the analogue; one Acid element at scale per page would
   leave a twelve-section dossier dead below its cover. Enforced by the
   Acid probe in `tools/verify.cjs` (text ≥ 24px or an SVG stroke ≥ 200px
   counts as "at scale"; 11px labels and 2px rules do not).
5. **Theta falls back.** Neither Bricolage Grotesque nor Martian Mono has
   Greek, so the θ in `r = cos(kθ)` renders from the system mono stack. One
   glyph, and the same thing the uploaded PDFs already did. Alternatives
   (spelling "theta", merging a glyph into a variable font, an inline SVG
   glyph) were all worse than one honest fallback.

**Enforced by machine** (`tools/check-brand.cjs` in the build, on the built
output): no radius above 2px, no shadow, blur, backdrop or gradient, no
italic or underline (properties and tags), never centred, durations only
120ms or 900ms and nothing that eases, no third typeface, no em-dash, no
exclamation in a heading, no emoji, no sentence "Aedificare is", none of
the banned self-praise adjectives. `tools/check-contents.cjs` keeps the
home's contents lists true to the built editions and every published
page's meta description within 100 to 200 characters. `tools/verify.cjs` adds
the computed-style rules: contrast, Acid once per surface, the brand faces
actually loaded, every rose field live, every field's reduced-motion still.

**Human duties** (cannot fail a build; review by eye on every PR): one loud
move per surface; never explain what the entity does; twelve words maximum
in display copy; the dove once per *sequence* (the sweep can count doves per
page, "sequence" is editorial); no building pun; no tagline; no call to
action. The kit says no tagline and the site has none; the owner has asked
for a shortlist for bios and cards, which is a separate deliverable.

## Stack

- **Astro 7.3**, `output: 'static'`, **no adapter**: there are no API routes,
  so `@astrojs/vercel` would be a dependency that serves nothing. Vercel
  detects Astro and publishes `dist/`; `tools/verify.cjs` sweeps that same
  directory so the check runs on the bytes that ship.
- **Vercel.** The owner imported the repo themselves (2026-09-15); the
  project is NOT on the "Jesse James' projects" team
  (`team_yBUeW5WttkjSHbHuMRF0ptM5`) that the Vercel MCP can see. **It
  builds this repo's `main`: proved 2026-09-15 05:33 UTC**, when the live
  `<meta name="build">` read `72c37e9b`, the head of `main`. The domain is
  pointed (Vercel anycast `216.198.79.1`, `64.29.17.1`); the apex currently
  redirects to `www`, see Open. `src/config.mjs` is the only place the
  origin is written; `SITE_ORIGIN` overrides it for previews.
- Dependencies: `astro`, `@astrojs/sitemap`, `@astrojs/rss`; dev: `axe-core`.
  **Playwright is deliberately NOT in `package.json`**: Vercel installs
  devDependencies to build, and a browser-automation library has no place in
  the install path of a static site. CI installs it `--no-save`; the sandbox
  has it at `/opt/node22/lib/node_modules/playwright`.

## Hard constraints

- **Zero budget.** Vercel Hobby, self-hosted OFL fonts, GitHub Actions (free
  because the repo is public), no analytics, no paid tier of anything. The
  question before any service is "is it free, and does it stay free at
  scale."
- **Client JS budget: 5 kB gzipped for the whole site**, enforced by
  `tools/check-budget.cjs` in the build. **Measured: 2,663 B** (the one
  bundled script, 1,119 B, plus Astro's inline hydration shim on ns-02,
  1,544 B). The rose must be computed live and the axis must move with the
  reader; that is the only JavaScript the brand earns.
- **WCAG AA on every surface and zero axe-core violations**, enforced by
  `tools/verify.cjs` on every PR and push. **Current state: clean on all
  eleven counts.** Keep it there. `node tools/verify.cjs --url https://host`
  runs the same sweep against a LIVE origin over the real network, because
  a deploy status is not a verification; run it after every production
  deploy and before telling anyone the site is up.
- **Branch → draft PR → owner merges. Never push to `main`.**
- Anything the owner must action is said in chat, not only in the PR, then
  verified rather than taken on their word.

## File map

- `src/config.mjs`: the origin, name, author, and `BUILD`, the first eight
  characters of `VERCEL_GIT_COMMIT_SHA` ("dev" locally), shipped as
  `<meta name="build">` by `src/layouts/Base.astro`.
- `src/lib/editions.mjs`: **the editions, once.** Home, feed, llms.txt,
  robots, sitemap filter, OG cards and each edition's own page read it, so a
  title or date cannot disagree with itself. `draft: true` hides an edition
  everywhere but the build.
- `src/lib/rose.mjs`: `rhodonea()`, the house configuration, the mark seed,
  the dove outline. The ONLY place the curve is sampled: live fields, mark,
  favicon, cards and dove all import it.
- `src/scripts/aed.js`: the one client script: rose fields (30 fps, paused
  off-screen and in hidden tabs, static under reduced motion and marked
  `data-motion="static"` so the sweep can prove it), the dove, the axis flex.
- `src/styles/base.css`: tokens, faces, type scale, the twelve-column grid,
  surfaces, rails, pulls, stats, tables, masthead, footer.
- `src/layouts/Base.astro`: head, OG via the manifest, licence and
  discoverability links, JSON-LD, skip link, the script.
- `src/components/`: `Mark`, `RoseField`, `Dove`, `Masthead`, `Section`,
  `Rail`, `Pull`, `Stats`, `EditionEnd`.
- `src/pages/`: `index`, `edition-03`, `ns-01`, `ns-02`, `edition-01`,
  `edition-02`, `404`, and the generated `feed.xml.ts`, `llms.txt.ts`,
  `robots.txt.ts`. Shared figure styles (big numbers by length, computed
  bars, sources lists) live in `src/styles/base.css`, not per page.
- `public/fonts/`: the two faces, subset with fontTools to Latin plus Latin
  Extended, **all axes kept** (Bricolage 181 kB, Martian 47 kB). The Google
  Fonts split subsets were 131 + 53 kB for Bricolage alone; one file with
  every axis is the honest size of a brand whose type is the identity.
- `public/og/`: content-hashed cards; `src/lib/og-manifest.json` maps stable
  path to hashed path and alt text. Generated by `tools/generate-og.mjs`.
- `public/pdf/`: the uploaded print editions.
- `source/`: the print sources as uploaded (`source/edition-02/`,
  `source/ns-01.html`, `source/ns-02.html`), kept out of the deploy by
  `.vercelignore`. Edition 02's font path bug is fixed in place (see
  Findings). 1.4 MB; do not let this grow into the 107 MB northerntemper
  carried.
- `tools/`: `verify.cjs`, `check-brand.cjs`, `check-budget.cjs`,
  `check-docs.cjs`, `check-contents.cjs` (every contents entry in
  `src/lib/editions.mjs` must exist as an id and a heading in the built
  edition page, and every published page's meta description must run 100
  to 200 characters, or the build fails), `generate-llms-full.cjs`,
  `generate-og.mjs`, `generate-marks.mjs`, `generate-social.mjs`.
- `brand/`: the social kit (X header, LinkedIn banner and logo, a generic
  cover, avatars), generated by `tools/generate-social.mjs` from the same
  rose system as the site. Kept out of the deploy by `.vercelignore`; it is
  for uploading to platform slots, not for serving. Regenerate, never edit.
- `.github/workflows/verify.yml`: build (with the three checkers), audit,
  sweep, on every PR and push to `main`.
- `.github/workflows/verify-live.yml`: manual dispatch, `url` input. Curls
  every route and discovery file on the live origin, checks the headers,
  canonical, draft noindex and sitemap exclusion, then runs the same sweep
  with `--url`. It exists because the build sandbox's proxy cannot reach
  aedificare.art; a clean runner can. Run it after every production deploy.
  It also reads `<meta name="build">` on the live `/` and fails unless it
  matches the dispatched ref's head (or the `sha` input), so a green run
  proves WHICH commit is live: a healthy stale deploy still fails.

## Design decisions, with the reasoning

- **Calibrate contrast against Bottle, never Void.** Bottle is the lightest
  dark ground a token can land on. Computed: Malachite on Void 7.11, on
  Bottle **4.52**; Shock rose on Void 5.32, on Bottle **3.38**; Acid and
  Malachite on Flash are unusable for text. Rules that follow, all enforced
  by the contrast probe: Shock rose text only on Void; small Malachite text
  never on Bottle (rail keys, mono labels and table heads go Flash there);
  pull-quote citations are Flash, not Malachite, because 4.52 is on the line
  and on the line is where it failed twice during the build.
- **Colour fields, not grounds, for the exceptions.** When a Bottle surface
  needs Shock rose text (the doors, the truth table), the figure sits in a
  `.field`, which is Void on Bottle and Bottle on Void. Fields separate
  content; that is the kit's own mechanism and it solved contrast without a
  fourth colour.
- **Block links only, never inline in prose.** The kit forbids underline.
  A link inside prose distinguished by colour alone needs 3:1 against the
  text around it (axe `link-in-text-block`), and Malachite against Flash is
  2.8. So no link lives inside a paragraph: editions, PDFs, neighbours and
  the licence are block or footer links found by structure.
- **No service worker.** northerntemper needed one for live figures offline.
  An editorial site does not, and a service worker is the one component the
  sweep cannot exercise. `tools/verify.cjs` asserts no `sw.js` ships and no
  page registers one, so the absence is checked, not forgotten.
- **`build.inlineStylesheets: 'always'`, measured 2026-09-15**, gzipped:
  ns-02 inlined 15,920 B in one request, zero render-blocking; external
  13,894 B HTML + 2,250 B CSS = 16,144 B over two requests, one blocking.
  Inlining is 224 B smaller on first load and removes the blocking chain; it
  costs about 2 kB per additional page. A share-link site is a one-page
  session. Re-measure before changing this.
- **Fonts are the weight and that is accepted.** 228 kB for two faces with
  five axes between them. Preloaded, `font-display: block` so the brand
  face never flashes as Arial at 240px. `document.fonts.check()` is asserted
  in the sweep and in the card generator because `fonts.ready` resolves even
  when nothing loaded (Findings, 1).
- **Grounds alternate Void / Bottle per section; Flash is a slap** used
  full-bleed for a thesis or a closing line only.
- **The Edition 02 table's unsourced cells say "not yet sourced"** in mono
  rather than "check" or "unverified", and the edition is a draft until they
  are sourced. A published number that says "check" is a number nobody can
  check.
- **The rose fields are squares** (viewBox 0 0 1000 1000, R 480) positioned
  and cropped by their surface. The first attempt used the print covers'
  portrait viewBox with `slice`, which on a landscape hero showed only the
  spokes converging at a corner: a laser burst, not a rose.
- **Home hero rose is styled with `is:global`.** Astro scopes component
  styles by attribute; an `<svg>` rendered inside `RoseField` never receives
  the page's scope attribute, so a scoped `.hero-rose` rule silently does
  nothing. Every rule that targets a child component's root is global.
  The same trap runs upward: a component's scoped `.flash .index` rule
  never matches a `.flash` ancestor outside the component, so the
  masthead's surface-colour rules use `:global(.flash)`.
- **The masthead carries the index of editions, and the home hero is
  78svh, not 100.** Owner opened the live site (2026-09-15) and read it as
  "nothing there, no menu, no content": the hero filled the first screen
  with the wordmark and rose, and nothing said there was anything below.
  Now every page's masthead lists the published editions (code and title,
  title dropped under 760px, `aria-current` on the open one), and the home
  hero leaves the first edition's title inside the first screen. The kit's
  "no navigation chrome" instinct lost to the reader; an index is not a
  menu, it is the site's one job made visible. The masthead nav is labelled
  "Index" and the edition-end nav "Editions" because axe requires unique
  landmark names.
- **The home is a contents page, not a poster** (2026-09-15, second
  report from the owner: "a very small page, no menu, I guess you need
  more content?"). The content was never missing, two ten-section
  dossiers; the home showed one title per edition and, on a phone, an
  index of two bare codes. Now each edition on the home carries its code,
  date and note, the title, the lede, its ten section titles as anchors
  into the page, the PDF with its size read from the file at build, and a
  Read link; the phone masthead keeps the titles and stacks them. The
  contents lists are typed in `src/lib/editions.mjs`, and typed things
  drift, so `tools/check-contents.cjs` fails the build if any id or title
  is missing from the built edition. No abstracts: prose typed on the home
  cannot be checked against the edition, and the ledes already exist. The
  brand rules hold: no Acid on the edition surfaces, block links only,
  small Malachite never on Bottle (the Bottle block's numbers and aside go
  Flash), nothing explains what the entity does.

## Findings from the uploads (2026-09-15)

0. **Edition 03 · The Markup arrived as a finished, sourced PDF** (ten
   pages, twelve sources, Chromium-rendered 08:32 UTC) with the same text
   as the owner's Markdown. Ported to `src/pages/edition-03.astro` with
   the prose verbatim; figures rebuilt as computed bars (log scale for the
   four node prices, linear for path loss and band width), the stack and
   the nine-row ledger as tables in fields, the thesis as a Flash slap,
   the sources as section 07 so a citation can point at them. Big figures
   are sized by length (`.fig-m`, `.fig-l`) so the fourteen-character
   `$4,400,000,000` never leaves a 320px frame. Seed `0003`, k 5/7, from
   the PDF's colophon. It references Edition 02, which stays a draft, so
   the reference is prose and not a link. The same upload batch carried
   `the-closest-humans.pdf`, byte-identical to `public/pdf/ns-02.pdf`, and
   an `aedificare-edition-02.pdf` that is an OLDER chassis than the one in
   `source/edition-02/` (rendered 13 Sep, "FACTS PENDING", slot
   placeholders where the repo's copy has figures). Nothing was taken from
   either.

0b. **Edition 01 · The Snapshot Problem arrived as a finished, sourced
   PDF** (seventeen pages, thirty-three sources, rendered 11 Sep 10:53 UTC)
   with three registers: Measured, Case study, Position. Ported to
   `src/pages/edition-01.astro` with the prose verbatim and the registers
   as mono labels; Position statements set as `.beat`. Figures rebuilt as
   computed bars (the swarm's four shares, the exploit-rate range, the
   MMLU before and after), a schematic column chart for the cliff (the
   print marked it "not plotted values", so does the page), and a
   qualitative placement chart for plasticity (positions typed from the
   cited results, labelled as such). Seed `5A1E` is hexadecimal, so
   `tools/generate-og.mjs` parses hex when a seed is not all digits and
   prints k to two decimals; the cover rose is the print still, HOUSE
   layers at k 16/3, 29/4, 13/4. **One word changed:** "a curated set of
   ARC puzzles" became "a selected set", because `tools/check-brand.cjs`
   bans "curated" and cannot tell praise from description; the owner was
   told. The batch also carried a file named Deep Learning Architecture
   Evolution Research, a 127 kB machine-written survey of residual networks
   with an embedded image: research, not an edition; not added to the
   repo.
1. **Edition 02's PDF shipped in Liberation Sans and DejaVu Sans Mono.**
   `fonts/local-fonts.css` declared `src: url(fonts/bricolage-1.woff2)`, but
   CSS resolves `url()` relative to the stylesheet, which already lives in
   `fonts/`, so the browser asked for `fonts/fonts/…`. Verified by rendering
   the source and by reading the PDF's font table. **Fixed in
   `source/edition-02/fonts/local-fonts.css`.** The render script still
   only waits for `fonts.ready`; add a `fonts.check()` assertion before
   re-rendering.
2. The NS PDFs are text-as-outlines (Chromium turns variable-font text into
   paths), so they are probably not text-selectable. The site pages are.
3. The NS documents introduced tints the kit does not have (`#5E7A63`,
   `#E6EFE7`, `#BFD0C2`, `#A9BDAC`, `#0E6B38`, `#2E4A36`). The site uses kit
   values only; `--dim` in particular failed AA on Void at the size it was
   used.
4. Reusable code in the uploads was ported, not rewritten: `rhodonea()`,
   the field loop, `doveOfRoses()`, and the print seeds for the dividers.

## Discoverability — the point is that it travels

- `src/pages/robots.txt.ts` **explicitly allows every named AI crawler**
  (GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended, Applebot,
  Bytespider and the rest). Most sites block these; this one does the
  opposite on purpose. Do not "tighten" it. Drafts are the only exclusion.
- `src/pages/llms.txt.ts` is generated from the editions list, llmstxt.org
  shape, and states only what does not change. `tools/generate-llms-full.cjs`
  builds `/llms-full.txt` **from the built HTML** as a post-build step, so
  it cannot drift from what is published. Both are wired into `npm run
  build`, so Vercel produces them.
- Every page: canonical, Open Graph (article type with published time on
  editions), Twitter card, `rel=license`, `meta license`, `ai-training`,
  alternate links to the feed, llms.txt and llms-full.txt, `humans.txt`.
  JSON-LD: WebSite on every page, Article on every edition, both carrying
  the licence.
- **Meta descriptions are generated, never typed** (2026-09-15). LinkedIn's
  Post Inspector warned on the home: "The description should be at least
  100 characters long", and the home's was 30, two of the NS ledes 48. An
  edition's description is `describe()` in `src/lib/editions.mjs`: the lede
  first, then the record line (code, title, date, section count, licence),
  every part data the page already carries. The home's is the index
  itself: the count line, then each published code and title. No abstract
  and no tagline was written to reach the floor; the floor and a 200
  ceiling are enforced by `tools/check-contents.cjs`, and the lede comes
  first so a search snippet cut at 160 loses only the record line. The
  same inspection showed "Type: Article" and a publish date of 11 Sep for
  the home; the home ships `og:type website`, no published time and no
  date at all, so both are LinkedIn's own inference and not ours to fix.
- **OG card filenames are content-hashed** (`/og/ns-02.<sha8>.png`) via the
  generated manifest, because platforms mirror OG bytes by URL and a
  re-scrape cannot refresh a stale card; only a new URL can. Pages write
  the stable path and never see the hash. The unhashed copy stays so links
  in the wild resolve. Rerun `npm run og` when a title or lede changes.

## Ported from cherishwins/teamcanada

Read its CLAUDE.md before touching the tooling; it is a list of expensive
mistakes. What transferred: what is GENERATED stays true and what is TYPED
drifts; a checker that only passes where its author ran it is not a checker;
Playwright out of package.json; never publish a number assembled from two
sources or two dates; content-hashed cards; `check-docs`; the sweep and the
workflow, adapted only in page lists, the no-service-worker assertion, and
the four new probes (Acid, fonts, roses, reduced-motion stills).

## Decisions log

- **2026-09-15 · CLAUDE.md before any code.** Owner's instruction.
- **2026-09-15 · Owner said "keep building" with Q1–Q5 open.** Built what
  the evidence supports: an imprint of numbered editions, no stated
  purpose, no live data, the only action being to open an edition.
- **2026-09-15 · The mark exists** (override 1 above), owner's call, builder
  agreed.
- **2026-09-15 · Domain is aedificare.art**, owner's, already registered.
- **2026-09-15 · CC BY 4.0**, from "cite, use, repeat".
- **2026-09-15 · Astro 7 static, no adapter, no service worker, 5 kB JS.**

## Open

1. **The apex redirects to `www`; it must be the other way round.** As of
   2026-09-15 05:33 UTC the domain is on Vercel and the site is live:
   every route and discovery file answers 200 on `www.aedificare.art`, the
   headers from `vercel.json` are present, the draft is `noindex` and out
   of the sitemap, and the build stamp equals `main`. But
   `https://aedificare.art/…` answers **308 → `https://www.aedificare.art/…`**,
   while every canonical, the sitemap, `robots.txt`, the feed, `llms.txt`
   and every OG URL name the apex. Crawlers are told "the real page is
   here" and sent somewhere else. Fix, owner's action, one setting: Vercel
   project → Settings → Domains → make `aedificare.art` the primary domain
   with `www.aedificare.art` redirecting to it. The alternative, changing
   the origin in `src/config.mjs` to `www`, is wrong: the brand is the
   apex. `verify-live` fails on the apex `/` until this is done, by design.
   Earlier state, for the record: until roughly 05:00 UTC the domain
   resolved to GoDaddy Website Builder (`76.223.105.230`, `13.248.243.5`),
   serving a builder page over HTTP and a mismatched certificate over
   HTTPS; the owner repointed it.
   **`node tools/verify.cjs --url` cannot run from the build sandbox**:
   its Chromium does not trust the sandbox proxy's certificate authority
   (`ERR_CERT_AUTHORITY_INVALID` on every page), and disabling TLS checks is
   not an option. curl works there because it reads the proxy's CA bundle.
   The live sweep is the `verify-live` runner's job; the sandbox can only
   curl.
2. **Edition 02** stays a draft until its "not yet sourced" cells are
   sourced. Then set `draft: false` in `src/lib/editions.mjs`, fill the dove
   with `doveOfRoses()` in a re-render, re-render the PDF from
   `source/edition-02/` with a font assertion, and add it to `public/pdf/`.
3. **Edit the brand kit skill** to record the mark (override 1) so the kit
   and this file agree.
4. **Taglines**: the owner wants a shortlist for external bios and cards.
   The site carries none.
5. **The name's own emblem.** Hendrick Goltzius, *Aedificare super
   arenam* (the house built on sand, Matthew 7:26), print 7 of 10 in
   *Allegories of the Christian Faith*, c. 1598 to 1604, Rijksmuseum
   RP-P-OB-10.078, also at the Met. Public domain. It is the verb in the
   brand's name made into a picture, and for that reason it can never
   appear on a surface: the rules are no illustration, nothing drawn, and
   no building pun. Recorded so nobody rediscovers it and reaches for it.
