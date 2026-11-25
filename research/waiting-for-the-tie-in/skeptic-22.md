# Skeptic 22: Factories and China claims (edition "Waiting for the Tie-In", 15 Oct 2026)

Checked against: research/waiting-for-the-tie-in/lane-22.md
Read date for all checks: 2026-11-01
Edition text: I opened all 16 pages of the user's PDF. Of this lane's eight claims, only 22.8 is in it (page 15: "A phone every 0.7 seconds, no humans." / "PARTLY" / "Xiaomi says one every six, 81% automated, with a crew."). The factories grid and the 22.1/22.2 row are not in the PDF. I checked their wording against the site source: src/pages/waiting-for-the-tie-in.astro lines 71-72 (the "What did not hold" rows) and 238-246 (the Factories grid). They match CLAIMS.md lines 678-720. CLAIMS.md puts the 08 robot rows inside 22.1 and 22.2, so I checked those figures as well (34,164; 57%; Korea 1,220; "revised after China restated its manufacturing headcount").

Column labels (this affects 22.3 to 22.7): the researcher writes twice that the grid's column labels "are not in the edition text" and that reading the second column as the US "is an assumption". The site source settles it. Line 549, the grid's table head: `<th scope="col">Measure</th><th scope="col">China</th><th scope="col">United States</th><th scope="col">Note and source</th>`. Line 173 describes each row as "(measure, China, US, unit, China's bar value, the US's bar value, note, source address)". The section intro (line 542) reads: "Matched pairs, latest full-year figures, one source on every row." So every second figure in the Factories grid is the edition's claim about the United States.

Tooling limit: the shared WebSearch budget for this run was already used up before my first search ("this turn's web search budget is used up (limit: 200 WebSearch calls per turn, shared by every agent in it)"). Every check below rests on pages I opened directly with WebFetch, or on files the fetch tool saved, which I read myself. Where a negative needed a targeted search I could not run, I say so, and that negative is still open, not settled. The fetch tool caps verbatim quotes at about 125 characters on HTML pages. Where a sentence was cut, I say so.

Anthropic: no source in this lane characterises Anthropic. Nothing to flag.

## 22.1. China's factories are the most automated. | Partly | By installations, yes: 295,000 robots in 2024, 54 percent of the world. [08 row: "Industrial robots installed, 2024 | 295,000 | 34,164 | IFR. China 54% of the world, 57% of them Chinese-made."]
Skeptic verdict: **amended** (the facts stand; the researcher's "overstated" label is wrong; the three 08-row figures the researcher left unchecked all hold, and 34,164 is IFR's own unit count)

Sources reopened:
- IFR, "Global robot demand in factories doubles over 10 years": https://ifr.org/news/global-robot-demand-in-factories-doubles-over-10-years (no date in the body; press files named "2025-09-25-...")
- IFR press release, China: https://ifr.org/downloads/press_docs/2025-09-25-IFR_press_release_China_in_English.pdf ("Frankfurt, September 25th, 2025")
- IFR press release, Americas/USA: https://ifr.org/downloads/press_docs/2025-09-25-IFR_press_release_Americas_in_English.pdf ("Frankfurt, September 25th, 2025")
- IFR, World Robotics 2025 press-conference slides: https://ifr.org/downloads/press_docs/PressConference2025_presentation.pdf ("World Robotics 2025 | 25 September 2025"). The fetch tool could not parse the three PDFs, but it saved them, and I read the files directly. Same files, same URLs; no wall worked round.

