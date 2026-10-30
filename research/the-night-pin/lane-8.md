# Lane 8: Voter files, VoterMatch, Mobilewalla 2020

Edition: source/the-night-pin.web.md (The Night Pin, 30 Oct 2026). Sections 10, 11 and 12 of the edition, with sources 12, 13 and 19 from section 17.

---

## 1. Almost every state's voter file carries name and home address; many add party, voting history and year of birth; a few add phone numbers, sex or race. [12]
Verdict: could not open
Primary: National Conference of State Legislatures, "Access to and use of voter registration lists" (undated state-by-state survey). https://www.ncsl.org/research/elections-and-campaigns/access-to-and-use-of-voter-registration-lists.aspx
Read: 2026-10-30
Quote: none. WebFetch returned "HTTP 403 Forbidden" for the NCSL page (no body retrieved). A WebSearch for the same page returned only fragments: "This page provides information on 50 state laws on access to and use of voter registration lists, including who is eligible to receive lists, what information lists contain, what information is kept confidential." That snippet is search metadata, not the page text, and it does not give the field-by-field counts.
True as: not settled. Keep the sentence only if NCSL's page, which the edition cites, says it. Nothing I read confirms the field counts.
Notes: I did not route around the 403. Other state-level pages I found (Justia 50-state survey, also 403; state statutes and a 2018 Montana legislative compilation seen only in search results) were not used as substitutes because they are not the cited source. Could not settle: whether "almost every" state carries name and address, and the party, history, year-of-birth and "few add phone, sex or race" counts. Next step: a human opens the NCSL page in a browser, or NCSL's own PDF or table version, and checks the field list.

---

## 2. NCSL: 29 states restrict use of the voter list to non-commercial purposes; 9 more restrict it to election, political or government purposes; 12 are silent on use; NCSL's survey records no state that expressly allows any use. [12]
Verdict: could not open
Primary: National Conference of State Legislatures, "Access to and use of voter registration lists". https://www.ncsl.org/research/elections-and-campaigns/access-to-and-use-of-voter-registration-lists.aspx (403, not read). Justia "Voter Registration Lists: 50-State Resources" https://justia.com/administrative-law/voter-registration-lists-50-state-survey (403, not read).
Read: 2026-10-30
Quote: none from NCSL. The NCSL and Justia fetches both returned "HTTP 403 Forbidden".
True as: not settled. The edition's 29 / 9 / 12 counts and the "no state expressly allows" statement are unverified.
Notes:
- Arithmetic check: 29 + 9 + 12 = 50. That sums to all 50 states only if the three categories do not overlap. Whether they overlap, and whether NCSL's "no state expressly allows any use" is a separate finding, cannot be checked without the NCSL text. The edition's "silent" label should match NCSL's own wording.
- "38 states" (edition, sections 10 and 12): 29 + 9 = 38 is a fair sum only if (a) the 29 and the 9 are disjoint, and (b) a state restricted to election, political or government purposes is also restricted against commercial use. Point (b) is plausible on its face, since those purposes exclude ordinary commercial use, but I could not confirm it from NCSL. Search snippets (not primary) suggested some states treat political or election use as outside "commercial" (for example California and Kansas), which is a definitional point that matters for the trade claim. Treat "38 states restricted against commercial use" as arithmetic from unverified counts, not as a sourced finding.
- Could not settle. Next step: an NCSL page or PDF readable without a block, or the individual state statutes for each of the 50 states, checked against the three categories.

---

