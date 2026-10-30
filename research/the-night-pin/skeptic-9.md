# Skeptic, lane 9: Section 702 and the bill (The Night Pin, 30 Oct 2026)

Checked against research/the-night-pin/lane-9.md. Edition text: the user's attached 02-ed11-the-night-pin.web.md (21 sources; the section 14 "Pending" paragraph and sources 20 and 21 match source/the-night-pin.web.md). Read 2026-10-30. Not committed.
Walls hit and left alone: congress.gov 403; lee.senate.gov 403; npr.org 503. No Anthropic characterisation appears in this lane.
Tally: upheld 2 (claims 3, 4), overturned 0, amended 3 (claims 1, 2, 5).

## 1. "The Government Surveillance Reform Act, introduced in March 2026, would require a court-authorised warrant before federal agencies buy Americans' information from data brokers. It has not passed." [01][20][21]
Researcher: wrong. True as "introduced in the House in March 2026, would bar federal law enforcement agencies from buying ... with exceptions. It has not passed."
Skeptic verdict: AMENDED. The researcher is right that the text has no warrant route to a purchase, but three points are missing or wrong.

Evidence:
- The bill is bicameral, not House-only. Senate: S. 4082, govinfo record https://www.govinfo.gov/app/details/BILLS-119s4082is : "Chamber: Senate"; "Date introduced: March 12, 2026"; "Sponsor: Ron Wyden(OR)"; "Cosponsors: Mike Lee (UT); Elizabeth Warren (MA); Cynthia M. Lummis (WY)"; "Last action date: March 12, 2026". House: H.R. 7901, https://www.govinfo.gov/app/details/BILLS-119hr7901ih : "Date introduced: March 12, 2026"; "Sponsor: Warren Davidson(OH)"; "Last action date: March 12, 2026". Source 01 (TechCrunch, 18 Mar 2026) already says "a bipartisan, bicameral bill". So "introduced in the House" in the researcher's rewording is too narrow. "Introduced in March 2026" holds (12 Mar 2026, both chambers).
- Purchase rule (confirmed in both texts): S. 4082 Sec. 201, https://www.govinfo.gov/content/pkg/BILLS-119s4082is/html/BILLS-119s4082is.htm , "SEC. 201. PROHIBITION ON FEDERAL LAW ENFORCEMENT PURCHASE OF PERSONAL DATA FROM DATA BROKERS." and "a Federal law enforcement agency may not obtain in exchange for anything of value covered personal data if--". The exceptions in clauses (ii)-(vii) include no warrant or court-order exception. The same holds for H.R. 7901.
- The researcher read only the first 100,000 of 269,944 characters. I read the rest of H.R. 7901 (https://www.govinfo.gov/content/pkg/BILLS-119hr7901ih/html/BILLS-119hr7901ih.htm , offsets 100000 and 185000-200000+). It adds two things the rewording leaves out:
  - Sec. 404 (intelligence community): "an element of the intelligence community may not acquire a dataset that includes covered data." Its exception is for data "authorized for collection pursuant to an order or emergency authorization" under FISA or the Federal Rules of Criminal Procedure. The rule reaches intelligence agencies, not only "Federal law enforcement", and its exception is court-authorised. The text does not say "purchase" or "data broker", and "acquire" is undefined.
  - Sec. 608, "Consistent Privacy Protections for Data Held by Data Brokers" (new 18 U.S.C. 2703(n)): the government "may not require a covered organization that is not an online service provider to disclose covered personal data" unless it obtains an order, and "a court shall apply the most stringent standard under Federal statute or the Constitution of the United States". This is a court-order rule for compelling brokers to disclose. It is not a warrant route to buy.
- Sponsors' release (Lofgren, 13 Mar 2026), https://lofgren.house.gov/media/press-releases/lofgren-davidson-wyden-and-lee-introduce-bipartisan-fisa-reform-bill-protect : "bans the federal government from buying Americans' data from data brokers without a warrant." The edition's warrant wording is how the sponsors and TechCrunch describe the bill. The bill text itself bans purchases and moves access to warrant- or order-based compulsion. The researcher said this release was not opened (404); it opens without www.
- Source 01, TechCrunch, https://techcrunch.com/2026/03/18/fbi-is-buying-location-data-to-track-us-citizens-kash-patel-wyden/ : "which among other things would require a court-authorized warrant before federal agencies can buy Americans' information" "from data brokers." The edition's sentence is TechCrunch's characterisation, not the text.
- "Has not passed": the govinfo last action for both bills is 12 Mar 2026. The Primary, 27 Oct 2026, https://theprimary.com/government/2026-10-27/section-702-fisa-deadline : "Section 702 technically expired in June when Congress failed to reauthorize it". Tapestry, 21 Aug 2026, https://tapestry.news/tech/data-broker-location-sales/ : "Congress still hasn't passed a federal law closing the data broker loophole." congress.gov could not be read (403), so a live status check was not possible.

Print: "The Government Surveillance Reform Act, introduced in both chambers in March 2026, would bar federal law enforcement agencies from buying Americans' information from data brokers, with narrow exceptions, and would restrict intelligence agencies' acquisition of it. It has not passed."
(If the warrant framing is kept, attribute it: its sponsors say it "bans the federal government from buying Americans' data from data brokers without a warrant.")

## 2. "Its vehicle is the renewal of Section 702 of FISA." [20][21]
Researcher: overstated, because other 702 vehicles existed. True as "would reauthorize Section 702 for four years and would separately bar federal law enforcement purchases of data from brokers."
Skeptic verdict: AMENDED. The researcher's reasoning is off target, but the rewording direction is right.

Evidence:
- The sentence says the GSRA's vehicle is the renewal. It does not say the GSRA is the only renewal vehicle, so the existence of H.R. 8322, the 30 Apr extension, H.R. 9238 and the GOP leadership proposals does not contradict it.
- The real problem is "vehicle." The GSRA does not ride on a separate renewal bill. It is a renewal bill itself. H.R. 7901 table of contents: "Sec. 111: Four-year extension of Section 702", with the sunset moved to "effective April 20, 2030". Title II, the "Fourth Amendment Is Not For Sale Act", sits in the same bill (govinfo URL above). Sponsors' release (Lofgren, URL above): "reauthorizing and reforming Section 702" and "reauthorizes Section 702 for four years." Endorser Goodlatte (PPSA) in the same release says it "should be included in the reauthorization of FISA Section 702 in April."
- Source 20, Proton, https://proton.me/blog/fisa-702-expiring-surveillance-reform : "would require a warrant before agencies can search Americans' data collected under Section 702." Source 21 (Brennan, updated 27 Oct 2026) does not name the GSRA. It does list the 19 Mar 2026 "Coalition of Over 130 Organizations Urges Congressional Leadership Not to Reauthorize Section 702 Without Closing the Data Broker Loophole", which supports the idea that the broker ban is tied to 702 renewal.
- The Primary (27 Oct 2026, URL above) names the NDAA as a possible renewal vehicle and says "Current drafts of the defense bill in both chambers do not contain language reauthorizing the surveillance statute."

Print (smallest change; the rest of the sentence stays): "It is written as a four-year renewal of Section 702, the government's warrantless foreign-intelligence surveillance law, which lapsed ..."

## 3. "Section 702 lapsed in June 2026 after Congress failed to agree on reauthorization." [20][21]
Researcher: holds.
Skeptic verdict: UPHELD. The edition sentence stands as printed. The evidence is upgraded to primaries, and one source error is flagged.

Evidence:
- House Clerk, Roll Call 221, https://clerk.house.gov/Votes/2026221 : "Jun 11, 2026, 10:34 AM"; "H. R. 9238"; "On Motion to Suspend the Rules and Pass"; "2/3 Yea-And-Nay"; "Failed"; Yeas "198", Nays "218". This primary replaces the researcher's reliance on Recording Law.
- CRS Legal Sidebar LSB11444, 22 Jun 2026, https://www.everycrsreport.com/reports/LSB11444.html : "This provision was automatically repealed on June 12, 2026, pursuant to the FISA Amendment Act of 2008", as amended by Public Law 119-87 (the last extension).
- Brennan one-pager, 22 Sep 2026, https://www.brennancenter.org/media/16217/download/bcj-702-march-2027-deadline-one-pager-9.22.26.pdf : "Section 702 of the Foreign Intelligence Surveillance Act expired on June 12, 2026".
- Extension path: H.R. 8322 enrolled (govinfo, https://www.govinfo.gov/app/details/BILLS-119hr8322enr) extends title VII "through April 30, 2026"; last action 18 Apr 2026; no public law number is shown on the page. Roll Call, 30 Apr 2026, https://rollcall.com/2026/04/30/congress-clears-short-term-fisa-extension/ : extends Section 702 "through June 12"; "The final tally was 261-111"; the Senate passed it by voice vote the same day. The RISAA sunset of 20 April 2026 is consistent with the sponsors' release ("ahead of the April 20 expiration date") and with GSRA Sec. 111's "April 20, 2030".
- Senate side: Proton says "Senate Democrats blocked a parallel effort hours later". Brennan lists "X thread on the Failed Section 702 Reauthorization Vote in the Senate" (5 Jun 2026). "Congress failed to agree" holds in both chambers.
- Source error to flag: Proton says "In a 218-to-198 vote on Friday". The Clerk record puts the vote on Thursday, 11 June 2026. The edition does not repeat the day, so nothing changes in print.
- No reauthorization since: Brennan's 26 Oct 2026 coalition letter "Urges Congress Not to Renew 702 ...", and The Primary (27 Oct) says it "technically expired in June when Congress failed to reauthorize it".

Print: as is. (Optional precision: "lapsed at midnight on 12 June 2026 ...")

## 4. "Existing authorizations run to March 2027." [20][21]
Researcher: holds, with "about 17 March 2027" and a note that the FISC date rests on secondary reporting.
Skeptic verdict: UPHELD. The Brennan one-pager the researcher saw only as a snippet is now opened directly.

Evidence:
- Brennan one-pager, 22 Sep 2026 (URL above): "The FISA Court approved the most recent certifications on March 17, 2026, locking in surveillance authority until March 17, 2027."
- The same one-pager: "Under Section 702(j)(5)(B), the mere filing of a final application for new certifications automatically extends the existing certifications pending the FISA Court's review." On this account, March 2027 is when the current certifications expire, not a hard end to collection.
- Source 20, Proton: "current FISA authorizations will continue unaffected, at least through March 17, 2027," (Raskin, reported).
- Caveat on the primary: CRS LSB11444: "As of this Sidebar's publication, no such order appears to have been published." It also says the government may operate under such orders "for up to one year following the orders' issuance." The FISC order itself is not public, so the 17 March date rests on Brennan and lawmakers.
- The Primary (27 Oct 2026): "collection continues under the court order issued in March."

Print: as is.

## 5. "As of late October 2026 no data-broker purchase restriction had been enacted." [21]
Researcher: overstated. True as "no federal law ... had been enacted that I could find. Montana enacted a state restriction in 2025."
Skeptic verdict: AMENDED. The negative was hunted. Federal: still none found. State: there is a second counterexample the researcher missed.

Evidence:
- Federal. No enacted law found. Tapestry, 21 Aug 2026 (URL above): "Congress still hasn't passed a federal law closing the data broker loophole." NPR (via OPB), Jude Joffe-Block, 24 Aug 2026, https://www.opb.org/article/2026/08/23/privacy-advocates-call-on-maryland-to-investigate-data-brokers/ , reports that Congress has not passed a law closing the "data broker loophole" (fetch summary; npr.org returned 503). Search found no FY2026 NDAA (P.L. 119-60) purchase restriction. The GSRA's last action is 12 Mar 2026. congress.gov Public Laws could not be searched (403), so this is "not found," not "confirmed none."
- State, missed by the researcher: Maryland, 2026 updates to the Maryland Online Data Privacy Act. OPB/NPR (URL above) reports that data brokers may not sell or share Marylanders' location data unless law enforcement has obtained a subpoena or warrant, and that "ICE must present a warrant"; the updates "took effect last month". Tapestry: "It bars data brokers from sharing residents' location data with law enforcement without a warrant or subpoena" and "bans sales to immigration enforcement without any judicial process." This restricts sales on the seller side, not government purchases directly. The statute was not opened.
- State, Montana: EFF, 14 May 2025, https://www.eff.org/deeplinks/2025/05/montana-becomes-first-state-close-law-enforcement-data-broker-loophole : "Montana has become the first state to close the data broker loophole."; "the government may not use money to get access to information about electronic communications". It names warrant, consent and "investigative subpoena" as the alternatives.
- The sentence's only citation is [21]. Brennan's page reports no enacted restriction, but it does not say that none exists, so the support rests on absence. NPR/OPB or Tapestry would be a better cite for the federal negative.
- "That I could find" belongs in notes, not in print.

Print: "As of late October no federal data-broker purchase restriction had been enacted." (If the owner wants the state picture: "...; Montana (2025) and Maryland (2026) restrict such sales to police at state level.")

## Open items
- congress.gov (H.R. 7901, S. 4082, H.R. 9238) 403: live bill status is from the govinfo records (last action 12 Mar 2026) and October reporting.
- P.L. 119-87 (the 30 Apr extension, per CRS) has not been opened.
- The Maryland 2026 statute text has not been opened. The details come from NPR (via OPB) and Tapestry.
- The FISC March 2026 order is not public (CRS).
