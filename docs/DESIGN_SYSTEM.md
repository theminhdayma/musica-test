# MusicA — Design System

Tài liệu chuẩn hoá ngôn ngữ thiết kế. Mọi feature mới phải tuân theo file này trước khi viết CSS riêng.

---

## 1. Brand & Tông màu

Định vị: **sàn marketplace âm nhạc cao cấp**, cảm giác trustworthy + công nghệ + sáng. Tông trắng chủ đạo, gradient blue→teal làm điểm nhấn cho mọi yếu tố quan trọng.

| Token              | Hex       | Vai trò                                               |
|--------------------|-----------|-------------------------------------------------------|
| `--c-bg`           | `#ffffff` | Nền page                                              |
| `--c-bg-soft`      | `#f6f9fc` | Nền nhẹ (panel, input)                                |
| `--c-bg-mute`      | `#eef4fa` | Nền nhạt hơn (chip non-active)                        |
| `--c-surface`      | `#ffffff` | Bề mặt card / surface                                 |
| `--c-border`       | `#e3edf6` | Viền card / divider                                   |
| `--c-border-strong`| `#cfdfee` | Viền hover / focus state                              |
| `--c-text`         | `#0c1e33` | Text chính                                            |
| `--c-text-soft`    | `#455a73` | Text phụ                                              |
| `--c-text-mute`    | `#7c8da3` | Caption, label                                        |
| `--c-ink`          | `#0c1e33` | Nền tối cho CTA (không dùng hex hardcode)             |
| `--c-blue-500/600/700` | `#1f6df0` / `#1456cf` / `#0e3fa0` | Primary blue ramp        |
| `--c-blue-50/100`  | `#eaf3ff` / `#d3e6ff` | Tints (badge, tag)                          |
| `--c-teal-500/600` | `#14b8a6` / `#0e9489` | Accent teal                                 |
| `--c-teal-50`      | `#e6fbf6` | Tint cho success / accent badge                       |

**Gradient brand** (`--grad-brand`):
```
linear-gradient(135deg, #1f6df0 0%, #2aa7d8 55%, #14b8a6 100%)
```
Áp cho: button primary, logo accent, price tag total, lc-status, cta hero.

**Gradient hero** (`--grad-hero`):
```
radial-gradient(1200px 600px at 80% -10%, rgba(20,184,166,0.18), transparent 60%),
radial-gradient(900px 500px at 10% 0%, rgba(31,109,240,0.18), transparent 60%),
linear-gradient(180deg, #f5fbff 0%, #ffffff 100%)
```

**Gradient CTA** (`--grad-cta`):
```
linear-gradient(135deg, var(--c-ink) 0%, var(--c-blue-700) 62%, var(--c-teal-500) 140%)
```
Áp cho: CTA dark section (pricing/upgrade), banner full-width.

---

## 2. Typography

- Font: `'Plus Jakarta Sans'` (web), fallback `Inter, system-ui`
- Heading 1: `clamp(28px, 4vw, 44px)`, weight 800, letter-spacing `-0.02em`
- Heading 2: `clamp(22px, 2.8vw, 32px)`
- Heading 3: 15.5–17px
- Body: 14–14.5px, line-height 1.65 cho đoạn dài
- Caption / eyebrow: 11–12px, uppercase, letter-spacing `0.08em`, weight 700
- Số tiền / counter: thêm `font-variant-numeric: tabular-nums`

---

## 3. Spacing / Radius / Shadow

| Token          | Giá trị                | Dùng cho                                 |
|----------------|------------------------|------------------------------------------|
| `--radius-xs`  | 8px                    | Tiny pills, badges                       |
| `--radius-sm`  | 12px                   | Input, inner blocks                      |
| `--radius-md`  | 16px                   | Cards thường, ptile, scale-row           |
| `--radius-lg`  | 22px                   | **Default cho mọi card chính**           |
| `--radius-xl`  | 28px                   | Config card, CTA section                 |
| `--radius-full`| 999px                  | Button, chip, segmented, badge          |
| `--shadow-xs`  | nhỏ                    | Border-shadow phân tách                  |
| `--shadow-sm`  | nhẹ                    | Hover cards                              |
| `--shadow-md`  | trung                  | Player card, config card, summary sticky |
| `--shadow-lg`  | lớn                    | Card tác quyền floating, CTA             |
| `--shadow-glow`| teal glow              | Button primary, play FAB                 |

Section padding mặc định: `88px 0` (desktop), `56px 0` (mobile).

---

## 4. Primitive components (tái sử dụng — KHÔNG viết lại)

### `<WaveBars>` — `components/ui/WaveBars.vue`
Hiển thị thanh sóng âm gọn. **Đây là cách DUY NHẤT để hiển thị waveform** trong UI.

