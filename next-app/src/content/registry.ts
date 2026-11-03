// Every editable content document: where it is stored, which schema edits it, and which site path
// shows it. buildContent() turns the stored documents into what the site renders, for the published
// site (published.ts) and for the content editor's live preview (with drafts laid over them).
import type { Block, Page } from "../components/site/sections/shared.ts";
import type { Job } from "../components/site/sections/jobs.ts";
import { PARTNERS } from "../components/site/sections/partners.ts";
import type { CtaContent, Film, Metric } from "./blocks.ts";
import type { CaseData } from "../components/site/cases.ts";
import { caseFromRaw, jobFromRaw, pageFromRaw, type Context, type RawCase, type RawJob, type RawPage, type RawWays } from "./build.ts";

/** The corporate sections, their pages in menu order. Each page needs its route folder too. */
export const SECTION_PAGES = {
  "giai-phap": { title: "Giải pháp", base: "/giai-phap/", pages: ["ai", "aiot", "cong-nghe", "tu-van"] },
  "ung-dung": { title: "Ứng dụng", base: "/ung-dung/", pages: ["hkd", "a360", "ai-platform", "quan-ly-du-an"] },
  "ve-thehegeo": { title: "Về THEHEGEO", base: "/ve-thehegeo/", pages: ["kinh-nghiem-du-an", "su-menh-tam-nhin", "doi-tac", "lien-he"] },
} as const;
export type SectionKey = keyof typeof SECTION_PAGES;
/** Case studies, each shown where a page picks it: `shownAt` is a page that does, to open it there. */
export const CASES = { tdn: "/geoagents", "dich-vu-cong": undefined, "quan-ly-du-an": "/ung-dung/quan-ly-du-an", "ai-platform": undefined } as const;

/** Which schema (generated into src/content/payload/<schema>.json) edits a document. */
export type Schema = "pages" | "corporate" | "jobs" | "header" | "footer" | "ways" | "geoagents" | "case";
/** `path` is the page a document is; `shownAt`, a page that shows a shared document (to open it there);
 *  `item`, the row of a list document a page is (a posting's page is its row in the postings list). */
export type Doc = { key: string; label: string; file: string; schema: Schema; path?: string; shownAt?: string; item?: string };

const corporate = (key: string, label: string, file: string, path: string): Doc => ({ key, label, file, schema: "corporate", path });

/** The documents, keyed by `key`: globals first, then each page by its path. */
export const DOCS: Doc[] = [
  { key: "header", label: "Header", file: "src/content/globals/header.json", schema: "header" },
  { key: "footer", label: "Footer", file: "src/content/globals/footer.json", schema: "footer" },
  { key: "ways", label: "Cách chúng tôi làm việc", file: "src/content/globals/ways-of-working.json", schema: "ways", shownAt: "/ve-thehegeo/su-menh-tam-nhin" },
  { key: "page:/", label: "Trang chủ", file: "src/content/pages/home.json", schema: "pages", path: "/" },
  { key: "page:/geoagents", label: "GEOagents", file: "src/content/pages/geoagents.json", schema: "geoagents", path: "/geoagents" },
  ...Object.entries(SECTION_PAGES).flatMap(([key, s]) => [
    corporate(`page:/${key}`, s.title, `src/content/pages/${key}.json`, `/${key}`),
    ...s.pages.map((slug) => corporate(`page:/${key}/${slug}`, slug, `src/content/pages/${key}/${slug}.json`, `/${key}/${slug}`)),
  ]),
  corporate("page:/tuyen-dung", "Tuyển dụng", "src/content/pages/tuyen-dung.json", "/tuyen-dung"),
  ...Object.entries(CASES).map(([id, shownAt]): Doc => ({ key: `case:${id}`, label: `Case study ${id}`, file: `src/content/cases/${id}.json`, schema: "case", shownAt })),
  // Every posting, one list: adding a row adds a posting and its page (/tuyen-dung/<slug>/).
  { key: "jobs", label: "Tin tuyển dụng", file: "src/content/jobs.json", schema: "jobs", shownAt: "/tuyen-dung" },
];

/** The document a site path shows (paths as usePathname gives them, without the base path). */
export function docAt(path: string): Doc | undefined {
  const p = path.replace(/\/$/, "") || "/";
  const posting = /^\/tuyen-dung\/([^/]+)$/.exec(p);
  if (posting) return { ...DOCS.find((d) => d.key === "jobs")!, path: p, item: posting[1] };
  return DOCS.find((d) => d.path === p);
}

