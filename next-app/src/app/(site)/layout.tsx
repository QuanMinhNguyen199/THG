import type { Metadata, Viewport } from "next";
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

// The site CSS refers to these variables instead of hard-coded family names.
const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GEOagents — THEHEGEO",
  description: "GEOagents — lực lượng AI cho vận hành trọng yếu. AI chủ quyền, con người làm chủ.",
};

export const viewport: Viewport = { themeColor: "#0A0A0A" };

// Runs before first paint so the theme never flashes: it follows the system colour scheme
// (dark: Dark Tech, light: Industrial).
const themeInit = `document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: light)').matches?'industrial':'tech'`;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
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
