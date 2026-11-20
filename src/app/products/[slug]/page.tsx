import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#7a7067] mb-8">
        <Link href="/" className="hover:text-[#171412]">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {product.categories && (
          <>
            <Link
              href={`/?category=${product.categories.slug}#collection`}
              className="hover:text-[#171412]"
            >
              {product.categories.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-[#171412] font-medium truncate">{product.name}</span>
      </nav>

      <ProductDetailClient product={product} />

      {/* Related Tibetan Garments */}
      {related.length > 0 && (
        <section className="mt-20 pt-14 border-t border-[#e8e3dc]">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9e2a2b]">
                Complete the Ensemble
              </p>
              <h2 className="font-serif text-3xl font-medium text-[#171412] mt-1">
                Pair with Traditional Pieces
              </h2>
            </div>
            <Link
              href="/#collection"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-[#171412] hover:text-[#9e2a2b]"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className="group bg-white rounded-2xl border border-[#ece7df] overflow-hidden hover:border-[#d5ccc0] transition-all"
              >
                <div className="aspect-[3/4] bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="p-4 border-t border-[#f3efe9]">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#7a7067]">
                    {item.categories?.name}
                  </p>
                  <p className="font-serif text-lg text-[#171412] group-hover:text-[#9e2a2b] mt-0.5 line-clamp-1">
                    {item.name}
                  </p>
                  <p className="font-mono text-sm font-semibold text-[#171412] mt-1.5">
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
