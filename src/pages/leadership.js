import '../pages.css';
import { $, $$, gsap, ScrollTrigger, reduce, getLang, onLang, applyLang, initCore, revealAll } from '../core.js';
import { LEADERS } from '../data.js';

initCore('leadership');

const DIMS = { salim: 992, sahal: 935, mohammed: 943, mubarak: 887 };

function renderLeaders() {
  const lang = getLang();
  $('#leadRow').innerHTML = LEADERS.map((p, i) => `
    <li class="lead-card">
      <span class="lead-name"><span>${p.name[lang]}</span></span>
      <span class="lead-photo-wrap"><img src="/img/team/${p.img}.webp" alt="${p.name[lang]}" width="640" height="${DIMS[p.img]}" ${i < 2 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" /></span>
    </li>`).join('');
  if (!reduce) {
    gsap.from('.lead-card', { yPercent: 14, autoAlpha: 0, duration: 1, stagger: 0.12, ease: 'power3.out', delay: 0.35 });
    gsap.from('.lead-name', { y: 16, autoAlpha: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out', delay: 0.9 });
  }
  revealAll();
}

if (!reduce) {
  gsap.from('.page-title .line > span', { yPercent: 115, duration: 0.9, stagger: 0.12, ease: 'power4.out', delay: 0.2 });
  gsap.from('.lead-title .kicker', { y: 18, autoAlpha: 0, duration: 0.7, delay: 0.15 });
  gsap.from('.lead-chef', { yPercent: 60, rotation: 10, autoAlpha: 0, duration: 1, ease: 'back.out(1.4)', delay: 0.8 });
  gsap.to('.lead-hero .hero-giant', { yPercent: 16, ease: 'none', scrollTrigger: { trigger: '.lead-hero', start: 'top top', end: 'bottom top', scrub: true } });
  // portraits drift at slightly different speeds as you leave the hero
  gsap.from('.lead-story .sticker', { scale: 0.4, rotation: -40, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.lead-photo', start: 'top 70%', once: true } });
  gsap.from('.order-chef', { scale: 0.4, rotation: -20, autoAlpha: 0, duration: 1, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.order', start: 'top 60%', once: true } });
  gsap.from('.order-art', { rotation: -8, scale: 0.9, ease: 'none', scrollTrigger: { trigger: '.order', start: 'top bottom', end: 'center center', scrub: true } });
  $$('[data-parallax]').forEach((el) => {
    const amt = parseFloat(el.dataset.parallax);
    gsap.fromTo(el, { yPercent: -amt * 100 }, { yPercent: amt * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

onLang(() => {
  renderLeaders();
});
applyLang();

if (!reduce) {
  [0.06, 0.12, 0.04, 0.1].forEach((amt, i) => {
    const cards = $$('.lead-card');
    if (cards[i]) gsap.to(cards[i].querySelector('.lead-photo-wrap'), { yPercent: amt * 100, ease: 'none', scrollTrigger: { trigger: '.lead-hero', start: 'top top', end: 'bottom top', scrub: true } });
  });
}
