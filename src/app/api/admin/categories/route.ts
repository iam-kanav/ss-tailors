import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse, requireAdminApi, verifySameOrigin } from "@/lib/security";
import { createCategorySchema } from "@/lib/validators";

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const admin = await requireAdminApi();
  if (admin.error) return admin.error;

  const limit = checkRateLimit(`admin:category:create:${admin.user.id}`, 20, 15 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSec);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid category data." },
      { status: 400 }
    );
  }

  const { data: category, error } = await admin.supabase
    .from("categories")
    .insert({
      name: parsed.data.name,
      tibetan_name: parsed.data.tibetan_name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      sort_order: parsed.data.sort_order,
      is_active: true,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Category slug already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create category." }, { status: 400 });
  }

  await admin.supabase.from("admin_audit_logs").insert({
    actor_id: admin.user.id,
    action: "category.create",
    entity_type: "category",
    entity_id: category.id,
    details: { name: category.name, slug: category.slug },
  });

  return NextResponse.json(
    { category },
    { status: 201, headers: { "Cache-Control": "no-store" } }
  );
}
