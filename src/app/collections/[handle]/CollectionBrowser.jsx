"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronDown, SlidersHorizontal, Star } from "lucide-react";
import {
  deriveOldPrice,
  deriveReviewCount,
  formatProductPrice,
} from "@/lib/shopify/formatters";
import styles from "./page.module.css";

function toPriceNumber(price) {
  const value = Number.parseFloat(price?.amount || "");
  return Number.isFinite(value) ? value : 0;
}

function CollectionProductCard({ product }) {
  const href = product.handle ? `/products/${product.handle}` : "#";
  const oldPrice = deriveOldPrice(product.price, product.compareAtPrice);
  const reviewCount = deriveReviewCount(product.id);

  return (
    <article className={styles.card}>
      <Link href={href} className={styles.cardLink} prefetch={false}>
        <div className={styles.mediaWrap}>
          {oldPrice ? <span className={styles.saleBadge}>SALE</span> : null}
          {product.image?.url ? (
            <img
              className={styles.mediaImage}
              src={product.image.url}
              alt={product.image.alt || product.title}
              loading="lazy"
            />
          ) : (
            <div className={styles.mediaFallback} />
          )}
        </div>
        <h3 className={styles.title}>{product.title}</h3>
        <div className={styles.ratingRow}>
          <div className={styles.stars} aria-label="Rated 5 out of 5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12} strokeWidth={2.2} fill="currentColor" />
            ))}
          </div>
          <span className={styles.reviewCount}>{reviewCount} reviews</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatProductPrice(product.price)}</span>
          {oldPrice ? <span className={styles.oldPrice}>{formatProductPrice(oldPrice)}</span> : null}
        </div>
      </Link>
    </article>
  );
}

