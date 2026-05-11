import { logActivity } from "../../../pages/lib/logActivity";
import type { Order } from "../../../types";
import type { User } from "firebase/auth";

interface Props {
  t: (k: string) => string; role: string; displayName: string; email: string;
  orders: Order[]; allUsers: unknown[]; isLoading: boolean; currentLanguage: string;
  formatTotal: (v: number, lang: string) => string;
  parseAmount: (v: unknown, lang?: string) => number;
  conversionRate: number; userId?: string;
  setShowLogoutModal: (v: boolean) => void;
  setShowBroadcastModal: (v: boolean) => void;
  fetchSubscriberStats: () => void; fetchSchedule: () => void;
}

const DashboardTab = ({ t, role, displayName, email, orders, allUsers, isLoading, currentLanguage, formatTotal, parseAmount, conversionRate, userId, setShowLogoutModal, setShowBroadcastModal, fetchSubscriberStats, fetchSchedule }: Props) => {
  const totalRevenue = orders.reduce((sum, o) => {
    const mk = parseFloat(String(o.totalMK || 0));
    const en = parseFloat(String(o.totalEN || 0));
    return currentLanguage === "mk"
      ? sum + (mk > 0 ? mk : en * conversionRate)
      : sum + (en > 0 ? en : mk / conversionRate);
  }, 0);

  const stats = [
    { label: t("total_orders"),   value: orders.length,                                          color: "bg-blue-50 text-blue-700" },
    { label: t("total_revenue"),  value: formatTotal(totalRevenue, currentLanguage),              color: "bg-green-50 text-green-700" },
    { label: t("pending_orders"), value: orders.filter((o) => o.status === "pending").length,    color: "bg-yellow-50 text-yellow-700" },
    { label: t("confirmed_orders"), value: orders.filter((o) => o.status === "confirmed").length, color: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${role === "admin" ? "bg-red-500" : "bg-secondary"}`}>
            {role === "admin" ? "A" : displayName?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-secondary">{t("hello_user")} {displayName}!</h3>
            <p className="text-xs text-muted">{email}</p>
            {role === "admin" && <span className="mt-0.5 inline-block rounded bg-red-100 px-2 py-0.5 text-xs text-red-600">{t("admin")}</span>}
          </div>
        </div>
        <button
          onClick={async () => {
            await logActivity({ username: email, userId: userId ?? "", action: "LOGOUT" });
            setShowLogoutModal(true);
          }}
          disabled={isLoading}
          className="lezada-button lezada-button--small border-red-400 text-red-500 hover:bg-red-500 hover:text-white"
        >
          {isLoading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" /> : t("logout")}
        </button>
      </div>

      {/* Welcome note */}
      <div className="rounded-sm border border-border bg-surface p-5 text-sm text-muted leading-relaxed">
        {t("from_your_account_dashboard")}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-sm p-4 ${s.color}`}>
            <p className="text-xs uppercase tracking-wider opacity-70">{s.label}</p>
            <p className="mt-1 text-lg font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Admin actions */}
      {role === "admin" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: t("total_users"), value: allUsers.length, color: "bg-purple-50 text-purple-700" },
          ].map((s) => (
            <div key={s.label} className={`rounded-sm p-4 ${s.color}`}>
              <p className="text-xs uppercase tracking-wider opacity-70">{s.label}</p>
              <p className="mt-1 text-lg font-semibold">{s.value}</p>
            </div>
          ))}
          <button
            onClick={() => { fetchSubscriberStats(); fetchSchedule(); setShowBroadcastModal(true); }}
            className="lezada-button lezada-button--medium"
          >
            {t("newsletter_schedule")}
          </button>
        </div>
      )}
    </div>
  );
};
export default DashboardTab;
