// Lists the images and videos in public/media into src/content/media.json: the library the content
// editor offers to pick from. Run with `npm run content:media` after adding or removing a file there
// (content:apply runs it after writing uploads); the tests check the list is current.
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** File types a media field takes, by kind. SVG is left out: opened directly, it can run scripts. */
export const MEDIA_TYPES = {
  image: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'],
  video: ['mp4'],
};
const kindOf = (name) => Object.entries(MEDIA_TYPES).find(([, exts]) => exts.includes(name.split('.').pop().toLowerCase()))?.[0];

export function listMedia() {
  const root = new URL('../public/media/', import.meta.url);
  const found = [];
  (function walk(dir, prefix) {
    for (const name of readdirSync(dir).sort()) {
      const full = new URL(name, dir);
      if (statSync(full).isDirectory()) walk(new URL(`${name}/`, dir), `${prefix}${name}/`);
      else if (kindOf(name)) found.push({ path: `/media/${prefix}${name}`, kind: kindOf(name), size: statSync(full).size });
    }
  })(root, '');
  return found;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const media = listMedia();
  writeFileSync(new URL('../src/content/media.json', import.meta.url), JSON.stringify(media, null, 2) + '\n');
  console.log(`Wrote media.json: ${media.length} files.`);
}
