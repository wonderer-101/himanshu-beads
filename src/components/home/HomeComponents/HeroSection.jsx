"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HeroSection.module.css";

const SLIDES = [
  { type: "left" },
  { type: "right" },
  { type: "mini1" },
  { type: "mini2" },
  { type: "mini3" },
];

const SLIDE_COUNT = SLIDES.length;

function Tile({ type, active = true }) {
  const activeState = active ? "true" : "false";

  if (type === "left") {
    return (
      <article className={styles.tile + " " + styles.tileLeft} data-active={activeState}>
        <div className={styles.overlay}>
          <h1 className={styles.h1}>Celebrate your Shine</h1>
        </div>
      </article>
    );
  }

  if (type === "right") {
    return (
      <article className={styles.tile + " " + styles.tileRight} data-active={activeState}>
        <div className={styles.overlay}>
          <h2 className={styles.h2}>Rare Discoveries</h2>
          <a className={styles.shopBtn} href="#collections">Shop Now</a>
        </div>
      </article>
    );
  }

  const miniClass =
    type === "mini1" ? styles.tileMini1 :
    type === "mini2" ? styles.tileMini2 :
    styles.tileMini3;

  const miniLabel =
    type === "mini1" ? "Earrings" :
    type === "mini2" ? "Necklace" :
    "Pendant";

  return (
    <article className={styles.tile + " " + styles.tileMini + " " + miniClass} data-active={activeState}>
      <span className={styles.miniLabel}>{miniLabel}</span>
    </article>
  );
}

export default function HeroSection() {
  const [slide, setSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef(null);
  const timerRef = useRef(null);

  // Detect mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1080px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, []);

  const startTimer = () => {
    stopTimer();
    if (!isMobile) return;
    timerRef.current = setInterval(() => {
      setSlide((s) => (s + 1) % SLIDE_COUNT);
    }, 3500);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Auto-advance only on mobile
  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      setSlide(0);
    }
  }, [isMobile]);

  const goToSlide = (index) => {
    const nextIndex = ((index % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT;
    setSlide(nextIndex);
    startTimer(); // Reset timer on manual interaction
  };

  function onTouchStart(e) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }
  function onTouchEnd(e) {
    const start = touchStartX.current;
    const end = e.changedTouches[0]?.clientX ?? null;
    touchStartX.current = null;
    if (start == null || end == null || Math.abs(start - end) < 40) return;
    
    if (start - end > 0) {
      goToSlide(slide + 1);
    } else {
      goToSlide(slide - 1);
    }
  }

  return (
    <section
      className={styles.hero}
      aria-label="Hero banner"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={styles.track}
      >
        {SLIDES.map((item, idx) => (
          <Tile
            key={`${item.type}-${idx}`}
            type={item.type}
            active={isMobile ? (slide === idx) : true}
          />
        ))}
      </div>

      {/* Dash indicators -- shown only on mobile via CSS */}
      <div className={styles.dots} aria-label="Slide indicators">
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={styles.dot}
            data-active={slide === i ? "true" : "false"}
            onClick={() => goToSlide(i)}
            aria-label={"Slide " + (i + 1)}
          />
        ))}
      </div>
    </section>
  );
}
