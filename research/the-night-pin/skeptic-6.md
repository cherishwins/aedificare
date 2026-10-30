# Skeptic, lane 6: Gravy breach, ATT opt-in, Privacy Sandbox

Researcher's file: research/the-night-pin/lane-6.md. Edition: source/the-night-pin.web.md, lines 103, 111, 113, 115; sources [08], [09], [10] (section 17).

Read date for every page below: 2026-10-30. Quotes come back through WebFetch's extraction step. TechCrunch's extractor would not give whole paragraphs word for word, so I re-asked for short exact fragments and quote only those. The Adjust report quotes in claim 4 are read from the PDF page images directly.

## Summary

| # | Researcher | Skeptic | Print |
|---|---|---|---|
| 1 | holds | upheld | As written. Optional: "by one researcher's count". |
| 2 | holds | amended | "404 Media found that large amounts of the leaked Gravy data were location inferred from IP addresses rather than the phone's precise GPS coordinates." |
| 3 | overstated | overturned | As written: Apple's developer documentation says it in nearly these words. |
| 4 | overstated | amended | "Measured opt-in rates sit at roughly 35 to 50 percent globally, depending on whose panel you trust, and lower for some kinds of app." |
| 5 | overstated | amended | "On 17 October 2025 Google said it was retiring Privacy Sandbox on Android, which it had built to run ads without the Android advertising ID. The ID stays unless the user deletes it." |

Flags for the owner (outside the claim list): line 113, "a city block wide", is not supported by [08]. Cite Apple Developer for claim 3 and Adjust/AppsFlyer for claim 4, in place of or alongside Moburst. Cite Google's own posts for claim 5, in place of or alongside Playio.

---

## 1. Gravy sample: more than 30,000,000 points; White House, Kremlin, Vatican City, military bases; dating, fitness, transit apps [08]

Skeptic verdict: **upheld** (researcher: holds)

Evidence (reopened): TechCrunch, Zack Whittaker, "4:35 AM PST, January 13, 2025", updated with ICO comment. https://techcrunch.com/2025/01/13/gravy-analytics-data-broker-breach-trove-of-location-data-threatens-privacy-millions/
- Robert's count: "the dataset contained more than 30 million location data points". The extractor says this comes from "Baptiste Robert, the CEO of digital security firm Predicta Lab" in a thread on X.
- Places: "devices located at The White House in Washington, D.C.; the Kremlin in Moscow; Vatican City;" and then, asked for the words that follow: "and military bases around the world."
- Sample: "the alleged hacker has already published a large sample of location data from top consumer phone apps"; apps: "including fitness and health, dating, and transit apps, as well as popular games"; it also names "FlightRadar, Grindr, and Tinder".

Scope: The 30 million figure counts the published sample that Robert obtained, not the whole haul. The hackers claimed terabytes, which no one has verified. The edition says "one sample", which is correct. "January 2025" holds: TechCrunch dates the hacker's post and Gravy's disclosure to that month, and search results quoting Gravy's notice to Norway's Datatilsynet give 4 January 2025 as the date unauthorized access to its AWS storage was identified.

Better primary, tried:
- 404 Media, Joseph Cox, "Hackers Claim Massive Breach of Location Data Giant, Threaten to Leak Data", Jan 7, 2025. https://www.404media.co/hackers-claim-massive-breach-of-location-data-giant-threaten-to-leak-data/ Paywalled ("This post is for paid members only"). The preview gives no point count, no named places and no apps.
- 404 Media, Joseph Cox, "Candy Crush, Tinder, MyFitnessPal: See the Thousands of Apps Hijacked to Spy on Your Location", Jan 9, 2025. https://www.404media.co/candy-crush-tinder-myfitnesspal-see-the-thousands-of-apps-hijacked-to-spy-on-your-location/ Paywalled. The preview names "games like Candy Crush to dating apps like Tinder" and has MyFitnessPal in the headline, which backs "dating" and "fitness" independently. It gives no point count.
- Gravy/Unacast notice to Datatilsynet (DocumentCloud). https://s3.documentcloud.org/documents/25485205/datatilsynet-unacast-security-incident-notification-redacted.pdf and https://www.documentcloud.org/documents/25485205-datatilsynet-unacast-security-incident-notification-redacted/ both returned HTTP 403. I recorded the refusal and did not work round it.
- Baptiste Robert's X thread is the true primary for the 30 million, places and military-base figures. I did not open it, because X requires sign-in.

Rewording: the researcher's "true as" is accurate. The edition's own sentence is also true as written. If the imprint wants the count attributed, the smallest change is: "More than 30,000,000 location points, by one researcher's count, in one sample leaked from Gravy Analytics in January 2025 ..."

---

## 2. Much of the leaked Gravy data was location inferred from IP addresses rather than satellite fixes [08]

