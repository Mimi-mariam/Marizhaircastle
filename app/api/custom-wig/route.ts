import { NextResponse } from "next/server";
import { customWigRequestSchema } from "@/lib/validation/custom-wig";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = customWigRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid submission",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const created = await prisma.customWigRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        wigType: data.wigType,
        laceSize: data.laceSize,
        bundles: data.bundles,
        capSize: data.capSize,
        length: data.length ?? null,
        styleInspoUrl: data.styleInspoUrl,
        colorInspoUrl: data.colorInspoUrl,
        notes: data.notes ?? null,
      },
      select: { id: true },
    });

    return NextResponse.json(
      { success: true, id: created.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create custom wig request:", error);
    return NextResponse.json(
      { error: "Internal server error creating your request" },
      { status: 500 }
    );
  }
}