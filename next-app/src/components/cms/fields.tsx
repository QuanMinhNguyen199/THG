"use client";

// The content editor's form, built from a Payload-style schema (src/content/payload/*.json): fields,
// arrays and blocks with their labels and help text, and validate.mjs's first problem explained in
// the editor's words at the field it is about.
import { useEffect, useRef, useState } from "react";

type Option = string | { label: string; value: string };
export type Field = {
  name?: string;
  type: string;
  label?: string;
  required?: boolean;
  defaultValue?: unknown;
  min?: number;
  max?: number;
  minRows?: number;
  maxRows?: number;
  options?: Option[];
  admin?: { description?: string; initCollapsed?: boolean };
  labels?: { singular: string; plural: string };
  fields?: Field[];
  blocks?: BlockDef[];
  /** On a group: `selector` is the part of the page it edits (the preview scrolls there).
   *  On a text field: `media` makes it a media picker for that kind of file. */
  custom?: { selector?: string; index?: number; media?: MediaKind; shared?: string };
};
/** `custom.shared` names a shared document the block shows; `custom.sharedBy` takes its key from one of
 *  the block's fields (a case study picked by id). Either is edited in place, for every page using it. */
export type BlockDef = { slug: string; labels?: { singular: string }; admin?: { description?: string }; fields: Field[]; custom?: { shared?: string; sharedBy?: { field: string; prefix: string }; sharedList?: string[] } };
export type Schema = { slug: string; fields: Field[] };
export type Row = Record<string, unknown>;

/** Fields with the presentational groups (collapsible) opened up, as the data sees them. */
export const flat = (defs: Field[]): Field[] => defs.flatMap((f) => (f.type === "collapsible" ? flat(f.fields ?? []) : [f]));
const optionValue = (o: Option) => (typeof o === "string" ? o : o.value);
const optionLabel = (o: Option) => (typeof o === "string" ? o : o.label);
export const within = (errorPath: string | undefined, path: string) => !!errorPath && (errorPath === path || errorPath.startsWith(`${path}.`) || errorPath.startsWith(`${path}[`));

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

/** The first piece of visible text in a row (not a collapsed group), to name it in a collapsed list. */
function preview(row: Row, defs: Field[]) {
  for (const f of defs) {
    const v = f.name ? row[f.name] : undefined;
    if ((f.type === "text" || f.type === "textarea" || f.type === "select") && typeof v === "string" && v.trim()) return v;
  }
  return "";
}

export type Problem = { path: string; message: string; where: string[] };

/** validate.mjs reports the first problem as "<path>: <code>"; say it in the editor's words. */
export function explain(error: string, doc: Row, schema: Schema): Problem {
  const cut = error.lastIndexOf(": ");
  let path = error.slice(0, cut);
  const code = error.slice(cut + 2);
  // A block's anchor problem is reported on the block; point at the field inside it.
  const anchorProblem = code === "invalid or duplicate anchor";
  if (anchorProblem) path += ".anchor";
  const where: string[] = [];
  let defs = schema.fields;
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
      const block = field.blocks?.find((b) => b.slug === row?.blockType);
      where.push(`${field.labels?.singular ?? "Section"} ${i + 1}: ${block?.labels?.singular ?? String(row?.blockType)}`);
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
    : code === "too many rows" ? `Tối đa ${field?.maxRows} dòng.`
    : anchorProblem ? "Mã neo sai định dạng hoặc trùng với section khác."
    : code.includes("block ID") ? "Mã section bị trùng. Hãy xoá section này và thêm lại."
    : code === "expected slug" ? "Chỉ dùng chữ thường không dấu, số và gạch ngang, ví dụ ai-engineer."
    : code === "duplicate" ? "Trùng với một mục khác trong danh sách; hãy đặt khác."
    : code;
  return { path, message, where };
}

export type MediaKind = "image" | "video";
export type MediaItem = { path: string; kind: MediaKind; size: number };
/**
 * The files a media field can take: the library (public/media) and this browser's uploads.
 * `upload` stores a picked file and gives its path, or a message saying why it was refused.
 */
export type Media = {
  items: (kind: MediaKind) => (MediaItem & { uploaded: boolean })[];
  urlOf: (path: string) => string;
  upload: (file: File, kind: MediaKind) => Promise<{ path?: string; note?: string }>;
};

/** A shared document a block shows, edited in place. */
export type Shared = { label: string; value: Row; onChange: (v: Row) => void; schema: Schema; problem?: Problem };
/**
 * `problem` is this document's first problem. `active` is the section being edited; `select` makes a
 * section active (the preview scrolls to it). `shared` gives a shared document by key.
 */
