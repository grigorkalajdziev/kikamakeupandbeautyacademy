import { useState, useEffect } from "react";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../../pages/api/register";
import { useLocalization } from "../../../context/LocalizationContext";

interface Props { getActiveStatus: (v: boolean) => void; }

interface NavItem {
  href: string;
  labelKey: string;
  children?: { href: string; labelKey: string }[];
}

const navItems: NavItem[] = [
  { href: "/home/trending", labelKey: "home" },
  {
    href: "/shop/left-sidebar", labelKey: "shop",
    children: [
      { href: "/other/checkout", labelKey: "checkout" },
      { href: "/other/compare", labelKey: "compare" },
    ],
  },
  {
    href: "/other/about", labelKey: "about_us",
    children: [
      { href: "/other/contact", labelKey: "contact_us" },
      { href: "/other/faq", labelKey: "faq" },
    ],
  },
];

const MobileMenuNav = ({ getActiveStatus }: Props) => {
  const { t } = useLocalization();
  const [user, setUser] = useState<User | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => { const u = onAuthStateChanged(auth, setUser); return () => u(); }, []);

  return (
    <nav className="offcanvas-mobile-menu__navigation" id="offcanvas-mobile-menu__navigation">
      <ul>
        {navItems.map((item, idx) => {
          const children = item.children ? [...item.children] : [];
          if (item.labelKey === "shop") {
            children.push(user
              ? { href: "/other/my-account", labelKey: "my_account" }
              : { href: "/other/login-register", labelKey: "login_register" });
          }

          return (
            <li key={idx} className={`border-b border-border ${children.length ? "relative" : ""}`}>
              <div className="flex items-center justify-between">
                <Link href={item.href} onClick={() => getActiveStatus(false)}
                  className="block flex-1 px-4 py-3 text-sm text-secondary">
                  {t(item.labelKey)}
                </Link>
                {children.length > 0 && (
                  <button onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                    className="px-4 py-3 text-muted">
                    <IoIosArrowDown className={`transition-transform ${openIdx === idx ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
              {children.length > 0 && openIdx === idx && (
                <ul className="mobile-sub-menu bg-surface">
                  {children.map((child) => (
                    <li key={child.href}>
                      <Link href={child.href} onClick={() => getActiveStatus(false)}
                        className="block px-8 py-2.5 text-sm text-muted hover:text-secondary">
                        {t(child.labelKey)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileMenuNav;
