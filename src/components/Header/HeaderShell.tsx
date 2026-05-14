import { useState, useEffect, Fragment, ReactNode } from "react";
import Link from "next/link";
import { connect } from "react-redux";
import { IoIosSearch, IoIosHeartEmpty, IoIosCart, IoIosMenu } from "react-icons/io";
import Navigation from "./elements/Navigation";
import AboutOverlay from "./elements/AboutOverlay";
import SearchOverlay from "./elements/SearchOverlay";
import CartOverlay from "./elements/CartOverlay";
import WishlistOverlay from "./elements/WishlistOverlay";
import MobileMenu from "./elements/MobileMenu";
import type { RootState, CartItem, Product } from "../../types";

interface HeaderShellProps {
  aboutOverlay?: boolean;
  cartItems: CartItem[];
  wishlistItems: Product[];
}

const HeaderShell = ({ aboutOverlay = true, cartItems, wishlistItems }: HeaderShellProps) => {
  const [scroll, setScroll] = useState(0);
  const [headerTop, setHeaderTop] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const header = document.querySelector("header") as HTMLElement;
    if (!header) return;
    setHeaderTop(header.offsetTop);
    setHeaderHeight(header.offsetHeight);
    const onScroll = () => setScroll(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const open = (fn: (v: boolean) => void) => {
    fn(true);
    document.body.classList.add("overflow-hidden");
  };

  const isScrolled = scroll > headerTop;

  return (
    <Fragment>
      <header
        className={`z-50 w-full transition-all duration-300 ${isScrolled ? "fixed top-0 shadow-sm" : "relative"}`}
        style={{
          backgroundColor: isScrolled ? "rgba(255,255,255,0.65)" : "transparent",
          backdropFilter: isScrolled ? "blur(15px)" : "none",
          WebkitBackdropFilter: isScrolled ? "blur(15px)" : "none",
        }}
      >
        <div className="container-wide">
          <div className="relative flex items-center justify-between py-4 lg:py-0">
            {/* Logo */}
            <div className="flex items-center gap-3 pr-4">
              {aboutOverlay && (
                <button onClick={() => open(setAboutOpen)}
                  className="hidden lg:block text-secondary hover:text-primary transition-colors" aria-label="Menu">
                  <IoIosMenu className="text-2xl" />
                </button>
              )}
              <Link href="/home/trending">
                <img src="/assets/images/logo.svg" className="h-10 w-auto" alt="Kika Academy" />
              </Link>
            </div>

            {/* Nav desktop */}
            
              <Navigation />
           
            {/* Icons */}
            <div className="pl-4">
              {/* Desktop */}
              <ul className="hidden items-center gap-5 lg:flex">
                <li>
                  <button onClick={() => open(setSearchOpen)} className="text-secondary hover:text-primary transition-colors" aria-label="Search">
                    <IoIosSearch className="text-xl" />
                  </button>
                </li>
                <li>
                  <button onClick={() => open(setWishlistOpen)} className="relative text-secondary hover:text-primary transition-colors" aria-label="Wishlist">
                    <IoIosHeartEmpty className="text-xl" />
                    {wishlistItems.length > 0 && <span className="count-badge">{wishlistItems.length}</span>}
                  </button>
                </li>
                <li>
                  <button onClick={() => open(setCartOpen)} className="relative text-secondary hover:text-primary transition-colors" aria-label="Cart">
                    <IoIosCart className="text-xl" />
                    {cartItems.length > 0 && <span className="count-badge">{cartItems.length}</span>}
                  </button>
                </li>
              </ul>

              {/* Mobile */}
              <ul className="flex items-center gap-4 lg:hidden">
                <li>
                  <Link href="/other/wishlist" className="relative text-secondary hover:text-primary">
                    <IoIosHeartEmpty className="text-xl" />
                    {wishlistItems.length > 0 && <span className="count-badge">{wishlistItems.length}</span>}
                  </Link>
                </li>
                <li>
                  <Link href="/other/cart" className="relative text-secondary hover:text-primary">
                    <IoIosCart className="text-xl" />
                    {cartItems.length > 0 && <span className="count-badge">{cartItems.length}</span>}
                  </Link>
                </li>
                <li>
                  <button onClick={() => setMobileOpen(true)} className="text-secondary hover:text-primary" aria-label="Open menu">
                    <IoIosMenu className="text-2xl" />
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      {aboutOverlay && <AboutOverlay activeStatus={aboutOpen} getActiveStatus={setAboutOpen} />}
      <SearchOverlay activeStatus={searchOpen} getActiveStatus={setSearchOpen} />
      <CartOverlay activeStatus={cartOpen} getActiveStatus={setCartOpen} />
      <WishlistOverlay activeStatus={wishlistOpen} getActiveStatus={setWishlistOpen} />
      <MobileMenu activeStatus={mobileOpen} getActiveStatus={setMobileOpen} />
    </Fragment>
  );
};

const mapStateToProps = (state: RootState) => ({
  cartItems: state.cartData,
  wishlistItems: state.wishlistData,
});

const ConnectedHeader = connect(mapStateToProps)(HeaderShell);

export const HeaderFive = (props: { aboutOverlay?: boolean }) => <ConnectedHeader {...props} />;
export const HeaderOne  = (props: { aboutOverlay?: boolean }) => <ConnectedHeader {...props} />;

export default ConnectedHeader;
