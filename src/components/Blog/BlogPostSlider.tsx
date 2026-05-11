import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { IoIosCalendar, IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useLocalization } from "../../context/LocalizationContext";
import type { BlogPost } from "../../types";

interface Props { blogData: BlogPost[]; spaceBottomClass?: string; }

const BlogPostSlider = ({ blogData, spaceBottomClass }: Props) => {
  const { t, currentLanguage } = useLocalization();
  return (
    <div className={`container-wide ${spaceBottomClass ?? ""}`}>
      <Swiper modules={[Navigation, Autoplay]} spaceBetween={30}
        autoplay={{ delay: 5000 }}
        navigation={{ nextEl: ".blog-next", prevEl: ".blog-prev" }}
        breakpoints={{ 320: { slidesPerView: 1 }, 640: { slidesPerView: 2 } }}>
        {blogData?.map((post, i) => (
          <SwiperSlide key={i}>
            <div className="blog-grid-post">
              <div className="blog-grid-post__image mb-6">
                <img src={post.image} className="w-full object-cover" alt="" />
              </div>
              <div className="blog-grid-post__content">
                <div className="post-date flex items-center gap-1 text-xs text-muted">
                  <IoIosCalendar />{post.date[currentLanguage]}
                </div>
                <h2 className="post-title mt-2 font-baskerville text-lg text-secondary">
                  <a>{post.title[currentLanguage]}</a>
                </h2>
                <p className="post-excerpt mt-2 text-sm text-muted line-clamp-3">{post.text[currentLanguage]}</p>
                <button className="blog-readmore-btn mt-3 text-xs uppercase tracking-widest text-secondary hover:underline"
                  onClick={(e) => e.preventDefault()}>{t("read_more")}</button>
              </div>
            </div>
          </SwiperSlide>
        ))}
        <button className="blog-prev ht-swiper-button-nav"><IoIosArrowBack /></button>
        <button className="blog-next ht-swiper-button-nav"><IoIosArrowForward /></button>
      </Swiper>
    </div>
  );
};
export default BlogPostSlider;
