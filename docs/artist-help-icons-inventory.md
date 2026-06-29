# Danh sách icon giải thích hệ thống cho Artist

## Mục đích

Tài liệu này tổng hợp tất cả các icon/popup/guide đang được dùng để giải thích hệ thống cho artist trong `musica_client`, bao gồm:

- Icon `i` dạng tooltip (`HintIcon`)
- Nút nổi mở hướng dẫn sử dụng (`TourFab`)
- Các popup hướng dẫn trong tour onboarding artist (`useArtistTour`)

Phạm vi tập trung:

- `/me/dashboard`
- `/me/profile`
- `/me/products`
- `/me/products/:productId/:section?`

## Thành phần dùng chung

### 1) HintIcon

- File: `src/shared/ui/HintIcon.vue`
- Vai trò: icon hình tròn chữ `i`, hover/focus sẽ hiện tooltip giải thích
- Cơ chế:
  - Nhận `content`
  - Dùng `v-tooltip`
  - Theme tooltip: `artist-hint`

### 2) TourFab

- File: `src/shared/ui/TourFab.vue`
- Vai trò: nút nổi `Hướng dẫn` ở góc màn hình để artist tự mở walkthrough
- Icon:
  - Khi chưa chạy tour: icon `i`
  - Khi đang chạy tour: spinner

### 3) Tour artist

- File: `src/composables/useArtistTour.ts`
- Vai trò: chuỗi popup hướng dẫn onboarding/trải nghiệm hệ thống cho artist

## I) Icon HintIcon trên các màn Artist

## Dashboard Artist

- Route: `/me/dashboard`
- File: `src/pages/me/dashboard.page.vue`

| STT | Vị trí UI | Line | Đang hướng dẫn/giải thích |
|---|---|---:|---|
| 1 | Tiêu đề `Dashboard` | `280-283` | Đây là nơi xem tổng quan hiệu suất tài khoản; có thể chọn mốc `7 ngày`, `30 ngày`, `6 tháng`, `12 tháng`; dữ liệu hiện tại là minh hoạ. |
| 2 | Card/chart `Doanh thu theo thời gian` | `324-327` | Doanh thu hiển thị là doanh thu sau khi trừ phí nền tảng. |
| 3 | Card/chart `Lượt mua` | `343-346` | Mỗi cột là số đơn hàng cấp phép và thanh toán thành công. |
| 4 | Card/chart `Lượt nghe theo thời gian` | `367-370` | Lượt nghe là preview trên chợ; lượt nghe cao không đồng nghĩa đã mua. |
| 5 | Card/chart `Phân bổ thể loại` | `388-390` | Biểu đồ tròn cho biết thể loại nào đang mang lại doanh thu tốt nhất. |
| 6 | Card `Top sản phẩm bán chạy` | `411-414` | Top 5 tác phẩm có doanh thu cao nhất trong kỳ đang chọn. |

## Hồ sơ Artist

- Route: `/me/profile`
- File: `src/pages/me/profile.page.vue`

| STT | Vị trí UI | Line | Đang hướng dẫn/giải thích |
|---|---|---:|---|
| 1 | Tiêu đề card `Thông tin tài khoản` | `135-139` | Email/số điện thoại: muốn đổi cần liên hệ hỗ trợ; trạng thái tài khoản phải hoạt động thì mới xuất bản sản phẩm được. |
| 2 | Label `Trạng thái` | `166-171` | Phân biệt `Đang hoạt động`/`Không hoạt động` và ảnh hưởng của nó tới việc xuất bản sản phẩm. |
| 3 | Tiêu đề card `Hồ sơ nghệ sĩ` | `187-190` | Đây là thông tin hiển thị công khai trên chợ; `stage name`, `genre`, `bio` giúp tăng độ tin cậy và tỷ lệ chuyển đổi. |

## Danh sách sản phẩm Artist (bao gồm form upload/tạo sản phẩm)

- Route: `/me/products`
- File: `src/pages/me-products/list.page.vue`

