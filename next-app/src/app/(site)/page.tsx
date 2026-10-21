import type { Metadata } from "next";
import { HomeHub } from "@/components/site/HomeHub";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata: Metadata = { title: "THEHEGEO" };

export default function Home() {
  return (
    <SiteShell>
      <HomeHub />
    </SiteShell>
  );
}
