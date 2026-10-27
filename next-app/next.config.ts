import path from "node:path";
import type { NextConfig } from "next";

// `npm run build:pages` exports a static site for GitHub Pages, served from the repository's
// sub-path (https://<user>.github.io/THG/). Every other command (dev, build, start) is unchanged.
// Override the sub-path with PAGES_BASE_PATH, e.g. "" for a custom domain at the root.
const forPages = process.env.npm_lifecycle_event === "build:pages";
const basePath = forPages ? (process.env.PAGES_BASE_PATH ?? "/THG") : "";

const nextConfig: NextConfig = {
  // The app has two root layouts, so unmatched URLs need app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  cacheComponents: true,
  partialPrefetching: true,
  ...(forPages && {
    // Partial prerendering needs a server; the site uses no Cache Components APIs, so a static
    // export simply turns both off.
    cacheComponents: false,
    partialPrefetching: false,
    output: "export",
    basePath,
    // Folder-style URLs (/THG/motion-lab/) so GitHub Pages serves index.html for each route.
    trailingSlash: true,
    images: { unoptimized: true },
  }),
  // Next prefixes its own links and chunks; plain asset paths (video, images) read this instead.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: {
    // The parent folder has its own lockfile; pin the root to this app.
    root: path.join(__dirname),
    rules: {
      "*.css": {
        condition: { path: /^src\// },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
