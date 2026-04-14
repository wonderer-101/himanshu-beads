"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import styles from "./TrustSection.module.css";

// -- Testimonials --------------------------------------------------------

const REVIEWS = [
  { name: "Madhuri", location: "Mumbai", review: "Wonderful quality, beyond expectations. Seller is very polite and kind, and she explains the unique features of each jewellery piece.", image: "https://mrjewels.in/cdn/shop/files/image-1.png?v=1750097331" },
  { name: "Malika Kriplani", location: "Surat", review: "Amazing quality of jewellery. Love the polish and finish, just like real, and the pricing is very good.", image: "https://mrjewels.in/cdn/shop/files/image-8.png?v=1750097332" },
  { name: "Bijell", location: "Mumbai", review: "Absolutely fantastic experience. Ordered a ring and loved the sizing, finish, and overall quality as soon as I received it.", image: "https://mrjewels.in/cdn/shop/files/image.png?v=1750097332" },
  { name: "Neha Rattan", location: "Delhi", review: "Very beautiful jewellery, and the best part is that the pieces are lightweight and comfortable to wear for long hours.", image: "https://mrjewels.in/cdn/shop/files/image-7.png?v=1750097332" },
  { name: "Nazia", location: "Australia", review: "Buying jewellery online felt risky, but the support and product quality exceeded expectations. The piece was exquisite.", image: "https://mrjewels.in/cdn/shop/files/image-6.png?v=1750097332" },
];

const LOOPED_REVIEWS = [...REVIEWS, ...REVIEWS, ...REVIEWS];
const MIDDLE_BLOCK_START = REVIEWS.length;
const RIGHT_BLOCK_START = REVIEWS.length * 2;
const RESET_DELAY_MS = 380;

function normalizeToMiddle(index) {
  const logical = ((index % REVIEWS.length) + REVIEWS.length) % REVIEWS.length;
  return MIDDLE_BLOCK_START + logical;
}

function scrollToIndex(el, index, behavior = "smooth") {
  if (!el) return;
  const cards = el.children;
  const bounded = Math.max(0, Math.min(index, cards.length - 1));
  const card = cards[bounded];
  if (!card) return;

  const left = card.offsetLeft - (el.clientWidth - card.clientWidth) / 2;
  const max = Math.max(0, el.scrollWidth - el.clientWidth);
  const target = Math.max(0, Math.min(left, max));
  el.scrollTo({ left: target, behavior });
}

