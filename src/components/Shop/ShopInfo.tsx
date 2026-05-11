import { useLocalization } from "../../context/LocalizationContext";
const ShopInfo = () => {
  const { t } = useLocalization();
  return (
    <div className="mb-12">
      <div className="container-wide">
        <div className="shop-info-container">
          {[
            { titleKey: "free_shipping", descKey: "free_shipping_description" },
            { titleKey: "free_returns", descKey: "free_returns_description" },
            { titleKey: "secure_payment", descKey: null, img: "/assets/images/icon/pay.svg" },
          ].map((info) => (
            <div key={info.titleKey} className="shop-info-single">
              <h4>{t(info.titleKey)}</h4>
              {info.img ? <img src={info.img} className="mx-auto mt-2 h-8" alt="" /> : <p>{t(info.descKey!)}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ShopInfo;
