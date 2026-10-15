// The footer wordmark waits below its clip edge and rises with a small overshoot once the page end is reached.
const footerClip=document.querySelector('.footer-word-clip');
const footerWord=footerClip.querySelector('.footer-word');
let footerRaised=null,footerMotion,scrollVisualFrame=0;
function setFooterWord(raised){
  if(raised===footerRaised&&!paused)return;
  footerRaised=raised;footerMotion?.cancel();
  if(paused){anime.utils.set(footerWord,{y:'0%'});return}
  footerMotion=raised
    ?anime.animate(footerWord,{y:'0%',duration:900,ease:'outBack(1.6)'})
    :anime.animate(footerWord,{y:'105%',duration:450,ease:'inCubic'});
}
function updateScrollVisuals(){
  scrollVisualFrame=0;
  const range=Math.max(1,document.documentElement.scrollHeight-innerHeight);
  const progress=Math.min(1,Math.max(0,scrollY/range));
  const clip=footerClip.getBoundingClientRect();
  // Hysteresis keeps the word from flickering when the scroll position hovers near the end.
  if(clip.bottom<=innerHeight+4)setFooterWord(true);
  else if(clip.bottom>innerHeight+clip.height*.5)setFooterWord(false);
  else if(paused)setFooterWord(footerRaised??true);
  document.documentElement.style.setProperty('--page-progress',progress);
  document.documentElement.style.setProperty('--light-position',`${progress*115-15}%`);
  document.querySelector('.scroll-light').style.opacity=paused?'0':'1';
}
function queueScrollVisuals(){if(!scrollVisualFrame)scrollVisualFrame=requestAnimationFrame(updateScrollVisuals)}
// Start hidden only when motion is allowed; without JS or with motion paused the word simply shows.
if(!paused&&footerClip.getBoundingClientRect().bottom>innerHeight+4){anime.utils.set(footerWord,{y:'105%'});footerRaised=false}
window.addEventListener('scroll',queueScrollVisuals,{passive:true});
window.addEventListener('resize',queueScrollVisuals);
motion.addEventListener('click',queueScrollVisuals);reduce.addEventListener('change',queueScrollVisuals);
document.fonts.ready.then(queueScrollVisuals);queueScrollVisuals();
