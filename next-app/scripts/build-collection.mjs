// Generates src/content/payload/pages.json. Labels and descriptions are what editors
// read in /admin, so keep them in plain Vietnamese and describe where each field shows on the page.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// The partner list the site itself uses (Về THEHEGEO, the logos), so the select cannot drift from it.
import { PARTNER_NAMES } from '../src/components/site/sections/partners.ts';

const link = (label, description = 'Trang trong website bắt đầu bằng /, ví dụ /geoagents/. Link ngoài bắt đầu bằng https://.') =>
  ({ name: 'href', type: 'text', required: true, label, admin: { description } });

/** Fields every block shares: the visibility switch on top, the HTML anchor tucked away. */
const common = [
  { name: 'enabled', type: 'checkbox', defaultValue: true, label: 'Hiển thị section này', admin: { description: 'Bỏ chọn để ẩn tạm section mà không mất nội dung.' } },
];
const advanced = (...extra) => ({
  type: 'collapsible',
  label: 'Nâng cao (thường không cần sửa)',
  admin: { initCollapsed: true },
  fields: [
    { name: 'anchor', type: 'text', required: false, label: 'Mã neo liên kết', admin: { description: 'Dùng cho link nhảy tới section (ví dụ #cta). Chỉ chữ không dấu, số, - và _, bắt đầu bằng chữ. Đổi mã này có thể làm hỏng link đang trỏ tới.' } },
    ...extra,
  ],
});
const heading = (titleDescription, highlightLabel, highlightDescription) => [
  { name: 'title', type: 'text', required: true, label: 'Tiêu đề', admin: { description: titleDescription } },
  { name: 'highlight', type: 'text', required: true, label: highlightLabel, admin: { description: highlightDescription } },
];
const kicker = { name: 'kicker', type: 'text', required: true, label: 'Nhãn nhỏ trên tiêu đề', admin: { description: 'Gõ chữ thường như bình thường, website tự viết in hoa.' } };

