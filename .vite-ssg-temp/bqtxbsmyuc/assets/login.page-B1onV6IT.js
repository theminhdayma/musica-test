import { defineComponent, ref, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrInterpolate } from "vue/server-renderer";
import { useRouter, useRoute } from "vue-router";
import { u as useAuthStore } from "../main.mjs";
import "@unhead/vue/server";
import "pinia";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login.page",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    useRoute();
    useAuthStore();
    const email = ref("");
    const password = ref("");
    const remember = ref(true);
    const submitting = ref(false);
    const errorMessage = ref(null);
    const errorRequestId = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container section" }, _attrs))}><div class="card" style="${ssrRenderStyle({ "max-width": "520px", "margin": "0 auto" })}"><h1 style="${ssrRenderStyle({ "margin": "0 0 8px" })}">Đăng nhập</h1><p class="muted" style="${ssrRenderStyle({ "margin": "0 0 18px" })}">Dùng tài khoản BUYER hoặc ARTIST để truy cập khu vực của bạn.</p><div class="field"><label class="label">Email</label><input${ssrRenderAttr("value", email.value)} class="input" type="email" autocomplete="email"></div><div class="field"><label class="label">Mật khẩu</label><input${ssrRenderAttr("value", password.value)} class="input" type="password" autocomplete="current-password"></div><label style="${ssrRenderStyle({ "display": "flex", "gap": "10px", "align-items": "center", "margin": "12px 0 16px" })}"><input${ssrIncludeBooleanAttr(Array.isArray(remember.value) ? ssrLooseContain(remember.value, null) : remember.value) ? " checked" : ""} type="checkbox"><span class="muted">Ghi nhớ trong phiên làm việc</span></label>`);
      if (errorMessage.value) {
        _push(`<div class="card" style="${ssrRenderStyle({ "background": "#fff1f2", "border-color": "#fecdd3", "margin-bottom": "12px" })}"><div style="${ssrRenderStyle({ "font-weight": "700" })}">Không thể đăng nhập</div><div class="muted">${ssrInterpolate(errorMessage.value)}</div>`);
        if (errorRequestId.value) {
          _push(`<div class="muted" style="${ssrRenderStyle({ "margin-top": "6px" })}">Request ID: ${ssrInterpolate(errorRequestId.value)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="btn btn-primary btn-lg" type="button" style="${ssrRenderStyle({ "width": "100%" })}"${ssrIncludeBooleanAttr(submitting.value) ? " disabled" : ""}>`);
      if (submitting.value) {
        _push(`<span>Đang đăng nhập…</span>`);
      } else {
        _push(`<span>Đăng nhập</span>`);
      }
      _push(`</button></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/auth/login.page.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
