/* ═══════════════════════════════════════════════════════════════════════
   AI ASSISTENT — Karlsen & Nordseth Entreprenør
   Pille plassert ved siden av søkefeltet i hero. Klikk for å åpne et
   lite panel og starte talen.
     1. Klikk pille → panel åpner med START
     2. Klikk START → "Kobler til" → "Lytter"
     3. Panel skjuler seg ~1.8s etter at den er live. Pillen forblir live.
     4. Hover pillen for å vise LIVE-panelet (status + mute + avslutt).
     5. Klikk pillen for å veksle panelet når som helst.
   Verktøy: rull til seksjon, fremhev prosjekt/kompetanse, fyll søk.
   Ingen sidenavigasjon — alt er på samme side.
   ═══════════════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  // ── API base URL ───────────────────────────────────────────────────────
  // Locally: leave empty → uses relative /api/* paths via voice_server.py
  // On GitHub Pages: set to your Cloudflare Worker URL, e.g.:
  //   'https://kne-api.YOUR-SUBDOMAIN.workers.dev'
  const API_BASE = '';

  // INGEN VERKTØY — kun ren tale for nå. Ingen rull, ingen fremheving,
  // ingen søkefyll. Holder ting enkelt slik at modellen bare svarer.
  const TOOLS = [];

  // ── i18n: dynamiske strenger som ikke kan fanges av i18n-snapshot ──
  // (state-labels, feilmeldinger, velkomst-melding, opening-greeting til LLM,
  //  systemprompt-språkinstruks). Statiske DOM-strenger oversettes av
  //  assets/i18n.js via dets snapshot — se assets/i18n-dict.js for nøklene.
  const LANG_STORAGE_KEY = 'kne.lang';
  const DEFAULT_LANG = 'no';

  function getLang() {
    let l = DEFAULT_LANG;
    try { l = localStorage.getItem(LANG_STORAGE_KEY) || DEFAULT_LANG; } catch (e) {}
    return LOCALES[l] ? l : DEFAULT_LANG;
  }
  // Snapshot of "current language" — refreshed on every kne:langchange so
  // helpers don't have to read localStorage on every call.
  let curLang = DEFAULT_LANG;

  // Per-language strings. Add a new top-level key to extend with more locales.
  const LOCALES = {
    no: {
      welcome: 'Hei! Spør om prosjekter, fagområder, bærekraft eller stillinger — så svarer jeg med det jeg vet.\n\n⚠ Dette er en demo — AI-en er ikke ferdig trent ennå, og svarene kan være unøyaktige.',
      thinking: 'Tenker',
      stateLabel: { idle:'Klar', connecting:'Kobler til', listening:'Lytter', speaking:'Snakker', muted:'Dempet', error:'Feil' },
      pillBase: 'Spør AI',
      micOn:  'Slå på stemme',
      micOff: 'Slå av stemme',
      // Errors
      errChatHttp:    (status) => 'Beklager — jeg får ikke kontakt akkurat nå. (' + status + ')',
      errChatEmpty:   'Jeg fikk ikke noe svar — prøv igjen.',
      errChatFetch:   'Beklager — noe gikk galt med tilkoblingen.',
      errVoiceConn:   'Tilkoblingsfeil. Prøv igjen.',
      errMicBlocked:  'Mikrofon blokkert — gi tilgang og prøv igjen.',
      errMicGeneric:  'Kunne ikke starte. Sjekk mikrofontilgangen.',
      errXaiGeneric:  'xAI returnerte en feil.',
      errNoToken:     'Ingen token returnert',
      // System-prompt language instruction (replaces the Norwegian one in INSTRUCTIONS)
      langInstruction: 'Du skal alltid svare på norsk bokmål.',
      langInstructionChat: 'Du skal alltid svare på norsk bokmål. Hold svar korte og klare — som en samtale, ikke en rapport.',
      voiceFollowup: 'Brukeren har akkurat byttet fra tekst til tale. Fortsett samtalen naturlig på norsk bokmål.',
      voiceOpening:  'Åpningshilsen på norsk bokmål. Si akkurat dette og ingenting mer: "Hei. Jeg er AI-assistenten til Karlsen og Nordseth." Stopp så og vent på brukeren.',
    },
    en: {
      welcome: "Hi! Ask about projects, disciplines, sustainability or careers.\n\n⚠ Demo only — this AI is not fully trained and responses may be inaccurate.",
      thinking: 'Thinking',
      stateLabel: { idle:'Ready', connecting:'Connecting', listening:'Listening', speaking:'Speaking', muted:'Muted', error:'Error' },
      pillBase: 'Ask AI',
      micOn:  'Turn on voice',
      micOff: 'Turn off voice',
      errChatHttp:    (status) => 'Sorry — I can’t reach the server right now. (' + status + ')',
      errChatEmpty:   'I didn’t get a reply — please try again.',
      errChatFetch:   'Sorry — something went wrong with the connection.',
      errVoiceConn:   'Connection error. Please try again.',
      errMicBlocked:  'Microphone blocked — grant access and try again.',
      errMicGeneric:  'Could not start. Check microphone access.',
      errXaiGeneric:  'xAI returned an error.',
      errNoToken:     'No token returned',
      langInstruction: 'You must always respond in English. The site copy and source material is in Norwegian — translate as needed but always reply to the user in English.',
      langInstructionChat: 'You must always respond in English. Keep answers short and clear — like a conversation, not a report. The site copy is in Norwegian; translate as needed but reply in English.',
      voiceFollowup: 'The user just switched from text to voice. Continue the conversation naturally in English.',
      voiceOpening:  'Opening greeting in English. Say exactly this and nothing more: "Hi. I am the AI assistant for Karlsen and Nordseth." Then stop and wait for the user.',
    },
    pl: {
      welcome: 'Cześć! Zapytaj o projekty, branże, zrównoważony rozwój lub oferty pracy — odpowiem tym, co wiem.\n\n⚠ To jest wersja demo — AI nie jest jeszcze w pełni wytrenowana, a odpowiedzi mogą być niedokładne.',
      thinking: 'Myślę',
      stateLabel: { idle:'Gotowe', connecting:'Łączę', listening:'Słucham', speaking:'Mówię', muted:'Wyciszone', error:'Błąd' },
      pillBase: 'Zapytaj AI',
      micOn:  'Włącz głos',
      micOff: 'Wyłącz głos',
      errChatHttp:    (status) => 'Przepraszam — nie mogę się teraz połączyć. (' + status + ')',
      errChatEmpty:   'Nie otrzymałem odpowiedzi — spróbuj ponownie.',
      errChatFetch:   'Przepraszam — coś poszło nie tak z połączeniem.',
      errVoiceConn:   'Błąd połączenia. Spróbuj ponownie.',
      errMicBlocked:  'Mikrofon zablokowany — udziel dostępu i spróbuj ponownie.',
      errMicGeneric:  'Nie udało się uruchomić. Sprawdź dostęp do mikrofonu.',
      errXaiGeneric:  'xAI zwróciło błąd.',
      errNoToken:     'Nie zwrócono tokenu',
      langInstruction: 'Musisz zawsze odpowiadać po polsku. Treść strony i materiały źródłowe są po norwesku — tłumacz w razie potrzeby, ale zawsze odpowiadaj użytkownikowi po polsku.',
      langInstructionChat: 'Musisz zawsze odpowiadać po polsku. Odpowiedzi mają być krótkie i jasne — jak rozmowa, nie raport. Treść strony jest po norwesku; tłumacz w razie potrzeby, ale odpowiadaj po polsku.',
      voiceFollowup: 'Użytkownik właśnie przełączył się z tekstu na głos. Kontynuuj rozmowę naturalnie po polsku.',
      voiceOpening:  'Powitanie po polsku. Powiedz dokładnie to i nic więcej: "Cześć. Jestem asystentem AI firmy Karlsen i Nordseth." Następnie zatrzymaj się i poczekaj na użytkownika.',
    },
  };
  function L() { return LOCALES[curLang] || LOCALES[DEFAULT_LANG]; }

  // ── System-instruksjoner — kun norsk bokmål + KNE-fakta. Ingen UI-styring. ──
  const INSTRUCTIONS = `Du er AI-assistenten på nettsiden til Karlsen & Nordseth Entreprenør (KNE). Du skal alltid svare på norsk bokmål. Vær varm og profesjonell — som en samtalevennlig kunderepresentant.

ÅPNINGSHILSEN: Si nøyaktig "Hei. Jeg er AI-assistenten til Karlsen og Nordseth." — så stopp og vent på brukeren.

KNE-FAKTA (kun det som står her — ikke finn opp annet):
• Karlsen & Nordseth Entreprenør AS — etablert 1992 i Oslo. Mellomstor byggentreprenør i Oslo og det sentrale østlandsområdet.
• Telefon: +47 67 07 38 30. E-post: post@karlsen-nordseth.no. Org.nr.: 985 214 034.
• Spesialister på antikvarisk rehabilitering, riggentrepriser og nybygg. Lang erfaring med tak- og fasadearbeid og rigg og drift av byggeplasser.
• Kunder: store eiendomsbesittere, det offentlige, boligsameier, eiendomsutviklere.

FAGOMRÅDER (4 hovedfag, 6 underspesialiteter — totalt 10 kompetanseområder i søket):
1. Antikvarisk rehabilitering — bevaring av vernede bygg med kalkpuss, blyglass, naturstein, kobber og tre.
2. Riggentrepriser — rigg og drift på sykehus, museer og store bygg i full drift (Holmenkollen, A-hus, Kalnes, Campus Ås).
3. Tak & fasade — skifertekking, kobberarbeid, mørtelfuger, takrenner, blikkenslagerarbeid.
4. Nybygg — som total- eller generalentreprenør.
Underspesialiteter: Skifertekking, Kobberarbeid, Mørtelfuger & murverk, Vindusrestaurering, Blyglass, Fasaderehabilitering (sameier/borettslag).

REFERANSEPROSJEKTER (19 prosjekter i søket — utvalgte detaljer under, resten listet etter navn):
• HISTORISK MUSEUM (UiO, Tullinløkka, Oslo) — pågående generalentreprise, 112,5 MNOK. Bygget er fra 1897–1902, fredet, tegnet av Henrik Bull. Ca. 2000 m² tak, 4000 m² fasader, ~600 vindusrammer og ~100 blyglassenheter restaurert. 25 tonn kobber, over 40 km mørtelfuger.
• BEKKELAGET KIRKE (Oslo) — 2012, 6,5 MNOK. Steinkirke fra 1920-tallet, tegnet av Harald Bødtker. Tak i kobber, kalkmørtel-fasade.
• FROGNER KIRKE (Oslo) — 2016–2017, 11,6 MNOK. Fra 1907, tegnet av Ivar Næss. Granittfasade, kobbertekking.
• URANIENBORG KIRKE (Oslo) — 2007–2010, 16,5 MNOK. Fra 1880-tallet, tegnet av Balthazar Lange.
• FREDRIKSTAD DOMKIRKE — 2014–2016, 24 MNOK. Fra 1880-tallet, eneste kirke med fyrlykt i tårnet.
• FREDRIKSTAD INFANTERIKASERNE — 2013–2015, 23,5 MNOK. Fredet bygg fra 1788, oppdragsgiver Forsvarsbygg.
• Andre antikvariske bygg: Kråkstad Kirke, Gamle Aker Kirke, Tårnbygningen, Den Franske Skolen, Bygg og Bevar.
• Rigg og drift: Nytt Nasjonalmuseum, Holmenkollen, Akershus Universitetssykehus (A-hus), Campus Ås, Kalnes (Østfold sykehus).
• Sameier/borettslag (fasade): Sandakerveien, Jerikoveien.
• Nybygg: Krokhol.

BÆREKRAFT & ANSVAR: Miljøfyrtårn-rapportert. Mål om fossilfri bilpark innen 2030. Antikvarisk rehab er i seg selv et klimavalg — mindre avfall. Eget arbeid med Åpenhetsloven, etiske retningslinjer, varslingsordning, HMS, mangfold/likestilling og personvern (egne sider for hver).

STILLINGER: Åpen stilling som blikkenslager/taktekker med fagbrev. Tar inn lærlinger i tømrer, murer og blikkenslager. Søknad: post@karlsen-nordseth.no.

NETTSTEDETS OMFANG (det søket vårt dekker — 42 oppslag totalt):
• 19 referanseprosjekter • 10 kompetanseområder • 11 sider (Om oss, Bærekraft, Referanseprosjekter, Stillinger, Etikk og ansvar, Varsling, HMS, Mangfold, Åpenhetsloven, Personvernerklæring, Hjem) • 2 ledige stillinger (Blikkenslager, Lærling).

REGLER:
• Svar alltid på norsk bokmål.
• Aldri finn opp prosjekter, kontraktssummer eller fakta som ikke står over.
• Hold svar korte (under tre setninger) med mindre brukeren ber om detaljer.
• HUSK SAMTALEN — IKKE GJENTA DEG SELV: Du har full historikk over hva du nettopp har sagt. Når brukeren ber om "mer", "utdyp" e.l., bygg VIDERE — ikke re-introduser fakta du allerede har gitt. Behandle forrige svar som etablert kontekst og gå dypere inn i et nytt aspekt.
• Hvis du ikke vet noe, si "Det har jeg ikke fått trent inn ennå" og foreslå at de ringer 67 07 38 30 eller sender e-post.`;

  const TOKEN_ENDPOINT = `${API_BASE}/api/voice-token`;
  const REALTIME_URL = 'wss://api.x.ai/v1/realtime?model=grok-voice-think-fast-1.0';
  // xAI realtime stemmer (alle amerikanske, per docs):
  //   eve — kvinne, energisk og engasjert (default)
  //   ara — kvinne, balansert og samtalevennlig, varm og vennlig
  //   rex — mann, profesjonell og artikulert
  //   sal — nøytral, smidig
  //   leo — mann, bestemt og kommanderende
  const VOICE = 'ara';
  const TARGET_SAMPLE_RATE = 24000;

  // Timings
  const AUTO_HIDE_AFTER_LIVE_MS = 1800;
  const HOVER_HIDE_DELAY_MS = 450;

  // System-prompt for chat-modus (kortere — ingen "ÅPNINGSHILSEN: si nøyaktig…").
  // Built per-language: the KNE facts stay in Norwegian (source of truth), but
  // the language instruction at the top + the chat-mode follow-up are swapped
  // for the active language. The model is instructed to translate facts into
  // the target language as needed.
  // The base prompt is in Norwegian. To switch language we need to neutralise
  // every "answer in Norwegian" instruction in it, otherwise the model picks
  // the rule from REGLER over the top-line langInstruction. We also append
  // the language directive at the END so it's the most-recent instruction
  // the model sees before responding.
  function stripNorwegianLangRules(text) {
    return text
      // Bullet rule in REGLER
      .replace(/• Svar alltid på norsk bokmål\.\n/g, '')
      // Inline emphasis sometimes used elsewhere
      .replace(/Svar alltid på norsk bokmål\./g, '');
  }
  function buildVoiceInstructions(lang) {
    const loc = LOCALES[lang] || LOCALES[DEFAULT_LANG];
    const base = INSTRUCTIONS.replace(
      'Du skal alltid svare på norsk bokmål.',
      loc.langInstruction
    );
    return stripNorwegianLangRules(base) + `\n\n${loc.langInstruction}`;
  }
  function buildChatInstructions(lang) {
    const loc = LOCALES[lang] || LOCALES[DEFAULT_LANG];
    const base = INSTRUCTIONS
      .replace(/ÅPNINGSHILSEN:[^\n]*\n\n/, '')
      .replace('Du skal alltid svare på norsk bokmål.', loc.langInstructionChat);
    return stripNorwegianLangRules(base) + `

NAVIGASJONS-LENKER I CHAT:
Når svaret naturlig peker til en side, inkluder en markdown-lenke i samme setning slik at brukeren kan klikke seg dit. Form: [vis-tekst](url). Ikke auto-naviger — bare gi lenken.

Tilgjengelige sider:
• /prosjekter.html — Prosjekter (samlet oversikt med filterchipser for antikvarisk og rigg)
• /prosjekter.html#antikvarisk — Forhåndsvalgt filter: antikvariske referanser (kirker, museer, fredede bygg)
• /prosjekter.html#rigg — Forhåndsvalgt filter: rigg-referanser (sykehus, museer, store offentlige bygg)
• /prosjekter.html#kirker — Forhåndsvalgt filter: kirker
• /prosjekter.html#live — Forhåndsvalgt filter: pågående prosjekter
• /prosjekter/historisk-museum.html — Flaggskip-prosjektet (UiO Historisk Museum, 112,5 MNOK)
• /om-oss.html — Om selskapet (historie, verdier, tre pilarer)
• /baerekraft.html — Bærekraft og miljø (Miljøfyrtårn, FNs bærekraftsmål)
• /stillinger.html — Ledige stillinger og lærlingplasser
• #kontakt — Kontaktskjema (kun på forsiden)
• #tjenester — Fagområde-oversikt (kun på forsiden)

Regler:
• Maks én lenke per svar — den mest relevante.
• Bruk lenken naturlig i setningen, ikke som etterskrift.
• Pek til den mest spesifikke siden (f.eks. /prosjekter.html#rigg, ikke /prosjekter.html, om brukeren spør spesifikt om rigg).
• Ikke ta med lenke hvis svaret er rent informativt og ikke peker mot noe på siden.

Eksempler:
• Bruker: "Hva slags prosjekter har dere jobbet med?"
  Du: "Vi jobber innen to hovedområder — antikvariske bygg og rigg. Velg [her](/prosjekter.html)."
• Bruker: "Har dere gjort kirker?"
  Du: "Ja — Bekkelaget, Frogner, Uranienborg og Fredrikstad Domkirke, blant andre. Hele lista finner du på [Antikvarisk rehabilitering](/prosjekter.html#antikvarisk)."
• Bruker: "Hva med rigg-prosjekter?"
  Du: "Vi har levert rigg på Nytt Nasjonalmuseum, Ahus og Holmenkollen — se [Rigg & drift](/prosjekter.html#rigg)."
• Bruker: "Søker dere lærlinger?"
  Du: "Ja, vi tar inn lærlinger i tømrer, murer og blikkenslager. Mer på [Stillinger](/stillinger.html)."
• Bruker: "Hvor mye CO2 sparer dere?"
  Du: "Vi måler klimaavtrykk via Miljøfyrtårn og har mål om fossilfri bilpark innen 2030 — detaljer på [Bærekraft](/baerekraft.html)."

${loc.langInstructionChat}`;
  }

  // ── State ─────────────────────────────────────────────────────────────
  let wrap, pill, drop;
  let errorEl, srStatusEl;
  let chatHistoryEl, chatInputEl, chatSendEl;
  let micBtnEl, voiceStatusEl, voiceLabelEl;
  let chatHistory = [];   // [{role:'user'|'assistant', content:'...'}]
  let ws = null;
  let audioContext = null;
  let micStream = null;
  let micSource = null;
  let workletNode = null;
  let silentSink = null;
  let playbackContext = null;
  let playbackQueueTime = 0;
  let state = 'idle';     // idle | connecting | listening | speaking | muted | error
  let isRunning = false;
  let isMuted = false;
  let autoHideTimer = null;
  let hoverHideTimer = null;

  // ── Build DOM ─────────────────────────────────────────────────────────
  function buildWrap() {
    const root = document.createElement('div');
    root.className = 'kne-va-wrap';
    root.dataset.state = 'idle';
    root.innerHTML = `
      <button class="kne-va-pill" type="button"
              aria-label="Spør AI"
              aria-expanded="false">
        <span class="kne-va-pill-dot" aria-hidden="true"></span>
        <span class="kne-va-pill-wf" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </span>
        <span class="kne-va-pill-label">Spør AI</span>
      </button>

      <div class="kne-va-drop" role="dialog" aria-modal="false"
           aria-label="AI-assistent" data-state="idle">
        <div class="kne-va-ai-header">
          <span class="kne-va-ai-title">Karlsen &amp; Nordseth Entreprenør AI Assistent</span>
          <span class="kne-va-voice-status" hidden>
            <span class="kne-va-voice-dot" aria-hidden="true"></span>
            <span class="kne-va-voice-label">Lytter…</span>
          </span>
          <button class="kne-va-ai-close" type="button" aria-label="Lukk">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6"  y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="kne-va-chat-history" aria-live="polite"></div>
        <form class="kne-va-chat-form">
          <button class="kne-va-mic-btn" type="button" aria-label="Slå på stemme">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
            </svg>
          </button>
          <input type="text" class="kne-va-chat-input"
                 placeholder="Spør om et prosjekt, fag eller stilling…"
                 aria-label="Skriv et spørsmål"
                 autocomplete="off">
          <button type="submit" class="kne-va-chat-send" aria-label="Send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </button>
        </form>

        <div class="kne-va-drop-error" role="alert"></div>
      </div>

      <p class="kne-va-sr-only" aria-live="polite"></p>
    `;
    return root;
  }

  function inject() {
    wrap = buildWrap();

    // Plassér pillen ved siden av søkefeltet i hero. Pakker .hero-search
    // og pillen i en flex-rad slik at de står side ved side på brede skjermer
    // og brytes til to linjer på smale. Mellom dem ligger en kursiv "eller".
    const heroSearch = document.querySelector('.hero-search');
    if (heroSearch && heroSearch.parentElement) {
      const parent = heroSearch.parentElement;
      let container = parent.querySelector('.hero-search-row');
      if (!container) {
        container = document.createElement('div');
        container.className = 'hero-search-row';
        container.style.cssText = [
          'display:flex',
          'flex-wrap:wrap',
          'align-items:center',
          'gap:14px',
          'width:100%',
          // Matcher .hero-inner max-width (880px) så raden ikke renner over,
          // og søkeresultater + AI-panel ankret til denne raden flukter eksakt.
          'max-width:880px',
          'margin-top:8px',
          // Positioning context for the AI panel (.kne-va-drop). The drop is
          // absolute-positioned and needs to span the full row width so it
          // sits flush above the search bar — not anchored to the narrow pill.
          'position:relative',
        ].join(';');
        parent.insertBefore(container, heroSearch);
        container.appendChild(heroSearch);
        heroSearch.style.flex = '1 1 320px';
        heroSearch.style.marginTop = '0';
        heroSearch.style.maxWidth = 'none';
      }
      // Sett inn "eller"-skille hvis det ikke allerede er der
      if (!container.querySelector('.kne-va-or')) {
        const orSep = document.createElement('span');
        orSep.className = 'kne-va-or';
        orSep.textContent = 'eller';
        orSep.setAttribute('aria-hidden', 'true');
        container.appendChild(orSep);
      }
      container.appendChild(wrap);
    } else {
      document.body.appendChild(wrap);
    }

    pill          = wrap.querySelector('.kne-va-pill');
    drop          = wrap.querySelector('.kne-va-drop');
    errorEl       = wrap.querySelector('.kne-va-drop-error');
    srStatusEl    = wrap.querySelector('.kne-va-sr-only');
    chatHistoryEl = wrap.querySelector('.kne-va-chat-history');
    chatInputEl   = wrap.querySelector('.kne-va-chat-input');
    chatSendEl    = wrap.querySelector('.kne-va-chat-send');
    const chatForm  = wrap.querySelector('.kne-va-chat-form');
    const closeBtn  = wrap.querySelector('.kne-va-ai-close');
    const micBtn    = wrap.querySelector('.kne-va-mic-btn');
    const voiceStatus = wrap.querySelector('.kne-va-voice-status');
    const voiceLabel  = wrap.querySelector('.kne-va-voice-label');
    // Eksponér disse til hjelpefunksjoner via closure
    micBtnEl = micBtn;
    voiceStatusEl = voiceStatus;
    voiceLabelEl = voiceLabel;

    pill.addEventListener('click', onPillClick);
    closeBtn.addEventListener('click', () => closeAi());
    micBtn.addEventListener('click', () => toggleVoice());
    chatForm.addEventListener('submit', (e) => { e.preventDefault(); sendChatMessage(); });

    // Click outside → close panel
    document.addEventListener('click', (e) => {
      if (!drop.classList.contains('is-open')) return;
      if (wrap.contains(e.target)) return;
      closeAi();
    });
    // ESC → close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drop.classList.contains('is-open')) closeAi();
    });

    // Initial language + react to flag-switcher clicks. Static DOM strings
    // (pill label, panel title, placeholder, etc.) are translated by
    // assets/i18n.js via its snapshot. We only need to refresh strings that
    // we set via JS — state labels, mic aria-label, voice status.
    curLang = getLang();
    document.addEventListener('kne:langchange', (e) => {
      const next = (e && e.detail && e.detail.lang) || getLang();
      const nextLang = LOCALES[next] ? next : DEFAULT_LANG;
      const langActuallyChanged = nextLang !== curLang;
      curLang = nextLang;
      // Re-render dynamic strings to reflect the new language
      setVoiceUi(isRunning && !isMuted);
      setState(state);
      // Reset the chat when language changes — prior assistant replies in
      // the old language otherwise bias the model into ignoring the new
      // system-prompt language instruction.
      if (langActuallyChanged) {
        chatHistory = [];
        if (chatHistoryEl) chatHistoryEl.innerHTML = '';
        if (drop && drop.classList.contains('is-open')) {
          appendChatMsg('ai', L().welcome);
        }
      }
    });
  }

  // ── Panel åpne/lukke ──────────────────────────────────────────────────
  function openAi() {
    drop.classList.add('is-open');
    pill.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-aiing');
    clearError();
    if (!chatHistory.length) {
      appendChatMsg('ai', L().welcome);
    }
    setTimeout(() => {
      try { chatInputEl.focus({ preventScroll: true }); } catch (_) {}
    }, 100);
  }

  function closeAi() {
    drop.classList.remove('is-open');
    pill.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-aiing');
    if (isRunning) endSession();
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  }

  function onPillClick(e) {
    e.stopPropagation();
    if (drop.classList.contains('is-open')) closeAi();
    else openAi();
  }

  function toggleVoice() {
    if (isRunning) {
      endSession();
    } else {
      startSession();
    }
  }

  function setVoiceUi(active) {
    if (!micBtnEl) return;
    micBtnEl.classList.toggle('is-active', !!active);
    micBtnEl.setAttribute('aria-label', active ? L().micOff : L().micOn);
    if (voiceStatusEl) voiceStatusEl.hidden = !active;
  }

  function appendChatMsg(role, text) {
    const msg = document.createElement('div');
    msg.className = 'kne-va-chat-msg ' + (role === 'user' ? 'is-user' : 'is-ai');
    if (role === 'ai') {
      msg.innerHTML = renderInlineMarkdown(text);
    } else {
      msg.textContent = text;
    }
    chatHistoryEl.appendChild(msg);
    chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
    return msg;
  }

  // Konverterer markdown-lenker [tekst](url) til klikkbare <a>-tagger.
  // HTML-escaper alt først for å unngå injection. Tillater bare interne
  // lenker — som starter med "/" eller "#" — for å blokkere eksterne
  // URL-er og javascript:-protokoller.
  function renderInlineMarkdown(text) {
    const escapeHtml = (s) => s.replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
    const escaped = escapeHtml(String(text || ''));
    return escaped.replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      (whole, label, href) => {
        // Aksepter kun interne lenker
        if (!href.startsWith('/') && !href.startsWith('#')) return whole;
        return `<a class="kne-va-chat-link" href="${href}">${label}</a>`;
      }
    );
  }

  async function sendChatMessage() {
    const text = (chatInputEl.value || '').trim();
    if (!text) return;
    chatInputEl.value = '';
    chatSendEl.disabled = true;

    appendChatMsg('user', text);
    chatHistory.push({ role: 'user', content: text });

    // Loading-indikator
    const loading = document.createElement('div');
    loading.className = 'kne-va-chat-msg is-loading';
    loading.textContent = L().thinking;
    chatHistoryEl.appendChild(loading);
    chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;

    try {
      const messages = [
        { role: 'system', content: buildChatInstructions(curLang) },
        ...chatHistory,
      ];
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      loading.remove();
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        appendChatMsg('ai', L().errChatHttp(res.status));
        console.warn('[KNE chat] error', res.status, txt);
        return;
      }
      const data = await res.json();
      const reply = (data.answer || '').trim() || L().errChatEmpty;
      appendChatMsg('ai', reply);
      chatHistory.push({ role: 'assistant', content: reply });
    } catch (err) {
      loading.remove();
      appendChatMsg('ai', L().errChatFetch);
      console.error('[KNE chat] fetch failed', err);
    } finally {
      chatSendEl.disabled = false;
      try { chatInputEl.focus({ preventScroll: true }); } catch (_) {}
    }
  }

  // ── State ─────────────────────────────────────────────────────────────
  function setState(next) {
    state = next;
    wrap.dataset.state = next;
    drop.dataset.state = next;

    wrap.classList.toggle('kne-va-active', isRunning && next !== 'error');

    const statusLabel = L().stateLabel[next] || next;

    if (voiceLabelEl) voiceLabelEl.textContent = statusLabel + '…';
    if (srStatusEl)   srStatusEl.textContent = statusLabel;

    pill.setAttribute('aria-label',
      isRunning ? `${L().pillBase} — ${statusLabel}` : L().pillBase
    );
  }

  function showError(msg) { errorEl.textContent = msg; setState('error'); }
  function clearError()   { errorEl.textContent = ''; }

  // ── Mute toggle ───────────────────────────────────────────────────────
  function toggleMute() {
    if (!isRunning) return;
    isMuted = !isMuted;
    if (micStream) {
      micStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
    }
    if (isMuted) setState('muted');
    else setState('listening');
  }

  // ── Session lifecycle ─────────────────────────────────────────────────
  async function startSession() {
    clearError();
    isRunning = true;
    isMuted = false;
    setVoiceUi(true);
    setState('connecting');

    try {
      const tokRes = await fetch(TOKEN_ENDPOINT, { method: 'POST' });
      if (!tokRes.ok) throw new Error(`Token-server svarte ${tokRes.status}`);
      const tokJson = await tokRes.json();
      const ephemeral = tokJson.token;
      if (!ephemeral) throw new Error(L().errNoToken);

      micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });

      const AC = window.AudioContext || window.webkitAudioContext;
      audioContext = new AC();
      playbackContext = new AC({ sampleRate: TARGET_SAMPLE_RATE });
      if (audioContext.state === 'suspended') await audioContext.resume();
      if (playbackContext.state === 'suspended') await playbackContext.resume();
      playbackQueueTime = playbackContext.currentTime;

      await audioContext.audioWorklet.addModule(createWorkletBlobUrl());
      micSource = audioContext.createMediaStreamSource(micStream);
      workletNode = new AudioWorkletNode(audioContext, 'kne-va-pcm-worklet', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        processorOptions: {
          sourceSampleRate: audioContext.sampleRate,
          targetSampleRate: TARGET_SAMPLE_RATE,
        }
      });

      // Base64 må gjøres på main-tråden (btoa er ikke tilgjengelig i AudioWorkletGlobalScope).
      workletNode.port.onmessage = (e) => {
        if (isMuted) return;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        const bytes = new Uint8Array(e.data);
        if (!bytes.length) return;
        let bin = '';
        const CHUNK = 0x8000;
        for (let i = 0; i < bytes.length; i += CHUNK) {
          bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
        }
        ws.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: btoa(bin) }));
      };

      micSource.connect(workletNode);
      silentSink = audioContext.createGain();
      silentSink.gain.value = 0;
      workletNode.connect(silentSink);
      silentSink.connect(audioContext.destination);

      ws = new WebSocket(REALTIME_URL, [`xai-client-secret.${ephemeral}`]);

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            voice: VOICE,
            instructions: buildVoiceInstructions(curLang),
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            // Be xAI transkribere brukerens tale så vi kan vise det i chatten.
            // Hvis xAI ikke støtter feltet, blir det bare ignorert.
            input_audio_transcription: { model: 'whisper-1' },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.55,
              prefix_padding_ms: 240,
              silence_duration_ms: 720,
            },
          },
        }));
        // Hvis brukeren har en pågående tekst-samtale, gi modellen kontekst
        // av de siste meldingene før den begynner å svare på tale.
        if (chatHistory.length) {
          const recent = chatHistory.slice(-8);
          for (const m of recent) {
            ws.send(JSON.stringify({
              type: 'conversation.item.create',
              item: {
                type: 'message',
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: [{ type: m.role === 'assistant' ? 'text' : 'input_text', text: m.content }],
              }
            }));
          }
        }
        ws.send(JSON.stringify({
          type: 'response.create',
          response: {
            modalities: ['audio', 'text'],
            instructions: chatHistory.length
              ? L().voiceFollowup
              : L().voiceOpening
          }
        }));
        setState('listening');
      };

      ws.onmessage = (raw) => handleServerEvent(raw.data);
      ws.onerror = () => showError(L().errVoiceConn);
      ws.onclose = () => {
        teardownAudio();
        if (state !== 'error') {
          isRunning = false;
          setState('idle');
        }
      };

    } catch (err) {
      console.error('[KNE AI] start feilet:', err);
      const msg = err && err.name === 'NotAllowedError'
        ? L().errMicBlocked
        : (err.message || L().errMicGeneric);
      showError(msg);
      endSession();
    }
  }

  function endSession() {
    isRunning = false;
    isMuted = false;
    if (ws) { try { ws.close(); } catch (_) {} ws = null; }
    teardownAudio();
    if (state !== 'error') setState('idle');
    setVoiceUi(false);
  }

  function teardownAudio() {
    try { stopAllAudio(); } catch (_) {}
    try { workletNode && workletNode.disconnect(); } catch (_) {}
    try { silentSink && silentSink.disconnect(); } catch (_) {}
    try { micSource && micSource.disconnect(); } catch (_) {}
    try { micStream && micStream.getTracks().forEach(t => t.stop()); } catch (_) {}
    try { audioContext && audioContext.close(); } catch (_) {}
    try { playbackContext && playbackContext.close(); } catch (_) {}
    workletNode = silentSink = micSource = micStream = null;
    audioContext = playbackContext = null;
  }

  // ── Server events ─────────────────────────────────────────────────────
  let responseActive = false;
  let responseHadAudio = false;
  let responseTranscript = '';
  let responseAppended = false;

  function handleServerEvent(raw) {
    let event;
    try { event = JSON.parse(raw); } catch (_) { return; }

    switch (event.type) {
      case 'response.created':
        responseActive = true;
        responseHadAudio = false;
        responseTranscript = '';
        responseAppended = false;
        break;

      case 'response.output_audio_transcript.delta':
      case 'response.audio_transcript.delta':
      case 'response.output_text.delta':
        if (event.delta) responseTranscript += event.delta;
        break;

      case 'response.output_audio.delta':
      case 'response.audio.delta':
        responseHadAudio = true;
        if (!isMuted) setState('speaking');
        schedulePcm(event.delta);
        break;

      case 'input_audio_buffer.speech_started':
        // Barge-in: bruker snakker — kutt eventuelt avspilt audio og
        // be serveren avbryte aktivt response.
        try { stopAllAudio(); } catch (_) {}
        if (responseActive && ws && ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify({ type: 'response.cancel' }));
          } catch (_) {}
        }
        if (!isMuted && state !== 'error') setState('listening');
        break;

      case 'response.done':
      case 'response.output_audio.done': {
        responseActive = false;
        // Legg AI-transkript til chat-historikken — kun én gang per respons.
        // Begge events kan fyre for samme respons (response.output_audio.done
        // før response.done), så vi guarder med responseAppended-flagget.
        const aiText = (responseTranscript || '').trim();
        if (aiText && !responseAppended) {
          appendChatMsg('ai', aiText);
          chatHistory.push({ role: 'assistant', content: aiText });
          responseAppended = true;
        }
        setTimeout(() => {
          if (state === 'speaking' && !isMuted) setState('listening');
        }, 250);
        break;
      }

      // Brukerens tale-transkripsjon (hvis xAI støtter input_audio_transcription).
      // Kan komme på flere format-navn — vi forsøker alle.
      case 'conversation.item.input_audio_transcription.completed':
      case 'input_audio_buffer.transcription.completed': {
        const userText = (event.transcript || (event.item && event.item.transcript) || '').trim();
        if (userText) {
          appendChatMsg('user', userText);
          chatHistory.push({ role: 'user', content: userText });
        }
        break;
      }

      case 'error':
        showError((event.error && event.error.message) || L().errXaiGeneric);
        break;
    }
  }

  // ── PCM playback ──────────────────────────────────────────────────────
  let activeAudioSources = [];

  function schedulePcm(b64) {
    if (!playbackContext || !b64) return;
    const bytes = base64ToBytes(b64);
    const samples = bytes.length / 2;
    if (!samples) return;
    const f32 = new Float32Array(samples);
    const view = new DataView(bytes.buffer);
    for (let i = 0; i < samples; i++) {
      const s = view.getInt16(i * 2, true);
      f32[i] = s < 0 ? s / 0x8000 : s / 0x7FFF;
    }
    const buf = playbackContext.createBuffer(1, samples, TARGET_SAMPLE_RATE);
    buf.getChannelData(0).set(f32);
    const src = playbackContext.createBufferSource();
    src.buffer = buf;
    src.connect(playbackContext.destination);
    const now = playbackContext.currentTime;
    if (playbackQueueTime < now) playbackQueueTime = now;
    src.start(playbackQueueTime);
    playbackQueueTime += buf.duration;
    activeAudioSources.push(src);
    src.onended = () => {
      activeAudioSources = activeAudioSources.filter(s => s !== src);
    };
  }

  function stopAllAudio() {
    const srcs = activeAudioSources;
    activeAudioSources = [];
    for (const s of srcs) { try { s.stop(0); } catch (_) {} try { s.disconnect(); } catch (_) {} }
    if (playbackContext) playbackQueueTime = playbackContext.currentTime;
  }

  function base64ToBytes(b64) {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }

  // ── AudioWorklet (mic → PCM16 @ 24kHz; base64 happens on main) ────────
  function createWorkletBlobUrl() {
    const code = `
      class KneVaPcmWorklet extends AudioWorkletProcessor {
        constructor(options) {
          super();
          const o = (options && options.processorOptions) || {};
          this.srcRate = o.sourceSampleRate || sampleRate;
          this.dstRate = o.targetSampleRate || 24000;
          this.ratio = this.srcRate / this.dstRate;
          this.sampleCarry = 0;
          this.frameSize = 2400;
          this.out = new Int16Array(this.frameSize);
          this.outIdx = 0;
        }
        process(inputs) {
          const ch = inputs[0] && inputs[0][0];
          if (!ch || ch.length === 0) return true;
          let pos = this.sampleCarry;
          while (pos < ch.length) {
            const i0 = Math.floor(pos);
            const i1 = Math.min(i0 + 1, ch.length - 1);
            const frac = pos - i0;
            const s = ch[i0] * (1 - frac) + ch[i1] * frac;
            const clipped = Math.max(-1, Math.min(1, s));
            this.out[this.outIdx++] = clipped < 0 ? (clipped * 0x8000) | 0 : (clipped * 0x7FFF) | 0;
            if (this.outIdx === this.frameSize) this.flush();
            pos += this.ratio;
          }
          this.sampleCarry = pos - ch.length;
          return true;
        }
        flush() {
          const copy = new Int16Array(this.out.subarray(0, this.outIdx));
          this.port.postMessage(copy.buffer, [copy.buffer]);
          this.outIdx = 0;
        }
      }
      registerProcessor('kne-va-pcm-worklet', KneVaPcmWorklet);
    `;
    return URL.createObjectURL(new Blob([code], { type: 'application/javascript' }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
