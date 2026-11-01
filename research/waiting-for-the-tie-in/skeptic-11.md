# Skeptic, lane 11: "Waiting for the Tie-In" (Aedificare, 15 Oct 2026), claims 11.1 to 11.4

Checked against: research/waiting-for-the-tie-in/lane-11.md. Read: 2026-11-01.
Tally: upheld 2 (11.1, 11.3), overturned 1 (11.4), amended 1 (11.2).

The researcher's verdicts should read:
- 11.1 could not open (stands). The 73.2% is now confirmed on NAHB's page. The dollar level is still unverified.
- 11.2 holds, but the primary is Census Table 1 in the cited PDF, not NAHB. Add Census's own error margin.
- 11.3 holds.
- 11.4 holds. NAHB's own September post says "lowest level since September 2025". The researcher said there was no NAHB September release. There is one.

Also checked: the user's uploaded PDF, the edition's 16-slide carousel. Slide 09 ("US CONSTRUCTION SPENDING · AUG 2026", credited "US CENSUS BUREAU, OCT 2026") carries 11.1 and 11.2: "+73% DATA CENTRES. −3.5% SINGLE-FAMILY HOMES." The slide does not print the 85-billion level. No slide carries 11.3 or 11.4; those appear only on the site (the chain "Housing starts" card, src 'Census; NAHB', and the model readout, which divides by 918000; src/pages/waiting-for-the-tie-in.astro lines 193 and 311).

Limits on this check: the session's web-search budget was used up on my first search, so I ran no targeted searches. Every check below is a direct fetch. Census xlsx tables (privsatime.xlsx) download, but the fetch tool cannot read them, and this session has no shell. The Census data API (api.census.gov) returned "Missing Key" ("A valid key must be included with each data API request"). That is a wall, and I did not route around it.

No characterisation of Anthropic appears in this lane.

## 11.1. Data-centre construction ran at an annualised 85 billion dollars in August 2026, up 73 percent in a year (Census; cites 20)
Researcher's verdict: could not open. **Skeptic: upheld.** I add the following.

Evidence:
- Census release CB26-158, 1 Oct 2026, https://www.census.gov/construction/c30/pdf/release.pdf. I opened the PDF and read all five pages, including Tables 1 to 3. Table 1 lists Private Nonresidential > "Office" at 134,119 (Aug 2026) against 103,300 (Aug 2025), +29.8%. **The table has no data-centre row anywhere.** This confirms the researcher: cite 20 does not carry either half of 11.1.
- NAHB, Catherine Koh, 1 Oct 2026, https://eyeonhousing.org/2026/10/private-residential-construction-spending-posts-broad-based-gains-in-august/. Two separate fetches returned the same sentence. The tool gave it as quoted fragments: "Data center construction, a subcategory within office construction," ... "remained strong with spending increasing 7.5% month-over-month and 73.2% year-over-year," ... "due to buildout of artificial intelligence infrastructure." The researcher treated 73.2% as a tool summary. It appears on the page inside a quoted fragment. Also on the page: "The share of data centers as a percentage of spending on total private nonresidential construction" ... "surpassed 10% in July 2026." The page gives no dollar level for data centres.
- Census definitions, https://www.census.gov/construction/c30/definitions.html, under Office: "Data center: Includes buildings that contain the hardware needed for storing, processing, and transmitting digital information." The exclusions say servers are not counted: "racks or servers in data centers." This confirms the researcher's scope note, which rested on an unopened 2024 snippet. The figure counts the building, not the equipment inside it.

Findings:
(a) The researcher's negative holds: the cited release has no data-centre figure. I could not open the Census table that has one either (see Limits).
(b) Arithmetic check, not verification. The unopened snippet gave $84.95B for Aug 2026 and $49.05B for Aug 2025. That pair gives +73.2%, which matches NAHB. With NAHB's +7.5% month on month, July comes out at about $79.0B. That is 10.3% of July private nonresidential ($764,979M in Census Table 1), which agrees with NAHB's "surpassed 10% in July 2026". The implied July-to-August rise of about $5.9B also equals the rise in Census private office ($128,199M to $134,119M). The 85 billion is consistent with three published figures, but it still is not read from a Census table.
(c) Scope: the figure is nominal, at a seasonally adjusted annual rate, and compares one month with the same month a year earlier. It covers private construction only and excludes servers.

The page should say: keep the sentence only once the level is read from Census privsatime.xlsx (row "Data center", under private Office). Until then, the smallest change is: "Spending on building data centres, a subcategory of private office construction, was 73 percent higher in August 2026 than a year earlier, by NAHB's reading of Census data." The 85-billion figure stays unchecked, so drop it or hold it. Replace cite 20 with the Census private seasonally-adjusted table (or NAHB, 1 Oct 2026). Slide 09's "+73% DATA CENTRES" may stand, but its credit should name the table, not the release.

## 11.2. Single-family construction spending fell 3.5 percent over the same year (Census; cites 20)
Researcher's verdict: holds. **Skeptic: amended.** The verdict stands, but the primary and the notes are wrong. The researcher wrote "Census table itself not opened" and that the release "does not break out single-family". The PDF the researcher opened does break it out, in Table 1.

