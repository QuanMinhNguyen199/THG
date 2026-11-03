"use client";

// The content editor's draft of a page, rendered with the site's own components. Loaded on demand by
// Editable, only inside the editor's preview.
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { Detail, JobDetail, JobsPage, SectionOverview } from "@/components/site/CorporatePages";
import type { PageDocument } from "@/content/blocks";
import { PUBLISHED } from "@/content/published";
import type { Target } from "./Editable";
import { useContent, useDrafts } from "./EditorBridge";

export default function DraftView({ target }: { target: Target }) {
  const content = useContent();
  const drafts = useDrafts() ?? {};
  switch (target.kind) {
    case "home": {
      const home = (drafts["page:/"] ?? PUBLISHED["page:/"]) as PageDocument;
      return <RenderBlocks blocks={home.layout} />;
    }
    case "overview":
      return <SectionOverview section={target.section} content={content} />;
    case "detail": {
      const page = content.sections[target.section].pages.find((p) => p.slug === target.slug);
      return page ? <Detail section={target.section} page={page} content={content} /> : null;
    }
    case "jobs":
      return <JobsPage page={content.jobsHome} content={content} />;
    case "job": {
      const job = content.jobs.find((j) => j.slug === target.slug);
      return job ? <JobDetail job={job} content={content} /> : null;
    }
  }
}
