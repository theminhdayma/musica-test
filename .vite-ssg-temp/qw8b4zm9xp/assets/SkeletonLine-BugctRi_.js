var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { ref, defineComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate } from "vue/server-renderer";
import { _ as _export_sfc } from "../main.mjs";
class ApiError extends Error {
  constructor(input) {
    super(input.message);
    __publicField(this, "statusCode");
    __publicField(this, "code");
    __publicField(this, "requestId");
    __publicField(this, "details");
    this.name = "ApiError";
    this.statusCode = input.statusCode;
    this.code = input.code;
    this.requestId = input.requestId;
    this.details = input.details;
  }
}
function useAsyncResource(fn) {
  const status = ref("idle");
  const data = ref(null);
  const error = ref(null);
  async function run() {
    status.value = "loading";
    error.value = null;
    try {
      const result = await fn();
      data.value = result;
      status.value = "success";
      return result;
    } catch (e) {
      error.value = e;
      status.value = "error";
      throw e;
    }
  }
  return { status, data, error, run };
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ErrorState",
  __ssrInlineRender: true,
  props: {
    title: {},
    message: {},
    requestId: {},
    canRetry: { type: Boolean }
  },
  emits: ["retry"],
  setup(__props, { emit: __emit }) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "card",
        style: { "background": "#fff1f2", "border-color": "#fecdd3" }
      }, _attrs))}><div style="${ssrRenderStyle({ "font-weight": "800" })}">${ssrInterpolate(__props.title || "Đã có lỗi xảy ra")}</div><div class="muted" style="${ssrRenderStyle({ "margin-top": "6px" })}">${ssrInterpolate(__props.message)}</div>`);
      if (__props.requestId) {
        _push(`<div class="muted" style="${ssrRenderStyle({ "margin-top": "6px" })}">Request ID: ${ssrInterpolate(__props.requestId)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.canRetry) {
        _push(`<button class="btn btn-ghost btn-sm" type="button" style="${ssrRenderStyle({ "margin-top": "12px" })}">Thử lại</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/shared/ui/states/ErrorState.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SkeletonLine",
  __ssrInlineRender: true,
  props: {
    width: { default: "100%" },
    height: { default: "12px" }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        style: {
          width: __props.width,
          height: __props.height,
          borderRadius: "999px",
          background: "linear-gradient(90deg, rgba(15,23,42,0.06), rgba(15,23,42,0.10), rgba(15,23,42,0.06))",
          backgroundSize: "220% 100%",
          animation: "skeleton 1.2s ease-in-out infinite"
        }
      }, _attrs))} data-v-b396f58b></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/shared/ui/skeleton/SkeletonLine.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const SkeletonLine = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b396f58b"]]);
export {
  ApiError as A,
  SkeletonLine as S,
  _sfc_main$1 as _,
  useAsyncResource as u
};
