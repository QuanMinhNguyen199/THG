// Validates every content document (registry.ts) against its schema, then builds the site's content
// from them, so a build never starts from content the site cannot render. Runs before every build.
import { readFileSync } from 'node:fs';
import { validateDocument } from '../src/content/validate.mjs';
import { DOCS, buildContent } from '../src/content/registry.ts';

const root = new URL('../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));

const raw = {};
for (const doc of DOCS) {
  const data = read(doc.file);
  try {
    validateDocument(data, read(`src/content/payload/${doc.schema}.json`));
  } catch (e) {
    throw new Error(`${doc.file}: ${e.message}`);
  }
  raw[doc.key] = data;
}
buildContent(raw);
console.log(`Content valid: ${Object.keys(raw).length} documents.`);
