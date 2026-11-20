import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/security";

const ORIGIN_PIN = process.env.DELHIVERY_ORIGIN_PIN ?? "110054"; // Majnu Ka Tila, New Delhi
const DELHIVERY_HOST = "https://track.delhivery.com";

const querySchema = z.object({
  pin: z.string().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit Indian PIN code."),
  weightGrams: z.coerce.number().int().min(100).max(25000).default(850),
  paymentMode: z.enum(["Pre-paid", "COD"]).default("Pre-paid"),
});

interface RateOption {
  mode: "S" | "E";
  label: string;
  totalRupees: number;
  etaDays: string;
}

interface EstimatePayload {
  source: "delhivery_live" | "delhivery_rate_card";
  originPin: string;
  destinationPin: string;
  weightGrams: number;
  serviceable: boolean;
  codAvailable: boolean;
  prepaidAvailable: boolean;
  locationLabel: string;
  options: RateOption[];
}

function classifyIndiaZone(pin: string): {
  zone: "local_ncr" | "north" | "metro" | "rest_of_india" | "special_hills";
  label: string;
  surfaceDays: string;
  expressDays: string;
  surfaceBase: number;
  surfacePer500: number;
  expressBase: number;
  expressPer500: number;
} {
  const p2 = pin.slice(0, 2);
  const p3 = pin.slice(0, 3);

  // Delhi & NCR (origin 110054)
  if (p3 === "110" || ["121", "122", "201"].includes(p3)) {
    return {
      zone: "local_ncr",
      label: "Delhi NCR",
      surfaceDays: "1–2 business days",
      expressDays: "1 business day",
      surfaceBase: 55,
      surfacePer500: 25,
      expressBase: 85,
      expressPer500: 35,
    };
  }

  // Himalayan / Northeast / J&K / Ladakh / Sikkim (major Tibetan communities)
  if (["17", "18", "19", "78", "79"].includes(p2) || ["734", "737"].includes(p3)) {
    return {
      zone: "special_hills",
      label: "Himalayan / North-East Zone",
      surfaceDays: "4–6 business days",
      expressDays: "2–4 business days",
      surfaceBase: 115,
      surfacePer500: 55,
      expressBase: 165,
      expressPer500: 75,
    };
  }

  // Major Indian Metros (Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad)
  if (["400", "401", "560", "500", "600", "700", "411", "380"].includes(p3)) {
    return {
      zone: "metro",
      label: "Metro City",
      surfaceDays: "3–5 business days",
      expressDays: "2–3 business days",
      surfaceBase: 85,
      surfacePer500: 40,
      expressBase: 125,
      expressPer500: 60,
    };
  }

  // North India
  if (["12", "13", "14", "15", "16", "20", "21", "22", "24", "25", "26", "27", "28", "30"].includes(p2)) {
    return {
      zone: "north",
      label: "North India",
      surfaceDays: "2–4 business days",
      expressDays: "1–3 business days",
      surfaceBase: 70,
      surfacePer500: 32,
      expressBase: 105,
      expressPer500: 48,
    };
  }

  return {
    zone: "rest_of_india",
    label: "Rest of India",
    surfaceDays: "4–6 business days",
    expressDays: "2–4 business days",
    surfaceBase: 95,
    surfacePer500: 45,
    expressBase: 145,
    expressPer500: 65,
  };
}

function buildFallbackEstimate(
  pin: string,
  weightGrams: number,
  paymentMode: "Pre-paid" | "COD"
): EstimatePayload {
  const z = classifyIndiaZone(pin);
  const extraSlabs = Math.max(0, Math.ceil((weightGrams - 500) / 500));
  const codFee = paymentMode === "COD" ? 40 : 0;

  const surfaceGross = z.surfaceBase + extraSlabs * z.surfacePer500 + codFee;
  const expressGross = z.expressBase + extraSlabs * z.expressPer500 + codFee;

  // Include 18% GST rounded to nearest rupee
  const surfaceTotal = Math.round(surfaceGross * 1.18);
  const expressTotal = Math.round(expressGross * 1.18);

  return {
    source: "delhivery_rate_card",
    originPin: ORIGIN_PIN,
    destinationPin: pin,
    weightGrams,
    serviceable: true,
    codAvailable: true,
    prepaidAvailable: true,
    locationLabel: z.label,
    options: [
      {
        mode: "S",
        label: "Delhivery Surface",
        totalRupees: surfaceTotal,
        etaDays: z.surfaceDays,
      },
      {
        mode: "E",
        label: "Delhivery Express",
        totalRupees: expressTotal,
        etaDays: z.expressDays,
      },
    ],
  };
}

