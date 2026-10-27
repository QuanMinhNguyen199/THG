import type { Metadata } from "next";
import { JobsPage } from "@/components/site/CorporatePages";
import { JOBS_HOME } from "@/components/site/catalog";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = { title: "Tuyển dụng — THEHEGEO", description: JOBS_HOME.lead };

export default function Page() {
  return (
    <SiteShell subpage cta={false}>
      <JobsPage page={JOBS_HOME} />
    </SiteShell>
  );
}