const blocks = [
  {
    slug: 'homeHero',
    labels: { singular: 'Hero trang chủ', plural: 'Hero trang chủ' },
    admin: { description: 'Phần đầu trang có video. Mỗi trang chỉ nên có một Hero vì đây là tiêu đề chính (H1). Video và hiệu ứng nằm trong code.' },
    fields: [...common,
      { name: 'heading', type: 'text', required: true, label: 'Tiêu đề chính (H1)', admin: { description: 'Câu mô tả cả trang, dùng cho người đọc màn hình và công cụ tìm kiếm.' } },
      advanced()],
  },
  {
    slug: 'metrics',
    labels: { singular: 'Dải số liệu', plural: 'Dải số liệu' },
    admin: { description: 'Hàng số chạy từ 0 lên giá trị khi cuộn tới.' },
    fields: [...common,
      {
        name: 'items', type: 'array', required: true, minRows: 1, label: 'Các số liệu',
        labels: { singular: 'Số liệu', plural: 'Số liệu' },
        fields: [
          { name: 'value', type: 'number', required: true, label: 'Giá trị số', admin: { description: 'Con số cuối cùng hiển thị, ví dụ 100.' } },
          { name: 'label', type: 'text', required: true, label: 'Mô tả dưới số', admin: { description: 'Ví dụ: Chủ quyền dữ liệu.' } },
          { name: 'prefix', type: 'text', label: 'Chữ trước số', admin: { description: 'Tuỳ chọn, ví dụ "Level". Khoảng cách với số được thêm tự động.' } },
          { name: 'suffix', type: 'text', label: 'Ký hiệu sau số (cùng cỡ)', admin: { description: 'Tuỳ chọn, ví dụ "+" để thành 3+.' } },
          { name: 'unit', type: 'text', label: 'Đơn vị sau số (chữ nhỏ)', admin: { description: 'Tuỳ chọn, ví dụ "%". Hiển thị nhỏ hơn con số.' } },
          { name: 'minDigits', type: 'number', min: 1, max: 12, label: 'Số chữ số tối thiểu', admin: { description: 'Tuỳ chọn. Nhập 2 thì số 4 hiển thị thành 04. Để trống nếu không cần.' } },
        ],
      },
      advanced({ name: 'label', type: 'text', required: true, label: 'Tên section cho trình đọc màn hình', admin: { description: 'Không hiển thị trên trang, chỉ đọc cho người khiếm thị.' } })],
  },
  {
    slug: 'partners',
    labels: { singular: 'Dải logo đối tác', plural: 'Dải logo đối tác' },
    admin: { description: 'Logo chạy ngang liên tục. Chỉ chọn được đối tác đã có trong danh sách; muốn thêm đối tác mới cần nhờ dev thêm logo.' },
    fields: [...common,
      { name: 'title', type: 'text', required: true, label: 'Tiêu đề', admin: { description: 'Dòng chữ phía trên dải logo.' } },
      {
        name: 'items', type: 'array', required: true, minRows: 1, label: 'Đối tác',
        labels: { singular: 'Đối tác', plural: 'Đối tác' },
        fields: [
          { name: 'name', type: 'select', required: true, label: 'Tên đối tác', options: PARTNER_NAMES, admin: { description: 'Đối tác chưa có logo sẽ hiển thị bằng tên.' } },
        ],
      },
      { name: 'linkLabel', type: 'text', required: true, label: 'Chữ trên link', admin: { description: 'Ví dụ: Xem đối tác và khách hàng.' } },
      link('Link tới trang'),
      advanced()],
  },
  {
    slug: 'coreShowcase',
    labels: { singular: 'Giới thiệu GEOagents 4 tầng (trang chủ)', plural: 'Giới thiệu GEOagents 4 tầng (trang chủ)' },
    admin: { description: 'Chữ bên trái, sơ đồ 4 tầng bên phải. Sơ đồ nằm trong code; tên sản phẩm ở đây phải khớp với sơ đồ.' },
    fields: [...common,
      kicker,
      ...heading('Dòng 1 của tiêu đề, màu chữ thường.', 'Dòng 2 (màu nhấn)', 'Dòng 2 của tiêu đề, hiển thị bằng màu nhấn.'),
      {
        name: 'items', type: 'array', required: true, minRows: 1, label: 'Các tầng',
        labels: { singular: 'Tầng', plural: 'Tầng' },
        fields: [
          { name: 'product', type: 'text', required: true, label: 'Tên sản phẩm', admin: { description: 'Ví dụ: GEO Governance. Hiển thị in hoa bên trái.' } },
          { name: 'label', type: 'text', required: true, label: 'Tên tầng', admin: { description: 'Ví dụ: Quản trị. Hiển thị bên phải.' } },
        ],
      },
      { name: 'linkLabel', type: 'text', required: true, label: 'Chữ trên link' },
      link('Link tới trang'),
      advanced()],
  },
  {
    slug: 'agentDemo',
    labels: { singular: 'Demo Agent xử lý công văn (trang chủ)', plural: 'Demo Agent xử lý công văn (trang chủ)' },
    admin: { description: 'Mô phỏng bên trái, chữ bên phải. Nội dung bên trong mô phỏng nằm trong code, ở đây chỉ sửa phần chữ.' },
    fields: [...common,
      kicker,
      ...heading('Dòng 1 của tiêu đề, màu chữ thường.', 'Dòng 2 (màu nhấn)', 'Dòng 2 của tiêu đề, hiển thị bằng màu nhấn.'),
      { name: 'body', type: 'textarea', required: true, label: 'Đoạn mô tả', admin: { description: 'Một đến hai câu dưới tiêu đề.' } },
      advanced()],
  },
  {
    slug: 'navigationTiles',
    labels: { singular: 'Lưới ô điều hướng', plural: 'Lưới ô điều hướng' },
    admin: { description: 'Các ô dẫn tới trang con, mỗi ô có danh sách gạch đầu dòng.' },
    fields: [...common,
      ...heading('Phần đầu tiêu đề, màu chữ thường.', 'Phần nhấn (cùng dòng)', 'Nối tiếp ngay sau tiêu đề trên cùng dòng, hiển thị bằng màu nhấn.'),
      {
        name: 'tiles', type: 'array', required: true, minRows: 1, label: 'Các ô',
        labels: { singular: 'Ô', plural: 'Ô' },
        fields: [
          { name: 'title', type: 'text', required: true, label: 'Tên ô', admin: { description: 'Ví dụ: Giải pháp.' } },
          link('Link khi bấm vào ô'),
          { name: 'size', type: 'select', required: true, defaultValue: 'normal', label: 'Kích thước', options: [{ label: 'Thường (1 cột)', value: 'normal' }, { label: 'Rộng (2 cột)', value: 'wide' }] },
          { name: 'image', type: 'text', label: 'Ảnh nền', admin: { description: 'Tuỳ chọn. Đường dẫn ảnh, ví dụ /media/case-city.jpg. Sẽ đổi sang chọn từ thư viện ảnh khi có Media.' } },
          {
            name: 'lines', type: 'array', required: true, minRows: 1, label: 'Gạch đầu dòng',
            labels: { singular: 'Dòng', plural: 'Dòng' },
            fields: [{ name: 'text', type: 'text', required: true, label: 'Nội dung dòng' }],
          },
        ],
      },
      advanced()],
  },
  {
    slug: 'cta',
    labels: { singular: 'Kêu gọi liên hệ (CTA)', plural: 'Kêu gọi liên hệ (CTA)' },
    admin: { description: 'Section cuối trang mời khách gửi yêu cầu.' },
    fields: [...common,
      ...heading('Dòng 1 của tiêu đề lớn.', 'Dòng 2', 'Dòng 2 của tiêu đề lớn, cùng màu với dòng 1.'),
      { name: 'question', type: 'text', required: true, label: 'Câu hỏi', admin: { description: 'Dòng in đậm dưới tiêu đề.' } },
      { name: 'body', type: 'textarea', required: true, label: 'Đoạn mô tả' },
      { name: 'action', type: 'text', required: true, label: 'Chữ trên nút', admin: { description: 'Nên bắt đầu bằng động từ, ví dụ: Gửi yêu cầu tư vấn.' } },
      link('Link của nút'),
      advanced()],
  },
];

