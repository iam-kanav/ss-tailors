import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, rateLimitResponse, verifySameOrigin } from "@/lib/security";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid credentials format." },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const limit = checkRateLimit(
    `login:${ip}:${parsed.data.email.toLowerCase()}`,
    10,
    15 * 60 * 1000
  );
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSec);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", data.user.id)
    .single();

  return NextResponse.json(
    {
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name ?? "",
        role: profile?.role ?? "customer",
      },
    },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
