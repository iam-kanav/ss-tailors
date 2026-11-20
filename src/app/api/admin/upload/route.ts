import crypto from "node:crypto";
import { NextResponse } from "next/server";
import {
  checkRateLimit,
  detectVerifiedImageType,
  rateLimitResponse,
  requireAdminApi,
  verifySameOrigin,
} from "@/lib/security";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const admin = await requireAdminApi();
  if (admin.error) return admin.error;

  const limit = checkRateLimit(`admin:upload:${admin.user.id}`, 20, 15 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSec);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart upload." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Select an image file to upload." }, { status: 400 });
  }

  if (file.size === 0 || file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "Image must be smaller than 5 MB." },
      { status: 400 }
    );
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const verified = detectVerifiedImageType(buffer);
  if (!verified) {
    return NextResponse.json(
      {
        error:
          "Unsupported or invalid image format. Only verified JPEG, PNG, and WebP studio photographs are accepted.",
      },
      { status: 400 }
    );
  }

  // Cryptographically random filename prevents path traversal and cache collisions
  const objectPath = `products/${crypto.randomUUID()}.${verified.ext}`;

  const { error: uploadError } = await admin.supabase.storage
    .from("product-images")
    .upload(objectPath, buffer, {
      contentType: verified.mime,
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Storage upload failed. Please try again." },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = admin.supabase.storage.from("product-images").getPublicUrl(objectPath);

  await admin.supabase.from("admin_audit_logs").insert({
    actor_id: admin.user.id,
    action: "media.upload",
    entity_type: "storage",
    entity_id: objectPath,
    details: { mime: verified.mime, size_bytes: file.size },
  });

  return NextResponse.json(
    { url: publicUrl },
    { status: 201, headers: { "Cache-Control": "no-store" } }
  );
}
