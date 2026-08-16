import { prisma } from "@/lib/db/prisma";
import type { DeliveryInfoInput } from "@/lib/validation/checkout";
import { getDeliveryFee, DELIVERY_ZONES } from "./delivery-zones";

export class OrderError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const ORDER_NUMBER_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateOrderNumber(): string {
  let suffix = "";
  for (let i = 0; i < 8; i++) {
    suffix += ORDER_NUMBER_CHARS[Math.floor(Math.random() * ORDER_NUMBER_CHARS.length)];
  }
  return `MHC-${suffix}`;
}

/**
 * Creates a PENDING_PAYMENT order from either an authenticated user's cart
 * or a guest cart, snapshots current prices, adds dynamic delivery fees based on zone,
 * verifies availability/stock, persists delivery info, and clears the cart.
 *
 * `items` (explicit list) overrides both cart sources and is used for direct
 * "Buy Now" checkouts — the user's persisted cart is left untouched in that case.
 */
export async function createOrder(params: {
  userId?: string | null;
  delivery: DeliveryInfoInput;
  items?: Array<{ variantId: string; quantity: number }>;
}) {
  const { userId, delivery, items } = params;
  const hasDirectItems = Boolean(items && items.length > 0);
  const orderNumber = generateOrderNumber();
  const deliveryFee = getDeliveryFee(delivery.deliveryZone);
  const zoneName = DELIVERY_ZONES[delivery.deliveryZone]?.name || delivery.deliveryZone;
  const locationWithZone = delivery.location
    ? `${delivery.location} (${zoneName} — Fee: ₦${deliveryFee.toLocaleString()})`
    : `${zoneName} (Delivery Fee: ₦${deliveryFee.toLocaleString()})`;

  return prisma.$transaction(async (tx) => {
    let resolvedUserId = userId;

    // If guest user, find or create guest user account by email
    if (!resolvedUserId) {
      let guestUser = await tx.user.findUnique({
        where: { email: delivery.email },
      });
      if (!guestUser) {
        guestUser = await tx.user.create({
          data: {
            name: delivery.fullName,
            email: delivery.email,
            passwordHash: "", // Guest marker
            role: "CUSTOMER",
          },
        });
      }
      resolvedUserId = guestUser.id;
    }

    let itemsToProcess: Array<{ variantId: string; quantity: number }> = [];

    if (hasDirectItems) {
      itemsToProcess = items ?? [];
    } else if (userId) {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: true },
      });
      itemsToProcess = cart?.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })) ?? [];
    } else {
      itemsToProcess = delivery.guestItems ?? [];
    }

    if (itemsToProcess.length === 0) {
      throw new OrderError(400, "Your cart is empty.");
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of itemsToProcess) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: {
          product: true,
          inventory: true,
        },
      });

      if (!variant || !variant.product.active || variant.product.archived) {
        throw new OrderError(409, "One or more items in your cart are no longer available.");
      }

      const stock = variant.inventory?.stock ?? 0;
      if (stock < item.quantity) {
        throw new OrderError(
          409,
          `Only ${stock} left in stock of ${variant.product.name} (${variant.name}). Please update your cart.`
        );
      }

      const unitPrice = variant.product.price.toNumber();
      subtotal += unitPrice * item.quantity;
      orderItems.push({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
      });
    }

    const totalAmount = subtotal + deliveryFee;

    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: resolvedUserId,
        status: "PENDING_PAYMENT",
        totalAmount,
        paymentReference: orderNumber,
        items: { create: orderItems },
        delivery: {
          create: {
            fullName: delivery.fullName,
            email: delivery.email,
            phone: delivery.phone,
            address: delivery.address,
            location: locationWithZone,
          },
        },
      },
    });

    if (userId && !hasDirectItems) {
      const userCart = await tx.cart.findUnique({ where: { userId } });
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
      }
    }

    return { order, totalAmount, deliveryFee, subtotal };
  });
}

// Backward compatible export
export async function createOrderFromCart(userId: string, delivery: DeliveryInfoInput) {
  return createOrder({ userId, delivery });
}

export async function getOrderForUser(userId: string, orderNumber: string) {
  return prisma.order.findFirst({
    where: { orderNumber, userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { include: { images: { orderBy: { position: "asc" as const } } } },
            },
          },
        },
      },
      delivery: true,
      payment: true,
    },
  });
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { include: { images: { orderBy: { position: "asc" as const } } } },
            },
          },
        },
      },
      delivery: true,
      payment: true,
    },
  });
}