Props:
- `peaks` *(Array)* – mảng 0..1 (nếu không truyền sẽ generate seed)
- `bars` *(Number=28)* – số bar khi không có peaks
- `size` *(`'xs'|'sm'|'md'|'lg'` = 'sm')* – chiều cao 14/22/36/56 px
- `variant` *(`'solid'|'translucent'|'muted'` = 'solid')* – màu bar
- `progress` *(Number)* – % đã played để đổi màu
- `animate` / `animateOnHover` *(Boolean)* – equalizer animation

Quy tắc:
- Trong product card cover: `size="xs"`, `variant="translucent"`
- Trong player card: `size="sm"`, `variant="muted"` + `progress` binding
- Trong widget hero: `size="xs"`, `variant="solid"`, `animate`

### `<CheckList>` — `components/ui/CheckList.vue`
Danh sách items với tick xanh.

Props:
- `items` *(Array)* – `string` hoặc `{ label, hint }`

Dùng để liệt kê deliverables, benefits hợp đồng, etc.

### `<SectionHead>` — `components/ui/SectionHead.vue`
Header section chuẩn (eyebrow + h2 + description + slot actions).

Props: `eyebrow, title, description, align: 'left'|'center'`. Slot `actions`.

---

## 5. Utility classes (global ở `styles/main.css`)

| Class            | Mô tả                                                      |
|------------------|------------------------------------------------------------|
| `.container`     | Max-width 1200px + padding ngang                           |
| `.eyebrow`       | Pill teal nhỏ uppercase                                    |
| `.gradient-text` | Áp gradient brand vào text                                 |
| `.btn` + `.btn-primary` / `.btn-ghost` / `.btn-soft`        | Button base + variants  |
| `.btn-sm` / `.btn-lg` | Kích thước                                            |
| `.card`          | Card chuẩn (border + radius-lg + hover lift)               |
| `.chip` / `.chip.is-active` | Filter chip                                     |
| `.section` / `.section-tight` | Padding section                                |
| `.reveal` + `is-visible` | Animation reveal-on-scroll (cần `useReveal()` ở App.vue) |

**Quy tắc**: nếu cần style mới, ưu tiên tổ hợp các utility/token có sẵn. Chỉ viết CSS mới khi không có lựa chọn nào fit.

---

## 6. Animation guidelines

- **Easing**: dùng `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`) cho enter; `--ease-in-out` cho loop.
- **Duration**: 200–350ms cho micro-interaction; 600–900ms cho reveal.
- **Reveal-on-scroll**: thêm class `reveal` lên element, IntersectionObserver tự xử lý.
- **Hover lift cards**: `transform: translateY(-4px); box-shadow: var(--shadow-md);`
- **Pulse ring** (`@keyframes pulseRing`): cho live dot, badge xác minh, play FAB.
- **Equalizer** (`@keyframes wb-eq`): chỉ trong `<WaveBars>`.
- Page transitions ở App.vue: `name="page"` mode `out-in`.

Tránh: animation > 1s, parallax phức tạp, blur transitions trên Safari mobile.

---

## 6.1 Landing page (Home) guidelines

- 1 CTA chính xuyên suốt: cùng wording + cùng hierarchy (primary/ghost).
- Hero phải có: eyebrow + H1 + mô tả 1–2 câu + CTA/search pattern + trust line (3 cam kết ngắn).
- Section header: chỉ dùng `<SectionHead>` (không tự viết `.section-head` lại trong page).
- Bullet benefits: dùng `<CheckList>` (đảm bảo spacing và nhịp đọc).
- FAQ: ưu tiên `<details>/<summary>` native (a11y tốt), style tối giản theo token.

---

## 7. Iconography

- Inline SVG, stroke-based, `stroke-width="2"`, `linecap="round"`.
- Size mặc định: 18px trong button, 14–16px trong badge.
- Không dùng font icon library — giảm bundle.

---

## 8. Responsive breakpoints (tham khảo)

| Breakpoint      | Mục tiêu                                          |
|-----------------|---------------------------------------------------|
| ≥ 1024px        | 4-col product grid, 2-col hero, full nav          |
| 760–1023px      | 3-col grid, header co lại                         |
| 640–759px       | 2-col grid                                        |
| ≤ 639px         | 1-col, header chỉ icon + primary CTA              |

Mobile-first không bắt buộc — đa số style viết desktop, override mobile bằng `@media (max-width: …)`.

---

## 9. Bộ ví dụ "đúng / sai"

✅ Đúng:
```vue
<button class="btn btn-primary">Mua tác quyền</button>
<WaveBars :peaks="peaks" size="xs" variant="translucent" />
```

❌ Sai:
```vue
<button style="background:#1f6df0; padding:12px 22px; border-radius:9999px; color:#fff">Mua</button>
<!-- Tự viết SVG waveform inline với 24 <span> -->
```

❌ Sai:
- Tự đặt màu hex hardcode khi đã có `--c-blue-*`
- Thêm font khác (Roboto, Open Sans…) — toàn site chỉ Plus Jakarta Sans
- Dùng wording cũ mang nghĩa nhượng quyền pháp lý trong copy — phải thay bằng "tác quyền" hoặc "giao dịch tác quyền"
