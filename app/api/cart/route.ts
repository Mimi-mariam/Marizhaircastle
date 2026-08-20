import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/authOptions";
import { prisma } from "@/lib/db/prisma";
import { getCartItemCount } from "@/lib/catalog/cart";
import { addCartItemSchema } from "@/lib/validation/cart";

class CartError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const itemCount = await getCartItemCount(session.user.id);
  return NextResponse.json({ itemCount });
}

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

  const parsed = addCartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { variantId, quantity } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
        include: {
          product: { select: { id: true, active: true, archived: true } },
          inventory: true,
        },
      });

      if (!variant || !variant.product.active || variant.product.archived) {
        throw new CartError(404, "This product is no longer available.");
      }

      const stock = variant.inventory?.stock ?? 0;
      if (stock <= 0) {
        throw new CartError(409, "This item is out of stock.");
      }

      let cart = await tx.cart.findUnique({
        where: { userId: session.user.id },
      });
      if (!cart) {
        cart = await tx.cart.create({ data: { userId: session.user.id } });
      }

      const existing = await tx.cartItem.findUnique({
        where: { cartId_variantId: { cartId: cart.id, variantId } },
      });

      const newQuantity = (existing?.quantity ?? 0) + quantity;
      if (newQuantity > stock) {
        throw new CartError(
          409,
          `Only ${stock} in stock. Please reduce the quantity.`
        );
      }

      await tx.cartItem.upsert({
        where: { cartId_variantId: { cartId: cart.id, variantId } },
        create: { cartId: cart.id, variantId, quantity },
        update: { quantity: newQuantity },
      });

      const total = await tx.cartItem.aggregate({
        _sum: { quantity: true },
        where: { cartId: cart.id },
      });

      return { itemCount: total._sum.quantity ?? 0 };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof CartError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Add to cart failed:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}