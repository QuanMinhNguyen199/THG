import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { SiteDocument } from "@/components/site/SiteDocument";
import { SiteShell } from "@/components/site/SiteShell";

// Any URL that matches no route. The app has two root layouts, so this page brings its own document.
export const metadata: Metadata = {
  title: "Không tìm thấy trang — THEHEGEO",
  description: "Địa chỉ này không có trên website THEHEGEO.",
};

export const viewport: Viewport = { themeColor: "#0A0A0A" };

const PATHS = [
  { href: "/", label: "Trang chủ" },
  { href: "/geoagents/", label: "GEOagents" },
  { href: "/giai-phap/", label: "Giải pháp" },
  { href: "/ung-dung/", label: "Use Case" },
  { href: "/ve-thehegeo/lien-he/", label: "Liên hệ" },
];

export default function GlobalNotFound() {
  return (
    <SiteDocument>
      <SiteShell subpage cta={false}>
        <div className="wrap page-head corp-head not-found">
          <p className="page-eyebrow">Lỗi 404</p>
          <h1>Không tìm thấy trang này</h1>
          <p className="corp-lead">Địa chỉ có thể đã đổi hoặc được gõ chưa đúng. Anh/chị có thể đi tiếp từ một trong các trang dưới đây.</p>
          <ul className="not-found-links">
            {PATHS.map((p) => (
              <li key={p.href}>
                <Link href={p.href}>{p.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </SiteShell>
    </SiteDocument>
  );
}
