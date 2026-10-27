import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import "@/styles/site/style.css";
import "@/styles/site/concepts.css";
import "@/styles/site/demo.css";
import "@/styles/site/effects.css";
import "@/styles/site/cta.css";
import "@/styles/site/industrial.css";
import "@/styles/site/hero.css";
import "@/styles/site/header.css";
import "@/styles/site/layers.css";
import "@/styles/site/layers-flow.css";
import "@/styles/site/to-top.css";
import "@/styles/site/contacts.css";
import "@/styles/site/typography.css";
import "@/styles/site/sticky-header.css";
import "@/styles/site/pages.css";
import "@/styles/site/home.css";
import "@/styles/site/cases.css";
import "@/styles/site/corporate.css";
import "@/styles/site/blocks.css";
import "@/styles/site/models.css";
import "@/styles/site/mobile.css";

// The site CSS refers to these variables instead of hard-coded family names.
const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

// Runs before first paint so the theme never flashes: it follows the system colour scheme
// (dark: Dark Tech, light: Industrial).
const themeInit = `document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: light)').matches?'industrial':'tech'`;

/** The html document every site page shares: stylesheets, font and theme. The site layout and the
 *  global 404 page (which bypasses layouts) both render it. */
export function SiteDocument({ children }: { children: ReactNode }) {
  return (
    // data-theme is rewritten by the inline script before hydration.
    <html lang="vi" data-theme="tech" className={body.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
