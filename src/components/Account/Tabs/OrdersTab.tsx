import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { IoIosSearch } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import type { Order } from "../../../types";

const STATUS_COLORS: Record<string, string> = {
  pending: "#F4C430", confirmed: "#2EAD65", cancelled: "#E04545",
};

interface Props {
  t: (k: string) => string; role: string; orders: Order[];
  currentLanguage: string; formatTotal: (v: number, lang: string) => string;
  parseAmount: (v: unknown, lang?: string) => number; conversionRate: number;
  filterYear: string; setFilterYear: (v: string) => void;
  filteredOrders: Order[]; currentOrders: Order[];
  totalPages: number; currentPage: number; paginate: (n: number) => void;
  ordersOnCurrentPage: number; grandTotalInDisplayCurrency: number;
  filteredOrdersForCharts: Order[];
  getDailyRevenue: (orders: Order[], days?: number) => { date: string; revenue: number; orders: number }[];
  getMonthlyRevenue: (orders: Order[], year: number) => { month: string; revenue: number; orders: number }[];
  getYearlyRevenue: (orders: Order[]) => { year: number; revenue: number; orders: number }[];
  getTopProducts: (orders: Order[], limit?: number, year?: string) => { name: string; count: number; revenue: number }[];
  getAverageOrderValue: (orders: Order[]) => number;
  getOrderSuccessStats: (orders: Order[]) => { total: number; pending: number; confirmed: number; cancelled: number; successRate: string | number };
  formattedPaymentData: { name: string; value: number }[];
  statusData: (orders: Order[], year: string) => { status: string; count: number; mkd: number; eng: number }[];
  COLORS: Record<string, string>; PAYMENT_COLORS: string[];
  dateRange: string; setDateRange: (v: string) => void;
  showFilters: boolean; setShowFilters: (v: boolean) => void;
  searchQuery: string; setSearchQuery: (v: string) => void;
  filterStatus: string; setFilterStatus: (v: string) => void;
  filterPayment: string; setFilterPayment: (v: string) => void;
  setCurrentPage: (n: number) => void;
  updateOrder: (id: string, uid: string, status: string) => void;
  viewOrder: (id: string, uid: string) => void;
  setPendingDeleteId: (id: string) => void; setShowDeleteModal: (v: boolean) => void;
}

const Badge = ({ status, t }: { status: string; t: (k: string) => string }) => {
  const colors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-700", confirmed: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700" };
  return <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>{t(status)}</span>;
};

