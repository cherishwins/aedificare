# Skeptic 23: Critical minerals (edition "Waiting for the Tie-In", 15 Oct 2026)

Checked: research/waiting-for-the-tie-in/lane-23.md. Read: 2026-11-01.

Access notes. The IEA walls stand for me too: https://www.iea.org/reports/global-critical-minerals-outlook-2026 and .../executive-summary return HTTP 403, and the blob PDF fails the 10 MB fetch limit (I retried each once and took no other route). My web-search budget for this run ran out on the first call (a turn limit shared with other agents). So I hunted for overturning evidence by fetching primaries directly: the USGS MCS 2026 gallium, germanium, graphite and rare-earth chapters; USGS Fact Sheet 2014-3078; the MP Materials 10-K; the CSIS page; the Deng and Kendall manuscript; and the edition's own source, src/pages/waiting-for-the-tie-in.astro. Under each claim I list searches the owner may want to rerun. No characterisation of Anthropic appears in this lane.

Column key, from the edition's own source (src/pages/waiting-for-the-tie-in.astro, lines 255 to 258, "Minerals and people" rows): each row is [label, China value, United States value, ...]. So in "91% | ~2%" and "94% | ~0%" the second figure is the US share, not "elsewhere".

Tally: upheld 1 (23.3); overturned 1 (23.5); amended 5 (23.1, 23.2, 23.4, 23.6, 23.7).

## 23.1. China refines 91 percent of the world's rare earths, 99 percent of its gallium and 94 percent of its germanium. (IEA)
Verdict: amended. The "could not settle" verdict stands, but the notes carry a unit error, and the germanium source they call unchecked can be checked; I did.
Evidence:
- USGS MCS 2026 Gallium, p. 1 (Events, Trends, and Issues): "China accounted for 99% of worldwide primary low-purity gallium production." https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-gallium.pdf . Confirmed verbatim.
- Same, header: "(Data in kilograms, gallium content, unless otherwise specified)". Table p. 2, "World Low-Purity Production": China 839,000 (2024) and 900,000 (2025e); world total (rounded) 848,000 (2024) and 900,000 (2025e). These figures are kilograms. The researcher's note "839,000 of 848,000 t" is wrong by a factor of 1,000.
- USGS MCS 2026 Germanium, p. 2: "Global germanium refinery production and recycling data were limited, and available estimates were difficult to verify. China continued to be the leading global producer and exporter of germanium metal in 2025." Also: "Because most producers do not publicly report germanium production, global production data were limited." https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-germanium.pdf . USGS gives no germanium share, so it neither confirms nor contradicts 94 percent.
- USGS MCS 2026 Rare Earths, pp. 152 to 153: confirms the researcher's reading. The mine table gives China 270,000 t REO of a 390,000 t world total (2025e) and no refining or separation share. https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-rare-earths.pdf
What the lane file should say instead:
- In Notes, replace the gallium figures with: "The USGS table gives 839,000 of 848,000 kg for 2024 (about 99 percent) and 900,000 of 900,000 kg (rounded) for 2025e."
- Replace "Germanium was not checked in USGS or any other source" with: "USGS MCS 2026 Germanium gives no world share: 'Global germanium refinery production and recycling data were limited, and available estimates were difficult to verify.' It says only that China 'continued to be the leading global producer and exporter of germanium metal in 2025.'"
- The gallium "True as" stands and is the smallest change. The 91 and 94 percent IEA refining figures remain unsettled because the IEA report is still unopened.
Rerun for owner: a search for the executive-summary text of the IEA Outlook 2026 on refining shares (rare earths, gallium, germanium).

