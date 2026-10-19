import { $, $$, gsap, ScrollTrigger, reduce, getLang, t, onLang, applyLang, initCore, revealAll, renderMarquee } from './core.js';
import { MENU, BRANCHES, LEADERS, ORDER_URL } from './data.js';
import { initAssembly } from './burger.js';

initCore('home');
let lang = getLang();
// hero pin must be created before any other ScrollTrigger so later triggers account for its spacing
const assembly = initAssembly({ getLang });
let menuCat = MENU[0].id;

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
  revealAll();
}

/* ---------------- /* ---------------- nav state (home anchors) ---------------- */
let activeKey = '';
const markActive = () => $$('.nav-links a[data-nav]').forEach((a) => {
  const on = a.dataset.nav === activeKey && ['story', 'locations'].includes(activeKey);
  a.classList.toggle('active', on);
});
[['#story', 'story'], ['#locations', 'locations']].forEach(([id, key]) => {
  ScrollTrigger.create({
    trigger: id,
    start: 'top 55%',
    end: 'bottom 55%',
    onToggle: (self) => { if (self.isActive) activeKey = key; else if (activeKey === key) activeKey = ''; markActive(); },
  });
});
onLang(markActive);

/* ---------------- leadership teaser ---------------- */
function renderTeam() {
  $('#teamRow').innerHTML = LEADERS.map((p, i) => `
    <li class="team-card" data-reveal>
      <a href="/leadership/" aria-label="${p.name[lang]}">
        <span class="team-photo"><img src="/img/team/${p.img}.webp" alt="" width="640" height="${[992, 935, 943, 887][i]}" loading="lazy" /></span>
        <span class="team-name">${p.name[lang]}</span>
      </a>
    </li>`).join('');
  revealAll();
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

/* ---------------- language hook + init ---------------- */
onLang((l) => {
  lang = l;
  renderMenu();
  renderBranches();
  renderTeam();
  assembly?.relang?.();
});
applyLang();
heroIntro();
