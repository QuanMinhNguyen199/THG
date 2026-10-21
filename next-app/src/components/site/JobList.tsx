"use client";

import { useState } from "react";
import { APPLY_EMAIL, JOBS, type Job } from "./catalog";
import { ProjectCase } from "./Applications";
import type { CaseData } from "./cases";

const ALL = "Tất cả vị trí";

function jobFolder(job: Job): CaseData {
  return {
    id: job.slug, name: job.title, org: `${job.family}, nhóm ${job.team}`, index: "JD",
    summary: job.problem, description: job.problem,
    note: "Địa điểm, hình thức, số lượng và hạn nộp: đang cập nhật.",
    kicker: "Tuyển dụng THEHEGEO", checks: ["Công việc", "Yêu cầu", "Điểm cộng"],
    checkFoot: "Mô tả công việc", tag: "THEHEGEO / TUYỂN DỤNG",
    headline: [job.title, ""], stamp: ["JD", job.team], tone: "white", model: "folder",
  };
}

/** The folder is a brief: the facts a candidate checks first, then the one duty and one requirement
 *  that decide fit. Everything else is on the full JD page. */
function JobBrief({ job }: { job: Job }) {
  return <div className="job-brief">
    <dl className="job-brief-facts">
      <div><dt>Vị trí</dt><dd>{job.family}</dd></div>
      <div><dt>Nhóm</dt><dd>{job.team}</dd></div>
      <div><dt>Địa điểm</dt><dd className="is-pending">Đang cập nhật</dd></div>
    </dl>
    <dl className="job-brief-points">
      <div><dt>Việc chính</dt><dd>{job.duties[0]}</dd></div>
      <div><dt>Yêu cầu chính</dt><dd>{job.requirements[0]}</dd></div>
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
        <ProjectCase data={jobFolder(job)} reading={<JobBrief job={job} />} moreHref={`/tuyen-dung/${job.slug}/`}
          applyHref={`mailto:${APPLY_EMAIL}?subject=${encodeURIComponent(`Ứng tuyển: ${job.title}`)}`} />
      </li>)}
    </ul>
  </>;
}