function Testimonials() {
  const [virtualIndex, setVirtualIndex] = useState(MIDDLE_BLOCK_START);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef(null);
  const autoTimerRef = useRef(null);
  const adjustingRef = useRef(false);

  const renderedReviews = isMobile ? LOOPED_REVIEWS : REVIEWS;
  const dot = ((virtualIndex % REVIEWS.length) + REVIEWS.length) % REVIEWS.length;

  const stopAuto = useCallback(() => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  }, []);

  const startAuto = useCallback(() => {
    stopAuto();
    if (!isMobile) return;

    autoTimerRef.current = setInterval(() => {
      setVirtualIndex((prev) => {
        const next = prev + 1;
        scrollToIndex(ref.current, next, "smooth");
        return next;
      });
    }, 3200);
  }, [isMobile, stopAuto]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);

    const onChange = (e) => setIsMobile(e.matches);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const initial = MIDDLE_BLOCK_START;
    setVirtualIndex(initial);
    requestAnimationFrame(() => {
      scrollToIndex(ref.current, initial, "auto");
    });
  }, [isMobile]);

  const handleScroll = useCallback((e) => {
    if (adjustingRef.current) return;

    const el = e.currentTarget;
    const cards = el.children;
    if (!cards.length) return;

    const viewportCenter = el.scrollLeft + el.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < cards.length; i += 1) {
      const cardCenter = cards[i].offsetLeft + cards[i].clientWidth / 2;
      const distance = Math.abs(cardCenter - viewportCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    setVirtualIndex(closestIndex);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    if (virtualIndex >= RIGHT_BLOCK_START || virtualIndex < MIDDLE_BLOCK_START) {
      const normalized = normalizeToMiddle(virtualIndex);
      const timer = setTimeout(() => {
        adjustingRef.current = true;
        scrollToIndex(ref.current, normalized, "auto");
        setVirtualIndex(normalized);
        requestAnimationFrame(() => {
          adjustingRef.current = false;
        });
      }, RESET_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [isMobile, virtualIndex]);

  useEffect(() => {
    startAuto();
    return () => stopAuto();
  }, [startAuto, stopAuto]);

  return (
    <div className={styles.reviewsWrap}>
      <h2 className={styles.sectionHeading}>Our Clients Love</h2>
      <div
        ref={ref}
        className={styles.reviewsTrack}
        onScroll={handleScroll}
        onTouchStart={stopAuto}
        onTouchEnd={startAuto}
        role="list"
        aria-label="Customer reviews"
      >
        {renderedReviews.map((item, i) => (
          <article key={`${item.name}-${i}`} className={styles.reviewCard} role="listitem">
            <img className={styles.avatar} src={item.image} alt={item.name} loading="lazy" />
            <div className={styles.stars} aria-label="5 stars">
              {[0,1,2,3,4].map((i) => <Star key={i} size={13} fill="currentColor" strokeWidth={0} />)}
            </div>
            <p className={styles.reviewText}>{item.review}</p>
            <p className={styles.reviewName}>{item.name} <span>/ {item.location}</span></p>
          </article>
        ))}
      </div>
      <div className={styles.dots} aria-hidden="true">
        {REVIEWS.map((_, i) => (
          <button
            key={i}
            type="button"
            className={styles.dot}
            data-active={dot === i ? "true" : "false"}
            onClick={() => {
              const target = isMobile ? (MIDDLE_BLOCK_START + i) : i;
              setVirtualIndex(target);
              scrollToIndex(ref.current, target, "smooth");
              startAuto();
            }}
          />
        ))}
      </div>
    </div>
  );
}

// -- FAQ -----------------------------------------------------------------

const FAQS = [
  { q: "What are the Return/Exchange Policy?", a: "Return & Exchange requests can be initiated from the Help Center. Contact us directly for order support." },
  { q: "What products does Himanshu Beads offer?", a: "We offer Necklaces, Earrings, Bangles/Bracelets, Rings, Pendants, Chokers, and curated jewellery collections including American Diamond and Kundan & Polki." },
  { q: "Are the beads suitable for daily-wear jewellery?", a: "Yes, collections include both daily-wear friendly options and premium statement sets, so you can choose based on comfort and occasion." },
  { q: "How do you ensure the quality of your beads?", a: "We focus on premium quality beads, curated craftsmanship, and checks for finishing consistency before dispatch." },
  { q: "How can I place an order or get in touch?", a: "Reach us through Email or Call/WhatsApp in the contact section below at himanshubeads18@gmail.com." },
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className={styles.faqWrap} id="faqs">
      <h2 className={styles.sectionHeading}>FAQs</h2>
      <div className={styles.faqList}>
        {FAQS.map((item, i) => (
          <div key={i} className={styles.faqItem} data-open={open === i ? "true" : "false"}>
            <button
              type="button"
              className={styles.faqQuestion}
              aria-expanded={open === i}
              onClick={() => setOpen((c) => (c === i ? -1 : i))}
            >
              <span>{item.q}</span>
              <span className={styles.faqIcon} aria-hidden="true">{open === i ? "-" : "+"}</span>
            </button>
            {open === i && (
              <p className={styles.faqAnswer}>
                {item.a.includes("himanshubeads18@gmail.com") ? (
                  <>Reach us through Email or Call/WhatsApp in the contact section below at <a href="mailto:himanshubeads18@gmail.com">himanshubeads18@gmail.com</a>.</>
                ) : item.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Trust cards ---------------------------------------------------------

const TRUST_ITEMS = [
  { title: "Express & Worldwide Shipping", icon: "/icons/trust/shipping.svg", alt: "Shipping" },
  { title: "100% Secure Checkout", icon: "/icons/trust/secure-checkout.svg", alt: "Secure checkout" },
  { title: "COD Available", icon: "/icons/trust/cod.svg", alt: "Cash on delivery" },
  { title: "Premium Support", icon: "/icons/trust/support.svg", alt: "Support" },
];

function TrustCards() {
  return (
    <div className={styles.trustGrid} aria-label="Why shop with us">
      {TRUST_ITEMS.map((item) => (
        <article key={item.title} className={styles.trustCard}>
          <div className={styles.trustIcon}>
            <img src={item.icon} alt={item.alt} width="40" height="40" loading="lazy" />
          </div>
          <h3 className={styles.trustLabel}>{item.title}</h3>
        </article>
      ))}
    </div>
  );
}

// -- Exported section ----------------------------------------------------

export default function TrustSection() {
  return (
    <section className={styles.section} data-animate>
      <Testimonials />
      <Faq />
      <TrustCards />
    </section>
  );
}
