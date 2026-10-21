"use client";

import { useState } from "react";
import { JOBS, applyHref, type Job } from "./catalog";
import { ProjectCase } from "./Applications";
import type { CaseData } from "./cases";

const ALL = "Tất cả vị trí";

function jobFolder(job: Job): CaseData {
  const name = job.focus ? `${job.title} (${job.focus})` : job.title;
  return {
    id: job.slug, name, org: job.family, index: "JD",
    summary: job.summary, description: job.summary,
    note: `Địa điểm: ${job.location}.`,
    kicker: "Tuyển dụng THEHEGEO", checks: ["Công việc", "Yêu cầu", "Điểm cộng"],
    checkFoot: "Mô tả công việc", tag: "THEHEGEO / TUYỂN DỤNG",
    headline: [job.title, ""], stamp: ["JD", job.code], tone: "white", model: "folder",
  };
}

/** The folder is a brief: what the role does (under its title), the facts a candidate checks first
 *  and the skills it asks for. Everything else is on the full JD page. */
function JobBrief({ job }: { job: Job }) {
  // A list of short skills reads as one line; a list of sentences shows its first one.
  const short = job.requirements.every((r) => r.length <= 40);
  return <div className="job-brief">
    <dl className="job-brief-facts">
      <div><dt>Vị trí</dt><dd>{job.family}</dd></div>
      <div><dt>Địa điểm</dt><dd>{job.location}</dd></div>
    </dl>
    <dl className="job-brief-points">
      <div><dt>{short ? "Kỹ năng cần có" : "Yêu cầu chính"}</dt><dd>{short ? job.requirements.join(" · ") : job.requirements[0]}</dd></div>
    </dl>
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
