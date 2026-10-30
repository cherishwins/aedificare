# Skeptic, lane 2 (Shodan and Augury NetFlow), The Night Pin, Edition 11

Researcher's file: /home/user/aedificare/research/the-night-pin/lane-2.md
Edition text: /home/user/aedificare/source/the-night-pin.web.md (section 02, line 57; section 03, lines 65-67; section 13, line 183; sources [03] and [06] in section 17).
Read date for every page below: 2026-10-30.

Tally: 1 upheld, 1 overturned, 3 amended.

Headline finding: the researcher's main negative does not stand. The Vice/Motherboard original IS reachable at https://www.vice.com/en/article/us-military-bought-mass-monitoring-augury-team-cymru-browsing-email-data/ (Joseph Cox, page dated "September 21, 2022, 11:14am", no time zone shown). The researcher tried only the old /y3pnkw/ URLs. The article answers claims 3, 4 and 5 directly. It replaces Wyden's letter as reported by the Register and Reclaim The Net, the S.T.O.P. release and the Gault podcast page.

Access notes (no wall was worked round, and no user agent was changed):
- www.shodan.io and www.shodan.io/search/filters: 403.
- ics-radar.shodan.io: 503.
- wyden.senate.gov press release: 403 again.
- IAPP /news/a/ (cited [03]): 404 again. IAPP /news/b/ is a listing page with no article body.
- help.shodan.io, developer.shodan.io, blog.shodan.io, team-cymru.com, rfc-editor.org, cisco.com, slashdot.org: opened.
- Quotes from the Vice article were extracted by a fetch tool that caps each quote at about 125 characters. Each quote below is verbatim as returned, but long sentences appear only in fragments.

Anthropic: none of these sources characterises Anthropic. Nothing to flag.

---

## 1. Shodan crawls the internet and indexes devices that answer: servers, webcams, routers, building controllers, industrial equipment; searchable by port, product, country, owning network. [06]

Researcher's verdict: could not open. Its rewording dropped "every device" as overstated and changed "network" to "organisation".
Skeptic's verdict: **amended**. The cited homepage still returns 403. Shodan's own Help Center supports most of the claim, including the breadth the researcher called overstated. Two device categories remain unconfirmed.

Evidence:
- Shodan Help Center, "What is Shodan?", https://help.shodan.io/the-basics/what-is-shodan (no date on page):
  - "Shodan is a search engine for Internet-connected devices."
  - "Shodan gathers information about all devices directly connected to the Internet."
  - "Shodan crawls the Internet whereas Google crawls the World Wide Web."
  - "The types of devices that are indexed can vary tremendously: ranging from small desktops up to nuclear power plants"
  - "The bulk of the data is taken from banners, which are metadata about a software that's running on a device."
  - "If a device is directly hooked up to the Internet then Shodan queries it for various publicly-available information."
- Shodan Help Center, "Search Query Fundamentals", https://help.shodan.io/the-basics/search-query-fundamentals: the "country search filter which accepts as an argument a 2-letter country code". The org property is "the organization that owns this IP space". Port is the "port number of the service".
- Shodan Developer API, https://developer.shodan.io/api:
  - "This method returns a list of port numbers that the crawlers are looking for."
  - The example queries use "port:22" and "product:nginx".
  - "asn" appears in the filter list.
  - An alert trigger "industrial_control_system" is described as "Services associated with industrial control systems".
  - "webcam" appears as a tag.
- Shodan Help Center, "Navigating the Website", https://help.shodan.io/the-basics/navigating-the-website: "This means that if you only want to see images from webcams you could search for HTTP."
- Shodan Help Center, "Understanding SSL by Country", https://help.shodan.io/data-analysis/ssl-analysis-by-country: "Wireless routers that run on the alternate HTTPS port 8443 and are made by CradlePoint Technology." This is a single case study, not a stated category.
- Building controllers: no Shodan page I could open names building controllers, building automation or BACnet. The search snippets for www.shodan.io/explore/category/industrial-control-systems and a BACnet facet page point that way, but both are on the 403 host and were not opened.

