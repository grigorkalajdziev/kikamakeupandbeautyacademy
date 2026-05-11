import Link from "next/link";
import { useState } from "react";
import { connect } from "react-redux";
import { IoIosAdd } from "react-icons/io";
import { LayoutFive } from "../../components/Layout";
import { ShopInfo } from "../../components/Shop";
import { getProducts } from "../../lib/product";
import { HeroSliderTwo } from "../../components/HeroSlider";
import { CategorySlider } from "../../components/Category";
import { SectionTitleOne } from "../../components/SectionTitle";
import { ProductGridWrapper } from "../../components/ProductThumb";
import { BlogPostSlider } from "../../components/Blog";
import { useLocalization } from "../../context/LocalizationContext";
import type { RootState, Product } from "../../types";
import categoryData from "../../data/categories/category-one.json";
import blogData from "../../data/blog-posts/blog-post-one.json";
import heroSliderData from "../../data/hero-sliders/hero-slider-two.json";

const Trending = ({ products }: { products: Product[] }) => {
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  const subtitle = t("find_your_style").replace("{{year}}", String(new Date().getFullYear()));

  return (
    <LayoutFive>
      <HeroSliderTwo sliderData={heroSliderData as any} spaceBottomClass="mb-12" />
      <CategorySlider categoryData={categoryData as any} spaceBottomClass="mb-24" />
      <SectionTitleOne title={t("spring_summer")} subtitle={subtitle} />
      <div className="mb-24">
        <div className="container-wide">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <ProductGridWrapper products={products} bottomSpace="mb-10" />
          </div>
          <div className="mt-10 flex justify-center">
            <Link href="/shop/left-sidebar"
              className="lezada-button group inline-flex items-center gap-2"
              onClick={(e) => { e.preventDefault(); setLoading(true); setTimeout(() => { window.location.href = "/shop/left-sidebar"; }, 1200); }}>
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-secondary border-t-transparent" /> : <><IoIosAdd className="text-lg transition-transform group-hover:rotate-90" />{t("see_more")}</>}
            </Link>
          </div>
        </div>
      </div>
      <BlogPostSlider blogData={blogData as any} spaceBottomClass="mb-12" />
      <ShopInfo />
    </LayoutFive>
  );
};
const mapStateToProps = (state: RootState) => ({ products: getProducts(state.productData, ["makeup", "waxing"]).slice(0, 10) });
export default connect(mapStateToProps)(Trending);
