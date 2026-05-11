import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { connect } from "react-redux";
import Link from "next/link";
// @ts-ignore: no declaration file for react-hooks-paginator
import Paginator from "react-hooks-paginator";
import { LayoutFive } from "../../components/Layout";
import { BreadcrumbOne } from "../../components/Breadcrumb";
import { getSortedProducts } from "../../lib/product";
import { useLocalization } from "../../context/LocalizationContext";
import { ShopInfo, ShopHeader, ShopFilter, ShopSidebar, ShopProducts } from "../../components/Shop";
import { FaHome } from "react-icons/fa";
import type { RootState, Product } from "../../types";

const LeftSidebar = ({ products }: { products: Product[] }) => {
  const { t, currentLanguage } = useLocalization();
  const router = useRouter();
  const { search, category } = router.query as { search?: string; category?: string };
  const [layout, setLayout] = useState("grid four-column");
  const [sortType, setSortType] = useState("");
  const [sortValue, setSortValue] = useState("");
  const [filterSortType, setFilterSortType] = useState("");
  const [filterSortValue, setFilterSortValue] = useState("");
  const [offset, setOffset] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentData, setCurrentData] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState(search ?? "");
  const [sortedProducts, setSortedProducts] = useState<Product[]>([]);
  const [shopTopFilter, setShopTopFilter] = useState(false);
  const pageLimit = 20;

  useEffect(() => { setSearchTerm(search ?? ""); }, [search]);

  useEffect(() => {
    let sorted = getSortedProducts(products, sortType, sortValue, currentLanguage);
    sorted = getSortedProducts(sorted, filterSortType, filterSortValue, currentLanguage);
    if (searchTerm) sorted = sorted.filter((p) => (p.name[currentLanguage] ?? p.name.en)?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (category) sorted = sorted.filter((p) => p.category?.some((c) => c.toLowerCase() === category.toLowerCase()));
    setSortedProducts(sorted);
    setOffset(0);
    setCurrentPage(1);
  }, [products, sortType, sortValue, filterSortType, filterSortValue, searchTerm, category, currentLanguage]);

  useEffect(() => { setCurrentData(sortedProducts.slice(offset, offset + pageLimit)); }, [sortedProducts, offset]);

  return (
    <LayoutFive>
      <BreadcrumbOne pageTitle={t("shop")} backgroundImage="/assets/images/backgrounds/breadcrumb-bg-1.webp">
        <ul className="breadcrumb__list justify-center">
          <li><Link href="/home/trending" aria-label={t("home")}><FaHome size={16} /></Link></li>
          <li>{t("shop")}</li>
        </ul>
      </BreadcrumbOne>

      <div className="shop-page-content">
        <ShopHeader getLayout={setLayout} getFilterSortParams={(type, value) => { setFilterSortType(type); setFilterSortValue(value); }}
          productCount={products.length} sortedProductCount={currentData.length}
          shopTopFilterStatus={shopTopFilter} setShopTopFilterStatus={setShopTopFilter} />

        {shopTopFilter && <ShopFilter products={products} getSortParams={(type, value) => { setSortType(type); setSortValue(value); }} />}

        <div className="py-16">
          <div className="container-wide">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              <aside className="lg:order-1 order-2">
                <ShopSidebar products={products} getSortParams={(type, value) => { setSortType(type); setSortValue(value); }}
                  searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              </aside>
              <div className="lg:col-span-3 lg:order-2 order-1">
                <ShopProducts layout={layout} products={currentData} />
                <div className="mt-8 flex justify-center">
                  <Paginator totalRecords={sortedProducts.length} pageLimit={pageLimit} pageNeighbours={2}
                    setOffset={setOffset} currentPage={currentPage} setCurrentPage={setCurrentPage}
                    pageContainerClass="flex gap-2" pagePrevText="«" pageNextText="»" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ShopInfo />
    </LayoutFive>
  );
};
const mapStateToProps = (state: RootState) => ({ products: state.productData });
export default connect(mapStateToProps)(LeftSidebar);
