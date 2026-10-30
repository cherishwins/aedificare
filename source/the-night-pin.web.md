---
# Aedificare Edition 11, web edition. Content file for the site repo.
# Field names follow the Publishing contract in 01-claude-code-prompts.md.
slug: the-night-pin
edition: 11
title: The Night Pin
dek: How six layers of commercial data turn a phone into a named person, and who buys it all
seoTitle: "The Night Pin: How Bought Location Data Becomes a Name"
description: The FBI says it buys commercial data. How six layers, from Shodan to ad IDs and voter files, join into one named person, and what the usual version gets wrong.
standfirst: Six layers of data anyone can buy. One join gives them a name.
datePublished: 2026-10-30T09:00:00-07:00
dateModified: 2026-10-30T09:00:00-07:00
author: Jesse James
seed: 1130
pdf: /pdf/edition-11.pdf
film: null
leadImage:
  figure: stack
  alt: Six stacked bands labelled, bottom to top, Structure, Network, Attention, Orbit, Device and Identity, with Identity highlighted in acid green.
sections: [admission, stack, structure, network, attention, orbit, device, overstated, pin, proof, file, legal, trades, buyers, law, view, off, sources]
---

<!-- HOW TO READ (render in the existing How-to-read block) -->
**Measured** · Text carrying a bracketed number points to a primary or first-hand source in section 17.
**Correction** · Where a popular claim about this stack is wrong, it is marked and the evidence is given.
**View** · The author's opinion. Set on its own surface, signed, and labelled as not reporting.

## 00 The admission {#admission}

<!-- figure: date readout "18.03.2026" -->

On 18 March 2026, Senator Ron Wyden asked the director of the FBI whether the Bureau would commit to not buying Americans' location data. Kash Patel did not commit. He said the FBI "uses all tools" to do its mission, and then: "We do purchase commercially available information that is consistent with the Constitution and the laws under the Electronic Communications Privacy Act, and it has led to some valuable intelligence for us." [01]

It was the first time since 2023 that the FBI had confirmed buying from data brokers. The Bureau holds that data it pays for needs no warrant. No court has tested that theory. [01]

What follows is the stack that sentence refers to. It has six layers. Four of them watch things. Two of them watch people. The interesting part is not any single layer. It is the one lookup where the last two meet.

**Position** · Nothing in this stack is secret, and nearly all of it is for sale. The step that turns it into surveillance of a named person is a single database join, and in most US states the input that makes that join possible is not supposed to be used commercially at all.

## 01 The stack {#stack}

<!-- figure: six-layer stack (leadImage). Bands bottom to top: 01 Structure, 02 Network, 03 Attention, 04 Orbit, 05 Device, 06 Identity (acid). -->

| Layer | Source | What it sees |
|---|---|---|
| 06 Identity | Voter files | The name on the door |
| 05 Device | Advertising IDs from ad auctions | Where a phone sleeps and goes |
| 04 Orbit | Satellite imagery | Cars, tanks, ships |
| 03 Attention | App and web panels | What people open |
| 02 Network | NetFlow | Who talks to whom |
| 01 Structure | Shodan | Machines on the internet |

Layers one to four are about infrastructure, traffic and objects. They move markets and they interest militaries, but on their own they rarely name anyone. Layers five and six are about bodies. The rest of this edition walks up the stack in order, and corrects the version of it that circulates.

## 02 Structure {#structure}

Shodan is a search engine for machines. It crawls the internet and indexes every device that answers: servers, webcams, routers, building controllers, industrial equipment. You can search it by port, by product, by country, by the network that owns the address. [06]

It is the base map. It tells you where the infrastructure is and what it runs. It does not tell you who is using it. A camera on Shodan is a camera, not a person.

## 03 Network {#network}

<!-- figure: big number "90%" + one illustrative flow record (documentation addresses) -->

NetFlow is the metadata of internet traffic. It records which address talked to which, when, on what port, and how much. It doesn't record what was said. [03]

That makes it sound harmless until you see the scale it is sold at. Team Cymru's Augury product draws on 550 collection points worldwide and adds at least 100 billion records a day. Contracting records reviewed by Vice put its reach at about 90 percent of global internet traffic. Its buyers included several branches of the US military. [03]

