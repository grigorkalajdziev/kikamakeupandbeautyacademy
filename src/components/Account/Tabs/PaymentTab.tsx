import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import type { Order } from "../../../types";

interface Props {
  t: (k: string) => string; role: string; currentLanguage: string;
  filteredOrdersForCharts: Order[]; filteredOrdersForPayment: Order[];
  currentOrdersPayment: Order[]; totalPagesPayment: number;
  currentPagePayment: number; handlePageChangePayment: (n: number) => void;
  formatTotal: (v: number, lang: string) => string;
  parseAmount: (v: unknown, lang?: string) => number;
  conversionRate: number; filterYear: string; setFilterYear: (v: string) => void;
  formattedPaymentData: { name: string; value: number }[];
  getMonthlyRevenue: (orders: Order[], year: number) => { month: string; revenue: number }[];
  getAverageOrderValue: (orders: Order[]) => number;
  PAYMENT_COLORS: string[];
}

const PaymentTab = ({ t, role, currentLanguage, filteredOrdersForCharts, filteredOrdersForPayment, currentOrdersPayment, totalPagesPayment, currentPagePayment, handlePageChangePayment, formatTotal, conversionRate, filterYear, setFilterYear, formattedPaymentData, getMonthlyRevenue, getAverageOrderValue, PAYMENT_COLORS }: Props) => {
  const pieTotal = formattedPaymentData.reduce((s, e) => s + e.value, 0);
  const monthlyData = getMonthlyRevenue(filteredOrdersForCharts, parseInt(filterYear));
  const avgValue = getAverageOrderValue(filteredOrdersForCharts);
  const totalRevenue = filteredOrdersForCharts.reduce((sum, o) => {
    const mk = parseFloat(String(o.totalMK || 0)), en = parseFloat(String(o.totalEN || 0));
    return currentLanguage === "mk" ? sum + (mk > 0 ? mk : en * conversionRate) : sum + (en > 0 ? en : mk / conversionRate);
  }, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-secondary">{t("payment")}</h3>
        <div className="flex gap-2">
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}
            className="border border-border bg-white px-3 py-1 text-xs text-secondary">
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y.toString()}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {!filteredOrdersForPayment.length ? (
        <div className="py-16 text-center text-muted">{t("you_have_not_made_any_order_yet")}</div>
      ) : (
        <>
          {role === "admin" && (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: t("total_payments"),   value: formatTotal(totalRevenue, currentLanguage) },
                  { label: t("avg_payment"),       value: formatTotal(avgValue, currentLanguage) },
                  { label: t("cash_payments"),     value: filteredOrdersForCharts.filter((o) => o.paymentMethod === "payment_cash").length },
                  { label: t("bank_payments"),     value: filteredOrdersForCharts.filter((o) => o.paymentMethod === "payment_bank").length },
                ].map((k) => (
                  <div key={k.label} className="rounded-sm border border-border p-4">
                    <p className="text-xs text-muted">{k.label}</p>
                    <p className="mt-1 text-base font-semibold text-secondary">{k.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-sm border border-border p-4">
                  <h5 className="mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">{t("payment_distribution")}</h5>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={formattedPaymentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} >
                        {formattedPaymentData.map((_, i) => <Cell key={i} fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => formatTotal(Number(value ?? 0), currentLanguage) }/>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="rounded-sm border border-border p-4">
                  <h5 className="mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">{t("monthly_revenue")}</h5>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#c8a97e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* Payment list */}
          <div className="overflow-x-auto">
            <table className="cart-table w-full">
              <thead><tr>
                <th>#</th><th>{t("date")}</th><th>{t("payment")}</th><th>{t("status")}</th><th>{t("total")}</th>
              </tr></thead>
              <tbody>
                {currentOrdersPayment.map((order, i) => {
                  const total = currentLanguage === "mk" ? (order.totalMK ?? 0) : (order.totalEN ?? 0);
                  return (
                    <tr key={i}>
                      <td className="text-xs font-mono">{order.orderNumber}</td>
                      <td className="text-xs text-muted">{order.date}</td>
                      <td className="text-xs">{t(order.paymentMethod)}</td>
                      <td><span className={`rounded px-2 py-0.5 text-xs ${order.status === "confirmed" ? "bg-green-100 text-green-700" : order.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{t(order.status)}</span></td>
                      <td className="text-xs font-semibold">{formatTotal(total, currentLanguage)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPagesPayment > 1 && (
            <div className="flex justify-center gap-1">
              {Array.from({ length: totalPagesPayment }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => handlePageChangePayment(p)}
                  className={`h-8 w-8 border text-xs ${p === currentPagePayment ? "border-secondary bg-secondary text-white" : "border-border text-muted"}`}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default PaymentTab;
