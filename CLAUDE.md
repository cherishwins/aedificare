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
dated editions. What the entity *does* is undisclosed on every public
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
| `/the-floor` | 16 Sep 2026 · *The Floor*, amends The Markup with the builder's own field numbers | **draft**: set the date, flip `draft`, it goes live |
| `/edition-03` | 15 Sep 2026 · *The Markup* (printed as Edition 03), eight sections, twelve sources | live |
| `/edition-01` | 11 Sep 2026 · *The Snapshot Problem* (printed as Edition 01), twelve sections, thirty-three sources, three registers | live |
| `/ns-01` | 11 Sep 2026 · *The Hand in the Water* (printed as NS-01) | live |
| `/ns-02` | 13 Sep 2026 · *The Closest Humans* (printed as NS-02), amends The Hand in the Water | live |
| `/edition-02` | *The Subtraction* (printed as Edition 02) | **draft**: noindex, unlinked, out of sitemap/robots/feed |
| `/404` | | live |
| `/feed.xml` `/llms.txt` `/llms-full.txt` `/robots.txt` `/sitemap-index.xml` `/ai.txt` `/humans.txt` | discoverability | generated or static |
| `/index.json` `/og/desk.png` | the index as JSON and the desk's card, for apt.grok.me to fetch and hotlink | generated |
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
6. **The channel speaks** (owner, 2026-09-24: "the channel speaks, use
   am_michael"). The kit says the brand issues rather than speaks; on
   YouTube a silent film is a broken upload, and the owner chose the
   ColdFusion register: a documentary read over the brand's own surfaces.
   So the narrated films (`tools/generate-film.mjs`) read an edition aloud,
   in full and verbatim, in ONE synthetic voice, Kokoro-82M `am_michael`
   (Apache-2.0, open weights, runs on CPU, no key, no account), never
   changed between films and never a clone of a real person (YouTube's
   likeness detection now covers voices). Everything on screen stays
   computed: type, the rose, the edition's own figures. No stock footage,
   no photograph, no generated footage. A music bed is allowed under the
   voice (`--music`, a licensed file the owner supplies; the YouTube Audio
   Library is the zero-risk source), silence under the dove. Captions are
   uploaded as SRT, never burned, so no frame breaks the type rules. The
   entity is still never explained: the narration is the edition's prose
   and a generated record line, nothing else.

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
- **Vercel builds a FORK of this repo, not this repo** (found 2026-09-16).
  The production project is on the owner's Hobby team "solidarity" (slug
  koreawins), which the Vercel MCP cannot see, and it is connected to
  `jessejamesvictoria/aedificare`, a fork under the owner's personal GitHub
  account, because Vercel Hobby cannot connect a repository owned by an
  organisation and a Pro seat is not zero budget. The owner syncs the fork
  by hand with GitHub's "Sync fork", so a merge here goes live only when
  they remember: PR #10 merged 12:48 UTC and deployed nineteen hours later.
  Proved by the stamp: on 2026-09-16 the live `<meta name="build">` read
  `7f803fc7`, which is not on any branch here; it is the fork's head, a
  merge of Vercel's own "Install Web Analytics" PR on top of this repo's
  `a00d552b`. By 16:05 UTC it read `682a76ea`, fork-side again, carrying
  PR #12 (`/the-floor` answered 200) and still the analytics script.
  Consequences: `verify-live`'s stamp check passes only while
  the fork's `main` equals this `main`; a deploy is never proof that a
  merge here shipped; and anything merged on the fork (see Open 6) is
  live without passing this repo's checkers. Earlier note, for the record:
  "builds this repo's main, proved 2026-09-15 05:33" was true only because
  the fork had just been synced. The domain is pointed (Vercel anycast
  `216.198.79.1`, `64.29.17.1`); the apex is primary and `www` redirects
  to it (Open 1, resolved). `src/config.mjs` is the only place the origin
  is written;
  `SITE_ORIGIN` overrides it for previews.
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
  `tools/check-budget.cjs` in the build. **Measured: 2,672 B** (the one
  bundled script, 1,119 B, plus Astro's inline hydration shim on the-floor,
  1,553 B; the nine bytes over the earlier 2,663 are `drift()` moving into
  `src/lib/rose.mjs`, below). The rose must be computed live and the axis must move with the
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
  title or date cannot disagree with itself. The code, the seed, the k and
  the neighbour links are derived there, never typed per page (see "The
  code is the date"). `amends: '<slug>'` links an amendment both ways.
  `draft: true` hides an edition everywhere but the build.
- `src/lib/rose.mjs`: `rhodonea()`, the house configuration, the mark seed,
  the dove outline, and `drift()`, the clock a live field's k follows (a
  5.5 s cycle of amplitude 0.085 around the seed). The ONLY place the curve
  is sampled: live fields, mark, favicon, cards, dove and films all import
  it; the client script and the film generator share the clock so a rose in
  a video moves exactly as the same rose on the site.
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
  `edition-02`, `the-floor`, `404`, and the generated `feed.xml.ts`,
  `llms.txt.ts`, `robots.txt.ts`, `index.json.ts` (the index as JSON for
  the desk and any companion; `vercel.json` sends it with
  `Access-Control-Allow-Origin: *`). Shared figure styles (big numbers by length, computed
  bars, sources lists) live in `src/styles/base.css`, not per page.