**Illustrative flow record** (documentation addresses, not real traffic): `SRC 203.0.113.7 DST 198.51.100.24 PORT 443 BYTES 18,442 T 14:02:11`. There's no content in it, only who, where, when and how much.

## 04 Attention {#attention}

<!-- figure: "$10,000,000" -->

Panels estimate what people download, open and stream. Investment firms buy the estimates because app usage moves before revenue does, so a good panel lets a fund see a quarter before the company reports it.

The first securities-fraud case against an alternative-data vendor came out of this layer. On 14 September 2021 the SEC settled with App Annie and its co-founder, Bertrand Schmitt. App Annie had told the companies sharing their app data that it would be aggregated and anonymised. From late 2014 to mid-2018 it used the non-aggregated, non-anonymised data to adjust the estimates it sold to trading firms, while telling those firms its process respected the consents it had obtained. The firm paid $10 million. Schmitt paid $300,000 and accepted a three-year bar from serving as an officer or director of a public company. [04]

The lesson for anyone building on this stack is that the legal risk lives in provenance, not in the model. A clean model trained on dirty data is a dirty product.

## 05 Orbit {#orbit}

<!-- figure: two parking lots, Quarter A 82% full, Quarter B 41% full (labelled illustration) -->

The most famous alternative dataset is also the most innocent. Satellites photograph retailers' parking lots, and software counts the cars.

Researchers at Berkeley Haas studied 4.8 million such images from RS Metrics, later combined with Orbital Insight, covering 67,000 stores belonging to 44 major US retailers from 2011 to 2017. Funds with the data earned 4 to 5 percent in the three days around earnings announcements. The edge was largest on the short side: funds bet against retailers heading for bad quarters while individual investors, who can see short interest only twice a month and with a lag, were buying the same stocks. [05]

Nobody in a parking lot is identified. That is why this layer is legal almost everywhere, and why it is the version funds talk about in public.

## 06 The device {#device}

<!-- figure: auction fan-out. Phone (acid) to exchange to twelve bidders; one "wins the ad", eleven "keep the data". -->

Every ad inside a free app is sold in an auction that lasts a fraction of a second. To run it, the app broadcasts a bid request. Depending on permissions, that request can carry the phone's advertising ID, GPS coordinates, IP address, device details, inferred interests and the app in use. Every bidder receives it, including the ones that lose. EFF's summary is blunt: once data is broadcast this way, "it's almost impossible to know who receives it or control how it's used." [02]

The losing bidders are the business. A company can join auctions it never intends to win, keep the requests and sell what it collects. This is called bidstream data.

<!-- figure: stats ledger -->

- **About 1,000,000,000 phones.** Gravy Analytics and its subsidiary Venntel say they gather more than 17 billion signals a day from about a billion smartphones. [07]
- **More than 500,000,000 advertising IDs** matched to precise location by Mobilewalla between 2018 and 2020, according to the FTC. An estimated 60 percent of its data came from ad auctions. [07] [02]
- **More than 30,000,000 location points** in one sample leaked from Gravy Analytics in January 2025, including devices at the White House, the Kremlin, Vatican City and military bases. Apps named in the data included dating, fitness and transit apps. [08]

## 07 What the bid request does not carry {#overstated}

**Correction** · The popular telling of this stack overstates layer five in four ways.

**Card purchases.** The claim that bidstream data shows "what they purchase via credit-card point-of-sale systems" is wrong. Transaction data is a separate product, sold from card and bank panels. A bid request carries the ID, location, IP, device and app. It doesn't carry your receipt. [02]

**A guaranteed iPhone ID.** Since Apple's App Tracking Transparency prompt in 2021, an app has to ask before it can use the iPhone's advertising ID. Measured opt-in rates sit at roughly 35 to 50 percent globally, depending on whose panel you trust and which kind of app is asking. Many iPhones in the auction show no ID at all. [09]

**Always GPS.** Much of the leaked Gravy data turned out to be location inferred from IP addresses rather than satellite fixes. Plenty of points in these datasets are a city block wide, not a doorstep. [08]

