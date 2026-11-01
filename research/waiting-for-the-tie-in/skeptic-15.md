# Skeptic 15: The page against itself (Waiting for the Tie-In, 15 Oct 2026)

Checks research/waiting-for-the-tie-in/lane-15.md. Read: 2026-11-01. Tools: Read, Grep, WebFetch. The web-search budget for this run was exhausted on the first search, so no new searches were possible; every external check below is a direct fetch of a page the edition or the researcher cites.

General finding on the researcher's primaries: the researcher cites `work/sim.mjs` and `work/data.ts` (the 08 table at "lines 60-90", the chain at "lines 3 to 21"). Neither file exists in this repository (Glob for `**/{sim.mjs,data.ts}` and `work/**` returns nothing). The model, slider notes, chain and side-by-side rows are all in source/waiting-for-the-tie-in.html: chain array lines 306-326, sliders lines 355-379, `sim()` lines 387-406, side-by-side table `G` lines 461-500, sources list line 291. All quotes below are from that file. I re-ran the model by hand from lines 353-406 at the defaults (no shell available).

The uploaded print (16-page carousel PDF, edition 08) was also read; its slide 10 ("34 GW of chips, unplugged ... 224 delivered ... 195 powered ... Peak gap in 2029. The queue never clears.") bears on 15.2.

