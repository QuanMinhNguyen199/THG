"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CONTENT, PUBLISHED } from "@/content/published";
import { buildContent, type Content } from "@/content/registry";

// Clears the fixed site header when scrolling a part into view.
const HEADER = 96;

type Drafts = Record<string, unknown>;
const Context = createContext<{ content: Content; drafts?: Drafts }>({ content: CONTENT });

/** The site's content: the published documents, or, inside the content editor's preview, its drafts. */
export const useContent = () => useContext(Context).content;
/** The editor's draft documents by key, only inside its preview. */
export const useDrafts = () => useContext(Context).drafts;

/**
 * Links a site page to the content editor (/soan-noi-dung) when the page is shown in the editor's
 * preview iframe: it tells the editor which page is showing, lays the editor's drafts over the
 * published content, and scrolls to and outlines the part the editor picks. Outside that iframe it
 * only provides the published content; messages only travel within the same origin.
 */
export function EditorBridge({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [framed, setFramed] = useState(false);
  const [drafts, setDrafts] = useState<Drafts>();
  const [note, setNote] = useState<string>();

  useEffect(() => {
    if (parent === window) return;
    setFramed(true);
    const receive = (e: MessageEvent) => {
      if (e.origin !== location.origin) return;
      if (e.data?.type === "cms:drafts") setDrafts(e.data.drafts as Drafts);
      if (e.data?.type === "cms:part") {
        document.querySelectorAll(".cms-preview-focus").forEach((el) => el.classList.remove("cms-preview-focus"));
        // Next keeps pages visited before in the document, hidden: only the page on screen counts.
        const shown = e.data.selector ? [...document.querySelectorAll<HTMLElement>(e.data.selector)].filter((x) => x.getClientRects().length > 0) : [];
        const el = shown[e.data.index ?? 0];
        setNote(el ? undefined : e.data.note);
        if (!el) return;
        el.classList.add("cms-preview-focus");
        const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
        scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + scrollY - HEADER), behavior: still ? "auto" : "smooth" });
      }
    };
    addEventListener("message", receive);
    return () => removeEventListener("message", receive);
  }, []);

  useEffect(() => {
    if (parent === window) return;
    // A new page starts with nothing picked: drop any outline the previous page left behind.
    document.querySelectorAll(".cms-preview-focus").forEach((el) => el.classList.remove("cms-preview-focus"));
    setNote(undefined);
    parent.postMessage({ type: "cms:page", path: pathname }, location.origin);
  }, [pathname]);

  // The editor sends only drafts that pass validation; should one still not build, keep the published site.
  const content = useMemo(() => {
    if (!drafts) return CONTENT;
    try {
      return buildContent({ ...PUBLISHED, ...drafts });
    } catch {
      return CONTENT;
    }
  }, [drafts]);

  return (
    <Context.Provider value={{ content, drafts }}>
      {children}
      {framed && (
        <style>{`.cms-preview-focus{outline:3px solid #c1152b;outline-offset:-3px}
.cms-preview-note{position:fixed;left:50%;bottom:20px;z-index:200;transform:translateX(-50%);max-width:calc(100% - 32px);margin:0;padding:10px 16px;border-radius:8px;background:#17181b;color:#fff;font:600 14px/1.4 system-ui,sans-serif;box-shadow:0 8px 24px #0006}`}</style>
      )}
      {note && (
        <p className="cms-preview-note" role="status">
          {note}
        </p>
      )}
    </Context.Provider>
  );
}
