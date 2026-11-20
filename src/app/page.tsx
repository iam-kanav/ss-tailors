import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Category, ProductWithCategory } from "@/lib/types";
import { HeroSection } from "@/components/HeroSection";
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
      <HeroSection />
      <StorefrontCatalog
        categories={categories}
        products={products}
        initialCategory={initialCategory}
      />
      <TailoringSection />
    </div>
  );
}
