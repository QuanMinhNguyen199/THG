import type { CSSProperties } from "react";
import { asset } from "@/lib/asset";
import { PARTNER_LOGOS } from "./catalog";

// Logos of every shape at one visual size: the height falls off with the width-to-height ratio
// (a square seal is tallest, a long wordmark shortest), and width and height are both capped.
const BASE_H = 60;
const MIN_H = 18;
const MAX_W = 180;
// Bumped when logo files are replaced under the same name, so browsers fetch the new file.
const VERSION = "3";

const width = (ratio: number) => {
  const h = Math.min(BASE_H, Math.max(MIN_H, BASE_H * Math.pow(ratio, -0.45)), MAX_W / ratio);
  return { "--logo-w": `${Math.round(h * ratio)}px` } as CSSProperties;
};

/** A partner's logo (the dark theme shows its `dark` version when it has one), or its name set as
 *  a wordmark when there is no logo. */
export function PartnerMark({ name, eager = false }: { name: string; /** load at once (the moving carousel) */ eager?: boolean }) {
  const logo = PARTNER_LOGOS[name];
  if (!logo)
    return (
      <span className="partner-mark is-name" title={name}>
        {name}
      </span>
    );
  const load = eager ? "eager" : "lazy";
  return (
    <span className={`partner-mark${logo.dark ? " has-dark" : ""}`} title={name}>
      <img src={`${asset(logo.src)}?v=${VERSION}`} alt={name} loading={load} decoding="async" style={width(logo.ratio)} />
      {logo.dark && (
        <img className="is-dark" src={`${asset(logo.dark)}?v=${VERSION}`} alt={name} loading={load} decoding="async" style={width(logo.darkRatio ?? logo.ratio)} />
      )}
    </span>
  );
}