Evidence (Census release CB26-158, 1 Oct 2026, https://www.census.gov/construction/c30/pdf/release.pdf, p.3, "Table 1. Value of Construction Put in Place in the United States, Seasonally Adjusted Annual Rate (Millions of dollars ...)"):
- Total Private Construction > Residential > "New single family": Aug 2026 (preliminary) 403,333; Jul 2026 402,707; Aug 2025 418,129. Percent change from Jul 2026: 0.2. From Aug 2025: **-3.5**.
- "New multifamily": 115,756; from Aug 2025 -0.6. Footnote 2: Residential "Includes private residential improvements."
- p.5, Table 3, Standard error, "Month-to-month change from prev. year", New single family: **2.7**. As a check, the same column gives 0.9 for Total Construction, and the release text prints that total as "1.7 percent (±1.5 percent) below the August 2025 estimate". 1.645 × 0.9 = 1.5, so the column is the year-on-year standard error at a 90% interval. For new single-family, 1.645 × 2.7 = ±4.4 points (my calculation from Census's figure).
- The NAHB quote in lane-11 is verbatim (fragment confirmed): "Both spending on single-family and multifamily construction increased by 0.2% in August," ... "but decreased 3.5% and 0.6% from a year ago, respectively."

Findings:
(a) Cite 20 directly supports the figure. The primary should be Census Table 1, with NAHB as corroboration. The edition's attribution to Census and slide 09's credit hold.
(b) Census's label is "New single family". It excludes improvements, so "single-family construction spending" means new construction.
(c) The interval is about -3.5% (±4.4%). Under the release's own explanatory note, "If it does contain zero, the change is not statistically significant", the year-on-year fall cannot be distinguished from zero. The release puts no asterisk here only because Table 1 carries no interval. The edition sets -3.5% against +73% as a contrast, so the owner should know the 3.5 is within sampling error.
(d) The researcher's "same year" point stands: this is one month against the same month a year earlier, and preliminary.

The page should say: "New single-family construction spending was 3.5 percent lower in August 2026 than a year earlier (Census, preliminary; within the survey's margin of error)." The smallest change is "fell 3.5 percent over the same year" → "was 3.5 percent below a year earlier". Change the research file's Primary to Census CB26-158, Table 1, row "New single family".

## 11.3. Single-family starts 918,000, Aug 2026 (chain source: Census; cites none in list)
Researcher's verdict: holds. **Skeptic: upheld.**

Evidence:
- Census/HUD CB26-147, "FOR RELEASE AT 8:30 AM EDT, THURSDAY, SEPTEMBER 17, 2026", https://www.census.gov/construction/nrc/pdf/newresconst_202608.pdf (page image read): "Single-family housing starts in August were at a rate of 918,000; this is 7.6 percent (±14.0 percent)* above the revised July figure of 853,000." The headline paragraph defines "seasonally adjusted annual rate". The researcher's quote has "at a seasonally adjusted annual rate of 918,000". On the page, the single-family sentence says "at a rate of 918,000". The meaning is the same, but the quote is not verbatim.
- Census/HUD CB26-162, "TUESDAY, OCTOBER 20, 2026", https://www.census.gov/construction/nrc/pdf/newresconst.pdf (page image read): "Single-family housing starts in September were at a rate of 859,000; this is 4.6 percent (±10.0 percent)* below the revised August figure of 900,000." The researcher's quote is verbatim.

Findings: 918,000 was the only published figure on the edition date (15 Oct). The revision to 900,000 came out on 20 Oct, after the edition. The researcher's handling (say "first estimate" or update to 900,000) is right. The model readout's divisor (918000, astro line 311) should change with it. Fix the research file's quote: "at a seasonally adjusted annual rate of 918,000" → "at a rate of 918,000".

## 11.4. Builder sentiment at a one-year low (chain source: NAHB; cites none in list)
Researcher's verdict: could not open. **Skeptic: overturned.** NAHB's own September post exists and states the claim. The researcher wrote that "search returned no NAHB press release for September". The NAHB economics blog's September archive lists it.

Evidence:
- NAHB Eye on Housing, Robert Dietz, "Builder Sentiment Falls on Higher Interest Rates and Costs", 16 Sep 2026, https://eyeonhousing.org/2026/09/builder-sentiment-falls-on-higher-interest-rates-and-costs/ (found via https://eyeonhousing.org/2026/09/): "Builder confidence in the market for newly built single-family homes fell three points to 32 in September" and "The HMI shows builder confidence at its lowest level since September 2025, as tight lending conditions and elevated land, labor and construction costs persist."
- NAHB HMI page, https://www.nahb.org/news-and-economics/housing-economics/indices/housing-market-index: "Builder confidence in the market for newly built single-family homes fell three points to 29 in October." This implies September was 32.
- NAHB Eye on Housing, Robert Dietz, 19 Oct 2026, https://eyeonhousing.org/2026/10/builder-sentiment-falls-to-14-year-low-on-rising-affordability-concerns/ (listing title "Builder Sentiment Falls on Rising Rates"): "fell three points to 29 in October" and "The reading was the lowest since June 2012." The lead says sentiment was pushed "to a 14-year low."

Findings:
(a) "One-year low" was true on 15 Oct, in NAHB's own words ("lowest level since September 2025"). It does not rest on Trading Economics. "Lowest since September 2025" is a dated statement, so the researcher's caveat that "lowest in a year" is undated falls away.
(b) Timing: NAHB's 19 Oct release, after the edition, makes "one-year low" stale. The current reading is 29, a 14-year low, the lowest since June 2012 per NAHB itself. The researcher reported this from Trading Economics only.
(c) "Builder sentiment" here means the NAHB/Wells Fargo HMI for newly built single-family homes.

The research file should say: Verdict holds (as of edition date). Primary: NAHB, 16 Sep 2026, URL above, quote above. True as: "Builder sentiment (NAHB/Wells Fargo HMI) fell to 32 in September 2026, its lowest since September 2025." The page, if updated, should say: "Builder sentiment at a 14-year low (NAHB/Wells Fargo HMI 29 in October 2026, lowest since June 2012)." Add the NAHB source to the edition's source list.