Against the researcher:
- "Every device that answers" is close to Shodan's own claim ("all devices directly connected to the Internet"), so the scope cut is not needed. Attribute the claim to Shodan instead.
- "The network that owns the address" is supported. Shodan's org filter is "the organization that owns this IP space", and an asn filter exists. The researcher's "organisation" is safe but unnecessary.
- The researcher's statement that webcams and industrial equipment were "not verified in any page I could read" is wrong. Both appear on developer.shodan.io, which the researcher read.

The page should say: "Shodan is a search engine for machines. It crawls the internet and, in its own words, gathers information about all devices directly connected to it: servers, webcams, routers, industrial equipment. You can search it by port, by product, by country, by the organisation that owns the address. [06]"
- Cite [06] as Shodan Help Center, "What is Shodan?", https://help.shodan.io/the-basics/what-is-shodan, plus "Search Query Fundamentals". Do not cite the homepage, which cannot be opened.
- Drop "building controllers" unless the owner can open a Shodan page that names them.

---

## 2. NetFlow records which address talked to which, when, on what port, and how much, not content. [03]

Researcher's verdict: holds, no change.
Skeptic's verdict: **upheld**, with one correction to the source line.

Evidence:
- RFC 3954, "Cisco Systems NetFlow Services Export Version 9", B. Claise, Ed. (Cisco Systems), October 2004, Category: Informational, header "Network Working Group", https://www.rfc-editor.org/rfc/rfc3954:
  - "A flow is defined as a unidirectional sequence of packets with some common properties that pass through a network device."
  - "flow records include details such as IP addresses, packet and byte counts, timestamps" (the sentence continues with ToS, application ports and interfaces).
  - Its field definitions include no payload field.
- Cisco, "Cisco IOS NetFlow Overview" (15-2S), https://www.cisco.com/en/US/docs/ios-xml/ios/netflow/configuration/15-2s/ios-netflow-ov.html. This is a better primary for the vendor's own definition. "a flow is defined by the combination of the following seven key fields:" Those fields are "Source IP address", "Destination IP address", "Source port number", "Destination port number", "Layer 3 protocol type", "Type of service (ToS)" and "Input logical interface". It also says "flow data includes details such as IP addresses, packet and byte counts, timestamps".
- Team Cymru, "Team Cymru Myth vs Fact", 26 Sep 2022, https://www.team-cymru.com/post/team-cymru-myth-vs-fact: "Netflow data includes only headers such as protocol and device IP addresses." "Netflow records contain no content or user information." "There are no logs or any content included in netflow."

Hunting the negative ("not content"): no primary I found says NetFlow carries payload. However, the edition places this definition directly before Augury, and the Vice original says Augury goes beyond NetFlow. Augury "in some cases" "provides access to people's email data, browsing history, and other information such as their sensitive internet cookies". A Navy procurement record "says Augury has access to PCAP data, URLs visited, and cookies". Wyden, per Vice, describes "netflow records and some communications content". The NetFlow sentence is true. The owner should know the next paragraph reads as if Augury is content-free, and Vice says it is not (see claim 5).

Correction to the researcher's source line: RFC 3954 is an Informational RFC written by Cisco ("Network Working Group"), not an IETF standard. Cite it as Cisco/RFC 3954, or cite the Cisco overview. The edition's [03] (IAPP, 404) is not a source for the definition and should not be the citation for this sentence.

The page should say: no change to the sentence. Re-cite it to Cisco, "Cisco IOS NetFlow Overview" (or RFC 3954) and to Team Cymru's Myth vs Fact for "doesn't record what was said".

---

## 3. Team Cymru's Augury draws on 550 collection points worldwide and adds at least 100 billion records a day. [03]

Researcher's verdict: overstated. It attributed the figures to Wyden's letter, read through the Register and Reclaim The Net.
Skeptic's verdict: **amended**. The figures are not overstated. The edition actually understates the first one ("550" where the source says "over 550"). The better primary is the Vice original, which gives the true source: a description of Augury in a US government procurement record.