export const collection = {
  slug: 'pages',
  labels: { singular: 'Trang', plural: 'Các trang' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'updatedAt'] },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Tên trang', admin: { description: 'Tên để nhận biết trang trong danh sách quản trị.' } },
    { name: 'slug', type: 'text', required: true, unique: true, label: 'Đường dẫn trang', admin: { position: 'sidebar', description: 'Ví dụ: home. Không đổi sau khi trang đã xuất bản.' } },
    {
      name: 'layout', type: 'blocks', required: true, minRows: 1, label: 'Các section của trang',
      labels: { singular: 'Section', plural: 'Section' },
      admin: { description: 'Thứ tự từ trên xuống ở đây là thứ tự trên trang. Kéo để đổi chỗ.' },
      blocks,
    },
  ],
};

// ── Corporate pages (Giải pháp, Use Case, Về THEHEGEO, Tuyển dụng) ───────────────────────────────

const text = (name, label, description, more = {}) => ({ name, type: 'text', label, ...(description && { admin: { description } }), ...more });
const area = (name, label, description, more = {}) => ({ ...text(name, label, description, more), type: 'textarea' });
const lines = (name, label, singular, description, more = {}) => ({
  name, type: 'array', label, labels: { singular, plural: singular }, ...(description && { admin: { description } }), ...more,
  fields: [{ name: 'text', type: 'text', required: true, label: 'Nội dung' }],
});
const optionalLink = (description = 'Tuỳ chọn. Trang trong website bắt đầu bằng /, link ngoài bằng https://.') => text('href', 'Link', description);
const shown = { name: 'enabled', type: 'checkbox', defaultValue: true, label: 'Hiển thị section này', admin: { description: 'Bỏ chọn để ẩn tạm section mà không mất nội dung.' } };
const sectionTitle = text('title', 'Tiêu đề section', 'Tuỳ chọn. Một section không có tiêu đề và chỉ có một đoạn văn hiện thành câu chốt chữ lớn.');
const corporateBlock = (slug, singular, description, fields = [], extra = {}) => ({ slug, labels: { singular, plural: singular }, admin: { description }, fields: [shown, ...fields], ...extra });
const textLink = [text('linkLabel', 'Chữ trên link'), text('linkHref', 'Link', 'Trang trong website bắt đầu bằng /, link ngoài bằng https://.')];

