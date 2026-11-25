# Skeptic 20: Side by side, grid (edition "Waiting for the Tie-In", 15 Oct 2026, section 08)

Checked against: research/waiting-for-the-tie-in/lane-20.md
Read date for all checks: 2026-11-01

Edition text: I opened all 16 pages of the user's PDF. Page 13 ("SIDE BY SIDE.", footer "NEA · EIA · WNA · CNESA · EPOCH AI") prints three of this lane's rows: "Capacity added, 2025, GW | 540 | 53", "Reactors under construction | 38 | 0" and "Grid storage added, 2025, GW | 66 | 16". The PDF has no source notes on these rows. It prints "540" with no "~", and it rounds 15.8 to "16". Rows 20.2, 20.3 and 20.6 are not in the PDF. I checked all six rows' wording and links against the site source, src/pages/waiting-for-the-tie-in.astro (rows at lines 227-231 and 262; source list at lines 78-155, where cite n is list item n). Cite 44 = pv magazine, China adds 315 GW (line 122). Cite 45 = EIA Today in Energy id=67205 (line 123). Cite 46 = Ember (line 124). Cite 48 = Energy Storage News (line 126). Cite 49 = WNA (line 127). Cite 76 = IRENA executive summary (line 154).

Tooling limit: the shared WebSearch budget for this run was used up at my first search ("this turn's web search budget is used up (limit: 200 WebSearch calls per turn, shared by every agent in it)"). Every check below rests on pages I opened directly with WebFetch, plus one PDF that WebFetch saved locally. Where a negative needed a targeted search I could not run, I say so, and that negative stays open, not settled.

No characterisation of Anthropic appears in this lane's rows or sources, so there is nothing to flag for the owner on that count.

Counts: upheld 1 (20.3), overturned 1 (20.6), amended 4 (20.1, 20.2, 20.4, 20.5).

## 20.1. Generation capacity added, 2025 | ~540 | 53 | GW | NEA year-end totals, net; EIA. China: 315 GW solar, 119 wind, 78 to 95 coal. (cites 44, 45)
Skeptic verdict: **amended** (the "overstated" verdict stands; three notes are wrong or incomplete, and one scope gap is missing)

Sources reopened:
- Cite 44, pv magazine (Vincent Shaw), "China adds 315 GW of solar in 2025", 28 Jan 2026: https://www.pv-magazine.com/2026/01/28/china-adds-315-gw-of-solar-in-2025/
- Cite 45, EIA, Today in Energy, 20 Feb 2026: https://www.eia.gov/todayinenergy/detail.php?id=67205
- Xinhua via gov.cn, 12 Feb 2026: https://english.www.gov.cn/archive/statistics/202602/12/content_WS698d93cbc6d00ca5f9a091bb.html
- Global Energy Monitor (with CREA and others), "Boom and Bust Coal 2026", May 2026: https://globalenergymonitor.org/report/boom-and-bust-coal-2026/
- NEA home page, https://www.nea.gov.cn/ : "HTTP 503 Service Unavailable". I did not try another route.

Verbatim, confirmed:
- Cite 44: "the country added 315.07 GW (AC) of new solar capacity last year", "alongside 119.33 GW of wind", and "China's cumulative installed power capacity had reached 3.89 TW, an increase of 16.1% year on year." It attributes the figures to the NEA's 2025 power sector statistics, released 28 Jan.
- EIA: "In 2025, 53 GW of new capacity was added to the grid, the largest capacity installation in a single year since 2002." Data note: "U.S. Energy Information Administration, Preliminary Monthly Electric Generator Inventory, December 2025."
- Xinhua: "China's newly installed solar and wind power capacity exceeded 430 million kilowatts in 2025". This is on the page as the researcher quoted it.
- GEM: the section "China drives global commissioning to near-record levels" opens by saying that "Global coal plant commissioning in 2025 was heavily concentrated in China". It then says China's new coal additions reached a decade high of 78.1 GW. (WebFetch would not return that full sentence verbatim, so "78.1 GW" and "decade high" are as it reported them.) The same page gives global commissioning of 97.4 GW and India 10 GW.

