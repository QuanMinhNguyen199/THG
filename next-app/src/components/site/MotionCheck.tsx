"use client";

// QA switch: forces the site into prefers-reduced-motion (what Windows "best performance" or
// "animation effects off" sends) without touching OS or DevTools settings. Shown in development,
// or in any build when the URL carries ?motion-check. The forcing itself is done before first
// paint by motionCheckInit (SiteDocument); this button only flips the flag and reloads.

import { useEffect, useState } from "react";

export const MOTION_CHECK_KEY = "geo-motion-check";

/** Inline, pre-hydration: when the flag is set, every reduced-motion media query matches,
 *  in CSS (@media rules are rewritten) and in JS (matchMedia is wrapped). */
export const motionCheckInit = `(function(){try{if(localStorage.getItem('${MOTION_CHECK_KEY}')!=='reduce')return}catch(e){return}
var R=/\\(\\s*prefers-reduced-motion\\s*:\\s*reduce\\s*\\)/g,N=/\\(\\s*prefers-reduced-motion\\s*:\\s*no-preference\\s*\\)/g,
fix=function(q){return String(q).replace(R,'(min-width: 0px)').replace(N,'(min-width: 999999px)')},
mm=window.matchMedia.bind(window);window.matchMedia=function(q){return mm(fix(q))};
var walk=function(rules){for(var i=0;i<rules.length;i++){var r=rules[i];if(r.media&&/prefers-reduced-motion/.test(r.media.mediaText)){r.media.mediaText=fix(r.media.mediaText)}if(r.cssRules)walk(r.cssRules)}},
all=function(){for(var i=0;i<document.styleSheets.length;i++){try{walk(document.styleSheets[i].cssRules)}catch(e){}}};
document.documentElement.dataset.motionCheck='reduce';
new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.tagName==='LINK')n.addEventListener('load',all);if(n.tagName==='STYLE')all()})})}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',all);window.addEventListener('load',all);all()})()`;

export function MotionCheck() {
  const [shown, setShown] = useState(false);
  const [on, setOn] = useState(false);

  useEffect(() => {
    let flag = false;
    try {
      flag = localStorage.getItem(MOTION_CHECK_KEY) === "reduce";
    } catch {
      // storage blocked: the switch cannot work, so it stays hidden
      return;
    }
    setOn(flag);
    setShown(process.env.NODE_ENV !== "production" || flag || new URLSearchParams(location.search).has("motion-check"));
  }, []);

  if (!shown) return null;

  const toggle = () => {
    try {
      if (on) localStorage.removeItem(MOTION_CHECK_KEY);
      else localStorage.setItem(MOTION_CHECK_KEY, "reduce");
    } catch {
      return;
    }
    location.reload();
  };

  return (
    <button type="button" className={`motion-check${on ? " is-on" : ""}`} aria-pressed={on} onClick={toggle}>
      Reduced motion: {on ? "BẬT" : "tắt"}
    </button>
  );
}
