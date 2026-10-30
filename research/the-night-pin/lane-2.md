# Lane 2 (Shodan and Augury NetFlow), The Night Pin, Edition 11

Source file: /home/user/aedificare/source/the-night-pin.web.md (claims in sections 02, 03 and 13; sources 03 and 06 in section 17).
Read date for every primary below: 2026-10-30.

Summary: 1 could not open (cited Shodan homepage returned 403; developer docs read instead), 2 holds, 3 overstated, 4 could not open (Vice original not reachable), 5 holds.

Access notes: shodan.io returned 403. wyden.senate.gov press release returned 403. epic.org returned 403. partners.team-cymru.com returned 503. vice.com/en/article/y3pnkw and the full slug of the Vice "Revealed" story returned 404. The IAPP article at /news/a/ returned 404; /news/b/ returned a listing page with no article body. No walls were routed around. Several quotes below come from a fetch tool's summary of a page; they are marked as such and should be checked against the page before reuse. Quotes marked "via" come from a secondary report that quotes the primary; the primary itself was not opened.

---

## 1. Shodan crawls the internet and indexes devices that answer: servers, webcams, routers, building controllers, industrial equipment; searchable by port, product, country, owning network.

Verdict: could not open

Primary: Shodan, Shodan homepage (cited by the edition as [06]), https://www.shodan.io/ (403, not opened). Read in its place: Shodan, Developer API documentation, https://developer.shodan.io/api. Neither page shows a publication date.

Read: 2026-10-30

Quote (developer.shodan.io/api, crawl method section): "This method returns a list of port numbers that the crawlers are looking for."
Quote (developer.shodan.io/api, search section): "The provided string is used to search the database of banners in Shodan"
Quote (developer.shodan.io/api, filters section): "For example, the following search query would find Apache Web servers located in Germany:" followed by the query "apache country:DE"

True as: Shodan is a search engine for internet-connected devices. It crawls the internet on the ports it scans and stores the banners of services that answer, which can include servers, webcams, routers and industrial equipment. You can search those results by port, product and country, and by organisation.

Notes: The cited homepage returned 403, so the device list and the phrase "indexes every device that answers" are not confirmed from the cited page. The developer docs support a narrower claim: Shodan crawls specific ports, stores service banners, and offers filters including port, product and country, with "org" appearing as a facet. The docs do not say Shodan indexes every device. "Every device that answers" is overstated for the ports Shodan actually scans. The device categories (webcams, building controllers, industrial equipment) were not verified in any page I could read. The network-ownership filter is not named in the docs text I read, so I have written "organisation" rather than "network".

---

## 2. NetFlow records which address talked to which, when, on what port, and how much, not content.

Verdict: holds

Primary: Internet Engineering Task Force, RFC 3954, "Cisco Systems NetFlow Services Export Version 9", https://www.rfc-editor.org/rfc/rfc3954 (publication date not checked on the page). The edition's cited source [03] is IAPP citing Vice, which is not the primary for the definition, so the RFC is used. Team Cymru's own page is used for the no-content point.
Secondary for no-content point: Team Cymru, "Debunking Myths: Team Cymru's Fact-Based Insights" (Myth vs Fact), dated 26 Sep 2022 in the fetch summary, https://www.team-cymru.com/post/team-cymru-myth-vs-fact

Read: 2026-10-30

Quote (RFC 3954, section 1): "A flow is defined as a unidirectional sequence of packets with some common properties that pass through a network device."
Quote (RFC 3954, section 1): "flow records include details such as IP addresses, packet and byte counts, timestamps, Type of Service (ToS)," and "application ports, input and output interfaces, etc."
Quote (Team Cymru, Myth vs Fact, as extracted by the fetch tool): "Netflow data includes only headers such as protocol and device IP addresses."

True as: No change needed. For precision: NetFlow records which address sent packets to which, when, on which port, and how many bytes and packets, taken from packet headers. It does not record the content.

