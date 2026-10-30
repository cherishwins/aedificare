# Skeptic, Lane 7: Four points, Twelve Million Phones, ODNI

Checked against: research/the-night-pin/lane-7.md. Edition: source/the-night-pin.web.md, section 09 (line 133 and line 135) and section 13 (line 185). Sources [11], [15], [16] in section 17.
Read: 2026-10-30. Nothing committed.

Walls hit, recorded and not worked round:
- nature.com/articles/srep01376 gives a 303 to idp.nature.com/authorize (a sign-in redirect). Not followed.
- nytimes.com: "Claude Code is unable to fetch from www.nytimes.com". Not worked round.
- techdirt.com (Dec 2019 piece on the NYT story): HTTP 403. Not retried.
- engage-csedu.org (resource page): HTTP 503.
- Search results also listed full-text reprints of the NYT article: socialethical.cs.unm.edu/readings/one_nation_tracked.pdf, let.iiec.unam.mx/print/2676 and realclearworld.com. I did not open them, because reading a full reprint of the paywalled piece would work round the NYT refusal. Flag for the owner: these exist and could settle the "by name" question word for word if the house rules allow them.

No characterisation of Anthropic appears in this lane.

---

## 1. de Montjoye et al. (2013): 15 months, 1.5 million people, four points single out 95 percent, hourly, cell towers [11]

**Skeptic verdict: UPHELD** (the researcher said "holds", no change)

Reopened: https://pmc.ncbi.nlm.nih.gov/articles/PMC3607247 (the PMC open-access copy of Scientific Reports 3, 1376, DOI 10.1038/srep01376, dated "2013 Mar 25"). I confirmed the nature.com sign-in redirect myself and did not follow it.

Evidence (verbatim from PMC):
- "We study fifteen months of human mobility data for one and a half million individuals"
- "four spatio-temporal points are enough to uniquely identify 95% of the individuals"
- "The dataset's intrinsic temporal resolution is one hour."
- "The dataset's intrinsic spatial resolution is thus the maximal half-distance between antennas."

Scope tests:
- The 95% is at the dataset's own resolution (hourly, antenna), which matches the edition's "at hourly resolution, using cell-tower locations".
- Methods: the uniqueness figure is estimated from a random sample of 2,500 traces, each checked against the full dataset. The points are randomly chosen. This is a standard estimate and does not change "95 percent of them".
- The data are a mobile operator's call records from April 2006 to June 2007, from "a western country" (a sample representative of "a small European country"). The edition does not mention the country and does not need to.
- The paper does not mention GPS. The edition's comparison with "the GPS in a modern bid request" is the edition's own framing and is outside this lane, as the researcher noted.

Better primary: the publisher page is behind a sign-in redirect, so PMC is the best open primary.

Print: no change. "In 2013, researchers studying 15 months of mobility data for 1.5 million people found that four points in space and time were enough to single out 95 percent of them. That was at hourly resolution, using cell-tower locations, ..."

---

## 2. NYT, December 2019: more than 50 billion pings, over 12 million phones, 2016 and 2017; reporters followed military officials, police and lawyers "by name" [15]

**Skeptic verdict: AMENDED.** The researcher's "could not open; secondary supports numbers" becomes: the numbers, period and "obtained" are confirmed against NYT text quoted verbatim in three outlets; "by name" is not supported and should be deleted. The fix is the smallest change, not the researcher's broader rewrite.

