import { Fragment } from "react";
import Link from "next/link";
import { connect } from "react-redux";
import { toast } from "sonner";
import { IoIosShuffle, IoIosTrash } from "react-icons/io";
import { LayoutTwo } from "../../components/Layout";
import { BreadcrumbOne } from "../../components/Breadcrumb";
import { deleteFromCompare } from "../../redux/slices/compareSlice";
import { addToCart } from "../../redux/slices/cartSlice";
import { ProductRating } from "../../components/Product";
import { getDiscountPrice } from "../../lib/product";
import { useLocalization } from "../../context/LocalizationContext";
import { FaHome } from "react-icons/fa";
import { useAppDispatch } from "../../redux/hooks";
import type { RootState, Product, CartItem } from "../../types";

const Compare = ({ cartItems, compareItems }: { cartItems: CartItem[]; compareItems: Product[] }) => {
  const { t, currentLanguage } = useLocalization();
  const dispatch = useAppDispatch();

  return (
    <LayoutTwo>
      <BreadcrumbOne pageTitle={t("compare_page_title")} backgroundImage="/assets/images/backgrounds/breadcrumb-bg-1.webp">
        <ul className="breadcrumb__list justify-center"><li><Link href="/home/trending" aria-label={t("home")}><FaHome size={16} /></Link></li><li>{t("compare")}</li></ul>
      </BreadcrumbOne>

      <div className="py-20">
        <div className="container-wide">
          {compareItems.length > 0 ? (
            <div className="overflow-x-auto compare-table">
              <table className="w-full">
                <tbody>
                  <tr>
                    <th className="title-column">{t("product_info")}</th>
                    {compareItems.map((product, i) => {
                      const inCart = cartItems.some((c) => c.id === product.id);
                      return (
                        <td key={i} className="product-image-title text-center">
                          <button onClick={() => { dispatch(deleteFromCompare(product)); toast.error(t("removed_from_compare")); }} className="mb-2 text-muted hover:text-secondary"><IoIosTrash /></button>
                          <Link href={`/shop/product-basic/${product.slug}`} className="block">
                            <img src={product.thumbImage?.[0] ?? ""} className="mx-auto h-32 w-24 object-cover" alt="" />
                          </Link>
                          <Link href={`/shop/product-basic/${product.slug}`} className="mt-2 block text-sm font-medium text-secondary hover:text-primary">
                            {product.name[currentLanguage] ?? product.name.en}
                          </Link>
                          <div className="mt-2">
                            {product.variation?.length ? (
                              <Link href={`/shop/product-basic/${product.slug}`} className="lezada-button lezada-button--small">{t("select_option")}</Link>
                            ) : product.stock && product.stock > 0 ? (
                              <button onClick={() => { dispatch(addToCart({ ...product, quantity: 1 })); toast.success(t("added_to_cart")); }} disabled={inCart}
                                className={`lezada-button lezada-button--small ${inCart ? "opacity-50 cursor-not-allowed" : ""}`}>
                                {inCart ? t("added") : t("add_to_cart")}
                              </button>
                            ) : <button disabled className="lezada-button lezada-button--small opacity-50">{t("out_of_stock")}</button>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <th className="title-column">{t("price")}</th>
                    {compareItems.map((product, i) => {
                      const price = Number(product.price[currentLanguage] ?? 0);
                      const disc = getDiscountPrice(price, product.discount).toFixed(2);
                      return (
                        <td key={i} className="product-price text-center">
                          {product.discount && product.discount > 0 ? (
                            <Fragment>
                              <span className="block text-xs text-muted line-through">{currentLanguage === "mk" ? `${price} ${t("currency")}` : `${t("currency")} ${price}`}</span>
                              <span className="block text-sm font-semibold text-secondary">{currentLanguage === "mk" ? `${disc} ${t("currency")}` : `${t("currency")} ${disc}`}</span>
                            </Fragment>
                          ) : <span className="text-sm font-semibold text-secondary">{currentLanguage === "mk" ? `${price} ${t("currency")}` : `${t("currency")} ${price}`}</span>}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <th className="title-column">{t("description")}</th>
                    {compareItems.map((p, i) => <td key={i} className="product-desc text-center text-sm text-muted">{p.shortDescription?.[currentLanguage] ?? t("not_available")}</td>)}
                  </tr>
                  <tr>
                    <th className="title-column">{t("rating")}</th>
                    {compareItems.map((p, i) => <td key={i} className="product-rating text-center"><div className="flex justify-center rating-star"><ProductRating ratingValue={p.rating} /></div></td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="item-empty-area text-center">
              <div className="item-empty-area__icon"><IoIosShuffle /></div>
              <div className="item-empty-area__text">
                <p className="mt-4 text-muted">{t("no_items_to_compare")}</p>
                <Link href="/shop/left-sidebar" className="lezada-button lezada-button--medium mt-6 inline-block">{t("add_items")}</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutTwo>
  );
};
const mapStateToProps = (s: RootState) => ({ cartItems: s.cartData, compareItems: s.compareData });
export default connect(mapStateToProps)(Compare);
