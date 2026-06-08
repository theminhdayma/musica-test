import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderStyle, ssrInterpolate } from "vue/server-renderer";
import { mergeProps, unref, withCtx, createTextVNode, useSSRContext } from "vue";
import { _ as _export_sfc, a as useCartStore } from "../main.mjs";
import { f as formatVND } from "./catalog-BTAmee6Y.js";
import { useRouter, RouterLink } from "vue-router";
import "@unhead/vue/server";
import "pinia";
const _sfc_main$1 = {
  __name: "CartView",
  __ssrInlineRender: true,
  setup(__props) {
    const cart = useCartStore();
    useRouter();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "cart-page" }, _attrs))} data-v-a0272daf><div class="container" data-v-a0272daf><div class="page-head" data-v-a0272daf><div data-v-a0272daf><span class="eyebrow" data-v-a0272daf>Giỏ tác quyền</span><h1 data-v-a0272daf>Giỏ hàng của bạn</h1><p data-v-a0272daf>Xem lại các gói tác quyền bạn đã cấu hình trước khi ký hợp đồng.</p></div>`);
      _push(ssrRenderComponent(unref(RouterLink), {
        to: "/",
        class: "btn btn-ghost"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`← Tiếp tục mua sắm`);
          } else {
            return [
              createTextVNode("← Tiếp tục mua sắm")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (!unref(cart).items.length) {
        _push(`<div class="empty-cart" data-v-a0272daf><div class="empty-illu" data-v-a0272daf>🎼</div><h3 data-v-a0272daf>Giỏ hàng đang trống</h3><p data-v-a0272daf>Hãy bắt đầu khám phá thư viện tác quyền để thêm gói đầu tiên.</p>`);
        _push(ssrRenderComponent(unref(RouterLink), {
          to: "/",
          class: "btn btn-primary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Khám phá tác phẩm`);
            } else {
              return [
                createTextVNode("Khám phá tác phẩm")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="cart-grid" data-v-a0272daf><div class="lines" data-v-a0272daf><!--[-->`);
        ssrRenderList(unref(cart).items, (item) => {
          _push(`<div class="line-row" data-v-a0272daf><div class="cover" style="${ssrRenderStyle({ background: item.cover })}" data-v-a0272daf></div><div class="info" data-v-a0272daf><div class="line-head" data-v-a0272daf><h3 data-v-a0272daf>${ssrInterpolate(item.title)}</h3><button class="remove" aria-label="Xoá" data-v-a0272daf>✕</button></div><p class="artist" data-v-a0272daf>${ssrInterpolate(item.artist)}</p><div class="config" data-v-a0272daf><!--[-->`);
          ssrRenderList(item.configuration, (v, k) => {
            _push(`<span class="kv" data-v-a0272daf><i data-v-a0272daf>${ssrInterpolate(k)}</i><b data-v-a0272daf>${ssrInterpolate(v)}</b></span>`);
          });
          _push(`<!--]--></div></div><div class="line-price" data-v-a0272daf><span data-v-a0272daf>Tác quyền</span><strong data-v-a0272daf>${ssrInterpolate(unref(formatVND)(item.price))}</strong></div></div>`);
        });
        _push(`<!--]--></div><aside class="summary" data-v-a0272daf><h3 data-v-a0272daf>Tóm tắt đơn</h3><div class="sum-row" data-v-a0272daf><span data-v-a0272daf>Tạm tính (${ssrInterpolate(unref(cart).count)} gói)</span><b data-v-a0272daf>${ssrInterpolate(unref(formatVND)(unref(cart).subtotal))}</b></div><div class="sum-row" data-v-a0272daf><span data-v-a0272daf>Phí xử lý &amp; xác minh (4%)</span><b data-v-a0272daf>${ssrInterpolate(unref(formatVND)(unref(cart).fee))}</b></div><div class="sum-row promo" data-v-a0272daf><span data-v-a0272daf>Mã giảm giá</span><a href="#" data-v-a0272daf>Áp dụng</a></div><hr data-v-a0272daf><div class="sum-total" data-v-a0272daf><span data-v-a0272daf>Tổng cộng</span><strong class="gradient-text" data-v-a0272daf>${ssrInterpolate(unref(formatVND)(unref(cart).total))}</strong></div><button class="btn btn-primary btn-lg full" data-v-a0272daf>Tiến hành ký hợp đồng →</button><ul class="reassure" data-v-a0272daf><li data-v-a0272daf>✓ Hợp đồng số có hiệu lực pháp lý</li><li data-v-a0272daf>✓ Nhận đầy đủ bộ tài sản tác quyền tức thì</li><li data-v-a0272daf>✓ Hỗ trợ giải quyết tranh chấp 24/7</li></ul></aside></div>`);
      }
      _push(`</div></section>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/views/CartView.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const CartView = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-a0272daf"]]);
const _sfc_main = {
  __name: "index.page",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(CartView, _attrs, null, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/cart/index.page.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
