import { ProductGridListWrapper } from "../ProductThumb";
import type { Product } from "../../types";
interface Props { products: Product[]; layout: string; }
const ShopProducts = ({ products, layout }: Props) => (
  <div className={`shop-products grid gap-4 ${layout.includes("three") ? "sm:grid-cols-3" : layout.includes("five") ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
    <ProductGridListWrapper products={products} bottomSpace="mb-10" />
  </div>
);
export default ShopProducts;
