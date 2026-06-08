import { mergeProps, useSSRContext, ref, computed, withCtx, createVNode, unref, defineComponent } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderSlot, ssrRenderAttr, ssrRenderList, ssrRenderStyle, ssrRenderComponent, ssrRenderClass } from "vue/server-renderer";
import { useRouter } from "vue-router";
import { p as products, c as categories, a as artists } from "./catalog-7r_b5cgQ.js";
import { W as WaveBars, P as ProductCard, C as CheckList } from "./CheckList-C6BpBCV2.js";
import { _ as _export_sfc } from "../main.mjs";
import { useHead } from "@unhead/vue";
import "@unhead/vue/server";
import "pinia";
const _sfc_main$2 = {
  __name: "SectionHead",
  __ssrInlineRender: true,
  props: {
    eyebrow: String,
    title: String,
    description: String,
    align: { type: String, default: "left" }
    // 'left' | 'center'
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["section-head", { center: __props.align === "center" }]
      }, _attrs))} data-v-61a3f742><div class="text" data-v-61a3f742>`);
      if (__props.eyebrow) {
        _push(`<span class="eyebrow" data-v-61a3f742>${ssrInterpolate(__props.eyebrow)}</span>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.title) {
        _push(`<h2 data-v-61a3f742>${ssrInterpolate(__props.title)}</h2>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.description) {
        _push(`<p data-v-61a3f742>${ssrInterpolate(__props.description)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (_ctx.$slots.actions) {
        _push(`<div class="actions" data-v-61a3f742>`);
        ssrRenderSlot(_ctx.$slots, "actions", {}, null, _push, _parent);
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/ui/SectionHead.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const SectionHead = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-61a3f742"]]);
const _sfc_main$1 = {
  __name: "HomeView",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const activeCat = ref("all");
    const search = ref("");
    const filtered = computed(() => {
      const q = search.value.trim().toLowerCase();
      return products.filter((p) => {
        const matchCat = activeCat.value === "all" || p.category === activeCat.value;
        const matchQ = !q || p.title.toLowerCase().includes(q) || p.artist.toLowerCase().includes(q) || p.tags.join(" ").toLowerCase().includes(q);
        return matchCat && matchQ;
      });
    });
    const stats = [
      { v: "12K+", l: "Tác phẩm có bản quyền" },
      { v: "850+", l: "Nghệ sĩ & Nhà phát hành" },
      { v: "38K+", l: "Tác quyền đã giao dịch" },
      { v: "99.2%", l: "Tỷ lệ xác minh hợp lệ" }
    ];
    const benefits = [
      { icon: "shield", title: "Giao dịch minh bạch", text: "Mọi tác phẩm gắn liền hồ sơ pháp lý, lịch sử giao dịch được lưu vết on-chain." },
      { icon: "bolt", title: "Bàn giao tức thì", text: "Hợp đồng ký số, bộ tài sản tác quyền được phát hành ngay sau khi thanh toán." },
      { icon: "layers", title: "Linh hoạt biến thể", text: "Tuỳ biến mục đích, thời hạn, quy mô và nền tảng khai thác phù hợp nhu cầu." },
      { icon: "globe", title: "Đa nền tảng", text: "Mua tác quyền cho YouTube, biểu diễn, livestream, TVC, podcast, short-form." }
    ];
    const steps = [
      { n: "01", title: "Khám phá tác phẩm", text: "Tìm theo nghệ sĩ, thể loại, mood — nghe sample chất lượng cao." },
      { n: "02", title: "Cấu hình gói tác quyền", text: "Chọn mục đích, quy mô và thời gian — giá hiển thị minh bạch theo thời gian thực." },
      { n: "03", title: "Ký hợp đồng số", text: "Ký xác thực điện tử theo Luật Giao dịch điện tử Việt Nam." },
      { n: "04", title: "Nhận bộ tài sản", text: "Nghệ sĩ bàn giao file âm thanh, khuông nhạc, giấy SHTT và ID xác minh." }
    ];
    const useCases = [
      {
        title: "Creator & Publisher",
        text: "Chọn tác phẩm theo mood, set phạm vi và bật kiếm tiền ngay khi publish.",
        points: ["YouTube & podcast", "Livestream & shorts", "Export hợp đồng PDF", "ID xác minh giao dịch"]
      },
      {
        title: "Brand & Agency",
        text: "Tối ưu quy trình mua tác quyền cho TVC, social và chiến dịch đa nền tảng.",
        points: ["Theo ngân sách", "Theo thời hạn", "Theo phạm vi", "Theo nền tảng"]
      },
      {
        title: "Studio & Event",
        text: "Giấy tờ rõ ràng cho biểu diễn, sân khấu, festival hoặc không gian thương mại.",
        points: ["Biểu diễn 1 lần", "Theo số khách", "Theo địa điểm", "Lưu vết minh bạch"]
      },
      {
        title: "Team nội bộ",
        text: "Chuẩn hoá quy trình mua và lưu trữ asset tác quyền theo dự án.",
        points: ["Asset handover", "Hồ sơ pháp lý", "Quy trình kiểm tra", "Tái sử dụng an toàn"]
      }
    ];
    const faqs = [
      {
        q: "MusicA có đảm bảo tính pháp lý cho giao dịch tác quyền không?",
        a: "Mỗi tác phẩm đi kèm hồ sơ xác minh và điều khoản sử dụng rõ ràng theo mục đích, thời hạn và phạm vi. Bạn có thể tải hợp đồng PDF và ID xác minh sau khi giao dịch."
      },
      {
        q: "Tôi có thể mua tác quyền cho YouTube/TikTok/Livestream không?",
        a: "Có. Bạn chọn nền tảng khai thác trong bước cấu hình gói tác quyền. Giá và điều khoản hiển thị minh bạch trước khi thanh toán."
      },
      {
        q: "Sau khi thanh toán tôi nhận được những gì?",
        a: "Bạn nhận bộ tài sản tác quyền (file âm thanh, tài liệu đi kèm) và hợp đồng số/biên nhận với ID xác minh để lưu trữ hoặc cung cấp cho đối tác."
      },
      {
        q: "Có yêu cầu thẻ thanh toán để trải nghiệm không?",
        a: "Không. Bạn có thể tạo tài khoản, khám phá thư viện và trải nghiệm quy trình cấu hình gói trước khi quyết định giao dịch."
      }
    ];
    const ctaChecks = [
      "Không yêu cầu thẻ thanh toán",
      "1 gói tác quyền thử nghiệm miễn phí",
      "Hỗ trợ YouTube, TikTok, Facebook",
      "Hợp đồng PDF kèm ID xác minh"
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "home-view" }, _attrs))} data-v-e218fb4e><section class="hero" data-v-e218fb4e><div class="orb orb-a" data-v-e218fb4e></div><div class="orb orb-b" data-v-e218fb4e></div><div class="orb orb-c" data-v-e218fb4e></div><div class="container hero-inner" data-v-e218fb4e><div class="hero-copy" data-v-e218fb4e><span class="eyebrow rise-in rise-in-1" data-v-e218fb4e><i class="dot" data-v-e218fb4e></i> Thương mại điện tử tác quyền âm nhạc · 2026 </span><h1 class="rise-in rise-in-2" data-v-e218fb4e> Mua tác quyền <span class="keep-together" data-v-e218fb4e>âm nhạc</span> <br data-v-e218fb4e><span class="gradient-text" data-v-e218fb4e>trực tiếp từ nghệ sĩ.</span></h1><p class="lead rise-in rise-in-3" data-v-e218fb4e> MusicA là nền tảng thương mại điện tử kết nối người mua với nghệ sĩ — minh bạch, an toàn pháp lý và bàn giao đầy đủ bộ tài sản tác quyền chỉ trong vài phút. </p><form class="hero-search rise-in rise-in-4" data-v-e218fb4e><svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" data-v-e218fb4e><circle cx="11" cy="11" r="7" data-v-e218fb4e></circle><path d="m20 20-3.5-3.5" data-v-e218fb4e></path></svg><input${ssrRenderAttr("value", search.value)} type="text" placeholder="Tìm bài hát, nghệ sĩ, tâm trạng… (vd: lo-fi, Lena Vũ)" data-v-e218fb4e><button class="btn btn-primary" type="submit" data-v-e218fb4e>Tìm tác quyền</button></form><div class="hero-trust rise-in rise-in-5" data-v-e218fb4e><span class="hero-trust-item" data-v-e218fb4e>Không cần thẻ</span><span class="hero-trust-dot" aria-hidden="true" data-v-e218fb4e></span><span class="hero-trust-item" data-v-e218fb4e>Hợp đồng số</span><span class="hero-trust-dot" aria-hidden="true" data-v-e218fb4e></span><span class="hero-trust-item" data-v-e218fb4e>Bàn giao đầy đủ asset</span></div><div class="hero-suggest rise-in rise-in-5" data-v-e218fb4e><span class="hint" data-v-e218fb4e>Phổ biến:</span><!--[-->`);
      ssrRenderList(["Lo-fi cho podcast", "EDM festival", "Ballad TVC", "Biểu diễn 500 khách"], (t) => {
        _push(`<a data-v-e218fb4e>${ssrInterpolate(t)}</a>`);
      });
      _push(`<!--]--></div><div class="hero-stats" data-v-e218fb4e><!--[-->`);
      ssrRenderList(stats, (s, i) => {
        _push(`<div class="stat reveal" style="${ssrRenderStyle({ transitionDelay: i * 60 + "ms" })}" data-v-e218fb4e><strong data-v-e218fb4e>${ssrInterpolate(s.v)}</strong><span data-v-e218fb4e>${ssrInterpolate(s.l)}</span></div>`);
      });
      _push(`<!--]--></div></div><div class="hero-art" aria-hidden="true" data-v-e218fb4e><div class="license-card floating" data-v-e218fb4e><div class="lc-head" data-v-e218fb4e><span class="lc-tag" data-v-e218fb4e>Tác quyền #VN-MUS-25-00510</span><span class="lc-status" data-v-e218fb4e><i data-v-e218fb4e></i> Hợp lệ</span></div><div class="lc-title" data-v-e218fb4e>Bão giữa lồng ngực</div><div class="lc-sub" data-v-e218fb4e>Mira Hồ · V-Pop · 3:55</div><div class="lc-grid" data-v-e218fb4e><div data-v-e218fb4e><span data-v-e218fb4e>Mục đích</span><b data-v-e218fb4e>YouTube</b></div><div data-v-e218fb4e><span data-v-e218fb4e>Thời hạn</span><b data-v-e218fb4e>12 tháng</b></div><div data-v-e218fb4e><span data-v-e218fb4e>Bật kiếm tiền</span><b data-v-e218fb4e>Có</b></div><div data-v-e218fb4e><span data-v-e218fb4e>Phạm vi</span><b data-v-e218fb4e>Toàn cầu</b></div></div><div class="lc-foot" data-v-e218fb4e><div class="qr" data-v-e218fb4e><!--[-->`);
      ssrRenderList(36, (i) => {
        _push(`<div class="qr-cell" style="${ssrRenderStyle({ background: i * 7 % 3 ? "var(--c-ink)" : "transparent" })}" data-v-e218fb4e></div>`);
      });
      _push(`<!--]--></div><div class="lc-meta" data-v-e218fb4e><div data-v-e218fb4e>Giao dịch 02/05/2025</div><div data-v-e218fb4e>Ký xác thực điện tử ✓</div></div></div></div><div class="now-playing floating-slow" data-v-e218fb4e><div class="np-cover" data-v-e218fb4e></div><div class="np-body" data-v-e218fb4e><strong data-v-e218fb4e>Đang phát mẫu</strong><span data-v-e218fb4e>Nhịp đập Hà Nội · Kai Phạm</span>`);
      _push(ssrRenderComponent(WaveBars, {
        size: "xs",
        bars: 22,
        variant: "solid",
        animate: true,
        class: "np-wave"
      }, null, _parent));
      _push(`</div><button class="np-play" data-v-e218fb4e><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" data-v-e218fb4e><path d="M8 5v14l11-7z" data-v-e218fb4e></path></svg></button></div><div class="badge-secure floating" data-v-e218fb4e><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-e218fb4e><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" data-v-e218fb4e></path><path d="m9 12 2 2 4-4" data-v-e218fb4e></path></svg><div data-v-e218fb4e><strong data-v-e218fb4e>Hợp đồng số</strong><span data-v-e218fb4e>Ký xác thực điện tử</span></div></div></div></div></section><section class="trust" data-v-e218fb4e><div class="container" data-v-e218fb4e><p class="trust-lead" data-v-e218fb4e>Được tin chọn bởi Creator, nhà phát hành và thương hiệu hàng đầu</p><div class="logos" data-v-e218fb4e><!--[-->`);
      ssrRenderList(["Skyline", "Northbeat", "Lena Music", "Highland", "Beatbox", "Mira Sound"], (n) => {
        _push(`<span data-v-e218fb4e>${ssrInterpolate(n)}</span>`);
      });
      _push(`<!--]--></div></div></section><section id="categories" class="section" data-v-e218fb4e><div class="container" data-v-e218fb4e>`);
      _push(ssrRenderComponent(SectionHead, {
        class: "reveal",
        eyebrow: "Thư viện tác quyền",
        title: "Khám phá theo thể loại",
        description: "Hơn 12.000 tác phẩm đã được xác minh, sẵn sàng giao dịch linh hoạt theo nhu cầu sử dụng."
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="btn btn-ghost btn-sm" data-v-e218fb4e${_scopeId}>Bộ lọc nâng cao</button><button class="btn btn-soft btn-sm" data-v-e218fb4e${_scopeId}>Sắp xếp: Phổ biến</button>`);
          } else {
            return [
              createVNode("button", { class: "btn btn-ghost btn-sm" }, "Bộ lọc nâng cao"),
              createVNode("button", { class: "btn btn-soft btn-sm" }, "Sắp xếp: Phổ biến")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="chips reveal" data-v-e218fb4e><!--[-->`);
      ssrRenderList(unref(categories), (c) => {
        _push(`<button class="${ssrRenderClass(["chip", { "is-active": activeCat.value === c.id }])}" data-v-e218fb4e>${ssrInterpolate(c.label)}</button>`);
      });
      _push(`<!--]--></div><div class="grid" data-v-e218fb4e><!--[-->`);
      ssrRenderList(filtered.value, (p, i) => {
        _push(`<div class="grid-item reveal" style="${ssrRenderStyle({ transitionDelay: i * 50 + "ms" })}" data-v-e218fb4e>`);
        _push(ssrRenderComponent(ProductCard, { product: p }, null, _parent));
        _push(`</div>`);
      });
      _push(`<!--]--></div>`);
      if (!filtered.value.length) {
        _push(`<div class="empty reveal" data-v-e218fb4e> Không tìm thấy tác phẩm phù hợp. Thử thay đổi từ khoá hoặc thể loại. </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section><section id="how" class="section how" data-v-e218fb4e><div class="container" data-v-e218fb4e>`);
      _push(ssrRenderComponent(SectionHead, {
        class: "reveal",
        align: "center",
        eyebrow: "Quy trình mua tác quyền",
        title: "4 bước — từ khám phá đến nhận bàn giao",
        description: "Workflow được số hoá toàn bộ, hợp đồng ký xác thực điện tử và lưu vết minh bạch."
      }, null, _parent));
      _push(`<div class="steps" data-v-e218fb4e><!--[-->`);
      ssrRenderList(steps, (s, i) => {
        _push(`<div class="step reveal" style="${ssrRenderStyle({ transitionDelay: i * 80 + "ms" })}" data-v-e218fb4e><div class="step-num" data-v-e218fb4e>${ssrInterpolate(s.n)}</div><h3 data-v-e218fb4e>${ssrInterpolate(s.title)}</h3><p data-v-e218fb4e>${ssrInterpolate(s.text)}</p>`);
        if (i < steps.length - 1) {
          _push(`<div class="step-line" data-v-e218fb4e></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div></div></section><section class="section benefits" data-v-e218fb4e><div class="container" data-v-e218fb4e>`);
      _push(ssrRenderComponent(SectionHead, {
        class: "reveal",
        eyebrow: "Vì sao chọn MusicA",
        title: "Thương mại điện tử thế hệ mới",
        description: "Thiết kế cho nền kinh tế sáng tạo nội dung số — linh hoạt, minh bạch, dễ tiếp cận."
      }, null, _parent));
      _push(`<div class="bg-grid" data-v-e218fb4e><!--[-->`);
      ssrRenderList(benefits, (b, i) => {
        _push(`<div class="bcard reveal" style="${ssrRenderStyle({ transitionDelay: i * 80 + "ms" })}" data-v-e218fb4e><div class="bicon" data-v-e218fb4e><span data-v-e218fb4e></span></div><h3 data-v-e218fb4e>${ssrInterpolate(b.title)}</h3><p data-v-e218fb4e>${ssrInterpolate(b.text)}</p></div>`);
      });
      _push(`<!--]--></div></div></section><section id="use-cases" class="section usecases" data-v-e218fb4e><div class="container" data-v-e218fb4e>`);
      _push(ssrRenderComponent(SectionHead, {
        class: "reveal",
        eyebrow: "Use cases",
        title: "Dùng cho đúng mục đích — đúng điều khoản",
        description: "Từ creator cá nhân đến agency và studio, mọi nhu cầu khai thác đều có cấu hình phù hợp."
      }, null, _parent));
      _push(`<div class="uc-grid" data-v-e218fb4e><!--[-->`);
      ssrRenderList(useCases, (u, i) => {
        _push(`<div class="uc-card reveal" style="${ssrRenderStyle({ transitionDelay: i * 70 + "ms" })}" data-v-e218fb4e><h3 data-v-e218fb4e>${ssrInterpolate(u.title)}</h3><p data-v-e218fb4e>${ssrInterpolate(u.text)}</p>`);
        _push(ssrRenderComponent(CheckList, {
          items: u.points
        }, null, _parent));
        _push(`</div>`);
      });
      _push(`<!--]--></div></div></section><section id="artists" class="section artists" data-v-e218fb4e><div class="container" data-v-e218fb4e>`);
      _push(ssrRenderComponent(SectionHead, {
        class: "reveal",
        eyebrow: "Nghệ sĩ tiêu biểu",
        title: "Cộng đồng tác giả đồng hành"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<a href="#" class="link-more" data-v-e218fb4e${_scopeId}>Xem tất cả →</a>`);
          } else {
            return [
              createVNode("a", {
                href: "#",
                class: "link-more"
              }, "Xem tất cả →")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="artist-grid" data-v-e218fb4e><!--[-->`);
      ssrRenderList(unref(artists), (a, i) => {
        _push(`<div class="artist-card reveal" style="${ssrRenderStyle({ transitionDelay: i * 60 + "ms" })}" data-v-e218fb4e><div class="art-cover" style="${ssrRenderStyle({ background: "linear-gradient(135deg, hsl(" + (200 + i * 18) + ", 75%, 60%), hsl(" + (170 + i * 10) + ", 70%, 55%))" })}" data-v-e218fb4e><span class="initial" data-v-e218fb4e>${ssrInterpolate(a.name[0])}</span></div><h4 data-v-e218fb4e>${ssrInterpolate(a.name)}</h4><p data-v-e218fb4e>${ssrInterpolate(a.tag)}</p><span class="muted" data-v-e218fb4e>${ssrInterpolate(a.tracks)} tác phẩm</span></div>`);
      });
      _push(`<!--]--></div></div></section><section id="faq" class="section faq" data-v-e218fb4e><div class="container" data-v-e218fb4e>`);
      _push(ssrRenderComponent(SectionHead, {
        class: "reveal",
        align: "center",
        eyebrow: "Giải đáp nhanh",
        title: "FAQ trước khi bạn giao dịch",
        description: "Những câu hỏi phổ biến về pháp lý, nền tảng khai thác và bàn giao tài sản tác quyền."
      }, null, _parent));
      _push(`<div class="faq-grid" data-v-e218fb4e><!--[-->`);
      ssrRenderList(faqs, (f, i) => {
        _push(`<details class="faq-item reveal" style="${ssrRenderStyle({ transitionDelay: i * 70 + "ms" })}" data-v-e218fb4e><summary data-v-e218fb4e>${ssrInterpolate(f.q)}</summary><p data-v-e218fb4e>${ssrInterpolate(f.a)}</p></details>`);
      });
      _push(`<!--]--></div></div></section><section id="pricing" class="section cta" data-v-e218fb4e><div class="container cta-inner reveal" data-v-e218fb4e><div class="cta-glow" data-v-e218fb4e></div><div class="cta-copy" data-v-e218fb4e><span class="eyebrow" data-v-e218fb4e>Sẵn sàng giao dịch?</span><h2 data-v-e218fb4e>Bắt đầu với gói thử nghiệm <span class="gradient-text" data-v-e218fb4e>miễn phí</span></h2><p data-v-e218fb4e>Tạo tài khoản, thêm tác phẩm đầu tiên vào giỏ và trải nghiệm quy trình ký hợp đồng số chỉ trong vài phút.</p><div class="cta-actions" data-v-e218fb4e><button class="btn btn-primary btn-lg" data-v-e218fb4e>Tạo tài khoản miễn phí</button><button class="btn btn-ghost btn-lg" data-v-e218fb4e>Liên hệ Sales</button></div></div><div class="cta-side" data-v-e218fb4e><div class="cta-checks" data-v-e218fb4e>`);
      _push(ssrRenderComponent(CheckList, { items: ctaChecks }, null, _parent));
      _push(`</div></div></div></section></div>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/views/HomeView.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const HomeView = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-e218fb4e"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index.page",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "MusicA — Thương mại điện tử tác quyền âm nhạc",
      meta: [
        {
          name: "description",
          content: "Giao dịch tác quyền âm nhạc minh bạch, linh hoạt, hợp pháp. Mua tác quyền trực tiếp từ nghệ sĩ."
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(HomeView, _attrs, null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/home/index.page.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