Notes: The RFC contains no sentence stating that payload is not recorded; it describes fields as packet header fields, counts and timestamps. The no-content point rests on the Team Cymru page, which is the vendor's own statement and concerns Augury's data specifically. The RFC describes flows as unidirectional, so "talked to" is loose; it is fair for a general reader.

---

## 3. Team Cymru's Augury draws on 550 collection points worldwide and adds at least 100 billion records a day.

Verdict: overstated

Primary: Sen. Ron Wyden's letter to the Pentagon Inspector General, 21 Sep 2022. Its press release, https://www.wyden.senate.gov/news/press-releases/wyden-government-watchdogs-must-investigate-warrantless-purchases-of-americans-internet-browsing-data-by-federal-agencies, returned 403 and was not opened. The letter's content is read through two secondary reports that quote it:
- Thomas Claburn, The Register, 22 Sep 2022, published 22:53 UTC, https://www.theregister.com/2022/09/22/federal_agencies_american_data/
- Tom Parker, Reclaim The Net, 23 Sep 2022, https://reclaimthenet.org/us-military-augury-mass-monitoring-tool

Team Cymru's own response: "Debunking Myths: Team Cymru's Fact-Based Insights" (Myth vs Fact), 26 Sep 2022, https://www.team-cymru.com/post/team-cymru-myth-vs-fact

Read: 2026-10-30

