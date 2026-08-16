"use client";

import { useRef, useState, useEffect } from "react";
import { ProductCard, type ProductCardProduct } from "@/components/storefront/ProductCard";
import styles from "./StyleCarousel.module.css";

export function StyleCarousel({ products }: { products: ProductCardProduct[] }) {
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
  }, [products]);

  // Continuous auto-advance loop
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;

      const { scrollLeft, scrollWidth, clientWidth } = el;
      const firstCard = el.firstElementChild as HTMLElement | null;
      const step = firstCard ? firstCard.offsetWidth + 16 : 280;

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
          <span className={styles.eyebrow}>Featured Textures & Units</span>
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
          setTimeout(() => setIsPaused(false), 3000);
        }}
        onTouchCancel={() => setIsPaused(false)}
      >
        {products.map((product) => (
          <div key={product.id} className={styles.slideItem}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
