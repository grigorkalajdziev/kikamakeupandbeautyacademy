import { useLocalization } from "../../context/LocalizationContext";
import { SectionTitleOne } from "../SectionTitle";

interface BrandLogo { image: string; url: string; }
interface Props { brandLogoData: BrandLogo[]; }

const BrandLogoOne = ({ brandLogoData }: Props) => {
  const { t } = useLocalization();
  return (
    <div className="py-16">
      <div className="container-wide">
        <SectionTitleOne title={t("our_brands_title")} />
        <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 lg:grid-cols-6">
          {brandLogoData?.map((brand, i) => (
            <div key={i} className="flex items-center justify-center">
              <a href={brand.url} target="_blank" rel="noreferrer">
                <img src={brand.image} className="max-h-16 w-auto object-contain grayscale transition-all hover:grayscale-0" alt="" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandLogoOne;
