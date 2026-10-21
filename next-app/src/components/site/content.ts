// Page copy, transcribed from the static site (dist/index.html, dist/app.js).

export type Theme = "tech" | "industrial";

export const themes: { id: Theme; label: string; name: string; title: string }[] = [
  { id: "tech", label: "Dark Tech", name: "Interactive Dark Tech", title: "Interactive Dark Tech — #0A0A0A + #c1152b" },
  { id: "industrial", label: "Industrial", name: "Industrial", title: "Industrial — 60% #FFFFFF · 30% #c1152b · 10% #121212" },
];

/** Each metric counts up to `to` when it scrolls into view; `pad` keeps leading zeros ("04"). */
export const metrics = [
  { to: 4, pad: 2, label: "Tầng vận hành" },
  { to: 100, unit: "%", label: "Chủ quyền dữ liệu" },
  { prefix: "Level ", to: 3, suffix: "+", label: "An toàn thông tin" },
  { to: 2, pad: 2, label: "Cấp độ kiểm soát" },
];

// `product` names each tier's block in the four-tier diagrams.
export const layers = [
  { tab: "Quản trị", product: "GEO Governance", floor: "QUẢN TRỊ", title: ["Định hướng chiến lược.", "Giữ vững mục tiêu."], body: "Tổng hợp báo cáo, tham mưu, đề xuất hỗ trợ các quyết định quản trị. Đóng vai trò như trợ lý." },
  { tab: "Quản lý", product: "GEO Management", floor: "QUẢN LÝ", title: ["Kết nối nguồn lực.", "Đồng bộ vận hành."], body: "Theo dõi và bóc tách nhiệm vụ, phân công quản lý đảm bảo hiện thực hóa quyết định quản trị." },
  { tab: "Thực thi", product: "GEO Operations", floor: "THỰC THI", title: ["Biến quyết định", "thành hành động."], body: "Đóng vai trò như co-worker làm việc với các cán bộ thực thi." },
  { tab: "Dịch vụ", product: "GEO Service", floor: "DỊCH VỤ", title: ["Hỗ trợ đúng lúc.", "Phục vụ đúng nhu cầu."], body: "Kết nối các hệ thống thông tin rời rạc và chăm sóc khách hàng, hỗ trợ người dân." },
];

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

export const cta = {
  title: ["Sẵn sàng đưa AI Agent vào", "bộ máy vận hành?"],
  question: "Nhiệm vụ vận hành nào anh/chị muốn cải thiện ngay hôm nay?",
  body: "Hãy gửi cho chúng tôi một bài toán cụ thể. Đội ngũ chuyên gia Thehegeo sẽ xây dựng bản Demo GEO Agent chạy trực tiếp trên dữ liệu mẫu của quý cơ quan/doanh nghiệp.",
  action: "Gửi yêu cầu tư vấn & đặt lịch",
  // Every consultation / demo booking goes to the contact page (its form).
  href: "/ve-thehegeo/lien-he/",
};
