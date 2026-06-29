# Hướng dẫn khi nhấn nút “Hướng dẫn” (Khách vãng lai & Artist)

Tài liệu này mô tả chi tiết **những gì sẽ xảy ra** khi người dùng nhấn nút **“Hướng dẫn”** (nút nổi góc phải dưới) trong `musica_client`, bao gồm:

- Cách tour được kích hoạt
- Tour chạy ở chế độ nào (demo)
- Luồng điều hướng tự động qua các trang
- Nội dung giải thích ở từng bước
- Khác nhau giữa **khách vãng lai** và **artist**

> Nút “Hướng dẫn” sử dụng cùng một tour: `useArtistTour.startTour()`.

## 1) Nút “Hướng dẫn” nằm ở đâu

- Component: `src/shared/ui/TourFab.vue`
- Nơi render toàn app: `src/App.vue` (hiển thị khi route **không** có `meta.hideHeaderFooter`)

Tham chiếu:

- [TourFab.vue](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/shared/ui/TourFab.vue)
- [App.vue](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/App.vue#L12-L24)

## 2) Khi nhấn nút “Hướng dẫn” thì hệ thống làm gì

### 2.1 Gọi hàm khởi động tour

- Sự kiện click gọi `startTour` từ `useArtistTour()`.
- Mã nguồn: [TourFab.vue](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/shared/ui/TourFab.vue#L1-L50)

### 2.2 Bật “demo mode”

Ngay khi bắt đầu, tour sẽ:

1) Ghi lại trang hiện tại làm **điểm quay về** (`originPath`)
2) Bật chế độ demo trong store `tourDemo` và tạo **sản phẩm demo** `DEMO_PRODUCT`

Mã nguồn:

- Khởi động demo: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L83-L90)
- Dữ liệu demo & quyền demo: [tourDemo.store.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/stores/tourDemo.store.ts#L4-L59)

### 2.3 Cho phép khách vãng lai vào một số trang /me/*

Trong demo mode:

- `tourDemo.allowedDemoPaths = ['/me/dashboard', '/me/products']`
- Router guard sẽ cho **khách chưa đăng nhập** đi vào các trang này như một “demo artist” (không yêu cầu auth thật).

Mã nguồn:

- Allowed paths demo: [tourDemo.store.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/stores/tourDemo.store.ts#L38-L58)
- Bypass guard khi demo: [routerGuards.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/app/routerGuards.ts#L39-L45)

### 2.4 Tạo Shepherd Tour (modal overlay + nút X)

Tour được hiển thị bằng `shepherd.js` với các đặc điểm:

- Có **modal overlay** làm mờ nền
- Có **nút X** để đóng tour
- Tự cuộn tới vùng đang được gắn (scrollTo center)
- Highlight vùng được gắn với padding + radius

Mã nguồn:

- Khởi tạo tour: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L91-L101)
- Bắt sự kiện `cancel/complete`: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L104-L113)

## 3) Hành vi khi người dùng đóng hoặc hoàn tất tour

### 3.1 Khi bấm dấu X (Cancel)

Tour sẽ:

1) Dừng tour
2) Thoát demo mode (`demo.clearDemo()`)
3) Nếu đang đứng ở trang `/me/*` thì quay lại `originPath` (trang lúc bấm “Hướng dẫn”) hoặc `/`

Mã nguồn:

- Cancel handler: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L104-L108)
- Điều hướng khi cancel: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L56-L61)

### 3.2 Khi bấm nút kết thúc (Complete)

Tour sẽ:

1) Dừng tour
2) Thoát demo mode (`demo.clearDemo()`)
3) Điều hướng theo loại người dùng:

- Nếu **đã đăng nhập và là artist** → chuyển tới `/me/products`
- Nếu **khách vãng lai / chưa đăng nhập** → chuyển tới `/auth/register/role`

Mã nguồn:

- Complete handler: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L110-L113)
- Điều hướng khi complete: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L50-L55)

## 4) Chi tiết từng bước trong tour (khi nhấn “Hướng dẫn”)

Tour có tổng cộng **11 bước**. Mỗi bước gồm:

