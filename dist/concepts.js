/* Anime.js owns the floor-light interpolation and interruptible transitions.
   Native scroll + sticky layout preserve wheel, touch, keyboard and scrollbar behavior. */
const themeNames={tech:'Interactive Dark Tech',corporate:'Corporate Motion Canvas',industrial:'Industrial High-End Dark'};
const themeButtons=[...document.querySelectorAll('[data-theme-choice]')];
let themeTransition,lightTransition,panelTransition,pointerTransition;
function applyTheme(theme,transition=true){
  if(!themeNames[theme])return;
  document.documentElement.dataset.theme=theme;
  const styles=getComputedStyle(document.documentElement);
  canvasAccent=styles.getPropertyValue('--red').trim();floorInk=styles.getPropertyValue('--floor-ink').trim();
  document.querySelector('meta[name="theme-color"]').content=styles.getPropertyValue('--bg').trim();
  themeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===theme)));
  try{localStorage.setItem('geo-theme',theme)}catch{}
  const url=new URL(location.href);url.searchParams.set('theme',theme);history.replaceState(null,'',url);
  document.querySelector('#theme-announcement').textContent='Giao diện '+themeNames[theme];
  themeTransition?.cancel();
  if(transition&&!paused)themeTransition=anime.animate('.hero-copy',{opacity:[.65,1],y:[10,0],duration:450,ease:'outExpo'});
}
themeButtons.forEach(b=>b.onclick=()=>applyTheme(b.dataset.themeChoice));applyTheme(document.documentElement.dataset.theme,false);

const scene=document.querySelector('.architecture-scroll'),stage=scene.querySelector('.architecture');
const baseSelectLayer=selectLayer;
selectLayer=function(i){
  const changed=i!==activeLayer;baseSelectLayer(i);
  document.querySelector('.architecture-art').dataset.floor=`${String(i+1).padStart(2,'0')} / ${['QUẢN TRỊ','QUẢN LÝ','THỰC THI','DỊCH VỤ'][i]}`;
  document.querySelector('#floor-status').textContent=`0${i+1} / 04 — Cuộn để khám phá từng tầng`;
  document.querySelector('.floor-progress i').style.transform=`scaleX(${(i+1)/4})`;
  lightTransition?.cancel();pointerTransition?.cancel();
  if(paused){floorLight.forEach((f,n)=>f.value=+(n===i));floorPointer.value=i}else{
    lightTransition=anime.animate(floorLight,{value:(_,n)=>+(n===i),duration:950,ease:'inOutCubic'});
    pointerTransition=anime.animate(floorPointer,{value:i,duration:950,ease:'inOutCubic'});
    if(changed){panelTransition?.cancel();panelTransition=anime.animate('#layer-panel',{opacity:[.8,1],y:[6,0],duration:600,ease:'outCubic'})}
  }
};
selectLayer(0);
let previousScrollLayer=-1,scrollPending=false;
function scrollLayer(){scrollPending=false;const rect=scene.getBoundingClientRect(),distance=scene.offsetHeight-stage.offsetHeight;const progress=Math.min(1,Math.max(0,-rect.top/Math.max(1,distance)));const i=Math.min(3,Math.floor(progress*4));if(i!==previousScrollLayer){previousScrollLayer=i;selectLayer(i)}}
window.addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(scrollLayer)}},{passive:true});window.addEventListener('resize',scrollLayer);scrollLayer();
function navigateFloor(i){const top=scene.getBoundingClientRect().top+scrollY;const distance=scene.offsetHeight-stage.offsetHeight;previousScrollLayer=i;selectLayer(i);window.scrollTo({top:top+distance*(i+.35)/4,behavior:paused?'instant':'smooth'})}
tabs.forEach((b,i)=>{b.onclick=()=>navigateFloor(i);b.onkeydown=e=>{let n;if(e.key==='ArrowDown')n=(i+1)%4;if(e.key==='ArrowUp')n=(i+3)%4;if(e.key==='Home')n=0;if(e.key==='End')n=3;if(n!==undefined){e.preventDefault();navigateFloor(n);tabs[n].focus({preventScroll:true})}}});
// Stop in-flight effects as soon as reduced motion or the pause control is used.
function settleMotion(){if(paused){lightTransition?.cancel();pointerTransition?.cancel();panelTransition?.complete();themeTransition?.complete();floorLight.forEach((f,n)=>f.value=+(n===activeLayer));floorPointer.value=activeLayer;anime.utils.remove('.metrics,.architecture-copy,.section-heading,.pillars article,.project');document.querySelectorAll('.metrics,.architecture-copy,.section-heading,.pillars article,.project').forEach(el=>{el.style.opacity='';el.style.transform=''})}}
motion.addEventListener('click',settleMotion);reduce.addEventListener('change',settleMotion);
