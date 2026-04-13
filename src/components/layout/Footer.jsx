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
  const visibleCollections = collections.length > 0 ? collections.slice(0, 6) : fallbackCollections;

  return (
    <footer className={cx("site-footer")}>
      <div className={cx("shell", "footer-grid")}>
        <section>
          <h3>Help Center</h3>
          <a href="/#faqs">FAQ</a>
          <a href="#footer-contact">Contact Us</a>
          <a href="/#faqs">Return Policy</a>
          <a href="/#faqs">Shipping & Delivery</a>
          <a href="/#faqs">Terms & Conditions</a>
          <a href="mailto:info@himanshubeads.in">Order Support</a>
          <a href="/about">Privacy Policy</a>
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
            <a href="mailto:info@himanshubeads.in">info@himanshubeads.in</a>
          </p>
          <p>
            <strong>Call/Whatsapp</strong>
            <br />
            <a href="mailto:info@himanshubeads.in">info@himanshubeads.in</a>
          </p>
          <p>
            <strong>GST Registeration Number</strong>
            <br />
            <a href="mailto:info@himanshubeads.in">info@himanshubeads.in</a>
          </p>
        </section>
      </div>

      <div className={cx("shell", "footer-bottom")}>
        <p>Himanshu Beads All Copyright Reserved</p>
      </div>
    </footer>
  );
}
