import Shepherd, {
  type StepOptionsButton,
  type Tour as ShepherdTour,
} from "shepherd.js";
import { nextTick, ref } from "vue";
import { useRouter } from "vue-router";
import { canAccessArtistArea } from "../modules/auth/auth.capabilities";
import { useAuthStore } from "../modules/auth/auth.store";
import { updateMyOnboarding } from "../modules/artist-onboarding/api";
import { useTourDemoStore, DEMO_PRODUCT_ID } from "../stores/tourDemo.store";

const isTourActive = ref(false);
let tourInstance: ShepherdTour | null = null;
let pendingRestart = false;

export function useArtistTour() {
  const router = useRouter();
  const auth = useAuthStore();
  const demo = useTourDemoStore();

  const isArtist = () => canAccessArtistArea(auth.roles);

  async function saveProgress(
    step: string,
    status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED",
  ) {
    if (!auth.isAuthenticated || !isArtist() || demo.isDemo) return;
    try {
      await updateMyOnboarding({
        currentStep: step,
        ...(status ? { status } : {}),
      });
    } catch {
      /* không block tour */
    }
  }

  async function navigateTo(path: string) {
    if (router.currentRoute.value.path !== path) {
      await router.push(path);
      await nextTick();
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  function destroyTour() {
    if (tourInstance) {
      try {
        tourInstance.cancel();
      } catch {
        /* ignore */
      }
      tourInstance = null;
    }
    isTourActive.value = false;
  }

  async function endDemoAndReset(completedSuccessfully = false) {
    const origin = demo.originPath;
    demo.clearDemo();
    await nextTick();

    if (pendingRestart) return;

    if (completedSuccessfully) {
      if (auth.isAuthenticated && isArtist()) {
        await router.push("/me/products");
      } else {
        await router.push("/auth/register/role");
      }
    } else {
      const currentPath = router.currentRoute.value.path;
      if (currentPath.startsWith("/me")) {
        await router.push(origin || "/");
      }
    }
  }

  function btn(
    label: string,
    opts: { primary?: boolean; action?: (this: ShepherdTour) => void } = {},
  ): StepOptionsButton {
    return {
      text: label,
      classes:
        opts.primary !== false
          ? "shepherd-btn-primary"
          : "shepherd-btn-secondary",
      action:
        opts.action ??
        function (this: ShepherdTour) {
          this.next();
        },
    };
  }

  function nextBtn(label = "Tiếp theo"): StepOptionsButton {
    return btn(label + " →");
  }

  function backBtn(): StepOptionsButton {
    return btn("← Quay lại", {
      primary: false,
      action() {
        this.back();
      },
    });
  }

  async function startTour() {
    destroyTour();
    isTourActive.value = true;
    pendingRestart = false;

    const originPath = router.currentRoute.value.path;
    demo.startDemo(originPath);

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      classPrefix: "musica-",
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        scrollTo: { behavior: "smooth", block: "center" },
        modalOverlayOpeningPadding: 10,
        modalOverlayOpeningRadius: 14,
      },
    });

    tourInstance = tour;

    tour.on("cancel", async () => {
      isTourActive.value = false;
      await saveProgress("SKIPPED", "SKIPPED");
      await endDemoAndReset(false);
    });

    tour.on("complete", async () => {
      isTourActive.value = false;
      await endDemoAndReset(true);
    });

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 1 — Chào mừng (không anchor, hiện giữa màn hình)
    // ───────────────────────────────────────────────────────────────────────────
    tour.addStep({
      id: "welcome",
      title: "🎵 Chào mừng bạn đến với Musica!",
      text: `
        <p>Musica là nền tảng giúp <strong>nghệ sĩ</strong> bán nhạc bản quyền trực tiếp đến người mua — YouTuber, agency, nhà sản xuất nội dung.</p>
        <p style="margin-top:10px">Trong <strong>2 phút</strong> tới bạn sẽ thấy toàn bộ hành trình: từ lúc <em>upload bài nhạc</em> → <em>cấu hình giá bán</em> → <em>bài lên chợ và kiếm tiền</em>.</p>
        <p style="margin-top:10px;padding:10px 12px;background:rgba(31,109,240,.08);border-radius:10px;font-size:13px;color:#1f6df0">
          💡 Đây là bản <strong>demo</strong> — dữ liệu mẫu, không ảnh hưởng tài khoản thật.
        </p>
      `,
      buttons: [nextBtn("Bắt đầu khám phá")],
    });

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 2 — Trang chợ (market)
    // ───────────────────────────────────────────────────────────────────────────
    tour.addStep({
      id: "market-intro",
      title: "🛒 Đây là chợ nhạc Musica",
      text: `
        <p>Đây là nơi người mua tìm và mua nhạc có bản quyền. Bạn có thể lọc theo thể loại và xem giá bán trực tiếp trên từng thẻ nhạc.</p>
      `,
      beforeShowPromise: () => navigateTo("/market"),
      attachTo: {
        element:
          '.market-grid, [class*="product-grid"], .products-grid, [class*="grid"]',
        on: "top",
      },
      buttons: [backBtn(), nextBtn("Vào trang quản lý")],
    });

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 3 — Dashboard
    // ───────────────────────────────────────────────────────────────────────────
    tour.addStep({
      id: "dashboard-intro",
      title: "📊 Dashboard — Trung tâm điều khiển",
      text: `
        <p>Sau khi đăng nhập, đây là màn hình chính của nghệ sĩ. Bạn có thể theo dõi:</p>
        <ul style="margin-top:8px;padding-left:20px;line-height:2">
          <li>💰 Doanh thu tháng này</li>
          <li>🎧 Số lượt nghe thử</li>
          <li>📦 Bài nhạc đang bán</li>
          <li>📈 Biểu đồ tăng trưởng</li>
        </ul>
      `,
      beforeShowPromise: async () => {
        await navigateTo("/me/dashboard");
        await saveProgress("DASHBOARD_INTRO", "IN_PROGRESS");
      },
      attachTo: {
        element: '.me-title, [class*="page-title"], h1',
        on: "bottom",
      },
      buttons: [backBtn(), nextBtn("Xem danh sách bài nhạc")],
    });

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 4 — Products list
    // ───────────────────────────────────────────────────────────────────────────
    tour.addStep({
      id: "products-list",
      title: "📂 Kho bài nhạc của bạn",
      text: `
        <p>Đây là danh sách tất cả bài nhạc bạn đã upload. Bài demo "<strong>Cánh Đồng Ký Ức</strong>" đã được tạo sẵn để bạn xem thử.</p>
        <p style="margin-top:10px">Thực tế, bạn nhấn <strong>"Thêm sản phẩm"</strong> để bắt đầu — cần cung cấp file audio, ảnh bìa và một số thông tin cơ bản.</p>
      `,
      beforeShowPromise: async () => {
        await navigateTo("/me/products");
        await saveProgress("PRODUCTS_LIST");
      },
      attachTo: {
        element: '[class*="add"], [class*="btn-add"], button[class*="primary"]',
        on: "bottom",
      },
      buttons: [backBtn(), nextBtn("Xem bài nhạc demo")],
    });

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 5 — Product detail: General
    // ───────────────────────────────────────────────────────────────────────────
    tour.addStep({
      id: "product-general",
      title: "🎧 Tổng quan bài nhạc",
      text: `
        <p>Trang chi tiết mỗi bài nhạc có <strong>3 mục</strong> ở thanh bên trái: <em>Tổng quan</em>, <em>Quyền &amp; Giấy phép</em>, và <em>Giá bán</em>.</p>
        <p style="margin-top:10px">Mục <strong>Tổng quan</strong> cho bạn nghe lại file audio gốc và chỉnh sửa thông tin: tên bài, thể loại, mô tả, ảnh bìa.</p>
      `,
      beforeShowPromise: async () => {
        await navigateTo(`/me/products/${DEMO_PRODUCT_ID}/general`);
        await saveProgress("PRODUCT_DETAIL_GENERAL");
      },
      attachTo: {
        element:
          '[class*="wave"], [class*="waveform"], [class*="audio-preview"]',
        on: "bottom",
      },
      buttons: [backBtn(), nextBtn()],
    });

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 6 — Trạng thái bài nhạc
    // ───────────────────────────────────────────────────────────────────────────
    tour.addStep({
      id: "product-status",
      title: "🚦 Trạng thái & 3 bước phát hành",
      text: `
        <p>Bài nhạc mới upload ở trạng thái <strong>"Chưa công khai"</strong>. Để lên chợ và bắt đầu kiếm tiền, bạn cần hoàn thành <strong>3 bước</strong>:</p>
        <ol style="margin-top:10px;padding-left:20px;line-height:2.2">
          <li><strong>Nộp hồ sơ pháp lý</strong> — chờ đội Musica xét duyệt (1–2 ngày)</li>
          <li><strong>Chọn quyền bán</strong> — người mua được làm gì với bài nhạc</li>
          <li><strong>Thiết lập giá bán</strong> — theo từng kênh phân phối</li>
        </ol>
        <p style="margin-top:10px">Sau khi đủ 3 bước, bài sẽ <strong>tự động chuyển sang "Đang bán"</strong>.</p>
      `,
      attachTo: {
        element:
          '[class*="status-badge"], [class*="product-status"], [class*="badge"]',
        on: "bottom",
      },
      buttons: [backBtn(), nextBtn("Xem mục Quyền & Giấy phép")],
    });

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 7 — Rights-license: pháp lý
    // ───────────────────────────────────────────────────────────────────────────
    tour.addStep({
      id: "rights-legal",
      title: "📋 Bước 1: Hồ sơ pháp lý",
      text: `
        <p>Bạn cần upload giấy tờ chứng minh mình có quyền bán bài nhạc này — ví dụ: <em>hợp đồng với tác giả</em>, <em>giấy chứng nhận bản quyền</em>.</p>
        <p style="margin-top:10px">Bài demo này đã được <strong>duyệt sẵn</strong> — bạn thấy badge <em>"Đã đủ hồ sơ"</em> và <em>"Đã duyệt nội dung"</em> ở đây.</p>
        <p style="margin-top:10px;padding:8px 12px;background:#f0fdf4;border-radius:8px;font-size:13px;color:#16a34a">
          ✅ Hồ sơ hợp lệ — Đội kiểm duyệt đã xác nhận ngày hôm qua
        </p>
      `,
      beforeShowPromise: async () => {
        await navigateTo(`/me/products/${DEMO_PRODUCT_ID}/rights-license`);
        await saveProgress("RIGHTS_LICENSE");
      },
      attachTo: {
        element: '[class*="compliance"], [class*="legal"], [class*="rights"]',
        on: "bottom",
      },
      buttons: [backBtn(), nextBtn()],
    });

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 8 — Rights-license: quyền bán
    // ───────────────────────────────────────────────────────────────────────────
    tour.addStep({
      id: "rights-permissions",
      title: "✅ Bước 2: Quyền sử dụng cho người mua",
      text: `
        <p>Sau khi hồ sơ được duyệt, bạn chọn <strong>người mua được phép làm gì</strong> với bài nhạc:</p>
        <ul style="margin-top:8px;padding-left:20px;line-height:2">
          <li>🎵 Phát trực tuyến trên YouTube / TikTok</li>
          <li>💾 Tải về dùng cá nhân</li>
          <li>📺 Dùng trong quảng cáo thương mại</li>
        </ul>
        <p style="margin-top:10px">Mỗi quyền sẽ ảnh hưởng đến giá bán ở bước tiếp theo.</p>
      `,
      attachTo: {
        element:
          '[class*="permissions"], [class*="allowed"], [class*="rights-list"]',
        on: "top",
      },
      buttons: [backBtn(), nextBtn("Xem mục Giá bán")],
    });

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 9 — Pricing: overview
    // ───────────────────────────────────────────────────────────────────────────
    tour.addStep({
      id: "pricing-overview",
      title: "💳 Bước 3: Thiết lập giá bán",
      text: `
        <p>Đây là nơi bạn cấu hình giá bán theo từng <strong>kênh phân phối</strong> (nền tảng).</p>
        <p style="margin-top:10px">Bài demo đã có sẵn <strong>2 kênh</strong>: <em>YouTube</em> và <em>TikTok</em> — mỗi kênh có nhiều mức giá tương ứng với cách người mua sử dụng bài nhạc.</p>
      `,
      beforeShowPromise: async () => {
        await navigateTo(`/me/products/${DEMO_PRODUCT_ID}/pricing`);
        await saveProgress("PRICING");
      },
      attachTo: {
        element:
          '[class*="pricing"], [class*="platform-list"], [class*="variant"]',
        on: "top",
      },
      buttons: [backBtn(), nextBtn()],
    });

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 10 — Pricing: biến thể giá
    // ───────────────────────────────────────────────────────────────────────────
    tour.addStep({
      id: "pricing-variants",
      title: "🔀 Biến thể giá — bán đúng giá đúng người",
      text: `
        <p>Mỗi kênh có nhiều <strong>biến thể giá</strong> theo mục đích sử dụng:</p>
        <div style="margin-top:10px;display:grid;gap:6px">
          <div style="padding:8px 12px;background:#eff6ff;border-radius:8px;display:flex;justify-content:space-between">
            <span>🎬 Dùng cá nhân (vlog, podcast)</span><strong>350.000đ</strong>
          </div>
          <div style="padding:8px 12px;background:#fefce8;border-radius:8px;display:flex;justify-content:space-between">
            <span>📺 Quảng cáo thương mại</span><strong>1.200.000đ</strong>
          </div>
          <div style="padding:8px 12px;background:#fdf4ff;border-radius:8px;display:flex;justify-content:space-between">
            <span>🏢 Doanh nghiệp / Thương hiệu lớn</span><strong>Chưa cấu hình</strong>
          </div>
        </div>
        <p style="margin-top:10px;font-size:13px;color:#6b7280">Bạn có thể bật/tắt từng dòng và chỉnh giá bất kỳ lúc nào.</p>
      `,
      attachTo: {
        element:
          '[class*="platform-card"], [class*="price-table"], [class*="pricing-row"]',
        on: "top",
      },
      buttons: [backBtn(), nextBtn("Xong, kết thúc hướng dẫn")],
    });

    // ───────────────────────────────────────────────────────────────────────────
    // STEP 11 — Kết thúc
    // ───────────────────────────────────────────────────────────────────────────
    tour.addStep({
      id: "done",
      title: "🎉 Bạn đã sẵn sàng bán nhạc!",
      text: `
        <p>Đây là toàn bộ hành trình một lần nữa:</p>
        <ol style="margin-top:10px;padding-left:20px;line-height:2.2">
          <li>⬆️ <strong>Upload</strong> bài nhạc (audio + ảnh bìa)</li>
          <li>📋 <strong>Nộp hồ sơ pháp lý</strong> → chờ duyệt 1–2 ngày</li>
          <li>✅ <strong>Chọn quyền</strong> sử dụng cho người mua</li>
          <li>💳 <strong>Thiết lập giá</strong> theo kênh &amp; mục đích</li>
        </ol>
        <p style="margin-top:12px;padding:10px 12px;background:linear-gradient(135deg,rgba(31,109,240,.1),rgba(20,184,166,.1));border-radius:10px;font-size:13.5px;font-weight:600;color:#0e3fa0">
          Bài nhạc tự động lên chợ khi hoàn thành đủ 4 bước 🚀
        </p>
      `,
      buttons: [
        btn("Xem lại từ đầu", {
          primary: false,
          action() {
            pendingRestart = true;
            this.complete();
            setTimeout(() => void startTour(), 300);
          },
        }),
        btn(
          auth.isAuthenticated
            ? "🚀 Upload bài thật ngay!"
            : "📝 Đăng ký miễn phí!",
          {
            action() {
              void saveProgress("DONE", "COMPLETED");
              this.complete();
            },
          },
        ),
      ],
    });

    tour.start();
  }

  return { startTour, isTourActive, destroyTour };
}
