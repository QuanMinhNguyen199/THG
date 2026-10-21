import type { Metadata } from "next";
import { SectionOverview } from "@/components/site/CorporatePages";
import { SECTIONS } from "@/components/site/catalog";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = { title: `${SECTIONS["ve-thehegeo"].title} — THEHEGEO` };

export default function Page() {
  return (
    <SiteShell subpage cta={false}>
      <SectionOverview section="ve-thehegeo" />
    </SiteShell>
  );
}
