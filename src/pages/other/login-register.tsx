import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FcGoogle } from "react-icons/fc";
import { FaPhoneAlt, FaHome } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
} from "firebase/auth";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { auth, checkUserExists, checkPhoneExists, registerGoogleUser, set, ref, database } from "../api/register";
import { logActivity } from "../lib/logActivity";
import { getFriendlyAuthMessage } from "../../utils/authHelpers";
import { LayoutTwo } from "../../components/Layout";
import { BreadcrumbOne } from "../../components/Breadcrumb";
import { useLocalization } from "../../context/LocalizationContext";

declare global {
  interface Window { recaptchaVerifier?: RecaptchaVerifier; }
}

const Spinner = () => (
  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
);

const LoginRegister = () => {
  const { t, currentLanguage } = useLocalization();
  const router = useRouter();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginPwVisible, setLoginPwVisible] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
  if (typeof window !== "undefined") {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA solved");
          },
        }
      );
    }
  }

  const saved = localStorage.getItem("rememberedEmail");
  if (saved) {
    setLoginData((d) => ({ ...d, email: saved }));
    setRememberMe(true);
  }
}, []);

  // ── Email login ────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email) { toast.error(t("please_enter_your_email_first")); return; }
    if (!loginData.password || loginData.password.length < 6) { toast.error(t("password_too_short")); return; }

    setLoginLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      await logActivity({ username: user.email ?? "", userId: user.uid, action: "LOGIN", details: "Email најава" });

      if (!localStorage.getItem(`loginSuccessEmailSent_${user.uid}`)) {
        await fetch("/api/sendLoginSuccessEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginData.email, provider: "default", language: currentLanguage }),
        });
        localStorage.setItem(`loginSuccessEmailSent_${user.uid}`, "true");
      }

      if (rememberMe) localStorage.setItem("rememberedEmail", loginData.email);
      else localStorage.removeItem("rememberedEmail");

      toast.success(t("login_success"));
      setTimeout(() => router.push("/other/my-account"), 1500);
    } catch (err) {
      toast.error(getFriendlyAuthMessage((err as { code?: string }).code ?? "something_went_wrong", t));
    } finally { setLoginLoading(false); }
  };

  // ── Forgot password ────────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!loginData.email) { toast.error(t("please_enter_your_email_first")); return; }
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginData.email, language: currentLanguage }),
      });
      const d = await res.json();
      if (res.ok) toast.success(t("reset_email_sent"));
      else toast.error(d.error || t("something_went_wrong"));
    } catch (err) { toast.error((err as Error).message); }
  };

  // ── Google sign-in ─────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const { user } = result;
      const exists = await checkUserExists(user.uid);

      if (!exists) {
        const reg = await registerGoogleUser({ uid: user.uid, email: user.email, displayName: user.displayName });
        if (!reg.success) throw new Error(reg.error ?? "google_registration_failed");
        await logActivity({ username: user.email ?? "", userId: user.uid, action: "LOGIN", details: "Google регистрација" });
        await fetch("/api/sendRegistrationEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, language: currentLanguage, coupon: reg.coupon, userName: user.displayName ?? "User", provider: "google" }),
        });
      } else {
        await logActivity({ username: user.email ?? "", userId: user.uid, action: "LOGIN", details: "Google најава" });
        if (!localStorage.getItem(`loginSuccessEmailSent_${user.uid}`)) {
          await fetch("/api/sendLoginSuccessEmail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, provider: "google", userName: user.displayName ?? "User", language: currentLanguage }),
          });
          localStorage.setItem(`loginSuccessEmailSent_${user.uid}`, "true");
        }
      }

      toast.success(t("login_success"));
      setTimeout(() => router.push("/other/my-account"), 1500);
    } catch (err) {
      const code = (err as { code?: string }).code;
      toast.error(code ? getFriendlyAuthMessage(code, t) : (err as Error).message || t("something_went_wrong"));
    } finally { setGoogleLoading(false); }
  };

  // ── Phone sign-in ──────────────────────────────────────────────────────────
  const handlePhoneSignIn = async () => {
    try {
      const { value: phoneNumber } = await Swal.fire({
        title: t("enter_your_phone_number"), input: "tel",
        inputPlaceholder: "+38970123456",
        confirmButtonText: t("continue"), cancelButtonText: t("cancel"),
        showCancelButton: true,
        inputValidator: (v) => !v ? t("please_enter_phone") : undefined,
      });
      if (!phoneNumber) return;

      const phoneExists = await checkPhoneExists(phoneNumber);
      setPhoneLoading(true);

      Swal.fire({ title: t("sending_sms"), text: t("please_wait"), allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      (auth as any).languageCode = currentLanguage === "mk" ? "mk" : "en";

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier!);
      Swal.close();

      const { value: code } = await Swal.fire({
        title: t("enter_verification_code"), input: "text", inputPlaceholder: "123456",
        confirmButtonText: t("verify"), cancelButtonText: t("cancel"), showCancelButton: true,
        inputValidator: (v) => !v ? t("please_enter_code") : undefined,
      });
      if (!code) return;

      const result = await confirmationResult.confirm(code);
      const { user } = result;

      await logActivity({ username: user.phoneNumber ?? phoneNumber, userId: user.uid, action: "LOGIN", details: "Телефонска најава" });

      if (!phoneExists) {
        await set(ref(database, `users/${user.uid}`), {
          displayName: "", firstName: "", lastName: "",
          billingInfo: { address: "", city: "", phone: user.phoneNumber, zipCode: "" },
          role: "guest", coupon: "",
        });
      }

      toast.success(t("login_success"));
      setTimeout(() => router.push("/other/my-account"), 1000);
    } catch (err) {
      Swal.fire({ icon: "error", title: t("something_went_wrong"), text: (err as Error).message });
    } finally { setPhoneLoading(false); }
  };

  return (
    <LayoutTwo>
      <BreadcrumbOne pageTitle={t("customer_login")} backgroundImage="/assets/images/backgrounds/breadcrumb-bg-1.webp">
        <ul className="breadcrumb__list justify-center">
          <li><Link href="/home/trending" aria-label={t("home")}><FaHome size={16} /></Link></li>
          <li>{t("customer_login")}</li>
        </ul>
      </BreadcrumbOne>

      <div className="py-20">
        <div className="container-wide max-w-md mx-auto px-4">
          {/* Title */}
          <div className="mb-10 text-center">
            <h2 className="mb-2 font-baskerville text-3xl font-normal text-secondary">{t("login")}</h2>
            <p className="text-sm text-muted">{t("welcome_back")}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <input
              type="email" placeholder={t("email_address")}
              value={loginData.email}
              onChange={(e) => setLoginData((d) => ({ ...d, email: e.target.value }))}
            />

            <div className="relative">
              <input
                type={loginPwVisible ? "text" : "password"}
                placeholder={t("password")}
                value={loginData.password}
                onChange={(e) => setLoginData((d) => ({ ...d, password: e.target.value }))}
                className="pr-12"
              />
              <button type="button" onClick={() => setLoginPwVisible((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary">
                {loginPwVisible ? <AiOutlineEye size={20} /> : <AiOutlineEyeInvisible size={20} />}
              </button>
            </div>

            {/* Remember me + forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-secondary" style={{ width: "auto" }} />
                {t("remember_me")}
              </label>
              <button type="button" onClick={handleForgotPassword}
                className="text-xs text-secondary underline-offset-2 hover:underline">
                {t("forgot_password")}
              </button>
            </div>

            <button type="submit" disabled={loginLoading}
              className="lezada-button lezada-button--medium w-full justify-center">
              {loginLoading ? <Spinner /> : t("login")}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted">{t("or")}</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Social buttons */}
          <div className="space-y-3">
            <button onClick={handleGoogleSignIn} disabled={googleLoading}
              className="lezada-button lezada-button--medium w-full justify-center gap-3">
              {googleLoading ? <Spinner /> : <><FcGoogle size={22} />{t("continue_with_google")}</>}
            </button>

            <div id="recaptcha-container" className="absolute left-0 opacity-0 pointer-events-none" />

            <button type="button" onClick={handlePhoneSignIn} disabled={phoneLoading}
              className="lezada-button lezada-button--medium w-full justify-center gap-3">
              {phoneLoading ? <Spinner /> : <><FaPhoneAlt size={18} />{t("continue_with_phone")}</>}
            </button>
          </div>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-muted">
            {t("dont_have_account")}{" "}
            <Link href="/other/register" className="font-semibold text-secondary hover:text-primary">
              {t("register")}
            </Link>
          </p>
        </div>
      </div>
    </LayoutTwo>
  );
};

export default LoginRegister;
