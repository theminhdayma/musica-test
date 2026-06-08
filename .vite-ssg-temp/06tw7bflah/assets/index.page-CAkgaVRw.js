import { defineComponent, ref, watch, mergeProps, useSSRContext, unref, withCtx, createVNode, toDisplayString, computed, onMounted } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderStyle, ssrRenderList, ssrInterpolate, ssrRenderComponent, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { RouterLink, useRouter, useRoute } from "vue-router";
import { useHead } from "@unhead/vue";
import { p as products, c as categories } from "./catalog-7r_b5cgQ.js";
import { A as ApiError, u as useAsyncResource, _ as _sfc_main$7 } from "./SkeletonLine-BugctRi_.js";
import { a as toPublicProductId } from "./idMap-EGxV6QNG.js";
import { _ as _sfc_main$6 } from "./SkeletonCard-sSKIgVwm.js";
import { _ as _export_sfc } from "../main.mjs";
import "@unhead/vue/server";
import "pinia";
function paginate(items, page, pageSize) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  const meta = {
    pagination: {
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1
    }
  };
  return { slice, meta };
}
function mapToListItem(p) {
  return {
    id: toPublicProductId(String(p.id)),
    productCode: p.isrc ? String(p.isrc) : `PROD-${String(p.id).slice(0, 6).padStart(6, "0")}`,
    title: p.title,
    thumbnailUrl: p.cover || null,
    artistDisplayName: p.artist
  };
}
async function listProducts(input) {
  {
    const page = input.page || 1;
    const pageSize = input.pageSize || 20;
    if (page <= 0 || pageSize <= 0 || pageSize > 100) {
      throw new ApiError({ statusCode: 400, code: "INVALID_PAGINATION", message: "Invalid pagination parameters", requestId: "mock", details: { page, pageSize } });
    }
    const q = (input.q || "").trim().toLowerCase();
    const genre = (input.genre || "").trim().toLowerCase();
    const filtered = products.filter((p) => {
      const matchQ = !q || String(p.title || "").toLowerCase().includes(q) || String(p.artist || "").toLowerCase().includes(q);
      const matchGenre = !genre || String(p.category || "").toLowerCase() === genre;
      return matchQ && matchGenre;
    });
    const { slice, meta } = paginate(filtered, page, pageSize);
    const data = { items: slice.map(mapToListItem) };
    return { data, meta };
  }
}
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "MarketSearchBar",
  __ssrInlineRender: true,
  props: {
    modelValue: {}
  },
  emits: ["update:modelValue", "submit"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const value = ref(props.modelValue || "");
    watch(
      () => props.modelValue,
      (v) => {
        if (v !== value.value) value.value = v || "";
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<form${ssrRenderAttrs(mergeProps({ class: "search" }, _attrs))} data-v-0a578ecf><svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" data-v-0a578ecf><circle cx="11" cy="11" r="7" data-v-0a578ecf></circle><path d="m20 20-3.5-3.5" data-v-0a578ecf></path></svg><input${ssrRenderAttr("value", value.value)} type="search" placeholder="Tìm tác phẩm, nghệ sĩ…" data-v-0a578ecf><button class="btn btn-primary btn-sm" type="submit" data-v-0a578ecf>Tìm</button></form>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/market/components/MarketSearchBar.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const MarketSearchBar = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-0a578ecf"]]);
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "GenreFilter",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    options: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<label${ssrRenderAttrs(mergeProps({ class: "filter" }, _attrs))} data-v-e710545f><span class="muted" style="${ssrRenderStyle({ "font-size": "12px", "font-weight": "700" })}" data-v-e710545f>Thể loại</span><select class="select"${ssrRenderAttr("value", __props.modelValue)} data-v-e710545f><!--[-->`);
      ssrRenderList(__props.options, (o) => {
        _push(`<option${ssrRenderAttr("value", o.id)} data-v-e710545f>${ssrInterpolate(o.label)}</option>`);
      });
      _push(`<!--]--></select></label>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/market/components/GenreFilter.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const GenreFilter = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-e710545f"]]);
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "MarketProductCard",
  __ssrInlineRender: true,
  props: {
    item: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(RouterLink), mergeProps({
        to: `/product/${__props.item.id}`,
        class: "card card-link"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="thumb" style="${ssrRenderStyle({ background: __props.item.thumbnailUrl || "var(--grad-brand)" })}" data-v-51ebaab7${_scopeId}></div><div class="body" data-v-51ebaab7${_scopeId}><div class="title"${ssrRenderAttr("title", __props.item.title)} data-v-51ebaab7${_scopeId}>${ssrInterpolate(__props.item.title)}</div><div class="muted meta" data-v-51ebaab7${_scopeId}>${ssrInterpolate(__props.item.productCode)} · ${ssrInterpolate(__props.item.artistDisplayName)}</div><div class="cta" data-v-51ebaab7${_scopeId}>Xem chi tiết →</div></div>`);
          } else {
            return [
              createVNode("div", {
                class: "thumb",
                style: { background: __props.item.thumbnailUrl || "var(--grad-brand)" }
              }, null, 4),
              createVNode("div", { class: "body" }, [
                createVNode("div", {
                  class: "title",
                  title: __props.item.title
                }, toDisplayString(__props.item.title), 9, ["title"]),
                createVNode("div", { class: "muted meta" }, toDisplayString(__props.item.productCode) + " · " + toDisplayString(__props.item.artistDisplayName), 1),
                createVNode("div", { class: "cta" }, "Xem chi tiết →")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/market/components/MarketProductCard.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const MarketProductCard = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-51ebaab7"]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "ProductGrid",
  __ssrInlineRender: true,
  props: {
    items: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid" }, _attrs))} data-v-484fbb1d><!--[-->`);
      ssrRenderList(__props.items, (it) => {
        _push(ssrRenderComponent(MarketProductCard, {
          key: it.id,
          item: it
        }, null, _parent));
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/market/components/ProductGrid.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const ProductGrid = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-484fbb1d"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "PaginationControls",
  __ssrInlineRender: true,
  props: {
    pagination: {}
  },
  emits: ["change"],
  setup(__props, { emit: __emit }) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "pager" }, _attrs))} data-v-b47f014d><button class="btn btn-ghost btn-sm" type="button"${ssrIncludeBooleanAttr(!__props.pagination.hasPrevPage) ? " disabled" : ""} data-v-b47f014d>Trước</button><div class="muted" data-v-b47f014d>Trang ${ssrInterpolate(__props.pagination.page)} / ${ssrInterpolate(__props.pagination.totalPages)}</div><button class="btn btn-ghost btn-sm" type="button"${ssrIncludeBooleanAttr(!__props.pagination.hasNextPage) ? " disabled" : ""} data-v-b47f014d>Sau</button></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/market/components/PaginationControls.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const PaginationControls = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-b47f014d"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index.page",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Marketplace tác quyền — MusicA",
      meta: [
        {
          name: "description",
          content: "Tìm tác phẩm theo nghệ sĩ/thể loại và cấu hình gói tác quyền phù hợp nhu cầu sử dụng."
        }
      ]
    });
    const router = useRouter();
    const route = useRoute();
    function readNumberParam(v, fallback) {
      const n = Number(v);
      if (!Number.isFinite(n) || n <= 0) return fallback;
      return Math.floor(n);
    }
    const queryState = computed(() => {
      const q = typeof route.query.q === "string" ? route.query.q : "";
      const genre = typeof route.query.genre === "string" ? route.query.genre : "";
      const page = readNumberParam(route.query.page, 1);
      const pageSize = readNumberParam(route.query.pageSize, 20);
      return { q, genre, page, pageSize };
    });
    const resource = useAsyncResource(async () => {
      const { q, genre, page, pageSize } = queryState.value;
      return await listProducts({
        q: q.trim() || void 0,
        genre: genre && genre !== "all" ? genre : void 0,
        page,
        pageSize
      });
    });
    const items = computed(() => {
      var _a;
      return ((_a = resource.data.value) == null ? void 0 : _a.data.items) || [];
    });
    const pagination = computed(() => {
      var _a, _b;
      return ((_b = (_a = resource.data.value) == null ? void 0 : _a.meta) == null ? void 0 : _b.pagination) || null;
    });
    const errorRequestId = computed(() => resource.error.value instanceof ApiError ? resource.error.value.requestId : null);
    const errorMessage = computed(() => resource.error.value instanceof ApiError ? resource.error.value.message : resource.error.value instanceof Error ? resource.error.value.message : "Không thể tải dữ liệu");
    const genreOptions = computed(() => categories.map((c) => ({ id: c.id, label: c.label })));
    function setQuery(next, mode) {
      const current = queryState.value;
      const merged = { ...current, ...next };
      const query = {};
      if (merged.q.trim()) query.q = merged.q.trim();
      if (merged.genre && merged.genre !== "all") query.genre = merged.genre;
      if (merged.page && merged.page !== 1) query.page = String(merged.page);
      if (merged.pageSize && merged.pageSize !== 20) query.pageSize = String(merged.pageSize);
      const nav = { name: "market", query };
      if (mode === "push") router.push(nav);
      else router.replace(nav);
    }
    function submitSearch(q) {
      setQuery({ q, page: 1 }, "replace");
    }
    function changeGenre(genre) {
      setQuery({ genre, page: 1 }, "replace");
    }
    function goToPage(page) {
      setQuery({ page }, "push");
    }
    function reload() {
      resource.run();
    }
    watch(
      () => route.query,
      () => {
        reload();
      }
    );
    onMounted(() => {
      reload();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container section-tight" }, _attrs))} data-v-700cd0b8><div class="market-head" data-v-700cd0b8><div class="title" data-v-700cd0b8><h1 style="${ssrRenderStyle({ "margin": "0" })}" data-v-700cd0b8>Marketplace tác quyền</h1><div class="muted" style="${ssrRenderStyle({ "margin-top": "6px" })}" data-v-700cd0b8>Tìm theo tên tác phẩm, nghệ sĩ và thể loại.</div></div><div class="controls" data-v-700cd0b8>`);
      _push(ssrRenderComponent(MarketSearchBar, {
        "model-value": queryState.value.q,
        onSubmit: submitSearch
      }, null, _parent));
      _push(ssrRenderComponent(GenreFilter, {
        "model-value": queryState.value.genre || "all",
        options: genreOptions.value,
        "onUpdate:modelValue": changeGenre
      }, null, _parent));
      _push(`</div></div><div style="${ssrRenderStyle({ "margin-top": "18px" })}" data-v-700cd0b8>`);
      if (unref(resource).status.value === "idle" || unref(resource).status.value === "loading") {
        _push(`<div class="grid" data-v-700cd0b8><!--[-->`);
        ssrRenderList(12, (i) => {
          _push(ssrRenderComponent(_sfc_main$6, { key: i }, null, _parent));
        });
        _push(`<!--]--></div>`);
      } else if (unref(resource).status.value === "error") {
        _push(ssrRenderComponent(_sfc_main$7, {
          title: "Không thể tải marketplace",
          message: errorMessage.value,
          "request-id": errorRequestId.value,
          "can-retry": true,
          onRetry: reload
        }, null, _parent));
      } else if (!items.value.length) {
        _push(`<div class="card" data-v-700cd0b8><div style="${ssrRenderStyle({ "font-weight": "800" })}" data-v-700cd0b8>Không tìm thấy tác phẩm phù hợp</div><div class="muted" style="${ssrRenderStyle({ "margin-top": "6px" })}" data-v-700cd0b8>Thử đổi từ khoá hoặc bỏ lọc thể loại.</div></div>`);
      } else {
        _push(`<div data-v-700cd0b8><div class="muted" style="${ssrRenderStyle({ "display": "flex", "justify-content": "space-between", "align-items": "center", "gap": "12px", "flex-wrap": "wrap" })}" data-v-700cd0b8>`);
        if (pagination.value) {
          _push(`<div data-v-700cd0b8>Trang ${ssrInterpolate(pagination.value.page)} / ${ssrInterpolate(pagination.value.totalPages)} · ${ssrInterpolate(pagination.value.totalItems)} kết quả</div>`);
        } else {
          _push(`<div data-v-700cd0b8>${ssrInterpolate(items.value.length)} kết quả</div>`);
        }
        _push(`</div><div style="${ssrRenderStyle({ "margin-top": "12px" })}" data-v-700cd0b8>`);
        _push(ssrRenderComponent(ProductGrid, { items: items.value }, null, _parent));
        _push(`</div>`);
        if (pagination.value) {
          _push(ssrRenderComponent(PaginationControls, {
            pagination: pagination.value,
            onChange: goToPage
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/market/index.page.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index_page = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-700cd0b8"]]);
export {
  index_page as default
};
