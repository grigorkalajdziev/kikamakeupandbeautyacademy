import { Fragment, useState } from "react";
import Link from "next/link";
import { IoIosHeartEmpty, IoIosShuffle, IoIosSearch } from "react-icons/io";
import ProductModal from "./ProductModal";
import { useLocalization } from "../../context/LocalizationContext";
import type { Product, CartItem } from "../../types";

interface Props {
  product: Product; discountedPrice: string; productPrice: string;
  cartItem?: CartItem; wishlistItem?: Product; compareItem?: Product;
  bottomSpace?: string; addToCart: (p: Product, t: unknown, qty: number, color?: string|null, size?: string|null) => void;
  addToWishlist: () => void; deleteFromWishlist: () => void;
  addToCompare: () => void; deleteFromCompare: () => void;
  addToast: unknown; cartItems: CartItem[];
}

const ProductGrid = ({ product, discountedPrice, productPrice, cartItem, wishlistItem, compareItem, bottomSpace, addToCart, addToWishlist, deleteFromWishlist, addToCompare, deleteFromCompare, addToast, cartItems }: Props) => {
  const [modalShow, setModalShow] = useState(false);
  const { t, currentLanguage } = useLocalization();
  const name = product.name[currentLanguage] ?? product.name.en;
  const price = (v: string) => currentLanguage === "mk" ? `${v} ${t("currency")}` : `${t("currency")} ${v}`;

  return (
    <Fragment>
      <div className={`product-grid ${bottomSpace ?? ""}`}>
        <div className="product-grid__image">
          <Link href={`/shop/product-basic/${product.slug}`} className="image-wrap block overflow-hidden">
            <img src={product.thumbImage?.[0] ?? ""} className="w-full object-cover transition-transform duration-500 hover:scale-105" alt={name} />
            {(product.thumbImage?.length ?? 0) > 1 && (
              <img src={product.thumbImage![1]} className="absolute inset-0 w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" alt={name} />
            )}
          </Link>
          <div className="product-grid__floating-badges">
            {product.discount && product.discount > 0 && <span className="onsale">-{product.discount}%</span>}
            {product.new && <span className="hot">{t("new")}</span>}
            {product.stock === 0 && <span className="out-of-stock">{t("out")}</span>}
          </div>
          <div className="product-grid__floating-icons">
            <button onClick={wishlistItem ? deleteFromWishlist : addToWishlist} className={wishlistItem ? "active" : ""} title={wishlistItem ? t("added_to_wishlist") : t("add_to_wishlist")}><IoIosHeartEmpty /></button>
            <button onClick={compareItem ? deleteFromCompare : addToCompare} className={compareItem ? "active" : ""} title={compareItem ? t("added_to_compare") : t("add_to_compare")}><IoIosShuffle /></button>
            <button onClick={() => setModalShow(true)} className="hidden lg:flex" title={t("quick_view")}><IoIosSearch /></button>
          </div>
        </div>

        <div className="product-grid__content">
          <div className="title">
            <h3><Link href={`/shop/product-basic/${product.slug}`}>{name}</Link></h3>
            {product.shortDescription && <p className="mt-1 text-xs text-muted line-clamp-2">{product.shortDescription[currentLanguage]}</p>}
            {product.affiliateLink ? (
              <a href={product.affiliateLink} target="_blank" rel="noreferrer">{t("buy_now")}</a>
            ) : product.variation?.length ? (
              <Link href={`/shop/product-basic/${product.slug}`}>{t("select_option")}</Link>
            ) : product.stock && product.stock > 0 ? (
              <button onClick={() => addToCart(product, addToast, 1, null, null)} disabled={cartItem !== undefined && cartItem.quantity >= (cartItem.stock ?? Infinity)}>
                {cartItem ? t("added_to_cart") : t("add_to_cart")}
              </button>
            ) : <button disabled>{t("out_of_stock")}</button>}
          </div>
          <div className="price">
            {product.discount && product.discount > 0 ? (
              <Fragment>
                <span className="main-price discounted">{price(productPrice)}</span>
                <span className="discounted-price">{price(discountedPrice)}</span>
              </Fragment>
            ) : <span className="main-price">{price(productPrice)}</span>}
          </div>
        </div>
      </div>
      <ProductModal show={modalShow} onHide={() => setModalShow(false)}
        product={product} discountedprice={discountedPrice} productprice={productPrice}
        cartitems={cartItems} cartitem={cartItem} wishlistitem={wishlistItem} compareitem={compareItem}
        addtocart={addToCart} addtowishlist={addToWishlist} deletefromwishlist={deleteFromWishlist}
        addtocompare={addToCompare} deletefromcompare={deleteFromCompare} addtoast={addToast} />
    </Fragment>
  );
};
export default ProductGrid;
