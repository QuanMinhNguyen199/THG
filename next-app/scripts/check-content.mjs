// Validates every content document (registry.ts) against its schema, checks every media file it uses
// exists in public/, then builds the site's content from them, so a build never starts from content
// the site cannot render. Runs before every build.
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateDocument } from '../src/content/validate.mjs';
import { DOCS, buildContent } from '../src/content/registry.ts';

const root = new URL('../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));

/** Media paths (/media/…) the documents use that are not in public/. */
export function missingMedia(raw) {
  const used = new Set([...JSON.stringify(raw).matchAll(/"(\/media\/[^"]+)"/g)].map(m => m[1]));
  return [...used].filter(p => !existsSync(new URL(`public${p}`, root)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
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
  const missing = missingMedia(raw);
  if (missing.length) throw new Error(`Media used but not in public/: ${missing.join(', ')}`);
  buildContent(raw);
  console.log(`Content valid: ${Object.keys(raw).length} documents, every media file present.`);
}
