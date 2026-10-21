// The site's top navigation and the GEOagents page outline (detail pages live in catalog.ts).

/** The GEOagents page is the long product page (the former home page); its sections are its own. */
export const GEOAGENTS = {
  slug: "geoagents",
  label: "GEOagents",
  sections: [
    "4 tầng: Quản trị · Quản lý · Thực thi · Dịch vụ",
    "Chatbot · Agent · Cowork · Assistant",
    "Bên dưới bề mặt: workflow, tri thức, mô hình, dữ liệu, bảo mật",
    "AI hỗ trợ, con người quyết định",
    "Chủ quyền & an toàn dữ liệu",
    "Đặt lịch",
  ],
};

/** Top navigation: Home, then the corporate sections. Each section with detail pages carries them
 *  (catalog.ts) for its dropdown. */
import { SECTIONS } from "./catalog";

export type NavItem = { href: string; label: string; children?: { href: string; label: string; kind: string }[] };
const withChildren = (key: keyof typeof SECTIONS): NavItem => ({
  href: SECTIONS[key].base,
  label: SECTIONS[key].title,
  children: SECTIONS[key].pages.map((p) => ({ href: `${SECTIONS[key].base}${p.slug}/`, label: p.name, kind: p.kind ?? "" })),
});
export const NAV: NavItem[] = [
  { href: "/", label: "Trang chủ" },
  // The full GEOagents product page is its own tab.
  { href: `/${GEOAGENTS.slug}/`, label: GEOAGENTS.label },
  withChildren("giai-phap"),
  { ...withChildren("ung-dung"), label: "Use Case" },
  withChildren("ve-thehegeo"),
  { href: "/tuyen-dung/", label: "Tuyển dụng" },
];