## 3. On 18 June 2026 Nexxen and L2 launched VoterMatch, joining L2's national voter file to Nexxen's ad-auction logs so campaigns can see which registered voters an ad reached and how often; neither disclosed the matching method or match rates. [13]
Verdict: overstated
Primary: Nexxen, "Nexxen and L2 Data Launch VoterMatch, Bringing Greater Precision, Transparency and Performance to Political Advertising", 18 June 2026 (release date shown on the page). https://nexxen.com/nexxen-and-l2-data-launch-votermatch-bringing-greater-precision-transparency-and-performance-to-political-advertising/
Read: 2026-10-30
Quote (from a WebFetch extraction of the page; the tool summarised and quoted, so check the wording against the live page before publishing):
- "By combining Nexxen's log-level data with L2's comprehensive National Voter File, VoterMatch provides campaigns"
- "designed to improve political advertisers' understanding of which voters have been reached, and how frequently"
- "connect two historically siloed datasets – deterministic voter records and log-level DSP data"
- "moving from estimates to voter-level modeled exposure" (benefit bullet)
- The extraction reported that the release contains no description of the matching technique and no match rates; the only accuracy language is in the forward-looking-statements disclaimer.
True as: "On 18 June 2026, Nexxen and L2 launched VoterMatch, which combines Nexxen's log-level ad data with L2's national voter file so campaigns can see which registered voters an ad reached and how often. Nexxen's launch release does not describe the matching method or give match rates."
Notes:
- The launch, date, the purpose and the data combined all hold against Nexxen's own release. "Ad-auction logs" is a paraphrase of "log-level data" / "log-level DSP data"; the release does not say "auction", so the closer term is "log-level ad data".
- The negative ("neither disclosed") was checked only against Nexxen's release. I did not open L2's own release. Searches found L2 wording only in syndicated copies (Nasdaq, Tremor IR, ExchangeWire, Investing.com, GlobeNewswire via Manila Times). Those copies are the same release, not L2's own text. I did not find an L2 release or product page that describes matching; I did not search L2's website directly and cannot say whether one exists. Nexxen's investor-relations copy (investors.nexxen.com) returned 403 and was not used.
- Syndicated aggregator text (BriefGlance) says VoterMatch replaces probabilistic data with deterministic records; the release excerpts do not say "replace", so I did not rely on it.

---

## 4. In June 2020 Mobilewalla published the race, gender and age mix of protesters in New York, Los Angeles, Minneapolis and Atlanta, derived from phone data; its founder said no agency had asked for it. [19]
Verdict: overstated
Primary: Caroline Haskins, BuzzFeed News, "[headline not captured]" (article slug protests-tech-company-spying), posted 25 June 2020. https://www.buzzfeednews.com/carolinehaskins1/protests-tech-company-spying
Read: 2026-10-30
Quote (WebFetch extraction; check against the live page before publishing):
- "Just over two weeks later, that company, Mobilewalla, released a report titled"
- "In 60 pie charts, the document details what percentage of protesters the company believes were male or female"
- "The company analyzed data from 16,902 devices at protests"
- "including exactly 8,152 devices in New York, 4,527 in Los Angeles, 2,357 in Minneapolis, and 1,866 in Atlanta."
- "the company uses artificial intelligence to turn a stew of location data, device IDs, and browser histories"
- "to predict a person's demographics — including race, age, gender, zip code, or personal interests."
- "analyzed data from mobile devices in those areas collected between May 29 and May 31."
- "Datta said Mobilewalla didn't prepare the report for law enforcement or a public agency"
- "but rather to satisfy its own employees' curiosity about what its vast trove of unregulated data could reveal about the demonstrators."
- The article "does not say that any government agency or law enforcement agency requested the analysis or took part in it" (extraction's own statement about the text).
True as: "In June 2020 Mobilewalla published a report on the race, gender and age of protesters in New York, Los Angeles, Minneapolis and Atlanta, estimated from mobile-device location data. Its CEO, Datta, said the report was not prepared for law enforcement or a public agency." Use "mobile-device location data" rather than "phone data" because the article also says device IDs and browser histories were used.
Notes:
- "No agency had asked for it" is a claim about requests; the source says the report was not prepared for law enforcement or a public agency (a claim about purpose). Those differ, so the edition's wording is overstated. The rewording uses the source's own sense.
- Date: BuzzFeed places the report "just over two weeks" after the 29–31 May analysis, and a Metro Times item dated 29 June 2020 described it as released "earlier this month". "June 2020" holds.
- I did not confirm that "Datta" is Mobilewalla's founder; the extraction gives only the surname. Describe him as "Datta" or confirm his title from another source before calling him founder or CEO. Note the edition's source is Wikipedia, not BuzzFeed; the BuzzFeed piece is the original reporting.
- Mobilewalla's own report, "George Floyd Protester Demographics: Insights Across 4 Major US Cities" (title from a Metro Times item), was not opened. Searches returned no direct PDF link. Its figures are reported second-hand here. Race and gender figures differ between outlets (BuzzFeed's extraction and the Metro Times item), so do not quote figures from this lane without opening the report.
- The edition's Wikipedia citation (source 19) was not opened; BuzzFeed was used as the original reporting per the brief.
- Note for the edition's section 11 sentence "In December 2024 the FTC alleged..." (source 07) is outside this lane and was not checked.
