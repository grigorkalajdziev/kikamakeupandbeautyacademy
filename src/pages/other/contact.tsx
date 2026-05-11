import { useState } from "react";
import Link from "next/link";
import { IoIosPin, IoIosCall, IoIosMail, IoIosClock } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { toast } from "sonner";
import { LayoutTwo } from "../../components/Layout";
import { BreadcrumbOne } from "../../components/Breadcrumb";
import { SectionTitleOne, SectionTitleTwo } from "../../components/SectionTitle";
import { useLocalization } from "../../context/LocalizationContext";

const Contact = () => {
  const { t, currentLanguage } = useLocalization();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!formData.name.trim())   { toast.error(t("please_enter_your_name"));    return false; }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { toast.error(t("invalid_email_format")); return false; }
    if (!formData.subject.trim()) { toast.error(t("please_enter_a_subject"));   return false; }
    if (!formData.message.trim() || formData.message.length < 10) { toast.error(t("message_too_short")); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, to: ["grigorkalajdziev@gmail.com", "makeupbykika@hotmail.com"], from: "contact@kikamakeupandbeautyacademy.com", currentLanguage }),
      });
      if (res.ok) {
        toast.success(t("email_sending"));
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        const d = await res.json();
        toast.error(d.error ?? "Error");
      }
    } catch (e) { toast.error((e as Error).message); }
    finally { setSubmitting(false); }
  };

  const infoBlocks = [
    { icon: <IoIosPin className="text-2xl" />, title: t("address"), content: t("address_details") },
    { icon: <IoIosCall className="text-2xl" />, title: t("contact"), content: `${t("mobile")}: (+389) 78 / 343 – 377\n${t("phone")}: (+389) 46 / 207 – 770` },
    { icon: <IoIosMail className="text-2xl" />, title: "", content: `${t("mail")}: makeupbykika@hotmail.com` },
    { icon: <IoIosClock className="text-2xl" />, title: t("hours_of_operation"), content: `${t("monday_to_friday")}: 09:00 – 20:00\n${t("weekend_hours")}: 10:30 – 22:00` },
  ];

  return (
    <LayoutTwo>
      <BreadcrumbOne pageTitle={t("contact_title")} backgroundImage="/assets/images/backgrounds/breadcrumb-bg-1.webp">
        <ul className="breadcrumb__list justify-center">
          <li><Link href="/home/trending" aria-label={t("home")}><FaHome size={16} /></Link></li>
          <li>{t("contact")}</li>
        </ul>
      </BreadcrumbOne>

      <div className="py-20 space-y-20">
        {/* Info blocks */}
        <div className="container-wide">
          <SectionTitleTwo title={t("contact_detail")} subtitle={t("come_have_a_look")} />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {infoBlocks.map((b, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 text-secondary">{b.icon}</div>
                <div>
                  {b.title && <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-secondary">{b.title}</h3>}
                  <p className="whitespace-pre-line text-sm text-muted">{b.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="container-wide">
          <div className="aspect-video w-full overflow-hidden rounded-sm">
            <iframe
              title="map"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d728.0959768767224!2d20.80535883327269!3d41.11575098866173!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1350dca0b53ff41b%3A0x474263a97198a028!2sKika%20makeup%20and%20beauty%20academy!5e1!3m2!1smk!2smk!4v1732701744906!5m2!1smk!2smk"
              allowFullScreen
              className="h-full w-full border-none"
            />
          </div>
        </div>

        {/* Contact form */}
        <div className="container-wide max-w-2xl mx-auto px-4">
          <SectionTitleOne title={t("get_in_touch")} />
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <input type="text" placeholder={t("first_name")} value={formData.name} onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))} />
              <input type="email" placeholder={t("email")} value={formData.email} onChange={(e) => setFormData((d) => ({ ...d, email: e.target.value }))} />
            </div>
            <input type="text" placeholder={t("subject")} value={formData.subject} onChange={(e) => setFormData((d) => ({ ...d, subject: e.target.value }))} />
            <textarea rows={8} placeholder={t("message")} value={formData.message} onChange={(e) => setFormData((d) => ({ ...d, message: e.target.value }))} className="resize-none" />
            <div className="text-center">
              <button type="submit" disabled={submitting} className="lezada-button lezada-button--medium">
                {submitting ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : t("submit")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </LayoutTwo>
  );
};

export default Contact;
