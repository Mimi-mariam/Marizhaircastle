"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import styles from "./StyleCarousel.module.css";

export type HairStyleItem = {
  name: string;
  desc: string;
  image: string;
  tag: string;
};

export function StyleCarousel({ styles: items }: { styles: HairStyleItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  function checkScroll() {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [items]);

  // Continuous auto-advance loop
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      // Get actual rendered card width plus gap
      const firstCard = el.firstElementChild as HTMLElement | null;
      const step = firstCard ? firstCard.offsetWidth + 16 : 280;

      // If reached end, scroll back to start, else advance
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    const step = firstCard ? firstCard.offsetWidth + 16 : 280;
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.eyebrow}>Discover Textures</span>
          <h2 className={styles.title}>Shop By Style</h2>
        </div>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous styles"
          >
            ←
          </button>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Next styles"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={styles.track}
        onScroll={checkScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => {
          // Resume auto-scroll after 3 seconds following touch release
          setTimeout(() => setIsPaused(false), 3000);
        }}
        onTouchCancel={() => setIsPaused(false)}
      >
        {items.map((item) => (
          <Link
            key={item.tag}
            href={`/products?texture=${encodeURIComponent(item.tag)}`}
            className={styles.card}
          >
            <div className={styles.imageWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={`Marizhaircastle ${item.name} Hair Style`}
                className={styles.image}
                loading="lazy"
              />
            </div>
            <div className={styles.body}>
              <h3 className={styles.name}>{item.name}</h3>
              <p className={styles.desc}>{item.desc}</p>
              <span className={styles.linkText}>Explore Collection →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