const corporateBlocks = [
  corporateBlock('cards', 'Thẻ', 'Lưới thẻ. Từ ba thẻ trở lên mà thẻ nào cũng có link thì hiện thành hàng; khi thẻ đầu có ảnh thì thành một thẻ lớn có ảnh.', [
    sectionTitle,
    { name: 'items', type: 'array', required: true, minRows: 1, label: 'Các thẻ', labels: { singular: 'Thẻ', plural: 'Thẻ' }, fields: [
      text('title', 'Tên thẻ', undefined, { required: true }),
      area('body', 'Mô tả'),
      optionalLink(),
      text('cta', 'Chữ trên link', 'Ví dụ: Xem giải pháp.'),
      text('image', 'Ảnh', 'Tuỳ chọn, chỉ dùng cho thẻ đầu. Đường dẫn ảnh, ví dụ /media/case-city.jpg.'),
    ] },
  ]),
  corporateBlock('table', 'Bảng (hiện thành thẻ)', 'Mỗi hàng thành một thẻ: ô đầu là tên thẻ, các ô sau có tên cột làm nhãn. Ô có link biến cả thẻ thành link.', [
    sectionTitle,
    { name: 'by', type: 'select', label: 'Cách chia thẻ', options: [{ label: 'Mỗi hàng một thẻ', value: 'row' }, { label: 'Mỗi cột một thẻ', value: 'column' }], admin: { description: 'Để trống là mỗi hàng một thẻ.' } },
    { ...lines('head', 'Tên các cột', 'Cột', 'Theo thứ tự từ trái sang. Khi chia mỗi cột một thẻ, để trống tên cột đầu thì cột đầu thành nhãn cho từng giá trị.', { required: true, minRows: 1 }), fields: [{ name: 'text', type: 'text', label: 'Tên cột' }] },
    { name: 'rows', type: 'array', required: true, minRows: 1, label: 'Các hàng', labels: { singular: 'Hàng', plural: 'Hàng' }, fields: [
      { name: 'cells', type: 'array', required: true, minRows: 1, label: 'Các ô', labels: { singular: 'Ô', plural: 'Ô' }, admin: { description: 'Cùng thứ tự với tên các cột.' }, fields: [
        text('text', 'Nội dung', undefined, { required: true }),
        optionalLink('Tuỳ chọn: ô có link biến cả thẻ thành link.'),
      ] },
    ] },
  ]),
  corporateBlock('steps', 'Các bước', 'Các bước theo thứ tự.', [
    sectionTitle,
    { name: 'flow', type: 'checkbox', label: 'Hiện dạng luồng có mũi tên' },
    { name: 'items', type: 'array', required: true, minRows: 1, label: 'Các bước', labels: { singular: 'Bước', plural: 'Bước' }, fields: [text('title', 'Tên bước', undefined, { required: true }), area('body', 'Mô tả')] },
    area('note', 'Ghi chú dưới các bước'),
  ]),
  corporateBlock('list', 'Danh sách', 'Danh sách các dòng, mỗi dòng có thể có tiêu đề và link.', [
    sectionTitle,
    { name: 'items', type: 'array', required: true, minRows: 1, label: 'Các dòng', labels: { singular: 'Dòng', plural: 'Dòng' }, fields: [text('title', 'Tiêu đề dòng'), area('body', 'Nội dung', undefined, { required: true }), optionalLink()] },
  ]),
  corporateBlock('text', 'Đoạn văn', 'Một hoặc nhiều đoạn văn, có thể kèm link.', [
    sectionTitle,
    { ...lines('body', 'Các đoạn', 'Đoạn', undefined, { required: true, minRows: 1 }), fields: [{ name: 'text', type: 'textarea', required: true, label: 'Nội dung' }] },
    ...textLink,
  ]),
  corporateBlock('pills', 'Nhãn', 'Hàng nhãn ngắn dạng viên thuốc.', [sectionTitle, lines('items', 'Các nhãn', 'Nhãn', undefined, { required: true, minRows: 1 })]),
  corporateBlock('timeline', 'Dòng thời gian', 'Các mốc theo năm; mốc cuối hiện màu đỏ.', [
    sectionTitle,
    { name: 'items', type: 'array', required: true, minRows: 1, label: 'Các mốc', labels: { singular: 'Mốc', plural: 'Mốc' }, fields: [text('year', 'Năm', undefined, { required: true }), text('label', 'Nội dung', undefined, { required: true })] },
  ]),
  corporateBlock('layers', 'Các tầng', 'Sơ đồ các tầng xếp chồng, tầng đầu ở trên.', [sectionTitle, lines('items', 'Các tầng', 'Tầng', undefined, { required: true, minRows: 1 })]),
  corporateBlock('partners', 'Đối tác', 'Logo đối tác theo nhóm, lấy từ danh sách đối tác chung. Thêm đối tác hoặc logo cần nhờ dev.', [sectionTitle]),
  corporateBlock('callout', 'Câu nổi bật', 'Một câu chữ lớn trong khung viền đỏ, có thể kèm đoạn giải thích.', [
    sectionTitle,
    area('body', 'Câu nổi bật', undefined, { required: true }),
    area('detail', 'Đoạn giải thích', 'Tuỳ chọn, chữ thường dưới câu nổi bật.'),
    text('en', 'Dòng tiếng Anh', 'Tuỳ chọn.'),
  ]),
  corporateBlock('rings', 'Vòng tròn đồng tâm', 'Câu tuyên bố bên trái, các vòng tròn bên phải nở dần từ trong ra; vòng trong cùng màu đỏ.', [
    sectionTitle,
    text('statement', 'Câu tuyên bố', undefined, { required: true }),
    area('body', 'Đoạn mô tả', undefined, { required: true }),
    lines('items', 'Các vòng', 'Vòng', 'Từ trong ra ngoài.', { required: true, minRows: 2 }),
  ]),
  corporateBlock('values', 'Giá trị', 'Một hàng chữ lớn, mỗi giá trị một ô.', [sectionTitle, lines('items', 'Các giá trị', 'Giá trị', undefined, { required: true, minRows: 1 })]),
  corporateBlock('case', 'Case study', 'Hồ sơ case study có sẵn (nội dung case nằm trong code).', [
    sectionTitle,
    { name: 'caseId', type: 'select', required: true, label: 'Case study', options: [{ label: 'Quản lý dự án công nghiệp (PTSC M&C)', value: 'quan-ly-du-an' }, { label: 'Dịch vụ công', value: 'dich-vu-cong' }, { label: 'AI Platform', value: 'ai-platform' }] },
  ]),
  corporateBlock('project', 'Dự án', 'Hồ sơ một dự án: bài toán, giải pháp, kết quả.', [
    text('title', 'Tên dự án', undefined, { required: true }),
    text('client', 'Khách hàng', undefined, { required: true }),
    area('problem', 'Bài toán', undefined, { required: true }),
    lines('solution', 'Giải pháp GEO Agent', 'Ý', undefined, { required: true, minRows: 1 }),
    area('result', 'Kết quả', undefined, { required: true }),
    { type: 'collapsible', label: 'Hồ sơ dự án (tuỳ chọn)', admin: { initCollapsed: true }, fields: [text('period', 'Thời gian thực hiện'), text('status', 'Trạng thái triển khai'), text('scope', 'Phạm vi thực hiện'), text('role', 'Vai trò của THEHEGEO')] },
    ...textLink,
  ]),
  corporateBlock('contact', 'Biểu mẫu liên hệ', 'Biểu mẫu liên hệ và thông tin liên hệ. Email, điện thoại, địa chỉ sửa ở Footer.'),
  corporateBlock('jobs', 'Danh sách vị trí', 'Các vị trí đang tuyển. Sửa từng vị trí ở trang tin tuyển dụng đó.'),
  corporateBlock('projectIndex', 'Danh sách dự án', 'Tự liệt kê mọi dự án trên các trang Use Case; sửa dự án ở trang Use Case đó.'),
  corporateBlock('waysOfWorking', 'Cách chúng tôi làm việc (dùng chung)', 'Nội dung dùng chung cho trang Sứ mệnh và Tầm nhìn và trang Tuyển dụng: sửa ở một chỗ, cả hai trang cùng đổi.', [], { custom: { shared: 'ways' } }),
];

