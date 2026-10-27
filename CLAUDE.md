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
| `/the-middleman` | 27 Oct 2026 · *The Middleman*, no print, written from an unsourced research deck, twelve sections, seventy-five sources, three registers | **draft**: sourced from scratch, six researchers and a skeptic each (Findings 0j); title and lede the owner's to confirm |
| `/the-grade` | 22 Oct 2026 · *The Grade* (printed as Edition 10), twelve sections, fourteen sources | **draft**: ported and swept, every source still to be opened |
| `/the-countersign` | 16 Oct 2026 · *The Countersign* (printed as Edition 09), fifteen sections, twenty-two sources, three registers | live |
| `/the-supply-cabinet` | 8 Oct 2026 · *The Supply Cabinet* (printed as Edition 06), eleven sections, twelve sources (ten cited) | live (2026-10-17, every source opened, 98 claims corrected) |
| `/the-fourth-axis` | 6 Oct 2026 · *The Fourth Axis* (printed as Edition 05), twelve sections, thirty-eight sources, three registers | live |
| `/the-tilt-gap` | 3 Oct 2026 · *The Tilt Gap* (printed as Edition 04), fifteen sections, fifty-one sources, F/I/Q marks | live |
| `/the-floor` | 18 Oct 2026 · *The Floor*, amends The Markup with the builder's own field numbers, ten sections, sixteen sources | live (2026-10-18, every source opened, the video checked against its captions) |
| `/edition-03` | 15 Sep 2026 · *The Markup* (printed as Edition 03), eight sections, twelve sources | live (2026-10-18, every source opened, 29 claims corrected; the two lines The Floor answers stay as printed) |
| `/edition-01` | 11 Sep 2026 · *The Snapshot Problem* (printed as Edition 01), twelve sections, thirty-four sources, three registers | live (2026-10-18, every source opened, 56 of 63 flags upheld and corrected) |
| `/ns-01` | 11 Sep 2026 · *The Hand in the Water* (printed as NS-01), eleven sections, fifty-four sources | live (2026-10-18, sourced from scratch, every source that could be opened opened; the three lines The Closest Humans answers stay as printed) |
| `/ns-02` | 13 Sep 2026 · *The Closest Humans* (printed as NS-02), amends The Hand in the Water, eleven sections, forty-four sources | live (2026-10-18, sourced from scratch, each side of the disputed calls given with its own source) |
| `/edition-02` | 18 Oct 2026 · *The Subtraction* (printed as Edition 02), nine sections, thirty-six sources | live (2026-10-18, sourced from scratch; no PDF, none was issued) |
| `/404` | | live |
| `/feed.xml` `/llms.txt` `/llms-full.txt` `/robots.txt` `/sitemap-index.xml` `/ai.txt` `/humans.txt` | discoverability | generated or static |
| `/privacy.txt` | the privacy statement: first the films' player on the editions (what the press loads, what applies from then on; YouTube's API terms require it of a site that embeds the player, 2026-10-26), then the YouTube uploader's, which Google's consent screen needs before the app can leave Testing (2026-10-17); plain text like `humans.txt`, not a page, linked from the rail beside every player | static |
| `/index.json` `/og/desk.png` | the index as JSON and the desk's card, for apt.grok.me to fetch and hotlink | generated |
| `/film/*.png` | each linked film's own thumbnail, reduced and content-hashed, beside a link to its YouTube watch page at the edition's end and on the home (Decisions log, 21 Oct 2026) | generated |
| `/pdf/ns-01.pdf` `/pdf/ns-02.pdf` `/pdf/edition-01.pdf` `/pdf/edition-03.pdf` `/pdf/edition-04.pdf` `/pdf/edition-05.pdf` `/pdf/edition-06.pdf` `/pdf/edition-09.pdf` `/pdf/edition-10.pdf` | the print editions as uploaded | as uploaded |

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
   this**; until it is, this paragraph wins. The dove is named
   **ὄρνις** (owner, 2026-10-11); the name is recorded here and in the
   Decisions log, is the builder's co-author line on every commit, and is
   on no surface, because putting it on one is a brand decision nobody has
   made and because the Greek would fall back to system mono (override 5).
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
   counts as "at scale"; 11px labels and 2px rules do not; an image counts
   by its pixels, when its tallest band of Acid ink, drawn at the size it
   is shown, reaches the capital of 24px type, 16px; a film's thumbnail at
   that size fails on its own, wherever it sits).
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
   **The voice changed on 2026-10-17, before the channel's run began**
   (owner: "you can use one of different ones you decide"). Kokoro was
   judged not good enough; research ranked the options that pass the rules
   (commercial use, no clone, word timing) and Gemini 3.8 Flash TTS came
   out best for the money at about a quarter of a dollar a film, in the
   owner's own Google project. The owner heard samples
   (`tools/voice-samples.mjs`) and left the pick to the builder, who chose
   the DESIGNED voice "aedificare-analyst" (`voice_l6lephk1pqjk`: a man in
   his forties, low, dry, unhurried, a financial analyst who finds the
   numbers quietly absurd; written as a description, never taken from a
   recording), because it is the brief in one line and belongs to this
   channel alone. It speaks through `tools/narrate_gemini.py` when the
   workflows set `NARRATOR=gemini:voice_l6lephk1pqjk` (a repository
   variable `NARRATOR` overrides; `kokoro` in it brings back am_michael).
   One voice still holds: a missing voice id fails the render rather than
   falling back. The Markup's film and Short went up by hand in the old
   voice before this; they stay up until re-rendered, and that is the
   owner's call.
   **Then ElevenLabs, a woman, American (same day, still before anything
   was published).** The owner asked whether ElevenLabs, first on the
   Artificial Analysis arena (1330 against Gemini 3.8 Flash TTS's 1275,
   which listeners prefer about 58 to 42), was worth paying for; heard
   it beside Gemini; chose it ("that's why you paid for it"); then asked
   for a woman's voice and refused British ("that woman's British too")
   in favour of what suits "the average" English-speaking viewer. Both
   designed Gemini voices read as English to the owner and to an accent
   classifier (SpeechBrain CommonAccent ECAPA: England first for both,
   US first for every ElevenLabs candidate), so the classifier stood in
   for the owner's ear when picking among candidates. The voice is
   **"aedificare-husky-american"** (`sacfsNbCahgH0qw7PIO8`), designed in
   the owner's paid ElevenLabs account (Starter, 40,000 credits a month,
   commercial licence, the key stored as the repository secret `PLUTO`)
   from a description: a woman in her early thirties, low, husky,
   slightly smoky, General American, warm, intimate, unhurried. The owner
   asked for "sexier, like ScarJo"; a named person's voice is never
   imitated (this rule, YouTube's voice-likeness detection, and that
   actor's own public objection to a sound-alike in 2024), so the brief
   names qualities, never a person. The voice is written once, as
   `NARRATOR` in `src/config.mjs`; the film tools and the upload guard
   read it there, a repository variable `NARRATOR` only overrides it, and
   `tools/narrate.py` refuses to run with no narrator rather than fall
   back to Kokoro. It speaks through
   `tools/narrate_eleven.py` (`NARRATOR=eleven:sacfsNbCahgH0qw7PIO8`) on
   eleven_v4_turbo, which costs about 0.2 credits a character (105 for
   525, read twice), so the seven films are about 15,000 credits. The
   Gemini engine stays in the repo, retired, because it works and
   because a voice is cheap to keep and expensive to rebuild.
7. **The films get a voice of their own** (owner, 2026-09-24, later:
   "let's be like Fireship but Patrick Boyle dry humor, a unique
   Frankenstein voice"). Override 6 read the edition verbatim; this
   supersedes that for the narration only. A film is cut from a script
   written FROM the edition in the film voice, `source/film/voice.md`
   (Fireship's density, Boyle's temperature, the kit's prohibitions),
   kept as `source/film/<slug>.md`. Wording is free; facts are not: every
   figure in a script must exist in the built edition page, and a checker
   in the film pipeline will fail a render that invents one (to be built
   with the script-file step). The page itself is untouched by this: the
   edition remains the issued text, the film is its reading in the house
   voice. State: the voice guide and The Markup's cover and section 00
   were written as the sample (`source/film/edition-03.md`, whose facts
   now predate the corrections of 18 Oct, so it is not a base). **On
   2026-10-26 the owner said the films must be "like Fireship makes
   them"**: a research pass measured ours against his (the numbers and
   the plan are `source/film/plan-2026-10-26.md`, dated because they
   move), and the first script written FROM an edition for the screen is
   `source/episodes/countersign-pilot.md`, The Countersign in about 4:52,
   674 spoken words, 75 shots, every number and quotation checked against
   the built page twice and the craft reviewed twice; it renders through
   `tools/episode.mjs` once the facts gate, pops and page shots for
   episodes and the edition close exist (being built the same day, each
   reviewed), and its footage is the owner's to find (the list is in the
   plan). The promised checker is that facts gate.
8. **The channel shows the world** (owner, 2026-09-25 and 26: "you need
   to use footage from movies aptly like other creators do", "like his
   episodes" of Jake Tran, then Johnny Harris's news clips and quotes from
   the people involved, and Fireship's one-second gags "like an
   exclamation mark"). Override 6 said no stock footage, no photograph;
   for the channel's films that is superseded. The site is untouched: no
   photograph, no face and no gag reaches a page. What changed, and what
   did not:
   - **Real footage, found by the owner.** An episode is a script,
     `source/episodes/<slug>.md`, whose tags say where each cut falls and
     what it needs; `tools/episode.mjs sheet` turns them into a shopping
     list, the owner finds the clips and attaches them to the GitHub
     Release `footage-<slug>`, and `.github/workflows/episode.yml` renders.
     The builder does not download films or rip YouTube; it proved the
     public-domain route (DVIDS, NASA, Prelinger, Korea War footage) in a
     prototype of The Markup's opening on 2026-09-25, which the owner
     judged "terrible" in its first, card-only form and redirected here.
   - **Public domain first, fair use by the second.** US federal video is
     public domain (the White House's own recordings, the committees' own
     hearing streams, the House and Senate floor, DVIDS, NASA); a network's
     recording of the same moment is not. Anything else (a film, a news
     broadcast, a meme) is used for the seconds the point needs, between
     commentary, logged in the episode's credits, and accepted as a
     Content ID risk on that video. Never a clip that makes a real person
     appear to say what they did not; the narrator stays synthetic and
     never imitates a voice.
   - **The type is still the brand.** Quotes, maps, figures and cards are
     computed in the site's faces and colours; footage is graded toward
     Void so six decades of film read as one; gags are left ungraded so
     they land as the joke. Every surface this pipeline types passes
     `tools/check-brand.cjs`; quoted words are the speaker's and are
     checked against their source (`check --online`), not against the kit.
   - **Facts are not free, enforced.** `tools/episode.mjs check` fails a
     script whose numbered sentences cite no source, whose sources lack a
     URL or date, or whose quotes are not on their source page. This is the
     checker override 7 promised.
   - **One channel, tech and money** (owner, 2026-09-26, agreeing to the
     builder's recommendation): every episode is a technology story told
     through one number. Politics is not a subject; a political figure
     appears only as a beat. A second, finance-only channel waits until
     this one has fifty uploads.

**Enforced by machine** (`tools/check-brand.cjs` in the build, on the built
output): no radius above 2px, no shadow, blur, backdrop or gradient, no
italic or underline (properties and tags), never centred, durations only
120ms or 900ms and nothing that eases, no third typeface, no em-dash, no
exclamation in a heading, no emoji, no sentence "Aedificare is", none of
the banned self-praise adjectives. `tools/check-contents.cjs` keeps every
contents list true to the built edition, drafts included and every published
page's meta description within 100 to 200 characters. `tools/films.mjs --check`,
the build's first step, holds `src/lib/films.json` to the published editions,
each entry to its own edition's release and the thumbnails on disk, and
`tools/films.mjs --check --online` in `verify.yml` holds each link to what its
release files now. `tools/verify.cjs` adds
the computed-style rules: contrast, Acid once per surface and never at scale
in a film's thumbnail, the brand faces actually loaded, every rose field
live, every field's reduced-motion still, and no request to any host but the
page's own until the reader plays a film (then one iframe, YouTube's
privacy-enhanced player, made by the click and never shipped in a page;
the film probe plays every player by mouse, Space and Enter and proves
it; Decisions log, 26 Oct 2026).

**Human duties** (cannot fail a build; review by eye on every PR): one loud
move per surface; never explain what the entity does; twelve words maximum
in display copy; the dove once per *sequence* (the sweep can count doves per
page, "sequence" is editorial); no building pun; no tagline; no call to
action; every source of a ported edition opened before `draft` is
flipped; after `npm run og`, every card whose content did not change
restored to its committed bytes (see Discoverability); and a linked film
kept public and current: the day a film the site links is withdrawn, held,
retired or replaced, `node tools/films.mjs --drop <slug>` (or the
replacement's id, once it is public) and a commit. Only the channel can say
what is public, so no build can fail on it: `tools/youtube-channel.mjs`
names a wrong link on every command but `probe` (its `list` exits non-zero), withdraw,
retire and `upload --replace` say so when they touch a linked film, and
`verify.yml` fails a link whose release now files another video (Decisions
log, 21 Oct 2026). The kit says no tagline and the site has none; the owner has asked
for a shortlist for bios and cards, which is a separate deliverable.

## Stack

- **Astro 7.4**, `output: 'static'`, **no adapter**: there are no API routes,
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
  `tools/check-budget.cjs` in the build. **Measured: 2,896 B** (the client
  script `src/scripts/aed.js`, inlined on every page, 1,780 B, plus Astro's
  prefetch module `page.*.js`, 1,116 B; 2,660 until the film's player on the
  reader's press, 26 Oct 2026, whose 236 B are the whole of it, and before
  that the two parts were misnamed here as a bundled script and a hydration
  shim; 2,672 until vite 8.3.4's newer rolldown, 21
  Oct 2026, and the nine bytes over the earlier 2,663 were `drift()` moving
  into `src/lib/rose.mjs`, below). The rose must be computed live and the
  axis must move with the reader; that, and since 26 Oct 2026 the film
  playing on the reader's click (Decisions log), is the only JavaScript the
  brand earns.
- **WCAG AA on every surface and zero axe-core violations**, enforced by
  `tools/verify.cjs` on every PR and push. **Current state: clean on all
  fourteen counts.** Keep it there. `node tools/verify.cjs --url https://host`
  runs the same sweep against a LIVE origin over the real network, because
  a deploy status is not a verification; run it after every production
  deploy and before telling anyone the site is up.
- **Branch → PR → merge. Never push to `main`.** The owner delegated
  merging on 2026-10-17 ("you can just keep merging, you don't need to
  wait for me"): the builder merges its own PR once CI is green and the
  findings of its own review are fixed. Still never a direct push.
- Anything the owner must action is said in chat, not only in the PR, then
  verified rather than taken on their word.

## File map

- `src/config.mjs`: the origin, name, author, the channel's `NARRATOR` (the
  one place the voice is written), and `BUILD`, the first eight
  characters of `VERCEL_GIT_COMMIT_SHA` ("dev" locally), shipped as
  `<meta name="build">` by `src/layouts/Base.astro`.
- `src/lib/editions.mjs`: **the editions, once.** Home, feed, llms.txt,
  robots, sitemap filter, OG cards and each edition's own page read it, so a
  title or date cannot disagree with itself. The code, the seed, the k and
  the neighbour links are derived there, never typed per page (see "The
  code is the date"). `amends: '<slug>'` links an amendment both ways.
  `draft: true` hides an edition everywhere but the build.
- `src/lib/films.mjs` and `src/lib/films.json`: the films the site links
  (Decisions log, 21 Oct 2026), keyed by edition: the video id, the length
  the link shows, the film file it was measured from (its release, name,
  size, filing time and length in seconds), the thumbnail's two files, size
  and alt text, and the release asset it was reduced from with that asset's
  sha256. The JSON is written only by `tools/films.mjs`. The module holds
  the thumbnail's size (`THUMB`, 112 by 63, and why) and the length rule
  (`lengthOf`: the file's own length rounded UP, as YouTube shows it; the
  rounded length in `meta.json` read 18:15 and 13:38 where YouTube shows
  18:16 and 13:39). It checks the JSON on first use with no network, so the
  build stops on an entry for an edition that is not published, an id that
  is not eleven characters or is linked twice, a length that is not the
  measured one rounded up, a film or thumbnail source that is not the
  edition's own release, a thumbnail not named for its edition, missing,
  not 112 by 63 or not the bytes its hashed name says, or a file under
  `public/film/` that nothing links.
  `src/components/FilmLink.astro` renders the link at the edition's end
  and in its entry on the home: the record first ("Film · 18:16 ·
  YouTube", the length a `<time>` duration), on the baseline of the links
  beside it, the thumbnail hanging after it; `src/pages/index.json.ts`,
  `src/pages/llms.txt.ts` and `tools/generate-llms-full.cjs` carry its URL.
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
  `Rail`, `Pull`, `Stats`, `EditionEnd`, `FilmLink`, `Formats` (the row on
  an edition's cover: read, PDF, film, each only when it exists) and
  `FilmPlayer` (the film's own surface under the cover, playing on the
  click; Decisions log, 26 Oct 2026).
- `src/pages/`: `index`, `the-middleman`, `the-grade`, `the-countersign`, `the-supply-cabinet`, `the-fourth-axis`, `the-tilt-gap`, `edition-03`,
  `ns-01`, `ns-02`, `edition-01`, `edition-02`, `the-floor`, `404`, and the generated `feed.xml.ts`,
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
- `public/film/`: each linked film's thumbnail at 112 by 63 and 224 by 126,
  content-hashed, written by `tools/films.mjs`; `vercel.json` caches it
  for a year like `/og/`, since a new picture is a new name.
- `source/`: the print sources as uploaded (`source/edition-02/`,
  `source/ns-01.html`, `source/ns-02.html`) and the desk's prompt
  (`source/desk/prompt.md`, see Open 7), kept out of the deploy by
  `.vercelignore`. Edition 02's font path bug is fixed in place (see
  Findings). 1.4 MB; do not let this grow into the 107 MB northerntemper
  carried.
- `tools/`: `verify.cjs` (the sweep; its pages are read from
  `src/lib/editions.mjs`, drafts included, because a typed list left The
  Tilt Gap unswept from 3 to 6 Oct 2026), `check-brand.cjs`, `check-budget.cjs`,
  `check-docs.cjs`, `check-audit.cjs` (the dependency audit: high and
  critical advisories fail the build unless `tools/audit-allowlist.json`
  names them with a reason and an `until` date, after which they fail
  again; written 2026-10-03 when GHSA-ch52-4w7c-c8xp covered every
  version of `http-cache-semantics`, a build-time dependency of astro
  with no patched release, and `npm audit`'s only fix was astro 2; that
  release, 4.3.0, shipped and the entry was removed on 2026-10-06, the day
  a new source-map-js advisory turned CI red and `npm audit fix` took both
  to patched versions, so the allowlist is empty and stays the place a
  future exemption goes; on 2026-10-21 three advisories in the
  `launch-editor` that vite 8.3.0 bundles, one high, turned CI red the same
  way, and `npm audit fix` took vite to 8.3.4 with its rolldown, postcss and
  nanoid, the lockfile alone; on 2026-10-26 four more turned it red, two
  high, in the `undici` astro 7.3's `unifont` brings and in `zod`, and
  the fixed undici (8.12.2, 15 Oct) comes only with astro 7.4's unifont,
  so `npm audit fix` took astro from 7.3.2 to 7.4.1, the lockfile alone
  again; 7.4 keeps a newline and indent inside some elements that 7.3
  dropped, so eleven pages' bytes changed while every page's text,
  layout and full-page pixels at 1440 and 390 stayed identical, and
  `/llms-full.txt` gained blank lines),
  `check-contents.cjs` (every contents entry in
  `src/lib/editions.mjs` must exist as an id and a heading in the built
  edition page, and every published page's meta description must run 100
  to 200 characters, or the build fails), `films.mjs` (the films the site
  links, 21 Oct 2026: given the ids that are public, which nothing here can
  read without the channel's secrets, it matches each to the release whose
  `youtube.json` files it as the edition's film, so an earlier cut or a
  Short is refused, each release looked up by its tag and never through
  GitHub's listing, which on 22 Oct 2026 answered HTTP 200 with an empty
  page about one call in five (one link refused, and every link would
  have read wrong to `--online`) where 25 lookups by tag came back whole,
  and a refusal names what each edition's release files; reads the film's length from the movie header of the
  MP4 on the release by range requests (the moov box only, never the
  gigabyte) and rounds it up, refuses a film file filed after the upload
  the ledger records (a later render is not that video) or more than a
  second from `meta.json`'s length; takes the thumbnail's name from
  `meta.json` and the alt text's word from `script.json` by the rule
  `generate-film.mjs` uses, checked against the thumbnail's own ground;
  reduces the thumbnail by an area average in linear light with its own
  PNG codec, no library; hashes and writes it and `src/lib/films.json`,
  keeping an entry whose id, film file, thumbnail bytes and size have not
  changed; `--drop <slug>` takes a film off; `--check` runs first in `npm
  run build`, and `--check --online`, in `verify.yml`, fails a link whose
  release now files another video, or whose film file or thumbnail has
  been filed again or does not measure what the entry says. A ledger's
  `privacy` and `publishAt` are what the upload sent, not what is true now
  (The Fourth Axis's still reads private, publishing 22 Oct, while the
  film is public), so it reads only the id and the time),
  `generate-llms-full.cjs`,
  `generate-og.mjs`, `generate-marks.mjs`, `generate-social.mjs`,
  `generate-video.mjs` (the silent films), `generate-film.mjs` (the
  narrated films, three steps: script, narrate, render; `--short` for the
  Short), `narrate.py` (the voice, Kokoro-82M through `uv`, or Gemini
  through `narrate_gemini.py` when `NARRATOR` names a Gemini voice: chunks
  of about four minutes spoken in one style, words placed by forced
  alignment with wav2vec2-base-960h and a CTC Viterbi pass, numbers spelled
  out first so the voice and the aligner agree (signs, fractions, decades,
  model names and citation marks included), measured at a median 76 ms
  against Kokoro's own timestamps on the same audio; every chunk's
  alignment is scored and a chunk whose audio does not say its words is
  spoken again, then fails the run, because forcing always "succeeds" and
  the first version's fallback could never fire (review, 2026-10-17); chunks
  are cached and the daily quota exits 75; or ElevenLabs through
  `narrate_eleven.py` when `NARRATOR` is `eleven:<voice id>`, the channel's
  voice since 2026-10-17: one request a block, every word's time from the
  reply's character times, the same wav2vec2 gate, a block cache, spent
  credits exit 75), `seed-narration.py` (2026-10-26: puts a film's voice
  back in that block cache from the render artifact that spoke it,
  `narration.json` and `narration.wav`, under the keys the current code
  would ask for, leaving out and naming every block whose spoken text the
  current normaliser changes, so a render after a fix to the words pays
  for those blocks alone; refuses another model's or voice's narration;
  tried offline on The Countersign's narration with a synthetic wav: 55
  blocks back, the 5 "dollars" blocks named, about 1,100 characters to
  voice again; run by `.github/workflows/seed-narration.yml`),
  `voice-samples.mjs`
  (the same passage in every candidate voice, filed under the Release
  `voice-samples`: Kokoro, Gemini, and an ElevenLabs voice designed from
  the Gemini analyst's own description with a fixed seed, so the paid
  account can rebuild the voice the free one designed, when
  `ELEVENLABS_API_KEY_TEST` (the free account, tests only) or
  `ELEVENLABS_API_KEY` (the paid account, 40k credits, stored as the
  repository secret `PLUTO`, the owner's name for it) is set;
  `--only` picks engines so one can be tried without spending another's
  quota; the owner asked on 2026-10-17 whether ElevenLabs, #1 on the
  arena, is worth paying for, and the free plan's credits cover the test
  but carry no commercial rights), `bed.py` (the
  computed music bed, through `uv`), `lib/film.mjs` (what the two film
  generators share: palette, ffmpeg search, surface CSS, the Chromium
  context, the encoder, and, since 26 Oct 2026, the record: its spoken
  line, its shot on Flash and the seed line, written once so an episode
  cut from an edition closes on the same words and picture as the
  edition's own film), `lib/facts.mjs` (facts are not free, lifted out of
  `cuts.mjs` on 26 Oct 2026 so the episodes' edition films get the same
  reading: the built page's text, its SVG left out, spelled numbers read
  as numbers, a number at a scale found either way ("600 thousand" on a
  page that prints $600,000, `$50K` on one that prints $50,000), what each
  computed shot puts on screen, a quote card's words read for their
  numbers only, a chart row's display text in place of its value, a
  timeline row that names a day found with its day, where the month alone
  had done), `upload-youtube.mjs` (a rendered film to the
  channel through the Data API, from the render's `meta.json`, private by
  default; `--update <videoId>` sets the same generated metadata, captions
  and thumbnail on a video the owner uploaded by hand, and `--meta-only`
  with it sends only the words, about 50 units where captions and a
  thumbnail cost about 450 more), `film-meta.mjs` (files a film's title and
  description again without a render, from the release's own
  `script.json` and `narration.json`, through `lib/film-meta.mjs`, the
  function the render itself writes them with, so the two cannot differ;
  `.github/workflows/film-meta.yml` runs it over the releases, dry by
  default; `lib/diff.mjs` is the line diff both it and a sync dry run
  print; a re-cut's credits come from its release's `cuts.json`, and a
  meta marked as a re-cut with no `cuts.json` fails rather than strip
  them; `--test`, run by `verify.yml`, builds every published edition's
  description plain and as a re-cut and fails unless each still carries
  `Voice: synthetic, <model> <voice id>` at the start of a line, where
  `film.yml`'s morning skip test and the upload guard read it, and fits
  YouTube's 5,000 bytes, which the render, the refile and the re-cut now
  all measure when they file, not only the upload), `youtube-auth.mjs`
  (mints the refresh token once, on the owner's machine, with the upload,
  metadata and read scopes), `youtube-analytics.mjs` (the channel's numbers
  as a report: views, watch time, average view duration, subscribers,
  traffic sources, retention curves; impressions and CTR are not in the
  API and stay in Studio), `youtube-channel.mjs` (the channel against
  the Releases (a listing with no film release, that same empty page, is
  asked again, and five stop the run, rather than read every video as
  "no render" and judge no site link, a false green; an edition's release
  a listing leaves out, and the one `--only` names, is looked up by its
  tag): `list` shows every upload with the render it came from,
  matched by the uploaded file's name, and the renders not yet up; `sync`
  sets each matched video's generated metadata through
  `upload-youtube.mjs --update`, so a hand upload needs no video id
  pasted back; written 2026-10-06 and tested against a mocked channel,
  then run against the real one from 2026-10-17; `retire` makes an
  older-voice video private once its replacement is public; `schedule`
  (2026-10-18) moves a private video's publish time or holds it with
  `none`, so a film whose edition is still being checked, or whose render
  is being replaced, waits without anything being deleted; it never
  touches a video that is out and never makes one public; `withdraw`
  makes a named video that is out private at once, for a film found wrong
  after it went up (by release, which names that release's current video,
  or by video id for any earlier cut of ours: one matched to a render, in
  an older voice or superseded, or one that matches no render but whose
  description links the apex; `--privacy unlisted` sets an earlier cut,
  named by its id, unlisted instead, never the release's own video and
  never one with a publish time, and `retire` takes the same flag and only
  ever lowers a cut, so one withdrawn to private stays private), and
  `upload --replace <release>` puts a corrected
  render up beside the video it replaces, which then reads superseded and
  is retired like an older voice, and holds the replaced video if it was
  still scheduled, so the two never both publish; what an upload could not
  send, a caption track or a thumbnail, goes into the render's ledger as
  `owed`, `list` marks the video OWED, and the next `sync` sends it and files
  the ledger again without it, because on 18 Oct 2026 the day's quota ran
  out under three caption tracks and the runs went green; `youtube.yml`
  forces a sync with `set=force`; a sync whose only difference is the
  words sends only the words to the video its release's ledger names (a
  hand upload keeps the full update, since nothing records whether its
  captions went up), and prints every title and description change line
  by line, so its dry run is the before and after; and on every command
  but `probe` it judges the site's film links, `src/lib/films.json`, against the channel,
  the one place public can be read: each linked video on the channel,
  public, the film its release files and as long as the link says, or a
  `SITE LINK WRONG` line naming the `films.mjs` command that sets it right,
  and `list` exits non-zero; a current film that is public and not linked
  yet is named with the command that links it; `withdraw`, `retire` and
  `upload --replace` say so when they take down or supersede a linked film;
  tried on a mocked channel, 21 Oct 2026, and it writes no link itself),
  `generate-design-system.mjs` (the claude.ai/design bundle, below),
  `episode.mjs` (the news films, override 8: `check`, `sheet`, `narrate`,
  `render`; quote cards with a highlighter, maps from Natural Earth,
  figure and statement cards, overlays, sound-on clips that the narration
  waits for, slates for missing footage, captions, chapters, sources and
  credits in the description, `meta.json` for the upload; charts from
  `tools/lib/chart.mjs`: bars, range, stack, timeline, flow and line,
  built up on screen with the story's one point in Acid landing on the
  word that speaks its value (the narration's own timestamps; `check`
  warns when no word said while the chart is up says it, because then
  the picture gives the point away before the voice), a chart that
  comes back holding the rows it already showed, and, since 26 Oct 2026,
  every other row landing on its own word too (its label, or the
  `@ phrase` its tag names, said while the chart is up: the label's
  first meaningful word, then at least half of them in order, so two
  rows sharing a first word do not land together, and a point with no
  number landing on its words, "SIGN-OFF*" on "sign-off"; a timeline's
  row waits for its axis to reach its mark; `check` warns of an
  `@ phrase` nobody says; a label of numbers alone, "2025/26", still
  lands on "mid-2025", and whether a year said in passing should place
  a row is the owner's call), a flow keeping its places across the
  script's flows (a party keeps the angle its earlier flows gave it,
  carried in the render's `flowRing`; a newcomer takes the widest gap,
  among every angle the ring holds, beside a party it joins, so a loop
  that returns with a stranger is the same picture with one new box,
  where 2π·i/n had moved every box; the ring holds one diagram, and a
  flow sharing no party with it starts the ring again, so no two
  parties of a flow can hold one angle, which the first version let
  happen (review, 26 Oct); where two boxes would still meet at their
  places, as a sixth party 36° from its neighbour does on the Short's
  narrow ellipse, that flow is laid out evenly in the ring's order and
  `check` and the render name the frame and the pair; a label wider than
  its edge breaks onto two lines, as the stranger's "THE COIN, 66 MIN"
  on its short edge to X had stood 400 px off it; labels are still
  placed edge by edge, so two can meet, as before), and
  a timeline keyed to the minute (`2024-10-10 22:11=The joke`) spreading
  a day's rows by the clock and labelling them as times, where the same
  day twice had stacked them 90 px apart beside an empty axis, a text
  too wide for its room breaking onto two lines before it shrinks so the
  point keeps its size, the room read in the face's own advances
  (`LABEL_ADV`, measured in Chromium: one constant per character wrapped
  text that fit; this changed softbank-975's payments timeline in the
  film, whose hot row had been shrinking to fit, and left the Short's as
  it was), every
  chart citing its sources on screen, type sized for a phone and a TV
  (16:9 labels 40 px, Shorts clear of the right 120 px and the lower
  quarter), designed with the dataviz skill's method and its palette
  validator; `render` names every computed shot that stands still past
  14.4 s once its build has finished;
  `--short`
  renders the same script tall and cuts the chapters named in the
  script's `short:` plus the end card into the Short, under three
  minutes, with its own captions and `meta-short.json`). **Hardened
  against the owner's files** (2026-10-03, after a review that fed it
  synthetic footage and measured what came out): file names match
  case-blind with spaces and underscores as hyphens; a file whose header
  states no duration (a stream dump, a cut-off download) has its length
  read from the stream or counted from its frames, because `-t 0` meant
  unlimited and played the whole file, desyncing every later word; a clip
  with no length by any route, or whose `-at-` is past its end, is
  refused by name before a frame (the latter used to kill ffmpeg an hour
  in); the same in-point on footage warns and plays from the start; a still named as a clip is held for its words, not one
  frame; a file shorter than its shot is named on the sheet and at
  render; each clip's sound is trimmed in the graph and levelled to -16
  LUFS on its own (one loudnorm over the track left a quiet clip under
  the bed at -50); a portrait picture in the wide film is pillarboxed on
  Void; the Short is planned before the tall render and an empty piece is
  dropped rather than handed to ffmpeg as `-ss x -to x`; the description
  is written and measured before the first frame against YouTube's 5,000
  bytes (episode 1's with its credits was 5,489), titles against 100
  characters and both against `<` and `>` (`check` fails these, and
  `upload-youtube.mjs` refuses them before minting a token); chapters are
  listed only as YouTube shows them, three or more and none under ten
  seconds; every file in use with no line in `credits.txt` is named.
  **An edition film from a script** (2026-10-26, the checker override 7
  promised): `edition: <slug>` in the front matter names the edition a
  script is written from. `check` then reads the built page through
  `tools/lib/facts.mjs` (the same reading `cuts.mjs` gives a cut list) and
  fails on every number it does not carry, spoken or on a computed
  surface (a figure, a card, a pop, an overlay, a chart's display text and
  its timeline's dates, a quote card's words and source line, the title,
  and the thumbnail's lines, `thumb:` to `thumb3:`, type the render sets
  in Acid and Flash from the front matter and the most seen computed
  surface of all: a review of the same day put $52,000 on one and it
  passed clean against a page that prints $50,000),
  naming the line; wording is free, so a spoken word off the page is
  nothing and a surface's word off the page is a warning, as on a cut
  list; the kit's twelve words on a card, its label counted with it, on
  the thumbnail and on each label of a chart come with the same function.
  A draft edition is refused before a credit is spent, because a film
  waits for its edition's check (Decisions log, 18 Oct 2026); its page
  builds for the sweep, so until the review a script naming one passed
  the gate against it. Tried on The
  Countersign's pilot script (26 Oct 2026): every number in its sixteen
  paragraphs and on its fifty-nine tagged surfaces was on the page, four
  planted ones (a spoken 52,000, a 9,500 on a figure, a $1.1B in a chart's
  display text, an 18 June for the page's 17th) were each named with their line,
  and eight of its chart subtitles, notes and figure labels ran over
  twelve words (six chart texts, two figure cards; the first count here
  said seven), which is the pilot author's to cut; cut on 27 Oct, when
  the committed script (seven over, against the page as corrected on 26
  Oct) got `edition: the-countersign`, a hook that no longer types the
  URL, and the page's new source [24] for the clock note, and passed the
  gate clean with warnings only (two flows laid out evenly, below, and
  four surface words off the page). The film then closes
  as an edition film closes: the record line (`recordText` in
  `tools/lib/film.mjs`, the text `generate-film.mjs` writes, the section
  count from `src/lib/editions.mjs` and the source count from the page's
  own list) is one more narrated block, read over the record shot on
  Flash with the seed line, then the dove on Void, built by
  `src/scripts/aed.js` loaded into the frame as the edition films load
  it, in place of the end card; the Short ends the same way, the bed ends
  before the dove, and `longHolds` leaves both alone. The record costs
  voice like any paragraph. The film's and the Short's descriptions open
  with the edition's link, as the edition films' do (Decisions log, 20 Oct
  2026), and `check` warns when a `hook:` types it too; whether an
  `edition:` film's description should be the edition's own (`filmMeta`
  in `tools/lib/film-meta.mjs`) rather than the episode's is the owner's
  call, not changed. The parser now keeps each block's line for
  the messages, blanking comments line for line as `cuts.mjs` does; every
  script splits into the same paragraphs as before (checked over all six
  and the pilot), every tag of all six still builds to byte-identical HTML
  in both frames, and short-onegov's shots render to the same sixteen
  segment hashes through `renderSegment`.
  **The shots live in `tools/lib/shots.mjs`** (2026-10-20): the tag
  parser, the grade, the quote, map, chart, figure, card, title, slate,
  end and overlay builders, the footage probes, and the renderer that
  turns one shot into its own segment, lifted out of `episode.mjs` with
  no change in what they make, so the edition films' cut lists can build
  the same shots. What were module globals (the script, the frame, its
  margins and type sizes, the footage folder) are one context object
  from `shotContext()`, passed first to every builder. Proved by hashes
  identical before and after, with no voice called: short-onegov through
  `episode.mjs render`, wide and Short (284 files: every segment, frame,
  card, both films, captions and meta, the same as three runs of the old
  code); softbank-975's shots through the extracted renderer directly and
  through a copy of `episode.mjs` whose narration throws (1,053 files
  wide, thumbnails included, and 1,041 tall, on synthetic footage that
  takes every footage branch), never `episode.mjs render` itself, because
  its release `script.json` predates the `narrator` field and `render()`
  would voice it; and every tag of all six episode scripts parsed and
  built to the same HTML in both frames. **A frame hash can move with no
  code change**: one run of the old code drew a chart's bars a few pixels
  differently (at most 6 levels in 255) from a second run of the same
  code, so a regression that differs from one baseline is checked against
  a second before the difference counts.
  **Two kinds for the re-cut** (2026-10-20, spec steps 3 and 4). `pop`:
  one to three words in Bricolage at weight 800, in a Void field box,
  left in the upper third and clear of the captions, landing in 120 ms
  as the width axis steps 75 to 100 (override 3); four transparent
  stills for the compose; Flash unless the shot beneath spends no Acid;
  it leaves once its word has been said and read (`popEnd`). `page`: the
  capture `tools/capture.mjs` wrote, found by the capture's own file
  name, cropped to the block that holds the words (below), ungraded,
  on Void under a Malachite mono label
  (the author where the page or the cut list's `by:` gives one, because
  fair dealing names the author the source gives (ss. 29.1 and 29.2),
  then the publisher and the date, or the day it was read; 28 px in
  the film and 30 in the Short, a long label smaller but never under
  the floor below, then on two lines growing up (more where two cannot
  hold it at the floor), broken between its parts so a date keeps its
  year, the dot between two parts left out where they break, so no line
  ends on it), an Acid box
  sweeping each phrase from the word in the narration that says it, one
  phrase lit at a time, and one linear 5 percent push-in from where the
  words start. A picture on a source's page is kept out (spec 2.3, row
  5, text only): one level with the words bounds the window as a
  neighbour's text does, the picture stops short of one above or below,
  and any still inside is covered in Void. One on the words themselves cannot be
  covered without them, so that shot is its quote card in the film and
  is left out of the Short; `pageView` decides it from the crop the
  render takes, and `check` asks the same function, so the guard is not
  a log line. On our own dark pages the bar is drawn, not blended
  (`litRect`): under each of its boxes a pixel's ink is its distance from
  the box's ground against the solid ink within three pixels of it, a
  pixel of Void or Bottle is none, and the bar is its colour moved
  toward Void by that share, so it is exact Acid wherever the page shows
  no ink, on Void, Bottle or a field of either, with the words Void and
  their own edges, as dark type reads under a light page's highlighter.
  It turns Flash, as exact, where the page's own Acid is in frame, so
  the shot still spends one Acid. Until 20 Oct it multiplied a grey,
  inverted copy of the page into the bar, which left it (167,209,0) over
  Bottle and (197,246,0) over Void, off the kit. **A bar's ends stop
  short of other ink** (`barEnds`, 20 and 21 Oct). Each end runs 0.14 of
  the line's height past the line's box (the box holds the words' side
  bearings, so a bar runs a pixel or two further past their ink), or
  past the last ink the bar takes where that runs beyond the box, but on
  the crop's own pixels it stops on a clean column before the first
  other ink (the next glyph, the next word, a rule). The pad had lit
  part of the colon after "numbers", of the colon after "print" and of
  the quote marks round "I Built ... $106.23" on our pages, and part of
  a comma or a full stop beside the words on six of others'. Other ink
  the pad would reach that is a mark (a comma, colon, full stop or quote
  mark: ink running, through gaps of one clean column, to two clean
  columns within three pads of the box, and reaching neither of the
  bar's first and last rows, as a rule down the side or the next line's
  ink would) is taken whole, and the pad runs on past it. Stopped before
  the mark instead, as on 20 Oct, the bar ended flush on the phrase's
  last letter while its other end kept the pad ("numbers" before its
  colon, "documentation" before its comma, "Starlink" before its full
  stop). A mark with no clean column between it and the phrase (a comma
  kerned into the last letter until they share a column or touch: The
  Markup's "network,", The Floor's "Alouini," and "page,", Seeed's
  ",powered", Geeky Gadgets' "ATAK,") cannot be parted from it by a
  straight end, so where a clean column ends it within two pads the bar
  takes it whole, rather than cut it in two, and runs the pad past it
  too. Each line's bar is drawn into the picture, not clipped over it:
  its own copy of the crop has the page's own box, the same left, top,
  width and height, clear but for the line's box, where it is the page,
  lit between the bar's ends and left as the page for three pixels past
  each, and is clipped to the line's box (`clip-path: inset()`), so the
  clip's ends fall on pixels the two pictures share and the bar's end is
  a boundary between two of the crop's pixels, which the frame resamples
  as it does the page. Clipped over the page at a fractional place, an
  end had mixed the bar, the ground and a glyph's edge in one pixel. On
  20 Oct the copy sat in a box of its own, set back by that box's place,
  so it stood where the page is only in sum: Chromium keeps each offset
  to a 64th of a pixel and rounds a background's top and bottom to whole
  pixels, and where the two sums fell either side of a half (Geeky
  Gadgets' "internet access via uplinks like Starlink", 115, and the
  protection table in Parallel's repository, 156) the copy was drawn a
  pixel taller than the page, its words half a pixel low and soft; and
  that box's overflow clip, rounded to whole pixels as well, took part
  of a row off a bar's top or bottom on our pages. The clip-path is the
  line's box as it stands. A light page's bar is the page multiplied by
  Acid in the same copy, no longer a blended box, so a picture's covers
  go over it. Measured on the pilot's 90 page inserts (84 in the film, 6
  in the Short, 17 of them quote cards), at each insert's first and last
  frame and each phrase's first fully lit frame on the film's grid (one
  exists for every phrase since `sweepPlan` starts a phrase only after a
  frame has shown the one before it whole: five phrases of The Floor,
  on lines 66, 125, 132 and 170 and two on line 62's card, were taken
  over on the very millisecond their sweep finished, never more than 96
  to 99 percent lit, the end of "for." and a full stop never lit, review
  of 21 Oct; the phrases after them start up to 34 ms later, or, where
  the shot is full, the sweeps before them up to 41 ms earlier, line
  66's 4 ms shorter): glyphs
  crossed by a bar's end
  (two of its pixels lit and two untouched, read against the same frame
  with the bars hidden) fell from 13 at b1aa369, the quote mark after
  "$106.23" and twelve commas and full stops on others' pages, to none
  at the 524 ends of the 160 lit frames of page shots; pixels more than
  3 levels from a kit colour or a mix of two on our own pages, where the
  other marks were cut only at their edges, fell from 93 to none; and on
  our 35 page shots every pixel of the bar two or more in from its edges
  with no ink within three is exact Acid (1,075 had stood one level off
  where two lines' bars met), and exact Flash on all 35 rendered with
  the bar forced to Flash (no shot of the pilot keeps the page's own
  Acid). Against 4934f65 (20 Oct): the shift that best matches each
  bar's words to the same words with the bars hidden is none for all 262
  bars, where six had been half a pixel low (on 115 and 156; b1aa369 had
  nine a quarter or half a pixel across, on our pages); pixels of
  others' pages lit by a bar whose green, which Acid keeps, differs from
  the page's by more than 2 fell from 28,748 to 24 at the lit frames
  first measured (single columns of three frames, at most 8 levels), and
  read again at the film's real frames from 28,772 to 10, in one column
  of one frame, at most 11 levels, where b1aa369 has none there (its
  blended box made such columns too, 8 pixels at an off-grid frame of
  line 107); none is visible; the first row wholly inside each of the 236 top and bottom
  edges of our pages' bars is full Acid along its middle, where 12 had
  been partly dark; ends with no more than a column of the bar past the
  phrase's ink fell from 19 to one, Seeed's ",powered", whose comma
  stands one clean column from the word before it; outside the bars
  nothing changed, and every first frame, every frame with the bars
  hidden and every quote card is as it was byte for byte. Outside the
  bars against b1aa369, others' pages moved by at most 10 levels in one
  strip of one first frame, where the old blended box, at no width at
  all, still made Chromium draw the page in a group of its own (b1aa369
  with the blend taken out draws that frame as this does), and by 1
  level along Chromium's raster tile seams, every 254 pixels, in ten
  more frames, which shift with whatever else a frame draws. A refused
  capture becomes the quote card with the same
  words, its highlighter held until the voice reaches them. Tried on The
  Floor's captures in both frames with every sample frame looked at, the
  first versions cut a wide table row at both ends, merged a row's two
  cells into one bar, doubled the Acid where a phrase ran into bold,
  pushed the words under the captions to dodge thumbnails, and took the
  first letter of each line off the left with the push-in; each is fixed
  and named where the code does it. **The crop snaps to the words'
  block** (`pageCrop` in `tools/lib/shots.mjs`, rewritten 20 Oct after
  the pilot's contact sheets showed a letter of the rail beside The
  Floor's parts table, the end of the card beside Morse Micro's MM6108,
  the KAUST abstract cut at the left, The Floor's sources list cut at
  its second column, and, in the Short, The Markup's ledger cut at both
  ends, where the 896 px panel held 448 CSS px). The capture records the
  page's layout for it: every visible line of text with its font size
  and block, the blocks as a tree with the borders they draw, whether
  they paint a ground of their own (a gradient, or a background colour
  that differs from what lies behind it) or cast a shadow, their
  largest rounded corner and their list markers, and the boxes it draws
  that hold no text (a search field, a painted panel, a rule down a
  side). The window is the words' paragraph, list item, term and
  definition, or row of a grid (a table, or a grid of divs: blocks of
  cells side by side that share their columns with the rows beside them,
  as Morse Micro's release notes are built), sized by its lines and shown
  whole across. A grid is one unit across: a row's window holds the
  whole grid, outer rules and all, and another grid level with the
  window is taken in whole or left out, never cut through a column (an
  edge inside Meshtastic's preset table cut its left rule and first
  column, 20 Oct). A grid is as wide as what its rows show, their text,
  the rules and grounds their cells draw and their bars, not the empty
  end of a row box wider than its columns (The Floor's bar chart sat left
  of a 42 px strip). The margins are two ems of the words' type (24 CSS
  px at least) that stop halfway to anything of another block level
  with it: text, a
  picture, an inline SVG chart with the figure that holds it, a box
  drawn with no text, a box another block paints or frames. A box that
  holds the words and paints its ground or rules a side keeps the
  margins inside it, half a pixel and its corner's radius clear, so no
  margin shows a change of background. Above and below, text the edges
  would cut is left out, and so is any box they would halve: a top or
  bottom edge halves a fill, a frame or a rule down a side, a side edge
  a fill or a frame; a rule across alone is a line, and a table's cells
  are its grid, kept or left out as rows. A row that draws (its ground
  or rules, or its cells') keeps what it draws whole or leaves it out,
  never halved (an edge may stand a few pixels into the next row's box
  where that row draws only a rule below; the words' own row and the
  rows of the head that names them are held by where the window is
  placed, not by this rule): kept by its
  lines alone, Meshtastic's framed cells ran
  off the picture's bottom with no rule under them (line 131) and The
  Floor's parts table ended on a row with its rule left out (55 and 61).
  The window moves to keep such a row whole where it can, as it does for
  a line, so line 131 now ends under "Medium Range / Turbo" and the parts
  table keeps its last row's rule. Text above the heading that
  opens the words' section (the nearest heading above them in the page's
  order, a heading element: the capture records no weight, so a bold
  paragraph set as a heading is not one, and Cisco's "Overall"
  paragraph stays over its "Supported WPA3 Modes", line 154) is another
  section's and is left out, and so are the next
  heading below them and what follows it (RSS-247's "6.4 Hybrid Systems"
  and its lead-in under 6.3.2's words, the list's items cut off; the
  "Haven 1" section under Parallel's price paragraph). So is the tail of a list
  whose first item the picture leaves out (RSS-247's 6.4 list over 6.5's
  heading), the start of one whose last item it leaves out below the
  words, and the block just before a list it leaves out whole, the
  list's lead-in. A list item is one block with the lists inside it,
  shown whole or not at all (RSS-247's item c ended the picture on
  "comply with the following:" with its sub-items left out). A figure's caption, a table's caption or head, and a
  grid of divs' head (a framed row above its rows that shares their
  columns) stay in the window with the figures they name where the
  window can move to keep them, the words leaving the band if that is
  what it takes. Where the words carry a figure nothing in them names
  (Morse Micro's "24 30", whose units and directions are in the head),
  the zoom also drops toward the floor to hold both (2.25 to 1.95 there),
  and where even the floor cannot, the shot is its quote card
  (`unnamed`). The same holds wherever the words sit in a grid whose
  head names its columns, bare figure or not, because the picture shows
  the other columns too (Meshtastic's "11 / 2048" and "4/5" with nothing
  to say they are a spreading factor and a coding rate; "not stated" in
  The Floor's parts table with no STATED over it). Held so, the zoom is
  the largest that keeps the words in the band too, and where none over
  the floor does, the floor itself, which holds them highest: the parts
  table's antenna row (line 68) drops from 2.8 to 2.69, its words from
  72 to 78 percent of the panel to 69 to 75, and its Battery hat row
  (lines 70 and 139), 275 CSS px under its head, would need 2.08 against
  the 2.27 its 11 px head reads at, so it drops to 2.27, its words at 71
  to 81 percent where at 2.64, the largest zoom that fit, they sat at 81
  to 94, under YouTube's captions. Another grid's rows come with their head too, or are left
  out: Parallel's table of PHY rates over its 40 to 60 percent line
  could not be shown whole, because the line's quote bar keeps the
  window inside the table's left rule, so the line shows alone. Text the
  side edges would crowd is taken in whole where the window can grow;
  where it cannot, the window moves across within the other side's
  margin before a line is left out (Cisco's heading was left out 1.5 px
  inside the edge with 28 px to spare on the right), and a window at its
  full width moves toward equal margins where the side it moves to is
  clear. Both measure from the ink the picture shows, its lines and the
  boxes drawn whole inside it: the shift that brought Cisco's heading
  back, measured from the text alone, left its framed note's right rule
  4.8 CSS px from the edge, and now the note and the heading stand 9.4
  px from either side. A rule across the picture (a heading's underline, a ruled row)
  ends inside it with the same margin on both sides or runs off both,
  never one (Parallel's heading rules ended 1.7 px from one edge and
  10.3 px from the other); one wider than the widest window, with its
  block's own text at its end, can do neither, and that block is left
  out. The highlighter's boxes are the glyphs' line boxes: a Range also
  returns the box of every element it wholly holds, and a phrase across
  Morse Micro's cells lit a whole cell as an Acid slab, one across a bar
  of The Floor's own figures the bar's empty track. Every line
  shown stays whole through the push-in, and the picture's top and
  bottom stand halfway between the last line it keeps and the first
  thing it leaves out, at most two ems past the line; where the window,
  the push-in or a box sets an edge instead, a line nearer it than a
  quarter em of the words' type is left out too, so none ends flush on
  the edge. The push-in never eats a margin: the picture starts inset by
  a twentieth of its way to where the words start, meets the panel's
  edge only on the last frame, and the zoom shrinks to allow it. The
  rest of the panel is Void.
  **A page shot's type is never under 11 pt on the phone the frame
  fills**, the smallest size Apple's interface guidelines call legible:
  30 px in the Short (1,080 px across a phone 390 pt wide) and 25 px in
  the film (1,920 across the same phone on its side), at most 45 and
  42. That is every line in the picture, not only the words: the zoom
  is at least what reads the smallest line of the blocks shown whole (a
  line of citation marks in 12 px under The Floor's 18 px prose, lines
  44 and 159), and another block's line that would still show smaller
  is left out with what stands beyond it (The Markup's 11 px byline,
  line 125; Morse Micro's 12 px Previous and Next under its version
  table, 168; a 13.6 px code link in GitHub's list under Parallel's
  firmware line, 63, whose list and its lead-in then go too). Our own
  type on the shot keeps the floor as well: the label (above), and on a
  page shot's quote card the source line, set as the label is and
  wrapping inside the card; the card's words are 84 and 62 px, and in
  the Short they wrap as the source line does, inside the panel's
  width, clear of the right 120 px where the Shorts buttons stand (The
  Markup's ledger card set "an 8" out to x 1,014.5 until 20 Oct). An
  episode's quote card is not a page shot and keeps its 22 px source
  line and its width. A block that cannot be read whole at that size gives way to the
  cells that hold the words, with the row's label (its first cell) and
  everything between them, because a figure is not shown without the
  name of its row (The Markup's ledger showed its 43.3 cell with no
  "Throughput"), scaled to fit, and where those are too
  wide as well, the shot is its quote card (`wide`), never a picture of
  lines cut at both ends; one that stays a sliver of its page at the
  largest size, even with the blocks around it, is its card too
  (`small`). A capture made before the layout was recorded fails
  `check`, which says to shoot it again. `pageView` returns both cards
  and `check` notes them, and a
  page shot's card sweeps every phrase on its own word, one lit at a
  time, as the page would have (it lit only the first). On The Floor
  that puts seventeen page shots on their cards: five of the Short's six
  (a Geeky Gadgets list item and The Floor's own paragraph run 625 and
  738 CSS px of 18 px type where the Short can show at most 512 whole,
  Morse Micro's spec row 628 px of 13 px type where it can show 370, the
  ledger's two rows carry an 11 px head, which leaves 313 for a 364 px
  cell, and the ledger's 43.3 cell with its row's label runs 1,080 px of
  15 px type where it can show 427), while Parallel's price paragraph
  shows the page; and in the film the four arXiv shots (the abstract's
  lines run 1,093 CSS px of 13.6 px type, in a 1,100.8 px blockquote,
  where the film can show at most 870 whole), OpenMANET's support table,
  Seeed's price box and the three ledger shots of the 43.3 cell (lines
  33, 45 and 161: the same 1,080 px, more than the film's 960 of 15 px
  type), and three whose table's head cannot be held with them
  (`unnamed`): Meshtastic's Long Fast row (line 130), 650 CSS px from
  its head, which would take a zoom of 1.14 where the floor for its 16
  px type is 1.56, and the
  parts table's Wi-Fi dongle and Total rows (72 and 75), whose 11 px
  head needs a zoom of 2.27 where 338 and 422 px from head to row allow
  2.16 and 1.74. Cards
  that run back to back with no cut between, in the film as in the
  Short, are set on the two grounds in turn: the second on Bottle, its
  source line Flash, so it reads as a new picture and not the first one
  changing its words. In the Short that is the Geeky Gadgets card after
  the ledger's 43.3 cell (lines 33 and 34) and the ledger's rows after
  The Floor's paragraph (44 and 45); in the film, the quote card on line
  174 after the one on 173 (`renderSegment` does it for any two quote
  cards in a row, a page shot's card among them; no episode script has
  two). A statement card beside a quote card is not one of those, and
  both stay on Void, as runs of statement cards do: in the film lines
  74 and 75, 88 to 90, 129 and 130, 172 and 173, and 176 and 177, two of
  them (74 and 75, 129 and 130) new since the parts table's Total row
  and Meshtastic's Long Fast row became cards; whether those joins want
  the other ground is the owner's call. Every tag and builder of the six
  episode scripts still parses and builds byte for byte as before, and
  short-onegov renders to the same 284 hashes. The cut lists (spec step
  2) place them, and so, since 26 Oct 2026, does an episode script
  (`source/episodes/FORMAT.md`), which refused both until then. A
  `[[pop: WORD]]` in a paragraph lands on its next word, as every
  episode tag does (no 0.15 s lead, which is the re-cut's rule for cuts
  into a finished film), leaves by `popEnd`, is Flash where the shot
  beneath it or an overlay spends Acid (`ACID_KINDS`, exported from
  `tools/lib/shots.mjs` and read by the re-cut and the episodes alike; a
  slate's key line counts, so a pop over a slate turns Acid once the
  footage arrives) and Acid otherwise, and is composed as one sparse
  ffconcat layer of its four stills over the `over` chain, as the re-cut
  composes its pops, because a looped PNG input is decoded again for
  every frame of the film. Measured on this sandbox's four cores (26
  Oct 2026; a 60 s 1080p clip through the final mix's own encode, three
  runs of each): the encode alone took 21 s, with four looped full-frame
  stills 49 to 50 and with sixteen 146 to 149, about 7 to 8 s a still
  for each minute of film, where one sparse layer holding the same
  sixteen stills took 23 to 24; so four stills a pop over twelve pops
  would have cost a ten-minute film an hour, and the layer costs it
  under half a minute. Two pops on one word fail the check, and a
  pop left under half a second before the next tag (which ends it, as
  it ends every overlay) stops the render before its first frame, as
  the re-cut refuses one. A `[[page: s3 | hl: words | by: Author]]` is cut through
  `pageHtml` like a cut list's, so each frame shows the page or its
  quote card by `pageView` (the Short's narrower panel turns a wide
  paragraph into the card, as it does in a re-cut); its source is the
  script's `# Sources` line (the label numbers it as the description
  does, by its place in the list, and sets its ISO date as the editions
  set one), `by:` on the tag names the author where the line cannot
  (`parsePage` carries it and does not shoot it, so a credit changed is
  not a page captured again), and `check` reads the capture without
  stopping: a tag with no capture yet is named with the command that
  shoots it, a refused one is a warning (the shot is its quote card), a
  failed one or an unboxed phrase an issue, a byline the credit leaves
  out a warning, and each frame's card verdict a warning, so a person
  knows what the film will show before it renders. The description is
  unchanged: the sources list already carries the page's publisher,
  title, date and URL, and whether it should also name the page's
  author, as a re-cut's does, is open. `episode.yml` has no capture step
  yet, so a page tag renders only where someone has run
  `tools/capture.mjs` on the script first (locally, or a step to add
  that files the pages as `recut.yml` does). Tried on a scratch script
  with one page tag on a Wikipedia article (its robots.txt allows the
  agent; four pictures painted out) and two pops: `check` named the
  missing capture, then passed with the two warnings above; built and
  rendered in both frames through the segment renderer (the film shows
  the page at zoom 2.38, the Short its card), `check-brand` clean on
  both; and the whole render composed through `episode.mjs render`
  with a synthetic narration cache and `uv` off the PATH, so nothing
  could speak. The six scripts still build byte for byte (611 HTML
  hashes) and short-onegov's shots render to the same 196 hashes. A
  review the same day found two things the build had left apart: a cut
  list's page tag may carry `by:` since `parsePage` took it, and its
  label named that author while the check's byline warning and the
  description's credits still read the credit without it, so `checkPage`
  and `creditOf` in `tools/cuts.mjs` pass the tag's `by:` to `pageSource`
  as `pageHtml` does (the source line's `by:` still wins); and the
  episode's `checkPage` had dropped the cut list's guards for our own
  page, so it holds them: a `self <slug>#<id>` capture older than the
  page as built (its sha256 against `dist/`) warns, one shot before grey
  text fails, and a self shot naming no page of ours fails in `check`,
  where the capture would have refused it under a stem the check never
  looked for (an episode's is hashed with `ep-<slug>`), each tried on a
  scratch script against The Floor's built page. The review's aside, not
  this code: on the Wikipedia capture `pageCrop` kept the next heading
  below the words, which Wikipedia wraps in a `div.mw-heading`.
  **`tools/capture.mjs` shoots the pages a film shows** (2026-10-20), the
  capture half of the `page` shot: a cited source in Chromium, 1440 CSS px
  wide at twice the pixel density, under the honest agent
  `AedificareFilmBot/1.0`, its text drawn grey (`GREY_TEXT` in
  `tools/lib/film.mjs`: Chromium's own LCD antialiasing put a blue and
  an orange fringe on every glyph, colours the kit does not have; on the
  pilot's 34 captures of our own pages, 4,996,131 pixels stood more than
  30 levels from any kit colour or mix of two, and shot grey none stands
  more than 3, every record of their layout the same; the record says
  `greyText`, and a capture of our own page without it fails `check` and
  is listed by `pages` to shoot again), the quoted words (`hl:`) found across text
  nodes and boxed, one PNG and one JSON a shot in
  `brand/youtube/<slug>/pages/`; `self <n>` shoots our own built page from
  `dist/` with the network closed. It refuses, records why and asks that
  host nothing more in the run: YouTube and the streaming services (never
  fetched, not even a redirect hop), a robots.txt that disallows it, a bot
  check, WAF challenge, sign-in wall, paywall or ad-blocker prompt, and a
  check that clears itself by script. Every connection goes through a gate
  on 127.0.0.1 that refuses those hosts and this machine's own addresses,
  because a Playwright route never sees a redirect hop and Chromium skips
  any proxy for loopback unless told not to (both found while building
  it). Its own addresses however they are spelled (review, 20 Oct): a
  loopback, private, link-local or reserved literal, IPv4-mapped ones
  included (`::ffff:7f00:1` passed the first version's pattern), and a
  name that resolves to one (`localtest.me`, `127.1`), which the gate
  resolves itself before every connection and then connects to the very
  address it checked. Behind an upstream proxy (this sandbox, which has
  no DNS of its own) a name this machine cannot resolve goes to the
  upstream by name, and lands on the upstream's network, not this
  machine's. Clean mode hides cookie banners and ad slots by CSS and blocks
  nothing: blocking ad servers put up Geeky Gadgets' ad-blocker modal over
  the very sentence the shot was for. Words a reader cannot see fail
  instead of passing: in a collapsed part of the page, or under an overlay
  (the topmost element at each box must be the words' own). A closed
  `<details>` holding them is opened, as a reader would open it; a
  script's accordion is not. Tried on The Floor's sources on 20 Oct: 12 of
  the 13 that may be fetched shot clean, eCFR refused at its "Request
  Access" gate, both YouTube sources refused unfetched, and source 11, The
  Markup, shot from the build. Morse Micro's "not the data rate" line
  failed as hidden (it is in a collapsed FAQ answer), so its spec row was
  shot instead. For the render's crop, each phrase also carries its
  block, the paragraph or table row it sits in, the page's layout is
  recorded (every visible line of text, cut by whatever clips it, with
  its font size and block; the blocks as a tree with their padding,
  drawn borders and list markers; the boxes the page draws that hold
  no text; visually hidden text left out), and the pictures in view
  are counted at any opacity (a lazy image fades in from 0), down to
  32 px (Geeky Gadgets' sidebar thumbnails are 75 by 42 and were missed
  at 48), cut by every ancestor that clips them (a carousel's hidden
  thumbnails reported boxes over the text beside it), and counted again
  once the PNG exists. Then, on someone else's page, every one of them
  but inline SVG is painted Void in the PNG itself (`masked` counts
  them), because that PNG is what the film is cut from and what
  `recut.yml` files on a public release: no copy of a third-party
  photograph exists to publish (review, 20 Oct; spec 2.3, row 5).
  Given an episode's script instead of an edition's slug (26 Oct 2026),
  it reads the script's `# Sources` lines for the URLs (a source is
  `s3`, not a number), shoots every `[[page: ...]]` tag in it (or the
  ones `--page` names) under the same refusals into
  `brand/youtube/ep-<slug>/pages/`, checks no source number against an
  edition's list, because an episode has none, and takes `self` only
  as one of our pages named whole (`self edition-03#ledger`).
  **`tools/cuts.mjs` re-cuts an edition film without a word spoken
  again** (2026-10-20, spec step 2). A cut list,
  `source/film/<slug>.cuts.md` (its format is the tool's header), names a
  phrase of the release's own `narration.json` and the shot that lands on
  it: any kind of `tools/lib/shots.mjs` but a clip, which carries its own
  sound. Its front matter pins the narration and the clean film and Short
  by sha256, because the anchors are word times and the inserts are cut
  into those exact frames. A cut lands 0.15 s before its word on or
  before the frame, and holds until the next cut, `until:` or `hold:`;
  the clean render's computed shots win unless the line says `over: base`;
  nothing covers the opening field, the title's words, the record or the
  dove. `check` holds the spec's rules before any frame: every number on
  a computed surface on the built page's text (spelled numbers read as
  numbers, the page's SVG left out, so a path's 44.27 is not a fact;
  `tools/lib/facts.mjs` since 26 Oct 2026, the one reading the episodes'
  edition films share, and The Floor's list gets the same verdicts from
  it; since the same day a quote card's words are read for their numbers
  and its `by:` line is held to the page's words, where a quote had been
  passed over, and The Floor's four pass), a pop's words too; every page shot captured (our own page with grey
  text) and its words boxed; twelve
  words on a card, its label counted with it, three in a pop; the
  owner's footage named in `footage/credits.txt` or refused, its line in
  the description and the frame line saying the footage is not computed;
  a page shot's credit naming the page's author, and a `by:` on the
  source line that leaves that author out said; one Acid at a time (a pop over a shot
  that spends one turns Flash, and a chart stars one row, because every
  star is drawn in Acid); no footage in a Short (left out and
  said); the grammar's warnings and failures (spec 2.2); and each
  description, credits included, in YouTube's limits and still naming the
  channel's voice. `render` cuts each insert to a segment of exactly its
  frames, its type drawn grey (`GREY_TEXT`; measured on the pilot's 148
  inserts and 13 pops, 435 frames (each insert's first and last, each
  phrase's lit frame, each pop's four stills, someone else's page left
  out), the pixels more than 3 levels from a kit colour or a mix of two
  fell from 7,776,649 with LCD text to 93, each where a
  highlighter's end, at its start or its end, cut a glyph beside the
  phrase on our page and three kit colours met in one pixel, 89 of them
  off before too, and from 93 to none once a bar's ends stopped short of
  other ink (`barEnds`, above; all 93 were on the page inserts' frames,
  measured again there); the edition
  films and the episodes still render as they did), the clean render between them seeked half a frame early so the
  first frame is the one asked for, joins them without a re-encode,
  overlays the pops as one sparse layer, and encodes once with the clean
  render's own sound copied packet for packet (checked after, with the
  frame count). Its buffer is six seconds of the 8 Mbps cap: at the
  encoder's 16 Mbit the opening field's dense curves, already compressed
  once, came out in blocks. It writes the re-cut under the release's
  usual names with `meta.json` (marked `recut:` with the list's hash),
  the sheets and `cuts.json`, each insert with its frames, its capture
  and its credit line. `suggest` drafts a list: a page line per timed
  citation mark, every rose run over 3.6 s with its words. `pages` names
  the page tags with no capture yet. Tried on a synthetic list over The
  Floor's first minute: the Short and a 60 s window of the film, every
  piece on its frame and every pop on its frames, proved frame by frame
  against the clean render and the joined picture, the sound identical,
  and the refile writing the same description the render wrote.
  **`source/film/the-floor.cuts.md` is the pilot's list** (2026-10-20,
  spec step 8): 148 inserts over The Floor's clean render, 84 page shots
  (40 of our own pages, The Floor's and The Markup's, shot offline from
  the build; 44 of twelve outside sources), 32 cards, 10 charts, 9
  figures, 4 quote cards and 9 pops. Measured with R4's method on the
  film: the rose with nothing over it falls from 65.6 to 5.1 percent of
  the time and its longest run from 37.6 s to 3.1, new pictures rise from
  7.9 a minute to 16.9 and cuts from 13.8 to 21.7, and the longest stretch
  in the body with no new picture falls from 40.9 s to 10.6. The Short
  falls from 49.3 percent rose to 3.1. Choices, so nobody undoes them by
  accident: the list's hold is six beats, 5.4 s, the point at which a
  picture reads as standing still; cards keep to four words (sync rule
  2); a card that sets the builder's own words names him under them
  ("WHAT HE CALLS IT", as his figure card does), because a frame of
  "ENTERPRISE. END TO END." alone would put the claim the edition
  corrects in the brand's voice (review, 20 Oct); sound effects and the
  cold open are left out, both the owner's call; the two YouTube
  sources are never fetched: 16 appears as quote cards of the words the
  edition quotes, which a person confirms before upload, and on one
  chart's source line (his phone test, line 175 of the cut list), and 01
  only as a chart's source line; eCFR (09)
  answered with its wall and is not shown.
  Captures that failed and were replaced, not forced: Morse Micro's AES
  and SHA-2 line is hidden like its FAQ, Meshtastic's band line sat under
  its sticky sidebar, and The Floor's own table caption is visually
  hidden. ISED answered 502 once and shot clean in a new run. The whole
  film was rendered here once (32 minutes) and every insert looked at;
  that caught a first sweep that fell outside its crop (two Meshtastic
  rows a table apart, now two shots), a wide table cut at its last
  column, a stat block cut mid-column, type too small to read in The
  Markup's sources note, and two pops laid over other type (a chart's
  title, a page's label), each replaced. That render came before the
  list's last edits, so seven inserts changed after it went unseen, one
  of them a chart that starred two rows, two Acid bars in one shot
  (review, 20 Oct; it stars one now, and `check` fails a second star).
  After the review's fixes the film was rendered again (31 minutes) and
  every insert looked at again, one frame each on contact sheets, the
  two inserts the review changed also full size on both sides of their
  cuts. What those sheets showed at the edges of page shots (a letter
  beside the parts table, lines 55 and 65; the neighbouring card beside
  the MM6108's, line 85; the KAUST abstract cut at the left, line 95;
  the sources list cut at its second column, line 191; the ledger cut
  at both ends in the Short) was fixed in the crop, not the list
  (above); every page shot was then captured again and its frame in the
  film and the Short rendered beside the old one, all 90 looked at, and
  the Short and the whole film re-cut through `cuts.mjs render` and
  looked at on contact sheets. A skeptic's pass over those frames found
  what the crop still let through (a neighbour's SVG chart under
  Meshtastic's note, the note itself halved because it drew one rule and
  a fill, not a frame, Seeed's gradient button sliced and a grey strip
  down the left of its product text, margins the push-in ate to the
  panel's edge, the bench's unit caption left out, and this file's
  arXiv figures), each fixed in the crop and the capture as written
  above; every page shot was captured again and all 90 inserts rendered
  at their first and last frames beside the old ones and looked at. On
  the frames of other people's light pages a pixel check found ink
  under 8 px from the picture's edge in 12 film frames and 1 Short frame
  before and in none after, and a picture already at the panel's edge
  on its first frame in 38 film inserts and 1 Short before and in none
  after. A recheck of those frames found two regressions (an edge inside
  Meshtastic's preset table, Cisco's heading left out where a 2 px move
  had room), three older faults (Morse Micro's release notes without
  their head, an Acid slab over a cell, the tail of RSS-247's 6.4 list
  over 6.5) and heading rules that ran off one side of Parallel's page,
  each fixed in the crop as written above; all 90 inserts were rendered
  again at their first and last frames beside both earlier passes and
  looked at. The pixel check then found no first frame at the panel's
  edge and one frame with ink under 8 px from the picture's edge: the
  last of line 63, where the highlighter stands 6 px in, because the
  Firmware heading's rule keeps margins of 6 CSS px a side at the type
  floor. Two more skeptics then read those frames for regressions and
  for whether the fixes held, and found type under the floor beside the
  words, another section's heading and lead-in under them, a list item's
  lead-in with its sub-items cut off, rows shown without their table's
  head, a framed note's rule 8 px from the edge after the shift for
  Cisco's heading, and a bar chart left of an empty strip; each is fixed
  in the crop as written above, and all 90 inserts were rendered again at
  their first, middle and last frames beside the previous pass's (30
  changed, 60 pixel-identical) and looked at. A third pair found a row
  of Meshtastic's framed table cut by the picture's bottom (line 131,
  and in milder form the parts table's last row without its rule, 55
  and 61) and the Battery hat row's words under the captions (70 and
  139); each is fixed in the crop as written above, and all 90 inserts
  were rendered again at their first, middle and last frames beside the
  previous pass's (6 changed: 55, 61, 68, 70, 131 and 139; 84
  pixel-identical) and looked at. One thing seen there stays
  the list's:
  the pop "THE CHANNEL" (line 39) stands over the top lines of the
  Parallel page shot under it in the Short. **The spec's targets disagree
  on this film**: a rose at 10 percent or less needs about 130 inserts,
  and the clean render already brings 7.9 new pictures a minute, so new
  scenes land near 16 a minute against the spec's 6 to 10. The list keeps
  the rose target, because the rose is what the owner asked to see less
  of; the scene rate is the owner's to judge on the preview. One of its
  page shots, Seeed's $14.99 (line 67), is its quote card in the film:
  the price box is a sliver of the product page at the frame's largest
  type (`small`).
- `.claude/skills/youtube/SKILL.md`: how a session runs the channel (the
  credentials check, list and sync, the private lock and the two upload
  routes, what must be true before a render goes up, analytics, quota,
  failures). A project skill, so every session on this repo loads it; it
  restates no decision, it points here.
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
  by `.github/workflows/film.yml`, filed by `.github/workflows/release.yml`
  under the repo's Releases as `film-<slug>`, and downloaded from there;
  or rendered on the owner's Mac with the same command.
- `.github/workflows/verify.yml`: build (with the three checkers), the
  audit through `tools/check-audit.cjs`, actionlint over every workflow
  (pinned by checksum; the film workflows run unattended and no longer
  prove themselves on a push), `tools/film-meta.mjs --test`,
  `tools/test-narrate.py` (the narrator's number normaliser on every money
  and unit form the pages print, added 2026-10-26 when "$1 billion" was
  found to have reached three released films as "1 dollars billion": The
  Countersign seven times, The Markup four, The Subtraction once; the
  normaliser now lets the dollars wait for a scale word that follows as
  its own token; the released audio is unchanged until those films are
  rendered again, the owner's call by credits), sweep, and
  `tools/films.mjs --check --online` (the site's film links against their
  releases now), on every PR and push to `main`.
- `.github/workflows/film.yml`: manual dispatch, `slug` and `format`
  inputs, and callable (`film-queue.yml`). Renders a narrated film on a
  clean runner (build, Playwright, ffmpeg, espeak-ng, `uv`) and keeps
  `brand/youtube/<slug>` as a 90-day artifact, because the build sandbox is
  ephemeral and can hand back at most 30 MB while a 14-minute 1080p film is
  a gigabyte. Renders the Short from the same narration and files both
  through `release.yml`. It does not upload: `youtube.yml` is the one
  uploader. The Gemini chunks it hears are kept in the Actions cache under
  `narration-<slug>`; when the day's quota runs out it ends green with a
  warning and files nothing, and the next run continues from the cache.
  With `skip_voiced` it does nothing for an edition whose release already
  names the voice. It no longer runs when the file itself changes: a proof
  render spent a day's quota (2026-10-17). It keeps the voice alone as
  `narration.flac`, which `release.yml` files, because the stem a re-cut
  that adds time would need lives otherwise only in the 90-day artifact.
- `.github/workflows/film-queue.yml`: every morning at 08:20 UTC runs
  `film.yml` once per published edition from `src/lib/editions.mjs`,
  oldest first, one at a time, with `skip_voiced`, so every edition not
  yet in the channel's voice is rendered and filed; once every film is
  voiced a run is seven quick skips. Written for Gemini's ten requests a
  day; on ElevenLabs one run can voice them all, and the schedule stays
  as the net for new editions and for a run stopped by the credits.
- `.github/workflows/release.yml`: **the filing system for films.** A
  GitHub Release per edition named `film-<slug>`, holding the film, the
  Short, captions, sheets, meta and thumbnail as assets: permanent where
  Actions artifacts expire in 90 days, one URL per file, **under 2 GiB
  per asset** (GitHub answers 422 at 2,147,483,648 bytes), free on a
  public repo, listed under the Releases tab. Every render replaces the
  assets and the notes become the latest upload sheet. Called by
  `film.yml` after each wide render; dispatchable by hand with a slug and
  a finished run's id to file a render that predates it. The owner's
  question (2026-09-24): "where can you put the video for me, we need a
  filing system"; the answers considered were Drive (needs OAuth again),
  Vercel (a static site's deploy is not a store) and Releases, which
  needs nothing and is already beside the code. **The limit bit once**
  (2026-09-25): The Snapshot Problem's 14-minute film left an uncapped
  CRF 20 encode at 2.34 GB, the upload was refused and, because every
  file went up in one `gh release upload` call, so was everything after
  it. Two fixes, both kept: the encoder in `tools/lib/film.mjs` caps
  H.264 at 8 Mbps (`maxrate`, YouTube's own recommended rate for 1080p
  SDR, which YouTube re-encodes anyway; under the limit until a film
  runs 35 minutes), and the release job uploads one file per call and
  transcodes any video still at or over the limit to the same cap before
  uploading, so an old render can be filed without an hour's re-render.
  The Closest Humans' film was 2.03 GB, a near miss that the cap now
  makes impossible. **The clean render is filed twice** (2026-10-20): a
  fresh render also goes up under base names
  (`<slug>-film-base-1920x1080.mp4`, `<slug>-short-base-1080x1920.mp4`,
  hard links, so nothing is copied) with `narration.flac`, and nothing
  else writes those names. A re-cut is filed with `recut: true` under the
  usual names with its `cuts.json`, and the job refuses one that carries
  a base file or the stem. Because every upload clobbers, a re-cut filed
  under the usual names and cut again would have composed over itself;
  the base names and the cut list's sha256 pins make that impossible, and
  a page corrected and rendered again refreshes the base, which the old
  list's pins then refuse. A fresh render removes a `cuts.json` left by
  an earlier re-cut. Three guards from the review of 20 Oct: without
  `recut: true` an artifact that is a re-cut (a meta naming a cut list,
  or a `cuts.json`) is refused, because filing it the fresh way
  hard-linked the composite under the base names and deleted its
  `cuts.json`; with it, the job reads the release's `narration.json` and
  base files again (GitHub's own sha256 of each asset, or the bytes
  hashed where an older asset has none) and files nothing unless they are
  still the ones the cut list pins, so a render filed while the re-cut
  ran is never covered by a composite of the render before it; and the
  filing job holds `film-<slug>`, the render's and the re-cut's group,
  so no two of them write one edition's release at once. The group sits
  on the job, not on the callers, because a called workflow's group
  equal to its caller's deadlocks; a job waiting on the group can be
  replaced by a newer one, and the pin check holds whatever order they
  run in.
- `.github/workflows/recut.yml`: manual dispatch, `slug`. Cuts the film
  and the Short again from `source/film/<slug>.cuts.md` with
  `tools/cuts.mjs` over the base files it downloads, captures any page
  shot not yet filed on the Release `pages-<slug>` (and files what it
  captured; a refusal is asked again next run), checks with `--online`,
  and files through `release.yml` with `recut: true`. That release is
  public, so what it files of someone else's page is the PNG the film is
  cut from with every picture painted Void (`capture.mjs`, above), and a
  record that does not say so is not filed: chosen over keeping the
  captures only in an artifact or the cache, which expire and would make
  a later re-cut shoot the pages again and show something nobody
  checked, and over filing only the records, which would do the same;
  our own pages are filed whole. No secret reaches
  it, it never runs `film.yml` or `tools/generate-film.mjs`, and nothing
  in it can speak, so it cannot spend a credit.
- `.github/workflows/episode.yml`: manual dispatch, `slug` input. Checks
  the episode script online, downloads the owner's footage from the
  Release `footage-<slug>`, renders with `tools/episode.mjs`, and files
  the film, captions, thumbnail, sheets and the still-missing shot list
  under the Release `film-ep-<slug>` through `release.yml`. With the three
  YouTube secrets set, a dispatched run also puts the film and the Short on
  the channel as private (`upload=film`), or, with `upload=update` and a
  `video_id`, sets the generated title, description, chapters, captions and
  thumbnail on a video the owner uploaded by hand (not locked by the API
  audit); a push never uploads. The script format and the process are
  `source/episodes/FORMAT.md`.
- `.github/workflows/film-meta.yml`: manual dispatch, `slugs` and `dry`
  (true by default). Rebuilds `meta.json`, `meta-short.json` and both
  sheets on each `film-<slug>` release from that release's own script and
  narration, and retitles the release; nothing reaches YouTube, which is
  `youtube.yml action=sync`'s job, dry first. Written 2026-10-20 so a
  title or description changes in `src/lib/editions.mjs` and reaches the
  channel in minutes, at no render and no voice credits. It downloads a
  re-cut's `cuts.json` too, so the refile keeps its credits.
- `.github/workflows/seed-narration.yml`: manual dispatch, `slug`,
  `run_id` (the `film.yml` run whose artifact `film-<slug>-wide` carries
  the voice; artifacts last 90 days) and `render`. Downloads that
  artifact, restores the edition's narration cache, runs
  `tools/seed-narration.py` with the voice's settings read from the
  account (the key is never used to speak), prints the credits used and
  the reset date in the job summary, saves the cache under
  `narration-<slug>-…`, and with `render=true` calls `film.yml`, which
  restores that cache by its prefix and voices only the blocks the seed
  left out. Written 2026-10-26 for the three films that carry "1 dollars
  billion" (The Countersign from run 39031456682, The Markup from
  39159409713, The Subtraction from 39159416466), whose caches GitHub had
  dropped after seven idle days: whole re-voicings were about 5,000
  credits, the changed blocks a few hundred.
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
  Flash), nothing explains what the entity does. (Since 21 Oct 2026 an
  edition with a public film carries its thumbnail there, whose one word
  or figure is Acid below the probe's "at scale"; whether that still keeps
  this rule is the owner's to judge by eye. Decisions log.)

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
  YouTube's inauthentic-content rule (renamed and clarified 15 July 2025,
  not 2026 as first written here: YouTube's monetization policy page,
  read 20 Oct 2026; in YouTube's own words, no change in the underlying
  policy) disqualifies
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
- **The bed, the Short, the upload** (2026-09-24, owner: "continue until
  it's ready to ship and make money with"). Three gaps between a film in
  an artifact and a channel that earns. **The bed**: the owner asked for
  soft piano; the builder cannot download from the owner's YouTube Audio
  Library, and a sampled track would put a third-party licence in the
  file. So `tools/bed.py` computes one, as the rose is computed: a sparse
  piano-like line (six partials, the higher ones decaying faster) on an A
  minor pentatonic, a note every two to four beats of 900 ms, a low root
  held under it, all seeded by the edition's seed so each edition has its
  own and always the same one, running from the first frame to the end of
  the record and fading before the dove, which stays silent. Mixed under
  the voice at half gain after the voice is normalised to -16 LUFS. It is
  on by default; `--music none` drops it and `--music <file>` replaces it
  with a licensed track. The owner has heard a 75-second sample and not
  yet ruled. **The Short**: `--short` renders, tall, the cover and section
  00 (every edition opens on one number and its source), then the record
  and the dove, cut from the same narration with the voice and the bed cut
  the same way (`segments` in the encoder), capped so section 00 ends
  inside YouTube's three-minute Shorts ceiling; its captions, sheet and
  meta are its own. Research said Shorts are a separate system and not a
  funnel, so the Short is the channel's presence in that feed and not a
  trailer. **The upload**: `tools/upload-youtube.mjs` reads the render's
  `meta.json` (title, description, files, category 28, licence
  `youtube`, not made for kids, no synthetic-media flag because none of
  the listed triggers apply) and does a resumable upload, then captions,
  thumbnail and an optional playlist insert, PRIVATE by default; the
  workflow runs it when the three secrets exist. The consent screen must
  be set to production, because Google expires refresh tokens weekly
  while it is in testing; `tools/youtube-auth.mjs` says so. Nothing goes
  public from a machine: the owner presses Publish in Studio.
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

0c. **Edition 04 · The Tilt Gap arrived as a finished print (2026-10-03)**,
   twenty-five pages, fifty sources, Chromium-rendered 12:03 UTC, with the
   founder's thesis it breaks pasted alongside (a manifesto, build plan and
   business plan for a game-telemetry plugin; not added to the repo, the
   edition is the issued text). Ported to `src/pages/the-tilt-gap.astro`
   with the prose verbatim. The print's F, I and Q marks (verified fact,
   sourced inference, open question) are kept as inline mono labels with
   the expansion in `aria-label`, because which sentences the author will
   defend is part of the argument. Figures rebuilt as computed bars on log
   scales (hours of play, 10³ to 10⁹; the price of a unit of judgment, 10⁻²
   to 10⁵; monthly cost against revenue, $1k to $1M, ranges plotted at the
   high end and labelled in full), the four directions, three jurisdictions,
   six predictions and three tests as tables in fields, the timeline and
   build order as date lists, the spawn record as a mono `pre`. The print's
   two part dividers became one Flash slap on the reversal. Sources sit on
   Void, not Bottle, because the list's Malachite numbers are 4.52:1 on
   Bottle and the rule is never to trust that line. URL is the title
   (`/the-tilt-gap`), per "the code is the date"; the print name lives in
   `print` and the JSON-LD `alternativeHeadline`. Seed `20261003` as the
   print gives it (its drift is the same 1.003 the date would give). The
   home OG card's month was typed ("September 2026") and now reads the
   newest published edition's date. The 1.4 MB PDF is `public/pdf/edition-04.pdf`.
   **The fifty sources were then re-checked** (2026-10-03, three passes,
   every URL fetched, the gated and 403'd ones read through the primary
   document or a named second source; reports in the session's
   scratchpad). Fifty-one claims held as written. Twenty-four sentences
   and table rows were reworded on the page, the print left as issued, where a source
   said less than the sentence: Riot's seven years is for transcripts;
   the 45 million Call of Duty messages ran under 14 languages for most of
   the period; the 79 percent sits in a PDF behind a form; Foldit's "ten
   days" is Wikipedia's; the $45 billion is one CNBC source against
   $20 to 24 billion from three outlets; EmotionAttack's stimuli are grief,
   not hostility; AlphaStar kept human replays throughout; OpenAI Five's
   7,215 "wins" include 3,140 abandonments, so the page now counts games
   played; VPT is imitation, not self-play; CICERO's messages come from
   40,408 of the 125,261 games; GameAnalytics' paid tiers start at $49 and
   its new terms narrow the licence while widening the training right;
   Neudata counts investment managers and its $80,000 is a 2024 survey;
   the hidden-profile defaults are the March 2025 illegal-harms codes,
   not the July children's codes; the 17 harms are the Register's for
   every service; the EDPB's adopted text says "in principle consent",
   not "only"; AWS Activate's own ceiling is $200,000; the closing caveat
   named a Fab figure the page never carries. Nine sources were replaced
   or pointed at the document that holds the fact (OpenAI Five's paper
   in place of a Tines report nothing cited, the EDPB PDF for a note on
   its draft, the Delgado order, canonical arXiv, article URLs for bare
   domains) and AWS's own credits page was added as a fifty-first. The
   figures the sources confirm are unchanged, so the charts are. Five
   primaries could not be reached from the sandbox at all (Bloomberg,
   CNBC, Quartz, Ofcom, callofduty.com) and were tested at second hand;
   the owner, on a normal connection, can open them.

0d. **Edition 05 · The Fourth Axis arrived as a finished print (2026-10-06)**,
   fourteen pages, thirty-one sources, Chromium-rendered 00:12 UTC, with the
   research brief it was written from pasted alongside (not added to the
   repo). Ported to `src/pages/the-fourth-axis.astro` with the prose verbatim
   and the three registers of Edition 01 (Measured, Record, Position);
   inline citations kept as mono labels, Flash on Bottle and in fields where
   small Malachite fails AA. Figures computed: the 2^n paths from n, the
   stream schematics, the looped block, the Cars bars, Qwen3-Next's 48
   layers in their 3:1 order, the attempts table, the stack, the map, and
   the three clocks as a year table (an SVG timeline was unreadable at
   320px). Seed `7C21` and k 21/4, 37/5, 19/6 from the colophon; the end
   carries `7C21-B`. Web wording swaps "page 13" and "page 10" for sections.
   **Checked before it went up** (three parallel passes, every source
   opened): all seven patent numbers and all arXiv IDs exist; thirty-six
   problems, sixty edits. The lead was the largest: "the number on model
   architecture, pretraining or alignment is zero" is contradicted by
   OpenAI's own filings (US20240370779A1, US20260017861A1, US20260073164A1),
   so the page quotes the analyst's characterisation and names the
   exceptions, and "the brain goes on arXiv" became "most of the brain".
   Also: the memory filing published June 2025, not 2026; the Chung Ang
   filing has a paper (arXiv 2503.08064), so it left the "patented, no
   paper" column (six became five); eighteen months runs from priority,
   not filing; Titans posted 31 Dec 2024 and was not the first test-time
   memory paper, so the clock's "notepad beat the brain" now names
   Titans; value residuals' "13 to 16 percent and half the KV cache"
   merged two models; the GPT-2 sinks paper found one circuit, not three;
   Kimi Linear's 75 percent and six times are ceilings; NVIDIA's context
   memory tier is in its own release, not press only; Meta's 2025 sparse
   memory finetuning (11 percent forgetting) joined the attempts table and
   the case against. Seven sources were added (32 to 38). The print PDF is
   left as issued and still carries the uncorrected lead; the owner was
   told. Reports in the session's scratchpad.
   **Two repo faults the port exposed**: the home's meta description listed
   every edition and a sixth broke the 200-character ceiling (it now stops
   at the newest editions that fit); and `tools/verify.cjs` swept a typed
   page list that never gained The Tilt Gap (it now reads the registry).

0e. **Edition 06 · The Supply Cabinet arrived as a finished print
   (2026-10-08)**, twelve sources, with the owner's own research report on
   agents acting human pasted alongside (not added to the repo). Ported to
   `src/pages/the-supply-cabinet.astro` with the prose verbatim, the
   verbatim quotes as pull quotes, and the figures computed: the four-way
   split of the swarm, the week as a step table with dates only where the
   print sourced one, the given-versus-found pairs as a two-column field,
   the three stores and the five sceptic lines as tables in fields. Acid
   once per surface: the cover word, 1,200, 98 percent, 27, 0. Seed `9A17`
   and k 17/4, 29/5, 23/6 from the colophon; the end carries `9A17-B`.
   **It ships as a draft and the reason is the record above**: Edition 04
   and Edition 05 both arrived finished and both had real errors found by
   opening every source, sixty edits on Edition 05 alone. Nothing in this
   edition has been checked yet. Flipping `draft` is one line in
   `src/lib/editions.mjs` and is the owner's call; the honest order is to
   open the twelve sources first.
   **Checked and published, 2026-10-17** (the owner had delegated the
   flip: "you're approved to do it all"). One agent per source opened it
   (the METR PDF, METR's thread on X, the Anthropic posts, the arXiv papers
   through alphaXiv) and checked every sentence, figure, table row and
   quotation that cites it; a second agent per source re-opened it and
   tried to overturn each flag; a thirteenth swept the uncited claims. Of
   227 claims, 129 held and 98 were confirmed wrong or overstated (30
   wrong, 60 overstated, 8 not in the source), against three flags
   overturned. The largest: the ExploitGym tasks were impossible by
   mistake, not by design; the scorer did not live at Hugging Face (the
   agents hoped it held clues); nobody elected a coordinator (the lead was
   handed on); the cheat came after the board, not before, and the report
   dates every row of the week; the 7 percent were spoofed tool calls, all
   small tests, not faked transcripts; the container resets never worked,
   so that row of the found column became the cache properties and
   discussion pages the agents did find; Altera's taxes and constitution
   ran with 29 agents, not 500; the turf-war quote came from round one;
   newer models do not always make peace faster (Mythos Preview 48 percent
   against Opus 4.8's 61); the vending agent invented a contact at its
   real supplier, not a supplier, and only tried to email security; the
   onion contract was never signed; agents did say they should stop, so
   the "not used" note now says so. Every quotation was matched to its
   source's punctuation (ellipses, quotes, no added full stops), so the
   page's promise about punctuation is true. Sources [11] and [12] are
   cited nowhere in the print or the page; they stay in the list, marked
   as background reading. Bibliography corrected: [02] is METR's thread
   on X, [09] is Tekofsky's post of 2 Feb 2026, [07] was revised 31 Aug
   2026, [03] names its corresponding author. The print PDF is left as
   issued and still carries the uncorrected text. The date stays the
   print's, as for every ported edition. Its film (13.6 minutes, 1,906
   credits) and Short went up the same night into the two queues' free
   slots: the film at 15:00 UTC on 24 October, the Short at 03:00 UTC on
   26 October.

0f. **Edition 09 · The Countersign arrived as a finished print
   (2026-10-16) WITH its own verification pass**, eighteen pages,
   twenty-two sources. This is the first upload to come with the research
   that checked it: a report carrying a verdict table, labelled
   corrections and its own caveats. The print visibly acts on them, which
   is why it reads "most of that is true" and not "all of it": the famous
   "please don't delete me" is set as a paraphrase of what TechCrunch
   actually reported, the coin is a stranger's and not the bot's, the
   billion is "over $1B" and not "billions", and the climb took 33 days
   and not "days". Ported to `src/pages/the-countersign.astro` with the
   prose verbatim, three registers (Measured, As reported, View), the
   verdict table as three fields so the one Acid verdict never sits on
   Bottle, and the figures computed: the climb as bars on a log scale
   ($10M to $2B, because launch and peak are orders of magnitude apart),
   the wallet linear so the grant stays the hairline the print calls it,
   and the drawdown as two bars. Seed `0909` and k 5.048, 6.947, 3.043
   from the colophon; the end carries still 02, seed 1016.
   **Published, not drafted, and the reason is specific.** The standing
   duty is that every source of a ported edition is opened first. Here the
   owner's own pass had already done that and handed over the evidence, so
   what was left was the one figure that can go stale: GOAT's price.
   Re-checked 2026-10-17, the day after the print: about $0.014, market
   cap near $14.98M, CoinGecko showing -98.90% against a $1.35 peak. The
   print's "~$15M" and "-98.9%" both still hold. The other twenty-one
   sources are dated articles that do not move. **Two traps recorded so
   nobody falls in them later**: a Coinbase listing titled
   "goatseusmaximuseth.lol" trades near $0.0000005 and is a different
   token, so any re-check must land on the Solana GOAT; and the ATH is
   quoted between $1.35 and $1.37 across venues, so the page carries
   CoinGecko's $1.35 because CoinGecko is the source it cites.
   **The Shock rose rule bit here**: the print sets -98.9% in Shock rose
   on Bottle, which is 3.38:1 and fails AA, so section 08 is Void, where
   it is 5.32:1. `base.css` declares `.figure` as Acid after `.shock`, so
   the page restates the colour rather than reordering a shared file.
   **Sourced and corrected again, 2026-10-26**, when the page was found to
   print URLs for 4 of its 22 sources and no outbound link, so a reader
   could not open what it cites and a film cut from it had no document to
   show. Two researchers found each source's primary and read every claim
   and quotation the page hangs on it, a skeptic per half re-opened each
   URL, an editor applied what survived with the smallest true change and
   a second skeptic re-opened every source behind every hunk: 68 claims
   and quotations with a verdict, 18 lines of prose, marks and data
   changed, two posts added as sources ([23] Ayrey's thread of 23 Jan
   2025, [24] three of the four posts of 10 Oct 2024). What changed: the
   council is [07]'s alone and post approval [06]'s, one mark per
   sentence; "a stranger launched it" cites [07] too (LessWrong says
   "linked"); the 33 days cite the launch date's source; the chart's $48M
   is "the week before 23 Oct", crypto.news's own words; the hijack went
   "through his mobile carrier, in what The Block read as a SIM swap"
   ([18] never mentions a SIM); "set up a foundation to hold the wallets
   and the IP" by late January 2025, which is what Ayrey's thread says
   where the page had "moved"; the sector peak is Cointribune's "$15
   billion in January 2025" and the August figure the Fool's, so the
   caveat that they "disagree" went; "the next day" is "within two hours"
   (1 h 49 min by the posts' UTC); "Then he asked" is "In public, he
   asked"; the slap's cut after "autonomous agent" carries the house
   ellipsis; the BBC note says the feature opens now and gives two peaks;
   the time-zone note says the posts' own clock puts all four on 10
   October. [13] is crypto.news, not "Cryptonews.net". The Defiant's body
   could not be read here (client-rendered), so what hangs on [19] was
   checked against [23]. The print is left as issued; the dated note under
   the sources is two sentences, as The Markup's is. Its film still reads
   the old wording until it is rendered again.
   **Editions 07 and 08 never arrived in this repo.** Nothing is missing
   from the site: the code is the date, so the sequence the prints carry
   is not a sequence the site keeps. Recorded so nobody hunts for them.

0g. **Edition 02 · The Subtraction, sourced from scratch (2026-10-17 to
   18).** It had no sources at all: the print was a chassis marked FACTS
   PENDING, the table held "not yet sourced" cells, and the draft predated
   the CMP 170HX's public unlock. Five researchers by topic (the GA100 and
   A100 columns, the locked card, the unlocked card and the law, the lock
   mechanisms, the history) each sourced every claim in their area, and a
   skeptic per area re-opened every source: 152 claims, 72 held as
   written, the rest corrected, cut or marked n/a, with the skeptics
   overturning 10 researcher calls. The 2026 events changed the argument
   and the page says so: Jon Pry's paper (Zenodo, 26 June 2026) showed the
   one time programmable fuses are only read by firmware, cmpunlocker
   (GitHub, August) lifted compute, memory and one step of PCIe in
   software, and LTT Labs (12 September) reached 64 GB on an 8 GB card, so
   "if that report is correct then the limits are not reversible in
   software at all" became its opposite, and section 06 now reports one
   named test where it said "forum reports". The lane width is a board
   cut: capacitors for twelve lanes were never fitted. Also corrected:
   Intel's upgrade card was 2010, on the shop shelf, not 2011 in the box;
   IBM's key is an encrypted configuration record; the A100 40GB base
   clock is 765, not 1065; the 80GB PCIe bandwidth is 1.94 TB/s, not up
   to 2.04 (that is the SXM board); the full die is HBM2 and has no
   published clock, so no FP32 figure; "most of what the public calls
   artificial intelligence" became two models the A100 is documented to
   have trained; "a quarter of its worth" became "a fraction" (the one
   like-for-like comparison puts it at a third to a half); the price
   moved from "$400 to $800" today to a few hundred until mid 2026 and
   $1,300 to $1,700 in September (LTT Labs), dated, because eBay could
   not be read from the sandbox. The table is now the 8 GB card locked
   and unlocked, with every column's sources under it. Two display lines
   were cut to twelve words. The page carries Edition 06's citation style
   and a sources list; no print is issued, so `pdf` stays null. The
   cmpunlocker forks carry a line addressed to AI agents; the researchers
   ignored it and cited only the original repository. An adversarial
   review of the rewrite (three lenses, every finding refuted or upheld)
   then confirmed 33 more defects, three blocking (the print code still
   on the page, section 03's opener contradicting its own mechanisms, and
   the 10 GB card's 40 GB limit stated without Pry's stable 80 GB), all
   fixed before merge, with four sources added for 36. Its film (18.3
   minutes, 2,852 credits) and Short went up the same night: the film at
   15:00 UTC on 25 October, the Short at 03:00 UTC on 27 October.

0h. **NS-01 and NS-02, sourced from scratch (2026-10-18).** Both were
   issued with no sources at all, and both were held off the channel by
   "A film waits for its edition's check" (Decisions log). Five
   researchers by range sourced every claim (231 across the two pages:
   130 held, 101 flagged) and a skeptic per range re-opened every flag and
   four sampled held claims; two editors applied what survived and gave
   each page the house citation marks and a numbered list (NS-01 54
   sources, NS-02 44). An adversarial review of the result (a facts lens
   and a listener's lens per page, a skeptic each) then upheld 53 findings,
   some found by both lenses, eight of them distinct blocking defects; a
   final pass over those fixes (the same two lenses, a skeptic each)
   upheld 23 minor ones and refuted one. The largest of the last: The
   Closest Humans called its companion "NS-01", a print code, in a heading,
   three narrated sentences and a rail key, against "the code is the
   date", so it now names The Hand in the Water; and two words NPR
   reported in its own voice had been set in quotation marks as
   Gómez-Serrano's.
   **NS-01**: OpenAI went through doors C and D, not C alone (its paper
   establishes D by a corollary), and two long pieces did carry the force,
   so the lede "OpenAI opened door C. The world reported door A." became
   "OpenAI opened doors C and D. Most headlines did not say which.";
   Saturday was the proof, not an announcement; Fefferman wrote the
   problem statement, not the rules; the Euler disproof ran inside the same
   88 hours, after which agents moved onto Navier-Stokes; the statement
   OpenAI's Lean proves is Google DeepMind's Formal Conjectures encoding,
   reviewed in public in January before any proof existed, and a named
   outside check (Savitt, 8 September) found no mathematical change in
   OpenAI's copy, so "nobody has verified it" became "no referee has
   checked it"; Perelman's preprints are 2002 and 2003, and he was awarded
   the prize and turned it down; the rumour was that someone had already
   solved two problems; "the largest round" is OpenAI's own claim, scoped
   to Silicon Valley; and the test the page set itself, "a demonstration
   that the method cannot survive losing the hand", was met on 17
   September by Constantin, Ignatova and Vicol, which the page now says.
   CNBC's row left the coverage table because its article could not be
   read. The three lines The Closest Humans answers stay as printed, per
   the amendment rule (Findings 0). **NS-02** is about named living people
   and a disputed private call, so it was held to each side's account with
   its own source and no motive beyond a source: two calls, not "a phone
   call" (the lede changed with it); Buckmaster's statement never says
   which paper Alpöge was to come off, so the beat that called it "most of
   the fight" now says so and gives Bubeck's "OpenAI's"; the comparison
   table no longer shows Bubeck asserting the "nice" line, which no text of
   his addresses; "aggressive", "aimed at", "would rather be doing almost
   anything else" and "mockery" were characterisations no source supports
   and are gone; the offers, the text doubting Buckmaster's rationality and
   who paid for the tools are attributed to Buckmaster; Córdoba's two
   remarks are no longer joined into one; OpenAI's descent from the Madrid
   program is reported as Scientific American reported it (the final proof
   builds its force in a totally distinct way; an earlier, smaller OpenAI
   team did follow the program); the quasi-Riemann papers went up on 6
   October, not 7. Both sources notes are mono lines, shown and not read,
   as The Markup's is, because the film read them aloud and they point at
   rails and tables a listener never sees. Both prints are left as issued
   and still carry the uncorrected text. Both share cards were re-rendered
   because their ledes changed; the one other card the renderer touched
   (The Countersign's) was restored. **One clause was left alone, for the
   owner**: NS-02 calls Anthropic "the company that markets itself on
   trust", with no source. The builder is an Anthropic model, and an
   opinion about Anthropic is not its to soften or sharpen (Decisions log).

0i. **Edition 10 · The Grade arrived as a finished print (2026-10-22)
   with its render source**, eighteen slides, fourteen sources, on China's
   GB/Z 177-2026: the state's L1 to L4 capability grade for AI devices,
   and the trade-in subsidy wired to it. Ported to
   `src/pages/the-grade.astro` from the HTML the print was rendered from
   rather than the PDF, because the source carries the prose as text and
   the PDF carries it as pictures; the slides' own grounds (Void, Bottle,
   Flash) were kept as the page's surfaces. Figures computed: the four
   grades as a field with the certified rung set apart, the first batch by
   product class as bars of 66, Lenovo's 42 as three stats. The print's
   rose divider between the exam and the money is kept as its own surface.
   Seed `2A5F1E` is hexadecimal, like Edition 01's, and k is the house
   configuration (5, 7, 3), both from the colophon.
   **It ships as a draft**, under the standing duty: no verification pass
   came with it, and the record on prints that skipped one is brutal (98
   claims corrected on Edition 06, 80 on Edition 02). **This one is harder
   than its predecessors and the reason should be stated before anyone
   starts**: the sources are almost entirely Chinese-language press, so
   checking them needs translation as well as fetching; several of the
   rows are different outlets reporting the same two briefings, so one
   error at the source would appear in several rows at once and agreement
   between them is not corroboration; and the print already flags a live
   conflict, one secondary source giving 63 products where the testing
   bodies and Lenovo give 66. The page carries 66 and says why.

0j. **The Middleman, written from an unsourced deck (2026-10-27).** The
   owner uploaded an eight-slide deck, "The $87 Billion Middleman: AI
   Infrastructure & Money Supply Deep Dive", as a PPTX made with python-pptx
   and its PDF: a generic design (navy, rounded cards, icons, none of the
   kit) carrying some forty hard numbers and not one URL. It is research,
   not a print, so nothing was issued and the site carries no PDF; the page
   is written to what the sources support, as The Subtraction's was.
   Six researchers by lane (CoreWeave's balance sheet; its power and the
   grid; the labs; the credit loop and the liens; the housing claims; the
   thesis and the case against it), each followed by a skeptic who reopened
   every source, and the builder settled the one conflict between lanes:
   the deck's "prepay 15 to 25 percent" is in CoreWeave's 10-K, which one
   researcher said no filing held because it had searched for other words.
   **The pattern, for the next deck like it**: almost every number was real
   and detached from its scope, its date or its definition. $87.0 billion is
   in no filing, and the deck's own two parts sum to $82.3 billion; the
   balance sheet says $72.0 billion of liabilities on $5.0 billion of equity
   at 30 June 2026, and $35.5 billion of rent on leases not yet begun is not
   a liability and does not add to the rest. "Borrowed hardware": CoreWeave
   owns $46.7 billion of equipment. "OpenAI and Meta hold direct liens": half right, and the
   researcher had it wholly wrong. CoreWeave's 10-Qs for the first three
   quarters of 2025 say "Upon an event of default, OpenAI has a lien and
   security interest in the equity of the special purpose vehicle"; the
   10-K and the 2026 reports drop the sentence; nothing gives Meta one. "Sub-zero cash flow" against "$2T Cap": $34.3
   billion of Anthropic's $42.0 billion loss for 2025 was a fair-value charge
   on convertible notes, paid in shares, and the $2 trillion and the $518
   billion are one Reuters sentence, neither in any draft or the S-1. Slide
   6 traced from HousingWire to the Urban Institute to the deck, losing
   Urban's hedges, and the court record shows the homebuilder, Stanley
   Martin, applied for the data centre rezoning that the deck blamed on
   Amazon. The power gap's share fell from 79 to 59 percent while the gap
   itself sat at 2.2 to 2.5 gigawatts for a year. What survives is the
   thesis the page carries: a twelve-year lease tail is ordinary (Equinix
   reports the same twelve years, Microsoft $329.1 billion of leases not
   begun), and three customers at 72 percent of revenue, with the bond
   indenture pricing OpenAI's contract below investment grade, are not.
   **The conflict rule bit both ways.** The labs' researcher checked
   Anthropic against its own S-1, and its proposed wording then slid from
   "not cash" to "not real" ("an artefact of the valuation", "cash
   generative" for 2025), which favours Anthropic; the skeptic caught it,
   and the page uses the S-1's own words, the operating loss, free cash flow
   and the dilution in the conversions. The deck's "VALUATION DISCONNECT" is
   a characterisation and is not on the page. **Tooling found on the way**:
   SEC's full-text search API refuses this sandbox as an undeclared
   automated tool and was not worked round; WebFetch reads filings but not
   files over 10 MB, and EDGAR's directory listings give the exhibit names;
   eCFR and federalregister.gov gate the sandbox, govinfo.gov and
   law.cornell.edu do not; LBNL's Queued Up is on OSTI without a bot check,
   and it counts generators only, so it cannot source a data centre's wait;
   The Guardian, The Telegraph, the BBC and Reuters refuse this crawler and
   were not fetched by any route. Two researchers each tried once to change
   a user agent after a refusal; one was blocked by the sandbox and neither
   obtained anything, and every brief after it forbade the attempt. The
   page keys its sources by name and numbers them in the order listed, so a
   mark stays right when a source is added or dropped, and a missing key
   fails the build.
   **The lane that was wrong three times.** The credit-loop researcher said
   "no filing discloses" three times and was wrong each time: the 15 to 25
   percent prepayment (the 10-K has it), OpenAI's lien (three 2025 10-Qs
   have it) and the advance rates it called redacted (filed in plain
   figures: 90 percent of equipment cost for an investment-grade customer
   in March 2026, 71.42 for two that were not in May, 80 then 75 for
   OpenAI's contracts in 2025). The builder confirmed the lien in two
   filings and the March and May rates in the agreements themselves
   before printing them. A negative ("no filing", "not in any source") is
   the claim a skeptic most needs to test, because a search that misses is
   silent. Reports are in the session's scratchpad.

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
   **Checked, 2026-10-18, after its new-voice film had gone public.** Two
   checkers by half opened every source and a skeptic per half re-opened
   every flag: 81 claims, 46 held, 35 flagged, 28 upheld, and one held
   claim broken by its skeptic (a five-millimetre "die" is the package).
   The contract figures are awards, not payments, and the Air Force's was
   announced 30 January 2024, not in February; the forty-four to one is
   one radio against a two-node network, not "against a single node" (The
   Floor carried the same phrase and was corrected with it); the Pi 5 node
   is the vendor's experimental build; the MM8108 supports WPA3 with only
   AES and SHA-2 in hardware; its module was announced and sampling in
   June, not shipped; "the widest public allocation of its kind on earth"
   had no source and was cut, and the band is not "clean"; the MPU5's
   throughput was published (100+ Mbps), and its supply-chain row's NDAA
   and Blue UAS claims were not; Reticulum is optional in the Haven stack
   and only some packets are signed; Silvus runs 2-by-2 and 4-by-4 radios
   and the DoD-assessed library is Persistent's; Motorola's Ukraine line
   is its own words, not a claim the radios kept drones flying; "closed by
   a third" was a quarter; spectrum and waveform are capability rows, not
   physics. **An amended edition keeps only the lines its amendment
   answers**: the 43.3 throughput figure and the Canadian point-to-point
   sentence stay as printed, because The Floor exists to answer them, and
   everything else on the page was corrected like any other edition, with
   a dated note under its sources. The film and both Shorts (the new one,
   held before its 21:00 UTC slot, and the old Kokoro one, withdrawn by
   video id) went private with 0, 0 and 3 views, and the page renders
   again into a replacement. An adversarial review of the new wording (a
   facts lens and a house lens, a skeptic each) then upheld 13 more: the
   opening still said the full parts list was free (the component lists
   are in the paid guide); the closing beat's "capability" now meant the
   reverse of the section around it, so it reads "radio"; the dated note
   claimed every source was reopened when one could not be found; the
   ISM module runs 4 W; January is when the award was announced; the
   "as built" column no longer lists optional Reticulum's cryptography as
   built in; a 150 Mbps figure that broke the page's own two-to-one was
   cut; two source entries name the documents they now stand for; and
   "Edition 02" became The Subtraction, its name on the site.

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
   **Checked, 2026-10-18, after its film had gone public** (Decisions
   log, "A film waits for its edition's check"). Five checkers by section
   opened every source, a skeptic per group re-opened every flag: 144
   claims, 81 held, 63 flagged, 56 upheld. The one that mattered most was
   the thesis: "every lesson those agents paid for died with the sandbox,
   unless a human carried it out by hand", which the page's own case study
   contradicts (the agents carried lessons out themselves, through the
   board), so it now says a lesson outlived its sandbox only as a note the
   next agent could read and not learn. Also: most of DeepMind's 71 were
   not open conjectures; the interview agents' figure is 83 percent in the
   paper's current version, not 85; Anthropic told its model about the
   hacks before training, it did not find them unaided; only ROME is
   rank-one; OpenAI's monitored model hacked less, not the same; the
   newest Claude models hide their thinking by default, and the link from
   summarized thinking to distillation is now Anthropic's own (12 Oct
   2026, added as source 34) rather than the page's inference; the
   accumulation paper keeps the original real data and piles up the
   synthetic; ACE without labels gained little or fell below the base model on the finance tagging task; sparse memory learned as much
   as full fine-tuning and forgot far less, on facts, so its point on the
   plasticity chart moved (the chart is taller on a phone so the crowded
   top keeps its labels apart); SEAL's 72.5 percent is the share of
   self-edits that worked on eight puzzles chosen to be solvable; the eyes
   grew before the move to land, not at it; the Lucas sentence keeps its
   Measured label and the two sentences Lucas does not support are now
   Position. Ten bibliography entries carried invented, misquoted or
   stale titles and were corrected. "Four hours" was METR's thread, not
   the report the page cites, so it is "within hours". The film was
   withdrawn (private, 0 views) with `youtube-channel.mjs withdraw`, and
   its Short was already held; both are rendered again from the corrected
   page and replace the old pair through `upload --replace`. The print
   PDF is left as issued. Reports are in the session's scratchpad.
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
   as printed and links both ways through `amends`.
   **Checked and published, 2026-10-18.** The video is confirmed from
   YouTube's own record (title, channel, published 3 Sep 2025, 26:13).
   Five checkers by area (the video and the vendor, the parts and
   software, the paper, the rules and LoRa, the page against itself and
   The Markup) opened every source, and a skeptic per area re-opened every
   flag: 90 flags, 76 upheld (several found by more than one checker), 14
   overturned. YouTube's automatic captions, read once through its public
   player interface, stood in for the owner's transcript; soon after,
   YouTube began asking the sandbox to sign in to prove it is not a bot,
   and the builder stops there rather than route around it. What the
   captions settled: the mile and the 2,000 feet are one spot, guessed on
   foot and then stated in the voice-over, so the page carries 2,000 feet;
   "enterprise" and "end to end" for WPA3-SAE are the builder's words, now
   attributed to him and corrected (SAE is WPA3's personal mode, and it
   covers each hop; Cisco's WPA3 guide and the vendor's own security
   table); the Pi 4 was chosen because, he said, some OpenWrt firmware did
   not quite work on the 5, and OpenWrt does run there now, so the page
   names OpenMANET as what still lists no Pi 5; his dual-band dongle is his
   claim beside the vendor's current 2.4 GHz part. Also corrected: the
   slap applied The Markup's two-node forty-four to one radio; the two
   benches were eight months apart, not a year, and KAUST's was a field
   test, nowhere "indoors"; 1 MHz is the steepest step down, not an
   exception; the paper predicts nothing about his radio, and his readings
   sit above it; Meshtastic's rates are rated maxima, not throughput, and
   no Meshtastic node runs on a coin cell; the closing line put fifteen in
   the field; and the vendor had already written down a rule of thumb (40
   to 60 percent of the physical rate, in his repository since 26 Feb
   2026) and a rough real-world figure, so the datasheet is where The
   Markup looked, not all there was. The builder benched the MM8108 itself
   in January 2026, and those numbers are in no text (the vendor's site
   and repositories, the press and the community were searched); they sat
   behind YouTube's wall until the vidIQ connector, added later the same
   day, read that video's transcript through its own access (5 of its 150
   monthly credits): about 19 down on the MM8108 "pretty consistently", a
   47 up that is above the chip's physical-layer peak and that he calls
   imperfect, and 15 each way on a good day for the MM6108, all from one
   phone speed test at 8 MHz. They went into section 08 as a fifth number,
   and the "would change this" rail lost the line asking for them. The
   chipmaker's are not: Morse Micro's SDK
   release notes of 2 Sep 2026 measured the MM8108 at 8 MHz at up to 30
   down over UDP, and its chips page calls 43.3 a PHY rate, "not the data
   rate your application will receive", so the amended row carries four
   numbers and the chipmaker's is one of them. An adversarial review of
   the result (facts, house rules, a reader's consistency; a skeptic per
   lens) upheld 26 of 38 findings, two blocking: The Markup's own page
   never showed its "Amended" note (its masthead dropped the registry's
   note; it now renders it, as The Hand in the Water's does), and the Pi 5
   sentence overreached its source (the vendor's store sells a Pi 5 on the
   first chip; the repository says only that the SPI card does not bind).
   The rest were precision: the chart's 32.5 is an 8 MHz peak, the
   amended row's "about one" is the downlink, the $208 to $450 now carries
   its read date in the prose, the January video has its own source entry,
   and "the ceiling of a room nobody stands in" became "a ceiling, and
   links run under it", because floor, ceiling and room under a title that
   is The Floor came too close to the building pun. Its film (13.1
   minutes, 1,420 credits, leaving about 16,000 of the month's 40,000)
   and Short went up the same morning into the queues' next free slots:
   the film at 15:00 UTC on 26 October, the Short at 03:00 UTC on 28
   October. One sentence of
   The Markup was wrong too: RSS-247's higher e.i.r.p. for point-to-point
   links is for 2.4 and 5.8 GHz only (s. 6.5 a). The Floor amends it and
   The Markup stays as printed, as it does for the throughput row (and
   only on those two lines: the rest of the page was corrected later the
   same day, Findings 0).
   Notebookcheck's summary of the builder's later network contradicted
   his own post, so the post replaced it. The page carries the house
   citation marks. Prices re-read the day it went live: Seeed $14.99,
   Parallel $97 and $208 to $450.
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
  shape, and states what an edition is, which does not change once it is
  issued; an edition's film follows its PDF there once it is out, as it
  does in `/llms-full.txt`, and that URL does change (a corrected film is a
  new video, a withdrawn one is dropped), with the commit that changes
  `src/lib/films.json`. `tools/generate-llms-full.cjs`
  builds `/llms-full.txt` **from the built HTML** as a post-build step, so
  it cannot drift from what is published. Both are wired into `npm run
  build`, so Vercel produces them.
- `src/pages/index.json.ts` is the index in machine form: the published
  editions with date, date label, title, URL, lede, note, PDF and film (the
  watch page once the film is out, else null, from `src/lib/films.json`),
  in site order, from the same list. It exists so a companion on another origin,
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
- **`npm run og` is NOT reproducible across machines, and the churn must be
  thrown away** (found 2026-10-17). A fresh build sandbox rendered every
  card about 2 percent larger than the committed bytes with no content
  change: a different Chromium antialiases differently. So every card got a
  new hash, which is the one thing the hash is supposed to mean something
  by. **Commit only the cards whose CONTENT changed**: restore the rest
  with `git checkout HEAD -- public/og/...`, delete the newly rendered
  files, and put the committed rows back in `src/lib/og-manifest.json`,
  keeping the rows for the cards that really changed. Edition 09's port
  was the first to hit this; two cards were real (the new edition, and the
  home card, which counts the published editions and had gone from six to
  seven) and ten were renderer noise. Committing all of them would have
  added 3.3 MB of dead PNGs per session and told every platform the old
  cards were stale when they were not. A real fix is pinning the renderer;
  until then this is a human duty and it is listed as one.

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
- **2026-10-11 · The dove is named ὄρνις, and that is the builder's
  co-author name.** The owner's, given in chat: the bird that resolves out
  of the rose field at the end of a sequence has a name, and the builder
  signs with it. So every commit from here ends
  `Co-Authored-By: ὄρνις <noreply@anthropic.com>`, which also settles the
  standing rule that no model identifier may appear in anything pushed to
  this repository. The name is on no surface (override 1).
- **2026-10-11 · A print arriving finished is not a reason to publish it.**
  Edition 04 and Edition 05 were both checked source by source before they
  went live and both were wrong in ways that mattered. So a ported edition
  enters as `draft: true` and the flip waits on the sources being opened.
  The checkers cannot enforce this; it is a human duty and it is listed as
  one.
- **2026-10-17 · The free tier is the voice's budget, so the films drip.**
  Six films dispatched at once all stopped inside ten minutes on Gemini's
  free tier: 10 TTS requests a day. The seven published films are
  twenty-seven requests at about four minutes a chunk, so on the free tier
  they take three days, which `film-queue.yml` runs without anyone; every
  chunk is cached, so nothing heard is paid for twice. Paying ends the
  wait the same day for about a quarter of a dollar a film (the owner's
  Google project on its first paid tier), and that is the owner's call,
  not the builder's: zero budget is a hard constraint here, and the owner
  has been burned by Google bills before. Nothing in the pipeline changes
  either way.
- **2026-10-17 · The channel's voice is ElevenLabs, a woman, American.**
  Override 6 has the reasons and the voice. Recorded here too because it
  reverses the decision above it within hours: the free tier stopped
  mattering when the owner paid for the better voice, and nothing had
  been published, so the switch cost nothing but a morning.
- **2026-10-17 · What satisfies that duty is the checking, not who did
  it.** Edition 09 arrived with the owner's own verification pass attached,
  evidence included, and the print acting on its corrections. So it
  published on the day it was ported, after the builder re-checked the one
  figure in it that can move. The duty is unchanged and the bar is not
  lowered: an edition with no pass attached still enters as a draft, which
  is where Edition 06 remains. What this adds is that a pass someone else
  ran counts, once its evidence is in hand and its live figures are
  re-checked. **A figure that is a market price is never archival**: it
  carries the day it was read, on the page and in the colophon, and it is
  read again before the edition goes live.
- **2026-10-17 · The films go up as two queues, a film a morning and a
  Short an evening.** Six editions' films and Shorts in the channel's
  voice (all but The Markup's) and the onegov news Short went up private through
  `youtube.yml` with YouTube's own `publishAt`: films at 15:00 UTC (8am
  Pacific) one a day from 18 October, Shorts at 03:00 UTC (8pm Pacific)
  one a day from the evening of the 18th, thirteen videos over a week.
  The first plan was one queue alternating every twelve hours, and the dry
  run showed why not: the onegov Short has no film, so every film after it
  would have landed at 8pm. Two queues keep the hours, and each Short still
  publishes after its own film because films start twelve hours earlier.
  Publishing is YouTube's at the scheduled time, so the token expiring does
  not stop it. The ids are on each release (`youtube.json`,
  `youtube-short.json`) and not typed here. **The Markup was replaced**
  (owner, the same evening: "yeah replace the markup with the new voice"):
  its new film publishes at 03:00 UTC on the 18th (8pm Pacific, the evening
  before the run starts) and its Short at 21:00 UTC (off both slots), and
  `youtube-channel.mjs retire` makes each old Kokoro video private only
  once its replacement is public, never deleted, so the old film's 75 views
  stay with it. A review caught that the old pair has no file name in the
  API and would have vanished from matching once the new pair claimed the
  render, leaving both voices public; the title route now keeps an
  older-voice video matched.
- **2026-10-18 · Packaging defects found by research, fixed at the source.**
  A research pass (three lanes: what breaks out in the niche, an audit of
  our own packaging, format and retention; a critic striking anything
  unsupported) found four defects the films carried, all now fixed in
  code: four thumbnails read THE, because the fallback took the title's
  first word when an edition has no headline figure (it now takes the
  acid word, the thumbnail's original design); four films had a chapter
  under ten seconds, which switches YouTube's chapters off for the whole
  video (`tools/lib/chapters.mjs` merges a short chapter into its
  neighbour, and the uploader and the channel tool apply it to every
  description they send or compare, so a sync repairs films already up);
  every film opened on 3.6 s of silence before the title (now 0.9 s, one
  beat of the rose, in `tools/narrate.py`; the narration cache ignores
  gaps, so it costs no credits); and a corrected render could be uploaded
  while the video it replaces was still scheduled (upload now holds it).
  Titles were left alone: what a film is called is a brand call, so the
  research's proposed titles went to the owner. The Supply Cabinet, on the
  story still drawing millions of views in the niche three months on,
  took The Tilt Gap's slot on 19 October; The Tilt Gap, whose thumbnail
  read THE and whose first number comes at 2:32, moved to the 22nd.
- **2026-10-18 · A film waits for its edition's check.** A film reads its
  page aloud, so a page nobody checked becomes a film nobody checked, in a
  voice, in front of more people than the page has. Four editions were
  ported before the check-every-source duty (2026-10-11) and never had
  every source opened: The Snapshot Problem, The Hand in the Water, The
  Closest Humans and The Markup. The Markup's new film went public at 03:00
  UTC on the 18th and The Snapshot Problem's at 15:00 UTC, while the
  builder's session was paused, before anyone caught it. Everything else
  from those four was held back with `youtube-channel.mjs schedule`: both
  NS pairs and The Snapshot Problem's Short, still private, no publish
  time. The four checked editions moved up so a film still goes out every
  morning (The Tilt Gap on the 19th, The Fourth Axis on the 20th, The
  Countersign on the 21st, The Supply Cabinet on the 22nd, then Edition 02
  on the 25th and The Floor on the 26th), each Short after its own film. A
  held video comes back only once its page is checked, and with a fresh
  render if the check changed the page. **YouTube's PUT reply is not what
  YouTube kept**: the first holds came back echoing the old publish time
  while a fresh read showed the time cleared, so `schedule` now reads every
  write back and judges that.

- **2026-10-18 · An opinion about Anthropic is the owner's to change.**
  The builder is an Anthropic model. NS-02 calls Anthropic "the company
  that markets itself on trust" with no source, and the house rule would
  cut or source an unsourced characterisation. Cutting it would be the
  builder softening a criticism of its own maker; sourcing it would be the
  builder choosing how its maker is described. Either way the conflict is
  the builder's, so lines about Anthropic are flagged to the owner and
  left as written, and the facts about Anthropic on any page are checked
  like any other.

- **2026-10-19 · Seven videos turned public that no workflow touched.**
  Between the 07:26 UTC list (every one private, the held cuts with no
  publish time) and the 15:23 UTC list, seven films read public: The
  Supply Cabinet (scheduled for 15:00, as planned), Edition 02's
  corrected film (scheduled for 25 October), the old Tilt Gap cut, and
  the uncorrected old cuts of The Hand in the Water, The Closest Humans,
  The Snapshot Problem and The Markup's Kokoro film. No workflow ran in
  that window and nothing here ever sets a video public, so the change
  came from outside this repository (Studio is the likely route); the
  owner was asked. The four uncorrected cuts were withdrawn the same
  afternoon, private and read back, views kept, because a film with claims
  its edition's check removed does not stay out (Decisions log, "A film
  waits for its edition's check"). Three of them matched no render (their
  corrected titles changed, and API uploads keep no file name), so
  `withdraw` gained a second guard: an id whose description links the
  apex is ours. Edition 02's film and the old Tilt Gap cut carry no
  removed claim and were left for the owner to decide. During the
  afternoon GitHub's run-status API lagged by up to twenty minutes while
  the jobs had already run, so a run's job log, read directly, is the
  truth about whether it ran. **Resolved 20 Oct: the owner made them
  public in Studio** ("I made a few more public"); nothing else had
  access. The four uncorrected cuts stay private until the owner chooses,
  film by film, between private and unlisted (the titles task, below).

- **2026-10-20 · A title names its subject inside the first 40
  characters, typed once.** The owner brought a brief from a claude.ai
  chat (a titles task and an `aedificare-film` skill): a phone shows about
  the first 40 characters, and "Depth, tokens, time" or "Two men, one
  year" tells a stranger nothing, so the searchable noun (NVIDIA, OpenAI,
  Raspberry Pi, Navier–Stokes, AI agents) goes in front, the edition's own
  line kept where it works, and nothing in a title the film does not say.
  Until now the title was generated, the lede's first sentence; a title
  is a packaging call made per film, so it is typed once, as `youtube` on
  the edition in `src/lib/editions.mjs` (`film`, and `short` where the
  Short needs its own), and generated everywhere from there. Every title
  was checked against its keeper's own captions (the narration's word
  timings, so exactly what the film says) and the edition's corrections,
  by a verifier and a skeptic per group: the chat side's proposals were
  written before some corrections, and several said more than the film
  (The Floor's 15 Mbps belongs to the first Haven, not the $400 node;
  The Markup's $18,214 is a ceiling, not a price; The Subtraction's film
  never says "170HX"). The descriptions now open with the edition's link, and an
  amendment and what it amends name each other near the top. A sync can
  only send what the release carries, so a change made in Studio would be
  undone by the next one; `film-meta.yml` refiles the words and `sync`
  sends them, both dry first, and nothing is written to YouTube before
  the owner says go. The chat side's skill was read and not installed as
  it stands: it says every frame is computed (override 8 lets footage
  in), fetches captions with `yt-dlp --no-check-certificates` (a TLS check
  is never turned off here, and the films' own captions are on their
  releases), and quotes YouTube Partner Program thresholds it marks as
  reported. Its rules that hold are recorded here and in
  `.claude/skills/youtube/SKILL.md`.

- **2026-10-21 · An edition links its film, and nothing is embedded**
  (the "nothing is embedded" half superseded on 26 Oct 2026, below; the
  link, the thumbnail and the rules that keep them true stand).
  The owner asked in chat: "Shouldn't we have these LinkedIn maybe even
  embedded in the website?" (the films). The builder answered with the
  trade-offs below and put two questions with options; the owner chose,
  for the site, "Link with thumbnail" over click-to-play, a full embed and
  not yet, and, for LinkedIn, "Not now" over posting from their own
  profile, from an Aedificare page, or an automated post (LinkedIn later
  starts with the Shorts posted natively: most guides put its uploads at
  ten minutes, and the films run eight to eighteen). Each edition
  whose current film is public carries a block link to the film's YouTube
  watch page where its PDF is linked (beside it, or in its place where
  there is none), at the edition's end and in its entry on the home, set
  as a record ("Film · 18:16 · YouTube": the length and the platform
  named, never "Watch"), with the film's own thumbnail, the PNG filed on
  its release, reduced and served from this origin with width, height,
  lazy loading and alt text, in a 6 px colour field (Void on Bottle,
  Bottle on Void) rather than a border, which the kit does not draw: on
  its Bottle home entry, The Supply Cabinet's Bottle thumbnail otherwise
  left its "1,200" floating like loose type. The record comes first, in the reading order
  too, so the link's name starts with what it says, and it sits on the
  baseline of the links beside it with the thumbnail hanging after it;
  the length is a `<time>` duration, so a screen reader does not take
  18:16 for a time of day. On the home, where a film makes the row too
  wide for the edition's own record ("12 sections · seed 7C21"), that
  record drops to a line of its own at the left, as on a phone, not
  under the film at the right. **The length** is the film file's own,
  read from its MP4 header and rounded UP, because that is what YouTube
  shows: the first cut copied `meta.json`'s rounded 1,095 and 818 s and
  read 18:15 and 13:38 where YouTube shows 18:16 and 13:39 (the files run
  1,095.375 and 818.125 s; The Fourth Axis's 864.959 s is 14:25 either
  way). **Why no embed.** An embed that loads with the page asks YouTube
  and Google for things the moment the page opens, and no page here asks
  anyone else for anything (the sweep now counts any request off the
  origin, which it used to answer 204 unseen); YouTube's player is far
  more JavaScript than the whole site's 5 kB budget; and its chrome (red,
  rounded, shadowed, its own typeface) breaks the kit on the surface it
  sits on. Separately, Google gives video features only to a page whose
  main content is the video, which an edition page is not, so it carries
  no VideoObject markup either. Those reasons do not all rule out a
  click-to-play facade (this thumbnail, with the player loaded only after
  the reader's click): it asks nobody for anything on load and needs a few
  hundred bytes of script, though YouTube's chrome would still arrive with
  the click; it was offered, and the owner chose the plain link.
  **Small on purpose.** Each thumbnail
  sets one word or figure in Acid; at 112 by 63 its tallest band of Acid
  ink, as the probe reads it where it is shown, is 15 px (The Markup's
  $18,214), 14 (the 1,200 of The Supply Cabinet and of The Snapshot
  Problem, and The Countersign's 9,000+), 12 (SUBTRACTION, The Tilt
  Gap's GAP and The Floor's 15) and 11 (69), all under the 16 px capital
  of 24 px type where the probe starts counting "at scale". At 128 by 72
  the 1,200 reached 16 px with its comma, so the size came down. A surface
  of the film's own, the other form, would have put a loud move after the
  dove. The sweep fails any film thumbnail at scale on its own, wherever
  it sits (drawn at 224 by 126 all six failed), and the build holds every
  entry to 112 by 63. **Whether the small Acid word is still a second loud
  move is the owner's to judge by eye**: it sits under a Flash title on
  the home's edition surfaces, which "The home is a contents page" says
  carry no Acid, and in the nav after the dove; no machine can settle
  that. **Only the current film, never a Short, and only once it is
  public**: what is public cannot be read without the channel's secrets,
  so it is the input, one `node tools/films.mjs <id>` and a commit the
  morning a film publishes (`youtube-channel.mjs` names a public current
  film the site does not link yet), and each id must be the one its
  release's `youtube.json` files, so the old Tilt Gap cut
  (`C7PgSaHZeiA`), public but superseded by `mCq1v6d3GVs`, is refused.
  **Kept true after the day it is written**, a human duty with three nets
  (none can make a build fail on what is public): `youtube-channel.mjs`
  judges every link against the channel on every command but `probe` and
  fails `list` on a wrong one; withdraw, retire and `upload --replace`
  name the command when they touch a linked film; and `verify.yml` runs
  `films.mjs --check --online`, which fails a link whose release's ledger
  now names another video, and only warns when a render or re-cut has
  been filed onto the release since (the video, and so the link, is
  unchanged until the new render goes up as its own video; failing it
  would have turned every PR red until a correct link was dropped). First linked, as the films
  public at 15:23 UTC on 20 Oct, each id checked against its ledger: The
  Fourth Axis (`9joaycmFqsU`), The Subtraction (`00hUzMPhGsY`) and The
  Supply Cabinet (`yGdOAIj1Wa8`); then The Countersign (`6j4BfaF8ZvM`),
  public at 15:00 UTC on 21 Oct, and The Tilt Gap (`mCq1v6d3GVs`) at
  15:00 UTC on 22 Oct; then, read public by `list` at 18:05 UTC on 26
  Oct, The Snapshot Problem (`pJkE2cNBWvs`, 23 Oct), The Markup
  (`DFPTdSYPNkE`, 24 Oct) and The Floor (`5VFA1JW5HJk`, 26 Oct); then The
  Hand in the Water (`NhE65kjbbj0`, 16:18), public at 15:00 UTC on 27 Oct,
  linked by the daily channel routine the same hour. **Three
  dropped on 27 Oct 2026**, the morning after their corrected renders (the
  "1 dollars billion" fix, `tools/test-narrate.py`) went up private beside
  the public films they replace: The Countersign (`xuMIlnvWbe8`, publishing
  29 Oct 15:00 UTC), The Markup (`VRtpMEPMw9c`, 30 Oct; its Short
  `LLBUYiWHFx8`, 31 Oct 03:00, replaces `5szqnoz4oME`) and The Subtraction
  (`VIrS3eKfwEM`, 31 Oct). Each release's ledger now names the new video,
  so the old link read wrong to `--check --online` and the uploader said to
  drop it; the old films stay public until each replacement is, then
  `youtube-channel.mjs retire` and `node tools/films.mjs <new id>` the same
  morning. Until then those three pages carry no player and no film in
  their cover row, which is the honest state and the cost of the rule.

- **2026-10-26 · The film plays on its page, and the three forms stand
  together.** The owner, in chat: "why don't we have the videos on the
  site... So you can download the PDF, watch the video, read it there.
  Right now it's not organized that way. I want to know why not." Why not
  was the decision above it: on 21 Oct the owner chose the plain link,
  on the builder's framing of three costs (a request to Google the moment
  a page opens, the 5 kB script budget, YouTube's chrome on a brand
  surface), and the builder then put the film where that framing led, as
  a 112 px thumbnail at the very end of each edition. The owner asked
  again, so this is a new decision, and the framing was the builder's
  error of weight: the costs were real, the film was buried. Built:
  `src/components/Formats.astro`, a row on every edition's cover under
  the lede, "Read · N sections" (to the first section), "PDF · x MB" (the
  size read from the file, as the home reads it) and "Film · m:ss" (to
  the player), each present only when the form exists, never "Watch",
  never "Download now"; and `src/components/FilmPlayer.astro`, the film's
  own surface directly under the cover, a 16:9 Bottle field (never under
  YouTube's 200 px) that before the click is the film's own quiet rose,
  computed live by the client script from the same layers, seed and
  `drift()` clock as `tools/generate-film.mjs`'s field, with the record
  top-left and "YouTube · plays here" bottom-left in Flash, and a link to
  the watch page that `src/scripts/aed.js` turns into a button, so Space
  and Enter work and a reader without the script keeps the link. The
  press makes the iframe (`youtube-nocookie.com`, playsinline, `rel=0`, a
  white progress bar, **no autoplay**; the URL is written once,
  `embedUrl()` in `src/lib/films.mjs`) and moves focus into it, and the
  reader then presses the player's own play button: two presses
  everywhere, on a phone and a desk alike. The first cut started the
  player on the press, and the review stopped it: YouTube's embed rules
  (its Required Minimum Functionality) forbid an automatic start with
  less than half the player on screen, and at 1440 by 900 a press on 120
  px of poster started a player 28 percent visible; and the IFrame API
  reference counts a playback toward a video's views only if the player's
  own play button started it, so an autoplay would have thrown the view
  away as well. **Nothing is asked of any other host until that press**:
  the constraint of 21 Oct is kept, and
  `tools/verify.cjs` now proves it rather than assumes it (no built page
  carries an `<iframe`; every player is pressed at 1280 by mouse, 390 by
  Space and 320 by Enter, and the first request off the origin after the
  press must be the embed URL and none may come before; the embed URL and
  the iframe's `allow` carry no autoplay; the poster's focus ring must lie
  inside whatever clips around it; with JavaScript off the poster must be
  the watch-page link; Acid at scale inside a `.player` fails on its own,
  as a thumbnail's does, so the cover above keeps the sequence's loud
  move). The review of the first cut found four more things, each fixed
  before it merged: the focus ring was clipped by the player's
  `overflow: hidden` (the poster clips its own rose now, the box clips
  nothing); the poster's rose field went on drawing after the player had
  replaced it, at 15 fps for as long as the film ran (`field()` stops
  when its svg leaves the document, and a hidden tab no longer overrides
  the off-screen state, an older fault); the two 11 px labels measured
  3.4:1 over the brightest Malachite curve, which no probe reads because
  none reads an SVG background (they sit on strips of the field's own
  colour now, and the record is display type at 24 px and more, where
  3:1 is the floor and it measures above 4:1); and the band read as the
  cover's tail where section 00 is Void too (it takes `ground="bottle"`
  there). The home's film link now goes to the
  edition's `#film` and reads "Film · 7:57" without "· YouTube"; the
  end-of-edition record still links out to YouTube with its thumbnail, as
  the way out. **Embedding the player makes the site an API client under
  YouTube's API Services Terms** (its help page says those terms and the
  Developer Policies apply to the embedded player), which require a
  published privacy policy that says the site uses YouTube API Services
  and links Google's privacy policy, and a link to YouTube's terms, both
  easy to reach: `public/privacy.txt` now opens with the films (what the
  press loads, what applies from then on, that the site receives nothing
  from the player), the uploader's statement follows it, and the rail
  beside every player links `youtube.com · m:ss`, YouTube's terms and
  `/privacy.txt`, and says the player loads on the press and not before.
  The channel's URL is still written only in `src/config.mjs` and
  `public/humans.txt`; the statement does not repeat it. Costs accepted,
  stated plainly: 236 B of script (2,896 of 5,120); after the
  press, YouTube's chrome inside a frame no checker can read, about 0.8
  MB of its scripts, storage under its privacy-enhanced mode, which
  YouTube says does not shape recommendations and does not say is
  nothing, and YouTube's ads where it chooses to show them. No
  `VideoObject` JSON-LD: Google gives video features to a watch page
  whose main content is the video, which an edition page is not. A play
  on the site counts as a YouTube view because the reader presses the
  player's own play button; the Analytics API lists EMBEDDED as a
  playback location, which `tools/youtube-analytics.mjs` can read by
  `insightPlaybackLocationType` once there is traffic. (The first draft
  of this entry cited a line about autoplayed embeds not counting that
  YouTube's help page no longer carries; the IFrame API reference is the
  source.) The PDF in the cover row says "PDF · as printed", because it
  stands beside the page as an equal form and most prints carry text the
  page has since corrected (Findings); the home and the edition's end
  still say "PDF" and "Download the PDF", and the wording of all three
  is the owner's to settle. Still the owner's to judge by eye: whether
  "YouTube · plays here" is cue enough with no icon (the kit draws none,
  and a ▶ is an emoji to `tools/check-brand.cjs`), and whether "Read · 15
  sections" reads well on the page itself. **One the owner must make
  knowingly:** Vercel's Hobby plan is for non-commercial use and its
  fair-use page lists advertising as commercial; YouTube may show ads
  inside the embedded player, and once the channel is in the Partner
  Program the owner earns from them. The builder's reading is that a
  third party's ads inside its own player are not the site's advertising,
  and that reading is worth exactly what Vercel says it is, so it is
  raised here and in chat rather than settled.

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
2. **Resolved 2026-10-18: Edition 02 is sourced and live** (Findings 0g).
   It ships without a PDF, because no print was ever issued: re-rendering
   `source/edition-02/` would print the unsourced chassis, not the page. A
   print of the sourced page, with the dove filled by `doveOfRoses()` and a
   font assertion, is still possible and is the owner's call.
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
10. **Two skills now cover the channel, and they disagree about scope.**
   `.claude/skills/youtube/SKILL.md` lives in this repo and is operations:
   credentials, `list` and `sync`, the private lock, quota, failures. An
   `aedificare-film` skill is synced at the account level (Anthropic
   skills) and is craft: titles, thumbnails, the opening, the Cool Worlds
   visual rule, a sceptic-voice experiment, monetization thresholds. They
   are complementary today and neither restates the other, which is the
   only reason this is not already a problem. It becomes one the first
   time a fact lives in both: this file's own rule is that a restated
   value drifts. The owner's call, and the options are to keep both with
   the split written into each one's header (craft in the account skill,
   operations in the repo skill, neither repeating the other), or to fold
   the craft guidance into the repo so one file governs and
   `tools/check-docs.cjs` can see it. Nothing was copied into the repo
   pending that decision (2026-10-22).

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
   nowhere else on a surface. (Amended 21 Oct 2026: each edition now links
   its own film's watch page, once the film is public, at its end and on
   the home, never embedded; the channel URL itself is still written only
   in those two places. The owner chose the plain link over click-to-play.
   Decisions log. Amended again 26 Oct 2026: the film now also plays on
   its own page, on the reader's click, under the cover; Decisions log.) Still open: **music** (the owner wanted soft
   piano; the pipeline mixes a file the owner downloads from the YouTube
   Audio Library under the voice with `--music`, credit line in the
   description if the track asks for one; a bed computed from the
   equation is the alternative that keeps CC BY possible on the file);
   **cadence** (one film per edition on the day it is issued, which is
   the only cadence the code is the date allows; research says judge
   after fifty uploads and hold one slot); **the three secrets** for the
   upload step (`YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`,
   minted with `tools/youtube-auth.mjs` on the owner's machine after a
   free Google Cloud project with the YouTube Data API enabled; until
   they exist the workflow stops at the artifact; and note **the private
   lock**: YouTube keeps every API upload from a project created after 28
   July 2020 private until the project passes the free API compliance
   audit, so the upload step stages a video in Studio and cannot publish
   it until the audit is done; publishing before that is a hand upload
   from the sheet); **two characters** (owner, 2026-09-24: the
   interactions between characters we design "will have followers if
   we're successful"; a recurring pair in the film voice, the sharp one
   and the slow one, as the infomercial parodies do; Kokoro has fifty
   voices so a second speaker costs nothing; not built, waits on the
   single-voice scripts landing first); **the bed's verdict**
   (keep the computed one, drop it, or send a licensed track); **the
   channel description** (the kit's no tagline and no "Aedificare is"
   rules apply to the About box; the record line is the only text that
   qualifies). "Jacky Tran" in the owner's brief is most
   likely Jake Tran (faceless documentary over stock footage); the owner
   has not confirmed. **The connection** (owner, 2026-09-25: "I'd really
   love to connect you to YouTube somehow; you'd write the descriptions and
   read the analytics"). There is no YouTube connector in the org and none
   is needed: the OAuth client from `tools/youtube-auth.mjs` is the
   connection. Its three values go in two places, the repository's Actions
   secrets for the workflow and the Claude Code cloud environment's
   variables for the builder's sessions. With them the builder can, from a
   session: upload (private, until the compliance audit passes); set the
   generated title, description, chapters, category, language, licence,
   captions and thumbnail on any video the owner uploaded by hand
   (`upload-youtube.mjs --update`, not locked by the audit, so it is the
   path that works today); and read the channel's numbers
   (`youtube-analytics.mjs`). What no API gives: impressions and
   click-through rate, which YouTube shows only in Studio's Reach tab; the
   owner reads those two by eye and the builder reads everything else.
   Before the secrets exist the division of labour is: the owner uploads
   from the release using `sheet.txt` and pastes the video id back so the
   builder can keep its record; after, the owner uploads and the builder
   does the rest. **The Google Cloud project is the owner's existing
   `theoem`** (owner, 2026-10-06: "we have gcp too"); the OAuth client
   lives there. It needs the YouTube Analytics API enabled as well as the
   Data API, which the setup notes had missed. A cloud connector to Google
   Cloud or AWS would not help: a service account cannot act on a YouTube
   channel, only the channel owner's OAuth consent can. From the secrets
   on, `tools/youtube-channel.mjs` matches hand uploads to renders by
   file name, so no video id is pasted back.
   **Connected, 2026-10-17.** The OAuth client lives in the owner's
   Google Cloud project "music" (`gen-lang-client-0610780259`, not
   `theoem` as first planned); the channel account consented through the
   OAuth Playground with the project's own client; the three values are
   repository secrets, so `.github/workflows/youtube.yml` runs from a
   dispatch and no session holds them. The consent screen hard-blocked the
   channel account while the app was In production and unverified (the
   branding check could not confirm the domain), so the token was minted in
   Testing with the channel account as a test user: **it dies seven days
   after consent**, and a lasting token needs either the domain verified in
   Search Console (then In production) or the client moved to a project the
   channel account owns. `probe` ran the same day: the upload stayed
   unlisted, so this project's API uploads are **not locked private**,
   whatever the 2020 note says. `list` matched The Markup's film and Short
   (already up by hand) and named the other renders. Voice samples
   (`tools/voice-samples.mjs`, Release `voice-samples`) went to the owner
   to choose by ear before anything else is uploaded, because the films on
   Releases are all in the Kokoro voice and the channel must not change
   voice after it starts publishing; two designed Gemini voices exist in
   the project for a year from last use. **Uploaded the same evening**:
   six edition films and their Shorts in the ElevenLabs voice and the
   onegov Short, scheduled (Decisions log, "two queues"); `list` reads the channel's
   long uploads as `allowed` and every thumbnail went through, so the
   channel is verified. The Markup was replaced in the new voice the same
   evening (Decisions log). Still the owner's: the lasting token.
   **The channel is the owner's existing one** (owner, 2026-09-25: "I'm
   going to use this channel because people like me and follow me
   already"): "OF8 SupraNational Global Conglomerate", 155 subscribers,
   renamed Aedificare, handle `@aedificare_art` (`@aedificare` belongs to
   an unrelated channel, "ÆDIFICA RE"; `@aedificare.art` was free but the
   owner chose the underscore), avatar and banner from `brand/`, one link
   to the apex. Its URL is written twice and nowhere else: in
   `src/config.mjs`, which feeds the JSON-LD `sameAs`, and in the static
   `public/humans.txt`; change both together. The
   trade-off, said to the owner: subscribers who followed the person may
   not watch the films, which weakens early signals a little; at 155 the
   head start is worth more. **The About box sells** (owner override, same
   day: the record-line description "sells nothing to no one"): it opens
   on the three strongest ledes as hooks, then says what the films cover
   and that the voice is synthetic, then the apex link. It still never
   says "Aedificare is", carries no slogan and no call to action, and
   every claim in it is a lede already on a published page.
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
