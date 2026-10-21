"use client";

// The model beside each detail page's heading: the page's own content drawn as an object that moves.
//   core     the GEO core in 3D (Giải pháp AI)
//   bridge   a cable-stayed bridge: sensors pulse, data runs to the platform, an alert lights (AIoT)
//   devices  sensor → datalogger → AI Box → alert, with data running along the chain (Công nghệ)
//   phone    a phone playing a short, labelled simulation of the product (HKD)
//   stack    the page's layers as plates in 3D that separate when seen (A360, AI Platform)
// Everything runs only while on screen and stands still for reduced motion.
import { useEffect, useRef, useState } from "react";
import type { Model } from "./catalog";
import { HomeCore } from "./HomeCore";

/** True once the element has been on screen (and stays true). */
function useSeen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

function Bridge({ labels }: { labels: string[] }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  // Sensor positions on the deck and pylons (viewBox 640 × 400).
  const sensors = [
    [150, 250], [250, 250], [330, 250], [410, 250], [510, 250], [200, 130], [460, 130],
  ];
  return (
    <div ref={ref} className={`pm pm-bridge${seen ? " is-on" : ""}`}>
      <svg viewBox="0 0 640 400" aria-hidden="true">
        <defs>
          <linearGradient id="pm-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#141820" />
            <stop offset="1" stopColor="#0a0b0e" />
          </linearGradient>
        </defs>
        <rect width="640" height="400" fill="url(#pm-sky)" />
        {/* water */}
        <path d="M0 330h640v70H0z" fill="#0d1218" />
        {[0, 1, 2].map((i) => (
          <path key={i} className="pm-wave" style={{ animationDelay: `${i * 0.8}s` }} d={`M${40 + i * 180} ${352 + i * 10}h90`} />
        ))}
        {/* pylons, cables, deck */}
        {[200, 460].map((x) => (
          <g key={x}>
            <path className="pm-pylon" d={`M${x - 10} 330 L${x - 4} 90 h8 L${x + 10} 330 z`} />
            {[-1, 1].flatMap((side) =>
              [40, 80, 120].map((d) => <path key={`${side}${d}`} className="pm-cable" d={`M${x} ${100 + d / 6} L${x + side * d} 250`} />),
            )}
          </g>
        ))}
        <path className="pm-deck" d="M30 250 H610 v12 H30 z" />
        {/* the datalogger at the pylon foot, and data running from it to the platform */}
        <rect className="pm-logger" x="182" y="290" width="36" height="24" rx="4" />
        <path id="pm-uplink" className="pm-link" d="M218 300 C 300 300, 360 200, 520 70" />
        {[0, 0.7, 1.4].map((d) => (
          <circle key={d} className="pm-packet" r="4">
            <animateMotion dur="2.1s" begin={`${d}s`} repeatCount="indefinite" path="M218 300 C 300 300, 360 200, 520 70" />
          </circle>
        ))}
        {/* sensors */}
        {sensors.map(([x, y], i) => (
          <g key={i} className="pm-sensor" style={{ animationDelay: `${i * 0.25}s` }}>
            <circle cx={x} cy={y} r="10" className="pm-ring" />
            <circle cx={x} cy={y} r="4.5" className="pm-dot" />
          </g>
        ))}
      </svg>
      {/* the platform panel, flat over the scene */}
      <div className="pm-panel">
        <span className="pm-panel-title">{labels[2]}</span>
        <span className="pm-bars" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} style={{ animationDelay: `${i * 0.12}s` }} />
          ))}
        </span>
        <span className="pm-alert">{labels[3]}</span>
      </div>
      <ul className="pm-legend">
        <li>
          <i className="is-sensor" /> {labels[0]}
        </li>
        <li>
          <i className="is-logger" /> {labels[1]}
        </li>
      </ul>
    </div>
  );
}

