import { useState } from "react";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { LayoutTwo } from "../../components/Layout";
import { BreadcrumbOne } from "../../components/Breadcrumb";
import { useLocalization } from "../../context/LocalizationContext";

interface FaqItem { qKey: string; aKey: string; }
const faqSections: { titleKey: string; items: FaqItem[] }[] = [
  { titleKey: "shipping_information_title", items: [
    { qKey: "shipping_question_1", aKey: "shipping_answer_1" },
    { qKey: "shipping_question_2", aKey: "shipping_answer_2" },
    { qKey: "shipping_question_4", aKey: "shipping_answer_4" },
  ]},
  { titleKey: "payment_information_title", items: [
    { qKey: "payment_question_1", aKey: "payment_answer_1" },
    { qKey: "payment_question_2", aKey: "payment_answer_2" },
    { qKey: "payment_question_3", aKey: "payment_answer_3" },
  ]},
  { titleKey: "orders_and_returns_title", items: [
    { qKey: "orders_question_1", aKey: "orders_answer_1" },
    { qKey: "orders_question_2", aKey: "orders_answer_2" },
    { qKey: "orders_question_3", aKey: "orders_answer_3" },
  ]},
];

const Faq = () => {
  const { t } = useLocalization();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setOpen((s) => ({ ...s, [key]: !s[key] }));

  return (
    <LayoutTwo>
      <BreadcrumbOne pageTitle={t("faq")} backgroundImage="/assets/images/backgrounds/breadcrumb-bg-1.webp">
        <ul className="breadcrumb__list justify-center"><li><Link href="/home/trending" aria-label={t("home")}><FaHome size={16} /></Link></li><li>{t("faq")}</li></ul>
      </BreadcrumbOne>
      <div className="py-20">
        <div className="container-wide max-w-3xl">
          {faqSections.map((section) => (
            <div key={section.titleKey} className="mb-12">
              <h2 className="mb-6 font-baskerville text-xl font-normal text-secondary">{t(section.titleKey)}</h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.qKey} className="border border-border">
                    <button className="flex w-full items-center justify-between px-5 py-4 text-sm font-medium text-secondary"
                      onClick={() => toggle(item.qKey)}>
                      {t(item.qKey)}
                      <IoIosArrowDown className={`flex-shrink-0 transition-transform ${open[item.qKey] ? "rotate-180" : ""}`} />
                    </button>
                    {open[item.qKey] && <div className="border-t border-border px-5 py-4 text-sm text-muted">{t(item.aKey)}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </LayoutTwo>
  );
};
export default Faq;
