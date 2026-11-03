// Case studies shown as a paper card that opens into a 3D spread (ProjectCase in Applications.tsx).
// The case studies themselves are content (src/content/cases/<id>.json, registry.ts CASES).
// `tone` is the folder colour of the paper. `mock` cases stand in for case studies whose copy has
// not been supplied (no badge is shown on the site; the flag keeps them traceable until real copy lands).

export type CaseTone = "white" | "navy" | "kraft" | "graphite";
/** How the case is drawn and how it opens: a paper folder that opens like a book (TDN), a phone
 *  whose call plays out, a clipboard board whose columns unfold, or a server stack that separates. */
export type CaseModel = "folder" | "call" | "board" | "stack";
/** The subject drawn on a folder's paper (Applications.tsx); without one the paper shows rule lines. */
export type PaperGlyphKind = "agents" | "pipeline" | "data" | "platform" | "web" | "flow" | "ledger";
export type CaseData = {
  id: string;
  name: string;
  org: string;
  index: string;
  summary: string;
  description: string;
  note: string;
  kicker: string;
  /** The three sheets standing at the back of the spread, and the line under each. */
  checks: [string, string, string];
  checkFoot: string;
  tag: string;
  headline: [string, string];
  stamp: [string, string];
  tone: CaseTone;
  model: CaseModel;
  /** call: the scripted exchange shown on the phone. */
  script?: { who: "in" | "agent"; text: string }[];
  /** board: the columns and their cards. */
  board?: { col: string; cards: string[] }[];
  glyph?: PaperGlyphKind;
  mock?: boolean;
};
