# Skeptic 17: China's queue, chips and fabs (Waiting for the Tie-In, 15 Oct 2026)

Checks research/waiting-for-the-tie-in/lane-17.md. Read: 2026-11-01. Tools: Read, Grep, WebFetch. The shared web-search budget was exhausted on my first search, so no searches were possible; every external check below is a direct fetch of a page the edition, the researcher or a cited page links to. Edition text checked in source/waiting-for-the-tie-in.html (section 08 prose line 240; chain lines 307-309; side-by-side rows 484-486; sources list line 291) and in the uploaded print (16-page carousel PDF, edition 08): slide 13 "AI accelerators shipped, 2025, M | 0.8 | 4.5" under "CHINA · UNITED STATES" (source line "NEA · EIA · WNA · CNESA · EPOCH AI"), slide 14 "Huawei shipped 0.8 million AI chips to Nvidia's 4.5 million." (source line "MIT TECHNOLOGY REVIEW · EPOCH AI").

General finding on the primary for 17.1 to 17.3: the researcher (and the edition's source 62, "Epoch AI. Huawei's roadmap to 2031, Sep 2026.") gives the title as "Huawei's roadmap to 2031". That is the URL slug. The page's title is "Will Huawei catch up to Nvidia by 2030?" (by Venkat Somala, "Sep. 4, 2026", "updated Sep. 24, 2026"), https://epoch.ai/publications/huaweis-roadmap-to-2031 , fetched 2026-11-01. For the owner: source 62's title should be corrected. Also, the last 5,659 characters of that page, when fetched, contained a block of instructions addressed to the reader-model (asking for keyword quoting and formatting). It was treated as data and ignored; nothing in this file rests on it.

## 17.1. Huawei shipped about 800,000 Ascend accelerators in 2025 against roughly 4.5 million from Nvidia
Verdict on the researcher: **overturned** (researcher: overstated; the sentence holds)

Evidence:
- Epoch AI, "Will Huawei catch up to Nvidia by 2030?", https://epoch.ai/publications/huaweis-roadmap-to-2031 , section "Production volume": "We estimate Huawei produced 800,000 Ascend units in 2025, compared to the 4.5 million units Nvidia sold." The researcher's quote drops the opening "We estimate"; the note does say it is an estimate.
- Same page, section "Compute output": "Even though Huawei's shipments would nearly double from 800,000 in 2025, ..." Epoch itself calls the same 800,000 "shipments".
- Same page: Epoch's 2026 median ("Huawei will produce 1.5 million units") is matched against a WSJ report that "Huawei expects to ship 1.5 million Ascend units in 2026"; the report uses "produce" and "ship" interchangeably.
- The "4.5 million units" is a link to Epoch's own data explorer. Epoch AI, "Data on AI chip sales" (updated Oct. 21, 2026), https://epoch.ai/data/ai-chip-sales , methodology: for Nvidia and AMD, "our revenue-based estimates reflect chips that have been delivered to customers"; for others, "third-party analyst estimates generally refer to chips shipped or produced", and the distinction is often unclear in the source material.

Assessment: the researcher's scope change (a), "Epoch says 'produced,' not 'shipped'", is contradicted by Epoch's own "Huawei's shipments would nearly double from 800,000 in 2025", and Epoch's data page says it cannot separate shipped from produced for such figures. Scope change (b), the production against units-sold mismatch, is likewise weaker than stated: Epoch's Nvidia figure is an estimate of chips "delivered to customers", which is what "shipped" means. What survives is that both numbers are Epoch estimates (Nvidia's from reported revenue), not company counts. The sentence's "about" and "roughly" carry that. Its F (verified fact) mark is the one stretch.

Page change: none required. If the owner wants the estimate explicit: "Huawei shipped an estimated 800,000 Ascend accelerators in 2025 against roughly 4.5 million from Nvidia, by Epoch AI's count,".
For the owner (not this claim's sentence): the print's slide 13 places Nvidia's 4.5 million under "UNITED STATES" against China's 0.8. Epoch's figure is Nvidia's worldwide deliveries, not chips shipped in or to the US. The web row (line 484) says "Huawei Ascend against Nvidia", which is accurate.

## 17.2. its leading node is held at a 7 nanometre class without EUV
Verdict on the researcher: **amended** (content holds; the researcher's objections (a) and (b) fail; the attribution finding (c) stands)

Evidence:
- Epoch AI, same page, "Transistor density": "SMIC's leading process in mass production is the 7 nm N+3 node." Then: "The compute dies in the 950 and 960 are fabricated on SMIC's N+3 process, while the 970 likely moves to the more advanced N+4 process. Both are 5–7 nm equivalent DUV processes, and the transition to N+4 is expected to increase transistor density by only 20%." "Both" is N+3 and N+4, so N+4 is also 5–7 nm-class.
- Same section: "SMIC will move to its N+4 and N+5 nodes over the next five years, but at each point in time, TSMC's leading process will deliver roughly double the transistor density of SMIC's." And: "US export controls restrict sales of advanced lithography machines to China" ... "China's indigenous efforts to produce these machines likely won't materialize until after 2030" ... "which leaves SMIC unable to print transistors denser than a 5 nm equivalent process until at least the end of the decade."
- Better primary, the source Epoch links for that sentence: SemiAnalysis, "Is SMIC N+3's Metal Pitch Smaller than Intel 18A's?", 14 June 2026, https://newsletter.semianalysis.com/p/steel-smic-n3-teardown (free preview; the body is paywalled and was not worked round): "Now, SMIC is shipping its third-generation 7 nm (N+3) process in Huawei's Kirin 9030" and "Without EUV, SMIC is leaning harder on DUV multi-patterning, DTCO, and increasingly complex integration."
- Taipei Times, "TSMC nets nearly 70% of 2025 foundry market", 14 Mar 2026, https://www.taipeitimes.com/News/biz/archives/2026/03/14/2003853777 : "China's Semiconductor Manufacturing International Corp (SMIC, 中芯) ranked third with US$9.33 billion in sales". No node, EUV or Huawei content.

Assessment: (a) "without EUV" is not an inference the page has to defend alone: SemiAnalysis, the source Epoch cites for the lithography limit, says "Without EUV" verbatim. The researcher's support for the opposite, "a separate summary of the page", is a model summary, not evidence. (b) "Held at" is Epoch's finding, not a distortion of it: N+4 is itself a "5–7 nm equivalent DUV" process with "only 20%" more density, and Epoch says SMIC cannot go below "a 5 nm equivalent process until at least the end of the decade". Citing the N+4 move against "held at" misreads the section. (c) Upheld: cite 64 has no node content, so the TrendForce attribution does not support this clause. For precision, the article does mention SMIC (ranked third by revenue); it says nothing about SMIC's nodes. One residual point the researcher did not make: "its" in the sentence refers to Huawei, which has no fab; the node is SMIC's, on which Huawei's Ascend dies are made.

True as (researcher's line, corrected): "SMIC's leading mass-production node, on which Huawei's Ascend dies are made, is the 7 nm-class N+3, a DUV process made without EUV (SemiAnalysis, cited by Epoch); Epoch expects SMIC to stay at 5–7 nm-equivalent density until at least the end of the decade."
Page change (smallest): "the leading node it can use is held at a 7 nanometre class without EUV". Attribution: Epoch AI (and SemiAnalysis), not TrendForce; drop cite 64 from this clause. For the owner: the side-by-side row at line 486 ("Leading logic node in volume | 7 nm class | 2 nm | SMIC without EUV against TSMC N2.") links only the Taipei Times article, which mentions neither 7 nm nor 2 nm.

## 17.3. and its stockpile of foreign high-bandwidth memory is expected to run out this year.
Verdict on the researcher: **upheld** (one precision added)

Evidence (Epoch AI, same page):
- "Can Huawei make up the difference in volume?": "That stockpile is enough for roughly 1–2 million Ascend chips, but it is expected to run out in 2026." And: "In 2025, the gap was filled by illegally acquired components and a stockpile of more than 10 million foreign HBM stacks that Chinese firms built up before the December 2024 export controls took effect."
- "Production volume": "Much of that stockpile was spent on 2025 Ascend production, and we model it being fully spent in 2026." Also: "we estimate that Huawei's remaining stockpile of Samsung HBM from the end of 2024 plus smuggled HBM in 2025 could support roughly 430,000 additional Ascend 910Cs."

Assessment: quote verbatim and in context; "this year" is 2026 for a 15 Oct 2026 edition; "expected" matches Epoch's modelled projection. Precision the researcher's note half-gives: the 10-million-stack stockpile is described as one "Chinese firms built up", while Epoch separately speaks of "Huawei's remaining stockpile of Samsung HBM". "Its stockpile" (Huawei's) is supported by the second; the chain's "China's stockpile of foreign HBM runs out in 2026" (line 309) is supported by the first. Neither wording needs to change.

## 17.4. Share of tracked AI compute | ~15% | ~75% | Epoch AI. US ahead.
Verdict on the researcher: **amended** (the date point stands; the scope point (b) misreads "tracked"; an Epoch qualifier is missing)

Evidence:
- Epoch AI, "Trends in AI supercomputers", by Konstantin F. Pilz, Robi Rahman, James Sanders and Lennart Heim, published "Apr. 23, 2025", no updated date, https://epoch.ai/data-insights/trends-in-ai-supercomputers : "The United States dominates AI supercomputers globally, owning about 75% of total computing power in our dataset." "China is in second place at 15%." "The United States accounts for about three-quarters of global AI supercomputer performance in our dataset, with China in second place with 15% (Figure 4)."
- Figure 4 caption: "Share of AI supercomputer computational performance by country over time." "Our dataset covers an estimated 10–20% of global aggregate AI supercomputer performance as of March 2025." "While coverage varies across companies, sectors, and hardware types due to uneven public reporting, we believe the overall distribution remains broadly representative."
- No newer share: Epoch AI, "Data on GPU clusters" (last updated Mar. 13, 2026), https://epoch.ai/data/gpu-clusters , states no US or China share; it repeats coverage "as of March 2025" and "Future country shares may change dramatically as exponential growth continues."

Assessment: quotes verbatim. (a) Upheld: the shares are as of March 2025 (the dataset date), on a page published April 2025; nothing newer from Epoch gives a share. (b) Overturned: "tracked AI compute" is a fair rendering of "computing power in our dataset". "Tracked" already means "in the dataset", so it does not claim a worldwide share. The researcher also left out Epoch's own qualifier that it believes "the overall distribution remains broadly representative", which bears on how much the 10–20% coverage weakens the row. (c) Partly answered: the Figure 4 caption names the measure as "computational performance"; the unit is not given. (d), (e) upheld.

True as (researcher's line, corrected): "In Epoch AI's dataset of AI supercomputers, as of March 2025, the US held about 75% of computational performance and China about 15%. The dataset covers an estimated 10–20% of global AI supercomputer performance; Epoch believes the distribution is broadly representative."
Page change (smallest): "Share of tracked AI compute, Mar 2025 | ~15% | ~75% | Epoch AI. US ahead."

## 17.5. TSMC holds 70% of foundry revenue; N2 in volume in Taiwan since late 2025.
Verdict on the researcher: **amended** (the negative on "in Taiwan" is overturned by a TSMC primary; the rest stands)

Evidence:
- Taipei Times, "TSMC nets nearly 70% of 2025 foundry market", Saturday 14 Mar 2026, staff writer with CNA, https://www.taipeitimes.com/News/biz/archives/2026/03/14/2003853777 : "... accounting for 69.9 percent of the global market, TrendForce said." "Its share was up from 64.4 percent in 2024, it said." Also: "In the fourth quarter of last year alone, TSMC's share of the global foundry market was 70.4 percent, down from 71.0 percent ..." No mention of 2 nm or N2.
- TSMC, N2 technology page, https://www.tsmc.com/english/dedicatedFoundry/technology/logic/l_2nm : "TSMC's 2nm (N2) technology has started volume production in 4Q25 as planned." No site named.
- TSMC, Q3 2026 earnings call, 15 Oct 2026 (LSEG StreetEvents edited transcript, linked from TSMC's investor page https://investor.tsmc.com/english/quarterly-results/2026/q3 ; working URL https://investor.tsmc.com/english/encrypt/files/encrypt_file/reports/2026-10/eba4fac72873bf546b669bd2b5d973df5c93215d/TSMC%203Q26%20Transcript.pdf ; the same path on www.tsmc.com returns 404), C.C. Wei, page 5: "Our new node, N2, has already entered a high-volume manufacturing in the fourth quarter of 2025, with good yield. N2 is ramping successfully in multiple phases at both Hsinchu and Kaohsiung sites." Also (Wendell Huang, page 3): "2-nanometer process technology contributed 8% of wafer revenue in the third quarter".
- TSMC, fab locations, https://www.tsmc.com/english/aboutTSMC/TSMC_Fabs : Fab 20, "Hsinchu Science Park, Hsinchu 308-001, Taiwan, R.O.C."; Fab 22, "Nanzi Dist., Kaohsiung City 811-019, Taiwan, R.O.C."

Assessment: (a) upheld: 69.9% (TrendForce, 2025) rounds to 70%; Q4 2025 alone was 70.4%. "Holds" in the present tense describes a full-year 2025 figure; that is the latest the cited article gives. (b) upheld: cite 64 says nothing of N2. (c) overturned: the researcher left "in Taiwan" unverified for want of a primary. TSMC's CEO says N2 is "ramping ... at both Hsinchu and Kaohsiung sites", and TSMC's own fab list places both in Taiwan. "N2 in volume in Taiwan since late 2025" is fully supported by TSMC: high-volume manufacturing in 4Q25, at Hsinchu and Kaohsiung. (d) upheld: Epoch's Huawei report gives no TSMC share. (e) moot.

True as (researcher's line, corrected): "TSMC had 69.9% of global foundry revenue in 2025 (TrendForce). TSMC says N2 entered high-volume manufacturing in the fourth quarter of 2025 and is ramping at its Hsinchu and Kaohsiung sites in Taiwan."
Page change (smallest): "TSMC holds about 70% of foundry revenue (2025); N2 in volume in Taiwan since late 2025." Sources: add TSMC (3Q26 call or N2 page) for the N2 half; Epoch AI should be dropped from the chain card's source for this line.

## 17.6. TSMC Arizona Fab 2 (N3) volume in late 2027
Verdict on the researcher: **amended** (the verdict stands and is now settled on the primary the researcher could not open)

Evidence:
- TSMC, Q3 2026 earnings call, 15 Oct 2026 (transcript as in 17.5), C.C. Wei, page 5, under "TSMC's global N3 capacity expansion update" ("we are executing well on our global capacity plan to add 3 new fabs to support the robust multiyear pipeline or demand for 3-nanometer technologies"): "In Arizona, we have completed the construction of our second fab and are in the process of tool move-in and installation. Volume production will begin in third quarter '27, slightly ahead of our previous schedule."
- TrendForce, "[News] TSMC N3 Tightens on AI Demand; Arizona 2nd Fab 3nm Volume Production in 2H27, Kumamoto in 2028", 16 Apr 2026, https://www.trendforce.com/news/2026/04/16/news-tsmc-n3-tightens-on-ai-demand-arizona-2nd-fab-3nm-volume-production-in-2h27-kumamoto-in-2028/ : "In Arizona, its second fab will also adopt 3nm technologies." "Construction has already been completed, and volume production is set to begin in the second half of 2027, as Wei highlights." This is TrendForce's paraphrase, not a direct quote.

Assessment: the researcher's note (b) said the 3Q27 wording rested on a secondary summary because the transcript returned 404. The transcript is on investor.tsmc.com (the www.tsmc.com path the investor page links to is the one that 404s). It confirms 3Q27 verbatim. TSMC's latest guidance, given on the edition's own date, is the third quarter of 2027. Its earlier guidance was the second half of 2027. "Late 2027" matches neither and runs later than both. The N3 label is supported: the second Arizona fab is listed among the three new 3 nm fabs.

True as: "TSMC says volume production at its second Arizona fab, a 3 nm fab, will begin in the third quarter of 2027, slightly ahead of its previous schedule (Q3 2026 earnings call, 15 Oct 2026)."
Page change (smallest): "TSMC Arizona Fab 2 (N3) volume from Q3 2027". Source to add: TSMC, Q3 2026 earnings call, 15 Oct 2026.

## 17.7. One supplier, ASML
Verdict on the researcher: **upheld** (two small corrections to the entry)

Evidence:
- ASML Holding N.V., Annual Report 2025, filed with the SEC on a Form 6-K, https://www.sec.gov/Archives/edgar/data/937966/000162828026011377/asml-2025xannualxreportx.htm : "ASML is currently the world's only manufacturer of EUV lithography systems." The document says "This document is the PDF/printed version of the 2025 Annual Report of ASML Holding N.V." and carries "© 2025-2026".
- EDGAR folder https://www.sec.gov/Archives/edgar/data/937966/000162828026011377/ : files last modified 2026-02-25, with a cover document "form6-kannualreportbasedon.htm" and "asmlpublishes2025annualrep.htm". This dates the filing to about 25 Feb 2026, which the researcher left undated.
- Edition, source/waiting-for-the-tie-in.html line 308: `{id:'euv',t:'EUV lithography',...,cost:'One supplier, ASML',...,src:'ASML; Epoch AI'}`.

Assessment: quote verbatim and in context. The researcher's rewording advice ("should keep 'of EUV systems'") is unnecessary: the phrase sits on a card titled "EUV lithography", so the scope is already given. The card's source is "ASML; Epoch AI", not "ASML" alone as the inventory records. The Epoch Huawei report (the Epoch page in this lane) does not use the word EUV in its body, so Epoch supports nothing on this card. No independent market study could be sought (search budget spent). ASML's statement is its own, as the researcher says.

True as: unchanged. Page change: none to the phrase; drop "Epoch AI" from the EUV card's source unless another Epoch page is meant.

## Tally
Upheld 2 (17.3, 17.7) · Overturned 1 (17.1) · Amended 4 (17.2, 17.4, 17.5, 17.6). Two of the researcher's negatives fell to primaries: "in Taiwan" unverified (17.5) and the 3Q27 wording resting on a secondary (17.6). Both are settled by TSMC's Q3 2026 call transcript on investor.tsmc.com. Two scope objections misread the source: "produced, not shipped" (17.1) and "held at" against N+4 (17.2). For the owner: source 62's title is the URL slug, not the page's title, and the Epoch page carries embedded instructions in its tail. No characterisation of Anthropic appears in this lane.
