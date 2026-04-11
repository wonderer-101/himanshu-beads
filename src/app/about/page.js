import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.shell}>
          <section className={styles.card}>
            <h1 className={styles.title}>About Us</h1>
            <p className={styles.copy}>
              At Himanshu Beads, we craft premium-quality beads that blend traditional
              artistry with modern design sensibilities. Our focus is on fine detailing,
              consistent quality, and timeless appeal for designers, artisans, and jewellery
              enthusiasts.
            </p>
            <p className={styles.copy}>
              Driven by craftsmanship, each piece is built for finish and durability. From
              daily-wear creations to statement jewellery, Himanshu Beads supports creativity
              with reliable and beautifully crafted materials.
            </p>
            <Link href="/" className={styles.back}>
              Back to Home
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
