# Skeptic 19: Side by side, chips and money (edition "Waiting for the Tie-In", 15 Oct 2026, section 08)

Checked against: research/waiting-for-the-tie-in/lane-19.md
Read date for all checks: 2026-11-01
Edition text: I opened all 16 pages of the user's PDF. The researcher opened only pages 7-8 and 12-16 (the file says "12-17", but the PDF has no page 17). Pages 1-6 and 9-11 hold no chips-and-money table either. The only "Side by side" page is page 13 (capacity, reactors, storage, accelerators), so the four rows in this lane are not in the PDF. I checked the row wording against the site source instead: src/pages/waiting-for-the-tie-in.astro lines 251-254 and the source list at lines 143-146. Those lines match the lane file's claim text. The site source also settles one thing the lane file leaves open: cite 67 is "Data Gravity. China's open-weight takeover, 2026 (secondary). datagravity.dev/p/chinas-open-weight-takeover".

Tooling limit: the shared WebSearch budget for this run was already used up before my first search ("this turn's web search budget is used up (limit: 200 WebSearch calls per turn, shared by every agent in it)"). Every check below rests on pages I opened directly with WebFetch. Where a negative needed a targeted search and I could not run it, I say so. Those negatives are still open, not settled.

## 19.1. Big-tech AI capex, 2026 | $102B | $764B | Goldman Sachs, via Dealroom (cite 65)
Skeptic verdict: **upheld** (the "could not open" verdict stands; the notes need caveats)

Source reopened: https://app.dealroom.co/news/note/china-s-hyperscalers-trail-us-ai-capex-roughly-8-to-1-goldman-sachs-estimates
Result: "The server returned HTTP 403 Forbidden. The response body was not retrieved." This is the same wall the researcher hit, and I did not work round it.

