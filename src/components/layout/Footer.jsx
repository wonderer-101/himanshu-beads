import Link from "next/link";
import styles from "./Footer.module.css";

const fallbackCollections = [
  { id: "fallback-new-arrivals", title: "New Arrivals", handle: "new-arrivals" },
  { id: "fallback-rings", title: "Rings", handle: "rings" },
  { id: "fallback-necklaces", title: "Necklaces", handle: "necklaces" },
];

function cx(...classNames) {
  return classNames
    .filter(Boolean)
    .map((className) => styles[className])
    .join(" ");
}

export default function Footer({ collections = [] }) {
  const maxCollections = 6;
  const visibleCollections =
    collections.length > 0 ? collections.slice(0, maxCollections) : fallbackCollections.slice(0, maxCollections);

  return (
    <footer className={cx("site-footer")}>
      <div className={cx("shell", "footer-grid")}>
        <section>
          <h3>Help Center</h3>
          <a href="/#faqs">FAQ</a>
          <Link href="/contact-us">Contact Us</Link>
          <Link href="/cancellation-refund">Return Policy</Link>
          <Link href="/shipping-delivery">Shipping & Delivery</Link>
          <Link href="/terms-and-conditions">Terms & Conditions</Link>
          <a href="mailto:himanshubeads18@gmail.com">Order Support</a>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </section>

        <section>
          <h3>Quick Links</h3>
          <a href="/">Home</a>
          <Link href="/about">About Us</Link>
          <Link href="/collections">Shop by Category</Link>
          <Link href="/collections/featured">Featured Products</Link>
          <Link href="/collections/popular">Popular Products</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/profile">My Account</Link>
        </section>

        <section>
          <h3>Collections</h3>
          {visibleCollections.map((collection) => (
            <a
              key={collection.id}
              href={collection.handle ? `/collections/${encodeURIComponent(collection.handle)}` : "/#collections"}
            >
              {collection.title}
            </a>
          ))}
        </section>

        <section id="footer-contact">
          <h3>Contact Us</h3>
          <p>
            <strong>Email</strong>
            <br />
            <a href="mailto:himanshubeads18@gmail.com">himanshubeads18@gmail.com</a>
          </p>
          <p>
            <strong>Call/Whatsapp</strong>
            <br />
            <a href="tel:+918619299132">+91 861 929 9132</a>
          </p>
          <p>
            <strong>Support</strong>
            <br />
            <a href="mailto:himanshubeads18@gmail.com">himanshubeads18@gmail.com</a>
          </p>
        </section>
      </div>

      <div className={cx("shell", "footer-bottom")}>
        <p>
          <span className={styles.copyLine}>Himanshu Beads</span>
          <span className={styles.copyLine}>© All Rights Reserved</span>
        </p>
      </div>
    </footer>
  );
}
