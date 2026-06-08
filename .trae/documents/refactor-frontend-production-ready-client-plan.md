# Kế hoạch refactor frontend “production ready” (client)

## 1) Tóm tắt
- Mục tiêu: refactor prototype Vue 3 hiện tại thành frontend client production-ready, cấu trúc đơn giản, dễ tích hợp monorepo backend + đồng bộ API với OpenAPI codegen.
- Ràng buộc: giữ Vue 3 + Pinia, triển khai SEO theo hướng **Vite SPA + SSG** (pre-render routes public).
- Chuẩn UX: mọi API call có skeleton loading + error state rõ ràng; có chuẩn hoá lỗi; không “silent fail”.
- Chuẩn bảo mật: auth theo **JWT Bearer** (login trả `accessToken`), interceptor gắn `Authorization`. Token store theo hướng **In-memory + Remember (sessionStorage)** để cân bằng an toàn và trải nghiệm.
- Chuẩn API: mọi response theo envelope `@musica/contracts` (success/error + `requestId` + pagination meta); UI phải unwrap, normalize error, và hiển thị `requestId` khi báo lỗi.
- Chiến lược tích hợp backend: hybrid mocking (một số endpoint call thật ngay, phần còn lại mock theo contract để UI chạy được trước khi BE hoàn thiện).