Findings:
1. The verdict stands. Neither the cited page nor the Goldman primary could be opened. I could not search for a public Goldman Sachs page (search budget used up), so the claim that the primary is "not reached" is still open, not settled.
2. The researcher's "True as" figures ($102B and $123B for China; $757B to $765B for the US) and every note figure come from aggregator pages and "search summaries" with no URLs recorded. None of them can be reopened from the file. They must not be used as a basis for printing. The file should say "unverified, from search summaries" next to each.
3. Scope, from the headline alone: the Dealroom headline (in the researcher's file and the site's source list) reads "China's hyperscalers trail US AI capex roughly 8 to 1". It does not say "by 2027". The edition puts the 8-to-1 ratio in 2027 and the dollar figures in 2026. Whether the Dealroom note gives 8 to 1 for 2026 or for 2027 cannot be settled until the page opens. (The edition's own 2026 figures give $764B / $102B = 7.5 to 1.)
4. The negative "The 'big four' and 'big five' labels in the claim are not confirmed by any source opened" is accurate, but no source was opened at all. It is not evidence that the labels are wrong.

Notes should add: "All figures in True-as and Notes are from search summaries and aggregator pages whose URLs were not recorded; unverified." True-as stands: "Not settled."

## 19.2. Best model, Arena score | 1,464 | 1,503 | Stanford AI Index 2026. A 2.7% gap. US ahead, narrowly. (cite 66, Implicator)
Skeptic verdict: **amended** (the true-as stands; the verdict label and one note are wrong; a flag for the owner)

Sources reopened:
- Stanford HAI, AI Index 2026, Technical Performance: https://hai.stanford.edu/ai-index/2026-ai-index-report/technical-performance
- Implicator (cite 66): https://www.implicator.ai/stanfords-2026-ai-index-puts-us-lead-over-china-at-2-7-as-deepseek-v4-stalls/ (byline "Marcus Schuler", "April 13, 2026, 9:29 AM PST")

Verbatim, confirmed (Stanford, WebFetch extraction):
- Section 4 heading: "The U.S.-China AI model performance gap has effectively closed."
- Section 4 body: "As of March 2026, the top U.S. model leads by 2.7%," then "with a gap that fluctuated over the past year while remaining in the single digits."
- Chart caption: "U.S. models lead throughout, reaching 1,503 versus 1,464 for the top Chinese model in 2026."
- Section 2 body: "As of March 2026, Anthropic (1,503), xAI (1,495), Google (1,494), OpenAI (1,481), Alibaba (1,449), and DeepSeek (1,424) all occupy the top tier of the Arena Elo ratings..."
- Section 5 body: "Separate research suggests that Arena leaderboard standing may partly reflect adaptation to the platform..."

Verbatim (Implicator): "The gap between Anthropic's Claude Opus 4.6 and ByteDance's Dola-Seed-2.0 Preview is 39 Elo points." "In percentage terms, 2.7%." "That is the US lead in artificial intelligence as of March 2026".

Findings:
1. The quotes are on the page and the context does not change them. The figures, the 2.7% and the direction are Stanford's. The arithmetic checks: (1,503 - 1,464) / 1,464 = 2.66%, which rounds to 2.7%.
2. **The verdict label is wrong.** Nothing in the row is overstated. The numbers, the gap and "US ahead" are exactly what Stanford says. "Narrowly" is milder than Stanford's own heading ("effectively closed"), not stronger. The only fault is the missing date: in an October 2026 edition, the row does not say the snapshot is from March 2026. That is a scope gap. The verdict should read "holds with scope: as of March 2026".
3. **One note is not supported.** "the Arena data was exported then" is not on Stanford's page. The extraction found no export date ("Data export date: Not shown"). Stanford says only "As of March 2026". Delete "and the Arena data was exported then".
4. Note confirmed: Stanford's page names only the "Arena Leaderboard". It does not say which board (text or other) or whether style control was used. Stanford also flags the method itself (Section 5, above). That caveat belongs in the notes.
5. Better primary: none needed. Stanford HAI is the primary and it was reached. The models (Claude Opus 4.6 against Dola-Seed-2.0 Preview) are named only by Implicator, not on Stanford's chapter page.
6. **Flag for the owner (characterisation of Anthropic):** the US figure in this row, 1,503, is Anthropic's score. Stanford writes "Anthropic (1,503)" at the top of its list. Implicator names the model as "Anthropic's Claude Opus 4.6" and writes "Anthropic leads the Arena this week." These are reported here as the sources wrote them. The researcher's file names Claude Opus 4.6 but does not flag it.

The page should say instead: "Best model, Arena score, Mar 2026 | 1,464 | 1,503 | Stanford AI Index 2026. A 2.7% gap. US ahead, narrowly." (The only change is the date on the label.)
True-as stands: "As of March 2026, the top US model led the top Chinese model on the Arena leaderboard, 1,503 to 1,464, a 2.7% lead."

## 19.3. Open-weight downloads, share | ~41% | ~45% | Hugging Face trailing year, mid 2026, via secondary reporting. (cite 67, Data Gravity)
Skeptic verdict: **amended** (the "wrong" verdict stands, on stronger grounds than the researcher gave; two notes are wrong; the true-as needs the ranking)

Sources reopened:
- Hugging Face, "State of Open Source on Hugging Face: Spring 2026": https://huggingface.co/blog/huggingface/state-of-os-hf-spring-2026 (published March 17, 2026; authors Avijit Ghosh, Lucie-Aimée Kaffee, Yacine Jernite, Irene Solaiman)
- The cited secondary, cite 67 (site source list, astro line 145): https://www.datagravity.dev/p/chinas-open-weight-takeover ("China's Open-Weight Takeover", by Chris Zeoli, published Jun 24, 2026). It opened directly on my fetch, with no redirect.

Verbatim (Hugging Face, WebFetch extraction):
- "Hugging Face data shows China surpassing the U.S. in monthly downloads and overall downloads."
- "In the past year, Chinese models quickly accounted for the plurality or 41% of downloads."
- "The U.S. and China have historically been top contributors, with the UK, Germany, and France as secondary in popularity."

Verbatim (Data Gravity): "China accounted for ~41% of all Hub downloads over the trailing year." The page has no inline citation for the figure. It gives no US download share ("The article gives no U.S. download share or U.S. download figures").

Findings:
1. **The US figure is contradicted, not just unsupported.** Hugging Face's own report calls China's 41% "the plurality" and says China passed "the U.S. in monthly downloads and overall downloads." A plurality of 41% means no other country had more. So the US share was below 41%, and the row's "~45%" (with the US bar longer than China's) reverses the order. The cited secondary gives no US figure at all. The researcher's "wrong" verdict stands. Its grounds should be this contradiction, not "no source in the material I opened".
2. **The window note is half wrong.** The researcher says the window is "about a year ending Feb 2026, not 'mid 2026'". The cited secondary is dated 24 June 2026 and says "over the trailing year". So the edition's "trailing year, mid 2026, via secondary reporting" describes the cited page accurately. The figure is the same 41% that Hugging Face published on 17 March 2026 for "the past year". Most likely Data Gravity repeats that figure rather than giving a new mid-2026 window, but Data Gravity does not cite it, so this is not settled. The "Feb 2025 to Feb 2026" window rests only on an unopened search summary.
3. **The Data Gravity note is out of date.** The file says the page "redirected off-domain and was not followed". It opened directly for me on 2026-11-01. The lane file also never names it as cite 67, but the site's source list does.
4. The US 36.5% (search summary) is still unverified. I could not search to reopen it (budget used up). Do not print it.
5. Better primary: Hugging Face is the primary, and it was reached. The blog credits some charts to Longpre et al., "Economies of Open Intelligence: Tracing Power & Participation in the Model Ecosystem". That paper may hold the per-country split, including a US figure. I could not open it or search for it. That is still open.

