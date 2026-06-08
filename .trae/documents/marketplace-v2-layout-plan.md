# Plan — Marketplace UI v2 (Header search + Left filters + Right sections)

## 1) Summary
- Mục tiêu: refactor trải nghiệm Marketplace theo layout “search results” kiểu dark UI:
  - Bỏ search input trong `/market`, thay bằng search global trên header.
  - Sidebar trái (dưới header): filter dạng expandable (time, length, mục đích sử dụng).
  - Cột phải: nhóm kết quả theo sections (Top result + Popular songs + Artists + Playlists + Genres).
  - Mock-first: tăng mock data lên ~28 tracks, và đảm bảo list items đúng schema API (`id` UUID, `productCode`, `title`, `thumbnailUrl`, `artistDisplayName`) theo [03_CLIENT_API_CATALOG_DESIRED.md](file:///c:/Users/Admin/Desktop/musica-lab/docs/_client-api-context/03_CLIENT_API_CATALOG_DESIRED.md#L14-L30).
- Constraints:
  - Không sửa backend, không thêm UI library.
  - Tuân thủ conventions: skeleton/loading/error state + requestId (đã có trong shared UI).

## 2) Current State Analysis (grounded)
- Header hiện chỉ có icon search (chưa có input): [AppHeader.vue](file:///c:/Users/Admin/Desktop/musica-lab/src/components/layout/AppHeader.vue#L44-L57)
- `/market` hiện có search input + genre select + pagination: [market/index.page.vue](file:///c:/Users/Admin/Desktop/musica-lab/src/pages/market/index.page.vue#L103-L116)
- Mock catalog hiện chỉ có 8 tracks (`song-01`..`song-08`): [catalog.js](file:///c:/Users/Admin/Desktop/musica-lab/src/data/catalog.js#L34-L131)
- Đã có adapter map id sang UUID stable cho listProducts và map ngược cho Product detail:
  - id mapping: [idMap.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/modules/catalog/idMap.ts)
  - listProducts returns UUID id: [modules/catalog/api.ts](file:///c:/Users/Admin/Desktop/musica-lab/src/modules/catalog/api.ts#L25-L67)
  - ProductView map ngược UUID → internal id: [ProductView.vue](file:///c:/Users/Admin/Desktop/musica-lab/src/views/ProductView.vue#L10-L18)

## 3) Decisions (đã confirm)
- `/market` bỏ pagination UI.
- Search dùng input global trên header, Enter sẽ route sang `/market?q=...`.
- Popular songs click → đi tới `/product/:id`.
- Sidebar filter cần: time, length, mục đích sử dụng; click mở sub-items.

## 4) Phasing (theo yêu cầu)

### Phase 1 — UI/UX (refactor layout + interaction)
Mục tiêu: đạt đúng layout/interaction, chưa cần mock data đủ 28 cũng không block (có thể song song), ưu tiên để bạn review UI và mình fix nhanh.

**(A) Global header search**
- Tạo component `src/components/layout/HeaderSearch.vue`:
  - UI dark hơn, nổi bật để nhập:
    - nền tối (gợi ý dùng `--c-ink` hoặc rgba tối), chữ sáng.
    - icon kính lúp nằm trong input.
    - không có button, không “outlined” sang phải (không border tách nút).
  - Behavior:
    - Enter → `router.push({ name: 'market', query: { q } })`
    - Nếu input rỗng → route `/market` không query.
    - Sync value: khi đang ở `/market`, header input phản ánh `route.query.q`.
- Refactor [AppHeader.vue](file:///c:/Users/Admin/Desktop/musica-lab/src/components/layout/AppHeader.vue) thay icon search bằng `HeaderSearch` và đảm bảo responsive (ẩn nav-main vẫn OK).

**(B) Refactor `/market` bỏ search bar + đổi layout 2 cột**
- Update [market/index.page.vue](file:///c:/Users/Admin/Desktop/musica-lab/src/pages/market/index.page.vue):
  - Remove `MarketSearchBar` component.
  - Layout:
    - Left sidebar: `MarketFiltersPanel` (sticky dưới header, giống ảnh reference).
    - Right content: sections.
  - Data load:
    - Vẫn gọi `listProducts` theo query `q` và `genre` (genre có thể đặt ở phần Genres section thay cho select).
    - page/pageSize: Phase 1 hardcode `page=1`, `pageSize=50` (mock) để đủ data cho sections.
  - Async states:
    - loading: skeleton cho các section + list.
    - error: `ErrorState` (requestId + retry).
    - empty: empty state card.

**(C) Sidebar filters (UI + logic client-side trong mock mode)**
- Tạo `src/pages/market/components/MarketFiltersPanel.vue` gồm 3 nhóm expandable:
  - Added time: Past hour / Past day / Past week / Past month / Past year / Any time
  - Length: < 2 phút / 2–4 phút / 4–6 phút / > 6 phút
  - Mục đích sử dụng: YouTube / Biểu diễn (mapping internal purpose)
- Hành vi:
  - Click header group → toggle expand.
  - Click option → set state filter (có thể reflect ra query params sau, nhưng Phase 1 có thể giữ local state để iterate nhanh UI).
- Lọc dữ liệu:
  - Time filter dựa trên `releaseDate` trong mock product.
  - Length filter dựa trên `duration` (mm:ss) trong mock product.
  - Purpose filter dựa trên field mock bổ sung `availablePurposes` (Phase 2 sẽ thêm).

**(D) Right content sections**
- Tạo `src/pages/market/components/MarketResultsPanel.vue`:
  - Top result:
    - lấy item đầu tiên của “filtered results”, render “text-only” (không click).
  - Popular songs:
    - render 6–10 items kế tiếp.
    - click → RouterLink tới `/product/:id`, có underline khi hover/click.
  - Artists:
    - render list artists (bo tròn avatar).
    - “Xem thêm” → toggle expand (show all) hoặc chuyển sang modal/section expand (không thêm route mới).
  - Playlists:
    - mock danh sách playlists (chip/list).
    - click có thể chỉ highlight (Phase 1) hoặc set query `q` theo playlist (Phase 2).
  - Genres:
    - reuse categories (chips); click set `genre` filter (đồng bộ vào query).

**Acceptance criteria (Phase 1)**
- Không còn search input trong `/market`; header search Enter luôn dẫn sang `/market`.
- UI dark search đúng yêu cầu (icon, không button, input nổi bật).
- `/market` có sidebar expandable + sections đúng layout.
- Popular songs click navigate `/product/:id` hoạt động.

### Phase 2 — Mock data & wiring (đủ ~28 tracks, đúng schema API)
Mục tiêu: tăng dữ liệu để UI sections “có cái để show”, và bổ sung metadata để filter time/length/purpose chạy thật trong mock mode.

**(A) Thêm ~20 mock tracks**
- Update [catalog.js](file:///c:/Users/Admin/Desktop/musica-lab/src/data/catalog.js):
  - Add `song-09`..`song-28` theo format hiện có (không đổi cấu trúc cũ để tránh phá views).
  - Ensure các field tối thiểu đã có:
    - `id`, `title`, `artist`, `artistId`, `category`, `duration`, `releaseDate`, `cover`
    - `isrc` (đang dùng làm `productCode` fallback)
  - Bổ sung metadata cho filter:
    - `availablePurposes: ('YOUTUBE'|'PERFORMANCE')[]` (new field, không ảnh hưởng UI khác nếu chưa dùng)
    - (optional) `createdAt` nếu muốn khác `releaseDate` (nếu không thì reuse `releaseDate`)

**(B) Đảm bảo listProducts trả đúng API schema**
- `listProducts` đã map sang `ProductListItem` đúng contract; Phase 2 chỉ cần đảm bảo:
  - `id` là UUID stable (idMap tự mở rộng theo products mới).
  - `productCode` đúng format `PROD-000001` hoặc ISRC.
  - `thumbnailUrl` nullable (đang dùng `cover` gradient string; coi như “url” tạm).

**(C) Lọc nâng cao trong `/market`**
- Áp dụng filter client-side trên tập items đã load:
  - `time` filter: so sánh `releaseDate` với now.
  - `length` filter: parse `duration` mm:ss.
  - `purpose` filter: dựa trên `availablePurposes`.
- Khi backend support query thật sau này:
  - giữ UI như cũ, chỉ thay phần “lọc” từ client-side sang query params + BE filtering.

**Acceptance criteria (Phase 2)**
- `/market` search với từ khoá phổ biến trả ra đủ data cho Top/Popular/Artists/Genres.
- Filters time/length/purpose hoạt động (mock mode).

## 5) Files to Change (concrete)
- Header search:
  - Update: [AppHeader.vue](file:///c:/Users/Admin/Desktop/musica-lab/src/components/layout/AppHeader.vue)
  - Add: `src/components/layout/HeaderSearch.vue`
- Market page:
  - Update: [market/index.page.vue](file:///c:/Users/Admin/Desktop/musica-lab/src/pages/market/index.page.vue)
  - Add:
    - `src/pages/market/components/MarketFiltersPanel.vue`
    - `src/pages/market/components/MarketResultsPanel.vue`
    - (optionally) reuse existing `GenreFilter.vue` as chips, hoặc tạo `GenresChips.vue`
- Mock data:
  - Update: [catalog.js](file:///c:/Users/Admin/Desktop/musica-lab/src/data/catalog.js)
- Styling:
  - ưu tiên scoped styles trong components để giữ token system; chỉ bổ sung global nếu cần class dùng chung.

## 6) Assumptions
- “ThumbnailUrl” trong mock có thể dùng gradient string tạm (đến khi signed URL endpoint thật).
- Playlists chưa có API contract → mock UI-only cho phase này.

## 7) Verification (manual)
- Từ mọi trang, nhập vào header search + Enter → vào `/market?q=...`.
- `/market` render layout mới; toggle filters mở/đóng; chọn filter → danh sách/sections thay đổi.
- Click “popular song” → vào `/product/:id` và product hiển thị đúng.
- `npm run build` và `npm run build:ssg` pass.

