import type { Metadata } from "next";
import { Detail } from "@/components/site/CorporatePages";
import { detail } from "@/components/site/catalog";
import { SiteShell } from "@/components/site/SiteShell";

const page = detail("giai-phap", "aiot");
export const metadata: Metadata = { title: `${page.name} — THEHEGEO` };

export default function Page() {
  return (
    <SiteShell subpage cta={false}>
      <Detail section="giai-phap" page={page} />
    </SiteShell>
  );
}
