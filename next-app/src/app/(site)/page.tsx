import type { Metadata } from "next";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { getPage } from "@/content/get-page";
import { SiteShell } from "@/components/site/SiteShell";

const page = getPage("home");
export const metadata: Metadata = { title: page.title };

export default function Home() {
  return (
    <SiteShell cta={false}>
      <RenderBlocks blocks={page.layout} />
    </SiteShell>
  );
}
