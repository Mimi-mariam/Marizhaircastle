import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const updateStatusSchema = z.object({
  status: z.enum([
    "PENDING_PAYMENT",
    "PAYMENT_CONFIRMED",
    "PROCESSING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
    "PAYMENT_FAILED",
  ]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid status value", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Critical business rule: Never mark order as DELIVERED without verified payment
    if (parsed.data.status === "DELIVERED" && !order.confirmedAt) {
      return NextResponse.json(
        { error: "Cannot mark order as delivered before payment is verified" },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updated.id,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "Internal server error updating order" },
      { status: 500 }
    );
  }
}