Quote (The Register, quoting Wyden's letter): "from over 550 collection points worldwide"
Quote (The Register, quoting Wyden's letter): "is updated with at least 100 billion new records each day."
Quote (Reclaim The Net, summarising Wyden's letter): Augury provides access to network data "from over 550 collection points worldwide." Same records, per Wyden: the platform "is updated with at least 100 billion new records each day."
Quote (Team Cymru, Myth vs Fact, as extracted by the fetch tool): "Augury does not provide anyone access to raw or bulk netflow data"
Quote (Team Cymru, Myth vs Fact, as extracted by the fetch tool): "It is sampled and thus sees only approximately 1 in every 10,000 netflow."

True as: Wyden's letter, citing public contracting records, says Augury draws on more than 550 collection points worldwide and is updated with at least 100 billion new records each day. Team Cymru says Augury gives no one access to raw or bulk netflow and that its netflow is sampled.

Notes: The edition states the figures as fact about Augury and cites [03] (IAPP citing Vice). The figures come from Wyden's letter, which cites contracting records; I found no Team Cymru statement giving them. Team Cymru's Myth vs Fact post states no collection-point count and no daily record volume for Augury, and it disputes bulk access. "Adds" is close to "is updated with" but is not the same. The original Vice/Motherboard article (Joseph Cox, Sept 2022) was not opened: vice.com/en/article/y3pnkw returned 404. The IAPP page cited as [03] returned 404 at /news/a/. Team Cymru's Augury partner page (partners.team-cymru.com/auguryerhy45) returned 503. A search for Team Cymru's own Augury figures (550 points, 100 billion a day) turned up only a forum thread quoting the description; I did not open that thread.

---

## 4. Contracting records reviewed by Vice put its reach at about 90 percent of global internet traffic.

Verdict: could not open

Primary: Vice (Motherboard), "Revealed: US Military Bought Mass Monitoring Tool That Includes Internet Browsing, Email Data", Joseph Cox, September 2022 (exact date not confirmed; a Slashdot repost is dated 21 Sep 2022). Not opened: vice.com/en/article/y3pnkw returned 404.
Secondary read: S.T.O.P. (Stop Spying), press release, 21 Sep 2022, https://www.stopspying.org/content-input/2022/9/21/stop-condemns-dod-fbi-buying-90-of-internet-data
Secondary read: Tom Parker, Reclaim The Net, 23 Sep 2022, https://reclaimthenet.org/us-military-augury-mass-monitoring-tool

Read: 2026-10-30

Quote (S.T.O.P., 21 Sep 2022): "an internet monitoring tool that claims to surveil 90% of the world's internet traffic data."
Quote (Reclaim The Net, 23 Sep 2022, summarising a security firm, Cosive): Augury gives "visibility into 93% of the internet traffic." Reclaim's lede, in its own voice: "reportedly covers 93% of the world's internet traffic"
Headline only (IAPP, from the search result title; the article body was not available): "Report: US military buys internet monitoring tool that covers 90% of web traffic"
Vice, Matthew Gault, 22 Sep 2022 (https://vice.com/en/article/cyber-inside-the-tool-the-us-military-is-using-to-monitor-emails-and-web-traffic): a fetch of the full article found no percentage of traffic, no collection-point count and no daily volume. This is not a quote.

True as: Augury's maker is reported to claim the tool covers about 90 percent of the world's internet traffic.

Notes: The edition attributes 90 percent to "contracting records reviewed by Vice". I could not open the Vice original, so I cannot confirm whether any contract record gives the figure. What I could read points elsewhere. S.T.O.P. attributes 90 percent to the tool's own claim ("claims to surveil"). Reclaim reports 93 percent, attributed to an outside firm. The Register's summary of Wyden's letter gives the 550-point and 100-billion figures but no percentage; The Dissenter (Kevin Gosztola, 22 Sep 2022) gives no percentage. The Vice Gault article I could open has no percentage. The sources disagree (90 against 93), and the IAPP headline and S.T.O.P. speak of "internet" or "web" traffic, not "global internet traffic" from contracts. Two outlets repeating one briefing count as one source. I did not search contract records directly; none were in the reporting I could reach. To settle this, the Vice original needs to be read and checked for any figure attributed to a contract.

---

## 5. Its buyers included several branches of the US military.

Verdict: holds

Primary: Vice (Motherboard), Matthew Gault, "Cyber Inside the Tool the US Military Is Using to Monitor Emails and Web Traffic", 22 Sep 2022, 9:00am. https://vice.com/en/article/cyber-inside-the-tool-the-us-military-is-using-to-monitor-emails-and-web-traffic
Secondary, quoting Wyden's letter and public contracts: The Register, Thomas Claburn, 22 Sep 2022 (https://www.theregister.com/2022/09/22/federal_agencies_american_data/); The Dissenter, Kevin Gosztola, 22 Sep 2022 (https://thedissenter.org/military-whistleblower-pentagons-warrantless-purchase-internet-data/).

Read: 2026-10-30

Quote (Vice, Matthew Gault, 22 Sep 2022, as extracted by the fetch tool): "Cyber Command, the Army, the Navy, are all using Augury to paw through internet traffic."
Paraphrase (Reclaim The Net, citing Motherboard; not a quote): the Navy, the Army, Cyber Command and the Defense Counterintelligence and Security Agency together paid at least $3.5 million to access Augury.
Quote (The Register, quoting Wyden's letter, as extracted by the fetch tool): "NCIS is purchasing access to data, which includes netflow records and some communications content, from Team Cymru"

True as: Several military branches bought access to Augury, according to Vice's reporting: Cyber Command, the Army and the Navy.

Notes: Per the reporting, the Vice article names Cyber Command, the Army and the Navy as using Augury. The $3.5 million figure and the Defense Counterintelligence and Security Agency come from a secondary summary of Motherboard, not from the article I could open. Wyden's letter, as the Register reports it, says public records show the Naval Criminal Investigative Service (NCIS) has a contract to use Augury. Reclaim says the Argonne Ridge Group contracts for Cyber Command and the Army do not name Augury, and that the FBI and Secret Service are also tied to Argonne Ridge Group contracts; those should not be counted as Augury buyers. The edition's "Augury's NetFlow data" is consistent with Team Cymru's page (Augury uses sampled netflow) and with the Register's account of Wyden's letter (netflow records). The Vice text quote is from a fetch-tool extraction, not a direct read of the page.