## 2) Current state (đã kiểm tra repo)
- Stack: Vue 3 + Vite 6 + Pinia + Vue Router 4 ([package.json](file:///c:/Users/Admin/Desktop/musica-lab/package.json), [main.js](file:///c:/Users/Admin/Desktop/musica-lab/src/main.js), [router/index.js](file:///c:/Users/Admin/Desktop/musica-lab/src/router/index.js)).
- SEO hiện tại: chỉ có meta tĩnh ở [index.html](file:///c:/Users/Admin/Desktop/musica-lab/index.html); app là SPA thuần.
- Data: mock catalog ở [catalog.js](file:///c:/Users/Admin/Desktop/musica-lab/src/data/catalog.js); chưa có layer API.
- UX API: chưa có pattern loading/error; không có skeleton system.
- Auth: chưa có.
- Chất lượng dự án: chưa có TypeScript, lint/format, unit test, error boundary.

## 3) Quyết định đã chốt (từ bạn)
- SEO: **Vite SPA + SSG** (không migrate Nuxt).
- TypeScript: **Có** (recommended).
- API types: **OpenAPI codegen**.
- Auth: **JWT Bearer** theo [02_AUTH_LOGIN_JWT.md](file:///c:/Users/Admin/Desktop/musica-lab/docs/_client-api-context/02_AUTH_LOGIN_JWT.md); token store **In-memory + Remember (sessionStorage)**.
- Scope: **Buyer + Artist** (role `BUYER`, `ARTIST`), không gọi `/admin/*`.

## 4) Thiết kế mục tiêu (Target architecture)

### 4.1. Cấu trúc thư mục (đơn giản, modular)
Giữ “views/routes” rõ ràng nhưng thêm layer core để production-ready:
- `src/app/`
  - bootstrap (main), router config, app-level providers (error handler, head/seo).
- `src/pages/`
  - tổ chức theo folder theo page: `home/`, `product/`, `cart/`, `checkout/`, `success/`, `auth/`, `certificates/`, `me-products/` (mỗi folder có `index.page.vue` + components con nếu cần).
- `src/modules/`
  - theo domain: `catalog/`, `cart/`, `checkout/`, `purchases/`, `certificates/`, `me-products/`, `auth/` (mỗi module gồm `api.ts`, `types.ts`, `ui/`, `model/` nếu cần).
- `src/shared/`
  - `api/` (http client + interceptors + error normalization)
  - `ui/` (primitives + skeleton + empty/error states)
  - `lib/` (utils, formatters, guards)
  - `types/` (types chung)
- `src/assets/` (bundle assets) + `public/` (static direct)

Mục tiêu: code business không “rải” ở view; view chỉ orchestration UI + gọi module/composables.

### 4.2. SEO/SSG cho routes public
Chọn chiến lược SSG cho các route public (SEO-critical):
- Pre-render: `/`, `/product/:id` (danh sách id từ catalog/API build-time), và có thể `/cart`, `/checkout` để cải thiện perceived performance (SEO không critical).
- Head/meta theo route (title/description/canonical/og) bằng head manager.
- Sinh `sitemap.xml` và `robots.txt` trong build.

### 4.3. Image optimization
- Quy chuẩn ảnh local: ưu tiên WebP/AVIF (nếu có), lazy-load, `decoding="async"`, size attribute để giảm CLS.
- Quy chuẩn ảnh remote (thumbnail/playback/certificate): ưu tiên lấy **signed URL** theo contract (ví dụ `/products/:id/thumbnail-url`, `/me/certificates/:id/download`) thay vì hardcode direct URL.
- Tách component `OptimizedImage` để thống nhất lazy/error fallback, placeholder, aspect-ratio.

### 4.4. API layer + error handling
- Một HTTP client thống nhất (fetch-based để giữ dependency tối thiểu):
  - baseURL từ `VITE_API_BASE_URL`
  - request interceptor:
    - gắn `Authorization: Bearer <accessToken>` nếu có
    - gắn `x-request-id` (optional, generate phía client)
  - response handler:
    - unwrap envelope success (`success: true`) trả về `data`
    - normalize error envelope (`success: false`) thành `ApiError` (kèm `requestId`, `statusCode`, `code`, `message`, `details`)
    - list endpoints đọc `meta.pagination`
  - typed client sinh từ OpenAPI (generate types) và wrapper functions trả `data` đã unwrap.
- Chuẩn hoá lỗi:
  - `ApiError` (HTTP) vs `NetworkError` vs `ValidationError` vs `UnknownError`
  - mapping sang UI states: `loading | success | empty | error`
- Guard rails:
  - client app không được gọi `/admin/*` (enforce bằng allowlist path prefix trong api client khi build production).
- Hybrid mocking:
  - adapter switch mock/real theo env flags: `VITE_USE_MOCK_PRODUCTS`, `VITE_USE_MOCK_PURCHASE`, …

### 4.5. Auth an toàn (theo spec backend)
Triển khai auth theo contract hiện có:
- Login: `POST /auth/login` nhận `{ accessToken, expiresInSeconds, user, roles }` (envelope) theo [02_AUTH_LOGIN_JWT.md](file:///c:/Users/Admin/Desktop/musica-lab/docs/_client-api-context/02_AUTH_LOGIN_JWT.md).
- Token store:
  - Mặc định lưu **in-memory** (Pinia/module singleton).
  - Nếu bật “Remember me” thì persist vào **sessionStorage** (không dùng localStorage).
- Lưu ý bảo mật quan trọng (để “vừa an toàn vừa lưu đăng nhập”):
  - Cách an toàn nhất để “nhớ đăng nhập” là **backend cấp refresh token / session qua httpOnly Secure cookie** (JS không đọc được) + endpoint refresh/rotate.
  - Nếu backend chỉ trả về `accessToken` như hiện tại, mọi cách persist token trong JS storage (sessionStorage/localStorage) đều có rủi ro bị lấy khi có XSS; sessionStorage chỉ giảm “thời gian phơi nhiễm” chứ không triệt tiêu.
  - Vì vậy plan sẽ đi theo 2 tầng:
    - Tier A (implement ngay, không đòi BE đổi): in-memory + sessionStorage (Remember me), kèm hardening FE (giảm nguy cơ XSS).
    - Tier B (production-grade “remember me” đúng nghĩa): phối hợp BE bổ sung refresh token cookie + refresh flow, rồi FE chuyển sang “access token in-memory” + “refresh cookie”.
- Router guards:
  - `route.meta.requiresAuth: true`
  - `route.meta.requiredRoles?: ('BUYER'|'ARTIST'|'ADMIN'|...)[]`
  - 401: đưa về login + clear token (vì hiện chưa có refresh endpoint).
  - 403: hiển thị forbidden state (kèm requestId).
- Interceptor:
  - attach Authorization khi có token
  - tuyệt đối không log token/secret

### 4.6. UX chuẩn: skeleton/loading & error rõ ràng
- `useAsyncResource` composable: chạy request, expose `status`, `data`, `error`, `reload`.
- Bộ UI state chuẩn:
  - `Skeleton*` components (list/card/text)
  - `ErrorState` component (message + retry)
  - `EmptyState` component (no-data)
- Quy ước: page nào gọi API cũng phải có 3 state: skeleton → data → error (và empty nếu cần).

### 4.7. Validation
- Runtime validation ở boundary:
  - Form (buyer info) validate trước submit
  - Parse response quan trọng nếu backend không đảm bảo (optional)
- Ưu tiên schema-based (Zod hoặc tương đương) để dễ reuse + test.

## 5) Thay đổi cụ thể theo file/module (đủ chi tiết để implement)

### 5.1. TypeScript migration (incremental, ưu tiên core trước)
- Thêm: `tsconfig.json`, `env.d.ts`/`vite-env.d.ts`, cấu hình TS cho Vue SFC.
- Đổi entry/router/store/core sang TS:
  - `src/main.js` → `src/main.ts`
  - `src/router/index.js` → `src/router/index.ts` (hoặc chuyển vào `src/app/router.ts`)
  - `src/stores/cart.js` → `src/modules/cart/model/cart.store.ts`
- Quy tắc: migrate theo lớp (core → modules → pages) để không đứt build.

### 5.2. SEO/Head/SSG
- Thêm head manager + chuẩn hoá meta theo route:
  - `src/app/seo/` (helpers tạo title/description/og/canonical)
- Thêm SSG:
  - thay entry để hỗ trợ SSG build
  - build step generate pre-render cho route public
- Sinh:
  - `public/robots.txt`
  - `sitemap.xml` build-time (script)

### 5.3. API contract (OpenAPI codegen)
- Thêm script:
  - `npm run api:generate` kéo OpenAPI schema (URL/file) → generate types/client vào `src/shared/api/generated/`
- Tạo `src/shared/api/http.ts`:
  - instance + interceptors
  - error normalization
- Tạo module API wrappers:
  - `src/modules/catalog/api.ts`: `listProducts`, `getProduct`, `getProductThumbnailUrl?`, `getProductPlaybackUrl?`
  - `src/modules/checkout/api.ts`: `quote` (POST `/checkout/quote`) — pricing canonical ở backend theo [03_CLIENT_API_CATALOG_DESIRED.md](file:///c:/Users/Admin/Desktop/musica-lab/docs/_client-api-context/03_CLIENT_API_CATALOG_DESIRED.md)
  - `src/modules/purchases/api.ts`: `purchase` (POST `/purchases`)
  - `src/modules/certificates/api.ts`: `listMyCertificates`, `getCertificateDetail`, `getCertificateDownloadUrl`
  - `src/modules/me-products/api.ts`: `listMyProducts`, `getMyProductDetail`
  - `src/modules/system/api.ts`: `health` (GET `/health`, call thật)
  - Tất cả wrappers có mock adapter theo [04_HYBRID_MOCKING_STRATEGY.md](file:///c:/Users/Admin/Desktop/musica-lab/docs/_client-api-context/04_HYBRID_MOCKING_STRATEGY.md)

### 5.4. Auth scaffold
- `src/modules/auth/`
  - `auth.provider.ts` (interface)
  - `jwt.provider.ts` (JWT Bearer + token store in-memory/sessionStorage)
  - `auth.api.ts` gọi `POST /auth/login`
  - `auth.client.ts` (wiring với http interceptors)
- Hardening (để giảm XSS exposure khi token nằm trong JS runtime):
  - chặn các chỗ render HTML không tin cậy (không dùng `v-html` cho content từ API)
  - chuẩn hoá sanitize/escape ở các component hiển thị text từ API
  - bật CSP ở mức deploy (mục “triển khai” sẽ bổ sung sau khi biết môi trường hosting)
- Router:
  - thêm meta `requiresAuth` + `requiredRoles` theo scope Buyer/Artist
  - thêm route pages tối thiểu: `/login`, `/me/certificates`, `/me/certificates/:id`, `/me/products`, `/me/products/:id`

### 5.5. UX skeleton & error states
- `src/shared/ui/skeleton/` (SkeletonText/Card/List)
- `src/shared/ui/states/` (ErrorState/EmptyState)
- `src/shared/lib/useAsyncResource.ts`
- Áp dụng vào pages:
  - Home/Product: skeleton list/card khi load `/products` và `/products/:id`
  - Product: skeleton cho signed URL của thumbnail/playback (nếu bật)
  - Checkout: skeleton cho `quote` và `purchase`
  - Certificates & MeProducts: skeleton list/detail; error state có requestId + retry

### 5.6. Image optimization
- `src/shared/ui/OptimizedImage.vue`
- Chuẩn hoá nơi dùng cover:
  - `ProductCard.vue`, `ProductView.vue` chuyển sang `OptimizedImage`
- Nếu cover là remote:
  - ưu tiên flow signed URL (`GET /products/:id/thumbnail-url`) theo [05_ASSETS_SIGNED_URLS.md](file:///c:/Users/Admin/Desktop/musica-lab/docs/_client-api-context/05_ASSETS_SIGNED_URLS.md)
  - fallback về `thumbnailUrl` direct (nếu server trả sẵn) hoặc placeholder

### 5.7. Chất lượng dự án (defer để tăng tốc build)
- Tạm **không thêm ESLint/Prettier/typecheck scripts** trong phase refactor đầu để giảm thời gian CI/build và giảm nhiễu khi migrate TS.
- Vẫn giữ “production safety” theo hướng runtime:
  - error normalization + error UI chuẩn hoá
  - app-level error handling: `app.config.errorHandler`, `router.onError`
- Unit tests (Vitest) để ở phase sau (khi bạn yêu cầu ổn định chất lượng), ưu tiên viết test cho:
  - pricing/quote mapping
  - cart totals/fee rounding
  - error normalization mapping

## 6) Assumptions (để không bị block)
- Backend sẽ cung cấp OpenAPI endpoint/schema file để generate.
- Hiện chưa có refresh token endpoint; 401 sẽ logout và yêu cầu login lại.
- Các route SEO-critical: home + product detail là chính; các trang “me/*” không cần SEO.

## 7) Verification / Acceptance criteria
- Build chạy: `npm run build` thành công, không TS errors.
- SSG output có HTML pre-render cho `/` và ít nhất 1 `/product/:id` mẫu.
- Meta tags theo route (title/description/og) đúng khi mở file HTML đã pre-render.
- API call demo (tạm mock hoặc endpoint thật sau) có skeleton + error UI + retry.
- Không lưu token vào localStorage trong default mode; auth provider có thể swap qua cấu hình.
- Nếu backend bổ sung refresh-cookie: verify “Remember me” hoạt động qua việc đóng/mở lại browser mà không lộ token trong JS storage.
- Error handling app-level hoạt động: route error + API error đều ra UI state rõ ràng (kèm requestId).

## 8) Thông tin còn cần từ bạn (khi bạn “nạp context backend”)
- URL OpenAPI schema (dev/staging) + cách access (public hay cần token).
- Policy playback URL: public hay require login (BUYER).
- Danh sách route nào là public SEO, route nào yêu cầu auth/role.
- Roadmap auth: backend có thể bổ sung `/auth/refresh` + httpOnly cookie (refresh token) không? Nếu có, mình sẽ cập nhật plan implementation để đạt “remember me” an toàn.
