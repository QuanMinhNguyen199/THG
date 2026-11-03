"use client";

// The content editor's form, built from a Payload-style schema (src/content/payload/*.json): fields,
// arrays and blocks with their labels and help text, and validate.mjs's first problem explained in
// the editor's words at the field it is about.
import { useEffect, useState } from "react";

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
  /** On a group: `selector` is the part of the page it edits (the preview scrolls there). */
  custom?: { selector?: string };
};
/** `custom.shared` names a shared document the block shows (edited in place, for every page using it). */
export type BlockDef = { slug: string; labels?: { singular: string }; admin?: { description?: string }; fields: Field[]; custom?: { shared?: string } };
export type Schema = { slug: string; fields: Field[] };
export type Row = Record<string, unknown>;

/** Fields with the presentational groups (collapsible) opened up, as the data sees them. */
const flat = (defs: Field[]): Field[] => defs.flatMap((f) => (f.type === "collapsible" ? flat(f.fields ?? []) : [f]));
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
    : code;
  return { path, message, where };
}

/** A shared document a block shows, edited in place. */
export type Shared = { label: string; value: Row; onChange: (v: Row) => void; schema: Schema; problem?: Problem };
/**
 * `problem` is this document's first problem. `active` is the section being edited; `select` makes a
 * section active (the preview scrolls to it). `shared` gives a shared document by key.
 */
export type Ctx = { problem?: Problem; active?: string; select: (id: string, field: string) => void; shared: (key: string) => Shared | undefined; show?: (selector: string) => void };

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

/** A part of the page as a framed group; working in it shows that part in the preview. */
function GroupField({ field, value, onChange, path, ctx }: { field: Field; value: Row; onChange: (v: Row) => void; path: string; ctx: Ctx }) {
  const selector = field.custom?.selector;
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
          const shared = def?.custom?.shared ? ctx.shared(def.custom.shared) : undefined;
          return (
            // Opening a section or working in any of its fields makes it the one the preview shows.
            <li key={id} className={`cms-block${hidden ? " is-hidden" : ""}${ctx.active === id ? " is-active" : ""}`} onFocus={() => ctx.select(id, name)}>
              <Disclosure
                className="cms-block-panel"
                onOpen={() => ctx.select(id, name)}
                hasProblem={within(ctx.problem?.path, blockPath) || !!shared?.problem}
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
                {shared && (
                  <div className="cms-shared">
                    <p className="cms-shared-label">Nội dung dùng chung: {shared.label}</p>
                    <Fields defs={shared.schema.fields} value={shared.value} onChange={shared.onChange} path={shared.schema.slug} ctx={{ ...ctx, problem: shared.problem }} />
                  </div>
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