function Devices({ items }: { items: string[] }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  return (
    <div ref={ref} className={`pm pm-devices${seen ? " is-on" : ""}`}>
      <ol>
        {items.map((label, i) => (
          <li key={label} className={`pm-dev is-${i}${i === items.length - 1 ? " is-last" : ""}`} style={{ transitionDelay: `${i * 0.18}s` }}>
            <span className="pm-box" aria-hidden="true">
              <i className="pm-led" />
              <i className="pm-led" />
              {i === 2 && <i className="pm-lens" />}
              {i === 1 && <i className="pm-screen" />}
              {i === 0 && <i className="pm-probe" />}
              {i === 3 && <b>!</b>}
            </span>
            <span className="pm-dev-label">{label}</span>
            {i < items.length - 1 && (
              <span className="pm-wire" aria-hidden="true">
                <i style={{ animationDelay: `${i * 0.45}s` }} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Phone({ title, caller, script }: { title: string; caller: string; script: { who: "in" | "agent"; text: string }[] }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const [step, setStep] = useState(script.length);
  useEffect(() => {
    if (!seen || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let n = 0;
    setStep(0);
    const id = setInterval(() => {
      n = (n + 1) % (script.length + 3);
      setStep(Math.min(n, script.length));
    }, 1300);
    return () => clearInterval(id);
  }, [seen, script.length]);
  return (
    <div ref={ref} className="pm pm-phone">
      <div className="m-phone is-full">
        <div className="m-phone-screen">
          <span className="m-phone-app">{title}</span>
          <strong className="m-phone-caller">{caller}</strong>
          <ol className="m-phone-feed">
            {script.map((l, i) => (
              <li key={i} className={`is-${l.who}${i < step ? " is-shown" : ""}`}>
                {l.text}
              </li>
            ))}
          </ol>
          <span className="m-wave" aria-hidden="true">
            {Array.from({ length: 9 }, (_, i) => (
              <i key={i} style={{ animationDelay: `${(i % 5) * 0.12}s` }} />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

function Stack({ layers }: { layers: { label: string; chips?: string[] }[] }) {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const gap = seen ? (layers.length > 4 ? 26 : 56) : 6;
  const n = layers.length;
  return (
    <div ref={ref} className={`pm pm-stack${seen ? " is-on" : ""}`}>
      <div className="pm-stack-world" style={{ transform: `translateY(${((n - 1) * gap) / 2.6}px) rotateX(58deg) rotateZ(-38deg)` }}>
        {layers.map((l, i) => (
          <div
            key={l.label}
            className={`pm-plate${i === 0 ? " is-top" : ""}`}
            style={{ transform: `translateZ(${(n - 1 - i) * gap}px)`, transitionDelay: `${i * 0.06}s` }}
          >
            {l.chips?.map((c) => <i key={c} className="pm-chip" />)}
            {!l.chips && <span className="pm-plate-leds" />}
          </div>
        ))}
      </div>
      <ol className="pm-stack-labels">
        {layers.map((l, i) => (
          <li key={l.label} style={{ transitionDelay: `${0.25 + i * 0.08}s` }}>
            <strong>{l.label}</strong>
            {l.chips && <span>{l.chips.join(" · ")}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PageModel({ model }: { model: Model }) {
  if (model.kind === "core") return <HomeCore />;
  if (model.kind === "bridge") return <Bridge labels={model.labels} />;
  if (model.kind === "devices") return <Devices items={model.items} />;
  if (model.kind === "phone") return <Phone title={model.title} caller={model.caller} script={model.script} />;
  return <Stack layers={model.layers} />;
}

/** Corporate pages: blocks rise in as they reach the screen (a class on <html> turns this on, so
 *  without script everything simply shows). */
export function BlockMotion() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("corp-motion");
    const blocks = [...document.querySelectorAll<HTMLElement>(".corp-block, .corp-cta, .corp-siblings")];
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    blocks.forEach((b) => {
      if (b.getBoundingClientRect().top < innerHeight) b.classList.add("is-in");
      else io.observe(b);
    });
    return () => {
      io.disconnect();
      root.classList.remove("corp-motion");
    };
  }, []);
  return null;
}
