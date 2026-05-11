import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { IoIosSearch } from "react-icons/io";
import { getIndividualCategories, getIndividualTags, setActiveSort, getDiscountPrice } from "../../lib/product";
import ProductRating from "../Product/ProductRating";
import { useLocalization } from "../../context/LocalizationContext";
import { database, ref, get } from "../../pages/api/register";
import type { Product } from "../../types";

interface Props {
  products: Product[];
  getSortParams: (type: string, value: string) => void;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
}

const ShopSidebar = ({ products, getSortParams, searchTerm, setSearchTerm }: Props) => {
  const { t, currentLanguage } = useLocalization();
  const categories = getIndividualCategories(products);
  const tags = getIndividualTags(products);
  const [popularProducts, setPopularProducts] = useState<(Product & { reviewCount: number; avgRating: number })[]>([]);

  useEffect(() => { setSearchTerm(""); }, [currentLanguage]);

  useEffect(() => {
    const fetch_ = async () => {
      const withRatings = await Promise.all(products.map(async (p) => {
        try {
          const snap = await get(ref(database, `productReviews/${p.id}/reviews`));
          if (!snap.exists()) return { ...p, reviewCount: 0, avgRating: 0 };
          const data = snap.val() as Record<string, { rating: number }>;
          const keys = Object.keys(data);
          const avg = keys.reduce((a, k) => a + data[k].rating, 0) / keys.length;
          return { ...p, reviewCount: keys.length, avgRating: avg };
        } catch { return { ...p, reviewCount: 0, avgRating: 0 }; }
      }));
      withRatings.sort((a, b) => b.avgRating - a.avgRating || b.reviewCount - a.reviewCount);
      setPopularProducts(withRatings.slice(0, 3));
    };
    if (products.length) fetch_();
  }, [products]);

  return (
    <div className="shop-sidebar space-y-10">
      {/* Search */}
      <div className="single-sidebar-widget">
        <div className="flex border border-border">
          <input type="search" placeholder={t("searchPlaceholder")} value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-none px-4 py-3 text-sm outline-none" />
          <button className="px-4 text-muted hover:text-secondary"><IoIosSearch /></button>
        </div>
      </div>

      {/* Categories */}
      <div className="single-sidebar-widget">
        <h2 className="single-sidebar-widget__title">{t("categories")}</h2>
        <ul className="single-sidebar-widget__list single-sidebar-widget__list--category">
          <li><button onClick={(e) => { getSortParams("category", ""); setActiveSort(e); }} className="active">{t("allCategories")}</button></li>
          {categories.map((cat, i) => <li key={i}><button onClick={(e) => { getSortParams("category", cat); setActiveSort(e); }}>{t(cat) || cat}</button></li>)}
        </ul>
      </div>

      {/* Popular */}
      <div className="single-sidebar-widget">
        <h2 className="single-sidebar-widget__title">{t("popularProducts")}</h2>
        {popularProducts.map((p, i) => {
          const price = Number(p.price[currentLanguage] ?? 0);
          const disc = getDiscountPrice(price, p.discount).toFixed(2);
          return (
            <div key={i} className="mb-4 flex gap-3">
              <Link href={`/shop/product-basic/${p.slug}`}>
                <img src={p.thumbImage?.[0] ?? ""} className="h-16 w-12 object-cover" alt="" />
              </Link>
              <div>
                <Link href={`/shop/product-basic/${p.slug}`} className="text-xs font-medium text-secondary hover:text-primary">
                  {p.name[currentLanguage] ?? p.name.en}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  {p.discount && p.discount > 0 ? (
                    <Fragment>
                      <span className="text-xs text-muted line-through">{currentLanguage === "mk" ? `${price} ${t("currency")}` : `${t("currency")} ${price}`}</span>
                      <span className="text-xs font-semibold text-secondary">{currentLanguage === "mk" ? `${disc} ${t("currency")}` : `${t("currency")} ${disc}`}</span>
                    </Fragment>
                  ) : <span className="text-xs font-semibold text-secondary">{currentLanguage === "mk" ? `${price} ${t("currency")}` : `${t("currency")} ${price}`}</span>}
                </div>
                <div className="flex text-xs rating-star"><ProductRating ratingValue={p.avgRating} /></div>
                <p className="text-[10px] text-muted">({p.reviewCount} {t("customer_reviews")})</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tags */}
      <div className="single-sidebar-widget">
        <h2 className="single-sidebar-widget__title">{t("tags")}</h2>
        <div className="tag-container">{tags.map((tag, i) => <button key={i} onClick={(e) => { getSortParams("tag", tag); setActiveSort(e); }}>{t(tag) || tag}</button>)}</div>
      </div>
    </div>
  );
};
export default ShopSidebar;
