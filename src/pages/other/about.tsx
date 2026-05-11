import { useState } from "react";
import Link from "next/link";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { LayoutTwo } from "../../components/Layout";
import { BreadcrumbOne } from "../../components/Breadcrumb";
import { TestimonialOne } from "../../components/Testimonial";
import { BrandLogoOne } from "../../components/BrandLogo";
import { useLocalization } from "../../context/LocalizationContext";
import testimonialData from "../../data/testimonials/testimonial-one.json";
import brandLogoData from "../../data/brand-logos/brand-logo-one.json";

const About = () => {
  const { t } = useLocalization();
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <LayoutTwo>
      <BreadcrumbOne pageTitle={t("about_page_title")} backgroundImage="/assets/images/backgrounds/breadcrumb-bg-1.webp">
        <ul className="breadcrumb__list justify-center">
          <li><Link href="/home/trending" aria-label={t("home")}><FaHome size={16} /></Link></li>
          <li>{t("about")}</li>
        </ul>
      </BreadcrumbOne>

      <div className="py-20 space-y-20">
        {/* Section title */}
        <div className="container-wide max-w-2xl text-center mx-auto px-4">
          <p className="mb-8 text-xs uppercase tracking-widest text-muted">{t("simply_or_white")}</p>
          <h2 className="mb-4 font-baskerville text-3xl font-normal text-secondary">{t("clever_unique_ideas")}</h2>
          <p className="text-sm text-muted leading-relaxed">{t("about_page_description")}</p>
        </div>

        {/* Video + info */}
        <div className="container-wide max-w-4xl mx-auto px-4">
          {/* Video bg */}
          <div
            className="relative mb-16 flex items-center justify-center overflow-hidden rounded-sm bg-cover bg-center"
            style={{ backgroundImage: "url(/assets/images/backgrounds/about-video-bg.png)", minHeight: "320px" }}
          >
            <div className="text-center">
              <button
                onClick={() => setVideoOpen(true)}
                className="mb-6 block mx-auto transition-transform hover:scale-110"
              >
                <img src="/assets/images/icon/icon-play-100x100.png" className="h-20 w-20" alt="Play" />
              </button>
              <h1 className="font-baskerville text-4xl text-secondary opacity-30 select-none">{t("our_story")}</h1>
            </div>
          </div>

          {/* Info columns */}
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="space-y-8">
              {[
                { titleKey: "address", contentKey: "address_value" },
                { titleKey: "phone", content: `${t("mobile")}: (+389) 78 / 343 – 377\n${t("phone")}: (+389) 46 / 207 – 770` },
                { titleKey: "email", contentKey: "email_value" },
              ].map(({ titleKey, contentKey, content }) => (
                <div key={titleKey}>
                  <h2 className="mb-3 font-baskerville text-lg font-normal text-secondary">{t(titleKey)}</h2>
                  <p className="whitespace-pre-line text-sm text-muted">{contentKey ? t(contentKey) : content}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <p className="mb-8 text-sm text-muted leading-relaxed">{t("about_page_extra_description")}</p>
              <Link href="/shop/left-sidebar" className="lezada-button lezada-button--medium inline-flex items-center gap-2">
                <IoMdAdd /> {t("online_store")}
              </Link>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <TestimonialOne testimonialData={testimonialData as any} backgroundImage="/assets/images/backgrounds/breadcrumb-bg-2.png" />

        {/* Brand logos */}
        <BrandLogoOne brandLogoData={brandLogoData as any} />
      </div>

      {/* YouTube Video modal */}
      {videoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-3xl">
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-primary"
              aria-label="Close"
            >
              <IoMdClose size={28} />
            </button>
            <div className="aspect-video w-full">
              <iframe
                src="https://www.youtube.com/embed/x7Qe1MtKki0?autoplay=1"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </LayoutTwo>
  );
};

export default About;
