// Corporate pages, from docs/content-thehegeo.md. Every page is a heading (title, English line,
// lead) followed by content blocks rendered by CorporatePages.tsx. Copy is the document's own; items
// it marks "[Cần xác nhận]" are noted in TODOs here, not shown on the page.

export type Link = { href: string; label: string };
export type Cell = string | { text: string; href: string };
export type Block =
  | { type: "cards"; title?: string; items: { title: string; body?: string; href?: string; cta?: string }[] }
  /** Shown as cards: one per row (its first cell is the title, the others are labelled by `head`),
   *  or one per column with `by: "column"`. A card with a link cell opens that link. */
  | { type: "table"; title?: string; head: string[]; rows: Cell[][]; by?: "column" }
  | { type: "steps"; title?: string; flow?: boolean; items: { title: string; body?: string }[]; note?: string }
  | { type: "list"; title?: string; items: { title?: string; body: string; href?: string }[] }
  | { type: "text"; title?: string; body: string[]; link?: Link }
  | { type: "pills"; title?: string; items: string[] }
  | { type: "timeline"; title?: string; items: { year: string; label: string }[] }
  | { type: "layers"; title?: string; items: string[] }
  | { type: "partners"; title?: string; groups: { group: string; names: string[] }[] }
  | { type: "callout"; title?: string; body: string; en?: string }
  | { type: "case"; title?: string; id: string }
  | { type: "contact" }
  | { type: "jobs" };

/** The model beside a detail page's heading (PageModels.tsx), drawn from the page's own copy. */
export type Model =
  | { kind: "core" }
  | { kind: "bridge"; labels: [string, string, string, string] }
  | { kind: "devices"; items: string[] }
  | { kind: "phone"; title: string; caller: string; script: { who: "in" | "agent"; text: string }[] }
  | { kind: "stack"; layers: { label: string; chips?: string[] }[] };

export type Page = {
  slug: string;
  /** Menu and card name. */
  name: string;
  /** Short line under the name on cards and in "Xem thêm". */
  kind?: string;
  title: string;
  en?: string;
  lead?: string;
  blocks: Block[];
  cta?: { label: string; href?: string };
  image?: string;
  model?: Model;
};

const CONTACT = "/ve-thehegeo/lien-he/";
const DEMO = { label: "Đặt lịch demo", href: CONTACT };

// ── Giải pháp ────────────────────────────────────────────────────────────────

export const SOLUTIONS_HOME: Page = {
  slug: "",
  name: "Giải pháp",
  title: "Ba nhóm giải pháp. Một nền tảng AI.",
  en: "Three solution lines. One AI foundation.",
  lead: "Từ cảm biến trên công trình đến AI Agent trong bộ máy, Thehegeo làm chủ cả thiết bị, dữ liệu và AI.",
  blocks: [
    {
      type: "cards",
      items: [
        { title: "Giải pháp AI", body: "AI Agent làm việc thật trong bộ máy.", href: "/giai-phap/ai/", cta: "Xem giải pháp" },
        { title: "Giải pháp AIoT", body: "Quan trắc cầu, đường, công trình theo thời gian thực.", href: "/giai-phap/aiot/", cta: "Xem giải pháp" },
        { title: "Giải pháp Công nghệ", body: "Robot và AI xử lý ngay tại hiện trường.", href: "/giai-phap/cong-nghe/", cta: "Xem giải pháp" },
      ],
    },
  ],
  cta: DEMO,
};

