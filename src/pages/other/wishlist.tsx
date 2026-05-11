import { useEffect } from "react";
import Link from "next/link";
import { connect } from "react-redux";
import { toast } from "sonner";
import { addToCart } from "../../redux/slices/cartSlice";
import { deleteFromWishlist, deleteAllFromWishlist } from "../../redux/slices/wishlistSlice";
import { getDiscountPrice } from "../../lib/product";
import { LayoutTwo } from "../../components/Layout";
import { BreadcrumbOne } from "../../components/Breadcrumb";
import { FaHome } from "react-icons/fa";
import { IoIosClose, IoIosHeartEmpty } from "react-icons/io";
import { useLocalization } from "../../context/LocalizationContext";
import { useAppDispatch } from "../../redux/hooks";
import type { RootState, Product, CartItem } from "../../types";

interface Props { wishlistItems: Product[]; cartItems: CartItem[]; }

const Wishlist = ({ wishlistItems, cartItems }: Props) => {
  const { t, currentLanguage } = useLocalization();
  const dispatch = useAppDispatch();

  useEffect(() => { document.body.classList.remove("overflow-hidden"); });

  return (
    <LayoutTwo>
      <BreadcrumbOne pageTitle={t("wishlist_title")} backgroundImage="/assets/images/backgrounds/breadcrumb-bg-2.webp">
        <ul className="breadcrumb__list justify-center"><li><Link href="/home/trending" aria-label={t("home")}><FaHome size={16} /></Link></li><li>{t("wishlist_title")}</li></ul>
      </BreadcrumbOne>

      <div className="py-20">
        <div className="container-wide">
          {wishlistItems.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="cart-table w-full">
                  <thead><tr>
                    <th className="product-name" colSpan={2}>{t("product")}</th>
                    <th className="product-price">{t("price")}</th>
                    <th>&nbsp;</th>
                    <th className="product-remove">&nbsp;</th>
                  </tr></thead>
                  <tbody>
                    {wishlistItems.map((product, i) => {
                      const price = Number(product.price[currentLanguage] ?? 0);
                      const disc = getDiscountPrice(price, product.discount).toFixed(2);
                      const inCart = cartItems.some((c) => c.id === product.id);
                      return (
                        <tr key={i}>
                          <td className="product-thumbnail w-20">
                            <Link href={`/shop/product-basic/${product.slug}`}>
                              <img src={product.thumbImage?.[0] ?? ""} className="h-20 w-16 object-cover" alt="" />
                            </Link>
                          </td>
                          <td className="product-name">
                            <Link href={`/shop/product-basic/${product.slug}`}>{product.name[currentLanguage] ?? product.name.en}</Link>
                          </td>
                          <td className="product-price">
                            <span className="price">{currentLanguage === "mk" ? `${disc} ${t("currency")}` : `${t("currency")} ${disc}`}</span>
                          </td>
                          <td>
                            {product.variation?.length ? (
                              <Link href={`/shop/product-basic/${product.slug}`} className="lezada-button lezada-button--small">{t("select_option")}</Link>
                            ) : product.stock && product.stock > 0 ? (
                              <button onClick={() => { dispatch(addToCart({ ...product, quantity: 1 })); toast.success(t("added_to_cart")); }} disabled={inCart}
                                className={`lezada-button lezada-button--small ${inCart ? "opacity-50 cursor-not-allowed" : ""}`}>
                                {inCart ? t("added") : t("add_to_cart")}
                              </button>
                            ) : <button disabled className="lezada-button lezada-button--small opacity-50">{t("out_of_stock")}</button>}
                          </td>
                          <td className="product-remove">
                            <button onClick={() => { dispatch(deleteFromWishlist(product)); toast.error(t("removed_from_wishlist")); }}><IoIosClose /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-8 flex justify-end">
                <button className="lezada-button lezada-button--medium" onClick={() => { dispatch(deleteAllFromWishlist()); toast.error(t("removed_all_from_wishlist")); }}>
                  {t("clear_wishlist")}
                </button>
              </div>
            </>
          ) : (
            <div className="item-empty-area text-center">
              <div className="item-empty-area__icon"><IoIosHeartEmpty /></div>
              <div className="item-empty-area__text">
                <p className="mt-4 text-muted">{t("no_items_found")}</p>
                <Link href="/shop/left-sidebar" className="lezada-button lezada-button--medium mt-6 inline-block">{t("shop_now")}</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutTwo>
  );
};
const mapStateToProps = (s: RootState) => ({ wishlistItems: s.wishlistData, cartItems: s.cartData });
export default connect(mapStateToProps)(Wishlist);