- `public/fonts/`: the two faces, subset with fontTools to Latin plus Latin
  Extended, **all axes kept** (Bricolage 181 kB, Martian 47 kB). The Google
  Fonts split subsets were 131 + 53 kB for Bricolage alone; one file with
  every axis is the honest size of a brand whose type is the identity.
- `public/og/`: content-hashed cards; `src/lib/og-manifest.json` maps stable
  path to hashed path and alt text. Generated by `tools/generate-og.mjs`.
- `public/pdf/`: the uploaded print editions.
- `source/`: the print sources as uploaded (`source/edition-02/`,
  `source/ns-01.html`, `source/ns-02.html`) and the desk's prompt
  (`source/desk/prompt.md`, see Open 7), kept out of the deploy by
  `.vercelignore`. Edition 02's font path bug is fixed in place (see
  Findings). 1.4 MB; do not let this grow into the 107 MB northerntemper
  carried.
- `tools/`: `verify.cjs`, `check-brand.cjs`, `check-budget.cjs`,
  `check-docs.cjs`, `check-contents.cjs` (every contents entry in
  `src/lib/editions.mjs` must exist as an id and a heading in the built
  edition page, and every published page's meta description must run 100
  to 200 characters, or the build fails), `generate-llms-full.cjs`,
  `generate-og.mjs`, `generate-marks.mjs`, `generate-social.mjs`,
  `generate-video.mjs` (the silent films), `generate-film.mjs` (the
  narrated films, three steps: script, narrate, render), `narrate.py`
  (the voice, Kokoro-82M through `uv`), `lib/film.mjs` (what the two film
  generators share: palette, ffmpeg search, surface CSS, the Chromium
  context, the encoder),
  `generate-design-system.mjs` (the claude.ai/design bundle, below).
- `design-system/`: generated by `tools/generate-design-system.mjs`, ignored
  by git, pushed to the claude.ai/design project with `/design-sync`. Not a
  source of anything; regenerate, never edit.