Skeptic verdict: **amended**. The researcher's rewording stands. The verdict should be "holds only when attributed" rather than "holds".

Evidence (reopened, same TechCrunch page):
- "large amounts of the location data was inferred from the device owner's IP address", attributed to 404 Media. It is contrasted with "rather than relying on the device owner allowing the app to access the device's precise GPS coordinates."
- IP addresses "can be used to infer a person's approximate location."
- Asked directly, the extractor found no share, percentage or count, and no "satellite".

Who found it: 404 Media, reported by TechCrunch. How much: no number is published in anything I could open. "Large amounts" is the only measure.

Negative hunt: I searched for a share or count of IP-derived points in the leak and found none. Both 404 Media articles from January 2025 are paywalled (URLs in claim 1), and their previews do not mention IP inference. A secondary account of 404 Media's reporting (Sky News, via search) says the data also "includes precise latitude and longitude co-ordinates of people's phones." So the leak mixed both kinds of location. "Much" is fair for "large amounts". "Turned out to be" states as settled fact what is one outlet's finding, reported secondhand.

What the page should say: "404 Media found that large amounts of the leaked Gravy data were location inferred from IP addresses rather than the phone's precise GPS coordinates." This is the researcher's version, trimmed.

Flag for the owner, outside this claim list: the next sentence, "Plenty of points in these datasets are a city block wide, not a doorstep", is cited to [08], but TechCrunch gives no precision beyond "approximate location". [08] does not support "a city block wide".

---

## 3. Since ATT in 2021, an app must ask before it can use the iPhone's advertising ID [09]

Skeptic verdict: **overturned**. The researcher said "overstated"; the edition's sentence holds as written.

