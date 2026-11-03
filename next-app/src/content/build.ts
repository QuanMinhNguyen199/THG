// Turns the stored content (JSON in the shape the CMS edits: arrays of objects, blockType, optional
// fields left out) into what the components render (catalog types), and back. Pure: no JSON imports,
// so Node scripts and tests can use it as well as the site and the editor's live preview.
import type { Block, Model, Page } from "../components/site/sections/shared.ts";
import type { Job } from "../components/site/sections/jobs.ts";

type Text = { text: string };
type Row = Record<string, unknown>;
export type RawBlock = Row & { id: string; blockType: string };
export type RawPage = {
  name: string;
  kind?: string;
  title: string;
  en?: string;
  lead?: string;
  image?: string;
  model?: (Row & { blockType: string })[];
  blocks: RawBlock[];
  cta?: { label: string; href?: string }[];
};
export type RawJob = Row;
export type RawWays = { title: string; items: { title: string; body: string }[] };

const texts = (a: unknown) => ((a as Text[] | undefined) ?? []).map((t) => t.text);
const toTexts = (a: string[]) => a.map((text) => ({ text }));
/** A field left empty in the editor (null, "") reads as absent, as it was in the catalog. */
const has = (v: unknown) => v !== undefined && v !== null && v !== "";
const s = (v: unknown) => (has(v) ? String(v) : undefined);

/** Drops keys whose value is undefined, so built objects equal the hand-written ones. */
function clean<T>(o: T): T {
  if (Array.isArray(o)) return o.map(clean) as T;
  if (o && typeof o === "object") return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, clean(v)])) as T;
  return o;
}
const link = (r: Row) => (has(r.linkHref) ? { href: String(r.linkHref), label: String(r.linkLabel ?? "") } : undefined);

/** What a page needs from outside itself: shared blocks and the pages a project index lists. */
export type Context = { ways: RawWays; partners: { group: string; names: string[] }[]; projects: () => Block[] };

export function blockFromRaw(r: RawBlock, ctx: Context): Block[] {
  return blocksOf(r, ctx).map((b, i) => (i === 0 ? { ...b, key: r.id } : b));
}

function blocksOf(r: RawBlock, ctx: Context): Block[] {
  const title = s(r.title);
  switch (r.blockType) {
    case "cards":
      return [{ type: "cards", title, items: (r.items as Row[]).map((i) => ({ title: String(i.title), body: s(i.body), href: s(i.href), cta: s(i.cta), image: s(i.image) })) }];
    case "table":
      return [{
        type: "table",
        title,
        head: texts(r.head),
        rows: (r.rows as Row[]).map((row) => (row.cells as Row[]).map((c) => (has(c.href) ? { text: String(c.text), href: String(c.href) } : String(c.text)))),
        by: r.by === "column" ? "column" : undefined,
      }];
    case "steps":
      return [{ type: "steps", title, flow: r.flow ? true : undefined, items: (r.items as Row[]).map((i) => ({ title: String(i.title), body: s(i.body) })), note: s(r.note) }];
    case "list":
      return [{ type: "list", title, items: (r.items as Row[]).map((i) => ({ title: s(i.title), body: String(i.body), href: s(i.href) })) }];
    case "text":
      return [{ type: "text", title, body: texts(r.body), link: link(r) }];
    case "pills":
    case "layers":
    case "values":
      return [{ type: r.blockType, title, items: texts(r.items) }];
    case "timeline":
      return [{ type: "timeline", title, items: (r.items as Row[]).map((i) => ({ year: String(i.year), label: String(i.label) })) }];
    case "partners":
      return [{ type: "partners", title, groups: ctx.partners }];
    case "callout":
      return [{ type: "callout", title, body: String(r.body), detail: s(r.detail), en: s(r.en) }];
    case "rings":
      return [{ type: "rings", title, statement: String(r.statement), body: String(r.body), items: texts(r.items) }];
    case "case":
      return [{ type: "case", title, id: String(r.caseId) }];
    case "project": {
      const dossier = ["period", "status", "scope", "role"].some((k) => has(r[k])) ? { period: String(r.period ?? ""), status: String(r.status ?? ""), scope: String(r.scope ?? ""), role: String(r.role ?? "") } : undefined;
      return [{ type: "project", title: String(r.title), client: String(r.client), problem: String(r.problem), solution: texts(r.solution), result: String(r.result), dossier, link: link(r) }];
    }
    case "contact":
      return [{ type: "contact" }];
    case "jobs":
      return [{ type: "jobs" }];
    case "waysOfWorking":
      return [{ type: "cards", title: ctx.ways.title, items: ctx.ways.items.map((i) => ({ title: i.title, body: i.body })) }];
    case "projectIndex":
      return ctx.projects();
    default:
      throw new Error(`Unknown block type ${r.blockType}`);
  }
}

