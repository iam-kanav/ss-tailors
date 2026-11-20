"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { BrandLogo } from "@/components/BrandLogo";

interface NavUser {
  id: string;
  email: string;
  fullName: string;
  role: "customer" | "admin";
}

export function Navbar({ user }: { user: NavUser | null }) {
  const { totalItems, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const navLinks = [
    { href: "/#shop", label: "Shop" },
    { href: "/?category=womens-chuba#shop", label: "Women's Chuba" },
    { href: "/?category=mens-chuba#shop", label: "Men's Chuba" },
    { href: "/?category=pangden#shop", label: "Pangden" },
    { href: "/?category=wonju#shop", label: "Wonju" },
    { href: "/#custom-tailoring", label: "Custom Tailoring" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e5e5e5]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-6">
        {/* Left: Mobile toggle + Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="lg:hidden -ml-1 p-1.5 text-[#111111] cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" aria-label="S.S Tailors Home" className="inline-flex items-center">
            <BrandLogo size="md" />
          </Link>
        </div>

        {/* Center: Clean Category Nav */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-[#444444] hover:text-[#111111] transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Utility Actions */}
        <div className="flex items-center gap-5">
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className={`hidden sm:inline text-sm font-medium transition-colors ${
                pathname.startsWith("/admin")
                  ? "text-[#9b1c1c] underline underline-offset-4"
                  : "text-[#9b1c1c] hover:text-[#111111]"
              }`}
            >
              Admin
            </Link>
          )}

          {user ? (
            <div className="hidden sm:flex items-center gap-4">
              <Link
                href="/account"
                className="text-sm text-[#444444] hover:text-[#111111] transition-colors"
              >
                Account
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-sm text-[#777777] hover:text-[#111111] transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline text-sm text-[#444444] hover:text-[#111111] transition-colors"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            onClick={openCart}
            aria-label="Open bag"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#111111] hover:text-[#9b1c1c] transition-colors cursor-pointer tabular-nums"
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
            <span>Bag ({totalItems})</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#e5e5e5] bg-white px-5 py-5 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-[#111111]"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-[#e5e5e5] flex items-center gap-5 text-sm">
            {user?.role === "admin" && (
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-[#9b1c1c] font-medium">
                Admin
              </Link>
            )}
            {user ? (
              <>
                <Link href="/account" onClick={() => setMobileOpen(false)} className="text-[#111111]">
                  Account
                </Link>
                <button type="button" onClick={handleLogout} className="text-[#666666]">
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="text-[#111111]">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
