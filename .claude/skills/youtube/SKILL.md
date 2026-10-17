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

The three YouTube values live only in the repository's Actions secrets (no
session holds them), so the channel is run by dispatching
`.github/workflows/youtube.yml`: `probe`, `list`, `upload`, `sync`. Its
summary is the log; read it with the job logs.

**Rendering is the queue's job.** The voice is ElevenLabs on the owner's
paid plan (CLAUDE.md, override 6): 40,000 credits a month, about 0.2 a
character on eleven_v4_turbo, so a film is about 2,000 to 3,000.
`film-queue.yml` renders every published edition not yet in the voice each
morning, one at a time; narration is cached under `narration-<slug>` in the
Actions cache, and spent credits end a run green with a warning and file
nothing. Dispatch a render **on `main`** when one is needed outside the
queue: a cache written on a branch cannot be read by the queue on `main`.
`film.yml` and `episode.yml` render and file to Releases only; for an
episode pass `upload=no`, because `youtube.yml` is the one uploader. Before
a new voice or engine spends a film's credits, prove it on the passage:
`voice-samples.yml only=narrate narrator=<NARRATOR>`.

**Uploading.** The probe of 2026-10-17 found this project's API uploads
NOT locked private, so the API route works:

```
youtube.yml  action=upload  privacy=private  publish_at=<ISO time>  every_hours=24
```

It uploads every render not yet on the channel, oldest edition first, a
film before its Short, at most `max` a run, files each video's id back on
its release (`youtube.json`), and refuses: a render with unticked shots in
`shots.md` (slates), a render whose description names a voice other than
the channel's (the Releases still hold Kokoro films until the queue
re-renders them), and `public`. With `publish_at` each video stays private
until YouTube publishes it at that time; `every_hours` spaces a batch. Run
`dry=true` first and read the plan.

**A video already up in an older voice** (The Markup's film and Short,
uploaded by hand in Kokoro before the voice changed) is matched to its new
render by file name, so `list` marks the pair OLDER VOICE, `sync` refuses
to put the new captions and chapters on the old audio, and `upload` leaves
the new render alone unless `--replace-old-voice` is passed. Replacing a
live video is the owner's call; ask, and say what the old one has earned so
far. Once they say so: `upload` with `replace_old_voice=true` (and `only`
the release) puts the new pair up scheduled, then `retire` after the new
film is public sets the old video private. It never deletes (views and
comments stay, the owner can restore it in Studio) and never acts while
the replacement is still private or scheduled, so run it after each new
video's publish time. The owner said replace The Markup on 2026-10-17.

**Hand uploads** still work: the owner uploads the file exactly as
downloaded from the release, and `youtube.yml action=sync` sets the
generated title, description with chapters and sources, category,
language, licence, captions and thumbnail.

Either way, **nothing goes public from a machine without the owner's say.**
Never pass `--privacy public`. A scheduled `publish_at` is the owner's call
(on 2026-10-17 they asked for the films to go out: "let's get our work out
there"), and a scheduled video can be changed or cancelled in Studio until
its time.

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
- **Over fifteen minutes needs a verified channel.** `list` prints the
  channel's `longUploadsStatus`; unless it is `allowed`, YouTube takes a
  longer upload and then rejects it for length, so `upload` refuses a film
  over 900 s unless the status is `allowed`, and holds that film's Short
  with it (the Short's description points at the film). `eligible`: the
  owner verifies by phone at youtube.com/verify (the same step lifts the
  thumbnail 403 below) and the next run takes both. `disallowed`: the
  channel is not in good standing, and verifying does not lift it. The
  channel read `allowed` on 2026-10-17. The Tilt Gap's film runs 20:46;
  every other edition film is under fifteen.
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
An API upload costs about 500 more (since 1 June 2026 videos.insert has
its own bucket of 100 a day; captions, thumbnail and listing come out of
the 10,000). A full sync of every release fits in one day; a second forced
sync the same day may not. The voice has its own limit: the ElevenLabs
plan's monthly credits (the run's log prints what it spent and what is left).

## When something fails

- `invalid_grant` on token refresh: the refresh token was revoked, or it
  expired because the consent screen is still in Testing (seven-day tokens;
  the token minted on 2026-10-17 dies about 24 October). The lasting fix is
  aedificare.art verified in Search Console, then the app In production,
  then mint again (CLAUDE.md, Open 9).
- A film run ends green with "the credits are spent" (ElevenLabs) or "the
  day's Gemini quota ran out": the narration so far is cached and the next
  run continues once credits are back; tell the owner the reset date. A run that fails on "would not align after 3 tries" means
  Gemini keeps saying that chunk differently from the text: look at the
  chunk's words (a token spelled oddly) and fix the spelling or the text.
- Thumbnail 403: the channel is not phone-verified. The video still
  updated.
- A video shows `no render`: it was uploaded under another file name and
  title. If it is one of ours, the owner can set its title to the
  render's, or run `node tools/upload-youtube.mjs <meta.json> --update <id>`
  directly on a meta downloaded from the release.
