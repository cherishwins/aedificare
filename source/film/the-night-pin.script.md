# The Night Pin: film script and YouTube package

Edition 11 · aedificare.art/the-night-pin · Draft for Jesse, 30 Oct 2026

Every line of narration is sourced from the web edition. The bracketed numbers match its source list. They are not read aloud; they appear on screen as small mono tags when the figure is shown.

**How the script is laid out:** **VO** is what the narrator says. **SCREEN** is what the frame shows at that moment, following the Cool Worlds rule: one idea, seen and heard together. Lines marked **SCEPTIC** are for the second voice. That voice is an experiment you haven't approved yet, so every sceptic line can be cut without breaking the script around it.

---

## Chapter 0 · Cold open

**VO:** In March, the director of the FBI was asked, under oath, to commit to not buying Americans' location data.
**SCREEN:** Black. Mono readout types in: 18.03.2026 · US SENATE · UNDER OATH. [01]

**VO:** He didn't. He said the Bureau buys commercially available information, and that it has led to "some valuable intelligence."
**SCREEN:** The quote builds word by word in Bricolage. "valuable intelligence" lands in Acid on the beat it is spoken.

**VO:** Here's what almost nobody explains. The data being bought doesn't come with names attached. It gets one at night.
**SCREEN:** Hard cut to a 24-hour clock ring. One square pulses at its centre.

**VO:** In the next ten minutes you'll see the six layers of data anyone can buy, the one lookup that turns a phone into a person, what the popular version of this story gets wrong, and the setting you can switch off in under a minute.
**SCREEN:** The six bands stack up from the bottom, one per clause, too fast to read. Then they hold.

## Chapter 1 · Six layers

**VO:** Picture the stack as six layers.
**SCREEN:** The six-layer stack figure, bands unlabelled.

**VO:** At the bottom, machines. Then the traffic between them. Then what people open on their screens. Then what satellites see. Then where phones go. And at the top, names.
**SCREEN:** Each band's label snaps in as it is named: Structure, Network, Attention, Orbit, Device, Identity. Identity fills Acid.

**VO:** The first four layers watch things. The last two watch people. Almost everything that matters happens where those two meet.
**SCREEN:** A Malachite hairline divides bands 1 to 4 from 5 and 6.

## Chapter 2 · Machines and traffic

**VO:** Layer one is Shodan, a search engine for machines. It crawls the internet and indexes every device that answers: servers, webcams, routers, industrial controllers. [06]
**SCREEN:** A Shodan-style results list, built as a computed table: device type, port, country. No real addresses.

**VO:** It maps machines. A camera on Shodan is a camera, not a person.
**SCREEN:** One row highlights: "camera". Its "owner" column stays empty.

**VO:** Layer two is NetFlow, the metadata of internet traffic. Which address talked to which, when, and how much. Not what was said.
**SCREEN:** The illustrative flow record from the edition types out: SRC 203.0.113.7, DST 198.51.100.24, PORT 443, BYTES 18,442. A caption reads: documentation addresses, not real traffic.

**VO:** It sounds harmless until you see the scale. One product, Team Cymru's Augury, draws on five hundred and fifty collection points and adds a hundred billion records a day. Contract records put its reach near ninety percent of global internet traffic. Its buyers included several branches of the US military. [03]
**SCREEN:** 550 dots appear on a bare world grid. A counter runs to 100,000,000,000. Then "90%" fills the frame in Acid.

**SCEPTIC:** Ninety percent of everything? That sounds like a sales deck.
**VO:** It's a figure from contracting records, as reported. Treat it as the vendor's reach, not as a measurement.
**SCREEN:** The 90% shrinks to a corner with a mono tag: "AS REPORTED · [03]".

## Chapter 3 · Attention

**VO:** Layer three is attention. Panels estimate what people download, open and stream. Investment firms buy those estimates because app usage moves before revenue does.
**SCREEN:** Two lines on one axis: app usage rises, and revenue follows a quarter later.

**VO:** The first securities-fraud case against an alternative-data vendor came from this layer. App Annie told companies their data would be aggregated and anonymised. From 2014 to 2018 it used the raw data to tune the estimates it sold to trading firms. [04]
**SCREEN:** Two documents side by side. Left, the promise: "aggregated and anonymised". Right, the practice: "non-aggregated, non-anonymised". The gap between them highlights.

**VO:** The SEC settled with the company for ten million dollars. Its co-founder paid three hundred thousand and accepted a three-year bar from serving as an officer of a public company. [04]
**SCREEN:** "$10,000,000" in Acid, then "$300,000" and "3-YEAR BAR" in Flash.

