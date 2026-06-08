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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "panel card" }, _attrs))} data-v-6154d1d2><div class="header" data-v-6154d1d2><div style="${ssrRenderStyle({ "font-weight": "900", "letter-spacing": "-0.01em" })}" data-v-6154d1d2>Kết quả</div>`);
      if (__props.q) {
        _push(`<div class="sub" data-v-6154d1d2>“${ssrInterpolate(__props.q)}”</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="tabs" data-v-6154d1d2><button class="tab" type="button"${ssrRenderAttr("data-active", isActive("all"))} data-v-6154d1d2>All</button><button class="tab" type="button"${ssrRenderAttr("data-active", isActive("artist"))} data-v-6154d1d2>Artist</button><button class="tab" type="button"${ssrRenderAttr("data-active", isActive("genres"))} data-v-6154d1d2>Genres</button></div>`);
      if (__props.showFilters) {
        _push(`<div class="filters" data-v-6154d1d2><details open class="group" data-v-6154d1d2><summary data-v-6154d1d2>Added any time</summary><div class="opts" data-v-6154d1d2><button class="opt" type="button"${ssrRenderAttr("data-active", __props.timeKey === "any")} data-v-6154d1d2>Any time</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.timeKey === "hour")} data-v-6154d1d2>Past hour</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.timeKey === "day")} data-v-6154d1d2>Past day</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.timeKey === "week")} data-v-6154d1d2>Past week</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.timeKey === "month")} data-v-6154d1d2>Past month</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.timeKey === "year")} data-v-6154d1d2>Past year</button></div></details><details class="group" data-v-6154d1d2><summary data-v-6154d1d2>Any length</summary><div class="opts" data-v-6154d1d2><button class="opt" type="button"${ssrRenderAttr("data-active", __props.lengthKey === "any")} data-v-6154d1d2>Any</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.lengthKey === "lt2")} data-v-6154d1d2>&lt; 2 phút</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.lengthKey === "2to4")} data-v-6154d1d2>2–4 phút</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.lengthKey === "4to6")} data-v-6154d1d2>4–6 phút</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.lengthKey === "gt6")} data-v-6154d1d2>&gt; 6 phút</button></div></details><details class="group" data-v-6154d1d2><summary data-v-6154d1d2>Mục đích sử dụng</summary><div class="opts" data-v-6154d1d2><button class="opt" type="button"${ssrRenderAttr("data-active", __props.purposeKey === "any")} data-v-6154d1d2>Tất cả</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.purposeKey === "youtube")} data-v-6154d1d2>YouTube</button><button class="opt" type="button"${ssrRenderAttr("data-active", __props.purposeKey === "performance")} data-v-6154d1d2>Biểu diễn</button></div></details><details class="group" data-v-6154d1d2><summary data-v-6154d1d2>Filter by genre</summary><div class="opts" data-v-6154d1d2><button class="opt" type="button"${ssrRenderAttr("data-active", __props.genre === "all")} data-v-6154d1d2>All</button><!--[-->`);
        ssrRenderList(__props.categories.filter((x) => x.id !== "all"), (c) => {
          _push(`<button class="opt" type="button"${ssrRenderAttr("data-active", __props.genre === c.id)} data-v-6154d1d2>${ssrInterpolate(c.label)}</button>`);
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
const SearchSidebar = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-6154d1d2"]]);
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "wrap" }, _attrs))} data-v-4d852a5c><div class="left" data-v-4d852a5c><div class="muted" style="${ssrRenderStyle({ "font-weight": "900" })}" data-v-4d852a5c>Top result</div>`);
      if (__props.top) {
        _push(`<div class="card top" data-v-4d852a5c><div class="art" style="${ssrRenderStyle({ background: __props.top.thumbnailUrl || "var(--grad-brand)" })}" aria-hidden="true" data-v-4d852a5c></div><div class="info" data-v-4d852a5c><div class="title" data-v-4d852a5c>${ssrInterpolate(__props.top.title)}</div><div class="muted" data-v-4d852a5c>${ssrInterpolate(__props.top.artistDisplayName)}</div><div class="muted code" data-v-4d852a5c>${ssrInterpolate(__props.top.productCode)}</div></div></div>`);
      } else {
        _push(`<div class="card top" data-v-4d852a5c><div class="muted" data-v-4d852a5c>Không có top result</div></div>`);
      }
      _push(`</div><div class="right" data-v-4d852a5c><div class="muted" style="${ssrRenderStyle({ "font-weight": "900" })}" data-v-4d852a5c>Popular songs</div><div class="list" data-v-4d852a5c><!--[-->`);
      ssrRenderList(__props.songs, (s) => {
        _push(ssrRenderComponent(_component_RouterLink, {
          key: s.id,
          class: "row",
          to: `/product/${s.id}`
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="thumb" style="${ssrRenderStyle({ background: s.thumbnailUrl || "var(--c-bg-mute)" })}" aria-hidden="true" data-v-4d852a5c${_scopeId}></div><div class="txt" data-v-4d852a5c${_scopeId}><div class="name" data-v-4d852a5c${_scopeId}>${ssrInterpolate(s.title)}</div><div class="muted meta" data-v-4d852a5c${_scopeId}>${ssrInterpolate(s.artistDisplayName)}</div></div>`);
            } else {
              return [
                createVNode("div", {
                  class: "thumb",
                  style: { background: s.thumbnailUrl || "var(--c-bg-mute)" },
                  "aria-hidden": "true"
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
const SearchTopAndSongs = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-4d852a5c"]]);
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "card section" }, _attrs))} data-v-f6347972><div class="head" data-v-f6347972><div style="${ssrRenderStyle({ "font-weight": "900" })}" data-v-f6347972>Artists</div>`);
      if (!__props.expanded) {
        _push(`<button class="link" type="button" data-v-f6347972>${ssrInterpolate(open.value ? "Thu gọn" : "Xem thêm")}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="grid" data-v-f6347972><!--[-->`);
      ssrRenderList(visible.value, (a) => {
        _push(`<div class="artist" data-v-f6347972><div class="ava" data-v-f6347972></div><div class="name" data-v-f6347972>${ssrInterpolate(a.name)}</div></div>`);
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
const SearchArtistsSection = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-f6347972"]]);
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "card section" }, _attrs))} data-v-242ffcb7><div class="head" data-v-242ffcb7><div style="${ssrRenderStyle({ "font-weight": "900" })}" data-v-242ffcb7>Genres</div>`);
      if (!__props.expanded) {
        _push(`<button class="link" type="button" data-v-242ffcb7>${ssrInterpolate(open.value ? "Thu gọn" : "Xem thêm")}</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="chips" data-v-242ffcb7><button class="chip" type="button"${ssrRenderAttr("data-active", __props.active === "all")} data-v-242ffcb7>All</button><!--[-->`);
      ssrRenderList(visible.value, (it) => {
        _push(`<button class="chip" type="button"${ssrRenderAttr("data-active", __props.active === it.id)} data-v-242ffcb7>${ssrInterpolate(it.label)}</button>`);
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
const SearchGenresSection = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-242ffcb7"]]);
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "card section" }, _attrs))} data-v-f4fd58ed><div style="${ssrRenderStyle({ "font-weight": "900" })}" data-v-f4fd58ed>Playlists</div><div class="chips" data-v-f4fd58ed><!--[-->`);
      ssrRenderList(items, (it) => {
        _push(`<button class="chip" type="button"${ssrRenderAttr("data-active", selected.value === it.id)} data-v-f4fd58ed>${ssrInterpolate(it.label)}</button>`);
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
const SearchPlaylistsSection = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-f4fd58ed"]]);
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
    const popularSongs = computed(() => filtered.value.slice(1, 5));
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "search-page" }, _attrs))} data-v-9dcb71bd><div class="container section-tight" data-v-9dcb71bd><div class="grid" data-v-9dcb71bd><aside class="sidebar" data-v-9dcb71bd>`);
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
      _push(`</aside><main class="content" data-v-9dcb71bd>`);
      if (q.value) {
        _push(`<div class="muted" style="${ssrRenderStyle({ "margin-bottom": "12px" })}" data-v-9dcb71bd>Search results for “${ssrInterpolate(q.value)}”</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(resource).status.value === "loading" && allItems.value.length) {
        _push(`<div class="loading-bar" aria-hidden="true" data-v-9dcb71bd></div>`);
      } else {
        _push(`<!---->`);
      }
      if ((unref(resource).status.value === "idle" || unref(resource).status.value === "loading") && !allItems.value.length) {
        _push(`<!--[--><div class="skeleton-head" data-v-9dcb71bd>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "40%",
          height: "16px"
        }, null, _parent));
        _push(ssrRenderComponent(SkeletonLine, {
          width: "28%",
          height: "12px"
        }, null, _parent));
        _push(`</div><div class="two-col" data-v-9dcb71bd><div class="card" data-v-9dcb71bd>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "60%",
          height: "14px"
        }, null, _parent));
        _push(`<div style="${ssrRenderStyle({ "height": "12px" })}" data-v-9dcb71bd></div>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "40%",
          height: "12px"
        }, null, _parent));
        _push(`</div><div class="card" data-v-9dcb71bd>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "55%",
          height: "14px"
        }, null, _parent));
        _push(`<div style="${ssrRenderStyle({ "height": "12px" })}" data-v-9dcb71bd></div>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "35%",
          height: "12px"
        }, null, _parent));
        _push(`</div></div><div class="card" style="${ssrRenderStyle({ "margin-top": "12px" })}" data-v-9dcb71bd>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "30%",
          height: "14px"
        }, null, _parent));
        _push(`<div style="${ssrRenderStyle({ "height": "12px" })}" data-v-9dcb71bd></div>`);
        _push(ssrRenderComponent(SkeletonLine, {
          width: "80%",
          height: "12px"
        }, null, _parent));
        _push(`<div style="${ssrRenderStyle({ "height": "10px" })}" data-v-9dcb71bd></div>`);
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
        _push(`<div class="card" data-v-9dcb71bd><div style="${ssrRenderStyle({ "font-weight": "800" })}" data-v-9dcb71bd>Không có dữ liệu</div><div class="muted" style="${ssrRenderStyle({ "margin-top": "6px" })}" data-v-9dcb71bd>Thử từ khoá khác hoặc kiểm tra lại bộ lọc.</div></div>`);
      } else {
        _push(`<!--[-->`);
        if (tab.value === "all") {
          _push(`<!--[-->`);
          _push(ssrRenderComponent(SearchTopAndSongs, {
            top: topResult.value,
            songs: popularSongs.value
          }, null, _parent));
          _push(`<div style="${ssrRenderStyle({ "margin-top": "14px" })}" data-v-9dcb71bd>`);
          _push(ssrRenderComponent(SearchArtistsSection, { items: artistItems.value }, null, _parent));
          _push(`</div><div style="${ssrRenderStyle({ "margin-top": "14px" })}" data-v-9dcb71bd>`);
          _push(ssrRenderComponent(SearchPlaylistsSection, null, null, _parent));
          _push(`</div><div style="${ssrRenderStyle({ "margin-top": "14px" })}" data-v-9dcb71bd>`);
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
const index_page = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9dcb71bd"]]);
export {
  index_page as default
};
