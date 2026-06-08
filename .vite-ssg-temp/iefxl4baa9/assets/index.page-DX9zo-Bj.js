import { computed, ref, watch, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext, defineComponent } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderAttr, ssrRenderList, ssrRenderClass } from "vue/server-renderer";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { g as getProduct, p as products, d as defaultDeliverables, f as formatVND } from "./catalog-BTAmee6Y.js";
import { t as toInternalProductId } from "./idMap-BgV6FToW.js";
import { _ as _export_sfc, a as useCartStore } from "../main.mjs";
import { W as WaveBars, C as CheckList, P as ProductCard } from "./CheckList-mnmK9I2c.js";
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
    const internalProductId = computed(() => toInternalProductId(String(route.params.id || "")));
    const product = computed(() => getProduct(internalProductId.value));
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
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "not-found container" }, _attrs))} data-v-3d92c52e><h2 data-v-3d92c52e>Không tìm thấy tác phẩm</h2>`);
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
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "product-page" }, _attrs))} data-v-3d92c52e><div class="container crumbs" data-v-3d92c52e>`);
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
        _push(`<span data-v-3d92c52e>›</span>`);
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
        _push(`<span data-v-3d92c52e>›</span><span class="muted" data-v-3d92c52e>${ssrInterpolate(product.value.title)}</span></div><section class="hero-product" data-v-3d92c52e><div class="container product-grid" data-v-3d92c52e><div class="left" data-v-3d92c52e><div class="player-card" data-v-3d92c52e><div class="player-row" data-v-3d92c52e><div class="art" style="${ssrRenderStyle({ background: product.value.cover })}" aria-hidden="true" data-v-3d92c52e><button class="play"${ssrRenderAttr("aria-label", isPlaying.value ? "Tạm dừng" : "Phát")} data-v-3d92c52e>`);
        if (!isPlaying.value) {
          _push(`<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" data-v-3d92c52e><path d="M8 5v14l11-7z" data-v-3d92c52e></path></svg>`);
        } else {
          _push(`<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" data-v-3d92c52e><path d="M6 5h4v14H6zM14 5h4v14h-4z" data-v-3d92c52e></path></svg>`);
        }
        _push(`</button></div><div class="meta-block" data-v-3d92c52e><div class="title-row" data-v-3d92c52e><span class="badge-cat" data-v-3d92c52e>${ssrInterpolate(product.value.category.toUpperCase())}</span><span class="isrc" data-v-3d92c52e>ISRC · ${ssrInterpolate(product.value.isrc)}</span></div><h1 data-v-3d92c52e>${ssrInterpolate(product.value.title)}</h1><p class="byline" data-v-3d92c52e>${ssrInterpolate(product.value.artist)} · ${ssrInterpolate(product.value.publisher)}</p><div class="wave-line" data-v-3d92c52e>`);
        _push(ssrRenderComponent(WaveBars, {
          peaks: peaks.value,
          size: "sm",
          variant: "muted",
          progress: progress.value
        }, null, _parent));
        _push(`<span class="time" data-v-3d92c52e>${ssrInterpolate(formatTime(progress.value, product.value.duration))} <em data-v-3d92c52e>/ ${ssrInterpolate(product.value.duration)}</em></span></div></div></div><div class="meta-row" data-v-3d92c52e><div data-v-3d92c52e><span data-v-3d92c52e>BPM</span><b data-v-3d92c52e>${ssrInterpolate(product.value.bpm)}</b></div><div data-v-3d92c52e><span data-v-3d92c52e>Tông</span><b data-v-3d92c52e>${ssrInterpolate(product.value.key)}</b></div><div data-v-3d92c52e><span data-v-3d92c52e>Phát hành</span><b data-v-3d92c52e>${ssrInterpolate(formatDate(product.value.releaseDate))}</b></div><div data-v-3d92c52e><span data-v-3d92c52e>Mood</span><b data-v-3d92c52e>${ssrInterpolate(product.value.mood)}</b></div></div></div><div class="info-block" data-v-3d92c52e><h3 data-v-3d92c52e>Về tác phẩm</h3><p data-v-3d92c52e>${ssrInterpolate(product.value.description)}</p><div class="tags" data-v-3d92c52e><!--[-->`);
        ssrRenderList(product.value.tags, (t) => {
          _push(`<span class="tag" data-v-3d92c52e>${ssrInterpolate(t)}</span>`);
        });
        _push(`<!--]--></div></div><div class="info-block" data-v-3d92c52e><h3 data-v-3d92c52e>Nội dung tác quyền bao gồm</h3><p class="muted" data-v-3d92c52e>Khi mua tác quyền, nghệ sĩ sẽ bàn giao đầy đủ các tài sản số sau đây kèm hợp đồng:</p>`);
        _push(ssrRenderComponent(CheckList, { items: unref(defaultDeliverables) }, null, _parent));
        _push(`</div><div class="info-block" data-v-3d92c52e><h3 data-v-3d92c52e>Quyền sở hữu &amp; xác minh</h3><ul class="ownership" data-v-3d92c52e><li data-v-3d92c52e><span data-v-3d92c52e>Chủ sở hữu</span><b data-v-3d92c52e>${ssrInterpolate(product.value.publisher)}</b></li><li data-v-3d92c52e><span data-v-3d92c52e>Mã ISRC</span><b data-v-3d92c52e>${ssrInterpolate(product.value.isrc)}</b></li><li data-v-3d92c52e><span data-v-3d92c52e>Tác giả</span><b data-v-3d92c52e>${ssrInterpolate(product.value.artist)}</b></li><li data-v-3d92c52e><span data-v-3d92c52e>Ngày đăng ký bản quyền</span><b data-v-3d92c52e>${ssrInterpolate(formatDate(product.value.releaseDate))}</b></li><li data-v-3d92c52e><span data-v-3d92c52e>Trạng thái xác minh</span><b class="ok" data-v-3d92c52e>✓ Đã xác minh trên MusicA</b></li></ul></div></div><aside class="right" data-v-3d92c52e><div class="config-card" data-v-3d92c52e><div class="config-head" data-v-3d92c52e><span class="eyebrow" data-v-3d92c52e>Cấu hình tác quyền</span><h2 data-v-3d92c52e>Tuỳ chọn gói mua</h2></div><div class="field" data-v-3d92c52e><label class="field-label" data-v-3d92c52e>1. Mục đích sử dụng</label><div class="purpose-grid" data-v-3d92c52e><button class="${ssrRenderClass(["ptile", { active: purpose.value === "youtube" }])}" data-v-3d92c52e><div class="picon yt" data-v-3d92c52e><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" data-v-3d92c52e><path d="M23 7.5a4 4 0 0 0-2.8-2.8C18.3 4.2 12 4.2 12 4.2s-6.3 0-8.2.5A4 4 0 0 0 1 7.5 41.6 41.6 0 0 0 .5 12a41.6 41.6 0 0 0 .5 4.5 4 4 0 0 0 2.8 2.8c1.9.5 8.2.5 8.2.5s6.3 0 8.2-.5A4 4 0 0 0 23 16.5 41.6 41.6 0 0 0 23.5 12a41.6 41.6 0 0 0-.5-4.5zM9.8 15.5v-7l6 3.5z" data-v-3d92c52e></path></svg></div><strong data-v-3d92c52e>Phát hành YouTube</strong><span data-v-3d92c52e>MV, vlog, short-form</span></button><button class="${ssrRenderClass(["ptile", { active: purpose.value === "performance" }])}" data-v-3d92c52e><div class="picon perf" data-v-3d92c52e><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-3d92c52e><path d="M12 1v22" data-v-3d92c52e></path><path d="M19 5v14" data-v-3d92c52e></path><path d="M5 5v14" data-v-3d92c52e></path><circle cx="12" cy="12" r="3" data-v-3d92c52e></circle></svg></div><strong data-v-3d92c52e>Biểu diễn trực tiếp</strong><span data-v-3d92c52e>Concert, sự kiện, gala</span></button></div></div>`);
        if (purpose.value === "youtube") {
          _push(`<div class="field-group" data-v-3d92c52e><div class="field" data-v-3d92c52e><label class="field-label" data-v-3d92c52e>2. Bật kiếm tiền</label><div class="toggle-row" data-v-3d92c52e><button class="${ssrRenderClass(["toggle", { active: ytMonetize.value }])}"${ssrRenderAttr("aria-pressed", ytMonetize.value)} data-v-3d92c52e><span class="dot" data-v-3d92c52e></span></button><div class="toggle-text" data-v-3d92c52e><strong data-v-3d92c52e>${ssrInterpolate(ytMonetize.value ? "Có bật kiếm tiền" : "Không bật kiếm tiền")}</strong><span data-v-3d92c52e>${ssrInterpolate(ytMonetize.value ? "Cho phép YouTube monetize nội dung." : "Chỉ dùng phi thương mại, giá thấp hơn.")}</span></div></div></div><div class="field" data-v-3d92c52e><label class="field-label" data-v-3d92c52e>3. Thời hạn</label><div class="seg" data-v-3d92c52e><!--[-->`);
          ssrRenderList(ytDurations, (d) => {
            _push(`<button class="${ssrRenderClass(["seg-btn", { active: ytDurationKey.value === d.k }])}" data-v-3d92c52e>${ssrInterpolate(d.label)}</button>`);
          });
          _push(`<!--]--></div></div><div class="field" data-v-3d92c52e><label class="field-label" data-v-3d92c52e>4. Phạm vi địa lý</label><div class="seg" data-v-3d92c52e><button class="${ssrRenderClass(["seg-btn", { active: ytScope.value === "global" }])}" data-v-3d92c52e>🌐 Toàn cầu</button><button class="${ssrRenderClass(["seg-btn", { active: ytScope.value === "vn" }])}" data-v-3d92c52e>🇻🇳 Việt Nam</button></div></div></div>`);
        } else {
          _push(`<div class="field-group" data-v-3d92c52e><div class="field" data-v-3d92c52e><label class="field-label" data-v-3d92c52e>2. Quy mô sự kiện</label><div class="scale-list" data-v-3d92c52e><!--[-->`);
          ssrRenderList(perfScales, (s) => {
            _push(`<button class="${ssrRenderClass(["scale-row", { active: perfScale.value === s.k }])}" data-v-3d92c52e><div class="scale-radio" data-v-3d92c52e></div><div class="scale-body" data-v-3d92c52e><strong data-v-3d92c52e>${ssrInterpolate(s.label)}</strong><span data-v-3d92c52e>${ssrInterpolate(s.desc)}</span></div><span class="scale-mult" data-v-3d92c52e>×${ssrInterpolate(s.mult.toFixed(1))}</span></button>`);
          });
          _push(`<!--]--></div></div><div class="field" data-v-3d92c52e><label class="field-label" data-v-3d92c52e>3. Số buổi biểu diễn</label><div class="counter" data-v-3d92c52e><button aria-label="Giảm" data-v-3d92c52e>−</button><div class="counter-val" data-v-3d92c52e>${ssrInterpolate(perfShows.value)} <small data-v-3d92c52e>buổi</small></div><button aria-label="Tăng" data-v-3d92c52e>+</button></div></div></div>`);
        }
        _push(`<div class="price-summary" data-v-3d92c52e><div class="ps-rows" data-v-3d92c52e><!--[-->`);
        ssrRenderList(calc.value.breakdown, (r, i) => {
          _push(`<div class="ps-row" data-v-3d92c52e><span data-v-3d92c52e>${ssrInterpolate(r.label)}</span>`);
          if (r.value) {
            _push(`<span data-v-3d92c52e>${ssrInterpolate(unref(formatVND)(r.value))}</span>`);
          } else {
            _push(`<span class="mult" data-v-3d92c52e>× ${ssrInterpolate(r.mult.toFixed(2))}</span>`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div><div class="ps-total" data-v-3d92c52e><span data-v-3d92c52e>Tạm tính</span><strong class="gradient-text" data-v-3d92c52e>${ssrInterpolate(unref(formatVND)(calc.value.total))}</strong></div><small class="muted" data-v-3d92c52e>Chưa gồm phí xử lý 4% &amp; VAT. Hợp đồng số phát hành ngay sau thanh toán.</small></div><div class="actions" data-v-3d92c52e><button class="btn btn-primary btn-lg" data-v-3d92c52e>Tiến hành mua tác quyền</button><button class="btn btn-ghost btn-lg" data-v-3d92c52e>`);
        if (!addedFlash.value) {
          _push(`<span data-v-3d92c52e>Thêm vào giỏ</span>`);
        } else {
          _push(`<span data-v-3d92c52e>✓ Đã thêm</span>`);
        }
        _push(`</button></div><div class="micro-trust" data-v-3d92c52e><span data-v-3d92c52e>🔒 Thanh toán bảo mật</span><span data-v-3d92c52e>📜 Ký xác thực điện tử</span><span data-v-3d92c52e>↩ Hoàn tiền nếu xung đột</span></div></div></aside></div></section><section class="section related" data-v-3d92c52e><div class="container" data-v-3d92c52e><div class="section-head reveal" data-v-3d92c52e><div data-v-3d92c52e><span class="eyebrow" data-v-3d92c52e>Cùng thể loại</span><h2 data-v-3d92c52e>Tác phẩm bạn có thể thích</h2></div></div><div class="grid" data-v-3d92c52e><!--[-->`);
        ssrRenderList(related.value, (p, i) => {
          _push(`<div class="reveal" style="${ssrRenderStyle({ transitionDelay: i * 50 + "ms" })}" data-v-3d92c52e>`);
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
const ProductView = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-3d92c52e"]]);
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
