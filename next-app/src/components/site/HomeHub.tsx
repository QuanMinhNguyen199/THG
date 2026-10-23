import { RenderBlocks } from "../blocks/RenderBlocks";
import { getPage } from "@/content/get-page";

/** Compatibility entry point. CTA remains owned by SiteShell for older callers. */
export function HomeHub() {
  return <RenderBlocks blocks={getPage("home").layout.filter(block => block.blockType !== "cta")} />;
}