const modelBlock = (slug, singular, description, fields = []) => ({ slug, labels: { singular, plural: singular }, admin: { description }, fields });
const modelBlocks = [
  modelBlock('core', 'Lõi GEO Agent', 'Hình lõi chuyển động, không có chữ để sửa.'),
  modelBlock('bridge', 'Cây cầu bốn lớp', 'Bốn nhãn theo thứ tự trên cây cầu.', [lines('labels', 'Các nhãn', 'Nhãn', undefined, { required: true, minRows: 4, maxRows: 4 })]),
  modelBlock('devices', 'Chuỗi thiết bị', 'Các thiết bị theo thứ tự.', [lines('items', 'Các thiết bị', 'Thiết bị', undefined, { required: true, minRows: 1 })]),
  modelBlock('phone', 'Cuộc gọi', 'Một cuộc gọi mẫu giữa người gọi và Agent.', [
    text('title', 'Tiêu đề', undefined, { required: true }),
    text('caller', 'Người gọi', undefined, { required: true }),
    { name: 'script', type: 'array', required: true, minRows: 1, label: 'Lời thoại', labels: { singular: 'Câu', plural: 'Câu' }, fields: [
      { name: 'who', type: 'select', required: true, label: 'Ai nói', options: [{ label: 'Người gọi', value: 'in' }, { label: 'Agent', value: 'agent' }] },
      area('text', 'Nội dung', undefined, { required: true }),
    ] },
  ]),
  modelBlock('stack', 'Các tầng xếp chồng', 'Các tầng từ trên xuống, mỗi tầng có thể có nhãn nhỏ.', [
    { name: 'layers', type: 'array', required: true, minRows: 1, label: 'Các tầng', labels: { singular: 'Tầng', plural: 'Tầng' }, fields: [text('label', 'Tên tầng', undefined, { required: true }), lines('chips', 'Nhãn nhỏ', 'Nhãn')] },
  ]),
];

