// THEHEGEO logo as vector geometry (generated from the measured raster; see README).
// Colours come from CSS: --logo-accent (red facets, "GEO"), --logo-facet (inner facets),
// --logo-star (the solid pentagon behind the pieces: the star and the gaps) and --logo-ink ("THE HE").
// The emblem keeps the same red / navy / white in every concept; only the wordmark ink changes.
// THEHEGEO is one word: every letter sits the same 24-unit gap from the next, word joints included.

const PENTAGON = "M299.1 559.9L10 349.9L120.4 10L477.8 10L588.2 349.9Z";
const MARK_ACCENT = "M299.1 559.9L426.8 467.2L299.1 431.6L171.4 467.2ZM10 349.9L137.7 442.7L132 310.2L58.8 199.8ZM120.4 10L71.7 160.1L195.9 113.8L278.3 10ZM477.8 10L320 10L402.4 113.8L526.6 160.1ZM588.2 349.9L539.5 199.8L466.2 310.2L460.5 442.7Z";
const MARK_INK = "M426.8 467.2L299.1 368.4L171.4 467.2L299.1 431.6ZM137.7 442.7L192.1 290.7L58.8 199.8L132 310.2ZM71.7 160.1L233 164.9L278.3 10L195.9 113.8ZM320 10L365.2 164.9L526.6 160.1L402.4 113.8ZM539.5 199.8L406.1 290.7L460.5 442.7L466.2 310.2Z";
const TEXT_ACCENT = "M1608.1 170.9h35v193h-35ZM1608.1 170.9h168v35h-168ZM1608.1 328.9h168v35h-168ZM1741.1 249.9h35v114h-35ZM1675.3 249.9h100.8v35h-100.8ZM1800.1 170.9h35v193h-35ZM1800.1 170.9h152v35h-152ZM1800.1 249.9h139.8v35h-139.8ZM1800.1 328.9h152v35h-152ZM1976.1 170.9h35v193h-35ZM2109.1 170.9h35v193h-35ZM1976.1 170.9h168v35h-168ZM1976.1 328.9h168v35h-168Z";
const TEXT_INK = "M660.1 170.9h172v35h-172ZM728.6 170.9h35v193h-35ZM856.1 170.9h35v193h-35ZM997.1 170.9h35v193h-35ZM856.1 249.9h176v35h-176ZM1056.1 170.9h35v193h-35ZM1056.1 170.9h152v35h-152ZM1056.1 249.9h139.8v35h-139.8ZM1056.1 328.9h152v35h-152ZM1232.1 170.9h35v193h-35ZM1373.1 170.9h35v193h-35ZM1232.1 249.9h176v35h-176ZM1432.1 170.9h35v193h-35ZM1432.1 170.9h152v35h-152ZM1432.1 249.9h139.8v35h-139.8ZM1432.1 328.9h152v35h-152Z";

export function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 2154.1 569.9" width="2154" height="570" aria-hidden="true" focusable="false">
      {/* The emblem is stroked in its own colour to soften its corners; the letters stay square. */}
      <g strokeLinejoin="round" strokeWidth={10}>
        <path d={PENTAGON} fill="var(--logo-star)" stroke="var(--logo-star)" />
        <path d={MARK_ACCENT} fill="var(--logo-accent)" stroke="var(--logo-accent)" />
        <path d={MARK_INK} fill="var(--logo-facet)" stroke="var(--logo-facet)" />
      </g>
      <path d={TEXT_ACCENT} fill="var(--logo-accent)" />
      <path d={TEXT_INK} fill="var(--logo-ink)" />
    </svg>
  );
}
