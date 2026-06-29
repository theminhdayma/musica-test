# Viết tài liệu luồng upload và set giá sản phẩm

**Phạm vi:** Quản lý User Artist  
**Đối tượng:** Artist đăng nhập vào khu vực quản lý sản phẩm  
**Mục tiêu:** Mô tả đầy đủ luồng từ lúc artist tạo sản phẩm, upload tài nguyên, hoàn thiện thông tin, chọn quyền bán và thiết lập giá theo biến thể để sản phẩm có thể xuất hiện trên chợ.

## Mô tả ngắn

Luồng này giúp artist:

- Tạo một sản phẩm âm nhạc mới từ màn quản lý sản phẩm
- Upload đầy đủ dữ liệu cần thiết: thông tin mô tả, ảnh đại diện, file audio gốc, khuông nhạc PDF (nếu có)
- Hoàn thiện phần pháp lý và quyền bán
- Thiết lập giá bán theo **nền tảng** và **biến thể sử dụng**
- Đưa sản phẩm vào trạng thái sẵn sàng xuất hiện trên marketplace

## Phạm vi màn hình liên quan

- `/me/products`
- `/me/products/:productId/general`
- `/me/products/:productId/rights-license`
- `/me/products/:productId/pricing`

## Kết quả đầu ra mong muốn

Sau khi hoàn thành luồng này:

- Artist có một sản phẩm hợp lệ trong hệ thống
- Sản phẩm có đủ dữ liệu hiển thị trên chợ
- Sản phẩm có quyền bán hợp lệ
- Sản phẩm có ít nhất một bảng giá theo nền tảng/biến thể
- Sản phẩm đủ điều kiện để được hiển thị tới người mua

## Bước 1: Vào trang Quản lý sản phẩm

**Route:** `/me/products`

Artist vào trang **Quản lý sản phẩm** để xem toàn bộ tác phẩm đã tạo và bắt đầu thêm sản phẩm mới.

### Hướng dẫn hiển thị trong UI

- Có icon giải thích tại tiêu đề trang:
  - Đây là nơi quản lý toàn bộ tác phẩm
  - Cần có audio gốc và ảnh đại diện trước khi cấu hình giá/chờ duyệt

### Tham chiếu mã nguồn

- [list.page.vue](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/pages/me-products/list.page.vue)

## Bước 2: Nhấn “Thêm sản phẩm mới”

Artist mở dialog tạo sản phẩm mới.

### Tên dialog

- `Thêm sản phẩm mới`
- Subtitle: `Điền thông tin và upload file để hoàn tất`

### Cấu trúc dialog

Dialog chia thành 2 cột chính:

- **Thông tin chung**
- **Tệp/Tài nguyên upload**

### Tham chiếu mã nguồn

