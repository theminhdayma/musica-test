# MusicA — Architecture

Cách tổ chức code & convention. Đọc file này trước khi thêm route, store, composable mới.

---

## 1. Stack

| Layer            | Lib                            |
|------------------|--------------------------------|
| Framework        | Vue 3 (Composition API, `<script setup>`) |
| Build            | Vite 6                         |
| Routing          | vue-router 4 (web history)     |
| State            | Pinia 2                        |
| Style            | CSS thuần + design tokens (KHÔNG dùng Tailwind/SCSS) |

Lý do: prototype, giữ stack tối giản, không kéo dependency lớn (Tailwind không cần thiết khi đã có hệ token rõ ràng).

---

## 2. Layering

```
views/      ← page-level, được mount theo route
  └── component các block riêng cho page đó
components/
  ├─ layout/    ← header, footer, brand → dùng trong App.vue
  ├─ ui/        ← primitive tái sử dụng (WaveBars, CheckList, SectionHead)
  ├─ product/   ← liên quan tác phẩm (ProductCard,…)
  └─ checkout/  ← liên quan flow mua (SignaturePad,…)
composables/  ← logic không UI (useReveal, useDebounce,…)
data/         ← mock data / domain models
stores/       ← pinia stores (cart, future: user, filters)
styles/       ← main.css với token + global utility
router/       ← chỉ define routes, không chứa logic
```

**Quy tắc đặt component**:
- Dùng ở ≥ 2 nơi → đẩy lên `ui/` hoặc `product/checkout/layout/` tùy domain
- Chỉ dùng ở 1 view + ≥ 60 dòng → tách thành file riêng cùng folder views (tạo subfolder `views/_partials/HomeHero.vue` nếu cần)
- < 60 dòng và 1 nơi dùng → giữ inline

---

## 3. Naming conventions

| Đối tượng         | Convention                          | Ví dụ                       |
|-------------------|-------------------------------------|-----------------------------|
| Component file    | PascalCase                          | `ProductCard.vue`           |
| View              | PascalCase + suffix `View`          | `HomeView.vue`              |
| Composable        | `use` + camelCase                   | `useReveal`                 |
| Pinia store       | `use` + Name + `Store`              | `useCartStore`              |
| Route name        | kebab-case                          | `'product'`, `'success'`    |
| CSS class         | kebab-case, scoped trong component  | `.product-card`             |
| CSS variable      | `--c-*` (color), `--radius-*`, `--shadow-*`, `--ease-*` |     |

---

## 4. Data flow

```
data/catalog.js  ──┐
                   ├─→ views/HomeView   (filter)
                   ├─→ views/ProductView (getProduct + variant logic)
                   └─→ stores/cart      (add line items)
                            │
                            ├─→ views/CartView
                            └─→ views/CheckoutView → router.push('/success')
```

Không có backend → toàn bộ state tạm thời trong `pinia`. Khi tích hợp API:
- Tạo `services/` cho fetch logic
- Pinia store gọi service và cache result
- `data/catalog.js` chỉ giữ vai trò mock/seed

---

## 5. Routing

| Path              | Name      | View              | Ghi chú                    |
|-------------------|-----------|-------------------|----------------------------|
| `/`               | home      | HomeView          | Landing + listing          |
| `/product/:id`    | product   | ProductView       | `props: true`              |
| `/cart`           | cart      | CartView          |                            |
| `/checkout`       | checkout  | CheckoutView      | 3-step internal stepper    |
| `/success`        | success   | SuccessView       | Sau thanh toán             |

Scroll behavior: luôn về top khi đổi route (smooth).

Khi thêm route mới: vào `router/index.js`, lazy import (`() => import(...)`).

---

## 6. Business logic vị trí

| Logic                                    | Nơi đặt              |
|------------------------------------------|----------------------|
| Tính giá theo variant (purpose, scale,…) | `views/ProductView.vue` (computed `calc`) |
| Format tiền tệ (VND)                     | `data/catalog.js` (`formatVND`)           |
| Cart subtotal / fee / total              | `stores/cart.js` (getters)                |
| Reveal-on-scroll                         | `composables/useReveal.js`                |
| Variant tables (durations, scales)       | inline ở `ProductView` (đủ nhỏ)           |

Khi logic giá phức tạp hơn (multi-currency, discount engine…) → tách `services/pricing.js`.

---

## 7. CSS strategy

1. **Tokens** ở `src/styles/main.css` (`:root`) — single source of truth
2. **Utility classes** global trong cùng file (`.btn`, `.card`, `.chip`, `.eyebrow`, `.container`, `.section`)
3. **Component-scoped CSS** trong file `.vue` (`<style scoped>`) cho style riêng
4. KHÔNG dùng inline style trừ khi cần dynamic value (color động, transition delay)

Hot-path: hover lift, focus ring, transition — viết bằng utility hoặc reuse trong file scoped.

---

## 8. Performance lưu ý

- Tất cả view lazy load (`import()` trong router) → từng route < 15kb gz
- Font preconnect ở `index.html`
- WaveBars dùng inline `<span>` thay vì canvas → đủ nhẹ
- Tránh thêm dependency > 30kb gz nếu có thể inline

Build target: < 50kb gz cho `index` chunk, < 20kb gz cho mỗi view.

---

## 9. Git / branch

Khi repo đã init:
- `main`: ổn định
- `feat/*`: feature branch
- Commit message: tiếng Việt OK, format `feat: …`, `fix: …`, `chore: …`

---

## 10. Khi thêm trang mới — checklist

- [ ] Tạo file `views/XyzView.vue`
- [ ] **Template phải có DUY NHẤT 1 root element** (`<div class="xyz-view">…</div>`). Nhiều root → fragment → `<Transition mode="out-in">` ở `App.vue` bị stuck → click link đổi URL nhưng view không render (phải F5 mới ra)
- [ ] Thêm route lazy vào `router/index.js`
- [ ] Dùng `<SectionHead>` cho mỗi section
- [ ] Dùng utility class trước khi viết CSS mới
- [ ] Nếu trang có scroll-reveal, đảm bảo App.vue đang `useReveal()` (đã có)
- [ ] Mobile breakpoint < 640px hoạt động (test với DevTools / preview tool)
- [ ] Terminology: ưu tiên "tác quyền", "giao dịch tác quyền", "thương mại điện tử"; tránh wording cũ kiểu phát hành quyền
