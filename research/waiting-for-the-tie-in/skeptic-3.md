# Skeptic, lane 3: "Waiting for the Tie-In" (Aedificare, 15 Oct 2026), claims 3.1 to 3.6

Checked against: research/waiting-for-the-tie-in/lane-3.md. Read: 2026-11-01.
Tally: upheld 0, overturned 2 (3.2, 3.6), amended 4 (3.1, 3.3, 3.4, 3.5).

The researcher's lane summary (holds 1 · wrong 2 · overstated 2 · not in the source 1) should read: **holds 3 (3.2, 3.5, 3.6) · wrong 2 (3.1, 3.3) · overstated 0 · not in the source 1 (3.4, with one clause contradicted by its own cited source).** Three of the researcher's negatives fell when tested:
- "No regulatory approval is mentioned on the page" (3.6): the page says "Federal approval granted".
- "A single web page with two statements, not separate documents" (3.6): Pattern's own linked fact sheet gives a different in-service year.
- "Could not quote the statute verbatim" (3.2): the enrolled bill renders as HTML.

One researcher quote (3.1) is not on the page it is attributed to.

Context checked: the edition's own source (`source/waiting-for-the-tie-in.html`). The chain pieces name their sources jointly, and the inventory cut those lists down. Grid tie-in reads `src:'ERCOT; Dominion; LBNL'` (line 311). Connection study reads `src:'ERCOT; PJM'`, where PJM goes with "220 GW in PJM's first cycle" (line 312). Rules that settle reads `src:'PUCT; FERC'`, where FERC goes with "federal rule RM26-4 still open" (line 313). Several of the researcher's attribution findings rest on the cut-down lists. In section 06, a single F mark at the end of the 820 MW sentence covers the paragraph's first three sentences (line 214).

Also checked: the user's uploaded PDF, which is the edition's 16-slide carousel. None of the six lane-3 claims appears on it. Slide 03 ("The grid's record peak is 91", credited "ERCOT TO TEXAS PUC, AUG 2026 · PEAK, JUL 2026") gives the denominator behind the 1.3 percent in 3.5, and is confirmed under 3.5. Slide 04 cites "LBNL QUEUED UP 2026", which bears on 3.1.

No characterisation of Anthropic appears in this lane.

## 3.1. Chain, Grid tie-in: "about 20 months in Texas, now paused"
Researcher's verdict: wrong. **Skeptic: amended.** "Wrong" stands for the 20 months. But one of the researcher's quotes is not on the page it cites, the attribution finding misreads the chain, and "now paused" is better supported than the entry allows.

Evidence:
- Carbon Direct (relae.co mirror), 14 May 2026. In order: "The federal target for interconnection agreement (IA) is 8 to 11 months. However, average wait times are 25 months nationally, 20 months in ERCOT, and 40 months in PJM. According to Carbon Direct's analysis, active projects in data center load growth zones are waiting 36-48 months". https://relae.co/press/carbon-direct-releases-new-analysis-of-power-grid-interconnection-queues-pjm-ercot (the original is also listed at https://www.carbon-direct.com/press/carbon-direct-releases-new-analysis-of-power-grid-interconnection-queues-pjm-ercot). The page links the national and ERCOT wait figures to LBNL, "Queued Up: 2025 Edition".
- ERCOT, "Item 14: Batch Zero Update", Board of Directors, 14-15 Sep 2026, slide 3, "Actions taken by ERCOT": "August 3, 2026 – Issued a Market Notice pausing the Batch Zero study process and delaying final classification of all Large Loads." "Paused approvals to energize data centers or virtual currency mining facilities (crypto facilities) that are 75 MW or greater." Slide 4: "ERCOT has paused the energization of new Large Load data centers and crypto mining facilities until the completion of the verification and audit and community impact review." https://www.ercot.com/files/docs/2026/09/11/14-Batch-Zero-Update.pdf (read as page images)
- ERCOT Market Notice M-A080326-01, 3 Aug 2026, "Update Regarding Batch Zero Timelines and Processes". It reports a letter from Governor Abbott directing a verification process before any data-centre Large Load advances. https://www.ercot.com/services/comm/mkt_notices/M-A080326-01
- Utility Dive, Robert Walton, 21 Aug 2026 (the researcher gives only "Aug 2026"): "On Aug. 3, Texas Gov. Greg Abbott, R, called for a moratorium on new data center interconnections". The article also calls it "the state's pause on new data center interconnections". https://www.utilitydive.com/news/ercot-texas-puc-data-center-audit/828472/

