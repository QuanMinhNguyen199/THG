"use client";

import { useState } from "react";
import { JOBS, applyHref, type Job } from "./catalog";
import { ProjectCase } from "./Applications";
import type { CaseData, PaperGlyphKind } from "./cases";

// What each job's folder paper shows (Applications.tsx draws them).
const GLYPH: Record<string, PaperGlyphKind> = {
  "ai-engineer": "agents",
  "mlops-engineer": "pipeline",
  "data-engineer": "data",
  "devops-platform-engineer": "platform",
  "fullstack-engineer": "web",
  "business-analyst": "flow",
};

const ALL = "Tất cả vị trí";

function jobFolder(job: Job): CaseData {
  const name = job.focus ? `${job.title} (${job.focus})` : job.title;
  return {
    id: job.slug, name, org: job.family, index: "",
    summary: job.summary, description: job.summary,
    note: `Địa điểm: ${job.location}.`,
    kicker: "Tuyển dụng THEHEGEO", checks: ["Công việc", "Yêu cầu", "Điểm cộng"],
    checkFoot: "Mô tả công việc", tag: "THEHEGEO / TUYỂN DỤNG",
    headline: [job.title, ""], stamp: ["JD", job.code], tone: "white", model: "folder", glyph: GLYPH[job.slug],
  };
}

/** The folder is an overview, not a copy of the JD: the facts, then what the work centres on and
 *  the skills it asks for, as tags. The full sections (duties, plus points, benefits…) are on the
 *  JD page. Long duties ("Area: detail…") give their area; short ones are used as they are. */
const area = (t: string) => (t.match(/^([^:]{2,48}):\s/)?.[1] ?? t).replace(/\.$/, "");

function JobBrief({ job }: { job: Job }) {
  const focus = job.areas ?? (job.duties.every((d) => d.length <= 48 || /^[^:]{2,48}:\s/.test(d)) ? job.duties.slice(0, 6).map(area) : []);
  const skills = job.skills ?? job.requirements;
  return <div className="job-brief">
    <dl className="job-brief-facts">
      <div><dt>Vị trí</dt><dd>{job.family}</dd></div>
      <div><dt>Địa điểm</dt><dd>{job.location}</dd></div>
    </dl>
    {focus.length > 0 && <div className="job-brief-tags">
      <h3>Trọng tâm công việc</h3>
      <ul>{focus.map(f => <li key={f}>{f}</li>)}</ul>
    </div>}
    <div className="job-brief-tags is-skills">
      <h3>Kỹ năng chính</h3>
      <ul>{skills.map(k => <li key={k}>{k}</li>)}</ul>
    </div>
  </div>;
}

export function JobList() {
  const families = [...new Set(JOBS.map(j => j.family))];
  const [family, setFamily] = useState(ALL);
  const shown = family === ALL ? JOBS : JOBS.filter(j => j.family === family);
  const count = (f: string) => (f === ALL ? JOBS : JOBS.filter(j => j.family === f)).length;
  return <>
    <h2>Vị trí đang tuyển</h2>
    <div className="job-filter" role="group" aria-label="Lọc theo vị trí">
      {[ALL, ...families].map(f => <button key={f} type="button" aria-pressed={f === family} onClick={() => setFamily(f)}>
        {f} <span className="job-filter-count">{count(f)}</span>
      </button>)}
    </div>
    <ul className="job-list job-folders">
      {shown.map(job => <li key={job.slug}>
        <ProjectCase data={jobFolder(job)} reading={<JobBrief job={job} />} moreHref={`/tuyen-dung/${job.slug}/`} applyHref={applyHref(job)} />
      </li>)}
    </ul>
  </>;
}