export type Ctx = { problem?: Problem; active?: string; select: (id: string, field: string) => void; shared: (key: string) => Shared | undefined; show?: (selector: string) => void; media?: Media };

/** A panel that opens by itself when the current problem is inside it. */
export function Disclosure({ summary, hasProblem, initial = false, className, onOpen, children }: { summary: React.ReactNode; hasProblem: boolean; initial?: boolean; className?: string; onOpen?: () => void; children: React.ReactNode }) {
  const [open, setOpen] = useState(initial);
  useEffect(() => {
    if (hasProblem) setOpen(true);
  }, [hasProblem]);
  return (
    <details
      className={className}
      open={open}
      onToggle={(e) => {
        setOpen(e.currentTarget.open);
        if (e.currentTarget.open) onOpen?.();
      }}
    >
      <summary>{summary}</summary>
      {open && <div className="cms-disclosure-body">{children}</div>}
    </details>
  );
}

export function Fields({ defs, value, onChange, path, ctx }: { defs: Field[]; value: Row; onChange: (v: Row) => void; path: string; ctx: Ctx }) {
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
  if (field.type === "group") return <GroupField field={field} value={(value as Row) ?? {}} onChange={onChange} path={path} ctx={ctx} />;
  if (field.custom?.media && ctx.media) return <MediaField field={field} kind={field.custom.media} value={(value as string) ?? ""} onChange={onChange} path={path} ctx={ctx} media={ctx.media} />;
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

const megabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 2 : 1)} MB`;
const fileName = (path: string) => path.split("/").pop() ?? path;
const ACCEPT: Record<MediaKind, string> = { image: "image/jpeg,image/png,image/webp,image/avif,image/gif", video: "video/mp4" };

function Thumb({ kind, url, empty = "Chưa chọn" }: { kind: MediaKind; url?: string; empty?: string }) {
  if (!url) return <span className="cms-media-empty">{empty}</span>;
  return kind === "video" ? <video src={url} muted playsInline preload="metadata" /> : <img src={url} alt="" />;
}

/** A picture or film: its preview, picked from the library or uploaded from this computer. */
function MediaField({ field, kind, value, onChange, path, ctx, media }: { field: Field; kind: MediaKind; value: string; onChange: (v: unknown) => void; path: string; ctx: Ctx; media: Media }) {
  const id = `f-${path.replace(/[^\w-]/g, "_")}`;
  const problem = ctx.problem?.path === path ? ctx.problem : undefined;
  const library = useRef<HTMLDialogElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<string>();
  // The grid renders only while the library is open, so a closed one loads no previews.
  const [browsing, setBrowsing] = useState(false);
  const items = media.items(kind);
  const current = items.find((i) => i.path === value);
  const noun = kind === "video" ? "video" : "ảnh";
  const pick = (p: string) => {
    onChange(p);
    setNote(undefined);
    library.current?.close();
  };
  /** A file from the picker or dropped on the field. */
  const take = async (file?: File) => {
    if (!file) return;
    const result = await media.upload(file, kind);
    if (result.path) onChange(result.path);
    setNote(result.note);
  };
  // Dragging a file anywhere over the field drops it there; the zone shows it will take it.
  const [over, setOver] = useState(false);
  const carriesFile = (e: React.DragEvent) => [...e.dataTransfer.types].includes("Files");
  return (
    <div
      className={`cms-field cms-media${problem ? " has-problem" : ""}${over ? " is-over" : ""}`}
      data-path={path}
      role="group"
      aria-labelledby={`${id}-label`}
      onDragOver={(e) => {
        if (!carriesFile(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
        setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(false);
      }}
      onDrop={(e) => {
        if (!carriesFile(e)) return;
        e.preventDefault();
        setOver(false);
        take(e.dataTransfer.files[0]);
      }}
    >
      <span className="cms-media-label" id={`${id}-label`}>
        {field.label}
        {field.required && <span className="cms-required" aria-label="bắt buộc"> *</span>}
      </span>
      <div className="cms-media-row">
        {/* The drop zone; a click opens the file picker too. The buttons beside it serve the keyboard. */}
        <div className="cms-media-thumb cms-drop" onClick={() => picker.current?.click()} aria-hidden="true">
          <Thumb kind={kind} url={value ? media.urlOf(value) : undefined} empty={`Kéo thả ${noun} vào đây`} />
          <span className="cms-drop-hint">{over ? `Thả để tải ${noun} lên` : value ? "Kéo thả để thay" : ""}</span>
        </div>
        <div className="cms-media-meta">
          <code>{value ? fileName(value) : "Mặc định"}</code>
          {current && <span className="cms-media-size">{megabytes(current.size)}</span>}
          {current?.uploaded && <span className="cms-badge is-shared">Mới tải lên · lên website khi áp bản nháp</span>}
          <span className="cms-media-actions">
            <button
              type="button"
              onClick={() => {
                setBrowsing(true);
                library.current?.showModal();
              }}
            >
              Chọn từ thư viện
            </button>
            <button type="button" onClick={() => picker.current?.click()}>Tải lên từ máy</button>
            {value && <button type="button" onClick={() => pick("")}>Bỏ</button>}
          </span>
          <input
            ref={picker}
            type="file"
            accept={ACCEPT[kind]}
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              take(file);
            }}
          />
        </div>
      </div>
      {field.admin?.description && <p className="cms-help">{field.admin.description}</p>}
      {note && <p className="cms-media-note" role="status">{note}</p>}
      {problem && <p className="cms-problem">{problem.message}</p>}
      <dialog ref={library} className="cms-library" aria-labelledby={`${id}-library`} onClose={() => setBrowsing(false)}>
        <div className="cms-library-head">
          <h4 id={`${id}-library`}>Chọn {noun}: {field.label}</h4>
          <button type="button" onClick={() => library.current?.close()}>Đóng</button>
        </div>
        {!browsing ? null : items.length === 0 ? (
          <p className="cms-help">Thư viện chưa có {noun}. Dùng “Tải lên từ máy”.</p>
        ) : (
          <ul className="cms-library-grid">
            {items.map((i) => (
              <li key={i.path}>
                <button type="button" aria-pressed={i.path === value} onClick={() => pick(i.path)}>
                  <span className="cms-media-thumb"><Thumb kind={kind} url={media.urlOf(i.path)} /></span>
                  <span className="cms-library-name">{fileName(i.path)}</span>
                  <span className="cms-media-size">{megabytes(i.size)}{i.uploaded ? " · mới tải lên" : ""}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </dialog>
    </div>
  );
}

/** A shared document edited in place: framed and named, so it reads as content other pages show too. */
function SharedFields({ shared, ctx }: { shared: Shared; ctx: Ctx }) {
  return (
    <div className="cms-shared">
      <p className="cms-shared-label">Nội dung dùng chung: {shared.label}</p>
      <Fields defs={shared.schema.fields} value={shared.value} onChange={shared.onChange} path={shared.schema.slug} ctx={{ ...ctx, problem: shared.problem }} />
    </div>
  );
}

/** A part of the page as a framed group; working in it shows that part in the preview. */
function GroupField({ field, value, onChange, path, ctx }: { field: Field; value: Row; onChange: (v: Row) => void; path: string; ctx: Ctx }) {
  const selector = field.custom?.selector;
  const shared = field.custom?.shared ? ctx.shared(field.custom.shared) : undefined;
  return (
    <fieldset
      className="cms-part"
      data-path={path}
      onFocus={(e) => {
        if (!selector || !ctx.show) return;
        e.stopPropagation();
        ctx.show(selector);
      }}
    >
      <legend>{field.label}</legend>
      {field.admin?.description && <p className="cms-help">{field.admin.description}</p>}
      <Fields defs={field.fields ?? []} value={value} onChange={onChange} path={path} ctx={ctx} />
      {shared && <SharedFields shared={shared} ctx={ctx} />}
    </fieldset>
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
      <button type="button" className="cms-add" disabled={rows.length >= (field.maxRows ?? Infinity)} onClick={() => onChange([...rows, blank(defs)])}>
        + Thêm {noun}
      </button>
    </fieldset>
  );
}

function BlocksField({ field, blocks, onChange, path, ctx }: { field: Field; blocks: Row[]; onChange: (v: Row[]) => void; path: string; ctx: Ctx }) {
  const defs = field.blocks ?? [];
  const [adding, setAdding] = useState(defs[0]?.slug ?? "");
  const noun = (field.labels?.singular ?? "section").toLowerCase();
  const name = field.name ?? "";
  const uid = path.replace(/[^\w-]/g, "_");
  const full = blocks.length >= (field.maxRows ?? Infinity);
  return (
    <section className="cms-blocks" aria-labelledby={`${uid}-title`}>
      <h3 id={`${uid}-title`}>{field.label}</h3>
      {field.admin?.description && <p className="cms-help">{field.admin.description}</p>}
      <ol className="cms-rows">
        {blocks.map((block, i) => {
          const def = defs.find((b) => b.slug === block.blockType);
          const blockPath = `${path}[${i}]`;
          const hidden = block.enabled === false;
          const id = String(block.id);
          const by = def?.custom?.sharedBy;
          const sharedKey = def?.custom?.shared ?? (by && block[by.field] ? `${by.prefix}${String(block[by.field])}` : undefined);
          const shared = sharedKey ? ctx.shared(sharedKey) : undefined;
          return (
            // Opening a section or working in any of its fields makes it the one the preview shows.
            <li key={id} className={`cms-block${hidden ? " is-hidden" : ""}${ctx.active === id ? " is-active" : ""}`} onFocus={() => ctx.select(id, name)}>
              <Disclosure
                className="cms-block-panel"
                onOpen={() => ctx.select(id, name)}
                hasProblem={within(ctx.problem?.path, blockPath) || !!shared?.problem || !!def?.custom?.sharedList?.some((k) => ctx.shared(k)?.problem)}
                summary={
                  <>
                    <span className="cms-row-name">{i + 1}. {def?.labels?.singular ?? String(block.blockType)}</span>
                    {hidden && <span className="cms-badge">Đang ẩn</span>}
                    {shared && <span className="cms-badge is-shared">Dùng chung</span>}
                    {(within(ctx.problem?.path, blockPath) || shared?.problem) && <span className="cms-badge is-problem">Cần sửa</span>}
                    <span className="cms-row-preview">{def ? preview(block, def.fields) || (shared ? preview(shared.value, shared.schema.fields) : "") : ""}</span>
                  </>
                }
              >
                {def?.admin?.description && <p className="cms-block-help">{def.admin.description}</p>}
                {def ? (
                  <Fields defs={def.fields} value={block} onChange={(v) => onChange(blocks.map((b, j) => (j === i ? v : b)))} path={blockPath} ctx={ctx} />
                ) : (
                  <p className="cms-problem">Loại “{String(block.blockType)}” không có trong schema.</p>
                )}
                {shared && <SharedFields shared={shared} ctx={ctx} />}
                {def?.custom?.sharedList && (
                  <ol className="cms-rows cms-shared-list">
                    {def.custom.sharedList.map((key) => {
                      const item = ctx.shared(key);
                      if (!item) return null;
                      return (
                        <li key={key}>
                          <Disclosure
                            className="cms-row-panel"
                            hasProblem={!!item.problem}
                            summary={
                              <>
                                <span className="cms-row-name">{preview(item.value, item.schema.fields) || key}</span>
                                <span className="cms-badge is-shared">Dùng chung</span>
                                {item.problem && <span className="cms-badge is-problem">Cần sửa</span>}
                              </>
                            }
                          >
                            <SharedFields shared={item} ctx={ctx} />
                          </Disclosure>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </Disclosure>
              <RowTools index={i} count={blocks.length} min={field.minRows ?? 0} noun={noun}
                onMove={(to) => onChange(move(blocks, i, to))}
                onRemove={() => confirm(`Xoá ${noun} ${i + 1}? Nội dung trong ${noun} sẽ mất.`) && onChange(blocks.filter((_, j) => j !== i))}
                // A copy gets a new identity and no anchor, so both stay unique (PAYLOAD.md).
                onCopy={full ? undefined : () => onChange([...blocks.slice(0, i + 1), { ...structuredClone(block), id: newId(String(block.blockType)), anchor: undefined }, ...blocks.slice(i + 1)])}
              />
            </li>
          );
        })}
      </ol>
      {!full && (
        <div className="cms-add-block">
          <label htmlFor={`${uid}-add`}>Thêm {noun}</label>
          <select id={`${uid}-add`} value={adding} onChange={(e) => setAdding(e.target.value)}>
            {defs.map((b) => (
              <option key={b.slug} value={b.slug}>{b.labels?.singular ?? b.slug}</option>
            ))}
          </select>
          <button
            type="button"
            className="cms-add"
            onClick={() => {
              const id = newId(adding);
              onChange([...blocks, { id, blockType: adding, ...blank(defs.find((b) => b.slug === adding)!.fields) }]);
              ctx.select(id, name);
            }}
          >
            + Thêm vào cuối
          </button>
        </div>
      )}
    </section>
  );
}
