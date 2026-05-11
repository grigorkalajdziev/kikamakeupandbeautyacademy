import { useEffect, useState } from "react";
import { IoIosInformationCircleOutline, IoIosClose } from "react-icons/io";
import { useLocalization } from "../../context/LocalizationContext";
const CookieConsent = () => {
  const { t, translationsReady } = useLocalization();
  const [mounted, setMounted] = useState(false);
  const [accepted, setAccepted] = useState(true);
  useEffect(() => {
    setMounted(true);
    setAccepted(localStorage.getItem("cookieConsent") === "true");
  }, []);
  const handleAccept = () => { localStorage.setItem("cookieConsent", "true"); setAccepted(true); };
  if (!mounted || accepted || !translationsReady) return null;
  return (
    <div className="cookie-consent-banner">
      <IoIosInformationCircleOutline className="mt-1 flex-shrink-0 text-2xl text-secondary" />
      <div className="flex-1">
        <p className="text-xs text-secondary">{t("cookies")}</p>
        <button onClick={handleAccept} className="lezada-button lezada-button--small mt-3 text-xs">{t("accept")}</button>
      </div>
      <button onClick={() => setAccepted(true)} className="text-xl text-muted hover:text-secondary" aria-label="Close"><IoIosClose /></button>
    </div>
  );
};
export default CookieConsent;
