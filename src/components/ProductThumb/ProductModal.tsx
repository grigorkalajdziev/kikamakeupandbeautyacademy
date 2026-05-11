import { useState, useEffect, Fragment } from "react";
import { IoIosHeartEmpty, IoIosShuffle, IoIosClose } from "react-icons/io";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { getProductCartQuantity } from "../../lib/product";
import ProductRating from "../Product/ProductRating";
import { useLocalization } from "../../context/LocalizationContext";
import { database, ref, get, auth } from "../../pages/api/register";
import { onAuthStateChanged } from "firebase/auth";
import type { Product, CartItem } from "../../types";

interface Props {
  show: boolean; onHide: () => void; product: Product;
  discountedprice: string; productprice: string;
  cartitems: CartItem[]; cartitem?: CartItem; wishlistitem?: Product; compareitem?: Product;
  addtocart: (p: Product, t: unknown, qty: number, color?: string|null, size?: string|null) => void;
  addtowishlist: () => void; deletefromwishlist: () => void;
  addtocompare: () => void; deletefromcompare: () => void;
  addtoast: unknown;
}

const ProductModal = ({ show, onHide, product, discountedprice, productprice, cartitems, wishlistitem, compareitem, addtocart, addtowishlist, deletefromwishlist, addtocompare, deletefromcompare, addtoast }: Props) => {
  const { t, currentLanguage } = useLocalization();
  const [qty, setQty] = useState(1);
  const [color] = useState(product.variation?.[0]?.color ?? "");
  const [size]  = useState(product.variation?.[0]?.size?.[0]?.name ?? "");
  const [stock] = useState(product.variation?.[0]?.size?.[0]?.stock ?? product.stock ?? 0);
  const [avgRating, setAvgRating] = useState(0);

  const cartQty = getProductCartQuantity(cartitems, product, color, size);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { setAvgRating(0); return; }
      get(ref(database, `productReviews/${product.id}/reviews`)).then((snap) => {
        if (!snap.exists()) { setAvgRating(0); return; }
        const data = snap.val() as Record<string, { rating: number }>;
        const keys = Object.keys(data);
        setAvgRating(keys.reduce((a, k) => a + data[k].rating, 0) / keys.length);
      }).catch(() => setAvgRating(0));
    });
    return () => unsub();
  }, [product.id]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onHide} />
      <div className="relative z-10 grid w-full max-w-2xl grid-cols-1 gap-6 overflow-y-auto bg-white p-6 shadow-2xl max-h-[90vh] md:grid-cols-2">
        <button className="absolute right-4 top-4 text-2xl text-muted hover:text-secondary" onClick={onHide} aria-label="Close"><IoIosClose /></button>

        {/* Images */}
        <div>
          <Swiper modules={[Pagination]} pagination={{ clickable: true }}>
            {(product.image ?? product.thumbImage ?? []).map((src, i) => (
              <SwiperSlide key={i}><img src={src} className="w-full object-cover" alt="" /></SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Content */}
        <div className="overflow-y-auto scrollbar-hide">
          <h2 className="mb-3 font-baskerville text-xl text-secondary">{product.name[currentLanguage] ?? product.name.en}</h2>
          <div className="mb-3 flex items-center gap-2">
            {product.discount && product.discount > 0 ? (
              <Fragment>
                <span className="text-sm text-muted line-through">{currentLanguage === "mk" ? `${productprice} ${t("currency")}` : `${t("currency")} ${productprice}`}</span>
                <span className="text-lg font-semibold text-secondary">{currentLanguage === "mk" ? `${discountedprice} ${t("currency")}` : `${t("currency")} ${discountedprice}`}</span>
              </Fragment>
            ) : <span className="text-lg font-semibold text-secondary">{currentLanguage === "mk" ? `${productprice} ${t("currency")}` : `${t("currency")} ${productprice}`}</span>}
          </div>
          {avgRating > 0 && <div className="flex rating-star mb-3"><ProductRating ratingValue={avgRating} /></div>}
          {product.shortDescription && <p className="mb-4 text-sm text-muted">{product.shortDescription[currentLanguage]}</p>}

          {product.affiliateLink ? (
            <a href={product.affiliateLink} target="_blank" rel="noreferrer" className="lezada-button lezada-button--medium">{t("buy_now")}</a>
          ) : (
            <Fragment>
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary">{t("quantity")}</p>
                <div className="cart-plus-minus">
                  <button className="qtybutton" onClick={() => setQty(q => q > 1 ? q - 1 : 1)}>-</button>
                  <input className="cart-plus-minus-box" type="text" value={qty} readOnly />
                  <button className="qtybutton" onClick={() => setQty(q => q < stock - cartQty ? q + 1 : q)}>+</button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {stock > 0 ? (
                  <button onClick={() => addtocart(product, addtoast, qty, color, size)} disabled={cartQty >= stock} className="lezada-button lezada-button--medium">
                    {t("add_to_cart")}
                  </button>
                ) : (
                  <button disabled className="lezada-button lezada-button--medium opacity-50">{t("out_of_stock")}</button>
                )}
                <button title={wishlistitem ? t("added_to_wishlist") : t("add_to_wishlist")}
                  onClick={wishlistitem ? deletefromwishlist : addtowishlist}
                  className={`flex h-9 w-9 items-center justify-center border border-border text-secondary hover:bg-secondary hover:text-white transition-colors ${wishlistitem ? "bg-secondary text-white" : ""}`}>
                  <IoIosHeartEmpty />
                </button>
                <button title={compareitem ? t("added_to_compare") : t("add_to_compare")}
                  onClick={compareitem ? deletefromcompare : addtocompare}
                  className={`flex h-9 w-9 items-center justify-center border border-border text-secondary hover:bg-secondary hover:text-white transition-colors ${compareitem ? "bg-secondary text-white" : ""}`}>
                  <IoIosShuffle />
                </button>
              </div>
            </Fragment>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductModal;
