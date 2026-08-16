"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "./HeroSlider.module.css";

interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  footnote?: string;
  ctaText: string;
  ctaLink: string;
  image: string;
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    title: "Own Your Look.",
    subtitle: "Premium hair, made for you.",
    ctaText: "Shop Collection",
    ctaLink: "/products",
    image: "/images/style-bone-straight.jpg",
  },
  {
    id: 2,
    title: "Hair That Speaks.",
    subtitle: "Find your perfect texture.",
    ctaText: "Explore Hair",
    ctaLink: "/products?style=body-wave",
    image: "/images/hero-wavy-hair.jpg",
  },
  {
    id: 3,
    title: "Your Hair. Tomorrow.",
    subtitle: "Fast delivery within 24 hours.*",
    footnote: "*After successful payment verification.",
    ctaText: "Shop Now",
    ctaLink: "/products?style=deep-wave",
    image: "/images/style-deep-wave.jpg",
  },
];

export const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  return (
    <section
      className={styles.heroSliderContainer}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero Showcase Slider"
    >
      {SLIDES.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className={`${styles.slide} ${isActive ? styles.activeSlide : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className={styles.slideOverlay} />
            <div className={styles.slideContent}>
              <h1 className={styles.slideTitle}>{slide.title}</h1>
              <p className={styles.slideSubtitle}>{slide.subtitle}</p>
              {slide.footnote && (
                <p className={styles.slideFootnote}>{slide.footnote}</p>
              )}
              <div className={styles.slideActions}>
                <Link href={slide.ctaLink} className={styles.primaryCta}>
                  {slide.ctaText}
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Controls */}
      <button
        type="button"
        className={`${styles.navButton} ${styles.prevButton}`}
        onClick={prevSlide}
        aria-label="Previous Slide"
      >
        ‹
      </button>
      <button
        type="button"
        className={`${styles.navButton} ${styles.nextButton}`}
        onClick={nextSlide}
        aria-label="Next Slide"
      >
        ›
      </button>

      {/* Pagination Indicators */}
      <div className={styles.pagination}>
        {SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`${styles.dot} ${
              index === currentSlide ? styles.activeDot : ""
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
