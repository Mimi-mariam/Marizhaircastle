"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import styles from "./ProductFilters.module.css";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: CategoryOption[];
  availableTextures: string[];
  availableLengths: string[];
  totalResults: number;
}

export function ProductFilters({
  categories,
  availableTextures,
  availableLengths,
  totalResults,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isOpenMobile, setIsOpenMobile] = useState(false);

  // Read current query values
  const currentSearch = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentTexture = searchParams.get("texture") || "";
  const currentLength = searchParams.get("length") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentInStock = searchParams.get("inStock") === "true";
  const currentSort = searchParams.get("sort") || "newest";

  // Local state for instant text input before submit
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  const activeFilterCount = [
    Boolean(currentSearch),
    Boolean(currentCategory),
    Boolean(currentTexture),
    Boolean(currentLength),
    Boolean(currentMinPrice || currentMaxPrice),
    currentInStock,
  ].filter(Boolean).length;

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchInput.trim() || null });
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: minPriceInput ? minPriceInput : null,
      maxPrice: maxPriceInput ? maxPriceInput : null,
    });
  };

  const handleClearAll = () => {
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className={styles.wrapper}>
      {/* Top Search & Controls Bar */}
      <div className={styles.topBar}>
        <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
          <div className={styles.searchContainer}>
            <svg
              className={styles.searchIcon}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search wigs, bundles, bone straight..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search products"
            />
            {searchInput && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => {
                  setSearchInput("");
                  updateFilters({ q: null });
                }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" className={styles.searchSubmitBtn}>
            Search
          </button>
        </form>

        <div className={styles.topActions}>
          <button
            type="button"
            className={`${styles.filterToggleBtn} ${
              activeFilterCount > 0 ? styles.filterToggleActive : ""
            }`}
            onClick={() => setIsOpenMobile((prev) => !prev)}
            aria-expanded={isOpenMobile}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className={styles.filterCountBadge}>
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className={styles.sortContainer}>
            <label htmlFor="catalog-sort" className={styles.sortLabel}>
              Sort:
            </label>
            <select
              id="catalog-sort"
              className={styles.sortSelect}
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category & Texture Quick-Select Bar */}
      <div className={styles.filterPillsSection}>
        <div className={styles.categoryPills} role="navigation" aria-label="Product Categories">
          <button
            type="button"
            className={`${styles.pill} ${!currentCategory ? styles.pillActive : ""}`}
            onClick={() => updateFilters({ category: null })}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`${styles.pill} ${
                currentCategory === c.slug ? styles.pillActive : ""
              }`}
              onClick={() =>
                updateFilters({
                  category: currentCategory === c.slug ? null : c.slug,
                })
              }
            >
              {c.name}
            </button>
          ))}
        </div>

        {availableTextures.length > 0 && (
          <div className={styles.texturePills} role="navigation" aria-label="Hair Textures">
            <span className={styles.textureGroupLabel}>Textures:</span>
            {availableTextures.map((tex) => (
              <button
                key={tex}
                type="button"
                className={`${styles.texturePill} ${
                  currentTexture.toLowerCase() === tex.toLowerCase()
                    ? styles.texturePillActive
                    : ""
                }`}
                onClick={() =>
                  updateFilters({
                    texture:
                      currentTexture.toLowerCase() === tex.toLowerCase()
                        ? null
                        : tex,
                  })
                }
              >
                {tex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Panel (Desktop Always or Mobile Drawer) */}
      <div
        className={`${styles.filterPanel} ${
          isOpenMobile ? styles.filterPanelOpen : ""
        }`}
      >
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Filter Products</h2>
          <button
            type="button"
            className={styles.closePanelBtn}
            onClick={() => setIsOpenMobile(false)}
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>

        <div className={styles.panelGrid}>
          {/* Hair Texture Filter */}
          {availableTextures.length > 0 && (
            <div className={styles.filterGroup}>
              <label htmlFor="texture-filter" className={styles.filterGroupLabel}>
                Hair Texture
              </label>
              <select
                id="texture-filter"
                className={styles.filterSelect}
                value={currentTexture}
                onChange={(e) =>
                  updateFilters({ texture: e.target.value || null })
                }
              >
                <option value="">All Textures</option>
                {availableTextures.map((texture) => (
                  <option key={texture} value={texture}>
                    {texture}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Hair Length Filter */}
          {availableLengths.length > 0 && (
            <div className={styles.filterGroup}>
              <label htmlFor="length-filter" className={styles.filterGroupLabel}>
                Hair Length
              </label>
              <select
                id="length-filter"
                className={styles.filterSelect}
                value={currentLength}
                onChange={(e) =>
                  updateFilters({ length: e.target.value || null })
                }
              >
                <option value="">All Lengths</option>
                {availableLengths.map((len) => (
                  <option key={len} value={len}>
                    {len}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price Range */}
          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Price Range (₦)</span>
            <form onSubmit={handlePriceApply} className={styles.priceForm}>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="Min ₦"
                className={styles.priceInput}
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                aria-label="Minimum price"
              />
              <span className={styles.priceDivider}>–</span>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="Max ₦"
                className={styles.priceInput}
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                aria-label="Maximum price"
              />
              <button type="submit" className={styles.priceApplyBtn}>
                Apply
              </button>
            </form>
          </div>

          {/* In Stock Toggle */}
          <div className={styles.filterGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) =>
                  updateFilters({
                    inStock: e.target.checked ? "true" : null,
                  })
                }
                className={styles.checkbox}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </div>

        {/* Panel Footer / Reset */}
        {activeFilterCount > 0 && (
          <div className={styles.panelFooter}>
            <button
              type="button"
              className={styles.clearAllBtn}
              onClick={handleClearAll}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className={styles.activeTagsRow}>
          <span className={styles.activeTagsLabel}>Active filters:</span>
          {currentSearch && (
            <span className={styles.tag}>
              Search: &quot;{currentSearch}&quot;
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  updateFilters({ q: null });
                }}
                className={styles.tagRemoveBtn}
                aria-label="Remove search filter"
              >
                ✕
              </button>
            </span>
          )}
          {currentCategory && (
            <span className={styles.tag}>
              Category:{" "}
              {categories.find((c) => c.slug === currentCategory)?.name ||
                currentCategory}
              <button
                type="button"
                onClick={() => updateFilters({ category: null })}
                className={styles.tagRemoveBtn}
                aria-label="Remove category filter"
              >
                ✕
              </button>
            </span>
          )}
          {currentTexture && (
            <span className={styles.tag}>
              Texture: {currentTexture}
              <button
                type="button"
                onClick={() => updateFilters({ texture: null })}
                className={styles.tagRemoveBtn}
                aria-label="Remove texture filter"
              >
                ✕
              </button>
            </span>
          )}
          {currentLength && (
            <span className={styles.tag}>
              Length: {currentLength}
              <button
                type="button"
                onClick={() => updateFilters({ length: null })}
                className={styles.tagRemoveBtn}
                aria-label="Remove length filter"
              >
                ✕
              </button>
            </span>
          )}
          {(currentMinPrice || currentMaxPrice) && (
            <span className={styles.tag}>
              Price: ₦{Number(currentMinPrice || 0).toLocaleString()} –{" "}
              {currentMaxPrice
                ? `₦${Number(currentMaxPrice).toLocaleString()}`
                : "Any"}
              <button
                type="button"
                onClick={() => {
                  setMinPriceInput("");
                  setMaxPriceInput("");
                  updateFilters({ minPrice: null, maxPrice: null });
                }}
                className={styles.tagRemoveBtn}
                aria-label="Remove price filter"
              >
                ✕
              </button>
            </span>
          )}
          {currentInStock && (
            <span className={styles.tag}>
              In Stock Only
              <button
                type="button"
                onClick={() => updateFilters({ inStock: null })}
                className={styles.tagRemoveBtn}
                aria-label="Remove in stock filter"
              >
                ✕
              </button>
            </span>
          )}
          <button
            type="button"
            className={styles.clearAllInline}
            onClick={handleClearAll}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Loading Indicator and Results Count */}
      <div className={styles.statusBar}>
        <span className={styles.resultsCount}>
          {totalResults} {totalResults === 1 ? "product" : "products"} found
        </span>
        {isPending && <span className={styles.loadingSpinner}>Updating...</span>}
      </div>
    </div>
  );
}
