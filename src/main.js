import '@fontsource/lilita-one/400.css';
import '@fontsource/pacifico/400.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/baloo-bhaijaan-2/arabic-500.css';
import '@fontsource/baloo-bhaijaan-2/arabic-700.css';
import './styles.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { I18N, ORDER_URL, BRANCHES, MENU } from './data.js';
import { initAssembly } from './burger.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- language ---------------- */
let lang = 'en';
try { lang = localStorage.getItem('grip-lang') || 'en'; } catch { /* storage unavailable */ }
if (!I18N[lang]) lang = 'en';
const getLang = () => lang;
const t = (k) => I18N[lang][k] ?? I18N.en[k] ?? '';

let assembly;
let menuCat = MENU[0].id;

function applyLang() {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === 'ar' ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach((el) => { const v = t(el.dataset.i18n); if (v) el.textContent = v; });
  $$('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  $$('.js-order').forEach((a) => { a.href = ORDER_URL[lang]; });
  renderMarquee();
  renderMenu();
  renderBranches();
  assembly?.relang?.();
  ScrollTrigger.refresh();
}

/* ---------------- marquee ---------------- */
function renderMarquee() {
  const word = t('marquee');
  const chef = (n) => `<img class="mq-chef" src="/brand/character-chef-${n}.png" alt="" width="780" height="543" />`;
  const chunk = Array.from({ length: 6 }, () => `<span>${word}</span>${chef('curled')}<span class="o">GRIP</span>${chef('flex')}`).join('');
  $('.marquee-track').innerHTML = chunk + chunk;
}

/* ---------------- menu ---------------- */
function renderMenu() {
  const tabs = $('#menuTabs');
  tabs.innerHTML = MENU.map((c) => `<button type="button" role="tab" id="tab-${c.id}" aria-selected="${c.id === menuCat}" aria-controls="menuList" data-cat="${c.id}">${c.label[lang]}</button>`).join('');
  const cat = MENU.find((c) => c.id === menuCat);
  const list = $('#menuList');
  list.setAttribute('aria-labelledby', `tab-${cat.id}`);
  list.innerHTML = cat.items.map((it) => `
    <li class="item">
      <div class="item-top">
        <h3>${it.name}${cat.id === 'new' ? `<em>${t('menu.new')}</em>` : ''}</h3>
        <span class="item-price"><small>OMR</small> ${it.price}</span>
      </div>
      ${it.ing ? `<p>${it.ing[lang]}</p>` : ''}
    </li>`).join('');
}

$('#menuTabs').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-cat]');
  if (!b || b.dataset.cat === menuCat) return;
  menuCat = b.dataset.cat;
  renderMenu();
  if (!reduce) gsap.from('#menuList .item', { y: 24, autoAlpha: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' });
  ScrollTrigger.refresh();
});

/* ---------------- branches ---------------- */
function renderBranches() {
  $('#branches').innerHTML = BRANCHES.map((b, i) => `
    <article class="branch" data-reveal>
      <img class="branch-chef wob" src="/brand/character-chef-${i % 2 ? 'burger-box' : 'curled'}.png" alt="" width="735" height="745" loading="lazy" />
      <h3>${b.name}</h3>
      <p class="branch-city">${t('loc.city')}</p>
      <a class="branch-tel" href="tel:${b.tel}" dir="ltr">${b.phone}</a>
      <div class="branch-cta">
        <a class="btn btn-cream" href="${b.maps}" target="_blank" rel="noopener">${t('cta.directions')}</a>
        <a class="btn btn-ghost" href="tel:${b.tel}">${t('cta.call')}</a>
        <a class="btn btn-ghost" href="${ORDER_URL[lang]}" target="_blank" rel="noopener">${t('cta.orderOnline')}</a>
      </div>
    </article>`).join('');
  $('#footBranches').innerHTML = `<h3>${t('foot.branches')}</h3>` + BRANCHES.map((b) =>
    `<p><strong>${b.name}</strong><a href="tel:${b.tel}" dir="ltr">${b.phone}</a></p>`).join('');
  if (!reduce) revealAll();
}

/* ---------------- smooth scroll ---------------- */
let lenis;
if (!reduce) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function goTo(hash) {
  const target = $(hash);
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
  else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute('href') === '#') return;
  e.preventDefault();
  closeDrawer();
  const h = a.getAttribute('href');
  goTo(h);
  history.replaceState(null, '', h);
});

