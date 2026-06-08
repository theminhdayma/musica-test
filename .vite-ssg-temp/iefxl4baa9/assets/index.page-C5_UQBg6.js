import { defineComponent, mergeProps, useSSRContext, resolveComponent, withCtx, createVNode, toDisplayString, ref, watch, computed, onMounted, unref } from "vue";
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderComponent } from "vue/server-renderer";
import { useRouter, useRoute } from "vue-router";
import { useHead } from "@unhead/vue";
import { p as products, c as categories, a as artists } from "./catalog-BTAmee6Y.js";
import { A as ApiError, u as useAsyncResource, S as SkeletonLine, _ as _sfc_main$6 } from "./SkeletonLine-BugctRi_.js";
import { a as toPublicProductId } from "./idMap-BgV6FToW.js";
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
  __name: "SearchSidebar",
  __ssrInlineRender: true,
  props: {
    q: {},
    activeTab: {},
    genre: {},
    categories: {},
    showFilters: { type: Boolean },
    timeKey: {},
    lengthKey: {},
    purposeKey: {}
  },
  emits: ["setTab", "setGenre", "updateFilters"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    function isActive(v) {
      return (props.activeTab || "all") === v;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "panel" }, _attrs))} data-v-774555cf><div class="header" data-v-774555cf><div style="${ssrRenderStyle({ "font-weight": "900", "letter-spacing": "-0.01em" })}" data-v-774555cf>Kết quả</div>`);
      if (__props.q) {
        _push(`<div class="sub" data-v-774555cf>“${ssrInterpolate(__props.q)}”</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="tabs" data-v-774555cf><button class="tab" type="button"${ssrRenderAttr("data-active", isActive("all"))} data-v-774555cf>All</button><button class="tab" type="button"${ssrRenderAttr("data-active", isActive("artist"))} data-v-774555cf>Artist</button><button class="tab" type="button"${ssrRenderAttr("data-active", isActive("genres"))} data-v-774555cf>Genres</button></div>`);
      if (__props.showFilters) {
        _push(`<div class="filters" data-v-774555cf><details open class="group" data-v-774555cf><summary data-v-774555cf>Added any time</summary><div class="opts" data-v-774555cf><button class="opt" type="button"${ssrRenderAttr("data-active", __props.timeKey === "any")} data-v-774555cf>Any time</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.timeKey === "hour")} data-v-774555cf>Past hour</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.timeKey === "day")} data-v-774555cf>Past day</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.timeKey === "week")} data-v-774555cf>Past week</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.timeKey === "month")} data-v-774555cf>Past month</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.timeKey === "year")} data-v-774555cf>Past year</button></div></details><details class="group" data-v-774555cf><summary data-v-774555cf>Any length</summary><div class="opts" data-v-774555cf><button class="opt" type="button"${ssrRenderAttr("data-active", __props.lengthKey === "any")} data-v-774555cf>Any</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.lengthKey === "lt2")} data-v-774555cf>&lt; 2 phút</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.lengthKey === "2to4")} data-v-774555cf>2–4 phút</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.lengthKey === "4to6")} data-v-774555cf>4–6 phút</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.lengthKey === "gt6")} data-v-774555cf>&gt; 6 phút</button></div></details><details class="group" data-v-774555cf><summary data-v-774555cf>Mục đích sử dụng</summary><div class="opts" data-v-774555cf><button class="opt" type="button"${ssrRenderAttr("data-active", __props.purposeKey === "any")} data-v-774555cf>Tất cả</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.purposeKey === "youtube")} data-v-774555cf>YouTube</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.purposeKey === "performance")} data-v-774555cf>Biểu diễn</button></div></details><details class="group" data-v-774555cf><summary data-v-774555cf>Filter by genre</summary><div class="opts" data-v-774555cf><button class="opt" type="button"${ssrRenderAttr("data-active", __props.genre === "all")} data-v-774555cf>All</button><!--[-->`);
        ssrRenderList(__props.categories.filter((x) => x.id !== "all"), (c) => {
          _push(`<button class="opt" type="button"${ssrRenderAttr("data-active", __props.genre === c.id)} data-v-774555cf>${ssrInterpolate(c.label)}</button>`);
        });
        _push(`<!--]--></div></details></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/search/components/SearchSidebar.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const SearchSidebar = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-774555cf"]]);
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "SearchTopAndSongs",
  __ssrInlineRender: true,
  props: {
    top: {},
    songs: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_RouterLink = resolveComponent("RouterLink");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "wrap" }, _attrs))} data-v-bafc9281><div class="left" data-v-bafc9281><div class="muted" style="${ssrRenderStyle({ "font-weight": "900" })}" data-v-bafc9281>Top result</div>`);
      if (__props.top) {
        _push(`<div class="card top" data-v-bafc9281><div class="art" style="${ssrRenderStyle({ background: __props.top.thumbnailUrl || "var(--grad-brand)" })}" data-v-bafc9281></div><div class="info" data-v-bafc9281><div class="title" data-v-bafc9281>${ssrInterpolate(__props.top.title)}</div><div class="muted" data-v-bafc9281>${ssrInterpolate(__props.top.artistDisplayName)}</div></div></div>`);
      } else {
        _push(`<div class="card top" data-v-bafc9281><div class="muted" data-v-bafc9281>Không có top result</div></div>`);
      }
      _push(`</div><div class="right" data-v-bafc9281><div class="muted" style="${ssrRenderStyle({ "font-weight": "900" })}" data-v-bafc9281>Popular songs</div><div class="list" data-v-bafc9281><!--[-->`);
      ssrRenderList(__props.songs, (s) => {
        _push(ssrRenderComponent(_component_RouterLink, {
          key: s.id,
          class: "row",
          to: `/product/${s.id}`
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="thumb" style="${ssrRenderStyle({ background: s.thumbnailUrl || "rgba(255,255,255,0.08)" })}" data-v-bafc9281${_scopeId}></div><div class="txt" data-v-bafc9281${_scopeId}><div class="name" data-v-bafc9281${_scopeId}>${ssrInterpolate(s.title)}</div><div class="muted meta" data-v-bafc9281${_scopeId}>${ssrInterpolate(s.artistDisplayName)}</div></div>`);
            } else {
              return [
                createVNode("div", {
                  class: "thumb",
                  style: { background: s.thumbnailUrl || "rgba(255,255,255,0.08)" }
                }, null, 4),
                createVNode("div", { class: "txt" }, [
                  createVNode("div", { class: "name" }, toDisplayString(s.title), 1),
                  createVNode("div", { class: "muted meta" }, toDisplayString(s.artistDisplayName), 1)
                ])
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></div></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/search/components/SearchTopAndSongs.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const SearchTopAndSongs = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-bafc9281"]]);
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "SearchArtistsSection",
  __ssrInlineRender: true,
  props: {
    items: {},
    expanded: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const open = ref(!!props.expanded);
    watch(
      () => props.expanded,
      (v) => {
        if (v) open.value = true;
      }
    );
    const visible = computed(() => open.value ? props.items : props.items.slice(0, 6));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "card section" }, _attrs))} data-v-9581e661><div class="head" data-v-9581e661><div style="${ssrRenderStyle({ "font-weight": "900" })}" data-v-9581e661>Artists</div>`);
      if (!__props.expanded) {
        _push(`<button class="link" type="button" data-v-9581e661>${ssrInterpolate(open.value ? "Thu gọn" : "Xem thêm")}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="grid" data-v-9581e661><!--[-->`);
      ssrRenderList(visible.value, (a) => {
        _push(`<div class="artist" data-v-9581e661><div class="ava" data-v-9581e661></div><div class="name" data-v-9581e661>${ssrInterpolate(a.name)}</div></div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/search/components/SearchArtistsSection.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const SearchArtistsSection = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-9581e661"]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "SearchGenresSection",
  __ssrInlineRender: true,
  props: {
    items: {},
    active: {},
    expanded: { type: Boolean, default: false }
  },
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const open = ref(!!props.expanded);
    watch(
      () => props.expanded,
      (v) => {
        if (v) open.value = true;
      }
    );
    const visible = computed(() => open.value ? props.items : props.items.slice(0, 8));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "card section" }, _attrs))} data-v-d25e1713><div class="head" data-v-d25e1713><div style="${ssrRenderStyle({ "font-weight": "900" })}" data-v-d25e1713>Genres</div>`);
      if (!__props.expanded) {
        _push(`<button class="link" type="button" data-v-d25e1713>${ssrInterpolate(open.value ? "Thu gọn" : "Xem thêm")}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="chips" data-v-d25e1713><button class="chip" type="button"${ssrRenderAttr("data-active", __props.active === "all")} data-v-d25e1713>All</button><!--[-->`);
      ssrRenderList(visible.value, (it) => {
        _push(`<button class="chip" type="button"${ssrRenderAttr("data-active", __props.active === it.id)} data-v-d25e1713>${ssrInterpolate(it.label)}</button>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/search/components/SearchGenresSection.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const SearchGenresSection = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-d25e1713"]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "SearchPlaylistsSection",
  __ssrInlineRender: true,
  setup(__props) {
    const selected = ref(null);
    const items = [
      { id: "pl-viral", label: "Viral hooks" },
      { id: "pl-vlog", label: "Vlog travel" },
      { id: "pl-chill", label: "Lo-fi focus" },
      { id: "pl-brand", label: "Brand cinematic" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "card section" }, _attrs))} data-v-d80d40c7><div style="${ssrRenderStyle({ "font-weight": "900" })}" data-v-d80d40c7>Playlists</div><div class="chips" data-v-d80d40c7><!--[-->`);
      ssrRenderList(items, (it) => {
        _push(`<button class="chip" type="button"${ssrRenderAttr("data-active", selected.value === it.id)} data-v-d80d40c7>${ssrInterpolate(it.label)}</button>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/search/components/SearchPlaylistsSection.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const SearchPlaylistsSection = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-d80d40c7"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index.page",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Tìm kiếm — MusicA",
      meta: [{ name: "description", content: "Tìm kiếm tác phẩm, nghệ sĩ và thể loại trong marketplace tác quyền." }]
    });
    const router = useRouter();
    const route = useRoute();
    const q = computed(() => typeof route.params.q === "string" ? route.params.q : "");
    const tab = computed(() => {
      const v = typeof route.params.tab === "string" ? route.params.tab : "";
      return v || "all";
    });
    const genre = computed(() => typeof route.query.genre === "string" ? route.query.genre : "");
    const timeKey = ref("any");
    const lengthKey = ref("any");
    const purposeKey = ref("any");
    const resource = useAsyncResource(async () => {
      return await listProducts({
        q: q.value.trim() || void 0,
        genre: genre.value || void 0,
        page: 1,
        pageSize: 50
      });
    });
    const allItems = computed(() => {
      var _a;
      return ((_a = resource.data.value) == null ? void 0 : _a.data.items) || [];
    });
    const rawByCode = computed(() => {
      const m = {};
      for (const p of products) {
        const code = p.isrc ? String(p.isrc) : `PROD-${String(p.id).slice(0, 6).padStart(6, "0")}`;
        m[code] = p;
      }
      return m;
    });
    function parseDurationSeconds(v) {
      const parts = v.split(":").map(Number);
      if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) return null;
      return parts[0] * 60 + parts[1];
    }
    function withinTime(productCode, key) {
      if (key === "any") return true;
      const p = rawByCode.value[productCode];
      const releaseDate = p == null ? void 0 : p.releaseDate;
      if (!releaseDate) return true;
      const d = new Date(releaseDate).getTime();
      if (!Number.isFinite(d)) return true;
      const now = Date.now();
      const diff = now - d;
      const hour = 36e5;
      const day = 24 * hour;
      const week = 7 * day;
      const month = 30 * day;
      const year = 365 * day;
      if (key === "hour") return diff <= hour;
      if (key === "day") return diff <= day;
      if (key === "week") return diff <= week;
      if (key === "month") return diff <= month;
      return diff <= year;
    }
    function withinLength(productCode, key) {
      if (key === "any") return true;
      const p = rawByCode.value[productCode];
      const dur = p == null ? void 0 : p.duration;
      if (!dur) return true;
      const s = parseDurationSeconds(String(dur));
      if (!s) return true;
      if (key === "lt2") return s < 120;
      if (key === "2to4") return s >= 120 && s < 240;
      if (key === "4to6") return s >= 240 && s < 360;
      return s >= 360;
    }
    function withinPurpose(productCode, key) {
      if (key === "any") return true;
      const p = rawByCode.value[productCode];
      const purposes = Array.isArray(p == null ? void 0 : p.availablePurposes) ? p.availablePurposes : null;
      if (!purposes) return true;
      if (key === "youtube") return purposes.includes("YOUTUBE");
      return purposes.includes("PERFORMANCE");
    }
    const filtered = computed(() => {
      if (tab.value !== "all") return allItems.value;
      return allItems.value.filter((it) => withinTime(it.productCode, timeKey.value) && withinLength(it.productCode, lengthKey.value) && withinPurpose(it.productCode, purposeKey.value));
    });
    const topResult = computed(() => filtered.value[0] || null);
    const popularSongs = computed(() => filtered.value.slice(1, 9));
    const errorRequestId = computed(() => resource.error.value instanceof ApiError ? resource.error.value.requestId : null);
    const errorMessage = computed(() => resource.error.value instanceof ApiError ? resource.error.value.message : resource.error.value instanceof Error ? resource.error.value.message : "Không thể tải dữ liệu");
    const categoryOptions = computed(() => categories.map((c) => ({ id: c.id, label: c.label })));
    const artistItems = computed(() => artists.map((a) => ({ id: a.id, name: a.name })));
    function setTab(next) {
      const params = {};
      if (q.value) params.q = q.value;
      if (next !== "all") params.tab = next;
      router.push({ name: "search", params, query: genre.value ? { genre: genre.value } : {} });
    }
    function setGenre(nextGenre) {
      const params = {};
      if (q.value) params.q = q.value;
      if (tab.value !== "all") params.tab = tab.value;
      const query = {};
      if (nextGenre && nextGenre !== "all") query.genre = nextGenre;
      router.replace({ name: "search", params, query });
    }
    function updateFilters(next) {
      if (next.timeKey) timeKey.value = next.timeKey;
      if (next.lengthKey) lengthKey.value = next.lengthKey;
      if (next.purposeKey) purposeKey.value = next.purposeKey;
    }
    function reload() {
      resource.run();
    }
    watch(
      () => [route.params.q, route.query.genre],
      () => {
        reload();
      }
    );
    onMounted(() => {
      reload();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "search-page" }, _attrs))} data-v-cb3a8aeb><div class="container section-tight" data-v-cb3a8aeb><div class="grid" data-v-cb3a8aeb><aside class="sidebar" data-v-cb3a8aeb>`);
      _push(ssrRenderComponent(SearchSidebar, {
        q: q.value,
        "active-tab": tab.value,
        genre: genre.value || "all",
        categories: categoryOptions.value,
        "show-filters": tab.value === "all",
        "time-key": timeKey.value,
        "length-key": lengthKey.value,
        "purpose-key": purposeKey.value,
        onSetTab: setTab,
        onSetGenre: setGenre,
        onUpdateFilters: updateFilters
      }, null, _parent));
      _push(`</aside><main class="content" data-v-cb3a8aeb>`);
      if (q.value) {
        _push(`<div class="muted" style="${ssrRenderStyle({ "margin-bottom": "12px" })}" data-v-cb3a8aeb>Search results for “${ssrInterpolate(q.value)}”</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(resource).status.value === "idle" || unref(resource).status.value === "loading") {
        _push(`<!--[--><div class="skeleton-head" data-v-cb3a8aeb>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "40%",
          height: "16px"
        }, null, _parent));
        _push(ssrRenderComponent(SkeletonLine, {
          width: "28%",
          height: "12px"
        }, null, _parent));
        _push(`</div><div class="two-col" data-v-cb3a8aeb><div class="card" data-v-cb3a8aeb>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "60%",
          height: "14px"
        }, null, _parent));
        _push(`<div style="${ssrRenderStyle({ "height": "12px" })}" data-v-cb3a8aeb></div>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "40%",
          height: "12px"
        }, null, _parent));
        _push(`</div><div class="card" data-v-cb3a8aeb>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "55%",
          height: "14px"
        }, null, _parent));
        _push(`<div style="${ssrRenderStyle({ "height": "12px" })}" data-v-cb3a8aeb></div>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "35%",
          height: "12px"
        }, null, _parent));
        _push(`</div></div><div class="card" style="${ssrRenderStyle({ "margin-top": "12px" })}" data-v-cb3a8aeb>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "30%",
          height: "14px"
        }, null, _parent));
        _push(`<div style="${ssrRenderStyle({ "height": "12px" })}" data-v-cb3a8aeb></div>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "80%",
          height: "12px"
        }, null, _parent));
        _push(`<div style="${ssrRenderStyle({ "height": "10px" })}" data-v-cb3a8aeb></div>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "70%",
          height: "12px"
        }, null, _parent));
        _push(`</div><!--]-->`);
      } else if (unref(resource).status.value === "error") {
        _push(ssrRenderComponent(_sfc_main$6, {
          title: "Không thể tải kết quả tìm kiếm",
          message: errorMessage.value,
          "request-id": errorRequestId.value,
          "can-retry": true,
          onRetry: reload
        }, null, _parent));
      } else if (!allItems.value.length) {
        _push(`<div class="card" data-v-cb3a8aeb><div style="${ssrRenderStyle({ "font-weight": "800" })}" data-v-cb3a8aeb>Không có dữ liệu</div><div class="muted" style="${ssrRenderStyle({ "margin-top": "6px" })}" data-v-cb3a8aeb>Thử từ khoá khác hoặc kiểm tra lại bộ lọc.</div></div>`);
      } else {
        _push(`<!--[-->`);
        if (tab.value === "all") {
          _push(`<!--[-->`);
          _push(ssrRenderComponent(SearchTopAndSongs, {
            top: topResult.value,
            songs: popularSongs.value
          }, null, _parent));
          _push(`<div style="${ssrRenderStyle({ "margin-top": "14px" })}" data-v-cb3a8aeb>`);
          _push(ssrRenderComponent(SearchArtistsSection, { items: artistItems.value }, null, _parent));
          _push(`</div><div style="${ssrRenderStyle({ "margin-top": "14px" })}" data-v-cb3a8aeb>`);
          _push(ssrRenderComponent(SearchPlaylistsSection, null, null, _parent));
          _push(`</div><div style="${ssrRenderStyle({ "margin-top": "14px" })}" data-v-cb3a8aeb>`);
          _push(ssrRenderComponent(SearchGenresSection, {
            items: categoryOptions.value.filter((i) => i.id !== "all"),
            active: genre.value || "all",
            onSelect: setGenre
          }, null, _parent));
          _push(`</div><!--]-->`);
        } else if (tab.value === "artist") {
          _push(ssrRenderComponent(SearchArtistsSection, {
            items: artistItems.value,
            expanded: true
          }, null, _parent));
        } else {
          _push(ssrRenderComponent(SearchGenresSection, {
            items: categoryOptions.value.filter((i) => i.id !== "all"),
            active: genre.value || "all",
            expanded: true,
            onSelect: setGenre
          }, null, _parent));
        }
        _push(`<!--]-->`);
      }
      _push(`</main></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/search/index.page.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index_page = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-cb3a8aeb"]]);
export {
  index_page as default
};
