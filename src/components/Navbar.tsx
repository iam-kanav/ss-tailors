"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, ShieldCheck, ShoppingBag, User, X, LogOut } from "lucide-react";
import { useCart } from "@/components/CartProvider";

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
    { href: "/#collection", label: "Collection" },
    { href: "/#categories", label: "Categories" },
    { href: "/#bespoke", label: "Bespoke Tailoring" },
    { href: "/#atelier", label: "Majnu Ka Tila Atelier" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8e3dc]">
      <div className="pangden-thread w-full" aria-hidden="true" />

      <div className="bg-[#171412] text-[#f4efe7] text-[11px] tracking-[0.14em] uppercase">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <span className="truncate">
            Majnu Ka Tila, New Delhi · Handcrafted Tibetan Tailoring Since 1998
          </span>
          <span className="hidden sm:inline text-[#d6cbbd]">
            Complimentary Pan-India Shipping Over ₹5,000
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <span className="w-8 h-8 rounded-full border border-[#171412]/15 bg-[#faf9f7] flex items-center justify-center text-xs font-serif font-semibold tracking-wider text-[#9e2a2b] group-hover:border-[#9e2a2b]/50 transition-colors">
            SS
          </span>
          <div className="leading-tight">
            <span className="block font-serif text-xl sm:text-2xl font-semibold tracking-[0.04em] text-[#171412]">
              S.S Tailors
            </span>
            <span className="block text-[10px] tracking-[0.18em] uppercase text-[#7a7067]">
              Tibetan Atelier · Delhi
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="Primary Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium tracking-[0.04em] text-[#4b443e] hover:text-[#9e2a2b] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide border transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-[#9e2a2b] text-white border-[#9e2a2b]"
                  : "bg-[#faf9f7] text-[#9e2a2b] border-[#9e2a2b]/30 hover:bg-[#9e2a2b]/5"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}

          {user ? (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#342f2b] hover:bg-[#f4f1ec] transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[110px] truncate">{user.fullName}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                title="Sign out"
                aria-label="Sign out"
                className="p-2 rounded-full text-[#6c635b] hover:text-[#171412] hover:bg-[#f4f1ec] transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#171412] border border-[#e2dcd3] hover:border-[#171412] transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </Link>
          )}

          <button
            type="button"
            onClick={openCart}
            aria-label="Open shopping bag"
            className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#171412] text-white text-xs font-medium tracking-wide hover:bg-[#9e2a2b] transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bag</span>
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white text-[#171412] text-[10px] font-semibold font-mono">
              {totalItems}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className="lg:hidden p-2 rounded-lg text-[#171412] hover:bg-[#f4f1ec] cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#e8e3dc] bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-1.5 text-sm font-medium text-[#2d2824]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#eee9e2] flex flex-wrap items-center gap-2">
            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#9e2a2b] text-white"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Console
              </Link>
            )}
            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[#e2dcd3]"
                >
                  <User className="w-3.5 h-3.5" />
                  My Orders
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#9e2a2b] border border-[#9e2a2b]/25"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#171412] text-white"
              >
                Sign In / Create Account
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