The researcher used only Apple's consumer Support page and said Apple does not say "must ask before it can use" the IDFA. Apple's developer pages say it almost word for word:
- Apple Developer Documentation, `advertisingIdentifier` (read from the page's documentation JSON, because the HTML page renders only its title): "On devices running iOS 14.5 and later and iPadOS 14.5 and later, your app must request tracking authorization before it can get the advertising identifier." It returns "all zeros (00000000-0000-0000-0000-000000000000)" "if you haven't requested authorization using the AppTrackingTransparency framework" and if "the user declines". https://developer.apple.com/documentation/adsupport/asidentifiermanager/advertisingidentifier (data: https://developer.apple.com/tutorials/data/documentation/adsupport/asidentifiermanager/advertisingidentifier.json)
- Apple Developer, "User Privacy and Data Use": "In iOS 14.5, iPadOS 14.5, and tvOS 14.5 or later, you need to receive the user's permission through the App Tracking Transparency (ATT) framework in order to track them or access their device's advertising identifier." / "the device's advertising identifier value will only be returned once you present the prompt and the user grants permission." https://developer.apple.com/app-store/user-privacy-and-data-use/
- Date, Apple Developer News, "Upcoming AppTrackingTransparency requirements", April 20, 2021: "all apps must use the AppTrackingTransparency framework to request the user's permission to track them or to access their device's advertising identifier." / "These requirements apply to all apps starting April 26, 2021." https://developer.apple.com/news/?id=ecvrtzt2
- Apple Support 102420 (published December 19, 2025, per the page) agrees: "If you choose Ask App Not to Track, the app developer can't access the system advertising identifier (IDFA)". It also says that with "Allow Apps to Request to Track" off, apps are "unable to access the advertising identifier (IDFA)". https://support.apple.com/en-us/102420

Scope note, not a change: the IDFA rule binds any app reading the ID, not only apps that track. The edition's sentence is therefore exact. Its "2021" is correct: the rule took effect April 26, 2021. "User Privacy and Data Use" also records that "Beginning with iOS 27.2 and iPadOS 27.2" developers in the EU may use "an alternative version" of the prompt, which is the only version in Germany, France, Italy, Poland and Romania. That is still a prompt, so the sentence stands, but it may matter for claim 4.

What the page should say: no change. "Since Apple's App Tracking Transparency prompt in 2021, an app has to ask before it can use the iPhone's advertising ID." Cite Apple Developer (the `advertisingIdentifier` doc, or the 20 Apr 2021 developer news post) in place of, or alongside, Moburst.

---

## 4. Measured ATT opt-in rates sit at roughly 35 to 50 percent globally, depending on panel and app category [09]

Skeptic verdict: **amended**. The researcher's "overstated" stands, but the rewording does not. It rests on figures from a search snippet, and it uses gaming subgenres as if they were app categories. Adjust's own report, which I opened, gives a newer global figure and category figures that fall below 35.

Adjust primary (opened): Adjust, "Mobile app trends: 2026 edition. A global benchmark of app performance", PDF on Adjust's asset host. https://a.storyblok.com/f/47007/x/8e101e06f9/mobile-app-trends-2026.pdf Search results tie it to a press release dated 18 Feb 2026. I could not open that release on BusinessWire (403) or Nasdaq (503).
- p. 7: "App Tracking Transparency (ATT) opt-in rates among iOS users who permit tracking requests continued to rise into Q1 2026, with the industry average increasing from 35% in Q1 2025 to 38% in Q1 2026."
- p. 7: "Gaming led with a 39% opt-in rate, while entertainment, finance, lifestyle, and social apps all improved YoY. Publications recorded one of the largest gains, rising from 18% to 26%. E-commerce and shopping apps, on the other hand, dropped from 35% to 34%."
- The p. 7 chart "ATT opt-in rates Q1 2026 v. Q1 2025 (Global)" shows Health & fitness at about 22% in Q1 2026. That value is read off the bar chart; no number is printed.
- p. 13 methodology: "DATE RANGE: January 2024 - January 2026". "Data is based on aggregated, anonymized data from apps tracked by Adjust and may not reflect the entire global app market." So Adjust's "Q1 2026" rests on data that ends in January 2026.
- Adjust blog pages could not be opened: https://www.adjust.com/blog/att-opt-in-rates-2025 (and the same URL with a trailing slash), https://www.adjust.com/blog/app-tracking-transparency-opt-in-rates/ and https://www.adjust.com/resources/ebooks/latam-app-trends/ all returned HTTP 429. I recorded this and did not work round it. The researcher's Q2 2025 figure of 35%, "based on users shown the prompt", is still snippet-only. It agrees with the report's Q1 2025 figure of 35%.

AppsFlyer primaries (reopened):
- "AppsFlyer Data Shows Market Adaptation to Privacy-First Ecosystem Four Years After ATT", San Francisco, April 24, 2025: "Globally, 50% of users now consent to tracking, a significant 10% increase since ATT's initial rollout." The release states no denominator. https://www.appsflyer.com/company/newsroom/pr/post-att-growth/
- "AppsFlyer Data Reveals Increase in User Opt-In Rates and Ad Spend on iOS Three Years After Apple's App Tracking Transparency", San Francisco, April 26, 2024: "On a global scale, 50% of users of apps now opt-in to tracking, marking a 10% increase since ATT's rollout." The lowest countries it lists are "Sweden (31%)" and "Poland (39%)". https://www.appsflyer.com/company/newsroom/pr/att-data-findings
- AppsFlyer blog, "Redefining ATT opt-in measurement", Shani Rosenfelder, last updated Nov 27, 2025: "true opt-in rate is 40%, as it accounts only for users who actually see the prompt"; counting users who never see the prompt, "the rate drops to 30%." No data period is stated. https://www.appsflyer.com/blog/measurement-analytics/att-opt-in-measurement/ This is AppsFlyer's own lower figure, which the researcher missed.
- I found no AppsFlyer fifth-anniversary (April 2026) release by searching appsflyer.com. The April 2025 release is the latest AppsFlyer global figure I found.

Moburst [09] (reopened): "Adjust's Q2 2025 panel data puts the global average closer to 35%". Its link for that figure goes to an AppFollow glossary, not to Adjust. It also renders AppsFlyer's "10% increase" as "a 10-point increase", which AppsFlyer does not say. https://www.moburst.com/blog/idfa-att-update/

Assessment:
- "Depending on whose panel" is fair. The latest headline global figures are Adjust's 38% (Q1 2026; 35% in Q1 2025) and AppsFlyer's 50% (April 2025). AppsFlyer's own "true" rate is 40%. "Roughly 35 to 50" covers all of these.
- "Which kind of app is asking" is wrong as written. In Adjust's own category data the spread runs below the range, not within it: publications 26%, health & fitness about 22% (chart), gaming highest at 39%. The 40–50% subgenre figures the researcher used are gaming subgenres from a snippet, not app categories.
- The researcher's note (c) is right: AppsFlyer's global 50% is the same in its 2024 and 2025 releases.

What the page should say (smallest change): "Measured opt-in rates sit at roughly 35 to 50 percent globally, depending on whose panel you trust, and lower for some kinds of app." If dates are wanted: "Adjust put its industry average at 38 percent in early 2026; AppsFlyer put its global figure at 50 percent in April 2025. By category, Adjust's figures run from about a quarter (publications, 26 percent) to 39 percent (gaming)." Cite Adjust's report and AppsFlyer's release alongside, or in place of, Moburst.

---

## 5. Google announced in October 2025 that it was winding down Privacy Sandbox, its planned replacement for the Android advertising ID; the ID stays on unless the user deletes it [10]

Skeptic verdict: **amended**. The researcher's date and source are right. The researcher's scope objection is wrong for Android, and the researcher's rewording drops the sentence's point.

Google's announcement (reopened): Anthony Chavez, VP, Privacy Sandbox, "Update on Plans for Privacy Sandbox Technologies", Oct 17, 2025. https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies
- "we've decided to retire the following Privacy Sandbox technologies:". Attribution Reporting API, Protected Audience and Topics are each marked "(Chrome and Android)". Also listed are IP Protection, On-Device Personalization, Private Aggregation (including Shared Storage), Protected App Signals, Related Website Sets, SelectURL and SDK Runtime.
- "We will follow Chrome and Android processes for phasing out these technologies". The retirement is tied to "their low levels of adoption". "Some Privacy Sandbox technologies are being phased out."
- Kept, Chrome only: CHIPS, FedCM and Private State Tokens.
- The post does not mention the advertising ID, "identifier" or "two years".
- Answer to the brief: the announcement covers both Chrome and Android, dated 17 Oct 2025.

Negative hunt on "winding down" for Android. The researcher held that Google retires named technologies, not the initiative. On Android, Google's own pages say the whole thing is going:
- Google for Developers (AdMob), "Privacy Sandbox | Android", last updated 2026-10-28: "Caution: As of October 17, 2025, Privacy Sandbox on Android is deprecated." https://developers.google.com/admob/android/privacy/sandbox
- Privacy Sandbox feature status, last updated August 14, 2026. Every Android entry (Attribution Reporting, On-device personalization, Protected App Signals, Protected Audience, SDK Runtime, Topics) reads "Scheduled for phaseout." https://privacysandbox.google.com/overview/status
- Only the "whole initiative" reading fails, and only on Chrome, where three technologies are kept. In this edition's Android context, "winding down Privacy Sandbox" holds. "Privacy Sandbox on Android" is the exact wording.

"Planned replacement for the Android advertising ID". The researcher worked from a snippet; I opened the 2022 primary. Anthony Chavez, "Introducing the Privacy Sandbox on Android", February 16, 2022. https://blog.google/products/android/introducing-privacy-sandbox-android/
- The aim is "the goal of introducing new, more private advertising solutions", which would "operate without cross-app identifiers, including advertising ID."
- "we plan to support existing ads platform features for at least two years"; "we intend to provide substantial notice ahead of any future changes".
- Google never said in that post that the advertising ID would be removed or replaced. "Replacement" is the edition's (and Playio's) gloss. It is a fair reading of the direction, but it is not Google's word. The smallest true version is "built to run ads without the Android advertising ID".

