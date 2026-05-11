import Link from "next/link";
import { IoIosClose } from "react-icons/io";
import { connect } from "react-redux";
import { toast } from "sonner";
import { getDiscountPrice } from "../../../lib/product";
import { deleteFromCart } from "../../../redux/slices/cartSlice";
import { useLocalization } from "../../../context/LocalizationContext";
import { useAppDispatch } from "../../../redux/hooks";
import type { RootState, CartItem } from "../../../types";

interface Props {
  activeStatus: boolean;
  getActiveStatus: (v: boolean) => void;
  cartItems: CartItem[];
}

const closeOverlay = (fn: (v: boolean) => void) => {
  fn(false);
  document.body.classList.remove("overflow-hidden");
};

const CartOverlay = ({ activeStatus, getActiveStatus, cartItems }: Props) => {
  const { t, currentLanguage } = useLocalization();
  const dispatch = useAppDispatch();

  let total = 0;

  return (
    <div className={`cart-overlay ${activeStatus ? "active" : ""}`}>
      <div className="cart-overlay__close" onClick={() => closeOverlay(getActiveStatus)} />
      <div className="cart-overlay__content">
        <button className="absolute right-4 top-4 z-10 text-2xl text-muted hover:text-secondary"
          onClick={() => closeOverlay(getActiveStatus)} aria-label="Close">
          <IoIosClose />
        </button>

        <div className="flex h-full flex-col p-6 pt-12">
          <h3 className="cart-title">{t("cart_title")}</h3>

          {cartItems.length > 0 ? (
            <>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {cartItems.map((product, i) => {
                  const price = Number(product.price[currentLanguage] ?? 0);
                  const disc = getDiscountPrice(price, product.discount);
                  total += disc * product.quantity;

                  return (
                    <div className="single-cart-product" key={i}>
                      <span className="cart-close-icon">
                        <button onClick={() => {
                          dispatch(deleteFromCart(product));
                          toast.error(t("removed_from_cart"));
                        }}><IoIosClose /></button>
                      </span>
                      <div className="image">
                        <Link href={`/shop/product-basic/${product.slug}`}>
                          <img src={(product.thumbImage?.[0] ?? "")} className="h-20 w-16 object-cover" alt="" />
                        </Link>
                      </div>
                      <div className="content">
                        <h5>
                          <Link href={`/shop/product-basic/${product.slug}`}>
                            {product.name[currentLanguage] ?? product.name.en}
                          </Link>
                        </h5>
                        {product.selectedProductColor && product.selectedProductSize && (
                          <div className="flex gap-2 text-xs text-muted">
                            <span>{t("color")}: {product.selectedProductColor}</span>
                            <span>{t("size")}: {product.selectedProductSize}</span>
                          </div>
                        )}
                        <p className="mt-1 text-xs">
                          <span className="text-muted">{product.quantity} × </span>
                          <span className="font-medium text-secondary">
                            {currentLanguage === "mk"
                              ? `${disc.toFixed(2)} ${t("currency")}`
                              : `${t("currency")} ${disc.toFixed(2)}`}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <p className="cart-subtotal">
                  <span>{t("subtotal")}</span>
                  <span>{currentLanguage === "mk" ? `${total.toFixed(2)} ${t("currency")}` : `${t("currency")} ${total.toFixed(2)}`}</span>
                </p>
                <div className="cart-buttons">
                  <Link href="/other/cart" onClick={() => closeOverlay(getActiveStatus)}>{t("view_cart")}</Link>
                  <Link href="/other/checkout" onClick={() => closeOverlay(getActiveStatus)}>{t("checkout")}</Link>
                </div>
                <p className="free-shipping-text">{t("free_shipping_text")}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">{t("no_items_found_in_cart")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({ cartItems: state.cartData });
export default connect(mapStateToProps)(CartOverlay);
