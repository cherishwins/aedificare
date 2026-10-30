# Lane 6: Gravy breach, ATT opt-in, Privacy Sandbox

Edition: source/the-night-pin.web.md (The Night Pin, Aedificare, 30 Oct 2026). Sentences checked are at lines 103, 111, 113 and 115. Sources cited there: [08], [09], [10].

Method: each claim was checked against the primary where one could be opened. Quotes were returned by WebFetch's extraction step, not copied from a raw page, so re-check the wording against the live page before print. Where a primary could not be opened, the note says so and what was used instead.

Read date for all sources: 2026-10-30.

---

## 1. A sample leaked from Gravy Analytics in January 2025 held more than 30,000,000 location points, including devices at the White House, the Kremlin, Vatican City and military bases; apps named included dating, fitness and transit apps.
Verdict: holds
Primary: Zack Whittaker (TechCrunch), "Gravy Analytics data broker breach: trove of location data threatens privacy of millions", 13 Jan 2025. https://techcrunch.com/2025/01/13/gravy-analytics-data-broker-breach-trove-of-location-data-threatens-privacy-millions/
Read: 2026-10-30
Quote: "the dataset contained more than 30 million location data points." / "These included devices located at The White House in Washington, D.C.; the Kremlin in Moscow; Vatican City" / "military bases around the world." / "from top consumer phone apps — including fitness and health, dating, and transit apps, as well as popular games."
True as: TechCrunch reported that a sample of the leaked Gravy Analytics data, published in January 2025, contained more than 30 million location data points, including devices at the White House, the Kremlin, Vatican City and military bases, and that apps in it included dating, fitness and transit apps.
Notes: The 30 million figure is TechCrunch's report of the leaked dataset as obtained by Baptiste Robert, CEO of Predicta Lab. TechCrunch attributes the first report of the forum post to 404 Media. I did not open the 404 Media original, which is the primary for the leak. The 404 Media homepage did not list the January 2025 Gravy piece. A guessed 404 Media URL returned 404. A URL surfaced by web search (a 404 Media piece by Joseph Cox, 7 Jan 2025) was paywalled and did not give the figures. TechCrunch also names FlightRadar, Grindr and Tinder as apps whose bidstream data appears in the dataset; the edition does not name them, so no change is needed. "Leaked from Gravy Analytics" rests on the hacker's claim and Gravy's breach disclosure (reported secondhand); TechCrunch's wording is that the dataset is the leaked one.

---

