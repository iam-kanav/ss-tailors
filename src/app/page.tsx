import Link from "next/link";
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
      {/* Clean Unobstructed Clothing Banner */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-5 sm:pt-7">
        <div className="w-full overflow-hidden bg-[#f5f5f3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-atelier.jpg"
            alt="Traditional Tibetan Chubas and handwoven Pangden from S.S Tailors"
            className="w-full h-[300px] sm:h-[420px] lg:h-[500px] object-cover object-center"
          />
        </div>

        <div className="pt-6 pb-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
              Authentic Tibetan Clothing
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-[#555555] leading-relaxed">
              We have been making and selling authentic Tibetan clothing in Majnu Ka Tila, Delhi —
              Chubas, Pangdens, Wonjus, brocade jackets, and custom-stitched traditional wear.
            </p>
          </div>

          <Link
            href="#shop"
            className="shrink-0 inline-flex items-center justify-center px-6 py-2.5 bg-[#111111] hover:bg-[#9b1c1c] text-white text-sm font-medium transition-colors self-start md:self-auto"
          >
            Shop All ({products.length})
          </Link>
        </div>
      </section>

      {/* Main Clothing Catalog */}
      <StorefrontCatalog
        categories={categories}
        products={products}
        initialCategory={initialCategory}
      />

      {/* Simple Custom Tailoring Inquiry */}
      <TailoringSection />
    </div>
  );
}
