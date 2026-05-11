import Link from "next/link";
import { useRouter } from "next/router";
import { IoIosHome } from "react-icons/io";
import { useLocalization } from "../../../context/LocalizationContext";

const navItems = [
  { href: "/shop/left-sidebar", key: "shop" },
  { href: "/shop/left-sidebar?category=makeup",   key: "makeup" },
  { href: "/shop/left-sidebar?category=pedicure",  key: "pedicure" },
  { href: "/shop/left-sidebar?category=waxing",    key: "waxing" },
  { href: "/shop/left-sidebar?category=extras",    key: "extras" },
  { href: "/shop/left-sidebar?category=training",  key: "training" },
  { href: "/other/compare",   key: "compare" },
  { href: "/other/checkout",  key: "checkout" },
  { href: "/other/about",     key: "about_us" },
  { href: "/other/contact",   key: "contact_us" },
] as const;

const Navigation = () => {
  const { t } = useLocalization();
  const { asPath } = useRouter();

  return (
    <nav className="one-line-nav">
      <ul className="one-line-nav__list">
        <li className="one-line-nav__item">
          <Link href="/home/trending" className={`one-line-nav__link${asPath.startsWith("/home") ? " active" : ""}`} aria-label={t("home")}>
            <IoIosHome size={20} />
          </Link>
        </li>
        {navItems.map(({ href, key }) => (
          <li key={key} className="one-line-nav__item">
            <Link href={href} className={`one-line-nav__link${asPath === href ? " active" : ""}`}>
              {t(key)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
