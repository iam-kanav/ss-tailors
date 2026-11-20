import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/supabase/server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://jyvgqjrjkmsbgjyxzszt.supabase.co";
const SUPABASE_ORIGIN = new URL(SUPABASE_URL).origin;

const SAFE_LOCAL_IMAGE_RE = /^\/images\/[a-zA-Z0-9._/-]+$/;
const SAFE_STORAGE_PREFIX = `${SUPABASE_ORIGIN}/storage/v1/object/public/product-images/`;
const SAFE_STORAGE_PATH_RE = /^[a-zA-Z0-9._/-]+$/;

export function isSafeProductImageUrl(url: string): boolean {
  if (!url || url.includes("..") || url.includes("\\")) return false;
  if (SAFE_LOCAL_IMAGE_RE.test(url)) return true;
  if (url.startsWith(SAFE_STORAGE_PREFIX)) {
    const remainder = url.slice(SAFE_STORAGE_PREFIX.length);
    return remainder.length > 0 && SAFE_STORAGE_PATH_RE.test(remainder);
  }
  return false;
}

/**
 * Defense-in-depth CSRF check for state-changing Route Handlers.
 * Validates Origin/Referer against the request Host or configured NEXT_PUBLIC_SITE_URL.
 */
export function verifySameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  const allowedHosts = new Set<string>();
  if (host) allowedHosts.add(host.toLowerCase());
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      allowedHosts.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).host.toLowerCase());
    } catch {
      // ignore malformed env
    }
  }
  if (process.env.RENDER_EXTERNAL_HOSTNAME) {
    allowedHosts.add(process.env.RENDER_EXTERNAL_HOSTNAME.toLowerCase());
  }

  const candidate = origin ?? referer;
  if (!candidate) {
    // Reject cross-site form/fetch requests without origin metadata in production
    return process.env.NODE_ENV !== "production";
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    return allowedHosts.has(parsed.host.toLowerCase());
  } catch {
    return false;
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

interface RateBucket {
  timestamps: number[];
}

const rateBuckets = new Map<string, RateBucket>();
const MAX_BUCKETS = 5000;

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Bounded eviction to prevent memory exhaustion under DDoS
  if (rateBuckets.size > MAX_BUCKETS) {
    for (const [bucketKey, bucket] of rateBuckets.entries()) {
      const recent = bucket.timestamps.filter((t) => t > windowStart);
      if (recent.length === 0) {
        rateBuckets.delete(bucketKey);
      } else {
        bucket.timestamps = recent;
      }
    }
  }

  const existing = rateBuckets.get(key) ?? { timestamps: [] };
  existing.timestamps = existing.timestamps.filter((t) => t > windowStart);

  if (existing.timestamps.length >= maxRequests) {
    const oldest = existing.timestamps[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    rateBuckets.set(key, existing);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  existing.timestamps.push(now);
  rateBuckets.set(key, existing);
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existing.timestamps.length),
    retryAfterSec: 0,
  };
}

export function rateLimitResponse(retryAfterSec: number) {
  return NextResponse.json(
    { error: "Too many requests. Please wait a moment before trying again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
        "Cache-Control": "no-store",
      },
    }
  );
}

/**
 * Validates binary file headers (magic bytes) so malicious SVG/HTML/script files
 * disguised as image/jpeg or image/png are rejected before touching Storage.
 */
export function detectVerifiedImageType(
  bytes: Uint8Array
): { ext: "jpg" | "png" | "webp"; mime: "image/jpeg" | "image/png" | "image/webp" } | null {
  if (bytes.length < 12) return null;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { ext: "png", mime: "image/png" };
  }

  // WebP: "RIFF" .... "WEBP"
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { ext: "webp", mime: "image/webp" };
  }

  return null;
}

export async function requireAdminApi() {
  const { supabase, user, profile } = await getAuthenticatedContext();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Authentication required." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      ),
    };
  }

  if (!profile || profile.role !== "admin") {
    return {
      error: NextResponse.json(
        { error: "Administrator access required." },
        { status: 403, headers: { "Cache-Control": "no-store" } }
      ),
    };
  }

  return { supabase, user, profile, error: null };
}
