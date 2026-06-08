# Musica Lab — Client Frontend

Frontend client cho marketplace giao dịch tác quyền âm nhạc. Repo này được refactor theo hướng production-ready: cấu trúc đơn giản, tách module/domain, hỗ trợ SEO bằng SSG, và sẵn sàng đồng bộ API từ monorepo backend.

## Tech Stack
- Vue 3
- Vite 6
- Pinia (state)
- Vue Router 4
- Vite SSG (SSG cho SEO)
- Unhead (quản lý meta/head)
- TypeScript (strict)

## Project Structure
- `src/main.ts`: entrypoint (Vite SSG) + wiring Pinia/router/auth + interceptors
- `src/router/index.ts`: routes + meta `requiresAuth`/`requiredRoles`
- `src/pages/`: page-level theo folder
  - `home/`, `product/`, `cart/`, `checkout/`, `success/`
  - `auth/` (login)
  - `certificates/` (BUYER)
  - `me-products/` (ARTIST)
- `src/modules/`: domain modules (API/types/model/ui theo domain)
  - `catalog/`, `checkout/`, `purchases/`, `certificates/`, `me-products/`, `auth/`
- `src/shared/`:
  - `api/`: HTTP client + error normalization + mock flags + contracts
  - `lib/`: composables/utils dùng chung
  - `ui/`: primitives + skeleton + error/empty states
- `docs/_client-api-context/`: contract API (envelope/auth/pagination/signed URLs/hybrid mocking)
- `docs/_handoff/`: context pack dùng để handoff cho agent/người mới

## API Contract & Data Conventions
### Response envelope
Mọi API response follow chuẩn envelope `success/data/meta/requestId/timestamp` theo `docs/_client-api-context/01_API_ENVELOPE_AND_PAGINATION.md`.

### Error handling
- Tất cả lỗi HTTP/API được normalize về `ApiError` và luôn giữ `requestId` để trace.
- UI hiển thị `requestId` trong error state để support debug production.

### Hybrid mocking
Mặc định nếu chưa set `VITE_API_BASE_URL` thì app sẽ tự mock một phần dữ liệu để UI chạy được.
- Flags: `VITE_USE_MOCK_PRODUCTS`, `VITE_USE_MOCK_PURCHASE`, `VITE_USE_MOCK_CERTIFICATES`, `VITE_USE_MOCK_ME_PRODUCTS`
- File: `src/shared/api/mockFlags.ts`

## Auth & Security
- Auth theo JWT Bearer (login trả `accessToken`) theo `docs/_client-api-context/02_AUTH_LOGIN_JWT.md`
- Token storage:
  - In-memory (mặc định)
  - Remember me: sessionStorage (không dùng localStorage)
- Route guarding:
  - `meta.requiresAuth: true`
  - `meta.requiredRoles: ['BUYER'|'ARTIST'|...]`
- Lưu ý: “remember me” an toàn tuyệt đối cần backend hỗ trợ refresh-token/httpOnly cookie. Hiện FE đang theo Tier A.

## SEO / SSG
- Dùng Vite SSG để pre-render:
  - `/`
  - `/product/<id>` (lấy id từ mock catalog hiện tại; khi nối backend sẽ chuyển sang fetch build-time hoặc snapshot build artifact)
- Meta/head quản lý qua Unhead trong từng page.

## UX Conventions (bắt buộc)
- Mọi API call phải có 3 state:
  - Skeleton loading
  - Error state (hiển thị requestId + Retry)
  - Data/Empty state
- Composable chuẩn: `src/shared/lib/useAsyncResource.ts`
- UI chuẩn:
  - Skeleton: `src/shared/ui/skeleton/*`
  - ErrorState: `src/shared/ui/states/ErrorState.vue`

## OpenAPI types
Generate types từ OpenAPI schema:

```bash
OPENAPI_URL="https://<your-domain>/openapi.json" npm run api:generate
```

Output:
- `src/shared/api/generated/openapi.d.ts`

## Scripts
- `npm run dev`: dev server
- `npm run build`: build SPA
- `npm run build:ssg`: build SSG (SEO)
- `npm run api:generate`: generate OpenAPI types

## Code Conventions
- Không dùng `v-html` với content từ API.
- Không log token/secret.
- Không gọi `/admin/*` từ client app.
- Ưu tiên đặt logic gọi API ở `src/modules/<domain>/api.ts`, không đặt trực tiếp trong `views/`.
- Page nên chỉ orchestration: gọi module/composable, render state, không nhồi business logic.

