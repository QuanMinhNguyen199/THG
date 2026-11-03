"use client";

// A mock of the Payload editor (/soan-noi-dung, unlinked and not indexed). The preview on the right is
// the site itself; the form on the left follows whichever page it shows, in three groups: the header
// and the footer (shared by every page) around that page's own content. Forms are built from the
// schemas in src/content/payload, so editors see the labels and help text the real /admin will show.
// It saves nothing to the site: drafts stay in this browser and leave only as a downloaded file that
// `npm run content:apply` writes into the repository.
import { useEffect, useMemo, useRef, useState } from "react";
import corporate from "@/content/payload/corporate.json";
import footer from "@/content/payload/footer.json";
import geoagents from "@/content/payload/geoagents.json";
import header from "@/content/payload/header.json";
import job from "@/content/payload/job.json";
import pages from "@/content/payload/pages.json";
import ways from "@/content/payload/ways.json";
import { PUBLISHED } from "@/content/published";
import { DOCS, docAt, type Doc } from "@/content/registry";
import { validateDocument } from "@/content/validate.mjs";
import { Disclosure, Fields, explain, type Ctx, type Problem, type Row, type Schema } from "./fields";

const SCHEMAS = { pages, corporate, job, header, footer, ways, geoagents } as unknown as Record<Doc["schema"], Schema>;
const STORE = "cms-mock:drafts";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// Folder-style URLs: the GitHub Pages export serves each page as <path>/index.html.
const siteUrl = (path: string) => `${BASE}${path === "/" ? "/" : `${path}/`}`;
const byKey = (key: string) => DOCS.find((d) => d.key === key)!;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** How the editor names a page: its own name or title, as the content gives it. */
function pageName(doc: Doc, value?: Row) {
  if (doc.key === "page:/") return "Trang chủ";
  // A name being edited can be empty for a moment: fall back to the title, then the file's name.
  return String(value?.name || value?.title || doc.label);
}