## 2. Much of the leaked Gravy data turned out to be location inferred from IP addresses rather than satellite fixes.
Verdict: holds
Primary: Zack Whittaker (TechCrunch), "Gravy Analytics data broker breach: trove of location data threatens privacy of millions", 13 Jan 2025, reporting 404 Media's finding. https://techcrunch.com/2025/01/13/gravy-analytics-data-broker-breach-trove-of-location-data-threatens-privacy-millions/
Read: 2026-10-30
Quote: "404 Media found that large amounts of the location data was inferred from the device owner's IP address," and this was "rather than relying on the device owner allowing the app to access the device's precise GPS coordinates." The article doesn't mention satellite positioning.
True as: 404 Media found that large amounts of the leaked Gravy location data were inferred from the device owner's IP address, rather than taken from the phone's precise GPS coordinates.
Notes: "Much" is TechCrunch's "large amounts", quoting 404 Media. Neither source gives a share or count, so "much" should stay as "large amounts" or get a number from the 404 Media original. "Satellite fixes" is the edition's gloss on GPS; TechCrunch uses "GPS coordinates" and does not mention satellites. The primary (404 Media's analysis) was not opened, so this rests on TechCrunch's account of it. The source is one outlet's finding, not a survey of the whole dataset. The edition's "Who found this" answer is 404 Media, reported by TechCrunch.

---

## 3. Since Apple's App Tracking Transparency prompt in 2021, an app must ask before it can use the iPhone's advertising ID.
Verdict: overstated
Primary: Apple Support, "If an app asks to track your activity", undated page. https://support.apple.com/en-us/102420 (Apple Developer's App Tracking Transparency page at https://developer.apple.com/documentation/apptrackingtransparency returned only its title, so it was not usable.)
Read: 2026-10-30
Quote: "Starting in iOS 14.5, iPadOS 14.5, and tvOS 14.5, apps must ask for permission before tracking your activity across other companies' apps and websites." / "if you choose 'Ask App Not to Track,' the developer 'can't access the system advertising identifier (IDFA).'"
True as: Since iOS 14.5 (2021), apps must ask for permission before tracking your activity across other companies' apps and websites, and an app that is told not to track cannot access the iPhone's advertising identifier (IDFA).
Notes: The edition's rule is narrower than Apple's wording. Apple's rule is about tracking across other companies' apps and websites; the IDFA restriction follows from a refusal. The Apple page does not mention 2021 by name, but "iOS 14.5" is 2021. Apple's page does not say "must ask before it can use" the IDFA in those words. The rewording above is the closest true version.

---

## 4. Measured ATT opt-in rates sit at roughly 35 to 50 percent globally, depending on panel and app category.
Verdict: overstated
Primary (50 figure): AppsFlyer newsroom, "AppsFlyer Data Shows Market Adaptation to Privacy-First Ecosystem Four Years After ATT", San Francisco, 24 Apr 2025. https://www.appsflyer.com/company/newsroom/pr/post-att-growth/
Primary (50 figure, earlier): AppsFlyer newsroom, "att-data-findings", dated San Francisco, 26 Apr 2024. https://www.appsflyer.com/company/newsroom/pr/att-data-findings
Primary (35 figure): Adjust, "att opt in rates 2025" blog. https://www.adjust.com/blog/att-opt-in-rates-2025 (NOT OPENED: WebFetch returned HTTP 429 Too Many Requests. The figures below come from a web search snippet of that page, not from the page itself.)
Read: 2026-10-30
Quote: AppsFlyer, 24 Apr 2025: "Globally, 50% of users now consent to tracking, a significant 10% increase since ATT's initial rollout." / "France now reports an average opt-in rate just under 51%, while Germany stands at 47%." AppsFlyer, 26 Apr 2024: "On a global scale, 50% of users of apps now opt-in to tracking, marking a 10% increase since ATT's rollout." Adjust (search snippet only, not opened): "As of Q2 2025, the industry-wide average opt-in (based on users shown the prompt) rate sits at 35%, up slightly from 34.5% in Q2 2024 and 34% in Q2 2023." Adjust subgenres (snippet): "sports (50%), hyper casual (43%), and action (40%) lead the pack."
True as: Two published benchmarks put global ATT opt-in between about 35 percent (Adjust, Q2 2025, counted among users shown the prompt) and 50 percent (AppsFlyer, April 2025, denominator not stated), and Adjust's Q2 2025 subgenre figures run from 40 percent (action) to 50 percent (sports).
Notes: (a) The range is the spread of two providers, not a measured range across panels and categories. (b) The denominators differ: Adjust counts users shown the prompt; AppsFlyer's release does not say how its rate is calculated. (c) AppsFlyer's 50 percent global figure is the same in its 26 Apr 2024 and 24 Apr 2025 releases, so "50" is not clearly a 2025 reading; the 2025 release is a fourth-anniversary release. (d) The Moburst post cited by the edition (https://www.moburst.com/blog/idfa-att-update/) gives AppsFlyer about 40 percent in 2021 and 50 percent in its four-year data, and gives Adjust's Q2 2025 figure as "closer to 35%." It is a secondary source for these numbers. (e) Adjust's 2026 report, per a search snippet only, puts the global average at 38 percent in Q1 2026; it was not opened and does not change the verdict. Singular's figure of 13.85 percent (Q2 2024, apps that prompt on download) is a different method and is not part of this range; I did not open it.

---

## 5. Google announced in October 2025 that it was winding down Privacy Sandbox, its planned replacement for the Android advertising ID; the ID stays on unless the user deletes it.
Verdict: overstated
Primary: Google Privacy Sandbox team, "Update on Plans for Privacy Sandbox Technologies", dated 17 Oct 2025. https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies (the older privacysandbox.com/news URL redirects here). Second primary for the ID: Google Play Console Help, "Advertising ID". https://support.google.com/googleplay/android-developer/answer/6048248?hl=en-GB
Read: 2026-10-30
Quote: Google, 17 Oct 2025 (as extracted): "we've decided to retire the following Privacy Sandbox technologies" / "We will follow Chrome and Android processes for phasing out these technologies" / Attribution Reporting API, Protected Audience and Topics are marked "(Chrome and Android)"; "Oct 17, 2025." Google's post contains no sentence about the Android advertising ID or GAID. Google Play Console Help: "The advertising ID is a unique, user-resettable and user-deletable ID for advertising, provided by Google Play services." / Users can delete their device's advertising ID in Settings, under Privacy > Ads, by choosing "Delete advertising ID."
True as: On 17 Oct 2025 Google said it would retire a list of Privacy Sandbox technologies, including Topics and Protected Audience, on Chrome and Android. Google's announcement does not mention the Android advertising ID. Google's Play help says users can delete the advertising ID in their settings.
Notes: (a) "Winding down Privacy Sandbox" overstates the scope. Google's post retires named technologies, not the initiative as a whole; Engadget reported a Google spokesperson saying the whole initiative is being retired, and TechRadar reported that Google will gather feedback toward an updated roadmap. Those reports conflict with each other; the Google post is the tie-breaker and it names technologies. (b) "Its planned replacement for the Android advertising ID" is not in Google's post. It is the edition's framing. A search snippet of privacysandbox.com/android (2022, not opened) describes Privacy Sandbox as designed to operate without cross-app identifiers including advertising ID, which is closer to "a way to reduce reliance on the ID" than to "replacement." (c) "The ID stays on unless the user deletes it" is not stated by Google's October 2025 post. Google's Play help says the ID is user-deletable; it does not say in these words that the ID stays on by default. The Play help also records a late-2021 Play services change under which deleting the ID removes it on Android; I did not check whether later Google pages say anything different.

---

## Could not open / could not settle
- Adjust, "att opt in rates 2025": HTTP 429 from WebFetch. Figures used from a search snippet only.
- 404 Media original reporting (Jan 2025) on the Gravy sample: not opened (paywall on the Jan 7 article; a guessed URL returned 404; the 13 Jan article was not located). The leak figures and the IP finding rest on TechCrunch's account.
- Apple Developer ATT page: only the title came back, so Apple Support's page was used instead.
- Google's Android advertising ID status after October 2025: the Play help page was opened, but I found no 2025 or later Google page stating the ID's status after the Privacy Sandbox retirement. I did not search full text of Google's Android developer pages, so absence of a statement there is not established.
