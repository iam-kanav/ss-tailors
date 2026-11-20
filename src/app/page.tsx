import Link from "next/link";
import { ArrowRight, MapPin, Scissors, ShieldCheck, Sparkles } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Category, ProductWithCategory } from "@/lib/types";
import { StorefrontCatalog } from "@/components/StorefrontCatalog";
import { TailoringSection } from "@/components/TailoringSection";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  const [{ data: categoriesData }, { data: productsData }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("*, categories(id, slug, name, tibetan_name)")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const categories = (categoriesData ?? []) as Category[];
  const products = (productsData ?? []) as ProductWithCategory[];

  const initialCategory =
    params.category && categories.some((c) => c.slug === params.category)
      ? params.category
      : "all";

  return (
    <div>
      {/* Minimal Editorial Hero */}
      <section className="relative bg-white border-b border-[#ece7df] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Editorial Copy */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#faf9f7] border border-[#e8e3dc] text-[11px] font-medium tracking-[0.12em] uppercase text-[#5e554e]">
                <MapPin className="w-3.5 h-3.5 text-[#9e2a2b]" />
                Majnu Ka Tila · New Delhi
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-medium text-[#171412] leading-[1.06] tracking-[-0.01em]">
                Tibetan Heritage,{" "}
                <span className="italic text-[#9e2a2b]">Tailored</span> with Quiet Precision.
              </h1>

              <p className="text-sm sm:text-base text-[#5d554d] leading-relaxed max-w-lg">
                From handwoven <span className="text-[#171412] font-medium">pulu wool Chubas</span> and
                striped <span className="text-[#171412] font-medium">Pangden aprons</span> to pure
                mulberry silk <span className="text-[#171412] font-medium">Wonjus</span> and
                ceremonial Losar kinkhab robes—crafted individually at S.S Tailors.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="#collection"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#171412] hover:bg-[#9e2a2b] text-white text-xs font-semibold uppercase tracking-[0.14em] transition-colors shadow-sm"
                >
                  Explore Collection
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#bespoke"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#faf9f7] text-[#171412] border border-[#dcd5ca] text-xs font-semibold uppercase tracking-[0.14em] transition-colors"
                >
                  Book Studio Fitting
                </Link>
              </div>

              <div className="pt-6 border-t border-[#f0ebe4] grid grid-cols-3 gap-4">
                <div>
                  <span className="block font-serif text-2xl font-semibold text-[#171412]">8</span>
                  <span className="text-[11px] text-[#7a7067]">Traditional Categories</span>
                </div>
                <div>
                  <span className="block font-serif text-2xl font-semibold text-[#171412]">100%</span>
                  <span className="text-[11px] text-[#7a7067]">Bespoke Sizing Option</span>
                </div>
                <div>
                  <span className="block font-serif text-2xl font-semibold text-[#171412]">Delhi</span>
                  <span className="text-[11px] text-[#7a7067]">Majnu Ka Tila Atelier</span>
                </div>
              </div>
            </div>

            {/* Sunlit Studio Mannequin Trio Showcase */}
            <div className="lg:col-span-7">
              <div className="relative rounded-3xl overflow-hidden border border-[#ece7df] bg-white shadow-[0_24px_65px_-28px_rgba(23,20,18,0.2)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero-atelier.jpg"
                  alt="S.S Tailors Majnu Ka Tila signature Tibetan Chubas and Pangden displayed on linen studio mannequins"
                  className="w-full h-auto object-cover aspect-[16/10]"
                />
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-white/92 backdrop-blur-md border border-[#ece7df] rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#9e2a2b] shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-[#171412]">
                      Losar &amp; Winter Heritage Capsule
                    </p>
                    <p className="text-[11px] text-[#6c635b]">
                      Crimson Brocade Chuba · Indigo Kinkhab · Handwoven Lhasa Pangden
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subtle Craft Trust Bar */}
      <section className="bg-[#faf9f7] border-b border-[#ece7df]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-white border border-[#e8e3dc] flex items-center justify-center shrink-0">
              <Scissors className="w-4 h-4 text-[#9e2a2b]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#171412]">Master Pattern Cutting</p>
              <p className="text-[11px] text-[#6c635b]">Authentic Lhasa, Kham &amp; Amdo silhouettes</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-white border border-[#e8e3dc] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#c8922e]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#171412]">Complimentary Custom Fit</p>
              <p className="text-[11px] text-[#6c635b]">Submit measurements online or at Majnu Ka Tila</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-white border border-[#e8e3dc] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#1f3a52]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#171412]">Verified Pricing &amp; Security</p>
              <p className="text-[11px] text-[#6c635b]">Server-validated checkout &amp; insulated order privacy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tibetan Clothing Storefront Catalog */}
      <StorefrontCatalog
        categories={categories}
        products={products}
        initialCategory={initialCategory}
      />

      {/* Bespoke Majnu Ka Tila Atelier & Fitting Booking */}
      <TailoringSection />
    </div>
  );
}
