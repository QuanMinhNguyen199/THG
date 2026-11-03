"use client";

import { useEffect, useState } from "react";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import type { PageDocument } from "@/content/blocks";
import home from "@/content/pages/home.json";

/**
 * Renders the layout the editor posts (same origin only). The editor sends a draft only once it
 * passes validation, so the blocks always have the fields they need.
 */
export function LivePreview() {
  const [doc, setDoc] = useState(home as PageDocument);
  useEffect(() => {
    const receive = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.data?.type !== "cms:draft") return;
      setDoc(e.data.doc as PageDocument);
    };
    addEventListener("message", receive);
    parent.postMessage({ type: "cms:ready" }, location.origin);
    return () => removeEventListener("message", receive);
  }, []);
  return <RenderBlocks blocks={doc.layout} />;
}
