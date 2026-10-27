import type { Metadata } from "next";
import { SectionOverview } from "@/components/site/CorporatePages";
import { SECTIONS, describe } from "@/components/site/catalog";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = { title: `${SECTIONS["giai-phap"].title} — THEHEGEO`, description: describe(SECTIONS["giai-phap"].home) };

export default function Page() {
  return (
    <SiteShell subpage cta={false}>
      <SectionOverview section="giai-phap" />
    </SiteShell>
  );
}
