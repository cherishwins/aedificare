# Skeptic, lane 4: the bid request, CBP, ICE, the off switch

Checks: research/the-night-pin/lane-4.md against source/the-night-pin.web.md (The Night Pin, Aedificare, 30 Oct 2026), sections 06, 07, 13, 16, 17.
Method: WebFetch of each page (model-extracted text, re-asked for verbatim copy); PDFs read as page images. Read: 2026-10-30.
Walls recorded, not worked round: DocumentCloud (HTTP 403), Techdirt repost of EFF (HTTP 403), 404 Media (both articles "for paid members only" after the lede).

## General finding (affects every [02] claim): the source title is wrong

The edition's source 02 and the researcher both give the title as "Targeted advertising gives your location to the government. Just ask CBP." That is the URL slug. The page's headline and HTML title are:
"The Government Uses Targeted Advertising to Track Your Location. Here's What We Need to Do." (byline "By Lena Cohen and Hudson Hongo", "March 5, 2026")
https://www.eff.org/deeplinks/2026/03/targeted-advertising-gives-your-location-government-just-ask-cbp
Section 17 should say: 02. Electronic Frontier Foundation, Lena Cohen and Hudson Hongo, 5 Mar 2026. The Government Uses Targeted Advertising to Track Your Location. Here's What We Need to Do. (URL unchanged)

## 1. Bid request contents; every bidder receives it; EFF "almost impossible" quote [02]
Researcher: holds; dropped "depending on permissions" as the edition's own gloss.
Skeptic: **amended**

Upheld: all three EFF quotes are on the page as given.
- "The bid request may contain information like your unique advertising ID, your GPS coordinates," (continues: IP address, device details, inferred interests, demographic information, and the app or website)
- "A key vulnerability of real-time bidding is that while only one advertiser wins the auction, all participants receive data about the person who would see their ad."
- "Once your information is broadcast through RTB, it's almost impossible to know who receives it or control how it's used."
https://www.eff.org/deeplinks/2026/03/targeted-advertising-gives-your-location-government-just-ask-cbp

Overturned in part: "depending on permissions" is not EFF's, but a primary that EFF itself links supports it. FTC complaint, In the Matter of Mobilewalla, Inc., FTC file 202-3196:
- ¶10: "Among other information, a bid request contains a consumer's device MAID and precise geolocation information, if the consumer had location sharing turned on."
- ¶33: "The information contained in a bid request included the consumer's device MAID, a timestamp, the name of the app or website in which the consumer will see the advertisement, the consumer's device manufacturer, and the consumer's precise geolocation information if the consumer had location sharing turned on."
https://www.ftc.gov/system/files/ftc_gov/pdf/2023196mobilewallacomplaint.pdf
(CBP's own PTA, claim 3, says the same as CBP's characterisation: "This AdID data is only available from devices and apps that have opted-in to share location data".)

The page should say: keep the edition's sentence as written, including "Depending on permissions", and cite the FTC Mobilewalla complaint alongside [02] (it is an FTC allegation, which the edition already relies on via [07]). Smallest change: add the source. Optional: "the app or website in use" matches EFF exactly; "the app in use" is fine for an in-app section.

