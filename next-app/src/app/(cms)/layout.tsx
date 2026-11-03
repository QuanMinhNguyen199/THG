import type { Metadata } from "next";
import "./cms.css";

export const metadata: Metadata = { title: "Soạn nội dung (thử nghiệm)", robots: { index: false, follow: false } };

/** Dev-only root layout for the content editor mock; plain styles, apart from the site's. */
export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
