// Generates src/content/payload/pages.collection.json. Labels and descriptions are what editors
// read in /admin, so keep them in plain Vietnamese and describe where each field shows on the page.
import { writeFileSync } from 'node:fs';

// Keys of PARTNER_LOGOS in src/components/site/catalog.ts, plus partners shown by name until their
// logo arrives (TMS). Add a name here after adding its logo there.
const PARTNER_NAMES = ['Bộ Xây dựng', 'Thuế TP Hà Nội', 'TP Hà Nội', 'PTSC M&C', 'PV GAS South', 'Taisei', 'Sumitomo', 'GS E&C', 'Chodai', 'Nippon Koei', 'Hongkong Telecom', 'ACTi', 'TMS', 'VNPT', 'Viettel', 'CMC Telecom', 'NVIDIA', 'Dell', 'HPE', 'Intel'];

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

const collection = {
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

writeFileSync(new URL('../src/content/payload/pages.collection.json', import.meta.url), JSON.stringify(collection, null, 2) + '\n');
console.log('Wrote pages.collection.json');
