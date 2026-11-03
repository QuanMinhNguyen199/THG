"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type { SectionKey } from "@/content/registry";
import { useDrafts } from "./EditorBridge";

/** Which page a draft renders as. */
export type Target =
  | { kind: "home" }
  | { kind: "overview"; section: SectionKey }
  | { kind: "detail"; section: SectionKey; slug: string }
  | { kind: "jobs" }
  | { kind: "job"; slug: string };
// The GEOagents page needs no Editable: its components read the content themselves (useContent).

// Loaded only once the content editor sends drafts, so visitors never download it.
const DraftView = dynamic(() => import("./DraftView"), { ssr: false });

/** The page as published (server rendered), or, inside the content editor's preview, its draft. */
export function Editable({ target, children }: { target: Target; children: ReactNode }) {
  return useDrafts() ? <DraftView target={target} /> : <>{children}</>;
}