- Tiêu đề (title)
- Nội dung giải thích (text)
- Nút điều hướng: `← Quay lại`, `Tiếp theo →` (và nút đặc biệt ở bước cuối)
- Có bước sẽ tự điều hướng qua route khác trước khi hiển thị (`beforeShowPromise`)
- Có bước được “neo” (attach) vào một vùng UI cụ thể

> Lưu ý: Một số selector attach dạng “mở rộng” (dùng pattern `[class*="..."]`) để tránh phụ thuộc đúng 1 class cố định.

### Bước 1 — welcome

- ID: `welcome`
- Màn hình: **màn hình hiện tại khi bấm “Hướng dẫn”** (không tự đổi trang)
- Neo vào: không (popup nằm giữa)
- Nội dung giải thích:
  - Musica là nền tảng giúp nghệ sĩ bán nhạc bản quyền tới người mua
  - Trong 2 phút sẽ đi qua: upload → cấu hình giá → lên chợ kiếm tiền
  - Đây là demo, không ảnh hưởng dữ liệu thật
- Nút:
  - `Bắt đầu khám phá →` (next)
- Mã nguồn: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L118-L129)

### Bước 2 — market-intro

- ID: `market-intro`
- Trước khi hiển thị: tự chuyển tới `/market`
- Neo vào: vùng grid sản phẩm (selector `.market-grid, [class*="product-grid"], ...`)
- Nội dung giải thích:
  - Marketplace là nơi buyer tìm & mua nhạc bản quyền
  - Có thể lọc theo thể loại và xem giá trên từng thẻ
- Nút:
  - `← Quay lại` (back)
  - `Vào trang quản lý →` (next)
- Mã nguồn: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L134-L143)

### Bước 3 — dashboard-intro

- ID: `dashboard-intro`
- Trước khi hiển thị: tự chuyển tới `/me/dashboard`
- Neo vào: tiêu đề trang (`.me-title, [class*="page-title"], h1`)
- Nội dung giải thích:
  - Dashboard là trung tâm điều khiển: doanh thu, lượt nghe thử, bài đang bán, tăng trưởng
- Nút:
  - `← Quay lại`
  - `Xem danh sách bài nhạc →`
- Mã nguồn: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L148-L166)

### Bước 4 — products-list

- ID: `products-list`
- Trước khi hiển thị: tự chuyển tới `/me/products`
- Neo vào: nút/thành phần thêm sản phẩm (selector `[class*="add"], ...`)
- Nội dung giải thích:
  - Đây là kho bài nhạc đã upload
  - Thực tế bấm “Thêm sản phẩm” để bắt đầu (audio + ảnh bìa + thông tin cơ bản)
- Nút:
  - `← Quay lại`
  - `Xem bài nhạc demo →`
- Mã nguồn: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L171-L184)

### Bước 5 — product-general

- ID: `product-general`
- Trước khi hiển thị: tự chuyển tới `/me/products/tour_demo_product/general`
- Neo vào: khu preview audio/waveform (selector `[class*="wave"], ...`)
- Nội dung giải thích:
  - Trang chi tiết có 3 mục: Tổng quan, Quyền & Giấy phép, Giá bán
  - Tab Tổng quan: nghe file gốc và sửa metadata (tên, thể loại, mô tả, ảnh bìa)
- Nút:
  - `← Quay lại`
  - `Tiếp theo →`
- Mã nguồn: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L189-L202)

### Bước 6 — product-status

- ID: `product-status`
- Màn hình: vẫn ở `/me/products/tour_demo_product/general`
- Neo vào: badge trạng thái (selector `[class*="status-badge"], ...`)
- Nội dung giải thích:
  - Bài mới upload ở trạng thái “Chưa công khai”
  - Muốn lên chợ cần 3 bước: pháp lý → quyền bán → giá bán
  - Đủ 3 bước thì tự chuyển “Đang bán”
- Nút:
  - `← Quay lại`
  - `Xem mục Quyền & Giấy phép →`
- Mã nguồn: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L207-L221)

### Bước 7 — rights-legal

