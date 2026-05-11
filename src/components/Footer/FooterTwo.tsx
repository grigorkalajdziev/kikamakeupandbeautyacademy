import { useState, useEffect } from "react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IoIosArrowRoundUp } from "react-icons/io";
import { animateScroll } from "react-scroll";
import SubscribeEmailTwo from "../Newsletter/SubscribeEmailTwo";
import { useLocalization } from "../../context/LocalizationContext";

interface Props { footerBgClass?: string; }

const FooterTwo = ({ footerBgClass }: Props) => {
  const { t } = useLocalization();
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const fn = () => setScroll(window.scrollY);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const isDark = footerBgClass === "bg-color--blue-two";

  const aboutLinks = [
    { href: "/other/about", key: "about_us" },
    { href: "/other/contact", key: "contact" },
    { href: "/other/faq", key: "faqs" },
  ];
  const usefulLinks = [
    { href: "/other/login-register", key: "signup_login" },
    { href: "/shop/left-sidebar", key: "shop" },
    { href: "/other/checkout", key: "checkout" },
    { href: "/other/privacy-policy", key: "privacy_policy" },
    { href: "/other/terms-of-service", key: "terms_of_service" },
  ];
  const social = [
    { href: "https://www.x.com", icon: <FaXTwitter />, label: "X (Twitter)" },
    { href: "https://www.facebook.com/kristina.iloski", icon: <FaFacebookF />, label: "Facebook" },
    { href: "https://www.instagram.com/kikamakeup_and_beautyacademy/", icon: <FaInstagram />, label: "Instagram" },
  ];

  return (
    <footer className={`pt-24 pb-12 ${footerBgClass ?? "bg-surface"}`}>
      <div className="container-wide">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="space-y-5">
            <img src={isDark ? "/assets/images/logo-alt.png" : "/assets/images/logo.svg"} className="h-10 w-auto" alt="Logo" />
            <p className="text-xs text-muted leading-relaxed">
              &copy; {new Date().getFullYear()}{" "}
              <a href="https://www.kikamakeupandbeautyacademy.com" target="_blank" rel="noreferrer" className="hover:text-secondary">
                {t("brand_name")}
              </a>{" "}
              {t("all_rights_reserved")}
            </p>
          </div>

          {/* About */}
          <div>
            <h5 className="footer-single-widget__title">{t("about")}</h5>
            <nav className="footer-single-widget__nav"><ul>{aboutLinks.map(l => <li key={l.key}><a href={l.href}>{t(l.key)}</a></li>)}</ul></nav>
          </div>

          {/* Useful links */}
          <div>
            <h5 className="footer-single-widget__title">{t("useful_links")}</h5>
            <nav className="footer-single-widget__nav"><ul>{usefulLinks.map(l => <li key={l.key}><a href={l.href}>{t(l.key)}</a></li>)}</ul></nav>
          </div>

          {/* Social */}
          <div>
            <h5 className="footer-single-widget__title">{t("follow_us")}</h5>
            <nav className="footer-single-widget__nav footer-single-widget__nav--social">
              <ul>{social.map(s => <li key={s.href}><a href={s.href} target="_blank" rel="noreferrer">{s.icon} {s.label}</a></li>)}</ul>
            </nav>
          </div>

          {/* Newsletter */}
          <div>
            <h2 className="footer-subscribe-widget__title">{t("subscribe")}.</h2>
            <p className="footer-subscribe-widget__subtitle">{t("subscribe_message")}</p>
            <SubscribeEmailTwo />
          </div>
        </div>
      </div>

      <button
        className={`scroll-top ${scroll > 100 ? "show" : ""}`}
        onClick={() => animateScroll.scrollToTop()}
        aria-label="Scroll to top"
      >
        <IoIosArrowRoundUp className="text-xl" />
      </button>
    </footer>
  );
};
export default FooterTwo;
