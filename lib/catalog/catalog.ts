import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

const productInclude = Prisma.validator<Prisma.ProductInclude>()({
  category: { select: { name: true, slug: true } },
  images: { orderBy: { position: "asc" } },
  variants: {
    include: { inventory: true },
    orderBy: { name: "asc" },
  },
});

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export type ProductWithDetails = ProductWithRelations;

function toPlainPrice(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "number" ? value : Number(value);
}

function serializeProduct(product: ProductWithRelations) {
  return {
    ...product,
    price: toPlainPrice(product.price) ?? 0,
    previousPrice: toPlainPrice(product.previousPrice),
  };
}

export function serializeProducts(products: ProductWithRelations[]) {
  return products.map(serializeProduct);
}

export interface CatalogFilterParams {
  categorySlug?: string;
  search?: string;
  texture?: string;
  style?: string;
  type?: string;
  length?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: "newest" | "price-asc" | "price-desc" | "name-asc";
}


export async function getCategories() {
  return prisma.category.findMany({
    where: { archived: false },
    orderBy: { name: "asc" },
  });
}

export async function getCatalogFilterOptions() {
  const activeProducts = await prisma.product.findMany({
    where: { active: true, archived: false },
    select: {
      texture: true,
      length: true,
      price: true,
    },
  });

  const textures = Array.from(
    new Set(
      activeProducts
        .map((p) => p.texture?.trim())
        .filter((t): t is string => Boolean(t))
    )
  ).sort();

  const lengths = Array.from(
    new Set(
      activeProducts
        .map((p) => p.length?.trim())
        .filter((l): l is string => Boolean(l))
    )
  ).sort((a, b) => {
    const numA = parseInt(a, 10) || 0;
    const numB = parseInt(b, 10) || 0;
    return numA - numB;
  });

  return { textures, lengths };
}

export async function getActiveProducts(params?: string | CatalogFilterParams) {
  const options: CatalogFilterParams =
    typeof params === "string" ? { categorySlug: params } : params || {};

  const {
    categorySlug,
    search,
    texture,
    style,
    type,
    length,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy = "newest",
  } = options;

  const activeTexture = (texture || style)?.trim();

  const where: Prisma.ProductWhereInput = {
    active: true,
    archived: false,
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { texture: { contains: term, mode: "insensitive" } },
      { length: { contains: term, mode: "insensitive" } },
      { type: { contains: term, mode: "insensitive" } },
    ];
  }

  if (activeTexture) {
    where.texture = { contains: activeTexture, mode: "insensitive" };
  }

  if (type && type.trim()) {
    where.type = { contains: type.trim(), mode: "insensitive" };
  }


  if (length && length.trim()) {
    where.length = { contains: length.trim(), mode: "insensitive" };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }

  if (inStockOnly) {
    where.variants = {
      some: {
        inventory: {
          stock: { gt: 0 },
        },
      },
    };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sortBy === "price-asc") {
    orderBy = { price: "asc" };
  } else if (sortBy === "price-desc") {
    orderBy = { price: "desc" };
  } else if (sortBy === "name-asc") {
    orderBy = { name: "asc" };
  }

  const products = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy,
  });

  return serializeProducts(products);
}

export async function getFeaturedProducts(limit = 4) {
  const products = await prisma.product.findMany({
    where: { active: true, archived: false },
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return serializeProducts(products);
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true, archived: false },
    include: productInclude,
  });
}

