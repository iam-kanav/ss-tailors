import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse, verifySameOrigin } from "@/lib/security";
import { checkoutOrderSchema } from "@/lib/validators";

export async function GET() {
  const { supabase, user } = await getAuthenticatedContext();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not load your orders." }, { status: 500 });
  }

  return NextResponse.json(
    { orders: data ?? [] },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const { supabase, user } = await getAuthenticatedContext();
  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to place an order." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const limit = checkRateLimit(`orders:${user.id}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSec);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = checkoutOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid checkout details." },
      { status: 400 }
    );
  }

  // Call atomic server-side Postgres RPC that locks stock, looks up authoritative
  // catalog prices, computes shipping/totals, and decrements inventory in one transaction.
  const { data, error } = await supabase.rpc("place_order_secure", {
    p_customer_name: parsed.data.customer_name,
    p_customer_phone: parsed.data.customer_phone,
    p_fulfillment_method: parsed.data.fulfillment_method,
    p_shipping_address:
      parsed.data.fulfillment_method === "delivery" ? parsed.data.shipping_address : {},
    p_custom_measurements: parsed.data.custom_measurements ?? {},
    p_notes: parsed.data.notes ?? "",
    p_items: parsed.data.items,
  });

  if (error) {
    const safeMsg =
      error.code === "P0001" || error.code === "P0002" || error.code === "22023"
        ? error.message
        : "Unable to place order right now. Please verify item availability and try again.";
    return NextResponse.json(
      { error: safeMsg },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    { order: data },
    { status: 201, headers: { "Cache-Control": "no-store" } }
  );
}
