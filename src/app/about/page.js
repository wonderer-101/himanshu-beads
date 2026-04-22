import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "./about.module.css";

const STATS = [
  { value: "10K+", label: "Happy Shoppers" },
  { value: "250+", label: "Curated Designs" },
  { value: "99%", label: "Positive Feedback" },
];

const PILLARS = [
  {
    title: "Elegant, Wearable Designs",
    description:
      "Every collection balances statement appeal with all-day comfort for effortless styling.",
  },
  {
    title: "Premium Quality Finish",
    description:
      "From polish to detailing, each piece is checked for consistency, durability, and refined feel.",
  },
  {
    title: "Customer-First Experience",
    description:
      "Clear communication, dependable support, and a smooth experience from discovery to delivery.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.shell}>
          <section className={styles.hero}>
            <div className={styles.intro}>
              <p className={styles.kicker}>Our Story</p>
              <h1 className={styles.title}>Crafting Signature Jewellery for Everyday Elegance</h1>
              <p className={styles.lead}>
                Himanshu Beads was built on one simple belief: jewellery should feel as special as
                the moments you wear it for. We curate timeless pieces with a modern aesthetic so
                every look feels polished, confident, and personal.
              </p>
            </div>

            <aside className={styles.heroPanel}>
              <h2>Why Customers Stay With Us</h2>
              <ul className={styles.heroList}>
                <li>Trend-aware collections with timeless appeal.</li>
                <li>Refined finishing focused on comfort and durability.</li>
                <li>Support that remains reliable before and after purchase.</li>
              </ul>
            </aside>
          </section>

          <section className={styles.stats} aria-label="Brand highlights">
            {STATS.map((item) => (
              <article key={item.label} className={styles.statCard}>
                <p className={styles.statValue}>{item.value}</p>
                <p className={styles.statLabel}>{item.label}</p>
              </article>
            ))}
          </section>

          <section className={styles.sectionBlock} aria-label="Our pillars">
            <h2 className={styles.sectionTitle}>Our Craft Principles</h2>
            <div className={styles.pillars}>
              {PILLARS.map((item, index) => (
                <article key={item.title} className={styles.pillarCard}>
                  <span className={styles.pillarIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.storyGrid}>
            <article className={styles.storyCard}>
              <h2 className={styles.sectionTitle}>What Makes Us Different</h2>
              <ul className={styles.list}>
                <li>Curated collections for both daily elegance and special occasions.</li>
                <li>Attention to detail in finish, fit, and visual harmony.</li>
                <li>Smooth shopping experience with proactive customer support.</li>
              </ul>
            </article>

            <article className={styles.storyCard}>
              <h2 className={styles.sectionTitle}>Our Promise</h2>
              <p className={styles.copy}>
                We are committed to jewellery that feels premium, looks memorable, and celebrates
                your personal style. Whether you choose a subtle everyday piece or a statement set,
                Himanshu Beads is here to make each purchase feel effortless and worthwhile.
              </p>
            </article>
          </section>

          <section className={styles.promiseBand}>
            <p>
              We don&apos;t just sell jewellery. We help you build moments, confidence, and
              identity through pieces you will love to wear again and again.
            </p>
          </section>

          <div className={styles.actions}>
            <Link href="/collections" className={styles.primaryAction}>
              Explore Collections
            </Link>
            <Link href="/contact-us" className={styles.secondaryAction}>
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
