# Đặc tả nội dung: block và field

> Tài liệu sinh tự động từ `scripts/build-collection.mjs` (`npm run content:spec`); đừng sửa tay.
> Đây là đặc tả để đối chiếu với block đã có bên CMS và nhập nội dung trong admin. Không cần seed:
> file JSON trong `src/content` chỉ là nội dung hiện tại của site, liệt kê lại ở mục 3 để nhập tay.

## 1. Tổng quan

| Tên | Dạng | Dùng cho | Block |
|---|---|---|---|
| `pages` | Collection | Trang chủ | 7 loại section |
| `corporate` | Collection | Trang tổng và trang con của Giải pháp, Use Case, Về THEHEGEO; trang tổng Tuyển dụng | 5 hình minh hoạ + 18 loại section |
| `jobs` | Collection | Tin tuyển dụng (mỗi dòng của `jobs` là một bản ghi; trang `/tuyen-dung/<slug>/`) | — |
| `case` | Collection | Case study (thẻ hồ sơ 3D), dùng chung giữa các trang | — |
| `geoagents` | Global | Trang GEOagents (các phần cố định của trang) | — |
| `header` | Global | Menu | — |
| `footer` | Global | Khẩu hiệu, liên hệ cuối trang | — |
| `ways` | Global | "Cách chúng tôi làm việc", dùng chung cho Sứ mệnh và Tuyển dụng | — |

Quy ước chung:

- Mỗi section có `enabled` (ẩn tạm mà không mất nội dung). Thứ tự section trong field `blocks`/`layout` là thứ tự trên trang.
- Field kiểu `upload` hiện là đường dẫn trong `public/media`; bên CMS làm thành upload tới collection Media.
- "Tài liệu dùng chung" (`ways`, `case:<id>`, `jobs`) là relationship: sửa một chỗ, mọi trang dùng nó cùng đổi.
- Hai field văn bản kiểu `title` + `highlight`: dòng thường và dòng màu nhấn của một tiêu đề.

## 2. Block và field

### pages

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `title` | Tên trang | text | có |  | Tên để nhận biết trang trong danh sách quản trị. |
| `slug` | Đường dẫn trang | text | có | không trùng | Ví dụ: home. Không đổi sau khi trang đã xuất bản. |

**Các section của trang** (`layout`): Thứ tự từ trên xuống ở đây là thứ tự trên trang. Kéo để đổi chỗ.

#### `homeHero`: Hero trang chủ