export const corporate = {
  slug: 'corporate',
  labels: { singular: 'Trang doanh nghiệp', plural: 'Các trang doanh nghiệp' },
  fields: [
    text('name', 'Tên trang', 'Tên ngắn trên menu, thẻ và mục "Xem thêm".', { required: true }),
    text('kind', 'Dòng mô tả ngắn', 'Tuỳ chọn. Hiện dưới tên trang trong menu và mục "Xem thêm".'),
    area('title', 'Tiêu đề lớn (H1)', 'Câu tiêu đề ở đầu trang.', { required: true }),
    text('en', 'Dòng tiếng Anh', 'Tuỳ chọn, dưới tiêu đề lớn.'),
    area('lead', 'Đoạn mở đầu', 'Tuỳ chọn, dưới tiêu đề. Cũng là mô tả trang cho công cụ tìm kiếm.'),
    text('image', 'Ảnh banner', 'Tuỳ chọn. Đường dẫn ảnh, ví dụ /media/case-city.jpg. Trên trang tổng, ảnh của trang con đầu tiên làm thẻ lớn.'),
    { name: 'model', type: 'blocks', maxRows: 1, label: 'Hình minh hoạ cạnh tiêu đề', labels: { singular: 'Hình', plural: 'Hình' }, admin: { description: 'Tuỳ chọn, tối đa một hình.' }, blocks: modelBlocks },
    { name: 'blocks', type: 'blocks', required: true, minRows: 1, label: 'Các section của trang', labels: { singular: 'Section', plural: 'Section' }, admin: { description: 'Thứ tự từ trên xuống ở đây là thứ tự trên trang.' }, blocks: corporateBlocks },
    { name: 'cta', type: 'array', label: 'Nút cuối trang', labels: { singular: 'Nút', plural: 'Nút' }, admin: { description: 'Nút đầu là nút chính, các nút sau là nút phụ.' }, fields: [text('label', 'Chữ trên nút', undefined, { required: true }), optionalLink('Để trống thì dẫn tới trang Liên hệ.')] },
  ],
};

