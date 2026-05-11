import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { IoIosArrowRoundBack, IoIosArrowRoundForward } from "react-icons/io";
import type { Category } from "../../types";

interface Props { categoryData: Category[]; spaceBottomClass?: string; }

const CategorySlider = ({ categoryData, spaceBottomClass }: Props) => (
  <div className={`container-wide ${spaceBottomClass ?? ""}`}>
    <Swiper modules={[Navigation, Autoplay]} loop={false} spaceBetween={50}
      autoplay={{ delay: 5000 }}
      navigation={{ nextEl: ".cat-next", prevEl: ".cat-prev" }}
      breakpoints={{ 320: { slidesPerView: 1 }, 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}>
      {categoryData?.map((cat, i) => (
        <SwiperSlide key={i}>
          <div className="single-category">
            <div className="single-category__image overflow-hidden">
              <img src={cat.image} className="w-full object-cover transition-transform duration-500 hover:scale-105" alt={cat.name} />
            </div>
            <div className="single-category__content mt-5 text-center">
              <div className="title">
                <Link href="/shop/left-sidebar" className="text-sm font-semibold uppercase tracking-wider text-secondary hover:text-primary transition-colors">
                  {cat.name}
                </Link>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
      <button className="cat-prev ht-swiper-button-nav"><IoIosArrowRoundBack /></button>
      <button className="cat-next ht-swiper-button-nav"><IoIosArrowRoundForward /></button>
    </Swiper>
  </div>
);
export default CategorySlider;
