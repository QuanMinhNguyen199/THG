import { readFileSync } from 'node:fs';
import { validateDocument } from '../src/content/validate.mjs';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const schema = read('../src/content/payload/pages.collection.json');
const home = read('../src/content/pages/home.json');
validateDocument(home, schema);
const blocks = schema.fields.find(field => field.name === 'layout').blocks;
for (const [name, value] of [
  ['cta', read('../src/content/globals/cta.json')],
  ['metrics', { label: 'Metrics', items: read('../src/content/globals/metrics.json') }],
]) {
  validateDocument(value, { slug: name, fields: blocks.find(block => block.slug === name).fields });
}
console.log(`Content valid: ${home.layout.length} home blocks and shared defaults.`);
