/** Serializable content contract. Replace with generated Payload types when CMS is connected. */
export type Metric = { to: number; label: string; pad?: number | null; prefix?: string | null; suffix?: string | null; unit?: string | null };
export type CtaContent = { title: { text: string }[]; question: string; body: string; action: string; href: string };
type Base = { id: string; enabled?: boolean | null; anchor?: string | null };
export type PageBlock = Base & (
  | { blockType: "homeHero"; heading: string }
  | { blockType: "metrics"; label: string; items: Metric[] }
  | { blockType: "partners"; title: string; items: { name: string }[]; linkLabel: string; href: string }
  | { blockType: "coreShowcase"; kicker: string; title: string; highlight: string; items: { product: string; label: string }[]; linkLabel: string; href: string }
  | { blockType: "agentDemo"; kicker: string; title: string; highlight: string; body: string }
  | { blockType: "navigationTiles"; title: string; highlight: string; items: { href: string; label: string; image?: string | null; size: "normal" | "wide"; items: { text: string }[] }[] }
  | ({ blockType: "cta" } & CtaContent)
);
export type PageDocument = { slug: string; title: string; layout: PageBlock[] };
