// Static sections: no state, so they render as server components.
import { Fragment } from "react";
import { pillars } from "./content";

const pillarIcons = [
  <svg key="0" viewBox="0 0 64 64">
    <path d="M18 41H12a10 10 0 0 1-2-20 15 15 0 0 1 29-5 12 12 0 0 1 14 17M21 29h30v22H21zM36 51v8m-9 0h18" />
  </svg>,
  <svg key="1" viewBox="0 0 64 64">
    <path d="M30 9c-8-6-16 0-15 8-10 1-12 12-6 17-6 8 0 18 8 17 1 9 11 10 13 3ZM30 20H20m10 14H15m15 13H20m19-33h10v12H39m0 12h15m-15 13h10V39M39 8v49" />
    <circle cx="53" cy="14" r="3" />
    <circle cx="57" cy="38" r="3" />
  </svg>,
  <svg key="2" viewBox="0 0 64 64">
    <path d="m32 5 24 14v27L32 60 8 46V19Zm0 0v55M8 19l48 27m0-27L8 46m0-27 24 27 24-27M8 46l24-27 24 27" />
    <circle cx="32" cy="5" r="3" />
    <circle cx="8" cy="19" r="3" />
    <circle cx="56" cy="46" r="3" />
  </svg>,
];

/** Renders ["a", "b"] as a<br />b. */
export function Lines({ lines }: { lines: string[] }) {
  return lines.map((line, i) => (
    <Fragment key={line}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));
}

export function Control() {
  return (
    <section className="control" id="control">
      <div className="wrap">
        <div className="section-heading">
          <h2>
            Ba trụ cột kiểm soát<span>.</span>
          </h2>
          <p>
            AI hỗ trợ.
            <br />
            Con người chịu trách nhiệm cuối cùng.
          </p>
        </div>
        <div className="pillars">
          {pillars.map((pillar, i) => (
            <article key={pillar.foot}>
              {pillarIcons[i]}
              <h3>
                <Lines lines={pillar.title} />
              </h3>
              <p>{pillar.body}</p>
              <span className="pillar-foot">{pillar.foot}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
