import { NextResponse } from "next/server";
import { z } from "zod";
import { getStatus } from "@/lib/auth/rateLimit";

const querySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") ?? "";
  const parsed = querySchema.safeParse({ email });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email address." },
      { status: 400 }
    );
  }

  return NextResponse.json(getStatus(parsed.data.email));
}