const OrdersTab = ({ t, role, orders, currentLanguage, formatTotal, conversionRate, filterYear, setFilterYear, filteredOrders, currentOrders, totalPages, currentPage, paginate, grandTotalInDisplayCurrency, filteredOrdersForCharts, getDailyRevenue, getMonthlyRevenue, getTopProducts, getAverageOrderValue, getOrderSuccessStats, formattedPaymentData, PAYMENT_COLORS, dateRange, setDateRange, showFilters, setShowFilters, searchQuery, setSearchQuery, filterStatus, setFilterStatus, filterPayment, setFilterPayment, setCurrentPage, updateOrder, viewOrder, setPendingDeleteId, setShowDeleteModal }: Props) => {
  const stats = getOrderSuccessStats(filteredOrdersForCharts);
  const monthlyData = getMonthlyRevenue(filteredOrdersForCharts, parseInt(filterYear));
  const topProducts = getTopProducts(filteredOrdersForCharts, 5, filterYear);
  const avgValue = getAverageOrderValue(filteredOrdersForCharts);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-secondary">{t("orders")}</h3>
        {orders.length > 0 && (
          <span className="rounded bg-secondary px-3 py-1 text-xs text-white">{orders.length} {t("total_orders")}</span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center text-muted">{t("you_have_not_made_any_order_yet")}</div>
      ) : (
        <>
          {/* Admin analytics */}
          {role === "admin" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-secondary">{t("analytics")}</h4>
                <div className="flex gap-2">
                  <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); }}
                    className="border border-border bg-white px-3 py-1 text-xs text-secondary">
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <option key={y} value={y.toString()}>{y}</option>
                    ))}
                  </select>
                  <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
                    className="border border-border bg-white px-3 py-1 text-xs text-secondary">
                    {["7days","30days","90days","365days"].map((d) => <option key={d} value={d}>{t(d)}</option>)}
                  </select>
                </div>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: t("total_revenue"),   value: formatTotal(grandTotalInDisplayCurrency, currentLanguage) },
                  { label: t("avg_order_value"),  value: formatTotal(avgValue, currentLanguage) },
                  { label: t("success_rate"),     value: `${stats.successRate}%` },
                  { label: t("confirmed_orders"), value: stats.confirmed },
                ].map((k) => (
                  <div key={k.label} className="rounded-sm border border-border p-4">
                    <p className="text-xs text-muted">{k.label}</p>
                    <p className="mt-1 text-lg font-semibold text-secondary">{k.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-sm border border-border p-4">
                  <h5 className="mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">{t("monthly_revenue")}</h5>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#c8a97e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="rounded-sm border border-border p-4">
                  <h5 className="mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">{t("payment_distribution")}</h5>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={formattedPaymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {formattedPaymentData.map((_, i) => <Cell key={i} fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top products */}
              {topProducts.length > 0 && (
                <div className="rounded-sm border border-border p-4">
                  <h5 className="mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">{t("top_products")}</h5>
                  <div className="space-y-2">
                    {topProducts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-secondary truncate max-w-xs">{p.name}</span>
                        <span className="text-muted ml-4 flex-shrink-0">{p.count}× &nbsp;{formatTotal(p.revenue, currentLanguage)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-secondary hover:text-white ${showFilters ? "bg-secondary text-white" : ""}`}>
              <IoFilter />
            </button>
            <div className="relative flex-1 max-w-xs">
              <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder={t("search_orders")} className="pl-9 text-sm" />
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 rounded-sm border border-border p-4 bg-surface">
              {[
                { label: t("status"), value: filterStatus, onChange: setFilterStatus, options: ["all","pending","confirmed","cancelled"] },
                { label: t("payment"), value: filterPayment, onChange: setFilterPayment, options: ["all","payment_cash","payment_bank"] },
              ].map((f) => (
                <div key={f.label}>
                  <label className="mb-1 block text-xs text-muted">{f.label}</label>
                  <select value={f.value} onChange={(e) => { f.onChange(e.target.value); setCurrentPage(1); }}
                    className="border border-border bg-white px-3 py-2 text-xs text-secondary w-full">
                    {f.options.map((o) => <option key={o} value={o}>{t(o)}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Orders table */}
          <div className="overflow-x-auto">
            <table className="cart-table w-full">
              <thead>
                <tr>
                  <th>#</th><th>{t("date")}</th><th>{t("status")}</th>
                  <th>{t("total")}</th><th>{t("payment")}</th><th>{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, i) => {
                  const total = currentLanguage === "mk"
                    ? (order.totalMK ?? 0)
                    : (order.totalEN ?? 0);
                  return (
                    <tr key={i}>
                      <td className="text-xs font-mono">{order.orderNumber}</td>
                      <td className="text-xs text-muted">{order.date}</td>
                      <td><Badge status={order.status} t={t} /></td>
                      <td className="text-xs font-semibold">{formatTotal(total, currentLanguage)}</td>
                      <td className="text-xs text-muted">{t(order.paymentMethod)}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          <button onClick={() => viewOrder(order.id, order.userId ?? "")}
                            className="lezada-button lezada-button--small py-1 px-2 text-[10px]">{t("view")}</button>
                          {role === "admin" && order.status === "pending" && (
                            <>
                              <button onClick={() => updateOrder(order.id, order.userId ?? "", "confirmed")}
                                className="lezada-button lezada-button--small py-1 px-2 text-[10px] border-green-400 text-green-600 hover:bg-green-500 hover:text-white">{t("confirm")}</button>
                              <button onClick={() => updateOrder(order.id, order.userId ?? "", "cancelled")}
                                className="lezada-button lezada-button--small py-1 px-2 text-[10px] border-red-400 text-red-500 hover:bg-red-500 hover:text-white">{t("cancel")}</button>
                            </>
                          )}
                          {role === "admin" && (
                            <button onClick={() => { setPendingDeleteId(order.id); setShowDeleteModal(true); }}
                              className="lezada-button lezada-button--small py-1 px-2 text-[10px] border-red-300 text-red-400 hover:bg-red-400 hover:text-white">{t("delete")}</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
              <span>{t("page")} {currentPage} / {totalPages}</span>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => paginate(page)}
                    className={`h-8 w-8 border text-xs transition-colors ${page === currentPage ? "border-secondary bg-secondary text-white" : "border-border text-muted hover:border-secondary hover:text-secondary"}`}>
                    {page}
                  </button>
                ))}
              </div>
              <span>{t("grand_total")}: {formatTotal(grandTotalInDisplayCurrency, currentLanguage)}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default OrdersTab;
