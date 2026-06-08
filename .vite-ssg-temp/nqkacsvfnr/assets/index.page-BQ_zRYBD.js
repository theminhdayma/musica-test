import { ssrRenderAttrs, ssrRenderList, ssrRenderStyle, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { mergeProps, unref, withCtx, createTextVNode, useSSRContext } from "vue";
import { RouterLink } from "vue-router";
import { _ as _export_sfc } from "../main.mjs";
import "@unhead/vue/server";
import "pinia";
const _sfc_main$1 = {
  __name: "SuccessView",
  __ssrInlineRender: true,
  setup(__props) {
    const code = "MUSA-" + Math.random().toString(36).toUpperCase().slice(-8);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "success" }, _attrs))} data-v-a77d4efe><div class="container inner" data-v-a77d4efe><div class="confetti" data-v-a77d4efe><!--[-->`);
      ssrRenderList(24, (i) => {
        _push(`<span style="${ssrRenderStyle({ left: Math.random() * 100 + "%", animationDelay: i * 120 + "ms", background: ["#1f6df0", "#14b8a6", "#5fd9c1", "#2aa7d8"][i % 4] })}" data-v-a77d4efe></span>`);
      });
      _push(`<!--]--></div><div class="badge-success" data-v-a77d4efe><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" data-v-a77d4efe><polyline points="4 12 10 18 20 6" data-v-a77d4efe></polyline></svg></div><h1 data-v-a77d4efe>Mua tác quyền thành công 🎉</h1><p class="lead" data-v-a77d4efe>Hợp đồng số đã được kích hoạt. Bạn có thể tải về bộ tài sản tác quyền và bắt đầu sử dụng tác phẩm theo phạm vi đã mua.</p><div class="code-box" data-v-a77d4efe><span data-v-a77d4efe>Mã giao dịch</span><strong data-v-a77d4efe>${ssrInterpolate(code)}</strong></div><div class="actions" data-v-a77d4efe><button class="btn btn-primary btn-lg" data-v-a77d4efe>⬇ Tải bộ tài sản &amp; hợp đồng</button>`);
      _push(ssrRenderComponent(unref(RouterLink), {
        to: "/",
        class: "btn btn-ghost btn-lg"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Quay lại Khám phá`);
          } else {
            return [
              createTextVNode("Quay lại Khám phá")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="next-steps" data-v-a77d4efe><div class="ns" data-v-a77d4efe><span class="ns-ic" data-v-a77d4efe>📧</span><div data-v-a77d4efe><strong data-v-a77d4efe>Email xác nhận</strong><p data-v-a77d4efe>Bản sao hợp đồng và hoá đơn VAT đã gửi đến email đăng ký.</p></div></div><div class="ns" data-v-a77d4efe><span class="ns-ic" data-v-a77d4efe>🆔</span><div data-v-a77d4efe><strong data-v-a77d4efe>ID xác minh đa nền tảng</strong><p data-v-a77d4efe>Sử dụng ID này khi đăng tải lên YouTube, Facebook, TikTok để được tự động xác minh.</p></div></div><div class="ns" data-v-a77d4efe><span class="ns-ic" data-v-a77d4efe>📊</span><div data-v-a77d4efe><strong data-v-a77d4efe>Quản lý trên Dashboard</strong><p data-v-a77d4efe>Theo dõi lượt sử dụng, doanh thu monetize và lịch sử giao dịch.</p></div></div></div></div></section>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/views/SuccessView.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const SuccessView = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-a77d4efe"]]);
const _sfc_main = {
  __name: "index.page",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(SuccessView, _attrs, null, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/success/index.page.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
