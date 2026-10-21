import Link from "next/link";
import { cta } from "./content";
import { Lines } from "./Sections";

/** Closing call to action, placed between the case studies and the footer. */
export function Cta() {
  return (
    <section className="cta" id="cta" aria-labelledby="cta-title">
      <div className="wrap cta-inner">
        <h2 id="cta-title">
          <Lines lines={cta.title} />
        </h2>
        <p className="cta-question">{cta.question}</p>
        <p className="cta-body">{cta.body}</p>
        <Link className="button cta-button" href={cta.href} scroll={false}>
          {cta.action}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12h15m-6-6 6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
