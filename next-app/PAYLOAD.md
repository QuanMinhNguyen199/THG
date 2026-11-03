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
| Tin tuyển dụng, một danh sách; mỗi tin có trang `/tuyen-dung/<slug>/` (route động `tuyen-dung/[slug]`) | `jobs.json` | `jobs` |
| Case study (thẻ hồ sơ 3D), dùng chung: GEOagents dùng `tdn`, Giải pháp AI và Use Case Quản lý dự án dùng `quan-ly-du-an` | `cases/<id>.json` | `case` |

`src/content/build.ts` và `buildContent()` trong `registry.ts` biến JSON (dạng Payload: mảng object,
`blockType`, field trống bị bỏ qua) thành dữ liệu component đang render. `published.ts` import mọi
file JSON. Các điểm nội dung chưa xác nhận ghi ở `src/content/NOTES.md`, vì JSON không có ghi chú.

Đây là bước chuẩn bị dữ liệu và giao diện, **chưa cài Payload, database, API hoặc /admin**.
Nội dung còn nằm trong code: mô phỏng trong `HomeDemo`, mô hình 3D và cách vẽ thẻ case study, sơ đồ
bốn tầng, danh sách đối tác và logo (`sections/partners.ts`), email và điện thoại
tuyển dụng (`sections/jobs.ts`), chữ hướng dẫn nhỏ trên giao diện.

## Chỉnh nội dung

Mở `/soan-noi-dung` (khi chạy `npm run dev`, hoặc trên bản đang deploy). Bên phải là chính
website; bên trái đổi theo trang đang xem, chia ba vùng: **Header** và **Footer** (dùng chung mọi
trang) quanh **Nội dung trang**. Form dựng từ schema trong `src/content/payload/`, báo lỗi theo
`validate.mjs`, và bản xem trước hiện ngay mọi bản nháp hợp lệ. Mở một section hay bấm vào một ô
thì xem trước cuộn tới phần đó. Section "Cách chúng tôi làm việc" sửa tại chỗ và đổi trên cả hai
trang dùng nó.

**Ảnh và video.** Field media (video và ảnh chờ của Hero trang chủ và GEOagents, ảnh ô điều hướng,
ảnh thẻ, ảnh banner trang) hiện ảnh/video xem trước kèm ba cách thay: kéo thả file vào field (hoặc
bấm vào vùng thả), "Chọn từ thư viện" (các file trong `public/media`, liệt kê ở `src/content/media.json`),
"Tải lên từ máy". "Bỏ" trả field về mặc định (Hero: phim và ảnh chờ mặc định). Chỉ nhận ảnh
JPG/PNG/WebP/AVIF/GIF và video MP4 (không nhận SVG); cảnh báo khi ảnh trên 1,5 MB hoặc video trên
25 MB, chặn file trên 100 MB. File tải lên nằm trong trình duyệt (IndexedDB) và hiện ngay trong xem trước.

Trang soạn không ghi gì vào website: bản nháp nằm trong trình duyệt của người thử. "Tải bản nháp"
xuất một file gồm mọi tài liệu đã sửa và các file đã tải lên mà chúng dùng; dev đưa vào repo bằng:

```sh
npm run content:apply -- đường/dẫn/noi-dung-ban-nhap.json
```

Lệnh ghi tài liệu vào `src/content`, file tải lên vào `public/media/uploads/` và cập nhật
`src/content/media.json`. Lệnh chỉ ghi khi mọi tài liệu trong file đều hợp lệ, mọi file tải lên đúng
loại và giới hạn, mọi đường dẫn media có thật, và site vẫn dựng được nội dung; xem lại bằng
`git diff` rồi build. Thêm hoặc xoá tay file trong `public/media` thì chạy `npm run content:media`.

Trang soạn không có link từ site và gắn `noindex`, nhưng ai có đường dẫn đều mở được.

> **Trước khi chạy trên domain chính thức:** `/soan-noi-dung` (route `src/app/(cms)`) sẽ công khai
> cho bất kỳ ai có đường dẫn. Trang không ghi được gì vào website, nhưng là một "trang quản trị" lộ
> trên domain công ty. Chặn nó ở server (đăng nhập hoặc chỉ mở cho mạng nội bộ), hoặc gỡ route khỏi
> bản deploy. Khi `/admin` của Payload chạy, gỡ hẳn route này cùng `src/components/cms/ContentEditor.tsx`
> và `fields.tsx`; giữ `EditorBridge`, `Editable`, `DraftView` cho Live Preview.

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
- Ảnh và video là đường dẫn `/media/...` hoặc URL HTTPS (field có `custom.media` trong schema),
  chưa phải quan hệ Media/upload của Payload. File phải có trong `public/` và đúng loại (video: MP4).
  Trên trang tổng, ảnh banner của trang con đầu tiên làm thẻ lớn; không có ảnh thì các trang hiện thành hàng.