export default function CollectionBrowser({ collectionTitle, products, emptyMessage }) {
  const allProducts = products || [];
  const inStockCount = allProducts.filter((p) => p.availableForSale !== false).length;
  const outOfStockCount = Math.max(allProducts.length - inStockCount, 0);

  const prices = useMemo(
    () =>
      allProducts
        .map((p) => toPriceNumber(p?.price))
        .filter((value) => Number.isFinite(value) && value > 0),
    [allProducts]
  );

  const maxPrice = prices.length ? Math.ceil(Math.max(...prices)) : 0;
  const defaultUpperBound = Math.max(maxPrice, 1);

  const [showInStock, setShowInStock] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [priceFrom, setPriceFrom] = useState(0);
  const [priceTo, setPriceTo] = useState(defaultUpperBound);
  const [sortBy, setSortBy] = useState("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const safeFrom = Math.min(priceFrom, priceTo);
  const safeTo = Math.max(priceFrom, priceTo);

  const sliderMax = Math.max(maxPrice, safeTo, 1);
  const hasPriceRange = sliderMax > 0;

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const inStock = product.availableForSale !== false;
      const availabilityMatch = (inStock && showInStock) || (!inStock && showOutOfStock);
      if (!availabilityMatch) return false;

      const productPrice = toPriceNumber(product.price);
      if (!Number.isFinite(productPrice) || productPrice <= 0) return false;
      return productPrice >= safeFrom && productPrice <= safeTo;
    });
  }, [allProducts, safeFrom, safeTo, showInStock, showOutOfStock]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];

    if (sortBy === "price-low-high") {
      list.sort((a, b) => toPriceNumber(a.price) - toPriceNumber(b.price));
    } else if (sortBy === "price-high-low") {
      list.sort((a, b) => toPriceNumber(b.price) - toPriceNumber(a.price));
    } else if (sortBy === "name-a-z") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "name-z-a") {
      list.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    }

    return list;
  }, [filteredProducts, sortBy]);

  const rangeSpan = Math.max(sliderMax, 1);
  const startPercent = (safeFrom / rangeSpan) * 100;
  const endPercent = (safeTo / rangeSpan) * 100;

  const productCountLabel =
    sortedProducts.length > 99
      ? `${sortedProducts.length}+ Products`
      : `${sortedProducts.length} ${sortedProducts.length === 1 ? "Product" : "Products"}`;

  function parseNonNegative(value) {
    const parsed = Number.parseInt(String(value ?? "").trim(), 10);
    if (!Number.isFinite(parsed)) {
      return 0;
    }
    return Math.max(0, parsed);
  }

  function onFromChange(nextValue) {
    const next = parseNonNegative(nextValue);
    setPriceFrom(next);
    if (next > priceTo) {
      setPriceTo(next);
    }
  }

  function onToChange(nextValue) {
    const next = parseNonNegative(nextValue);
    setPriceTo(next);
    if (next < priceFrom) {
      setPriceFrom(next);
    }
  }

  function onSortSelect(value) {
    setSortBy(value);
    setSortOpen(false);
  }

  useEffect(() => {
    if (!sortOpen) return;

    function onDocClick(event) {
      if (!sortRef.current?.contains(event.target)) {
        setSortOpen(false);
      }
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setSortOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [sortOpen]);

  return (
    <>
      <section className={styles.titleBar}>
        <h1 className={styles.heading}>{collectionTitle}</h1>
      </section>

      <section className={styles.content}>
        <aside className={styles.filters} aria-label="Filters">
          <div className={styles.filterHeader}>
            <SlidersHorizontal size={14} strokeWidth={1.9} />
            <h2>Filter</h2>
          </div>

          <div className={styles.filterGroup}>
            <h3>Availability</h3>
            <label>
              <input
                type="checkbox"
                checked={showInStock}
                onChange={(event) => setShowInStock(event.target.checked)}
              />
              <span>In Stock ({inStockCount})</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={showOutOfStock}
                onChange={(event) => setShowOutOfStock(event.target.checked)}
              />
              <span>Out Of Stock ({outOfStockCount})</span>
            </label>
          </div>

          <div className={styles.filterGroup}>
            <h3>Price</h3>
            <div className={styles.priceTrack}>
              <span className={styles.trackBase} />
              <span
                className={styles.trackFill}
                style={{ left: `${startPercent}%`, right: `${100 - endPercent}%` }}
              />

              <div className={styles.rangeInputs}>
                <input
                  className={styles.rangeInput}
                  type="range"
                  min={0}
                  max={sliderMax}
                  step={1}
                  value={priceFrom}
                  onChange={(event) => onFromChange(event.target.value)}
                  disabled={!hasPriceRange}
                  aria-label="Minimum price"
                />
                <input
                  className={`${styles.rangeInput} ${styles.rangeInputTop}`}
                  type="range"
                  min={0}
                  max={sliderMax}
                  step={1}
                  value={priceTo}
                  onChange={(event) => onToChange(event.target.value)}
                  disabled={!hasPriceRange}
                  aria-label="Maximum price"
                />
              </div>
            </div>

            <div className={styles.priceInputs}>
              <div className={styles.priceBox}>
                <small>From</small>
                <input
                  type="number"
                  min={0}
                  value={priceFrom}
                  onChange={(event) => onFromChange(event.target.value)}
                  inputMode="numeric"
                  aria-label="From price"
                />
              </div>
              <div className={styles.priceBox}>
                <small>To</small>
                <input
                  type="number"
                  min={0}
                  value={priceTo}
                  onChange={(event) => onToChange(event.target.value)}
                  inputMode="numeric"
                  aria-label="To price"
                />
              </div>
            </div>
          </div>
        </aside>

        <div className={styles.productsWrap}>
          <div className={styles.productsMeta}>
            <p>{productCountLabel}</p>
            <div className={styles.sortWrap} ref={sortRef}>
              <button
                type="button"
                className={styles.sortBy}
                aria-haspopup="menu"
                aria-expanded={sortOpen}
                onClick={() => setSortOpen((v) => !v)}
              >
                <ArrowUpDown size={12} strokeWidth={2} />
                <span>Sort by</span>
                <ChevronDown size={12} strokeWidth={2} />
              </button>
              {sortOpen ? (
                <div className={styles.sortMenu} role="menu" aria-label="Sort products">
                  <button
                    type="button"
                    className={styles.sortOption}
                    data-active={sortBy === "featured"}
                    onClick={() => onSortSelect("featured")}
                  >
                    Featured
                  </button>
                  <button
                    type="button"
                    className={styles.sortOption}
                    data-active={sortBy === "price-low-high"}
                    onClick={() => onSortSelect("price-low-high")}
                  >
                    Price: Low to High
                  </button>
                  <button
                    type="button"
                    className={styles.sortOption}
                    data-active={sortBy === "price-high-low"}
                    onClick={() => onSortSelect("price-high-low")}
                  >
                    Price: High to Low
                  </button>
                  <button
                    type="button"
                    className={styles.sortOption}
                    data-active={sortBy === "name-a-z"}
                    onClick={() => onSortSelect("name-a-z")}
                  >
                    Name: A to Z
                  </button>
                  <button
                    type="button"
                    className={styles.sortOption}
                    data-active={sortBy === "name-z-a"}
                    onClick={() => onSortSelect("name-z-a")}
                  >
                    Name: Z to A
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {sortedProducts.length ? (
            <div className={styles.grid}>
              {sortedProducts.map((product) => (
                <CollectionProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>{emptyMessage}</p>
          )}
        </div>
      </section>
    </>
  );
}
