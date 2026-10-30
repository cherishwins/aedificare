# Skeptic, lane 1: FBI admission, the bill, Chatrie

Researcher's file: /home/user/aedificare/research/the-night-pin/lane-1.md
Edition text: /home/user/aedificare/source/the-night-pin.web.md (sections 00, 14, 17).
Read date for everything below: 2026-10-30.

Access notes: these returned HTTP 403 to WebFetch: intelligence.senate.gov/2026/03/17/open-hearing-worldwide-threats-2/, congress.gov/bill/119th-congress/house-bill/7901 and lee.senate.gov/2026/3/lee-introduces-bipartisan-government-surveillance-reform-act. CourtListener returned 401 (API) and 403 (web). None was worked around. The WebFetch tool caps verbatim quotes at about 125 characters, so long quotes below were rebuilt from consecutive fragments. Where I say "verbatim", the tool returned the text inside quotation marks. I read the Chatrie slip opinion as page images of the PDF, saved by WebFetch from supremecourt.gov.

## Summary

| # | Claim | Researcher | Skeptic |
|---|---|---|---|
| 1 | Wyden/Patel exchange, quote | holds | amended (quote ending and punctuation; forum confirmed; "under oath" unsupported) |
| 2 | First since 2023, from data brokers | overstated | overturned (the source does say "data brokers"); attribute to Politico |
| 3 | No warrant needed; untested in court | overstated | amended ("use", not "buy"; date the negative; add the Aug 2026 source) |
| 4 | GSRA, March 2026, warrant before buying | overstated | amended (bicameral 12 Mar 2026 reintroduction of a 2023 bill; text is an LE purchase ban plus an IC court-order requirement) |
| 5 | Chatrie | overstated | amended (the researcher's good-faith finding is overturned: footnote 4 sends good faith back; remand is to the Fourth Circuit) |

---

## 1. 18 March 2026 Wyden/Patel exchange and the Patel quote

Researcher's verdict: holds (transcript not opened).
My verdict: **amended**. The event, date, non-commitment and forum hold. The quote's ending does not keep its source's punctuation. A transcript exists and the researcher did not find it.

Evidence:
- TechCrunch [01], Zack Whittaker, "11:32 AM PDT, March 18, 2026". https://techcrunch.com/2026/03/18/fbi-is-buying-location-data-to-track-us-citizens-kash-patel-wyden/
  - Quote opening, verbatim: "We do purchase commercially available information that is consistent with the Constitution and the laws under the Electronic..."
  - Quote ending, verbatim: "and it has led to some valuable intelligence for us," Patel testified Wednesday.
  - The fetch tool paraphrased "uses all tools … to do our mission" in the context of Wyden asking whether the bureau would pledge to stop buying Americans' location data. The researcher's file quotes the same fragment.
- Rev, commercial transcript "Senate Intelligence Hearing on 3/18/26", posted 19 Mar 2026. https://www.rev.com/transcripts/senate-intelligence-hearing-on-3-18-26 . It is not an official record, but it is closer to the primary than [01]. The researcher did not find it.
  - [01:08:49] Wyden quotes Wray's 2023 testimony, "To my knowledge, we do not currently purchase commercial database information that includes location data", then asks verbatim: "And if so, can you commit this morning to not buying Americans' location data?"
  - [01:09:14] Patel, verbatim fragment: "We do purchase commercially available information that's consistent with the Constitution and the laws"
  - The transcript refers to "this committee", Chairman Cotton and Vice Chairman Warner, which fixes the forum as the Senate Select Committee on Intelligence.
- The Register, 19 Mar 2026. https://www.theregister.com/2026/03/19/fbi_patel_location_data/
  - "told the Senate Select Committee on Intelligence Wednesday"
  - Patel's sentence continues past the point where TechCrunch stops: "it has led to some valuable intelligence for us to be utilized with our private partner sector."
  - FBI to The Register: "the Director made no mention of location data."
- A search-index snippet of the committee's own listing gives "March 18, 2026 10:00 am", "Hart 216". The page itself returned 403 to the fetch.

Findings:
- Forum: an open Worldwide Threats hearing of the Senate Select Committee on Intelligence. Rev, The Register and Yahoo all say so. The committee's own page is 403.
- "Under oath" (the PDF's wording): no primary I read records an oath. TechCrunch says "testified". The Register says nothing about an oath (fetch: the article "does not say whether Patel or Wray testified under oath"). Only Yahoo says "under oath". Without the committee record, the PDF should drop "under oath" or attribute it to Yahoo. The researcher is upheld on this point.
- The quote's punctuation and wording: Patel's sentence did not end at "for us". TechCrunch prints "for us," and attributes it with "Patel testified Wednesday". The edition closes the quote with a full stop inside the quotation marks, which changes the source's punctuation and implies the sentence ended there. Two transcriptions (Rev, The Register) render "that's" where TechCrunch has "that is". Unofficial transcripts and a news report disagree, and the official video or record was not reachable, so the exact wording stays unsettled. Keep TechCrunch's wording, since it is the cited source, and mark the truncation.
- Scope: the FBI told The Register that Patel "made no mention of location data". The edition does not claim he did, so it stands. But section 00's next line, "What follows is the stack that sentence refers to", should not be read as Patel confirming location-data purchases. Flag for the owner.

Print (smallest change):
On 18 March 2026, at an open hearing of the Senate Intelligence Committee, Senator Ron Wyden asked the director of the FBI whether the Bureau would commit to not buying Americans' location data. Kash Patel did not commit. He said the FBI "uses all tools" to do its mission, and then: "We do purchase commercially available information that is consistent with the Constitution and the laws under the Electronic Communications Privacy Act, and it has led to some valuable intelligence for us …" [01]
(Optionally add a source line for the Rev transcript.) The PDF's "under oath" should go, or be attributed to Yahoo.

---

## 2. "It was the first time since 2023 that the FBI had confirmed buying from data brokers."

Researcher's verdict: overstated, on the ground that the source "does not say 'from data brokers'".
My verdict: **overturned** (the researcher's scope objection fails), with the edition **amended** only to attribute the claim.

Evidence:
- TechCrunch [01]. The full sentence, rebuilt from two verbatim fragments: "This is the first time since 2023 that the FBI has confirmed it was buying access to people's data collected from data..." and "...who source much of their information — including location data — from ordinary consumer phone apps and games, per Politico." The fetch confirmed the sentence ends "per Politico," and links to Politico's reporting. https://techcrunch.com/2026/03/18/fbi-is-buying-location-data-to-track-us-citizens-kash-patel-wyden/
- So the source does say "data brokers". The researcher's fetch cut the sentence short after "people's data", and the scope note rests on that truncation.
- The Register frames 2023 differently: the exchange "recalled the first time an FBI director made such an admission back in 2023", when Wray said the FBI had bought location data at some point but had stopped. https://www.theregister.com/2026/03/19/fbi_patel_location_data/ . The 2023 confirmation was of past buying. The 2026 one is of current buying. The edition's wording, "first time since 2023 that the FBI had confirmed buying", is consistent with that.
- Negative test (no confirmation between 2023 and March 2026): two targeted searches turned up no FBI confirmation in 2024 or 2025. Every outlet found traces the "first since 2023" characterisation to Politico. That is a search of news results, not a records search.
- Primary: I did not find Politico's article in search results, so the characterisation is Politico's, relayed by TechCrunch. One source.
- Caveat: an FBI spokesperson, per a FedScoop/search snippet, said "The Director did not state the FBI is purchasing Americans' location data". The Register prints "the Director made no mention of location data." This does not touch "buying from data brokers", which the edition keeps general.

Print (smallest change):
According to Politico, it was the first time since 2023 that the FBI had confirmed buying access to data from data brokers. [01]

---

## 3. "The Bureau holds that data it pays for needs no warrant. No court has tested that theory." (also section 14, "Not decided")

Researcher's verdict: overstated. Rewording: "TechCrunch reports that the FBI says it does not need a warrant to buy such data, and that the theory has not been tested in court."
My verdict: **amended**. The researcher's verdict stands, but the rewording misstates the source ("to buy" where TechCrunch has "to use"). The negative can now be dated and given a later source.

Evidence:
- TechCrunch [01], verbatim: "The FBI claims it does not need a warrant to use this information for federal investigations; though this legal theory has not yet been tested in court." https://techcrunch.com/2026/03/18/fbi-is-buying-location-data-to-track-us-citizens-kash-patel-wyden/
  - The researcher quoted a fetch-tool paraphrase as if it were the source's sentence. Above is the actual sentence.
  - TechCrunch's sentence is about using the information without a warrant, not buying it. The claim is TechCrunch's, as of 18 March 2026.
- The FBI's own position, in Patel's words (TechCrunch): the purchases are "consistent with the Constitution and the laws under the Electronic Communications Privacy Act". That is the Bureau's stated legal footing. It does not use the word "warrant". An FBI spokesperson "declined to comment beyond Patel's remarks" (TechCrunch, per fetch).
- Negative hunt (has any court tested it?):
  - Richard Resch, "Surveillance for Sale: The Data Broker Loophole and the Fourth Amendment After Chatrie", Criminal Legal News, August 2026 issue. https://www.criminallegalnews.org/news/2026/jul/1/surveillance-for-sale-the-data-broker-loophole-and-the-fourth-amendment-after-chatrie/
    - Verbatim: "As of this publication, no court appears to have squarely resolved whether the government violates the Fourth Amendment"
    - Verbatim: "No court appears to have squarely resolved that specific practice."
    - Verbatim: Chatrie "does not resolve the data-broker question directly."
    - Of the cases it names (Carpenter, Chatrie, United States v. Smith (5th Cir. 2024), Miller, Smith v. Maryland, Jones), none involved a purchase.
  - Targeted searches for any suppression ruling on Fog Reveal or other purchased location data found none. EFF, POGO and the Richmond JOLT pieces describe the question as unsettled.
  - CourtListener's search returned 401 (API) and 403 (web) to WebFetch. Not worked around. No case-law database search was completed, so the negative rests on secondary commentary through August 2026. It is hedged ("appears"), not proven.
  - The Chatrie opinion itself (claim 5) concerns a geofence warrant served on Google, not a purchase. Footnote 11 of the opinion reserves exigent-circumstance warrantless searches. Nothing in the pages I read addresses purchased data.
- Scope: "tested" is wider than "squarely resolved". A trial court could have ruled on a narrow motion that commentators missed. The edition's flat "No court has tested that theory" is stronger than either source.

Print (smallest change):
Section 00: "The Bureau holds that it needs no warrant to use the data it buys. As of March 2026 that theory had not been tested in court. [01]"
Section 14 "Not decided": "Whether buying the same kind of data is a search. The FBI's position that it needs no warrant to use purchased data had not been tested in court as of March 2026 [01], and as of August no court appeared to have squarely resolved it. [Criminal Legal News, Aug 2026]"

---

## 4. Government Surveillance Reform Act: "introduced in March 2026, would require a court-authorised warrant before federal agencies buy Americans' information from data brokers"

Researcher's verdict: overstated. The researcher used the House text only, did not open the Senate text, and did not check for reintroduction.
My verdict: **amended**. The date holds. The bill is bicameral and an updated reintroduction. The operative text is a purchase ban for law enforcement plus a court-order requirement for intelligence agencies, not a single "warrant before buying" rule for all federal agencies.

Evidence:
- Senate bill, S. 4082, 119th Cong., 2d Sess., as introduced (GovInfo). https://www.govinfo.gov/content/pkg/BILLS-119s4082is/html/BILLS-119s4082is.htm
  - Date line, verbatim: "March 12, 2026"
  - Sponsor line, verbatim: "Mr. Wyden (for himself, Mr. Lee, Ms. Warren, and Ms. Lummis) introduced the following bill"
  - Short title: "Government Surveillance Reform Act of 2026"
  - Sec. 201 heading: "PROHIBITION ON FEDERAL LAW ENFORCEMENT PURCHASE OF PERSONAL DATA FROM DATA BROKERS". New 18 U.S.C. 2702(e)(2)(A)(i): a Federal law enforcement agency "may not obtain in exchange for anything of value covered personal data if--". Exceptions (per fetch) cover compilations that cannot be separated, whistleblower awards, statutory compulsory process with cost reimbursement (e.g. 18 U.S.C. 2706), employment, consented background checks, and lawfully obtained public data. The last exception "does not apply to biometric or location information" (fetch paraphrase). A warrant is not an exception that unlocks purchase. Law enforcement would have to use compulsory process instead.
  - Sec. 404 "PROHIBITION ON INTELLIGENCE ACQUISITION OF UNITED STATES PERSON DATA", verbatim: "an element of the intelligence community may not acquire a dataset that includes covered data." The exception, verbatim fragments: data "has been authorized for collection pursuant to an order or emergency authorization pursuant to the Foreign Intelligence Surveillance Act of 1978" "or the Federal Rules of Criminal Procedure by a court of competent jurisdiction covering the period of the acquisition." For intelligence agencies, the bill does work as a court-authorisation requirement.
  - Sec. 608, "Consistent Privacy Protections for Data Held by Data Brokers": compelled disclosure from such organisations needs a court order ("A court may only issue an order requiring a covered organization", verbatim fragment).
- House companion, H.R. 7901, dated 12 March 2026, "Mr. Davidson (for himself, Ms. Lofgren, Ms. Jayapal, and Ms. Jacobs)" (researcher's reading of https://www.govinfo.gov/content/pkg/BILLS-119hr7901ih/html/BILLS-119hr7901ih.htm, not re-fetched; Sec. 201 matches the Senate text).
- Sponsors' release: Lofgren, 13 Mar 2026, "Lofgren, Davidson, Wyden, and Lee Introduce Bipartisan FISA Reform Bill to Protect Americans' Constitutional Rights". https://lofgren.house.gov/media/press-releases/lofgren-davidson-wyden-and-lee-introduce-bipartisan-fisa-reform-bill-protect
  - Verbatim: the sponsors "introduced an updated version of the Government Surveillance Reform Act."
  - Verbatim: the bill "bans the federal government from buying Americans' data from data brokers without a warrant."
  - Verbatim: it "requires federal law enforcement to get a warrant to surveil Americans' location information,"
  - Names the sponsors as Lofgren and Davidson (House) and Wyden and Lee (Senate), with Warren and Lummis (Senate) and Jacobs and Jayapal (House) as cosponsors. The researcher wrote "first name not checked" for Davidson: he is Rep. Warren Davidson (R-OH).
  - The researcher said the Lofgren one-pager was blocked. This press release opened.
- Earlier version: Government Surveillance Reform Act of 2023, S. 3234, 118th Cong., 1st Sess., introduced "November 7, 2023" (GovInfo, https://www.govinfo.gov/app/details/BILLS-118s3234is ). House companion H.R. 6262, introduced the same day by Rep. Davidson (search results: govinfo BILLS-118hr6262ih, Jurist Nov 2023). The researcher's "Reintroduction: not checked … 'introduced' word is correct" missed this.
- TechCrunch [01]'s wording, which the edition copies: the bill "would require a court-authorized warrant before federal agencies can buy Americans' information from data brokers". That is the outlet's (and sponsors') gloss, not the text.
- Status: GovInfo carries only the "is"/"ih" (introduced) versions. A search snippet reports S. 4082's latest action as "Read twice and referred to the Committee on the Judiciary." congress.gov is 403. "It has not passed" is consistent with this but not confirmed from congress.gov.
- Date: 12 March 2026 in both chambers' texts. Lee's release (403, per its search title and snippet) is also 12 March. The "23 March" in some secondaries is wrong.

Print (smallest change):
"The Government Surveillance Reform Act, an updated version of a 2023 bill reintroduced in both chambers on 12 March 2026 by Senators Wyden and Lee and Representatives Davidson and Lofgren, would bar federal law enforcement from buying Americans' personal data from data brokers and bar intelligence agencies from acquiring it without a court order or warrant. It has not passed. …"
If the edition wants the sponsors' gloss instead, attribute it: "…which its sponsors say "bans the federal government from buying Americans' data from data brokers without a warrant."" [Lofgren release, 13 Mar 2026]

---

## 5. Chatrie v. United States, 29 June 2026

Researcher's verdict: overstated. The researcher said good faith "was not a question the Court sent back", and the rewording dropped good faith.
My verdict: **amended**. Holding, date and author hold. The researcher's good-faith finding is **overturned**: the opinion expressly leaves good faith to the Fourth Circuit. The edition's "lower courts" should be "the Fourth Circuit", and probable cause should sit beside particularity. [17] should be replaced by the opinion.

Evidence (slip opinion, Chatrie v. United States, No. 25-112, https://www.supremecourt.gov/opinions/25pdf/25-112_0am4.pdf , read as page images):
- Syllabus p. 1, verbatim: "No. 25–112. Argued April 27, 2026—Decided June 29, 2026"
- Syllabus p. 2, Held, verbatim: "Police officers conducted a Fourth Amendment search when they acquired Chatrie's location data from Google because an individual has a reasonable expectation of privacy in his cell-phone location information."
- Opinion p. 29, verbatim: "For all those reasons, we hold that police officers invade a cell-phone user's reasonable expectation of privacy when they access his Location History."
- Geofence: opinion p. 1, verbatim: "The geofence warrant at issue here was directed to Google, and used to solve a bank robbery." The data was Google "Location History" (opinion p. 3). The radius was 150 meters, with one hour at step one and two hours at step two (opinion pp. 7-8).
- Good faith, opinion p. 10, footnote 4, verbatim: "In line with our grant of certiorari, we do not address whether the good-faith exception to the exclusionary rule still allows the admission of the Location History data in this case. That question remains for the Fourth Circuit to consider anew, gleaning anything it thinks relevant from our decision on the substantive Fourth Amendment issues." The same footnote also says, verbatim: "the Fourth Circuit may now consider anew, after review of our opinion, how the good-faith exception applies here."
  - The researcher left opinion pp. 6-30 unread and said "I cannot rule out a passing good-faith reference". This footnote is that reference, and it is not passing.
- Particularity and probable cause, opinion p. 32, verbatim: "It is therefore now up to the Court of Appeals to decide whether, at each step of the search process, the warrant satisfied the Fourth Amendment's requirements of particularity and probable cause."
- Disposition, opinion p. 33, verbatim: "For the reasons stated, we vacate the judgment of the Court of Appeals and remand the case for further proceedings consistent with this opinion." Syllabus p. 5: "136 F. 4th 100, vacated and remanded."
- Opinions, syllabus p. 5, verbatim: "KAGAN, J., delivered the opinion of the Court, in which ROBERTS, C. J., and SOTOMAYOR, KAVANAUGH, and JACKSON, JJ., joined. JACKSON, J., filed a concurring opinion, in which SOTOMAYOR, J., joined. GORSUCH, J., filed an opinion concurring in the judgment. ALITO, J., filed a dissenting opinion, in which THOMAS, J., joined as to Part I, and in which BARRETT, J., joined as to Parts II–B, II–C–1, and II–C–2. BARRETT, J., filed a dissenting opinion." The researcher's list omits Jackson's concurrence. The vote in the judgment is 6-3: five join Kagan, plus Gorsuch concurring in the judgment, against Alito, Thomas and Barrett.
- Cert scope, opinion p. 9, verbatim: "We granted certiorari solely on the question whether the police violated the Fourth Amendment in obtaining Chatrie's location data, thus declining to consider the exclusionary-rule issue."

Findings:
- "Went back to the lower courts": the remand is to one court, the Court of Appeals for the Fourth Circuit. "Lower courts" is loose. "The Fourth Circuit" is exact.
- "Warrant particularity and good faith": both were left to the Fourth Circuit, along with probable cause. The edition omits probable cause. The researcher wrongly removed good faith.
- "A person's phone location data": the Held line says "Chatrie's location data". The opinion's broader holding is about a user's "Location History". Naming the geofence warrant gives the reader the facts without changing the holding.
- [17] is Wikipedia. Replace it with the slip opinion.

Print (smallest change):
"**Decided.** On 29 June 2026 the Supreme Court held in *Chatrie v. United States* that police "conducted a Fourth Amendment search when they acquired Chatrie's location data from Google", in this case through a geofence warrant. Justice Kagan wrote for the Court; the vote was 6–3. Whether the warrant met the particularity and probable-cause requirements at each step, and whether the good-faith exception still lets the evidence in, went back to the Fourth Circuit. [17]"
Source 17 should read: "17. Supreme Court of the United States, Chatrie v. United States, No. 25-112, decided 29 Jun 2026 (slip opinion). https://www.supremecourt.gov/opinions/25pdf/25-112_0am4.pdf"
