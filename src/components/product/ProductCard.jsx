import Link from "next/link";
import { Star } from "lucide-react";
import {
  deriveOldPrice,
  deriveReviewCount,
  formatProductPrice,
} from "@/lib/shopify/formatters";
import styles from "./ProductCard.module.css";

const fallbackTones = [
  "toneRuby",
  "toneGold",
  "toneChampagne",
  "toneRose",
  "toneIvory",
];

function getFallbackTone(index) {
  return fallbackTones[index % fallbackTones.length];
}

function StarRow({ reviewCount }) {
  return (
    <div className={styles.ratingRow}>
      <div className={styles.stars} aria-label="Rated 5 out of 5">
        {Array.from({ length: 5 }).map((_, starIndex) => (
          <Star key={starIndex} size={13} strokeWidth={2.2} fill="currentColor" />
        ))}
      </div>
      <span className={styles.reviewCount}>{reviewCount} reviews</span>
    </div>
  );
}

function LoadingCard() {
  return (
    <article className={styles.card} aria-hidden="true">
      <div className={`${styles.mediaWrap} ${styles.skeleton}`} />
      <div className={styles.skeletonMeta}>
        <span className={`${styles.skeleton} ${styles.skeletonLinePrimary}`} />
        <span className={`${styles.skeleton} ${styles.skeletonLineSecondary}`} />
      </div>
    </article>
  );
}

export default function ProductCard({ product, index = 0, loading = false }) {
  if (loading || !product) {
    return <LoadingCard />;
  }

  const oldPrice = deriveOldPrice(product.price, product.compareAtPrice);
  const reviewCount = deriveReviewCount(product.id);
  const hasImage = Boolean(product.image?.url);
  const toneClass = styles[getFallbackTone(index)];
  const href = product.handle ? `/products/${product.handle}` : "#";

  return (
    <article className={styles.card}>
      <Link href={href} className={styles.cardLink} prefetch={false}>
        <div className={styles.mediaWrap}>
          {oldPrice ? <span className={styles.saleBadge}>SALE</span> : null}
          {hasImage ? (
            <img
              className={styles.mediaImage}
              src={product.image.url}
              alt={product.image.alt || product.title}
              loading="lazy"
            />
          ) : (
            <div className={`${styles.mediaFallback} ${toneClass}`} />
          )}
        </div>
        <h3 className={styles.title}>{product.title}</h3>
        <StarRow reviewCount={reviewCount} />
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatProductPrice(product.price)}</span>
          {oldPrice ? <span className={styles.oldPrice}>{formatProductPrice(oldPrice)}</span> : null}
        </div>
      </Link>
    </article>
  );
}