- Đối tác (dải logo trang chủ, trang Đối tác) lấy từ `PARTNERS` trong `sections/partners.ts`.
  Thêm đối tác ở đó rồi chạy `npm run content:schema`.
- Thêm tin tuyển dụng: thêm một dòng vào `jobs.json` (hoặc "+ Thêm tin" ở block Danh sách vị trí
  trong trang soạn). `slug` là đường dẫn trang, viết thường không dấu, không trùng tin khác; trang có
  sau khi build. Thêm trang doanh nghiệp: thêm vào `SECTION_PAGES` trong `registry.ts`, tạo file JSON,
  import nó trong `published.ts` và tạo thư mục route tương ứng trong `src/app/(site)`.

Chạy trong thư mục `next-app`:

```sh
npm run check:content
npm run test:content
npm run build
```

`build` (và `build:pages`, bản xuất tĩnh cũ cho GitHub Pages) kiểm tra mọi tài liệu trước khi build: field thiếu hoặc sai kiểu, block
không được hỗ trợ, ID/anchor trùng, đường dẫn không hợp lệ, và việc site dựng được nội dung từ
chúng, đường dẫn media trỏ tới file không có trong `public/`. `npm run test:content` còn báo khi: schema
trong `payload/` chưa sinh lại sau khi sửa script, `media.json` không khớp `public/media`, field media nhận sai loại file,
có field thiếu nhãn tiếng Việt, tên đối tác không có logo (trừ tên được ghi rõ là chưa có logo),
hoặc một ô điều hướng trên trang chủ thiếu trang con của section mà ô đó dẫn tới.

## Nhãn trong /admin

Mỗi block và field có nhãn, mô tả tiếng Việt. Field kỹ thuật (`anchor`, nhãn đọc màn hình của
Metrics) nằm trong nhóm thu gọn "Nâng cao". Schema trong `src/content/payload/` được sinh từ
`scripts/build-collection.mjs`: sửa script rồi chạy `npm run content:schema`, không sửa tay file JSON.

## Kết nối Payload sau này

**Đặc tả cho dev: [`CONTENT-SPEC.md`](CONTENT-SPEC.md).** Mỗi collection, Global, block và field (kiểu Payload,
bắt buộc, ràng buộc, mô tả cho người nhập), và các section của từng trang theo thứ tự. Tài liệu sinh từ
schema (`npm run content:spec`) nên luôn khớp với site; dùng nó để đối chiếu với block đã có bên CMS.
File JSON trong `src/content` là **nội dung hiện tại** của site để nhập lại trong admin, không phải
cấu trúc cố định: thứ tự, số lượng section của mỗi trang do người biên tập quyết định trong admin.

Schema máy đọc ở `src/content/payload/`: `pages` (trang chủ), `corporate` (các trang doanh nghiệp)
và `jobs` (tin tuyển dụng: mỗi dòng một bản ghi, route `tuyen-dung/[slug]` giữ nguyên) là collection; `header`, `footer`, `ways` và `geoagents` là Global. Theo
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
3. Nhập nội dung trong admin theo mục 3 của `CONTENT-SPEC.md` (không chạy seed). Giữ các `anchor` đang
   có link trỏ tới.
4. Generate types bằng Payload, thay contract thủ công trong `src/content/blocks.ts` bằng
   types được sinh. Chuẩn hóa các field optional/null tại ranh giới nguồn dữ liệu nếu cần.
5. Thay các import JSON trong `src/content/published.ts` bằng truy vấn Payload rồi đưa vào
   `buildContent()`, chỉ lấy `_status = published` ở trang công khai. Với Local API, dùng
   `overrideAccess: false` khi cần thực thi access control. Chuyển caller sang async nếu nguồn dữ
   liệu yêu cầu.
