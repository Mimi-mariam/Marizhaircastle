import { prisma } from "@/lib/db/prisma";

export async function getCartForUser(userId: string) {
  return prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { id: "asc" },
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: { orderBy: { position: "asc" as const } },
                },
              },
              inventory: true,
            },
          },
        },
      },
    },
  });
}

export async function getCartItemCount(userId: string): Promise<number> {
  const result = await prisma.cartItem.aggregate({
    where: { cart: { userId } },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}
