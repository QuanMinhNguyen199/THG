import type { Metadata } from "next";
import { SectionOverview } from "@/components/site/CorporatePages";
import { SECTIONS, describe } from "@/components/site/catalog";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = { title: `${SECTIONS["ung-dung"].title} — THEHEGEO`, description: describe(SECTIONS["ung-dung"].home) };

export default function Page() {
  return (
    <SiteShell subpage cta={false}>
      <SectionOverview section="ung-dung" />
    </SiteShell>
  );
}
