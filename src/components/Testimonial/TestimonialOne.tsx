import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { SectionTitleOne } from "../SectionTitle";
import { useLocalization } from "../../context/LocalizationContext";

interface TestimonialItem {
  content: Record<string, string>;
  image: string;
  name: Record<string, string>;
  designation: Record<string, string>;
}

interface Props {
  testimonialData: TestimonialItem[];
  backgroundImage?: string;
  spaceBottom?: string;
}

const TestimonialOne = ({ testimonialData, backgroundImage, spaceBottom }: Props) => {
  const { t, currentLanguage } = useLocalization();

  return (
    <div
      className={`py-24 bg-cover bg-center ${spaceBottom ?? ""}`}
      style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none" }}
    >
      <div className="container-wide">
        <SectionTitleOne title={t("testimonial_title")} />
        <Swiper
          modules={[Autoplay]}
          loop
          spaceBetween={30}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{ 320: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
        >
          {testimonialData?.map((item, i) => (
            <SwiperSlide key={i}>
              <div
                className="rounded-xl border border-white/20 p-6 h-full"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                }}
              >
                <p className="mb-6 text-sm leading-relaxed text-secondary">
                  {item.content[currentLanguage]}
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    className="h-12 w-12 rounded-full object-cover"
                    alt={item.name[currentLanguage]}
                  />
                  <div>
                    <p className="text-sm font-semibold text-secondary">{item.name[currentLanguage]}</p>
                    <span className="text-xs text-muted">/ {item.designation[currentLanguage]}</span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default TestimonialOne;