export const job = {
  slug: 'job',
  labels: { singular: 'Tin tuyển dụng', plural: 'Tin tuyển dụng' },
  fields: [
    text('title', 'Tên vị trí', 'Như JD ghi.', { required: true }),
    text('focus', 'Mảng chuyên môn', 'Tuỳ chọn, ví dụ: LLM, Agents & Workflow.'),
    text('code', 'Mã vị trí', 'Mã ngắn trên tem hồ sơ và tiêu đề email ứng tuyển.', { required: true }),
    text('family', 'Nhóm nghề', 'Dùng để lọc ở trang Tuyển dụng.', { required: true }),
    area('summary', 'Tóm tắt một dòng', 'Hiện trên thẻ vị trí.', { required: true }),
    area('intro', 'Giới thiệu', undefined, { required: true }),
    lines('duties', 'Mô tả công việc', 'Ý', undefined, { required: true, minRows: 1 }),
    lines('requirements', 'Yêu cầu', 'Ý', undefined, { required: true, minRows: 1 }),
    lines('plus', 'Điểm cộng', 'Ý', undefined, { required: true, minRows: 1 }),
    lines('benefits', 'Quyền lợi', 'Ý', undefined, { required: true, minRows: 1 }),
    text('location', 'Địa điểm làm việc', undefined, { required: true }),
    text('subject', 'Tiêu đề email ứng tuyển', 'Tuỳ chọn. Để trống thì dùng "[Mã vị trí] Ứng tuyển Tên vị trí".'),
    lines('skills', 'Kỹ năng chính (nhãn)', 'Nhãn', 'Tuỳ chọn. Để trống thì dùng phần Yêu cầu.'),
    lines('areas', 'Mảng công việc (nhãn)', 'Nhãn', 'Tuỳ chọn.'),
  ],
};

export const header = {
  slug: 'header',
  label: 'Header',
  fields: [
    { name: 'nav', type: 'array', required: true, minRows: 1, label: 'Menu', labels: { singular: 'Mục menu', plural: 'Mục menu' }, admin: { description: 'Thứ tự từ trái sang. Menu con lấy tự động từ các trang của section được chọn.' }, fields: [
      text('label', 'Chữ trên menu', undefined, { required: true }),
      text('href', 'Link', 'Trang trong website bắt đầu bằng /, ví dụ /giai-phap/.', { required: true }),
      { name: 'menu', type: 'select', label: 'Menu con', options: [{ label: 'Các trang Giải pháp', value: 'giai-phap' }, { label: 'Các trang Use Case', value: 'ung-dung' }, { label: 'Các trang Về THEHEGEO', value: 've-thehegeo' }], admin: { description: 'Tuỳ chọn. Để trống thì không có menu con.' } },
    ] },
  ],
};

export const footer = {
  slug: 'footer',
  label: 'Footer',
  fields: [
    text('tagline', 'Khẩu hiệu, dòng 1', undefined, { required: true }),
    text('taglineHighlight', 'Khẩu hiệu, dòng 2', 'Hiện màu nhạt hơn dòng 1.', { required: true }),
    text('email', 'Email liên hệ', 'Cũng dùng cho biểu mẫu liên hệ và menu trên điện thoại.', { required: true }),
    text('phone', 'Số điện thoại', 'Hiện như gõ; link gọi điện được tạo từ các chữ số.', { required: true }),
    text('address', 'Địa chỉ', undefined, { required: true }),
    text('copyright', 'Dòng bản quyền', undefined, { required: true }),
    text('motto', 'Câu cuối trang', undefined, { required: true }),
    text('wordmark', 'Chữ lớn cuối trang', 'Chữ lớn trồi lên khi cuộn tới cuối trang.', { required: true }),
  ],
};

export const ways = {
  slug: 'ways',
  label: 'Cách chúng tôi làm việc',
  fields: [
    text('title', 'Tiêu đề section', undefined, { required: true }),
    { name: 'items', type: 'array', required: true, minRows: 1, label: 'Các nguyên tắc', labels: { singular: 'Nguyên tắc', plural: 'Nguyên tắc' }, fields: [text('title', 'Tên nguyên tắc', undefined, { required: true }), area('body', 'Mô tả', undefined, { required: true })] },
  ],
};

// ── GEOagents (its own components; the copy of each section) ────────────────────────────────────

