// Copy shared by the sections; transcribed from the existing GEOagents page.

export type Tier = { code: string; name: string; title: string; body: string };

/** Ordered top (Governance) to bottom (Service). */
export const tiers: Tier[] = [
  {
    code: "GOVERNANCE",
    name: "Quản trị",
    title: "Định hướng chiến lược. Giữ vững mục tiêu.",
    body: "Kết nối thông tin để hỗ trợ quản trị và định hướng tổ chức. Con người giữ quyền quyết định và chịu trách nhiệm cuối cùng.",
  },
  {
    code: "MANAGEMENT",
    name: "Quản lý",
    title: "Kết nối nguồn lực. Đồng bộ vận hành.",
    body: "Hỗ trợ người quản lý tổng hợp thông tin, theo dõi công việc và phối hợp giữa các bộ phận trong cùng một hệ thống.",
  },
  {
    code: "EXECUTION",
    name: "Thực thi",
    title: "Biến quyết định thành hành động.",
    body: "GEO Agent được thiết kế xuyên suốt để hỗ trợ từng tầng, giải quyết đúng điểm nghẽn và đưa mọi hoạt động trở lại nhịp vận hành.",
  },
  {
    code: "SERVICE",
    name: "Dịch vụ",
    title: "Hỗ trợ đúng lúc. Phục vụ đúng nhu cầu.",
    body: "Kết nối tri thức tổ chức với nhu cầu tra cứu và hỗ trợ. Cung cấp thông tin trong phạm vi dữ liệu và quyền truy cập được cho phép.",
  },
];

export type Pillar = { title: string; body: string; foot: string };

export const pillars: Pillar[] = [
  {
    title: "AI chủ quyền & On-premise",
    body: "Toàn bộ mô hình và dữ liệu triển khai tại hạ tầng khách hàng. Không phụ thuộc cloud ngoài, đảm bảo không bị khóa nhà cung cấp.",
    foot: "DỮ LIỆU CỦA BẠN",
  },
  {
    title: "Mô hình Human-in-the-Loop",
    body: "AI đóng vai trò đề xuất giải pháp, cung cấp cơ sở và soạn thảo. Con người có thẩm quyền giữ quyền phê duyệt cuối cùng.",
    foot: "QUYẾT ĐỊNH CỦA BẠN",
  },
  {
    title: "Minh bạch & Trách nhiệm",
    body: "Tách bạch rõ ràng giữa dữ liệu thực tế và nhận định đề xuất. Lưu vết đầy đủ mọi hoạt động trong quá trình vận hành.",
    foot: "KIỂM SOÁT CỦA BẠN",
  },
];