- [list.page.vue:597-793](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/pages/me-products/list.page.vue#L597-L793)

## Bước 3: Điền thông tin chung

### 3.1 Tên sản phẩm

- Bắt buộc
- Hiển thị công khai trên marketplace
- Nên đặt ngắn gọn, dễ nhớ, đúng nội dung bài

**Tooltip hướng dẫn hiện có:**

- Tên sẽ hiển thị công khai trên chợ
- Nên đặt ngắn gọn, dễ nhớ và đúng nội dung
- Tên tốt giúp người mua tìm thấy nhanh hơn

### 3.2 Tác giả

- Tuỳ chọn
- Dùng khi tên tác giả khác tên artist hiển thị
- Giúp tăng độ rõ ràng cho kiểm duyệt và thông tin bản quyền

**Tooltip hướng dẫn hiện có:**

- Nếu khác với tên nghệ sĩ hiển thị, có thể điền thêm tác giả/nhạc sĩ
- Thông tin rõ ràng giúp tăng độ tin cậy và giảm rủi ro khi kiểm duyệt

### 3.3 Thể loại

- Artist chọn 1–3 thể loại phù hợp
- Dùng để buyer lọc tìm trên marketplace

**Tooltip hướng dẫn hiện có:**

- Chọn 1–3 thể loại phù hợp nhất
- Thể loại giúp người mua lọc tìm kiếm đúng loại nhạc họ cần
- Chọn đúng giúp tác phẩm xuất hiện nhiều hơn

### 3.4 Mục đích sử dụng

- Artist gắn tag use-case cho bài nhạc
- Ví dụ: quảng cáo, podcast, phim, vlog...

**Tooltip hướng dẫn hiện có:**

- Cho biết nhạc phù hợp với loại dự án nào
- Người mua thường lọc theo mục đích
- Tag đúng giúp tác phẩm tiếp cận đúng khách hàng

### 3.5 Mô tả

- Không bắt buộc nhưng rất quan trọng
- Hiển thị công khai trên marketplace
- Nên mô tả mood, BPM, nhạc cụ, bối cảnh sử dụng phù hợp

**Tooltip hướng dẫn hiện có:**

- Mô tả hiển thị công khai trên chợ
- Gợi ý nên nêu mood, nhịp độ, nhạc cụ, use-case phù hợp

## Bước 4: Upload tài nguyên sản phẩm

Phần bên phải dialog là khu upload file.

### 4.1 Ảnh đại diện

- Bắt buộc
- Dùng làm thumbnail hiển thị trên card sản phẩm ở marketplace

**Yêu cầu hiển thị trong hướng dẫn:**

- Ảnh rõ nét
- Tỷ lệ vuông 1:1
- Tối thiểu 500x500px
- Hỗ trợ PNG, JPG, WEBP

### 4.2 File audio gốc (MP3)

- Bắt buộc
- Đây là file buyer nhận được sau khi cấp phép
- Hệ thống tự đọc thời lượng từ file này sau khi artist chọn/upload MP3

**Yêu cầu hiển thị trong hướng dẫn:**

- Chỉ hỗ trợ MP3
- Đây là file âm nhạc chất lượng cao
- Hệ thống tự đọc thời lượng từ file này, artist không cần nhập tay
- Sau khi upload có thể nghe preview ngay trong form

### 4.3 Khuông nhạc PDF

- Tuỳ chọn
- Dùng như tài liệu bonus cho nhạc sĩ/producer

**Yêu cầu hiển thị trong hướng dẫn:**

- Định dạng PDF
- Dùng để người mua có thêm tài liệu biểu diễn/chơi lại/chỉnh sửa

## Bước 5: Tạo sản phẩm

Sau khi điền đủ thông tin bắt buộc:

- Tên sản phẩm
- Ảnh đại diện
- File audio gốc

artist bấm:

- `Tạo sản phẩm`

### Kết quả mong đợi

- Hệ thống tạo sản phẩm mới
- Sản phẩm xuất hiện trong danh sách `/me/products`
- Artist có thể mở trang chi tiết để hoàn thiện các bước tiếp theo

## Bước 6: Mở trang chi tiết sản phẩm — tab Tổng quan

**Route:** `/me/products/:productId/general`

Đây là nơi artist:

- Xem lại audio gốc
- Xem trạng thái sản phẩm
- Chỉnh sửa thông tin mô tả cơ bản
- Kiểm tra sản phẩm đã đủ dữ liệu hiển thị hay chưa

### Hướng dẫn hiển thị trong UI

- Có icon giải thích về:
  - Trạng thái sản phẩm
  - Bản nhạc gốc
  - Mô tả sản phẩm
  - Quyền bán
  - File khuông nhạc
  - Use-case

### Ý nghĩa thực tế của bước này

Bước này giúp artist kiểm tra rằng sản phẩm đã có:

- Dữ liệu nội dung đúng
- File và mô tả đúng
- Trạng thái sẵn sàng cho các bước pháp lý và pricing

## Bước 7: Hoàn thiện pháp lý và quyền bán

**Route:** `/me/products/:productId/rights-license`

Đây là bước then chốt để sản phẩm có thể được phép bán.

### 7.1 Khu trạng thái pháp lý

Artist xem:

- `Pháp lý`
- `Kiểm duyệt`

### Giải thích của hệ thống

- **Pháp lý:** hồ sơ có đủ hay chưa
- **Kiểm duyệt:** nội dung bài đã được đội ngũ Musica duyệt hay chưa

### 7.2 Chọn quyền bán

Artist chọn danh sách quyền mà buyer sẽ được cấp khi mua.

Ví dụ:

- Phát trực tuyến
- Dùng cho quảng cáo
- Tải về cá nhân

### Ý nghĩa của bước này

- Xác định phạm vi sử dụng hợp pháp của buyer
- Là cơ sở để tính giá theo biến thể ở bước tiếp theo

### Hướng dẫn hiển thị trong UI

- Có icon giải thích cho:
  - `Quyền & Giấy phép`
  - `Pháp lý`
  - `Kiểm duyệt`
  - `Quyền bán`

## Bước 8: Vào màn hình giá bán theo biến thể

**Route:** `/me/products/:productId/pricing`

Đây là bước artist thiết lập giá bán theo từng nền tảng và từng biến thể sử dụng.

### Tiêu đề màn hình

- `Giá bán theo biến thể`

### Giải thích chính của hệ thống

- Một bài nhạc có thể có **nhiều mức giá khác nhau**
- Giá thay đổi tuỳ:
  - nền tảng/kênh bán
  - cách buyer sử dụng bài nhạc
- Mỗi nền tảng có một bảng giá riêng
- Artist cần thiết lập giá cho ít nhất một kênh để bài có thể lên chợ

### Tham chiếu mã nguồn

- [detail.page.vue:1405-1579](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/src/pages/me-products/detail.page.vue#L1405-L1579)

## Bước 9: Thêm nền tảng bán

Artist bấm:

- `Thêm nền tảng`

### Ý nghĩa

Mỗi nền tảng là một kênh bán khác nhau để buyer tiếp cận bài nhạc.

Ví dụ:

- YouTube
- TikTok
- Các platform khác theo catalog pricing

### Giải thích hiển thị trong UI

- Nhấn vào đây để chọn thêm kênh mới
- Sau khi thêm xong, artist vào từng kênh đó để đặt giá cho từng trường hợp sử dụng

## Bước 10: Xem summary pricing

Màn hình pricing hiện các khối tổng quan:

### 10.1 Sản phẩm

- Tên bài
- Artist label
- Trạng thái `Đã cấu hình pricing` hoặc `Chưa cấu hình`

### 10.2 Platform đã join

- Số nền tảng/kênh bán đã tham gia

**Tooltip giải thích:**

- Mỗi kênh có đối tượng buyer và cách định giá khác nhau
- Càng nhiều kênh, sản phẩm càng có nhiều cơ hội tiếp cận buyer

### 10.3 Variant đã cấu hình

- Tổng số mức giá đã thiết lập trên toàn bộ platform

**Tooltip giải thích:**

- Mỗi mức giá ứng với một trường hợp sử dụng
- Mức giá chưa bật sẽ không hiện cho buyer

## Bước 11: Chọn một platform để đặt giá

Khi artist chọn một platform, phần chi tiết pricing của platform đó sẽ hiện ra.

### Hệ thống giải thích gì

- Đây là kênh bán đang được đặt giá
- Có thể xem `Công thức` nếu hệ thống có hỗ trợ
- Artist cần điền giá cho từng trường hợp sử dụng
- Trường hợp nào chưa có giá sẽ không hiển thị cho buyer

### Badge tiến độ của platform

Ví dụ:

- `3 / 5`

Ý nghĩa:

- Có 3 mức giá đã đặt xong trên tổng 5 mức có thể cấu hình
- Mức chưa điền hoặc chưa bật sẽ bị ẩn với buyer

## Bước 12: Thiết lập giá theo biến thể

Đây là bước cốt lõi của flow.

### Khái niệm “biến thể”

Một **biến thể giá** là một mức giá ứng với **một trường hợp sử dụng cụ thể**.

Ví dụ:

- Dùng cá nhân
- Podcast
- Quảng cáo thương mại
- Doanh nghiệp / thương hiệu lớn

### Artist sẽ làm gì

- Điền giá cho từng biến thể
- Bật/tắt từng biến thể
- Lưu bảng giá

### Nguyên tắc hiển thị ra chợ

- Biến thể nào:
  - chưa điền giá
  - hoặc chưa bật

=> buyer sẽ **không nhìn thấy**

### Ý nghĩa nghiệp vụ

Nhờ pricing theo biến thể:

- artist bán đúng giá theo từng tình huống sử dụng
- buyer nhìn thấy gói phù hợp với nhu cầu thật
- hệ thống linh hoạt hơn so với một mức giá cố định cho mọi use-case

## Bước 13: Hoàn tất để sản phẩm đủ điều kiện lên chợ

Sản phẩm chỉ thực sự sẵn sàng hiển thị khi artist đã hoàn thành đủ các phần:

1. Upload và tạo sản phẩm
2. Có dữ liệu hiển thị đầy đủ
3. Hồ sơ pháp lý hợp lệ
4. Chọn quyền bán
5. Thiết lập giá cho ít nhất một nền tảng và một số biến thể hợp lệ

### Kết quả kinh doanh mong đợi

- Sản phẩm có thể xuất hiện trên marketplace
- Buyer có thể xem rõ từng mức giá theo nhu cầu sử dụng
- Artist có thể tối ưu doanh thu theo từng biến thể thay vì bán một giá chung

## Tóm tắt ngắn theo dạng checklist

- Vào `/me/products`
- Bấm `Thêm sản phẩm mới`
- Điền thông tin chung
- Upload thumbnail + MP3 + PDF (nếu có)
- Tạo sản phẩm
- Vào tab `Tổng quan`
- Vào tab `Quyền & Giấy phép`
- Hoàn thiện pháp lý + chọn quyền bán
- Vào tab `Giá bán theo biến thể`
- Thêm nền tảng
- Chọn từng nền tảng
- Điền giá cho từng biến thể
- Bật các biến thể muốn bán
- Lưu cấu hình pricing
- Kiểm tra lại trạng thái sẵn sàng lên chợ

## Tài liệu liên quan

- Danh sách icon giải thích cho artist: [artist-help-icons-inventory.md](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/docs/artist-help-icons-inventory.md)
- Luồng khi nhấn nút hướng dẫn: [huong-dan-khi-nhan-nut-huong-dan-guest-va-artist.md](file:///c:/Users/USER-PC/OneDrive/Desktop/musica/musica_client/docs/huong-dan-khi-nhan-nut-huong-dan-guest-va-artist.md)
