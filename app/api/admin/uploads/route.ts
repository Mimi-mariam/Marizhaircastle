import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth/session";

// Allowed MIME types for images & videos
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

// Size limits: 15MB for images, 100MB for videos
const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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
            "Invalid file type. Supported formats: JPEG, PNG, WEBP, GIF, MP4, WEBM, MOV.",
        },
        { status: 400 }
      );
    }

    const isVideo = mimeType.startsWith("video/");
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File size exceeds limit (${isVideo ? "100MB for video" : "15MB for image"}).`,
        },
        { status: 400 }
      );
    }

    // Generate safe filename with original extension
    const extension = path.extname(file.name).toLowerCase() || (isVideo ? ".mp4" : ".jpg");
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const safeFileName = `${isVideo ? "vid" : "img"}-${uniqueSuffix}${extension}`;

    // Target upload directory in public/uploads/products
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, safeFileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/products/${safeFileName}`;

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
        type: isVideo ? "video" : "image",
        name: file.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}
