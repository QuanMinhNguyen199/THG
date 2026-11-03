// Writes CONTENT-SPEC.md: the block and field specification for the dev team building the CMS, read
// from the same schemas the site validates against (build-collection.mjs), and each page's sections
// in order, read from the current content. Run with `npm run content:spec`; the tests check it is current.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SCHEMAS } from './build-collection.mjs';
import { DOCS } from '../src/content/registry.ts';

const root = new URL('../', import.meta.url);
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** How a field is built in Payload: its type, with what our schema marks on it. */
function payloadType(f) {
  if (f.custom?.media) return `upload → Media (${f.custom.media === 'video' ? 'video MP4' : 'ảnh JPG/PNG/WebP/AVIF/GIF'})`;
  if (f.type === 'select') return `select: ${(f.options ?? []).map((o) => `\`${o.value ?? o}\`${o.label && o.label !== (o.value ?? o) ? ` (${o.label})` : ''}`).join(', ')}`;
  if (f.type === 'array') return `array${f.minRows || f.maxRows ? ` (${f.minRows ?? 0}–${f.maxRows ?? 'n'} dòng)` : ''}`;
  if (f.type === 'blocks') return `blocks${f.maxRows ? ` (tối đa ${f.maxRows})` : ''}: ${f.blocks.map((b) => `\`${b.slug}\``).join(', ')}`;
  return f.type;
}
function rules(f) {
  return [
    f.custom?.slug && 'chữ thường, số, gạch ngang',
    f.unique && 'không trùng',
    (f.name === 'href' || f.name?.endsWith('Href')) && 'đường dẫn bắt đầu bằng /, # hoặc https://',
    f.min !== undefined && `≥ ${f.min}`,
    f.max !== undefined && `≤ ${f.max}`,
    f.defaultValue !== undefined && `mặc định ${JSON.stringify(f.defaultValue)}`,
  ].filter(Boolean).join('; ');
}

/** Field rows, nested fields as dotted names (items[].title); collapsible groups noted as UI only. */
function rows(defs, prefix = '', ui = '') {
  return defs.flatMap((f) => {
    if (f.type === 'collapsible') return rows(f.fields, prefix, `nhóm thu gọn "${f.label}"`);
    const name = `${prefix}${f.name}`;
    const note = [f.admin?.description, ui && `(trong ${ui})`, f.custom?.shared && `Hiện kèm tài liệu dùng chung \`${f.custom.shared}\`.`].filter(Boolean).join(' ');
    const row = `| \`${name}\` | ${cell(f.label)} | ${cell(payloadType(f))} | ${f.required ? 'có' : ''} | ${cell(rules(f))} | ${cell(note)} |`;
    const nested = f.type === 'array' ? rows(f.fields, `${name}[].`) : f.type === 'group' ? rows(f.fields, `${name}.`) : [];
    return [row, ...nested];
  });
}
const table = (defs) => ['| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |', '|---|---|---|---|---|---|', ...rows(defs)].join('\n');

function blockSection(b, level) {
  const shared = b.custom?.shared ? `Hiện kèm tài liệu dùng chung \`${b.custom.shared}\` (relationship).` : b.custom?.sharedBy ? `Field \`${b.custom.sharedBy.field}\` chọn một case study (relationship tới collection \`case\`).` : '';
  return [
    `${'#'.repeat(level)} \`${b.slug}\`: ${b.labels?.singular ?? b.slug}`,
    '',
    [b.admin?.description, shared].filter(Boolean).join(' '),
    '',
    b.fields.length ? table(b.fields) : '_Không có field: block chỉ đặt vị trí, nội dung lấy từ nơi khác._',
    '',
  ].join('\n');
}

const ORDER = [
  ['pages', 'Collection', 'Trang chủ'],
  ['corporate', 'Collection', 'Trang tổng và trang con của Giải pháp, Use Case, Về THEHEGEO; trang tổng Tuyển dụng'],
  ['jobs', 'Collection', 'Tin tuyển dụng (mỗi dòng của `jobs` là một bản ghi; trang `/tuyen-dung/<slug>/`)'],
  ['case', 'Collection', 'Case study (thẻ hồ sơ 3D), dùng chung giữa các trang'],
  ['geoagents', 'Global', 'Trang GEOagents (các phần cố định của trang)'],
  ['header', 'Global', 'Menu'],
  ['footer', 'Global', 'Khẩu hiệu, liên hệ cuối trang'],
  ['ways', 'Global', '"Cách chúng tôi làm việc", dùng chung cho Sứ mệnh và Tuyển dụng'],
];

