import { projects } from "./content";

// Case studies shown as a paper card that opens into a 3D spread (ProjectCase in Applications.tsx).
// `tone` is the folder colour of the paper. `mock` cases stand in for case studies whose copy has
// not been supplied (no badge is shown on the site; the flag keeps them traceable until real copy lands).

export type CaseTone = "white" | "navy" | "kraft" | "graphite";
/** How the case is drawn and how it opens: a paper folder that opens like a book (TDN), a phone
 *  whose call plays out, a clipboard board whose columns unfold, or a server stack that separates. */
export type CaseModel = "folder" | "call" | "board" | "stack";
export type CaseData = {
  id: string;
  name: string;
  org: string;
  index: string;
  summary: string;
  description: string;
  note: string;
  kicker: string;
  /** The three sheets standing at the back of the spread, and the line under each. */
  checks: [string, string, string];
  checkFoot: string;
  tag: string;
  headline: [string, string];
  stamp: [string, string];
  tone: CaseTone;
  model: CaseModel;
  /** call: the scripted exchange shown on the phone. */
  script?: { who: "in" | "agent"; text: string }[];
  /** board: the columns and their cards. */
  board?: { col: string; cards: string[] }[];
  mock?: boolean;
};

const tax = projects.tax;

export const TDN: CaseData = {
  id: "tdn",
  name: tax.name,
  org: tax.company,
  index: tax.index,
  summary: tax.summary,
  description: tax.description,
  note: "AI đối chiếu và chỉ ra chênh lệch. Cán bộ thuế xem xét và kết luận.",
  kicker: "Tài chính và thuế",
  // What the product checks, taken from its description (no claims beyond the existing copy).
  checks: ["Báo cáo tài chính", "Thuế giá trị gia tăng", "Thuế thu nhập doanh nghiệp"],
  checkFoot: "Theo mã số thuế",
  tag: "AI / TAX INTELLIGENCE",
  headline: ["Đúng dữ liệu.", "Rõ nghĩa vụ."],
  stamp: ["TAX", "360"],
  tone: "white",
  model: "folder",
};

// TODO(unconfirmed): illustrations until the real case studies are approved; confirm the client
// may be named (PTSC M&C) before publishing.
export const MOCK_CASES: Record<string, CaseData> = {
  "dich-vu-cong": {
    id: "dich-vu-cong",
    name: "Tổng đài AI",
    org: "Dịch vụ công · Hộ kinh doanh",
    index: "02 / DỊCH VỤ CÔNG",
    summary: "Tiếp nhận câu hỏi và hướng dẫn thủ tục cho hộ kinh doanh qua tổng đài AI.",
    description: "Tổng đài AI tiếp nhận câu hỏi của hộ kinh doanh, hướng dẫn thủ tục và giấy tờ cần chuẩn bị, chuyển cán bộ khi cần.",
    note: "AI trả lời trong phạm vi được phép. Cán bộ tiếp nhận các trường hợp cần xử lý.",
    kicker: "Dịch vụ công",
    checks: ["Tiếp nhận câu hỏi", "Hướng dẫn thủ tục", "Chuyển cán bộ"],
    checkFoot: "Theo từng cuộc gọi",
    tag: "AI / PUBLIC SERVICE",
    headline: ["Hỏi đúng thủ tục.", "Trả lời đúng lúc."],
    stamp: ["AI", "CALL"],
    tone: "navy",
    model: "call",
    script: [
      { who: "in", text: "Cho tôi hỏi thủ tục cho hộ kinh doanh?" },
      { who: "agent", text: "Tôi gửi anh/chị danh sách giấy tờ cần chuẩn bị." },
      { who: "in", text: "Trường hợp của tôi phức tạp hơn." },
      { who: "agent", text: "Tôi chuyển cán bộ phụ trách tiếp nhận." },
    ],
    mock: true,
  },
  "quan-ly-du-an": {
    id: "quan-ly-du-an",
    name: "Trợ lý AI hồ sơ kỹ thuật",
    org: "PTSC M&C",
    index: "03 / QUẢN LÝ DỰ ÁN",
    summary: "Trợ lý AI cho hồ sơ kỹ thuật dự án.",
    description: "AI tổng hợp tiến độ, hồ sơ và đầu việc của từng dự án, nhắc hạn và báo sớm các hạng mục có nguy cơ chậm.",
    note: "AI theo dõi và cảnh báo. Người quản lý dự án quyết định điều chỉnh.",
    kicker: "Quản lý dự án",
    checks: ["Tiến độ", "Hồ sơ dự án", "Đầu việc"],
    checkFoot: "Theo từng hạng mục",
    tag: "AI / PROJECT MANAGEMENT",
    headline: ["Đúng tiến độ.", "Rõ đầu việc."],
    stamp: ["PM", "AI"],
    tone: "kraft",
    model: "board",
    board: [
      { col: "Kế hoạch", cards: ["Hồ sơ thiết kế", "Dự toán"] },
      { col: "Đang làm", cards: ["Thi công hạng mục", "Nghiệm thu", "Báo cáo tuần"] },
      { col: "Hoàn thành", cards: ["Phê duyệt chủ trương"] },
    ],
    mock: true,
  },
  "ai-platform": {
    id: "ai-platform",
    name: "AI Platform",
    org: "THEHEGEO",
    index: "04 / NỀN TẢNG",
    summary: "Nền tảng để triển khai và vận hành các GEO Agent trong tổ chức.",
    description: "Nền tảng để triển khai, kết nối dữ liệu và vận hành các GEO Agent tại chỗ, trong phạm vi quyền truy cập của tổ chức.",
    note: "Dữ liệu ở lại trong tổ chức. Con người duyệt các bước quan trọng.",
    kicker: "Nền tảng",
    checks: ["Triển khai Agent", "Kết nối dữ liệu", "Phân quyền"],
    checkFoot: "Chạy tại chỗ",
    tag: "AI / PLATFORM",
    headline: ["Một nền tảng.", "Nhiều Agent."],
    stamp: ["AI", "OS"],
    tone: "graphite",
    model: "stack",
    mock: true,
  },
};
