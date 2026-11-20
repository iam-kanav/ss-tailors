"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="w-full max-w-md border border-[#e5e5e5] bg-white p-8 sm:p-10">
      <h1 className="text-2xl font-semibold text-[#111111]">
        {mode === "login" ? "Sign in" : "Create account"}
      </h1>
      <p className="text-sm text-[#666666] mt-1">
        {mode === "login"
          ? "Sign in to place orders or manage the shop."
          : "Create an account to track your orders."}
      </p>

      <div className="mt-6 flex border-b border-[#e5e5e5]">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={`flex-1 pb-2.5 text-sm border-b-2 transition-colors cursor-pointer ${
            mode === "login"
              ? "border-[#111111] text-[#111111] font-medium"
              : "border-transparent text-[#666666]"
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
          className={`flex-1 pb-2.5 text-sm border-b-2 transition-colors cursor-pointer ${
            mode === "signup"
              ? "border-[#111111] text-[#111111] font-medium"
              : "border-transparent text-[#666666]"
          }`}
        >
          Create Account
        </button>
      </div>

      {info && (
        <p className="mt-5 p-3.5 bg-[#f7f7f5] border border-[#e5e5e5] text-sm text-[#111111]">
          {info}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <div>
            <label className="block text-xs font-medium text-[#444444] mb-1.5">Full Name</label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={120}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#444444] mb-1.5">Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#444444] mb-1.5">Password</label>
          <input
            type="password"
            required
            minLength={mode === "signup" ? 10 : 8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••"
            className="w-full px-3.5 py-2.5 border border-[#d4d4d4] text-sm focus:outline-none focus:border-[#111111]"
          />
          {mode === "signup" && (
            <p className="text-xs text-[#777777] mt-1.5">
              At least 10 characters with uppercase, lowercase, and a number.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-[#9b1c1c]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-[#111111] hover:bg-[#9b1c1c] disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer"
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>
    </div>
  );
}
