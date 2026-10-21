import type { Metadata } from "next";
import { JobDetail } from "@/components/site/CorporatePages";
import { job } from "@/components/site/catalog";
import { SiteShell } from "@/components/site/SiteShell";

const data = job("devops-platform-engineer");
export const metadata: Metadata = { title: `${data.title} — Tuyển dụng THEHEGEO` };

export default function Page() {
  return (
    <SiteShell subpage cta={false}>
      <JobDetail job={data} />
    </SiteShell>
  );
}
