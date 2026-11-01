# Lane 2: ERCOT large-load queue (edition "Waiting for the Tie-In", 15 Oct 2026)

Source inventory: `research/waiting-for-the-tie-in/CLAIMS.md`, Lane 2 (claims 2.1 to 2.5).
Edition text: `/tmp/claude-0/-home-user-aedificare/b528d5f7-7239-5e28-af76-111d33dcf67b/scratchpad/tiein/text.txt`.

Method note: WebFetch returns a model-written extraction, so quoted sentences below are as extracted, not checked against a rendered page, except where marked "read from slide image" (ERCOT's Batch Zero deck was read page by page from the saved PDF, because its text layer did not extract).

---

## 2.1. In August 2026 its operator, ERCOT, told state regulators that about 474 gigawatts of large loads were asking to connect, roughly nine in ten of them data centres.
Verdict: overstated
Primary: Utility Dive, Robert Walton, "ERCOT tells Texas PUC large-load queue reaches about 474 GW" (the edition's cited page; a news report, not a primary), 21 Aug 2026. https://www.utilitydive.com/news/ercot-texas-puc-data-center-audit/828472/ . Second report: KWTX (Nexstar), "Data center approvals in Texas halted until audits completed, Gov. Greg Abbott says", 3 Aug 2026. https://www.kwtx.com/2026/08/03/data-center-approvals-texas-halted-until-audits-completed-gov-greg-abbott-says/
Read: 2026-11-01
Quote: Utility Dive (21 Aug 2026, in the article's text): "ERCOT interconnection queue requests total about 474 GW, and approximately 90% are data centers" ... "according to Abbott's letter to the grid operator." KWTX (3 Aug 2026): "ERCOT is currently tracking more than 1,800 projects in the queue, representing over 474 gigawatts of electricity" (attributed "according to ERCOT").
True as: Reports in August 2026 put the queue of large loads that ERCOT tracks at about 474 gigawatts, roughly nine in ten of them data centres.
Notes: (a) Attribution conflict. The edition's cited article attributes the 474 GW and the ~90% share to the governor's letter to the grid operator, not to an ERCOT filing to the PUCT. KWTX attributes the 474 GW to ERCOT, without naming a filing. I did not open an ERCOT document that carries the 474 GW figure. A search summary pointed to a July 2026 ERCOT slide presented to the PUC, which I did not open. I did not find an ERCOT August filing carrying this figure in the searches I ran (two search queries and the two articles above). So "told state regulators in August" is not shown. (b) Scope. The figure is ERCOT's count of queue requests (more than 1,800 projects per KWTX). It is not energised load and is not all data centres: ERCOT's own directive covers data centres and crypto-mining facilities at 75 MW or more. "Nine in ten" comes from "approximately 90%" in the Utility Dive text. (c) The figure appears to be a moving number: a secondary search summary mentioned about 438 GW in June, which I did not verify. (d) Could not open: gov.texas.gov letter (not located in search); ERCOT PUCT filing (not located).

---

## 2.2. The grid's record peak demand, set in July, is about 91 gigawatts.
Verdict: holds
Primary: ERCOT, "2026 peak demand records (preliminary)", web page last updated 21 Aug 2026 per the page. https://www.ercot.com/static-assets/data/news/content/a-peak-demand/2026/all-time-records.htm
Read: 2026-11-01
Quote: Table row as extracted: "July 22 91,134*". The page: "The unofficial demands reported during, or just after, an operating day are preliminary." Also: "For a demand record, ERCOT use the integrated system load for the full hour."
True as: ERCOT's preliminary record peak demand is about 91 GW (91,134 MW on 22 July 2026).
Notes: The page gives MW and the figure is marked preliminary (asterisk), as the edition's source note says. The extraction also reports a weekend table line "Previous Peak: 89,891 MW set 8/22/2026" and an 23 Aug value of 90,411*; these do not exceed 91,134 MW, so they do not change the July record, but the extraction is a model summary and I did not verify the full table. The edition's "91 gigawatts" is a rounding of 91.134 GW.

---

## 2.3. Oncor, one Dallas utility, holds nearly 300 gigawatts of requests by itself.
Verdict: holds
Primary: Oncor's own figures, given on the Sempra Q2 2026 earnings call (6 Aug 2026), as reported by Utility Dive, "Fate of Oncor's nearly 300 GW load pipeline unclear following Texas data center...", 7 Aug 2026. Oncor and Sempra filings not opened. https://www.utilitydive.com/news/fate-of-oncors-nearly-300-gw-load-pipeline-unclear-following-texas-data-ce/827303/
Read: 2026-11-01
Quote (as extracted from the Utility Dive article): "service requests at that company had increased from 289 GW at the end of the first quarter" and "to 298 GW this past quarter." The figure is attributed to Oncor CEO Allen Nye.
True as: Oncor reported about 298 gigawatts of service requests in its own Q2 2026 results.
Notes: (a) "Holds by itself" is accurate as a count of Oncor's requests, but the requests sit in the same ERCOT queue as the 474 GW total, so they are not additional to it. (b) These are requests, not energised or contracted load. (c) The same article reports 127 GW as Oncor's qualifying load forecast to ERCOT earlier in 2026; that is a separate figure and is not in the claim. (d) Could not open: Oncor's or Sempra's Q2 2026 materials directly.

---

## 2.4. In September ERCOT sorted its first batch: 66 gigawatts conditionally cleared, 302 gigawatts excluded.
Verdict: overstated
Primary: ERCOT, "Item 14: Batch Zero Update", Jeff Billo, Vice President, Interconnection and Grid Analysis, Board of Directors Meeting 14-15 Sep 2026 (file dated 11 Sep 2026 in its URL). https://www.ercot.com/files/docs/2026/09/11/14-Batch-Zero-Update.pdf
Read: 2026-11-01 (slides read from the rendered PDF, pages 1, 4, 5, 6)
Quote (slide 1, read from slide image): "204 projects (66.4 GW) met the qualifications to be conditionally included as base load;" and "158 projects (127.9 GW) met the qualifications to be conditionally included as studied load." (slide 6, read from slide image): "This chart omits excluded load (302.2 GW, 373 projects)." (slide 4): "ERCOT provided provisional Batch Zero Large Load project classification (base, studied, excluded) to the Interconnecting TSPs on September 3, 2026. Final project inclusion/ exclusion determination will be based on the results of the eligibility verification and audit and provided in December."
True as: In September ERCOT provisionally classified its Batch Zero large loads: 66.4 GW conditionally included as base load, a further 127.9 GW conditionally included as studied load, and 302.2 GW excluded. Final decisions are due in December.
Notes: (a) Scope. "66 GW conditionally cleared" is only the base-load half. The deck also puts 127.9 GW (158 projects) in the studied-load conditional group. (b) Internal conflict in ERCOT's deck: slide 6's studied total reads "125.4 GW, 158 projects" while slide 1 reads 127.9 GW. I used slide 1. (c) The 302.2 GW excluded figure is in a chart footnote on slide 6, not a headline. (d) The three groups sum to about 496 GW, above the 474 GW August queue figure in 2.1. I did not reconcile this; the classification may cover a different perimeter (ERCOT's counts were 362 included and 373 excluded projects). (e) "Sorted" is provisional: the classifications went to the transmission providers on 3 Sep, and final decisions await the verification and audit. (f) The 3 Sep date is in the deck; "in September" is accurate. Not opened: the ERCOT Market Notice and the 3 Sep classification file.

---

## 2.5. On 3 August the governor paused new data-centre energisations pending an audit.
Verdict: overstated
Primary: The governor's letter of 3 Aug 2026 to the PUCT and ERCOT was not opened (not located on gov.texas.gov in searches; one law-firm alert links a PDF copy which I did not open). Secondary primary used: ERCOT Board deck "Item 14: Batch Zero Update" (14-15 Sep 2026), slides 3 and 4. https://www.ercot.com/files/docs/2026/09/11/14-Batch-Zero-Update.pdf . News: KWTX, 3 Aug 2026. https://www.kwtx.com/2026/08/03/data-center-approvals-texas-halted-until-audits-completed-gov-greg-abbott-says/
Read: 2026-11-01
Quote (ERCOT slide 3, read from slide image): "Governor Abbott directed the Commission and ERCOT to complete 'a comprehensive verification and audit' of all data centers advancing through the interconnection process before allowing those loads to proceed." Under "Actions taken by ERCOT", same slide: "August 3, 2026 – Issued a Market Notice pausing the Batch Zero study process..." and "Paused approvals to energize data centers or virtual currency mining facilities (crypto facilities) that are 75 MW or greater." (ERCOT slide 4): "ERCOT has paused the energization of new Large Load data centers and crypto mining facilities until the completion of the verification and audit and community impact review." (KWTX, 3 Aug 2026): "Gov. Greg Abbott on Monday announced a moratorium on the approval of data centers" ... "until regulatory agencies can audit proposed data centers seeking connection to the state's electric grid".
True as: On 3 August the governor directed the PUCT and ERCOT to audit data centres in the interconnection process before letting them proceed. ERCOT then paused energisation approvals for data centres and crypto-mining facilities of 75 MW or more.
Notes: (a) The pause on energisation is recorded in ERCOT's own deck as ERCOT's action, implementing the governor's directive. The governor's directive is described as a request for an audit, which the news reports describe as a "moratorium" or "pause". Jones Day (search summary) describes it as a pause, not a ban. (b) Scope is 75 MW or more and covers crypto mining as well as data centres. (c) A separate letter from the governor to TCEQ about permits is dated 21 Sep 2026 per a search summary; it is not part of the 3 Aug action and I did not open it. (d) I did not find a completion deadline in the articles and deck I read; a search summary says the letter sets none. The governor's letter itself would settle the wording; it is the one primary I could not open.

---

## Counts
Verdicts: holds 2 (2.2, 2.3); overstated 3 (2.1, 2.4, 2.5); wrong 0; not in the source 0; could not open 0.
Settled: 5 of 5.
