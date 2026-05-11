import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { onAuthStateChanged, signOut, updatePassword, User } from "firebase/auth";
import { getDatabase, ref, set, get, update, remove } from "firebase/database";
import { Country, City } from "country-state-city";
import { toast } from "sonner";

import { auth } from "../api/register";
import { logActivity } from "../lib/logActivity";
import { useLocalization } from "../../context/LocalizationContext";
import { LayoutTwo } from "../../components/Layout";
import { BreadcrumbOne } from "../../components/Breadcrumb";

import DashboardTab    from "../../components/Account/Tabs/DashboardTab";
import OrdersTab       from "../../components/Account/Tabs/OrdersTab";
import DownloadTab     from "../../components/Account/Tabs/DownloadTab";
import PaymentTab      from "../../components/Account/Tabs/PaymentTab";
import AccountDetailsTab from "../../components/Account/Tabs/AccountDetailsTab";
import UsersTab        from "../../components/Account/Tabs/UsersTab";
import LogsTab         from "../../components/Account/Tabs/LogsTab";
import ProductsTab     from "../../components/Account/Tabs/ProductsTab";

import type { Order } from "../../types";

// ── Helpers ───────────────────────────────────────────────────────────────────

const RATE = 61.5;

const parseAmount = (val: unknown, lang = "mk"): number => {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  if (typeof val === "object") {
    const v = val as Record<string, unknown>;
    const preferred = lang === "en" ? (v.en ?? v.mk) : (v.mk ?? v.en);
    return parseAmount(preferred, lang);
  }
  const n = Number(String(val).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const getLocalizedTotal = (order: Order, lang = "mk"): number => {
  if (!order) return 0;
  const explicit = parseAmount((order as any).total, lang);
  if (explicit > 0) return explicit;
  if (!order.products?.length) return 0;
  const subtotal = order.products.reduce((sum, p) => {
    const price =
      typeof p.price === "object"
        ? parseAmount(lang === "en" ? p.price.en : p.price.mk, lang) || parseAmount(p.price.en ?? p.price.mk, lang)
        : parseAmount(p.price, lang);
    return sum + price * (p.quantity || 1);
  }, 0);
  const disc = parseAmount((order as any).discount, lang);
  return disc > 0 ? Math.max(subtotal - disc, 0) : subtotal;
};

const formatTotal = (amount: number, lang: string): string => {
  const isEn = lang === "en";
  const fmt = new Intl.NumberFormat(isEn ? "en-US" : "mk-MK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${fmt.format(amount || 0)} ${isEn ? "€" : "ден."}`;
};

const customStyles = {
  control: (p: object) => ({ ...p, minHeight: "50px", height: "50px", borderRadius: "4px", display: "flex", alignItems: "center" }),
  valueContainer: (p: object) => ({ ...p, height: "50px", padding: "0 8px", display: "flex", alignItems: "center" }),
  input: (p: object) => ({ ...p, margin: "0px" }),
  singleValue: (p: object) => ({ ...p, textAlign: "left" as const, marginTop: "-5px", marginLeft: "12px" }),
  indicatorsContainer: (p: object) => ({ ...p, height: "50px", display: "flex", alignItems: "center" }),
  menu: (p: object) => ({ ...p, textAlign: "left" as const }),
  option: (p: object) => ({ ...p, textAlign: "left" as const }),
};

const COLORS = { pending: "#F4C430", confirmed: "#2EAD65", cancelled: "#E04545" };
const PAYMENT_COLORS = ["#2EAD65", "#0088FE"];

// ── Types ─────────────────────────────────────────────────────────────────────
interface CountryOption { value: string; label: string; flag?: string; englishName?: string; }
interface CityOption   { value: string; label: string; }

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  title: string; message: string;
  onConfirm: () => void; onCancel: () => void;
  confirmLabel: string; cancelLabel: string; danger?: boolean;
}
const ConfirmDialog = ({ title, message, onConfirm, onCancel, confirmLabel, cancelLabel, danger }: ConfirmDialogProps) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-secondary">{title}</h3>
        <button onClick={onCancel} className="text-muted hover:text-secondary"><IoIosClose size={22} /></button>
      </div>
      <p className="mb-6 text-sm text-muted">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="lezada-button lezada-button--small border-muted text-muted hover:bg-muted hover:text-white">{cancelLabel}</button>
        <button onClick={onConfirm}
          className={`lezada-button lezada-button--small ${danger ? "border-red-400 text-red-500 hover:bg-red-500 hover:text-white" : ""}`}>
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const MyAccount = () => {
  const { t, currentLanguage } = useLocalization();
  const router = useRouter();
  const db = getDatabase();

  // Auth
  const [user, setUser]   = useState<User | null>(null);
  const [role, setRole]   = useState("guest");
  const [email, setEmail] = useState("");

  // Profile
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [displayName, setDisplayName] = useState("");
  const [address, setAddress]       = useState("");
  const [zipCode, setZipCode]       = useState("");
  const [phone, setPhone]           = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cvc, setCvc]               = useState("");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Country/city
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [selectedCity, setSelectedCity]       = useState<CityOption | null>(null);
  const [cityOptions, setCityOptions]         = useState<CityOption[]>([]);

  // Initial snapshot
  const [initialFirstName, setInitialFirstName]   = useState("");
  const [initialLastName, setInitialLastName]     = useState("");
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [initialAddress, setInitialAddress]       = useState("");
  const [initialPhone, setInitialPhone]           = useState("");
  const [initialZip, setInitialZip]               = useState("");
  const [initialCountry, setInitialCountry]       = useState<CountryOption | null>(null);
  const [initialCity, setInitialCity]             = useState<CityOption | null>(null);
  const [initialNameOnCard, setInitialNameOnCard] = useState("");
  const [initialCardNumber, setInitialCardNumber] = useState("");
  const [initialExpiration, setInitialExpiration] = useState("");
  const [initialCvc, setInitialCvc]               = useState("");
  const [initialLoaded, setInitialLoaded]         = useState(false);
  const [hasChanges, setHasChanges]               = useState(false);

  // UI state
  const [isLoading, setIsLoading]         = useState(false);
  const [isCanceling, setIsCanceling]     = useState(false);
  const [activeTab, setActiveTab]         = useState("dashboard");

  // Dialogs
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [pendingDeleteId, setPendingDeleteId]   = useState<string>("");
  const [showLogoutModal, setShowLogoutModal]   = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Data
  const [orders, setOrders]     = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Orders filters/pagination
  const [searchQuery, setSearchQuery]     = useState("");
  const [filterStatus, setFilterStatus]   = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [filterYear, setFilterYear]       = useState(new Date().getFullYear().toString());
  const [currentPage, setCurrentPage]     = useState(1);
  const [showFilters, setShowFilters]     = useState(false);
  const ordersPerPage = 6;

  // Download tab
  const [currentPageDown, setCurrentPageDown]                   = useState(1);
  const [downloadingOrderId, setDownloadingOrderId]             = useState<string | null>(null);
  const [selectedOrdersForDownload, setSelectedOrdersForDownload] = useState<string[]>([]);
  const [selectAllDownload, setSelectAllDownload]               = useState(false);
  const [downloadSearchQuery, setDownloadSearchQuery]           = useState("");
  const [downloadFilterPayment, setDownloadFilterPayment]       = useState("all");
  const [downloadFilterStatus, setDownloadFilterStatus]         = useState("all");
  const [showDownloadFilters, setShowDownloadFilters]           = useState(false);
  const [downloadHistory, setDownloadHistory]                   = useState<Record<string, { count: number; lastDownload: string }>>({});
  const [bulkDownloading, setBulkDownloading]                   = useState(false);
  const itemsPerPageDown = 6;

  // Payment tab
  const [currentPagePayment, setCurrentPagePayment] = useState(1);
  const itemsPerPagePayment = 6;
  const [dateRange, setDateRange] = useState("30days");

  // Users tab
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userFilterRole, setUserFilterRole]   = useState("all");
  const [currentPageUsers, setCurrentPageUsers] = useState(1);
  const [showUserFilters, setShowUserFilters] = useState(false);
  const usersPerPage = 6;

  // Newsletter
  const [subscriberStats, setSubscriberStats]     = useState<any>(null);
  const [broadcastSchedule, setBroadcastSchedule] = useState<any>(null);
  const [broadcastPeriod, setBroadcastPeriod]     = useState("weekly");
  const [broadcastSubject, setBroadcastSubject]   = useState("");
  const [broadcastSendTime, setBroadcastSendTime] = useState("12:00");
  const [broadcastLoading, setBroadcastLoading]   = useState(false);
  const [scheduleLoading, setScheduleLoading]     = useState(false);

  // Country options
  const countryOptions: CountryOption[] = Country.getAllCountries().map((c) => ({
    value: c.isoCode,
    label: c.name,
    flag: `https://flagcdn.com/24x18/${c.isoCode.toLowerCase()}.png`,
    englishName: c.name,
  }));

  // ── Helpers ──────────────────────────────────────────────────────────────
  const findCountryOption = (val: unknown): CountryOption | null => {
    if (!val) return null;
    if (typeof val === "object" && (val as any).value) {
      return countryOptions.find((c) => c.value === (val as any).value) ?? (val as CountryOption);
    }
    return countryOptions.find((c) => c.value === val || c.label === val || c.englishName === val) ?? null;
  };

  const findCityOption = (val: unknown, cities: CityOption[]): CityOption | null => {
    if (!val) return null;
    if (typeof val === "object" && (val as any).value) return cities.find((c) => c.value === (val as any).value) ?? (val as CityOption);
    return cities.find((c) => c.value === val) ?? { label: String(val), value: String(val) };
  };

  const buildCityOptions = (iso: string): CityOption[] => {
    try { return City.getCitiesOfCountry(iso)?.map((c) => ({ value: c.name, label: c.name })) ?? []; }
    catch { return []; }
  };

  const formatCardNumber = (v: string) => v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
  const formatExpiration = (v: string) => {
    const c = v.replace(/\D/g, "");
    if (!c.length) return "";
    if (c.length <= 2) return c;
    return c.slice(0, 2) + "/" + c.slice(2, 4);
  };

  // ── Derived lists ─────────────────────────────────────────────────────────
  const filteredOrders = orders
    .filter((o) => o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || (o as any).displayName?.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((o) => filterStatus === "all" || o.status === filterStatus)
    .filter((o) => filterPayment === "all" || o.paymentMethod === filterPayment)
    .filter((o) => { const [, , y] = (o.date || "--0").split("-"); return Number(y) === Number(filterYear); });

  const grandTotalInDisplayCurrency = filteredOrders.reduce((sum, o) => {
    const mk = parseFloat(String(o.totalMK || 0)), en = parseFloat(String(o.totalEN || 0));
    return currentLanguage === "mk" ? sum + (mk > 0 ? mk : en * RATE) : sum + (en > 0 ? en : mk / RATE);
  }, 0);

  const filteredOrdersForCharts = orders.filter((o) => {
    if (!o.date) return false;
    const [, , y] = o.date.split("-");
    return parseInt(y) === parseInt(filterYear);
  });

  const filteredOrdersForPayment = orders.filter((o) => {
    if (!o.date) return false;
    const [, , y] = o.date.split("-");
    return Number(y) === Number(filterYear);
  });

  const filteredOrdersForDownload = orders
    .filter((o) => { if (!o.date) return false; const [, , y] = o.date.split("-"); return Number(y) === Number(filterYear); })
    .filter((o) => !downloadSearchQuery || o.orderNumber?.toLowerCase().includes(downloadSearchQuery.toLowerCase()))
    .filter((o) => downloadFilterPayment === "all" || o.paymentMethod === downloadFilterPayment)
    .filter((o) => downloadFilterStatus === "all" || o.status === downloadFilterStatus);

  // Pagination
  const currentOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);
  const ordersOnCurrentPage = currentOrders.length;
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginate = (n: number) => setCurrentPage(n);

  const currentOrdersPayment = filteredOrdersForPayment.slice((currentPagePayment - 1) * itemsPerPagePayment, currentPagePayment * itemsPerPagePayment);
  const totalPagesPayment = Math.ceil(filteredOrdersForPayment.length / itemsPerPagePayment);
  const handlePageChangePayment = (n: number) => { if (n >= 1 && n <= totalPagesPayment) setCurrentPagePayment(n); };

  const currentOrdersDownload = filteredOrdersForDownload.slice((currentPageDown - 1) * itemsPerPageDown, currentPageDown * itemsPerPageDown);
  const totalPagesDownload = Math.ceil(filteredOrdersForDownload.length / itemsPerPageDown);
  const handlePageChangeDown = (n: number) => { if (n >= 1 && n <= totalPagesDownload) setCurrentPageDown(n); };

  // ── Analytics helpers ─────────────────────────────────────────────────────
  const formattedPaymentData = (() => {
    const acc: { name: string; value: number }[] = [];
    filteredOrdersForCharts.forEach((o) => {
      const method = o.paymentMethod || "other";
      const amount = currentLanguage === "mk"
        ? (o.totalMK || ((o.totalEN ?? 0) * RATE))
        : (o.totalEN || ((o.totalMK ?? 0) / RATE));
      const ex = acc.find((d) => d.name === method);
      if (ex) ex.value += amount;
      else acc.push({ name: method, value: amount });
    });
    return acc.map((e) => ({ ...e, name: e.name === "payment_bank" ? (currentLanguage === "mk" ? "Банка" : "Bank") : e.name === "payment_cash" ? (currentLanguage === "mk" ? "Готовина" : "Cash") : e.name }));
  })();

  const getMonthlyRevenue = (list: Order[], year: number) => {
    const labelsEn = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const labelsMk = ["Јан","Фев","Мар","Апр","Мај","Јун","Јул","Авг","Сеп","Окт","Ное","Дек"];
    const data = Array.from({ length: 12 }, (_, i) => ({ month: currentLanguage === "mk" ? labelsMk[i] : labelsEn[i], revenue: 0, orders: 0 }));
    list.forEach((o) => {
      if (!o.date) return;
      const parts = o.date.split("-");
      const d = parts[0].length === 4 ? new Date(o.date) : new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      if (isNaN(d.getTime()) || d.getFullYear() !== year) return;
      const idx = d.getMonth();
      const mk = parseFloat(String(o.totalMK || 0)), en = parseFloat(String(o.totalEN || 0));
      data[idx].revenue += currentLanguage === "mk" ? (mk > 0 ? mk : en * RATE) : (en > 0 ? en : mk / RATE);
      data[idx].orders += 1;
    });
    return data;
  };

  const getAverageOrderValue = (list: Order[]) => {
    if (!list?.length) return 0;
    const total = list.reduce((acc, o) => {
      const mk = parseFloat(String(o.totalMK || 0)), en = parseFloat(String(o.totalEN || 0));
      return currentLanguage === "mk" ? acc + (mk > 0 ? mk : en * RATE) : acc + (en > 0 ? en : mk / RATE);
    }, 0);
    return total / list.length;
  };

  const getOrderSuccessStats = (list: Order[]) => {
    const s = { total: list.length, pending: list.filter((o) => o.status === "pending").length, confirmed: list.filter((o) => o.status === "confirmed").length, cancelled: list.filter((o) => o.status === "cancelled").length, successRate: "0" };
    s.successRate = s.total > 0 ? ((s.confirmed / s.total) * 100).toFixed(1) : "0";
    return s;
  };

  const getDailyRevenue = (list: Order[], days = 30) => list.slice(0, days).map((o) => ({ date: o.date, revenue: currentLanguage === "mk" ? (o.totalMK ?? 0) : (o.totalEN ?? 0), orders: 1 }));
  const getYearlyRevenue = (list: Order[]) => [{ year: parseInt(filterYear), revenue: list.reduce((s, o) => s + (currentLanguage === "mk" ? (o.totalMK ?? 0) : (o.totalEN ?? 0)), 0), orders: list.length }];
  const getTopProducts = (list: Order[], limit = 5) => {
    const map: Record<string, { count: number; revenue: number }> = {};
    list.forEach((o) => o.products?.forEach((p) => {
      const name = typeof p.name === "object" ? (p.name[currentLanguage] ?? p.name.en) : String(p.name);
      if (!map[name]) map[name] = { count: 0, revenue: 0 };
      map[name].count += p.quantity || 1;
      map[name].revenue += parseFloat(String(currentLanguage === "mk" ? p.price?.mk : p.price?.en) || "0") * (p.quantity || 1);
    }));
    return Object.entries(map).map(([name, s]) => ({ name, ...s })).sort((a, b) => b.count - a.count).slice(0, limit);
  };
  const statusData = (list: Order[], year: string) => list.filter((o) => { const [,,y] = (o.date || "--0").split("-"); return Number(y) === Number(year); })
    .reduce((acc: any[], o) => {
      const ex = acc.find((d) => d.status === o.status);
      const mk = o.totalMK ?? 0, en = o.totalEN ?? 0;
      if (ex) { ex.count++; ex.mkd += mk; ex.eng += en; }
      else acc.push({ status: o.status, count: 1, mkd: mk, eng: en });
      return acc;
    }, []);

  // ── Download helpers ──────────────────────────────────────────────────────
  const trackDownload = (id: string) => setDownloadHistory((p) => ({ ...p, [id]: { count: (p[id]?.count || 0) + 1, lastDownload: new Date().toISOString() } }));

  const downloadPdf = async (order: Order) => {
    if (!order) return;
    setDownloadingOrderId(order.id);
    try {
      const isMK = currentLanguage === "mk";
      const resp = await fetch("/api/generate-pdf", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: { ...order, displayTotal: isMK ? order.totalMK : order.totalEN }, language: currentLanguage }),
      });
      if (!resp.ok) { const d = await resp.json().catch(() => ({})); throw new Error((d as any)?.error || `Server error ${resp.status}`); }
      const blob = await resp.blob();
      const prefix = order.paymentMethod === "payment_cash" ? (isMK ? "Потврда" : "Confirmation") : (isMK ? "Фактура" : "Invoice");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${prefix}-${order.orderNumber}.pdf`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      await logActivity({ username: user?.email ?? "", userId: user?.uid ?? "", action: "PDF_DOWNLOAD", details: `${prefix}-${order.orderNumber}.pdf` });
    } catch (err) { toast.error((err as Error).message || "Download failed"); }
    finally { setDownloadingOrderId(null); }
  };

  const downloadPdfEnhanced = async (order: Order) => { await downloadPdf(order); trackDownload(order.id); };

  const downloadBulkPdfs = async () => {
    if (!selectedOrdersForDownload.length) { toast.warning(t("no_orders_selected")); return; }
    setBulkDownloading(true);
    let success = 0, fail = 0;
    for (const id of selectedOrdersForDownload) {
      const o = filteredOrdersForDownload.find((x) => x.id === id);
      if (o) { try { await downloadPdf(o); trackDownload(o.id); success++; await new Promise((r) => setTimeout(r, 500)); } catch { fail++; } }
    }
    setBulkDownloading(false); setSelectedOrdersForDownload([]); setSelectAllDownload(false);
    if (success) { toast.success(`${t("successfully_downloaded")} ${success} ${t("invoices")}`); await logActivity({ username: user?.email ?? "", userId: user?.uid ?? "", action: "BULK_PDF_DOWNLOAD", details: `${success} PDF фајлови` }); }
    if (fail)    toast.error(`${t("failed_to_download")} ${fail} ${t("invoices")}`);
  };

  const toggleOrderSelection = (id: string) => setSelectedOrdersForDownload((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleSelectAll = () => { if (selectAllDownload) setSelectedOrdersForDownload([]); else setSelectedOrdersForDownload(filteredOrdersForDownload.map((o) => o.id)); setSelectAllDownload(!selectAllDownload); };

  const downloadStats = { total: filteredOrdersForDownload.length, withHistory: Object.keys(downloadHistory).filter((id) => filteredOrdersForDownload.some((o) => o.id === id)).length, totalDownloads: Object.values(downloadHistory).reduce((s, h) => s + h.count, 0), avgDownloadsPerOrder: Object.keys(downloadHistory).length > 0 ? (Object.values(downloadHistory).reduce((s, h) => s + h.count, 0) / Object.keys(downloadHistory).length).toFixed(1) : 0 };

  // ── Order CRUD ────────────────────────────────────────────────────────────
  const deleteOrder = async (orderId: string) => {
    if (!user) { toast.error(t("delete_error")); return; }
    const uid = role === "admin" ? orders.find((o) => o.id === orderId)?.userId ?? "" : user.uid;
    try {
      await remove(ref(db, `orders/${uid}/${orderId}`));
      setOrders((p) => p.filter((o) => o.id !== orderId));
      await logActivity({ username: user.email ?? "", userId: user.uid, action: "ORDER_DELETED", details: `Нарачка ID: ${orderId}` });
      toast.success(t("order_deleted"));
    } catch (err) { toast.error(`${t("delete_error")}: ${(err as Error).message}`); }
  };

  const viewOrder = (orderId: string, orderUserId: string) => {
    const uid = role === "admin" ? orderUserId || orders.find((o) => o.id === orderId)?.userId : user?.uid;
    if (!uid) { toast.error(t("view_error") || "Could not determine order owner"); return; }
    router.push({ pathname: "/other/cart-details", query: { viewOrder: "true", userId: uid, orderId } });
  };

  const updateOrder = async (orderId: string, _userId: string, newStatus: string) => {
    try {
      const o = orders.find((x) => x.id === orderId);
      if (!o) throw new Error("Order not found");
      await update(ref(db, `orders/${o.userId}/${orderId}`), { status: newStatus });
      setOrders((p) => p.map((x) => x.id === orderId ? { ...x, status: newStatus as Order["status"] } : x));
      await logActivity({ username: user?.email ?? "", userId: user?.uid ?? "", action: "ORDER_STATUS", details: `Нарачка #${o.orderNumber} → ${newStatus}` });
      const lang = (o as any).language || currentLanguage;
      await fetch("/api/send-order-status", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: (o as any).email, orderId, status: newStatus, orderNumber: o.orderNumber, language: lang, products: o.products }),
      });
    } catch (err) { console.error("updateOrder error:", err); }
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    const userRef = ref(db, `users/${user.uid}`);
    const billingInfo = { address, city: selectedCity?.label || "", country: selectedCountry ? { label: selectedCountry.label, value: selectedCountry.value, flag: selectedCountry.flag } : null, zipCode, phone, nameOnCard, cardNumber, expiration, cvc };
    try {
      if (newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) { toast.error(t("password_mismatch")); setIsLoading(false); return; }
        if (newPassword.length < 6) { toast.error(t("password_strength")); setIsLoading(false); return; }
        await updatePassword(user, newPassword);
        await set(userRef, { firstName, lastName, displayName, email, password: newPassword, billingInfo, role });
        await logActivity({ username: user.email ?? "", userId: user.uid, action: "PASSWORD_CHANGED" });
        toast.success(t("password_changed_success"));
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        await update(userRef, { firstName, lastName, displayName, email, billingInfo, role });
        await logActivity({ username: user.email ?? "", userId: user.uid, action: "PROFILE_UPDATED", details: `${firstName} ${lastName}`.trim() });
      }
      toast.success(t("profile_updated"));
      setTimeout(() => router.reload(), 1500);
    } catch (err) { toast.error((err as Error).message); }
    finally { setIsLoading(false); }
  };

  const handleCancel = () => {
    if (!initialLoaded) return;
    setFirstName(initialFirstName); setLastName(initialLastName); setDisplayName(initialDisplayName);
    setAddress(initialAddress); setZipCode(initialZip); setPhone(initialPhone);
    setNameOnCard(initialNameOnCard); setCardNumber(initialCardNumber); setExpiration(initialExpiration); setCvc(initialCvc);
    const c = initialCountry ? (typeof initialCountry === "object" ? countryOptions.find((x) => x.value === initialCountry.value) || initialCountry : findCountryOption(initialCountry)) : null;
    setSelectedCountry(c ?? null);
    if (c?.value) { const cities = buildCityOptions(c.value); setCityOptions(cities); setSelectedCity(findCityOption(initialCity, cities)); }
    else { setCityOptions([]); setSelectedCity(null); }
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setHasChanges(false);
  };

  // ── Change detection ──────────────────────────────────────────────────────
  const checkForChanges = useCallback(() => {
    if (!initialLoaded) { setHasChanges(false); return; }
    setHasChanges(firstName !== initialFirstName || lastName !== initialLastName || displayName !== initialDisplayName || address !== initialAddress || phone !== initialPhone || zipCode !== initialZip || selectedCountry?.value !== initialCountry?.value || selectedCity?.value !== initialCity?.value || nameOnCard !== initialNameOnCard || cardNumber !== initialCardNumber || expiration !== initialExpiration || cvc !== initialCvc || !!currentPassword || !!newPassword || !!confirmPassword);
  }, [firstName, lastName, displayName, address, phone, zipCode, selectedCountry, selectedCity, nameOnCard, cardNumber, expiration, cvc, newPassword, confirmPassword, currentPassword, initialFirstName, initialLastName, initialDisplayName, initialAddress, initialPhone, initialZip, initialCountry, initialCity, initialNameOnCard, initialCardNumber, initialExpiration, initialCvc, initialLoaded]);

  // ── Newsletter ────────────────────────────────────────────────────────────
  const fetchSchedule = async () => {
    setScheduleLoading(true);
    try {
      const res = await fetch("/api/broadcast-schedule", { headers: { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" } });
      const d = await res.json();
      if (d) { setBroadcastSchedule(d); setBroadcastPeriod(d.period); setBroadcastSubject(d.subject); setBroadcastSendTime(d.sendTime || "12:00"); }
    } finally { setScheduleLoading(false); }
  };

  const fetchSubscriberStats = async () => {
    try {
      const res = await fetch("/api/get-subscribers", { headers: { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" } });
      if (res.ok) setSubscriberStats(await res.json());
    } catch {}
  };

  const handleSaveSchedule = async () => {
    if (!broadcastSubject.trim()) { toast.error(t("subject_required")); return; }
    setBroadcastLoading(true);
    try {
      const res = await fetch("/api/broadcast-schedule", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" }, body: JSON.stringify({ subject: broadcastSubject, period: broadcastPeriod, sendTime: broadcastSendTime }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setBroadcastSchedule((p: any) => ({ ...p, active: true, nextSendAt: d.nextSendAt }));
      await logActivity({ username: user?.email ?? "", userId: user?.uid ?? "", action: "SCHEDULE_SAVED", details: `Период: ${broadcastPeriod} | Тема: ${broadcastSubject}` });
      toast.success(t("schedule_saved"));
    } catch (err) { toast.error((err as Error).message); }
    finally { setBroadcastLoading(false); }
  };

  const handleToggleSchedule = async () => {
    const newActive = !broadcastSchedule?.active;
    try {
      await fetch("/api/broadcast-schedule", { method: "PATCH", headers: { "Content-Type": "application/json", "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" }, body: JSON.stringify({ active: newActive }) });
      setBroadcastSchedule((p: any) => ({ ...p, active: newActive }));
      await logActivity({ username: user?.email ?? "", userId: user?.uid ?? "", action: "SCHEDULE_TOGGLED", details: newActive ? "Активиран" : "Паузиран" });
      toast.info(newActive ? t("schedule_resumed") : t("schedule_paused"));
    } catch (err) { toast.error((err as Error).message); }
  };

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fb) => {
      if (!fb) { setUser(null); router.push("/other/login-register"); return; }
      setUser(fb); setEmail(fb.email ?? "");
      try {
        const snap = await get(ref(db, `users/${fb.uid}`));
        if (!snap.exists()) return;
        const d = snap.val();
        setFirstName(d.firstName || ""); setLastName(d.lastName || ""); setDisplayName(d.displayName || "");
        setAddress(d.billingInfo?.address || ""); setZipCode(d.billingInfo?.zipCode || ""); setPhone(d.billingInfo?.phone || "");
        setCurrentPassword(d.password || ""); setRole(d.role || "guest");
        setNameOnCard(d.billingInfo?.nameOnCard || ""); setCardNumber(d.billingInfo?.cardNumber || ""); setExpiration(d.billingInfo?.expiration || ""); setCvc(d.billingInfo?.cvc || "");
        const co = findCountryOption(d.billingInfo?.country ?? null);
        setSelectedCountry(co); setInitialCountry(co);
        if (co?.value) { const cities = buildCityOptions(co.value); setCityOptions(cities); const cy = findCityOption(d.billingInfo?.city ?? null, cities); setSelectedCity(cy); setInitialCity(cy); }
        setInitialFirstName(d.firstName || ""); setInitialLastName(d.lastName || ""); setInitialDisplayName(d.displayName || "");
        setInitialAddress(d.billingInfo?.address || ""); setInitialPhone(d.billingInfo?.phone || ""); setInitialZip(d.billingInfo?.zipCode || "");
        setInitialNameOnCard(d.billingInfo?.nameOnCard || ""); setInitialCardNumber(d.billingInfo?.cardNumber || ""); setInitialExpiration(d.billingInfo?.expiration || ""); setInitialCvc(d.billingInfo?.cvc || "");
      } catch (err) { console.error(err); }
      finally { setInitialLoaded(true); }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedCountry?.value) { setCityOptions([]); setSelectedCity(null); return; }
    const cities = buildCityOptions(selectedCountry.value);
    setCityOptions(cities);
    if (selectedCity) { const ex = cities.find((c) => c.value === selectedCity.value || c.label === selectedCity.label); setSelectedCity(ex || null); }
  }, [selectedCountry, currentLanguage]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const ordersRef = role === "admin" ? ref(db, "orders") : ref(db, `orders/${user.uid}`);
        const snap = await get(ordersRef);
        if (!snap.exists()) { setOrders([]); return; }
        const raw = snap.val();
        let usersData: Record<string, any> = {};
        if (role === "admin") { const us = await get(ref(db, "users")); usersData = us.exists() ? us.val() : {}; }
        const list: Order[] = [];
        const mapOrder = (id: string, o: any, uid: string): Order => {
          const mk = parseAmount(o?.total, "mk") || getLocalizedTotal(o, "mk");
          const en = parseAmount(o?.total, "en") || getLocalizedTotal(o, "en");
          return { id, userId: uid, orderNumber: o.orderNumber, date: o.date || "", status: o.status, totalMK: mk, totalEN: en, paymentMethod: o.paymentMethod || "", products: o.products || [], createdAt: o.createdAt || 0, reservationDate: o.reservationDate, reservationTime: o.reservationTime, coupon: o.coupon || null, paymentText: o.paymentText || "", customerPhone: o.customer?.phone || "", customerAddress: o.customer?.address || "", customerState: o.customer?.state || "", customerCity: o.customer?.city || "", customerPostalCode: o.customer?.postalCode || "", discountMK: parseFloat(o.discount?.mk || 0), discountEN: parseFloat(o.discount?.en || 0), displayName: usersData[uid]?.displayName || displayName || `${firstName} ${lastName}`.trim() || "", email: usersData[uid]?.email || o.customer?.email || email || "", subtotalMK: parseAmount(o?.subtotal, "mk"), subtotalEN: parseAmount(o?.subtotal, "en"), currency: "BOTH", language: o.language || currentLanguage, displayTotal: currentLanguage === "mk" ? mk : en };
        };
        if (role === "admin") Object.entries(raw).forEach(([uid, uo]) => Object.entries(uo as Record<string, any>).forEach(([id, o]) => list.push(mapOrder(id, o, uid))));
        else Object.entries(raw).forEach(([id, o]) => list.push(mapOrder(id, o, user.uid)));
        list.sort((a, b) => (a.status === "pending" && b.status !== "pending" ? -1 : b.status === "pending" && a.status !== "pending" ? 1 : (b.createdAt || 0) - (a.createdAt || 0)));
        setOrders(list);
      } catch (err) { console.error("fetchOrders error:", err); }
    };
    fetchOrders();
  }, [user, role, currentLanguage]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || role !== "admin") return;
      try {
        const snap = await get(ref(db, "users"));
        if (!snap.exists()) { setAllUsers([]); return; }
        setAllUsers(Object.entries(snap.val() as Record<string, any>).map(([uid, u]) => ({ uid, firstName: u.firstName || "", lastName: u.lastName || "", displayName: u.displayName || "", email: u.email || "", role: u.role || "guest", phone: u.billingInfo?.phone || "", address: u.billingInfo?.address || "", city: u.billingInfo?.city || "", country: u.billingInfo?.country?.label || "", zipCode: u.billingInfo?.zipCode || "", coupon: u.coupon || "" })));
      } catch {}
    };
    fetchUsers();
  }, [user, role]);

  useEffect(() => { checkForChanges(); }, [checkForChanges]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      sessionStorage.removeItem(`logged_in_${user?.uid}`);
      await signOut(auth);
      setUser(null);
      toast.info(t("logout_success"));
      setTimeout(() => router.push("/other/login-register"), 2000);
    } catch (err) { toast.error((err as Error).message); }
    finally { setIsLoading(false); }
  };

  // ── Tabs config ───────────────────────────────────────────────────────────
  const tabs = [
    { key: "dashboard",      label: t("dashboard"),       always: true },
    { key: "users",          label: t("users"),           admin: true },
    { key: "logs",           label: t("logs"),            admin: true },
    { key: "products",       label: t("products"),        admin: true },
    { key: "orders",         label: t("orders"),          always: true },
    { key: "download",       label: t("download"),        always: true },
    { key: "payment",        label: t("payment"),         always: true },
    { key: "accountDetails", label: t("account_details"), always: true },
  ].filter((tab) => tab.always || (tab.admin && role === "admin"));

  const analyticsProps = { formatTotal, parseAmount, conversionRate: RATE, currentLanguage, getDailyRevenue, getMonthlyRevenue, getYearlyRevenue, getTopProducts, getAverageOrderValue, getOrderSuccessStats, formattedPaymentData, statusData, COLORS, PAYMENT_COLORS, filteredOrdersForCharts, filterYear, setFilterYear, dateRange, setDateRange };

  return (
    <LayoutTwo>
      <BreadcrumbOne pageTitle={t("my_account")} backgroundImage="/assets/images/backgrounds/breadcrumb-bg-2.webp">
        <ul className="breadcrumb__list justify-center">
          <li><Link href="/home/trending" aria-label={t("home")}><FaHome size={16} /></Link></li>
          <li>{t("my_account")}</li>
        </ul>
      </BreadcrumbOne>

      <div className="py-20">
        <div className="container-wide">
          {/* Tab nav */}
          <div className="my-account-area__navigation mb-10 overflow-x-auto">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={activeTab === tab.key ? "active" : ""}>{tab.label}</button>
            ))}
          </div>

          {/* Tab content */}
          <div>
            {activeTab === "dashboard" && <DashboardTab t={t} role={role} displayName={displayName} email={email} orders={orders} allUsers={allUsers} isLoading={isLoading} currentLanguage={currentLanguage} formatTotal={formatTotal} parseAmount={parseAmount} conversionRate={RATE} userId={user?.uid} setShowLogoutModal={setShowLogoutModal} setShowBroadcastModal={setShowBroadcastModal} fetchSubscriberStats={fetchSubscriberStats} fetchSchedule={fetchSchedule} />}
            {activeTab === "users" && role === "admin" && <UsersTab t={t} allUsers={allUsers} userSearchQuery={userSearchQuery} setUserSearchQuery={setUserSearchQuery} userFilterRole={userFilterRole} setUserFilterRole={setUserFilterRole} currentPageUsers={currentPageUsers} setCurrentPageUsers={setCurrentPageUsers} usersPerPage={usersPerPage} showUserFilters={showUserFilters} setShowUserFilters={setShowUserFilters} />}
            {activeTab === "logs" && role === "admin" && <LogsTab />}
            {activeTab === "products" && role === "admin" && <ProductsTab t={t} role={role} currentLanguage={currentLanguage} user={user} />}
            {activeTab === "orders" && <OrdersTab t={t} role={role} orders={orders} filteredOrders={filteredOrders} currentOrders={currentOrders} totalPages={totalPages} currentPage={currentPage} paginate={paginate} ordersOnCurrentPage={ordersOnCurrentPage} grandTotalInDisplayCurrency={grandTotalInDisplayCurrency} showFilters={showFilters} setShowFilters={setShowFilters} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} filterPayment={filterPayment} setFilterPayment={setFilterPayment} setCurrentPage={setCurrentPage} updateOrder={updateOrder} viewOrder={viewOrder} setPendingDeleteId={setPendingDeleteId} setShowDeleteModal={setShowDeleteModal} {...analyticsProps} />}
            {activeTab === "download" && <DownloadTab t={t} role={role} orders={orders} currentLanguage={currentLanguage} downloadingOrderId={downloadingOrderId} selectedOrdersForDownload={selectedOrdersForDownload} selectAllDownload={selectAllDownload} downloadSearchQuery={downloadSearchQuery} setDownloadSearchQuery={setDownloadSearchQuery} downloadFilterPayment={downloadFilterPayment} setDownloadFilterPayment={setDownloadFilterPayment} downloadFilterStatus={downloadFilterStatus} setDownloadFilterStatus={setDownloadFilterStatus} showDownloadFilters={showDownloadFilters} setShowDownloadFilters={setShowDownloadFilters} filteredOrdersForDownload={filteredOrdersForDownload} currentOrdersDownload={currentOrdersDownload} totalPagesDownload={totalPagesDownload} currentPageDown={currentPageDown} handlePageChangeDown={handlePageChangeDown} downloadStats={downloadStats} downloadPdfEnhanced={downloadPdfEnhanced} toggleOrderSelection={toggleOrderSelection} toggleSelectAll={toggleSelectAll} bulkDownloading={bulkDownloading} downloadBulkPdfs={downloadBulkPdfs} setSelectedOrdersForDownload={setSelectedOrdersForDownload} setSelectAllDownload={setSelectAllDownload} setCurrentPageDown={setCurrentPageDown} />}
            {activeTab === "payment" && <PaymentTab t={t} role={role} currentLanguage={currentLanguage} filteredOrdersForPayment={filteredOrdersForPayment} filteredOrdersForCharts={filteredOrdersForCharts} currentOrdersPayment={currentOrdersPayment} totalPagesPayment={totalPagesPayment} currentPagePayment={currentPagePayment} handlePageChangePayment={handlePageChangePayment} formatTotal={formatTotal} parseAmount={parseAmount} conversionRate={RATE} filterYear={filterYear} setFilterYear={setFilterYear} formattedPaymentData={formattedPaymentData} getMonthlyRevenue={getMonthlyRevenue} getAverageOrderValue={getAverageOrderValue} PAYMENT_COLORS={PAYMENT_COLORS} />}
            {activeTab === "accountDetails" && <AccountDetailsTab t={t} user={user} firstName={firstName} setFirstName={setFirstName} lastName={lastName} setLastName={setLastName} displayName={displayName} setDisplayName={setDisplayName} email={email} address={address} setAddress={setAddress} zipCode={zipCode} setZipCode={setZipCode} phone={phone} setPhone={setPhone} currentPassword={currentPassword} setCurrentPassword={setCurrentPassword} newPassword={newPassword} setNewPassword={setNewPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} isLoading={isLoading} selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry as any} selectedCity={selectedCity} setSelectedCity={setSelectedCity as any} cityOptions={cityOptions} nameOnCard={nameOnCard} setNameOnCard={setNameOnCard} cardNumber={cardNumber} setCardNumber={setCardNumber} expiration={expiration} setExpiration={setExpiration} cvc={cvc} setCvc={setCvc} hasChanges={hasChanges} initialLoaded={initialLoaded} isCanceling={isCanceling} setIsCanceling={setIsCanceling} handleSave={handleSave} handleCancel={handleCancel} countryOptions={countryOptions} customStyles={customStyles} showCurrentPassword={showCurrentPassword} toggleCurrentPasswordVisibility={() => setShowCurrentPassword((v) => !v)} showNewPassword={showNewPassword} toggleNewPasswordVisibility={() => setShowNewPassword((v) => !v)} showConfirmPassword={showConfirmPassword} toggleConfirmPasswordVisibility={() => setShowConfirmPassword((v) => !v)} formatCardNumber={formatCardNumber} formatExpiration={formatExpiration} />}
          </div>
        </div>
      </div>

      {/* Delete order dialog */}
      {showDeleteModal && <ConfirmDialog title={t("confirm_deletion")} message={t("are_you_sure_delete_order")} onConfirm={() => { deleteOrder(pendingDeleteId); setShowDeleteModal(false); setCurrentPage(1); }} onCancel={() => setShowDeleteModal(false)} confirmLabel={t("yes_delete")} cancelLabel={t("cancel")} danger />}

      {/* Logout dialog */}
      {showLogoutModal && <ConfirmDialog title={t("confirm_logout")} message={t("are_you_sure_logout")} onConfirm={() => { handleLogout(); setShowLogoutModal(false); }} onCancel={() => setShowLogoutModal(false)} confirmLabel={t("yes_logout")} cancelLabel={t("cancel")} danger />}

      {/* Newsletter modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16">
          <div className="w-full max-w-2xl rounded-sm bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h3 className="text-sm font-semibold text-secondary">{t("newsletter_schedule")}</h3>
              <button onClick={() => setShowBroadcastModal(false)} className="text-muted hover:text-secondary"><IoIosClose size={22} /></button>
            </div>
            <div className="space-y-5 p-5">
              {broadcastSchedule && (
                <div className={`flex items-center justify-between rounded-sm p-3 ${broadcastSchedule.active ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"}`}>
                  <div>
                    <p className="text-sm font-semibold">{broadcastSchedule.active ? t("schedule_active") : t("schedule_paused")}</p>
                    {broadcastSchedule.nextSendAt && <p className="text-xs opacity-70">{t("next_send")}: {new Date(broadcastSchedule.nextSendAt).toLocaleString()}</p>}
                  </div>
                  <button onClick={handleToggleSchedule} className="lezada-button lezada-button--small">{broadcastSchedule.active ? t("pause") : t("resume")}</button>
                </div>
              )}
              {subscriberStats && <div className="flex items-center justify-between rounded-sm bg-blue-50 p-3 text-sm text-blue-700"><span>{t("active_subscribers")}</span><span className="font-bold">{subscriberStats.total}</span></div>}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[{ value: "daily", label: t("daily") }, { value: "weekly", label: t("weekly") }, { value: "monthly", label: t("monthly") }, { value: "3months", label: t("quarterly") }].map((opt) => (
                  <button key={opt.value} onClick={() => setBroadcastPeriod(opt.value)}
                    className={`rounded-sm border p-3 text-xs transition-colors ${broadcastPeriod === opt.value ? "border-secondary bg-secondary text-white" : "border-border text-muted hover:border-secondary"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-secondary">{t("subject")}</label>
                <input type="text" placeholder={t("enter_subject")} value={broadcastSubject} onChange={(e) => setBroadcastSubject(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-border p-5">
              <button onClick={() => setShowBroadcastModal(false)} className="lezada-button lezada-button--small border-muted text-muted hover:bg-muted hover:text-white">{t("cancel")}</button>
              <button onClick={handleSaveSchedule} disabled={broadcastLoading || !broadcastSubject.trim()} className="lezada-button lezada-button--small">
                {broadcastLoading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : t("save_schedule")}
              </button>
            </div>
          </div>
        </div>
      )}
    </LayoutTwo>
  );
};

export default MyAccount;
