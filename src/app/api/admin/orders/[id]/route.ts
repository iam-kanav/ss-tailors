import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, rateLimitResponse, requireAdminApi, verifySameOrigin } from "@/lib/security";
import { updateOrderStatusSchema } from "@/lib/validators";

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

  const limit = checkRateLimit(`admin:order:update:${admin.user.id}`, 60, 15 * 60 * 1000);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfterSec);

  const { id } = await context.params;
  if (!uuidParam.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid order identifier." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order status." }, { status: 400 });
  }

  const { data: order, error } = await admin.supabase
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "Unable to update order status." }, { status: 400 });
  }

  await admin.supabase.from("admin_audit_logs").insert({
    actor_id: admin.user.id,
    action: "order.status_update",
    entity_type: "order",
    entity_id: id,
    details: { status: parsed.data.status, order_number: order.order_number },
  });

  return NextResponse.json(
    { order },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
