// Corporate page templates (content in catalog.ts): a page heading, then its blocks in order, then
// the page's own call to action. Section landing pages, detail pages and job descriptions all use it.
import Link from "next/link";
import { asset } from "@/lib/asset";
import { CaseShowcase } from "./CaseShowcase";
import { MOCK_CASES } from "./cases";
import { APPLY_EMAIL, JOBS, SECTIONS, type Block, type Cell, type Job, type Page, type SectionKey } from "./catalog";
import { ContactForm } from "./ContactForm";
import { ContactList } from "./Contacts";
import { JobList } from "./JobList";
import { BlockMotion, PageModel } from "./PageModels";
import { PartnerMark } from "./PartnerMark";

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

/** An internal page link, or a plain anchor for in-page and mail links. */
function Go({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (href.startsWith("#") || href.startsWith("mailto:"))
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  return (
    <Link href={href} scroll={false} className={className}>
      {children}
    </Link>
  );
}

const text = (c: Cell) => (typeof c === "string" ? c : c.text);

/**
 * A table as cards. By row: the first cell is the card's title, the other cells are labelled by the
 * column heads, and a link cell turns the whole card into that link. By column: each column is a
 * card; when the first head is empty the first column labels the values, otherwise they are a list.
 */
function TableCards({ block }: { block: Extract<Block, { type: "table" }> }) {
  type Card = { title: string; fields: [string, string][]; items?: string[]; link?: { text: string; href: string } };
  let cards: Card[];
  if (block.by === "column") {
    const labelled = block.head[0] === "";
    const cols = block.head.map((_, c) => c).filter((c) => !labelled || c > 0);
    cards = cols.map((c) =>
      labelled
        ? { title: block.head[c], fields: block.rows.map((r) => [text(r[0]), text(r[c])] as [string, string]) }
        : { title: block.head[c], fields: [], items: block.rows.map((r) => text(r[c])) },
    );
  } else {
    cards = block.rows.map((r) => {
      const link = r.find((c): c is { text: string; href: string } => typeof c !== "string");
      const fields = r.slice(1).flatMap((c, i) => (typeof c === "string" ? [[block.head[i + 1], c] as [string, string]] : []));
      return { title: text(r[0]), fields, link };
    });
  }
  return (
    <ul className={`fact-cards${cards.length > 3 ? " is-many" : ""}`}>
      {cards.map((card) => {
        const body = (
          <>
            <strong className="fact-card-title">{card.title}</strong>
            {card.fields.length > 0 && (
              <dl>
                {card.fields.map(([k, v]) => (
                  <div key={k + v}>
                    {k && <dt>{k}</dt>}
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {card.items && (
              <ul className="fact-card-items">
                {card.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            )}
            {card.link && (
              <span className="corp-more">
                {card.link.text} <Arrow />
              </span>
            )}
          </>
        );
        return (
          <li key={card.title}>
            {card.link ? (
              <Go href={card.link.href} className="fact-card is-link">
                {body}
              </Go>
            ) : (
              <div className="fact-card">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function BlockView({ block, index }: { block: Block; index: number }) {
  const id = `b${index}`;
  const head = "title" in block && block.title ? <h2 id={`${id}-t`}>{block.title}</h2> : null;
  const wrap = (cls: string, body: React.ReactNode, anchor?: string) => (
    <section id={anchor} className={`wrap corp-block ${cls}`} aria-labelledby={head ? `${id}-t` : undefined}>
      {head}
      {body}
    </section>
  );

  switch (block.type) {
    case "cards":
      return wrap(
        "is-cards",
        <div className="corp-grid">
          {block.items.map((c) => {
            const body = (
              <>
                <strong>{c.title}</strong>
                {c.body && <p>{c.body}</p>}
                {c.cta && (
                  <span className="corp-more">
                    {c.cta} <Arrow />
                  </span>
                )}
              </>
            );
            return c.href ? (
              <Go key={c.title} href={c.href} className="corp-tile is-link">
                {body}
              </Go>
            ) : (
              <div key={c.title} className="corp-tile">
                {body}
              </div>
            );
          })}
        </div>,
      );
    case "table":
      return wrap("is-table-cards", <TableCards block={block} />);
    case "steps":
      return wrap(
        `is-steps${block.flow ? " is-flow" : ""}`,
        <>
          <ol className="corp-steps">
            {block.items.map((s) => (
              <li key={s.title}>
                <strong>{s.title}</strong>
                {s.body && <p>{s.body}</p>}
              </li>
            ))}
          </ol>
          {block.note && <p className="corp-note">{block.note}</p>}
        </>,
      );
    case "list":
      return wrap(
        "is-list",
        <ul className="corp-list">
          {block.items.map((l, i) => (
            <li key={i}>
              {l.title && <strong>{l.title}</strong>}
              <span>{l.body}</span>
              {l.href && (
                <Go href={l.href} className="corp-cell-link">
                  Xem <Arrow />
                </Go>
              )}
            </li>
          ))}
        </ul>,
      );
    case "text":
      return wrap(
        `is-text${head ? "" : " is-quote"}`,
        <div className="corp-text">
          {block.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {block.link && (
            <Go href={block.link.href} className="home-link">
              {block.link.label} <Arrow />
            </Go>
          )}
        </div>,
      );
    case "pills":
      return wrap(
        "is-pills",
        <ul className="corp-pills">
          {block.items.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>,
      );
    case "timeline":
      return wrap(
        "is-timeline",
        <ol className="corp-timeline">
          {block.items.map((t, i) => (
            <li key={t.year} className={i === block.items.length - 1 ? "is-now" : undefined} style={{ "--i": i } as React.CSSProperties}>
              <span>{t.year}</span>
              <strong>{t.label}</strong>
            </li>
          ))}
        </ol>,
      );
    case "layers":
      return wrap("is-layers", <PageModel model={{ kind: "stack", layers: block.items.map((label) => ({ label })) }} />);
    case "partners":
      return wrap(
        "is-partners",
        <div className="corp-partners">
          {block.groups.map((g) => (
            <div key={g.group}>
              <h3>{g.group}</h3>
              <ul>
                {g.names.map((n) => (
                  <li key={n}>
                    <PartnerMark name={n} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>,
      );
    case "callout":
      return wrap(
        "is-callout",
        <div className="corp-callout">
          <p>{block.body}</p>
          {block.en && <p className="corp-en">{block.en}</p>}
        </div>,
      );
    case "case":
      return wrap("is-case applications is-bare", <CaseShowcase data={MOCK_CASES[block.id]} />, "ptsc");
    case "contact":
      return (
        <section className="wrap corp-block is-contact">
          <ContactForm />
          <aside className="corp-contact-side">
            <h2>Thông tin liên hệ</h2>
            <ContactList className="page-contacts" />
          </aside>
        </section>
      );
    case "jobs":
      return wrap("is-jobs", <JobList />);
  }
}

function Head({ page, crumb }: { page: Page; crumb?: { href: string; label: string } }) {
  const text = (
    <>
      {crumb && (
        <p className="corp-crumbs">
          <Go href={crumb.href}>{crumb.label}</Go>
        </p>
      )}
      {/* On a detail page the title is a headline, so the page's name sits above it. */}
      {crumb && page.title !== page.name && <p className="page-eyebrow">{page.name}</p>}
      <h1>{page.title}</h1>
      {page.en && <p className="corp-en is-head">{page.en}</p>}
      {page.lead && <p className="corp-lead">{page.lead}</p>}
    </>
  );
  if (!page.model) return <div className="wrap page-head corp-head">{text}</div>;
  // A page with a model: the heading beside the model that carries its content.
  return (
    <div className="wrap page-head corp-head has-model">
      <div className="corp-head-text">{text}</div>
      <div className={`corp-model is-${page.model.kind}`}>
        <PageModel model={page.model} />
      </div>
    </div>
  );
}

function PageCta({ cta }: { cta: Page["cta"] }) {
  if (!cta) return null;
  return (
    <section className="wrap corp-cta">
      <Go href={cta.href ?? "/ve-thehegeo/lien-he/"} className="button">
        {cta.label}
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14m-6-6 6 6-6 6" />
        </svg>
      </Go>
    </section>
  );
}

function Blocks({ page }: { page: Page }) {
  return (
    <>
      {page.blocks.map((b, i) => (
        <BlockView key={i} block={b} index={i} />
      ))}
    </>
  );
}

/** A section's landing page, with its own heading and blocks. */
export function SectionOverview({ section }: { section: SectionKey }) {
  const s = SECTIONS[section];
  return (
    <>
      <BlockMotion />
      <Head page={s.home} />
      <Blocks page={s.home} />
      {/* Về THEHEGEO lands on the company story; its own pages follow as cards. */}
      {section === "ve-thehegeo" && (
        <BlockView index={99} block={{ type: "cards", items: s.pages.map((p) => ({ title: p.name, href: `${s.base}${p.slug}/`, cta: "Xem" })) }} />
      )}
      <PageCta cta={s.home.cta} />
    </>
  );
}

/** A detail page: heading, blocks, call to action, and the other pages of its section. */
export function Detail({ section, page }: { section: SectionKey; page: Page }) {
  const s = SECTIONS[section];
  const siblings = s.pages.filter((p) => p.slug !== page.slug);
  return (
    <>
      <BlockMotion />
      <Head page={page} crumb={{ href: s.base, label: s.title }} />
      {page.image && (
        <div className="wrap corp-banner">
          <img src={asset(page.image)} alt="" />
        </div>
      )}
      <Blocks page={page} />
      <PageCta cta={page.cta} />
      <section className="wrap corp-siblings" aria-label="Xem thêm">
        <h2 className="corp-siblings-title">Xem thêm</h2>
        <div>
          {siblings.map((p) => (
            <Go key={p.slug} href={`${s.base}${p.slug}/`}>
              {p.kind && <span>{p.kind}</span>}
              <strong>{p.name}</strong>
              <Arrow />
            </Go>
          ))}
        </div>
      </section>
    </>
  );
}

/** The recruitment landing page. */
export function JobsPage({ page }: { page: Page }) {
  return (
    <>
      <BlockMotion />
      <Head page={page} />
      <Blocks page={page} />
    </>
  );
}

/**
 * One job description, laid out like a printed JD: the role and the problem it solves at the top,
 * the description on the left (duties → requirements → pluses), and on the right a card with the
 * hiring facts and the apply action that stays in view while reading. Other open roles close it.
 */
export function JobDetail({ job }: { job: Job }) {
  const apply = `mailto:${APPLY_EMAIL}?subject=${encodeURIComponent(`Ứng tuyển: ${job.title}`)}`;
  const lists: [string, string[]][] = [
    ["Bạn sẽ làm", job.duties],
    ["Bạn cần có", job.requirements],
    ["Điểm cộng", job.plus],
  ];
  // TODO(unconfirmed): location, type, headcount and deadline are not in the source document yet.
  const facts: [string, string | null][] = [
    ["Vị trí", job.family],
    ["Nhóm", job.team],
    ["Địa điểm", null],
    ["Hình thức", null],
    ["Số lượng", null],
    ["Hạn nộp", null],
  ];
  const others = JOBS.filter((j) => j.slug !== job.slug);
  return (
    <div className="wrap jd">
      <div className="jd-head">
        <p className="corp-crumbs">
          <Go href="/tuyen-dung/">Tuyển dụng</Go>
        </p>
        <p className="jd-family">{job.family}</p>
        <h1>{job.title}</h1>
        <p className="jd-problem">{job.problem}</p>
      </div>
      <div className="jd-body">
        <article className="jd-main">
          {lists.map(([title, items]) => (
            <section key={title} className="jd-section">
              <h2>{title}</h2>
              <ul>
                {items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </section>
          ))}
        </article>
        <aside className="jd-side" aria-label="Thông tin tuyển dụng">
          <dl className="jd-facts">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd className={v ? undefined : "is-pending"}>{v ?? "Đang cập nhật"}</dd>
              </div>
            ))}
          </dl>
          <a href={apply} className="button jd-apply">
            Ứng tuyển vị trí này
          </a>
          <p className="jd-how">
            Gửi CV tới <a href={apply}>{APPLY_EMAIL}</a>, tiêu đề ghi tên vị trí.
          </p>
        </aside>
      </div>
      {others.length > 0 && (
        <section className="jd-others" aria-labelledby="jd-others-t">
          <h2 id="jd-others-t">Vị trí khác đang tuyển</h2>
          <ul>
            {others.map((j) => (
              <li key={j.slug}>
                <Go href={`/tuyen-dung/${j.slug}/`}>
                  <span>{j.family}</span>
                  <strong>{j.title}</strong>
                  <Arrow />
                </Go>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
