"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import styles from "./AdminTableFilters.module.css";

export interface FilterDropdownOption {
  paramName: string;
  label: string;
  options: { label: string; value: string }[];
}

interface AdminTableFiltersProps {
  searchPlaceholder?: string;
  searchParamName?: string;
  filters?: FilterDropdownOption[];
}

export function AdminTableFilters({
  searchPlaceholder = "Search...",
  searchParamName = "q",
  filters = [],
}: AdminTableFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get(searchParamName) || "";
  const [searchInput, setSearchInput] = useState(currentSearch);

  const hasActiveFilters =
    Boolean(currentSearch) ||
    filters.some((f) => Boolean(searchParams.get(f.paramName)));

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "" || value === undefined) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam(searchParamName, searchInput.trim() || null);
  };

  const handleReset = () => {
    setSearchInput("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <div className={styles.searchContainer}>
          <svg
            className={styles.searchIcon}
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label={searchPlaceholder}
          />
          {searchInput && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => {
                setSearchInput("");
                updateParam(searchParamName, null);
              }}
              aria-label="Clear search text"
            >
              ✕
            </button>
          )}
        </div>
        <button type="submit" className={styles.searchSubmitBtn}>
          Search
        </button>
      </form>

      <div className={styles.dropdownsContainer}>
        {filters.map((filter) => {
          const val = searchParams.get(filter.paramName) || "";
          return (
            <div key={filter.paramName} className={styles.selectWrapper}>
              <select
                className={styles.select}
                value={val}
                onChange={(e) =>
                  updateParam(filter.paramName, e.target.value || null)
                }
                aria-label={filter.label}
              >
                <option value="">{filter.label}: All</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
          >
            Reset
          </button>
        )}

        {isPending && (
          <span className={styles.loadingIndicator}>Filtering...</span>
        )}
      </div>
    </div>
  );
}
