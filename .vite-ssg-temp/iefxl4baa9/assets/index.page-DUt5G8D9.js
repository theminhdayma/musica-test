import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderComponent } from "vue/server-renderer";
import { ref, computed, mergeProps, unref, useSSRContext } from "vue";
import { useRouter } from "vue-router";
import { _ as _export_sfc, a as useCartStore } from "../main.mjs";
import { f as formatVND } from "./catalog-BTAmee6Y.js";
import "@unhead/vue/server";
import "pinia";
const _sfc_main$1 = {
  __name: "CheckoutView",
  __ssrInlineRender: true,
  setup(__props) {
    const cart = useCartStore();
    useRouter();
    const step = ref(1);
    const steps = ["Thông tin & xem lại", "Ký hợp đồng tác quyền", "Thanh toán"];
    const buyer = ref({
      fullName: "Nguyễn Văn Creator",
      email: "creator@studio.vn",
      phone: "0901 234 567",
      org: "Skyline Studio",
      taxId: "0312345678",
      channel: "youtube.com/@skylinestudio"
    });
    const agreed = ref(false);
    ref("");
    ref(false);
    ref(null);
    let hasSignature = ref(false);
    const paymentMethod = ref("vnpay");
    const paymentMethods = [
      { k: "vnpay", label: "VNPay", desc: "Thẻ ATM nội địa, QR Pay" },
      { k: "visa", label: "Visa / MasterCard", desc: "Thẻ tín dụng quốc tế" },
      { k: "momo", label: "Ví MoMo", desc: "Thanh toán qua MoMo" },
      { k: "bank", label: "Chuyển khoản", desc: "Phù hợp doanh nghiệp" }
    ];
    const card = ref({ number: "", holder: "", exp: "", cvv: "" });
    const canNext = computed(() => {
      if (step.value === 1) return !!(buyer.value.fullName && buyer.value.email);
      if (step.value === 2) return hasSignature.value && agreed.value;
      return true;
    });
    const processing = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "checkout-page" }, _attrs))} data-v-0c973c60><div class="container" data-v-0c973c60><div class="head" data-v-0c973c60><span class="eyebrow" data-v-0c973c60>Hoàn tất giao dịch</span><h1 data-v-0c973c60>Ký kết &amp; thanh toán</h1></div><div class="stepper" data-v-0c973c60><!--[-->`);
      ssrRenderList(steps, (s, i) => {
        _push(`<div class="${ssrRenderClass(["step", { active: step.value === i + 1, done: step.value > i + 1 }])}" data-v-0c973c60><span class="num" data-v-0c973c60>${ssrInterpolate(step.value > i + 1 ? "✓" : i + 1)}</span><span class="label" data-v-0c973c60>${ssrInterpolate(s)}</span></div>`);
      });
      _push(`<!--]--></div><div class="checkout-grid" data-v-0c973c60><div class="main" data-v-0c973c60>`);
      if (step.value === 1) {
        _push(`<div class="panel" data-v-0c973c60><h2 data-v-0c973c60>Thông tin bên mua tác quyền</h2><p class="panel-sub" data-v-0c973c60>Thông tin sẽ xuất hiện trên hợp đồng số.</p><div class="form-grid" data-v-0c973c60><label class="ff" data-v-0c973c60><span data-v-0c973c60>Họ và tên *</span><input${ssrRenderAttr("value", buyer.value.fullName)} type="text" data-v-0c973c60></label><label class="ff" data-v-0c973c60><span data-v-0c973c60>Email *</span><input${ssrRenderAttr("value", buyer.value.email)} type="email" data-v-0c973c60></label><label class="ff" data-v-0c973c60><span data-v-0c973c60>Điện thoại</span><input${ssrRenderAttr("value", buyer.value.phone)} type="tel" data-v-0c973c60></label><label class="ff" data-v-0c973c60><span data-v-0c973c60>Tổ chức / Studio</span><input${ssrRenderAttr("value", buyer.value.org)} type="text" data-v-0c973c60></label><label class="ff" data-v-0c973c60><span data-v-0c973c60>Mã số thuế</span><input${ssrRenderAttr("value", buyer.value.taxId)} type="text" data-v-0c973c60></label><label class="ff" data-v-0c973c60><span data-v-0c973c60>Kênh khai thác</span><input${ssrRenderAttr("value", buyer.value.channel)} type="text" data-v-0c973c60></label></div><h2 class="mt-32" data-v-0c973c60>Xem lại các tác quyền đã chọn</h2><div class="review-list" data-v-0c973c60><!--[-->`);
        ssrRenderList(unref(cart).items, (item) => {
          _push(`<div class="rv-item" data-v-0c973c60><div class="rv-cov" style="${ssrRenderStyle({ background: item.cover })}" data-v-0c973c60></div><div class="rv-body" data-v-0c973c60><strong data-v-0c973c60>${ssrInterpolate(item.title)}</strong><span data-v-0c973c60>${ssrInterpolate(item.artist)}</span><div class="rv-cfg" data-v-0c973c60><!--[-->`);
          ssrRenderList(item.configuration, (v, k) => {
            _push(`<span data-v-0c973c60>${ssrInterpolate(k)}: <b data-v-0c973c60>${ssrInterpolate(v)}</b></span>`);
          });
          _push(`<!--]--></div></div><div class="rv-price" data-v-0c973c60>${ssrInterpolate(unref(formatVND)(item.price))}</div></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else if (step.value === 2) {
        _push(`<div class="panel" data-v-0c973c60><h2 data-v-0c973c60>Hợp đồng mua tác quyền tác phẩm âm nhạc</h2><p class="panel-sub" data-v-0c973c60>Số hợp đồng: <b data-v-0c973c60>MUSA-${ssrInterpolate(Date.now().toString(36).toUpperCase().slice(-8))}</b> · Ký xác thực điện tử theo Luật GDĐT 2023.</p><div class="contract" data-v-0c973c60><div class="ct-head" data-v-0c973c60><div data-v-0c973c60><strong data-v-0c973c60>BÊN BÁN — NGHỆ SĨ / NPH (Bên A)</strong><span data-v-0c973c60>Đại diện thông qua nền tảng thương mại điện tử MusicA</span></div><div data-v-0c973c60><strong data-v-0c973c60>BÊN MUA (Bên B)</strong><span data-v-0c973c60>${ssrInterpolate(buyer.value.fullName)} — ${ssrInterpolate(buyer.value.org || "Cá nhân")}</span></div></div><div class="ct-body" data-v-0c973c60><h4 data-v-0c973c60>Điều 1. Đối tượng giao dịch</h4><p data-v-0c973c60>Bên A đồng ý thực hiện giao dịch tác quyền với Bên B đối với các tác phẩm âm nhạc liệt kê dưới đây, trong phạm vi, mục đích và thời hạn được nêu cụ thể tại từng gói tác quyền.</p><table class="ct-table" data-v-0c973c60><thead data-v-0c973c60><tr data-v-0c973c60><th data-v-0c973c60>Tác phẩm</th><th data-v-0c973c60>Tác giả</th><th data-v-0c973c60>Cấu hình</th><th data-v-0c973c60>Phí (₫)</th></tr></thead><tbody data-v-0c973c60><!--[-->`);
        ssrRenderList(unref(cart).items, (i) => {
          _push(`<tr data-v-0c973c60><td data-v-0c973c60>${ssrInterpolate(i.title)}</td><td data-v-0c973c60>${ssrInterpolate(i.artist)}</td><td data-v-0c973c60><!--[-->`);
          ssrRenderList(i.configuration, (v, k) => {
            _push(`<span class="td-kv" data-v-0c973c60>${ssrInterpolate(k)}: <b data-v-0c973c60>${ssrInterpolate(v)}</b></span>`);
          });
          _push(`<!--]--></td><td class="num" data-v-0c973c60>${ssrInterpolate(unref(formatVND)(i.price))}</td></tr>`);
        });
        _push(`<!--]--></tbody></table><h4 data-v-0c973c60>Điều 2. Phạm vi &amp; nghĩa vụ</h4><p data-v-0c973c60>Bên B được sử dụng tác phẩm trong đúng phạm vi đã cấu hình. Mọi việc khai thác vượt ngoài phạm vi cần đăng ký bổ sung trên nền tảng MusicA.</p><h4 data-v-0c973c60>Điều 3. Bàn giao tài sản</h4><p data-v-0c973c60>Bên A bàn giao đầy đủ bộ tài sản tác quyền (file âm thanh, khuông nhạc, giấy SHTT…) cho Bên B ngay sau khi hợp đồng có hiệu lực.</p><h4 data-v-0c973c60>Điều 4. Hiệu lực</h4><p data-v-0c973c60>Hợp đồng có hiệu lực kể từ thời điểm Bên B hoàn tất thanh toán và ký xác thực điện tử.</p></div><div class="ct-foot" data-v-0c973c60><label class="agree" data-v-0c973c60><input${ssrIncludeBooleanAttr(Array.isArray(agreed.value) ? ssrLooseContain(agreed.value, null) : agreed.value) ? " checked" : ""} type="checkbox" data-v-0c973c60><span data-v-0c973c60>Tôi đã đọc và đồng ý với các điều khoản trong hợp đồng mua tác quyền.</span></label><div class="sig-block" data-v-0c973c60><span class="sig-label" data-v-0c973c60>Chữ ký số của Bên B</span><div class="sig-wrap" data-v-0c973c60><canvas width="500" height="140" data-v-0c973c60></canvas>`);
        if (!unref(hasSignature)) {
          _push(`<span class="sig-hint" data-v-0c973c60>Ký bằng chuột / cảm ứng tại đây</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(hasSignature)) {
          _push(`<button class="sig-clear" data-v-0c973c60>Xoá ký lại</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div></div></div>`);
      } else {
        _push(`<div class="panel" data-v-0c973c60><h2 data-v-0c973c60>Phương thức thanh toán</h2><p class="panel-sub" data-v-0c973c60>Hợp đồng sẽ kích hoạt ngay sau khi giao dịch thành công.</p><div class="pay-methods" data-v-0c973c60><!--[-->`);
        ssrRenderList(paymentMethods, (m) => {
          _push(`<button class="${ssrRenderClass(["pm", { active: paymentMethod.value === m.k }])}" data-v-0c973c60><div class="pm-bullet" data-v-0c973c60></div><div class="pm-body" data-v-0c973c60><strong data-v-0c973c60>${ssrInterpolate(m.label)}</strong><span data-v-0c973c60>${ssrInterpolate(m.desc)}</span></div><div class="pm-logo" data-v-0c973c60>${ssrInterpolate(m.label[0])}</div></button>`);
        });
        _push(`<!--]--></div>`);
        if (paymentMethod.value === "visa") {
          _push(`<div class="card-form" data-v-0c973c60><h4 data-v-0c973c60>Thông tin thẻ</h4><div class="form-grid" data-v-0c973c60><label class="ff full" data-v-0c973c60><span data-v-0c973c60>Số thẻ</span><input${ssrRenderAttr("value", card.value.number)} placeholder="•••• •••• •••• ••••" data-v-0c973c60></label><label class="ff full" data-v-0c973c60><span data-v-0c973c60>Chủ thẻ</span><input${ssrRenderAttr("value", card.value.holder)} placeholder="NGUYEN VAN A" data-v-0c973c60></label><label class="ff" data-v-0c973c60><span data-v-0c973c60>Hết hạn (MM/YY)</span><input${ssrRenderAttr("value", card.value.exp)} placeholder="08/29" data-v-0c973c60></label><label class="ff" data-v-0c973c60><span data-v-0c973c60>CVV</span><input${ssrRenderAttr("value", card.value.cvv)} placeholder="•••" type="password" data-v-0c973c60></label></div></div>`);
        } else if (paymentMethod.value === "vnpay" || paymentMethod.value === "momo") {
          _push(`<div class="qr-pay" data-v-0c973c60><div class="qr-box" data-v-0c973c60><div class="qr-grid" data-v-0c973c60><!--[-->`);
          ssrRenderList(144, (i) => {
            _push(`<div style="${ssrRenderStyle({ background: (i * 13 + i % 7) % 3 ? "#0c1e33" : "transparent" })}" data-v-0c973c60></div>`);
          });
          _push(`<!--]--></div></div><div class="qr-info" data-v-0c973c60><h4 data-v-0c973c60>Quét mã QR để thanh toán</h4><p data-v-0c973c60>Mở ứng dụng ${ssrInterpolate(paymentMethod.value === "vnpay" ? "ngân hàng / VNPay" : "MoMo")} và quét mã để hoàn tất.</p><ul data-v-0c973c60><li data-v-0c973c60>✓ Mã QR có hiệu lực trong 10:00</li><li data-v-0c973c60>✓ Tự động xác nhận khi nhận được tiền</li></ul></div></div>`);
        } else {
          _push(`<div class="bank-pay" data-v-0c973c60><h4 data-v-0c973c60>Thông tin chuyển khoản</h4><div class="bank-info" data-v-0c973c60><div data-v-0c973c60><span data-v-0c973c60>Ngân hàng</span><b data-v-0c973c60>Vietcombank</b></div><div data-v-0c973c60><span data-v-0c973c60>Số tài khoản</span><b data-v-0c973c60>0123 4567 890</b></div><div data-v-0c973c60><span data-v-0c973c60>Chủ tài khoản</span><b data-v-0c973c60>CÔNG TY CỔ PHẦN MUSICA</b></div><div data-v-0c973c60><span data-v-0c973c60>Nội dung CK</span><b class="hl" data-v-0c973c60>MUSA ${ssrInterpolate(Date.now().toString(36).toUpperCase().slice(-6))}</b></div></div></div>`);
        }
        _push(`</div>`);
      }
      _push(`<div class="step-actions" data-v-0c973c60>`);
      if (step.value > 1) {
        _push(`<button class="btn btn-ghost" data-v-0c973c60>← Quay lại</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="${ssrRenderClass(["btn btn-primary btn-lg", { "is-loading": processing.value }])}"${ssrIncludeBooleanAttr(!canNext.value || processing.value) ? " disabled" : ""} data-v-0c973c60>`);
      if (!processing.value) {
        _push(`<span data-v-0c973c60>${ssrInterpolate(step.value === 3 ? `Thanh toán ${unref(formatVND)(unref(cart).total)}` : "Tiếp tục →")}</span>`);
      } else {
        _push(`<span class="spinner" data-v-0c973c60></span>`);
      }
      _push(`</button></div></div><aside class="side" data-v-0c973c60><div class="side-card" data-v-0c973c60><h3 data-v-0c973c60>Tóm tắt đơn</h3><div class="side-items" data-v-0c973c60><!--[-->`);
      ssrRenderList(unref(cart).items, (i) => {
        _push(`<div class="side-item" data-v-0c973c60><div class="si-cov" style="${ssrRenderStyle({ background: i.cover })}" data-v-0c973c60></div><div data-v-0c973c60><strong data-v-0c973c60>${ssrInterpolate(i.title)}</strong><span data-v-0c973c60>${ssrInterpolate(i.artist)}</span></div><em data-v-0c973c60>${ssrInterpolate(unref(formatVND)(i.price))}</em></div>`);
      });
      _push(`<!--]--></div><hr data-v-0c973c60><div class="sum-row" data-v-0c973c60><span data-v-0c973c60>Tạm tính</span><b data-v-0c973c60>${ssrInterpolate(unref(formatVND)(unref(cart).subtotal))}</b></div><div class="sum-row" data-v-0c973c60><span data-v-0c973c60>Phí xử lý</span><b data-v-0c973c60>${ssrInterpolate(unref(formatVND)(unref(cart).fee))}</b></div><div class="sum-total" data-v-0c973c60><span data-v-0c973c60>Tổng cộng</span><strong class="gradient-text" data-v-0c973c60>${ssrInterpolate(unref(formatVND)(unref(cart).total))}</strong></div><div class="trust-mini" data-v-0c973c60><div data-v-0c973c60>🔒 Mã hoá TLS 1.3</div><div data-v-0c973c60>📜 Hợp đồng số có hiệu lực pháp lý</div><div data-v-0c973c60>↩ Hỗ trợ hoàn tiền khi tranh chấp</div></div></div></aside></div></div></section>`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/views/CheckoutView.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const CheckoutView = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-0c973c60"]]);
const _sfc_main = {
  __name: "index.page",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(CheckoutView, _attrs, null, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("src/pages/checkout/index.page.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
