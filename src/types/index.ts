// ─── Localization ─────────────────────────────────────────────────────────────
export type Lang = "en" | "mk";

export interface LocalizationCtx {
  currentLanguage: Lang;
  changeLanguage: (lang: Lang) => void;
  t: (key: string) => string;
  translationsReady: boolean;
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface VariationSize {
  name: string;
  stock: number;
}
export interface Variation {
  color: string;
  colorCode?: string;
  size: VariationSize[];
}

export interface LocalizedString {
  en: string;
  mk: string;
  [key: string]: string;
}

export interface LocalizedPrice {
  en: number;
  mk: number;
}

export interface Product {
  id: string;
  slug?: string;
  name: LocalizedString;
  price: LocalizedPrice;
  discount?: number;
  rating?: number;
  saleCount?: number;
  new?: boolean;
  stock?: number;
  category?: string[];
  tag?: string[];
  thumbImage?: string[];
  image?: string[];
  shortDescription?: LocalizedString;
  fullDescription?: LocalizedString;
  variation?: Variation[];
  affiliateLink?: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem extends Product {
  quantity: number;
  cartItemId: string;
  selectedProductColor?: string | null;
  selectedProductSize?: string | null;
}

// ─── Redux state ──────────────────────────────────────────────────────────────
export interface RootState {
  productData: Product[];
  cartData: CartItem[];
  wishlistData: Product[];
  compareData: Product[];
}

// ─── Order ────────────────────────────────────────────────────────────────────
export interface OrderProduct {
  id: string;
  name: LocalizedString;
  price: LocalizedPrice;
  quantity: number;
  discount?: number;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  date: string;
  status: "pending" | "confirmed" | "cancelled";
  products: OrderProduct[];
  paymentMethod: string;
  paymentText?: string;
  totalMK: number;
  totalEN: number;
  subtotalMK?: number;
  subtotalEN?: number;
  discountMK?: number;
  discountEN?: number;
  reservationDate?: string;
  reservationTime?: string;
  displayName?: string;
  email?: string;
  language?: string;
  coupon?: { code: string; discount: number } | null;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerPostalCode?: string;
  currency?: string;
  createdAt?: number;
  displayTotal?: number;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface BillingInfo {
  address?: string;
  city?: string;
  phone?: string;
  zipCode?: string;
  country?: { label: string; value: string; flag?: string } | null;
  nameOnCard?: string;
  cardNumber?: string;
  expiration?: string;
  cvc?: string;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role?: "guest" | "admin";
  billingInfo?: BillingInfo;
  coupon?: string;
  password?: string;
}

// ─── Slider / Blog / Category ─────────────────────────────────────────────────
export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  bgcolor?: string;
  url: string;
}

export interface BlogPost {
  id: number;
  title: LocalizedString;
  date: LocalizedString;
  text: LocalizedString;
  image: string;
  url: string;
}

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface Testimonial {
  id: number;
  name: string;
  review: string;
  rating: number;
  image?: string;
}

// ─── Toast (Sonner) ───────────────────────────────────────────────────────────
export type ToastFn = {
  (message: string): void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
};

// ─── Coupon ───────────────────────────────────────────────────────────────────
export interface Coupon {
  code: string;
  discount: number;
}
