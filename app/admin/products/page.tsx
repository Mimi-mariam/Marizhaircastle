import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { AdminTableFilters } from "@/components/admin/AdminTableFilters";
import styles from "./products-page.module.css";

interface AdminProductsPageProps {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    status?: string;
  }>;
}

export default async function AdminProductsPage(props: AdminProductsPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const searchQuery = searchParams.q?.trim();
  const categoryFilter = searchParams.category;
  const statusFilter = searchParams.status;

  const where: Prisma.ProductWhereInput = {
    archived: false,
  };

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { slug: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { texture: { contains: searchQuery, mode: "insensitive" } },
      { length: { contains: searchQuery, mode: "insensitive" } },
      {
        variants: {
          some: {
            sku: { contains: searchQuery, mode: "insensitive" },
          },
        },
      },
    ];
  }

  if (categoryFilter) {
    where.category = { slug: categoryFilter };
  }

  if (statusFilter === "active") {
    where.active = true;
  } else if (statusFilter === "draft") {
    where.active = false;
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        variants: {
          include: { inventory: true },
        },
      },
    }),
    prisma.category.findMany({
      where: { archived: false },
      orderBy: { name: "asc" },
    }),
  ]);

  const filterOptions = [
    {
      paramName: "category",
      label: "Category",
      options: categories.map((c) => ({ label: c.name, value: c.slug })),
    },
    {
      paramName: "status",
      label: "Status",
      options: [
        { label: "Active", value: "active" },
        { label: "Draft", value: "draft" },
      ],
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Hair Products & Catalog</h1>
          <p className={styles.subtitle}>
            Manage wig units, bundles, lace textures, and variant pricing.
          </p>
        </div>
        <div>
          <Link href="/admin/products/new" className={styles["add-btn"]}>
            + Add New Product
          </Link>
        </div>
      </div>

      <AdminTableFilters
        searchPlaceholder="Search product name, SKU, texture..."
        filters={filterOptions}
      />

      {products.length === 0 ? (
        <div className={styles.empty}>
          <p>No products found matching your search or filter criteria.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Hair Attributes</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Variants / Total Stock</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const totalStock = product.variants.reduce(
                (sum, v) => sum + (v.inventory?.stock ?? 0),
                0
              );

              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <strong className={styles["product-name"]}>{product.name}</strong>
                    <span className={styles["product-slug"]}>/{product.slug}</span>
                  </TableCell>
                  <TableCell>{product.category?.name || "Uncategorized"}</TableCell>
                  <TableCell>
                    <div className={styles.attributes}>
                      {product.texture && (
                        <span className={styles.tag}>Texture: {product.texture}</span>
                      )}
                      {product.length && (
                        <span className={styles.tag}>Length: {product.length}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <strong>₦{Number(product.price).toLocaleString()}</strong>
                  </TableCell>
                  <TableCell>
                    <span>
                      {product.variants.length} variants ({totalStock} in stock)
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.active ? "success" : "default"}>
                      {product.active ? "Active" : "Draft"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