## 23.2. Graphite refining, world share | 94% | ~0% | IEA. Germanium 94%, lithium 71%, tungsten 76%. (IEA)
Verdict: amended. The IEA figures remain unsettled, but the US "~0%" cell has primary evidence the researcher did not open, and the "True as" should say so.
Evidence:
- USGS MCS 2026 Graphite (Natural), p. 2: "SPG was produced in the United States by two companies in Illinois and Louisiana." SPG is spherical purified graphite, a refined battery-grade product. https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-graphite.pdf . So US graphite refining is not zero. "~0%" (approximately zero) may still hold as a share, but no source checked gives a number.
- Same, p. 1: "In 2025, China was the world's leading natural graphite supplier, producing an estimated 82% of total world production." This is a share of natural-graphite mine production, not refining, so it does not test 94.
- Same, p. 1: "In 2025, no natural graphite was produced domestically in the United States." This covers mine production only.
- Germanium: see 23.1. USGS gives no world share.
What the lane file should say instead:
- "True as: Not settled for the IEA figures. USGS shows that US graphite refining exists ('SPG was produced in the United States by two companies in Illinois and Louisiana'), so the US cell can at most read '~0%', never '0%'. No checked source gives the US share. If the IEA table cannot be opened, cut the graphite, lithium, tungsten and germanium rows, or attribute only what the IEA text states."
- Strike the researcher's own "web search ... put China at roughly 90 percent of graphite refining" as evidence. It is secondary and unnamed.
Rerun for owner: the graphite, lithium and tungsten refining shares in the IEA Outlook 2026.

## 23.3. The United States has produced no primary gallium since 1987. (USGS, a negative)
Verdict: upheld
Evidence:
- USGS MCS 2026 Gallium, p. 1: "No domestic primary (low-purity, unrefined) gallium has been recovered since 1987." Confirmed verbatim. https://pubs.usgs.gov/periodicals/mcs2026/mcs2026-gallium.pdf
- Same, p. 2, independent confirmation: DOE funding "with the goal of restarting domestic primary gallium recovery for the first time in almost 40 years." In the salient statistics, "Production, primary" is "—" for 2021 to 2025, and the footnote defines "—" as "Zero". The world table shows the United States as "—" for 2024, for 2025e and for 2025 capacity.
- Negative hunt: the USGS gallium page lists MCS 2026 (Feb 2026) as the latest publication, and no later USGS release reports US primary output. https://www.usgs.gov/centers/national-minerals-information-center/gallium-statistics-and-information . The 2025 projects USGS names are development, not production: DOE R&D, and a Department of War award for a Louisiana demonstration facility to "recover gallium and scandium from industrial waste". The edition's own chronology puts Korea Zinc's Tennessee gallium at 2029.
Scope: the USGS statement runs to its data year (2025). The researcher's "True as" ("USGS says no domestic primary (low-purity, unrefined) gallium has been recovered since 1987.") is correct and the smallest change.
Rerun for owner: a search for any US primary gallium recovery announced from January to October 2026 (not possible in this run because the search budget was used up).

## 23.4. Rare-earth refining, world share | 91% | ~2% | IEA. MP Materials made 2,599 t of NdPr oxide in 2025. (IEA; MP Materials)
Verdict: amended. The MP half is upheld; the researcher misread the "~2%" cell.
Evidence:
- MP Materials 10-K FY2025, Item 7, Executive Overview: "producing a record 2,599 metric tons ("MTs") of NdPr oxide, an increase of 101% when compared to prior year." Confirmed. https://www.sec.gov/Archives/edgar/data/1801368/000180136826000008/mp-20251231.htm
- Same, Materials segment KPI table: NdPr Production Volume (MTs) is 2,599 for 2025 and 1,294 for 2024. Confirmed. The filing defines the KPI as "the volume of finished and packaged NdPr oxide produced at Mountain Pass for a given period." The fiscal year ends 31 Dec 2025, so "in 2025" means the calendar year.
- The edition's source, src/pages/waiting-for-the-tie-in.astro line 257, reads ['Rare-earth refining, world share','91%','~2%','',91,2,...]. Its table's columns are China, then United States; compare line 256, gallium '99%','0%', glossed "USGS: no US primary production". So "~2%" is a US share. The researcher's file calls it "about 2 percent elsewhere" and "The '~2%' rest-of-world figure". That is wrong, and it contradicts the same file's 23.2 note on the "US '~0%' cell".
- USGS MCS 2026 Rare Earths, p. 152: US production of "Compounds and metals" was an estimated 8,900 t REO in 2025 (4,300 t in 2024). USGS gives no world refining total, so no US share can be computed. Nothing checked confirms or refutes "~2%".
What the lane file should say instead:
- "True as: 'MP Materials reported producing a record 2,599 metric tons of NdPr oxide in 2025 (10-K).' The IEA refining shares (91 percent China, about 2 percent United States) could not be checked."
- In Notes, replace "The '~2%' rest-of-world figure has no source checked" with "The '~2%' US figure has no source checked. USGS gives US output of rare-earth compounds and metals (8,900 t REO, 2025e) but no world refining total."

