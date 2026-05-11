import { IoIosClose } from "react-icons/io";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useLocalization } from "../../../context/LocalizationContext";

interface Props { activeStatus: boolean; getActiveStatus: (v: boolean) => void; }

const close = (fn: (v: boolean) => void) => {
  fn(false);
  document.body.classList.remove("overflow-hidden");
};

const AboutOverlay = ({ activeStatus, getActiveStatus }: Props) => {
  const { t } = useLocalization();

  return (
    <div className={`about-overlay ${activeStatus ? "active" : ""}`}>
      <div className="about-overlay__close" onClick={() => close(getActiveStatus)} />
      <div className="about-overlay__content">
        <button className="absolute right-4 top-4 text-2xl text-muted hover:text-secondary"
          onClick={() => close(getActiveStatus)} aria-label="Close"><IoIosClose /></button>

        <div className="flex h-full flex-col justify-between pt-12">
          <div className="about-widget">
            <h2 className="about-widget__title">{t("about_us_title")}</h2>
            <p className="mt-3 text-sm text-muted leading-relaxed">{t("about_us_description")}</p>
          </div>

          <div className="about-overlay__contact-widget space-y-3">
            <p className="email text-sm">
              <a href="mailto:makeupbykika@hotmail.com" className="hover:text-primary">makeupbykika@hotmail.com</a>
            </p>
            <p className="phone text-sm text-muted">(+389) 78 / 343 - 377</p>
            <div className="social-icons">
              <ul className="flex gap-4 text-lg text-muted">
                {[
                  { href: "https://www.x.com", icon: <FaXTwitter />, label: "X" },
                  { href: "https://www.facebook.com/kristina.iloski", icon: <FaFacebookF />, label: "Facebook" },
                  { href: "https://www.instagram.com/kikamakeup_and_beautyacademy/", icon: <FaInstagram />, label: "Instagram" },
                ].map(({ href, icon, label }) => (
                  <li key={href}>
                    <a href={href} target="_blank" rel="noreferrer" title={label}
                      className="transition-colors hover:text-secondary">{icon}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutOverlay;
