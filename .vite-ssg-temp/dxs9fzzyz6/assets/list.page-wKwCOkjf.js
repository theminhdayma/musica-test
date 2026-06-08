import { defineComponent, ref, computed, onMounted, resolveComponent, mergeProps, unref, withCtx, createVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderAttr, ssrRenderList, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { u as useAsyncResource, A as ApiError, _ as _sfc_main$2 } from "./SkeletonLine-BugctRi_.js";
import { _ as _sfc_main$1 } from "./SkeletonCard-sSKIgVwm.js";
import { l as listMyProducts } from "./api-DInnjDIY.js";
import "../main.mjs";
import "@unhead/vue/server";
import "vue-router";
import "pinia";
import "./catalog-BTAmee6Y.js";
const pageSize = 10;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "list.page",
  __ssrInlineRender: true,
  setup(__props) {
    const q = ref("");
    const page = ref(1);
    const resource = useAsyncResource(async () => {
      return await listMyProducts({ page: page.value, pageSize, q: q.value.trim() || void 0 });
    });
    const items = computed(() => {
      var _a;
      return ((_a = resource.data.value) == null ? void 0 : _a.data.items) || [];
    });
    const meta = computed(() => {
      var _a, _b;
      return ((_b = (_a = resource.data.value) == null ? void 0 : _a.meta) == null ? void 0 : _b.pagination) || null;
    });
    const requestId = computed(() => resource.error.value instanceof ApiError ? resource.error.value.requestId : null);
    const errorMessage = computed(() => resource.error.value instanceof ApiError ? resource.error.value.message : resource.error.value instanceof Error ? resource.error.value.message : "Không thể tải dữ liệu");
    function reload() {
      resource.run();
    }
    onMounted(() => {
      reload();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_RouterLink = resolveComponent("RouterLink");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container section" }, _attrs))}><div style="${ssrRenderStyle({ "display": "flex", "gap": "12px", "align-items": "baseline", "justify-content": "space-between", "flex-wrap": "wrap" })}"><h1 style="${ssrRenderStyle({ "margin": "0" })}">Tác phẩm của tôi</h1><form style="${ssrRenderStyle({ "display": "flex", "gap": "10px", "align-items": "center" })}"><input${ssrRenderAttr("value", q.value)} class="input" type="search" placeholder="Tìm theo tên tác phẩm…" style="${ssrRenderStyle({ "min-width": "260px" })}"><button class="btn btn-soft btn-sm" type="submit">Tìm</button></form></div><div style="${ssrRenderStyle({ "margin-top": "18px", "display": "grid", "gap": "12px" })}">`);
      if (unref(resource).status.value === "loading" || unref(resource).status.value === "idle") {
        _push(`<!--[-->`);
        ssrRenderList(6, (i) => {
          _push(ssrRenderComponent(_sfc_main$1, { key: i }, null, _parent));
        });
        _push(`<!--]-->`);
      } else if (unref(resource).status.value === "error") {
        _push(ssrRenderComponent(_sfc_main$2, {
          title: "Không thể tải danh sách tác phẩm",
          message: errorMessage.value,
          "request-id": requestId.value,
          "can-retry": true,
          onRetry: reload
        }, null, _parent));
      } else if (!items.value.length) {
        _push(`<div class="card"><div style="${ssrRenderStyle({ "font-weight": "800" })}">Chưa có tác phẩm</div><div class="muted" style="${ssrRenderStyle({ "margin-top": "6px" })}">Tác phẩm sẽ xuất hiện tại đây sau khi được tạo.</div></div>`);
      } else {
        _push(`<!--[-->`);
        ssrRenderList(items.value, (it) => {
          _push(ssrRenderComponent(_component_RouterLink, {
            key: it.id,
            class: "card",
            to: { name: "my-product-detail", params: { productId: it.id } },
            style: { "display": "flex", "gap": "12px", "align-items": "center", "justify-content": "space-between" }
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div style="${ssrRenderStyle({ "min-width": "0" })}"${_scopeId}><div style="${ssrRenderStyle({ "font-weight": "800", "white-space": "nowrap", "overflow": "hidden", "text-overflow": "ellipsis" })}"${_scopeId}>${ssrInterpolate(it.title)}</div><div class="muted" style="${ssrRenderStyle({ "margin-top": "4px" })}"${_scopeId}>${ssrInterpolate(it.productCode)} · ${ssrInterpolate(it.status)}</div></div><div class="muted" style="${ssrRenderStyle({ "white-space": "nowrap" })}"${_scopeId}>${ssrInterpolate(new Date(it.createdAt).toLocaleDateString("vi-VN"))}</div>`);
              } else {
                return [
                  createVNode("div", { style: { "min-width": "0" } }, [
                    createVNode("div", { style: { "font-weight": "800", "white-space": "nowrap", "overflow": "hidden", "text-overflow": "ellipsis" } }, toDisplayString(it.title), 1),
                    createVNode("div", {
                      class: "muted",
                      style: { "margin-top": "4px" }
                    }, toDisplayString(it.productCode) + " · " + toDisplayString(it.status), 1)
                  ]),
                  createVNode("div", {
                    class: "muted",
                    style: { "white-space": "nowrap" }
                  }, toDisplayString(new Date(it.createdAt).toLocaleDateString("vi-VN")), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]-->`);
      }
      _push(`</div>`);
      if (meta.value) {
        _push(`<div style="${ssrRenderStyle({ "margin-top": "16px", "display": "flex", "gap": "10px", "align-items": "center", "justify-content": "flex-end" })}"><button class="btn btn-ghost btn-sm" type="button"${ssrIncludeBooleanAttr(!meta.value.hasPrevPage) ? " disabled" : ""}>Trước</button><div class="muted">Trang ${ssrInterpolate(meta.value.page)} / ${ssrInterpolate(meta.value.totalPages)}</div><button class="btn btn-ghost btn-sm" type="button"${ssrIncludeBooleanAttr(!meta.value.hasNextPage) ? " disabled" : ""}>Sau</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/me-products/list.page.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
