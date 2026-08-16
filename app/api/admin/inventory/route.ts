import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const updateInventorySchema = z.object({
  inventoryId: z.string().min(1, "Inventory ID is required"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
});

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateInventorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid inventory payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { inventoryId, stock } = parsed.data;

    const updated = await prisma.inventory.update({
      where: { id: inventoryId },
      data: { stock },
    });

    return NextResponse.json({
      success: true,
      inventory: {
        id: updated.id,
        stock: updated.stock,
      },
    });
  } catch (error) {
    console.error("Failed to update inventory stock:", error);
    return NextResponse.json(
      { error: "Internal server error updating inventory" },
      { status: 500 }
    );
  }
}
