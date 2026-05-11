import { getIndividualCategories, getIndividualTags, setActiveSort } from "../../lib/product";
import { useLocalization } from "../../context/LocalizationContext";
import type { Product } from "../../types";

interface Props { products: Product[]; getSortParams: (type: string, value: string) => void; }

const ShopFilter = ({ products, getSortParams }: Props) => {
  const { t } = useLocalization();
  const categories = getIndividualCategories(products);
  const tags = getIndividualTags(products);

  return (
    <div className="shop-advance-filter border-y border-border bg-surface py-8">
      <div className="container-wide grid grid-cols-2 gap-8 lg:grid-cols-4">
        <div className="single-filter-widget">
          <h2 className="single-filter-widget__title">{t("categories")}</h2>
          <ul className="single-filter-widget__list">
            <li><button onClick={(e) => { getSortParams("category", ""); setActiveSort(e); }}>{t("all_categories")}</button></li>
            {categories.map((cat, i) => <li key={i}><button onClick={(e) => { getSortParams("category", cat); setActiveSort(e); }}>{t(cat) || cat}</button></li>)}
          </ul>
        </div>
        <div className="single-filter-widget">
          <h2 className="single-filter-widget__title">{t("tags")}</h2>
          <div className="tag-container mt-2">
            {tags.map((tag, i) => <button key={i} onClick={(e) => { getSortParams("tag", tag); setActiveSort(e); }}>{t(tag) || tag}</button>)}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ShopFilter;
