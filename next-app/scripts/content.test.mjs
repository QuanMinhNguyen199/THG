import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateDocument } from '../src/content/validate.mjs';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const schema = read('../src/content/payload/pages.collection.json');
const sample = () => read('../src/content/pages/home.json');
test('allows reordering, disabling, and repeating a block with a distinct ID and anchor', () => {
  const page = sample();
  page.layout.reverse();
  page.layout[0].enabled = false;
  page.layout.push({ ...page.layout[0], id: 'another-cta', anchor: 'another-cta' });
  assert.doesNotThrow(() => validateDocument(page, schema));
});
test('rejects duplicate identities and anchors', () => {
  for (const property of ['id', 'anchor']) {
    const page = sample();
    page.layout[1][property] = page.layout[0][property];
    assert.throws(() => validateDocument(page, schema), /duplicate/);
  }
});
test('rejects unsupported blocks and missing content', () => {
  const page = sample();
  page.layout[0].blockType = 'unknown';
  assert.throws(() => validateDocument(page, schema), /unknown block/);
  const other = sample();
  delete other.layout[0].heading;
  assert.throws(() => validateDocument(other, schema), /required/);
});
test('rejects invalid metrics and executable links', () => {
  const page = sample();
  page.layout[1].items[0].minDigits = 1000;
  assert.throws(() => validateDocument(page, schema), /invalid number/);
  const other = sample();
  other.layout.at(-1).href = 'javascript:alert(1)';
  assert.throws(() => validateDocument(other, schema), /HTTP/);
});
test('rejects partners without a logo entry and unknown tile sizes', () => {
  const page = sample();
  page.layout.find(block => block.blockType === 'partners').items[0].name = 'Đối tác gõ sai';
  assert.throws(() => validateDocument(page, schema), /invalid option/);
  const other = sample();
  other.layout.find(block => block.blockType === 'navigationTiles').tiles[0].size = 'huge';
  assert.throws(() => validateDocument(other, schema), /invalid option/);
});
test('checks fields inside the collapsed advanced group', () => {
  const page = sample();
  page.layout[0].anchor = '1-starts-with-digit';
  assert.throws(() => validateDocument(page, schema), /anchor/);
  const other = sample();
  delete other.layout.find(block => block.blockType === 'metrics').label;
  assert.throws(() => validateDocument(other, schema), /label: required/);
});
test('every field an editor sees has a Vietnamese label', () => {
  const missing = [];
  const walk = (definitions, path) => definitions.forEach(field => {
    const key = `${path}.${field.name ?? field.type}`;
    if (!field.label) missing.push(key);
    if (field.fields) walk(field.fields, key);
    field.blocks?.forEach(block => { if (!block.labels?.singular) missing.push(`${key}.${block.slug}`); walk(block.fields, `${key}.${block.slug}`); });
  });
  walk(schema.fields, schema.slug);
  assert.deepEqual(missing, []);
});
