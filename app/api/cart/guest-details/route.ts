import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const guestDetailsSchema = z.object({
  variantIds: z.array(z.string().min(1)).max(50),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = guestDetailsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const { variantIds } = parsed.data;
  if (variantIds.length === 0) {
    return NextResponse.json({ variants: [] });
  }

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: {
        include: {
          images: { orderBy: { position: "asc" as const } },
        },
      },
      inventory: true,
    },
  });

  const formatted = variants.map((v) => {
    const product = v.product;
    const price = product.price.toNumber();
    const unavailable =
      !product.active || product.archived || (v.inventory?.stock ?? 0) <= 0;
    return {
      variantId: v.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      variantName: v.name,
      image: product.images[0] ?? null,
      unitPrice: price,
      stock: v.inventory?.stock ?? 0,
      unavailable,
    };
  });

  return NextResponse.json({ variants: formatted });
}
