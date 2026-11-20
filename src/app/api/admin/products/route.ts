import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse, requireAdminApi, verifySameOrigin } from "@/lib/security";
import { createProductSchema } from "@/lib/validators";

export async function GET() {
  const admin = await requireAdminApi();
  if (admin.error) return admin.error;

  const { data, error } = await admin.supabase
    .from("products")
    .select("*, categories(id, slug, name, tibetan_name)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to load products." }, { status: 500 });
  }

  return NextResponse.json(
    { products: data ?? [] },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const admin = await requireAdminApi();
  if (admin.error) return admin.error;

  const limit = checkRateLimit(`admin:product:create:${admin.user.id}`, 30, 15 * 60 * 1000);
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSec);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid product fields." },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const pricePaise = Math.round(d.price_rupees * 100);
  const compareAtPaise =
    typeof d.compare_at_rupees === "number" && d.compare_at_rupees > d.price_rupees
      ? Math.round(d.compare_at_rupees * 100)
      : null;

  const { data: product, error } = await admin.supabase
    .from("products")
    .insert({
      category_id: d.category_id,
      slug: d.slug,
      sku: d.sku,
      name: d.name,
      tibetan_name: d.tibetan_name,
      description: d.description,
      fabric: d.fabric,
      care_instructions: d.care_instructions,
      price_paise: pricePaise,
      compare_at_paise: compareAtPaise,
      stock_quantity: d.stock_quantity,
      sizes: d.sizes,
      allow_custom_tailoring: d.allow_custom_tailoring,
      lead_time_days: d.lead_time_days,
      image_url: d.image_url,
      is_featured: d.is_featured,
      is_active: d.is_active,
      created_by: admin.user.id,
    })
    .select("*, categories(id, slug, name, tibetan_name)")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A product with this slug or SKU already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Unable to create product. Please verify all fields." },
      { status: 400 }
    );
  }

  await admin.supabase.from("admin_audit_logs").insert({
    actor_id: admin.user.id,
    action: "product.create",
    entity_type: "product",
    entity_id: product.id,
    details: { name: product.name, sku: product.sku, price_paise: product.price_paise },
  });

  return NextResponse.json(
    { product },
    { status: 201, headers: { "Cache-Control": "no-store" } }
  );
}
