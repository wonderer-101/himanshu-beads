"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import styles from "./Header.module.css";

const defaultNavItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "New Arrivals", href: "/#collections" },
  { label: "Necklaces", href: "/#collections" },
  { label: "Earings", href: "/#categories" },
  { label: "Bangles/Bracelet", href: "/#collections" },
  { label: "Curated Collection", href: "/#collections" },
  { label: "Rings", href: "/#collections" },
  { label: "Sale", href: "/#collections" },
  { label: "Return & Exchange", href: "/#faqs" },
];

const storefrontBaseUrl = "https://himanshubeads.myshopify.com";
const storefrontSearchUrl = `${storefrontBaseUrl}/search`;
const storefrontAccountUrl = `${storefrontBaseUrl}/account`;
const storefrontAccountLoginUrl = `${storefrontBaseUrl}/account/login`;

function cx(...classNames) {
  return classNames
    .filter(Boolean)
    .map((className) => styles[className])
    .join(" ");
}

function RenderNavLink({ href, children, active, onClick }) {
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
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  function isNavItemActive(href) {
    const [path] = href.split("#");

    if (!path || path === "/") {
      return href === "/" && pathname === "/";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  }

  useEffect(() => {
    if (!searchOpen) return;
    const timeout = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 30);
    return () => window.clearTimeout(timeout);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen && !accountOpen) return;

    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      setSearchOpen(false);
      setAccountOpen(false);
    }

    function handlePointerDown(event) {
      if (!accountOpen) return;
      if (accountMenuRef.current?.contains(event.target)) return;
      setAccountOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [accountOpen, searchOpen]);

  return (
    <header className={cx("site-header")}>
      <div className={cx("top-brand-bar")}>
        <div className={cx("shell", "header-shell")}>
          <button
            className={cx("nav-toggle")}
            type="button"
            aria-expanded={navOpen ? "true" : "false"}
            aria-controls="main-nav"
            onClick={() => setNavOpen((current) => !current)}
          >
            Menu
          </button>

          <Link className={cx("brand")} href="/" aria-label="Himanshu Beads Home">
            <Image
              className={cx("brand-logo")}
              src="/icons/main-logo.svg"
              alt="Himanshu Beads Jewellery"
              width={253}
              height={89}
            />
          </Link>

          <div className={cx("header-actions")} aria-label="Quick actions">
            <button
              className={cx("icon-btn")}
              type="button"
              aria-label="Search"
              aria-expanded={searchOpen ? "true" : "false"}
              onClick={() => {
                setSearchOpen((current) => !current);
                setAccountOpen(false);
              }}
            >
              <Search aria-hidden="true" />
            </button>
            <div className={cx("account-menu")} ref={accountMenuRef}>
              <button
                className={cx("icon-btn")}
                type="button"
                aria-label="Account"
                aria-expanded={accountOpen ? "true" : "false"}
                onClick={() => {
                  setAccountOpen((current) => !current);
                  setSearchOpen(false);
                }}
              >
                <User aria-hidden="true" />
              </button>
              <div className={cx("account-popup")} data-open={accountOpen ? "true" : "false"}>
                <a href={storefrontAccountLoginUrl}>Continue with Shop or Email</a>
                <a href={storefrontAccountUrl}>My account</a>
              </div>
            </div>
            <Link className={cx("icon-btn", "cart-icon-btn")} href="/cart" aria-label="Bag">
              <ShoppingBag aria-hidden="true" />
              {itemCount > 0 ? <span className={cx("cart-count")}>{itemCount}</span> : null}
            </Link>
          </div>
        </div>
      </div>

      <div className={cx("search-bar-container")} data-open={searchOpen ? "true" : "false"}>
        <div className={cx("shell", "search-bar-shell")}>
          <form
            className={cx("search-bar-form")}
            action={storefrontSearchUrl}
            method="get"
            role="search"
            onSubmit={() => setSearchOpen(false)}
          >
            <input type="hidden" name="type" value="product" />
            <input type="hidden" name="options[prefix]" value="last" />
            <button className={cx("search-icon-btn")} type="submit" aria-label="Submit search">
              <Search aria-hidden="true" />
            </button>
            <label className={cx("visually-hidden")} htmlFor="header-search-input">
              Search
            </label>
            <input
              ref={searchInputRef}
              id="header-search-input"
              className={cx("search-input")}
              type="text"
              name="q"
              placeholder="Search"
              autoComplete="off"
            />
            <button
              className={cx("search-close-btn")}
              type="button"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
            >
              <X aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      <div className={cx("menu-bar")}>
        <div className={cx("shell")}>
          <nav id="main-nav" className={cx("main-nav")} data-open={navOpen ? "true" : "false"}>
            {navItems.map((item) => (
              <RenderNavLink
                key={item.label}
                href={item.href}
                active={isNavItemActive(item.href)}
                onClick={() => setNavOpen(false)}
              >
                {item.label}
              </RenderNavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