The page should say instead: "Open-weight downloads, share, year to Mar 2026 | ~41% | less | Hugging Face, Spring 2026: Chinese models the plurality; China passed the US in overall downloads. China ahead." The US column takes no number until a source gives one. If a number is required, use one only from an opened primary (for example Longpre et al.), never the search summary.
True-as should read: "Chinese models took about 41% of Hugging Face downloads over the past year, the plurality, and China passed the US in overall downloads, per Hugging Face's spring 2026 report (17 March 2026). No US share is given."

## 19.4. iPhones assembled | >70% | 0% | China against the United States. India about 25%. Bloomberg via Tech Wire Asia. (cite 68)
Skeptic verdict: **amended** (the "could not open" verdict stands for the China and US columns; the quote leaves out a qualifier and a figure on the same page)

Sources reopened:
- Tech Wire Asia (cite 68): https://techwireasia.com/2026/03/apple-iphone-production-india-25-percent-global-output/. Result: empty body again ("The web page content you included appears to be empty"). Same as the researcher found.
- Bloomberg: https://news.bgov.com/international-trade/apple-now-makes-about-25-of-iphones-in-india-after-china-pivot (headline "Apple Now Makes About 25% of iPhones in India After China Pivot"; "March 10, 2026, 2:47 AM UTC"; byline "Sankalp Phartiyal")

Verbatim (Bloomberg, visible text before the paywall, WebFetch extraction):
- "Apple Inc. increased iPhone production in India by about 53% last year and now makes a quarter of its marquee devices there," then "reflecting the US company's efforts to avoid tariffs on China."
- "The company assembled about 55 million iPhones in India in 2025, up from 36 million a year earlier," then "people familiar with the matter said, asking not to be named because the numbers aren't public."
- "Apple makes about 220 million to 230 million iPhones a year globally," then "with India's share of the total increasing rapidly."
- The visible text ends at "Apple has accelerated its expansion in the world's most populous country in recent years, ..." and then "Log In to keep reading".

Findings:
1. The researcher's quotes are on the page, verbatim. But the 55-million sentence goes on: "people familiar with the matter said, asking not to be named because the numbers aren't public." That clause changes the figure's status. It is an unofficial figure from unnamed sources, not an Apple disclosure. The true-as must say so.
2. The researcher missed a figure on the visible page: "about 220 million to 230 million iPhones a year globally." That is the denominator. 55 / 220 to 230 = 24% to 25%, which matches "about 25%". It belongs in the true-as.
3. The China (">70%") and US ("0%") columns: the visible Bloomberg text gives neither, and Tech Wire Asia is still blank. The researcher's negative ("I did not find a source for 0%; this is not a claim that none exists") is stated fairly. I could not run the search that might overturn it (budget used up), so it is still open. Arithmetic is not a source: 25% India does not by itself make China ">70%", because Bloomberg's visible text names no other countries' shares.
4. The Smart Analytics (74%, 23%, 28%) and Counterpoint (26%) figures carry no URLs, so I could not reopen them. Unverified. Apple's supplier list is still unchecked.
5. Scope: the edition's row gives no year. Bloomberg's figures are for calendar 2025 ("in 2025", "last year"), reported 10 March 2026.

The page should say instead, until the China and US figures are sourced: "iPhones assembled, 2025 | not settled | not settled | India about 25% (about 55 million of 220 to 230 million), per people familiar with the matter, Bloomberg, Mar 2026." Run the China and US columns only once an opened source gives them.
True-as should read: "Bloomberg reported on 10 March 2026, citing people familiar with the matter who said the numbers aren't public, that Apple assembled about 55 million iPhones in India in 2025, up from 36 million in 2024, out of about 220 million to 230 million a year globally, a quarter of its output. The China and US shares are not settled."

## Counts
upheld 1 (19.1) · overturned 0 · amended 3 (19.2, 19.3, 19.4)
