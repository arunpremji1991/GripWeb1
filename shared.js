/* Shared behaviour for sub-pages: loader, tab title, menu overlay, smooth scroll, reveals, footer. */
(function(){
  var body=document.body,loader=document.getElementById('loader'),bar=document.getElementById('bar'),ltxt=document.getElementById('ltxt');
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var hasG=!!(window.gsap&&window.ScrollTrigger);
  var G=window.GRIP=window.GRIP||{};
  G.hasG=hasG;

  /* loader */
  var lines=G.loaderLines||['Heating the griddle...','Smashing the patty...','Melting the cheese...','Toasting the bun...'],li=0,prog=0;
  var t1=setInterval(function(){li=(li+1)%lines.length;ltxt.textContent=lines[li];},520);
  var t2=setInterval(function(){prog=Math.min(prog+Math.random()*18,92);bar.style.width=prog+'%';},160);
  var minWait=new Promise(function(r){setTimeout(r,1500)});
  var loaded=new Promise(function(r){if(document.readyState==='complete')r();else addEventListener('load',r);});
  Promise.all([minWait,loaded]).then(function(){
    clearInterval(t1);clearInterval(t2);bar.style.width='100%';
    setTimeout(function(){
      if(hasG&&!reduce){
        gsap.to(loader,{yPercent:-100,duration:1,ease:'power4.inOut',onComplete:function(){loader.style.display='none';}});
        setTimeout(function(){if(G.intro)G.intro();},450);
      }else{loader.style.display='none';if(G.intro)G.intro();}
      body.classList.remove('lock');
    },300);
  });

  /* tab title */
  var base=G.titles||['GRIP | Smashing','GRIP | Sizzling','GRIP | Flipping','GRIP | Serving'],ti=0;
  setInterval(function(){if(document.hidden)return;ti=(ti+1)%base.length;document.title=base[ti];},2500);
  document.addEventListener('visibilitychange',function(){if(document.hidden)document.title='GRIP | Your burger is waiting';});

  /* menu overlay */
  var mbtn=document.getElementById('mbtn'),menu=document.getElementById('menu'),nav=document.getElementById('nav');
  function setMenu(o){menu.classList.toggle('open',o);nav.classList.toggle('mopen',o);mbtn.setAttribute('aria-expanded',o);menu.setAttribute('aria-hidden',!o);if(window.lenis){o?lenis.stop():lenis.start();}else body.classList.toggle('lock',o);}
  mbtn.addEventListener('click',function(){setMenu(!menu.classList.contains('open'));});
  menu.addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false);});
  addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false);});

  /* same-page anchors */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=a.getAttribute('href');var t=id==='#top'?0:document.querySelector(id);
      if(t===null)return;e.preventDefault();
      if(window.lenis)lenis.scrollTo(t,{duration:1.4,offset:id==='#top'?0:-90});else if(t===0)scrollTo({top:0,behavior:'smooth'});else t.scrollIntoView({behavior:'smooth'});
    });
  });

  if(!hasG||reduce){return;}
  gsap.registerPlugin(ScrollTrigger);

  /* smooth scroll */
  if(window.Lenis){
    window.lenis=new Lenis({duration:1.2,smoothWheel:true});
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(function(t){lenis.raf(t*1000);});
    gsap.ticker.lagSmoothing(0);
  }

  /* word splitting */
  G.splitWords=function(el){
    var txt=el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label',el.textContent.trim());
    el.innerHTML=txt.map(function(w){return '<span class="w" aria-hidden="true"><span>'+w+'</span></span>';}).join(' ');
  };
  G.revealWords=function(scope){
    (scope||document).querySelectorAll('.split,.reveal-lines').forEach(function(el){
      if(el.dataset.done)return;el.dataset.done=1;
      if(!el.querySelector('.w'))G.splitWords(el);
      if(el.closest('[data-intro]'))return;
      var ws=el.querySelectorAll('.w>span');
      gsap.set(ws,{yPercent:115,rotate:5});
      gsap.to(ws,{yPercent:0,rotate:0,duration:1,stagger:.05,ease:'power4.out',scrollTrigger:{trigger:el,start:'top 90%'}});
    });
  };

  /* tags pop */
  document.querySelectorAll('.tag').forEach(function(t){
    gsap.from(t,{scale:0,rotate:-30,opacity:0,duration:.8,ease:'back.out(2)',scrollTrigger:{trigger:t,start:'top 94%'}});
  });

  /* parallax / pops */
  document.querySelectorAll('[data-speed]').forEach(function(el){
    var s=parseFloat(el.dataset.speed);
    gsap.to(el,{y:function(){return s*innerHeight*1.4;},ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
  });
  document.querySelectorAll('[data-pop]').forEach(function(el){
    gsap.from(el,{scale:0,rotate:-90,opacity:0,duration:1,ease:'back.out(1.8)',scrollTrigger:{trigger:el,start:'top 94%'}});
    gsap.to(el,{rotate:'+=10',y:'-=14',duration:2.6,yoyo:true,repeat:-1,ease:'sine.inOut'});
  });

  /* magnetic buttons */
  document.querySelectorAll('.pill').forEach(function(b){
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.18,y:(e.clientY-r.top-r.height/2)*.3,duration:.3});});
    b.addEventListener('mouseleave',function(){gsap.to(b,{x:0,y:0,duration:.5,ease:'elastic.out(1,.4)'});});
  });

  /* footer ingredient drop */
  var drops=document.querySelectorAll('.drop');
  if(drops.length){
    gsap.set(drops,{y:-500,opacity:0});
    ScrollTrigger.create({trigger:'#footer',start:'top 75%',once:true,onEnter:function(){
      gsap.to(drops,{y:0,opacity:1,rotate:function(i){return (i%2?1:-1)*(20+i*25);},duration:1.6,ease:'bounce.out',stagger:.18});
    }});
    gsap.from('.gw',{yPercent:30,scale:.9,ease:'none',scrollTrigger:{trigger:'#giant',start:'top 100%',end:'top 50%',scrub:true}});
  }

  if(G.ready)G.ready();
})();
