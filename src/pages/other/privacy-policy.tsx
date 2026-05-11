import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { LayoutTwo } from "../../components/Layout";
import { BreadcrumbOne } from "../../components/Breadcrumb";
import { useLocalization } from "../../context/LocalizationContext";

const Page = () => {
  const { t } = useLocalization();
  return (
    <LayoutTwo>
      <BreadcrumbOne pageTitle={t("privacy_policy")} backgroundImage="/assets/images/backgrounds/breadcrumb-bg-1.webp">
        <ul className="breadcrumb__list justify-center">
          <li><Link href="/home/trending" aria-label={t("home")}><FaHome size={16} /></Link></li>
          <li>{t("privacy_policy")}</li>
        </ul>
      </BreadcrumbOne>
      <div className="py-20">
        <div className="container-wide max-w-3xl mx-auto px-4 prose prose-sm text-muted">
          <p>{t("privacy_policy_content")}</p>
        </div>
      </div>
    </LayoutTwo>
  );
};
export default Page;
