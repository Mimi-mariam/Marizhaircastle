import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { getCartItemCount } from "@/lib/catalog/cart";
import { updateCartItemSchema } from "@/lib/validation/cart";

class CartError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const { variantId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = updateCartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }
  const { quantity } = parsed.data;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findFirst({
        where: { variantId, cart: { userId: session.user.id } },
        include: { variant: { include: { inventory: true } } },
      });

      if (!item) {
        throw new CartError(404, "Item not found in your cart.");
      }

      const stock = item.variant.inventory?.stock ?? 0;
      if (quantity > stock) {
        throw new CartError(
          409,
          `Only ${stock} in stock. Please reduce the quantity.`
        );
      }

      await tx.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      });

      const total = await tx.cartItem.aggregate({
        _sum: { quantity: true },
        where: { cart: { userId: session.user.id } },
      });
      return total._sum.quantity ?? 0;
    });

    return NextResponse.json({ itemCount: updated });
  } catch (error) {
    if (error instanceof CartError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Update cart item failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const { variantId } = await params;

  await prisma.cartItem.deleteMany({
    where: { variantId, cart: { userId: session.user.id } },
  });

  const itemCount = await getCartItemCount(session.user.id);
  return NextResponse.json({ itemCount });
}