/** A section of the page; `custom.selector` is where the editor's preview scrolls to it. */
const part = (name, label, selector, fields, description) => ({ name, type: 'group', label, ...(description && { admin: { description } }), custom: { selector }, fields });
const homeBlock = (slug) => blocks.find((b) => b.slug === slug).fields;
const twoLines = [
  text('title', 'Tiêu đề, dòng 1', undefined, { required: true }),
  text('highlight', 'Tiêu đề, dòng 2 (màu nhấn)', undefined, { required: true }),
  text('intro', 'Giới thiệu, dòng 1', undefined, { required: true }),
  text('introLine2', 'Giới thiệu, dòng 2', undefined, { required: true }),
];

export const geoagents = {
  slug: 'geoagents',
  label: 'Trang GEOagents',
  fields: [
    part('hero', 'Phần đầu trang (video)', '#geoagents', [
      text('title', 'Tên, phần đầu', 'Ví dụ: GEO.', { required: true }),
      text('highlight', 'Tên, phần sau (màu nhấn)', 'Ví dụ: agents. Nối liền ngay sau phần đầu.', { required: true }),
      text('subtitle', 'Dòng phụ', 'Gõ như muốn hiện (đang viết in hoa).', { required: true }),
      area('description', 'Mô tả', undefined, { required: true }),
      text('primaryLabel', 'Chữ trên nút chính', 'Nút dẫn xuống phần bốn tầng.', { required: true }),
      text('secondaryLabel', 'Chữ trên nút phụ', undefined, { required: true }),
      text('secondaryHref', 'Link nút phụ', 'Trang trong website bắt đầu bằng /.', { required: true }),
    ], 'Video và hiệu ứng nằm trong code; ở đây sửa chữ.'),
    part('metrics', 'Dải số liệu', '.metrics', [
      text('label', 'Tên dải cho trình đọc màn hình', 'Không hiện trên trang.', { required: true }),
      homeBlock('metrics').find((f) => f.name === 'items'),
    ]),
    part('architecture', 'Bốn tầng tổ chức', '#architecture', [
      ...twoLines,
      text('captionLeft', 'Chú thích dưới sơ đồ, bên trái', undefined, { required: true }),
      text('captionRight', 'Chú thích dưới sơ đồ, bên phải', undefined, { required: true }),
      { name: 'layers', type: 'array', required: true, minRows: 4, maxRows: 4, label: 'Bốn tầng', labels: { singular: 'Tầng', plural: 'Tầng' }, admin: { description: 'Sơ đồ vẽ đúng bốn tầng, từ Quản trị đến Dịch vụ.' }, fields: [
        text('tab', 'Tên tầng', 'Ví dụ: Quản trị.', { required: true }),
        text('product', 'Tên sản phẩm', 'Ví dụ: GEO Governance.', { required: true }),
        area('body', 'Mô tả tầng', undefined, { required: true }),
      ] },
    ], 'Sơ đồ chuyển động nằm trong code; ở đây sửa chữ và tên các tầng.'),
    part('applications', 'Ứng dụng thực tiễn', '#applications', twoLines, 'Hồ sơ case study bên dưới nằm trong code.'),
    part('careers', 'Tuyển dụng', '#careers', [
      text('title', 'Tiêu đề, dòng 1', undefined, { required: true }),
      text('highlight', 'Tiêu đề, dòng 2 (màu nhấn)', undefined, { required: true }),
      area('body', 'Mô tả', undefined, { required: true }),
      area('apply', 'Lời mời ứng tuyển', undefined, { required: true }),
      text('action', 'Chữ trên nút', 'Nút gửi email tới địa chỉ ở Footer.', { required: true }),
      text('subject', 'Tiêu đề email ứng tuyển', undefined, { required: true }),
    ]),
    part('cta', 'Kêu gọi liên hệ (cuối trang)', '.cta', homeBlock('cta').filter((f) => f.name !== 'enabled' && f.type !== 'collapsible')),
  ],
};

/** Every schema by the name registry.ts gives it, and the file it is written to. */
export const SCHEMAS = { pages: collection, corporate, job, header, footer, ways, geoagents };

// Written only when run (npm run content:schema); the tests import SCHEMAS to check the files are current.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [name, schema] of Object.entries(SCHEMAS)) {
    writeFileSync(new URL(`../src/content/payload/${name}.json`, import.meta.url), JSON.stringify(schema, null, 2) + '\n');
  }
  console.log('Wrote', Object.keys(SCHEMAS).map((n) => `${n}.json`).join(', '));
}
