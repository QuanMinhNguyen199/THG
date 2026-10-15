# GEOagents — React (Next.js)

Two routes, each with its own root layout (route groups), so their CSS never mixes:

| Route | Source | What it is |
|---|---|---|
| `/` | `src/app/(site)` + `src/components/site` | The landing page, ported from the static site in `../dist` with the same markup, CSS and behaviour (three concepts, canvas art, Anime.js motion). |
| `/motion-lab` | `src/app/(lab)` + `src/components/{hero,layers,pillars}` | GSAP / React Three Fiber prototype kept for comparison. |

### Landing page structure (`/`)

- `src/styles/site/*.css` — the static site's stylesheets, unchanged except font families now point at `next/font` variables (`--font-body`, `--font-display`).
- `SiteContext.tsx` — theme (persisted to `localStorage` and `?theme=`), pause control / reduced motion, and the live colour refs the canvases read.
- `Logo.tsx` — the THEHEGEO logo as vector paths (one SVG for every concept, coloured by `--logo-accent` / `--logo-ink` in `demo.css`). Rebuilt from the measured raster: a point-down regular pentagon cut by a point-up star into five two-tone pieces (equal 30-unit gaps, softly rounded), and block letters with stroke 35 on a 193 cap height and even tracking. `app/icon.svg` is the emblem alone and serves as the favicon.
- `DiveScene.tsx` + `styles/site/layers.css` — optional "Vào GEO Core" view of the four-tier section (switch in the art panel, saved per visitor, shareable with `?layers=dive`). A Neural Core / Quantum Sphere of four nested shells — data field (Fibonacci points), neural mesh (geodesic lattice with pulses), task orbits, and the core: a navy sphere bearing the THEHEGEO emblem on its front and back (red / navy facets on a white pentagon, so the star stays white), lit and slowly spinning inside a wire cage and glow. Each scroll step moves the camera one shell deeper. Transparent canvas with no frame or captions, so the sphere sits on the section itself; coloured per concept via `--stage-*` tokens; capped at 60 fps; loaded only when chosen; frozen offscreen or with reduced motion.
- `Chrome.tsx` `BackToTop` + `styles/site/to-top.css` — floating back-to-top sphere with a scroll-progress ring, shown once the hero is mostly scrolled past (replaces the footer link).
- `CorporatePage.tsx` + `Plexus.tsx` + `styles/site/corporate-page.css` — concept 2 (Corporate) is its own page built from the supplied design (Space Mono, red plexus networks, slanted comparison cards, case studies, demo form). CSS on `<html data-theme>` shows either it or the shared page before first paint. Motion: drifting pointer-reactive plexus, typed tagline, stroke-drawn step icons, staggered card slide-in, counting "20 năm" with a red sweep, wiping case images, and focus/validation states on the form. The form has no backend yet: a valid request opens the visitor's email app addressed to geotech@thehegeo.com. Case images are frames from the hero film until real photos are supplied.
- `CorporateShowcase.tsx` + `styles/site/corporate-showcase.css` — Corporate product-in-action pieces, all built on one fictional sample directive (labelled "Văn bản minh họa"): a looping hero demo panel (read → extract three tasks → approved), the three steps as a scroll-pinned flow (Đọc / Đề xuất / Theo đến cùng, chosen by native scroll position), an isometric CSS "Dữ liệu ở lại với khách hàng" diagram with pointer tilt and hover-linked callouts, and a small pointer tilt on case cards. No WebGL.
- `NativePage.tsx` + `Waves.tsx` + `styles/site/native-page.css` — concept 4 ("Agent Native"), its own page from the supplied design: canvas silk-wave ribbons (hero and footer, 60 fps cap, pointer-nudged), a statement that darkens word by word with scroll, three isometric SVG principles that draw in, four feature rows with HTML product mock screens (fictional sample data, labelled minh họa; the design repeated a third-party app screenshot), and a hover list of deployments.
- `Hero.tsx` + `styles/site/hero.css` — Mercedes-style video stage: full-bleed film with copy bottom-left. Over the film a custom cursor follows the mouse and shows play/pause; clicking the stage toggles playback, and a real toggle button in the bottom bar does the same for keyboard and touch. The video has native `autoplay` (muted, looped) so it starts before hydration, retries on `canplay` and on the first interaction if a browser blocks it, pauses offscreen, and stays on its poster with the motion pause control or prefers-reduced-motion. Sources in `public/media`: H.264 1080p (3.7 MB) and 720p for ≤900px screens, VP9 WebM fallbacks, and a poster frame; all re-encoded without audio from the 12.8 MB original.
- `art.ts` + `useArtCanvas.ts` — the four-tier tower drawing as pure functions, driven by one loop per canvas that skips offscreen and paused frames.
- `Architecture.tsx` — sticky four-tier scene. While it is pinned, scrolling moves tier by tier: a mouse notch, ~50px of trackpad scroll, a swipe or an arrow/Page key glides the page (560 ms) to the next tier, and the copy switches as the glide starts. Input is held only during a glide, so continuous or fast scrolling keeps stepping and then leaves the section; a fling's shrinking inertia tail is absorbed (one fling = one tier) and never throws the page past the first/last tier. Each touch gesture moves one tier and may interrupt a glide. Scrollbar drags still select the nearest tier. The canvas (`drawTower` in `art.ts`) is a rotating 3D tower: each step turns it a quarter, slides the active tier forward while the others recede, and moves the globe core to that tier.
- `Metrics.tsx` — figures count up once when the band scrolls into view; server HTML and screen readers always get the final values.
- `ConceptEffects.tsx` — entrance reveals, Dark Tech grid tilt and spotlight, Industrial parallax, Corporate word reveals; each cleans up when the concept or pause state changes.
- The inline script in `(site)/layout.tsx` applies the saved concept before first paint; legacy links (`?theme=charcoal|navy|ruby`) still resolve.

