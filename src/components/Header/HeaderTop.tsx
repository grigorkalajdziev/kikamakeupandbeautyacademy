import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { IoIosArrowDown, IoLogoFacebook, IoLogoInstagram } from "react-icons/io";
import { FaXTwitter } from "react-icons/fa6";
import { MdLanguage } from "react-icons/md";
import { TbCurrencyEuro } from "react-icons/tb";
import { VscAccount } from "react-icons/vsc";
import ReactCountryFlag from "react-country-flag";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../../pages/api/register";
import { logActivity } from "../../pages/lib/logActivity";
import { useLocalization } from "../../context/LocalizationContext";
import { toast } from "sonner";
import type { Lang } from "../../types";

const HeaderTop = () => {
  const { t, currentLanguage, changeLanguage } = useLocalization();
  const router = useRouter();
  const [currency, setCurrency] = useState("MKD");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => { setCurrency(currentLanguage === "en" ? "EUR" : "MKD"); }, [currentLanguage]);
  useEffect(() => { const u = onAuthStateChanged(auth, setUser); return () => u(); }, []);

  const handleLogout = async () => {
    try {
      await logActivity({ username: user?.email ?? "", userId: user?.uid ?? "", action: "LOGOUT" });
      await signOut(auth);
      setUser(null);
      toast.info(t("logout_success"));
      setTimeout(() => router.push("/other/login-register"), 2000);
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="hidden border-b border-border bg-white py-2.5 lg:block">
      <div className="container-wide">
        <div className="flex items-center justify-between text-xs text-muted">

          {/* ── Left ── */}
          <div className="flex items-center gap-1">
            {/* Language */}
            <div className="group relative">
              <button className="flex cursor-default items-center gap-1 px-2 py-1 hover:text-secondary">
                <MdLanguage className="text-base" />
                <span>{currentLanguage === "en" ? t("english") : t("macedonian")}</span>
                <IoIosArrowDown className="text-xs" />
              </button>
              <ul className="absolute left-0 top-full z-50 hidden min-w-[140px] border border-border bg-white py-1 shadow-md group-hover:block">
                {(["mk", "en"] as Lang[]).map((lang) => (
                  <li key={lang}>
                    <button onClick={() => changeLanguage(lang)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-xs hover:bg-surface text-secondary">
                      <ReactCountryFlag countryCode={lang === "mk" ? "MK" : "GB"} svg className="text-sm" />
                      {lang === "mk" ? t("macedonian") : t("english")}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <span className="mx-1 text-border">|</span>

            {/* Currency */}
            <div className="group relative">
              <button className="flex cursor-default items-center gap-1 px-2 py-1">
                <TbCurrencyEuro className="text-base" />
                <span>{currency}</span>
                <IoIosArrowDown className="text-xs" />
              </button>
              <ul className="absolute left-0 top-full z-50 hidden min-w-[100px] border border-border bg-white py-1 shadow-md group-hover:block">
                {["MKD", "EUR"].map((c) => (
                  <li key={c}>
                    <button disabled className="w-full cursor-not-allowed px-4 py-2 text-left text-xs text-muted">{c}</button>
                  </li>
                ))}
              </ul>
            </div>

            <span className="mx-1 text-border">|</span>
            <span className="px-2">
              {t("order_online_call")}
              <span className="ml-1 font-medium text-secondary">(+389) 78/343-377</span>
            </span>
          </div>

          {/* ── Right ── */}
          <div className="flex items-center gap-1">
            {user ? (
              <>
                <Link href="/other/my-account" className="flex items-center gap-1 text-secondary hover:text-primary">
                  <VscAccount className="text-base" />
                </Link>
                <span className="max-w-[160px] truncate text-muted">{user.email}</span>
                <span className="mx-1 text-border">|</span>
                <button onClick={handleLogout} className="text-xs text-muted underline-offset-2 hover:text-secondary hover:underline">
                  {t("logout")}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1">
                <VscAccount className="text-base text-secondary" />
                <Link href="/other/login-register" className="text-xs text-secondary hover:text-primary">
                  {t("signup_login")}
                </Link>
              </div>
            )}

            <span className="mx-1 text-border">|</span>

            <ul className="flex items-center gap-3">
              {[
                { href: "https://x.com", icon: <FaXTwitter /> },
                { href: "https://www.facebook.com/kristina.iloski", icon: <IoLogoFacebook /> },
                { href: "https://www.instagram.com/kikamakeup_and_beautyacademy/", icon: <IoLogoInstagram /> },
              ].map(({ href, icon }) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noreferrer" className="transition-colors hover:text-secondary">{icon}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderTop;
