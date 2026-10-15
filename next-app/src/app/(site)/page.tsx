import { Applications } from "@/components/site/Applications";
import { Architecture } from "@/components/site/Architecture";
import { BackToTop, ScrollLight, ThemeDock } from "@/components/site/Chrome";
import { Cta } from "@/components/site/Cta";
import { ConceptEffects } from "@/components/site/ConceptEffects";
import { CorporatePage } from "@/components/site/CorporatePage";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Metrics } from "@/components/site/Metrics";
import { NativePage } from "@/components/site/NativePage";
import { Control } from "@/components/site/Sections";
import { SiteProvider } from "@/components/site/SiteContext";

export default function Home() {
  return (
    <SiteProvider>
      {/* Concepts 1 and 3 share this page; concept 2 (Corporate) and 4 (Agent Native) have
          their own. CSS on <html data-theme> shows exactly one page before first paint. */}
      <div className="shared-page">
        <div className="bg-grid" aria-hidden="true" />
        <a className="skip" href="#main">
          Đến nội dung
        </a>
        <Header />
        <ScrollLight />
        <main id="main">
          <Hero />
          <Metrics />
          <Architecture />
          <Control />
          <Applications />
          <Cta />
          <Footer />
        </main>
      </div>
      <CorporatePage />
      <NativePage />
      <BackToTop />
      <ThemeDock />
      <ConceptEffects />
    </SiteProvider>
  );
}
