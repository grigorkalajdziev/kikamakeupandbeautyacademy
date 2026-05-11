import Link from "next/link";
import { IoIosClose } from "react-icons/io";
import { connect } from "react-redux";
import { toast } from "sonner";
import { getDiscountPrice } from "../../../lib/product";
import { deleteFromWishlist } from "../../../redux/slices/wishlistSlice";
import { useLocalization } from "../../../context/LocalizationContext";
import { useAppDispatch } from "../../../redux/hooks";
import type { RootState, Product } from "../../../types";

interface Props {
  activeStatus: boolean;
  getActiveStatus: (v: boolean) => void;
  wishlistItems: Product[];
}

const closeOverlay = (fn: (v: boolean) => void) => {
  fn(false);
  document.body.classList.remove("overflow-hidden");
};

const WishlistOverlay = ({ activeStatus, getActiveStatus, wishlistItems }: Props) => {
  const { t, currentLanguage } = useLocalization();
  const dispatch = useAppDispatch();

  return (
    <div className={`wishlist-overlay ${activeStatus ? "active" : ""}`}>
      <div className="wishlist-overlay__close" onClick={() => closeOverlay(getActiveStatus)} />
      <div className="wishlist-overlay__content">
        <button className="absolute right-4 top-4 z-10 text-2xl text-muted hover:text-secondary"
          onClick={() => closeOverlay(getActiveStatus)} aria-label="Close"><IoIosClose /></button>

        <div className="flex h-full flex-col p-6 pt-12">
          <h3 className="wishlist-title">{t("wishlist_title")}</h3>

          {wishlistItems.length > 0 ? (
            <>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {wishlistItems.map((product, i) => {
                  const price = Number(product.price[currentLanguage] ?? 0);
                  const disc = getDiscountPrice(price, product.discount).toFixed(2);
                  return (
                    <div className="single-wishlist-product" key={i}>
                      <span className="wishlist-close-icon">
                        <button onClick={() => {
                          dispatch(deleteFromWishlist(product));
                          toast.error(t("removed_from_wishlist"));
                        }}><IoIosClose /></button>
                      </span>
                      <div className="image">
                        <Link href={`/shop/product-basic/${product.slug}`}>
                          <img src={product.thumbImage?.[0] ?? ""} className="h-20 w-16 object-cover" alt="" />
                        </Link>
                      </div>
                      <div className="content">
                        <h5>
                          <Link href={`/shop/product-basic/${product.slug}`}>
                            {product.name[currentLanguage] ?? product.name.en}
                          </Link>
                        </h5>
                        <p className="mt-1 text-xs font-medium text-secondary">
                          {currentLanguage === "mk" ? `${disc} ${t("currency")}` : `${t("currency")} ${disc}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 wishlist-buttons">
                <Link href="/other/wishlist" onClick={() => closeOverlay(getActiveStatus)}>{t("view_wishlist")}</Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">{t("no_items_in_wishlist")}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({ wishlistItems: state.wishlistData });
export default connect(mapStateToProps)(WishlistOverlay);
