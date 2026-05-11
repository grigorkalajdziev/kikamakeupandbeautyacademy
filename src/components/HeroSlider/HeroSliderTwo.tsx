import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useLocalization } from "../../context/LocalizationContext";
import type { HeroSlide } from "../../types";

interface Props { sliderData: HeroSlide[]; spaceBottomClass?: string; }

const HeroSliderTwo = ({ sliderData, spaceBottomClass }: Props) => {
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  if (!sliderData) return null;

  return (
    <div className={`hero-slider-two ${spaceBottomClass ?? ""}`}>
      <Swiper modules={[Navigation, Autoplay]} loop autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={{ nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }}>
        {sliderData.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="hero-slider-two__slide" style={{ backgroundColor: slide.bgcolor }}>
              <div className="hero-slider-two__image">
                <Image src={slide.image} alt="" fill className="object-cover" priority={i === 0} sizes="100vw" />
              </div>
              <div className="hero-slider-two__content">
                <h5 className="sub-title">{t(slide.subtitle)}</h5>
                <h1 className="title" dangerouslySetInnerHTML={{ __html: t(slide.title) }} />
                <div className="slider-link mt-8">
                  <Link href={slide.url} className="lezada-button lezada-button--medium"
                    onClick={() => setLoading(true)}>
                    {loading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : t("shop_now")}
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        <button className="swiper-button-prev ht-swiper-button-nav" />
        <button className="swiper-button-next ht-swiper-button-nav" />
      </Swiper>
    </div>
  );
};
export default HeroSliderTwo;
