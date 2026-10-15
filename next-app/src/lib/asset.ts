/** Prefixes a file in /public with the deploy base path (e.g. "/THG" on GitHub Pages, "" locally). */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
