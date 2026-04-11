"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Star } from "lucide-react";
import styles from "./HomePage.module.css";
import ProductCard from "@/components/product/ProductCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const navItems = [
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

const categoryToneClasses = [
  "cat-1",
  "cat-2",
  "cat-3",
  "cat-4",
  "cat-5",
  "cat-6",
  "cat-7",
];

const faqItems = [
  {
    q: "What are the Return/Exchange Policy ?",
    a: "Return & Exchange requests can be initiated from the Help Center. Use “Initiate Return & Exchange” or contact us directly for order support.",
  },
  {
    q: "What products does Himanshu Beads offer?",
    a: "We offer Necklaces, Earings/Earrings, Bangles/Bracelet, Rings, Pendants, Choker, and curated jewellery collections including American Diamond and Kundan & Polki.",
  },
  {
    q: "Are the beads suitable for daily-wear jewellery?",
    a: "Yes, collections include both daily-wear friendly options and premium statement sets, so you can choose based on comfort and occasion.",
  },
  {
    q: "How do you ensure the quality of your beads?",
    a: "We focus on premium quality beads, curated craftsmanship, and checks for finishing consistency before dispatch.",
  },
  {
    q: "How can I place an order or get in touch?",
    a: "Reach us through Email or Call/Whatsapp in the contact section below at info@himanshubeads.in.",
  },
];

const clientLoveItems = [
  {
    name: "Madhuri",
    location: "Mumbai",
    review:
      "Wonderful quality, beyond expectations. Seller is very polite and kind, and she explains the unique features of each jewellery piece.",
    image: "https://mrjewels.in/cdn/shop/files/image-1.png?v=1750097331",
  },
  {
    name: "Malika Kriplani",
    location: "Surat",
    review:
      "Amazing quality of jewellery. Love the polish and finish, just like real, and the pricing is very good.",
    image: "https://mrjewels.in/cdn/shop/files/image-8.png?v=1750097332",
  },
  {
    name: "Bijell",
    location: "Mumbai",
    review:
      "Absolutely fantastic experience. Ordered a ring and loved the sizing, finish, and overall quality as soon as I received it.",
    image: "https://mrjewels.in/cdn/shop/files/image.png?v=1750097332",
  },
  {
    name: "Neha Rattan",
    location: "Delhi",
    review:
      "Very beautiful jewellery, and the best part is that the pieces are lightweight and comfortable to wear for long hours.",
    image: "https://mrjewels.in/cdn/shop/files/image-7.png?v=1750097332",
  },
  {
    name: "Nazia",
    location: "Australia",
    review:
      "Buying jewellery online felt risky, but the support and product quality exceeded expectations. The piece was exquisite.",
    image: "https://mrjewels.in/cdn/shop/files/image-6.png?v=1750097332",
  },
];

const trustItems = [
  {
    title: "Express & Worldwide Shipping",
    icon: "/icons/trust/shipping.svg",
    alt: "Shipping",
  },
  {
    title: "100 % Secure Checkout",
    icon: "/icons/trust/secure-checkout.svg",
    alt: "Secure checkout",
  },
  {
    title: "COD Available",
    icon: "/icons/trust/cod.svg",
    alt: "Cash on delivery",
  },
  {
    title: "Premium Support",
    icon: "/icons/trust/support.svg",
    alt: "Support",
  },
];

const heroSlideCount = 5;

function cx(...classNames) {
  return classNames
    .filter(Boolean)
    .map((className) => styles[className])
    .join(" ");
}

