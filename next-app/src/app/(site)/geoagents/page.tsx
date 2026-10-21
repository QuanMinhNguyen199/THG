import type { Metadata } from "next";
import { Applications } from "@/components/site/Applications";
import { Architecture } from "@/components/site/Architecture";
import { Careers } from "@/components/site/Careers";
import { Hero } from "@/components/site/Hero";
import { Metrics } from "@/components/site/Metrics";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = { title: "GEOagents — THEHEGEO" };

// The long product page (formerly the home page), unchanged.
export default function GeoagentsPage() {
  return (
    <SiteShell>
      <Hero />
      <Metrics />
      <Architecture />
      <Applications />
      <Careers />
    </SiteShell>
  );
}
