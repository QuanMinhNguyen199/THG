// Page copy, transcribed from the static site (dist/index.html, dist/app.js).

export type Theme = "tech" | "corporate" | "industrial" | "native";

export const themes: { id: Theme; label: string; name: string; title: string }[] = [
  { id: "tech", label: "Dark Tech", name: "Interactive Dark Tech", title: "Interactive Dark Tech — #0A0A0A + #c1152b" },
  { id: "corporate", label: "Corporate", name: "Corporate Motion Canvas", title: "Corporate Motion Canvas — #FFFFFF + #0F172A" },
  { id: "industrial", label: "Industrial", name: "Industrial", title: "Industrial — 60% #FFFFFF · 30% #b63545 · 10% #121212" },
  { id: "native", label: "Agent Native", name: "Agent Native", title: "Agent Native — sóng lụa đỏ, nền trắng" },
];

/** Each metric counts up to `to` when it scrolls into view; `pad` keeps leading zeros ("04"). */
export const metrics = [
  { to: 4, pad: 2, label: "Tầng vận hành" },
  { to: 100, unit: "%", label: "Chủ quyền dữ liệu" },
  { prefix: "Level ", to: 3, suffix: "+", label: "An toàn thông tin" },
  { to: 2, pad: 2, label: "Cấp độ kiểm soát" },
];

export const layers = [
  { tab: "Quản trị", floor: "QUẢN TRỊ", title: ["Định hướng chiến lược.", "Giữ vững mục tiêu."], body: "Kết nối thông tin để hỗ trợ quản trị và định hướng tổ chức. Con người giữ quyền quyết định và chịu trách nhiệm cuối cùng." },
  { tab: "Quản lý", floor: "QUẢN LÝ", title: ["Kết nối nguồn lực.", "Đồng bộ vận hành."], body: "Hỗ trợ người quản lý tổng hợp thông tin, theo dõi công việc và phối hợp giữa các bộ phận trong cùng một hệ thống." },
  { tab: "Thực thi", floor: "THỰC THI", title: ["Biến quyết định", "thành hành động."], body: "GEO Agent được thiết kế xuyên suốt để hỗ trợ từng tầng, giải quyết đúng điểm nghẽn và đưa mọi hoạt động trở lại nhịp vận hành." },
  { tab: "Dịch vụ", floor: "DỊCH VỤ", title: ["Hỗ trợ đúng lúc.", "Phục vụ đúng nhu cầu."], body: "Kết nối tri thức tổ chức với nhu cầu tra cứu và hỗ trợ. Cung cấp thông tin trong phạm vi dữ liệu và quyền truy cập được cho phép." },
];

export const pillars = [
  {
    title: ["AI chủ quyền", "& On-premise"],
    body: "Toàn bộ mô hình và dữ liệu triển khai tại hạ tầng khách hàng. Không phụ thuộc cloud ngoài, đảm bảo không bị khóa nhà cung cấp.",
    foot: "DỮ LIỆU CỦA BẠN",
  },
  {
    title: ["Mô hình", "Human-in-the-Loop"],
    body: "AI đóng vai trò đề xuất giải pháp, cung cấp cơ sở và soạn thảo. Con người có thẩm quyền giữ quyền phê duyệt cuối cùng.",
    foot: "QUYẾT ĐỊNH CỦA BẠN",
  },
  {
    title: ["Minh bạch", "& Trách nhiệm"],
    body: "Tách bạch rõ ràng giữa dữ liệu thực tế và nhận định đề xuất. Lưu vết đầy đủ mọi hoạt động trong quá trình vận hành.",
    foot: "KIỂM SOÁT CỦA BẠN",
  },
];

export type ProjectId = "tax" | "ptsc";

export const projects: Record<ProjectId, { name: string; company: string; summary: string; description: string; index: string }> = {
  tax: {
    name: "AI TĐN360",
    company: "Cục Thuế TP. Hà Nội",
    summary: "Đối chiếu BCTC, thuế GTGT/TNDN theo mã số thuế.",
    description: "Ứng dụng AI đối chiếu báo cáo tài chính, thuế giá trị gia tăng và thuế thu nhập doanh nghiệp theo mã số thuế.",
    index: "01 / TÀI CHÍNH & THUẾ",
  },
  ptsc: {
    name: "AI Quản lý Dự án",
    company: "PTSC M&C",
    summary: "Trợ lý Q&A trực tiếp trên kho hồ sơ kỹ thuật dầu khí.",
    description: "Trợ lý hỏi đáp trực tiếp trên kho hồ sơ kỹ thuật dầu khí, hỗ trợ tra cứu thông tin phục vụ quản lý dự án.",
    index: "02 / KỸ THUẬT & DỰ ÁN",
  },
};

export const cta = {
  title: ["Sẵn sàng đưa AI Agent vào", "bộ máy vận hành?"],
  question: "Nhiệm vụ vận hành nào anh/chị muốn cải thiện ngay hôm nay?",
  body: "Hãy gửi cho chúng tôi một bài toán cụ thể. Đội ngũ chuyên gia Thehegeo sẽ xây dựng bản Demo GEO Agent chạy trực tiếp trên dữ liệu mẫu của quý cơ quan/doanh nghiệp.",
  action: "Gửi yêu cầu tư vấn & đặt lịch",
  // TODO(unconfirmed): real destination (form, booking link or email) has not been provided.
  // Until then the button stays on this section rather than pointing at an invented address.
  href: "#cta",
};
