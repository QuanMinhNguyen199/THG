# THEHEGEO — GEOagents

## Running the site

The current site is the React (Next.js) app in `next-app/`. The same commands work from this folder or from `next-app/`:

```bash
npm run dev      # development server → http://localhost:3000
npm run build    # production build
npm start        # serve the production build → http://localhost:3000
```

### GitHub Pages

```bash
npm run build:pages   # static export → next-app/out/, served under /THG/
```

`.github/workflows/pages.yml` builds and deploys on every push to `main`. One-time setup on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**. The site then lives at https://quanminhnguyen199.github.io/THG/. The base path follows the repository name in CI; locally set `PAGES_BASE_PATH` to override it (e.g. `""` for a custom domain).

Four concepts: `?theme=tech`, `?theme=corporate`, `?theme=industrial`, `?theme=native` (or the switcher at the bottom of the page). See `next-app/README.md` for the code structure.

## Legacy static prototype (`dist/`)

Kept for reference only; it no longer receives changes. Run it with `npm run dev:static` (requires Python) and open http://localhost:4175.


Static landing page with animated canvas circuitry, rotating sphere and scroll-focused organization layers. No build step. Anime.js 4.5.0 is bundled locally in `dist/vendor` (MIT license included); its exact package version is recorded in package.json and package-lock.json.

The current demo is local-only; this iteration is not deployed to Sites.

The header uses a transparent dark-theme logo and a light logo from `dist/assets`. The footer wordmark shows only its top half and rises with a small overshoot once the page end is reached. Anime.js interpolates the four floor lights and connecting line with a 950 ms cubic transition. A restrained linear light band follows page scroll; reduced-motion preferences and the pause control disable decorative movement.

Edit `dist/index.html`, `dist/style.css`, and `dist/app.js`. Concept styles are in `dist/concepts.css`; theme persistence and Anime.js floor transitions are in `dist/concepts.js` and `dist/theme-init.js`. Concept-specific effects (3D grid, glow hovers, word reveals, ambient glows, parallax) are in `dist/effects.css` and `dist/effects.js`. Share a concept with `?theme=tech`, `?theme=corporate` or `?theme=industrial`. The logo and illustrations are recreated in code from the supplied screenshot. Fonts load from Google Fonts. Application buttons open informational dialogs; no backend is connected.
