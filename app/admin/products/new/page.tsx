import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { NewProductForm } from "@/components/admin/NewProductForm";
import styles from "./new-product-page.module.css";

export default async function AdminNewProductPage() {
  const categories = await prisma.category.findMany({
    where: { archived: false },
    select: { id: true, name: true },
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/admin/products" className={styles["back-link"]}>
          ← Back to Products
        </Link>
        <h1 className={styles.title}>Add New Hair Product</h1>
        <p className={styles.subtitle}>
          Create a new wig unit or hair bundle with custom texture and length attributes.
        </p>
      </div>

      <NewProductForm categories={categories} />
    </div>
  );
}
