import { Fragment } from "react";
import { connect } from "react-redux";
import { toast } from "sonner";
import { getDiscountPrice } from "../../lib/product";
import { addToCart } from "../../redux/slices/cartSlice";
import { addToWishlist, deleteFromWishlist } from "../../redux/slices/wishlistSlice";
import { addToCompare, deleteFromCompare } from "../../redux/slices/compareSlice";
import ProductGrid from "./ProductGrid";
import { useLocalization } from "../../context/LocalizationContext";
import { useAppDispatch } from "../../redux/hooks";
import type { RootState, Product, CartItem } from "../../types";

interface Props { products: Product[]; bottomSpace?: string; cartItems: CartItem[]; wishlistItems: Product[]; compareItems: Product[]; column?: number; }

const ProductGridWrapper = ({ products, bottomSpace, cartItems, wishlistItems, compareItems, column }: Props) => {
  const { t, currentLanguage } = useLocalization();
  const dispatch = useAppDispatch();

  return (
    <Fragment>
      {products?.map((product) => {
        const price = Number(product.price[currentLanguage] ?? 0);
        const discountedPrice = getDiscountPrice(price, product.discount).toFixed(2);
        const productPrice = price.toFixed(2);
        const cartItem = cartItems.find((c) => c.id === product.id);
        const wishlistItem = wishlistItems.find((w) => w.id === product.id);
        const compareItem = compareItems.find((c) => c.id === product.id);

        return (
          <ProductGrid key={product.id} product={product} discountedPrice={discountedPrice} productPrice={productPrice}
            cartItem={cartItem} wishlistItem={wishlistItem} compareItem={compareItem}
            bottomSpace={bottomSpace} cartItems={cartItems} addToast={null}
            addToCart={(p, _t, qty, color, size) => {
              dispatch(addToCart({ ...p, quantity: qty, selectedProductColor: color, selectedProductSize: size }));
              toast.success(t("added_to_cart"));
            }}
            addToWishlist={() => { dispatch(addToWishlist(product)); toast.success(t("added_to_wishlist")); }}
            deleteFromWishlist={() => { dispatch(deleteFromWishlist(product)); toast.error(t("removed_from_wishlist")); }}
            addToCompare={() => { dispatch(addToCompare(product)); toast.success(t("added_to_compare")); }}
            deleteFromCompare={() => { dispatch(deleteFromCompare(product)); toast.error(t("removed_from_compare")); }}
          />
        );
      })}
    </Fragment>
  );
};

const mapStateToProps = (state: RootState) => ({ cartItems: state.cartData, wishlistItems: state.wishlistData, compareItems: state.compareData });
export default connect(mapStateToProps)(ProductGridWrapper);
