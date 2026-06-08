import { computed, ref, watch, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext, defineComponent } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderAttr, ssrRenderList, ssrRenderClass } from "vue/server-renderer";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { g as getProduct, p as products, d as defaultDeliverables, f as formatVND } from "./catalog-7r_b5cgQ.js";
import { _ as _export_sfc, a as useCartStore } from "../main.mjs";
import { W as WaveBars, C as CheckList, P as ProductCard } from "./CheckList-C6BpBCV2.js";
import { useHead } from "@unhead/vue";
import "@unhead/vue/server";
import "pinia";
const _sfc_main$1 = {
  __name: "ProductView",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    useCartStore();
    const product = computed(() => getProduct(route.params.id));
    const purpose = ref("youtube");
    const ytMonetize = ref(true);
    const ytDurationKey = ref("12");
    const ytScope = ref("global");
    const perfShows = ref(1);
    const perfScale = ref("medium");
    const ytDurations = [
      { k: "6", label: "6 tháng", mult: 0.55 },
      { k: "12", label: "12 tháng", mult: 1 },
      { k: "24", label: "2 năm", mult: 1.7 },
      { k: "36", label: "3 năm", mult: 2.3 }
    ];
    const perfScales = [
      { k: "small", label: "Dưới 200 khách", mult: 1, desc: "Sự kiện nội bộ, club, lounge" },
      { k: "medium", label: "200 — 1.000 khách", mult: 1.8, desc: "Hội thảo, gala, fanmeeting" },
      { k: "large", label: "1.000 — 5.000 khách", mult: 3.2, desc: "Concert vừa, music night" },
      { k: "arena", label: "Trên 5.000 khách", mult: 5.5, desc: "Festival, arena, đại nhạc hội" }
    ];
    const isPlaying = ref(false);
    const progress = ref(0);
    const peaks = computed(() => {
      var _a;
      return (((_a = product.value) == null ? void 0 : _a.samplePeak) || []).map((v) => v / 60);
    });
    const calc = computed(() => {
      if (!product.value) return null;
      const base = product.value.basePrice;
      if (purpose.value === "youtube") {
        const d = ytDurations.find((x) => x.k === ytDurationKey.value);
        const monetizeMult = ytMonetize.value ? 1.5 : 1;
        const scopeMult = ytScope.value === "global" ? 1 : 0.7;
        const total2 = Math.round(base * d.mult * monetizeMult * scopeMult);
        return {
          total: total2,
          breakdown: [
            { label: "Giá cơ bản tác quyền", value: base },
            { label: `Thời hạn — ${d.label}`, mult: d.mult },
            { label: `Bật kiếm tiền — ${ytMonetize.value ? "Có" : "Không"}`, mult: monetizeMult },
            { label: `Phạm vi — ${ytScope.value === "global" ? "Toàn cầu" : "Việt Nam"}`, mult: scopeMult }
          ],
          summary: {
            "Mục đích": "Phát hành YouTube",
            "Thời hạn": d.label,
            "Bật kiếm tiền": ytMonetize.value ? "Có" : "Không",
            "Phạm vi": ytScope.value === "global" ? "Toàn cầu" : "Việt Nam"
          }
        };
      }
      const s = perfScales.find((x) => x.k === perfScale.value);
      const total = Math.round(base * s.mult * (1 + (perfShows.value - 1) * 0.6));
      return {
        total,
        breakdown: [
          { label: "Giá cơ bản tác quyền", value: base },
          { label: `Quy mô — ${s.label}`, mult: s.mult },
          { label: `Số buổi — ${perfShows.value} buổi`, mult: 1 + (perfShows.value - 1) * 0.6 }
        ],
        summary: {
          "Mục đích": "Biểu diễn trực tiếp",
          "Quy mô": s.label,
          "Số buổi": `${perfShows.value} buổi`
        }
      };
    });
    const related = computed(
      () => products.filter((p) => {
        var _a, _b;
        return p.id !== ((_a = product.value) == null ? void 0 : _a.id) && p.category === ((_b = product.value) == null ? void 0 : _b.category);
      }).slice(0, 4)
    );
    const addedFlash = ref(false);
    watch(() => route.params.id, () => {
      purpose.value = "youtube";
      ytMonetize.value = true;
      ytDurationKey.value = "12";
      perfShows.value = 1;
      perfScale.value = "medium";
    });
    function formatDate(s) {
      return new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    function formatTime(pct, duration) {
      const [m, s] = duration.split(":").map(Number);
      const total = m * 60 + s;
      const cur = Math.floor(total * pct / 100);
      return `${Math.floor(cur / 60)}:${String(cur % 60).padStart(2, "0")}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      if (!product.value) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "not-found container" }, _attrs))} data-v-88729f5a><h2 data-v-88729f5a>Không tìm thấy tác phẩm</h2>`);
        _push(ssrRenderComponent(unref(RouterLink), {
          class: "btn btn-primary",
          to: "/"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Quay lại trang chủ`);
            } else {
              return [
                createTextVNode("Quay lại trang chủ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "product-page" }, _attrs))} data-v-88729f5a><div class="container crumbs" data-v-88729f5a>`);
        _push(ssrRenderComponent(unref(RouterLink), { to: "/" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Trang chủ`);
            } else {
              return [
                createTextVNode("Trang chủ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<span data-v-88729f5a>›</span>`);
        _push(ssrRenderComponent(unref(RouterLink), {
          to: "/",
          class: "muted"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(product.value.category.toUpperCase())}`);
            } else {
              return [
                createTextVNode(toDisplayString(product.value.category.toUpperCase()), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<span data-v-88729f5a>›</span><span class="muted" data-v-88729f5a>${ssrInterpolate(product.value.title)}</span></div><section class="hero-product" data-v-88729f5a><div class="container product-grid" data-v-88729f5a><div class="left" data-v-88729f5a><div class="player-card" data-v-88729f5a><div class="player-row" data-v-88729f5a><div class="art" style="${ssrRenderStyle({ background: product.value.cover })}" aria-hidden="true" data-v-88729f5a><button class="play"${ssrRenderAttr("aria-label", isPlaying.value ? "Tạm dừng" : "Phát")} data-v-88729f5a>`);
        if (!isPlaying.value) {
          _push(`<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" data-v-88729f5a><path d="M8 5v14l11-7z" data-v-88729f5a></path></svg>`);
        } else {
          _push(`<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" data-v-88729f5a><path d="M6 5h4v14H6zM14 5h4v14h-4z" data-v-88729f5a></path></svg>`);
        }
        _push(`</button></div><div class="meta-block" data-v-88729f5a><div class="title-row" data-v-88729f5a><span class="badge-cat" data-v-88729f5a>${ssrInterpolate(product.value.category.toUpperCase())}</span><span class="isrc" data-v-88729f5a>ISRC · ${ssrInterpolate(product.value.isrc)}</span></div><h1 data-v-88729f5a>${ssrInterpolate(product.value.title)}</h1><p class="byline" data-v-88729f5a>${ssrInterpolate(product.value.artist)} · ${ssrInterpolate(product.value.publisher)}</p><div class="wave-line" data-v-88729f5a>`);
        _push(ssrRenderComponent(WaveBars, {
          peaks: peaks.value,
          size: "sm",
          variant: "muted",
          progress: progress.value
        }, null, _parent));
        _push(`<span class="time" data-v-88729f5a>${ssrInterpolate(formatTime(progress.value, product.value.duration))} <em data-v-88729f5a>/ ${ssrInterpolate(product.value.duration)}</em></span></div></div></div><div class="meta-row" data-v-88729f5a><div data-v-88729f5a><span data-v-88729f5a>BPM</span><b data-v-88729f5a>${ssrInterpolate(product.value.bpm)}</b></div><div data-v-88729f5a><span data-v-88729f5a>Tông</span><b data-v-88729f5a>${ssrInterpolate(product.value.key)}</b></div><div data-v-88729f5a><span data-v-88729f5a>Phát hành</span><b data-v-88729f5a>${ssrInterpolate(formatDate(product.value.releaseDate))}</b></div><div data-v-88729f5a><span data-v-88729f5a>Mood</span><b data-v-88729f5a>${ssrInterpolate(product.value.mood)}</b></div></div></div><div class="info-block" data-v-88729f5a><h3 data-v-88729f5a>Về tác phẩm</h3><p data-v-88729f5a>${ssrInterpolate(product.value.description)}</p><div class="tags" data-v-88729f5a><!--[-->`);
        ssrRenderList(product.value.tags, (t) => {
          _push(`<span class="tag" data-v-88729f5a>${ssrInterpolate(t)}</span>`);
        });
        _push(`<!--]--></div></div><div class="info-block" data-v-88729f5a><h3 data-v-88729f5a>Nội dung tác quyền bao gồm</h3><p class="muted" data-v-88729f5a>Khi mua tác quyền, nghệ sĩ sẽ bàn giao đầy đủ các tài sản số sau đây kèm hợp đồng:</p>`);
        _push(ssrRenderComponent(CheckList, { items: unref(defaultDeliverables) }, null, _parent));
        _push(`</div><div class="info-block" data-v-88729f5a><h3 data-v-88729f5a>Quyền sở hữu &amp; xác minh</h3><ul class="ownership" data-v-88729f5a><li data-v-88729f5a><span data-v-88729f5a>Chủ sở hữu</span><b data-v-88729f5a>${ssrInterpolate(product.value.publisher)}</b></li><li data-v-88729f5a><span data-v-88729f5a>Mã ISRC</span><b data-v-88729f5a>${ssrInterpolate(product.value.isrc)}</b></li><li data-v-88729f5a><span data-v-88729f5a>Tác giả</span><b data-v-88729f5a>${ssrInterpolate(product.value.artist)}</b></li><li data-v-88729f5a><span data-v-88729f5a>Ngày đăng ký bản quyền</span><b data-v-88729f5a>${ssrInterpolate(formatDate(product.value.releaseDate))}</b></li><li data-v-88729f5a><span data-v-88729f5a>Trạng thái xác minh</span><b class="ok" data-v-88729f5a>✓ Đã xác minh trên MusicA</b></li></ul></div></div><aside class="right" data-v-88729f5a><div class="config-card" data-v-88729f5a><div class="config-head" data-v-88729f5a><span class="eyebrow" data-v-88729f5a>Cấu hình tác quyền</span><h2 data-v-88729f5a>Tuỳ chọn gói mua</h2></div><div class="field" data-v-88729f5a><label class="field-label" data-v-88729f5a>1. Mục đích sử dụng</label><div class="purpose-grid" data-v-88729f5a><button class="${ssrRenderClass(["ptile", { active: purpose.value === "youtube" }])}" data-v-88729f5a><div class="picon yt" data-v-88729f5a><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" data-v-88729f5a><path d="M23 7.5a4 4 0 0 0-2.8-2.8C18.3 4.2 12 4.2 12 4.2s-6.3 0-8.2.5A4 4 0 0 0 1 7.5 41.6 41.6 0 0 0 .5 12a41.6 41.6 0 0 0 .5 4.5 4 4 0 0 0 2.8 2.8c1.9.5 8.2.5 8.2.5s6.3 0 8.2-.5A4 4 0 0 0 23 16.5 41.6 41.6 0 0 0 23.5 12a41.6 41.6 0 0 0-.5-4.5zM9.8 15.5v-7l6 3.5z" data-v-88729f5a></path></svg></div><strong data-v-88729f5a>Phát hành YouTube</strong><span data-v-88729f5a>MV, vlog, short-form</span></button><button class="${ssrRenderClass(["ptile", { active: purpose.value === "performance" }])}" data-v-88729f5a><div class="picon perf" data-v-88729f5a><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-88729f5a><path d="M12 1v22" data-v-88729f5a></path><path d="M19 5v14" data-v-88729f5a></path><path d="M5 5v14" data-v-88729f5a></path><circle cx="12" cy="12" r="3" data-v-88729f5a></circle></svg></div><strong data-v-88729f5a>Biểu diễn trực tiếp</strong><span data-v-88729f5a>Concert, sự kiện, gala</span></button></div></div>`);
        if (purpose.value === "youtube") {
          _push(`<div class="field-group" data-v-88729f5a><div class="field" data-v-88729f5a><label class="field-label" data-v-88729f5a>2. Bật kiếm tiền</label><div class="toggle-row" data-v-88729f5a><button class="${ssrRenderClass(["toggle", { active: ytMonetize.value }])}"${ssrRenderAttr("aria-pressed", ytMonetize.value)} data-v-88729f5a><span class="dot" data-v-88729f5a></span></button><div class="toggle-text" data-v-88729f5a><strong data-v-88729f5a>${ssrInterpolate(ytMonetize.value ? "Có bật kiếm tiền" : "Không bật kiếm tiền")}</strong><span data-v-88729f5a>${ssrInterpolate(ytMonetize.value ? "Cho phép YouTube monetize nội dung." : "Chỉ dùng phi thương mại, giá thấp hơn.")}</span></div></div></div><div class="field" data-v-88729f5a><label class="field-label" data-v-88729f5a>3. Thời hạn</label><div class="seg" data-v-88729f5a><!--[-->`);
          ssrRenderList(ytDurations, (d) => {
            _push(`<button class="${ssrRenderClass(["seg-btn", { active: ytDurationKey.value === d.k }])}" data-v-88729f5a>${ssrInterpolate(d.label)}</button>`);
          });
          _push(`<!--]--></div></div><div class="field" data-v-88729f5a><label class="field-label" data-v-88729f5a>4. Phạm vi địa lý</label><div class="seg" data-v-88729f5a><button class="${ssrRenderClass(["seg-btn", { active: ytScope.value === "global" }])}" data-v-88729f5a>🌐 Toàn cầu</button><button class="${ssrRenderClass(["seg-btn", { active: ytScope.value === "vn" }])}" data-v-88729f5a>🇻🇳 Việt Nam</button></div></div></div>`);
        } else {
          _push(`<div class="field-group" data-v-88729f5a><div class="field" data-v-88729f5a><label class="field-label" data-v-88729f5a>2. Quy mô sự kiện</label><div class="scale-list" data-v-88729f5a><!--[-->`);
          ssrRenderList(perfScales, (s) => {
            _push(`<button class="${ssrRenderClass(["scale-row", { active: perfScale.value === s.k }])}" data-v-88729f5a><div class="scale-radio" data-v-88729f5a></div><div class="scale-body" data-v-88729f5a><strong data-v-88729f5a>${ssrInterpolate(s.label)}</strong><span data-v-88729f5a>${ssrInterpolate(s.desc)}</span></div><span class="scale-mult" data-v-88729f5a>×${ssrInterpolate(s.mult.toFixed(1))}</span></button>`);
          });
          _push(`<!--]--></div></div><div class="field" data-v-88729f5a><label class="field-label" data-v-88729f5a>3. Số buổi biểu diễn</label><div class="counter" data-v-88729f5a><button aria-label="Giảm" data-v-88729f5a>−</button><div class="counter-val" data-v-88729f5a>${ssrInterpolate(perfShows.value)} <small data-v-88729f5a>buổi</small></div><button aria-label="Tăng" data-v-88729f5a>+</button></div></div></div>`);
        }
        _push(`<div class="price-summary" data-v-88729f5a><div class="ps-rows" data-v-88729f5a><!--[-->`);
        ssrRenderList(calc.value.breakdown, (r, i) => {
          _push(`<div class="ps-row" data-v-88729f5a><span data-v-88729f5a>${ssrInterpolate(r.label)}</span>`);
          if (r.value) {
            _push(`<span data-v-88729f5a>${ssrInterpolate(unref(formatVND)(r.value))}</span>`);
          } else {
            _push(`<span class="mult" data-v-88729f5a>× ${ssrInterpolate(r.mult.toFixed(2))}</span>`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div><div class="ps-total" data-v-88729f5a><span data-v-88729f5a>Tạm tính</span><strong class="gradient-text" data-v-88729f5a>${ssrInterpolate(unref(formatVND)(calc.value.total))}</strong></div><small class="muted" data-v-88729f5a>Chưa gồm phí xử lý 4% &amp; VAT. Hợp đồng số phát hành ngay sau thanh toán.</small></div><div class="actions" data-v-88729f5a><button class="btn btn-primary btn-lg" data-v-88729f5a>Tiến hành mua tác quyền</button><button class="btn btn-ghost btn-lg" data-v-88729f5a>`);
        if (!addedFlash.value) {
          _push(`<span data-v-88729f5a>Thêm vào giỏ</span>`);
        } else {
          _push(`<span data-v-88729f5a>✓ Đã thêm</span>`);
        }
        _push(`</button></div><div class="micro-trust" data-v-88729f5a><span data-v-88729f5a>🔒 Thanh toán bảo mật</span><span data-v-88729f5a>📜 Ký xác thực điện tử</span><span data-v-88729f5a>↩ Hoàn tiền nếu xung đột</span></div></div></aside></div></section><section class="section related" data-v-88729f5a><div class="container" data-v-88729f5a><div class="section-head reveal" data-v-88729f5a><div data-v-88729f5a><span class="eyebrow" data-v-88729f5a>Cùng thể loại</span><h2 data-v-88729f5a>Tác phẩm bạn có thể thích</h2></div></div><div class="grid" data-v-88729f5a><!--[-->`);
        ssrRenderList(related.value, (p, i) => {
          _push(`<div class="reveal" style="${ssrRenderStyle({ transitionDelay: i * 50 + "ms" })}" data-v-88729f5a>`);
          _push(ssrRenderComponent(ProductCard, { product: p }, null, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div></div></section></div>`);
      }
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/views/ProductView.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const ProductView = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-88729f5a"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index.page",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const id = String(route.params.id || "");
    useHead({
      title: id ? `Tác phẩm ${id} — MusicA` : "Chi tiết tác phẩm — MusicA",
      meta: [
        {
          name: "description",
          content: "Xem chi tiết tác phẩm và cấu hình gói tác quyền phù hợp nhu cầu sử dụng."
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(ProductView, _attrs, null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/product/index.page.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
