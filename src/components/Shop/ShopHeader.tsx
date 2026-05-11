import { MdViewComfy, MdApps, MdList } from "react-icons/md";
import { IoMdFunnel } from "react-icons/io";
import { setActiveLayout } from "../../lib/product";
import { useLocalization } from "../../context/LocalizationContext";

interface Props {
  shopTopFilterStatus: boolean;
  setShopTopFilterStatus: (v: boolean) => void;
  getFilterSortParams: (type: string, value: string) => void;
  sortedProductCount: number;
  productCount: number;
  getLayout: (layout: string) => void;
  layoutClass?: string;
  listMode?: boolean;
}

const ShopHeader = ({ shopTopFilterStatus, setShopTopFilterStatus, getFilterSortParams, sortedProductCount, productCount, getLayout, listMode = true }: Props) => {
  const { t } = useLocalization();
  return (
    <div className="shop-header container-wide">
      <p className="text-xs text-muted">{t("showing")} {sortedProductCount} {t("of")} {productCount} {t("result")}</p>
      <div className="flex items-center gap-4">
        <div className="filter-dropdown">
          <select onChange={(e) => getFilterSortParams("filterSort", e.target.value)}
            className="cursor-pointer border border-border bg-white px-4 py-2 text-xs text-secondary">
            <option value="default">{t("default")}</option>
            <option value="priceHighToLow">{t("price_high_to_low")}</option>
            <option value="priceLowToHigh">{t("price_low_to_high")}</option>
          </select>
        </div>
        <div className="grid-icons hidden lg:flex items-center gap-2">
          {[
            { layout: "grid three-column", icon: <MdApps /> },
            { layout: "grid four-column", icon: <MdViewComfy />, active: true },
            ...(listMode ? [{ layout: "list", icon: <MdList /> }] : []),
          ].map((btn) => (
            <button key={btn.layout} className={`text-xl text-muted hover:text-secondary ${btn.active ? "active" : ""}`}
              onClick={(e) => { getLayout(btn.layout); setActiveLayout(e); }}>{btn.icon}</button>
          ))}
        </div>
        <div className="advance-filter-icon">
          <button onClick={() => setShopTopFilterStatus(!shopTopFilterStatus)}
            className={shopTopFilterStatus ? "active" : ""}>
            <IoMdFunnel /> {t("filter")}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ShopHeader;
