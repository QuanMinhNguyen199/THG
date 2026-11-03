// Writes a draft file from the content editor ("Tải bản nháp" at /soan-noi-dung) into the repository:
// its documents into src/content, and the files uploaded with it into public/media/uploads.
// Every document must be a known content file and pass its schema, every uploaded file must be a
// media type the site takes, every media path the documents use must exist, and the site must still
// build its content; otherwise nothing is written.
// Usage: npm run content:apply -- path/to/noi-dung-ban-nhap.json
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { validateDocument } from '../src/content/validate.mjs';
import { DOCS, buildContent } from '../src/content/registry.ts';
import { listMedia } from './build-media.mjs';
import { missingMedia } from './check-content.mjs';

const [file] = process.argv.slice(2);
if (!file) {
  console.error('Usage: npm run content:apply -- path/to/noi-dung-ban-nhap.json');
  process.exit(1);
}
const root = new URL('../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const bundle = JSON.parse(readFileSync(file, 'utf8'));
if (bundle.kind !== 'thehegeo-content-drafts' || typeof bundle.files !== 'object') throw new Error(`${file} is not a draft file from the content editor.`);

const raw = Object.fromEntries(DOCS.filter(d => existsSync(new URL(d.file, root))).map(d => [d.key, read(d.file)]));
const writes = [];
for (const [path, data] of Object.entries(bundle.files)) {
  const doc = DOCS.find(d => d.file === path);
  if (!doc) throw new Error(`${path} is not a content document (registry.ts); nothing written.`);
  try {
    validateDocument(data, read(`src/content/payload/${doc.schema}.json`));
  } catch (e) {
    throw new Error(`${path}: ${e.message}; nothing written.`);
  }
  raw[doc.key] = data;
  writes.push([path, data]);
}

// Uploads: only into public/media/uploads, with a plain name and a media type, at most 100 MB.
const uploads = [];
for (const [path, base64] of Object.entries(bundle.media ?? {})) {
  if (!/^public\/media\/uploads\/[a-z0-9-]+\.(jpe?g|png|webp|avif|gif|mp4)$/.test(path)) throw new Error(`${path}: not an upload the site takes; nothing written.`);
  const bytes = Buffer.from(String(base64), 'base64');
  if (bytes.length === 0 || bytes.length > 100 * 1024 * 1024) throw new Error(`${path}: empty or over 100 MB; nothing written.`);
  uploads.push([path, bytes]);
}
const coming = new Set(uploads.map(([p]) => p.slice('public'.length)));
const missing = missingMedia(raw).filter(p => !coming.has(p));
if (missing.length) throw new Error(`Media used but not found: ${missing.join(', ')}; nothing written.`);
buildContent(raw);

mkdirSync(new URL('public/media/uploads/', root), { recursive: true });
for (const [path, bytes] of uploads) writeFileSync(new URL(path, root), bytes);
for (const [path, data] of writes) writeFileSync(new URL(path, root), JSON.stringify(data, null, 2) + '\n');
writeFileSync(new URL('src/content/media.json', root), JSON.stringify(listMedia(), null, 2) + '\n');
console.log([
  `Wrote ${writes.length} document(s) and ${uploads.length} media file(s):`,
  ...[...writes, ...uploads].map(([p]) => `  ${p}`),
  'Updated src/content/media.json. Review with git diff, then build.',
].join('\n'));
