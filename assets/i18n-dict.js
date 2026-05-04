/* ────────────────────────────────────────────────────────────────────────────
   Karlsen & Nordseth — translation dictionary
   Keys are the *normalized* (whitespace-collapsed, trimmed) Norwegian source
   strings exactly as produced by `element.innerHTML` on the page. Inline
   tags (<em>, <span>, <b>, <strong>, <br>) are part of the key — they must
   appear in the translated value too.

   Entities ("&amp;", "&nbsp;") follow what the browser serializes: ampersands
   in text are "&amp;", a non-breaking space ends up as a regular space after
   normalization (norm() collapses \s+ → " ").

   Coverage:
   - en, pl
   - All visible text on index.html (homepage)

   To extend: add new keys/values for additional pages. The same dictionary
   serves the whole site, so a string that appears on multiple pages only
   needs one entry.
   ──────────────────────────────────────────────────────────────────────────── */
window.KNE_I18N = {

 /* ============================================================
    ENGLISH
    ============================================================ */
 en: {

  /* ───── <title> ───── */
  "Karlsen & Nordseth Entreprenør — Antikvarisk rehabilitering i Oslo":
   "Karlsen & Nordseth Entreprenør — Heritage restoration in Oslo",

  /* ───── Skip link ───── */
  "Hopp til innhold": "Skip to content",

  /* ───── Header / nav ───── */
  "Karlsen & Nordseth Entreprenør — forsiden":
   "Karlsen & Nordseth Entreprenør — homepage",
  "Karlsen &amp; Nordseth Entreprenør":
   "Karlsen &amp; Nordseth Entreprenør",
  "Hovedmeny": "Main menu",
  "Prosjekter": "Projects",
  "Om oss": "About us",
  "Bærekraft": "Sustainability",
  "Etikk og ansvar": "Ethics & responsibility",
  "Stillinger": "Careers",
  "Kontakt": "Contact",
  "Åpne meny": "Open menu",
  "Meny": "Menu",

  /* ───── Hero ───── */
  "Velkommen": "Welcome",
  "Etablert 1992 — Oslo &amp; Østlandet":
   "Established 1992 — Oslo &amp; Eastern Norway",
  "Med <span class=\"em\">lidenskap</span> for&nbsp;antikvariske&nbsp;bygg.":
   "With <span class=\"em\">passion</span> for&nbsp;heritage&nbsp;buildings.",
  "Kopier organisasjonsnummer 985 214 034 til utklippstavlen":
   "Copy company number 985 214 034 to clipboard",
  "Klikk for å kopiere org.nr.":
   "Click to copy company number",
  "Org.nr.": "Reg. no.",
  "Spesialister på antikvarisk rehabilitering, riggentrepriser og nybygg.":
   "Specialists in heritage restoration, site-establishment contracts and new construction.",
  "Søk etter prosjekt, fag, kompetanse eller bygg…":
   "Search for a project, trade, skill or building…",
  "Søk på siten": "Search the site",
  "Søk": "Search",
  "Hurtigsøk": "Quick search",
  "Prøv:": "Try:",
  "Kirker": "Churches",
  "Tak &amp; fasade": "Roof &amp; facade",
  "Riggentrepriser": "Site-establishment contracts",
  "Bla videre": "Scroll on",

  /* ───── Manifesto / about ───── */
  "Spesialister på å bevare <em class=\"em\">det som er verdt å bevare</em>.":
   "Specialists in preserving <em class=\"em\">what is worth preserving</em>.",
  "Vi er en mellomstor entreprenør med fokus på antikvarisk rehabilitering, riggentrepriser og nybygg. Med lang erfaring innen tak- og fasadearbeid, og rigg og drift av byggeplasser, jobber vi for store eiendomsbesittere, det offentlige og selvstendige eiendomsutviklere.":
   "We are a mid-sized contractor focused on heritage restoration, site-establishment contracts and new construction. With long experience in roof and facade work, and in the establishment and operation of construction sites, we work for major property owners, the public sector and independent developers.",
  "Vårt fokus er å bevare byggehistorien — og videreføre arven av norsk byggekunst gjennom spesialisert kompetanse på historiske byggemetoder og detaljert håndverk.":
   "Our focus is to preserve building history — and carry forward the legacy of Norwegian architecture through specialised expertise in historic building methods and detailed craftsmanship.",

  /* ───── Stats strip ───── */
  "Etablert i Oslo": "Established in Oslo",
  "<em>274</em> MNOK": "<em>274</em> MNOK",
  "Omsetning (gjennomsnitt siste 5 år)":
   "Revenue (5-year average)",
  "Mål: fossilfri bilpark":
   "Goal: fossil-free vehicle fleet",
  "Miljøfyrtårn": "Eco-Lighthouse",
  "Sertifisert klimarapportering":
   "Certified climate reporting",

  /* ───── Services ───── */
  "Hva vi gjør": "What we do",
  "Fagområder <em>i praksis</em>.":
   "Disciplines <em>in practice</em>.",
  "Fra antikvarisk fasaderehabilitering på vernede kirker til store, kompliserte riggentrepriser i drift — vi løser oppgaven med håndverkere som er stolte av faget.":
   "From heritage facade restoration on protected churches to large, complex site-establishment contracts in active operation — we solve the task with craftspeople who take pride in their trade.",
  "<em>01</em> — Fagområde": "<em>01</em> — Discipline",
  "<em>02</em> — Fagområde": "<em>02</em> — Discipline",
  "<em>03</em> — Fagområde": "<em>03</em> — Discipline",
  "<em>04</em> — Fagområde": "<em>04</em> — Discipline",
  "Antikvarisk rehabilitering": "Heritage restoration",
  "Bevaring av vernede bygg med riktige metoder og materialer — kalkpuss, blyglass, naturstein, kobber og tre.":
   "Preservation of protected buildings with the right methods and materials — lime plaster, leaded glass, natural stone, copper and timber.",
  "Komplisert rigg, drift og brakkerigg på sykehus, museer og store bygg som er i full operativ drift.":
   "Complex site setup, operation and modular cabin facilities at hospitals, museums and large buildings in full operational use.",
  "Tak &amp; fasade": "Roof &amp; facade",
  "Skifertekking, kobberarbeid, mørtelfuger, takrenner og blikkenslagerarbeid på krevende, gamle bygg.":
   "Slate roofing, copper work, mortar joints, gutters and tinsmith work on demanding, historic buildings.",
  "Nybygg": "New construction",
  "Som totalentreprenør leverer vi nybygg der detaljkvalitet og presisjon er like viktig som tempo.":
   "As a turnkey contractor we deliver new buildings where detail quality and precision matter as much as pace.",
  "Les mer <span>→</span>": "Read more <span>→</span>",

  /* ───── Projects section ───── */
  "Utvalgte prosjekter": "Selected projects",
  "Antikvarisk og <em>rigg</em>, side ved side.":
   "Heritage and <em>site work</em>, side by side.",
  "Et utvalg fra to kjernevirksomheter — antikvariske bygg restaurert i samråd med Riksantikvaren, og riggentrepriser på sykehus, museer og store offentlige bygg.":
   "A selection from two core practices — heritage buildings restored in consultation with the Directorate for Cultural Heritage, and site-establishment contracts on hospitals, museums and major public buildings.",
  "Historisk Museum, Oslo": "Historical Museum, Oslo",
  "Historisk Museum i Oslo, sett fra luften med tak under rehabilitering":
   "The Historical Museum in Oslo, seen from above with roof under restoration",
  "Antikvarisk · Generalentreprise":
   "Heritage · Main contract",
  "Historisk Museum": "Historical Museum",
  "Bekkelaget Kirke": "Bekkelaget Church",
  "Bekkelaget kirke fotografert ovenfra":
   "Bekkelaget Church photographed from above",
  "Antikvarisk · Kirke": "Heritage · Church",
  "Nytt Nasjonalmuseum": "The New National Museum",
  "Nytt Nasjonalmuseum under bygging — riggentreprise":
   "The New National Museum during construction — site-establishment contract",
  "Rigg · Statsbygg": "Site work · Statsbygg",
  "Frogner Kirke": "Frogner Church",
  "Detalj av kobberkledd takspir og granittfasade på Frogner kirke":
   "Detail of copper-clad spire and granite facade on Frogner Church",
  "Antikvarisk · Granitt &amp; kobber":
   "Heritage · Granite &amp; copper",
  "Campus Ås — byggherrerigg":
   "Campus Ås — owner site facilities",
  "Overvåkningskamera mot blå himmel — byggherrerigg på Campus Ås":
   "Surveillance camera against a blue sky — owner site facilities at Campus Ås",
  "Campus Ås": "Campus Ås",
  "Holmenkollen — riggentreprise":
   "Holmenkollen — site-establishment contract",
  "Riggentreprise på Holmenkollen":
   "Site-establishment contract at Holmenkollen",
  "Rigg · Ikonisk anlegg":
   "Site work · Iconic venue",
  "Holmenkollen": "Holmenkollen",
  "Også: Uranienborg · Fredrikstad Domkirke · Fredrikstad Infanterikaserne · Kråkstad · Akershus Universitetssykehus · Østfold Sykehus":
   "Also: Uranienborg · Fredrikstad Cathedral · Fredrikstad Infantry Barracks · Kråkstad · Akershus University Hospital · Østfold Hospital",
  "Hele referanselisten <span class=\"arrow\">→</span>":
   "Full reference list <span class=\"arrow\">→</span>",

  /* ───── Craft section ───── */
  "Historisk Museum · 100 håndverkere":
   "Historical Museum · 100 craftspeople",
  "Innvendig presenningstak over takrehabilitering på Historisk Museum":
   "Interior tarpaulin roof over the roof restoration at the Historical Museum",
  "Håndverket": "The craft",
  "Når tegl, blyglass og <em>kobber</em> krever fingerspissfølelse.":
   "When brick, leaded glass and <em>copper</em> demand a delicate touch.",
  "På Historisk Museum la vi om ~2 000 m² tak med ny skifer, kobberdetaljer, takrenner, piper og takvinduer — mens 40+ kilometer mørtelfuger ble skrapt og fuget på nytt. Nesten 600 vindusrammer ble demontert og restaurert, og rundt 100 blyglassfag ble rehabilitert. Alt mens museet var i drift.":
   "At the Historical Museum we re-laid ~2,000 m² of roof with new slate, copper details, gutters, chimneys and skylights — while 40+ kilometres of mortar joints were raked out and re-pointed. Nearly 600 window frames were dismounted and restored, and about 100 leaded-glass panes were rehabilitated. All while the museum stayed open.",
  "— Skifer": "— Slate",
  "Tak &amp; renner": "Roof &amp; gutters",
  "Tradisjonell tekking, kobberbeslag og piper.":
   "Traditional roofing, copper flashings and chimneys.",
  "— Mur": "— Masonry",
  "Mørtelfuger": "Mortar joints",
  "Skraping, fuging og utskiftning av sandstein.":
   "Raking, re-pointing and replacement of sandstone.",
  "— Tre": "— Timber",
  "Vindusrammer": "Window frames",
  "Demontering, restaurering og remontering.":
   "Dismounting, restoration and re-installation.",
  "— Glass": "— Glass",
  "Blyglass": "Leaded glass",
  "Skånsom rehabilitering av hånddetaljerte fag.":
   "Gentle rehabilitation of hand-detailed panes.",

  /* ───── Sustainability section ───── */
  "Å rehabilitere det gamle er <em>et bedre valg</em>.":
   "Restoring the old is <em>the better choice</em>.",
  "Når vi tar vare på det som allerede står, reduseres mengden avfall og behov for nytt materiell. Bærekraft betyr for oss å forene sosiale, økonomiske og miljømessige hensyn — fra Miljøfyrtårn-rapportering til konkrete mål om fossilfri bilpark innen 2030.":
   "When we take care of what already stands, the volume of waste and the need for new materials is reduced. For us, sustainability means combining social, economic and environmental considerations — from Eco-Lighthouse reporting to concrete goals such as a fossil-free vehicle fleet by 2030.",
  "Vi har identifisert seks av FNs bærekraftsmål som mest relevante for vår virksomhet, og jobber aktivt mot sosial dumping i hele leverandørkjeden.":
   "We have identified six of the UN Sustainable Development Goals as most relevant to our business, and work actively against social dumping throughout the supply chain.",
  "Anstendig arbeid &amp; vekst":
   "Decent work &amp; growth",
  "Trygge arbeidsplasser, mangfold og likestilling — forankret i en egen likestillingspolicy.":
   "Safe workplaces, diversity and equality — anchored in our own equality policy.",
  "Ansvarlig forbruk &amp; produksjon":
   "Responsible consumption &amp; production",
  "Effektiv ressursbruk, ombruk og kvalitetshåndverk som varer.":
   "Efficient use of resources, reuse and quality craftsmanship that lasts.",
  "Klima &amp; energi": "Climate &amp; energy",
  "Fossilfri bilpark innen 2030 og fornybar elektrisitet med opprinnelsesgaranti.":
   "Fossil-free vehicle fleet by 2030 and renewable electricity with guarantee of origin.",
  "Stoppe sosial dumping": "Stop social dumping",
  "Aktiv kontroll i hele leverandørkjeden, med utgangspunkt i OECD- og ILO-prinsipper.":
   "Active oversight across the entire supply chain, based on OECD and ILO principles.",

  /* ───── Careers section ───── */
  "Bli en del av et <em>fagmiljø</em> som tar vare på det som er.":
   "Join a <em>professional community</em> that takes care of what is.",
  "Vi rekrutterer faglærte tømrere, blikkenslagere, murere og lærlinger. Hos oss får du jobbe på noen av landets mest spennende antikvariske prosjekter — sammen med et lag som er stolte av faget og av hverandre.":
   "We recruit skilled carpenters, tinsmiths, masons and apprentices. With us you get to work on some of the country's most exciting heritage projects — alongside a team that is proud of the craft and of each other.",
  "Se ledige stillinger <span class=\"arrow\">→</span>":
   "See open positions <span class=\"arrow\">→</span>",
  "Søk som lærling": "Apply as an apprentice",
  "Håndverker fra Karlsen &amp; Nordseth på en byggeplass":
   "A craftsperson from Karlsen &amp; Nordseth on a construction site",

  /* ───── Contact section ───── */
  "Et prosjekt vi bør <em>se på sammen</em>?":
   "A project we should <em>look at together</em>?",
  "Ser du etter en entreprenør for ditt prosjekt eller en ny spennende arbeidsplass? Send oss noen ord — vi svarer i løpet av én arbeidsdag.":
   "Looking for a contractor for your project or an exciting new place to work? Send us a few lines — we reply within one working day.",
  "Telefon": "Phone",
  "E-post": "Email",
  "Navn": "Name",
  "Hva gjelder henvendelsen?": "What is your enquiry about?",
  "Vi svarer innen én arbeidsdag.":
   "We reply within one working day.",
  "Send <span class=\"arrow\">→</span>":
   "Send <span class=\"arrow\">→</span>",

  /* ───── Footer ───── */
  "Antikvarisk håndverk siden <em>1992</em> — i Oslo og på Østlandet.":
   "Heritage craftsmanship since <em>1992</em> — in Oslo and Eastern Norway.",
  "Selskapet": "Company",
  "Tjenester": "Services",
  "Sosiale medier": "Social media",
  "LinkedIn": "LinkedIn",
  "Facebook": "Facebook",
  "Instagram": "Instagram",

  /* ───── AI assistant (voice-agent.js) ───── */
  "Spør AI": "Ask AI",
  "AI-assistent": "AI assistant",
  "Karlsen &amp; Nordseth Entreprenør AI Assistent":
   "Karlsen &amp; Nordseth Entreprenør AI Assistant",
  "Lytter…": "Listening…",
  "Lukk": "Close",
  "Slå på stemme": "Turn on voice",
  "Slå av stemme": "Turn off voice",
  "Spør om et prosjekt, fag eller stilling…":
   "Ask about a project, trade or job…",
  "Skriv et spørsmål": "Write a question",
  "Send": "Send",
  "eller": "or"
 },

 /* ============================================================
    POLISH
    ============================================================ */
 pl: {

  /* ───── <title> ───── */
  "Karlsen & Nordseth Entreprenør — Antikvarisk rehabilitering i Oslo":
   "Karlsen & Nordseth Entreprenør — Renowacja zabytków w Oslo",

  /* ───── Skip link ───── */
  "Hopp til innhold": "Przejdź do treści",

  /* ───── Header / nav ───── */
  "Karlsen & Nordseth Entreprenør — forsiden":
   "Karlsen & Nordseth Entreprenør — strona główna",
  "Karlsen &amp; Nordseth Entreprenør":
   "Karlsen &amp; Nordseth Entreprenør",
  "Hovedmeny": "Menu główne",
  "Prosjekter": "Projekty",
  "Om oss": "O nas",
  "Bærekraft": "Zrównoważony rozwój",
  "Etikk og ansvar": "Etyka i odpowiedzialność",
  "Stillinger": "Praca",
  "Kontakt": "Kontakt",
  "Åpne meny": "Otwórz menu",
  "Meny": "Menu",

  /* ───── Hero ───── */
  "Velkommen": "Witamy",
  "Etablert 1992 — Oslo &amp; Østlandet":
   "Założeni w 1992 — Oslo i wschodnia Norwegia",
  "Med <span class=\"em\">lidenskap</span> for&nbsp;antikvariske&nbsp;bygg.":
   "Z <span class=\"em\">pasją</span> do&nbsp;zabytkowych&nbsp;budynków.",
  "Kopier organisasjonsnummer 985 214 034 til utklippstavlen":
   "Skopiuj numer organizacji 985 214 034 do schowka",
  "Klikk for å kopiere org.nr.":
   "Kliknij, aby skopiować numer organizacji",
  "Org.nr.": "Nr org.",
  "Spesialister på antikvarisk rehabilitering, riggentrepriser og nybygg.":
   "Specjaliści od renowacji zabytków, zaplecza placów budowy i nowych obiektów.",
  "Søk etter prosjekt, fag, kompetanse eller bygg…":
   "Szukaj projektu, branży, kompetencji lub budynku…",
  "Søk på siten": "Szukaj na stronie",
  "Søk": "Szukaj",
  "Hurtigsøk": "Szybkie wyszukiwanie",
  "Prøv:": "Spróbuj:",
  "Kirker": "Kościoły",
  "Tak &amp; fasade": "Dach i elewacja",
  "Riggentrepriser": "Zaplecze placu budowy",
  "Bla videre": "Przewiń dalej",

  /* ───── Manifesto / about ───── */
  "Spesialister på å bevare <em class=\"em\">det som er verdt å bevare</em>.":
   "Specjaliści w zachowywaniu <em class=\"em\">tego, co warto zachować</em>.",
  "Vi er en mellomstor entreprenør med fokus på antikvarisk rehabilitering, riggentrepriser og nybygg. Med lang erfaring innen tak- og fasadearbeid, og rigg og drift av byggeplasser, jobber vi for store eiendomsbesittere, det offentlige og selvstendige eiendomsutviklere.":
   "Jesteśmy średniej wielkości wykonawcą skupionym na renowacji zabytków, zapleczu placów budowy i nowych obiektach. Dzięki wieloletniemu doświadczeniu w pracach dachowych i elewacyjnych oraz w organizacji i obsłudze placów budowy współpracujemy z dużymi właścicielami nieruchomości, sektorem publicznym i niezależnymi deweloperami.",
  "Vårt fokus er å bevare byggehistorien — og videreføre arven av norsk byggekunst gjennom spesialisert kompetanse på historiske byggemetoder og detaljert håndverk.":
   "Naszym celem jest zachowanie historii budownictwa — i kontynuowanie dziedzictwa norweskiej architektury poprzez specjalistyczną wiedzę o dawnych technikach budowlanych oraz szczegółowe rzemiosło.",

  /* ───── Stats strip ───── */
  "Etablert i Oslo": "Założeni w Oslo",
  "<em>274</em> MNOK": "<em>274</em> mln NOK",
  "Omsetning (gjennomsnitt siste 5 år)":
   "Obrót (średnia z ostatnich 5 lat)",
  "Mål: fossilfri bilpark":
   "Cel: flota bez paliw kopalnych",
  "Miljøfyrtårn": "Miljøfyrtårn (norweski certyfikat ekologiczny)",
  "Sertifisert klimarapportering":
   "Certyfikowana sprawozdawczość klimatyczna",

  /* ───── Services ───── */
  "Hva vi gjør": "Czym się zajmujemy",
  "Fagområder <em>i praksis</em>.":
   "Nasze branże <em>w praktyce</em>.",
  "Fra antikvarisk fasaderehabilitering på vernede kirker til store, kompliserte riggentrepriser i drift — vi løser oppgaven med håndverkere som er stolte av faget.":
   "Od renowacji elewacji zabytkowych kościołów po duże, złożone kontrakty na zaplecze placów budowy w pełnej eksploatacji — realizujemy zadania razem z rzemieślnikami, którzy są dumni ze swojego fachu.",
  "<em>01</em> — Fagområde": "<em>01</em> — Branża",
  "<em>02</em> — Fagområde": "<em>02</em> — Branża",
  "<em>03</em> — Fagområde": "<em>03</em> — Branża",
  "<em>04</em> — Fagområde": "<em>04</em> — Branża",
  "Antikvarisk rehabilitering": "Renowacja zabytków",
  "Bevaring av vernede bygg med riktige metoder og materialer — kalkpuss, blyglass, naturstein, kobber og tre.":
   "Zachowanie chronionych budynków przy użyciu właściwych metod i materiałów — tynk wapienny, witraże ołowiane, kamień naturalny, miedź i drewno.",
  "Komplisert rigg, drift og brakkerigg på sykehus, museer og store bygg som er i full operativ drift.":
   "Skomplikowane zaplecze, obsługa placu budowy i kontenery socjalne w szpitalach, muzeach i dużych obiektach pozostających w pełnej eksploatacji.",
  "Skifertekking, kobberarbeid, mørtelfuger, takrenner og blikkenslagerarbeid på krevende, gamle bygg.":
   "Krycie łupkiem, prace miedziane, fugowanie, rynny i prace blacharskie na wymagających, zabytkowych budynkach.",
  "Nybygg": "Nowe budownictwo",
  "Som totalentreprenør leverer vi nybygg der detaljkvalitet og presisjon er like viktig som tempo.":
   "Jako generalny wykonawca realizujemy nowe budynki, w których jakość detalu i precyzja liczą się tak samo jak tempo.",
  "Les mer <span>→</span>": "Więcej <span>→</span>",

  /* ───── Projects section ───── */
  "Utvalgte prosjekter": "Wybrane projekty",
  "Antikvarisk og <em>rigg</em>, side ved side.":
   "Zabytki i <em>zaplecze budowy</em>, ramię w ramię.",
  "Et utvalg fra to kjernevirksomheter — antikvariske bygg restaurert i samråd med Riksantikvaren, og riggentrepriser på sykehus, museer og store offentlige bygg.":
   "Wybór z dwóch głównych obszarów działalności — zabytkowych budynków restaurowanych w porozumieniu z Norweskim Konserwatorem Zabytków oraz kontraktów na zaplecze placów budowy szpitali, muzeów i dużych obiektów publicznych.",
  "Historisk Museum, Oslo": "Muzeum Historyczne, Oslo",
  "Historisk Museum i Oslo, sett fra luften med tak under rehabilitering":
   "Muzeum Historyczne w Oslo z lotu ptaka — dach w trakcie renowacji",
  "Antikvarisk · Generalentreprise":
   "Zabytki · Generalne wykonawstwo",
  "Historisk Museum": "Muzeum Historyczne",
  "Bekkelaget Kirke": "Kościół Bekkelaget",
  "Bekkelaget kirke fotografert ovenfra":
   "Kościół Bekkelaget z lotu ptaka",
  "Antikvarisk · Kirke": "Zabytki · Kościół",
  "Nytt Nasjonalmuseum": "Nowe Muzeum Narodowe",
  "Nytt Nasjonalmuseum under bygging — riggentreprise":
   "Nowe Muzeum Narodowe w trakcie budowy — kontrakt na zaplecze",
  "Rigg · Statsbygg": "Zaplecze · Statsbygg",
  "Frogner Kirke": "Kościół Frogner",
  "Detalj av kobberkledd takspir og granittfasade på Frogner kirke":
   "Detal miedzianej iglicy i granitowej elewacji kościoła Frogner",
  "Antikvarisk · Granitt &amp; kobber":
   "Zabytki · Granit i miedź",
  "Campus Ås — byggherrerigg":
   "Campus Ås — zaplecze inwestora",
  "Overvåkningskamera mot blå himmel — byggherrerigg på Campus Ås":
   "Kamera monitoringu na tle błękitnego nieba — zaplecze inwestora na Campus Ås",
  "Campus Ås": "Campus Ås",
  "Holmenkollen — riggentreprise":
   "Holmenkollen — kontrakt na zaplecze",
  "Riggentreprise på Holmenkollen":
   "Kontrakt na zaplecze w Holmenkollen",
  "Rigg · Ikonisk anlegg":
   "Zaplecze · Obiekt kultowy",
  "Holmenkollen": "Holmenkollen",
  "Også: Uranienborg · Fredrikstad Domkirke · Fredrikstad Infanterikaserne · Kråkstad · Akershus Universitetssykehus · Østfold Sykehus":
   "Również: Uranienborg · Katedra w Fredrikstad · Koszary Piechoty w Fredrikstad · Kråkstad · Szpital Uniwersytecki Akershus · Szpital Østfold",
  "Hele referanselisten <span class=\"arrow\">→</span>":
   "Pełna lista referencji <span class=\"arrow\">→</span>",

  /* ───── Craft section ───── */
  "Historisk Museum · 100 håndverkere":
   "Muzeum Historyczne · 100 rzemieślników",
  "Innvendig presenningstak over takrehabilitering på Historisk Museum":
   "Wewnętrzny dach z plandeki nad renowacją dachu Muzeum Historycznego",
  "Håndverket": "Rzemiosło",
  "Når tegl, blyglass og <em>kobber</em> krever fingerspissfølelse.":
   "Gdy cegła, witraże ołowiane i <em>miedź</em> wymagają wyczucia.",
  "På Historisk Museum la vi om ~2 000 m² tak med ny skifer, kobberdetaljer, takrenner, piper og takvinduer — mens 40+ kilometer mørtelfuger ble skrapt og fuget på nytt. Nesten 600 vindusrammer ble demontert og restaurert, og rundt 100 blyglassfag ble rehabilitert. Alt mens museet var i drift.":
   "W Muzeum Historycznym wymieniliśmy ~2 000 m² dachu, kładąc nowy łupek, detale miedziane, rynny, kominy i okna dachowe — jednocześnie ponad 40 kilometrów fug zostało wyskrobanych i wykonanych na nowo. Niemal 600 ram okiennych zostało zdemontowanych i odrestaurowanych, a około 100 witraży ołowianych poddano rehabilitacji. Wszystko podczas pełnego funkcjonowania muzeum.",
  "— Skifer": "— Łupek",
  "Tak &amp; renner": "Dach i rynny",
  "Tradisjonell tekking, kobberbeslag og piper.":
   "Tradycyjne krycie, obróbki miedziane i kominy.",
  "— Mur": "— Mur",
  "Mørtelfuger": "Fugi zaprawowe",
  "Skraping, fuging og utskiftning av sandstein.":
   "Wyskrobywanie, fugowanie i wymiana piaskowca.",
  "— Tre": "— Drewno",
  "Vindusrammer": "Ramy okienne",
  "Demontering, restaurering og remontering.":
   "Demontaż, renowacja i ponowny montaż.",
  "— Glass": "— Szkło",
  "Blyglass": "Witraże ołowiane",
  "Skånsom rehabilitering av hånddetaljerte fag.":
   "Delikatna rehabilitacja ręcznie wykonanych witraży.",

  /* ───── Sustainability section ───── */
  "Å rehabilitere det gamle er <em>et bedre valg</em>.":
   "Renowacja starego to <em>lepszy wybór</em>.",
  "Når vi tar vare på det som allerede står, reduseres mengden avfall og behov for nytt materiell. Bærekraft betyr for oss å forene sosiale, økonomiske og miljømessige hensyn — fra Miljøfyrtårn-rapportering til konkrete mål om fossilfri bilpark innen 2030.":
   "Kiedy dbamy o to, co już istnieje, ograniczamy ilość odpadów i zapotrzebowanie na nowe materiały. Zrównoważony rozwój oznacza dla nas łączenie aspektów społecznych, ekonomicznych i środowiskowych — od sprawozdawczości Miljøfyrtårn po konkretne cele, takie jak flota bez paliw kopalnych do 2030 roku.",
  "Vi har identifisert seks av FNs bærekraftsmål som mest relevante for vår virksomhet, og jobber aktivt mot sosial dumping i hele leverandørkjeden.":
   "Zidentyfikowaliśmy sześć Celów Zrównoważonego Rozwoju ONZ jako najistotniejszych dla naszej działalności i aktywnie przeciwdziałamy dumpingowi społecznemu w całym łańcuchu dostaw.",
  "Anstendig arbeid &amp; vekst":
   "Godna praca i wzrost",
  "Trygge arbeidsplasser, mangfold og likestilling — forankret i en egen likestillingspolicy.":
   "Bezpieczne miejsca pracy, różnorodność i równość — zapisane we własnej polityce równościowej.",
  "Ansvarlig forbruk &amp; produksjon":
   "Odpowiedzialna konsumpcja i produkcja",
  "Effektiv ressursbruk, ombruk og kvalitetshåndverk som varer.":
   "Efektywne wykorzystanie zasobów, ponowne użycie i rzemiosło o trwałej jakości.",
  "Klima &amp; energi": "Klimat i energia",
  "Fossilfri bilpark innen 2030 og fornybar elektrisitet med opprinnelsesgaranti.":
   "Flota bez paliw kopalnych do 2030 roku i odnawialna energia elektryczna z gwarancją pochodzenia.",
  "Stoppe sosial dumping": "Stop dumpingowi społecznemu",
  "Aktiv kontroll i hele leverandørkjeden, med utgangspunkt i OECD- og ILO-prinsipper.":
   "Aktywna kontrola w całym łańcuchu dostaw, oparta na zasadach OECD i ILO.",

  /* ───── Careers section ───── */
  "Bli en del av et <em>fagmiljø</em> som tar vare på det som er.":
   "Dołącz do <em>środowiska zawodowego</em>, które dba o to, co jest.",
  "Vi rekrutterer faglærte tømrere, blikkenslagere, murere og lærlinger. Hos oss får du jobbe på noen av landets mest spennende antikvariske prosjekter — sammen med et lag som er stolte av faget og av hverandre.":
   "Rekrutujemy wykwalifikowanych cieśli, blacharzy, murarzy i uczniów zawodu. U nas będziesz pracować przy jednych z najciekawszych w kraju projektów konserwatorskich — w zespole, który jest dumny ze swojego fachu i z siebie nawzajem.",
  "Se ledige stillinger <span class=\"arrow\">→</span>":
   "Zobacz oferty pracy <span class=\"arrow\">→</span>",
  "Søk som lærling": "Aplikuj jako uczeń",
  "Håndverker fra Karlsen &amp; Nordseth på en byggeplass":
   "Rzemieślnik z Karlsen &amp; Nordseth na placu budowy",

  /* ───── Contact section ───── */
  "Et prosjekt vi bør <em>se på sammen</em>?":
   "Projekt, na który powinniśmy <em>spojrzeć razem</em>?",
  "Ser du etter en entreprenør for ditt prosjekt eller en ny spennende arbeidsplass? Send oss noen ord — vi svarer i løpet av én arbeidsdag.":
   "Szukasz wykonawcy dla swojego projektu lub nowego, ciekawego miejsca pracy? Napisz do nas kilka słów — odpowiemy w ciągu jednego dnia roboczego.",
  "Telefon": "Telefon",
  "E-post": "E-mail",
  "Navn": "Imię i nazwisko",
  "Hva gjelder henvendelsen?": "Czego dotyczy zapytanie?",
  "Vi svarer innen én arbeidsdag.":
   "Odpowiadamy w ciągu jednego dnia roboczego.",
  "Send <span class=\"arrow\">→</span>":
   "Wyślij <span class=\"arrow\">→</span>",

  /* ───── Footer ───── */
  "Antikvarisk håndverk siden <em>1992</em> — i Oslo og på Østlandet.":
   "Rzemiosło konserwatorskie od <em>1992</em> roku — w Oslo i wschodniej Norwegii.",
  "Selskapet": "Firma",
  "Tjenester": "Usługi",
  "Sosiale medier": "Media społecznościowe",
  "LinkedIn": "LinkedIn",
  "Facebook": "Facebook",
  "Instagram": "Instagram",

  /* ───── AI assistant (voice-agent.js) ───── */
  "Spør AI": "Zapytaj AI",
  "AI-assistent": "Asystent AI",
  "Karlsen &amp; Nordseth Entreprenør AI Assistent":
   "Asystent AI Karlsen &amp; Nordseth Entreprenør",
  "Lytter…": "Słucham…",
  "Lukk": "Zamknij",
  "Slå på stemme": "Włącz głos",
  "Slå av stemme": "Wyłącz głos",
  "Spør om et prosjekt, fag eller stilling…":
   "Zapytaj o projekt, branżę lub ofertę pracy…",
  "Skriv et spørsmål": "Napisz pytanie",
  "Send": "Wyślij",
  "eller": "lub"
 }
};
