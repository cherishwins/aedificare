# Skeptic 21: Power prices and the Ulanqab hub (edition "Waiting for the Tie-In", 15 Oct 2026)

Checked against: research/waiting-for-the-tie-in/lane-21.md
Read date for all checks: 2026-11-01
Edition text: I opened all 16 pages of the user's PDF. None of this lane's four rows is in it. Page 13 ("Side by side") has only capacity, reactors, storage and accelerators, and page 15 has three other claims. I checked the wording against the site source instead: src/pages/waiting-for-the-tie-in.astro line 73 (the "What did not hold" row), line 180 (the chain's shell node), lines 233-236 (the grid rows) and lines 128-130 (the source list). They match CLAIMS.md lines 658-676. The source list settles the cite numbers: 50 = "US Energy Information Administration. Short-Term Energy Outlook, electricity prices, Oct 2026. eia.gov/outlooks/steo/tables/pdf/7atab.pdf"; 51 = Caixin, Aug 2026; 52 = Carbon Brief. **China Briefing is not in the source list**, although the edition's text names it.

Tooling limit: the shared WebSearch budget for this run was already used up before my first search ("this turn's web search budget is used up (limit: 200 WebSearch calls per turn, shared by every agent in it)"). Every check below rests on pages I opened directly with WebFetch, or on linked pages I followed from them. Where a negative needed a targeted search I could not run, I say so, and that negative is still open, not settled.

Anthropic: no source in this lane characterises Anthropic. Nothing to flag.

## 21.1. Power is cheaper in China. | Partly | The national industrial average is about level, 8.8 cents against 8.6. (cite 50)
Skeptic verdict: **amended** (the researcher's main negative is overturned: the 8.6 is on EIA's table; the "overstated" label is wrong; the true-as and the 08 row need the years)

Sources reopened:
- EIA STEO table 7a (cite 50): https://www.eia.gov/outlooks/steo/tables/pdf/7atab.pdf. The fetch tool could not parse it, but it saved the PDF, and I read that file directly. It is the same file at the same URL. No wall was worked round.
- China Briefing: https://www.china-briefing.com/news/chinas-industrial-power-rates-category-electricity-usage-region-classification/ (Tianyi Xiao and Qian Zhou, "China's Industrial Power Rates 2025: A Guide for Investors", May 19, 2025)
- EIA Electric Power Monthly, Table 5.3: https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_3

Verbatim (EIA STEO 7a):
- Title: "Table 7a. U.S. Electricity Industry Overview", then "U.S. Energy Information Administration | Short-Term Energy Outlook - October 2026"
- Row "Prices to ultimate customers (cents per kilowatthour)", then "Industrial sector": annual columns "8.62 9.05 9.15" under "2025 2026 2027".
- Notes: "EIA completed modeling and analysis for this report on October 1, 2026." and "Minor discrepancies with published historical data are due to independent rounding and possible revisions not yet reflected in the STEO."
- The table has US rows only (supply, consumption, inventories, US fuel costs, US retail prices, US wholesale hubs). It has no China figure.

Verbatim (China Briefing): "the average industrial power rate in China has increased slightly, reaching approximately US$0.088/kWh in 2024" (the sentence continues "up from US$0.084/kWh in 2019."). Per the fetch, the figure is credited to Statista, linked as "business-electricity-price-china". The only country comparison: "China's electricity prices remain lower than those in most developing countries" then "such as India and Mexico."

Verbatim (EIA EPM 5.3): title "Table 5.3. Average Price of Electricity to Ultimate Customers:" "Total by End-Use Sector, 2016 - August 2026 (Cents per Kilowatthour)". Industrial annual averages: 2023 8.04, 2024 8.13, 2025 8.51.

Findings:
1. **The negative is overturned.** The researcher wrote "The 8.6 US figure is not verified" and "the US figure's year is unknown". EIA's own table gives 8.62 cents for the US industrial sector, 2025, in the October 2026 STEO, the edition's cite 50. The year is known: the edition's 08 row says "EIA, 2025", and the table agrees. The STEO has no China figure, so the researcher's hedge ("I make no claim that STEO 7a lacks China") can now be settled: it lacks China.
2. **The verdict label is wrong.** In section 09 ("What did not hold"), "Power is cheaper in China" is the claim under test, not the edition's assertion. The edition rates it "Partly": about level on the national average, cheaper at the hubs. The 08 row says "About level. China slightly higher." Both match the sources. The researcher's own true-as says the same thing. The edition does not overstate. Its fault is scope (finding 3).
3. **Scope: the years differ, and the row does not say so.** China is 2024 (China Briefing) and the US is 2025 (STEO). The 08 row gives the two years but, unlike the TWh row, does not flag them as different. On the same year, EIA's 2024 industrial average is 8.13 cents (EPM 5.3), so China's 8.8 is about 8% higher. "About level" is generous for the same year. "China slightly higher" holds on either basis.
4. EIA's two tables differ slightly for 2025: 8.62 (STEO 7a) against 8.51 (EPM 5.3, annual). The STEO itself notes "Minor discrepancies with published historical data". Either rounds to "about 8.5 to 8.6".
5. **Better primary:** China Briefing credits Statista for the 8.8. I did not open Statista and could not search for it (budget used up). China Briefing is a report of that figure, not its source, and the edition's source list omits China Briefing altogether.
6. The researcher's note on EPM 5.6.A (US industrial 8.98 Aug 2025, 9.64 Aug 2026 prelim.) is confirmed (see 21.2) and is correctly kept out of the comparison as monthly.

The page should say instead: 09 row stands as is. 08 row: "Industrial power, national average | 8.8¢ | 8.6¢ | per kWh | China 2024, China Briefing (Statista); US 2025, EIA STEO. Years differ. About level; China slightly higher." Add China Briefing (19 May 2025, URL above) to the source list.
True-as should read: "China's average industrial power price was about 8.8 US cents per kWh in 2024 (China Briefing, citing Statista). The US industrial average was 8.62 cents in 2025 (EIA STEO, Oct 2026) and 8.13 cents in 2024 (EIA). On the national average China is level or slightly higher; power is cheaper only at certain hubs (see 21.2)."

## 21.2. At the western data-centre hubs it is roughly 4.5 cents against 9 to 10 in Virginia. (cites 51, 50) [08 row: "Power at the data-centre hub | ~4.5¢ | ~9.5¢ | per kWh | Ulanqab, Inner Mongolia (Caixin) against Virginia (EIA, OIES)."]
Skeptic verdict: **amended** (the "overstated" verdict stands; the FX rate now has a primary; the "western" note is wrong; Virginia needs a table the edition does not cite)

Sources reopened:
- Caixin (cite 51): https://www.caixinglobal.com/2026-08-14/in-depth-how-a-windswept-city-in-north-china-became-an-ai-powerhouse-102474153.html (byline "Zhao Xuan and Gu Zhaowei", "Published Aug. 14, 2026, 4:59 p.m. GMT+8"). Paywalled after the third paragraph ("You've accessed an article available only to subscribers."). I did not work round it.
- EIA EPM Table 5.6.A: https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_a
- EIA EPM Table 5.6.B: https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=epmt_5_6_b
- FX primary, Federal Reserve H.10 series via FRED (DEXCHUS, "Chinese yuan per U.S. dollar"): https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXCHUS&cosd=2026-08-01&coed=2026-10-31

Verbatim (Caixin, visible article text): "According to data from the Ulanqab municipal bureau of statistics," then "surged 85.2% year-on-year to 4 billion kilowatt-hours (kWh) in the first half of 2026." Nothing on price is in the visible text.
Caixin's on-page digest (labelled "AI generated, for reference only", so a lead, not the article): the fetch reports "lower power prices of 0.3–0.35 yuan/kWh", AI training that "moves westward for cheap energy", and clusters that moved "west of the Hu Huanyong Line to hubs like Ulanqab."

Verbatim (EIA 5.6.A): "Table 5.6.A. Average Price of Electricity to Ultimate Customers by End-Use Sector," "by State, August 2026 and 2025 (Cents per Kilowatthour)". "Virginia 17.64 15.85 11.14 9.85 9.98 9.40 13.58 10.70 13.15 11.54" (pairs: residential, commercial, industrial, transportation, all sectors; Aug 2026 then Aug 2025). 2026 values are preliminary.

Verbatim (EIA 5.6.B): "Table 5.6.B. Average Price of Electricity to Ultimate Customers by End-Use Sector, by State, Year-to-Date through August 2026 and 2025 (Cents per Kilowatthour)". "Virginia 16.95 15.00 11.20 9.67 10.07 9.31 12.01 8.62 12.97 11.38". Virginia industrial: 10.07 (Jan-Aug 2026, preliminary), 9.31 (Jan-Aug 2025). Virginia commercial: 11.20 and 9.67.

Verbatim (H.10 via FRED): "2026-08-14,6.7412" (Caixin's publication day). August 2026 range: 6.7197 (31 Aug) to 6.7563 (3 Aug). "2026-10-15,6.6909" (the edition's date).

Findings:
1. The researcher's quotes from the digest are on the page, and the digest is correctly treated as a lead only. The price is still not in visible article text, and its customer class is still unknown.
2. **The FX rate now has a primary.** The researcher used "about 6.78 yuan per dollar, from secondary FX reports in search snippets". The Fed's H.10 rate on 14 Aug 2026 was 6.7412. At that rate 0.30–0.35 yuan = **4.45–5.19 US cents** (midpoint 4.82). At the edition-date rate (6.6909) it is 4.48–5.23. The researcher's 4.4–5.2 is close but its low end is a little too low.
3. **The "overstated" verdict stands, on firmer arithmetic.** "Roughly 4.5 cents" and "~4.5¢" take the bottom of a 4.5–5.2 range. The middle is about 4.8. The figure is also the edition's conversion, not Caixin's.
4. **The "western" note is wrong.** The researcher wrote that "western data-centre hubs" "does not match the Caixin source" because the headline says "north China". Caixin's own page (digest) places Ulanqab "west of the Hu Huanyong Line" and describes AI training moving "westward". "North China" in the headline is geography. "Western" is the label the page itself uses. Both can be true. The real fault is the plural: Caixin supports one hub (Ulanqab), not "hubs". I could not open an NDRC page on the national hub list (the gov.cn page I tried returned 404, and I could not search), so "western" as an official label is unconfirmed.
5. **Virginia, scope.** The edition credits "EIA", but its cite 50 (STEO 7a) is a US-only table with no state rows (see 21.1). The Virginia figures are in EIA EPM 5.6.A/5.6.B, which the edition does not cite. Year to date, Virginia industrial was 9.31 cents (2025) and 10.07 cents (2026, preliminary). "9 to 10" and "~9.5" fit. But EIA does not say which sector Virginia's data centres buy in. Virginia's commercial price is higher (9.67 and 11.20 year to date). The row should say "industrial".
6. **OIES: still open.** The researcher found no OIES source and opened no OIES page. I could not search (budget used up), so I cannot overturn or confirm the negative. Until an OIES page is opened, drop "OIES" from the attribution.
7. Customer class (Caixin): open. The digest gives no tariff class. Do not compare it with Virginia's industrial price as like for like.

The page should say instead: 09 row: "At Ulanqab, a western data-centre hub, Caixin reports 0.30–0.35 yuan, about 4.5 to 5 cents, against 9 to 10 cents for industrial power in Virginia." 08 row: "Power at the data-centre hub | ~4.5–5.2¢ | ~9.5¢ | per kWh | Ulanqab, Inner Mongolia, 0.30–0.35 yuan (Caixin, Aug 2026; at 6.74 yuan/$) against Virginia industrial, Jan-Aug 2025-26 (EIA Electric Power Monthly, table 5.6.B)." Drop "OIES" until a page is opened. Add EPM 5.6.B to the source list.
True-as should read: "In Ulanqab, Inner Mongolia, Caixin (14 Aug 2026) reports power at 0.30–0.35 yuan per kWh, about 4.5–5.2 US cents at the Fed's 14 August rate of 6.74 yuan to the dollar; the customer class is not given in the visible text. Virginia's industrial price was 9.31 cents in January to August 2025 and 10.07 cents in January to August 2026 (EIA, preliminary)."

## 21.3. Time to deliver a data-centre shell | 6–12 | 12–24 | months | Caixin, citing an Ulanqab developer. (cite 51) [chain node "Data-centre shell": "12 to 24 months in the US, 6 to 12 in China", src "JLL; Caixin"]
Skeptic verdict: **upheld** (the "could not open" verdict and the "Not settled" true-as stand; two notes need correcting)

Source reopened: the same Caixin page as 21.2. The paywall is unchanged, and I did not work round it. A second fetch asked only for the digest items on construction time and on speakers.

Verbatim (Caixin digest, "AI generated, for reference only", labels as the page gave them on my read):
- "[para. 10][para. 11]": "Traditional construction cycles can stretch to 30 months in Europe and 12-24 in the US, but only 6-12 in China." The fetch reports no person or organisation attributed.
- Same labels: "A modular AI data center in Ulanqab can be fully delivered in just 100 days." Unattributed.
- "[para. 5]": "Wang Chaoyang of Alibaba Cloud highlighted the abundant cheap green power as a premier advantage."
- "[para. 6][para. 7]": "the city hosts Alibaba Cloud, which opened its first project there in 2020."
- "[para. 16][para. 17]": "Wang argued that modular data centers can leverage China's manufacturing capabilities for export."
- "[para. 18][para. 19]": "Omdia analyst Nian Zijun noted that leveraging modularity to boost productivity is a prevailing trend"
- "Who's Who": the section has no entries.

Findings:
1. The quote is on the page, verbatim. The verdict stands: the 6–12 / 12–24 figures appear only in an AI digest, unattributed, and the article text that would name the speaker is behind the paywall.
2. **The paragraph labels differ.** The researcher gives "paragraphs 14–15". On my read the same sentence sits under "[para. 10][para. 11]". The digest is AI-generated and its labels do not appear to be stable, so neither label should be cited as a location in the article.
3. **One note is not borne out.** The researcher says the digest's "only Ulanqab developer reference is about Alibaba Cloud and a 2027 facility". On my read the digest has no 2027 facility. It says Alibaba Cloud "opened its first project there in 2020", and it quotes Alibaba Cloud's Wang Chaoyang twice, the second time on modular data centres. So the digest does contain a speaker from an Ulanqab developer on this theme. It does not tie the 6–12 figure to him. The other named speaker is an Omdia analyst, not a developer. The edition's "citing an Ulanqab developer" is therefore plausible but not shown. It is also possible that the speaker is Omdia, or the reporters themselves.
4. Scope note confirmed: the digest says "traditional construction cycles", not "shell" delivery, and gives a Europe figure (30 months) that the edition drops. The 100-day modular figure is a different measure.
5. The chain node credits "JLL; Caixin". JLL is outside this lane, and I did not check it. If the US 12–24 months comes from JLL rather than Caixin, the grid row's single attribution to Caixin is incomplete. That is open.

The page should say instead, until the article text is read: "Construction cycle | 6–12 | 12–24 | months | Caixin, Aug 2026 (speaker not confirmed). Europe up to 30." Drop "citing an Ulanqab developer" until the full text names one. Do not call it "shell" delivery unless the article does.
True-as stands: "Not settled." The digest's figures may be given as a lead: traditional construction cycles of 6–12 months in China, 12–24 in the US and up to 30 in Europe, unattributed.

## 21.4. Data-centre electricity use | 150–200 | 176 | TWh | China 2025, government figures via Carbon Brief; US 2023, LBNL. Years differ. Roughly level. (cite 52)
Skeptic verdict: **amended** (the "overstated" verdict stands, but on different grounds; the true-as calls LBNL "measured", which LBNL does not; the "internally inconsistent" note is wrong; a better primary for China was reached)

Sources reopened:
- Carbon Brief (cite 52): https://www.carbonbrief.org/explainer-how-china-is-managing-the-rising-energy-demand-from-data-centres (author "Yuan Ye", published 16 April 2025; the page metadata also gives a modification date of 20 July 2026)
- The Chinese government primary, followed from Carbon Brief's "More recent" link: Development Research Center of the State Council, https://www.drc.gov.cn/DocView.aspx?chnid=379&leafid=1338&docid=2907711 (dated 2024-05-20; institution read as 国务院发展研究中心资源与环境政策研究所). The page's character encoding was corrupted. The digits are clean, but my readings of the Chinese words are inferences from the garbled text.
- The 2020 source, followed from Carbon Brief's "report" link: China Daily on gov.cn, "Green data centers in focus", updated December 9, 2021: https://english.www.gov.cn/statecouncil/ministries/202112/09/content_WS61b13edac6d09c94e48a1f81.html
- LBNL news page: https://energyanalysis.lbl.gov/news/berkeley-lab-report-evaluates-increase-electricity-demand-data-centers (dated January 17, 2025)
- LBNL report itself: Shehabi et al., "2024 United States Data Center Energy Usage Report", LBNL-2001637, publication date 2024-12-20. The lbl.gov PDF link returned "301 Moved Permanently" to https://escholarship.org/uc/item/32d6m0d1. I read the PDF at https://escholarship.org/content/qt32d6m0d1/qt32d6m0d1.pdf (the fetch tool saved it; I read the file directly).

Verbatim (Carbon Brief):
- "More recent government figures put demand at 77TWh in 2022, 150-200TWh in 2025 and 400TWh by 2030." Confirmed.
- The sentence before it gives the 2020 figure: "the electricity consumption of China's data centers in 2020 was 200TWh, some 2.7% of demand that year", credited to a 2021 China Daily report posted by the State Council.
- Not quoted by the researcher: "data centre electricity demand could increase from around 100– 200 terawatt-hours (TWh) in 2025", after the sentence that the scale of current demand "is 'uncertain.'" The "100" links to the IEA's Electricity 2025 report and the "200" links to the DRC page.
- Also not quoted: the IEA "estimates Chinese data centre electricity demand of just 100TWh in 2024, with the potential to double by 2027".

Verbatim (DRC, digits clean, words inferred from garbled encoding): 2022 consumption "766" 亿千瓦时 (76.6 TWh, 0.9% of national use). For 2025: "预计" (projected) that by the end of the 14th Five-Year Plan consumption will be 2–3 times 2022, reaching "1500" to "2000" 亿千瓦时. 2030: approaching "4000" 亿千瓦时.

Verbatim (China Daily, 2021): "the electricity consumption by data centers alone in 2020 is estimated to exceed 200 billion kilowatt-hours", "accounting for 2.7 percent of the country's electricity consumption", credited to China's State Grid Energy Research Institute.

Verbatim (LBNL report, Executive Summary, p. 5-6): "This report ... estimates historical data center electricity consumption back to 2014"; "U.S. data center energy use has continued to grow at an increasing rate, reaching 176 TWh by 2023, representing 4.4% of total U.S. electricity consumption."; "The estimates in this report are based on a 'bottom-up' energy use model that calculates total electricity use from an installed base of data center equipment." Chapter 6 (p. 59): "our primary IT equipment shipment data—which forms the foundation of our bottom-up analyses for traditional data centers—does not capture the specialized ASICs used in mining operations."

Findings:
1. **"Measured" is wrong.** The researcher's true-as calls the US figure "176 TWh measured" and "a measured 2023 total". LBNL calls its historical figures estimates from a "bottom-up" model, and says "the lack of data availability significantly limits the analysis". Both columns are estimates. The difference is that China's 2025 figure is a forecast and the US 2023 figure is a modelled historical estimate.
2. **A better primary was reached, and it dates the China figure.** The 150–200 TWh comes from the State Council's Development Research Center, dated 20 May 2024, and it is a forecast ("预计") for the end of the 14th Five-Year Plan (2025). It is not a 2025 outcome, and it is not from April 2025, as the researcher's true-as implies ("reported in April 2025"). This confirms the attribution the researcher left unverified (DRC), with the encoding caveat above.
3. **The "internally inconsistent" note is wrong.** The 200 TWh for 2020 and the 77 TWh for 2022 come from two different bodies: the State Grid Energy Research Institute (via China Daily, 2021) and the DRC (2024). Carbon Brief presents the second as "More recent government figures" and says the scale is "uncertain". That is Carbon Brief reporting a disagreement between sources, not contradicting itself.
4. **The verdict stands for a reason the researcher missed.** Carbon Brief's own 2025 range is "around 100–200" TWh, with the low end from the IEA, which "estimates Chinese data centre electricity demand of just 100TWh in 2024." The edition takes only the government forecast. On the IEA figure China is well below the US's 176, not "roughly level". "Roughly level" holds only on the DRC forecast.
5. **Crypto: overturned in part.** The researcher "did not confirm" whether LBNL's figure excludes cryptocurrency. The report estimates mining separately (chapter 6), because its shipment data, the basis of the data-centre estimate, "does not capture the specialized ASICs used in mining operations." So the 176 TWh does not include crypto mining ASICs. The edition's row makes no claim on this, so it changes nothing on the page.
6. Dates: the researcher's "announced 20 Dec 2024" matches the report's eScholarship publication date (2024-12-20; cover "December 2024"). The news page the researcher read is dated January 17, 2025.
7. Carbon Brief's page carries a later modification date (20 July 2026). I cannot tell what changed. The edition should cite the article as of its read date.

The page should say instead: "Data-centre electricity use | 100–200 | 176 | TWh | China 2025: State Council DRC forecast (May 2024) 150–200; IEA 100 in 2024; via Carbon Brief. US 2023: LBNL model estimate. Years and methods differ. Not like for like." If the single government range is kept, the minimum change is "China 2025 forecast (State Council DRC, May 2024)" in place of "China 2025, government figures", plus "IEA: 100 TWh in 2024" in place of "Roughly level".
True-as should read: "China's data-centre electricity use was forecast at 150–200 TWh for 2025 by the State Council's Development Research Center (May 2024), against 77 TWh in 2022; the IEA estimated 100 TWh in 2024 (both via Carbon Brief, April 2025). LBNL estimated US data-centre use at 176 TWh in 2023, 4.4% of US electricity, with a bottom-up model. The figures differ in year and method, and on the IEA estimate China is well below the US."

## Counts
upheld 1 (21.3) · overturned 0 · amended 3 (21.1, 21.2, 21.4)
