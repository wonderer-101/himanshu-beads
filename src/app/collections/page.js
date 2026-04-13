import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { shopifyStorefrontGraphQL } from "@/lib/shopify/storefront";
import styles from "./page.module.css";

const ALL_COLLECTIONS_QUERY = `
  query AllCollections($first: Int!) {
    collections(first: $first, sortKey: UPDATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

async function getAllCollections(limit = 80) {
  try {
    const data = await shopifyStorefrontGraphQL({
      query: ALL_COLLECTIONS_QUERY,
      variables: { first: limit },
    });

    return (
      data.collections?.edges?.map(({ node }) => ({
        id: node.id,
        title: node.title,
        handle: node.handle,
        description: node.description || "",
        image: node.image
          ? {
              url: node.image.url,
              alt: node.image.altText || node.title,
            }
          : null,
      })) || []
    );
  } catch {
    return [];
  }
}

function shortDescription(text) {
  const clean = (text || "").trim();
  if (!clean) return "Explore this collection.";
  if (clean.length <= 120) return clean;
  return `${clean.slice(0, 117)}...`;
}

export default async function CollectionsPage() {
  const collections = await getAllCollections(80);
  const footerCollections = collections.slice(0, 6);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1>All Collections</h1>
          <p>Browse every Himanshu Beads collection.</p>
        </section>

        {collections.length ? (
          <section className={styles.grid} aria-label="Collections list">
            {collections.map((collection) => (
              <article key={collection.id} className={styles.card}>
                <Link href={`/collections/${encodeURIComponent(collection.handle)}`} className={styles.cardLink}>
                  <div className={styles.mediaWrap}>
                    {collection.image?.url ? (
                      <img
                        className={styles.mediaImage}
                        src={collection.image.url}
                        alt={collection.image.alt || collection.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.mediaFallback} />
                    )}
                  </div>
                  <h2>{collection.title}</h2>
                  <p>{shortDescription(collection.description)}</p>
                  <span className={styles.cta}>View Collection</span>
                </Link>
              </article>
            ))}
          </section>
        ) : (
          <section className={styles.emptyWrap}>
            <p>No collections found right now.</p>
          </section>
        )}
      </main>
      <Footer collections={footerCollections} />
    </div>
  );
}
