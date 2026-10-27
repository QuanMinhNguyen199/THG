import type { Metadata } from "next";
import { Detail } from "@/components/site/CorporatePages";
import { detail, describe } from "@/components/site/catalog";
import { SiteShell } from "@/components/site/SiteShell";

const page = detail("ve-thehegeo", "kinh-nghiem-du-an");
export const metadata: Metadata = { title: `${page.name} — THEHEGEO`, description: describe(page) };

export default function Page() {
  return (
    <SiteShell subpage cta={false}>
      <Detail section="ve-thehegeo" page={page} />
    </SiteShell>
  );
}
