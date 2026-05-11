import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaHome } from "react-icons/fa";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { toast } from "sonner";
import { LayoutTwo } from "../../components/Layout";
import { BreadcrumbOne } from "../../components/Breadcrumb";
import { useLocalization } from "../../context/LocalizationContext";
import { registerUser } from "../api/register";
import { logActivity } from "../lib/logActivity";
import { getFriendlyAuthMessage, validateEmail, validatePasswordStrength, validateName } from "../../utils/authHelpers";

const Register = () => {
  const { t, currentLanguage } = useLocalization();
  const router = useRouter();
  const [data, setData] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName(data.firstName)) { toast.error(t("please_enter_your_first_name")); return; }
    if (!validateName(data.lastName))  { toast.error(t("please_enter_your_last_name")); return; }
    if (!validateEmail(data.email))    { toast.error(t("invalid_email_format")); return; }
    if (!validatePasswordStrength(data.password)) { toast.error(t("password_must_contain_letter_and_number")); return; }
    if (data.password !== confirmPassword) { toast.error(t("passwords_do_not_match")); return; }
    if (!termsAccepted) { toast.error(t("please_accept_terms")); return; }

    setLoading(true);
    try {
      const result = await registerUser(data.email, data.password, data.firstName, data.lastName);
      if (result.success) {
        await logActivity({ username: data.email, userId: "", action: "REGISTER" });
        await fetch("/api/sendRegistrationEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, language: currentLanguage, coupon: result.coupon }),
        });
        toast.success(t("registration_success"));
        setTimeout(() => router.push("/other/login-register"), 1500);
      } else {
        toast.error(getFriendlyAuthMessage(result.error ?? "something_went_wrong", t));
      }
    } catch (err) {
      toast.error(getFriendlyAuthMessage((err as { code?: string }).code ?? "something_went_wrong", t));
    } finally { setLoading(false); }
  };

  return (
    <LayoutTwo>
      <BreadcrumbOne pageTitle={t("register")} backgroundImage="/assets/images/backgrounds/breadcrumb-bg-1.webp">
        <ul className="breadcrumb__list justify-center">
          <li><Link href="/home/trending" aria-label={t("home")}><FaHome size={16} /></Link></li>
          <li>{t("register")}</li>
        </ul>
      </BreadcrumbOne>

      <div className="py-20">
        <div className="container-wide max-w-lg mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-2 font-baskerville text-3xl font-normal text-secondary">{t("register")}</h2>
            <p className="text-sm text-muted">{t("no_account_register")}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { key: "firstName" as const, type: "text", label: t("first_name_placeholder") },
              { key: "lastName"  as const, type: "text", label: t("last_name_placeholder") },
              { key: "email"     as const, type: "email", label: t("email_placeholder") },
            ].map(({ key, type, label }) => (
              <input key={key} type={type} placeholder={label} value={data[key]}
                onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))} />
            ))}

            {[
              { show: showPw, setShow: setShowPw, val: data.password, onChange: (v: string) => setData((d) => ({ ...d, password: v })), label: t("password_placeholder") },
              { show: showConfirm, setShow: setShowConfirm, val: confirmPassword, onChange: setConfirmPassword, label: t("confirm_password") },
            ].map(({ show, setShow, val, onChange, label }, i) => (
              <div key={i} className="relative">
                <input type={show ? "text" : "password"} placeholder={label} value={val} onChange={(e) => onChange(e.target.value)} className="pr-12" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary">
                  {show ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
                </button>
              </div>
            ))}

            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-secondary" style={{ width: "auto" }} />
              <label htmlFor="terms" className="cursor-pointer text-xs text-muted leading-relaxed">
                {t("i_accept")}{" "}
                <Link href="/other/terms-of-service" target="_blank" className="text-secondary underline">{t("terms_of_service_register")}</Link>
                {" "}{t("and")}{" "}
                <Link href="/other/privacy-policy" target="_blank" className="text-secondary underline">{t("privacy_policy")}</Link>
              </label>
            </div>

            <button type="submit" disabled={loading} className="lezada-button lezada-button--medium w-full justify-center">
              {loading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : t("register")}
            </button>

            <p className="text-center text-sm text-muted">
              {t("already_have_account")}{" "}
              <Link href="/other/login-register" className="font-semibold text-secondary hover:text-primary">{t("login")}</Link>
            </p>
          </form>
        </div>
      </div>
    </LayoutTwo>
  );
};

export default Register;