## Stack

Next.js 16 (App Router) · Tailwind CSS 4 · GSAP 3.15 (ScrollTrigger, SplitText) · Lenis · Motion · React Three Fiber.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Library setup

```bash
npm install animejs gsap @gsap/react lenis motion three @react-three/fiber @react-three/drei
npm install -D @types/three
```

- `@studio-freight/lenis` is deprecated; the package is now `lenis` (React bindings at `lenis/react`).
- Framer Motion ships as `motion`; import from `motion/react`.
- GSAP SplitText is free and bundled with `gsap` since 3.13, so SplitType is not needed.
- CSS: `lenis/dist/lenis.css` is imported once in `src/app/layout.tsx`; brand tokens live in the `@theme` block of `src/app/globals.css`.

## Where things live

| Effect | File |
|---|---|
| Plugin registration (import gsap only from here) | `src/lib/gsap.ts` |
| Lenis driven by GSAP's ticker, synced to ScrollTrigger | `src/components/providers/SmoothScroll.tsx` |
| Lab: hero headline SplitText blur-in + WebGL mount | `src/components/hero/Hero.tsx` |
| Lab: R3F wireframe core with pointer parallax | `src/components/hero/CoreScene.tsx` |
| Lab: pinned 4-tier isometric stack, lasers, hover glow | `src/components/layers/LayerStack.tsx` |
| Lab: magnetic 3D tilt card with border spotlight | `src/components/pillars/TiltCard.tsx` |
| Copy | `src/content/site.ts` |

## Lab behaviour notes

- Reduced motion: Lenis falls back to native wheel scrolling, the headline and stack render in their final state, the 3D scene renders one static frame, cards do not tilt.
- The WebGL canvas loads client-only (`next/dynamic`, `ssr: false`) behind a CSS glow fallback and stops rendering frames when the hero leaves the viewport.
- Tilt follows mouse pointers only; touch keeps cards static.
- The headline is hidden until SplitText is ready (no flash of unsplit text). This delays its first paint until hydration; measure LCP before shipping.
