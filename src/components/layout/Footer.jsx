import Link from "next/link";
import styles from "./Footer.module.css";

const fallbackCollections = [
  { id: "fallback-new-arrivals", title: "New Arrivals" },
  { id: "fallback-rings", title: "Rings" },
  { id: "fallback-necklaces", title: "Necklaces" },
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
          <a href="#">Contact Us</a>
          <a href="#">Return Policy</a>
          <a href="#">Shipping & Delivery</a>
          <a href="#">Terms & Conditions</a>
          <a href="#">Initiate Return & Exchange</a>
          <a href="#">Privacy Policy</a>
        </section>

        <section>
          <h3>Quick Links</h3>
          <a href="/">Home</a>
          <Link href="/about">About Us</Link>
          <a href="/#categories">Shop by Category</a>
          <a href="/#collections">Featured Products</a>
          <a href="/#popular-products">Popular Products</a>
          <Link href="/cart">Cart</Link>
          <a href="/#faqs">Return & Exchange</a>
        </section>

        <section>
          <h3>Collections</h3>
          {visibleCollections.map((collection) => (
            <a key={collection.id} href="/#collections">
              {collection.title}
            </a>
          ))}
        </section>

        <section>
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
