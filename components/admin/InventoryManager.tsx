"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import styles from "./InventoryManager.module.css";

interface InventoryItem {
  id: string;
  stock: number;
  variant: {
    id: string;
    name: string;
    sku: string;
    product: {
      id: string;
      name: string;
    };
  };
}

export const InventoryManager: React.FC<{ items: InventoryItem[] }> = ({ items }) => {
  const router = useRouter();
  const [stockMap, setStockMap] = useState<{ [id: string]: number }>(
    items.reduce((acc, item) => ({ ...acc, [item.id]: item.stock }), {})
  );
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ [id: string]: string }>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.variant.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variant.sku.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (stockFilter === "OUT_OF_STOCK") return item.stock === 0;
      if (stockFilter === "LOW_STOCK") return item.stock > 0 && item.stock <= 3;
      if (stockFilter === "IN_STOCK") return item.stock > 0;

      return true;
    });
  }, [items, searchTerm, stockFilter]);

  const handleStockChange = (id: string, value: string) => {
    const parsed = parseInt(value, 10);
    setStockMap((prev) => ({ ...prev, [id]: isNaN(parsed) ? 0 : Math.max(0, parsed) }));
  };

  const handleSave = async (id: string) => {
    setSavingId(id);
    setFeedback((prev) => ({ ...prev, [id]: "" }));

    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryId: id,
          stock: stockMap[id],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update stock");
      }

      setFeedback((prev) => ({ ...prev, [id]: "✓ Saved" }));
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update stock";
      setFeedback((prev) => ({ ...prev, [id]: message }));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
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
            placeholder="Search variant name, product, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            aria-label="Search inventory"
          />
          {searchTerm && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setSearchTerm("")}
              aria-label="Clear inventory search"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="stock-filter" className={styles.filterLabel}>
            Stock Status:
          </label>
          <select
            id="stock-filter"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className={styles.filterSelect}
          >
            <option value="ALL">All Levels ({items.length})</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock (≤ 3 units)</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No inventory items match your search or filter.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant & SKU</TableHead>
              <TableHead>Current Level</TableHead>
              <TableHead>Stock Adjustment</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
              const currentVal = stockMap[item.id] ?? item.stock;
              const isChanged = currentVal !== item.stock;
              const msg = feedback[item.id];

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <strong className={styles["product-name"]}>
                      {item.variant.product.name}
                    </strong>
                  </TableCell>
                  <TableCell>
                    <span className={styles["variant-info"]}>
                      {item.variant.name} ({item.variant.sku})
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.stock === 0 ? "error" : item.stock <= 3 ? "warning" : "success"}>
                      {item.stock} in stock
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <input
                      type="number"
                      min="0"
                      value={currentVal}
                      onChange={(e) => handleStockChange(item.id, e.target.value)}
                      className={styles["stock-input"]}
                    />
                  </TableCell>
                  <TableCell>
                    <div className={styles["action-cell"]}>
                      <Button
                        size="sm"
                        variant={isChanged ? "primary" : "outline"}
                        disabled={!isChanged || savingId === item.id}
                        isLoading={savingId === item.id}
                        onClick={() => handleSave(item.id)}
                      >
                        Update
                      </Button>
                      {msg && (
                        <span
                          className={`${styles.msg} ${
                            msg.startsWith("✓") ? styles["msg-success"] : styles["msg-error"]
                          }`}
                        >
                          {msg}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