**But Android.** Google announced in October 2025 that it was winding down Privacy Sandbox, its planned replacement for the Android advertising ID. The ID stays on unless the user deletes it. [10]

None of this makes the layer weak. It makes it uneven, and an analyst who treats it as complete will be confidently wrong about the people it misses.

## 08 The night pin {#pin}

<!-- figure: 24-hour clock. Scattered daytime pings; a dense cluster between 22:00 and 06:00 at one point (shock rose pin), joined by a line to: home coordinate, street address, name, year of birth, party, turnout history. -->

An advertising ID is a long random string. It is pseudonymous, not anonymous, and it stops being even that the moment you ask where it sleeps.

A phone that comes to rest at the same coordinate between 22:00 and 06:00, night after night, has a home. A home has an address. An address has registered voters. That single lookup, from coordinate to address to voter record, is where a string of letters becomes a name, a year of birth, often a party and a voting history.

This is the night pin. Everything above it in this edition is context. This is the mechanism.

## 09 Four points {#proof}

<!-- figure: "4 → 95%" plus a 100-cell grid, 95 lit -->

The idea that a location trail can be anonymised has been tested, and it failed. In 2013, researchers studying 15 months of mobility data for 1.5 million people found that four points in space and time were enough to single out 95 percent of them. That was at hourly resolution, using cell-tower locations, which is coarser than the GPS in a modern bid request. [11]

In December 2019 the New York Times obtained a file of more than 50 billion location pings from over 12 million phones, covering several months of 2016 and 2017. Its reporters followed military officials, police and lawyers by name. One phone belonged to a Microsoft employee who visited an Amazon office and took a job there a month later. [15]

That last example is the whole trading pitch in one sentence. It's also why the pitch runs into the law.

## 10 The voter file {#file}

<!-- figure: 50-cell waffle. 29 acid (non-commercial only), 9 malachite (election or government only), 12 dark (silent on use). -->

A voter file is the most reliable identity list in American public life. Almost every state's file carries name and home address. Many add party, voting history and year of birth. A few add phone numbers, sex or race. [12]

It is public, but it is not free to use however you like. According to the National Conference of State Legislatures:

- **29 states** restrict use of the voter list to non-commercial purposes.
- **9 more** restrict it to election, political or government purposes.
- **12** are silent on use. NCSL's survey records no state that expressly allows any use. [12]

**Correction** · A trading desk is a commercial user. The popular pitch, which grounds bidstream profiles in voter files to sharpen trading signals, skips the fact that in 38 states the input is restricted against exactly that.

## 11 Where the join is legal {#legal}

The join is legal, and growing, in the place the voter file was built for: politics.

On 18 June 2026, the ad-tech company Nexxen and the data firm L2 launched VoterMatch. It joins L2's national voter file to Nexxen's ad-auction logs so that campaigns can see which registered voters an ad reached and how often. Neither company disclosed the matching method or match rates. [13]

Layers five and six have also been combined in public, outside a campaign. In June 2020 Mobilewalla published the race, gender and age mix of protesters in New York, Los Angeles, Minneapolis and Atlanta, derived from phone data. Its founder said no agency had asked for it. [19] In December 2024 the FTC alleged that Mobilewalla had built audience segments of protesters and of women visiting health clinics, and its order bars the company from selling sensitive location data. [07]

## 12 The three trades {#trades}

The pitch that circulates offers three ways to turn the full stack into trading returns. Checked against the record:

**01 Foot traffic · Works.** Sold as counts per store, not per person. In 2019 Thasos offered quantitative hedge funds daily visit counts for more than 600,000 US properties, built from phone location data. The satellite studies show the same edge from orbit. [14] [05]

**02 Named people · Barred at the source.** Tracking specific people at offices and homes is what the FTC has spent two years shutting down. The Gravy, Venntel and Mobilewalla orders bar the sale of sensitive location data, and Mobilewalla's explicitly covers data showing where people live. Kochava's order, filed in May 2026, bars sale of sensitive location data without the consumer's express consent. [07] [18] And a firm that trades on data obtained by breaking the promise under which it was shared is in App Annie's position. [04]