- ID: `rights-legal`
- Trước khi hiển thị: tự chuyển tới `/me/products/tour_demo_product/rights-license`
- Neo vào: khu pháp lý/compliance (selector `[class*="compliance"], ...`)
- Nội dung giải thích:
  - Cần upload giấy tờ chứng minh quyền bán (hợp đồng tác giả, giấy chứng nhận…)
  - Demo đã được duyệt sẵn để nhìn thấy trạng thái
- Nút:
  - `← Quay lại`
  - `Tiếp theo →`
- Mã nguồn: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L226-L242)

### Bước 8 — rights-permissions

- ID: `rights-permissions`
- Màn hình: vẫn ở `/me/products/tour_demo_product/rights-license`
- Neo vào: khu chọn quyền (selector `[class*="permissions"], ...`)
- Nội dung giải thích:
  - Chọn buyer được phép làm gì (stream YouTube/TikTok, tải về cá nhân, quảng cáo thương mại…)
  - Mỗi quyền ảnh hưởng giá ở bước tiếp theo
- Nút:
  - `← Quay lại`
  - `Xem mục Giá bán →`
- Mã nguồn: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L247-L261)

### Bước 9 — pricing-overview

- ID: `pricing-overview`
- Trước khi hiển thị: tự chuyển tới `/me/products/tour_demo_product/pricing`
- Neo vào: khu pricing/platform list (selector `[class*="pricing"], ...`)
- Nội dung giải thích:
  - Thiết lập giá theo từng nền tảng (kênh phân phối)
  - Demo có sẵn 2 kênh: YouTube & TikTok, mỗi kênh có nhiều mức theo mục đích
- Nút:
  - `← Quay lại`
  - `Tiếp theo →`
- Mã nguồn: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L266-L279)

### Bước 10 — pricing-variants

- ID: `pricing-variants`
- Màn hình: vẫn ở `/me/products/tour_demo_product/pricing`
- Neo vào: bảng/row giá (selector `[class*="platform-card"], ...`)
- Nội dung giải thích:
  - Một kênh có nhiều biến thể giá theo mục đích sử dụng
  - Có thể bật/tắt từng dòng và chỉnh giá bất cứ lúc nào
- Nút:
  - `← Quay lại`
  - `Xong, kết thúc hướng dẫn →`
- Mã nguồn: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L284-L304)

### Bước 11 — done (kết thúc)

- ID: `done`
- Neo vào: không (popup tổng kết)
- Nội dung giải thích:
  - Tóm tắt hành trình: Upload → Pháp lý → Quyền → Giá
  - “Bài nhạc tự động lên chợ khi hoàn thành đủ 4 bước”
- Nút đặc biệt:
  - `Xem lại từ đầu`:
    - Đặt `pendingRestart = true`
    - `complete()` tour hiện tại
    - Sau ~300ms gọi lại `startTour()` để chạy lại từ bước 1
  - Nút hành động cuối:
    - Nếu **đã đăng nhập**: `🚀 Upload bài thật ngay!`
    - Nếu **chưa đăng nhập**: `📝 Đăng ký miễn phí!`
    - Khi bấm: gọi `complete()` → áp dụng quy tắc điều hướng ở mục 3.2
- Mã nguồn: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts#L309-L340)

## 5) Khác nhau giữa Khách vãng lai và Artist khi nhấn “Hướng dẫn”

### 5.1 Giống nhau

- Cùng chạy một tour (11 bước)
- Cùng bật demo mode và điều hướng qua `/market` → `/me/dashboard` → `/me/products` → trang chi tiết demo
- Cùng có thể đóng bằng nút X

### 5.2 Khác nhau

- Khi tour kết thúc (complete):
  - **Artist đã đăng nhập**: về `/me/products`
  - **Khách vãng lai / chưa đăng nhập**: chuyển sang `/auth/register/role` để đăng ký

## 6) Tham chiếu mã nguồn chính

- Nút “Hướng dẫn”: [TourFab.vue](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/shared/ui/TourFab.vue)
- Logic tour: [useArtistTour.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/composables/useArtistTour.ts)
- Demo store: [tourDemo.store.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/stores/tourDemo.store.ts)
- Router guard demo: [routerGuards.ts](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/app/routerGuards.ts)
