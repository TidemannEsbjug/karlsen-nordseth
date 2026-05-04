/* ── Shared site interactions for project detail + standalone pages ── */
(function(){
 'use strict';

 /* ── Block native drag on header/menu/buttons (covers Firefox, which
       ignores -webkit-user-drag CSS) ─────────────────────────────────── */
 const NO_DRAG_SEL = [
   '.site-header', '.site-header *',
   '.nav', '.nav *',
   '.nav-links a', '.nav-links button',
   '.nav-cta a', '.nav-cta button',
   '.brand', '.brand *',
   '.brand-logo', '.brandlogo img',
   '.menu-btn',
   '.btn', 'a.btn', 'button',
   '.chip', '.filter-chip', '.smart-chip',
   '.lang-switcher', '.lang-switcher *',
   '.lang-flag'
 ].join(',');

 // Set the HTML attribute on existing menu/button elements up-front
 const markUndraggable = (root) => {
   (root || document).querySelectorAll(NO_DRAG_SEL).forEach(el => {
     el.setAttribute('draggable', 'false');
   });
 };
 markUndraggable();

 // Final safety net: cancel any drag started inside header/nav/buttons
 document.addEventListener('dragstart', (e) => {
   const t = e.target;
   if (t && t.closest && t.closest(NO_DRAG_SEL)) {
     e.preventDefault();
   }
 }, true);

 // Year stamp in footer (if present)
 const yr = document.getElementById('yr');
 if (yr) yr.textContent = new Date().getFullYear();

 // Header theme: light past the hero, dark over it
 const hdr = document.getElementById('siteHeader');
 const hero = document.querySelector('.proj-hero, .page-hero');
 if (hdr && hero){
   const onScroll = () => {
     const y = window.scrollY;
     const heroBottom = hero.offsetTop + hero.offsetHeight - 80;
     hdr.classList.toggle('is-light', y > heroBottom);
     hdr.classList.toggle('is-pinned', y > 8);
   };
   onScroll();
   window.addEventListener('scroll', onScroll, {passive:true});
   window.addEventListener('resize', onScroll);
 }

 // Reveal-on-scroll
 const io = new IntersectionObserver((entries) => {
   for (const e of entries){
     if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
   }
 }, { rootMargin:'0px 0px -8% 0px', threshold:0.06 });
 document.querySelectorAll('.reveal').forEach(el => io.observe(el));

 // Chapter videos — autoplay when in view, pause when off-screen
 const chapterVideos = document.querySelectorAll('.ch-img video, .ch-feature video');
 if (chapterVideos.length){
   const vio = new IntersectionObserver((entries) => {
     for (const e of entries){
       const v = e.target;
       if (e.isIntersecting){ v.play().catch(()=>{}); } else { v.pause(); }
     }
   }, { rootMargin:'0px 0px -10% 0px', threshold:0.25 });
   chapterVideos.forEach(v => vio.observe(v));
 }
})();