export const SOLUTIONS: Page[] = [
  {
    slug: "ai",
    name: "Giải pháp AI",
    kind: "AI Agent làm việc thật trong bộ máy",
    title: "AI cho những việc bộ máy làm mỗi ngày.",
    en: "AI for the work government does every day.",
    model: { kind: "core" },
    blocks: [
      {
        type: "table",
        title: "Năm bài toán AI đang giải",
        head: ["Bài toán", "AI làm gì", "Dẫn tới"],
        rows: [
          ["Văn bản và điều hành", "Bóc tách nhiệm vụ, giao việc, theo dõi, báo cáo", { text: "GEOagents", href: "/geoagents/" }],
          ["Thuế và ngân sách", "Phân tích doanh nghiệp 16 chiều, dự thu ngân sách", { text: "Ứng dụng A360", href: "/ung-dung/a360/" }],
          ["Dịch vụ công", "Giúp hộ kinh doanh khai và nộp thuế", { text: "Ứng dụng HKD", href: "/ung-dung/hkd/" }],
          ["Hạ tầng AI dùng chung", "Nhiều cơ quan, một nền tảng, một cổng mô hình", { text: "Ứng dụng AI Platform", href: "/ung-dung/ai-platform/" }],
          ["Doanh nghiệp công nghiệp", "Trợ lý AI cho hồ sơ kỹ thuật dự án", { text: "Dự án PTSC M&C", href: "#ptsc" }],
        ],
      },
      {
        type: "text",
        title: "Một lõi chung",
        body: ["GEO Agent là lõi của giải pháp AI. Hướng tới: cơ quan đi sau dùng lại được những gì cơ quan đi trước đã xây."],
        link: { href: "/geoagents/", label: "Tìm hiểu GEO Agent" },
      },
      { type: "pills", title: "Triển khai", items: ["Tại chỗ", "Dữ liệu ở lại với cơ quan", "Đổi được mô hình AI", "An toàn thông tin từ cấp độ 3"] },
      { type: "case", title: "Doanh nghiệp công nghiệp", id: "quan-ly-du-an" },
    ],
    cta: DEMO,
  },
  {
    slug: "aiot",
    name: "Giải pháp AIoT",
    kind: "Cầu đường",
    title: "Đo những công trình không được phép sai.",
    en: "Measuring structures that cannot fail.",
    lead: "Hệ thống quan trắc cầu, đường, metro và cảng: từ cảm biến tại hiện trường đến cảnh báo trên màn hình, theo thời gian thực.",
    model: { kind: "bridge", labels: ["Cảm biến", "Datalogger", "Nền tảng dữ liệu thời gian thực", "Cảnh báo sớm"] },
    blocks: [
      {
        type: "text",
        title: "Bài toán",
        body: ["Công trình lớn cần biết sớm những thay đổi về độ nghiêng, ứng suất, áp lực, trước khi nó thành sự cố."],
      },
      {
        type: "steps",
        title: "Hệ thống gồm bốn lớp",
        items: [
          { title: "Cảm biến", body: "Đo nghiêng, ứng suất, áp lực, gắn trên kết cấu." },
          { title: "Datalogger", body: "Đọc dữ liệu cảm biến, đẩy lên cloud và datalake." },
          { title: "Nền tảng dữ liệu thời gian thực", body: "Lưu, phân tích và hiển thị." },
          { title: "Cảnh báo sớm", body: "Sức khỏe kết cấu từ phân tích dữ liệu lớn." },
        ],
      },
      {
        type: "list",
        title: "Giao thông và đô thị thông minh",
        items: [
          { title: "TranspoX", body: "Giao thông thông minh." },
          { title: "CiviX", body: "An ninh đô thị." },
          { body: "Nền tảng phân tích dữ liệu giao thông bằng camera và GPS." },
        ],
      },
      // TODO(unconfirmed): the document asks for project cards with real site photos, client,
      // Thehegeo's role and dates; until those arrive the projects are listed by name only.
      {
        type: "table",
        title: "Công trình tiêu biểu",
        head: ["Nhóm", "Công trình, dự án"],
        rows: [
          ["Cầu", "Cầu Cần Thơ · Cầu Vàm Cống · Cầu Bạch Đằng"],
          ["Đường sắt đô thị và đường bộ", "Metro số 1 TP.HCM · Đường vành đai ven biển phía Nam"],
          ["Cảng", "Cảng Phước An"],
          ["Giao thông và đô thị quốc tế", "Smart lamppost · Hongkong Telecom · Camera giao thông ACTi · Phân tích giao thông TMS"],
        ],
      },
    ],
    cta: { label: "Trao đổi về công trình của anh/chị", href: CONTACT },
  },
  {
    slug: "cong-nghe",
    name: "Giải pháp Công nghệ",
    kind: "Thiết bị và AI tại biên",
    title: "Tự nghiên cứu, tự chế tạo. Đưa AI ra tận hiện trường.",
    en: "Researched and built in-house. AI, out in the field.",
    model: { kind: "devices", items: ["Cảm biến", "Datalogger", "AI Box", "Cảnh báo"] },
    lead: "Thehegeo tự nghiên cứu và chế tạo cảm biến và datalogger cho quan trắc công trình lớn. Từ nhu cầu phân tích giao thông trên cầu, Thehegeo phát triển AI phân tích hình ảnh camera, triển khai dạng AI Box. Thehegeo làm chủ công nghệ từ phần cứng, dữ liệu đến AI Agent.",
    blocks: [
      {
        type: "text",
        title: "Sinh ra từ nhu cầu ở hiện trường",
        body: [
          "Cảng Phước An, các cầu dây văng lớn, tuyến metro số 1 TP.HCM cần giám sát kết cấu, tai biến địa chất và môi trường. Vì vậy Thehegeo tự nghiên cứu và chế tạo cảm biến cùng bộ ghi dữ liệu.",
          "Đây là đo lường công nghiệp cho công trình quy mô lớn, đòi hỏi độ ổn định và chính xác rất cao. Sau đó, chính những thiết bị này được đưa vào nhà máy thông minh.",
        ],
      },
      {
        type: "table",
        title: "Dòng thiết bị",
        head: ["Thiết bị", "Làm gì", "Dùng ở đâu"],
        rows: [
          ["Cảm biến", "Đo nghiêng, ứng suất, áp lực", "Cầu, cảng, metro"],
          ["Datalogger", "Đọc dữ liệu cảm biến, đẩy lên cloud và datalake", "Các hệ thống quan trắc của Thehegeo"],
          ["AI Box", "Chạy AI phân tích hình ảnh camera", "Giao thông (TranspoX), an ninh đô thị (CiviX)"],
        ],
      },
      {
        type: "steps",
        title: "Từ thiết bị đến cảnh báo",
        flow: true,
        items: [
          { title: "Cảm biến đo" },
          { title: "Datalogger đẩy dữ liệu lên cloud, datalake" },
          { title: "Phân tích dữ liệu lớn để cảnh báo sớm sức khỏe kết cấu" },
          { title: "Người phụ trách nhận cảnh báo và quyết định" },
        ],
      },
      {
        type: "list",
        title: "Đang chạy ở đâu",
        items: [
          { title: "Công trình", body: "Quan trắc cầu dây văng, cảng, metro; ứng dụng AI trong quan trắc hầm đô thị.", href: "/giai-phap/aiot/" },
          { title: "Giao thông", body: "TranspoX, AI cho giao thông thông minh." },
          { title: "An ninh đô thị", body: "CiviX, camera AI và đám mây." },
        ],
      },
      {
        type: "callout",
        title: "Hướng tới: Physical AI",
        body: "Cảm biến, cơ khí, bo mạch của những năm qua là nền để Thehegeo hướng tới Physical AI, nơi AI Agent không chỉ làm việc với văn bản, dữ liệu mà còn điều khiển thiết bị, robot trong thế giới thật. Đây là hướng phát triển, chưa phải sản phẩm đang cung cấp.",
        en: "Where we are heading: agents that work not only with documents and data, but also control devices and robots in the real world. A direction, not a product on offer today.",
      },
    ],
    cta: { label: "Trao đổi về bài toán thiết bị của anh/chị", href: CONTACT },
  },
];

