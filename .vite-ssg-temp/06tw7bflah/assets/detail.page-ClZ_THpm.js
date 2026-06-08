import { defineComponent, computed, onMounted, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import { useRouter } from "vue-router";
import { u as useAsyncResource, A as ApiError, S as SkeletonLine, _ as _sfc_main$1 } from "./SkeletonLine-BugctRi_.js";
import { g as getMyProductDetail } from "./api-BI4bM3BA.js";
import "../main.mjs";
import "@unhead/vue/server";
import "pinia";
import "./catalog-7r_b5cgQ.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "detail.page",
  __ssrInlineRender: true,
  props: {
    productId: {}
  },
  setup(__props) {
    const props = __props;
    useRouter();
    const resource = useAsyncResource(async () => {
      return await getMyProductDetail(props.productId);
    });
    const item = computed(() => {
      var _a;
      return ((_a = resource.data.value) == null ? void 0 : _a.data) || null;
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container section" }, _attrs))}><button class="btn btn-ghost btn-sm" type="button">← Quay lại</button><div style="${ssrRenderStyle({ "margin-top": "12px" })}">`);
      if (unref(resource).status.value === "loading" || unref(resource).status.value === "idle") {
        _push(`<div class="card">`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "60%",
          height: "18px"
        }, null, _parent));
        _push(`<div style="${ssrRenderStyle({ "height": "10px" })}"></div>`);
        _push(ssrRenderComponent(SkeletonLine, { width: "40%" }, null, _parent));
        _push(`<div style="${ssrRenderStyle({ "height": "10px" })}"></div>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "28%",
          height: "10px"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(resource).status.value === "error") {
        _push(ssrRenderComponent(_sfc_main$1, {
          title: "Không thể tải chi tiết tác phẩm",
          message: errorMessage.value,
          "request-id": requestId.value,
          "can-retry": true,
          onRetry: reload
        }, null, _parent));
      } else if (item.value) {
        _push(`<div class="card"><h1 style="${ssrRenderStyle({ "margin": "0 0 6px" })}">${ssrInterpolate(item.value.title)}</h1><div class="muted">${ssrInterpolate(item.value.productCode)} · ${ssrInterpolate(item.value.status)}</div><div class="muted" style="${ssrRenderStyle({ "margin-top": "12px", "line-height": "1.7" })}">${ssrInterpolate(item.value.description)}</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/me-products/detail.page.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