**03 Voter blocks · Unproven.** In 38 states the input is restricted against commercial use, and there is no published evidence that location-weighted voter blocks forecast elections better than polling. [12]

The legitimate trade is the boring one. The exotic trades are either illegal at the source or untested.

## 13 Who buys the whole stack {#buyers}

<!-- figure: "$27,000,000" -->

If funds mostly buy aggregates, who buys at the level of a person? The public record answers it. States.

- **FBI.** A 2022 contract worth up to $27 million for 5,000 licences to Babel Street's Locate X, which runs on Venntel's location data. [07]
- **DHS.** According to the ACLU, about 113,654 location points obtained over three days in 2018. [07]
- **CBP.** A 2019 to 2021 pilot using "commercially available marketing location data", including data sourced from ad auctions. CBP's own document says "RTB-sourced location data is recorded when an advertisement is served." [02]
- **ICE.** Bought the Webloc tool in 2025. It tracks millions of phones and can filter by advertising ID. [02]
- **The US military.** Several branches bought access to Augury's NetFlow data. [03]

The intelligence community has said as much about itself. A January 2022 report by a senior advisory group to the Director of National Intelligence, declassified in June 2023, states that commercially available information "includes information on nearly everyone," and that it could be used "to cause harm to an individual's reputation, emotional well-being, or physical safety." [16]

## 14 The law {#law}

<!-- figure: "29.06.26" -->

**Decided.** On 29 June 2026 the Supreme Court held in *Chatrie v. United States* that police conducted a Fourth Amendment search when they obtained a person's phone location data from Google. Justice Kagan wrote for the Court. Questions of warrant particularity and good faith went back to the lower courts. [17]

**Not decided.** Whether buying the same kind of data is a search. The FBI's position that purchased data needs no warrant has not been tested in court. [01]

**Pending.** The Government Surveillance Reform Act, introduced on 12 March 2026 by Senators Wyden and Lee with Representatives Davidson and Lofgren, would, in its sponsors' words, ban "the federal government from buying Americans' data from data brokers without a warrant." It has not passed. Its vehicle is the renewal of Section 702, the government's warrantless foreign-intelligence surveillance law, which lapsed in June 2026 after Congress failed to agree on reauthorization; existing authorizations run to March 2027. As of late October no federal restriction on government data purchases had been enacted. A few states, Montana among them, restrict purchases by their own agencies. [22] [20] [21] [02]

**Settled.** The FTC's orders against Gravy, Venntel and Mobilewalla, and the Kochava order filed in May 2026, restrict the sale of sensitive location data by those companies. They do not regulate the buyers. [07] [18]

## 15 View {#view}

<!-- Render on the View surface: signed, labelled as opinion, rose field behind. JESSE TO CONFIRM OR REWRITE BEFORE PUBLISHING. -->

**View · Jesse James**

Chatrie put a warrant in front of the data police ask for.

Nothing stands in front of the data they buy.

The cheapest warrant is a purchase order.

## 16 The off switch {#off}

Layer five is the only layer in this stack that you control directly, and it takes about a minute.

- **Android.** Settings, Privacy, Ads, Delete advertising ID. The exact path varies by manufacturer.
- **iPhone.** Settings, Privacy & Security, Tracking. Turn off Allow Apps to Request to Track.
- **Every app.** Give location access only while the app is in use, and choose approximate location wherever the app still works with it. [02]

That doesn't remove you from the voter file, and it doesn't touch the IP address every connection carries. It does take the most precise identifier out of the auction.

## 17 Sources {#sources}