Evidence: Vice/Motherboard, Joseph Cox, "September 21, 2022, 11:14am", https://www.vice.com/en/article/us-military-bought-mass-monitoring-augury-team-cymru-browsing-email-data/:
- The lead-in: "a description of the Augury platform in a U.S. government procurement record reviewed by Motherboard reads"
- "The network data includes data from over 550 collection points worldwide, to include collection points in Europe..." (truncated by the tool)
- "and is updated with at least 100 billion new records each day"
- The Slashdot repost of Vice's excerpt carries the same two phrases: https://news.slashdot.org/story/22/09/21/2152250/revealed-us-military-bought-mass-monitoring-tool-that-includes-internet-browsing-email-data

Team Cymru's own material:
- Myth vs Fact (26 Sep 2022) gives no collection-point count and no daily volume. It says "Augury does not provide anyone access to raw or bulk netflow data" and "It is sampled and thus sees only approximately 1 in every 10,000 netflow."
- Team Cymru's current pages (undated, "© 2026") give different, product-level figures and do not name Augury:
  - https://www.team-cymru.com/request-a-demo: "up to 90% visibility of Internet traffic across 300bn IP communications daily."
  - https://www.team-cymru.com/llms.txt: "observes 400B+ internet connections daily" and "1,000+ data sharing partners".
- Do not merge these with the 2022 Augury figures.

Against the researcher:
- "Overstated" is wrong in direction. The source says "over 550", and "adds ... a day" is a fair gloss of "updated with ... new records each day".
- Wyden's letter is not the origin of the figures. Vice quotes them from the procurement record. The researcher's two secondaries reporting the letter are one source, and they are superseded.
- The researcher's added Team Cymru rebuttal sentence is accurate. It goes beyond the smallest change, so it is optional.

The page should say: "A US government procurement record reviewed by Vice's Motherboard describes Team Cymru's Augury as drawing on over 550 collection points worldwide and being updated with at least 100 billion new records each day. [03]" Re-cite [03] to the Vice original, as given in Evidence.

---

## 4. Contracting records reviewed by Vice put its reach at about 90 percent of global internet traffic. [03]

Researcher's verdict: could not open. Its rewording was "Augury's maker is reported to claim the tool covers about 90 percent of the world's internet traffic."
Skeptic's verdict: **overturned**. The source opens, and both the edition's wording and the researcher's rewording are wrong.

Evidence: Vice/Motherboard, Joseph Cox, 21 Sep 2022, https://www.vice.com/en/article/us-military-bought-mass-monitoring-augury-team-cymru-browsing-email-data/
- The first sentence opens "Multiple branches of the U.S. military have bought access to a powerful internet monitoring tool that claims to cover..." Its middle reads "tool that claims to cover over 90 percent of the world's internet traffic, and which in some cases". It ends "...s their sensitive internet cookies, according to contracting data and other documents reviewed by Motherboard."
- According to the fetch tool, "percent" and "90" (outside a phone number) appear only in that sentence. No sentence puts a 90 percent figure in a contract or procurement record.
- The only Team Cymru marketing quote in the article: Team Cymru "says on its website that its solution provides" "access to a super majority of all activity on the internet."
- A third party: "Augury is the visibility into 93% of internet traffic," another website describing the tool reads. Reclaim The Net attributes this to Cosive.

