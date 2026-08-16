import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  previousPrice: z.number().positive().optional(),
  categoryId: z.string().optional(),
  texture: z.string().optional(),
  length: z.string().optional(),
  color: z.string().optional(),
  careInfo: z.string().optional(),
  videoUrl: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        alt: z.string().optional(),
        position: z.number().int().nonnegative().optional(),
      })
    )
    .optional(),
  initialStock: z.number().int().nonnegative().default(0),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      name,
      slug,
      description,
      price,
      previousPrice,
      categoryId,
      texture,
      length,
      color,
      careInfo,
      videoUrl,
      images,
      initialStock,
    } = parsed.data;

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A product with this URL slug already exists" },
        { status: 409 }
      );
    }

    // Ensure categoryId is valid null or existing id
    const validCategoryId = categoryId && categoryId.trim() !== "" ? categoryId : undefined;

    // Create product, images, default variant, and inventory in a transaction
    const createdProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name,
          slug,
          description,
          price,
          previousPrice,
          texture,
          length,
          color,
          careInfo,
          videoUrl: videoUrl || null,
          active: true,
          archived: false,
          category: validCategoryId ? { connect: { id: validCategoryId } } : undefined,
          images: images && images.length > 0
            ? {
                create: images.map((img, idx) => ({
                  url: img.url,
                  alt: img.alt || name,
                  position: typeof img.position === "number" ? img.position : idx,
                })),
              }
            : undefined,
        },
      });

      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const variantSku = `${slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "PROD"}-${randomSuffix}`;

      const variant = await tx.productVariant.create({
        data: {
          productId: product.id,
          name: "Standard Unit",
          sku: variantSku,
        },
      });

      await tx.inventory.create({
        data: {
          variantId: variant.id,
          stock: initialStock,
        },
      });

      return product;
    });

    return NextResponse.json({ success: true, product: createdProduct }, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error creating product";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