export function ContentEditor() {
  const [drafts, setDrafts] = useState<Record<string, Row>>({});
  const [path, setPath] = useState("/");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [active, setActive] = useState<string>();
  const frame = useRef<HTMLIFrameElement>(null);
  const lastValid = useRef<Record<string, Row>>({});

  const docOf = (key: string) => (drafts[key] ?? PUBLISHED[key]) as Row | undefined;
  const setDoc = (key: string) => (value: Row) => setDrafts((d) => ({ ...d, [key]: value }));

  // Drafts live in this browser only, so a reload keeps the editor's work (the earlier home-only draft too).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE);
      const old = localStorage.getItem("cms-mock:home");
      if (saved) setDrafts(JSON.parse(saved));
      else if (old) setDrafts({ "page:/": JSON.parse(old) });
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(drafts));
    } catch {}
  }, [drafts]);

  // Each changed document is checked against its schema; the first problem of each is kept.
  const problems = useMemo(() => {
    const found: Record<string, Problem> = {};
    for (const [key, value] of Object.entries(drafts)) {
      const schema = SCHEMAS[byKey(key).schema];
      try {
        validateDocument(value, schema);
      } catch (e) {
        found[key] = explain((e as Error).message, value, schema);
      }
    }
    return found;
  }, [drafts]);
  const changed = useMemo(() => Object.keys(drafts).filter((k) => !same(drafts[k], PUBLISHED[k])), [drafts]);

  const current = docAt(path);
  // The documents on screen: header, this page, footer, and a shared section the page shows in place.
  const pageBlocks = (current && (docOf(current.key)?.blocks as Row[] | undefined)) ?? [];
  const onScreen = ["header", ...(current ? [current.key] : []), "footer", ...(pageBlocks.some((b) => b.blockType === "waysOfWorking") ? ["ways"] : [])];
  const visibleProblem = onScreen.find((k) => problems[k]);
  const anyProblem = visibleProblem ?? Object.keys(problems)[0];

  // Only valid drafts reach the preview; while one has a problem, its last valid version stands.
  const post = (message: unknown) => frame.current?.contentWindow?.postMessage(message, location.origin);
  const sendDrafts = () => {
    if (Object.keys(lastValid.current).length) post({ type: "cms:drafts", drafts: lastValid.current });
  };
  useEffect(() => {
    const next: Record<string, Row> = {};
    for (const key of Object.keys(drafts)) next[key] = problems[key] ? lastValid.current[key] ?? (PUBLISHED[key] as Row) : drafts[key];
    // An emptied draft list still has to reach the preview, to bring back the published content.
    const cleared = Object.keys(next).length === 0 && Object.keys(lastValid.current).length > 0;
    lastValid.current = next;
    const t = setTimeout(() => (cleared ? post({ type: "cms:drafts", drafts: {} }) : sendDrafts()), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drafts, problems]);

  // The preview reports each page it shows; the left side follows it and the drafts go along.
  useEffect(() => {
    const receive = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.data?.type !== "cms:page") return;
      setPath(String(e.data.path));
      setActive(undefined);
      sendDrafts();
    };
    addEventListener("message", receive);
    return () => removeEventListener("message", receive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Scrolls the preview to a part of the page and outlines it; `note` says why it cannot be shown. */
  const show = (selector: string, note?: string) => post({ type: "cms:part", selector, index: 0, note });
  const select = (key: string) => (id: string, field: string) => {
    setActive(id);
    const doc = byKey(key);
    const shownDoc = lastValid.current[key] ?? (PUBLISHED[key] as Row);
    const block = ((docOf(key)?.[field] as Row[]) ?? []).find((b) => b.id === id);
    if (field === "model") return show(".corp-model");
    const missing = !((shownDoc?.[field] as Row[]) ?? []).some((b) => b.id === id)
      ? "Section này chưa hiện trong xem trước vì còn ô bắt buộc chưa điền."
      : block?.enabled === false
        ? "Section này đang ẩn nên không hiển thị trên trang."
        : undefined;
    if (missing) return show("", missing);
    const selector = doc.schema === "pages" ? `#${CSS.escape(String(block?.anchor || `block-${id}`))}` : `[data-block="${CSS.escape(id)}"]`;
    show(selector);
  };
  // Working in the header or footer group shows that part of the page; blocks show themselves.
  const focusGroup = (selector: string) => (e: React.FocusEvent) => {
    if ((e.target as HTMLElement).closest(".cms-block")) return;
    setActive(undefined);
    show(selector);
  };

  const ctxFor = (key: string): Ctx => ({
    problem: problems[key],
    active,
    select: select(key),
    show: (selector) => {
      setActive(undefined);
      show(selector);
    },
    shared: (sharedKey) => {
      const value = docOf(sharedKey);
      if (!value) return undefined;
      return { label: byKey(sharedKey).label, value, onChange: setDoc(sharedKey), schema: SCHEMAS[byKey(sharedKey).schema], problem: problems[sharedKey] };
    },
  });

  const open = (doc: Doc) => {
    const page = doc.path ?? doc.shownAt;
    if (frame.current && page) frame.current.src = siteUrl(page);
  };
  const goToProblem = () => {
    if (!anyProblem) return;
    const doc = byKey(anyProblem);
    if (!visibleProblem) return open(doc);
    const target = problems[anyProblem].path;
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-path="${CSS.escape(target)}"]`);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.querySelector<HTMLElement>("input, textarea, select")?.focus({ preventScroll: true });
    });
  };
  const download = () => {
    const files = Object.fromEntries(changed.map((k) => [byKey(k).file, drafts[k]]));
    const blob = new Blob([JSON.stringify({ kind: "thehegeo-content-drafts", files }, null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: "noi-dung-ban-nhap.json" }).click();
    URL.revokeObjectURL(url);
  };
  const discard = () => {
    if (confirm(`Bỏ thay đổi ở ${changed.length} tài liệu và quay về nội dung đang có trên website?`)) setDrafts({});
  };

  // Areas start closed, and a page's content area closes again when the preview moves to another page.
  const group = (key: string, title: string, note: string, selector: string) => {
    const doc = byKey(key);
    const value = docOf(key);
    if (!value) return null;
    const problem = problems[key];
    return (
      <Disclosure
        key={key}
        className="cms-area"
        hasProblem={!!problem}
        summary={
          <>
            <span className="cms-area-title">{title}</span>
            <span className="cms-area-note">{note}</span>
            {changed.includes(key) && <span className="cms-badge">Đã sửa</span>}
            {problem && <span className="cms-badge is-problem">Cần sửa</span>}
          </>
        }
      >
        <div onFocus={focusGroup(selector)}>
          <Fields defs={SCHEMAS[doc.schema].fields} value={value} onChange={setDoc(key)} path={SCHEMAS[doc.schema].slug} ctx={ctxFor(key)} />
        </div>
      </Disclosure>
    );
  };

  const name = current ? pageName(current, docOf(current.key)) : path;
  return (
    <div className="cms">
      <header className="cms-bar">
        <div>
          <p className="cms-eyebrow">Bản thử nghiệm trình soạn nội dung · thay đổi không lưu vào website</p>
          <h1>{name}</h1>
        </div>
        <div className="cms-actions">
          <span className="cms-saved">{changed.length ? `${changed.length} tài liệu có thay đổi · nháp lưu trên trình duyệt này` : "Giống nội dung trên website"}</span>
          <button type="button" onClick={discard} disabled={!changed.length}>
            Bỏ mọi thay đổi
          </button>
          <button type="button" className="is-primary" onClick={download} disabled={!changed.length || !!anyProblem}>
            Tải bản nháp
          </button>
        </div>
      </header>

      <div className="cms-status" role="status">
        {anyProblem ? (
          <p className="cms-status-problem">
            <strong>Cần sửa trước khi xuất bản:</strong> {pageName(byKey(anyProblem), docOf(anyProblem))} › {problems[anyProblem].where.join(" › ")} — {problems[anyProblem].message}{" "}
            <button type="button" onClick={goToProblem}>{visibleProblem ? "Đi tới chỗ cần sửa" : "Mở trang đó"}</button>
            <span className="cms-status-note">Xem trước đang giữ bản hợp lệ gần nhất.</span>
          </p>
        ) : (
          <p className="cms-status-ok">Nội dung hợp lệ. Xem trước đã cập nhật.</p>
        )}
      </div>

      <div className="cms-main">
        <div className="cms-form">
          {group("header", "Header", "Dùng chung mọi trang", "header")}
          {current && docOf(current.key) ? (
            group(current.key, `Nội dung trang: ${name}`, current.path ?? "", "main h1")
          ) : (
            <section className="cms-area is-static" aria-label="Nội dung trang">
              <p className="cms-area-title">Nội dung trang: {name}</p>
              <p className="cms-outline-note">
                {current ? "Nội dung trang này chưa được chuyển sang dạng sửa được." : "Trang này không có nội dung để sửa ở đây."}
              </p>
            </section>
          )}
          {group("footer", "Footer", "Dùng chung mọi trang", "footer")}
        </div>
        <section className="cms-preview" aria-label="Xem trước">
          <div className="cms-preview-bar" role="group" aria-label="Kích thước xem trước">
            <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}>Máy tính</button>
            <button type="button" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}>Điện thoại (375px)</button>
          </div>
          <div className={`cms-frame is-${device}`}>
            <iframe ref={frame} src={siteUrl("/")} title={`Xem trước: ${name}`} />
          </div>
        </section>
      </div>
    </div>
  );
}