function modelFromRaw(m: Row & { blockType: string }): Model {
  switch (m.blockType) {
    case "core": return { kind: "core" };
    case "bridge": return { kind: "bridge", labels: texts(m.labels) as [string, string, string, string] };
    case "devices": return { kind: "devices", items: texts(m.items) };
    case "phone": return { kind: "phone", title: String(m.title), caller: String(m.caller), script: (m.script as Row[]).map((l) => ({ who: l.who as "in" | "agent", text: String(l.text) })) };
    case "stack": return { kind: "stack", layers: (m.layers as Row[]).map((l) => ({ label: String(l.label), chips: (l.chips as Text[] | undefined)?.length ? texts(l.chips) : undefined })) };
    default: throw new Error(`Unknown model ${m.blockType}`);
  }
}

export function pageFromRaw(slug: string, r: RawPage, ctx: Context): Page {
  const cta = (r.cta ?? []).map((a) => clean({ label: a.label, href: s(a.href) }));
  return clean({
    slug,
    name: r.name,
    kind: s(r.kind),
    title: r.title,
    en: s(r.en),
    lead: s(r.lead),
    // A section switched off in the editor is left out; `key` ties each shown block to its stored one.
    blocks: r.blocks.filter((b) => b.enabled !== false).flatMap((b) => blockFromRaw(b, ctx)),
    cta: cta.length === 0 ? undefined : cta.length === 1 ? cta[0] : cta,
    image: s(r.image),
    model: r.model?.[0] ? modelFromRaw(r.model[0]) : undefined,
  });
}

export function jobFromRaw(slug: string, r: RawJob): Job {
  const list = (k: string) => ((r[k] as Text[] | undefined)?.length ? texts(r[k]) : undefined);
  return clean({
    slug,
    title: String(r.title),
    focus: s(r.focus),
    code: String(r.code),
    family: String(r.family),
    summary: String(r.summary),
    intro: String(r.intro),
    duties: texts(r.duties),
    requirements: texts(r.requirements),
    plus: texts(r.plus),
    benefits: texts(r.benefits),
    location: String(r.location),
    subject: s(r.subject),
    skills: list("skills"),
    areas: list("areas"),
  }) as Job;
}

// ── Back to the stored shape (used once, to move the catalog into JSON) ──────────────────────

const omit = (o: Row) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

export function blockToRaw(b: Block, id: string): RawBlock {
  const base = { id, blockType: b.type as string, title: "title" in b ? b.title : undefined };
  switch (b.type) {
    case "cards": return omit({ ...base, items: b.items.map((i) => omit({ ...i })) }) as RawBlock;
    case "table": return omit({ ...base, by: b.by, head: toTexts(b.head), rows: b.rows.map((r) => ({ cells: r.map((c) => (typeof c === "string" ? { text: c } : { text: c.text, href: c.href })) })) }) as RawBlock;
    case "steps": return omit({ ...base, flow: b.flow, items: b.items.map((i) => omit({ ...i })), note: b.note }) as RawBlock;
    case "list": return omit({ ...base, items: b.items.map((i) => omit({ ...i })) }) as RawBlock;
    case "text": return omit({ ...base, body: toTexts(b.body), linkLabel: b.link?.label, linkHref: b.link?.href }) as RawBlock;
    case "pills": case "layers": case "values": return omit({ ...base, items: toTexts(b.items) }) as RawBlock;
    case "timeline": return omit({ ...base, items: b.items }) as RawBlock;
    case "partners": return omit(base) as RawBlock;
    case "callout": return omit({ ...base, body: b.body, detail: b.detail, en: b.en }) as RawBlock;
    case "rings": return omit({ ...base, statement: b.statement, body: b.body, items: toTexts(b.items) }) as RawBlock;
    case "case": return omit({ ...base, caseId: b.id }) as RawBlock;
    case "project": return omit({ ...base, client: b.client, problem: b.problem, solution: toTexts(b.solution), result: b.result, ...b.dossier, linkLabel: b.link?.label, linkHref: b.link?.href }) as RawBlock;
    case "contact": case "jobs": return { id, blockType: b.type };
  }
}

export function modelToRaw(m: Model): Row & { blockType: string } {
  switch (m.kind) {
    case "core": return { blockType: "core" };
    case "bridge": return { blockType: "bridge", labels: toTexts(m.labels) };
    case "devices": return { blockType: "devices", items: toTexts(m.items) };
    case "phone": return { blockType: "phone", title: m.title, caller: m.caller, script: m.script };
    case "stack": return { blockType: "stack", layers: m.layers.map((l) => omit({ label: l.label, chips: l.chips && toTexts(l.chips) })) };
  }
}

export function jobToRaw(j: Job): RawJob {
  const { slug: _slug, duties, requirements, plus, benefits, skills, areas, ...rest } = j;
  return omit({ ...rest, duties: toTexts(duties), requirements: toTexts(requirements), plus: toTexts(plus), benefits: toTexts(benefits), skills: skills && toTexts(skills), areas: areas && toTexts(areas) });
}
