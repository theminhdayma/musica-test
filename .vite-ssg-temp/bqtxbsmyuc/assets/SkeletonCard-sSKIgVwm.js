import { defineComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderComponent } from "vue/server-renderer";
import { S as SkeletonLine } from "./SkeletonLine-BugctRi_.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SkeletonCard",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "card" }, _attrs))}><div style="${ssrRenderStyle({ "display": "flex", "gap": "12px", "align-items": "center" })}"><div style="${ssrRenderStyle({ "width": "56px", "height": "56px", "border-radius": "14px", "background": "rgba(15,23,42,0.08)" })}"></div><div style="${ssrRenderStyle({ "flex": "1", "display": "grid", "gap": "8px" })}">`);
      _push(ssrRenderComponent(SkeletonLine, { width: "70%" }, null, _parent));
      _push(ssrRenderComponent(SkeletonLine, {
        width: "45%",
        height: "10px"
      }, null, _parent));
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/shared/ui/skeleton/SkeletonCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};
