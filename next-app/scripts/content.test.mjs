import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { validateDocument } from '../src/content/validate.mjs';
import { PARTNER_LOGOS, PARTNER_NAMES } from '../src/components/site/sections/partners.ts';
import { DOCS, buildContent } from '../src/content/registry.ts';
import { SCHEMAS } from './build-collection.mjs';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const schema = read('../src/content/payload/pages.json');
const sample = () => read('../src/content/pages/home.json');
// Every stored document by key, as the site builds its content from them.
const stored = () => Object.fromEntries(DOCS.filter(d => existsSync(new URL(`../${d.file}`, import.meta.url))).map(d => [d.key, read(`../${d.file}`)]));
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
  for (const generated of Object.values(SCHEMAS)) walk(generated.fields, generated.slug);
  assert.deepEqual(missing, []);
});
test('every schema in payload/ is what build-collection.mjs generates (run npm run content:schema)', () => {
  for (const [name, generated] of Object.entries(SCHEMAS))
    assert.deepEqual(read(`../src/content/payload/${name}.json`), JSON.parse(JSON.stringify(generated)), name);
});
test('every partner logo belongs to a listed partner, and only known partners lack a logo', () => {
  // Shown by name until a logo is supplied; a name missing here is usually a typo.
  const withoutLogo = ['TMS'];
  assert.deepEqual(Object.keys(PARTNER_LOGOS).filter(name => !PARTNER_NAMES.includes(name)), []);
  assert.deepEqual(PARTNER_NAMES.filter(name => !PARTNER_LOGOS[name]), withoutLogo);
});
test('each home navigation tile lists every page of its section', () => {
  const tiles = sample().layout.find(block => block.blockType === 'navigationTiles').tiles;
  const missing = [];
  for (const section of Object.values(buildContent(stored()).sections)) {
    const tile = tiles.find(t => t.href === section.base);
    if (!tile) continue;
    for (const page of section.pages)
      if (!tile.lines.some(line => line.text.startsWith(page.name))) missing.push(`${tile.title}: ${page.name}`);
  }
  assert.deepEqual(missing, []);
});
test('media.json lists exactly the images and videos in public/media (run npm run content:media)', async () => {
  const { listMedia } = await import('./build-media.mjs');
  assert.deepEqual(read('../src/content/media.json'), listMedia());
});
test('media fields take only their kind of file', () => {
  const page = sample();
  page.layout[0].video = '/media/hero-poster.jpg';
  assert.throws(() => validateDocument(page, schema), /wrong media type/);
  page.layout[0].video = '/media/hero-1080.mp4';
  page.layout[0].poster = '/media/logo.svg';
  assert.throws(() => validateDocument(page, schema), /wrong media type/);
});
test('postings need a well-formed slug, unique in the list', () => {
  const schema = read('../src/content/payload/jobs.json');
  const list = () => read('../src/content/jobs.json');
  const spaced = list();
  spaced.jobs[0].slug = 'AI Engineer';
  assert.throws(() => validateDocument(spaced, schema), /jobs\[0\]\.slug: expected slug/);
  const twice = list();
  twice.jobs[1].slug = twice.jobs[0].slug;
  assert.throws(() => validateDocument(twice, schema), /jobs\[1\]\.slug: duplicate/);
  const added = list();
  added.jobs.push({ ...added.jobs[0], slug: 'new-role', title: 'New role' });
  assert.doesNotThrow(() => validateDocument(added, schema));
});
test('CONTENT-SPEC.md is what build-spec.mjs generates (run npm run content:spec)', async () => {
  const { buildSpec } = await import('./build-spec.mjs');
  assert.equal(readFileSync(new URL('../CONTENT-SPEC.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n'), buildSpec());
});