**VO:** The lesson: in this business, the risk is in where the data came from, not in the model built on it.
**SCREEN:** Hold on one line: "THE RISK LIVES IN PROVENANCE."

## Chapter 4 · Orbit

**VO:** Layer four is the famous one. Satellites photograph retailers' parking lots, and software counts the cars.
**SCREEN:** A parking lot grid fills with Flash stalls.

**VO:** Researchers at Berkeley studied 4.8 million of these images covering 67,000 stores of 44 retailers. Funds with the data earned four to five percent in the three days around earnings. [05]
**SCREEN:** The stats arrive in sequence as they're spoken: 4.8M, 67,000, 44. Then "4 to 5%" in Acid.

**VO:** The edge was biggest when betting against a retailer. Individual investors were buying the same stocks the funds were shorting. [05]
**SCREEN:** Two lots side by side, Quarter A 82 percent full and Quarter B 41 percent full. An arrow labelled "SHORT" points at B.

**VO:** And notice: nobody in that parking lot is identified. That's why this layer is legal almost everywhere, and why it's the one funds talk about in public.
**SCREEN:** Zoom into one stall: a car, no name.

## Chapter 5 · Every ad is an auction

**VO:** Now layer five. Every ad inside a free app is sold in an auction that lasts a fraction of a second.
**SCREEN:** The auction figure. A phone in Acid on the left.

**VO:** To run that auction, the app sends out a bid request. Depending on permissions, it can carry the phone's advertising ID, GPS coordinates, IP address, device details and the app in use. [02]
**SCREEN:** The fields stack beside the phone as each is named: AD ID, GPS, IP, DEVICE, APP.

**VO:** It goes to every bidder. The winner shows you an ad. Every loser still gets the request. [02]
**SCREEN:** Twelve lines fan out to twelve bidders. One turns Flash, labelled "WINS THE AD". The other eleven are labelled "KEEPS THE DATA", one after another.

**VO:** That's the business model. A company can join auctions it never plans to win, keep the requests, and sell what it collects. It's called bidstream data.
**SCREEN:** The eleven losing lines feed into one box labelled "BROKER".

**VO:** The scale is hard to picture. Gravy Analytics and Venntel say they draw on about a billion smartphones. Mobilewalla matched more than five hundred million advertising IDs to precise locations. And in January 2025 a leaked sample from Gravy held more than thirty million location points, including devices at the White House, the Kremlin and the Vatican. [07] [08]
**SCREEN:** "1,000,000,000" in Acid. "500,000,000+" in Flash. "30,000,000+" in Flash, followed by three dots on a bare map, labelled.

## Chapter 6 · What the popular version gets wrong

**SCEPTIC:** So the auction knows everything I buy, too.
**VO:** No. That's the first thing the popular version gets wrong.
**SCREEN:** Hard cut to Flash. Black type: "NOT IN THE BID REQUEST".

**VO:** Card purchases aren't in a bid request. Transaction data is a separate product, sold from card and bank panels. [02]
**SCREEN:** "CARD PURCHASES" types out, then gets struck through.

**VO:** On an iPhone, apps have had to ask before tracking since 2021. Only about thirty-five to fifty percent of people say yes. [09]
**SCREEN:** A 100-cell grid with between 35 and 50 cells lit, the range shown as a band.

**VO:** And much of the leaked Gravy data turned out to be location guessed from an IP address, not a satellite fix. [08]
**SCREEN:** A precise pin blurs into a block-sized circle.

**VO:** But on Android, the advertising ID stays on unless you delete it. Google wound down its planned replacement in October 2025. [10]
**SCREEN:** Android label. The ID string stays lit.

**VO:** So the layer is uneven, not weak. And it's about to get its name.
**SCREEN:** Cut to black.

## Chapter 7 · The night pin

**VO:** An advertising ID is a long random string. It doesn't have a name. It does have a bedtime.
**SCREEN:** A random ID string types out. Then the 24-hour clock.

**VO:** Watch one phone for a week. During the day it moves around.
**SCREEN:** Flash squares scatter across the daytime half of the clock.

**VO:** But between ten at night and six in the morning, it comes to rest in the same place, night after night.
**SCREEN:** The 22:00 to 06:00 arc lights Malachite. Squares pile into one tight cluster at the centre.

**VO:** A phone that sleeps in one place has a home. A home has an address. And an address has registered voters.
**SCREEN:** The pin turns Shock rose. A line runs from it to the record: HOME COORDINATE, STREET ADDRESS, NAME. Each appears as it is spoken.

