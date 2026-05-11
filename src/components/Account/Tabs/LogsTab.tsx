import { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { IoIosSearch } from "react-icons/io";
import { IoFilter } from "react-icons/io5";
import { useLocalization } from "../../../context/LocalizationContext";

interface LogEntry { id: string; username: string; userId: string; action: string; details: string; ip: string; createdAt: string; }

const LOGS_PER_PAGE = 6;

function fmtDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}, ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

export default function LogsTab() {
  const { t } = useLocalization();
  const [logs, setLogs]             = useState<LogEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterAction, setFilter]   = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage]             = useState(1);

  const ACTION_COLORS: Record<string, string> = {
    LOGIN: "bg-green-100 text-green-700", LOGOUT: "bg-gray-100 text-gray-600",
    ORDER_PLACED: "bg-blue-100 text-blue-700", ORDER_DELETED: "bg-red-100 text-red-700",
    ORDER_STATUS: "bg-yellow-100 text-yellow-700", PROFILE_UPDATED: "bg-purple-100 text-purple-700",
    PASSWORD_CHANGED: "bg-pink-100 text-pink-700", PDF_DOWNLOAD: "bg-sky-100 text-sky-700",
    BULK_PDF_DOWNLOAD: "bg-cyan-100 text-cyan-700", SCHEDULE_SAVED: "bg-emerald-100 text-emerald-700",
    SCHEDULE_TOGGLED: "bg-teal-100 text-teal-700",
  };

  useEffect(() => {
    const db = getDatabase();
    get(ref(db, "activityLogs")).then((snap) => {
      if (snap.exists()) {
        const arr = Object.entries(snap.val() as Record<string, Omit<LogEntry,"id">>)
          .map(([id, v]) => ({ id, ...v }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLogs(arr);
      }
    }).finally(() => setLoading(false));
  }, []);

  const filtered = logs
    .filter((l) => l.username?.toLowerCase().includes(search.toLowerCase()) || l.details?.toLowerCase().includes(search.toLowerCase()) || l.ip?.includes(search))
    .filter((l) => filterAction === "all" || l.action === filterAction);

  const totalPages = Math.ceil(filtered.length / LOGS_PER_PAGE);
  const current = filtered.slice((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE);
  const uniqueActions = [...new Set(logs.map((l) => l.action))];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-secondary">{t("logs")}</h3>
        {logs.length > 0 && <span className="rounded bg-secondary px-3 py-1 text-xs text-white">{logs.length} {t("total_logs")}</span>}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" /></div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted hover:bg-secondary hover:text-white ${showFilters ? "bg-secondary text-white" : ""}`}>
              <IoFilter />
            </button>
            <div className="relative flex-1 max-w-xs">
              <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={t("search_logs")} className="pl-9 text-sm" />
            </div>
          </div>

          {showFilters && (
            <div className="rounded-sm border border-border p-4 bg-surface">
              <label className="mb-1 block text-xs text-muted">{t("action")}</label>
              <select value={filterAction} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                className="border border-border bg-white px-3 py-2 text-xs text-secondary">
                <option value="all">{t("all")}</option>
                {uniqueActions.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          )}

          {!filtered.length ? (
            <div className="py-16 text-center text-muted">{t("no_logs_found")}</div>
          ) : (
            <>
              <div className="space-y-3">
                {current.map((log) => (
                  <div key={log.id} className="flex flex-wrap items-start gap-3 rounded-sm border border-border p-3">
                    <span className={`flex-shrink-0 rounded px-2 py-0.5 text-xs font-semibold ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600"}`}>{log.action}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium text-secondary">{log.username}</p>
                      {log.details && <p className="text-xs text-muted">{log.details}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted">{fmtDate(log.createdAt)}</p>
                      {log.ip && <p className="text-[10px] text-muted opacity-60">{log.ip}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`h-8 w-8 border text-xs ${p === page ? "border-secondary bg-secondary text-white" : "border-border text-muted"}`}>{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
