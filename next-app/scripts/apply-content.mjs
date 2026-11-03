// Writes a draft file from the content editor ("Tải bản nháp" at /soan-noi-dung) into the repository.
// Every document in it must be a known content file and pass its schema, and the site must still
// build its content with them; otherwise nothing is written.
// Usage: npm run content:apply -- path/to/noi-dung-ban-nhap.json
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { validateDocument } from '../src/content/validate.mjs';
import { DOCS, buildContent } from '../src/content/registry.ts';

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
buildContent(raw);
for (const [path, data] of writes) writeFileSync(new URL(path, root), JSON.stringify(data, null, 2) + '\n');
console.log(`Wrote ${writes.length} document(s):\n${writes.map(([p]) => `  ${p}`).join('\n')}\nReview with git diff, then build.`);
