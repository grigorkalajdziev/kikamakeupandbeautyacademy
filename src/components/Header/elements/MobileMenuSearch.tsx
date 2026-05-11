// MobileMenuSearch.tsx
import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { useRouter } from "next/router";
import { useLocalization } from "../../../context/LocalizationContext";

export const MobileMenuSearch = () => {
  const { t, currentLanguage } = useLocalization();
  const router = useRouter();
  const [input, setInput] = useState("");

  useEffect(() => { setInput(""); }, [currentLanguage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) router.push(`/shop/left-sidebar?search=${input}`);
  };

  return (
    <div className="offcanvas-mobile-menu__search">
      <form onSubmit={handleSearch}>
        <input type="search" placeholder={t("search_here")} value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit"><IoIosSearch /></button>
      </form>
    </div>
  );
};
