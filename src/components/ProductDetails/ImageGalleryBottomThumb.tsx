import { Fragment, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs, EffectFade } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { IoIosArrowBack, IoIosArrowForward, IoMdExpand, IoIosHeartEmpty } from "react-icons/io";
import { useLocalization } from "../../context/LocalizationContext";
import type { Product } from "../../types";

interface Props {
  product: Product;
  wishlistItem?: Product;
  addToast: unknown;
  addToWishlist: () => void;
  deleteFromWishlist: () => void;
}

const ImageGalleryBottomThumb = ({ product, wishlistItem, addToWishlist, deleteFromWishlist }: Props) => {
  const { t } = useLocalization();
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const images = product.image ?? product.thumbImage ?? [];
  const slides = images.map((src) => ({ src }));

  return (
    <Fragment>
      {/* Main gallery */}
      <div className="relative mb-4">
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
          {product.discount && product.discount > 0 && <span className="onsale px-2 py-0.5 text-xs font-semibold text-white bg-primary">-{product.discount}%</span>}
          {product.new && <span className="hot px-2 py-0.5 text-xs font-semibold text-white bg-secondary">{t("new")}</span>}
          {product.stock === 0 && <span className="out-of-stock px-2 py-0.5 text-xs font-semibold text-white bg-muted">{t("out")}</span>}
        </div>

        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <button
            title={wishlistItem ? t("added_to_wishlist") : t("add_to_wishlist")}
            onClick={wishlistItem ? deleteFromWishlist : addToWishlist}
            className={`flex h-9 w-9 items-center justify-center bg-white shadow-sm transition-colors hover:bg-secondary hover:text-white ${wishlistItem ? "bg-secondary text-white" : "text-secondary"}`}
          >
            <IoIosHeartEmpty />
          </button>
        </div>

        <Swiper
          modules={[EffectFade, Thumbs]}
          effect="fade"
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          loop
          className="aspect-[4/5] w-full bg-surface"
        >
          {images.map((src, i) => (
            <SwiperSlide key={i}>
              <div className="relative h-full w-full cursor-zoom-in" onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}>
                <img src={src} className="h-full w-full object-cover" alt="" />
                <button title={t("click_to_enlarge")} className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center bg-white/80 text-secondary shadow-sm">
                  <IoMdExpand />
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Thumbnail strip */}
      <Swiper
        modules={[FreeMode, Navigation, Thumbs]}
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={4}
        freeMode
        loop
        watchSlidesProgress
        navigation={{ nextEl: ".thumb-next", prevEl: ".thumb-prev" }}
        className="relative"
      >
        {images.map((src, i) => (
          <SwiperSlide key={i}>
            <div className="aspect-square cursor-pointer overflow-hidden border-2 border-transparent transition-colors [.swiper-slide-thumb-active_&]:border-secondary">
              <img src={src} className="h-full w-full object-cover" alt="" />
            </div>
          </SwiperSlide>
        ))}
        <button className="thumb-prev ht-swiper-button-nav"><IoIosArrowBack /></button>
        <button className="thumb-next ht-swiper-button-nav"><IoIosArrowForward /></button>
      </Swiper>

      <Lightbox open={lightboxOpen} close={() => setLightboxOpen(false)} slides={slides} index={lightboxIndex} />
    </Fragment>
  );
};

export default ImageGalleryBottomThumb;
