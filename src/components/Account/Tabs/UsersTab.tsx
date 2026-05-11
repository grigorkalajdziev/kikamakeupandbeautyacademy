import { IoIosSearch } from "react-icons/io";
import { IoFilter } from "react-icons/io5";

interface AppUser { uid: string; firstName: string; lastName: string; displayName: string; email: string; role: string; phone: string; address: string; city: string; country: string; zipCode: string; coupon: string; }
interface Props {
  t: (k: string) => string; allUsers: AppUser[];
  userSearchQuery: string; setUserSearchQuery: (v: string) => void;
  userFilterRole: string; setUserFilterRole: (v: string) => void;
  currentPageUsers: number; setCurrentPageUsers: (v: number) => void;
  usersPerPage: number; showUserFilters: boolean; setShowUserFilters: (v: boolean) => void;
}

const UsersTab = ({ t, allUsers, userSearchQuery, setUserSearchQuery, userFilterRole, setUserFilterRole, currentPageUsers, setCurrentPageUsers, usersPerPage, showUserFilters, setShowUserFilters }: Props) => {
  const filtered = allUsers
    .filter((u) => {
      const q = userSearchQuery.toLowerCase();
      return u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.firstName?.toLowerCase().includes(q) || u.lastName?.toLowerCase().includes(q);
    })
    .filter((u) => userFilterRole === "all" || u.role === userFilterRole);

  const totalPages = Math.ceil(filtered.length / usersPerPage);
  const current = filtered.slice((currentPageUsers - 1) * usersPerPage, currentPageUsers * usersPerPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-secondary">{t("users")}</h3>
        {allUsers.length > 0 && <span className="rounded bg-secondary px-3 py-1 text-xs text-white">{allUsers.length} {t("total_users")}</span>}
      </div>

      {!allUsers.length ? (
        <div className="py-16 text-center text-muted">{t("no_users_found")}</div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setShowUserFilters(!showUserFilters)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted hover:bg-secondary hover:text-white ${showUserFilters ? "bg-secondary text-white" : ""}`}>
              <IoFilter />
            </button>
            <div className="relative flex-1 max-w-xs">
              <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" value={userSearchQuery} onChange={(e) => { setUserSearchQuery(e.target.value); setCurrentPageUsers(1); }}
                placeholder={t("search_users")} className="pl-9 text-sm" />
            </div>
          </div>

          {showUserFilters && (
            <div className="rounded-sm border border-border p-4 bg-surface">
              <label className="mb-1 block text-xs text-muted">{t("role")}</label>
              <select value={userFilterRole} onChange={(e) => { setUserFilterRole(e.target.value); setCurrentPageUsers(1); }}
                className="border border-border bg-white px-3 py-2 text-xs text-secondary">
                {["all","guest","admin"].map((r) => <option key={r} value={r}>{t(r)}</option>)}
              </select>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="cart-table w-full">
              <thead><tr>
                <th>{t("name")}</th><th>{t("email")}</th><th>{t("role")}</th><th>{t("phone")}</th><th>{t("city")}</th>
              </tr></thead>
              <tbody>
                {current.map((user) => (
                  <tr key={user.uid}>
                    <td className="text-xs">{user.displayName || `${user.firstName} ${user.lastName}`.trim() || "—"}</td>
                    <td className="text-xs text-muted">{user.email}</td>
                    <td><span className={`rounded px-2 py-0.5 text-xs ${user.role === "admin" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>{user.role}</span></td>
                    <td className="text-xs text-muted">{user.phone || "—"}</td>
                    <td className="text-xs text-muted">{user.city || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setCurrentPageUsers(p)}
                  className={`h-8 w-8 border text-xs ${p === currentPageUsers ? "border-secondary bg-secondary text-white" : "border-border text-muted"}`}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default UsersTab;
