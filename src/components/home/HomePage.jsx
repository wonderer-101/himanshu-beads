"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "./HomeComponents/HeroSection";
import ContentSection from "./HomeComponents/ContentSection";
import TrustSection from "./HomeComponents/TrustSection";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [collectionsError, setCollectionsError] = useState("");

  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState("");

  const [popular, setPopular] = useState([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [popularError, setPopularError] = useState("");

  async function fetchApiJson(url, fallbackMessage) {
    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.ok === false) {
      throw new Error(data?.error || fallbackMessage);
    }
    return data;
  }

  useEffect(() => {
    let ignore = false;
    fetchApiJson(
      "/api/shopify/collections?limit=12",
      "Categories are temporarily unavailable. Please try again shortly."
    )
      .then((d) => { if (!ignore) setCollections(d.collections ?? []); })
      .catch((e) => { if (!ignore) setCollectionsError(e.message); })
      .finally(() => { if (!ignore) setCollectionsLoading(false); });
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchApiJson(
      "/api/shopify/products?limit=12&q=tag:featured",
      "Featured products are temporarily unavailable. Please try again shortly."
    )
      .then((d) => { if (!ignore) setFeatured(d.products ?? []); })
      .catch((e) => { if (!ignore) setFeaturedError(e.message); })
      .finally(() => { if (!ignore) setFeaturedLoading(false); });
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchApiJson(
      "/api/shopify/products?limit=12&q=tag:popular",
      "Popular products are temporarily unavailable. Please try again shortly."
    )
      .then((d) => { if (!ignore) setPopular(d.products ?? []); })
      .catch((e) => { if (!ignore) setPopularError(e.message); })
      .finally(() => { if (!ignore) setPopularLoading(false); });
    return () => { ignore = true; };
  }, []);

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <HeroSection />
        <ContentSection
          collections={collections} collectionsLoading={collectionsLoading} collectionsError={collectionsError}
          featured={featured} featuredLoading={featuredLoading} featuredError={featuredError}
          popular={popular} popularLoading={popularLoading} popularError={popularError}
        />
        <TrustSection />
      </main>
      <Footer collections={collections} />
    </div>
  );
}