/* ---------------- drawer ---------------- */
const drawer = $('#drawer');
const burgerBtn = $('#burgerBtn');
function openDrawer() {
  drawer.hidden = false;
  document.body.classList.add('lock');
  burgerBtn.setAttribute('aria-expanded', 'true');
  lenis?.stop();
}
function closeDrawer() {
  if (drawer.hidden) return;
  drawer.hidden = true;
  document.body.classList.remove('lock');
  burgerBtn.setAttribute('aria-expanded', 'false');
  lenis?.start();
}
burgerBtn.addEventListener('click', () => (drawer.hidden ? openDrawer() : closeDrawer()));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

$('#langBtn').addEventListener('click', () => {
  lang = lang === 'en' ? 'ar' : 'en';
  try { localStorage.setItem('grip-lang', lang); } catch { /* ignore */ }
  applyLang();
});

/* ---------------- hero assembly (created first so later triggers account for its pin spacing) ---------------- */
assembly = initAssembly({ getLang });

/* ---------------- nav state ---------------- */
const nav = $('#nav');
ScrollTrigger.create({
  start: 40,
  onUpdate: (self) => nav.classList.toggle('is-scrolled', self.scroll() > 40),
});
const linkMap = new Map($$('.nav-links a').map((a) => [a.getAttribute('href'), a]));
['#story', '#smash', '#menu', '#locations'].forEach((id) => {
  ScrollTrigger.create({
    trigger: id,
    start: 'top 55%',
    end: 'bottom 55%',
    onToggle: (self) => linkMap.get(id)?.classList.toggle('active', self.isActive),
  });
});

/* ---------------- reveals + parallax ---------------- */
function revealAll() {
  $$('[data-reveal]:not(.is-bound)').forEach((el) => {
    el.classList.add('is-bound');
    gsap.from(el, {
      y: 48, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}

if (!reduce) {
  $$('[data-parallax]').forEach((el) => {
    const amt = parseFloat(el.dataset.parallax);
    gsap.fromTo(el, { yPercent: -amt * 100 }, {
      yPercent: amt * 100, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // photo reveal: frame opens from an inset card to full-bleed while the photo settles
  gsap.fromTo('.shot-frame', { clipPath: 'inset(14% 7% round 36px)' }, { clipPath: 'inset(0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.shot', start: 'top 85%', end: 'top 10%', scrub: true } });
  gsap.fromTo('.shot-frame picture img', { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.shot', start: 'top 85%', end: 'bottom top', scrub: true } });
  gsap.from('.shot-line > span', { yPercent: 115, duration: 0.9, stagger: 0.14, ease: 'power4.out', scrollTrigger: { trigger: '.shot-text', start: 'top 92%', once: true } });

  // characters: peek up / pop in as their sections arrive
  gsap.fromTo('.shot-chef', { yPercent: 70, rotation: 8 }, { yPercent: 0, rotation: 0, ease: 'power3.out', scrollTrigger: { trigger: '.shot', start: 'top 40%', end: 'top -10%', scrub: true } });
  gsap.from('.story-chef', { scale: 0.3, rotation: 18, autoAlpha: 0, duration: 1, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.story-photo', start: 'top 60%', once: true } });
  gsap.from('.menu-chef', { yPercent: 40, rotation: -10, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.menu-foot', start: 'top 90%', once: true } });
  gsap.from('.order-chef', { scale: 0.4, rotation: -20, autoAlpha: 0, duration: 1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.order', start: 'top 60%', once: true } });
  gsap.fromTo('.foot-chef', { yPercent: 55 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top 100%', end: 'top 70%', scrub: true } });

  // story sticker
  gsap.from('.story-photo .sticker', { scale: 0.4, rotation: -40, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.story-photo', start: 'top 70%', once: true } });
  gsap.from('.smash-h span', { yPercent: 110, duration: 0.9, stagger: 0.12, ease: 'power4.out', scrollTrigger: { trigger: '.smash-h', start: 'top 80%', once: true } });
  gsap.from('.order-art', { rotation: -8, scale: 0.9, ease: 'none', scrollTrigger: { trigger: '.order', start: 'top bottom', end: 'center center', scrub: true } });
}

/* ---------------- hero text entrance (short; never blocks ordering) ---------------- */
function heroIntro() {
  if (reduce) return;
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('.hero-title .line > span', { yPercent: 115, duration: 0.9, stagger: 0.12 }, 0.05)
    .from('.asm .kicker, .hero-sub', { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.3)
    .from('.hero-cta .btn', { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 0.55)
    .from('.hero-badge', { scale: 0, duration: 0.9, ease: 'back.out(1.8)' }, 0.7)
    .from('.hero-giant', { opacity: 0, duration: 1.2 }, 0);
}

/* ---------------- init ---------------- */
applyLang();
heroIntro();
window.addEventListener('load', () => ScrollTrigger.refresh());
