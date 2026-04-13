import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getAdminProducts } from "@/lib/shopify/products";
import { shopifyStorefrontGraphQL } from "@/lib/shopify/storefront";
import { deriveOldPrice } from "@/lib/shopify/formatters";
import CollectionBrowser from "./CollectionBrowser";
import styles from "./page.module.css";

const FOOTER_COLLECTIONS_QUERY = `
  query FooterCollections($first: Int!) {
    collections(first: $first, sortKey: UPDATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;

async function getFooterCollections(limit = 6) {
  try {
    const data = await shopifyStorefrontGraphQL({
      query: FOOTER_COLLECTIONS_QUERY,
      variables: { first: limit },
    });

    return (
      data.collections?.edges?.map(({ node }) => ({
        id: node.id,
        title: node.title,
        handle: node.handle,
      })) || []
    );
  } catch {
    return [];
  }
}

const SPECIAL_COLLECTIONS = {
  sale: {
    title: "Sale",
    emptyMessage: "No sale products found.",
    query: "",
    saleOnly: true,
  },
  featured: {
    title: "Featured Products",
    emptyMessage: "No featured products found.",
    query: "tag:featured",
    saleOnly: false,
  },
  popular: {
    title: "Popular Products",
    emptyMessage: "No popular products found.",
    query: "tag:popular",
    saleOnly: false,
  },
};

export default async function CollectionPage({ params }) {
  const { handle: rawHandle } = await params;
  const handle = decodeURIComponent(rawHandle || "").trim();
  const normalizedHandle = handle.toLowerCase();
  const specialCollection = SPECIAL_COLLECTIONS[normalizedHandle] || null;

  let fetchFailed = false;
  const [productsResult, footerCollections] = await Promise.all([
    (async () => {
      try {
        return specialCollection
          ? await getAdminProducts({
              limit: 250,
              query: specialCollection.query || undefined,
            })
          : await getAdminProducts({
              limit: 60,
              collectionId: handle,
            });
      } catch (error) {
        const details = error instanceof Error ? error.message : String(error);
        console.error("[collections/page] Product fetch error:", details);
        fetchFailed = true;
        return {
          missingCollection: false,
          collection: null,
          products: [],
        };
      }
    })(),
    getFooterCollections(6),
  ]);

  const allProducts = productsResult.products || [];
  const products = specialCollection?.saleOnly
    ? allProducts.filter((product) => Boolean(deriveOldPrice(product.price, product.compareAtPrice)))
    : allProducts;

  const collectionTitle = specialCollection?.title || productsResult.collection?.title || "Collection";
  const emptyMessage = fetchFailed
    ? "Products are temporarily unavailable. Please try again shortly."
    : specialCollection?.emptyMessage || "No products found in this category.";

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <CollectionBrowser
          collectionTitle={collectionTitle}
          products={products}
          emptyMessage={emptyMessage}
        />
      </main>
      <Footer collections={footerCollections} />
    </div>
  );
}
