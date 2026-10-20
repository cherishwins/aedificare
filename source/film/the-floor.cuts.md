---
slug: the-floor
narration: sha256:68d83a8e036073cf1f8177a868570f1632c1d20e261f056cbda1e0a286899ef2
base: sha256:05849c788a0a30a5a3fa292b7ab46d45df8b79e530b0f2b3d9f4b8be463b5f3a
base-short: sha256:0f7ad85c74ba68843d3fe308400b549a121fc985244e374b23ae74bd7d3eabf3
hold: 5.4
---
<!-- The Floor's re-cut (spec 3.2, step 8), written 2026-10-20 against film-the-floor's own narration.json and timeline.txt.
     Every page shot's hl: was copied from the page as tools/capture.mjs shot it; every number on a computed surface is on
     the built page (tools/cuts.mjs check). The hold is six beats, 5.4 s: an insert holds until the next cut or until its
     picture would read as standing still. Left out on purpose, both waiting on the owner: sound effects and the cold open.
     Sources 01 and 16 are videos on YouTube, never fetched: 16's words are quote cards of the transcript the edition quotes,
     which a person confirms before upload; 01 is only a chart's source line. 09 (eCFR) answered with a wall: not shown. -->

# Sources
- 01 | https://youtu.be/ofR7GFNZzJY | never fetched | pub: Data Slayer | date: 3 Sep 2025
- 02 | https://www.geeky-gadgets.com/diy-military-grade-router-project/ | read 2026-10-20 | pub: Geeky Gadgets | date: 5 Sep 2025
- 03 | https://buildwithparallel.com/products/haven | read 2026-10-20 | pub: Parallel
- 04 | https://github.com/buildwithparallel/haven-manet-ip-mesh-radio/blob/main/docs/reference/halow-reference.md | read 2026-10-20 | pub: buildwithparallel on GitHub
- 05 | https://openmanet.github.io/docs/hardware/raspberry-pi | read 2026-10-20 | pub: OpenMANET documentation
- 06 | https://www.seeedstudio.com/Wio-WM6108-Wi-Fi-HaLow-mini-PCIe-Module-p-6394.html | read 2026-10-20 | pub: Seeed Studio
- 07 | https://www.morsemicro.com/products/chips/ | read 2026-10-20 | pub: Morse Micro, chips page | date: read 20 Oct 2026
- 08 | https://arxiv.org/abs/2605.17349 | read 2026-10-20 | pub: Xu, Mankai and Alouini, KAUST, arXiv | date: 17 May 2026
- 10 | https://meshtastic.org/docs/overview/radio-settings/ | read 2026-10-20 | pub: Meshtastic documentation
- 12 | https://buildwithparallel.com/blogs/news/how-far-can-reticulum-actually-go | read 2026-10-20 | pub: Parallel | date: 12 Apr 2026
- 13 | https://www.cisco.com/c/en/us/products/collateral/wireless/catalyst-9100ax-access-points/wpa3-dep-guide-og.html | read 2026-10-20 | pub: Cisco, WPA3 Deployment Guide | date: 6 Oct 2025
- 14 | https://ised-isde.canada.ca/site/spectrum-management-telecommunications/en/devices-and-equipment/radio-equipment-standards/radio-standards-specifications-rss/rss-247-digital-transmission-systems-dtss-frequency-hopping-systems-fhss-and-licence-exempt-local | read 2026-10-20 | pub: ISED Canada, RSS-247 Issue 4
- 15 | https://docs.morsemicro.com/software-releases/mm-iot-sdk-software-release-notes | read 2026-10-20 | pub: Morse Micro, MM-IoT-SDK release notes | date: 2 Sep 2026
- 16 | https://youtu.be/-soMNhNqEVc | never fetched | pub: Data Slayer | date: 18 Jan 2026

