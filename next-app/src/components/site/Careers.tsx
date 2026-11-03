"use client";

// Recruitment section of the GEOagents page; its copy is content (pages/geoagents.json).
import { useContent } from "../cms/EditorBridge";

// TODO(unconfirmed): open positions and a dedicated recruitment address have not been provided.
// Until they are, the section invites applications to the general contact address and lists no
// specific roles rather than inventing them.

/** The application call (also the "Vị trí đang tuyển" section of the recruitment page). */
export function CareersApply() {
  const { geoagents, footer } = useContent();
  const { careers } = geoagents;
  return (
    <div className="careers-apply">
      <p>{careers.apply}</p>
      <a className="button" href={`mailto:${footer.email}?subject=${encodeURIComponent(careers.subject)}`}>
        {careers.action}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      </a>
    </div>
  );
}

export function Careers() {
  const { careers } = useContent().geoagents;
  return (
    <section className="careers wrap" id="careers" aria-labelledby="careers-title">
      <div className="section-heading">
        <h2 id="careers-title">
          {careers.title}
          <br />
          <span>{careers.highlight}</span>
        </h2>
        <p>{careers.body}</p>
      </div>
      <CareersApply />
    </section>
  );
}
