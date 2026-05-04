/* ────────────────────────────────────────────────────────────────────────────
   Karlsen & Nordseth — i18n
   Lightweight client-side translation. Snapshots Norwegian source on first
   load, then swaps innerHTML and key attributes when the user picks EN/PL.
   Persists choice in localStorage. Auto-injects flag switcher into .nav-cta.
   ──────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const STORAGE_KEY = 'kne.lang';
  const DEFAULT_LANG = 'no';

  // sessionStorage flag — the demo notice ("Bare noe av innholdet …") shows
  // once per browsing session, the first time someone picks a non-Norwegian
  // flag. Survives page navigations within the same tab; resets when the tab
  // closes, so a fresh visitor on the same browser still sees it.
  const NOTICE_SEEN_KEY = 'kne.lang.demoNoticeShown';
  const NOTICE_TEXT = 'Bare noe av innholdet har blitt oversatt for denne demoen.';

  // Normalize whitespace for dictionary lookup. HTML treats runs of whitespace
  // as a single space anyway, so this lets the dictionary keys be the
  // single-line, single-space form even when the source HTML wraps them.
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

  // ── Element selectors that hold translatable inline content ──
  // The walker only translates an element if it has *no* block-level child —
  // i.e. its content is leaf-ish (only text + inline tags like em/b/span/a/svg).
  const TRANSLATE_SEL =
    'h1,h2,h3,h4,h5,h6,p,li,button,a,label,small,span,div,figcaption,em,b,strong,td,th';

  const BLOCK_TAGS = new Set([
    'DIV','SECTION','ARTICLE','NAV','HEADER','FOOTER','MAIN','UL','OL',
    'TABLE','TBODY','THEAD','TR','FORM','FIELDSET',
    'P','H1','H2','H3','H4','H5','H6','LI','BLOCKQUOTE'
  ]);

  // Skip these elements entirely — they're either dynamic, structural, or
  // shouldn't be touched.
  const SKIP_SEL = 'script,style,noscript,svg,path,rect,circle,line,.lang-switcher,.lang-switcher *,#yr,.orgnr-value,.orgnr-icon';

  // Element has a child that's a block — skip it (we'll translate the
  // descendant leaf-elements instead).
  function hasBlockChild(el) {
    for (const c of el.children) {
      if (BLOCK_TAGS.has(c.tagName)) return true;
    }
    return false;
  }

  // ── Snapshot of the original Norwegian content. Built once on first apply. ──
  let snap = null;

  function takeSnapshot() {
    if (snap) return;
    snap = { els: [], attrs: [], title: document.title || '' };

    // ── First pass: collect every candidate element in document order ──
    const candidates = [];
    document.querySelectorAll(TRANSLATE_SEL).forEach(el => {
      if (el.closest(SKIP_SEL)) return;
      if (hasBlockChild(el)) return;
      const html = el.innerHTML;
      if (!norm(html)) return;
      // Skip pure-numeric/symbolic content (e.g. "→", "01", "—").
      if (/^[\s\d.,:;·—–\-+()/<>%]*$/.test(norm(html.replace(/<[^>]+>/g, '')))) return;
      candidates.push({ el, original: html, key: norm(html), hasCapturedDescendant: false });
    });

    // ── Second pass: classify each candidate ──
    //
    //   wrapper:  has captured descendants AND a dict entry of its own
    //             (e.g. <h1>Med <span>lidenskap</span> …</h1>). The whole
    //             string is one translation unit — the descendant span is
    //             only emphasis. Process the parent; the child translation
    //             is implicitly part of the parent's value.
    //
    //   container: has captured descendants but NO dict entry in any language
    //             (e.g. <li><span class="num">1992</span><span class="lbl">
    //             Etablert i Oslo</span></li>). Each child carries its own
    //             meaning. Skip the parent entirely so it never destructively
    //             resets the children's references — let the children
    //             translate themselves.
    //
    //   leaf:     no captured descendants. Translate normally.
    //
    const candidateSet = new Set(candidates.map(c => c.el));
    const dicts = (window.KNE_I18N && typeof window.KNE_I18N === 'object') ? window.KNE_I18N : {};
    const langKeys = Object.keys(dicts);
    candidates.forEach(c => {
      const desc = c.el.querySelectorAll('*');
      for (let i = 0; i < desc.length; i++) {
        if (candidateSet.has(desc[i])) { c.hasCapturedDescendant = true; break; }
      }
      const hasAnyTranslation = langKeys.some(l => dicts[l] && dicts[l][c.key] != null);
      c.isContainer = c.hasCapturedDescendant && !hasAnyTranslation;
      snap.els.push(c);
    });

    // Attributes: placeholder, aria-label, title, alt
    document.querySelectorAll('[placeholder],[alt],[aria-label],[title]').forEach(el => {
      if (el.closest('.lang-switcher')) return;
      ['placeholder', 'alt', 'aria-label', 'title'].forEach(attr => {
        if (!el.hasAttribute(attr)) return;
        const val = el.getAttribute(attr);
        if (!norm(val)) return;
        snap.attrs.push({ el, attr, original: val, key: norm(val) });
      });
    });
  }

  function applyLang(lang) {
    takeSnapshot();
    const dict = (window.KNE_I18N && window.KNE_I18N[lang]) || {};
    const useOriginal = lang === DEFAULT_LANG;

    snap.els.forEach(item => {
      const hasTranslation = !useOriginal && dict[item.key] != null;
      // Skip pure container branches when there's nothing to write — children
      // handle themselves, and rewriting the branch would detach their
      // captured references mid-flight.
      // Belt-and-braces: even if isContainer was set true at snapshot time
      // (e.g. dict was stale/missing then), if we now have a translation
      // for this exact key, apply it. The container classification is just
      // an optimisation, not a hard veto.
      if (item.isContainer && !hasTranslation) return;
      const target = hasTranslation ? dict[item.key] : item.original;
      if (item.el.innerHTML !== target) item.el.innerHTML = target;
    });

    snap.attrs.forEach(item => {
      const target = useOriginal
        ? item.original
        : (dict[item.key] != null ? dict[item.key] : item.original);
      item.el.setAttribute(item.attr, target);
    });

    // <title>
    const titleKey = norm(snap.title);
    document.title = useOriginal
      ? snap.title
      : (dict[titleKey] != null ? dict[titleKey] : snap.title);

    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-flag').forEach(b => {
      b.classList.toggle('is-active', b.dataset.lang === lang);
      b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false');
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }

    // Notify other modules (e.g. the voice-agent, which builds its UI text
    // dynamically and needs to re-render state labels / system prompts when
    // the user picks a different flag).
    try {
      document.dispatchEvent(new CustomEvent('kne:langchange', { detail: { lang: lang } }));
    } catch (e) { /* old browsers — ignore */ }
  }

  // ── Flag SVGs (simple, accessible, no external assets) ──
  const FLAG_SVG = {
    no:
      '<svg viewBox="0 0 22 16" aria-hidden="true" focusable="false">' +
        '<rect width="22" height="16" fill="#BA0C2F"/>' +
        '<rect y="6" width="22" height="4" fill="#fff"/>' +
        '<rect x="6" width="4" height="16" fill="#fff"/>' +
        '<rect y="7" width="22" height="2" fill="#00205B"/>' +
        '<rect x="7" width="2" height="16" fill="#00205B"/>' +
      '</svg>',
    en:
      '<svg viewBox="0 0 22 16" aria-hidden="true" focusable="false">' +
        '<rect width="22" height="16" fill="#012169"/>' +
        '<path d="M0,0 L22,16 M22,0 L0,16" stroke="#fff" stroke-width="2.4"/>' +
        '<path d="M0,0 L22,16 M22,0 L0,16" stroke="#C8102E" stroke-width="1.2"/>' +
        '<rect x="9" width="4" height="16" fill="#fff"/>' +
        '<rect y="6" width="22" height="4" fill="#fff"/>' +
        '<rect x="10" width="2" height="16" fill="#C8102E"/>' +
        '<rect y="7" width="22" height="2" fill="#C8102E"/>' +
      '</svg>',
    pl:
      '<svg viewBox="0 0 22 16" aria-hidden="true" focusable="false">' +
        '<rect width="22" height="16" fill="#fff"/>' +
        '<rect y="8" width="22" height="8" fill="#DC143C"/>' +
        '<rect width="22" height="16" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1"/>' +
      '</svg>'
  };

  const FLAG_LABELS = {
    no: { name: 'Norsk',   short: 'NO' },
    en: { name: 'English', short: 'EN' },
    pl: { name: 'Polski',  short: 'PL' }
  };

  function buildSwitcher() {
    const navCtas = document.querySelectorAll('.nav-cta');
    if (!navCtas.length) return;

    navCtas.forEach(navCta => {
      if (navCta.querySelector('.lang-switcher')) return;
      const sw = document.createElement('div');
      sw.className = 'lang-switcher';
      sw.setAttribute('role', 'group');
      sw.setAttribute('aria-label', 'Language');
      sw.innerHTML = ['no', 'en', 'pl'].map(code => {
        const meta = FLAG_LABELS[code];
        return (
          '<button type="button" class="lang-flag" data-lang="' + code + '" ' +
            'aria-label="' + meta.name + '" title="' + meta.name + '" aria-pressed="false">' +
            FLAG_SVG[code] +
            '<span class="lang-code">' + meta.short + '</span>' +
          '</button>'
        );
      }).join('');
      // Insert just before the Meny button if present — that's the slot the
      // "Kontakt" button used to occupy, so the centred .nav-links group
      // doesn't get pushed sideways. Falls back to start of .nav-cta.
      const target = navCta.querySelector('.menu-btn') || navCta.firstChild;
      navCta.insertBefore(sw, target);
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('.lang-flag');
      if (!btn) return;
      e.preventDefault();
      const lang = btn.dataset.lang;
      applyLang(lang);
      // Show the demo-disclaimer the first time someone tries a translation
      // (i.e. anything other than NO, which is the original source language).
      if (lang !== DEFAULT_LANG) maybeShowDemoNotice();
    });
  }

  // ── Demo notice ─────────────────────────────────────────────────────────
  // Modal-style box; dismissed via OK button, backdrop click, or Escape.
  function maybeShowDemoNotice() {
    let seen = false;
    try { seen = sessionStorage.getItem(NOTICE_SEEN_KEY) === '1'; } catch (e) {}
    if (seen) return;
    if (document.querySelector('.lang-notice')) return; // already on screen
    showDemoNotice();
    try { sessionStorage.setItem(NOTICE_SEEN_KEY, '1'); } catch (e) {}
  }

  function showDemoNotice() {
    const overlay = document.createElement('div');
    overlay.className = 'lang-notice';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'lang-notice-msg');

    const card = document.createElement('div');
    card.className = 'lang-notice__card';
    card.setAttribute('role', 'document');

    const msg = document.createElement('p');
    msg.id = 'lang-notice-msg';
    msg.className = 'lang-notice__msg';
    msg.textContent = NOTICE_TEXT;

    const ok = document.createElement('button');
    ok.type = 'button';
    ok.className = 'lang-notice__close';
    ok.textContent = 'OK';

    card.appendChild(msg);
    card.appendChild(ok);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Force a frame so the entry transition kicks in.
    requestAnimationFrame(() => overlay.classList.add('is-open'));

    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); dismiss(); }
    };
    function dismiss() {
      overlay.classList.remove('is-open');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => overlay.remove(), 200);
    }
    ok.addEventListener('click', dismiss);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) dismiss(); });
    document.addEventListener('keydown', onKey);

    // Move focus to OK so keyboard users can dismiss with Enter/Space.
    setTimeout(() => ok.focus(), 50);
  }

  function init() {
    buildSwitcher();
    let saved = DEFAULT_LANG;
    try { saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG; } catch (e) {}
    applyLang(saved);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