- `brand/`: the social kit (X header, LinkedIn banner and logo, YouTube
  banner, a generic cover, avatars), generated by `tools/generate-social.mjs`
  from the same rose system as the site. Kept out of the deploy by
  `.vercelignore`; it is for uploading to platform slots, not for serving.
  Regenerate, never edit. `brand/youtube/` is the films, thumbnails and
  upload sheets from `tools/generate-video.mjs` (silent, `npm run video`)
  and `brand/youtube/<slug>/` the narrated film, narration, captions and
  sheet from `tools/generate-film.mjs` (`npm run film -- --slug <slug>`):
  megabytes each, ignored by git, regenerated. This build sandbox is
  ephemeral and hands back at most 30 MB per file (found 2026-09-24 when
  The Markup's 1,050 MB film would not deliver): a real film is rendered
  by `.github/workflows/film.yml` and downloaded from the run's
  artifacts, or on the owner's Mac with the same command.
- `.github/workflows/verify.yml`: build (with the three checkers), audit,
  sweep, on every PR and push to `main`.
- `.github/workflows/film.yml`: manual dispatch, `slug` and `format`
  inputs. Renders a narrated film on a clean runner (build, Playwright,
  ffmpeg, espeak-ng, `uv`) and keeps `brand/youtube/<slug>` as a 90-day
  artifact, because the build sandbox is ephemeral and can hand back at
  most 30 MB while a 14-minute 1080p film is a gigabyte. Also runs once
  when the file itself changes. First half of the publish pipeline in
  Open 9; the YouTube upload half waits on the owner's OAuth client.
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

- **The code is the date** (owner, 2026-09-16: "I really hate having to
  keep a series going with the numbers that get fucked up instead of just
  the date stamps used in some cool repeatable way"). Series numbers were
  decisions, two series of them, and the next one was always a guess. A
  date is a fact. So: an edition's code is its date label everywhere it is
  named (masthead, home, feed, llms.txt, cards, footer, descriptions); its
  rose seed is its date as YYMMDD unless the print gave it one; its k is
  the house configuration unless the print gave it one; its URL is its
  title. Two on one day are told apart by title, and same-day order is the
  order of the list in `src/lib/editions.mjs`, typed once. Neighbour links
  at the end of an edition are computed from that order ("Earlier",
  "Later"), so a neighbour's name cannot drift. The printed PDFs keep the
  names printed on them; each page's JSON-LD `alternativeHeadline` says
  "Printed as Edition 03" so a reader holding the print finds the page,
  and nothing else on the site says it. Old URLs stay, because cards and
  links in the wild point at them. A draft's date is provisional and is
  set on the day it goes live, because the date is the code.
- **A design system in claude.ai/design, generated from the site**
  (2026-09-16, owner invoked `/design-sync` and left the call to the
  builder). The owner keeps one such project per brand and reaches for
  outside tools (Grok images, a Grok "staging desk") when there is no
  in-system place to design a poster or a card; this gives them one, on the
  real tokens. It is never typed: `tools/generate-design-system.mjs` reads
  the tokens out of `src/styles/base.css`, ships the stylesheet itself with
  the font paths rewritten, lifts the rules the site keeps scoped inside
  `src/components/Masthead.astro` and `src/components/EditionEnd.astro`,
  copies the shipped fonts and marks, computes every rose with
  `src/lib/rose.mjs`, and copies the source of `rhodonea()` into the React
  primitives so the design app's roses are the site's roses. Bundle: five
  token files, `styles.css`, 18 specimen cards on the site's own classes,
  20 React primitives in six groups (each with a `.d.ts` and a `.prompt.md`),
  a readme that mirrors this file's rules, a thumbnail. Project id
  `bcee9482-dc08-4a0b-a808-9a7fe169172f`, namespace
  `AedificareDesignSystem_bcee94` (the component cards address the app's
  compiled bundle by that name; both are constants in the generator).
  The React primitives are new code for the design app; the site is Astro
  and does not use them. Verified before pushing: every card rendered in
  Chromium with both faces loaded and no console error, the primitives
  compiled with Babel one file at a time as the app compiles them, and
  `tools/check-brand.cjs` run over the bundle came back clean, which caught
  two things worth knowing: a card that quotes a banned phrase trips the
  checker exactly as a page would, and `--ease` and `--t-slow` are tokens
  no shipped rule uses, because the checker fails any transition that
  names an easing. Regenerate with `npm run design` after a change to the
  stylesheet, the rose library or the editions, then `/design-sync` to
  push; the app compiles its own manifest and bundle from the files.
- **A YouTube channel, rendered from the generator, not cut from footage**
  (2026-09-24, owner: "turn this brand / site into a YouTube channel", with
  browser-use/video-use as the tool). video-use was read before anything
  was built. It is an editor for footage that already exists: it
  transcribes with ElevenLabs Scribe (an API key is required, metered, so
  not zero budget past the free tier), cuts filler and dead air, grades,
  burns subtitles, and writes `final.mp4`. It cannot make a video from
  text or from nothing, and it expects talking heads, tutorials,
  interviews. This brand has no face, no voice on record, and the kit says
  it issues rather than speaks; there is no footage to cut. So the channel
  is made the way everything else here is made: computed. A film is a
  deck with a clock, and the kit's deck rules govern it (full bleed,
  grounds cut hard between Void, Bottle and Flash, one word per surface at
  300px, no transitions, dividers are the live rose field, the dove last
  and once). `tools/generate-video.mjs` renders every frame in Chromium
  from the equation at a known time and pipes them to ffmpeg; nothing is
  recorded, the rose is `drift()` from `src/lib/rose.mjs` (the same clock
  the client script runs), and the dove is built by `src/scripts/aed.js`
  loaded into the frame unchanged. Per published edition and for the
  index as a trailer: 1920x1080, the same film at 1080x1920 for Shorts, a
  1280x720 thumbnail that is a frame of the film (the acid word at width
  100), and a `.txt` upload sheet with title, description and licence
  generated from the editions list. Every shot's HTML goes through
  `tools/check-brand.cjs` before a frame is encoded, so a frame passes
  what a page passes. Grammar decisions: holds are multiples of 900 ms;
  the acid word holds 1,800 ms with its width axis stepping 75 to 100 per
  frame (the flex is the axis, in time); Acid is spent once per shot
  (the k=5 curve of the opening field, then the acid word); Shock rose
  once per film, on the opening field's k=3 curve; slide numbers Acid at
  16px bottom-left and the seed Malachite bottom-right, both Bottle on
  the Flash slap because Acid and Malachite on Flash are not text; the
  record shot sets the URL as two lines (host, then path) so no title's
  path crops. ffmpeg: this sandbox has none on PATH, and the build
  Playwright installs beside Chromium encodes VP8 WebM only and reads
  only JPEG frames, so here the films are WebM from JPEG frames at
  quality 100; a machine with a real ffmpeg gets H.264 MP4 from PNG
  frames. YouTube takes both. The films are **silent**, by omission and
  not decision: the brand has no sound spec, a voice is a brand decision
  the owner has not made, and a synthesised voice reading an edition
  would be a voice. Open 9 lists what the owner decides. The YouTube
  banner in `tools/generate-social.mjs` is its own composition because
  YouTube crops one image three ways: the mark, the name and the seed sit
  inside the central 1546x423 that a phone shows; the rose bleeds across
  the full frame for a TV. Where video-use fits later: the day the owner
  records anything (a screen capture of the live axis, a reading), it is
  the right cutter for that footage, and it would need its ElevenLabs
  key and a decision that this brand has a voice.
- **The narrated films** (2026-09-24, later the same day; override 6). The
  owner described the channel they want: ColdFusion, Economics Explained,
  Fireship; faceless; soft piano; tech hardware and AI; able to earn. Four
  research passes were run before building (repositories, voices and
  credits, YouTube policy and growth, eleven uploaded papers); the notes
  are in the session's memo and the findings that changed the build are
  these. The owner's ~700 ElevenLabs credits are ~42 seconds of speech and
  the free plan forbids commercial use; ~700 Runway credits are 140
  seconds of Gen-4 Turbo; neither is a channel. Kokoro-82M is Apache-2.0,
  ungated, rated above Chatterbox on the blind arena, emits its own word
  timestamps, and ran here at 1.4 to 1.7 times real time on four CPUs, so
  it is the voice. Remotion is free for an individual including
  commercial use and would be the render layer if the site were not
  already a frame generator; the Playwright pipeline was kept because it
  shares `src/lib/rose.mjs` and the client script with the site, and
  Remotion's Chrome and bundle would land in a static site's install path.
  YouTube's inauthentic-content rule (rewritten 16 July 2026) disqualifies
  templated, interchangeable, mass-produced uploads and readings of other
  people's material; it allows an original script per episode with
  original visuals and one consistent synthetic voice, which is exactly
  this. A synthetic voice reading an original script needs no
  altered-content disclosure. Uploads carry the **Standard YouTube
  Licence**, not CC BY: the CC grant is irrevocable, commercial, invites
  re-uploads that compete in Search and cannot be Content ID'd, and a
  file with a library music bed cannot be relicensed at all; the writing
  stays CC BY on the page and the description says so. Tags are
  negligible by YouTube's own statement; the title, thumbnail,
  description and the first fifteen seconds are the only signal a new
  channel gives the system, so the film opens on the title and the lede
  and the sheet's title is the lede's first sentence (under 100
  characters, the number in it). The pipeline: `script` walks the BUILT
  page in Chromium and writes which blocks are read (title, lede,
  headings, prose, pulls, the slap) and which are shown (the headline
  figures), so the page is the script and nothing is typed; `narrate`
  (`tools/narrate.py`, run through `uv` with inline dependencies so
  nothing enters the repo's install path) normalises money and units
  before the model sees them ("$5.1M" read raw is five dollars and one
  cent M) and maps word timestamps back onto the original words;
  `render` cuts every money figure, unit figure and proper name in as a
  full-frame surface at the word's own time with the sentence under it,
  the Malachite rose breathing between on the section's ground, section
  cards while a title is read, the slap on Flash, the record, the dove in
  silence, at 24 fps with the rose redrawn at 12 (k moves 0.1 a second at
  most). Acid is spent once per shot (the opening field, a section's
  headline figure); Shock rose once per film. Captions come from the same
  timestamps. Chapters come from the section starts. The papers the
  owner uploaded add two things: in a commoditised synthetic-voice format
  no measurable content feature separated hits from misses (Ji, 2,032
  Shorts), so the differentiation is the subject and the computed
  visuals, which is the only thing this pipeline cannot commoditise; and
  the diagnostic for the first uploads is CTR against average view
  duration (Gushkov, relaying YouTube's own documentation).
- **The desk at apt.grok.me is a companion, not a mirror** (2026-09-16).
  The owner drafts there with Grok in minutes; here a piece takes a PR, a
  merge and a fork sync. That speed is worth keeping. What is not: a
  second copy of anything issued, under codes and dates the apex does not
  carry, on a domain that is rented. So the desk hosts only what the apex
  has not issued, a draft there carries no date and no code, and when a
  piece is issued its text leaves the desk and a one-line pointer to the
  apex URL stands in its place. The desk's index is read from
  `/index.json` at load and never typed; its card is `/og/desk.png`, made
  by `tools/generate-og.mjs` like every other card; its mark is the
  site's `public/favicon.svg` hotlinked, never redrawn; its type is the
  site's own font files over CORS (`vercel.json` opens `/fonts/` and
  `/index.json`). Nothing on it is a second version of the brand. It
  keeps `noindex` and every brand rule the site keeps. The apex is the
  only place anything is issued and the only URL a share should carry.

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
6. **The Floor (2026-09-16), drafted from a transcript the owner pasted.**
   The transcript is Data Slayer's video of September 2025 on the first
   Haven radio (Tim, Parallel, the same vendor whose Haven 2 guide The
   Markup priced), identified by its title, "I Built a $20,000 Military
   Router for $106.23", and fixed in time by Geeky Gadgets' coverage on 5
   Sep 2025. Its bench and field numbers are the measurement The Markup's
   throughput row never had; they are set beside an independent bench
   (Xu, Mankai and Alouini, arXiv 2605.17349, May 2026), the FCC rule as
   printed, Meshtastic's own preset table and Seeed's price today, and
   never added together. The amendment leaves Edition 03's text and PDF
   as printed and links both ways through `amends`. The owner must still
   confirm the video URL against their transcript and set the date on the
   day it goes live.
5. **A research file, "The Algorithmic Aedificare" (2026-09-16), was not
   added.** A machine-written survey of organoid computing, acoustic
   metamaterials, 4D mesh generation and robotic timber, framed as the
   Latin verb's future in architecture. That framing is the building pun
   the brand forbids, and the piece explains what the name means, which
   no surface may do; the sources were not checked because the verdict
   does not depend on them. Two facts from it are recorded in Open 5 so
   nobody rediscovers them: a Kostis Velonis sculpture called *Circus
   Aedificare* (2018) exists under the name, and the Met's own record dates
   the Goltzius print 1575 to 1617, the artist's working life, where the
   Rijksmuseum gives c. 1598 to 1604.

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
- `src/pages/index.json.ts` is the index in machine form: the published
  editions with date, date label, title, URL, lede, note and PDF, in site
  order, from the same list. It exists so a companion on another origin,
  the desk at apt.grok.me first, renders the index without typing it.
  `vercel.json` sends it with `Access-Control-Allow-Origin: *` so a
  browser on that origin may fetch it. Nothing else is open cross-origin
  except `/fonts/`, for the same reason.
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

1. **Resolved 2026-09-16 16:08 UTC: the apex is primary.** The owner set
   the two rows in Vercel (Settings → Domains: `aedificare.art` serves
   production, `www.aedificare.art` 308 → `aedificare.art`). Verified by
   curl from the sandbox: the apex answers 200 with its canonical and
   build stamp, `www` answers 308 to the apex on `/` and on deep paths,
   every route and discovery file answers on the apex, the sitemap names
   the apex only, and the `vercel.json` headers are present; then by
   `verify-live` run 3 at 16:11 UTC, url the apex, `sha` `682a76ea` (the
   fork's head, see Stack): green. History: from 2026-09-15
   05:33 UTC the site was live but the apex answered 308 → `www` while
   every canonical, the sitemap, `robots.txt`, the feed, `llms.txt` and
   every OG URL named the apex, so crawlers were told "the real page is
   here" and sent elsewhere. The alternative, changing the origin in
   `src/config.mjs` to `www`, was rejected: the brand is the apex, and
   every card and link already in the wild named it.
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
   The Met's record (object 398429) dates it 1575 to 1617; the Rijksmuseum
   c. 1598 to 1604. Kostis Velonis's sculpture *Circus Aedificare* (2018)
   also exists under the name. Neither appears on a surface either.
6. **The fork.** Production deploys from `jessejamesvictoria/aedificare`
   (Stack, above), synced by hand. Two things are the owner's to decide,
   both raised in chat on 2026-09-16. First, automate the sync: a workflow
   here that pushes `main` to the fork on every push, fast-forward only so
   nothing on the fork is ever destroyed by a machine, needing one secret
   (a fine-grained token from the fork's account with Contents read and
   write on that one repository). The builder proposed it; the session's
   permission rules stopped it writing a workflow that pushes to another
   remote, so it lands only when the owner says so. Second, the fork
   carries Vercel's "Install Web Analytics" commit, which adds
   `@vercel/analytics` and a 3.1 kB script (1.5 kB gzipped) plus a beacon
   to every page. This file says no analytics and the JS budget check
   never saw it. Keep it, and it must come through this repo as a PR with
   the budget accounting for the external script; drop it, and the first
   mirror push resets the fork. Until one of those happens the fork and
   this repo disagree and the mirror push would fail by design.
8. **The Navigator**, drafted in chat on 2026-09-16 from Tom's Hardware's
   story on Rik Arends' 3D codebase explorer (12 Sep 2026): the fsn scene
   in Jurassic Park, SGI's 1993 patent US 5,528,735 now held by RPX and
   Morgan Stanley, the CodeCity experiment (41 subjects, +24 percent
   correctness, -12 percent time, ICSE 2011), Chromium at 39 million source
   lines against his 51 million raw. Waits on the owner's screenshots of
   the replies where the memory figures and "because I could" appear, so
   sections 02 and 07 cite him and not the press; then it is built like
   The Floor.
9. **The YouTube channel** (2026-09-24). Built: the silent films, the
   narrated film pipeline, thumbnails, banner, avatar, captions, chapters
   and upload sheets. Decided by the owner the same day: the channel
   speaks (override 6), the voice is am_michael, ffmpeg and espeak-ng are
   in the environment's setup script. Not yet done, all the owner's:
   create the channel and claim the handle (probe `@aedificare` first);
   upload `brand/youtube-banner-2560x1440.png` and `brand/avatar-800.png`;
   per film, paste the sheet's title, description and chapters, upload
   `captions.srt`, keep the licence dropdown on Standard YouTube Licence
   (the reasoning is in the design decision above), leave the synthetic
   disclosure unticked, one playlist named Editions; then the channel URL
   goes into `humans.txt` and the JSON-LD `sameAs`, both in this repo, and
   nowhere else on a surface. Still open: **music** (the owner wanted soft
   piano; the pipeline mixes a file the owner downloads from the YouTube
   Audio Library under the voice with `--music`, credit line in the
   description if the track asks for one; a bed computed from the
   equation is the alternative that keeps CC BY possible on the file);
   **cadence** (one film per edition on the day it is issued, which is
   the only cadence the code is the date allows; research says judge
   after fifty uploads and hold one slot); **the publish pipeline** (a
   GitHub Actions job that renders on merge, stores the film as a release
   asset and uploads through the YouTube Data API with an OAuth refresh
   token kept as a repository secret, so issuing an edition and
   publishing its film are one merge; needs the owner's Google Cloud
   OAuth client); **Shorts** (the silent tall film exists; a narrated
   60-second cut of section 00 is the Short the research favours, not
   built); **the channel description** (the kit's no tagline and no
   "Aedificare is" rules apply to the About box; the record line is the
   only text that qualifies). "Jacky Tran" in the owner's brief is most
   likely Jake Tran (faceless documentary over stock footage); the owner
   has not confirmed.
7. **The desk at apt.grok.me stays and becomes a companion** (owner,
   2026-09-16: they like the short name and keep it whatever they build
   there; the earlier "take it down" is superseded). What it was when
   found: a public Grok App Builder page titled Aedificare with an
   em-dash, Google Fonts, a tint the kit does not have, and three drafts
   the repo has never seen (*The One Machine*, *The Mouths*, *The
   Example*) under codes and dates the apex will never carry. It sends
   `x-robots-tag: noindex` and has no robots.txt, so it took no search
   traffic, but every shared link and every model's reading of it built a
   second record on a domain nobody here owns. The design that keeps the
   speed and removes the split is the decision "The desk at apt.grok.me
   is a companion, not a mirror" above; the prompt the owner runs in Grok
   App Builder to make it so is `source/desk/prompt.md`. Still open: the
   owner runs the prompt, then the builder curls the desk against the
   prompt's own checklist; the three drafts come here as text to enter
   through the checkers; whether *Honor* is a series is a brand decision.
   Names on grok.me, probed 2026-09-16 16:10 UTC: `aedificare` answered
   404 (unclaimed), `aed` and `desk` 200 (taken). Claiming
   `aedificare.grok.me` costs nothing and denies the name to a stranger on
   X's platform; it is rented from xAI, not owned, so it is a lock on a
   door and not a foothold. The foothold is the apex.
