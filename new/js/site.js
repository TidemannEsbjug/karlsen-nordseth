/* Karlsen & Nordseth – ny forside
   Intro, scroll-drevet hero, låst prosjektfortelling, løpende materialbånd,
   ord som fylles inn, lat lasting av video og myk scroll (Lenis, valgfri). */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

  const root = document.documentElement;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mqDesktop = matchMedia('(min-width: 900px)');
  const mqStackedServices = matchMedia('(min-width: 900px) and (min-height: 600px)');
  const mqFinePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = mqReduce.matches;

  let vw = root.clientWidth;
  let vh = innerHeight;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (_) { /* privat modus */ } },
  };

  /* ------------------------------------------------------------------
     Bevegelse: brukeren kan stoppe all video og alt som går av seg selv
     (WCAG 2.2.2). Redusert bevegelse i OS-et gir pause som standard.
     ------------------------------------------------------------------ */
  const saved = store.get('kne-motion');
  let paused = saved ? saved === 'paused' : reduce;

  const videos = $$('video[data-src]:not([data-story])');
  const storyVideos = $$('video[data-story]');
  const playSafe = (v) => {
    if (!v.src) v.src = v.dataset.src;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  };

  /* Hero: mindre fil på smale skjermer */
  const heroVideo = $('#heroVideo');
  if (heroVideo && vw < 760) heroVideo.dataset.src = heroVideo.dataset.srcSmall;

  /* Last inn i god tid, spill bare av når synlig */
  const loadIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const v = e.target;
      if (!v.src) v.src = v.dataset.src;
      loadIO.unobserve(v);
    }
  }, { rootMargin: '120% 0px' });

  const playIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target;
      v._inView = e.isIntersecting;
      if (e.isIntersecting && !paused) playSafe(v);
      else v.pause();
    }
  }, { threshold: 0.08 });

  videos.forEach((v) => {
    v.muted = true;
    loadIO.observe(v);
    playIO.observe(v);
  });
  storyVideos.forEach((v) => { v.muted = true; });

  const motionButtons = $$('[data-motion-toggle]');
  function applyMotion() {
    root.classList.toggle('motion-paused', paused);
    motionButtons.forEach((b) => {
      b.setAttribute('aria-pressed', String(paused));
      const label = b.querySelector('[data-label]');
      if (label) label.textContent = paused ? 'Spill av' : 'Pause';
    });
    videos.forEach((v) => {
      if (paused) v.pause();
      else if (v._inView) playSafe(v);
    });
    syncStoryVideos();
    setCycler();
    startMarquee();
  }
  motionButtons.forEach((b) => b.addEventListener('click', () => {
    paused = !paused;
    store.set('kne-motion', paused ? 'paused' : 'playing');
    applyMotion();
  }));

  /* ------------------------------------------------------------------
     Myk scroll. Siden virker likt uten (filen er valgfri), og den slås
     av ved redusert bevegelse. Berøring bruker alltid vanlig scroll.
     ------------------------------------------------------------------ */
  let lenis = null;
  if (!reduce && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', schedule);
    const tick = (t) => { lenis.raf(t); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------
     Intro → hero-kortet vokser ut av en tynn linje
     ------------------------------------------------------------------ */
  const introEl = $('#introLoad');
  const introSeen = root.classList.contains('intro-seen');
  let introK = reduce ? 1 : 0;
  let introStarted = reduce;

  function startEntrance(duration) {
    if (introStarted) return;
    introStarted = true;
    try { sessionStorage.setItem('kne-intro', '1'); } catch (_) { /* ok */ }
    const t0 = performance.now();
    const step = (now) => {
      introK = clamp((now - t0) / duration, 0, 1);
      heroFrame();
      if (introK < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  if (!reduce) {
    if (introSeen || !introEl) {
      startEntrance(900);
    } else {
      // Kortet starter når teppet begynner å gå opp (CSS-animasjonen «ilOut»)
      introEl.addEventListener('animationstart', (e) => {
        if (e.animationName === 'ilOut') startEntrance(1150);
      });
      setTimeout(() => startEntrance(1150), Math.max(0, 1500 - performance.now()));
      // Klikk, tast eller scroll hopper over introen
      const skip = () => {
        introEl.classList.add('is-skipped');
        startEntrance(800);
        ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((t) => removeEventListener(t, skip));
      };
      ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach((t) => addEventListener(t, skip, { passive: true }));
    }
  }

  /* ------------------------------------------------------------------
     Hero: kortet åpner seg til full flate mens man scroller
     ------------------------------------------------------------------ */
  const hero = $('#hero');
  const heroSticky = $('#heroSticky');
  const heroMedia = $('#heroMedia');
  const heroZoom = $('#heroZoom');
  const heroShade = $('#heroShade');
  const heroTag = $('#heroTag');
  const heroTitle = $('#heroTitle');
  const heroCap = $('#heroCap');

  let geo = { cy: 0, cw: 0, ch: 0, W: 0, H: 0 };
  let heroTopInset = 0;

  function measureHero() {
    const H = heroSticky.clientHeight;
    const W = vw;
    const topSpace = mqDesktop.matches ? 96 : 80;
    const bottomEdge = Math.min(heroTag.offsetTop, heroCap.offsetTop);
    const avail = Math.max(160, bottomEdge - 24 - topSpace);
    let cw, ch;
    if (H > W * 1.05) {           // stående skjerm
      cw = W * 0.8;
      ch = Math.min(cw * 1.25, avail);
    } else {                      // liggende skjerm
      ch = Math.min(avail, (W * 0.46) / 1.6);
      cw = ch * 1.6;
    }
    geo = { cy: topSpace + avail / 2, cw, ch, W, H };
  }

  function heroFrame() {
    const r = hero.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    const travel = geo.H * 0.9;
    const p = reduce ? 1 : clamp(-r.top / travel, 0, 1);
    const e = easeInOut(p);
    const k = 1 - e;
    const ie = easeOutExpo(introK);

    // Kortets størrelse under introen: fra tynn linje til ferdig kort
    const cw = geo.cw * (0.55 + 0.45 * ie);
    const ch = geo.ch * (0.012 + 0.988 * ie);
    const t = (geo.cy - ch / 2) * k;
    const b = (geo.H - (geo.cy + ch / 2)) * k;
    const l = ((geo.W - cw) / 2) * k;
    heroTopInset = t;

    heroMedia.style.clipPath =
      `inset(${t.toFixed(1)}px ${l.toFixed(1)}px ${b.toFixed(1)}px ${l.toFixed(1)}px round ${(8 * k).toFixed(1)}px)`;
    heroZoom.style.transform = `scale(${(1 + 0.12 * k + 0.22 * (1 - ie)).toFixed(4)})`;

    const textIn = clamp((introK - 0.5) / 0.5, 0, 1);
    const out = (1 - clamp(e / 0.28, 0, 1)) * textIn;  // tekst på papir
    const inn = clamp((e - 0.78) / 0.22, 0, 1);         // tekst på film
    heroTag.style.opacity = out.toFixed(3);
    heroTag.style.transform = `translateY(${(-14 * clamp(e / 0.28, 0, 1) + 18 * (1 - textIn)).toFixed(1)}px)`;
    heroTag.style.visibility = out < 0.01 ? 'hidden' : '';
    const capO = Math.max(out, inn);
    heroCap.style.opacity = capO.toFixed(3);
    heroCap.style.transform = `translateY(${(18 * (1 - textIn)).toFixed(1)}px)`;
    heroCap.style.visibility = capO < 0.01 ? 'hidden' : '';
    heroTitle.style.opacity = inn.toFixed(3);
    heroTitle.style.transform = `translateY(${(28 * (1 - inn)).toFixed(1)}px)`;
    heroShade.style.opacity = inn.toFixed(3);
    hero.classList.toggle('is-open', e > 0.5);
  }

  /* Bildetekst som følger klippene i hero-filmen (4 klipp à 4 sek) */
  const CAPS = [
    ['Fredrikstad Domkirke', 'Skifertak, tårn og spir i kobber, 2014–2016'],
    ['Historisk Museum', '25 tonn kobber på tak, tårn og takhatter'],
    ['Historisk Museum', 'Takrennene rekonstruert i kobber'],
    ['Historisk Museum', 'Over 40 km fuger krafset og spekket for hånd'],
  ];
  const SEG = 4;
  const capNum = $('#capNum');
  const capTitle = $('#capTitle');
  const capSub = $('#capSub');
  const bars = $$('.cap-bars i');
  let capIdx = 0;
  let capLoopOn = false;

  function syncCaption() {
    const t = heroVideo.currentTime || 0;
    const i = Math.min(CAPS.length - 1, Math.floor(t / SEG));
    if (i !== capIdx) {
      capIdx = i;
      capNum.textContent = String(i + 1).padStart(2, '0');
      capTitle.textContent = CAPS[i][0];
      capSub.textContent = CAPS[i][1];
    }
    const frac = clamp((t - i * SEG) / SEG, 0, 1);
    bars.forEach((b, j) => b.style.setProperty('--p', j < i ? 1 : j > i ? 0 : frac.toFixed(3)));
  }
  function capLoop() {
    syncCaption();
    if (!heroVideo.paused) requestAnimationFrame(capLoop);
    else capLoopOn = false;
  }
  heroVideo.addEventListener('play', () => {
    if (!capLoopOn) { capLoopOn = true; requestAnimationFrame(capLoop); }
  });
  heroVideo.addEventListener('seeked', syncCaption);

  /* ------------------------------------------------------------------
     Header: lys eller mørk etter hva som ligger under den
     ------------------------------------------------------------------ */
  const hdr = $('#hdr');
  const toneEls = $$('[data-tone="media"]');
  let lastTone = '';
  let lastScrolled = null;
  let menuOpen = false;

  function headerFrame() {
    const probe = 34;
    let tone = 'paper';
    const hr = hero.getBoundingClientRect();
    const inHero = hr.top <= 0 && hr.bottom > probe;
    if (inHero && heroTopInset < probe) tone = 'media';
    for (const el of toneEls) {
      const r = el.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) tone = 'media';
    }
    if (menuOpen) tone = 'paper';
    if (tone !== lastTone) { hdr.dataset.tone = tone; lastTone = tone; }
    const scrolled = !inHero && !menuOpen;
    if (scrolled !== lastScrolled) { hdr.classList.toggle('is-scrolled', scrolled); lastScrolled = scrolled; }
  }

  /* ------------------------------------------------------------------
     Mosaikk: kolonnene glir i ulikt tempo
     ------------------------------------------------------------------ */
  const mosaic = $('.mosaic');
  const mcols = $$('.mcol');
  function mosaicFrame() {
    if (reduce) return;
    const r = mosaic.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    const off = r.top + r.height / 2 - vh / 2;
    const f = mqDesktop.matches ? 1 : 0.45;
    for (const c of mcols) {
      c.style.transform = `translate3d(0, ${(off * parseFloat(c.dataset.speed) * f).toFixed(1)}px, 0)`;
    }
  }

  /* ------------------------------------------------------------------
     Materialbånd: går av seg selv, skifter retning med scrollen og
     får fart (og litt helning) når man scroller fort
     ------------------------------------------------------------------ */
  const mqTrack = $('#mqTrack');
  let mqSetW = 0, mqX = 0, mqDir = -1, mqSkew = 0, mqLastY = scrollY, mqLastT = 0;
  let mqInView = false, mqRunning = false;
  if (mqTrack) {
    const set = mqTrack.firstElementChild;
    const clone = set.cloneNode(true);
    clone.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; });
    mqTrack.appendChild(clone);
    new IntersectionObserver((entries) => {
      mqInView = entries[0].isIntersecting;
      startMarquee();
    }).observe(mqTrack);
  }
  function measureMarquee() { if (mqTrack) mqSetW = mqTrack.firstElementChild.offsetWidth; }
  function startMarquee() {
    if (!mqTrack || mqRunning || !mqInView || paused) return;
    mqRunning = true;
    mqLastT = performance.now();
    mqLastY = scrollY;
    requestAnimationFrame(marqueeTick);
  }
  function marqueeTick(now) {
    if (!mqInView || paused) { mqRunning = false; return; }
    const dt = Math.min(0.05, (now - mqLastT) / 1000);
    mqLastT = now;
    const dy = scrollY - mqLastY;
    mqLastY = scrollY;
    if (Math.abs(dy) > 0.5) mqDir = dy > 0 ? -1 : 1;
    const base = vw * 0.045;                         // px per sekund
    mqX += mqDir * (base * dt + Math.min(Math.abs(dy), 120) * 0.55);
    if (!mqSetW) measureMarquee();
    if (mqSetW) {
      while (mqX <= -mqSetW) mqX += mqSetW;
      while (mqX > 0) mqX -= mqSetW;
    }
    mqSkew = lerp(mqSkew, clamp(-dy * 0.12, -7, 7), 0.12);
    mqTrack.style.transform = `translate3d(${mqX.toFixed(1)}px,0,0) skewX(${mqSkew.toFixed(2)}deg)`;
    requestAnimationFrame(marqueeTick);
  }

  /* ------------------------------------------------------------------
     Utsagn som fylles inn ord for ord mens man scroller
     ------------------------------------------------------------------ */
  const scrubs = reduce ? [] : $$('[data-scrub]');
  function splitWords(node) {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); continue; }
          const s = document.createElement('span');
          s.className = 'w';
          s.textContent = part;
          frag.appendChild(s);
        }
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1) {
        splitWords(child);
      }
    }
  }
  scrubs.forEach((el) => {
    splitWords(el);
    el._words = $$('.w', el);
    el._words.forEach((w) => { w._o = -1; });
    el.classList.add('is-split');
  });
  function scrubFrame() {
    for (const el of scrubs) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const f = clamp((vh * 0.92 - r.top) / (vh * 0.5 + r.height * 0.6), 0, 1);
      const n = el._words.length;
      const reveal = f * (n + 3);
      for (let i = 0; i < n; i++) {
        const o = Math.round(clamp(reveal - i, 0, 1) * 20) / 20;
        const w = el._words[i];
        if (w._o !== o) { w._o = o; w.style.opacity = (0.14 + 0.86 * o).toFixed(2); }
      }
    }
  }

  /* ------------------------------------------------------------------
     Fagområder: forrige panel trekker seg tilbake når neste legger seg over
     ------------------------------------------------------------------ */
  const svcs = $$('.svc');
  let svcWasStacked = null;
  function svcFrame() {
    const stacked = mqStackedServices.matches && !reduce;
    if (!stacked) {
      if (svcWasStacked !== false) {
        svcs.forEach((s) => { const n = s.firstElementChild; n.style.transform = ''; n.style.borderRadius = ''; n.style.filter = ''; });
        svcWasStacked = false;
      }
      return;
    }
    svcWasStacked = true;
    for (let i = 0; i < svcs.length - 1; i++) {
      const inner = svcs[i].firstElementChild;
      const nextTop = svcs[i + 1].getBoundingClientRect().top;
      const q = clamp(1 - nextTop / vh, 0, 1);
      if (q <= 0) { inner.style.transform = ''; inner.style.borderRadius = ''; inner.style.filter = ''; continue; }
      inner.style.transform = `scale(${(1 - 0.06 * q).toFixed(4)})`;
      inner.style.borderRadius = `${(14 * q).toFixed(1)}px`;
      inner.style.filter = `brightness(${(1 - 0.08 * q).toFixed(3)})`;
    }
  }

  /* ------------------------------------------------------------------
     Prosjekt i fokus: fem kapitler, film som bytter og tall som teller
     ------------------------------------------------------------------ */
  const story = $('.story');
  const chs = $$('.ch');
  const sms = $$('.sm');
  const counts = chs.map((c) => c.querySelector('.count'));
  const spBars = $$('.sp-bars i');
  const storyNum = $('#storyNum');
  let storyIdx = -1;
  let storyNear = false;

  function syncStoryVideos() {
    storyVideos.forEach((v, i) => {
      const active = i === storyIdx;
      if (storyNear && (active || i === storyIdx + 1 || (storyIdx < 0 && i === 0)) && !v.src) v.src = v.dataset.src;
      if (active && storyNear && !paused) playSafe(v);
      else if (!v.paused) v.pause();
    });
  }
  function setChapter(idx) {
    storyIdx = idx;
    chs.forEach((c, i) => {
      c.classList.toggle('is-on', i === idx);
      c.classList.toggle('is-past', i < idx);
    });
    sms.forEach((m, i) => m.classList.toggle('is-on', i === Math.min(idx, sms.length - 1)));
    storyNum.textContent = String(idx + 1).padStart(2, '0');
    syncStoryVideos();
  }
  function storyFrame() {
    const r = story.getBoundingClientRect();
    if (r.bottom < -vh || r.top > vh * 2) return;
    const total = Math.max(1, r.height - vh);
    const p = clamp(-r.top / total, 0, 1);
    const N = chs.length;
    const x = p * N;
    const idx = Math.min(N - 1, Math.floor(x));
    const local = idx === N - 1 && p >= 1 ? 1 : clamp(x - idx, 0, 1);
    if (idx !== storyIdx) setChapter(idx);
    counts.forEach((c, i) => {
      if (!c) return;
      const to = +c.dataset.to;
      let v = to;
      if (!reduce) {
        if (i > idx) v = 0;
        else if (i === idx) v = to * easeOut(clamp(local / 0.45, 0, 1));
      }
      const txt = String(Math.round(v));
      if (c._t !== txt) { c._t = txt; c.textContent = txt; }
    });
    spBars.forEach((b, i) => b.style.setProperty('--p', i < idx ? 1 : i > idx ? 0 : local.toFixed(3)));
  }
  new IntersectionObserver((entries) => {
    storyNear = entries[0].isIntersecting;
    syncStoryVideos();
  }, { rootMargin: '60% 0px' }).observe(story);

  /* ------------------------------------------------------------------
     Footer: ordmerket fyller bredden, bokstavene reiser seg inn
     ------------------------------------------------------------------ */
  const fm = $('#ftrMark');
  let fmLetters = [];
  let fmAmp = null;
  let fmIn = null;
  if (fm) {
    fmIn = document.createElement('span');
    fmIn.className = 'fm-in';
    while (fm.firstChild) fmIn.appendChild(fm.firstChild);
    fm.appendChild(fmIn);
    $$('.fm-word', fmIn).forEach((w) => {
      const txt = w.textContent;
      w.textContent = '';
      for (const ch of txt) {
        const s = document.createElement('span');
        s.className = 'fm-l';
        s.textContent = ch;
        w.appendChild(s);
      }
    });
    fmLetters = $$('.fm-l', fmIn);
    fmAmp = $('.fm-amp', fmIn);
  }
  function fitMark() {
    if (!fm) return;
    fm.style.fontSize = '100px';
    const cs = getComputedStyle(fm);
    const avail = fm.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const w = fmIn.getBoundingClientRect().width;
    if (w > 0) fm.style.fontSize = `${Math.floor((100 * avail) / w * 0.995)}px`;
  }
  function footerFrame() {
    if (!fm || reduce) return;
    const r = fm.getBoundingClientRect();
    if (r.top > vh + 50 || r.bottom < -50) return;
    // 0 når merket dukker opp nederst, 1 når det står helt inne (sidens bunn)
    const q = clamp((vh - r.top) / r.height, 0, 1);
    const L = fmLetters.length;
    fmLetters.forEach((l, i) => {
      const t = easeOut(clamp(q * 1.7 - (i / L) * 0.7, 0, 1));
      l.style.transform = `translate3d(0, ${((1 - t) * 105).toFixed(1)}%, 0)`;
    });
    const a = easeOut(clamp(q * 1.4 - 0.3, 0, 1));
    fmAmp.style.transform = `rotate(${(-38 * (1 - a)).toFixed(1)}deg) scale(${(0.35 + 0.65 * a).toFixed(3)})`;
    fmAmp.style.opacity = a.toFixed(3);
  }

  /* ------------------------------------------------------------------
     Én rAF-løkke for alt som følger scroll
     ------------------------------------------------------------------ */
  let ticking = false;
  function frame() {
    ticking = false;
    heroFrame();
    headerFrame();
    mosaicFrame();
    scrubFrame();
    svcFrame();
    storyFrame();
    footerFrame();
  }
  function schedule() {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }
  addEventListener('scroll', schedule, { passive: true });
  let lastW = vw;
  addEventListener('resize', () => {
    vw = root.clientWidth;
    vh = innerHeight;
    // Mobil: adresselinjen endrer høyden ved scroll – mål bare om bredden endres
    if (vw !== lastW || mqDesktop.matches) {
      lastW = vw;
      measureHero();
      fitMark();
      measureMarquee();
    }
    schedule();
  });

  /* ------------------------------------------------------------------
     Meny
     ------------------------------------------------------------------ */
  const menuBtn = $('#menuBtn');
  const menu = $('#menu');
  const main = $('#main');
  const ftr = $('#ftr');
  let menuTimer = 0;

  function setMenu(open) {
    menuOpen = open;
    clearTimeout(menuTimer);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('[data-label]').textContent = open ? 'Lukk' : 'Meny';
    document.body.classList.toggle('no-scroll', open);
    main.inert = open;
    ftr.inert = open;
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => {
        menu.classList.add('is-open');
        const first = menu.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      });
    } else {
      menu.classList.remove('is-open');
      menuTimer = setTimeout(() => { if (!menuOpen) menu.hidden = true; }, 400);
    }
    schedule();
  }
  menuBtn.addEventListener('click', () => setMenu(!menuOpen));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus(); }
  });

  /* Lenker til ankre på siden: myk scroll, og fokus flyttes for tastaturbrukere */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('skip')) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    requestAnimationFrame(() => {
      if (lenis) lenis.scrollTo(target, { duration: 1.4 });
      else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ------------------------------------------------------------------
     Prosjektliste: filter og forhåndsvisning som følger musepekeren
     ------------------------------------------------------------------ */
  const filterBtns = $$('.work-filter button');
  const workItems = $$('#workList > li');
  filterBtns.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.filter;
    filterBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    workItems.forEach((li) => { li.hidden = f !== 'alle' && li.dataset.cat !== f; });
    schedule();
  }));

  const workList = $('#workList');
  const pv = $('#workPreview');
  const pvImg = pv.querySelector('img');
  if (mqFinePointer.matches && !reduce) {
    let px = 0, py = 0, tx = 0, ty = 0, on = false, raf = 0, primed = false;
    const step = () => {
      px = lerp(px, tx, 0.16);
      py = lerp(py, ty, 0.16);
      const tilt = clamp((tx - px) * 0.04, -5, 5);
      const x = clamp(px + 36, 12, vw - pv.offsetWidth - 12);
      const y = clamp(py - pv.offsetHeight / 2, 12, vh - pv.offsetHeight - 12);
      pv.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      if (on || Math.abs(tx - px) + Math.abs(ty - py) > 0.5) raf = requestAnimationFrame(step);
      else raf = 0;
    };
    const show = (e) => {
      const a = e.target.closest('a[data-img]');
      if (!a) return;
      if (pvImg.getAttribute('src') !== a.dataset.img) pvImg.src = a.dataset.img;
      if (!on) { on = true; pv.classList.add('is-on'); }
      if (!raf) raf = requestAnimationFrame(step);
    };
    const hidePreview = () => {
      on = false; primed = false;
      pv.classList.remove('is-on');
    };
    workList.addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!primed) { px = tx; py = ty; primed = true; }
      show(e);
    });
    workList.addEventListener('pointerover', show);
    workList.addEventListener('pointerleave', hidePreview);
    // Lista kan scrolle bort under en stillestående peker – skjul, og vis igjen ved neste bevegelse
    addEventListener('scroll', () => { if (on) hidePreview(); }, { passive: true });
    // Varm opp bildene når lista nærmer seg, så første hover ikke blinker
    new IntersectionObserver((entries, io) => {
      if (!entries[0].isIntersecting) return;
      workItems.forEach((li) => { const img = new Image(); img.src = li.firstElementChild.dataset.img; });
      io.disconnect();
    }, { rootMargin: '60% 0px' }).observe(workList);
  }

  /* ------------------------------------------------------------------
     Kontakt: knappen trekkes mot pekeren
     ------------------------------------------------------------------ */
  const orb = $('.orb');
  if (orb && mqFinePointer.matches && !reduce) {
    const orbIn = $('.orb-in', orb);
    const zone = $('.contact');
    zone.addEventListener('pointermove', (e) => {
      const r = orb.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const reach = r.width * 1.3;
      if (Math.hypot(dx, dy) < reach) {
        orb.style.transform = `translate(${(dx * 0.3).toFixed(1)}px, ${(dy * 0.3).toFixed(1)}px)`;
        orbIn.style.transform = `translate(${(dx * 0.14).toFixed(1)}px, ${(dy * 0.14).toFixed(1)}px)`;
      } else {
        orb.style.transform = '';
        orbIn.style.transform = '';
      }
    });
    zone.addEventListener('pointerleave', () => { orb.style.transform = ''; orbIn.style.transform = ''; });
  }

  /* ------------------------------------------------------------------
     Oppdragsgivere: navnene bytter seg av
     ------------------------------------------------------------------ */
  const names = $$('#clientNames li');
  let ci = 0;
  let cTimer = 0;
  let clientsInView = false;
  function nextClient() {
    const prev = names[ci];
    prev.classList.remove('is-on');
    prev.classList.add('is-out');
    setTimeout(() => prev.classList.remove('is-out'), 950);
    ci = (ci + 1) % names.length;
    names[ci].classList.add('is-on');
  }
  function setCycler() {
    clearInterval(cTimer);
    if (clientsInView && !paused && names.length > 1) cTimer = setInterval(nextClient, 2200);
  }
  new IntersectionObserver((entries) => {
    clientsInView = entries[0].isIntersecting;
    setCycler();
  }, { threshold: 0.2 }).observe($('#clientsMedia'));

  /* ------------------------------------------------------------------
     Inn-animasjoner
     ------------------------------------------------------------------ */
  const rvIO = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('in'); rvIO.unobserve(e.target); }
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.rv, .blur-in, .unmask').forEach((el) => rvIO.observe(el));

  /* ------------------------------------------------------------------
     Start
     ------------------------------------------------------------------ */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  measureHero();
  fitMark();
  applyMotion();
  frame();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { measureHero(); fitMark(); measureMarquee(); schedule(); });
  }
  addEventListener('load', () => { measureMarquee(); fitMark(); });
})();