Verbatim:
- Global page: "China is by far the world's largest market in 2024, representing 54% of global deployments." and "Their domestic market share climbed to 57% last year, up from about 28% over the past decade." and "Robot installations were down by 9% to 34,200 units." (US)
- China release: "Annual installations hit 295,000 units in 2024. This was up 7% and the highest level ever recorded – representing 54% of global demand." and "For the first time, Chinese manufacturers sold more than foreign manufacturers at home: The share climbed to 57% across industries in 2024, up from 47% in 2023."
- US release: "Annual installations reached 34,200 units in 2024 - down 9%" and "China installed 295,000 industrial robots in 2024, which is almost nine times more than the United States." and "In 2024, China had around five times more factory robots in use (2,027,200) than the US (393,700 units)." and "The situation is different in China, where 57% of the market is served by domestic manufacturers." And, from its "About IFR" note: "It also offers robot density, i.e. the number of robots per 10,000 employees, as a measure for the degree of automation."
- Slides: slide 14, "Annual installations of industrial robots 10 largest markets 2024": "China 295.0", "United States 34.2", "54% in China". Slide 16: "Share of Chinese suppliers at 57%". Slide 19, "Annual installations of industrial robots by customer industry - United States", 2024 values: Automotive 13,641; Metal and machinery 3,544; Electrical/electronics 2,847; Plastic and chemical products 2,711; Food 2,246; All others 6,498; Unspecified 2,677.

Findings:
1. **The verdict label is wrong.** In section 09 ("What did not hold"), "China's factories are the most automated" is the claim under test, not something the edition asserts. The edition rates it "Partly": yes by installations, no by density. The researcher's own true-as says the same thing. The edition does not overstate. The researcher's note that "the headline claim is broader than the row" treats the tested claim as the edition's own. It is not.
2. **The 34,164 is IFR's figure.** The researcher did not check it. IFR's text rounds it to 34,200, but the seven 2024 US industry values on slide 19 sum to exactly 34,164 (13,641 + 3,544 + 2,847 + 2,711 + 2,246 + 6,498 + 2,677). The sum is my arithmetic, but every addend is on IFR's slide.
3. **"57% of them Chinese-made" holds, with a precise scope.** IFR's 57% is the share of China's 2024 installations supplied by Chinese manufacturers ("57% across industries in 2024"). "Chinese-made" fits. Strictly, IFR counts the supplier's nationality, not where the robot was built.
4. **The researcher's support for "automated is a density idea" can now be quoted from IFR itself.** IFR calls robot density "a measure for the degree of automation". So "most automated" is a density claim in IFR's own terms. This backs the edition's "Partly".
5. One note goes further than the source. The researcher says the figure supports "only the installations count, a flow ... not the stock of robots in use". China also has the largest stock (2,027,200 against 393,700 for the US, per IFR). The edition's row does not use the stock figure, so nothing changes on the page. But "only" is too narrow: on both installations and stock China leads, and only on density does it trail.

The page should say instead: nothing needs to change. Optional precision for the 08 row: "IFR, World Robotics 2025. China 54% of world installations; 57% supplied by Chinese manufacturers. US 34,164 (IFR rounds to 34,200)."
True-as should read: "China installed 295,000 industrial robots in 2024, 54% of the world total, and has the largest operational stock (2,027,200). The US installed 34,164 (IFR: 34,200). Chinese manufacturers supplied 57% of China's installations (IFR, World Robotics 2025, 25 Sep 2025). IFR measures the degree of automation by robot density, where China ranks 22nd (see 22.2). The edition's 'Partly' holds."

