# Nội dung và chuẩn bị cho Payload CMS

## Trạng thái

Mọi trang của site đọc nội dung từ JSON trong `src/content`, theo danh sách tài liệu ở
`src/content/registry.ts`:

| Tài liệu | File | Schema |
|---|---|---|
| Header (menu), Footer (khẩu hiệu, liên hệ) | `globals/header.json`, `globals/footer.json` | `header`, `footer` |
| "Cách chúng tôi làm việc", dùng chung cho Sứ mệnh và Tuyển dụng | `globals/ways-of-working.json` | `ways` |
| Trang chủ | `pages/home.json` | `pages` |
| GEOagents | `pages/geoagents.json` | `geoagents` |
| Trang tổng và trang con của Giải pháp, Use Case, Về THEHEGEO; trang tổng Tuyển dụng | `pages/<section>.json`, `pages/<section>/<trang>.json`, `pages/tuyen-dung.json` | `corporate` |
| Tin tuyển dụng | `jobs/<vị-trí>.json` | `job` |

`src/content/build.ts` và `buildContent()` trong `registry.ts` biến JSON (dạng Payload: mảng object,
`blockType`, field trống bị bỏ qua) thành dữ liệu component đang render. `published.ts` import mọi
file JSON. Các điểm nội dung chưa xác nhận ghi ở `src/content/NOTES.md`, vì JSON không có ghi chú.

Đây là bước chuẩn bị dữ liệu và giao diện, **chưa cài Payload, database, API hoặc /admin**.
Nội dung còn nằm trong code: hồ sơ case study (`cases.ts`), mô phỏng trong `HomeDemo`, video, mô
hình 3D, sơ đồ bốn tầng, danh sách đối tác và logo (`sections/partners.ts`), email và điện thoại
tuyển dụng (`sections/jobs.ts`), chữ hướng dẫn nhỏ trên giao diện.

## Chỉnh nội dung

Mở `/soan-noi-dung` (khi dev, hoặc trên GitHub Pages: `/THG/soan-noi-dung/`). Bên phải là chính
website; bên trái đổi theo trang đang xem, chia ba vùng: **Header** và **Footer** (dùng chung mọi
trang) quanh **Nội dung trang**. Form dựng từ schema trong `src/content/payload/`, báo lỗi theo
`validate.mjs`, và bản xem trước hiện ngay mọi bản nháp hợp lệ. Mở một section hay bấm vào một ô
thì xem trước cuộn tới phần đó. Section "Cách chúng tôi làm việc" sửa tại chỗ và đổi trên cả hai
trang dùng nó.

Trang soạn không ghi gì vào website: bản nháp nằm trong trình duyệt của người thử. "Tải bản nháp"
xuất một file gồm mọi tài liệu đã sửa; dev đưa vào repo bằng:

```sh
npm run content:apply -- đường/dẫn/noi-dung-ban-nhap.json
```

Lệnh chỉ ghi khi mọi tài liệu trong file đều hợp lệ và site vẫn dựng được nội dung; xem lại bằng
`git diff` rồi build. Trang soạn không có link từ site và gắn `noindex`, nhưng ai có đường dẫn đều mở được.

Khi sửa tay file JSON:

- Thứ tự phần tử trong `layout` / `blocks` là thứ tự section trên trang.
- `enabled: false` ẩn section; bỏ thuộc tính hoặc đặt `true` để hiện.
- Section mới hoặc nhân bản cần `id` mới (duy nhất trong trang). Trang chủ: đổi hoặc bỏ `anchor`.
- Giữ một Hero duy nhất trên trang chủ để trang có một tiêu đề H1. Giữ anchor đang có link trỏ tới.
- Array văn bản dùng object như `[{ "text": "Dòng 1" }]`, phù hợp với field array của Payload.
- Tiêu đề hai phần là `title` (phần thường) + `highlight` (phần nhấn). Kicker gõ chữ thường,
  CSS tự viết in hoa.
- Số liệu: `value` là con số; `prefix` gõ `Level` (khoảng cách tự thêm khi kết thúc bằng chữ cái);
  `suffix` cùng cỡ chữ với số, `unit` nhỏ hơn; `minDigits: 2` hiển thị 4 thành 04.
- Ảnh là đường dẫn `/media/...` hoặc URL HTTPS, chưa phải quan hệ Media/upload. Trên trang tổng,
  ảnh banner của trang con đầu tiên làm thẻ lớn; không có ảnh thì các trang hiện thành hàng.
- Đối tác (dải logo trang chủ, trang Đối tác) lấy từ `PARTNERS` trong `sections/partners.ts`.
  Thêm đối tác ở đó rồi chạy `npm run content:schema`.
