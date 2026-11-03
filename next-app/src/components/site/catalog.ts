// Corporate pages, from docs/content-thehegeo.md. Every page is a heading (title, English line,
// lead) followed by content blocks rendered by CorporatePages.tsx. Copy is the document's own; items
// it marks "[Cần xác nhận]" are listed in src/content/NOTES.md, not shown on the page.
// The content itself is JSON (src/content, registry.ts); this module gives the site its lookups.

export * from "./sections/shared.ts";
export * from "./sections/partners.ts";
export * from "./sections/jobs.ts";
import { CONTENT } from "@/content/published";
import type { SectionKey } from "@/content/registry";
import type { Page } from "./sections/shared.ts";
export type { SectionKey } from "@/content/registry";

export const SECTIONS = CONTENT.sections;
export const JOBS = CONTENT.jobs;
export const JOBS_HOME = CONTENT.jobsHome;
/** The address the contact form and the phone menu write to: the footer's email. */
export const APPLY_EMAIL = CONTENT.footer.email;

/** A detail page by section and slug (one route folder per page under src/app/(site)/<section>/). */
export const detail = (section: SectionKey, slug: string) => SECTIONS[section].pages.find((p) => p.slug === slug)!;
/** A posting by slug; undefined for a slug no posting has (its route answers 404). */
export const job = (slug: string) => JOBS.find((j) => j.slug === slug);
/** The page's meta description: its lead, or its headline and card line when it has no lead. */
export const describe = (p: Page) => p.lead ?? [p.title, p.kind].filter(Boolean).join(" ");
