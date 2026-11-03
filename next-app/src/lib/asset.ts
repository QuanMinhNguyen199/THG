// Files uploaded in the content editor (/soan-noi-dung), by the path they will have once applied,
// as object URLs: its preview shows them before they exist on the site. Empty everywhere else.
const drafts = new Map<string, string>();

/** Sets the content editor's uploaded files (EditorBridge, inside the editor's preview only). */
export function setDraftMedia(files: Record<string, string>) {
  drafts.clear();
  for (const [path, url] of Object.entries(files)) drafts.set(path, url);
}

/** Prefixes a file in /public with the deploy base path (e.g. "/THG" on GitHub Pages, "" locally). */
export const asset = (path: string) => drafts.get(path) ?? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
