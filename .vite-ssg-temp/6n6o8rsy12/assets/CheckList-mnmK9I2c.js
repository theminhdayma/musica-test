import { computed, mergeProps, useSSRContext, unref, withCtx, createVNode, toDisplayString, openBlock, createBlock, createTextVNode } from "vue";
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrRenderComponent, ssrInterpolate, ssrRenderAttr } from "vue/server-renderer";
import { RouterLink } from "vue-router";
import { f as formatVND } from "./catalog-BTAmee6Y.js";
import { _ as _export_sfc } from "../main.mjs";
const _sfc_main$2 = {
  __name: "WaveBars",
  __ssrInlineRender: true,
  props: {
    // Pre-computed heights (0..1 normalized). If omitted, a deterministic seed pattern is generated.
    peaks: { type: Array, default: null },
    // Number of bars (used when peaks is null)
    bars: { type: Number, default: 28 },
    // Visual size variants
    size: { type: String, default: "sm" },
    // 'xs' | 'sm' | 'md' | 'lg'
    // Visual mode
    variant: { type: String, default: "solid" },
    // 'solid' | 'translucent' | 'muted'
    // % of bars to mark as "played"
    progress: { type: Number, default: 0 },
    // Animate (equalizer) on hover
    animateOnHover: { type: Boolean, default: false },
    // Always animate
    animate: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const sizeMap = {
      xs: { h: 14, gap: 1, w: 2 },
      sm: { h: 22, gap: 2, w: 2 },
      md: { h: 36, gap: 2, w: 3 },
      lg: { h: 56, gap: 2, w: 3 }
    };
    const dim = computed(() => sizeMap[props.size] || sizeMap.sm);
    const list = computed(() => {
      if (props.peaks && props.peaks.length) return props.peaks;
      const n = props.bars;
      return Array.from({ length: n }, (_, i) => {
        const a = Math.sin(i / n * Math.PI * 2) * 0.4;
        const b = Math.sin(i / n * Math.PI * 6 + 1.2) * 0.25;
        return 0.45 + a + b;
      });
    });
    function heightPx(v) {
      const norm = Math.max(0.08, Math.min(1, v));
      return Math.round(norm * dim.value.h);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["wb", `wb-${__props.size}`, `wb-${__props.variant}`, { "wb-hover": __props.animateOnHover, "wb-always": __props.animate }],
        style: { height: dim.value.h + "px", gap: dim.value.gap + "px" },
        "aria-hidden": "true"
      }, _attrs))} data-v-38974706><!--[-->`);
      ssrRenderList(list.value, (v, i) => {
        _push(`<span class="${ssrRenderClass(["wb-bar", { played: __props.progress > 0 && i / list.value.length * 100 <= __props.progress }])}" style="${ssrRenderStyle({ height: heightPx(v) + "px", width: dim.value.w + "px", animationDelay: i * 35 + "ms" })}" data-v-38974706></span>`);
      });
      _push(`<!--]--></div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/ui/WaveBars.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const WaveBars = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-38974706"]]);