## 15.1. The requests add up to more than five Texases.
Verdict on the researcher: **amended** (sentence stands; researcher's primary description and "true as" need correction)

Evidence:
- Utility Dive, https://www.utilitydive.com/news/ercot-texas-puc-data-center-audit/828472/ , fetched 2026-11-01. The article's headline is "ERCOT aims to complete Texas governor's data center audit by December" (Robert Walton, 21 Aug 2026), not "ERCOT tells Texas PUC large-load queue reaches about 474 GW" as the edition's source 02 and the researcher give it. The fetch reports that the 474 GW figure ("ERCOT interconnection queue requests total about 474 GW") and "approximately 90% are data centers" come from Governor Abbott's letter to ERCOT, not from an ERCOT filing to the PUC. The comparison is Utility Dive's own: "the queue is more than five times ERCOT's record peak electricity demand." The article calls the figure "interconnection queue requests"; it does not call them "large-load requests".
- ERCOT, https://www.ercot.com/static-assets/data/news/content/a-peak-demand/2026/all-time-records.htm , fetched 2026-11-01: July 2026, "July 22 | 91,134*"; the highest value on the page. "The unofficial demands reported during, or just after, an operating day are preliminary." and "The numbers may change slightly as the data goes through the settlement process." August values run to 90,353 (20 Aug), below the July figure.

Assessment: 474 / 91.134 = 5.2. The sentence on the page holds, and Utility Dive states the same comparison itself. Two things in the researcher's entry are wrong. First, the primary is described as "secondary report of the ERCOT filing". By Utility Dive's attribution, the figure comes from the governor's letter, and the headline the edition prints for source 02 is not the article's headline. Second, the "true as" says "large-load requests"; the source says "interconnection queue requests".

True as (researcher's line, corrected): The requests in ERCOT's interconnection queue, about 474 GW as Utility Dive reports the governor's letter, are more than five times the grid's record peak demand of about 91 GW (22 July 2026, preliminary).

Page change: none to the sentence. For the owner (lane 2.1 / sources list): source 02's title should be the article's real headline, "ERCOT aims to complete Texas governor's data center audit by December". Also, "ERCOT told state regulators that about 474 gigawatts of large loads were asking to connect" (section 01) attributes to ERCOT, and labels as large loads, a figure that Utility Dive attributes to Abbott's letter and calls "interconnection queue requests". I could not open the letter itself because the search budget was spent. It is the better primary for whoever re-checks 2.1.

## 15.2. At the defaults, transformers bind first, then the tie-in, then firm generation from 2029, when spare capacity runs out and the new turbine slots have not yet opened. The queue never clears. Stranded compute peaks at about 34 gigawatts.
Verdict on the researcher: **amended** (the numbers are upheld, with two rounding slips; the reading of the bind sequence and its cause is wrong)

Evidence (source/waiting-for-the-tie-in.html):
- line 392: `const gen=Math.max(0,p.headroom-2*i)+(y>=2030?p.turb2:p.turb)*p.share/100;`
- line 396: `let bind=Object.keys(caps).reduce((a,b)=>caps[b]<caps[a]?b:a);` over `caps={grid,gen,xfmr:xf}` (line 394). The comparison is strict, so when two caps are equal the label goes to the earlier key, `grid` ("Tie-in").
- Defaults (lines 356-379): demand 30, growth 12, chips 32, ercot 6 + pjm 4 + other 7 = grid 17, headroom 10, turb 22, share 50, turb2 30, xfmr 16, xfmr2 8, btm 3, ramp 3, pool 60, ratio 500 (labour cap 120 GW, which never binds).

My hand run, in GW:

| Year | Asks | Tie-in cap | Firm cap | Transformer cap | Grid | On-site | Backlog | Stranded | Label shown |
|---|---|---|---|---|---|---|---|---|---|
| 2026 | 30.0 | 17 | 21 (10+11) | 16 | 16 | 3 | 11.0 | 13 | Transformers |
| 2027 | 44.6 | 17 | 19 (8+11) | 16 | 16 | 6 | 22.6 | 23 | Transformers |
| 2028 | 60.2 | 17 | 17 (6+11) | 24 | 17 | 9 | 34.2 | 29 | Tie-in (tie with firm) |
| 2029 | 76.4 | 17 | 15 (4+11) | 24 | 15 | 12 | 49.4 | 34 | Firm power |
| 2030 | 96.6 | 17 | 17 (2+15) | 24 | 17 | 15 | 64.6 | 34 | Tie-in (tie with firm) |
| 2031 | 117.5 | 17 | 15 (0+15) | 24 | 15 | 18 | 84.5 | 33 | Firm power |
| 2032 | 143.7 | 17 | 15 (0+15) | 24 | 15 | 21 | 107.7 | 29 | Firm power |

Cumulative chips delivered in 2032 are 224 GW and powered 195 GW, which matches the print's slide 10 ("224 delivered", "195 powered"). The readout picks the first peak year (line 445, strict `>`), so it reports 34 GW "in 2029". Slide 10 says "Peak gap in 2029."

Where the researcher is wrong:
1. Ties read as tie-in binds. In 2028 and 2030 the tie-in cap and the firm-generation cap are exactly equal at 17 GW (6 + 22×50/100 = 17; 2 + 30×50/100 = 17; 6 + 4 + 7 = 17). The "Tie-in" label in those years is an artefact of the tie-break in line 396. The researcher's "tie-in again (2030)" therefore does not refute "firm generation from 2029". Firm generation is the binding limit, or level with the binding limit, in every year from 2029 to 2032 (15, 17 = 17, 15, 15). The page's sequence is defensible on the model's caps. Its problem is that the model's own bind strip and table display "Tie-in" for 2030, so a reader sees the text contradicted on screen.
2. Wrong cause. The researcher writes that the 2029 bind is caused by "the turbine share, not a clean 'spare capacity runs out'". The turbine share is a constant 11 GW from 2026 through 2029 (22 × 50%). What moves firm capacity below the tie-in in 2029 is headroom falling 2 GW a year, from 6 to 4. That is the page's "spare capacity" mechanism. The page is loose only in saying "runs out": headroom is 4 GW in 2029 and reaches zero in 2031. "The new turbine slots have not yet opened" is exact: `turb2` applies from 2030 and lifts firm capacity back to 17 that year.
3. Rounding. The backlog in 2031 is 84.456, so 84.5, not 84.4. In 2032 it is 107.67, so 107.7 (the inventory's own check says 107.7), not 107.6.
4. "Stranded compute depends entirely on the 32 GW a year chip-delivery input" is too strong. Stranded compute is cumulative chips delivered minus cumulative load powered (line 403, `str:Math.max(0,cc-cp)`). It depends on the chip input and on every cap. The chip default is labelled "Assumption scaled to 2026 capex guidance of about $700B." (line 358), as the researcher says.

True as (smallest change to the page): "At the defaults, transformers bind first. From 2028 the tie-in and firm generation are level, and from 2029 firm generation is the tighter limit, as spare capacity dwindles and before the new turbine slots open in 2030 (when the two are level again). The queue never clears. Stranded compute peaks at about 34 gigawatts, in 2029."

If the owner prefers to keep the sentence, the alternative fix is in the script: break ties in the bind label so that a tie shows both limits (or shows firm generation). The text and the on-screen strip would then agree.

## 15.3. The 2028 backlog in the model, about 34 gigawatts, sits close to Morgan Stanley's reported estimate of a 32 gigawatt shortfall through 2028, which the model was not tuned to.
Verdict on the researcher: **amended** (the verdict stands; one phrase in the "true as" overreaches, and the external figure remains unverified)

Evidence:
- Benzinga (edition source 27), https://www.benzinga.com/markets/prediction-markets/26/10/62174172/nvidia-broadcom-ai-power-shortage , fetched 2026-11-01: "The server returned HTTP 403 Forbidden." The wall was not worked round. As with the researcher, the 32 GW figure, its period and its definition could not be read on any page, and with the search budget spent no other copy or Morgan Stanley primary could be sought. The researcher's description of the figure ("net gap after on-site and grid alternatives", "34%", "32 and 33 GW", ambiguous annual or cumulative) rests on search-result summaries, not on a page read. It cannot be quoted as evidence.
- Page, line 356 (demand slider): `'Load seeking power in 2026',10,60,1,30,'GW','Morgan Stanley’s reported 32 GW shortfall on 34% of demand implies about 94 GW sought over 2026 to 2028.'`
- Page, line 191: the sentence carries `<span class="mark" aria-label="verified fact">F</span>`.
- Page, line 292: "Several 2026 figures rest on a single source or on reporting that cites unnamed people, OpenAI's burn and Morgan Stanley's shortfall estimate in particular; they are reported, not established."
- Model, my run (15.2): asks summed over 2026 to 2028 are 30 + 33.6 + 37.6 = 101.2 GW; served 19 + 22 + 26 = 67 GW; backlog 34.2 GW.

Assessment: the closeness holds on the model (34.2 against 32). The researcher is right that "not tuned to" is contradicted by the page itself. The demand slider names the Morgan Stanley estimate as the source of its default, so the comparison target fed an input. The researcher's "true as" goes one step too far, though, in saying the demand input "was read off that same estimate". The note's implied figure is 32 / 0.34 = 94.1 GW over three years, and the default produces 101.2 GW, about 7 GW more. Had demand matched the note's 94 GW, the 2028 backlog would be about 27 GW rather than 34. So the default is informed by the estimate, not read off it, and the 34-against-32 closeness depends partly on that 7 GW gap. A further point the researcher did not note: the sentence carries an F (verified fact) mark, but "which the model was not tuned to" is the author's own assertion about method, and the page's own slider note contradicts it. The page's closing note does already flag the Morgan Stanley figure as "reported, not established".

True as (smallest change to the page): "The 2028 backlog in the model, about 34 gigawatts, sits close to Morgan Stanley's reported estimate of a 32 gigawatt shortfall through 2028; the model's demand default cites the same estimate, so the two are not independent."

Researcher's line, corrected: "read off that same estimate" should read "cites that same estimate as its source (though at 101 GW over 2026 to 2028 it runs above the 94 GW the note derives)".

## 15.4. Defaults are set from the published figures above. Every slider says where its number comes from, and the ones that are my assumptions say so.
Verdict on the researcher: **amended** (the verdict "overstated" stands; both of the researcher's lists contain errors)

Evidence (source/waiting-for-the-tie-in.html, lines 356-379; the slider notes are field `r[7]`, rendered at line 383 as `<span class="why">`):
- 19 sliders, each with a note: demand, growth, chips, chipcost, ercot, pjm, other, headroom, turb, share, turb2, xfmr, xfmr2, btm, ramp, pool, ratio, res, homes. Upheld.
- line 359: `['chipcost','IT equipment cost per GW',5,40,1,20,'$B','Assumption.']`
- line 368: `['turb2','Deliveries a year from 2030',5,60,1,30,'GW','GE Vernova targets 30 GW a year by 2030.']`, against line 366: `['turb','Turbine deliveries to the US a year, to 2029',...]`
- line 373: `['btm','On-site generation running, 2026',0,15,.5,3,'GW','Cleanview: 2.8 to 3.2 GW by end 2026.']`
- line 374: `['ramp','Added each year',0,10,.5,3,'GW','Cleanview: 5 to 13 GW by 2027.']`
- line 292: "Slider values marked as assumptions are mine."

Errors in the researcher's entry:
1. Labelled list incomplete. The researcher lists the sliders labelled as assumptions as chips, turbine deliveries to 2029, share, transformers, electrician ratio, residential share and homes per electrician. It omits the IT equipment cost per GW (line 359, "Assumption."). There are eight labelled sliders: seven whose notes begin "Assumption", plus the ratio, which says "assumption for the electrical share".
2. Ramp wrongly listed as underived. With 3 GW running in 2026 and 3 GW added a year, the model has 6 GW on site in 2027 (`bcap=p.btm+p.ramp*i`, line 397). That sits inside the note's "5 to 13 GW by 2027", at the low end. The on-site defaults are the one pair that is set from the published figure.
3. Demand overstated as underived. The note gives a derivation, 94 GW over 2026 to 2028, and the default gives 101 GW over the same years (see 15.3). The default is loosely set from the note, not unconnected to it.
4. One underived default missed: turb2. The note cites GE Vernova's own production target, one manufacturer's output for all markets. The slider uses 30 GW as total deliveries a year from 2030, which follows a slider explicitly scoped "to the US". One maker's worldwide target is used as all US deliveries, unlabelled.

The rest of the researcher's underived, unlabelled list is upheld on the notes: growth 12% (NERC's 224 GW over ten years does not yield it), ERCOT 6, PJM 4, rest of US 7, headroom 10, transformers added from 2028 8, electrician pool 60,000 (the note gives only the national 821,000).

True as (smallest change to the page): "Every slider says where its number comes from. Some defaults are set from the published figures above; the rest, and those marked as assumptions, are my choices."

Researcher's "true as", corrected list: underived and unlabelled defaults are growth, ERCOT, PJM, rest of US, spare firm headroom, transformers added from 2028, deliveries from 2030 and the electrician pool. Demand is loosely derived (101 GW against the note's 94). The on-site pair matches Cleanview. Labelled assumptions: chips, IT cost per GW, turbine deliveries to 2029, share serving new load, transformer deliveries, residential share, homes per electrician, and, in part, the electrician ratio.

## 15.5. At that ratio, even the 66 gigawatts ERCOT just cleared would occupy a small share of American electricians at any one time.
Verdict on the researcher: **amended** (the researcher's "true as" turns "workers" into "electricians" and so overstates the share; the "drops the all-at-once condition" note is wrong)

Evidence:
- USC Hamm Institute, https://hamminstitute.org/site-files/documents/data_center_workforce.pdf , fetched 2026-11-01: "The server returned HTTP 403 Forbidden." Not worked round. The ratio remains unverified at source, as the researcher found.
- BLS, https://www.bls.gov/ooh/Construction-and-Extraction/Electricians.htm , fetched 2026-11-01: "Electricians held about 821,000 jobs in 2025." This is a count of jobs, for 2025.
- Page, line 180: "A hyperscale site needs roughly one peak worker per megawatt." The ratio counts workers, all trades, not electricians.
- Page, line 377 (ratio slider): `['ratio','Electrician-years per GW built',200,1200,50,500,'','USC: about one peak worker per MW at hyperscale; assumption for the electrical share.']`. The default, 500 per GW (0.5 per MW), encodes the author's own assumption that about half of peak workers are electricians.
- Page, lines 127 and 361: the 66 GW is "conditionally cleared" ("Batch Zero: 66 GW conditional.").

Assessment: the researcher's "true as" says 66 GW "would need about 66,000 electricians at peak, roughly 8 percent". The page's ratio counts peak workers of all trades, so 66,000 is a ceiling for electricians: 8.0% of 821,000 holds only if every peak worker were an electrician. On the page's own electrical-share assumption (0.5 per MW), the figure is about 33,000, or 4.0%. Both are fractions under a tenth, which makes "small share" more defensible than the researcher allows. The researcher's note that the sentence "drops the 'all at once' condition" is wrong: "at any one time" is that condition. Upheld from the researcher: the ratio is unverified at source (403), and "just cleared" omits that the clearance is conditional, which the page itself says two sections earlier. Also, BLS counts jobs, not electricians (lane 10 owns the 821,000).

True as (smallest change to the page): "At that ratio, even if all 66 gigawatts ERCOT conditionally cleared were built at once, their peak crews would come to about 66,000 workers of every trade, under a tenth of America's 821,000 electrician jobs even if every one of them were an electrician."

Researcher's "true as", corrected: "At one peak worker per megawatt, the 66 GW that ERCOT conditionally cleared would need about 66,000 workers of all trades at peak if built at once. That is at most 8 percent of the 821,000 electrician jobs BLS counts, and about 4 percent on the page's own assumption that half are electricians."

## 15.6. Matched pairs, latest full-year figures, one source on every row.
Verdict on the researcher: **amended** (the verdict "wrong" stands; the row count is wrong, one reading of "one source" is true, and the researcher missed two non-pairs and a leftover editorial note)

Evidence (source/waiting-for-the-tie-in.html, table `G`, lines 461-500; each row is `[label, China, US, unit, barCN, barUS, note, link]`, rendered at line 507 with a single `<a href="${r[7]}">Source</a>`):
- Row count: Grid 10 (lines 463-472), Factories 9 (474-482), Chips and money 7 (484-490), Minerals and people 9 (492-500). That is 35 rows, not the researcher's "60-odd". The researcher read "about 20"; all 35 are short enough to check, and I checked them all.
- One link per row: every row carries exactly one `Source` link (field 7). Read as "one linked source on every row", the phrase is true.
- Rows whose notes name two or more sources: 463 "NEA year-end totals, net; EIA."; 464 "NEA; FERC."; 466 "CNESA; EIA utility-scale."; 469 "China Briefing, 2024; EIA, 2025."; 470 "Ulanqab, Inner Mongolia (Caixin) against Virginia (EIA, OIES)."; 471 "China 2025, government figures via Carbon Brief; US 2023, LBNL."; 477 "(People’s Daily) against ... (Goldman Sachs)"; 481 "MIIT, 2025; CSIS."; 492 "IEA; USGS"; 493 "IEA. MP Materials made 2,599 t"; 495 "China MoE, 2021; NCES, 2020–21."; 498 "2025 estimates, secondary. IRENA". That is 12 of 35 rows.
- Not latest full-year: 495 (2021 and 2020–21); 478 "IEA PVPS, 2024."; 469 China 2024; 471 US 2023; 496 "CSET projection for 2025" (a projection). Many rows are not annual figures at all but stocks, shares or snapshots: 464 installed capacity; 467 reactors under construction; 475 robot density; 486 leading node; 488 Arena score; 499 foreign-born share; 500 an FY change.
- Not matched pairs: 499 `['Construction workforce foreign-born','n/a','26%',...]` and 500 `['H-1B registrations, FY2027 change','n/a','−38.5%',...]` have no Chinese figure. The researcher did not note these.
- Links not in the sources list (line 291), which I checked rather than taking from the inventory: row 464 links `https://pv-magazine-usa.com/2026/04/01/u-s-adds-26-5-gw-of-solar-in-2025-as-renewables-dominate-new-capacity/`, and row 482 links `https://www.ibtimes.co.uk/chinas-manufacturing-dominance-global-shift-1810921`. Neither appears among sources 01-90. The other 33 links do. Upheld.
- For the owner: row 482's published note reads "World Bank via secondary compilation. Verify against UNIDO before citing." It is an editorial instruction left in a live row.

Assessment: the sentence is false as a whole. "Latest full-year figures" fails on at least five rows and does not describe the stock and share rows. "Matched pairs" fails on two rows. "One source on every row" is true of links and false of the notes on 12 rows. The researcher's verdict holds, but the row count ("60-odd"), the partial check and the missed n/a rows need correcting, and the true-as should keep the one reading in which "one source" is literally true.

True as (smallest change to the page): "Pairs, mostly matched, each row with one linked source; the row notes say where a row draws on more than one source, mixes years, or has no Chinese figure."

## 15.7. Then try EUV lithography, the one piece with nothing upstream of it and a decade to replace.
Verdict on the researcher: **amended** (the core finding is upheld; the open question the researcher left is settled, and "wrong" depends on one reading of the sentence)

Evidence (source/waiting-for-the-tie-in.html):
- Chain array, lines 306-326: 21 pieces, which matches "Twenty-one pieces" (line 165). Ten have `needs:[]`: euv (yrs 10), hbm (3), rules (1), castings (5), gas (3), goes (3), copper (7), housing (0), gallium (3), magnets (3). This matches the researcher's quotes, read here at lines 308-325 rather than in the non-existent `work/data.ts`.
- `yrs` for every piece: chips 0, fab 4, euv 10, hbm 3, shell 1.5, tiein 5, studies 2, rules 1, firm 5, turbines 4.5, castings 5, gas 3, xfmr 2.7, goes 3, copper 7, lines 8, electricians 4, housing 0, gallium 3, magnets 3, credit 0.
- line 332: `const path=(id,seen=new Set())=>{...return n.yrs+(s.length?Math.max(...s):0)};`, shown in the panel as "Critical path from a standing start" (line 342).

Assessment: the researcher left open whether any other piece has `yrs` of 10 or more. None does. EUV's 10 is the highest single replacement time in the chain; the next is high-voltage lines at 8. So EUV is the only piece that has both nothing upstream and a decade to replace. On a conjunctive reading of "the one piece with nothing upstream of it and a decade to replace", the sentence is literally true. On the natural reading, that EUV is the only piece with nothing upstream, it is false: nine others have empty `needs`. "Wrong" holds for the natural reading, but "misleading" is the fairer verdict given the conjunctive one. A caution for any rewording: EUV does not have the longest critical path the panel shows. By line 332, the tie-in is 5 + max(studies 3, firm 14.7, lines 17.7) = 22.7 years, and high-voltage lines 17.7. So "the longest to replace" would be false on the page's own panel. The researcher's caveat stands: "nothing upstream" describes the page's model, not ASML's supply chain.

True as (smallest change to the page): "Then try EUV lithography, one of ten pieces with nothing upstream of it, and the only one of those that takes a decade to replace."

Researcher's "true as", corrected: keep "one of ten pieces with nothing upstream of it", and replace "the one with a ten-year replacement time" with "the only piece in the chain whose own replacement time is ten years (next: high-voltage lines, 8)".

## Tally
Upheld 0 · Overturned 0 · Amended 7. In every case the researcher's direction was right or largely right, but the entry needed correcting: wrong attribution (15.1), misread ties and cause (15.2), overreach (15.3, 15.5), list errors (15.4), wrong row count and missed non-pairs (15.6), and an open question now settled (15.7). Citations to `work/sim.mjs` and `work/data.ts` throughout should point to source/waiting-for-the-tie-in.html. No characterisation of Anthropic appears in this lane.
