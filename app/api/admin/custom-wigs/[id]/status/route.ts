import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const updateStatusSchema = z.object({
  status: z.enum([
    "RECEIVED",
    "IN_REVIEW",
    "CONFIRMED",
    "COMPLETED",
    "DECLINED",
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

    const existing = await prisma.customWigRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.customWigRequest.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({
      success: true,
      request: { id: updated.id, status: updated.status },
    });
  } catch (error) {
    console.error("Failed to update custom wig request status:", error);
    return NextResponse.json(
      { error: "Internal server error updating request" },
      { status: 500 }
    );
  }
}