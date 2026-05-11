import { useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { connect } from "react-redux";
import { toast } from "sonner";
import { FaHome } from "react-icons/fa";
import { LayoutTwo } from "../../../components/Layout";
import { BreadcrumbOne } from "../../../components/Breadcrumb";
import { getDiscountPrice } from "../../../lib/product";
import { addToCart } from "../../../redux/slices/cartSlice";
import { addToWishlist, deleteFromWishlist } from "../../../redux/slices/wishlistSlice";
import { addToCompare, deleteFromCompare } from "../../../redux/slices/compareSlice";
import { database, ref, get } from "../../api/register";
import { useLocalization } from "../../../context/LocalizationContext";
import { useAppDispatch } from "../../../redux/hooks";
import type { GetStaticPaths, GetStaticProps } from "next";
import type { RootState, Product, CartItem } from "../../../types";

const ImageGalleryBottomThumb = dynamic(
  () => import("../../../components/ProductDetails").then((m) => m.ImageGalleryBottomThumb),
  { ssr: false }
);
const ProductDescription = dynamic(
  () => import("../../../components/ProductDetails").then((m) => m.ProductDescription),
  { ssr: false }
);
const ProductDescriptionTab = dynamic(
  () => import("../../../components/ProductDetails").then((m) => m.ProductDescriptionTab),
  { ssr: false }
);

interface Props {
  product: Product;
  cartItems: CartItem[];
  wishlistItems: Product[];
  compareItems: Product[];
}

const ProductBasic = ({ product, cartItems, wishlistItems, compareItems }: Props) => {
  const { t, currentLanguage } = useLocalization();
  const dispatch = useAppDispatch();

  useEffect(() => { document.body.classList.remove("overflow-hidden"); }, []);

  const price = Number(product.price[currentLanguage] ?? 0);
  const productPrice = price.toFixed(2);
  const discountedPrice = getDiscountPrice(price, product.discount).toFixed(2);

  const cartItem    = cartItems.find((i) => i.id === product.id);
  const wishlistItem = wishlistItems.find((i) => i.id === product.id);
  const compareItem  = compareItems.find((i) => i.id === product.id);
  const name = product.name[currentLanguage] ?? product.name.en;

  const handleAddToCart = (p: Product, _: unknown, qty: number, color?: string | null, size?: string | null) => {
    dispatch(addToCart({ ...p, quantity: qty, selectedProductColor: color, selectedProductSize: size }));
    toast.success(t("added_to_cart"));
  };
  const handleAddToWishlist    = () => { dispatch(addToWishlist(product));    toast.success(t("added_to_wishlist")); };
  const handleRemoveFromWishlist = () => { dispatch(deleteFromWishlist(product)); toast.error(t("removed_from_wishlist")); };
  const handleAddToCompare      = () => { dispatch(addToCompare(product));    toast.success(t("added_to_compare")); };
  const handleRemoveFromCompare  = () => { dispatch(deleteFromCompare(product)); toast.error(t("removed_from_compare")); };

  return (
    <LayoutTwo>
      <BreadcrumbOne
        pageTitle={name}
        backgroundImage="/assets/images/backgrounds/breadcrumb-bg-1.webp"
      >
        <ul className="breadcrumb__list justify-center">
          <li><Link href="/home/trending" aria-label={t("home")}><FaHome size={16} /></Link></li>
          <li><Link href="/shop/left-sidebar">{t("shop")}</Link></li>
          <li>{name}</li>
        </ul>
      </BreadcrumbOne>

      <div className="py-16">
        <div className="container-wide">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div>
              <ImageGalleryBottomThumb
                product={product}
                wishlistItem={wishlistItem}
                addToast={null}
                addToWishlist={handleAddToWishlist}
                deleteFromWishlist={handleRemoveFromWishlist}
              />
            </div>
            <div>
              <ProductDescription
                product={product}
                productPrice={productPrice}
                discountedPrice={discountedPrice}
                cartItems={cartItems}
                cartItem={cartItem}
                wishlistItem={wishlistItem}
                compareItem={compareItem}
                addToast={null}
                addToCart={handleAddToCart}
                addToWishlist={handleAddToWishlist}
                deleteFromWishlist={handleRemoveFromWishlist}
                addToCompare={handleAddToCompare}
                deleteFromCompare={handleRemoveFromCompare}
              />
            </div>
          </div>

          <ProductDescriptionTab product={product} />
        </div>
      </div>
    </LayoutTwo>
  );
};

const mapStateToProps = (state: RootState) => ({
  cartItems: state.cartData,
  wishlistItems: state.wishlistData,
  compareItems: state.compareData,
});

export default connect(mapStateToProps)(ProductBasic);

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: "blocking",
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const snapshot = await get(ref(database, "products"));
    if (!snapshot.exists()) return { notFound: true };
    const data = snapshot.val() as Record<string, Omit<Product, "id">>;
    const products = Object.entries(data).map(([id, p]) => ({ ...p, id }));
    const product = products.find((p) => p.slug === (params?.slug as string));
    if (!product) return { notFound: true };
    return { props: { product }, revalidate: 3600 };
  } catch {
    return { notFound: true };
  }
};
