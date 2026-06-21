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
  - `api/`: HTTP client + error normalization + envelope contracts
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

### Auth integration
- FE bám envelope backend `{ success, statusCode, data, requestId, timestamp }`.
- Auth endpoints đang nối trực tiếp vào:
  - `POST /client/auth/otp/request`
  - `POST /client/auth/otp/verify`
  - `POST /client/auth/register/buyer`
  - `POST /client/auth/register/artist`
  - `POST /client/auth/login`
  - `POST /client/auth/login/google`
  - `POST /client/auth/forgot-password/request`
  - `POST /client/auth/forgot-password/confirm`
  - `GET /me`
- Sau mọi login/register thành công, store sẽ hydrate `GET /me`.
- Forgot-password flow hiện chạy theo 2 bước:
  - `POST /client/auth/otp/verify` trả `verificationToken`
  - `POST /client/auth/forgot-password/confirm` dùng `verificationToken` để đặt mật khẩu mới
- Google flow dùng Firebase Web SDK để lấy `firebaseIdToken`, sau đó gọi `POST /client/auth/login/google`.
- Nếu thiếu biến môi trường Firebase, các nút Google sẽ hiện trạng thái chưa cấu hình thay vì giả lập token.

## Auth & Security
- Auth theo JWT Bearer (login trả `accessToken`) theo `docs/_client-api-context/02_AUTH_LOGIN_JWT.md`
- Token storage:
  - Session state trong `sessionStorage`
  - Không dùng refresh token hoặc session DB ở FE prototype này
- Route guarding:
  - `meta.requiresAuth: true`
  - `meta.requiredRoles: ['BUYER'|'ARTIST'|...]`
- Buyer hỗ trợ 2 mode tách biệt:
  - email/password
  - Google
- Buyer theo policy single-provider:
  - account tạo bằng Google không được login password
  - account tạo bằng password không được login Google
- Artist chỉ hỗ trợ email/password, không hỗ trợ Google.
- Signup bằng email/password bị chặn ngay từ bước request OTP nếu email đã tồn tại.
- Forgot password chỉ áp dụng cho account `password`:
  - email không tồn tại -> backend trả lỗi rõ
  - account Google -> backend trả lỗi rõ, FE không được chuyển sang màn OTP
- Sau login thành công, cả Buyer và Artist tạm thời đều điều hướng về trang `home`.
- Lưu ý: Google client cần các biến môi trường sau để chạy flow thật:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID` (optional)
  - `VITE_FIREBASE_STORAGE_BUCKET` (optional)

## Local Setup
- Tạo file `.env.local` từ `.env.example`
- Trỏ `VITE_API_BASE_URL=http://localhost:3000`
- Đảm bảo backend `musica-v0.1` đang chạy local
- Nếu test Google thật, bật Firebase Authentication -> Google provider và thêm domain local của frontend vào Firebase Authorized Domains
- Nếu backend verify Firebase ID token bằng Firebase Admin, cần đảm bảo backend cũng đang có bộ env/service account tương ứng với cùng Firebase project

## Quick Test
```bash
npm install
npm run dev
```

Checklist test auth local:
- Buyer email flow: request OTP -> verify OTP -> register buyer -> login password
- Artist email flow: request OTP -> verify OTP -> register artist -> login password
- Duplicate email signup: nhập email đã tồn tại ở buyer/artist -> bị chặn ngay ở bước request OTP
- Forgot password/password account: request OTP -> verify OTP -> confirm bằng `verificationToken` -> login bằng mật khẩu mới
- Forgot password/google account: nhập email account Google -> hiển thị lỗi, không được sang màn OTP
- Forgot password/email không tồn tại: hiển thị lỗi, không được sang màn OTP
- Buyer Google flow: vào `/auth/login` hoặc `/auth/register/buyer` -> bấm Google -> popup Google -> backend trả JWT -> frontend hydrate `/me`
- Artist Google policy: UI không cung cấp Google ở màn artist; nếu cố gọi backend bằng account artist sẽ bị chặn theo policy backend

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
