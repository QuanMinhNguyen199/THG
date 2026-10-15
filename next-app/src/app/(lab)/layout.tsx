import type { Metadata } from "next";
import { Be_Vietnam_Pro, Space_Grotesk } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { SmoothScroll } from "@/components/providers/SmoothScroll";

const body = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
});

const display = Space_Grotesk({
  variable: "--font-display-face",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "GEOagents — THEHEGEO",
  description: "GEOagents — lực lượng AI cho vận hành trọng yếu. AI chủ quyền, con người làm chủ.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${body.variable} ${display.variable}`}>
      <body className="bg-obsidian text-white">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
