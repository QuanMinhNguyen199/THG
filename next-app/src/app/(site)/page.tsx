import type { Metadata } from "next";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { Editable } from "@/components/cms/Editable";
import { getPage } from "@/content/get-page";
import { SiteShell } from "@/components/site/SiteShell";

const page = getPage("home");
export const metadata: Metadata = { title: page.title };

export default function Home() {
  return (
    <SiteShell cta={false}>
      <Editable target={{ kind: "home" }}>
        <RenderBlocks blocks={page.layout} />
      </Editable>
    </SiteShell>
  );
}
