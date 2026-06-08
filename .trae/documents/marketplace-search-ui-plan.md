# Plan — UI/UX Marketplace Search (/market)

## 1) Summary
- Mục tiêu: thiết kế + triển khai UI/UX cho trang Marketplace tìm kiếm theo contract client API (mock-first), đảm bảo skeleton loading + error state (kèm requestId) + empty state.
- Phân kỳ theo yêu cầu:
  - Phase 1: UI/UX trước (mock data), bạn & mình review/fix UI bugs.
  - Phase 2: Mock API dần theo đúng contract (envelope/pagination/uuid), sau đó switch sang call thật khi BE sẵn sàng (hybrid).

## 2) Current State Analysis (grounded)
- Router hiện chưa có `/market`: [router/index.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/router/index.ts#L3-L14)
- Home hiện đã có ô search, nhưng filter chạy local trong HomeView (mock data): [HomeView.vue](file:///c:/Users/Admin/Desktop/musica-lab/src/views/HomeView.vue#L9-L19)
- API layer đã có `listProducts({ page, pageSize, q, genre })` mock-first (fallback khi thiếu `VITE_API_BASE_URL`): [modules/catalog/api.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/modules/catalog/api.ts)
- UI conventions cho async states đã có:
  - `useAsyncResource`: [useAsyncResource.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/shared/lib/useAsyncResource.ts)
  - Skeleton: [SkeletonCard.vue](file:///c:/Users/Admin/Desktop/musica-lab/src/shared/ui/skeleton/SkeletonCard.vue)
  - ErrorState: [ErrorState.vue](file:///c:/Users/Admin/Desktop/musica-lab/src/shared/ui/states/ErrorState.vue)
- Design tokens/utilities: [main.css](file:///c:/Users/Admin/Desktop/musica-lab/src/styles/main.css#L1-L120)
- Contract API marketplace:
  - `GET /products` hỗ trợ `q`, `genre`, pagination meta: [03_CLIENT_API_CATALOG_DESIRED.md](file:///c:/Users/Admin/Desktop/musica-lab/docs/_client-api-context/03_CLIENT_API_CATALOG_DESIRED.md#L14-L30)
  - Envelope/pagination: [01_API_ENVELOPE_AND_PAGINATION.md](file:///c:/Users/Admin/Desktop/musica-lab/docs/_client-api-context/01_API_ENVELOPE_AND_PAGINATION.md)
  - Hybrid mocking: [04_HYBRID_MOCKING_STRATEGY.md](file:///c:/Users/Admin/Desktop/musica-lab/docs/_client-api-context/04_HYBRID_MOCKING_STRATEGY.md)

## 3) Decisions (đã chốt)
- Route: `/market`
- Listing: pagination (theo `meta.pagination`)
- Filters MVP: Search (`q`) + Genre (`genre`)
- UX home search: Enter ở ô search trang Home sẽ navigate sang `/market?q=...`
- Data: mock trước (không block backend)

## 4) Scope
### In-scope
- Tạo page `/market` (UI + UX) theo conventions skeleton/error/empty.
- Đồng bộ query params (URL state) để back/forward/share link hoạt động.
- Tối ưu trải nghiệm: loading skeleton, retry rõ ràng, empty state có hướng dẫn.
- Head/meta cho SEO (title/description) và đảm bảo SSG include `/market`.

### Out-of-scope (phase sau)
- Sort nâng cao (popular/new/price) vì API chưa có.
- Infinite scroll.
- Playback player hoàn chỉnh (chỉ placeholder nếu cần).

## 5) Proposed Changes (phased, decision-complete)

### Phase 1 — UI/UX trước (mock data)
Mục tiêu: có `/market` chạy ổn định, đẹp, đúng UX conventions; sau đó bạn review và mình fix nhanh.

**(A) Routing + SSG**
- Cập nhật [router/index.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/router/index.ts) thêm route:
  - `{ path: '/market', name: 'market', component: () => import('../pages/market/index.page.vue') }`
- Cập nhật [vite.config.js](file:///c:/Users/Admin/Desktop/musica-lab/vite.config.js) để `/market` nằm trong SSG included routes (static).
- Cập nhật [public/sitemap.xml](file:///c:/Users/Admin/Desktop/musica-lab/public/sitemap.xml) thêm `/market` (tối thiểu).

**(B) Tạo page + components**
- Tạo folder: `src/pages/market/`
  - `index.page.vue` (page orchestrator)
  - `components/MarketSearchBar.vue`
  - `components/GenreFilter.vue`
  - `components/ProductGrid.vue`
  - `components/PaginationControls.vue`
  - `components/MarketProductCard.vue` (nếu không reuse được [ProductCard.vue](file:///c:/Users/Admin/Desktop/musica-lab/src/components/product/ProductCard.vue))

**(C) URL state (query params)**
- Source of truth:
  - `q?: string`, `genre?: string`, `page?: number`, `pageSize?: number`
- Quy tắc:
  - Search/genre change: reset `page=1`
  - Pagination click: giữ `q/genre`, chỉ đổi `page`
  - Update URL bằng `router.replace()` cho filter (tránh spam history), và `router.push()` cho pagination (để back/forward tốt)

**(D) Data flow**
- `index.page.vue` dùng:
  - `useAsyncResource(() => listProducts({ page, pageSize, q, genre }))`
  - UI states:
    - loading/idle → render `SkeletonCard` list
    - error → `ErrorState` (show requestId nếu `ApiError`) + retry
    - success + empty → Empty card
    - success + data → grid + pagination

**(E) Genre options**
- Phase 1 lấy genre options từ mock categories: [catalog.js](file:///c:/Users/Admin/Desktop/musica-lab/src/data/catalog.js#L3-L12)
  - Map `{ id, label }` sang `genre` query (id trừ `all`)

**(F) Home → Market navigation**
- Cập nhật [HomeView.vue](file:///c:/Users/Admin/Desktop/musica-lab/src/views/HomeView.vue) form search:
  - Khi Enter/bấm submit: `router.push({ name: 'market', query: { q: search } })`
  - Home có thể vẫn giữ “featured listing” (lọc local) hoặc bỏ listing ở Home (tuỳ review sau). Phase 1 chỉ đảm bảo navigation hoạt động.

**(G) SEO/meta**
- `src/pages/market/index.page.vue` dùng `useHead`:
  - title: “Marketplace tác quyền — MusicA”
  - description: “Tìm tác phẩm theo nghệ sĩ/thể loại và cấu hình gói tác quyền…”

**Acceptance criteria (Phase 1)**
- `/market` load được (mock) và có skeleton → data/empty → error (retry).
- Search + genre + pagination cập nhật URL đúng và fetch theo URL.
- Home search Enter chuyển sang `/market?q=...`.

### Phase 2 — Mock API dần đúng contract + chuẩn bị switch sang BE thật
Mục tiêu: đảm bảo mock data “không lạc đường” so với contract, và có thể bật call thật theo hybrid strategy.

**(A) Chuẩn hoá mock output theo contract**
- Contract yêu cầu:
  - `productId` là UUID string (mock spec): [04_HYBRID_MOCKING_STRATEGY.md](file:///c:/Users/Admin/Desktop/musica-lab/docs/_client-api-context/04_HYBRID_MOCKING_STRATEGY.md#L18-L24)
- Hiện mock catalog `products[].id` đang là `song-01`…: [catalog.js](file:///c:/Users/Admin/Desktop/musica-lab/src/data/catalog.js#L34-L40)
- Phương án:
  - Không đổi source mock catalog ngay (để không phá các views cũ), mà chỉnh adapter trong [modules/catalog/api.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/modules/catalog/api.ts) để trả ra `id` dạng UUID “stable” (mapping table cố định trong module).
  - Đảm bảo `productCode` format `PROD-000001` (đã có mapping trong module).
  - Luôn trả `meta.pagination` đúng định dạng.

**(B) Error mocking (đúng envelope)**
- Khi mock error (vd invalid page) phải trả `ApiErrorResponse` (code/message/requestId) để UI test error state thực tế.

**(C) Hybrid switch**
- Đảm bảo `/market` chỉ gọi `listProducts` wrapper; wrapper tự chọn mock/real theo:
  - `VITE_API_BASE_URL` có/không
  - `VITE_USE_MOCK_PRODUCTS`

**Acceptance criteria (Phase 2)**
- UI `/market` không thay đổi nhưng mock output đã match contract.
- Bật `VITE_API_BASE_URL` và tắt `VITE_USE_MOCK_PRODUCTS` thì `/market` call thật.

## 6) Edge cases & failure modes
- Query param sai kiểu: `page=abc` → normalize về `1`.
- User đổi filter liên tục: ưu tiên không crash UI; Phase 1 dùng “last write wins”, Phase 2 có thể nâng `useAsyncResource` hỗ trợ AbortController nếu cần.
- Empty state:
  - q có giá trị nhưng không có items → gợi ý “thử từ khoá khác / bỏ lọc thể loại”.

## 7) Verification (manual)
- Dev:
  - Vào `/market` xem skeleton + data.
  - Search theo artist/title, đổi genre, chuyển trang.
  - Bật/tắt mock flags để đảm bảo không đổi UI.
- SSG:
  - `npm run build:ssg` đảm bảo route `/market` được generate.

