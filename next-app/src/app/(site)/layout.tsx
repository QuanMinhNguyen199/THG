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
import "@/styles/site/to-top.css";
import "@/styles/site/corporate-page.css";
import "@/styles/site/corporate-showcase.css";
import "@/styles/site/native-page.css";
import "@/styles/site/contacts.css";
import "@/styles/site/typography.css";
import "@/styles/site/agent-workflow.css";
import "@/styles/site/laptop-chat.css";
import "@/styles/site/laptop-feature.css";
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

// Runs before first paint so a saved or shared concept never flashes the default one.
// Old concept names from shared links still resolve.
const themeInit = `(()=>{const t=['tech','corporate','industrial','native'],l={charcoal:'tech',ruby:'corporate',navy:'industrial'},p=v=>t.includes(v)?v:l[v];let s='tech';try{s=p(new URLSearchParams(location.search).get('theme'))||p(localStorage.getItem('geo-theme'))||s}catch{}document.documentElement.dataset.theme=s})()`;

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
