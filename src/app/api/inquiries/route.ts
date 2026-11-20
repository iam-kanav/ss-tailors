import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, rateLimitResponse, verifySameOrigin } from "@/lib/security";
import { tailoringInquirySchema } from "@/lib/validators";

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const limit = checkRateLimit(`inquiry:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSec);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = tailoringInquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check your inquiry details." },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("submit_tailoring_inquiry", {
    p_name: parsed.data.name,
    p_email: parsed.data.email,
    p_phone: parsed.data.phone,
    p_garment_type: parsed.data.garment_type,
    p_preferred_date: parsed.data.preferred_date || null,
    p_notes: parsed.data.notes ?? "",
  });

  if (error) {
    const safeMsg =
      error.code === "P0001" || error.code === "22023"
        ? error.message
        : "Unable to submit appointment request right now.";
    return NextResponse.json({ error: safeMsg }, { status: 400 });
  }

  return NextResponse.json(
    { inquiry: data, message: "Your fitting request for our Majnu Ka Tila atelier has been received." },
    { status: 201 }
  );
}
