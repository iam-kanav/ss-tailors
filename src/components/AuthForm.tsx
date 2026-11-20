"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, CheckCircle2 } from "lucide-react";

function sanitizeRedirect(nextPath: string | undefined): string {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/";
  }
  return nextPath;
}

export function AuthForm({ nextPath }: { nextPath?: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const router = useRouter();

  const safeNext = sanitizeRedirect(nextPath);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload =
        mode === "login" ? { email, password } : { fullName, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Authentication failed.");
        return;
      }

      if (mode === "signup" && json.requiresEmailConfirmation) {
        setInfo(json.message);
        setMode("login");
        setPassword("");
        return;
      }

      const destination =
        mode === "login" && json.user?.role === "admin" && safeNext === "/"
          ? "/admin"
          : safeNext;

      router.push(destination);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-[#e8e3dc] shadow-[0_24px_60px_-30px_rgba(23,20,18,0.18)] overflow-hidden">
      <div className="pangden-thread w-full" aria-hidden="true" />
      <div className="p-8 sm:p-10">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9e2a2b]">
            S.S Tailors Account
          </p>
          <h1 className="font-serif text-3xl font-medium text-[#171412] mt-2">
            {mode === "login" ? "Welcome Back" : "Create Client Account"}
          </h1>
          <p className="text-xs text-[#6c635b] mt-1.5">
            {mode === "login"
              ? "Sign in to place bespoke orders, track tailoring status, or access the Admin Atelier."
              : "Register for streamlined Majnu Ka Tila bespoke fittings and private order tracking."}
          </p>
        </div>

        {/* Toggle */}
        <div className="mt-6 grid grid-cols-2 p-1 rounded-full bg-[#f4f1ec]">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              mode === "login"
                ? "bg-white text-[#171412] shadow-xs"
                : "text-[#6c635b] hover:text-[#171412]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-white text-[#171412] shadow-xs"
                : "text-[#6c635b] hover:text-[#171412]"
            }`}
          >
            Create Account
          </button>
        </div>

        {info && (
          <div className="mt-5 p-4 rounded-xl bg-[#f3f9f5] border border-[#cde6d5] text-[#1f5139] text-xs flex gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{info}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-medium text-[#4b443e] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={120}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Pema Wangchuk"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#4b443e] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#4b443e] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              minLength={mode === "signup" ? 10 : 8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e3ddd4] text-sm focus:outline-none focus:border-[#9e2a2b]"
            />
            {mode === "signup" && (
              <p className="text-[11px] text-[#7a7067] mt-1.5">
                Minimum 10 characters with uppercase, lowercase, and a number.
              </p>
            )}
          </div>

          {error && (
            <p className="text-xs text-[#9e2a2b] bg-[#fdf2f2] border border-[#f5d0d0] px-3.5 py-2.5 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-[#171412] hover:bg-[#9e2a2b] disabled:opacity-60 text-white text-xs font-semibold uppercase tracking-[0.14em] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            {loading
              ? "Verifying..."
              : mode === "login"
                ? "Sign In Securely"
                : "Create Secure Account"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#f0ebe4] flex items-center justify-center gap-2 text-[11px] text-[#7a7067]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1f3a52]" />
          <span>HttpOnly cookie sessions · Rate-limited authentication</span>
        </div>
      </div>
    </div>
  );
}