## 22.2. By density, the IFR's revised figure puts China at 166 per 10,000 workers, below the US at 307. [08 row: "Robot density, per 10,000 workers | 166 | 307 | IFR, revised after China restated its manufacturing headcount. China behind. Korea 1,220."]
Skeptic verdict: **amended** ("holds" stands; the researcher's note that "revised" is only the edition's word is overturned by IFR's own earlier release; the year and Korea need adding)

Sources reopened:
- IFR, "Robot density surges in Europe, Asia and the Americas": https://ifr.org/news/robot-density-surges-in-europe-asia-and-americas/ (no date in the body; download files named "DE-2026-APRIL-_8-IFR_PRESSMELDUNG_Roboterdichte-deutsch.pdf" and "JP-2026-APRIL-08-IFR-press_release_Robot_Density-Japanese.pdf", so 8 April 2026)
- IFR, the previous density release, "Global Robot Density in Factories Doubled in Seven Years": https://ifr.org/ifr-press-releases/news/global-robot-density-in-factories-doubled-in-seven-years (dated "Frankfurt, Nov 20, 2024", data for 2023)

Verbatim (April 2026 page; quotes cut at the fetch tool's limit are marked "…"):
- "Based on updated labor market data issued by China's National Bureau of Statistics, China ranks 6th in Asia…" (the fetch summarised the rest of the sentence as "6th in Asia and 22nd worldwide")
- "It has 166 robots for every 10,000 people employed, which is a year-on-year increase of 17%."
- "The United States ranks 8th worldwide with 307 units per 10,000 employees."
- "The Republic of Korea records the world´s highest robot density with 1,220 robots per 10,000 employees…"
- Methodology: "Robot density is the number of operational industrial robots relative to the number of employees." "It can cover the whole manufacturing industry or just specific industrial branches."
- The fetch reports that "revised", "restated" and "headcount" do not appear on the page, and that the figures are for 2024, with manufacturing employees as the denominator.

Verbatim (Nov 2024 release): China "a high robot density of 470 robots per 10,000 employees (2022: 402 units)"; "China took third place in 2023, surpassing Germany and Japan."; "Robot density in the United States reached 295 units in 2023." and it "ranks tenth in the world."; Korea "1,012 robots per 10,000 employees".

Findings:
1. The 166, 307, the ranks and Korea's 1,220 are on the page. The researcher did not check Korea; it holds.
2. **"Revised" is borne out, not just the edition's word.** The researcher wrote that the page "does not say previously published figures were 'revised'". The word is absent, but IFR's own record shows the revision. In November 2024 IFR published China at 470 for 2023, ranked 3rd. In April 2026 it gives 166 for 2024, "a year-on-year increase of 17%". That implies a 2023 base of about 142 (166 / 1.17, my arithmetic), not 470. The series was restated on "updated labor market data issued by China's National Bureau of Statistics". "Revised after China restated its manufacturing headcount" is a fair paraphrase. Strictly, IFR says NBS "issued" updated labour data; "restated" is the edition's word for that.
3. **Scope: the year is missing.** The figures are 2024 densities (IFR World Robotics 2025 data, released April 2026). The row's label gives no year, though its neighbour says "2024".
4. "Workers" is the edition's word. IFR's is manufacturing "employees". The researcher's note (a) stands.

The page should say instead: 09 row: "By density, the IFR's revised 2024 figure puts China at 166 robots per 10,000 manufacturing employees, below the US at 307." 08 row: "Robot density, 2024, per 10,000 manufacturing employees | 166 | 307 | IFR, Apr 2026, revised on updated Chinese labour data (it gave 470 for 2023 in Nov 2024). China 22nd, US 8th. Korea 1,220."
True-as should read: "IFR's April 2026 release puts China's 2024 robot density at 166 per 10,000 manufacturing employees (22nd worldwide), below the US at 307 (8th) and Korea at 1,220 (1st). It is based on updated labour data from China's National Bureau of Statistics. IFR had published 470 for China in 2023 (Nov 2024), so the series was revised."

## 22.3. Battery cell capacity, world share | >80% | 6–7% | IEA Global EV Outlook 2026.
Skeptic verdict: **upheld** (still could not open; one note is wrong)

Sources tried:
- https://www.iea.org/reports/global-ev-outlook-2026/electric-vehicle-batteries returned "HTTP 403 Forbidden" to me.
- https://www.iea.org/reports/global-ev-outlook-2026/executive-summary also returned "HTTP 403 Forbidden".
I did not work round the block. Other skeptics in this run (16, 23) report iea.org returning 403 to them as well. With no search budget, I found no IEA mirror or IEA-hosted PDF URL for this report on any page I could open. The negative stays open.

Findings:
1. The "could not open" verdict and the "not settled" true-as stand. The researcher's secondary summaries stay unconfirmed. I could not reopen them, because the researcher gives no URLs for them.
2. **One note is wrong.** "The row's column labels are not in the edition text" is wrong (see "Column labels" above). The table head says China, then United States. So the edition states that the US has 6–7% of world battery cell capacity. If the researcher's secondary summary is right (6–7% for the EU and for the US each), the US figure would hold. If it is a combined EU-and-US figure, the row is wrong. Settling it needs the IEA chapter.
3. The row's label says "capacity". The researcher's summaries mix capacity and production. Until the IEA text is read, "capacity" is unverified as well.

The page should say instead, until the IEA chapter is read: keep the row only as unverified, or drop it. Do not publish "6–7%" as a US figure on the strength of search summaries.
True-as stands: "Not settled."

## 22.4. Solar modules, world share | 86% | ~2% | IEA PVPS, 2024. Polysilicon 94%, wafers 97%.
Skeptic verdict: **upheld** ("wrong" for the "~2%" stands; two notes need correcting, and a newer edition exists)

Sources reopened:
- Kaizuka and Okazaki, "Trends of PV industry", slides: https://iea-pvps.org/wp-content/uploads/2025/11/2025-11-11-Kaizuka.pdf. The fetch tool could not parse the PDF, but it saved it, and I read the file directly. Same file and URL.
- IEA PVPS Trends reports index: https://iea-pvps.org/trends-reports/ ; Trends 2025: https://iea-pvps.org/trends_reports/trends-2025/ ; Trends 2026: https://iea-pvps.org/trends_reports/trends-2026/

Verbatim (slides):
- Slide 1: "Trends of PV industry", "21st October 2025, 65th IEA PVPS Task 1 expert meeting, Berlin", "Izumi KAIZUKA, Deputy Manager IEA PVPS Task 1/ Director, RTS Corporation", "Junko Okazaki, Senior Researcher, RTS Corporation".
- Slide 2: "2024 Trends from Trends Report". Slide 4 footer: "Source : IEA PVPS, Trends Report 2024".
- Slide 3: "RTS Conducted primary survey for production amount and production capacity with global partners".
- Slide 7: "Share of China 2022: 86% 2023: 92% 2024: 94%" (polysilicon).
- Slide 8: "Share of China 2022 : 97.5% 2023: 98.1% 2024: 96.5%" and "China has ~97% of production share." (wafers).
- Slide 9 (cells): "Share of China ... 2024: 90%"; the pie's labels include "USA, 1.0".
- Slide 11 (modules): "Global production of solar modules (crystalline silicon and thin-film technologies) in 2024 was 726 GW, up 19% from the previous year"; "China produced 627GW (86%)."; "Other countries: India produced 24 GW, the US 23 GW, Vietnam ~20 GW, Thailand ~10 GW, and Malaysia about 7 GW in 2024". The pie's small labels appear to read "USA 3%" and "India 3%" on my read. They are small, so I give that as a reading, not a quote.

Findings:
1. The 86%, the 94% and the ~97% are on the slides, verbatim. The US made 23 of 726 GW, 3.2% (my arithmetic), and the pie label appears to read 3%. "~2%" is not supported. The verdict stands.
2. **The column is the US, not an assumption** (see "Column labels" above). The researcher's hedge can go.
3. **The deck credits its figures to an IEA PVPS report.** The researcher says the deck "is the IEA PVPS Task 1 team's material, not a formal IEA PVPS report". The deck says its 2024 figures come "from Trends Report" and cites "IEA PVPS, Trends Report 2024". So the edition's "IEA PVPS, 2024" credits the right body. The better primary would be the Trends report itself. Its page (Trends 2025, 2024 data) offers the English PDF only through a JavaScript download button, and the page text has no manufacturing shares. I did not try to get round the button.
4. **A newer edition exists.** IEA PVPS lists "Trends in PV Applications 2026", which the fetch reports as published September 2026 with 2025 data, before the edition went out on 15 Oct 2026. Its page text gives no manufacturing shares, and its PDF sits behind the same download button. The intro's "latest full-year figures" may therefore not hold for this row. This is open, not shown.
5. No US share near 2% appears anywhere in the deck. The nearest US figure is 1.0% of cell production (slide 9). The "~2%" may be a mix-up with cells, but that is a guess, and I do not put it forward as the cause.

The page should say instead: "Solar modules, world share, 2024 | 86% | ~3% | IEA PVPS Trends (via Task 1 slides, Oct 2025). US 23 of 726 GW. Polysilicon 94%, wafers 97%." The bar value for the US should be 3, not 2.
True-as stands as the researcher wrote it.

## Counts (running)
upheld 2 (22.3, 22.4) · overturned 0 · amended 2 (22.1, 22.2)
