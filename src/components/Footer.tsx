import Link from "next/link";
import { MapPin, Clock, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer id="atelier" className="bg-[#171412] text-[#e7e0d6] mt-24">
      <div className="pangden-thread w-full" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="space-y-4">
          <div>
            <span className="font-serif text-2xl font-semibold text-white tracking-wide">
              S.S Tailors
            </span>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#b4a99c] mt-1">
              Tibetan Clothing House · Est. Majnu Ka Tila
            </p>
          </div>
          <p className="text-sm text-[#bdb3a7] leading-relaxed">
            Preserving the cut, proportion, and textile craft of traditional Tibetan attire
            in the heart of New Delhi&apos;s Tibetan Colony.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
            Collections
          </h3>
          <ul className="space-y-2 text-sm text-[#bdb3a7]">
            <li><Link href="/?category=womens-chuba#collection" className="hover:text-white transition-colors">Women&apos;s Chuba</Link></li>
            <li><Link href="/?category=mens-chuba#collection" className="hover:text-white transition-colors">Men&apos;s Chuba (Phogoe)</Link></li>
            <li><Link href="/?category=pangden#collection" className="hover:text-white transition-colors">Handwoven Pangden Aprons</Link></li>
            <li><Link href="/?category=wonju#collection" className="hover:text-white transition-colors">Silk Wonju Blouses</Link></li>
            <li><Link href="/?category=jackets-vests#collection" className="hover:text-white transition-colors">Brocade Toethung Jackets</Link></li>
            <li><Link href="/?category=ceremonial-losar#collection" className="hover:text-white transition-colors">Ceremonial &amp; Losar Sets</Link></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
            Visit the Atelier
          </h3>
          <div className="space-y-2.5 text-sm text-[#bdb3a7]">
            <p className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#c8922e] shrink-0 mt-0.5" />
              <span>
                House Lane, New Aruna Nagar (Majnu Ka Tila),<br />
                Civil Lines, New Delhi — 110054
              </span>
            </p>
            <p className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#c8922e] shrink-0 mt-0.5" />
              <span>
                Tuesday – Sunday: 10:30 AM – 8:00 PM IST<br />
                Walk-in fittings &amp; Losar orders welcome
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
            Client Care &amp; Trust
          </h3>
          <ul className="space-y-2 text-sm text-[#bdb3a7]">
            <li><Link href="/#bespoke" className="hover:text-white transition-colors">Book a Custom Fitting</Link></li>
            <li><Link href="/account" className="hover:text-white transition-colors">Track Your Orders</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">Account Sign In</Link></li>
          </ul>
          <div className="pt-3 flex items-center gap-2 text-xs text-[#9c9184]">
            <ShieldCheck className="w-4 h-4 text-[#c8922e] shrink-0" />
            <span>RLS-protected database &amp; server-verified checkout</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9c9184]">
          <span>© {new Date().getFullYear()} S.S Tailors, Majnu Ka Tila. All rights reserved.</span>
          <span>Hand-cut in New Delhi · Shipped across India</span>
        </div>
      </div>
    </footer>
  );
}
