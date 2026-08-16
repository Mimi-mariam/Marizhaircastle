import React from "react";
import { prisma } from "@/lib/db/prisma";
import { InventoryManager } from "@/components/admin/InventoryManager";
import styles from "./inventory-page.module.css";

export default async function AdminInventoryPage() {
  const inventoryItems = await prisma.inventory.findMany({
    orderBy: { stock: "asc" },
    include: {
      variant: {
        include: {
          product: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Inventory & Stock Levels</h1>
          <p className={styles.subtitle}>
            Monitor and adjust stock quantities in real time to avoid overselling.
          </p>
        </div>
      </div>

      <InventoryManager items={inventoryItems} />
    </div>
  );
}
