# Copy for /about, /standards and /amendments

These are drafts in your voice for Prompt 6. Edit anything. Claude Code should paste them in as written and change nothing.

**The brand question:** the brand kit forbids any sentence explaining what Aedificare is or does. These pages never explain the brand. /about is about the person, and /standards is about method. That's the line the film skill suggested: the person carries the contact path, and the brand stays silent. Nothing here begins "Aedificare is".

Lines in **[brackets]** need a decision or a detail from you before they ship.

---

## /about

**seoTitle:** Jesse James, author of the Aedificare editions
**description:** Jesse James writes the Aedificare editions: dated, sourced, long-form pieces on technology. A self-taught developer based in Victoria, British Columbia.

# Jesse James

I write the editions on this site.

Each one starts with something that is already moving: a number in a press release, a claim in a viral post, a line in a filing, a figure everyone repeats. I follow it back to where it came from and publish what I find, with the sources attached.

I'm a self-taught full-stack developer. I learned to code during the pandemic and built the production front ends for Waterworth, Muniworth and the National Strategy Council. I'm certified on Palantir Foundry and AIP. I have a Bachelor of Commerce from the University of Alberta. I live in Victoria, British Columbia.

**Elsewhere** · [LinkedIn](https://www.linkedin.com/in/jessecares) · [YouTube](https://www.youtube.com/@aedificare_art)

**Contact** · [email address to use, e.g. a new address at aedificare.art]

**How these are made** · See the [standards](/standards). Corrections are listed under [amendments](/amendments).

**Reuse** · Everything written here is CC BY 4.0. Quote it, translate it, train on it. Credit Aedificare and link the edition.

*Note for Jesse: I've deliberately left out your other brands so the separation between your tech and geopolitical writing holds. If you'd rather list them, add one line.*

---

## /standards

**seoTitle:** Editorial standards · Aedificare
**description:** How the Aedificare editions are sourced, how opinion is marked, how errors are corrected, and how the films and the AI tools behind them are disclosed.

# Standards

**Sources**
Every figure carries a bracketed number. The number points to a source in that edition's list, with a link. Where a primary source exists, that's the one cited: the filing, the paper, the contract, the datasheet, the bench video.

**Measured and reported**
A figure marked as measured comes from a source that measured it. A figure the press published on a stated day is carried with its date, as reported, and is never re-derived here.

**Opinion**
Opinion is set on its own surface, signed, and labelled View. It never shares a sentence with a cited fact. Everything outside a View is reporting.

**Corrections**
When an edition gets something wrong, a later edition says so by name, with a date, and states what changed. The original stays up with a note pointing to its amendment. **[Confirm this is your rule: earlier editions are never silently edited. If you do fix typos in place, say "Typos are fixed in place; anything that changes meaning is amended in public."]** Every correction is listed under [amendments](/amendments).

**Films**
Each film retells its edition. The narration voice is synthetic. The frames and the music are computed from a formula with a fixed seed. Every film description says so.

**Tools**
**[Your call, but I recommend including it, because Google asks publishers to explain how content is made and readers trust a disclosure more than a discovery:]** Research and drafting use AI tools, including Claude. Every figure links to its source so you can check it yourself, and I decide what is published.

**No advertising**
No ads, sponsors, paywall or sign-up. The site runs no analytics and no ad tracking. On an edition page, the film player doesn't contact YouTube until you press play. Each film also has its own watch page, which exists to show the film, so its player loads from YouTube when the page opens.

**Licence**
CC BY 4.0. Quote, repeat, translate, train. Credit Aedificare and link the edition.

---

## /amendments

**seoTitle:** Amendments and corrections · Aedificare
**description:** Every correction to an Aedificare edition, dated, with what was wrong and the edition that fixed it. Originals stay published with a note to their amendment.

# Amendments

When an edition is wrong, a later edition fixes it in public. The list is generated from the editions themselves.

**18 Oct 2026 · The Floor** amends **15 Sep 2026 · The Markup**
The Markup filled its throughput row from a datasheet: 43.3 Mbps. The builder of the radio had already measured the first version at 15 Mbps on an 8 MHz channel. The price stands. The throughput row does not.

**13 Sep 2026 · The Closest Humans** amends **11 Sep 2026 · The Hand in the Water**
The Hand in the Water read as though the forcing method belonged to Buckmaster and Alpöge. It belongs to Diego Córdoba and Luis Martínez-Zoroa in Madrid. It also named one man where there were two: Alpöge is a co-equal author.

*Note for Claude Code: generate this list from the `amends` field in frontmatter. The two summaries above are the text for the existing entries. Add a `amendSummary` field so future entries carry their own.*
