// Page copy, transcribed from the static site (dist/index.html, dist/app.js).

export type Theme = "tech" | "industrial";

export const themes: { id: Theme; label: string; name: string; title: string }[] = [
  { id: "tech", label: "Dark Tech", name: "Interactive Dark Tech", title: "Interactive Dark Tech — #0A0A0A + #c1152b" },
  { id: "industrial", label: "Industrial", name: "Industrial", title: "Industrial — 60% #FFFFFF · 30% #c1152b · 10% #121212" },
];

// The four tiers (names, products, copy) are content: pages/geoagents.json, architecture.


export type ProjectId = "tax";

export const projects: Record<ProjectId, { name: string; company: string; summary: string; description: string; index: string }> = {
  tax: {
    name: "AI DN360",
    company: "Cục Thuế TP. Hà Nội",
    summary: "Đối chiếu BCTC, thuế GTGT/TNDN theo mã số thuế.",
    description: "Ứng dụng AI đối chiếu báo cáo tài chính, thuế giá trị gia tăng và thuế thu nhập doanh nghiệp theo mã số thuế.",
    index: "01 / TÀI CHÍNH & THUẾ",
  },
};

