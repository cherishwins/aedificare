# The desk: the prompt for Grok App Builder

The owner runs this on the existing app at apt.grok.me. It turns the desk
into a companion of aedificare.art instead of a second copy of it. The
reasoning is in CLAUDE.md ("The desk at apt.grok.me is a companion, not a
mirror"). After Grok has run it, the builder curls the desk and checks it
against the checklist at the end. Paste everything below the rule.

---

Edit the existing app at apt.grok.me. Keep its routes and the text of its
pieces. Change it so it supports https://aedificare.art instead of
duplicating it. Do exactly what follows and nothing more.

IDENTITY

- This app is the desk of Aedificare: where drafts sit before they are
  issued at https://aedificare.art. It is not the site, and it never
  carries a copy of anything the site has issued.
- The document title is "Aedificare · Desk". og:title is the same. The
  separator everywhere is " · " (a middle dot with a space each side).
  There is no em-dash anywhere in the app, in copy or in code strings.
- meta description and og:description: "The desk of Aedificare. Drafts
  before they are issued, and the index of what has been issued at
  aedificare.art."
- og:image is https://aedificare.art/og/desk.png with og:image:width 1200
  and og:image:height 630. og:image:alt is "Aedificare share card: DESK in
  acid green type over a green rose curve." twitter:card is
  summary_large_image with the same image and alt.
- Every page has <meta name="robots" content="noindex">. If the platform
  lets you serve /robots.txt, serve "User-agent: *" and "Disallow: /".
  Drafts are not for crawlers; the issued editions at the apex are.
- The web manifest name, if there is one, is "Aedificare · Desk".

TYPE

- Remove Google Fonts: the stylesheet link and both preconnects. Load the
  two faces from the site's own files, which are served with CORS open:

  @font-face { font-family: 'Bricolage Grotesque';
    src: url('https://aedificare.art/fonts/BricolageGrotesque.woff2') format('woff2');
    font-weight: 200 800; font-stretch: 75% 100%; font-display: block; }
  @font-face { font-family: 'Martian Mono';
    src: url('https://aedificare.art/fonts/MartianMono.woff2') format('woff2');
    font-weight: 100 800; font-stretch: 75% 112.5%; font-display: block; }

  Preload both with <link rel="preload" as="font" type="font/woff2"
  crossorigin>. font-display is block, never swap.
- Bricolage Grotesque for everything except labels, codes, dates and
  figures, which are Martian Mono. No third typeface.

COLOUR

- Exactly six colours, as CSS custom properties, and no other colour value
  anywhere: --void #050A06, --bottle #063B22, --malachite #00B24F,
  --acid #CCFF00, --flash #FFFFFF, --shock #FF1F5A. Remove every other
  value, including #8AAE96.
- Body text is --flash on --void or --bottle. Text under 24px in
  --malachite never sits on --bottle; use --flash there. --shock text sits
  only on --void. --acid is never body text: it is the one loud element on
  a surface, at scale (a word of 24px or more, or a stroke of 200px or
  more), once per surface.

MASTHEAD

- Top-left on every page: the mark, then "Aedificare", then "Desk" as a
  Martian Mono label. The mark is the site's own file, hotlinked and not
  redrawn: <img src="https://aedificare.art/favicon.svg" alt="" width="28"
  height="28">. Do not draw a logo, a rose or a dove of your own.

INDEX

- The first section after the masthead on the home is the index of issued
  editions. Do not type it. On load, fetch https://aedificare.art/index.json
  (JSON, CORS open). Its shape:

  { "name": "Aedificare", "author": "...", "origin": "https://aedificare.art",
    "licence": { "name": "CC BY 4.0", "url": "..." },
    "editions": [ { "date": "2026-09-15", "dateLabel": "15 Sep 2026",
      "title": "The Markup", "url": "https://aedificare.art/edition-03",
      "lede": "...", "note": null, "pdf": "https://aedificare.art/pdf/edition-03.pdf" } ] }

  Render each edition, in the order given (newest first), as one block
  link to its url: the dateLabel in Martian Mono, then the title in
  Bricolage Grotesque. Show nothing else from the JSON.
- If the fetch fails, render one block link, "Index · aedificare.art", to
  https://aedificare.art/. Never a typed list as the fallback.

DRAFTS

- The pieces on the desk (The One Machine, The Mouths, The Example) are
  drafts. Remove their codes (NS-03, NS-04) and their dates (15 Sep 2026,
  "Filed beside NS-03"). Each carries one Martian Mono label: "Draft · not
  yet issued". A draft has no date and no code. Its date is set on the day
  it is issued, on the site.
- Keep each draft's text unchanged.
- When a draft is issued on the site, remove its text from the desk and
  leave a one-line pointer in its place: the dateLabel, the title, and a
  block link to the site's URL. The desk never carries a copy of an issued
  edition.

LINKS

- Every link to the site uses https://aedificare.art with no www.
- Links are block links: their own line, full width, found by structure.
  Never a link inside a paragraph, never underlined, never distinguished
  by colour alone.

RULES, everywhere, all checkable

- No border-radius above 2px. No box-shadow, text-shadow, filter,
  backdrop-filter or gradient.
- No italic and no underline, as CSS or as tags (i, em, u).
- Nothing centred: no text-align center, no margin auto centring, no
  justify-content or align-items center on layout.
- Transitions and animations last 120ms or 900ms only, with linear or
  steps() timing. Never ease, ease-in, ease-out or a cubic-bezier.
- No exclamation mark in a heading. No emoji. No tagline. No call to
  action: no "read", "explore", "discover", "subscribe", "follow", "join".
  No sentence beginning "Aedificare is". Never say what Aedificare does or
  what the name means. None of these words: leading, premier, innovative,
  world-class, bespoke, curated.
- Display copy is twelve words or fewer. One loud element per surface.

CHECK before you finish, and list each result

1. The page source contains no "—" character.
2. Every page has <meta name="robots" content="noindex">.
3. No request goes to fonts.googleapis.com or fonts.gstatic.com.
4. Every colour value in the CSS is one of the six.
5. The index renders from index.json, and the fallback link renders when
   the fetch fails (test once by pointing at a wrong URL, then restore).
6. Every link to the site starts with https://aedificare.art/.
7. No code or date appears on a draft.
