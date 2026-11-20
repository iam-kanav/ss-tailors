import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProductWithCategory } from "@/lib/types";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { formatINR } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: productData } = await supabase
    .from("products")
    .select("*, categories(id, slug, name, tibetan_name)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!productData) {
    notFound();
  }

  const product = productData as ProductWithCategory;

  const { data: relatedData } = await supabase
    .from("products")
    .select("*, categories(id, slug, name, tibetan_name)")
    .eq("is_active", true)
    .neq("id", product.id)
    .limit(4);

  const related = (relatedData ?? []) as ProductWithCategory[];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#666666] mb-7">
        <Link href="/" className="hover:text-[#111111]">
          Home
        </Link>
        <span>/</span>
        {product.categories && (
          <>
            <Link
              href={`/?category=${product.categories.slug}#shop`}
              className="hover:text-[#111111]"
            >
              {product.categories.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#111111] truncate">{product.name}</span>
      </nav>

      <ProductDetailClient product={product} />

      {related.length > 0 && (
        <section className="mt-20 pt-12 border-t border-[#e5e5e5]">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#111111]">More Clothing</h2>
            <Link href="/#shop" className="text-sm text-[#555555] hover:text-[#111111]">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-8">
            {related.map((item) => (
              <Link key={item.id} href={`/products/${item.slug}`} className="group block">
                <div className="aspect-[3/4] bg-[#f5f5f3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="pt-3 flex items-start justify-between gap-2">
                  <p className="text-sm text-[#111111] group-hover:underline leading-snug">
                    {item.name}
                  </p>
                  <p className="text-sm font-medium tabular-nums text-[#111111] shrink-0">
                    {formatINR(item.price_paise)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
