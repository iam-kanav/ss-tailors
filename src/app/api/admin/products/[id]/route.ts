import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, rateLimitResponse, requireAdminApi, verifySameOrigin } from "@/lib/security";
import { updateProductSchema } from "@/lib/validators";

const uuidParam = z.string().uuid();

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const admin = await requireAdminApi();
  if (admin.error) return admin.error;

  const limit = checkRateLimit(`admin:product:update:${admin.user.id}`, 60, 15 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSec);

  const { id } = await context.params;
  if (!uuidParam.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid product identifier." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid update payload." },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const patch: Record<string, unknown> = {};
  if (d.name !== undefined) patch.name = d.name;
  if (d.tibetan_name !== undefined) patch.tibetan_name = d.tibetan_name;
  if (d.slug !== undefined) patch.slug = d.slug;
  if (d.sku !== undefined) patch.sku = d.sku;
  if (d.category_id !== undefined) patch.category_id = d.category_id;
  if (d.description !== undefined) patch.description = d.description;
  if (d.fabric !== undefined) patch.fabric = d.fabric;
  if (d.care_instructions !== undefined) patch.care_instructions = d.care_instructions;
  if (d.price_rupees !== undefined) patch.price_paise = Math.round(d.price_rupees * 100);
  if (d.compare_at_rupees !== undefined) {
    patch.compare_at_paise =
      typeof d.compare_at_rupees === "number" ? Math.round(d.compare_at_rupees * 100) : null;
  }
  if (d.stock_quantity !== undefined) patch.stock_quantity = d.stock_quantity;
  if (d.sizes !== undefined) patch.sizes = d.sizes;
  if (d.allow_custom_tailoring !== undefined) {
    patch.allow_custom_tailoring = d.allow_custom_tailoring;
  }
  if (d.lead_time_days !== undefined) patch.lead_time_days = d.lead_time_days;
  if (d.image_url !== undefined) patch.image_url = d.image_url;
  if (d.is_featured !== undefined) patch.is_featured = d.is_featured;
  if (d.is_active !== undefined) patch.is_active = d.is_active;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided." }, { status: 400 });
  }

  const { data: product, error } = await admin.supabase
    .from("products")
    .update(patch)
    .eq("id", id)
    .select("*, categories(id, slug, name, tibetan_name)")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Slug or SKU already in use." }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update product." }, { status: 400 });
  }

  await admin.supabase.from("admin_audit_logs").insert({
    actor_id: admin.user.id,
    action: "product.update",
    entity_type: "product",
    entity_id: id,
    details: { updated_fields: Object.keys(patch) },
  });

  return NextResponse.json(
    { product },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const admin = await requireAdminApi();
  if (admin.error) return admin.error;

  const limit = checkRateLimit(`admin:product:delete:${admin.user.id}`, 20, 15 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSec);

  const { id } = await context.params;
  if (!uuidParam.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid product identifier." }, { status: 400 });
  }

  const { error } = await admin.supabase.from("products").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return NextResponse.json(
        {
          error:
            "This product is linked to existing customer orders and cannot be hard-deleted. Set it to Hidden (Inactive) instead.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to delete product." }, { status: 400 });
  }

  await admin.supabase.from("admin_audit_logs").insert({
    actor_id: admin.user.id,
    action: "product.delete",
    entity_type: "product",
    entity_id: id,
    details: {},
  });

  return NextResponse.json(
    { success: true },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
