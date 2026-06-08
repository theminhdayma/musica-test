# MusicA — Business Model & Glossary

Đọc file này TRƯỚC khi viết bất kỳ copy / label / hợp đồng nào. Hiểu sai domain → copy sai.

---

## 1. Định vị một câu

> **MusicA là nền tảng thương mại điện tử (marketplace) kết nối người mua với nghệ sĩ / nhà phát hành để giao dịch tác quyền tác phẩm âm nhạc trên môi trường số.**

Không phải:
- ❌ "Nền tảng phát hành quyền âm nhạc" (dễ làm người dùng hiểu MusicA là chủ thể phát hành quyền, sai)
- ❌ "Nền tảng nghe nhạc" (Spotify-like, KHÔNG phải mục đích)
- ❌ "Sàn nhạc số" (mơ hồ, có thể hiểu là sàn streaming)

Đúng:
- ✅ "Thương mại điện tử tác quyền âm nhạc"
- ✅ "Marketplace giao dịch tác quyền tác phẩm âm nhạc"
- ✅ "Kết nối nghệ sĩ với người mua để giao dịch tác quyền"

---

## 2. Hai bên user

### Bên Bán — Nghệ sĩ / Nhà phát hành (Publisher)
- Đăng tác phẩm lên nền tảng kèm hồ sơ pháp lý (giấy SHTT, ISRC)
- Định giá cơ bản, các biến thể giá
- Bàn giao bộ tài sản tác quyền cho người mua sau khi giao dịch xong
- Nhận tiền (MusicA giữ phí xử lý + VAT)

### Bên Mua
Người mua tác quyền để khai thác:
- **Creator / Influencer**: dùng nhạc cho YouTube, TikTok, Reels
- **SME**: TVC, video sản phẩm, podcast, livestream bán hàng
- **Đơn vị tổ chức sự kiện**: concert, gala, fanmeeting, festival
- **Brand / Agency**: chiến dịch marketing đa nền tảng

---

## 3. Sản phẩm bán trên nền tảng

**Mỗi "product" = 1 tác phẩm âm nhạc** có sẵn để giao dịch tác quyền, với các **biến thể (variants)** quyết định giá:

### Variant cấp 1 — Mục đích sử dụng (purpose)
- `youtube` — Phát hành YouTube (MV, vlog, short-form)
- `performance` — Biểu diễn trực tiếp (concert, sự kiện)
- *(tương lai)* `tvc`, `livestream`, `tiktok`,…

### Variant cấp 2 — Tham số phụ thuộc purpose

**Nếu purpose = youtube**:
- `monetize`: có / không bật kiếm tiền (× 1.5 / × 1.0)
- `duration`: 6 tháng / 12 tháng / 2 năm / 3 năm (× 0.55 / 1.0 / 1.7 / 2.3)
- `scope`: toàn cầu / Việt Nam (× 1.0 / 0.7)

**Nếu purpose = performance**:
- `scale`: Dưới 200 / 200-1000 / 1000-5000 / Trên 5000 khách (× 1.0 / 1.8 / 3.2 / 5.5)
- `shows`: số buổi (× `1 + (n-1) * 0.6`)

### Công thức giá

```
youtube_price     = base × duration_mult × monetize_mult × scope_mult
performance_price = base × scale_mult × (1 + (shows - 1) * 0.6)
```

Sau đó: `total = subtotal + 4% phí xử lý` (chưa gồm VAT).

---

## 4. Bộ tài sản tác quyền (Deliverables)

Khi mua tác quyền, nghệ sĩ phải bàn giao TỐI THIỂU:

1. File audio MP3 320kbps (master)
2. File audio WAV gốc (24-bit / 48kHz)
3. File karaoke / instrumental
4. Khuông nhạc (PDF + MusicXML)
5. Lời bài hát (LRC + plain text)
6. Stems tách bè (vocal / drums / bass / synth)
7. Giấy đăng ký SHTT bản số
8. Cover art độ phân giải cao

Danh sách định nghĩa ở `src/data/catalog.js` → `defaultDeliverables`. Khi prototype mở rộng cho phép custom per-product, mỗi product có thể có array `deliverables` riêng override default.

---

## 5. Quy trình giao dịch (User flow)

```
Khám phá ──> Chi tiết tác phẩm ──> Cấu hình variant ──> Thêm giỏ
                                                            │
                                                            ▼
                                              Xem giỏ ──> Checkout
                                                            │
              ┌─────────────────────────────────────────────┤
              ▼                                             │
   Bước 1: Thông tin bên mua                                │
              │                                             │
              ▼                                             │
   Bước 2: Hợp đồng số + ký chữ ký điện tử                 │
              │                                             │
              ▼                                             │
   Bước 3: Thanh toán (VNPay/Visa/MoMo/Bank)               │
              │                                             │
              ▼                                             │
   Success: nhận bộ tài sản + mã giao dịch ────────────────┘
```

---

## 6. Glossary tiếng Việt (BẮT BUỘC)

| Nên dùng                          | Đừng dùng                              |
|-----------------------------------|----------------------------------------|
| Giao dịch tác quyền               | Wording pháp lý cũ                     |
| Gói tác quyền / Cấu hình gói mua  | Tên gói kiểu quốc tế cũ                |
| Bộ tài sản tác quyền              | Tên file tiếng Anh cũ                  |
| Thương mại điện tử                | Wording nền tảng trung gian kiểu cũ    |
| Người mua                         | Cách gọi pháp lý trong hợp đồng        |
| Nghệ sĩ / Nhà phát hành           | Chủ sở hữu bản quyền (chỉ dùng trong văn bản pháp lý) |
| Hợp đồng tác quyền                | Tên hợp đồng kiểu cũ                   |
| Giao dịch tác quyền               | Động từ nhượng quyền kiểu cũ           |
| Tìm tác quyền                     | Từ khoá tìm kiếm tiếng Anh cũ          |
| Mã giao dịch                      | Mã giao dịch kiểu quốc tế cũ           |

**Lưu ý**: trong nội dung hợp đồng pháp lý có thể vẫn dùng các thuật ngữ chuẩn ("Bên A", "Bên B", phạm vi giao dịch) — nhưng UI marketing/copy luôn dùng nhóm bên trái.

---

## 7. Pricing & doanh thu MusicA

- **Phí xử lý**: 4% trên subtotal (hiển thị cho buyer)
- **Phí nghệ sĩ**: 12% trên giá bán cuối (deduct khi payout) — *chưa hiển thị trong prototype*
- **VAT**: 10% — *chưa tính trong prototype, sẽ thêm khi tích hợp hoá đơn*

---

## 8. Roadmap ưu tiên domain

1. ✅ MVP: discover + variant pricing + cart + contract sign + payment (prototype)
2. Auth + onboarding nghệ sĩ (đăng tác phẩm, upload deliverables)
3. Hệ thống approve/verify tác phẩm trước khi listing
4. Auto Content ID protection với YouTube (tích hợp Partner API)
5. Tranh chấp & escrow (giữ tiền cho đến khi buyer xác nhận đã nhận deliverables)
6. Tax + e-invoice (hoá đơn điện tử)