// ── Ứng dụng ─────────────────────────────────────────────────────────────────

export const APPS_HOME: Page = {
  slug: "",
  name: "Ứng dụng",
  title: "Bài toán thật. Quy mô thật.",
  en: "Real problems. Real scale.",
  blocks: [
    {
      type: "cards",
      items: [
        { title: "HKD", body: "Trợ lý AI giúp hộ kinh doanh khai và nộp thuế.", href: "/ung-dung/hkd/", cta: "Xem chi tiết" },
        { title: "A360", body: "Nhìn mỗi doanh nghiệp từ 16 chiều để quản lý và dự báo thu ngân sách.", href: "/ung-dung/a360/", cta: "Xem chi tiết" },
        { title: "AI Platform", body: "Một nền tảng AI dùng chung cho nhiều cơ quan.", href: "/ung-dung/ai-platform/", cta: "Xem chi tiết" },
      ],
    },
  ],
  cta: DEMO,
};

export const APPS: Page[] = [
  {
    slug: "hkd",
    name: "HKD",
    kind: "Trợ lý thuế cho hộ kinh doanh",
    title: "Hộ kinh doanh khai và nộp thuế cùng trợ lý AI.",
    en: "An AI assistant that helps household businesses file and pay taxes.",
    model: {
      kind: "phone",
      title: "HKD",
      caller: "Trợ lý thuế",
      script: [
        { who: "in", text: "Hộ kinh doanh của tôi cần khai thuế thế nào?" },
        { who: "agent", text: "Tôi lập tờ khai từ dữ liệu doanh thu của hộ." },
        { who: "agent", text: "Anh/chị xem và xác nhận trước khi gửi." },
        { who: "agent", text: "Tôi sẽ nhắc trước hạn nộp." },
      ],
    },
    blocks: [
      {
        type: "text",
        title: "Bối cảnh",
        body: ["Từ ngày 1/1/2026, hộ kinh doanh không còn nộp thuế khoán mà chuyển sang tự khai, tự nộp thuế. Nhiều hộ lần đầu phải làm tờ khai và theo dõi hạn nộp."],
      },
      {
        type: "steps",
        title: "HKD làm gì",
        items: [
          { title: "Trả lời bằng tiếng Việt", body: "Các câu hỏi thường gặp về nghĩa vụ thuế của hộ." },
          { title: "Hỗ trợ lập tờ khai", body: "Từ dữ liệu doanh thu của hộ." },
          { title: "Nhắc hạn và hướng dẫn nộp thuế" },
        ],
        note: "Nguyên tắc: chủ hộ xem và xác nhận trước khi gửi tờ khai.",
      },
      {
        type: "table",
        title: "Mục tiêu",
        by: "column",
        head: ["Cho hộ kinh doanh", "Cho cơ quan thuế"],
        rows: [
          ["Được hướng dẫn theo quy định mới bằng tiếng Việt dễ hiểu", "Giảm tải hỏi đáp lặp lại"],
          ["Được nhắc trước hạn nộp", "Tỷ lệ khai đúng hạn cao hơn"],
        ],
      },
      { type: "text", title: "Đang triển khai", body: ["Thuế TP Hà Nội, trên ứng dụng iHanoi."] },
    ],
    cta: DEMO,
  },
  {
    slug: "a360",
    name: "A360",
    kind: "Phân tích doanh nghiệp 360 độ",
    title: "Nhìn mỗi doanh nghiệp từ 16 chiều.",
    en: "See every enterprise from 16 angles.",
    lead: "A360 giúp cơ quan thuế quản lý doanh nghiệp thường xuyên, đánh giá rủi ro thuế và hỗ trợ dự báo số thu ngân sách, dựa trên bộ chỉ số 4 tầng, 16 chiều.",
    model: {
      kind: "stack",
      layers: [
        { label: "Sức khỏe tài chính", chips: ["ROA", "ROE", "Thanh khoản", "Đòn bẩy"] },
        { label: "Rủi ro thuế", chips: ["Thuế suất hiệu dụng", "GTGT", "TNDN", "Chênh lệch tờ khai"] },
        { label: "Đối chiếu hồ sơ", chips: ["BCTC", "Tờ khai GTGT", "Tờ khai TNDN", "Hồ sơ theo MST"] },
      ],
    },
    blocks: [
      {
        type: "list",
        title: "Ba việc A360 làm",
        items: [
          { title: "Dự thu ngân sách", body: "Hỗ trợ dự báo số thu." },
          { title: "Quản lý", body: "Theo dõi sức khỏe tài chính doanh nghiệp: hiệu quả sinh lời, thanh khoản, đòn bẩy." },
          { title: "Kiểm tra", body: "Đánh giá rủi ro thuế, gợi ý doanh nghiệp nên ưu tiên kiểm tra." },
        ],
      },
      {
        type: "table",
        title: "Quản lý và Kiểm tra",
        by: "column",
        head: ["", "Quản lý", "Kiểm tra"],
        rows: [
          ["Câu hỏi", "Doanh nghiệp đang khỏe hay yếu đi?", "Doanh nghiệp nào cần kiểm tra trước?"],
          ["Tần suất", "Thường xuyên", "Theo kỳ hoặc khi có dấu hiệu"],
          ["Kết quả", "Bức tranh sức khỏe doanh nghiệp", "Danh sách ưu tiên, kèm lý do"],
        ],
      },
      // TODO(unconfirmed): the document's heading says "3 tầng" and its text "bốn tầng"; it lists
      // three tiers of four (12 dimensions) against "16 chiều". Shown as listed until confirmed.
      {
        type: "table",
        title: "Các tầng chỉ số",
        head: ["Tầng", "Bốn chiều", "Trả lời câu hỏi"],
        rows: [
          ["1 · Sức khỏe tài chính", "ROA · ROE · Thanh khoản · Đòn bẩy", "Doanh nghiệp đang làm ăn ra sao?"],
          ["2 · Rủi ro thuế", "Thuế suất hiệu dụng · GTGT · TNDN · Chênh lệch tờ khai", "Số thuế khai có hợp lý không?"],
          ["3 · Đối chiếu hồ sơ", "Báo cáo tài chính · Tờ khai GTGT · Tờ khai TNDN · Hồ sơ liên quan theo mã số thuế", "Các nguồn dữ liệu có khớp nhau không?"],
        ],
      },
      {
        type: "text",
        title: "Nguyên tắc",
        body: ["Cán bộ thuế hỏi bằng tiếng Việt qua GEO Agent. A360 đối chiếu báo cáo tài chính, tờ khai GTGT, TNDN theo mã số thuế; luôn tách bạch dữ kiện và nhận định, không bịa số liệu. Cán bộ là người kết luận."],
      },
      { type: "text", title: "Đang triển khai", body: ["Thuế TP Hà Nội, hướng tới mở rộng theo quy mô ngành Thuế."] },
    ],
    cta: DEMO,
  },
  {
    slug: "ai-platform",
    name: "AI Platform",
    kind: "Nền tảng AI dùng chung",
    title: "Một nền tảng AI cho nhiều cơ quan.",
    en: "One AI platform, many agencies.",
    lead: "Cán bộ có GEO Agent. Văn bản có bộ nhớ. Đơn vị đổi mới có nơi để thử nghiệm.",
    model: {
      kind: "stack",
      layers: ["Giám sát vận hành", "Bảo mật và quản trị", "Quy trình và công cụ", "Nền tảng Agent", "Nền tảng LLM", "Cổng mô hình", "Dữ liệu và tri thức dùng chung"].map((label) => ({ label })),
    },
    blocks: [
      {
        type: "table",
        title: "Bốn thành phần",
        head: ["Thành phần", "Người dùng nhận được gì"],
        rows: [
          ["GEO Agent cho cán bộ", "Giao việc, theo dõi, đôn đốc, báo cáo từ văn bản"],
          ["Đọc và tìm kiếm văn bản", "Tìm theo ý, không chỉ theo từ khóa; đọc, tóm tắt, trích nhiệm vụ"],
          ["Bộ nhớ liên kết tài liệu", "Nối các văn bản, hồ sơ liên quan; trả lời có ngữ cảnh xuyên nhiều tài liệu"],
          ["Cổng LLM API", "Một cổng chung tới nhiều mô hình AI; các đơn vị đổi mới sáng tạo thử nghiệm sản phẩm mới trên hạ tầng chung, có phân quyền và giám sát"],
        ],
      },
      // TODO(unconfirmed): who may use the LLM API gateway, and on what terms.
      {
        type: "text",
        title: "Sân chơi đổi mới sáng tạo",
        body: ["Cổng LLM API mở cho các đơn vị đổi mới sáng tạo xây ứng dụng mới, không phải tự dựng hạ tầng AI riêng."],
      },
      { type: "text", title: "Đang triển khai", body: ["TP Hà Nội."] },
    ],
    cta: DEMO,
  },
];

