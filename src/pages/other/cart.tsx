import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { connect } from "react-redux";
import { FaHome } from "react-icons/fa";
import { IoIosClose, IoMdCart } from "react-icons/io";
import { toast } from "sonner";
import { LayoutTwo } from "../../components/Layout";
import { BreadcrumbOne } from "../../components/Breadcrumb";
import { useLocalization } from "../../context/LocalizationContext";
import { addToCart, decreaseQuantity, deleteFromCart, deleteAllFromCart } from "../../redux/slices/cartSlice";
import { getDiscountPrice } from "../../lib/product";
import { auth, database, ref, get } from "../api/register";
import { useAppDispatch } from "../../redux/hooks";
import type { RootState, CartItem, Coupon } from "../../types";

interface Props { cartItems: CartItem[]; }

const Cart = ({ cartItems }: Props) => {
  const { t, currentLanguage } = useLocalization();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [userCoupon, setUserCoupon] = useState<Coupon | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponInput, setCouponInput] = useState("");

  useEffect(() => { document.body.classList.remove("overflow-hidden"); }, []);

  // Load coupon from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("appliedCoupon");
      if (raw) setAppliedCoupon(JSON.parse(raw) as Coupon);
    } catch {}
  }, []);

  // Fetch user coupon from Firebase
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    get(ref(database, `users/${user.uid}`)).then((snap) => {
      if (snap.exists() && snap.val().coupon) {
        const c: Coupon = { code: snap.val().coupon as string, discount: 5 };
        setUserCoupon(c);
        setCouponInput(c.code);
      }
    }).catch(() => {});
  }, []);

  const subtotal = cartItems.reduce((acc, p) => {
    const price = Number(p.price[currentLanguage] ?? 0);
    return acc + getDiscountPrice(price, p.discount) * p.quantity;
  }, 0);

  const discountAmount = appliedCoupon ? subtotal * (appliedCoupon.discount / 100) : 0;
  const finalTotal = subtotal - discountAmount;
  const fmt = (v: number) => v.toFixed(2);
  const curr = (v: string) => currentLanguage === "mk" ? `${v} ${t("currency")}` : `${t("currency")} ${v}`;

  const handleApplyCoupon = (e?: React.FormEvent) => {
    e?.preventDefault();
    const minTotal = currentLanguage === "mk" ? 2999 : 48.67;
    if (subtotal < minTotal) { toast.error(t("coupon_min_total")); return; }
    if (!couponInput.trim()) { toast.error(t("invalid_coupon")); return; }
    if (userCoupon && couponInput.trim().toLowerCase() === userCoupon.code.toLowerCase()) {
      setAppliedCoupon(userCoupon);
      try { sessionStorage.setItem("appliedCoupon", JSON.stringify(userCoupon)); } catch {}
      toast.success(`${t("coupon_applied")}: ${userCoupon.discount}% off`);
    } else {
      toast.error(t("invalid_coupon"));
    }
  };

  return (
    <LayoutTwo>
      <BreadcrumbOne pageTitle={t("cart_title")} backgroundImage="/assets/images/backgrounds/breadcrumb-bg-2.webp">
        <ul className="breadcrumb__list justify-center">
          <li><Link href="/home/trending" aria-label={t("home")}><FaHome size={16} /></Link></li>
          <li>{t("cart")}</li>
        </ul>
      </BreadcrumbOne>

      <div className="py-20">
        <div className="container-wide">
          {cartItems.length > 0 ? (
            <div className="space-y-12">
              {/* Cart table */}
              <div className="overflow-x-auto">
                <table className="cart-table w-full">
                  <thead>
                    <tr>
                      <th colSpan={2}>{t("product")}</th>
                      <th>{t("price")}</th>
                      <th>{t("quantity")}</th>
                      <th>{t("total")}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((product, i) => {
                      const price = Number(product.price[currentLanguage] ?? 0);
                      const disc = getDiscountPrice(price, product.discount);
                      const lineTotal = disc * product.quantity;
                      const thumb = product.thumbImage?.[0] ?? "";

                      return (
                        <tr key={i}>
                          <td className="w-20">
                            <Link href={`/shop/product-basic/${product.slug}`}>
                              <img src={thumb} className="h-20 w-16 object-cover" alt="" />
                            </Link>
                          </td>
                          <td>
                            <Link href={`/shop/product-basic/${product.slug}`} className="text-sm font-medium text-secondary hover:text-primary">
                              {product.name[currentLanguage] ?? product.name.en}
                            </Link>
                            {product.selectedProductColor && <p className="text-xs text-muted">{t("color")}: {product.selectedProductColor}</p>}
                            {product.selectedProductSize  && <p className="text-xs text-muted">{t("size")}: {product.selectedProductSize}</p>}
                          </td>
                          <td className="text-sm">{curr(fmt(disc))}</td>
                          <td>
                            <div className="cart-plus-minus">
                              <button className="qtybutton" onClick={() => dispatch(decreaseQuantity(product))}>-</button>
                              <input className="cart-plus-minus-box" type="text" value={product.quantity} readOnly />
                              <button className="qtybutton" onClick={() => dispatch(addToCart({ ...product, quantity: 1 }))}>+</button>
                            </div>
                          </td>
                          <td className="text-sm font-medium">{curr(fmt(lineTotal))}</td>
                          <td>
                            <button onClick={() => dispatch(deleteFromCart(product))} className="text-muted hover:text-secondary"><IoIosClose className="text-xl" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Coupon + clear */}
              <div className="flex flex-wrap items-end justify-between gap-6 border-y border-border py-6">
                <form onSubmit={handleApplyCoupon} className="flex gap-3">
                  <input type="text" placeholder={t("enter_coupon_code")} value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-56 border border-border px-4 py-2 text-sm outline-none focus:border-secondary" />
                  <button type="submit" className="lezada-button lezada-button--small">{t("apply_coupon")}</button>
                </form>
                <button className="lezada-button lezada-button--small"
                  onClick={() => { dispatch(deleteAllFromCart()); toast.error(t("removed_all_from_cart")); }}>
                  {t("clear_cart")}
                </button>
              </div>

              {/* Totals */}
              <div className="ml-auto max-w-sm space-y-4">
                <h2 className="font-baskerville text-xl font-normal text-secondary">{t("cart_totals")}</h2>
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-3 text-muted">{t("subtotal")}</td>
                      <td className="py-3 text-right font-medium text-secondary">{curr(fmt(subtotal))}</td>
                    </tr>
                    {appliedCoupon && (
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted">{t("coupon_discount")} ({appliedCoupon.discount}%)</td>
                        <td className="py-3 text-right text-primary">-{curr(fmt(discountAmount))}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-3 font-semibold uppercase tracking-wider text-secondary">{t("total")}</td>
                      <td className="py-3 text-right text-lg font-semibold text-secondary">{curr(fmt(finalTotal))}</td>
                    </tr>
                  </tbody>
                </table>
                <Link href="/other/checkout" className="lezada-button lezada-button--medium w-full justify-center">
                  {t("proceed_to_checkout")}
                </Link>
              </div>
            </div>
          ) : (
            <div className="item-empty-area text-center">
              <IoMdCart className="mx-auto mb-6 text-7xl text-border" />
              <p className="mb-8 text-muted">{t("no_items_in_cart")}</p>
              <Link href="/shop/left-sidebar" className="lezada-button lezada-button--medium inline-block">{t("shop_now")}</Link>
            </div>
          )}
        </div>
      </div>
    </LayoutTwo>
  );
};

const mapStateToProps = (s: RootState) => ({ cartItems: s.cartData });
export default connect(mapStateToProps)(Cart);
