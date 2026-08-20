import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";

const mergeCartSchema = z.object({
  items: z.array(
    z.object({
      variantId: z.string().min(1),
      quantity: z.number().int().positive().max(99),
    })
  ),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = mergeCartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { items } = parsed.data;
  if (items.length === 0) {
    return NextResponse.json({ success: true, count: 0 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      let cart = await tx.cart.findUnique({
        where: { userId: session.user.id },
      });
      if (!cart) {
        cart = await tx.cart.create({ data: { userId: session.user.id } });
      }

      for (const item of items) {
        // Verify variant and stock
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: {
            product: { select: { active: true, archived: true } },
            inventory: true,
          },
        });

        if (!variant || !variant.product.active || variant.product.archived) {
          continue; // Skip inactive/archived products
        }

        const stock = variant.inventory?.stock ?? 0;
        if (stock <= 0) {
          continue; // Skip out-of-stock items
        }

        const existing = await tx.cartItem.findUnique({
          where: { cartId_variantId: { cartId: cart.id, variantId: item.variantId } },
        });

        if (existing) {
          // Merge quantities up to available stock or 99
          const mergedQty = Math.min(existing.quantity + item.quantity, stock, 99);
          await tx.cartItem.update({
            where: { id: existing.id },
            data: { quantity: mergedQty },
          });
        } else {
          const initialQty = Math.min(item.quantity, stock, 99);
          await tx.cartItem.create({
            data: {
              cartId: cart.id,
              variantId: item.variantId,
              quantity: initialQty,
            },
          });
        }
      }
    });

    const total = await prisma.cartItem.aggregate({
      where: { cart: { userId: session.user.id } },
      _sum: { quantity: true },
    });

    return NextResponse.json({ success: true, itemCount: total._sum.quantity ?? 0 });
  } catch (error) {
    console.error("Cart merge error:", error);
    return NextResponse.json(
      { error: "Failed to merge guest cart." },
      { status: 500 }
    );
  }
}
