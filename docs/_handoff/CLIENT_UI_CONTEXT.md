# Context Pack — Musica Lab Client UI

Mục tiêu của file này: giúp agent/người mới nạp context nhanh để làm tiếp UI mà không phải đọc toàn bộ repo.

## 1) Product scope (Client)
- Marketplace giao dịch tác quyền âm nhạc (client app).
- Scope hiện tại: **Buyer + Artist**.
  - Buyer: xem catalog → cấu hình mua → checkout → quản lý chứng nhận (`/me/certificates`).
  - Artist: quản lý tác phẩm của mình (`/me/products`).
- Không thuộc scope: admin dashboard (`/admin/*`) và các workflow nội bộ admin.

## 2) Tech stack & kiến trúc
- Vue 3 + Vite 6
- Pinia + Vue Router 4
- TypeScript (strict)
- SEO: Vite SSG
- Head manager: Unhead

## 3) File/Folder quan trọng
- Entry: [main.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/main.ts)
- Router: [router/index.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/router/index.ts)
- API client & contracts:
  - [contracts.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/shared/api/contracts.ts)
  - [http.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/shared/api/http.ts)
  - [errors.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/shared/api/errors.ts)
  - [mockFlags.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/shared/api/mockFlags.ts)
- Auth:
  - [auth.store.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/modules/auth/auth.store.ts)
  - [auth.api.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/modules/auth/auth.api.ts)
  - [routerGuards.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/app/routerGuards.ts)
- Pages:
  - [pages](file:///c:/Users/Admin/Desktop/musica-lab/src/pages)
  - Login: [login.page.vue](file:///c:/Users/Admin/Desktop/musica-lab/src/pages/auth/login.page.vue)
  - Buyer certificates: [certificates pages](file:///c:/Users/Admin/Desktop/musica-lab/src/pages/certificates)
  - Artist products: [me-products pages](file:///c:/Users/Admin/Desktop/musica-lab/src/pages/me-products)

## 4) API contract cần đọc trước khi làm
Nằm trong: [docs/_client-api-context](file:///c:/Users/Admin/Desktop/musica-lab/docs/_client-api-context)
- Envelope + pagination: `01_API_ENVELOPE_AND_PAGINATION.md`
- Auth login JWT: `02_AUTH_LOGIN_JWT.md`
- Catalog API desired: `03_CLIENT_API_CATALOG_DESIRED.md`
- Hybrid mocking strategy: `04_HYBRID_MOCKING_STRATEGY.md`
- Assets signed URLs: `05_ASSETS_SIGNED_URLS.md`

## 5) Conventions bắt buộc (để đồng nhất UX & an toàn)
### 5.1. Loading/Error states
- Mọi API call phải có:
  - Skeleton loading
  - Error state có requestId + retry
  - Data/Empty state
- Dùng composable: [useAsyncResource.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/shared/lib/useAsyncResource.ts)
- UI dùng chung:
  - Skeleton: [skeleton](file:///c:/Users/Admin/Desktop/musica-lab/src/shared/ui/skeleton)
  - Error: [ErrorState.vue](file:///c:/Users/Admin/Desktop/musica-lab/src/shared/ui/states/ErrorState.vue)

### 5.2. Error tracing
- Nếu lỗi là `ApiError`, luôn hiển thị `requestId` để trace (support/debug production).

### 5.3. Auth
- JWT Bearer
- Token store: in-memory; Remember me → sessionStorage
- Guard theo roles qua `route.meta.requiredRoles`

### 5.4. Security guard rails
- Không gọi `/admin/*` từ client.
- Không dùng `v-html` cho content từ API.
- Không log token/secret.

## 6) Hybrid mocking (để UI chạy trước backend)
- Nếu chưa set `VITE_API_BASE_URL`, modules tự fallback sang mock.
- Có thể bật/tắt theo env flags:
  - `VITE_USE_MOCK_PRODUCTS`
  - `VITE_USE_MOCK_PURCHASE`
  - `VITE_USE_MOCK_CERTIFICATES`
  - `VITE_USE_MOCK_ME_PRODUCTS`

## 7) OpenAPI codegen
- Script: [generate-openapi.mjs](file:///c:/Users/Admin/Desktop/musica-lab/scripts/generate-openapi.mjs)
- Chạy:

```bash
OPENAPI_URL="https://<host>/openapi.json" npm run api:generate
```