export default function HomePage() {
  const [collections, setCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [collectionsError, setCollectionsError] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState("");
  const [popularProducts, setPopularProducts] = useState([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [popularError, setPopularError] = useState("");
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const pageRef = useRef(null);
  const heroTouchStartRef = useRef(null);

  const categoryItems = useMemo(
    () =>
      collections.slice(0, 7).map((collection, index) => ({
        id: collection.id,
        label: collection.title,
        tone: categoryToneClasses[index % categoryToneClasses.length],
        image: collection.image,
      })),
    [collections]
  );

  const categoryDisplayItems = useMemo(() => {
    if (collectionsLoading) {
      return Array.from({ length: 7 }, (_, index) => ({
        id: `category-skeleton-${index}`,
        tone: categoryToneClasses[index % categoryToneClasses.length],
        loading: true,
      }));
    }
    return categoryItems;
  }, [categoryItems, collectionsLoading]);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    page.classList.add(styles["motion-ready"]);
    const targets = page.querySelectorAll("[data-animate]");

    if (!("IntersectionObserver" in window)) {
      targets.forEach((target) => {
        target.setAttribute("data-visible", "true");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-visible", "true");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function syncViewportMode() {
      setIsMobileViewport(window.matchMedia("(max-width: 700px)").matches);
    }

    syncViewportMode();
    window.addEventListener("resize", syncViewportMode);
    return () => window.removeEventListener("resize", syncViewportMode);
  }, []);

  useEffect(() => {
    if (!isMobileViewport) {
      setHeroSlideIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setHeroSlideIndex((current) => (current + 1) % heroSlideCount);
    }, 3200);

    return () => window.clearInterval(interval);
  }, [isMobileViewport]);

  useEffect(() => {
    let ignore = false;

    async function fetchCollections() {
      setCollectionsLoading(true);
      setCollectionsError("");

      try {
        const response = await fetch("/api/shopify/collections?limit=12", {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to fetch Shopify collections.");
        }

        const nextCollections = payload.collections || [];
        if (!ignore) {
          setCollections(nextCollections);
        }
      } catch (error) {
        if (!ignore) {
          setCollections([]);
          setCollectionsError(
            error instanceof Error
              ? error.message
              : "Failed to load collections from Shopify."
          );
        }
      } finally {
        if (!ignore) {
          setCollectionsLoading(false);
        }
      }
    }

    fetchCollections();

    return () => {
      ignore = true;
    };
  }, []);

  function handleHeroTouchStart(event) {
    if (!isMobileViewport) return;
    heroTouchStartRef.current = event.touches[0]?.clientX ?? null;
  }

  function handleHeroTouchEnd(event) {
    if (!isMobileViewport) return;
    const startX = heroTouchStartRef.current;
    const endX = event.changedTouches[0]?.clientX ?? null;
    heroTouchStartRef.current = null;
    if (startX === null || endX === null) return;

    const deltaX = startX - endX;
    if (Math.abs(deltaX) < 40) return;

    if (deltaX > 0) {
      setHeroSlideIndex((current) => (current + 1) % heroSlideCount);
      return;
    }

    setHeroSlideIndex((current) => (current - 1 + heroSlideCount) % heroSlideCount);
  }

  useEffect(() => {
    let ignore = false;

    async function fetchFeaturedProducts() {
      const params = new URLSearchParams({
        limit: "12",
        q: "tag:featured",
      });

      setFeaturedLoading(true);
      setFeaturedError("");

      try {
        const response = await fetch(`/api/shopify/products?${params.toString()}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to fetch featured products.");
        }

        if (!ignore) {
          setFeaturedProducts(payload.products || []);
        }
      } catch (error) {
        if (!ignore) {
          setFeaturedProducts([]);
          setFeaturedError(
            error instanceof Error
              ? error.message
              : "Failed to load featured products from Shopify."
          );
        }
      } finally {
        if (!ignore) {
          setFeaturedLoading(false);
        }
      }
    }

    fetchFeaturedProducts();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function fetchPopularProducts() {
      const params = new URLSearchParams({
        limit: "12",
        q: "tag:popular",
      });

      setPopularLoading(true);
      setPopularError("");

      try {
        const response = await fetch(`/api/shopify/products?${params.toString()}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to fetch popular products.");
        }

        if (!ignore) {
          setPopularProducts(payload.products || []);
        }
      } catch (error) {
        if (!ignore) {
          setPopularProducts([]);
          setPopularError(
            error instanceof Error
              ? error.message
              : "Failed to load popular products from Shopify."
          );
        }
      } finally {
        if (!ignore) {
          setPopularLoading(false);
        }
      }
    }

    fetchPopularProducts();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div ref={pageRef} className={styles.page}>
      <Header navItems={navItems} />

      <main className={cx("main")}>
        <section
          className={cx("hero", "shell")}
          data-animate
          onTouchStart={handleHeroTouchStart}
          onTouchEnd={handleHeroTouchEnd}
        >
          <div
            className={cx("hero-slider-track")}
            style={isMobileViewport ? { transform: `translateX(-${heroSlideIndex * 100}%)` } : undefined}
          >
            <article className={cx("hero-tile", "hero-left")}>
              <div className={cx("hero-overlay")}>
                <h1>Celebrate your Shine</h1>
              </div>
            </article>

            <article className={cx("hero-tile", "hero-right")}>
              <div className={cx("hero-overlay")}>
                <h2>Rare Discoveries</h2>
                <a className={cx("btn", "btn-outline-light")} href="#collections">
                  Shop Now
                </a>
              </div>
            </article>

            <article className={cx("hero-tile", "hero-mini", "hero-mini-1")}>
              <div className={cx("hero-mini-copy")}>Earings</div>
            </article>
            <article className={cx("hero-tile", "hero-mini", "hero-mini-2")}>
              <div className={cx("hero-mini-copy")}>Necklace</div>
            </article>
            <article className={cx("hero-tile", "hero-mini", "hero-mini-3")}>
              <div className={cx("hero-mini-copy")}>Pendant</div>
            </article>
          </div>
          <div className={cx("hero-mobile-dots")} aria-label="Hero slides">
            {Array.from({ length: heroSlideCount }).map((_, index) => (
              <button
                key={`hero-dot-${index}`}
                type="button"
                className={cx("hero-mobile-dot")}
                data-active={heroSlideIndex === index ? "true" : "false"}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setHeroSlideIndex(index)}
              />
            ))}
          </div>
        </section>

        <section className={cx("categories", "shell")} id="categories" data-animate>
          <div className={cx("category-list")}>
            {categoryDisplayItems.map((item) => {
              const isLoading = Boolean(item.loading);
              const hasImage = !isLoading && Boolean(item.image?.url);
              const WrapperTag = isLoading ? "div" : "a";
              return (
                <WrapperTag
                  key={item.id}
                  className={cx("category-item", isLoading ? "category-item-loading" : "")}
                  href={isLoading ? undefined : "#collections"}
                  aria-hidden={isLoading ? "true" : undefined}
                >
                  <span
                    className={cx(
                      "category-thumb",
                      isLoading ? "category-thumb-skeleton" : hasImage ? "" : item.tone
                    )}
                    aria-hidden="true"
                    style={
                      hasImage
                        ? {
                            backgroundImage: `url(${item.image.url})`,
                          }
                        : undefined
                    }
                  ></span>
                  {isLoading ? (
                    <span className={cx("category-text-skeleton")} />
                  ) : (
                    <span>{item.label}</span>
                  )}
                </WrapperTag>
              );
            })}
          </div>
          {!collectionsLoading && collectionsError ? (
            <p className={cx("reviews")} style={{ marginTop: "0.65rem", textAlign: "center" }}>
              {collectionsError}
            </p>
          ) : null}
        </section>

        <section className={cx("home-section", "shell")} id="collections" data-animate>
          <div className={cx("section-row")}>
            <h2 className={cx("section-title")}>Featured Products</h2>
            <a className={cx("section-link")} href="#">
              See All
            </a>
          </div>

          <div className={cx("products-scroll-outer")}>
            <div className={cx("products-scroll-inner")}>
              {featuredLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <ProductCard key={`featured-loading-${index}`} loading index={index} />
                  ))
                : featuredProducts.map((product, index) => (
                    <ProductCard key={`featured-${product.id}`} product={product} index={index} />
                  ))}
            </div>
          </div>

          {!featuredLoading && featuredError ? (
            <p className={cx("reviews")} style={{ marginTop: "0.75rem", color: "#800000" }}>
              {featuredError}
            </p>
          ) : null}

          {!featuredLoading && !featuredError && featuredProducts.length === 0 ? (
            <p className={cx("reviews")} style={{ marginTop: "0.75rem" }}>
              No featured products found. Add the `featured` tag in Shopify products.
            </p>
          ) : null}
        </section>

        <section className={cx("home-section", "shell")} id="popular-products" data-animate>
          <div className={cx("section-row")}>
            <h2 className={cx("section-title")}>Popular Products</h2>
            <a className={cx("section-link")} href="#">
              See All
            </a>
          </div>

          <div className={cx("products-scroll-outer")}>
            <div className={cx("products-scroll-inner")}>
              {popularLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <ProductCard key={`popular-loading-${index}`} loading index={index + 2} />
                  ))
                : popularProducts.map((product, index) => (
                    <ProductCard key={`popular-${product.id}`} product={product} index={index + 2} />
                  ))}
            </div>
          </div>

          {!popularLoading && popularError ? (
            <p className={cx("reviews")} style={{ marginTop: "0.75rem", color: "#800000" }}>
              {popularError}
            </p>
          ) : null}

          {!popularLoading && !popularError && popularProducts.length === 0 ? (
            <p className={cx("reviews")} style={{ marginTop: "0.75rem" }}>
              No popular products found. Add the `popular` tag in Shopify products.
            </p>
          ) : null}
        </section>

        <section className={cx("testimonial", "shell")} data-animate>
          <h2>Our Clients Love</h2>
          <div className={cx("testimonial-track")} role="list" aria-label="Customer testimonials">
            {clientLoveItems.map((item) => (
              <article
                key={`${item.name}-${item.location}`}
                className={cx("testimonial-card")}
                role="listitem"
              >
                <div className={cx("testimonial-avatar")}>
                  <img src={item.image} alt={`${item.name} from ${item.location}`} loading="lazy" />
                </div>
                <div className={cx("testimonial-stars")} aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={`${item.name}-star-${index}`}
                      size={14}
                      fill="currentColor"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className={cx("testimonial-review")}>{item.review}</p>
                <p className={cx("client-name")}>
                  {item.name} / <span>{item.location}</span>
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className={cx("faq", "shell")} id="faqs" data-animate>
          <div className={cx("section-heading")}>
            <h2>FAQs</h2>
          </div>

          <div className={cx("faq-list")}>
            {faqItems.map((item, index) => (
              <details key={item.q} className={cx("faq-item")} open={openFaqIndex === index}>
                <summary
                  onClick={(event) => {
                    event.preventDefault();
                    setOpenFaqIndex((current) => (current === index ? -1 : index));
                  }}
                >
                  <span>{item.q}</span>
                  <span className={cx("faq-icon")}>+</span>
                </summary>
                <p>
                  {item.a.includes("info@himanshubeads.in") ? (
                    <>
                      Reach us through Email or Call/Whatsapp in the contact section below at{" "}
                      <a href="mailto:info@himanshubeads.in">info@himanshubeads.in</a>.
                    </>
                  ) : (
                    item.a
                  )}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className={cx("trust", "shell")} data-animate>
          {trustItems.map((item) => (
            <article key={item.title} className={cx("trust-card")}>
              <span className={cx("trust-icon")} aria-hidden="true">
                <img src={item.icon} alt={item.alt} loading="lazy" width="38" height="38" />
              </span>
              <h3>{item.title}</h3>
            </article>
          ))}
        </section>
      </main>

      <Footer collections={collections} />
    </div>
  );
}
