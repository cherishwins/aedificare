# Aedificare

Numbered editions. **aedificare.art**

Everything here that is writing is licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/):
quote it, repeat it, translate it, train on it, credit Aedificare and link the edition.
The typefaces are under the SIL Open Font Licence (`public/fonts/`).

## Run it

```bash
npm install
npm run dev       # localhost:4321
npm run build     # -> dist/, then check-brand, check-budget, check-docs
npm run verify    # every page x 10 viewports, needs Playwright + Chromium
npm run og        # regenerate the share cards and their manifest
npm run marks     # regenerate the favicon and icons from the mark seed
npm run social    # regenerate the platform headers, banners and avatars in brand/
npm run video     # render the editions as silent films for YouTube into brand/youtube/, needs Playwright + ffmpeg
npm run film -- --slug edition-03   # the narrated film: script from the built page, Kokoro voice via uv, frames, captions, sheet
```

## How it is built

Astro 7, static output, no adapter, on Vercel. Every page is pre-rendered
HTML. The entire client payload is **under 3 kB gzipped**: the live rose field,
the dove, and the width axis that moves with the reader.

| | |
|---|---|
| Brand | the `aedificare-brand-kit` skill, read at the start of every session; nothing restated |
| Fonts | Bricolage Grotesque (opsz, wdth, wght) and Martian Mono (wdth, wght), self-hosted WOFF2, all axes kept |
| The rose | `r = cos(kθ)`, sampled by `src/lib/rose.mjs` for the live fields, the mark, the favicon and the cards |
| Checks | `tools/check-brand.cjs`, `tools/check-budget.cjs`, `tools/check-docs.cjs` in the build; `tools/verify.cjs` in CI |
| Accessibility | WCAG AA on every surface, zero axe-core violations, verified on the built DOM |

See [`CLAUDE.md`](./CLAUDE.md) for the decisions and the reasoning behind them.