| STT | Vị trí UI | Line | Đang hướng dẫn/giải thích |
|---|---|---:|---|
| 1 | Tiêu đề trang `Quản lý sản phẩm` | `390-393` | Đây là nơi quản lý toàn bộ tác phẩm; cần có audio gốc và ảnh đại diện trước khi cấu hình giá/chờ duyệt. |
| 2 | Cột `Trạng thái` trong bảng | `514-517` | Ý nghĩa 3 trạng thái `PENDING`, `PUBLISHED`, `HIDDEN`. |
| 3 | Section `Thông tin chung` trong dialog tạo sản phẩm | `619-622` | Điền đủ thông tin để tác phẩm dễ được tìm kiếm; tên sản phẩm và file audio là bắt buộc. |
| 4 | Label `Thể loại` | `641-644` | Nên chọn 1–3 thể loại phù hợp để buyer lọc tìm dễ hơn. |
| 5 | Label `Mục đích sử dụng` | `661-664` | Tag đúng use-case giúp tác phẩm tiếp cận đúng khách hàng/dự án. |
| 6 | Section `Ảnh đại diện` | `694-697` | Thumbnail hiển thị trên card chợ; tỷ lệ vuông (1:1), tối thiểu 500×500px; PNG/JPG/WEBP. |
| 7 | Section `File audio gốc (MP3)` | `717-720` | File chất lượng cao buyer nhận sau khi cấp phép; chỉ hỗ trợ MP3; hệ thống đọc thời lượng tự động. |
| 8 | Section `Khuông nhạc PDF` | `742-745` | Sheet music PDF (tuỳ chọn) là tài liệu bonus cho nhạc sĩ/producer. |

## Chi tiết sản phẩm Artist — tab Tổng quan

- Route: `/me/products/:productId/general`
- File: `src/pages/me-products/detail.page.vue`

| STT | Vị trí UI | Line | Đang hướng dẫn/giải thích |
|---|---|---:|---|
| 1 | Cạnh badge `Trạng thái sản phẩm` | `1149` | Điều kiện để sản phẩm lên chợ: pháp lý hợp lệ, có quyền bán, có giá bán. |
| 2 | Dòng `Bản nhạc gốc` | `1176` | Buyer chỉ nghe preview trước khi mua; file gốc là bản chất lượng cao. |
| 3 | Nút phát hành bị khoá | `1189` | Vì sao nút bị khoá và 3 bước cần hoàn thành để mở khoá. |
| 4 | Tiêu đề `Mô tả sản phẩm` | `1213` | Mô tả này sẽ hiển thị công khai trên chợ nhạc. |
| 5 | Tiêu đề `Quyền bán` | `1226` | Buyer được phép làm gì với bài nhạc; cần ít nhất 1 quyền để phát hành. |
| 6 | Dòng `File khuông nhạc` | `1261` | File PDF có thể được buyer tải về theo giấy phép. |
| 7 | Dòng `Use-case` | `1278` | Use-case giúp buyer tìm đúng bài khi search/filter. |
| 8 | Nút/section upload PDF khuông nhạc | `1296` | File PDF sẽ đi kèm sản phẩm khi buyer tải về. |

## Chi tiết sản phẩm Artist — tab Quyền & Giấy phép

- Route: `/me/products/:productId/rights-license`
- File: `src/pages/me-products/detail.page.vue`

| STT | Vị trí UI | Line | Đang hướng dẫn/giải thích |
|---|---|---:|---|
| 1 | Tiêu đề `Quyền & Giấy phép` | `1312` | Nơi quản lý giấy tờ pháp lý để Musica xác nhận quyền sở hữu/quyền bán. |
| 2 | Badge/section `Pháp lý` | `1329` | Hồ sơ đã đủ hay chưa đủ để tiếp tục phát hành. |
| 3 | Badge/section `Kiểm duyệt` | `1347` | Kết quả review nội dung: approved/pending/rejected. |
| 4 | Heading `Quyền bán` | `1374` | Quyền chọn phải phù hợp căn cứ pháp lý và ảnh hưởng trực tiếp đến phạm vi khai thác. |

## Chi tiết sản phẩm Artist — tab Giá bán

- Route: `/me/products/:productId/pricing`
- File: `src/pages/me-products/detail.page.vue`

| STT | Vị trí UI | Line | Đang hướng dẫn/giải thích |
|---|---|---:|---|
| 1 | Tiêu đề `Giá bán theo biến thể` | `1411` | Có thể đặt nhiều mức giá theo use-case và nền tảng; cần ít nhất một kênh có giá để lên chợ. |
| 2 | Cạnh nút `Thêm nền tảng` | `1432` | Mỗi nền tảng là một kênh bán mới để buyer tiếp cận bài nhạc. |
| 3 | Metric `Platform đã join` | `1470` | Tổng số kênh bán mà sản phẩm đang tham gia. |
| 4 | Metric `Variant đã cấu hình` | `1485` | Tổng số mức giá đã đặt; variant inactive/chưa đặt sẽ không hiện với buyer. |
| 5 | Tiêu đề platform hiện tại | `1522` | Đây là kênh đang được đặt giá; có thể mở `Công thức` để xem cách tính. |
| 6 | Badge tiến độ variant | `1526` | Số biến thể đã đặt xong trên tổng số biến thể có thể cấu hình. |

## II) Icon hướng dẫn toàn hệ thống cho Artist