6. Bật Live Preview (`admin.livePreview`) cho các collection và Global. Hàm `url` trả về đường dẫn
   trang của tài liệu (`path` trong `DOCS`; Global Header/Footer xem trên trang chủ). Nối dữ liệu
   Payload gửi qua `postMessage` vào `EditorBridge` (xem mục dưới). Thêm hook `afterChange` khi xuất
   bản để gọi `revalidatePath` cho trang của tài liệu (Header/Footer/`ways`: mọi trang dùng chúng),
   nên nội dung mới lên ngay, không cần build lại. Không trả draft cho khách truy cập website công khai.
7. Thêm collection Media (storage trên server hoặc S3); đổi các field có `custom.media` thành field `upload`
   trỏ tới Media, chuyển các file trong `public/media` vào đó. Case study (`case`) thành collection,
   block Case study dùng relationship tới nó. Chuyển logo và danh sách đối tác sang collection, thêm SEO.
   Trang soạn giả lập `/soan-noi-dung` khi đó được thay bằng `/admin` và Live Preview của Payload.

## Trang soạn giả lập so với Payload

`/soan-noi-dung` là bản mẫu trải nghiệm soạn nội dung. Bảng dưới đối chiếu từng tính năng với Payload
để ước lượng phần có sẵn và phần phải tự viết. Nguồn ở cuối mục; tra cứu ngày 03/11/2026.

| Tính năng ở trang soạn | Payload | Cách làm | Mức chắc chắn |
|---|---|---|---|
| Form từ schema: nhãn, mô tả, block, array, group, nhóm "Nâng cao" thu gọn | Có sẵn | Dùng thẳng các schema trong `src/content/payload/` (cấu trúc field của Payload) | Theo docs |
| Xem trước bên cạnh, cập nhật khi gõ, chọn kích thước máy tính/điện thoại | Có sẵn (Live Preview) | Admin mở frontend trong iframe, gửi dữ liệu qua `postMessage` mỗi lần đổi; breakpoint cấu hình được | Theo docs |
| Header, Footer dùng chung | Có sẵn (Global) | Global `header`, `footer` | Theo docs |
| Bản nháp, phiên bản, xuất bản | Có sẵn, tốt hơn bản giả lập | `versions.drafts`; thay cho lưu trình duyệt + `content:apply` | Theo docs |
| Một màn hình sửa cả Header, Nội dung trang, Footer | Không có sẵn | Payload sửa từng tài liệu; Header/Footer ở màn hình Global riêng. Muốn gộp phải viết custom admin view | Suy luận từ mô hình tài liệu |
| Bấm link trong khung xem trước thì form đổi sang trang đó | Không có sẵn | Live Preview gắn với tài liệu đang mở; docs không nói về điều hướng trong iframe. Cần component nhận `cms:page` từ frontend rồi mở tài liệu tương ứng | Docs không đề cập |
| Mở section / bấm vào ô thì xem trước cuộn tới và viền section | Không có sẵn | Custom field component gửi `postMessage` sang frontend, như `cms:part` trong `ContentEditor.tsx` | Suy luận, cần thử |
| Sửa section dùng chung ("Cách chúng tôi làm việc") ngay trong trang | Không có sẵn | Cách chuẩn: relationship tới Global `ways`, sửa ở màn hình Global. Sửa tại chỗ cần custom component | Suy luận |
| Báo lỗi tiếng Việt, chỉ đúng field | Một phần | Hàm `validate` của từng field trả câu tiếng Việt (chuyển các câu trong `fields.tsx`). Giao diện admin có bản tiếng Việt hay không: chưa kiểm tra | Cần xác nhận |
| Thay ảnh, video: kéo thả, chọn từ thư viện, tải lên | Có sẵn (Upload field + collection Media) | Field `upload` trỏ tới Media có ô tải file và chọn file đã có; cần storage. Hiển thị giống hệt (kéo thả, cảnh báo dung lượng) thì kiểm tra trong bản thử | Theo docs; chi tiết giao diện cần kiểm |
| Bấm thẳng lên trang để sửa (click-to-edit) | Chưa dùng được | Visual Editor của Payload đang "Coming Soon", thuộc gói Enterprise. Có plugin cộng đồng (payload-better-editor, payload-visual-editor), chưa đánh giá | Theo trang Enterprise |

