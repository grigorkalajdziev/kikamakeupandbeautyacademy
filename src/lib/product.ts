import type { Product, CartItem } from "../types";

export const getProducts = (
  products: Product[],
  categories?: string | string[],
  type?: "new" | "bestSeller" | "topRated" | "discounted",
  limit?: number
): Product[] => {
  let result = products.filter(Boolean);
  if (categories) {
    const cats = Array.isArray(categories) ? categories : [categories];
    result = result.filter((p) => p.category?.some((c) => cats.includes(c)));
  }
  if (type === "new")        result = result.filter((p) => p.new === true);
  if (type === "bestSeller") result = result.sort((a, b) => (b.saleCount ?? 0) - (a.saleCount ?? 0));
  if (type === "topRated")   result = result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  if (type === "discounted") result = result.filter((p) => p.discount && p.discount > 0);
  return limit ? result.slice(0, limit) : result;
};

export const getDiscountPrice = (price: number, discount?: number): number =>
  discount && discount > 0 ? price - price * (discount / 100) : price;

export const getProductCartQuantity = (
  cartItems: CartItem[],
  product: Product,
  color?: string,
  size?: string
): number => {
  const match = cartItems.find(
    (i) =>
      i.id === product.id &&
      (i.selectedProductColor ? i.selectedProductColor === color : true) &&
      (i.selectedProductSize  ? i.selectedProductSize  === size  : true)
  );
  if (!match) return 0;
  if (product.variation) {
    return cartItems
      .filter((i) => i.id === product.id && i.selectedProductColor === color && i.selectedProductSize === size)
      .reduce((acc, i) => acc + i.quantity, 0);
  }
  return match.quantity;
};

export const getSortedProducts = (
  products: Product[],
  sortType: string,
  sortValue: string,
  currentLanguage: "en" | "mk"
): Product[] => {
  if (!products || !sortType || !sortValue) return products;
  if (sortType === "category") return products.filter((p) => p.category?.includes(sortValue));
  if (sortType === "tag")      return products.filter((p) => p.tag?.includes(sortValue));
  if (sortType === "filterSort") {
    const copy = [...products];
    if (sortValue === "priceHighToLow") return copy.sort((a, b) => (b.price[currentLanguage] ?? 0) - (a.price[currentLanguage] ?? 0));
    if (sortValue === "priceLowToHigh") return copy.sort((a, b) => (a.price[currentLanguage] ?? 0) - (b.price[currentLanguage] ?? 0));
    return copy;
  }
  return products;
};

export const getIndividualCategories = (products: Product[]): string[] =>
  [...new Set(products.flatMap((p) => p.category ?? []))];

export const getIndividualTags = (products: Product[]): string[] =>
  [...new Set(products.flatMap((p) => p.tag ?? []))];

export const getIndividualColors = (products: Product[]): { colorName: string; colorCode?: string }[] => {
  const seen = new Set<string>();
  return products
    .flatMap((p) => p.variation ?? [])
    .filter((v) => { if (seen.has(v.color)) return false; seen.add(v.color); return true; })
    .map((v) => ({ colorName: v.color, colorCode: v.colorCode }));
};

export const getProductsIndividualSizes = (products: Product[]): string[] =>
  [...new Set(products.flatMap((p) => p.variation?.flatMap((v) => v.size.map((s) => s.name)) ?? []))];

export const cartItemStock = (item: Product, color?: string, size?: string): number => {
  if (item.stock !== undefined) return item.stock;
  return item.variation?.find((v) => v.color === color)?.size.find((s) => s.name === size)?.stock ?? 0;
};

export const setActiveSort = (e: React.MouseEvent<HTMLButtonElement>): void => {
  document.querySelectorAll<HTMLButtonElement>(
    ".single-sidebar-widget__list button, .tag-container button, .single-filter-widget__list button"
  ).forEach((btn) => btn.classList.remove("active"));
  e.currentTarget.classList.add("active");
};

export const setActiveLayout = (e: React.MouseEvent<HTMLButtonElement>): void => {
  document.querySelectorAll<HTMLButtonElement>(".grid-icons button").forEach((btn) => btn.classList.remove("active"));
  e.currentTarget.classList.add("active");
};
