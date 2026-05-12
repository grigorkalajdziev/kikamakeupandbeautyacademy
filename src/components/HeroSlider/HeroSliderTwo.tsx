import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useLocalization } from "../../context/LocalizationContext";
import type { HeroSlide } from "../../types";

interface Props {
  sliderData: HeroSlide[];
  spaceBottomClass?: string;
}

const HeroSliderTwo = ({ sliderData, spaceBottomClass }: Props) => {
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);
  if (!sliderData) return null;

  return (
    <div className={`hero-slider-two ${spaceBottomClass ?? ""}`}>
      <Swiper
        modules={[Navigation, Autoplay]}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
      >
        {sliderData.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="w-full bg-white py-16">
              <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center">
                {/* TEXT */}
                <div className="w-full lg:w-1/2 z-10 text-center lg:text-left">
                  <h5 className="text-sm tracking-widest uppercase text-gray-500 mb-4">
                    {t(slide.subtitle)}
                  </h5>

                  <h1
                    className="text-3xl md:text-5xl font-light mb-6"
                    dangerouslySetInnerHTML={{ __html: t(slide.title) }}
                  />

                  <Link
                    href={slide.url}
                    className="inline-block border border-black px-6 py-3 text-sm uppercase hover:bg-black hover:text-white transition"
                  >
                    {t("shop_now")}
                  </Link>
                </div>

                {/* IMAGE */}
                <div className="w-full lg:w-1/2 relative h-[400px] md:h-[700px] mt-10 lg:mt-0">
                  <Image
                    src={slide.image}
                    alt=""
                    fill
                    className="object-contain"
                    priority={i === 0}
                  />
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
