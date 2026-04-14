import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import styles from "./LegalPage.module.css";

export default function LegalPage({
  title,
  lastUpdated = "April 14, 2026",
  children,
}) {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.shell}>
          <article className={styles.card}>
            <header className={styles.header}>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.updated}>Last updated: {lastUpdated}</p>
            </header>

            <div className={styles.content}>{children}</div>

            <div className={styles.actions}>
              <Link href="/" className={styles.primaryBtn}>
                Back to Home
              </Link>
              <a className={styles.secondaryBtn} href="mailto:himanshubeads18@gmail.com">
                himanshubeads18@gmail.com
              </a>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
