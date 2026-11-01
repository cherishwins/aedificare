# Releasing The Night Pin

The Night Pin (Edition 11, 30 Oct 2026) is held: built and live at
`/the-night-pin`, but `draft: true` in `src/lib/editions.mjs` keeps it out of
search and out of every list. That flag does the hold's work, the same way
The Grade is held, with one typed line beside it (the print's header, which
`vercel.json` cannot read from the flag and `tools/check-contents.cjs` holds
to it):

- the page carries `noindex, nofollow`;
- `robots.txt` disallows `/the-night-pin` for every crawler but Googlebot and
  Bingbot, which may fetch it so that they read its `noindex` (a page robots.txt
  blocks can still be listed bare when someone links it);
- its print, `/pdf/edition-11.pdf`, answers with `X-Robots-Tag: noindex` in
  `vercel.json`, which `tools/check-contents.cjs` requires of a draft's print;
- it is left out of the home index and the masthead;
- it is left out of the sitemap and the news sitemap;
- it is left out of the feed, `llms.txt` and `index.json`.

## Before the flip (the owner's)

1. The owner's yes on the View (section 15), which goes out under their name.
2. The owner's yes on the title, still a working title.
3. NCSL's voter-file counts confirmed against its current page. The page
   prints 29 / 9 / 12. NCSL refused this sandbox, and the EAC table of
   January 2023, built partly from NCSL, gives 26 / 12 / 12
   (`research/the-night-pin/VERDICTS.md`, row 8.2).
4. The other owner items in `VERDICTS.md`'s "For the owner" list.

## The flip, in one PR

1. In `src/lib/editions.mjs`, delete `draft: true` from the-night-pin's entry
   and set its `date` and `dateLabel` to the day it goes live, because the
   code is the date.
2. Re-check its dek, seoTitle and description against the page, as
   CLAUDE.md requires for any packaging change.
3. In `vercel.json`, take `X-Robots-Tag: noindex` off `/pdf/edition-11.pdf`
   and add `<https://aedificare.art/the-night-pin>; rel="canonical"` to its
   `Link`, as every published print carries; `tools/check-contents.cjs` fails
   until both are done.
4. Run `npm run og`, then keep only the cards whose content changed: The
   Night Pin's (its date) and the home's (it counts published editions).
   Restore every other card to its committed bytes (CLAUDE.md,
   Discoverability).
5. `npm run build` and `node tools/verify.cjs`, both clean. The discovery
   gate then requires the page in the sitemap.
6. Merge. IndexNow sends `/the-night-pin` and `/` once the deploy is live,
   now that the apex serves without a redirect (Open 1, resolved 1 Nov 2026).
7. Update CLAUDE.md's Shipped table from **held** to **live**.
