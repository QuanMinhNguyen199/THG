"use client";

// A mock of the Payload editor for the home page (/soan-noi-dung, unlinked and not indexed). It saves
// nothing to the site: drafts stay in the browser and leave only as a downloaded home.json. The form is built from
// pages.collection.json, so editors see the same labels, help text and groups the real /admin will
// show; the iframe renders the draft with the site's own blocks once it passes validate.mjs.
import { useEffect, useMemo, useRef, useState } from "react";
import collection from "@/content/payload/pages.collection.json";
import home from "@/content/pages/home.json";
import { validateDocument } from "@/content/validate.mjs";

type Option = string | { label: string; value: string };
type Field = {
  name?: string;
  type: string;
  label?: string;
  required?: boolean;
  defaultValue?: unknown;
  min?: number;
  max?: number;
  minRows?: number;
  options?: Option[];
  admin?: { description?: string; initCollapsed?: boolean };
  labels?: { singular: string; plural: string };
  fields?: Field[];
  blocks?: BlockDef[];
};
type BlockDef = { slug: string; labels?: { singular: string }; admin?: { description?: string }; fields: Field[] };
type Row = Record<string, unknown>;

const SCHEMA = collection as unknown as { slug: string; fields: Field[] };
const LAYOUT = SCHEMA.fields.find((f) => f.name === "layout")!;
const BLOCKS = LAYOUT.blocks!;
const ORIGINAL = home as Row;
const STORE = "cms-mock:home";
// Trailing slash: the GitHub Pages export serves folder-style URLs.
const PREVIEW = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/xem-truoc-noi-dung/`;

/** Fields with the presentational groups (collapsible) opened up, as the data sees them. */
const flat = (defs: Field[]): Field[] => defs.flatMap((f) => (f.type === "collapsible" ? flat(f.fields ?? []) : [f]));
const optionValue = (o: Option) => (typeof o === "string" ? o : o.value);
const optionLabel = (o: Option) => (typeof o === "string" ? o : o.label);
const within = (errorPath: string | undefined, path: string) => !!errorPath && (errorPath === path || errorPath.startsWith(`${path}.`) || errorPath.startsWith(`${path}[`));

/** A new row or block: defaults, empty required fields (so validation names them), minimum rows. */
function blank(defs: Field[]): Row {
  const row: Row = {};
  for (const f of flat(defs)) {
    if (!f.name) continue;
    if (f.defaultValue !== undefined) row[f.name] = f.defaultValue;
    else if (f.type === "array") row[f.name] = Array.from({ length: f.minRows ?? 0 }, () => blank(f.fields ?? []));
    else if (f.required) row[f.name] = f.type === "number" ? null : "";
  }
  return row;
}
const newId = (slug: string) => `${slug}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/** The first piece of visible text in a row (not the advanced group), to name it in a collapsed list. */
function preview(row: Row, defs: Field[]) {
  for (const f of defs) {
    const v = f.name ? row[f.name] : undefined;
    if ((f.type === "text" || f.type === "textarea" || f.type === "select") && typeof v === "string" && v.trim()) return v;
  }
  return "";
}

type Problem = { path: string; message: string; where: string[] };

/** validate.mjs reports the first problem as "<path>: <code>"; say it in the editor's words. */
function explain(error: string, doc: Row): Problem {
  const cut = error.lastIndexOf(": ");
  let path = error.slice(0, cut);
  const code = error.slice(cut + 2);
  // A block's anchor problem is reported on the block; point at the field inside it.
  const anchorProblem = code === "invalid or duplicate anchor";
  if (anchorProblem) path += ".anchor";
  const where: string[] = [];
  let defs = SCHEMA.fields;
  let value: unknown = doc;
  let field: Field | undefined;
  for (const token of path.split(".").slice(1)) {
    const [, name, index] = /^(\w+)(?:\[(\d+)\])?$/.exec(token) ?? [];
    field = flat(defs).find((f) => f.name === name);
    if (!field) break;
    value = (value as Row | undefined)?.[name];
    if (index === undefined) {
      where.push(field.label ?? name);
      continue;
    }
    const i = Number(index);
    const row = (value as Row[] | undefined)?.[i];
    if (field.type === "blocks") {
      const block = BLOCKS.find((b) => b.slug === row?.blockType);
      where.push(`Section ${i + 1}: ${block?.labels?.singular ?? String(row?.blockType)}`);
      defs = block?.fields ?? [];
    } else {
      where.push(`${field.labels?.singular ?? field.label} ${i + 1}`);
      defs = field.fields ?? [];
    }
    value = row;
  }
  const message =
    code === "required" ? "Chưa nhập nội dung bắt buộc."
    : code === "expected text" ? "Cần nhập chữ."
    : code === "invalid number" ? (field?.min !== undefined && field?.max !== undefined ? `Số phải từ ${field.min} đến ${field.max}.` : "Số không hợp lệ.")
    : code === "expected integer" ? "Cần nhập số nguyên."
    : code === "invalid option" ? "Hãy chọn một giá trị trong danh sách."
    : code.includes("local path") ? "Đường dẫn phải bắt đầu bằng / (trang trong website), # (neo) hoặc https://."
    : code === "invalid array" ? `Cần ít nhất ${field?.minRows ?? 1} dòng.`
    : anchorProblem ? "Mã neo sai định dạng hoặc trùng với section khác."
    : code.includes("block ID") ? "Mã section bị trùng. Hãy xoá section này và thêm lại."
    : code;
  return { path, message, where };
}

type Ctx = { problem?: Problem };

/** A panel that opens by itself when the current problem is inside it. */
function Disclosure({ summary, hasProblem, initial = false, className, children }: { summary: React.ReactNode; hasProblem: boolean; initial?: boolean; className?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(initial);
  useEffect(() => {
    if (hasProblem) setOpen(true);
  }, [hasProblem]);
  return (
    <details className={className} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>{summary}</summary>
      {open && <div className="cms-disclosure-body">{children}</div>}
    </details>
  );
}

function Fields({ defs, value, onChange, path, ctx }: { defs: Field[]; value: Row; onChange: (v: Row) => void; path: string; ctx: Ctx }) {
  return (
    <>
      {defs.map((f, i) => {
        if (f.type === "collapsible")
          return (
            <Disclosure
              key={`c${i}`}
              className="cms-group"
              summary={f.label}
              initial={!f.admin?.initCollapsed}
              hasProblem={flat(f.fields ?? []).some((c) => within(ctx.problem?.path, `${path}.${c.name}`))}
            >
              <Fields defs={f.fields ?? []} value={value} onChange={onChange} path={path} ctx={ctx} />
            </Disclosure>
          );
        const name = f.name!;
        return <FieldView key={name} field={f} value={value[name]} onChange={(v) => onChange({ ...value, [name]: v })} path={`${path}.${name}`} ctx={ctx} />;
      })}
    </>
  );
}

function FieldView({ field, value, onChange, path, ctx }: { field: Field; value: unknown; onChange: (v: unknown) => void; path: string; ctx: Ctx }) {
  if (field.type === "array") return <ArrayField field={field} rows={(value as Row[]) ?? []} onChange={onChange} path={path} ctx={ctx} />;
  if (field.type === "blocks") return <BlocksField field={field} blocks={(value as Row[]) ?? []} onChange={onChange} path={path} ctx={ctx} />;
  const id = `f-${path.replace(/[^\w-]/g, "_")}`;
  const problem = ctx.problem?.path === path ? ctx.problem : undefined;
  const help = field.admin?.description;
  const described = [help && `${id}-help`, problem && `${id}-error`].filter(Boolean).join(" ") || undefined;
  const common = { id, "aria-describedby": described, "aria-invalid": problem ? true : undefined };
  let input: React.ReactNode;
  switch (field.type) {
    case "textarea":
      input = <textarea {...common} rows={3} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
      break;
    case "number":
      input = (
        <input {...common} type="number" inputMode="numeric" min={field.min} max={field.max} value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} />
      );
      break;
    case "checkbox":
      return (
        <div className={`cms-field is-check${problem ? " has-problem" : ""}`} data-path={path}>
          <label htmlFor={id}>
            <input {...common} type="checkbox" checked={(value ?? field.defaultValue ?? false) as boolean} onChange={(e) => onChange(e.target.checked)} />
            {field.label}
          </label>
          {help && <p className="cms-help" id={`${id}-help`}>{help}</p>}
        </div>
      );
    case "select":
      input = (
        <select {...common} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Chọn —</option>
          {field.options?.map((o) => (
            <option key={optionValue(o)} value={optionValue(o)}>
              {optionLabel(o)}
            </option>
          ))}
        </select>
      );
      break;
    default:
      input = <input {...common} type="text" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <div className={`cms-field${problem ? " has-problem" : ""}`} data-path={path}>
      <label htmlFor={id}>
        {field.label}
        {field.required && <span className="cms-required" aria-label="bắt buộc"> *</span>}
      </label>
      {input}
      {help && <p className="cms-help" id={`${id}-help`}>{help}</p>}
      {problem && <p className="cms-problem" id={`${id}-error`}>{problem.message}</p>}
    </div>
  );
}

function RowTools({ index, count, min, onMove, onRemove, onCopy, noun }: { index: number; count: number; min: number; onMove: (to: number) => void; onRemove: () => void; onCopy?: () => void; noun: string }) {
  return (
    <span className="cms-tools">
      <button type="button" onClick={() => onMove(index - 1)} disabled={index === 0} aria-label={`Đưa ${noun} ${index + 1} lên`}>↑</button>
      <button type="button" onClick={() => onMove(index + 1)} disabled={index === count - 1} aria-label={`Đưa ${noun} ${index + 1} xuống`}>↓</button>
      {onCopy && <button type="button" onClick={onCopy} aria-label={`Nhân bản ${noun} ${index + 1}`}>Nhân bản</button>}
      <button type="button" onClick={onRemove} disabled={count <= min} aria-label={`Xoá ${noun} ${index + 1}`}>Xoá</button>
    </span>
  );
}

const move = <T,>(list: T[], from: number, to: number) => {
  const next = [...list];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
};

function ArrayField({ field, rows, onChange, path, ctx }: { field: Field; rows: Row[]; onChange: (v: Row[]) => void; path: string; ctx: Ctx }) {
  const defs = field.fields ?? [];
  const noun = (field.labels?.singular ?? "dòng").toLowerCase();
  const problem = ctx.problem?.path === path ? ctx.problem : undefined;
  const single = flat(defs).length === 1;
  return (
    <fieldset className={`cms-array${problem ? " has-problem" : ""}`} data-path={path}>
      <legend>
        {field.label} <span className="cms-count">({rows.length})</span>
      </legend>
      {field.admin?.description && <p className="cms-help">{field.admin.description}</p>}
      {problem && <p className="cms-problem">{problem.message}</p>}
      <ol className="cms-rows">
        {rows.map((row, i) => {
          const rowPath = `${path}[${i}]`;
          const set = (v: Row) => onChange(rows.map((r, j) => (j === i ? v : r)));
          const tools = (
            <RowTools index={i} count={rows.length} min={field.minRows ?? 0} noun={noun}
              onMove={(to) => onChange(move(rows, i, to))} onRemove={() => onChange(rows.filter((_, j) => j !== i))} />
          );
          // One-field rows (a bullet line, a partner) stay inline; others fold like Payload's rows.
          if (single)
            return (
              <li key={i} className="cms-row is-inline">
                <Fields defs={defs} value={row} onChange={set} path={rowPath} ctx={ctx} />
                {tools}
              </li>
            );
          return (
            <li key={i} className="cms-row">
              <Disclosure
                className="cms-row-panel"
                hasProblem={within(ctx.problem?.path, rowPath)}
                summary={<><span className="cms-row-name">{field.labels?.singular} {i + 1}</span><span className="cms-row-preview">{preview(row, defs)}</span></>}
              >
                <Fields defs={defs} value={row} onChange={set} path={rowPath} ctx={ctx} />
              </Disclosure>
              {tools}
            </li>
          );
        })}
      </ol>
      <button type="button" className="cms-add" onClick={() => onChange([...rows, blank(defs)])}>
        + Thêm {noun}
      </button>
    </fieldset>
  );
}

function BlocksField({ field, blocks, onChange, path, ctx }: { field: Field; blocks: Row[]; onChange: (v: Row[]) => void; path: string; ctx: Ctx }) {
  const [adding, setAdding] = useState(BLOCKS[0].slug);
  return (
    <section className="cms-blocks" aria-labelledby="cms-blocks-title">
      <h2 id="cms-blocks-title">{field.label}</h2>
      {field.admin?.description && <p className="cms-help">{field.admin.description}</p>}
      <ol className="cms-rows">
        {blocks.map((block, i) => {
          const def = BLOCKS.find((b) => b.slug === block.blockType);
          const blockPath = `${path}[${i}]`;
          const hidden = block.enabled === false;
          return (
            <li key={String(block.id)} className={`cms-block${hidden ? " is-hidden" : ""}`}>
              <Disclosure
                className="cms-block-panel"
                hasProblem={within(ctx.problem?.path, blockPath)}
                summary={
                  <>
                    <span className="cms-row-name">{i + 1}. {def?.labels?.singular ?? String(block.blockType)}</span>
                    {hidden && <span className="cms-badge">Đang ẩn</span>}
                    {within(ctx.problem?.path, blockPath) && <span className="cms-badge is-problem">Cần sửa</span>}
                    <span className="cms-row-preview">{def ? preview(block, def.fields) : ""}</span>
                  </>
                }
              >
                {def?.admin?.description && <p className="cms-block-help">{def.admin.description}</p>}
                {def ? (
                  <Fields defs={def.fields} value={block} onChange={(v) => onChange(blocks.map((b, j) => (j === i ? v : b)))} path={blockPath} ctx={ctx} />
                ) : (
                  <p className="cms-problem">Loại section “{String(block.blockType)}” không có trong schema.</p>
                )}
              </Disclosure>
              <RowTools index={i} count={blocks.length} min={field.minRows ?? 0} noun="section"
                onMove={(to) => onChange(move(blocks, i, to))}
                onRemove={() => confirm(`Xoá section ${i + 1}? Nội dung trong section sẽ mất.`) && onChange(blocks.filter((_, j) => j !== i))}
                // A copy gets a new identity and no anchor, so both stay unique (PAYLOAD.md).
                onCopy={() => onChange([...blocks.slice(0, i + 1), { ...structuredClone(block), id: newId(String(block.blockType)), anchor: undefined }, ...blocks.slice(i + 1)])}
              />
            </li>
          );
        })}
      </ol>
      <div className="cms-add-block">
        <label htmlFor="cms-add-type">Thêm section</label>
        <select id="cms-add-type" value={adding} onChange={(e) => setAdding(e.target.value)}>
          {BLOCKS.map((b) => (
            <option key={b.slug} value={b.slug}>{b.labels?.singular ?? b.slug}</option>
          ))}
        </select>
        <button type="button" className="cms-add" onClick={() => onChange([...blocks, { id: newId(adding), blockType: adding, ...blank(BLOCKS.find((b) => b.slug === adding)!.fields) }])}>
          + Thêm vào cuối trang
        </button>
      </div>
    </section>
  );
}

export function ContentEditor() {
  const [doc, setDoc] = useState<Row>(ORIGINAL);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const frame = useRef<HTMLIFrameElement>(null);
  const lastValid = useRef<Row>(ORIGINAL);

  // The draft lives in this browser only, so a reload keeps the editor's work.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE);
      if (saved) setDoc(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(doc));
    } catch {}
  }, [doc]);

  const problem = useMemo(() => {
    try {
      validateDocument(doc, SCHEMA);
      return undefined;
    } catch (e) {
      return explain((e as Error).message, doc);
    }
  }, [doc]);
  const heroes = ((doc.layout as Row[]) ?? []).filter((b) => b.blockType === "homeHero" && b.enabled !== false).length;
  const changed = useMemo(() => JSON.stringify(doc) !== JSON.stringify(ORIGINAL), [doc]);

  // Only a valid draft reaches the preview; while there is a problem it keeps the last valid one.
  useEffect(() => {
    if (problem) return;
    lastValid.current = doc;
    const t = setTimeout(() => frame.current?.contentWindow?.postMessage({ type: "cms:draft", doc }, location.origin), 200);
    return () => clearTimeout(t);
  }, [doc, problem]);
  useEffect(() => {
    const ready = (e: MessageEvent) => {
      if (e.origin === location.origin && e.data?.type === "cms:ready")
        frame.current?.contentWindow?.postMessage({ type: "cms:draft", doc: lastValid.current }, location.origin);
    };
    addEventListener("message", ready);
    return () => removeEventListener("message", ready);
  }, []);

  const goToProblem = () => {
    if (!problem) return;
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-path="${CSS.escape(problem.path)}"]`);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.querySelector<HTMLElement>("input, textarea, select")?.focus({ preventScroll: true });
    });
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(doc, null, 2) + "\n"], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "home.json" });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cms">
      <header className="cms-bar">
        <div>
          <p className="cms-eyebrow">Bản thử nghiệm trình soạn nội dung · thay đổi không lưu vào website</p>
          <h1>Trang chủ</h1>
        </div>
        <div className="cms-actions">
          <span className="cms-saved">{changed ? "Có thay đổi · nháp lưu trên trình duyệt này" : "Giống home.json"}</span>
          <button type="button" onClick={() => confirm("Bỏ mọi thay đổi và quay về nội dung trong home.json?") && setDoc(ORIGINAL)} disabled={!changed}>
            Khôi phục bản gốc
          </button>
          <button type="button" className="is-primary" onClick={download} disabled={!!problem}>
            Tải home.json
          </button>
        </div>
      </header>

      <div className="cms-status" role="status">
        {problem ? (
          <p className="cms-status-problem">
            <strong>Cần sửa trước khi xuất bản:</strong> {problem.where.join(" › ")} — {problem.message}{" "}
            <button type="button" onClick={goToProblem}>Đi tới chỗ cần sửa</button>
            <span className="cms-status-note">Xem trước đang giữ bản hợp lệ gần nhất.</span>
          </p>
        ) : (
          <p className="cms-status-ok">Nội dung hợp lệ. Xem trước đã cập nhật.</p>
        )}
        {heroes > 1 && <p className="cms-status-warn">Trang đang có {heroes} Hero. Mỗi trang chỉ nên có một tiêu đề chính (H1).</p>}
      </div>

      <div className="cms-main">
        <form className="cms-form" onSubmit={(e) => e.preventDefault()} noValidate>
          <Fields defs={SCHEMA.fields} value={doc} onChange={setDoc} path={SCHEMA.slug} ctx={{ problem }} />
        </form>
        <section className="cms-preview" aria-label="Xem trước">
          <div className="cms-preview-bar" role="group" aria-label="Kích thước xem trước">
            <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}>Máy tính</button>
            <button type="button" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}>Điện thoại (375px)</button>
          </div>
          <div className={`cms-frame is-${device}`}>
            <iframe ref={frame} src={PREVIEW} title="Xem trước trang chủ" />
          </div>
        </section>
      </div>
    </div>
  );
}