// ── Về THEHEGEO ──────────────────────────────────────────────────────────────

// TODO(unconfirmed): only logos cleared for use may be shown; none are supplied yet, so the
// organisations are listed by name.
export const PARTNERS = [
  { group: "Cơ quan nhà nước", names: ["Bộ Xây dựng", "Thuế TP Hà Nội", "TP Hà Nội"] },
  { group: "Doanh nghiệp", names: ["PTSC M&C", "PV GAS South"] },
  { group: "Tổng thầu và tư vấn quốc tế", names: ["Taisei", "Sumitomo", "GS E&C", "Chodai", "Nippon Koei"] },
  { group: "Đô thị và giao thông quốc tế", names: ["Hongkong Telecom", "ACTi", "TMS"] },
  { group: "Viễn thông", names: ["VNPT", "Viettel", "CMC Telecom"] },
  { group: "Đối tác công nghệ", names: ["NVIDIA", "Dell", "HPE", "Intel"] },
];

/**
 * Logo files in /public/partners, by partner name: the files supplied in the project's Logo folder,
 * trimmed, with any solid background removed, and sized for the web. `ratio` is the logo's width /
 * height, used to give every mark the same visual size (PartnerMark). `dark` is the version for the
 * dark theme: black and navy parts turned white, brand colours kept (NVIDIA: its official white
 * logo, with its own `darkRatio`).
 * TODO(unconfirmed): use of partner logos needs each partner's consent. TMS has no logo yet.
 */