## The number
<!-- The lede is covered, not read off a paragraph: The Markup's own ledger row, then the press's 15 Mbps. -->
@ "The Markup quoted the datasheet" -0.32 | over: base      [[page: self 11 | in: #ledger | hl: 43.3 Mbps at the physical layer on an 8 MHz channel.]]
@ "The builder had measured" | over: base | hold: 5.2        [[page: 02 | hl: up to 15 Mbps]]
@ "from a datasheet" #1                                      [[pop: DATASHEET]]
@ "at the physical layer" #1                                 [[page: 07 | hl: Peak throughput (PHY) 43.3 Mbps]]
@ "It had no measurement"                                    [[card: NO MEASUREMENT.]]
@ "the vendor's product page" | hold: 6.2                    [[page: 03 | hl: approximately $208–$450 per node]]
@ "channel does"                                             [[pop: THE CHANNEL]]
@ "The Markup was written" #1 | until: "on a bench"          [[chart: timeline | A year before | 2025-09-03=The builder's video* | 2026-09-15=The Markup | 2026-10-18=The Floor | src: 01]]
@ "on a bench"                                               [[pop: BENCH]]
@ "on a beach"                                               [[pop: BEACH]]
@ "reading the numbers off"                                  [[fig: 15 MBPS | THE BENCH · 8 MHZ · SEPTEMBER 2025]]
@ "This amendment carries them"                              [[page: self #stands | hl: The ledger row that read 43.3 megabits now reads five numbers]]
@ "The price does not move" | hold: 4.3                      [[page: self 11 | in: #ledger | hl: $450 · Haven 2 as built | hl: 43.3 Mbps at the physical layer on an 8 MHz channel.]]

## What The Markup did not have
@ "a printed case"                                           [[pop: PRINTED CASE]]
@ "It did not quote"                                         [[card: NOT A FIELD.]]
@ "Tim the builder behind"                                   [[page: self #missing | hl: Tim, Parallel, Salient Ventures LLC.]]
@ "had already published one"                                [[page: 02 | hl: built for $106.23 instead of $20,000]]
@ "is the first Haven"                                       [[page: 03 | hl: Haven 1 is based around:]]
@ "HaLow chip on a fifteen-dollar"                           [[page: 06 | hl: powered by the Quectel FGH100M-H]]
@ "two cells and a dongle"                                   [[card: TWO CELLS. NO CASE.]]
@ "Everything below is that"                                 [[page: self #build | hl: Part As built Stated]]
@ "It is the floor under"                                    [[pop: THE FLOOR]]
@ "the cheapest build and"                                   [[fig: $106.23 | THE CHEAPEST BUILD]]
@ "the lowest numbers and"                                   [[chart: bars | The lowest numbers | sub: MBPS · 8 MHZ | The Markup's row, the MM8108 datasheet=43.3 | Measured, the first Haven=15* | src: 07, 01]]

## The build
@ "because he says some"                                     [[page: self #build | hl: The motherboard. Not the 5.]]
@ "A year on OpenMANET"                                      [[page: 05 | hl: OpenMANET is designed for Raspberry Pi | hl: Raspberry Pi 4 / CM4 | hl: Raspberry Pi 3B | hl: Raspberry Pi Zero 2 W]]
@ "OpenWrt image he builds"                                  [[page: 04 | url: https://github.com/buildwithparallel/haven-manet-ip-mesh-radio/blob/main/docs/reference/pi5-notes.md | hl: Haven 2 requires a Raspberry Pi 5-specific OpenWrt/Morse firmware image.]]
@ "because his repository says" | hold: 7                    [[page: 04 | url: https://github.com/buildwithparallel/haven-manet-ip-mesh-radio/blob/main/docs/reference/pi5-notes.md | hl: same issue applies if using the Seeed WM-WM6108 SPI HAT on a Pi 5]]
@ "A HAT for a"                                              [[page: self #build | hl: Mini PCIe HAT | hl: about $20]]
@ "The card about fifteen"                                   [[page: self #build | hl: The HaLow radio, MM6108 inside. | hl: about $15]]
@ "Seeed listed the Wio-WM6108"                              [[page: 06 | hl: $14.99]]
@ "antenna on an SMA"                                        [[page: self #build | hl: Sub-gigahertz, SMA to U.FL.]]
@ "any Meshtastic antenna will"                              [[page: 06 | hl: Operating in the 902-928 MHz frequency band]]
@ "A Waveshare battery hat"                                  [[page: self #build | hl: Waveshare, two 21700 cells, 10,000 mAh.]]
@ "each charged over USB-C"                                  [[fig: 10,000 MAH | TWO 21700 CELLS · CHARGED OVER USB-C]]
@ "the Pi has both"                                          [[page: self #build | hl: 2.4 and 5 GHz, he says, for the phones.]]
@ "The vendor's parts list"                                  [[page: 04 | url: https://github.com/buildwithparallel/haven-manet-ip-mesh-radio | hl: 2.4GHz WiFi: RT5370 USB adapter]]
@ "No case The title"                                        [[card: NO CASE.]]
@ "The title of the video"                                   [[page: self #build | hl: The video's title. $106.23]]
@ "on camera add up"                                         [[chart: bars | Thirty-five of it | sub: DOLLARS · STATED ON CAMERA | prefix: $ | The video's title=106.23 | The parts he priced on camera=35* | src: 01]]

## The bench
@ "He plays one of"                                          [[card: OVER THE LINK.]]
@ "router some way off" +0.07                                 [[pop: A ROUTER]]
@ "Then he gives the"                                        [[card: EACH CHANNEL WIDTH.]]
<!-- One picture while the widths are read: our own chart, the Acid landing on each width as it is said (sync rule 4); the clean render's 1.8 follows. -->
@ "At 8 MHz about" | over: base | hold: 10.625               [[page: self #bench | hl: 8 MHz 15 | hl: 4 MHz 7.3 | hl: 2 MHz 4.4]]
@ "He calls fifteen right"                                   [[fig: 15 MBPS | 8 MHZ · WHAT HE CALLS THE THEORETICAL CEILING]]
@ "It is not the chip's" | over: base | until: "It is what a link"   [[page: 07 | hl: Peak throughput (PHY) 32.5 Mbps]]
@ "It is what a link"                                        [[card: UNDER THE CEILING.]]
@ "and the vendor's own reference" | over: base | hold: 7.5   [[page: 04 | hl: Real-world throughput is typically 40–60% of PHY rate]]
@ "posted a similar test"                                    [[page: 08 | hl: Using commodity HaLow dongle-class nodes in all regimes]]
@ "no line of sight"                                         [[card: NO LINE OF SIGHT.]]
@ "a video file of"                                          [[page: 08 | hl: application-layer goodput]]
@ "At one metre"                                             [[pop: ONE METRE]]
@ "published eight months apart"                             [[chart: timeline | Eight months apart | 2025-09-03=The builder's bench | 2026-05-17=The KAUST paper* | src: 01, 08]]
@ "one overall fall"                                         [[card: ONE OVERALL FALL.]]
@ "the rate drops about"                                     [[chart: bars | About eightfold in both | sub: MBPS · 8 MHZ AND 1 MHZ | The bench, 8 MHz=15 | The bench, 1 MHz=1.8* | KAUST at 1 m, 8 MHz=13.0 | KAUST at 1 m, 1 MHz=1.6 | src: 01, 08]]
@ "at every width"                                           [[page: 08 | hl: an NLoS coverage boundary around]]
@ "The datasheet is not"                                     [[page: 07 | hl: Peak throughput (PHY) 43.3 Mbps]]
@ "It is a ceiling"                                          [[card: A CEILING.]]
@ "links run under it"                                       [[page: self #bench | hl: the track is the chip's 32.5 peak at 8 MHz]]

## The power
@ "Out of the box"                                           [[page: self #power | hl: Out of the box · 21 dBm 126]]
@ "OpenMANET's board file raises"                            [[page: self #power | hl: Out of the box · 21 dBm 126 | hl: OpenMANET · 27 dBm 501]]
@ "half a watt" #1                                           [[fig: 501 MW | HALF A WATT · 27 DBM]]
@ "The rule for unlicensed"                                  [[page: self #power | hl: The rule · 30 dBm 1,000]]
@ "costs a decibel of"                                       [[card: DECIBEL FOR DECIBEL.]]
@ "Half a watt is"                                           [[fig: 3 DB | IN HAND · 27 DBM AGAINST 30]]
@ "Canada's rule in The"                                     [[page: 14 | hl: For DTS operating in the band 902-928 MHz, the maximum peak conducted output power shall not exceed 1W, and the e.i.r.p. shall not exceed 4 W.]]
@ "One line in The"                                          [[card: ONE LINE GOES FURTHER.]]
@ "It says point-to-point links"                             [[page: self 11 | hl: Point-to-point links may run higher e.i.r.p. under the same document.]]
@ "RSS-247 allows that at"                                   [[page: 14 | hl: FPTP systems in the bands 2400-2483.5 MHz and 5725-5850 MHz]]

## The field
@ "Then he takes it"                                         [[card: OFF THE GRID.]]
@ "A stretch of coast"                                       [[card: COAST. NO FIBRE.]]
@ "A Starlink dish into"                                     [[page: 02 | hl: internet access via uplinks like Starlink]]
@ "Node two goes for"                                        [[card: NODE TWO WALKS.]]
@ "Far out he guesses"                                       [[page: self #field | hl: YouTube still playing, under 1 Mbps down, almost 3 up]]
@ "in the voice-over he"                                     [[page: 02 | hl: a range of up to 2,000 feet]]
@ "just under a megabit"                                     [[fig: UNDER 1 MBPS | DOWN AT 2,000 FEET · ALMOST 3 UP]]
@ "The KAUST team with" | over: base | hold: 10.54           [[page: 08 | hl: up to 814 m in single-hop | hl: 0.15 Mbps at the farthest point]]
@ "the paper's single hop" | over: base | hold: 7.625        [[chart: bars | About half a megabit | sub: MBPS · THE PAPER'S SINGLE HOP, LINE OF SIGHT | 569 m=0.53* | 626 m=0.47 | 814 m=0.15 | src: 08]]
@ "that down and almost"                                     [[chart: bars | The same order of magnitude | sub: MBPS DOWN · NEAR TWO THOUSAND FEET | 569 m=0.53 | 626 m=0.47 | 2,000 ft, his test=1 (ABOUT 1)* | src: 08, 01]]
@ "on other hardware and"                                    [[card: OTHER HARDWARE, ANOTHER WAY.]]
@ "the same order of"                                        [[card: NOT THE SAME TEST.]]
@ "on a hundred-dollar radio"                                [[page: self 11 | hl: A mesh radio the state pays eighteen thousand dollars for. | hl: A mesh radio a Canadian builds for four hundred.]]
@ "it was on film"                                           [[chart: timeline | On film a year before | 2025-09-03=On film* | 2026-09-15=The Markup | src: 01]]

## The other radio
@ "The comparison he makes"                                  [[card: THE HONEST ONE.]]
@ "Meshtastic the LoRa mesh" | over: base | until: "and 21.88 on its fastest"   [[page: 10 | hl: Long Fast 1.07 kbps]]
@ "and 21.88 on its fastest" | over: base | hold: 2.71      [[page: 10 | hl: Short Turbo 21.88 kbps]]
@ "before packet headers hops"                               [[page: 10 | hl: Data-rate in this table is the theoretical max | hl: packet headers, hops and re-transmissions]]
@ "The HaLow radio at"                                       [[page: self #bench | hl: 1 MHz 1.8]]
@ "eighty times the rated" | over: base | until: "They are not rivals"   [[page: self #other | hl: HaLow · 1 MHz 1,800 | hl: Meshtastic · fastest 21.88 | hl: Meshtastic · default 1.07]]
@ "They are not rivals"                                      [[card: NOT RIVALS.]]
@ "One carries text and"                                     [[card: TEXT AND GPS PINGS.]]
@ "on very little power"                                     [[card: VERY LITTLE POWER.]]
@ "The other carries video"                                  [[page: self #carried | hl: RTSP, UDP or HTTP, from a device on the network.]]
@ "the size of thumbs"                                       [[page: self #build | hl: Waveshare, two 21700 cells, 10,000 mAh.]]
@ "and speaks IP so"                                         [[card: IT SPEAKS IP.]]
@ "already speaks IP works"                                  [[page: self #carried | hl: Two nodes, multicast, no TAK server.]]

## What it carried
@ "Over the link he"                                         [[card: WHAT IT EXISTS FOR.]]
@ "ATAK the Android"                                         [[page: 02 | hl: support for tactical tools like ATAK]]
@ "from one node to"                                         [[chart: flow | No server between them | Node one > Node two=Multicast, no server* | src: 01]]
@ "Mumble for push-to-talk"                                  [[page: self #carried | hl: Mumble, push to talk, low latency, through a public server.]]
@ "at low latency"                                           [[card: LOW LATENCY.]]
@ "A camera stream by" | over: base | until: "The HaLow link is"   [[page: self #carried | hl: RTSP, UDP or HTTP, from a device on the network.]]
@ "The HaLow link is"                                        [[page: 04 | hl: Encryption WPA3 SAE (CCMP)]]
@ "and the chip does"                                        [[page: self #carried | hl: AES and SHA-2 in the chip's hardware.]]
@ "He calls it the"                                          [[card: ENTERPRISE. END TO END. | WHAT HE CALLS IT]]
@ "It is neither"                                            [[card: NEITHER.]]
@ "SAE is the personal" | hold: 9.6                          [[page: 13 | hl: WPA3-Personal, which uses the Simultaneous Authentication of Equals (SAE) method | hl: for 802.1X security networks]]
@ "enterprise WPA3 signs"                                    [[pop: ENTERPRISE]]
@ "The encryption covers each" | hold: 10                    [[page: 04 | url: https://github.com/buildwithparallel/haven-manet-ip-mesh-radio | hl: WPA3 SAE (CCMP) - strongest WiFi encryption | hl: Reticulum Curve25519 + AES-128 end-to-end]]

## Where The Markup stands
@ "The ledger row that" | over: base | until: "now reads five numbers"   [[page: self #stands | hl: The ledger row that read 43.3 megabits now reads five numbers]]
@ "now reads five numbers"                                   [[card: FIVE NUMBERS.]]
@ "for the chip The"                                         [[page: self 11 | in: #ledger | hl: 43.3 Mbps at the physical layer on an 8 MHz channel.]]
@ "up to 30 for"                                             [[page: 15 | hl: MM8108 EKH05 SDIO 24 30]]
@ "about 19 down on"                                         [[fig: 19 MBPS DOWN | THE BUILDER'S OWN TEST · MM8108]]
@ "15 on his bench"                                          [[page: 02 | hl: up to 15 Mbps]]
@ "about one down at"                                        [[page: self #field | hl: YouTube still playing, under 1 Mbps down, almost 3 up]]
@ "The chipmaker says as" | over: base | until: "not the data rate"   [[page: 07 | hl: Peak throughput (PHY) 43.3 Mbps]]
@ "not the data rate"                                        [[quote: 07 | "These are PHY rates, not the data rate your application will receive." | MORSE MICRO, CHIPS PAGE | hl: not the data rate your application will receive]]
@ "Its release notes of"                                     [[page: 15 | hl: 02 Sep 2026]]
@ "MM8108 at 8 MHz" | over: base | until: "Over TCP it read"   [[page: 15 | hl: MM8108 EKH05 SDIO 24 | hl: 30 8.5 10 | hl: MM6108 EKH05 SDIO 22 22]]
@ "a microcontroller at one"                                 [[page: 15 | hl: MM-IoT-SDK 2.13 STA | hl: Linux AP with 2.0 drivers/firmware]]
@ "The builder had tested"                                   [[card: HE TESTED IT TOO.]]
@ "the internet reaching the"                                [[card: ONLY OVER HALOW.]]
@ "The older chip gave"                                      [[quote: 16 | "on a good day is 15 up, 15 down" | DATA SLAYER | hl: 15 up, 15 down]]
@ "The MM8108 gave about"                                    [[quote: 16 | "about 19 megabits per second down. It says 47 megabits per second up. These tests aren't perfect" | DATA SLAYER | hl: about 19 megabits per second down]]
@ "It also read 47"                                          [[chart: bars | More than the chip's own peak | sub: MBPS · MM8108 · 8 MHZ | The chip's physical-layer peak=43.3 | His phone test, up=47* | src: 07, 16]]
@ "and he said himself"                                      [[quote: 16 | "about 19 megabits per second down. It says 47 megabits per second up. These tests aren't perfect" | DATA SLAYER | hl: These tests aren't perfect]]
@ "The other rows were"                                      [[card: CORRECTED THERE.]]
@ "The ratio The Markup"                                     [[page: self 11 | hl: forty-four to one, one government radio against a two-node network]]
@ "against two nodes and"                                    [[page: 03 | hl: approximately $208–$450 per node]]
@ "What moved is a"                                          [[card: WHAT MOVED.]]
@ "It came from one"                                         [[page: 07 | hl: Peak throughput (PHY) 43.3 Mbps]]
@ "The vendor had written"                                   [[page: 04 | hl: Real-world throughput is typically 40–60% of PHY rate]]
@ "a rough real-world figure"                                [[page: 12 | hl: about 1–2 Mbps real-world throughput]]
@ "the chipmaker had published"                              [[page: 15 | hl: MM8108 EKH05 SDIO 24 30]]
@ "and he had filmed"                                        [[page: 02 | hl: up to 15 Mbps]]
@ "One sentence about Canada"                                [[page: self 11 | hl: Point-to-point links may run higher e.i.r.p. under the same document.]]
@ "Point-to-point links at" | over: base | until: "higher e.i.r.p. under RSS-247"   [[page: 14 | hl: For DTS operating in the band 902-928 MHz, the maximum peak conducted output power shall not exceed 1W, and the e.i.r.p. shall not exceed 4 W.]]
@ "higher e.i.r.p. under RSS-247"                            [[page: 14 | hl: FPTP systems in the bands 2400-2483.5 MHz and 5725-5850 MHz]]

## Sources
@ "Bracketed figures in the"                                 [[page: self #sources | hl: Bracketed figures in the sections above are from these sources.]]
@ "Every number the builder"                                 [[page: self #sources | hl: I Built a $20,000 Military Router for $106.23]]
@ "every number beside it"                                   [[page: self #sources | hl: Xu, Mankai and Alouini]]
@ "the regulators"                                           [[page: self #sources | hl: ISED Canada, RSS-247 Issue 4]]
@ "the chip and parts"                                       [[page: self #sources | hl: Morse Micro, chips page]]
@ "the projects' own pages"                                  [[page: self #sources | hl: OpenMANET documentation]]
@ "or The Markup and"                                        [[page: self #sources | hl: The Markup, 15 Sep 2026, this site and its print]]
@ "the two are never"                                        [[card: NEVER ADDED TOGETHER.]]
@ "Conversions and ratios an"                                [[fig: 1/8 WATT | 21 DBM, AN EIGHTH OF A WATT]]
