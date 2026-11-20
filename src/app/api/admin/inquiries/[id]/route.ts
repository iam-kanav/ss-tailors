import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, rateLimitResponse, requireAdminApi, verifySameOrigin } from "@/lib/security";

const uuidParam = z.string().uuid();
const statusSchema = z.object({
  status: z.enum(["new", "contacted", "scheduled", "completed", "archived"]),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const admin = await requireAdminApi();
  if (admin.error) return admin.error;

  const limit = checkRateLimit(`admin:inquiry:update:${admin.user.id}`, 60, 15 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSec);

  const { id } = await context.params;
  if (!uuidParam.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid inquiry identifier." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
  }

  const { data: inquiry, error } = await admin.supabase
    .from("tailoring_inquiries")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update inquiry status." }, { status: 400 });
  }

  await admin.supabase.from("admin_audit_logs").insert({
    actor_id: admin.user.id,
    action: "inquiry.status_update",
    entity_type: "tailoring_inquiry",
    entity_id: id,
    details: { status: parsed.data.status },
  });

  return NextResponse.json(
    { inquiry },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