Findings:
1. **Note 2 is wrong: cite 44 opens.** The researcher wrote "The cited pv-magazine article (cite 44) was not fetched directly." I fetched it. It confirms 315.07 GW (AC) of solar and 119.33 GW of wind, attributed to NEA.
2. **Note 1 can be tightened.** The ~540 does not need two separate secondary reports. Cite 44 alone gives 3.89 TW at end-2025, up 16.1%. That implies an end-2024 base of 3.89 / 1.161 = 3.35 TW and a net rise of about 540 GW (539.5 at face value; about 534 to 545 given 3.89's rounding). It is still arithmetic, not an NEA-stated figure, and the NEA primary is still unopened (503).
3. **Note 4 is part-settled.** "78 GW per CREA/GEM" is now confirmed on GEM's own report page: 78.1 GW, in a report GEM leads with CREA as a co-author. "95 GW per Carbon Brief" is still unverified. I could not search for the Carbon Brief page. I also could not test whether the 95 GW is an NEA thermal-additions figure, which would make part of the "78 to 95" an NEA number. That stays open.
4. **Missing scope gap: net against gross.** The row says "net" for China. The China figure is a change in year-end totals, so it is net of retirements. The EIA 53 GW is "new capacity ... added to the grid", which is additions. The EIA article mentions no retirements and does not call its figure net. So the row sets a net China figure beside a gross US figure. This is on top of the utility-scale against all-sources gap the researcher found.
5. **The PDF drops the tilde.** Page 13 prints "540" with no "~" and no note. In print, the derived figure reads as a stated one. The owner should restore the "~" or add "net, derived".
6. Note 5 is confirmed. pv magazine USA (Ryan Kennedy, 1 Apr 2026) gives "the 36,551 MW in total new builds for the year", from FERC data (see 20.2). The quotes and their context check out otherwise.

The page should say instead: "Generation capacity added, 2025 | ~540 | 53 | GW | China: net change in NEA year-end totals (3.89 TW, +16.1%). US: EIA, utility-scale additions, gross. Not like for like. China: 315 GW solar, 119 wind (NEA); coal 78 GW (Global Energy Monitor/CREA)." Drop "to 95" unless the Carbon Brief figure is sourced. In the PDF, print "~540".
True as (amended): "China's installed generating capacity rose by about 540 GW, net, in 2025, to 3.89 TW (+16.1%; my arithmetic on NEA data as reported by pv magazine). China added 315.07 GW of solar and 119.33 GW of wind (NEA, as reported). The US added 53 GW of new utility-scale capacity to the grid (EIA, additions, not net of retirements). China's coal additions were 78.1 GW (Global Energy Monitor with CREA); a 95 GW figure attributed to Carbon Brief is unverified."

## 20.2. Installed capacity, end 2025 | 3,890 | 1,353 | GW | NEA; FERC. (cites 45; row links pv-magazine-usa.com, not in the list)
Skeptic verdict: **amended** (the numbers hold; the sourcing notes are wrong in two places, and the cite is wrong)

Sources reopened:
- The row's own link, pv magazine USA (Ryan Kennedy), "U.S. adds 26.5 GW of solar in 2025 as renewables dominate new capacity", 1 Apr 2026: https://pv-magazine-usa.com/2026/04/01/u-s-adds-26-5-gw-of-solar-in-2025-as-renewables-dominate-new-capacity/
- The copy the researcher opened, pv magazine, 2 Apr 2026 ("From pv magazine USA"): https://www.pv-magazine.com/2026/04/02/us-adds-26-6-gw-of-solar-in-2025-as-renewables-dominate/
- The FERC primary that pv magazine USA links: https://cms.ferc.gov/media/energy-infrastructure-update-december-2025 . Result: "HTTP 403 Forbidden". This is the same wall the researcher hit, and I did not work round it.
- Cite 44 (as in 20.1): https://www.pv-magazine.com/2026/01/28/china-adds-315-gw-of-solar-in-2025/

Verbatim, confirmed:
- pv magazine USA, and the same text in the pv magazine copy: "As of year-end 2025, the U.S. total available installed generating capacity stands at 1,353.04 GW." (The global copy spells it "US".) Also: "the 36,551 MW in total new builds for the year."
- Cite 44: "China's cumulative installed power capacity had reached 3.89 TW, an increase of 16.1% year on year."

Findings:
1. **The row's own link opens and carries the figure.** The researcher wrote that the row's link "is a different article from the one I opened". It is the original; the one the researcher opened is pv magazine's syndicated copy of it. Both give 1,353.04 GW. The row link is sound, but it is not in the source list.
2. **The cite is wrong.** The row cites 45, which is the EIA Today in Energy article. That article has no installed-capacity total and no FERC figure. The China figure is in cite 44 (pv magazine on NEA, 3.89 TW). The US figure is in the unlisted pv magazine USA article. The row should cite 44 plus a new list entry for pv magazine USA on FERC (or FERC itself).
3. **The China sourcing note is outdated.** The researcher relied on "a Chinese-language report" and "an English secondary report". Cite 44, an English report already in the source list, gives 3.89 TW, +16.1%, attributed to the NEA's 28 Jan statistics. The NEA primary is still unopened (nea.gov.cn returned 503, see 20.1).
4. **The FERC scope note is unverified.** "excludes small-scale solar (per Electrek's note on FERC data, as reported in search summaries)" rests on a page with no recorded URL. pv magazine USA does not say whether distributed solar is in or out; it describes only utility-scale figures. FERC's own footnotes would settle this, but they sit behind the 403. Keep the scope warning, and label the exclusion "unverified" until FERC opens.
5. The label "total available" is FERC's wording as pv magazine reports it. The row's "Installed capacity" drops the word "available". FERC's definition of "available" sits behind the same 403, so I cannot say whether it differs from nameplate installed capacity. Flag it rather than change the number.

The page should say instead: "Installed capacity, end 2025 | 3,890 | 1,353 | GW | NEA (via pv magazine); FERC 'total available' (via pv magazine USA). China all sources; US utility-scale. Not like for like." Cite 44 for China, and add pv magazine USA, 1 Apr 2026, to the source list for the US.
True as (amended): "China's total installed generating capacity was about 3,890 GW at end-2025, up 16.1% (NEA data, as reported by pv magazine). The US had 1,353.04 GW of 'total available installed generating capacity' at end-2025 (FERC data, as reported by pv magazine USA). Whether FERC's total excludes small-scale solar is unverified."

## 20.3. Electricity demand growth, 2025 | +503 | +131 | TWh | Ember. China +5%, US +3%. (cite 46)
Skeptic verdict: **upheld**

Source reopened: Ember, "Global Electricity Review 2026", major countries and regions: https://ember-energy.org/latest-insights/global-electricity-review-2026/major-countries-and-regions/ (cite 46 links the same page with "#china"). The page metadata gives datePublished 21 April 2026 and dateModified 22 June 2026. No date shows in the visible text.

Verbatim, confirmed:
- "China’s electricity demand increased by 5% in 2025 (+503 TWh)."
- "Electricity demand in the US grew by 3% (+131 TWh) in 2025, similar to growth in 2024 (+132 TWh, +3.1%)."

Findings:
1. Both quotes are on the page word for word, and the context does not change them. Ember reports generation separately (for example, clean generation +561 TWh), so the row's "demand" is Ember's own term.
2. The researcher's negative stands. The fetched page gives no global demand growth figure; the only global number on it is carbon intensity, down 2.7%. The +849 TWh world figure is still unconfirmed, and the row does not use it.
3. Optional: the source list entry has no date. Ember published the page on 21 Apr 2026 (per page metadata), and the list could say "Apr 2026".

True-as stands: "In 2025, Ember puts China's electricity demand up 5% (+503 TWh) and US demand up 3% (+131 TWh)."

## 20.4. Grid storage added, 2025 | 66.4 | 15.8 | GW | CNESA; EIA utility-scale. (cite 48)
Skeptic verdict: **amended** (the "overstated" verdict stands; the scope point now has a quote, the cited source was never opened, and the PDF compounds the US error)

Sources reopened:
- Cite 48, the row's own link, Energy Storage News, "At nearly 200GWh, China's new energy storage deployment rate hit record high in 2025": https://www.energy-storage.news/at-nearly-200gwh-chinas-new-energy-storage-deployment-rate-hit-record-high-in-2025/ . Result: "HTTP 403 Forbidden". I did not work round it.
- pv magazine, "China added 66.43 GW of new-type energy storage in 2025", 2 Feb 2026 (the researcher's ?p=66807 resolves to this): https://www.pv-magazine.com/2026/02/02/china-added-66-43-gw-of-new-type-energy-storage-in-2025/
- EIA, Today in Energy, 20 Feb 2026: https://www.eia.gov/todayinenergy/detail.php?id=67205

Verbatim, confirmed:
- pv magazine: "Based on CNESA DataLink 2025 annual energy storage dataset, presented at a press conference in Beijing on Jan. 22," and "a total of 66.43 GW/189.48 GWh of new-type energy storage systems were commissioned in 2025."
- pv magazine, application split: "standalone energy storage, which accounted for 58%". User-side storage's share fell to 8%, and thermal-plus-storage frequency regulation fell to 1.4% (as WebFetch reported).
- EIA: "compared with a record 15 GW added in 2025" (battery storage). The article has no 15.8 GW or 15,8xx MW figure.

Findings:
1. **The cited source was never opened.** The row links cite 48, Energy Storage News. The researcher used pv magazine instead and did not say that the cite was not opened. For me, cite 48 returns 403. Its headline ("nearly 200GWh") fits CNESA's 189.48 GWh, but I cannot confirm that it gives 66.4 GW or names CNESA. Either re-cite the row to pv magazine, 2 Feb 2026, or open cite 48 by an allowed route before printing.
2. **The scope point is now quoted.** CNESA's "new-type" total includes user-side storage (8% of the year's additions) as well as standalone and renewables-paired storage. "Grid storage" overstates its scope, as the researcher said. Pumped hydro is outside "new-type" by definition, but the pv magazine page as fetched does not say so; treat that as the conventional meaning, not as quoted.
3. **The 15.8 negative stands, but I could not run the targeted search.** EIA's article says "15 GW". The researcher's "I did not find 15.8 in any EIA page I opened" is accurate. I could not search for an EIA table (such as the Preliminary Monthly Electric Generator Inventory) that might give 15.8 GW, so the negative stays open. Until a source is found, 15.8 is unsourced.
4. **The PDF makes it worse.** Page 13 prints "16" for the US. Against EIA's stated "15 GW", that rounds an unsourced 15.8 upward, away from the source.
5. The China figure is printed "66" on page 13 and "66.4" on the site. Both are consistent with 66.43.

The page should say instead: "New-type energy storage added, 2025 | 66.4 | 15 | GW | China: CNESA, all new-type storage incl. user-side (via pv magazine). US: EIA, battery storage. Not like for like." In the PDF: "Storage added, 2025, GW | 66 | 15". Keep 15.8 only if an EIA table giving it is found and cited.
True as (amended): "China commissioned 66.43 GW / 189.48 GWh of new-type energy storage in 2025, including user-side systems (CNESA, as reported by pv magazine). EIA reports a record 15 GW of battery storage added in the US in 2025."

## 20.5. Reactors under construction | 38 | 0 | World Nuclear Association, Oct 2026. Vogtle 4 took 11 years. (cite 49)
Skeptic verdict: **amended** (the 38 and 0 hold; "Vogtle 4 took 11 years" is now testable and does not hold on WNA's dates; the date scope needs a flag)

Sources reopened:
- Cite 49, WNA, "Plans for new reactors worldwide": https://world-nuclear.org/information-library/current-and-future-generation/plans-for-new-reactors-worldwide
- WNA, "Nuclear Power in the USA" (country profile), "Updated Tuesday, 27 October 2026": https://world-nuclear.org/information-library/country-profiles/countries-t-z/usa-nuclear-power
- Wikipedia, "Vogtle Electric Generating Plant", used only as a pointer to primaries: https://en.wikipedia.org/wiki/Vogtle_Electric_Generating_Plant
- Primaries tried: the Georgia Power release that Wikipedia cites, https://www.georgiapower.com/company/news-hub/press-releases/vogtle-unit-4-enters-commercial-operation.html ("HTTP 404 Not Found"); IAEA PRIS, https://pris.iaea.org/PRIS/CountryStatistics/ReactorDetails.aspx?current=1043 (redirects to the PRIS home page, which has no reactor detail); the archive copy of the Georgia Power release (WebFetch "unable to fetch from web.archive.org"). I did not try other routes.

Verbatim, confirmed (cite 49):
- "Updated Friday, 23 October 2026".
- Summary bullet: "About 80 reactors are under construction across the world." Body: "About 80 power reactors are currently being constructed in 15 countries." The researcher's quote is on the page verbatim.
- Table, China: "38 | 43,327 | 42 | 47,985 | 142 | 168,575". USA: "0 | 0 | 0 | 0 | 25 | 7540". WORLD: "79 | 86,560 | ...". Columns: "REACTORS UNDER CONSTRUCTION", "REACTORS PLANNED", "REACTORS PROPOSED", each with "No." and "Gross MWe".
- Footnote: "Under Construction figures include a number of units where construction is currently suspended" (shortened by WebFetch from the full sentence).

Verbatim (WNA USA profile): "Following early delays, construction of unit 3 started in March 2013 and unit 4 in November." "In March 2024 unit 4 was connected to the grid." Also, written in October 2023 about a coolant-pump motor fault: "at unit 4, slightly delaying its commercial operation to March 2024." The profile gives no actual commercial operation date.

Verbatim (Wikipedia): "Vogtle 4 entered commercial operation on April 29." Infobox: "Unit 4: November 19, 2013" under "Construction began". Wikipedia cites the Georgia Power release of 29 Apr 2024 and IAEA PRIS for these dates, but neither primary opened for me.

Findings:
1. **The 38 and 0 hold** as China against the US. The researcher's reading is right: read as world, 38 would be wrong (world 79).
2. **The Vogtle claim is no longer unsourced, and it is overstated.** The researcher left it unchecked. WNA dates unit 4's construction start to November (2013, from the parallel "unit 3 started in March 2013"; Wikipedia gives 19 Nov 2013) and its grid connection to March 2024. That is about 10 years 4 months to grid connection. To commercial operation on 29 Apr 2024 (Wikipedia, citing Georgia Power; primary not opened), it is about 10 years 5 months. Measured from first concrete, "11 years" rounds up. It would hold only on a different start point, such as the 2012 licence, which the row does not name. The WNA page the row cites does not mention Vogtle at all.
3. **Date scope: the page checked post-dates the edition.** The edition is dated 15 Oct 2026. The WNA page the researcher and I read was "Updated Friday, 23 October 2026", eight days later. The counts the edition printed came from an earlier version of the page. They may well be the same, but neither of us has seen the version the edition used. I did not open an archived copy. The row's "Oct 2026" is fair; the owner should know the check was made against a later update.
4. Scope: WNA's under-construction count includes some suspended units (footnote above). The page as fetched does not say whether any of China's 38 are suspended.
5. The researcher's note on the missing column labels stands for the site row. On PDF page 13, the "CHINA · UNITED STATES" header makes the pairing clear.

The page should say instead: "Reactors under construction | 38 | 0 | World Nuclear Association, Oct 2026. Vogtle 4 took about ten and a half years from first concrete (Nov 2013) to power (2024)." Cite WNA's USA profile (or Georgia Power / IAEA PRIS once opened) for the Vogtle dates. Or drop the Vogtle sentence.
True as (amended): "China has 38 reactors under construction and the US has none (WNA, page updated 23 Oct 2026); worldwide, about 80. Construction of Vogtle unit 4 began in November 2013, and it was connected to the grid in March 2024 (WNA): about ten and a half years."

## 20.6. Utility solar capital cost | $497 | $1,371 | per kW | 2025 estimates, secondary. IRENA: China's solar LCOE about half the US. (cite 76)
Skeptic verdict: **overturned** (the claim can be settled; the key negative and one note are wrong)

Sources reopened:
- Cite 76, IRENA, "Renewable power generation costs in 2025", executive summary PDF (© IRENA 2026; authors Saied Dardour, Deborah Ayres, Lourdes Zamora): https://www.irena.org/-/media/Files/IRENA/Agency/Publication/2026/Jul/IRENA_TEC_RPGC_2025_Executive_summary_2026.pdf . WebFetch saved the PDF locally, and I read all 12 pages as images.
- IRENA publication page, https://www.irena.org/Publications/2026/Jul/Renewable-power-generation-costs-in-2025 : "HTTP 403 Forbidden". The full report was not reached, and I did not work round the wall.
- Oenergetice (Erik Novotný), "How much did solar power plants cost in 2025?", 16 July 2026, 13:26: https://oenergetice.cz/en/renewable-energy/how-much-did-solar-power-plants-cost-in-2025
- GreenTechLead (Baburajan Kizhakedath), both the amp page the researcher cited and the plain page: https://greentechlead.com/renewable-energy/renewable-energy-capacity-tops-690-gw-in-2025-as-solar-wind-deliver-lowest-power-costs-and-save-480-bn-in-fuel-imports-54051/amp and https://greentechlead.com/renewable-energy/renewable-energy-capacity-tops-690-gw-in-2025-as-solar-wind-deliver-lowest-power-costs-and-save-480-bn-in-fuel-imports-54051

Verbatim, from the IRENA executive summary:
- Page 8, under "Cost trends diverged across technologies and regions.": "China recorded the lowest onshore wind LCOE, at USD 27/MWh, and among the lowest solar PV LCOEs, at USD 36/MWh. Across major markets, the LCOE of solar PV ranged from USD 35/MWh in India to USD 65/MWh in Germany. LCOE values in the United States and Germany were also close to double those in China. This was due to permitting delays, interconnection bottlenecks and higher balance-of-system costs."
- Page 8, "Figure S3 Solar PV and onshore wind LCOEs across major markets, 2025 (USD/MWh)". Solar PV bars: Global 44, Brazil 37, China 36, Germany 65, India 35, United States 62.
- Page 6, Figure S1: Solar PV LCOE 2025 "44" USD/MWh; total installed cost 2025 "667" USD/kW, change "-6%". Notes: "Figures are 2025 USD values".
- Page 3, Highlights: "China is also among the lowest-cost solar markets, at USD 36/MWh, a figure close to that of India, at USD 35/MWh and Brazil, at USD 37/MWh." This is on the page as the researcher quoted it.
- No page of the executive summary gives a China or US solar installed cost in USD/kW. The only US USD/kW figure is gas: "around USD 2 400/kW" for a new combined-cycle plant.

Verbatim (Oenergetice): "The global average investment cost of solar power plants fell by a further 11% year on year to USD 747/kW." China: "investment costs averaging just USD 497/kW thanks to its extensive manufacturing capacity and integrated supply chains". US: "costs reached approximately USD 1,371/kW". China LCOE: "China recorded the lowest costs, with new solar power plants generating electricity at an average of USD 21/MWh." The article names no source for these figures. Its only named source is IRENA, linked for a general claim about solar being the cheapest new generation.

Verbatim (GreenTechLead): "Solar generation costs in both the United States and Germany were nearly double those in China" (WebFetch gave only this opening part of the sentence). Neither the amp page nor the plain page contains "533", "1,180" or "1180", or any solar USD/kW figure for China or the US.

Findings:
1. **The key negative is wrong.** The researcher wrote: "IRENA's executive summary does not give a US solar LCOE. 'About half' is an inference from GreenTechLead's 'nearly double'." The executive summary, the row's own cite, gives the US solar PV LCOE as USD 62/MWh (Figure S3). It also says in its own words that US LCOE values were "close to double those in China". The LCOE half of the row is IRENA's, not an inference. Checking the ratio: 36 / 62 = 58%. "About half" is a slight rounding down of IRENA's "close to double". IRENA's own wording is safer.
2. **One note is false.** "GreenTechLead, which attributes figures to IRENA, gives China $533/kW and US $1,180/kW." Neither version of the GreenTechLead page contains those numbers or any solar USD/kW figure. The note should be deleted. Wherever $533 and $1,180 came from, it is not this page.
3. **The cost pair is settled as not IRENA's and not attributed by its own source.** $497 and $1,371 are on Oenergetice, verbatim. That article names no source for them. They are not in the IRENA executive summary the row cites. They sit beside a global figure ($747/kW, -11%) and a China LCOE ($21/MWh) that both conflict with IRENA ($667/kW, -6%; $36/MWh). The row's "2025 estimates, secondary" is accurate as far as it goes. But the row cites only IRENA, so a reader would take the pair as IRENA's. Oenergetice is not in the source list.
4. **Still open:** IRENA's full report might give country installed costs for China and the US. The publication page is 403 and I could not search for the full-report PDF. Until it is opened, no IRENA country USD/kW figure can be printed.
5. Oenergetice is dated (16 July 2026). The researcher's "undated (2026)" can be corrected.

The page should say instead (smallest change): "Utility solar capital cost | $497 | $1,371 | per kW | 2025, Oenergetice (Jul 2026), which gives no source; IRENA's global average is $667. IRENA: US solar LCOE close to double China's ($62 against $36 per MWh)." Add Oenergetice to the source list. The cleaner option, on the cited source alone: "Solar PV LCOE, 2025 | $36 | $62 | per MWh | IRENA. US close to double China."
True as (replaces "could not settle"): "IRENA puts 2025 solar PV LCOE at USD 36/MWh in China and USD 62/MWh in the US, and says US values were 'close to double those in China'. IRENA's 2025 global solar PV installed cost is USD 667/kW. The country installed-cost figures of USD 497/kW (China) and USD 1,371/kW (US) appear in Oenergetice (16 Jul 2026), which gives no source for them; they are not in IRENA's executive summary."
