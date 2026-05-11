import { IoIosClose } from "react-icons/io";
import { MobileMenuSearch } from "./MobileMenuSearch";
import MobileMenuNav from "./MobileMenuNav";
import MobileMenuWidgets from "./MobileMenuWidgets";
import { useLocalization } from "../../../context/LocalizationContext";
import type { Lang } from "../../../types";

interface Props { activeStatus: boolean; getActiveStatus: (v: boolean) => void; }

const MobileMenu = ({ activeStatus, getActiveStatus }: Props) => {
  const { changeLanguage, currentLanguage, t } = useLocalization();
  const currency = currentLanguage === "mk" ? "MKD" : "EUR";

  return (
    <div className={`offcanvas-mobile-menu ${activeStatus ? "active" : ""}`}>
      <div className="offcanvas-mobile-menu__overlay-close" onClick={() => getActiveStatus(false)} />
      <div className="offcanvas-mobile-menu__wrapper">
        <button className="absolute right-4 top-4 z-10 text-2xl text-muted hover:text-secondary"
          onClick={() => getActiveStatus(false)} aria-label="Close"><IoIosClose /></button>

        <div className="pt-12">
          <MobileMenuSearch />
          <MobileMenuNav getActiveStatus={getActiveStatus} />

          <div className="offcanvas-mobile-menu__middle px-4 py-4 space-y-4">
            <div className="lang-curr-style">
              <span className="title">{t("choose_language")}</span>
              <select value={currentLanguage} onChange={(e) => changeLanguage(e.target.value as Lang)} className="mt-1">
                <option value="mk">🇲🇰 {t("macedonian")}</option>
                <option value="en">🇬🇧 {t("english")}</option>
              </select>
            </div>
            <div className="lang-curr-style">
              <span className="title">{t("choose_currency")}</span>
              <select value={currency} disabled className="mt-1 cursor-not-allowed opacity-60">
                <option value={currency}>{currency}</option>
              </select>
            </div>
          </div>

          <MobileMenuWidgets />
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
