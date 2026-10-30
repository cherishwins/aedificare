# Lane 4: the bid request, CBP, ICE, the off switch

Edition: source/the-night-pin.web.md (The Night Pin, Aedificare, 30 Oct 2026). Sections 06, 07, 13, 16 and 17 (source 02).
Method: WebFetch of each primary, asking for verbatim sentences. WebFetch returns model-extracted text, so quotes were checked by re-asking for verbatim copy; they were not byte-compared against the page source. Where a page could not be read, the claim says so.

## 1. A bid request can carry the phone's advertising ID, GPS coordinates, IP address, device details, inferred interests and the app in use; every bidder receives it including losers. EFF quote: "it's almost impossible to know who receives it or control how it's used." [02]
Verdict: holds
Primary: Electronic Frontier Foundation, Lena Cohen and Hudson Hongo, "Targeted advertising gives your location to the government. Just ask CBP.", 5 Mar 2026 (section "How Real-Time Bidding Works"). https://www.eff.org/deeplinks/2026/03/targeted-advertising-gives-your-location-government-just-ask-cbp
Read: 2026-10-30
Quote: "The bid request may contain information like your unique advertising ID, your GPS coordinates, IP address, device details, inferred interests, demographic information, and the app or website you're visiting."
Quote: "A key vulnerability of real-time bidding is that while only one advertiser wins the auction, all participants receive data about the person who would see their ad."
Quote: "Once your information is broadcast through RTB, it's almost impossible to know who receives it or control how it's used."
True as: A bid request can carry the phone's advertising ID, GPS coordinates, IP address, device details, inferred interests and the app or website being used. Every bidder gets the data, including those who lose the auction.
Notes: EFF says "may contain", not "depending on permissions"; the edition's "depending on permissions" is its own gloss and is not in EFF. EFF says "app or website you're visiting", so "the app in use" is a close paraphrase. The EFF quote is verbatim as the edition gives it. The losing-bidder point is EFF's "all participants receive data".

## 2. Companies join auctions they never intend to win, keep the requests and sell what they collect ("bidstream data"). [02]
Verdict: overstated
Primary: Electronic Frontier Foundation, "Targeted advertising gives your location to the government. Just ask CBP.", 5 Mar 2026 (section "How Real-Time Bidding Works"). https://www.eff.org/deeplinks/2026/03/targeted-advertising-gives-your-location-government-just-ask-cbp
Read: 2026-10-30
Quote: "The highest bidder gets to display an ad for you, but advertisers (or the adtech companies that represent them) can collect your bidstream data regardless of whether or not they bid on the ad space."
Quote: "The information in bid requests is called "bidstream data" and typically includes identifiers that can be linked to real people."
Quote (on brokers): "As Venntel, one of the location data brokers that has sold to ICE, puts it" (sentence continues in the article).
True as: Advertisers and ad-tech firms can collect the bidstream data from an auction even when they do not win it (EFF: "regardless of whether or not they bid on the ad space"). Location data brokers have sold such data; EFF names Venntel as one that "has sold to ICE".
Notes: EFF supports "keep the requests" (non-winners collect the data). It does not say companies enter auctions they never intend to win as a practice, and it does not say bidstream requests are sold as such. The "sell" point is supported only for location brokers, not for bidstream data in general. "Bidstream data" as a term is defined by EFF as the information in bid requests.

