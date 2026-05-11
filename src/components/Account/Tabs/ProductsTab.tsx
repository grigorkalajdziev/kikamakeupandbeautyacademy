import { useState, useEffect } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import { toast } from "sonner";
import { database, ref, get, remove } from "../../../pages/api/register";
import { fetchProducts } from "../../../redux/slices/productSlice";
import { useAppDispatch } from "../../../redux/hooks";
import type { Product } from "../../../types";
import type { User } from "firebase/auth";

interface Props { t: (k: string) => string; role: string; currentLanguage: string; user: User | null; }

const PRODUCTS_PER_PAGE = 10;

const ProductsTab = ({ t, role, currentLanguage, user }: Props) => {
  const dispatch = useAppDispatch();
  const [products, setProducts]             = useState<Product[]>([]);
  const [filtered, setFiltered]             = useState<Product[]>([]);
  const [loading, setLoading]               = useState(false);
  const [searchQuery, setSearchQuery]       = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [categories, setCategories]         = useState<string[]>([]);
  const [showFilters, setShowFilters]       = useState(false);
  const [currentPage, setCurrentPage]       = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const snap = await get(ref(database, "products"));
      if (snap.exists()) {
        const data = snap.val() as Record<string, Omit<Product, "id">>;
        const list = Object.entries(data).map(([id, p]) => ({ ...p, id }));
        setProducts(list);
        const cats = new Set<string>();
        list.forEach((p) => p.category?.forEach((c) => cats.add(c)));
        setCategories([...cats].sort());
      }
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAllProducts(); }, []);

  useEffect(() => {
    let list = products.filter((p) => {
      const name = currentLanguage === "mk" ? p.name?.mk : p.name?.en;
      return (!searchQuery || name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterCategory === "all" || p.category?.includes(filterCategory));
    });
    setFiltered(list);
    setCurrentPage(1);
  }, [searchQuery, filterCategory, products, currentLanguage]);

  const handleDelete = async (id: string) => {
    try {
      await remove(ref(database, `products/${id}`));
      setProducts((prev) => prev.filter((p) => p.id !== id));
      dispatch(fetchProducts());
      toast.success(t("product_deleted"));
    } catch (e) { toast.error((e as Error).message); }
    finally { setConfirmDeleteId(null); }
  };

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const current = filtered.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-secondary">{t("products")}</h3>
        <span className="rounded bg-secondary px-3 py-1 text-xs text-white">{products.length} {t("total_products")}</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted hover:bg-secondary hover:text-white ${showFilters ? "bg-secondary text-white" : ""}`}>
          <IoFilter />
        </button>
        <div className="relative flex-1 max-w-xs">
          <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search_products_placeholder")} className="pl-9 text-sm" />
        </div>
      </div>

      {showFilters && (
        <div className="rounded-sm border border-border p-4 bg-surface">
          <label className="mb-1 block text-xs text-muted">{t("category")}</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="border border-border bg-white px-3 py-2 text-xs text-secondary">
            <option value="all">{t("all_categories")}</option>
            {categories.map((c) => <option key={c} value={c}>{t(c) || c}</option>)}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" /></div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="cart-table w-full">
              <thead><tr>
                <th className="w-16">{t("image")}</th>
                <th>{t("name")}</th>
                <th>{t("price")}</th>
                <th>{t("category")}</th>
                <th>{t("stock")}</th>
                <th>{t("actions")}</th>
              </tr></thead>
              <tbody>
                {current.map((product) => {
                  const name  = product.name?.[currentLanguage] ?? product.name?.en ?? "";
                  const price = product.price?.[currentLanguage as "en" | "mk"] ?? 0;
                  return (
                    <tr key={product.id}>
                      <td><img src={product.thumbImage?.[0] ?? ""} className="h-14 w-12 object-cover" alt="" /></td>
                      <td className="text-xs font-medium text-secondary">{name}</td>
                      <td className="text-xs">{currentLanguage === "mk" ? `${price} ден.` : `€${price}`}</td>
                      <td className="text-xs text-muted">{product.category?.join(", ")}</td>
                      <td className="text-xs">{product.stock ?? "∞"}</td>
                      <td>
                        {confirmDeleteId === product.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(product.id)}
                              className="lezada-button lezada-button--small py-1 px-2 text-[10px] border-red-400 text-red-500 hover:bg-red-500 hover:text-white">{t("yes_delete")}</button>
                            <button onClick={() => setConfirmDeleteId(null)}
                              className="lezada-button lezada-button--small py-1 px-2 text-[10px]">{t("cancel")}</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(product.id)}
                            className="lezada-button lezada-button--small py-1 px-2 text-[10px] border-red-300 text-red-400 hover:bg-red-400 hover:text-white">{t("delete")}</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className={`h-8 w-8 border text-xs ${p === currentPage ? "border-secondary bg-secondary text-white" : "border-border text-muted"}`}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default ProductsTab;
