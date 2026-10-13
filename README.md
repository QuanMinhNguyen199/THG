# THEHEGEO — GEOagents

Static landing page with animated canvas circuitry, rotating sphere and scroll-focused organization layers. No build step. Anime.js 4.5.0 is bundled locally in `dist/vendor` (MIT license included); its exact package version is recorded in package.json and package-lock.json.

Preview: run `python -m http.server 4173 --directory dist` then open http://localhost:4173.

Edit `dist/index.html`, `dist/style.css`, and `dist/app.js`. Concept styles are in `dist/concepts.css`; theme persistence and Anime.js floor transitions are in `dist/concepts.js` and `dist/theme-init.js`. Share a concept with `?theme=charcoal`, `?theme=navy` or `?theme=ruby`. The logo and illustrations are recreated in code from the supplied screenshot. Fonts load from Google Fonts. Application buttons open informational dialogs; no backend is connected.