Phần đầu trang có video. Mỗi trang chỉ nên có một Hero vì đây là tiêu đề chính (H1). Video và hiệu ứng nằm trong code.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `heading` | Tiêu đề chính (H1) | text | có |  | Câu mô tả cả trang, dùng cho người đọc màn hình và công cụ tìm kiếm. |
| `video` | Video (máy tính) | upload → Media (video MP4) |  |  | Tuỳ chọn. File MP4, nên dưới 25 MB. Để trống thì dùng phim mặc định. |
| `videoSmall` | Video nhẹ cho điện thoại | upload → Media (video MP4) |  |  | Tuỳ chọn. Bản MP4 nhẹ hơn của cùng video (720p). Để trống thì điện thoại dùng video máy tính. |
| `poster` | Ảnh chờ (poster) | upload → Media (ảnh JPG/PNG/WebP/AVIF/GIF) |  |  | Tuỳ chọn. Ảnh hiện trước khi video chạy. Để trống thì dùng ảnh mặc định. |
| `anchor` | Mã neo liên kết | text |  |  | Dùng cho link nhảy tới section (ví dụ #cta). Chỉ chữ không dấu, số, - và _, bắt đầu bằng chữ. Đổi mã này có thể làm hỏng link đang trỏ tới. (trong nhóm thu gọn "Nâng cao (thường không cần sửa)") |

#### `metrics`: Dải số liệu

Hàng số chạy từ 0 lên giá trị khi cuộn tới.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `items` | Các số liệu | array (1–n dòng) | có |  |  |
| `items[].value` | Giá trị số | number | có |  | Con số cuối cùng hiển thị, ví dụ 100. |
| `items[].label` | Mô tả dưới số | text | có |  | Ví dụ: Chủ quyền dữ liệu. |
| `items[].prefix` | Chữ trước số | text |  |  | Tuỳ chọn, ví dụ "Level". Khoảng cách với số được thêm tự động. |
| `items[].suffix` | Ký hiệu sau số (cùng cỡ) | text |  |  | Tuỳ chọn, ví dụ "+" để thành 3+. |
| `items[].unit` | Đơn vị sau số (chữ nhỏ) | text |  |  | Tuỳ chọn, ví dụ "%". Hiển thị nhỏ hơn con số. |
| `items[].minDigits` | Số chữ số tối thiểu | number |  | ≥ 1; ≤ 12 | Tuỳ chọn. Nhập 2 thì số 4 hiển thị thành 04. Để trống nếu không cần. |
| `anchor` | Mã neo liên kết | text |  |  | Dùng cho link nhảy tới section (ví dụ #cta). Chỉ chữ không dấu, số, - và _, bắt đầu bằng chữ. Đổi mã này có thể làm hỏng link đang trỏ tới. (trong nhóm thu gọn "Nâng cao (thường không cần sửa)") |
| `label` | Tên section cho trình đọc màn hình | text | có |  | Không hiển thị trên trang, chỉ đọc cho người khiếm thị. (trong nhóm thu gọn "Nâng cao (thường không cần sửa)") |

#### `partners`: Dải logo đối tác

Logo chạy ngang liên tục. Chỉ chọn được đối tác đã có trong danh sách; muốn thêm đối tác mới cần nhờ dev thêm logo.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề | text | có |  | Dòng chữ phía trên dải logo. |
| `items` | Đối tác | array (1–n dòng) | có |  |  |
| `items[].name` | Tên đối tác | select: `Bộ Xây dựng`, `Thuế TP Hà Nội`, `TP Hà Nội`, `PTSC M&C`, `PV GAS South`, `Taisei`, `Sumitomo`, `GS E&C`, `Chodai`, `Nippon Koei`, `Hongkong Telecom`, `ACTi`, `TMS`, `VNPT`, `Viettel`, `CMC Telecom`, `NVIDIA`, `Dell`, `HPE`, `Intel` | có |  | Đối tác chưa có logo sẽ hiển thị bằng tên. |
| `linkLabel` | Chữ trên link | text | có |  | Ví dụ: Xem đối tác và khách hàng. |
| `href` | Link tới trang | text | có | đường dẫn bắt đầu bằng /, # hoặc https:// | Trang trong website bắt đầu bằng /, ví dụ /geoagents/. Link ngoài bắt đầu bằng https://. |
| `anchor` | Mã neo liên kết | text |  |  | Dùng cho link nhảy tới section (ví dụ #cta). Chỉ chữ không dấu, số, - và _, bắt đầu bằng chữ. Đổi mã này có thể làm hỏng link đang trỏ tới. (trong nhóm thu gọn "Nâng cao (thường không cần sửa)") |

#### `coreShowcase`: Giới thiệu GEOagents 4 tầng (trang chủ)

Chữ bên trái, sơ đồ 4 tầng bên phải. Sơ đồ nằm trong code; tên sản phẩm ở đây phải khớp với sơ đồ.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `kicker` | Nhãn nhỏ trên tiêu đề | text | có |  | Gõ chữ thường như bình thường, website tự viết in hoa. |
| `title` | Tiêu đề | text | có |  | Dòng 1 của tiêu đề, màu chữ thường. |
| `highlight` | Dòng 2 (màu nhấn) | text | có |  | Dòng 2 của tiêu đề, hiển thị bằng màu nhấn. |
| `items` | Các tầng | array (1–n dòng) | có |  |  |
| `items[].product` | Tên sản phẩm | text | có |  | Ví dụ: GEO Governance. Hiển thị in hoa bên trái. |
| `items[].label` | Tên tầng | text | có |  | Ví dụ: Quản trị. Hiển thị bên phải. |
| `linkLabel` | Chữ trên link | text | có |  |  |
| `href` | Link tới trang | text | có | đường dẫn bắt đầu bằng /, # hoặc https:// | Trang trong website bắt đầu bằng /, ví dụ /geoagents/. Link ngoài bắt đầu bằng https://. |
| `anchor` | Mã neo liên kết | text |  |  | Dùng cho link nhảy tới section (ví dụ #cta). Chỉ chữ không dấu, số, - và _, bắt đầu bằng chữ. Đổi mã này có thể làm hỏng link đang trỏ tới. (trong nhóm thu gọn "Nâng cao (thường không cần sửa)") |

#### `agentDemo`: Demo Agent xử lý công văn (trang chủ)

Mô phỏng bên trái, chữ bên phải. Nội dung bên trong mô phỏng nằm trong code, ở đây chỉ sửa phần chữ.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `kicker` | Nhãn nhỏ trên tiêu đề | text | có |  | Gõ chữ thường như bình thường, website tự viết in hoa. |
| `title` | Tiêu đề | text | có |  | Dòng 1 của tiêu đề, màu chữ thường. |
| `highlight` | Dòng 2 (màu nhấn) | text | có |  | Dòng 2 của tiêu đề, hiển thị bằng màu nhấn. |
| `body` | Đoạn mô tả | textarea | có |  | Một đến hai câu dưới tiêu đề. |
| `anchor` | Mã neo liên kết | text |  |  | Dùng cho link nhảy tới section (ví dụ #cta). Chỉ chữ không dấu, số, - và _, bắt đầu bằng chữ. Đổi mã này có thể làm hỏng link đang trỏ tới. (trong nhóm thu gọn "Nâng cao (thường không cần sửa)") |

#### `navigationTiles`: Lưới ô điều hướng

Các ô dẫn tới trang con, mỗi ô có danh sách gạch đầu dòng.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề | text | có |  | Phần đầu tiêu đề, màu chữ thường. |
| `highlight` | Phần nhấn (cùng dòng) | text | có |  | Nối tiếp ngay sau tiêu đề trên cùng dòng, hiển thị bằng màu nhấn. |
| `tiles` | Các ô | array (1–n dòng) | có |  |  |
| `tiles[].title` | Tên ô | text | có |  | Ví dụ: Giải pháp. |
| `tiles[].href` | Link khi bấm vào ô | text | có | đường dẫn bắt đầu bằng /, # hoặc https:// | Trang trong website bắt đầu bằng /, ví dụ /geoagents/. Link ngoài bắt đầu bằng https://. |
| `tiles[].size` | Kích thước | select: `normal` (Thường (1 cột)), `wide` (Rộng (2 cột)) | có | mặc định "normal" |  |
| `tiles[].image` | Ảnh nền | upload → Media (ảnh JPG/PNG/WebP/AVIF/GIF) |  |  | Tuỳ chọn. Ảnh phủ kín ô, chữ trắng nằm trên. |
| `tiles[].lines` | Gạch đầu dòng | array (1–n dòng) | có |  |  |
| `tiles[].lines[].text` | Nội dung dòng | text | có |  |  |
| `anchor` | Mã neo liên kết | text |  |  | Dùng cho link nhảy tới section (ví dụ #cta). Chỉ chữ không dấu, số, - và _, bắt đầu bằng chữ. Đổi mã này có thể làm hỏng link đang trỏ tới. (trong nhóm thu gọn "Nâng cao (thường không cần sửa)") |

#### `cta`: Kêu gọi liên hệ (CTA)

Section cuối trang mời khách gửi yêu cầu.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề | text | có |  | Dòng 1 của tiêu đề lớn. |
| `highlight` | Dòng 2 | text | có |  | Dòng 2 của tiêu đề lớn, cùng màu với dòng 1. |
| `question` | Câu hỏi | text | có |  | Dòng in đậm dưới tiêu đề. |
| `body` | Đoạn mô tả | textarea | có |  |  |
| `action` | Chữ trên nút | text | có |  | Nên bắt đầu bằng động từ, ví dụ: Gửi yêu cầu tư vấn. |
| `href` | Link của nút | text | có | đường dẫn bắt đầu bằng /, # hoặc https:// | Trang trong website bắt đầu bằng /, ví dụ /geoagents/. Link ngoài bắt đầu bằng https://. |
| `anchor` | Mã neo liên kết | text |  |  | Dùng cho link nhảy tới section (ví dụ #cta). Chỉ chữ không dấu, số, - và _, bắt đầu bằng chữ. Đổi mã này có thể làm hỏng link đang trỏ tới. (trong nhóm thu gọn "Nâng cao (thường không cần sửa)") |

### corporate

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `name` | Tên trang | text | có |  | Tên ngắn trên menu, thẻ và mục "Xem thêm". |
| `kind` | Dòng mô tả ngắn | text |  |  | Tuỳ chọn. Hiện dưới tên trang trong menu và mục "Xem thêm". |
| `title` | Tiêu đề lớn (H1) | textarea | có |  | Câu tiêu đề ở đầu trang. |
| `en` | Dòng tiếng Anh | text |  |  | Tuỳ chọn, dưới tiêu đề lớn. |
| `lead` | Đoạn mở đầu | textarea |  |  | Tuỳ chọn, dưới tiêu đề. Cũng là mô tả trang cho công cụ tìm kiếm. |
| `image` | Ảnh banner | upload → Media (ảnh JPG/PNG/WebP/AVIF/GIF) |  |  | Tuỳ chọn. Ảnh rộng dưới tiêu đề trang. Trên trang tổng, ảnh của trang con đầu tiên làm thẻ lớn. |
| `cta` | Nút cuối trang | array |  |  | Nút đầu là nút chính, các nút sau là nút phụ. |
| `cta[].label` | Chữ trên nút | text | có |  |  |
| `cta[].href` | Link | text |  | đường dẫn bắt đầu bằng /, # hoặc https:// | Để trống thì dẫn tới trang Liên hệ. |

**Hình minh hoạ cạnh tiêu đề** (`model`): Tuỳ chọn, tối đa một hình.

#### `core`: Lõi GEO Agent

Hình lõi chuyển động, không có chữ để sửa.

_Không có field: block chỉ đặt vị trí, nội dung lấy từ nơi khác._

#### `bridge`: Cây cầu bốn lớp

Bốn nhãn theo thứ tự trên cây cầu.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `labels` | Các nhãn | array (4–4 dòng) | có |  |  |
| `labels[].text` | Nội dung | text | có |  |  |

#### `devices`: Chuỗi thiết bị

Các thiết bị theo thứ tự.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `items` | Các thiết bị | array (1–n dòng) | có |  |  |
| `items[].text` | Nội dung | text | có |  |  |

#### `phone`: Cuộc gọi

Một cuộc gọi mẫu giữa người gọi và Agent.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `title` | Tiêu đề | text | có |  |  |
| `caller` | Người gọi | text | có |  |  |
| `script` | Lời thoại | array (1–n dòng) | có |  |  |
| `script[].who` | Ai nói | select: `in` (Người gọi), `agent` (Agent) | có |  |  |
| `script[].text` | Nội dung | textarea | có |  |  |

#### `stack`: Các tầng xếp chồng

Các tầng từ trên xuống, mỗi tầng có thể có nhãn nhỏ.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `layers` | Các tầng | array (1–n dòng) | có |  |  |
| `layers[].label` | Tên tầng | text | có |  |  |
| `layers[].chips` | Nhãn nhỏ | array |  |  |  |
| `layers[].chips[].text` | Nội dung | text | có |  |  |

**Các section của trang** (`blocks`): Thứ tự từ trên xuống ở đây là thứ tự trên trang.

#### `cards`: Thẻ

Lưới thẻ. Từ ba thẻ trở lên mà thẻ nào cũng có link thì hiện thành hàng; khi thẻ đầu có ảnh thì thành một thẻ lớn có ảnh.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề section | text |  |  | Tuỳ chọn. Một section không có tiêu đề và chỉ có một đoạn văn hiện thành câu chốt chữ lớn. |
| `items` | Các thẻ | array (1–n dòng) | có |  |  |
| `items[].title` | Tên thẻ | text | có |  |  |
| `items[].body` | Mô tả | textarea |  |  |  |
| `items[].href` | Link | text |  | đường dẫn bắt đầu bằng /, # hoặc https:// | Tuỳ chọn. Trang trong website bắt đầu bằng /, link ngoài bằng https://. |
| `items[].cta` | Chữ trên link | text |  |  | Ví dụ: Xem giải pháp. |
| `items[].image` | Ảnh | upload → Media (ảnh JPG/PNG/WebP/AVIF/GIF) |  |  | Tuỳ chọn, chỉ dùng cho thẻ đầu: có ảnh thì danh sách hiện thành một thẻ lớn có ảnh. |

#### `table`: Bảng (hiện thành thẻ)

Mỗi hàng thành một thẻ: ô đầu là tên thẻ, các ô sau có tên cột làm nhãn. Ô có link biến cả thẻ thành link.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề section | text |  |  | Tuỳ chọn. Một section không có tiêu đề và chỉ có một đoạn văn hiện thành câu chốt chữ lớn. |
| `by` | Cách chia thẻ | select: `row` (Mỗi hàng một thẻ), `column` (Mỗi cột một thẻ) |  |  | Để trống là mỗi hàng một thẻ. |
| `head` | Tên các cột | array (1–n dòng) | có |  | Theo thứ tự từ trái sang. Khi chia mỗi cột một thẻ, để trống tên cột đầu thì cột đầu thành nhãn cho từng giá trị. |
| `head[].text` | Tên cột | text |  |  |  |
| `rows` | Các hàng | array (1–n dòng) | có |  |  |
| `rows[].cells` | Các ô | array (1–n dòng) | có |  | Cùng thứ tự với tên các cột. |
| `rows[].cells[].text` | Nội dung | text | có |  |  |
| `rows[].cells[].href` | Link | text |  | đường dẫn bắt đầu bằng /, # hoặc https:// | Tuỳ chọn: ô có link biến cả thẻ thành link. |

#### `steps`: Các bước

Các bước theo thứ tự.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề section | text |  |  | Tuỳ chọn. Một section không có tiêu đề và chỉ có một đoạn văn hiện thành câu chốt chữ lớn. |
| `flow` | Hiện dạng luồng có mũi tên | checkbox |  |  |  |
| `items` | Các bước | array (1–n dòng) | có |  |  |
| `items[].title` | Tên bước | text | có |  |  |
| `items[].body` | Mô tả | textarea |  |  |  |
| `note` | Ghi chú dưới các bước | textarea |  |  |  |

#### `list`: Danh sách

Danh sách các dòng, mỗi dòng có thể có tiêu đề và link.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề section | text |  |  | Tuỳ chọn. Một section không có tiêu đề và chỉ có một đoạn văn hiện thành câu chốt chữ lớn. |
| `items` | Các dòng | array (1–n dòng) | có |  |  |
| `items[].title` | Tiêu đề dòng | text |  |  |  |
| `items[].body` | Nội dung | textarea | có |  |  |
| `items[].href` | Link | text |  | đường dẫn bắt đầu bằng /, # hoặc https:// | Tuỳ chọn. Trang trong website bắt đầu bằng /, link ngoài bằng https://. |

#### `text`: Đoạn văn

Một hoặc nhiều đoạn văn, có thể kèm link.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề section | text |  |  | Tuỳ chọn. Một section không có tiêu đề và chỉ có một đoạn văn hiện thành câu chốt chữ lớn. |
| `body` | Các đoạn | array (1–n dòng) | có |  |  |
| `body[].text` | Nội dung | textarea | có |  |  |
| `linkLabel` | Chữ trên link | text |  |  |  |
| `linkHref` | Link | text |  | đường dẫn bắt đầu bằng /, # hoặc https:// | Trang trong website bắt đầu bằng /, link ngoài bằng https://. |

#### `pills`: Nhãn

Hàng nhãn ngắn dạng viên thuốc.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề section | text |  |  | Tuỳ chọn. Một section không có tiêu đề và chỉ có một đoạn văn hiện thành câu chốt chữ lớn. |
| `items` | Các nhãn | array (1–n dòng) | có |  |  |
| `items[].text` | Nội dung | text | có |  |  |

#### `timeline`: Dòng thời gian

Các mốc theo năm; mốc cuối hiện màu đỏ.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề section | text |  |  | Tuỳ chọn. Một section không có tiêu đề và chỉ có một đoạn văn hiện thành câu chốt chữ lớn. |
| `items` | Các mốc | array (1–n dòng) | có |  |  |
| `items[].year` | Năm | text | có |  |  |
| `items[].label` | Nội dung | text | có |  |  |

#### `layers`: Các tầng

Sơ đồ các tầng xếp chồng, tầng đầu ở trên.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề section | text |  |  | Tuỳ chọn. Một section không có tiêu đề và chỉ có một đoạn văn hiện thành câu chốt chữ lớn. |
| `items` | Các tầng | array (1–n dòng) | có |  |  |
| `items[].text` | Nội dung | text | có |  |  |

#### `partners`: Đối tác

Logo đối tác theo nhóm, lấy từ danh sách đối tác chung. Thêm đối tác hoặc logo cần nhờ dev.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề section | text |  |  | Tuỳ chọn. Một section không có tiêu đề và chỉ có một đoạn văn hiện thành câu chốt chữ lớn. |

#### `callout`: Câu nổi bật

Một câu chữ lớn trong khung viền đỏ, có thể kèm đoạn giải thích.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề section | text |  |  | Tuỳ chọn. Một section không có tiêu đề và chỉ có một đoạn văn hiện thành câu chốt chữ lớn. |
| `body` | Câu nổi bật | textarea | có |  |  |
| `detail` | Đoạn giải thích | textarea |  |  | Tuỳ chọn, chữ thường dưới câu nổi bật. |
| `en` | Dòng tiếng Anh | text |  |  | Tuỳ chọn. |

#### `rings`: Vòng tròn đồng tâm

Câu tuyên bố bên trái, các vòng tròn bên phải nở dần từ trong ra; vòng trong cùng màu đỏ.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề section | text |  |  | Tuỳ chọn. Một section không có tiêu đề và chỉ có một đoạn văn hiện thành câu chốt chữ lớn. |
| `statement` | Câu tuyên bố | text | có |  |  |
| `body` | Đoạn mô tả | textarea | có |  |  |
| `items` | Các vòng | array (2–n dòng) | có |  | Từ trong ra ngoài. |
| `items[].text` | Nội dung | text | có |  |  |

#### `values`: Giá trị

Một hàng chữ lớn, mỗi giá trị một ô.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề section | text |  |  | Tuỳ chọn. Một section không có tiêu đề và chỉ có một đoạn văn hiện thành câu chốt chữ lớn. |
| `items` | Các giá trị | array (1–n dòng) | có |  |  |
| `items[].text` | Nội dung | text | có |  |  |

#### `case`: Case study

Hồ sơ case study dùng chung: chọn hồ sơ, rồi sửa nội dung ngay bên dưới. Trang nào dùng cùng hồ sơ cũng đổi theo. Field `caseId` chọn một case study (relationship tới collection `case`).

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tiêu đề section | text |  |  | Tuỳ chọn. Một section không có tiêu đề và chỉ có một đoạn văn hiện thành câu chốt chữ lớn. |
| `caseId` | Case study | select: `quan-ly-du-an` (Quản lý dự án công nghiệp (PTSC M&C)), `dich-vu-cong` (Tổng đài AI dịch vụ công (minh hoạ)), `ai-platform` (AI Platform (minh hoạ)), `tdn` (AI DN360) | có |  |  |

#### `project`: Dự án

Hồ sơ một dự án: bài toán, giải pháp, kết quả.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |
| `title` | Tên dự án | text | có |  |  |
| `client` | Khách hàng | text | có |  |  |
| `problem` | Bài toán | textarea | có |  |  |
| `solution` | Giải pháp GEO Agent | array (1–n dòng) | có |  |  |
| `solution[].text` | Nội dung | text | có |  |  |
| `result` | Kết quả | textarea | có |  |  |
| `period` | Thời gian thực hiện | text |  |  | (trong nhóm thu gọn "Hồ sơ dự án (tuỳ chọn)") |
| `status` | Trạng thái triển khai | text |  |  | (trong nhóm thu gọn "Hồ sơ dự án (tuỳ chọn)") |
| `scope` | Phạm vi thực hiện | text |  |  | (trong nhóm thu gọn "Hồ sơ dự án (tuỳ chọn)") |
| `role` | Vai trò của THEHEGEO | text |  |  | (trong nhóm thu gọn "Hồ sơ dự án (tuỳ chọn)") |
| `linkLabel` | Chữ trên link | text |  |  |  |
| `linkHref` | Link | text |  | đường dẫn bắt đầu bằng /, # hoặc https:// | Trang trong website bắt đầu bằng /, link ngoài bằng https://. |

#### `contact`: Biểu mẫu liên hệ

Biểu mẫu liên hệ và thông tin liên hệ. Email, điện thoại, địa chỉ sửa ở Footer.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |

#### `jobs`: Danh sách vị trí

Các vị trí đang tuyển: thêm, xoá, đổi thứ tự và sửa từng tin ngay bên dưới. Mỗi tin có trang riêng /tuyen-dung/<đường dẫn>/. Hiện kèm tài liệu dùng chung `jobs` (relationship).

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |

#### `projectIndex`: Danh sách dự án

Tự liệt kê mọi dự án trên các trang Use Case; sửa dự án ở trang Use Case đó.

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |

#### `waysOfWorking`: Cách chúng tôi làm việc (dùng chung)

Nội dung dùng chung cho trang Sứ mệnh và Tầm nhìn và trang Tuyển dụng: sửa ở một chỗ, cả hai trang cùng đổi. Hiện kèm tài liệu dùng chung `ways` (relationship).

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `enabled` | Hiển thị section này | checkbox |  | mặc định true | Bỏ chọn để ẩn tạm section mà không mất nội dung. |

### jobs

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `jobs` | Các tin tuyển dụng | array (1–n dòng) | có |  | Thứ tự ở đây là thứ tự trên trang Tuyển dụng. Tin mới có trang riêng sau khi bản nháp được áp và site build lại. |
| `jobs[].title` | Tên vị trí | text | có |  | Như JD ghi. |
| `jobs[].slug` | Đường dẫn | text | có | chữ thường, số, gạch ngang; không trùng | Phần cuối địa chỉ trang tin: /tuyen-dung/<đường dẫn>/. Viết thường không dấu, nối bằng gạch ngang, ví dụ ai-engineer. Không đổi sau khi tin đã đăng. |
| `jobs[].focus` | Mảng chuyên môn | text |  |  | Tuỳ chọn, ví dụ: LLM, Agents & Workflow. |
| `jobs[].code` | Mã vị trí | text | có |  | Mã ngắn trên tem hồ sơ và tiêu đề email ứng tuyển. |
| `jobs[].family` | Nhóm nghề | text | có |  | Dùng để lọc ở trang Tuyển dụng. |
| `jobs[].summary` | Tóm tắt một dòng | textarea | có |  | Hiện trên thẻ vị trí ở trang Tuyển dụng. |
| `jobs[].intro` | Giới thiệu | textarea | có |  |  |
| `jobs[].duties` | Mô tả công việc | array (1–n dòng) | có |  |  |
| `jobs[].duties[].text` | Nội dung | text | có |  |  |
| `jobs[].requirements` | Yêu cầu | array (1–n dòng) | có |  |  |
| `jobs[].requirements[].text` | Nội dung | text | có |  |  |
| `jobs[].plus` | Điểm cộng | array (1–n dòng) | có |  |  |
| `jobs[].plus[].text` | Nội dung | text | có |  |  |
| `jobs[].benefits` | Quyền lợi | array (1–n dòng) | có |  |  |
| `jobs[].benefits[].text` | Nội dung | text | có |  |  |
| `jobs[].location` | Địa điểm làm việc | text | có |  |  |
| `jobs[].subject` | Tiêu đề email ứng tuyển | text |  |  | Tuỳ chọn. Để trống thì dùng "[Mã vị trí] Ứng tuyển Tên vị trí". |
| `jobs[].skills` | Kỹ năng chính (nhãn) | array |  |  | Tuỳ chọn. Để trống thì dùng phần Yêu cầu. |
| `jobs[].skills[].text` | Nội dung | text | có |  |  |
| `jobs[].areas` | Mảng công việc (nhãn) | array |  |  | Tuỳ chọn. |
| `jobs[].areas[].text` | Nội dung | text | có |  |  |
| `jobs[].glyph` | Hình vẽ trên giấy | select: `agents` (Agent), `pipeline` (Pipeline), `data` (Dữ liệu), `platform` (Nền tảng), `web` (Web), `flow` (Quy trình), `ledger` (Sổ sách) |  |  | Tuỳ chọn. Để trống thì giấy có dòng kẻ. (trong nhóm thu gọn "Hình trên thẻ (thường không cần sửa)") |

### case

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `name` | Tên sản phẩm | text | có |  | Ví dụ: AI DN360. Tên lớn trên thẻ. |
| `org` | Đơn vị | text | có |  | Khách hàng hoặc nơi triển khai, ví dụ: Cục Thuế TP. Hà Nội. |
| `index` | Nhãn số thứ tự | text | có |  | Ví dụ: 01 / TÀI CHÍNH & THUẾ. Gõ như muốn hiện. |
| `summary` | Tóm tắt trên thẻ | textarea | có |  | Một câu ngắn dưới tên sản phẩm. |
| `description` | Mô tả khi mở hồ sơ | textarea | có |  |  |
| `note` | Ghi chú: AI làm gì, con người quyết định gì | textarea | có |  |  |
| `kicker` | Lĩnh vực | text | có |  | Ví dụ: Tài chính và thuế. |
| `checks` | Ba mục kiểm tra | array (3–3 dòng) | có |  | Ba tờ đứng phía sau khi mở hồ sơ. |
| `checks[].text` | Nội dung | text | có |  |  |
| `checkFoot` | Dòng dưới ba mục | text | có |  | Ví dụ: Theo mã số thuế. |
| `tag` | Dòng nhỏ trên giấy | text | có |  | Ví dụ: AI / TAX INTELLIGENCE. |
| `headline` | Tiêu đề trên giấy, dòng 1 | text | có |  |  |
| `headlineLine2` | Tiêu đề trên giấy, dòng 2 | text | có |  |  |
| `stamp` | Con dấu, dòng 1 | text | có |  |  |
| `stampLine2` | Con dấu, dòng 2 | text | có |  |  |
| `model` | Kiểu mô hình | select: `folder` (Tập hồ sơ mở như sách), `call` (Điện thoại có cuộc gọi), `board` (Bảng việc theo cột), `stack` (Chồng máy chủ) | có |  | (trong nhóm thu gọn "Hình dạng và màu (thường không cần sửa)") |
| `tone` | Màu giấy | select: `white` (Trắng), `navy` (Xanh navy), `kraft` (Giấy kraft), `graphite` (Xám than) | có |  | (trong nhóm thu gọn "Hình dạng và màu (thường không cần sửa)") |
| `glyph` | Hình vẽ trên giấy | select: `agents`, `pipeline`, `data`, `platform`, `web`, `flow`, `ledger` |  |  | Tuỳ chọn, chỉ dùng cho kiểu Tập hồ sơ. Để trống thì giấy có dòng kẻ. (trong nhóm thu gọn "Hình dạng và màu (thường không cần sửa)") |
| `script` | Lời thoại | array |  |  | Chỉ dùng cho kiểu Điện thoại. (trong nhóm thu gọn "Hình dạng và màu (thường không cần sửa)") |
| `script[].who` | Ai nói | select: `in` (Người gọi), `agent` (Agent) | có |  |  |
| `script[].text` | Nội dung | textarea | có |  |  |
| `board` | Các cột việc | array |  |  | Chỉ dùng cho kiểu Bảng việc. (trong nhóm thu gọn "Hình dạng và màu (thường không cần sửa)") |
| `board[].col` | Tên cột | text | có |  |  |
| `board[].cards` | Các việc | array (1–n dòng) | có |  |  |
| `board[].cards[].text` | Nội dung | text | có |  |  |
| `mock` | Nội dung minh hoạ (chưa có bản chính thức) | checkbox |  |  | Chỉ để theo dõi; không hiện gì trên trang. (trong nhóm thu gọn "Hình dạng và màu (thường không cần sửa)") |

### geoagents

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `hero` | Phần đầu trang (video) | group |  |  | Video và hiệu ứng nằm trong code; ở đây sửa chữ. |
| `hero.title` | Tên, phần đầu | text | có |  | Ví dụ: GEO. |
| `hero.highlight` | Tên, phần sau (màu nhấn) | text | có |  | Ví dụ: agents. Nối liền ngay sau phần đầu. |
| `hero.subtitle` | Dòng phụ | text | có |  | Gõ như muốn hiện (đang viết in hoa). |
| `hero.description` | Mô tả | textarea | có |  |  |
| `hero.primaryLabel` | Chữ trên nút chính | text | có |  | Nút dẫn xuống phần bốn tầng. |
| `hero.secondaryLabel` | Chữ trên nút phụ | text | có |  |  |
| `hero.secondaryHref` | Link nút phụ | text | có | đường dẫn bắt đầu bằng /, # hoặc https:// | Trang trong website bắt đầu bằng /. |
| `hero.video` | Video (máy tính) | upload → Media (video MP4) |  |  | Tuỳ chọn. File MP4, nên dưới 25 MB. Để trống thì dùng phim mặc định. |
| `hero.videoSmall` | Video nhẹ cho điện thoại | upload → Media (video MP4) |  |  | Tuỳ chọn. Bản MP4 nhẹ hơn của cùng video (720p). Để trống thì điện thoại dùng video máy tính. |
| `hero.poster` | Ảnh chờ (poster) | upload → Media (ảnh JPG/PNG/WebP/AVIF/GIF) |  |  | Tuỳ chọn. Ảnh hiện trước khi video chạy. Để trống thì dùng ảnh mặc định. |
| `metrics` | Dải số liệu | group |  |  |  |
| `metrics.label` | Tên dải cho trình đọc màn hình | text | có |  | Không hiện trên trang. |
| `metrics.items` | Các số liệu | array (1–n dòng) | có |  |  |
| `metrics.items[].value` | Giá trị số | number | có |  | Con số cuối cùng hiển thị, ví dụ 100. |
| `metrics.items[].label` | Mô tả dưới số | text | có |  | Ví dụ: Chủ quyền dữ liệu. |
| `metrics.items[].prefix` | Chữ trước số | text |  |  | Tuỳ chọn, ví dụ "Level". Khoảng cách với số được thêm tự động. |
| `metrics.items[].suffix` | Ký hiệu sau số (cùng cỡ) | text |  |  | Tuỳ chọn, ví dụ "+" để thành 3+. |
| `metrics.items[].unit` | Đơn vị sau số (chữ nhỏ) | text |  |  | Tuỳ chọn, ví dụ "%". Hiển thị nhỏ hơn con số. |
| `metrics.items[].minDigits` | Số chữ số tối thiểu | number |  | ≥ 1; ≤ 12 | Tuỳ chọn. Nhập 2 thì số 4 hiển thị thành 04. Để trống nếu không cần. |
| `architecture` | Bốn tầng tổ chức | group |  |  | Sơ đồ chuyển động nằm trong code; ở đây sửa chữ và tên các tầng. |
| `architecture.title` | Tiêu đề, dòng 1 | text | có |  |  |
| `architecture.highlight` | Tiêu đề, dòng 2 (màu nhấn) | text | có |  |  |
| `architecture.intro` | Giới thiệu, dòng 1 | text | có |  |  |
| `architecture.introLine2` | Giới thiệu, dòng 2 | text | có |  |  |
| `architecture.captionLeft` | Chú thích dưới sơ đồ, bên trái | text | có |  |  |
| `architecture.captionRight` | Chú thích dưới sơ đồ, bên phải | text | có |  |  |
| `architecture.layers` | Bốn tầng | array (4–4 dòng) | có |  | Sơ đồ vẽ đúng bốn tầng, từ Quản trị đến Dịch vụ. |
| `architecture.layers[].tab` | Tên tầng | text | có |  | Ví dụ: Quản trị. |
| `architecture.layers[].product` | Tên sản phẩm | text | có |  | Ví dụ: GEO Governance. |
| `architecture.layers[].body` | Mô tả tầng | textarea | có |  |  |
| `applications` | Ứng dụng thực tiễn | group |  |  | Hồ sơ case study AI DN360 bên dưới là nội dung dùng chung. Hiện kèm tài liệu dùng chung `case:tdn`. |
| `applications.title` | Tiêu đề, dòng 1 | text | có |  |  |
| `applications.highlight` | Tiêu đề, dòng 2 (màu nhấn) | text | có |  |  |
| `applications.intro` | Giới thiệu, dòng 1 | text | có |  |  |
| `applications.introLine2` | Giới thiệu, dòng 2 | text | có |  |  |
| `careers` | Tuyển dụng | group |  |  |  |
| `careers.title` | Tiêu đề, dòng 1 | text | có |  |  |
| `careers.highlight` | Tiêu đề, dòng 2 (màu nhấn) | text | có |  |  |
| `careers.body` | Mô tả | textarea | có |  |  |
| `careers.apply` | Lời mời ứng tuyển | textarea | có |  |  |
| `careers.action` | Chữ trên nút | text | có |  | Nút gửi email tới địa chỉ ở Footer. |
| `careers.subject` | Tiêu đề email ứng tuyển | text | có |  |  |
| `cta` | Kêu gọi liên hệ (cuối trang) | group |  |  |  |
| `cta.title` | Tiêu đề | text | có |  | Dòng 1 của tiêu đề lớn. |
| `cta.highlight` | Dòng 2 | text | có |  | Dòng 2 của tiêu đề lớn, cùng màu với dòng 1. |
| `cta.question` | Câu hỏi | text | có |  | Dòng in đậm dưới tiêu đề. |
| `cta.body` | Đoạn mô tả | textarea | có |  |  |
| `cta.action` | Chữ trên nút | text | có |  | Nên bắt đầu bằng động từ, ví dụ: Gửi yêu cầu tư vấn. |
| `cta.href` | Link của nút | text | có | đường dẫn bắt đầu bằng /, # hoặc https:// | Trang trong website bắt đầu bằng /, ví dụ /geoagents/. Link ngoài bắt đầu bằng https://. |

### header

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `nav` | Menu | array (1–n dòng) | có |  | Thứ tự từ trái sang. Menu con lấy tự động từ các trang của section được chọn. |
| `nav[].label` | Chữ trên menu | text | có |  |  |
| `nav[].href` | Link | text | có | đường dẫn bắt đầu bằng /, # hoặc https:// | Trang trong website bắt đầu bằng /, ví dụ /giai-phap/. |
| `nav[].menu` | Menu con | select: `giai-phap` (Các trang Giải pháp), `ung-dung` (Các trang Use Case), `ve-thehegeo` (Các trang Về THEHEGEO) |  |  | Tuỳ chọn. Để trống thì không có menu con. |

### footer

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `tagline` | Khẩu hiệu, dòng 1 | text | có |  |  |
| `taglineHighlight` | Khẩu hiệu, dòng 2 | text | có |  | Hiện màu nhạt hơn dòng 1. |
| `email` | Email liên hệ | text | có |  | Cũng dùng cho biểu mẫu liên hệ và menu trên điện thoại. |
| `phone` | Số điện thoại | text | có |  | Hiện như gõ; link gọi điện được tạo từ các chữ số. |
| `address` | Địa chỉ | text | có |  |  |
| `copyright` | Dòng bản quyền | text | có |  |  |
| `motto` | Câu cuối trang | text | có |  |  |
| `wordmark` | Chữ lớn cuối trang | text | có |  | Chữ lớn trồi lên khi cuộn tới cuối trang. |

### ways

| Field | Nhãn trong admin | Kiểu Payload | Bắt buộc | Ràng buộc | Mô tả cho người nhập |
|---|---|---|---|---|---|
| `title` | Tiêu đề section | text | có |  |  |
| `items` | Các nguyên tắc | array (1–n dòng) | có |  |  |
| `items[].title` | Tên nguyên tắc | text | có |  |  |
| `items[].body` | Mô tả | textarea | có |  |  |

## 3. Nội dung hiện tại của từng trang

Section theo thứ tự trên trang. Cột "Nội dung" là phần chữ để nhận ra section; bản đầy đủ ở file nguồn.

### / · THEHEGEO (`pages`, nguồn `content/pages/home.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `homeHero` Hero trang chủ | THEHEGEO: Công nghệ có tầm nhìn. Vận hành có chủ quyền. |
| 2 | `metrics` Dải số liệu | Các đặc tính GEOagents |
| 3 | `partners` Dải logo đối tác | Những đơn vị đã cùng làm việc với Thehegeo |
| 4 | `coreShowcase` Giới thiệu GEOagents 4 tầng (trang chủ) | Một hệ thống. |
| 5 | `agentDemo` Demo Agent xử lý công văn (trang chủ) | Từ công văn đến |
| 6 | `navigationTiles` Lưới ô điều hướng | Khám phá |
| 7 | `cta` Kêu gọi liên hệ (CTA) | Sẵn sàng đưa AI Agent vào |

### /giai-phap · Giải pháp (`corporate`, nguồn `content/pages/giai-phap.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `cards` Thẻ |  |
| — | Nút cuối trang | Đặt lịch demo |

### /giai-phap/ai · Giải pháp AI (`corporate`, nguồn `content/pages/giai-phap/ai.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `table` Bảng (hiện thành thẻ) | Năm bài toán AI đang giải |
| 2 | `text` Đoạn văn | Một lõi chung |
| 3 | `pills` Nhãn | Triển khai |
| 4 | `case` Case study | Doanh nghiệp công nghiệp |
| — | Hình minh hoạ `core` | |
| — | Nút cuối trang | Đặt lịch demo |

### /giai-phap/aiot · Giải pháp AIoT (`corporate`, nguồn `content/pages/giai-phap/aiot.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `text` Đoạn văn | Bài toán |
| 2 | `cards` Thẻ | Lĩnh vực quan trắc |
| 3 | `steps` Các bước | Hệ thống gồm bốn lớp |
| 4 | `list` Danh sách | Giao thông và đô thị thông minh |
| 5 | `table` Bảng (hiện thành thẻ) | Công trình tiêu biểu |
| — | Hình minh hoạ `bridge` | |
| — | Nút cuối trang | Trao đổi về công trình của anh/chị |

### /giai-phap/cong-nghe · Giải pháp Công nghệ (`corporate`, nguồn `content/pages/giai-phap/cong-nghe.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `text` Đoạn văn | Sinh ra từ nhu cầu ở hiện trường |
| 2 | `table` Bảng (hiện thành thẻ) | Dòng thiết bị |
| 3 | `steps` Các bước | Từ thiết bị đến cảnh báo |
| 4 | `list` Danh sách | Đang chạy ở đâu |
| 5 | `callout` Câu nổi bật | Hướng tới: Physical AI |
| — | Hình minh hoạ `devices` | |
| — | Nút cuối trang | Trao đổi về bài toán thiết bị của anh/chị |

### /giai-phap/tu-van · Tư vấn công nghệ (`corporate`, nguồn `content/pages/giai-phap/tu-van.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `cards` Thẻ | Ba mảng tư vấn |
| — | Nút cuối trang | Trao đổi về nhu cầu tư vấn |

### /ung-dung · Use Case (`corporate`, nguồn `content/pages/ung-dung.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `cards` Thẻ |  |
| — | Nút cuối trang | Đặt lịch demo |

### /ung-dung/hkd · HKD (`corporate`, nguồn `content/pages/ung-dung/hkd.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `text` Đoạn văn | Bối cảnh |
| 2 | `steps` Các bước | HKD làm gì |
| 3 | `table` Bảng (hiện thành thẻ) | Mục tiêu |
| 4 | `text` Đoạn văn | Đang triển khai |
| — | Hình minh hoạ `phone` | |
| — | Nút cuối trang | Đặt lịch demo |

### /ung-dung/a360 · A360 (`corporate`, nguồn `content/pages/ung-dung/a360.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `list` Danh sách | Ba việc A360 làm |
| 2 | `table` Bảng (hiện thành thẻ) | Quản lý và Kiểm tra |
| 3 | `table` Bảng (hiện thành thẻ) | Các tầng chỉ số |
| 4 | `text` Đoạn văn | Nguyên tắc |
| 5 | `project` Dự án | Hệ thống AI DN360 |
| — | Hình minh hoạ `stack` | |
| — | Nút cuối trang | Đặt lịch demo |

### /ung-dung/ai-platform · AI Platform (`corporate`, nguồn `content/pages/ung-dung/ai-platform.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `table` Bảng (hiện thành thẻ) | Bốn thành phần |
| 2 | `text` Đoạn văn | Sân chơi đổi mới sáng tạo |
| 3 | `project` Dự án | Nền tảng AI dùng chung (iHanoi / Tax OS) |
| — | Hình minh hoạ `stack` | |
| — | Nút cuối trang | Đặt lịch demo |

### /ung-dung/quan-ly-du-an · Quản lý dự án công nghiệp (`corporate`, nguồn `content/pages/ung-dung/quan-ly-du-an.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `project` Dự án | Trợ lý AI Quản lý Dự án Công nghiệp |
| 2 | `case` Case study | Trợ lý AI trong dự án |
| — | Nút cuối trang | Đặt lịch demo |

### /ve-thehegeo · Về THEHEGEO (`corporate`, nguồn `content/pages/ve-thehegeo.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `timeline` Dòng thời gian | Hành trình |

### /ve-thehegeo/kinh-nghiem-du-an · Kinh nghiệm dự án (`corporate`, nguồn `content/pages/ve-thehegeo/kinh-nghiem-du-an.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `projectIndex` Danh sách dự án |  |
| — | Nút cuối trang | Trao đổi về dự án của anh/chị |

### /ve-thehegeo/su-menh-tam-nhin · Sứ mệnh và Tầm nhìn (`corporate`, nguồn `content/pages/ve-thehegeo/su-menh-tam-nhin.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `callout` Câu nổi bật | Sứ mệnh |
| 2 | `rings` Vòng tròn đồng tâm | Tầm nhìn |
| 3 | `values` Giá trị | Giá trị cốt lõi |
| 4 | `waysOfWorking` Cách chúng tôi làm việc (dùng chung) |  |
| 5 | `text` Đoạn văn | [object Object] |
| — | Nút cuối trang | Liên hệ |

### /ve-thehegeo/doi-tac · Đối tác và Khách hàng (`corporate`, nguồn `content/pages/ve-thehegeo/doi-tac.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `partners` Đối tác |  |

### /ve-thehegeo/lien-he · Liên hệ (`corporate`, nguồn `content/pages/ve-thehegeo/lien-he.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `contact` Biểu mẫu liên hệ |  |

### /tuyen-dung · Tuyển dụng (`corporate`, nguồn `content/pages/tuyen-dung.json`)

| # | Block | Nội dung |
|---|---|---|
| 1 | `pills` Nhãn | Bài toán chúng tôi giải |
| 2 | `waysOfWorking` Cách chúng tôi làm việc (dùng chung) |  |
| 3 | `steps` Các bước | Những ngày đầu tiên |
| 4 | `jobs` Danh sách vị trí |  |

