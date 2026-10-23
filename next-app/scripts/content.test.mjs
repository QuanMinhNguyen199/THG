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
  page.layout[1].items[0].pad = 1000;
  assert.throws(() => validateDocument(page, schema), /invalid number/);
  const other = sample();
  other.layout.at(-1).href = 'javascript:alert(1)';
  assert.throws(() => validateDocument(other, schema), /HTTP/);
});
