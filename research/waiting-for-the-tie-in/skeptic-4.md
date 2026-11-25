# Skeptic, lane 4: "Waiting for the Tie-In" (Aedificare, 15 Oct 2026), claims 4.1 to 4.6

Checked against: research/waiting-for-the-tie-in/lane-4.md. Read: 2026-11-01.
Tally: upheld 0, overturned 3 (4.1, 4.2, 4.4), amended 3 (4.3, 4.5, 4.6).

The researcher's lane summary (could not settle 3, overstated 2, wrong 1) should read: **holds 3 (4.1, 4.2, 4.4), overstated 2 (4.3, 4.6), wrong 1 (4.5).** The three "could not settle" verdicts all rested on the LBNL report being unreadable. LBNL's own publication page at eta-publications.lbl.gov opened for me and carries the report's abstract, which settles 4.1 and 4.2 and part of 4.6. 4.4 holds on Dominion's own wording. The verdicts on 4.3 and 4.5 stand in substance, but each rests on reasons the researcher got partly wrong, and each misses a larger problem.

Also checked: the user's uploaded PDF, the edition's 16-slide carousel. Slide 04 ("UNITED STATES · REQUEST TO POWER", credited "LBNL QUEUED UP 2026 · DOMINION") repeats 4.1 to 4.3: "5+ YEARS. Median wait for projects built in 2025. 2,061 GW still in line. Virginia: up to seven." The fix to 4.3 below applies to "Virginia: up to seven" too. No other slide carries a lane-4 claim.

No characterisation of Anthropic appears in this lane.

## 4.1. About 2,061 GW of generation and storage in US queues at end-2025 (LBNL)
Researcher's verdict: could not settle. **Skeptic: overturned. The claim holds.**

Evidence:
- LBNL's own publication page (Rand, Cheyette, Talley, Zhang, Gorman, Wiser, Seel, Jeong, Kahrl), "Date Published 05/2026": "As of the end of 2025, there were ~8,200 projects actively seeking grid interconnection in the U.S., representing 1,312 GW of generation and approximately 749 GW of storage." The page also says the data were compiled "from >50 transmission grid operators" and that the report "only includes generation requests seeking to connect to the transmission grid" and "does not include load interconnection requests". https://eta-publications.lbl.gov/publications/queued-2026-edition-characteristics (the researcher got HTTP 429 there; it opened for me on the first try. emp.lbl.gov still returns 403 and the slide-deck PDF is still over the 10 MB fetch limit, and I did not try to get round either.)
- American Public Power Association, 1 Jul 2026, summarising the report: "2,061 gigawatts of generation and storage capacity now actively seeking grid interconnection", down 10% on 2024. https://www.publicpower.org/node/30574

