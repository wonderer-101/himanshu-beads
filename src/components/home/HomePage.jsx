"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "./HomeComponents/HeroSection";
import ContentSection from "./HomeComponents/ContentSection";
import TrustSection from "./HomeComponents/TrustSection";
import {
  fetchCollections,
  fetchProductsByQuery,
} from "@/lib/client/shopifyClient";
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

  useEffect(() => {
    let ignore = false;
    fetchCollections(12)
      .then((data) => { if (!ignore) setCollections(data); })
      .catch((e) => { if (!ignore) setCollectionsError(e.message); })
      .finally(() => { if (!ignore) setCollectionsLoading(false); });
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchProductsByQuery({
      query: "tag:featured",
      limit: 12,
    })
      .then((data) => { if (!ignore) setFeatured(data); })
      .catch((e) => { if (!ignore) setFeaturedError(e.message); })
      .finally(() => { if (!ignore) setFeaturedLoading(false); });
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchProductsByQuery({
      query: "tag:popular",
      limit: 12,
    })
      .then((data) => { if (!ignore) setPopular(data); })
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
