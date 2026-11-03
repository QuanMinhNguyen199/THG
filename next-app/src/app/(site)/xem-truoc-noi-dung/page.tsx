import type { Metadata } from "next";
import { LivePreview } from "@/components/cms/LivePreview";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = { title: "Xem trước nội dung", robots: { index: false, follow: false } };

/** The home page as the content editor mock's draft renders it (dev only, shown in its iframe). */
export default function Page() {
  return (
    <SiteShell cta={false}>
      <LivePreview />
    </SiteShell>
  );
}