function extractDelhiveryTotal(json: unknown): number | null {
  if (Array.isArray(json) && json.length > 0) {
    const first = json[0] as Record<string, unknown>;
    if (typeof first?.total_amount === "number") return Math.round(first.total_amount);
    if (typeof first?.gross_amount === "number") return Math.round(first.gross_amount);
  }
  if (json && typeof json === "object") {
    const obj = json as Record<string, unknown>;
    if (typeof obj.total_amount === "number") return Math.round(obj.total_amount);
    const data = obj.data as Record<string, unknown> | undefined;
    if (typeof data?.total_amount === "number") return Math.round(data.total_amount);
  }
  return null;
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`shipping:estimate:${ip}`, 30, 60 * 1000);
  if (!limit.allowed) {
    return rateLimitResponse(limit.retryAfterSec);
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    pin: searchParams.get("pin") ?? "",
    weightGrams: searchParams.get("weightGrams") ?? "850",
    paymentMode: searchParams.get("paymentMode") ?? "Pre-paid",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid PIN code." },
      { status: 400 }
    );
  }

  const { pin, weightGrams, paymentMode } = parsed.data;
  const token = process.env.DELHIVERY_API_TOKEN?.trim();

  if (!token) {
    return NextResponse.json(buildFallbackEstimate(pin, weightGrams, paymentMode), {
      status: 200,
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }

  try {
    const headers = {
      Authorization: `Token ${token}`,
      Accept: "application/json",
    };

    const buildChargesUrl = (md: "S" | "E") => {
      const url = new URL("/api/kinko/v1/invoice/charges/.json", DELHIVERY_HOST);
      url.searchParams.set("md", md);
      url.searchParams.set("ss", "Delivered");
      url.searchParams.set("o_pin", ORIGIN_PIN);
      url.searchParams.set("d_pin", pin);
      url.searchParams.set("cgm", String(weightGrams));
      url.searchParams.set("pt", paymentMode);
      return url.toString();
    };

    const pinUrl = new URL("/c/api/pin-codes/json/", DELHIVERY_HOST);
    pinUrl.searchParams.set("filter_codes", pin);

    const [pinRes, surfaceRes, expressRes] = await Promise.all([
      fetch(pinUrl.toString(), { headers, signal: AbortSignal.timeout(6000) }),
      fetch(buildChargesUrl("S"), { headers, signal: AbortSignal.timeout(6000) }),
      fetch(buildChargesUrl("E"), { headers, signal: AbortSignal.timeout(6000) }),
    ]);

    const pinJson = pinRes.ok ? await pinRes.json() : null;
    const postal = pinJson?.delivery_codes?.[0]?.postal_code;
    const serviceable = Boolean(postal);
    const zoneFallback = classifyIndiaZone(pin);

    if (pinRes.ok && !serviceable) {
      const payload: EstimatePayload = {
        source: "delhivery_live",
        originPin: ORIGIN_PIN,
        destinationPin: pin,
        weightGrams,
        serviceable: false,
        codAvailable: false,
        prepaidAvailable: false,
        locationLabel: "Unserviceable PIN",
        options: [],
      };
      return NextResponse.json(payload, {
        status: 200,
        headers: { "Cache-Control": "public, max-age=300" },
      });
    }

    const surfaceTotal = surfaceRes.ok ? extractDelhiveryTotal(await surfaceRes.json()) : null;
    const expressTotal = expressRes.ok ? extractDelhiveryTotal(await expressRes.json()) : null;

    if (surfaceTotal === null && expressTotal === null) {
      return NextResponse.json(buildFallbackEstimate(pin, weightGrams, paymentMode), {
        status: 200,
        headers: { "Cache-Control": "public, max-age=120" },
      });
    }

    const options: RateOption[] = [];
    if (surfaceTotal !== null) {
      options.push({
        mode: "S",
        label: "Delhivery Surface",
        totalRupees: surfaceTotal,
        etaDays: zoneFallback.surfaceDays,
      });
    }
    if (expressTotal !== null) {
      options.push({
        mode: "E",
        label: "Delhivery Express",
        totalRupees: expressTotal,
        etaDays: zoneFallback.expressDays,
      });
    }

    const locationParts = [postal?.district, postal?.state_code].filter(Boolean);
    const payload: EstimatePayload = {
      source: "delhivery_live",
      originPin: ORIGIN_PIN,
      destinationPin: pin,
      weightGrams,
      serviceable: true,
      codAvailable: postal ? postal.cash === "Y" : true,
      prepaidAvailable: postal ? postal.pre_paid === "Y" : true,
      locationLabel: locationParts.length > 0 ? locationParts.join(", ") : zoneFallback.label,
      options,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch {
    return NextResponse.json(buildFallbackEstimate(pin, weightGrams, paymentMode), {
      status: 200,
      headers: { "Cache-Control": "public, max-age=60" },
    });
  }
}