## 23.5. Separating a tonne of rare earths takes up to 60 GJ. | Unsupported | No source for 60. Peer-reviewed cradle-to-gate figures run 270 to 490 GJ a tonne depending on boundary. The real number is higher. (the record, a negative and a range)
Verdict: overturned. The researcher's "could not settle" is wrong: the energy figures the researcher says were not reached appear in the abstract on manuscript p. 2 and in Table 4 (PDF p. 19). They show that the edition's rebuttal misstates the cited paper in two ways:
- The paper's high value is 443, not 490.
- The paper's boundary excludes separation.
Evidence (Deng and Kendall, accepted manuscript, https://escholarship.org/content/qt5x28j31d/qt5x28j31d.pdf ):
- Abstract, manuscript p. 2: "Results show 1 kg of mixed HREOs emit 258-408 kg CO2e, and consume 270-443 MJ primary energy."
- Table 4 ("Impact assessment results of producing 1 kg of heavy REO"), Primary energy (MJ): Low 269.67, High 442.60. The same table lists other studies' primary energy per kg REO: Vahidi et al. 255–388 (ion-adsorption clays, 90–92% purity), Zaimes et al. 578.79 (bastnaesite/monazite), Sprecher et al. 174–232 (bastnaesite/monazite, 99% purity). No figure of 490 appears.
- Methods, manuscript p. 4: "The system boundary for the LCA study includes mining using in situ leaching methods, extraction, and calcination. These processes are all conducted on site, and the final product is mixed REOs. Further processes such as solvent extraction and individual metal separation are not included, as they often occur off-site."
- Conclusion, manuscript p. 11: "While the scope of this study concludes at the production of mixed HREO, which is a limitation, it provides a foundation for future studies that seek to develop LCIs of refined HREEs."
- CSIS (Baskaran and Schwartz, 28 Jul 2025), the other cited source: "Separating a single ton of rare earths can require 9–13 times initial extraction." It gives no absolute unit and no GJ figure, confirming the researcher's reading. https://www.csis.org/analysis/developing-rare-earth-processing-hubs-analytical-approach
Scope: the paper's figures are per kg of 90%-pure mixed heavy REO from in-situ leaching of ion-adsorption clays in Ganzhou, Jiangxi, with field data from October 2016. 270 to 443 MJ/kg equals 270 to 443 GJ per tonne. The figure is cradle to mixed oxide, so it measures mining plus extraction plus calcination, not separation. Comparing it with a separation-only "60 GJ" is a boundary mismatch. "The real number is higher" is therefore not shown by this source, and the same table carries a 99%-purity study as low as 174 MJ/kg. Note also an inconsistency inside the manuscript that the owner should not repeat: the abstract's "258-408 kg CO2e" does not match Table 4's global warming values of 18.80 to 33.11 kg CO2 eq.
"No source for 60" is a negative. Neither cited source gives 60, but I could not run a search for it.
The edition's line should say instead: "Separating a tonne of rare earths takes up to 60 GJ. | Unsupported | No source found for 60. The peer-reviewed study cited (Deng and Kendall, 2019) puts primary energy at 270 to 443 MJ per kg of 90%-pure mixed heavy rare-earth oxide from Chinese ion-adsorption clays, mining through calcination. It excludes solvent extraction and separation, so it does not measure separation energy." Drop "270 to 490" and "The real number is higher."
The lane file's verdict should read: "settled: the edition's rebuttal does not match its source (range 270 to 443, not 490; boundary excludes separation)."
Rerun for owner: a search for any published per-tonne energy figure for rare-earth solvent-extraction separation alone (the source of "60 GJ").

## 23.6. A blink in power ruins a separation plant for months. | Unsupported | No source. Solvent-extraction circuits tolerate stoppages; restarting is a stability problem, not a solidified one. (the record, a negative)
Verdict: amended. The researcher's CSIS reading is upheld. But the MP Materials 10-K, which the researcher opened for 23.4, speaks directly to power outages at a working rare-earth separation plant, and the researcher missed it.
Evidence:
- CSIS page: I confirm it has no sentence on power outages, shutdown or restart. Its one related line is that a processing hub "requires reliable access to low-cost energy". https://www.csis.org/analysis/developing-rare-earth-processing-hubs-analytical-approach
- MP Materials 10-K FY2025, Item 1A, risk factor heading, verbatim in part: "A power outage or shortage at Mountain Pass or Independence could temporarily delay mining, processing," (the heading goes on to cite increased costs and adverse effects on the business). https://www.sec.gov/Archives/edgar/data/1801368/000180136826000008/mp-20251231.htm
- Same risk factor: "Instability in electrical supply could cause sporadic outages or brownouts at Mountain Pass and the Independence Facility." "Any such outages or brownouts could have a negative impact on our production." "We could incur higher operating costs, remain subject to the effects of occasional grid power outages and brownouts" (the sentence continues: "and could experience temporary interruptions of processing operations"). The filing also says the CHP plant "eliminates reliance on the regional electric power grid" and is "necessary to support the entire energy demand of our upstream and midstream operations".
- Same filing, Cautionary Note on forward-looking statements: lower production volumes "due to power outages and interruptions".
- The filing does not mention solvent extraction or describe what happens to the circuit on restart.
Reading: the only operator source in the lane describes the effect of outages on its separation business as "temporary", not ruinous for months. This supports the edition's "Unsupported" verdict on the claim. It does not support the edition's own technical sentence ("Solvent-extraction circuits tolerate stoppages; restarting is a stability problem, not a solidified one"); I found no source for that.
The edition's line should say instead: "A blink in power ruins a separation plant for months. | Unsupported | No source found. MP Materials, which separates rare earths at Mountain Pass, tells investors that a power outage 'could temporarily delay mining, processing' and bring 'temporary interruptions of processing operations' (10-K, FY2025)." Drop the solvent-extraction sentence, or mark it as the author's inference until a process-engineering source is found.
Rerun for owner: a search for a plant-operations or hydrometallurgy source on how solvent-extraction circuits behave on restart after a power loss.

## 23.7. They gate permanent magnets, gallium-nitride power electronics and radar, not the turbines and transformers that hold up the data centres. (author's inference; facts inside)
Verdict: amended. The facts inside hold. The negative contrast has primary evidence against its broad reading, and the related chain line "Not data centres." is contradicted by USGS.
Evidence:
- USGS MCS 2026 Rare Earths, p. 152: "the estimated leading global use was magnets." Confirmed.
- USGS MCS 2026 Gallium, p. 2 (Substitutes): "In many defense-related applications, GaAs- and GaN-based ICs are used because of their unique properties, and no effective substitutes exist for GaAs and GaN in these applications." Confirmed. Same, p. 1: "Uses of ICs included defense applications, high-performance computers, and telecommunications equipment." The word "radar" does not appear; the researcher's note on that stands.
- USGS Fact Sheet 2014-3078 (Van Gosen et al., Nov 2014), p. 2: "Rare-earth magnets are used in computer hard disks and CD–ROM and DVD disk drives." Photo caption, same page: "Large wind turbines use generators that contain strong permanent magnets composed of neodymium-iron-boron." https://pubs.usgs.gov/fs/2014/3078/pdf/fs2014-3078.pdf
- Deng and Kendall, manuscript p. 3: "Nd-Fe-B rare earth magnets that are used in electric motors and generators". https://escholarship.org/content/qt5x28j31d/qt5x28j31d.pdf
- The edition's own chain entry for magnets reads "Motors, wind turbines and radar. Not data centres." (per CLAIMS.md 23.7). So the edition itself concedes that rare earths gate wind turbines.
Reading: "not the turbines" is true only if "turbines" means gas turbines, which is the edition's context (its p. 05, large gas turbines). As written, it collides with USGS on wind-turbine generators. I opened no source on rare-earth content in gas turbines or transformers, so the narrowed contrast is still the author's inference. The chain line "Not data centres." meets USGS's statement that rare-earth magnets are used in computer hard disks. Applying that to data-centre storage is an inference, but it points against the chain line, not for it.
What the page should say instead:
- Main sentence (keep the I mark): "They gate permanent magnets, gallium-nitride electronics and defence chips, not the gas turbines and transformers that hold up the data centres."
- Chain, magnets: cut "Not data centres." or replace it with "Hard drives use them (USGS); the power plant mostly does not."
- Replace "radar" with "defence electronics" unless a source naming radar is added.
The lane file's verdict should read: "facts inside hold; the contrast holds only as 'gas turbines', and the chain's 'Not data centres' is contradicted by USGS on hard disks."
Rerun for owner: a search for rare-earth or gallium content in heavy-duty gas turbines, generators and power transformers.