export type NavItem = { href: string; label: string; children?: { href: string; label: string; kind: string }[] };
export type Footer = { tagline: string; taglineHighlight: string; email: string; phone: string; phoneHref: string; address: string; copyright: string; motto: string; wordmark: string };
export type Section = { title: string; base: string; home: Page; pages: Page[] };
type Lines = { title: string; highlight: string; intro: string; introLine2: string };
type Tier = { tab: string; product: string; body: string };
/** The GEOagents page: its sections' copy, in page order. A tier's `floor` is its name in capitals. */
export type Geoagents = {
  hero: { title: string; highlight: string; subtitle: string; description: string; primaryLabel: string; secondaryLabel: string; secondaryHref: string } & Film;
  metrics: { label: string; items: Metric[] };
  architecture: Lines & { captionLeft: string; captionRight: string; layers: (Tier & { floor: string })[] };
  applications: Lines;
  careers: { title: string; highlight: string; body: string; apply: string; action: string; subject: string };
  cta: CtaContent;
};
type RawGeoagents = Omit<Geoagents, "architecture"> & { architecture: Omit<Geoagents["architecture"], "layers"> & { layers: Tier[] } };
export type Content = {
  sections: Record<SectionKey, Section>;
  jobsHome: Page;
  jobs: Job[];
  nav: NavItem[];
  footer: Footer;
  geoagents: Geoagents;
  cases: Record<string, CaseData>;
};

/** Experience lists every project of the Use Case pages; dates and roles are not supplied yet. */
function projectIndex(apps: Page[]): Block[] {
  return apps.flatMap((page) =>
    page.blocks
      .filter((block): block is Extract<Block, { type: "project" }> => block.type === "project")
      .map((block) => ({
        ...block,
        dossier: { period: "Đang cập nhật", status: "Đang cập nhật", scope: "Đang cập nhật", role: "Đang cập nhật" },
        link: { label: "Xem Use Case chi tiết", href: `/ung-dung/${page.slug}/` },
      })),
  );
}

/** Builds what the site renders from stored documents keyed as in DOCS. */
export function buildContent(raw: Record<string, unknown>): Content {
  const get = <T,>(key: string) => {
    if (!(key in raw)) throw new Error(`Missing content document ${key}`);
    return raw[key] as T;
  };
  let apps: Page[] = [];
  const ctx: Context = { ways: get<RawWays>("ways"), partners: PARTNERS, projects: () => projectIndex(apps) };
  const section = (key: SectionKey): Section => {
    const s = SECTION_PAGES[key];
    return {
      title: s.title,
      base: s.base,
      home: pageFromRaw("", get<RawPage>(`page:/${key}`), ctx),
      pages: s.pages.map((slug) => pageFromRaw(slug, get<RawPage>(`page:/${key}/${slug}`), ctx)),
    };
  };
  // Use Case first: Về THEHEGEO's experience page lists its projects.
  const appsSection = section("ung-dung");
  apps = appsSection.pages;
  const sections = { "giai-phap": section("giai-phap"), "ung-dung": appsSection, "ve-thehegeo": section("ve-thehegeo") };

  const header = get<{ nav: { label: string; href: string; menu?: string | null }[] }>("header");
  const nav = header.nav.map((item): NavItem => {
    const s = item.menu ? sections[item.menu as SectionKey] : undefined;
    return s
      ? { href: item.href, label: item.label, children: s.pages.map((p) => ({ href: `${s.base}${p.slug}/`, label: p.name, kind: p.kind ?? "" })) }
      : { href: item.href, label: item.label };
  });
  const f = get<Omit<Footer, "phoneHref">>("footer");
  const geo = get<RawGeoagents>("page:/geoagents");
  return {
    sections,
    jobsHome: pageFromRaw("", get<RawPage>("page:/tuyen-dung"), ctx),
    jobs: get<{ jobs: RawJob[] }>("jobs").jobs.map((r) => jobFromRaw(String(r.slug), r)),
    nav,
    footer: { ...f, phoneHref: `tel:+${f.phone.replace(/\D/g, "")}` },
    cases: Object.fromEntries(Object.keys(CASES).map((id) => [id, caseFromRaw(id, get<RawCase>(`case:${id}`))])),
    geoagents: { ...geo, architecture: { ...geo.architecture, layers: geo.architecture.layers.map((l) => ({ ...l, floor: l.tab.toLocaleUpperCase("vi") })) } },
  };
}