"The ID stays on unless the user deletes it":
- Google Play Console Help, "Advertising ID": "The advertising ID is a unique, user-resettable, and user-deletable ID for advertising, provided by Google Play services." After deletion, "Any attempts to access the identifier will receive a string of zeros instead of the identifier." The page dates this to the late-2021 Play services update, extended to all Play devices from April 1, 2022. https://support.google.com/googleplay/android-developer/answer/6048248?hl=en
- Google My Ad Center Help (Android): "Ads you see on your mobile devices may be personalized based on its Advertising ID." / "Delete your device's advertising ID, which deletes the advertising ID and doesn't assign a new one." https://support.google.com/My-Ad-Center-Help/answer/12155656?hl=en&co=GENIE.Platform%3DAndroid
- Android Developers, "Get a user-resettable advertising ID", last updated 2026-02-26. It describes the ID with no deprecation notice and does not mention Privacy Sandbox. https://developer.android.com/identity/ad-id
- No Google page I opened says "on by default" in those words. The Play help speaks of the ID "when available on a device". I found no Google page after October 2025 that announces any change to the ID. The 2026 Android developer page carries it as current. "Stays unless the user deletes it" is supported; "stays on" implies a switch, and Google describes deletion, not a switch.

Playio [10] (reopened): "Privacy Sandbox Is Gone. What That Actually Means for Android Game Marketing", Jul 20, 2026, no author named. "On October 17, 2025, Google announced it was retiring most of the Privacy Sandbox initiative"; "are being wound down on both Chrome and Android". https://blog.playio.co/privacy-sandbox-shutdown-android-game-marketing It is a secondary source; the Google pages above are the primaries.

What the page should say: "Google said on 17 October 2025 that it was retiring Privacy Sandbox on Android, which it had built to run ads without the Android advertising ID. The ID stays unless the user deletes it." Cite Google's 17 Oct 2025 post and the AdMob deprecation notice in place of, or alongside, Playio.

---

## Could not open (recorded, not worked round)
- 404 Media, 7 and 9 Jan 2025: paywalled.
- DocumentCloud copies of the Gravy/Unacast Datatilsynet notice: HTTP 403, on both the S3 and viewer URLs.
- Baptiste Robert's X thread: sign-in wall, so not attempted.
- Adjust blog and ebook pages on adjust.com: HTTP 429. The Adjust 2026 report PDF on Adjust's asset host opened and was used instead.
- Adjust press release, 18 Feb 2026: BusinessWire 403, Nasdaq 503.
