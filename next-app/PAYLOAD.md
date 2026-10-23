# Chuẩn bị block cho Payload CMS

## Trạng thái

Trang chủ `/` đã chạy từ `src/content/pages/home.json`: 7 loại block là `homeHero`,
`metrics`, `partners`, `coreShowcase`, `agentDemo`, `navigationTiles`, `cta`.
`RenderBlocks` chọn component theo `blockType`; thứ tự trong `layout` là thứ tự trên trang.
CSS, video, 3D và animation vẫn do các component hiện tại xử lý.

Đây là bước chuẩn bị dữ liệu và giao diện, **chưa cài Payload, database, API hoặc /admin**.
Các trang khác vẫn dùng cấu trúc hiện có. Riêng Metrics và CTA dùng chung đã nhận props
và có dữ liệu mặc định tại `src/content/globals/`.

## Chỉnh nội dung hiện tại

- Sửa `src/content/pages/home.json` để sửa trang chủ.
- Đổi thứ tự phần tử trong `layout` để di chuyển section.
- Đặt `enabled: false` để ẩn block, bỏ thuộc tính hoặc đặt `true` để hiện.
- Khi nhân bản, cấp `id` mới và đổi hoặc bỏ `anchor`. ID phải ổn định giữa các lần chỉnh sửa.
- Giữ Hero duy nhất để trang có một tiêu đề H1. Giữ các anchor đang có nếu có link trỏ tới chúng.
- `anchor` là ID HTML cho liên kết trong trang, không phải ID dữ liệu của Payload.
- Array văn bản dùng object như `[{ "text": "Dòng 1" }]`, phù hợp với field array của Payload.
- Ảnh tile hiện là đường dẫn `/media/...` hoặc URL HTTPS. Chưa phải quan hệ Media/upload.
- Đối tác dùng tên để chọn logo có sẵn trong `PartnerMark`; muốn quản lý logo cần thêm Media.
- Nội dung mô phỏng bên trong `HomeDemo`, video Hero và cấu hình mô hình 3D vẫn ở code.
- CTA trang chủ là bản riêng trong `home.json`; CTA mặc định của các trang khác ở
  `globals/cta.json`. Metrics cũng có bản riêng của trang chủ và bộ mặc định cho trang GEOagents.
  Khi cần đồng bộ nội dung giữa các trang, chuyển sang Payload Global hoặc relationship.

Chạy trong thư mục `next-app`:

```sh
npm run check:content
node --test scripts/content.test.mjs
npm run build:pages
```

Cả `build` và `build:pages` kiểm tra dữ liệu trước khi build. Bộ kiểm tra phát hiện
field thiếu/sai kiểu, block không được hỗ trợ, ID/anchor trùng và đường dẫn không hợp lệ.

## Kết nối Payload sau này

Schema field đã chuẩn bị tại `src/content/payload/pages.collection.json`, theo
[Blocks field](https://payloadcms.com/docs/fields/blocks) và
[Collection config](https://payloadcms.com/docs/configuration/collections).
JSON này là cấu hình collection/fields, không phải JSON Schema và không tự khởi động CMS.

1. Chọn phiên bản Payload tương thích Next.js/React đang dùng. Cài backend Payload,
   adapter database và storage cho media theo môi trường triển khai.
2. Dùng schema làm cấu hình collection `pages`; thêm access control trước khi đăng ký.
   Ví dụ dưới đây dành cho CMS nơi mọi tài khoản Users đều là biên tập viên được tin cậy:

   ```ts
   import type { CollectionConfig } from 'payload'
   import definition from './pages.collection.json'

   export const Pages: CollectionConfig = {
     ...definition,
     fields: definition.fields as CollectionConfig['fields'],
     access: {
       read: ({ req }) => req.user ? true : { _status: { equals: 'published' } },
       create: ({ req }) => Boolean(req.user),
       update: ({ req }) => Boolean(req.user),
       delete: ({ req }) => Boolean(req.user),
     },
   }
   ```

   Nếu Users có khách hàng hoặc tài khoản công khai, thay điều kiện này bằng kiểm tra role.
   Thêm validation anchor/URL phía CMS theo các ràng buộc trong `validate.mjs`.
3. Seed document từ `home.json`. Loại bỏ ID block cục bộ để Payload cấp ID theo adapter;
   giữ `anchor` để không mất các liên kết trong trang. Seed theo slug và không ghi đè nội dung
   biên tập đã tồn tại. Thực hiện thao tác này bằng script server được xác thực.
4. Generate types bằng Payload, thay contract thủ công trong `src/content/blocks.ts` bằng
   types được sinh. Chuẩn hóa các field optional/null tại ranh giới nguồn dữ liệu nếu cần.
5. Thay lookup trong `src/content/get-page.ts` bằng truy vấn `pages` theo slug và chỉ lấy
   `_status = published` ở trang công khai. Với Local API, dùng `overrideAccess: false`
   khi cần thực thi access control. Chuyển caller sang async nếu nguồn dữ liệu yêu cầu.
6. Tích hợp draft preview riêng có xác thực, rồi thêm publish hook để làm mới cache hoặc
   kích hoạt build. Không trả draft cho khách truy cập website công khai.
7. Chuyển tiếp các trang còn lại sang block, thêm Media, header/footer globals và SEO.

## Hosting

- Nếu tiếp tục GitHub Pages: chạy Payload ở backend riêng, lấy nội dung lúc build;
  publish trong CMS cần kích hoạt build/deploy lại. `/admin` không chạy trong static export.
- Nếu chạy Next.js trên server: có thể tích hợp Payload cùng app và thêm revalidation,
  preview. Chưa bật tự động vì dự án hiện vẫn hỗ trợ xuất tĩnh.

## Thêm loại block mới

Khai báo fields trong `pages.collection.json`, thêm type vào `blocks.ts`, thêm case trong
`RenderBlocks.tsx`, rồi thêm dữ liệu vào `layout`. Không lưu JSX, CSS hay mã JavaScript
trong nội dung CMS. Các lựa chọn giao diện nên là select có tập giá trị cố định.
