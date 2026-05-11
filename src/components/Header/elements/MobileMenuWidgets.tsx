import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { IoIosPhonePortrait, IoMdMail, IoLogoFacebook, IoLogoInstagram, IoMdPerson } from "react-icons/io";
import { FaXTwitter } from "react-icons/fa6";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../../../pages/api/register";
import { logActivity } from "../../../pages/lib/logActivity";
import { useLocalization } from "../../../context/LocalizationContext";
import { toast } from "sonner";

const MobileMenuWidgets = () => {
  const { t } = useLocalization();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

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
    <div className="offcanvas-mobile-menu__widgets">
      <div className="contact-widget space-mb--30">
        <ul>
          <li>
            <IoMdPerson />
            {!user ? (
              <Link href="/other/login-register">{t("signup_login")}</Link>
            ) : (
              <button onClick={handleLogout}>{t("logout")}</button>
            )}
          </li>
          <li><IoIosPhonePortrait /><a href="tel:+38978343377">(+389) 78/343-377</a></li>
          <li><IoMdMail /><a href="mailto:makeupbykika@hotmail.com" className="text-xs">makeupbykika@hotmail.com</a></li>
        </ul>
      </div>
      <div className="social-widget">
        <a href="https://www.x.com" target="_blank" rel="noreferrer"><FaXTwitter /></a>
        <a href="https://www.instagram.com/kikamakeup_and_beautyacademy/" target="_blank" rel="noreferrer"><IoLogoInstagram /></a>
        <a href="https://www.facebook.com/kristina.iloski" target="_blank" rel="noreferrer"><IoLogoFacebook /></a>
      </div>
    </div>
  );
};

export default MobileMenuWidgets;
