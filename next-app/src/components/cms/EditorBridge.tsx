"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CONTENT, PUBLISHED } from "@/content/published";
import { buildContent, type Content } from "@/content/registry";
import { setDraftMedia } from "@/lib/asset";

// Clears the fixed site header when scrolling a part into view.
const HEADER = 96;
const FOCUS = "cms-preview-focus";

type Part = { selector: string; index: number };
/** The part on screen: Next keeps pages visited before in the document, hidden, so those do not count. */
const find = (p: Part) => [...document.querySelectorAll<HTMLElement>(p.selector)].filter((x) => x.getClientRects().length > 0)[p.index];
/** Outlines the part, and only it. */
function outline(el?: HTMLElement) {
  document.querySelectorAll(`.${FOCUS}`).forEach((x) => x !== el && x.classList.remove(FOCUS));
  el?.classList.add(FOCUS);
}

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
  // Files uploaded in the editor: asset() resolves their paths to these, and the content rebuilds.
  const [mediaVersion, setMediaVersion] = useState(0);
  // The part the editor picked last, so its outline survives the page rendering again.
  const picked = useRef<Part | null>(null);

  useEffect(() => {
    if (parent === window) return;
    setFramed(true);
    let urls: string[] = [];
    const receive = (e: MessageEvent) => {
      if (e.origin !== location.origin) return;
      if (e.data?.type === "cms:media") {
        // The Blobs arrive as copies; this page makes its own object URLs for them.
        urls.forEach((u) => URL.revokeObjectURL(u));
        const made = Object.fromEntries(Object.entries(e.data.files as Record<string, Blob>).map(([path, blob]) => [path, URL.createObjectURL(blob)]));
        urls = Object.values(made);
        setDraftMedia(made);
        setMediaVersion((v) => v + 1);
      }
      if (e.data?.type === "cms:drafts") setDrafts(e.data.drafts as Drafts);
      if (e.data?.type === "cms:part") {
        picked.current = e.data.selector ? { selector: String(e.data.selector), index: Number(e.data.index ?? 0) } : null;
        const el = picked.current ? find(picked.current) : undefined;
        outline(el);
        setNote(el ? undefined : e.data.note);
        if (!el) return;
        const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
        scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + scrollY - HEADER), behavior: still ? "auto" : "smooth" });
      }
    };
    addEventListener("message", receive);
    // A draft re-renders the page, replacing the outlined element: put the outline back on its successor.
    let frame = 0;
    const keep = new MutationObserver(() => {
      if (frame || !picked.current) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = picked.current && find(picked.current);
        if (el && !el.classList.contains(FOCUS)) outline(el);
      });
    });
    keep.observe(document.body, { childList: true, subtree: true });
    return () => {
      removeEventListener("message", receive);
      keep.disconnect();
      cancelAnimationFrame(frame);
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  useEffect(() => {
    if (parent === window) return;
    // A new page starts with nothing picked: drop any outline the previous page left behind.
    picked.current = null;
    outline();
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
    // mediaVersion: a new upload changes what asset() gives, so the page renders again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drafts, mediaVersion]);

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
