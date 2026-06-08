import { createHead } from "@unhead/vue/server";
import { defineComponent, ref, onMounted, createSSRApp, useSSRContext, mergeProps, unref, computed, watch, onUnmounted, withCtx, createVNode, createTextVNode, openBlock, createBlock, toDisplayString, createCommentVNode, resolveComponent, resolveDynamicComponent, Transition } from "vue";
import { createRouter, createMemoryHistory, useRouter, useRoute, RouterLink } from "vue-router";
import { defineStore, createPinia } from "pinia";
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderComponent, ssrInterpolate, ssrRenderVNode } from "vue/server-renderer";
const ClientOnly = defineComponent({
  setup(props, { slots }) {
    const mounted = ref(false);
    onMounted(() => mounted.value = true);
    return () => {
      if (!mounted.value)
        return slots.placeholder && slots.placeholder({});
      return slots.default && slots.default({});
    };
  }
});
function ViteSSG(App2, routerOptions, fn, options) {
  const {
    transformState,
    registerComponents = true,
    useHead = true
  } = options ?? {};
  async function createApp$1(routePath) {
    const app = createSSRApp(App2);
    let head;
    if (useHead) {
      app.use(head = createHead());
    }
    const router = createRouter({
      history: createMemoryHistory(routerOptions.base),
      ...routerOptions
    });
    const { routes: routes2 } = routerOptions;
    if (registerComponents)
      app.component("ClientOnly", ClientOnly);
    const appRenderCallbacks = [];
    const onSSRAppRendered = (cb) => appRenderCallbacks.push(cb);
    const triggerOnSSRAppRendered = () => {
      return Promise.all(appRenderCallbacks.map((cb) => cb()));
    };
    const context = {
      app,
      head,
      isClient: false,
      router,
      routes: routes2,
      onSSRAppRendered,
      triggerOnSSRAppRendered,
      initialState: {},
      transformState,
      routePath
    };
    await (fn == null ? void 0 : fn(context));
    app.use(router);
    let entryRoutePath;
    let isFirstRoute = true;
    router.beforeEach((to, from, next) => {
      if (isFirstRoute || entryRoutePath && entryRoutePath === to.path) {
        isFirstRoute = false;
        entryRoutePath = to.path;
        to.meta.state = context.initialState;
      }
      next();
    });
    {
      const route = context.routePath ?? "/";
      router.push(route);
      await router.isReady();
      context.initialState = router.currentRoute.value.meta.state || {};
    }
    const initialState = context.initialState;
    return {
      ...context,
      initialState
    };
  }
  return createApp$1;
}
const logoSrc = "/assets/Musica-logo-DCMrmKFD.png";
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$4 = {
  __name: "BrandLogo",
  __ssrInlineRender: true,
  props: {
    size: { type: Number, default: 34 }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "brand",
        style: { height: __props.size + "px" }
      }, _attrs))} data-v-3b91b688><img${ssrRenderAttr("src", unref(logoSrc))} alt="MusicA"${ssrRenderAttr("height", __props.size)} data-v-3b91b688></div>`);
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/layout/BrandLogo.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const BrandLogo = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-3b91b688"]]);
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "HeaderSearch",
  __ssrInlineRender: true,
  setup(__props) {
    useRouter();
    const route = useRoute();
    const currentQ = computed(() => {
      if (route.name === "search") return typeof route.params.q === "string" ? route.params.q : "";
      if (route.name === "market") return typeof route.query.q === "string" ? route.query.q : "";
      return "";
    });
    const value = ref(currentQ.value);
    watch(
      () => currentQ.value,
      (v) => {
        if (v !== value.value) value.value = v;
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<form${ssrRenderAttrs(mergeProps({ class: "search" }, _attrs))} data-v-440f8f9d><svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" data-v-440f8f9d><circle cx="11" cy="11" r="7" data-v-440f8f9d></circle><path d="m20 20-3.5-3.5" data-v-440f8f9d></path></svg><input${ssrRenderAttr("value", value.value)} type="search" placeholder="Tìm tác phẩm, nghệ sĩ…" data-v-440f8f9d></form>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/layout/HeaderSearch.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const HeaderSearch = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-440f8f9d"]]);
const useCartStore = defineStore("cart", {
  state: () => ({
    items: []
  }),
  getters: {
    subtotal: (s) => s.items.reduce((sum, it) => sum + it.price * it.qty, 0),
    fee: (s) => Math.round(s.items.reduce((sum, it) => sum + it.price * it.qty, 0) * 0.04),
    total(state) {
      return this.subtotal + this.fee;
    },
    count: (s) => s.items.reduce((n, i) => n + i.qty, 0)
  },
  actions: {
    add(item) {
      this.items.push({ ...item, qty: 1, lineId: cryptoRandomId() });
    },
    remove(lineId) {
      this.items = this.items.filter((i) => i.lineId !== lineId);
    },
    clear() {
      this.items = [];
    }
  }
});
function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
async function loginApi(input) {
  {
    const role = input.email.toLowerCase().includes("artist") ? "ARTIST" : "BUYER";
    const data = {
      accessToken: Math.random().toString(36).slice(2) + Date.now().toString(36),
      tokenType: "Bearer",
      expiresInSeconds: 60 * 60 * 24 * 7,
      user: {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
        email: input.email,
        fullName: role === "ARTIST" ? "Artist" : "Buyer",
        status: "ACTIVE"
      },
      roles: [role]
    };
    return { data };
  }
}
const STORAGE_KEY = "musica_auth_v1";
function readPersisted() {
  if (typeof window === "undefined" || !globalThis.sessionStorage) return null;
  const raw = globalThis.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!(parsed == null ? void 0 : parsed.accessToken)) return null;
    return parsed;
  } catch {
    return null;
  }
}
function writePersisted(v) {
  if (typeof window === "undefined" || !globalThis.sessionStorage) return;
  if (!v) {
    globalThis.sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  globalThis.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(v));
}
const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: null,
    user: null,
    roles: [],
    hydrated: false
  }),
  getters: {
    isAuthenticated: (s) => !!s.accessToken
  },
  actions: {
    hydrate() {
      if (this.hydrated) return;
      const persisted = readPersisted();
      if (persisted) {
        this.accessToken = persisted.accessToken;
        this.user = persisted.user;
        this.roles = persisted.roles;
      }
      this.hydrated = true;
    },
    async login(input) {
      const res = await loginApi({ email: input.email, password: input.password });
      this.applyLogin(res.data, input.remember);
    },
    applyLogin(data, remember) {
      this.accessToken = data.accessToken;
      this.user = data.user;
      this.roles = data.roles;
      if (remember) {
        writePersisted({ accessToken: data.accessToken, user: data.user, roles: data.roles });
      } else {
        writePersisted(null);
      }
      this.hydrated = true;
    },
    logout() {
      this.accessToken = null;
      this.user = null;
      this.roles = [];
      writePersisted(null);
    }
  }
});
const _sfc_main$2 = {
  __name: "AppHeader",
  __ssrInlineRender: true,
  setup(__props) {
    const scrolled = ref(false);
    useRoute();
    useRouter();
    const cart = useCartStore();
    const auth = useAuthStore();
    const count = computed(() => cart.items.reduce((s, i) => s + i.qty, 0));
    const isAuthed = computed(() => auth.isAuthenticated);
    const isBuyer = computed(() => auth.roles.includes("BUYER"));
    const isArtist = computed(() => auth.roles.includes("ARTIST"));
    function onScroll() {
      scrolled.value = window.scrollY > 12;
    }
    onMounted(() => {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    });
    onUnmounted(() => window.removeEventListener("scroll", onScroll));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<header${ssrRenderAttrs(mergeProps({
        class: ["site-header", { scrolled: scrolled.value }]
      }, _attrs))} data-v-1c1a89c9><div class="container header-inner" data-v-1c1a89c9>`);
      _push(ssrRenderComponent(unref(RouterLink), {
        to: "/",
        class: "logo-link",
        "aria-label": "MusicA home"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(BrandLogo, { size: 32 }, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(BrandLogo, { size: 32 })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<nav class="nav-main" aria-label="Primary" data-v-1c1a89c9>`);
      _push(ssrRenderComponent(unref(RouterLink), {
        to: "/",
        class: "nav-link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Khám phá`);
          } else {
            return [
              createTextVNode("Khám phá")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<a href="#categories" class="nav-link" data-v-1c1a89c9>Thể loại</a><a href="#artists" class="nav-link" data-v-1c1a89c9>Nghệ sĩ</a><a href="#how" class="nav-link" data-v-1c1a89c9>Quy trình</a><a href="#pricing" class="nav-link" data-v-1c1a89c9>Bảng giá</a></nav><div class="nav-actions" data-v-1c1a89c9>`);
      _push(ssrRenderComponent(HeaderSearch, { class: "header-search" }, null, _parent));
      _push(ssrRenderComponent(unref(RouterLink), {
        to: "/cart",
        class: "icon-btn cart-btn",
        "aria-label": "Giỏ hàng"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-1c1a89c9${_scopeId}><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.5L22 7H6" data-v-1c1a89c9${_scopeId}></path><circle cx="9" cy="20" r="1.4" data-v-1c1a89c9${_scopeId}></circle><circle cx="18" cy="20" r="1.4" data-v-1c1a89c9${_scopeId}></circle></svg>`);
            if (count.value) {
              _push2(`<span class="badge" data-v-1c1a89c9${_scopeId}>${ssrInterpolate(count.value)}</span>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              (openBlock(), createBlock("svg", {
                width: "18",
                height: "18",
                viewBox: "0 0 24 24",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2",
                "stroke-linecap": "round",
                "stroke-linejoin": "round"
              }, [
                createVNode("path", { d: "M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.5L22 7H6" }),
                createVNode("circle", {
                  cx: "9",
                  cy: "20",
                  r: "1.4"
                }),
                createVNode("circle", {
                  cx: "18",
                  cy: "20",
                  r: "1.4"
                })
              ])),
              count.value ? (openBlock(), createBlock("span", {
                key: 0,
                class: "badge"
              }, toDisplayString(count.value), 1)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      if (!isAuthed.value) {
        _push(ssrRenderComponent(unref(RouterLink), {
          to: "/login",
          class: "btn btn-ghost btn-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Đăng nhập`);
            } else {
              return [
                createTextVNode("Đăng nhập")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (isAuthed.value && isBuyer.value) {
        _push(ssrRenderComponent(unref(RouterLink), {
          to: "/me/certificates",
          class: "btn btn-ghost btn-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Chứng nhận`);
            } else {
              return [
                createTextVNode("Chứng nhận")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (isAuthed.value && isArtist.value) {
        _push(ssrRenderComponent(unref(RouterLink), {
          to: "/me/products",
          class: "btn btn-ghost btn-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Tác phẩm`);
            } else {
              return [
                createTextVNode("Tác phẩm")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (isAuthed.value) {
        _push(`<button class="btn btn-ghost btn-sm" type="button" data-v-1c1a89c9>Đăng xuất</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="btn btn-primary btn-sm" data-v-1c1a89c9>Đăng bán tác quyền</button></div></div></header>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/layout/AppHeader.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const AppHeader = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-1c1a89c9"]]);
const _sfc_main$1 = {
  __name: "AppFooter",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "site-footer" }, _attrs))} data-v-99d1c56d><div class="container" data-v-99d1c56d><div class="footer-grid" data-v-99d1c56d><div class="brand-col" data-v-99d1c56d>`);
      _push(ssrRenderComponent(BrandLogo, { size: 36 }, null, _parent));
      _push(`<p class="tag" data-v-99d1c56d>Thương mại điện tử tác quyền âm nhạc — kết nối trực tiếp nghệ sĩ với người mua một cách minh bạch, linh hoạt, hợp pháp.</p><div class="socials" data-v-99d1c56d><a href="#" aria-label="Facebook" class="soc" data-v-99d1c56d>f</a><a href="#" aria-label="YouTube" class="soc" data-v-99d1c56d>▶</a><a href="#" aria-label="TikTok" class="soc" data-v-99d1c56d>♪</a><a href="#" aria-label="Instagram" class="soc" data-v-99d1c56d>◎</a></div></div><div data-v-99d1c56d><h4 data-v-99d1c56d>Giao dịch</h4><a href="#" data-v-99d1c56d>Tác quyền YouTube</a><a href="#" data-v-99d1c56d>Tác quyền biểu diễn</a><a href="#" data-v-99d1c56d>Tác quyền thương mại</a><a href="#" data-v-99d1c56d>Tác quyền livestream</a></div><div data-v-99d1c56d><h4 data-v-99d1c56d>Cộng đồng</h4><a href="#" data-v-99d1c56d>Người mua / Creator</a><a href="#" data-v-99d1c56d>Nghệ sĩ / Tác giả</a><a href="#" data-v-99d1c56d>Doanh nghiệp SME</a><a href="#" data-v-99d1c56d>MCN &amp; Agency</a></div><div data-v-99d1c56d><h4 data-v-99d1c56d>Tổ chức</h4><a href="#" data-v-99d1c56d>Về MusicA</a><a href="#" data-v-99d1c56d>Báo chí</a><a href="#" data-v-99d1c56d>Điều khoản</a><a href="#" data-v-99d1c56d>Liên hệ</a></div></div><hr class="divider" data-v-99d1c56d><div class="legal" data-v-99d1c56d><span data-v-99d1c56d>© ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} MusicA. Mọi quyền được bảo lưu.</span><span class="cert" data-v-99d1c56d><i class="dot" data-v-99d1c56d></i> Hợp đồng số được ký xác thực theo Luật Giao dịch điện tử. </span></div></div></footer>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/components/layout/AppFooter.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const AppFooter = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-99d1c56d"]]);
let observer = null;
function ensureObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  return observer;
}
function scan() {
  const o = ensureObserver();
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => o.observe(el));
}
function useReveal() {
  let raf = null;
  const trigger = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(scan);
  };
  onMounted(() => {
    trigger();
    const mo = new MutationObserver(trigger);
    mo.observe(document.body, { childList: true, subtree: true });
    onUnmounted(() => mo.disconnect());
  });
  return { rescan: trigger };
}
const _sfc_main = {
  __name: "App",
  __ssrInlineRender: true,
  setup(__props) {
    useReveal();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_router_view = resolveComponent("router-view");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "app-shell" }, _attrs))} data-v-c35539d3>`);
      _push(ssrRenderComponent(AppHeader, null, null, _parent));
      _push(`<main data-v-c35539d3>`);
      _push(ssrRenderComponent(_component_router_view, null, {
        default: withCtx(({ Component, route }, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(``);
            ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(Component), {
              key: route.fullPath
            }, null), _parent2, _scopeId);
          } else {
            return [
              createVNode(Transition, {
                name: "page",
                mode: "out-in"
              }, {
                default: withCtx(() => [
                  (openBlock(), createBlock(resolveDynamicComponent(Component), {
                    key: route.fullPath
                  }))
                ]),
                _: 2
              }, 1024)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</main>`);
      _push(ssrRenderComponent(AppFooter, null, null, _parent));
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/App.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c35539d3"]]);
const routes = [
  { path: "/", name: "home", component: () => import("./assets/index.page-LNvNGZoB.js") },
  {
    path: "/market",
    name: "market",
    redirect: (to) => {
      const q = typeof to.query.q === "string" ? to.query.q : "";
      const genre = typeof to.query.genre === "string" ? to.query.genre : "";
      const query = {};
      if (genre) query.genre = genre;
      if (q) return { name: "search", params: { q }, query };
      return { name: "search", query };
    }
  },
  { path: "/search/:q?/:tab?", name: "search", component: () => import("./assets/index.page-C5_UQBg6.js"), props: true },
  { path: "/product/:id", name: "product", component: () => import("./assets/index.page-DX9zo-Bj.js"), props: true },
  { path: "/cart", name: "cart", component: () => import("./assets/index.page-SNJJZlhp.js") },
  { path: "/checkout", name: "checkout", component: () => import("./assets/index.page-DUt5G8D9.js") },
  { path: "/success", name: "success", component: () => import("./assets/index.page-BQ_zRYBD.js") },
  { path: "/login", name: "login", component: () => import("./assets/login.page-B1onV6IT.js") },
  { path: "/me/certificates", name: "my-certificates", component: () => import("./assets/list.page-CTcj5oBM.js"), meta: { requiresAuth: true, requiredRoles: ["BUYER"] } },
  { path: "/me/certificates/:certificateId", name: "certificate-detail", component: () => import("./assets/detail.page-BPRcmQnu.js"), props: true, meta: { requiresAuth: true, requiredRoles: ["BUYER"] } },
  { path: "/me/products", name: "my-products", component: () => import("./assets/list.page-wKwCOkjf.js"), meta: { requiresAuth: true, requiredRoles: ["ARTIST"] } },
  { path: "/me/products/:productId", name: "my-product-detail", component: () => import("./assets/detail.page-V3Qjkj1y.js"), props: true, meta: { requiresAuth: true, requiredRoles: ["ARTIST"] } }
];
function hasAnyRole(userRoles, required) {
  if (!required) return true;
  if (!Array.isArray(required)) return true;
  return required.some((r) => userRoles.includes(r));
}
function installRouterGuards(input) {
  input.router.beforeEach((to) => {
    var _a, _b;
    input.auth.hydrate();
    if (to.name === "login" && input.auth.isAuthenticated) {
      if (input.auth.roles.includes("ARTIST")) return { name: "my-products" };
      if (input.auth.roles.includes("BUYER")) return { name: "my-certificates" };
      return { name: "home" };
    }
    const requiresAuth = !!((_a = to.meta) == null ? void 0 : _a.requiresAuth);
    const requiredRoles = (_b = to.meta) == null ? void 0 : _b.requiredRoles;
    if (!requiresAuth) return true;
    if (!input.auth.isAuthenticated) {
      return { name: "login", query: { redirect: to.fullPath } };
    }
    if (!hasAnyRole(input.auth.roles, requiredRoles)) {
      return { name: "home" };
    }
    return true;
  });
}
const createApp = ViteSSG(
  App,
  { routes },
  ({ app, router }) => {
    const pinia = createPinia();
    app.use(pinia);
    const auth = useAuthStore(pinia);
    if (router) installRouterGuards({ router, auth });
  },
  { useHead: true }
);
export {
  _export_sfc as _,
  useCartStore as a,
  createApp,
  useAuthStore as u
};