**VO:** That's the night pin. One lookup, from coordinate to address to voter record, and a random string becomes a name, a year of birth, often a party and a voting history.
**SCREEN:** The rest of the record fills in: YEAR OF BIRTH, PARTY, TURNOUT HISTORY. Hold for a full beat.

## Chapter 8 · Four points

**SCEPTIC:** Location data gets anonymised, though. Doesn't it?
**VO:** That's been tested. In 2013, researchers looked at fifteen months of location data for one and a half million people. Four points in place and time were enough to single out ninety-five percent of them. And that was at cell-tower precision, coarser than the GPS in a bid request. [11]
**SCREEN:** "4" in Flash, an arrow, then "95%" in Acid. A 100-cell grid lights to 95.

**VO:** In 2019 the New York Times got hold of fifty billion location pings from twelve million phones. Reporters followed officials, police and lawyers by name. One phone belonged to a Microsoft employee who visited an Amazon office, and took a job there a month later. [15]
**SCREEN:** Two dots labelled MICROSOFT and AMAZON. A path runs between them, then a date counter advances one month.

**VO:** That one example is the whole trading pitch. It's also where the pitch runs into the law.
**SCREEN:** The path freezes.

## Chapter 9 · The voter file

**VO:** A voter file is the most reliable identity list in American public life. Name and home address almost everywhere. Often party, voting history and year of birth. [12]
**SCREEN:** The waffle grid of 50 squares appears, uncoloured.

**VO:** It's public, but it isn't free to use however you like. Twenty-nine states restrict it to non-commercial use. Nine more limit it to election, political or government purposes. Twelve are silent. No state's rules expressly allow any use. [12]
**SCREEN:** 29 squares fill Acid as "twenty-nine" is spoken, 9 fill Malachite, and 12 stay dark.

**VO:** A trading desk is a commercial user. In thirty-eight states, the input that makes the night pin work is restricted against exactly that.
**SCREEN:** "38" in Flash over the coloured squares.

**VO:** Where the join is legal is politics. In June 2026, L2 and Nexxen launched a product that joins the national voter file to ad-auction logs, so campaigns can see which voters an ad reached and how often. They haven't said how the matching works. [13]
**SCREEN:** The join figure: VOTER FILE on the left, AD-AUCTION LOG on the right, a Flash square marked JOIN between them.

## Chapter 10 · Three trades, checked

**VO:** So does the full stack make money for funds? The pitch offers three trades. Here they are against the record.
**SCREEN:** "ALPHA?" at full scale.

**VO:** One: foot traffic. It works, and it's sold as counts per store, not per person. [14] [05]
**SCREEN:** "01 FOOT TRAFFIC / WORKS" in Acid.

**VO:** Two: tracking named people at offices and homes. The FTC has spent two years shutting that down at the source, and trading on data obtained by breaking a promise is the App Annie case. [07] [18] [04]
**SCREEN:** "02 NAMED PEOPLE / BARRED AT THE SOURCE" in Flash.

**VO:** Three: calling elections from voter blocks. The input is restricted in thirty-eight states, and there's no published evidence it beats polling. [12]
**SCREEN:** "03 VOTER BLOCKS / UNPROVEN" in Flash.

**VO:** The legal trade is the boring one.
**SCREEN:** Hold.

## Chapter 11 · Who buys the whole stack

**VO:** So if funds mostly buy aggregates, who buys at the level of a person? The public record answers that. Governments.
**SCREEN:** "NOT FUNDS. STATES." at full scale.

**VO:** The FBI signed a contract worth up to twenty-seven million dollars for five thousand licences to a tool built on Venntel's location data. [07]
**SCREEN:** "$27,000,000" in Acid.

**VO:** Homeland Security obtained more than a hundred and thirteen thousand location points in three days. Customs and Border Protection ran a pilot on location data sourced from ad auctions. ICE bought a tool that filters millions of phones by advertising ID. [07] [02]
**SCREEN:** DHS, CBP and ICE stamp in, one per sentence, each with its figure.

**VO:** And an intelligence community report, declassified in 2023, put it in five words: commercially available information "includes information on nearly everyone." [16]
**SCREEN:** The quote, with "nearly everyone" in Acid.

## Chapter 12 · The law

**VO:** In June, the Supreme Court decided Chatrie. Getting a person's phone location data from Google is a Fourth Amendment search. [17]
**SCREEN:** "29.06.26" in Acid. "CHATRIE V. UNITED STATES" in mono.