const _sfc_main$1 = {
  __name: "ProductCard",
  __ssrInlineRender: true,
  props: {
    product: { type: Object, required: true }
  },
  setup(__props) {
    const props = __props;
    const fromPrice = computed(() => formatVND(props.product.basePrice));
    const peaks = computed(() => (props.product.samplePeak || []).slice(0, 22).map((v) => v / 60));
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(RouterLink), mergeProps({
        to: `/product/${__props.product.id}`,
        class: "card product-card"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="cover" style="${ssrRenderStyle({ background: __props.product.cover })}" data-v-b102af95${_scopeId}><div class="cover-overlay" data-v-b102af95${_scopeId}></div><div class="cover-meta" data-v-b102af95${_scopeId}><span class="badge-cat" data-v-b102af95${_scopeId}>${ssrInterpolate(__props.product.category.toUpperCase())}</span><span class="rating" data-v-b102af95${_scopeId}>★ ${ssrInterpolate(__props.product.rating)}</span></div><div class="cover-bottom" data-v-b102af95${_scopeId}>`);
            _push2(ssrRenderComponent(WaveBars, {
              peaks: peaks.value,
              size: "xs",
              variant: "translucent",
              "animate-on-hover": true,
              class: "wave"
            }, null, _parent2, _scopeId));
            _push2(`<button class="play-fab" aria-label="Nghe thử" data-v-b102af95${_scopeId}><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" data-v-b102af95${_scopeId}><path d="M8 5v14l11-7z" data-v-b102af95${_scopeId}></path></svg></button></div></div><div class="body" data-v-b102af95${_scopeId}><div class="row-top" data-v-b102af95${_scopeId}><h3${ssrRenderAttr("title", __props.product.title)} data-v-b102af95${_scopeId}>${ssrInterpolate(__props.product.title)}</h3><span class="duration" data-v-b102af95${_scopeId}>${ssrInterpolate(__props.product.duration)}</span></div><div class="artist" data-v-b102af95${_scopeId}><span class="ava" style="${ssrRenderStyle({ background: __props.product.cover })}" data-v-b102af95${_scopeId}></span> ${ssrInterpolate(__props.product.artist)}</div><div class="row-bot" data-v-b102af95${_scopeId}><div class="price" data-v-b102af95${_scopeId}><span class="from" data-v-b102af95${_scopeId}>Từ</span><strong data-v-b102af95${_scopeId}>${ssrInterpolate(fromPrice.value)}</strong></div><span class="cta" data-v-b102af95${_scopeId}>Mua tác quyền →</span></div></div>`);
          } else {
            return [
              createVNode("div", {
                class: "cover",
                style: { background: __props.product.cover }
              }, [
                createVNode("div", { class: "cover-overlay" }),
                createVNode("div", { class: "cover-meta" }, [
                  createVNode("span", { class: "badge-cat" }, toDisplayString(__props.product.category.toUpperCase()), 1),
                  createVNode("span", { class: "rating" }, "★ " + toDisplayString(__props.product.rating), 1)
                ]),
                createVNode("div", { class: "cover-bottom" }, [
                  createVNode(WaveBars, {
                    peaks: peaks.value,
                    size: "xs",
                    variant: "translucent",
                    "animate-on-hover": true,
                    class: "wave"
                  }, null, 8, ["peaks"]),
                  createVNode("button", {
                    class: "play-fab",
                    "aria-label": "Nghe thử"
                  }, [
                    (openBlock(), createBlock("svg", {
                      viewBox: "0 0 24 24",
                      width: "12",
                      height: "12",
                      fill: "currentColor"
                    }, [
                      createVNode("path", { d: "M8 5v14l11-7z" })
                    ]))
                  ])
                ])
              ], 4),
              createVNode("div", { class: "body" }, [
                createVNode("div", { class: "row-top" }, [
                  createVNode("h3", {
                    title: __props.product.title
                  }, toDisplayString(__props.product.title), 9, ["title"]),
                  createVNode("span", { class: "duration" }, toDisplayString(__props.product.duration), 1)
                ]),
                createVNode("div", { class: "artist" }, [
                  createVNode("span", {
                    class: "ava",
                    style: { background: __props.product.cover }
                  }, null, 4),
                  createTextVNode(" " + toDisplayString(__props.product.artist), 1)
                ]),
                createVNode("div", { class: "row-bot" }, [
                  createVNode("div", { class: "price" }, [
                    createVNode("span", { class: "from" }, "Từ"),
                    createVNode("strong", null, toDisplayString(fromPrice.value), 1)
                  ]),
                  createVNode("span", { class: "cta" }, "Mua tác quyền →")
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/product/ProductCard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const ProductCard = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-b102af95"]]);
const _sfc_main = {
  __name: "CheckList",
  __ssrInlineRender: true,
  props: {
    items: { type: Array, required: true }
    // [{ label, hint? }]
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<ul${ssrRenderAttrs(mergeProps({ class: "checklist" }, _attrs))} data-v-0f3dbb57><!--[-->`);
      ssrRenderList(__props.items, (it, i) => {
        _push(`<li data-v-0f3dbb57><span class="tick" aria-hidden="true" data-v-0f3dbb57><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" data-v-0f3dbb57><polyline points="4 12 10 18 20 6" data-v-0f3dbb57></polyline></svg></span><div class="body" data-v-0f3dbb57><strong data-v-0f3dbb57>${ssrInterpolate(typeof it === "string" ? it : it.label)}</strong>`);
        if (typeof it !== "string" && it.hint) {
          _push(`<span data-v-0f3dbb57>${ssrInterpolate(it.hint)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></li>`);
      });
      _push(`<!--]--></ul>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/ui/CheckList.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const CheckList = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0f3dbb57"]]);
export {
  CheckList as C,
  ProductCard as P,
  WaveBars as W
};