## 2. Companies join auctions they never intend to win, keep the requests and sell what they collect ("bidstream data")
Researcher: overstated; said EFF does not support entering auctions without intent to win, and does not support sale of bidstream data.
Skeptic: **amended** (verdict "overstated" kept for "never intends to win"; the researcher's rewording is narrower than the sources and missed two EFF sentences and the FTC primary)

EFF sentences the researcher missed:
- "anyone posing as an ad buyer can access a stream of sensitive data about billions of individuals a day."
- "Data brokers have taken advantage of this vulnerability to harvest data at a staggering scale."
- (found by researcher) "can collect your bidstream data regardless of whether or not they bid on the ad space."
https://www.eff.org/deeplinks/2026/03/targeted-advertising-gives-your-location-government-just-ask-cbp

Better primary, FTC Mobilewalla complaint (linked by EFF on "estimated 60%"):
- ¶10: "When Mobilewalla bid to place an advertisement for its clients through an RTB exchange, it collected and retained the information contained in the bid request, even when it did not have a winning bid, and even though the terms of the RTB exchanges disallowed such collection and retention."
- ¶18: "Mobilewalla sells access to this data in various ways, including raw location data and audience segments."
- ¶34: "Mobilewalla collected and retained the information contained in the bid request and used it for non-advertising purposes, even when Mobilewalla did not have a winning bid"
https://www.ftc.gov/system/files/ftc_gov/pdf/2023196mobilewallacomplaint.pdf

Scope: the FTC says Mobilewalla did bid (for clients) and kept the data when it lost; it does not say Mobilewalla bid without intent to win. EFF's "posing as an ad buyer" is the nearest support for "never intends to win", and it is about who can access the data, not a described business practice. "Keep" and "sell" are supported (FTC, for Mobilewalla, as allegations). EFF defines "bidstream data" as "The information in bid requests", not the harvested collection.

The page should say: "The losing bidders are a business of their own. Anyone posing as an ad buyer can get the data, EFF says, and data brokers have used that "to harvest data at a staggering scale." The FTC alleged that Mobilewalla kept the bid request "even when it did not have a winning bid" and sold access to the data. The information in a bid request is called bidstream data." Cite [02] and the FTC complaint.

## 3. CBP 2019 to 2021 pilot; "commercially available marketing location data"; "RTB-sourced location data is recorded when an advertisement is served." [02]
Researcher: could not open (CBP document not read).
Skeptic: **overturned** (the primary is readable, at the URL the researcher already had)

The ACLU-hosted PDF the researcher opened (first three pages only) contains the CBP PTA at PDF pages 22 to 33, Bates CBP-2020-033428-003150 to -003161. https://assets.aclu.org/live/uploads/2022/07/2023-10-06-CBPs-Additional-Production.pdf
- Form: "PRIVACY THRESHOLD ANALYSIS (PTA)", DHS Privacy Office, "Version number: 01-2014", 12 pages, marked "FOUO/LAW ENFORCEMENT SENSITIVE".
- Summary table (p. 2 of 12): "Project or Program Name: AdID Efficacy Pilot"; "Component: Customs and Border Protection (CBP)"; "Office or Program: OFO/NTC"; "Date first developed: December 1, 2018"; "Pilot launch date: May 1, 2019"; "Pilot end date: May 1, 2021".
- p. 3 of 12: "CBP is entering a testing and evaluation phase to assess the efficacy of using commercially available marketing location data associated with Advertising IDs (AdIDs)."
- p. 4 of 12: "The pilot will last for twelve months, with possible extensions as required."
- p. 6 of 12, verbatim: "SDK-sourced location data is recorded by applications and is embedded within tens of thousands of apps. Not all location enabled apps include an SDK that shares location data. RTB-sourced location data is recorded when an advertisement is served."
- p. 10 of 12: "Date submitted to Component Privacy Office: June 6, 2019"; "Date submitted to DHS Privacy Office: August 16, 2019"; "Date approved by DHS Privacy Office: September 30, 2020"; "PTA Expiration Date: September 30, 2021".
- p. 11 of 12 (DHS Privacy Office): "CBP is submitting this PTA to discuss the use of commercially-acquired marketing location data associated with Advertising ID (AdID) for law enforcement intelligence purposes."

So: the RTB quote is CBP's own, verbatim. "commercially available marketing location data" is CBP's own phrase, not only EFF's. The edition's "ran a 2019 to 2021 pilot" is scope-loose: 1 May 2019 to 1 May 2021 are the planned launch and end dates in the PTA's table, the same PTA says "twelve months, with possible extensions", and it does not record what actually ran. The "ran 2019 to 2021" reading is EFF's ("this document is about a 2019-2021 pilot use of this data") and heise's ("a pilot project that ran from 2019 to 2021", https://www.heise.de/en/news/US-border-protection-used-online-advertising-data-for-mobile-phone-surveillance-11199510.html), both from the 404 Media copy.
Walls: DocumentCloud copy (https://www.documentcloud.org/documents/27714350-adid-efficacy-pilot-pta/) HTTP 403; 404 Media article (Joseph Cox, 3 Mar 2026) paywalled after lede. I could not compare the 404 Media copy with the ACLU copy; redactions may differ.
Flag for owner: the ACLU file name dates this production 6 Oct 2023. EFF calls the document "recently obtained by 404 Media" and says it "is the first time CBP has acknowledged the location data it buys" comes partly from RTB. If the ACLU copy was public in 2023, the "first time" framing is EFF's and should not be repeated as fact. The edition does not repeat it now.

The page should say: "**CBP.** A pilot dated 1 May 2019 to 1 May 2021 to test "commercially available marketing location data associated with Advertising IDs." CBP's own privacy assessment names two sources, apps' SDKs and ad auctions: "RTB-sourced location data is recorded when an advertisement is served." [02] [new]" and add a source: DHS Privacy Office, Privacy Threshold Analysis, AdID Efficacy Pilot (CBP OFO/NTC), approved 30 Sep 2020, in CBP FOIA production to the ACLU (file dated 6 Oct 2023), Bates CBP-2020-033428-003150 to 003161, https://assets.aclu.org/live/uploads/2022/07/2023-10-06-CBPs-Additional-Production.pdf

## 4. ICE bought the Webloc tool in 2025; tracks millions of phones; can filter by advertising ID [02]
Researcher: holds (on EFF); 404 Media not opened; 2025 inferred from "Last year".
Skeptic: **amended** (substance upheld; dated primaries found; scope note on "bought")

EFF quotes confirmed: "Last year, ICE purchased a spy tool called Webloc that gathers the locations of millions of phones"; "Webloc also allows them to filter location data by the unique advertising IDs that Apple and Google assign to our phones." https://www.eff.org/deeplinks/2026/03/targeted-advertising-gives-your-location-government-just-ask-cbp

404 Media, Joseph Cox, "ICE to Buy Tool that Tracks Locations of Hundreds of Millions of Phones Every Day", Sep 30, 2025 (EFF's link on "Webloc"; paywalled after lede, wall recorded). Visible: "Immigration and Customs Enforcement (ICE) has bought access to a surveillance tool that is updated every day with billions of pieces of location data from hundreds of millions of mobile phones, according to ICE documents reviewed by 404 Media." The visible text does not name Webloc. https://www.404media.co/ice-to-buy-tool-that-tracks-locations-of-hundreds-of-millions-of-phones-every-day/

Better primary, Citizen Lab, "Uncovering Webloc: An Analysis of Penlink's Ad-based Geolocation Surveillance Tech", Christl, Perry, Garcia, Anstis, Deibert, 9 Apr 2026: "ICE purchased Tangles and Webloc licenses worth up to $2.3 million for the term of September 2025 to September 2026," and a 2022-2023 pricing proposal "suggests that the 2022-2023 contract also included Webloc." Webloc gives access to records "from up to 500 million mobile devices across the globe". On IDs: "queries for location records linked to a particular known mobile device ID"; Tucson police "used the system to search for "advertisement identification numbers" of phones". On sourcing: "It might obtain data from SDK-based sources, RTB-based sources or a mix of both". https://citizenlab.ca/research/analysis-of-penlinks-ad-based-geolocation-surveillance-tech/
Federal award record (aggregator HigherGov, award 70CMSD25P00000138, PenLink, start 9/25/25, up to $2,284,750): description "This award provides ICE homeland security investigations with penlinks cobweb and tangles licenses"; it does not name Webloc. https://www.highergov.com/contract/70CMSD25P00000138/

Scope: 2025 is now sourced (September 2025 licence term). "Bought ... in 2025" could read as a first purchase; Citizen Lab suggests an earlier contract may have included Webloc. Citizen Lab also says Webloc's data may be SDK-based rather than from ad auctions, so the edition should not imply Webloc data comes from the bidstream (it does not say so now).

The page should say: "**ICE.** Bought Webloc licences for September 2025 to September 2026. EFF says the tool gathers the locations of millions of phones and can filter them by advertising ID. [02] [Citizen Lab]"

## 5. "what they purchase via credit-card point-of-sale systems" is wrong; a bid request carries ID, location, IP, device, app, not a receipt [02]
Researcher: not in the source; OpenRTB 2.6 has no purchase or receipt field.
Skeptic: **amended** (researcher's finding upheld; rebuttal needs a scope fix and one unsourced sentence removed)

Upheld: EFF contains none of "credit", "card", "point-of-sale", "point of sale", "purchases", "receipt", "transaction", "shopping" (my fetch; the only "purchase" is agencies that "continued to purchase and use commercially obtained location data"). An exact-phrase web search for "what they purchase via credit-card point-of-sale systems" found no source. The quoted claim is unattributed and [02] cannot carry it.

OpenRTB 2.6 (IAB Tech Lab, https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/refs/heads/main/2.6.md), read in two parts: no occurrence of "receipt", "credit", "card" or "point of sale"; "purchase" and "transaction" occur only for buying the ad impression (e.g. "the actual transaction is for a unit impression only"). Upheld: no field for a card transaction.

But the standard lets a request carry more than the edition's five items:
- User.keywords: "Comma separated list of keywords, interests, or intent."
- User.data: "Additional user data. Each `Data` object (Section 3.2.21) represents a different data source."
- Data object: "This data may be from multiple sources whether from the exchange itself or third parties as specified by the `id` field." "A bid request can mix data objects from multiple providers."
- Segment object: "Segment objects are essentially key-value pairs that convey specific units of data."
So a request can carry third-party audience segments, whose source the standard does not limit. EFF's own list also includes "inferred interests, demographic information", which section 07 drops (section 06 has inferred interests).
"Transaction data is a separate product, sold from card and bank panels." has no source in [02] or OpenRTB; the researcher did not flag it.

The page should say: "**Card purchases.** The claim that bidstream data shows "what they purchase via credit-card point-of-sale systems" is wrong. The industry's bid request standard, OpenRTB 2.6, has no field for a card transaction. A bid request carries the ID, location, IP, device, app and inferred interests, and can carry audience segments from outside data providers. It doesn't carry your receipt. [OpenRTB 2.6] [02]" Cut the "card and bank panels" sentence or give it a source. Attribute the quoted claim to whoever made it, or drop the quotation marks.

## 6. Off switch: Android, iPhone, location [02]
Researcher: overstated; iPhone holds; "(path varies)" and "varies by manufacturer" called unsupported; "Every app" drops EFF's condition.
Skeptic: **amended** (iPhone upheld; location point upheld; "path varies by manufacturer" overturned: it is supported)

Android, Google: "On your Android device, go to Settings." "Tap Privacy > Ads." "Tap Delete advertising ID and confirm your changes." https://policies.google.com/technologies/ads?hl=en (also Play Console Help, https://support.google.com/googleplay/android-developer/answer/6048248?hl=en). EFF's 2022 guide, linked by [02]: "With the release of Android 12, Google began allowing users to delete their ad ID permanently." https://www.eff.org/deeplinks/2022/05/how-disable-ad-id-tracking-ios-and-android-and-why-you-should-do-it-now
The negative fails, so the path does vary:
- Samsung, "Use Security and privacy settings on Galaxy phones and tablets": "navigate to Settings, then tap Security and privacy, and then tap More privacy settings", Google section, "Ads: Reset your advertising ID or disable apps from using your ID." https://www.samsung.com/us/support/answer/ANS00088122
- Google Play Help, "Advertising ID": on Android 6.0 and above, "open the Settings app", then "Google", then "Ads". https://support.google.com/googleplay/answer/3405269?hl=en
- Google Android Help, "Manage location permissions for apps": "If these steps don't work for you, get help from your device manufacturer." https://support.google.com/android/answer/6179507?hl=en
So "The exact path varies by manufacturer" holds. Google's own pages also give different paths.

iPhone, Apple, "If an app asks to track your activity", Published Date: December 19, 2025: "Go to Settings, then tap Privacy & Security, then tap Tracking." Turning off "Allow Apps to Request to Track" stops the prompts, and "Each app that asks for permission to track while this setting is turned off will be treated as if you tapped "Ask App Not to Track."" https://support.apple.com/en-us/102420 Upheld.

Location: upheld that EFF frames limits as a fallback: "make sure you're only granting location permission to apps that really need it in order to function. If you can't disable location access completely for an app, limit it to only when you have the app open or only approximate location instead of precise location." The vendors' own pages back the two settings: Apple, "While Using the App: Allows access to Location Services only when the app or one of its features is visible on screen."; "To share only your approximate location — which may be sufficient for an app that doesn't need your exact location — turn Precise Location off." (support.apple.com/102647, published October 22, 2026, https://support.apple.com/en-us/102647). Google: "Allow only while using the app" and "Use precise location" toggle; approximate is "an area about 3 square kilometers" (https://support.google.com/android/answer/6179507?hl=en).
"it takes about a minute" (section 16) has no source.

The page should say:
- **Android.** Settings, Privacy, Ads, Delete advertising ID (Android 12 and later). The exact path varies by manufacturer. [Google] [Samsung]
- **iPhone.** Settings, Privacy & Security, Tracking. Turn off Allow Apps to Request to Track. [Apple 102420]
- **Location.** Give location only to apps that need it. Where an app needs it, allow it only while the app is in use, and turn off precise location wherever the app still works without it. [02] [Apple 102647] [Google 6179507]
Drop "about a minute" or present it as the house's own estimate.

## Anthropic
No source in this lane characterises Anthropic.
