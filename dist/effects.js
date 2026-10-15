/* Concept-specific motion layered on the shared page. Every effect checks `paused`,
   so the pause control and reduced-motion preference settle them. */
const root=document.documentElement,currentTheme=()=>root.dataset.theme;
const finePointer=matchMedia('(pointer:fine)');

// Dark Tech: the grid tilts toward the cursor and cards light up under it.
const tilt={x:0,y:0},tiltTarget={x:0,y:0};
addEventListener('pointermove',e=>{
  if(!finePointer.matches||currentTheme()!=='tech')return;
  tiltTarget.x=e.clientX/innerWidth*2-1;tiltTarget.y=e.clientY/innerHeight*2-1;
  const card=e.target.closest?.('.project-visual,.pillars article');
  if(card){const r=card.getBoundingClientRect();card.style.setProperty('--px',`${e.clientX-r.left}px`);card.style.setProperty('--py',`${e.clientY-r.top}px`)}
},{passive:true});

// Industrial: depth layers drift at different speeds while scrolling.
// `translate` composes with the transforms these elements already use for hover and entrances.
const parallaxLayers=[['.hero canvas',.28,true],['.hero-copy',.12,true],['.section-heading',-.06],['.pillars svg',-.1],['.document,.blueprint',-.12],['.metrics strong',-.05]]
  .flatMap(([selector,speed,page])=>[...document.querySelectorAll(selector)].map(el=>({el,speed,page,offset:0})));
let parallaxActive=false;
function clearParallax(){parallaxLayers.forEach(l=>{l.el.style.translate='';l.offset=0});parallaxActive=false}
function updateParallax(){
  const middle=innerHeight/2;
  parallaxLayers.forEach(l=>{
    let offset;
    if(l.page){if(scrollY>innerHeight*1.3&&l.offset)return;offset=Math.min(scrollY,innerHeight*1.3)*l.speed}
    else{const r=l.el.getBoundingClientRect(),top=r.top-l.offset;if(top>innerHeight+200||top+r.height<-200)return;offset=(top+r.height/2-middle)*l.speed}
    l.offset=offset;l.el.style.translate=`0 ${offset.toFixed(1)}px`;
  });
  parallaxActive=true;
}

function frame(){
  const theme=currentTheme();
  if(theme==='tech'&&!paused){
    tilt.x+=(tiltTarget.x-tilt.x)*.06;tilt.y+=(tiltTarget.y-tilt.y)*.06;
    root.style.setProperty('--tilt-x',tilt.x.toFixed(3));root.style.setProperty('--tilt-y',tilt.y.toFixed(3));
    root.style.setProperty('--grid-shift',(scrollY*.2%72).toFixed(1));
  }
  if(theme==='industrial'&&!paused)updateParallax();else if(parallaxActive)clearParallax();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Corporate: headings rise word by word and content blocks fade up as they enter the viewport.
const revealHeadings=[...document.querySelectorAll('.architecture h2,.section-heading h2,.footer-top p')];
const revealBlocks=[...document.querySelectorAll('.metrics>div,.architecture-copy .intro,.layer-layout,.section-heading>p,.pillars article,.project,.footer-top a')];
const waiting=new Set();let headingsSplit=false;
const revealTarget=el=>el._words||el;
const corporateObserver=new IntersectionObserver(entries=>{
  let order=0;
  entries.forEach(e=>{
    if(!e.isIntersecting)return;
    const el=e.target;corporateObserver.unobserve(el);waiting.delete(el);
    if(el._words)anime.animate(el._words,{y:['105%','0%'],opacity:[0,1],duration:900,delay:anime.stagger(45),ease:'outExpo'});
    else anime.animate(el,{opacity:[0,1],y:[32,0],duration:900,delay:order++*90,ease:'outQuart'});
  });
},{threshold:.15,rootMargin:'0px 0px -6% 0px'});
function prepareCorporate(){
  if(!headingsSplit){revealHeadings.forEach(h=>{h._words=anime.splitText(h,{words:{wrap:'clip'}}).words});headingsSplit=true}
  // Only content still below the fold is hidden, so nothing already on screen blinks out.
  [...revealHeadings,...revealBlocks].forEach(el=>{
    if(waiting.has(el)||el.getBoundingClientRect().top<innerHeight*.94)return;
    waiting.add(el);
    anime.utils.set(revealTarget(el),el._words?{y:'105%',opacity:0}:{opacity:0,y:32});
    corporateObserver.observe(el);
  });
}
function settleCorporate(){
  waiting.forEach(el=>{corporateObserver.unobserve(el);anime.utils.remove(revealTarget(el));anime.utils.set(revealTarget(el),el._words?{y:'0%',opacity:1}:{opacity:1,y:0})});
  waiting.clear();
}

function applyConceptMotion(){
  if(currentTheme()==='corporate'&&!paused)prepareCorporate();else settleCorporate();
}
new MutationObserver(applyConceptMotion).observe(root,{attributes:true,attributeFilter:['data-theme']});
motion.addEventListener('click',applyConceptMotion);reduce.addEventListener('change',applyConceptMotion);
document.fonts.ready.then(applyConceptMotion);