01. TechCrunch, 18 Mar 2026. FBI is buying location data to track US citizens, director confirms. https://techcrunch.com/2026/03/18/fbi-is-buying-location-data-to-track-us-citizens-kash-patel-wyden/
02. Electronic Frontier Foundation, Lena Cohen and Hudson Hongo, 5 Mar 2026. Targeted advertising gives your location to the government. Just ask CBP. https://www.eff.org/deeplinks/2026/03/targeted-advertising-gives-your-location-government-just-ask-cbp
03. IAPP, citing Vice, 23 Sep 2022. Report: US military buys internet monitoring tool that covers 90% of web traffic. https://iapp.org/news/a/report-us-military-buys-internet-monitoring-tool-that-covers-90-of-web-traffic/
04. US Securities and Exchange Commission, Press Release 2021-176, 14 Sep 2021. https://www.sec.gov/newsroom/press-releases/2021-176
05. Berkeley Haas Newsroom, May 2019. How hedge funds use satellite images to beat Wall Street and Main Street. https://newsroom.haas.berkeley.edu/how-hedge-funds-use-satellite-images-to-beat-wall-street-and-main-street/
06. Shodan. https://www.shodan.io/
07. The Record, 3 Dec 2024. FTC actions against Gravy Analytics, Venntel and Mobilewalla. https://therecord.media/ftc-location-data-brokers-gravy-venntel-mobilewalla
08. TechCrunch, 13 Jan 2025. Gravy Analytics data broker breach: trove of location data threatens privacy of millions. https://techcrunch.com/2025/01/13/gravy-analytics-data-broker-breach-trove-of-location-data-threatens-privacy-millions/
09. Moburst, 2026. IDFA in 2026: what has actually happened since App Tracking Transparency launched (citing AppsFlyer and Adjust). https://www.moburst.com/blog/idfa-att-update/
10. Playio, 2025. Privacy Sandbox shutdown and Android game marketing. https://blog.playio.co/privacy-sandbox-shutdown-android-game-marketing
11. de Montjoye, Hidalgo, Verleysen, Blondel. Unique in the Crowd: the privacy bounds of human mobility. Scientific Reports 3, 1376 (2013). https://www.nature.com/articles/srep01376
12. National Conference of State Legislatures. Access to and use of voter registration lists. https://www.ncsl.org/research/elections-and-campaigns/access-to-and-use-of-voter-registration-lists.aspx
13. Nexxen, 18 Jun 2026. Nexxen and L2 Data launch VoterMatch. https://nexxen.com/nexxen-and-l2-data-launch-votermatch-bringing-greater-precision-transparency-and-performance-to-political-advertising/
14. PR Newswire, 20 May 2019. Thasos launches QStreams for quantitative hedge funds. https://www.prnewswire.com/news-releases/thasos-launches-qstreams-offering-quantitative-hedge-funds-unprecedented-insight-into-consumer-foot-traffic-300852747.html
15. New York Times Privacy Project, 19 Dec 2019. Twelve Million Phones, One Dataset, Zero Privacy (summary via TidBITS). https://tidbits.com/2019/12/19/the-new-york-times-reveals-how-completely-our-every-move-is-tracked/
16. Fortune, 13 Jun 2023, on the ODNI Senior Advisory Group report. https://fortune.com/2023/06/13/u-s-intelligence-agencies-commercially-available-information-spy-on-americans
17. Chatrie v. United States, decided 29 Jun 2026. https://en.wikipedia.org/wiki/Chatrie_v._United_States
18. PPC Land, May 2026. FTC closes Kochava location data case with strict consent rules. https://ppc.land/ftc-closes-kochava-location-data-case-with-strict-consent-rules/
19. Mobilewalla, June 2020 protest demographics report and FTC action. https://en.wikipedia.org/wiki/Mobilewalla
20. Proton, 12 Jun 2026, updated 15 Jun 2026. FISA Section 702 just expired. What's next for warrantless spying? https://proton.me/blog/fisa-702-expiring-surveillance-reform
21. Brennan Center for Justice. Section 702 of FISA: 2026 resource page (updated 27 Oct 2026). https://www.brennancenter.org/our-work/research-reports/section-702-foreign-intelligence-surveillance-act-fisa-2026-resource-page
22. Office of Senator Ron Wyden, 12 Mar 2026. Wyden, Lee, Davidson and Lofgren introduce bill to reform FISA Section 702 and plug data broker surveillance loophole. https://www.wyden.senate.gov/news/press-releases/wyden-lee-davidson-and-lofgren-introduce-bill-to-reform-fisa-section-702-protect-americans-constitutional-rights-and-plug-data-broker-surveillance-loophole
