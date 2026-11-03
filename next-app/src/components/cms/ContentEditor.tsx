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
import jobs from "@/content/payload/jobs.json";
import pages from "@/content/payload/pages.json";
import ways from "@/content/payload/ways.json";
import caseStudy from "@/content/payload/case.json";
import { PUBLISHED } from "@/content/published";
import { DOCS, docAt, type Doc } from "@/content/registry";
import library from "@/content/media.json";
import { asset } from "@/lib/asset";
import { validateDocument } from "@/content/validate.mjs";
import { Disclosure, Fields, explain, flat, type Ctx, type Media, type MediaItem, type MediaKind, type Problem, type Row, type Schema } from "./fields";
import { clearUploads, loadUploads, saveUpload, toBase64 } from "./mediaStore";

const SCHEMAS = { pages, corporate, jobs, header, footer, ways, geoagents, case: caseStudy } as unknown as Record<Doc["schema"], Schema>;
const STORE = "cms-mock:drafts";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// Folder-style URLs: the GitHub Pages export serves each page as <path>/index.html.
const siteUrl = (path: string) => `${BASE}${path === "/" ? "/" : `${path}/`}`;
const byKey = (key: string) => DOCS.find((d) => d.key === key)!;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// What an upload may be: the types a media field takes (validate.mjs), and sizes worth a warning.
const TYPES: Record<MediaKind, Record<string, string>> = {
  image: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif" },
  video: { "video/mp4": "mp4" },
};
const HEAVY: Record<MediaKind, number> = { image: 1.5 * 1024 * 1024, video: 25 * 1024 * 1024 };
const LIMIT = 100 * 1024 * 1024;
/** A safe file name for public/media/uploads: no accents or spaces, and unique. */
const uploadPath = (name: string, ext: string) => {
  const base = name.replace(/\.[^.]+$/, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "file";
  return `/media/uploads/${base}-${Date.now().toString(36)}.${ext}`;
};

/** How the editor names a page: its own name or title, as the content gives it. */
function pageName(doc: Doc, value?: Row) {
  if (doc.key === "page:/") return "Trang chủ";
  if (doc.item) {
    const row = ((value?.jobs as Row[] | undefined) ?? []).find((r) => r.slug === doc.item);
    return String(row?.title || doc.item);
  }
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
  // Files uploaded in this browser, by the path they will have on the site.
  const [uploads, setUploads] = useState<Record<string, Blob>>({});
  const uploadsRef = useRef(uploads);
  uploadsRef.current = uploads;

  const docOf = (key: string) => (drafts[key] ?? PUBLISHED[key]) as Row | undefined;
  const setDoc = (key: string) => (value: Row) => setDrafts((d) => ({ ...d, [key]: value }));

  // Drafts live in this browser only, so a reload keeps the editor's work (the earlier home-only draft too).
  // Saving waits until the saved drafts are restored: otherwise the first save writes the empty
  // initial state over them (React runs effects twice in development).
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE);
      const old = localStorage.getItem("cms-mock:home");
      if (saved) setDrafts(JSON.parse(saved));
      else if (old) setDrafts({ "page:/": JSON.parse(old) });
    } catch {}
    setRestored(true);
  }, []);
  useEffect(() => {
    loadUploads().then(setUploads);
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORE, JSON.stringify(drafts));
    } catch {}
  }, [drafts, restored]);

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
  // The documents on screen: header, this page, footer, and the shared ones the page shows in place
  // (its "ways of working" section, the case studies its case blocks pick, GEOagents' AI DN360).
  const pageBlocks = (current && (docOf(current.key)?.blocks as Row[] | undefined)) ?? [];
  const sharedHere = [
    ...(pageBlocks.some((b) => b.blockType === "waysOfWorking") ? ["ways"] : []),
    ...pageBlocks.filter((b) => b.blockType === "case" && b.caseId).map((b) => `case:${String(b.caseId)}`),
    ...(pageBlocks.some((b) => b.blockType === "jobs") ? ["jobs"] : []),
    ...(current?.key === "page:/geoagents" ? ["case:tdn"] : []),
  ];
  const onScreen = ["header", ...(current ? [current.key] : []), "footer", ...sharedHere];
  const visibleProblem = onScreen.find((k) => problems[k]);
  const anyProblem = visibleProblem ?? Object.keys(problems)[0];

  // Only valid drafts reach the preview; while one has a problem, its last valid version stands.
  const post = (message: unknown) => frame.current?.contentWindow?.postMessage(message, location.origin);
  // Uploads go first, so the drafts that use them find them.
  const sendDrafts = () => {
    if (Object.keys(uploadsRef.current).length) post({ type: "cms:media", files: uploadsRef.current });
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
  const show = (selector: string, note?: string, index = 0) => post({ type: "cms:part", selector, index, note });
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
  // Working in a field shows where it is on the page: the place its schema gives (custom.selector,
  // custom.index), else the area's own. Sections and the GEOagents parts show themselves.
  /** On a posting's page, the list's row for it: its fields, and the path validate.mjs names them by. */
  const itemOf = (doc: Doc) => {
    if (!current?.item || doc.key !== current.key) return undefined;
    const list = SCHEMAS[doc.schema].fields[0];
    const rows = (docOf(doc.key)?.[list.name!] as Row[] | undefined) ?? [];
    const index = rows.findIndex((r) => r.slug === current.item);
    return { list: list.name!, index, defs: list.fields ?? [], rows };
  };
  const focusArea = (key: string, fallback: string) => (e: React.FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".cms-block")) return;
    const fieldPath = target.closest("[data-path]")?.getAttribute("data-path") ?? "";
    const doc = byKey(key);
    const segments = fieldPath.split(".").slice(1).map((s) => s.replace(/\[.*$/, ""));
    const defs = itemOf(doc) ? itemOf(doc)!.defs : SCHEMAS[doc.schema].fields;
    const top = itemOf(doc) ? segments[1] : segments[0];
    const field = flat(defs).find((f) => f.name === top);
    setActive(undefined);
    show(field?.custom?.selector ?? fallback, undefined, field?.custom?.index ?? 0);
  };

  // Previews of uploads in this window (the preview makes its own from the same files).
  const uploadUrls = useMemo(() => Object.fromEntries(Object.entries(uploads).map(([p, b]) => [p, URL.createObjectURL(b)])), [uploads]);
  useEffect(() => () => Object.values(uploadUrls).forEach((u) => URL.revokeObjectURL(u)), [uploadUrls]);
  const media: Media = {
    items: (kind) => [
      ...Object.entries(uploads).filter(([p]) => (kind === "video" ? /\.mp4$/ : /\.(jpe?g|png|webp|avif|gif)$/).test(p)).map(([p, b]) => ({ path: p, kind, size: b.size, uploaded: true })),
      ...(library as MediaItem[]).filter((m) => m.kind === kind).map((m) => ({ ...m, uploaded: false })),
    ],
    urlOf: (p) => uploadUrls[p] ?? (/^https?:\/\//.test(p) ? p : asset(p)),
    upload: async (file, kind) => {
      const ext = TYPES[kind][file.type];
      if (!ext) return { note: kind === "video" ? "Chỉ nhận video MP4." : "Chỉ nhận ảnh JPG, PNG, WebP, AVIF hoặc GIF." };
      if (file.size > LIMIT) return { note: `File nặng ${(file.size / 1024 / 1024).toFixed(0)} MB, vượt giới hạn 100 MB. Hãy nén lại rồi tải lên.` };
      const p = uploadPath(file.name, ext);
      const kept = await saveUpload(p, file);
      setUploads((u) => ({ ...u, [p]: file }));
      const notes = [
        file.size > HEAVY[kind] && `File nặng ${(file.size / 1024 / 1024).toFixed(1)} MB: trang sẽ tải chậm, nên nén ${kind === "video" ? "dưới 25 MB" : "dưới 1,5 MB"}.`,
        !kept && "Trình duyệt không cho lưu file: file mất khi đóng trang. Hãy tải bản nháp trước khi đóng.",
      ].filter(Boolean);
      return { path: p, note: notes.join(" ") || undefined };
    },
  };

  const ctxFor = (key: string): Ctx => ({
    media,
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
      // Case studies and postings are named as editors know them: the product, the role.
      const label = sharedKey.startsWith("case:") ? `case study ${String(value.name)}` : byKey(sharedKey).label;
      return { label, value, onChange: setDoc(sharedKey), schema: SCHEMAS[byKey(sharedKey).schema], problem: problems[sharedKey] };
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
  // The uploads the changed documents use travel in the same file, as base64 by their place in public/.
  const download = async () => {
    const files = Object.fromEntries(changed.map((k) => [byKey(k).file, drafts[k]]));
    const text = JSON.stringify(files);
    const used = Object.keys(uploads).filter((p) => text.includes(JSON.stringify(p)));
    const media = Object.fromEntries(await Promise.all(used.map(async (p) => [`public${p}`, await toBase64(uploads[p])])));
    const blob = new Blob([JSON.stringify({ kind: "thehegeo-content-drafts", files, media }, null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: "noi-dung-ban-nhap.json" }).click();
    URL.revokeObjectURL(url);
  };
  const discard = () => {
    if (!confirm(`Bỏ thay đổi ở ${changed.length} tài liệu (và các file đã tải lên) và quay về nội dung đang có trên website?`)) return;
    setDrafts({});
    setUploads({});
    clearUploads();
  };

  // Areas start closed, and a page's content area closes again when the preview moves to another page.
  const group = (key: string, title: string, note: string, selector: string) => {
    const doc = byKey(key);
    const value = docOf(key);
    if (!value) return null;
    const problem = problems[key];
    // A posting's page edits its own row of the postings list.
    const item = itemOf(doc);
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
        <div onFocus={focusArea(key, selector)}>
          {item ? (
            item.index < 0 ? (
              <p className="cms-outline-note">Tin này không còn trong danh sách tin tuyển dụng (đã đổi đường dẫn hoặc đã xoá).</p>
            ) : (
              <Fields
                defs={item.defs}
                value={item.rows[item.index]}
                onChange={(row) => setDoc(key)({ ...value, [item.list]: item.rows.map((r, i) => (i === item.index ? row : r)) })}
                path={`${SCHEMAS[doc.schema].slug}.${item.list}[${item.index}]`}
                ctx={ctxFor(key)}
              />
            )
          ) : (
            <Fields defs={SCHEMAS[doc.schema].fields} value={value} onChange={setDoc(key)} path={SCHEMAS[doc.schema].slug} ctx={ctxFor(key)} />
          )}
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
