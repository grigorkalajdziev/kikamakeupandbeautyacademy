import { useState } from "react";
import { useRouter } from "next/router";
import { MdClose } from "react-icons/md";
import { useLocalization } from "../../../context/LocalizationContext";

interface Props { activeStatus: boolean; getActiveStatus: (v: boolean) => void; }

const SearchOverlay = ({ activeStatus, getActiveStatus }: Props) => {
  const { t } = useLocalization();
  const router = useRouter();
  const [term, setTerm] = useState("");

  const close = () => { getActiveStatus(false); document.body.classList.remove("overflow-hidden"); };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim()) { router.push(`/shop/left-sidebar?search=${term}`); close(); }
  };

  return (
    <div className={`search-overlay ${activeStatus ? "active" : ""}`}>
      <button className="absolute right-8 top-8 text-3xl text-muted hover:text-secondary" onClick={close} aria-label="Close"><MdClose /></button>
      <div className="search-overlay__content">
        <form onSubmit={handleSearch}>
          <input
            type="search"
            placeholder={t("search_products_placeholder")}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            autoFocus={activeStatus}
          />
        </form>
        <p className="search-overlay__hint">{t("search_hint")}</p>
      </div>
    </div>
  );
};

export default SearchOverlay;