- Thêm trang hay tin tuyển dụng mới: thêm vào `SECTION_PAGES` / `JOB_SLUGS` trong `registry.ts`,
  tạo file JSON, import nó trong `published.ts` và tạo thư mục route tương ứng trong `src/app/(site)`.

Chạy trong thư mục `next-app`:

```sh
npm run check:content
npm run test:content
npm run build:pages
```

Cả `build` và `build:pages` kiểm tra mọi tài liệu trước khi build: field thiếu hoặc sai kiểu, block
không được hỗ trợ, ID/anchor trùng, đường dẫn không hợp lệ, và việc site dựng được nội dung từ
chúng. `npm run test:content` còn báo khi: schema trong `payload/` chưa sinh lại sau khi sửa script,
có field thiếu nhãn tiếng Việt, tên đối tác không có logo (trừ tên được ghi rõ là chưa có logo),
hoặc một ô điều hướng trên trang chủ thiếu trang con của section mà ô đó dẫn tới.

## Nhãn trong /admin

Mỗi block và field có nhãn, mô tả tiếng Việt. Field kỹ thuật (`anchor`, nhãn đọc màn hình của
Metrics) nằm trong nhóm thu gọn "Nâng cao". Schema trong `src/content/payload/` được sinh từ
`scripts/build-collection.mjs`: sửa script rồi chạy `npm run content:schema`, không sửa tay file JSON.

## Kết nối Payload sau này

Schema đã chuẩn bị tại `src/content/payload/`: `pages` (trang chủ), `corporate` (các trang doanh nghiệp)
và `job` (tin tuyển dụng) là collection; `header`, `footer`, `ways` và `geoagents` là Global. Theo
[Blocks field](https://payloadcms.com/docs/fields/blocks) và
[Collection config](https://payloadcms.com/docs/configuration/collections).
JSON này là cấu hình collection/fields, không phải JSON Schema và không tự khởi động CMS.

1. Chọn phiên bản Payload tương thích Next.js/React đang dùng. Cài backend Payload,
   adapter database và storage cho media theo môi trường triển khai.
2. Dùng các schema làm cấu hình collection và Global; thêm access control trước khi đăng ký.
   Ví dụ dưới đây dành cho CMS nơi mọi tài khoản Users đều là biên tập viên được tin cậy:

   ```ts
   import type { CollectionConfig } from 'payload'
   import definition from './payload/pages.json'

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
3. Seed từ các file JSON theo `DOCS` trong `registry.ts`. Loại bỏ ID block cục bộ để Payload cấp ID theo adapter;
   giữ `anchor` để không mất các liên kết trong trang. Seed theo slug và không ghi đè nội dung
   biên tập đã tồn tại. Thực hiện thao tác này bằng script server được xác thực.
4. Generate types bằng Payload, thay contract thủ công trong `src/content/blocks.ts` bằng
   types được sinh. Chuẩn hóa các field optional/null tại ranh giới nguồn dữ liệu nếu cần.
5. Thay các import JSON trong `src/content/published.ts` bằng truy vấn Payload rồi đưa vào
   `buildContent()`, chỉ lấy
   `_status = published` ở trang công khai. Với Local API, dùng `overrideAccess: false`
   khi cần thực thi access control. Chuyển caller sang async nếu nguồn dữ liệu yêu cầu.
6. Tích hợp draft preview riêng có xác thực, rồi thêm publish hook để làm mới cache hoặc
   kích hoạt build. Không trả draft cho khách truy cập website công khai.
7. Thêm Media (ảnh, logo đối tác), chuyển case study và danh sách đối tác sang collection, thêm SEO.
   Trang soạn giả lập `/soan-noi-dung` khi đó được thay bằng `/admin` và Live Preview của Payload.

## Hosting

- Nếu tiếp tục GitHub Pages: chạy Payload ở backend riêng, lấy nội dung lúc build;
  publish trong CMS cần kích hoạt build/deploy lại. `/admin` không chạy trong static export.
- Nếu chạy Next.js trên server: có thể tích hợp Payload cùng app và thêm revalidation,
  preview. Chưa bật tự động vì dự án hiện vẫn hỗ trợ xuất tĩnh.

## Thêm loại block mới

Khai báo fields (kèm `label`, `admin.description`) trong `scripts/build-collection.mjs` và chạy
`npm run content:schema`. Block trang chủ: thêm type vào `blocks.ts` và case trong `RenderBlocks.tsx`.
Block trang doanh nghiệp: thêm vào `Block` (`sections/shared.ts`), `blockFromRaw` (`build.ts`) và
`BlockView` (`CorporatePages.tsx`). Rồi thêm dữ liệu vào trang. Không lưu JSX, CSS hay mã JavaScript
trong nội dung CMS. Các lựa chọn giao diện nên là select có tập giá trị cố định.
