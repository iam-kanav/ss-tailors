import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, rateLimitResponse, verifySameOrigin } from "@/lib/security";
import { signupSchema } from "@/lib/validators";

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const limit = checkRateLimit(`signup:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSec);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check your registration details." },
      { status: 400 }
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    options: {
      // Role is never accepted from client input; DB trigger forces 'customer'
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    return NextResponse.json(
      { error: "Unable to create account with those details. Please check or sign in." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const requiresEmailConfirmation = !data.session;

  return NextResponse.json(
    {
      requiresEmailConfirmation,
      message: requiresEmailConfirmation
        ? "Account created! Please check your email inbox to confirm your address before signing in."
        : "Welcome to S.S Tailors.",
    },
    { status: 201, headers: { "Cache-Control": "no-store" } }
  );
}
