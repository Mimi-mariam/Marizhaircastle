import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Allowed image types for custom wig inspiration photos. SVG is intentionally
// excluded: storing + serving user-uploaded SVG same-origin is an XSS vector.
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;

// Map MIME to a safe, fixed extension rather than trusting the client filename.
const MIME_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Supported formats: JPG, JPEG, PNG, GIF, WEBP.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 15MB limit." },
        { status: 400 }
      );
    }

    const safeFileName = `inspo-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}${MIME_EXTENSION[mimeType]}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "custom-wig");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, safeFileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/custom-wig/${safeFileName}`;

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        name: file.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Custom wig upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}