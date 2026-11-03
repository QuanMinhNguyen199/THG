import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JobDetail } from "@/components/site/CorporatePages";
import { JOBS, job } from "@/components/site/catalog";
import { SiteShell } from "@/components/site/SiteShell";

// One page per posting in src/content/jobs.json: a posting added there gets its page at the next build.
export function generateStaticParams() {
  return JOBS.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const data = job((await params).slug);
  return data ? { title: `${data.title} — Tuyển dụng THEHEGEO`, description: data.summary } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const data = job((await params).slug);
  if (!data) notFound();
  return (
    <SiteShell subpage cta={false}>
      <JobDetail job={data} />
    </SiteShell>
  );
}
