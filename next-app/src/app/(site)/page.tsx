import { Applications } from "@/components/site/Applications";
import { Architecture } from "@/components/site/Architecture";
import { Careers } from "@/components/site/Careers";
import { BackToTop, ScrollLight, ThemeDock } from "@/components/site/Chrome";
import { Cta } from "@/components/site/Cta";
import { ConceptEffects } from "@/components/site/ConceptEffects";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Metrics } from "@/components/site/Metrics";
import { SiteProvider } from "@/components/site/SiteContext";

export default function Home() {
  return (
    <SiteProvider>
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
          <Applications />
          <Careers />
          <Cta />
          <Footer />
        </main>
      </div>
      <BackToTop />
      <ThemeDock />
      <ConceptEffects />
    </SiteProvider>
  );
}
