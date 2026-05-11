import { IoIosSearch } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import type { Order } from "../../../types";

interface DownloadStats { total: number; withHistory: number; totalDownloads: number; avgDownloadsPerOrder: string | number; }
interface Props {
  t: (k: string) => string; role: string; orders: Order[]; currentLanguage: string;
  downloadingOrderId: string | null;
  selectedOrdersForDownload: string[];
  selectAllDownload: boolean;
  downloadSearchQuery: string; setDownloadSearchQuery: (v: string) => void;
  downloadFilterPayment: string; setDownloadFilterPayment: (v: string) => void;
  downloadFilterStatus: string; setDownloadFilterStatus: (v: string) => void;
  showDownloadFilters: boolean; setShowDownloadFilters: (v: boolean) => void;
  filteredOrdersForDownload: Order[];
  currentOrdersDownload: Order[];
  totalPagesDownload: number; currentPageDown: number;
  handlePageChangeDown: (n: number) => void;
  downloadStats: DownloadStats;
  downloadPdfEnhanced: (o: Order) => void;
  toggleOrderSelection: (id: string) => void;
  toggleSelectAll: () => void;
  bulkDownloading: boolean; downloadBulkPdfs: () => void;
  setSelectedOrdersForDownload: (v: string[]) => void;
  setSelectAllDownload: (v: boolean) => void;
  setCurrentPageDown: (n: number) => void;
}

const DownloadTab = ({ t, orders, currentLanguage, downloadingOrderId, selectedOrdersForDownload, selectAllDownload, downloadSearchQuery, setDownloadSearchQuery, downloadFilterPayment, setDownloadFilterPayment, downloadFilterStatus, setDownloadFilterStatus, showDownloadFilters, setShowDownloadFilters, filteredOrdersForDownload, currentOrdersDownload, totalPagesDownload, currentPageDown, handlePageChangeDown, downloadStats, downloadPdfEnhanced, toggleOrderSelection, toggleSelectAll, bulkDownloading, downloadBulkPdfs, setSelectedOrdersForDownload, setSelectAllDownload, setCurrentPageDown }: Props) => (
  <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-secondary">{t("download")}</h3>
      {selectedOrdersForDownload.length > 0 && (
        <div className="flex gap-2">
          <span className="rounded bg-blue-100 px-3 py-1 text-xs text-blue-700">{selectedOrdersForDownload.length} {t("selected")}</span>
          <button onClick={downloadBulkPdfs} disabled={bulkDownloading}
            className="lezada-button lezada-button--small">
            {bulkDownloading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : t("download_selected")}
          </button>
          <button onClick={() => { setSelectedOrdersForDownload([]); setSelectAllDownload(false); }}
            className="lezada-button lezada-button--small border-muted text-muted hover:bg-muted hover:text-white">
            {t("clear_selection")}
          </button>
        </div>
      )}
    </div>

    {!orders?.length ? (
      <div className="py-16 text-center text-muted">{t("you_have_not_made_any_order_yet")}</div>
    ) : (
      <>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: t("total_invoices"), value: downloadStats.total },
            { label: t("downloaded"), value: downloadStats.withHistory },
            { label: t("total_downloads"), value: downloadStats.totalDownloads },
            { label: t("avg_downloads"), value: downloadStats.avgDownloadsPerOrder },
          ].map((s) => (
            <div key={s.label} className="rounded-sm border border-border p-3">
              <p className="text-xs text-muted">{s.label}</p>
              <p className="mt-1 text-base font-semibold text-secondary">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setShowDownloadFilters(!showDownloadFilters)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted hover:bg-secondary hover:text-white ${showDownloadFilters ? "bg-secondary text-white" : ""}`}>
            <IoFilter />
          </button>
          <div className="relative flex-1 max-w-xs">
            <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" value={downloadSearchQuery} onChange={(e) => { setDownloadSearchQuery(e.target.value); setCurrentPageDown(1); }}
              placeholder={t("search_invoices")} className="pl-9 text-sm" />
          </div>
          {/* select all */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-muted">
            <input type="checkbox" checked={selectAllDownload} onChange={toggleSelectAll} className="accent-secondary" />
            {t("select_all")}
          </label>
        </div>

        {showDownloadFilters && (
          <div className="grid grid-cols-2 gap-4 rounded-sm border border-border p-4 bg-surface">
            {[
              { label: t("payment"), value: downloadFilterPayment, onChange: setDownloadFilterPayment, options: ["all","payment_cash","payment_bank"] },
              { label: t("status"), value: downloadFilterStatus, onChange: setDownloadFilterStatus, options: ["all","pending","confirmed","cancelled"] },
            ].map((f) => (
              <div key={f.label}>
                <label className="mb-1 block text-xs text-muted">{f.label}</label>
                <select value={f.value} onChange={(e) => f.onChange(e.target.value)}
                  className="w-full border border-border bg-white px-3 py-2 text-xs text-secondary">
                  {f.options.map((o) => <option key={o} value={o}>{t(o)}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Orders list */}
        <div className="space-y-3">
          {currentOrdersDownload.map((order, i) => (
            <div key={i} className="flex items-center justify-between rounded-sm border border-border p-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={selectedOrdersForDownload.includes(order.id)} onChange={() => toggleOrderSelection(order.id)} className="accent-secondary" />
                <div>
                  <p className="text-xs font-semibold text-secondary">#{order.orderNumber}</p>
                  <p className="text-xs text-muted">{order.date} · {t(order.paymentMethod)}</p>
                </div>
              </div>
              <button onClick={() => downloadPdfEnhanced(order)} disabled={downloadingOrderId === order.id}
                className="lezada-button lezada-button--small">
                {downloadingOrderId === order.id
                  ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                  : t("download")}
              </button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPagesDownload > 1 && (
          <div className="flex justify-center gap-1">
            {Array.from({ length: totalPagesDownload }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => handlePageChangeDown(p)}
                className={`h-8 w-8 border text-xs ${p === currentPageDown ? "border-secondary bg-secondary text-white" : "border-border text-muted hover:border-secondary"}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </>
    )}
  </div>
);
export default DownloadTab;