NYT primary: "Twelve Million Phones, One Dataset, Zero Privacy", Stuart A. Thompson and Charlie Warzel, NYT Opinion / Privacy Project, 19 Dec 2019 (https://www.nytimes.com/interactive/2019/12/19/opinion/location-tracking-cell-phone.html). The fetch tool refused it ("Claude Code is unable to fetch from www.nytimes.com"). This is the same barrier the researcher hit, and it is not worked round.

NYT text as quoted inside quotation marks by secondaries:
- beSpacific (https://www.bespacific.com/?p=73086): the Times "obtained one such file, by far the largest and most sensitive ever to be reviewed by journalists."; "It holds more than 50 billion location pings from the phones of more than 12 million Americans as they moved through several major cities."; "Each piece of information in this file represents the precise location of a single smartphone over a period of several months in 2016 and 2017."; "The data was provided to Times Opinion by sources who asked to remain anonymous because they were not authorized to share it and could face severe penalties for doing so."
- Pixel Envy (https://pxlnv.com/linklog/warzel-thompson-location-data/) gives the same two NYT sentences on the 50 billion pings and on 2016 and 2017.

So "obtained", "more than 50 billion location pings", "more than 12 million" phones and "several months in 2016 and 2017" all rest on NYT wording, not only on the TidBITS paraphrase.

"By name", the negative tested hardest:
- The NYT text quoted by Light Reading (Mike Dano, 19 Dec 2019, https://www.lightreading.com/carrier-security/report-blows-holes-in-anonymized-location-privacy-claims/a/d-id/756425) names a tracked person in only two cases. One is "It took minutes to identify him as Ben Broili, a manager now for Amazon Prime Air, a drone delivery service". Raw Story (https://www.rawstory.com/2019/12/our-jaws-hit-the-floor-why-a-shocking-new-report-on-cellphone-tracking-is-absolutely-terrifying/) reports the Times named and interviewed Broili and the singer Mary Millben. Neither is a military official, police officer or lawyer.
- The military-adjacent example is unnamed in the NYT's own words: "We spotted a senior official at the Department of Defense walking through the Women's March," and "His wife was also on the mall that day, something we discovered after tracking him to his home in Virginia." (via Light Reading).
- Police appear only in Light Reading's narration, not in NYT quotation marks, and are unnamed: "NYT was able to use its data to find the homes of two police officers who dealt with protesters on Inauguration Day."
- TidBITS (https://tidbits.com/2019/12/19/the-new-york-times-reveals-how-completely-our-every-move-is-tracked/, Adam Engst) says Thompson and Warzel "were able to track" numerous people "including military officials, law-enforcement officers, and high-powered lawyers". It says nothing about names.
- A search-engine summary, drawn from one of the unopened reprints listed above, said the Times stated it did not name anyone it identified without their permission. I have not read that sentence on a page and do not rely on it as a quote. It points the same way. Flag for the owner.
- Silicon UK (https://www.silicon.co.uk/workspace/location-data-track-trump-325645) says in its own words that the Times tracked people at the White House, Pentagon and similar sites, "ascertaining their home addresses and names". That is Silicon's paraphrase, largely about the follow-up "How to Track President Trump" piece. It shows reporters could identify people. It does not show they followed military officials, police and lawyers "by name" in print.

Conclusion: no reachable text supports "by name" for military officials, police or lawyers. The one military-adjacent person quoted from the NYT is unnamed.

On the researcher's rewording: the deletion is right, but the researcher also rewrote "followed military officials, police and lawyers" as "tracked people in positions of power, including military officials, law-enforcement officers and lawyers". That is more than is needed. "Military officials, police and lawyers" rests on TidBITS's paraphrase of the NYT and is fair to it.

Print (smallest change, delete "by name"): "In December 2019 the New York Times obtained a file of more than 50 billion location pings from over 12 million phones, covering several months of 2016 and 2017. Its reporters followed military officials, police and lawyers."

Source line [15]: the section 17 entry should give the NYT piece as the source, with its authors, date and URL. If the house keeps a reachable secondary, Light Reading or beSpacific quote the NYT verbatim, whereas TidBITS paraphrases.

---

## 3. One phone belonged to a Microsoft employee who visited an Amazon office and took a job there a month later [15]

**Skeptic verdict: AMENDED** (verdict only). The researcher's "could not open; secondary matches" is settled as holds, on NYT text quoted verbatim. The edition text needs no change.

NYT text quoted in quotation marks by Light Reading (https://www.lightreading.com/carrier-security/report-blows-holes-in-anonymized-location-privacy-claims/a/d-id/756425):
- "In one case, we observed a change in the regular movements of a Microsoft engineer."
- "He made a visit one Tuesday afternoon to the main Seattle campus of a Microsoft competitor, Amazon."
- "The following month, he started a new job at Amazon."

Silicon UK corroborates: "it tracked a Microsoft engineer who made a visit to Microsoft competitor Amazon" and "the following month, started a new job as a manager at Amazon."

Scope tests:
- "a month later" matches "The following month".
- "an Amazon office" is a fair shortening of "the main Seattle campus of ... Amazon".
- "employee" is a fair reading of "engineer".
- "One phone belonged to": the Times observed his movements in the phone dataset, so the phrasing is consistent.
- The NYT named him (Ben Broili). The edition does not name him, which is fine.

Print: no change. Optional precision: "a Microsoft engineer who visited Amazon's Seattle campus and started a job there the following month."

---

## 4. ODNI Senior Advisory Group report, January 2022, declassified June 2023: "includes information on nearly everyone"; "to cause harm to an individual's reputation, emotional well-being, or physical safety" [16]

**Skeptic verdict: UPHELD** (the researcher said "holds"). I add a primary for the declassification date, which the researcher could not read.

Reopened: https://www.dni.gov/files/ODNI/documents/assessments/ODNI-Declassified-Report-on-CAI-January2022.pdf. It now redirects through www.odni.gov to archive.dni.gov/files/ODNI/documents/assessments/ODNI-Declassified-Report-on-CAI-January2022.pdf, and I read the page images of that PDF.
- Title page: "(U) Office of the Director of National Intelligence / Senior Advisory Group / Panel on Commercially Available Information"; "(U) Report to the Director of National Intelligence / 27 January 2022". The cover letter is addressed to "The Honorable Avril Haines".
- Executive Summary, p. 2 running onto p. 3 (PDF pp. 9-10), verbatim: "Today, in a way that far fewer Americans seem to understand, and even fewer of them can avoid, CAI includes information on nearly everyone that is of a type and level of sensitivity that historically could have been obtained, if at all, only through targeted (and predicated) collection, and that could be used to cause harm to an individual's reputation, emotional well-being, or physical safety."
- Both phrases are verbatim and sit in unredacted text. The researcher's quote and page reference are correct.

Context test: the "nearly everyone" quote stops before the restrictive clause "that is of a type and level of sensitivity ...". Dropping it narrows rather than inflates the claim, and the sentence still says CAI includes information on nearly everyone. In the report, "that could be used" refers to that sensitive information, and the edition's "it could be used" stays within that meaning. No change.

Declassification date (better primary than search summaries):
- intel.gov CAI page (https://www.intel.gov/cai), SAG Report (2022): "Issued January 27, 2022. Declassified June 14, 2023."
- ODNI statement, readable at https://archive.dni.gov/index.php/newsroom/press-releases/press-releases-2023/3701-dni-haines-statement-on-declassified-report-on-commercially-available-information (the dni.gov URL now redirects to a general odni.gov newsroom page). Title "DNI Haines Statement on Declassified Report on Commercially Available Information", dateline June 14, 2023, News Release No. 15-23. It refers to Senator Wyden's request to review the report for classification and "release whatever is unclassified". The researcher said this body could not be read; it can be, at the archive host.
- Lawfare gives June 12, and the edition's own [16] (Fortune) is dated 13 Jun 2023, so press coverage came before the official date. "June 2023" is true on every count.

Print: no change. Recommend that [16] in section 17 cite the primary (the ODNI report PDF, with the intel.gov date line) instead of, or alongside, Fortune.

---

## Tally
Upheld 2 (claims 1, 4). Amended 2 (claims 2, 3). Overturned 0.