Findings:
(a) The primary gives the parts (1,312 GW plus about 749 GW), and they add to 2,061. The abstract does not print the total. APPA does, so the deck very likely does too, but I did not read the deck. "About 2,061" is right.
(b) Scope holds. LBNL counts active requests at the end of 2025 ("actively seeking"), so "sat in US interconnection queues" is fair. Its coverage is the >50 operators, not literally every US queue. That does not need a fix at "about".
(c) The release date is May 2026 (LBNL's "Date Published 05/2026"; the data file sits in a 2026-05 folder and the deck in a 2026-06 folder). That matches the secondary date the researcher found (12 May 2026). The newsletter's claim that the PDF "still reflects EOY 2024" is contradicted by LBNL's own "As of the end of 2025".
(d) Context for the owner, not a fault in this figure: LBNL's queue is generation and storage only, and it excludes load requests. The sentence opens "The rest of the country is slower", right after ERCOT's 474 GW of *load* requests. The two queues are different kinds, and LBNL's data includes ERCOT's generation queue, so "the rest of the country" is not quite what the number covers.

No change to the figure. Lane-4's quote line should carry the LBNL sentence above.

## 4.2. The median project built in 2025 took more than five years from request to operation (LBNL)
Researcher's verdict: could not settle. **Skeptic: overturned. The claim holds, with LBNL's own qualifier advisable.**

Evidence:
- LBNL publication page: "For the regions with available data, the median duration from IR to COD was over 5 years for projects built in 2025." (IR = interconnection request; COD = commercial operation date.) https://eta-publications.lbl.gov/publications/queued-2026-edition-characteristics
- APPA, 1 Jul 2026: "the timeline to reach commercial operations exceeds 5 years" for the subset of regions with available data, and the median from request to signed agreement was "well over 3 years" in 2025. https://www.publicpower.org/node/30574

Findings:
(a) The measure is exactly what the edition says: request to operation, median, projects built in 2025, over five years. The researcher worried that LBNL's wording might differ ("in the queue", a different start date). It does not.
(b) LBNL limits the figure to "the regions with available data". The page drops that. It is a qualifier, not an error.
(c) The researcher was right not to add Reslink's 45 and 31 months. The secondary "61 months" (Axis, Blizzard) is consistent with "over 5 years", but it was not confirmed at the primary and should not be printed.
(d) The same generation-versus-load point as 4.1(d) applies. This is a generation median, in a paragraph about load connections.

The page may stay as it is. The more exact version: "...and, in the regions with data, the median project built that year took more than five years from request to operation."

## 4.3. "In northern Virginia, Dominion has said a large load can wait up to seven years." (cites 07)
Researcher's verdict: overstated. **Skeptic: amended.** The verdict stands, on the date. The researcher's other reason (that the letter covered only data centres, so "large load" is too broad) is wrong. The researcher also missed that "seven" is reporters' arithmetic, not Dominion's figure.

Evidence:
- Loudoun Now, 4 Sep 2024 (Hanna Pampaloni), quoting Dominion's notice directly: "We expect the typical duration of the planning and execution process for large (greater than 100 MW) [delivery point] requests within the Dominion Energy transmission zone (DOM Zone) to increase by 12 to 36 months," In the reporter's words: "Dominion Energy's transmission branch notified distributors this month they should expect a four to seven-year process to receive power for large developments." https://www.loudounnow.com/news/power-crunch-to-push-data-center-connections-by-1-3-years/article_e122ad16-6a5a-11ef-909c-33c14c795f00.html
- Data Center Knowledge, 30 Aug 2024 (Bloomberg News, the edition's source 07), as fetched: the letter was one "the company's transmission arm sent to its regulated utility as well as co-ops and local utilities". A Dominion representative said the extra one to three years come on top of the three to four years the process previously took, and Bloomberg concludes "roughly four to seven years". Bloomberg's framing is "applies only to large data centers that need more than 100 MW" and the change "won't affect projects that have already been evaluated." https://www.datacenterknowledge.com/energy-power-supply/data-centers-face-seven-year-wait-for-power-hookups-in-virginia
- Search for a newer Dominion statement: Virginia Mercury (Shannon Heckt, 20/21 Jul 2026, republished by Royal Examiner) writes "Dominion's data center customers have an average wait of seven years to be connected to the grid", but in the reporter's own voice with no source given. It is not a Dominion statement. https://royalexaminer.com/data-centers-want-to-build-their-own-gas-turbines-would-that-skirt-state-renewable-energy-laws/ . The Virginia Mercury original returned HTTP 403. The 29 Sep 2026 Dominion deck (4.4) gives no wait time.

Findings:
(a) Scope. Dominion's notice, as quoted, covers "large (greater than 100 MW) [delivery point] requests" in its transmission zone. It is not limited to data centres; "data centers" is Bloomberg's gloss. So "a large load" is a fair reading of Dominion's words, and the researcher's "the edition's 'large load' is broader" does not hold. The zone (DOM Zone) is wider than northern Virginia, but northern Virginia is inside it.
(b) "Seven" is a sum. Dominion's own figure is an added 12 to 36 months. A Dominion representative gave the earlier baseline of three to four years, and Bloomberg and Loudoun Now added the two to get four to seven. "Dominion has said ... up to seven years" therefore rests on Dominion's two numbers plus reporters' arithmetic. That is defensible, but it is not a Dominion quote.
(c) The date is the real problem. The notice went out in late August 2024, more than two years before the edition. "Has said ... can wait" reads as current, and no newer Dominion figure was found. The sources list does carry "Aug 2024", but the prose and the chain ("Up to 7 years in northern Virginia") do not.
(d) Lane-4 says the Bloomberg piece "relays a Dominion transmission-arm letter" and that the letter was not opened. That is still true: the letter itself is not public, and Loudoun Now's direct quote is the closest text found.

The page should say: "In 2024 Dominion told the utilities it supplies that large connections in its zone, over 100 megawatts, would take one to three years longer than the three to four they had taken: up to seven years in all." The smallest fix is "Dominion has said a large load can wait" → "Dominion said in 2024 that a large load could wait". Make the same date fix in the chain ("Up to 7 years in northern Virginia (2024)") and on carousel slide 04 ("Virginia: up to seven, in 2024").

## 4.4. "Dominion: 54 GW contracted, 4.8 GW billing." [also slider: "Dominion: 9.4 GW in construction, 4.8 GW billing."]
Researcher's verdict: overstated. **Skeptic: overturned. Both lines hold on Dominion's own wording.** The researcher's quotes are verbatim, but the ground for "overstated" is not, and the researcher did not check the slider line.

Evidence:
- Dominion Energy, "Dominion Energy LSE 20-Year Data Center Forecast", 29 Sep 2026, PJM Load Analysis Subcommittee item 5ai. Slide 2: "Approximately 54GW of capacity under contract (ELOA, CLOA, ESA)"; "Data center billing peak load as of August 2026 is 4.8 GW". Slide 6 title: "Executed Contracts as of July 2026 vs. Coincident Demand", with "32,473 MW of Engineering Letters of Authorization (ELOA)", "13,429 MW in forecast (41%)", "19,044 MW not in forecast (59%)", "9,356 MW of Construction Letters of Authorization (CLOA - Firm)" and "11,997 MW of Electric Service Agreements (ESA - Firm)". Slide 5: "Non-firm load – includes load from ELOAs (2032 and beyond)". Slide 3 (bars): 2026F billing 4,838 MW, coincident 4,559 MW. https://www.pjm.com/-/media/DotCom/committees-groups/subcommittees/las/2026/20260929/20260929-item-5ai---dominion_energy.pdf
- Dominion Energy, letter to the PJM Load Analysis Team, 6 Jan 2026 (Stan Blackwell, Director – Data Center Practice), defining the contracts. ELOA: "The customer is not obligated to proceed with the project once the ELOA results are completed. ELOAs are not considered firm load." CLOA: "Once the CLOA is signed, the Company reserves capacity for it. CLOAs are considered firm load." And: "the sum of the capacity contracts already connected (ESAs) to the system plus the capacity contracts under construction (CLOAs) support the Company's forecast through 2045." https://www.pjm.com/-/media/DotCom/planning/res-adeq/load-forecast/dominion-documentation.pdf

Findings:
(a) "Contracted" is Dominion's word, not the edition's inflation of it. Dominion says "under contract" and titles the chart "Executed Contracts". The researcher's ground, that "the bare word 'contracted' overstates firmness", faults the edition for repeating its source accurately. Dominion itself says 32.5 GW of the 54 is non-firm ELOAs that the customer need not pursue. Adding that is good context, but it is not a correction.
(b) The slider's "9.4 GW in construction" matches Dominion's own description of CLOAs as "capacity contracts under construction" (9,356 MW, as of July 2026). The researcher did not check this half of the claim. It holds.
(c) "4.8 GW billing" holds: a data-centre billing peak as of August 2026. The researcher is right that it is not coincident demand (4,559 MW on slide 3 for 2026F).
(d) A modelling note for the owner, not a factual error: the slider is "PJM energisations a year", but both figures are stocks for one PJM zone (Dominion's), not annual energisations across PJM.

No change required. If the owner wants the firmness context: "Dominion: 54 GW under contract (21 GW of it firm), 4.8 GW billing."

## 4.5. "AEP: 69 GW committed by 2030. Requests, not energisations." (slider: "Rest of US a year")
Researcher's verdict: wrong. **Skeptic: amended.** The verdict stands. But the researcher's finding that AEP gives no energised figure and no split is overturned by AEP's own deck. And the larger error, which the researcher missed, is that most of the 69 GW is not "rest of US" at all.

Evidence:
- AEP, Q2 2026 earnings release, 30 Jul 2026 (Form 8-K Ex. 99.1): "Expands new load additions to 69 gigawatts (GW) through 2030"; "The company added an incremental six GW of signed load agreements during the second quarter, primarily in Texas, bringing total contracted load growth through 2030 to 69 GW." https://www.sec.gov/Archives/edgar/data/0000004904/000000490426000055/a2q20268kpressreleaseex991.htm
- AEP, Q2 2026 Earnings Presentation, 30 Jul 2026, slide 14 ("2026-2030 Load Growth"): "Incremental contracted load of 69 GW by 2030 backed by fully executed ESAs and LOAs and further supported by ~195 GW of active projects in the interconnection queue." Breakdown: "45 GW in ERCOT", "100% Senate Bill 6 (SB6) compliant load backed by LOAs; ERCOT contracting structure allows for LOAs only"; "18 GW in PJM", "100% LOAs and ~95% ESAs"; "6 GW in SPP", "100% LOAs and ~55% ESAs". Cumulative additions by year: 7 GW (2026E), 17, 34, 54, 69 GW (2030E). Data centres 90%, industrials 10%. Slide 4 footnote: "Forecasted data center demand growth is supported by existing and future customer financial agreements, which are subject to certain terms and conditions." https://docs.aep.com/docs/newsroom/resources/earnings/2026-07/2Q26EarningsReleasePresentation.pdf
- Same deck, slide 15 ("ERCOT Batch Zero Submission"): "AEP Texas submitted 45 GW of projects through ERCOT's Batch Zero process", with ERCOT results due "April 2027". Footnote 2: "Within AEP Texas' 45 GW of load by 2030 shown on slide 14, 5 GW was not required to go through Batch Zero review process, mainly relates to projects energized prior to 7/10/2026 and loads below 75 MW."
- Q2 2026 call (third-party transcript, Motley Fool), CFO Trevor Mihalik: "all supported by a combination of fully executed ESAs and LOAs"; "ERCOT's review process, available generation, and the timeline for transmission development may impact the timing of certain interconnections." https://www.fool.com/earnings/call-transcripts/2026/08/03/aep-aep-q2-2026-earnings-call-transcript/

Findings:
(a) The number and "committed" hold. "Committed" is a fair rendering of AEP's "contracted".
(b) "Requests" is wrong against AEP's own description: executed ESAs and LOAs, which AEP sets apart from the "~195 GW of active projects in the interconnection queue". There is one nuance the researcher did not have. The 45 GW in Texas is LOA-backed load that AEP Texas has itself submitted to ERCOT's Batch Zero, with allocations not due until April 2027. To ERCOT, that load is still a request awaiting study. So the word fails as a description of AEP's figure, but not entirely in substance.
(c) "Not energisations" holds in substance, and the researcher's "not stated by AEP either way" is overturned. AEP presents the 69 GW as a year-by-year schedule of future contracted additions, from 7 GW in 2026 to 69 GW by 2030. It is a forecast of energisations, not a count of them. Slide 15's footnote shows that a small, unquantified part of the Texas figure was already energised before 10 Jul 2026.
(d) Missed scope error: the note sits on the "Rest of US a year" slider, beside separate ERCOT and PJM sliders. Only 6 GW of AEP's 69 is in SPP. 45 GW is in ERCOT and 18 GW is in PJM, so as cited here the figure counts load the other two sliders already cover.

The page should say, on the "Rest of US" slider: "AEP: 6 GW contracted in SPP by 2030, of 69 GW in all (45 in ERCOT, 18 in PJM). Contracts, not yet energised." The smallest fix to the existing line: "AEP: 69 GW contracted by 2030, two-thirds of it in ERCOT. Contracts, not energisations." If the line moves to an ERCOT or PJM slider, change the scope note to match.

## 4.6. "A request is not a project. Many are speculative, filed in several places at once to hold a place in line." (I-marked; cites 06)
Researcher's verdict: could not settle. **Skeptic: amended.** It can be settled. The inference is supported, but as a hedged expert view, and by the edition's source 02, not by 06. 06 supports only the first sentence.

Evidence:
- LBNL (06), publication page: "Only 13% of capacity that submitted interconnection requests from 2000-2020 had reached commercial operations"; "75% of that capacity had been withdrawn and 10% was still active." Asked directly, the page has no text on speculative or duplicate requests. https://eta-publications.lbl.gov/publications/queued-2026-edition-characteristics
- Utility Dive, 21 Aug 2026 (the edition's own source 02), on ERCOT's ~474 GW large-load queue: "However, a substantial portion of that may be speculative or duplicative, experts say". https://www.utilitydive.com/news/ercot-texas-puc-data-center-audit/828472/
- Texas SB 6 (89th Leg.), enrolled text, Utilities Code §37.0561(d): "The standards must require each large load customer subject to Subsection (c) to disclose to the interconnecting electric utility or municipally owned utility whether the customer is pursuing a substantially similar request for electric service in this state the approval of which would result in the customer materially changing, delaying, or withdrawing the interconnection request." https://capitol.texas.gov/tlodocs/89R/billtext/html/SB00006F.htm
- Bracewell, The Data Center Counsel Podcast summary, 9 Feb 2026 (law firm; Jared Berg): "developers submitting multiple requests across utility territories to hedge project uncertainty"; "this surge of speculative requests slowed studies and clogged the queue". https://www.bracewell.com/resources/the-texas-legal-and-regulatory-landscape-for-data-center-development/

Findings:
(a) "A request is not a project" is supported by 06: of 2000 to 2020 requests, 13% of capacity was operating by the end of 2025 and 75% had been withdrawn. That is generation, not load.
(b) "Speculative, filed in several places at once" is not in 06's abstract. It is in 02, as "may be speculative or duplicative, experts say". The Texas legislature wrote a duty to disclose parallel requests into SB 6. That shows the practice was anticipated; it does not measure it. The researcher's search found "no LBNL text on duplicates" but stopped short of the edition's own source 02, which says it outright.
(c) The page states as fact what its source hedges: "many are" against "may be", "experts say". The I-mark makes it the author's inference, which softens this but does not license dropping the hedge.
(d) "To hold a place in line" is the author's gloss. Bracewell gives the motive as hedging "project uncertainty" (site shopping), and Utility Dive gives none. Holding a place is a plausible motive, but no source here states it.

The page should say: "A request is not a project. Of the capacity that asked to connect between 2000 and 2020, only 13 percent was running by the end of 2025. Many of Texas's load requests may be speculative, or duplicates filed in several places at once, experts say; state law now makes large loads disclose parallel requests." The smallest fix: "Many are speculative" → "Many may be speculative", with the source for that sentence changed from 06 to 02, and "to hold a place in line" either dropped or kept as the author's own reading.
