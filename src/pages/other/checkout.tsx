"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { connect } from "react-redux";
import { FaHome } from "react-icons/fa";
import { IoMdCash } from "react-icons/io";
import { toast } from "sonner";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker, MobileTimePicker } from "@mui/x-date-pickers";
import { LayoutTwo } from "../../components/Layout";
import { BreadcrumbOne } from "../../components/Breadcrumb";
import { useLocalization } from "../../context/LocalizationContext";
import { deleteAllFromCart } from "../../redux/slices/cartSlice";
import { getDiscountPrice } from "../../lib/product";
import { auth, database, ref, get, push, set } from "../api/register";
import { logActivity } from "../lib/logActivity";
import { useAppDispatch } from "../../redux/hooks";
import type { RootState, CartItem, Coupon } from "../../types";
import { enUS as enLocale, mk as mkLocale } from "date-fns/locale";

const RATE = 61.5;
const fmtDate = (d: Date) => `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;
const randOrderNum = (n = 8) => { const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; return Array.from({ length: n }, () => c[Math.floor(Math.random() * c.length)]).join(""); };

interface BillingInfo { firstName: string; lastName: string; email: string; phone: string; address1: string; city: string; zip: string; state: string; }

const Checkout = ({ cartItems }: { cartItems: CartItem[] }) => {
  const { t, currentLanguage } = useLocalization();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [reservationDT, setReservationDT] = useState(new Date());
  const [billing, setBilling] = useState<BillingInfo>({ firstName: "", lastName: "", email: "", phone: "", address1: "", city: "", zip: "", state: "" });

  const localeMap: Record<string, object> = { en: enLocale, mk: mkLocale };

  useEffect(() => { document.body.classList.remove("overflow-hidden"); }, []);
  useEffect(() => {
    try { const raw = sessionStorage.getItem("appliedCoupon"); if (raw) setAppliedCoupon(JSON.parse(raw)); } catch {}
  }, []);
  useEffect(() => {
    if (!auth.currentUser) return;
    get(ref(database, `users/${auth.currentUser.uid}`)).then((snap) => {
      if (!snap.exists()) return;
      const d = snap.val();
      setBilling({ firstName: d.firstName || "", lastName: d.lastName || "", email: d.email || "", phone: d.billingInfo?.phone || "", address1: d.billingInfo?.address || "", city: d.billingInfo?.city || "", zip: d.billingInfo?.zipCode || "", state: d.billingInfo?.country?.label || "" });
    }).catch(() => {});
  }, []);

  const subtotal = cartItems.reduce((acc, p) => {
    const price = Number(p.price[currentLanguage] ?? 0);
    return acc + getDiscountPrice(price, p.discount) * p.quantity;
  }, 0);
  const discountAmt = appliedCoupon ? subtotal * (appliedCoupon.discount / 100) : 0;
  const finalTotal = subtotal - discountAmt;
  const curr = (v: number) => currentLanguage === "mk" ? `${v.toFixed(2)} ${t("currency")}` : `${t("currency")} ${v.toFixed(2)}`;

  const validate = (): boolean => {
    const required: (keyof BillingInfo)[] = ["firstName","lastName","phone","address1","state","city","zip"];
    for (const k of required) {
      if (!billing[k].trim()) { toast.error(t(`${k}_required`)); return false; }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!auth.currentUser) { toast.error(t("please_log_in_to_place_order")); return; }
    if (!validate()) { router.push("/other/my-account"); return; }
    if (!paymentMethod) { toast.error(t("please_select_payment_method")); return; }
    if (!acceptedTerms) { toast.error(t("please_accept_terms")); return; }

    setPlacing(true);
    try {
      let subtotalEN = 0, subtotalMK = 0;
      cartItems.forEach((p) => {
        const qty = p.quantity;
        const enP = Number(p.price.en ?? 0), mkP = Number(p.price.mk ?? 0);
        subtotalEN += getDiscountPrice(enP, p.discount) * qty;
        subtotalMK += getDiscountPrice(mkP, p.discount) * qty;
      });
      const discEN = appliedCoupon ? subtotalEN * (appliedCoupon.discount / 100) : 0;
      const discMK = appliedCoupon ? subtotalMK * (appliedCoupon.discount / 100) : 0;

      const orderData = {
        coupon: appliedCoupon || null,
        createdAt: Date.now(),
        customer: { address: billing.address1, city: billing.city, email: billing.email || auth.currentUser.email, phone: billing.phone, postalCode: billing.zip, state: billing.state },
        date: fmtDate(new Date()),
        orderNumber: randOrderNum(8),
        paymentMethod, paymentText: t(paymentMethod),
        products: cartItems.map((p) => ({
          discount: p.discount || 0, id: p.id,
          name: { en: p.name.en, mk: p.name.mk },
          price: { en: Number(p.price.en ?? 0), mk: Number(p.price.mk ?? 0) },
          quantity: p.quantity,
        })),
        reservationDate: fmtDate(reservationDT),
        reservationTime: reservationDT.toTimeString().slice(0, 5),
        status: "pending",
        subtotal: { mk: +subtotalMK.toFixed(2), en: +subtotalEN.toFixed(2) },
        discount: { mk: +discMK.toFixed(2), en: +discEN.toFixed(2) },
        total: { mk: +(subtotalMK - discMK).toFixed(2), en: +(subtotalEN - discEN).toFixed(2) },
      };

      const newRef = push(ref(database, `orders/${auth.currentUser.uid}`));
      await set(newRef, orderData);
      await logActivity({ username: auth.currentUser.email ?? "", userId: auth.currentUser.uid, action: "ORDER_PLACED", details: `Нарачка #${orderData.orderNumber}` });

      const emailPayload = {
        to: auth.currentUser.email, from: "reservation@kikamakeupandbeautyacademy.com",
        userId: auth.currentUser.uid, orderID: orderData.orderNumber,
        reservationDate: orderData.reservationDate, reservationTime: orderData.reservationTime,
        customerName: `${billing.firstName} ${billing.lastName}`.trim() || auth.currentUser.email,
        customerEmail: auth.currentUser.email, paymentMethod, paymentText: t(paymentMethod),
        subtotal: currentLanguage === "mk" ? subtotalMK : subtotalEN,
        discount: currentLanguage === "mk" ? discMK : discEN,
        total: currentLanguage === "mk" ? subtotalMK - discMK : subtotalEN - discEN,
        currency: currentLanguage === "mk" ? "MKD" : "EUR",
        coupon: appliedCoupon?.code || null, products: orderData.products,
        customerPhone: billing.phone, customerAddress: billing.address1,
        customerState: billing.state, customerCity: billing.city, customerPostalCode: billing.zip,
        language: currentLanguage,
      };

      await Promise.allSettled([
        fetch("/api/sendReservation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(emailPayload) }),
        fetch("/api/send-reservation", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...emailPayload, to: ["grigorkalajdziev@gmail.com","makeupbykika@hotmail.com"] }) }),
      ]);

      dispatch(deleteAllFromCart());
      try { sessionStorage.removeItem("appliedCoupon"); } catch {}
      toast.success(t("order_placed_successfully"));
      router.push("/other/my-account");
    } catch (err) {
      toast.error((err as Error).message || "Error placing order");
    } finally { setPlacing(false); }
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-secondary">{label} *</label>
      {children}
    </div>
  );

  return (
    <LayoutTwo>
      <BreadcrumbOne pageTitle={t("checkout_title")} backgroundImage="/assets/images/backgrounds/breadcrumb-bg-1.webp">
        <ul className="breadcrumb__list justify-center">
          <li><Link href="/home/trending" aria-label={t("home")}><FaHome size={16} /></Link></li>
          <li>{t("checkout_title")}</li>
        </ul>
      </BreadcrumbOne>

      <div className="py-20">
        <div className="container-wide">
          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_420px]">
              {/* Left – billing + reservation */}
              <div className="space-y-10">
                <div>
                  <h4 className="checkout-title">{t("billing_address")}</h4>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field label={t("first_name_label")}><input type="text" value={billing.firstName} onChange={(e) => setBilling((b) => ({ ...b, firstName: e.target.value }))} /></Field>
                    <Field label={t("last_name_label")} ><input type="text" value={billing.lastName}  onChange={(e) => setBilling((b) => ({ ...b, lastName:  e.target.value }))} /></Field>
                    <Field label={t("email_label")}     ><input type="email" value={billing.email}   disabled className="opacity-60 cursor-not-allowed" /></Field>
                    <Field label={t("phone_label")}     ><input type="text" value={billing.phone}    onChange={(e) => setBilling((b) => ({ ...b, phone:    e.target.value }))} /></Field>
                    <Field label={t("address_label")}   ><input type="text" value={billing.address1} onChange={(e) => setBilling((b) => ({ ...b, address1: e.target.value }))} /></Field>
                    <Field label={t("state_label")}     ><input type="text" value={billing.state}    onChange={(e) => setBilling((b) => ({ ...b, state:    e.target.value }))} /></Field>
                    <Field label={t("city_label")}      ><input type="text" value={billing.city}     onChange={(e) => setBilling((b) => ({ ...b, city:     e.target.value }))} /></Field>
                    <Field label={t("zip_label")}       ><input type="text" value={billing.zip}      onChange={(e) => setBilling((b) => ({ ...b, zip:      e.target.value }))} /></Field>
                  </div>
                </div>

                <div>
                  <h4 className="checkout-title">{t("reservation_datetime_title")}</h4>
                  <p className="mb-5 text-xs text-muted">{t("reservation_datetime_description")}</p>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={(localeMap[currentLanguage] ?? enLocale) as Parameters<typeof LocalizationProvider>[0]["adapterLocale"]}>
                      <DatePicker
                        label={t("reservation_date_label")}
                        value={reservationDT}
                        format="dd-MM-yyyy"
                        minDate={new Date()}
                        onChange={(d) => { if (!d) return; setReservationDT((prev) => { const n = new Date(d); n.setHours(prev.getHours(), prev.getMinutes()); return n; }); }}
                        slotProps={{ textField: { fullWidth: true, inputProps: { readOnly: true } } }}
                      />
                    </LocalizationProvider>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={(localeMap[currentLanguage] ?? enLocale) as Parameters<typeof LocalizationProvider>[0]["adapterLocale"]}>
                      <MobileTimePicker
                        label={t("reservation_time_label")}
                        value={reservationDT}
                        onChange={(d) => { if (!d) return; setReservationDT((prev) => { const n = new Date(prev); n.setHours(d.getHours(), d.getMinutes()); return n; }); }}
                        slotProps={{ textField: { fullWidth: true, inputProps: { readOnly: true } } }}
                      />
                    </LocalizationProvider>
                  </div>
                </div>
              </div>

              {/* Right – totals + payment */}
              <div className="space-y-8">
                <div>
                  <h4 className="checkout-title">{t("cart_total")}</h4>
                  <div className="checkout-cart-total">
                    <h4>{t("product_label")} <span>{t("total_label")}</span></h4>
                    <ul>
                      {cartItems.map((p, i) => {
                        const price = Number(p.price[currentLanguage] ?? 0);
                        const disc  = getDiscountPrice(price, p.discount);
                        return (
                          <li key={i}>
                            {(p.name[currentLanguage] ?? p.name.en)} × {p.quantity}
                            <span>{curr(disc * p.quantity)}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <p>{t("subtotal_label")} <span>{curr(subtotal)}</span></p>
                    {appliedCoupon && <p>{t("coupon_discount")} <span>-{curr(discountAmt)}</span></p>}
                    <h4>{t("grand_total_label")} <span>{curr(finalTotal)}</span></h4>
                  </div>
                </div>

                <div>
                  <h4 className="checkout-title">{t("payment_method")}</h4>
                  <div className="checkout-payment-method">
                    {["payment_bank","payment_cash"].map((pm) => (
                      <div key={pm} className="single-method">
                        <input type="radio" id={pm} name="payment" value={pm} onChange={() => setPaymentMethod(pm)} />
                        <label htmlFor={pm}>{t(pm)}</label>
                      </div>
                    ))}
                    <div className="single-method">
                      <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
                      <label htmlFor="terms">{t("accept_terms_label")}</label>
                    </div>
                  </div>

                  <button onClick={handlePlaceOrder} disabled={placing}
                    className="lezada-button lezada-button--medium mt-6 w-full justify-center">
                    {placing ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : t("place_order")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="item-empty-area text-center">
              <IoMdCash className="mx-auto mb-6 text-7xl text-border" />
              <p className="mb-8 text-muted">{t("cart_empty_message")}</p>
              <Link href="/shop/left-sidebar" className="lezada-button lezada-button--medium inline-block">{t("shop_now")}</Link>
            </div>
          )}
        </div>
      </div>
    </LayoutTwo>
  );
};

const mapStateToProps = (s: RootState) => ({ cartItems: s.cartData });
export default connect(mapStateToProps)(Checkout);
