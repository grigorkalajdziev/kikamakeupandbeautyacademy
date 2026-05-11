import { useState, useEffect, Fragment } from "react";
import { IoIosHeartEmpty, IoIosShuffle } from "react-icons/io";
import { FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";
import ProductRating from "../Product/ProductRating";
import { getProductCartQuantity } from "../../lib/product";
import { useLocalization } from "../../context/LocalizationContext";
import { database, ref, get, auth } from "../../pages/api/register";
import { onAuthStateChanged } from "firebase/auth";
import type { Product, CartItem } from "../../types";

interface Props {
  product: Product;
  productPrice: string;
  discountedPrice: string;
  cartItems: CartItem[];
  cartItem?: CartItem;
  wishlistItem?: Product;
  compareItem?: Product;
  addToast: unknown;
  addToCart: (p: Product, t: unknown, qty: number, color?: string | null, size?: string | null) => void;
  addToWishlist: () => void;
  deleteFromWishlist: () => void;
  addToCompare: () => void;
  deleteFromCompare: () => void;
}

const ProductDescription = ({
  product, productPrice, discountedPrice, cartItems,
  wishlistItem, compareItem, addToast,
  addToCart, addToWishlist, deleteFromWishlist, addToCompare, deleteFromCompare,
}: Props) => {
  const { t, currentLanguage } = useLocalization();
  const [color] = useState(product.variation?.[0]?.color ?? "");
  const [size]  = useState(product.variation?.[0]?.size?.[0]?.name ?? "");
  const [stock] = useState(product.variation?.[0]?.size?.[0]?.stock ?? product.stock ?? 0);
  const [qty, setQty] = useState(1);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const cartQty = getProductCartQuantity(cartItems, product, color, size);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kikamakeupandbeautyacademy.com";
  const productUrl = `${siteUrl}/shop/product-basic/${product.slug}`;
  const name = product.name[currentLanguage] ?? product.name.en;
  const price = (v: string) => currentLanguage === "mk" ? `${v} ${t("currency")}` : `${t("currency")} ${v}`;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { setAvgRating(0); setReviewCount(0); return; }
      get(ref(database, `productReviews/${product.id}/reviews`)).then((snap) => {
        if (!snap.exists()) { setAvgRating(0); setReviewCount(0); return; }
        const data = snap.val() as Record<string, { rating: number }>;
        const keys = Object.keys(data);
        setAvgRating(keys.reduce((a, k) => a + data[k].rating, 0) / keys.length);
        setReviewCount(keys.length);
      }).catch(() => { setAvgRating(0); setReviewCount(0); });
    });
    return () => unsub();
  }, [product.id]);

  return (
    <div className="product-content space-y-5">
      {avgRating > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex rating-star text-base"><ProductRating ratingValue={avgRating} /></div>
          <span className="text-xs text-muted">({reviewCount} {t("customer_reviews")})</span>
        </div>
      )}

      <h2 className="font-baskerville text-2xl font-normal text-secondary">{name}</h2>

      <div className="flex items-center gap-3">
        {product.discount && product.discount > 0 ? (
          <Fragment>
            <span className="text-sm text-muted line-through">{price(productPrice)}</span>
            <span className="text-xl font-semibold text-secondary">{price(discountedPrice)}</span>
          </Fragment>
        ) : <span className="text-xl font-semibold text-secondary">{price(productPrice)}</span>}
      </div>

      {product.shortDescription && <p className="text-sm text-muted leading-relaxed">{product.shortDescription[currentLanguage]}</p>}

      {product.affiliateLink ? (
        <a href={product.affiliateLink} target="_blank" rel="noreferrer" className="lezada-button lezada-button--medium inline-flex">{t("buy_now")}</a>
      ) : (
        <Fragment>
          {/* Qty */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary">{t("quantity")}</p>
            <div className="cart-plus-minus">
              <button className="qtybutton" onClick={() => setQty(q => q > 1 ? q - 1 : 1)}>-</button>
              <input className="cart-plus-minus-box" type="text" value={qty} readOnly />
              <button className="qtybutton" onClick={() => setQty(q => q < stock - cartQty ? q + 1 : q)}>+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {stock > 0 ? (
              <button
                onClick={() => addToCart(product, addToast, qty, color, size)}
                disabled={cartQty >= stock}
                className="lezada-button lezada-button--medium"
              >
                {t("add_to_cart")}
              </button>
            ) : (
              <button disabled className="lezada-button lezada-button--medium opacity-50">{t("out_of_stock")}</button>
            )}

            <button
              title={wishlistItem ? t("added_to_wishlist") : t("add_to_wishlist")}
              onClick={wishlistItem ? deleteFromWishlist : addToWishlist}
              className={`flex h-10 w-10 items-center justify-center border border-border transition-colors hover:bg-secondary hover:text-white ${wishlistItem ? "bg-secondary text-white" : "text-secondary"}`}
            >
              <IoIosHeartEmpty />
            </button>

            <button
              title={compareItem ? t("added_to_compare") : t("add_to_compare")}
              onClick={compareItem ? deleteFromCompare : addToCompare}
              className={`flex h-10 w-10 items-center justify-center border border-border transition-colors hover:bg-secondary hover:text-white ${compareItem ? "bg-secondary text-white" : "text-secondary"}`}
            >
              <IoIosShuffle />
            </button>
          </div>

          {/* Meta table */}
          <table className="mt-6 w-full text-xs">
            <tbody className="divide-y divide-border">
              {product.category && (
                <tr>
                  <td className="py-2 pr-4 font-semibold uppercase tracking-wider text-secondary w-24">{t("categories")}</td>
                  <td className="py-2 text-muted">{product.category.map((c, i, arr) => (
                    <Link key={c} href="/shop/left-sidebar" className="hover:text-secondary">{c}{i !== arr.length - 1 ? ", " : ""}</Link>
                  ))}</td>
                </tr>
              )}
              {product.tag && (
                <tr>
                  <td className="py-2 pr-4 font-semibold uppercase tracking-wider text-secondary">{t("tags")}</td>
                  <td className="py-2 text-muted">{product.tag.map((tag, i, arr) => (
                    <Link key={tag} href="/shop/left-sidebar" className="hover:text-secondary">{tag}{i !== arr.length - 1 ? ", " : ""}</Link>
                  ))}</td>
                </tr>
              )}
              <tr>
                <td className="py-2 pr-4 font-semibold uppercase tracking-wider text-secondary">{t("share")}</td>
                <td className="py-2">
                  <div className="flex gap-3 text-muted">
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(name)}&url=${encodeURIComponent(productUrl)}`} target="_blank" rel="noreferrer" title={t("share_on_twitter")} className="hover:text-secondary"><FaXTwitter /></a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`} target="_blank" rel="noreferrer" title={t("share_on_facebook")} className="hover:text-secondary"><FaFacebookF /></a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </Fragment>
      )}
    </div>
  );
};

export default ProductDescription;