export const PARTNER_LOGOS: Record<string, { src: string; ratio: number; dark?: string; darkRatio?: number }> = {
  "Bộ Xây dựng": { src: "/partners/bo-xay-dung.png", ratio: 1.14 },
  "Thuế TP Hà Nội": { src: "/partners/thue-ha-noi.png", ratio: 1.0 },
  "TP Hà Nội": { src: "/partners/tp-ha-noi.png", dark: "/partners/v2/tp-ha-noi-dark.png", ratio: 1.0 },
  "PTSC M&C": { src: "/partners/ptsc.png", dark: "/partners/v2/ptsc-dark.png", ratio: 1.72 },
  "PV GAS South": { src: "/partners/pv-gas.png", ratio: 1.42 },
  Taisei: { src: "/partners/taisei.png", dark: "/partners/v2/taisei-dark.png", ratio: 1.48 },
  Sumitomo: { src: "/partners/sumitomo.png", ratio: 7.08 },
  "GS E&C": { src: "/partners/gs.png", ratio: 1.97 },
  Chodai: { src: "/partners/chodai.png", dark: "/partners/v2/chodai-dark.png", ratio: 0.97 },
  "Nippon Koei": { src: "/partners/nippon-koei.png", ratio: 4.62 },
  "Hongkong Telecom": { src: "/partners/hkt.png", dark: "/partners/v2/hkt-dark.png", ratio: 2.65 },
  ACTi: { src: "/partners/acti.png", dark: "/partners/v2/acti-dark.png", ratio: 3.71 },
  VNPT: { src: "/partners/vnpt.png", ratio: 0.75 },
  Viettel: { src: "/partners/viettel.png", dark: "/partners/v2/viettel-dark.png", ratio: 2.89 },
  "CMC Telecom": { src: "/partners/cmc-telecom.png", ratio: 2.36 },
  NVIDIA: { src: "/partners/nvidia.png", ratio: 1.29, dark: "/partners/v2/nvidia-dark.svg", darkRatio: 5.47 },
  Dell: { src: "/partners/dell.png", ratio: 2.99 },
  HPE: { src: "/partners/hpe.png", dark: "/partners/v2/hpe-dark.png", ratio: 3.49 },
  Intel: { src: "/partners/intel.png", ratio: 1.52 },
};

