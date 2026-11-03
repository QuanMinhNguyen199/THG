"use client";

import dynamic from "next/dynamic";

// The editor runs in the browser only: its drafts, uploads and preview live there. Rendered on the
// server it would show controls before React took them over, and a section opened in that moment
// would hydrate as closed and stay empty. The server sends just this notice instead.
const ContentEditor = dynamic(() => import("./ContentEditor").then((m) => m.ContentEditor), {
  ssr: false,
  loading: () => (
    <p className="cms-loading" role="status">
      Đang mở trang soạn nội dung…
    </p>
  ),
});

export function EditorPage() {
  return <ContentEditor />;
}