## Nút nổi `Hướng dẫn`

- File: `src/shared/ui/TourFab.vue`
- Render toàn app trong: `src/App.vue`
- Vị trí UI:
  - Button nổi góc phải dưới màn hình
  - Label: `Hướng dẫn`
- Ý nghĩa:
  - Điểm vào để artist mở tour hướng dẫn bất cứ lúc nào
  - Dùng icon `i` giống nhóm `HintIcon`, nhưng hành vi là mở walkthrough thay vì tooltip ngắn

## III) Các popup trong tour hướng dẫn Artist

- File tổng: `src/composables/useArtistTour.ts`
- Loại: popup hướng dẫn từng bước (Shepherd tour)

| STT | Step ID | Route/Màn hình | Selector/Neo vào đâu | Tiêu đề | Popup đang hướng dẫn/giải thích |
|---|---|---|---|---|---|
| 1 | `welcome` | màn hình hiện tại khi bắt đầu | không neo | `Chào mừng bạn đến với Musica!` | Tổng quan Musica và luồng: upload bài nhạc → cấu hình giá → lên chợ kiếm tiền. |
| 2 | `market-intro` | `/market` | `.market-grid, [class*="product-grid"], .products-grid, [class*="grid"]` | `Đây là chợ nhạc Musica` | Giới thiệu nơi buyer mua nhạc bản quyền; có thể lọc thể loại và xem giá trên từng thẻ nhạc. |
| 3 | `dashboard-intro` | `/me/dashboard` | `.me-title, [class*="page-title"], h1` | `Dashboard — Trung tâm điều khiển` | Theo dõi doanh thu, lượt nghe thử, bài đang bán và tăng trưởng. |
| 4 | `products-list` | `/me/products` | `[class*="add"], [class*="btn-add"], button[class*="primary"]` | `Kho bài nhạc của bạn` | Quản lý tất cả bài đã upload; bấm `Thêm sản phẩm` để bắt đầu. |
| 5 | `product-general` | `/me/products/:id/general` | `[class*="wave"], [class*="waveform"], [class*="audio-preview"]` | `Tổng quan bài nhạc` | Trang chi tiết có 3 mục: Tổng quan, Quyền & Giấy phép, Giá bán; tab Tổng quan để nghe file gốc và sửa metadata. |
| 6 | `product-status` | `/me/products/:id/general` | `[class*="status-badge"], [class*="product-status"], [class*="badge"]` | `Trạng thái & 3 bước phát hành` | Muốn lên chợ cần 3 bước: hồ sơ pháp lý, quyền bán, giá bán. |
| 7 | `rights-legal` | `/me/products/:id/rights-license` | `[class*="compliance"], [class*="legal"], [class*="rights"]` | `Bước 1: Hồ sơ pháp lý` | Upload giấy tờ để chứng minh quyền bán bài nhạc. |
| 8 | `rights-permissions` | `/me/products/:id/rights-license` | `[class*="permissions"], [class*="allowed"], [class*="rights-list"]` | `Bước 2: Chọn quyền bán` | Chọn buyer được phép làm gì; mỗi quyền ảnh hưởng tới giá bán. |
| 9 | `pricing-overview` | `/me/products/:id/pricing` | `[class*="pricing"], [class*="platform-list"], [class*="variant"]` | `Bước 3: Thiết lập giá bán` | Cấu hình giá theo từng kênh phân phối (ví dụ YouTube/TikTok). |
| 10 | `pricing-variants` | `/me/products/:id/pricing` | `[class*="platform-card"], [class*="price-table"], [class*="pricing-row"]` | `Biến thể giá bán` | Bật/tắt từng dòng giá và chỉnh giá theo mục đích sử dụng. |
| 11 | `done` | cuối tour | không neo | `Xong rồi!` | Tổng kết: upload → pháp lý → quyền → giá; đủ điều kiện thì bài sẽ tự động lên chợ. |

## IV) Nhận xét tổng hợp

- Hình thức giải thích hiện tại chia làm 2 lớp:
  - Lớp 1: tooltip ngắn bằng `HintIcon`
  - Lớp 2: popup hướng dẫn từng bước bằng `useArtistTour`
- Khu vực có mật độ icon giải thích nhiều nhất:
  - `detail.page.vue`
  - `list.page.vue`
  - `dashboard.page.vue`

## V) Các khu vực chưa thấy icon giải thích riêng

Trong quá trình rà soát, chưa thấy `HintIcon`/tooltip nghiệp vụ riêng trong:

- `src/components/features/products/detail/ProductPricingTableSection.vue`
- `src/components/features/products/detail/JoinPlatformModal.vue`
- `src/components/features/pricing/PricingFormulaOverviewDialog.vue`
