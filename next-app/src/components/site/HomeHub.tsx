// Home: a showcase of the whole site. The film and company line, the key figures, the GEO core in
// 3D, a simulated GEO Agent clip, then one tile per area of the site (sitemap.ts). All copy is the
// site's existing copy; tiles list what each page covers.
import Link from "next/link";
import { asset } from "@/lib/asset";
import { layers } from "./content";
import { HomeCore } from "./HomeCore";
import { HomeDemo } from "./HomeDemo";
import { HomeHero } from "./HomeHero";
import { Metrics } from "./Metrics";
import { ABOUT, APPS, PARTNERS, SOLUTIONS } from "./catalog";
import { PartnerMark } from "./PartnerMark";
import { GEOAGENTS } from "./sitemap";

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

// Picture tiles first (larger), then text tiles: the corporate sections and what each covers.
const TILES = [
  { href: "/geoagents/", label: "GEOagents", items: GEOAGENTS.sections.slice(0, 4), image: "/media/case-city.jpg", size: "is-wide" },
  { href: "/giai-phap/", label: "Giải pháp", items: SOLUTIONS.map((p) => p.name), size: "" },
  { href: "/ung-dung/", label: "Ứng dụng", items: APPS.map((p) => `${p.name}: ${p.kind}`), image: "/media/case-tax.jpg", size: "" },
  { href: "/ve-thehegeo/", label: "Về THEHEGEO", items: ["Câu chuyện TheheGEO", ...ABOUT.map((p) => p.name)], size: "" },
  { href: "/tuyen-dung/", label: "Tuyển dụng", items: ["Vị trí đang tuyển", "Gửi CV"], size: "" },
];

export function HomeHub() {
  return (
    <>
      <HomeHero />
      <Metrics />

      {/* the partner strip (Về THEHEGEO › Đối tác và Khách hàng) */}
      <section className="wrap home-partners" aria-labelledby="home-partners-title">
        <h2 id="home-partners-title">Những đơn vị đã cùng làm việc với Thehegeo</h2>
        {/* A carousel that drifts on its own: the list twice in a row, the track moving by one copy,
            so it loops without a seam. It is a display strip (no pointer or touch input) and stands still
            (wrapped into rows) for reduced motion. The second copy is hidden from assistive tech. */}
        <div className="partner-marquee">
          <div className="partner-track">
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1 || undefined}>
                {PARTNERS.flatMap((g) => g.names).map((n) => (
                  <li key={n}>
                    <PartnerMark name={n} eager />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <Link className="home-link" href="/ve-thehegeo/doi-tac/" scroll={false}>
          Xem đối tác và khách hàng <Arrow />
        </Link>
      </section>

      {/* the GEO core, in 3D */}
      <section className="wrap home-split" id="home-showcase" aria-labelledby="home-core-title">
        <div className="home-split-copy">
          <p className="home-kicker">GEOAGENTS</p>
          <h2 id="home-core-title">
            Một hệ thống.
            <br />
            <span>4 tầng tổ chức.</span>
          </h2>
          <ul className="home-tiers">
            {layers.map((l) => (
              <li key={l.tab}>
                <strong>{l.product}</strong>
                <span>{l.tab}</span>
              </li>
            ))}
          </ul>
          <Link className="home-link" href="/geoagents/" scroll={false}>
            Xem GEOagents <Arrow />
          </Link>
        </div>
        <HomeCore />
      </section>

      {/* the simulated clip */}
      <section className="wrap home-split is-reverse" aria-labelledby="home-demo-title">
        <HomeDemo />
        <div className="home-split-copy">
          <p className="home-kicker">AI HỖ TRỢ, CON NGƯỜI QUYẾT ĐỊNH</p>
          <h2 id="home-demo-title">
            Từ công văn đến
            <br />
            <span>phê duyệt.</span>
          </h2>
          <p className="home-lead">
            GEO Agent bóc tách nhiệm vụ từ công văn đến và đề xuất người phụ trách. Cán bộ xem xét và
            phê duyệt.
          </p>
        </div>
      </section>

      {/* every area of the site */}
      <section className="wrap home-tiles" aria-labelledby="home-tiles-title">
        <h2 id="home-tiles-title" className="home-tiles-title">
          Khám phá <span>THEHEGEO.</span>
        </h2>
        <div className="home-grid">
          {TILES.map((t) => (
            <Link key={t.href} href={t.href} scroll={false} className={`home-tile ${t.size}${t.image ? " has-image" : ""}`}>
              {t.image && <img src={asset(t.image)} alt="" loading="lazy" />}
              <span className="home-tile-body">
                <span className="home-tile-head">
                  <strong>{t.label}</strong>
                  <Arrow />
                </span>
                <ul>
                  {t.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