export const ABOUT_HOME: Page = {
  slug: "",
  name: "Về THEHEGEO",
  title: "Mỗi công nghệ của chúng tôi sinh ra từ một nhu cầu thật ở hiện trường.",
  en: "Every technology we build was born from a real need in the field.",
  lead: "Thành lập ngày 09/05/2006, Thehegeo bắt đầu với địa chất, địa hình và thu thập dữ liệu bằng cảm biến cho công trình xây dựng, rồi quan trắc cầu dây văng, cảng biển, tuyến metro. Hai mươi năm sau, chúng tôi đưa AI Agent vào bộ máy.",
  blocks: [
    {
      type: "timeline",
      title: "Hành trình",
      items: [
        { year: "2006", label: "GIS" },
        { year: "2012", label: "Data Logger" },
        { year: "2016", label: "Đầu tư AI" },
        { year: "2017", label: "TranspoX" },
        { year: "2018", label: "CiviX" },
        { year: "2019", label: "VEDAX AI Platform" },
        { year: "2026", label: "GEO Agent" },
      ],
    },
  ],
};

// TODO(unconfirmed): the founder approves the mission and vision wording.
export const ABOUT: Page[] = [
  {
    slug: "su-menh-tam-nhin",
    name: "Sứ mệnh và Tầm nhìn",
    title: "Sứ mệnh và Tầm nhìn",
    blocks: [
      {
        type: "callout",
        title: "Sứ mệnh",
        body: "Giúp những hệ thống mà hàng triệu người dựa vào vận hành đúng, mỗi ngày.",
        en: "To keep the systems millions of people rely on running right, every day.",
      },
      {
        type: "callout",
        title: "Tầm nhìn",
        body: "Đưa AI Agent từ một cơ quan đến cả ngành, cả thành phố, rồi cả quốc gia.",
        en: "From one agency to a whole sector, a whole city, and then a nation.",
      },
      {
        type: "cards",
        title: "Cách chúng tôi làm việc",
        items: [
          { title: "Kết quả trước", body: "Đo bằng việc đã xong, không bằng giờ đã làm." },
          { title: "Viết ra trước", body: "Mọi việc quan trọng đều có tài liệu." },
          { title: "AI trước", body: "Dùng AI trong chính công việc hằng ngày." },
          { title: "An toàn trước", body: "Dữ liệu khách hàng chỉ được xử lý khi đã được phép." },
        ],
      },
      { type: "text", body: ["AI hỗ trợ quyết định. Con người làm chủ quyết định."] },
    ],
  },
  {
    slug: "doi-tac",
    name: "Đối tác và Khách hàng",
    title: "Những đơn vị đã cùng làm việc với Thehegeo.",
    en: "Organizations we have worked with.",
    blocks: [{ type: "partners", groups: PARTNERS }],
  },
  {
    slug: "lien-he",
    name: "Liên hệ",
    title: "Liên hệ",
    lead: "Cho chúng tôi biết bài toán anh/chị muốn giải. Đội ngũ Thehegeo sẽ liên hệ lại.",
    blocks: [{ type: "contact" }],
  },
];