Scope:
- Who said 90 percent? Not a contract record, not a whistleblower, and not, by name, Team Cymru. Vice writes that the tool "claims to cover over 90 percent" and does not say where the claim appears. "According to contracting data and other documents" closes the whole sentence: buying access, the claim, and the email and browsing access. The article does not tie the percentage to any contract.
- "About 90" is wrong. The source says "over 90".
- "Its maker" (the researcher's word) is not in the source.
- Team Cymru's current demo page claims "up to 90% visibility of Internet traffic" for Pure Signal (undated, 2026, Augury not named). This is the nearest vendor statement of a 90 percent figure. It is not evidence of what the 2022 Augury claim was.

The page should say: "Motherboard described it as a tool 'that claims to cover over 90 percent of the world's internet traffic'; another site describing it said 93 percent. [03]"
- If space is short: "It claims to cover over 90 percent of the world's internet traffic, Vice reported. [03]"
- Remove "Contracting records reviewed by Vice put".
- The section 03 figure "90%" should carry the attribution "claimed".

---

## 5. Its buyers included several branches of the US military. [03] (and line 183: "Several branches bought access to Augury's NetFlow data.")

Researcher's verdict: holds. Its primary was Vice's Gault page, and its rewording named Cyber Command, the Army and the Navy.
Skeptic's verdict: **amended**. The claim holds in Vice's own words, but the researcher's primary and list need correcting, and line 183 needs one change.

Evidence: Vice/Motherboard, Joseph Cox, 21 Sep 2022, https://www.vice.com/en/article/us-military-bought-mass-monitoring-augury-team-cymru-browsing-email-data/
- "Multiple branches of the U.S. military have bought access to a powerful internet monitoring tool"
- Motherboard found "the U.S. Navy, Army, Cyber Command, and the Defense Counterintelligence and Security Agency" "have collectively paid at least $3.5 million to access Augury"
- "the Department of the Navy paid for a “Platinum” Augury license"
- Records for Cyber Command "do not explicitly include the 'platinum' marker". The Army "was unable to provide a statement on the Augury platform purchases in time for publication." DCSA "later deferred to the Department of Defense".
- Vice, Matthew Gault, 22 Sep 2022, 9:00am, https://vice.com/en/article/cyber-inside-the-tool-the-us-military-is-using-to-monitor-emails-and-web-traffic: this is a CYBER podcast episode page, not a reporting article. It contains "Cyber Command, the Army, the Navy, are all using Augury to paw through internet traffic." The quote is confirmed, but the page is a secondary to Cox.

Scope:
- The four buyers are two service branches (Navy, Army), a combatant command (Cyber Command) and a defence agency (DCSA). "Several branches" repeats Vice's "Multiple branches". It is fair as Vice's characterisation, but strictly only the Navy and Army are branches.
- The researcher's list omitted DCSA. The $3.5 million figure and DCSA are in the primary, not only in Reclaim's summary as the researcher believed.
- Line 183's "Augury's NetFlow data" is too narrow. Vice says Augury "in some cases" "provides access to people’s email data, browsing history, and other information such as their sensitive internet cookies". It also says the Navy record covers "PCAP data, URLs visited, and cookies", and Wyden refers to "netflow records and some communications content".

The page should say:
- Line 67: "Its buyers included several branches of the US military: Motherboard found the Navy, Army, Cyber Command and the Defense Counterintelligence and Security Agency paid at least $3.5 million between them for access. [03]"
- Line 183: "Several branches bought access to Augury, which carries NetFlow and, in some cases, email and browsing data. [03]"
- Cite [03] as the Vice original.

---

Sources opened:
- https://www.vice.com/en/article/us-military-bought-mass-monitoring-augury-team-cymru-browsing-email-data/
- https://vice.com/en/article/cyber-inside-the-tool-the-us-military-is-using-to-monitor-emails-and-web-traffic
- https://news.slashdot.org/story/22/09/21/2152250/revealed-us-military-bought-mass-monitoring-tool-that-includes-internet-browsing-email-data
- https://www.team-cymru.com/post/team-cymru-myth-vs-fact
- https://www.team-cymru.com/request-a-demo
- https://www.team-cymru.com/llms.txt
- https://www.rfc-editor.org/rfc/rfc3954
- https://www.cisco.com/en/US/docs/ios-xml/ios/netflow/configuration/15-2s/ios-netflow-ov.html
- https://help.shodan.io/the-basics/what-is-shodan
- https://help.shodan.io/the-basics/search-query-fundamentals
- https://help.shodan.io/the-basics/navigating-the-website
- https://help.shodan.io/data-analysis/ssl-analysis-by-country
- https://developer.shodan.io/api
- https://blog.shodan.io/tag/ics/

Refused or unavailable: www.shodan.io (403), www.shodan.io/search/filters (403), ics-radar.shodan.io (503), wyden.senate.gov press release (403), iapp.org/news/a/... (404).
