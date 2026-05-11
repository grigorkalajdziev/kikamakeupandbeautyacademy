import { Libre_Baskerville, PT_Serif } from "next/font/google";
import { Fragment, useEffect, ReactNode } from "react";
import App, { AppProps, AppContext } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import withReduxStore, { WithReduxProps } from "../lib/with-redux-store";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "sonner";
import { fetchProducts } from "../redux/slices/productSlice";
import "../styles/globals.css";
import { LocalizationProvider, useLocalization } from "../context/LocalizationContext";
import HeaderTop from "../components/Header/HeaderTop";
import CookieConsent from "../components/Cookies/CookieConsent";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./api/register";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { AppStore } from "../redux/store";

// ── Fonts ──────────────────────────────────────────────────────────────────────
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"], weight: ["400", "700"], display: "swap",
  variable: "--font-libre-baskerville",
});
const ptSerif = PT_Serif({
  subsets: ["latin"], weight: ["400", "700"], display: "swap",
  variable: "--font-pt-serif",
});

// ── JSON-LD ────────────────────────────────────────────────────────────────────
const beautySchema = {
  "@context": "https://schema.org", "@type": "BeautyBusiness",
  name: "Кика - Академија за шминка и убавина",
  url: "https://www.kikamakeupandbeautyacademy.com",
  description: "Кика Академија нуди професионални курсеви за шминкање, педикир и третмани за убавина.",
  address: { "@type": "PostalAddress", addressCountry: "MK" },
  sameAs: ["https://www.facebook.com/kristina.iloski", "https://www.instagram.com/kikamakeup_and_beautyacademy/"],
};
const websiteSchema = {
  "@context": "https://schema.org", "@type": "WebSite",
  name: "Кика - Академија за шминка и убавина",
  url: "https://www.kikamakeupandbeautyacademy.com/",
};

// ── Sub-components ─────────────────────────────────────────────────────────────
function FontSwitcher({ children }: { children: ReactNode }) {
  const { currentLanguage } = useLocalization();
  return <div className={currentLanguage === "en" ? libreBaskerville.className : ptSerif.className}>{children}</div>;
}

function SeoHead() {
  const router = useRouter();
  const canonical = `https://www.kikamakeupandbeautyacademy.com${router.asPath.split("?")[0]}`;
  const title = "Кика - Академија за шминка и убавина";
  const desc  = "Кика Академија нуди професионални курсеви за шминкање, педикир и третмани за убавина.";
  const ogImg = "https://www.kikamakeupandbeautyacademy.com/og-image.jpg";

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <link rel="icon" href="/favicon.png" />
      <link rel="preload" as="image" href="/assets/images/hero-slider/hero-slider-two/1.webp" type="image/webp" />
      <link rel="canonical" href={canonical} />
      <meta property="og:type"        content="website" />
      <meta property="og:title"       content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:image"       content={ogImg} />
      <meta property="og:url"         content={canonical} />
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image"       content={ogImg} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(beautySchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
    </Head>
  );
}

function SessionHandler() {
  const router = useRouter();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => {});
    return () => unsub();
  }, [router]);
  return null;
}

// ── App class ──────────────────────────────────────────────────────────────────
type MyAppProps = AppProps & WithReduxProps;

class MyApp extends App<MyAppProps> {
  private persistor: ReturnType<typeof persistStore>;

  constructor(props: MyAppProps) {
    super(props);
    this.persistor = persistStore(props.reduxStore as unknown as Parameters<typeof persistStore>[0]);
    props.reduxStore.dispatch(fetchProducts() as unknown as Parameters<AppStore["dispatch"]>[0]);
  }

  render() {
    const { Component, pageProps, reduxStore } = this.props;
    return (
      <Fragment>
        <div className={`${libreBaskerville.variable} ${ptSerif.variable}`}>
          <Provider store={reduxStore}>
            <PersistGate loading={null} persistor={this.persistor}>
              <LocalizationProvider>
                <FontSwitcher>
                  <SeoHead />
                  <SessionHandler />
                  <HeaderTop />
                  <CookieConsent />
                  <Component {...pageProps} />
                  <Toaster position="bottom-left" richColors closeButton />
                  <Analytics />
                  <SpeedInsights />
                </FontSwitcher>
              </LocalizationProvider>
            </PersistGate>
          </Provider>
        </div>
      </Fragment>
    );
  }

  static async getInitialProps(appContext: AppContext) {
    return App.getInitialProps(appContext);
  }
}

export default withReduxStore(MyApp);
