"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, User, LogOut, X, Menu } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useAuth } from "@/components/auth/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import styles from "./Header.module.css";

const defaultNavItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "New Arrivals", href: "/#collections" },
  { label: "Sale", href: "/collections/sale" },
];

const storefrontSearchUrl = "https://himanshu-beadss.myshopify.com/search";

function NavLink({ href, children, active, onClick }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} data-active={active ? "true" : "false"} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} data-active={active ? "true" : "false"} onClick={onClick}>
      {children}
    </a>
  );
}

export default function Header({ navItems = defaultNavItems }) {
  const { itemCount } = useCart();
  const { customer, loading: authLoading } = useAuth();
  const pathname = usePathname();

  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const accountRef = useRef(null);
  const searchInputRef = useRef(null);

  function isActive(href) {
    const [path] = href.split("#");
    if (!path || path === "/") return href === "/" && pathname === "/";
    return pathname === path || pathname.startsWith(path + "/");
  }

  useEffect(() => {
    if (!searchOpen) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen && !accountOpen && !navOpen) return;
    function onKey(e) {
      if (e.key !== "Escape") return;
      setSearchOpen(false);
      setAccountOpen(false);
      setNavOpen(false);
    }
    function onClickOutside(e) {
      if (!accountRef.current?.contains(e.target)) setAccountOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [searchOpen, accountOpen, navOpen]);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [navOpen]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1080) {
        setNavOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const greeting = customer?.firstName
    ? "Hi, " + customer.firstName
    : (customer?.emailAddress?.emailAddress?.split("@")[0] ?? "Account");

  return (
    <>
      <header className={styles.header}>
        <div className={styles.topBar}>
          <div className={styles.topBarInner}>

            {/* Hamburger -- mobile only */}
            <button
              className={styles.hamburger}
              type="button"
              aria-label={navOpen ? "Close menu" : "Open menu"}
              aria-expanded={navOpen}
              aria-controls="mobile-nav"
              onClick={() => setNavOpen((v) => !v)}
            >
              {navOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
            </button>

            <Link className={styles.brand} href="/" aria-label="Himanshu Beads">
              <Image
                src="/icons/main-logo.svg"
                alt="Himanshu Beads Jewellery"
                width={253}
                height={89}
                className={styles.logo}
                priority
              />
            </Link>

            <div className={styles.actions}>
              <button
                className={styles.iconBtn}
                type="button"
                aria-label="Search"
                onClick={() => { setSearchOpen((v) => !v); setAccountOpen(false); }}
              >
                <Search size={18} strokeWidth={1.9} />
              </button>

              {!authLoading && !customer && (
                <button
                  className={styles.iconBtn}
                  type="button"
                  aria-label="Sign in"
                  onClick={() => setAuthModalOpen(true)}
                >
                  <User size={18} strokeWidth={1.9} />
                </button>
              )}

              {!authLoading && customer && (
                <div className={styles.accountWrap} ref={accountRef}>
                  <button
                    className={styles.iconBtn + " " + styles.iconBtnActive}
                    type="button"
                    aria-label="My account"
                    onClick={() => setAccountOpen((v) => !v)}
                  >
                    <User size={18} strokeWidth={1.9} />
                  </button>
                  <div className={styles.dropdown} data-open={accountOpen ? "true" : "false"}>
                    <span className={styles.dropGreeting}>{greeting}</span>
                    <hr className={styles.dropDivider} />
                    <a href="/api/auth/shopify/logout" className={styles.dropLink}>
                      <LogOut size={13} /> Sign out
                    </a>
                  </div>
                </div>
              )}

              <Link className={styles.iconBtn + " " + styles.cartBtn} href="/cart" aria-label="Cart">
                <ShoppingBag size={18} strokeWidth={1.9} />
                {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
              </Link>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className={styles.searchBar} data-open={searchOpen ? "true" : "false"}>
          <div className={styles.searchInner}>
            <form
              className={styles.searchForm}
              action={storefrontSearchUrl}
              method="get"
              role="search"
              onSubmit={() => setSearchOpen(false)}
            >
              <input type="hidden" name="type" value="product" />
              <input type="hidden" name="options[prefix]" value="last" />
              <button className={styles.searchSubmit} type="submit" aria-label="Submit">
                <Search size={16} strokeWidth={1.9} />
              </button>
              <label className={styles.srOnly} htmlFor="site-search">Search</label>
              <input
                ref={searchInputRef}
                id="site-search"
                className={styles.searchInput}
                type="text"
                name="q"
                placeholder="Search jewellery..."
                autoComplete="off"
              />
              <button
                className={styles.searchClose}
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
              >
                <X size={16} strokeWidth={1.9} />
              </button>
            </form>
          </div>
        </div>

        {/* Desktop nav strip */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink key={item.label} href={item.href} active={isActive(item.href)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <nav className={`${styles.mobileDrawer} ${navOpen ? styles.mobileDrawerOpen : ""}`} aria-label="Mobile navigation" id="mobile-nav">
        <div className={styles.drawerTop}>
          <Image
            src="/icons/main-logo.svg"
            alt="Himanshu Beads"
            width={160}
            height={56}
            className={styles.drawerLogo}
          />
          <button
            className={styles.drawerClose}
            type="button"
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            href={item.href}
            active={isActive(item.href)}
            onClick={() => setNavOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div 
        className={`${styles.backdrop} ${navOpen ? styles.backdropVisible : ""}`} 
        aria-hidden="true" 
        onClick={() => setNavOpen(false)} 
      />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
