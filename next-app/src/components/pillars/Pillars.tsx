import { pillars } from "@/content/site";
import { TiltCard } from "./TiltCard";

const icons = [
  // Sovereign infrastructure
  <path key="a" d="M6 18h16v8H6zM10 14h8v4h-8zM14 6v8M9 30h10" />,
  // Human in the loop
  <path key="b" d="M14 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10zM5 28c1-6 5-9 9-9s8 3 9 9M22 8l4-3M22 13h5" />,
  // Traceability
  <path key="c" d="M14 3l10 6v12l-10 6-10-6V9zM14 3v24M4 9l20 12M24 9 4 21" />,
];

export function Pillars() {
  return (
    <section aria-labelledby="pillars-title" className="relative isolate overflow-hidden px-6 py-28 md:px-12">
      {/* Something behind the glass so the blur reads: a soft red field and a faint grid. */}
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 h-[420px] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-crimson/20 blur-[120px]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />

      <div className="mx-auto max-w-6xl">
        <h2 id="pillars-title" className="font-display text-4xl font-medium md:text-5xl">
          Ba trụ cột kiểm soát<span className="text-crimson-bright">.</span>
        </h2>
        <p className="mt-4 max-w-md text-sm text-white/60">AI hỗ trợ. Con người chịu trách nhiệm cuối cùng.</p>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, i) => (
            <TiltCard key={pillar.title}>
              <article className="flex min-h-80 flex-col p-8">
                <svg viewBox="0 0 28 32" className="size-11 fill-none stroke-crimson-bright stroke-[1.2]" aria-hidden>
                  {icons[i]}
                </svg>
                <h3 className="mt-8 text-xl font-medium">{pillar.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/60">{pillar.body}</p>
                <span className="mt-auto border-t border-white/10 pt-5 font-mono text-[10px] tracking-[0.2em] text-white/50">
                  {pillar.foot}
                </span>
              </article>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