// ── Tuyển dụng ───────────────────────────────────────────────────────────────

export type Job = {
  slug: string;
  title: string;
  /** The standard job-family name candidates search for (AI Engineer, Business Analyst…); the jobs page filters by it. */
  family: string;
  team: string;
  problem: string;
  duties: string[];
  requirements: string[];
  plus: string[];
};

// TODO(unconfirmed): location, type, headcount, deadline and the HR address (the document's
// "[Cần HR]"); until supplied each JD shows them as being updated and applications go to the
// general contact address.
export const JOBS: Job[] = [
  {
    slug: "ky-su-trien-khai-ai",
    title: "Kỹ sư triển khai AI cùng khách hàng",
    family: "AI Engineer",
    team: "Triển khai",
    problem: "Đưa GEO Agent vào làm việc thật trong cơ quan nhà nước và doanh nghiệp lớn.",
    duties: [
      "Ngồi cùng cán bộ để hiểu cách họ làm việc.",
      "Cấu hình và kết nối GEO Agent với hệ thống văn bản, dữ liệu của khách hàng.",
      "Đưa bài học từ hiện trường về đội sản phẩm.",
    ],
    requirements: ["Nền tảng lập trình vững.", "Kinh nghiệm tích hợp hệ thống hoặc xử lý dữ liệu.", "Giao tiếp tốt với người không chuyên công nghệ."],
    plus: ["Đã làm dự án cho cơ quan nhà nước.", "Đã dùng LLM trong sản phẩm thật."],
  },
  {
    slug: "ky-su-nen-tang-ai",
    title: "Kỹ sư nền tảng AI",
    family: "AI Engineer",
    team: "Nền tảng",
    problem: "Xây nền tảng để nhiều cơ quan cùng dùng AI trên một hạ tầng, an toàn và đổi được mô hình.",
    duties: [
      "Phát triển cổng LLM API, nền tảng Agent, bộ nhớ liên kết tài liệu.",
      "Tối ưu triển khai tại chỗ.",
      "Xây cơ chế phân quyền, nhật ký, giám sát.",
    ],
    requirements: [
      "Kinh nghiệm xây hệ thống backend hoặc hạ tầng.",
      "Hiểu cách LLM, RAG và Agent vận hành.",
      "Quen làm việc với container và hạ tầng tại chỗ.",
    ],
    plus: ["Kinh nghiệm về bảo mật và an toàn thông tin.", "Đã vận hành mô hình trên GPU."],
  },
  {
    slug: "phan-tich-nghiep-vu-khu-vuc-cong",
    title: "Chuyên viên phân tích nghiệp vụ khu vực công",
    family: "Business Analyst",
    team: "Nghiệp vụ",
    problem: "Biến cách bộ máy nhà nước giao việc, duyệt và báo cáo thành quy trình mà GEO Agent hiểu được.",
    duties: [
      "Khảo sát nghiệp vụ tại cơ quan.",
      "Viết quy trình, quy tắc và tiêu chí cho Agent.",
      "Kiểm tra kết quả Agent có đúng thể thức và quy định không.",
    ],
    requirements: [
      "Hiểu văn bản hành chính và cách vận hành của cơ quan nhà nước.",
      "Viết rõ ràng, có hệ thống.",
      "Không cần biết lập trình.",
    ],
    plus: ["Từng làm việc trong cơ quan nhà nước, ngành Thuế hoặc tài chính công.", "Đã dùng AI trong công việc."],
  },
  {
    slug: "ky-su-phan-cung-aiot",
    title: "Kỹ sư phần cứng AIoT",
    family: "Hardware Engineer",
    team: "AIoT",
    problem: "Đưa AI ra hiện trường, từ cảm biến trên cầu đến AI Box.",
    duties: [
      "Thiết kế và cải tiến datalogger, bo mạch, AI Box.",
      "Lắp đặt và hiệu chỉnh tại công trình.",
      "Phối hợp với đội phần mềm để đưa dữ liệu lên nền tảng.",
    ],
    requirements: ["Nền tảng điện tử hoặc cơ điện tử.", "Kinh nghiệm lập trình nhúng.", "Sẵn sàng làm việc tại hiện trường."],
    plus: ["Kinh nghiệm về cảm biến quan trắc công trình, thị giác máy tính hoặc robot."],
  },
];

