// Page and block types every section shares. The pages themselves are content (src/content/pages).

export type Link = { href: string; label: string };
export type Cell = string | { text: string; href: string };
/** `key` is the stored section's id (the content editor scrolls its preview to it). */
export type Block = { key?: string } & (
  /** Three or more linked cards (a section's pages) read as rows; once the first has an `image`,
   *  they become a large lead card with that image beside compact cards. */
  | { type: "cards"; title?: string; items: { title: string; body?: string; href?: string; cta?: string; image?: string }[] }
  /** Shown as cards: one per row (its first cell is the title, the others are labelled by `head`),
   *  or one per column with `by: "column"`. A card with a link cell opens that link. */
  | { type: "table"; title?: string; head: string[]; rows: Cell[][]; by?: "column" }
  | { type: "steps"; title?: string; flow?: boolean; items: { title: string; body?: string }[]; note?: string }
  | { type: "list"; title?: string; items: { title?: string; body: string; href?: string }[] }
  | { type: "text"; title?: string; body: string[]; link?: Link }
  | { type: "pills"; title?: string; items: string[] }
  | { type: "timeline"; title?: string; items: { year: string; label: string }[] }
  | { type: "layers"; title?: string; items: string[] }
  | { type: "partners"; title?: string; groups: { group: string; names: string[] }[] }
  /** A statement set large, with an optional plain paragraph under it. */
  | { type: "callout"; title?: string; body: string; detail?: string; en?: string }
  /** A statement beside concentric rings growing from the first item (innermost, red) outwards. */
  | { type: "rings"; title?: string; statement: string; body: string; items: string[] }
  /** Short values set as one row of large words. */
  | { type: "values"; title?: string; items: string[] }
  | { type: "case"; title?: string; id: string }
  | {
      type: "project";
      title: string;
      client: string;
      problem: string;
      solution: string[];
      result: string;
      dossier?: { period: string; status: string; scope: string; role: string };
      link?: Link;
    }
  | { type: "contact" }
  | { type: "jobs" }
);

/** The model beside a detail page's heading (PageModels.tsx), drawn from the page's own copy. */
export type Model =
  | { kind: "core" }
  | { kind: "bridge"; labels: [string, string, string, string] }
  | { kind: "devices"; items: string[] }
  | { kind: "phone"; title: string; caller: string; script: { who: "in" | "agent"; text: string }[] }
  | { kind: "stack"; layers: { label: string; chips?: string[] }[] };

type Action = { label: string; href?: string };

export type Page = {
  slug: string;
  /** Menu and card name. */
  name: string;
  /** Short line under the name on cards and in "Xem thêm". */
  kind?: string;
  title: string;
  en?: string;
  lead?: string;
  blocks: Block[];
  /** One action, or several: the first is the main button, the rest are secondary. */
  cta?: Action | Action[];
  image?: string;
  model?: Model;
};