Findings:
(a) **A quote is not on its page.** The researcher's Notes quote Carbon Direct as saying "Their context is the generation interconnection queue, which includes both generation and storage". That sentence is not on the relae.co page. I asked for it directly and it is absent. The page speaks of "the generation interconnection queues" and of "111.6 GW of generation capacity and 64.3 GW of storage", but never uses those words. The white paper URL the page links to returned HTTP 404. Strike the quote. The point it was making (generation queue, not loads) still holds from the page's own wording.
(b) **Scope the researcher missed.** On the page, the 20 months is an average wait measured against the federal target for an *interconnection agreement*. It is time to a signed agreement, not time to energisation. The researcher's "True as" ("averaged about 20 months' wait") leaves out the milestone.
(c) **Attribution.** The edition's chain gives this piece `src:'ERCOT; Dominion; LBNL'`. LBNL, the origin of the figure, is among the named sources. "Not an ERCOT figure" is correct. "The attribution to ERCOT is wrong as to source" is not, because the inventory cut the list down to ERCOT. The fault is population and milestone (generation queue, time to agreement), not a missing source.
(d) **"Now paused" holds, from the attributed source itself.** The researcher calls the pause only "a governor's call for a moratorium per Utility Dive". ERCOT's own board deck says ERCOT paused energisation approvals for new data centres and crypto loads of 75 MW and up, and paused the Batch Zero study. That is a better primary, and it is ERCOT, the source the chain names. The pause covers new large-load data centres and crypto facilities. It is not every Texas tie-in.
(e) **Edition mismatch, a lead not settled.** Carousel slide 04 cites "LBNL QUEUED UP 2026". The 20 months comes from the 2025 edition, by way of Carbon Direct. A secondary blog (Reslink, 24 Oct 2026, https://www.reslink.org/blogs/us-interconnection-queue-2026-solar-storage-wait-times/) says "ERCOT ... averaged 24 months from request to agreement", sourced to Queued Up 2026. Both LBNL PDFs were over the fetch tool's 10 MB limit, so neither figure is confirmed in LBNL's own pages.

"True as" should read: "Generation and storage projects in ERCOT's queue waited an average of about 20 months to reach an interconnection agreement (Carbon Direct, May 2026, citing LBNL's Queued Up 2025 edition). This is not a timeline for connecting data-centre load. After Governor Abbott's 3 Aug 2026 directive, ERCOT paused energisation approvals for new data centres and crypto-mining loads of 75 MW or more, pending a verification audit (ERCOT board update, Sep 2026)."

The page should say instead of "about 20 months in Texas, now paused": "in Texas, new data-centre energisations paused since 3 Aug 2026". If a number is wanted: "generators wait about 20 months for an agreement in ERCOT; new data-centre energisations paused since 3 Aug 2026".

## 3.2. Chain, Connection study: "$100,000 study fee in Texas"
Researcher's verdict: overstated. **Skeptic: overturned. The figure holds; only the attribution needs fixing.** Nothing in "$100,000 study fee in Texas" goes beyond the sources. The statute the researcher could not read is readable, and it confirms the figure word for word.

Evidence:
- Texas SB 6 (89th Leg.), enrolled text, HTML version, new PURA §37.0561(f): "The standards must set a flat study fee of at least $100,000 to be paid to the interconnecting electric utility or municipally owned utility for initial transmission screening studies for large loads subject to Subsection (c)." §37.0561(c): "The commission shall establish a demand threshold of 75 megawatts unless the commission determines that a lower threshold is necessary". https://capitol.texas.gov/tlodocs/89R/billtext/html/SB00006F.htm
- Utility Dive, Diana DiGangi, "Texas PUC adopts softened rules on data center interconnection", 21 Sep 2026: "voted Friday to adopt new large load interconnection standards"; "set a flat study fee of $100,000, regardless of load size."; "the adopted rule settled on a flat $100,000 study fee for all large load customers."; "required a non-refundable interconnection fee of $50,000 per MW of contracted peak demand." / "The PUCT eliminated this from its final rule."; "the commission may amend the rule to update the study fee amount that is required,". https://www.utilitydive.com/news/texas-puc-adopts-data-center-interconnection-rules/830899/
- Foley, 31 Mar 2026. Both of the researcher's quotes are confirmed: "Fixed Study Fees: A flat screening study fee of at least $100,000." and "Study Fees: Study fees of $100,000 to $300,000 depending on the size of the project." https://www.foley.com/insights/publications/2026/03/public-utility-commission-of-texas-issues-proposed-rules-for-large-load-interconn/
- ERCOT, "89th Legislative Session – ERCOT Status", October 2026, slide 6 (SB 6, on-site backup generation): "Complete | Monitor and participate in PUC rulemaking in Project No. 58481, Rulemaking to Implement Large Load Interconnection Standards | 09/18/2026". Slide 4 gives the same item with "09/16/2026". https://www.ercot.com/files/docs/2025/09/15/89th-Legislative-Session-PPTX-ERCOT-Status-October-2026-Final-PDF.pdf (read as page images)

Findings:
(a) **The verdict.** The chain says only "$100,000 study fee in Texas". That is the statute's floor and the rule's flat amount, exactly. "Overstated" does not fit, because the claim asserts nothing beyond the number. The real fault is attribution: the chain's sources for this piece are "ERCOT; PJM". The fee is set by statute and PUCT rule and is paid to the interconnecting utility, not to ERCOT.
(b) **The statute can be quoted.** The researcher took SB 6's wording from a search summary and from Foley because the enrolled PDF would not render. The HTML enrolled text renders, and is quoted above. Replace the second-hand statutory wording with §37.0561(f).
(c) **The PJM note is misdirected.** In the chain, PJM goes with "220 GW in PJM's first cycle", not with the fee. The $100,000 does not need a PJM source, so "the PJM attribution is unverified" is not a defect of this claim. The 220 GW figure is a separate claim that the inventory left out of this lane.
(d) **Adoption date.** Utility Dive gives no date beyond "Friday". ERCOT's October 2026 status deck marks its Project 58481 item complete on 09/18/2026 on one slide and 09/16/2026 on another. The 18 Sep reading is now supported by a primary, but not settled. White & Case returned HTTP 403 to me as well.
(e) **Scope.** §37.0561 applies to large loads in the ERCOT power region, at 75 MW unless the PUCT lowers it. "In Texas" is the edition's shorthand. Texas utilities outside ERCOT are not covered.

"True as" should read: "Texas law (SB 6, 2025, PURA §37.0561(f)) requires a flat study fee of at least $100,000, paid to the interconnecting utility, for initial transmission screening studies of large loads (75 MW and up) in ERCOT. The PUCT's final rule, adopted in September 2026 (Project 58481), set it at a flat $100,000 regardless of load size."

The page should keep "$100,000 study fee in Texas" and change the chain source for this piece to "PUCT (SB 6); ERCOT; PJM", or move the fee to a piece whose source is PUCT. The lane summary should count 3.2 as holds, not overstated.

## 3.3. Chain, Rules that settle: "Texas SB6 adopted Sep 2026" [also Firm generation: "curtailment under SB6"]
Researcher's verdict: wrong. **Skeptic: amended.** The verdict and "True as" stand. The signing date now rests on the Legislature's own record, the FERC note is misdirected, and the folded clause was left unchecked. It holds.

Evidence:
- Texas Legislature Online, SB 6 (89R) bill history: "Last Action: 06/20/2025 E Effective immediately". The history lists "Signed by the Governor" on 06/20/2025. https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB6
- ERCOT, "89th Legislative Session – ERCOT Status", October 2026, slide 4, headed "Senate Bill 6: Sections 1 & 2, Interconnection Cost Recovery and Interconnection Standards for Large Loads": "Monitor and participate in PUC rulemaking in Project No. 58481, Rulemaking to Implement Large Load Interconnection Standards", marked Complete. (The slide's header box names the project as "PUC Project No. 58541", which looks like a typo for 58481.) URL as under 3.2.
- SB 6 enrolled, §37.0561(e): "may direct the applicable electric utility or municipally owned utility to require the large load customer to either deploy the customer's on-site backup generating facilities or curtail load." §39.170(a): "to allow the load to be curtailed during firm load shed." https://capitol.texas.gov/tlodocs/89R/billtext/html/SB00006F.htm
- Foley, 31 Mar 2026: "Senate Bill 6, which was enacted in June 2025 (89th Legislature)" (confirmed). Utility Dive, 21 Sep 2026, does not mention SB 6 (confirmed).

Findings:
(a) **Signing date.** "Signed 20 June 2025, effective immediately" is now in a primary, the bill history. It no longer rests on a search summary.
(b) **The link from rule to statute.** The researcher had no source tying Project 58481 to SB 6, because Utility Dive does not name the bill. ERCOT's status deck files Project 58481 under its SB 6 heading.
(c) **The FERC note is misdirected.** In the chain, FERC goes with "federal rule RM26-4 still open", not with SB 6. "No FERC source for SB 6 was found" is true but beside the point. The RM26-4 half of the piece is not in this lane.
(d) **The folded clause holds.** "Curtailment under SB6" (Firm generation, Without it) is supported by §37.0561(e) and §39.170. The researcher did not check it.

"True as" stands, with one sentence added: "SB 6 also lets ERCOT have large loads curtailed or switched to backup generation in emergencies (PURA §37.0561(e), §39.170)."

The page should say instead of "Texas SB6 adopted Sep 2026": "Texas SB6 rule adopted Sep 2026". The smallest fix is to insert "rule". The longer form is "Texas SB6 (2025); PUCT rule adopted Sep 2026". "Curtailment under SB6" stays.

## 3.4. Section 06: "Texas keeps its own interconnection to stay outside federal transmission rules. That is why it connects faster, and why nobody can rescue it when it runs short."
Researcher's verdict: not in the source. **Skeptic: amended.** As to cite 32, "not in the source" is right. But the first sentence has a readable source elsewhere. "Connects faster" has partial support. And "nobody can rescue it" is not merely unsupported: the edition's own cited source contradicts it.

Evidence:
- ERCOT Grid Insights, May 2025 (cite 32), read in full (2 pages). It does not mention FERC, federal jurisdiction or connection speed (confirmed). Its stated subject is the means "that ERCOT uses to transfer power between the ERCOT grid and grids on our seams, ensuring daily grid reliability and supporting emergency operations during scarcity conditions." P. 2: "ERCOT has 19 resources at four different stations totaling approximately 3,600 MW" of Switchable Generation Resources, which "may physically switch their connections and deliver their power to ERCOT or the other grid". Also: "There are 18 BLTs in the ERCOT region." "Although BLTs are limited, they allow ERCOT and other grids to restore power from outages (like outages from an ice storm, tornado, or hurricane)". https://www.ercot.com/files/docs/2025/05/12/ERCOT-Grid-Insights-Electricity-Connection-and-Transfer.pdf
- Texas Tribune, Kate Galbraith, "Texplainer: Why does Texas have its own power grid?", 8 Feb 2011, updated 15 Feb 2021: "Basically, Texas has its own grid to avoid dealing with — you guessed it — the feds." "The ERCOT grid remains beyond the jurisdiction of the Federal Energy Regulatory Commission". "ERCOT is also not completely isolated from other grids". The ties "can move power commercially as well as be used in emergencies" (attributed to an ERCOT spokeswoman). The article reports Texas "imported some power from Mexico during the rolling blackouts of 2011." https://www.texastribune.org/?p=73943
- Pattern Energy, Southern Spirit fact sheet, Oct 2023: "Preserves ERCOT's independence via Federal approval granted in May 2014". https://patternenergy.com/wp-content/uploads/2023/11/10112023-SST_General_Factsheet.pdf
- pv magazine USA, William Driscoll, 7 Jan 2026, on LBNL's analysis: Berkeley Lab says connect-and-manage "is likely one reason" for ERCOT's higher interconnection agreement rates. ERIS requests were "not significantly faster to process" than NRIS, "though ERCOT requests [were] faster." The article does not mention FERC. https://pv-magazine-usa.com/?p=19491
- FERC's ERCOT page returned HTTP 403 to me as well. Not opened.

Findings:
(a) **Sentence 1 has a source.** It is not in cite 32. But the Texas Tribune explainer (secondary, readable) states both the motive (to avoid federal oversight) and the result (outside FERC jurisdiction). The researcher's "True as" said "secondary support only" and leaned on a search snippet. It can rest on the Tribune page instead, and a primary (FERC's page) is still to be read.
(b) **"Connects faster" is partly supported, but not "that is why".** LBNL, via pv magazine, finds ERCOT generation requests faster, and attributes it likely to ERCOT's connect-and-manage design, not to its being outside federal rules. Carbon Direct's 20 vs 25 national vs 40 PJM months (3.1) points the same way, for generation reaching agreements. No source read ties the speed to federal exemption. The causal "That is why" remains the edition's own inference. It is also printed under an F mark rather than an I.
(c) **"Nobody can rescue it when it runs short" is contradicted, not just unsupported.** The edition's own cite 32 exists to describe how ERCOT gets power from neighbours during "emergency operations during scarcity conditions". It lists 1,220 MW of ties, about 3,600 MW of switchable generation and 18 block load transfers. The Tribune reports emergency imports from Mexico in 2011. The defensible claim is that outside help is small relative to peak, not that there is none. The researcher filed this as "opinion".

"True as" should read: "ERCOT's grid stays within Texas, which keeps it outside FERC's jurisdiction over interstate transmission. That was the historical motive, per the Texas Tribune. Its generation projects have reached interconnection agreements faster than other regions', which LBNL attributes in part to ERCOT's connect-and-manage approach. The help it can draw from other grids is limited: about 1.2 GW of ties, about 3.6 GW of switchable generation and 18 block load transfers (ERCOT, May 2025)."

The page should say: "Texas keeps its grid inside the state, which keeps it outside federal transmission rules. Its generators get connected faster than most, and when it runs short, the help it can pull from its neighbours is small." The causal "That is why" should go, or be marked I. "Nobody can rescue it" should go.

## 3.5. Section 06: "Its direct-current ties to the rest of the country total 820 megawatts, plus 400 to Mexico, about 1.3 percent of its peak." [also stat "1.3% Texas import capacity as a share of its peak."]
Researcher's verdict: holds. **Skeptic: amended.** The prose sentence holds, and the denominator is now confirmed in ERCOT's own report. The folded stat block was not tested, and its label claims more than the source.

Evidence:
- ERCOT Grid Insights, May 2025, p. 1: "two DC Ties with the Southwest Power Pool (SPP) (820 MW) and a DC Tie and a VFT with CENACE, Mexico's independent operator of the national grid (400 MW)." The map gives "North 220 MW", "East 600 MW", "Laredo 100 MW", "Railroad 300 MW". It describes the VFT as one "which acts similar to a DC Tie". P. 2: switchable generation "totaling approximately 3,600 MW". URL as under 3.4.
- ERCOT, Monthly Operational Overview (July 2026), 17 Aug 2026, slide 2: "ERCOT set a new unofficial all-time peak demand record of 91,134 MW* at hour ending 18 on 7/22/2026". Footnote: "* Preliminary value from August Demand and Energy 2026 report." https://www.ercot.com/files/docs/2026/08/17/ERCOT-Monthly-Operational-Overview-July-2026.pdf (read as page images)

Findings:
(a) **Arithmetic confirmed against the primary.** 1,220 / 91,134 = 1.34 percent, so "about 1.3 percent" holds. The researcher had not opened cite 03. The peak is 91,134 MW, preliminary and unofficial, per ERCOT.
(b) **"Direct-current" is slightly loose.** Of the 400 MW to Mexico, 100 MW (Laredo) is a variable frequency transformer, which ERCOT says "acts similar to a DC Tie". It is not a DC tie. This is minor.
(c) **The stat block's label is wider than the source.** "Texas import capacity as a share of its peak" treats the ties as all of Texas's import capacity. The same ERCOT issue lists about 3,600 MW of switchable generation that can deliver to ERCOT, plus 18 block load transfers. The 1.3 percent is DC-tie (and VFT) capacity, not total import capacity.

"True as" stands, with this addition: "against ERCOT's preliminary July 2026 record of 91,134 MW; the 400 MW to Mexico includes a 100 MW variable frequency transformer."

The page should keep the prose. The stat block should change "1.3% Texas import capacity as a share of its peak" to "1.3% Texas DC-tie capacity as a share of its peak".

## 3.6. Section 06: "A 3 gigawatt line to Mississippi, Southern Spirit, is scheduled for service somewhere between 2029 and 2032, depending on which of its own documents you read."
Researcher's verdict: overstated. **Skeptic: overturned. The claim holds.** Pattern's own documents give two different target in-service years, 2029 and 2032. The researcher read only the project page and missed the fact sheet linked from it. The researcher's "No regulatory approval is mentioned on the page" is also wrong.

Evidence:
- Pattern Energy, Southern Spirit Transmission fact sheet, dated "OCTOBER 2023", linked from the project page, p. 2, "Projected Schedule": "2026 Target Construction Start" / "2029 Target In-Service Date". P. 1: "an approximately 320-mile ±525 kilovolt, ~3,000 megawatt high voltage direct current (HVDC) transmission line" and "Preserves ERCOT's independence via Federal approval granted in May 2014". https://patternenergy.com/wp-content/uploads/2023/11/10112023-SST_General_Factsheet.pdf
- Pattern Energy, project page (undated; footer "© Pattern Energy 2026"), "Projected Schedule": "2029 Target Full Construction Start" / "2032 Target In-Service Date". FAQ: "Southern Spirit could be operational as early as late 2029." Project Benefits: "Preserves ERCOT's independence via Federal approval granted." https://www.patternenergy.com/projects/southern-spirit-transmission/
- The fact sheet also says: "Southern Spirit will begin in Louisiana at the Texas border and extend into Mississippi. It will connect to Texas by way of the Rusk to Panola Transmission Project in partnership with Garland Power & Light."

Findings:
(a) **Two documents, two in-service targets.** The October 2023 fact sheet targets service in 2029. The current page targets 2032 and keeps "as early as late 2029" in its FAQ. "Depending on which of its own documents you read" is accurate. The researcher's "a single web page with two statements, not separate documents" is overturned.
(b) **The construction-start reading.** The researcher said "the 2029 date on the page is the target start of construction, not service". That is true of the current page. But 2029 was the in-service target in Pattern's earlier document. The construction start slipped from 2026 to 2029 and the in-service date from 2029 to 2032.
(c) **Approval is mentioned.** The page's benefits list ends "Preserves ERCOT's independence via Federal approval granted." The fact sheet dates it "May 2014". The researcher's negative is wrong. The federal approval concerns ERCOT's jurisdictional independence. The page still says construction waits on "the necessary regulatory approvals" and land rights, and that the project has applications before the Louisiana and Mississippi PSCs. Approval is partial, not absent.
(d) **Small framing point, not a reason to downgrade.** "Scheduled ... somewhere between 2029 and 2032" can read as a live range. The sources show a dated schedule (2029, Oct 2023) and a later one (2032, current page). The edition's "depending on which of its own documents you read" already signals this.

"True as" should read: "Pattern Energy's October 2023 fact sheet gave Southern Spirit, a ~3,000 MW HVDC line from the Texas–Louisiana border into Mississippi, a 2029 target in-service date. Its current project page gives 2032, while saying it 'could be operational as early as late 2029'."

The page can stand as written. If the owner wants it tighter: "A 3 gigawatt line to Mississippi, Southern Spirit, was due in service in 2029 by Pattern's 2023 fact sheet and is due in 2032 by its current web page." The lane summary should count 3.6 as holds.