export function buildSpec() {
  // Section blocks and the heading's picture (model) are counted apart: they are different lists.
  const count = (s) => s.fields.filter((f) => f.type === 'blocks').map((f) => `${f.blocks.length} ${f.name === 'model' ? 'hình minh hoạ' : 'loại section'}`).join(' + ');
  const out = [
    '# Đặc tả nội dung: block và field',
    '',
    '> Tài liệu sinh tự động từ `scripts/build-collection.mjs` (`npm run content:spec`); đừng sửa tay.',
    '> Đây là đặc tả để đối chiếu với block đã có bên CMS và nhập nội dung trong admin. Không cần seed:',
    '> file JSON trong `src/content` chỉ là nội dung hiện tại của site, liệt kê lại ở mục 3 để nhập tay.',
    '',
    '## 1. Tổng quan',
    '',
    '| Tên | Dạng | Dùng cho | Block |',
    '|---|---|---|---|',
    ...ORDER.map(([name, kind, use]) => `| \`${name}\` | ${kind} | ${use} | ${count(SCHEMAS[name]) || '—'} |`),
    '',
    'Quy ước chung:',
    '',
    '- Mỗi section có `enabled` (ẩn tạm mà không mất nội dung). Thứ tự section trong field `blocks`/`layout` là thứ tự trên trang.',
    '- Field kiểu `upload` hiện là đường dẫn trong `public/media`; bên CMS làm thành upload tới collection Media.',
    '- "Tài liệu dùng chung" (`ways`, `case:<id>`, `jobs`) là relationship: sửa một chỗ, mọi trang dùng nó cùng đổi.',
    '- Hai field văn bản kiểu `title` + `highlight`: dòng thường và dòng màu nhấn của một tiêu đề.',
    '',
    '## 2. Block và field',
    '',
  ];
  for (const [name] of ORDER) {
    const schema = SCHEMAS[name];
    out.push(`### ${name}`, '');
    const plain = schema.fields.filter((f) => f.type !== 'blocks');
    if (plain.length) out.push(table(plain), '');
    for (const field of schema.fields.filter((f) => f.type === 'blocks')) {
      out.push(`**${field.label}** (\`${field.name}\`): ${field.admin?.description ?? ''}`, '');
      for (const b of field.blocks) out.push(blockSection(b, 4));
    }
  }

  out.push('## 3. Nội dung hiện tại của từng trang', '', 'Section theo thứ tự trên trang. Cột "Nội dung" là phần chữ để nhận ra section; bản đầy đủ ở file nguồn.', '');
  for (const doc of DOCS.filter((d) => ['pages', 'corporate'].includes(d.schema))) {
    const data = JSON.parse(readFileSync(new URL(doc.file, root), 'utf8'));
    const list = data.layout ?? data.blocks ?? [];
    const defs = SCHEMAS[doc.schema].fields.find((f) => f.type === 'blocks' && f.name !== 'model').blocks;
    out.push(`### ${doc.path} · ${data.name ?? data.title} (\`${doc.schema}\`, nguồn \`${doc.file.replace('src/', '')}\`)`, '', '| # | Block | Nội dung |', '|---|---|---|');
    list.forEach((b, i) => {
      const def = defs.find((d) => d.slug === b.blockType);
      const text = b.title ?? b.heading ?? b.label ?? b.statement ?? b.body ?? (b.caseId && `case \`${b.caseId}\``) ?? '';
      out.push(`| ${i + 1} | \`${b.blockType}\` ${def?.labels?.singular ?? ''}${b.enabled === false ? ' (đang ẩn)' : ''} | ${cell(text)} |`);
    });
    if (data.model?.length) out.push(`| — | Hình minh hoạ \`${data.model[0].blockType}\` | |`);
    if (data.cta?.length) out.push(`| — | Nút cuối trang | ${cell(data.cta.map((a) => a.label).join(' · '))} |`);
    out.push('');
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n') + '\n';
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(new URL('CONTENT-SPEC.md', root), buildSpec());
  console.log('Wrote CONTENT-SPEC.md');
}