**Phần frontend tận dụng được.** Trang soạn đã hiển thị bản nháp hoàn toàn phía trình duyệt:
`EditorBridge` nhận dữ liệu qua `postMessage`, `buildContent()` dựng nội dung, `Editable`/`DraftView` và
`useContent()` render bằng component thật. Live Preview của Payload cũng gửi dữ liệu theo cách đó,
nên nhiều khả năng chỉ cần đổi định dạng message trong `EditorBridge` (giả thuyết, cần kiểm bằng bản
thử). `EditorBridge` chỉ nhận message cùng origin; Payload chạy cùng app dưới cùng domain (mục
Hosting) nên điều kiện này giữ nguyên. Nếu sau này tách admin sang domain khác, chỉ thêm đúng origin
của admin vào danh sách cho phép, không mở cho mọi origin.

**Đề xuất triển khai.**

1. Dựng server và database trên domain theo mục Hosting, cài Payload cùng app Next.js.
2. Làm bản thử: Payload + collection `corporate` + Global `footer`, bật Live Preview trỏ vào site.
   Kiểm chứng: Live Preview hiển thị đúng site qua `EditorBridge`; công sức viết component cuộn tới
   section; người viết content có chấp nhận sửa Header/Footer ở màn hình riêng không.
3. Chỉ làm ba phần tự viết (một màn hình ba vùng, đi theo trang đang xem, cuộn tới section) khi
   bản thử cho thấy người viết cần. Viết hết sẽ biến admin thành CMS riêng, mất lợi thế của Payload.

**Câu hỏi còn mở.** Admin Payload có tiếng Việt chưa; plugin click-to-edit cộng đồng có ổn định và
tương thích phiên bản không; thời điểm phát hành và giá của Visual Editor.

Nguồn:
[Live Preview](https://payloadcms.com/docs/live-preview/overview) ·
[Visual Editor (Enterprise)](https://payloadcms.com/enterprise/visual-editor) ·
[Blocks field](https://payloadcms.com/docs/fields/blocks) ·
[payload-better-editor](https://www.pkgstats.com/pkg:payload-better-editor) ·
[payload-visual-editor](https://awesome.ecosyste.ms/projects/github.com%2Fpemedia%2Fpayload-visual-editor) ·
[DXP Scorecard: Payload](https://dxp-scorecard.pages.dev/platform/payload-cms)

## Hosting

**Đã chốt:** đội dev deploy site qua domain riêng, không dùng GitHub Pages. Giả định (cần dev xác
nhận): site chạy Next.js trên server (`npm run build` rồi `npm run start`, hoặc nền tảng tương đương),
Payload cài cùng app, cùng domain, với một database và nơi lưu media.

Hệ quả:

- **Xuất bản:** hook `afterChange` gọi `revalidatePath`, nội dung mới lên gần như ngay; không phải
  build lại như bản xuất tĩnh.
- **Live Preview:** admin `/admin` và site cùng origin. Bản nháp hiển thị qua `EditorBridge` như
  trang soạn hiện tại; có thể dùng thêm render phía server với Draft Mode nếu cần.
- **Cấu hình build:** `npm run build` (không đặt `output: "export"`) đã là bản chạy server: bật
  `cacheComponents`, không có `basePath`. Nhánh `forPages` trong `next.config.ts` và lệnh
  `build:pages` chỉ phục vụ GitHub Pages.
- **Môi trường:** biến môi trường cho database, secret của Payload và storage media đặt trên server,
  không đưa vào repo.

Việc cần làm khi domain chạy ổn (chưa làm, chờ dev xác nhận):

- Tắt workflow `.github/workflows/pages.yml`: hiện mỗi lần push lên `main` vẫn deploy lên GitHub
  Pages (`https://quanminhnguyen199.github.io/THG/`), song song với domain.
- Gỡ nhánh `forPages` trong `next.config.ts`, lệnh `build:pages` và phần GitHub Pages trong README.
- Chặn hoặc gỡ `/soan-noi-dung` trên domain (xem mục Chỉnh nội dung).

## Thêm loại block mới

Khai báo fields (kèm `label`, `admin.description`) trong `scripts/build-collection.mjs` và chạy
`npm run content:schema`. Block trang chủ: thêm type vào `blocks.ts` và case trong `RenderBlocks.tsx`.
Block trang doanh nghiệp: thêm vào `Block` (`sections/shared.ts`), `blockFromRaw` (`build.ts`) và
`BlockView` (`CorporatePages.tsx`). Rồi thêm dữ liệu vào trang. Không lưu JSX, CSS hay mã JavaScript
trong nội dung CMS. Các lựa chọn giao diện nên là select có tập giá trị cố định.
