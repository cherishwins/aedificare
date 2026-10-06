---
name: youtube
description: Run the Aedificare channel (@aedificare_art) from a session. Use when the owner says upload, publish, YouTube, Studio, the channel, a video id, captions, thumbnail, description, analytics, views, retention, or "what's on the channel"; when a film or episode render finishes; and before telling the owner anything about how a video is doing. Lists the channel against the renders on Releases, sets the generated metadata on hand uploads, uploads privately through the API, and reads the numbers.
---

# The channel

CLAUDE.md (overrides 6 to 8, Open 9, the File map entries for the tools
named here) holds the decisions and the reasons. This file is how to act on
them. If the two disagree, CLAUDE.md wins and this file gets fixed in the
same commit.

## Before anything: are the credentials here?

```sh
node -e "for (const k of ['YT_CLIENT_ID','YT_CLIENT_SECRET','YT_REFRESH_TOKEN']) console.log(k, process.env[k] ? 'set' : 'MISSING')"
```

Print only set or missing, never a value. If any is missing, nothing below
works from the session. Say so in one line and give the owner the setup in
`tools/youtube-auth.mjs` (its header is the current, tested procedure:
two APIs to enable, the consent screen in production, a Desktop client,
the token minted on their own machine). The three values go in two places,
both set by the owner: the repository's Actions secrets, and this cloud
environment's variables. They never go in chat, a commit, a PR, an issue
or a log line. If the owner pastes one into chat anyway, say it is now
exposed and ask them to rotate it (delete the client in Google Auth
Platform, make a new one, mint again); do not use it.

The token must carry the four scopes `tools/youtube-auth.mjs` asks for. A
403 naming "insufficient scopes" means it was minted before the read
scopes; a 403 naming "has not been used in project" or "is disabled" means
the YouTube Analytics API (a separate API from the Data API) is not
enabled in that Google Cloud project.

## What is on the channel, and what is not yet

```sh
node tools/youtube-channel.mjs list
```

Every upload with its privacy, date, length, views, uploaded file name,
and the release render it matches; then every render on Releases that is
not on the channel. Writes `brand/youtube/channel.json` (gitignored).
Matching is by the uploaded file's name (the Data API shows the owner's
original file name), falling back to an identical title of the same kind
(film or Short). So the owner uploads the file exactly as downloaded from
the release, and no video id is ever pasted back.

Read this before every answer about the channel. Do not answer from memory.

## Getting a render onto the channel

There are two routes, and the choice is about the **private lock**: every
video the API uploads stays private until the Google Cloud project passes
YouTube's API compliance audit (free form, days to weeks;
support.google.com/youtube/contact/yt_api_form), and Studio cannot make it
public. Metadata edits are not locked.

**Until the audit passes (the default route):**
1. The owner downloads the film from the release `film-<slug>` (or
   `film-ep-<slug>`) and uploads it by hand in Studio with its file name
   unchanged, setting visibility there.
2. The session runs:
   ```sh
   node tools/youtube-channel.mjs sync --dry   # the plan
   node tools/youtube-channel.mjs sync         # title, description with chapters and sources, category, language, licence, captions, thumbnail
   ```
   A video whose title and description already match is skipped (`--force`
   overrides). `--only film-ns-02` limits it to one release.

**After the audit passes:** dispatch `film.yml` (it uploads whenever the
secrets exist) or `episode.yml` (`upload=film` is its default). The
workflow renders, files the release and uploads private. Before the audit
the same runs also upload, private and locked, and spend 3,200 units for
the film and its Short. That is harmless but wasted, so dispatch
`episode.yml` with `upload=no` until the audit passes.
The owner watches it in Studio and presses Publish.

Either way, **nothing goes public from a machine.** Never pass
`--privacy public` and never set a video public through the API. The owner
watches every film before it is public.

## What must be true before a render goes up

- **No slates.** An episode render lists every missing shot in `shots.md`
  on its release, and each one plays as a slate. If any box there is
  unticked, the film is a draft: say which shots are missing and do not
  ask the owner to upload it. (`film-ep-softbank-975` rendered on 26 Sep
  with all fourteen missing.)
- **Facts held.** Episodes pass `node tools/episode.mjs check source/episodes/<slug>.md --online`
  (every numbered sentence has a source with a URL and date, every quote is
  on its page). Edition films read a published page that was fact-checked
  when it was ported.
- **The metadata passed** `upload-youtube.mjs`'s limits: title 100
  characters, description 5,000 bytes, no `<` or `>`. The renderer checks
  these, so a render that finished has passed them.
- **Licence `youtube`** (Standard YouTube Licence), not Creative Commons.
  `containsSyntheticMedia` false: the voice is synthetic, but it reads an
  original script and imitates no one, which is not one of YouTube's
  disclosure triggers. The page's text stays CC BY, and the description
  says so.

## Reading the numbers

```sh
node tools/youtube-analytics.mjs --days 28 --retention
```

Views, watch time, average view duration and percentage, subscribers,
traffic sources and retention curves, per video. **Impressions and
click-through rate are not in any API**, only in Studio's Reach tab. Ask the
owner for those two, and never estimate them. The diagnostic for a new
channel is CTR against average view duration (CLAUDE.md, the narrated
films). With fewer than fifty uploads, report what each video did and draw
no conclusion about the channel.

## Quota

10,000 units a day per project. A list costs a few units. A sync that
changes a video costs about 500 (update 50, captions 400, thumbnail 50).
An API upload costs 1,600. A full sync of every release fits in one day; a
second forced sync the same day may not.

## When something fails

- `invalid_grant` on token refresh: the refresh token was revoked, or it
  expired because the consent screen is still in Testing (seven-day tokens).
  The owner publishes the app and mints again.
- Thumbnail 403: the channel is not phone-verified. The video still
  updated.
- A video shows `no render`: it was uploaded under another file name and
  title. If it is one of ours, the owner can set its title to the
  render's, or run `node tools/upload-youtube.mjs <meta.json> --update <id>`
  directly on a meta downloaded from the release.
