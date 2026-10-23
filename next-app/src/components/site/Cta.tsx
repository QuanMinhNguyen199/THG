import Link from "next/link";
import defaultCta from "@/content/globals/cta.json";
import type { CtaContent } from "@/content/blocks";
import { Lines } from "./Sections";

/** Closing call to action, placed between the case studies and the footer. */
export function Cta({ data: cta = defaultCta, id = "cta", titleId = "cta-title" }: { data?: CtaContent; id?: string; titleId?: string }) {
  return (
    <section className="cta" id={id} aria-labelledby={titleId}>
      <div className="wrap cta-inner">
        <h2 id={titleId}>
          <Lines lines={cta.title.map(line => line.text)} />
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
