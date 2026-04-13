"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Gem,
  Headset,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import {
  deriveOldPrice,
  deriveReviewCount,
  formatProductPrice,
} from "@/lib/shopify/formatters";
import { useCart } from "@/components/cart/CartProvider";
import styles from "./ProductDetailView.module.css";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
  },
  {
    icon: Truck,
    title: "Express Shipping",
  },
  {
    icon: Headset,
    title: "Premium Support",
  },
  {
    icon: Gem,
    title: "Quality Assured",
  },
];

function safeQuantity(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return 1;
  }
  return Math.min(Math.max(parsed, 1), 10);
}

export default function ProductDetailView({ product }) {
  const { addItem, itemCount } = useCart();
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedState, setAddedState] = useState("idle");

  const selectedImage = images[selectedIndex] || images[0] || null;
  const oldPrice = deriveOldPrice(product.price, product.compareAtPrice);
  const reviewCount = deriveReviewCount(product.id);
  const unitPrice = Number.parseFloat(product.price?.amount || "0") || 0;
  const linePrice = unitPrice * quantity;

  const canAddToCart = Boolean(product.variantNumericId && product.storeDomain);
  const quantityLabel = useMemo(() => `${quantity} ${quantity === 1 ? "item" : "items"}`, [quantity]);
  const linePriceLabel = useMemo(() => formatProductPrice({
    amount: linePrice.toFixed(2),
    currencyCode: product.price?.currencyCode || "INR",
  }), [linePrice, product.price?.currencyCode]);

  useEffect(() => {
    if (addedState !== "added") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setAddedState("idle"), 1300);
    return () => window.clearTimeout(timeoutId);
  }, [addedState]);

  function handleAddToCart() {
    if (!canAddToCart) {
      setAddedState("error");
      return;
    }

    const ok = addItem(
      {
        ...product,
      },
      quantity
    );

    setAddedState(ok ? "added" : "error");
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>{product.title}</span>
        </nav>

        <div className={styles.layout}>
          <div className={styles.mediaColumn}>
            <div className={styles.galleryLayout}>
              <div className={styles.thumbs}>
                {images.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    className={styles.thumbBtn}
                    data-active={selectedIndex === index ? "true" : "false"}
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`Show product image ${index + 1}`}
                  >
                    <img src={image.url} alt={image.alt || product.title} />
                  </button>
                ))}
              </div>

              <div className={styles.mainMedia}>
                {selectedImage ? (
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.alt || product.title}
                    className={styles.mainImage}
                  />
                ) : (
                  <div className={styles.mainFallback}>Image unavailable</div>
                )}
              </div>
            </div>
          </div>

          <aside className={styles.detailsColumn}>
            {oldPrice ? <span className={styles.saleBadge}>Sale</span> : null}
            <h1 className={`${styles.title} ${oldPrice ? "" : styles.titleNoBadge}`}>{product.title}</h1>

            <div className={styles.ratingRow}>
              <div className={styles.stars} aria-label="Rated 5 out of 5">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} size={17} strokeWidth={2.2} fill="currentColor" />
                ))}
              </div>
              <span>{reviewCount} reviews</span>
            </div>

            <div className={styles.priceWrap}>
              <span className={styles.price}>{formatProductPrice(product.price)}</span>
              {oldPrice ? (
                <span className={styles.comparePrice}>{formatProductPrice(oldPrice)}</span>
              ) : null}
            </div>

            <p className={styles.shippingNote}>Tax included. Shipping calculated at checkout.</p>

            <div className={styles.purchasePanel}>
              <div className={styles.quantityWrap}>
                <label htmlFor="product-quantity">Quantity</label>
                <div className={styles.quantityControl}>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => setQuantity((current) => Math.max(current - 1, 1))}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <input
                    id="product-quantity"
                    type="number"
                    min={1}
                    max={10}
                    value={quantity}
                    onChange={(event) => setQuantity(safeQuantity(event.target.value))}
                  />
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => setQuantity((current) => Math.min(current + 1, 10))}
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              <div className={styles.linePreview}>
                <span>{quantityLabel}</span>
                <strong>{linePriceLabel}</strong>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryAction}
                onClick={handleAddToCart}
                disabled={!canAddToCart}
              >
                <ShoppingBag size={16} />
                {addedState === "added" ? "Added to cart" : "Add to cart"}
              </button>
              <Link href="/cart" className={styles.secondaryAction}>
                View cart ({itemCount})
              </Link>
            </div>
            {addedState === "error" ? (
              <p className={styles.actionHint}>Could not add this item right now. Please try again.</p>
            ) : null}

            <div className={styles.trustGrid}>
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className={styles.trustItem}>
                    <span className={styles.trustIcon} aria-hidden="true">
                      <Icon size={16} />
                    </span>
                    <span>{item.title}</span>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>

        <section className={styles.descriptionCard}>
          <h2>Description</h2>
          {product.descriptionHtml ? (
            <div
              className={styles.descriptionText}
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          ) : (
            <p className={styles.descriptionText}>{product.description || "No description available."}</p>
          )}
        </section>
      </section>
    </main>
  );
}