## 3. CBP ran a 2019 to 2021 pilot using "commercially available marketing location data", including data sourced from ad auctions; CBP's own document says "RTB-sourced location data is recorded when an advertisement is served." [02] (Find the CBP document itself if EFF links it.)
Verdict: could not open (primary CBP document not read; the wording is supported by EFF's quotation of it)
Primary: CBP Privacy Threshold Analysis for an AdID efficacy pilot, as quoted by EFF (5 Mar 2026) from the document obtained by 404 Media. EFF links https://www.documentcloud.org/documents/27714350-adid-efficacy-pilot-pta/?ref=404media.co . A FOIA production copy is at https://assets.aclu.org/live/uploads/2022/07/2023-10-06-CBPs-Additional-Production.pdf (date of production 6 Oct 2023 per file name).
Read: 2026-10-30
Quote (EFF, quoting the CBP document): As CBP puts it, "RTB-sourced location data is recorded when an advertisement is served."
Quote (EFF): "this document is about a 2019-2021 pilot use of this data."
Quote (EFF): "sourced from the system powering nearly every ad you see online: real-time bidding (RTB)."
Quote (EFF, describing the document): the phrase "commercially available marketing location data." appears in EFF's opening section about the document.
True as: EFF reports that a CBP document about a 2019 to 2021 pilot says "RTB-sourced location data is recorded when an advertisement is served." The document's sources for the location data are SDKs and real-time bidding (RTB).
Notes: DocumentCloud returned HTTP 403 (not opened; not routed around). The ACLU PDF opened but its first three pages were redacted CBP slides with no readable text, and the PTA passage was not located in the time spent. A search for the exact sentence returned only secondary coverage (EFF, heise, Privacy Guides, LWN). The edition's "commercially available marketing location data" and the 2019 to 2021 dates are EFF's wording; the CBP PTA itself was not confirmed. The edition says "including data sourced from ad auctions"; EFF's account says two sources (SDKs and RTB), so "including" is accurate. Unresolved: the CBP document's exact title and date.

## 4. ICE bought the Webloc tool in 2025; it tracks millions of phones and can filter by advertising ID. [02]
Verdict: holds (on the secondary source; the primary 404 Media report was not opened)
Primary: Electronic Frontier Foundation, "Targeted advertising gives your location to the government. Just ask CBP.", 5 Mar 2026 (section "Advertising Surveillance Enables Government Surveillance"). https://www.eff.org/deeplinks/2026/03/targeted-advertising-gives-your-location-government-just-ask-cbp
Read: 2026-10-30
Quote: "Last year, ICE purchased a spy tool called Webloc that gathers the locations of millions of phones"
Quote: "Webloc also allows them to filter location data by the unique advertising IDs that Apple and Google assign to our phones."
True as: EFF says ICE bought the Webloc tool "last year" (in a March 2026 article, so 2025), that it gathers the locations of millions of phones, and that it can filter location data by advertising ID.
Notes: The year 2025 is inferred from "Last year" in a 5 Mar 2026 article; EFF gives no date. The edition's "tracks" is a paraphrase of "gathers the locations of". The 2025 date would be better sourced to a dated primary (contract record or the 404 Media report), which was not opened.

## 5. The claim that bidstream data shows "what they purchase via credit-card point-of-sale systems" is wrong; a bid request carries the ID, location, IP, device and app, not a receipt. [02] (Check OpenRTB's bid request spec, IAB Tech Lab, for whether any purchase data field exists.)
Verdict: not in the source (the quoted phrase does not appear in EFF; the rebuttal rests on the OpenRTB 2.6 spec, which supports it)
Primary: IAB Tech Lab, OpenRTB 2.6 specification (InteractiveAdvertisingBureau/openrtb2.x, 2.6.md, main branch; the version date was not shown in the fetched text). https://github.com/InteractiveAdvertisingBureau/openrtb2.x/blob/main/2.6.md (raw read at https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/refs/heads/main/2.6.md)
Read: 2026-10-30
Quote (OpenRTB 2.6, Device object): "ID sanctioned for advertiser use in the clear (i.e., not hashed)" (the ifa field)
Quote (OpenRTB 2.6, Device object): "Location of the device assumed to be the user's current location defined by a Geo object (Section 3.2.19)." (the geo field)
Quote (OpenRTB 2.6, Source object): "Transaction ID that must be common across all participants in this bid request" (the tid field; a request-tracing ID, not a purchase)
Quote (OpenRTB 2.6, Bid object): "Bid price expressed as CPM although the actual transaction is for a unit impression only."
True as: A bid request carries the ID, location, IP, device and app. The OpenRTB 2.6 standard has no field for a purchase or a receipt.
Notes: EFF does not contain "credit card", "point-of-sale", or "purchase" in the sense of consumer transactions (checked by fetch; the word "purchased" appears only for ICE buying Webloc). So the edition's quotation "what they purchase via credit-card point-of-sale systems" is not in [02]; the citation for that quote needs a different source or should be dropped. The OpenRTB 2.6 spec was read in two fetches covering the whole document (the summarising model reported no field matching purchase, receipt, point of sale, credit card or card, and reported the BidRequest attribute list: id, imp, site, app, dooh, device, user, test, at, tmax, wseat, bseat, allimps, cur, wlang, wlangb, acat, bcat, cattax, badv, bapp, source, regs, ext). This was a read by summary, not a full-text search, so the "no field" finding is a finding from reading, not a grep. Only version 2.6 was checked; later OpenRTB versions were not.

## 6. Off switch: Android Settings > Privacy > Ads > Delete advertising ID (path varies); iPhone Settings > Privacy & Security > Tracking > turn off Allow Apps to Request to Track; give location only while in use and approximate where possible. [02] (Check against Google's and Apple's own support pages.)
Verdict: overstated (the iPhone path holds; the Android "path varies" and the location advice are narrower than the sources)
Primary (Android): Google, "Ads" policy page (policies.google.com/technologies/ads, English), undated in fetched text. https://policies.google.com/technologies/ads?Hl=en
Primary (iPhone): Apple Support, "If an app asks to track your activity" (support.apple.com/102420), "Published Date: December 19, 2025". https://support.apple.com/en-us/102420
Primary (location): EFF, 5 Mar 2026, section "What You Can Do To Protect Yourself". https://www.eff.org/deeplinks/2026/03/targeted-advertising-gives-your-location-government-just-ask-cbp
Read: 2026-10-30
Quote (Google): "On your Android device, go to Settings." "Tap Privacy > Ads." "Tap Delete advertising ID and confirm your changes."
Quote (Google, older Android, 4.4 or older): "If your Android device's version is 4.4 or older:" then "Tap Privacy > Advanced > Ads" and "Turn on Opt out of Ads Personalization and confirm your changes."
Quote (Google, TV): "In Android TV, partners have the freedom to adapt the Settings path."
Quote (Apple): "On iPhone or iPad: Go to Settings, then tap Privacy & Security, then tap Tracking."
Quote (Apple): "If you turn off "Allow Apps to Request to Track" in Privacy & Security settings, you won't get prompts from apps that want to track your activity."
Quote (EFF): "If you can't disable location access completely for an app, limit it to only when you have the app open"
Quote (EFF): "or only approximate location instead of precise location."
Quote (EFF): "make sure you're only granting location permission to apps that really need it in order to function."
True as: Android: Settings > Privacy > Ads > Delete advertising ID, per Google's steps for current Android phones (Android 4.4 or older uses a different route, and Android TV partners may adapt the path). iPhone: Settings > Privacy & Security > Tracking, then turn off Allow Apps to Request to Track. For apps that need location, limit it to while the app is open, or choose approximate location instead of precise location.
Notes: Google's page gives one path for current phones and does not say the path varies by manufacturer; the edition's "(path varies)" and the source-list line "The exact path varies by manufacturer" are not supported. Apple's page confirms the iPhone path and the toggle name. EFF frames location limits as the fallback "if you can't disable location access completely for an app" and advises granting location only to apps that "really need it"; the edition's "Every app" framing drops that condition. The edition's "about a minute" is not sourced.
