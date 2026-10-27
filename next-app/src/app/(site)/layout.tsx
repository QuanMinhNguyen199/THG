import type { Metadata, Viewport } from "next";
import { SiteDocument } from "@/components/site/SiteDocument";

export const metadata: Metadata = {
  title: "GEOagents — THEHEGEO",
  description: "GEOagents — lực lượng AI cho vận hành trọng yếu. AI chủ quyền, con người làm chủ.",
};

export const viewport: Viewport = { themeColor: "#0A0A0A" };

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument>{children}</SiteDocument>;
}
