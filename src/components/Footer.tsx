import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function Footer() {
  return (
    <footer className="bg-[#f7f7f5] border-t border-[#e5e5e5] mt-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo size="sm" />
          </Link>
          <p className="text-sm text-[#555555] leading-relaxed">
            Traditional Tibetan clothing shop and custom tailoring in Majnu Ka Tila, New Delhi.
          </p>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#111111]">Clothing</p>
          <ul className="space-y-2 text-sm text-[#555555]">
            <li><Link href="/?category=womens-chuba#shop" className="hover:text-[#111111]">Women&apos;s Chuba</Link></li>
            <li><Link href="/?category=mens-chuba#shop" className="hover:text-[#111111]">Men&apos;s Chuba</Link></li>
            <li><Link href="/?category=pangden#shop" className="hover:text-[#111111]">Pangden Aprons</Link></li>
            <li><Link href="/?category=wonju#shop" className="hover:text-[#111111]">Wonju Blouses &amp; Shirts</Link></li>
            <li><Link href="/?category=jackets-vests#shop" className="hover:text-[#111111]">Jackets &amp; Vests</Link></li>
            <li><Link href="/?category=ceremonial-losar#shop" className="hover:text-[#111111]">Ceremonial &amp; Losar</Link></li>
            <li><Link href="/?category=kids-chuba#shop" className="hover:text-[#111111]">Kids&apos; Wear</Link></li>
            <li><Link href="/?category=accessories#shop" className="hover:text-[#111111]">Khata &amp; Sashes</Link></li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#111111]">Visit Our Shop</p>
          <p className="text-sm text-[#555555] leading-relaxed">
            New Aruna Nagar (Majnu Ka Tila)
            <br />
            Civil Lines, New Delhi – 110054
          </p>
          <p className="text-sm text-[#666666]">
            Tue – Sun: 10:30 AM – 8:00 PM
            <br />
            Closed Mondays
          </p>
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#111111]">Account</p>
          <ul className="space-y-2 text-sm text-[#555555]">
            <li><Link href="/#custom-tailoring" className="hover:text-[#111111]">Custom Stitching Inquiry</Link></li>
            <li><Link href="/account" className="hover:text-[#111111]">My Orders</Link></li>
            <li><Link href="/checkout" className="hover:text-[#111111]">Checkout</Link></li>
            <li><Link href="/login" className="hover:text-[#111111]">Sign In</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#e5e5e5]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#777777]">
          <span>© {new Date().getFullYear()} S.S Tailors, Majnu Ka Tila, New Delhi</span>
          <span>Delivery across India · Free pickup in Majnu Ka Tila</span>
        </div>
      </div>
    </footer>
  );
}