export const JOBS_HOME: Page = {
  slug: "",
  name: "Tuyển dụng",
  title: "Còn rất nhiều bài toán lớn phía trước.",
  en: "The biggest problems are still ahead.",
  lead: "Mỗi việc ở Thehegeo gắn với một cơ quan, một công trình có thật. Chúng tôi tìm người muốn thấy công việc của mình chạy trong bộ máy nhà nước và trên những công trình lớn của Việt Nam.",
  blocks: [
    { type: "pills", title: "Bài toán chúng tôi giải", items: ["AI Agent cho bộ máy", "AI cho thuế và ngân sách", "Quan trắc công trình", "Thiết bị và AI tại biên"] },
    {
      type: "cards",
      title: "Cách chúng tôi làm việc",
      items: [
        { title: "Kết quả trước", body: "Đo bằng việc đã xong, không bằng giờ đã làm." },
        { title: "Viết ra trước", body: "Mọi việc quan trọng đều có tài liệu." },
        { title: "AI trước", body: "Dùng AI trong chính công việc hằng ngày." },
        { title: "An toàn trước", body: "Dữ liệu khách hàng chỉ được xử lý khi đã được phép." },
      ],
    },
    {
      type: "steps",
      title: "Những ngày đầu tiên",
      flow: true,
      items: [
        { title: "15 ngày đầu", body: "Hiểu sản phẩm và khách hàng." },
        { title: "45 ngày đầu", body: "Có kết quả đầu tiên." },
        { title: "Năm đầu", body: "Chọn hướng phát triển." },
      ],
      note: "Hai hướng ngang nhau: chuyên gia hoặc quản lý. Không ai bị ép phải làm trưởng nhóm.",
    },
    { type: "jobs" },
  ],
};

// ── Lookups ──────────────────────────────────────────────────────────────────

export const SECTIONS = {
  "giai-phap": { title: "Giải pháp", base: "/giai-phap/", home: SOLUTIONS_HOME, pages: SOLUTIONS },
  "ung-dung": { title: "Ứng dụng", base: "/ung-dung/", home: APPS_HOME, pages: APPS },
  "ve-thehegeo": { title: "Về THEHEGEO", base: "/ve-thehegeo/", home: ABOUT_HOME, pages: ABOUT },
} as const;
export type SectionKey = keyof typeof SECTIONS;

/** A detail page by section and slug (one route folder per page under src/app/(site)/<section>/). */
export const detail = (section: SectionKey, slug: string) => SECTIONS[section].pages.find((p) => p.slug === slug)!;
export const job = (slug: string) => JOBS.find((j) => j.slug === slug)!;

export const APPLY_EMAIL = "geotech@thehegeo.com";