**VO:** What it didn't decide is whether buying that data is a search. The FBI's view is that it isn't, and no court has tested that. [01]
**SCREEN:** Two doors. One labelled ASK, with "WARRANT" across it. One labelled BUY, empty.

**VO:** A bill introduced in March would, in its sponsors' words, ban the federal government from buying Americans' data from brokers without a warrant. It hasn't passed. Its vehicle is Section 702, the government's warrantless foreign-intelligence surveillance law. That lapsed in June, and existing authorizations run to March 2027. [22] [20] [21]
**SCREEN:** "PENDING" in mono over the empty door. "702 · LAPSED 06.2026 · DEADLINE 03.2027" types underneath.

## Chapter 13 · View

**VO (signed opinion, delivered over a labelled VIEW card):** This part is opinion, and it's Jesse James's. Chatrie put a warrant in front of the data police ask for. Nothing stands in front of the data they buy. The cheapest warrant is a purchase order.
**SCREEN:** Rose field, Malachite. "VIEW · JESSE JAMES" in mono. The three lines appear as spoken, the last in Acid.

*Jesse to confirm or rewrite this line before rendering, the same as on the carousel.*

## Chapter 14 · The off switch

**VO:** Layer five is the only one you control directly, and it takes a minute.
**SCREEN:** Hard cut to Flash.

**VO:** On Android: Settings, Privacy, Ads, Delete advertising ID. On an iPhone: Settings, Privacy and Security, Tracking, and turn off Allow Apps to Request to Track. And for every app, give location only while you're using it, and approximate where the app still works. [02]
**SCREEN:** Each path types out as it is spoken. Mono, Void on Flash.

**VO:** It won't take you out of the voter file. It does take the most precise identifier out of the auction.
**SCREEN:** The auction figure returns. The phone's AD ID field goes dark.

## Chapter 15 · Sources

**VO:** Every figure in this film is sourced in the written edition at aedificare.art.
**SCREEN:** The source list scrolls. Last frame: aedificare.art/the-night-pin, and the seed in mono.

---

## Chapter markers (estimated)

Estimated from narration length at 150 words per minute. Replace them with the real timecodes from the render before publishing; the chapter names stay.

0:00 Cold open
0:42 Six layers
1:06 Machines and traffic
2:03 Attention
2:52 Orbit
3:31 Every ad is an auction
4:34 What the popular version gets wrong
5:22 The night pin
6:05 Four points
6:54 The voter file
7:49 Three trades, checked
8:30 Who buys the whole stack
9:14 The law
9:50 View
10:06 The off switch
10:39 Sources

## YouTube package

**Title (58 characters):** How ad-auction location data becomes a name: The Night Pin

The searchable noun is inside the first 40 characters, and every claim in the title is in the film.

**Description:**

```
https://aedificare.art/the-night-pin

The FBI says it buys commercial data. How six layers, from Shodan to ad IDs and voter files, join into one named person, and what the usual version gets wrong.

Edition 11 · 30 Oct 2026 · 22 sources, all in the written edition.

0:00 Cold open
0:42 Six layers
1:06 Machines and traffic
2:03 Attention
2:52 Orbit
3:31 Every ad is an auction
4:34 What the popular version gets wrong
5:22 The night pin
6:05 Four points
6:54 The voter file
7:49 Three trades, checked
8:30 Who buys the whole stack
9:14 The law
9:50 View
10:06 The off switch
10:39 Sources

The written edition is CC BY 4.0: quote it, translate it, train on it; credit Aedificare and link the edition.

The narration voice is synthetic. Every frame and the music are computed from a formula with a fixed seed. No third-party audio.
```

**Thumbnail:** Void ground. "95%" in Acid at full height, cropped by the right edge. "4 POINTS" in Flash mono, small, bottom left. Seed logged at 10 px. A stranger asks "95 percent of what?", which is the click. Check it at 170 px wide.

**Captions:** upload the VO lines as a transcript file and let YouTube auto-sync the timing. Don't upload the SCREEN lines.

**Channel hygiene:** before you upload, list every existing upload (private, unlisted and scheduled included) and confirm nothing else is tied to Edition 11. Pick a day of its own at the channel's usual hour.

## Decisions for Jesse

1. **The sceptic voice:** keep the four SCEPTIC lines as the first test of the second voice, or cut them. The script reads cleanly either way.
2. **The View line in Chapter 13:** confirm or rewrite.
3. **The title:** "The Night Pin" is still a working title.
