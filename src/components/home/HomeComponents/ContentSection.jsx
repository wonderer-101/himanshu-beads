"use client";

import ProductCard from "@/components/product/ProductCard";
import styles from "./ContentSection.module.css";

// -- Categories ----------------------------------------------------------

const TONES = ["t1","t2","t3","t4","t5","t6","t7"];

function CategoriesRow({ collections, loading, error }) {
  const items = loading
    ? Array.from({ length: 7 }, (_, i) => ({ id: `sk-${i}`, loading: true, tone: TONES[i] }))
    : collections.slice(0, 7).map((c, i) => ({
        id: c.id,
        label: c.title,
        handle: c.handle,
        image: c.image?.url,
        tone: TONES[i % TONES.length],
      }));

  return (
    <div className={styles.catWrap} id="categories">
      <div className={styles.catHeader}>
        <h2 className={styles.catTitle}>Shop by Category</h2>
        <a className={styles.seeAll} href="/collections">View All</a>
      </div>
      <div className={styles.catTrack}>
        {items.map((item) =>
          item.loading ? (
            <div key={item.id} className={styles.catItem} aria-hidden="true">
              <span className={`${styles.catThumb} ${styles.catThumbSkel}`} />
              <span className={styles.catLabelSkel} />
            </div>
          ) : (
            <a
              key={item.id}
              className={styles.catItem}
              href={item.handle ? `/collections/${encodeURIComponent(item.handle)}` : "#collections"}
            >
              <span className={styles.catThumb}>
                {item.image ? (
                  <img
                    className={styles.catThumbImage}
                    src={item.image}
                    alt={item.label}
                    loading="lazy"
                  />
                ) : (
                  <span className={`${styles.catThumbFill} ${styles[item.tone]}`} />
                )}
              </span>
              <span className={styles.catLabel}>{item.label}</span>
            </a>
          )
        )}
      </div>
      {!loading && error && <p className={styles.err}>{error}</p>}
    </div>
  );
}

// -- Product scroll row --------------------------------------------------

function ProductRow({ title, products, loading, error, indexOffset = 0, id, seeAllHref = "#" }) {
  return (
    <div className={styles.prodSection} id={id}>
      <div className={styles.prodHeader}>
        <h2 className={styles.prodTitle}>{title}</h2>
        <a className={styles.seeAll} href={seeAllHref}>See All</a>
      </div>
      <div className={styles.prodScroll}>
        <div className={styles.prodInner}>
          {loading
            ? Array.from({ length: 6 }, (_, i) => (
                <ProductCard key={`sk-${i}`} loading index={i + indexOffset} />
              ))
            : (products ?? []).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i + indexOffset} />
              ))}
        </div>
      </div>
      {!loading && error && <p className={styles.msg} style={{ color: "#800000" }}>{error}</p>}
      {!loading && !error && !products?.length && <p className={styles.msg}>No products found.</p>}
    </div>
  );
}

// -- Exported section ----------------------------------------------------

export default function ContentSection({ collections, collectionsLoading, collectionsError, featured, featuredLoading, featuredError, popular, popularLoading, popularError }) {
  return (
    <section className={styles.section} data-animate>
      <CategoriesRow collections={collections} loading={collectionsLoading} error={collectionsError} />
      <ProductRow
        id="collections"
        title="Featured Products"
        products={featured}
        loading={featuredLoading}
        error={featuredError}
        indexOffset={0}
        seeAllHref="/collections/featured"
      />
      <ProductRow
        id="popular-products"
        title="Popular Products"
        products={popular}
        loading={popularLoading}
        error={popularError}
        indexOffset={2}
        seeAllHref="/collections/popular"
      />
    </section>
  );
}
