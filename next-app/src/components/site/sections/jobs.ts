// Job postings: their type, and how applications reach HR. The postings themselves are content
// (src/content/jobs.json, registry.ts).
import type { PaperGlyphKind } from "../cases.ts";

export type Job = {
  slug: string;
  /** The title as the JD gives it. */
  title: string;
  /** The JD's own qualifier after the title, e.g. "LLM, Agents & Workflow". */
  focus?: string;
  /** Short code for the folder stamp and the application subject. */
  code: string;
  /** The standard job family candidates search for; the jobs page filters by it. */
  family: string;
  /** One line on what the role does, from the JD's duties (list cards and the folder). */
  summary: string;
  intro: string;
  duties: string[];
  requirements: string[];
  plus: string[];
  benefits: string[];
  location: string;
  /** How the JD asks applicants to title their email, when it says. */
  subject?: string;
  /** Key skills as short tags for the folder brief, taken from the JD's own wording; when absent,
   *  the requirements are used (they are already short). */
  skills?: string[];
  /** Areas of work as short tags for the folder brief, when the JD's duties are full sentences. */
  areas?: string[];
  /** The drawing on the posting's folder paper (JobList); without one the paper shows rule lines. */
  glyph?: PaperGlyphKind;
};

// Applications go to HR_EMAIL / HR_PHONE as the JDs give them.
export const HR_EMAIL = "hr@thehegeo.com";
export const HR_PHONE = "0346 931 848";

/** The application email for a job: to HR, titled as the JD asks (or with the role's code and name). */
export const applyHref = (j: Job) => `mailto:${HR_EMAIL}?subject=${encodeURIComponent(j.subject ?? `[${j.code}] Ứng tuyển ${j.title}`)}`;
