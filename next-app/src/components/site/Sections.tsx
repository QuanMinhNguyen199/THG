// Shared static helpers.
import { Fragment } from "react";

/** Renders ["a", "b"] as a<br />b. */
export function Lines({ lines }: { lines: string[] }) {
  return lines.map((line, i) => (
    <Fragment key={line}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));
}
